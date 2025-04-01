-- SQL script to find a user's UUID by their email address
-- Replace 'user@example.com' with the actual email of the user you want to find

-- Query to find user ID by email in auth.users table
SELECT 
  id,
  email,
  created_at
FROM auth.users
WHERE email = 'user@example.com';

-- Query to check if this user has a profile
SELECT 
  id,
  name,
  plan,
  questions_used,
  created_at,
  updated_at
FROM public.profiles
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);

-- Query to check if this user has an active subscription
SELECT 
  id,
  user_id,
  plan,
  status,
  current_period_end,
  created_at
FROM public.subscriptions
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
); 