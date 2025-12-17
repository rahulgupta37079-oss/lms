-- Insert MCQs for Lesson 1 (Introduction to IoT)
INSERT OR IGNORE INTO lesson_mcqs (id, lesson_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index) VALUES 
  (1, 1, 'What does IoT stand for?', 'Internet of Things', 'Integration of Technology', 'Internal of Transactions', 'Internet of Transactions', 'A', 'IoT stands for Internet of Things - a network of physical devices connected to the internet.', 1),
  (2, 1, 'Which protocol is commonly used in IoT devices?', 'FTP', 'MQTT', 'SMTP', 'POP3', 'B', 'MQTT (Message Queuing Telemetry Transport) is a lightweight protocol designed for IoT devices.', 2),
  (3, 1, 'What is the main advantage of IoT?', 'Increased cost', 'Automation and efficiency', 'More complexity', 'Less connectivity', 'B', 'IoT enables automation, real-time monitoring, and improved efficiency across various applications.', 3),
  (4, 1, 'Which layer is NOT part of IoT architecture?', 'Perception Layer', 'Network Layer', 'Database Layer', 'Application Layer', 'C', 'Standard IoT architecture has Perception, Network, and Application layers. Database is part of Application layer.', 4),
  (5, 1, 'What type of sensor measures temperature?', 'Accelerometer', 'Thermistor', 'Gyroscope', 'Magnetometer', 'B', 'A thermistor is a temperature-sensitive resistor used for measuring temperature.', 5);

-- Insert MCQs for Lesson 2 (Robotics Overview)
INSERT OR IGNORE INTO lesson_mcqs (id, lesson_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index) VALUES 
  (6, 2, 'What are the three main components of a robot?', 'Sensors, Actuators, Controller', 'Motor, Battery, Wheels', 'Camera, Speaker, Microphone', 'Processor, Memory, Storage', 'A', 'Every robot consists of sensors (input), actuators (output), and a controller (processing).', 1),
  (7, 2, 'Which type of robot is used in manufacturing?', 'Humanoid Robot', 'Industrial Robot', 'Service Robot', 'Mobile Robot', 'B', 'Industrial robots are specifically designed for manufacturing and assembly tasks.', 2),
  (8, 2, 'What is an actuator?', 'Input device', 'Output device that causes motion', 'Processing unit', 'Memory storage', 'B', 'An actuator converts electrical signals into physical motion (motors, servos, etc.).', 3);

-- Insert mentors
INSERT OR IGNORE INTO mentors (id, email, password, full_name, phone, specialization) VALUES 
  (1, 'mentor@passionbots.in', 'mentor123', 'Dr. Rajesh Kumar', '+91 9876543210', 'IoT & Embedded Systems'),
  (2, 'sarah@passionbots.in', 'mentor123', 'Sarah Johnson', '+91 9123456789', 'Robotics & AI'),
  (3, 'amit@passionbots.in', 'mentor123', 'Amit Patel', '+91 9988776655', 'Cloud & Data Analytics');

-- Assign mentors to students
INSERT OR IGNORE INTO student_mentor_mapping (student_id, mentor_id) VALUES 
  (1, 1),
  (2, 2),
  (3, 1);

-- Insert live tests
INSERT OR IGNORE INTO live_tests (id, module_id, title, description, duration_minutes, total_marks, passing_marks, start_time, end_time) VALUES 
  (1, 1, 'IoT Fundamentals Quiz', 'Test your understanding of IoT basics and architecture', 30, 100, 60, '2026-01-20 10:00:00', '2026-01-20 23:59:59'),
  (2, 2, 'ESP32 Basics Assessment', 'Evaluate your knowledge of ESP32 microcontroller', 45, 100, 60, '2026-01-28 10:00:00', '2026-01-28 23:59:59'),
  (3, 3, 'Programming Fundamentals Test', 'Comprehensive test on C/C++ and ESP32 programming', 60, 150, 90, '2026-02-10 10:00:00', '2026-02-10 23:59:59');

