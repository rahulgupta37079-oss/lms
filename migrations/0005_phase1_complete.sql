-- Phase 1: KG-2 Complete Curriculum (144 Sessions)
-- Kindergarten (48 sessions) + Grade 1 (48 sessions) + Grade 2 (48 sessions)

-- ============================================
-- KINDERGARTEN - ALL 48 SESSIONS
-- ============================================

-- KG Module
INSERT OR IGNORE INTO curriculum_modules (grade_id, module_number, title, description, theme, total_sessions) VALUES
      (4, 1, 'My Robot Friends - Complete KG Journey', 'Full year robotics curriculum for kindergarten through play and discovery', 'My Robot Friends', 48);

-- KG Sessions 1-48
INSERT OR IGNORE INTO curriculum_sessions (module_id, session_number, title, description, objectives, duration_minutes, is_project, order_number, content) VALUES
-- Block 1: Robot Basics (Sessions 1-12)
      (4, 1, 'What is a Robot?', 'Introduction to robots through show and tell activities', '["Identify what makes something a robot","Name 3 different types of robots","Share ideas about robots"]', 60, 0, 1, '<h2>What is a Robot?</h2><p>Welcome to the exciting world of robots! Today we learn what makes something a robot.</p><h3>Learning Goals:</h3><ul><li>Understand what robots are</li><li>See different types of robots</li><li>Share our ideas</li></ul>'),

      (4, 2, 'Robot Body Parts', 'Learning about robot components like head, arms, and legs', '["Name robot body parts","Compare robot parts to human body","Draw a robot with labeled parts"]', 60, 0, 2, '<h2>Robot Body Parts</h2><p>Robots have body parts just like us! Let''s learn about them.</p>'),

      (4, 3, 'How Robots Move', 'Understanding different types of robot movement', '["Identify ways robots move","Demonstrate robot movements","Compare wheeled vs walking robots"]', 60, 0, 3, '<h2>How Robots Move</h2><p>Robots can move in many ways - wheels, legs, wings!</p>'),

      (4, 4, 'Robot Sounds', 'Exploring how robots make sounds', '["Identify different robot sounds","Make robot sounds","Understand why robots beep"]', 60, 0, 4, '<h2>Robot Sounds</h2><p>Beep! Buzz! Robots communicate with sounds.</p>'),

      (4, 5, 'Robot Eyes - Sensors', 'Introduction to how robots see using sensors', '["Understand robot vision","Identify sensors","Explain how sensors work simply"]', 60, 0, 5, '<h2>Robot Eyes</h2><p>Robots use special eyes called sensors to see the world!</p>'),

      (4, 6, 'PROJECT: Draw Your Dream Robot', 'Creative drawing project to design a dream robot', '["Express creativity","Design a robot","Present design to class"]', 60, 1, 6, '<h2>PROJECT: Design Your Dream Robot</h2><p>Time to be creative! Draw your perfect robot.</p>'),

      (4, 7, 'Building with Blocks', 'Learning basic structure building skills', '["Build stable structures","Follow instructions","Use different shapes"]', 60, 0, 7, '<h2>Building with Blocks</h2><p>Let''s build strong robot structures!</p>'),

      (4, 8, 'Connecting Pieces', 'Understanding how parts connect together', '["Join pieces together","Create connections","Build simple machines"]', 60, 0, 8, '<h2>Connecting Pieces</h2><p>Learn how robot parts fit together.</p>'),

      (4, 9, 'Making Things Move', 'Understanding push and pull forces', '["Demonstrate push and pull","Make things roll","Understand force"]', 60, 0, 9, '<h2>Making Things Move</h2><p>Push and pull to make robots move!</p>'),

      (4, 10, 'Colors & Shapes', 'Pattern recognition and sorting', '["Identify colors","Sort shapes","Create patterns"]', 60, 0, 10, '<h2>Colors & Shapes</h2><p>Robots recognize colors and shapes too!</p>'),

      (4, 11, 'Following Paths', 'Introduction to line following concept', '["Follow a path","Understand directions","Complete a maze"]', 60, 0, 11, '<h2>Following Paths</h2><p>Can you follow the line like a robot?</p>'),

      (4, 12, 'PROJECT: Build a Block Robot', 'Hands-on building project with blocks', '["Build a robot structure","Use learned concepts","Present creation"]', 60, 1, 12, '<h2>PROJECT: Block Robot</h2><p>Build your first block robot!</p>'),

