# 📚 PassionBots Certificate System - Complete Documentation

## 🎯 Project Overview

This is a complete certificate generation and management system for PassionBots IoT & Robotics courses. The system generates professional A4 landscape certificates with real handwritten signatures, provides direct PDF downloads, and includes a full admin portal for certificate management.

---

## 🌐 Live URLs

### Production URLs:
- **Main Site**: https://passionbots-lms.pages.dev
- **Admin Portal**: https://passionbots-lms.pages.dev/admin
- **Latest Deployment**: https://5620dba0.passionbots-lms.pages.dev
- **GitHub Repository**: https://github.com/rahulgupta37079-oss/lms

### Admin Credentials:
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Super Admin
- **Permissions**: All (generate, manage, bulk, verify)

---

## 📄 Certificate Specifications

### Format:
- **Size**: A4 Landscape (297mm × 210mm / 11.69" × 8.27")
- **Orientation**: Landscape (horizontal)
- **Print-ready**: Yes, perfect for standard A4 printers
- **Resolution**: High quality (2x scale for crisp output)
- **File Format**: PDF via html2canvas + jsPDF

### Design Elements:
1. **Yellow Left Bar** (100px wide)
   - Vertical text: "PASSIONBOTS // FUTURE TECH"
   - Gold gradient background (#ffd700 to #f4c430)

2. **Certificate ID Tag** (top-right)
   - Format: PB-IOT-2025-XXXXX
   - Yellow background, black text

3. **Logo Section**
   - Robot icon (55px)
   - "PASSIONBOTS" text

4. **Title**
   - "CERTIFICATE" in large text (5.5rem)
   - Gold outline style

5. **Subtitle**
   - "OF PARTICIPATION // IOT & ROBOTICS"
   - Decorative lines before/after

6. **Student Name**
   - Large gold text (3.8rem)
   - All caps, with text shadow

7. **Description**
   - Custom text about achievement
   - 1.1rem font size

8. **Footer** (3-column grid):
   - **Column 1**: Date Issued
   - **Column 2**: Real handwritten signature (white, 120×50px) + "CEO, PASSIONBOTS"
   - **Column 3**: Verify URL (passionbots.co.in)

### Color Scheme:
- **Background**: Black gradient (#0a0a0a to #1a1a1a)
- **Primary Accent**: Gold (#ffd700)
- **Text**: White (#fff) and light gray (#ccc, #999)
- **Signature**: White (enhanced from original blue ink)

---

## 🔐 Authentication System

### Admin Users Table:
```sql
CREATE TABLE admin_users (
  admin_id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  permissions TEXT DEFAULT '[]',
  status TEXT DEFAULT 'active',
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Default Admin:
- Username: admin
- Password: admin123 (should be hashed in production)
- Email: admin@passionbots.in
- Role: super_admin
- Permissions: ["all"]

### Session Management:
- Session token format: `admin_{timestamp}_{random}`
- Expiration: 24 hours
- Stored in: `admin_sessions` table
- Frontend storage: localStorage (`admin_session` key)

---

## 📊 Database Schema

### Certificates Table:
```sql
CREATE TABLE certificates (
  certificate_id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER,
  course_id INTEGER,
  certificate_code TEXT UNIQUE NOT NULL,
  student_name TEXT NOT NULL,
  course_name TEXT NOT NULL,
  issue_date DATE NOT NULL,
  completion_date DATE,
  certificate_data TEXT,
  qr_code_url TEXT,
  verification_url TEXT,
  status TEXT DEFAULT 'active',
  certificate_type TEXT DEFAULT 'participation',
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Certificate Code Format:
- Pattern: `PB-IOT-YYYY-{RANDOM}{TIMESTAMP}`
- Example: `PB-IOT-2025-NN4PC8MJSZ34EQ`
- Unique for each certificate

### Current Certificates:
- Total: 26 certificates (IDs 1-26)
- Active: 19 certificates (IDs 8-26) from bulk generation
- Course: IOT Robotics Program
- Type: Participation
- Date: December 28, 2025

---

## 🔧 Technical Stack

### Backend:
- **Framework**: Hono (v4.0.0+)
- **Runtime**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Deployment**: Cloudflare Pages

### Frontend:
- **Framework**: Vanilla JavaScript
- **Styling**: Tailwind CSS 2.2.19 (CDN)
- **Icons**: Font Awesome 6.4.0
- **Fonts**: Google Fonts (Oswald, Roboto)

### PDF Generation:
- **html2canvas**: v1.4.1 (HTML to canvas)
- **jsPDF**: v2.5.1 (Canvas to PDF)
- **Process**: HTML → Canvas (2x scale) → PDF (A4 landscape)

### Image Processing:
- **Tool**: ImageMagick (convert)
- **Signature**: 
  - Original: 144×104px blue ink PNG
  - Enhanced: 200×80px white grayscale PNG
  - Process: Grayscale → Threshold → Invert → Smooth → Resize
  - File: `/public/static/signature-real.png`

---

## 📁 Project Structure

```
webapp/
├── src/
│   └── index.tsx                 # Main Hono application
├── public/
│   └── static/
│       ├── signature-real.png           # Enhanced white signature
│       ├── signature-real-original.png  # Original blue signature
│       ├── signature-real-enhanced.png  # Intermediate enhanced
│       ├── signature.svg                # Old SVG signature (unused)
│       ├── app-admin-certificates.js    # Admin portal frontend
│       └── app-bulk-certificates.js     # Bulk generation UI
├── migrations/
│   ├── 0001_initial_schema.sql
│   ├── 0012_certificate_generation.sql
│   ├── 0013_admin_certificate_tool.sql
│   ├── 0014_admin_portal.sql
│   ├── 0015_fix_certificates_table.sql
│   ├── 0016_participation_certificates_webinars.sql
│   ├── 0017_webinars_only.sql
│   └── ... (other migrations)
├── bulk-students.csv            # CSV with 19 student names
├── bulk-generate-fix.sh         # Bulk generation script
├── ecosystem.config.cjs         # PM2 configuration
├── wrangler.jsonc              # Cloudflare configuration
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md

Documentation:
├── CERTIFICATE_GENERATION_COMPLETE.md
├── ADMIN_PORTAL_QUICKSTART.md
├── A4_LANDSCAPE_COMPLETE.md
├── REAL_SIGNATURE_COMPLETE.md
├── PRODUCTION_COMPLETE.md
├── SESSION_FIX.md
└── ... (other docs)
```

---

## 🚀 API Endpoints

### Public Endpoints:

#### View Certificate:
```
GET /api/certificates/:id/view
```
Returns: HTML certificate page with download button

#### Verify Certificate:
```
GET /api/certificates/verify/:code
```
Returns: JSON with certificate validity and details

#### Verification Page:
```
GET /verify/:code
```
Returns: User-friendly HTML verification page

### Admin Endpoints (Requires Authentication):

#### Login:
```
POST /api/admin/login
Body: { "username": "admin", "password": "admin123" }
Returns: { "success": true, "session_token": "...", "admin": {...} }
```

#### Generate Single Certificate:
```
POST /api/admin/certificates/generate
Headers: { "Authorization": "Bearer {session_token}" }
Body: {
  "student_name": "John Doe",
  "student_email": "john@example.com",
  "course_name": "IOT Robotics Program",
  "certificate_type": "participation",
  "completion_date": "2025-12-28"
}
Returns: { "success": true, "certificate_id": 27, "certificate_code": "..." }
```

#### Bulk Generate from CSV:
```
POST /api/admin/certificates/bulk-csv
Headers: { "Authorization": "Bearer {session_token}" }
Body: {
  "students": ["Name1", "Name2", ...],
  "course_name": "IOT Robotics Program",
  "certificate_type": "participation",
  "completion_date": "2025-12-28"
}
Returns: { "success": true, "generated": 19, "certificates": [...] }
```

#### List All Certificates:
```
GET /api/admin/certificates/list
Headers: { "Authorization": "Bearer {session_token}" }
Returns: { "success": true, "certificates": [...] }
```

---

## 📝 Admin Portal Features

### Dashboard Tabs:

#### 1. Generate New (Tab 1):
- Single certificate generation
- Student name search (live search)
- Course selection dropdown (8 courses)
- Certificate type: Completion / Participation
- Completion date picker
- Grade/score input (optional)
- Notes textarea (optional)
- Preview & Generate buttons

#### 2. Manage Certificates (Tab 2):
- List all generated certificates
- View certificate details
- Copy verification links
- Revoke certificates (change status)
- Search/filter functionality

#### 3. Bulk Generate (Tab 3):
- CSV file upload (drag & drop)
- CSV preview before generation
- Bulk generation progress bar
- Download CSV template
- Batch certificate creation

#### 4. Verify (Tab 4):
- Certificate code verification
- Real-time validation
- Display certificate details
- Check if certificate is valid/revoked

---

## 📋 All 19 Generated Certificates

| # | Student Name | Certificate ID | Certificate Code | View URL | Verify URL |
|---|--------------|----------------|------------------|----------|------------|
| 1 | Bhavesh Gudlani | 8 | PB-IOT-2025-NN4PC8MJSZ34EQ | [View](https://passionbots-lms.pages.dev/api/certificates/8/view) | [Verify](https://passionbots-lms.pages.dev/verify/PB-IOT-2025-NN4PC8MJSZ34EQ) |
| 2 | Abhishek Singh | 9 | PB-IOT-2025-7RILMVMJSZ34G0 | [View](https://passionbots-lms.pages.dev/api/certificates/9/view) | [Verify](https://passionbots-lms.pages.dev/verify/PB-IOT-2025-7RILMVMJSZ34G0) |
| 3 | Rahul Kumar | 10 | PB-IOT-2025-7F79JRMJSZ34HD | [View](https://passionbots-lms.pages.dev/api/certificates/10/view) | [Verify](https://passionbots-lms.pages.dev/verify/PB-IOT-2025-7F79JRMJSZ34HD) |
| 4 | Priya Sharma | 11 | PB-IOT-2025-QB2EP6MJSZ34II | [View](https://passionbots-lms.pages.dev/api/certificates/11/view) | [Verify](https://passionbots-lms.pages.dev/verify/PB-IOT-2025-QB2EP6MJSZ34II) |
| 5 | Amit Patel | 12 | PB-IOT-2025-3TZCEPMJSZ34KF | [View](https://passionbots-lms.pages.dev/api/certificates/12/view) | [Verify](https://passionbots-lms.pages.dev/verify/PB-IOT-2025-3TZCEPMJSZ34KF) |
| 6 | Neha Gupta | 13 | PB-IOT-2025-Q7407AMJSZ34LD | [View](https://passionbots-lms.pages.dev/api/certificates/13/view) | [Verify](https://passionbots-lms.pages.dev/verify/PB-IOT-2025-Q7407AMJSZ34LD) |
| 7 | Arjun Reddy | 14 | PB-IOT-2025-IHHMKXMJSZ34MO | [View](https://passionbots-lms.pages.dev/api/certificates/14/view) | [Verify](https://passionbots-lms.pages.dev/verify/PB-IOT-2025-IHHMKXMJSZ34MO) |
| 8 | Sneha Iyer | 15 | PB-IOT-2025-Y69VVZMJSZ34NW | [View](https://passionbots-lms.pages.dev/api/certificates/15/view) | [Verify](https://passionbots-lms.pages.dev/verify/PB-IOT-2025-Y69VVZMJSZ34NW) |
| 9 | Vikram Singh | 16 | PB-IOT-2025-SD4CYZMJSZ34OY | [View](https://passionbots-lms.pages.dev/api/certificates/16/view) | [Verify](https://passionbots-lms.pages.dev/verify/PB-IOT-2025-SD4CYZMJSZ34OY) |
| 10 | Ananya Das | 17 | PB-IOT-2025-EYX4CNMJSZ34Q2 | [View](https://passionbots-lms.pages.dev/api/certificates/17/view) | [Verify](https://passionbots-lms.pages.dev/verify/PB-IOT-2025-EYX4CNMJSZ34Q2) |
| 11 | Rohan Mehta | 18 | PB-IOT-2025-HH91O5MJSZ34R9 | [View](https://passionbots-lms.pages.dev/api/certificates/18/view) | [Verify](https://passionbots-lms.pages.dev/verify/PB-IOT-2025-HH91O5MJSZ34R9) |
| 12 | Pooja Verma | 19 | PB-IOT-2025-I5MV5NMJSZ34SI | [View](https://passionbots-lms.pages.dev/api/certificates/19/view) | [Verify](https://passionbots-lms.pages.dev/verify/PB-IOT-2025-I5MV5NMJSZ34SI) |
| 13 | Karthik Krishnan | 20 | PB-IOT-2025-02R1FAMJSZ34TV | [View](https://passionbots-lms.pages.dev/api/certificates/20/view) | [Verify](https://passionbots-lms.pages.dev/verify/PB-IOT-2025-02R1FAMJSZ34TV) |
| 14 | Divya Nair | 21 | PB-IOT-2025-EK31HKMJSZ34V4 | [View](https://passionbots-lms.pages.dev/api/certificates/21/view) | [Verify](https://passionbots-lms.pages.dev/verify/PB-IOT-2025-EK31HKMJSZ34V4) |
| 15 | Sanjay Rao | 22 | PB-IOT-2025-UAR1O2MJSZ34WN | [View](https://passionbots-lms.pages.dev/api/certificates/22/view) | [Verify](https://passionbots-lms.pages.dev/verify/PB-IOT-2025-UAR1O2MJSZ34WN) |
| 16 | Meera Joshi | 23 | PB-IOT-2025-FD1D6XMJSZ34XU | [View](https://passionbots-lms.pages.dev/api/certificates/23/view) | [Verify](https://passionbots-lms.pages.dev/verify/PB-IOT-2025-FD1D6XMJSZ34XU) |
| 17 | Aditya Kapoor | 24 | PB-IOT-2025-ED4RRPMJSZ34Z3 | [View](https://passionbots-lms.pages.dev/api/certificates/24/view) | [Verify](https://passionbots-lms.pages.dev/verify/PB-IOT-2025-ED4RRPMJSZ34Z3) |
| 18 | Ritu Malhotra | 25 | PB-IOT-2025-0G82R5MJSZ350D | [View](https://passionbots-lms.pages.dev/api/certificates/25/view) | [Verify](https://passionbots-lms.pages.dev/verify/PB-IOT-2025-0G82R5MJSZ350D) |
| 19 | Suresh Bhat | 26 | PB-IOT-2025-U4CX09MJSZ351I | [View](https://passionbots-lms.pages.dev/api/certificates/26/view) | [Verify](https://passionbots-lms.pages.dev/verify/PB-IOT-2025-U4CX09MJSZ351I) |

---

## 🔧 Troubleshooting

### Issue: "Invalid or expired session"
**Solution**:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Use incognito mode
3. Use latest deployment: https://5620dba0.passionbots-lms.pages.dev/admin
4. Or clear localStorage: `localStorage.clear()` in console

### Issue: Signature not showing
**Solution**: 
- Signature is at `/static/signature-real.png`
- Verify file exists in deployment
- Check browser console for 404 errors

### Issue: PDF download not working
**Solution**:
- Ensure html2canvas and jsPDF are loaded
- Check browser console for errors
- Try different browser (Chrome recommended)

---

## 🚀 Deployment Guide

### Local Development:
```bash
cd /home/user/webapp
npm run build
pm2 start ecosystem.config.cjs
curl http://localhost:3000
```

### Deploy to Cloudflare Pages:
```bash
cd /home/user/webapp
npm run build
npx wrangler pages deploy dist --project-name passionbots-lms
```

### Database Migrations:
```bash
# Local
npx wrangler d1 migrations apply passionbots-lms-production --local

# Production
npx wrangler d1 migrations apply passionbots-lms-production --remote
```

---

## 📚 Key Files Reference

### Main Application:
- `src/index.tsx` - Backend routes, certificate generation, admin API
- `public/static/app-admin-certificates.js` - Admin portal frontend (47KB)
- `public/static/signature-real.png` - Real handwritten signature (6.3KB)

### Configuration:
- `wrangler.jsonc` - Cloudflare Workers config
- `package.json` - Dependencies and scripts
- `vite.config.ts` - Build configuration
- `ecosystem.config.cjs` - PM2 process manager config

### Database:
- `migrations/*.sql` - All database migrations
- D1 Database: `passionbots-lms-production`

---

## 📊 Statistics

- **Total Certificates**: 26 (IDs 1-26)
- **Active Certificates**: 19 (bulk generated)
- **Certificate Size**: A4 Landscape (297×210mm)
- **Signature**: White, 120×50px
- **Database**: Cloudflare D1 (SQLite)
- **Code Size**: ~129KB (compressed)
- **GitHub Commits**: 100+

---

## 🎯 Next Steps for Future Development

1. **Email Integration**: Send certificate PDFs via email
2. **Bulk Email**: Send certificates to all students
3. **QR Codes**: Add working QR codes to certificates
4. **Student Portal**: Allow students to download their own certificates
5. **Analytics**: Track certificate views and downloads
6. **Custom Templates**: Multiple certificate designs
7. **Multi-language**: Support for multiple languages
8. **API Keys**: Generate API keys for external integrations

---

## 📞 Support & Contact

- **GitHub**: https://github.com/rahulgupta37079-oss/lms
- **Admin Portal**: https://passionbots-lms.pages.dev/admin
- **Login**: admin / admin123

---

## ✅ Feature Checklist

- [x] A4 Landscape format (297×210mm)
- [x] Real handwritten signature (white, enhanced)
- [x] Direct PDF download (no print dialog)
- [x] 19 certificates generated
- [x] Admin portal (login, generate, manage, bulk, verify)
- [x] Verification system (working links)
- [x] Database storage (Cloudflare D1)
- [x] Responsive design
- [x] Print-ready output
- [x] Professional appearance
- [x] GitHub integration
- [x] Production deployment
- [x] Documentation complete

---

**Last Updated**: January 2, 2026  
**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**GitHub Commit**: 7df4bb9
