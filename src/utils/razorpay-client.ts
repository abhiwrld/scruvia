declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    address: string;
  };
  theme: {
    color: string;
  };
}

/**
 * Loads the Razorpay script dynamically
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Creates a Razorpay order
 */
export const createRazorpayOrder = async (
  amount: number,
  currency: string,
  plan: string,
  userId: string
) => {
  try {
    const response = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        plan,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

/**
 * Verifies a Razorpay payment
 */
export const verifyRazorpayPayment = async (
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
  plan: string,
  userId: string
) => {
  try {
    const response = await fetch('/api/payment/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        plan,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    throw error;
  }
};

/**
 * Initializes Razorpay payment
 */
export const initializeRazorpayPayment = async (
  orderId: string,
  amount: number,
  currency: string,
  plan: string,
  userId: string,
  userEmail: string,
  userName: string,
  userPhone: string,
  onSuccess: (data: any) => void,
  onError: (error: any) => void
) => {
  const isScriptLoaded = await loadRazorpayScript();
  
  if (!isScriptLoaded) {
    onError(new Error('Failed to load Razorpay script'));
    return;
  }

  const options: PaymentOptions = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
    amount: amount * 100, // in paise
    currency,
    name: 'Scruvia AI',
    description: `${plan} Plan Subscription (includes 18% GST)`,
    order_id: orderId,
    handler: async (response) => {
      try {
        const data = await verifyRazorpayPayment(
          response.razorpay_order_id,
          response.razorpay_payment_id,
          response.razorpay_signature,
          plan,
          userId
        );
        onSuccess(data);
      } catch (error) {
        onError(error);
      }
    },
    prefill: {
      name: userName,
      email: userEmail,
      contact: userPhone,
    },
    notes: {
      address: 'Scruvia AI Headquarters',
    },
    theme: {
      color: '#9c6bff',
    },
  };

  const razorpayInstance = new window.Razorpay(options);
  razorpayInstance.open();
}; 