-- Enable storage extension if not already enabled
CREATE EXTENSION IF NOT EXISTS storage;

-- Set up RLS policies for products bucket (public read, authenticated upload)
CREATE POLICY "Products are publicly readable" ON storage.objects FOR SELECT USING (bucket_id = 'products');

-- Set up RLS policies for receipts bucket (owners can upload, users can view own)
CREATE POLICY "Users can upload own receipts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'receipts' AND SPLIT_PART(name, '/', 1) = auth.uid()::text);

CREATE POLICY "Users can view own receipts" ON storage.objects FOR SELECT USING (bucket_id = 'receipts' AND SPLIT_PART(name, '/', 1) = auth.uid()::text);

-- Set up RLS policies for avatars bucket
CREATE POLICY "Avatars are publicly readable" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND 
  SPLIT_PART(name, '/', 1) = auth.uid()::text
);

-- Allow authenticated users to access receipts in their folder
CREATE POLICY "Users can access own receipts"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'receipts' AND SPLIT_PART(name, '/', 1) = auth.uid()::text);