-- Block 2: Simple Mechanisms (Sessions 13-24)
      (4, 13, 'Wheels & Axles', 'Understanding wheels and how they turn', '["Identify wheels","Understand axles","Make things roll"]', 60, 0, 13, '<h2>Wheels & Axles</h2><p>Round and round the wheels go!</p>'),

      (4, 14, 'Gears & Rotation', 'Introduction to gears and rotation', '["See gears work","Understand rotation","Build gear system"]', 60, 0, 14, '<h2>Gears & Rotation</h2><p>Gears make robots stronger!</p>'),

      (4, 15, 'Levers & Movement', 'Learning about levers and motion', '["Use levers","Create movement","Understand force"]', 60, 0, 15, '<h2>Levers & Movement</h2><p>Levers help robots lift things!</p>'),

      (4, 16, 'Pulleys & Lifting', 'Understanding pulleys and lifting', '["Identify pulleys","Lift objects","Build pulley system"]', 60, 0, 16, '<h2>Pulleys & Lifting</h2><p>Pulleys make lifting easy!</p>'),

      (4, 17, 'PROJECT: Moving Toy Car', 'Build a toy car that moves', '["Assemble car","Add wheels","Test movement"]', 60, 1, 17, '<h2>PROJECT: Moving Car</h2><p>Build your own moving car!</p>'),

      (4, 18, 'Lights & LEDs', 'Introduction to lights and LEDs', '["See LEDs light up","Understand electricity","Make lights blink"]', 60, 0, 18, '<h2>Lights & LEDs</h2><p>Make your robot light up!</p>'),

      (4, 19, 'Buzzers & Sounds', 'Creating sounds with buzzers', '["Make buzzer sounds","Create patterns","Understand vibration"]', 60, 0, 19, '<h2>Buzzers & Sounds</h2><p>Beep beep! Make robot sounds!</p>'),

      (4, 20, 'Buttons & Switches', 'Understanding buttons and control', '["Use buttons","Turn things on/off","Control circuits"]', 60, 0, 20, '<h2>Buttons & Switches</h2><p>Press to control your robot!</p>'),

      (4, 21, 'Battery Basics', 'Learning about power and batteries', '["Identify batteries","Understand power","Safety rules"]', 60, 0, 21, '<h2>Battery Basics</h2><p>Batteries give robots energy!</p>'),

      (4, 22, 'PROJECT: Light-Up Card', 'Create a card with LED lights', '["Wire LED","Create circuit","Design card"]', 60, 1, 22, '<h2>PROJECT: Light-Up Card</h2><p>Make a glowing greeting card!</p>'),

      (4, 23, 'Robot Stories', 'Storytelling about robots', '["Tell robot stories","Act out scenes","Use imagination"]', 60, 0, 23, '<h2>Robot Stories</h2><p>Let''s tell amazing robot stories!</p>'),

      (4, 24, 'PROJECT: Story Robot Presentation', 'Present robot story to class', '["Create story","Make presentation","Share with class"]', 60, 1, 24, '<h2>PROJECT: Story Time</h2><p>Share your robot story!</p>'),

-- Block 3: Interactive Play (Sessions 25-36)
      (4, 25, 'Touch Sensors', 'Understanding touch and feeling', '["Use touch sensors","Detect touch","Build touch circuit"]', 60, 0, 25, '<h2>Touch Sensors</h2><p>Robots can feel touches!</p>'),

      (4, 26, 'Sound Sensors', 'Responding to sound and claps', '["Detect sounds","Clap activation","Build sound circuit"]', 60, 0, 26, '<h2>Sound Sensors</h2><p>Clap to activate your robot!</p>'),

      (4, 27, 'Light Sensors', 'Detecting brightness and darkness', '["Sense light","Understand brightness","Build light detector"]', 60, 0, 27, '<h2>Light Sensors</h2><p>Robots see light and dark!</p>'),

      (4, 28, 'PROJECT: Clap-Activated LED', 'LED that lights up with claps', '["Build circuit","Test clapping","Add decorations"]', 60, 1, 28, '<h2>PROJECT: Clap Light</h2><p>Clap to make it glow!</p>'),

      (4, 29, 'Remote Control Basics', 'Introduction to remote control', '["Use remote","Understand signals","Control from distance"]', 60, 0, 29, '<h2>Remote Control</h2><p>Control robots from far away!</p>'),

      (4, 30, 'Direction Control', 'Learning directions and navigation', '["Go forward/back","Turn left/right","Follow commands"]', 60, 0, 30, '<h2>Direction Control</h2><p>Make robots go where you want!</p>'),

      (4, 31, 'PROJECT: Remote Control Car', 'Build and control a car', '["Assemble car","Add remote","Drive around"]', 60, 1, 31, '<h2>PROJECT: RC Car</h2><p>Drive your own RC car!</p>'),

      (4, 32, 'Robot Dance', 'Creating robot dance moves', '["Design dance","Program moves","Perform dance"]', 60, 0, 32, '<h2>Robot Dance</h2><p>Make your robot dance!</p>'),

      (4, 33, 'Robot Art', 'Drawing with robots', '["Attach pen","Create patterns","Make art"]', 60, 0, 33, '<h2>Robot Art</h2><p>Robots can be artists too!</p>'),

      (4, 34, 'PROJECT: Dancing Robot', 'Robot that dances to music', '["Build dancer","Add movements","Show performance"]', 60, 1, 34, '<h2>PROJECT: Dance Show</h2><p>Robot dance party time!</p>'),

      (4, 35, 'Robot Games', 'Playing interactive games', '["Play robot games","Follow rules","Take turns"]', 60, 0, 35, '<h2>Robot Games</h2><p>Fun games with robots!</p>'),

      (4, 36, 'PROJECT: Game Robot', 'Create an interactive game', '["Design game","Build robot","Play together"]', 60, 1, 36, '<h2>PROJECT: Game Time</h2><p>Make your own robot game!</p>'),

