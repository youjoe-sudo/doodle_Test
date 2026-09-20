-- ============================================================
-- FREEMIUM COLORING LIBRARY
-- Run after all previous migrations
-- ============================================================

-- 1. coloring_pages table
CREATE TABLE IF NOT EXISTS public.coloring_pages (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title       TEXT NOT NULL,
  file_url    TEXT NOT NULL,
  price       DECIMAL(10,2) DEFAULT 20.00,
  is_free_tier BOOLEAN DEFAULT false,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. user_unlocked_pages table
CREATE TABLE IF NOT EXISTS public.user_unlocked_pages (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  page_id     UUID NOT NULL REFERENCES public.coloring_pages(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, page_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_coloring_pages_free ON public.coloring_pages(is_free_tier);
CREATE INDEX IF NOT EXISTS idx_user_unlocked_user ON public.user_unlocked_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_unlocked_page ON public.user_unlocked_pages(page_id);

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE public.coloring_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_unlocked_pages ENABLE ROW LEVEL SECURITY;

-- coloring_pages: anyone can read
CREATE POLICY "coloring_pages_select" ON public.coloring_pages
  FOR SELECT USING (true);

-- coloring_pages: only admin can insert/update/delete
CREATE POLICY "coloring_pages_insert" ON public.coloring_pages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

CREATE POLICY "coloring_pages_update" ON public.coloring_pages
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

CREATE POLICY "coloring_pages_delete" ON public.coloring_pages
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- user_unlocked_pages: users can read their own
CREATE POLICY "user_unlocked_select_own" ON public.user_unlocked_pages
  FOR SELECT USING (auth.uid() = user_id);

-- user_unlocked_pages: admin can read all
CREATE POLICY "user_unlocked_select_admin" ON public.user_unlocked_pages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- user_unlocked_pages: only admin can insert (grant unlocks)
CREATE POLICY "user_unlocked_insert_admin" ON public.user_unlocked_pages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- user_unlocked_pages: only admin can delete (revoke unlocks)
CREATE POLICY "user_unlocked_delete_admin" ON public.user_unlocked_pages
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- ============================================================
-- Grants
-- ============================================================
GRANT SELECT ON public.coloring_pages TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.coloring_pages TO authenticated;

GRANT SELECT, INSERT, DELETE ON public.user_unlocked_pages TO authenticated;

-- ============================================================
-- Add whatsapp_number to site_settings default store value
-- (update existing if present)
-- ============================================================
UPDATE public.site_settings
SET value = value || '{"whatsapp_number": ""}'::jsonb
WHERE key = 'store' AND NOT (value ? 'whatsapp_number');

-- ============================================================
-- Storage bucket for coloring files
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'coloring_files',
  'coloring_files',
  true,
  10485760,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];

-- Storage policies for coloring_files bucket
-- Anyone can read (public bucket)
CREATE POLICY "coloring_files_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'coloring_files');

-- Only authenticated users can upload
CREATE POLICY "coloring_files_insert_auth" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'coloring_files' AND auth.role() = 'authenticated');

-- Only admin can delete
CREATE POLICY "coloring_files_delete_admin" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'coloring_files'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin')
  );
