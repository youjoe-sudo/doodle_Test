-- ============================================================
-- 20240115 — Pre-production RLS audit
-- Idempotent: safe to run multiple times in Supabase SQL Editor.
-- ============================================================

-- 1) Public (anon + authenticated) MUST be able to read site_settings.
--    The storefront homepage (hero banners, about blocks, announcement bar,
--    shipping fees) reads this table without a session.
DROP POLICY IF EXISTS "Public can read site_settings" ON public.site_settings;
CREATE POLICY "Public can read site_settings"
  ON public.site_settings FOR SELECT
  USING (true);

-- 2) Admin manage policy must use the SECURITY DEFINER helper
--    (never a self-referencing profiles subquery on profiles policies)
--    to avoid infinite recursion / 500 errors.
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

-- 3) Grants (RLS alone is not enough — table grants are also required)
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;

-- 4) Ensure the SECURITY DEFINER helper exists (from 20240111/20240112)
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'superadmin'
  );
$$;

-- 5) Profiles policies: keep them recursion-free.
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'service_role' OR public.is_superadmin() OR auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (auth.role() = 'service_role' OR public.is_superadmin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 6) Public storefront reads (idempotent re-assert)
DROP POLICY IF EXISTS "Users can view active products" ON public.products;
DROP POLICY IF EXISTS "Public can read published products" ON public.products;
CREATE POLICY "Public can read published products" ON public.products
  FOR SELECT USING (is_published = true OR public.is_superadmin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Public can read approved reviews" ON public.reviews;
CREATE POLICY "Public can read approved reviews"
  ON public.reviews FOR SELECT
  USING (is_approved = true);
