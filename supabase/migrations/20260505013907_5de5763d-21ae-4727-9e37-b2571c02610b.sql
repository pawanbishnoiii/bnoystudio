ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS lov_email text,
  ADD COLUMN IF NOT EXISTS project_url text;