# 🎓 PassionBots LMS - IoT & Robotics Learning Platform

![PassionBots LMS](https://img.shields.io/badge/PassionBots-LMS-FDB022?style=for-the-badge)
![Version](https://img.shields.io/badge/version-5.0-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/status-Production_Ready-success?style=for-the-badge)

A comprehensive Learning Management System (LMS) for the PassionBots IoT & Robotics Course. Built with modern web technologies featuring automated email notifications, certificate generation, and integrated payment processing.

## 🌐 Live URLs

- **Production:** [https://passionbots-lms.pages.dev](https://passionbots-lms.pages.dev)
- **GitHub:** [https://github.com/rahulgupta37079-oss/lms](https://github.com/rahulgupta37079-oss/lms)

## 🆕 What's New in v5.0

### 📧 Email Notification System
- **Automated registration confirmation emails** - Welcome students instantly
- **Payment success/failure notifications** - Keep students informed
- **Course access emails** - Guide students to start learning
- **Certificate delivery emails** - Celebrate achievements
- **Payment reminders** - Reduce drop-offs
- Beautiful HTML email templates with PassionBots branding
- Email tracking and logging system

### 🎓 Certificate Generation System  
- **Automatic certificate generation** upon course completion
- **QR code verification** - Verify authenticity instantly
- **Beautiful HTML certificates** - Print or share digitally
- **Certificate verification portal** - Public verification at `/verify-certificate`
- **LinkedIn-ready certificates** - Share achievements professionally
- **Unique certificate IDs** - Each certificate is uniquely identified

### 🎨 Marketing Landing Page
- **Professional landing page** at `/marketing-landing.html`
- Hero section with compelling call-to-action
- Features showcase with icons and descriptions
- Complete curriculum overview
- Student testimonials section
- Transparent pricing with benefits
- FAQ section answering common questions
- Mobile-responsive design
- SEO-optimized structure

## ✨ Core Features

### 🔐 Student Management
- Email-based student login system
- Course registration portal
- Student dashboard with progress tracking
- Payment status badges (PAID/PENDING/FAILED)
- Payment history viewer

### 💰 Payment Integration
- **PayU Payment Gateway** (Production)
- Course Fee: ₹2,999 (Special offer: 50% off ₹5,999)
- Secure payment processing with SHA-512 hashing
- Multiple payment methods: Card, UPI, Net Banking, Wallets
- Real-time payment status updates
- Callback webhooks configured
- Transaction history and receipts

### 🎓 Course Content
- **8 IoT & Robotics Modules**
  - IoT & Robotics Fundamentals
  - ESP32 Microcontroller Basics
  - Sensor Integration & Data Collection
  - Actuators & Motor Control
  - Wireless Communication (WiFi, Bluetooth)
  - Cloud Integration & IoT Platforms
  - Advanced Projects & Prototyping
  - Final Project & Deployment

### 🎥 Live Classes (Zoom Integration)
- Create Zoom meetings from admin dashboard
- Live class scheduling and management
- Meeting links sent to students
- Recorded session access

### 👨‍💼 Admin Dashboard
- Student management (view, search, edit, delete)
- Payment statistics and tracking
- Payment reports with CSV export
- Zoom meeting creation
- Course module management
- Live class scheduling

### 📊 Analytics & Tracking
- Payment statistics (revenue, success rate, conversions)
- Student progress tracking
- Email delivery tracking
- Certificate issuance tracking

## 🛠️ Technology Stack

### Frontend
- **HTML/CSS/JavaScript** - Modern vanilla JS
- **TailwindCSS** - Utility-first CSS via CDN
- **Font Awesome** - Icon library
- Responsive design for mobile/tablet/desktop

### Backend
- **Hono Framework** - Lightweight web framework
- **TypeScript** - Type-safe development
- **Cloudflare Workers** - Edge runtime
- **Cloudflare D1** - SQLite database
- **Cloudflare Pages** - Static hosting + functions

### Email Service
- **Resend API** - Transactional email delivery
- HTML email templates
- Email tracking and logging

### Payment Gateway
- **PayU** - Secure payment processing
- SHA-512 hash verification
- Multiple payment methods
- Webhook callbacks

### Certificate Generation
- **QRCode** - QR code generation for verification
- HTML-based certificates
- PDF-ready design

## 📁 Project Structure

```
passionbots-lms/
├── src/
│   ├── index.tsx                 # Main Hono application
│   └── services/
│       ├── email.ts              # Email service with Resend
│       └── certificate.ts        # Certificate generation
├── public/
│   ├── marketing-landing.html    # Marketing landing page
│   └── static/                   # Static assets
├── migrations/
│   ├── 0001_initial_schema.sql
│   ├── 0002_add_payment_tracking.sql
│   └── 0015_email_notifications.sql
├── dist/                         # Production build output
├── package.json
├── wrangler.jsonc                # Cloudflare configuration
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Cloudflare account
- Resend API key (for emails)
- PayU merchant credentials

### Installation

```bash
# Clone repository
git clone https://github.com/rahulgupta37079-oss/lms.git
cd lms

# Install dependencies
npm install

# Setup environment variables
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your credentials

# Run database migrations
npm run db:migrate:local

# Build project
npm run build

# Start development server
npm run dev:sandbox
```

### Environment Variables

Create a `.dev.vars` file with:

```env
# Resend Email API
RESEND_API_KEY=re_your_resend_api_key

# PayU Payment Gateway (Production)
PAYU_MERCHANT_KEY=your_merchant_key
PAYU_SALT=your_salt_key
PAYU_MID=your_merchant_id

# Zoom Integration (Optional)
ZOOM_ACCOUNT_ID=your_zoom_account_id
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret
```

## 🌍 Deployment

### Production Deployment to Cloudflare Pages

```bash
# Build project
npm run build

# Deploy to Cloudflare Pages
npm run deploy:prod

# Configure production secrets
npx wrangler pages secret put RESEND_API_KEY --project-name passionbots-lms
npx wrangler pages secret put PAYU_MERCHANT_KEY --project-name passionbots-lms
npx wrangler pages secret put PAYU_SALT --project-name passionbots-lms

# Apply database migrations to production
npm run db:migrate:prod
```

## 📧 Email Notification Flow

1. **Registration** → Sends welcome email with course details
2. **Payment Success** → Sends payment confirmation and course access email
3. **Payment Failure** → Sends failure notification with retry instructions
4. **Certificate Generation** → Sends certificate with download link

## 🎓 Certificate Flow

1. **Course Completion** → Admin or automated trigger
2. **Generate Certificate** → POST `/api/certificate/generate/:registrationId`
3. **Email Sent** → Certificate link sent to student
4. **View Certificate** → `/certificate/:certificateId`
5. **Verify Certificate** → `/verify-certificate?id=CERT_ID`

## 💳 Payment Flow

1. **Student Registration** → Email confirmation sent
2. **Payment Initiation** → POST `/api/payment/initiate`
3. **PayU Gateway** → Redirect to PayU for payment
4. **Payment Success** → Callback to `/api/payment/callback/success`
5. **Email Sent** → Payment success + course access emails
6. **Dashboard Updated** → Status shows PAID

## 📊 API Endpoints

### Student APIs
- `POST /api/register` - Register new student
- `POST /api/student-login` - Student login
- `GET /api/payment/course-fee` - Get course fee

### Payment APIs
- `POST /api/payment/initiate` - Initiate payment
- `POST /api/payment/callback/success` - Payment success callback
- `POST /api/payment/callback/failure` - Payment failure callback
- `GET /api/payment/status/:orderId` - Check payment status
- `GET /api/payment/student/:regId` - Student payment history

### Certificate APIs
- `POST /api/certificate/generate/:registrationId` - Generate certificate
- `GET /certificate/:certificateId` - View certificate
- `GET /verify-certificate` - Verify certificate
- `GET /api/certificate/student/:registrationId` - Get student certificate

### Admin APIs
- `GET /api/admin/payment-stats` - Payment statistics
- `GET /api/admin/payments` - All payments with search

## 📈 Growth Features

### Current Statistics (as of Jan 2026)
- Course Fee: ₹2,999 (50% OFF)
- Original Price: ₹5,999
- Payment Gateway: PayU (Production)
- Email System: Resend (Active)
- Certificates: Auto-generated with QR verification

### Revenue Projections
- **Month 1:** 30 students = ₹89,970
- **Month 2:** 50 students = ₹149,950
- **Month 3:** 100 students = ₹299,900
- **Q1 Total:** ₹539,820

## 🔒 Security Features

- SHA-512 payment hash verification
- Cloudflare secrets for API keys
- HTTPS-only connections
- Secure session management
- Email verification
- Certificate verification with QR codes

## 📝 Database Schema

### Key Tables
- `course_registrations` - Student registrations
- `payments` - Payment transactions
- `certificates` - Generated certificates
- `email_logs` - Email delivery tracking
- `live_classes` - Zoom meeting schedules
- `students` - Student profiles

## 🎯 Next Steps & Roadmap

### Immediate Priorities
- [ ] Test email delivery in production
- [ ] Monitor payment conversions
- [ ] Collect student testimonials
- [ ] SEO optimization

### Future Enhancements
- [ ] Automated payment reminders
- [ ] Progress-based certificate generation
- [ ] Student referral program
- [ ] Course completion tracking
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] WhatsApp notifications
- [ ] Video course content

## 🤝 Contributing

This is a private educational platform. For inquiries, contact the development team.

## 📄 License

© 2026 PassionBots. All rights reserved.

## 📞 Support

- **Email:** support@passionbots.com
- **Website:** https://passionbots-lms.pages.dev
- **GitHub:** https://github.com/rahulgupta37079-oss/lms

---

**Built with ❤️ by the PassionBots Team**

*Empowering Innovation Through IoT & Robotics Education*
