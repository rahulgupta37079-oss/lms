import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Login
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    const student = await c.env.DB.prepare(
      'SELECT * FROM students WHERE email = ? AND password = ?'
    ).bind(email, password).first()
    
    if (!student) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }
    
    // Remove password from response
    const { password: _, ...studentData } = student
    
    return c.json({ 
      success: true, 
      student: studentData,
      message: 'Login successful' 
    })
  } catch (error) {
    return c.json({ error: 'Login failed' }, 500)
  }
})

// Get student profile
app.get('/api/student/:id', async (c) => {
  try {
    const studentId = c.req.param('id')
    
    const student = await c.env.DB.prepare(
      'SELECT id, email, full_name, phone, university, enrollment_date, program_type, batch_start_date, profile_image FROM students WHERE id = ?'
    ).bind(studentId).first()
    
    if (!student) {
      return c.json({ error: 'Student not found' }, 404)
    }
    
    return c.json(student)
  } catch (error) {
    return c.json({ error: 'Failed to fetch profile' }, 500)
  }
})

// ============================================
// DASHBOARD ROUTES
// ============================================

// Get dashboard statistics
app.get('/api/dashboard/:studentId', async (c) => {
  try {
    const studentId = c.req.param('studentId')
    
    // Get total lessons
    const totalLessons = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM lessons WHERE is_published = 1'
    ).first()
    
    // Get completed lessons
    const completedLessons = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM student_progress WHERE student_id = ? AND status = "completed"'
    ).bind(studentId).first()
    
    // Get in-progress lessons
    const inProgressLessons = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM student_progress WHERE student_id = ? AND status = "in_progress"'
    ).bind(studentId).first()
    
    // Get assignments
    const totalAssignments = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM assignments'
    ).first()
    
    const submittedAssignments = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM submissions WHERE student_id = ?'
    ).bind(studentId).first()
    
    // Get upcoming sessions
    const upcomingSessions = await c.env.DB.prepare(
      'SELECT * FROM live_sessions WHERE session_date > datetime("now") ORDER BY session_date ASC LIMIT 3'
    ).all()
    
    // Calculate overall progress
    const overallProgress = totalLessons?.count > 0 
      ? Math.round((completedLessons?.count || 0) / totalLessons.count * 100) 
      : 0
    
    return c.json({
      stats: {
        totalLessons: totalLessons?.count || 0,
        completedLessons: completedLessons?.count || 0,
        inProgressLessons: inProgressLessons?.count || 0,
        totalAssignments: totalAssignments?.count || 0,
        submittedAssignments: submittedAssignments?.count || 0,
        overallProgress
      },
      upcomingSessions: upcomingSessions.results
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch dashboard data' }, 500)
  }
})

// ============================================
// COURSE MODULES ROUTES
// ============================================

