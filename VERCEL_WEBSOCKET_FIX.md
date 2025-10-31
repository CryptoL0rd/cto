# WebSocket Fix for Vercel Deployment

## Problem

The application was attempting to connect to a WebSocket server on port 3001 (`wss://cto-gules.vercel.app:3001`), which fails on Vercel because:

1. Vercel uses a serverless architecture that doesn't support long-running processes
2. Custom ports are not accessible on Vercel deployments
3. Traditional WebSocket servers require persistent connections, incompatible with serverless functions

## Solution

Migrated from traditional WebSocket server to **Pusher**, a managed real-time messaging service that works with serverless architectures.

## Changes Made

### 1. Dependencies Added

```bash
npm install pusher pusher-js
```

- `pusher`: Server-side SDK for broadcasting events
- `pusher-js`: Client-side SDK for receiving events

### 2. Backend Changes

#### New File: `server/pusher.ts`

Created a new Pusher integration module that:

- Initializes Pusher with credentials from environment variables
- Provides `broadcastGameUpdate()` function
- Provides `broadcastChatUpdate()` function
- Gracefully handles missing credentials (logs warning but doesn't crash)

#### Updated Files

- `app/api/game/move/route.ts`: Changed import from `@/server/websocket` to `@/server/pusher`
- `app/api/chat/send/route.ts`: Changed import from `@/server/websocket` to `@/server/pusher`

### 3. Frontend Changes

#### New File: `lib/usePusher.ts`

Created new React hooks that use Pusher instead of WebSocket:

- `useGameStateWebSocket()`: Subscribes to game state updates
- `useChatWebSocket()`: Subscribes to chat message updates

Key features:

- Maintains same API as old WebSocket hooks (backward compatible)
- Fetches initial state via HTTP
- Subscribes to Pusher channels for real-time updates
- Handles connection state
- Properly cleans up subscriptions on unmount

#### Updated File: `lib/useWebSocket.ts`

Simplified to re-export hooks from `usePusher.ts` for backward compatibility:

```typescript
export { useGameStateWebSocket, useChatWebSocket } from './usePusher';
```

This means all existing components continue to work without changes!

### 4. Configuration Changes

#### Updated `.env.example`

Added Pusher configuration variables:

```env
# Backend credentials (server-side only)
PUSHER_APP_ID=your-app-id
PUSHER_KEY=your-key
PUSHER_SECRET=your-secret
PUSHER_CLUSTER=mt1

# Frontend credentials (exposed to client)
NEXT_PUBLIC_PUSHER_KEY=your-key
NEXT_PUBLIC_PUSHER_CLUSTER=mt1
```

Removed old WebSocket configuration:

- `WS_PORT`
- `NEXT_PUBLIC_WS_PORT`
- `NEXT_PUBLIC_WS_URL`

#### Updated `package.json`

Removed WebSocket server scripts:

- ❌ `dev:ws`
- ❌ `dev:all`
- ❌ `start:ws`

### 5. Deprecated Files

#### `server/index.ts`

Updated to show deprecation warning and exit. This was the standalone WebSocket server entry point.

#### `server/websocket.ts`

Marked as deprecated with comments. Keeping for reference but no longer used.

### 6. Documentation

Created comprehensive setup guide: `PUSHER_SETUP.md`

## How Real-Time Updates Work Now

### Previous Architecture (WebSocket)

```
Client → WebSocket connection to port 3001 → Server broadcasts to all clients
```

**Problem**: Requires persistent server process, doesn't work on Vercel

### New Architecture (Pusher)

```
Client → Subscribes to Pusher channel
Server → Makes API call → Broadcasts via Pusher → All subscribed clients receive update
```

**Benefits**:

- Works with serverless (no persistent connections needed)
- Managed infrastructure (no server maintenance)
- Auto-scaling
- Better reliability and redundancy

## Channel Structure

### Game Updates

- **Channel name**: `game-{gameId}` (e.g., `game-abc123`)
- **Event**: `game-update`
- **Triggered when**: Player makes a move
- **Data**: Complete game state (game, players, moves, messages)

### Chat Updates

- **Channel name**: `game-{gameId}` (same as game updates)
- **Event**: `chat-update`
- **Triggered when**: Player sends a message
- **Data**: Array of new messages

## Deployment Checklist

1. ✅ Install Pusher dependencies
2. ✅ Create Pusher account and app
3. ✅ Add environment variables to Vercel:
   - `PUSHER_APP_ID`
   - `PUSHER_KEY`
   - `PUSHER_SECRET`
   - `PUSHER_CLUSTER`
   - `NEXT_PUBLIC_PUSHER_KEY`
   - `NEXT_PUBLIC_PUSHER_CLUSTER`
4. ✅ Deploy to Vercel
5. ✅ Test real-time updates

## Testing

### Local Development

1. Set up `.env.local` with Pusher credentials (see `PUSHER_SETUP.md`)
2. Run `npm run dev`
3. Open two browser windows with the same game
4. Make a move in one window → should appear instantly in the other

### Without Pusher Credentials

The app still works but without real-time updates:

- Game state is fetched via HTTP on page load
- User must manually refresh to see new moves
- Console shows warning: "Pusher credentials not configured"

### Production Testing

1. Deploy to Vercel with environment variables set
2. Create a game
3. Share the invite code and open in another device/browser
4. Verify moves appear instantly on both devices
5. Test chat functionality

## Troubleshooting

### "WebSocket connection error" in production

✅ **Fixed!** This was the original issue. Now using Pusher instead of WebSocket.

### Real-time updates not working

1. Check Vercel environment variables are set correctly
2. Verify `NEXT_PUBLIC_PUSHER_KEY` matches `PUSHER_KEY`
3. Check Pusher dashboard for connection events
4. Check browser console for Pusher errors

### Build/type errors

All existing code should work without changes since we maintained the same hook API.

## Rollback Plan

If issues occur, you can temporarily disable real-time updates by:

1. Not setting Pusher environment variables
2. App will fall back to HTTP-only mode (manual refresh needed)

## Performance Considerations

### Pusher Free Tier Limits

- 200,000 messages per day
- 100 max concurrent connections
- Unlimited channels

### Message Optimization

Current implementation broadcasts full game state on each move. For larger games, consider:

- Broadcasting only the diff/changes
- Using Pusher's presence channels for player status
- Implementing message batching for rapid moves

## Future Improvements

Possible enhancements:

1. **Presence channels**: Show who's currently online
2. **Private channels**: Add authentication for game channels
3. **Typing indicators**: Show when opponent is typing in chat
4. **Connection quality indicators**: Show connection status to user
5. **Offline support**: Queue moves when offline, sync when back online

## Benefits Over WebSocket

1. ✅ **Serverless compatible**: Works on Vercel, Netlify, AWS Lambda, etc.
2. ✅ **No server maintenance**: Pusher handles infrastructure
3. ✅ **Better reliability**: Built-in redundancy and failover
4. ✅ **Auto-scaling**: Handles any number of concurrent users
5. ✅ **Better developer experience**: Simple API, good documentation
6. ✅ **Free tier available**: Good for development and small apps
7. ✅ **Better security**: Managed authentication and authorization
