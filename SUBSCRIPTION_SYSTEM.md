# 💳 Subscription Plans with Razorpay Integration

## ✅ SUBSCRIPTION SYSTEM DEPLOYED

**Production:** https://passionbots-lms.pages.dev  
**Latest Deploy:** https://b7a0f5a1.passionbots-lms.pages.dev  
**GitHub:** https://github.com/rahulgupta37079-oss/lms

---

## 💰 3 MONTHLY SUBSCRIPTION PLANS

### 1. Basic Plan - ₹2,500/month
**Regular Price:** ₹3,000 (16% OFF)

**Features:**
- ✅ Access to K-12 Curriculum
- ✅ Live Zoom Sessions (2 per week)
- ✅ Pre-recorded Video Lessons
- ✅ Email Support
- ✅ Student Dashboard
- ✅ Progress Tracking
- ✅ Basic Resources & Materials

### 2. Standard Plan - ₹4,000/month ⭐ MOST POPULAR
**Regular Price:** ₹5,000 (20% OFF)

**Features:**
- ✨ Everything in Basic Plan
- ✅ Live Zoom Sessions (4 per week)
- ✅ Mentor Chat Support
- ✅ Assignment Submissions
- ✅ Quiz & Tests Access
- ✅ Certificates on Completion
- ✅ Project Templates
- ✅ Priority Support

### 3. Premium Plan - ₹8,000/month
**Regular Price:** ₹10,000 (20% OFF)

**Features:**
- 🔥 Everything in Standard Plan
- ✅ Unlimited Live Sessions
- ✅ 1-on-1 Mentor Sessions (2 per week)
- ✅ Custom Learning Path
- ✅ IoT Kit Included (First Month)
- ✅ Advanced Projects Access
- ✅ Job Placement Assistance
- ✅ 24/7 Priority Support
- ✅ Community Forum Access

---

## 🔐 RAZORPAY INTEGRATION

### Setup Required

**You need to add your Razorpay credentials:**

1. **Get credentials from Razorpay Dashboard:**
   - Login to https://dashboard.razorpay.com/
   - Go to Settings → API Keys
   - Copy **Key ID** and **Key Secret**

2. **For Production (Cloudflare):**
```bash
cd /home/user/webapp
npx wrangler secret put RAZORPAY_KEY_ID
# Enter your key ID when prompted

npx wrangler secret put RAZORPAY_KEY_SECRET
# Enter your key secret when prompted
```

3. **For Local Development:**
   - Create `.dev.vars` file:
```bash
cat > .dev.vars << EOF
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET
EOF
```

---

## 🚀 HOW IT WORKS

### User Flow:

1. **User visits login page**
   - Sees "Subscribe to Premium Plans" button
   - Clicks to view pricing

2. **User selects a plan**
   - Sees 3 plans with features
   - Clicks "Subscribe Now" on chosen plan

3. **Razorpay payment**
   - Payment modal opens
   - User enters card/UPI/net banking details
   - Completes payment

4. **After successful payment:**
   - ✅ Student account created automatically
   - ✅ Random credentials generated
   - ✅ Subscription activated for 30 days
   - ✅ Resources granted based on plan
   - ✅ Customization options enabled
   - ✅ Payment recorded in database

5. **User receives:**
   - Email address (generated)
   - Password (generated)
   - Subscription details
   - Payment confirmation

6. **User can:**
   - Login with new credentials
   - Customize their profile
   - Access all subscribed resources
   - Change password after login

---

## 📁 FILES CREATED

### Frontend:
- **`public/static/app-subscriptions.js`** (15KB)
  - Subscription plans UI
  - Razorpay payment integration
  - Success modal with credentials
  - FAQ section

### Backend:
- **`src/index.tsx`** (Updated)
  - `/api/subscriptions/create-order` - Create Razorpay order
  - `/api/subscriptions/verify-payment` - Verify and activate
  - `/api/subscriptions/:userId` - Get subscription details
  - `/api/subscriptions/cancel` - Cancel subscription

### Database:
- **`migrations/0009_subscriptions.sql`**
  - `subscription_plans` table
  - `subscriptions` table
  - `payment_transactions` table
  - `user_customizations` table
  - `subscription_resources` table

### CSS:
- **`public/static/styles-redesign.css`** (Updated)
  - Pricing card styles
  - Subscription page layout
  - FAQ section styles
  - Success modal styles

---

## 🎨 UI FEATURES

### Pricing Page:
- ✅ 3 pricing cards in responsive grid
- ✅ Yellow/black theme maintained
- ✅ "Most Popular" badge on Standard plan
- ✅ Discount percentages shown
- ✅ Original price crossed out
- ✅ Feature checklist with icons
- ✅ "Subscribe Now" buttons
- ✅ Hover animations
- ✅ FAQ section
- ✅ Money-back guarantee banner

### Success Modal:
- ✅ Generated credentials display
- ✅ Subscription details
- ✅ Payment ID
- ✅ Next steps guide
- ✅ "Go to Login" button
- ✅ Support contact info

---

## 💾 DATABASE SCHEMA

### subscription_plans Table:
```sql
- id, plan_id, plan_name
- price, original_price, duration
- features, is_active
- created_at
```

### subscriptions Table:
```sql
- id, user_id, plan_id, plan_name
- amount, payment_id, order_id, signature
- status, start_date, end_date
- auto_renew, created_at
```

