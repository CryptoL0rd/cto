# Next.js + FastAPI Monorepo

A modern full-stack monorepo combining Next.js 14 (App Router) with FastAPI, featuring a cosmic-themed design system and configured for seamless Vercel deployment.

## 🚀 Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with custom cosmic theme
- **React 18** - Latest React features

### Backend

- **FastAPI** - Modern Python web framework
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

### Tooling

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Strict TypeScript** - Enhanced type checking

## 📁 Project Structure

```
.
├── app/                 # Next.js App Router pages
├── components/          # React components
├── lib/                 # Utility functions
├── api/                 # FastAPI Python backend
│   ├── _shared/        # Shared Python utilities
│   └── *.py            # API endpoints
├── public/             # Static assets
├── .env.example        # Environment variables template
├── vercel.json         # Vercel deployment config
└── requirements.txt    # Python dependencies
```

## 🎨 Cosmic Theme

The project includes a custom "cosmic" theme with:

- **Cosmic colors** - Blues and purples (cosmic-50 to cosmic-950)
- **Galaxy colors** - Vibrant purples (galaxy-50 to galaxy-950)
- **Nebula colors** - Reds and pinks (nebula-50 to nebula-950)
- **Gradient utilities** - Pre-defined gradient backgrounds
- **Custom components** - Cosmic buttons and cards

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- pip

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd <project-directory>
```

2. Install Node.js dependencies

```bash
npm install
```

3. Install Python dependencies (optional for local FastAPI development)

```bash
npm run install:python
# or
pip install -r requirements.txt
```

4. Set up environment variables

```bash
cp .env.example .env.local
```

### Development

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Available Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run install:python` - Install Python dependencies

## 🌐 API Routes

Python API endpoints are located in the `/api` directory and are automatically deployed as serverless functions on Vercel.

Example endpoint: `/api/hello`

## 📦 Deployment

This project is configured for deployment on Vercel with both Next.js and FastAPI endpoints.

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables
4. Deploy!

The `vercel.json` configuration handles routing for both Next.js pages and Python API endpoints.

## 🔧 Configuration Files

- `tsconfig.json` - TypeScript configuration with strict mode enabled
- `tailwind.config.ts` - Tailwind CSS with cosmic theme
- `next.config.mjs` - Next.js configuration
- `vercel.json` - Vercel deployment configuration
- `.eslintrc.json` - ESLint rules
- `.prettierrc` - Prettier formatting rules

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

## 📝 License

MIT
