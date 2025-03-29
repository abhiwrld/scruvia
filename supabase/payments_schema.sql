-- Create the payment_orders table to track payment orders
CREATE TABLE IF NOT EXISTS public.payment_orders (
  id SERIAL PRIMARY KEY,
  order_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL,
  currency TEXT NOT NULL,
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS payment_orders_user_id_idx ON public.payment_orders(user_id);
CREATE INDEX IF NOT EXISTS payment_orders_order_id_idx ON public.payment_orders(order_id);

-- Create the payments table to track completed payments
CREATE TABLE IF NOT EXISTS public.payments (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  amount BIGINT,
  currency TEXT NOT NULL,
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS payments_payment_id_idx ON public.payments(payment_id);

-- Add RLS policies for payment_orders
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;

-- Users can only view their own payment orders
CREATE POLICY "Users can view their own payment orders"
  ON public.payment_orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only authenticated users can insert payment orders
CREATE POLICY "Only authenticated users can insert payment orders"
  ON public.payment_orders
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Add RLS policies for payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users can only view their own payments
CREATE POLICY "Users can view their own payments"
  ON public.payments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert payments (via API)
CREATE POLICY "Service role can insert payments"
  ON public.payments
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow service role to update payment records
CREATE POLICY "Service role can update payments"
  ON public.payments
  FOR UPDATE
  USING (auth.uid() IS NOT NULL); 