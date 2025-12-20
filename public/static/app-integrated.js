// ============================================
// PASSIONBOTS LMS V6.0 - INTEGRATED VERSION
// Modern UI + AI + Gamification + All Features
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
  
  // v6.0 Gamification
  xp: 0,
  level: 1,
  streak: 0,
  badges: [],
  
  // v6.0 AI Features
  aiChatHistory: [],
  recommendations: [],
  
  // v6.0 Real-time
  isOnline: navigator.onLine,
  lastSync: null,
  
  // v6.0 Command Palette
  commandPaletteOpen: false,
  recentCommands: []
};

// Load v6.0 utilities and features
document.write('<script src="/static/app-v2.js"></script>');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  // Initialize v6.0 features
  if (typeof CommandPalette !== 'undefined') {
    CommandPalette.init();
  }
  
  if (typeof AIAssistant !== 'undefined') {
    AIAssistant.init();
  }
  
  renderView();
});
