-- Students table
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  university TEXT,
  enrollment_date DATE DEFAULT CURRENT_TIMESTAMP,
  program_type TEXT CHECK(program_type IN ('premium', 'learning')) DEFAULT 'premium',
  batch_start_date DATE,
  profile_image TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Course modules (8 modules from curriculum)
CREATE TABLE IF NOT EXISTS modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER,
  order_index INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Lessons within each module
CREATE TABLE IF NOT EXISTS lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INTEGER NOT NULL,
  lesson_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  duration_minutes INTEGER,
  content TEXT,
  resources TEXT, -- JSON array of resources
  order_index INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES modules(id)
);

-- Student progress tracking
CREATE TABLE IF NOT EXISTS student_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  lesson_id INTEGER NOT NULL,
  status TEXT CHECK(status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  progress_percentage INTEGER DEFAULT 0,
  last_accessed DATETIME,
  completed_at DATETIME,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (lesson_id) REFERENCES lessons(id),
  UNIQUE(student_id, lesson_id)
);

-- Assignments/Projects
CREATE TABLE IF NOT EXISTS assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  max_score INTEGER DEFAULT 100,
  requirements TEXT, -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES modules(id)
);

-- Student submissions
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assignment_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  submission_url TEXT,
  github_url TEXT,
  demo_url TEXT,
  description TEXT,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  score INTEGER,
  feedback TEXT,
  status TEXT CHECK(status IN ('pending', 'reviewed', 'resubmit')) DEFAULT 'pending',
  reviewed_at DATETIME,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id),
  FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Certificates
CREATE TABLE IF NOT EXISTS certificates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  certificate_type TEXT CHECK(certificate_type IN ('internship', 'skill')) NOT NULL,
  certificate_id TEXT UNIQUE NOT NULL, -- PB-IOT-2025-XXXXX format
  issued_date DATE DEFAULT CURRENT_TIMESTAMP,
  verification_url TEXT,
  is_verified BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Live sessions schedule
CREATE TABLE IF NOT EXISTS live_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  session_date DATETIME NOT NULL,
  duration_minutes INTEGER DEFAULT 90,
  meeting_url TEXT,
  recording_url TEXT,
  is_completed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES modules(id)
);

-- Session attendance
CREATE TABLE IF NOT EXISTS session_attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  attended BOOLEAN DEFAULT 0,
  attendance_time DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES live_sessions(id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  UNIQUE(session_id, student_id)
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  target_audience TEXT DEFAULT 'all', -- all, premium, learning
  is_published BOOLEAN DEFAULT 1,
  published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Hardware kit tracking
CREATE TABLE IF NOT EXISTS hardware_kits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  kit_type TEXT DEFAULT 'ESP32 Premium Kit',
  tracking_number TEXT,
  shipped_date DATE,
  delivered_date DATE,
  delivery_status TEXT CHECK(delivery_status IN ('pending', 'shipped', 'delivered', 'not_applicable')) DEFAULT 'pending',
  delivery_address TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Discussion forum
CREATE TABLE IF NOT EXISTS forum_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  module_id INTEGER,
  lesson_id INTEGER,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (module_id) REFERENCES modules(id),
  FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

-- Forum replies
CREATE TABLE IF NOT EXISTS forum_replies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  is_solution BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES forum_posts(id),
  FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_progress_student ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson ON student_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_certificates_student ON certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_id ON certificates(certificate_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_student ON forum_posts(student_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_post ON forum_replies(post_id);
