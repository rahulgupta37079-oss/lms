# 🎓 PassionBots LMS - IoT & Robotics Learning Platform

![PassionBots LMS](https://img.shields.io/badge/PassionBots-LMS-FDB022?style=for-the-badge)
![Version](https://img.shields.io/badge/version-4.0-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/status-Production_Ready-success?style=for-the-badge)

A comprehensive Learning Management System (LMS) for the PassionBots IoT & Robotics Internship Program. Built with modern web technologies and designed for an exceptional learning experience.

## 🌐 Live Demo

**Production URL (Permanent):** [https://passionbots-lms.pages.dev](https://passionbots-lms.pages.dev)

**Sandbox URL (Temporary):** [https://3000-i7mh5nrk9jhmc1jr42bzs-cbeee0f9.sandbox.novita.ai](https://3000-i7mh5nrk9jhmc1jr42bzs-cbeee0f9.sandbox.novita.ai)

**Demo Credentials:**

**Student Login:**
```
Email: demo@student.com
Password: demo123
Role: Student
```

**Mentor Login:**
```
Email: mentor@passionbots.in
Password: mentor123
Role: Mentor
```

## ✨ Features

### 🔐 Authentication & User Management
- Secure login/authentication system
- Student profile management
- Session management

### 📚 Course Management
- **8 IoT & Robotics Modules**
  - IoT & Robotics Fundamentals
  - ESP32 Microcontroller Basics
  - Sensor Integration & Data Collection
  - Actuators & Motor Control
  - Wireless Communication (WiFi, Bluetooth)
  - Cloud Integration & IoT Platforms
  - Advanced Projects & Prototyping
  - Final Project & Deployment

### 📝 Interactive Learning
- **Lesson Pages** with detailed content
- **MCQ System** - 5 questions per lesson
- Instant feedback and scoring
- Progress tracking per lesson

### ⏱️ Live Testing System
- **Countdown Timer** - Real-time clock
- **Auto-submit** when time expires
- Multiple choice questions
- Instant results with score breakdown

### 📋 Assignment Management
- Assignment submission interface
- Multiple submission types:
  - File uploads (URL)
  - GitHub repository links
  - Demo/live project URLs
  - Description and notes
- Score and feedback system
- Due date tracking

### 🎥 Live Sessions
- **Session Calendar** with schedule
- **"LIVE NOW"** indicator for active sessions
- Join links for upcoming sessions
- Recording access for past sessions
- Duration and timing information

### 💬 Messaging System
- Student-mentor communication
- Message history
- Real-time messaging interface
- Timestamp tracking

### 🎓 Certificate System
- **Dual Certificate Types:**
  - Certificate of Internship Completion
  - Certificate of Skill Mastery
- **Unique Certificate IDs** (PB-IOT-YYYY-XXXXX format)
- **Certificate Verification** portal
- Download functionality (planned)
- QR code integration (planned)

### 📊 Progress Tracking
- **Visual Progress Dashboard**
- Circular progress charts
- Learning statistics:
  - Lessons completed
  - Assignments submitted
  - Hours learned
  - Overall progress percentage
- **Achievement Badges:**
  - 🤖 First Robot Built
  - 💻 Code Master
  - ✅ Team Player
  - 💡 Problem Solver

### 👨‍🏫 Mentor Portal (NEW!)
- **Mentor Dashboard**
  - View assigned students count
  - Track pending submissions
  - Monitor unread messages
  - View upcoming live sessions
- **Student Management**
  - View all assigned students
  - Access detailed student profiles
  - Track individual student progress
  - View test results and submissions
- **Grading System**
  - Review pending submissions
  - Grade assignments with scores and feedback
  - View all submissions (pending/graded)
  - Track assignment history
- **Messaging Interface**
  - Communicate with students
  - View message history
  - Real-time messaging
- **Analytics Dashboard**
  - Student performance overview
  - Progress trends
  - Assignment completion rates
  - Test score analytics

## 🎨 Design & UI/UX

### Color Scheme
- **Primary Background:** `#1a1d29` (Dark Blue)
- **Secondary Background:** `#252834` (Medium Dark)
- **Card Background:** `#2a2d3a` (Light Dark)
- **Accent Color:** `#FDB022` (Golden Yellow)
- **Text Primary:** `#ffffff` (White)
- **Text Secondary:** `#a0a3b5` (Gray)

### Features
- ✅ Dark theme optimized for extended learning sessions
- ✅ Responsive design for all screen sizes
- ✅ Smooth animations and transitions
- ✅ Professional iconography (Font Awesome 6)
- ✅ Modern typography (Inter font family)
- ✅ Intuitive navigation
- ✅ Status indicators and progress visualizations

## 🛠️ Technology Stack

### Backend
- **Framework:** Hono (Lightweight, fast web framework)
- **Runtime:** Cloudflare Workers
- **Language:** TypeScript
- **API:** RESTful architecture

### Database
- **Database:** Cloudflare D1 (SQLite)
- **ORM:** Native D1 bindings
- **Migrations:** Wrangler CLI

### Frontend
- **Architecture:** Single Page Application (SPA)
- **JavaScript:** Vanilla JS (ES6+)
- **HTTP Client:** Axios
- **Styling:** Custom CSS3
- **Icons:** Font Awesome 6
- **Fonts:** Google Fonts (Inter)

### Development & Deployment
- **Build Tool:** Vite
- **Package Manager:** npm
- **Process Manager:** PM2
- **Version Control:** Git
- **Deployment:** Cloudflare Pages

## 📁 Project Structure

```
webapp/
├── src/
│   └── index.tsx              # Main Hono application & API routes
├── public/
│   └── static/
│       ├── app.js             # Student Portal Frontend (SPA)
│       ├── mentor.js          # Mentor Portal Frontend (NEW!)
│       └── styles.css         # Shared CSS styles
├── migrations/
│   ├── 0001_initial_schema.sql
│   └── 0002_advanced_features.sql
├── .wrangler/                 # Local D1 database (auto-generated)
├── ecosystem.config.cjs       # PM2 configuration
├── wrangler.jsonc            # Cloudflare configuration
├── vite.config.ts            # Vite build configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## 🗄️ Database Schema

### Core Tables
- **students** - Student profiles and authentication
- **modules** - Course modules
- **lessons** - Lesson content and metadata
- **mcqs** - Multiple choice questions
- **student_progress** - Lesson completion tracking

### Assessment Tables
- **live_tests** - Test metadata
- **test_questions** - Test questions
- **test_results** - Test submissions and scores
- **mcq_results** - MCQ submission results

### Assignment Tables
- **assignments** - Assignment details
- **submissions** - Student submissions
- **feedback** - Assignment feedback

### Communication Tables
- **messages** - Student-mentor messages
- **announcements** - System announcements
- **live_sessions** - Virtual class sessions

### Certification Tables
- **certificates** - Generated certificates
- **verification_logs** - Certificate verification history

### Other Tables
- **hardware_kits** - Hardware delivery tracking
- **badges** - Achievement system
- **notifications** - User notifications

## 🚀 Getting Started

### Prerequisites
```bash
node >= 18.0.0
npm >= 9.0.0
wrangler >= 3.0.0
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/rahulgupta37079-oss/lms.git
cd lms
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up local database**
```bash
npm run db:migrate:local
npm run db:seed
```

4. **Build the application**
```bash
npm run build
```

5. **Start development server**
```bash
npm run dev:sandbox
# Or with PM2
pm2 start ecosystem.config.cjs
```

6. **Access the application**
```
http://localhost:3000
```

### Available Scripts

```bash
# Development
npm run dev              # Start Vite dev server
npm run dev:sandbox      # Start Wrangler dev server
npm run dev:d1          # Start with D1 database

# Build
npm run build           # Build for production

# Database
npm run db:migrate:local    # Apply migrations locally
npm run db:migrate:prod     # Apply migrations to production
npm run db:seed            # Seed database with sample data
npm run db:reset           # Reset local database
npm run db:console:local   # Open local database console
npm run db:console:prod    # Open production database console

# Deployment
npm run deploy             # Deploy to Cloudflare Pages
npm run deploy:prod        # Deploy with project name

# Utilities
npm run clean-port         # Kill process on port 3000
npm run test              # Test local server
```

## 📦 Deployment to Cloudflare Pages

### Prerequisites
1. Cloudflare account
2. Wrangler CLI installed and authenticated
3. D1 database created

### Steps

1. **Create D1 Database**
```bash
npx wrangler d1 create passionbots-lms-production
```

2. **Update wrangler.jsonc with database ID**
```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "passionbots-lms-production",
      "database_id": "your-database-id-here"
    }
  ]
}
```

3. **Apply migrations to production**
```bash
npm run db:migrate:prod
```

4. **Deploy to Cloudflare Pages**
```bash
npm run deploy:prod
```

## 🔑 Environment Variables

### Development (.dev.vars)
```env
# Add any local environment variables here
```

### Production (Cloudflare Secrets)
```bash
# Set production secrets
npx wrangler pages secret put API_KEY --project-name passionbots-lms
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Login with demo credentials
- [ ] Navigate to dashboard
- [ ] View all modules
- [ ] Open a lesson and complete MCQs
- [ ] Take a live test (verify timer)
- [ ] Submit an assignment
- [ ] Check live sessions
- [ ] Send a message
- [ ] Generate a certificate
- [ ] Verify certificate
- [ ] View progress page

## 📈 Roadmap

### Phase 1 (Completed ✅)
- [x] Authentication system
- [x] Course module structure
- [x] MCQ system
- [x] Live tests with timer
- [x] Assignment submissions
- [x] Live sessions
- [x] Messaging system
- [x] Certificate generation
- [x] Certificate verification
- [x] Progress tracking

### Phase 2 (Completed ✅)
- [x] Mentor portal and dashboard
- [x] Student-mentor mapping
- [x] Assignment grading system
- [x] Mentor messaging interface
- [x] Student management for mentors

### Phase 3 (Planned)
- [ ] Video streaming integration
- [ ] File upload to cloud storage (R2)
- [ ] Email notifications
- [ ] Payment integration
- [ ] Mobile responsive optimization
- [ ] Advanced analytics dashboard
- [ ] PDF certificate generation
- [ ] QR code integration

### Phase 3 (Future)
- [ ] Mobile application (React Native)
- [ ] AI-powered learning recommendations
- [ ] Peer-to-peer collaboration
- [ ] Gamification enhancements
- [ ] Advanced reporting for instructors

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary to PassionBots.

## 👥 Authors

- **PassionBots Team** - [PassionBots](https://passionbots.in)
- **Developed by:** Advanced AI Assistant

## 🙏 Acknowledgments

- PassionBots IoT & Robotics Internship Program
- Cloudflare Workers & D1 Database
- Hono Framework
- Font Awesome Icons
- Google Fonts

## 📞 Support

For support, email support@passionbots.in or visit our website.

## 🔗 Links

- **Production URL:** https://passionbots-lms.pages.dev
- **Sandbox URL:** https://3000-i7mh5nrk9jhmc1jr42bzs-cbeee0f9.sandbox.novita.ai
- **GitHub:** https://github.com/rahulgupta37079-oss/lms
- **PassionBots:** https://passionbots.in
- **Certificate Verification:** https://verify.passionbots.in

---

**Made with ❤️ for PassionBots Students**

*Empowering the next generation of IoT & Robotics innovators*