-- Block 4: Final Projects (Sessions 37-48)
      (4, 37, 'Project Planning', 'Planning the final robot project', '["Choose project","Draw plan","List materials"]', 60, 0, 37, '<h2>Project Planning</h2><p>Let''s plan your amazing robot!</p>'),

      (4, 38, 'Gathering Materials', 'Collecting needed components', '["Find materials","Check list","Organize parts"]', 60, 0, 38, '<h2>Gathering Materials</h2><p>Collect everything you need!</p>'),

      (4, 39, 'Building Phase 1', 'Starting the build', '["Build structure","Connect parts","Test stability"]', 60, 0, 39, '<h2>Building - Part 1</h2><p>Start building your robot!</p>'),

      (4, 40, 'Building Phase 2', 'Continuing construction', '["Add mechanisms","Wire circuits","Test movement"]', 60, 0, 40, '<h2>Building - Part 2</h2><p>Keep building and testing!</p>'),

      (4, 41, 'Decorating', 'Making it beautiful', '["Add colors","Create design","Personalize robot"]', 60, 0, 41, '<h2>Decorating</h2><p>Make it look amazing!</p>'),

      (4, 42, 'Testing & Debugging', 'Testing and fixing issues', '["Test all features","Find problems","Fix issues"]', 60, 0, 42, '<h2>Testing & Debugging</h2><p>Test everything works!</p>'),

      (4, 43, 'Improvements', 'Making it better', '["Add features","Improve design","Perfect robot"]', 60, 0, 43, '<h2>Improvements</h2><p>Make it even better!</p>'),

      (4, 44, 'Presentation Prep', 'Preparing to present', '["Practice demo","Prepare speech","Make poster"]', 60, 0, 44, '<h2>Presentation Prep</h2><p>Get ready to show everyone!</p>'),

      (4, 45, 'FINAL PROJECT: My First Robot', 'Complete final robot project', '["Finish robot","Test thoroughly","Document work"]', 60, 1, 45, '<h2>FINAL PROJECT</h2><p>Your amazing robot is complete!</p>'),

      (4, 46, 'Robot Show & Tell', 'Present to classmates', '["Show robot","Explain features","Answer questions"]', 60, 0, 46, '<h2>Show & Tell</h2><p>Share your creation!</p>'),

      (4, 47, 'Robot Exhibition', 'Public exhibition of robots', '["Display robot","Talk to visitors","Be proud"]', 60, 0, 47, '<h2>Robot Exhibition</h2><p>Everyone sees your work!</p>'),

      (4, 48, 'Certificate Ceremony', 'Celebration and certificates', '["Receive certificate","Celebrate success","Plan next steps"]', 60, 0, 48, '<h2>Celebration!</h2><p>You did it! You''re a robot builder!</p>');

-- Continue with Grade 1 and Grade 2 sessions in next file...
-- GRADE 1 - ALL 48 SESSIONS
-- Little Engineers Theme

-- Grade 1 Module
INSERT OR IGNORE INTO curriculum_modules (grade_id, module_number, title, description, theme, total_sessions) VALUES
    (4, 1, 'Little Engineers - Complete Grade 1 Journey', 'Full year electronics and robotics curriculum for Grade 1', 'Little Engineers', 48);

