"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const [countdown, setCountdown] = useState(5);
  const [currentPlan, setCurrentPlan] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams?.get('plan') || 'your plan';
  const orderId = searchParams?.get('order_id') || '';
  const paymentId = searchParams?.get('payment_id') || '';
  
  // Get the amount from plan name
  const getPlanBaseAmount = (planName: string) => {
    switch(planName) {
      case 'plus': return 499;
      case 'pro': return 1999;
      case 'team': return 2499;
      default: return 0;
    }
  };
  
  const baseAmount = getPlanBaseAmount(plan);
  const gstAmount = Math.round(baseAmount * 0.18);
  const totalAmount = baseAmount + gstAmount;

  useEffect(() => {
    // Get the current plan from localStorage to verify it changed
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setCurrentPlan(userData.plan || 'free');
    }
    
    // Auto-redirect after countdown
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      router.push('/chat');
    }
  }, [countdown, router]);

  // Verify if plan was successfully updated
  const planUpdated = currentPlan === plan;

  return (
    <div className="min-h-screen bg-[#0c1220] flex flex-col items-center justify-center py-12 px-6 md:px-12 relative">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#9c6bff]/20 to-[#00c8ff]/20 opacity-30"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#9c6bff] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00c8ff] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
      </div>

      <div className="max-w-md w-full bg-gray-800/40 backdrop-blur-md rounded-xl overflow-hidden border border-gray-700/50 p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-500/20 flex items-center justify-center rounded-full">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-4">Payment Successful!</h1>
        
        <p className="text-gray-300 mb-4">
          Thank you for upgrading to the <span className="font-semibold text-[#00c8ff]">{plan}</span> plan. Your payment has been processed successfully.
        </p>
        
        {/* Payment breakdown */}
        {baseAmount > 0 && (
          <div className="mb-6 p-4 bg-gray-700/30 rounded-lg">
            <h3 className="text-white text-sm font-medium mb-2">Payment Details</h3>
            <div className="flex justify-between text-xs text-gray-300 mb-1">
              <span>Base Price:</span>
              <span>₹{baseAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-300 mb-1">
              <span>GST (18%):</span>
              <span>₹{gstAmount.toFixed(2)}</span>
            </div>
            <div className="h-px w-full bg-gray-600 my-2"></div>
            <div className="flex justify-between text-sm text-white font-medium">
              <span>Total Amount:</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        )}
        
        {planUpdated ? (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-green-400 text-sm">
              Your account has been successfully upgraded! You now have access to all <span className="font-semibold">{plan}</span> plan features.
            </p>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-400 text-sm">
              Your payment was successful, but it may take a moment for your account to reflect the changes. If your plan doesn't update within a few minutes, please contact support.
            </p>
          </div>
        )}
        
        {orderId && paymentId && (
          <div className="mb-6 text-xs text-gray-400">
            <p>Order ID: {orderId}</p>
            <p>Payment ID: {paymentId}</p>
            <p className="mt-2">Current Plan: <span className="font-semibold">{currentPlan}</span></p>
          </div>
        )}
        
        <p className="text-gray-400 mb-8">
          You will be redirected to the chat in <span className="font-semibold text-white">{countdown}</span> seconds.
        </p>
        
        <div className="flex justify-center space-x-4">
          <Link href="/chat" className="px-6 py-2 bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] rounded-md text-white transition-all shadow-md hover:opacity-90">
            Go to Chat Now
          </Link>
        </div>
      </div>
    </div>
  );
} 