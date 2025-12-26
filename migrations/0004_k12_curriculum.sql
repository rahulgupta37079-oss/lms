-- K-12 Robotics Curriculum Database Schema
-- 48 sessions per grade (KG-12)

-- Grades table
CREATE TABLE IF NOT EXISTS grades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  grade_code TEXT NOT NULL UNIQUE, -- 'KG', '1', '2', ... '12'
  grade_name TEXT NOT NULL,
  description TEXT,
  age_range TEXT,
  theme TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Curriculum modules (one per grade)
CREATE TABLE IF NOT EXISTS curriculum_modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  grade_id INTEGER NOT NULL,
  module_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  theme TEXT,
  duration_weeks INTEGER DEFAULT 12,
  total_sessions INTEGER DEFAULT 48,
  icon TEXT,
  is_published INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (grade_id) REFERENCES grades(id)
);

-- Sessions (48 per module)
CREATE TABLE IF NOT EXISTS curriculum_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INTEGER NOT NULL,
  session_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  objectives TEXT, -- JSON array of learning objectives
  duration_minutes INTEGER DEFAULT 60,
  video_url TEXT,
  content TEXT, -- HTML content
  materials_needed TEXT, -- JSON array of materials
  is_project INTEGER DEFAULT 0,
  order_number INTEGER NOT NULL,
  is_published INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES curriculum_modules(id)
);

-- Kit components
CREATE TABLE IF NOT EXISTS kit_components (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT, -- 'electronics', 'mechanical', 'sensors', 'actuators'
  description TEXT,
  image_url TEXT,
  quantity INTEGER DEFAULT 1,
  unit_cost REAL,
  grade_level TEXT, -- 'basic', 'intermediate', 'advanced', 'expert'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Session components mapping
CREATE TABLE IF NOT EXISTS session_components (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  component_id INTEGER NOT NULL,
  quantity INTEGER DEFAULT 1,
  is_required INTEGER DEFAULT 1,
  FOREIGN KEY (session_id) REFERENCES curriculum_sessions(id),
  FOREIGN KEY (component_id) REFERENCES kit_components(id)
);

-- Student progress tracking
CREATE TABLE IF NOT EXISTS student_curriculum_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  session_id INTEGER NOT NULL,
  status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
  attendance INTEGER DEFAULT 0,
  participation_score INTEGER DEFAULT 0, -- 0-100
  project_submission TEXT, -- URL or file path
  quiz_score INTEGER DEFAULT 0,
  feedback TEXT,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (session_id) REFERENCES curriculum_sessions(id),
  UNIQUE(student_id, session_id)
);

-- Projects
CREATE TABLE IF NOT EXISTS curriculum_projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT, -- 'beginner', 'intermediate', 'advanced'
  estimated_time TEXT,
  instructions TEXT, -- Detailed steps
  circuit_diagram_url TEXT,
  code_template TEXT,
  expected_outcome TEXT,
  rubric TEXT, -- JSON scoring rubric
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES curriculum_sessions(id)
);

-- Quizzes
CREATE TABLE IF NOT EXISTS curriculum_quizzes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  questions TEXT, -- JSON array of questions
  total_marks INTEGER DEFAULT 10,
  passing_marks INTEGER DEFAULT 6,
  time_limit_minutes INTEGER DEFAULT 10,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES curriculum_sessions(id)
);

-- Achievement badges
CREATE TABLE IF NOT EXISTS curriculum_badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT, -- 'completion', 'excellence', 'special'
  criteria TEXT, -- JSON criteria
  points INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Student badges
CREATE TABLE IF NOT EXISTS student_curriculum_badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  badge_id INTEGER NOT NULL,
  earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (badge_id) REFERENCES curriculum_badges(id),
  UNIQUE(student_id, badge_id)
);

-- Insert sample data

-- Grades
INSERT OR IGNORE INTO grades (grade_code, grade_name, description, age_range, theme) VALUES
('KG', 'Kindergarten', 'Introduction to Robotics through play', '5-6 years', 'My Robot Friends'),
('1', 'Grade 1', 'Basic Electronics & Robotics', '6-7 years', 'Little Engineers'),
('2', 'Grade 2', 'Sensors & Automation', '7-8 years', 'Smart Robots'),
('3', 'Grade 3', 'Motors & Movement', '8-9 years', 'Robots in Motion'),
('4', 'Grade 4', 'Introduction to Microcontrollers', '9-10 years', 'Brain of the Robot'),
('5', 'Grade 5', 'Arduino Programming', '10-11 years', 'Code Your Robot'),
('6', 'Grade 6', 'Advanced Sensors', '11-12 years', 'Sensing the World'),
('7', 'Grade 7', 'ESP32 & IoT Basics', '12-13 years', 'Connected Robots'),
('8', 'Grade 8', 'IoT Applications', '13-14 years', 'Smart World'),
('9', 'Grade 9', 'Advanced Robotics', '14-15 years', 'Autonomous Systems'),
('10', 'Grade 10', 'AI & Machine Learning', '15-16 years', 'Intelligent Robots'),
('11', 'Grade 11', 'Advanced IoT & Industry 4.0', '16-17 years', 'Industrial Applications'),
('12', 'Grade 12', 'Capstone Project', '17-18 years', 'Innovation Challenge');

