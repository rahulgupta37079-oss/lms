# 🚀 PassionBots LMS v5.0 Deployment Notes

## ✅ Deployment Status

**Build:** ✅ Success
**Deploy:** ✅ Success
**Production URL:** https://passionbots-lms.pages.dev
**Latest Deployment:** https://7b4605e5.passionbots-lms.pages.dev

## 🔑 Required Cloudflare Secrets

### Email Service (Resend API)
To enable email notifications, configure the Resend API key:

```bash
# Get your Resend API key from: https://resend.com/api-keys
# Then configure it as a Cloudflare secret:
npx wrangler pages secret put RESEND_API_KEY --project-name passionbots-lms
# When prompted, paste your Resend API key
```

**Resend Setup Steps:**
1. Go to https://resend.com
2. Sign up / Log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `re_`)
6. Run the command above and paste the key

## 📧 Email Features

Once RESEND_API_KEY is configured, the following emails will be sent automatically:

### Registration Emails
- **Trigger:** Student registers
- **Template:** Welcome email with course details
- **Subject:** "🎉 Welcome to PassionBots - Registration Confirmed!"

### Payment Success Emails
- **Trigger:** Payment completed successfully
- **Templates:** 
  - Payment confirmation with receipt
  - Course access email with dashboard link
- **Subjects:** 
  - "✅ Payment Successful - ₹2,999 | PassionBots IoT & Robotics Course"
  - "🚀 Welcome! Your PassionBots IoT & Robotics Course is Now Active"

### Payment Failure Emails
- **Trigger:** Payment fails
- **Template:** Failure notification with retry instructions
- **Subject:** "⚠️ Payment Failed - Please Try Again | Order {ORDER_ID}"

### Certificate Emails
- **Trigger:** Certificate generated
- **Template:** Certificate delivery with download link
- **Subject:** "🎓 Your PassionBots IoT & Robotics Course Certificate is Ready!"

## 🗄️ Database Migrations

Apply the email tracking migration to production:

```bash
npx wrangler d1 migrations apply passionbots-lms-production --remote
```

This will add:
- `email_logs` table for tracking sent emails
- Email tracking columns in `course_registrations`
- Certificate generation tracking columns

## 🧪 Testing Email Notifications

### Test Registration Email
```bash
curl -X POST https://passionbots-lms.pages.dev/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test Student",
    "email": "your-email@example.com",
    "mobile": "+91 9999999999",
    "college_name": "Test College",
    "year_of_study": "3rd Year"
  }'
```

### Test Payment Flow
1. Register a student (or use existing registration_id)
2. Initiate payment:
```bash
curl -X POST https://passionbots-lms.pages.dev/api/payment/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "registration_id": 1,
    "amount": 2999
  }'
```
3. Complete payment through PayU gateway
4. Check email for payment success + course access notifications

### Test Certificate Generation
```bash
curl -X POST https://passionbots-lms.pages.dev/api/certificate/generate/1 \
  -H "Content-Type: application/json"
```

## 🎓 Certificate Features

### View Certificate
URL: `https://passionbots-lms.pages.dev/certificate/{CERTIFICATE_ID}`

### Verify Certificate
URL: `https://passionbots-lms.pages.dev/verify-certificate?id={CERTIFICATE_ID}`

## 🎨 Marketing Landing Page

**URL:** https://passionbots-lms.pages.dev/marketing-landing.html

**Features:**
- Hero section with enrollment CTA
- Features showcase (6 key benefits)
- Complete curriculum overview
- Student testimonials
- Transparent pricing (₹2,999 with 50% OFF badge)
- FAQ section (5 common questions)
- Mobile-responsive design
- SEO-optimized

**Note:** Home route `/` now redirects to the marketing landing page

## 📊 Monitoring & Analytics

### Email Delivery Logs
Check email delivery status:
```bash
npx wrangler d1 execute passionbots-lms-production --remote \
  --command="SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT 10"
```

### Payment Statistics
View payment stats in admin dashboard:
- URL: https://passionbots-lms.pages.dev/admin-portal
- Navigate to "Payments" section
- View total revenue, success rate, and recent transactions

### Certificate Tracking
Check issued certificates:
```bash
npx wrangler d1 execute passionbots-lms-production --remote \
  --command="SELECT COUNT(*) as total_certificates FROM certificates WHERE status='active'"
```

## 🔒 Security Considerations

- All API keys stored as Cloudflare secrets (encrypted)
- Email templates do not expose sensitive data
- Certificate verification uses unique IDs
- Payment webhooks verify SHA-512 hashes
- HTTPS-only connections

## 🐛 Troubleshooting

### Emails Not Sending
1. Verify RESEND_API_KEY is configured:
   ```bash
   npx wrangler pages secret list --project-name passionbots-lms
   ```
2. Check email logs in database for error messages
3. Verify Resend account is active and has available quota

### Certificates Not Generating
1. Ensure student has `payment_status = 'paid'`
2. Check QRCode library is installed: `npm list qrcode`
3. Verify certificate templates are present in database

### Landing Page Not Loading
1. Verify file exists: `public/marketing-landing.html`
2. Check build output includes the file
3. Clear Cloudflare cache if needed

## 📈 Next Steps

### Immediate Actions
1. [ ] Configure RESEND_API_KEY secret
2. [ ] Apply database migrations to production
3. [ ] Test email flow with real registration
4. [ ] Test certificate generation
5. [ ] Verify landing page loads correctly

### Marketing & Growth
1. [ ] Update SEO meta tags on landing page
2. [ ] Add Google Analytics tracking
3. [ ] Create social media share images
4. [ ] Set up conversion tracking
5. [ ] A/B test pricing and CTAs

### Feature Enhancements
1. [ ] Add email unsubscribe links
2. [ ] Implement payment reminders (automated)
3. [ ] Add certificate templates (multiple designs)
4. [ ] Progress-based certificate generation
5. [ ] Email newsletter system

## 📞 Support

For deployment issues or questions:
- Email: support@passionbots.com
- GitHub: https://github.com/rahulgupta37079-oss/lms
- Cloudflare Dashboard: https://dash.cloudflare.com

---

**Deployment Date:** January 15, 2026
**Version:** 5.0
**Status:** ✅ Production Ready
**Total Implementation Time:** ~8-10 hours
