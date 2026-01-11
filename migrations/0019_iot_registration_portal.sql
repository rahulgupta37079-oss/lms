-- IoT & Robotics Registration Portal
-- Migration: 0019

-- Course Registrations Table
CREATE TABLE IF NOT EXISTS course_registrations (
  registration_id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  mobile TEXT NOT NULL,
  college_name TEXT,
  year_of_study TEXT,
  course_type TEXT DEFAULT 'iot_robotics', -- 'iot_robotics', 'advanced', etc.
  registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'free'
  payment_amount DECIMAL(10,2) DEFAULT 0.00,
  payment_id TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'inactive', 'completed'
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
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'ongoing', 'completed', 'cancelled'
  recording_url TEXT,
  materials_url TEXT,
  created_by INTEGER, -- admin_id
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
  status TEXT DEFAULT 'registered', -- 'registered', 'joined', 'absent'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Course Modules Table
CREATE TABLE IF NOT EXISTS course_modules (
  module_id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_type TEXT DEFAULT 'iot_robotics',
  module_number INTEGER NOT NULL,
  module_title TEXT NOT NULL,
  module_description TEXT,
  topics TEXT, -- JSON array of topics
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
  status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
  announcement_id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_type TEXT DEFAULT 'iot_robotics',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  target_audience TEXT DEFAULT 'all', -- 'all', 'students', 'instructors'
  created_by INTEGER, -- admin_id
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_registrations_email ON course_registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON course_registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_course ON course_registrations(course_type);

CREATE INDEX IF NOT EXISTS idx_classes_date ON live_classes(class_date);
CREATE INDEX IF NOT EXISTS idx_classes_status ON live_classes(status);
CREATE INDEX IF NOT EXISTS idx_classes_course ON live_classes(course_type);

CREATE INDEX IF NOT EXISTS idx_attendance_class ON class_attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON class_attendance(registration_id);

CREATE INDEX IF NOT EXISTS idx_progress_student ON student_progress(registration_id);
CREATE INDEX IF NOT EXISTS idx_progress_module ON student_progress(module_id);

-- Insert Sample Course Modules
INSERT INTO course_modules (module_number, module_title, module_description, topics, duration_weeks, course_type) VALUES
(1, 'Introduction to IoT', 'Fundamentals of Internet of Things and its applications', '["IoT Architecture", "Sensors & Actuators", "Communication Protocols", "IoT Platforms"]', 1, 'iot_robotics'),
(2, 'Robotics Fundamentals', 'Basic concepts of robotics and automation', '["Robot Components", "Kinematics", "Control Systems", "Programming Basics"]', 2, 'iot_robotics'),
(3, 'Arduino Programming', 'Hands-on Arduino development', '["Arduino IDE", "Digital I/O", "Analog Sensors", "Serial Communication"]', 2, 'iot_robotics'),
(4, 'Raspberry Pi & IoT', 'Building IoT projects with Raspberry Pi', '["Linux Basics", "GPIO Programming", "Network Communication", "Cloud Integration"]', 2, 'iot_robotics'),
(5, 'Sensors & Data Collection', 'Working with various sensors and data processing', '["Temperature Sensors", "Motion Sensors", "Environmental Sensors", "Data Logging"]', 1, 'iot_robotics'),
(6, 'Wireless Communication', 'IoT communication protocols and implementation', '["WiFi", "Bluetooth", "MQTT", "LoRaWAN"]', 2, 'iot_robotics'),
(7, 'Robot Assembly & Control', 'Building and controlling robots', '["Mechanical Assembly", "Motor Control", "Line Following", "Obstacle Avoidance"]', 2, 'iot_robotics'),
(8, 'Final Project', 'Capstone IoT/Robotics project', '["Project Planning", "Implementation", "Testing", "Presentation"]', 2, 'iot_robotics');

-- Insert Sample Announcement
INSERT INTO announcements (title, message, priority, target_audience, course_type) VALUES
('Welcome to IoT & Robotics Course!', 'Welcome to PassionBots IoT & Robotics Program! Get ready for an exciting journey into the world of connected devices and automation. Check the schedule for upcoming live classes.', 'high', 'all', 'iot_robotics');
