ALTER TABLE public.site_settings 
  ADD COLUMN IF NOT EXISTS hero_video_url text,
  ADD COLUMN IF NOT EXISTS brand_name text DEFAULT 'Bnoy Studios',
  ADD COLUMN IF NOT EXISTS brand_tagline text DEFAULT 'Premium web & mobile projects, ready to ship.';