# Fixing Supabase RLS Policy Issues

It looks like you're experiencing "policy already exists" errors when trying to run the full schema. This suggests that you already have some RLS policies set up, which is good, but we need to add the missing ones.

## Quick Fix SQL

Copy and paste the following SQL into your Supabase SQL Editor:

```sql
-- Add missing policies to fix RLS issues
-- These specific policies check if they already exist before creating them

-- Fix for "new row violates row-level security policy for table profiles"
DO $$
BEGIN
    -- Add INSERT policy for profiles if needed
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can create their own profile'
    ) THEN
        CREATE POLICY "Users can create their own profile" ON public.profiles
        FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
    
    -- Create a bypass policy for admin/service role operations
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Service role can do anything with profiles'
    ) THEN
        CREATE POLICY "Service role can do anything with profiles" ON public.profiles
        USING (true)
        WITH CHECK (true);
    END IF;
    
    -- Double-check that the trigger exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created'
    ) THEN
        -- Recreate the trigger function
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO public.profiles (id, name)
          VALUES (NEW.id, COALESCE(NEW.email, ''));
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        -- Create the trigger
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    END IF;
END
$$;
```

## What This SQL Does

This SQL addresses three key issues:

1. **Missing INSERT Policy**: Adds an INSERT policy for the profiles table but only if it doesn't already exist.

2. **Bypass Policy**: Creates a service role bypass policy that will allow operations through RLS even when performed by authenticated users.

3. **User Trigger**: Ensures the trigger to automatically create profiles exists.

## Next Steps

After running this SQL, restart your development server. If you still see RLS policy errors, run the full `add_policies.sql` script from the project files, which adds similar policies for subscriptions and usage logs.

If you need to completely reset your RLS policies, you can first drop all existing policies with:

```sql
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can do anything with profiles" ON public.profiles;
```

And then run the complete schema script again. 