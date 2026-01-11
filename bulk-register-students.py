#!/usr/bin/env python3
"""
Bulk Student Registration Script for PassionBots IoT & Robotics
"""
import csv
import requests
import json
import time
from datetime import datetime

# Configuration
API_URL = "https://passionbots-lms.pages.dev/api/register"

def register_student(student):
    """Register a single student via API"""
    try:
        response = requests.post(
            API_URL,
            json=student,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": f"Network error: {str(e)}"}
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}

def bulk_register(csv_file):
    """Register multiple students from CSV file"""
    results = {
        "success": 0,
        "failed": 0,
        "skipped": 0,
        "details": []
    }
    
    start_time = datetime.now()
    print(f"\n🎓 PassionBots - Bulk Student Registration")
    print("=" * 70)
    print(f"📅 Start Time: {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📁 CSV File: {csv_file}")
    print("=" * 70)
    print()
    
    try:
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            total_rows = sum(1 for row in open(csv_file)) - 1  # Exclude header
            
            print(f"📊 Total students to register: {total_rows}")
            print()
            
            # Reset file pointer
            f.seek(0)
            next(reader)  # Skip header
            
            for idx, row in enumerate(reader, 1):
                student_name = row.get('fullName', 'Unknown')
                student_email = row.get('email', 'Unknown')
                
                print(f"[{idx}/{total_rows}] Registering: {student_name} ({student_email})...")
                
                # Prepare student data
                student_data = {
                    "full_name": row.get('fullName', ''),
                    "email": row.get('email', ''),
                    "mobile": row.get('mobile', ''),
                    "college_name": row.get('collegeName', ''),
                    "year_of_study": row.get('yearOfStudy', '')
                }
                
                # Validate required fields
                if not all(student_data.values()):
                    print(f"  ⚠️  Skipped: Missing required fields")
                    results["skipped"] += 1
                    results["details"].append({
                        "name": student_name,
                        "email": student_email,
                        "status": "skipped",
                        "reason": "Missing required fields"
                    })
                    continue
                
                # Register student
                result = register_student(student_data)
                
                if result.get('success'):
                    registration_id = result.get('registration_id')
                    results["success"] += 1
                    print(f"  ✅ Success! Registration ID: {registration_id}")
                    results["details"].append({
                        "name": student_name,
                        "email": student_email,
                        "status": "success",
                        "registration_id": registration_id
                    })
                else:
                    error_msg = result.get('error', 'Unknown error')
                    results["failed"] += 1
                    print(f"  ❌ Failed: {error_msg}")
                    results["details"].append({
                        "name": student_name,
                        "email": student_email,
                        "status": "failed",
                        "error": error_msg
                    })
                
                # Rate limiting - wait between requests
                if idx < total_rows:  # Don't wait after last student
                    time.sleep(0.5)
    
    except FileNotFoundError:
        print(f"❌ Error: File '{csv_file}' not found!")
        return None
    except Exception as e:
        print(f"❌ Error reading CSV file: {str(e)}")
        return None
    
    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()
    
    # Print summary
    print()
    print("=" * 70)
    print("📊 REGISTRATION SUMMARY")
    print("=" * 70)
    print(f"✅ Successful: {results['success']}")
    print(f"❌ Failed: {results['failed']}")
    print(f"⚠️  Skipped: {results['skipped']}")
    print(f"📊 Total Processed: {results['success'] + results['failed'] + results['skipped']}")
    print(f"⏱️  Duration: {duration:.1f} seconds")
    print(f"🏁 End Time: {end_time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    if results['success'] > 0:
        success_rate = (results['success'] / (results['success'] + results['failed'])) * 100
        print(f"📈 Success Rate: {success_rate:.1f}%")
    
    print("=" * 70)
    
    # Save detailed results to JSON
    results_file = f"registration_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)
    print(f"\n💾 Detailed results saved to: {results_file}")
    
    return results

def create_sample_csv():
    """Create a sample CSV file for reference"""
    sample_file = "sample_students.csv"
    with open(sample_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['fullName', 'email', 'mobile', 'collegeName', 'yearOfStudy'])
        writer.writerow(['Rahul Kumar', 'rahul.kumar@example.com', '+91 9876543210', 'MIT College', '2nd Year'])
        writer.writerow(['Priya Sharma', 'priya.sharma@example.com', '+91 9876543211', 'ABC University', '3rd Year'])
        writer.writerow(['Amit Patel', 'amit.patel@example.com', '+91 9876543212', 'XYZ Institute', '1st Year'])
    print(f"✅ Sample CSV file created: {sample_file}")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python3 bulk-register-students.py students.csv")
        print("\nOr create a sample CSV:")
        print("  python3 bulk-register-students.py --sample")
        sys.exit(1)
    
    if sys.argv[1] == "--sample":
        create_sample_csv()
    else:
        csv_file = sys.argv[1]
        results = bulk_register(csv_file)
        
        if results and results['failed'] > 0:
            print("\n⚠️  Some registrations failed. Check the results file for details.")
