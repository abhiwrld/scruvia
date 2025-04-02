-- Simplified RLS fix that completely disables RLS temporarily for troubleshooting
-- CAUTION: Only use this in development, not in production!

-- First, check current RLS status
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'files';

-- Disable RLS on files table
ALTER TABLE public.files DISABLE ROW LEVEL SECURITY;

-- Check RLS policies on storage.objects
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd 
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Create a completely open policy for storage bucket
DROP POLICY IF EXISTS "Anyone can access user_files" ON storage.objects;

CREATE POLICY "Anyone can access user_files"
ON storage.objects 
USING (bucket_id = 'user_files');

-- Verify bucket exists and is public
SELECT id, name, public, owner FROM storage.buckets WHERE id = 'user_files';
UPDATE storage.buckets SET public = true WHERE id = 'user_files';

-- Verify the changes
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'files';

-- Output storage policies
SELECT policyname, permissive, cmd FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage'; 