-- Sample curriculum module for KG
INSERT OR IGNORE INTO curriculum_modules (grade_id, module_number, title, description, theme, total_sessions) VALUES
(1, 1, 'My Robot Friends - KG Robotics', 'Introduction to robots and basic concepts through interactive play and hands-on activities', 'My Robot Friends', 48);

-- Sample sessions for KG (first 12 sessions)
INSERT OR IGNORE INTO curriculum_sessions (module_id, session_number, title, description, objectives, duration_minutes, is_project, order_number) VALUES
(1, 1, 'What is a Robot?', 'Introduction to robots through show and tell activities', '["Identify what makes something a robot","Name 3 different types of robots","Share ideas about robots"]', 60, 0, 1),
(1, 2, 'Robot Body Parts', 'Learning about robot components like head, arms, and legs', '["Name robot body parts","Compare robot parts to human body","Draw a robot with labeled parts"]', 60, 0, 2),
(1, 3, 'How Robots Move', 'Understanding different types of robot movement', '["Identify ways robots move","Demonstrate robot movements","Compare wheeled vs walking robots"]', 60, 0, 3),
(1, 4, 'Robot Sounds', 'Exploring how robots make sounds', '["Identify different robot sounds","Make robot sounds","Understand why robots beep"]', 60, 0, 4),
(1, 5, 'Robot Eyes - Sensors', 'Introduction to how robots see using sensors', '["Understand robot vision","Identify sensors","Explain how sensors work simply"]', 60, 0, 5),
(1, 6, 'PROJECT: Draw Your Dream Robot', 'Creative drawing project to design a dream robot', '["Express creativity","Design a robot","Present design to class"]', 60, 1, 6),
(1, 7, 'Building with Blocks', 'Learning basic structure building skills', '["Build stable structures","Follow instructions","Use different shapes"]', 60, 0, 7),
(1, 8, 'Connecting Pieces', 'Understanding how parts connect together', '["Join pieces together","Create connections","Build simple machines"]', 60, 0, 8),
(1, 9, 'Making Things Move', 'Understanding push and pull forces', '["Demonstrate push and pull","Make things roll","Understand force"]', 60, 0, 9),
(1, 10, 'Colors & Shapes', 'Pattern recognition and sorting', '["Identify colors","Sort shapes","Create patterns"]', 60, 0, 10),
(1, 11, 'Following Paths', 'Introduction to line following concept', '["Follow a path","Understand directions","Complete a maze"]', 60, 0, 11),
(1, 12, 'PROJECT: Build a Block Robot', 'Hands-on building project with blocks', '["Build a robot structure","Use learned concepts","Present creation"]', 60, 1, 12);

-- Sample kit components
INSERT OR IGNORE INTO kit_components (name, category, description, grade_level, unit_cost) VALUES
('LED - Red 5mm', 'electronics', 'Basic red LED for light projects', 'basic', 2),
('LED - Green 5mm', 'electronics', 'Basic green LED for light projects', 'basic', 2),
('LED - Yellow 5mm', 'electronics', 'Basic yellow LED for light projects', 'basic', 2),
('Buzzer - Active', 'electronics', 'Active buzzer for sound projects', 'basic', 10),
('Button - Push', 'electronics', 'Push button switch', 'basic', 5),
('Battery Holder - AA', 'electronics', '2xAA battery holder', 'basic', 15),
('DC Motor - Small', 'mechanical', 'Small DC motor for movement', 'basic', 30),
('Wheel - Plastic', 'mechanical', 'Plastic wheel for robots', 'basic', 20),
('Jumper Wires', 'electronics', 'Male-to-male jumper wires', 'basic', 1),
('Breadboard - Mini', 'electronics', 'Mini breadboard for prototyping', 'intermediate', 40),
('Arduino Uno', 'electronics', 'Arduino Uno microcontroller board', 'intermediate', 500),
('Ultrasonic Sensor', 'sensors', 'HC-SR04 distance sensor', 'intermediate', 50),
('Servo Motor', 'mechanical', 'SG90 micro servo motor', 'intermediate', 80),
('ESP32 Board', 'electronics', 'ESP32 development board with WiFi', 'advanced', 600),
('Camera Module', 'sensors', 'OV2640 camera module', 'advanced', 400),
('Relay Module', 'electronics', '4-channel relay module', 'advanced', 150),
('Temperature Sensor', 'sensors', 'DHT22 temperature and humidity sensor', 'intermediate', 80),
('IR Sensor', 'sensors', 'Infrared obstacle detection sensor', 'intermediate', 30),
('Touch Sensor', 'sensors', 'Capacitive touch sensor module', 'basic', 20),
('Light Sensor - LDR', 'sensors', 'Light dependent resistor', 'basic', 5);

-- Sample badges
INSERT OR IGNORE INTO curriculum_badges (name, description, icon, category, points) VALUES
('First Steps', 'Completed first 5 sessions', '🎯', 'completion', 50),
('Project Master', 'Completed 10 projects', '🏆', 'excellence', 200),
('Perfect Attendance', 'Attended all 48 sessions', '⭐', 'special', 100),
('Code Wizard', 'Mastered programming basics', '🧙‍♂️', 'excellence', 150),
('Circuit Expert', 'Built 20 circuits successfully', '⚡', 'excellence', 150),
('Robot Builder', 'Completed full robot project', '🤖', 'completion', 300),
('IoT Pioneer', 'Created first IoT project', '🌐', 'excellence', 250),
('Team Player', 'Collaborated on 5 group projects', '🤝', 'special', 100);
