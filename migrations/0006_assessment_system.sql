-- =====================================================
-- PHASE 1 ASSESSMENT SYSTEM FOR KG-2
-- Complete assessment infrastructure with quizzes, tests, and evaluations
-- =====================================================

-- Assessment Templates Table
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

-- Assessment Questions Table
CREATE TABLE IF NOT EXISTS assessment_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assessment_id INTEGER NOT NULL,
  question_type TEXT NOT NULL CHECK(question_type IN ('mcq', 'true_false', 'short_answer', 'practical', 'drawing')),
  question_text TEXT NOT NULL,
  question_image_url TEXT,
  options TEXT, -- JSON array for MCQ options
  correct_answer TEXT NOT NULL,
  marks INTEGER DEFAULT 1,
  order_number INTEGER DEFAULT 1,
  explanation TEXT,
  FOREIGN KEY (assessment_id) REFERENCES assessment_templates(id)
);

-- Student Assessments Table (Individual attempts)
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
  graded_by INTEGER, -- mentor_id
  graded_at DATETIME,
  feedback TEXT,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (assessment_id) REFERENCES assessment_templates(id),
  FOREIGN KEY (session_id) REFERENCES curriculum_sessions(id),
  FOREIGN KEY (graded_by) REFERENCES mentors(id)
);

-- Student Answers Table
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

-- =====================================================
-- KINDERGARTEN ASSESSMENTS (Age 5-6)
-- =====================================================

-- KG Block 1: Introduction to Robots (Sessions 1-12)
INSERT INTO assessment_templates (grade_id, assessment_type, title, description, duration_minutes, total_marks, passing_marks, difficulty_level) VALUES
  (1, 'quiz', 'KG Block 1: Robot Recognition Quiz', 'Identify robots and their parts', 15, 10, 6, 'easy'),
  (1, 'practical', 'KG Block 1: Build Your First Robot', 'Hands-on robot building assessment', 30, 20, 12, 'easy');

-- KG Block 1 Quiz Questions
INSERT INTO assessment_questions (assessment_id, question_type, question_text, options, correct_answer, marks, order_number, explanation) VALUES
  (1, 'mcq', 'What is a robot?', '["A toy", "A machine that can move and do tasks", "A computer", "A phone"]', 'A machine that can move and do tasks', 1, 1, 'Robots are machines that can move and perform tasks automatically!'),
  (1, 'mcq', 'Which part helps a robot see?', '["Wheel", "Camera", "Battery", "Wire"]', 'Camera', 1, 2, 'Cameras are like robot eyes!'),
  (1, 'true_false', 'Robots need electricity to work', '["True", "False"]', 'True', 1, 3, 'Just like your toys need batteries, robots need electricity!'),
  (1, 'mcq', 'What helps a robot move?', '["Eyes", "Wheels or legs", "Camera", "Brain"]', 'Wheels or legs', 1, 4, 'Wheels and legs help robots move around!'),
  (1, 'mcq', 'Where does a robot get its power?', '["Water", "Battery", "Food", "Air"]', 'Battery', 1, 5, 'Batteries give robots the power they need!');

-- KG Block 2: Colors and Lights (Sessions 13-24)
INSERT INTO assessment_templates (grade_id, assessment_type, title, description, duration_minutes, total_marks, passing_marks, difficulty_level) VALUES
  (1, 'quiz', 'KG Block 2: Colors and Lights Quiz', 'Understanding LEDs and colors', 15, 10, 6, 'easy'),
  (1, 'practical', 'KG Block 2: Light Up Your Robot', 'Make LEDs blink in different colors', 30, 20, 12, 'easy');

