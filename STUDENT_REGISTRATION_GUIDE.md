# 📝 Student Registration Guide - IoT & Robotics Course

## 🎓 How to Register as a Student

### **Method 1: Web Browser Registration** (Recommended)

#### **Step 1: Visit Registration Page**
Open your web browser and go to:
```
https://passionbots-lms.pages.dev/register
```

#### **Step 2: Fill in the Registration Form**

The form has the following fields (all required):

1. **Full Name**
   - Example: `Rahul Kumar`
   - Enter your complete name as it should appear on certificate

2. **Email Address**
   - Example: `rahul.kumar@gmail.com`
   - This will be your login ID
   - Must be unique (no duplicate emails allowed)

3. **Mobile Number**
   - Example: `+91 9876543210`
   - Include country code
   - Format: +91 followed by 10 digits

4. **College/University Name**
   - Example: `MIT College of Engineering`
   - Enter your institution name

5. **Year of Study**
   - Select from dropdown:
     - 1st Year
     - 2nd Year
     - 3rd Year
     - 4th Year
     - Graduate
     - Working Professional

#### **Step 3: Submit Registration**
- Click the yellow **"Register Now"** button
- Wait for confirmation message

#### **Step 4: Success!**
You'll see a success message with:
- ✅ Registration confirmation
- 📧 Your registration ID
- 🔑 Instructions to login

#### **Step 5: Login to Dashboard**
After registration:
1. Go to: https://passionbots-lms.pages.dev/student-portal
2. Enter your registered email
3. Click "Login to Dashboard"
4. Access your personal dashboard!

---

### **Method 2: API Registration** (For Bulk Registration)

If you need to register multiple students programmatically:

#### **API Endpoint:**
```
POST https://passionbots-lms.pages.dev/api/register
Content-Type: application/json
```

#### **Request Body:**
```json
{
  "full_name": "Rahul Kumar",
  "email": "rahul.kumar@gmail.com",
  "mobile": "+91 9876543210",
  "college_name": "MIT College of Engineering",
  "year_of_study": "2nd Year"
}
```

#### **Example using cURL:**
```bash
curl -X POST https://passionbots-lms.pages.dev/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Rahul Kumar",
    "email": "rahul.kumar@gmail.com",
    "mobile": "+91 9876543210",
    "college_name": "MIT College of Engineering",
    "year_of_study": "2nd Year"
  }'
```

#### **Success Response:**
```json
{
  "success": true,
  "message": "Registration successful! Welcome to PassionBots IoT & Robotics Course.",
  "registration_id": 1
}
```

#### **Error Response (Duplicate Email):**
```json
{
  "error": "Email already registered. Please use a different email or login."
}
```

---

### **Method 3: Bulk Registration via Script**

If you have a list of students to register:

#### **Step 1: Create Student List CSV**
Create a file `students.csv`:
```csv
fullName,email,mobile,collegeName,yearOfStudy
Rahul Kumar,rahul.kumar@gmail.com,+91 9876543210,MIT College,2nd Year
Priya Sharma,priya.sharma@gmail.com,+91 9876543211,ABC University,3rd Year
Amit Patel,amit.patel@gmail.com,+91 9876543212,XYZ Institute,1st Year
```

#### **Step 2: Run Bulk Registration Script**

I'll create a Python script for you:

```python
#!/usr/bin/env python3
"""
Bulk Student Registration Script
"""
import csv
import requests
import time

API_URL = "https://passionbots-lms.pages.dev/api/register"

def register_student(student):
    """Register a single student"""
    try:
        response = requests.post(API_URL, json=student, timeout=10)
        return response.json()
    except Exception as e:
        return {"error": str(e)}

def bulk_register(csv_file):
    """Register students from CSV file"""
    results = {
        "success": 0,
        "failed": 0,
        "details": []
    }
    
    with open(csv_file, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            print(f"Registering: {row['fullName']}...")
            result = register_student(row)
            
            if result.get('success'):
                results["success"] += 1
                print(f"  ✅ Success! Registration ID: {result.get('registration_id')}")
            else:
                results["failed"] += 1
                print(f"  ❌ Failed: {result.get('error', 'Unknown error')}")
            
            results["details"].append({
                "name": row['fullName'],
                "email": row['email'],
                "result": result
            })
            
            # Rate limiting - wait 0.5 seconds between requests
            time.sleep(0.5)
    
    return results

if __name__ == "__main__":
    print("🎓 PassionBots - Bulk Student Registration")
    print("=" * 50)
    
    results = bulk_register("students.csv")
    
    print("\n" + "=" * 50)
    print(f"✅ Successful: {results['success']}")
    print(f"❌ Failed: {results['failed']}")
    print(f"📊 Total: {results['success'] + results['failed']}")
    print("=" * 50)
```

**Save as:** `bulk-register-students.py`

**Run:**
```bash
python3 bulk-register-students.py
```

---

## 🔍 Verify Registration

### **Check if Student is Registered:**

#### **Method 1: Try Login**
1. Go to: https://passionbots-lms.pages.dev/student-portal
2. Enter student email
3. If email exists, login succeeds

#### **Method 2: Admin Portal**
1. Login as admin: https://passionbots-lms.pages.dev/admin-portal
   - Username: `admin`
   - Password: `admin123`
2. Go to "Students" tab
3. Search for student by name or email

