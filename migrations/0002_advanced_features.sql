-- MCQs for lessons
CREATE TABLE IF NOT EXISTS lesson_mcqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lesson_id INTEGER NOT NULL,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT CHECK(correct_answer IN ('A', 'B', 'C', 'D')) NOT NULL,
  explanation TEXT,
  order_index INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

-- Student MCQ responses
CREATE TABLE IF NOT EXISTS mcq_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  mcq_id INTEGER NOT NULL,
  selected_answer TEXT CHECK(selected_answer IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN,
  answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (mcq_id) REFERENCES lesson_mcqs(id),
  UNIQUE(student_id, mcq_id)
);

-- Live tests/quizzes
CREATE TABLE IF NOT EXISTS live_tests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  total_marks INTEGER NOT NULL,
  passing_marks INTEGER NOT NULL,
  start_time DATETIME,
  end_time DATETIME,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES modules(id)
);

-- Live test questions
CREATE TABLE IF NOT EXISTS test_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  test_id INTEGER NOT NULL,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT CHECK(correct_answer IN ('A', 'B', 'C', 'D')) NOT NULL,
  marks INTEGER DEFAULT 1,
  order_index INTEGER NOT NULL,
  FOREIGN KEY (test_id) REFERENCES live_tests(id)
);

-- Student test attempts
CREATE TABLE IF NOT EXISTS test_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  test_id INTEGER NOT NULL,
  start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  end_time DATETIME,
  score INTEGER,
  total_marks INTEGER,
  percentage REAL,
  status TEXT CHECK(status IN ('in_progress', 'completed', 'expired')) DEFAULT 'in_progress',
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (test_id) REFERENCES live_tests(id)
);

-- Student test answers
CREATE TABLE IF NOT EXISTS test_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attempt_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  selected_answer TEXT CHECK(selected_answer IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN,
  answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (attempt_id) REFERENCES test_attempts(id),
  FOREIGN KEY (question_id) REFERENCES test_questions(id),
  UNIQUE(attempt_id, question_id)
);

-- Mentors/Teachers table
CREATE TABLE IF NOT EXISTS mentors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  specialization TEXT,
  profile_image TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Student-Mentor assignments
CREATE TABLE IF NOT EXISTS student_mentor_mapping (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  mentor_id INTEGER NOT NULL,
  assigned_date DATE DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (mentor_id) REFERENCES mentors(id),
  UNIQUE(student_id, mentor_id)
);

-- Messages between students and mentors
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,
  sender_type TEXT CHECK(sender_type IN ('student', 'mentor')) NOT NULL,
  receiver_id INTEGER NOT NULL,
  receiver_type TEXT CHECK(receiver_type IN ('student', 'mentor')) NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT 0,
  parent_message_id INTEGER,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_message_id) REFERENCES messages(id)
);

-- Assignment submissions - extend existing table
ALTER TABLE submissions ADD COLUMN mentor_id INTEGER;
ALTER TABLE submissions ADD COLUMN graded_at DATETIME;

-- Certificate templates
CREATE TABLE IF NOT EXISTS certificate_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('internship', 'skill')) NOT NULL,
  template_html TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Update certificates table
ALTER TABLE certificates ADD COLUMN student_name TEXT;
ALTER TABLE certificates ADD COLUMN course_name TEXT;
ALTER TABLE certificates ADD COLUMN completion_date DATE;
ALTER TABLE certificates ADD COLUMN template_id INTEGER;

-- Leaderboard/Rankings
CREATE TABLE IF NOT EXISTS student_rankings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  total_score INTEGER DEFAULT 0,
  tests_completed INTEGER DEFAULT 0,
  assignments_completed INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  rank_position INTEGER,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  UNIQUE(student_id)
);

-- Badges/Achievements
CREATE TABLE IF NOT EXISTS badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  criteria TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Student badges
CREATE TABLE IF NOT EXISTS student_badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  badge_id INTEGER NOT NULL,
  earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (badge_id) REFERENCES badges(id),
  UNIQUE(student_id, badge_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  user_type TEXT CHECK(user_type IN ('student', 'mentor')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK(type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
  link TEXT,
  is_read BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_mcqs_lesson ON lesson_mcqs(lesson_id);
CREATE INDEX IF NOT EXISTS idx_mcq_responses_student ON mcq_responses(student_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_student ON test_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_test ON test_attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, sender_type);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id, receiver_type);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, user_type);