// Get all modules with progress
app.get('/api/modules/:studentId', async (c) => {
  try {
    const studentId = c.req.param('studentId')
    
    const modules = await c.env.DB.prepare(`
      SELECT 
        m.*,
        COUNT(DISTINCT l.id) as total_lessons,
        COUNT(DISTINCT CASE WHEN sp.status = 'completed' THEN sp.lesson_id END) as completed_lessons
      FROM modules m
      LEFT JOIN lessons l ON m.id = l.module_id AND l.is_published = 1
      LEFT JOIN student_progress sp ON l.id = sp.lesson_id AND sp.student_id = ?
      WHERE m.is_published = 1
      GROUP BY m.id
      ORDER BY m.order_index
    `).bind(studentId).all()
    
    return c.json(modules.results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch modules' }, 500)
  }
})

// Get module details with lessons
app.get('/api/modules/:moduleId/lessons/:studentId', async (c) => {
  try {
    const moduleId = c.req.param('moduleId')
    const studentId = c.req.param('studentId')
    
    // Get module details
    const module = await c.env.DB.prepare(
      'SELECT * FROM modules WHERE id = ?'
    ).bind(moduleId).first()
    
    // Get lessons with progress
    const lessons = await c.env.DB.prepare(`
      SELECT 
        l.*,
        sp.status,
        sp.progress_percentage,
        sp.completed_at,
        sp.last_accessed
      FROM lessons l
      LEFT JOIN student_progress sp ON l.id = sp.lesson_id AND sp.student_id = ?
      WHERE l.module_id = ? AND l.is_published = 1
      ORDER BY l.order_index
    `).bind(studentId, moduleId).all()
    
    return c.json({
      module,
      lessons: lessons.results
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch lessons' }, 500)
  }
})

// Get lesson details
app.get('/api/lessons/:lessonId/:studentId', async (c) => {
  try {
    const lessonId = c.req.param('lessonId')
    const studentId = c.req.param('studentId')
    
    const lesson = await c.env.DB.prepare(
      'SELECT * FROM lessons WHERE id = ?'
    ).bind(lessonId).first()
    
    if (!lesson) {
      return c.json({ error: 'Lesson not found' }, 404)
    }
    
    // Get or create progress record
    let progress = await c.env.DB.prepare(
      'SELECT * FROM student_progress WHERE student_id = ? AND lesson_id = ?'
    ).bind(studentId, lessonId).first()
    
    if (!progress) {
      await c.env.DB.prepare(
        'INSERT INTO student_progress (student_id, lesson_id, status, last_accessed) VALUES (?, ?, "not_started", datetime("now"))'
      ).bind(studentId, lessonId).run()
      
      progress = {
        student_id: studentId,
        lesson_id: lessonId,
        status: 'not_started',
        progress_percentage: 0
      }
    }
    
    return c.json({
      lesson,
      progress
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch lesson' }, 500)
  }
})

// Update lesson progress
app.post('/api/progress/update', async (c) => {
  try {
    const { studentId, lessonId, status, progressPercentage } = await c.req.json()
    
    const completedAt = status === 'completed' ? 'datetime("now")' : 'NULL'
    
    await c.env.DB.prepare(`
      INSERT INTO student_progress (student_id, lesson_id, status, progress_percentage, last_accessed, completed_at)
      VALUES (?, ?, ?, ?, datetime("now"), ${completedAt})
      ON CONFLICT(student_id, lesson_id) 
      DO UPDATE SET 
        status = excluded.status,
        progress_percentage = excluded.progress_percentage,
        last_accessed = excluded.last_accessed,
        completed_at = CASE WHEN excluded.status = 'completed' THEN datetime("now") ELSE completed_at END
    `).bind(studentId, lessonId, status, progressPercentage).run()
    
    return c.json({ success: true, message: 'Progress updated' })
  } catch (error) {
    return c.json({ error: 'Failed to update progress' }, 500)
  }
})

// ============================================
// ASSIGNMENTS ROUTES
// ============================================

// Get all assignments
app.get('/api/assignments/:studentId', async (c) => {
  try {
    const studentId = c.req.param('studentId')
    
    const assignments = await c.env.DB.prepare(`
      SELECT 
        a.*,
        m.title as module_title,
        s.id as submission_id,
        s.status as submission_status,
        s.score,
        s.submitted_at
      FROM assignments a
      JOIN modules m ON a.module_id = m.id
      LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = ?
      ORDER BY a.due_date ASC
    `).bind(studentId).all()
    
    return c.json(assignments.results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch assignments' }, 500)
  }
})

// Submit assignment
app.post('/api/assignments/submit', async (c) => {
  try {
    const { assignmentId, studentId, submissionUrl, githubUrl, demoUrl, description } = await c.req.json()
    
    await c.env.DB.prepare(`
      INSERT INTO submissions (assignment_id, student_id, submission_url, github_url, demo_url, description, submitted_at, status)
      VALUES (?, ?, ?, ?, ?, ?, datetime("now"), "pending")
    `).bind(assignmentId, studentId, submissionUrl, githubUrl, demoUrl, description).run()
    
    return c.json({ success: true, message: 'Assignment submitted successfully' })
  } catch (error) {
    return c.json({ error: 'Failed to submit assignment' }, 500)
  }
})

// ============================================
// LIVE SESSIONS ROUTES
// ============================================

// Get live sessions
app.get('/api/sessions', async (c) => {
  try {
    const sessions = await c.env.DB.prepare(`
      SELECT 
        ls.*,
        m.title as module_title
      FROM live_sessions ls
      JOIN modules m ON ls.module_id = m.id
      ORDER BY ls.session_date ASC
    `).all()
    
    return c.json(sessions.results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch sessions' }, 500)
  }
})

// Mark session attendance
app.post('/api/sessions/attend', async (c) => {
  try {
    const { sessionId, studentId } = await c.req.json()
    
    await c.env.DB.prepare(`
      INSERT INTO session_attendance (session_id, student_id, attended, attendance_time)
      VALUES (?, ?, 1, datetime("now"))
      ON CONFLICT(session_id, student_id) 
      DO UPDATE SET attended = 1, attendance_time = datetime("now")
    `).bind(sessionId, studentId).run()
    
    return c.json({ success: true, message: 'Attendance marked' })
  } catch (error) {
    return c.json({ error: 'Failed to mark attendance' }, 500)
  }
})

// ============================================
// CERTIFICATES ROUTES
// ============================================

// Get student certificates
app.get('/api/certificates/:studentId', async (c) => {
  try {
    const studentId = c.req.param('studentId')
    
    const certificates = await c.env.DB.prepare(
      'SELECT * FROM certificates WHERE student_id = ? ORDER BY issued_date DESC'
    ).bind(studentId).all()
    
    return c.json(certificates.results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch certificates' }, 500)
  }
})

// Verify certificate
app.get('/api/verify/:certificateId', async (c) => {
  try {
    const certificateId = c.req.param('certificateId')
    
    const certificate = await c.env.DB.prepare(`
      SELECT 
        c.*,
        s.full_name,
        s.email,
        s.university
      FROM certificates c
      JOIN students s ON c.student_id = s.id
      WHERE c.certificate_id = ? AND c.is_verified = 1
    `).bind(certificateId).first()
    
    if (!certificate) {
      return c.json({ error: 'Certificate not found or invalid' }, 404)
    }
    
    return c.json({
      verified: true,
      certificate
    })
  } catch (error) {
    return c.json({ error: 'Verification failed' }, 500)
  }
})

// ============================================
// ANNOUNCEMENTS ROUTES
// ============================================

// Get announcements
app.get('/api/announcements', async (c) => {
  try {
    const announcements = await c.env.DB.prepare(
      'SELECT * FROM announcements WHERE is_published = 1 ORDER BY published_at DESC LIMIT 10'
    ).all()
    
    return c.json(announcements.results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch announcements' }, 500)
  }
})

// ============================================
// HARDWARE KIT ROUTES
// ============================================

// Get hardware kit status
app.get('/api/hardware/:studentId', async (c) => {
  try {
    const studentId = c.req.param('studentId')
    
    const kit = await c.env.DB.prepare(
      'SELECT * FROM hardware_kits WHERE student_id = ?'
    ).bind(studentId).first()
    
    return c.json(kit || { delivery_status: 'not_applicable' })
  } catch (error) {
    return c.json({ error: 'Failed to fetch hardware kit status' }, 500)
  }
})

// ============================================
// FORUM ROUTES
// ============================================

// Get forum posts
app.get('/api/forum', async (c) => {
  try {
    const posts = await c.env.DB.prepare(`
      SELECT 
        fp.*,
        s.full_name as author_name,
        m.title as module_title,
        COUNT(DISTINCT fr.id) as reply_count
      FROM forum_posts fp
      JOIN students s ON fp.student_id = s.id
      LEFT JOIN modules m ON fp.module_id = m.id
      LEFT JOIN forum_replies fr ON fp.id = fr.post_id
      GROUP BY fp.id
      ORDER BY fp.is_pinned DESC, fp.created_at DESC
      LIMIT 20
    `).all()
    
    return c.json(posts.results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch forum posts' }, 500)
  }
})

// Get post with replies
app.get('/api/forum/:postId', async (c) => {
  try {
    const postId = c.req.param('postId')
    
    const post = await c.env.DB.prepare(`
      SELECT 
        fp.*,
        s.full_name as author_name,
        m.title as module_title
      FROM forum_posts fp
      JOIN students s ON fp.student_id = s.id
      LEFT JOIN modules m ON fp.module_id = m.id
      WHERE fp.id = ?
    `).bind(postId).first()
    
    const replies = await c.env.DB.prepare(`
      SELECT 
        fr.*,
        s.full_name as author_name
      FROM forum_replies fr
      JOIN students s ON fr.student_id = s.id
      WHERE fr.post_id = ?
      ORDER BY fr.created_at ASC
    `).bind(postId).all()
    
    // Increment view count
    await c.env.DB.prepare(
      'UPDATE forum_posts SET views_count = views_count + 1 WHERE id = ?'
    ).bind(postId).run()
    
    return c.json({
      post,
      replies: replies.results
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch post' }, 500)
  }
})

// Create forum post
app.post('/api/forum/post', async (c) => {
  try {
    const { studentId, moduleId, lessonId, title, content } = await c.req.json()
    
    const result = await c.env.DB.prepare(`
      INSERT INTO forum_posts (student_id, module_id, lesson_id, title, content)
      VALUES (?, ?, ?, ?, ?)
    `).bind(studentId, moduleId, lessonId, title, content).run()
    
    return c.json({ 
      success: true, 
      postId: result.meta.last_row_id,
      message: 'Post created successfully' 
    })
  } catch (error) {
    return c.json({ error: 'Failed to create post' }, 500)
  }
})

// Reply to post
app.post('/api/forum/reply', async (c) => {
  try {
    const { postId, studentId, content } = await c.req.json()
    
    await c.env.DB.prepare(`
      INSERT INTO forum_replies (post_id, student_id, content)
      VALUES (?, ?, ?)
    `).bind(postId, studentId, content).run()
    
    return c.json({ success: true, message: 'Reply posted successfully' })
  } catch (error) {
    return c.json({ error: 'Failed to post reply' }, 500)
  }
})

// ============================================
// FRONTEND ROUTES
// ============================================

app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PassionBots Student LMS</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'passionbots-primary': '#6366f1',
                        'passionbots-secondary': '#8b5cf6',
                        'passionbots-accent': '#ec4899',
                    }
                }
            }
        }
    </script>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .card-hover {
            transition: all 0.3s ease;
        }
        .card-hover:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Login Screen -->
    <div id="loginScreen" class="min-h-screen flex items-center justify-center gradient-bg p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div class="text-center mb-8">
                <div class="inline-block p-3 bg-indigo-100 rounded-full mb-4">
                    <i class="fas fa-robot text-4xl text-indigo-600"></i>
                </div>
                <h1 class="text-3xl font-bold text-gray-800 mb-2">PassionBots LMS</h1>
                <p class="text-gray-600">IoT & Robotics Internship Portal</p>
            </div>
            
            <form id="loginForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" id="loginEmail" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="your@email.com" value="demo@student.com">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input type="password" id="loginPassword" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="••••••••" value="demo123">
                </div>
                <button type="submit" 
                    class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200">
                    <i class="fas fa-sign-in-alt mr-2"></i>Login
                </button>
            </form>
            
            <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p class="text-sm text-blue-800">
                    <i class="fas fa-info-circle mr-2"></i><strong>Demo Login:</strong><br>
                    Email: demo@student.com<br>
                    Password: demo123
                </p>
            </div>
        </div>
    </div>

    <!-- Main App -->
    <div id="mainApp" class="hidden">
        <!-- Top Navigation -->
        <nav class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center space-x-3">
                        <div class="p-2 bg-indigo-100 rounded-lg">
                            <i class="fas fa-robot text-2xl text-indigo-600"></i>
                        </div>
                        <div>
                            <h1 class="text-xl font-bold text-gray-800">PassionBots LMS</h1>
                            <p class="text-xs text-gray-500">IoT & Robotics Internship</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="text-sm text-gray-600">
                            <i class="fas fa-user-circle mr-2"></i>
                            <span id="studentName">Student</span>
                        </span>
                        <button onclick="logout()" class="text-red-600 hover:text-red-700">
                            <i class="fas fa-sign-out-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="flex">
            <!-- Sidebar -->
            <aside class="w-64 bg-white h-screen sticky top-16 shadow-sm border-r border-gray-200">
                <nav class="p-4 space-y-2">
                    <a href="#" onclick="showTab('dashboard')" class="nav-item flex items-center space-x-3 px-4 py-3 rounded-lg bg-indigo-50 text-indigo-600">
                        <i class="fas fa-home w-5"></i>
                        <span class="font-medium">Dashboard</span>
                    </a>
                    <a href="#" onclick="showTab('courses')" class="nav-item flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                        <i class="fas fa-book w-5"></i>
                        <span class="font-medium">My Courses</span>
                    </a>
                    <a href="#" onclick="showTab('assignments')" class="nav-item flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                        <i class="fas fa-tasks w-5"></i>
                        <span class="font-medium">Assignments</span>
                    </a>
                    <a href="#" onclick="showTab('sessions')" class="nav-item flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                        <i class="fas fa-video w-5"></i>
                        <span class="font-medium">Live Sessions</span>
                    </a>
                    <a href="#" onclick="showTab('certificates')" class="nav-item flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                        <i class="fas fa-certificate w-5"></i>
                        <span class="font-medium">Certificates</span>
                    </a>
                    <a href="#" onclick="showTab('forum')" class="nav-item flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                        <i class="fas fa-comments w-5"></i>
                        <span class="font-medium">Forum</span>
                    </a>
                    <a href="#" onclick="showTab('hardware')" class="nav-item flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                        <i class="fas fa-microchip w-5"></i>
                        <span class="font-medium">Hardware Kit</span>
                    </a>
                </nav>
            </aside>

            <!-- Content Area -->
            <main class="flex-1 p-8 bg-gray-50">
                <!-- Dashboard Tab -->
                <div id="dashboardTab" class="tab-content">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">Welcome Back! 👋</h2>
                    
                    <!-- Stats Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div class="bg-white p-6 rounded-xl shadow-sm card-hover border border-gray-100">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-gray-600 text-sm">Overall Progress</span>
                                <i class="fas fa-chart-line text-indigo-600"></i>
                            </div>
                            <div class="text-3xl font-bold text-gray-800" id="overallProgress">0%</div>
                        </div>
                        <div class="bg-white p-6 rounded-xl shadow-sm card-hover border border-gray-100">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-gray-600 text-sm">Completed</span>
                                <i class="fas fa-check-circle text-green-600"></i>
                            </div>
                            <div class="text-3xl font-bold text-gray-800" id="completedLessons">0</div>
                            <div class="text-sm text-gray-500" id="totalLessons">of 0 lessons</div>
                        </div>
                        <div class="bg-white p-6 rounded-xl shadow-sm card-hover border border-gray-100">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-gray-600 text-sm">In Progress</span>
                                <i class="fas fa-spinner text-blue-600"></i>
                            </div>
                            <div class="text-3xl font-bold text-gray-800" id="inProgressLessons">0</div>
                            <div class="text-sm text-gray-500">lessons</div>
                        </div>
                        <div class="bg-white p-6 rounded-xl shadow-sm card-hover border border-gray-100">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-gray-600 text-sm">Assignments</span>
                                <i class="fas fa-tasks text-purple-600"></i>
                            </div>
                            <div class="text-3xl font-bold text-gray-800" id="submittedAssignments">0</div>
                            <div class="text-sm text-gray-500" id="totalAssignments">of 0 submitted</div>
                        </div>
                    </div>

                    <!-- Announcements -->
                    <div class="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">
                            <i class="fas fa-bullhorn text-indigo-600 mr-2"></i>Latest Announcements
                        </h3>
                        <div id="announcementsList"></div>
                    </div>

                    <!-- Upcoming Sessions -->
                    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">
                            <i class="fas fa-calendar text-indigo-600 mr-2"></i>Upcoming Live Sessions
                        </h3>
                        <div id="upcomingSessionsList"></div>
                    </div>
                </div>

                <!-- Courses Tab -->
                <div id="coursesTab" class="tab-content hidden">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">My Courses</h2>
                    <div id="modulesList" class="space-y-4"></div>
                </div>

                <!-- Module Details View -->
                <div id="moduleDetailsView" class="tab-content hidden">
                    <button onclick="showTab('courses')" class="mb-4 text-indigo-600 hover:text-indigo-700">
                        <i class="fas fa-arrow-left mr-2"></i>Back to Courses
                    </button>
                    <div id="moduleDetails"></div>
                </div>

                <!-- Lesson View -->
                <div id="lessonView" class="tab-content hidden">
                    <button onclick="backToModule()" class="mb-4 text-indigo-600 hover:text-indigo-700">
                        <i class="fas fa-arrow-left mr-2"></i>Back to Module
                    </button>
                    <div id="lessonContent"></div>
                </div>

                <!-- Assignments Tab -->
                <div id="assignmentsTab" class="tab-content hidden">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">Assignments</h2>
                    <div id="assignmentsList"></div>
                </div>

                <!-- Live Sessions Tab -->
                <div id="sessionsTab" class="tab-content hidden">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">Live Sessions</h2>
                    <div id="sessionsList"></div>
                </div>

                <!-- Certificates Tab -->
                <div id="certificatesTab" class="tab-content hidden">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">My Certificates</h2>
                    <div id="certificatesList"></div>
                </div>

                <!-- Forum Tab -->
                <div id="forumTab" class="tab-content hidden">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">Discussion Forum</h2>
                    <button onclick="showCreatePost()" class="mb-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                        <i class="fas fa-plus mr-2"></i>New Post
                    </button>
                    <div id="forumList"></div>
                </div>

                <!-- Hardware Kit Tab -->
                <div id="hardwareTab" class="tab-content hidden">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">Hardware Kit Tracking</h2>
                    <div id="hardwareStatus"></div>
                </div>
            </main>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script src="/static/app.js"></script>
</body>
</html>
  `)
})

export default app
