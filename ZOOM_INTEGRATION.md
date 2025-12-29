# 🎥 Zoom Integration Guide - PassionBots LMS

## 📋 Overview
Complete Zoom meeting integration with automatic recording capture and video library for students.

## ✨ Features Implemented

### 1. **Mentor Features**
- 🔐 **OAuth Connection**: One-click Zoom account connection
- 📅 **Meeting Scheduling**: Schedule meetings directly from the platform
- 🎬 **Auto Recording**: All meetings automatically recorded to cloud
- 🔄 **Token Management**: Automatic token refresh for seamless operation

### 2. **Student Features**
- 📚 **Video Library**: Access all recorded sessions
- 🎥 **Video Playback**: Stream recordings directly in browser
- 📊 **Session History**: View past sessions with details
- 💾 **Cloud Storage**: Recordings stored securely in Cloudflare R2

### 3. **Automatic Workflow**
```
Meeting Scheduled → Zoom Meeting Created → Meeting Held → 
Recording Uploaded to Zoom Cloud → Webhook Notification → 
Download to R2 Storage → Available to Students
```

## 🚀 Setup Instructions

### Step 1: Create Zoom App

1. **Go to Zoom Marketplace**
   - Visit: https://marketplace.zoom.us/develop/create
   - Sign in with your Zoom account

2. **Create OAuth App**
   - Click "Build App"
   - Select "Server-to-Server OAuth"
   - Fill in app details:
     - App Name: `PassionBots LMS`
     - Description: `Learning Management System with video recording`
     - Company Name: `PassionBots`

3. **Configure App Credentials**
   - Note down:
     - **Client ID**: `YOUR_CLIENT_ID`
     - **Client Secret**: `YOUR_CLIENT_SECRET`
   
4. **Set Redirect URI**
   ```
   https://passionbots-lms.pages.dev/api/zoom/callback
   ```

5. **Add Scopes** (Required permissions):
   ```
   meeting:write
   meeting:read
   recording:read
   recording:write
   user:read
   ```

6. **Enable Event Subscriptions**
   - Event notification endpoint URL:
     ```
     https://passionbots-lms.pages.dev/api/zoom/webhook
     ```
   - Subscribe to events:
     - `recording.completed`
     - `meeting.started`
     - `meeting.ended`
   
7. **Copy Webhook Secret Token**
   - Note down the verification token

### Step 2: Create Cloudflare R2 Bucket

```bash
# Create R2 bucket for storing recordings
npx wrangler r2 bucket create passionbots-recordings

# R2 bucket is already configured in wrangler.jsonc
```

### Step 3: Configure Environment Variables

**For Local Development** (`.dev.vars`):
```bash
# Create .dev.vars file
cat > .dev.vars << 'EOF'
ZOOM_CLIENT_ID=your_actual_client_id
ZOOM_CLIENT_SECRET=your_actual_client_secret
ZOOM_WEBHOOK_SECRET=your_webhook_verification_token
ZOOM_REDIRECT_URI=https://passionbots-lms.pages.dev/api/zoom/callback
EOF
```

**For Production** (Cloudflare Secrets):
```bash
# Set Zoom credentials as secrets
npx wrangler secret put ZOOM_CLIENT_ID
# Paste your Client ID when prompted

npx wrangler secret put ZOOM_CLIENT_SECRET
# Paste your Client Secret when prompted

npx wrangler secret put ZOOM_WEBHOOK_SECRET
# Paste your Webhook Secret when prompted

npx wrangler secret put ZOOM_REDIRECT_URI
# Enter: https://passionbots-lms.pages.dev/api/zoom/callback
```

### Step 4: Run Database Migration

```bash
# Apply Zoom integration migration
cd /home/user/webapp
npx wrangler d1 migrations apply passionbots-lms-production --local

# For production
npx wrangler d1 migrations apply passionbots-lms-production
```

### Step 5: Build and Deploy

```bash
# Build the project
cd /home/user/webapp && npm run build

# Deploy to production
npx wrangler pages deploy dist --project-name passionbots-lms
```

## 📖 Usage Guide

### For Mentors

#### 1. Connect Zoom Account
```javascript
// Frontend code (already in app-zoom-integration.js)
async function connectZoom() {
  const response = await fetch('/api/zoom/auth-url');
  const { auth_url } = await response.json();
  window.open(auth_url, 'zoom-auth', 'width=600,height=700');
}
```

#### 2. Schedule Meeting
```javascript
async function scheduleMeeting(sessionData) {
  const response = await fetch('/api/zoom/schedule-meeting', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Robotics Class - Grade 2',
      description: 'Introduction to Sensors',
      start_time: '2025-12-30T10:00:00Z',
      duration: 60,
      mentor_id: 1,
      session_id: 123
    })
  });
  
  const { meeting } = await response.json();
  console.log('Meeting scheduled:', meeting.join_url);
}
```

