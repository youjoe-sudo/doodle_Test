-- ============================================================
-- DOODLE ROOM — Complete Supabase Schema
-- Execute this single file in Supabase SQL Editor
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. ENUM TYPES
-- ============================================================
DO $$ BEGIN
-- (role_enum replaced by TEXT for flexible moderation roles)
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM (
    'PENDING_PAYMENT_VERIFICATION',
    'PAYMENT_REJECTED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.support_status AS ENUM ('OPEN', 'PENDING', 'RESOLVED', 'CLOSED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.support_priority AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 2. SITE SETTINGS  (dynamic store config)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key           TEXT UNIQUE NOT NULL,
  value         JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read site settings (public store config)
CREATE POLICY "Public can read site_settings"
  ON public.site_settings FOR SELECT USING (true);

-- Only admins can modify site settings
CREATE POLICY "Admins can manage site_settings"
  ON public.site_settings FOR ALL
  USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- Insert default store configuration so the app never crashes on first fetch
INSERT INTO public.site_settings (key, value) VALUES
  ('store', '{
    "brand_name": "Doodle Room",
    "tagline": "Small Books Big Dreams",
    "description": "A cozy little corner for books, gifts & lovely little things",
    "logo_url": "/logo.svg",
    "primary_color": "#bd745d",
    "hero_title": "Small Books Big Dreams",
    "hero_subtitle": "A cozy little corner for books, gifts & lovely little things",
    "hero_image_url": null,
    "contact_email": "info@doodleroom.com",
    "contact_phone": "+20 2 1234 5678",
    "contact_address": "شارع المثال، القاهرة، مصر",
    "vodafone_cash_number": "",
    "instapay_id": "",
    "bank_transfer_info": "",
    "working_hours": "الأحد - الخميس: 9 ص - 6 م",
    "facebook_url": "",
    "instagram_url": "",
    "tiktok_url": ""
  }'::JSONB)
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 3. PROFILES  (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email         TEXT NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,
  role          TEXT DEFAULT 'customer',
  phone_number  TEXT,
  gender        TEXT,
  city          TEXT,
  address       TEXT,
  is_banned     BOOLEAN DEFAULT false,
  ban_reason    TEXT,
  banned_until  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone_number, gender)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.raw_user_meta_data ->> 'phone_number',
    NEW.raw_user_meta_data ->> 'gender'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 4. CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name_en       TEXT NOT NULL,
  name_ar       TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  description   TEXT,
  image_url     TEXT,
  is_active     BOOLEAN DEFAULT true,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read categories"
  ON public.categories FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- ============================================================
-- 5. PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name_en           TEXT NOT NULL,
  name_ar           TEXT NOT NULL,
  slug              TEXT UNIQUE NOT NULL,
  description_en    TEXT,
  description_ar    TEXT,
  original_price    INTEGER NOT NULL,
  sale_price        INTEGER,
  stock             INTEGER DEFAULT 0,
  cover_image       TEXT,
  is_published      BOOLEAN DEFAULT true,
  is_featured       BOOLEAN DEFAULT false,
  is_digital        BOOLEAN DEFAULT false,
  digital_file_url  TEXT,
  category_id       UUID REFERENCES public.categories ON DELETE SET NULL,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published products"
  ON public.products FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- ============================================================
-- 6. PRODUCT IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_images (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id    UUID REFERENCES public.products ON DELETE CASCADE,
  path          TEXT NOT NULL,
  alt_text      TEXT,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read product images"
  ON public.product_images FOR SELECT USING (true);

CREATE POLICY "Admins can manage product images"
  ON public.product_images FOR ALL
  USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- ============================================================
-- 7. PAYMENT METHODS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name_en             TEXT NOT NULL,
  name_ar             TEXT NOT NULL,
  description_en      TEXT,
  description_ar      TEXT,
  account_identifier  TEXT,
  is_active           BOOLEAN DEFAULT true,
  sort_order          INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Admin can manage payment methods (including account_identifier)
CREATE POLICY "Admins can manage payment methods"
  ON public.payment_methods FOR ALL
  USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- Public view that excludes sensitive account_identifier
CREATE OR REPLACE VIEW public.payment_methods_public AS
  SELECT id, name_en, name_ar, description_en, description_ar, is_active, sort_order, created_at, updated_at
  FROM public.payment_methods
  WHERE is_active = true;

-- ============================================================
-- 8. SHIPPING METHODS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.shipping_methods (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name_en       TEXT NOT NULL,
  name_ar       TEXT NOT NULL,
  description   TEXT,
  base_price    INTEGER DEFAULT 0,
  is_active     BOOLEAN DEFAULT true,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read shipping methods"
  ON public.shipping_methods FOR SELECT USING (is_active = true);

-- ============================================================
-- 9. ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES public.profiles ON DELETE CASCADE,
  status          public.order_status DEFAULT 'PENDING_PAYMENT_VERIFICATION',
  payment_status  public.payment_status DEFAULT 'PENDING',
  subtotal        INTEGER DEFAULT 0,
  shipping_cost   INTEGER DEFAULT 0,
  discount        INTEGER DEFAULT 0,
  total           INTEGER DEFAULT 0,
  full_name       TEXT,
  phone           TEXT,
  email           TEXT,
  city            TEXT,
  address_line1   TEXT,
  payment_method  TEXT,
  shipping_method TEXT,
  receipt_url     TEXT,
  rejection_reason TEXT,
  reviewed_by     UUID,
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own orders"
  ON public.orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage orders"
  ON public.orders FOR ALL
  USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- ============================================================
-- 10. ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id        UUID REFERENCES public.orders ON DELETE CASCADE,
  product_id      UUID REFERENCES public.products ON DELETE SET NULL,
  product_name    TEXT NOT NULL,
  unit_price      INTEGER NOT NULL,
  original_price  INTEGER NOT NULL,
  quantity        INTEGER NOT NULL,
  subtotal        INTEGER NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own order items"
  ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage order items"
  ON public.order_items FOR ALL
  USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- ============================================================
-- 11. PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id            UUID REFERENCES public.orders ON DELETE CASCADE,
  payment_method_id   UUID REFERENCES public.payment_methods ON DELETE SET NULL,
  amount              INTEGER NOT NULL,
  status              public.payment_status DEFAULT 'PENDING',
  receipt_url         TEXT,
  rejection_reason    TEXT,
  reviewed_by         UUID,
  reviewed_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM public.orders WHERE id = order_id));

CREATE POLICY "Admins can manage payments"
  ON public.payments FOR ALL
  USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- ============================================================
-- 12. WISHLIST
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       UUID REFERENCES public.profiles ON DELETE CASCADE,
  product_id    UUID REFERENCES public.products ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wishlist"
  ON public.wishlist_items FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 13. COUPONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.coupons (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code              TEXT UNIQUE NOT NULL,
  discount_percent  INTEGER DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  discount_amount   INTEGER DEFAULT 0 CHECK (discount_amount >= 0),
  min_order_amount  INTEGER DEFAULT 0,
  max_uses          INTEGER,
  times_used        INTEGER DEFAULT 0,
  is_active         BOOLEAN DEFAULT true,
  expires_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can validate coupons"
  ON public.coupons FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage coupons"
  ON public.coupons FOR ALL
  USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- ============================================================
-- 14. SUPPORT TICKETS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       UUID REFERENCES public.profiles ON DELETE CASCADE,
  subject       TEXT NOT NULL,
  description   TEXT,
  status        public.support_status DEFAULT 'OPEN',
  priority      public.support_priority DEFAULT 'NORMAL',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tickets"
  ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets"
  ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage tickets"
  ON public.support_tickets FOR ALL
  USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- ============================================================
-- 15. SUPPORT MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.support_messages (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id   UUID REFERENCES public.support_tickets ON DELETE CASCADE,
  sender_id   UUID,
  body        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own ticket messages"
  ON public.support_messages FOR SELECT
  USING (auth.uid() = sender_id OR EXISTS (
    SELECT 1 FROM public.support_tickets WHERE id = ticket_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can send messages on own tickets"
  ON public.support_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND EXISTS (
    SELECT 1 FROM public.support_tickets WHERE id = ticket_id AND user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all messages"
  ON public.support_messages FOR ALL
  USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- ============================================================
-- 16. STORAGE BUCKETS
-- ============================================================

-- Products bucket (public read, admin write)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('products', 'products', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Categories bucket (public read, admin write)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('categories', 'categories', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Receipts bucket (private per user)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('receipts', 'receipts', false, 5242880, ARRAY['image/jpeg','image/png','image/webp','application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Avatars bucket (public read, user write)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Coloring files bucket (public read, admin write)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('coloring_files', 'coloring_files', true, 10485760, ARRAY['image/png','image/jpeg','image/jpg','application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 17. STORAGE RLS POLICIES
-- ============================================================

-- Products: public read
CREATE POLICY "Products bucket: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

-- Products: admin insert/update/delete
CREATE POLICY "Products bucket: admin write"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'products'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

CREATE POLICY "Products bucket: admin update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'products'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

CREATE POLICY "Products bucket: admin delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'products'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- Categories: public read
CREATE POLICY "Categories bucket: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'categories');

-- Categories: admin insert/update/delete
CREATE POLICY "Categories bucket: admin write"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'categories'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

CREATE POLICY "Categories bucket: admin update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'categories'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

CREATE POLICY "Categories bucket: admin delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'categories'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- Receipts: user can upload to own folder
CREATE POLICY "Receipts bucket: user upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'receipts'
    AND auth.role() = 'authenticated'
    AND SPLIT_PART(name, '/', 1) = auth.uid()::text
  );

-- Receipts: user can read own receipts
CREATE POLICY "Receipts bucket: user read own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'receipts'
    AND SPLIT_PART(name, '/', 1) = auth.uid()::text
  );

-- Receipts: admin can read all
CREATE POLICY "Receipts bucket: admin read all"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'receipts'
    AND auth.role() = 'service_role'
  );

-- Avatars: public read
CREATE POLICY "Avatars bucket: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Avatars: user can upload own avatar
CREATE POLICY "Avatars bucket: user upload own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND SPLIT_PART(name, '/', 1) = auth.uid()::text
  );

-- Coloring files: public read
CREATE POLICY "Coloring files: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'coloring_files');

-- Coloring files: authenticated upload
CREATE POLICY "Coloring files: authenticated upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'coloring_files'
    AND auth.role() = 'authenticated'
  );

-- Coloring files: admin delete
CREATE POLICY "Coloring files: admin delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'coloring_files'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- ============================================================
-- 18. DEFAULT SEED DATA
-- ============================================================

-- Default payment methods
INSERT INTO public.payment_methods (name_en, name_ar, description_en, description_ar, is_active, sort_order)
VALUES
  ('Vodafone Cash', 'فودافون كاش', 'Pay via Vodafone Cash', 'الدفع عبر فودافون كاش', true, 1),
  ('InstaPay', 'إنستا باي', 'Pay via InstaPay', 'الدفع عبر إنستا باي', true, 2),
  ('Bank Transfer', 'تحويل بنكي', 'Pay via bank transfer', 'الدفع عبر تحويل بنكي', true, 3)
ON CONFLICT DO NOTHING;

-- Default shipping methods
INSERT INTO public.shipping_methods (name_en, name_ar, description, base_price, is_active, sort_order)
VALUES
  ('Standard Delivery', 'التوصيل القياسي', 'Standard shipping within Egypt', 50, true, 1),
  ('Express Delivery', 'التوصيل السريع', 'Express shipping within Egypt', 100, true, 2)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 19. FREEMIUM COLORING LIBRARY
-- ============================================================

CREATE TABLE IF NOT EXISTS public.coloring_pages (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title       TEXT NOT NULL,
  file_url    TEXT NOT NULL,
  price       DECIMAL(10,2) DEFAULT 20.00,
  is_free_tier BOOLEAN DEFAULT false,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_unlocked_pages (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  page_id     UUID NOT NULL REFERENCES public.coloring_pages(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, page_id)
);

CREATE INDEX IF NOT EXISTS idx_coloring_pages_free ON public.coloring_pages(is_free_tier);
CREATE INDEX IF NOT EXISTS idx_user_unlocked_user ON public.user_unlocked_pages(user_id);

ALTER TABLE public.coloring_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_unlocked_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coloring_pages_select" ON public.coloring_pages FOR SELECT USING (true);
CREATE POLICY "coloring_pages_insert" ON public.coloring_pages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'));
CREATE POLICY "coloring_pages_update" ON public.coloring_pages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'));
CREATE POLICY "coloring_pages_delete" ON public.coloring_pages FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'));

CREATE POLICY "user_unlocked_select_own" ON public.user_unlocked_pages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_unlocked_select_admin" ON public.user_unlocked_pages
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'));
CREATE POLICY "user_unlocked_insert_admin" ON public.user_unlocked_pages
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'));
CREATE POLICY "user_unlocked_delete_admin" ON public.user_unlocked_pages
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'));

-- ============================================================
-- 20. GRANTS (minimum privilege model)
-- ============================================================

-- Authenticated users: only INSERT/UPDATE on tables they legitimately write to
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlist_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_addresses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_tickets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- Sequences for authenticated inserts
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Anon (unauthenticated) users: only read public tables
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.coupons TO anon;
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT ON public.product_images TO anon;
GRANT SELECT ON public.payment_methods_public TO anon;
GRANT SELECT ON public.shipping_methods TO anon;

-- Coloring library
GRANT SELECT ON public.coloring_pages TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.coloring_pages TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.user_unlocked_pages TO authenticated;

-- ============================================================
-- 21. USER ARTWORKS PERSISTENCE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_artworks (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  page_id     UUID NOT NULL REFERENCES public.coloring_pages(id) ON DELETE CASCADE,
  canvas_data JSONB,
  preview_url TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, page_id)
);

CREATE INDEX IF NOT EXISTS idx_user_artworks_user ON public.user_artworks(user_id);

ALTER TABLE public.user_artworks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_artworks_select_own" ON public.user_artworks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_artworks_select_admin" ON public.user_artworks
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'));
CREATE POLICY "user_artworks_insert_own" ON public.user_artworks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_artworks_update_own" ON public.user_artworks
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_artworks_delete_own" ON public.user_artworks
  FOR DELETE USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_artworks TO authenticated;

-- User artworks storage bucket (public for preview display, RLS protects data)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('user_artworks', 'user_artworks', true, 5242880, ARRAY['image/png','image/jpeg'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "User artworks: user read own" ON storage.objects
  FOR SELECT USING (bucket_id = 'user_artworks' AND SPLIT_PART(name, '/', 1) = auth.uid()::text);
CREATE POLICY "User artworks: user upload own" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'user_artworks' AND auth.role() = 'authenticated' AND SPLIT_PART(name, '/', 1) = auth.uid()::text);
CREATE POLICY "User artworks: user delete own" ON storage.objects
  FOR DELETE USING (bucket_id = 'user_artworks' AND SPLIT_PART(name, '/', 1) = auth.uid()::text);

-- ============================================================
-- DONE
-- ============================================================
