#!/bin/bash

# Bulk Certificate Generation from CSV
# Usage: ./bulk-generate-csv.sh <csv_file>

CSV_FILE="${1:-/home/user/uploaded_files/certificate_template_output.csv}"
API_URL="https://passionbots-lms.pages.dev"
LOGIN_URL="${API_URL}/api/admin/login"
BULK_URL="${API_URL}/api/admin/certificates/bulk-csv"

echo "🔐 Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$LOGIN_URL" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed!"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful! Session token obtained."
echo ""
echo "📋 Reading CSV file: $CSV_FILE"

# Read CSV and build students array
STUDENTS_JSON="["
FIRST=true

# Skip header line and read data
tail -n +2 "$CSV_FILE" | while IFS=',' read -r student_id name email course_name completion_date grade notes; do
  # Clean up fields (remove quotes if any)
  name=$(echo "$name" | sed 's/^"//;s/"$//')
  email=$(echo "$email" | sed 's/^"//;s/"$//')
  course_name=$(echo "$course_name" | sed 's/^"//;s/"$//')
  completion_date=$(echo "$completion_date" | sed 's/^"//;s/"$//')
  
  if [ "$FIRST" = false ]; then
    echo -n "," >> /tmp/students.json
  fi
  FIRST=false
  
  echo "{\"name\":\"$name\",\"email\":\"$email\"}" >> /tmp/students.json
  
  echo "  📝 $name - $email"
done

echo "]" >> /tmp/students.json

echo ""
echo "🚀 Generating certificates..."

# Note: Since we can't easily build JSON in bash with the loop,
# let's use a Python script instead
