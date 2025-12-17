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