-- KG Block 2 Quiz Questions
INSERT INTO assessment_questions (assessment_id, question_type, question_text, options, correct_answer, marks, order_number, explanation) VALUES
  (3, 'mcq', 'What is an LED?', '["A small light", "A battery", "A robot", "A wheel"]', 'A small light', 1, 1, 'LED is a tiny light that robots use!'),
  (3, 'mcq', 'How many main colors of light are there?', '["2", "3", "5", "10"]', '3', 1, 2, 'Red, Green, and Blue are the main colors!'),
  (3, 'true_false', 'LEDs can make different colors', '["True", "False"]', 'True', 1, 3, 'LEDs can make many beautiful colors!'),
  (3, 'mcq', 'What happens when we turn on an LED?', '["It moves", "It makes sound", "It lights up", "It stops"]', 'It lights up', 1, 4, 'When power goes to an LED, it shines bright!'),
  (3, 'mcq', 'Which color do we mix to make white light?', '["Only red", "Red, Green, and Blue", "Only blue", "Only green"]', 'Red, Green, and Blue', 1, 5, 'Mixing red, green, and blue makes white!');

-- KG Block 3: Sounds and Music (Sessions 25-36)
INSERT INTO assessment_templates (grade_id, assessment_type, title, description, duration_minutes, total_marks, passing_marks, difficulty_level) VALUES
  (1, 'quiz', 'KG Block 3: Sounds Quiz', 'Identifying sounds and buzzers', 15, 10, 6, 'easy'),
  (1, 'practical', 'KG Block 3: Make Your Robot Sing', 'Create sounds and simple melodies', 30, 20, 12, 'easy');

-- KG Block 3 Quiz Questions
INSERT INTO assessment_questions (assessment_id, question_type, question_text, options, correct_answer, marks, order_number, explanation) VALUES
  (5, 'mcq', 'What makes sound in a robot?', '["LED", "Buzzer", "Wheel", "Camera"]', 'Buzzer', 1, 1, 'Buzzers make beep beep sounds!'),
  (5, 'true_false', 'Robots can make music', '["True", "False"]', 'True', 1, 2, 'Robots can play songs just like your music player!'),
  (5, 'mcq', 'How do we make a buzzer louder?', '["Turn it off", "Give it more power", "Paint it", "Make it smaller"]', 'Give it more power', 1, 3, 'More power makes the buzzer louder!'),
  (5, 'mcq', 'What is a melody?', '["A type of robot", "A series of musical notes", "A light", "A battery"]', 'A series of musical notes', 1, 4, 'A melody is like a song with different notes!'),
  (5, 'mcq', 'Can a robot play your favorite song?', '["No, never", "Yes, if we program it", "Only on Sundays", "Only small songs"]', 'Yes, if we program it', 1, 5, 'We can teach robots to play any song!');

-- KG Block 4: Final Project (Sessions 37-48)
INSERT INTO assessment_templates (grade_id, assessment_type, title, description, duration_minutes, total_marks, passing_marks, difficulty_level) VALUES
  (1, 'project', 'KG Final Project: My Robot Friend', 'Complete robot project assessment', 60, 50, 30, 'medium'),
  (1, 'test', 'KG Final Assessment', 'Complete KG robotics knowledge test', 30, 20, 12, 'easy');

