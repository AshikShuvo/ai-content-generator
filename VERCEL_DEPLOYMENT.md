# Vercel Deployment Guide for AI Content Creator Monorepo

## Overview

Deploying this full-stack monorepo to Vercel requires careful consideration because:

1. **Vercel is optimized for frontend apps** (especially Next.js)
2. **Your NestJS API needs a persistent server** (not serverless)
3. **You need MongoDB and Redis** running 24/7

## Recommended Approach: Hybrid Deployment

### Option 1: Split Deployment (Recommended)

Deploy different parts to services optimized for them:

#### Frontend (Client) → Vercel ✅
- **Perfect fit** for Vercel
- Static site with React + Vite
- Fast global CDN
- Easy CI/CD

#### Backend (API) → Railway/Render/DigitalOcean 🚀
- NestJS needs a persistent Node.js server
- Bull queues need Redis connection
- Better suited for PaaS platforms

#### Databases → Managed Services 💾
- **MongoDB**: MongoDB Atlas (free tier available)
- **Redis**: Upstash or Redis Cloud (free tier available)

---

## Step-by-Step: Split Deployment

### 1. Deploy MongoDB (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free cluster
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/ai-content-creator`
4. Whitelist IP: `0.0.0.0/0` (or specific IPs)

### 2. Deploy Redis (Upstash)

1. Go to [Upstash](https://upstash.com/)
2. Create Redis database
3. Get credentials:
   - `REDIS_HOST`
   - `REDIS_PORT`
   - `REDIS_PASSWORD`

### 3. Deploy Backend API (Railway Example)

#### Create `vercel.json` in root (for monorepo config):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "apps/client/dist"
      }
    }
  ]
}
```

#### Deploy to Railway:

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Initialize Railway:
```bash
cd apps/api
railway login
railway init
```

3. Add environment variables in Railway dashboard:
```env
NODE_ENV=production
DATABASE_URL=mongodb+srv://...
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
JWT_SECRET=your-secure-jwt-secret
GEMINI_API_KEY=your-gemini-api-key
PORT=3000
```

4. Deploy:
```bash
railway up
```

5. Note your Railway API URL: `https://your-app.railway.app`

### 4. Deploy Frontend (Vercel)

#### A. Update Client API URL

Update `apps/client/src/services/api.ts` to use environment variable:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

#### B. Create `vercel.json` in `apps/client/`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install",
  "env": {
    "VITE_API_URL": "@vite_api_url"
  }
}
```

#### C. Deploy via Vercel CLI:

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy from client directory:
```bash
cd apps/client
vercel login
vercel
```

3. Follow prompts:
   - Set up and deploy? **Y**
   - Scope: Your account
   - Link to existing project? **N**
   - Project name: `ai-content-creator-client`
   - Directory: `./`
   - Override settings? **Y**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Development command: `npm run dev`

4. Set environment variables:
```bash
vercel env add VITE_API_URL
# Enter: https://your-app.railway.app
```

5. Redeploy with env vars:
```bash
vercel --prod
```

#### D. Deploy via Vercel Dashboard (Alternative):

1. Go to [vercel.com](https://vercel.com)
2. Import Git repository
3. Configure build settings:
   - **Root Directory**: `apps/client`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. Add environment variables:
   - `VITE_API_URL`: `https://your-api.railway.app`

5. Deploy!

---

## Option 2: Full Vercel (Advanced, Not Recommended)

You *could* convert the NestJS API to serverless functions, but this requires:

### Challenges:
- ❌ NestJS isn't designed for serverless
- ❌ Bull queues won't work (no persistent connections)
- ❌ Cold starts will slow down API
- ❌ Vercel has 10-second timeout on hobby plan
- ❌ Need to rewrite significant portions

### If You Still Want To Try:

1. Convert NestJS controllers to serverless functions in `api/` directory
2. Use Vercel Edge Config or external job queue (like QStash)
3. Connect to MongoDB Atlas and Upstash Redis
4. Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/api/src/main.ts",
      "use": "@vercel/node"
    },
    {
      "src": "apps/client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "apps/api/src/main.ts"
    },
    {
      "src": "/(.*)",
      "dest": "apps/client/dist/$1"
    }
  ]
}
```

**This approach requires extensive refactoring and is NOT recommended.**

---

## Option 3: Deploy Everything as Docker Container

### Deploy to Container-Friendly Platform:

1. **Render** (Free tier available)
   - Supports Docker
   - Can deploy monorepo
   - Built-in PostgreSQL/Redis (paid)

2. **DigitalOcean App Platform**
   - Supports monorepos
   - Docker support
   - $5/month

3. **Fly.io**
   - Docker-native
   - Global edge network
   - Free tier

### Example: Deploy to Render

1. Create `render.yaml`:

```yaml
services:
  - type: web
    name: ai-content-creator
    env: docker
    dockerfilePath: ./Dockerfile
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: mongodb
          property: connectionString
      - key: REDIS_HOST
        fromService:
          name: redis
          type: redis
          property: host
      - key: JWT_SECRET
        generateValue: true
      - key: GEMINI_API_KEY
        sync: false

databases:
  - name: mongodb
    plan: free

  - name: redis
    plan: free
