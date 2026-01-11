#!/usr/bin/env python3
"""
Certificate Email Sender using Resend API
Sends certificates to all students in the latest batch
"""

import json
import requests
import sys
import os
import time
from datetime import datetime

# Configuration
API_BASE = "https://passionbots-lms.pages.dev"
DEPLOYMENT_URL = "https://04437b44.passionbots-lms.pages.dev"  # Latest deployment
RESEND_API_KEY = os.getenv('RESEND_API_KEY', '')  # Set via: export RESEND_API_KEY=re_...

# Email configuration
FROM_EMAIL = "certificates@passionbots.co.in"  # Update with your verified domain
FROM_NAME = "PassionBots LMS"
SUBJECT_TEMPLATE = "🎓 Your IoT & Robotics Certificate is Ready - {student_name}"

# Admin credentials
ADMIN_USER = "admin"
ADMIN_PASS = "admin123"

def login():
    """Login to admin API and get session token"""
    print("🔐 Logging in to admin API...")
    response = requests.post(f"{API_BASE}/api/admin/login", json={
        "username": ADMIN_USER,
        "password": ADMIN_PASS
    })
    
    if response.status_code != 200:
        print(f"❌ Login failed: {response.status_code}")
        sys.exit(1)
    
    data = response.json()
    token = data.get('session_token') or data.get('token')
    if not token:
        print(f"❌ No token in response: {data}")
        sys.exit(1)
    print(f"✅ Login successful! Token: {token[:20]}...")
    return token

def get_certificates(token, start_id=68):
    """Get all certificates from the database"""
    print(f"\n📋 Fetching certificates (ID >= {start_id})...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(f"{API_BASE}/api/admin/certificates/list", headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Failed to fetch certificates: {response.status_code}")
        sys.exit(1)
    
    data = response.json()
    certificates = data.get('certificates', [])
    
    # Filter certificates >= start_id
    filtered = [cert for cert in certificates if cert.get('certificate_id', 0) >= start_id]
    
    print(f"✅ Found {len(filtered)} certificates to send (total in DB: {len(certificates)})")
    return filtered

def create_email_html(student_name, course_name, certificate_code, view_url, verify_url):
    """Create HTML email content"""
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Certificate is Ready</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffd700; font-size: 28px; font-weight: bold;">🎓 Congratulations!</h1>
                            <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px;">Your certificate is ready</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Dear <strong>{student_name}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Congratulations on successfully completing the <strong>{course_name}</strong>! 🎉
                            </p>
                            
                            <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Your certificate is now available for download. This certificate validates your participation and achievement in our program.
                            </p>
                            
                            <!-- Certificate Info Box -->
                            <table role="presentation" style="width: 100%; background-color: #f8f9fa; border-left: 4px solid #ffd700; border-radius: 4px; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">
                                            <strong>Certificate Code:</strong><br>
                                            <span style="font-family: monospace; color: #333333; font-size: 16px;">{certificate_code}</span>
                                        </p>
                                        <p style="margin: 0; color: #666666; font-size: 14px;">
                                            <strong>Course:</strong> {course_name}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Buttons -->
                            <table role="presentation" style="width: 100%; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 10px 0;">
                                        <a href="{view_url}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #1a1a1a; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(255, 215, 0, 0.3);">
                                            📄 View & Download Certificate
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0;">
                                        <a href="{verify_url}" style="display: inline-block; padding: 12px 24px; background-color: #ffffff; color: #333333; text-decoration: none; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 14px;">
                                            🔍 Verify Certificate Authenticity
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Instructions -->
                            <div style="background-color: #e8f4f8; border-left: 4px solid #0066cc; padding: 15px; border-radius: 4px; margin-bottom: 30px;">
                                <p style="margin: 0 0 10px; color: #0066cc; font-weight: bold; font-size: 14px;">📌 How to Use Your Certificate:</p>
                                <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 14px; line-height: 1.6;">
                                    <li>Click "View & Download Certificate" to open your certificate</li>
                                    <li>Click the yellow "Download PDF" button on the certificate page</li>
                                    <li>Share the verification link with employers or institutions</li>
                                    <li>Keep your certificate code safe for future verification</li>
                                </ul>
                            </div>
                            
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                We're proud of your achievement and wish you continued success in your IoT and Robotics journey!
                            </p>
                            
                            <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                                Best regards,<br>
                                <strong>The PassionBots Team</strong>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">
                                PassionBots - Empowering Tomorrow's Tech Leaders
                            </p>
                            <p style="margin: 0 0 10px; color: #999999; font-size: 12px;">
                                IoT, Robotics & Embedded Systems Training
                            </p>
                            <p style="margin: 0; color: #999999; font-size: 12px;">
                                <a href="https://passionbots.co.in" style="color: #0066cc; text-decoration: none;">www.passionbots.co.in</a>
                            </p>
                        </td>
                    </tr>
                </table>
                
                <!-- Email Footer -->
                <table role="presentation" style="width: 600px; margin: 20px auto;">
                    <tr>
                        <td style="text-align: center; color: #999999; font-size: 12px; line-height: 1.6;">
                            <p style="margin: 0;">
                                This is an automated email. Please do not reply to this message.
                            </p>
                            <p style="margin: 10px 0 0;">
                                If you have questions, contact us at support@passionbots.co.in
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""