-- KG Final Test Questions
INSERT INTO assessment_questions (assessment_id, question_type, question_text, options, correct_answer, marks, order_number, explanation) VALUES
  (8, 'mcq', 'What powers a robot?', '["Water", "Battery/Electricity", "Food", "Sunshine only"]', 'Battery/Electricity', 2, 1, 'Robots need electricity to work!'),
  (8, 'mcq', 'Which part makes a robot light up?', '["Buzzer", "LED", "Motor", "Battery"]', 'LED', 2, 2, 'LEDs are the lights on robots!'),
  (8, 'mcq', 'What makes sound in a robot?', '["LED", "Wheel", "Buzzer/Speaker", "Camera"]', 'Buzzer/Speaker', 2, 3, 'Buzzers and speakers make sounds!'),
  (8, 'mcq', 'How does a robot move?', '["With wheels or motors", "By magic", "By talking", "By sleeping"]', 'With wheels or motors', 2, 4, 'Motors and wheels help robots move!'),
  (8, 'true_false', 'Robots can help people', '["True", "False"]', 'True', 2, 5, 'Robots are helpful friends to people!'),
  (8, 'mcq', 'What do we call instructions for a robot?', '["Food", "Program/Code", "Paint", "Wheels"]', 'Program/Code', 2, 6, 'Programs tell robots what to do!'),
  (8, 'true_false', 'We can make robots at home', '["True", "False"]', 'True', 2, 7, 'Yes! You can build robots with simple parts!'),
  (8, 'mcq', 'What is the brain of a robot called?', '["Battery", "Wheel", "Microcontroller", "LED"]', 'Microcontroller', 2, 8, 'The microcontroller is like a robot\'s brain!'),
  (8, 'mcq', 'Can robots learn new things?', '["No, never", "Yes, we can teach them", "Only big robots", "Only on weekends"]', 'Yes, we can teach them', 2, 9, 'We can program robots to learn new tasks!'),
  (8, 'true_false', 'Making robots is fun!', '["True", "False"]', 'True', 2, 10, 'Building and programming robots is super fun!');

-- =====================================================
-- GRADE 1 ASSESSMENTS (Age 6-7)
-- =====================================================

-- Grade 1 Block 1: Basic Electronics (Sessions 1-12)
INSERT INTO assessment_templates (grade_id, assessment_type, title, description, duration_minutes, total_marks, passing_marks, difficulty_level) VALUES
  (2, 'quiz', 'Grade 1 Block 1: Electronics Basics Quiz', 'Understanding electricity and circuits', 20, 15, 9, 'easy'),
  (2, 'practical', 'Grade 1 Block 1: Build Simple Circuits', 'Hands-on circuit building', 40, 25, 15, 'easy');

-- Grade 1 Block 1 Quiz Questions
INSERT INTO assessment_questions (assessment_id, question_type, question_text, options, correct_answer, marks, order_number, explanation) VALUES
  (9, 'mcq', 'What is electricity?', '["Water flow", "Energy that powers devices", "A type of food", "A color"]', 'Energy that powers devices', 2, 1, 'Electricity is energy that makes things work!'),
  (9, 'mcq', 'What is a circuit?', '["A round shape", "A path for electricity to flow", "A type of battery", "A robot part"]', 'A path for electricity to flow', 2, 2, 'A circuit is like a road for electricity!'),
  (9, 'true_false', 'A circuit must be complete for electricity to flow', '["True", "False"]', 'True', 2, 3, 'The circuit must be closed like a circle!'),
  (9, 'mcq', 'What connects parts in a circuit?', '["Water", "Wires", "Paper", "Wood"]', 'Wires', 2, 4, 'Wires are like roads that connect circuit parts!'),
  (9, 'mcq', 'What is a resistor?', '["A part that stores energy", "A part that limits current flow", "A type of battery", "A light"]', 'A part that limits current flow', 2, 5, 'Resistors control how much electricity flows!'),
  (9, 'mcq', 'What provides power in a circuit?', '["Resistor", "LED", "Battery", "Wire"]', 'Battery', 1, 6, 'Batteries give circuits the power they need!');

-- Grade 1 Block 2: Arduino Basics (Sessions 13-24)
INSERT INTO assessment_templates (grade_id, assessment_type, title, description, duration_minutes, total_marks, passing_marks, difficulty_level) VALUES
  (2, 'quiz', 'Grade 1 Block 2: Arduino Introduction Quiz', 'Understanding Arduino board', 20, 15, 9, 'medium'),
  (2, 'practical', 'Grade 1 Block 2: First Arduino Program', 'Write and upload first Arduino code', 40, 25, 15, 'medium');

