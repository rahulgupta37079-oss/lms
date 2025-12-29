-- Zoom Integration Tables
-- ============================================

-- Store Zoom OAuth tokens for mentors
CREATE TABLE IF NOT EXISTS zoom_tokens (
  token_id INTEGER PRIMARY KEY AUTOINCREMENT,
  mentor_id INTEGER NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mentor_id) REFERENCES mentors(mentor_id),
  UNIQUE(mentor_id)
);

-- Store scheduled Zoom meetings
CREATE TABLE IF NOT EXISTS zoom_meetings (
  meeting_id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  mentor_id INTEGER NOT NULL,
  zoom_meeting_id TEXT NOT NULL,
  meeting_url TEXT NOT NULL,
  join_url TEXT NOT NULL,
  start_url TEXT NOT NULL,
  start_time DATETIME NOT NULL,
  duration INTEGER NOT NULL,
  status TEXT DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
  recording_status TEXT DEFAULT 'pending', -- pending, processing, available, failed
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES live_sessions(session_id),
  FOREIGN KEY (mentor_id) REFERENCES mentors(mentor_id),
  UNIQUE(zoom_meeting_id)
);

-- Store Zoom recording files
CREATE TABLE IF NOT EXISTS zoom_recordings (
  recording_id INTEGER PRIMARY KEY AUTOINCREMENT,
  meeting_id INTEGER NOT NULL,
  file_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- MP4, M4A
  file_size INTEGER,
  r2_key TEXT, -- Cloudflare R2 storage key
  download_url TEXT,
  duration INTEGER,
  status TEXT DEFAULT 'processing', -- processing, available, deleted
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (meeting_id) REFERENCES zoom_meetings(meeting_id),
  UNIQUE(file_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_zoom_tokens_mentor ON zoom_tokens(mentor_id);
CREATE INDEX IF NOT EXISTS idx_zoom_meetings_session ON zoom_meetings(session_id);
CREATE INDEX IF NOT EXISTS idx_zoom_meetings_mentor ON zoom_meetings(mentor_id);
CREATE INDEX IF NOT EXISTS idx_zoom_meetings_status ON zoom_meetings(status);
CREATE INDEX IF NOT EXISTS idx_zoom_recordings_meeting ON zoom_recordings(meeting_id);
CREATE INDEX IF NOT EXISTS idx_zoom_recordings_status ON zoom_recordings(status);
