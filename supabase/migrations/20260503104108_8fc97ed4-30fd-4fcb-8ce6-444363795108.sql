
-- 1. Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Auto-assign default 'user' role on signup, and seed admin@devmarket.in as admin
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
    ON CONFLICT DO NOTHING;
  IF NEW.email = 'admin@devmarket.in' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
      ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Backfill: any existing user gets a default role; admin email gets admin
INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'user' FROM auth.users
  ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'admin' FROM auth.users WHERE email = 'admin@devmarket.in'
  ON CONFLICT DO NOTHING;

-- 3. Replace email-based RLS on projects + purchases with role-based
DROP POLICY IF EXISTS "Admin full access projects" ON public.projects;
CREATE POLICY "Admins manage projects"
  ON public.projects FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin can view all purchases" ON public.purchases;
CREATE POLICY "Admins view all purchases"
  ON public.purchases FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Storage policy: only buyers (or admin) can read source-code files
-- Path convention: source-code/{project_id}/...
DROP POLICY IF EXISTS "Buyers can read source code" ON storage.objects;
CREATE POLICY "Buyers can read source code"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'source-code' AND (
      public.has_role(auth.uid(), 'admin')
      OR EXISTS (
        SELECT 1 FROM public.purchases p
        WHERE p.user_id = auth.uid()
          AND p.project_id::text = (storage.foldername(name))[1]
      )
      OR EXISTS (
        SELECT 1 FROM public.projects pr
        WHERE pr.id::text = (storage.foldername(name))[1]
          AND pr.price = 0
          AND pr.status = 'published'
      )
    )
  );

DROP POLICY IF EXISTS "Admins manage source code" ON storage.objects;
CREATE POLICY "Admins manage source code"
  ON storage.objects FOR ALL
  USING (bucket_id = 'source-code' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'source-code' AND public.has_role(auth.uid(), 'admin'));
