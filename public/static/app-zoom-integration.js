// ============================================
// PASSIONBOTS LMS - ZOOM INTEGRATION
// Automatic Meeting Scheduling & Recording
// ============================================

// Zoom Meeting Manager
const ZoomManager = {
  
  // Render Zoom Sessions Page
  renderZoomSessions() {
    return `
      <div class="dashboard-container">
        ${this.renderHeader()}
        
        <!-- Tabs -->
        <div class="zoom-tabs" style="display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 2px solid var(--border-color);">
          <button onclick="ZoomManager.switchTab('upcoming')" class="zoom-tab active" data-tab="upcoming">
            <i class="fas fa-calendar-alt"></i> Upcoming Sessions
          </button>
          <button onclick="ZoomManager.switchTab('recorded')" class="zoom-tab" data-tab="recorded">
            <i class="fas fa-video"></i> Recorded Sessions
          </button>
          <button onclick="ZoomManager.switchTab('schedule')" class="zoom-tab" data-tab="schedule" style="display: ${AppState.currentUser?.role === 'mentor' ? 'flex' : 'none'};">
            <i class="fas fa-plus-circle"></i> Schedule New
          </button>
        </div>

        <!-- Tab Content -->
        <div id="upcomingTab" class="tab-content active"></div>
        <div id="recordedTab" class="tab-content" style="display: none;"></div>
        <div id="scheduleTab" class="tab-content" style="display: none;"></div>
      </div>
    `;
  },

  renderHeader() {
    return `
      <div class="flex-between mb-4">
        <div>
          <h1 class="gradient-text" style="font-size: 3rem; font-weight: 900; margin-bottom: 0.5rem;">
            <i class="fas fa-video"></i> Live Zoom Sessions
          </h1>
          <p style="color: var(--text-secondary); font-size: 1.1rem;">
            Join live classes and watch recorded sessions anytime
          </p>
        </div>
      </div>
    `;
  },

  // Switch between tabs
  switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.zoom-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.style.display = 'none';
    });

    const activeTab = document.getElementById(`${tab}Tab`);
    if (activeTab) {
      activeTab.style.display = 'block';
      
      // Load content
      if (tab === 'upcoming') this.loadUpcomingSessions();
      else if (tab === 'recorded') this.loadRecordedSessions();
      else if (tab === 'schedule') this.renderScheduleForm();
    }
  },

  // Load upcoming live sessions
  async loadUpcomingSessions() {
    const container = document.getElementById('upcomingTab');
    container.innerHTML = '<div class="loader"></div>';

    try {
      const response = await fetch('/api/zoom/upcoming');
      const sessions = await response.json();

      if (sessions.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 4rem;">
            <i class="fas fa-calendar-times" style="font-size: 4rem; color: var(--primary-yellow); opacity: 0.3; margin-bottom: 1rem;"></i>
            <h3 style="color: var(--text-secondary);">No upcoming sessions</h3>
            <p style="color: var(--text-muted);">Check back later for new live classes</p>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="grid grid-2">
          ${sessions.map(session => this.renderUpcomingSessionCard(session)).join('')}
        </div>
      `;
    } catch (error) {
      console.error('Failed to load sessions:', error);
      container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">Failed to load sessions</p>';
    }
  },

  // Render upcoming session card
  renderUpcomingSessionCard(session) {
    const sessionDate = new Date(session.start_time);
    const now = new Date();
    const isLive = now >= sessionDate && now <= new Date(session.end_time);
    const timeUntil = Math.floor((sessionDate - now) / (1000 * 60)); // minutes

    return `
      <div class="card animate-fadeIn">
        ${isLive ? '<div class="badge badge-yellow" style="position: absolute; top: 1rem; right: 1rem;">🔴 LIVE NOW</div>' : ''}
        
        <div class="flex gap-md mb-md">
          <div style="width: 80px; height: 80px; background: var(--gradient-purple); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <i class="fas fa-video" style="font-size: 2rem; color: white;"></i>
          </div>
          <div style="flex: 1;">
            <div class="badge badge-black mb-xs">${session.grade_name || 'General'}</div>
            <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">${session.topic}</h3>
            <p style="color: var(--text-secondary); font-size: 0.875rem;">${session.description || 'Interactive live session'}</p>
          </div>
        </div>

        <!-- Session Details -->
        <div style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem;">
          <div style="display: grid; gap: 0.75rem; font-size: 0.95rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <i class="fas fa-calendar" style="color: var(--primary-yellow); width: 20px;"></i>
              <span style="color: var(--text-primary);">${sessionDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <i class="fas fa-clock" style="color: var(--primary-yellow); width: 20px;"></i>
              <span style="color: var(--text-primary);">${sessionDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <i class="fas fa-hourglass-half" style="color: var(--primary-yellow); width: 20px;"></i>
              <span style="color: var(--text-primary);">${session.duration} minutes</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <i class="fas fa-user" style="color: var(--primary-yellow); width: 20px;"></i>
              <span style="color: var(--text-primary);">${session.mentor_name || 'Expert Mentor'}</span>
            </div>
          </div>
        </div>

        ${!isLive && timeUntil > 0 ? `
          <div style="background: rgba(255, 215, 0, 0.1); padding: 0.75rem; border-radius: var(--radius-md); margin-bottom: 1rem; border: 1px solid rgba(255, 215, 0, 0.3);">
            <p style="color: var(--primary-yellow); font-size: 0.875rem; margin: 0; text-align: center;">
              <i class="fas fa-info-circle"></i> Starts in ${timeUntil < 60 ? timeUntil + ' minutes' : Math.floor(timeUntil / 60) + ' hours'}
            </p>
          </div>
        ` : ''}

        <!-- Action Buttons -->
        <div style="display: flex; gap: 0.75rem;">
          ${isLive || timeUntil <= 15 ? `
            <button onclick="ZoomManager.joinMeeting('${session.zoom_meeting_id}', '${session.zoom_join_url}')" class="btn btn-primary" style="flex: 1;">
              <i class="fas fa-video"></i> ${isLive ? 'Join Now' : 'Join Meeting'}
            </button>
          ` : `
            <button class="btn btn-secondary" style="flex: 1;" disabled>
              <i class="fas fa-calendar-check"></i> Scheduled
            </button>
          `}
          <button onclick="ZoomManager.addToCalendar('${session.id}')" class="btn btn-white">
            <i class="fas fa-calendar-plus"></i>
          </button>
        </div>
      </div>
    `;
  },

  // Load recorded sessions
  async loadRecordedSessions() {
    const container = document.getElementById('recordedTab');
    container.innerHTML = '<div class="loader"></div>';

    try {
      const response = await fetch('/api/zoom/recordings');
      const recordings = await response.json();

      if (recordings.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 4rem;">
            <i class="fas fa-video-slash" style="font-size: 4rem; color: var(--primary-yellow); opacity: 0.3; margin-bottom: 1rem;"></i>
            <h3 style="color: var(--text-secondary);">No recorded sessions yet</h3>
            <p style="color: var(--text-muted);">Recorded sessions will appear here after live classes</p>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="grid grid-3">
          ${recordings.map(recording => this.renderRecordingCard(recording)).join('')}
        </div>
      `;
    } catch (error) {
      console.error('Failed to load recordings:', error);
      container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">Failed to load recordings</p>';
    }
  },

  // Render recording card
  renderRecordingCard(recording) {
    const recordedDate = new Date(recording.recorded_at);
    const duration = Math.floor(recording.duration / 60); // Convert to minutes

    return `
      <div class="card animate-fadeIn" style="cursor: pointer;" onclick="ZoomManager.playRecording('${recording.id}')">
        <!-- Thumbnail -->
        <div style="position: relative; width: 100%; height: 180px; background: var(--gradient-purple); border-radius: var(--radius-md); margin-bottom: 1rem; overflow: hidden;">
          ${recording.thumbnail_url ? `
            <img src="${recording.thumbnail_url}" alt="${recording.topic}" style="width: 100%; height: 100%; object-fit: cover;">
          ` : `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
              <i class="fas fa-play-circle" style="font-size: 4rem; color: white; opacity: 0.8;"></i>
            </div>
          `}
          <div style="position: absolute; bottom: 0.5rem; right: 0.5rem; background: rgba(0,0,0,0.8); color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">
            ${duration} min
          </div>
        </div>

        <!-- Info -->
        <div class="badge badge-black mb-xs">${recording.grade_name || 'General'}</div>
        <h4 style="font-size: 1.125rem; margin-bottom: 0.5rem;">${recording.topic}</h4>
        <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 1rem;">
          ${recording.description || 'Recorded session'}
        </p>

        <!-- Meta -->
        <div style="display: flex; align-items: center; gap: 1rem; font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1rem;">
          <span><i class="fas fa-calendar"></i> ${recordedDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
          <span><i class="fas fa-eye"></i> ${recording.views || 0} views</span>
        </div>

        <!-- Play Button -->
        <button onclick="ZoomManager.playRecording('${recording.id}'); event.stopPropagation();" class="btn btn-primary" style="width: 100%;">
          <i class="fas fa-play"></i> Watch Recording
        </button>
      </div>
    `;
  },

  // Render schedule form for mentors
  renderScheduleForm() {
    const container = document.getElementById('scheduleTab');
    container.innerHTML = `
      <div class="card" style="max-width: 800px; margin: 0 auto; padding: 2rem;">
        <h2 style="margin-bottom: 2rem;">Schedule New Zoom Session</h2>
        
        <form id="scheduleZoomForm" onsubmit="ZoomManager.handleSchedule(event); return false;">
          <!-- Topic -->
          <div class="form-group">
            <label class="form-label">Session Topic *</label>
            <input type="text" name="topic" class="form-input" placeholder="e.g., Introduction to IoT Sensors" required>
          </div>

          <!-- Description -->
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea name="description" class="form-textarea" rows="3" placeholder="What will be covered in this session?"></textarea>
          </div>

          <!-- Grade Selection -->
          <div class="form-group">
            <label class="form-label">Grade Level *</label>
            <select name="grade_id" class="form-select" required>
              <option value="">Select Grade</option>
              <option value="1">Kindergarten</option>
              <option value="2">Grade 1</option>
              <option value="3">Grade 2</option>
              <option value="4">Grade 3-5</option>
              <option value="5">Grade 6-8</option>
              <option value="6">Grade 9-12</option>
            </select>
          </div>

          <!-- Date and Time -->
          <div class="grid grid-2">
            <div class="form-group">
              <label class="form-label">Date *</label>
              <input type="date" name="date" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Time *</label>
              <input type="time" name="time" class="form-input" required>
            </div>
          </div>

          <!-- Duration -->
          <div class="form-group">
            <label class="form-label">Duration (minutes) *</label>
            <select name="duration" class="form-select" required>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60" selected>60 minutes</option>
              <option value="90">90 minutes</option>
              <option value="120">120 minutes</option>
            </select>
          </div>

          <!-- Auto Recording -->
          <div class="form-group">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
              <input type="checkbox" name="auto_record" class="form-checkbox" checked>
              <span style="color: var(--text-secondary);">Automatically record this session</span>
            </label>
          </div>

          <!-- Meeting Password -->
          <div class="form-group">
            <label class="form-label">Meeting Password (Optional)</label>
            <input type="text" name="password" class="form-input" placeholder="Leave empty for no password">
          </div>

          <!-- Submit Buttons -->
          <div style="display: flex; gap: 1rem; margin-top: 2rem;">
            <button type="button" onclick="ZoomManager.switchTab('upcoming')" class="btn btn-secondary" style="flex: 1;">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" style="flex: 2;">
              <i class="fas fa-calendar-plus"></i> Schedule Meeting
            </button>
          </div>
        </form>
      </div>
    `;

    // Set minimum date to today
    const dateInput = document.querySelector('input[name="date"]');
    if (dateInput) {
      dateInput.min = new Date().toISOString().split('T')[0];
    }
  },

  // Handle meeting scheduling
  async handleSchedule(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const data = {
      topic: formData.get('topic'),
      description: formData.get('description'),
      grade_id: formData.get('grade_id'),
      date: formData.get('date'),
      time: formData.get('time'),
      duration: parseInt(formData.get('duration')),
      auto_record: formData.get('auto_record') === 'on',
      password: formData.get('password'),
      mentor_id: AppState.currentUser?.id
    };

    try {
      const response = await fetch('/api/zoom/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Meeting Scheduled Successfully!\n\nMeeting ID: ${result.meeting.id}\nJoin URL: ${result.meeting.join_url}\n\nThe meeting will be automatically recorded.`);
        this.switchTab('upcoming');
      } else {
        alert('❌ Failed to schedule meeting: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Schedule error:', error);
      alert('❌ Failed to schedule meeting. Please try again.');
    }
  },

  // Join Zoom meeting
  joinMeeting(meetingId, joinUrl) {
    // Open in new window
    window.open(joinUrl, '_blank', 'width=1200,height=800');
    
    // Show instructions
    alert('🎥 Zoom Meeting Opening...\n\n' +
      '📱 If you\'re on mobile, the Zoom app will open automatically.\n' +
      '💻 On desktop, you can join via browser or Zoom app.\n\n' +
      'Meeting ID: ' + meetingId);
  },

  // Play recorded session
  playRecording(recordingId) {
    // Open recording modal
    this.showRecordingModal(recordingId);
  },

  // Show recording player modal
  async showRecordingModal(recordingId) {
    try {
      const response = await fetch(`/api/zoom/recording/${recordingId}`);
      const recording = await response.json();

      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal" style="max-width: 1200px; width: 95%;">
          <div class="modal-header">
            <h2 class="modal-title">${recording.topic}</h2>
            <button onclick="this.closest('.modal-overlay').remove()" class="modal-close">×</button>
          </div>
          
          <div style="padding: 2rem;">
            <!-- Video Player -->
            <div style="position: relative; padding-bottom: 56.25%; height: 0; background: #000; border-radius: var(--radius-md); overflow: hidden; margin-bottom: 2rem;">
              <video controls style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" autoplay>
                <source src="${recording.video_url}" type="video/mp4">
                Your browser does not support the video tag.
              </video>
            </div>

            <!-- Recording Info -->
            <div class="grid grid-2" style="margin-bottom: 2rem;">
              <div>
                <h4 style="margin-bottom: 1rem;">Session Details</h4>
                <div style="display: grid; gap: 0.75rem; font-size: 0.95rem;">
                  <div><strong>Grade:</strong> ${recording.grade_name}</div>
                  <div><strong>Duration:</strong> ${Math.floor(recording.duration / 60)} minutes</div>
                  <div><strong>Recorded:</strong> ${new Date(recording.recorded_at).toLocaleDateString()}</div>
                  <div><strong>Mentor:</strong> ${recording.mentor_name}</div>
                </div>
              </div>
              <div>
                <h4 style="margin-bottom: 1rem;">Description</h4>
                <p style="color: var(--text-secondary);">${recording.description || 'No description provided'}</p>
              </div>
            </div>

            <!-- Download Button -->
            <button onclick="window.open('${recording.download_url}', '_blank')" class="btn btn-secondary">
              <i class="fas fa-download"></i> Download Recording
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Track view
      await fetch(`/api/zoom/recording/${recordingId}/view`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to load recording:', error);
      alert('Failed to load recording. Please try again.');
    }
  },

  // Add to calendar
  addToCalendar(sessionId) {
    alert('📅 Calendar integration coming soon!\n\nYou can manually add this to your calendar.');
  }
};

// Add to global scope
window.ZoomManager = ZoomManager;

// Navigation function
window.showZoomSessions = function() {
  AppState.currentView = 'zoom';
  document.getElementById('app').innerHTML = ZoomManager.renderZoomSessions();
  ZoomManager.loadUpcomingSessions();
};

console.log('✅ Zoom Integration Loaded: Meeting Scheduling & Recording');
