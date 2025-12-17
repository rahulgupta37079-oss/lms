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

app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    const student = await c.env.DB.prepare(
      'SELECT * FROM students WHERE email = ? AND password = ?'
    ).bind(email, password).first()
    
    if (!student) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }
    
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

app.get('/api/dashboard/:studentId', async (c) => {
  try {
    const studentId = c.req.param('studentId')
    
    const totalLessons = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM lessons WHERE is_published = 1'
    ).first()
    
    const completedLessons = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM student_progress WHERE student_id = ? AND status = "completed"'
    ).bind(studentId).first()
    
    const inProgressLessons = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM student_progress WHERE student_id = ? AND status = "in_progress"'
    ).bind(studentId).first()
    
    const totalAssignments = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM assignments'
    ).first()
    
    const submittedAssignments = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM submissions WHERE student_id = ?'
    ).bind(studentId).first()
    
    const upcomingSessions = await c.env.DB.prepare(
      'SELECT * FROM live_sessions WHERE session_date > datetime("now") ORDER BY session_date ASC LIMIT 3'
    ).all()
    
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

app.get('/api/modules/:moduleId/lessons/:studentId', async (c) => {
  try {
    const moduleId = c.req.param('moduleId')
    const studentId = c.req.param('studentId')
    
    const module = await c.env.DB.prepare(
      'SELECT * FROM modules WHERE id = ?'
    ).bind(moduleId).first()
    
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
// OTHER API ROUTES (Sessions, Certificates, etc.)
// ============================================

app.get('/api/sessions', async (c) => {
  try {
    const sessions = await c.env.DB.prepare(`
      SELECT ls.*, m.title as module_title
      FROM live_sessions ls
      JOIN modules m ON ls.module_id = m.id
      ORDER BY ls.session_date ASC
    `).all()
    
    return c.json(sessions.results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch sessions' }, 500)
  }
})

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

app.get('/api/verify/:certificateId', async (c) => {
  try {
    const certificateId = c.req.param('certificateId')
    const certificate = await c.env.DB.prepare(`
      SELECT c.*, s.full_name, s.email, s.university
      FROM certificates c
      JOIN students s ON c.student_id = s.id
      WHERE c.certificate_id = ? AND c.is_verified = 1
    `).bind(certificateId).first()
    
    if (!certificate) {
      return c.json({ error: 'Certificate not found or invalid' }, 404)
    }
    
    return c.json({ verified: true, certificate })
  } catch (error) {
    return c.json({ error: 'Verification failed' }, 500)
  }
})

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
// FRONTEND
// ============================================

app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PassionBots LMS</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #1a1d29;
            color: #ffffff;
            overflow-x: hidden;
        }
        
        /* Color Variables */
        :root {
            --primary-bg: #1a1d29;
            --secondary-bg: #252834;
            --card-bg: #2a2d3a;
            --accent-yellow: #FDB022;
            --text-primary: #ffffff;
            --text-secondary: #a0a3b5;
            --border-color: #3a3d4a;
        }
        
        /* Welcome Screen */
        .welcome-screen {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #1a1d29;
            padding: 2rem;
        }
        
        .welcome-container {
            max-width: 800px;
            text-align: center;
        }
        
        .logo-section {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            margin-bottom: 3rem;
        }
        
        .logo-icon {
            width: 60px;
            height: 60px;
            background: var(--accent-yellow);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
        }
        
        .logo-text h1 {
            font-size: 36px;
            font-weight: 700;
            color: var(--accent-yellow);
            margin-bottom: 4px;
        }
        
        .logo-text p {
            font-size: 12px;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        
        .welcome-title {
            font-size: 48px;
            font-weight: 800;
            margin-bottom: 1rem;
            line-height: 1.2;
        }
        
        .welcome-subtitle {
            font-size: 20px;
            color: var(--text-secondary);
            margin-bottom: 3rem;
        }
        
        .welcome-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-bottom: 3rem;
        }
        
        .btn-primary {
            background: var(--accent-yellow);
            color: #1a1d29;
            padding: 16px 40px;
            border-radius: 12px;
            font-size: 18px;
            font-weight: 600;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(253, 176, 34, 0.3);
        }
        
        .btn-secondary {
            background: var(--secondary-bg);
            color: var(--text-primary);
            padding: 16px 40px;
            border-radius: 12px;
            font-size: 18px;
            font-weight: 600;
            border: 2px solid var(--border-color);
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .btn-secondary:hover {
            border-color: var(--accent-yellow);
            background: rgba(253, 176, 34, 0.1);
        }
        
        .progress-circle {
            margin: 0 auto;
            width: 200px;
            height: 200px;
            position: relative;
        }
        
        .progress-circle svg {
            transform: rotate(-90deg);
        }
        
        .progress-circle-bg {
            fill: none;
            stroke: var(--secondary-bg);
            stroke-width: 12;
        }
        
        .progress-circle-fill {
            fill: none;
            stroke: var(--accent-yellow);
            stroke-width: 12;
            stroke-linecap: round;
            transition: stroke-dashoffset 0.5s;
        }
        
        .progress-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
        }
        
        .progress-value {
            font-size: 48px;
            font-weight: 800;
            color: var(--text-primary);
        }
        
        .progress-label {
            font-size: 14px;
            color: var(--text-secondary);
            margin-top: 4px;
        }
        
        .quick-links {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
            margin-top: 3rem;
        }
        
        .quick-link-card {
            background: var(--card-bg);
            padding: 2rem;
            border-radius: 16px;
            text-align: center;
            transition: all 0.3s;
            cursor: pointer;
        }
        
        .quick-link-card:hover {
            transform: translateY(-4px);
            background: var(--secondary-bg);
        }
        
        .quick-link-icon {
            width: 60px;
            height: 60px;
            background: rgba(253, 176, 34, 0.1);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
            font-size: 28px;
            color: var(--accent-yellow);
        }
        
        .quick-link-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }
        
        /* Main App Layout */
        .app-container {
            display: none;
        }
        
        .app-container.active {
            display: flex;
        }
        
        /* Sidebar */
        .sidebar {
            width: 80px;
            background: var(--secondary-bg);
            height: 100vh;
            position: fixed;
            left: 0;
            top: 0;
            padding: 2rem 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            border-right: 1px solid var(--border-color);
            z-index: 100;
        }
        
        .sidebar-logo {
            width: 50px;
            height: 50px;
            background: var(--accent-yellow);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 3rem;
            font-size: 24px;
            color: #1a1d29;
        }
        
        .sidebar-menu {
            flex: 1;
            width: 100%;
        }
        
        .sidebar-item {
            width: 100%;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: var(--text-secondary);
            font-size: 24px;
            position: relative;
            transition: all 0.3s;
        }
        
        .sidebar-item:hover {
            color: var(--accent-yellow);
        }
        
        .sidebar-item.active {
            background: var(--accent-yellow);
            color: #1a1d29;
        }
        
        .sidebar-item.active::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 30px;
            background: var(--accent-yellow);
        }
        
        /* Header */
        .header {
            margin-left: 80px;
            height: 80px;
            background: var(--secondary-bg);
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 2rem;
            position: sticky;
            top: 0;
            z-index: 90;
        }
        
        .header-left {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .header-logo {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .header-logo-icon {
            font-size: 24px;
            color: var(--accent-yellow);
        }
        
        .header-logo-text {
            font-size: 20px;
            font-weight: 700;
            color: var(--text-primary);
        }
        
        .page-title {
            font-size: 24px;
            font-weight: 600;
            color: var(--text-primary);
            margin-left: 2rem;
        }
        
        .header-right {
            display: flex;
            align-items: center;
            gap: 1.5rem;
        }
        
        .search-icon {
            font-size: 20px;
            color: var(--text-secondary);
            cursor: pointer;
        }
        
        .user-profile {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--accent-yellow);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            position: relative;
        }
        
        .notification-badge {
            position: absolute;
            top: -4px;
            right: -4px;
            width: 18px;
            height: 18px;
            background: #ff4444;
            border-radius: 50%;
            font-size: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid var(--secondary-bg);
        }
        
        /* Main Content */
        .main-content {
            margin-left: 80px;
            min-height: calc(100vh - 80px);
            padding: 2rem;
        }
        
        .content-section {
            display: none;
        }
        
        .content-section.active {
            display: block;
        }
        
        /* Dashboard Styles */
        .continue-learning {
            background: var(--card-bg);
            border-radius: 20px;
            padding: 2rem;
            margin-bottom: 2rem;
        }
        
        .section-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 1.5rem;
        }
        
        .learning-card {
            background: var(--secondary-bg);
            border-radius: 16px;
            padding: 1.5rem;
        }
        
        .learning-level {
            font-size: 12px;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 0.5rem;
        }
        
        .learning-title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 1rem;
        }
        
        .progress-bar {
            width: 100%;
            height: 8px;
            background: var(--primary-bg);
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 0.5rem;
        }
        
        .progress-fill {
            height: 100%;
            background: var(--accent-yellow);
            border-radius: 4px;
            transition: width 0.5s;
        }
        
        .progress-percent {
            font-size: 14px;
            color: var(--text-secondary);
            text-align: right;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .stat-card {
            background: var(--card-bg);
            border-radius: 16px;
            padding: 1.5rem;
        }
        
        .stat-value {
            font-size: 36px;
            font-weight: 800;
            color: var(--accent-yellow);
            margin-bottom: 0.5rem;
        }
        
        .stat-label {
            font-size: 14px;
            color: var(--text-secondary);
        }
        
        /* Course Cards */
        .courses-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
        }
        
        .course-card {
            background: var(--card-bg);
            border-radius: 16px;
            overflow: hidden;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .course-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }
        
        .course-image {
            width: 100%;
            height: 160px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            color: white;
        }
        
        .course-content {
            padding: 1.5rem;
        }
        
        .course-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 1rem;
        }
        
        .course-progress {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }
        
        .course-progress-text {
            font-size: 12px;
            color: var(--text-secondary);
        }
        
        .course-progress-percent {
            font-size: 14px;
            font-weight: 600;
            color: var(--accent-yellow);
        }
        
        /* Utility Classes */
        .hidden {
            display: none !important;
        }
        
        .text-yellow {
            color: var(--accent-yellow);
        }
        
        .bg-yellow {
            background: var(--accent-yellow);
        }
    </style>
