-- ============================================================
-- 20240105 — Notifications, Addresses, Order tracking columns
-- ============================================================

-- ============================================================
-- 1. NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID REFERENCES public.profiles ON DELETE CASCADE,  -- NULL = global broadcast
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        TEXT DEFAULT 'info',  -- info | promotion | order | system
  link        TEXT,                 -- optional CTA URL
  image_url   TEXT,                 -- optional image
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own + global (user_id IS NULL) notifications
CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Users can update own (mark as read) — cannot modify global broadcasts
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Admins can manage all notifications
CREATE POLICY "Admins can manage notifications"
  ON public.notifications FOR ALL
  USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================================
-- 2. USER ADDRESSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  label         TEXT DEFAULT 'المنزل',  -- home, work, etc.
  governorate   TEXT NOT NULL,
  city          TEXT NOT NULL,
  address_line  TEXT NOT NULL,
  is_default    BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own addresses"
  ON public.user_addresses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
  ON public.user_addresses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON public.user_addresses FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON public.user_addresses FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 3. Add tracking_number + carrier to orders
-- ============================================================
DO $$ BEGIN
  ALTER TABLE public.orders ADD COLUMN tracking_number TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.orders ADD COLUMN carrier TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
