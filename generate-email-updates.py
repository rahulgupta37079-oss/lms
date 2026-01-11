#!/usr/bin/env python3
"""
Generate SQL to update certificate emails directly
"""

import csv

CSV_FILE = "/home/user/webapp/new_students_raw.csv"
OUTPUT_FILE = "/home/user/webapp/update_emails.sql"

def main():
    print("📧 Generating SQL to update certificate emails...")
    
    # Load CSV
    updates = []
    with open(CSV_FILE, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row['Name'].strip()
            email = row['Email'].strip()
            
            if email and '@' in email:
                updates.append((name, email))
    
    print(f"✅ Found {len(updates)} valid emails")
    
    # Generate SQL
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write("-- Update certificate emails from CSV\n")
        f.write(f"-- Total updates: {len(updates)}\n\n")
        
        for name, email in updates:
            # Escape single quotes
            name_escaped = name.replace("'", "''")
            email_escaped = email.replace("'", "''")
            
            f.write(f"-- {name}\n")
            f.write(f"UPDATE certificates SET student_email = '{email_escaped}' ")
            f.write(f"WHERE student_name = '{name_escaped}' AND certificate_id >= 68;\n\n")
    
    print(f"✅ SQL saved to: {OUTPUT_FILE}")
    print("\nTo apply:")
    print(f"  Local:      cd /home/user/webapp && npx wrangler d1 execute passionbots-lms-production --local --file=./update_emails.sql")
    print(f"  Production: cd /home/user/webapp && npx wrangler d1 execute passionbots-lms-production --file=./update_emails.sql")

if __name__ == "__main__":
    main()
