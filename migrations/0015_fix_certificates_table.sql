-- Fix certificates table schema
-- ============================================

-- Drop old certificates table if it exists
DROP TABLE IF EXISTS certificates;

-- Recreate certificates table with correct schema
CREATE TABLE certificates (
  certificate_id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER,
  course_id INTEGER,
  certificate_code TEXT UNIQUE NOT NULL,
  student_name TEXT NOT NULL,
  course_name TEXT NOT NULL,
  issue_date DATE NOT NULL,
  completion_date DATE,
  certificate_data TEXT, -- JSON data for certificate
  qr_code_url TEXT,
  verification_url TEXT,
  status TEXT DEFAULT 'active', -- active, revoked, expired
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Recreate indexes
CREATE INDEX idx_certificates_student ON certificates(student_id);
CREATE INDEX idx_certificates_code ON certificates(certificate_code);
CREATE INDEX idx_certificates_status ON certificates(status);
