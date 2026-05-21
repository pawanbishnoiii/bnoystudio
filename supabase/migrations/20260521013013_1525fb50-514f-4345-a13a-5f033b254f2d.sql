ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS banner_url text,
  ADD COLUMN IF NOT EXISTS hero_lottie_url text,
  ADD COLUMN IF NOT EXISTS hero_bg_url text,
  ADD COLUMN IF NOT EXISTS hero_badge text,
  ADD COLUMN IF NOT EXISTS hide_watermarks boolean NOT NULL DEFAULT false;

-- Fix linter: set search_path on functions that don't have it (defensive re-create)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;