-- Grade 1 Block 2 Quiz Questions
INSERT INTO assessment_questions (assessment_id, question_type, question_text, options, correct_answer, marks, order_number, explanation) VALUES
  (11, 'mcq', 'What is Arduino?', '["A toy", "A small computer board for projects", "A game", "A battery"]', 'A small computer board for projects', 2, 1, 'Arduino is a mini computer for making cool projects!'),
  (11, 'mcq', 'What language do we use with Arduino?', '["English", "C/C++", "Spanish", "Math"]', 'C/C++', 2, 2, 'Arduino uses C/C++ programming language!'),
  (11, 'true_false', 'Arduino can control LEDs and motors', '["True", "False"]', 'True', 2, 3, 'Arduino can control many electronic parts!'),
  (11, 'mcq', 'What do we call the holes on Arduino where we connect wires?', '["Doors", "Pins", "Windows", "Batteries"]', 'Pins', 2, 4, 'Pins are connection points on Arduino!'),
  (11, 'mcq', 'How do we send a program to Arduino?', '["Shout at it", "Upload through USB", "Write on it", "Throw it"]', 'Upload through USB', 2, 5, 'We upload programs via USB cable!');

-- Grade 1 Block 3: Sensors and Movement (Sessions 25-36)
INSERT INTO assessment_templates (grade_id, assessment_type, title, description, duration_minutes, total_marks, passing_marks, difficulty_level) VALUES
  (2, 'quiz', 'Grade 1 Block 3: Sensors Quiz', 'Understanding basic sensors', 20, 15, 9, 'medium'),
  (2, 'practical', 'Grade 1 Block 3: Sensor Projects', 'Use sensors in Arduino projects', 40, 25, 15, 'medium');

-- Grade 1 Block 3 Quiz Questions
INSERT INTO assessment_questions (assessment_id, question_type, question_text, options, correct_answer, marks, order_number, explanation) VALUES
  (13, 'mcq', 'What is a sensor?', '["A type of battery", "A device that detects things", "A wire", "A program"]', 'A device that detects things', 2, 1, 'Sensors detect things like light, sound, or movement!'),
  (13, 'mcq', 'What does an ultrasonic sensor measure?', '["Color", "Distance", "Time", "Temperature"]', 'Distance', 2, 2, 'Ultrasonic sensors measure how far away things are!'),
  (13, 'true_false', 'An IR sensor can detect objects', '["True", "False"]', 'True', 2, 3, 'IR sensors detect objects using infrared light!'),
  (13, 'mcq', 'What makes a robot move?', '["LED", "Speaker", "Motor", "Sensor"]', 'Motor', 2, 4, 'Motors give robots the power to move!'),
  (13, 'mcq', 'What is a servo motor?', '["A type of battery", "A motor that can move to specific positions", "A sensor", "A wire"]', 'A motor that can move to specific positions', 2, 5, 'Servo motors can move to exact positions!');

-- Grade 1 Block 4: Final Project (Sessions 37-48)
INSERT INTO assessment_templates (grade_id, assessment_type, title, description, duration_minutes, total_marks, passing_marks, difficulty_level) VALUES
  (2, 'project', 'Grade 1 Final Project: Line Following Robot', 'Build complete line following robot', 90, 50, 30, 'medium'),
  (2, 'test', 'Grade 1 Final Assessment', 'Complete Grade 1 robotics test', 40, 30, 18, 'medium');

