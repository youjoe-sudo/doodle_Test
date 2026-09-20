-- Ensure all required storage buckets exist with correct configuration
-- Run this in Supabase SQL Editor to fix "NoSuchBucket" errors

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('receipts', 'receipts', false, 5242880, ARRAY['image/jpeg','image/png','image/webp','application/pdf']),
  ('products', 'products', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg','image/png','image/webp']),
  ('categories', 'categories', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================
-- STORAGE RLS POLICIES (idempotent with IF NOT EXISTS pattern)
-- ============================================================

-- Products: public read
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Products bucket: public read') THEN
    CREATE POLICY "Products bucket: public read"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'products');
  END IF;
END $$;

-- Products: admin write
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Products bucket: admin write') THEN
    CREATE POLICY "Products bucket: admin write"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'products'
        AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Products bucket: admin update') THEN
    CREATE POLICY "Products bucket: admin update"
      ON storage.objects FOR UPDATE
      USING (
        bucket_id = 'products'
        AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Products bucket: admin delete') THEN
    CREATE POLICY "Products bucket: admin delete"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'products'
        AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      );
  END IF;
END $$;

-- Categories: public read
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Categories bucket: public read') THEN
    CREATE POLICY "Categories bucket: public read"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'categories');
  END IF;
END $$;

-- Categories: admin write
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Categories bucket: admin write') THEN
    CREATE POLICY "Categories bucket: admin write"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'categories'
        AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Categories bucket: admin update') THEN
    CREATE POLICY "Categories bucket: admin update"
      ON storage.objects FOR UPDATE
      USING (
        bucket_id = 'categories'
        AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Categories bucket: admin delete') THEN
    CREATE POLICY "Categories bucket: admin delete"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'categories'
        AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      );
  END IF;
END $$;

-- Receipts: user can upload to own folder
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Receipts bucket: user upload') THEN
    CREATE POLICY "Receipts bucket: user upload"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'receipts'
        AND auth.role() = 'authenticated'
        AND (storage.foldername())[1] = auth.uid()::text
      );
  END IF;
END $$;

-- Receipts: user can read own receipts
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Receipts bucket: user read own') THEN
    CREATE POLICY "Receipts bucket: user read own"
      ON storage.objects FOR SELECT
      USING (
        bucket_id = 'receipts'
        AND (storage.foldername())[1] = auth.uid()::text
      );
  END IF;
END $$;

-- Receipts: admin can read all
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Receipts bucket: admin read all') THEN
    CREATE POLICY "Receipts bucket: admin read all"
      ON storage.objects FOR SELECT
      USING (
        bucket_id = 'receipts'
        AND auth.role() = 'service_role'
      );
  END IF;
END $$;

-- Avatars: public read
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Avatars bucket: public read') THEN
    CREATE POLICY "Avatars bucket: public read"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'avatars');
  END IF;
END $$;

-- Avatars: user can upload own avatar
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Avatars bucket: user upload own') THEN
    CREATE POLICY "Avatars bucket: user upload own"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
        AND (storage.foldername())[1] = auth.uid()::text
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Avatars bucket: user update own') THEN
    CREATE POLICY "Avatars bucket: user update own"
      ON storage.objects FOR UPDATE
      USING (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
        AND (storage.foldername())[1] = auth.uid()::text
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Avatars bucket: user delete own') THEN
    CREATE POLICY "Avatars bucket: user delete own"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
        AND (storage.foldername())[1] = auth.uid()::text
      );
  END IF;
END $$;
