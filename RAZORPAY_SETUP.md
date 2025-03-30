# Razorpay Integration Setup Guide

This guide provides instructions for setting up the Razorpay payment gateway in your Scruvia AI application, both for local development and for production deployment on Vercel.

## Prerequisites

1. A Razorpay account (create one at [razorpay.com](https://razorpay.com))
2. API keys from your Razorpay dashboard
3. A Vercel account for deployment

## Local Development Setup

1. Create a `.env.local` file in the root of your project (if it doesn't exist already)
2. Add the following environment variables to your `.env.local` file:

```
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Replace `your_razorpay_key_id` and `your_razorpay_key_secret` with your actual Razorpay API credentials.

3. Run the verify environment variables script to ensure everything is set up correctly:

```bash
npm run verify-env
```

## Vercel Deployment Setup

To set up Razorpay in your Vercel deployment:

1. Log in to your Vercel dashboard
2. Navigate to your project
3. Go to "Settings" > "Environment Variables"
4. Add the following environment variables:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Your Razorpay Key ID | Production, Preview, Development |
| `RAZORPAY_KEY_SECRET` | Your Razorpay Key Secret | Production, Preview, Development |

5. Click "Save" to apply the changes
6. Redeploy your application for the changes to take effect

## Database Setup

The Razorpay integration requires additional tables in your Supabase database. Run the SQL script in `supabase/payments_schema.sql` to create these tables:

1. Log in to your Supabase dashboard
2. Go to the "SQL Editor" section
3. Copy the contents of the `supabase/payments_schema.sql` file
4. Paste it into the SQL editor and click "Run"

## Testing Payments

To test payments without actual money transactions:

1. Use the following test card details in the Razorpay checkout form:
   - Card Number: 4111 1111 1111 1111
   - Expiry: Any future date
   - CVV: Any 3-digit number
   - Name: Any name
   - 3D Secure Password: 1234

2. For UPI testing, use "success@razorpay" as the UPI ID

## Troubleshooting

If you encounter any issues with the Razorpay integration:

1. **Missing environment variables**: Ensure that both `NEXT_PUBLIC_RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are properly set in your environment
2. **API errors**: Check that your Razorpay account is active and that your API keys are correct
3. **Database errors**: Verify that the tables specified in `supabase/payments_schema.sql` have been created in your Supabase database

For more information, refer to the [Razorpay API Documentation](https://razorpay.com/docs/). 