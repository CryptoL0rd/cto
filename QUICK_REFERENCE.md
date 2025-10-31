# Quick Reference: Pusher Real-Time Updates

## For Developers

### Environment Variables

```env
# Server-side (keep secret)
PUSHER_APP_ID=your-app-id
PUSHER_KEY=your-key
PUSHER_SECRET=your-secret
PUSHER_CLUSTER=mt1

# Client-side (public)
NEXT_PUBLIC_PUSHER_KEY=your-key
NEXT_PUBLIC_PUSHER_CLUSTER=mt1
```

### Usage in Code

#### Broadcasting Updates (Backend)

```typescript
import { broadcastGameUpdate, broadcastChatUpdate } from '@/server/pusher';

// After game state changes
await broadcastGameUpdate(gameId, gameState);

// After new chat message
await broadcastChatUpdate(gameId, messages);
```

#### Subscribing to Updates (Frontend)

```typescript
import { useGameStateWebSocket, useChatWebSocket } from '@/lib/useWebSocket';

// In your component
const { gameState, isConnected, error } = useGameStateWebSocket(gameId, playerId);
const { messages, isConnected } = useChatWebSocket(gameId);
```

## For DevOps

### Vercel Deployment

```bash
# Add environment variables via Vercel dashboard
# Settings → Environment Variables → Add New

PUSHER_APP_ID=...
PUSHER_KEY=...
PUSHER_SECRET=...
PUSHER_CLUSTER=...
NEXT_PUBLIC_PUSHER_KEY=...
NEXT_PUBLIC_PUSHER_CLUSTER=...

# Redeploy
vercel --prod
```

### Testing Checklist

- [ ] Environment variables set
- [ ] Build successful
- [ ] Real-time game updates work
- [ ] Real-time chat updates work
- [ ] No console errors
- [ ] Pusher dashboard shows connections

## Channel Structure

| Feature      | Channel         | Event         | Data            |
| ------------ | --------------- | ------------- | --------------- |
| Game Updates | `game-{gameId}` | `game-update` | Full game state |
| Chat Updates | `game-{gameId}` | `chat-update` | Message array   |

## Troubleshooting

| Issue                        | Solution                                       |
| ---------------------------- | ---------------------------------------------- |
| "Credentials not configured" | Set Pusher env vars in `.env.local`            |
| "Connection error"           | Check credentials and cluster setting          |
| Updates not working          | Verify `NEXT_PUBLIC_*` vars match private vars |
| Build errors                 | Run `npm run type-check` for details           |

## Resources

- **Setup Guide**: [PUSHER_SETUP.md](./PUSHER_SETUP.md)
- **Testing Guide**: [TESTING_PUSHER.md](./TESTING_PUSHER.md)
- **Migration Guide**: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- **Technical Details**: [VERCEL_WEBSOCKET_FIX.md](./VERCEL_WEBSOCKET_FIX.md)

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run type-check   # Check TypeScript
npm run lint         # Lint code
npm run format       # Format code
```

## Free Tier Limits

- **Messages**: 200,000 per day
- **Connections**: 100 concurrent
- **Channels**: Unlimited
- **Message Size**: 10KB per message

## Success Indicators

✅ Moves appear instantly on all clients  
✅ Chat messages appear instantly  
✅ No "WebSocket connection error"  
✅ Pusher dashboard shows active connections  
✅ Console logs show "Connected" and "Subscribed"