def send_email_resend(to_email, to_name, subject, html_content):
    """Send email using Resend API"""
    
    if not RESEND_API_KEY:
        print(f"⚠️  RESEND_API_KEY not set, skipping email to {to_email}")
        return {"success": False, "error": "No API key"}
    
    url = "https://api.resend.com/emails"
    
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "from": f"{FROM_NAME} <{FROM_EMAIL}>",
        "to": [to_email],
        "subject": subject,
        "html": html_content
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        
        if response.status_code in [200, 201]:
            data = response.json()
            return {"success": True, "id": data.get('id')}
        else:
            error_msg = response.text
            return {"success": False, "error": error_msg, "status": response.status_code}
            
    except Exception as e:
        return {"success": False, "error": str(e)}

def main():
    print("=" * 60)
    print("📧 Certificate Email Sender - Resend API")
    print("=" * 60)
    
    # Check for Resend API key
    if not RESEND_API_KEY:
        print("\n❌ ERROR: RESEND_API_KEY environment variable not set!")
        print("\n📝 To set your Resend API key:")
        print("   export RESEND_API_KEY='re_your_api_key_here'")
        print("\n🔑 Get your API key from: https://resend.com/api-keys")
        print("\n⚠️  Running in DRY RUN mode (no emails will be sent)")
        print("\n" + "=" * 60)
    
    # Login
    token = login()
    
    # Get certificates (IDs 68-149 from latest batch)
    certificates = get_certificates(token, start_id=68)
    
    # Send emails
    print(f"\n📧 Sending {len(certificates)} emails...")
    print("=" * 60)
    
    results = {
        "sent": 0,
        "failed": 0,
        "skipped": 0,
        "details": []
    }
    
    for i, cert in enumerate(certificates, 1):
        cert_id = cert.get('certificate_id')
        student_name = cert.get('student_name', 'Student')
        student_email = cert.get('student_email')
        course_name = cert.get('course_name', 'IoT & Robotics Webinar')
        cert_code = cert.get('certificate_code', 'N/A')
        
        # Skip if no email
        if not student_email or student_email == 'N/A' or '@' not in student_email:
            print(f"{i}. ⚠️  {student_name} - No valid email, skipping")
            results['skipped'] += 1
            results['details'].append({
                "name": student_name,
                "status": "skipped",
                "reason": "No valid email"
            })
            continue
        
        # Generate URLs
        view_url = f"{DEPLOYMENT_URL}/api/certificates/{cert_id}/view"
        verify_url = f"{DEPLOYMENT_URL}/verify/{cert_code}"
        
        # Create email content
        subject = SUBJECT_TEMPLATE.format(student_name=student_name)
        html_content = create_email_html(student_name, course_name, cert_code, view_url, verify_url)
        
        # Send email
        print(f"{i}. 📤 Sending to {student_name} ({student_email})...", end=" ")
        
        result = send_email_resend(student_email, student_name, subject, html_content)
        
        if result['success']:
            print(f"✅ Sent! (ID: {result.get('id', 'N/A')})")
            results['sent'] += 1
            results['details'].append({
                "name": student_name,
                "email": student_email,
                "status": "sent",
                "resend_id": result.get('id')
            })
            # Rate limit: 2 requests per second = 0.5s delay
            time.sleep(0.6)
        else:
            print(f"❌ Failed: {result.get('error', 'Unknown error')}")
            results['failed'] += 1
            results['details'].append({
                "name": student_name,
                "email": student_email,
                "status": "failed",
                "error": result.get('error')
            })
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Email Sending Summary")
    print("=" * 60)
    print(f"✅ Sent:    {results['sent']}")
    print(f"❌ Failed:  {results['failed']}")
    print(f"⚠️  Skipped: {results['skipped']}")
    print(f"📋 Total:   {len(certificates)}")
    print("=" * 60)
    
    # Save results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = f"email_results_{timestamp}.json"
    
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n💾 Results saved to: {output_file}")
    
    return 0 if results['failed'] == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