### For Students

#### 1. View Recorded Sessions
```javascript
async function loadRecordings() {
  const response = await fetch('/api/zoom/recordings?student_id=1');
  const { recordings } = await response.json();
  
  // Display recordings in UI
  recordings.forEach(recording => {
    console.log(`${recording.session_title} - ${recording.duration}min`);
  });
}
```

#### 2. Play Recording
```javascript
function playRecording(recordingId) {
  const videoUrl = `/api/zoom/recordings/${recordingId}/stream`;
  
  // Use HTML5 video player
  const video = document.createElement('video');
  video.src = videoUrl;
  video.controls = true;
  document.getElementById('video-container').appendChild(video);
}
```

## 🔄 Automatic Recording Flow

### 1. Meeting Scheduled
- Mentor schedules meeting from LMS
- Zoom meeting created with `auto_recording: 'cloud'`
- Meeting details stored in database

### 2. Meeting Held
- Participants join via Zoom
- Recording starts automatically
- Video/audio captured to Zoom Cloud

### 3. Recording Available
- Zoom processes recording (takes 5-10 minutes)
- Webhook triggered: `recording.completed`
- LMS receives notification

### 4. Download & Store
- LMS downloads recording from Zoom
- Uploads to Cloudflare R2 bucket
- Updates database with R2 key

### 5. Student Access
- Recording appears in student's video library
- Students can stream on-demand
- No Zoom account required for students

## 📊 Database Schema

### zoom_tokens
```sql
token_id, mentor_id, access_token, refresh_token, expires_at, created_at
```

### zoom_meetings
```sql
meeting_id, session_id, mentor_id, zoom_meeting_id, meeting_url, 
join_url, start_url, start_time, duration, status, recording_status
```

### zoom_recordings
```sql
recording_id, meeting_id, file_id, file_name, file_type, file_size,
r2_key, download_url, duration, status
```

## 🎯 API Endpoints

### Mentor APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/zoom/auth-url` | GET | Get Zoom OAuth URL |
| `/api/zoom/callback` | GET | OAuth callback handler |
| `/api/zoom/schedule-meeting` | POST | Schedule new meeting |

### Student APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/zoom/recordings` | GET | List all recordings |
| `/api/zoom/recordings/:sessionId` | GET | Get session recordings |
| `/api/zoom/recordings/:recordingId/stream` | GET | Stream video |

### Webhook
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/zoom/webhook` | POST | Zoom event notifications |

## 🔐 Security Features

1. **OAuth 2.0**: Secure Zoom authentication
2. **Token Refresh**: Automatic token renewal
3. **Webhook Verification**: Signature validation
4. **Access Control**: Student-session enrollment check
5. **Secure Storage**: R2 with access policies

## ⚡ Performance

- **R2 Storage**: Fast global CDN delivery
- **Streaming**: Byte-range requests support
- **Caching**: CloudFlare edge caching
- **Lazy Loading**: Load recordings on-demand

## 🐛 Troubleshooting

### Zoom Connection Fails
```bash
# Check credentials
npx wrangler secret list

# Verify redirect URI matches Zoom app settings
# Ensure scopes are correctly set
```

### Recording Not Downloaded
```bash
# Check webhook endpoint is accessible
curl -X POST https://passionbots-lms.pages.dev/api/zoom/webhook

# Verify R2 bucket exists
npx wrangler r2 bucket list

# Check logs
npx wrangler tail passionbots-lms
```

### Video Won't Play
```bash
# Verify R2 binding in wrangler.jsonc
# Check recording status in database
# Ensure Content-Type header is set correctly
```

## 📚 Resources

- [Zoom OAuth Documentation](https://marketplace.zoom.us/docs/guides/auth/oauth)
- [Zoom Webhook Events](https://marketplace.zoom.us/docs/api-reference/webhook-reference/recording-events)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)

## ✅ Verification Checklist

- [ ] Zoom app created and configured
- [ ] R2 bucket created
- [ ] Environment variables set
- [ ] Database migration applied
- [ ] Webhook endpoint verified
- [ ] Test meeting scheduled
- [ ] Recording downloaded successfully
- [ ] Video playback works
- [ ] Student can access recordings

## 🎉 What's Next?

1. **UI Integration**: Add Zoom UI to mentor/student dashboards (already in app-zoom-integration.js)
2. **Notifications**: Email students when new recordings available
3. **Analytics**: Track video watch time and engagement
4. **Live Streaming**: Add live class streaming for real-time participation

---

**Status**: ✅ Backend Complete | ⏳ UI Integration Pending | 🔄 Testing Required

