#!/usr/bin/env python3
"""
Remove duplicates and generate certificates for new students
"""

import csv
import json
import requests
from collections import defaultdict

# Configuration
API_URL = "https://04437b44.passionbots-lms.pages.dev"
LOGIN_URL = f"{API_URL}/api/admin/login"
BULK_URL = f"{API_URL}/api/admin/certificates/bulk-csv"
CSV_FILE = "/home/user/webapp/new_students_raw.csv"

# Admin credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"

def remove_duplicates():
    """Remove duplicate entries based on email"""
    print("📋 Reading CSV and removing duplicates...")
    
    seen_emails = {}
    unique_students = []
    duplicates = []
    
    with open(CSV_FILE, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            email = row['Email'].strip().lower()
            name = row['Name'].strip()
            
            # Check for duplicates
            if email in seen_emails:
                # Keep the one with higher ID (more recent)
                existing = seen_emails[email]
                if int(row['ID']) > int(existing['ID']):
                    # Remove old one and add new one
                    unique_students = [s for s in unique_students if s['Email'].lower() != email]
                    unique_students.append(row)
                    seen_emails[email] = row
                    duplicates.append(f"Duplicate: {name} ({email}) - Kept ID {row['ID']}, removed ID {existing['ID']}")
                else:
                    duplicates.append(f"Duplicate: {name} ({email}) - Already have ID {existing['ID']}, skipped ID {row['ID']}")
            else:
                seen_emails[email] = row
                unique_students.append(row)
    
    print(f"\n✅ Original entries: {len(seen_emails) + len(duplicates)}")
    print(f"✅ Unique students: {len(unique_students)}")
    print(f"❌ Duplicates removed: {len(duplicates)}")
    
    if duplicates:
        print("\n📝 Duplicate details:")
        for dup in duplicates:
            print(f"  • {dup}")
    
    return unique_students

def login():
    """Login and get session token"""
    print("\n🔐 Logging in as admin...")
    response = requests.post(LOGIN_URL, json={
        "username": ADMIN_USERNAME,
        "password": ADMIN_PASSWORD
    })
    
    if response.status_code != 200:
        print(f"❌ Login failed! Status: {response.status_code}")
        print(response.text)
        return None
    
    data = response.json()
    if not data.get("success"):
        print(f"❌ Login failed: {data.get('error', 'Unknown error')}")
        return None
    
    token = data.get("session_token")
    print(f"✅ Login successful!")
    return token

def generate_certificates(token, students):
    """Generate certificates via API"""
    print(f"\n🚀 Generating {len(students)} certificates...")
    
    # Prepare student names list
    student_names = [s['Name'] for s in students]
    
    # Prepare payload
    payload = {
        "students": student_names,
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
        return None
    
    data = response.json()
    
    if not data.get("success"):
        print(f"❌ Generation failed: {data.get('error', 'Unknown error')}")
        return None
    
    return data

def save_results(unique_students, result):
    """Save results to markdown file"""
    output_file = "/home/user/webapp/NEW_CERTIFICATES_BATCH.md"
    
    certificates = result.get("certificates", [])
    
    # Create mapping of names to certificates
    cert_map = {}
    for cert in certificates:
        name = cert.get('student_name', '')
        cert_map[name] = cert
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# 🎓 New Certificate Batch Generated\n\n")
        f.write(f"**Generation Date**: January 3, 2026\n")
        f.write(f"**Total Generated**: {result.get('generated', 0)}\n")
        f.write(f"**Failed**: {result.get('failed', 0)}\n\n")
        
        f.write("## 📊 Summary\n\n")
        f.write(f"- **Original Entries**: {len(unique_students) + (result.get('failed', 0))}\n")
        f.write(f"- **Unique Students**: {len(unique_students)}\n")
        f.write(f"- **Certificates Generated**: {result.get('generated', 0)}\n\n")
        
        f.write("## 📜 Complete Certificate List\n\n")
        f.write("| # | Name | Email | Certificate Code | View | Verify |\n")
        f.write("|---|------|-------|------------------|------|--------|\n")
        
        for i, student in enumerate(unique_students, 1):
            name = student['Name']
            email = student['Email']
            
            cert = cert_map.get(name, {})
            cert_id = cert.get('certificate_id', 'N/A')
            cert_code = cert.get('certificate_code', 'N/A')
            
            if cert_id != 'N/A':
                view_url = f"{API_URL}/api/certificates/{cert_id}/view"
                verify_url = f"{API_URL}/verify/{cert_code}"
                f.write(f"| {i} | {name} | {email} | {cert_code} | [View]({view_url}) | [Verify]({verify_url}) |\n")
            else:
                f.write(f"| {i} | {name} | {email} | N/A | N/A | N/A |\n")
    
    print(f"\n💾 Results saved to: {output_file}")

def main():
    """Main execution"""
    print("="*80)
    print("🎓 PASSIONBOTS CERTIFICATE GENERATOR - NEW BATCH")
    print("="*80)
    
    # Step 1: Remove duplicates
    unique_students = remove_duplicates()
    
    if not unique_students:
        print("❌ No students found!")
        return
    
    # Step 2: Login
    token = login()
    if not token:
        return
    
    # Step 3: Generate certificates
    result = generate_certificates(token, unique_students)
    if not result:
        return
    
    # Step 4: Display results
    print(f"\n{'='*80}")
    print(f"🎉 BULK CERTIFICATE GENERATION COMPLETE!")
    print(f"{'='*80}")
    print(f"✅ Generated: {result.get('generated', 0)} certificates")
    print(f"❌ Failed: {result.get('failed', 0)} certificates")
    print(f"{'='*80}\n")
    
    # Step 5: Save results
    save_results(unique_students, result)
    
    print("✅ ALL DONE!")
    print("="*80)

if __name__ == "__main__":
    main()
