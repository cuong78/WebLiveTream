#!/bin/bash

echo "=== Testing LiveStream Backend APIs ==="
echo "Backend should be running on http://localhost:8080"
echo ""

# Test 1: Get all streams
echo "1. Testing GET /api/streams"
curl -X GET http://localhost:8080/api/streams \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  2>/dev/null
echo ""

# Test 2: Get active streams
echo "2. Testing GET /api/streams/active"
curl -X GET http://localhost:8080/api/streams/active \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  2>/dev/null
echo ""

# Test 3: Get all videos
echo "3. Testing GET /api/videos"
curl -X GET http://localhost:8080/api/videos \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  2>/dev/null
echo ""

# Test 4: Get chat history
echo "4. Testing GET /api/chat/history/1"
curl -X GET "http://localhost:8080/api/chat/history/1?limit=10" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  2>/dev/null
echo ""

# Test 5: Test joining a stream
echo "5. Testing POST /api/streams/1/join"
curl -X POST http://localhost:8080/api/streams/1/join \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  2>/dev/null
echo ""

# Test 6: Get stream viewer count
echo "6. Testing GET /api/streams/1/viewers"
curl -X GET http://localhost:8080/api/streams/1/viewers \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  2>/dev/null
echo ""

echo "=== API Testing Complete ==="
