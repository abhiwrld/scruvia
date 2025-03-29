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
- Razorpay (Payment Gateway)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- Perplexity API key
- Razorpay account (for payment processing)

### Environment Setup

1. Clone the repository
2. Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_PERPLEXITY_API_KEY=your_perplexity_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Go to the SQL Editor in your Supabase dashboard
3. Execute the SQL in `supabase/schema.sql` to set up the database schema
4. Execute the SQL in `supabase/payments_schema.sql` to set up the payment-related tables
5. Enable Email authentication in Authentication > Providers
6. Copy your Supabase URL and anon key to the `.env.local` file

### Razorpay Setup

1. Create a Razorpay account at https://razorpay.com
2. Go to the Dashboard > Settings > API Keys to get your Key ID and Key Secret
3. Add these credentials to the `.env.local` file
4. Test Mode is enabled by default on Razorpay Test Dashboard
5. In production, update the Webhook settings in the Razorpay Dashboard to receive payment notifications

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

### Payments Table
Tracks completed payments:
- id (SERIAL)
- user_id (UUID, references auth.users)
- payment_id (TEXT)
- order_id (TEXT)
- amount (BIGINT)
- currency (TEXT)
- plan (TEXT)
- status (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Payment Orders Table
Tracks payment orders:
- id (SERIAL)
- order_id (TEXT)
- user_id (UUID, references auth.users)
- amount (BIGINT)
- currency (TEXT)
- plan (TEXT)
- status (TEXT)
- payment_id (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
