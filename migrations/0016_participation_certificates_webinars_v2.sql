-- Add Certificate Types and Webinar Management (Simplified)
-- ============================================

-- Webinars table
CREATE TABLE IF NOT EXISTS webinars (
  webinar_id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  course_name TEXT NOT NULL,
  scheduled_date DATETIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  instructor_name TEXT DEFAULT 'Rahul Gupta',
  meeting_url TEXT,
  recording_url TEXT,
  max_participants INTEGER,
  status TEXT DEFAULT 'scheduled',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Webinar registrations/attendance
CREATE TABLE IF NOT EXISTS webinar_participants (
  participant_id INTEGER PRIMARY KEY AUTOINCREMENT,
  webinar_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  attendance_status TEXT DEFAULT 'registered',
  attendance_duration_minutes INTEGER DEFAULT 0,
  certificate_generated INTEGER DEFAULT 0,
  certificate_id INTEGER,
  FOREIGN KEY (webinar_id) REFERENCES webinars(webinar_id),
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (certificate_id) REFERENCES certificates(certificate_id),
  UNIQUE(webinar_id, student_id)
);

-- Webinar feedback/ratings
CREATE TABLE IF NOT EXISTS webinar_feedback (
  feedback_id INTEGER PRIMARY KEY AUTOINCREMENT,
  webinar_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  rating INTEGER,
  feedback_text TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (webinar_id) REFERENCES webinars(webinar_id),
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  UNIQUE(webinar_id, student_id)
);

-- Create new certificates table with all columns (drop and recreate)
DROP TABLE IF EXISTS certificates_backup;
CREATE TABLE certificates_backup AS SELECT * FROM certificates;

DROP TABLE IF EXISTS certificates;
CREATE TABLE certificates (
  certificate_id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER,
  course_id INTEGER,
  certificate_code TEXT UNIQUE NOT NULL,
  student_name TEXT NOT NULL,
  course_name TEXT NOT NULL,
  issue_date DATE NOT NULL,
  completion_date DATE,
  certificate_data TEXT,
  qr_code_url TEXT,
  verification_url TEXT,
  status TEXT DEFAULT 'active',
  certificate_type TEXT DEFAULT 'completion',
  grade TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Restore data from backup
INSERT INTO certificates (certificate_id, student_id, course_id, certificate_code, student_name, course_name, issue_date, completion_date, certificate_data, qr_code_url, verification_url, status, created_at)
SELECT certificate_id, student_id, course_id, certificate_code, student_name, course_name, issue_date, completion_date, certificate_data, qr_code_url, verification_url, status, created_at
FROM certificates_backup;

DROP TABLE certificates_backup;

-- Recreate indexes
CREATE INDEX idx_certificates_student ON certificates(student_id);
CREATE INDEX idx_certificates_code ON certificates(certificate_code);
CREATE INDEX idx_certificates_status ON certificates(status);
CREATE INDEX idx_certificates_type ON certificates(certificate_type);

CREATE INDEX idx_webinars_course ON webinars(course_name);
CREATE INDEX idx_webinars_date ON webinars(scheduled_date);
CREATE INDEX idx_webinars_status ON webinars(status);
CREATE INDEX idx_webinar_participants_student ON webinar_participants(student_id);
CREATE INDEX idx_webinar_participants_webinar ON webinar_participants(webinar_id);

-- Insert sample webinars
INSERT OR IGNORE INTO webinars (title, description, course_name, scheduled_date, instructor_name, status)
VALUES 
  ('IoT Fundamentals Workshop', 'Introduction to Internet of Things and smart devices. Learn about sensors, actuators, and connectivity protocols.', 'IOT Robotics Program', datetime('now', '+7 days'), 'Rahul Gupta', 'scheduled'),
  ('Robotics Engineering Basics', 'Learn the fundamentals of robotics, automation, and mechatronics systems.', 'IOT Robotics Program', datetime('now', '+14 days'), 'Rahul Gupta', 'scheduled'),
  ('AI & Machine Learning Intro', 'Getting started with artificial intelligence, neural networks, and machine learning algorithms.', 'AI & Machine Learning', datetime('now', '+21 days'), 'Rahul Gupta', 'scheduled'),
  ('Web Development with React', 'Build modern web applications using React, JavaScript, and REST APIs.', 'Web Development', datetime('now', '+28 days'), 'Rahul Gupta', 'scheduled');
