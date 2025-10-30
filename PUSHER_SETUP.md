# Pusher Setup Guide

This application uses Pusher for real-time WebSocket communication, which is compatible with Vercel's serverless architecture.

## Why Pusher?

Vercel's serverless platform doesn't support traditional long-running WebSocket servers on custom ports. Pusher provides a managed real-time service that works seamlessly with serverless deployments.

## Setup Instructions

### 1. Create a Pusher Account

1. Go to [pusher.com](https://pusher.com) and sign up for a free account
2. Create a new Channels app
3. Choose your cluster (e.g., `us2`, `eu`, `ap1`, etc.)

### 2. Get Your Credentials

From your Pusher dashboard, you'll find:

- **App ID**: Your application ID
- **Key**: Your public key (can be exposed to client)
- **Secret**: Your secret key (keep this private!)
- **Cluster**: The region where your app is hosted

### 3. Configure Environment Variables

#### For Local Development

Create a `.env.local` file in the project root:

```env
# Backend Pusher credentials
PUSHER_APP_ID=your-app-id
PUSHER_KEY=your-key
PUSHER_SECRET=your-secret
PUSHER_CLUSTER=your-cluster

# Frontend Pusher credentials (must start with NEXT_PUBLIC_)
NEXT_PUBLIC_PUSHER_KEY=your-key
NEXT_PUBLIC_PUSHER_CLUSTER=your-cluster
```

#### For Vercel Deployment

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the following variables:
   - `PUSHER_APP_ID`
   - `PUSHER_KEY`
   - `PUSHER_SECRET`
   - `PUSHER_CLUSTER`
   - `NEXT_PUBLIC_PUSHER_KEY`
   - `NEXT_PUBLIC_PUSHER_CLUSTER`

### 4. Test Your Setup

1. Start the development server: `npm run dev`
2. Create a new game
3. Open the game in two different browser windows/tabs
4. Make a move in one window and verify it appears instantly in the other

## How It Works

### Backend (Server-Side)

The server uses the `pusher` package to broadcast updates:

```typescript
import { broadcastGameUpdate } from '@/server/pusher';

// After making a move
await broadcastGameUpdate(gameId, gameState);
```

### Frontend (Client-Side)

The frontend uses `pusher-js` to receive real-time updates:

```typescript
import { useGameStateWebSocket } from '@/lib/useWebSocket';

// In your component
const { gameState, isConnected } = useGameStateWebSocket(gameId, playerId);
```

## Channels and Events

### Game Updates

- **Channel**: `game-{gameId}` (e.g., `game-abc123`)
- **Event**: `game-update`
- **Data**: Full game state including players, moves, and game status

### Chat Updates

- **Channel**: `game-{gameId}` (same channel as game updates)
- **Event**: `chat-update`
- **Data**: Array of new chat messages

## Troubleshooting

### Real-time updates not working

1. **Check credentials**: Verify all environment variables are set correctly
2. **Check console**: Look for Pusher connection errors in browser console
3. **Check cluster**: Make sure `NEXT_PUBLIC_PUSHER_CLUSTER` matches your Pusher app's cluster
4. **Check logs**: In Vercel deployment, check function logs for Pusher errors

### Connection errors

- **Invalid key**: Make sure `NEXT_PUBLIC_PUSHER_KEY` matches your Pusher key exactly
- **Wrong cluster**: Verify the cluster setting matches your Pusher app
- **Rate limits**: Free Pusher accounts have limits (200k messages/day, 100 concurrent connections)

### Development without Pusher

If you don't configure Pusher credentials, the app will still work but without real-time updates. You'll need to manually refresh the page to see new moves or messages.

## Free Tier Limits

Pusher's free tier includes:

- 200,000 messages per day
- 100 max concurrent connections
- Unlimited channels

This is sufficient for most small to medium applications.

## Alternative Solutions

If you need a different solution:

- **Ably**: Similar to Pusher with generous free tier
- **Supabase Realtime**: If using Supabase for database
- **Socket.io with Redis**: Deploy on Railway/Render with Redis adapter
- **Server-Sent Events (SSE)**: One-way updates, simpler but less flexible
