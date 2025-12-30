-- Certificate Generation System
-- ============================================

-- Certificates table (if not already exists from migration 0008)
CREATE TABLE IF NOT EXISTS certificates (
  certificate_id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  course_id INTEGER,
  certificate_code TEXT UNIQUE NOT NULL,
  student_name TEXT NOT NULL,
  course_name TEXT NOT NULL,
  issue_date DATE NOT NULL,
  completion_date DATE,
  certificate_data TEXT, -- JSON data for certificate
  qr_code_url TEXT,
  verification_url TEXT,
  status TEXT DEFAULT 'active', -- active, revoked
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id)
);

-- Certificate templates
CREATE TABLE IF NOT EXISTS certificate_templates (
  template_id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_name TEXT NOT NULL,
  template_html TEXT NOT NULL,
  template_type TEXT DEFAULT 'completion', -- completion, participation, excellence
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_certificates_student ON certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_code ON certificates(certificate_code);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
