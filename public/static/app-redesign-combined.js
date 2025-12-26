// ============================================
// PASSIONBOTS LMS v7.0 - REDESIGNED UI
// Professional + Playful Experience
// ============================================

// Application State
const AppState = {
  currentUser: null,
  isLoggedIn: false,
  currentView: 'login',
  modules: [],
  selectedModule: null,
  selectedLesson: null,
  selectedGrade: null,
  curriculumData: null
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  renderView();
  initAnimations();
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
    case 'curriculum':
      app.innerHTML = renderCurriculumBrowser();
      loadCurriculumGrades();
      break;
    case 'modules':
      app.innerHTML = renderModules();
      loadModules();
      break;
    case 'sessions':
      app.innerHTML = renderSessions();
      loadSessions();
      break;
    case 'progress':
      app.innerHTML = renderProgress();
      loadProgress();
      break;
    default:
      app.innerHTML = renderLogin();
  }
  
  // Trigger animations
  setTimeout(() => initAnimations(), 100);
}

// ============================================
// MODERN LOGIN PAGE
// ============================================

function renderLogin() {
  return `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
      
      <!-- Animated Shapes Background -->
      <div style="position: absolute; top: 10%; left: 10%; width: 300px; height: 300px; background: var(--gradient-purple); border-radius: 50%; opacity: 0.1; filter: blur(80px); animation: float 6s ease-in-out infinite;"></div>
      <div style="position: absolute; bottom: 10%; right: 10%; width: 400px; height: 400px; background: var(--gradient-blue); border-radius: 50%; opacity: 0.1; filter: blur(80px); animation: float 8s ease-in-out infinite reverse;"></div>
      
      <div class="container" style="position: relative; z-index: 1;">
        <div style="max-width: 480px; margin: 0 auto;">
          
          <!-- Logo & Welcome -->
          <div class="text-center mb-xl animate-fadeIn">
            <div class="float" style="width: 100px; height: 100px; background: var(--gradient-purple); border-radius: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; box-shadow: var(--shadow-lg), var(--shadow-glow);">
              <i class="fas fa-robot" style="font-size: 3rem; color: white;"></i>
            </div>
            <h1 class="gradient-text" style="font-size: 3rem; font-weight: 900; margin-bottom: 0.5rem;">PassionBots</h1>
            <p style="font-size: 1.25rem; color: var(--text-secondary); font-weight: 500;">IoT & Robotics Learning Platform</p>
            <div style="display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 1rem;">
              <span class="badge badge-primary"><i class="fas fa-users"></i> 1000+ Students</span>
              <span class="badge badge-success"><i class="fas fa-book"></i> 624 Sessions</span>
            </div>
          </div>
          
          <!-- Login Card -->
          <div class="card glass animate-scaleIn" style="padding: 3rem; box-shadow: var(--shadow-lg);">
            <h2 style="font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; text-align: center;">Welcome Back! 👋</h2>
            <p style="text-align: center; color: var(--text-secondary); margin-bottom: 2rem;">Sign in to continue your robotics journey</p>
            
            <form id="loginForm" onsubmit="handleLogin(event)">
              <!-- Email Input -->
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-envelope" style="color: var(--primary-purple);"></i> Email Address
                </label>
                <input 
                  type="email" 
                  id="email" 
                  class="form-input"
                  placeholder="your.email@example.com"
                  value="demo@student.com"
                  required
                >
              </div>
              
              <!-- Password Input -->
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-lock" style="color: var(--primary-purple);"></i> Password
                </label>
                <input 
                  type="password" 
                  id="password" 
                  class="form-input"
                  placeholder="••••••••"
                  value="demo123"
                  required
                >
              </div>
              
              <!-- Role Selection -->
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-user-tag" style="color: var(--primary-purple);"></i> I am a
                </label>
                <select id="role" class="form-select" required>
                  <option value="student">🎓 Student</option>
                  <option value="mentor">👨‍🏫 Mentor / Teacher</option>
                </select>
              </div>
              
              <!-- Remember Me -->
              <div class="flex-between" style="margin-bottom: 2rem;">
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                  <input type="checkbox" class="form-checkbox">
                  <span style="font-size: 0.875rem; color: var(--text-secondary);">Remember me</span>
                </label>
                <a href="#" style="font-size: 0.875rem; color: var(--primary-purple); text-decoration: none; font-weight: 600;">Forgot password?</a>
              </div>
              
              <!-- Login Button -->
              <button type="submit" class="btn btn-primary btn-lg w-full">
                <i class="fas fa-sign-in-alt"></i>
                Sign In
              </button>
              
              <!-- Demo Credentials -->
              <div style="margin-top: 2rem; padding: 1rem; background: rgba(102, 126, 234, 0.1); border-radius: 12px; border: 1px solid rgba(102, 126, 234, 0.2);">
                <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 0; text-align: center;">
                  <i class="fas fa-info-circle"></i> <strong>Demo Credentials:</strong><br>
                  Student: demo@student.com / demo123<br>
                  Mentor: mentor@passionbots.in / mentor123
                </p>
              </div>
            </form>
          </div>
          
          <!-- Footer Links -->
          <div class="text-center" style="margin-top: 2rem; color: var(--text-muted); font-size: 0.875rem;">
            <p>Don't have an account? <a href="#" style="color: var(--primary-purple); font-weight: 600; text-decoration: none;">Request Access</a></p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Handle Login
async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;
  
  // Show loading
  const submitBtn = event.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
  submitBtn.disabled = true;
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });
    
    const data = await response.json();
    
    // API returns data.student or data.mentor based on role
    const user = data.student || data.mentor;
    
    if (response.ok && user) {
      AppState.currentUser = {
        ...user,
        name: user.full_name || user.name,
        role: role
      };
      AppState.isLoggedIn = true;
      AppState.currentView = 'dashboard';
      renderView();
    } else {
      alert('❌ ' + (data.error || 'Invalid credentials'));
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  } catch (error) {
    alert('❌ Login failed. Please try again.');
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

// ============================================
// MODERN DASHBOARD
// ============================================

function renderDashboard() {
  const userName = AppState.currentUser?.name || 'Student';
  const userRole = AppState.currentUser?.role || 'student';
  const userInitial = userName.charAt(0).toUpperCase();
  
  return `
    ${renderHeader()}
    
    <div class="main-content">
      <div class="container">
        
        <!-- Welcome Hero -->
        <div class="card-gradient" style="padding: 3rem; border-radius: 24px; margin-bottom: 2rem; position: relative; overflow: hidden;">
          <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(255,255,255,0.1); border-radius: 50%; filter: blur(60px);"></div>
          <div style="position: relative; z-index: 1;">
            <div class="flex-between">
              <div>
                <h1 style="font-size: 2.5rem; font-weight: 800; margin-bottom: 0.5rem; color: white;">
                  Welcome back, ${userName}! 🚀
                </h1>
                <p style="font-size: 1.125rem; color: rgba(255,255,255,0.9); margin-bottom: 0;">
                  Ready to continue your robotics journey?
                </p>
              </div>
              <div class="float" style="width: 100px; height: 100px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-rocket" style="font-size: 3rem; color: white;"></i>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Stats Grid -->
        <div class="grid grid-4 mb-lg">
          <div class="stat-card animate-fadeIn" style="animation-delay: 0.1s;">
            <div class="stat-icon"><i class="fas fa-book-open"></i></div>
            <div class="stat-value" id="totalCourses">0</div>
            <div class="stat-label">Active Courses</div>
          </div>
          
          <div class="stat-card animate-fadeIn" style="animation-delay: 0.2s;">
            <div class="stat-icon"><i class="fas fa-clock"></i></div>
            <div class="stat-value" id="hoursLearned">0</div>
            <div class="stat-label">Hours Learned</div>
          </div>
          
          <div class="stat-card animate-fadeIn" style="animation-delay: 0.3s;">
            <div class="stat-icon"><i class="fas fa-trophy"></i></div>
            <div class="stat-value" id="badgesEarned">0</div>
            <div class="stat-label">Badges Earned</div>
          </div>
          
          <div class="stat-card animate-fadeIn" style="animation-delay: 0.4s;">
            <div class="stat-icon"><i class="fas fa-fire"></i></div>
            <div class="stat-value" id="streakDays">0</div>
            <div class="stat-label">Day Streak</div>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <h3 class="mb-md" style="font-size: 1.5rem; font-weight: 700;">Quick Actions</h3>
        <div class="grid grid-4 mb-xl">
          ${renderQuickAction('curriculum', 'graduation-cap', 'Curriculum Browser', 'Browse all grades & sessions', 'var(--gradient-purple)', '0.1s')}
          ${renderQuickAction('modules', 'book', 'My Courses', 'Continue learning', 'var(--gradient-blue)', '0.2s')}
          ${renderQuickAction('sessions', 'video', 'Live Sessions', 'Join Zoom classes', 'var(--gradient-orange)', '0.3s')}
          ${renderQuickAction('progress', 'chart-line', 'My Progress', 'Track your journey', 'var(--gradient-green)', '0.4s')}
        </div>
        
        <!-- Recent Activity -->
        <div class="grid grid-3">
          <!-- Recent Modules -->
          <div class="card" style="grid-column: span 2;">
            <div class="flex-between mb-md">
              <h3 style="font-size: 1.25rem; font-weight: 700;">
                <i class="fas fa-history" style="color: var(--primary-purple);"></i> Continue Learning
              </h3>
              <a href="#" onclick="navigateTo('modules')" class="btn btn-sm btn-secondary">View All</a>
            </div>
            <div id="recentModules" class="loader"></div>
          </div>
          
          <!-- Upcoming Sessions -->
          <div class="card">
            <h3 class="mb-md" style="font-size: 1.25rem; font-weight: 700;">
              <i class="fas fa-calendar-alt" style="color: var(--accent-blue);"></i> Upcoming
            </h3>
            <div id="upcomingSessions">
              <div class="skeleton" style="height: 80px; margin-bottom: 1rem;"></div>
              <div class="skeleton" style="height: 80px; margin-bottom: 1rem;"></div>
              <div class="skeleton" style="height: 80px;"></div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  `;
}

function renderQuickAction(view, icon, title, desc, gradient, delay) {
  return `
    <div class="card hover-lift animate-fadeIn" onclick="navigateTo('${view}')" 
         style="cursor: pointer; animation-delay: ${delay}; border: 2px solid transparent;">
      <div style="width: 64px; height: 64px; background: ${gradient}; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
        <i class="fas fa-${icon}" style="font-size: 2rem; color: white;"></i>
      </div>
      <div class="card-title">${title}</div>
      <div class="card-text">${desc}</div>
    </div>
  `;
}

// Load Dashboard Data
async function loadDashboardData() {
  try {
    // Mock data for demo
    document.getElementById('totalCourses').textContent = '3';
    document.getElementById('hoursLearned').textContent = '24';
    document.getElementById('badgesEarned').textContent = '12';
    document.getElementById('streakDays').textContent = '7';
    
    // Load recent modules
    const modulesContainer = document.getElementById('recentModules');
    modulesContainer.innerHTML = `
      <div class="grid gap-md">
        ${renderModuleCard('Kindergarten', 'My Robot Friends', 65, 'var(--gradient-purple)')}
        ${renderModuleCard('Grade 1', 'Little Engineers', 42, 'var(--gradient-blue)')}
        ${renderModuleCard('Grade 2', 'Smart Robots', 28, 'var(--gradient-green)')}
      </div>
    `;
    
    // Load upcoming sessions
    const sessionsContainer = document.getElementById('upcomingSessions');
    sessionsContainer.innerHTML = `
      ${renderUpcomingSession('KG Week 1', 'Jan 20, 10:00 AM', 'video')}
      ${renderUpcomingSession('Grade 1 Week 2', 'Jan 21, 2:00 PM', 'video')}
      ${renderUpcomingSession('Grade 2 Week 3', 'Jan 22, 4:00 PM', 'video')}
    `;
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  }
}

function renderModuleCard(grade, title, progress, gradient) {
  return `
    <div class="card" style="padding: 1.5rem;">
      <div class="flex gap-md">
        <div style="width: 60px; height: 60px; background: ${gradient}; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <i class="fas fa-robot" style="font-size: 1.5rem; color: white;"></i>
        </div>
        <div style="flex: 1;">
          <div class="badge badge-primary mb-xs">${grade}</div>
          <h4 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem;">${title}</h4>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%;"></div>
          </div>
          <div class="flex-between mt-xs">
            <span style="font-size: 0.75rem; color: var(--text-secondary);">${progress}% Complete</span>
            <a href="#" class="btn btn-sm btn-primary" onclick="navigateTo('modules')">Continue</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderUpcomingSession(title, time, icon) {
  return `
    <div class="card" style="padding: 1rem; margin-bottom: 0.75rem;">
      <div class="flex gap-sm">
        <div style="width: 40px; height: 40px; background: rgba(102, 126, 234, 0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
          <i class="fas fa-${icon}" style="color: var(--primary-purple);"></i>
        </div>
        <div>
          <div style="font-size: 0.875rem; font-weight: 600; margin-bottom: 0.25rem;">${title}</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary);">
            <i class="fas fa-clock"></i> ${time}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================
// MODERN HEADER / NAVIGATION
// ============================================

function renderHeader() {
  const userName = AppState.currentUser?.name || 'User';
  const userInitial = userName.charAt(0).toUpperCase();
  
  return `
    <header class="header">
      <div class="header-left">
        <a href="#" class="logo" onclick="navigateTo('dashboard')">
          <div class="logo-icon">
            <i class="fas fa-robot"></i>
          </div>
          <span class="logo-text">PassionBots</span>
        </a>
        
        <nav>
          <ul class="nav-links">
            <li><a href="#" class="nav-link ${AppState.currentView === 'dashboard' ? 'active' : ''}" onclick="navigateTo('dashboard')">
              <i class="fas fa-home"></i> Dashboard
            </a></li>
            <li><a href="#" class="nav-link ${AppState.currentView === 'curriculum' ? 'active' : ''}" onclick="navigateTo('curriculum')">
              <i class="fas fa-graduation-cap"></i> Curriculum
            </a></li>
            <li><a href="#" class="nav-link ${AppState.currentView === 'modules' ? 'active' : ''}" onclick="navigateTo('modules')">
              <i class="fas fa-book"></i> Courses
            </a></li>
            <li><a href="#" class="nav-link ${AppState.currentView === 'sessions' ? 'active' : ''}" onclick="navigateTo('sessions')">
              <i class="fas fa-video"></i> Live Sessions
            </a></li>
          </ul>
        </nav>
      </div>
      
      <div class="header-right">
        <button class="btn-icon btn-secondary">
          <i class="fas fa-bell"></i>
        </button>
        
        <div class="user-menu" onclick="logout()">
          <div class="user-avatar">${userInitial}</div>
          <div>
            <div class="user-name">${userName}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary);">Sign Out</div>
          </div>
        </div>
      </div>
    </header>
  `;
}

// Continue in next file...

// ============================================
// PART 2 - Additional Functions
// ============================================
            </p>
          </div>
          <button class="btn btn-primary">
            <i class="fas fa-download"></i> Download Curriculum Guide
          </button>
        </div>
        
        <!-- Stats Overview -->
        <div class="grid grid-4 mb-xl">
          <div class="stat-card" style="background: var(--gradient-purple);">
            <div class="stat-value" style="color: white;">13</div>
            <div class="stat-label" style="color: rgba(255,255,255,0.9);">Total Grades</div>
          </div>
          <div class="stat-card" style="background: var(--gradient-blue);">
            <div class="stat-value" style="color: white;" id="totalSessions">624</div>
            <div class="stat-label" style="color: rgba(255,255,255,0.9);">Total Sessions</div>
          </div>
          <div class="stat-card" style="background: var(--gradient-green);">
            <div class="stat-value" style="color: white;">144</div>
            <div class="stat-label" style="color: rgba(255,255,255,0.9);">Phase 1 Complete</div>
          </div>
          <div class="stat-card" style="background: var(--gradient-orange);">
            <div class="stat-value" style="color: white;">5-17</div>
            <div class="stat-label" style="color: rgba(255,255,255,0.9);">Age Range</div>
          </div>
        </div>
        
        <!-- Grades Grid -->
        <div id="gradesContainer" class="loader" style="text-align: center; padding: 3rem;">
          <div class="loader"></div>
          <p style="margin-top: 1rem; color: var(--text-secondary);">Loading curriculum...</p>
        </div>
        
        <!-- Module Details Modal -->
        <div id="moduleDetails" class="hidden"></div>
        
        <!-- Session Details Modal -->
        <div id="sessionDetails" class="hidden"></div>
        
      </div>
    </div>
  `;
}

