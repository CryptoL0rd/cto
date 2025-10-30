# WebSocket Implementation

## Overview

This document describes the WebSocket implementation that replaced HTTP polling for real-time game state updates.

## Problem Solved

The previous implementation used HTTP polling with `setInterval` to check for game state updates every 2 seconds. This approach had several issues:

- **Inefficient**: Constant HTTP requests even when no changes occurred
- **Reload loops**: Polling logic could trigger infinite page reloads
- **Delayed updates**: 2-second polling interval meant updates weren't truly real-time
- **Resource intensive**: Unnecessary server load from constant polling

## Solution

Implemented WebSocket-based real-time communication that:

- Provides instant updates when game state changes
- Reduces server load by eliminating polling requests
- Prevents reload loops with stable connection management
- Enables true real-time gameplay experience

## Architecture

### WebSocket Server

**Location**: `/server/websocket.ts`

A standalone WebSocket server that runs on port 3001 (configurable via `WS_PORT` environment variable).

**Features**:
- Room-based subscriptions (clients subscribe to specific game IDs)
- Automatic heartbeat/ping-pong to detect dead connections
- Reconnection handling
- Broadcast updates to all clients in a game room

**Message Types**:
- `subscribe`: Client subscribes to game updates
- `unsubscribe`: Client unsubscribes from game updates
- `game_update`: Server broadcasts game state changes
- `chat_update`: Server broadcasts new chat messages
- `ping`/`pong`: Heartbeat messages

### API Integration

WebSocket broadcasts are triggered by API routes when state changes:

**`/app/api/game/move/route.ts`**:
- Broadcasts game state after a move is made
- All connected clients in the game room receive instant updates

**`/app/api/chat/send/route.ts`**:
- Broadcasts new messages to all clients in the game room
- Messages appear instantly for all players

### Client Hooks

**Location**: `/lib/useWebSocket.ts`

Two hooks replace the old polling hooks:

#### `useGameStateWebSocket(gameId, playerId)`

Replaces `useGameState` hook:
- Fetches initial game state via HTTP
- Establishes WebSocket connection
- Subscribes to game updates
- Handles reconnection automatically
- Cleans up connection on unmount

**Returns**:
```typescript
{
  gameState: GameStateResponse | null,
  isLoading: boolean,
  error: Error | null,
  refetch: () => Promise<void>,
  isConnected: boolean
}
```

#### `useChatWebSocket(gameId)`

Replaces `useChat` hook:
- Fetches initial messages via HTTP
- Establishes WebSocket connection
- Subscribes to chat updates
- Handles reconnection automatically
- Deduplicates messages by ID

**Returns**:
```typescript
{
  messages: Message[],
  isLoading: boolean,
  error: Error | null,
  isConnected: boolean
}
```

## Configuration

### Environment Variables

**`.env.example`**:
```bash
# WebSocket server port (default: 3001)
WS_PORT=3001

# WebSocket URL for client connections
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Or just the port number (client will construct URL)
NEXT_PUBLIC_WS_PORT=3001
```

### NPM Scripts

**Development**:
```bash
# Start Next.js only
npm run dev

# Start WebSocket server only
npm run dev:ws

# Start both (recommended)
npm run dev:all
```

**Production**:
```bash
# Start Next.js
npm run start

# Start WebSocket server
npm run start:ws
```

## Usage

### In Game Page

**Before (Polling)**:
```typescript
import { useGameState } from '@/lib/hooks';

const { gameState, isLoading, error, refetch } = useGameState(gameId);
```

**After (WebSocket)**:
```typescript
import { useGameStateWebSocket } from '@/lib/useWebSocket';

const { gameState, isLoading, error, refetch, isConnected } = 
  useGameStateWebSocket(gameId, playerId);
```

### In Chat Component

**Before (Polling)**:
```typescript
import { useChat } from '@/lib/hooks';

const { messages, isLoading, error } = useChat(gameId);
```

**After (WebSocket)**:
```typescript
import { useChatWebSocket } from '@/lib/useWebSocket';

const { messages, isLoading, error, isConnected } = 
  useChatWebSocket(gameId);
```

## Connection Flow

1. **Initial Load**:
   - Client fetches initial game state via HTTP GET
   - Client establishes WebSocket connection
   - Client sends `subscribe` message with `gameId`

2. **Real-time Updates**:
   - Player makes a move → API broadcasts via WebSocket
   - All connected clients receive `game_update` message
   - UI updates instantly without polling

