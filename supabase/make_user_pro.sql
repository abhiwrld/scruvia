-- SQL script to make a user a pro member
-- Replace 'YOUR-USER-ID-HERE' with the actual UUID of the user you want to make a pro member

-- Update the plan in the profiles table
UPDATE public.profiles
SET 
  plan = 'pro',
  updated_at = now()
WHERE id = 'YOUR-USER-ID-HERE';

-- Use the alternative approach that doesn't rely on unique constraints
DO $$
DECLARE
  subscription_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.subscriptions WHERE user_id = 'YOUR-USER-ID-HERE'
  ) INTO subscription_exists;
  
  IF subscription_exists THEN
    -- Update existing subscription
    UPDATE public.subscriptions
    SET 
      plan = 'pro',
      status = 'active',
      current_period_end = now() + INTERVAL '1 year',
      updated_at = now()
    WHERE user_id = 'YOUR-USER-ID-HERE';
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
      'YOUR-USER-ID-HERE', 
      'pro', 
      'active', 
      now(), 
      now() + INTERVAL '1 year',
      now(),
      now()
    );
  END IF;
END
$$;

-- Verify the changes
SELECT id, plan, questions_used FROM public.profiles WHERE id = 'YOUR-USER-ID-HERE';
SELECT user_id, plan, status, current_period_end FROM public.subscriptions WHERE user_id = 'YOUR-USER-ID-HERE';

-- Note: If the ON CONFLICT clause doesn't work (depends on constraint setup),
-- you may need to manually check if the user has a subscription first:
/*
DO $$
DECLARE
  subscription_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.subscriptions WHERE user_id = 'YOUR-USER-ID-HERE'
  ) INTO subscription_exists;
  
  IF subscription_exists THEN
    -- Update existing subscription
    UPDATE public.subscriptions
    SET 
      plan = 'pro',
      status = 'active',
      current_period_end = now() + INTERVAL '1 year',
      updated_at = now()
    WHERE user_id = 'YOUR-USER-ID-HERE';
  ELSE
    -- Create new subscription
    INSERT INTO public.subscriptions (
      user_id, plan, status, current_period_start, current_period_end
    )
    VALUES (
      'YOUR-USER-ID-HERE', 'pro', 'active', now(), now() + INTERVAL '1 year'
    );
  END IF;
END
$$;
*/ 