# Quick Start Guide

Get Cosmic Tic-Tac-Toe & Gomoku running in 5 minutes!

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- Python 3.8+ ([Download](https://www.python.org/downloads/))
- Git

## Installation (5 Steps)

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd cosmic-tic-tac-toe

# Install Node.js dependencies
npm install
```

### 2. Set Up Python (Optional, for running tests)

```bash
# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
# Copy example environment file
cp .env.example .env.local
```

The defaults in `.env.example` work fine for local development!

### 4. Initialize Database

```bash
# Activate Python venv (if not already active)
source venv/bin/activate

# Initialize database with sample data
python api/_shared/init_db.py --db-path /tmp/game.db --seed
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## First Game

1. **Create a game**:
   - Click "Create Game" on the home page
   - Choose "Classic 3×3" or "Gomoku 5-in-a-row"
   - Copy the invite code shown

2. **Join from another window**:
   - Open a new browser window (or incognito)
   - Go to [http://localhost:3000](http://localhost:3000)
   - Paste the invite code
   - Click "Join Game"

3. **Play**:
   - Take turns clicking on the board
   - Try the chat feature!
   - Win by getting 3-in-a-row (Classic) or 5-in-a-row (Gomoku)

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Quality Checks
npm run lint             # Check for code issues
npm run format           # Format code
npx tsc --noEmit         # Check TypeScript types

# Testing (with Python venv active)
pytest tests/ test_backend.py -v    # Run all tests
```

## Project Structure (Quick Reference)

```
.
├── app/              # Next.js pages
│   ├── page.tsx      # Home page
│   └── game/[id]/    # Game page
├── components/       # React components
├── lib/             # Frontend utilities
├── api/             # FastAPI backend
│   ├── game/        # Game endpoints
│   └── chat/        # Chat endpoints
└── tests/           # Test suites
```

## Troubleshooting

### "Module not found" errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Python import errors

```bash
# Make sure venv is activated
source venv/bin/activate

# Reinstall Python packages
pip install -r requirements.txt
```

### Database errors

```bash
# Reinitialize database
python api/_shared/init_db.py --db-path /tmp/game.db --seed
```

### Port 3000 already in use

```bash
# Use a different port
PORT=3001 npm run dev
```

## Next Steps

- Read the [full README](./README.md) for complete documentation
- Check [API documentation](./GAME_API_SUMMARY.md) for endpoint details
- Review [QA validation](./QA_VALIDATION.md) for testing guide
- Deploy to [Vercel](https://vercel.com) (see README.md deployment section)

## Need Help?

- Check the [README.md](./README.md) for detailed documentation
- Review existing [implementation summaries](./IMPLEMENTATION_SUMMARY.md)
- Open an issue on GitHub

---

**Happy gaming! 🎮✨**
