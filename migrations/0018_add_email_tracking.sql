-- Migration: Add email tracking columns to certificates table
-- Date: 2026-01-03

-- Add email tracking columns if they don't exist
ALTER TABLE certificates ADD COLUMN student_email TEXT;
ALTER TABLE certificates ADD COLUMN email_sent INTEGER DEFAULT 0;
ALTER TABLE certificates ADD COLUMN email_sent_at DATETIME;

-- Create index for faster email queries
CREATE INDEX IF NOT EXISTS idx_certificates_email_sent ON certificates(email_sent);
CREATE INDEX IF NOT EXISTS idx_certificates_student_email ON certificates(student_email);
