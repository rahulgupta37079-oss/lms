# Zoom Integration Setup Guide

## Overview
This system automatically schedules Zoom meetings, records them, downloads recordings, stores them in Cloudflare R2, and makes them available for students to watch anytime.

## Architecture

```
Mentor Schedules Meeting 
    ↓
Zoom API Creates Meeting (with auto-record enabled)
    ↓
Meeting Happens & Records Automatically
    ↓
Zoom Webhook Notifies Recording Ready
    ↓
System Downloads Recording from Zoom
    ↓
Uploads to Cloudflare R2 Storage
    ↓
Students Can Watch Anytime
```

## Setup Steps

### 1. Create Zoom App

1. Go to https://marketplace.zoom.us/
2. Click "Develop" → "Build App"
3. Choose "Server-to-Server OAuth" app type
4. Fill in app details:
   - App Name: PassionBots LMS
   - Company Name: PassionBots
   - Developer Contact: your@email.com

5. Get credentials:
   - Account ID
   - Client ID
   - Client Secret

6. Add Scopes:
   - `meeting:write:admin` - Create meetings
   - `meeting:read:admin` - Read meeting details
   - `recording:write:admin` - Manage recordings
   - `recording:read:admin` - Read recordings
   - `user:read:admin` - Read user info

7. Activate the app

### 2. Enable Webhooks

1. In Zoom App Dashboard → Features
2. Enable "Event Subscriptions"
3. Add Event Subscription:
   - Subscription Name: Recording Ready
   - Event notification endpoint URL: `https://passionbots-lms.pages.dev/api/zoom/webhook`
   
4. Add Events:
   - `recording.completed` - When recording is ready
   - `meeting.started` - When meeting starts
   - `meeting.ended` - When meeting ends

5. Copy Verification Token
6. Save

### 3. Create Cloudflare R2 Bucket

```bash
# Create R2 bucket for video storage
npx wrangler r2 bucket create passionbots-videos

# Update wrangler.jsonc
```

Add to `wrangler.jsonc`:
```json
{
  "r2_buckets": [
    {
      "binding": "VIDEOS",
      "bucket_name": "passionbots-videos"
    }
  ]
}
```

### 4. Add Environment Variables

#### For Production (Cloudflare):
```bash
cd /home/user/webapp

# Zoom Credentials
npx wrangler secret put ZOOM_ACCOUNT_ID --project-name passionbots-lms
npx wrangler secret put ZOOM_CLIENT_ID --project-name passionbots-lms
npx wrangler secret put ZOOM_CLIENT_SECRET --project-name passionbots-lms
npx wrangler secret put ZOOM_WEBHOOK_SECRET --project-name passionbots-lms

# Redeploy
npm run build
npx wrangler pages deploy dist --project-name passionbots-lms
```

#### For Local Development:
Add to `.dev.vars`:
```bash
ZOOM_ACCOUNT_ID=your_account_id
ZOOM_CLIENT_ID=your_client_id
ZOOM_CLIENT_SECRET=your_client_secret
ZOOM_WEBHOOK_SECRET=your_verification_token
```

## Database Schema

Tables created:
- `zoom_meetings` - Scheduled meetings
- `zoom_recordings` - Downloaded recordings
- `recording_views` - View tracking

## Features

### For Mentors:
✅ Schedule meetings with auto-recording
✅ Set topic, description, duration
✅ Select grade level
✅ Optional password protection
✅ View scheduled meetings

### For Students:
✅ View upcoming live sessions
✅ Join meetings (15 min before start)
✅ Watch recorded sessions anytime
✅ Download recordings
✅ Track progress

### Automatic:
✅ Recording starts when meeting starts
✅ Recording downloads when ready
✅ Upload to R2 storage
✅ Notification to students
✅ Thumbnail generation
✅ View tracking

## API Endpoints

### Meeting Management:
- `POST /api/zoom/schedule` - Schedule new meeting
- `GET /api/zoom/upcoming` - Get upcoming meetings
- `DELETE /api/zoom/meeting/:id` - Cancel meeting

### Recording Management:
- `GET /api/zoom/recordings` - List all recordings
- `GET /api/zoom/recording/:id` - Get recording details
- `POST /api/zoom/recording/:id/view` - Track view
- `DELETE /api/zoom/recording/:id` - Delete recording

