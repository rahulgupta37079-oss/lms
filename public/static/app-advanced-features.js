// ============================================
// PASSIONBOTS LMS v8.0 - ADVANCED FEATURES
// Certificates, Quizzes, Assignments, Messaging
// ============================================

// ============================================
// CERTIFICATES
// ============================================

function renderCertificates() {
  return `
    <div class="dashboard-container">
      <!-- Header -->
      <div class="flex-between mb-4">
        <div>
          <h1 class="gradient-text" style="font-size: 3rem; font-weight: 900; margin-bottom: 0.5rem;">
            🏆 My Certificates
          </h1>
          <p style="color: var(--text-secondary); font-size: 1.1rem;">
            Your achievements and accomplishments
          </p>
        </div>
        <button onclick="generateCertificate()" class="btn btn-primary">
          <i class="fas fa-award"></i> Generate Certificate
        </button>
      </div>

      <!-- Stats -->
      <div class="stats-grid" style="margin-bottom: 2rem;">
        <div class="stat-card">
          <div class="stat-value" id="totalCertificates">0</div>
          <div class="stat-label">Total Certificates</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" id="verifiedCertificates">0</div>
          <div class="stat-label">Verified</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" id="latestCertificate">-</div>
          <div class="stat-label">Latest</div>
        </div>
      </div>

      <!-- Certificates Grid -->
      <div id="certificatesGrid" class="grid grid-3">
        <div class="loader"></div>
      </div>
    </div>
  `;
}

