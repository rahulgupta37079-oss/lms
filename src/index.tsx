import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database;
  OPENAI_API_KEY?: string;  // Optional: OpenAI API key
  OPENAI_BASE_URL?: string;  // Optional: Custom API base URL
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
                <a href="/api/certificates/${certificate.certificate_code.split('-').pop()}/view" 
                   class="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition">
                  <i class="fas fa-eye mr-2"></i> View Certificate
                </a>
                <a href="/" 
                   class="inline-flex items-center px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition">
                  <i class="fas fa-home mr-2"></i> Home
                </a>
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
  @page { size: 1920px 1080px; margin: 0; }
  @media print {
    body { width: 1920px; height: 1080px; margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none !important; }
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Roboto', sans-serif; background: #000; overflow: hidden; }
  .certificate-container { width: 1920px; height: 1080px; position: relative; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); color: white; overflow: hidden; }
  .yellow-bar { position: absolute; left: 0; top: 0; bottom: 0; width: 140px; background: linear-gradient(180deg, #ffd700 0%, #f4c430 100%); box-shadow: 5px 0 30px rgba(255, 215, 0, 0.4); z-index: 10; }
  .vertical-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-90deg); font-family: 'Oswald', sans-serif; font-size: 3.8rem; font-weight: 700; color: #000; letter-spacing: 0.5rem; text-transform: uppercase; white-space: nowrap; }
  .bg-pattern { position: absolute; right: 0; top: 0; width: 60%; height: 100%; background: radial-gradient(circle at center, rgba(255, 215, 0, 0.03) 0%, transparent 70%); pointer-events: none; }
  .diagonal-accent { position: absolute; right: -100px; top: -100px; width: 800px; height: 800px; background: linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, transparent 50%); transform: rotate(45deg); pointer-events: none; }
  .cert-id { position: absolute; top: 50px; right: 80px; font-family: 'Oswald', sans-serif; font-size: 1.1rem; font-weight: 600; color: #000; background: #ffd700; padding: 10px 28px; letter-spacing: 0.08rem; box-shadow: 0 4px 20px rgba(255, 215, 0, 0.4); z-index: 20; }
  .content { position: relative; margin-left: 180px; padding: 120px 100px 80px 80px; max-width: 1500px; z-index: 5; }
  .logo-section { display: flex; align-items: center; gap: 20px; margin-bottom: 40px; }
  .logo-icon { width: 70px; height: 70px; background: #ffd700; display: flex; align-items: center; justify-content: center; border-radius: 8px; box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3); }
  .logo-icon i { font-size: 36px; color: #000; }
  .logo-text { font-family: 'Oswald', sans-serif; font-size: 2.5rem; font-weight: 700; letter-spacing: 0.15rem; text-transform: uppercase; color: #fff; }
  .cert-title-group { margin-bottom: 40px; }
  .cert-label { font-family: 'Oswald', sans-serif; font-size: 8rem; font-weight: 700; line-height: 0.9; text-transform: uppercase; color: transparent; -webkit-text-stroke: 3px #ffd700; text-stroke: 3px #ffd700; letter-spacing: 0.1rem; margin-bottom: 15px; }
  .cert-subtitle { font-family: 'Oswald', sans-serif; font-size: 2.2rem; font-weight: 400; letter-spacing: 0.25rem; text-transform: uppercase; color: #ddd; display: flex; align-items: center; gap: 20px; }
  .cert-subtitle::before, .cert-subtitle::after { content: ''; width: 80px; height: 3px; background: #ffd700; }
  .certifies-label { font-family: 'Roboto', sans-serif; font-size: 1.1rem; font-weight: 500; letter-spacing: 0.3rem; text-transform: uppercase; color: #999; margin-bottom: 25px; }
  .student-name { font-family: 'Oswald', sans-serif; font-size: 5rem; font-weight: 700; color: #ffd700; text-transform: uppercase; letter-spacing: 0.1rem; margin-bottom: 35px; text-shadow: 3px 3px 0 rgba(0, 0, 0, 0.5); }
  .description { font-family: 'Roboto', sans-serif; font-size: 1.4rem; line-height: 1.9; color: #ccc; max-width: 1200px; margin-bottom: 60px; }
  .footer-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 80px; padding-top: 40px; border-top: 2px solid rgba(255, 215, 0, 0.3); }
  .footer-item { text-align: center; }
  .footer-label { font-family: 'Oswald', sans-serif; font-size: 1rem; font-weight: 600; letter-spacing: 0.15rem; text-transform: uppercase; color: #ffd700; margin-bottom: 15px; }
  .footer-value { font-family: 'Roboto', sans-serif; font-size: 1.35rem; font-weight: 500; color: #fff; margin-bottom: 10px; }
  .signature-section { margin-top: 15px; }
  .signature-image { width: 200px; height: 70px; margin: 0 auto 5px; object-fit: contain; filter: brightness(1.1); display: block; }
  .signature-line { width: 220px; height: 2px; background: rgba(255, 215, 0, 0.5); margin: 0 auto 12px; }
  .signature-name { font-family: 'Roboto', sans-serif; font-size: 1.4rem; font-weight: 600; color: #fff; margin-bottom: 5px; font-style: italic; }
  .signature-title { font-family: 'Roboto', sans-serif; font-size: 1.05rem; font-weight: 400; color: #999; text-align: center; }
  .download-btn { position: fixed; top: 30px; right: 30px; padding: 16px 32px; background: linear-gradient(135deg, #ffd700 0%, #f4c430 100%); color: #000; font-family: 'Oswald', sans-serif; font-size: 1.1rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1rem; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 6px 25px rgba(255, 215, 0, 0.4); transition: all 0.3s ease; z-index: 1000; }
  .download-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(255, 215, 0, 0.6); }
  .download-btn i { margin-right: 10px; }
</style>
</head>
<body>
  <button class="download-btn no-print" onclick="downloadAsPDF()">
    <i class="fas fa-download"></i> Download PDF
  </button>
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
            <img src="/static/signature.svg" alt="Signature" class="signature-image" />
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
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const scaleX = windowWidth / 1920;
      const scaleY = windowHeight / 1080;
      const scale = Math.min(scaleX, scaleY, 1);
      if (scale < 1) {
        container.style.transform = \`scale(\${scale})\`;
        container.style.transformOrigin = 'top left';
        document.body.style.width = \`\${1920 * scale}px\`;
        document.body.style.height = \`\${1080 * scale}px\`;
      }
    }
    adjustScale();
    window.addEventListener('resize', adjustScale);

    // Direct PDF download using html2canvas + jsPDF
    async function downloadAsPDF() {
      try {
        const btn = document.querySelector('.download-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
        
        const container = document.querySelector('.certificate-container');
        
        // Generate canvas from HTML
        const canvas = await html2canvas(container, {
          width: 1920,
          height: 1080,
          scale: 2,
          backgroundColor: '#000000',
          logging: false,
          useCORS: true
        });
        
        // Create PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [1920, 1080]
        });
        
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, 1920, 1080);
        
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
  </script>
</body>
</html>`
}

export default app