3. **Reconnection**:
   - If connection drops, client automatically attempts reconnection
   - Up to 5 reconnection attempts with 3-second delay
   - On reconnect, client re-subscribes to game updates

4. **Cleanup**:
   - On component unmount, client sends `unsubscribe` message
   - WebSocket connection is closed
   - No memory leaks or lingering connections

## Deployment

### Local Development

1. Start WebSocket server:
   ```bash
   npm run dev:ws
   ```

2. Start Next.js (in another terminal):
   ```bash
   npm run dev
   ```

Or use the combined command:
```bash
npm run dev:all
```

### Production Deployment

The WebSocket server needs to run alongside the Next.js application:

1. **Option A: Same server**
   - Run both processes on the same machine
   - Use a process manager like PM2

2. **Option B: Separate servers**
   - Deploy WebSocket server separately
   - Configure `NEXT_PUBLIC_WS_URL` to point to WS server

3. **Option C: Vercel + External WS**
   - Deploy Next.js to Vercel
   - Deploy WS server to a platform that supports WebSockets (Heroku, Railway, etc.)
   - Configure `NEXT_PUBLIC_WS_URL` environment variable

### Example PM2 Configuration

**`ecosystem.config.js`**:
```javascript
module.exports = {
  apps: [
    {
      name: 'next-app',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
    {
      name: 'websocket-server',
      script: 'npm',
      args: 'run start:ws',
      env: {
        NODE_ENV: 'production',
        WS_PORT: 3001,
      },
    },
  ],
};
```

## Benefits

### Performance
- ✅ No more constant polling requests
- ✅ Reduced server load
- ✅ Lower bandwidth usage
- ✅ Faster state updates (instant vs 2-second delay)

### User Experience
- ✅ Real-time updates (moves appear instantly)
- ✅ No reload loops
- ✅ Responsive gameplay
- ✅ Connection status indicator

### Code Quality
- ✅ Cleaner hook implementation
- ✅ Proper cleanup and unmounting
- ✅ Automatic reconnection
- ✅ Better error handling

## Troubleshooting

### Connection fails

**Issue**: WebSocket connection fails to establish

**Solution**:
1. Check if WebSocket server is running: `npm run dev:ws`
2. Verify port is not in use: `lsof -i :3001`
3. Check firewall settings
4. Verify `NEXT_PUBLIC_WS_URL` or `NEXT_PUBLIC_WS_PORT` is set correctly

### Updates not received

**Issue**: Game state doesn't update in real-time

**Solution**:
1. Check browser console for WebSocket errors
2. Verify client successfully subscribed (check console logs)
3. Check server logs for broadcast errors
4. Test with `refetch()` to manually fetch latest state

### Memory leaks

**Issue**: WebSocket connections not closed on navigation

**Solution**:
- Hooks automatically clean up on unmount
- Check that components properly unmount when navigating away
- Verify no duplicate hook calls (React Strict Mode can cause double calls in dev)

## Migration Notes

### Old Polling Hooks (Deprecated)

The old polling hooks in `/lib/hooks.ts` are still available but deprecated:
- `useGameState(gameId, pollingInterval)` - Use `useGameStateWebSocket` instead
- `useChat(gameId, pollingInterval)` - Use `useChatWebSocket` instead

These will continue to work as fallback but should be replaced with WebSocket hooks.

### Removed Code

No code was removed - polling hooks remain as fallback. However, main components now use WebSocket:
- `/app/game/[id]/page.tsx` - Uses `useGameStateWebSocket`
- `/components/ChatPanel.tsx` - Uses `useChatWebSocket`

## Future Enhancements

Potential improvements:
- [ ] SSL/TLS support (wss://)
- [ ] Authentication/authorization for WebSocket connections
- [ ] Presence indicators (show online players)
- [ ] Typing indicators in chat
- [ ] Message delivery receipts
- [ ] Compression for large game states
- [ ] Redis pub/sub for horizontal scaling

## Testing

### Manual Testing

1. Open game in two browser windows
2. Make a move in one window
3. Verify the other window updates instantly
4. Check browser console for WebSocket logs
5. Test reconnection by stopping/starting WS server

### Connection Status

The hooks return `isConnected` boolean to display connection status:

```typescript
const { isConnected } = useGameStateWebSocket(gameId, playerId);

{!isConnected && (
  <div className="connection-warning">
    Reconnecting to server...
  </div>
)}
```
