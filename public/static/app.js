// Application State
const AppState = {
  currentUser: null,
  isLoggedIn: false,
  currentView: 'login',
  modules: [],
  selectedModule: null,
  selectedLesson: null,
  selectedTest: null,
  testTimer: null
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  renderView();
});

// View Router
function renderView() {
  const app = document.getElementById('app');
  
  switch(AppState.currentView) {
    case 'login':
      app.innerHTML = renderLogin();
      break;
    case 'dashboard':
      app.innerHTML = renderDashboard();
      loadDashboardData();
      break;
    case 'modules':
      app.innerHTML = renderModules();
      loadModules();
      break;
    case 'lesson':
      app.innerHTML = renderLesson();
      loadLesson();
      break;
    case 'tests':
      app.innerHTML = renderTests();
      loadTests();
      break;
    case 'test-page':
      app.innerHTML = renderTestPage();
      loadTestQuestions();
      break;
    case 'assignments':
      app.innerHTML = renderAssignments();
      loadAssignments();
      break;
    case 'sessions':
      app.innerHTML = renderSessions();
      loadSessions();
      break;
    case 'messages':
      app.innerHTML = renderMessages();
      loadMessages();
      break;
    case 'certificates':
      app.innerHTML = renderCertificates();
      loadCertificates();
      break;
    case 'progress':
      app.innerHTML = renderProgress();
      loadProgress();
      break;
    case 'verify':
      app.innerHTML = renderVerifyCertificate();
      break;
    default:
      app.innerHTML = renderLogin();
  }
}

// ============================================
// LOGIN PAGE
// ============================================

