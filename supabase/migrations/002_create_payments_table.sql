-- Create payments table for AR Organic Cashbook
-- Run this in Supabase SQL Editor

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    amount_paid INTEGER NOT NULL CHECK (amount_paid > 0),
    date DATE NOT NULL,
    note TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own payments
CREATE POLICY "Users can only access their own payments"
    ON payments
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_name);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date);

-- Update sales_entries table: remove status column (optional - for clean migration)
-- Note: Keep existing data or migrate it before running this
-- ALTER TABLE sales_entries DROP COLUMN IF EXISTS status;
