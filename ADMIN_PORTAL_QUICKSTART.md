# 🎓 Admin Certificate Portal - Quick Start Guide

## ✅ ISSUE FIXED: Session Token Mismatch

**Problem**: "Invalid or expired session" error when trying to login to admin portal

**Root Cause**: JavaScript code was looking for `data.sessionToken` but API returns `data.session_token`

**Solution**: Fixed line 580 in `app-admin-certificates.js` to use correct property name

**Status**: ✅ DEPLOYED & WORKING

---

## 🚀 How to Access & Test

### Step 1: Open Admin Portal

**Latest Deploy URL**: 
```
https://77267022.passionbots-lms.pages.dev/admin
```

**Production URL**:
```
https://passionbots-lms.pages.dev/admin
```

### Step 2: Login

**Credentials**:
- **Username**: `admin`
- **Password**: `admin123`

**What happens after login**:
1. Session token is saved to localStorage
2. Dashboard loads with 4 stat cards
3. You'll see tabs: Generate | Manage | Bulk | Verify

### Step 3: Generate a Certificate

**From the Dashboard**:

1. Click **"Generate New"** tab (should be active by default)

2. **Enter Student Name**:
   - Type: `Bhavesh Gudlani`
   - Or: `Test Student`
   - Or any name you want

3. **Enter Email** (optional):
   - Type: `bhavesh@example.com`

4. **Select Course** from dropdown:
   - IOT Robotics Program
   - AI & Machine Learning
   - Web Development
   - Game Development
   - Robotics Engineering
   - Python Programming
   - Arduino Basics
   - Advanced IoT

5. **Set Completion Date**:
   - Use date picker
   - Or type: `2025-12-30`

6. **Optional Fields**:
   - Grade: A+, A, B+, B, C (optional)
   - Notes: Any additional information (optional)

7. Click **"Generate Certificate"** button

### Step 4: View Certificate

After generation, you'll see:
- ✅ Success message
- Certificate ID (e.g., 4)
- Certificate Code (e.g., PB-IOT-2025-XAGWFTMJSW6ZVA)
- Verification URL
- **"View"** and **"Download"** buttons

Click **"View"** to see your certificate with exact 1920×1080 design!

---

## 🧪 Testing Via Command Line

If you want to test the API directly:

### 1. Login to Get Token
```bash
curl -s -X POST https://77267022.passionbots-lms.pages.dev/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | python3 -m json.tool
```

**Expected Response**:
```json
{
    "success": true,
    "admin": {
        "id": 1,
        "username": "admin",
        "email": "admin@passionbots.in",
        "full_name": "System Administrator",
        "role": "super_admin",
        "permissions": ["all"]
    },
    "session_token": "admin_1767117591430_v7xojf80ne",
    "expires_at": "2025-12-31T17:59:51.430Z"
}
```

### 2. Generate Certificate (Replace TOKEN)
```bash
curl -s -X POST https://77267022.passionbots-lms.pages.dev/api/admin/certificates/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "student_name": "Your Name",
    "student_email": "your@email.com",
    "course_name": "IOT Robotics Program",
    "completion_date": "2025-12-30"
  }' | python3 -m json.tool
```

**Expected Response**:
```json
{
    "success": true,
    "certificate": {
        "certificate_id": 4,
        "certificate_code": "PB-IOT-2025-XAGWFTMJSW6ZVA",
        "student_name": "Your Name",
        "student_email": "your@email.com",
        "course_name": "IOT Robotics Program",
        "issue_date": "2025-12-30",
        "verification_url": "https://passionbots-lms.pages.dev/verify/PB-IOT-2025-XAGWFTMJSW6ZVA"
    }
}
```

### 3. View Certificate (Replace ID)
```
https://77267022.passionbots-lms.pages.dev/api/certificates/4/view
```

---

## 📊 Current Database Status

**Certificates Generated**: 4

