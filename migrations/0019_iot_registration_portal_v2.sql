-- IoT & Robotics Registration Portal
-- Migration: 0019 - Fresh Install

-- Course Registrations Table
CREATE TABLE IF NOT EXISTS course_registrations (
  registration_id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  mobile TEXT NOT NULL,
  college_name TEXT,
  year_of_study TEXT,
  course_type TEXT DEFAULT 'iot_robotics',
  registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  payment_status TEXT DEFAULT 'pending',
  payment_amount DECIMAL(10,2) DEFAULT 0.00,
  payment_id TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Live Classes Schedule Table
CREATE TABLE IF NOT EXISTS live_classes (
  class_id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_type TEXT DEFAULT 'iot_robotics',
  class_title TEXT NOT NULL,
  class_description TEXT,
  instructor_name TEXT NOT NULL,
  class_date DATE NOT NULL,
  class_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  zoom_meeting_id TEXT NOT NULL,
  zoom_meeting_password TEXT,
  zoom_join_url TEXT NOT NULL,
  zoom_start_url TEXT,
  max_participants INTEGER DEFAULT 100,
  status TEXT DEFAULT 'scheduled',
  recording_url TEXT,
  materials_url TEXT,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Class Attendance Table
CREATE TABLE IF NOT EXISTS class_attendance (
  attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id INTEGER NOT NULL,
  registration_id INTEGER NOT NULL,
  joined_at DATETIME,
  left_at DATETIME,
  duration_minutes INTEGER,
  status TEXT DEFAULT 'registered',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Course Modules Table
CREATE TABLE IF NOT EXISTS course_modules (
  module_id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_type TEXT DEFAULT 'iot_robotics',
  module_number INTEGER NOT NULL,
  module_title TEXT NOT NULL,
  module_description TEXT,
  topics TEXT,
  duration_weeks INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Student Progress Table
CREATE TABLE IF NOT EXISTS student_progress (
  progress_id INTEGER PRIMARY KEY AUTOINCREMENT,
  registration_id INTEGER NOT NULL,
  module_id INTEGER NOT NULL,
  completion_percentage INTEGER DEFAULT 0,
  completed_at DATETIME,
  score INTEGER,
  status TEXT DEFAULT 'not_started',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
  announcement_id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_type TEXT DEFAULT 'iot_robotics',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  target_audience TEXT DEFAULT 'all',
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_registrations_email ON course_registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON course_registrations(status);
CREATE INDEX IF NOT EXISTS idx_classes_date ON live_classes(class_date);
CREATE INDEX IF NOT EXISTS idx_classes_status ON live_classes(status);
CREATE INDEX IF NOT EXISTS idx_attendance_class ON class_attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON class_attendance(registration_id);
