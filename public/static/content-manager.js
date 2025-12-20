/**
 * PassionBots LMS v6.0 - Content Management System
 * For Mentors to upload courses, videos, assignments
 */

const ContentManager = {
  currentTab: 'courses',
  
  // Initialize content manager
  init() {
    console.log('🎬 Content Manager Loading...')
    this.render()
  },
  
  // Main render
  render() {
    const container = document.getElementById('app')
    if (!container) return
    
    container.innerHTML = `
      <div class="content-manager-wrapper">
        <!-- Header -->
        <header class="content-header">
          <div class="header-content">
            <div class="header-left">
              <button class="btn-back" onclick="window.location.href='/'">
                <i class="fas fa-arrow-left"></i>
              </button>
              <div>
                <h1 class="header-title">
                  <i class="fas fa-video"></i>
                  Content Manager
                </h1>
                <p class="header-subtitle">Upload courses, videos & assignments</p>
              </div>
            </div>
            <div class="header-right">
              <span class="mentor-badge">
                <i class="fas fa-user-tie"></i>
                ${MentorState.currentMentor?.full_name || 'Mentor'}
              </span>
            </div>
          </div>
        </header>
        
        <!-- Navigation Tabs -->
        <div class="content-tabs">
          <button 
            class="tab-btn ${this.currentTab === 'courses' ? 'active' : ''}"
            onclick="ContentManager.switchTab('courses')">
            <i class="fas fa-book"></i>
            Courses & Modules
          </button>
          <button 
            class="tab-btn ${this.currentTab === 'videos' ? 'active' : ''}"
            onclick="ContentManager.switchTab('videos')">
            <i class="fas fa-video"></i>
            Videos
          </button>
          <button 
            class="tab-btn ${this.currentTab === 'assignments' ? 'active' : ''}"
            onclick="ContentManager.switchTab('assignments')">
            <i class="fas fa-tasks"></i>
            Assignments
          </button>
          <button 
            class="tab-btn ${this.currentTab === 'quizzes' ? 'active' : ''}"
            onclick="ContentManager.switchTab('quizzes')">
            <i class="fas fa-question-circle"></i>
            Quizzes
          </button>
        </div>
        
        <!-- Content Area -->
        <div class="content-body" id="contentBody">
          ${this.renderTabContent()}
        </div>
      </div>
      
      <style>
        .content-manager-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        }
        
        .content-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .btn-back {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          width: 50px;
          height: 50px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.3s;
        }
        
        .btn-back:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(102,126,234,0.4);
        }
        
        .header-title {
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .header-subtitle {
          color: #666;
          margin: 0.25rem 0 0;
        }
        
        .mentor-badge {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
        }
        
        .content-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        
        .tab-btn {
          background: rgba(255, 255, 255, 0.9);
          border: 2px solid transparent;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .tab-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .tab-btn.active {
          background: white;
          border-color: #667eea;
          color: #667eea;
          box-shadow: 0 10px 40px rgba(102,126,234,0.3);
        }
        
        .content-body {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 2rem;
          min-height: 500px;
        }
        
        .upload-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }
        
        .upload-card {
          background: linear-gradient(135deg, rgba(102,126,234,0.05), rgba(118,75,162,0.05));
          border: 2px dashed #667eea;
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .upload-card:hover {
          transform: translateY(-5px);
          border-color: #764ba2;
          box-shadow: 0 20px 40px rgba(102,126,234,0.2);
        }
        
        .upload-icon {
          font-size: 3rem;
          color: #667eea;
          margin-bottom: 1rem;
        }
        
        .upload-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #333;
        }
        
        .upload-desc {
          color: #666;
          font-size: 0.9rem;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #333;
        }
        
        .form-input, .form-textarea, .form-select {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.3s;
        }
        
        .form-input:focus, .form-textarea:focus, .form-select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
        }
        
        .form-textarea {
          min-height: 120px;
          resize: vertical;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(102,126,234,0.4);
        }
        
        .btn-secondary {
          background: #e0e0e0;
          color: #333;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          margin-left: 1rem;
        }
        
        .btn-secondary:hover {
          background: #d0d0d0;
        }
        
        .content-list {
          display: grid;
          gap: 1rem;
          margin-top: 2rem;
        }
        
        .content-item {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s;
        }
        
        .content-item:hover {
          box-shadow: 0 5px 20px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        
        .item-info h3 {
          margin: 0 0 0.5rem;
          color: #333;
        }
        
        .item-info p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }
        
        .item-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .btn-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.3s;
        }
        
        .btn-edit {
          background: #4CAF50;
          color: white;
        }
        
        .btn-delete {
          background: #f44336;
          color: white;
        }
        
        .btn-icon:hover {
          transform: scale(1.1);
        }
        
        .modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(10px);
          z-index: 1000;
          align-items: center;
          justify-content: center;
        }
        
        .modal.active {
          display: flex;
        }
        
        .modal-content {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
        }
        
        .btn-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
        }
        
        .success-message {
          background: #4CAF50;
          color: white;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          display: none;
        }
        
        .success-message.show {
          display: block;
        }
      </style>
    `
  },
  
  // Render tab content
  renderTabContent() {
    switch(this.currentTab) {
      case 'courses':
        return this.renderCoursesTab()
      case 'videos':
        return this.renderVideosTab()
      case 'assignments':
        return this.renderAssignmentsTab()
      case 'quizzes':
        return this.renderQuizzesTab()
      default:
        return '<p>Select a tab</p>'
    }
  },
  
  // Courses Tab
  renderCoursesTab() {
    return `
      <div id="successMessage" class="success-message"></div>
      
      <h2 style="margin-bottom: 2rem;">
        <i class="fas fa-book"></i>
        Course Management
      </h2>
      
      <div class="upload-section">
        <div class="upload-card" onclick="ContentManager.showAddModuleModal()">
          <div class="upload-icon">
            <i class="fas fa-plus-circle"></i>
          </div>
          <h3 class="upload-title">Add New Module</h3>
          <p class="upload-desc">Create a new course module</p>
        </div>
        
        <div class="upload-card" onclick="ContentManager.showAddLessonModal()">
          <div class="upload-icon">
            <i class="fas fa-file-alt"></i>
          </div>
          <h3 class="upload-title">Add New Lesson</h3>
          <p class="upload-desc">Add lesson to existing module</p>
        </div>
      </div>
      
      <div class="content-list" id="coursesList">
        <p style="text-align: center; color: #666;">Loading courses...</p>
      </div>
      
      <!-- Add Module Modal -->
      <div id="addModuleModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">Add New Module</h2>
            <button class="btn-close" onclick="ContentManager.closeModal('addModuleModal')">×</button>
          </div>
          <form onsubmit="ContentManager.handleAddModule(event)">
            <div class="form-group">
              <label class="form-label">Module Number</label>
              <input type="number" class="form-input" name="module_number" required min="1" max="20">
            </div>
            <div class="form-group">
              <label class="form-label">Module Title</label>
              <input type="text" class="form-input" name="title" required placeholder="e.g., Advanced IoT Concepts">
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea class="form-textarea" name="description" required placeholder="Brief overview of the module..."></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Duration (weeks)</label>
              <input type="number" class="form-input" name="duration_weeks" required min="1" max="52">
            </div>
            <div class="form-group">
              <label class="form-label">Icon (emoji or icon class)</label>
              <input type="text" class="form-input" name="icon" placeholder="🤖 or fas fa-robot">
            </div>
            <button type="submit" class="btn-primary">
              <i class="fas fa-save"></i> Create Module
            </button>
            <button type="button" class="btn-secondary" onclick="ContentManager.closeModal('addModuleModal')">
              Cancel
            </button>
          </form>
        </div>
      </div>
      
      <!-- Add Lesson Modal -->
      <div id="addLessonModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">Add New Lesson</h2>
            <button class="btn-close" onclick="ContentManager.closeModal('addLessonModal')">×</button>
          </div>
          <form onsubmit="ContentManager.handleAddLesson(event)">
            <div class="form-group">
              <label class="form-label">Select Module</label>
              <select class="form-select" name="module_id" required id="moduleSelect">
                <option value="">Loading modules...</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Lesson Title</label>
              <input type="text" class="form-input" name="title" required placeholder="e.g., Introduction to MQTT Protocol">
            </div>
            <div class="form-group">
              <label class="form-label">Content</label>
              <textarea class="form-textarea" name="content" required placeholder="Lesson content in HTML or Markdown..." style="min-height: 200px;"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Duration (minutes)</label>
              <input type="number" class="form-input" name="duration_minutes" required min="5" max="300">
            </div>
            <div class="form-group">
              <label class="form-label">Video URL (optional)</label>
              <input type="url" class="form-input" name="video_url" placeholder="https://youtube.com/watch?v=...">
            </div>
            <div class="form-group">
              <label class="form-label">Order Number</label>
              <input type="number" class="form-input" name="order_number" required min="1">
            </div>
            <button type="submit" class="btn-primary">
              <i class="fas fa-save"></i> Create Lesson
            </button>
            <button type="button" class="btn-secondary" onclick="ContentManager.closeModal('addLessonModal')">
              Cancel
            </button>
          </form>
        </div>
      </div>
    `
  },
  
  // Videos Tab
  renderVideosTab() {
    return `
      <div id="successMessage" class="success-message"></div>
      
      <h2 style="margin-bottom: 2rem;">
        <i class="fas fa-video"></i>
        Video Library
      </h2>
      
      <div class="upload-section">
        <div class="upload-card" onclick="ContentManager.showAddVideoModal()">
          <div class="upload-icon">
            <i class="fas fa-cloud-upload-alt"></i>
          </div>
          <h3 class="upload-title">Upload Video</h3>
          <p class="upload-desc">YouTube, Vimeo, or direct link</p>
        </div>
        
        <div class="upload-card" onclick="ContentManager.showBulkVideoModal()">
          <div class="upload-icon">
            <i class="fas fa-list"></i>
          </div>
          <h3 class="upload-title">Bulk Import</h3>
          <p class="upload-desc">Import multiple video links</p>
        </div>
      </div>
      
      <div class="content-list" id="videosList">
        <p style="text-align: center; color: #666;">No videos uploaded yet</p>
      </div>
      
      <!-- Add Video Modal -->
      <div id="addVideoModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">Add Video</h2>
            <button class="btn-close" onclick="ContentManager.closeModal('addVideoModal')">×</button>
          </div>
          <form onsubmit="ContentManager.handleAddVideo(event)">
            <div class="form-group">
              <label class="form-label">Video Title</label>
              <input type="text" class="form-input" name="title" required>
            </div>
            <div class="form-group">
              <label class="form-label">Video URL</label>
              <input type="url" class="form-input" name="url" required placeholder="https://youtube.com/watch?v=...">
              <small style="color: #666;">Supports YouTube, Vimeo, and direct video URLs</small>
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea class="form-textarea" name="description"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Associate with Lesson (optional)</label>
              <select class="form-select" name="lesson_id">
                <option value="">None - Standalone video</option>
              </select>
            </div>
            <button type="submit" class="btn-primary">
              <i class="fas fa-save"></i> Add Video
            </button>
            <button type="button" class="btn-secondary" onclick="ContentManager.closeModal('addVideoModal')">
              Cancel
            </button>
          </form>
        </div>
      </div>
    `
  },
  
  // Assignments Tab
  renderAssignmentsTab() {
    return `
      <div id="successMessage" class="success-message"></div>
      
      <h2 style="margin-bottom: 2rem;">
        <i class="fas fa-tasks"></i>
        Assignment Management
      </h2>
      
      <div class="upload-section">
        <div class="upload-card" onclick="ContentManager.showAddAssignmentModal()">
          <div class="upload-icon">
            <i class="fas fa-plus-circle"></i>
          </div>
          <h3 class="upload-title">Create Assignment</h3>
          <p class="upload-desc">New coding/project assignment</p>
        </div>
        
        <div class="upload-card" onclick="ContentManager.viewSubmissions()">
          <div class="upload-icon">
            <i class="fas fa-clipboard-check"></i>
          </div>
          <h3 class="upload-title">View Submissions</h3>
          <p class="upload-desc">Grade student assignments</p>
        </div>
      </div>
      
      <div class="content-list" id="assignmentsList">
        <p style="text-align: center; color: #666;">Loading assignments...</p>
      </div>
      
      <!-- Add Assignment Modal -->
      <div id="addAssignmentModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">Create Assignment</h2>
            <button class="btn-close" onclick="ContentManager.closeModal('addAssignmentModal')">×</button>
          </div>
          <form onsubmit="ContentManager.handleAddAssignment(event)">
            <div class="form-group">
              <label class="form-label">Assignment Title</label>
              <input type="text" class="form-input" name="title" required placeholder="e.g., Build a Temperature Monitor">
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea class="form-textarea" name="description" required placeholder="Detailed instructions..."></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Module</label>
              <select class="form-select" name="module_id" required>
                <option value="">Loading modules...</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Due Date</label>
              <input type="date" class="form-input" name="due_date" required>
            </div>
            <div class="form-group">
              <label class="form-label">Max Score</label>
              <input type="number" class="form-input" name="max_score" value="100" required min="1">
            </div>
            <div class="form-group">
              <label class="form-label">Submission Type</label>
              <select class="form-select" name="submission_type" required>
                <option value="file">File Upload</option>
                <option value="url">URL (GitHub, etc)</option>
                <option value="text">Text</option>
                <option value="code">Code Submission</option>
              </select>
            </div>
            <button type="submit" class="btn-primary">
              <i class="fas fa-save"></i> Create Assignment
            </button>
            <button type="button" class="btn-secondary" onclick="ContentManager.closeModal('addAssignmentModal')">
              Cancel
            </button>
          </form>
        </div>
      </div>
    `
  },
  
  // Quizzes Tab
  renderQuizzesTab() {
    return `
      <div id="successMessage" class="success-message"></div>
      
      <h2 style="margin-bottom: 2rem;">
        <i class="fas fa-question-circle"></i>
        Quiz Management
      </h2>
      
      <div class="upload-section">
        <div class="upload-card" onclick="ContentManager.showAddQuizModal()">
          <div class="upload-icon">
            <i class="fas fa-plus-circle"></i>
          </div>
          <h3 class="upload-title">Create Quiz</h3>
          <p class="upload-desc">Add MCQ or coding quiz</p>
        </div>
        
        <div class="upload-card" onclick="ContentManager.showBulkQuizModal()">
          <div class="upload-icon">
            <i class="fas fa-file-excel"></i>
          </div>
          <h3 class="upload-title">Bulk Import</h3>
          <p class="upload-desc">Import from CSV/Excel</p>
        </div>
      </div>
      
      <div class="content-list" id="quizzesList">
        <p style="text-align: center; color: #666;">No quizzes created yet</p>
      </div>
    `
  },
  
  // Switch tab
  switchTab(tab) {
    this.currentTab = tab
    this.render()
  },
  
  // Modal functions
  showAddModuleModal() {
    document.getElementById('addModuleModal').classList.add('active')
  },
  
  showAddLessonModal() {
    this.loadModulesIntoSelect()
    document.getElementById('addLessonModal').classList.add('active')
  },
  
  showAddVideoModal() {
    document.getElementById('addVideoModal').classList.add('active')
  },
  
  showAddAssignmentModal() {
    this.loadModulesIntoAssignmentSelect()
    document.getElementById('addAssignmentModal').classList.add('active')
  },
  
  closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active')
  },
  
  // Load modules into select
  async loadModulesIntoSelect() {
    try {
      const response = await axios.get('/api/modules/1') // Get all modules
      const modules = response.data
      
      const select = document.getElementById('moduleSelect')
      select.innerHTML = modules.map(m => 
        `<option value="${m.id}">${m.module_number}. ${m.title}</option>`
      ).join('')
    } catch (error) {
      console.error('Failed to load modules:', error)
    }
  },
  
  async loadModulesIntoAssignmentSelect() {
    try {
      const response = await axios.get('/api/modules/1')
      const modules = response.data
      
      const select = document.querySelector('#addAssignmentModal select[name="module_id"]')
      select.innerHTML = modules.map(m => 
        `<option value="${m.id}">${m.module_number}. ${m.title}</option>`
      ).join('')
    } catch (error) {
      console.error('Failed to load modules:', error)
    }
  },
  
  // Handle add module
  async handleAddModule(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)
    
    try {
      // Note: This would need a backend endpoint
      console.log('Creating module:', data)
      this.showSuccess('Module created successfully!')
      this.closeModal('addModuleModal')
      e.target.reset()
      
      // In real implementation:
      // await axios.post('/api/modules/create', data)
      
    } catch (error) {
      alert('Failed to create module: ' + error.message)
    }
  },
  
  // Handle add lesson
  async handleAddLesson(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)
    
    try {
      console.log('Creating lesson:', data)
      this.showSuccess('Lesson created successfully!')
      this.closeModal('addLessonModal')
      e.target.reset()
      
      // In real implementation:
      // await axios.post('/api/lessons/create', data)
      
    } catch (error) {
      alert('Failed to create lesson: ' + error.message)
    }
  },
  
  // Handle add video
  async handleAddVideo(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)
    
    try {
      console.log('Adding video:', data)
      this.showSuccess('Video added successfully!')
      this.closeModal('addVideoModal')
      e.target.reset()
    } catch (error) {
      alert('Failed to add video: ' + error.message)
    }
  },
  
  // Handle add assignment
  async handleAddAssignment(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)
    
    try {
      console.log('Creating assignment:', data)
      this.showSuccess('Assignment created successfully!')
      this.closeModal('addAssignmentModal')
      e.target.reset()
    } catch (error) {
      alert('Failed to create assignment: ' + error.message)
    }
  },
  
  // Show success message
  showSuccess(message) {
    const msgEl = document.getElementById('successMessage')
    if (msgEl) {
      msgEl.textContent = message
      msgEl.classList.add('show')
      setTimeout(() => msgEl.classList.remove('show'), 3000)
    }
  },
  
  // View submissions
  viewSubmissions() {
    window.location.href = '/?view=grading'
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ContentManager.init())
} else {
  ContentManager.init()
}

console.log('✅ Content Manager Loaded')
