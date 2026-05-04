-- Add changelog, views, likes to projects
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS changelog jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS likes_count integer DEFAULT 0;

-- Categories table for admin management
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  icon text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.categories (name, slug, icon) VALUES
  ('Web Apps','web-apps','globe'),
  ('Mobile Apps','mobile-apps','smartphone'),
  ('Dashboards','dashboards','layout-dashboard'),
  ('E-commerce','ecommerce','shopping-bag'),
  ('SaaS','saas','briefcase'),
  ('Landing Pages','landing-pages','rocket'),
  ('AI / ML','ai-ml','sparkles'),
  ('Templates','templates','palette')
ON CONFLICT (slug) DO NOTHING;

-- Project likes
CREATE TABLE IF NOT EXISTS public.project_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);
ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read likes" ON public.project_likes;
CREATE POLICY "Public read likes" ON public.project_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users like" ON public.project_likes;
CREATE POLICY "Users like" ON public.project_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users unlike" ON public.project_likes;
CREATE POLICY "Users unlike" ON public.project_likes FOR DELETE USING (auth.uid() = user_id);

-- Comments
CREATE TABLE IF NOT EXISTS public.project_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  rating integer CHECK (rating BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read comments" ON public.project_comments;
CREATE POLICY "Public read comments" ON public.project_comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users comment" ON public.project_comments;
CREATE POLICY "Users comment" ON public.project_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users delete own comments" ON public.project_comments;
CREATE POLICY "Users delete own comments" ON public.project_comments FOR DELETE USING (auth.uid() = user_id OR has_role(auth.uid(),'admin'::app_role));

-- Increment view RPC (anyone can call)
CREATE OR REPLACE FUNCTION public.increment_project_views(_project_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.projects SET views_count = COALESCE(views_count,0) + 1 WHERE id = _project_id;
$$;

-- Like count triggers
CREATE OR REPLACE FUNCTION public.sync_project_likes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.projects SET likes_count = COALESCE(likes_count,0) + 1 WHERE id = NEW.project_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.projects SET likes_count = GREATEST(COALESCE(likes_count,0) - 1, 0) WHERE id = OLD.project_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_project_likes_count ON public.project_likes;
CREATE TRIGGER trg_project_likes_count
AFTER INSERT OR DELETE ON public.project_likes
FOR EACH ROW EXECUTE FUNCTION public.sync_project_likes();