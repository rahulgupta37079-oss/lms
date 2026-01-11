import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database;
  OPENAI_API_KEY?: string;  // Optional: OpenAI API key
  OPENAI_BASE_URL?: string;  // Optional: Custom API base URL
  RESEND_API_KEY?: string;  // Resend API key for email sending
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS
app.use('/api/*', cors())

// Serve static files from public directory
app.use('/static/*', serveStatic({ root: './' }))
app.use('/landing.html', serveStatic({ path: 'landing.html' }))
app.use('/features.html', serveStatic({ path: 'features.html' }))
app.use('/curriculum-browser.html', serveStatic({ path: 'curriculum-browser.html' }))
app.use('/manifest.json', serveStatic({ path: 'manifest.json' }))
app.use('/test.html', serveStatic({ path: 'test.html' }))

// ============================================
// AUTHENTICATION ROUTES
// ============================================

app.post('/api/auth/login', async (c) => {
  try {
    const { email, password, role } = await c.req.json()
    
    // Check if mentor login
    if (role === 'mentor') {
      const mentor = await c.env.DB.prepare(
        'SELECT * FROM mentors WHERE email = ? AND password = ?'
      ).bind(email, password).first()
      
      if (!mentor) {
        return c.json({ error: 'Invalid credentials' }, 401)
      }
      
      const { password: _, ...mentorData } = mentor
      
      return c.json({ 
        success: true, 
        mentor: mentorData,
        role: 'mentor',
        message: 'Mentor login successful' 
      })
    }
    
    // Student login
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
      role: 'student',
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
// MENTOR ROUTES
// ============================================

// Mentor Dashboard
app.get('/api/mentor/dashboard/:mentorId', async (c) => {
  try {
    const mentorId = c.req.param('mentorId')
    
    // Get mentor's assigned students count
    const studentsCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM student_mentor_mapping WHERE mentor_id = ?'
    ).bind(mentorId).first()
    
    // Get pending submissions count
    const pendingSubmissions = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM submissions s
      JOIN student_mentor_mapping smm ON s.student_id = smm.student_id
      WHERE smm.mentor_id = ? AND s.status = 'pending'
    `).bind(mentorId).first()
    
    // Get total assignments
    const totalAssignments = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM assignments'
    ).first()
    
    // Get upcoming sessions
    const upcomingSessions = await c.env.DB.prepare(
      'SELECT * FROM live_sessions WHERE session_date > datetime("now") ORDER BY session_date ASC LIMIT 5'
    ).all()
    
    // Get unread messages count
    const unreadMessages = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0'
    ).bind(mentorId).first()
    
    return c.json({
      stats: {
        totalStudents: studentsCount?.count || 0,
        pendingSubmissions: pendingSubmissions?.count || 0,
        totalAssignments: totalAssignments?.count || 0,
        unreadMessages: unreadMessages?.count || 0
      },
      upcomingSessions: upcomingSessions.results
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch mentor dashboard' }, 500)
  }
})

// Get mentor's students
app.get('/api/mentor/:mentorId/students', async (c) => {
  try {
    const mentorId = c.req.param('mentorId')
    
    const students = await c.env.DB.prepare(`
      SELECT 
        s.*,
        COUNT(DISTINCT sp.lesson_id) as completed_lessons,
        COUNT(DISTINCT CASE WHEN sub.status = 'submitted' OR sub.status = 'graded' THEN sub.id END) as submitted_assignments
      FROM students s
      JOIN student_mentor_mapping smm ON s.id = smm.student_id
      LEFT JOIN student_progress sp ON s.id = sp.student_id AND sp.status = 'completed'
      LEFT JOIN submissions sub ON s.id = sub.student_id
      WHERE smm.mentor_id = ?
      GROUP BY s.id
      ORDER BY s.full_name ASC
    `).bind(mentorId).all()
    
    return c.json(students.results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch students' }, 500)
  }
})

// Get student detail for mentor
app.get('/api/mentor/student/:studentId/detail', async (c) => {
  try {
    const studentId = c.req.param('studentId')
    
    // Get student info
    const student = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ?'
    ).bind(studentId).first()
    
    // Get progress stats
    const progress = await c.env.DB.prepare(`
      SELECT 
        COUNT(DISTINCT CASE WHEN sp.status = 'completed' THEN sp.lesson_id END) as completed_lessons,
        COUNT(DISTINCT CASE WHEN sp.status = 'in_progress' THEN sp.lesson_id END) as in_progress_lessons,
        COUNT(DISTINCT l.id) as total_lessons
      FROM lessons l
      LEFT JOIN student_progress sp ON l.id = sp.lesson_id AND sp.student_id = ?
      WHERE l.is_published = 1
    `).bind(studentId).first()
    
    // Get test results
    const testResults = await c.env.DB.prepare(`
      SELECT tr.*, lt.title as test_title
      FROM test_results tr
      JOIN live_tests lt ON tr.test_id = lt.id
      WHERE tr.student_id = ?
      ORDER BY tr.submitted_at DESC
    `).bind(studentId).all()
    
    // Get submissions
    const submissions = await c.env.DB.prepare(`
      SELECT s.*, a.title as assignment_title, a.max_score
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      WHERE s.student_id = ?
      ORDER BY s.submitted_at DESC
    `).bind(studentId).all()
    
    return c.json({
      student,
      progress,
      testResults: testResults.results,
      submissions: submissions.results
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch student details' }, 500)
  }
})

// Get pending submissions for mentor
app.get('/api/mentor/:mentorId/submissions/pending', async (c) => {
  try {
    const mentorId = c.req.param('mentorId')
    
    const submissions = await c.env.DB.prepare(`
      SELECT 
        s.*,
        a.title as assignment_title,
        a.max_score,
        st.full_name as student_name,
        st.email as student_email,
        m.title as module_title
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN students st ON s.student_id = st.id
      JOIN modules m ON a.module_id = m.id
      JOIN student_mentor_mapping smm ON st.id = smm.student_id
      WHERE smm.mentor_id = ? AND s.status = 'pending'
      ORDER BY s.submitted_at ASC
    `).bind(mentorId).all()
    
    return c.json(submissions.results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch pending submissions' }, 500)
  }
})

// Grade submission
app.post('/api/mentor/submission/:submissionId/grade', async (c) => {
  try {
    const submissionId = c.req.param('submissionId')
    const { score, feedback, status } = await c.req.json()
    
    await c.env.DB.prepare(`
      UPDATE submissions
      SET score = ?, feedback = ?, status = ?, graded_at = datetime("now")
      WHERE id = ?
    `).bind(score, feedback, status || 'graded', submissionId).run()
    
    return c.json({ success: true, message: 'Submission graded successfully' })
  } catch (error) {
    return c.json({ error: 'Failed to grade submission' }, 500)
  }
})

// Get all submissions (graded and pending)
app.get('/api/mentor/:mentorId/submissions/all', async (c) => {
  try {
    const mentorId = c.req.param('mentorId')
    
    const submissions = await c.env.DB.prepare(`
      SELECT 
        s.*,
        a.title as assignment_title,
        a.max_score,
        st.full_name as student_name,
        st.email as student_email,
        m.title as module_title
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN students st ON s.student_id = st.id
      JOIN modules m ON a.module_id = m.id
      JOIN student_mentor_mapping smm ON st.id = smm.student_id
      WHERE smm.mentor_id = ?
      ORDER BY s.submitted_at DESC
    `).bind(mentorId).all()
    
    return c.json(submissions.results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch submissions' }, 500)
  }
})

// Get mentor messages
app.get('/api/mentor/:mentorId/messages', async (c) => {
  try {
    const mentorId = c.req.param('mentorId')
    
    const messages = await c.env.DB.prepare(`
      SELECT m.*, s.full_name as sender_name
      FROM messages m
      LEFT JOIN students s ON m.sender_id = s.id
      WHERE m.receiver_id = ? OR m.sender_id = ?
      ORDER BY m.sent_at DESC
      LIMIT 50
    `).bind(mentorId, mentorId).all()
    
    return c.json(messages.results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch messages' }, 500)
  }
})

// Send message from mentor
app.post('/api/mentor/message/send', async (c) => {
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

// Get analytics/reports
app.get('/api/mentor/:mentorId/analytics', async (c) => {
  try {
    const mentorId = c.req.param('mentorId')
    
    // Student engagement stats
    const engagement = await c.env.DB.prepare(`
      SELECT 
        COUNT(DISTINCT s.id) as total_students,
        COUNT(DISTINCT CASE WHEN sp.last_accessed > datetime('now', '-7 days') THEN s.id END) as active_students,
        AVG(CASE WHEN l_total.count > 0 THEN (l_completed.count * 100.0 / l_total.count) ELSE 0 END) as avg_progress
      FROM students s
      JOIN student_mentor_mapping smm ON s.id = smm.student_id
      LEFT JOIN student_progress sp ON s.id = sp.student_id
      LEFT JOIN (
        SELECT COUNT(*) as count FROM lessons WHERE is_published = 1
      ) l_total
      LEFT JOIN (
        SELECT student_id, COUNT(*) as count 
        FROM student_progress 
        WHERE status = 'completed'
        GROUP BY student_id
      ) l_completed ON s.id = l_completed.student_id
      WHERE smm.mentor_id = ?
    `).bind(mentorId).first()
    
    // Assignment completion rate
    const assignmentStats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_assignments,
        COUNT(CASE WHEN status = 'graded' THEN 1 END) as graded,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        AVG(CASE WHEN score IS NOT NULL THEN score ELSE 0 END) as avg_score
      FROM submissions s
      JOIN student_mentor_mapping smm ON s.student_id = smm.student_id
      WHERE smm.mentor_id = ?
    `).bind(mentorId).first()
    
    // Test performance
    const testStats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_tests,
        AVG(score) as avg_score,
        MAX(score) as highest_score,
        MIN(score) as lowest_score
      FROM test_results tr
      JOIN student_mentor_mapping smm ON tr.student_id = smm.student_id
      WHERE smm.mentor_id = ?
    `).bind(mentorId).first()
    
    return c.json({
      engagement,
      assignments: assignmentStats,
      tests: testStats
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch analytics' }, 500)
  }
})

// ============================================
// FRONTEND
// ============================================

// ============================================
// GAMIFICATION ROUTES (v6.0)
// ============================================

// Get student gamification data
app.get('/api/gamification/:studentId', async (c) => {
  try {
    const studentId = c.req.param('studentId')
    
    let gamification = await c.env.DB.prepare(
      'SELECT * FROM student_gamification WHERE student_id = ?'
    ).bind(studentId).first()
    
    // Create if doesn't exist
    if (!gamification) {
      await c.env.DB.prepare(`
        INSERT INTO student_gamification (student_id, xp, level, streak_days, last_login_date)
        VALUES (?, 0, 1, 0, date('now'))
      `).bind(studentId).run()
      
      gamification = { xp: 0, level: 1, streak_days: 0, badges: [] }
    }
    
    // Get badges
    const badges = await c.env.DB.prepare(`
      SELECT b.* FROM student_badges sb
      JOIN badges b ON sb.badge_id = b.badge_id
      WHERE sb.student_id = ?
    `).bind(studentId).all()
    
    return c.json({
      ...gamification,
      badges: badges.results
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch gamification data' }, 500)
  }
})

// Update gamification data
app.post('/api/gamification/update', async (c) => {
  try {
    const { studentId, xp, level, streak } = await c.req.json()
    
    await c.env.DB.prepare(`
      UPDATE student_gamification
      SET xp = ?, level = ?, streak_days = ?, updated_at = datetime('now')
      WHERE student_id = ?
    `).bind(xp, level, streak, studentId).run()
    
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to update gamification data' }, 500)
  }
})

// Unlock badge
app.post('/api/gamification/badge/unlock', async (c) => {
  try {
    const { studentId, badgeId } = await c.req.json()
    
    await c.env.DB.prepare(`
      INSERT OR IGNORE INTO student_badges (student_id, badge_id)
      VALUES (?, ?)
    `).bind(studentId, badgeId).run()
    
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to unlock badge' }, 500)
  }
})

// Get leaderboard
app.get('/api/leaderboard/:category', async (c) => {
  try {
    const category = c.req.param('category')
    
    const leaderboard = await c.env.DB.prepare(`
      SELECT 
        s.id,
        s.full_name,
        sg.xp,
        sg.level,
        sg.streak_days,
        ROW_NUMBER() OVER (ORDER BY sg.xp DESC) as rank
      FROM student_gamification sg
      JOIN students s ON sg.student_id = s.id
      ORDER BY sg.xp DESC
      LIMIT 100
    `).all()
    
    return c.json(leaderboard.results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch leaderboard' }, 500)
  }
})

// Get daily challenges
app.get('/api/challenges/daily', async (c) => {
  try {
    const challenges = await c.env.DB.prepare(`
      SELECT * FROM daily_challenges
      WHERE challenge_date = date('now') AND is_active = 1
    `).all()
    
    return c.json(challenges.results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch challenges' }, 500)
  }
})

// ============================================
// AI ASSISTANT ROUTES (v6.0)
// ============================================

// Save AI chat message
app.post('/api/ai/chat', async (c) => {
  try {
    const { studentId, message, context } = await c.req.json()
    const messageType = 'user'
    const messageText = message
    
    // Save user message to database
    await c.env.DB.prepare(`
      INSERT INTO ai_chat_history (student_id, message_type, message_text, context)
      VALUES (?, ?, ?, ?)
    `).bind(studentId, messageType, messageText, context || '').run()
    
    // Get recent chat history for context
    const history = await c.env.DB.prepare(`
      SELECT message_type, message_text FROM ai_chat_history
      WHERE student_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `).bind(studentId).all()
    
    // Build conversation history
    const messages = [
      {
        role: 'system',
        content: `You are an expert IoT & Robotics tutor for PassionBots LMS.
                 Help students learn ESP32, Arduino, sensors, actuators, WiFi, Bluetooth, and IoT concepts.
                 Be encouraging, clear, and provide step-by-step explanations.
                 Use simple language and real-world examples.
                 If asked about code, provide well-commented code snippets.`
      },
      ...history.results.reverse().map(msg => ({
        role: msg.message_type === 'user' ? 'user' : 'assistant',
        content: msg.message_text
      }))
    ]
    
    // Call OpenAI API (or GenSpark LLM Proxy)
    let response = ''
    
    try {
      // Try to use OpenAI API if key is available
      const openaiKey = c.env.OPENAI_API_KEY
      const openaiBaseUrl = c.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
      
      if (openaiKey) {
        const aiResponse = await fetch(`${openaiBaseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: messages,
            temperature: 0.7,
            max_tokens: 500
          })
        })
        
        if (aiResponse.ok) {
          const data = await aiResponse.json()
          response = data.choices[0].message.content
        } else {
          throw new Error('API call failed')
        }
      } else {
        // Fallback intelligent responses
        response = generateIntelligentResponse(messageText)
      }
    } catch (error) {
      console.error('AI API Error:', error)
      response = generateIntelligentResponse(messageText)
    }
    
    // Save AI response to database
    await c.env.DB.prepare(`
      INSERT INTO ai_chat_history (student_id, message_type, message_text, context)
      VALUES (?, 'assistant', ?, ?)
    `).bind(studentId, response, context || null).run()
    
    return c.json({ response })
  } catch (error) {
    console.error('Chat error:', error)
    return c.json({ 
      error: 'Failed to process chat',
      response: "I apologize, I'm having trouble connecting right now. Please try again in a moment."
    }, 500)
  }
})

// Intelligent fallback response generator
function generateIntelligentResponse(question: string): string {
  const lowerQ = question.toLowerCase()
  
  // ESP32 related
  if (lowerQ.includes('esp32')) {
    if (lowerQ.includes('wifi') || lowerQ.includes('connect')) {
      return `ESP32 WiFi connectivity is one of its best features! Here's how it works:

1. **Include the WiFi library**: \`#include <WiFi.h>\`
2. **Connect to network**: Use \`WiFi.begin(ssid, password)\`
3. **Check connection**: \`WiFi.status() == WL_CONNECTED\`

Example code:
\`\`\`cpp
#include <WiFi.h>

const char* ssid = "YourWiFi";
const char* password = "YourPassword";

void setup() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
  Serial.println("Connected!");
}
\`\`\`

Would you like to know more about HTTP requests or WebSocket communication?`
    }
    
    if (lowerQ.includes('pin') || lowerQ.includes('gpio')) {
      return `ESP32 has versatile GPIO pins! Here's what you need to know:

**Digital Pins**: GPIO 0-39 (some are input-only)
**Analog Input**: GPIO 32-39 (ADC1), GPIO 0, 2, 4, 12-15, 25-27 (ADC2)
**PWM**: Almost all GPIO pins support PWM

**Basic Usage**:
\`\`\`cpp
// Digital Output
pinMode(2, OUTPUT);
digitalWrite(2, HIGH);

// Digital Input
pinMode(4, INPUT);
int value = digitalRead(4);

// Analog Input (0-4095)
int analogValue = analogRead(34);
\`\`\`

Which specific pin functionality would you like to explore?`
    }
    
    return `ESP32 is a powerful microcontroller with dual-core processors, WiFi, and Bluetooth! 

**Key Features**:
- 240MHz dual-core processor
- Built-in WiFi & Bluetooth
- 34 GPIO pins
- Multiple communication protocols (SPI, I2C, UART)
- Low power consumption modes

What would you like to learn about ESP32? WiFi setup, pin configuration, or sensor interfacing?`
  }
  
  // Sensors
  if (lowerQ.includes('sensor')) {
    return `Sensors are the eyes and ears of your IoT projects! 

**Common Sensors**:
🌡️ **Temperature**: DHT11, DHT22, DS18B20
📏 **Distance**: HC-SR04 (ultrasonic), VL53L0X (laser)
💡 **Light**: LDR, BH1750
🎯 **Motion**: PIR sensor
🧭 **Orientation**: MPU6050 (gyroscope + accelerometer)

**Basic Connection**:
1. Power: 3.3V or 5V (check sensor specs)
2. Ground: GND
3. Data: Connect to GPIO pin

Would you like specific code examples for any sensor?`
  }
  
  // General IoT
  if (lowerQ.includes('iot') || lowerQ.includes('internet of things')) {
    return `IoT (Internet of Things) connects physical devices to the internet for smart automation!

**Core Concepts**:
1. **Sensors**: Collect data from environment
2. **Microcontroller**: Process and control (ESP32, Arduino)
3. **Communication**: WiFi, Bluetooth, LoRa
4. **Cloud**: Store and analyze data
5. **Actuators**: Take physical actions

**Popular IoT Platforms**:
- ThingSpeak
- Blynk
- AWS IoT
- Google Cloud IoT

What IoT project are you thinking of building?`
  }
  
  // Code help
  if (lowerQ.includes('code') || lowerQ.includes('program')) {
    return `I'd love to help with your code! 

**Tips for good IoT code**:
1. ✅ Add comments explaining your logic
2. ✅ Use meaningful variable names
3. ✅ Handle errors gracefully
4. ✅ Test in small increments
5. ✅ Monitor serial output for debugging

Can you share your code snippet? Or describe what you're trying to achieve?`
  }
  
  // Default helpful response
  return `Great question! I'm here to help you learn IoT & Robotics. 

**I can help with**:
- 🤖 ESP32 programming and setup
- 📡 WiFi and Bluetooth connectivity
- 🔌 Sensors and actuators
- 💻 Arduino IDE and libraries
- 🌐 IoT cloud platforms
- 🐛 Debugging code issues
- 💡 Project ideas and guidance

What would you like to explore? Feel free to ask specific questions or share code you're working on!`
}

// Get AI recommendations
app.get('/api/ai/recommendations/:studentId', async (c) => {
  try {
    const studentId = c.req.param('studentId')
    
    const recommendations = await c.env.DB.prepare(`
      SELECT * FROM ai_recommendations
      WHERE student_id = ? AND is_viewed = 0
      ORDER BY confidence_score DESC
      LIMIT 5
    `).bind(studentId).all()
    
    return c.json(recommendations.results)
  } catch (error) {
    return c.json({ error: 'Failed to fetch recommendations' }, 500)
  }
})

// ============================================
// ANALYTICS ROUTES (v6.0)
// ============================================

// Get learning analytics
app.get('/api/analytics/:studentId', async (c) => {
  try {
    const studentId = c.req.param('studentId')
    
    // Last 30 days analytics
    const analytics = await c.env.DB.prepare(`
      SELECT * FROM learning_analytics
      WHERE student_id = ? AND date >= date('now', '-30 days')
      ORDER BY date DESC
    `).bind(studentId).all()
    
    // Skill progress
    const skills = await c.env.DB.prepare(`
      SELECT * FROM skill_progress
      WHERE student_id = ?
      ORDER BY proficiency_level DESC
    `).bind(studentId).all()
    
    return c.json({
      daily_analytics: analytics.results,
      skill_progress: skills.results
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch analytics' }, 500)
  }
})

// ============================================
// CONTENT MANAGEMENT ROUTES (v6.0)
// ============================================

// Content manager interface
app.get('/content-manager', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Content Manager - PassionBots LMS</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <div id="app"></div>
    
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script>
      const MentorState = {
        currentMentor: JSON.parse(localStorage.getItem('currentMentor') || '{"full_name": "Mentor"}')
      }
    </script>
    <script src="/static/content-manager.js"></script>
</body>
</html>
  `)
})

// Create module API
app.post('/api/content/modules/create', async (c) => {
  try {
    const { module_number, title, description, duration_weeks, icon } = await c.req.json()
    
    const result = await c.env.DB.prepare(`
      INSERT INTO modules (module_number, title, description, duration_weeks, icon, is_published)
      VALUES (?, ?, ?, ?, ?, 1)
    `).bind(module_number, title, description, duration_weeks, icon || '📚').run()
    
    return c.json({ 
      success: true, 
      id: result.meta.last_row_id,
      message: 'Module created successfully' 
    })
  } catch (error) {
    return c.json({ error: 'Failed to create module' }, 500)
  }
})

// Create lesson API
app.post('/api/content/lessons/create', async (c) => {
  try {
    const { module_id, title, content, duration_minutes, video_url, order_number } = await c.req.json()
    
    const result = await c.env.DB.prepare(`
      INSERT INTO lessons (module_id, title, content, duration_minutes, video_url, order_number, is_published)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).bind(module_id, title, content, duration_minutes, video_url || null, order_number).run()
    
    return c.json({ 
      success: true, 
      id: result.meta.last_row_id,
      message: 'Lesson created successfully' 
    })
  } catch (error) {
    return c.json({ error: 'Failed to create lesson' }, 500)
  }
})

