# 🔐 Admin Access Control Guide - PassionBots IoT & Robotics

## 🎯 **Overview**

The Admin Access Control system gives you complete control over student access to the IoT & Robotics course. You can activate, deactivate, suspend, edit, and manage all student registrations from one powerful interface.

---

## 🌐 **Access the Admin Control Panel**

### **Login First:**
1. Go to: https://passionbots-lms.pages.dev/admin-portal
2. Login with:
   - **Username:** `admin`
   - **Password:** `admin123`

### **Access Control Panel:**
Once logged in, navigate to:
```
https://passionbots-lms.pages.dev/admin-access-control
```

Or click "Access Control" from the admin dashboard menu.

---

## 📊 **Dashboard Overview**

### **Statistics Cards (Top Row):**

1. **Total Students** - All registered students
2. **Active Access** - Students who can access the course
3. **Inactive** - Students whose access is disabled
4. **Suspended** - Students who are suspended

### **Color Coding:**
- 🟢 **Green (Active)** - Student has full access
- ⚫ **Gray (Inactive)** - Student access disabled temporarily
- 🔴 **Red (Suspended)** - Student account suspended

---

## 🎛️ **Access Control Features**

### **1. Activate Student Access**
**Purpose:** Give students access to the course, dashboard, and live classes.

**How to:**
1. Find the student in the list
2. Look at their "Status" column
3. If status is "Inactive" or "Suspended", click the 🔑 **Toggle Access** button
4. Confirm the action
5. Status changes to **Active** (Green)

**What Students Get:**
- ✅ Can login to dashboard
- ✅ View live classes
- ✅ Join Zoom meetings
- ✅ Access course modules
- ✅ Track progress

---

### **2. Deactivate Student Access**
**Purpose:** Temporarily disable student access without deleting their account.

**How to:**
1. Find the active student
2. Click the 🔑 **Toggle Access** button
3. Confirm the action
4. Status changes to **Inactive** (Gray)

**What Happens:**
- ❌ Student cannot login
- ❌ No access to dashboard
- ❌ Cannot join classes
- ✅ Student data is preserved
- ✅ Can be reactivated anytime

**Use Cases:**
- Payment pending
- Temporary suspension
- Account under review
- Course not yet started

---

### **3. Suspend Student**
**Purpose:** Block access for policy violations or serious issues.

**How to:**
1. Click the ✏️ **Edit** button for the student
2. Change "Access Status" dropdown to "Suspended"
3. Click **Save Changes**
4. Status changes to **Suspended** (Red)

**Difference from Inactive:**
- **Inactive** = Temporary, administrative
- **Suspended** = Serious, requires investigation
- Both prevent login, but suspended has different meaning in records

---

### **4. Edit Student Details**
**Purpose:** Update student information, access status, or payment status.

**How to:**
1. Click the ✏️ **Edit** button for the student
2. Modal opens with editable fields:
   - Full Name
   - Email
   - Mobile
   - College Name
   - Year of Study
   - Access Status
   - Payment Status
3. Make changes
4. Click **Save Changes**

**Editable Fields:**
- **Full Name** - Update student name
- **Email** - Change login email
- **Mobile** - Update contact number
- **College** - Update institution name
- **Year** - Update year of study
- **Access Status** - Active / Inactive / Suspended
- **Payment Status** - Free / Paid / Pending

---

### **5. Delete Student**
**Purpose:** Permanently remove student from the system.

**⚠️ WARNING: This action CANNOT be undone!**

**How to:**
1. Click the 🗑️ **Delete** button (red trash icon)
2. Confirm deletion (double-check!)
3. Student is permanently removed

**What Gets Deleted:**
- ❌ Student account
- ❌ Registration data
- ❌ Access records
- ❌ All associated data

**Use With Caution:**
- For duplicate registrations
- For test accounts
- For spam/fake registrations
- **NOT** for temporary issues (use Inactive instead)

---

### **6. Bulk Actions**
**Purpose:** Update multiple students at once.

