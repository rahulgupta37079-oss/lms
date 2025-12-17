// Global state
let currentStudent = null;
let currentModuleId = null;
let currentLessonId = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    const savedStudent = localStorage.getItem('student');
    if (savedStudent) {
        currentStudent = JSON.parse(savedStudent);
        showMainApp();
    }
    
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
});

// Login handler
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await axios.post('/api/auth/login', { email, password });
        
        if (response.data.success) {
            currentStudent = response.data.student;
            localStorage.setItem('student', JSON.stringify(currentStudent));
            showMainApp();
        }
    } catch (error) {
        alert('Login failed. Please check your credentials.');
    }
}

// Logout handler
function logout() {
    localStorage.removeItem('student');
    currentStudent = null;
    location.reload();
}

// Show main app
function showMainApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('studentName').textContent = currentStudent.full_name;
    
    loadDashboard();
    loadAnnouncements();
}

// Load dashboard data
async function loadDashboard() {
    try {
        const response = await axios.get(`/api/dashboard/${currentStudent.id}`);
        const { stats, upcomingSessions } = response.data;
        
        // Update stats
        document.getElementById('overallProgress').textContent = stats.overallProgress + '%';
        document.getElementById('completedLessons').textContent = stats.completedLessons;
        document.getElementById('totalLessons').textContent = `of ${stats.totalLessons} lessons`;
        document.getElementById('inProgressLessons').textContent = stats.inProgressLessons;
        document.getElementById('submittedAssignments').textContent = stats.submittedAssignments;
        document.getElementById('totalAssignments').textContent = `of ${stats.totalAssignments} submitted`;
        
        // Display upcoming sessions
        const sessionsList = document.getElementById('upcomingSessionsList');
        if (upcomingSessions.length === 0) {
            sessionsList.innerHTML = '<p class="text-gray-500">No upcoming sessions scheduled.</p>';
        } else {
            sessionsList.innerHTML = upcomingSessions.map(session => `
                <div class="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg mb-3">
                    <div class="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                        <i class="fas fa-video"></i>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-semibold text-gray-800">${session.title}</h4>
                        <p class="text-sm text-gray-600 mt-1">${session.description || ''}</p>
                        <div class="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span><i class="far fa-calendar mr-1"></i>${formatDate(session.session_date)}</span>
                            <span><i class="far fa-clock mr-1"></i>${session.duration_minutes} mins</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Failed to load dashboard:', error);
    }
}

// Load announcements
async function loadAnnouncements() {
    try {
        const response = await axios.get('/api/announcements');
        const announcements = response.data;
        
        const announcementsList = document.getElementById('announcementsList');
        if (announcements.length === 0) {
            announcementsList.innerHTML = '<p class="text-gray-500">No announcements yet.</p>';
        } else {
            announcementsList.innerHTML = announcements.slice(0, 3).map(ann => {
                const priorityColors = {
                    high: 'bg-red-100 text-red-800',
                    medium: 'bg-yellow-100 text-yellow-800',
                    low: 'bg-green-100 text-green-800'
                };
                return `
                    <div class="border-l-4 ${ann.priority === 'high' ? 'border-red-500' : ann.priority === 'medium' ? 'border-yellow-500' : 'border-green-500'} pl-4 py-2 mb-3">
                        <div class="flex items-center justify-between mb-1">
                            <h4 class="font-semibold text-gray-800">${ann.title}</h4>
                            <span class="text-xs px-2 py-1 rounded ${priorityColors[ann.priority]}">${ann.priority.toUpperCase()}</span>
                        </div>
                        <p class="text-sm text-gray-600">${ann.content}</p>
                        <p class="text-xs text-gray-400 mt-1">${formatDate(ann.published_at)}</p>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Failed to load announcements:', error);
    }
}

// Load modules/courses
async function loadModules() {
    try {
        const response = await axios.get(`/api/modules/${currentStudent.id}`);
        const modules = response.data;
        
        const modulesList = document.getElementById('modulesList');
        modulesList.innerHTML = modules.map(module => {
            const progress = module.total_lessons > 0 
                ? Math.round((module.completed_lessons / module.total_lessons) * 100) 
                : 0;
            
            return `
                <div class="bg-white rounded-xl shadow-sm p-6 card-hover border border-gray-100 cursor-pointer" onclick="loadModuleDetails(${module.id})">
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex items-center space-x-3">
                            <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-lg">
                                ${module.module_number}
                            </div>
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800">${module.title}</h3>
                                <p class="text-sm text-gray-600">${module.duration_weeks} week${module.duration_weeks > 1 ? 's' : ''}</p>
                            </div>
                        </div>
                        <span class="text-sm font-medium ${progress === 100 ? 'text-green-600' : 'text-indigo-600'}">
                            ${progress}%
                        </span>
                    </div>
                    <p class="text-sm text-gray-600 mb-4">${module.description}</p>
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600">
                            <i class="fas fa-book-open mr-2"></i>${module.completed_lessons} of ${module.total_lessons} lessons
                        </span>
                        <div class="w-32 bg-gray-200 rounded-full h-2">
                            <div class="bg-indigo-600 h-2 rounded-full" style="width: ${progress}%"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Failed to load modules:', error);
    }
}

// Load module details
async function loadModuleDetails(moduleId) {
    currentModuleId = moduleId;
    
    try {
        const response = await axios.get(`/api/modules/${moduleId}/lessons/${currentStudent.id}`);
        const { module, lessons } = response.data;
        
        const moduleDetails = document.getElementById('moduleDetails');
        moduleDetails.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm p-8 mb-6 border border-gray-100">
                <div class="flex items-center space-x-4 mb-4">
                    <div class="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-2xl">
                        ${module.module_number}
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800">${module.title}</h2>
                        <p class="text-gray-600">${module.duration_weeks} week${module.duration_weeks > 1 ? 's' : ''} duration</p>
                    </div>
                </div>
                <p class="text-gray-700">${module.description}</p>
            </div>
            
            <h3 class="text-xl font-semibold text-gray-800 mb-4">Lessons</h3>
            <div class="space-y-3">
                ${lessons.map(lesson => {
                    const statusIcons = {
                        completed: '<i class="fas fa-check-circle text-green-600"></i>',
                        in_progress: '<i class="fas fa-spinner text-blue-600"></i>',
                        not_started: '<i class="far fa-circle text-gray-400"></i>'
                    };
                    const status = lesson.status || 'not_started';
                    
                    return `
                        <div class="bg-white rounded-lg shadow-sm p-4 card-hover border border-gray-100 cursor-pointer flex items-center justify-between"
                             onclick="loadLesson(${lesson.id})">
                            <div class="flex items-center space-x-4">
                                <div class="text-2xl">${statusIcons[status]}</div>
                                <div>
                                    <h4 class="font-semibold text-gray-800">Lesson ${lesson.lesson_number}: ${lesson.title}</h4>
                                    <p class="text-sm text-gray-600">${lesson.description || ''}</p>
                                    <span class="text-xs text-gray-500">
                                        <i class="far fa-clock mr-1"></i>${lesson.duration_minutes} mins
                                    </span>
                                </div>
                            </div>
                            <div>
                                ${status === 'completed' 
                                    ? '<span class="text-sm text-green-600 font-medium">Completed</span>' 
                                    : status === 'in_progress'
                                    ? `<span class="text-sm text-blue-600 font-medium">${lesson.progress_percentage}%</span>`
                                    : '<span class="text-sm text-gray-400">Start</span>'
                                }
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        showTab('moduleDetails');
    } catch (error) {
        console.error('Failed to load module details:', error);
    }
}

// Load lesson
async function loadLesson(lessonId) {
    currentLessonId = lessonId;
    
    try {
        const response = await axios.get(`/api/lessons/${lessonId}/${currentStudent.id}`);
        const { lesson, progress } = response.data;
        
        const lessonContent = document.getElementById('lessonContent');
        lessonContent.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                <h2 class="text-2xl font-bold text-gray-800 mb-2">${lesson.title}</h2>
                <p class="text-gray-600 mb-6">${lesson.description}</p>
                
                ${lesson.video_url ? `
                    <div class="mb-6">
                        <div class="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg">
                            <iframe src="${lesson.video_url}" class="w-full h-96 rounded-lg" allowfullscreen></iframe>
                        </div>
                    </div>
                ` : ''}
                
                <div class="prose max-w-none mb-6">
                    <div class="bg-gray-50 p-6 rounded-lg">
                        <h3 class="text-lg font-semibold text-gray-800 mb-3">Lesson Content</h3>
                        <p class="text-gray-700 whitespace-pre-line">${lesson.content || 'Content will be available soon.'}</p>
                    </div>
                </div>
                
                ${lesson.resources ? `
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-3">Resources</h3>
                        <div class="space-y-2">
                            <a href="#" class="block text-indigo-600 hover:text-indigo-700">
                                <i class="fas fa-file-pdf mr-2"></i>Download Lesson Materials
                            </a>
                        </div>
                    </div>
                ` : ''}
                
                <div class="flex items-center justify-between pt-6 border-t border-gray-200">
                    <div class="flex items-center space-x-4">
                        <button onclick="markComplete()" 
                            class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
                            <i class="fas fa-check mr-2"></i>Mark as Complete
                        </button>
                        ${progress.status === 'completed' ? `
                            <span class="text-green-600 font-medium">
                                <i class="fas fa-check-circle mr-2"></i>Completed on ${formatDate(progress.completed_at)}
                            </span>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('lessonView').classList.remove('hidden');
        document.getElementById('moduleDetailsView').classList.add('hidden');
        
        // Update last accessed
        if (progress.status === 'not_started') {
            updateProgress('in_progress', 10);
        }
    } catch (error) {
        console.error('Failed to load lesson:', error);
    }
}

// Mark lesson as complete
async function markComplete() {
    try {
        await updateProgress('completed', 100);
        alert('Lesson marked as complete!');
        backToModule();
    } catch (error) {
        console.error('Failed to mark complete:', error);
    }
}

// Update progress
async function updateProgress(status, progressPercentage) {
    try {
        await axios.post('/api/progress/update', {
            studentId: currentStudent.id,
            lessonId: currentLessonId,
            status,
            progressPercentage
        });
    } catch (error) {
        console.error('Failed to update progress:', error);
    }
}

// Back to module
function backToModule() {
    document.getElementById('lessonView').classList.add('hidden');
    loadModuleDetails(currentModuleId);
}

// Load assignments
async function loadAssignments() {
    try {
        const response = await axios.get(`/api/assignments/${currentStudent.id}`);
        const assignments = response.data;
        
        const assignmentsList = document.getElementById('assignmentsList');
        if (assignments.length === 0) {
            assignmentsList.innerHTML = '<p class="text-gray-500">No assignments yet.</p>';
        } else {
            assignmentsList.innerHTML = assignments.map(assignment => {
                const statusColors = {
                    pending: 'bg-yellow-100 text-yellow-800',
                    reviewed: 'bg-green-100 text-green-800',
                    resubmit: 'bg-red-100 text-red-800'
                };
                const isSubmitted = assignment.submission_id !== null;
                const isOverdue = new Date(assignment.due_date) < new Date() && !isSubmitted;
                
                return `
                    <div class="bg-white rounded-xl shadow-sm p-6 mb-4 border border-gray-100">
                        <div class="flex items-start justify-between mb-4">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800">${assignment.title}</h3>
                                <p class="text-sm text-gray-600">Module: ${assignment.module_title}</p>
                            </div>
                            ${isSubmitted ? `
                                <span class="px-3 py-1 rounded-full text-sm ${statusColors[assignment.submission_status]}">
                                    ${assignment.submission_status.charAt(0).toUpperCase() + assignment.submission_status.slice(1)}
                                    ${assignment.score ? ` - ${assignment.score}/${assignment.max_score}` : ''}
                                </span>
                            ` : isOverdue ? `
                                <span class="px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">Overdue</span>
                            ` : `
                                <span class="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">Not Submitted</span>
                            `}
                        </div>
                        <p class="text-gray-700 mb-4">${assignment.description}</p>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600">
                                <i class="far fa-calendar mr-2"></i>Due: ${formatDate(assignment.due_date)}
                            </span>
                            ${!isSubmitted ? `
                                <button onclick="showSubmitModal(${assignment.id})" 
                                    class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                                    Submit Assignment
                                </button>
                            ` : assignment.submission_status === 'reviewed' ? `
                                <span class="text-green-600 font-medium">
                                    <i class="fas fa-check-circle mr-2"></i>Reviewed
                                </span>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Failed to load assignments:', error);
    }
}

// Load live sessions
async function loadSessions() {
    try {
        const response = await axios.get('/api/sessions');
        const sessions = response.data;
        
        const sessionsList = document.getElementById('sessionsList');
        if (sessions.length === 0) {
            sessionsList.innerHTML = '<p class="text-gray-500">No sessions scheduled yet.</p>';
        } else {
            const now = new Date();
            const upcoming = sessions.filter(s => new Date(s.session_date) > now);
            const past = sessions.filter(s => new Date(s.session_date) <= now);
            
            let html = '';
            
            if (upcoming.length > 0) {
                html += '<h3 class="text-lg font-semibold text-gray-800 mb-4">Upcoming Sessions</h3>';
                html += upcoming.map(session => renderSession(session, true)).join('');
            }
            
            if (past.length > 0) {
                html += '<h3 class="text-lg font-semibold text-gray-800 mb-4 mt-8">Past Sessions</h3>';
                html += past.map(session => renderSession(session, false)).join('');
            }
            
            sessionsList.innerHTML = html;
        }
    } catch (error) {
        console.error('Failed to load sessions:', error);
    }
}

function renderSession(session, isUpcoming) {
    return `
        <div class="bg-white rounded-xl shadow-sm p-6 mb-4 border border-gray-100">
            <div class="flex items-start justify-between mb-4">
                <div>
                    <h3 class="text-lg font-semibold text-gray-800">${session.title}</h3>
                    <p class="text-sm text-gray-600">Module: ${session.module_title}</p>
                    <p class="text-sm text-gray-700 mt-2">${session.description || ''}</p>
                </div>
                ${isUpcoming ? `
                    <span class="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">Upcoming</span>
                ` : session.recording_url ? `
                    <span class="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">Recording Available</span>
                ` : `
                    <span class="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">Completed</span>
                `}
            </div>
            <div class="flex items-center justify-between">
                <div class="space-y-1">
                    <div class="text-sm text-gray-600">
                        <i class="far fa-calendar mr-2"></i>${formatDate(session.session_date)}
                    </div>
                    <div class="text-sm text-gray-600">
                        <i class="far fa-clock mr-2"></i>${session.duration_minutes} minutes
                    </div>
                </div>
                ${session.meeting_url && isUpcoming ? `
                    <a href="${session.meeting_url}" target="_blank"
                        class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                        <i class="fas fa-video mr-2"></i>Join Session
                    </a>
                ` : session.recording_url ? `
                    <a href="${session.recording_url}" target="_blank"
                        class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                        <i class="fas fa-play mr-2"></i>Watch Recording
                    </a>
                ` : ''}
            </div>
        </div>
    `;
}

// Load certificates
async function loadCertificates() {
    try {
        const response = await axios.get(`/api/certificates/${currentStudent.id}`);
        const certificates = response.data;
        
        const certificatesList = document.getElementById('certificatesList');
        if (certificates.length === 0) {
            certificatesList.innerHTML = `
                <div class="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
                    <i class="fas fa-certificate text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-800 mb-2">No Certificates Yet</h3>
                    <p class="text-gray-600">Complete the program to earn your certificates!</p>
                </div>
            `;
        } else {
            certificatesList.innerHTML = certificates.map(cert => {
                const typeInfo = {
                    internship: { icon: 'fa-graduation-cap', title: 'Internship Completion Certificate', color: 'indigo' },
                    skill: { icon: 'fa-award', title: 'Skill Mastery Certificate', color: 'purple' }
                };
                const info = typeInfo[cert.certificate_type];
                
                return `
                    <div class="bg-white rounded-xl shadow-sm p-6 mb-4 border border-gray-100">
                        <div class="flex items-center space-x-4">
                            <div class="w-16 h-16 bg-${info.color}-100 rounded-xl flex items-center justify-center">
                                <i class="fas ${info.icon} text-3xl text-${info.color}-600"></i>
                            </div>
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold text-gray-800">${info.title}</h3>
                                <p class="text-sm text-gray-600">Certificate ID: ${cert.certificate_id}</p>
                                <p class="text-sm text-gray-600">Issued: ${formatDate(cert.issued_date)}</p>
                            </div>
                            <div class="space-x-2">
                                <button class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                                    <i class="fas fa-download mr-2"></i>Download
                                </button>
                                <a href="/api/verify/${cert.certificate_id}" target="_blank"
                                    class="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                                    <i class="fas fa-check-circle mr-2"></i>Verify
                                </a>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Failed to load certificates:', error);
    }
}

// Load forum
async function loadForum() {
    try {
        const response = await axios.get('/api/forum');
        const posts = response.data;
        
        const forumList = document.getElementById('forumList');
        if (posts.length === 0) {
            forumList.innerHTML = '<p class="text-gray-500">No forum posts yet. Be the first to start a discussion!</p>';
        } else {
            forumList.innerHTML = posts.map(post => `
                <div class="bg-white rounded-xl shadow-sm p-6 mb-4 border border-gray-100 cursor-pointer hover:shadow-md transition"
                     onclick="viewForumPost(${post.id})">
                    <div class="flex items-start justify-between mb-2">
                        <h3 class="text-lg font-semibold text-gray-800">${post.title}</h3>
                        ${post.is_pinned ? '<span class="text-yellow-500"><i class="fas fa-thumbtack"></i></span>' : ''}
                    </div>
                    <p class="text-sm text-gray-600 mb-3">${post.content.substring(0, 150)}...</p>
                    <div class="flex items-center justify-between text-sm text-gray-600">
                        <div class="space-x-4">
                            <span><i class="fas fa-user mr-1"></i>${post.author_name}</span>
                            ${post.module_title ? `<span><i class="fas fa-book mr-1"></i>${post.module_title}</span>` : ''}
                        </div>
                        <div class="space-x-4">
                            <span><i class="fas fa-comments mr-1"></i>${post.reply_count} replies</span>
                            <span><i class="fas fa-eye mr-1"></i>${post.views_count} views</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Failed to load forum:', error);
    }
}

// Load hardware kit status
async function loadHardwareKit() {
    try {
        const response = await axios.get(`/api/hardware/${currentStudent.id}`);
        const kit = response.data;
        
        const hardwareStatus = document.getElementById('hardwareStatus');
        
        if (kit.delivery_status === 'not_applicable') {
            hardwareStatus.innerHTML = `
                <div class="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
                    <i class="fas fa-info-circle text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-800 mb-2">Learning-Only Program</h3>
                    <p class="text-gray-600">You are enrolled in the Learning-Only program. Hardware kit is not included.</p>
                    <button class="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
                        Upgrade to Premium Kit
                    </button>
                </div>
            `;
        } else {
            const statusInfo = {
                pending: { icon: 'fa-box', title: 'Preparing Your Kit', color: 'yellow', message: 'Your ESP32 hardware kit is being prepared for shipment.' },
                shipped: { icon: 'fa-shipping-fast', title: 'Kit Shipped', color: 'blue', message: 'Your kit is on the way!' },
                delivered: { icon: 'fa-check-circle', title: 'Kit Delivered', color: 'green', message: 'Your kit has been successfully delivered.' }
            };
            const info = statusInfo[kit.delivery_status];
            
            hardwareStatus.innerHTML = `
                <div class="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                    <div class="flex items-center space-x-4 mb-6">
                        <div class="w-20 h-20 bg-${info.color}-100 rounded-xl flex items-center justify-center">
                            <i class="fas ${info.icon} text-4xl text-${info.color}-600"></i>
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold text-gray-800">${info.title}</h3>
                            <p class="text-gray-600">${info.message}</p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-6">
                        <div>
                            <label class="text-sm font-medium text-gray-600">Kit Type</label>
                            <p class="text-gray-800 font-semibold">${kit.kit_type}</p>
                        </div>
                        ${kit.tracking_number ? `
                            <div>
                                <label class="text-sm font-medium text-gray-600">Tracking Number</label>
                                <p class="text-gray-800 font-semibold">${kit.tracking_number}</p>
                            </div>
                        ` : ''}
                        ${kit.shipped_date ? `
                            <div>
                                <label class="text-sm font-medium text-gray-600">Shipped Date</label>
                                <p class="text-gray-800 font-semibold">${formatDate(kit.shipped_date)}</p>
                            </div>
                        ` : ''}
                        ${kit.delivered_date ? `
                            <div>
                                <label class="text-sm font-medium text-gray-600">Delivered Date</label>
                                <p class="text-gray-800 font-semibold">${formatDate(kit.delivered_date)}</p>
                            </div>
                        ` : ''}
                    </div>
                    
                    ${kit.delivery_address ? `
                        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
                            <label class="text-sm font-medium text-gray-600">Delivery Address</label>
                            <p class="text-gray-800 mt-1">${kit.delivery_address}</p>
                        </div>
                    ` : ''}
                    
                    <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 class="font-semibold text-gray-800 mb-2">
                            <i class="fas fa-box-open text-blue-600 mr-2"></i>What's in Your Kit
                        </h4>
                        <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                            <li>ESP32 Microcontroller with WiFi & Bluetooth</li>
                            <li>Temperature & Humidity Sensor (DHT11/DHT22)</li>
                            <li>Ultrasonic Distance Sensor (HC-SR04)</li>
                            <li>IR Sensor Module</li>
                            <li>Servo Motor & DC Motors</li>
                            <li>LED Display & RGB LEDs</li>
                            <li>Breadboard & Jumper Wires</li>
                            <li>USB Cable & Power Adapter</li>
                        </ul>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Failed to load hardware kit:', error);
    }
}

// Tab navigation
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Remove active state from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('bg-indigo-50', 'text-indigo-600');
        item.classList.add('text-gray-700');
    });
    
    // Show selected tab
    const tabs = {
        dashboard: 'dashboardTab',
        courses: 'coursesTab',
        moduleDetails: 'moduleDetailsView',
        assignments: 'assignmentsTab',
        sessions: 'sessionsTab',
        certificates: 'certificatesTab',
        forum: 'forumTab',
        hardware: 'hardwareTab'
    };
    
    const tabElement = document.getElementById(tabs[tabName]);
    if (tabElement) {
        tabElement.classList.remove('hidden');
    }
    
    // Load data for the tab
    switch(tabName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'courses':
            loadModules();
            break;
        case 'assignments':
            loadAssignments();
            break;
        case 'sessions':
            loadSessions();
            break;
        case 'certificates':
            loadCertificates();
            break;
        case 'forum':
            loadForum();
            break;
        case 'hardware':
            loadHardwareKit();
            break;
    }
}

// Utility function to format dates
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
