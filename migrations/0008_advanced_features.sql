-- Migration: Add Advanced Features (Certificates, Quizzes, Assignments, Messages)
-- Version: 0008
-- Date: 2025-12-26

-- ============================================
-- CERTIFICATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS certificates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  module_id INTEGER,
  certificate_type TEXT NOT NULL, -- 'module_completion', 'course_completion', 'achievement'
  certificate_title TEXT NOT NULL,
  issued_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  certificate_code TEXT UNIQUE NOT NULL, -- Unique verification code
  grade_achieved TEXT,
  instructor_name TEXT,
  certificate_url TEXT, -- URL to generated certificate PDF/image
  is_verified BOOLEAN DEFAULT 1,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (module_id) REFERENCES curriculum_modules(id)
);

CREATE INDEX IF NOT EXISTS idx_certificates_student ON certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_code ON certificates(certificate_code);

-- ============================================
-- QUIZZES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quizzes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INTEGER NOT NULL,
  session_id INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER DEFAULT 30,
  total_marks INTEGER DEFAULT 100,
  passing_marks INTEGER DEFAULT 60,
  is_published BOOLEAN DEFAULT 0,
  created_by INTEGER, -- mentor_id
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES curriculum_modules(id),
  FOREIGN KEY (session_id) REFERENCES curriculum_sessions(id),
  FOREIGN KEY (created_by) REFERENCES mentors(id)
);

-- ============================================
-- QUIZ QUESTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL, -- 'multiple_choice', 'true_false', 'short_answer'
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct_answer TEXT NOT NULL,
  marks INTEGER DEFAULT 1,
  order_number INTEGER DEFAULT 0,
  explanation TEXT,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- ============================================
-- QUIZ ATTEMPTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  end_time DATETIME,
  score INTEGER DEFAULT 0,
  total_marks INTEGER,
  percentage REAL,
  passed BOOLEAN DEFAULT 0,
  answers_json TEXT, -- JSON string of answers
  time_taken_minutes INTEGER,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id),
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student ON quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);

-- ============================================
-- ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INTEGER NOT NULL,
  session_id INTEGER,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  due_date DATETIME,
  total_marks INTEGER DEFAULT 100,
  submission_type TEXT DEFAULT 'file', -- 'file', 'text', 'link', 'code'
  is_published BOOLEAN DEFAULT 0,
  created_by INTEGER, -- mentor_id
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES curriculum_modules(id),
  FOREIGN KEY (session_id) REFERENCES curriculum_sessions(id),
  FOREIGN KEY (created_by) REFERENCES mentors(id)
);

-- ============================================
-- ASSIGNMENT SUBMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assignment_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  submission_text TEXT,
  submission_file_url TEXT,
  submission_link TEXT,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'submitted', -- 'submitted', 'graded', 'returned'
  score INTEGER,
  feedback TEXT,
  graded_by INTEGER, -- mentor_id
  graded_at DATETIME,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (graded_by) REFERENCES mentors(id)
);

CREATE INDEX IF NOT EXISTS idx_submissions_student ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON assignment_submissions(assignment_id);

-- ============================================
-- MESSAGES TABLE (Student-Mentor Communication)
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,
  sender_type TEXT NOT NULL, -- 'student' or 'mentor'
  receiver_id INTEGER NOT NULL,
  receiver_type TEXT NOT NULL, -- 'student' or 'mentor'
  subject TEXT,
  message TEXT NOT NULL,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN DEFAULT 0,
  read_at DATETIME,
  parent_message_id INTEGER, -- For threaded conversations
  attachment_url TEXT,
  FOREIGN KEY (parent_message_id) REFERENCES messages(id)
);

CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id, receiver_type);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, sender_type);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(is_read);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  user_type TEXT NOT NULL, -- 'student' or 'mentor'
  notification_type TEXT NOT NULL, -- 'quiz', 'assignment', 'message', 'certificate', 'session'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- ============================================
-- Insert Sample Data
-- ============================================

-- Sample Quizzes
INSERT OR IGNORE INTO quizzes (id, module_id, title, description, duration_minutes, total_marks, passing_marks, is_published) VALUES
(1, 1, 'Kindergarten Robotics Quiz 1', 'Test your knowledge about robot basics!', 15, 20, 12, 1),
(2, 2, 'Grade 1 Electronics Quiz', 'Understanding electricity and circuits', 20, 30, 18, 1),
(3, 3, 'Grade 2 Sensors Quiz', 'Test your knowledge about sensors and automation', 25, 40, 24, 1);

-- Sample Quiz Questions
INSERT OR IGNORE INTO quiz_questions (quiz_id, question_text, question_type, option_a, option_b, option_c, option_d, correct_answer, marks) VALUES
(1, 'What is a robot?', 'multiple_choice', 'A toy', 'A machine that can follow instructions', 'A computer', 'A phone', 'B', 5),
(1, 'Robots need electricity to work', 'true_false', 'True', 'False', NULL, NULL, 'A', 5),
(1, 'Which part helps a robot see?', 'multiple_choice', 'Wheels', 'Camera or sensor', 'Battery', 'Wire', 'B', 5),
(1, 'Can robots help people?', 'true_false', 'True', 'False', NULL, NULL, 'A', 5);

-- Sample Assignments
INSERT OR IGNORE INTO assignments (id, module_id, title, description, due_date, total_marks, is_published) VALUES
(1, 1, 'Draw Your Dream Robot', 'Draw and color a picture of a robot you would like to build', datetime('now', '+7 days'), 20, 1),
(2, 2, 'Build a Simple Circuit', 'Take photos of your circuit project and upload them', datetime('now', '+10 days'), 50, 1),
(3, 3, 'Sensor Project Report', 'Write a report about how sensors work in everyday life', datetime('now', '+14 days'), 100, 1);

-- Sample Certificates
INSERT OR IGNORE INTO certificates (student_id, module_id, certificate_type, certificate_title, certificate_code, grade_achieved, issued_date) VALUES
(1, 1, 'module_completion', 'Kindergarten Robotics Completion', 'CERT-KG-001-2025', 'Excellent', datetime('now')),
(1, 2, 'course_completion', 'Grade 1 Electronics Mastery', 'CERT-G1-001-2025', 'Outstanding', datetime('now'));

-- Sample Messages
INSERT OR IGNORE INTO messages (sender_id, sender_type, receiver_id, receiver_type, subject, message) VALUES
(1, 'student', 1, 'mentor', 'Question about Circuit Project', 'Hi! I need help understanding how to connect the LED to the battery. Can you please explain?'),
(1, 'mentor', 1, 'student', 'Re: Question about Circuit Project', 'Hello! Great question! You need to connect the positive side of the LED to the positive terminal of the battery through a resistor...');
