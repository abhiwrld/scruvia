import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, userId } = await request.json();

    console.log(`Payment verification started for user: ${userId}, plan: ${plan}`);
    console.log(`Order ID: ${razorpay_order_id}, Payment ID: ${razorpay_payment_id}`);

    // Verify the payment signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      console.error('Payment signature verification failed');
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    console.log('Payment signature verified successfully');

    // Get the order details to confirm the payment amount and other details
    const order = await razorpay.orders.fetch(razorpay_order_id);
    console.log(`Order details: amount=${order.amount}, currency=${order.currency}`);

    // First, check the structure of the profiles table
    const { data: tableInfo, error: tableError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('Error checking profiles table structure:', tableError);
      return NextResponse.json(
        { error: 'Failed to check database structure' },
        { status: 500 }
      );
    }

    // Update the user's plan in the database
    // Only include fields that exist in the profiles table
    const updateData: any = {
      plan: plan,
    };

    // Check if payment_provider field exists in profiles table
    if (tableInfo && tableInfo[0] && 'payment_provider' in tableInfo[0]) {
      updateData.payment_provider = 'razorpay';
    }

    // Check if payment_id field exists in profiles table
    if (tableInfo && tableInfo[0] && 'payment_id' in tableInfo[0]) {
      updateData.payment_id = razorpay_payment_id;
    }

    // Add updated timestamp if the field exists
    if (tableInfo && tableInfo[0] && 'updated_at' in tableInfo[0]) {
      updateData.updated_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('Error updating user plan:', error);
      return NextResponse.json(
        { error: 'Failed to update user plan' },
        { status: 500 }
      );
    }

    console.log(`Successfully updated user ${userId} to ${plan} plan`);

    // Return success response
    return NextResponse.json({
      success: true,
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      plan,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
} 