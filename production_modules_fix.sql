-- Create modules for Grade 1, 2, and 3 (KG already exists)
INSERT OR IGNORE INTO curriculum_modules (grade_id, module_number, title, description, theme, total_sessions) VALUES
  (2, 1, 'Little Engineers - Complete Grade 1 Journey', 'Full year electronics and Arduino curriculum for Grade 1', 'Little Engineers', 48),
  (3, 1, 'Smart Robots - Complete Grade 2 Journey', 'Full year sensors and automation curriculum for Grade 2', 'Smart Robots', 48);
