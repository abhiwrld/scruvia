-- SQL script to check and manage plans in the Scruvia platform
-- This script verifies that all 4 plans (free, plus, pro, team) are correctly set up

-- 1. Check plans currently in use in the profiles table
SELECT 
  plan, 
  COUNT(*) as user_count
FROM public.profiles
GROUP BY plan
ORDER BY 
  CASE 
    WHEN plan = 'free' THEN 1
    WHEN plan = 'plus' THEN 2
    WHEN plan = 'pro' THEN 3
    WHEN plan = 'team' THEN 4
    ELSE 5
  END;

-- 2. Check plans currently in use in the subscriptions table
SELECT 
  plan, 
  COUNT(*) as subscription_count
FROM public.subscriptions
WHERE status = 'active'
GROUP BY plan
ORDER BY 
  CASE 
    WHEN plan = 'free' THEN 1
    WHEN plan = 'plus' THEN 2
    WHEN plan = 'pro' THEN 3
    WHEN plan = 'team' THEN 4
    ELSE 5
  END;

-- 3. Find users with inconsistent plan values between profiles and subscriptions
SELECT 
  p.id as user_id,
  p.name,
  p.email,
  p.plan as profile_plan,
  s.plan as subscription_plan
FROM 
  public.profiles p
LEFT JOIN 
  public.subscriptions s ON p.id = s.user_id AND s.status = 'active'
WHERE 
  p.plan != COALESCE(s.plan, 'free')
ORDER BY p.created_at DESC;

-- 4. Set a user to a specific plan (replace email with the target user's email)
-- This will update both the profile and subscription tables
DO $$
DECLARE
  target_user_id UUID;
  target_plan TEXT := 'pro'; -- Change to desired plan: 'free', 'plus', 'pro' or 'team'
  target_email TEXT := 'user@example.com'; -- Change to the user's email
  subscription_exists BOOLEAN;
BEGIN
  -- Get the user ID
  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', target_email;
  END IF;
  
  -- Update the plan in the profile
  UPDATE public.profiles
  SET 
    plan = target_plan,
    updated_at = now()
  WHERE id = target_user_id;
  
  -- Check if there's an existing subscription
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions WHERE user_id = target_user_id
  ) INTO subscription_exists;
  
  IF subscription_exists THEN
    -- Update existing subscription
    UPDATE public.subscriptions
    SET 
      plan = target_plan,
      status = 'active',
      current_period_end = now() + INTERVAL '1 year',
      updated_at = now()
    WHERE user_id = target_user_id;
  ELSE
    -- Create new subscription
    INSERT INTO public.subscriptions (
      user_id, 
      plan, 
      status, 
      current_period_start, 
      current_period_end,
      created_at,
      updated_at
    )
    VALUES (
      target_user_id, 
      target_plan, 
      'active', 
      now(), 
      now() + INTERVAL '1 year',
      now(),
      now()
    );
  END IF;
  
  RAISE NOTICE 'User % successfully set to % plan', target_email, target_plan;
END
$$;

-- 5. Find a specific user's plan information (replace email with target user's email)
SELECT 
  u.id as user_id,
  u.email,
  p.name,
  p.plan as profile_plan,
  p.questions_used,
  s.plan as subscription_plan,
  s.status as subscription_status,
  s.current_period_end as subscription_end
FROM 
  auth.users u
LEFT JOIN 
  public.profiles p ON u.id = p.id
LEFT JOIN 
  public.subscriptions s ON u.id = s.user_id AND s.status = 'active'
WHERE 
  u.email = 'user@example.com'; -- Change to the user's email 