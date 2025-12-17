// Global state
let currentStudent = {
    id: 1,
    full_name: 'Demo Student',
    email: 'demo@student.com'
};
let modules = [];

// Make functions globally available
window.showApp = showApp;
window.showMyCourses = showMyCourses;
window.viewCourse = viewCourse;
window.logout = logout;

// Show main app
function showApp(section = 'dashboard') {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const appContainer = document.getElementById('appContainer');
    
    if (welcomeScreen) {
        welcomeScreen.classList.add('hidden');
    }
    if (appContainer) {
        appContainer.classList.add('active');
    }
    
    // Small delay to ensure DOM is ready
    setTimeout(() => {
        if (section) {
            showSection(section);
        } else {
            loadDashboard();
        }
    }, 100);
}

function showMyCourses() {
    showApp('courses');
}

// Navigation
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    
    // Sidebar navigation
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    console.log('Found sidebar items:', sidebarItems.length);
    
    sidebarItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            console.log('Clicked section:', section);
            if (section) {
                showSection(section);
            }
        });
    });
});

function showSection(section) {
    console.log('Showing section:', section);
    
    // Update sidebar active state
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === section) {
            item.classList.add('active');
        }
    });
    
    // Update content
    document.querySelectorAll('.content-section').forEach(content => {
        content.classList.remove('active');
    });
    
    const sectionElement = document.getElementById(section + 'Section');
    console.log('Section element:', sectionElement);
    
    if (sectionElement) {
        sectionElement.classList.add('active');
    }
    
    // Update page title
    const titles = {
        dashboard: 'My Learning Dashboard',
        courses: 'All Courses',
        schedule: 'My Schedule',
        progress: 'My Progress & Achievements',
        settings: 'Settings'
    };
    
    const pageTitleEl = document.getElementById('pageTitle');
    if (pageTitleEl) {
        pageTitleEl.textContent = titles[section] || 'Dashboard';
    }
    
    // Load section data
    switch(section) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'courses':
            loadAllCourses();
            break;
        case 'progress':
            loadProgress();
            break;
    }
}

// Load dashboard data
async function loadDashboard() {
    console.log('Loading dashboard...');
    try {
        // Load modules for courses
        const response = await axios.get(`/api/modules/${currentStudent.id}`);
        modules = response.data;
        console.log('Loaded modules:', modules.length);
        
        renderCourses();
    } catch (error) {
        console.error('Failed to load dashboard:', error);
        const grid = document.getElementById('coursesGrid');
        if (grid) {
            grid.innerHTML = '<p style="color: var(--text-secondary);">Error loading courses. Please refresh.</p>';
        }
    }
}

// Render course cards
function renderCourses() {
    const grid = document.getElementById('coursesGrid');
    console.log('Rendering courses, grid element:', grid);
    
    if (!grid) {
        console.error('coursesGrid element not found!');
        return;
    }
    
    if (!modules || modules.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-secondary);">No courses available yet.</p>';
        return;
    }
    
    // Show first 3 courses
    const coursesToShow = modules.slice(0, 3);
    
    grid.innerHTML = coursesToShow.map(module => {
        const progress = module.total_lessons > 0 
            ? Math.round((module.completed_lessons / module.total_lessons) * 100) 
            : 0;
        
        const icons = ['🤖', '💻', '🔧', '📡', '🎯', '☁️', '🚀', '🎓'];
        const icon = icons[module.module_number - 1] || '📚';
        
        return `
            <div class="course-card" onclick="viewCourse(${module.id})">
                <div class="course-image">
                    ${icon}
                </div>
                <div class="course-content">
                    <h3 class="course-title">${module.title}</h3>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="course-progress">
                        <span class="course-progress-text">
                            ${module.completed_lessons} of ${module.total_lessons} lessons
                        </span>
                        <span class="course-progress-percent">${progress}%</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    console.log('Rendered', coursesToShow.length, 'courses');
}

// Load all courses
async function loadAllCourses() {
    console.log('Loading all courses...');
    try {
        if (modules.length === 0) {
            const response = await axios.get(`/api/modules/${currentStudent.id}`);
            modules = response.data;
        }
        
        const grid = document.getElementById('allCoursesGrid');
        
        if (!grid) {
            console.error('allCoursesGrid element not found!');
            return;
        }
        
        grid.innerHTML = modules.map(module => {
            const progress = module.total_lessons > 0 
                ? Math.round((module.completed_lessons / module.total_lessons) * 100) 
                : 0;
            
            const icons = ['🤖', '💻', '🔧', '📡', '🎯', '☁️', '🚀', '🎓'];
            const icon = icons[module.module_number - 1] || '📚';
            
            return `
                <div class="course-card" onclick="viewCourse(${module.id})">
                    <div class="course-image">
                        ${icon}
                    </div>
                    <div class="course-content">
                        <h3 class="course-title">${module.title}</h3>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="course-progress">
                            <span class="course-progress-text">
                                ${module.completed_lessons} of ${module.total_lessons} lessons
                            </span>
                            <span class="course-progress-percent">${progress}%</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        console.log('Rendered all courses');
    } catch (error) {
        console.error('Failed to load courses:', error);
    }
}

