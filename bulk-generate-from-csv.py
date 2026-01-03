#!/usr/bin/env python3
"""
Bulk Certificate Generation from CSV
Reads certificate_template_output.csv and generates certificates via API
"""

import csv
import json
import requests
import sys
from datetime import datetime

# Configuration
API_URL = "https://passionbots-lms.pages.dev"
LOGIN_URL = f"{API_URL}/api/admin/login"
BULK_URL = f"{API_URL}/api/admin/certificates/bulk-csv"
CSV_FILE = "/home/user/uploaded_files/certificate_template_output.csv"

# Admin credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"

def login():
    """Login and get session token"""
    print("🔐 Logging in as admin...")
    response = requests.post(LOGIN_URL, json={
        "username": ADMIN_USERNAME,
        "password": ADMIN_PASSWORD
    })
    
    if response.status_code != 200:
        print(f"❌ Login failed! Status: {response.status_code}")
        print(response.text)
        sys.exit(1)
    
    data = response.json()
    if not data.get("success"):
        print(f"❌ Login failed: {data.get('error', 'Unknown error')}")
        sys.exit(1)
    
    token = data.get("session_token")  # Fixed: use session_token instead of token
    if not token:
        print(f"❌ No session token in response: {data}")
        sys.exit(1)
    
    print(f"✅ Login successful! Token obtained.")
    return token

def read_csv():
    """Read CSV file and extract student information"""
    print(f"\n📋 Reading CSV file: {CSV_FILE}")
    students = []
    
    with open(CSV_FILE, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row.get("name", "").strip()
            email = row.get("email", "").strip()
            students.append(name)  # Backend expects just names, not objects
            print(f"  📝 {name} - {email}")
    
    print(f"\n✅ Found {len(students)} students")
    return students

def generate_certificates(token, students):
    """Generate certificates via API"""
    print(f"\n🚀 Generating {len(students)} certificates...")
    
    # Prepare payload
    payload = {
        "students": students,
        "course_name": "IoT & Robotics Webinar",
        "certificate_type": "participation",
        "completion_date": "2025-12-28"
    }
    
    # Make API request
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(BULK_URL, json=payload, headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Generation failed! Status: {response.status_code}")
        print(response.text)
        sys.exit(1)
    
    data = response.json()
    
    if not data.get("success"):
        print(f"❌ Generation failed: {data.get('error', 'Unknown error')}")
        sys.exit(1)
    
    return data

def display_results(result):
    """Display generation results"""
    print(f"\n{'='*80}")
    print(f"🎉 BULK CERTIFICATE GENERATION COMPLETE!")
    print(f"{'='*80}")
    print(f"✅ Generated: {result.get('generated', 0)} certificates")
    print(f"❌ Failed: {result.get('failed', 0)} certificates")
    print(f"{'='*80}\n")
    
    certificates = result.get("certificates", [])
    
    if certificates:
        print("📜 GENERATED CERTIFICATES:\n")
        for i, cert in enumerate(certificates, 1):
            print(f"{i}. {cert.get('student_name', 'N/A')}")
            print(f"   🆔 Code: {cert.get('certificate_code', 'N/A')}")
            print(f"   🔗 View: {API_URL}/api/certificates/{cert.get('certificate_id', 'N/A')}/view")
            print(f"   ✓ Verify: {cert.get('verification_url', 'N/A')}")
            print()
    
    errors = result.get("errors", [])
    if errors:
        print("❌ ERRORS:\n")
        for error in errors:
            print(f"  • {error}")
        print()
    
    # Save to file
    output_file = "/home/user/webapp/CERTIFICATES_FROM_CSV.md"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# Certificates Generated from CSV\n\n")
        f.write(f"**Generation Date**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"**Total Generated**: {result.get('generated', 0)}\n")
        f.write(f"**Failed**: {result.get('failed', 0)}\n\n")
        f.write("## Certificate List\n\n")
        f.write("| # | Student Name | Certificate Code | View URL |\n")
        f.write("|---|-------------|------------------|----------|\n")
        
        for i, cert in enumerate(certificates, 1):
            name = cert.get('student_name', 'N/A')
            code = cert.get('certificate_code', 'N/A')
            cert_id = cert.get('certificate_id', 'N/A')
            f.write(f"| {i} | {name} | {code} | [View]({API_URL}/api/certificates/{cert_id}/view) |\n")
    
    print(f"💾 Results saved to: {output_file}\n")

def main():
    """Main execution"""
    print("="*80)
    print("🎓 PASSIONBOTS CERTIFICATE GENERATOR")
    print("="*80)
    
    # Step 1: Login
    token = login()
    
    # Step 2: Read CSV
    students = read_csv()
    
    if not students:
        print("❌ No students found in CSV file!")
        sys.exit(1)
    
    # Step 3: Generate certificates
    result = generate_certificates(token, students)
    
    # Step 4: Display results
    display_results(result)
    
    print("✅ ALL DONE!")
    print("="*80)

if __name__ == "__main__":
    main()
