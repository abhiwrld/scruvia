-- Setup Script for Supabase Storage Bucket
-- Run this script in the Supabase SQL Editor to ensure storage is properly configured

-- 1. Create the 'user_files' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('user_files', 'user_files', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Make sure storage is enabled for your project
UPDATE storage.buckets
SET public = true
WHERE name = 'user_files';

-- 3. Create or fix policies for storage objects
-- Delete any conflicting policies first
DROP POLICY IF EXISTS "Allow users to upload files to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own files" ON storage.objects;

-- Create policy for uploads
CREATE POLICY "Allow users to upload files to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user_files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy for user viewing their own files
CREATE POLICY "Allow users to view their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user_files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy for public viewing of files
CREATE POLICY "Allow public to view files"
ON storage.objects FOR SELECT
TO anon
USING (
  bucket_id = 'user_files'
);

-- Create policy for users to delete their own files
CREATE POLICY "Allow users to delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user_files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Verify the 'files' table exists and has the correct RLS policies
CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  public_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Set up RLS policies for the files table
DROP POLICY IF EXISTS "Users can view their own files" ON public.files;
DROP POLICY IF EXISTS "Users can insert their own files" ON public.files;
DROP POLICY IF EXISTS "Users can delete their own files" ON public.files;

CREATE POLICY "Users can view their own files" ON public.files 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own files" ON public.files 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files" ON public.files 
FOR DELETE USING (auth.uid() = user_id);

-- Output results for verification
SELECT id, name, public FROM storage.buckets WHERE id = 'user_files';
SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage'; 