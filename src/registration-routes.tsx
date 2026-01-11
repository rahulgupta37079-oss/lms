// ============================================================================
// IOT & ROBOTICS REGISTRATION PORTAL ROUTES
// ============================================================================
// Yellow (#FFD700), White (#FFFFFF), Black (#000000) theme

// Student Registration Route
app.get('/register', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - IoT & Robotics Course | PassionBots</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
            min-height: 100vh;
        }
        .gradient-text {
            background: linear-gradient(90deg, #FFD700 0%, #FFA500 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .btn-yellow {
            background: linear-gradient(90deg, #FFD700 0%, #FFA500 100%);
            transition: all 0.3s ease;
        }
        .btn-yellow:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(255, 215, 0, 0.3);
        }
        .card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 215, 0, 0.2);
        }
        .input-field {
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 215, 0, 0.3);
            color: white;
        }
        .input-field:focus {
            border-color: #FFD700;
            outline: none;
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
        }
    </style>
</head>
<body class="text-white">
    <!-- Header -->
    <nav class="bg-black bg-opacity-80 backdrop-blur-md border-b border-yellow-500 border-opacity-30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-20">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-robot text-yellow-400 text-3xl"></i>
                    <span class="text-2xl font-bold gradient-text">PassionBots</span>
                </div>
                <div class="flex items-center space-x-6">
                    <a href="/" class="text-gray-300 hover:text-yellow-400 transition"><i class="fas fa-home mr-2"></i>Home</a>
                    <a href="/student-portal" class="text-gray-300 hover:text-yellow-400 transition"><i class="fas fa-sign-in-alt mr-2"></i>Student Login</a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Registration Form -->
    <div class="max-w-4xl mx-auto px-4 py-12">
        <!-- Header -->
        <div class="text-center mb-12">
            <h1 class="text-5xl font-bold mb-4">
                <span class="gradient-text">IoT & Robotics Course</span>
            </h1>
            <p class="text-xl text-gray-300">Join thousands of students learning the future of technology</p>
        </div>

        <!-- Registration Card -->
        <div class="card rounded-2xl p-8 mb-8">
            <div class="mb-8">
                <h2 class="text-3xl font-bold gradient-text mb-4">
                    <i class="fas fa-user-plus mr-3"></i>Register Now
                </h2>
                <p class="text-gray-300">Fill in your details to get started with your IoT & Robotics journey</p>
            </div>

            <form id="registrationForm" class="space-y-6">
                <!-- Full Name -->
                <div>
                    <label class="block text-yellow-400 font-semibold mb-2">
                        <i class="fas fa-user mr-2"></i>Full Name *
                    </label>
                    <input type="text" name="full_name" required 
                           class="input-field w-full px-4 py-3 rounded-lg"
                           placeholder="Enter your full name">
                </div>

                <!-- Email -->
                <div>
                    <label class="block text-yellow-400 font-semibold mb-2">
                        <i class="fas fa-envelope mr-2"></i>Email Address *
                    </label>
                    <input type="email" name="email" required 
                           class="input-field w-full px-4 py-3 rounded-lg"
                           placeholder="your.email@example.com">
                </div>

                <!-- Mobile -->
                <div>
                    <label class="block text-yellow-400 font-semibold mb-2">
                        <i class="fas fa-phone mr-2"></i>Mobile Number *
                    </label>
                    <input type="tel" name="mobile" required 
                           class="input-field w-full px-4 py-3 rounded-lg"
                           placeholder="+91 9876543210">
                </div>

                <!-- College Name -->
                <div>
                    <label class="block text-yellow-400 font-semibold mb-2">
                        <i class="fas fa-university mr-2"></i>College/Institution Name
                    </label>
                    <input type="text" name="college_name" 
                           class="input-field w-full px-4 py-3 rounded-lg"
                           placeholder="Your college or institution name">
                </div>

                <!-- Year of Study -->
                <div>
                    <label class="block text-yellow-400 font-semibold mb-2">
                        <i class="fas fa-graduation-cap mr-2"></i>Year of Study
                    </label>
                    <select name="year_of_study" class="input-field w-full px-4 py-3 rounded-lg">
                        <option value="">Select Year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Graduate">Graduate</option>
                        <option value="Working Professional">Working Professional</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <!-- Submit Button -->
                <div class="pt-4">
                    <button type="submit" class="btn-yellow w-full text-black font-bold py-4 px-8 rounded-lg text-lg">
                        <i class="fas fa-rocket mr-3"></i>Register for Free
                    </button>
                </div>
            </form>

            <div id="message" class="mt-6 p-4 rounded-lg hidden"></div>
        </div>

        <!-- Course Highlights -->
        <div class="grid md:grid-cols-3 gap-6 mb-12">
            <div class="card p-6 rounded-xl text-center">
                <i class="fas fa-video text-yellow-400 text-4xl mb-4"></i>
                <h3 class="text-xl font-bold mb-2">Live Classes</h3>
                <p class="text-gray-400">Interactive sessions with expert instructors</p>
            </div>
            <div class="card p-6 rounded-xl text-center">
                <i class="fas fa-certificate text-yellow-400 text-4xl mb-4"></i>
                <h3 class="text-xl font-bold mb-2">Certification</h3>
                <p class="text-gray-400">Industry-recognized certificate on completion</p>
            </div>
            <div class="card p-6 rounded-xl text-center">
                <i class="fas fa-project-diagram text-yellow-400 text-4xl mb-4"></i>
                <h3 class="text-xl font-bold mb-2">Hands-on Projects</h3>
                <p class="text-gray-400">Build real IoT and robotics applications</p>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('registrationForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            const messageDiv = document.getElementById('message');
            messageDiv.classList.remove('hidden', 'bg-green-500', 'bg-red-500');
            messageDiv.textContent = 'Processing registration...';
            messageDiv.classList.add('bg-blue-500');
            
            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    messageDiv.classList.remove('bg-blue-500');
                    messageDiv.classList.add('bg-green-500');
                    messageDiv.innerHTML = '<i class="fas fa-check-circle mr-2"></i>' + result.message;
                    e.target.reset();
                    
                    setTimeout(() => {
                        window.location.href = '/student-portal?registered=true&email=' + encodeURIComponent(data.email);
                    }, 2000);
                } else {
                    throw new Error(result.error || 'Registration failed');
                }
            } catch (error) {
                messageDiv.classList.remove('bg-blue-500');
                messageDiv.classList.add('bg-red-500');
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle mr-2"></i>' + error.message;
            }
        });
    </script>
