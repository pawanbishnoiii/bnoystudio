
-- Apps table
CREATE TABLE IF NOT EXISTS public.apps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text DEFAULT '',
  version text DEFAULT '1.0.0',
  platform text DEFAULT 'android',
  price integer DEFAULT 0,
  icon_url text,
  screenshots_urls text[] DEFAULT '{}',
  apk_url text,
  file_size text,
  changelog text DEFAULT '',
  download_count integer DEFAULT 0,
  is_latest boolean DEFAULT true,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published apps" ON public.apps;
CREATE POLICY "Public read published apps" ON public.apps FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Admins manage apps" ON public.apps;
CREATE POLICY "Admins manage apps" ON public.apps FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- purchases status column
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS status text DEFAULT 'success';

-- projects screenshots_urls
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS screenshots_urls text[] DEFAULT '{}';

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('project-images', 'project-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('app-files', 'app-files', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('app-assets', 'app-assets', true) ON CONFLICT DO NOTHING;

-- Storage policies for project-images (public read, admin write)
DROP POLICY IF EXISTS "Public read project images" ON storage.objects;
CREATE POLICY "Public read project images" ON storage.objects FOR SELECT USING (bucket_id = 'project-images');

DROP POLICY IF EXISTS "Admin upload project images" ON storage.objects;
CREATE POLICY "Admin upload project images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-images' AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admin update project images" ON storage.objects;
CREATE POLICY "Admin update project images" ON storage.objects FOR UPDATE USING (bucket_id = 'project-images' AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admin delete project images" ON storage.objects;
CREATE POLICY "Admin delete project images" ON storage.objects FOR DELETE USING (bucket_id = 'project-images' AND has_role(auth.uid(), 'admin'::app_role));

-- app-assets (public read, admin write)
DROP POLICY IF EXISTS "Public read app assets" ON storage.objects;
CREATE POLICY "Public read app assets" ON storage.objects FOR SELECT USING (bucket_id = 'app-assets');

DROP POLICY IF EXISTS "Admin upload app assets" ON storage.objects;
CREATE POLICY "Admin upload app assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'app-assets' AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admin update app assets" ON storage.objects;
CREATE POLICY "Admin update app assets" ON storage.objects FOR UPDATE USING (bucket_id = 'app-assets' AND has_role(auth.uid(), 'admin'::app_role));

-- app-files (private, admin upload, signed-url-only download via service role)
DROP POLICY IF EXISTS "Admin upload app files" ON storage.objects;
CREATE POLICY "Admin upload app files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'app-files' AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admin manage app files" ON storage.objects;
CREATE POLICY "Admin manage app files" ON storage.objects FOR ALL USING (bucket_id = 'app-files' AND has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (bucket_id = 'app-files' AND has_role(auth.uid(), 'admin'::app_role));
