-- Add missing policies to fix RLS issues
-- Run this script in your Supabase SQL Editor

-- Add INSERT policy for profiles (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can create their own profile'
    ) THEN
        CREATE POLICY "Users can create their own profile" ON public.profiles
        FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END
$$;

-- Add INSERT policy for subscriptions (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subscriptions' 
        AND policyname = 'Users can create their own subscriptions'
    ) THEN
        CREATE POLICY "Users can create their own subscriptions" ON public.subscriptions
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- Add INSERT policy for usage_logs (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'usage_logs' 
        AND policyname = 'Users can create their own usage logs'
    ) THEN
        CREATE POLICY "Users can create their own usage logs" ON public.usage_logs
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- Create Admin policy to allow service role operations
DO $$
BEGIN
    -- Admin policy for profiles
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Admin can do anything'
    ) THEN
        CREATE POLICY "Admin can do anything" ON public.profiles
        USING (true)
        WITH CHECK (true);
    END IF;

    -- Admin policy for chats
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'chats' 
        AND policyname = 'Admin can do anything'
    ) THEN
        CREATE POLICY "Admin can do anything" ON public.chats
        USING (true)
        WITH CHECK (true);
    END IF;

    -- Admin policy for subscriptions
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subscriptions' 
        AND policyname = 'Admin can do anything'
    ) THEN
        CREATE POLICY "Admin can do anything" ON public.subscriptions
        USING (true)
        WITH CHECK (true);
    END IF;

    -- Admin policy for usage_logs
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

-- Check if trigger exists and recreate it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created'
    ) THEN
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
        INSERT INTO public.profiles (id, name)
        VALUES (NEW.id, COALESCE(NEW.email, ''));
        RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    END IF;
END
$$; 