-- Grade 1 Final Test Questions
INSERT INTO assessment_questions (assessment_id, question_type, question_text, options, correct_answer, marks, order_number, explanation) VALUES
  (16, 'mcq', 'What is a microcontroller?', '["A remote control", "A small computer chip", "A type of motor", "A battery"]', 'A small computer chip', 2, 1, 'Microcontrollers are tiny computers!'),
  (16, 'mcq', 'What connects all parts in a circuit?', '["Air", "Wires/Conductors", "Paper", "Wood"]', 'Wires/Conductors', 2, 2, 'Wires carry electricity between parts!'),
  (16, 'mcq', 'What does pinMode() do in Arduino?', '["Turns LED on", "Sets pin as input or output", "Plays music", "Stops the program"]', 'Sets pin as input or output', 3, 3, 'pinMode() tells Arduino how to use each pin!'),
  (16, 'true_false', 'digitalWrite() can turn an LED on or off', '["True", "False"]', 'True', 2, 4, 'digitalWrite() controls digital pins like LEDs!'),
  (16, 'mcq', 'What reads sensor values in Arduino?', '["digitalWrite()", "analogRead()", "pinMode()", "delay()"]', 'analogRead()', 3, 5, 'analogRead() reads analog sensor values!'),
  (16, 'mcq', 'How do we make a motor spin?', '["Give it electricity", "Talk to it", "Paint it", "Shake it"]', 'Give it electricity', 2, 6, 'Motors need electricity to spin!'),
  (16, 'true_false', 'Sensors help robots understand their environment', '["True", "False"]', 'True', 2, 7, 'Sensors are like robot senses!'),
  (16, 'mcq', 'What is PWM used for?', '["Turning things on/off", "Controlling speed/brightness", "Measuring distance", "Playing sounds"]', 'Controlling speed/brightness', 3, 8, 'PWM controls motor speed and LED brightness!'),
  (16, 'mcq', 'What does a line following robot follow?', '["The sun", "A black line on white surface", "Your hand", "Other robots"]', 'A black line on white surface', 2, 9, 'Line followers track dark lines!'),
  (16, 'mcq', 'Why do we need loops in programming?', '["To make mistakes", "To repeat actions", "To stop the program", "To delete code"]', 'To repeat actions', 3, 10, 'Loops let us repeat code multiple times!');

-- =====================================================
-- GRADE 2 ASSESSMENTS (Age 7-8)
-- =====================================================

-- Grade 2 Block 1: Advanced Sensors (Sessions 1-12)
INSERT INTO assessment_templates (grade_id, assessment_type, title, description, duration_minutes, total_marks, passing_marks, difficulty_level) VALUES
  (3, 'quiz', 'Grade 2 Block 1: Advanced Sensors Quiz', 'Understanding multiple sensor types', 25, 20, 12, 'medium'),
  (3, 'practical', 'Grade 2 Block 1: Multi-Sensor Project', 'Build project with multiple sensors', 50, 30, 18, 'medium');

-- Grade 2 Block 1 Quiz Questions
INSERT INTO assessment_questions (assessment_id, question_type, question_text, options, correct_answer, marks, order_number, explanation) VALUES
  (17, 'mcq', 'What does LDR stand for?', '["Light Detecting Robot", "Light Dependent Resistor", "LED Diode Resistor", "Long Distance Radar"]', 'Light Dependent Resistor', 2, 1, 'LDR resistance changes with light!'),
  (17, 'mcq', 'What does a DHT sensor measure?', '["Distance", "Temperature and Humidity", "Sound", "Color"]', 'Temperature and Humidity', 2, 2, 'DHT sensors measure temp and humidity!'),
  (17, 'mcq', 'What is PIR sensor used for?', '["Measuring temperature", "Detecting motion", "Playing music", "Measuring distance"]', 'Detecting motion', 2, 3, 'PIR sensors detect movement!'),
  (17, 'true_false', 'Touch sensors can detect pressure', '["True", "False"]', 'True', 2, 4, 'Touch sensors sense when pressed!'),
  (17, 'mcq', 'How does an ultrasonic sensor measure distance?', '["Using light", "Using sound waves", "Using temperature", "Using color"]', 'Using sound waves', 3, 5, 'Ultrasonic uses sound waves like bats!'),
  (17, 'mcq', 'What unit does a distance sensor typically report in?', '["Degrees", "Centimeters", "Volts", "Percent"]', 'Centimeters', 2, 6, 'Distance is measured in cm or inches!'),
  (17, 'true_false', 'Gas sensors can detect air quality', '["True", "False"]', 'True', 2, 7, 'Gas sensors detect harmful gases!'),
  (17, 'mcq', 'What is a tilt sensor used for?', '["Measuring speed", "Detecting orientation/angle", "Making sound", "Measuring light"]', 'Detecting orientation/angle', 2, 8, 'Tilt sensors know which way is up!');

