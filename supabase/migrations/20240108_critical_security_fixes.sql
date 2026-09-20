-- ============================================================
-- 20240108 — CRITICAL SECURITY FIXES (Audit Batch 1)
-- Run this in Supabase SQL Editor to apply all security patches
-- ============================================================

-- ============================================================
-- SEC-1: Fix profiles UPDATE policy to prevent privilege escalation
-- Users cannot change their own role via self-update
-- ============================================================
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- ============================================================
-- SEC-2: Unify all admin policies to role = 'superadmin'
-- Drop and recreate all admin ALL policies with consistent role check
-- ============================================================

-- site_settings
DROP POLICY IF EXISTS "Admins can manage site_settings" ON public.site_settings;
CREATE POLICY "Admins can manage site_settings"
  ON public.site_settings FOR ALL
  USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- categories
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- products
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- product_images
DROP POLICY IF EXISTS "Admins can manage product images" ON public.product_images;
CREATE POLICY "Admins can manage product images"
  ON public.product_images FOR ALL
  USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- orders
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
CREATE POLICY "Admins can manage orders"
  ON public.orders FOR ALL
  USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- order_items
DROP POLICY IF EXISTS "Admins can manage order items" ON public.order_items;
CREATE POLICY "Admins can manage order items"
  ON public.order_items FOR ALL
  USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- payments
DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;
CREATE POLICY "Admins can manage payments"
  ON public.payments FOR ALL
  USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- coupons
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Admins can manage coupons"
  ON public.coupons FOR ALL
  USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- support_tickets
DROP POLICY IF EXISTS "Admins can manage tickets" ON public.support_tickets;
CREATE POLICY "Admins can manage tickets"
  ON public.support_tickets FOR ALL
  USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- support_messages
DROP POLICY IF EXISTS "Admins can manage all messages" ON public.support_messages;
CREATE POLICY "Admins can manage all messages"
  ON public.support_messages FOR ALL
  USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- notifications
DROP POLICY IF EXISTS "Admins can manage notifications" ON public.notifications;
CREATE POLICY "Admins can manage notifications"
  ON public.notifications FOR ALL
  USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- ============================================================
-- SEC-3: Lock storage bucket write policies to admin-only
-- ============================================================

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Products bucket: admin write" ON storage.objects;
DROP POLICY IF EXISTS "Products bucket: admin update" ON storage.objects;
DROP POLICY IF EXISTS "Products bucket: admin delete" ON storage.objects;
DROP POLICY IF EXISTS "Categories bucket: admin write" ON storage.objects;
DROP POLICY IF EXISTS "Categories bucket: admin update" ON storage.objects;
DROP POLICY IF EXISTS "Categories bucket: admin delete" ON storage.objects;

-- Products bucket: admin-only write
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

-- Categories bucket: admin-only write
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

-- ============================================================
-- SEC-4: Restrict payment_methods.account_identifier from public
-- Create public view that excludes sensitive data
-- ============================================================

DROP POLICY IF EXISTS "Public can read payment methods" ON public.payment_methods;

-- Admin-only direct access to payment_methods (including account_identifier)
DROP POLICY IF EXISTS "Admins can manage payment methods" ON public.payment_methods;
CREATE POLICY "Admins can manage payment methods"
  ON public.payment_methods FOR ALL
  USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- Public view excluding account_identifier
DROP VIEW IF EXISTS public.payment_methods_public;
CREATE OR REPLACE VIEW public.payment_methods_public AS
  SELECT id, name_en, name_ar, description_en, description_ar, is_active, sort_order, created_at, updated_at
  FROM public.payment_methods
  WHERE is_active = true;

-- ============================================================
-- SEC-5: Fix notifications UPDATE policy — remove global broadcast mutation
-- ============================================================

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================
-- SEC-6: Downgrade GRANT ALL to minimum privilege model
-- ============================================================

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;

-- Authenticated: only write to tables they legitimately use
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

-- Anon: only read public tables
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.coupons TO anon;
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT ON public.product_images TO anon;
GRANT SELECT ON public.payment_methods_public TO anon;
GRANT SELECT ON public.shipping_methods TO anon;
