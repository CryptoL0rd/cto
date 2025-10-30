# 🎮 Крестики-Нолики / Гомоку

Full-stack web application for Tic-Tac-Toe (3×3) and Gomoku (5-in-a-row) with invite system and live chat.

## 🛠 Tech Stack

**Frontend:**

- Next.js 14 (App Router)
- TypeScript (strict mode)
- TailwindCSS
- React Hooks

**Backend:**

- Next.js API Routes (TypeScript)
- Vercel Serverless Functions
- In-memory game state

**Real-time:**

- Pusher Channels (WebSocket alternative for serverless)

## 📦 Installation

```bash
npm install
```

## ⚙️ Configuration

### Pusher Setup (Required for Real-time Updates)

1. Create free account at [pusher.com](https://pusher.com)
2. Create a new Channels app
3. Copy credentials to `.env.local`:

```env
PUSHER_APP_ID=your-app-id
PUSHER_KEY=your-key
PUSHER_SECRET=your-secret
PUSHER_CLUSTER=your-cluster
NEXT_PUBLIC_PUSHER_KEY=your-key
NEXT_PUBLIC_PUSHER_CLUSTER=your-cluster
```

See [PUSHER_SETUP.md](./PUSHER_SETUP.md) for detailed instructions.

**Note**: App works without Pusher but requires manual refresh for updates.

## 🚀 Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment

Deploy to Vercel:

1. Push to GitHub
2. Import repository to Vercel
3. Add Pusher environment variables in Vercel settings
4. Deploy (auto-configured)

See [VERCEL_WEBSOCKET_FIX.md](./VERCEL_WEBSOCKET_FIX.md) for deployment details.

## 📖 API Documentation

Coming soon...

## 🎨 Features

- ✨ Two game modes: Classic 3×3 and Gomoku 5-in-a-row
- 🔗 Invite code system for multiplayer
- 💬 Real-time chat powered by Pusher
- ⚡ Instant game updates (no refresh needed)
- 🌌 Cosmic dark theme
- 📱 Responsive design
- ☁️ Serverless deployment (Vercel-ready)

## 📚 Documentation

- [Pusher Setup Guide](./PUSHER_SETUP.md) - Configure real-time updates
- [Testing Guide](./TESTING_PUSHER.md) - Test the application
- [Migration Guide](./MIGRATION_GUIDE.md) - For developers upgrading
- [Quick Reference](./QUICK_REFERENCE.md) - Quick setup reference
- [Technical Details](./VERCEL_WEBSOCKET_FIX.md) - Architecture explanation

## 📝 License

MIT
