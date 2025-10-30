#!/bin/bash

# API Endpoints Test Script
# This script tests all API endpoints to verify they're working correctly

BASE_URL="${1:-http://localhost:3000}"

echo "🧪 Testing API Endpoints at $BASE_URL"
echo "=========================================="
echo ""

# Test 1: Health Check
echo "✅ Test 1: GET /api (Health Check)"
curl -s "$BASE_URL/api" | jq .
echo ""

# Test 2: Debug endpoint GET
echo "✅ Test 2: GET /api/debug"
curl -s "$BASE_URL/api/debug" | jq .
echo ""

# Test 3: Debug endpoint POST
echo "✅ Test 3: POST /api/debug"
curl -s -X POST "$BASE_URL/api/debug" \
  -H "Content-Type: application/json" \
  -d '{"test": true, "message": "Hello"}' | jq .
echo ""

# Test 4: Create game
echo "✅ Test 4: POST /api/game/create"
GAME_RESPONSE=$(curl -s -X POST "$BASE_URL/api/game/create" \
  -H "Content-Type: application/json" \
  -d '{"mode": "classic3", "player_name": "Player One"}')
echo "$GAME_RESPONSE" | jq .
INVITE_CODE=$(echo "$GAME_RESPONSE" | jq -r '.invite_code')
echo ""

# Test 5: Join game
echo "✅ Test 5: POST /api/game/join"
curl -s -X POST "$BASE_URL/api/game/join" \
  -H "Content-Type: application/json" \
  -d "{\"invite_code\": \"$INVITE_CODE\", \"player_name\": \"Player Two\"}" | jq .
echo ""

# Test 6: Get game state
echo "✅ Test 6: GET /api/game/state"
curl -s "$BASE_URL/api/game/state?game_id=$INVITE_CODE" | jq .
echo ""

# Test 7: Make a move
echo "✅ Test 7: POST /api/game/move"
curl -s -X POST "$BASE_URL/api/game/move" \
  -H "Content-Type: application/json" \
  -d '{"game_id": "TEST123", "player_id": "player1", "column_index": 0, "row_index": 0}' | jq .
echo ""

# Test 8: Send chat message
echo "✅ Test 8: POST /api/chat/send"
curl -s -X POST "$BASE_URL/api/chat/send" \
  -H "Content-Type: application/json" \
  -d '{"game_id": "TEST123", "player_id": "player1", "text": "Hello!"}' | jq .
echo ""

# Test 9: List chat messages
echo "✅ Test 9: GET /api/chat/list"
curl -s "$BASE_URL/api/chat/list?game_id=TEST123" | jq .
echo ""

# Test 10: Error handling - invalid mode
echo "❌ Test 10: Error handling - Invalid game mode"
curl -s -X POST "$BASE_URL/api/game/create" \
  -H "Content-Type: application/json" \
  -d '{"mode": "invalid", "player_name": "Test"}' | jq .
echo ""

# Test 11: Error handling - invalid JSON
echo "❌ Test 11: Error handling - Invalid JSON"
curl -s -X POST "$BASE_URL/api/game/create" \
  -H "Content-Type: application/json" \
  -d 'invalid json' | jq .
echo ""

# Test 12: Method not allowed
echo "❌ Test 12: Method not allowed - GET on POST endpoint"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/game/create")
echo "HTTP Status: $HTTP_CODE (Expected: 405)"
echo ""

echo "=========================================="
echo "✨ All tests completed!"
