-- Fix column name issue in profiles table

-- Check if the problematic column exists with camelCase
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

-- Update the trigger function to use the correct column name
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
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure admin can bypass RLS
DO $$
BEGIN
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