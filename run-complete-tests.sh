#!/bin/bash
# Complete End-to-End Testing for PassionBots IoT & Robotics Portal

echo "=============================================================================="
echo "🧪 PassionBots IoT & Robotics Portal - Complete End-to-End Testing"
echo "=============================================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_BASE="https://passionbots-lms.pages.dev"
TEST_EMAIL="test.complete@example.com"
TEST_MOBILE="+91 8888888888"

# Test counter
PASSED=0
FAILED=0

test_pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASSED++))
}

test_fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAILED++))
}

echo "📋 Test Configuration:"
echo "  Base URL: $API_BASE"
echo "  Test Email: $TEST_EMAIL"
echo ""
echo "=============================================================================="

# TEST 1: Frontend Pages Accessibility
echo ""
echo "📄 TEST 1: Frontend Pages Accessibility"
echo "------------------------------------------------------------------------------"

echo "1.1 Testing Registration Page..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/register")
if [ "$STATUS" -eq 200 ]; then
    test_pass "Registration page accessible (HTTP $STATUS)"
else
    test_fail "Registration page not accessible (HTTP $STATUS)"
fi

echo "1.2 Testing Student Portal..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/student-portal")
if [ "$STATUS" -eq 200 ]; then
    test_pass "Student portal accessible (HTTP $STATUS)"
else
    test_fail "Student portal not accessible (HTTP $STATUS)"
fi

echo "1.3 Testing Student Dashboard..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/dashboard")
if [ "$STATUS" -eq 200 ]; then
    test_pass "Student dashboard accessible (HTTP $STATUS)"
else
    test_fail "Student dashboard not accessible (HTTP $STATUS)"
fi

echo "1.4 Testing Admin Portal..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/admin-portal")
if [ "$STATUS" -eq 200 ]; then
    test_pass "Admin portal accessible (HTTP $STATUS)"
else
    test_fail "Admin portal not accessible (HTTP $STATUS)"
fi

# TEST 2: API Endpoints
echo ""
echo "🔌 TEST 2: API Endpoints"
echo "------------------------------------------------------------------------------"

echo "2.1 Testing Live Classes API..."
RESPONSE=$(curl -s "$API_BASE/api/live-classes")
if echo "$RESPONSE" | grep -q "\"success\":true"; then
    CLASS_COUNT=$(echo "$RESPONSE" | jq -r '.classes | length')
    test_pass "Live Classes API working ($CLASS_COUNT classes found)"
else
    test_fail "Live Classes API not working"
fi

echo "2.2 Testing Course Modules API..."
RESPONSE=$(curl -s "$API_BASE/api/course-modules")
if echo "$RESPONSE" | grep -q "\"success\":true"; then
    MODULE_COUNT=$(echo "$RESPONSE" | jq -r '.modules | length')
    test_pass "Course Modules API working ($MODULE_COUNT modules found)"
else
    test_fail "Course Modules API not working"
fi

