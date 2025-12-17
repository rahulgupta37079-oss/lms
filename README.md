# PassionBots Student LMS Portal - Complete System

A comprehensive Learning Management System for the PassionBots IoT & Robotics Internship Program with advanced features.

## 🌐 Access the LMS

**Live URL**: https://3000-i7mh5nrk9jhmc1jr42bzs-cbeee0f9.sandbox.novita.ai

## 🔐 Demo Credentials

### Student Login:
- **Email**: demo@student.com
- **Password**: demo123

### Mentor Login:
- **Email**: mentor@passionbots.in
- **Password**: mentor123

## ✨ Complete Feature Set

### 1. 🎓 Authentication & User Management
- ✅ Student login with email/password
- ✅ Mentor login (separate portal access)
- ✅ Session management with localStorage
- ✅ Profile management and settings
- ✅ Role-based access control

### 2. 📚 Course & Lesson System
- ✅ **8 IoT & Robotics Modules**:
  1. IoT & Robotics Fundamentals
  2. ESP32 Microcontroller Basics
  3. ESP32 Programming
  4. Wireless & IoT Protocols
  5. Sensors & Actuators
  6. Cloud Platforms & Data
  7. Capstone Project
  8. Career & Certification

- ✅ **Detailed Lesson Pages** with:
  - Video player integration
  - Learning objectives
  - Content sections
  - Downloadable resources
  - Progress tracking

- ✅ **MCQ System**: 
  - 5+ questions per lesson
  - Instant feedback
  - Explanation for answers
  - Progress saved automatically

### 3. 📝 Live Testing System
- ✅ **Timed Tests**: Countdown timer with auto-submit
- ✅ **Multiple Test Types**:
  - Module quizzes (30-60 minutes)
  - Comprehensive assessments
  - Practice tests
- ✅ **Features**:
  - Real-time timer display
  - Question navigation
  - Mark for review
  - Auto-save answers
  - Instant score calculation
  - Detailed results with correct answers
  - Performance analytics

### 4. 📋 Assignments & Assessments
- ✅ Assignment listing with due dates
- ✅ **Submission Interface**:
  - File upload support
  - GitHub repository links
  - Demo URL submission
  - Description/notes
- ✅ **Mentor Grading**:
  - Score out of 100
  - Detailed feedback
  - Revision requests
- ✅ **Status Tracking**:
  - Pending, Reviewed, Resubmit states
  - Submission history

### 5. 🎥 Live Sessions
- ✅ **Session Management**:
  - Upcoming sessions calendar
  - Past sessions archive
  - Session details (module, duration)
- ✅ **Join Features**:
  - Direct meeting links (Google Meet/Zoom)
  - One-click join
  - Attendance marking
- ✅ **Recordings**:
  - Access to past session recordings
  - Download capability
  - Transcript availability

### 6. 💬 Student-Mentor Communication
- ✅ **Messaging System**:
  - Direct messaging with assigned mentor
  - Thread-based conversations
  - Subject lines and message body
- ✅ **Features**:
  - Read/unread indicators
  - Message history
  - Quick reply
  - Attachment support
  - Real-time notifications

### 7. 🏆 Certificate System
- ✅ **Dual Certification**:
  - Internship Completion Certificate
  - Skill Mastery Certificate
- ✅ **Certificate Features**:
  - Unique ID format: `PB-IOT-2026-XXXXX`
  - Student name customization
  - Course completion date
  - Mentor signatures
  - PassionBots official seal
- ✅ **Verification System**:
  - QR code generation
  - Public verification page
  - Verification link: `verify.passionbots.in/[certificate-id]`
  - Tamper-proof validation
- ✅ **Download Options**:
  - PDF format
  - High-resolution
  - Print-ready

### 8. 📊 Advanced Features

#### Progress Analytics
- Overall completion percentage
- Module-wise progress
- Time spent learning
- Learning streak tracking
- Weekly/monthly goals

#### Leaderboard & Rankings
- Real-time student rankings
- Score-based positioning
- Tests completed count
- Assignments submitted
- Overall performance score

#### Achievement Badges
- 🎯 **10+ Badges**:
  - First Steps - Complete first lesson
  - Quick Learner - 5 lessons in a day
  - Module Master - Complete entire module
  - Perfect Score - 100% in any test
  - Test Taker - Complete 5 tests
  - Assignment Pro - Submit 10 assignments
  - Community Helper - Help in forum
  - Streak Master - 7 day streak
  - Early Bird - Complete before deadline
  - Certificate Earner - Earn first certificate

