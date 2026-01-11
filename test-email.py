#!/usr/bin/env python3
"""
Test email sending with one certificate
"""

import requests
import json

# Configuration
API_BASE = "https://passionbots-lms.pages.dev"
DEPLOYMENT_URL = "https://81ba0408.passionbots-lms.pages.dev"
ADMIN_USER = "admin"
ADMIN_PASS = "admin123"

def test_email():
    print("🧪 Testing Email System")
    print("=" * 60)
    
    # Login
    print("\n1. Logging in...")
    response = requests.post(f"{API_BASE}/api/admin/login", json={
        "username": ADMIN_USER,
        "password": ADMIN_PASS
    })
    
    if response.status_code != 200:
        print(f"❌ Login failed: {response.status_code}")
        return
    
    token = response.json().get('token')
    print(f"✅ Login successful!")
    
    # Get first certificate
    print("\n2. Fetching certificate...")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(f"{API_BASE}/api/admin/certificates/list", headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Failed to fetch certificates: {response.status_code}")
        return
    
    certificates = response.json().get('certificates', [])
    
    if not certificates:
        print("❌ No certificates found")
        return
    
    # Find certificate with email
    test_cert = None
    for cert in certificates:
        if cert.get('certificate_id') >= 68:  # New batch
            test_cert = cert
            break
    
    if not test_cert:
        print("❌ No certificate found in new batch (ID >= 68)")
        return
    
    cert_id = test_cert.get('certificate_id')
    student_name = test_cert.get('student_name')
    cert_code = test_cert.get('certificate_code')
    
    print(f"✅ Found certificate:")
    print(f"   ID: {cert_id}")
    print(f"   Student: {student_name}")
    print(f"   Code: {cert_code}")
    
    # Check if certificate has email in database
    print("\n3. Checking email address...")
    print("   Note: Email should be loaded from CSV during certificate generation")
    print("   If email is missing, run: python3 generate-email-updates.py && apply SQL")
    
    # For now, let's use a test email
    test_email = input("\nEnter test email address (or press Enter to skip): ").strip()
    
    if not test_email:
        print("\n⏭️  Skipping email test")
        print("\n✅ System is ready! To send emails:")
        print("   1. Ensure RESEND_API_KEY is set in Cloudflare")
        print("   2. Run: python3 send-certificates-email.py")
        return
    
    # Send test email
    print(f"\n4. Sending test email to {test_email}...")
    
    payload = {
        "student_email": test_email,
        "deployment_url": DEPLOYMENT_URL
    }
    
    response = requests.post(
        f"{API_BASE}/api/admin/certificates/{cert_id}/send-email",
        json=payload,
        headers=headers
    )
    
    print(f"\nResponse Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Email sent successfully!")
        print(f"   Email ID: {result.get('email_id', 'N/A')}")
        print(f"\n📧 Check your inbox: {test_email}")
    else:
        print(f"❌ Email failed:")
        print(response.text)
        
        if "not configured" in response.text:
            print("\n⚠️  Resend API key not configured!")
            print("   Run: npx wrangler pages secret put RESEND_API_KEY --project-name passionbots-lms")
    
    print("\n" + "=" * 60)
    print("🎉 Test complete!")

if __name__ == "__main__":
    test_email()