-- Insert test questions for Test 1
INSERT OR IGNORE INTO test_questions (id, test_id, question, option_a, option_b, option_c, option_d, correct_answer, marks, order_index) VALUES 
  (1, 1, 'What is the primary purpose of IoT?', 'Entertainment', 'Connecting physical devices to internet for data exchange', 'Gaming', 'Social networking', 'B', 10, 1),
  (2, 1, 'Which of these is an IoT application?', 'Word Processing', 'Smart Home Automation', 'Video Editing', 'Photo Editing', 'B', 10, 2),
  (3, 1, 'What does MQTT stand for?', 'Message Queue Telemetry Transport', 'Multiple Query Text Transfer', 'Modern Quality Test Tool', 'Managed Query Transaction Type', 'A', 10, 3),
  (4, 1, 'Which layer in IoT architecture handles data processing?', 'Physical Layer', 'Network Layer', 'Application Layer', 'Transport Layer', 'C', 10, 4),
  (5, 1, 'What is a sensor in IoT context?', 'Output device', 'Input device that measures physical properties', 'Storage device', 'Display device', 'B', 10, 5),
  (6, 1, 'Which protocol is best for low-power IoT devices?', 'HTTP', 'FTP', 'MQTT', 'SMTP', 'C', 10, 6),
  (7, 1, 'What is edge computing in IoT?', 'Processing data at the edge of network near source', 'Computing at data center', 'Cloud computing', 'Distributed computing', 'A', 10, 7),
  (8, 1, 'Which wireless technology has longest range?', 'Bluetooth', 'WiFi', 'LoRaWAN', 'NFC', 'C', 10, 8),
  (9, 1, 'What is the purpose of actuators in IoT?', 'Sense data', 'Convert electrical signals to physical action', 'Store data', 'Display data', 'B', 10, 9),
  (10, 1, 'Which is NOT a benefit of IoT?', 'Automation', 'Real-time monitoring', 'Increased security risks', 'Improved efficiency', 'C', 10, 10);

-- Insert badges
INSERT OR IGNORE INTO badges (id, name, description, icon, criteria) VALUES 
  (1, 'First Steps', 'Complete your first lesson', '👶', 'Complete 1 lesson'),
  (2, 'Quick Learner', 'Complete 5 lessons in a day', '⚡', 'Complete 5 lessons in 24 hours'),
  (3, 'Module Master', 'Complete an entire module', '🎓', 'Complete all lessons in a module'),
  (4, 'Perfect Score', 'Score 100% in a test', '💯', 'Get full marks in any test'),
  (5, 'Test Taker', 'Complete 5 tests', '📝', 'Complete 5 live tests'),
  (6, 'Assignment Pro', 'Submit 10 assignments', '📄', 'Submit 10 assignments'),
  (7, 'Community Helper', 'Help 10 students in forum', '🤝', 'Get 10 solution marks in forum'),
  (8, 'Streak Master', '7 day learning streak', '🔥', 'Learn for 7 consecutive days'),
  (9, 'Early Bird', 'Complete module before deadline', '🐦', 'Complete module early'),
  (10, 'Certificate Earner', 'Earn your first certificate', '🏆', 'Complete program and earn certificate');

-- Award some badges to demo student
INSERT OR IGNORE INTO student_badges (student_id, badge_id, earned_at) VALUES 
  (1, 1, '2025-12-15 10:30:00'),
  (1, 3, '2025-12-17 14:20:00');

-- Insert sample messages
INSERT OR IGNORE INTO messages (sender_id, sender_type, receiver_id, receiver_type, subject, message) VALUES 
  (1, 'mentor', 1, 'student', 'Welcome to the Program!', 'Hi Demo Student! Welcome to PassionBots IoT & Robotics Internship. I am your assigned mentor. Feel free to reach out if you have any questions.'),
  (1, 'student', 1, 'mentor', 'RE: Welcome to the Program!', 'Thank you for the warm welcome! Looking forward to learning from you.'),
  (1, 'student', 1, 'mentor', 'Question about ESP32', 'I am having trouble setting up the Arduino IDE for ESP32. Can you help?');

-- Initialize student rankings
INSERT OR IGNORE INTO student_rankings (student_id, total_score, tests_completed, assignments_completed, lessons_completed, rank_position) VALUES 
  (1, 950, 2, 5, 8, 1),
  (2, 780, 1, 3, 5, 2),
  (3, 650, 1, 2, 4, 3);

-- Insert notifications
INSERT OR IGNORE INTO notifications (user_id, user_type, title, message, type, link) VALUES 
  (1, 'student', 'New Test Available', 'IoT Fundamentals Quiz is now open. Duration: 30 minutes', 'info', '/tests/1'),
  (1, 'student', 'Assignment Graded', 'Your Module 1 assignment has been graded. Score: 95/100', 'success', '/assignments/1'),
  (1, 'student', 'Live Session Tomorrow', 'ESP32 Setup Workshop starts tomorrow at 6:00 PM', 'warning', '/sessions/3'),
  (1, 'student', 'New Badge Earned!', 'Congratulations! You earned the "Module Master" badge', 'success', '/achievements');

-- Sample certificate template
INSERT OR IGNORE INTO certificate_templates (id, name, type, template_html) VALUES 
  (1, 'Internship Certificate', 'internship', '<html><body>Certificate of Completion...</body></html>'),
  (2, 'Skill Mastery Certificate', 'skill', '<html><body>Certificate of Skill Mastery...</body></html>');
