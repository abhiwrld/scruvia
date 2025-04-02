-- Complete schema for Scruvia app
-- This script checks for existing objects before creating them

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free',
  questions_used INTEGER DEFAULT 0,  -- Using snake_case for consistency
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  model TEXT DEFAULT 'sonar',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  current_period_end TIMESTAMP WITH TIME ZONE DEFAULT now() + INTERVAL '1 month',
  cancel_at TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  payment_provider TEXT,
  payment_id TEXT
);

CREATE TABLE IF NOT EXISTS public.usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  model TEXT,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create files table to track uploaded files
CREATE TABLE IF NOT EXISTS files (
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

-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('user_files', 'user_files', true)
ON CONFLICT (id) DO NOTHING;

-- Fix any column naming issues in the profiles table
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'questionsUsed'
    ) INTO column_exists;
    
    IF column_exists THEN
        -- Rename camelCase column to snake_case
        EXECUTE 'ALTER TABLE public.profiles RENAME COLUMN "questionsUsed" TO questions_used';
        RAISE NOTICE 'Column renamed from questionsUsed to questions_used';
    ELSE
        -- Add the correct column if it doesn't exist
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles' 
            AND column_name = 'questions_used'
        ) INTO column_exists;
        
        IF NOT column_exists THEN
            EXECUTE 'ALTER TABLE public.profiles ADD COLUMN questions_used INTEGER DEFAULT 0';
            RAISE NOTICE 'Column questions_used added to profiles table';
        ELSE
            RAISE NOTICE 'Column questions_used already exists, no action needed';
        END IF;
    END IF;
END
$$;

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can view their own profile'
    ) THEN
        CREATE POLICY "Users can view their own profile" ON public.profiles
        FOR SELECT USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can update their own profile'
    ) THEN
        CREATE POLICY "Users can update their own profile" ON public.profiles
        FOR UPDATE USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can create their own profile'
    ) THEN
        CREATE POLICY "Users can create their own profile" ON public.profiles
        FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Admin can do anything'
    ) THEN
        CREATE POLICY "Admin can do anything" ON public.profiles
        USING (true)
        WITH CHECK (true);
    END IF;
END
$$;

-- Create policies for chats table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'chats' 
        AND policyname = 'Users can view their own chats'
    ) THEN
        CREATE POLICY "Users can view their own chats" ON public.chats
        FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'chats' 
        AND policyname = 'Users can create chats'
    ) THEN
        CREATE POLICY "Users can create chats" ON public.chats
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'chats' 
        AND policyname = 'Users can update their own chats'
    ) THEN
        CREATE POLICY "Users can update their own chats" ON public.chats
        FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'chats' 
        AND policyname = 'Users can delete their own chats'
    ) THEN
        CREATE POLICY "Users can delete their own chats" ON public.chats
        FOR DELETE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'chats' 
        AND policyname = 'Admin can do anything'
    ) THEN
        CREATE POLICY "Admin can do anything" ON public.chats
        USING (true)
        WITH CHECK (true);
    END IF;
END
$$;

-- Create policies for subscriptions table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subscriptions' 
        AND policyname = 'Users can view their own subscriptions'
    ) THEN
        CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
        FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subscriptions' 
        AND policyname = 'Users can create their own subscriptions'
    ) THEN
        CREATE POLICY "Users can create their own subscriptions" ON public.subscriptions
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subscriptions' 
        AND policyname = 'Admin can do anything'
    ) THEN
        CREATE POLICY "Admin can do anything" ON public.subscriptions
        USING (true)
        WITH CHECK (true);
    END IF;
END
$$;

-- Create policies for usage_logs table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'usage_logs' 
        AND policyname = 'Users can view their own usage logs'
    ) THEN
        CREATE POLICY "Users can view their own usage logs" ON public.usage_logs
        FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'usage_logs' 
        AND policyname = 'Users can create their own usage logs'
    ) THEN
        CREATE POLICY "Users can create their own usage logs" ON public.usage_logs
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'usage_logs' 
        AND policyname = 'Admin can do anything'
    ) THEN
        CREATE POLICY "Admin can do anything" ON public.usage_logs
        USING (true)
        WITH CHECK (true);
    END IF;
END
$$;

-- Create policies for files table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'files' 
        AND policyname = 'Users can view their own files'
    ) THEN
        CREATE POLICY "Users can view their own files" ON files FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'files' 
        AND policyname = 'Users can insert their own files'
    ) THEN
        CREATE POLICY "Users can insert their own files" ON files FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'files' 
        AND policyname = 'Users can delete their own files'
    ) THEN
        CREATE POLICY "Users can delete their own files" ON files FOR DELETE USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Storage security policies
-- Allow authenticated users to upload files to their own folder
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'storage.objects' 
        AND policyname = 'Allow users to upload files to their own folder'
    ) THEN
        CREATE POLICY "Allow users to upload files to their own folder"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (
          -- Must be authenticated
          auth.role() = 'authenticated' 
          -- Path must start with user's ID
          AND (storage.foldername(name))[1] = auth.uid()::text
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'storage.objects' 
        AND policyname = 'Allow users to view their own files'
    ) THEN
        CREATE POLICY "Allow users to view their own files"
        ON storage.objects FOR SELECT
        TO authenticated
        USING (
          -- Must be authenticated
          auth.role() = 'authenticated' 
          -- Path must start with user's ID
          AND (storage.foldername(name))[1] = auth.uid()::text
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'storage.objects' 
        AND policyname = 'Allow public to view files'
    ) THEN
        CREATE POLICY "Allow public to view files"
        ON storage.objects FOR SELECT
        TO anon
        USING (
          -- Allow any public access to the user_files bucket
          bucket_id = 'user_files'
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'storage.objects' 
        AND policyname = 'Allow users to delete their own files'
    ) THEN
        CREATE POLICY "Allow users to delete their own files"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (
          -- Must be authenticated
          auth.role() = 'authenticated' 
          -- Path must start with user's ID
          AND (storage.foldername(name))[1] = auth.uid()::text
        );
    END IF;
END
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_chats_updated_at ON public.chats;
CREATE TRIGGER update_chats_updated_at
BEFORE UPDATE ON public.chats
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- User creation trigger to create a profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url, plan, questions_used, created_at, updated_at)
  VALUES (
    NEW.id, 
    COALESCE(NEW.email, ''),
    '',
    'free',
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON public.chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON public.chats(updated_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON public.usage_logs(created_at);