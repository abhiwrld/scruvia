# Supabase Setup Guide for Scruvia

This guide will help you set up the necessary database tables and permissions in your Supabase project.

## Prerequisites

1. A Supabase account
2. A Supabase project with the URL and API keys
3. Your environment variables set up in `.env.local` file with:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Initial Setup Instructions

### Method 1: Using the SQL Editor (Recommended)

1. Log in to your Supabase dashboard at [https://app.supabase.io](https://app.supabase.io)
2. Select your project
3. Go to the SQL Editor
4. Copy the SQL schema from `./supabase/schema.sql` in your project
5. Paste it into the SQL Editor and run it

### Method 2: Using the setup script (Advanced)

If you prefer to use the automated setup script, you'll need to create a function in your Supabase database first:

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Run the following SQL to create the `execute_sql` function:

```sql
CREATE OR REPLACE FUNCTION execute_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

4. Once that's done, run our setup script:

```bash
npm run setup-supabase
```

## Fixing Row Level Security (RLS) Issues

If you're seeing errors like:
- "new row violates row-level security policy for table profiles"
- Empty error objects `{}`
- "Error fetching user profile"

You need to add the following RLS policies to your database:

1. Go to the SQL Editor in your Supabase dashboard
2. Copy the SQL from `./supabase/add_policies.sql` in your project
3. Paste it into the SQL Editor and run it

This will add the necessary Row Level Security policies to allow:
- Users to create their own profiles
- Users to create their own subscriptions
- Users to log their usage

## Verifying the Setup

After running the setup, you should have the following tables in your Supabase project:

- `profiles`: Extends the auth.users table with additional profile information
- `chats`: Stores chat history for each user
- `subscriptions`: Tracks user subscription plans
- `usage_logs`: Logs API usage and token consumption

You can verify these by going to the Table Editor in your Supabase dashboard.

## Troubleshooting

### 1. RLS Policy Issues

If you see "new row violates row-level security policy" errors, it means your Row Level Security policies are preventing data operations. Run the `add_policies.sql` script to fix this.

### 2. Empty Error Objects (`{}`)

Empty error objects usually indicate a permissions issue. This happens when the client doesn't have proper permissions to read the error details. Run the `add_policies.sql` script to fix this.

### 3. Missing Profile After Signup

If a user profile isn't created automatically after signup, the trigger might not be working. You can:

- Check if the trigger exists by running `SELECT * FROM pg_trigger;` in SQL Editor
- Recreate the trigger using the `add_policies.sql` script
- Manually create a profile for the user in the Supabase dashboard

### 4. Authentication Issues

If you're having trouble with authentication:

- Verify your Supabase URL and anon key in `.env.local`
- Check that Email Auth is enabled in your Supabase Authentication settings
- Make sure there are no duplicate users with the same email

## Database Schema Overview

The schema includes:

- **profiles**: Extends auth.users with name, avatar, plan and usage data
- **chats**: Stores all chat messages, titles, and models
- **subscriptions**: Tracks user payment plans and renewal dates
- **usage_logs**: Monitors API usage for quota management

Each table includes appropriate Row Level Security (RLS) policies to ensure users can only access their own data. 