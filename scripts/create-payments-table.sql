-- Create payments table to track who has paid
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cnpj VARCHAR(18) NOT NULL,
  ip_address VARCHAR(45),
  amount INTEGER NOT NULL,
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(cnpj)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_cnpj ON payments(cnpj);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your security needs)
CREATE POLICY "Allow all operations on payments" ON payments
  FOR ALL
  USING (true)
  WITH CHECK (true);
