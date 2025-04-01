# Scruvia AI - Tax and Finance Assistant

Scruvia AI is an intelligent assistant for taxation and financial analytics based on Indian tax laws.

## Features

- Chat with AI about tax laws and regulations
- Save and manage conversation history
- Web search integration to provide real-time information
- Authentication and user management with Supabase
- Different subscription plans (Free, Plus, Pro, Team)

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Authentication & Database)
- Perplexity API

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- Perplexity API key

### Environment Setup

1. Clone the repository
2. Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_PERPLEXITY_API_KEY=your_perplexity_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Go to the SQL Editor in your Supabase dashboard
3. Execute the SQL in `supabase/schema.sql` to set up the database schema
4. Enable Email authentication in Authentication > Providers
5. Copy your Supabase URL and anon key to the `.env.local` file

### Installation

```bash
npm install
npm run dev
```

The application will be available at http://localhost:3000.

## Database Schema

### Profiles Table
Extends the auth.users table with additional user information:
- id (UUID, references auth.users)
- name (TEXT)
- avatar_url (TEXT)
- plan (TEXT, default 'free')
- questionsUsed (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Chats Table
Stores chat history:
- id (UUID)
- title (TEXT)
- user_id (UUID, references auth.users)
- messages (JSONB)
- model (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Subscriptions Table
Tracks user subscription information:
- id (UUID)
- user_id (UUID, references auth.users)
- plan (TEXT)
- status (TEXT)
- current_period_start (TIMESTAMP)
- current_period_end (TIMESTAMP)
- cancel_at (TIMESTAMP)
- canceled_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- payment_provider (TEXT)
- payment_id (TEXT)

### Usage Logs Table
Tracks API usage:
- id (UUID)
- user_id (UUID, references auth.users)
- action (TEXT)
- model (TEXT)
- tokens_used (INTEGER)
- created_at (TIMESTAMP)

## User Management

### Making Users Pro Members

To manually upgrade a user to a Pro membership:

1. Find the user's UUID by email using the SQL script in `supabase/find_user_by_email.sql`:
   - Open the Supabase SQL Editor
   - Load and edit the script to replace 'user@example.com' with the user's actual email
   - Run the script to retrieve the user's UUID and current status

2. Upgrade the user to Pro status using the SQL script in `supabase/make_user_pro.sql`:
   - Open the Supabase SQL Editor
   - Load and edit the script to replace 'YOUR-USER-ID-HERE' with the user's UUID
   - Run the script to:
     - Update the user's plan to 'pro' in the profiles table
     - Create or update a corresponding entry in the subscriptions table
     - Verify the changes were applied correctly

3. The user will have pro features on their next login or page refresh.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
