-- SQL to make a user a pro manually in Supabase

-- Step 1: Update the user's profile to 'pro'
UPDATE profiles
SET plan = 'pro'
WHERE id = '<USER_ID>';

-- Step 2: Create or update a subscription entry
INSERT INTO subscriptions (user_id, plan, status)
VALUES ('<USER_ID>', 'pro', 'active')
ON CONFLICT (user_id) DO UPDATE
SET plan = 'pro', status = 'active',
    current_period_start = now(),
    current_period_end = now() + INTERVAL '1 year';

-- Replace <USER_ID> with the actual UUID of the user
-- Run this in your Supabase SQL Editor
