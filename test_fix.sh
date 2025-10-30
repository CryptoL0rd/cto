#!/bin/bash

set -e

echo "=========================================="
echo "Testing Game Create and Redirect Flow"
echo "=========================================="
echo ""

# Test 1: Create game
echo "1. Testing POST /api/game/create"
RESPONSE=$(curl -s -X POST http://localhost:3001/api/game/create \
  -H "Content-Type: application/json" \
  -d '{"mode":"classic3", "player_name":"TestPlayer"}')

echo "Response received:"
echo "$RESPONSE" | jq .
echo ""

# Extract game_id and invite_code
GAME_ID=$(echo "$RESPONSE" | jq -r '.game.id')
INVITE_CODE=$(echo "$RESPONSE" | jq -r '.game.invite_code')
PLAYER_ID=$(echo "$RESPONSE" | jq -r '.player_id')

echo "Extracted values:"
echo "  Game ID: $GAME_ID"
echo "  Invite Code: $INVITE_CODE"
echo "  Player ID: $PLAYER_ID"
echo ""

# Validate structure
echo "2. Validating response structure..."
if [ "$GAME_ID" = "null" ] || [ -z "$GAME_ID" ]; then
  echo "❌ FAIL: game.id is missing or null"
  exit 1
fi

if [ "$INVITE_CODE" = "null" ] || [ -z "$INVITE_CODE" ]; then
  echo "❌ FAIL: game.invite_code is missing or null"
  exit 1
fi

if [ "$GAME_ID" = "$INVITE_CODE" ]; then
  echo "❌ FAIL: game.id should NOT be the same as invite_code"
  exit 1
fi

if [[ ! "$GAME_ID" =~ ^game_ ]]; then
  echo "❌ FAIL: game.id should start with 'game_'"
  exit 1
fi

echo "✅ Response structure is correct"
echo ""

# Test 2: Fetch game state using game.id
echo "3. Testing GET /api/game/state?game_id=$GAME_ID"
STATE_RESPONSE=$(curl -s "http://localhost:3001/api/game/state?game_id=$GAME_ID")

echo "State response:"
echo "$STATE_RESPONSE" | jq .
echo ""

STATE_GAME_ID=$(echo "$STATE_RESPONSE" | jq -r '.game.id')

if [ "$STATE_GAME_ID" = "null" ] || [ -z "$STATE_GAME_ID" ]; then
  echo "❌ FAIL: State API did not return game"
  exit 1
fi

if [ "$STATE_GAME_ID" != "$GAME_ID" ]; then
  echo "❌ FAIL: State API returned different game.id"
  exit 1
fi

echo "✅ Game state API works with game.id"
echo ""

# Test 3: Join game
echo "4. Testing POST /api/game/join"
JOIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/game/join \
  -H "Content-Type: application/json" \
  -d "{\"invite_code\":\"$INVITE_CODE\", \"player_name\":\"Player2\"}")

echo "Join response:"
echo "$JOIN_RESPONSE" | jq .
echo ""

JOIN_GAME_ID=$(echo "$JOIN_RESPONSE" | jq -r '.game.id')
JOIN_INVITE_CODE=$(echo "$JOIN_RESPONSE" | jq -r '.game.invite_code')

if [ "$JOIN_GAME_ID" = "null" ] || [ -z "$JOIN_GAME_ID" ]; then
  echo "❌ FAIL: Join response missing game.id"
  exit 1
fi

if [ "$JOIN_INVITE_CODE" = "null" ] || [ -z "$JOIN_INVITE_CODE" ]; then
  echo "❌ FAIL: Join response missing game.invite_code"
  exit 1
fi

if [[ ! "$JOIN_GAME_ID" =~ ^game_ ]]; then
  echo "❌ FAIL: Join response game.id should start with 'game_'"
  exit 1
fi

echo "✅ Join API returns correct structure"
echo ""

echo "=========================================="
echo "✅ ALL TESTS PASSED!"
echo "=========================================="
echo ""
echo "Summary:"
echo "  - API returns game.id (unique ID for routing)"
echo "  - API returns game.invite_code (inside game object)"
echo "  - game.id != invite_code"
echo "  - game.id starts with 'game_' prefix"
echo "  - State API accepts game.id"
echo "  - Join API returns same structure"
echo ""
echo "Frontend should redirect to: /game/$GAME_ID"
echo "NOT to: /game/$INVITE_CODE"
