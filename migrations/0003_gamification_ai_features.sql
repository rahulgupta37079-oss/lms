-- Migration: Advanced Features - Gamification, AI, Analytics
-- Version: 6.0
-- Date: 2025-12-17

-- ============================================
-- GAMIFICATION TABLES
-- ============================================

-- Student XP and Levels
CREATE TABLE IF NOT EXISTS student_gamification (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL UNIQUE,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  last_login_date DATE,
  total_badges INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Badges and Achievements
CREATE TABLE IF NOT EXISTS badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  badge_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT, -- 'learning', 'achievement', 'social', 'special'
  xp_reward INTEGER DEFAULT 0,
  rarity TEXT DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Student Badges (junction table)
CREATE TABLE IF NOT EXISTS student_badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  badge_id TEXT NOT NULL,
  earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(badge_id) ON DELETE CASCADE,
  UNIQUE(student_id, badge_id)
);

-- Leaderboard
CREATE TABLE IF NOT EXISTS leaderboard (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  category TEXT NOT NULL, -- 'weekly', 'monthly', 'all_time', 'module_specific'
  rank INTEGER,
  score INTEGER,
  period_start DATE,
  period_end DATE,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Daily Challenges
CREATE TABLE IF NOT EXISTS daily_challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  challenge_date DATE NOT NULL,
  xp_reward INTEGER DEFAULT 50,
  difficulty TEXT DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  challenge_type TEXT, -- 'coding', 'quiz', 'project', 'learning'
  requirements TEXT, -- JSON: what needs to be completed
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Student Challenge Progress
CREATE TABLE IF NOT EXISTS student_challenge_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  challenge_id INTEGER NOT NULL,
  status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed', 'failed'
  progress_percentage INTEGER DEFAULT 0,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (challenge_id) REFERENCES daily_challenges(id) ON DELETE CASCADE,
  UNIQUE(student_id, challenge_id)
);

-- ============================================
-- AI & ANALYTICS TABLES
-- ============================================

-- AI Chat History
CREATE TABLE IF NOT EXISTS ai_chat_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  message_type TEXT NOT NULL, -- 'user', 'assistant'
  message_text TEXT NOT NULL,
  context TEXT, -- JSON: additional context
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- AI Recommendations
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  recommendation_type TEXT NOT NULL, -- 'lesson', 'module', 'project', 'resource'
  recommendation_title TEXT NOT NULL,
  recommendation_description TEXT,
  recommendation_data TEXT, -- JSON: detailed recommendation data
  confidence_score REAL DEFAULT 0.0, -- 0.0 to 1.0
  reason TEXT,
  is_viewed BOOLEAN DEFAULT 0,
  is_accepted BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Learning Analytics
CREATE TABLE IF NOT EXISTS learning_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  date DATE NOT NULL,
  time_spent_minutes INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  tests_taken INTEGER DEFAULT 0,
  assignments_submitted INTEGER DEFAULT 0,
  average_score REAL DEFAULT 0.0,
  activity_data TEXT, -- JSON: detailed activity breakdown
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE(student_id, date)
);

-- Skill Progress Tracking
CREATE TABLE IF NOT EXISTS skill_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  skill_name TEXT NOT NULL,
  skill_category TEXT, -- 'hardware', 'software', 'theory', 'practical'
  proficiency_level INTEGER DEFAULT 0, -- 0-100
  last_practiced_at DATETIME,
  practice_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE(student_id, skill_name)
);

-- ============================================
-- COLLABORATION TABLES
-- ============================================

-- Code Snippets (for collaboration)
CREATE TABLE IF NOT EXISTS code_snippets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  language TEXT DEFAULT 'cpp',
  is_public BOOLEAN DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Code Comments/Reviews
CREATE TABLE IF NOT EXISTS code_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  snippet_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  user_type TEXT DEFAULT 'student', -- 'student', 'mentor'
  comment_text TEXT NOT NULL,
  line_number INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (snippet_id) REFERENCES code_snippets(id) ON DELETE CASCADE
);