echo "2.3 Testing Admin Login API..."
RESPONSE=$(curl -s -X POST "$API_BASE/api/admin-login-iot" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')
if echo "$RESPONSE" | grep -q "\"success\":true"; then
    test_pass "Admin Login API working"
else
    test_fail "Admin Login API not working"
fi

# TEST 3: Student Registration Flow
echo ""
echo "👨‍🎓 TEST 3: Student Registration Flow"
echo "------------------------------------------------------------------------------"

echo "3.1 Registering new test student..."
RESPONSE=$(curl -s -X POST "$API_BASE/api/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"full_name\": \"E2E Test Student\",
    \"email\": \"$TEST_EMAIL\",
    \"mobile\": \"$TEST_MOBILE\",
    \"college_name\": \"Test College\",
    \"year_of_study\": \"2nd Year\"
  }")

if echo "$RESPONSE" | grep -q "\"success\":true"; then
    REG_ID=$(echo "$RESPONSE" | jq -r '.registration_id')
    test_pass "Student registration successful (ID: $REG_ID)"
elif echo "$RESPONSE" | grep -q "already registered"; then
    test_pass "Student already registered (duplicate detection working)"
else
    test_fail "Student registration failed"
fi

echo "3.2 Testing student login..."
RESPONSE=$(curl -s -X POST "$API_BASE/api/student-login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\"}")

if echo "$RESPONSE" | grep -q "\"success\":true"; then
    test_pass "Student login successful"
else
    test_fail "Student login failed"
fi

# TEST 4: Admin Functions
echo ""
echo "👨‍💼 TEST 4: Admin Functions"
echo "------------------------------------------------------------------------------"

echo "4.1 Testing admin login..."
ADMIN_RESPONSE=$(curl -s -X POST "$API_BASE/api/admin-login-iot" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

if echo "$ADMIN_RESPONSE" | grep -q "\"success\":true"; then
    test_pass "Admin authentication successful"
    ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | jq -r '.token')
else
    test_fail "Admin authentication failed"
fi

echo "4.2 Testing student list API..."
RESPONSE=$(curl -s "$API_BASE/api/admin/students-list")
if echo "$RESPONSE" | grep -q "\"success\":true"; then
    STUDENT_COUNT=$(echo "$RESPONSE" | jq -r '.students | length')
    test_pass "Student list API working ($STUDENT_COUNT students found)"
else
    test_fail "Student list API not working"
fi

# TEST 5: Data Integrity
echo ""
echo "💾 TEST 5: Data Integrity"
echo "------------------------------------------------------------------------------"

echo "5.1 Verifying live classes data..."
RESPONSE=$(curl -s "$API_BASE/api/live-classes")
CLASS_1=$(echo "$RESPONSE" | jq -r '.classes[0].class_title')
if [ -n "$CLASS_1" ]; then
    test_pass "Live classes data present (First class: $CLASS_1)"
else
    test_fail "Live classes data missing"
fi

echo "5.2 Verifying course modules data..."
RESPONSE=$(curl -s "$API_BASE/api/course-modules")
MODULE_1=$(echo "$RESPONSE" | jq -r '.modules[0].module_title')
if [ -n "$MODULE_1" ]; then
    test_pass "Course modules data present (First module: $MODULE_1)"
else
    test_fail "Course modules data missing"
fi

# TEST 6: Duplicate Prevention
echo ""
echo "🛡️ TEST 6: Duplicate Prevention"
echo "------------------------------------------------------------------------------"

echo "6.1 Testing duplicate email detection..."
RESPONSE=$(curl -s -X POST "$API_BASE/api/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"full_name\": \"Duplicate Test\",
    \"email\": \"$TEST_EMAIL\",
    \"mobile\": \"+91 9999999999\",
    \"college_name\": \"Test College\",
    \"year_of_study\": \"1st Year\"
  }")

if echo "$RESPONSE" | grep -q "already registered"; then
    test_pass "Duplicate email detection working"
else
    test_fail "Duplicate email detection not working"
fi

# TEST 7: Response Times
echo ""
echo "⚡ TEST 7: Performance & Response Times"
echo "------------------------------------------------------------------------------"

echo "7.1 Testing API response time..."
START=$(date +%s%N)
curl -s "$API_BASE/api/live-classes" > /dev/null
END=$(date +%s%N)
DIFF=$((($END - $START) / 1000000))

if [ $DIFF -lt 1000 ]; then
    test_pass "API response time acceptable (${DIFF}ms)"
else
    test_fail "API response time too slow (${DIFF}ms)"
fi

# TEST 8: Theme & Design Elements
echo ""
echo "🎨 TEST 8: Theme & Design Verification"
echo "------------------------------------------------------------------------------"

echo "8.1 Checking for TailwindCSS..."
RESPONSE=$(curl -s "$API_BASE/register")
if echo "$RESPONSE" | grep -q "tailwindcss"; then
    test_pass "TailwindCSS loaded"
else
    test_fail "TailwindCSS not found"
fi

echo "8.2 Checking for Font Awesome..."
if echo "$RESPONSE" | grep -q "fontawesome"; then
    test_pass "Font Awesome loaded"
else
    test_fail "Font Awesome not found"
fi

echo "8.3 Checking for yellow/black theme..."
if echo "$RESPONSE" | grep -q "#FFD700\|yellow"; then
    test_pass "Yellow theme color present"
else
    test_fail "Yellow theme color not found"
fi

# Final Summary
echo ""
echo "=============================================================================="
echo "📊 TEST SUMMARY"
echo "=============================================================================="
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
TOTAL=$((PASSED + FAILED))
echo "📊 Total: $TOTAL"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 ALL TESTS PASSED! System is fully operational.${NC}"
    exit 0
else
    PASS_RATE=$((PASSED * 100 / TOTAL))
    echo ""
    echo -e "${YELLOW}⚠️  Some tests failed. Pass rate: ${PASS_RATE}%${NC}"
    exit 1
fi
