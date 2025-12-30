#!/bin/bash

# Login to get session token
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST https://4c4a38bf.passionbots-lms.pages.dev/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

echo "Login response: $LOGIN_RESPONSE"

SESSION_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.session_token')

if [ "$SESSION_TOKEN" == "null" ] || [ -z "$SESSION_TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo "✅ Session token: $SESSION_TOKEN"

# Read students from CSV
STUDENTS='["Bhavesh Gudlani","Abhishek Singh","Rahul Kumar","Priya Sharma","Amit Patel","Neha Gupta","Arjun Reddy","Sneha Iyer","Vikram Singh","Ananya Das","Rohan Mehta","Pooja Verma","Karthik Krishnan","Divya Nair","Sanjay Rao","Meera Joshi","Aditya Kapoor","Ritu Malhotra","Suresh Bhat"]'

echo ""
echo "Generating 19 certificates..."
echo ""

RESULT=$(curl -s -X POST https://4c4a38bf.passionbots-lms.pages.dev/api/admin/certificates/bulk-csv \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -d "{
    \"students\": $STUDENTS,
    \"course_name\": \"IOT Robotics Program\",
    \"certificate_type\": \"participation\",
    \"completion_date\": \"2025-12-28\"
  }")

echo "$RESULT" | jq '.'

echo ""
echo "✅ Done! Generated $(echo $RESULT | jq -r '.generated') certificates"
