// ============================================
// PASSIONBOTS LMS - SUBSCRIPTION PLANS
// Razorpay Integration with 3 Monthly Plans
// ============================================

// Subscription Plans Configuration
const SUBSCRIPTION_PLANS = {
  basic: {
    id: 'basic',
    name: 'Basic Plan',
    price: 2500,
    originalPrice: 3000,
    duration: 'Monthly',
    features: [
      'Access to K-12 Curriculum',
      'Live Zoom Sessions (2 per week)',
      'Pre-recorded Video Lessons',
      'Email Support',
      'Student Dashboard',
      'Progress Tracking',
      'Basic Resources & Materials'
    ],
    color: '#FFD700',
    icon: 'rocket',
    recommended: false
  },
  standard: {
    id: 'standard',
    name: 'Standard Plan',
    price: 4000,
    originalPrice: 5000,
    duration: 'Monthly',
    features: [
      '✨ Everything in Basic Plan',
      'Live Zoom Sessions (4 per week)',
      'Mentor Chat Support',
      'Assignment Submissions',
      'Quiz & Tests Access',
      'Certificates on Completion',
      'Project Templates',
      'Priority Support'
    ],
    color: '#FFA500',
    icon: 'star',
    recommended: true
  },
  premium: {
    id: 'premium',
    name: 'Premium Plan',
    price: 8000,
    originalPrice: 10000,
    duration: 'Monthly',
    features: [
      '🔥 Everything in Standard Plan',
      'Unlimited Live Sessions',
      '1-on-1 Mentor Sessions (2 per week)',
      'Custom Learning Path',
      'IoT Kit Included (First Month)',
      'Advanced Projects Access',
      'Job Placement Assistance',
      '24/7 Priority Support',
      'Community Forum Access'
    ],
    color: '#FF8C00',
    icon: 'crown',
    recommended: false
  }
};

// Render Subscription Plans Page
function renderSubscriptionPlans() {
  return `
    <div class="subscription-container">
      <!-- Header -->
      <div class="subscription-header">
        <h1 class="gradient-text" style="font-size: 3rem; font-weight: 900; margin-bottom: 1rem; text-align: center;">
          Choose Your Plan
        </h1>
        <p style="text-align: center; color: var(--text-secondary); font-size: 1.25rem; max-width: 600px; margin: 0 auto 3rem;">
          Start your IoT & Robotics journey today. All plans include full curriculum access!
        </p>
      </div>

      <!-- Pricing Cards -->
      <div class="pricing-grid">
        ${renderPricingCard(SUBSCRIPTION_PLANS.basic)}
        ${renderPricingCard(SUBSCRIPTION_PLANS.standard)}
        ${renderPricingCard(SUBSCRIPTION_PLANS.premium)}
      </div>

      <!-- FAQ Section -->
      <div class="faq-section" style="margin-top: 4rem;">
        <h2 style="text-align: center; margin-bottom: 2rem;">Frequently Asked Questions</h2>
        <div class="faq-grid">
          ${renderFAQ('What happens after I subscribe?', 'You\'ll receive instant access to the LMS with your custom credentials. You can customize your profile and start learning immediately.')}
          ${renderFAQ('Can I cancel anytime?', 'Yes! You can cancel your subscription anytime. You\'ll continue to have access until the end of your billing period.')}
          ${renderFAQ('Do you provide certificates?', 'Yes! Standard and Premium plans include certificates upon course completion.')}
          ${renderFAQ('Is the IoT kit really included?', 'Yes! Premium plan subscribers receive an IoT starter kit in their first month (shipping charges may apply).')}
        </div>
      </div>

      <!-- Money Back Guarantee -->
      <div class="guarantee-banner" style="margin-top: 3rem; text-align: center; padding: 2rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 2px solid var(--border-color);">
        <i class="fas fa-shield-alt" style="font-size: 3rem; color: var(--primary-yellow); margin-bottom: 1rem;"></i>
        <h3 style="margin-bottom: 0.5rem;">7-Day Money Back Guarantee</h3>
        <p style="color: var(--text-secondary); margin: 0;">Not satisfied? Get a full refund within 7 days. No questions asked.</p>
      </div>
    </div>
  `;
}

