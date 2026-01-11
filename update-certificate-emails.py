#!/usr/bin/env python3
"""
Update certificate emails from CSV
Maps student names to emails and updates the database
"""

import csv
import requests
import sys

# Configuration
API_BASE = "https://passionbots-lms.pages.dev"
ADMIN_USER = "admin"
ADMIN_PASS = "admin123"
CSV_FILE = "/home/user/webapp/new_students_raw.csv"

def login():
    """Login to admin API"""
    print("🔐 Logging in...")
    response = requests.post(f"{API_BASE}/api/admin/login", json={
        "username": ADMIN_USER,
        "password": ADMIN_PASS
    })
    
    if response.status_code != 200:
        print(f"❌ Login failed: {response.status_code}")
        sys.exit(1)
    
    token = response.json().get('token')
    print(f"✅ Login successful!")
    return token

def load_csv_emails():
    """Load email mapping from CSV"""
    print(f"\n📋 Loading emails from {CSV_FILE}...")
    
    email_map = {}
    
    with open(CSV_FILE, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row['Name'].strip()
            email = row['Email'].strip()
            if email and '@' in email:
                email_map[name] = email
    
    print(f"✅ Loaded {len(email_map)} email addresses")
    return email_map

def get_certificates(token, start_id=68):
    """Get certificates from database"""
    print(f"\n📜 Fetching certificates (ID >= {start_id})...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(f"{API_BASE}/api/admin/certificates/list", headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Failed to fetch certificates: {response.status_code}")
        sys.exit(1)
    
    certificates = response.json().get('certificates', [])
    filtered = [cert for cert in certificates if cert.get('certificate_id', 0) >= start_id]
    
    print(f"✅ Found {len(filtered)} certificates")
    return filtered

def update_certificate_email(token, cert_id, email):
    """Update certificate with email address"""
    # Note: This endpoint doesn't exist yet, we'll use direct SQL update
    # For now, we'll return success and document the SQL needed
    return {"success": True}

def main():
    print("=" * 60)
    print("📧 Update Certificate Emails from CSV")
    print("=" * 60)
    
    # Login
    token = login()
    
    # Load email mapping
    email_map = load_csv_emails()
    
    # Get certificates
    certificates = get_certificates(token, start_id=68)
    
    # Match and update
    print("\n🔄 Matching names to emails...")
    print("=" * 60)
    
    matched = 0
    unmatched = 0
    updates = []
    
    for cert in certificates:
        cert_id = cert.get('certificate_id')
        student_name = cert.get('student_name', '').strip()
        current_email = cert.get('student_email', '')
        
        # Try exact match first
        email = email_map.get(student_name)
        
        if not email:
            # Try case-insensitive match
            for csv_name, csv_email in email_map.items():
                if csv_name.lower() == student_name.lower():
                    email = csv_email
                    break
        
        if email:
            matched += 1
            if current_email != email:
                updates.append({
                    'cert_id': cert_id,
                    'name': student_name,
                    'email': email,
                    'current_email': current_email or 'None'
                })
                print(f"✅ {student_name}: {email}")
            else:
                print(f"⏭️  {student_name}: Email already set")
        else:
            unmatched += 1
            print(f"⚠️  {student_name}: No email found in CSV")
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Summary")
    print("=" * 60)
    print(f"✅ Matched:   {matched}")
    print(f"⚠️  Unmatched: {unmatched}")
    print(f"🔄 Updates needed: {len(updates)}")
    print("=" * 60)
    
    # Generate SQL update statements
    if updates:
        print("\n📝 SQL Update Statements:")
        print("=" * 60)
        print("\nCopy and run these commands:\n")
        
        for update in updates:
            cert_id = update['cert_id']
            email = update['email']
            name = update['name']
            
            # Escape single quotes in email and name
            email_escaped = email.replace("'", "''")
            name_escaped = name.replace("'", "''")
            
            print(f"-- Update certificate {cert_id}: {name}")
            print(f"UPDATE certificates SET student_email = '{email_escaped}' WHERE certificate_id = {cert_id};")
            print()
        
        # Generate batch update file
        sql_file = "/home/user/webapp/update_emails.sql"
        with open(sql_file, 'w', encoding='utf-8') as f:
            f.write("-- Update certificate emails from CSV\n")
            f.write(f"-- Generated: $(date)\n")
            f.write(f"-- Total updates: {len(updates)}\n\n")
            
            for update in updates:
                cert_id = update['cert_id']
                email = update['email']
                name = update['name']
                email_escaped = email.replace("'", "''")
                name_escaped = name.replace("'", "''")
                
                f.write(f"-- {name}\n")
                f.write(f"UPDATE certificates SET student_email = '{email_escaped}' WHERE certificate_id = {cert_id};\n\n")
        
        print(f"\n💾 SQL updates saved to: {sql_file}")
        print("\nTo apply updates:")
        print("  Local:      npx wrangler d1 execute passionbots-lms-production --local --file=./update_emails.sql")
        print("  Production: npx wrangler d1 execute passionbots-lms-production --file=./update_emails.sql")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
