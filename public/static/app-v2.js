// ============================================
// PASSIONBOTS LMS V6.0 - ADVANCED FEATURES
// Tech Giants Level Implementation
// ============================================

// ============================================
// GLOBAL STATE MANAGEMENT
// ============================================
const AppState = {
  currentUser: null,
  isLoggedIn: false,
  currentView: 'login',
  modules: [],
  selectedModule: null,
  selectedLesson: null,
  selectedTest: null,
  testTimer: null,
  
  // Gamification
  xp: 0,
  level: 1,
  streak: 0,
  badges: [],
  
  // AI Features
  aiChatHistory: [],
  recommendations: [],
  
  // Real-time
  isOnline: navigator.onLine,
  lastSync: null,
  
  // Command Palette
  commandPaletteOpen: false,
  recentCommands: []
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
const Utils = {
  // Show toast notification
  showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container') || this.createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div style="font-size: 24px;">
        ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
      </div>
      <div style="flex: 1;">
        <div style="font-weight: 600; margin-bottom: 4px;">${this.capitalize(type)}</div>
        <div style="font-size: 14px; color: var(--text-secondary);">${message}</div>
      </div>
    `;
    
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'toastSlideOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },
  
  createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  },
  
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
  
  // Format date/time
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },
  
  formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  },
  
  // Calculate XP for level
  getXPForLevel(level) {
    return Math.floor(100 * Math.pow(level, 1.5));
  },
  
  // Save to localStorage with error handling
  saveToLocal(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  },
  
  // Get from localStorage
  getFromLocal(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (e) {
      console.error('Failed to get from localStorage:', e);
      return null;
    }
  }
};

// ============================================
// COMMAND PALETTE (Cmd+K / Ctrl+K)
// ============================================
const CommandPalette = {
  commands: [
    { id: 'dashboard', title: 'Go to Dashboard', icon: '🏠', action: () => navigateTo('dashboard'), shortcut: ['G', 'D'] },
    { id: 'modules', title: 'View My Courses', icon: '📚', action: () => navigateTo('modules'), shortcut: ['G', 'C'] },
    { id: 'assignments', title: 'View Assignments', icon: '📋', action: () => navigateTo('assignments'), shortcut: ['G', 'A'] },
    { id: 'tests', title: 'Live Tests', icon: '⏱️', action: () => navigateTo('tests'), shortcut: ['G', 'T'] },
    { id: 'sessions', title: 'Live Sessions', icon: '🎥', action: () => navigateTo('sessions'), shortcut: ['G', 'L'] },
    { id: 'messages', title: 'Messages', icon: '💬', action: () => navigateTo('messages'), shortcut: ['G', 'M'] },
    { id: 'certificates', title: 'My Certificates', icon: '🎓', action: () => navigateTo('certificates'), shortcut: ['G', 'E'] },
    { id: 'progress', title: 'View Progress', icon: '📊', action: () => navigateTo('progress'), shortcut: ['G', 'P'] },
    { id: 'ai-chat', title: 'Open AI Assistant', icon: '🤖', action: () => openAIChat(), shortcut: ['Ctrl', 'I'] },
    { id: 'theme', title: 'Toggle Theme', icon: '🎨', action: () => toggleTheme(), shortcut: ['Ctrl', 'Shift', 'T'] },
    { id: 'logout', title: 'Logout', icon: '🚪', action: () => logout(), shortcut: ['Ctrl', 'Q'] }
  ],
  
  selectedIndex: 0,
  filteredCommands: [],
  
  init() {
    // Create command palette HTML
    const overlay = document.createElement('div');
    overlay.id = 'command-palette-overlay';
    overlay.className = 'command-palette-overlay';
    overlay.innerHTML = `
      <div class="command-palette">
        <input 
          type="text" 
          id="command-palette-input" 
          class="command-palette-input" 
          placeholder="Type a command or search..."
          autocomplete="off"
        />
        <div id="command-palette-results" class="command-palette-results"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    
    // Event listeners
    document.addEventListener('keydown', (e) => {
      // Open with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.toggle();
      }
      
      // Close with Escape
      if (e.key === 'Escape' && AppState.commandPaletteOpen) {
        this.close();
      }
      
      // Navigate with arrow keys
      if (AppState.commandPaletteOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.selectNext();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.selectPrevious();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.executeSelected();
        }
      }
    });
    
    // Click outside to close
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });
    
    // Search input
    const input = document.getElementById('command-palette-input');
    input.addEventListener('input', (e) => this.search(e.target.value));
  },
  
  toggle() {
    if (AppState.commandPaletteOpen) {
      this.close();
    } else {
      this.open();
    }
  },
  
  open() {
    AppState.commandPaletteOpen = true;
    const overlay = document.getElementById('command-palette-overlay');
    const input = document.getElementById('command-palette-input');
    overlay.classList.add('active');
    input.value = '';
    input.focus();
    this.filteredCommands = this.commands;
    this.selectedIndex = 0;
    this.render();
  },
  
  close() {
    AppState.commandPaletteOpen = false;
    const overlay = document.getElementById('command-palette-overlay');
    overlay.classList.remove('active');
  },
  
  search(query) {
    if (!query) {
      this.filteredCommands = this.commands;
    } else {
      const lowerQuery = query.toLowerCase();
      this.filteredCommands = this.commands.filter(cmd => 
        cmd.title.toLowerCase().includes(lowerQuery) ||
        cmd.id.toLowerCase().includes(lowerQuery)
      );
    }
    this.selectedIndex = 0;
    this.render();
  },
  
  render() {
    const resultsDiv = document.getElementById('command-palette-results');
    if (this.filteredCommands.length === 0) {
      resultsDiv.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--text-secondary);">No commands found</div>';
      return;
    }
    
    resultsDiv.innerHTML = this.filteredCommands.map((cmd, index) => `
      <div class="command-palette-item ${index === this.selectedIndex ? 'selected' : ''}" 
           onclick="CommandPalette.execute('${cmd.id}')"
           data-index="${index}">
        <div class="command-palette-item-icon">${cmd.icon}</div>
        <div class="command-palette-item-content">
          <div class="command-palette-item-title">${cmd.title}</div>
        </div>
        ${cmd.shortcut ? `
          <div class="command-palette-item-shortcut">
            ${cmd.shortcut.map(key => `<span class="command-palette-key">${key}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `).join('');
  },
  
  selectNext() {
    this.selectedIndex = (this.selectedIndex + 1) % this.filteredCommands.length;
    this.render();
  },
  
  selectPrevious() {
    this.selectedIndex = this.selectedIndex === 0 ? this.filteredCommands.length - 1 : this.selectedIndex - 1;
    this.render();
  },
  
  executeSelected() {
    if (this.filteredCommands.length > 0) {
      const command = this.filteredCommands[this.selectedIndex];
      this.execute(command.id);
    }
  },
  
  execute(commandId) {
    const command = this.commands.find(cmd => cmd.id === commandId);
    if (command) {
      this.close();
      command.action();
      Utils.showToast(`Executed: ${command.title}`, 'success', 2000);
    }
  }
};