-- Study Groups
CREATE TABLE IF NOT EXISTS study_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  module_id INTEGER,
  created_by INTEGER NOT NULL,
  max_members INTEGER DEFAULT 10,
  is_private BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES modules(id),
  FOREIGN KEY (created_by) REFERENCES students(id)
);

-- Study Group Members
CREATE TABLE IF NOT EXISTS study_group_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  role TEXT DEFAULT 'member', -- 'admin', 'moderator', 'member'
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE(group_id, student_id)
);

-- ============================================
-- NOTIFICATION SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  user_type TEXT DEFAULT 'student', -- 'student', 'mentor'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT, -- 'info', 'success', 'warning', 'error', 'achievement'
  action_url TEXT,
  is_read BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  read_at DATETIME
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_student_gamification_student_id ON student_gamification(student_id);
CREATE INDEX IF NOT EXISTS idx_student_gamification_level ON student_gamification(level);
CREATE INDEX IF NOT EXISTS idx_student_gamification_xp ON student_gamification(xp);

CREATE INDEX IF NOT EXISTS idx_student_badges_student_id ON student_badges(student_id);
CREATE INDEX IF NOT EXISTS idx_student_badges_badge_id ON student_badges(badge_id);

CREATE INDEX IF NOT EXISTS idx_leaderboard_category ON leaderboard(category);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard(rank);

CREATE INDEX IF NOT EXISTS idx_ai_chat_student_id ON ai_chat_history(student_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_created_at ON ai_chat_history(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_recommendations_student_id ON ai_recommendations(student_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_type ON ai_recommendations(recommendation_type);

CREATE INDEX IF NOT EXISTS idx_learning_analytics_student_id ON learning_analytics(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_analytics_date ON learning_analytics(date);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ============================================
-- SEED DATA: BADGES
-- ============================================

INSERT OR IGNORE INTO badges (badge_id, name, description, icon, category, xp_reward, rarity) VALUES
  ('first_robot', 'First Robot Built', 'Built your first IoT robot', '🤖', 'achievement', 100, 'common'),
  ('code_master', 'Code Master', 'Completed 10 coding challenges', '💻', 'learning', 200, 'rare'),
  ('perfect_score', 'Perfect Score', 'Got 100% on a test', '💯', 'achievement', 150, 'rare'),
  ('team_player', 'Team Player', 'Helped 5 students in forums', '👥', 'social', 100, 'common'),
  ('early_bird', 'Early Bird', 'Logged in before 6 AM', '🌅', 'special', 50, 'common'),
  ('night_owl', 'Night Owl', 'Studied after midnight', '🦉', 'special', 50, 'common'),
  ('streak_master', 'Streak Master', '30-day learning streak', '🔥', 'achievement', 500, 'epic'),
  ('mentor_favorite', 'Mentor Favorite', 'Received 10 positive reviews', '⭐', 'social', 300, 'rare'),
  ('quick_learner', 'Quick Learner', 'Completed a module in record time', '⚡', 'learning', 250, 'rare'),
  ('problem_solver', 'Problem Solver', 'Solved 50 MCQs correctly', '💡', 'achievement', 200, 'rare'),
  ('project_guru', 'Project Guru', 'Completed all module projects', '🏆', 'achievement', 1000, 'legendary'),
  ('helping_hand', 'Helping Hand', 'Shared code with classmates', '🤝', 'social', 150, 'common');

-- ============================================
-- SEED DATA: DAILY CHALLENGES
-- ============================================

INSERT OR IGNORE INTO daily_challenges (title, description, challenge_date, xp_reward, difficulty, challenge_type) VALUES
  ('Complete 3 Lessons', 'Complete any 3 lessons today', date('now'), 50, 'easy', 'learning'),
  ('Perfect Score Challenge', 'Get 100% on any test', date('now'), 100, 'hard', 'quiz'),
  ('Code Review', 'Review and comment on 2 peer code submissions', date('now'), 75, 'medium', 'social'),
  ('Study Sprint', 'Study for 2 consecutive hours', date('now'), 100, 'medium', 'learning');