-- Grade 2 Block 2: Automation (Sessions 13-24)
INSERT INTO assessment_templates (grade_id, assessment_type, title, description, duration_minutes, total_marks, passing_marks, difficulty_level) VALUES
  (3, 'quiz', 'Grade 2 Block 2: Automation Quiz', 'Understanding automated systems', 25, 20, 12, 'medium'),
  (3, 'practical', 'Grade 2 Block 2: Smart Automation Project', 'Build automated control system', 50, 30, 18, 'medium');

-- Grade 2 Block 2 Quiz Questions
INSERT INTO assessment_questions (assessment_id, question_type, question_text, options, correct_answer, marks, order_number, explanation) VALUES
  (19, 'mcq', 'What is automation?', '["Manual control", "Making things work automatically", "Stopping machines", "Breaking robots"]', 'Making things work automatically', 2, 1, 'Automation means things work by themselves!'),
  (19, 'true_false', 'Automatic lights save energy', '["True", "False"]', 'True', 2, 2, 'Auto lights turn off when not needed!'),
  (19, 'mcq', 'What triggers an automatic door to open?', '["Voice", "Motion sensor", "Temperature", "Color"]', 'Motion sensor', 2, 3, 'Motion sensors detect people approaching!'),
  (19, 'mcq', 'What is a thermostat?', '["A temperature sensor", "A device that controls temperature", "A motor", "A speaker"]', 'A device that controls temperature', 2, 4, 'Thermostats keep temperature just right!'),
  (19, 'mcq', 'How can we make a fan turn on automatically?', '["Use a timer", "Use temperature sensor", "Both timer and sensor", "Never possible"]', 'Both timer and sensor', 3, 5, 'We can use sensors or timers for automation!'),
  (19, 'true_false', 'Robots can water plants automatically', '["True", "False"]', 'True', 2, 6, 'Moisture sensors can trigger watering!'),
  (19, 'mcq', 'What does PID control help with?', '["Turning things on/off", "Maintaining steady control", "Playing music", "Measuring distance"]', 'Maintaining steady control', 3, 7, 'PID keeps things stable and accurate!');

-- Grade 2 Block 3: Communication (Sessions 25-36)
INSERT INTO assessment_templates (grade_id, assessment_type, title, description, duration_minutes, total_marks, passing_marks, difficulty_level) VALUES
  (3, 'quiz', 'Grade 2 Block 3: Communication Quiz', 'Wireless and wired communication', 25, 20, 12, 'medium'),
  (3, 'practical', 'Grade 2 Block 3: Communication Project', 'Build robot with remote control', 50, 30, 18, 'hard');

-- Grade 2 Block 3 Quiz Questions
INSERT INTO assessment_questions (assessment_id, question_type, question_text, options, correct_answer, marks, order_number, explanation) VALUES
  (21, 'mcq', 'What is UART?', '["A type of motor", "A serial communication protocol", "A sensor", "A battery"]', 'A serial communication protocol', 2, 1, 'UART lets devices talk to each other!'),
  (21, 'mcq', 'What does IR stand for?', '["Internet Radio", "Infrared", "Internal Resistor", "Instant Relay"]', 'Infrared', 2, 2, 'Infrared is invisible light for communication!'),
  (21, 'true_false', 'Bluetooth uses wires to communicate', '["True", "False"]', 'False', 2, 3, 'Bluetooth is wireless communication!'),
  (21, 'mcq', 'What is the maximum Bluetooth range typically?', '["1 meter", "10-100 meters", "1 kilometer", "Unlimited"]', '10-100 meters', 2, 4, 'Bluetooth works within about 10-100 meters!'),
  (21, 'mcq', 'What can we use to display information?', '["Motor", "Speaker", "LCD/OLED screen", "Battery"]', 'LCD/OLED screen', 2, 5, 'Screens show text and graphics!'),
  (21, 'true_false', 'Data logging means recording sensor values over time', '["True", "False"]', 'True', 2, 6, 'Data logging saves information for later!'),
  (21, 'mcq', 'What is an alarm system for?', '["Playing music", "Security and alerts", "Charging batteries", "Moving robots"]', 'Security and alerts', 2, 7, 'Alarm systems warn us of danger!');

