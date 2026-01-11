# 📧 Quick Start: Send Certificate Emails

## ⚡ Fast Setup (3 Steps)

### Step 1: Get Resend API Key
```bash
# Go to https://resend.com
# Sign up → API Keys → Create API Key
# Copy the key (starts with "re_...")
```

### Step 2: Add to Cloudflare
```bash
cd /home/user/webapp
npx wrangler pages secret put RESEND_API_KEY --project-name passionbots-lms
# Paste your API key when prompted
```

### Step 3: Send Emails
```bash
cd /home/user/webapp
export RESEND_API_KEY='re_your_api_key_here'
python3 send-certificates-email.py
```

---

## 📊 Current Status

- ✅ **82 certificates** ready to send (IDs 68-149)
- ✅ **All emails** loaded from CSV
- ✅ **Database** updated with email tracking
- ✅ **System** deployed to production
- ⏳ **Waiting for** Resend API key

---

## 📧 What Students Will Get

**Subject:** 🎓 Your IoT & Robotics Webinar Certificate is Ready - [Name]

**Email includes:**
- Personalized greeting
- Certificate code
- View & Download button
- Verify authenticity button
- Instructions
- PassionBots branding

---

## 🧪 Test First

Send a test email to yourself:

```bash
# Login
TOKEN=$(curl -s -X POST 'https://passionbots-lms.pages.dev/api/admin/login' \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.token')

# Send test
curl -X POST 'https://passionbots-lms.pages.dev/api/admin/certificates/68/send-email' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "student_email": "YOUR_EMAIL@example.com",
    "deployment_url": "https://9fd6c386.passionbots-lms.pages.dev"
  }'
```

---

## 📋 Certificate List with Emails

| ID | Student Name | Email |
|----|--------------|-------|
| 68 | Abinaya M | abimohan2123@gmail.com |
| 69 | Rahul Sunil Gupta | professorhulk00@gmail.com |
| 70 | Rahul Gupta | rahulgupta37079@gmail.com |
| 71 | Shaik.Alim | alimeceengg@gmail.com |
| 72 | Maninderjeet Singh | maninderjeetsingh963@gmail.com |
| 73 | Maheshwaram Mukesh Kumar | muke7752@gmail.com |
| ... | (see new_students_raw.csv for full list) | ... |

---

## 🔗 Important Links

- **Production:** https://9fd6c386.passionbots-lms.pages.dev
- **Admin Portal:** https://passionbots-lms.pages.dev/admin
- **Resend Dashboard:** https://resend.com/dashboard
- **Full Guide:** `/home/user/webapp/EMAIL_SYSTEM_GUIDE.md`
- **This Summary:** `/home/user/webapp/EMAIL_SYSTEM_COMPLETE.md`

---

## ❓ Need Help?

**Common issues:**
- "API key not configured" → Set RESEND_API_KEY in Cloudflare secrets
- "Domain not verified" → Use Resend test domain or verify your domain
- "Email bounced" → Check email address validity

**Documentation:**
- Complete guide: `EMAIL_SYSTEM_GUIDE.md`
- Troubleshooting: See guide section on troubleshooting

---

## 🎯 Ready to Go!

Once you have your Resend API key:

1. Add to Cloudflare: `npx wrangler pages secret put RESEND_API_KEY`
2. Run script: `python3 send-certificates-email.py`
3. Watch emails send! ✅

**Estimated time to send 82 emails:** ~5 minutes

---

**Status:** ✅ System ready  
**Next step:** Get Resend API key  
**Deployment:** https://9fd6c386.passionbots-lms.pages.dev  
**GitHub:** https://github.com/rahulgupta37079-oss/lms (commit 83277cc)