function renderLogin() {
  return `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--primary-bg);">
      <div style="width: 100%; max-width: 450px; padding: 2rem;">
        <div style="text-align: center; margin-bottom: 3rem;">
          <div style="width: 80px; height: 80px; background: var(--accent-yellow); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 40px;">
            <i class="fas fa-robot"></i>
          </div>
          <h1 style="font-size: 32px; font-weight: 800; margin-bottom: 0.5rem;">PassionBots LMS</h1>
          <p style="color: var(--text-secondary); font-size: 16px;">IoT & Robotics Internship Portal</p>
        </div>
        
        <div style="background: var(--card-bg); border-radius: 20px; padding: 2.5rem;">
          <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 1.5rem; text-align: center;">Welcome Back!</h2>
          
          <form id="loginForm" onsubmit="handleLogin(event)">
            <div style="margin-bottom: 1.5rem;">
              <label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 0.5rem;">Email Address</label>
              <input type="email" id="email" required 
                style="width: 100%; padding: 14px; background: var(--secondary-bg); border: 2px solid var(--border-color); border-radius: 12px; color: white; font-size: 16px;"
                placeholder="student@example.com" />
            </div>
            
            <div style="margin-bottom: 2rem;">
              <label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 0.5rem;">Password</label>
              <input type="password" id="password" required 
                style="width: 100%; padding: 14px; background: var(--secondary-bg); border: 2px solid var(--border-color); border-radius: 12px; color: white; font-size: 16px;"
                placeholder="Enter your password" />
            </div>
            
            <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; font-size: 16px; padding: 16px;">
              Login <i class="fas fa-arrow-right"></i>
            </button>
          </form>
          
          <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--border-color);">
            <p style="font-size: 14px; color: var(--text-secondary); text-align: center; margin-bottom: 1rem;">Demo Credentials:</p>
            <div style="background: var(--secondary-bg); border-radius: 12px; padding: 1rem; font-size: 13px; color: var(--text-secondary);">
              <div style="margin-bottom: 0.5rem;"><strong style="color: var(--text-primary);">Email:</strong> demo@student.com</div>
              <div><strong style="color: var(--text-primary);">Password:</strong> demo123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    const response = await axios.post('/api/auth/login', { email, password });
    if (response.data.success) {
      AppState.currentUser = response.data.student;
      AppState.isLoggedIn = true;
      AppState.currentView = 'dashboard';
      renderView();
    }
  } catch (error) {
    alert('Login failed! Please check your credentials.');
  }
}

// ============================================
// DASHBOARD
// ============================================

function renderDashboard() {
  return `
    ${renderHeader('Dashboard')}
    <div class="main-content">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;" id="statsGrid"></div>
      
      <h2 class="section-title">Quick Access</h2>
      <div class="quick-links" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
        <div class="quick-link-card" onclick="navigateTo('modules')">
          <div class="quick-link-icon"><i class="fas fa-book"></i></div>
          <div class="quick-link-title">My Courses</div>
        </div>
        <div class="quick-link-card" onclick="navigateTo('tests')">
          <div class="quick-link-icon"><i class="fas fa-clipboard-check"></i></div>
          <div class="quick-link-title">Live Tests</div>
        </div>
        <div class="quick-link-card" onclick="navigateTo('assignments')">
          <div class="quick-link-icon"><i class="fas fa-tasks"></i></div>
          <div class="quick-link-title">Assignments</div>
        </div>
        <div class="quick-link-card" onclick="navigateTo('sessions')">
          <div class="quick-link-icon"><i class="fas fa-video"></i></div>
          <div class="quick-link-title">Live Sessions</div>
        </div>
        <div class="quick-link-card" onclick="navigateTo('messages')">
          <div class="quick-link-icon"><i class="fas fa-comments"></i></div>
          <div class="quick-link-title">Messages</div>
        </div>
        <div class="quick-link-card" onclick="navigateTo('certificates')">
          <div class="quick-link-icon"><i class="fas fa-certificate"></i></div>
          <div class="quick-link-title">Certificates</div>
        </div>
        <div class="quick-link-card" onclick="navigateTo('progress')">
          <div class="quick-link-icon"><i class="fas fa-chart-line"></i></div>
          <div class="quick-link-title">My Progress</div>
        </div>
        <div class="quick-link-card" onclick="navigateTo('verify')">
          <div class="quick-link-icon"><i class="fas fa-shield-alt"></i></div>
          <div class="quick-link-title">Verify Certificate</div>
        </div>
      </div>
      
      <h2 class="section-title">Recent Modules</h2>
      <div class="courses-grid" id="modulesGrid"></div>
    </div>
  `;
}

async function loadDashboardData() {
  try {
    const response = await axios.get(`/api/dashboard/${AppState.currentUser.id}`);
    const { stats } = response.data;
    
    document.getElementById('statsGrid').innerHTML = `
      <div class="stat-card">
        <div class="stat-value">${stats.totalLessons}</div>
        <div class="stat-label">Total Lessons</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.completedLessons}</div>
        <div class="stat-label">Completed</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.submittedAssignments}</div>
        <div class="stat-label">Assignments Submitted</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.overallProgress}%</div>
        <div class="stat-label">Overall Progress</div>
      </div>
    `;
    
    // Load modules
    const modulesRes = await axios.get(`/api/modules/${AppState.currentUser.id}`);
    AppState.modules = modulesRes.data;
    
    const grid = document.getElementById('modulesGrid');
    grid.innerHTML = AppState.modules.slice(0, 3).map(m => renderModuleCard(m)).join('');
  } catch (error) {
    console.error('Failed to load dashboard:', error);
  }
}

// ============================================
// MODULES PAGE
// ============================================

function renderModules() {
  return `
    ${renderHeader('My Courses')}
    <div class="main-content">
      <div class="courses-grid" id="modulesGrid"></div>
    </div>
  `;
}

async function loadModules() {
  try {
    const response = await axios.get(`/api/modules/${AppState.currentUser.id}`);
    AppState.modules = response.data;
    
    const grid = document.getElementById('modulesGrid');
    grid.innerHTML = AppState.modules.map(m => renderModuleCard(m)).join('');
  } catch (error) {
    console.error('Failed to load modules:', error);
  }
}

function renderModuleCard(module) {
  const progress = module.total_lessons > 0 
    ? Math.round((module.completed_lessons / module.total_lessons) * 100) 
    : 0;
  
  const icons = ['🤖', '💻', '🔧', '📡', '🎯', '☁️', '🚀', '🎓'];
  const icon = icons[(module.module_number || 1) - 1] || '📚';
  
  return `
    <div class="course-card" onclick="viewModule(${module.id})">
      <div class="course-image">${icon}</div>
      <div class="course-content">
        <h3 class="course-title">${module.title}</h3>
        <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 1rem;">${module.description || ''}</p>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <div class="course-progress">
          <span class="course-progress-text">${module.completed_lessons} of ${module.total_lessons} lessons</span>
          <span class="course-progress-percent">${progress}%</span>
        </div>
      </div>
    </div>
  `;
}

async function viewModule(moduleId) {
  try {
    const response = await axios.get(`/api/modules/${moduleId}/lessons/${AppState.currentUser.id}`);
    AppState.selectedModule = response.data;
    
    const app = document.getElementById('app');
    app.innerHTML = `
      ${renderHeader(AppState.selectedModule.module.title)}
      <div class="main-content">
        <div style="background: var(--card-bg); border-radius: 20px; padding: 2rem; margin-bottom: 2rem;">
          <h2 style="font-size: 28px; font-weight: 700; margin-bottom: 1rem;">${AppState.selectedModule.module.title}</h2>
          <p style="color: var(--text-secondary); font-size: 16px;">${AppState.selectedModule.module.description || ''}</p>
        </div>
        
        <h2 class="section-title">Lessons (${AppState.selectedModule.lessons.length})</h2>
        <div style="display: grid; gap: 1rem;">
          ${AppState.selectedModule.lessons.map(lesson => `
            <div class="lesson-card" onclick="viewLesson(${lesson.id})" style="background: var(--card-bg); border-radius: 16px; padding: 1.5rem; cursor: pointer; transition: all 0.3s;">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="width: 50px; height: 50px; background: ${lesson.status === 'completed' ? 'var(--accent-yellow)' : 'var(--secondary-bg)'}; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                  ${lesson.status === 'completed' ? '✓' : '📝'}
                </div>
                <div style="flex: 1;">
                  <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 0.25rem;">${lesson.title}</h3>
                  <p style="font-size: 14px; color: var(--text-secondary);">${lesson.description || 'Click to start lesson'}</p>
                </div>
                <div style="font-size: 12px; padding: 8px 16px; background: ${lesson.status === 'completed' ? 'rgba(253, 176, 34, 0.1)' : 'var(--secondary-bg)'}; color: ${lesson.status === 'completed' ? 'var(--accent-yellow)' : 'var(--text-secondary)'}; border-radius: 20px; text-transform: uppercase; font-weight: 600;">
                  ${lesson.status || 'Not Started'}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Failed to load module:', error);
  }
}

// ============================================
// LESSON PAGE WITH MCQs
// ============================================

function renderLesson() {
  return `
    ${renderHeader('Lesson')}
    <div class="main-content" id="lessonContent">
      <div class="loader">Loading lesson...</div>
    </div>
  `;
}

async function loadLesson() {
  try {
    const response = await axios.get(`/api/lessons/${AppState.selectedLesson}/${AppState.currentUser.id}`);
    const { lesson, mcqs, progress } = response.data;
    
    const content = document.getElementById('lessonContent');
    content.innerHTML = `
      <div style="max-width: 900px; margin: 0 auto;">
        <div style="background: var(--card-bg); border-radius: 20px; padding: 2.5rem; margin-bottom: 2rem;">
          <h1 style="font-size: 32px; font-weight: 800; margin-bottom: 1rem;">${lesson.title}</h1>
          <p style="color: var(--text-secondary); font-size: 18px; line-height: 1.6;">${lesson.description}</p>
          
          <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--border-color);">
            <div style="white-space: pre-wrap; line-height: 1.8; color: var(--text-primary);">${lesson.content || 'Lesson content will be displayed here...'}</div>
          </div>
        </div>
        
        <div style="background: var(--card-bg); border-radius: 20px; padding: 2.5rem;">
          <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 1.5rem;">
            <i class="fas fa-question-circle" style="color: var(--accent-yellow); margin-right: 0.5rem;"></i>
            MCQ Questions (${mcqs.length})
          </h2>
          
          <form id="mcqForm" onsubmit="submitMCQs(event, ${lesson.id})">
            ${mcqs.map((mcq, index) => `
              <div style="background: var(--secondary-bg); border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem;">
                <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 1rem; color: var(--accent-yellow);">Question ${index + 1}</h3>
                <p style="font-size: 16px; margin-bottom: 1.5rem;">${mcq.question_text}</p>
                
                <div style="display: grid; gap: 0.75rem;">
                  ${['A', 'B', 'C', 'D'].map(opt => `
                    <label style="display: flex; align-items: center; padding: 12px; background: var(--card-bg); border: 2px solid var(--border-color); border-radius: 10px; cursor: pointer; transition: all 0.3s;">
                      <input type="radio" name="mcq_${mcq.id}" value="${opt}" required style="margin-right: 12px; width: 18px; height: 18px;">
                      <span style="font-size: 15px;">${mcq[`option_${opt.toLowerCase()}`]}</span>
                    </label>
                  `).join('')}
                </div>
              </div>
            `).join('')}
            
            <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; font-size: 18px; padding: 18px; margin-top: 1rem;">
              Submit Answers <i class="fas fa-check"></i>
            </button>
          </form>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Failed to load lesson:', error);
  }
}