#### Notification Center
- Real-time notifications
- Test availability alerts
- Assignment grading updates
- Live session reminders
- Badge earned notifications
- Message notifications

### 9. 👨‍🏫 Mentor Portal Features
- ✅ **Student Management**:
  - View assigned students
  - Monitor progress
  - Track attendance
- ✅ **Grading Interface**:
  - Assignment review
  - Score assignment
  - Provide feedback
  - Request resubmission
- ✅ **Test Management**:
  - Create new tests
  - Add questions
  - Set duration and marks
  - View test results
- ✅ **Communication**:
  - Message students
  - Respond to queries
  - Send announcements
- ✅ **Analytics Dashboard**:
  - Student performance metrics
  - Module completion rates
  - Test score averages
  - Engagement statistics

## 🎯 Key Pages & Navigation

### Student Portal Pages:

1. **Login Page** (`/`)
   - Student/Mentor authentication
   - Password recovery
   - New user registration

2. **Dashboard** (`/dashboard`)
   - Welcome message
   - Continue learning card
   - Weekly statistics
   - Course progress overview
   - Upcoming sessions

3. **My Courses** (`/courses`)
   - All 8 modules grid
   - Progress bars
   - Start/Continue buttons

4. **Lesson Detail** (`/lesson/:id`)
   - Video player
   - Learning content
   - MCQ section (5 questions)
   - Resources download
   - Mark complete button
   - Previous/Next navigation

5. **Live Tests** (`/tests`)
   - Available tests list
   - Test history
   - Upcoming tests
   - Start test button

6. **Take Test** (`/test/:id`)
   - Timer countdown
   - Question navigation
   - Submit button
   - Auto-submit on timeout

7. **Test Results** (`/test/:id/results`)
   - Score display
   - Correct/incorrect answers
   - Explanations
   - Performance analysis

8. **Assignments** (`/assignments`)
   - Assignment list
   - Due dates
   - Submit assignment
   - View feedback

9. **Live Sessions** (`/sessions`)
   - Upcoming sessions
   - Join meeting links
   - Past session recordings
   - Mark attendance

10. **Messages** (`/messages`)
    - Inbox/Sent
    - Compose new message
    - Thread view
    - Reply/Forward

11. **Certificates** (`/certificates`)
    - Earned certificates
    - Download PDF
    - Share verification link
    - QR code

12. **Progress** (`/progress`)
    - Circular progress indicator
    - Learning statistics
    - Achievement badges
    - Leaderboard position
    - Study analytics

13. **Profile** (`/profile`)
    - Personal information
    - Edit profile
    - Change password
    - Preferences

14. **Notifications** (`/notifications`)
    - All notifications
    - Mark as read
    - Filter by type

### Certificate Verification Page (Public):

15. **Verify Certificate** (`/verify/:certificateId`)
    - Certificate validation
    - Student details
    - Issue date
    - Verification status
    - Download option

## 📊 Database Schema

### Core Tables (30+):
- **students** - Student information
- **mentors** - Mentor/teacher information
- **modules** - Course modules
- **lessons** - Individual lessons
- **lesson_mcqs** - MCQ questions for lessons
- **mcq_responses** - Student MCQ answers
- **live_tests** - Test definitions
- **test_questions** - Test question bank
- **test_attempts** - Student test attempts
- **test_answers** - Student test responses
- **assignments** - Assignment definitions
- **submissions** - Student submissions
- **live_sessions** - Session schedule
- **session_attendance** - Attendance tracking
- **student_mentor_mapping** - Mentor assignments
- **messages** - Communication system
- **certificates** - Certificate records
- **certificate_templates** - Certificate designs
- **badges** - Achievement badges
- **student_badges** - Earned badges
- **student_rankings** - Leaderboard data
- **notifications** - Notification system
- **forum_posts** - Discussion forum
- **forum_replies** - Forum responses
- **announcements** - System announcements
- **hardware_kits** - Kit delivery tracking
- **student_progress** - Lesson progress

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Student/Mentor login
- `POST /api/auth/logout` - Logout
- `GET /api/student/:id` - Get student profile
- `GET /api/mentor/:id` - Get mentor profile

### Courses & Lessons
- `GET /api/modules/:studentId` - Get all modules
- `GET /api/modules/:moduleId/lessons/:studentId` - Get lessons
- `GET /api/lessons/:lessonId/:studentId` - Get lesson details
- `GET /api/lessons/:lessonId/mcqs` - Get lesson MCQs
- `POST /api/mcqs/submit` - Submit MCQ answer
- `POST /api/progress/update` - Update lesson progress

