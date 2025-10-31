# 🚀 Vercel Deployment Guide

Complete guide to deploying the Tic-Tac-Toe/Gomoku game to Vercel.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Deploy](#quick-deploy)
3. [Detailed Setup](#detailed-setup)
4. [Environment Variables](#environment-variables)
5. [Vercel Configuration](#vercel-configuration)
6. [Post-Deployment](#post-deployment)
7. [Continuous Deployment](#continuous-deployment)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying to Vercel, ensure you have:

- ✅ **GitHub Account** - [Sign up](https://github.com/join)
- ✅ **Vercel Account** - [Sign up](https://vercel.com/signup) (free tier available)
- ✅ **Pusher Account** - [Sign up](https://pusher.com) (free tier available)
- ✅ **Project in GitHub** - Repository pushed to GitHub
- ✅ **Pusher Credentials** - App ID, Key, Secret, Cluster

## Quick Deploy

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/your-repo)

After clicking, you'll be prompted to add environment variables (see [Environment Variables](#environment-variables)).

## Detailed Setup

### Step 1: Prepare Your Repository

Ensure your code is pushed to GitHub:

```bash
# Check current status
git status

# Add any uncommitted changes
git add .

# Commit changes
git commit -m "Ready for Vercel deployment"

# Push to GitHub
git push origin main
```

### Step 2: Import Project to Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Sign in with your GitHub account

2. **Import Repository**
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will automatically detect Next.js

3. **Configure Project**
   - **Project Name**: Choose a name (e.g., `cosmic-tic-tac-toe`)
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

### Step 3: Set Up Environment Variables

Before deploying, add these environment variables in the Vercel UI:

#### Required Variables

| Variable | Value | Notes |
|----------|-------|-------|
| `PUSHER_APP_ID` | `123456` | From Pusher dashboard |
| `PUSHER_KEY` | `abcdef123456` | From Pusher dashboard |
| `PUSHER_SECRET` | `xyz789secret` | From Pusher dashboard (keep secret!) |
| `PUSHER_CLUSTER` | `us2` | Your Pusher cluster region |
| `NEXT_PUBLIC_PUSHER_KEY` | `abcdef123456` | Same as PUSHER_KEY |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | `us2` | Same as PUSHER_CLUSTER |

#### How to Add Variables in Vercel:

1. In the import screen, expand **"Environment Variables"**
2. For each variable:
   - Enter **Name** (e.g., `PUSHER_APP_ID`)
   - Enter **Value** (your actual credential)
   - Select **Production**, **Preview**, and **Development** checkboxes
3. Click **"Add"**
4. Repeat for all variables

> 💡 **Tip**: `NEXT_PUBLIC_*` variables are exposed to the browser. Never put secrets in them.

### Step 4: Deploy

1. Click **"Deploy"** button
2. Wait for build process (usually 2-3 minutes)
3. Watch the build logs for any errors
4. Once complete, Vercel will provide a URL

### Step 5: Verify Deployment

Test your deployed application:

1. **Visit your deployment URL** (e.g., `https://your-app.vercel.app`)
2. **Test homepage** - Should load without errors
3. **Create a game** - Click "Create Game" and choose a mode
4. **Copy invite code** - Note the 6-character code
5. **Join from another device/browser** - Open the URL in incognito/another device
6. **Test real-time updates**:
   - Make a move in one browser
   - Should appear instantly in the other
7. **Test chat** - Send messages and verify they appear in both browsers

## Environment Variables

### Detailed Variable Reference

#### Pusher Variables (Required)

```env
# Server-side Pusher configuration
PUSHER_APP_ID=your-app-id
PUSHER_KEY=your-key-here
PUSHER_SECRET=your-secret-here
PUSHER_CLUSTER=us2

# Client-side Pusher configuration (exposed to browser)
NEXT_PUBLIC_PUSHER_KEY=your-key-here
NEXT_PUBLIC_PUSHER_CLUSTER=us2
```

### Getting Pusher Credentials

1. **Sign up for Pusher**
   - Go to [pusher.com](https://pusher.com)
   - Create a free account

2. **Create a Channels App**
   - Click "Create App"
   - Choose "Channels" product
   - Name: `cosmic-tic-tac-toe`
   - Cluster: Choose nearest to your users (e.g., `us2`, `eu`, `ap1`)
   - Frontend: React
   - Backend: Node.js

3. **Get Credentials**
   - Go to "App Keys" tab
   - Copy: app_id, key, secret, cluster

4. **Test Connection**
   - Use the Pusher Debug Console to verify events are being sent

### Updating Environment Variables

After deployment, you can update variables:

1. **Go to Project Settings**
   - Vercel Dashboard → Your Project → Settings

2. **Navigate to Environment Variables**
   - Settings → Environment Variables

3. **Add/Edit Variable**
   - Click "Add" or edit existing
   - Enter name and value
   - Select environments (Production, Preview, Development)

4. **Redeploy**
   - Environment variable changes require redeployment
   - Go to Deployments → Latest → Redeploy

## Vercel Configuration

### vercel.json Explained

The project includes a `vercel.json` configuration file:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": ".next",
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10
    }
  }
}
```

#### Configuration Options

- **framework**: Tells Vercel this is a Next.js project
- **buildCommand**: Command to build the project
- **devCommand**: Command for local development
- **installCommand**: Command to install dependencies
- **outputDirectory**: Where Next.js outputs built files
- **regions**: Deployment regions (`iad1` = US East)
- **functions**: Serverless function configuration
  - **maxDuration**: Maximum execution time (10 seconds)

### Custom Configuration

You can customize `vercel.json` for:

#### Custom Headers

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,OPTIONS" }
      ]
    }
  ]
}
```

#### Redirects

```json
{
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ]
}
```

#### Rewrites

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

## Post-Deployment

### Custom Domain Setup

Add a custom domain to your Vercel project:

1. **Go to Domains Settings**
   - Project → Settings → Domains

2. **Add Domain**
   - Enter your domain (e.g., `cosmic-game.com`)
   - Click "Add"

3. **Configure DNS**
   - Vercel will provide DNS records
   - Add these to your domain registrar:
     ```
     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     ```

4. **Wait for Propagation**
   - DNS changes can take up to 48 hours
   - Check status in Vercel dashboard

5. **Update Environment Variables** (if needed)
   - No action required - Vercel handles this automatically

### SSL/HTTPS

Vercel automatically provides SSL certificates for all deployments:
- ✅ Automatic SSL for `.vercel.app` domains
- ✅ Automatic SSL for custom domains
- ✅ Free Let's Encrypt certificates
- ✅ Auto-renewal before expiration

### Performance Monitoring

Enable Vercel Analytics:

1. **Go to Analytics**
   - Project → Analytics

2. **Enable Analytics**
   - Click "Enable Analytics"
   - Choose plan (free tier available)

3. **View Metrics**
   - Page views
   - Unique visitors
   - Web Vitals (Core Web Vitals)
   - Geographic distribution

### Error Tracking

View real-time errors:

1. **Go to Logs**
   - Project → Logs

2. **Filter by**
   - Time range
   - Function (API route)
   - Status code
   - Search term

3. **Set Up Alerts** (optional)
   - Integrations → Add Integration
   - Choose: Slack, Discord, Email, etc.

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:

### Branch Deployments

- **Main/Master Branch** → Production deployment
- **Other Branches** → Preview deployments

### Pull Request Previews

1. Create a pull request on GitHub
2. Vercel automatically creates a preview deployment
3. Comment with preview URL is added to PR
4. Test changes before merging

### Manual Deployment

Deploy manually via CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# List all deployments
vercel ls

# View logs
vercel logs <deployment-url>
```

### Rollback to Previous Deployment

If something breaks:

1. **Go to Deployments**
   - Project → Deployments

2. **Find Previous Working Deployment**
   - Browse deployment history

3. **Promote to Production**
   - Click on deployment
   - Click "Promote to Production"

Or via CLI:

```bash
# List deployments
vercel ls

# Promote specific deployment
vercel promote <deployment-url>
```

## Troubleshooting

### Build Fails

**Error**: Build fails during deployment

**Solutions**:

1. **Test build locally**:
   ```bash
   npm run build
   ```

2. **Check for TypeScript errors**:
   ```bash
   npm run type-check
   ```

3. **Check for linting errors**:
   ```bash
   npm run lint
   ```

4. **Check Vercel build logs**:
   - Go to Deployments → Latest Deployment → Build Logs

5. **Common issues**:
   - Missing dependencies in `package.json`
   - TypeScript errors
   - Import path issues (case sensitivity)
   - Environment variables missing at build time

### Environment Variables Not Working

**Error**: `undefined` values for environment variables

**Solutions**:

1. **Check variable names**:
   - Must match exactly (case-sensitive)
   - Public variables must start with `NEXT_PUBLIC_`

2. **Redeploy after changes**:
   - Environment variable changes require redeployment

3. **Check deployment environment**:
   - Ensure variables are set for Production environment

4. **Verify in Vercel dashboard**:
   - Settings → Environment Variables
   - Click "Reveal" to see actual values

### Real-time Updates Not Working

**Error**: Moves don't appear in real-time, need to refresh

**Solutions**:

1. **Verify Pusher credentials**:
   - Check all 6 environment variables are set
   - Verify values match Pusher dashboard

2. **Check Pusher connection**:
   - Open browser DevTools → Console
   - Look for Pusher connection messages
   - Should see "Pusher connected"

3. **Test Pusher directly**:
   - Go to Pusher dashboard → Debug Console
   - Make a move in your app
   - Should see events in Debug Console

4. **Check cluster**:
   - Ensure `PUSHER_CLUSTER` matches your Pusher app cluster

### Function Timeout Errors

**Error**: API routes timing out

**Solutions**:

1. **Increase timeout in vercel.json**:
   ```json
   {
     "functions": {
       "app/api/**/*.ts": {
         "maxDuration": 10
       }
     }
   }
   ```

2. **Optimize API routes**:
   - Reduce processing time
   - Use caching where possible
   - Optimize database queries

3. **Check Vercel plan limits**:
   - Free: 10s max
   - Pro: 60s max
   - Enterprise: Custom

### Memory Issues

**Error**: Functions running out of memory

**Solutions**:

1. **Increase memory in vercel.json**:
   ```json
   {
     "functions": {
       "app/api/**/*.ts": {
         "maxDuration": 10,
         "memory": 1024
       }
     }
   }
   ```

2. **Optimize memory usage**:
   - Clean up unused variables
   - Stream large responses
   - Use pagination

### CORS Errors

**Error**: Cross-origin request blocked

**Solutions**:

1. **Add CORS headers in API routes**:
   ```typescript
   export async function POST(request: Request) {
     return NextResponse.json(data, {
       headers: {
         'Access-Control-Allow-Origin': '*',
         'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
       },
     });
   }
   ```

2. **Add to vercel.json**:
   ```json
   {
     "headers": [
       {
         "source": "/api/(.*)",
         "headers": [
           { "key": "Access-Control-Allow-Origin", "value": "*" }
         ]
       }
     ]
   }
   ```

### Game State Lost

**Error**: Games disappear after deployment

**This is expected behavior**. The current implementation uses in-memory storage.

**Solutions**:

1. **For testing**: Accept that data resets
2. **For production**: Migrate to persistent storage:
   - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
   - [Upstash Redis](https://upstash.com/)
   - [PlanetScale MySQL](https://planetscale.com/)
   - [Supabase Postgres](https://supabase.com/)

## Additional Resources

### Official Documentation

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

### Video Tutorials

- [Deploying Next.js to Vercel](https://www.youtube.com/watch?v=2HBIzEx6IZA)
- [Environment Variables in Vercel](https://www.youtube.com/watch?v=vQ8k9r5d-bQ)

### Community

- [Vercel Discord](https://vercel.com/discord)
- [GitHub Discussions](https://github.com/vercel/vercel/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/vercel)

## Checklist

Before deploying, verify:

- [ ] Code builds successfully locally (`npm run build`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] All environment variables documented
- [ ] Pusher credentials ready
- [ ] Repository pushed to GitHub
- [ ] `.gitignore` properly configured
- [ ] `vercel.json` configured
- [ ] README.md up to date

After deploying, verify:

- [ ] Homepage loads without errors
- [ ] Can create a game
- [ ] Can join a game with invite code
- [ ] Moves update in real-time
- [ ] Chat works
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] SSL certificate active (HTTPS)

---

**Need help?** Check the [main README](./README.md) or open an issue.

**Last Updated**: 2024-10-31
