# 🧪 IoT & Robotics Portal - Testing Guide

## Quick Testing Checklist

### **1. Student Registration Flow** ✅

**Test Case 1: New Student Registration**

1. Visit: https://passionbots-lms.pages.dev/register
2. Fill in the form:
   - Full Name: `Your Name`
   - Email: `your.email@example.com`
   - Mobile: `+91 9876543210`
   - College: `Your College`
   - Year: Select any
3. Click "Register Now"
4. Expected: Success message + Registration ID

**Test Case 2: Duplicate Email Prevention**
1. Try registering with same email again
2. Expected: Error message about duplicate email

---

### **2. Student Login & Dashboard** ✅

**Test Case 3: Student Login**

1. Visit: https://passionbots-lms.pages.dev/student-portal
2. Enter your registered email
3. Click "Login to Dashboard"
4. Expected: Redirect to dashboard

**Test Case 4: Dashboard Features**

1. Visit: https://passionbots-lms.pages.dev/dashboard
2. Check:
   - ✅ Stats cards showing (Total Classes, Attended, Upcoming, Progress)
   - ✅ Live Classes tab showing 3 scheduled classes
   - ✅ Course Modules tab showing 8 modules
   - ✅ Zoom join buttons visible
3. Click on "Join Zoom Meeting" for any class
4. Expected: Opens Zoom meeting link

---

### **3. Admin Login & Dashboard** ✅

**Test Case 5: Admin Login**

1. Visit: https://passionbots-lms.pages.dev/admin-portal
2. Login:
   - Username: `admin`
   - Password: `admin123`
3. Click "Sign In"
4. Expected: Redirect to admin dashboard

**Test Case 6: Admin Dashboard Features**

1. Visit: https://passionbots-lms.pages.dev/admin-dashboard-iot
2. Check tabs:
   - ✅ **Overview Tab:** Stats cards visible
   - ✅ **Students Tab:** Student list showing
   - ✅ **Classes Tab:** Class management interface
   - ✅ **Modules Tab:** 8 modules displayed

**Test Case 7: Student Management**
1. Go to "Students" tab
2. Check:
   - ✅ Student list displays correctly
   - ✅ Search functionality works
   - ✅ View/Edit/Delete buttons visible
3. Try searching for a student
4. Expected: Filtered results

**Test Case 8: Class Management**
1. Go to "Classes" tab
2. Check:
   - ✅ 3 classes listed
   - ✅ Schedule form visible
   - ✅ Edit/Delete buttons available
3. Click "Add New Class"
4. Fill in class details:
   - Title: `Test Class`
   - Date: Future date
   - Time: Any time
   - Instructor: `Test Instructor`
   - Zoom ID: `123456789`
5. Click "Schedule Class"
6. Expected: New class added to list

---

### **4. API Testing** ✅

**Test Case 9: Live Classes API**
```bash
curl https://passionbots-lms.pages.dev/api/live-classes
```
Expected: JSON with 3 classes

**Test Case 10: Course Modules API**
```bash
curl https://passionbots-lms.pages.dev/api/course-modules
```
Expected: JSON with 8 modules

**Test Case 11: Admin Login API**
```bash
curl -X POST https://passionbots-lms.pages.dev/api/admin-login-iot \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```
Expected: JSON with token and admin details

**Test Case 12: Student Registration API**
```bash
curl -X POST https://passionbots-lms.pages.dev/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "API Test User",
    "email": "apitest@example.com",
    "mobile": "+91 9876543210",
    "collegeName": "Test College",
    "yearOfStudy": "2nd Year"
  }'
```
Expected: JSON with success message and registration_id

---

### **5. Mobile Responsiveness** 📱

**Test Case 13: Mobile View**
1. Open on mobile or use browser dev tools
2. Check pages:
   - ✅ Registration form adjusts to mobile
   - ✅ Dashboard cards stack vertically
   - ✅ Navigation menu collapses
   - ✅ Buttons are touch-friendly
3. Test all interactions
4. Expected: Smooth mobile experience

---

### **6. Theme & Design** 🎨

**Test Case 14: Visual Consistency**
1. Check all pages for:
   - ✅ Yellow (#FFD700) accent color
   - ✅ Black (#000000) background
   - ✅ White (#FFFFFF) text
   - ✅ Glassmorphism card effects
   - ✅ Gradient text on headings
   - ✅ Smooth hover animations
2. Expected: Consistent theme across all pages

---

## 🚨 Known Issues & Limitations

### **Current Limitations:**
1. **Zoom Links:** Sample links - need to be updated with real meeting IDs
2. **Email Notifications:** Not yet implemented
3. **Attendance Tracking:** Not yet implemented
4. **Certificate Integration:** Not yet connected to registration

### **To Be Implemented:**
- [ ] Email notifications for new registrations
- [ ] Class reminder emails (24 hours before)
- [ ] Attendance marking system
- [ ] Certificate generation on course completion
- [ ] Student progress tracking
- [ ] Assignment submission system

---

## 📊 Test Results Summary

### **Test Status (Current)**

| Feature | Status | Notes |
|---------|--------|-------|
| Student Registration | ✅ Working | Form validation functional |
| Student Login | ✅ Working | Session management active |
| Student Dashboard | ✅ Working | All tabs functional |
| Admin Login | ✅ Working | Authentication secure |
| Admin Dashboard | ✅ Working | Full CRUD operations |
| Live Classes API | ✅ Working | 3 classes loaded |
| Course Modules API | ✅ Working | 8 modules loaded |
| Zoom Integration | ⚠️ Partial | Links work, need real IDs |
| Email System | ⏳ Pending | To be implemented |
| Certificates | ⏳ Pending | Integration needed |

---

## 🔧 Troubleshooting

### **Issue: Page not loading**
- **Solution:** Clear browser cache and reload
- **Check:** Ensure internet connection is stable

### **Issue: Login fails**
- **Solution:** Check credentials (admin/admin123)
- **Check:** Verify database connection

### **Issue: API returns error**
- **Solution:** Check request format (JSON)
- **Check:** Verify authentication token

### **Issue: Zoom link doesn't work**
- **Solution:** Update with real Zoom meeting IDs
- **Check:** Ensure Zoom credentials are correct

---

## 📞 Support

For issues or questions:
- **Admin Portal:** https://passionbots-lms.pages.dev/admin-portal
- **Documentation:** See PRODUCTION_DEPLOYMENT_SUCCESS.md
- **GitHub:** https://github.com/rahulgupta37079-oss/lms

---

**Last Updated:** January 11, 2026  
**Status:** ✅ All Core Features Operational
