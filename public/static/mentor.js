// Mentor Application State
const MentorState = {
  currentMentor: null,
  isLoggedIn: false,
  currentView: 'dashboard',
  students: [],
  selectedStudent: null,
  pendingSubmissions: [],
  messages: []
};

// Check if we're in mentor mode
const isMentorMode = window.location.pathname.includes('/mentor') || localStorage.getItem('userRole') === 'mentor';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  if (isMentorMode) {
    renderMentorView();
  }
});

// View Router for Mentor
function renderMentorView() {
  const app = document.getElementById('app');
  
  switch(MentorState.currentView) {
    case 'dashboard':
      app.innerHTML = renderMentorDashboard();
      loadMentorDashboardData();
      break;
    case 'students':
      app.innerHTML = renderStudents();
      loadStudents();
      break;
    case 'student-detail':
      app.innerHTML = renderStudentDetail();
      loadStudentDetail();
      break;
    case 'submissions':
      app.innerHTML = renderSubmissions();
      loadSubmissions();
      break;
    case 'messages':
      app.innerHTML = renderMentorMessages();
      loadMentorMessages();
      break;
    case 'analytics':
      app.innerHTML = renderAnalytics();
      loadAnalytics();
      break;
    default:
      app.innerHTML = renderMentorDashboard();
  }
}

// ============================================
// MENTOR DASHBOARD
// ============================================

function renderMentorDashboard() {
  return `
    ${renderMentorHeader('Mentor Dashboard')}
    <div class="main-content">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;" id="mentorStatsGrid"></div>
      
      <h2 class="section-title">Quick Actions</h2>
      <div class="quick-links" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
        <div class="quick-link-card" onclick="navigateToMentor('students')">
          <div class="quick-link-icon"><i class="fas fa-users"></i></div>
          <div class="quick-link-title">My Students</div>
        </div>
        <div class="quick-link-card" onclick="navigateToMentor('submissions')">
          <div class="quick-link-icon"><i class="fas fa-clipboard-check"></i></div>
          <div class="quick-link-title">Grade Submissions</div>
        </div>
        <div class="quick-link-card" onclick="navigateToMentor('messages')">
          <div class="quick-link-icon"><i class="fas fa-comments"></i></div>
          <div class="quick-link-title">Messages</div>
        </div>
        <div class="quick-link-card" onclick="navigateToMentor('analytics')">
          <div class="quick-link-icon"><i class="fas fa-chart-bar"></i></div>
          <div class="quick-link-title">Analytics</div>
        </div>
      </div>
      
      <h2 class="section-title">Upcoming Live Sessions</h2>
      <div id="mentorSessionsGrid"></div>
    </div>
  `;
}

async function loadMentorDashboardData() {
  try {
    const response = await axios.get(`/api/mentor/dashboard/${MentorState.currentMentor.id}`);
    const { stats, upcomingSessions } = response.data;
    
    document.getElementById('mentorStatsGrid').innerHTML = `
      <div class="stat-card">
        <div class="stat-value">${stats.totalStudents}</div>
        <div class="stat-label">Total Students</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.pendingSubmissions}</div>
        <div class="stat-label">Pending Submissions</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.totalAssignments}</div>
        <div class="stat-label">Total Assignments</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.unreadMessages}</div>
        <div class="stat-label">Unread Messages</div>
      </div>
    `;
    
    document.getElementById('mentorSessionsGrid').innerHTML = upcomingSessions.length > 0 ? `
      <div style="display: grid; gap: 1rem;">
        ${upcomingSessions.map(session => `
          <div style="background: var(--card-bg); border-radius: 16px; padding: 1.5rem;">
            <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 0.5rem;">${session.title}</h3>
            <p style="color: var(--text-secondary); font-size: 14px;">${new Date(session.session_date).toLocaleString()}</p>
          </div>
        `).join('')}
      </div>
    ` : '<p style="color: var(--text-secondary);">No upcoming sessions</p>';
  } catch (error) {
    console.error('Failed to load mentor dashboard:', error);
  }
}

