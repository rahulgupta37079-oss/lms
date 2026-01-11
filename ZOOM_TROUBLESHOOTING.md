# Zoom Integration Troubleshooting Guide

## ❌ Error: `invalid_client` (HTTP 400)

### What This Error Means
The Zoom API rejected your credentials. This usually happens when:
1. **Wrong Credentials**: Copy-paste error in Account ID, Client ID, or Client Secret
2. **App Not Activated**: The Zoom app hasn't been activated yet
3. **Wrong App Type**: Using wrong authentication type (JWT vs Server-to-Server OAuth)
4. **Expired/Revoked**: Credentials were revoked or app was deleted

---

## ✅ Step-by-Step Fix

### Step 1: Verify Your Zoom App Type

**IMPORTANT**: You MUST use **Server-to-Server OAuth** (NOT JWT App)

1. Go to: https://marketplace.zoom.us/user/build
2. Look for your app in the list
3. Click on it to open
4. Check the app type at the top:
   - ✅ Should say: **"Server-to-Server OAuth"**
   - ❌ If it says "JWT" or "OAuth 2.0", you need to create a new app

---

### Step 2: Create New Server-to-Server OAuth App (If Needed)

1. **Go to Zoom App Marketplace**:
   - URL: https://marketplace.zoom.us/develop/create
   
2. **Choose App Type**:
   - Click **"Server-to-Server OAuth"**
   - Click **"Create"**

3. **Fill App Information**:
   - **App Name**: PassionBots LMS Integration
   - **Short Description**: Learning Management System for IoT & Robotics courses
   - **Company Name**: PassionBots
   - **Developer Name**: [Your Name]
   - **Developer Email**: [Your Email]

4. **Copy Credentials**:
   - You'll see three values on the next screen:
     - ✅ **Account ID**: `KCiJH1NATLqbdWhryA3ujQ` ← Keep this
     - ✅ **Client ID**: `nUZuo4LR7O5khLR_he49A` ← Keep this
     - ✅ **Client Secret**: Click "Copy" (long string)

5. **Add Scopes** (VERY IMPORTANT):
   - Click **"Scopes"** tab
   - Add these scopes:
     - ✅ `meeting:write:admin` (Create meetings)
     - ✅ `meeting:read:admin` (Read meetings)
     - ✅ `meeting:update:admin` (Update meetings)
     - ✅ `meeting:delete:admin` (Delete meetings)
     - ✅ `recording:read:admin` (View recordings)
   - Click **"Done"**

6. **Activate the App**:
   - Click **"Activation"** tab
   - Toggle **"Activate your app"** to ON
   - ✅ App status should show **"Activated"**

---

### Step 3: Verify Credentials Are Correct

#### Check Each Credential:

**Account ID**:
```
KCiJH1NATLqbdWhryA3ujQ
```
- Should be exactly 22 characters
- Mix of letters and numbers
- NO spaces or special characters

**Client ID**:
```
nUZuo4LR7O5khLR_he49A
```
- Should be exactly 22 characters
- Mix of letters, numbers, underscore
- NO spaces

**Client Secret**:
```
[Your secret here - usually 32+ characters]
```
- Usually 32-64 characters long
- Mix of letters, numbers, special characters
- MAKE SURE you copied the ENTIRE secret (no truncation)

---

### Step 4: Test Credentials

#### Method A: Web-Based Test (Easiest)

1. Open browser to:
   ```
   https://passionbots-lms.pages.dev/zoom-test.html
   ```

2. Enter your credentials:
   - Account ID: `KCiJH1NATLqbdWhryA3ujQ`
   - Client ID: `nUZuo4LR7O5khLR_he49A`
   - Client Secret: [Paste your secret]

3. Click **"Test Connection"**

4. Expected result:
   - ✅ **Success**: "Successfully obtained access token!"
   - ❌ **Failure**: Error message will tell you what's wrong

#### Method B: Command Line Test

