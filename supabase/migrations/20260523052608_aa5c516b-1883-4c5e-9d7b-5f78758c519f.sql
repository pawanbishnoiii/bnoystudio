
ALTER TABLE public.site_settings ALTER COLUMN hide_watermarks SET DEFAULT false;
UPDATE public.site_settings SET hide_watermarks = false WHERE hide_watermarks IS NULL;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS external_url_enabled boolean NOT NULL DEFAULT false;