-- Grade 1 Sessions 1-48
INSERT OR IGNORE INTO curriculum_sessions (module_id, session_number, title, description, objectives, duration_minutes, is_project, order_number, content) VALUES
-- Block 1: Electronic Basics (Sessions 1-12)
    (4, 1, 'Introduction to Electricity', 'What is electricity and how it works', '["Understand electricity","Identify conductors","Learn safety rules"]', 60, 0, 1, '<h2>Introduction to Electricity</h2><p>Electricity powers all robots! Let''s learn how it works safely.</p>'),

    (4, 2, 'Batteries & Power Sources', 'Types of batteries and power', '["Identify battery types","Understand voltage","Connect batteries safely"]', 60, 0, 2, '<h2>Batteries & Power</h2><p>Batteries give robots energy to work!</p>'),

    (4, 3, 'Wires & Connections', 'How wires connect components', '["Use jumper wires","Make connections","Understand circuits"]', 60, 0, 3, '<h2>Wires & Connections</h2><p>Wires carry electricity everywhere!</p>'),

    (4, 4, 'PROJECT: Simple Circuit', 'Build your first circuit', '["Connect battery to LED","Complete circuit","Test and verify"]', 60, 1, 4, '<h2>PROJECT: First Circuit</h2><p>Make an LED light up!</p>'),

    (4, 5, 'LEDs & Light', 'Understanding LED lights', '["Identify LED polarity","Connect LEDs","Make different colors"]', 60, 0, 5, '<h2>LEDs & Light</h2><p>LEDs are special lights for robots!</p>'),

    (4, 6, 'Resistors & Control', 'Using resistors to control current', '["Identify resistors","Read color codes","Protect LEDs"]', 60, 0, 6, '<h2>Resistors</h2><p>Resistors keep circuits safe!</p>'),

    (4, 7, 'Switches & Control', 'Controlling circuits with switches', '["Use different switches","Turn on/off","Build switch circuit"]', 60, 0, 7, '<h2>Switches</h2><p>Control when things work!</p>'),

    (4, 8, 'PROJECT: Flashlight', 'Build a working flashlight', '["Wire circuit","Add switch","Create housing"]', 60, 1, 8, '<h2>PROJECT: Flashlight</h2><p>Make your own flashlight!</p>'),

    (4, 9, 'Buzzers & Alarms', 'Creating sound with buzzers', '["Wire buzzer","Make sounds","Create alarm"]', 60, 0, 9, '<h2>Buzzers & Alarms</h2><p>Make loud warning sounds!</p>'),

    (4, 10, 'Motors & Movement', 'Introduction to electric motors', '["Connect motor","Make it spin","Control speed"]', 60, 0, 10, '<h2>Motors</h2><p>Motors make robots move!</p>'),

    (4, 11, 'Sensors Introduction', 'Types of sensors and their uses', '["See different sensors","Understand sensing","Test sensors"]', 60, 0, 11, '<h2>Sensors</h2><p>Sensors help robots understand the world!</p>'),

    (4, 12, 'PROJECT: Alarm System', 'Build a simple alarm', '["Design alarm","Wire circuit","Test system"]', 60, 1, 12, '<h2>PROJECT: Alarm</h2><p>Create a security alarm!</p>'),

-- Block 2: Building Robots (Sessions 13-24)
    (4, 13, 'Robot Chassis', 'Building robot body/frame', '["Design chassis","Build frame","Test strength"]', 60, 0, 13, '<h2>Robot Chassis</h2><p>Build a strong robot body!</p>'),

    (4, 14, 'Wheels & Drive', 'Attaching wheels and motors', '["Mount wheels","Connect motors","Test drive"]', 60, 0, 14, '<h2>Wheels & Drive</h2><p>Make your robot roll!</p>'),

    (4, 15, 'Battery Holder Mount', 'Installing power source', '["Attach holder","Wire battery","Secure safely"]', 60, 0, 15, '<h2>Battery Mount</h2><p>Give your robot power!</p>'),

    (4, 16, 'PROJECT: Basic Bot', 'Build a basic moving robot', '["Assemble robot","Wire motors","Test movement"]', 60, 1, 16, '<h2>PROJECT: Basic Bot</h2><p>Your first moving robot!</p>'),

    (4, 17, 'Adding Sensors', 'Installing sensors on robot', '["Mount sensors","Wire connections","Test response"]', 60, 0, 17, '<h2>Adding Sensors</h2><p>Give your robot senses!</p>'),

    (4, 18, 'LED Indicators', 'Adding status lights', '["Wire LEDs","Position lights","Test indicators"]', 60, 0, 18, '<h2>LED Indicators</h2><p>Show robot status with lights!</p>'),

    (4, 19, 'Sound Effects', 'Adding buzzers for feedback', '["Wire buzzer","Create tones","Add feedback"]', 60, 0, 19, '<h2>Sound Effects</h2><p>Make your robot talk!</p>'),

    (4, 20, 'PROJECT: Smart Bot', 'Robot with sensors and lights', '["Combine features","Test functions","Demonstrate"]', 60, 1, 20, '<h2>PROJECT: Smart Bot</h2><p>A robot that responds!</p>'),

    (4, 21, 'Obstacle Detection', 'Using sensors to avoid obstacles', '["Wire sensor","Detect objects","Stop/turn"]', 60, 0, 21, '<h2>Obstacle Detection</h2><p>Help robot avoid crashes!</p>'),

    (4, 22, 'Line Following Intro', 'Introduction to line sensors', '["Use line sensor","Detect lines","Follow path"]', 60, 0, 22, '<h2>Line Following</h2><p>Make robot follow lines!</p>'),

    (4, 23, 'Remote Control Setup', 'Adding wireless control', '["Setup remote","Pair devices","Test control"]', 60, 0, 23, '<h2>Remote Control</h2><p>Control robot wirelessly!</p>'),

    (4, 24, 'PROJECT: Explorer Bot', 'Autonomous exploring robot', '["Build explorer","Add sensors","Test navigation"]', 60, 1, 24, '<h2>PROJECT: Explorer</h2><p>Robot that explores!</p>'),

