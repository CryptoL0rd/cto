# Testing the Pusher Implementation

This guide walks you through testing the new Pusher-based real-time updates.

## Prerequisites

1. Node.js and npm installed
2. A Pusher account (free tier works)
3. Pusher credentials configured

## Quick Start: Testing Locally

### Step 1: Set Up Pusher Credentials

1. Sign up at [pusher.com](https://pusher.com)
2. Create a new Channels app
3. Copy your credentials
4. Create `.env.local` in project root:

```env
# Backend credentials
PUSHER_APP_ID=your-app-id
PUSHER_KEY=your-key
PUSHER_SECRET=your-secret
PUSHER_CLUSTER=your-cluster

# Frontend credentials (must match PUSHER_KEY and PUSHER_CLUSTER)
NEXT_PUBLIC_PUSHER_KEY=your-key
NEXT_PUBLIC_PUSHER_CLUSTER=your-cluster
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Start Development Server

```bash
npm run dev
```

Server should start at http://localhost:3000

### Step 4: Test Real-Time Updates

#### Test 1: Game State Updates

1. **Create a game**:
   - Open http://localhost:3000
   - Click "New Game"
   - Note the invite code

2. **Join from another window**:
   - Open http://localhost:3000 in a new browser window/tab (or incognito)
   - Enter the invite code
   - Click "Join Game"

3. **Test moves**:
   - Make a move in Window 1
   - ✅ Move should appear **instantly** in Window 2 (no refresh needed)
   - Make a move in Window 2
   - ✅ Move should appear **instantly** in Window 1

4. **Test game completion**:
   - Play until someone wins or draws
   - ✅ Both windows should show game result instantly

#### Test 2: Chat Updates

1. In the same game from Test 1
2. Send a chat message in Window 1
3. ✅ Message should appear instantly in Window 2
4. Send a message in Window 2
5. ✅ Message should appear instantly in Window 1

#### Test 3: Connection Status

1. Open browser console (F12)
2. Look for Pusher logs:

   ```
   [Pusher] Connected
   [Pusher] Subscribed to game: {gameId}
   [Pusher] Received game update
   [Pusher Chat] Connected
   [Pusher Chat] Subscribed to game: {gameId}
   [Pusher Chat] Received chat update
   ```

3. ✅ Should see connection and subscription messages
4. ✅ Should see update messages when moves/messages are sent

#### Test 4: Graceful Degradation

1. Stop the dev server
2. Remove Pusher credentials from `.env.local`
3. Start dev server again: `npm run dev`
4. Create/join a game
5. ✅ Game should still work
6. ✅ Console should show warning: "Pusher credentials not configured"
7. Make a move
8. ✅ Need to refresh to see updates (no real-time)

## Testing on Vercel

### Step 1: Deploy to Vercel

```bash
# Make sure you're logged in
vercel login

# Deploy
vercel --prod
```

### Step 2: Add Environment Variables

1. Go to Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all Pusher variables:
   - `PUSHER_APP_ID`
   - `PUSHER_KEY`
   - `PUSHER_SECRET`
   - `PUSHER_CLUSTER`
   - `NEXT_PUBLIC_PUSHER_KEY`
   - `NEXT_PUBLIC_PUSHER_CLUSTER`

### Step 3: Redeploy

```bash
vercel --prod
```

### Step 4: Test on Production

1. Open your Vercel URL (e.g., https://your-app.vercel.app)
2. Repeat Test 1 and Test 2 from above
3. ✅ Real-time updates should work
4. ✅ No "WebSocket connection error" messages
5. ✅ No reconnection loops

## Troubleshooting

### Issue: "Pusher credentials not configured" warning

**Cause**: Environment variables not set correctly

**Solution**:

1. Check `.env.local` exists and has correct values
2. Restart dev server after adding `.env.local`
3. Verify variable names match exactly (including `NEXT_PUBLIC_` prefix)

### Issue: "Pusher connection error"

**Cause**: Invalid credentials or wrong cluster

**Solution**:

1. Double-check credentials in Pusher dashboard
2. Verify `PUSHER_CLUSTER` and `NEXT_PUBLIC_PUSHER_CLUSTER` match
3. Ensure `PUSHER_KEY` and `NEXT_PUBLIC_PUSHER_KEY` are the same value
4. Check Pusher dashboard for error logs

### Issue: Real-time updates not working

**Cause**: Various possibilities

**Debug steps**:

1. Open browser console, look for errors
2. Check network tab for Pusher WebSocket connection
3. Verify Pusher dashboard shows active connections
4. Test with browser cache cleared
5. Try incognito/private browsing mode

### Issue: "Failed to subscribe" error

**Cause**: Channel name mismatch or authentication issue

**Debug steps**:

1. Check browser console for exact error message
2. Verify game ID is being passed correctly
3. Check Pusher dashboard → Debug Console for events
4. Ensure you're using public channels (not private)

### Issue: Updates delayed or inconsistent

**Cause**: Possible network issues or rate limiting

**Debug steps**:

1. Check Pusher dashboard for rate limits
2. Verify you're within free tier limits (200k messages/day)
3. Test network connection
4. Check browser network tab for delays

## Advanced Testing

### Testing with Multiple Users

1. Create a game on your computer
2. Share invite code with friends
3. Have them join from different devices
4. Test that all players see updates simultaneously

### Testing Connection Resilience

1. Start a game
2. Disable network temporarily
3. Re-enable network
4. ✅ Pusher should auto-reconnect
5. ✅ Game state should sync after reconnection

### Testing Browser Compatibility

Test on:

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Performance Testing

1. Open Pusher dashboard
2. Monitor message count
3. Play several games
4. Check:
   - ✅ Message count increases appropriately
   - ✅ No excessive message spam
   - ✅ Well within free tier limits

## Monitoring in Production

### Pusher Dashboard

Monitor these metrics:

1. **Connections**: Number of active connections
2. **Messages**: Messages sent per day
3. **Errors**: Any connection or subscription errors
4. **Latency**: Message delivery times

### Browser Console

In production, check for:

- No error messages
- Pusher connection established
- Updates received promptly

### Vercel Logs

Check function logs for:

- No Pusher broadcast errors
- API endpoints executing successfully
- No unusual error rates

## Expected Behavior

### What Should Work

✅ Game moves appear instantly on all clients  
✅ Chat messages appear instantly on all clients  
✅ Game completion detected by all players  
✅ No "WebSocket connection error" messages  
✅ No infinite reconnection loops  
✅ Graceful degradation without credentials

### What's Normal

- Initial page load fetches game state via HTTP (1 request)
- Subsequent updates come via Pusher (0 HTTP requests)
- Console shows Pusher connection logs
- Small delay (<1s) for updates on slow connections

### What's Not Normal

- ❌ "WebSocket connection error" messages
- ❌ Continuous reconnection attempts
- ❌ Updates requiring manual page refresh
- ❌ Missing moves or messages
- ❌ App crashes without credentials

## Success Criteria

Your implementation is working correctly if:

1. ✅ Real-time updates work on Vercel
2. ✅ No WebSocket connection errors
3. ✅ Players see moves instantly (< 2 seconds)
4. ✅ Chat messages appear instantly
5. ✅ Game state updates reliably
6. ✅ Proper cleanup on component unmount (no memory leaks)
7. ✅ App works in production environment
8. ✅ Graceful degradation without credentials

## Need Help?

### Documentation

- [Pusher Setup Guide](./PUSHER_SETUP.md)
- [Migration Guide](./MIGRATION_GUIDE.md)
- [Technical Details](./VERCEL_WEBSOCKET_FIX.md)

### Common Resources

- [Pusher Docs](https://pusher.com/docs/channels)
- [Pusher Debug Console](https://dashboard.pusher.com/apps/{your-app-id}/getting_started)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

### Debugging Tools

- Browser DevTools Console (F12)
- Browser DevTools Network Tab
- Pusher Dashboard Debug Console
- Vercel Function Logs