// ============================================
// STUDENTS LIST
// ============================================

function renderStudents() {
  return `
    ${renderMentorHeader('My Students')}
    <div class="main-content">
      <div id="studentsGrid" class="loader">Loading students...</div>
    </div>
  `;
}

async function loadStudents() {
  try {
    const response = await axios.get(`/api/mentor/${MentorState.currentMentor.id}/students`);
    MentorState.students = response.data;
    
    const grid = document.getElementById('studentsGrid');
    grid.innerHTML = MentorState.students.length > 0 ? `
      <div style="display: grid; gap: 1.5rem;">
        ${MentorState.students.map(student => `
          <div class="course-card" onclick="viewStudentDetail(${student.id})" style="cursor: pointer;">
            <div style="padding: 2rem;">
              <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 1rem;">
                <div style="flex: 1;">
                  <h3 style="font-size: 22px; font-weight: 700; margin-bottom: 0.5rem;">${student.full_name}</h3>
                  <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 0.5rem;"><i class="fas fa-envelope"></i> ${student.email}</p>
                  <p style="color: var(--text-secondary); font-size: 14px;"><i class="fas fa-university"></i> ${student.university}</p>
                </div>
                <div style="text-align: right;">
                  <div style="padding: 8px 16px; background: rgba(253, 176, 34, 0.1); color: var(--accent-yellow); border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem;">
                    ${student.program_type}
                  </div>
                </div>
              </div>
              
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; padding: 1rem; background: var(--secondary-bg); border-radius: 12px;">
                <div>
                  <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 0.25rem;">Completed Lessons</div>
                  <div style="font-size: 18px; font-weight: 600;">${student.completed_lessons || 0}</div>
                </div>
                <div>
                  <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 0.25rem;">Submitted Assignments</div>
                  <div style="font-size: 18px; font-weight: 600;">${student.submitted_assignments || 0}</div>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    ` : '<p style="text-align: center; color: var(--text-secondary); padding: 3rem;">No students assigned yet.</p>';
  } catch (error) {
    console.error('Failed to load students:', error);
  }
}

function viewStudentDetail(studentId) {
  MentorState.selectedStudent = studentId;
  MentorState.currentView = 'student-detail';
  renderMentorView();
}

// ============================================
// STUDENT DETAIL
// ============================================

function renderStudentDetail() {
  return `
    ${renderMentorHeader('Student Details')}
    <div class="main-content">
      <div id="studentDetailContent" class="loader">Loading student details...</div>
    </div>
  `;
}

async function loadStudentDetail() {
  try {
    const response = await axios.get(`/api/mentor/student/${MentorState.selectedStudent}/detail`);
    const { student, progress, testResults, submissions } = response.data;
    
    const content = document.getElementById('studentDetailContent');
    content.innerHTML = `
      <div style="background: var(--card-bg); border-radius: 20px; padding: 2.5rem; margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <h2 style="font-size: 32px; font-weight: 800; margin-bottom: 1rem;">${student.full_name}</h2>
            <p style="color: var(--text-secondary); margin-bottom: 0.5rem;"><i class="fas fa-envelope"></i> ${student.email}</p>
            <p style="color: var(--text-secondary); margin-bottom: 0.5rem;"><i class="fas fa-phone"></i> ${student.phone}</p>
            <p style="color: var(--text-secondary);"><i class="fas fa-university"></i> ${student.university}</p>
          </div>
          <div style="padding: 12px 24px; background: rgba(253, 176, 34, 0.1); color: var(--accent-yellow); border-radius: 20px; font-size: 14px; font-weight: 600; text-transform: uppercase;">
            ${student.program_type}
          </div>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
        <div class="stat-card">
          <div class="stat-value">${progress.completed_lessons || 0}/${progress.total_lessons || 0}</div>
          <div class="stat-label">Lessons Completed</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${testResults.length}</div>
          <div class="stat-label">Tests Taken</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${submissions.length}</div>
          <div class="stat-label">Assignments Submitted</div>
        </div>
      </div>
      
      <h2 class="section-title">Test Results</h2>
      <div style="background: var(--card-bg); border-radius: 20px; padding: 2rem; margin-bottom: 2rem;">
        ${testResults.length > 0 ? testResults.map(test => `
          <div style="display: flex; justify-content: space-between; padding: 1rem; border-bottom: 1px solid var(--border-color);">
            <div>
              <h3 style="font-size: 16px; font-weight: 600;">${test.test_title}</h3>
              <p style="font-size: 14px; color: var(--text-secondary);">${new Date(test.submitted_at).toLocaleString()}</p>
            </div>
            <div style="font-size: 32px; font-weight: 800; color: var(--accent-yellow);">${test.score}%</div>
          </div>
        `).join('') : '<p style="color: var(--text-secondary);">No tests taken yet.</p>'}
      </div>
      
      <h2 class="section-title">Assignment Submissions</h2>
      <div style="background: var(--card-bg); border-radius: 20px; padding: 2rem;">
        ${submissions.length > 0 ? submissions.map(sub => `
          <div style="padding: 1.5rem; border-bottom: 1px solid var(--border-color);">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
              <div>
                <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 0.5rem;">${sub.assignment_title}</h3>
                <p style="font-size: 14px; color: var(--text-secondary);">Submitted: ${new Date(sub.submitted_at).toLocaleString()}</p>
              </div>
              <div style="padding: 8px 16px; background: ${sub.status === 'graded' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; color: ${sub.status === 'graded' ? '#22c55e' : '#ef4444'}; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                ${sub.status}
              </div>
            </div>
            ${sub.score !== null ? `<div style="font-size: 24px; font-weight: 800; color: var(--accent-yellow); margin-bottom: 0.5rem;">Score: ${sub.score}/${sub.max_score}</div>` : ''}
            ${sub.feedback ? `<p style="color: var(--text-secondary);">Feedback: ${sub.feedback}</p>` : ''}
          </div>
        `).join('') : '<p style="color: var(--text-secondary);">No submissions yet.</p>'}
      </div>
    `;
  } catch (error) {
    console.error('Failed to load student details:', error);
  }
}

// ============================================
// SUBMISSIONS & GRADING
// ============================================

function renderSubmissions() {
  return `
    ${renderMentorHeader('Grade Submissions')}
    <div class="main-content">
      <div style="margin-bottom: 1.5rem;">
        <button class="btn-secondary" onclick="loadPendingSubmissions()" style="margin-right: 1rem;">Pending</button>
        <button class="btn-secondary" onclick="loadAllSubmissions()">All Submissions</button>
      </div>
      <div id="submissionsGrid" class="loader">Loading submissions...</div>
    </div>
  `;
}

async function loadPendingSubmissions() {
  try {
    const response = await axios.get(`/api/mentor/${MentorState.currentMentor.id}/submissions/pending`);
    renderSubmissionsList(response.data);
  } catch (error) {
    console.error('Failed to load pending submissions:', error);
  }
}

async function loadAllSubmissions() {
  try {
    const response = await axios.get(`/api/mentor/${MentorState.currentMentor.id}/submissions/all`);
    renderSubmissionsList(response.data);
  } catch (error) {
    console.error('Failed to load all submissions:', error);
  }
}

async function loadSubmissions() {
  loadPendingSubmissions();
}

function renderSubmissionsList(submissions) {
  const grid = document.getElementById('submissionsGrid');
  grid.innerHTML = submissions.length > 0 ? `
    <div style="display: grid; gap: 1.5rem;">
      ${submissions.map(sub => `
        <div style="background: var(--card-bg); border-radius: 16px; padding: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
            <div style="flex: 1;">
              <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 0.5rem;">${sub.assignment_title}</h3>
              <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 0.5rem;">Student: ${sub.student_name} (${sub.student_email})</p>
              <p style="color: var(--text-secondary); font-size: 14px;">Module: ${sub.module_title}</p>
            </div>
            <div style="padding: 8px 16px; background: ${sub.status === 'graded' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; color: ${sub.status === 'graded' ? '#22c55e' : '#ef4444'}; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
              ${sub.status}
            </div>
          </div>
          
          <div style="background: var(--secondary-bg); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
            <p style="margin-bottom: 1rem;"><strong>Description:</strong> ${sub.description || 'No description provided'}</p>
            ${sub.submission_url ? `<p style="margin-bottom: 0.5rem;"><i class="fas fa-file"></i> <a href="${sub.submission_url}" target="_blank" style="color: var(--accent-yellow);">View Submission</a></p>` : ''}
            ${sub.github_url ? `<p style="margin-bottom: 0.5rem;"><i class="fab fa-github"></i> <a href="${sub.github_url}" target="_blank" style="color: var(--accent-yellow);">GitHub Repository</a></p>` : ''}
            ${sub.demo_url ? `<p><i class="fas fa-globe"></i> <a href="${sub.demo_url}" target="_blank" style="color: var(--accent-yellow);">Live Demo</a></p>` : ''}
          </div>
          
          ${sub.status === 'pending' ? `
            <button class="btn-primary" onclick="gradeSubmission(${sub.id}, ${sub.max_score})" style="width: 100%; justify-content: center;">
              <i class="fas fa-check-circle"></i> Grade Submission
            </button>
          ` : sub.score !== null ? `
            <div style="padding: 1rem; background: var(--secondary-bg); border-radius: 12px;">
              <div style="font-size: 24px; font-weight: 800; color: var(--accent-yellow); margin-bottom: 0.5rem;">Score: ${sub.score}/${sub.max_score}</div>
              ${sub.feedback ? `<p style="color: var(--text-secondary);">Feedback: ${sub.feedback}</p>` : ''}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  ` : '<p style="text-align: center; color: var(--text-secondary); padding: 3rem;">No submissions found.</p>';
}

function gradeSubmission(submissionId, maxScore) {
  const score = prompt(`Enter score (out of ${maxScore}):`);
  if (score === null) return;
  
  const feedback = prompt('Enter feedback for the student:');
  if (feedback === null) return;
  
  axios.post(`/api/mentor/submission/${submissionId}/grade`, {
    score: parseInt(score),
    feedback,
    status: 'graded'
  }).then(() => {
    alert('✅ Submission graded successfully!');
    loadSubmissions();
  }).catch(() => {
    alert('❌ Failed to grade submission.');
  });
}

// ============================================
// MENTOR MESSAGES
// ============================================

function renderMentorMessages() {
  return `
    ${renderMentorHeader('Messages')}
    <div class="main-content">
      <div id="mentorMessagesContainer" class="loader">Loading messages...</div>
    </div>
  `;
}

async function loadMentorMessages() {
  try {
    const response = await axios.get(`/api/mentor/${MentorState.currentMentor.id}/messages`);
    const messages = response.data;
    
    const container = document.getElementById('mentorMessagesContainer');
    container.innerHTML = messages.length > 0 ? `
      <div style="display: grid; gap: 1rem;">
        ${messages.map(msg => `
          <div style="background: var(--card-bg); border-radius: 16px; padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
              <div style="font-weight: 600; color: var(--accent-yellow);">${msg.sender_name || 'Student'}</div>
              <div style="font-size: 12px; color: var(--text-secondary);">${new Date(msg.sent_at).toLocaleString()}</div>
            </div>
            <p style="color: var(--text-primary); line-height: 1.6;">${msg.message}</p>
          </div>
        `).join('')}
      </div>
    ` : '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No messages yet.</p>';
  } catch (error) {
    console.error('Failed to load messages:', error);
  }
}

// ============================================
// ANALYTICS
// ============================================

function renderAnalytics() {
  return `
    ${renderMentorHeader('Analytics & Reports')}
    <div class="main-content">
      <div id="analyticsContent" class="loader">Loading analytics...</div>
    </div>
  `;
}

async function loadAnalytics() {
  try {
    const response = await axios.get(`/api/mentor/${MentorState.currentMentor.id}/analytics`);
    const { engagement, assignments, tests } = response.data;
    
    const content = document.getElementById('analyticsContent');
    content.innerHTML = `
      <h2 class="section-title">Student Engagement</h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
        <div class="stat-card">
          <div class="stat-value">${engagement.total_students || 0}</div>
          <div class="stat-label">Total Students</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${engagement.active_students || 0}</div>
          <div class="stat-label">Active (Last 7 Days)</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${Math.round(engagement.avg_progress || 0)}%</div>
          <div class="stat-label">Average Progress</div>
        </div>
      </div>
      
      <h2 class="section-title">Assignment Statistics</h2>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
        <div class="stat-card">
          <div class="stat-value">${assignments.total_assignments || 0}</div>
          <div class="stat-label">Total Submissions</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${assignments.graded || 0}</div>
          <div class="stat-label">Graded</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${assignments.pending || 0}</div>
          <div class="stat-label">Pending</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${Math.round(assignments.avg_score || 0)}%</div>
          <div class="stat-label">Average Score</div>
        </div>
      </div>
      
      <h2 class="section-title">Test Performance</h2>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem;">
        <div class="stat-card">
          <div class="stat-value">${tests.total_tests || 0}</div>
          <div class="stat-label">Tests Taken</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${Math.round(tests.avg_score || 0)}%</div>
          <div class="stat-label">Average Score</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${Math.round(tests.highest_score || 0)}%</div>
          <div class="stat-label">Highest Score</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${Math.round(tests.lowest_score || 0)}%</div>
          <div class="stat-label">Lowest Score</div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Failed to load analytics:', error);
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function renderMentorHeader(title) {
  return `
    <div style="position: sticky; top: 0; z-index: 100; background: var(--secondary-bg); border-bottom: 1px solid var(--border-color);">
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 1.5rem 2rem;">
        <div style="display: flex; align-items: center; gap: 1.5rem;">
          <div style="width: 50px; height: 50px; background: var(--accent-yellow); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #1a1d29;">
            <i class="fas fa-chalkboard-teacher"></i>
          </div>
          <div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 2px;">Mentor Portal</div>
            <h1 style="font-size: 24px; font-weight: 700;">${title}</h1>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 1.5rem;">
          <button onclick="navigateToMentor('dashboard')" class="btn-secondary" style="padding: 10px 20px;">
            <i class="fas fa-home"></i> Dashboard
          </button>
          <div style="width: 40px; height: 40px; background: var(--accent-yellow); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; color: #1a1d29; cursor: pointer;" onclick="mentorLogout()">
            ${MentorState.currentMentor ? MentorState.currentMentor.full_name[0] : 'M'}
          </div>
        </div>
      </div>
    </div>
  `;
}

function navigateToMentor(view) {
  MentorState.currentView = view;
  renderMentorView();
}

function mentorLogout() {
  if (confirm('Are you sure you want to logout?')) {
    MentorState.currentMentor = null;
    MentorState.isLoggedIn = false;
    localStorage.removeItem('userRole');
    localStorage.removeItem('mentorData');
    location.href = '/';
  }
}

// Expose functions globally for app.js to access
window.MentorState = MentorState;
window.renderMentorView = renderMentorView;
window.navigateToMentor = navigateToMentor;
window.mentorLogout = mentorLogout;

console.log('✅ Mentor Portal Loaded Successfully');
