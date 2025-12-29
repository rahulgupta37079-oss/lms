// ============================================
// PASSIONBOTS LMS - ENHANCED LESSON INTERFACE
// Real-time course viewer with live sessions, chat, and interactions
// ============================================

const LessonInterface = {
  
  currentLesson: null,
  currentCourse: null,
  courseStructure: null,
  chatMessages: [],
  participants: [],
  videoPlayer: null,
  chatPollInterval: null,
  
  // Initialize and render full lesson interface
  async renderLessonInterface(courseId, lessonId) {
    this.currentCourse = courseId;
    this.currentLesson = lessonId;
    
    // Load course structure
    await this.loadCourseStructure(courseId);
    
    // Load lesson details
    await this.loadLessonDetails(lessonId);
    
    // Render UI
    const html = `
      <div class="lesson-container" style="display: flex; height: 100vh; overflow: hidden; background: var(--bg-primary);">
        
        <!-- Sidebar -->
        <div id="lessonSidebar">${this.renderSidebar()}</div>
        
        <!-- Main Content Area -->
        <div class="lesson-main" style="flex: 1; display: flex; flex-direction: column; overflow-y: auto;">
          
          <!-- Header Tabs -->
          ${this.renderTabs()}
          
          <!-- Content Area -->
          <div class="lesson-content" id="lessonContent" style="flex: 1; background: var(--bg-secondary); padding: 2rem;">
            ${this.renderContent()}
          </div>
          
        </div>
        
        <!-- Right Sidebar (Participants/Chat) -->
        <div id="rightSidebar">${this.renderRightSidebar()}</div>
        
      </div>
    `;
    
    // Start chat polling if live session
    if (this.lessonData?.liveSession) {
      this.startChatPolling();
    }
    
    return html;
  },
  
  // Load course structure from API
  async loadCourseStructure(courseId) {
    try {
      const response = await fetch(`/api/courses/${courseId}/structure`);
      const data = await response.json();
      
      if (data.success) {
        this.courseStructure = data;
        console.log('✅ Course structure loaded:', data.days.length, 'days');
      }
    } catch (error) {
      console.error('Failed to load course structure:', error);
    }
  },
  
  // Load lesson details from API
  async loadLessonDetails(lessonId) {
    try {
      const studentId = AppState.currentUser?.id || 1;
      const response = await fetch(`/api/lessons/${lessonId}?student_id=${studentId}`);
      const data = await response.json();
      
      if (data.success) {
        this.lessonData = data;
        console.log('✅ Lesson loaded:', data.lesson.title);
        
        // Load participants if live session
        if (data.liveSession) {
          await this.loadParticipants(lessonId);
        }
        
        // Load chat history
        await this.loadChatHistory(lessonId);
      }
    } catch (error) {
      console.error('Failed to load lesson:', error);
    }
  },
  
  // Load participants
  async loadParticipants(sessionId) {
    try {
      const response = await fetch(`/api/live-sessions/${sessionId}/participants`);
      const data = await response.json();
      
      if (data.success) {
        this.participants = data.participants;
      }
    } catch (error) {
      console.error('Failed to load participants:', error);
    }
  },
  
  // Load chat history
  async loadChatHistory(sessionId) {
    try {
      const response = await fetch(`/api/live-sessions/${sessionId}/chat?limit=50`);
      const data = await response.json();
      
      if (data.success) {
        this.chatMessages = data.messages;
        this.renderChatMessages();
      }
    } catch (error) {
      console.error('Failed to load chat:', error);
    }
  },
  
  // Start polling for new chat messages
  startChatPolling() {
    if (this.chatPollInterval) {
      clearInterval(this.chatPollInterval);
    }
    
    this.chatPollInterval = setInterval(() => {
      this.loadChatHistory(this.currentLesson);
    }, 3000); // Poll every 3 seconds
  },
  
  // Sidebar with course contents
  renderSidebar() {
    if (!this.courseStructure) {
      return '<div style="padding: 2rem; color: var(--text-secondary);">Loading...</div>';
    }
    
    const days = this.courseStructure.days || [];
    
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
            <button onclick="LessonInterface.closeSidebar()" style="
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
          <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0;">
            ${this.courseStructure.course?.title || 'Course'}
          </p>
        </div>
        
        <!-- Day/Lesson List -->
        <div style="padding: 1rem 0;">
          ${days.map((day) => this.renderDayItem(day)).join('')}
        </div>
        
      </div>
    `;
  },
  
  // Render single day item
  renderDayItem(day) {
    const isActive = day.sessions.some(s => s.id === this.currentLesson);
    
    return `
      <div class="day-item ${isActive ? 'active' : ''}" id="day-${day.day}" style="
        padding: 0.75rem 1.5rem;
        cursor: pointer;
        transition: all 0.2s;
        ${isActive ? 'background: rgba(255, 215, 0, 0.1); border-left: 3px solid var(--accent-yellow);' : ''}
      " onclick="LessonInterface.toggleDay(${day.day})">
        
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-chevron-${isActive ? 'down' : 'right'}" id="chevron-${day.day}" style="color: var(--text-secondary); font-size: 0.75rem;"></i>
            <span style="color: var(--text-primary); font-size: 0.9rem; font-weight: ${isActive ? '700' : '600'};">
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
        
        <div id="lessons-${day.day}" style="display: ${isActive ? 'block' : 'none'}; margin-top: 0.75rem; padding-left: 1.25rem; font-size: 0.85rem;">
          ${day.sessions.map((session, idx) => `
            <div onclick="LessonInterface.loadLesson(${session.id}); event.stopPropagation();" style="
              padding: 0.5rem 0;
              color: ${session.id === this.currentLesson ? 'var(--accent-yellow)' : 'var(--text-secondary)'};
              cursor: pointer;
              font-weight: ${session.id === this.currentLesson ? '600' : '400'};
            " onmouseover="this.style.color='var(--accent-yellow)'" 
               onmouseout="this.style.color='${session.id === this.currentLesson ? 'var(--accent-yellow)' : 'var(--text-secondary)'}'">
              ${this.getSessionIcon(session.type)} ${session.title || `Lesson ${day.day}.${idx + 1}`}
            </div>
          `).join('')}
        </div>
        
      </div>
    `;
  },
  
  // Get icon for session type
  getSessionIcon(type) {
    const icons = {
      'lesson': '<i class="fas fa-play-circle"></i>',
      'mcq': '<i class="fas fa-file-alt"></i>',
      'live': '<i class="fas fa-video"></i>',
      'project': '<i class="fas fa-project-diagram"></i>'
    };
    return icons[type] || '<i class="fas fa-book"></i>';
  },
  
  // Toggle day expansion
  toggleDay(dayNum) {
    const lessonsDiv = document.getElementById(`lessons-${dayNum}`);
    const chevron = document.getElementById(`chevron-${dayNum}`);
    
    if (lessonsDiv.style.display === 'none') {
      lessonsDiv.style.display = 'block';
      chevron.className = 'fas fa-chevron-down';
    } else {
      lessonsDiv.style.display = 'none';
      chevron.className = 'fas fa-chevron-right';
    }
  },
  
  // Load different lesson
  async loadLesson(lessonId) {
    this.currentLesson = lessonId;
    await this.loadLessonDetails(lessonId);
    
    // Re-render content area
    document.getElementById('lessonContent').innerHTML = this.renderContent();
    document.getElementById('lessonSidebar').innerHTML = this.renderSidebar();
    
    // Update progress
    this.updateProgress(25); // 25% for viewing
  },
  
  // Header tabs
  renderTabs() {
    const tabs = ['Lesson', 'Course Overview', 'Class Records', 'Announcements', 'More'];
    this.activeTab = this.activeTab || 'lesson';
    
    return `
      <div class="lesson-tabs" style="
        display: flex;
        gap: 2rem;
        padding: 1rem 2rem;
        border-bottom: 2px solid var(--border-color);
        background: var(--bg-card);
      ">
        ${tabs.map((tab) => {
          const tabId = tab.toLowerCase().replace(' ', '-');
          const isActive = this.activeTab === tabId;
          
          return `
            <button onclick="LessonInterface.switchTab('${tabId}')" 
              class="lesson-tab ${isActive ? 'active' : ''}" 
              style="
                background: none;
                border: none;
                color: ${isActive ? 'var(--accent-yellow)' : 'var(--text-secondary)'};
                font-size: 0.95rem;
                font-weight: ${isActive ? '700' : '600'};
                padding: 0.5rem 0;
                cursor: pointer;
                border-bottom: ${isActive ? '3px solid var(--accent-yellow)' : '3px solid transparent'};
                transition: all 0.2s;
              "
            >
              ${tab}
            </button>
          `;
        }).join('')}
      </div>
    `;
  },
  
  // Switch tab
  switchTab(tab) {
    this.activeTab = tab;
    document.getElementById('lessonContent').innerHTML = this.renderContent();
  },
  
  // Main content based on active tab
  renderContent() {
    switch(this.activeTab) {
      case 'lesson':
        return this.renderLessonTab();
      case 'course-overview':
        return this.renderCourseOverview();
      case 'class-records':
        return this.renderClassRecords();
      case 'announcements':
        return this.renderAnnouncements();
      default:
        return this.renderLessonTab();
    }
  },
  
  // Lesson tab content
  renderLessonTab() {
    if (!this.lessonData) {
      return '<div style="padding: 2rem; text-align: center;"><h2>Loading lesson...</h2></div>';
    }
    
    const lesson = this.lessonData.lesson;
    const isLive = this.lessonData.liveSession && new Date(this.lessonData.liveSession.scheduled_time) < new Date();
    const hasRecording = this.lessonData.recordings && this.lessonData.recordings.length > 0;
    
    return `
      <!-- Lesson Title -->
      <div style="margin-bottom: 1.5rem;">
        <h2 style="color: var(--text-primary); font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">
          ${lesson.title}
        </h2>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">
          <i class="fas fa-graduation-cap"></i> ${lesson.description || 'Interactive Lesson'}
        </p>
      </div>
      
      <!-- Video Player / Content Area -->
      ${hasRecording ? this.renderVideoPlayer() : this.renderContentPlaceholder()}
      
      <!-- Live Session Controls (if live) -->
      ${isLive ? this.renderLiveControls() : ''}
      
      <!-- Participant Grid (if live) -->
      ${isLive ? this.renderParticipantGrid() : ''}
      
      <!-- Learning Objectives -->
      ${this.renderObjectives()}
      
      <!-- Quiz/MCQ Section -->
      ${lesson.type === 'mcq' ? this.renderQuizSection() : ''}
    `;
  },
  
  // Video player with controls
  renderVideoPlayer() {
    const recording = this.lessonData.recordings[0];
    
    return `
      <div class="video-container" style="margin-bottom: 2rem;">
        <video id="lessonVideo" controls style="
          width: 100%;
          max-height: 600px;
          background: #000;
          border-radius: var(--radius-lg);
        " 
        onplay="LessonInterface.onVideoPlay()"
        ontimeupdate="LessonInterface.onVideoProgress()"
        onended="LessonInterface.onVideoEnd()">
          <source src="/api/zoom/recordings/${recording.recording_id}/stream" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        
        <!-- Custom Controls -->
        <div style="
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--bg-card);
          border-radius: 0 0 var(--radius-lg) var(--radius-lg);
          margin-top: -0.5rem;
        ">
          <button onclick="LessonInterface.togglePlay()" id="playBtn" style="
            background: var(--accent-yellow);
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            color: #000;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <i class="fas fa-play" id="playIcon"></i>
          </button>
          
          <input type="range" id="seekBar" min="0" max="100" value="0" 
            oninput="LessonInterface.seekVideo(this.value)"
            style="flex: 1; height: 6px; cursor: pointer;">
          
          <span id="timeDisplay" style="color: var(--text-secondary); font-family: monospace;">
            0:00 / 0:00
          </span>
          
          <button onclick="LessonInterface.toggleMute()" style="
            background: var(--bg-hover);
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            color: var(--text-primary);
            cursor: pointer;
          ">
            <i class="fas fa-volume-up" id="volumeIcon"></i>
          </button>
          
          <button onclick="LessonInterface.toggleFullscreen()" style="
            background: var(--bg-hover);
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            color: var(--text-primary);
            cursor: pointer;
          ">
            <i class="fas fa-expand"></i>
          </button>
        </div>
      </div>
    `;
  },
  
  // Content placeholder for lessons without recording
  renderContentPlaceholder() {
    return `
      <div style="
        background: linear-gradient(135deg, #2a1a4a 0%, #1a1a3a 100%);
        border-radius: var(--radius-lg);
        padding: 4rem 2rem;
        text-align: center;
        margin-bottom: 2rem;
      ">
        <div style="
          width: 120px;
          height: 120px;
          background: var(--gradient-yellow);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem;
        ">
          <i class="fas fa-book-open" style="font-size: 3rem; color: #000;"></i>
        </div>
        <h3 style="color: var(--text-primary); font-size: 1.5rem; margin-bottom: 1rem;">
          ${this.lessonData.lesson.title}
        </h3>
        <p style="color: var(--text-secondary); max-width: 600px; margin: 0 auto;">
          ${this.lessonData.lesson.description}
        </p>
      </div>
    `;
  },
  
  // Learning objectives
  renderObjectives() {
    if (!this.lessonData?.lesson.objectives || this.lessonData.lesson.objectives.length === 0) {
      return '';
    }
    
    return `
      <div style="
        background: var(--bg-card);
        border-radius: var(--radius-md);
        padding: 1.5rem;
        margin-bottom: 2rem;
      ">
        <h3 style="color: var(--text-primary); font-size: 1.2rem; margin-bottom: 1rem;">
          <i class="fas fa-bullseye" style="color: var(--accent-yellow);"></i> Learning Objectives
        </h3>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${this.lessonData.lesson.objectives.map(obj => `
            <li style="
              padding: 0.75rem;
              margin-bottom: 0.5rem;
              background: var(--bg-hover);
              border-radius: var(--radius-sm);
              color: var(--text-primary);
              display: flex;
              align-items: start;
              gap: 0.75rem;
            ">
              <i class="fas fa-check-circle" style="color: var(--accent-yellow); margin-top: 0.25rem;"></i>
              <span>${obj}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  },
  
  // Quiz/MCQ section
  renderQuizSection() {
    return `
      <div id="quizContainer" style="
        background: var(--bg-card);
        border-radius: var(--radius-md);
        padding: 2rem;
        margin-top: 2rem;
      ">
        <h3 style="color: var(--text-primary); font-size: 1.3rem; margin-bottom: 1.5rem;">
          <i class="fas fa-question-circle" style="color: var(--accent-yellow);"></i> Quick Assessment
        </h3>
        
        <div id="quizQuestions">
          ${this.renderQuizQuestions()}
        </div>
      </div>
    `;
  },
  
  // Render quiz questions
  renderQuizQuestions() {
    // Mock quiz data - replace with real data from API
    const questions = [
      {
        id: 1,
        question: 'What is the primary purpose of a sensor in robotics?',
        options: [
          'To provide power',
          'To detect environmental conditions',
          'To store data',
          'To display information'
        ],
        correct: 1
      }
    ];
    
    return questions.map((q, idx) => `
      <div style="margin-bottom: 2rem;">
        <p style="color: var(--text-primary); font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem;">
          ${idx + 1}. ${q.question}
        </p>
        
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${q.options.map((option, optIdx) => `
            <label style="
              display: flex;
              align-items: center;
              padding: 1rem;
              background: var(--bg-hover);
              border-radius: var(--radius-sm);
              cursor: pointer;
              transition: all 0.2s;
            " onmouseover="this.style.background='var(--bg-primary)'" 
               onmouseout="this.style.background='var(--bg-hover)'">
              <input type="radio" name="q${q.id}" value="${optIdx}" 
                onchange="LessonInterface.checkAnswer(${q.id}, ${optIdx}, ${q.correct})"
                style="margin-right: 1rem;">
              <span style="color: var(--text-primary);">${option}</span>
            </label>
          `).join('')}
        </div>
        
        <div id="feedback-${q.id}" style="margin-top: 1rem;"></div>
      </div>
    `).join('');
  },
  
  // Check quiz answer
  async checkAnswer(questionId, selected, correct) {
    const isCorrect = selected === correct;
    const feedback = document.getElementById(`feedback-${questionId}`);
    
    feedback.innerHTML = `
      <div style="
        padding: 1rem;
        border-radius: var(--radius-sm);
        background: ${isCorrect ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)'};
        border-left: 4px solid ${isCorrect ? '#4ade80' : '#f87171'};
        color: ${isCorrect ? '#4ade80' : '#f87171'};
      ">
        <i class="fas fa-${isCorrect ? 'check' : 'times'}-circle"></i>
        ${isCorrect ? 'Correct! Well done!' : 'Incorrect. Try reviewing the lesson content.'}
      </div>
    `;
    
    // Submit to API
    try {
      const studentId = AppState.currentUser?.id || 1;
      await fetch(`/api/lessons/${this.currentLesson}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          question_id: questionId,
          selected_answer: selected,
          is_correct: isCorrect
        })
      });
      
      if (isCorrect) {
        this.updateProgress(100); // 100% for completing quiz
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  },
  
  // Course overview tab
  renderCourseOverview() {
    return `
      <div style="padding: 2rem;">
        <h2 style="color: var(--text-primary); font-size: 1.8rem; margin-bottom: 1.5rem;">
          Course Overview
        </h2>
        <p style="color: var(--text-secondary); line-height: 1.8;">
          ${this.courseStructure?.course?.description || 'Comprehensive robotics and IoT curriculum covering sensors, automation, and programming.'}
        </p>
        
        <div style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        ">
          <div style="background: var(--bg-card); padding: 1.5rem; border-radius: var(--radius-md);">
            <h4 style="color: var(--accent-yellow); font-size: 2rem; margin-bottom: 0.5rem;">
              ${this.courseStructure?.days?.length || 12}
            </h4>
            <p style="color: var(--text-secondary);">Days of Content</p>
          </div>
          
          <div style="background: var(--bg-card); padding: 1.5rem; border-radius: var(--radius-md);">
            <h4 style="color: var(--accent-yellow); font-size: 2rem; margin-bottom: 0.5rem;">
              ${this.courseStructure?.days?.reduce((acc, day) => acc + day.lessons, 0) || 36}
            </h4>
            <p style="color: var(--text-secondary);">Total Lessons</p>
          </div>
          
          <div style="background: var(--bg-card); padding: 1.5rem; border-radius: var(--radius-md);">
            <h4 style="color: var(--accent-yellow); font-size: 2rem; margin-bottom: 0.5rem;">
              ${this.lessonData?.lesson.duration || 60} min
            </h4>
            <p style="color: var(--text-secondary);">Per Lesson</p>
          </div>
        </div>
      </div>
    `;
  },
  
  // Class records tab
  renderClassRecords() {
    const recordings = this.lessonData?.recordings || [];
    
    return `
      <div style="padding: 2rem;">
        <h2 style="color: var(--text-primary); font-size: 1.8rem; margin-bottom: 1.5rem;">
          Class Recordings
        </h2>
        
        ${recordings.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${recordings.map(rec => `
              <div style="
                background: var(--bg-card);
                padding: 1.5rem;
                border-radius: var(--radius-md);
                display: flex;
                align-items: center;
                gap: 1.5rem;
              ">
                <div style="
                  width: 80px;
                  height: 80px;
                  background: var(--gradient-yellow);
                  border-radius: var(--radius-md);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                ">
                  <i class="fas fa-video" style="font-size: 2rem; color: #000;"></i>
                </div>
                
                <div style="flex: 1;">
                  <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">
                    ${rec.file_name}
                  </h4>
                  <p style="color: var(--text-secondary); font-size: 0.9rem;">
                    Recorded: ${new Date(rec.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <button onclick="LessonInterface.playRecording(${rec.recording_id})" style="
                  background: var(--accent-yellow);
                  border: none;
                  padding: 0.75rem 1.5rem;
                  border-radius: var(--radius-sm);
                  color: #000;
                  font-weight: 600;
                  cursor: pointer;
                ">
                  Watch
                </button>
              </div>
            `).join('')}
          </div>
        ` : `
          <div style="
            text-align: center;
            padding: 4rem 2rem;
            color: var(--text-secondary);
          ">
            <i class="fas fa-video" style="font-size: 4rem; opacity: 0.3; margin-bottom: 1rem;"></i>
            <p>No recordings available yet</p>
          </div>
        `}
      </div>
    `;
  },
  
  // Announcements tab
  renderAnnouncements() {
    return `
      <div style="padding: 2rem;">
        <h2 style="color: var(--text-primary); font-size: 1.8rem; margin-bottom: 1.5rem;">
          Announcements
        </h2>
        
        <div style="
          background: var(--bg-card);
          padding: 1.5rem;
          border-radius: var(--radius-md);
          border-left: 4px solid var(--accent-yellow);
        ">
          <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">
            <i class="fas fa-bullhorn" style="color: var(--accent-yellow);"></i> Welcome to the Course!
          </h4>
          <p style="color: var(--text-secondary); line-height: 1.6;">
            Make sure to complete all lessons and participate in live sessions for the best learning experience.
          </p>
        </div>
      </div>
    `;
  },
  
  // Live session controls
  renderLiveControls() {
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
          <div id="sessionTimer" style="color: var(--text-primary); font-size: 1rem; font-weight: 600; font-family: monospace;">
            00:00:00
          </div>
        </div>
        
        <!-- Control Buttons -->
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          
          <button class="control-btn" id="micBtn" onclick="LessonInterface.toggleMic()" title="Microphone">
            <i class="fas fa-microphone"></i>
          </button>
          
          <button class="control-btn" id="camBtn" onclick="LessonInterface.toggleCamera()" title="Camera">
            <i class="fas fa-video"></i>
          </button>
          
          <button class="control-btn" onclick="LessonInterface.shareScreen()" title="Share Screen">
            <i class="fas fa-desktop"></i>
          </button>
          
          <button class="control-btn" onclick="LessonInterface.raiseHand()" title="Raise Hand">
            <i class="fas fa-hand-paper"></i>
          </button>
          
          <button onclick="LessonInterface.leaveSession()" title="Leave" style="
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
          ">
            <i class="fas fa-phone-slash"></i>
          </button>
          
          <button onclick="LessonInterface.sendReaction('like')" title="Like" style="
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
          ">
            <i class="fas fa-thumbs-up"></i>
          </button>
          
        </div>
        
        <!-- Participant Count -->
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <i class="fas fa-users" style="color: var(--text-secondary);"></i>
          <span style="color: var(--text-primary); font-weight: 600;">${this.participants.length}</span>
        </div>
        
      </div>
      
      <style>
        .control-btn {
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
        }
        
        .control-btn:hover {
          background: var(--accent-yellow);
          color: #000;
          transform: scale(1.1);
        }
        
        .control-btn.active {
          background: var(--accent-yellow);
          color: #000;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      </style>
    `;
  },
  
  // Participant grid
  renderParticipantGrid() {
    return `
      <div class="participant-grid" style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 1rem;
        margin-top: 1.5rem;
      ">
        
        ${this.participants.slice(0, 6).map(p => `
          <div class="participant-card" style="
            background: var(--bg-card);
            border-radius: var(--radius-md);
            overflow: hidden;
            border: 2px solid ${p.role === 'mentor' ? 'var(--accent-yellow)' : 'var(--border-color)'};
            position: relative;
            transition: all 0.2s;
          " onmouseover="this.style.transform='translateY(-4px)'" 
             onmouseout="this.style.transform='translateY(0)'">
            
            <!-- Video/Avatar -->
            <div style="
              aspect-ratio: 16/9;
              background: linear-gradient(135deg, #1a1a2e 0%, #2a2a3e 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
            ">
              <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(p.full_name)}&background=667eea&color=fff" 
                alt="${p.full_name}" 
                style="
                  width: 80px;
                  height: 80px;
                  border-radius: 50%;
                  border: 3px solid ${p.role === 'mentor' ? 'var(--accent-yellow)' : 'var(--border-color)'};
              "/>
              
              ${p.role === 'mentor' ? `
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
                ${p.full_name}
              </div>
            </div>
            
          </div>
        `).join('')}
        
      </div>
    `;
  },
  
  // Right sidebar with chat
  renderRightSidebar() {
    return `
      <div class="right-sidebar" style="
        width: 280px;
        background: var(--bg-card);
        border-left: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      ">
        
        <!-- Tabs -->
        <div style="
          display: flex;
          border-bottom: 1px solid var(--border-color);
        ">
          <button onclick="LessonInterface.switchRightTab('participants')" 
            id="tabParticipants" 
            class="right-tab active"
            style="flex: 1; padding: 1rem; background: var(--bg-hover); border: none; color: var(--text-primary); cursor: pointer; border-bottom: 3px solid var(--accent-yellow);">
            <i class="fas fa-users"></i> Participants
          </button>
          <button onclick="LessonInterface.switchRightTab('chat')" 
            id="tabChat"
            class="right-tab"
            style="flex: 1; padding: 1rem; background: none; border: none; color: var(--text-secondary); cursor: pointer; border-bottom: 3px solid transparent;">
            <i class="fas fa-comments"></i> Chat
          </button>
        </div>
        
        <!-- Participants Tab Content -->
        <div id="participantsTab" style="flex: 1; overflow-y: auto; padding: 0.5rem 0;">
          ${this.renderParticipantList()}
        </div>
        
        <!-- Chat Tab Content -->
        <div id="chatTab" style="flex: 1; overflow-y: auto; padding: 1rem; display: none;">
          <div id="chatMessages"></div>
        </div>
        
        <!-- Chat Input -->
        <div style="
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--border-color);
          background: var(--bg-hover);
        ">
          <div style="display: flex; gap: 0.5rem;">
            <input type="text" id="chatInput" placeholder="Type message..." 
              onkeypress="if(event.key === 'Enter') LessonInterface.sendMessage()"
              style="
                flex: 1;
                padding: 0.75rem;
                background: var(--bg-card);
                border: 1px solid var(--border-color);
                border-radius: var(--radius-sm);
                color: var(--text-primary);
                font-size: 0.9rem;
              " />
            <button onclick="LessonInterface.sendMessage()" style="
              background: var(--accent-yellow);
              border: none;
              padding: 0.75rem 1rem;
              border-radius: var(--radius-sm);
              color: #000;
              cursor: pointer;
            ">
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
        
      </div>
    `;
  },
  
  // Participant list
  renderParticipantList() {
    return this.participants.map(p => `
      <div class="participant-item" style="
        padding: 0.75rem 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        cursor: pointer;
        transition: all 0.2s;
      " onmouseover="this.style.background='var(--bg-hover)'" 
         onmouseout="this.style.background='transparent'">
        
        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(p.full_name)}&background=667eea&color=fff" 
          alt="${p.full_name}" 
          style="width: 36px; height: 36px; border-radius: 50%;"
        />
        
        <div style="flex: 1;">
          <div style="color: var(--text-primary); font-size: 0.9rem; font-weight: 600;">
            ${p.full_name}
          </div>
          <div style="color: var(--text-secondary); font-size: 0.75rem;">
            ${p.role === 'mentor' ? 'Mentor' : 'Student'}
          </div>
        </div>
        
        ${p.is_online ? `
          <div style="
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #4ade80;
          "></div>
        ` : ''}
        
      </div>
    `).join('');
  },
  
  // Switch right sidebar tab
  switchRightTab(tab) {
    document.getElementById('participantsTab').style.display = tab === 'participants' ? 'block' : 'none';
    document.getElementById('chatTab').style.display = tab === 'chat' ? 'block' : 'none';
    
    document.getElementById('tabParticipants').style.background = tab === 'participants' ? 'var(--bg-hover)' : 'none';
    document.getElementById('tabParticipants').style.color = tab === 'participants' ? 'var(--text-primary)' : 'var(--text-secondary)';
    document.getElementById('tabParticipants').style.borderBottom = tab === 'participants' ? '3px solid var(--accent-yellow)' : '3px solid transparent';
    
    document.getElementById('tabChat').style.background = tab === 'chat' ? 'var(--bg-hover)' : 'none';
    document.getElementById('tabChat').style.color = tab === 'chat' ? 'var(--text-primary)' : 'var(--text-secondary)';
    document.getElementById('tabChat').style.borderBottom = tab === 'chat' ? '3px solid var(--accent-yellow)' : '3px solid transparent';
  },
  
  // Render chat messages
  renderChatMessages() {
    const chatContainer = document.getElementById('chatMessages');
    if (!chatContainer) return;
    
    chatContainer.innerHTML = this.chatMessages.map(msg => `
      <div style="margin-bottom: 1rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
          <span style="color: var(--text-primary); font-weight: 600; font-size: 0.85rem;">
            ${msg.user_name}
          </span>
          <span style="color: var(--text-secondary); font-size: 0.75rem;">
            ${new Date(msg.sent_at).toLocaleTimeString()}
          </span>
        </div>
        <div style="
          background: var(--bg-hover);
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-size: 0.9rem;
        ">
          ${msg.message}
        </div>
      </div>
    `).join('');
    
    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
  },
  
  // Send chat message
  async sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    try {
      const user = AppState.currentUser;
      const response = await fetch(`/api/live-sessions/${this.currentLesson}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || 1,
          user_name: user?.name || 'Student',
          user_role: user?.role || 'student',
          message: message
        })
      });
      
      if (response.ok) {
        input.value = '';
        // Message will appear in next poll
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  },
  
  // Send reaction
  async sendReaction(type) {
    try {
      const user = AppState.currentUser;
      await fetch(`/api/live-sessions/${this.currentLesson}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || 1,
          user_name: user?.name || 'Student',
          reaction_type: type
        })
      });
      
      // Show animation
      this.showReactionAnimation(type);
    } catch (error) {
      console.error('Failed to send reaction:', error);
    }
  },
  
  // Show reaction animation
  showReactionAnimation(type) {
    const emoji = type === 'like' ? '👍' : '❤️';
    const div = document.createElement('div');
    div.textContent = emoji;
    div.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 300px;
      font-size: 3rem;
      animation: floatUp 2s ease-out forwards;
      pointer-events: none;
      z-index: 9999;
    `;
    
    document.body.appendChild(div);
    
    setTimeout(() => div.remove(), 2000);
    
    // Add animation
    if (!document.getElementById('reactionAnimation')) {
      const style = document.createElement('style');
      style.id = 'reactionAnimation';
      style.textContent = `
        @keyframes floatUp {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-100px); }
        }
      `;
      document.head.appendChild(style);
    }
  },
  
  // Update progress
  async updateProgress(percentage) {
    try {
      const studentId = AppState.currentUser?.id || 1;
      await fetch(`/api/lessons/${this.currentLesson}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          completion_percentage: percentage,
          completed: percentage >= 100
        })
      });
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  },
  
  // Video control methods
  togglePlay() {
    const video = document.getElementById('lessonVideo');
    const icon = document.getElementById('playIcon');
    
    if (video.paused) {
      video.play();
      icon.className = 'fas fa-pause';
    } else {
      video.pause();
      icon.className = 'fas fa-play';
    }
  },
  
  onVideoPlay() {
    this.videoPlayer = document.getElementById('lessonVideo');
    this.updateProgress(50); // 50% for starting video
  },
  
  onVideoProgress() {
    const video = document.getElementById('lessonVideo');
    if (!video) return;
    
    const seekBar = document.getElementById('seekBar');
    const timeDisplay = document.getElementById('timeDisplay');
    
    const percentage = (video.currentTime / video.duration) * 100;
    seekBar.value = percentage;
    
    const current = this.formatTime(video.currentTime);
    const duration = this.formatTime(video.duration);
    timeDisplay.textContent = `${current} / ${duration}`;
  },
  
  onVideoEnd() {
    this.updateProgress(100); // 100% for completing video
    document.getElementById('playIcon').className = 'fas fa-play';
  },
  
  seekVideo(value) {
    const video = document.getElementById('lessonVideo');
    const time = (value / 100) * video.duration;
    video.currentTime = time;
  },
  
  toggleMute() {
    const video = document.getElementById('lessonVideo');
    const icon = document.getElementById('volumeIcon');
    
    video.muted = !video.muted;
    icon.className = video.muted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
  },
  
  toggleFullscreen() {
    const video = document.getElementById('lessonVideo');
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  },
  
  formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  },
  
  // Live control methods
  toggleMic() {
    const btn = document.getElementById('micBtn');
    btn.classList.toggle('active');
    // TODO: Integrate with Zoom SDK
  },
  
  toggleCamera() {
    const btn = document.getElementById('camBtn');
    btn.classList.toggle('active');
    // TODO: Integrate with Zoom SDK
  },
  
  shareScreen() {
    console.log('Share screen');
    // TODO: Integrate with Zoom SDK
  },
  
  raiseHand() {
    this.sendReaction('raise_hand');
  },
  
  leaveSession() {
    if (confirm('Are you sure you want to leave this session?')) {
      if (this.chatPollInterval) {
        clearInterval(this.chatPollInterval);
      }
      navigateTo('dashboard');
    }
  },
  
  playRecording(recordingId) {
    // Switch to lesson tab and play recording
    this.activeTab = 'lesson';
    this.loadLesson(this.currentLesson);
  },
  
  closeSidebar() {
    console.log('Close sidebar');
    // Could implement collapse functionality
  }
  
};

// Make available globally
window.LessonInterface = LessonInterface;

console.log('✅ Enhanced Lesson Interface Loaded: Real-time data, video controls, chat');
