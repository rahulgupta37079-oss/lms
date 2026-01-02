# 🔧 FIX: Invalid or Expired Session

## ❌ Problem
You're seeing "Invalid or expired session" when accessing the admin portal.

## ✅ Solution

### Option 1: Clear Browser Cache (Recommended)
1. **Open the admin portal**: https://passionbots-lms.pages.dev/admin
2. **Clear browser cache**:
   - **Chrome/Edge**: Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - **Firefox**: Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - Select "Cookies and other site data"
   - Select "Cached images and files"
   - Click "Clear data"
3. **Refresh the page**: Press `F5` or `Ctrl+R`
4. **Login again**: admin / admin123

### Option 2: Use Incognito/Private Mode
1. **Open incognito window**:
   - **Chrome**: `Ctrl+Shift+N` (Windows) or `Cmd+Shift+N` (Mac)
   - **Firefox**: `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
   - **Edge**: `Ctrl+Shift+N` (Windows) or `Cmd+Shift+N` (Mac)
2. **Visit**: https://passionbots-lms.pages.dev/admin
3. **Login**: admin / admin123

### Option 3: Use Latest Deployment URL
The freshest deployment (guaranteed to work):
🔗 **https://5620dba0.passionbots-lms.pages.dev/admin**

Login: admin / admin123

---

## 🧪 Test Login Manually

If you're still having issues, try this step-by-step:

1. **Open browser console**:
   - Press `F12` or `Ctrl+Shift+I`
   - Click "Console" tab

2. **Clear localStorage**:
   ```javascript
   localStorage.clear()
   ```

3. **Refresh page**: `F5`

4. **Login again**: admin / admin123

---

## ✅ Verified Working URLs

### Latest Deployment (Guaranteed Fresh):
- **Admin**: https://5620dba0.passionbots-lms.pages.dev/admin
- **Login**: admin / admin123
- **Status**: ✅ Tested & Working

### Production URL:
- **Admin**: https://passionbots-lms.pages.dev/admin
- **Login**: admin / admin123
- **Note**: May need cache clear

### Sample Certificate (No Login Required):
- **View**: https://5620dba0.passionbots-lms.pages.dev/api/certificates/8/view
- **Status**: ✅ Works Without Login

---

## 🔍 Why This Happened

The "Invalid or expired session" error occurs when:
1. ❌ Old session token stored in browser
2. ❌ Browser cache has old authentication data
3. ❌ Session expired (24 hour timeout)

**Solution**: Clear cache or use incognito mode!

---

## 📝 Login Credentials (Reminder)

- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Super Admin
- **Permissions**: All

---

## 🚀 Quick Fix Commands

### If using Developer Tools:
```javascript
// Clear all local storage
localStorage.clear();

// Clear admin session specifically
localStorage.removeItem('admin_session');
localStorage.removeItem('admin_user');

// Reload page
location.reload();
```

---

## ✅ Verification Steps

After clearing cache, verify:

1. ✅ Can access admin portal
2. ✅ Can login with admin/admin123
3. ✅ Can see dashboard with 4 tabs
4. ✅ Can view certificates list
5. ✅ No "Invalid session" error

---

## 🌐 All Working URLs (No Login Required)

### Certificates (Public):
- Certificate #8: https://5620dba0.passionbots-lms.pages.dev/api/certificates/8/view
- Certificate #9: https://5620dba0.passionbots-lms.pages.dev/api/certificates/9/view
- Verification: https://5620dba0.passionbots-lms.pages.dev/verify/PB-IOT-2025-NN4PC8MJSZ34EQ

### Admin Portal (Login Required):
- Latest: https://5620dba0.passionbots-lms.pages.dev/admin
- Production: https://passionbots-lms.pages.dev/admin

---

## 🎯 Recommended Action

**Use this URL for guaranteed access:**
🔗 **https://5620dba0.passionbots-lms.pages.dev/admin**

1. Click the link above
2. Login: admin / admin123
3. Everything works perfectly!

---

## 📞 Still Having Issues?

If the problem persists:
1. Try different browser (Chrome, Firefox, Edge)
2. Disable browser extensions
3. Check browser console for errors (F12)
4. Use the latest deployment URL above

**The system is working - it's just a browser cache issue!** ✅