</head>
<body>
    <!-- Welcome Screen -->
    <div id="welcomeScreen" class="welcome-screen">
        <div class="welcome-container">
            <div class="logo-section">
                <div class="logo-icon">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="logo-text">
                    <h1>PassionBots</h1>
                    <p>Digital Learning Platform</p>
                </div>
            </div>
            
            <h1 class="welcome-title">Welcome Back Student!</h1>
            <p class="welcome-subtitle">Continue Your Robotics Journey</p>
            
            <div class="welcome-actions">
                <button class="btn-primary" onclick="showApp()">
                    Start Learning <i class="fas fa-arrow-right"></i>
                </button>
                <button class="btn-secondary" onclick="showMyCourses()">
                    My Courses
                </button>
            </div>
            
            <div class="progress-circle">
                <svg width="200" height="200">
                    <circle class="progress-circle-bg" cx="100" cy="100" r="90"></circle>
                    <circle class="progress-circle-fill" cx="100" cy="100" r="90" 
                            stroke-dasharray="565.48" stroke-dashoffset="200"></circle>
                </svg>
                <div class="progress-text">
                    <div class="progress-value">65%</div>
                    <div class="progress-label">Learning Completion</div>
                </div>
            </div>
            
            <div class="quick-links">
                <div class="quick-link-card" onclick="showApp('courses')">
                    <div class="quick-link-icon">
                        <i class="fas fa-book"></i>
                    </div>
                    <div class="quick-link-title">My Courses</div>
                </div>
                <div class="quick-link-card" onclick="showApp('progress')">
                    <div class="quick-link-icon">
                        <i class="fas fa-chart-bar"></i>
                    </div>
                    <div class="quick-link-title">Progress</div>
                </div>
                <div class="quick-link-card" onclick="showApp('achievements')">
                    <div class="quick-link-icon">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <div class="quick-link-title">Achievements</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Main App -->
    <div id="appContainer" class="app-container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-logo">
                <i class="fas fa-robot"></i>
            </div>
            
            <nav class="sidebar-menu">
                <div class="sidebar-item active" data-section="dashboard">
                    <i class="fas fa-home"></i>
                </div>
                <div class="sidebar-item" data-section="courses">
                    <i class="fas fa-book"></i>
                </div>
                <div class="sidebar-item" data-section="schedule">
                    <i class="fas fa-calendar"></i>
                </div>
                <div class="sidebar-item" data-section="progress">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="sidebar-item" data-section="settings">
                    <i class="fas fa-cog"></i>
                </div>
            </nav>
            
            <div class="sidebar-item" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i>
            </div>
        </aside>

        <!-- Main Content Area -->
        <div style="flex: 1;">
            <!-- Header -->
            <header class="header">
                <div class="header-left">
                    <div class="header-logo">
                        <span class="header-logo-icon">
                            <i class="fas fa-heart"></i>
                        </span>
                        <span class="header-logo-text">PassionBots</span>
                    </div>
                    <h1 class="page-title" id="pageTitle">My Learning Dashboard</h1>
                </div>
                <div class="header-right">
                    <i class="fas fa-search search-icon"></i>
                    <div class="user-profile">
                        <i class="fas fa-user"></i>
                        <span class="notification-badge">3</span>
                    </div>
                </div>
            </header>

            <!-- Main Content -->
            <main class="main-content">
                <!-- Dashboard Section -->
                <div id="dashboardSection" class="content-section active">
                    <div class="continue-learning">
                        <h2 class="section-title">Continue Learning</h2>
                        <div class="learning-card">
                            <div class="learning-level">Foundation Level</div>
                            <h3 class="learning-title">Module 2. Visual Programming</h3>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 65%"></div>
                            </div>
                            <div class="progress-percent">65%</div>
                        </div>
                    </div>

                    <div class="stats-grid">
                        <div class="stat-card">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div>
                                    <div class="stat-value">12</div>
                                    <div class="stat-label">Hours<br>completed</div>
                                </div>
                                <div style="font-size: 36px; color: var(--accent-yellow);">
                                    <i class="fas fa-clock"></i>
                                </div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div>
                                    <div class="stat-value">3</div>
                                    <div class="stat-label">Modules<br>Finished</div>
                                </div>
                                <div style="font-size: 36px; color: var(--accent-yellow);">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h2 class="section-title">Your Courses</h2>
                    <div class="courses-grid" id="coursesGrid"></div>
                </div>

                <!-- Other Sections (placeholder) -->
                <div id="coursesSection" class="content-section">
                    <h2 class="section-title">All Courses</h2>
                    <div class="courses-grid" id="allCoursesGrid"></div>
                </div>

                <div id="progressSection" class="content-section">
                    <h2 class="section-title">My Progress & Achievements</h2>
                    <div id="progressContent"></div>
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
