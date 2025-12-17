-- Seed data for PassionBots LMS

-- Insert demo student
INSERT OR IGNORE INTO students (id, email, password, full_name, phone, university, enrollment_date, program_type, batch_start_date) VALUES 
  (1, 'demo@student.com', 'demo123', 'Demo Student', '+91 9876543210', 'IIT Delhi', '2025-12-01', 'premium', '2026-01-10'),
  (2, 'john@example.com', 'pass123', 'John Doe', '+91 9123456789', 'NIT Trichy', '2025-12-05', 'learning', '2026-01-10'),
  (3, 'priya@example.com', 'pass123', 'Priya Sharma', '+91 9988776655', 'BITS Pilani', '2025-12-10', 'premium', '2026-01-10');

-- Insert 8 modules from curriculum
INSERT OR IGNORE INTO modules (id, module_number, title, description, duration_weeks, order_index) VALUES 
  (1, 1, 'IoT & Robotics Fundamentals', 'What is IoT & robotics, real-world applications, ecosystem overview, hardware-software integration', 1, 1),
  (2, 2, 'ESP32 Microcontroller Basics', 'ESP32 architecture, Arduino IDE setup, pin configuration, first hardware project implementation', 1, 2),
  (3, 3, 'ESP32 Programming', 'C/C++ fundamentals, digital/analog I/O operations, UART, SPI, and I2C communication protocols', 2, 3),
  (4, 4, 'Wireless & IoT Protocols', 'WiFi, Bluetooth, Zigbee technologies, MQTT and HTTP protocols, cloud connectivity basics', 2, 4),
  (5, 5, 'Sensors & Actuators', 'Temperature, proximity, IR, ultrasonic sensors; DC motors, servo motors, stepper motors', 2, 5),
  (6, 6, 'Cloud Platforms & Data', 'AWS IoT, Adafruit IO, Google Cloud IoT, data acquisition, storage, visualization, dashboards', 1, 6),
  (7, 7, 'Capstone Project', 'Design and build a major IoT-Robotics project, one-on-one mentor guidance, testing and deployment', 2, 7),
  (8, 8, 'Career & Certification', 'Resume building, portfolio optimization, dual certificates, career opportunities, alumni network', 1, 8);

-- Insert sample lessons for Module 1
INSERT OR IGNORE INTO lessons (id, module_id, lesson_number, title, description, duration_minutes, order_index) VALUES 
  (1, 1, 1, 'Introduction to IoT', 'Understanding Internet of Things and its real-world applications', 45, 1),
  (2, 1, 2, 'Robotics Overview', 'Introduction to robotics, types of robots, and their applications', 45, 2),
  (3, 1, 3, 'IoT Ecosystem', 'Hardware, software, connectivity, and cloud platforms in IoT', 60, 3),
  (4, 1, 4, 'Hardware-Software Integration', 'How hardware and software work together in IoT systems', 45, 4);

-- Insert sample lessons for Module 2
INSERT OR IGNORE INTO lessons (id, module_id, lesson_number, title, description, duration_minutes, order_index) VALUES 
  (5, 2, 1, 'ESP32 Architecture', 'Understanding ESP32 dual-core processor, WiFi, and Bluetooth capabilities', 60, 1),
  (6, 2, 2, 'Arduino IDE Setup', 'Installing and configuring Arduino IDE for ESP32 development', 30, 2),
  (7, 2, 3, 'Pin Configuration', 'GPIO pins, power pins, and peripheral interfaces on ESP32', 45, 3),
  (8, 2, 4, 'First Hardware Project', 'Building your first LED blinking project with ESP32', 60, 4);

-- Insert sample lessons for Module 3
INSERT OR IGNORE INTO lessons (id, module_id, lesson_number, title, description, duration_minutes, order_index) VALUES 
  (9, 3, 1, 'C/C++ Fundamentals', 'Variables, data types, operators, and control structures', 90, 1),
  (10, 3, 2, 'Digital I/O Operations', 'Reading and writing digital signals with ESP32', 60, 2),
  (11, 3, 3, 'Analog I/O Operations', 'ADC and PWM operations for analog signals', 60, 3),
  (12, 3, 4, 'UART Communication', 'Serial communication with UART protocol', 45, 4),
  (13, 3, 5, 'SPI & I2C Protocols', 'Understanding and implementing SPI and I2C communication', 60, 5);

