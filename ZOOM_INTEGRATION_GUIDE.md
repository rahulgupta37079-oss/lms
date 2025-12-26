# Zoom Integration Guide for PassionBots LMS

## Overview
PassionBots LMS now integrates with Zoom for live robotics classes, replacing Google Meet with a more robust and feature-rich video conferencing solution.

## Features
- **HD Video & Audio**: High-quality video for demonstrations
- **Screen Sharing**: Share robot designs, code, and diagrams
- **Breakout Rooms**: Create small groups for team projects
- **Recording**: Record sessions for later viewing
- **Virtual Background**: Professional classroom environment
- **Chat & Reactions**: Interactive engagement during class

## Setting Up Zoom Integration

### Step 1: Create Zoom Account
1. Go to https://zoom.us/
2. Sign up for Zoom account (Basic account is free for 40-minute sessions)
3. For unlimited session duration, upgrade to Pro plan ($14.99/month)

### Step 2: Create Live Sessions

#### Option A: Manual Zoom Meeting Creation
1. Log in to Zoom web portal
2. Click "Schedule a Meeting"
3. Set meeting details:
   - **Topic**: Session title (e.g., "Grade 1 - Introduction to Arduino")
   - **When**: Schedule time
   - **Duration**: 90 minutes (or session duration)
   - **Recurring**: Yes (if weekly class)
   - **Meeting ID**: Generate automatically
   - **Password**: Set secure password
   - **Video**: Host and Participant ON
   - **Audio**: Computer audio
4. Save meeting and copy the Join URL

#### Option B: Zoom API Integration (Advanced)
For automated scheduling, use Zoom API:

```bash
# Install Zoom SDK (if using backend automation)
npm install @zoom/meetingsdk

# Create meeting via API
curl -X POST https://api.zoom.us/v2/users/me/meetings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Grade 1 - Introduction to Arduino",
    "type": 2,
    "start_time": "2025-01-15T10:00:00Z",
    "duration": 90,
    "timezone": "Asia/Kolkata",
    "settings": {
      "host_video": true,
      "participant_video": true,
      "join_before_host": false,
      "mute_upon_entry": true,
      "waiting_room": true
    }
  }'
```

### Step 3: Add Sessions to LMS Database

```sql
-- Example: Add Kindergarten Zoom session
INSERT INTO live_sessions (
  module_id, 
  title, 
  description, 
  session_date, 
  duration_minutes, 
  meeting_url
) VALUES (
  1,  -- Kindergarten module
  'KG Week 1: What is a Robot?',
  'Interactive introduction to robots with show and tell',
  '2025-01-20 10:00:00',
  60,
  'https://zoom.us/j/1234567890?pwd=yourpassword'
);

-- Example: Add Grade 1 Zoom session
INSERT INTO live_sessions (
  module_id, 
  title, 
  description, 
  session_date, 
  duration_minutes, 
  meeting_url
) VALUES (
  2,  -- Grade 1 module
  'Grade 1 Week 1: Introduction to Electricity',
  'Learn about electrical circuits and safety',
  '2025-01-20 14:00:00',
  90,
  'https://zoom.us/j/9876543210?pwd=yourpassword'
);

-- Example: Add Grade 2 Zoom session
INSERT INTO live_sessions (
  module_id, 
  title, 
  description, 
  session_date, 
  duration_minutes, 
  meeting_url
) VALUES (
  3,  -- Grade 2 module
  'Grade 2 Week 1: Advanced Touch Sensors',
  'Deep dive into touch sensing technology',
  '2025-01-20 16:00:00',
  90,
  'https://zoom.us/j/5555555555?pwd=yourpassword'
);
```

### Step 4: Add Sessions via LMS Admin Panel (Coming Soon)
Future feature: Admin interface to schedule Zoom meetings directly from LMS.

## Best Practices for Zoom Classes

### Before Class
1. **Test Equipment**: Check camera, microphone, and robot demos
2. **Prepare Materials**: Share screen presentations, circuit diagrams
3. **Send Reminders**: Email students with Zoom link 1 day before
4. **Enable Waiting Room**: Review students before admitting
5. **Record Session**: Enable cloud recording for students who miss class

### During Class
1. **Mute Students**: Start with all students muted
2. **Use Chat**: Monitor questions in chat
3. **Breakout Rooms**: For team robot building activities
4. **Screen Share**: Demonstrate coding, circuit design
5. **Reactions**: Use thumbs up, clapping for engagement
6. **Spotlight Video**: Feature student demos

### After Class
1. **Share Recording**: Upload to LMS recording_url
2. **Review Chat**: Answer unanswered questions
3. **Take Attendance**: Mark attendance in LMS
4. **Homework Assignment**: Post in LMS assignments section

## Recording Management

After class ends, Zoom auto-uploads recording to cloud:

1. Go to https://zoom.us/recording
2. Find your class recording
3. Click "Share" and copy link
4. Update LMS database:

```sql
UPDATE live_sessions 
SET recording_url = 'https://zoom.us/rec/share/your_recording_link',
    is_completed = 1
WHERE id = 1;  -- Replace with actual session ID
```

Students can now watch recordings from LMS dashboard.

## Security Settings

### Recommended Zoom Settings
- ✅ Enable Waiting Room
- ✅ Require Password
- ✅ Lock meeting once all students join
- ✅ Disable file transfer
- ✅ Disable private chat (use group chat only)
- ✅ Mute participants upon entry
- ✅ Only host can share screen (initially)
- ✅ Enable cloud recording

### Zoom Room Guidelines
1. Students must use real names
2. Keep video ON during demonstrations
3. Use "Raise Hand" feature for questions
4. Respectful behavior in chat
5. No recording by participants

## Troubleshooting

### Common Issues

**Issue**: Students can't join Zoom
- **Solution**: Check if waiting room is enabled, admit students manually

**Issue**: Audio echo/feedback
- **Solution**: Ask students to use headphones, mute when not speaking

**Issue**: Recording not saving
- **Solution**: Ensure cloud recording is enabled in Zoom settings

**Issue**: Can't share screen
- **Solution**: Check host sharing permissions, allow participants to share

**Issue**: Zoom link expired
- **Solution**: Use recurring meeting link, not one-time links

## Mobile App Support
Students can join via Zoom mobile app:
- **iOS**: Download from App Store
- **Android**: Download from Play Store
- Zoom meeting ID and password required

## Upgrading Zoom Plan

| Plan | Price | Duration | Participants | Features |
|------|-------|----------|--------------|----------|
| Basic | Free | 40 min | 100 | HD video, screen share |
| Pro | $14.99/mo | 30 hours | 100 | Unlimited time, cloud recording |
| Business | $19.99/mo | 30 hours | 300 | Admin dashboard, SSO |

**Recommendation**: Pro plan for unlimited class duration

## Support Resources
- **Zoom Help Center**: https://support.zoom.us/
- **Zoom Test Meeting**: https://zoom.us/test
- **Zoom System Requirements**: https://support.zoom.us/hc/en-us/articles/201362023
- **LMS Support**: Contact mentor@passionbots.in

---

## Next Steps
1. ✅ Create Zoom account
2. ✅ Schedule first live session
3. ✅ Add meeting URL to LMS database
4. ✅ Test Zoom link from LMS
5. ✅ Notify students via email
6. ✅ Conduct first live robotics class!

**Ready to teach amazing robotics classes! 🤖🎓**