// ============================================
// GAMIFICATION SYSTEM
// ============================================
const Gamification = {
  // XP Rewards
  XP_REWARDS: {
    LOGIN: 10,
    COMPLETE_LESSON: 50,
    COMPLETE_MCQ: 25,
    COMPLETE_TEST: 100,
    SUBMIT_ASSIGNMENT: 75,
    ATTEND_SESSION: 50,
    DAILY_STREAK: 20,
    PERFECT_SCORE: 150
  },
  
  // Level titles
  LEVEL_TITLES: {
    1: 'Beginner',
    5: 'Intermediate',
    10: 'Advanced',
    15: 'Expert',
    20: 'Master',
    25: 'Legend'
  },
  
  // Add XP with animation
  addXP(amount, reason) {
    AppState.xp += amount;
    
    // Check for level up
    const currentLevel = AppState.level;
    const newLevel = this.calculateLevel(AppState.xp);
    
    if (newLevel > currentLevel) {
      AppState.level = newLevel;
      this.showLevelUpAnimation(newLevel);
    }
    
    // Show XP gain notification
    this.showXPGain(amount, reason);
    
    // Save to backend
    this.syncXPToBackend();
  },
  
  calculateLevel(xp) {
    return Math.floor(Math.pow(xp / 100, 1 / 1.5)) + 1;
  },
  
  showXPGain(amount, reason) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 24px;
      background: var(--gradient-gold);
      padding: 16px 24px;
      border-radius: 50px;
      font-weight: 700;
      font-size: 18px;
      box-shadow: var(--shadow-xl);
      z-index: 9999;
      animation: xpGain 2s ease forwards;
    `;
    notification.innerHTML = `+${amount} XP ${reason ? `• ${reason}` : ''}`;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 2000);
  },
  
  showLevelUpAnimation(level) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      animation: fadeIn 0.3s ease;
    `;
    
    const levelTitle = this.LEVEL_TITLES[level] || 'Pro';
    
    modal.innerHTML = `
      <div style="text-align: center; animation: scaleIn 0.5s var(--ease-spring);">
        <div style="font-size: 100px; margin-bottom: 20px; animation: bounce 1s infinite;">🎉</div>
        <h1 style="font-size: 60px; font-weight: 800; background: var(--gradient-gold); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 16px;">
          LEVEL UP!
        </h1>
        <div style="font-size: 48px; font-weight: 700; margin-bottom: 12px;">Level ${level}</div>
        <div style="font-size: 24px; color: var(--accent-yellow); font-weight: 600;">${levelTitle}</div>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="margin-top: 40px; padding: 16px 48px; background: var(--gradient-primary); border: none; border-radius: 50px; color: white; font-size: 18px; font-weight: 700; cursor: pointer; box-shadow: var(--shadow-lg);">
          Continue Learning
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto close after 5 seconds
    setTimeout(() => modal.remove(), 5000);
  },
  
  async syncXPToBackend() {
    try {
      await axios.post('/api/gamification/update', {
        studentId: AppState.currentUser.id,
        xp: AppState.xp,
        level: AppState.level,
        streak: AppState.streak
      });
    } catch (error) {
      console.error('Failed to sync XP:', error);
    }
  },
  
  // Badge system
  unlockBadge(badgeId, badgeName, badgeIcon) {
    if (!AppState.badges.includes(badgeId)) {
      AppState.badges.push(badgeId);
      this.showBadgeUnlock(badgeName, badgeIcon);
    }
  },
  
  showBadgeUnlock(name, icon) {
    Utils.showToast(`New Badge Unlocked: ${icon} ${name}`, 'success', 4000);
  }
};

// ============================================
// AI ASSISTANT
// ============================================
const AIAssistant = {
  chatWindow: null,
  
  init() {
    // Create floating AI button
    const fab = document.createElement('div');
    fab.className = 'fab';
    fab.innerHTML = '🤖';
    fab.onclick = () => this.openChat();
    fab.title = 'AI Assistant (Ctrl+I)';
    document.body.appendChild(fab);
  },
  
  openChat() {
    if (this.chatWindow) {
      this.chatWindow.style.display = 'flex';
      return;
    }
    
    this.chatWindow = document.createElement('div');
    this.chatWindow.style.cssText = `
      position: fixed;
      bottom: 110px;
      right: 32px;
      width: 400px;
      height: 600px;
      background: var(--glass-bg);
      backdrop-filter: blur(40px);
      border: 1px solid var(--glass-border);
      border-radius: 24px;
      box-shadow: var(--shadow-xl);
      display: flex;
      flex-direction: column;
      z-index: 9998;
      animation: slideUp 0.3s var(--ease-spring);
    `;
    
    this.chatWindow.innerHTML = `
      <div style="padding: 20px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 40px; height: 40px; background: var(--gradient-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px;">🤖</div>
          <div>
            <div style="font-weight: 700; font-size: 16px;">AI Learning Assistant</div>
            <div style="font-size: 12px; color: var(--text-secondary);">Always here to help</div>
          </div>
        </div>
        <button onclick="AIAssistant.closeChat()" style="background: none; border: none; color: var(--text-secondary); font-size: 24px; cursor: pointer; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s;">×</button>
      </div>
      
      <div id="ai-chat-messages" style="flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px;">
        <div class="ai-message">
          <div style="background: var(--secondary-bg); padding: 12px 16px; border-radius: 16px; border-top-left-radius: 4px;">
            👋 Hi! I'm your AI learning assistant. Ask me anything about IoT, Robotics, or your coursework!
          </div>
        </div>
      </div>
      
      <div style="padding: 20px; border-top: 1px solid var(--border-color);">
        <div style="display: flex; gap: 12px;">
          <input 
            type="text" 
            id="ai-chat-input" 
            placeholder="Type your question..."
            style="flex: 1; padding: 12px 16px; background: var(--secondary-bg); border: 1px solid var(--border-color); border-radius: 12px; color: white; outline: none;"
            onkeypress="if(event.key === 'Enter') AIAssistant.sendMessage()"
          />
          <button onclick="AIAssistant.sendMessage()" style="padding: 12px 20px; background: var(--gradient-primary); border: none; border-radius: 12px; color: white; font-weight: 600; cursor: pointer; transition: all 0.2s;">
            Send
          </button>
        </div>
        <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
          <button onclick="AIAssistant.quickQuestion('Explain ESP32 basics')" style="padding: 6px 12px; background: var(--secondary-bg); border: 1px solid var(--border-color); border-radius: 20px; color: var(--text-secondary); font-size: 12px; cursor: pointer;">Explain ESP32 basics</button>
          <button onclick="AIAssistant.quickQuestion('Help with my code')" style="padding: 6px 12px; background: var(--secondary-bg); border: 1px solid var(--border-color); border-radius: 20px; color: var(--text-secondary); font-size: 12px; cursor: pointer;">Help with my code</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.chatWindow);
  },
  
  closeChat() {
    if (this.chatWindow) {
      this.chatWindow.style.display = 'none';
    }
  },
  
  async sendMessage() {
    const input = document.getElementById('ai-chat-input');
    const message = input.value.trim();
    if (!message) return;
    
    // Add user message
    this.addMessage(message, 'user');
    input.value = '';
    
    // Show typing indicator
    this.showTyping();
    
    // Simulate AI response (in production, call OpenAI API)
    setTimeout(() => {
      this.hideTyping();
      const response = this.generateResponse(message);
      this.addMessage(response, 'ai');
    }, 1500);
  },
  
  addMessage(text, sender) {
    const messagesDiv = document.getElementById('ai-chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'user' ? 'user-message' : 'ai-message';
    messageDiv.style.cssText = `
      display: flex;
      ${sender === 'user' ? 'justify-content: flex-end;' : 'justify-content: flex-start;'}
    `;
    
    messageDiv.innerHTML = `
      <div style="
        background: ${sender === 'user' ? 'var(--gradient-primary)' : 'var(--secondary-bg)'};
        padding: 12px 16px;
        border-radius: 16px;
        ${sender === 'user' ? 'border-top-right-radius: 4px;' : 'border-top-left-radius: 4px;'}
        max-width: 80%;
        animation: messageSlideIn 0.3s ease;
      ">
        ${text}
      </div>
    `;
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  },
  
  showTyping() {
    const messagesDiv = document.getElementById('ai-chat-messages');
    const typing = document.createElement('div');
    typing.id = 'typing-indicator';
    typing.innerHTML = `
      <div style="background: var(--secondary-bg); padding: 12px 16px; border-radius: 16px; border-top-left-radius: 4px; display: inline-block;">
        <span style="animation: blink 1.4s infinite;">●</span>
        <span style="animation: blink 1.4s infinite 0.2s;">●</span>
        <span style="animation: blink 1.4s infinite 0.4s;">●</span>
      </div>
    `;
    messagesDiv.appendChild(typing);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  },
  
  hideTyping() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
  },
  
  generateResponse(question) {
    // Simple response generation (in production, use OpenAI API)
    const responses = {
      'esp32': "ESP32 is a powerful microcontroller with built-in WiFi and Bluetooth. It's perfect for IoT projects! Would you like me to explain specific features?",
      'code': "I'd be happy to help with your code! Please share the code snippet and describe what issue you're facing.",
      'project': "Great! Let's brainstorm some project ideas. What interests you most - home automation, robotics, or sensor networks?",
      'help': "I'm here to help! You can ask me about:\n• Course concepts\n• Code debugging\n• Project ideas\n• Assignment help\n• Study tips"
    };
    
    const lowerQuestion = question.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (lowerQuestion.includes(key)) {
        return response;
      }
    }
    
    return "That's an interesting question! Let me help you find the answer. Could you provide more details?";
  },
  
  quickQuestion(question) {
    document.getElementById('ai-chat-input').value = question;
    this.sendMessage();
  }
};