async function viewLesson(lessonId) {
  AppState.selectedLesson = lessonId;
  AppState.currentView = 'lesson';
  renderView();
}

async function submitMCQs(e, lessonId) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const answers = {};
  
  for (let [key, value] of formData.entries()) {
    const mcqId = key.replace('mcq_', '');
    answers[mcqId] = value;
  }
  
  try {
    const response = await axios.post('/api/mcq/submit', {
      studentId: AppState.currentUser.id,
      lessonId,
      answers
    });
    
    if (response.data.success) {
      const { score, correctCount, totalQuestions } = response.data;
      alert(`✅ MCQ Submitted!\n\nScore: ${score}%\nCorrect: ${correctCount}/${totalQuestions}\n\nGreat job!`);
      
      // Mark lesson as completed
      await axios.post('/api/progress/update', {
        studentId: AppState.currentUser.id,
        lessonId,
        status: 'completed',
        progressPercentage: 100
      });
      
      navigateTo('modules');
    }
  } catch (error) {
    alert('Failed to submit answers. Please try again.');
  }
}

// ============================================
// LIVE TESTS PAGE
// ============================================

function renderTests() {
  return `
    ${renderHeader('Live Tests')}
    <div class="main-content">
      <div id="testsGrid" class="loader">Loading tests...</div>
    </div>
  `;
}

async function loadTests() {
  try {
    const response = await axios.get(`/api/tests/${AppState.currentUser.id}`);
    const tests = response.data;
    
    const grid = document.getElementById('testsGrid');
    grid.innerHTML = `
      <div style="display: grid; gap: 1.5rem;">
        ${tests.map(test => `
          <div style="background: var(--card-bg); border-radius: 16px; padding: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
              <div style="flex: 1;">
                <h3 style="font-size: 22px; font-weight: 700; margin-bottom: 0.5rem;">${test.title}</h3>
                <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 1rem;">${test.module_title}</p>
              </div>
              <div style="text-align: right;">
                ${test.score ? `
                  <div style="font-size: 32px; font-weight: 800; color: var(--accent-yellow);">${test.score}%</div>
                  <div style="font-size: 12px; color: var(--text-secondary);">Completed</div>
                ` : `
                  <div style="padding: 8px 16px; background: rgba(253, 176, 34, 0.1); color: var(--accent-yellow); border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                    Not Attempted
                  </div>
                `}
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; padding: 1rem; background: var(--secondary-bg); border-radius: 12px;">
              <div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 0.25rem;">Duration</div>
                <div style="font-size: 18px; font-weight: 600;">${test.duration_minutes} min</div>
              </div>
              <div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 0.25rem;">Total Marks</div>
                <div style="font-size: 18px; font-weight: 600;">${test.total_marks}</div>
              </div>
              <div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 0.25rem;">Scheduled</div>
                <div style="font-size: 14px; font-weight: 600;">${new Date(test.scheduled_at).toLocaleString()}</div>
              </div>
            </div>
            
            ${!test.score ? `
              <button class="btn-primary" onclick="startTest(${test.id})" style="width: 100%; justify-content: center;">
                <i class="fas fa-play-circle"></i> Start Test
              </button>
            ` : `
              <button class="btn-secondary" style="width: 100%; justify-content: center; cursor: not-allowed;" disabled>
                <i class="fas fa-check-circle"></i> Already Completed
              </button>
            `}
          </div>
        `).join('')}
      </div>
    `;
  } catch (error) {
    console.error('Failed to load tests:', error);
  }
}

