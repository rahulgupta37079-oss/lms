-- Add Sample Zoom Live Sessions for Phase 1 (KG-2)
-- Replace meeting URLs with actual Zoom links before production use

-- Kindergarten Live Sessions (Module ID 1)
INSERT OR IGNORE INTO live_sessions (module_id, title, description, session_date, duration_minutes, meeting_url) VALUES
  (1, 'KG Week 1: What is a Robot?', 'Interactive introduction to robots with show and tell', '2025-01-20 10:00:00', 60, 'https://zoom.us/j/1234567890?pwd=kg_week1'),
  (1, 'KG Week 2: Robot Parts', 'Learning about robot components', '2025-01-27 10:00:00', 60, 'https://zoom.us/j/1234567891?pwd=kg_week2'),
  (1, 'KG Week 3: Colors and Lights', 'Fun with LED lights', '2025-02-03 10:00:00', 60, 'https://zoom.us/j/1234567892?pwd=kg_week3'),
  (1, 'KG Week 4: Build Your First Robot', 'PROJECT: Guided robot building', '2025-02-10 10:00:00', 90, 'https://zoom.us/j/1234567893?pwd=kg_week4');

-- Grade 1 Live Sessions (Module ID 2)
INSERT OR IGNORE INTO live_sessions (module_id, title, description, session_date, duration_minutes, meeting_url) VALUES
  (2, 'Grade 1 Week 1: Introduction to Electricity', 'Learn about electrical circuits and safety', '2025-01-20 14:00:00', 90, 'https://zoom.us/j/9876543210?pwd=g1_week1'),
  (2, 'Grade 1 Week 2: Circuits & Conductors', 'Building basic circuits', '2025-01-27 14:00:00', 90, 'https://zoom.us/j/9876543211?pwd=g1_week2'),
  (2, 'Grade 1 Week 3: Switches & Control', 'Controlling electrical flow', '2025-02-03 14:00:00', 90, 'https://zoom.us/j/9876543212?pwd=g1_week3'),
  (2, 'Grade 1 Week 4: PROJECT Light Switch', 'Build simple switch circuit', '2025-02-10 14:00:00', 120, 'https://zoom.us/j/9876543213?pwd=g1_week4');

-- Grade 2 Live Sessions (Module ID 3)
INSERT OR IGNORE INTO live_sessions (module_id, title, description, session_date, duration_minutes, meeting_url) VALUES
  (3, 'Grade 2 Week 1: Advanced Touch Sensors', 'Deep dive into touch sensing technology', '2025-01-20 16:00:00', 90, 'https://zoom.us/j/5555555555?pwd=g2_week1'),
  (3, 'Grade 2 Week 2: Light Sensors & LDR', 'Working with light dependent resistors', '2025-01-27 16:00:00', 90, 'https://zoom.us/j/5555555556?pwd=g2_week2'),
  (3, 'Grade 2 Week 3: Sound Level Detection', 'Measuring sound intensity', '2025-02-03 16:00:00', 90, 'https://zoom.us/j/5555555557?pwd=g2_week3'),
  (3, 'Grade 2 Week 4: PROJECT Touch Lamp', 'Build touch-activated LED lamp', '2025-02-10 16:00:00', 120, 'https://zoom.us/j/5555555558?pwd=g2_week4');
