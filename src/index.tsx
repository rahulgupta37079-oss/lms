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
    
    // Get MCQs for this lesson
    const mcqs = await c.env.DB.prepare(`
      SELECT * FROM mcqs WHERE lesson_id = ? ORDER BY order_index
    `).bind(lessonId).all()
    
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
      mcqs: mcqs.results,
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

// MCQ Answer Submission
app.post('/api/mcq/submit', async (c) => {
  try {
    const { studentId, lessonId, answers } = await c.req.json()
    
    // Get all correct answers from database
    const mcqs = await c.env.DB.prepare(`
      SELECT id, correct_option FROM mcqs WHERE lesson_id = ?
    `).bind(lessonId).all()
    
    // Calculate score
    let correctCount = 0
    const results = mcqs.results.map((mcq: any) => {
      const studentAnswer = answers[mcq.id]
      const isCorrect = studentAnswer === mcq.correct_option
      if (isCorrect) correctCount++
      return {
        mcqId: mcq.id,
        correct: isCorrect,
        correctAnswer: mcq.correct_option,
        studentAnswer
      }
    })
    
    const score = mcqs.results.length > 0 ? Math.round((correctCount / mcqs.results.length) * 100) : 0
    
    // Save MCQ result
    await c.env.DB.prepare(`
      INSERT INTO mcq_results (student_id, lesson_id, score, total_questions, correct_answers, submitted_at)
      VALUES (?, ?, ?, ?, ?, datetime("now"))
    `).bind(studentId, lessonId, score, mcqs.results.length, correctCount).run()
    
    return c.json({
      success: true,
      score,
      correctCount,
      totalQuestions: mcqs.results.length,
      results
    })
  } catch (error) {
    return c.json({ error: 'Failed to submit MCQ' }, 500)
  }
})

// ============================================
// LIVE TEST ROUTES
// ============================================

app.get('/api/tests/:studentId', async (c) => {
  try {
    const studentId = c.req.param('studentId')
    
    const tests = await c.env.DB.prepare(`
      SELECT 
        t.*,
        m.title as module_title,
        tr.score,
        tr.submitted_at
      FROM live_tests t
      JOIN modules m ON t.module_id = m.id
      LEFT JOIN test_results tr ON t.id = tr.test_id AND tr.student_id = ?
      ORDER BY t.scheduled_at ASC
    `).bind(studentId).all()
    
    return c.json(tests.results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch tests' }, 500)
  }
})

app.get('/api/tests/:testId/questions', async (c) => {
  try {
    const testId = c.req.param('testId')
    
    const test = await c.env.DB.prepare(
      'SELECT * FROM live_tests WHERE id = ?'
    ).bind(testId).first()
    
    const questions = await c.env.DB.prepare(`
      SELECT * FROM test_questions WHERE test_id = ? ORDER BY order_index
    `).bind(testId).all()
    
    return c.json({
      test,
      questions: questions.results
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch test questions' }, 500)
  }
})

app.post('/api/tests/submit', async (c) => {
  try {
    const { testId, studentId, answers, timeSpent } = await c.req.json()
    
    // Get correct answers
    const questions = await c.env.DB.prepare(`
      SELECT id, correct_option FROM test_questions WHERE test_id = ?
    `).bind(testId).all()
    
    // Calculate score
    let correctCount = 0
    const results = questions.results.map((q: any) => {
      const studentAnswer = answers[q.id]
      const isCorrect = studentAnswer === q.correct_option
      if (isCorrect) correctCount++
      return {
        questionId: q.id,
        correct: isCorrect,
        correctAnswer: q.correct_option,
        studentAnswer
      }
    })
    
    const score = questions.results.length > 0 ? Math.round((correctCount / questions.results.length) * 100) : 0
    
    // Save test result
    await c.env.DB.prepare(`
      INSERT INTO test_results (test_id, student_id, score, total_questions, correct_answers, time_spent, submitted_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime("now"))
    `).bind(testId, studentId, score, questions.results.length, correctCount, timeSpent).run()
    
    return c.json({
      success: true,
      score,
      correctCount,
      totalQuestions: questions.results.length,
      results
    })
  } catch (error) {
    return c.json({ error: 'Failed to submit test' }, 500)
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
        s.submitted_at,
        s.feedback
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
// LIVE SESSIONS ROUTES
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

// ============================================
// MESSAGING ROUTES
// ============================================

app.get('/api/messages/:studentId', async (c) => {
  try {
    const studentId = c.req.param('studentId')
    
    const messages = await c.env.DB.prepare(`
      SELECT * FROM messages 
      WHERE sender_id = ? OR receiver_id = ?
      ORDER BY sent_at DESC
    `).bind(studentId, studentId).all()
    
    return c.json(messages.results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch messages' }, 500)
  }
})

app.post('/api/messages/send', async (c) => {
  try {
    const { senderId, receiverId, message } = await c.req.json()
    
    await c.env.DB.prepare(`
      INSERT INTO messages (sender_id, receiver_id, message, sent_at, is_read)
      VALUES (?, ?, ?, datetime("now"), 0)
    `).bind(senderId, receiverId, message).run()
    
    return c.json({ success: true, message: 'Message sent' })
  } catch (error) {
    return c.json({ error: 'Failed to send message' }, 500)
  }
})

// ============================================
// CERTIFICATES ROUTES
// ============================================

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

app.post('/api/certificates/generate', async (c) => {
  try {
    const { studentId, certificateType } = await c.req.json()
    
    // Generate unique certificate ID
    const timestamp = Date.now()
    const certificateId = `PB-IOT-${new Date().getFullYear()}-${timestamp.toString().slice(-5)}`
    
    await c.env.DB.prepare(`
      INSERT INTO certificates (student_id, certificate_id, certificate_type, issued_date, is_verified)
      VALUES (?, ?, ?, datetime("now"), 1)
    `).bind(studentId, certificateId, certificateType).run()
    
    return c.json({ 
      success: true, 
      certificateId,
      verifyUrl: `https://verify.passionbots.in/${certificateId}`
    })
  } catch (error) {
    return c.json({ error: 'Failed to generate certificate' }, 500)
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
    <title>PassionBots LMS - Login</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="/static/styles.css" rel="stylesheet">
</head>
<body>
    <div id="app"></div>
    
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script src="/static/app.js"></script>
</body>
</html>
  `)
})

export default app
