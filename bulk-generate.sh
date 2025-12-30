#!/bin/bash

# Login to get session token
echo "Logging in..."
SESSION_TOKEN=$(curl -s -X POST https://5344213a.passionbots-lms.pages.dev/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.session_token')

if [ "$SESSION_TOKEN" == "null" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo "✅ Session token: $SESSION_TOKEN"

# Read student names from CSV
STUDENTS=$(tail -n +2 bulk-students.csv | tr '\n' ',' | sed 's/,$//')

# Generate bulk certificates
echo "Generating 19 certificates..."
curl -X POST https://5344213a.passionbots-lms.pages.dev/api/admin/certificates/bulk-csv \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -d "{
    \"students\": [\"$(tail -n +2 bulk-students.csv | tr '\n' ',' | sed 's/,$//' | sed 's/,/","/g')\"],
    \"course_name\": \"IOT Robotics Program\",
    \"certificate_type\": \"participation\",
    \"completion_date\": \"2025-12-28\"
  }" | jq '.'

echo "✅ Done!"