### Webhooks:
- `POST /api/zoom/webhook` - Receive Zoom events
- `POST /api/zoom/download-recording/:id` - Manual download trigger

## Workflow Details

### 1. Scheduling a Meeting:

```javascript
// Mentor fills form → Frontend sends:
POST /api/zoom/schedule
{
  "topic": "IoT Sensors Introduction",
  "description": "Learn about temperature sensors",
  "date": "2025-01-15",
  "time": "10:00",
  "duration": 60,
  "grade_id": 2,
  "auto_record": true
}

// Backend:
1. Gets Zoom access token
2. Creates meeting via Zoom API
3. Saves to zoom_meetings table
4. Returns meeting ID and join URL
```

### 2. Recording Process:

```javascript
// When meeting starts:
- Zoom automatically starts recording (if auto_record = true)

// When recording is ready:
1. Zoom sends webhook to /api/zoom/webhook
2. Webhook verified using secret token
3. System downloads recording file
4. Uploads to Cloudflare R2
5. Creates thumbnail
6. Saves to zoom_recordings table
7. Updates zoom_meetings status
8. Notifies students (optional)
```

### 3. Watching Recording:

```javascript
// Student clicks "Watch Recording":
1. Fetches recording details
2. Opens video player modal
3. Streams from R2 URL
4. Tracks view count
5. Allows download
```

## Storage Strategy

### Zoom Cloud (Temporary):
- Recordings stored for 7 days
- Auto-download within 24 hours
- Deleted from Zoom after download

### Cloudflare R2 (Permanent):
- Unlimited storage time
- Fast global CDN
- Cost-effective ($0.015/GB)
- No egress fees

### File Structure:
```
passionbots-videos/
  recordings/
    {year}/
      {month}/
        {meeting_id}/
          video.mp4
          thumbnail.jpg
```

## Cost Estimate

### Zoom:
- Free: 40 min meetings, unlimited 1-on-1
- Pro ($15/month): Unlimited meetings, recording
- Business ($20/month): More features

### Cloudflare R2:
- Storage: $0.015/GB/month
- No egress fees
- Example: 100 recordings × 500MB = 50GB = $0.75/month

### Total:
- ~$15-20/month for unlimited recordings

## Testing

### 1. Schedule Test Meeting:
```bash
# Login as mentor
# Go to Zoom Sessions → Schedule New
# Fill form and submit
# Check if meeting appears in upcoming
```

### 2. Test Recording:
```bash
# Join the meeting
# Record for 1-2 minutes
# End meeting
# Wait 5-10 minutes for processing
# Check if recording appears in recorded sessions
```

### 3. Test Playback:
```bash
# Login as student
# Go to Zoom Sessions → Recorded Sessions
# Click on recording
# Verify video plays
```

## Troubleshooting

### Recording not appearing:
1. Check Zoom dashboard - is recording ready?
2. Check webhook logs - did we receive notification?
3. Check R2 bucket - was file uploaded?
4. Check database - is entry in zoom_recordings?

### Cannot schedule meeting:
1. Verify Zoom credentials
2. Check Zoom API scopes
3. Review error logs
4. Test Zoom API directly

### Video won't play:
1. Check R2 file exists
2. Verify URL is public
3. Check CORS settings
4. Try different browser

## Security

### Zoom Webhook Verification:
```javascript
// Verify webhook signature
const signature = crypto
  .createHmac('sha256', ZOOM_WEBHOOK_SECRET)
  .update(JSON.stringify(payload))
  .digest('hex');
  
if (signature !== receivedSignature) {
  return 403; // Unauthorized
}
```

### Recording Access:
- Only authenticated users
- Based on subscription plan
- View tracking for analytics
- Download limits (optional)

## Monitoring

Track:
- Meeting schedule rate
- Recording success rate
- Download completion time
- Storage usage
- View counts
- User engagement

## Future Enhancements

🔜 Live chat during meetings
🔜 Q&A feature
🔜 Breakout rooms support
🔜 Polls and quizzes
🔜 Auto-generated transcripts
🔜 AI-powered highlights
🔜 Multi-language subtitles
🔜 Watch parties

## Support

For issues:
1. Check Zoom App logs
2. Review Cloudflare logs
3. Check database entries
4. Contact support@passionbots.in
