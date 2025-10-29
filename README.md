# Cosmic Monorepo Starter

A cosmic-themed monorepo bootstrapped with **Next.js 14 App Router**, **TypeScript**, **TailwindCSS**, and a **FastAPI** backend.

## Overview

- Opinionated Next.js frontend with a custom dark "cosmic" design system.
- Python FastAPI backend scaffold with asynchronous SQLite support.
- Shared tooling for linting, formatting, and Git hooks via Husky & lint-staged.
- Ready for deployment on Vercel with Python runtime routing.

## Tech Stack

### Frontend

- Next.js 14 with the App Router
- React 19 & TypeScript (strict mode)
- TailwindCSS v4 with custom theme tokens
- React Query for data synchronization

### Backend

- FastAPI (Python 3.11 runtime)
- Pydantic v2 for data validation
- aiosqlite/sqlite-utils for async persistence
- python-dotenv for environment management

### Tooling

- ESLint & Prettier with Tailwind plugin
- Husky + lint-staged (pre-commit automation)
- Vercel deployment configuration

## Project Structure

```
├── app/                # Next.js App Router routes
├── components/         # Shared UI primitives
├── lib/                # Frontend utilities
├── styles/             # Global Tailwind styles & tokens
├── api/                # Backend source (FastAPI)
│   └── _shared/        # Shared schemas & helpers
├── scripts/            # Python/Node scripts
├── public/             # Static assets
├── requirements.txt    # Backend dependencies
├── vercel.json         # Deployment configuration
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18.18+
- Python 3.11+

### Installation

```bash
npm install
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Development

```bash
# Start the Next.js dev server
npm run dev

# Run linting
npm run lint

# Format code
npm run format

# Backend tests (pytest)
npm run test:backend
```

### Database Initialization

```bash
python scripts/init_db.py
```

> Update `api/_shared/schema.sql` to match your data needs before initializing the database.

## Deployment

- Frontend hosted via Vercel (`vercel.json` handles build & routing).
- Python API functions run on the Vercel Python 3.11 runtime.
- Add environment variables through the deployment provider (see `.env.example`).

## API Docs _(placeholder)_

- Define FastAPI routes under `api/`.
- Document available endpoints, authentication, and schemas here.

## Screenshots _(placeholder)_

> Add UI screenshots and deployment references as the project evolves.

---

Crafted with 🌌 by the Cosmic UI team. Contributions welcome!