-- Block 3: Programming Intro (Sessions 25-36)
    (4, 25, 'What is Programming?', 'Introduction to coding concepts', '["Understand programs","See code examples","Try simple commands"]', 60, 0, 25, '<h2>Programming Basics</h2><p>Tell robots what to do!</p>'),

    (4, 26, 'Sequences & Steps', 'Understanding sequences', '["Follow steps","Create sequence","Execute commands"]', 60, 0, 26, '<h2>Sequences</h2><p>Robots follow steps in order!</p>'),

    (4, 27, 'Loops & Repetition', 'Repeating actions', '["Understand loops","Repeat tasks","Use forever"]', 60, 0, 27, '<h2>Loops</h2><p>Do things over and over!</p>'),

    (4, 28, 'PROJECT: Dance Program', 'Program a dancing robot', '["Write dance code","Upload program","Perform dance"]', 60, 1, 28, '<h2>PROJECT: Dance Code</h2><p>Program robot to dance!</p>'),

    (4, 29, 'Conditionals - If/Then', 'Making decisions', '["Use if statements","Make choices","React to sensors"]', 60, 0, 29, '<h2>If/Then</h2><p>Robots can make decisions!</p>'),

    (4, 30, 'Variables & Memory', 'Storing information', '["Use variables","Store data","Read values"]', 60, 0, 30, '<h2>Variables</h2><p>Robots remember things!</p>'),

    (4, 31, 'Sensor Input', 'Reading sensor data', '["Read sensors","Use values","Make decisions"]', 60, 0, 31, '<h2>Sensor Input</h2><p>Get data from sensors!</p>'),

    (4, 32, 'PROJECT: Smart Light', 'Light that responds to darkness', '["Read light sensor","Control LED","Automatic on/off"]', 60, 1, 32, '<h2>PROJECT: Smart Light</h2><p>Auto light control!</p>'),

    (4, 33, 'Motor Control Code', 'Programming motor movement', '["Control speed","Set direction","Timed movement"]', 60, 0, 33, '<h2>Motor Control</h2><p>Program how robots move!</p>'),

    (4, 34, 'Debugging & Fixing', 'Finding and fixing errors', '["Find bugs","Test code","Fix problems"]', 60, 0, 34, '<h2>Debugging</h2><p>Fix code mistakes!</p>'),

    (4, 35, 'Sound Programming', 'Creating melodies and tones', '["Play notes","Create melody","Program songs"]', 60, 0, 35, '<h2>Sound Code</h2><p>Program robot music!</p>'),

    (4, 36, 'PROJECT: Musical Bot', 'Robot that plays tunes', '["Write music code","Upload program","Play concert"]', 60, 1, 36, '<h2>PROJECT: Music Bot</h2><p>Robot orchestra!</p>'),

