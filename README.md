# PassionBots Student LMS Portal

A comprehensive Learning Management System with exact UI design from the PassionBots IoT & Robotics Internship Program.

## 🎨 Design Theme

**EXACT MATCH TO PDF MOCKUP**
- **Primary Background**: Dark blue-gray #1a1d29
- **Secondary Background**: #252834 for cards
- **Accent Color**: Golden yellow #FDB022
- **Text Colors**: White for headings, #a0a3b5 for secondary text
- **Modern Dark Theme**: Professional learning platform aesthetic

## 🌐 Access Your LMS

**Live URL**: https://3000-i7mh5nrk9jhmc1jr42bzs-cbeee0f9.sandbox.novita.ai

**Demo Login**: 
- No login required - direct access to welcome screen
- Click "Start Learning" to enter the platform

## ✨ UI Pages (Matching PDF Exactly)

### Page 1: Welcome Screen
- **Large welcome message** with "Welcome Back Student!" heading
- **65% progress circle** in golden yellow
- **Two action buttons**: "Start Learning" (yellow) and "My Courses" (outlined)
- **Three quick-link cards**: My Courses, Progress, Achievements
- **PassionBots logo** with "DIGITAL LEARNING PLATFORM" tagline

### Page 2: Dashboard
- **Left sidebar navigation** (80px width, dark background)
  - Home, Courses, Calendar, Progress, Settings icons
  - Golden yellow highlight for active item
- **Top header** with PassionBots logo, page title, search, and user profile
- **Continue Learning card** showing current module progress (Module 2: Visual Programming - 65%)
- **Weekly stats**: 12 hours completed, 3 modules finished
- **Course cards grid** with images and progress bars

### Page 3: Lesson View
- **Left sidebar** with lesson list
- **Active lesson highlight** in golden yellow
- **Main content area**: Lesson title, learning objectives, video player
- **Interactive "Try It Yourself"** section
- **Progress indicator**: "3 of 5 • Activities Complete"
- **Action buttons**: Previous, Mark Complete (yellow), Next Lesson (yellow)

### Page 4: Progress & Achievements
- **Large circular progress indicator** (78% Foundation Complete)
- **Learning Statistics grid**: 24 Hours, Modules Completed, Activities Finished, Problem Solver
- **Achievements Unlocked section**: First Robot Built, Code Master, Team Player, Problem Solver
- **Weekly Goal tracker**: 5 Hours goal, Current 3.6 hours

## 🚀 Main Features

### ✅ Implemented Features

1. **Welcome Screen**
   - Animated progress circle showing 65% completion
   - Quick access cards to main sections
   - Professional dark theme design

2. **Dashboard**
   - Sidebar navigation with icon-only menu
   - Continue Learning card with current module
   - Statistics cards (hours, modules)
   - Course grid with progress tracking

3. **Progress Page**
   - Large circular progress visualization
   - Learning statistics with icon cards
   - Achievement badges display
   - Weekly goal tracking

4. **Course System**
   - 8 modules from IoT & Robotics curriculum
   - Progress tracking per module
   - Visual course cards with emoji icons

5. **Navigation**
   - Vertical sidebar with icons
   - Active state highlighting in yellow
   - Smooth section transitions

## 🎯 Key Design Elements

### Colors
- **Background Dark**: `#1a1d29`
- **Card Background**: `#252834` and `#2a2d3a`
- **Accent Yellow**: `#FDB022`
- **Text Primary**: `#ffffff`
- **Text Secondary**: `#a0a3b5`
- **Border**: `#3a3d4a`

### Typography
- **Font Family**: Inter, system fonts
- **Heading Sizes**: 48px (welcome), 36px (stats), 24px (section titles)
- **Font Weights**: 800 (bold headings), 600 (semibold), 400 (regular)

### Components
- **Border Radius**: 12px-20px for cards
- **Button Padding**: 16px 40px
- **Card Shadows**: Subtle dark shadows on hover
- **Progress Bars**: 8px height, yellow fill
- **Icons**: Font Awesome 6.4.0

## 📊 API Endpoints (Backend)

All API routes are functional and connected to D1 database:

```
GET  /api/dashboard/:studentId       - Dashboard statistics
GET  /api/modules/:studentId         - All modules with progress
GET  /api/student/:id                - Student profile
POST /api/progress/update            - Update lesson progress
GET  /api/certificates/:studentId    - Student certificates
GET  /api/sessions                   - Live sessions
```

## 🗄️ Database Schema

- **10 comprehensive tables** with full relationships
- **Cloudflare D1** (SQLite) for local development
- **Seed data included**: 3 students, 8 modules, 13 lessons

## 🛠️ Tech Stack

- **Frontend**: Pure HTML/CSS/JavaScript (no frameworks)
- **Backend**: Hono v4.11.1 (Cloudflare Workers)
- **Database**: Cloudflare D1 (SQLite)
- **Icons**: Font Awesome 6.4.0
- **Fonts**: Google Fonts Inter
- **HTTP Client**: Axios 1.6.0

## 🚀 Quick Start

```bash
# Start development server
cd /home/user/webapp
pm2 start ecosystem.config.cjs

# View logs
pm2 logs passionbots-lms --nostream

# Rebuild
npm run build

# Reset database
npm run db:reset
```

## 📱 Responsive Design

- **Desktop-first** design matching PDF mockups
- **Minimum width**: 1200px recommended
- **Fixed sidebar**: 80px width
- **Flexible main content**: Adapts to screen size

## 🎨 UI Components

### Sidebar Navigation
- Icon-only vertical menu
- Golden yellow active state
- Smooth hover transitions
- Logout button at bottom

### Cards
- Rounded corners (16px-20px)
- Dark background (#2a2d3a)
- Hover effect: translateY(-4px)
- Subtle shadows

### Progress Circles
- SVG-based circular progress
- Golden yellow stroke
- Large percentage display
- Smooth animations

### Buttons
- Primary: Yellow background, dark text
- Secondary: Dark background, light border
- Hover: Lift effect and shadow

## 🔮 Future Enhancements

1. **Lesson Detail Pages** - Full lesson content view
2. **Video Integration** - Embedded video player
3. **Assignments** - Submit and track assignments
4. **Certificates** - Download and verify certificates
5. **Forum** - Discussion boards per module
6. **Live Sessions** - Calendar and meeting links

## 📞 Program Information

- **Batch Start**: January 10th, 2026
- **Duration**: 2 months (8 weeks)
- **Format**: Live online sessions
- **Website**: https://www.passionbots.in/program
- **WhatsApp**: +91 9137361474

## 📜 Version History

- **v2.0.0** - Exact PDF UI recreation with dark theme
- **v1.0.0** - Initial LMS implementation

---

**Last Updated**: December 17, 2025  
**Status**: ✅ UI Complete - Exact match to PDF mockup  
**Theme**: Dark Mode with Golden Yellow Accents (#FDB022)