async function loadCertificates() {
  try {
    const studentId = AppState.currentUser?.id || 1;
    const response = await fetch(`/api/certificates/${studentId}`);
    const certificates = await response.json();

    // Update stats
    document.getElementById('totalCertificates').textContent = certificates.length;
    document.getElementById('verifiedCertificates').textContent = certificates.filter(c => c.is_verified).length;
    if (certificates.length > 0) {
      const latest = new Date(certificates[0].issued_date).toLocaleDateString();
      document.getElementById('latestCertificate').textContent = latest;
    }

    // Render certificates
    const grid = document.getElementById('certificatesGrid');
    if (certificates.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem;">
          <i class="fas fa-award" style="font-size: 4rem; color: var(--primary-yellow); opacity: 0.3;"></i>
          <h3 style="margin-top: 1rem; color: var(--text-secondary);">No certificates yet</h3>
          <p style="color: var(--text-muted);">Complete courses to earn certificates</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = certificates.map(cert => renderCertificateCard(cert)).join('');
  } catch (error) {
    console.error('Failed to load certificates:', error);
    alert('Failed to load certificates. Please try again.');
  }
}

function renderCertificateCard(cert) {
  return `
    <div class="card animate-fadeIn" style="text-align: center;">
      <div class="card-icon" style="margin: 0 auto 1rem; width: 80px; height: 80px; font-size: 2.5rem;">
        <i class="fas fa-certificate"></i>
      </div>
      <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">${cert.certificate_type}</h3>
      <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 1rem;">
        Issued: ${new Date(cert.issued_date).toLocaleDateString()}
      </p>
      <div style="background: var(--bg-secondary); padding: 0.75rem; border-radius: var(--radius-md); margin-bottom: 1rem;">
        <code style="color: var(--primary-yellow); font-size: 0.875rem;">${cert.certificate_id}</code>
      </div>
      ${cert.is_verified ? '<span class="badge badge-yellow"><i class="fas fa-check-circle"></i> Verified</span>' : ''}
      <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
        <button onclick="downloadCertificate('${cert.certificate_id}')" class="btn btn-secondary" style="flex: 1;">
          <i class="fas fa-download"></i> Download
        </button>
        <button onclick="shareCertificate('${cert.certificate_id}')" class="btn btn-white" style="flex: 1;">
          <i class="fas fa-share"></i> Share
        </button>
      </div>
    </div>
  `;
}

async function generateCertificate() {
  const type = prompt('Enter certificate type (e.g., "IoT Foundation", "Robotics Expert", "Grade 1 Completion"):');
  if (!type) return;

  try {
    const studentId = AppState.currentUser?.id || 1;
    const response = await fetch('/api/certificates/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, certificateType: type })
    });
    const result = await response.json();

    if (result.success) {
      alert(`✅ Certificate Generated!\n\nID: ${result.certificateId}\nVerify at: ${result.verifyUrl}`);
      loadCertificates(); // Reload
    } else {
      alert('Failed to generate certificate');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to generate certificate. Please try again.');
  }
}

function downloadCertificate(certId) {
  alert(`📄 Downloading certificate: ${certId}\n\nThis will download a PDF certificate with your name and achievement.`);
  // In production, implement PDF generation
}

function shareCertificate(certId) {
  const url = `https://verify.passionbots.in/${certId}`;
  if (navigator.share) {
    navigator.share({
      title: 'My PassionBots Certificate',
      text: 'Check out my certificate!',
      url: url
    });
  } else {
    navigator.clipboard.writeText(url);
    alert('✅ Certificate URL copied to clipboard!');
  }
}

// ============================================
// QUIZZES
// ============================================

function renderQuizzes() {
  return `
    <div class="dashboard-container">
      <!-- Header -->
      <div class="flex-between mb-4">
        <div>
          <h1 class="gradient-text" style="font-size: 3rem; font-weight: 900; margin-bottom: 0.5rem;">
            📝 Quizzes & Tests
          </h1>
          <p style="color: var(--text-secondary); font-size: 1.1rem;">
            Test your knowledge and track your progress
          </p>
        </div>
      </div>

      <!-- Tabs -->
      <div style="display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 2px solid var(--border-color);">
        <button onclick="switchQuizTab('available')" class="quiz-tab active" data-tab="available">
          Available Quizzes
        </button>
        <button onclick="switchQuizTab('completed')" class="quiz-tab" data-tab="completed">
          Completed
        </button>
        <button onclick="switchQuizTab('results')" class="quiz-tab" data-tab="results">
          My Results
        </button>
      </div>

      <!-- Content -->
      <div id="quizContent">
        <div id="availableQuizzes" class="tab-content active"></div>
        <div id="completedQuizzes" class="tab-content" style="display: none;"></div>
        <div id="quizResults" class="tab-content" style="display: none;"></div>
      </div>
    </div>
  `;
}

function switchQuizTab(tab) {
  // Update tab buttons
  document.querySelectorAll('.quiz-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  // Update content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.style.display = content.id === `${tab}${tab === 'available' ? 'Quizzes' : tab === 'completed' ? 'Quizzes' : 'Results'}` ? 'block' : 'none';
  });

  // Load content
  if (tab === 'available') loadAvailableQuizzes();
  else if (tab === 'completed') loadCompletedQuizzes();
  else loadQuizResults();
}

async function loadAvailableQuizzes() {
  const container = document.getElementById('availableQuizzes');
  container.innerHTML = '<div class="loader"></div>';

  // Mock data - replace with API call
  const quizzes = [
    { id: 1, title: 'ESP32 Fundamentals', questions: 10, duration: 15, difficulty: 'Beginner', grade: 'KG' },
    { id: 2, title: 'Sensor Integration', questions: 15, duration: 20, difficulty: 'Intermediate', grade: 'Grade 1' },
    { id: 3, title: 'IoT Protocols', questions: 20, duration: 30, difficulty: 'Advanced', grade: 'Grade 2' }
  ];

  container.innerHTML = `
    <div class="grid grid-3">
      ${quizzes.map(quiz => renderQuizCard(quiz)).join('')}
    </div>
  `;
}

