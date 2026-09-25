-- ============================================================
-- 20240114: Advanced hero CTA fields + About layout JSON schema
-- ============================================================

-- Ensure keys exist (value shape may be array or { version, blocks })
INSERT INTO public.site_settings (key, value) VALUES
  ('hero_banners', '[]'::jsonb),
  ('about_blocks', '{"version":2,"blocks":[]}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Normalize about_blocks to object schema if it's still a bare array
UPDATE public.site_settings
SET value = jsonb_build_object('version', 2, 'blocks', value)
WHERE key = 'about_blocks'
  AND jsonb_typeof(value) = 'array';

-- site_assets bucket (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('site_assets', 'site_assets', true, 5242880, ARRAY['image/png','image/jpeg','image/webp'])
ON CONFLICT (id) DO NOTHING;

GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
