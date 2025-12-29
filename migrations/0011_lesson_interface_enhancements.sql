-- Lesson Interface Enhancement Tables
-- ============================================

-- Chat messages for live sessions
CREATE TABLE IF NOT EXISTS chat_messages (
  message_id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL, -- 'student' or 'mentor'
  message TEXT NOT NULL,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES live_sessions(session_id)
);

-- Quiz/MCQ responses
CREATE TABLE IF NOT EXISTS quiz_responses (
  response_id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  selected_answer TEXT,
  is_correct INTEGER DEFAULT 0,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES curriculum_sessions(session_id),
  FOREIGN KEY (student_id) REFERENCES students(student_id)
);

-- Session enrollments (if not exists)
CREATE TABLE IF NOT EXISTS session_enrollments (
  enrollment_id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES live_sessions(session_id),
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  UNIQUE(session_id, student_id)
);

-- Video playback tracking
CREATE TABLE IF NOT EXISTS video_playback (
  playback_id INTEGER PRIMARY KEY AUTOINCREMENT,
  recording_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  watch_duration INTEGER DEFAULT 0, -- seconds watched
  completion_percentage INTEGER DEFAULT 0,
  last_position INTEGER DEFAULT 0, -- seconds into video
  last_watched DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recording_id) REFERENCES zoom_recordings(recording_id),
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  UNIQUE(recording_id, student_id)
);

-- Reactions/emojis for live sessions
CREATE TABLE IF NOT EXISTS session_reactions (
  reaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  user_name TEXT NOT NULL,
  reaction_type TEXT NOT NULL, -- 'like', 'love', 'clap', 'question', 'raise_hand'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES live_sessions(session_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_time ON chat_messages(sent_at);
CREATE INDEX IF NOT EXISTS idx_quiz_session ON quiz_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_student ON quiz_responses(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_session ON session_enrollments(session_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_student ON session_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_playback_recording ON video_playback(recording_id);
CREATE INDEX IF NOT EXISTS idx_playback_student ON video_playback(student_id);
CREATE INDEX IF NOT EXISTS idx_reactions_session ON session_reactions(session_id);
