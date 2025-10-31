# 🔨 Build Instructions

Complete guide for building and compiling the Tic-Tac-Toe/Gomoku application.

## Table of Contents

1. [Build Requirements](#build-requirements)
2. [Local Development Build](#local-development-build)
3. [Production Build](#production-build)
4. [Build Configuration](#build-configuration)
5. [Build Optimization](#build-optimization)
6. [Troubleshooting Builds](#troubleshooting-builds)

## Build Requirements

### System Requirements

- **Node.js**: 18.0 or higher
- **npm**: 9.0 or higher
- **RAM**: 4GB minimum (8GB recommended)
- **Disk Space**: 500MB free space

### Software Dependencies

All dependencies are listed in `package.json` and installed automatically via npm.

#### Production Dependencies

```json
{
  "clsx": "^2.1.1",
  "next": "14.2.0",
  "pusher": "^5.2.0",
  "pusher-js": "^8.4.0",
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "tailwind-merge": "^3.3.1",
  "ws": "^8.18.3"
}
```

#### Development Dependencies

```json
{
  "@types/node": "^20",
  "@types/react": "^18",
  "@types/react-dom": "^18",
  "@types/ws": "^8.18.1",
  "autoprefixer": "^10.4.19",
  "concurrently": "^9.2.1",
  "eslint": "^8",
  "eslint-config-next": "14.2.0",
  "postcss": "^8.4.38",
  "prettier": "^3.2.5",
  "tailwindcss": "^3.4.3",
  "tsx": "^4.20.6",
  "typescript": "^5"
}
```

## Local Development Build

### Quick Start

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev
```

The development server will start on `http://localhost:3000`.

### Development Features

- **Hot Module Replacement (HMR)** - Changes reflect instantly without refresh
- **Fast Refresh** - React components update without losing state
- **Error Overlay** - Build errors shown directly in browser
- **Source Maps** - Debug original TypeScript code

### Development Commands

```bash
# Start dev server on default port (3000)
npm run dev

# Start dev server on custom port
PORT=3001 npm run dev

# Start with verbose logging
npm run dev -- --verbose

# Start in turbo mode (faster builds)
npm run dev -- --turbo
```

## Production Build

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Build Process

The production build process includes:

1. **TypeScript Compilation** - `.ts`/`.tsx` → `.js`
2. **Code Minification** - Reduce file size
3. **Tree Shaking** - Remove unused code
4. **CSS Processing** - Tailwind CSS compilation and optimization
5. **Image Optimization** - Optimize images for web
6. **Route Generation** - Pre-render static pages
7. **Bundle Splitting** - Create optimized chunks

### Build Output

After building, you'll find:

```
.next/
├── cache/              # Build cache (speeds up subsequent builds)
├── server/             # Server-side code
│   ├── app/           # App router pages
│   └── chunks/        # Shared code chunks
├── static/            # Static assets
│   ├── chunks/        # JavaScript bundles
│   ├── css/           # Compiled CSS
│   └── media/         # Optimized images
├── BUILD_ID           # Unique build identifier
└── package.json       # Production package info
```

### Build Statistics

After building, Next.js shows:

```
Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB         92.1 kB
├ ○ /game/[id]                           8.5 kB         95.4 kB
└ ○ /api/*                               0 kB           0 kB

○  (Static)  automatically rendered as static HTML
λ  (Server)  server-side rendered on demand
```

- **Size**: Individual route size
- **First Load JS**: Total JS loaded for first visit
- **Static**: Pre-rendered at build time
- **Server**: Rendered on each request

## Build Configuration

### Next.js Configuration

Configuration is in `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Image optimization
  images: {
    domains: ['example.com'],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
```

### TypeScript Configuration

TypeScript settings in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Tailwind Configuration

Tailwind CSS configuration in `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Custom theme extensions
    },
  },
  plugins: [],
};

export default config;
```

## Build Optimization

### Reducing Bundle Size

1. **Dynamic Imports**

```typescript
// Instead of:
import HeavyComponent from './HeavyComponent';

// Use:
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});
```

2. **Tree Shaking**

```typescript
// Instead of:
import _ from 'lodash';

// Use:
import debounce from 'lodash/debounce';
```

3. **Remove Unused Dependencies**

```bash
# Analyze bundle size
npm run build -- --analyze

# Remove unused packages
npm uninstall unused-package
```

### Improving Build Speed

1. **Use Build Cache**

```bash
# Cache is stored in .next/cache/
# Don't delete it unless troubleshooting
```

2. **Incremental Builds**

```bash
# TypeScript incremental compilation is enabled by default
# See tsconfig.json: "incremental": true
```

3. **Parallel Processing**

```bash
# Next.js automatically uses multiple CPU cores
# No configuration needed
```

### Code Splitting

Next.js automatically splits code by route. You can also manually split:

```typescript
// Lazy load components
const DynamicComponent = dynamic(() => import('@/components/Heavy'), {
  loading: () => <div>Loading...</div>,
  ssr: false, // Disable server-side rendering if not needed
});

// Lazy load with multiple exports
const DynamicComponent = dynamic(
  () => import('@/components/Multi').then((mod) => mod.SpecificComponent)
);
```

### Image Optimization

Use Next.js Image component for automatic optimization:

```typescript
import Image from 'next/image';

export default function MyImage() {
  return (
    <Image
      src="/photo.jpg"
      alt="Description"
      width={500}
      height={300}
      priority // Load image eagerly
      placeholder="blur" // Show blur while loading
    />
  );
}
```

## Troubleshooting Builds

### Build Fails with TypeScript Errors

**Error**: `Type error: Property 'x' does not exist on type 'Y'`

**Solutions**:

```bash
# Check TypeScript errors
npm run type-check

# Fix errors in your code
# Then rebuild
npm run build
```

### Build Fails with Memory Issues

**Error**: `JavaScript heap out of memory`

**Solutions**:

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Or add to package.json:
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}
```

### Build Fails with Module Not Found

**Error**: `Module not found: Can't resolve 'x'`

**Solutions**:

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check import paths (case-sensitive)
# Ensure file exists at specified path
```

### Build is Very Slow

**Symptoms**: Build takes >5 minutes

**Solutions**:

1. **Clear cache and rebuild**:
   ```bash
   rm -rf .next
   npm run build
   ```

2. **Update dependencies**:
   ```bash
   npm update
   ```

3. **Check for large dependencies**:
   ```bash
   npm install -g webpack-bundle-analyzer
   npm run build -- --analyze
   ```

4. **Disable source maps** (not recommended for debugging):
   ```javascript
   // next.config.mjs
   const nextConfig = {
     productionBrowserSourceMaps: false,
   };
   ```

### Build Succeeds but Runtime Errors

**Error**: App builds but crashes when running

**Solutions**:

1. **Check environment variables**:
   ```bash
   # Ensure all required env vars are set
   cat .env.local
   ```

2. **Test production build locally**:
   ```bash
   npm run build
   npm start
   # Visit http://localhost:3000
   ```

3. **Check browser console** for specific errors

4. **Verify API routes** are working:
   ```bash
   curl http://localhost:3000/api/game/test
   ```

### CSS Not Loading

**Error**: Styles missing in production build

**Solutions**:

1. **Check Tailwind configuration**:
   ```typescript
   // tailwind.config.ts
   content: [
     "./app/**/*.{js,ts,jsx,tsx,mdx}",
     "./components/**/*.{js,ts,jsx,tsx,mdx}",
   ],
   ```

2. **Verify CSS imports**:
   ```typescript
   // app/layout.tsx
   import './globals.css';
   ```

3. **Clear cache and rebuild**:
   ```bash
   rm -rf .next
   npm run build
   ```

### Environment Variables Not Working in Build

**Error**: `undefined` values for environment variables

**Solutions**:

1. **Check variable names**:
   - Public variables must start with `NEXT_PUBLIC_`
   - Server variables don't need prefix

2. **Verify .env.local exists**:
   ```bash
   ls -la .env.local
   cat .env.local
   ```

3. **Rebuild after changing env vars**:
   ```bash
   npm run build
   ```

4. **Check build-time vs runtime variables**:
   - `NEXT_PUBLIC_*`: Available at build time and runtime
   - Regular env vars: Only available at runtime

## Build Commands Reference

### npm Scripts

```bash
# Development
npm run dev              # Start dev server
npm run dev -- --turbo   # Start with Turbo (faster)

# Production
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint -- --fix    # Auto-fix lint issues
npm run format           # Format code with Prettier
npm run format:check     # Check formatting without changes
npm run type-check       # Check TypeScript types

# Cleaning
rm -rf .next             # Clear build cache
rm -rf node_modules      # Remove dependencies
```

### Build Flags

```bash
# Next.js build flags
npm run build -- --debug              # Debug output
npm run build -- --profile            # Profile build performance
npm run build -- --no-lint            # Skip linting during build
npm run build -- --experimental-debug # Experimental features
```

## CI/CD Build Configuration

### GitHub Actions

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_PUSHER_KEY: ${{ secrets.PUSHER_KEY }}
          NEXT_PUBLIC_PUSHER_CLUSTER: ${{ secrets.PUSHER_CLUSTER }}
```

### Vercel Build

Vercel automatically runs:

```bash
npm install     # Install dependencies
npm run build   # Build project
```

Configure in `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "outputDirectory": ".next"
}
```

## Performance Benchmarks

### Expected Build Times

| Environment | Cold Build | Warm Build |
|-------------|-----------|-----------|
| Local (M1 Mac) | 45s | 12s |
| Local (Intel i7) | 60s | 18s |
| Vercel | 90s | 30s |
| GitHub Actions | 120s | 45s |

### Expected Bundle Sizes

| Route | Size | First Load JS |
|-------|------|---------------|
| / (Home) | ~5 kB | ~90 kB |
| /game/[id] | ~8 kB | ~95 kB |

### Optimization Goals

- **Total JS**: < 100 kB (first load)
- **Build Time**: < 2 minutes (CI/CD)
- **Lighthouse Score**: > 90

---

**Need help?** Check the [main README](./README.md) or [Troubleshooting](#troubleshooting-builds) section.

**Last Updated**: 2024-10-31