-- Insert sample progress for demo student
INSERT OR IGNORE INTO student_progress (student_id, lesson_id, status, progress_percentage, completed_at) VALUES 
  (1, 1, 'completed', 100, '2025-12-15 10:30:00'),
  (1, 2, 'completed', 100, '2025-12-15 14:20:00'),
  (1, 3, 'completed', 100, '2025-12-16 11:45:00'),
  (1, 4, 'in_progress', 60, NULL),
  (1, 5, 'not_started', 0, NULL);

-- Insert sample assignments
INSERT OR IGNORE INTO assignments (id, module_id, title, description, due_date, max_score) VALUES 
  (1, 1, 'IoT Application Analysis', 'Research and present a real-world IoT application case study', '2026-01-20', 100),
  (2, 2, 'ESP32 LED Project', 'Build a traffic light system using ESP32 and LEDs', '2026-01-27', 100),
  (3, 3, 'Sensor Data Logger', 'Create a temperature and humidity data logger', '2026-02-10', 100);

-- Insert sample submission
INSERT OR IGNORE INTO submissions (id, assignment_id, student_id, submission_url, github_url, description, submitted_at, score, feedback, status) VALUES 
  (1, 1, 1, 'https://drive.google.com/file/xxx', 'https://github.com/demo/iot-case-study', 'Analyzed smart home automation system with detailed architecture', '2025-12-18 16:30:00', 95, 'Excellent analysis! Well structured presentation.', 'reviewed');

-- Insert sample live sessions
INSERT OR IGNORE INTO live_sessions (id, module_id, title, description, session_date, duration_minutes, meeting_url, is_completed) VALUES 
  (1, 1, 'Orientation & Welcome', 'Program overview, expectations, and getting started guide', '2026-01-10 18:00:00', 90, 'https://meet.google.com/abc-defg-hij', 0),
  (2, 1, 'IoT Fundamentals - Part 1', 'Deep dive into IoT concepts and real-world applications', '2026-01-12 18:00:00', 90, 'https://meet.google.com/abc-defg-hij', 0),
  (3, 2, 'ESP32 Setup Workshop', 'Hands-on session for Arduino IDE and ESP32 configuration', '2026-01-15 18:00:00', 120, 'https://meet.google.com/abc-defg-hij', 0);

-- Insert sample announcements
INSERT OR IGNORE INTO announcements (title, content, priority, published_at) VALUES 
  ('Welcome to PassionBots LMS!', 'We are excited to have you join our IoT & Robotics Internship program. Check your dashboard for upcoming sessions and course materials.', 'high', '2025-12-15 09:00:00'),
  ('Hardware Kit Shipping Update', 'ESP32 kits will be shipped starting January 5th, 2026. Please ensure your delivery address is correct in your profile.', 'high', '2025-12-16 10:00:00'),
  ('First Live Session - January 10th', 'Our orientation session is scheduled for January 10th at 6:00 PM IST. Meeting link will be shared 24 hours before the session.', 'medium', '2025-12-17 11:00:00');

-- Insert hardware kit tracking
INSERT OR IGNORE INTO hardware_kits (student_id, kit_type, delivery_status, delivery_address) VALUES 
  (1, 'ESP32 Premium Kit', 'pending', '123 University Road, Delhi - 110001'),
  (3, 'ESP32 Premium Kit', 'pending', '456 Campus Avenue, Pilani - 333031');

-- Insert sample forum posts
INSERT OR IGNORE INTO forum_posts (id, student_id, module_id, lesson_id, title, content, views_count, created_at) VALUES 
  (1, 2, 1, 1, 'Difference between IoT and M2M?', 'Can someone explain the key differences between IoT and Machine-to-Machine communication?', 15, '2025-12-16 14:20:00'),
  (2, 1, 2, 5, 'ESP32 Board Not Detected', 'I am having trouble connecting my ESP32 board to Arduino IDE. It shows "Board not detected". Any solutions?', 8, '2025-12-17 10:45:00');

-- Insert sample forum replies
INSERT OR IGNORE INTO forum_replies (post_id, student_id, content, is_solution, created_at) VALUES 
  (1, 3, 'IoT is broader - it includes M2M but also adds cloud computing, data analytics, and human interaction. M2M is just device-to-device communication.', 1, '2025-12-16 15:30:00'),
  (2, 3, 'Try installing the CH340 driver for your ESP32 board. Also make sure you select the correct COM port in Arduino IDE.', 0, '2025-12-17 11:20:00');
