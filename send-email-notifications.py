#!/usr/bin/env python3
"""
Email Notification System for PassionBots IoT & Robotics
Sends welcome emails, class reminders, and certificates
"""
import os
import requests
import json
from datetime import datetime, timedelta

# Configuration
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
FROM_EMAIL = "PassionBots LMS <certificates@passionbots.co.in>"
API_BASE = "https://passionbots-lms.pages.dev"

def send_email_via_resend(to_email, subject, html_content):
    """Send email using Resend API"""
    if not RESEND_API_KEY:
        return {"error": "RESEND_API_KEY not set"}
    
    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "from": FROM_EMAIL,
        "to": [to_email],
        "subject": subject,
        "html": html_content
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        return response.json()
    except Exception as e:
        return {"error": str(e)}

def generate_welcome_email(student_name, student_email, registration_id):
    """Generate welcome email HTML"""
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
                color: #FFD700;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }}
            .content {{
                background: #ffffff;
                padding: 30px;
                border: 2px solid #FFD700;
                border-top: none;
                border-radius: 0 0 10px 10px;
            }}
            .button {{
                display: inline-block;
                background: linear-gradient(90deg, #FFD700 0%, #FFA500 100%);
                color: #000000;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                margin: 20px 0;
            }}
            .info-box {{
                background: #f9f9f9;
                border-left: 4px solid #FFD700;
                padding: 15px;
                margin: 20px 0;
            }}
            .class-item {{
                background: #f5f5f5;
                padding: 15px;
                margin: 10px 0;
                border-radius: 5px;
                border-left: 3px solid #FFD700;
            }}
            .footer {{
                text-align: center;
                color: #666;
                padding: 20px;
                font-size: 12px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🎓 Welcome to PassionBots!</h1>
            <p style="font-size: 18px;">IoT & Robotics Course</p>
        </div>
        
        <div class="content">
            <h2>Hello {student_name}! 👋</h2>
            
            <p>Congratulations on registering for the <strong>PassionBots IoT & Robotics Course</strong>! We're thrilled to have you join our community of tech enthusiasts.</p>
            
            <div class="info-box">
                <strong>📋 Your Registration Details:</strong><br>
                Registration ID: <strong>{registration_id}</strong><br>
                Email: <strong>{student_email}</strong><br>
                Status: <strong style="color: green;">Active ✓</strong>
            </div>
            
            <h3>🚀 Get Started Now!</h3>
            <p>Access your personal dashboard to view live classes, course modules, and track your progress:</p>
            
            <center>
                <a href="{API_BASE}/student-portal" class="button">
                    Access Your Dashboard →
                </a>
            </center>
            
            <h3>📅 Upcoming Live Classes:</h3>
            
            <div class="class-item">
                <strong>📹 Introduction to IoT & Robotics</strong><br>
                Date: January 15, 2026 @ 6:00 PM IST<br>
                Duration: 90 minutes<br>
                Instructor: Dr. Rajesh Kumar
            </div>
            
            <div class="class-item">
                <strong>📹 Arduino Basics - Part 1</strong><br>
                Date: January 17, 2026 @ 6:00 PM IST<br>
                Duration: 120 minutes<br>
                Instructor: Prof. Anita Sharma
            </div>
            
            <div class="class-item">
                <strong>📹 Sensor Integration Workshop</strong><br>
                Date: January 20, 2026 @ 6:00 PM IST<br>
                Duration: 90 minutes<br>
                Instructor: Dr. Vikram Singh
            </div>
            
            <h3>📚 What You'll Learn:</h3>
            <ul>
                <li>✅ Introduction to IoT & Robotics Fundamentals</li>
                <li>✅ Arduino Programming & Circuit Design</li>
                <li>✅ Raspberry Pi & IoT Integration</li>
                <li>✅ Sensors, Actuators & Data Collection</li>
                <li>✅ Wireless Communication (WiFi, Bluetooth, MQTT)</li>
                <li>✅ Robot Assembly & Control Systems</li>
                <li>✅ Hands-on Final Project</li>
            </ul>
            
            <div class="info-box">
                <strong>💡 Pro Tips:</strong>
                <ul style="margin: 10px 0;">
                    <li>Login to your dashboard regularly</li>
                    <li>Mark your calendar for live classes</li>
                    <li>Join classes 5 minutes early</li>
                    <li>Keep your Zoom app updated</li>
                    <li>Participate actively in discussions</li>
                </ul>
            </div>
            
            <h3>📞 Need Help?</h3>
            <p>If you have any questions or need assistance:</p>
            <ul>
                <li>📧 Email: support@passionbots.co.in</li>
                <li>🌐 Visit: <a href="{API_BASE}">{API_BASE}</a></li>
                <li>📚 Documentation available on dashboard</li>
            </ul>
            
            <p><strong>Get ready for an exciting journey into the world of IoT and Robotics!</strong> 🤖✨</p>
            
            <p>Best regards,<br>
            <strong>The PassionBots Team</strong></p>
        </div>
        
        <div class="footer">
            <p>© 2026 PassionBots. All rights reserved.</p>
            <p>You received this email because you registered for our IoT & Robotics Course.</p>
        </div>
    </body>
    </html>
    """
    return html

def generate_class_reminder_email(student_name, class_details):
    """Generate class reminder email HTML"""
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
                color: #FFD700;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }}
            .content {{
                background: #ffffff;
                padding: 30px;
                border: 2px solid #FFD700;
                border-top: none;
                border-radius: 0 0 10px 10px;
            }}
            .button {{
                display: inline-block;
                background: linear-gradient(90deg, #FFD700 0%, #FFA500 100%);
                color: #000000;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                margin: 20px 0;
            }}
            .alert-box {{
                background: #fff3cd;
                border-left: 4px solid #FFD700;
                padding: 20px;
                margin: 20px 0;
                border-radius: 5px;
            }}
            .class-details {{
                background: #f5f5f5;
                padding: 20px;
                border-radius: 5px;
                margin: 20px 0;
            }}
            .footer {{
                text-align: center;
                color: #666;
                padding: 20px;
                font-size: 12px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>⏰ Class Reminder</h1>
            <p style="font-size: 18px;">Your live class starts soon!</p>
        </div>
        
        <div class="content">
            <h2>Hello {student_name}! 👋</h2>
            
            <div class="alert-box">
                <h3 style="margin-top: 0;">🔔 Your class is starting in 24 hours!</h3>
                <p style="margin-bottom: 0;">Don't miss this important session.</p>
            </div>
            
            <div class="class-details">
                <h3 style="margin-top: 0;">📹 Class Details:</h3>
                <p style="font-size: 18px; font-weight: bold; color: #FFD700;">{class_details.get('title', 'Live Class')}</p>
                
                <p><strong>📅 Date:</strong> {class_details.get('date', 'TBD')}</p>
                <p><strong>⏰ Time:</strong> {class_details.get('time', 'TBD')}</p>
                <p><strong>⏱️ Duration:</strong> {class_details.get('duration', '90')} minutes</p>
                <p><strong>👨‍🏫 Instructor:</strong> {class_details.get('instructor', 'TBD')}</p>
            </div>
            
            <h3>🚀 Join the Class:</h3>
            <p>Click the button below to join the Zoom meeting when class starts:</p>
            
            <center>
                <a href="{class_details.get('zoom_url', '#')}" class="button">
                    Join Zoom Meeting →
                </a>
            </center>
            
            <div class="alert-box">
                <strong>💡 Before the Class:</strong>
                <ul style="margin: 10px 0;">
                    <li>✅ Test your Zoom connection</li>
                    <li>✅ Ensure your microphone and camera work</li>
                    <li>✅ Have a notebook ready for notes</li>
                    <li>✅ Join 5 minutes early</li>
                    <li>✅ Keep your study materials handy</li>
                </ul>
            </div>
            
            <h3>📞 Need Help?</h3>
            <p>If you can't join or have technical issues:</p>
            <ul>
                <li>📧 Email: support@passionbots.co.in</li>
                <li>🌐 Dashboard: <a href="{API_BASE}/dashboard">{API_BASE}/dashboard</a></li>
            </ul>
            
            <p>See you in class! 🎓</p>
            
            <p>Best regards,<br>
            <strong>The PassionBots Team</strong></p>
        </div>
        
        <div class="footer">
            <p>© 2026 PassionBots. All rights reserved.</p>
        </div>
    </body>
    </html>
    """
    return html

def send_welcome_emails(students_list=None):
    """Send welcome emails to students"""
    if not students_list:
        # Fetch from API
        response = requests.get(f"{API_BASE}/api/admin/students-list", timeout=10)
        if response.status_code == 200:
            data = response.json()
            students_list = data.get('students', [])
        else:
            print("❌ Failed to fetch students list")
            return
    
    print(f"\n📧 Sending Welcome Emails to {len(students_list)} students")
    print("=" * 70)
    
    results = {"sent": 0, "failed": 0, "details": []}
    
    for student in students_list:
        name = student.get('full_name', 'Student')
        email = student.get('email', '')
        reg_id = student.get('registration_id', 'N/A')
        
        if not email:
            continue
        
        print(f"\n📨 Sending to: {name} ({email})")
        
        subject = f"🎓 Welcome to PassionBots IoT & Robotics Course - {name}"
        html = generate_welcome_email(name, email, reg_id)
        
        result = send_email_via_resend(email, subject, html)
        
        if result.get('id'):
            results["sent"] += 1
            print(f"   ✅ Sent successfully! ID: {result.get('id')}")
            results["details"].append({
                "name": name,
                "email": email,
                "status": "sent",
                "resend_id": result.get('id')
            })
        else:
            results["failed"] += 1
            error = result.get('error', 'Unknown error')
            print(f"   ❌ Failed: {error}")
            results["details"].append({
                "name": name,
                "email": email,
                "status": "failed",
                "error": error
            })
        
        # Rate limiting
        import time
        time.sleep(0.6)
    
    print("\n" + "=" * 70)
    print(f"✅ Sent: {results['sent']}")
    print(f"❌ Failed: {results['failed']}")
    print("=" * 70)
    
    # Save results
    results_file = f"welcome_emails_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"\n💾 Results saved to: {results_file}")
    
    return results

if __name__ == "__main__":
    import sys
    
    print("\n🎓 PassionBots - Email Notification System")
    print("=" * 70)
    
    if not RESEND_API_KEY:
        print("\n❌ ERROR: RESEND_API_KEY environment variable not set!")
        print("\nPlease set it:")
        print("  export RESEND_API_KEY='your-api-key-here'")
        print("\nOr add it to your .env file")
        sys.exit(1)
    
    print("\nOptions:")
    print("  1. Send welcome emails to all students")
    print("  2. Send class reminder emails (24h before)")
    print("  3. Test email (send to one student)")
    print("=" * 70)
    
    if len(sys.argv) < 2:
        print("\nUsage:")
        print("  python3 send-email-notifications.py welcome    # Send welcome emails")
        print("  python3 send-email-notifications.py reminder   # Send class reminders")
        print("  python3 send-email-notifications.py test       # Test with one email")
        sys.exit(1)
    
    action = sys.argv[1].lower()
    
    if action == "welcome":
        send_welcome_emails()
    elif action == "test":
        print("\n🧪 Sending test email...")
        test_student = {
            "full_name": "Demo Student",
            "email": "demo.student@example.com",
            "registration_id": 1
        }
        send_welcome_emails([test_student])
    else:
        print(f"❌ Unknown action: {action}")
