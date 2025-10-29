# Cosmic Tic-Tac-Toe & Gomoku

A modern full-stack multiplayer game featuring classic 3×3 tic-tac-toe and strategic Gomoku (5-in-a-row) gameplay. Built with Next.js 14 and FastAPI, featuring a stunning cosmic-themed design and optimized for deployment on Vercel.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Python](https://img.shields.io/badge/Python-3.8+-blue)

> 📚 **New here?** Check out the [Quick Start Guide](./QUICKSTART.md) or browse the [Documentation Index](./DOCUMENTATION_INDEX.md) for all available docs.

## 📸 Screenshots

> **Note**: Add screenshots to `/public` directory to showcase:
>
> - Home page with game mode selection
> - Classic 3×3 game in progress
> - Gomoku board with panning
> - Chat interface
> - Win/draw states
> - Mobile responsive views

## 🎮 Features

### Game Modes

- **Classic 3×3**: Traditional tic-tac-toe with instant matches
- **Gomoku**: Strategic 15×15 board with 5-in-a-row win condition

### Core Features

- 🚀 **Real-time multiplayer** with invite code system
- 💬 **In-game chat** for player communication
- 🎨 **Cosmic theme** with beautiful gradients and animations
- 📱 **Fully responsive** design for desktop, tablet, and mobile
- ⚡ **Optimistic updates** for instant UI feedback
- 🖱️ **Interactive Gomoku board** with smooth pan and zoom
- 🎯 **Smart game logic** with win/draw detection
- 🔄 **Automatic polling** for real-time game state updates

## 🚀 Tech Stack

### Frontend

- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[React 18](https://react.dev/)** - Modern React with hooks and concurrent features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS with custom cosmic theme
- **Canvas API** - High-performance Gomoku board rendering

### Backend

- **[FastAPI](https://fastapi.tiangolo.com/)** - Modern Python web framework
- **[Pydantic](https://docs.pydantic.dev/)** - Data validation and settings
- **[SQLite](https://www.sqlite.org/)** - Lightweight database (ephemeral on Vercel)
- **[Uvicorn](https://www.uvicorn.org/)** - ASGI server for local development

### Deployment

- **[Vercel](https://vercel.com/)** - Serverless deployment platform
- **Serverless Functions** - Python API endpoints as serverless functions
- **Edge Runtime** - Optimized Next.js page delivery

## 📁 Project Structure

```
.
├── app/                        # Next.js App Router pages
│   ├── page.tsx               # Home page (create/join game)
│   ├── game/[id]/             # Dynamic game page
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles with cosmic theme
├── components/                 # React components
│   ├── GameBoard3x3.tsx       # Classic 3×3 board
│   ├── GameBoardGomoku.tsx    # Gomoku infinite board
│   ├── ChatPanel.tsx          # Chat interface
│   ├── InviteCodeDisplay.tsx  # Invite code sharing
│   └── ui/                    # Reusable UI components
├── lib/                        # Utility functions
│   ├── types.ts               # TypeScript type definitions
│   ├── api.ts                 # API client functions
│   ├── hooks.ts               # React hooks (useGameState, useChat)
│   └── game-logic.ts          # Client-side game logic
├── api/                        # FastAPI Python backend
│   ├── _shared/               # Shared backend utilities
│   │   ├── schema.sql         # Database schema
│   │   ├── db.py              # Database connection manager
│   │   ├── init_db.py         # Database initialization script
│   │   ├── models.py          # Pydantic models
│   │   └── game_service.py    # Game business logic
│   ├── game/                  # Game API endpoints
│   │   ├── create.py          # POST /api/game/create
│   │   ├── join.py            # POST /api/game/join
│   │   ├── state.py           # GET /api/game/state
│   │   └── move.py            # POST /api/game/move
│   └── chat/                  # Chat API endpoints
│       ├── send.py            # POST /api/chat/send
│       └── list.py            # GET /api/chat/list
├── tests/                      # Test suites
│   ├── test_game_logic.py     # Game logic tests
│   ├── test_game_api.py       # Game API tests
│   └── test_chat_api.py       # Chat API tests
├── public/                     # Static assets
├── .env.example               # Environment variables template
├── vercel.json                # Vercel deployment config
├── requirements.txt           # Python dependencies
├── package.json               # Node.js dependencies
└── tsconfig.json              # TypeScript configuration
```

## 🎨 Cosmic Theme

The application features a custom cosmic color palette:

- **Cosmic colors** (Blues/Purples): `cosmic-50` to `cosmic-950`
- **Galaxy colors** (Vibrant Purples): `galaxy-50` to `galaxy-950`
- **Nebula colors** (Reds/Pinks): `nebula-50` to `nebula-950`
- **Gradient utilities**: Pre-defined cosmic gradient backgrounds
- **Animations**: Float, pulse, and glow effects

## 🛠️ Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **Python 3.8+** and pip
- Git

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd cosmic-tic-tac-toe
```

2. **Install Node.js dependencies**

```bash
npm install
```

3. **Install Python dependencies**

```bash
# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
# Or use npm script
npm run install:python
```

4. **Set up environment variables**

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Next.js Configuration
NEXT_PUBLIC_APP_NAME=Cosmic Tic-Tac-Toe
NEXT_PUBLIC_API_URL=http://localhost:3000

# Database Configuration
DB_PATH=/tmp/game.db

# Python/FastAPI Configuration (for local development)
PYTHON_ENV=development
API_SECRET_KEY=your-secret-key-here
```

5. **Initialize the database**

```bash
python api/_shared/init_db.py --db-path /tmp/game.db --seed
```

**Note**: On Vercel, SQLite databases are ephemeral (reset on each deployment). For production, consider migrating to a persistent database like PostgreSQL or MongoDB.

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The application will:

- Serve Next.js frontend on port 3000
- Serve API endpoints at `/api/*`
- Hot reload on file changes

### Available Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run install:python` - Install Python dependencies

### Running Tests

**Backend tests** (Python):

```bash
# Activate virtual environment first
source venv/bin/activate

# Run all tests
pytest tests/ test_backend.py -v

# Run specific test suites
pytest tests/test_game_logic.py -v      # Game logic (41 tests)
pytest tests/test_game_api.py -v        # Game API (18 tests)
pytest tests/test_chat_api.py -v        # Chat API (20 tests)
pytest test_backend.py -v               # Backend schema (31 tests)
```

**Frontend tests** (TypeScript):

```bash
# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Formatting check
npm run format:check
```

**Test Results**: All 110 tests pass successfully ✅

## 🌐 API Reference

### Game Endpoints

#### POST /api/game/create

Create a new game.

**Request:**

```json
{
  "player_name": "Alice",
  "mode": "classic3",
  "is_ai_opponent": false
}
```

**Response (201 Created):**

```json
{
  "game": {
    "id": "ABC123",
    "mode": "classic3",
    "status": "waiting",
    "created_at": "2024-01-01T00:00:00Z",
    "current_turn": null
  },
  "player_id": "uuid-player-1",
  "invite_code": "ABC123"
}
```

#### POST /api/game/join

Join an existing game using an invite code.

**Request:**

```json
{
  "invite_code": "ABC123",
  "player_name": "Bob"
}
```

**Response (200 OK):**

```json
{
  "player": {
    "id": "uuid-player-2",
    "game_id": "ABC123",
    "player_number": 2,
    "player_name": "Bob"
  },
  "game_id": "ABC123",
  "mode": "classic3"
}
```

#### GET /api/game/state?game_id=ABC123

Get complete game state.

**Response (200 OK):**

```json
{
  "game": { ... },
  "players": [ ... ],
  "moves": [ ... ],
  "messages": [ ... ]
}
```

#### POST /api/game/move

Make a move in the game.

**Request:**

```json
{
  "game_id": "ABC123",
  "player_id": "uuid-player-1",
  "column_index": 0,
  "row_index": 0
}
```

**Response (200 OK):**

```json
{
  "move": { ... },
  "is_winner": false,
  "is_draw": false,
  "game_status": "active"
}
```

### Chat Endpoints

#### POST /api/chat/send

Send a chat message.

**Request:**

```json
{
  "game_id": "ABC123",
  "player_id": "uuid-player-1",
  "text": "Good game!"
}
```

**Response (201 Created):**

```json
{
  "id": 1,
  "game_id": "ABC123",
  "player_id": "uuid-player-1",
  "message_type": "chat",
  "content": "Good game!",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### GET /api/chat/list?game_id=ABC123&since=2024-01-01T00:00:00Z

Get chat messages for a game.

**Response (200 OK):**

```json
{
  "messages": [ ... ]
}
```

### Error Responses

All endpoints return consistent error responses:

```json
{
  "detail": "Error message"
}
```

**HTTP Status Codes:**

- `200 OK` - Successful operation
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `409 Conflict` - Operation conflicts with current state
- `422 Unprocessable Entity` - Validation failed
- `500 Internal Server Error` - Server error

## 🗄️ Database Schema

### Tables

**games**

- `id` (TEXT, PRIMARY KEY) - Unique game identifier (invite code)
- `mode` (TEXT) - Game mode: `classic3` or `gomoku`
- `status` (TEXT) - Game status: `waiting`, `active`, `completed`, `abandoned`
- `created_at`, `started_at`, `finished_at` (TEXT) - ISO 8601 timestamps
- `current_turn` (INTEGER) - Current player turn (1 or 2)
- `winner_id` (TEXT) - ID of winning player (nullable)

**players**

- `id` (TEXT, PRIMARY KEY) - Unique player identifier
- `game_id` (TEXT, FOREIGN KEY) - Associated game
- `player_number` (INTEGER) - Player 1 or 2
- `player_name` (TEXT) - Display name
- `joined_at` (TEXT) - ISO 8601 timestamp
- `is_ai` (INTEGER) - Boolean flag for AI players

**moves**

- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `game_id`, `player_id` (TEXT, FOREIGN KEYS)
- `move_number` (INTEGER) - Sequential move number
- `column_index`, `row_index` (INTEGER) - Board position (0-14)
- `created_at` (TEXT) - ISO 8601 timestamp

**messages**

- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `game_id` (TEXT, FOREIGN KEY)
- `player_id` (TEXT, FOREIGN KEY, nullable)
- `message_type` (TEXT) - `chat` or `system`
- `content` (TEXT) - Message text
- `created_at` (TEXT) - ISO 8601 timestamp

### Constraints & Indices

- Foreign key constraints with CASCADE/SET NULL
- Check constraints for enums and value ranges
- Unique constraints on (game_id, player_number) and (game_id, move_number)
- Optimized indices for common queries

## 🎮 Game Rules

### Classic 3×3

- **Board**: 3×3 grid
- **Win Condition**: Get 3 symbols in a row (horizontal, vertical, or diagonal)
- **Draw**: All 9 cells filled with no winner
- **Players**: 2 players alternate turns
- **Symbol**: Player 1 is X, Player 2 is O

### Gomoku

- **Board**: 15×15 grid (expandable/infinite on frontend)
- **Win Condition**: Get 5 symbols in a row (horizontal, vertical, or diagonal)
- **Draw**: Rare (board is large)
- **Players**: 2 players alternate turns
- **Symbol**: Player 1 is X, Player 2 is O
- **Special Features**: Pan and zoom on large board

## 🏗️ Architecture Overview

### Frontend Architecture

- **App Router**: Next.js 14 file-based routing
- **Server Components**: Default for optimal performance
- **Client Components**: Used for interactivity (`"use client"`)
- **State Management**: React hooks (useState, useEffect, custom hooks)
- **Polling**: 2-second intervals for game state and chat updates
- **Optimistic Updates**: Instant UI feedback before server confirmation

### Backend Architecture

- **Serverless Functions**: Each Python file in `/api` is a serverless function
- **Service Layer**: Business logic in `game_service.py`
- **Data Layer**: Database operations in `db.py`
- **Validation**: Pydantic models for request/response validation
- **CORS**: Configured for cross-origin requests

### Key Design Decisions

1. **Invite Code as Game ID**: Simplifies joining and eliminates mapping tables
2. **Polling vs WebSockets**: Polling chosen for serverless compatibility
3. **SQLite**: Simple and serverless-compatible (ephemeral on Vercel)
4. **Canvas Rendering**: High-performance Gomoku board with viewport culling
5. **Optimistic Updates**: Instant feedback with rollback on errors

## 📦 Deployment

### Deploy to Vercel

1. **Push code to GitHub**

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Import project in Vercel**

- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repository
- Vercel will auto-detect Next.js configuration

3. **Configure environment variables**

In Vercel dashboard, add environment variables:

```env
NEXT_PUBLIC_APP_NAME=Cosmic Tic-Tac-Toe
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app
DB_PATH=/tmp/game.db
PYTHON_ENV=production
API_SECRET_KEY=your-production-secret-key
```

4. **Deploy**

- Click "Deploy"
- Vercel will build and deploy automatically
- Your app will be live at `https://your-project.vercel.app`

### Vercel Configuration

The `vercel.json` file configures:

- **Next.js build** for frontend pages
- **Python runtime** for API endpoints
- **Routing** for API and frontend paths
- **Environment variables** for deployment

### Post-Deployment

- **Database**: SQLite database is ephemeral (resets on deployment)
- **Monitoring**: Use Vercel Analytics for performance insights
- **Logs**: View function logs in Vercel dashboard
- **Custom Domain**: Configure in Vercel project settings

### Local Vercel Testing

Test Vercel deployment locally:

```bash
# Install Vercel CLI
npm i -g vercel

# Run local Vercel environment
vercel dev
```

This simulates the Vercel environment with serverless functions.

## ⚠️ Known Limitations

### SQLite Ephemeral Storage

- **Issue**: SQLite database is stored in `/tmp` on Vercel, which is ephemeral
- **Impact**: All game data is lost on each deployment or function cold start
- **Workaround**: For production, migrate to persistent database:
  - PostgreSQL (Vercel Postgres, Supabase, Neon)
  - MongoDB (MongoDB Atlas)
  - MySQL (PlanetScale)

### Polling vs Real-time

- **Current**: 2-second polling for game state updates
- **Limitation**: Not truly real-time, slight delay
- **Future**: Migrate to WebSockets or Server-Sent Events for instant updates

### No Authentication

- **Current**: No user authentication system
- **Impact**: Anyone with invite code can join games
- **Future**: Add authentication (NextAuth.js, Clerk, or custom JWT)

### No Persistence Across Sessions

- **Current**: Player ID stored in localStorage
- **Impact**: Clearing browser data loses player identity
- **Future**: Add user accounts with persistent sessions

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- **TypeScript/JavaScript**: Follow ESLint and Prettier configurations
- **Python**: Follow PEP 8 style guide
- **Components**: Use functional components with hooks
- **Naming**: Use descriptive names (camelCase for JS/TS, snake_case for Python)

### Running Quality Checks

```bash
# Linting
npm run lint

# Formatting
npm run format

# Type checking
npx tsc --noEmit

# Tests
pytest tests/ test_backend.py -v
```

## 📚 Documentation

Additional documentation:

- [Game API Summary](./GAME_API_SUMMARY.md) - Detailed API documentation
- [Chat API Summary](./CHAT_API_SUMMARY.md) - Chat endpoints documentation
- [Game Service Summary](./GAME_SERVICE_SUMMARY.md) - Backend logic documentation
- [Frontend API Summary](./FRONTEND_API_SUMMARY.md) - Frontend utilities documentation
- [Gomoku Board Implementation](./GOMOKU_BOARD_IMPLEMENTATION.md) - Canvas board details
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Backend schema documentation

## 📝 License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [FastAPI](https://fastapi.tiangolo.com/) - Python web framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Vercel](https://vercel.com/) - Deployment platform

## 📧 Support

For issues and questions:

- Create an issue on GitHub
- Check existing documentation
- Review API documentation above

---

**Built with 💜 using Next.js, FastAPI, and a lot of cosmic energy ✨**
