-- Add Certificate Types and Webinar Management
-- ============================================

-- Add certificate_type column to certificates table
ALTER TABLE certificates ADD COLUMN certificate_type TEXT DEFAULT 'completion' CHECK(certificate_type IN ('completion', 'participation'));

-- Add grade column to certificates table  
ALTER TABLE certificates ADD COLUMN grade TEXT;

-- Add description column for custom certificate text
ALTER TABLE certificates ADD COLUMN description TEXT;

-- Webinars table
CREATE TABLE IF NOT EXISTS webinars (
  webinar_id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  course_name TEXT NOT NULL,
  scheduled_date DATETIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  instructor_name TEXT,
  meeting_url TEXT,
  recording_url TEXT,
  max_participants INTEGER,
  status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'live', 'completed', 'cancelled')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Webinar registrations/attendance
CREATE TABLE IF NOT EXISTS webinar_participants (
  participant_id INTEGER PRIMARY KEY AUTOINCREMENT,
  webinar_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  attendance_status TEXT DEFAULT 'registered' CHECK(attendance_status IN ('registered', 'attended', 'absent', 'cancelled')),
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
  rating INTEGER CHECK(rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (webinar_id) REFERENCES webinars(webinar_id),
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  UNIQUE(webinar_id, student_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_webinars_course ON webinars(course_name);
CREATE INDEX IF NOT EXISTS idx_webinars_date ON webinars(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_webinars_status ON webinars(status);
CREATE INDEX IF NOT EXISTS idx_webinar_participants_student ON webinar_participants(student_id);
CREATE INDEX IF NOT EXISTS idx_webinar_participants_webinar ON webinar_participants(webinar_id);
CREATE INDEX IF NOT EXISTS idx_certificates_type ON certificates(certificate_type);

-- Insert sample webinars
INSERT OR IGNORE INTO webinars (title, description, course_name, scheduled_date, instructor_name, status)
VALUES 
  ('IoT Fundamentals Workshop', 'Introduction to Internet of Things and smart devices', 'IOT Robotics Program', datetime('now', '+7 days'), 'Rahul Gupta', 'scheduled'),
  ('Robotics Engineering Basics', 'Learn the fundamentals of robotics and automation', 'IOT Robotics Program', datetime('now', '+14 days'), 'Rahul Gupta', 'scheduled'),
  ('AI & Machine Learning Intro', 'Getting started with artificial intelligence', 'AI & Machine Learning', datetime('now', '+21 days'), 'Rahul Gupta', 'scheduled');