#### **Method 3: Database Query**
```bash
npx wrangler d1 execute passionbots-lms-production --remote \
  --command="SELECT * FROM course_registrations WHERE email='student@example.com'"
```

---

## ⚠️ Common Issues & Solutions

### **Issue 1: "Email already registered"**
**Cause:** Email is already in the system  
**Solution:** 
- Use a different email address
- OR login with existing email
- OR contact admin to update/delete old registration

### **Issue 2: Form validation errors**
**Cause:** Missing or invalid fields  
**Solution:** 
- Ensure all fields are filled
- Check mobile number format (+91 followed by 10 digits)
- Verify email format is valid

### **Issue 3: Registration button not responding**
**Cause:** JavaScript issue or network problem  
**Solution:** 
- Check internet connection
- Try refreshing the page
- Clear browser cache
- Try different browser

### **Issue 4: Can't login after registration**
**Cause:** Email mismatch or database delay  
**Solution:** 
- Verify you're using the exact email from registration
- Wait 1-2 minutes and try again
- Contact admin if issue persists

---

## 📊 Admin: View All Registrations

### **Via Admin Dashboard:**
1. Login: https://passionbots-lms.pages.dev/admin-portal
2. Go to "Students" tab
3. See all registered students

### **Via Database:**
```bash
# View all registrations
npx wrangler d1 execute passionbots-lms-production --remote \
  --command="SELECT registration_id, full_name, email, college_name, 
             year_of_study, registration_date, status 
             FROM course_registrations ORDER BY registration_date DESC"

# Count total students
npx wrangler d1 execute passionbots-lms-production --remote \
  --command="SELECT COUNT(*) as total_students FROM course_registrations"

# View recent registrations (last 10)
npx wrangler d1 execute passionbots-lms-production --remote \
  --command="SELECT * FROM course_registrations 
             ORDER BY registration_date DESC LIMIT 10"
```

---

## 📧 After Registration

### **What Students Get:**
1. ✅ Unique Registration ID
2. ✅ Access to Student Dashboard
3. ✅ View Live Class Schedule
4. ✅ One-click Zoom Join
5. ✅ Access to 8 Course Modules
6. ✅ Progress Tracking

### **Next Steps for Students:**
1. Login to dashboard: https://passionbots-lms.pages.dev/student-portal
2. View upcoming classes
3. Note class dates and times
4. Join Zoom meetings when classes start
5. Track your progress

---

## 🎯 Registration Fields Explained

| Field | Required | Format | Example |
|-------|----------|--------|---------|
| **Full Name** | ✅ Yes | Text | Rahul Kumar |
| **Email** | ✅ Yes | email@domain.com | rahul.kumar@gmail.com |
| **Mobile** | ✅ Yes | +91 XXXXXXXXXX | +91 9876543210 |
| **College** | ✅ Yes | Text | MIT College of Engineering |
| **Year** | ✅ Yes | Dropdown | 2nd Year |

### **Valid Year of Study Options:**
- 1st Year
- 2nd Year
- 3rd Year
- 4th Year
- Graduate
- Working Professional

---

## 🔐 Data Privacy & Security

### **What we store:**
- Full name
- Email address
- Mobile number
- College/University name
- Year of study
- Registration date & time
- Course type (iot_robotics)

### **What we DON'T store:**
- Passwords (email-based login, no password needed)
- Financial information
- Personal documents

### **Security Measures:**
- ✅ SQL injection prevention
- ✅ Input validation
- ✅ XSS protection
- ✅ Secure HTTPS connection
- ✅ Cloudflare security

---

## 📞 Support

### **For Students:**
- **Can't register?** Check email isn't already used
- **Can't login?** Verify email matches registration
- **Technical issues?** Clear browser cache and retry

### **For Admins:**
- **Admin Portal:** https://passionbots-lms.pages.dev/admin-portal
- **Username:** admin
- **Password:** admin123

### **Database Access:**
```bash
# Admin can query database
npx wrangler d1 execute passionbots-lms-production --remote \
  --command="YOUR_SQL_QUERY"
```

---

## 📝 Quick Reference

### **Important URLs:**
- **Register:** https://passionbots-lms.pages.dev/register
- **Login:** https://passionbots-lms.pages.dev/student-portal
- **Dashboard:** https://passionbots-lms.pages.dev/dashboard
- **Admin:** https://passionbots-lms.pages.dev/admin-portal

### **API Endpoints:**
- **Register:** POST /api/register
- **Login:** POST /api/student-login
- **Classes:** GET /api/live-classes
- **Modules:** GET /api/course-modules

---

## ✅ Registration Checklist

Before registering students, ensure:

- [ ] Registration page is accessible
- [ ] Database is working (test with one student first)
- [ ] Admin portal is accessible
- [ ] Zoom links are updated with real meeting IDs
- [ ] Email notification system is ready (optional)
- [ ] Certificate system is ready (optional)

After registration:

- [ ] Student can login successfully
- [ ] Dashboard displays correctly
- [ ] Live classes are visible
- [ ] Zoom join buttons work
- [ ] Course modules are accessible

---

**🎓 Ready to register students!**

**Start here:** https://passionbots-lms.pages.dev/register

**Questions?** Check TESTING_GUIDE.md or COMPLETE_SYSTEM_SUMMARY.md

**Last Updated:** January 11, 2026
