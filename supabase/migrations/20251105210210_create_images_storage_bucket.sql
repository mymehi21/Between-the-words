/*
  # Create Storage Bucket for Images
  
  1. New Storage Bucket
    - `images` bucket for storing all uploaded images
    - Public access for reading
    - Authenticated users can upload
    
  2. Security
    - RLS policies for upload/delete
    - Public read access
*/

-- Create the images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Allow authenticated users to update their images
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images');

-- Allow public access to view images
CREATE POLICY "Public users can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');
