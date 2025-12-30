-- Admin Portal Tables
-- PassionBots LMS - Admin Certificate Generation Tool

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  admin_id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin', -- 'super_admin', 'admin', 'moderator'
  permissions TEXT DEFAULT '[]', -- JSON array of permissions
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'suspended'
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Admin Sessions Table
CREATE TABLE IF NOT EXISTS admin_sessions (
  session_id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admin_users(admin_id)
);

-- Certificate Generation Logs Table
CREATE TABLE IF NOT EXISTS certificate_generation_logs (
  log_id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER NOT NULL,
  certificate_id INTEGER,
  student_id INTEGER,
  course_name TEXT,
  action TEXT NOT NULL, -- 'generate', 'revoke', 'update'
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admin_users(admin_id),
  FOREIGN KEY (certificate_id) REFERENCES certificates(certificate_id),
  FOREIGN KEY (student_id) REFERENCES students(student_id)
);

-- Certificate Batches Table (for bulk generation)
CREATE TABLE IF NOT EXISTS certificate_batches (
  batch_id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER NOT NULL,
  batch_name TEXT NOT NULL,
  course_name TEXT NOT NULL,
  total_certificates INTEGER NOT NULL DEFAULT 0,
  generated_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (admin_id) REFERENCES admin_users(admin_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_status ON admin_users(status);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_cert_logs_admin ON certificate_generation_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_cert_logs_cert ON certificate_generation_logs(certificate_id);
CREATE INDEX IF NOT EXISTS idx_cert_batches_admin ON certificate_batches(admin_id);
CREATE INDEX IF NOT EXISTS idx_cert_batches_status ON certificate_batches(status);

-- Insert default admin user (username: admin, password: admin123)
-- NOTE: In production, use proper password hashing!
INSERT OR IGNORE INTO admin_users (username, password, email, full_name, role, permissions, status)
VALUES (
  'admin',
  'admin123',
  'admin@passionbots.in',
  'System Administrator',
  'super_admin',
  '["all"]',
  'active'
);

-- Insert additional admin users for testing
INSERT OR IGNORE INTO admin_users (username, password, email, full_name, role, permissions, status)
VALUES (
  'certificate_admin',
  'cert123',
  'certificates@passionbots.in',
  'Certificate Manager',
  'admin',
  '["certificates"]',
  'active'
);
