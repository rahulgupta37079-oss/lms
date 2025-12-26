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
