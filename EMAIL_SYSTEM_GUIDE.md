# 📧 Certificate Email System - Complete Guide

**Date:** January 3, 2026  
**System:** PassionBots LMS  
**API:** Resend (https://resend.com)

---

## 🎯 Overview

The certificate email system allows you to send professional, branded email notifications to students when their certificates are ready. Emails are sent via the Resend API and include:

- 🎓 Personalized certificate notification
- 📄 Direct link to view and download certificate
- 🔍 Verification link for authenticity
- 📱 Mobile-responsive HTML email design
- 🎨 PassionBots branding and styling

---

## 🔧 Setup Instructions

### 1. Get Resend API Key

1. Go to https://resend.com
2. Sign up or log in
3. Navigate to **API Keys** section
4. Create a new API key
5. Copy the key (starts with `re_...`)

### 2. Verify Your Domain

For production use, you need to verify your sending domain:

1. In Resend dashboard, go to **Domains**
2. Add your domain: `passionbots.co.in`
3. Add DNS records (SPF, DKIM, DMARC)
4. Wait for verification (usually 24-48 hours)
5. Once verified, you can send from `certificates@passionbots.co.in`

**Note:** For testing, you can use Resend's test domain.

### 3. Configure Cloudflare Pages

Add the Resend API key as a secret to your Cloudflare Pages project:

```bash
# Set secret for production
npx wrangler pages secret put RESEND_API_KEY --project-name passionbots-lms

# When prompted, paste your Resend API key
```

### 4. For Local Development

Create a `.dev.vars` file (already in .gitignore):

```bash
cd /home/user/webapp
cat > .dev.vars << 'EOF'
RESEND_API_KEY=re_your_api_key_here
EOF
```

### 5. Apply Database Migration

Add email tracking columns to the certificates table:

```bash
# Local development
cd /home/user/webapp
npx wrangler d1 migrations apply passionbots-lms-production --local

# Production
npx wrangler d1 migrations apply passionbots-lms-production
```

---

## 📨 Email Sending Methods

### Method 1: Python Script (Bulk Sending)

**Best for:** Sending certificates to a large batch of students

#### Step 1: Set Environment Variable

```bash
export RESEND_API_KEY='re_your_api_key_here'
```

#### Step 2: Update Student Emails in CSV

The script reads from the CSV file. Ensure your CSV has an `email` column with valid email addresses.

Example CSV format:
```csv
student_id,name,email,course_name,completion_date
1,John Doe,john@example.com,IoT & Robotics Webinar,2025-12-28
2,Jane Smith,jane@example.com,IoT & Robotics Webinar,2025-12-28
```

#### Step 3: Run the Email Script

```bash
cd /home/user/webapp
python3 send-certificates-email.py
```

**Output:**
```
📧 Certificate Email Sender - Resend API
============================================================
🔐 Logging in to admin API...
✅ Login successful! Token: admin_1767416481...
📋 Fetching certificates (ID >= 68)...
✅ Found 82 certificates to send (total in DB: 149)
📧 Sending 82 emails...
============================================================
1. 📤 Sending to Abinaya M (abimohan2123@gmail.com)... ✅ Sent! (ID: abc123)
2. 📤 Sending to Rahul Sunil Gupta (professorhulk00@gmail.com)... ✅ Sent! (ID: def456)
...
============================================================
📊 Email Sending Summary
============================================================
✅ Sent:    78
❌ Failed:  2
⚠️  Skipped: 2
📋 Total:   82
============================================================
💾 Results saved to: email_results_20260103_050000.json
```

#### Script Features:
- ✅ Automatic admin login
- ✅ Batch email sending
- ✅ Progress tracking
- ✅ Error handling
- ✅ Results saved to JSON
- ✅ Skips invalid emails
- ✅ Updates database with email status

---

### Method 2: API Endpoints (Single or Batch)

**Best for:** Integrating email sending into admin UI or other systems

#### API Endpoint 1: Send Single Certificate Email

```bash
POST /api/admin/certificates/:id/send-email
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "student_email": "student@example.com",
  "deployment_url": "https://passionbots-lms.pages.dev"
}
```

**Example:**
```bash
# Login first
TOKEN=$(curl -s -X POST 'https://passionbots-lms.pages.dev/api/admin/login' \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.token')

# Send email for certificate ID 68
curl -X POST 'https://passionbots-lms.pages.dev/api/admin/certificates/68/send-email' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "student_email": "abimohan2123@gmail.com",
    "deployment_url": "https://04437b44.passionbots-lms.pages.dev"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "email_id": "abc123-def456-ghi789"
}
```

---

#### API Endpoint 2: Send Bulk Certificate Emails

```bash
POST /api/admin/certificates/send-bulk-email
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "certificate_ids": [68, 69, 70, 71],
  "deployment_url": "https://passionbots-lms.pages.dev"
}
```

**Example:**
```bash
# Send emails for certificates 68-149
curl -X POST 'https://passionbots-lms.pages.dev/api/admin/certificates/send-bulk-email' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "certificate_ids": [68,69,70,71,72,73,74,75,76,77],
    "deployment_url": "https://04437b44.passionbots-lms.pages.dev"
  }'
```

**Response:**
```json
{
  "success": true,
  "results": {
    "sent": 8,
    "failed": 1,
    "skipped": 1,
    "details": [
      {
        "certificate_id": 68,
        "student_name": "Abinaya M",
        "email": "abimohan2123@gmail.com",
        "status": "sent",
        "email_id": "abc123"
      },
      ...
    ]
  }
}
```

---

## 📋 Database Schema

### New Columns in `certificates` Table

```sql
student_email     TEXT        -- Student's email address
email_sent        INTEGER     -- 0 = not sent, 1 = sent
email_sent_at     DATETIME    -- Timestamp when email was sent
```

### Query Examples

```sql
-- Get all certificates that haven't been emailed
SELECT * FROM certificates 
WHERE email_sent = 0 OR email_sent IS NULL;

-- Get certificates sent today
SELECT * FROM certificates 
WHERE date(email_sent_at) = date('now');

-- Count emails sent vs pending
SELECT 
  SUM(CASE WHEN email_sent = 1 THEN 1 ELSE 0 END) as sent,
  SUM(CASE WHEN email_sent = 0 OR email_sent IS NULL THEN 1 ELSE 0 END) as pending
FROM certificates;
```

---

## 📧 Email Template Details

### Email Features:
- ✅ Responsive design (works on mobile and desktop)
- ✅ PassionBots branding
- ✅ Two CTAs: "View Certificate" and "Verify Certificate"
- ✅ Certificate code displayed
- ✅ Instructions for downloading
- ✅ Professional footer with contact info

### Email Structure:
1. **Header:** Congratulations message with gradient background
2. **Body:** Personalized greeting, certificate info, action buttons
3. **Instructions:** How to use the certificate
4. **Footer:** PassionBots branding and contact info

### Customization:

To customize the email template, edit the `createCertificateEmailHTML()` function in `/home/user/webapp/src/index.tsx`.

---

## 🧪 Testing

### Test with a Single Email

```bash
# Set your test email
export RESEND_API_KEY='re_your_test_key'

# Test single certificate
curl -X POST 'https://passionbots-lms.pages.dev/api/admin/certificates/68/send-email' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "student_email": "your-test-email@example.com",
    "deployment_url": "https://04437b44.passionbots-lms.pages.dev"
  }'
```

### Check Email Delivery

1. Check your inbox for the test email
2. Verify all links work:
   - View Certificate button
   - Verify Certificate button
3. Test on mobile device
4. Check spam folder if not received

---

## 📊 Monitoring & Analytics

### Resend Dashboard

Monitor email sending in the Resend dashboard:
- **Emails sent:** Total count
- **Delivery rate:** Success/failure rate
- **Bounce rate:** Invalid email addresses
- **Open rate:** (if tracking enabled)
- **Click rate:** Button clicks

### Database Queries

```sql
-- Email sending status
SELECT 
  COUNT(*) as total,
  SUM(email_sent) as sent,
  COUNT(*) - SUM(email_sent) as pending
FROM certificates;

-- Recent emails
SELECT 
  certificate_id,
  student_name,
  student_email,
  email_sent_at
FROM certificates
WHERE email_sent = 1
ORDER BY email_sent_at DESC
LIMIT 10;
```

---

## 🚨 Troubleshooting

### Issue: "Resend API key not configured"

**Solution:** Ensure RESEND_API_KEY is set in Cloudflare Pages secrets or .dev.vars

```bash
# Check if secret exists
npx wrangler pages secret list --project-name passionbots-lms

# Add secret if missing
npx wrangler pages secret put RESEND_API_KEY --project-name passionbots-lms
```

---

### Issue: "Domain not verified"

**Solution:** Complete domain verification in Resend

1. Add DNS records as shown in Resend dashboard
2. Wait 24-48 hours for propagation
3. For testing, use Resend's test domain

---

### Issue: Emails going to spam

**Solution:** 
1. Verify your domain with SPF/DKIM/DMARC
2. Use a professional "from" address
3. Avoid spam trigger words in subject/body
4. Encourage recipients to whitelist your domain

---

### Issue: High bounce rate

**Solution:**
1. Validate email addresses before sending
2. Remove invalid emails from database
3. Use email verification service
4. Clean up bounced emails regularly

---

## 📈 Best Practices

### 1. Collect Valid Emails
- Validate emails during registration
- Use double opt-in for verification
- Regularly clean invalid emails

### 2. Timing
- Send certificates within 24 hours of completion
- Avoid weekends/holidays
- Consider time zones

### 3. Personalization
- Use student's name in subject and body
- Include course-specific details
- Add custom messages for special achievements

### 4. Follow-up
- Send reminder if certificate not downloaded
- Request feedback after 1 week
- Offer support for any issues

### 5. Compliance
- Include unsubscribe link (if required)
- Follow GDPR/CAN-SPAM guidelines
- Store email preferences

---

## 📝 Production Checklist

Before going live with email sending:

- [ ] Domain verified in Resend
- [ ] SPF/DKIM/DMARC records added
- [ ] API key set in Cloudflare secrets
- [ ] Database migration applied
- [ ] Test emails sent and verified
- [ ] Email template reviewed and approved
- [ ] Bounce handling configured
- [ ] Support email set up (support@passionbots.co.in)
- [ ] Email sending limits confirmed
- [ ] Monitoring dashboard set up
- [ ] Backup plan for email failures

---

## 🔗 Useful Links

- **Resend Dashboard:** https://resend.com/dashboard
- **Resend Docs:** https://resend.com/docs
- **API Reference:** https://resend.com/docs/api-reference
- **Domain Setup:** https://resend.com/docs/dashboard/domains/introduction
- **Best Practices:** https://resend.com/docs/knowledge-base/best-practices

---

## 📞 Support

For questions or issues:
- **Technical Support:** support@passionbots.co.in
- **Resend Support:** support@resend.com
- **Documentation:** This file

---

**Last Updated:** January 3, 2026  
**Version:** 1.0  
**Author:** PassionBots Development Team