### payment_transactions Table:
```sql
- id, user_id, subscription_id
- razorpay_payment_id, razorpay_order_id
- razorpay_signature, amount, currency
- status, payment_method, payment_date
- created_at
```

### user_customizations Table:
```sql
- id, user_id, theme_color
- dashboard_layout, notification_preferences
- custom_settings, updated_at
```

---

## 🔒 SECURITY FEATURES

1. **Payment Signature Verification**
   - Razorpay signature verified on backend
   - Prevents payment tampering

2. **Secure Credential Generation**
   - Random email: `student{timestamp}@passionbots.in`
   - Random password: 8-character alphanumeric

3. **Transaction Logging**
   - All payments recorded
   - Payment IDs stored
   - Audit trail maintained

4. **API Key Security**
   - Keys stored as environment variables
   - Never exposed to frontend
   - Separate keys for test/live

---

## 🧪 TESTING

### Test the Flow:

1. **Visit:** https://b7a0f5a1.passionbots-lms.pages.dev

2. **Click:** "Subscribe to Premium Plans" button on login page

3. **You'll see:**
   - 3 pricing cards
   - Feature comparisons
   - Subscribe buttons

4. **To test payment:**
   - You need to add YOUR Razorpay credentials
   - Use test mode for testing
   - Razorpay test cards: https://razorpay.com/docs/payments/payments/test-card-details/

---

## ⚠️ IMPORTANT: ADD YOUR RAZORPAY CREDENTIALS

**The system is deployed but needs YOUR credentials to work!**

### Production Setup:
```bash
# Navigate to project
cd /home/user/webapp

# Add Razorpay Key ID
npx wrangler secret put RAZORPAY_KEY_ID --project-name passionbots-lms
# Paste your key ID when prompted

# Add Razorpay Key Secret
npx wrangler secret put RAZORPAY_KEY_SECRET --project-name passionbots-lms
# Paste your key secret when prompted

# Redeploy
npm run build
npx wrangler pages deploy dist --project-name passionbots-lms
```

---

## 🎁 WHAT SUBSCRIBERS GET

### After Payment:
1. **Instant Account Creation**
   - No manual approval needed
   - Credentials generated immediately

2. **Full LMS Access**
   - K-12 Curriculum
   - Live Zoom sessions
   - Progress tracking

3. **Resource Access**
   - Based on subscription plan
   - Automatically granted
   - Visible in dashboard

4. **Customization Options**
   - Theme colors
   - Dashboard layout
   - Notification preferences

5. **30-Day Access**
   - Subscription valid for 1 month
   - Auto-renew option available
   - Can cancel anytime

---

## 📊 ADMIN FEATURES

### View Subscriptions:
```sql
-- See all active subscriptions
SELECT * FROM subscriptions WHERE status = 'active';

-- See payment transactions
SELECT * FROM payment_transactions ORDER BY created_at DESC;

-- See subscription plans
SELECT * FROM subscription_plans;
```

### Cancel Subscription:
```bash
POST /api/subscriptions/cancel
Body: { "userId": 123 }
```

---

## 🔧 CUSTOMIZATION

### Change Plan Prices:
Edit `public/static/app-subscriptions.js`:
```javascript
const SUBSCRIPTION_PLANS = {
  basic: {
    price: 2500,  // Change this
    originalPrice: 3000,  // And this
    ...
  }
}
```

### Change Features:
Edit the `features` array in each plan configuration.

### Change Plan Duration:
Currently set to 30 days. Edit backend SQL:
```sql
datetime('now', '+30 days')  -- Change to '+90 days' for quarterly
```

---

## 📱 RESPONSIVE DESIGN

- ✅ Mobile-friendly pricing cards
- ✅ Touch-optimized buttons
- ✅ Responsive grid layout
- ✅ Mobile payment support

---

## 🆘 TROUBLESHOOTING

### Payment Fails:
1. Check Razorpay credentials
2. Verify test/live mode
3. Check console for errors

### Credentials Not Generated:
1. Check database permissions
2. Verify API endpoint working
3. Check network logs

### Subscription Not Activating:
1. Verify payment signature
2. Check database insertion
3. Review transaction logs

---

## 📞 SUPPORT

**For Subscribers:**
- Email: support@passionbots.in
- Support within LMS dashboard
- Based on plan level

**For Setup Help:**
- Check wrangler logs
- Review console errors
- Verify Razorpay dashboard

---

## ✅ CHECKLIST

Before going live:

- [ ] Add Razorpay Key ID to Cloudflare
- [ ] Add Razorpay Key Secret to Cloudflare
- [ ] Test with Razorpay test cards
- [ ] Verify credentials generation
- [ ] Test subscription activation
- [ ] Verify resource access
- [ ] Enable live mode in Razorpay
- [ ] Update pricing if needed
- [ ] Test on mobile devices
- [ ] Set up email notifications (optional)

---

## 🎉 READY TO USE!

The subscription system is fully deployed with:
- ✅ 3 monthly plans
- ✅ Razorpay payment integration
- ✅ Auto credential generation
- ✅ Subscription management
- ✅ Beautiful pricing UI
- ✅ Yellow/black theme
- ✅ Security features

**Just add your Razorpay credentials and start accepting payments!**

---

**Version:** 1.0  
**Status:** 🟢 DEPLOYED  
**Needs:** ⚠️ Razorpay Credentials
