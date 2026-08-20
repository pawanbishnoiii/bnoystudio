-- 1) Security fix: remove the over-permissive source-code read policy
DROP POLICY IF EXISTS "Purchasers can download source code" ON storage.objects;

-- 2) Site settings: Google verification file, AI agent, auth mode
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS google_verify_file_name TEXT,
  ADD COLUMN IF NOT EXISTS google_verify_file_content TEXT,
  ADD COLUMN IF NOT EXISTS elevenlabs_agent_id TEXT,
  ADD COLUMN IF NOT EXISTS ai_section_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS google_auth_mode TEXT NOT NULL DEFAULT 'managed',
  ADD COLUMN IF NOT EXISTS google_client_id TEXT,
  ADD COLUMN IF NOT EXISTS google_redirect_uri TEXT;

-- 3) Versions system
CREATE TABLE IF NOT EXISTS public.project_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  released_at DATE NOT NULL DEFAULT current_date,
  notes TEXT,
  changelog TEXT,
  source_code_url TEXT,
  preview_url TEXT,
  thumbnail_url TEXT,
  is_latest BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, version)
);

GRANT SELECT ON public.project_versions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_versions TO authenticated;
GRANT ALL ON public.project_versions TO service_role;
ALTER TABLE public.project_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view versions of published projects" ON public.project_versions;
CREATE POLICY "Anyone can view versions of published projects"
ON public.project_versions FOR SELECT
USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.status = 'published')
       OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage versions" ON public.project_versions;
CREATE POLICY "Admins manage versions"
ON public.project_versions FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS project_versions_project_idx ON public.project_versions(project_id);

-- 4) Admin-only auth / SMTP configuration
CREATE TABLE IF NOT EXISTS public.auth_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  smtp_host TEXT,
  smtp_port INTEGER DEFAULT 587,
  smtp_user TEXT,
  smtp_secure BOOLEAN NOT NULL DEFAULT true,
  smtp_from_email TEXT,
  smtp_from_name TEXT,
  smtp_enabled BOOLEAN NOT NULL DEFAULT false,
  email_login_enabled BOOLEAN NOT NULL DEFAULT true,
  google_login_enabled BOOLEAN NOT NULL DEFAULT true,
  google_auth_mode TEXT NOT NULL DEFAULT 'managed',
  google_client_id TEXT,
  google_callback_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.auth_settings TO authenticated;
GRANT ALL ON public.auth_settings TO service_role;
ALTER TABLE public.auth_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage auth settings" ON public.auth_settings;
CREATE POLICY "Admins manage auth settings"
ON public.auth_settings FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.auth_settings (smtp_host) SELECT NULL WHERE NOT EXISTS (SELECT 1 FROM public.auth_settings);