// Render Individual Pricing Card
function renderPricingCard(plan) {
  const discount = Math.round((1 - plan.price / plan.originalPrice) * 100);
  
  return `
    <div class="pricing-card ${plan.recommended ? 'recommended' : ''}" data-plan="${plan.id}">
      ${plan.recommended ? '<div class="recommended-badge">🌟 Most Popular</div>' : ''}
      
      <!-- Plan Header -->
      <div class="pricing-header" style="text-align: center; padding: 2rem; background: var(--gradient-purple); border-radius: var(--radius-lg) var(--radius-lg) 0 0;">
        <i class="fas fa-${plan.icon}" style="font-size: 3rem; color: var(--text-black); margin-bottom: 1rem;"></i>
        <h3 style="font-size: 1.75rem; font-weight: 800; color: var(--text-black); margin-bottom: 0.5rem;">
          ${plan.name}
        </h3>
        <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
          <span style="font-size: 1rem; color: var(--text-black); text-decoration: line-through; opacity: 0.7;">
            ₹${plan.originalPrice.toLocaleString()}
          </span>
          <span class="badge" style="background: rgba(0,0,0,0.2); color: var(--text-black); font-weight: 700;">
            ${discount}% OFF
          </span>
        </div>
      </div>

      <!-- Pricing -->
      <div class="pricing-amount" style="text-align: center; padding: 2rem; background: var(--bg-card);">
        <div style="font-size: 3.5rem; font-weight: 900; color: var(--primary-yellow); line-height: 1;">
          ₹${plan.price.toLocaleString()}
        </div>
        <div style="color: var(--text-secondary); margin-top: 0.5rem;">
          per month
        </div>
      </div>

      <!-- Features -->
      <div class="pricing-features" style="padding: 2rem; background: var(--bg-card);">
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${plan.features.map(feature => `
            <li style="padding: 0.75rem 0; display: flex; align-items: flex-start; gap: 0.75rem; border-bottom: 1px solid var(--border-color);">
              <i class="fas fa-check-circle" style="color: var(--primary-yellow); margin-top: 0.25rem; flex-shrink: 0;"></i>
              <span style="color: var(--text-primary);">${feature}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <!-- CTA Button -->
      <div style="padding: 2rem; background: var(--bg-card); border-radius: 0 0 var(--radius-lg) var(--radius-lg);">
        <button onclick="initiatePurchase('${plan.id}')" class="btn btn-primary" style="width: 100%; font-size: 1.125rem; padding: 1rem;">
          <i class="fas fa-shopping-cart"></i> Subscribe Now
        </button>
        <p style="text-align: center; font-size: 0.875rem; color: var(--text-muted); margin-top: 1rem; margin-bottom: 0;">
          Secure payment via Razorpay
        </p>
      </div>
    </div>
  `;
}

// Render FAQ Item
function renderFAQ(question, answer) {
  return `
    <div class="faq-item" style="background: var(--bg-card); padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
      <h4 style="color: var(--primary-yellow); margin-bottom: 0.75rem; font-size: 1.125rem;">
        <i class="fas fa-question-circle"></i> ${question}
      </h4>
      <p style="color: var(--text-secondary); margin: 0; line-height: 1.6;">
        ${answer}
      </p>
    </div>
  `;
}

// Initialize Razorpay Payment
async function initiatePurchase(planId) {
  const plan = SUBSCRIPTION_PLANS[planId];
  
  if (!plan) {
    alert('Invalid plan selected');
    return;
  }

  // Show confirmation
  const confirmed = confirm(
    `🚀 Subscribe to ${plan.name}?\n\n` +
    `💰 Amount: ₹${plan.price}\n` +
    `📅 Duration: ${plan.duration}\n\n` +
    `You'll get instant access to:\n` +
    plan.features.slice(0, 3).join('\n') +
    `\n\n✅ Proceed to payment?`
  );

  if (!confirmed) return;

  try {
    // Create order on backend
    const orderResponse = await fetch('/api/subscriptions/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId: plan.id,
        planName: plan.name,
        amount: plan.price
      })
    });

    const orderData = await orderResponse.json();

    if (!orderData.success) {
      throw new Error(orderData.error || 'Failed to create order');
    }

    // Initialize Razorpay
    const options = {
      key: orderData.razorpay_key, // Get from backend
      amount: plan.price * 100, // Amount in paise
      currency: 'INR',
      name: 'PassionBots LMS',
      description: `${plan.name} - Monthly Subscription`,
      image: '/static/logo.png',
      order_id: orderData.order_id,
      handler: function (response) {
        handlePaymentSuccess(response, plan);
      },
      prefill: {
        name: '',
        email: '',
        contact: ''
      },
      notes: {
        plan_id: plan.id,
        plan_name: plan.name
      },
      theme: {
        color: '#FFD700'
      },
      modal: {
        ondismiss: function() {
          console.log('Payment cancelled by user');
        }
      }
    };

    const razorpay = new Razorpay(options);
    razorpay.open();

  } catch (error) {
    console.error('Payment initiation error:', error);
    alert('❌ Failed to initiate payment. Please try again or contact support.');
  }
}