async function loadCurriculumGrades() {
  try {
    const response = await fetch('/api/curriculum/grades');
    const grades = await response.json();
    
    const container = document.getElementById('gradesContainer');
    container.innerHTML = `
      <div class="grid grid-3">
        ${grades.map((grade, index) => renderGradeCard(grade, index)).join('')}
      </div>
    `;
  } catch (error) {
    console.error('Failed to load grades:', error);
    document.getElementById('gradesContainer').innerHTML = `
      <div class="card text-center" style="padding: 3rem;">
        <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: var(--accent-orange); margin-bottom: 1rem;"></i>
        <p style="color: var(--text-secondary);">Failed to load curriculum. Please try again.</p>
        <button class="btn btn-primary mt-md" onclick="loadCurriculumGrades()">Retry</button>
      </div>
    `;
  }
}

function renderGradeCard(grade, index) {
  const gradients = [
    'var(--gradient-purple)',
    'var(--gradient-blue)',
    'var(--gradient-orange)',
    'var(--gradient-green)',
    'var(--gradient-red)'
  ];
  const gradient = gradients[index % gradients.length];
  
  const gradeIcon = grade.grade_code === 'KG' ? 'child' : 'user-graduate';
  
  return `
    <div class="card hover-lift animate-fadeIn" onclick="loadGradeModules(${grade.id}, '${grade.grade_name}')" 
         style="cursor: pointer; animation-delay: ${index * 0.1}s;">
      
      <!-- Grade Header -->
      <div style="background: ${gradient}; padding: 2rem; border-radius: 12px 12px 0 0; margin: -1.5rem -1.5rem 1rem -1.5rem; position: relative; overflow: hidden;">
        <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; filter: blur(40px);"></div>
        <div style="position: relative; z-index: 1;">
          <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; backdrop-filter: blur(10px);">
            <i class="fas fa-${gradeIcon}" style="font-size: 1.75rem; color: white;"></i>
          </div>
          <h3 style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 0.25rem;">
            ${grade.grade_name}
          </h3>
          <p style="color: rgba(255,255,255,0.9); font-size: 0.875rem; margin: 0;">
            ${grade.grade_code === 'KG' ? 'Kindergarten' : 'Grade ' + grade.grade_code}
          </p>
        </div>
      </div>
      
      <!-- Grade Info -->
      <div>
        <p style="color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.6;">
          ${grade.description || 'Comprehensive robotics curriculum'}
        </p>
        
        <div class="flex gap-sm" style="margin-bottom: 1rem;">
          <span class="badge badge-primary">
            <i class="fas fa-users"></i> Age ${grade.age_range}
          </span>
          <span class="badge badge-success">
            <i class="fas fa-book"></i> 48 Sessions
          </span>
        </div>
        
        <div style="padding: 1rem; background: var(--bg-secondary); border-radius: 8px; margin-bottom: 1rem;">
          <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Theme</div>
          <div style="font-weight: 600; color: var(--text-primary);">
            <i class="fas fa-star" style="color: var(--accent-yellow);"></i> ${grade.theme || 'Robotics & IoT'}
          </div>
        </div>
        
        <button class="btn btn-secondary w-full">
          <i class="fas fa-arrow-right"></i> View Curriculum
        </button>
      </div>
    </div>
  `;
}

