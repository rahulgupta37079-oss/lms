-- Email Notifications and Certificate Enhancements
-- ============================================

-- Add email tracking columns to course_registrations
ALTER TABLE course_registrations ADD COLUMN registration_email_sent INTEGER DEFAULT 0;
ALTER TABLE course_registrations ADD COLUMN payment_email_sent INTEGER DEFAULT 0;
ALTER TABLE course_registrations ADD COLUMN course_access_email_sent INTEGER DEFAULT 0;
ALTER TABLE course_registrations ADD COLUMN certificate_email_sent INTEGER DEFAULT 0;

-- Add certificate generation tracking
ALTER TABLE course_registrations ADD COLUMN certificate_id TEXT;
ALTER TABLE course_registrations ADD COLUMN certificate_generated INTEGER DEFAULT 0;
ALTER TABLE course_registrations ADD COLUMN course_completed INTEGER DEFAULT 0;
ALTER TABLE course_registrations ADD COLUMN completion_date DATETIME;

-- Update certificates table to link with registrations
ALTER TABLE certificates ADD COLUMN registration_id INTEGER;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_course_registrations_certificate ON course_registrations(certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificates_registration ON certificates(registration_id);

-- Create email_logs table for tracking
CREATE TABLE IF NOT EXISTS email_logs (
  log_id INTEGER PRIMARY KEY AUTOINCREMENT,
  registration_id INTEGER,
  email_type TEXT NOT NULL, -- registration, payment_success, payment_failure, course_access, certificate, reminder
  recipient_email TEXT NOT NULL,
  subject TEXT,
  status TEXT DEFAULT 'sent', -- sent, failed, bounced
  message_id TEXT,
  error_message TEXT,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (registration_id) REFERENCES course_registrations(registration_id)
);

CREATE INDEX IF NOT EXISTS idx_email_logs_registration ON email_logs(registration_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
