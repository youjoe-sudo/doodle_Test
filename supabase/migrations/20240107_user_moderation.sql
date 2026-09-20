-- ============================================================
-- USER MODERATION & ROLE MANAGEMENT
-- ============================================================

-- Change role from enum to TEXT for flexible role management
ALTER TABLE public.profiles
  ALTER COLUMN role TYPE TEXT USING role::text,
  ALTER COLUMN role SET DEFAULT 'customer';

-- Drop the old enum if no longer needed
DROP TYPE IF EXISTS public.role_enum;

-- Add moderation columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_banned    BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS ban_reason   TEXT,
  ADD COLUMN IF NOT EXISTS banned_until TIMESTAMPTZ;

-- Admin can read all profiles
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can update all profiles
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Prevent users from changing their own role via self-update
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- Admin can delete profiles (for permanent account deletion)
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to auto-expire bans
CREATE OR REPLACE FUNCTION public.check_and_clear_expired_bans()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET is_banned = false, ban_reason = NULL, banned_until = NULL
  WHERE is_banned = true
    AND banned_until IS NOT NULL
    AND banned_until <= now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
