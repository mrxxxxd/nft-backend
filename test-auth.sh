#!/bin/bash

BASE_URL="http://localhost:5000/api"
EMAIL="testuser_$(date +%s)@example.com"
PASSWORD="password123"

echo "-----------------------------------"
echo "Testing with Email: $EMAIL"
echo "-----------------------------------"

# 1. Register
echo ""
echo "▶️  1. Registering User..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "Response: $REGISTER_RESPONSE"

# Extract Token (Basic parsing, assumes success)
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Registration failed or no token received."
  exit 1
else
  echo "✅ Token Registration Received: ${TOKEN:0:20}..."
fi

# 2. Login
echo ""
echo "▶️  2. Logging In..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "Response: $LOGIN_RESPONSE"
LOGIN_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$LOGIN_TOKEN" ]; then
  echo "❌ Login failed."
  exit 1
else
  echo "✅ Login Token Received: ${LOGIN_TOKEN:0:20}..."
fi

# 3. Test Protected Route (Mock check since we don't have one active yet, but we can verify middleware later)
# For now, we will just prove we have the token.
echo ""
echo "🎉 Authentication Flow Verified!"
