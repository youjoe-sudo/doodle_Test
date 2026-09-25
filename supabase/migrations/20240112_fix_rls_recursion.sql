-- ============================================================
-- 20240112 — FIX RLS INFINITE RECURSION (500 on all REST calls)
-- Profiles policy → reviews → profiles caused recursion.
-- Run in Supabase SQL Editor.
-- ============================================================

-- 1. SECURITY DEFINER helper: check superadmin without re-entering profiles RLS
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'superadmin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_superadmin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_superadmin() TO anon, authenticated, service_role;

-- 2. Ensure reviews table exists (idempotent)
CREATE TABLE IF NOT EXISTS public.reviews (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES public.products(id) ON DELETE CASCADE,
  order_id    UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title       TEXT,
  comment     TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON public.reviews(is_approved, created_at DESC);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 3. Break profiles ↔ reviews cycle: reviews admin uses is_superadmin()
DROP POLICY IF EXISTS "Admins can manage reviews" ON public.reviews;
CREATE POLICY "Admins can manage reviews"
  ON public.reviews FOR ALL
  USING (auth.role() = 'service_role' OR public.is_superadmin())
  WITH CHECK (auth.role() = 'service_role' OR public.is_superadmin());

-- 4. Fix profiles self-recursive admin policies
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_superadmin());

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.is_superadmin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. Safe public reviewer display on profiles (reviews no longer subqueries profiles via RLS)
DROP POLICY IF EXISTS "Public can read reviewer display profiles" ON public.profiles;
CREATE POLICY "Public can read reviewer display profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reviews r
      WHERE r.user_id = profiles.id
        AND r.is_approved = true
    )
  );

-- 6. Other reviews policies (idempotent)
DROP POLICY IF EXISTS "Public can read approved reviews" ON public.reviews;
CREATE POLICY "Public can read approved reviews"
  ON public.reviews FOR SELECT
  USING (is_approved = true);

DROP POLICY IF EXISTS "Users can read own reviews" ON public.reviews;
CREATE POLICY "Users can read own reviews"
  ON public.reviews FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own pending reviews" ON public.reviews;
CREATE POLICY "Users can insert own pending reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_approved = false);

DROP POLICY IF EXISTS "Users can update own pending reviews" ON public.reviews;
CREATE POLICY "Users can update own pending reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id AND is_approved = false)
  WITH CHECK (auth.uid() = user_id AND is_approved = false);

DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;
CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Replace remaining profiles-subquery admin policies on hot-path tables
-- (products, product_images, notifications) so REST reads do not recurse
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (auth.role() = 'service_role' OR public.is_superadmin())
  WITH CHECK (auth.role() = 'service_role' OR public.is_superadmin());

DROP POLICY IF EXISTS "Admins can manage product images" ON public.product_images;
CREATE POLICY "Admins can manage product images"
  ON public.product_images FOR ALL
  USING (auth.role() = 'service_role' OR public.is_superadmin())
  WITH CHECK (auth.role() = 'service_role' OR public.is_superadmin());

DROP POLICY IF EXISTS "Admins can manage notifications" ON public.notifications;
CREATE POLICY "Admins can manage notifications"
  ON public.notifications FOR ALL
  USING (auth.role() = 'service_role' OR public.is_superadmin())
  WITH CHECK (auth.role() = 'service_role' OR public.is_superadmin());

-- Public product read (explicit, non-admin)
DROP POLICY IF EXISTS "Public can read published products" ON public.products;
CREATE POLICY "Public can read published products"
  ON public.products FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "Public can read product images" ON public.product_images;
CREATE POLICY "Public can read product images"
  ON public.product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id
        AND p.is_published = true
    )
  );

-- 8. Grants
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.product_images TO anon;
GRANT SELECT ON public.notifications TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