**How to:**
1. **Select Students:**
   - Check the checkboxes next to student names
   - OR click the checkbox in the table header to select all

2. **Click "Bulk Action" button**

3. **Choose Action:**
   - Option 1: Activate all selected
   - Option 2: Deactivate all selected
   - Option 3: Suspend all selected

4. **Confirm** - Changes apply to all selected students

**Use Cases:**
- Enable access for entire batch
- Disable access when course ends
- Suspend multiple students at once

---

### **7. Search & Filter**

#### **Search Bar:**
- Type student name, email, or college
- Results filter instantly
- Search is case-insensitive

#### **Status Filter:**
- **All Status** - Show everyone
- **Active** - Only active students
- **Inactive** - Only inactive students
- **Suspended** - Only suspended students

**Tip:** Combine search and filter for precise results

---

## 🔄 **Common Workflows**

### **Workflow 1: Give Access to New Student**
```
1. Student registers via form
2. Admin receives notification (email in future)
3. Admin goes to Access Control
4. Student appears with "Active" status by default
5. ✅ Student can login immediately
```

### **Workflow 2: Temporarily Remove Access**
```
1. Student payment pending
2. Admin searches for student
3. Click Toggle Access (🔑)
4. Status changes to Inactive
5. Student cannot login
6. After payment confirmed:
   - Click Toggle Access again
   - Status changes back to Active
   - Student can login
```

### **Workflow 3: Handle Problem Student**
```
1. Student violates policy
2. Admin opens Edit modal
3. Change status to "Suspended"
4. Save changes
5. Student access immediately blocked
6. After investigation:
   - If resolved: Change to Active
   - If unresolved: Delete account
```

### **Workflow 4: Update Student Information**
```
1. Student requests email change
2. Admin searches for student
3. Click Edit (✏️)
4. Update email address
5. Save changes
6. Student can login with new email
```

### **Workflow 5: Bulk Enable for New Batch**
```
1. 50 students register
2. Admin verifies payments
3. Select all students (checkbox header)
4. Click "Bulk Action"
5. Choose "Activate"
6. All 50 students get access
```

---

## 📋 **Access Status Definitions**

| Status | Meaning | Student Can | Use When |
|--------|---------|-------------|----------|
| **Active** | Full access granted | Login, view classes, join Zoom | Normal state for enrolled students |
| **Inactive** | Temporarily disabled | Nothing - cannot login | Payment pending, course not started |
| **Suspended** | Account under review | Nothing - cannot login | Policy violation, investigation |

---

## 💳 **Payment Status**

| Status | Meaning | Use When |
|--------|---------|----------|
| **Free** | Course is free for this student | Free course or scholarship |
| **Paid** | Payment received | Student has paid course fee |
| **Pending** | Payment not yet confirmed | Waiting for payment verification |

**Note:** Payment status is for record-keeping. Access is controlled by Access Status.

---

## 🛡️ **Best Practices**

### **DO:**
✅ Use **Inactive** for temporary issues  
✅ Use **Suspended** for serious violations  
✅ Use **Search** to find students quickly  
✅ Use **Bulk Actions** for efficiency  
✅ Edit details when students request changes  
✅ Check access stats regularly  

### **DON'T:**
❌ Delete students unless absolutely necessary  
❌ Suspend without reason (use Inactive)  
❌ Give access to unverified students  
❌ Change email without student confirmation  
❌ Use Bulk Actions without double-checking  

---

## 🔐 **Security Features**

### **Authentication Required:**
- Must be logged in as admin
- Session token verification
- Automatic logout if token expires

### **Action Confirmations:**
- Toggle access: Confirm before changing
- Delete student: Double confirmation
- Bulk actions: Prompt before applying

### **Audit Trail:**
- All changes timestamped
- `updated_at` field tracks modifications
- Can query database for history

---

## 📊 **API Endpoints (For Developers)**

### **Get Access Statistics:**
```bash
GET /api/admin/access-stats

Response:
{
  "success": true,
  "stats": {
    "total_students": 16,
    "active_students": 14,
    "inactive_students": 1,
    "suspended_students": 1,
    "paid_students": 3,
    "free_students": 13
  }
}
```

