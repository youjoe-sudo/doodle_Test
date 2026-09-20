-- ============================================================
-- Migration: Add cover_image to products + categories bucket
-- Safe to run multiple times (IF NOT EXISTS / ON CONFLICT)
-- ============================================================

-- Add cover_image column to products (if not already present)
DO $$ BEGIN
  ALTER TABLE public.products ADD COLUMN cover_image TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add categories storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('categories', 'categories', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Categories storage RLS policies (safe to re-run with IF NOT EXISTS logic)
DO $$ BEGIN
  CREATE POLICY "Categories bucket: public read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'categories');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Categories bucket: admin write"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'categories'
      AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Categories bucket: admin update"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'categories'
      AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Categories bucket: admin delete"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'categories'
      AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enable Supabase Realtime on support_messages (for live chat)
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