| ID | Code | Student | Course | Date |
|----|------|---------|--------|------|
| 1 | PB-IOT-2025-EYRFE7MJSW22V9 | Bhavesh Gudlani | IOT Robotics | 2025-12-30 |
| 2 | PB-IOT-2025-QO2SCYMJSW2IYZ | Bhavesh Gudlani | IOT Robotics | 2025-12-30 |
| 3 | PB-IOT-2025-J9JLVKMJSW4ILW | Rahul Gupta | AI & ML | 2025-12-30 |
| 4 | PB-IOT-2025-XAGWFTMJSW6ZVA | Test Student | IOT Robotics | 2025-12-30 |

---

## 🔍 Troubleshooting

### If login doesn't work:

1. **Clear browser cache and localStorage**:
   - Open DevTools (F12)
   - Go to Application tab
   - Clear localStorage
   - Refresh page

2. **Check browser console** (F12):
   - Look for any error messages
   - Check Network tab for failed requests

3. **Verify you're on the correct URL**:
   - Latest: `https://77267022.passionbots-lms.pages.dev/admin`
   - Production: `https://passionbots-lms.pages.dev/admin`

4. **Try different browser**:
   - Chrome/Edge (recommended)
   - Firefox
   - Safari

### If "Invalid session" appears:

1. **Re-login**: Simply logout and login again
2. **Check token in localStorage**:
   - Open DevTools → Application → Local Storage
   - Look for key: `admin_session`
   - Should contain: `admin_TIMESTAMP_RANDOM`

### If certificate doesn't generate:

1. **Check all required fields are filled**:
   - Student Name (required)
   - Course Name (required)
   - Email is optional

2. **Check browser console for errors**

3. **Try API directly** (see command line section above)

---

## 🎨 What You'll See

### Admin Dashboard
- **4 Stat Cards**: Total Certificates, Today's Generated, Active Students, Pending Verifications
- **4 Tabs**: Generate New, Manage Certificates, Bulk Generate, Verify Certificate
- **Black & Yellow Theme**: Professional design matching PassionBots branding

### Certificate Display (1920×1080)
- **Yellow vertical bar** (left): "PASSIONBOTS // FUTURE TECH"
- **Top-right serial box**: PB-IOT-2025-XXXXX
- **Large "CERTIFICATE" title**: Yellow outline text
- **Student name box**: Yellow skewed background
- **3-column footer**: Date | Signature | Verify URL
- **QR code placeholder**: Bottom-right, rotated
- **Diagonal texture shapes**: Background design elements

---

## 📁 Technical Details

### Fixed Files
- `public/static/app-admin-certificates.js` - Line 580: `data.sessionToken` → `data.session_token`

### Database Tables
- `admin_users` - Admin accounts
- `admin_sessions` - Session management (24-hour expiry)
- `certificates` - Certificate records (fixed schema)
- `certificate_generation_logs` - Audit trail

### API Endpoints Working
- ✅ `POST /api/admin/login` - Admin authentication
- ✅ `POST /api/admin/certificates/generate` - Generate certificate
- ✅ `GET /api/certificates/:id/view` - View certificate
- ✅ `GET /api/certificates/verify/:code` - Verify certificate

---

## 🌐 Live URLs

- **Admin Portal (Latest)**: https://77267022.passionbots-lms.pages.dev/admin
- **Admin Portal (Production)**: https://passionbots-lms.pages.dev/admin
- **Main Site**: https://passionbots-lms.pages.dev
- **GitHub**: https://github.com/rahulgupta37079-oss/lms
- **Latest Commit**: 5579003

---

## ✅ Verification Checklist

Before you start, verify these are all true:

- [x] Database schema fixed (migration 0015 applied)
- [x] Session token key fixed (session_token not sessionToken)
- [x] Admin users table exists with default admin
- [x] Certificate template matches exact 1920×1080 design
- [x] API endpoints return success responses
- [x] Latest code deployed to Cloudflare Pages

**Everything is ready! Go ahead and test the admin portal now.** 🚀

---

**Last Updated**: December 30, 2025  
**Deployment**: 77267022.passionbots-lms.pages.dev  
**Status**: ✅ ALL SYSTEMS OPERATIONAL
