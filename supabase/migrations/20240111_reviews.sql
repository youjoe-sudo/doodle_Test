-- ============================================================
-- PRODUCT / SITE REVIEWS
-- Fixes 404 on /rest/v1/reviews (table did not exist)
-- ============================================================

-- SECURITY DEFINER helper (also created in 20240112 — idempotent)
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

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

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
  WITH CHECK (
    auth.uid() = user_id
    AND is_approved = false
  );

DROP POLICY IF EXISTS "Users can update own pending reviews" ON public.reviews;
CREATE POLICY "Users can update own pending reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id AND is_approved = false)
  WITH CHECK (auth.uid() = user_id AND is_approved = false);

DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;
CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage reviews" ON public.reviews;
CREATE POLICY "Admins can manage reviews"
  ON public.reviews FOR ALL
  USING (auth.role() = 'service_role' OR public.is_superadmin())
  WITH CHECK (auth.role() = 'service_role' OR public.is_superadmin());

-- ============================================================
-- Grants
-- ============================================================
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;

-- ============================================================
-- Public reviewer display (homepage embed: user:profiles)
-- Anon may only see display columns of reviewers with approved reviews.
-- ============================================================
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

-- Column-level restriction for anon (hide email/phone/address/etc.)
REVOKE ALL ON public.profiles FROM anon;
GRANT SELECT (id, full_name, avatar_url) ON public.profiles TO anon;
