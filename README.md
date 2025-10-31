# 🎮 Крестики-Нолики / Gomoku

A modern, real-time multiplayer Tic-Tac-Toe and Gomoku game built with Next.js 14, featuring instant game updates, live chat, and a beautiful cosmic-themed UI.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### Game Modes
- **Classic 3×3** - Traditional Tic-Tac-Toe with 3-in-a-row win condition
- **Gomoku** - 5-in-a-row on an infinite, pannable board

### Multiplayer
- **Invite Code System** - Share a 6-character code to invite friends
- **Real-time Updates** - Instant move synchronization using Pusher
- **Live Chat** - Built-in chat for each game
- **Multiple Games** - Create and play multiple games simultaneously

### User Experience
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Cosmic Theme** - Beautiful dark theme with purple/blue gradients
- **No Registration** - Jump right into the game
- **Serverless Ready** - Deploy to Vercel with zero configuration

## 🛠 Tech Stack

### Frontend
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development (strict mode)
- **[React](https://react.dev/)** - UI library with Hooks
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Pusher JS](https://pusher.com/)** - Client-side real-time library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **[Pusher Channels](https://pusher.com/)** - Real-time WebSocket alternative for serverless
- **In-Memory Storage** - Fast state management (MVP implementation)

### Infrastructure
- **[Vercel](https://vercel.com/)** - Deployment and hosting
- **Serverless Functions** - Auto-scaling, zero configuration

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0 or higher ([Download](https://nodejs.org/))
- **npm** 9.0 or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd tic-tac-toe-gomoku
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Add your Pusher credentials (see [Pusher Setup](#pusher-setup) below):

```env
# Pusher Configuration (Required for real-time updates)
PUSHER_APP_ID=your-app-id
PUSHER_KEY=your-key
PUSHER_SECRET=your-secret
PUSHER_CLUSTER=us2

# Public Keys (exposed to client)
NEXT_PUBLIC_PUSHER_KEY=your-key
NEXT_PUBLIC_PUSHER_CLUSTER=us2
```

> **Note**: The app works without Pusher but requires manual page refresh for updates.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## 🔑 Pusher Setup

Pusher provides real-time updates for moves and chat. Follow these steps to set it up:

### Create a Free Pusher Account

1. Go to [pusher.com](https://pusher.com) and sign up (free tier available)
2. Create a new Channels app
3. Choose your nearest cluster (e.g., `us2`, `eu`, `ap1`)

### Get Your Credentials

From the Pusher dashboard, copy:
- **App ID** → `PUSHER_APP_ID`
- **Key** → `PUSHER_KEY` and `NEXT_PUBLIC_PUSHER_KEY`
- **Secret** → `PUSHER_SECRET`
- **Cluster** → `PUSHER_CLUSTER` and `NEXT_PUBLIC_PUSHER_CLUSTER`

### Add to `.env.local`

```env
PUSHER_APP_ID=123456
PUSHER_KEY=abcdef123456
PUSHER_SECRET=xyz789secret
PUSHER_CLUSTER=us2

NEXT_PUBLIC_PUSHER_KEY=abcdef123456
NEXT_PUBLIC_PUSHER_CLUSTER=us2
```

For detailed instructions, see [PUSHER_SETUP.md](./PUSHER_SETUP.md).

## 💻 Local Development

### Available Scripts

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Format code
npm run format

# Check formatting without changes
npm run format:check

# Type check
npm run type-check
```

### Testing Locally

1. **Start the dev server**: `npm run dev`
2. **Create a game**: Click "Create Game" and choose a mode
3. **Join from another window**: Open an incognito/private window and join using the invite code
4. **Play**: Make moves and test the chat functionality

### Project Structure

```
.
├── app/                    # Next.js App Router
│   ├── api/               # API routes (serverless functions)
│   │   ├── chat/         # Chat endpoints
│   │   └── game/         # Game endpoints (create, join, move, state)
│   ├── game/[id]/        # Dynamic game page
│   ├── page.tsx          # Home page
│   └── layout.tsx        # Root layout
├── components/            # React components
│   ├── GameBoard3x3.tsx  # 3×3 board component
│   ├── GameBoardGomoku.tsx # Gomoku board component
│   ├── ChatPanel.tsx     # Chat interface
│   └── ui/               # Reusable UI components
├── lib/                   # Utility functions
│   ├── api.ts            # API client functions
│   ├── game-logic.ts     # Game state management
│   ├── hooks.ts          # Custom React hooks
│   ├── types.ts          # TypeScript type definitions
│   └── usePusher.ts      # Pusher integration hook
├── public/               # Static assets
├── .env.example          # Environment variables template
├── next.config.mjs       # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── vercel.json           # Vercel deployment configuration
```

## 🌐 Vercel Deployment

### Prerequisites

- GitHub account
- Vercel account ([Sign up free](https://vercel.com/signup))
- Pusher account with credentials

### Step 1: Push to GitHub

```bash
# Initialize git (if not already initialized)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add remote (replace with your repository URL)
git remote add origin https://github.com/yourusername/your-repo.git

# Push to GitHub
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Sign in with GitHub
3. Click **"Import Project"**
4. Select your repository
5. Vercel will automatically detect Next.js settings

### Step 3: Configure Environment Variables

In the Vercel import screen, add these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `PUSHER_APP_ID` | `your-app-id` | From Pusher dashboard |
| `PUSHER_KEY` | `your-key` | From Pusher dashboard |
| `PUSHER_SECRET` | `your-secret` | From Pusher dashboard |
| `PUSHER_CLUSTER` | `us2` | Your Pusher cluster |
| `NEXT_PUBLIC_PUSHER_KEY` | `your-key` | Same as PUSHER_KEY |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | `us2` | Same as PUSHER_CLUSTER |

> **Important**: `NEXT_PUBLIC_*` variables are exposed to the browser. Never put secrets in them.

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Vercel will provide a URL like `https://your-app.vercel.app`

### Step 5: Verify Deployment

Visit your deployed URL and test:
- ✅ Homepage loads
- ✅ Create a game
- ✅ Join from another device/browser
- ✅ Make moves (should update in real-time)
- ✅ Send chat messages

### Manual Deployment via Vercel CLI

Alternatively, deploy using the Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (follow prompts)
vercel

# Deploy to production
vercel --prod
```

### Updating Environment Variables

After deployment, you can update environment variables:

1. Go to Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add/edit variables
5. **Redeploy** for changes to take effect

### Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS records as instructed by Vercel
4. Wait for DNS propagation (up to 48 hours)

## ⚙️ Configuration

### Build Settings (Vercel)

Vercel auto-detects these settings, but you can customize them:

| Setting | Default Value |
|---------|---------------|
| **Framework Preset** | Next.js |
| **Build Command** | `npm run build` |
| **Output Directory** | `.next` |
| **Install Command** | `npm install` |
| **Node Version** | 18.x |

### vercel.json

The project includes a minimal `vercel.json`:

```json
{
  "framework": "nextjs"
}
```

You can extend it for custom routing, headers, or redirects if needed.

## 🐛 Troubleshooting

### Real-time Updates Not Working

**Symptoms**: Moves don't appear in real-time, need to refresh page

**Solutions**:
1. Verify Pusher credentials in `.env.local` (local) or Vercel dashboard (production)
2. Check that `NEXT_PUBLIC_PUSHER_KEY` and `NEXT_PUBLIC_PUSHER_CLUSTER` are set
3. Ensure your Pusher app is active and not suspended
4. Check browser console for Pusher connection errors
5. Verify you're not on the free tier limits (100 max connections)

### Environment Variables Not Loading

**Symptoms**: `undefined` errors for environment variables

**Solutions**:
- **Local**: Make sure you created `.env.local` (not just `.env`)
- **Production**: Redeploy after adding environment variables in Vercel
- **Public variables**: Must start with `NEXT_PUBLIC_` to be available in browser
- Restart dev server after changing `.env.local`

### WebSocket Connection Issues

**Symptoms**: Pusher fails to connect, shows error in console

**Solutions**:
1. Check your Pusher cluster is correct (`us2`, `eu`, `ap1`, etc.)
2. Verify firewall/network doesn't block WebSocket connections
3. Try a different browser or network
4. Check Pusher dashboard for service status

### Build Fails on Vercel

**Symptoms**: Deployment fails during build step

**Solutions**:
```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npm run type-check

# Check for linting errors
npm run lint

# Fix any errors and commit
git add .
git commit -m "Fix build errors"
git push
```

### Game State Lost After Deployment

**Symptoms**: Active games disappear after deploying updates

**This is expected behavior**. The current implementation uses in-memory storage, which resets on:
- New deployments
- Serverless function cold starts
- Server restarts

**For production**: Implement persistent storage (see [Future Enhancements](#future-enhancements))

### "Module not found" Errors

**Solutions**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json .next
npm install
npm run dev
```

### Port 3000 Already in Use

**Solution**:
```bash
# Use a different port
PORT=3001 npm run dev
```

### Styling Issues / Tailwind Not Working

**Solutions**:
```bash
# Rebuild Tailwind
npm run build

# Check for CSS conflicts in browser DevTools
# Clear browser cache
```

## 📚 Additional Documentation

- [PUSHER_SETUP.md](./PUSHER_SETUP.md) - Detailed Pusher configuration guide
- [TESTING_PUSHER.md](./TESTING_PUSHER.md) - How to test real-time features
- [QUICKSTART.md](./QUICKSTART.md) - Quick 5-minute setup guide
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Pre-deployment checklist
- [VERCEL_WEBSOCKET_FIX.md](./VERCEL_WEBSOCKET_FIX.md) - Technical details on Pusher integration

## 🔮 Future Enhancements

### Planned Features
- [ ] **Persistent Storage** - Migrate to Vercel Postgres or similar
- [ ] **User Accounts** - Login and player profiles
- [ ] **Game History** - Track wins/losses
- [ ] **Spectator Mode** - Watch games in progress
- [ ] **AI Opponent** - Play against computer
- [ ] **Tournaments** - Competitive play
- [ ] **Leaderboards** - Global rankings

### Storage Options for Production
Currently uses in-memory storage. For production, consider:
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Upstash Redis](https://upstash.com/)
- [PlanetScale](https://planetscale.com/)
- [Supabase](https://supabase.com/)
- [Neon](https://neon.tech/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Real-time powered by [Pusher](https://pusher.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Deployed on [Vercel](https://vercel.com/)

## 📞 Support

- 📖 Check the [Documentation](#-additional-documentation)
- 🐛 Open an [Issue](https://github.com/yourusername/your-repo/issues)
- 💬 [Discussions](https://github.com/yourusername/your-repo/discussions)

---

**Made with ❤️ and ✨**
