-- Add Webinar Management System Only
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_webinars_course ON webinars(course_name);
CREATE INDEX IF NOT EXISTS idx_webinars_date ON webinars(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_webinars_status ON webinars(status);
CREATE INDEX IF NOT EXISTS idx_webinar_participants_student ON webinar_participants(student_id);
CREATE INDEX IF NOT EXISTS idx_webinar_participants_webinar ON webinar_participants(webinar_id);

-- Insert sample webinars
INSERT INTO webinars (title, description, course_name, scheduled_date, instructor_name, status)
VALUES 
  ('IoT Fundamentals Workshop', 'Introduction to Internet of Things and smart devices. Learn about sensors, actuators, and connectivity protocols.', 'IOT Robotics Program', datetime('now', '+7 days'), 'Rahul Gupta', 'scheduled'),
  ('Robotics Engineering Basics', 'Learn the fundamentals of robotics, automation, and mechatronics systems.', 'IOT Robotics Program', datetime('now', '+14 days'), 'Rahul Gupta', 'scheduled'),
  ('AI & Machine Learning Intro', 'Getting started with artificial intelligence, neural networks, and machine learning algorithms.', 'AI & Machine Learning', datetime('now', '+21 days'), 'Rahul Gupta', 'scheduled'),
  ('Web Development with React', 'Build modern web applications using React, JavaScript, and REST APIs.', 'Web Development', datetime('now', '+28 days'), 'Rahul Gupta', 'scheduled');
