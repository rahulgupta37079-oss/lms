# PassionBots Student LMS Portal

A comprehensive Learning Management System for the PassionBots IoT & Robotics Internship Program.

## 🚀 Project Overview

**Name**: PassionBots Student LMS  
**Goal**: Provide an interactive learning platform for students enrolled in the 2-month IoT & Robotics Internship  
**Platform**: Cloudflare Pages + Hono Framework + D1 Database  

## 🌐 URLs

- **Development**: https://3000-i7mh5nrk9jhmc1jr42bzs-cbeee0f9.sandbox.novita.ai
- **Production**: (To be deployed)
- **GitHub**: (To be created)

## 📚 Main Features

### ✅ Currently Completed Features

1. **Student Authentication**
   - Secure login system with email and password
   - Session management with localStorage
   - Demo credentials: demo@student.com / demo123

2. **Interactive Dashboard**
   - Overall course progress tracking (23% completed)
   - Real-time statistics: completed lessons, in-progress, assignments
   - Latest announcements display
   - Upcoming live sessions calendar

3. **Course Management (8 Modules)**
   - Module 1: IoT & Robotics Fundamentals
   - Module 2: ESP32 Microcontroller Basics
   - Module 3: ESP32 Programming
   - Module 4: Wireless & IoT Protocols
   - Module 5: Sensors & Actuators
   - Module 6: Cloud Platforms & Data
   - Module 7: Capstone Project
   - Module 8: Career & Certification

4. **Progress Tracking System**
   - Lesson-by-lesson progress monitoring
   - Three states: Not Started, In Progress, Completed
   - Percentage-based completion tracking
   - Last accessed timestamp

5. **Assignments & Submissions**
   - Assignment listing with due dates
   - Submission interface (GitHub, demo URL, description)
   - Status tracking: Pending, Reviewed, Resubmit
   - Score and feedback display

6. **Live Sessions Management**
   - Upcoming and past sessions listing
   - Meeting links for live attendance
   - Recording availability for completed sessions
   - Duration and module information

7. **Certificate System**
   - Dual certificates: Internship Completion & Skill Mastery
   - Unique certificate IDs (PB-IOT-2025-XXXXX format)
   - Online verification system
   - Download functionality

8. **Hardware Kit Tracking**
   - ESP32 kit delivery status
   - Tracking number and shipping details
   - Kit contents listing
   - Delivery address management

9. **Discussion Forum**
   - Create posts and replies
   - Module-specific discussions
   - View count and engagement tracking
   - Pinned posts support

10. **Announcements System**
    - Priority-based announcements (High, Medium, Low)
    - Target audience filtering
    - Real-time updates

## 🔌 Functional Entry URIs (API Endpoints)

### Authentication
- `POST /api/auth/login` - Student login
  - Body: `{ email, password }`
  - Returns: `{ success, student, message }`

### Dashboard
- `GET /api/dashboard/:studentId` - Get dashboard statistics
  - Returns: `{ stats, upcomingSessions }`

### Courses & Modules
- `GET /api/modules/:studentId` - Get all modules with progress
- `GET /api/modules/:moduleId/lessons/:studentId` - Get module lessons
- `GET /api/lessons/:lessonId/:studentId` - Get lesson details

### Progress Tracking
- `POST /api/progress/update` - Update lesson progress
  - Body: `{ studentId, lessonId, status, progressPercentage }`

### Assignments
- `GET /api/assignments/:studentId` - Get all assignments
- `POST /api/assignments/submit` - Submit assignment
  - Body: `{ assignmentId, studentId, submissionUrl, githubUrl, demoUrl, description }`

### Live Sessions
- `GET /api/sessions` - Get all live sessions
- `POST /api/sessions/attend` - Mark session attendance
  - Body: `{ sessionId, studentId }`

### Certificates
- `GET /api/certificates/:studentId` - Get student certificates
- `GET /api/verify/:certificateId` - Verify certificate authenticity

### Announcements
- `GET /api/announcements` - Get latest announcements

### Hardware Kit
- `GET /api/hardware/:studentId` - Get hardware kit delivery status

### Forum
- `GET /api/forum` - Get forum posts
- `GET /api/forum/:postId` - Get post with replies
- `POST /api/forum/post` - Create new post
  - Body: `{ studentId, moduleId, lessonId, title, content }`
- `POST /api/forum/reply` - Reply to post
  - Body: `{ postId, studentId, content }`

## 🗄️ Data Architecture

### Database: Cloudflare D1 (SQLite)

**Main Data Models:**

1. **Students**
   - Personal information, program type, batch details
   - Premium vs Learning-Only program tracking

2. **Modules & Lessons**
   - 8-module curriculum structure
   - Lesson content, videos, resources
   - Order indexing for proper sequencing

3. **Student Progress**
   - Per-lesson progress tracking
   - Status, percentage, timestamps
   - Completion tracking

4. **Assignments & Submissions**
   - Assignment requirements and due dates
   - Student submissions with GitHub/demo links
   - Scoring and feedback system

5. **Live Sessions**
   - Schedule, meeting links, recordings
   - Duration and module association

6. **Session Attendance**
   - Attendance tracking per student per session

