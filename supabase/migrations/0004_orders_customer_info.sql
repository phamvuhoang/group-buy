-- Add customer information and payment method to orders table

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_name text,
ADD COLUMN IF NOT EXISTS customer_phone text,
ADD COLUMN IF NOT EXISTS customer_address text,
ADD COLUMN IF NOT EXISTS order_notes text,
ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'bank_transfer',
ADD COLUMN IF NOT EXISTS order_type text DEFAULT 'single'; -- single or group