```bash
cd /home/user/webapp
export ZOOM_ACCOUNT_ID='KCiJH1NATLqbdWhryA3ujQ'
export ZOOM_CLIENT_ID='nUZuo4LR7O5khLR_he49A'
export ZOOM_CLIENT_SECRET='your-actual-secret-here'
python3 zoom-integration.py
```

Expected output:
```
✅ Successfully obtained access token!
🎉 Zoom integration is working!
```

---

## 🔧 Common Issues & Solutions

### Issue 1: "invalid_client" Error
**Cause**: Wrong credentials or app not activated
**Solution**:
- Double-check you copied ALL characters (no spaces/truncation)
- Verify app is **Activated** in Zoom Marketplace
- Make sure app type is **Server-to-Server OAuth**

### Issue 2: "Invalid access token" Error  
**Cause**: Credentials correct but token generation failed
**Solution**:
- Wait 5 minutes and try again
- Check if scopes are added correctly
- Verify your Zoom account is Pro/Business (not Basic)

### Issue 3: "Insufficient privileges" Error
**Cause**: Missing required scopes
**Solution**:
- Go to app **Scopes** tab
- Add all meeting-related scopes (see Step 2, #5)
- Save and try again

### Issue 4: App Shows "Not Activated"
**Cause**: You didn't toggle activation
**Solution**:
- Go to **Activation** tab in app settings
- Toggle **"Activate your app"** to ON
- Status should change to "Activated"

---

## 📋 Quick Checklist

Before contacting support, verify:

- [ ] App type is **Server-to-Server OAuth** (not JWT)
- [ ] App status shows **"Activated"** (not "Not Activated")
- [ ] All 5 scopes are added (meeting:write, read, update, delete, recording:read)
- [ ] Account ID is exactly 22 characters
- [ ] Client ID is exactly 22 characters  
- [ ] Client Secret is complete (32+ characters, no truncation)
- [ ] Zoom account is **Pro or higher** (not Basic/Free)
- [ ] You copied credentials from the **correct app** (not a different app)

---

## 🎯 Next Steps After Fixing

Once credentials work:

1. **Save to .dev.vars file** (for local development):
   ```bash
   cd /home/user/webapp
   cat > .dev.vars << EOF
   ZOOM_ACCOUNT_ID=KCiJH1NATLqbdWhryA3ujQ
   ZOOM_CLIENT_ID=nUZuo4LR7O5khLR_he49A
   ZOOM_CLIENT_SECRET=your-actual-secret-here
   EOF
   ```

2. **Deploy to production** (add secrets to Cloudflare):
   ```bash
   npx wrangler pages secret put ZOOM_ACCOUNT_ID --project-name passionbots-lms
   npx wrangler pages secret put ZOOM_CLIENT_ID --project-name passionbots-lms
   npx wrangler pages secret put ZOOM_CLIENT_SECRET --project-name passionbots-lms
   ```

3. **Implement full integration**:
   - Choose Option A (Full UI integration) or Option B (API-only)
   - Follow ZOOM_INTEGRATION_GUIDE.md

---

## 📞 Need Help?

If you're still stuck after trying all steps:

1. **Share screenshots**:
   - Your Zoom app dashboard
   - The "App Credentials" page
   - The "Scopes" page
   - The "Activation" page

2. **Share error message**:
   - Exact error text from test
   - Any error codes

3. **Verify account type**:
   - Login to Zoom
   - Check account plan (Pro/Business/Enterprise)

---

## ✅ Success Indicators

You'll know it's working when:

1. Test command shows:
   ```
   ✅ Successfully obtained access token!
   🎉 Zoom integration is working!
   ```

2. You can create a test meeting:
   ```
   Meeting created successfully!
   Meeting ID: 123 456 7890
   Join URL: https://zoom.us/j/1234567890
   ```

3. Admin panel shows "Create with Zoom" button (after implementation)

---

**Current Status**: Credentials provided but getting `invalid_client` error
**Most Likely Cause**: App not activated OR client secret incomplete/wrong
**Next Action**: Follow Step 2 to verify/recreate app, then Step 4 to test

---

Last Updated: January 11, 2026
Project: PassionBots LMS
Status: Troubleshooting Zoom Integration
