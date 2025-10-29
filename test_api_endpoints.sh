#!/bin/bash

# Test API Endpoints Script
# This script tests all the critical endpoints to ensure 405 errors are fixed

BASE_URL="http://localhost:3000"
PASS=0
FAIL=0

echo "================================"
echo "Testing API Endpoints"
echo "================================"
echo ""

# Test 1: Health Check
echo "Test 1: GET /api (Health Check)"
RESPONSE=$(curl -s -w "%{http_code}" "$BASE_URL/api")
HTTP_CODE="${RESPONSE: -3}"
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ PASS - Health check returned 200"
  PASS=$((PASS+1))
else
  echo "❌ FAIL - Health check returned $HTTP_CODE"
  FAIL=$((FAIL+1))
fi
echo ""

# Test 2: Create Game
echo "Test 2: POST /api/game/create"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/game/create" \
  -H "Content-Type: application/json" \
  -d '{"mode":"classic3", "player_name":"TestPlayer"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
if [ "$HTTP_CODE" = "201" ]; then
  echo "✅ PASS - Create game returned 201"
  GAME_ID=$(echo "$BODY" | jq -r '.game.id')
  echo "   Game ID: $GAME_ID"
  PASS=$((PASS+1))
else
  echo "❌ FAIL - Create game returned $HTTP_CODE"
  echo "   Response: $BODY"
  FAIL=$((FAIL+1))
fi
echo ""

# Test 3: Join Game
echo "Test 3: POST /api/game/join"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/game/join" \
  -H "Content-Type: application/json" \
  -d '{"invite_code":"ABC123", "player_name":"TestPlayer2"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ PASS - Join game returned 200"
  PASS=$((PASS+1))
else
  echo "❌ FAIL - Join game returned $HTTP_CODE"
  echo "   Response: $BODY"
  FAIL=$((FAIL+1))
fi
echo ""

# Test 4: Get Game State
echo "Test 4: GET /api/game/state"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/game/state?game_id=test123")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ PASS - Get game state returned 200"
  PASS=$((PASS+1))
else
  echo "❌ FAIL - Get game state returned $HTTP_CODE"
  FAIL=$((FAIL+1))
fi
echo ""

# Test 5: Make Move
echo "Test 5: POST /api/game/move"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/game/move" \
  -H "Content-Type: application/json" \
  -d '{"game_id":"test123", "player_id":"player1", "column_index":0, "row_index":0}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ PASS - Make move returned 200"
  PASS=$((PASS+1))
else
  echo "❌ FAIL - Make move returned $HTTP_CODE"
  FAIL=$((FAIL+1))
fi
echo ""

# Test 6: Send Chat Message
echo "Test 6: POST /api/chat/send"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/chat/send" \
  -H "Content-Type: application/json" \
  -d '{"game_id":"test123", "player_id":"player1", "text":"Test message"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ PASS - Send chat message returned 200"
  PASS=$((PASS+1))
else
  echo "❌ FAIL - Send chat message returned $HTTP_CODE"
  FAIL=$((FAIL+1))
fi
echo ""

# Test 7: List Chat Messages
echo "Test 7: GET /api/chat/list"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/chat/list?game_id=test123")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ PASS - List chat messages returned 200"
  PASS=$((PASS+1))
else
  echo "❌ FAIL - List chat messages returned $HTTP_CODE"
  FAIL=$((FAIL+1))
fi
echo ""

# Summary
echo "================================"
echo "Test Summary"
echo "================================"
echo "Passed: $PASS"
echo "Failed: $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
  echo "🎉 All tests passed! No 405 errors detected."
  exit 0
else
  echo "⚠️  Some tests failed. Please review the results above."
  exit 1
fi