</body>
</html>
  `)
})

// API: Student Registration
app.post('/api/register', async (c) => {
  try {
    const { env } = c
    const { full_name, email, mobile, college_name, year_of_study } = await c.req.json()

    // Validate required fields
    if (!full_name || !email || !mobile) {
      return c.json({ error: 'Full name, email, and mobile are required' }, 400)
    }

    // Check if email already exists
    const existing = await env.DB.prepare(`
      SELECT registration_id FROM course_registrations WHERE email = ?
    `).bind(email).first()

    if (existing) {
      return c.json({ error: 'This email is already registered' }, 400)
    }

    // Insert registration
    const result = await env.DB.prepare(`
      INSERT INTO course_registrations 
      (full_name, email, mobile, college_name, year_of_study, course_type, payment_status, status)
      VALUES (?, ?, ?, ?, ?, 'iot_robotics', 'free', 'active')
    `).bind(full_name, email, mobile, college_name || null, year_of_study || null).run()

    return c.json({
      success: true,
      message: 'Registration successful! Welcome to PassionBots IoT & Robotics Course.',
      registration_id: result.meta.last_row_id
    })
  } catch (error) {
    console.error('Registration error:', error)
    return c.json({ error: 'Registration failed. Please try again.' }, 500)
  }
})

// Student Portal Login Page
app.get('/student-portal', (c) => {
  const registered = c.req.query('registered')
  const email = c.req.query('email')
  
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Portal - IoT & Robotics | PassionBots</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
            min-height: 100vh;
        }
        .gradient-text {
            background: linear-gradient(90deg, #FFD700 0%, #FFA500 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .btn-yellow {
            background: linear-gradient(90deg, #FFD700 0%, #FFA500 100%);
            transition: all 0.3s ease;
        }
        .btn-yellow:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(255, 215, 0, 0.3);
        }
        .card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 215, 0, 0.2);
        }
        .input-field {
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 215, 0, 0.3);
            color: white;
        }
        .input-field:focus {
            border-color: #FFD700;
            outline: none;
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
        }
    </style>
</head>
<body class="text-white">
    <!-- Header -->
    <nav class="bg-black bg-opacity-80 backdrop-blur-md border-b border-yellow-500 border-opacity-30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-20">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-robot text-yellow-400 text-3xl"></i>
                    <span class="text-2xl font-bold gradient-text">PassionBots</span>
                </div>
                <div class="flex items-center space-x-6">
                    <a href="/" class="text-gray-300 hover:text-yellow-400 transition"><i class="fas fa-home mr-2"></i>Home</a>
                    <a href="/register" class="text-gray-300 hover:text-yellow-400 transition"><i class="fas fa-user-plus mr-2"></i>Register</a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Login Form -->
    <div class="max-w-md mx-auto px-4 py-12">
        ${registered ? `
        <div class="bg-green-500 bg-opacity-20 border border-green-500 rounded-lg p-4 mb-6">
            <p class="text-green-400 text-center">
                <i class="fas fa-check-circle mr-2"></i>
                Registration successful! Please login to access your dashboard.
            </p>
        </div>
        ` : ''}

        <div class="card rounded-2xl p-8">
            <div class="text-center mb-8">
                <div class="inline-block p-4 bg-yellow-400 bg-opacity-10 rounded-full mb-4">
                    <i class="fas fa-graduation-cap text-yellow-400 text-5xl"></i>
                </div>
                <h1 class="text-3xl font-bold gradient-text mb-2">Student Portal</h1>
                <p class="text-gray-400">Access your course dashboard</p>
            </div>

            <form id="loginForm" class="space-y-6">
                <div>
                    <label class="block text-yellow-400 font-semibold mb-2">
                        <i class="fas fa-envelope mr-2"></i>Email Address
                    </label>
                    <input type="email" name="email" required 
                           value="${email || ''}"
                           class="input-field w-full px-4 py-3 rounded-lg"
                           placeholder="your.email@example.com">
                </div>

                <button type="submit" class="btn-yellow w-full text-black font-bold py-3 px-6 rounded-lg">
                    <i class="fas fa-sign-in-alt mr-2"></i>Login to Dashboard
                </button>
            </form>

            <div id="message" class="mt-6 p-4 rounded-lg hidden"></div>

            <div class="mt-6 text-center">
                <p class="text-gray-400">Don't have an account?</p>
                <a href="/register" class="text-yellow-400 hover:text-yellow-300 font-semibold">
                    Register Now <i class="fas fa-arrow-right ml-1"></i>
                </a>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const email = formData.get('email');
            
            const messageDiv = document.getElementById('message');
            messageDiv.classList.remove('hidden', 'bg-green-500', 'bg-red-500');
            messageDiv.textContent = 'Logging in...';
            messageDiv.classList.add('bg-blue-500');
            
            try {
                const response = await fetch('/api/student-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('student_data', JSON.stringify(result.student));
                    window.location.href = '/dashboard';
                } else {
                    throw new Error(result.error || 'Login failed');
                }
            } catch (error) {
                messageDiv.classList.remove('bg-blue-500');
                messageDiv.classList.add('bg-red-500');
                messageDiv.innerHTML = '<i class="fas fa-exclamation-circle mr-2"></i>' + error.message;
            }
        });
    </script>
</body>
</html>
  `)
})

// API: Student Login
app.post('/api/student-login', async (c) => {
  try {
    const { env } = c
    const { email } = await c.req.json()

    if (!email) {
      return c.json({ error: 'Email is required' }, 400)
    }

    // Find student by email
    const student = await env.DB.prepare(`
      SELECT 
        registration_id,
        full_name,
        email,
        mobile,
        college_name,
        year_of_study,
        course_type,
        registration_date,
        payment_status,
        status
      FROM course_registrations 
      WHERE email = ? AND status = 'active'
    `).bind(email).first()

    if (!student) {
      return c.json({ error: 'Student not found. Please register first.' }, 404)
    }

    return c.json({
      success: true,
      message: 'Login successful',
      student
    })
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ error: 'Login failed. Please try again.' }, 500)
  }
})

export { app }
