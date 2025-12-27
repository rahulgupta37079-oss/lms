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
// ROOT ROUTE
// ============================================

app.get('/', (c) => {
  const v = Date.now(); // Cache busting version
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PassionBots LMS v8.0 - Yellow Black White Theme</title>
    
    <!-- PWA Manifest -->
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#667eea">
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    
    <!-- Chart.js for Analytics -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    
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

export default app