function renderQuizCard(quiz) {
  const difficultyColor = {
    'Beginner': 'var(--primary-yellow)',
    'Intermediate': 'var(--accent-orange)',
    'Advanced': '#FF4500'
  };

  return `
    <div class="card animate-fadeIn">
      <div style="background: var(--gradient-yellow); color: var(--text-black); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem;">
        <h3 style="font-size: 1.25rem; margin: 0;">${quiz.title}</h3>
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
        <span class="badge badge-white"><i class="fas fa-question-circle"></i> ${quiz.questions} Questions</span>
        <span class="badge badge-white"><i class="fas fa-clock"></i> ${quiz.duration} min</span>
        <span class="badge badge-black">${quiz.grade}</span>
      </div>
      <div style="margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <span style="color: var(--text-secondary); font-size: 0.875rem;">Difficulty:</span>
          <span style="color: ${difficultyColor[quiz.difficulty]}; font-weight: 600;">${quiz.difficulty}</span>
        </div>
      </div>
      <button onclick="startQuiz(${quiz.id})" class="btn btn-primary" style="width: 100%;">
        <i class="fas fa-play"></i> Start Quiz
      </button>
    </div>
  `;
}

function startQuiz(quizId) {
  alert(`🎯 Starting Quiz #${quizId}\n\nThis will open the quiz interface with questions and timer.`);
  // Implement quiz interface
}

async function loadCompletedQuizzes() {
  const container = document.getElementById('completedQuizzes');
  container.innerHTML = `
    <div style="text-align: center; padding: 4rem; color: var(--text-secondary);">
      <i class="fas fa-check-circle" style="font-size: 4rem; color: var(--primary-yellow); opacity: 0.3; margin-bottom: 1rem;"></i>
      <h3>No completed quizzes yet</h3>
      <p style="color: var(--text-muted);">Complete some quizzes to see them here</p>
    </div>
  `;
}

async function loadQuizResults() {
  const container = document.getElementById('quizResults');
  container.innerHTML = `
    <div class="stats-grid" style="margin-bottom: 2rem;">
      <div class="stat-card">
        <div class="stat-value">0</div>
        <div class="stat-label">Quizzes Taken</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">0%</div>
        <div class="stat-label">Average Score</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">0</div>
        <div class="stat-label">Perfect Scores</div>
      </div>
    </div>
    <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
      <p>No quiz results available yet</p>
    </div>
  `;
}

// ============================================
// ASSIGNMENTS
// ============================================

function renderAssignments() {
  return `
    <div class="dashboard-container">
      <!-- Header -->
      <div class="flex-between mb-4">
        <div>
          <h1 class="gradient-text" style="font-size: 3rem; font-weight: 900; margin-bottom: 0.5rem;">
            📋 Assignments
          </h1>
          <p style="color: var(--text-secondary); font-size: 1.1rem;">
            Submit your work and track submissions
          </p>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-grid" style="margin-bottom: 2rem;">
        <div class="stat-card">
          <div class="stat-value" id="totalAssignments">0</div>
          <div class="stat-label">Total Assignments</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" id="submittedCount">0</div>
          <div class="stat-label">Submitted</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" id="pendingCount">0</div>
          <div class="stat-label">Pending</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" id="averageScore">0%</div>
          <div class="stat-label">Average Score</div>
        </div>
      </div>

      <!-- Assignments List -->
      <div id="assignmentsList"></div>
    </div>
  `;
}

async function loadAssignments() {
  const container = document.getElementById('assignmentsList');
  container.innerHTML = '<div class="loader"></div>';

  try {
    const studentId = AppState.currentUser?.id || 1;
    const response = await fetch(`/api/assignments/${studentId}`);
    const assignments = await response.json();

    // Update stats
    document.getElementById('totalAssignments').textContent = assignments.length;
    document.getElementById('submittedCount').textContent = assignments.filter(a => a.submission_id).length;
    document.getElementById('pendingCount').textContent = assignments.filter(a => !a.submission_id).length;

    const scores = assignments.filter(a => a.score).map(a => a.score);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    document.getElementById('averageScore').textContent = `${avgScore}%`;

    // Render assignments
    container.innerHTML = `
      <div class="grid grid-2">
        ${assignments.map(assignment => renderAssignmentCard(assignment)).join('')}
      </div>
    `;
  } catch (error) {
    console.error('Failed to load assignments:', error);
    container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">Failed to load assignments</p>';
  }
}

