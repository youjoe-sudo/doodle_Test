-- ============================================================
-- USER ARTWORKS PERSISTENCE
-- Run after 20240109_freemium_coloring.sql
-- ============================================================

-- 1. user_artworks table
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
CREATE INDEX IF NOT EXISTS idx_user_artworks_page ON public.user_artworks(page_id);

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE public.user_artworks ENABLE ROW LEVEL SECURITY;

-- Users can read their own artworks
CREATE POLICY "user_artworks_select_own" ON public.user_artworks
  FOR SELECT USING (auth.uid() = user_id);

-- Admin can read all
CREATE POLICY "user_artworks_select_admin" ON public.user_artworks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- Users can insert their own artworks
CREATE POLICY "user_artworks_insert_own" ON public.user_artworks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own artworks
CREATE POLICY "user_artworks_update_own" ON public.user_artworks
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own artworks
CREATE POLICY "user_artworks_delete_own" ON public.user_artworks
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- Grants
-- ============================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_artworks TO authenticated;

-- ============================================================
-- Storage bucket for user artwork previews
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user_artworks',
  'user_artworks',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg'];

-- Storage policies (using SPLIT_PART instead of storage.foldername)
CREATE POLICY "user_artworks_storage_select_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user_artworks'
    AND SPLIT_PART(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "user_artworks_storage_insert_auth" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user_artworks'
    AND auth.role() = 'authenticated'
    AND SPLIT_PART(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY "user_artworks_storage_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user_artworks'
    AND SPLIT_PART(name, '/', 1) = auth.uid()::text
  );