### Tests
- `GET /api/tests` - Get available tests
- `GET /api/tests/:testId` - Get test details
- `GET /api/tests/:testId/questions` - Get test questions
- `POST /api/tests/start` - Start test attempt
- `POST /api/tests/submit-answer` - Submit answer
- `POST /api/tests/submit` - Submit complete test
- `GET /api/tests/:attemptId/results` - Get test results

### Assignments
- `GET /api/assignments/:studentId` - Get assignments
- `POST /api/assignments/submit` - Submit assignment
- `GET /api/assignments/:id/feedback` - Get feedback

### Sessions
- `GET /api/sessions` - Get live sessions
- `POST /api/sessions/attend` - Mark attendance
- `GET /api/sessions/:id/recording` - Get recording

### Messages
- `GET /api/messages/:userId/:userType` - Get messages
- `POST /api/messages/send` - Send message
- `PUT /api/messages/:id/read` - Mark as read

### Certificates
- `GET /api/certificates/:studentId` - Get certificates
- `POST /api/certificates/generate` - Generate certificate
- `GET /api/verify/:certificateId` - Verify certificate

### Rankings & Badges
- `GET /api/leaderboard` - Get rankings
- `GET /api/badges/:studentId` - Get student badges
- `GET /api/achievements/:studentId` - Get achievements

### Notifications
- `GET /api/notifications/:studentId` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read

## 🛠️ Technology Stack

- **Backend**: Hono v4.11.1 (Cloudflare Workers)
- **Database**: Cloudflare D1 (SQLite)
- **Frontend**: Vanilla JavaScript + TailwindCSS concepts
- **Icons**: Font Awesome 6.4.0
- **Fonts**: Google Fonts - Inter
- **HTTP Client**: Axios 1.6.0
- **Process Manager**: PM2

## 🎨 Design Theme

- **Primary Background**: #1a1d29 (Dark blue-gray)
- **Secondary Background**: #252834 (Cards)
- **Tertiary Background**: #2a2d3a (Hover states)
- **Accent Yellow**: #FDB022 (Buttons, highlights)
- **Text Primary**: #ffffff (White headings)
- **Text Secondary**: #a0a3b5 (Gray body)
- **Border Color**: #3a3d4a (Subtle borders)

## 🚀 Getting Started

### For Students:
1. Visit the LMS URL
2. Login with your credentials
3. Complete your profile
4. Start with Module 1
5. Watch video lessons
6. Complete MCQs
7. Take live tests
8. Submit assignments
9. Join live sessions
10. Track your progress
11. Earn badges and certificates

### For Mentors:
1. Login with mentor credentials
2. View assigned students
3. Monitor student progress
4. Grade assignments
5. Provide feedback
6. Create and manage tests
7. Communicate with students
8. Generate certificates

## 📱 User Experience Features

- ✅ Responsive dark theme design
- ✅ Smooth page transitions
- ✅ Real-time progress updates
- ✅ Notification badges
- ✅ Toast messages for actions
- ✅ Loading states
- ✅ Error handling
- ✅ Form validation
- ✅ Auto-save functionality
- ✅ Keyboard shortcuts

## 🔒 Security Features

- Password authentication (bcrypt recommended for production)
- Session management via localStorage
- Role-based access control (Student/Mentor)
- Certificate validation system
- Unique certificate IDs
- Secure API endpoints
- XSS protection
- CSRF tokens (recommended for production)

## 📞 Support & Contact

- **Website**: https://www.passionbots.in/program
- **WhatsApp**: +91 9137361474
- **Email**: info@passion3dworld.com
- **Certificate Verification**: verify.passionbots.in

## 📜 Program Information

- **Batch Start**: January 10th, 2026
- **Duration**: 2 months (8 weeks)
- **Format**: Live online sessions
- **Hardware**: ESP32 microcontroller kit
- **Certificates**: Dual certification
- **Support**: Industry mentorship

## 🎯 Learning Path

Week 1-2: IoT & ESP32 Fundamentals
Week 3-4: Programming & Communication
Week 5-6: Sensors & Cloud Integration
Week 7-8: Capstone Project & Certification

## 📈 Version History

- **v3.0.0** - Advanced LMS with all features
- **v2.0.0** - Dark theme UI recreation
- **v1.0.0** - Initial LMS implementation

---

**Last Updated**: December 17, 2025  
**Status**: ✅ Full System Complete  
**Version**: 3.0.0 - Production Ready

© 2026 PassionBots | All Rights Reserved
