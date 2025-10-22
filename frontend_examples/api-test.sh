#!/bin/bash

# Email Template API Test Script
# This script tests the email template API endpoints directly

API_BASE="https://utah-aba-finder-api-c9d143f02ce8.herokuapp.com/api/v1/admin"
TOKEN="50"  # Replace with your actual token

echo "🧪 Email Template API Test Script"
echo "=================================="
echo "API Base URL: $API_BASE"
echo "Token: $TOKEN"
echo ""

# Test 1: List Templates
echo "📋 Test 1: List Email Templates"
echo "-------------------------------"
curl -X GET \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "$API_BASE/email_templates" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo ""

# Test 2: Load Password Update Template (HTML)
echo "📄 Test 2: Load Password Update Template (HTML)"
echo "----------------------------------------------"
curl -X GET \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "$API_BASE/email_templates/password_update_required?type=html" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo ""

# Test 3: Load Password Update Template (Text)
echo "📄 Test 3: Load Password Update Template (Text)"
echo "----------------------------------------------"
curl -X GET \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "$API_BASE/email_templates/password_update_required?type=text" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo ""

# Test 4: Load System Update Template (HTML)
echo "📄 Test 4: Load System Update Template (HTML)"
echo "---------------------------------------------"
curl -X GET \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "$API_BASE/email_templates/system_update?type=html" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo ""

# Test 5: Load Welcome Template (HTML)
echo "📄 Test 5: Load Welcome Template (HTML)"
echo "---------------------------------------"
curl -X GET \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "$API_BASE/email_templates/welcome?type=html" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo ""

# Test 6: Preview Password Update Template
echo "👁️ Test 6: Preview Password Update Template"
echo "-------------------------------------------"
curl -X GET \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "$API_BASE/email_templates/password_update_required/preview?type=html" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo ""
echo "✅ API Tests Complete!"
echo ""
echo "Expected Results:"
echo "- HTTP Status 200 = Success"
echo "- HTTP Status 404 = Template not found"
echo "- HTTP Status 401 = Authentication failed"
echo "- HTTP Status 500 = Server error"