-- Block 4: Final Project (Sessions 37-48)
    (4, 37, 'Project Brainstorming', 'Choosing final project idea', '["Generate ideas","Choose project","Plan design"]', 60, 0, 37, '<h2>Project Ideas</h2><p>What will you create?</p>'),

    (4, 38, 'Design & Planning', 'Detailed project planning', '["Draw design","List parts","Write steps"]', 60, 0, 38, '<h2>Design Plan</h2><p>Plan every detail!</p>'),

    (4, 39, 'Parts Gathering', 'Collecting all materials', '["Check list","Find parts","Organize materials"]', 60, 0, 39, '<h2>Gather Parts</h2><p>Get everything ready!</p>'),

    (4, 40, 'Building Day 1', 'Start construction', '["Build chassis","Mount components","Wire basics"]', 60, 0, 40, '<h2>Build Day 1</h2><p>Start building!</p>'),

    (4, 41, 'Building Day 2', 'Continue building', '["Complete wiring","Test circuits","Add features"]', 60, 0, 41, '<h2>Build Day 2</h2><p>Keep building!</p>'),

    (4, 42, 'Programming Day', 'Writing the code', '["Write program","Test code","Debug issues"]', 60, 0, 42, '<h2>Programming</h2><p>Code your robot!</p>'),

    (4, 43, 'Testing Day', 'Complete testing', '["Test all features","Find bugs","Make fixes"]', 60, 0, 43, '<h2>Testing</h2><p>Test everything!</p>'),

    (4, 44, 'Final Touches', 'Perfecting the project', '["Polish design","Add decorations","Final testing"]', 60, 0, 44, '<h2>Final Touches</h2><p>Make it perfect!</p>'),

    (4, 45, 'FINAL PROJECT: My Robot Creation', 'Complete final project', '["Finish robot","Document project","Prepare demo"]', 60, 1, 45, '<h2>FINAL PROJECT</h2><p>Your amazing creation!</p>'),

    (4, 46, 'Project Presentations', 'Present to class', '["Show robot","Explain features","Demo functions"]', 60, 0, 46, '<h2>Presentations</h2><p>Show your work!</p>'),

    (4, 47, 'Robot Competition', 'Friendly robot challenges', '["Compete fairly","Show skills","Have fun"]', 60, 0, 47, '<h2>Competition</h2><p>Friendly challenges!</p>'),

    (4, 48, 'Graduation Ceremony', 'Celebrate achievements', '["Receive certificate","Celebrate success","Plan ahead"]', 60, 0, 48, '<h2>Graduation!</h2><p>You''re now a Little Engineer!</p>');
-- GRADE 2 - ALL 48 SESSIONS
-- Smart Robots Theme

-- Grade 2 Module
INSERT OR IGNORE INTO curriculum_modules (grade_id, module_number, title, description, theme, total_sessions) VALUES
  (4, 1, 'Smart Robots - Complete Grade 2 Journey', 'Full year sensors and automation curriculum for Grade 2', 'Smart Robots', 48);

-- Grade 2 Sessions 1-48
INSERT OR IGNORE INTO curriculum_sessions (module_id, session_number, title, description, objectives, duration_minutes, is_project, order_number, content) VALUES
-- Block 1: Advanced Sensors (Sessions 1-12)
  (4, 1, 'Touch Sensor Deep Dive', 'Advanced touch sensing', '["Multiple touch points","Pressure sensitivity","Build touch interface"]', 60, 0, 1, '<h2>Advanced Touch Sensing</h2><p>Make robots respond to touch!</p>'),

  (4, 2, 'Light Sensors & LDR', 'Light dependent resistors', '["Measure brightness","Auto-adjust lighting","Build day/night detector"]', 60, 0, 2, '<h2>Light Sensors</h2><p>Detect light levels!</p>'),

  (4, 3, 'Sound Level Detection', 'Measuring sound intensity', '["Detect sound levels","Create noise meter","Build sound alarm"]', 60, 0, 3, '<h2>Sound Detection</h2><p>Measure how loud it is!</p>'),

  (4, 4, 'PROJECT: Touch Lamp', 'Touch-activated LED lamp', '["Build circuit","Test sensitivity","Create lamp"]', 60, 1, 4, '<h2>PROJECT: Touch Lamp</h2><p>Touch to light up!</p>'),

  (4, 5, 'Temperature Sensors', 'Measuring temperature', '["Use thermistor","Read temperature","Display values"]', 60, 0, 5, '<h2>Temperature Sensing</h2><p>How hot or cold?</p>'),

  (4, 6, 'Humidity Sensors', 'Detecting moisture', '["Measure humidity","Understand dew point","Build weather station"]', 60, 0, 6, '<h2>Humidity Sensing</h2><p>Detect moisture!</p>'),

  (4, 7, 'Distance Sensors', 'Measuring distance', '["Use ultrasonic","Measure range","Detect proximity"]', 60, 0, 7, '<h2>Distance Measurement</h2><p>How far is it?</p>'),

  (4, 8, 'PROJECT: Parking Sensor', 'Distance-based warning system', '["Detect distance","Sound buzzer","LED indicators"]', 60, 1, 8, '<h2>PROJECT: Park Assist</h2><p>Help park safely!</p>'),

  (4, 9, 'Motion Sensors', 'Detecting movement', '["Use PIR sensor","Detect motion","Build alarm"]', 60, 0, 9, '<h2>Motion Detection</h2><p>Sense movement!</p>'),

  (4, 10, 'Tilt & Orientation', 'Measuring tilt and angle', '["Use tilt sensor","Detect orientation","Build level indicator"]', 60, 0, 10, '<h2>Tilt Sensing</h2><p>Which way is up?</p>'),

  (4, 11, 'Gas & Air Quality', 'Detecting gases', '["Use gas sensor","Measure air quality","Build safety alarm"]', 60, 0, 11, '<h2>Gas Detection</h2><p>Keep air safe!</p>'),

  (4, 12, 'PROJECT: Weather Station', 'Multi-sensor weather monitor', '["Combine sensors","Display data","Track weather"]', 60, 1, 12, '<h2>PROJECT: Weather Station</h2><p>Your own weather center!</p>'),

