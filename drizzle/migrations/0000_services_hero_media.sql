ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS hero_media_url TEXT,
  ADD COLUMN IF NOT EXISTS hero_media_type TEXT NOT NULL DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS hero_eyebrow TEXT,
  ADD COLUMN IF NOT EXISTS hero_headline TEXT,
  ADD COLUMN IF NOT EXISTS hero_subheadline TEXT,
  ADD COLUMN IF NOT EXISTS hero_stat_label TEXT,
  ADD COLUMN IF NOT EXISTS hero_status TEXT;