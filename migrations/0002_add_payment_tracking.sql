-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  registration_id INTEGER NOT NULL,
  order_id TEXT UNIQUE NOT NULL,
  txn_id TEXT UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  payment_method TEXT,
  payment_status TEXT DEFAULT 'PENDING',
  paytm_status TEXT,
  bank_txn_id TEXT,
  gateway_name TEXT DEFAULT 'PAYTM',
  response_code TEXT,
  response_msg TEXT,
  txn_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (registration_id) REFERENCES course_registrations(registration_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_payments_registration_id ON payments(registration_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_txn_id ON payments(txn_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Add course_fee column to course_registrations if not exists
-- Note: SQLite doesn't support ALTER TABLE IF COLUMN NOT EXISTS
-- So we'll handle this in the application code