async function loadGradeModules(gradeId, gradeName) {
  try {
    const response = await fetch(\`/api/curriculum/grade/\${gradeId}/modules\`);
    const modules = await response.json();
    
    if (modules.length === 0) {
      alert(\`📚 No modules available for \${gradeName} yet. Coming soon!\`);
      return;
    }
    
    // Show modules in a modal or new view
    showModulesModal(gradeName, modules);
  } catch (error) {
    console.error('Failed to load modules:', error);
    alert('Failed to load modules. Please try again.');
  }
}

function showModulesModal(gradeName, modules) {
  const modal = document.getElementById('moduleDetails');
  modal.className = 'animate-fadeIn';
  modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 1000; overflow-y: auto; padding: 2rem;';
  
  modal.innerHTML = `
    <div class="container" style="max-width: 1000px; margin: 2rem auto;">
      <div class="card" style="padding: 3rem; position: relative;">
        
        <!-- Close Button -->
        <button onclick="closeModal()" class="btn-icon btn-secondary" style="position: absolute; top: 1.5rem; right: 1.5rem;">
          <i class="fas fa-times"></i>
        </button>
        
        <!-- Header -->
        <div class="mb-xl">
          <div class="badge badge-primary mb-sm">${gradeName}</div>
          <h2 class="gradient-text" style="font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem;">
            Course Modules
          </h2>
          <p style="color: var(--text-secondary);">
            ${modules.length} module${modules.length > 1 ? 's' : ''} available
          </p>
        </div>
        
        <!-- Modules List -->
        <div class="grid gap-lg">
          ${modules.map((module, index) => renderModuleDetail(module, index)).join('')}
        </div>
        
        <div class="text-center mt-xl">
          <button onclick="closeModal()" class="btn btn-secondary">
            <i class="fas fa-arrow-left"></i> Back to Grades
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderModuleDetail(module, index) {
  return `
    <div class="card animate-slideInLeft" style="animation-delay: ${index * 0.1}s; cursor: pointer;" 
         onclick="loadModuleSessions(${module.id}, '${module.title}')">
      <div class="flex gap-md">
        <div style="width: 80px; height: 80px; background: var(--gradient-purple); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <div style="font-size: 2rem; font-weight: 800; color: white;">${module.module_number}</div>
        </div>
        <div style="flex: 1;">
          <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">${module.title}</h3>
          <p style="color: var(--text-secondary); margin-bottom: 1rem; font-size: 0.875rem;">
            ${module.description}
          </p>
          <div class="flex gap-sm" style="flex-wrap: wrap;">
            <span class="badge badge-primary">
              <i class="fas fa-book"></i> ${module.total_sessions} Sessions
            </span>
            <span class="badge badge-success">
              <i class="fas fa-calendar"></i> ${module.duration_weeks} Weeks
            </span>
            <span class="badge badge-warning">
              <i class="fas fa-lightbulb"></i> ${module.theme}
            </span>
          </div>
        </div>
        <div style="display: flex; align-items: center;">
          <i class="fas fa-chevron-right" style="color: var(--primary-purple); font-size: 1.5rem;"></i>
        </div>
      </div>
    </div>
  `;
}

async function loadModuleSessions(moduleId, moduleTitle) {
  try {
    const response = await fetch(\`/api/curriculum/module/\${moduleId}/sessions\`);
    const sessions = await response.json();
    
    if (sessions.length === 0) {
      alert('📝 No sessions available for this module yet.');
      return;
    }
    
    showSessionsModal(moduleTitle, sessions);
  } catch (error) {
    console.error('Failed to load sessions:', error);
    alert('Failed to load sessions. Please try again.');
  }
}

function showSessionsModal(moduleTitle, sessions) {
  const modal = document.getElementById('sessionDetails');
  modal.className = 'animate-fadeIn';
  modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 1001; overflow-y: auto; padding: 2rem;';
  
  const projectSessions = sessions.filter(s => s.is_project);
  
  modal.innerHTML = `
    <div class="container" style="max-width: 1200px; margin: 2rem auto;">
      <div class="card" style="padding: 3rem; position: relative;">
        
        <!-- Close Button -->
        <button onclick="closeSessionsModal()" class="btn-icon btn-secondary" style="position: absolute; top: 1.5rem; right: 1.5rem;">
          <i class="fas fa-times"></i>
        </button>
        
        <!-- Header -->
        <div class="mb-xl">
          <button onclick="closeSessionsModal()" class="btn btn-sm btn-secondary mb-sm">
            <i class="fas fa-arrow-left"></i> Back
          </button>
          <h2 class="gradient-text" style="font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem;">
            ${moduleTitle}
          </h2>
          <div class="flex gap-sm">
            <span class="badge badge-primary">${sessions.length} Total Sessions</span>
            <span class="badge badge-success">${projectSessions.length} Projects</span>
          </div>
        </div>
        
        <!-- Sessions Grid -->
        <div class="grid grid-2">
          ${sessions.map((session, index) => renderSessionCard(session, index)).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderSessionCard(session, index) {
  const objectives = JSON.parse(session.objectives || '[]');
  
  return `
    <div class="card animate-scaleIn" style="animation-delay: ${(index % 6) * 0.05}s; ${session.is_project ? 'border: 2px solid var(--accent-yellow);' : ''}">
      <div class="flex-between mb-md">
        <div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.25rem;">
            Session ${session.session_number}
          </div>
          <h4 style="font-size: 1rem; font-weight: 700; margin: 0;">
            ${session.title}
          </h4>
        </div>
        ${session.is_project ? '<span class="badge badge-project pulse"><i class="fas fa-star"></i> PROJECT</span>' : ''}
      </div>
      
      <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 1rem;">
        ${session.description}
      </p>
      
      ${objectives.length > 0 ? \`
        <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
          <div style="font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.5rem;">
            <i class="fas fa-bullseye"></i> Learning Objectives:
          </div>
          <ul style="margin: 0; padding-left: 1.25rem; font-size: 0.875rem; color: var(--text-primary);">
            \${objectives.slice(0, 3).map(obj => \`<li>\${obj}</li>\`).join('')}
          </ul>
        </div>
      \` : ''}
      
      <div class="flex-between">
        <span style="font-size: 0.75rem; color: var(--text-secondary);">
          <i class="fas fa-clock"></i> ${session.duration_minutes} min
        </span>
        <button class="btn btn-sm btn-primary">
          <i class="fas fa-play"></i> Start
        </button>
      </div>
    </div>
  `;
}

function closeModal() {
  document.getElementById('moduleDetails').className = 'hidden';
}

function closeSessionsModal() {
  document.getElementById('sessionDetails').className = 'hidden';
}

// ============================================
// NAVIGATION & UTILITIES
// ============================================

function navigateTo(view) {
  AppState.currentView = view;
  renderView();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function logout() {
  if (confirm('Are you sure you want to sign out?')) {
    AppState.currentUser = null;
    AppState.isLoggedIn = false;
    AppState.currentView = 'login';
    renderView();
  }
}

// Initialize animations on page load
function initAnimations() {
  // Add stagger animation to grid items
  const gridItems = document.querySelectorAll('.grid > *');
  gridItems.forEach((item, index) => {
    if (!item.style.animationDelay) {
      item.style.animationDelay = \`\${index * 0.1}s\`;
    }
  });
}

// Add smooth transitions between views
document.addEventListener('click', (e) => {
  if (e.target.tagName === 'A' && e.target.getAttribute('href') === '#') {
    e.preventDefault();
  }
});

// ============================================
// MODULES PAGE (Continue Learning)
// ============================================

function renderModules() {
  return \`
    \${renderHeader()}
    
    <div class="main-content">
      <div class="container">
        <h1 class="gradient-text mb-md">My Courses</h1>
        <p class="mb-xl" style="font-size: 1.125rem; color: var(--text-secondary);">
          Continue your robotics learning journey
        </p>
        
        <div id="modulesGrid" class="grid grid-3">
          <div class="skeleton" style="height: 300px;"></div>
          <div class="skeleton" style="height: 300px;"></div>
          <div class="skeleton" style="height: 300px;"></div>
        </div>
      </div>
    </div>
  \`;
}

async function loadModules() {
  // Mock data - replace with actual API call
  const modulesGrid = document.getElementById('modulesGrid');
  modulesGrid.innerHTML = renderModuleCard('Kindergarten', 'My Robot Friends', 65, 'var(--gradient-purple)') +
                          renderModuleCard('Grade 1', 'Little Engineers', 42, 'var(--gradient-blue)') +
                          renderModuleCard('Grade 2', 'Smart Robots', 28, 'var(--gradient-green)');
}

// ============================================
// LIVE SESSIONS PAGE
// ============================================

function renderSessions() {
  return \`
    \${renderHeader()}
    
    <div class="main-content">
      <div class="container">
        <div class="flex-between mb-xl">
          <div>
            <h1 class="gradient-text mb-sm">Live Zoom Sessions</h1>
            <p style="font-size: 1.125rem; color: var(--text-secondary);">
              Join interactive robotics classes
            </p>
          </div>
          <button class="btn btn-primary">
            <i class="fas fa-calendar-plus"></i> Schedule Session
          </button>
        </div>
        
        <div id="sessionsGrid" class="grid grid-2">
          <div class="skeleton" style="height: 200px;"></div>
          <div class="skeleton" style="height: 200px;"></div>
        </div>
      </div>
    </div>
  \`;
}

async function loadSessions() {
  try {
    const response = await fetch('/api/sessions');
    const sessions = await response.json();
    
    const grid = document.getElementById('sessionsGrid');
    if (sessions.length === 0) {
      grid.innerHTML = \`
        <div class="card text-center" style="grid-column: span 2; padding: 3rem;">
          <i class="fas fa-video" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
          <p style="color: var(--text-secondary);">No live sessions scheduled yet.</p>
        </div>
      \`;
      return;
    }
    
    grid.innerHTML = sessions.map(session => renderLiveSessionCard(session)).join('');
  } catch (error) {
    console.error('Failed to load sessions:', error);
  }
}

function renderLiveSessionCard(session) {
  const sessionDate = new Date(session.session_date);
  const now = new Date();
  const isLive = Math.abs(sessionDate - now) < 3600000; // Within 1 hour
  const isPast = sessionDate < now;
  
  return \`
    <div class="card \${isLive ? 'glow' : ''}">
      \${isLive ? '<span class="badge badge-danger pulse" style="position: absolute; top: 1rem; right: 1rem;"><i class="fas fa-circle"></i> LIVE NOW</span>' : ''}
      
      <div style="width: 60px; height: 60px; background: var(--gradient-purple); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
        <i class="fas fa-video" style="font-size: 1.5rem; color: white;"></i>
      </div>
      
      <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">\${session.title}</h3>
      <p style="color: var(--text-secondary); margin-bottom: 1rem; font-size: 0.875rem;">
        \${session.description}
      </p>
      
      <div class="flex gap-sm mb-md">
        <span class="badge badge-primary">
          <i class="fas fa-calendar"></i> \${sessionDate.toLocaleDateString()}
        </span>
        <span class="badge badge-success">
          <i class="fas fa-clock"></i> \${sessionDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </span>
      </div>
      
      \${!isPast && session.meeting_url ? \`
        <a href="\${session.meeting_url}" target="_blank" class="btn btn-primary w-full">
          <i class="fas fa-video"></i> Join Zoom Session
        </a>
      \` : isPast && session.recording_url ? \`
        <a href="\${session.recording_url}" target="_blank" class="btn btn-secondary w-full">
          <i class="fas fa-play-circle"></i> Watch Recording
        </a>
      \` : ''}
    </div>
  \`;
}

// ============================================
// PROGRESS PAGE
// ============================================

function renderProgress() {
  return \`
    \${renderHeader()}
    
    <div class="main-content">
      <div class="container">
        <h1 class="gradient-text mb-xl">My Progress</h1>
        
        <div class="card" style="padding: 3rem; text-align: center;">
          <i class="fas fa-chart-line" style="font-size: 4rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
          <h3 style="margin-bottom: 0.5rem;">Progress Tracking Coming Soon</h3>
          <p style="color: var(--text-secondary);">Track your learning journey, badges, and achievements.</p>
        </div>
      </div>
    </div>
  \`;
}

async function loadProgress() {
  // Implement progress loading
}

console.log('🚀 PassionBots LMS v7.0 - Redesigned UI Loaded!');