-- Block 2: Automation Basics (Sessions 13-24)
  (4, 13, 'What is Automation?', 'Introduction to automated systems', '["Understand automation","See examples","Plan automated system"]', 60, 0, 13, '<h2>Automation Basics</h2><p>Make things work automatically!</p>'),

  (4, 14, 'Automatic Lights', 'Light sensing automation', '["Auto on/off","Brightness control","Energy saving"]', 60, 0, 14, '<h2>Smart Lighting</h2><p>Lights that think!</p>'),

  (4, 15, 'Automatic Doors', 'Motion-activated opening', '["Detect presence","Open/close","Safety features"]', 60, 0, 15, '<h2>Auto Doors</h2><p>Doors that open themselves!</p>'),

  (4, 16, 'PROJECT: Smart Room', 'Automated room lighting', '["Wire system","Program automation","Test scenarios"]', 60, 1, 16, '<h2>PROJECT: Smart Room</h2><p>Automate your space!</p>'),

  (4, 17, 'Temperature Control', 'Thermostat automation', '["Set temperature","Control heating","Auto adjust"]', 60, 0, 17, '<h2>Temperature Control</h2><p>Perfect temperature!</p>'),

  (4, 18, 'Fan Automation', 'Auto fan control', '["Temperature based","Speed control","Energy efficient"]', 60, 0, 18, '<h2>Smart Fans</h2><p>Cool when needed!</p>'),

  (4, 19, 'Water Level Control', 'Automatic water management', '["Detect water level","Auto pump","Overflow prevention"]', 60, 0, 19, '<h2>Water Control</h2><p>Manage water automatically!</p>'),

  (4, 20, 'PROJECT: Plant Waterer', 'Auto plant watering system', '["Moisture sensor","Water pump","Scheduling"]', 60, 1, 20, '<h2>PROJECT: Plant Care</h2><p>Auto water plants!</p>'),

  (4, 21, 'Light Following', 'Robot follows brightest light', '["Two light sensors","Compare values","Steer toward light"]', 60, 0, 21, '<h2>Light Following</h2><p>Seek the light!</p>'),

  (4, 22, 'Line Following Advanced', 'Multiple sensor line tracking', '["Array sensors","PID control","Fast tracking"]', 60, 0, 22, '<h2>Line Following</h2><p>Stay on track!</p>'),

  (4, 23, 'Obstacle Avoidance', 'Navigate around obstacles', '["Detect obstacles","Change path","Complete route"]', 60, 0, 23, '<h2>Avoid Obstacles</h2><p>Don''t crash!</p>'),

  (4, 24, 'PROJECT: Maze Solver', 'Robot navigates maze', '["Build maze","Program logic","Complete course"]', 60, 1, 24, '<h2>PROJECT: Maze Bot</h2><p>Solve the maze!</p>'),