-- Grade 2 Block 4: Final Project (Sessions 37-48)
INSERT INTO assessment_templates (grade_id, assessment_type, title, description, duration_minutes, total_marks, passing_marks, difficulty_level) VALUES
  (3, 'project', 'Grade 2 Final Project: Smart Automation System', 'Complete smart home/automation project', 120, 60, 36, 'hard'),
  (3, 'test', 'Grade 2 Final Assessment', 'Complete Grade 2 robotics test', 50, 40, 24, 'medium');

-- Grade 2 Final Test Questions
INSERT INTO assessment_questions (assessment_id, question_type, question_text, options, correct_answer, marks, order_number, explanation) VALUES
  (24, 'mcq', 'What is IoT?', '["Internet of Things - connected devices", "Internal Output Terminal", "Integrated Online Technology", "None"]', 'Internet of Things - connected devices', 3, 1, 'IoT connects devices to the internet!'),
  (24, 'mcq', 'Name three types of sensors we learned', '["LED, Battery, Wire", "Ultrasonic, PIR, DHT", "Arduino, Motor, Wheel", "USB, Button, Screen"]', 'Ultrasonic, PIR, DHT', 3, 2, 'We learned many sensor types!'),
  (24, 'true_false', 'Automation can make our lives easier', '["True", "False"]', 'True', 2, 3, 'Automation saves time and effort!'),
  (24, 'mcq', 'What is the purpose of a relay module?', '["Measure distance", "Control high power devices", "Display information", "Play sounds"]', 'Control high power devices', 3, 4, 'Relays safely switch big loads!'),
  (24, 'mcq', 'What does analogWrite() do in Arduino?', '["Read sensor", "Output PWM signal", "Print text", "Connect WiFi"]', 'Output PWM signal', 3, 5, 'analogWrite() creates variable output!'),
  (24, 'mcq', 'How can robots communicate wirelessly?', '["USB cable", "Bluetooth or WiFi", "Drawing pictures", "Making sounds"]', 'Bluetooth or WiFi', 3, 6, 'Wireless uses radio waves!'),
  (24, 'true_false', 'We can control robots with our phones', '["True", "False"]', 'True', 2, 7, 'Mobile apps can control robots!'),
  (24, 'mcq', 'What is machine learning in robotics?', '["Cleaning robots", "Robots learning from data", "Building robots", "Breaking robots"]', 'Robots learning from data', 3, 8, 'ML lets robots improve over time!'),
  (24, 'mcq', 'Why is documentation important?', '["It\'s not important", "Helps others understand your project", "Makes robots faster", "Breaks the code"]', 'Helps others understand your project', 3, 9, 'Good docs help everyone learn!'),
  (24, 'true_false', 'Robotics combines programming, electronics, and mechanics', '["True", "False"]', 'True', 3, 10, 'Robotics brings many fields together!'),
  (24, 'mcq', 'What should you always consider in robot design?', '["Only speed", "Safety, functionality, and user experience", "Only color", "Only size"]', 'Safety, functionality, and user experience', 3, 11, 'Good design considers everything!'),
  (24, 'mcq', 'What is the first step in any robotics project?', '["Buy expensive parts", "Plan and research", "Start building randomly", "Give up"]', 'Plan and research', 3, 12, 'Always plan before you build!');

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_assessment_templates_grade ON assessment_templates(grade_id);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_assessment ON assessment_questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_student_assessments_student ON student_assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_assessments_assessment ON student_assessments(assessment_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_assessment ON student_answers(student_assessment_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_question ON student_answers(question_id);