function renderAssignmentCard(assignment) {
  const isSubmitted = assignment.submission_id;
  const isGraded = assignment.score !== null;
  const isPending = isSubmitted && !isGraded;
  const dueDate = new Date(assignment.due_date);
  const isOverdue = dueDate < new Date() && !isSubmitted;

  return `
    <div class="card animate-fadeIn ${isOverdue ? 'border-danger' : ''}">
      <div class="flex-between mb-3">
        <h3 style="font-size: 1.25rem; margin: 0;">${assignment.title}</h3>
        ${isOverdue ? '<span class="badge" style="background: #ff4444; color: white;">Overdue</span>' : ''}
        ${isPending ? '<span class="badge" style="background: var(--primary-gold); color: var(--text-black);">Pending Review</span>' : ''}
        ${isGraded ? `<span class="badge badge-yellow">${assignment.score}%</span>` : ''}
      </div>
      
      <p style="color: var(--text-secondary); margin-bottom: 1rem;">
        ${assignment.description || 'No description provided'}
      </p>
      
      <div style="display: flex; gap: 1rem; margin-bottom: 1rem; font-size: 0.875rem;">
        <span style="color: var(--text-secondary);">
          <i class="fas fa-book"></i> ${assignment.module_title}
        </span>
        <span style="color: ${isOverdue ? '#ff4444' : 'var(--text-secondary)'};">
          <i class="fas fa-calendar"></i> Due: ${dueDate.toLocaleDateString()}
        </span>
        <span style="color: var(--text-secondary);">
          <i class="fas fa-star"></i> Max: ${assignment.max_score} pts
        </span>
      </div>
      
      ${isSubmitted ? `
        <div style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem;">
          <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
            <i class="fas fa-check"></i> Submitted: ${new Date(assignment.submitted_at).toLocaleDateString()}
          </div>
          ${assignment.feedback ? `
            <div style="margin-top: 0.5rem;">
              <strong style="color: var(--primary-yellow);">Feedback:</strong>
              <p style="margin: 0.5rem 0 0; color: var(--text-secondary);">${assignment.feedback}</p>
            </div>
          ` : ''}
        </div>
      ` : ''}
      
      <div style="display: flex; gap: 0.5rem;">
        ${!isSubmitted ? `
          <button onclick="submitAssignment(${assignment.id})" class="btn btn-primary" style="flex: 1;">
            <i class="fas fa-upload"></i> Submit
          </button>
        ` : ''}
        <button onclick="viewAssignment(${assignment.id})" class="btn btn-secondary" style="flex: 1;">
          <i class="fas fa-eye"></i> View Details
        </button>
      </div>
    </div>
  `;
}

function submitAssignment(assignmentId) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">Submit Assignment</h2>
        <button onclick="this.closest('.modal-overlay').remove()" class="modal-close">×</button>
      </div>
      <form onsubmit="handleSubmitAssignment(event, ${assignmentId}); return false;">
        <div class="form-group">
          <label class="form-label">Submission URL (GitHub, Drive, etc.)</label>
          <input type="url" name="submissionUrl" class="form-input" placeholder="https://github.com/username/project" required>
        </div>
        <div class="form-group">
          <label class="form-label">GitHub Repository (optional)</label>
          <input type="url" name="githubUrl" class="form-input" placeholder="https://github.com/username/repo">
        </div>
        <div class="form-group">
          <label class="form-label">Live Demo URL (optional)</label>
          <input type="url" name="demoUrl" class="form-input" placeholder="https://your-demo.pages.dev">
        </div>
        <div class="form-group">
          <label class="form-label">Description / Notes</label>
          <textarea name="description" class="form-textarea" placeholder="Describe your work, challenges faced, etc." rows="4"></textarea>
        </div>
        <div style="display: flex; gap: 1rem;">
          <button type="button" onclick="this.closest('.modal-overlay').remove()" class="btn btn-secondary" style="flex: 1;">Cancel</button>
          <button type="submit" class="btn btn-primary" style="flex: 1;">
            <i class="fas fa-check"></i> Submit Assignment
          </button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
}

