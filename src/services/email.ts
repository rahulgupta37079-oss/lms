/**
 * Email Service using Resend API
 * Handles all email notifications for PassionBots LMS
 */

import { Resend } from 'resend'

interface EmailConfig {
  resendApiKey: string
  fromEmail?: string
  fromName?: string
}

interface SendEmailParams {
  to: string
  subject: string
  html: string
  replyTo?: string
}

export class EmailService {
  private resend: Resend
  private fromEmail: string
  private fromName: string

  constructor(config: EmailConfig) {
    this.resend = new Resend(config.resendApiKey)
    this.fromEmail = config.fromEmail || 'noreply@passionbots.com'
    this.fromName = config.fromName || 'PassionBots LMS'
  }

  async sendEmail(params: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const result = await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: params.to,
        subject: params.subject,
        html: params.html,
        replyTo: params.replyTo
      })

      if (result.error) {
        console.error('Email send error:', result.error)
        return { success: false, error: result.error.message }
      }

      return { success: true, messageId: result.data?.id }
    } catch (error: any) {
      console.error('Email service error:', error)
      return { success: false, error: error.message }
    }
  }

  // Registration Confirmation Email
  async sendRegistrationConfirmation(
    email: string,
    studentName: string,
    registrationId: number,
    courseName: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .info-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
    .footer { text-align: center; color: #888; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to PassionBots LMS!</h1>
    </div>
    <div class="content">
      <p>Dear <strong>${studentName}</strong>,</p>
      
      <p>Congratulations! Your registration for <strong>${courseName}</strong> has been successfully completed.</p>
      
      <div class="info-box">
        <strong>Registration Details:</strong><br>
        Registration ID: <strong>#${registrationId}</strong><br>
        Course: <strong>${courseName}</strong><br>
        Email: <strong>${email}</strong>
      </div>
      
      <p><strong>Next Steps:</strong></p>
      <ol>
        <li>Complete your payment to unlock course access</li>
        <li>Access your personalized student dashboard</li>
        <li>Join live classes and interactive sessions</li>
        <li>Download course materials and resources</li>
      </ol>
      
      <center>
        <a href="https://passionbots-lms.pages.dev/student-portal" class="button">
          Login to Your Dashboard
        </a>
      </center>
      
      <p><strong>Need Help?</strong><br>
      Our support team is here for you! Reply to this email or contact us at support@passionbots.com</p>
      
      <p>Best regards,<br>
      <strong>Team PassionBots</strong></p>
    </div>
    <div class="footer">
      <p>PassionBots LMS - Empowering Innovation Through IoT & Robotics</p>
      <p>© 2026 PassionBots. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `

    return this.sendEmail({
      to: email,
      subject: `🎉 Welcome to PassionBots - Registration Confirmed!`,
      html,
      replyTo: 'support@passionbots.com'
    })
  }

  // Payment Success Email
  async sendPaymentSuccess(
    email: string,
    studentName: string,
    orderId: string,
    amount: number,
    txnId: string,
    courseName: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .success-badge { background: #4caf50; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 15px 0; }
    .info-box { background: white; padding: 15px; border-left: 4px solid #4caf50; margin: 20px 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; color: #888; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Payment Successful!</h1>
    </div>
    <div class="content">
      <p>Dear <strong>${studentName}</strong>,</p>
      
      <center>
        <div class="success-badge">✓ PAYMENT CONFIRMED</div>
      </center>
      
      <p>Your payment has been successfully processed! You now have full access to the <strong>${courseName}</strong>.</p>
      
      <div class="info-box">
        <strong>Payment Receipt:</strong><br>
        Order ID: <strong>${orderId}</strong><br>
        Transaction ID: <strong>${txnId}</strong><br>
        Amount Paid: <strong>₹${amount}</strong><br>
        Status: <strong>SUCCESS</strong>
      </div>
      
      <p><strong>You Can Now:</strong></p>
      <ul>
        <li>✅ Access all course modules and materials</li>
        <li>✅ Join live classes and recorded sessions</li>
        <li>✅ Participate in hands-on projects</li>
        <li>✅ Get mentorship and doubt clearing</li>
        <li>✅ Earn your course completion certificate</li>
      </ul>
      
      <center>
        <a href="https://passionbots-lms.pages.dev/dashboard" class="button">
          Access Your Course Now
        </a>
      </center>
      
      <p><strong>Important:</strong> Save this email as your payment receipt. You can also download the receipt from your student dashboard.</p>
      
      <p>Best regards,<br>
      <strong>Team PassionBots</strong></p>
    </div>
    <div class="footer">
      <p>PassionBots LMS - Empowering Innovation Through IoT & Robotics</p>
      <p>© 2026 PassionBots. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `

    return this.sendEmail({
      to: email,
      subject: `✅ Payment Successful - ₹${amount} | ${courseName}`,
      html,
      replyTo: 'billing@passionbots.com'
    })
  }

  // Payment Failure Email
  async sendPaymentFailure(
    email: string,
    studentName: string,
    orderId: string,
    amount: number,
    reason: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .warning-badge { background: #ff9800; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 15px 0; }
    .info-box { background: white; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; color: #888; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Payment Failed</h1>
    </div>
    <div class="content">
      <p>Dear <strong>${studentName}</strong>,</p>
      
      <center>
        <div class="warning-badge">⚠ PAYMENT UNSUCCESSFUL</div>
      </center>
      
      <p>We were unable to process your payment. Please don't worry - no amount has been deducted from your account.</p>
      
      <div class="info-box">
        <strong>Transaction Details:</strong><br>
        Order ID: <strong>${orderId}</strong><br>
        Amount: <strong>₹${amount}</strong><br>
        Reason: <strong>${reason}</strong>
      </div>
      
      <p><strong>Common Reasons for Payment Failure:</strong></p>
      <ul>
        <li>Insufficient balance in account</li>
        <li>Incorrect card details or CVV</li>
        <li>Card expired or blocked</li>
        <li>Network/connectivity issues</li>
        <li>Bank declined the transaction</li>
      </ul>
      
      <p><strong>What You Can Do:</strong></p>
      <ol>
        <li>Check your account balance and card details</li>
        <li>Try using a different payment method</li>
        <li>Contact your bank if the issue persists</li>
        <li>Try again after some time</li>
      </ol>
      
      <center>
        <a href="https://passionbots-lms.pages.dev/dashboard" class="button">
          Try Payment Again
        </a>
      </center>
      
      <p><strong>Need Help?</strong><br>
      Contact our support team at support@passionbots.com or WhatsApp us at +91-XXXXXXXXXX</p>
      
      <p>Best regards,<br>
      <strong>Team PassionBots</strong></p>
    </div>
    <div class="footer">
      <p>PassionBots LMS - Empowering Innovation Through IoT & Robotics</p>
      <p>© 2026 PassionBots. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `

    return this.sendEmail({
      to: email,
      subject: `⚠️ Payment Failed - Please Try Again | Order ${orderId}`,
      html,
      replyTo: 'support@passionbots.com'
    })
  }

  // Course Access Email (sent after payment)
  async sendCourseAccess(
    email: string,
    studentName: string,
    courseName: string,
    dashboardUrl: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .feature-box { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea; }
    .footer { text-align: center; color: #888; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 Your Course is Ready!</h1>
    </div>
    <div class="content">
      <p>Dear <strong>${studentName}</strong>,</p>
      
      <p>Congratulations! You now have full access to <strong>${courseName}</strong>. Let's start your learning journey!</p>
      
      <div class="feature-box">
        <h3>📚 What's Inside:</h3>
        <ul>
          <li>✅ 50+ hours of hands-on training</li>
          <li>✅ Live interactive classes with mentors</li>
          <li>✅ Industry-standard projects and assignments</li>
          <li>✅ Lifetime access to course materials</li>
          <li>✅ Certificate upon completion</li>
        </ul>
      </div>
      
      <div class="feature-box">
        <h3>🎯 Quick Start Guide:</h3>
        <ol>
          <li>Login to your dashboard</li>
          <li>Complete your profile setup</li>
          <li>Check the upcoming live classes schedule</li>
          <li>Start with Module 1: Introduction</li>
          <li>Join our student community group</li>
        </ol>
      </div>
      
      <center>
        <a href="${dashboardUrl}" class="button">
          Start Learning Now
        </a>
      </center>
      
      <p><strong>Pro Tips:</strong></p>
      <ul>
        <li>🔔 Enable notifications for live class reminders</li>
        <li>📝 Take notes and ask questions during sessions</li>
        <li>🤝 Connect with fellow students in the community</li>
        <li>💪 Practice regularly to master the concepts</li>
      </ul>
      
      <p>We're excited to have you on board! Let's build amazing things together.</p>
      
      <p>Best regards,<br>
      <strong>Team PassionBots</strong></p>
    </div>
    <div class="footer">
      <p>PassionBots LMS - Empowering Innovation Through IoT & Robotics</p>
      <p>© 2026 PassionBots. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `

    return this.sendEmail({
      to: email,
      subject: `🚀 Welcome! Your ${courseName} is Now Active`,
      html,
      replyTo: 'support@passionbots.com'
    })
  }

  // Payment Reminder Email (for pending payments)
  async sendPaymentReminder(
    email: string,
    studentName: string,
    courseName: string,
    amount: number,
    daysRemaining: number
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .reminder-badge { background: #ff9800; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 15px 0; font-size: 18px; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 16px; }
    .info-box { background: white; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0; }
    .footer { text-align: center; color: #888; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Payment Reminder</h1>
    </div>
    <div class="content">
      <p>Dear <strong>${studentName}</strong>,</p>
      
      <center>
        <div class="reminder-badge">⏰ ${daysRemaining} Days Remaining</div>
      </center>
      
      <p>This is a friendly reminder to complete your payment for <strong>${courseName}</strong>.</p>
      
      <div class="info-box">
        <strong>Course Details:</strong><br>
        Course: <strong>${courseName}</strong><br>
        Amount: <strong>₹${amount}</strong><br>
        Status: <strong>Payment Pending</strong>
      </div>
      
      <p><strong>Why Complete Payment Now?</strong></p>
      <ul>
        <li>🚀 Get instant access to all course materials</li>
        <li>📚 Don't miss upcoming live classes</li>
        <li>🎯 Secure your seat in the batch</li>
        <li>🏆 Start your journey towards certification</li>
      </ul>
      
      <center>
        <a href="https://passionbots-lms.pages.dev/dashboard" class="button">
          Complete Payment Now
        </a>
      </center>
      
      <p><strong>Need Help?</strong><br>
      If you have any questions or face any issues with payment, our support team is here to help!</p>
      
      <p>Email: support@passionbots.com<br>
      Phone: +91-XXXXXXXXXX</p>
      
      <p>Best regards,<br>
      <strong>Team PassionBots</strong></p>
    </div>
    <div class="footer">
      <p>PassionBots LMS - Empowering Innovation Through IoT & Robotics</p>
      <p>© 2026 PassionBots. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `

    return this.sendEmail({
      to: email,
      subject: `⏰ Reminder: Complete Your Payment for ${courseName}`,
      html,
      replyTo: 'support@passionbots.com'
    })
  }

  // Certificate Delivery Email
  async sendCertificate(
    email: string,
    studentName: string,
    courseName: string,
    certificateUrl: string,
    verificationCode: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #333; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .certificate-badge { background: #4caf50; color: white; padding: 15px 30px; border-radius: 25px; display: inline-block; margin: 15px 0; font-size: 20px; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 16px; }
    .info-box { background: white; padding: 15px; border-left: 4px solid #ffd700; margin: 20px 0; }
    .verification-code { font-family: monospace; font-size: 18px; background: #fff3cd; padding: 10px; border-radius: 5px; text-align: center; margin: 15px 0; }
    .footer { text-align: center; color: #888; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 Congratulations!</h1>
      <p style="font-size: 18px; margin: 10px 0;">You've earned your certificate!</p>
    </div>
    <div class="content">
      <p>Dear <strong>${studentName}</strong>,</p>
      
      <center>
        <div class="certificate-badge">🏆 CERTIFICATE EARNED</div>
      </center>
      
      <p>Congratulations on successfully completing <strong>${courseName}</strong>! We're proud of your dedication and hard work.</p>
      
      <div class="info-box">
        <strong>Certificate Details:</strong><br>
        Student: <strong>${studentName}</strong><br>
        Course: <strong>${courseName}</strong><br>
        Verification Code: <div class="verification-code">${verificationCode}</div>
      </div>
      
      <center>
        <a href="${certificateUrl}" class="button">
          📥 Download Certificate
        </a>
      </center>
      
      <p><strong>Share Your Achievement:</strong></p>
      <ul>
        <li>📱 Add to LinkedIn Profile</li>
        <li>🐦 Share on social media with #PassionBots</li>
        <li>📧 Share with your network</li>
        <li>🖼️ Print and frame it!</li>
      </ul>
      
      <p><strong>Verify Your Certificate:</strong><br>
      Anyone can verify your certificate authenticity by scanning the QR code or entering the verification code at:<br>
      <a href="https://passionbots-lms.pages.dev/verify-certificate">https://passionbots-lms.pages.dev/verify-certificate</a></p>
      
      <p><strong>What's Next?</strong></p>
      <ul>
        <li>🚀 Explore our advanced courses</li>
        <li>💼 Join our alumni network</li>
        <li>🤝 Become a student mentor</li>
        <li>📚 Continue learning with us</li>
      </ul>
      
      <p>Thank you for choosing PassionBots! We wish you all the best in your career journey.</p>
      
      <p>Best regards,<br>
      <strong>Team PassionBots</strong></p>
    </div>
    <div class="footer">
      <p>PassionBots LMS - Empowering Innovation Through IoT & Robotics</p>
      <p>© 2026 PassionBots. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `

    return this.sendEmail({
      to: email,
      subject: `🎓 Your ${courseName} Certificate is Ready!`,
      html,
      replyTo: 'certificates@passionbots.com'
    })
  }
}

export default EmailService
