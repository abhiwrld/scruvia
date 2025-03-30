import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { supabase } from '@/utils/supabase';

// Initialize Razorpay with your key_id and key_secret
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// Price mapping (in paisa - 100 paisa = 1 INR)
const PLAN_PRICES = {
  'plus': 49900,   // ₹499
  'pro': 99900,    // ₹999
  'team': 249900,  // ₹2,499
};

export async function POST(request: NextRequest) {
  try {
    const { plan, userId } = await request.json();
    
    if (!plan || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    if (!PLAN_PRICES[plan as keyof typeof PLAN_PRICES]) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }
    
    // Get the price for the selected plan
    const amount = PLAN_PRICES[plan as keyof typeof PLAN_PRICES];
    
    // Create a new payment order
    const options = {
      amount,
      currency: 'INR',
      receipt: `order_rcpt_${userId}_${Date.now()}`,
      notes: {
        userId,
        plan,
      },
    };
    
    const order = await razorpay.orders.create(options);
    
    // Save the order in your database
    const { error } = await supabase
      .from('payment_orders')
      .insert([
        {
          order_id: order.id,
          user_id: userId,
          amount: amount,
          currency: 'INR',
          plan: plan,
          status: 'created',
          created_at: new Date().toISOString(),
        },
      ]);
    
    if (error) {
      console.error('Error saving payment order:', error);
      return NextResponse.json(
        { error: 'Failed to create payment order' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Payment order creation error:', error);
    return NextResponse.json(
      { error: 'Payment initialization failed' },
      { status: 500 }
    );
  }
} 