-- Block 3: Communication & Control (Sessions 25-36)
  (4, 25, 'Wired Communication', 'Serial and UART basics', '["Send data","Receive data","Two-way talk"]', 60, 0, 25, '<h2>Wired Communication</h2><p>Robots talk through wires!</p>'),

  (4, 26, 'Wireless Basics', 'Introduction to wireless', '["Radio waves","Frequencies","Range"]', 60, 0, 26, '<h2>Wireless Basics</h2><p>Communication without wires!</p>'),

  (4, 27, 'Infrared Control', 'IR remote control', '["IR transmitter","IR receiver","Send commands"]', 60, 0, 27, '<h2>IR Control</h2><p>Invisible commands!</p>'),

  (4, 28, 'PROJECT: IR Remote Bot', 'Robot with IR remote', '["Build receiver","Program commands","Test control"]', 60, 1, 28, '<h2>PROJECT: IR Bot</h2><p>Control with remote!</p>'),

  (4, 29, 'Bluetooth Basics', 'Wireless Bluetooth control', '["Pair devices","Send data","Receive commands"]', 60, 0, 29, '<h2>Bluetooth Control</h2><p>Phone controlled!</p>'),

  (4, 30, 'App Control', 'Mobile app interface', '["Use app","Send commands","Get feedback"]', 60, 0, 30, '<h2>App Control</h2><p>Control from phone!</p>'),

  (4, 31, 'Data Logging', 'Recording sensor data', '["Collect data","Store values","Analyze trends"]', 60, 0, 31, '<h2>Data Logging</h2><p>Save information!</p>'),

  (4, 32, 'PROJECT: Data Logger', 'Environmental data recorder', '["Multi sensors","Store data","Display graphs"]', 60, 1, 32, '<h2>PROJECT: Logger</h2><p>Track everything!</p>'),

  (4, 33, 'Display Screens', 'LCD and OLED displays', '["Show text","Display values","Create menus"]', 60, 0, 33, '<h2>Display Screens</h2><p>Show information!</p>'),

  (4, 34, 'User Interface', 'Buttons and menus', '["Navigate menus","Select options","Configure settings"]', 60, 0, 34, '<h2>User Interface</h2><p>Easy to use!</p>'),

  (4, 35, 'Alarm Systems', 'Security and alerts', '["Detect intrusion","Sound alarm","Send alert"]', 60, 0, 35, '<h2>Alarm Systems</h2><p>Stay secure!</p>'),

  (4, 36, 'PROJECT: Security System', 'Complete security solution', '["Multiple sensors","Display status","Alert system"]', 60, 1, 36, '<h2>PROJECT: Security</h2><p>Protect your space!</p>'),

-- Block 4: Final Project (Sessions 37-48)
  (4, 37, 'Project Selection', 'Choose capstone project', '["Review options","Choose project","Form team"]', 60, 0, 37, '<h2>Project Selection</h2><p>Pick your challenge!</p>'),

  (4, 38, 'Research & Planning', 'Deep project planning', '["Research topic","Design system","Create timeline"]', 60, 0, 38, '<h2>Planning Phase</h2><p>Plan thoroughly!</p>'),

  (4, 39, 'Component Selection', 'Choose right parts', '["Select sensors","Choose actuators","Order materials"]', 60, 0, 39, '<h2>Select Components</h2><p>Pick the best parts!</p>'),

  (4, 40, 'Prototype Building', 'Build initial version', '["Assemble prototype","Test basic functions","Identify issues"]', 60, 0, 40, '<h2>Prototype</h2><p>Build first version!</p>'),

  (4, 41, 'Circuit Design', 'Design complete circuit', '["Draw schematic","Plan layout","Build circuit"]', 60, 0, 41, '<h2>Circuit Design</h2><p>Design electronics!</p>'),

  (4, 42, 'Software Development', 'Write complete code', '["Write algorithms","Test functions","Debug code"]', 60, 0, 42, '<h2>Programming</h2><p>Write the code!</p>'),

  (4, 43, 'Integration Testing', 'Test all together', '["Hardware + software","Full system test","Fix bugs"]', 60, 0, 43, '<h2>Integration</h2><p>Make it all work!</p>'),

  (4, 44, 'Documentation', 'Document the project', '["Write manual","Create diagrams","Record video"]', 60, 0, 44, '<h2>Documentation</h2><p>Explain your work!</p>'),

  (4, 45, 'FINAL PROJECT: Smart Automation System', 'Complete automation project', '["Finalize project","Perfect details","Prepare demo"]', 60, 1, 45, '<h2>FINAL PROJECT</h2><p>Your masterpiece!</p>'),

  (4, 46, 'Project Exhibition', 'Public demonstration', '["Setup booth","Demo project","Answer questions"]', 60, 0, 46, '<h2>Exhibition</h2><p>Show the world!</p>'),

  (4, 47, 'Awards & Recognition', 'Recognition ceremony', '["Present awards","Celebrate success","Share achievements"]', 60, 0, 47, '<h2>Awards</h2><p>You''re amazing!</p>'),

  (4, 48, 'Graduation & Next Steps', 'Complete Grade 2 journey', '["Receive certificate","Plan Grade 3","Celebrate!"]', 60, 0, 48, '<h2>Graduation!</h2><p>Smart Robots Master!</p>');
