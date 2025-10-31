# Migration Guide: WebSocket to Pusher

## For Developers

If you're upgrading from the old WebSocket implementation, here's what changed:

### Breaking Changes

None! The public API remains the same. All React hooks maintain their original signatures.

### What You Need to Do

1. **Install dependencies** (already done):

   ```bash
   npm install pusher pusher-js
   ```

2. **Set up Pusher credentials**:
   - Create a free Pusher account at [pusher.com](https://pusher.com)
   - Create a new Channels app
   - Add credentials to `.env.local`:
     ```env
     PUSHER_APP_ID=your-app-id
     PUSHER_KEY=your-key
     PUSHER_SECRET=your-secret
     PUSHER_CLUSTER=your-cluster
     NEXT_PUBLIC_PUSHER_KEY=your-key
     NEXT_PUBLIC_PUSHER_CLUSTER=your-cluster
     ```

3. **Remove old scripts** (already done):
   - No longer need to run `npm run dev:ws`
   - Just use `npm run dev`

4. **Deploy to Vercel**:
   - Add Pusher environment variables to Vercel project settings
   - Deploy and test

### What Changed Under the Hood

#### Backend

- Old: `server/websocket.ts` with custom WebSocket server
- New: `server/pusher.ts` with Pusher SDK

#### Frontend

- Old: Native WebSocket client in `lib/useWebSocket.ts`
- New: Pusher client in `lib/usePusher.ts`
- `lib/useWebSocket.ts` now re-exports from `lib/usePusher.ts`

#### API Routes

- `app/api/game/move/route.ts`: Changed import from `@/server/websocket` to `@/server/pusher`
- `app/api/chat/send/route.ts`: Changed import from `@/server/websocket` to `@/server/pusher`

### Testing Your Changes

1. **Start dev server**: `npm run dev`
2. **Create a game**: Open http://localhost:3000
3. **Open in two windows**: Use the invite code to join
4. **Test real-time**: Make a move in one window, should appear instantly in the other

### Troubleshooting

#### "Real-time updates not working"

Check that:

1. Pusher credentials are set in `.env.local`
2. `NEXT_PUBLIC_PUSHER_KEY` matches `PUSHER_KEY`
3. Cluster setting is correct
4. No browser console errors

#### "Build errors"

Run:

```bash
npm run type-check
npm run lint
npm run build
```

All should pass without errors.

### Rollback (Emergency)

If you need to rollback:

1. The old `server/websocket.ts` is still in the codebase
2. Revert the changes to API routes
3. Restore old `lib/useWebSocket.ts` from git history
4. Re-add WebSocket scripts to `package.json`

However, this will NOT work on Vercel - you'll need to deploy to a platform that supports WebSocket servers (Railway, Render, etc.)

## For DevOps/Deployment

### Vercel Setup

1. Go to project settings → Environment Variables
2. Add the following:
   - `PUSHER_APP_ID`
   - `PUSHER_KEY`
   - `PUSHER_SECRET`
   - `PUSHER_CLUSTER`
   - `NEXT_PUBLIC_PUSHER_KEY` (same as PUSHER_KEY)
   - `NEXT_PUBLIC_PUSHER_CLUSTER` (same as PUSHER_CLUSTER)
3. Redeploy

### Other Platforms

Pusher works with any serverless platform:

- Netlify
- AWS Lambda
- Google Cloud Functions
- Azure Functions

Just set the environment variables and deploy.

### Monitoring

Check Pusher dashboard for:

- Connection count
- Message volume
- Errors
- Performance metrics

### Scaling

Pusher's free tier includes:

- 200,000 messages/day
- 100 concurrent connections

For more, upgrade to a paid plan or consider alternatives:

- Ably (similar pricing)
- Socket.io with Redis (requires hosting)
- Supabase Realtime (if using Supabase)

## FAQ

### Q: Why not use Vercel's Edge Functions?

A: Edge Functions don't support WebSocket either. Pusher provides managed WebSocket infrastructure that works everywhere.

### Q: What if I don't want to use Pusher?

A: You have options:

1. Use HTTP polling (already implemented as fallback)
2. Use Server-Sent Events (SSE) for one-way updates
3. Deploy to a platform that supports WebSocket (Railway, Render, etc.)
4. Use a different managed service (Ably, Supabase Realtime)

### Q: Does this cost money?

A: Pusher has a generous free tier. For this app's typical usage (small games with 2 players), you'll likely stay within free tier limits.

### Q: Is my data secure?

A: Yes. Pusher uses TLS encryption. For additional security, consider:

- Using Pusher's private channels with authentication
- Not sending sensitive data through Pusher
- Implementing server-side validation (already done)

### Q: Can I test without Pusher credentials?

A: Yes! The app works without Pusher, but users need to refresh to see updates. Perfect for testing non-real-time features.
