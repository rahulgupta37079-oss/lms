// ============================================
// PASSIONBOTS LMS - LESSON INTERFACE
// Course viewer with live sessions, recordings, and content
// ============================================

const LessonInterface = {
  
  currentLesson: null,
  currentCourse: null,
  
  // Render full lesson interface
  renderLessonInterface(courseId, lessonId) {
    this.currentCourse = courseId;
    this.currentLesson = lessonId;
    
    return `
      <div class="lesson-container" style="display: flex; height: 100vh; overflow: hidden; background: var(--bg-primary);">
        
        <!-- Sidebar -->
        ${this.renderSidebar()}
        
        <!-- Main Content Area -->
        <div class="lesson-main" style="flex: 1; display: flex; flex-direction: column; overflow-y: auto;">
          
          <!-- Header Tabs -->
          ${this.renderTabs()}
          
          <!-- Video/Content Area -->
          <div class="lesson-content" style="flex: 1; background: var(--bg-secondary); padding: 2rem;">
            
            <!-- Lesson Title -->
            <div style="margin-bottom: 1.5rem;">
              <h2 style="color: var(--text-primary); font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">
                Introduction to Robotics - MCQ
              </h2>
              <p style="color: var(--text-secondary); font-size: 0.9rem;">
                <i class="fas fa-graduation-cap"></i> Online Exercise
              </p>
            </div>
            
            <!-- Video Player / Content Area -->
            ${this.renderVideoPlayer()}
            
            <!-- Live Session Controls (if live) -->
            ${this.renderLiveControls()}
            
            <!-- Participant Grid (if live) -->
            ${this.renderParticipantGrid()}
            
          </div>
          
        </div>
        
        <!-- Right Sidebar (Participants/Chat) -->
        ${this.renderRightSidebar()}
        
      </div>
    `;
  },
  
  // Sidebar with course contents
  renderSidebar() {
    const days = [
      { day: 11, title: 'Doubt Session (Industrial Design- Installation)', lessons: 2, completed: 0 },
      { day: 12, title: 'Career Guidance', lessons: 1, completed: 0 },
      { day: 13, title: 'Electrical Insights to a Robot', lessons: 4, completed: 0 },
      { day: 14, title: 'Doubt Session (Industrial Design contd)', lessons: 1, completed: 0 },
      { day: 15, title: 'Software Simulation', lessons: 3, completed: 0, active: true },
      { day: 16, title: 'Robotics and IOT', lessons: 3, completed: 0 },
      { day: 17, title: 'Robotic IOT', lessons: 3, completed: 0 },
      { day: 18, title: 'Doubt Session (Electronics)', lessons: 1, completed: 0 },
      { day: 19, title: 'Career Guidance Session', lessons: 1, completed: 0 },
      { day: 20, title: 'Robotics and IOT Continued', lessons: 3, completed: 0 },
      { day: 21, title: 'Robotics and IOT Continued', lessons: 3, completed: 0 },
      { day: 22, title: 'Electronics and IOT', lessons: 3, completed: 0 },
    ];
    
    return `
      <div class="lesson-sidebar" style="
        width: 280px;
        background: var(--bg-card);
        border-right: 1px solid var(--border-color);
        overflow-y: auto;
        padding: 1.5rem 0;
      ">
        
        <!-- Header -->
        <div style="padding: 0 1.5rem 1rem; border-bottom: 1px solid var(--border-color);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
            <h3 style="color: var(--text-primary); font-size: 1rem; font-weight: 700; margin: 0;">
              CONTENTS
            </h3>
            <button onclick="LessonInterface.toggleSidebar()" style="
              background: none;
              border: none;
              color: var(--text-secondary);
              cursor: pointer;
              font-size: 1.2rem;
              padding: 0;
            ">
              <i class="fas fa-times-circle"></i>
            </button>
          </div>
        </div>
        
        <!-- Day/Lesson List -->
        <div style="padding: 1rem 0;">
          ${days.map((day, index) => `
            <div class="day-item ${day.active ? 'active' : ''}" style="
              padding: 0.75rem 1.5rem;
              cursor: pointer;
              transition: all 0.2s;
              ${day.active ? 'background: rgba(255, 215, 0, 0.1); border-left: 3px solid var(--accent-yellow);' : ''}
            " onclick="LessonInterface.toggleDay(${index})">
              
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <i class="fas fa-chevron-${day.active ? 'down' : 'right'}" style="color: var(--text-secondary); font-size: 0.75rem;"></i>
                  <span style="color: var(--text-primary); font-size: 0.9rem; font-weight: ${day.active ? '700' : '600'};">
                    DAY ${day.day}
                  </span>
                </div>
                <span style="
                  color: var(--text-secondary);
                  font-size: 0.8rem;
                  background: var(--bg-primary);
                  padding: 0.15rem 0.5rem;
                  border-radius: 12px;
                ">
                  ${day.completed} / ${day.lessons}
                </span>
              </div>
              
              <div style="color: var(--text-secondary); font-size: 0.85rem; padding-left: 1.25rem;">
                ${day.title}
              </div>
              
              ${day.active ? `
                <div style="margin-top: 0.75rem; padding-left: 1.25rem; font-size: 0.85rem;">
                  <div style="padding: 0.5rem 0; color: var(--text-secondary);">
                    <i class="fas fa-play-circle" style="margin-right: 0.5rem; color: var(--accent-yellow);"></i>
                    Lesson ${day.day}.1: Introduction
                  </div>
                  <div style="padding: 0.5rem 0; color: var(--text-secondary);">
                    <i class="fas fa-file-alt" style="margin-right: 0.5rem;"></i>
                    Lesson ${day.day}.2: MCQ Test
                  </div>
                  <div style="padding: 0.5rem 0; color: var(--text-secondary);">
                    <i class="fas fa-video" style="margin-right: 0.5rem;"></i>
                    Lesson ${day.day}.3: Live Session
                  </div>
                </div>
              ` : ''}
              
            </div>
          `).join('')}
        </div>
        
      </div>
    `;
  },
  
  // Header tabs
  renderTabs() {
    const tabs = ['Lesson', 'Course Overview', 'Class Records', 'Announcements', 'More'];
    
    return `
      <div class="lesson-tabs" style="
        display: flex;
        gap: 2rem;
        padding: 1rem 2rem;
        border-bottom: 2px solid var(--border-color);
        background: var(--bg-card);
      ">
        ${tabs.map((tab, index) => `
          <button onclick="LessonInterface.switchTab('${tab.toLowerCase()}')" 
            class="lesson-tab ${index === 0 ? 'active' : ''}" 
            style="
              background: none;
              border: none;
              color: ${index === 0 ? 'var(--accent-yellow)' : 'var(--text-secondary)'};
              font-size: 0.95rem;
              font-weight: ${index === 0 ? '700' : '600'};
              padding: 0.5rem 0;
              cursor: pointer;
              border-bottom: ${index === 0 ? '3px solid var(--accent-yellow)' : '3px solid transparent'};
              transition: all 0.2s;
            "
            onmouseover="this.style.color='var(--accent-yellow)'"
            onmouseout="this.style.color='${index === 0 ? 'var(--accent-yellow)' : 'var(--text-secondary)'}'"
          >
            ${tab}
          </button>
        `).join('')}
      </div>
    `;
  },
  
  // Video player area
  renderVideoPlayer() {
    return `
      <div class="video-player" style="
        background: #1a1a2e;
        border-radius: var(--radius-lg);
        overflow: hidden;
        box-shadow: var(--shadow-lg);
        margin-bottom: 1.5rem;
      ">
        
        <!-- Video Content -->
        <div style="position: relative; padding-top: 56.25%; background: linear-gradient(135deg, #2a1a4a 0%, #1a1a3a 100%);">
          
          <!-- Placeholder for video/content -->
          <div style="
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 1rem;
          ">
            <div style="
              width: 90%;
              height: 90%;
              background: white;
              border-radius: var(--radius-md);
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
              overflow: hidden;
            ">
              <!-- Simulation/Content Image Placeholder -->
              <img src="https://via.placeholder.com/800x450/667eea/ffffff?text=Software+Simulation" 
                alt="Lesson Content" 
                style="width: 100%; height: 100%; object-fit: cover;"
              />
              
              <!-- Play Overlay (if recorded) -->
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 80px;
                height: 80px;
                background: rgba(255, 215, 0, 0.9);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(255, 215, 0, 0.5);
              " onclick="LessonInterface.playVideo()">
                <i class="fas fa-play" style="color: #000; font-size: 2rem; margin-left: 0.25rem;"></i>
              </div>
            </div>
          </div>
          
        </div>
        
      </div>
    `;
  },
  
  // Live session controls
  renderLiveControls() {
    const isLive = true; // Set based on session status
    
    if (!isLive) return '';
    
    return `
      <div class="live-controls" style="
        background: var(--bg-card);
        border-radius: var(--radius-md);
        padding: 1rem 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.5rem;
        border: 1px solid var(--border-color);
      ">
        
        <!-- Live Indicator & Timer -->
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div style="
            background: #ff4444;
            color: white;
            padding: 0.35rem 0.75rem;
            border-radius: var(--radius-sm);
            font-size: 0.8rem;
            font-weight: 700;
            animation: pulse 2s infinite;
          ">
            LIVE
          </div>
          <div style="color: var(--text-primary); font-size: 1rem; font-weight: 600; font-family: monospace;">
            01:48:09
          </div>
        </div>
        
        <!-- Control Buttons -->
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          
          <!-- Microphone -->
          <button class="control-btn" style="
            background: var(--bg-hover);
            border: none;
            width: 42px;
            height: 42px;
            border-radius: 50%;
            color: var(--text-primary);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          " onclick="LessonInterface.toggleMic()">
            <i class="fas fa-microphone"></i>
          </button>
          
          <!-- Camera -->
          <button class="control-btn" style="
            background: var(--bg-hover);
            border: none;
            width: 42px;
            height: 42px;
            border-radius: 50%;
            color: var(--text-primary);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          " onclick="LessonInterface.toggleCamera()">
            <i class="fas fa-video"></i>
          </button>
          
          <!-- Screen Share -->
          <button class="control-btn" style="
            background: var(--bg-hover);
            border: none;
            width: 42px;
            height: 42px;
            border-radius: 50%;
            color: var(--text-primary);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          " onclick="LessonInterface.shareScreen()">
            <i class="fas fa-desktop"></i>
          </button>
          
          <!-- Raise Hand -->
          <button class="control-btn" style="
            background: var(--bg-hover);
            border: none;
            width: 42px;
            height: 42px;
            border-radius: 50%;
            color: var(--text-primary);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          " onclick="LessonInterface.raiseHand()">
            <i class="fas fa-hand-paper"></i>
          </button>
          
          <!-- Leave -->
          <button style="
            background: #ff4444;
            border: none;
            width: 42px;
            height: 42px;
            border-radius: 50%;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          " onclick="LessonInterface.leaveSession()">
            <i class="fas fa-phone-slash"></i>
          </button>
          
          <!-- Like -->
          <button style="
            background: #4267B2;
            border: none;
            width: 42px;
            height: 42px;
            border-radius: 50%;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          " onclick="LessonInterface.sendLike()">
            <i class="fas fa-thumbs-up"></i>
          </button>
          
        </div>
        
        <!-- Participant Count -->
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <i class="fas fa-users" style="color: var(--text-secondary);"></i>
          <span style="color: var(--text-primary); font-weight: 600;">35</span>
        </div>
        
      </div>
    `;
  },
  
  // Participant grid
  renderParticipantGrid() {
    const participants = [
      { name: 'Mentor', role: 'Speaker', avatar: 'https://ui-avatars.com/api/?name=Mentor&background=FFD700&color=000' },
      { name: 'Vivek Tamboli', avatar: 'https://ui-avatars.com/api/?name=Vivek+Tamboli&background=667eea&color=fff' },
      { name: 'Kaushik Chaudhari', avatar: 'https://ui-avatars.com/api/?name=Kaushik+Chaudhari&background=764ba2&color=fff' },
      { name: 'Parth Babre', avatar: 'https://ui-avatars.com/api/?name=Parth+Babre&background=f093fb&color=000' },
      { name: 'Aishali Agarwal', avatar: 'https://ui-avatars.com/api/?name=Aishali+Agarwal&background=4facfe&color=fff' },
    ];
    
    return `
      <div class="participant-grid" style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 1rem;
        margin-top: 1.5rem;
      ">
        
        ${participants.map(p => `
          <div class="participant-card" style="
            background: var(--bg-card);
            border-radius: var(--radius-md);
            overflow: hidden;
            border: 2px solid ${p.role === 'Speaker' ? 'var(--accent-yellow)' : 'var(--border-color)'};
            position: relative;
          ">
            
            <!-- Video/Avatar -->
            <div style="
              aspect-ratio: 16/9;
              background: linear-gradient(135deg, #1a1a2e 0%, #2a2a3e 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
            ">
              <img src="${p.avatar}" alt="${p.name}" style="
                width: 80px;
                height: 80px;
                border-radius: 50%;
                border: 3px solid ${p.role === 'Speaker' ? 'var(--accent-yellow)' : 'var(--border-color)'};
              "/>
              
              ${p.role === 'Speaker' ? `
                <div style="
                  position: absolute;
                  bottom: 0.5rem;
                  left: 0.5rem;
                  background: var(--accent-yellow);
                  color: #000;
                  padding: 0.25rem 0.5rem;
                  border-radius: 6px;
                  font-size: 0.7rem;
                  font-weight: 700;
                ">
                  Speaker
                </div>
              ` : ''}
              
              <!-- Mic Status -->
              <div style="
                position: absolute;
                bottom: 0.5rem;
                right: 0.5rem;
                background: rgba(0, 0, 0, 0.7);
                width: 28px;
                height: 28px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <i class="fas fa-microphone-slash" style="color: #ff4444; font-size: 0.75rem;"></i>
              </div>
            </div>
            
            <!-- Name -->
            <div style="
              padding: 0.75rem;
              text-align: center;
              background: var(--bg-hover);
            ">
              <div style="color: var(--text-primary); font-size: 0.85rem; font-weight: 600;">
                ${p.name}
              </div>
            </div>
            
          </div>
        `).join('')}
        
      </div>
      
      <style>
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .control-btn:hover {
          background: var(--accent-yellow) !important;
          color: #000 !important;
          transform: scale(1.1);
        }
        
        .participant-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }
      </style>
    `;
  },
  
  // Right sidebar with chat/participants
  renderRightSidebar() {
    const participants = [
      'Vivek Tamboli',
      'Kaushik Chaudhari',
      'Parth Babre',
      'Aishali Agarwal',
      'Divya',
      'Mohit'
    ];
    
    return `
      <div class="right-sidebar" style="
        width: 280px;
        background: var(--bg-card);
        border-left: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      ">
        
        <!-- Participant List Header -->
        <div style="
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-hover);
        ">
          <h3 style="color: var(--text-primary); font-size: 0.95rem; font-weight: 700; margin: 0;">
            <i class="fas fa-users"></i> Participants (35)
          </h3>
        </div>
        
        <!-- Participant List -->
        <div style="flex: 1; overflow-y: auto; padding: 0.5rem 0;">
          ${participants.map(name => `
            <div class="participant-item" style="
              padding: 0.75rem 1.5rem;
              display: flex;
              align-items: center;
              gap: 0.75rem;
              cursor: pointer;
              transition: all 0.2s;
            " onmouseover="this.style.background='var(--bg-hover)'" 
               onmouseout="this.style.background='transparent'">
              
              <img src="https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=667eea&color=fff" 
                alt="${name}" 
                style="width: 36px; height: 36px; border-radius: 50%;"
              />
              
              <div style="flex: 1;">
                <div style="color: var(--text-primary); font-size: 0.9rem; font-weight: 600;">
                  ${name}
                </div>
                <div style="color: var(--text-secondary); font-size: 0.75rem;">
                  Student
                </div>
              </div>
              
              <div style="
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #4ade80;
              "></div>
              
            </div>
          `).join('')}
        </div>
        
        <!-- Chat Input -->
        <div style="
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--border-color);
          background: var(--bg-hover);
        ">
          <input type="text" placeholder="Type here..." style="
            width: 100%;
            padding: 0.75rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-sm);
            color: var(--text-primary);
            font-size: 0.9rem;
          " />
        </div>
        
      </div>
    `;
  },
  
  // Event handlers
  toggleSidebar() {
    console.log('Toggle sidebar');
  },
  
  toggleDay(index) {
    console.log('Toggle day:', index);
    // Reload interface with updated state
  },
  
  switchTab(tab) {
    console.log('Switch to tab:', tab);
  },
  
  playVideo() {
    console.log('Play video');
  },
  
  toggleMic() {
    console.log('Toggle microphone');
  },
  
  toggleCamera() {
    console.log('Toggle camera');
  },
  
  shareScreen() {
    console.log('Share screen');
  },
  
  raiseHand() {
    console.log('Raise hand');
  },
  
  leaveSession() {
    if (confirm('Are you sure you want to leave this session?')) {
      navigateTo('dashboard');
    }
  },
  
  sendLike() {
    console.log('Send like');
    // Show thumbs up animation
  }
  
};

// Make available globally
window.LessonInterface = LessonInterface;

console.log('✅ Lesson Interface Loaded: Course viewer with live sessions');