// Handle Successful Payment
async function handlePaymentSuccess(response, plan) {
  try {
    // Verify payment on backend
    const verifyResponse = await fetch('/api/subscriptions/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
        plan_id: plan.id
      })
    });

    const verifyData = await verifyResponse.json();

    if (!verifyData.success) {
      throw new Error('Payment verification failed');
    }

    // Show success message with credentials
    showSubscriptionSuccess(verifyData);

  } catch (error) {
    console.error('Payment verification error:', error);
    alert('❌ Payment verification failed. Please contact support with your payment ID: ' + response.razorpay_payment_id);
  }
}

// Show Subscription Success Modal
function showSubscriptionSuccess(data) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal" style="max-width: 600px;">
      <div style="text-align: center; padding: 2rem;">
        <div style="font-size: 5rem; margin-bottom: 1rem;">🎉</div>
        <h2 style="color: var(--primary-yellow); margin-bottom: 1rem;">
          Subscription Activated!
        </h2>
        <p style="color: var(--text-secondary); font-size: 1.125rem; margin-bottom: 2rem;">
          Welcome to PassionBots LMS! Your account has been created.
        </p>

        <!-- Credentials Box -->
        <div style="background: var(--bg-secondary); padding: 2rem; border-radius: var(--radius-lg); border: 2px solid var(--primary-yellow); margin-bottom: 2rem;">
          <h3 style="color: var(--primary-yellow); margin-bottom: 1rem;">
            🔑 Your Login Credentials
          </h3>
          <div style="background: var(--bg-card); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem; text-align: left;">
            <div style="margin-bottom: 0.5rem;">
              <strong style="color: var(--text-secondary);">Email:</strong>
              <div style="color: var(--text-primary); font-family: monospace; font-size: 1.125rem; margin-top: 0.25rem;">
                ${data.credentials.email}
              </div>
            </div>
            <div>
              <strong style="color: var(--text-secondary);">Password:</strong>
              <div style="color: var(--text-primary); font-family: monospace; font-size: 1.125rem; margin-top: 0.25rem;">
                ${data.credentials.password}
              </div>
            </div>
          </div>
          <p style="font-size: 0.875rem; color: var(--text-muted); margin: 0;">
            ⚠️ Please save these credentials. You can change your password after logging in.
          </p>
        </div>

        <!-- Subscription Details -->
        <div style="background: var(--bg-card); padding: 1.5rem; border-radius: var(--radius-md); margin-bottom: 2rem; text-align: left;">
          <h4 style="margin-bottom: 1rem;">📋 Subscription Details</h4>
          <div style="display: grid; gap: 0.75rem; font-size: 0.95rem;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Plan:</span>
              <span style="color: var(--text-primary); font-weight: 600;">${data.subscription.plan_name}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Amount Paid:</span>
              <span style="color: var(--primary-yellow); font-weight: 600;">₹${data.subscription.amount.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Valid Until:</span>
              <span style="color: var(--text-primary); font-weight: 600;">${new Date(data.subscription.valid_until).toLocaleDateString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Payment ID:</span>
              <span style="color: var(--text-primary); font-family: monospace; font-size: 0.85rem;">${data.subscription.payment_id}</span>
            </div>
          </div>
        </div>

        <!-- Next Steps -->
        <div style="text-align: left; margin-bottom: 2rem;">
          <h4 style="margin-bottom: 1rem;">🚀 Next Steps:</h4>
          <ol style="color: var(--text-secondary); line-height: 1.8; padding-left: 1.5rem;">
            <li>Login with your credentials</li>
            <li>Complete your profile customization</li>
            <li>Browse the K-12 curriculum</li>
            <li>Join your first live session</li>
            <li>Start learning!</li>
          </ol>
        </div>

        <!-- CTA Button -->
        <button onclick="window.location.href='/'; this.closest('.modal-overlay').remove();" class="btn btn-primary" style="width: 100%; font-size: 1.125rem;">
          <i class="fas fa-sign-in-alt"></i> Go to Login
        </button>

        <!-- Support Info -->
        <p style="margin-top: 1.5rem; font-size: 0.875rem; color: var(--text-muted);">
          Need help? Contact us at <a href="mailto:support@passionbots.in" style="color: var(--primary-yellow);">support@passionbots.in</a>
        </p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Add to navigation
window.showSubscriptionPlans = function() {
  AppState.currentView = 'subscriptions';
  document.getElementById('app').innerHTML = renderSubscriptionPlans();
};

console.log('✅ Subscription Plans Loaded: 3 Tiers with Razorpay Integration');
