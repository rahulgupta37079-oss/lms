// ============================================
// CURRICULUM BROWSER - REDESIGNED
// ============================================

function renderCurriculumBrowser() {
  return `
    ${renderHeader()}
    
    <div class="main-content">
      <div class="container">
        
        <!-- Page Header -->
        <div class="flex-between mb-xl">
          <div>
            <h1 class="gradient-text" style="font-size: 2.5rem; font-weight: 800; margin-bottom: 0.5rem;">
              Curriculum Browser
            </h1>
            <p style="font-size: 1.125rem; color: var(--text-secondary);">
              Explore our comprehensive K-12 Robotics & IoT curriculum
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
