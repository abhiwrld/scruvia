import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/utils/supabase';

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      plan,
    } = await request.json();

    // Validate payment signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Update order status in database
    const { error: orderUpdateError } = await supabase
      .from('payment_orders')
      .update({
        status: 'completed',
        payment_id: razorpay_payment_id,
        updated_at: new Date().toISOString(),
      })
      .match({ order_id: razorpay_order_id });

    if (orderUpdateError) {
      console.error('Error updating payment order:', orderUpdateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update payment status' },
        { status: 500 }
      );
    }

    // Update user's plan in the profiles table
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        plan: plan,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (profileUpdateError) {
      console.error('Error updating user profile:', profileUpdateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update user plan' },
        { status: 500 }
      );
    }

    // Add a payment record to the payments table
    const { error: paymentInsertError } = await supabase
      .from('payments')
      .insert([
        {
          user_id: userId,
          payment_id: razorpay_payment_id,
          order_id: razorpay_order_id,
          amount: null, // We'll fetch this from the payment_orders table
          currency: 'INR',
          plan: plan,
          status: 'completed',
          created_at: new Date().toISOString(),
        },
      ]);

    if (paymentInsertError) {
      console.error('Error creating payment record:', paymentInsertError);
      // This error is not critical enough to fail the response
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      plan: plan,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Payment verification failed' },
      { status: 500 }
    );
  }
} 