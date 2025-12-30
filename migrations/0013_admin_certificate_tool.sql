-- Admin Users and Permissions
-- ============================================

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  admin_id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'admin', -- admin, super_admin
  permissions TEXT, -- JSON array of permissions
  status TEXT DEFAULT 'active', -- active, inactive, suspended
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Admin sessions
CREATE TABLE IF NOT EXISTS admin_sessions (
  session_id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admin_users(admin_id)
);

-- Certificate generation logs
CREATE TABLE IF NOT EXISTS certificate_generation_logs (
  log_id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER NOT NULL,
  certificate_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  course_name TEXT NOT NULL,
  action TEXT DEFAULT 'generate', -- generate, revoke, reissue
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admin_users(admin_id),
  FOREIGN KEY (certificate_id) REFERENCES certificates(certificate_id),
  FOREIGN KEY (student_id) REFERENCES students(student_id)
);

-- Bulk certificate generation batches
CREATE TABLE IF NOT EXISTS certificate_batches (
  batch_id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER NOT NULL,
  batch_name TEXT NOT NULL,
  course_name TEXT NOT NULL,
  total_certificates INTEGER DEFAULT 0,
  generated_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (admin_id) REFERENCES admin_users(admin_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_cert_logs_admin ON certificate_generation_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_cert_batches_admin ON certificate_batches(admin_id);

-- Insert default admin user (password: admin123 - should be hashed in production)
INSERT OR IGNORE INTO admin_users (username, email, password, full_name, role, permissions)
VALUES ('admin', 'admin@passionbots.in', 'admin123', 'System Administrator', 'super_admin', 
  '["generate_certificates", "revoke_certificates", "view_all_certificates", "manage_users", "view_analytics"]');