### **Toggle Student Access:**
```bash
POST /api/admin/toggle-student-access
Content-Type: application/json

{
  "registration_id": 1,
  "status": "active"  // or "inactive" or "suspended"
}
```

### **Update Student Details:**
```bash
POST /api/admin/update-student
Content-Type: application/json

{
  "registration_id": 1,
  "full_name": "Updated Name",
  "email": "new@email.com",
  "mobile": "+91 9876543210",
  "college_name": "New College",
  "year_of_study": "3rd Year"
}
```

### **Update Payment Status:**
```bash
POST /api/admin/update-payment-status
Content-Type: application/json

{
  "registration_id": 1,
  "payment_status": "paid",
  "payment_amount": 5000
}
```

### **Get Student Details:**
```bash
GET /api/admin/student/1

Response:
{
  "success": true,
  "student": { ... }
}
```

### **Delete Student:**
```bash
DELETE /api/admin/delete-student/1

Response:
{
  "success": true,
  "message": "Student deleted successfully"
}
```

### **Bulk Update Status:**
```bash
POST /api/admin/bulk-update-status
Content-Type: application/json

{
  "registration_ids": [1, 2, 3, 4, 5],
  "status": "active"
}
```

---

## 🎯 **Quick Reference**

### **Access Control URL:**
```
https://passionbots-lms.pages.dev/admin-access-control
```

### **Admin Login:**
```
URL: https://passionbots-lms.pages.dev/admin-portal
Username: admin
Password: admin123
```

### **Button Icons:**
- ✏️ **Edit** - Update student details
- 🔑 **Toggle Access** - Activate/Deactivate
- 🗑️ **Delete** - Remove student permanently

### **Keyboard Shortcuts:**
- Search bar - Just start typing
- Filter - Click dropdown
- Select all - Checkbox in header

---

## ❓ **FAQ**

### **Q: Can a student login if status is Inactive?**
**A:** No. Only "Active" students can login.

### **Q: What's the difference between Inactive and Suspended?**
**A:** Both block access, but Suspended indicates a serious issue. Inactive is for temporary/administrative reasons.

### **Q: Can I recover a deleted student?**
**A:** No. Deletion is permanent. Use Inactive instead for temporary blocking.

### **Q: How do I give access to all students at once?**
**A:** Select all (checkbox in header), click Bulk Action, choose "Activate".

### **Q: Can students see their access status?**
**A:** No. They only see "Login Failed" if access is blocked.

### **Q: Does payment status affect login?**
**A:** No. Only Access Status affects login. Payment Status is for admin records.

---

## 📞 **Support**

### **For Admins:**
- Access Control: https://passionbots-lms.pages.dev/admin-access-control
- Main Dashboard: https://passionbots-lms.pages.dev/admin-dashboard-iot
- Documentation: This guide

### **Database Queries:**
```bash
# View all students with access status
npx wrangler d1 execute passionbots-lms-production --remote \
  --command="SELECT registration_id, full_name, email, status FROM course_registrations"

# Count by status
npx wrangler d1 execute passionbots-lms-production --remote \
  --command="SELECT status, COUNT(*) as count FROM course_registrations GROUP BY status"
```

---

## ✅ **Summary**

The Admin Access Control system provides:

✅ **Full control** over student access  
✅ **Easy interface** for managing 100s of students  
✅ **Bulk actions** for efficiency  
✅ **Search & filter** for quick access  
✅ **Edit capabilities** for all student data  
✅ **Real-time statistics** for monitoring  
✅ **Secure** with authentication and confirmations  

**Use it to:**
- Grant access to enrolled students
- Block access for non-paying students
- Suspend problematic accounts
- Update student information
- Manage large batches efficiently

---

**🎓 You're now ready to manage student access like a pro!**

**Access Control Panel:** https://passionbots-lms.pages.dev/admin-access-control

**Last Updated:** January 11, 2026
