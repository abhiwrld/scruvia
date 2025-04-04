import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

// Initialize Razorpay with your key ID and secret
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY || '';

// Ensure we have the required environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required Supabase environment variables:');
  console.error(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'Set' : 'Missing'}`);
  console.error(`NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_KEY: ${supabaseKey ? 'Set' : 'Missing'}`);
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'INR', plan, userId } = await request.json();

    if (!amount || !plan || !userId) {
      return NextResponse.json(
        { error: 'Amount, plan, and userId are required' },
        { status: 400 }
      );
    }

    // Create a Razorpay order
    const options = {
      amount: amount * 100, // amount in the smallest currency unit (paise)
      currency,
      receipt: `order_rcptid_${Date.now()}`,
      notes: {
        plan,
        userId,
      },
    };

    const order = await razorpay.orders.create(options);

    // Return the order ID and other details to the client
    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      plan,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
} 