// Create assignment API
app.post('/api/content/assignments/create', async (c) => {
  try {
    const { title, description, module_id, due_date, max_score, submission_type } = await c.req.json()
    
    const result = await c.env.DB.prepare(`
      INSERT INTO assignments (title, description, module_id, due_date, max_score, submission_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(title, description, module_id, due_date, max_score || 100, submission_type || 'file').run()
    
    return c.json({ 
      success: true, 
      id: result.meta.last_row_id,
      message: 'Assignment created successfully' 
    })
  } catch (error) {
    return c.json({ error: 'Failed to create assignment' }, 500)
  }
})

// ============================================
// K-12 CURRICULUM ROUTES
// ============================================

// Get all grades
app.get('/api/curriculum/grades', async (c) => {
  try {
    const grades = await c.env.DB.prepare(
      'SELECT * FROM grades ORDER BY CASE grade_code WHEN \'KG\' THEN 0 ELSE CAST(grade_code AS INTEGER) END'
    ).all()
    
    return c.json(grades.results || [])
  } catch (error) {
    return c.json({ error: 'Failed to fetch grades' }, 500)
  }
})

// Get curriculum modules for a grade
app.get('/api/curriculum/grade/:gradeId/modules', async (c) => {
  try {
    const gradeId = c.req.param('gradeId')
    
    const modules = await c.env.DB.prepare(`
      SELECT cm.*, g.grade_name, g.grade_code 
      FROM curriculum_modules cm
      JOIN grades g ON cm.grade_id = g.id
      WHERE cm.grade_id = ?
      ORDER BY cm.module_number
    `).bind(gradeId).all()
    
    return c.json(modules.results || [])
  } catch (error) {
    return c.json({ error: 'Failed to fetch modules' }, 500)
  }
})

// Get sessions for a module
app.get('/api/curriculum/module/:moduleId/sessions', async (c) => {
  try {
    const moduleId = c.req.param('moduleId')
    
    const sessions = await c.env.DB.prepare(`
      SELECT * FROM curriculum_sessions
      WHERE module_id = ? AND is_published = 1
      ORDER BY order_number
    `).bind(moduleId).all()
    
    return c.json(sessions.results || [])
  } catch (error) {
    return c.json({ error: 'Failed to fetch sessions' }, 500)
  }
})

// Get session details
app.get('/api/curriculum/session/:sessionId', async (c) => {
  try {
    const sessionId = c.req.param('sessionId')
    
    const session = await c.env.DB.prepare(
      'SELECT * FROM curriculum_sessions WHERE id = ?'
    ).bind(sessionId).first()
    
    if (!session) {
      return c.json({ error: 'Session not found' }, 404)
    }
    
    // Get components for this session
    const components = await c.env.DB.prepare(`
      SELECT kc.*, sc.quantity, sc.is_required
      FROM session_components sc
      JOIN kit_components kc ON sc.component_id = kc.id
      WHERE sc.session_id = ?
    `).bind(sessionId).all()
    
    // Get project if exists
    const project = await c.env.DB.prepare(
      'SELECT * FROM curriculum_projects WHERE session_id = ?'
    ).bind(sessionId).first()
    
    // Get quiz if exists
    const quiz = await c.env.DB.prepare(
      'SELECT * FROM curriculum_quizzes WHERE session_id = ?'
    ).bind(sessionId).first()
    
    return c.json({
      ...session,
      components: components.results || [],
      project,
      quiz
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch session details' }, 500)
  }
})

// Get student progress for a module
app.get('/api/curriculum/student/:studentId/progress/:moduleId', async (c) => {
  try {
    const { studentId, moduleId } = c.req.param()
    
    const progress = await c.env.DB.prepare(`
      SELECT scp.*, cs.title, cs.session_number
      FROM student_curriculum_progress scp
      JOIN curriculum_sessions cs ON scp.session_id = cs.id
      WHERE scp.student_id = ? AND cs.module_id = ?
      ORDER BY cs.order_number
    `).bind(studentId, moduleId).all()
    
    return c.json(progress.results || [])
  } catch (error) {
    return c.json({ error: 'Failed to fetch progress' }, 500)
  }
})

// Update session progress
app.post('/api/curriculum/progress/update', async (c) => {
  try {
    const { studentId, sessionId, status, attendance, participationScore, quizScore, projectSubmission, feedback } = await c.req.json()
    
    const result = await c.env.DB.prepare(`
      INSERT INTO student_curriculum_progress 
      (student_id, session_id, status, attendance, participation_score, quiz_score, project_submission, feedback, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE NULL END)
      ON CONFLICT(student_id, session_id) DO UPDATE SET
        status = excluded.status,
        attendance = excluded.attendance,
        participation_score = excluded.participation_score,
        quiz_score = excluded.quiz_score,
        project_submission = excluded.project_submission,
        feedback = excluded.feedback,
        completed_at = excluded.completed_at
    `).bind(studentId, sessionId, status || 'in_progress', attendance || 0, participationScore || 0, quizScore || 0, projectSubmission || null, feedback || null, status).run()
    
    return c.json({ success: true, message: 'Progress updated' })
  } catch (error) {
    return c.json({ error: 'Failed to update progress' }, 500)
  }
})

// Get all kit components
app.get('/api/curriculum/components', async (c) => {
  try {
    const components = await c.env.DB.prepare(
      'SELECT * FROM kit_components ORDER BY category, name'
    ).all()
    
    return c.json(components.results || [])
  } catch (error) {
    return c.json({ error: 'Failed to fetch components' }, 500)
  }
})

// Get student badges
app.get('/api/curriculum/student/:studentId/badges', async (c) => {
  try {
    const studentId = c.req.param('studentId')
    
    const badges = await c.env.DB.prepare(`
      SELECT cb.*, scb.earned_at
      FROM student_curriculum_badges scb
      JOIN curriculum_badges cb ON scb.badge_id = cb.id
      WHERE scb.student_id = ?
      ORDER BY scb.earned_at DESC
    `).bind(studentId).all()
    
    return c.json(badges.results || [])
  } catch (error) {
    return c.json({ error: 'Failed to fetch badges' }, 500)
  }
})

// Get available badges
app.get('/api/curriculum/badges', async (c) => {
  try {
    const badges = await c.env.DB.prepare(
      'SELECT * FROM curriculum_badges ORDER BY category, points'
    ).all()
    
    return c.json(badges.results || [])
  } catch (error) {
    return c.json({ error: 'Failed to fetch badges' }, 500)
  }
})

// Award badge to student
app.post('/api/curriculum/badge/award', async (c) => {
  try {
    const { studentId, badgeId } = await c.req.json()
    
    const result = await c.env.DB.prepare(`
      INSERT OR IGNORE INTO student_curriculum_badges (student_id, badge_id)
      VALUES (?, ?)
    `).bind(studentId, badgeId).run()
    
    return c.json({ success: true, message: 'Badge awarded' })
  } catch (error) {
    return c.json({ error: 'Failed to award badge' }, 500)
  }
})

// ============================================
// ASSESSMENT SYSTEM ROUTES
// ============================================

// Get all assessments for a grade
app.get('/api/assessments/grade/:gradeId', async (c) => {
  try {
    const gradeId = c.req.param('gradeId')
    
    const assessments = await c.env.DB.prepare(`
      SELECT * FROM assessment_templates 
      WHERE grade_id = ? AND is_published = 1
      ORDER BY assessment_type, created_at
    `).bind(gradeId).all()
    
    return c.json(assessments.results || [])
  } catch (error) {
    return c.json({ error: 'Failed to fetch assessments' }, 500)
  }
})

// Get assessment details with questions
app.get('/api/assessments/:assessmentId', async (c) => {
  try {
    const assessmentId = c.req.param('assessmentId')
    
    const assessment = await c.env.DB.prepare(
      'SELECT * FROM assessment_templates WHERE id = ?'
    ).bind(assessmentId).first()
    
    if (!assessment) {
      return c.json({ error: 'Assessment not found' }, 404)
    }
    
    const questions = await c.env.DB.prepare(`
      SELECT id, question_type, question_text, question_image_url, options, marks, order_number
      FROM assessment_questions 
      WHERE assessment_id = ?
      ORDER BY order_number
    `).bind(assessmentId).all()
    
    return c.json({
      ...assessment,
      questions: questions.results || []
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch assessment' }, 500)
  }
})

// Start an assessment attempt
app.post('/api/assessments/start', async (c) => {
  try {
    const { studentId, assessmentId, sessionId } = await c.req.json()
    
    // Get latest attempt number
    const lastAttempt = await c.env.DB.prepare(`
      SELECT COALESCE(MAX(attempt_number), 0) as last_attempt
      FROM student_assessments
      WHERE student_id = ? AND assessment_id = ?
    `).bind(studentId, assessmentId).first()
    
    const attemptNumber = (lastAttempt?.last_attempt || 0) + 1
    
    // Get total marks
    const assessment = await c.env.DB.prepare(
      'SELECT total_marks FROM assessment_templates WHERE id = ?'
    ).bind(assessmentId).first()
    
    const result = await c.env.DB.prepare(`
      INSERT INTO student_assessments 
      (student_id, assessment_id, session_id, attempt_number, total_marks, status)
      VALUES (?, ?, ?, ?, ?, 'in_progress')
    `).bind(studentId, assessmentId, sessionId || null, attemptNumber, assessment?.total_marks || 100).run()
    
    return c.json({ 
      success: true, 
      assessmentAttemptId: result.meta.last_row_id,
      attemptNumber 
    })
  } catch (error) {
    return c.json({ error: 'Failed to start assessment' }, 500)
  }
})

// Submit an answer
app.post('/api/assessments/answer', async (c) => {
  try {
    const { studentAssessmentId, questionId, studentAnswer, timeSpentSeconds } = await c.req.json()
    
    // Get correct answer and marks
    const question = await c.env.DB.prepare(
      'SELECT correct_answer, marks FROM assessment_questions WHERE id = ?'
    ).bind(questionId).first()
    
    if (!question) {
      return c.json({ error: 'Question not found' }, 404)
    }
    
    const isCorrect = studentAnswer?.toLowerCase().trim() === question.correct_answer?.toLowerCase().trim() ? 1 : 0
    const marksObtained = isCorrect ? question.marks : 0
    
    await c.env.DB.prepare(`
      INSERT OR REPLACE INTO student_answers 
      (student_assessment_id, question_id, student_answer, is_correct, marks_obtained, time_spent_seconds)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(studentAssessmentId, questionId, studentAnswer, isCorrect, marksObtained, timeSpentSeconds || 0).run()
    
    return c.json({ 
      success: true, 
      isCorrect,
      marksObtained 
    })
  } catch (error) {
    return c.json({ error: 'Failed to submit answer' }, 500)
  }
})

// Complete assessment
app.post('/api/assessments/complete', async (c) => {
  try {
    const { studentAssessmentId } = await c.req.json()
    
    // Calculate total score
    const scoreResult = await c.env.DB.prepare(`
      SELECT SUM(marks_obtained) as total_score
      FROM student_answers
      WHERE student_assessment_id = ?
    `).bind(studentAssessmentId).first()
    
    const totalScore = scoreResult?.total_score || 0
    
    // Get total marks
    const assessment = await c.env.DB.prepare(`
      SELECT total_marks FROM assessment_templates at
      JOIN student_assessments sa ON at.id = sa.assessment_id
      WHERE sa.id = ?
    `).bind(studentAssessmentId).first()
    
    const totalMarks = assessment?.total_marks || 100
    const percentage = (totalScore / totalMarks) * 100
    
    // Get start time to calculate duration
    const attemptData = await c.env.DB.prepare(
      'SELECT start_time FROM student_assessments WHERE id = ?'
    ).bind(studentAssessmentId).first()
    
    const startTime = new Date(attemptData?.start_time as string)
    const endTime = new Date()
    const timeTaken = Math.round((endTime.getTime() - startTime.getTime()) / 60000) // minutes
    
    // Update assessment with results
    await c.env.DB.prepare(`
      UPDATE student_assessments 
      SET 
        end_time = CURRENT_TIMESTAMP,
        time_taken_minutes = ?,
        score_obtained = ?,
        percentage = ?,
        status = 'completed'
      WHERE id = ?
    `).bind(timeTaken, totalScore, percentage, studentAssessmentId).run()
    
    return c.json({ 
      success: true,
      scoreObtained: totalScore,
      totalMarks,
      percentage,
      timeTaken 
    })
  } catch (error) {
    return c.json({ error: 'Failed to complete assessment' }, 500)
  }
})

// Get student assessment history
app.get('/api/assessments/student/:studentId/history', async (c) => {
  try {
    const studentId = c.req.param('studentId')
    
    const history = await c.env.DB.prepare(`
      SELECT 
        sa.*,
        at.title as assessment_title,
        at.assessment_type,
        at.difficulty_level
      FROM student_assessments sa
      JOIN assessment_templates at ON sa.assessment_id = at.id
      WHERE sa.student_id = ?
      ORDER BY sa.start_time DESC
    `).bind(studentId).all()
    
    return c.json(history.results || [])
  } catch (error) {
    return c.json({ error: 'Failed to fetch history' }, 500)
  }
})

// Get assessment results with answers
app.get('/api/assessments/results/:studentAssessmentId', async (c) => {
  try {
    const studentAssessmentId = c.req.param('studentAssessmentId')
    
    const assessment = await c.env.DB.prepare(`
      SELECT 
        sa.*,
        at.title as assessment_title,
        at.description,
        at.assessment_type
      FROM student_assessments sa
      JOIN assessment_templates at ON sa.assessment_id = at.id
      WHERE sa.id = ?
    `).bind(studentAssessmentId).first()
    
    if (!assessment) {
      return c.json({ error: 'Assessment not found' }, 404)
    }
    
    const answers = await c.env.DB.prepare(`
      SELECT 
        sa.*,
        aq.question_text,
        aq.question_type,
        aq.correct_answer,
        aq.explanation,
        aq.marks as total_marks
      FROM student_answers sa
      JOIN assessment_questions aq ON sa.question_id = aq.id
      WHERE sa.student_assessment_id = ?
      ORDER BY aq.order_number
    `).bind(studentAssessmentId).all()
    
    return c.json({
      assessment,
      answers: answers.results || []
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch results' }, 500)
  }
})

// Create new assessment (for mentors)
app.post('/api/assessments/create', async (c) => {
  try {
    const { gradeId, assessmentType, title, description, durationMinutes, totalMarks, passingMarks, difficultyLevel } = await c.req.json()
    
    const result = await c.env.DB.prepare(`
      INSERT INTO assessment_templates 
      (grade_id, assessment_type, title, description, duration_minutes, total_marks, passing_marks, difficulty_level)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(gradeId, assessmentType, title, description, durationMinutes, totalMarks, passingMarks, difficultyLevel).run()
    
    return c.json({ 
      success: true, 
      id: result.meta.last_row_id,
      message: 'Assessment created' 
    })
  } catch (error) {
    return c.json({ error: 'Failed to create assessment' }, 500)
  }
})

// Add question to assessment
app.post('/api/assessments/:assessmentId/questions', async (c) => {
  try {
    const assessmentId = c.req.param('assessmentId')
    const { questionType, questionText, questionImageUrl, options, correctAnswer, marks, orderNumber, explanation } = await c.req.json()
    
    const result = await c.env.DB.prepare(`
      INSERT INTO assessment_questions 
      (assessment_id, question_type, question_text, question_image_url, options, correct_answer, marks, order_number, explanation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(assessmentId, questionType, questionText, questionImageUrl || null, options || null, correctAnswer, marks, orderNumber, explanation || null).run()
    
    return c.json({ 
      success: true, 
      id: result.meta.last_row_id,
      message: 'Question added' 
    })
  } catch (error) {
    return c.json({ error: 'Failed to add question' }, 500)
  }
})

// Get assessment statistics
app.get('/api/assessments/:assessmentId/stats', async (c) => {
  try {
    const assessmentId = c.req.param('assessmentId')
    
    const stats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_attempts,
        AVG(percentage) as avg_score,
        MAX(percentage) as highest_score,
        MIN(percentage) as lowest_score,
        AVG(time_taken_minutes) as avg_time
      FROM student_assessments
      WHERE assessment_id = ? AND status = 'completed'
    `).bind(assessmentId).first()
    
    return c.json(stats || {})
  } catch (error) {
    return c.json({ error: 'Failed to fetch stats' }, 500)
  }
})

// ============================================
// CURRICULUM BROWSER
// ============================================

app.get('/curriculum-browser', (c) => {
  return c.redirect('/curriculum-browser.html')
})

// ============================================
// SUBSCRIPTION & PAYMENT ROUTES (RAZORPAY)
// ============================================

// Create Razorpay Order
app.post('/api/subscriptions/create-order', async (c) => {
  try {
    const { planId, planName, amount } = await c.req.json()
    
    // Get Razorpay credentials from environment
    const RAZORPAY_KEY_ID = c.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID'
    const RAZORPAY_KEY_SECRET = c.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET'
    
    // Create order with Razorpay API
    const orderData = {
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        plan_id: planId,
        plan_name: planName
      }
    }
    
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)
      },
      body: JSON.stringify(orderData)
    })
    
    if (!razorpayResponse.ok) {
      throw new Error('Failed to create Razorpay order')
    }
    
    const order = await razorpayResponse.json()
    
    return c.json({
      success: true,
      order_id: order.id,
      razorpay_key: RAZORPAY_KEY_ID,
      amount: amount
    })
  } catch (error) {
    console.error('Create order error:', error)
    return c.json({ success: false, error: 'Failed to create order' }, 500)
  }
})

// Verify Payment and Create Subscription
app.post('/api/subscriptions/verify-payment', async (c) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, plan_id } = await c.req.json()
    
    // Verify signature
    const crypto = await import('crypto')
    const RAZORPAY_KEY_SECRET = c.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET'
    
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')
    
    if (expectedSignature !== razorpay_signature) {
      return c.json({ success: false, error: 'Invalid payment signature' }, 400)
    }
    
    // Get plan details
    const plan = await c.env.DB.prepare(
      'SELECT * FROM subscription_plans WHERE plan_id = ?'
    ).bind(plan_id).first()
    
    if (!plan) {
      return c.json({ success: false, error: 'Invalid plan' }, 400)
    }
    
    // Generate random credentials
    const email = `student${Date.now()}@passionbots.in`
    const password = `PB${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    
    // Create student account
    const studentResult = await c.env.DB.prepare(`
      INSERT INTO students (email, password, full_name, enrollment_date, program_type, subscription_plan_id, subscription_status, subscription_end_date)
      VALUES (?, ?, ?, datetime('now'), ?, ?, 'active', datetime('now', '+30 days'))
    `).bind(
      email,
      password,
      'New Student',
      plan.plan_name,
      plan.plan_id
    ).run()
    
    const userId = studentResult.meta.last_row_id
    
    // Create subscription record
    const subscriptionResult = await c.env.DB.prepare(`
      INSERT INTO subscriptions (user_id, plan_id, plan_name, amount, payment_id, order_id, signature, status, end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', datetime('now', '+30 days'))
    `).bind(
      userId,
      plan.plan_id,
      plan.plan_name,
      plan.price,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    ).run()
    
    // Create payment transaction record
    await c.env.DB.prepare(`
      INSERT INTO payment_transactions (user_id, subscription_id, razorpay_payment_id, razorpay_order_id, razorpay_signature, amount, status, payment_date)
      VALUES (?, ?, ?, ?, ?, ?, 'success', datetime('now'))
    `).bind(
      userId,
      subscriptionResult.meta.last_row_id,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      plan.price
    ).run()
    
    // Create user customization entry
    await c.env.DB.prepare(`
      INSERT INTO user_customizations (user_id, theme_color, dashboard_layout)
      VALUES (?, '#FFD700', 'default')
    `).bind(userId).run()
    
    // Grant resources based on plan
    const resources = {
      basic: ['K-12 Curriculum', 'Live Sessions (2/week)', 'Video Lessons'],
      standard: ['K-12 Curriculum', 'Live Sessions (4/week)', 'Assignments', 'Quizzes', 'Certificates'],
      premium: ['K-12 Curriculum', 'Unlimited Sessions', '1-on-1 Mentoring', 'IoT Kit', 'Advanced Projects']
    }
    
    const planResources = resources[plan.plan_id] || []
    for (const resource of planResources) {
      await c.env.DB.prepare(`
        INSERT INTO subscription_resources (subscription_id, resource_type, resource_name)
        VALUES (?, 'access', ?)
      `).bind(subscriptionResult.meta.last_row_id, resource).run()
    }
    
    // Calculate end date
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1)
    
    return c.json({
      success: true,
      credentials: {
        email: email,
        password: password
      },
      subscription: {
        plan_name: plan.plan_name,
        amount: plan.price,
        valid_until: endDate.toISOString(),
        payment_id: razorpay_payment_id
      }
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    return c.json({ success: false, error: 'Payment verification failed' }, 500)
  }
})

// Get User Subscription Details
app.get('/api/subscriptions/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    const subscription = await c.env.DB.prepare(`
      SELECT s.*, sp.plan_name, sp.features
      FROM subscriptions s
      JOIN subscription_plans sp ON s.plan_id = sp.plan_id
      WHERE s.user_id = ? AND s.status = 'active'
      ORDER BY s.created_at DESC
      LIMIT 1
    `).bind(userId).first()
    
    if (!subscription) {
      return c.json({ error: 'No active subscription' }, 404)
    }
    
    return c.json(subscription)
  } catch (error) {
    return c.json({ error: 'Failed to fetch subscription' }, 500)
  }
})

// Cancel Subscription
app.post('/api/subscriptions/cancel', async (c) => {
  try {
    const { userId } = await c.req.json()
    
    await c.env.DB.prepare(`
      UPDATE subscriptions
      SET status = 'cancelled', auto_renew = 0
      WHERE user_id = ? AND status = 'active'
    `).bind(userId).run()
    
    return c.json({ success: true, message: 'Subscription cancelled' })
  } catch (error) {
    return c.json({ error: 'Failed to cancel subscription' }, 500)
  }
})

// ============================================
// ROOT ROUTE & ADMIN ROUTE
// ============================================

// Admin Portal Route
// Certificate Verification Page
app.get('/verify/:code', async (c) => {
  const code = c.req.param('code')
  
  // Fetch certificate details
  let certificate = null
  let error = null
  
  try {
    const result = await c.env.DB.prepare(`
      SELECT 
        certificate_id,
        certificate_code,
        student_name,
        course_name,
        issue_date,
        completion_date,
        status,
        verification_url
      FROM certificates
      WHERE certificate_code = ?
    `).bind(code).first()
    
    certificate = result
  } catch (e) {
    error = 'Failed to verify certificate'
  }
  
  const v = Date.now()
  
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate Verification - PassionBots LMS</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
      body { font-family: 'Inter', sans-serif; }
      .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      .card { backdrop-filter: blur(10px); background: rgba(255,255,255,0.95); }
    </style>
</head>
<body class="gradient-bg min-h-screen flex items-center justify-center p-4">
    <div class="card max-w-2xl w-full rounded-2xl shadow-2xl p-8">
        ${certificate ? `
          ${certificate.status === 'active' ? `
            <!-- Valid Certificate -->
            <div class="text-center">
              <div class="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <i class="fas fa-check-circle text-green-600 text-5xl"></i>
              </div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">Certificate Verified ✓</h1>
              <p class="text-gray-600 mb-8">This is a valid PassionBots certificate</p>
              
              <div class="bg-gray-50 rounded-xl p-6 text-left space-y-4 mb-6">
                <div class="border-b border-gray-200 pb-3">
                  <div class="text-sm text-gray-500 mb-1">Certificate Code</div>
                  <div class="text-xl font-bold text-gray-900 font-mono">${certificate.certificate_code}</div>
                </div>
                
                <div class="border-b border-gray-200 pb-3">
                  <div class="text-sm text-gray-500 mb-1">Student Name</div>
                  <div class="text-xl font-semibold text-gray-900">${certificate.student_name}</div>
                </div>
                
                <div class="border-b border-gray-200 pb-3">
                  <div class="text-sm text-gray-500 mb-1">Course</div>
                  <div class="text-lg font-medium text-gray-900">${certificate.course_name}</div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <div class="text-sm text-gray-500 mb-1">Issue Date</div>
                    <div class="text-base font-medium text-gray-900">${certificate.issue_date}</div>
                  </div>
                  ${certificate.completion_date ? `
                    <div>
                      <div class="text-sm text-gray-500 mb-1">Completion Date</div>
                      <div class="text-base font-medium text-gray-900">${certificate.completion_date}</div>
                    </div>
                  ` : ''}
                </div>
                
                <div class="pt-3">
                  <div class="text-sm text-gray-500 mb-1">Status</div>
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <i class="fas fa-circle text-xs mr-2"></i> Active
                  </span>
                </div>
              </div>
              
              <div class="flex gap-3 justify-center">
                <a href="/api/certificates/${certificate.certificate_id}/view" 
                   class="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition">
                  <i class="fas fa-eye mr-2"></i> View Certificate
                </a>
                <a href="/" 
                   class="inline-flex items-center px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition">
                  <i class="fas fa-home mr-2"></i> Home
                </a>
              </div>
              
              <!-- Social Sharing Buttons -->
              <div class="mt-8 pt-6 border-t border-gray-200">
                <p class="text-sm text-gray-600 mb-4 font-semibold">🎉 Share Your Achievement:</p>
                <div class="flex gap-3 justify-center flex-wrap">
                  <button onclick="shareLinkedIn('${certificate.certificate_code}', '${certificate.student_name}', '${certificate.course_name}')"
                          class="inline-flex items-center px-5 py-2.5 bg-[#0077b5] hover:bg-[#006399] text-white font-medium rounded-lg transition shadow-sm hover:shadow-md">
                    <i class="fab fa-linkedin-in mr-2"></i> LinkedIn
                  </button>
                  <button onclick="shareWhatsApp('${certificate.certificate_code}', '${certificate.student_name}', '${certificate.course_name}')"
                          class="inline-flex items-center px-5 py-2.5 bg-[#25D366] hover:bg-[#20BA5A] text-white font-medium rounded-lg transition shadow-sm hover:shadow-md">
                    <i class="fab fa-whatsapp mr-2"></i> WhatsApp
                  </button>
                  <button onclick="shareFacebook('${certificate.certificate_code}', '${certificate.student_name}', '${certificate.course_name}')"
                          class="inline-flex items-center px-5 py-2.5 bg-[#1877f2] hover:bg-[#0d66d0] text-white font-medium rounded-lg transition shadow-sm hover:shadow-md">
                    <i class="fab fa-facebook-f mr-2"></i> Facebook
                  </button>
                  <button onclick="shareTwitter('${certificate.certificate_code}', '${certificate.student_name}', '${certificate.course_name}')"
                          class="inline-flex items-center px-5 py-2.5 bg-[#1DA1F2] hover:bg-[#0d8bd9] text-white font-medium rounded-lg transition shadow-sm hover:shadow-md">
                    <i class="fab fa-twitter mr-2"></i> Twitter
                  </button>
                  <button onclick="shareInstagram('${certificate.certificate_code}', '${certificate.student_name}', '${certificate.course_name}')"
                          class="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90 text-white font-medium rounded-lg transition shadow-sm hover:shadow-md">
                    <i class="fab fa-instagram mr-2"></i> Instagram
                  </button>
                </div>
              </div>
            </div>
          ` : `
            <!-- Revoked/Inactive Certificate -->
            <div class="text-center">
              <div class="bg-red-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <i class="fas fa-times-circle text-red-600 text-5xl"></i>
              </div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">Certificate Not Valid</h1>
              <p class="text-gray-600 mb-8">This certificate has been ${certificate.status}</p>
              
              <div class="bg-gray-50 rounded-xl p-6 text-left space-y-4 mb-6">
                <div class="border-b border-gray-200 pb-3">
                  <div class="text-sm text-gray-500 mb-1">Certificate Code</div>
                  <div class="text-xl font-bold text-gray-900 font-mono">${certificate.certificate_code}</div>
                </div>
                
                <div class="border-b border-gray-200 pb-3">
                  <div class="text-sm text-gray-500 mb-1">Student Name</div>
                  <div class="text-xl font-semibold text-gray-900">${certificate.student_name}</div>
                </div>
                
                <div>
                  <div class="text-sm text-gray-500 mb-1">Status</div>
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <i class="fas fa-circle text-xs mr-2"></i> ${certificate.status}
                  </span>
                </div>
              </div>
              
              <a href="/" 
                 class="inline-flex items-center px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition">
                <i class="fas fa-home mr-2"></i> Back to Home
              </a>
            </div>
          `}
        ` : `
          <!-- Certificate Not Found -->
          <div class="text-center">
            <div class="bg-yellow-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <i class="fas fa-exclamation-triangle text-yellow-600 text-5xl"></i>
            </div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Certificate Not Found</h1>
            <p class="text-gray-600 mb-4">The certificate code you entered could not be found in our system.</p>
            
            <div class="bg-gray-50 rounded-xl p-4 mb-6">
              <div class="text-sm text-gray-500 mb-1">Certificate Code</div>
              <div class="text-lg font-mono text-gray-900">${code}</div>
            </div>
            
            <p class="text-sm text-gray-500 mb-6">
              ${error ? error : 'Please check the code and try again, or contact support if you believe this is an error.'}
            </p>
            
            <div class="flex gap-3 justify-center">
              <a href="/" 
                 class="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition">
                <i class="fas fa-home mr-2"></i> Back to Home
              </a>
              <a href="mailto:support@passionbots.in" 
                 class="inline-flex items-center px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition">
                <i class="fas fa-envelope mr-2"></i> Contact Support
              </a>
            </div>
          </div>
        `}
        
        <div class="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>© 2025 PassionBots. All rights reserved.</p>
          <p class="mt-1">For verification support, visit <a href="https://passionbots.co.in" class="text-purple-600 hover:text-purple-700">passionbots.co.in</a></p>
        </div>
    </div>
    
    <script>
      // Social Sharing Functions for Verify Page
      function shareLinkedIn(certCode, studentName, courseName) {
        const verifyUrl = window.location.origin + '/verify/' + certCode;
        const url = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(verifyUrl);
        window.open(url, '_blank', 'width=600,height=600');
      }
      
      function shareWhatsApp(certCode, studentName, courseName) {
        const verifyUrl = window.location.origin + '/verify/' + certCode;
        const message = '🎓 I\\'m excited to share that I\\'ve completed the ' + courseName + ' from PassionBots! 🤖\\n\\nVerify my certificate: ' + verifyUrl + '\\n\\n#PassionBots #IoT #Robotics #Certificate';
        const url = 'https://wa.me/?text=' + encodeURIComponent(message);
        window.open(url, '_blank');
      }
      
      function shareFacebook(certCode, studentName, courseName) {
        const verifyUrl = window.location.origin + '/verify/' + certCode;
        const message = '🎓 I completed the ' + courseName + ' from PassionBots! 🤖\\n\\nVerify my certificate!\\n\\n#PassionBots #IoT #Robotics';
        const url = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(verifyUrl) + '&quote=' + encodeURIComponent(message);
        window.open(url, '_blank', 'width=600,height=600');
      }
      
      function shareTwitter(certCode, studentName, courseName) {
        const verifyUrl = window.location.origin + '/verify/' + certCode;
        const text = '🎓 Just completed ' + courseName + ' from @PassionBots! 🤖\\n\\nVerify: ' + verifyUrl + '\\n\\n#PassionBots #IoT #Robotics #Certificate';
        const url = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text);
        window.open(url, '_blank', 'width=600,height=600');
      }
      
      function shareInstagram(certCode, studentName, courseName) {
        const verifyUrl = window.location.origin + '/verify/' + certCode;
        const message = '🎓 I completed the ' + courseName + ' from PassionBots! 🤖\\n\\nVerify my certificate at: ' + verifyUrl + '\\n\\n#PassionBots #IoT #Robotics #Certificate #Achievement';
        
        if (navigator.clipboard) {
          navigator.clipboard.writeText(message).then(() => {
            alert('📋 Caption copied to clipboard!\\n\\nOpen Instagram and paste this caption with your certificate screenshot.\\n\\nTip: Download your certificate PDF and share it as an image on Instagram.');
          }).catch(() => {
            prompt('Copy this message for Instagram:', message);
          });
        } else {
          prompt('Copy this message for Instagram:', message);
        }
      }
    </script>
</body>
</html>
  `)
})

app.get('/admin', (c) => {
  const v = Date.now(); // Cache busting version
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Portal - PassionBots LMS</title>
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    
    <!-- REDESIGNED UI v7.0 - Modern & Clean -->
    <link href="/static/styles-redesign.css?v=${v}" rel="stylesheet">
</head>
<body>
    <!-- Animated Background -->
    <div class="animated-bg"></div>
    
    <!-- Main App -->
    <div id="app">
      <div style="text-align:center;padding:50px;color:#fff;">
        <div class="spinner"></div>
        <p>Loading Admin Portal...</p>
      </div>
    </div>
    
    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script src="/static/app-redesign-combined.js?v=${v}"></script>
    <script src="/static/app-admin-certificates.js?v=${v}"></script>
    <script>
      // Auto-navigate to admin view
      document.addEventListener('DOMContentLoaded', () => {
        if (typeof AdminCertificateTool !== 'undefined') {
          AdminCertificateTool.init();
        } else {
          console.error('AdminCertificateTool not loaded');
        }
      });
      
      window.onerror = function(msg, url, line, col, error) {
        console.error('ERROR:', msg, 'at', url, 'line', line, 'col', col);
        document.getElementById('app').innerHTML = '<div style="padding:50px;color:#fff;background:rgba(255,0,0,0.2);border:2px solid #ff6b6b;border-radius:12px;max-width:800px;margin:50px auto;"><h2>🚨 Error Loading Admin Portal</h2><p style="font-size:18px;margin:20px 0;"><strong>Message:</strong> ' + msg + '</p><p><strong>Location:</strong> ' + url + ':' + line + '</p><button onclick="location.reload()" style="background:#667eea;color:white;padding:12px 30px;border:none;border-radius:8px;font-size:16px;cursor:pointer;margin-top:20px;">Reload Page</button></div>';
      };
    </script>
</body>
</html>
  `)
})

app.get('/', (c) => {
  const v = Date.now(); // Cache busting version
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PassionBots LMS v7.0 - IoT & Robotics Excellence</title>
    
    <!-- PWA Manifest -->
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#667eea">
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    
    <!-- Chart.js for Analytics -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    
    <!-- Razorpay Checkout -->
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    
    <!-- REDESIGNED UI v7.0 - Modern & Clean -->
    <link href="/static/styles-redesign.css?v=${v}" rel="stylesheet">
</head>
<body>
    <!-- Animated Background -->
    <div class="animated-bg"></div>
    
    <!-- Main App -->
    <div id="app">
      <div style="text-align:center;padding:50px;color:#fff;">
        <div class="spinner"></div>
        <p>Loading PassionBots LMS...</p>
      </div>
    </div>
    
    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script src="/static/app-redesign-combined.js?v=${v}"></script>
    <script src="/static/app-subscriptions.js?v=${v}"></script>
    <script src="/static/app-zoom-integration.js?v=${v}"></script>
    <script src="/static/app-lesson-interface-enhanced.js?v=${v}"></script>
    <script src="/static/app-certificates.js?v=${v}"></script>
    <script src="/static/app-admin-certificates.js?v=${v}"></script>
    <script>
      window.onerror = function(msg, url, line, col, error) {
        console.error('ERROR:', msg, 'at', url, 'line', line, 'col', col);
        console.error('Error object:', error);
        document.getElementById('app').innerHTML = '<div style="padding:50px;color:#fff;background:rgba(255,0,0,0.2);border:2px solid #ff6b6b;border-radius:12px;max-width:800px;margin:50px auto;"><h2>🚨 Error Loading App</h2><p style="font-size:18px;margin:20px 0;"><strong>Message:</strong> ' + msg + '</p><p><strong>Location:</strong> ' + url + ':' + line + '</p><p><strong>Stack:</strong> ' + (error ? error.stack : 'N/A') + '</p><button onclick="location.reload()" style="background:#667eea;color:white;padding:12px 30px;border:none;border-radius:8px;font-size:16px;cursor:pointer;margin-top:20px;">Reload Page</button></div>';
      };
    </script>
</body>
</html>
  `)
})

// ============================================
// LESSON INTERFACE ROUTES
// ============================================

// Get Course Structure with All Lessons
app.get('/api/courses/:courseId/structure', async (c) => {
  try {
    const courseId = c.req.param('courseId')
    
    // Get course/module info
    const course = await c.env.DB.prepare(`
      SELECT * FROM modules WHERE module_id = ?
    `).bind(courseId).first()
    
    if (!course) {
      return c.json({ success: false, error: 'Course not found' }, 404)
    }
    
    // Get all sessions/lessons for this course grouped by day
    const sessions = await c.env.DB.prepare(`
      SELECT 
        session_id,
        session_number,
        session_title,
        description,
        objectives,
        duration_minutes,
        session_type
      FROM curriculum_sessions
      WHERE module_id = ?
      ORDER BY session_number ASC
    `).bind(courseId).all()
    
    // Group sessions by "day" (every 3 sessions = 1 day for demo)
    const days = []
    let currentDay = 11
    
    for (let i = 0; i < sessions.results.length; i += 3) {
      const daySessions = sessions.results.slice(i, i + 3)
      
      days.push({
        day: currentDay,
        title: daySessions[0]?.session_title || `Day ${currentDay}`,
        lessons: daySessions.length,
        completed: 0, // TODO: Get from progress tracking
        sessions: daySessions.map(s => ({
          id: s.session_id,
          number: s.session_number,
          title: s.session_title,
          description: s.description,
          objectives: s.objectives,
          duration: s.duration_minutes,
          type: s.session_type || 'lesson'
        }))
      })
      
      currentDay++
    }
    
    return c.json({
      success: true,
      course: {
        id: course.module_id,
        title: course.module_title,
        description: course.description
      },
      days: days
    })
  } catch (error) {
    console.error('Get course structure error:', error)
    return c.json({ success: false, error: 'Failed to load course structure' }, 500)
  }
})

// Get Specific Lesson Details
app.get('/api/lessons/:lessonId', async (c) => {
  try {
    const lessonId = c.req.param('lessonId')
    const studentId = c.req.query('student_id')
    
    // Get lesson details
    const lesson = await c.env.DB.prepare(`
      SELECT 
        cs.*,
        m.module_title,
        m.grade_level
      FROM curriculum_sessions cs
      JOIN modules m ON cs.module_id = m.module_id
      WHERE cs.session_id = ?
    `).bind(lessonId).first()
    
    if (!lesson) {
      return c.json({ success: false, error: 'Lesson not found' }, 404)
    }
    
    // Get lesson components
    const components = await c.env.DB.prepare(`
      SELECT * FROM session_components
      WHERE session_id = ?
      ORDER BY sequence_order ASC
    `).bind(lessonId).all()
    
    // Get student progress if studentId provided
    let progress = null
    if (studentId) {
      progress = await c.env.DB.prepare(`
        SELECT * FROM curriculum_progress
        WHERE session_id = ? AND student_id = ?
      `).bind(lessonId, studentId).first()
    }
    
    // Get related live session if exists
    const liveSession = await c.env.DB.prepare(`
      SELECT ls.*, zm.join_url, zm.start_url, zm.zoom_meeting_id
      FROM live_sessions ls
      LEFT JOIN zoom_meetings zm ON ls.session_id = zm.session_id
      WHERE ls.session_id = ?
      ORDER BY ls.scheduled_time DESC
      LIMIT 1
    `).bind(lessonId).first()
    
    // Get recordings if available
    const recordings = await c.env.DB.prepare(`
      SELECT zr.*, zm.start_time
      FROM zoom_recordings zr
      JOIN zoom_meetings zm ON zr.meeting_id = zm.meeting_id
      WHERE zm.session_id = ? AND zr.status = 'available'
      ORDER BY zm.start_time DESC
    `).bind(lessonId).all()
    
    return c.json({
      success: true,
      lesson: {
        id: lesson.session_id,
        number: lesson.session_number,
        title: lesson.session_title,
        description: lesson.description,
        objectives: lesson.objectives ? JSON.parse(lesson.objectives) : [],
        duration: lesson.duration_minutes,
        type: lesson.session_type || 'lesson',
        module: lesson.module_title,
        grade: lesson.grade_level
      },
      components: components.results,
      progress: progress,
      liveSession: liveSession,
      recordings: recordings.results
    })
  } catch (error) {
    console.error('Get lesson error:', error)
    return c.json({ success: false, error: 'Failed to load lesson' }, 500)
  }
})

// Update Lesson Progress
app.post('/api/lessons/:lessonId/progress', async (c) => {
  try {
    const lessonId = c.req.param('lessonId')
    const { student_id, completion_percentage, time_spent, completed } = await c.req.json()
    
    // Check if progress record exists
    const existing = await c.env.DB.prepare(`
      SELECT * FROM curriculum_progress
      WHERE session_id = ? AND student_id = ?
    `).bind(lessonId, student_id).first()
    
    if (existing) {
      // Update existing progress
      await c.env.DB.prepare(`
        UPDATE curriculum_progress
        SET completion_percentage = ?,
            completed = ?,
            last_accessed = datetime('now')
        WHERE session_id = ? AND student_id = ?
      `).bind(completion_percentage, completed ? 1 : 0, lessonId, student_id).run()
    } else {
      // Create new progress record
      await c.env.DB.prepare(`
        INSERT INTO curriculum_progress (session_id, student_id, completion_percentage, completed, last_accessed)
        VALUES (?, ?, ?, ?, datetime('now'))
      `).bind(lessonId, student_id, completion_percentage, completed ? 1 : 0).run()
    }
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Update progress error:', error)
    return c.json({ success: false, error: 'Failed to update progress' }, 500)
  }
})

// Get Live Session Participants
app.get('/api/live-sessions/:sessionId/participants', async (c) => {
  try {
    const sessionId = c.req.param('sessionId')
    
    // Get enrolled students for this session
    const participants = await c.env.DB.prepare(`
      SELECT 
        s.student_id,
        s.full_name,
        s.email,
        'student' as role,
        1 as is_online
      FROM session_enrollments se
      JOIN students s ON se.student_id = s.student_id
      WHERE se.session_id = ?
      
      UNION
      
      SELECT 
        m.mentor_id as student_id,
        m.full_name,
        m.email,
        'mentor' as role,
        1 as is_online
      FROM live_sessions ls
      JOIN mentors m ON ls.mentor_id = m.mentor_id
      WHERE ls.session_id = ?
    `).bind(sessionId, sessionId).all()
    
    return c.json({ success: true, participants: participants.results })
  } catch (error) {
    console.error('Get participants error:', error)
    return c.json({ success: false, error: 'Failed to load participants' }, 500)
  }
})

// Send Chat Message
app.post('/api/live-sessions/:sessionId/chat', async (c) => {
  try {
    const sessionId = c.req.param('sessionId')
    const { user_id, user_name, message, user_role } = await c.req.json()
    
    // Store chat message (create table if not exists)
    await c.env.DB.prepare(`
      INSERT INTO chat_messages (session_id, user_id, user_name, user_role, message, sent_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).bind(sessionId, user_id, user_name, user_role, message).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Send message error:', error)
    return c.json({ success: false, error: 'Failed to send message' }, 500)
  }
})

// Get Chat History
app.get('/api/live-sessions/:sessionId/chat', async (c) => {
  try {
    const sessionId = c.req.param('sessionId')
    const limit = c.req.query('limit') || '50'
    
    const messages = await c.env.DB.prepare(`
      SELECT * FROM chat_messages
      WHERE session_id = ?
      ORDER BY sent_at DESC
      LIMIT ?
    `).bind(sessionId, limit).all()
    
    return c.json({ 
      success: true, 
      messages: messages.results.reverse() // Oldest first
    })
  } catch (error) {
    console.error('Get chat history error:', error)
    return c.json({ success: false, error: 'Failed to load chat' }, 500)
  }
})

// Submit Quiz/MCQ Answer
app.post('/api/lessons/:lessonId/quiz', async (c) => {
  try {
    const lessonId = c.req.param('lessonId')
    const { student_id, question_id, selected_answer, is_correct } = await c.req.json()
    
    // Store answer
    await c.env.DB.prepare(`
      INSERT INTO quiz_responses (session_id, student_id, question_id, selected_answer, is_correct, submitted_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).bind(lessonId, student_id, question_id, selected_answer, is_correct ? 1 : 0).run()
    
    return c.json({ success: true, is_correct })
  } catch (error) {
    console.error('Submit quiz error:', error)
    return c.json({ success: false, error: 'Failed to submit answer' }, 500)
  }
})

// ============================================
// CERTIFICATE GENERATION ROUTES
// ============================================

// Generate unique certificate code
function generateCertificateCode() {
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  const timestamp = Date.now().toString(36).toUpperCase()
  return `PB-IOT-${year}-${random}${timestamp}`
}

// Generate Certificate
app.post('/api/certificates/generate', async (c) => {
  try {
    const { student_id, course_id, course_name, completion_date } = await c.req.json()
    
    // Get student details
    const student = await c.env.DB.prepare(`
      SELECT full_name, email FROM students WHERE student_id = ?
    `).bind(student_id).first()
    
    if (!student) {
      return c.json({ success: false, error: 'Student not found' }, 404)
    }
    
    // Check if certificate already exists
    const existing = await c.env.DB.prepare(`
      SELECT certificate_id, certificate_code FROM certificates
      WHERE student_id = ? AND course_id = ?
    `).bind(student_id, course_id).first()
    
    if (existing) {
      return c.json({
        success: true,
        certificate: existing,
        message: 'Certificate already exists'
      })
    }
    
    // Generate unique certificate code
    const certificateCode = generateCertificateCode()
    
    // Create verification URL
    const verificationUrl = `https://passionbots-lms.pages.dev/verify/${certificateCode}`
    
    // Certificate data
    const certificateData = JSON.stringify({
      studentName: student.full_name,
      courseName: course_name || 'IoT & Robotics Course',
      issueDate: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      completionDate: completion_date || new Date().toISOString().split('T')[0],
      certificateCode: certificateCode,
      verificationUrl: verificationUrl
    })
    
    // Insert certificate
    const result = await c.env.DB.prepare(`
      INSERT INTO certificates (
        student_id, course_id, certificate_code, student_name, 
        course_name, issue_date, completion_date, certificate_data, 
        verification_url, status
      )
      VALUES (?, ?, ?, ?, ?, date('now'), ?, ?, ?, 'active')
    `).bind(
      student_id,
      course_id,
      certificateCode,
      student.full_name,
      course_name || 'IoT & Robotics Course',
      completion_date || new Date().toISOString().split('T')[0],
      certificateData,
      verificationUrl
    ).run()
    
    return c.json({
      success: true,
      certificate: {
        certificate_id: result.meta.last_row_id,
        certificate_code: certificateCode,
        student_name: student.full_name,
        course_name: course_name || 'IoT & Robotics Course',
        issue_date: new Date().toISOString().split('T')[0],
        verification_url: verificationUrl
      }
    })
  } catch (error) {
    console.error('Generate certificate error:', error)
    return c.json({ success: false, error: 'Failed to generate certificate' }, 500)
  }
})

// Get Student Certificates
app.get('/api/certificates/student/:studentId', async (c) => {
  try {
    const studentId = c.req.param('studentId')
    
    const certificates = await c.env.DB.prepare(`
      SELECT 
        certificate_id,
        certificate_code,
        student_name,
        course_name,
        issue_date,
        completion_date,
        verification_url,
        status
      FROM certificates
      WHERE student_id = ? AND status = 'active'
      ORDER BY issue_date DESC
    `).bind(studentId).all()
    
    return c.json({ success: true, certificates: certificates.results })
  } catch (error) {
    console.error('Get certificates error:', error)
    return c.json({ success: false, error: 'Failed to load certificates' }, 500)
  }
})

// Verify Certificate
app.get('/api/certificates/verify/:code', async (c) => {
  try {
    const code = c.req.param('code')
    
    const certificate = await c.env.DB.prepare(`
      SELECT 
        certificate_code,
        student_name,
        course_name,
        issue_date,
        completion_date,
        status
      FROM certificates
      WHERE certificate_code = ?
    `).bind(code).first()
    
    if (!certificate) {
      return c.json({ 
        success: false, 
        error: 'Certificate not found',
        valid: false 
      }, 404)
    }
    
    return c.json({
      success: true,
      valid: certificate.status === 'active',
      certificate: certificate
    })
  } catch (error) {
    console.error('Verify certificate error:', error)
    return c.json({ success: false, error: 'Verification failed' }, 500)
  }
})

// Get Certificate HTML
app.get('/api/certificates/:id/view', async (c) => {
  try {
    const certificateId = c.req.param('id')
    
    const certificate = await c.env.DB.prepare(`
      SELECT * FROM certificates WHERE certificate_id = ?
    `).bind(certificateId).first()
    
    if (!certificate) {
      return c.notFound()
    }
    
    const data = JSON.parse(certificate.certificate_data)
    
    // Use enhanced certificate generator matching PDF format
    return c.html(generateEnhancedCertificate(data, certificate))
  } catch (error) {
    console.error('View certificate error:', error)
    return c.text('Failed to load certificate', 500)
  }
})

// Render Certificate with your exact 1920x1080 template
function renderCertificateTemplate(data: any, certificate: any) {
  const studentName = data.studentName || certificate.student_name
  const courseName = data.courseName || certificate.course_name
  const certificateCode = data.certificateCode || certificate.certificate_code
  const issueDate = data.issueDate || new Date(certificate.issue_date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Certificate - ${studentName}</title>
<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet"/>
<link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet"/>
<style>
    body { margin: 0; padding: 0; overflow: hidden; background-color: #000; font-family: 'Roboto', sans-serif; }
    .slide-container {
        width: 1920px;
        height: 1080px;
        position: relative;
        background-color: #0a0a0a;
        color: white;
        display: flex;
        overflow: hidden;
    }
    
    .yellow-bar {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 140px;
        background-color: #fbbf24;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        box-shadow: 5px 0 20px rgba(0,0,0,0.5);
    }
    
    .vertical-text {
        writing-mode: vertical-rl;
        transform: rotate(180deg);
        font-family: 'Oswald', sans-serif;
        font-size: 5rem;
        font-weight: 700;
        color: #111;
        letter-spacing: 0.1em;
        white-space: nowrap;
        text-transform: uppercase;
        height: 90%;
        text-align: center;
    }

    .diagonal-shape {
        position: absolute;
        top: 0;
        right: 0;
        width: 55%;
        height: 100%;
        background-color: #161616;
        clip-path: polygon(25% 0, 100% 0, 100% 100%, 0% 100%);
        z-index: 0;
    }
    
    .texture-overlay {
        position: absolute;
        top: 0;
        right: 0;
        width: 55%;
        height: 100%;
        background-image: radial-gradient(#333 1px, transparent 1px);
        background-size: 20px 20px;
        opacity: 0.1;
        clip-path: polygon(25% 0, 100% 0, 100% 100%, 0% 100%);
        z-index: 0;
    }

    .accent-triangle {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 250px;
        height: 250px;
        background-color: #fbbf24;
        clip-path: polygon(100% 0, 100% 100%, 0 100%);
        z-index: 1;
    }
    
    .striped-header {
        position: absolute;
        top: 60px;
        right: 60px;
        width: 300px;
        height: 30px;
        display: flex;
        gap: 15px;
    }
    .stripe {
        width: 15px;
        height: 100%;
        background-color: #fbbf24;
        transform: skewX(-20deg);
    }

    .content-wrapper {
        flex: 1;
        margin-left: 140px;
        padding: 80px 120px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        z-index: 10;
        position: relative;
    }

    .logo-area {
        margin-bottom: 2rem;
        display: flex;
        align-items: center;
        gap: 1.5rem;
    }
    .logo-icon-box {
        width: 60px;
        height: 60px;
        background-color: #fbbf24;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #000;
        font-size: 2rem;
        border-radius: 4px;
    }
    .logo-text {
        font-family: 'Oswald', sans-serif;
        font-size: 2rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: white;
    }

    .title-group {
        margin-bottom: 3.5rem;
        position: relative;
    }
    .cert-title-outline {
        font-family: 'Oswald', sans-serif;
        font-size: 9rem;
        font-weight: 700;
        line-height: 0.8;
        text-transform: uppercase;
        color: transparent;
        -webkit-text-stroke: 2px rgba(255, 255, 255, 0.1);
        position: absolute;
        top: -4rem;
        left: -10px;
        z-index: -1;
    }
    .cert-title-main {
        font-family: 'Oswald', sans-serif;
        font-size: 7rem;
        font-weight: 700;
        line-height: 1;
        text-transform: uppercase;
        color: #fbbf24;
        margin: 0;
        text-shadow: 4px 4px 0px rgba(0,0,0,0.5);
    }
    .cert-subtitle {
        font-family: 'Oswald', sans-serif;
        font-size: 2rem;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: white;
        margin-top: 0.5rem;
        font-weight: 400;
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    .cert-subtitle::after {
        content: '';
        height: 4px;
        width: 100px;
        background-color: #fbbf24;
        display: block;
    }

    .recipient-container {
        margin: 2rem 0 4rem 0;
        position: relative;
    }
    .name-label {
        font-family: 'Roboto', sans-serif;
        font-size: 1rem;
        color: #9ca3af;
        margin-bottom: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        font-weight: 500;
    }
    .recipient-name {
        background-color: #fbbf24;
        color: #000;
        display: inline-block;
        font-family: 'Oswald', sans-serif;
        font-size: 4.5rem;
        font-weight: 700;
        padding: 0.2rem 4rem;
        transform: skewX(-15deg);
        box-shadow: 15px 15px 0px rgba(255, 255, 255, 0.1);
        min-width: 600px;
    }
    .recipient-name span {
        display: block;
        transform: skewX(15deg);
        text-align: center;
    }

    .description {
        font-family: 'Roboto', sans-serif;
        font-size: 1.5rem;
        line-height: 1.6;
        color: #e5e7eb;
        max-width: 950px;
        margin-bottom: 4rem;
        border-left: 6px solid #fbbf24;
        padding-left: 2.5rem;
        background: linear-gradient(90deg, rgba(251, 191, 36, 0.05) 0%, transparent 100%);
        padding-top: 1rem;
        padding-bottom: 1rem;
    }

    .footer-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 4rem;
        margin-top: auto;
        border-top: 1px solid #333;
        padding-top: 2.5rem;
        width: 85%;
    }

    .footer-item {
        display: flex;
        flex-direction: column;
    }
    .footer-label {
        color: #fbbf24;
        font-family: 'Oswald', sans-serif;
        font-size: 1rem;
        text-transform: uppercase;
        margin-bottom: 0.5rem;
        letter-spacing: 0.1em;
    }
    .footer-value {
        font-size: 1.4rem;
        font-weight: 500;
        color: white;
    }
    .signature-font {
        font-family: 'Oswald', sans-serif;
        font-size: 1.8rem;
        font-style: italic;
        color: white;
    }

    .serial-tag {
        position: absolute;
        top: 65px;
        right: 400px;
        font-family: 'Roboto', sans-serif;
        font-size: 1rem;
        color: #9ca3af;
        letter-spacing: 0.15em;
        font-weight: 500;
    }
    
    .qr-placeholder {
        position: absolute;
        bottom: 80px;
        right: 80px;
        width: 120px;
        height: 120px;
        background-color: white;
        padding: 8px;
        z-index: 20;
        transform: rotate(-5deg);
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    .qr-inner {
        width: 100%;
        height: 100%;
        background-color: #111;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    }
</style>
</head>
<body>
<div class="slide-container">
<div class="yellow-bar">
<p class="vertical-text">PASSIONBOTS // FUTURE TECH</p>
</div>
<div class="diagonal-shape"></div>
<div class="texture-overlay"></div>
<div class="accent-triangle"></div>
<div class="striped-header">
<div class="stripe"></div>
<div class="stripe"></div>
<div class="stripe"></div>
<div class="stripe"></div>
<div class="stripe"></div>
</div>
<div class="serial-tag">ID: ${certificateCode}</div>
<div class="content-wrapper">
<div class="logo-area">
<div class="logo-icon-box">
<i class="fas fa-robot"></i>
</div>
<p class="logo-text">Passionbots</p>
</div>
<div class="title-group">
<p class="cert-title-outline">Certificate</p>
<h1 class="cert-title-main">Certificate</h1>
<p class="cert-subtitle">Of Completion // IoT &amp; Robotics</p>
</div>
<div class="recipient-container">
<p class="name-label">This Certifies That</p>
<div class="recipient-name">
<span>${studentName}</span>
</div>
</div>
<div class="description">
<p>For outstanding performance and successful completion of the <strong style="color: #fbbf24;">${courseName}</strong>. Demonstrating exceptional skill in systems integration, automation logic, and robotics engineering principles.</p>
</div>
<div class="footer-grid">
<div class="footer-item">
<p class="footer-label">Date Issued</p>
<p class="footer-value">${issueDate}</p>
</div>
<div class="footer-item">
<p class="footer-label">Founder Signature</p>
<p class="signature-font">Rahul Gupta</p>
<p style="font-size: 0.9rem; color: #9ca3af; margin-top: 5px;">Rahul Gupta</p>
</div>
<div class="footer-item">
<p class="footer-label">Verify At</p>
<p class="footer-value" style="color: #fbbf24;">passionbots.co.in</p>
</div>
</div>
</div>
<div class="qr-placeholder">
<div class="qr-inner">
<i class="fas fa-qrcode fa-3x"></i>
</div>
</div>
</div>
</body>
</html>`
}

// Render Certificate HTML
function renderCertificateHTML(data: any) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Certificate - ${data.studentName}</title>
<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet"/>
<link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet"/>
<style>
    body { margin: 0; padding: 0; overflow: hidden; background-color: #000; font-family: 'Roboto', sans-serif; }
    .slide-container {
        width: 1920px;
        height: 1080px;
        position: relative;
        background-color: #0a0a0a;
        color: white;
        display: flex;
        overflow: hidden;
    }
    
    /* Decorative Elements */
    .yellow-bar {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 140px;
        background-color: #fbbf24; /* Amber-400 */
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        box-shadow: 5px 0 20px rgba(0,0,0,0.5);
    }
    
    .vertical-text {
        writing-mode: vertical-rl;
        transform: rotate(180deg);
        font-family: 'Oswald', sans-serif;
        font-size: 5rem;
        font-weight: 700;
        color: #111;
        letter-spacing: 0.1em;
        white-space: nowrap;
        text-transform: uppercase;
        height: 90%;
        text-align: center;
    }

    .diagonal-shape {
        position: absolute;
        top: 0;
        right: 0;
        width: 55%;
        height: 100%;
        background-color: #161616;
        clip-path: polygon(25% 0, 100% 0, 100% 100%, 0% 100%);
        z-index: 0;
    }
    
    /* Subtle geometric texture on the dark background */
    .texture-overlay {
        position: absolute;
        top: 0;
        right: 0;
        width: 55%;
        height: 100%;
        background-image: radial-gradient(#333 1px, transparent 1px);
        background-size: 20px 20px;
        opacity: 0.1;
        clip-path: polygon(25% 0, 100% 0, 100% 100%, 0% 100%);
        z-index: 0;
    }

    .accent-triangle {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 250px;
        height: 250px;
        background-color: #fbbf24;
        clip-path: polygon(100% 0, 100% 100%, 0 100%);
        z-index: 1;
    }
    
    .striped-header {
        position: absolute;
        top: 60px;
        right: 60px;
        width: 300px;
        height: 30px;
        display: flex;
        gap: 15px;
    }
    .stripe {
        width: 15px;
        height: 100%;
        background-color: #fbbf24;
        transform: skewX(-20deg);
    }

    /* Content Layout */
    .content-wrapper {
        flex: 1;
        margin-left: 140px; /* Offset for yellow bar */
        padding: 80px 120px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        z-index: 10;
        position: relative;
    }

    .logo-area {
        margin-bottom: 2rem;
        display: flex;
        align-items: center;
        gap: 1.5rem;
    }
    .logo-icon-box {
        width: 60px;
        height: 60px;
        background-color: #fbbf24;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #000;
        font-size: 2rem;
        border-radius: 4px;
    }
    .logo-text {
        font-family: 'Oswald', sans-serif;
        font-size: 2rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: white;
    }

    .title-group {
        margin-bottom: 3.5rem;
        position: relative;
    }
    .cert-title-outline {
        font-family: 'Oswald', sans-serif;
        font-size: 9rem;
        font-weight: 700;
        line-height: 0.8;
        text-transform: uppercase;
        color: transparent;
        -webkit-text-stroke: 2px rgba(255, 255, 255, 0.1);
        position: absolute;
        top: -4rem;
        left: -10px;
        z-index: -1;
    }
    .cert-title-main {
        font-family: 'Oswald', sans-serif;
        font-size: 7rem;
        font-weight: 700;
        line-height: 1;
        text-transform: uppercase;
        color: #fbbf24;
        margin: 0;
        text-shadow: 4px 4px 0px rgba(0,0,0,0.5);
    }
    .cert-subtitle {
        font-family: 'Oswald', sans-serif;
        font-size: 2rem;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: white;
        margin-top: 0.5rem;
        font-weight: 400;
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    .cert-subtitle::after {
        content: '';
        height: 4px;
        width: 100px;
        background-color: #fbbf24;
        display: block;
    }

    .recipient-container {
        margin: 2rem 0 4rem 0;
        position: relative;
    }
    .name-label {
        font-family: 'Roboto', sans-serif;
        font-size: 1rem;
        color: #9ca3af;
        margin-bottom: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        font-weight: 500;
    }
    .recipient-name {
        background-color: #fbbf24;
        color: #000;
        display: inline-block;
        font-family: 'Oswald', sans-serif;
        font-size: 4.5rem;
        font-weight: 700;
        padding: 0.2rem 4rem;
        transform: skewX(-15deg);
        box-shadow: 15px 15px 0px rgba(255, 255, 255, 0.1);
        min-width: 600px;
    }
    .recipient-name span {
        display: block;
        transform: skewX(15deg); /* Counter skew for text */
        text-align: center;
    }

    .description {
        font-family: 'Roboto', sans-serif;
        font-size: 1.5rem;
        line-height: 1.6;
        color: #e5e7eb;
        max-width: 950px;
        margin-bottom: 4rem;
        border-left: 6px solid #fbbf24;
        padding-left: 2.5rem;
        background: linear-gradient(90deg, rgba(251, 191, 36, 0.05) 0%, transparent 100%);
        padding-top: 1rem;
        padding-bottom: 1rem;
    }

    .footer-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 4rem;
        margin-top: auto;
        border-top: 1px solid #333;
        padding-top: 2.5rem;
        width: 85%;
    }

    .footer-item {
        display: flex;
        flex-direction: column;
    }
    .footer-label {
        color: #fbbf24;
        font-family: 'Oswald', sans-serif;
        font-size: 1rem;
        text-transform: uppercase;
        margin-bottom: 0.5rem;
        letter-spacing: 0.1em;
    }
    .footer-value {
        font-size: 1.4rem;
        font-weight: 500;
        color: white;
    }
    .signature-font {
        font-family: 'Oswald', sans-serif;
        font-size: 1.8rem;
        font-style: italic;
        color: white;
    }

    .serial-tag {
        position: absolute;
        top: 65px;
        right: 400px; /* Left of stripes */
        font-family: 'Roboto', sans-serif;
        font-size: 1rem;
        color: #9ca3af;
        letter-spacing: 0.15em;
        font-weight: 500;
    }
    
    .qr-placeholder {
        position: absolute;
        bottom: 80px;
        right: 80px;
        width: 120px;
        height: 120px;
        background-color: white;
        padding: 8px;
        z-index: 20;
        transform: rotate(-5deg);
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    .qr-inner {
        width: 100%;
        height: 100%;
        background-color: #111;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    }

</style>
    body { margin: 0; padding: 20px; background-color: #1a1a1a; font-family: 'Roboto', sans-serif; }
    .certificate-wrapper { max-width: 1920px; margin: 0 auto; }
    .slide-container {
        width: 100%;
        aspect-ratio: 16/9;
        position: relative;
        background-color: #0a0a0a;
        color: white;
        display: flex;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    
    .yellow-bar {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 7.3%;
        background-color: #fbbf24;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        box-shadow: 5px 0 20px rgba(0,0,0,0.5);
    }
    
    .vertical-text {
        writing-mode: vertical-rl;
        transform: rotate(180deg);
        font-family: 'Oswald', sans-serif;
        font-size: clamp(2rem, 5vw, 5rem);
        font-weight: 700;
        color: #111;
        letter-spacing: 0.1em;
        white-space: nowrap;
        text-transform: uppercase;
        text-align: center;
    }

    .diagonal-shape {
        position: absolute;
        top: 0;
        right: 0;
        width: 55%;
        height: 100%;
        background-color: #161616;
        clip-path: polygon(25% 0, 100% 0, 100% 100%, 0% 100%);
        z-index: 0;
    }
    
    .texture-overlay {
        position: absolute;
        top: 0;
        right: 0;
        width: 55%;
        height: 100%;
        background-image: radial-gradient(#333 1px, transparent 1px);
        background-size: 20px 20px;
        opacity: 0.1;
        clip-path: polygon(25% 0, 100% 0, 100% 100%, 0% 100%);
        z-index: 0;
    }

    .accent-triangle {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 13%;
        height: 23%;
        background-color: #fbbf24;
        clip-path: polygon(100% 0, 100% 100%, 0 100%);
        z-index: 1;
    }
    
    .striped-header {
        position: absolute;
        top: 5.5%;
        right: 3%;
        width: 15.6%;
        height: 2.8%;
        display: flex;
        gap: 0.8%;
    }
    .stripe {
        width: 0.8%;
        height: 100%;
        background-color: #fbbf24;
        transform: skewX(-20deg);
    }

    .content-wrapper {
        flex: 1;
        margin-left: 7.3%;
        padding: 4% 6.25%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        z-index: 10;
        position: relative;
    }

    .logo-area {
        margin-bottom: 2rem;
        display: flex;
        align-items: center;
        gap: 1.5rem;
    }
    .logo-icon-box {
        width: clamp(40px, 3.1vw, 60px);
        height: clamp(40px, 3.1vw, 60px);
        background-color: #fbbf24;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #000;
        font-size: clamp(1.5rem, 2vw, 2rem);
        border-radius: 4px;
    }
    .logo-text {
        font-family: 'Oswald', sans-serif;
        font-size: clamp(1.5rem, 2vw, 2rem);
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: white;
    }

    .title-group {
        margin-bottom: 3.5rem;
        position: relative;
    }
    .cert-title-outline {
        font-family: 'Oswald', sans-serif;
        font-size: clamp(4rem, 9vw, 9rem);
        font-weight: 700;
        line-height: 0.8;
        text-transform: uppercase;
        color: transparent;
        -webkit-text-stroke: 2px rgba(255, 255, 255, 0.1);
        position: absolute;
        top: clamp(-2rem, -4vw, -4rem);
        left: -10px;
        z-index: -1;
    }
    .cert-title-main {
        font-family: 'Oswald', sans-serif;
        font-size: clamp(3rem, 7vw, 7rem);
        font-weight: 700;
        line-height: 1;
        text-transform: uppercase;
        color: #fbbf24;
        margin: 0;
        text-shadow: 4px 4px 0px rgba(0,0,0,0.5);
    }
    .cert-subtitle {
        font-family: 'Oswald', sans-serif;
        font-size: clamp(1rem, 2vw, 2rem);
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: white;
        margin-top: 0.5rem;
        font-weight: 400;
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    .cert-subtitle::after {
        content: '';
        height: 4px;
        width: 5.2%;
        background-color: #fbbf24;
        display: block;
    }

    .recipient-container {
        margin: 2rem 0 4rem 0;
        position: relative;
    }
    .name-label {
        font-family: 'Roboto', sans-serif;
        font-size: clamp(0.8rem, 1vw, 1rem);
        color: #9ca3af;
        margin-bottom: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        font-weight: 500;
    }
    .recipient-name {
        background-color: #fbbf24;
        color: #000;
        display: inline-block;
        font-family: 'Oswald', sans-serif;
        font-size: clamp(2rem, 4.5vw, 4.5rem);
        font-weight: 700;
        padding: 0.2rem 4rem;
        transform: skewX(-15deg);
        box-shadow: 15px 15px 0px rgba(255, 255, 255, 0.1);
        min-width: 31.25%;
    }
    .recipient-name span {
        display: block;
        transform: skewX(15deg);
        text-align: center;
    }

    .description {
        font-family: 'Roboto', sans-serif;
        font-size: clamp(1rem, 1.5vw, 1.5rem);
        line-height: 1.6;
        color: #e5e7eb;
        max-width: 49.5%;
        margin-bottom: 4rem;
        border-left: 6px solid #fbbf24;
        padding-left: 2.5rem;
        background: linear-gradient(90deg, rgba(251, 191, 36, 0.05) 0%, transparent 100%);
        padding-top: 1rem;
        padding-bottom: 1rem;
    }

    .footer-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 4rem;
        margin-top: auto;
        border-top: 1px solid #333;
        padding-top: 2.5rem;
        width: 85%;
    }

    .footer-item {
        display: flex;
        flex-direction: column;
    }
    .footer-label {
        color: #fbbf24;
        font-family: 'Oswald', sans-serif;
        font-size: clamp(0.8rem, 1vw, 1rem);
        text-transform: uppercase;
        margin-bottom: 0.5rem;
        letter-spacing: 0.1em;
    }
    .footer-value {
        font-size: clamp(1rem, 1.4vw, 1.4rem);
        font-weight: 500;
        color: white;
    }
    .signature-font {
        font-family: 'Oswald', sans-serif;
        font-size: clamp(1.2rem, 1.8vw, 1.8rem);
        font-style: italic;
        color: white;
    }

    .serial-tag {
        position: absolute;
        top: 6%;
        right: 20.8%;
        font-family: 'Roboto', sans-serif;
        font-size: clamp(0.8rem, 1vw, 1rem);
        color: #9ca3af;
        letter-spacing: 0.15em;
        font-weight: 500;
    }
    
    .qr-placeholder {
        position: absolute;
        bottom: 7.4%;
        right: 4.2%;
        width: 6.25%;
        height: 11.1%;
        background-color: white;
        padding: 8px;
        z-index: 20;
        transform: rotate(-5deg);
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    .qr-inner {
        width: 100%;
        height: 100%;
        background-color: #111;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    }

    .download-btn {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fbbf24;
        color: #000;
        padding: 12px 24px;
        border-radius: 8px;
        font-family: 'Oswald', sans-serif;
        font-size: 1rem;
        font-weight: 600;
        text-transform: uppercase;
        cursor: pointer;
        border: none;
        box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
        transition: all 0.2s;
        z-index: 1000;
    }
    .download-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(251, 191, 36, 0.5);
    }

    @media print {
        body { background: white; padding: 0; }
        .download-btn { display: none; }
        .certificate-wrapper { max-width: 100%; }
    }
</style>
</head>
<body>
<button class="download-btn" onclick="window.print()">
    <i class="fas fa-download"></i> Download Certificate
</button>

<div class="certificate-wrapper">
<div class="slide-container">
    <div class="yellow-bar">
        <p class="vertical-text">PASSIONBOTS // FUTURE TECH</p>
    </div>
    
    <div class="diagonal-shape"></div>
    <div class="texture-overlay"></div>
    <div class="accent-triangle"></div>
    
    <div class="striped-header">
        <div class="stripe"></div>
        <div class="stripe"></div>
        <div class="stripe"></div>
        <div class="stripe"></div>
        <div class="stripe"></div>
    </div>
    
    <div class="serial-tag">ID: ${data.certificateCode}</div>
    
    <div class="content-wrapper">
        <div class="logo-area">
            <div class="logo-icon-box">
                <i class="fas fa-robot"></i>
            </div>
            <p class="logo-text">Passionbots</p>
        </div>
        
        <div class="title-group">
            <p class="cert-title-outline">Certificate</p>
            <h1 class="cert-title-main">Certificate</h1>
            <p class="cert-subtitle">Of Completion // IoT &amp; Robotics</p>
        </div>
        
        <div class="recipient-container">
            <p class="name-label">This Certifies That</p>
            <div class="recipient-name">
                <span>${data.studentName}</span>
            </div>
        </div>
        
        <div class="description">
            <p>For outstanding performance and successful completion of the <strong style="color: #fbbf24;">${data.courseName}</strong>. Demonstrating exceptional skill in systems integration, automation logic, and robotics engineering principles.</p>
        </div>
        
        <div class="footer-grid">
            <div class="footer-item">
                <p class="footer-label">Date Issued</p>
                <p class="footer-value">${data.issueDate}</p>
            </div>
            <div class="footer-item">
                <p class="footer-label">Founder Signature</p>
                <p class="signature-font">Rahul Gupta</p>
                <p style="font-size: 0.9rem; color: #9ca3af; margin-top: 5px;">Rahul Gupta</p>
            </div>
            <div class="footer-item">
                <p class="footer-label">Verify At</p>
                <p class="footer-value" style="color: #fbbf24;">passionbots.co.in</p>
            </div>
        </div>
    </div>
    
    <div class="qr-placeholder">
        <div class="qr-inner">
            <i class="fas fa-qrcode fa-3x"></i>
        </div>
    </div>
</div>
</div>
</body>
</html>`
}

// ============================================
// ADMIN CERTIFICATE GENERATION ROUTES
// ============================================

// Admin Login
app.post('/api/admin/login', async (c) => {
  try {
    const { username, password } = await c.req.json()
    
    // Get admin user
    const admin = await c.env.DB.prepare(`
      SELECT admin_id, username, email, full_name, role, permissions, status
      FROM admin_users
      WHERE username = ? AND password = ? AND status = 'active'
    `).bind(username, password).first()
    
    if (!admin) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401)
    }
    
    // Generate session token
    const sessionToken = `admin_${Date.now()}_${Math.random().toString(36).substring(2)}`
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    
    // Create session
    await c.env.DB.prepare(`
      INSERT INTO admin_sessions (admin_id, session_token, expires_at)
      VALUES (?, ?, ?)
    `).bind(admin.admin_id, sessionToken, expiresAt.toISOString()).run()
    
    // Update last login
    await c.env.DB.prepare(`
      UPDATE admin_users SET last_login = datetime('now') WHERE admin_id = ?
    `).bind(admin.admin_id).run()
    
    return c.json({
      success: true,
      admin: {
        id: admin.admin_id,
        username: admin.username,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
        permissions: JSON.parse(admin.permissions || '[]')
      },
      session_token: sessionToken,
      expires_at: expiresAt.toISOString()
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return c.json({ success: false, error: 'Login failed' }, 500)
  }
})

// Verify Admin Session
async function verifyAdminSession(c: any, sessionToken: string) {
  const session = await c.env.DB.prepare(`
    SELECT s.*, a.admin_id, a.username, a.full_name, a.role, a.permissions
    FROM admin_sessions s
    JOIN admin_users a ON s.admin_id = a.admin_id
    WHERE s.session_token = ? AND s.expires_at > datetime('now')
  `).bind(sessionToken).first()
  
  return session
}

// Admin Generate Certificate (Single)
app.post('/api/admin/certificates/generate', async (c) => {
  try {
    const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')
    
    if (!sessionToken) {
      return c.json({ success: false, error: 'Unauthorized' }, 401)
    }
    
    const session = await verifyAdminSession(c, sessionToken)
    if (!session) {
      return c.json({ success: false, error: 'Invalid or expired session' }, 401)
    }
    
    const { 
      student_id, student_name, student_email, course_id, course_name, 
      completion_date, notes, certificate_type, grade, description 
    } = await c.req.json()
    
    // If student_id provided, get student details
    let studentName = student_name
    let studentEmail = student_email
    
    if (student_id) {
      const student = await c.env.DB.prepare(`
        SELECT full_name, email FROM students WHERE student_id = ?
      `).bind(student_id).first()
      
      if (student) {
        studentName = student.full_name
        studentEmail = student.email
      }
    }
    
    if (!studentName) {
      return c.json({ success: false, error: 'Student name is required' }, 400)
    }
    
    // Certificate type: completion or participation
    const certType = certificate_type || 'completion'
    
    // Default description based on certificate type
    let certDescription = description
    if (!certDescription) {
      if (certType === 'participation') {
        certDescription = `For outstanding performance and successful participation in the ${course_name || 'IoT and Robotics'} Webinar. Demonstrating exceptional skill in systems integration, automation logic, and robotics engineering principles.`
      } else {
        certDescription = `For outstanding performance and successful completion of the ${course_name || 'IoT and Robotics'} Program. Demonstrating exceptional skill in systems integration, automation logic, and robotics engineering principles.`
      }
    }
    
    // Generate unique certificate code
    const certificateCode = generateCertificateCode()
    const verificationUrl = `https://passionbots-lms.pages.dev/verify/${certificateCode}`
    
    // Certificate data
    const certificateData = JSON.stringify({
      studentName: studentName,
      courseName: course_name || 'IoT & Robotics Course',
      issueDate: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      completionDate: completion_date || new Date().toISOString().split('T')[0],
      certificateCode: certificateCode,
      verificationUrl: verificationUrl,
      certificateType: certType,
      grade: grade || null,
      description: certDescription
    })
    
    // Insert certificate
    const result = await c.env.DB.prepare(`
      INSERT INTO certificates (
        student_id, course_id, certificate_code, student_name, 
        course_name, issue_date, completion_date, certificate_data, 
        verification_url, status, certificate_type, grade, description
      )
      VALUES (?, ?, ?, ?, ?, date('now'), ?, ?, ?, 'active', ?, ?, ?)
    `).bind(
      student_id || null,
      course_id || null,
      certificateCode,
      studentName,
      course_name || 'IoT & Robotics Course',
      completion_date || new Date().toISOString().split('T')[0],
      certificateData,
      verificationUrl,
      certType,
      grade || null,
      certDescription
    ).run()
    
    const certificateId = result.meta.last_row_id
    
    // Log certificate generation
    await c.env.DB.prepare(`
      INSERT INTO certificate_generation_logs (admin_id, certificate_id, student_id, course_name, action, notes)
      VALUES (?, ?, ?, ?, 'generate', ?)
    `).bind(
      session.admin_id,
      certificateId,
      student_id || 0,
      course_name || 'IoT & Robotics Course',
      notes || 'Generated by admin'
    ).run()
    
    return c.json({
      success: true,
      certificate: {
        certificate_id: certificateId,
        certificate_code: certificateCode,
        student_name: studentName,
        student_email: studentEmail,
        course_name: course_name || 'IoT & Robotics Course',
        issue_date: new Date().toISOString().split('T')[0],
        verification_url: verificationUrl
      }
    })
  } catch (error) {
    console.error('Admin generate certificate error:', error)
    return c.json({ success: false, error: 'Failed to generate certificate' }, 500)
  }
})

// Admin Bulk Generate Certificates
app.post('/api/admin/certificates/bulk-generate', async (c) => {
  try {
    const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')
    
    if (!sessionToken) {
      return c.json({ success: false, error: 'Unauthorized' }, 401)
    }
    
    const session = await verifyAdminSession(c, sessionToken)
    if (!session) {
      return c.json({ success: false, error: 'Invalid or expired session' }, 401)
    }
    
    const { batch_name, course_name, students, completion_date } = await c.req.json()
    
    if (!students || students.length === 0) {
      return c.json({ success: false, error: 'No students provided' }, 400)
    }
    
    // Create batch record
    const batchResult = await c.env.DB.prepare(`
      INSERT INTO certificate_batches (admin_id, batch_name, course_name, total_certificates, status)
      VALUES (?, ?, ?, ?, 'processing')
    `).bind(
      session.admin_id,
      batch_name || `Batch ${new Date().toISOString()}`,
      course_name,
      students.length
    ).run()
    
    const batchId = batchResult.meta.last_row_id
    const certificates = []
    let successCount = 0
    
    // Generate certificates for each student
    for (const student of students) {
      try {
        const certificateCode = generateCertificateCode()
        const verificationUrl = `https://passionbots-lms.pages.dev/verify/${certificateCode}`
        
        const certificateData = JSON.stringify({
          studentName: student.name,
          courseName: course_name,
          issueDate: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          completionDate: completion_date || new Date().toISOString().split('T')[0],
          certificateCode: certificateCode,
          verificationUrl: verificationUrl
        })
        
        const result = await c.env.DB.prepare(`
          INSERT INTO certificates (
            student_id, certificate_code, student_name, course_name, 
            issue_date, completion_date, certificate_data, verification_url, status
          )
          VALUES (?, ?, ?, ?, date('now'), ?, ?, ?, 'active')
        `).bind(
          student.student_id || null,
          certificateCode,
          student.name,
          course_name,
          completion_date || new Date().toISOString().split('T')[0],
          certificateData,
          verificationUrl
        ).run()
        
        certificates.push({
          certificate_id: result.meta.last_row_id,
          certificate_code: certificateCode,
          student_name: student.name,
          student_email: student.email
        })
        
        successCount++
      } catch (error) {
        console.error(`Failed to generate certificate for ${student.name}:`, error)
      }
    }
    
    // Update batch status
    await c.env.DB.prepare(`
      UPDATE certificate_batches 
      SET generated_count = ?, status = 'completed', completed_at = datetime('now')
      WHERE batch_id = ?
    `).bind(successCount, batchId).run()
    
    return c.json({
      success: true,
      batch: {
        batch_id: batchId,
        total: students.length,
        generated: successCount,
        failed: students.length - successCount
      },
      certificates: certificates
    })
  } catch (error) {
    console.error('Bulk generate error:', error)
    return c.json({ success: false, error: 'Bulk generation failed' }, 500)
  }
})

// Get All Certificates (Admin View)
app.get('/api/admin/certificates', async (c) => {
  try {
    const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')
    
    if (!sessionToken) {
      return c.json({ success: false, error: 'Unauthorized' }, 401)
    }
    
    const session = await verifyAdminSession(c, sessionToken)
    if (!session) {
      return c.json({ success: false, error: 'Invalid or expired session' }, 401)
    }
    
    const limit = c.req.query('limit') || '50'
    const offset = c.req.query('offset') || '0'
    const search = c.req.query('search') || ''
    
    let query = `
      SELECT 
        certificate_id,
        certificate_code,
        student_name,
        course_name,
        issue_date,
        completion_date,
        verification_url,
        status
      FROM certificates
    `
    
    if (search) {
      query += ` WHERE student_name LIKE ? OR certificate_code LIKE ?`
    }
    
    query += ` ORDER BY issue_date DESC LIMIT ? OFFSET ?`
    
    const certificates = search
      ? await c.env.DB.prepare(query).bind(`%${search}%`, `%${search}%`, limit, offset).all()
      : await c.env.DB.prepare(query).bind(limit, offset).all()
    
    return c.json({ success: true, certificates: certificates.results })
  } catch (error) {
    console.error('Get certificates error:', error)
    return c.json({ success: false, error: 'Failed to load certificates' }, 500)
  }
})

// Revoke Certificate
app.post('/api/admin/certificates/:id/revoke', async (c) => {
  try {
    const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')
    
    if (!sessionToken) {
      return c.json({ success: false, error: 'Unauthorized' }, 401)
    }
    
    const session = await verifyAdminSession(c, sessionToken)
    if (!session) {
      return c.json({ success: false, error: 'Invalid or expired session' }, 401)
    }
    
    const certificateId = c.req.param('id')
    const { reason } = await c.req.json()
    
    // Update certificate status
    await c.env.DB.prepare(`
      UPDATE certificates SET status = 'revoked' WHERE certificate_id = ?
    `).bind(certificateId).run()
    
    // Log revocation
    await c.env.DB.prepare(`
      INSERT INTO certificate_generation_logs (admin_id, certificate_id, student_id, course_name, action, notes)
      VALUES (?, ?, 0, '', 'revoke', ?)
    `).bind(session.admin_id, certificateId, reason || 'Revoked by admin').run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Revoke certificate error:', error)
    return c.json({ success: false, error: 'Failed to revoke certificate' }, 500)
  }
})

// Get Admin Dashboard Stats
app.get('/api/admin/certificates/stats', async (c) => {
  try {
    const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')
    
    if (!sessionToken) {
      return c.json({ success: false, error: 'Unauthorized' }, 401)
    }
    
    const session = await verifyAdminSession(c, sessionToken)
    if (!session) {
      return c.json({ success: false, error: 'Invalid or expired session' }, 401)
    }
    
    // Get total certificates
    const total = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM certificates
    `).first()
    
    // Get certificates issued today
    const today = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM certificates WHERE date(issue_date) = date('now')
    `).first()
    
    // Get active students
    const students = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM students WHERE status = 'active'
    `).first()
    
    // Get pending verifications (certificates with status pending if any)
    const pending = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM certificates WHERE status = 'pending'
    `).first()
    
    return c.json({
      success: true,
      stats: {
        total: total?.count || 0,
        today: today?.count || 0,
        students: students?.count || 0,
        pending: pending?.count || 0
      }
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return c.json({ success: false, error: 'Failed to load stats' }, 500)
  }
})

// Search Students (Admin)
app.get('/api/admin/students/search', async (c) => {
  try {
    const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')
    
    if (!sessionToken) {
      return c.json({ success: false, error: 'Unauthorized' }, 401)
    }
    
    const session = await verifyAdminSession(c, sessionToken)
    if (!session) {
      return c.json({ success: false, error: 'Invalid or expired session' }, 401)
    }
    
    const query = c.req.query('q') || ''
    
    if (query.length < 2) {
      return c.json({ success: true, students: [] })
    }
    
    const students = await c.env.DB.prepare(`
      SELECT student_id as user_id, full_name as name, email, enrollment_date
      FROM students
      WHERE full_name LIKE ? OR email LIKE ? OR CAST(student_id AS TEXT) LIKE ?
      LIMIT 20
    `).bind(`%${query}%`, `%${query}%`, `%${query}%`).all()
    
    return c.json({ success: true, students: students.results })
  } catch (error) {
    console.error('Search students error:', error)
    return c.json({ success: false, error: 'Search failed' }, 500)
  }
})

// Download CSV Template
app.get('/api/admin/certificates/template.csv', (c) => {
  const csv = `student_id,name,email,course_name,completion_date,grade,notes
1,John Doe,john@example.com,IoT Robotics Program,2025-12-30,A+,Excellent performance
2,Jane Smith,jane@example.com,AI & Machine Learning,2025-12-30,A,Outstanding work
3,Bob Johnson,bob@example.com,Web Development,2025-12-30,B+,Good progress`
  
  return c.text(csv, 200, {
    'Content-Type': 'text/csv',
    'Content-Disposition': 'attachment; filename="certificate_template.csv"'
  })
})

// Get Admin Dashboard Stats (legacy endpoint)
app.get('/api/admin/stats', async (c) => {
  try {
    const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')
    
    if (!sessionToken) {
      return c.json({ success: false, error: 'Unauthorized' }, 401)
    }
    
    const session = await verifyAdminSession(c, sessionToken)
    if (!session) {
      return c.json({ success: false, error: 'Invalid or expired session' }, 401)
    }
    
    // Get total certificates
    const total = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM certificates
    `).first()
    
    // Get active certificates
    const active = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM certificates WHERE status = 'active'
    `).first()
    
    // Get revoked certificates
    const revoked = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM certificates WHERE status = 'revoked'
    `).first()
    
    // Get certificates issued today
    const today = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM certificates WHERE date(issue_date) = date('now')
    `).first()
    
    return c.json({
      success: true,
      stats: {
        total: total?.count || 0,
        active: active?.count || 0,
        revoked: revoked?.count || 0,
        today: today?.count || 0
      }
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return c.json({ success: false, error: 'Failed to load stats' }, 500)
  }
})

// ============================================
// ZOOM INTEGRATION ROUTES
// ============================================

// Zoom OAuth - Get Authorization URL
app.get('/api/zoom/auth-url', async (c) => {
  try {
    const ZOOM_CLIENT_ID = c.env.ZOOM_CLIENT_ID || 'YOUR_ZOOM_CLIENT_ID'
    const ZOOM_REDIRECT_URI = c.env.ZOOM_REDIRECT_URI || 'https://passionbots-lms.pages.dev/api/zoom/callback'
    
    const authUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${ZOOM_CLIENT_ID}&redirect_uri=${encodeURIComponent(ZOOM_REDIRECT_URI)}`
    
    return c.json({ success: true, auth_url: authUrl })
  } catch (error) {
    console.error('Zoom auth URL error:', error)
    return c.json({ success: false, error: 'Failed to generate auth URL' }, 500)
  }
})

// Zoom OAuth Callback
app.get('/api/zoom/callback', async (c) => {
  try {
    const code = c.req.query('code')
    
    if (!code) {
      return c.json({ success: false, error: 'No authorization code' }, 400)
    }
    
    const ZOOM_CLIENT_ID = c.env.ZOOM_CLIENT_ID || 'YOUR_ZOOM_CLIENT_ID'
    const ZOOM_CLIENT_SECRET = c.env.ZOOM_CLIENT_SECRET || 'YOUR_ZOOM_CLIENT_SECRET'
    const ZOOM_REDIRECT_URI = c.env.ZOOM_REDIRECT_URI || 'https://passionbots-lms.pages.dev/api/zoom/callback'
    
    // Exchange code for access token
    const tokenResponse = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(ZOOM_REDIRECT_URI)}`
    })
    
    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token')
    }
    
    const tokenData = await tokenResponse.json()
    
    // Store tokens in database (associated with mentor)
    await c.env.DB.prepare(`
      INSERT OR REPLACE INTO zoom_tokens (mentor_id, access_token, refresh_token, expires_at)
      VALUES (?, ?, ?, datetime('now', '+' || ? || ' seconds'))
    `).bind(
      1, // Replace with actual mentor_id from session
      tokenData.access_token,
      tokenData.refresh_token,
      tokenData.expires_in
    ).run()
    
    return c.html(`
      <html>
        <body>
          <h1>Zoom Connected Successfully!</h1>
          <p>You can now schedule meetings and they will be automatically recorded.</p>
          <script>
            setTimeout(() => {
              window.close();
            }, 2000);
          </script>
        </body>
      </html>
    `)
  } catch (error) {
    console.error('Zoom callback error:', error)
    return c.json({ success: false, error: 'Failed to authenticate' }, 500)
  }
})

// Schedule Zoom Meeting
app.post('/api/zoom/schedule-meeting', async (c) => {
  try {
    const { title, description, start_time, duration, mentor_id, session_id } = await c.req.json()
    
    // Get mentor's Zoom token
    const tokenRecord = await c.env.DB.prepare(
      'SELECT access_token, refresh_token, expires_at FROM zoom_tokens WHERE mentor_id = ?'
    ).bind(mentor_id).first()
    
    if (!tokenRecord) {
      return c.json({ success: false, error: 'Mentor not connected to Zoom' }, 400)
    }
    
    // Check if token expired and refresh if needed
    let accessToken = tokenRecord.access_token
    const now = new Date()
    const expiresAt = new Date(tokenRecord.expires_at)
    
    if (now >= expiresAt) {
      // Refresh token
      const ZOOM_CLIENT_ID = c.env.ZOOM_CLIENT_ID || 'YOUR_ZOOM_CLIENT_ID'
      const ZOOM_CLIENT_SECRET = c.env.ZOOM_CLIENT_SECRET || 'YOUR_ZOOM_CLIENT_SECRET'
      
      const refreshResponse = await fetch('https://zoom.us/oauth/token', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=refresh_token&refresh_token=${tokenRecord.refresh_token}`
      })
      
      if (!refreshResponse.ok) {
        return c.json({ success: false, error: 'Failed to refresh token' }, 401)
      }
      
      const refreshData = await refreshResponse.json()
      accessToken = refreshData.access_token
      
      // Update tokens in database
      await c.env.DB.prepare(`
        UPDATE zoom_tokens 
        SET access_token = ?, refresh_token = ?, expires_at = datetime('now', '+' || ? || ' seconds')
        WHERE mentor_id = ?
      `).bind(
        refreshData.access_token,
        refreshData.refresh_token,
        refreshData.expires_in,
        mentor_id
      ).run()
    }
    
    // Create Zoom meeting
    const meetingData = {
      topic: title,
      type: 2, // Scheduled meeting
      start_time: start_time,
      duration: duration,
      timezone: 'Asia/Kolkata',
      agenda: description,
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        watermark: false,
        use_pmi: false,
        approval_type: 2,
        audio: 'both',
        auto_recording: 'cloud', // CRITICAL: Enable cloud recording
        waiting_room: true
      }
    }
    
    const meetingResponse = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(meetingData)
    })
    
    if (!meetingResponse.ok) {
      throw new Error('Failed to create Zoom meeting')
    }
    
    const meeting = await meetingResponse.json()
    
    // Store meeting in database
    await c.env.DB.prepare(`
      INSERT INTO zoom_meetings (session_id, mentor_id, zoom_meeting_id, meeting_url, join_url, start_url, start_time, duration, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')
    `).bind(
      session_id,
      mentor_id,
      meeting.id.toString(),
      meeting.join_url,
      meeting.join_url,
      meeting.start_url,
      start_time,
      duration
    ).run()
    
    return c.json({
      success: true,
      meeting: {
        id: meeting.id,
        join_url: meeting.join_url,
        start_url: meeting.start_url,
        password: meeting.password
      }
    })
  } catch (error) {
    console.error('Schedule meeting error:', error)
    return c.json({ success: false, error: 'Failed to schedule meeting' }, 500)
  }
})

// Zoom Webhook - Handle Recording Completed
app.post('/api/zoom/webhook', async (c) => {
  try {
    const payload = await c.req.json()
    
    // Verify webhook signature
    const ZOOM_WEBHOOK_SECRET = c.env.ZOOM_WEBHOOK_SECRET || 'YOUR_WEBHOOK_SECRET'
    const signature = c.req.header('x-zm-signature')
    const timestamp = c.req.header('x-zm-request-timestamp')
    
    // Signature verification (simplified - implement proper verification in production)
    
    if (payload.event === 'recording.completed') {
      const meetingId = payload.payload.object.id.toString()
      const recordingFiles = payload.payload.object.recording_files
      
      // Get meeting from database
      const meeting = await c.env.DB.prepare(
        'SELECT * FROM zoom_meetings WHERE zoom_meeting_id = ?'
      ).bind(meetingId).first()
      
      if (!meeting) {
        return c.json({ success: false, error: 'Meeting not found' }, 404)
      }
      
      // Download and store each recording file
      for (const file of recordingFiles) {
        if (file.file_type === 'MP4' || file.file_type === 'M4A') {
          const downloadUrl = file.download_url
          
          // Download recording
          const recordingResponse = await fetch(downloadUrl, {
            headers: {
              'Authorization': `Bearer ${file.download_token || ''}`
            }
          })
          
          if (!recordingResponse.ok) {
            console.error('Failed to download recording:', file.id)
            continue
          }
          
          const recordingBlob = await recordingResponse.arrayBuffer()
          
          // Upload to Cloudflare R2 (if configured)
          if (c.env.R2) {
            const fileName = `recordings/${meetingId}_${file.id}.${file.file_extension}`
            await c.env.R2.put(fileName, recordingBlob, {
              httpMetadata: {
                contentType: file.file_type === 'MP4' ? 'video/mp4' : 'audio/mp4'
              }
            })
            
            // Store recording info in database
            await c.env.DB.prepare(`
              INSERT INTO zoom_recordings (meeting_id, file_id, file_name, file_type, file_size, r2_key, status)
              VALUES (?, ?, ?, ?, ?, ?, 'available')
            `).bind(
              meeting.meeting_id,
              file.id,
              file.recording_start,
              file.file_type,
              file.file_size,
              fileName
            ).run()
          }
        }
      }
      
      // Update meeting status
      await c.env.DB.prepare(
        'UPDATE zoom_meetings SET status = ?, recording_status = ? WHERE zoom_meeting_id = ?'
      ).bind('completed', 'available', meetingId).run()
    }
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return c.json({ success: false, error: 'Webhook processing failed' }, 500)
  }
})

// Get Recorded Sessions (for students)
app.get('/api/zoom/recordings/:sessionId', async (c) => {
  try {
    const sessionId = c.req.param('sessionId')
    
    const recordings = await c.env.DB.prepare(`
      SELECT 
        zr.*,
        zm.session_id,
        zm.start_time,
        ls.session_title,
        ls.description
      FROM zoom_recordings zr
      JOIN zoom_meetings zm ON zr.meeting_id = zm.meeting_id
      JOIN live_sessions ls ON zm.session_id = ls.session_id
      WHERE zm.session_id = ? AND zr.status = 'available'
      ORDER BY zm.start_time DESC
    `).bind(sessionId).all()
    
    return c.json({ success: true, recordings: recordings.results })
  } catch (error) {
    console.error('Get recordings error:', error)
    return c.json({ success: false, error: 'Failed to get recordings' }, 500)
  }
})

// Get Recording Video Stream (for playback)
app.get('/api/zoom/recordings/:recordingId/stream', async (c) => {
  try {
    const recordingId = c.req.param('recordingId')
    
    const recording = await c.env.DB.prepare(
      'SELECT * FROM zoom_recordings WHERE recording_id = ?'
    ).bind(recordingId).first()
    
    if (!recording) {
      return c.notFound()
    }
    
    // Get video from R2
    if (c.env.R2) {
      const object = await c.env.R2.get(recording.r2_key)
      
      if (!object) {
        return c.notFound()
      }
      
      return new Response(object.body, {
        headers: {
          'Content-Type': recording.file_type === 'MP4' ? 'video/mp4' : 'audio/mp4',
          'Content-Length': recording.file_size.toString(),
          'Accept-Ranges': 'bytes'
        }
      })
    }
    
    return c.json({ success: false, error: 'Storage not configured' }, 500)
  } catch (error) {
    console.error('Stream recording error:', error)
    return c.json({ success: false, error: 'Failed to stream recording' }, 500)
  }
})

// Get All Recordings (for student dashboard)
app.get('/api/zoom/recordings', async (c) => {
  try {
    const studentId = c.req.query('student_id')
    
    let query = `
      SELECT 
        zr.*,
        zm.session_id,
        zm.start_time,
        zm.duration,
        ls.session_title,
        ls.description,
        m.full_name as mentor_name
      FROM zoom_recordings zr
      JOIN zoom_meetings zm ON zr.meeting_id = zm.meeting_id
      JOIN live_sessions ls ON zm.session_id = ls.session_id
      JOIN mentors m ON zm.mentor_id = m.mentor_id
      WHERE zr.status = 'available'
    `
    
    if (studentId) {
      // Filter by student's enrolled sessions
      query += ` AND EXISTS (
        SELECT 1 FROM session_enrollments 
        WHERE session_id = zm.session_id AND student_id = ?
      )`
    }
    
    query += ' ORDER BY zm.start_time DESC LIMIT 50'
    
    const recordings = studentId 
      ? await c.env.DB.prepare(query).bind(studentId).all()
      : await c.env.DB.prepare(query).all()
    
    return c.json({ success: true, recordings: recordings.results })
  } catch (error) {
    console.error('Get all recordings error:', error)
    return c.json({ success: false, error: 'Failed to get recordings' }, 500)
  }
})

// Direct PDF Download Endpoint (using Puppeteer-like approach via external service)
app.get('/api/certificates/:id/download', async (c) => {
  try {
    const certificateId = c.req.param('id')
    
    const certificate = await c.env.DB.prepare(`
      SELECT * FROM certificates WHERE certificate_id = ?
    `).bind(certificateId).first()
    
    if (!certificate) {
      return c.notFound()
    }
    
    const data = JSON.parse(certificate.certificate_data)
    const htmlContent = generateEnhancedCertificate(data, certificate)
    
    // Return HTML with download filename
    const studentName = certificate.student_name.replace(/[^a-zA-Z0-9]/g, '_')
    const filename = `${studentName}_PassionBots_Certificate.pdf`
    
    // Set headers to trigger download
    c.header('Content-Type', 'text/html; charset=utf-8')
    c.header('Content-Disposition', `inline; filename="${filename}"`)
    c.header('X-Download-Filename', filename)
    
    return c.html(htmlContent)
  } catch (error) {
    console.error('Download certificate error:', error)
    return c.text('Failed to download certificate', 500)
  }
})

// Bulk Generate Certificates from CSV
app.post('/api/admin/certificates/bulk-csv', async (c) => {
  try {
    const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')
    
    if (!sessionToken) {
      return c.json({ success: false, error: 'Unauthorized' }, 401)
    }
    
    const session = await verifyAdminSession(c, sessionToken)
    if (!session) {
      return c.json({ success: false, error: 'Invalid or expired session' }, 401)
    }
    
    const { students, course_name, certificate_type, completion_date } = await c.req.json()
    
    if (!students || students.length === 0) {
      return c.json({ success: false, error: 'No students provided' }, 400)
    }
    
    const generated = []
    const failed = []
    
    for (const studentName of students) {
      try {
        const certificateCode = generateCertificateCode()
        const verificationUrl = `https://passionbots-lms.pages.dev/verify/${certificateCode}`
        const certType = certificate_type || 'participation'
        
        const description = certType === 'participation'
          ? `For outstanding performance and successful participation in the ${course_name || 'IoT and Robotics'} Webinar. Demonstrating exceptional skill in systems integration, automation logic, and robotics engineering principles.`
          : `For outstanding performance and successful completion of the ${course_name || 'IoT and Robotics'} Program. Demonstrating exceptional skill in systems integration, automation logic, and robotics engineering principles.`
        
        const certificateData = JSON.stringify({
          studentName: studentName,
          courseName: course_name || 'IOT Robotics Program',
          issueDate: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          completionDate: completion_date || new Date().toISOString().split('T')[0],
          certificateCode: certificateCode,
          verificationUrl: verificationUrl,
          certificateType: certType,
          description: description
        })
        
        const result = await c.env.DB.prepare(`
          INSERT INTO certificates (
            student_name, course_name, certificate_code, issue_date, 
            completion_date, certificate_data, verification_url, 
            status, certificate_type, description
          )
          VALUES (?, ?, ?, date('now'), ?, ?, ?, 'active', ?, ?)
        `).bind(
          studentName,
          course_name || 'IOT Robotics Program',
          certificateCode,
          completion_date || new Date().toISOString().split('T')[0],
          certificateData,
          verificationUrl,
          certType,
          description
        ).run()
        
        generated.push({
          name: studentName,
          certificate_code: certificateCode,
          certificate_id: result.meta.last_row_id,
          verification_url: verificationUrl
        })
        
      } catch (error) {
        failed.push({ name: studentName, error: error.message })
      }
    }
    
    return c.json({
      success: true,
      generated: generated.length,
      failed: failed.length,
      certificates: generated,
      errors: failed
    })
    
  } catch (error) {
    console.error('Bulk generate error:', error)
    return c.json({ success: false, error: 'Failed to bulk generate' }, 500)
  }
})

// List all certificates with verification links
app.get('/api/admin/certificates/list', async (c) => {
  try {
    const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')
    
    if (!sessionToken) {
      return c.json({ success: false, error: 'Unauthorized' }, 401)
    }
    
    const session = await verifyAdminSession(c, sessionToken)
    if (!session) {
      return c.json({ success: false, error: 'Invalid or expired session' }, 401)
    }
    
    const certificates = await c.env.DB.prepare(`
      SELECT 
        certificate_id, 
        certificate_code, 
        student_name,
        student_email,
        course_name, 
        certificate_type,
        issue_date, 
        verification_url,
        status
      FROM certificates
      ORDER BY certificate_id DESC
      LIMIT 100
    `).all()
    
    return c.json({
      success: true,
      certificates: certificates.results || []
    })
    
  } catch (error) {
    console.error('List certificates error:', error)
    return c.json({ success: false, error: 'Failed to list certificates' }, 500)
  }
})

// ============================================
// EMAIL SENDING ENDPOINTS (Resend API)
// ============================================

// Send email to single certificate recipient
app.post('/api/admin/certificates/:id/send-email', async (c) => {
  try {
    const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')
    
    if (!sessionToken) {
      return c.json({ success: false, error: 'Unauthorized' }, 401)
    }
    
    const session = await verifyAdminSession(c, sessionToken)
    if (!session) {
      return c.json({ success: false, error: 'Invalid or expired session' }, 401)
    }
    
    const certificateId = c.req.param('id')
    const { student_email, deployment_url } = await c.req.json()
    
    if (!student_email || !student_email.includes('@')) {
      return c.json({ success: false, error: 'Valid email address required' }, 400)
    }
    
    // Get certificate details
    const certificate = await c.env.DB.prepare(`
      SELECT * FROM certificates WHERE certificate_id = ?
    `).bind(certificateId).first()
    
    if (!certificate) {
      return c.json({ success: false, error: 'Certificate not found' }, 404)
    }
    
    const baseUrl = deployment_url || 'https://passionbots-lms.pages.dev'
    const viewUrl = `${baseUrl}/api/certificates/${certificateId}/view`
    const verifyUrl = `${baseUrl}/verify/${certificate.certificate_code}`
    
    // Send email using Resend
    const result = await sendCertificateEmail(c, {
      to_email: student_email,
      to_name: certificate.student_name,
      certificate_code: certificate.certificate_code,
      course_name: certificate.course_name,
      view_url: viewUrl,
      verify_url: verifyUrl
    })
    
    if (result.success) {
      // Update certificate with email status
      await c.env.DB.prepare(`
        UPDATE certificates 
        SET student_email = ?, email_sent = 1, email_sent_at = datetime('now')
        WHERE certificate_id = ?
      `).bind(student_email, certificateId).run()
      
      return c.json({
        success: true,
        message: 'Email sent successfully',
        email_id: result.id
      })
    } else {
      return c.json({
        success: false,
        error: result.error
      }, 500)
    }
    
  } catch (error) {
    console.error('Send email error:', error)
    return c.json({ success: false, error: 'Failed to send email' }, 500)
  }
})

// Send bulk emails to certificate batch
app.post('/api/admin/certificates/send-bulk-email', async (c) => {
  try {
    const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')
    
    if (!sessionToken) {
      return c.json({ success: false, error: 'Unauthorized' }, 401)
    }
    
    const session = await verifyAdminSession(c, sessionToken)
    if (!session) {
      return c.json({ success: false, error: 'Invalid or expired session' }, 401)
    }
    
    const { certificate_ids, deployment_url } = await c.req.json()
    
    if (!certificate_ids || !Array.isArray(certificate_ids) || certificate_ids.length === 0) {
      return c.json({ success: false, error: 'Certificate IDs array required' }, 400)
    }
    
    const baseUrl = deployment_url || 'https://passionbots-lms.pages.dev'
    
    const results = {
      sent: 0,
      failed: 0,
      skipped: 0,
      details: []
    }
    
    for (const certId of certificate_ids) {
      try {
        // Get certificate with email
        const certificate = await c.env.DB.prepare(`
          SELECT * FROM certificates WHERE certificate_id = ?
        `).bind(certId).first()
        
        if (!certificate) {
          results.skipped++
          results.details.push({
            certificate_id: certId,
            status: 'skipped',
            reason: 'Certificate not found'
          })
          continue
        }
        
        const studentEmail = certificate.student_email
        
        if (!studentEmail || !studentEmail.includes('@')) {
          results.skipped++
          results.details.push({
            certificate_id: certId,
            student_name: certificate.student_name,
            status: 'skipped',
            reason: 'No valid email'
          })
          continue
        }
        
        const viewUrl = `${baseUrl}/api/certificates/${certId}/view`
        const verifyUrl = `${baseUrl}/verify/${certificate.certificate_code}`
        
        // Send email
        const result = await sendCertificateEmail(c, {
          to_email: studentEmail,
          to_name: certificate.student_name,
          certificate_code: certificate.certificate_code,
          course_name: certificate.course_name,
          view_url: viewUrl,
          verify_url: verifyUrl
        })
        
        if (result.success) {
          results.sent++
          
          // Update certificate
          await c.env.DB.prepare(`
            UPDATE certificates 
            SET email_sent = 1, email_sent_at = datetime('now')
            WHERE certificate_id = ?
          `).bind(certId).run()
          
          results.details.push({
            certificate_id: certId,
            student_name: certificate.student_name,
            email: studentEmail,
            status: 'sent',
            email_id: result.id
          })
        } else {
          results.failed++
          results.details.push({
            certificate_id: certId,
            student_name: certificate.student_name,
            email: studentEmail,
            status: 'failed',
            error: result.error
          })
        }
        
      } catch (error) {
        results.failed++
        results.details.push({
          certificate_id: certId,
          status: 'failed',
          error: error.message
        })
      }
    }
    
    return c.json({
      success: true,
      results
    })
    
  } catch (error) {
    console.error('Bulk email error:', error)
    return c.json({ success: false, error: 'Failed to send bulk emails' }, 500)
  }
})

// Helper function to send certificate email via Resend
async function sendCertificateEmail(c: any, params: {
  to_email: string,
  to_name: string,
  certificate_code: string,
  course_name: string,
  view_url: string,
  verify_url: string
}) {
  const RESEND_API_KEY = c.env.RESEND_API_KEY
  
  if (!RESEND_API_KEY) {
    return { success: false, error: 'Resend API key not configured' }
  }
  
  const { to_email, to_name, certificate_code, course_name, view_url, verify_url } = params
  
  const subject = `🎓 Your ${course_name} Certificate is Ready - ${to_name}`
  
  const html = createCertificateEmailHTML(to_name, course_name, certificate_code, view_url, verify_url)
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'PassionBots LMS <certificates@passionbots.co.in>',
        to: [to_email],
        subject: subject,
        html: html
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      return { success: true, id: data.id }
    } else {
      const error = await response.text()
      return { success: false, error: error }
    }
    
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Create email HTML template
function createCertificateEmailHTML(studentName: string, courseName: string, certificateCode: string, viewUrl: string, verifyUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Certificate is Ready</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffd700; font-size: 28px; font-weight: bold;">🎓 Congratulations!</h1>
                            <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px;">Your certificate is ready</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Dear <strong>${studentName}</strong>,
                            </p>
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Congratulations on successfully completing the <strong>${courseName}</strong>! 🎉
                            </p>
                            <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Your certificate is now available for download. This certificate validates your participation and achievement in our program.
                            </p>
                            <table role="presentation" style="width: 100%; background-color: #f8f9fa; border-left: 4px solid #ffd700; border-radius: 4px; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">
                                            <strong>Certificate Code:</strong><br>
                                            <span style="font-family: monospace; color: #333333; font-size: 16px;">${certificateCode}</span>
                                        </p>
                                        <p style="margin: 0; color: #666666; font-size: 14px;">
                                            <strong>Course:</strong> ${courseName}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            <table role="presentation" style="width: 100%; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 10px 0;">
                                        <a href="${viewUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #1a1a1a; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(255, 215, 0, 0.3);">
                                            📄 View & Download Certificate
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0;">
                                        <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #ffffff; color: #333333; text-decoration: none; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 14px;">
                                            🔍 Verify Certificate Authenticity
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <div style="background-color: #e8f4f8; border-left: 4px solid #0066cc; padding: 15px; border-radius: 4px; margin-bottom: 30px;">
                                <p style="margin: 0 0 10px; color: #0066cc; font-weight: bold; font-size: 14px;">📌 How to Use Your Certificate:</p>
                                <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 14px; line-height: 1.6;">
                                    <li>Click "View & Download Certificate" to open your certificate</li>
                                    <li>Click the yellow "Download PDF" button on the certificate page</li>
                                    <li>Share the verification link with employers or institutions</li>
                                    <li>Keep your certificate code safe for future verification</li>
                                </ul>
                            </div>
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                We're proud of your achievement and wish you continued success in your IoT and Robotics journey!
                            </p>
                            <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                                Best regards,<br>
                                <strong>The PassionBots Team</strong>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">
                                PassionBots - Empowering Tomorrow's Tech Leaders
                            </p>
                            <p style="margin: 0 0 10px; color: #999999; font-size: 12px;">
                                IoT, Robotics & Embedded Systems Training
                            </p>
                            <p style="margin: 0; color: #999999; font-size: 12px;">
                                <a href="https://passionbots.co.in" style="color: #0066cc; text-decoration: none;">www.passionbots.co.in</a>
                            </p>
                        </td>
                    </tr>
                </table>
                <table role="presentation" style="width: 600px; margin: 20px auto;">
                    <tr>
                        <td style="text-align: center; color: #999999; font-size: 12px; line-height: 1.6;">
                            <p style="margin: 0;">
                                This is an automated email. Please do not reply to this message.
                            </p>
                            <p style="margin: 10px 0 0;">
                                If you have questions, contact us at support@passionbots.co.in
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
}

// Enhanced Certificate Generator (matching PDF format exactly)
function generateEnhancedCertificate(data: any, certificate: any) {
  const studentName = data.studentName || certificate.student_name || 'Student Name'
  const courseName = data.courseName || certificate.course_name || 'IOT & Robotics'
  const certificateCode = data.certificateCode || certificate.certificate_code || 'PB-IOT-2025-0001'
  const certificateType = certificate.certificate_type || data.certificateType || 'participation'
  const description = certificate.description || data.description || 
    `For outstanding performance and successful ${certificateType} in the ${courseName} ${certificateType === 'participation' ? 'Webinar' : 'Program'}. Demonstrating exceptional skill in systems integration, automation logic, and robotics engineering principles.`
  
  const issueDate = data.issueDate || new Date(certificate.issue_date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  
  const certTypeUpper = certificateType === 'participation' ? 'PARTICIPATION' : 'COMPLETION'
  const courseShort = courseName.toUpperCase().replace(/PROGRAM|BOOTCAMP|COURSE/gi, '').trim()
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Certificate - ${studentName}</title>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet"/>
<link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet"/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<style>
  @page { size: A4 landscape; margin: 0; }
  @media print {
    body { width: 297mm; height: 210mm; margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none !important; }
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Roboto', sans-serif; background: #f0f0f0; overflow-x: hidden; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
  .certificate-container { width: 297mm; height: 210mm; position: relative; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); color: white; box-shadow: 0 10px 50px rgba(0,0,0,0.3); }
  .yellow-bar { position: absolute; left: 0; top: 0; bottom: 0; width: 100px; background: linear-gradient(180deg, #ffd700 0%, #f4c430 100%); box-shadow: 5px 0 25px rgba(255, 215, 0, 0.4); z-index: 10; }
  .vertical-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-90deg); font-family: 'Oswald', sans-serif; font-size: 2.8rem; font-weight: 700; color: #000; letter-spacing: 0.4rem; text-transform: uppercase; white-space: nowrap; }
  .bg-pattern { position: absolute; right: 0; top: 0; width: 55%; height: 100%; background: radial-gradient(circle at center, rgba(255, 215, 0, 0.03) 0%, transparent 70%); pointer-events: none; }
  .diagonal-accent { position: absolute; right: -80px; top: -80px; width: 600px; height: 600px; background: linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, transparent 50%); transform: rotate(45deg); pointer-events: none; }
  .cert-id { position: absolute; top: 40px; right: 60px; font-family: 'Oswald', sans-serif; font-size: 0.9rem; font-weight: 600; color: #000; background: #ffd700; padding: 9px 22px; letter-spacing: 0.06rem; box-shadow: 0 4px 18px rgba(255, 215, 0, 0.4); z-index: 20; }
  .content { position: relative; margin-left: 130px; padding: 80px 70px 60px 60px; max-width: calc(297mm - 150px); z-index: 5; }
  .logo-section { display: flex; align-items: center; gap: 16px; margin-bottom: 30px; }
  .logo-icon { width: 55px; height: 55px; background: #ffd700; display: flex; align-items: center; justify-content: center; border-radius: 7px; box-shadow: 0 3px 13px rgba(255, 215, 0, 0.3); }
  .logo-icon i { font-size: 28px; color: #000; }
  .logo-text { font-family: 'Oswald', sans-serif; font-size: 1.9rem; font-weight: 700; letter-spacing: 0.12rem; text-transform: uppercase; color: #fff; }
  .cert-title-group { margin-bottom: 30px; }
  .cert-label { font-family: 'Oswald', sans-serif; font-size: 5.5rem; font-weight: 700; line-height: 0.9; text-transform: uppercase; color: transparent; -webkit-text-stroke: 2.5px #ffd700; text-stroke: 2.5px #ffd700; letter-spacing: 0.09rem; margin-bottom: 12px; }
  .cert-subtitle { font-family: 'Oswald', sans-serif; font-size: 1.6rem; font-weight: 400; letter-spacing: 0.18rem; text-transform: uppercase; color: #ddd; display: flex; align-items: center; gap: 15px; }
  .cert-subtitle::before, .cert-subtitle::after { content: ''; width: 60px; height: 2.5px; background: #ffd700; }
  .certifies-label { font-family: 'Roboto', sans-serif; font-size: 0.85rem; font-weight: 500; letter-spacing: 0.25rem; text-transform: uppercase; color: #999; margin-bottom: 20px; }
  .student-name { font-family: 'Oswald', sans-serif; font-size: 3.8rem; font-weight: 700; color: #ffd700; text-transform: uppercase; letter-spacing: 0.09rem; margin-bottom: 28px; text-shadow: 2.5px 2.5px 0 rgba(0, 0, 0, 0.5); }
  .description { font-family: 'Roboto', sans-serif; font-size: 1.1rem; line-height: 1.8; color: #ccc; max-width: 100%; margin-bottom: 45px; }
  .footer-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 55px; padding-top: 35px; border-top: 2px solid rgba(255, 215, 0, 0.3); }
  .footer-item { text-align: center; }
  .footer-label { font-family: 'Oswald', sans-serif; font-size: 0.8rem; font-weight: 600; letter-spacing: 0.12rem; text-transform: uppercase; color: #ffd700; margin-bottom: 12px; }
  .footer-value { font-family: 'Roboto', sans-serif; font-size: 1.1rem; font-weight: 500; color: #fff; margin-bottom: 9px; }
  .signature-section { margin-top: 12px; }
  .signature-image { width: 120px; height: auto; max-height: 50px; margin: 0 auto 6px; object-fit: contain; display: block; }
  .signature-line { width: 180px; height: 2px; background: rgba(255, 215, 0, 0.5); margin: 0 auto 10px; }
  .signature-name { font-family: 'Roboto', sans-serif; font-size: 1.15rem; font-weight: 600; color: #fff; margin-bottom: 4px; font-style: italic; }
  .signature-title { font-family: 'Roboto', sans-serif; font-size: 0.85rem; font-weight: 400; color: #999; text-align: center; }
  .download-btn { position: fixed; top: 25px; right: 25px; padding: 14px 28px; background: linear-gradient(135deg, #ffd700 0%, #f4c430 100%); color: #000; font-family: 'Oswald', sans-serif; font-size: 1rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.09rem; border: none; border-radius: 7px; cursor: pointer; box-shadow: 0 5px 22px rgba(255, 215, 0, 0.4); transition: all 0.3s ease; z-index: 1000; }
  .download-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(255, 215, 0, 0.6); }
  .download-btn i { margin-right: 10px; }
  .share-buttons { position: fixed; top: 90px; right: 25px; display: flex; flex-direction: column; gap: 10px; z-index: 1000; }
  .share-btn { width: 48px; height: 48px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; transition: all 0.3s ease; box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3); }
  .share-btn:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4); }
  .share-btn.linkedin { background: #0077b5; color: white; }
  .share-btn.whatsapp { background: #25D366; color: white; }
  .share-btn.facebook { background: #1877f2; color: white; }
  .share-btn.instagram { background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); color: white; }
  .share-btn.twitter { background: #1DA1F2; color: white; }
  .share-tooltip { position: absolute; right: 60px; top: 50%; transform: translateY(-50%); background: rgba(0, 0, 0, 0.9); color: white; padding: 8px 12px; border-radius: 6px; font-size: 0.85rem; font-family: 'Roboto', sans-serif; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
  .share-btn:hover .share-tooltip { opacity: 1; }
</style>
</head>
<body>
  <button class="download-btn no-print" onclick="downloadAsPDF()">
    <i class="fas fa-download"></i> Download PDF
  </button>
  <div class="share-buttons no-print">
    <button class="share-btn linkedin" onclick="shareOnLinkedIn()" title="Share on LinkedIn">
      <i class="fab fa-linkedin-in"></i>
      <span class="share-tooltip">Share on LinkedIn</span>
    </button>
    <button class="share-btn whatsapp" onclick="shareOnWhatsApp()" title="Share on WhatsApp">
      <i class="fab fa-whatsapp"></i>
      <span class="share-tooltip">Share on WhatsApp</span>
    </button>
    <button class="share-btn facebook" onclick="shareOnFacebook()" title="Share on Facebook">
      <i class="fab fa-facebook-f"></i>
      <span class="share-tooltip">Share on Facebook</span>
    </button>
    <button class="share-btn twitter" onclick="shareOnTwitter()" title="Share on Twitter">
      <i class="fab fa-twitter"></i>
      <span class="share-tooltip">Share on Twitter</span>
    </button>
    <button class="share-btn instagram" onclick="shareOnInstagram()" title="Share on Instagram">
      <i class="fab fa-instagram"></i>
      <span class="share-tooltip">Share on Instagram</span>
    </button>
  </div>
  <div class="certificate-container">
    <div class="yellow-bar"><div class="vertical-text">PASSIONBOTS // FUTURE TECH</div></div>
    <div class="bg-pattern"></div>
    <div class="diagonal-accent"></div>
    <div class="cert-id">ID: ${certificateCode}</div>
    <div class="content">
      <div class="logo-section">
        <div class="logo-icon"><i class="fas fa-robot"></i></div>
        <div class="logo-text">PASSIONBOTS</div>
      </div>
      <div class="cert-title-group">
        <div class="cert-label">CERTIFICATE</div>
        <div class="cert-subtitle">OF ${certTypeUpper} // ${courseShort}</div>
      </div>
      <div class="certifies-label">THIS CERTIFIES THAT</div>
      <div class="student-name">${studentName}</div>
      <div class="description">${description}</div>
      <div class="footer-grid">
        <div class="footer-item">
          <div class="footer-label">DATE ISSUED</div>
          <div class="footer-value">${issueDate}</div>
        </div>
        <div class="footer-item">
          <div class="footer-label">FOUNDER SIGNATURE</div>
          <div class="signature-section">
            <img src="/static/signature-real.png" alt="Signature" class="signature-image" />
            <div class="signature-title">CEO, PASSIONBOTS</div>
          </div>
        </div>
        <div class="footer-item">
          <div class="footer-label">VERIFY AT</div>
          <div class="footer-value">passionbots.co.in</div>
        </div>
      </div>
    </div>
  </div>
  <script>
    function adjustScale() {
      const container = document.querySelector('.certificate-container');
      const windowWidth = window.innerWidth - 40;
      const windowHeight = window.innerHeight - 40;
      const a4Width = 297 * 3.7795275591; // 297mm to px (landscape width)
      const a4Height = 210 * 3.7795275591; // 210mm to px (landscape height)
      const scaleX = windowWidth / a4Width;
      const scaleY = windowHeight / a4Height;
      const scale = Math.min(scaleX, scaleY, 1);
      if (scale < 1) {
        container.style.transform = \`scale(\${scale})\`;
        container.style.transformOrigin = 'top center';
      }
    }
    adjustScale();
    window.addEventListener('resize', adjustScale);

    // Direct PDF download using html2canvas + jsPDF (A4 landscape format)
    async function downloadAsPDF() {
      try {
        const btn = document.querySelector('.download-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
        
        const container = document.querySelector('.certificate-container');
        
        // A4 dimensions in pixels at 96 DPI (landscape)
        const a4WidthPx = 1123; // 297mm (landscape width)
        const a4HeightPx = 794;  // 210mm (landscape height)
        
        // Generate canvas from HTML
        const canvas = await html2canvas(container, {
          width: a4WidthPx,
          height: a4HeightPx,
          scale: 2,
          backgroundColor: '#000000',
          logging: false,
          useCORS: true
        });
        
        // Create PDF (A4 landscape)
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });
        
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
        
        // Download
        const fileName = '${studentName.replace(/[^a-zA-Z0-9]/g, '_')}_PassionBots_Certificate.pdf';
        pdf.save(fileName);
        
        // Reset button
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-download"></i> Download PDF';
      } catch (error) {
        console.error('Download error:', error);
        alert('Download failed. Please try the print method (Ctrl+P or Cmd+P).');
        const btn = document.querySelector('.download-btn');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-download"></i> Download PDF';
      }
    }

    // Social Sharing Functions
    const certificateUrl = window.location.href;
    const verifyUrl = certificateUrl.replace('/api/certificates/', '/verify/').replace('/view', '/${certificateCode}');
    const shareMessage = '🎓 I\'m excited to share that I\'ve completed the ${courseName} from PassionBots! 🤖\\n\\nVerify my certificate: ' + verifyUrl + '\\n\\n#PassionBots #IoT #Robotics #Certificate #Achievement';
    const shareTitle = 'Certificate of ${certTypeUpper} - ${courseName}';
    
    function shareOnLinkedIn() {
      const url = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(verifyUrl);
      window.open(url, '_blank', 'width=600,height=600');
    }
    
    function shareOnWhatsApp() {
      const message = encodeURIComponent(shareMessage);
      const url = 'https://wa.me/?text=' + message;
      window.open(url, '_blank');
    }
    
    function shareOnFacebook() {
      const url = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(verifyUrl) + '&quote=' + encodeURIComponent(shareMessage);
      window.open(url, '_blank', 'width=600,height=600');
    }
    
    function shareOnTwitter() {
      const text = encodeURIComponent('🎓 Just completed ${courseName} from @PassionBots! 🤖\\n\\nVerify: ' + verifyUrl + '\\n\\n#PassionBots #IoT #Robotics');
      const url = 'https://twitter.com/intent/tweet?text=' + text;
      window.open(url, '_blank', 'width=600,height=600');
    }
    
    function shareOnInstagram() {
      // Instagram doesn't support direct web sharing, so we'll copy the message
      const message = '🎓 I completed the ${courseName} from PassionBots! 🤖\\n\\nVerify my certificate at: ' + verifyUrl + '\\n\\n#PassionBots #IoT #Robotics #Certificate';
      
      if (navigator.clipboard) {
        navigator.clipboard.writeText(message).then(() => {
          alert('📋 Caption copied to clipboard!\\n\\nOpen Instagram and paste this caption with your certificate screenshot.\\n\\nTip: Take a screenshot of this certificate to post on Instagram.');
        }).catch(() => {
          prompt('Copy this message for Instagram:', message);
        });
      } else {
        prompt('Copy this message for Instagram:', message);
      }
    }
  </script>
</body>
</html>`
}

// ============================================================================
// IOT & ROBOTICS REGISTRATION PORTAL ROUTES
// ============================================================================

// Student Registration Page
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
// Student Dashboard Route - Comprehensive with Live Classes
app.get('/dashboard', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Dashboard - IoT & Robotics | PassionBots</title>
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
        .class-card {
            transition: all 0.3s ease;
        }
        .class-card:hover {
            transform: translateY(-5px);
            border-color: #FFD700;
        }
    </style>
</head>
<body class="text-white">
    <!-- Header -->
    <nav class="bg-black bg-opacity-80 backdrop-filter backdrop-blur-md border-b border-yellow-500 border-opacity-30 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-20">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-robot text-yellow-400 text-3xl"></i>
                    <span class="text-2xl font-bold gradient-text">PassionBots</span>
                </div>
                <div class="flex items-center space-x-6">
                    <span class="text-gray-300" id="studentName"></span>
                    <button onclick="logout()" class="text-gray-300 hover:text-yellow-400 transition">
                        <i class="fas fa-sign-out-alt mr-2"></i>Logout
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 py-8">
        <!-- Welcome Section -->
        <div class="mb-8">
            <h1 class="text-4xl font-bold gradient-text mb-2">Welcome to Your Dashboard</h1>
            <p class="text-gray-400" id="welcomeMessage">Loading your course information...</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid md:grid-cols-4 gap-6 mb-8">
            <div class="card p-6 rounded-xl">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-400 text-sm mb-1">Total Classes</p>
                        <p class="text-3xl font-bold text-yellow-400" id="totalClasses">0</p>
                    </div>
                    <i class="fas fa-video text-yellow-400 text-3xl opacity-50"></i>
                </div>
            </div>
            <div class="card p-6 rounded-xl">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-400 text-sm mb-1">Attended</p>
                        <p class="text-3xl font-bold text-green-400" id="attendedClasses">0</p>
                    </div>
                    <i class="fas fa-check-circle text-green-400 text-3xl opacity-50"></i>
                </div>
            </div>
            <div class="card p-6 rounded-xl">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-400 text-sm mb-1">Upcoming</p>
                        <p class="text-3xl font-bold text-blue-400" id="upcomingClasses">0</p>
                    </div>
                    <i class="fas fa-calendar text-blue-400 text-3xl opacity-50"></i>
                </div>
            </div>
            <div class="card p-6 rounded-xl">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-400 text-sm mb-1">Progress</p>
                        <p class="text-3xl font-bold text-purple-400" id="progressPercent">0%</p>
                    </div>
                    <i class="fas fa-chart-line text-purple-400 text-3xl opacity-50"></i>
                </div>
            </div>
        </div>

        <!-- Tabs -->
        <div class="mb-6">
            <div class="flex space-x-4 border-b border-gray-700">
                <button onclick="switchTab('schedule')" id="tab-schedule" 
                        class="px-6 py-3 font-semibold border-b-2 border-yellow-400 text-yellow-400">
                    <i class="fas fa-calendar-alt mr-2"></i>Live Classes
                </button>
                <button onclick="switchTab('modules')" id="tab-modules" 
                        class="px-6 py-3 font-semibold border-b-2 border-transparent text-gray-400 hover:text-yellow-400">
                    <i class="fas fa-book mr-2"></i>Course Modules
                </button>
                <button onclick="switchTab('progress')" id="tab-progress" 
                        class="px-6 py-3 font-semibold border-b-2 border-transparent text-gray-400 hover:text-yellow-400">
                    <i class="fas fa-chart-bar mr-2"></i>My Progress
                </button>
            </div>
        </div>

        <!-- Schedule Tab -->
        <div id="content-schedule" class="space-y-6">
            <div class="card p-6 rounded-xl">
                <h2 class="text-2xl font-bold gradient-text mb-6">
                    <i class="fas fa-video mr-3"></i>Upcoming Live Classes
                </h2>
                <div id="upcomingClassesList" class="space-y-4">
                    <!-- Classes will be loaded here -->
                </div>
            </div>

            <div class="card p-6 rounded-xl">
                <h2 class="text-2xl font-bold text-gray-300 mb-6">
                    <i class="fas fa-history mr-3"></i>Past Classes
                </h2>
                <div id="pastClassesList" class="space-y-4">
                    <!-- Past classes will be loaded here -->
                </div>
            </div>
        </div>

        <!-- Modules Tab -->
        <div id="content-modules" class="hidden">
            <div class="grid md:grid-cols-2 gap-6" id="modulesList">
                <!-- Modules will be loaded here -->
            </div>
        </div>

        <!-- Progress Tab -->
        <div id="content-progress" class="hidden">
            <div class="card p-6 rounded-xl">
                <h2 class="text-2xl font-bold gradient-text mb-6">
                    <i class="fas fa-trophy mr-3"></i>Your Learning Journey
                </h2>
                <div id="progressContent">
                    <!-- Progress will be loaded here -->
                </div>
            </div>
        </div>
    </div>

    <script>
        let studentData = null;

        // Check login
        function checkLogin() {
            const data = localStorage.getItem('student_data');
            if (!data) {
                window.location.href = '/student-portal';
                return null;
            }
            return JSON.parse(data);
        }

        function logout() {
            localStorage.removeItem('student_data');
            window.location.href = '/student-portal';
        }

        function switchTab(tab) {
            // Hide all tabs
            document.getElementById('content-schedule').classList.add('hidden');
            document.getElementById('content-modules').classList.add('hidden');
            document.getElementById('content-progress').classList.add('hidden');
            
            // Show selected tab
            document.getElementById('content-' + tab).classList.remove('hidden');
            
            // Update tab buttons
            document.getElementById('tab-schedule').classList.remove('border-yellow-400', 'text-yellow-400');
            document.getElementById('tab-modules').classList.remove('border-yellow-400', 'text-yellow-400');
            document.getElementById('tab-progress').classList.remove('border-yellow-400', 'text-yellow-400');
            
            document.getElementById('tab-schedule').classList.add('border-transparent', 'text-gray-400');
            document.getElementById('tab-modules').classList.add('border-transparent', 'text-gray-400');
            document.getElementById('tab-progress').classList.add('border-transparent', 'text-gray-400');
            
            document.getElementById('tab-' + tab).classList.remove('border-transparent', 'text-gray-400');
            document.getElementById('tab-' + tab).classList.add('border-yellow-400', 'text-yellow-400');
        }

        // Load dashboard data
        async function loadDashboard() {
            studentData = checkLogin();
            if (!studentData) return;

            document.getElementById('studentName').textContent = studentData.full_name;
            document.getElementById('welcomeMessage').textContent = 
                \`Registered on \${new Date(studentData.registration_date).toLocaleDateString()}\`;

            // Load classes
            await loadClasses();
            
            // Load modules
            await loadModules();
            
            // Load progress
            await loadProgress();
        }

        async function loadClasses() {
            try {
                const response = await fetch('/api/live-classes');
                const data = await response.json();
                
                const now = new Date();
                const upcoming = data.classes.filter(c => new Date(c.class_date + ' ' + c.class_time) > now);
                const past = data.classes.filter(c => new Date(c.class_date + ' ' + c.class_time) <= now);
                
                document.getElementById('totalClasses').textContent = data.classes.length;
                document.getElementById('upcomingClasses').textContent = upcoming.length;
                
                // Render upcoming classes
                const upcomingHTML = upcoming.length > 0 ? upcoming.map(cls => \`
                    <div class="class-card card p-6 rounded-lg">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <h3 class="text-xl font-bold text-yellow-400 mb-2">\${cls.class_title}</h3>
                                <p class="text-gray-400 mb-3">\${cls.class_description || 'Live interactive session'}</p>
                                <div class="flex flex-wrap gap-4 text-sm mb-4">
                                    <span class="text-gray-300">
                                        <i class="fas fa-calendar mr-2 text-yellow-400"></i>
                                        \${new Date(cls.class_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                    <span class="text-gray-300">
                                        <i class="fas fa-clock mr-2 text-yellow-400"></i>
                                        \${cls.class_time} (\${cls.duration_minutes} mins)
                                    </span>
                                    <span class="text-gray-300">
                                        <i class="fas fa-user mr-2 text-yellow-400"></i>
                                        \${cls.instructor_name}
                                    </span>
                                </div>
                                <a href="\${cls.zoom_join_url}" target="_blank" 
                                   class="btn-yellow inline-block text-black font-bold py-2 px-6 rounded-lg">
                                    <i class="fas fa-video mr-2"></i>Join on Zoom
                                </a>
                            </div>
                            <div class="ml-4">
                                <span class="inline-block px-3 py-1 bg-green-500 bg-opacity-20 text-green-400 rounded-full text-sm">
                                    Scheduled
                                </span>
                            </div>
                        </div>
                    </div>
                \`).join('') : '<p class="text-gray-400 text-center py-8">No upcoming classes scheduled yet</p>';
                
                document.getElementById('upcomingClassesList').innerHTML = upcomingHTML;
                
                // Render past classes
                const pastHTML = past.length > 0 ? past.slice(0, 5).map(cls => \`
                    <div class="class-card card p-4 rounded-lg">
                        <div class="flex items-center justify-between">
                            <div class="flex-1">
                                <h4 class="font-bold text-gray-300">\${cls.class_title}</h4>
                                <p class="text-sm text-gray-500">\${new Date(cls.class_date).toLocaleDateString()} - \${cls.instructor_name}</p>
                            </div>
                            \${cls.recording_url ? \`
                            <a href="\${cls.recording_url}" target="_blank" 
                               class="text-yellow-400 hover:text-yellow-300">
                                <i class="fas fa-play-circle mr-2"></i>Recording
                            </a>
                            \` : '<span class="text-gray-500 text-sm">No recording</span>'}
                        </div>
                    </div>
                \`).join('') : '<p class="text-gray-400 text-center py-8">No past classes yet</p>';
                
                document.getElementById('pastClassesList').innerHTML = pastHTML;
            } catch (error) {
                console.error('Error loading classes:', error);
            }
        }

        async function loadModules() {
            try {
                const response = await fetch('/api/course-modules');
                const data = await response.json();
                
                const modulesHTML = data.modules.map((mod, index) => \`
                    <div class="card p-6 rounded-xl">
                        <div class="flex items-start justify-between mb-4">
                            <div class="flex items-center">
                                <div class="w-12 h-12 bg-yellow-400 bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                                    <span class="text-xl font-bold text-yellow-400">\${mod.module_number}</span>
                                </div>
                                <div>
                                    <h3 class="text-xl font-bold text-yellow-400">\${mod.module_title}</h3>
                                    <p class="text-sm text-gray-400">\${mod.duration_weeks} week\${mod.duration_weeks > 1 ? 's' : ''}</p>
                                </div>
                            </div>
                        </div>
                        <p class="text-gray-400 mb-4">\${mod.module_description}</p>
                        <div class="space-y-2">
                            \${JSON.parse(mod.topics).map(topic => \`
                                <div class="flex items-center text-sm text-gray-300">
                                    <i class="fas fa-check-circle text-yellow-400 mr-2"></i>
                                    \${topic}
                                </div>
                            \`).join('')}
                        </div>
                    </div>
                \`).join('');
                
                document.getElementById('modulesList').innerHTML = modulesHTML;
            } catch (error) {
                console.error('Error loading modules:', error);
            }
        }

        async function loadProgress() {
            const progressHTML = \`
                <div class="space-y-6">
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-gray-300 font-semibold">Overall Progress</span>
                            <span class="text-yellow-400 font-bold">0%</span>
                        </div>
                        <div class="w-full bg-gray-700 rounded-full h-4">
                            <div class="bg-gradient-to-r from-yellow-400 to-yellow-600 h-4 rounded-full" style="width: 0%"></div>
                        </div>
                    </div>
                    <p class="text-gray-400 text-center py-8">
                        <i class="fas fa-info-circle mr-2"></i>
                        Your progress will be updated as you attend classes and complete modules
                    </p>
                </div>
            \`;
            
            document.getElementById('progressContent').innerHTML = progressHTML;
        }

        // Initialize
        loadDashboard();
    </script>
</body>
</html>
  `)
})

// API: Get Live Classes
app.get('/api/live-classes', async (c) => {
  try {
    const { env } = c
    
    const classes = await env.DB.prepare(`
      SELECT * FROM live_classes 
      WHERE course_type = 'iot_robotics' 
      ORDER BY class_date DESC, class_time DESC
    `).all()

    return c.json({
      success: true,
      classes: classes.results || []
    })
  } catch (error) {
    console.error('Error fetching classes:', error)
    return c.json({ error: 'Failed to fetch classes' }, 500)
  }
})

// API: Get Course Modules
app.get('/api/course-modules', async (c) => {
  try {
    const { env } = c
    
    const modules = await env.DB.prepare(`
      SELECT * FROM course_modules 
      WHERE course_type = 'iot_robotics' AND status = 'active'
      ORDER BY module_number ASC
    `).all()

    return c.json({
      success: true,
      modules: modules.results || []
    })
  } catch (error) {
    console.error('Error fetching modules:', error)
    return c.json({ error: 'Failed to fetch modules' }, 500)
  }
})
// ============================================================================
// ADMIN DASHBOARD ROUTES - IoT & Robotics Portal
// ============================================================================

// Admin Login Page
app.get('/admin-portal', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Portal - IoT & Robotics | PassionBots</title>
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
                    <span class="text-2xl font-bold gradient-text">PassionBots Admin</span>
                </div>
                <div class="flex items-center space-x-6">
                    <a href="/" class="text-gray-300 hover:text-yellow-400 transition"><i class="fas fa-home mr-2"></i>Home</a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Login Form -->
    <div class="max-w-md mx-auto px-4 py-12">
        <div class="card rounded-2xl p-8">
            <div class="text-center mb-8">
                <div class="inline-block p-4 bg-yellow-400 bg-opacity-10 rounded-full mb-4">
                    <i class="fas fa-shield-alt text-yellow-400 text-5xl"></i>
                </div>
                <h1 class="text-3xl font-bold gradient-text mb-2">Admin Portal</h1>
                <p class="text-gray-400">Manage IoT & Robotics Course</p>
            </div>

            <form id="adminLoginForm" class="space-y-6">
                <div>
                    <label class="block text-yellow-400 font-semibold mb-2">
                        <i class="fas fa-user mr-2"></i>Username
                    </label>
                    <input type="text" name="username" required 
                           class="input-field w-full px-4 py-3 rounded-lg"
                           placeholder="Enter admin username">
                </div>

                <div>
                    <label class="block text-yellow-400 font-semibold mb-2">
                        <i class="fas fa-lock mr-2"></i>Password
                    </label>
                    <input type="password" name="password" required 
                           class="input-field w-full px-4 py-3 rounded-lg"
                           placeholder="Enter admin password">
                </div>

                <button type="submit" class="btn-yellow w-full text-black font-bold py-3 px-6 rounded-lg">
                    <i class="fas fa-sign-in-alt mr-2"></i>Login to Admin Dashboard
                </button>
            </form>

            <div id="message" class="mt-6 p-4 rounded-lg hidden"></div>

            <div class="mt-6 text-center text-sm text-gray-500">
                <p>Default credentials: admin / admin123</p>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            const messageDiv = document.getElementById('message');
            messageDiv.classList.remove('hidden', 'bg-green-500', 'bg-red-500');
            messageDiv.textContent = 'Logging in...';
            messageDiv.classList.add('bg-blue-500');
            
            try {
                const response = await fetch('/api/admin-login-iot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('admin_token', result.token);
                    localStorage.setItem('admin_data', JSON.stringify(result.admin));
                    window.location.href = '/admin-dashboard-iot';
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

// API: Admin Login (IoT Portal)
app.post('/api/admin-login-iot', async (c) => {
  try {
    const { username, password } = await c.req.json()

    // Simple admin check (in production, use proper authentication)
    if (username === 'admin' && password === 'admin123') {
      const token = 'admin_' + Date.now() + '_' + Math.random().toString(36).substring(7)
      
      return c.json({
        success: true,
        message: 'Login successful',
        token,
        admin: {
          username: 'admin',
          role: 'super_admin',
          name: 'Admin User'
        }
      })
    } else {
      return c.json({ error: 'Invalid credentials' }, 401)
    }
  } catch (error) {
    console.error('Admin login error:', error)
    return c.json({ error: 'Login failed' }, 500)
  }
})

// Admin Dashboard - Main Page
app.get('/admin-dashboard-iot', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - IoT & Robotics | PassionBots</title>
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
        .sidebar-link {
            transition: all 0.3s ease;
        }
        .sidebar-link:hover, .sidebar-link.active {
            background: rgba(255, 215, 0, 0.1);
            border-left: 4px solid #FFD700;
            padding-left: 1.5rem;
        }
        .modal {
            display: none;
        }
        .modal.active {
            display: flex;
        }
    </style>
</head>
<body class="text-white">
    <!-- Header -->
    <nav class="bg-black bg-opacity-80 backdrop-blur-md border-b border-yellow-500 border-opacity-30 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-20">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-robot text-yellow-400 text-3xl"></i>
                    <span class="text-2xl font-bold gradient-text">PassionBots Admin</span>
                </div>
                <div class="flex items-center space-x-6">
                    <span class="text-gray-300" id="adminName"></span>
                    <button onclick="logout()" class="text-gray-300 hover:text-yellow-400 transition">
                        <i class="fas fa-sign-out-alt mr-2"></i>Logout
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <div class="flex">
        <!-- Sidebar -->
        <div class="w-64 min-h-screen bg-black bg-opacity-50 border-r border-yellow-500 border-opacity-20 p-4">
            <div class="space-y-2">
                <button onclick="switchSection('overview')" id="nav-overview"
                        class="sidebar-link active w-full text-left px-4 py-3 rounded-lg text-gray-300">
                    <i class="fas fa-chart-line mr-3 text-yellow-400"></i>Overview
                </button>
                <button onclick="switchSection('students')" id="nav-students"
                        class="sidebar-link w-full text-left px-4 py-3 rounded-lg text-gray-300">
                    <i class="fas fa-users mr-3 text-yellow-400"></i>Students
                </button>
                <button onclick="switchSection('classes')" id="nav-classes"
                        class="sidebar-link w-full text-left px-4 py-3 rounded-lg text-gray-300">
                    <i class="fas fa-video mr-3 text-yellow-400"></i>Live Classes
                </button>
                <button onclick="switchSection('modules')" id="nav-modules"
                        class="sidebar-link w-full text-left px-4 py-3 rounded-lg text-gray-300">
                    <i class="fas fa-book mr-3 text-yellow-400"></i>Modules
                </button>
                <button onclick="switchSection('analytics')" id="nav-analytics"
                        class="sidebar-link w-full text-left px-4 py-3 rounded-lg text-gray-300">
                    <i class="fas fa-chart-bar mr-3 text-yellow-400"></i>Analytics
                </button>
            </div>
        </div>

        <!-- Main Content -->
        <div class="flex-1 p-8">
            <!-- Overview Section -->
            <div id="section-overview" class="section-content">
                <h1 class="text-4xl font-bold gradient-text mb-8">Dashboard Overview</h1>
                
                <!-- Stats Cards -->
                <div class="grid md:grid-cols-4 gap-6 mb-8">
                    <div class="card p-6 rounded-xl">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-400 text-sm mb-1">Total Students</p>
                                <p class="text-3xl font-bold text-yellow-400" id="totalStudents">0</p>
                            </div>
                            <i class="fas fa-users text-yellow-400 text-3xl opacity-50"></i>
                        </div>
                    </div>
                    <div class="card p-6 rounded-xl">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-400 text-sm mb-1">Live Classes</p>
                                <p class="text-3xl font-bold text-green-400" id="totalClasses">0</p>
                            </div>
                            <i class="fas fa-video text-green-400 text-3xl opacity-50"></i>
                        </div>
                    </div>
                    <div class="card p-6 rounded-xl">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-400 text-sm mb-1">Upcoming</p>
                                <p class="text-3xl font-bold text-blue-400" id="upcomingClasses">0</p>
                            </div>
                            <i class="fas fa-calendar text-blue-400 text-3xl opacity-50"></i>
                        </div>
                    </div>
                    <div class="card p-6 rounded-xl">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-400 text-sm mb-1">Avg Attendance</p>
                                <p class="text-3xl font-bold text-purple-400" id="avgAttendance">0%</p>
                            </div>
                            <i class="fas fa-chart-pie text-purple-400 text-3xl opacity-50"></i>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="card p-6 rounded-xl">
                    <h2 class="text-2xl font-bold gradient-text mb-6">Recent Activity</h2>
                    <div id="recentActivity" class="space-y-3">
                        <!-- Activity items will be loaded here -->
                    </div>
                </div>
            </div>

            <!-- Students Section -->
            <div id="section-students" class="section-content hidden">
                <div class="flex items-center justify-between mb-8">
                    <h1 class="text-4xl font-bold gradient-text">Student Management</h1>
                    <button onclick="exportStudents()" class="btn-yellow text-black font-bold py-2 px-6 rounded-lg">
                        <i class="fas fa-download mr-2"></i>Export CSV
                    </button>
                </div>

                <!-- Students Table -->
                <div class="card p-6 rounded-xl">
                    <div class="overflow-x-auto">
                        <table class="w-full" id="studentsTable">
                            <thead>
                                <tr class="border-b border-gray-700">
                                    <th class="text-left py-3 px-4 text-yellow-400">ID</th>
                                    <th class="text-left py-3 px-4 text-yellow-400">Name</th>
                                    <th class="text-left py-3 px-4 text-yellow-400">Email</th>
                                    <th class="text-left py-3 px-4 text-yellow-400">Mobile</th>
                                    <th class="text-left py-3 px-4 text-yellow-400">College</th>
                                    <th class="text-left py-3 px-4 text-yellow-400">Status</th>
                                    <th class="text-left py-3 px-4 text-yellow-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="studentsTableBody">
                                <!-- Students will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Classes Section -->
            <div id="section-classes" class="section-content hidden">
                <div class="flex items-center justify-between mb-8">
                    <h1 class="text-4xl font-bold gradient-text">Live Classes Management</h1>
                    <button onclick="openAddClassModal()" class="btn-yellow text-black font-bold py-2 px-6 rounded-lg">
                        <i class="fas fa-plus mr-2"></i>Add New Class
                    </button>
                </div>

                <div class="space-y-6" id="classesList">
                    <!-- Classes will be loaded here -->
                </div>
            </div>

            <!-- Modules Section -->
            <div id="section-modules" class="section-content hidden">
                <h1 class="text-4xl font-bold gradient-text mb-8">Course Modules</h1>
                
                <div class="grid md:grid-cols-2 gap-6" id="modulesList">
                    <!-- Modules will be loaded here -->
                </div>
            </div>

            <!-- Analytics Section -->
            <div id="section-analytics" class="section-content hidden">
                <h1 class="text-4xl font-bold gradient-text mb-8">Analytics & Reports</h1>
                
                <div class="card p-6 rounded-xl">
                    <h2 class="text-2xl font-bold text-gray-300 mb-6">Registration Trends</h2>
                    <p class="text-gray-400 text-center py-12">
                        <i class="fas fa-chart-line text-5xl mb-4 block opacity-50"></i>
                        Analytics dashboard coming soon
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- Add Class Modal -->
    <div id="addClassModal" class="modal fixed inset-0 bg-black bg-opacity-75 items-center justify-center z-50">
        <div class="card max-w-2xl w-full m-4 p-8 rounded-xl max-h-screen overflow-y-auto">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold gradient-text">Add New Live Class</h2>
                <button onclick="closeAddClassModal()" class="text-gray-400 hover:text-white">
                    <i class="fas fa-times text-2xl"></i>
                </button>
            </div>

            <form id="addClassForm" class="space-y-4">
                <div class="grid md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-yellow-400 font-semibold mb-2">Class Title *</label>
                        <input type="text" name="class_title" required 
                               class="input-field w-full px-4 py-2 rounded-lg"
                               placeholder="e.g., Introduction to IoT">
                    </div>
                    <div>
                        <label class="block text-yellow-400 font-semibold mb-2">Instructor Name *</label>
                        <input type="text" name="instructor_name" required 
                               class="input-field w-full px-4 py-2 rounded-lg"
                               placeholder="e.g., Dr. Rajesh Kumar">
                    </div>
                </div>

                <div>
                    <label class="block text-yellow-400 font-semibold mb-2">Description</label>
                    <textarea name="class_description" rows="3"
                              class="input-field w-full px-4 py-2 rounded-lg"
                              placeholder="Brief description of the class"></textarea>
                </div>

                <div class="grid md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-yellow-400 font-semibold mb-2">Date *</label>
                        <input type="date" name="class_date" required 
                               class="input-field w-full px-4 py-2 rounded-lg">
                    </div>
                    <div>
                        <label class="block text-yellow-400 font-semibold mb-2">Time *</label>
                        <input type="time" name="class_time" required 
                               class="input-field w-full px-4 py-2 rounded-lg">
                    </div>
                    <div>
                        <label class="block text-yellow-400 font-semibold mb-2">Duration (mins) *</label>
                        <input type="number" name="duration_minutes" required 
                               class="input-field w-full px-4 py-2 rounded-lg"
                               placeholder="60" value="60">
                    </div>
                </div>

                <div class="grid md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-yellow-400 font-semibold mb-2">Zoom Meeting ID *</label>
                        <input type="text" name="zoom_meeting_id" required 
                               class="input-field w-full px-4 py-2 rounded-lg"
                               placeholder="123456789">
                    </div>
                    <div>
                        <label class="block text-yellow-400 font-semibold mb-2">Zoom Password</label>
                        <input type="text" name="zoom_meeting_password"
                               class="input-field w-full px-4 py-2 rounded-lg"
                               placeholder="pass123">
                    </div>
                </div>

                <div>
                    <label class="block text-yellow-400 font-semibold mb-2">Zoom Join URL *</label>
                    <input type="url" name="zoom_join_url" required 
                           class="input-field w-full px-4 py-2 rounded-lg"
                           placeholder="https://zoom.us/j/123456789">
                </div>

                <div class="flex items-center space-x-4 pt-4">
                    <button type="submit" class="btn-yellow flex-1 text-black font-bold py-3 px-6 rounded-lg">
                        <i class="fas fa-plus mr-2"></i>Add Class
                    </button>
                    <button type="button" onclick="closeAddClassModal()" 
                            class="flex-1 bg-gray-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-600">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>

    <script>
        let adminData = null;

        // Check admin login
        function checkAdmin() {
            const token = localStorage.getItem('admin_token');
            const data = localStorage.getItem('admin_data');
            if (!token || !data) {
                window.location.href = '/admin-portal';
                return null;
            }
            return JSON.parse(data);
        }

        function logout() {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_data');
            window.location.href = '/admin-portal';
        }

        function switchSection(section) {
            // Hide all sections
            document.querySelectorAll('.section-content').forEach(el => el.classList.add('hidden'));
            
            // Remove active class from all nav items
            document.querySelectorAll('.sidebar-link').forEach(el => el.classList.remove('active'));
            
            // Show selected section
            document.getElementById('section-' + section).classList.remove('hidden');
            document.getElementById('nav-' + section).classList.add('active');
            
            // Load data for that section
            if (section === 'students') loadStudents();
            if (section === 'classes') loadClasses();
            if (section === 'modules') loadModules();
        }

        async function loadDashboard() {
            adminData = checkAdmin();
            if (!adminData) return;

            document.getElementById('adminName').textContent = adminData.name;

            // Load overview stats
            await loadOverviewStats();
        }

        async function loadOverviewStats() {
            try {
                // Load students count
                const studentsRes = await fetch('/api/admin/students-list');
                const studentsData = await studentsRes.json();
                document.getElementById('totalStudents').textContent = studentsData.students?.length || 0;

                // Load classes count
                const classesRes = await fetch('/api/live-classes');
                const classesData = await classesRes.json();
                document.getElementById('totalClasses').textContent = classesData.classes?.length || 0;
                
                const now = new Date();
                const upcoming = classesData.classes?.filter(c => new Date(c.class_date + ' ' + c.class_time) > now) || [];
                document.getElementById('upcomingClasses').textContent = upcoming.length;

                // Recent activity
                const activity = [
                    { icon: 'user-plus', text: \`\${studentsData.students?.length || 0} students registered\`, time: 'Today' },
                    { icon: 'video', text: \`\${upcoming.length} upcoming classes scheduled\`, time: 'This week' },
                    { icon: 'book', text: '8 course modules active', time: 'Current' }
                ];

                document.getElementById('recentActivity').innerHTML = activity.map(a => \`
                    <div class="flex items-center justify-between p-3 bg-black bg-opacity-30 rounded-lg">
                        <div class="flex items-center">
                            <i class="fas fa-\${a.icon} text-yellow-400 mr-3"></i>
                            <span class="text-gray-300">\${a.text}</span>
                        </div>
                        <span class="text-sm text-gray-500">\${a.time}</span>
                    </div>
                \`).join('');
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        }

        async function loadStudents() {
            try {
                const response = await fetch('/api/admin/students-list');
                const data = await response.json();
                
                const html = data.students.map(s => \`
                    <tr class="border-b border-gray-800 hover:bg-gray-800">
                        <td class="py-3 px-4">\${s.registration_id}</td>
                        <td class="py-3 px-4">\${s.full_name}</td>
                        <td class="py-3 px-4">\${s.email}</td>
                        <td class="py-3 px-4">\${s.mobile || '-'}</td>
                        <td class="py-3 px-4">\${s.college_name || '-'}</td>
                        <td class="py-3 px-4">
                            <span class="px-2 py-1 text-xs rounded-full \${s.status === 'active' ? 'bg-green-500' : 'bg-red-500'} bg-opacity-20 \${s.status === 'active' ? 'text-green-400' : 'text-red-400'}">
                                \${s.status}
                            </span>
                        </td>
                        <td class="py-3 px-4">
                            <button onclick="editStudent(\${s.registration_id})" class="text-yellow-400 hover:text-yellow-300 mr-3">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteStudent(\${s.registration_id}, '\${s.full_name}')" class="text-red-400 hover:text-red-300">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                \`).join('');
                
                document.getElementById('studentsTableBody').innerHTML = html;
            } catch (error) {
                console.error('Error loading students:', error);
            }
        }

        async function loadClasses() {
            try {
                const response = await fetch('/api/live-classes');
                const data = await response.json();
                
                const html = data.classes.map(cls => \`
                    <div class="card p-6 rounded-xl">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <h3 class="text-xl font-bold text-yellow-400 mb-2">\${cls.class_title}</h3>
                                <p class="text-gray-400 mb-3">\${cls.class_description || 'No description'}</p>
                                <div class="flex flex-wrap gap-4 text-sm mb-4">
                                    <span class="text-gray-300">
                                        <i class="fas fa-calendar mr-2 text-yellow-400"></i>
                                        \${new Date(cls.class_date).toLocaleDateString()}
                                    </span>
                                    <span class="text-gray-300">
                                        <i class="fas fa-clock mr-2 text-yellow-400"></i>
                                        \${cls.class_time} (\${cls.duration_minutes} mins)
                                    </span>
                                    <span class="text-gray-300">
                                        <i class="fas fa-user mr-2 text-yellow-400"></i>
                                        \${cls.instructor_name}
                                    </span>
                                </div>
                                <div class="flex items-center space-x-3">
                                    <a href="\${cls.zoom_join_url}" target="_blank" 
                                       class="text-yellow-400 hover:text-yellow-300 text-sm">
                                        <i class="fas fa-external-link-alt mr-1"></i>Zoom Link
                                    </a>
                                    <span class="text-gray-500">|</span>
                                    <button onclick="editClass(\${cls.class_id})" class="text-blue-400 hover:text-blue-300 text-sm">
                                        <i class="fas fa-edit mr-1"></i>Edit
                                    </button>
                                    <button onclick="deleteClass(\${cls.class_id}, '\${cls.class_title}')" class="text-red-400 hover:text-red-300 text-sm">
                                        <i class="fas fa-trash mr-1"></i>Delete
                                    </button>
                                </div>
                            </div>
                            <span class="px-3 py-1 bg-green-500 bg-opacity-20 text-green-400 rounded-full text-sm">
                                \${cls.status}
                            </span>
                        </div>
                    </div>
                \`).join('');
                
                document.getElementById('classesList').innerHTML = html;
            } catch (error) {
                console.error('Error loading classes:', error);
            }
        }

        async function loadModules() {
            try {
                const response = await fetch('/api/course-modules');
                const data = await response.json();
                
                const html = data.modules.map(mod => \`
                    <div class="card p-6 rounded-xl">
                        <div class="flex items-center mb-4">
                            <div class="w-12 h-12 bg-yellow-400 bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                                <span class="text-xl font-bold text-yellow-400">\${mod.module_number}</span>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold text-yellow-400">\${mod.module_title}</h3>
                                <p class="text-sm text-gray-400">\${mod.duration_weeks} week\${mod.duration_weeks > 1 ? 's' : ''}</p>
                            </div>
                        </div>
                        <p class="text-gray-400 mb-4">\${mod.module_description}</p>
                        <div class="space-y-2">
                            \${JSON.parse(mod.topics).map(topic => \`
                                <div class="flex items-center text-sm text-gray-300">
                                    <i class="fas fa-check-circle text-yellow-400 mr-2"></i>
                                    \${topic}
                                </div>
                            \`).join('')}
                        </div>
                    </div>
                \`).join('');
                
                document.getElementById('modulesList').innerHTML = html;
            } catch (error) {
                console.error('Error loading modules:', error);
            }
        }

        function openAddClassModal() {
            document.getElementById('addClassModal').classList.add('active');
        }

        function closeAddClassModal() {
            document.getElementById('addClassModal').classList.remove('active');
            document.getElementById('addClassForm').reset();
        }

        document.getElementById('addClassForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            data.course_type = 'iot_robotics';
            
            try {
                const response = await fetch('/api/admin/add-class', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('admin_token')
                    },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    alert('Class added successfully!');
                    closeAddClassModal();
                    loadClasses();
                } else {
                    const error = await response.json();
                    alert('Error: ' + error.error);
                }
            } catch (error) {
                console.error('Error adding class:', error);
                alert('Failed to add class');
            }
        });

        function deleteStudent(id, name) {
            if (!confirm(\`Are you sure you want to delete student "\${name}"?\`)) return;
            
            fetch('/api/admin/delete-student/' + id, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('admin_token')
                }
            }).then(res => {
                if (res.ok) {
                    alert('Student deleted successfully');
                    loadStudents();
                } else {
                    alert('Failed to delete student');
                }
            });
        }

        function deleteClass(id, title) {
            if (!confirm(\`Are you sure you want to delete class "\${title}"?\`)) return;
            
            fetch('/api/admin/delete-class/' + id, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('admin_token')
                }
            }).then(res => {
                if (res.ok) {
                    alert('Class deleted successfully');
                    loadClasses();
                } else {
                    alert('Failed to delete class');
                }
            });
        }

        function editStudent(id) {
            alert('Edit functionality coming soon!');
        }

        function editClass(id) {
            alert('Edit functionality coming soon!');
        }

        function exportStudents() {
            alert('Export to CSV functionality coming soon!');
        }

        // Initialize
        loadDashboard();
    </script>
</body>
</html>
  `)
})

// API: Get All Students (Admin)
app.get('/api/admin/students-list', async (c) => {
  try {
    const { env } = c
    
    const students = await env.DB.prepare(`
      SELECT * FROM course_registrations 
      ORDER BY registration_date DESC
    `).all()

    return c.json({
      success: true,
      students: students.results || []
    })
  } catch (error) {
    console.error('Error fetching students:', error)
    return c.json({ error: 'Failed to fetch students' }, 500)
  }
})

// API: Add New Class (Admin)
app.post('/api/admin/add-class', async (c) => {
  try {
    const { env } = c
    const data = await c.req.json()

    const result = await env.DB.prepare(`
      INSERT INTO live_classes 
      (class_title, class_description, instructor_name, class_date, class_time, 
       duration_minutes, zoom_meeting_id, zoom_meeting_password, zoom_join_url, 
       course_type, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')
    `).bind(
      data.class_title,
      data.class_description || null,
      data.instructor_name,
      data.class_date,
      data.class_time,
      data.duration_minutes,
      data.zoom_meeting_id,
      data.zoom_meeting_password || null,
      data.zoom_join_url,
      data.course_type || 'iot_robotics'
    ).run()

    return c.json({
      success: true,
      message: 'Class added successfully',
      class_id: result.meta.last_row_id
    })
  } catch (error) {
    console.error('Error adding class:', error)
    return c.json({ error: 'Failed to add class' }, 500)
  }
})

// API: Delete Student (Admin)
app.delete('/api/admin/delete-student/:id', async (c) => {
  try {
    const { env } = c
    const id = c.req.param('id')

    await env.DB.prepare(`
      DELETE FROM course_registrations WHERE registration_id = ?
    `).bind(id).run()

    return c.json({
      success: true,
      message: 'Student deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting student:', error)
    return c.json({ error: 'Failed to delete student' }, 500)
  }
})

// API: Delete Class (Admin)
app.delete('/api/admin/delete-class/:id', async (c) => {
  try {
    const { env } = c
    const id = c.req.param('id')

    await env.DB.prepare(`
      DELETE FROM live_classes WHERE class_id = ?
    `).bind(id).run()

    return c.json({
      success: true,
      message: 'Class deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting class:', error)
    return c.json({ error: 'Failed to delete class' }, 500)
  }
})



export default app