function startTest(testId) {
  if (confirm('⚠️ Once you start the test, the timer will begin!\n\nAre you ready to start?')) {
    AppState.selectedTest = testId;
    AppState.currentView = 'test-page';
    renderView();
  }
}

// ============================================
// TEST PAGE WITH TIMER
// ============================================

function renderTestPage() {
  return `
    <div style="background: var(--primary-bg); min-height: 100vh; padding: 2rem;">
      <div style="max-width: 900px; margin: 0 auto;">
        <div style="background: var(--card-bg); border-radius: 20px; padding: 2rem; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
          <h1 style="font-size: 24px; font-weight: 700;">Live Test</h1>
          <div id="timer" style="font-size: 32px; font-weight: 800; color: var(--accent-yellow);"></div>
        </div>
        
        <div id="testContent" class="loader">Loading questions...</div>
      </div>
    </div>
  `;
}

async function loadTestQuestions() {
  try {
    const response = await axios.get(`/api/tests/${AppState.selectedTest}/questions`);
    const { test, questions } = response.data;
    
    // Start timer
    let timeLeft = test.duration_minutes * 60;
    startTimer(timeLeft);
    
    const content = document.getElementById('testContent');
    content.innerHTML = `
      <div style="background: var(--card-bg); border-radius: 20px; padding: 2.5rem;">
        <h2 style="font-size: 28px; font-weight: 800; margin-bottom: 2rem; text-align: center;">${test.title}</h2>
        
        <form id="testForm" onsubmit="submitTest(event, ${test.id}, ${test.duration_minutes})">
          ${questions.map((q, index) => `
            <div style="background: var(--secondary-bg); border-radius: 16px; padding: 2rem; margin-bottom: 2rem;">
              <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 1rem; color: var(--accent-yellow);">
                Question ${index + 1} <span style="font-size: 14px; color: var(--text-secondary);">(${q.marks} marks)</span>
              </h3>
              <p style="font-size: 16px; margin-bottom: 1.5rem; line-height: 1.6;">${q.question_text}</p>
              
              <div style="display: grid; gap: 1rem;">
                ${['A', 'B', 'C', 'D'].map(opt => `
                  <label style="display: flex; align-items: center; padding: 14px; background: var(--card-bg); border: 2px solid var(--border-color); border-radius: 12px; cursor: pointer; transition: all 0.3s;">
                    <input type="radio" name="q_${q.id}" value="${opt}" required style="margin-right: 12px; width: 20px; height: 20px;">
                    <span style="font-size: 16px;">${q[`option_${opt.toLowerCase()}`]}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          `).join('')}
          
          <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; font-size: 18px; padding: 18px;">
            <i class="fas fa-paper-plane"></i> Submit Test
          </button>
        </form>
      </div>
    `;
  } catch (error) {
    console.error('Failed to load test:', error);
  }
}

function startTimer(seconds) {
  const timerEl = document.getElementById('timer');
  
  function updateTimer() {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    timerEl.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;
    
    if (seconds <= 0) {
      clearInterval(AppState.testTimer);
      alert('⏰ Time is up! Submitting your test...');
      document.getElementById('testForm').dispatchEvent(new Event('submit'));
    }
    
    seconds--;
  }
  
  updateTimer();
  AppState.testTimer = setInterval(updateTimer, 1000);
}

async function submitTest(e, testId, durationMinutes) {
  e.preventDefault();
  clearInterval(AppState.testTimer);
  
  const formData = new FormData(e.target);
  const answers = {};
  
  for (let [key, value] of formData.entries()) {
    const questionId = key.replace('q_', '');
    answers[questionId] = value;
  }
  
  try {
    const response = await axios.post('/api/tests/submit', {
      testId,
      studentId: AppState.currentUser.id,
      answers,
      timeSpent: durationMinutes
    });
    
    if (response.data.success) {
      const { score, correctCount, totalQuestions } = response.data;
      alert(`🎉 Test Submitted!\n\nYour Score: ${score}%\nCorrect Answers: ${correctCount}/${totalQuestions}\n\nWell done!`);
      navigateTo('tests');
    }
  } catch (error) {
    alert('Failed to submit test. Please try again.');
  }
}

// ============================================
// ASSIGNMENTS PAGE
// ============================================

function renderAssignments() {
  return `
    ${renderHeader('Assignments')}
    <div class="main-content">
      <div id="assignmentsGrid" class="loader">Loading assignments...</div>
    </div>
  `;
}

async function loadAssignments() {
  try {
    const response = await axios.get(`/api/assignments/${AppState.currentUser.id}`);
    const assignments = response.data;
    
    const grid = document.getElementById('assignmentsGrid');
    grid.innerHTML = `
      <div style="display: grid; gap: 1.5rem;">
        ${assignments.map(assignment => `
          <div style="background: var(--card-bg); border-radius: 16px; padding: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
              <div style="flex: 1;">
                <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 0.5rem;">${assignment.title}</h3>
                <p style="color: var(--text-secondary); font-size: 14px;">${assignment.module_title}</p>
              </div>
              <div style="padding: 8px 16px; background: ${assignment.submission_status ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; color: ${assignment.submission_status ? '#22c55e' : '#ef4444'}; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                ${assignment.submission_status || 'Not Submitted'}
              </div>
            </div>
            
            <p style="color: var(--text-primary); margin-bottom: 1.5rem; line-height: 1.6;">${assignment.description}</p>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem; padding: 1rem; background: var(--secondary-bg); border-radius: 12px;">
              <div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 0.25rem;">Due Date</div>
                <div style="font-size: 14px; font-weight: 600;">${new Date(assignment.due_date).toLocaleDateString()}</div>
              </div>
              <div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 0.25rem;">Max Score</div>
                <div style="font-size: 14px; font-weight: 600;">${assignment.max_score} points</div>
              </div>
            </div>
            
            ${assignment.submission_status ? `
              <div style="padding: 1rem; background: var(--secondary-bg); border-radius: 12px; margin-bottom: 1rem;">
                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 0.5rem;">Your Score</div>
                <div style="font-size: 28px; font-weight: 800; color: var(--accent-yellow);">${assignment.score || 'Pending'}${assignment.score ? '/' + assignment.max_score : ''}</div>
                ${assignment.feedback ? `<p style="margin-top: 1rem; font-size: 14px; color: var(--text-secondary);">Feedback: ${assignment.feedback}</p>` : ''}
              </div>
            ` : `
              <button class="btn-primary" onclick="submitAssignment(${assignment.id})" style="width: 100%; justify-content: center;">
                <i class="fas fa-upload"></i> Submit Assignment
              </button>
            `}
          </div>
        `).join('')}
      </div>
    `;
  } catch (error) {
    console.error('Failed to load assignments:', error);
  }
}

function submitAssignment(assignmentId) {
  const submissionUrl = prompt('📁 Enter your submission file URL:');
  const githubUrl = prompt('🔗 Enter your GitHub repository URL (optional):');
  const demoUrl = prompt('🌐 Enter your demo/live URL (optional):');
  const description = prompt('📝 Add any notes or description:');
  
  if (submissionUrl) {
    axios.post('/api/assignments/submit', {
      assignmentId,
      studentId: AppState.currentUser.id,
      submissionUrl,
      githubUrl: githubUrl || '',
      demoUrl: demoUrl || '',
      description: description || ''
    }).then(() => {
      alert('✅ Assignment submitted successfully!');
      loadAssignments();
    }).catch(() => {
      alert('❌ Failed to submit assignment. Please try again.');
    });
  }
}

// ============================================
// LIVE SESSIONS PAGE
// ============================================

function renderSessions() {
  return `
    ${renderHeader('Live Sessions')}
    <div class="main-content">
      <div id="sessionsGrid" class="loader">Loading sessions...</div>
    </div>
  `;
}

async function loadSessions() {
  try {
    const response = await axios.get('/api/sessions');
    const sessions = response.data;
    
    const grid = document.getElementById('sessionsGrid');
    grid.innerHTML = `
      <div style="display: grid; gap: 1.5rem;">
        ${sessions.map(session => {
          const sessionDate = new Date(session.session_date);
          const isPast = sessionDate < new Date();
          const isLive = !isPast && (sessionDate - new Date() < 3600000); // Within 1 hour
          
          return `
            <div style="background: var(--card-bg); border-radius: 16px; padding: 2rem;">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <div style="flex: 1;">
                  <h3 style="font-size: 22px; font-weight: 700; margin-bottom: 0.5rem;">${session.title}</h3>
                  <p style="color: var(--text-secondary); font-size: 14px;">${session.module_title}</p>
                </div>
                ${isLive ? `
                  <div style="padding: 8px 16px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; display: flex; align-items: center; gap: 0.5rem;">
                    <div style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%; animation: pulse 1.5s infinite;"></div>
                    LIVE NOW
                  </div>
                ` : ''}
              </div>
              
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; padding: 1.5rem; background: var(--secondary-bg); border-radius: 12px;">
                <div>
                  <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 0.5rem;"><i class="fas fa-calendar"></i> Date</div>
                  <div style="font-size: 14px; font-weight: 600;">${sessionDate.toLocaleDateString()}</div>
                </div>
                <div>
                  <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 0.5rem;"><i class="fas fa-clock"></i> Time</div>
                  <div style="font-size: 14px; font-weight: 600;">${sessionDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
                <div>
                  <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 0.5rem;"><i class="fas fa-hourglass-half"></i> Duration</div>
                  <div style="font-size: 14px; font-weight: 600;">${session.duration_minutes} min</div>
                </div>
              </div>
              
              ${!isPast && session.meeting_url ? `
                <a href="${session.meeting_url}" target="_blank" class="btn-primary" style="width: 100%; justify-content: center; text-decoration: none; display: flex;">
                  <i class="fas fa-video"></i> Join Session
                </a>
              ` : isPast && session.recording_url ? `
                <a href="${session.recording_url}" target="_blank" class="btn-secondary" style="width: 100%; justify-content: center; text-decoration: none; display: flex;">
                  <i class="fas fa-play-circle"></i> Watch Recording
                </a>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  } catch (error) {
    console.error('Failed to load sessions:', error);
  }
}

// ============================================
// MESSAGES PAGE
// ============================================

function renderMessages() {
  return `
    ${renderHeader('Messages')}
    <div class="main-content">
      <div style="max-width: 800px; margin: 0 auto;">
        <div style="background: var(--card-bg); border-radius: 20px; padding: 2rem; margin-bottom: 2rem;">
          <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 1rem;">Send New Message</h2>
          <form onsubmit="sendMessage(event)">
            <textarea id="messageText" placeholder="Type your message to mentor..." required
              style="width: 100%; height: 120px; padding: 14px; background: var(--secondary-bg); border: 2px solid var(--border-color); border-radius: 12px; color: white; font-size: 16px; font-family: inherit; resize: vertical; margin-bottom: 1rem;"></textarea>
            <button type="submit" class="btn-primary" style="width: 100%; justify-content: center;">
              <i class="fas fa-paper-plane"></i> Send Message
            </button>
          </form>
        </div>
        
        <div id="messagesContainer"></div>
      </div>
    </div>
  `;
}

async function loadMessages() {
  try {
    const response = await axios.get(`/api/messages/${AppState.currentUser.id}`);
    const messages = response.data;
    
    const container = document.getElementById('messagesContainer');
    container.innerHTML = messages.length > 0 ? `
      <div style="display: grid; gap: 1rem;">
        ${messages.map(msg => `
          <div style="background: var(--card-bg); border-radius: 16px; padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
              <div style="font-weight: 600; color: var(--accent-yellow);">${msg.sender_id === AppState.currentUser.id ? 'You' : 'Mentor'}</div>
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

function sendMessage(e) {
  e.preventDefault();
  const message = document.getElementById('messageText').value;
  
  axios.post('/api/messages/send', {
    senderId: AppState.currentUser.id,
    receiverId: 999, // Mentor ID (hardcoded for demo)
    message
  }).then(() => {
    alert('✅ Message sent!');
    document.getElementById('messageText').value = '';
    loadMessages();
  }).catch(() => {
    alert('❌ Failed to send message.');
  });
}

// ============================================
// CERTIFICATES PAGE
// ============================================

function renderCertificates() {
  return `
    ${renderHeader('Certificates')}
    <div class="main-content">
      <div style="max-width: 900px; margin: 0 auto;">
        <div style="background: var(--card-bg); border-radius: 20px; padding: 2rem; margin-bottom: 2rem; text-align: center;">
          <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 1rem;">Generate Certificate</h2>
          <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Complete all modules to generate your certificate</p>
          <button class="btn-primary" onclick="generateCertificate()" style="display: inline-flex;">
            <i class="fas fa-certificate"></i> Generate Certificate
          </button>
        </div>
        
        <h2 class="section-title">Your Certificates</h2>
        <div id="certificatesGrid"></div>
      </div>
    </div>
  `;
}

async function loadCertificates() {
  try {
    const response = await axios.get(`/api/certificates/${AppState.currentUser.id}`);
    const certificates = response.data;
    
    const grid = document.getElementById('certificatesGrid');
    grid.innerHTML = certificates.length > 0 ? `
      <div style="display: grid; gap: 1.5rem;">
        ${certificates.map(cert => `
          <div style="background: linear-gradient(135deg, var(--accent-yellow) 0%, #f59e0b 100%); border-radius: 20px; padding: 2.5rem; color: #1a1d29;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1.5rem;">
              <div>
                <div style="font-size: 32px; margin-bottom: 0.5rem;">🎓</div>
                <h3 style="font-size: 24px; font-weight: 800; margin-bottom: 0.5rem;">Certificate of ${cert.certificate_type}</h3>
                <p style="font-size: 16px; opacity: 0.8;">${AppState.currentUser.full_name}</p>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 12px; opacity: 0.8; margin-bottom: 0.25rem;">Certificate ID</div>
                <div style="font-size: 18px; font-weight: 700;">${cert.certificate_id}</div>
              </div>
            </div>
            
            <div style="padding: 1.5rem; background: rgba(26, 29, 41, 0.1); border-radius: 12px; margin-bottom: 1.5rem;">
              <div style="font-size: 14px; opacity: 0.8; margin-bottom: 0.5rem;">Issued On</div>
              <div style="font-size: 16px; font-weight: 600;">${new Date(cert.issued_date).toLocaleDateString()}</div>
            </div>
            
            <div style="display: flex; gap: 1rem;">
              <button class="btn-secondary" onclick="downloadCertificate('${cert.certificate_id}')" style="flex: 1; justify-content: center; background: rgba(26, 29, 41, 0.2); color: #1a1d29; border: none;">
                <i class="fas fa-download"></i> Download
              </button>
              <button class="btn-secondary" onclick="verifyCertificateById('${cert.certificate_id}')" style="flex: 1; justify-content: center; background: rgba(26, 29, 41, 0.2); color: #1a1d29; border: none;">
                <i class="fas fa-shield-alt"></i> Verify
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    ` : '<p style="text-align: center; color: var(--text-secondary); padding: 3rem;">No certificates yet. Complete modules to earn certificates!</p>';
  } catch (error) {
    console.error('Failed to load certificates:', error);
  }
}

function generateCertificate() {
  const certType = prompt('Enter certificate type:\n\n1. "Completion" - Certificate of Internship Completion\n2. "Mastery" - Certificate of Skill Mastery\n\nType 1 or 2:');
  
  const types = { '1': 'Completion', '2': 'Mastery' };
  const certificateType = types[certType];
  
  if (certificateType) {
    axios.post('/api/certificates/generate', {
      studentId: AppState.currentUser.id,
      certificateType
    }).then(response => {
      const { certificateId, verifyUrl } = response.data;
      alert(`🎉 Certificate Generated!\n\nCertificate ID: ${certificateId}\n\nVerification Link:\n${verifyUrl}`);
      loadCertificates();
    }).catch(() => {
      alert('❌ Failed to generate certificate.');
    });
  }
}

function downloadCertificate(certId) {
  alert(`📥 Download certificate: ${certId}\n\n(Certificate PDF generation will be implemented)`);
}

function verifyCertificateById(certId) {
  window.open(`/verify/${certId}`, '_blank');
}

// ============================================
// PROGRESS PAGE
// ============================================

function renderProgress() {
  return `
    ${renderHeader('My Progress')}
    <div class="main-content">
      <div id="progressContent" class="loader">Loading progress...</div>
    </div>
  `;
}

async function loadProgress() {
  try {
    const response = await axios.get(`/api/dashboard/${AppState.currentUser.id}`);
    const { stats } = response.data;
    
    const content = document.getElementById('progressContent');
    const overallProgress = stats.overallProgress || 0;
    const circumference = 2 * Math.PI * 90;
    const offset = circumference - (overallProgress / 100) * circumference;
    
    content.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
        <div style="background: var(--card-bg); border-radius: 20px; padding: 2.5rem; text-align: center;">
          <div style="display: inline-block; position: relative;">
            <svg width="250" height="250">
              <circle cx="125" cy="125" r="90" fill="none" stroke="var(--secondary-bg)" stroke-width="16"></circle>
              <circle cx="125" cy="125" r="90" fill="none" stroke="var(--accent-yellow)" stroke-width="16" 
                stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
                transform="rotate(-90 125 125)"></circle>
            </svg>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
              <div style="font-size: 64px; font-weight: 800; color: var(--text-primary);">${overallProgress}%</div>
              <div style="font-size: 16px; color: var(--text-secondary); margin-top: 4px;">Complete</div>
            </div>
          </div>
          <div style="font-size: 20px; font-weight: 600; color: var(--text-secondary); margin-top: 2rem;">Overall Progress</div>
        </div>
        
        <div>
          <div style="background: var(--card-bg); border-radius: 20px; padding: 2rem; margin-bottom: 1.5rem;">
            <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 1.5rem;">Learning Statistics</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem;">
              <div style="text-align: center; padding: 1.5rem; background: var(--secondary-bg); border-radius: 12px;">
                <div style="font-size: 40px; color: var(--accent-yellow); margin-bottom: 0.5rem;"><i class="fas fa-book-open"></i></div>
                <div style="font-size: 32px; font-weight: 800; margin-bottom: 0.25rem;">${stats.completedLessons}</div>
                <div style="font-size: 14px; color: var(--text-secondary);">Lessons Completed</div>
              </div>
              <div style="text-align: center; padding: 1.5rem; background: var(--secondary-bg); border-radius: 12px;">
                <div style="font-size: 40px; color: var(--accent-yellow); margin-bottom: 0.5rem;"><i class="fas fa-tasks"></i></div>
                <div style="font-size: 32px; font-weight: 800; margin-bottom: 0.25rem;">${stats.submittedAssignments}</div>
                <div style="font-size: 14px; color: var(--text-secondary);">Assignments Submitted</div>
              </div>
              <div style="text-align: center; padding: 1.5rem; background: var(--secondary-bg); border-radius: 12px;">
                <div style="font-size: 40px; color: var(--accent-yellow); margin-bottom: 0.5rem;"><i class="fas fa-clock"></i></div>
                <div style="font-size: 32px; font-weight: 800; margin-bottom: 0.25rem;">24</div>
                <div style="font-size: 14px; color: var(--text-secondary);">Hours Learned</div>
              </div>
              <div style="text-align: center; padding: 1.5rem; background: var(--secondary-bg); border-radius: 12px;">
                <div style="font-size: 40px; color: var(--accent-yellow); margin-bottom: 0.5rem;"><i class="fas fa-trophy"></i></div>
                <div style="font-size: 32px; font-weight: 800; margin-bottom: 0.25rem;">5</div>
                <div style="font-size: 14px; color: var(--text-secondary);">Achievements</div>
              </div>
            </div>
          </div>
          
          <div style="background: var(--card-bg); border-radius: 20px; padding: 2rem;">
            <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 1.5rem;">Achievements Unlocked</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
              ${['🤖 First Robot Built', '💻 Code Master', '✅ Team Player', '💡 Problem Solver'].map(badge => `
                <div style="text-align: center; padding: 1.5rem; background: var(--secondary-bg); border-radius: 12px;">
                  <div style="font-size: 48px; margin-bottom: 0.5rem;">${badge.split(' ')[0]}</div>
                  <div style="font-size: 14px; color: var(--text-secondary);">${badge.split(' ').slice(1).join(' ')}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Failed to load progress:', error);
  }
}

// ============================================
// CERTIFICATE VERIFICATION PAGE
// ============================================

function renderVerifyCertificate() {
  return `
    ${renderHeader('Verify Certificate')}
    <div class="main-content">
      <div style="max-width: 600px; margin: 0 auto;">
        <div style="background: var(--card-bg); border-radius: 20px; padding: 3rem; text-align: center;">
          <div style="font-size: 64px; color: var(--accent-yellow); margin-bottom: 1rem;">
            <i class="fas fa-shield-alt"></i>
          </div>
          <h1 style="font-size: 32px; font-weight: 800; margin-bottom: 1rem;">Verify Certificate</h1>
          <p style="color: var(--text-secondary); font-size: 16px; margin-bottom: 2rem;">Enter the certificate ID to verify its authenticity</p>
          
          <form onsubmit="verifyCertificate(event)">
            <input type="text" id="certId" placeholder="PB-IOT-2025-XXXXX" required
              style="width: 100%; padding: 16px; background: var(--secondary-bg); border: 2px solid var(--border-color); border-radius: 12px; color: white; font-size: 18px; text-align: center; font-weight: 600; margin-bottom: 1.5rem;" />
            <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; font-size: 18px; padding: 18px;">
              <i class="fas fa-check-circle"></i> Verify Certificate
            </button>
          </form>
          
          <div id="verifyResult" style="margin-top: 2rem;"></div>
        </div>
      </div>
    </div>
  `;
}

async function verifyCertificate(e) {
  e.preventDefault();
  const certId = document.getElementById('certId').value;
  const resultDiv = document.getElementById('verifyResult');
  
  try {
    const response = await axios.get(`/api/verify/${certId}`);
    const { certificate } = response.data;
    
    resultDiv.innerHTML = `
      <div style="background: rgba(34, 197, 94, 0.1); border: 2px solid #22c55e; border-radius: 12px; padding: 2rem; margin-top: 2rem;">
        <div style="font-size: 48px; color: #22c55e; margin-bottom: 1rem;">✓</div>
        <h3 style="font-size: 24px; font-weight: 700; color: #22c55e; margin-bottom: 1rem;">Valid Certificate</h3>
        <div style="text-align: left;">
          <p style="margin-bottom: 0.5rem;"><strong>Name:</strong> ${certificate.full_name}</p>
          <p style="margin-bottom: 0.5rem;"><strong>Email:</strong> ${certificate.email}</p>
          <p style="margin-bottom: 0.5rem;"><strong>University:</strong> ${certificate.university}</p>
          <p style="margin-bottom: 0.5rem;"><strong>Type:</strong> ${certificate.certificate_type}</p>
          <p style="margin-bottom: 0.5rem;"><strong>Issued:</strong> ${new Date(certificate.issued_date).toLocaleDateString()}</p>
        </div>
      </div>
    `;
  } catch (error) {
    resultDiv.innerHTML = `
      <div style="background: rgba(239, 68, 68, 0.1); border: 2px solid #ef4444; border-radius: 12px; padding: 2rem; margin-top: 2rem;">
        <div style="font-size: 48px; color: #ef4444; margin-bottom: 1rem;">✗</div>
        <h3 style="font-size: 24px; font-weight: 700; color: #ef4444; margin-bottom: 0.5rem;">Invalid Certificate</h3>
        <p style="color: var(--text-secondary);">This certificate ID was not found in our system.</p>
      </div>
    `;
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function renderHeader(title) {
  return `
    <div style="position: sticky; top: 0; z-index: 100; background: var(--secondary-bg); border-bottom: 1px solid var(--border-color);">
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 1.5rem 2rem;">
        <div style="display: flex; align-items: center; gap: 1.5rem;">
          <div style="width: 50px; height: 50px; background: var(--accent-yellow); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #1a1d29;">
            <i class="fas fa-robot"></i>
          </div>
          <div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 2px;">PassionBots LMS</div>
            <h1 style="font-size: 24px; font-weight: 700;">${title}</h1>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 1.5rem;">
          <button onclick="navigateTo('dashboard')" class="btn-secondary" style="padding: 10px 20px;">
            <i class="fas fa-home"></i> Dashboard
          </button>
          <div style="width: 40px; height: 40px; background: var(--accent-yellow); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; color: #1a1d29; cursor: pointer;" onclick="logout()">
            ${AppState.currentUser ? AppState.currentUser.full_name[0] : 'U'}
          </div>
        </div>
      </div>
    </div>
  `;
}

function navigateTo(view) {
  AppState.currentView = view;
  renderView();
}

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    AppState.currentUser = null;
    AppState.isLoggedIn = false;
    AppState.currentView = 'login';
    renderView();
  }
}

console.log('✅ PassionBots LMS App Loaded Successfully');
