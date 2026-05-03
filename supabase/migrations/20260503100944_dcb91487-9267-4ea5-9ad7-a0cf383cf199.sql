
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  short_desc TEXT NOT NULL DEFAULT '',
  full_desc TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL DEFAULT 0,
  category TEXT[] NOT NULL DEFAULT '{}',
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  thumbnail_url TEXT,
  screenshots TEXT[] NOT NULL DEFAULT '{}',
  video_url TEXT,
  preview_url TEXT,
  source_code_url TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published projects" ON public.projects FOR SELECT USING (status = 'published');
CREATE POLICY "Admin full access projects" ON public.projects FOR ALL USING (
  auth.uid() IN (SELECT id FROM auth.users WHERE email = 'admin@devmarket.in')
);

-- Create purchases table
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL DEFAULT 0,
  razorpay_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases" ON public.purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own purchases" ON public.purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can view all purchases" ON public.purchases FOR SELECT USING (
  auth.uid() IN (SELECT id FROM auth.users WHERE email = 'admin@devmarket.in')
);

-- Create wishlists table
CREATE TABLE public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, project_id)
);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wishlist" ON public.wishlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own wishlist" ON public.wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own wishlist" ON public.wishlists FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket for project assets
INSERT INTO storage.buckets (id, name, public) VALUES ('project-assets', 'project-assets', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('source-code', 'source-code', false);

-- Storage policies
CREATE POLICY "Public read project assets" ON storage.objects FOR SELECT USING (bucket_id = 'project-assets');
CREATE POLICY "Admin upload project assets" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'project-assets' AND auth.uid() IN (SELECT id FROM auth.users WHERE email = 'admin@devmarket.in')
);
CREATE POLICY "Admin upload source code" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'source-code' AND auth.uid() IN (SELECT id FROM auth.users WHERE email = 'admin@devmarket.in')
);
CREATE POLICY "Purchasers can download source code" ON storage.objects FOR SELECT USING (
  bucket_id = 'source-code' AND auth.uid() IS NOT NULL
);