async function handleSubmitAssignment(event, assignmentId) {
  event.preventDefault();
  const form = event.target;
  const data = {
    assignmentId,
    studentId: AppState.currentUser?.id || 1,
    submissionUrl: form.submissionUrl.value,
    githubUrl: form.githubUrl.value || null,
    demoUrl: form.demoUrl.value || null,
    description: form.description.value || null
  };

  try {
    const response = await fetch('/api/assignments/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();

    if (result.success) {
      alert('✅ Assignment submitted successfully!');
      form.closest('.modal-overlay').remove();
      loadAssignments(); // Reload
    } else {
      alert('Failed to submit assignment');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to submit assignment. Please try again.');
  }
}

function viewAssignment(assignmentId) {
  alert(`📄 Viewing assignment #${assignmentId}\n\nThis will show full assignment details, requirements, and rubric.`);
}

// ============================================
// MESSAGING
// ============================================

function renderMessaging() {
  return `
    <div class="dashboard-container">
      <div style="display: grid; grid-template-columns: 300px 1fr; gap: 2rem; height: calc(100vh - 200px);">
        
        <!-- Contacts Sidebar -->
        <div class="card" style="display: flex; flex-direction: column;">
          <div style="padding-bottom: 1rem; border-bottom: 2px solid var(--border-color); margin-bottom: 1rem;">
            <h3 style="margin: 0; font-size: 1.25rem;">Messages</h3>
          </div>
          <div style="flex: 1; overflow-y: auto;" id="contactsList">
            <div class="loader"></div>
          </div>
        </div>
        
        <!-- Chat Area -->
        <div class="card" style="display: flex; flex-direction: column;">
          <div id="chatHeader" style="padding-bottom: 1rem; border-bottom: 2px solid var(--border-color); margin-bottom: 1rem;">
            <p style="color: var(--text-secondary); text-align: center;">Select a contact to start messaging</p>
          </div>
          <div id="chatMessages" style="flex: 1; overflow-y: auto; padding: 1rem; background: var(--bg-secondary); border-radius: var(--radius-md); margin-bottom: 1rem;">
            <!-- Messages will appear here -->
          </div>
          <form id="messageForm" onsubmit="sendMessage(event); return false;" style="display: none;">
            <div style="display: flex; gap: 1rem;">
              <input type="text" name="message" class="form-input" placeholder="Type your message..." style="flex: 1;" required>
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-paper-plane"></i> Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

async function loadContacts() {
  const container = document.getElementById('contactsList');
  
  // Mock contacts - replace with API call
  const contacts = [
    { id: 1, name: 'Mentor Sarah', role: 'mentor', lastMessage: 'Great progress!', unread: 2, online: true },
    { id: 2, name: 'Support Team', role: 'support', lastMessage: 'How can we help?', unread: 0, online: true },
    { id: 3, name: 'Study Group', role: 'group', lastMessage: 'Anyone online?', unread: 5, online: false }
  ];

  container.innerHTML = contacts.map(contact => `
    <div onclick="openChat(${contact.id}, '${contact.name}')" 
         style="padding: 1rem; border-radius: var(--radius-md); cursor: pointer; transition: var(--transition); margin-bottom: 0.5rem; border: 2px solid transparent;"
         onmouseover="this.style.background='var(--bg-hover)'; this.style.borderColor='var(--border-yellow)'"
         onmouseout="this.style.background='transparent'; this.style.borderColor='transparent'">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <div style="position: relative;">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--gradient-yellow); display: flex; align-items: center; justify-content: center; color: var(--text-black); font-weight: 700;">
            ${contact.name[0]}
          </div>
          ${contact.online ? '<div style="position: absolute; bottom: 0; right: 0; width: 12px; height: 12px; background: #4ade80; border: 2px solid var(--bg-card); border-radius: 50%;"></div>' : ''}
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
            <div style="font-weight: 600; font-size: 0.95rem;">${contact.name}</div>
            ${contact.unread > 0 ? `<span class="badge badge-yellow" style="font-size: 0.75rem;">${contact.unread}</span>` : ''}
          </div>
          <div style="font-size: 0.85rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${contact.lastMessage}
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function openChat(contactId, contactName) {
  // Update header
  document.getElementById('chatHeader').innerHTML = `
    <div style="display: flex; align-items: center; gap: 1rem;">
      <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--gradient-yellow); display: flex; align-items: center; justify-content: center; color: var(--text-black); font-weight: 700; font-size: 1.25rem;">
        ${contactName[0]}
      </div>
      <div>
        <h3 style="margin: 0; font-size: 1.25rem;">${contactName}</h3>
        <p style="margin: 0; font-size: 0.875rem; color: var(--text-secondary);">Online</p>
      </div>
    </div>
  `;

  // Load messages
  const chatMessages = document.getElementById('chatMessages');
  chatMessages.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <div style="display: flex; gap: 0.75rem;">
        <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--gradient-yellow); display: flex; align-items: center; justify-content: center; color: var(--text-black); font-weight: 600; flex-shrink: 0;">
          ${contactName[0]}
        </div>
        <div style="flex: 1;">
          <div style="background: var(--bg-card); padding: 0.75rem 1rem; border-radius: var(--radius-md); max-width: 80%;">
            <p style="margin: 0; color: var(--text-primary);">Hi! How can I help you today?</p>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem; padding-left: 0.5rem;">
            10:30 AM
          </div>
        </div>
      </div>
      
      <div style="display: flex; gap: 0.75rem; flex-direction: row-reverse;">
        <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--bg-hover); display: flex; align-items: center; justify-content: center; color: var(--primary-yellow); font-weight: 600; flex-shrink: 0;">
          ME
        </div>
        <div style="flex: 1; display: flex; flex-direction: column; align-items: flex-end;">
          <div style="background: var(--gradient-yellow); color: var(--text-black); padding: 0.75rem 1rem; border-radius: var(--radius-md); max-width: 80%;">
            <p style="margin: 0;">I need help with my ESP32 project</p>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem; padding-right: 0.5rem;">
            10:31 AM
          </div>
        </div>
      </div>
    </div>
  `;

  // Show message form
  document.getElementById('messageForm').style.display = 'flex';
}

function sendMessage(event) {
  event.preventDefault();
  const form = event.target;
  const message = form.message.value;
  
  // Add message to chat (implementation needed)
  alert(`📤 Message sent: "${message}"`);
  form.reset();
}

// ============================================
// Navigation Updates
// ============================================

// Add this to your existing navigation
window.showCertificates = function() {
  AppState.currentView = 'certificates';
  document.getElementById('app').innerHTML = renderCertificates();
  loadCertificates();
};

window.showQuizzes = function() {
  AppState.currentView = 'quizzes';
  document.getElementById('app').innerHTML = renderQuizzes();
  switchQuizTab('available');
};

window.showAssignments = function() {
  AppState.currentView = 'assignments';
  document.getElementById('app').innerHTML = renderAssignments();
  loadAssignments();
};

window.showMessaging = function() {
  AppState.currentView = 'messaging';
  document.getElementById('app').innerHTML = renderMessaging();
  loadContacts();
};

console.log('✅ Advanced Features Loaded: Certificates, Quizzes, Assignments, Messaging');