7. **Certificates**
   - Dual certification system
   - Unique IDs with verification URLs
   - QR code support

8. **Hardware Kits**
   - Tracking numbers, delivery status
   - Shipping addresses
   - Premium program exclusive

9. **Forum System**
   - Posts with module/lesson association
   - Threaded replies
   - View counts and engagement metrics

10. **Announcements**
    - Priority levels and target audiences
    - Publication timestamps

**Storage Services:**
- **Primary**: Cloudflare D1 Database (local SQLite for development)
- **Future**: Cloudflare R2 for file uploads (videos, assignments)

## 📖 User Guide

### For Students:

1. **Login**
   - Use your email and password provided during enrollment
   - Demo account available: demo@student.com / demo123

2. **Dashboard**
   - View your overall progress and statistics
   - Check upcoming live sessions
   - Read latest announcements

3. **My Courses**
   - Browse all 8 modules of the curriculum
   - Click on any module to view lessons
   - Track your completion percentage

4. **Lessons**
   - Watch video lectures
   - Read lesson content and materials
   - Mark lessons as complete
   - Download resources

5. **Assignments**
   - View assignment requirements and due dates
   - Submit your work with GitHub links
   - Check scores and feedback

6. **Live Sessions**
   - Join upcoming sessions via meeting links
   - Access recordings of past sessions
   - Mark attendance

7. **Certificates**
   - Download your certificates upon completion
   - Verify certificates online
   - Share verification links

8. **Hardware Kit**
   - Track your ESP32 kit delivery
   - View kit contents and specifications
   - Update delivery address

9. **Forum**
   - Ask questions and participate in discussions
   - Search by module or lesson
   - Reply to other students' posts

## 🛠️ Tech Stack

- **Backend Framework**: Hono (v4.11.1)
- **Runtime**: Cloudflare Workers/Pages
- **Database**: Cloudflare D1 (SQLite)
- **Frontend**: Vanilla JavaScript + TailwindCSS
- **Icons**: Font Awesome 6.4.0
- **HTTP Client**: Axios 1.6.0
- **Build Tool**: Vite 6.3.5
- **Process Manager**: PM2 (development)

## 🚧 Features Not Yet Implemented

1. **Video Upload & Streaming**
   - Cloudflare Stream integration for lesson videos
   - Video progress tracking

2. **File Upload System**
   - Assignment file submissions
   - Profile picture uploads
   - Cloudflare R2 integration

3. **Real-time Notifications**
   - WebSocket-based notifications
   - Email notifications for announcements

4. **Advanced Analytics**
   - Detailed learning analytics
   - Time spent per lesson
   - Performance insights

5. **Mobile App**
   - Native iOS/Android apps
   - Offline lesson access

6. **Mentor Dashboard**
   - Instructor/mentor portal
   - Assignment grading interface
   - Student progress monitoring

7. **Payment Integration**
   - Stripe integration for program enrollment
   - Hardware kit payment processing

8. **Zoom/Google Meet Integration**
   - Automated meeting creation
   - Attendance tracking via API

9. **Certificate Generator**
   - Automated certificate generation
   - PDF export with QR codes

10. **Advanced Forum Features**
    - Rich text editor
    - File attachments
    - Search functionality
    - Moderation tools

## 📋 Recommended Next Steps

1. **Deploy to Cloudflare Pages**
   - Set up production D1 database
   - Configure environment variables
   - Deploy via GitHub integration

2. **Video Content Integration**
   - Record lesson videos
   - Upload to Cloudflare Stream
   - Update lesson video URLs

3. **Implement File Uploads**
   - Set up Cloudflare R2 bucket
   - Add file upload API endpoints
   - Update frontend with upload UI

4. **Email Notifications**
   - Integrate with SendGrid/Mailgun
   - Set up email templates
   - Implement notification triggers

5. **Mentor Portal**
   - Create admin authentication
   - Build grading interface
   - Add student management features

6. **Testing & QA**
   - User acceptance testing
   - Performance optimization
   - Mobile responsiveness testing

7. **Documentation**
   - API documentation
   - User manual
   - Video tutorials

8. **Analytics Setup**
   - Google Analytics integration
   - Custom event tracking
   - User behavior analysis

## 🎯 Program Details

- **Batch Start**: January 10th, 2026
- **Duration**: 2 months (8 weeks)
- **Format**: Live online sessions
- **Hardware**: ESP32 microcontroller kit included (Premium program)
- **Certificates**: Dual certification upon completion
- **Support**: Industry mentorship and career guidance

## 📞 Contact Information

- **Website**: https://www.passionbots.in/program
- **WhatsApp**: +91 9137361474
- **Email**: info@passion3dworld.com

## 🔒 Security Notes

- Passwords are stored in plain text (DEMO ONLY - implement bcrypt hashing for production)
- No rate limiting implemented
- CORS enabled for all API routes
- Session management via localStorage (implement JWT for production)

## 📜 License

© 2026 PassionBots | All Rights Reserved

---

**Last Updated**: December 17, 2025  
**Version**: 1.0.0  
**Status**: ✅ Development Complete - Ready for Testing