```

2. Push to GitHub
3. Connect Render to your repo
4. Deploy!

---

## Recommended Architecture

```
┌─────────────────────────────────────────────────┐
│                   Vercel CDN                    │
│             (React Frontend)                    │
│          https://app.vercel.app                 │
└─────────────┬───────────────────────────────────┘
              │ API Requests
              ↓
┌─────────────────────────────────────────────────┐
│              Railway/Render                     │
│           (NestJS Backend)                      │
│        https://api.railway.app                  │
└────────┬────────────────────┬───────────────────┘
         │                    │
         ↓                    ↓
┌──────────────────┐  ┌──────────────────┐
│  MongoDB Atlas   │  │  Upstash Redis   │
│  (Database)      │  │  (Queue/Cache)   │
└──────────────────┘  └──────────────────┘
```

### Benefits:
✅ Fast global CDN for frontend (Vercel)
✅ Persistent backend for Bull queues
✅ Managed databases (no DevOps)
✅ Free tiers available
✅ Easy scaling
✅ Minimal code changes

---

## Quick Start: Recommended Deployment

### Prerequisites:
```bash
# Install CLIs
npm i -g vercel @railway/cli
```

### 1. Setup External Services (5 minutes)

```bash
# MongoDB Atlas
# 1. Visit mongodb.com/atlas
# 2. Create free cluster
# 3. Copy connection string

# Upstash Redis
# 1. Visit upstash.com
# 2. Create database
# 3. Copy credentials
```

### 2. Deploy Backend to Railway (5 minutes)

```bash
cd apps/api
railway login
railway init
railway up

# Add environment variables in Railway dashboard
```

### 3. Deploy Frontend to Vercel (5 minutes)

```bash
cd apps/client

# Update .env.production
echo "VITE_API_URL=https://your-api.railway.app" > .env.production

vercel login
vercel
# Follow prompts

# Add environment variable
vercel env add VITE_API_URL production

# Deploy to production
vercel --prod
```

### 4. Test Deployment

```bash
# Visit your Vercel URL
open https://your-app.vercel.app

# Test API
curl https://your-api.railway.app/api
```

---

## Environment Variables Checklist

### Backend (Railway/Render):
- ✅ `NODE_ENV=production`
- ✅ `DATABASE_URL` (MongoDB Atlas connection string)
- ✅ `REDIS_HOST` (Upstash host)
- ✅ `REDIS_PORT` (Upstash port, usually 6379)
- ✅ `REDIS_PASSWORD` (Upstash password)
- ✅ `JWT_SECRET` (generate secure random string)
- ✅ `GEMINI_API_KEY` (your Google AI key)
- ✅ `PORT` (usually 3000)

### Frontend (Vercel):
- ✅ `VITE_API_URL` (your Railway/Render API URL)

---

## Cost Estimate (Monthly)

### Free Tier:
- **Vercel**: Free (hobby plan)
- **Railway**: $5 free credit/month
- **MongoDB Atlas**: Free (512MB)
- **Upstash Redis**: Free (10,000 commands/day)
- **Total**: ~$0-5/month

### Production Ready:
- **Vercel Pro**: $20/month
- **Railway**: ~$10-20/month (usage-based)
- **MongoDB Atlas M10**: $57/month
- **Upstash Redis**: $10/month
- **Total**: ~$97-107/month

---

## Troubleshooting

### CORS Issues
Update `apps/api/src/main.ts`:
```typescript
app.enableCors({
  origin: [
    'https://your-app.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
});
```

### API Connection Failed
1. Check `VITE_API_URL` is set correctly
2. Verify Railway API is running
3. Check Railway logs: `railway logs`

### Database Connection Failed
1. Verify MongoDB Atlas IP whitelist
2. Check connection string format
3. Ensure database user has permissions

---

## Alternative Platforms Comparison

| Platform | Frontend | Backend | Database | Docker | Price |
|----------|----------|---------|----------|--------|-------|
| **Vercel + Railway** | ✅ Best | ✅ Good | External | ✅ | $0-5 |
| **Render** | ✅ Good | ✅ Good | ✅ Built-in | ✅ | $0 |
| **Fly.io** | ✅ Good | ✅ Best | External | ✅ | $0 |
| **DigitalOcean** | ✅ Good | ✅ Good | ✅ Built-in | ✅ | $5 |
| **Heroku** | ✅ Good | ✅ Good | ✅ Add-ons | ✅ | $7 |
| **AWS/GCP** | ✅ Best | ✅ Best | ✅ Best | ✅ | $20+ |

---

## Need Help?

1. **Vercel Docs**: https://vercel.com/docs
2. **Railway Docs**: https://docs.railway.app
3. **MongoDB Atlas**: https://docs.atlas.mongodb.com
4. **Upstash**: https://docs.upstash.com

## Next Steps

1. Choose your deployment strategy
2. Set up external services (MongoDB, Redis)
3. Deploy backend to Railway/Render
4. Deploy frontend to Vercel
5. Test thoroughly
6. Set up custom domain (optional)
7. Configure CI/CD with GitHub Actions

Good luck with your deployment! 🚀
