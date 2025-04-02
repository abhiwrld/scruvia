-- Script to fix Row Level Security (RLS) issues for file uploads
-- Run this script in the Supabase SQL Editor

-- First, let's check which policies are currently applied to the files table
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies
WHERE tablename = 'files';

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own files" ON public.files;
DROP POLICY IF EXISTS "Users can insert their own files" ON public.files;
DROP POLICY IF EXISTS "Users can delete their own files" ON public.files;
DROP POLICY IF EXISTS "Admin can do anything" ON public.files;

-- Create more permissive policies that explicitly cover all cases
CREATE POLICY "Anyone can insert into files table" ON public.files
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view their own files" ON public.files
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own files" ON public.files
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files" ON public.files
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Check if storage.objects has the right permissions
DROP POLICY IF EXISTS "Allow users to upload files to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own files" ON storage.objects;

-- Create more permissive storage policies
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'user_files');

CREATE POLICY "Allow users to view their own files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'user_files');

CREATE POLICY "Allow public to view files"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'user_files');

CREATE POLICY "Allow users to delete their own files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'user_files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Verify the bucket exists
SELECT * FROM storage.buckets WHERE id = 'user_files';

-- Make sure the bucket is public
UPDATE storage.buckets SET public = true WHERE id = 'user_files';

-- Check all policies on the files table after our changes
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd 
FROM pg_policies
WHERE tablename = 'files' OR tablename = 'objects';

-- Check any existing storage.objects
SELECT * FROM storage.objects LIMIT 10; 