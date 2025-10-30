# API Testing Guide

## Quick Start

### Local Testing

```bash
# Start development server
npm run dev

# Run comprehensive tests
./test_api.sh

# Or test manually
curl http://localhost:3000/api
```

### Production Testing

```bash
# Test deployed app
./test_api.sh https://your-app.vercel.app
```

## Available Endpoints

### Health Check
```bash
GET /api
Response: {"ok": true, "version": "1.0.0", "timestamp": "..."}
```

### Debug (Development)
```bash
# GET - Returns environment info
GET /api/debug

# POST - Echoes request body
POST /api/debug
Content-Type: application/json
{"test": true}
```

### Game Management

#### Create Game
```bash
POST /api/game/create
Content-Type: application/json

{
  "mode": "classic3",           # or "gomoku", "gomoku5"
  "player_name": "Player One",
  "is_ai_opponent": false       # optional
}

Response:
{
  "game": {
    "id": "ABC123",
    "mode": "classic3",
    "status": "waiting",
    ...
  },
  "player_id": "...",
  "invite_code": "ABC123",
  "player": {...}
}
```

#### Join Game
```bash
POST /api/game/join
Content-Type: application/json

{
  "invite_code": "ABC123",
  "player_name": "Player Two"
}

Response:
{
  "player": {...},
  "game_id": "ABC123",
  "mode": "classic3"
}
```

#### Get Game State
```bash
GET /api/game/state?game_id=ABC123

Response:
{
  "game": {...},
  "players": [...],
  "moves": [...],
  "messages": [...]
}
```

#### Make Move
```bash
POST /api/game/move
Content-Type: application/json

{
  "game_id": "ABC123",
  "player_id": "...",
  "column_index": 0,
  "row_index": 0
}

Response:
{
  "move": {...},
  "is_winner": false,
  "is_draw": false,
  "game_status": "active"
}
```

### Chat

#### Send Message
```bash
POST /api/chat/send
Content-Type: application/json

{
  "game_id": "ABC123",
  "player_id": "...",
  "text": "Hello!"
}

Response:
{
  "id": 123,
  "game_id": "ABC123",
  "player_id": "...",
  "message_type": "chat",
  "content": "Hello!",
  "created_at": "..."
}
```

#### List Messages
```bash
GET /api/chat/list?game_id=ABC123&since=timestamp

Response:
{
  "messages": [...]
}
```

## Error Codes

- **200** - Success
- **201** - Created (game created)
- **400** - Bad Request (validation error)
- **405** - Method Not Allowed
- **500** - Internal Server Error

## Error Response Format

```json
{
  "error": "Error message",
  "message": "Additional details (optional)"
}
```

## Debugging

### Check Logs Locally
```bash
# Start with log output
npm run dev

# Logs will show:
# [MIDDLEWARE] API Request: {...}
# [API CREATE] Function called
# [API CREATE] Body parsed: {...}
# etc.
```

### Check Logs on Vercel
1. Go to Vercel Dashboard
2. Select your project
3. Go to "Functions" tab
4. Click "Logs"
5. Filter by endpoint name (e.g., "[API CREATE]")

## Common Issues

### 405 Method Not Allowed
- Check you're using the correct HTTP method (GET/POST)
- Verify the endpoint path is correct

### 400 Bad Request
- Check request body format (valid JSON)
- Verify all required fields are present
- Check parameter types (strings, numbers, etc.)

### 500 Internal Server Error
- Check Vercel Function logs
- Look for error stack traces
- Verify environment variables (if any)

## Testing Workflow

1. **Health Check**: Verify API is running
   ```bash
   curl http://localhost:3000/api
   ```

2. **Create Game**: Get an invite code
   ```bash
   curl -X POST http://localhost:3000/api/game/create \
     -H "Content-Type: application/json" \
     -d '{"mode":"classic3","player_name":"Test"}'
   ```

3. **Join Game**: Use the invite code
   ```bash
   curl -X POST http://localhost:3000/api/game/join \
     -H "Content-Type: application/json" \
     -d '{"invite_code":"ABC123","player_name":"Test 2"}'
   ```

4. **Play Game**: Make moves, send messages, check state

## Tips

- Use `jq` to format JSON responses: `curl ... | jq .`
- Save responses to use IDs in next requests
- Check logs after each request for detailed debugging
- Use `/api/debug` endpoint to verify request/response flow
