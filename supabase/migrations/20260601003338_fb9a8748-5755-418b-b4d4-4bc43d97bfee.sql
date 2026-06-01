ALTER TABLE public.site_settings ALTER COLUMN hide_watermarks SET DEFAULT true;
UPDATE public.site_settings SET hide_watermarks = true WHERE hide_watermarks IS NULL;