# Vercel Deployment - Quick Reference

> **TL;DR**: Deploy frontend to Vercel, backend to Railway, use MongoDB Atlas + Upstash Redis

## 🚀 Fastest Way to Deploy (15 minutes)

### Step 1: External Services (5 min)

```bash
# MongoDB Atlas
1. Visit: https://www.mongodb.com/atlas
2. Create free cluster → Get connection string
3. Save as: DATABASE_URL

# Upstash Redis  
1. Visit: https://upstash.com
2. Create database → Get credentials
3. Save: REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
```

### Step 2: Deploy Backend (5 min)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
cd apps/api
railway login
railway init
railway up

# Set environment variables in Railway dashboard
railway open
# Add: DATABASE_URL, REDIS_*, JWT_SECRET, GEMINI_API_KEY

# Get Railway URL
railway domain
# Save this URL!
```

### Step 3: Deploy Frontend (5 min)

```bash
# Install Vercel CLI
npm install -g vercel

# Configure
cd apps/client
echo "VITE_API_URL=https://your-app.railway.app" > .env.production

# Deploy
vercel login
vercel --prod

# Done! ✅
```

---

## 📋 Commands Cheat Sheet

### Vercel Commands

```bash
# Login
vercel login

# First deployment (interactive)
vercel

# Production deployment
vercel --prod

# Set environment variable
vercel env add VITE_API_URL production

# View logs
vercel logs

# Open dashboard
vercel inspect
```

### Railway Commands

```bash
# Login
railway login

# Initialize project
railway init

# Deploy
railway up

# Set environment variable
railway variables set KEY=value

# View logs
railway logs

# Get domain
railway domain

# Open dashboard
railway open

# Check status
railway status
```

---

## 🔧 Essential Environment Variables

### Backend (Railway)
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/dbname
REDIS_HOST=host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your_password
JWT_SECRET=$(openssl rand -base64 32)
GEMINI_API_KEY=your_key
```

### Frontend (Vercel)
```env
VITE_API_URL=https://your-app.railway.app
```

---

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| CORS Error | Add Vercel domain to CORS in `apps/api/src/main.ts` |
| Can't connect to DB | Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0) |
| Redis timeout | Verify Upstash credentials are correct |
| 401 Unauthorized | Clear localStorage, login again |
| Build failed | Run `npm run build` locally first to debug |

---

## 📦 Alternative Deployment Options

### Option 1: Vercel + Railway (Recommended)
- ✅ Frontend on Vercel (fast CDN)
- ✅ Backend on Railway (persistent server)
- ✅ Best performance
- 💰 $0-5/month

### Option 2: All on Render
- ✅ One platform for everything
- ✅ Docker support
- ✅ Simpler setup
- 💰 Free tier available

### Option 3: All on Fly.io
- ✅ Global edge network
- ✅ Docker-native
- ✅ Great for full-stack
- 💰 Free tier available

---

## 🔗 Important URLs

### Services
- **Vercel**: https://vercel.com/dashboard
- **Railway**: https://railway.app/dashboard  
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Upstash**: https://console.upstash.com

### Documentation
- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Deployment Guide**: `./VERCEL_DEPLOYMENT.md`
- **Full Checklist**: `./VERCEL_DEPLOYMENT_CHECKLIST.md`

---

## 🎯 Quick Deploy Script

Use the included script:

```bash
chmod +x deploy-vercel.sh
./deploy-vercel.sh
```

---

## ✅ Deployment Verification

After deployment, verify everything works:

```bash
# Check backend
curl https://your-app.railway.app/api

# Check frontend  
curl https://your-app.vercel.app

# Full test
1. Open frontend URL in browser
2. Register new account
3. Login
4. Generate content
5. Check if content appears
```

---

## 📞 Need More Help?

- 📖 Full Guide: `VERCEL_DEPLOYMENT.md`
- ✅ Step-by-step: `VERCEL_DEPLOYMENT_CHECKLIST.md`
- 🤖 CI/CD Setup: `.github/GITHUB_ACTIONS_SETUP.md`
- 🐳 Docker Alternative: `DOCKER_DEPLOYMENT.md`

---

## 💡 Pro Tips

1. **Use environment-specific configs**
   - Development: `.env.development`
   - Production: `.env.production`

2. **Monitor your apps**
   - Enable Vercel Analytics (free)
   - Check Railway metrics regularly

3. **Set up custom domains**
   - Vercel: Project Settings → Domains
   - Railway: Project Settings → Domains

4. **Enable auto-deployment**
   - Connect GitHub to both platforms
   - Push to `main` = auto-deploy

5. **Keep secrets secure**
   - Never commit `.env` files
   - Rotate tokens every 3 months
   - Use GitHub Secrets for CI/CD

---

## 🎉 That's It!

Your app should now be live at:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app.railway.app`

Happy deploying! 🚀
