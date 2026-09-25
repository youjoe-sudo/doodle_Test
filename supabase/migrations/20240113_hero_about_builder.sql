-- ============================================================
-- 20240113: Hero banner management + About page builder
-- ============================================================

-- Public site assets bucket (hero banners, about images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('site_assets', 'site_assets', true, 5242880, ARRAY['image/png','image/jpeg','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Admin upload/delete on site_assets (public read for everyone)
DROP POLICY IF EXISTS "site_assets_public_read" ON storage.objects;
CREATE POLICY "site_assets_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'site_assets');

DROP POLICY IF EXISTS "site_assets_admin_insert" ON storage.objects;
CREATE POLICY "site_assets_admin_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'site_assets'
    AND (
      auth.role() = 'service_role'
      OR public.is_superadmin()
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('superadmin', 'admin')
      )
    )
  );

DROP POLICY IF EXISTS "site_assets_admin_delete" ON storage.objects;
CREATE POLICY "site_assets_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'site_assets'
    AND (
      auth.role() = 'service_role'
      OR public.is_superadmin()
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('superadmin', 'admin')
      )
    )
  );

-- site_settings: ensure admin manage policy uses is_superadmin (no recursion)
DROP POLICY IF EXISTS "Admins can manage site_settings" ON public.site_settings;
CREATE POLICY "Admins can manage site_settings"
  ON public.site_settings FOR ALL
  USING (
    auth.role() = 'service_role'
    OR public.is_superadmin()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('superadmin', 'admin')
    )
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR public.is_superadmin()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('superadmin', 'admin')
    )
  );

-- Seed hero_banners + about_blocks keys if missing
INSERT INTO public.site_settings (key, value) VALUES
  ('hero_banners', '[]'::jsonb),
  ('about_blocks', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;

GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
