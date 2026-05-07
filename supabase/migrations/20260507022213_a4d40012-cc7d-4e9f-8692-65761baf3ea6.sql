
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS demo_admin_email text,
  ADD COLUMN IF NOT EXISTS demo_admin_password text;

CREATE UNIQUE INDEX IF NOT EXISTS projects_slug_unique ON public.projects (slug) WHERE slug IS NOT NULL;

-- Backfill slugs for existing rows
UPDATE public.projects
SET slug = lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) || '-' || substr(id::text, 1, 6)
WHERE slug IS NULL;
