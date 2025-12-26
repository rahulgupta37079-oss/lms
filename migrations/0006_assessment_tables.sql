-- Assessment System Tables Only
CREATE TABLE IF NOT EXISTS assessment_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  grade_id INTEGER NOT NULL,
  assessment_type TEXT NOT NULL CHECK(assessment_type IN ('quiz', 'test', 'project', 'practical')),
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER DEFAULT 60,
  total_marks INTEGER DEFAULT 100,
  passing_marks INTEGER DEFAULT 40,
  difficulty_level TEXT CHECK(difficulty_level IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  is_published INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (grade_id) REFERENCES grades(id)
);

CREATE TABLE IF NOT EXISTS assessment_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assessment_id INTEGER NOT NULL,
  question_type TEXT NOT NULL CHECK(question_type IN ('mcq', 'true_false', 'short_answer', 'practical', 'drawing')),
  question_text TEXT NOT NULL,
  question_image_url TEXT,
  options TEXT,
  correct_answer TEXT NOT NULL,
  marks INTEGER DEFAULT 1,
  order_number INTEGER DEFAULT 1,
  explanation TEXT,
  FOREIGN KEY (assessment_id) REFERENCES assessment_templates(id)
);

CREATE TABLE IF NOT EXISTS student_assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  assessment_id INTEGER NOT NULL,
  session_id INTEGER,
  attempt_number INTEGER DEFAULT 1,
  start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  end_time DATETIME,
  time_taken_minutes INTEGER,
  score_obtained DECIMAL(5,2) DEFAULT 0,
  total_marks INTEGER DEFAULT 100,
  percentage DECIMAL(5,2) DEFAULT 0,
  status TEXT CHECK(status IN ('in_progress', 'completed', 'graded')) DEFAULT 'in_progress',
  graded_by INTEGER,
  graded_at DATETIME,
  feedback TEXT,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (assessment_id) REFERENCES assessment_templates(id),
  FOREIGN KEY (session_id) REFERENCES curriculum_sessions(id),
  FOREIGN KEY (graded_by) REFERENCES mentors(id)
);

CREATE TABLE IF NOT EXISTS student_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_assessment_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  student_answer TEXT,
  is_correct INTEGER DEFAULT 0,
  marks_obtained DECIMAL(5,2) DEFAULT 0,
  time_spent_seconds INTEGER,
  answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_assessment_id) REFERENCES student_assessments(id),
  FOREIGN KEY (question_id) REFERENCES assessment_questions(id)
);

CREATE INDEX IF NOT EXISTS idx_assessment_templates_grade ON assessment_templates(grade_id);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_assessment ON assessment_questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_student_assessments_student ON student_assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_assessments_assessment ON student_assessments(assessment_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_assessment ON student_answers(student_assessment_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_question ON student_answers(question_id);