// ============================================
// ANALYTICS DASHBOARD
// ============================================
const Analytics = {
  async loadDashboard() {
    // This will render beautiful charts
    const data = await this.fetchAnalyticsData();
    this.renderCharts(data);
  },
  
  async fetchAnalyticsData() {
    try {
      const response = await axios.get(`/api/analytics/${AppState.currentUser.id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to load analytics:', error);
      return null;
    }
  },
  
  renderCharts(data) {
    // Implement Chart.js visualizations
    // Learning curve, progress over time, strengths/weaknesses
  }
};

// ============================================
// INITIALIZE APP
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize command palette
  CommandPalette.init();
  
  // Initialize AI assistant
  AIAssistant.init();
  
  // Add CSS for animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes xpGain {
      0% { transform: translateY(0) scale(1); opacity: 1; }
      50% { transform: translateY(-10px) scale(1.1); }
      100% { transform: translateY(-100px) scale(0.8); opacity: 0; }
    }
    
    @keyframes scaleIn {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }
    
    @keyframes slideUp {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes messageSlideIn {
      from { transform: translateY(10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes blink {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  // Show welcome message
  Utils.showToast('Welcome to PassionBots LMS v6.0! 🚀', 'success', 4000);
  
  // Initialize view
  renderView();
});

// ============================================
// HELPER FUNCTIONS
// ============================================
function navigateTo(view) {
  AppState.currentView = view;
  renderView();
}

function openAIChat() {
  AIAssistant.openChat();
}

function toggleTheme() {
  Utils.showToast('Theme toggle coming soon!', 'info');
}

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    AppState.currentUser = null;
    AppState.isLoggedIn = false;
    localStorage.clear();
    location.reload();
  }
}

function renderView() {
  // Your existing render logic
  const app = document.getElementById('app');
  
  switch(AppState.currentView) {
    case 'login':
      app.innerHTML = renderLoginV2();
      break;
    case 'dashboard':
      app.innerHTML = renderDashboardV2();
      loadDashboardData();
      break;
    default:
      app.innerHTML = '<div style="padding: 40px; text-align: center;">View under construction</div>';
  }
}

// Modern Login Page
function renderLoginV2() {
  return `
    <div class="animated-bg"></div>
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem;">
      <div class="glass-card" style="width: 100%; max-width: 500px; padding: 48px;">
        <div style="text-align: center; margin-bottom: 3rem;">
          <div class="level-badge" style="margin: 0 auto 24px;">🤖</div>
          <h1 style="font-size: 40px; font-weight: 800; margin-bottom: 12px; background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            PassionBots LMS
          </h1>
          <p style="color: var(--text-secondary); font-size: 18px;">IoT & Robotics Excellence</p>
        </div>
        
        <form id="loginForm" onsubmit="handleLoginV2(event)">
          <div style="margin-bottom: 24px;">
            <label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary);">Email Address</label>
            <input type="email" id="email" required 
              style="width: 100%; padding: 16px; background: var(--secondary-bg); border: 2px solid var(--border-color); border-radius: 16px; color: white; font-size: 16px; transition: all 0.3s;"
              placeholder="student@example.com"
              onfocus="this.style.borderColor='var(--accent-primary)'"
              onblur="this.style.borderColor='var(--border-color)'" />
          </div>
          
          <div style="margin-bottom: 24px;">
            <label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary);">Password</label>
            <input type="password" id="password" required 
              style="width: 100%; padding: 16px; background: var(--secondary-bg); border: 2px solid var(--border-color); border-radius: 16px; color: white; font-size: 16px; transition: all 0.3s;"
              placeholder="Enter your password"
              onfocus="this.style.borderColor='var(--accent-primary)'"
              onblur="this.style.borderColor='var(--border-color)'" />
          </div>
          
          <div style="margin-bottom: 32px;">
            <label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary);">Login As</label>
            <select id="role" required 
              style="width: 100%; padding: 16px; background: var(--secondary-bg); border: 2px solid var(--border-color); border-radius: 16px; color: white; font-size: 16px; transition: all 0.3s; cursor: pointer;"
              onfocus="this.style.borderColor='var(--accent-primary)'"
              onblur="this.style.borderColor='var(--border-color)'">
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
            </select>
          </div>
          
          <button type="submit" class="glass-button" style="width: 100%; padding: 18px; font-size: 18px; font-weight: 700; background: var(--gradient-primary); border: none; justify-content: center; display: flex; align-items: center; gap: 12px;">
            Login <span style="font-size: 20px;">→</span>
          </button>
        </form>
        
        <div style="margin-top: 32px; padding-top: 32px; border-top: 1px solid var(--border-color);">
          <p style="font-size: 13px; color: var(--text-secondary); text-align: center; margin-bottom: 16px;">Demo Credentials</p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div class="modern-card" style="padding: 16px; text-align: center;">
              <div style="font-weight: 700; color: var(--accent-primary); margin-bottom: 8px;">👨‍🎓 Student</div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">demo@student.com</div>
              <div style="font-size: 12px; color: var(--text-secondary);">demo123</div>
            </div>
            <div class="modern-card" style="padding: 16px; text-align: center;">
              <div style="font-weight: 700; color: var(--accent-success); margin-bottom: 8px;">👨‍🏫 Mentor</div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">mentor@passionbots.in</div>
              <div style="font-size: 12px; color: var(--text-secondary);">mentor123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Handle Login with Gamification
async function handleLoginV2(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;
  
  try {
    const response = await axios.post('/api/auth/login', { email, password, role });
    if (response.data.success) {
      if (response.data.role === 'mentor') {
        // Mentor login
        localStorage.setItem('userRole', 'mentor');
        localStorage.setItem('mentorData', JSON.stringify(response.data.mentor));
        
        const mentorScript = document.createElement('script');
        mentorScript.src = '/static/mentor.js';
        mentorScript.onload = () => {
          window.MentorState.currentMentor = response.data.mentor;
          window.MentorState.isLoggedIn = true;
          window.MentorState.currentView = 'dashboard';
          window.renderMentorView();
        };
        document.body.appendChild(mentorScript);
      } else {
        // Student login with gamification
        AppState.currentUser = response.data.student;
        AppState.isLoggedIn = true;
        AppState.currentView = 'dashboard';
        
        // Award login XP
        Gamification.addXP(Gamification.XP_REWARDS.LOGIN, 'Daily Login');
        
        Utils.showToast(`Welcome back, ${response.data.student.full_name}! 🎉`, 'success');
        renderView();
      }
    }
  } catch (error) {
    Utils.showToast('Login failed! Please check your credentials.', 'error');
  }
}

// Modern Dashboard
function renderDashboardV2() {
  return `
    <div style="min-height: 100vh; padding: 32px;">
      <div style="max-width: 1400px; margin: 0 auto;">
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 48px;">
          <div>
            <h1 style="font-size: 48px; font-weight: 800; margin-bottom: 8px;">
              Welcome back, ${AppState.currentUser?.full_name || 'Student'}! 👋
            </h1>
            <p style="color: var(--text-secondary); font-size: 18px;">Ready to continue your learning journey?</p>
          </div>
          
          <!-- XP Progress -->
          <div class="glass-card" style="padding: 24px; min-width: 300px;">
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 12px;">
              <div class="level-badge" style="width: 60px; height: 60px; font-size: 24px;">${AppState.level}</div>
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="font-weight: 700;">Level ${AppState.level}</span>
                  <span style="color: var(--text-secondary);">${AppState.xp} XP</span>
                </div>
                <div class="xp-bar-container">
                  <div class="xp-bar-fill" style="width: ${(AppState.xp % Utils.getXPForLevel(AppState.level)) / Utils.getXPForLevel(AppState.level) * 100}%"></div>
                </div>
              </div>
            </div>
            <div style="font-size: 12px; color: var(--text-secondary); text-align: center;">
              ${Utils.getXPForLevel(AppState.level) - (AppState.xp % Utils.getXPForLevel(AppState.level))} XP to next level
            </div>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 48px;">
          <div class="modern-card" onclick="navigateTo('modules')" style="cursor: pointer; text-align: center; padding: 32px;">
            <div style="font-size: 48px; margin-bottom: 16px;">📚</div>
            <div style="font-weight: 700; font-size: 18px; margin-bottom: 8px;">My Courses</div>
            <div style="font-size: 14px; color: var(--text-secondary);">Continue learning</div>
          </div>
          
          <div class="modern-card" onclick="navigateTo('assignments')" style="cursor: pointer; text-align: center; padding: 32px;">
            <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
            <div style="font-weight: 700; font-size: 18px; margin-bottom: 8px;">Assignments</div>
            <div style="font-size: 14px; color: var(--text-secondary);">Submit your work</div>
          </div>
          
          <div class="modern-card" onclick="navigateTo('tests')" style="cursor: pointer; text-align: center; padding: 32px;">
            <div style="font-size: 48px; margin-bottom: 16px;">⏱️</div>
            <div style="font-weight: 700; font-size: 18px; margin-bottom: 8px;">Live Tests</div>
            <div style="font-size: 14px; color: var(--text-secondary);">Take a test</div>
          </div>
          
          <div class="modern-card" onclick="navigateTo('progress')" style="cursor: pointer; text-align: center; padding: 32px;">
            <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
            <div style="font-weight: 700; font-size: 18px; margin-bottom: 8px;">Progress</div>
            <div style="font-size: 14px; color: var(--text-secondary);">Track your growth</div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 48px; padding: 32px; color: var(--text-secondary);">
          <p>💡 Press <kbd style="padding: 4px 8px; background: var(--secondary-bg); border-radius: 6px;">Cmd+K</kbd> to open command palette</p>
        </div>
      </div>
    </div>
  `;
}

async function loadDashboardData() {
  // Load user's gamification data
  try {
    const response = await axios.get(`/api/gamification/${AppState.currentUser.id}`);
    AppState.xp = response.data.xp || 0;
    AppState.level = response.data.level || 1;
    AppState.streak = response.data.streak || 0;
    AppState.badges = response.data.badges || [];
  } catch (error) {
    console.error('Failed to load gamification data:', error);
  }
}

console.log('🚀 PassionBots LMS v6.0 - Advanced Features Loaded!');
