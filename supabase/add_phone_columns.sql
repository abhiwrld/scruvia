-- Add phone columns to profiles table if they don't exist
DO $$
DECLARE
    phone_number_exists BOOLEAN;
    phone_verified_exists BOOLEAN;
BEGIN
    -- Check if phone_number column exists
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'phone_number'
    ) INTO phone_number_exists;
    
    -- Add phone_number column if it doesn't exist
    IF NOT phone_number_exists THEN
        EXECUTE 'ALTER TABLE public.profiles ADD COLUMN phone_number TEXT DEFAULT NULL';
        RAISE NOTICE 'Column phone_number added to profiles table';
    ELSE
        RAISE NOTICE 'Column phone_number already exists, no action needed';
    END IF;

    -- Check if phone_verified column exists
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'phone_verified'
    ) INTO phone_verified_exists;
    
    -- Add phone_verified column if it doesn't exist
    IF NOT phone_verified_exists THEN
        EXECUTE 'ALTER TABLE public.profiles ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE';
        RAISE NOTICE 'Column phone_verified added to profiles table';
    ELSE
        RAISE NOTICE 'Column phone_verified already exists, no action needed';
    END IF;
END
$$; 