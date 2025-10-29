# Monorepo - Next.js 14 + Python API

A modern monorepo with Next.js 14 App Router frontend and Python serverless API backend.

## 🏗️ Structure

```
├── app/                      # Next.js 14 frontend application
│   ├── app/                  # App Router pages and API routes
│   ├── components/           # Reusable React components
│   ├── lib/                  # Utility functions and helpers
│   ├── styles/               # Additional CSS files
│   └── public/               # Static assets
├── api/                      # Python serverless functions
│   └── health.py             # Health check endpoint
├── vercel.json               # Vercel deployment configuration
└── requirements.txt          # Python dependencies
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+ (for local API testing)

### Installation

```bash
cd app
npm install
```

### Development

```bash
cd app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### API Endpoints

- `GET /api/health` - Frontend health check endpoint

## 📦 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Strict mode enabled for type safety
- **TailwindCSS 3** - Utility-first CSS with custom dark theme
- **ESLint** - Code linting
- **Prettier** - Code formatting

### Backend
- **Python 3.11** - Serverless functions runtime (Vercel)

## 🛠️ Available Scripts

Run these commands from the `app` directory:

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run test` - Run tests (placeholder)
- `npm run type-check` - Run TypeScript type checking

## 🎨 Theme & Styling

The project includes a custom dark theme with CSS variables defined in `app/app/globals.css`. The theme automatically switches based on system preferences (`prefers-color-scheme`).

### Custom Theme Colors

- Primary (blue shades)
- Secondary (gray shades)
- Accent (purple shades)
- Muted, Card, Border colors
- Customizable border radius via `--radius`

## 🌐 Deployment

This project is configured for deployment on Vercel with automatic Python runtime detection for `/api` functions.

### Deploy to Vercel

```bash
vercel deploy
```

## 📝 Configuration Files

- `tsconfig.json` - TypeScript configuration (strict mode)
- `tailwind.config.ts` - TailwindCSS configuration
- `postcss.config.js` - PostCSS configuration
- `.eslintrc.json` - ESLint configuration
- `.prettierrc` - Prettier configuration
- `vercel.json` - Vercel deployment settings
- `.env.example` - Environment variable template

## 🧪 Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp app/.env.example app/.env.local
```

Edit the values as needed for your environment.

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Vercel Python Runtime](https://vercel.com/docs/functions/runtimes/python)

## 📄 License

This project is licensed under the MIT License.
