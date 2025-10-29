# Deployment Checklist

Use this checklist to ensure smooth deployment to Vercel.

## Pre-Deployment

### Code Quality

- [x] All tests pass (`pytest tests/ test_backend.py -v`)
- [x] Build succeeds (`npm run build`)
- [x] No ESLint errors (`npm run lint`)
- [x] No TypeScript errors (`npx tsc --noEmit`)
- [x] Code formatted (`npm run format:check`)

### Documentation

- [x] README.md is complete and accurate
- [x] API endpoints documented
- [x] Environment variables documented in `.env.example`
- [x] Known limitations documented

### Files

- [x] `.vercelignore` configured
- [x] `vercel.json` present and correct
- [x] `.gitignore` configured
- [x] No sensitive data in code

## Deployment Steps

### 1. Prepare Repository

```bash
# Ensure all changes are committed
git status
git add .
git commit -m "Ready for deployment"

# Push to GitHub
git push origin main
```

### 2. Vercel Setup

1. Go to [vercel.com](https://vercel.com)
2. Sign in or create account
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js

### 3. Configure Environment Variables

In Vercel dashboard → Settings → Environment Variables, add:

```
NEXT_PUBLIC_APP_NAME=Cosmic Tic-Tac-Toe
NEXT_PUBLIC_API_URL=https://your-project.vercel.app
DB_PATH=/tmp/game.db
PYTHON_ENV=production
API_SECRET_KEY=<generate-secure-key>
```

**Important**: Replace `your-project.vercel.app` with your actual Vercel domain.

To generate a secure key:

```bash
openssl rand -base64 32
```

### 4. Deploy

1. Click "Deploy" in Vercel dashboard
2. Wait for build to complete (2-3 minutes)
3. Check deployment logs for errors

### 5. Post-Deployment Testing

#### Basic Functionality

- [ ] Homepage loads successfully
- [ ] Create game works
- [ ] Join game works
- [ ] Game board renders
- [ ] Moves can be placed
- [ ] Chat works
- [ ] API endpoints respond

#### Test Game Flow

1. [ ] Create a Classic 3×3 game
2. [ ] Copy invite code
3. [ ] Open incognito window
4. [ ] Join game with invite code
5. [ ] Play a complete game
6. [ ] Verify winner detection
7. [ ] Test chat messages

8. [ ] Create a Gomoku game
9. [ ] Join from another browser
10. [ ] Test panning on board
11. [ ] Place several moves
12. [ ] Verify board updates

#### Test on Multiple Devices

- [ ] Desktop Chrome
- [ ] Desktop Firefox
- [ ] Desktop Safari
- [ ] Mobile Chrome (iOS)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

#### Performance

- [ ] Page loads in <3 seconds
- [ ] Move placement feels instant
- [ ] No console errors
- [ ] No 404s in network tab

### 6. Monitor

- [ ] Check Vercel logs for errors
- [ ] Monitor function invocations
- [ ] Watch for timeout errors
- [ ] Note cold start times

## Known Issues on Vercel

### SQLite Database is Ephemeral

⚠️ **Important**: The SQLite database is stored in `/tmp` on Vercel, which means:

- Data resets on each deployment
- Data may be lost on function cold starts
- Not suitable for production use

**Solutions**:

1. **For testing**: Acceptable, data loss is expected
2. **For production**: Migrate to persistent database:
   - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
   - [Supabase](https://supabase.com/)
   - [MongoDB Atlas](https://www.mongodb.com/atlas)
   - [Neon](https://neon.tech/)
   - [PlanetScale](https://planetscale.com/)

### Python Function Cold Starts

- First request after inactivity may be slow (2-5 seconds)
- Subsequent requests are fast (<500ms)
- This is normal for serverless functions

## Troubleshooting

### Build Fails

```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Check for linting errors
npm run lint
```

### API Endpoints Return 404

- Check `vercel.json` routing configuration
- Verify Python files in `/api` directory
- Check Vercel function logs

### Database Errors

- Verify `DB_PATH=/tmp/game.db` in environment variables
- Check Python function logs
- Database will reset on deployment (expected)

### Environment Variables Not Working

- Ensure variables are set in Vercel dashboard
- Redeploy after changing environment variables
- `NEXT_PUBLIC_*` variables must be set at build time

### CORS Errors

- Verify `NEXT_PUBLIC_API_URL` matches your domain
- Check CORS middleware in Python API files
- Clear browser cache and cookies

## Rollback Plan

If deployment fails:

1. **Revert to Previous Deployment**:
   - Go to Vercel dashboard → Deployments
   - Find last working deployment
   - Click "Promote to Production"

2. **Fix and Redeploy**:
   ```bash
   git revert HEAD
   git push origin main
   ```

## Custom Domain (Optional)

### Add Custom Domain

1. Go to Vercel dashboard → Settings → Domains
2. Add your domain (e.g., `cosmic-game.com`)
3. Configure DNS records as instructed by Vercel
4. Wait for DNS propagation (up to 48 hours)

### Update Environment Variables

After adding custom domain:

```
NEXT_PUBLIC_API_URL=https://cosmic-game.com
```

Redeploy for changes to take effect.

## Production Monitoring

### Vercel Analytics

1. Enable Vercel Analytics in dashboard
2. Monitor page views, performance, web vitals

### Error Tracking (Optional)

Consider adding:

- [Sentry](https://sentry.io/) for error tracking
- [LogRocket](https://logrocket.com/) for session replay
- [Datadog](https://www.datadoghq.com/) for comprehensive monitoring

## Maintenance

### Regular Tasks

- [ ] Monitor error rates weekly
- [ ] Review function logs for issues
- [ ] Check for dependency updates monthly
- [ ] Update documentation as needed

### Updating the Application

```bash
# 1. Make changes locally
git checkout -b feature/my-feature
# ... make changes ...

# 2. Test thoroughly
npm run build
npm run lint
pytest tests/ test_backend.py -v

# 3. Commit and push
git add .
git commit -m "Description of changes"
git push origin feature/my-feature

# 4. Create pull request on GitHub
# 5. Merge to main after review
# 6. Vercel auto-deploys main branch
```

## Support

### Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

### Getting Help

1. Check deployment logs in Vercel dashboard
2. Review this project's README.md
3. Check Vercel status page: [vercel-status.com](https://www.vercel-status.com/)
4. Ask in Vercel Discord or GitHub discussions

---

**Last Updated**: 2024-10-29  
**Status**: Ready for deployment ✅