// Load progress page
async function loadProgress() {
    console.log('Loading progress...');
    try {
        const response = await axios.get(`/api/dashboard/${currentStudent.id}`);
        const { stats } = response.data;
        
        const progressContent = document.getElementById('progressContent');
        
        if (!progressContent) {
            console.error('progressContent element not found!');
            return;
        }
        
        const overallProgress = stats.overallProgress || 0;
        const circumference = 2 * Math.PI * 90;
        const offset = circumference - (overallProgress / 100) * circumference;
        
        progressContent.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <div style="background: var(--card-bg); border-radius: 20px; padding: 2rem;">
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <div style="display: inline-block; position: relative;">
                            <svg width="250" height="250">
                                <circle cx="125" cy="125" r="90" fill="none" stroke="var(--secondary-bg)" stroke-width="16"></circle>
                                <circle cx="125" cy="125" r="90" fill="none" stroke="var(--accent-yellow)" stroke-width="16" 
                                    stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
                                    transform="rotate(-90 125 125)"></circle>
                            </svg>
                            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                                <div style="font-size: 56px; font-weight: 800; color: var(--text-primary);">${overallProgress}%</div>
                                <div style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">Complete</div>
                            </div>
                        </div>
                        <div style="font-size: 18px; color: var(--text-secondary); margin-top: 1rem;">Foundation</div>
                    </div>
                </div>
                
                <div>
                    <div style="background: var(--card-bg); border-radius: 20px; padding: 2rem; margin-bottom: 1.5rem;">
                        <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 1.5rem;">Learning Statistics</h3>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem;">
                            <div style="text-align: center;">
                                <div style="width: 60px; height: 60px; background: rgba(253, 176, 34, 0.1); border-radius: 12px; 
                                    display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem; 
                                    font-size: 28px; color: var(--accent-yellow);">
                                    <i class="fas fa-clock"></i>
                                </div>
                                <div style="font-size: 32px; font-weight: 800; color: var(--text-primary); margin-bottom: 0.25rem;">24</div>
                                <div style="font-size: 14px; color: var(--text-secondary);">Hours</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="width: 60px; height: 60px; background: rgba(253, 176, 34, 0.1); border-radius: 12px; 
                                    display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem; 
                                    font-size: 28px; color: var(--accent-yellow);">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                                <div style="font-size: 32px; font-weight: 800; color: var(--text-primary); margin-bottom: 0.25rem;">${stats.completedLessons}</div>
                                <div style="font-size: 14px; color: var(--text-secondary);">Modules<br>Completed</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="width: 60px; height: 60px; background: rgba(253, 176, 34, 0.1); border-radius: 12px; 
                                    display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem; 
                                    font-size: 28px; color: var(--accent-yellow);">
                                    <i class="fas fa-tasks"></i>
                                </div>
                                <div style="font-size: 32px; font-weight: 800; color: var(--text-primary); margin-bottom: 0.25rem;">${stats.submittedAssignments}</div>
                                <div style="font-size: 14px; color: var(--text-secondary);">Activities<br>Finished</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="width: 60px; height: 60px; background: rgba(253, 176, 34, 0.1); border-radius: 12px; 
                                    display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem; 
                                    font-size: 28px; color: var(--accent-yellow);">
                                    <i class="fas fa-lightbulb"></i>
                                </div>
                                <div style="font-size: 32px; font-weight: 800; color: var(--text-primary); margin-bottom: 0.25rem;">∞</div>
                                <div style="font-size: 14px; color: var(--text-secondary);">Problem<br>Solver</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: var(--card-bg); border-radius: 20px; padding: 2rem;">
                        <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 1.5rem;">Achievements Unlocked</h3>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem;">
                            <div style="text-align: center; padding: 1rem; background: var(--secondary-bg); border-radius: 12px;">
                                <div style="font-size: 48px; margin-bottom: 0.5rem;">🤖</div>
                                <div style="font-size: 14px; color: var(--text-secondary);">First Robot<br>Built</div>
                            </div>
                            <div style="text-align: center; padding: 1rem; background: var(--secondary-bg); border-radius: 12px;">
                                <div style="font-size: 48px; margin-bottom: 0.5rem;">💻</div>
                                <div style="font-size: 14px; color: var(--text-secondary);">Code Master</div>
                            </div>
                            <div style="text-align: center; padding: 1rem; background: var(--secondary-bg); border-radius: 12px;">
                                <div style="font-size: 48px; margin-bottom: 0.5rem;">✅</div>
                                <div style="font-size: 14px; color: var(--text-secondary);">Team Player</div>
                            </div>
                            <div style="text-align: center; padding: 1rem; background: var(--secondary-bg); border-radius: 12px;">
                                <div style="font-size: 48px; margin-bottom: 0.5rem;">💡</div>
                                <div style="font-size: 14px; color: var(--text-secondary);">Problem Solver</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        console.log('Progress page rendered');
    } catch (error) {
        console.error('Failed to load progress:', error);
    }
}

// View course details
function viewCourse(moduleId) {
    console.log('Viewing course:', moduleId);
    const module = modules.find(m => m.id === moduleId);
    if (module) {
        alert(`Course: ${module.title}\n\nModule ${module.module_number}: ${module.description}\n\nProgress: ${module.completed_lessons} of ${module.total_lessons} lessons completed`);
    } else {
        alert('Course details coming soon! Module ID: ' + moduleId);
    }
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        location.reload();
    }
}

console.log('App.js loaded successfully');
