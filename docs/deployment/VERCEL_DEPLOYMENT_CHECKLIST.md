# Vercel Deployment Checklist

This checklist will guide you through deploying your AI Content Creator monorepo to production.

## Prerequisites ✅

### 1. Accounts Setup
- [ ] Create [Vercel](https://vercel.com) account
- [ ] Create [Railway](https://railway.app) account (or [Render](https://render.com))
- [ ] Create [MongoDB Atlas](https://www.mongodb.com/atlas) account
- [ ] Create [Upstash](https://upstash.com) account (for Redis)
- [ ] Have your [Google AI API key](https://makersuite.google.com/app/apikey) ready

### 2. Install CLIs
```bash
# Install Vercel CLI
npm install -g vercel

# Install Railway CLI
npm install -g @railway/cli

# Or if using Render CLI
npm install -g render-cli
```

---

## Phase 1: Database Setup 💾

### MongoDB Atlas (Database)

1. **Create Cluster**
   - [ ] Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - [ ] Click "Build a Database"
   - [ ] Choose "FREE" tier (M0)
   - [ ] Select region closest to your users
   - [ ] Name: `ai-content-creator`

2. **Configure Security**
   - [ ] Create database user
     - Username: `admin` (or your choice)
     - Password: Generate strong password
     - Save credentials securely
   - [ ] Set Network Access
     - Click "Network Access" → "Add IP Address"
     - Click "Allow Access from Anywhere" (0.0.0.0/0)
     - Or add specific IPs if known

3. **Get Connection String**
   - [ ] Click "Connect" → "Connect your application"
   - [ ] Copy connection string
   - [ ] Replace `<password>` with your password
   - [ ] Replace `<dbname>` with `ai-content-creator`
   - [ ] Save as: `DATABASE_URL`
   
   Example:
   ```
   mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ai-content-creator?retryWrites=true&w=majority
   ```

### Upstash Redis (Queue & Cache)

1. **Create Redis Database**
   - [ ] Go to [Upstash Console](https://console.upstash.com/)
   - [ ] Click "Create Database"
   - [ ] Name: `ai-content-creator-redis`
   - [ ] Type: Regional
   - [ ] Region: Same as your backend
   - [ ] TLS: Enabled

2. **Get Redis Credentials**
   - [ ] Copy the following from dashboard:
     - `REDIS_HOST` (e.g., `us1-xxx.upstash.io`)
     - `REDIS_PORT` (usually `6379` or `6380`)
     - `REDIS_PASSWORD` (long string)
   - [ ] Save these securely

---

## Phase 2: Backend Deployment (Railway) 🚂

### Option A: Deploy via Railway CLI

1. **Login to Railway**
   ```bash
   railway login
   ```

2. **Initialize Project**
   ```bash
   cd apps/api
   railway init
   # Follow prompts to create new project
   ```

3. **Deploy**
   ```bash
   railway up
   ```

4. **Add Environment Variables**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set DATABASE_URL="your-mongodb-connection-string"
   railway variables set REDIS_HOST="your-upstash-host"
   railway variables set REDIS_PORT="6379"
   railway variables set REDIS_PASSWORD="your-upstash-password"
   railway variables set JWT_SECRET="$(openssl rand -base64 32)"
   railway variables set GEMINI_API_KEY="your-gemini-api-key"
   railway variables set PORT="3000"
   ```

5. **Get Railway URL**
   ```bash
   railway domain
   # Save this URL, you'll need it for frontend
   ```

### Option B: Deploy via Railway Dashboard

1. **Create Project**
   - [ ] Go to [Railway Dashboard](https://railway.app/dashboard)
   - [ ] Click "New Project"
   - [ ] Select "Deploy from GitHub repo"
   - [ ] Connect your repository
   - [ ] Select branch (usually `main`)

2. **Configure Service**
   - [ ] Root Directory: `apps/api`
   - [ ] Build Command: `npm install && npm run build`
   - [ ] Start Command: `npm run start:prod`

3. **Add Environment Variables** (same as CLI method)
   - [ ] Go to project → Variables tab
   - [ ] Add each variable listed above

4. **Generate Domain**
   - [ ] Go to Settings → Domains
   - [ ] Click "Generate Domain"
   - [ ] Save the URL (e.g., `https://your-app.railway.app`)

### Verify Backend Deployment

- [ ] Visit: `https://your-app.railway.app/api`
- [ ] Should see: `{"message":"Welcome to AI Content Creator API"}`
- [ ] Check logs: `railway logs` (CLI) or dashboard

---

## Phase 3: Frontend Deployment (Vercel) ▲

### Prepare Frontend

1. **Update Environment Variables**
   ```bash
   cd apps/client
   
   # Create production environment file
   cat > .env.production << EOF
   VITE_API_URL=https://your-app.railway.app
   EOF
   ```
   - [ ] Replace `your-app.railway.app` with your actual Railway URL

2. **Test Build Locally**
   ```bash
   npm run build
   npm run preview
   ```
   - [ ] Verify app works at http://localhost:4173

### Deploy to Vercel

#### Option A: Via CLI (Recommended)

1. **Login**
   ```bash
   vercel login
   ```

2. **First Deployment**
   ```bash
   cd apps/client
   vercel
   ```
   - [ ] Set up and deploy? **Y**
   - [ ] Scope: Your account
   - [ ] Link to existing project? **N**
   - [ ] Project name: `ai-content-creator`
   - [ ] Directory: `./` (current directory)
   - [ ] Override settings? **Y**
   - [ ] Build command: `npm run build`
   - [ ] Output directory: `dist`
   - [ ] Development command: `npm run dev`

3. **Add Environment Variables**
   ```bash
   vercel env add VITE_API_URL production
   # Enter your Railway URL when prompted
   ```

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

5. **Save URLs**
   - [ ] Copy the production URL
   - [ ] Test in browser

#### Option B: Via Vercel Dashboard

1. **Import Project**
   - [ ] Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - [ ] Click "Add New..." → "Project"
   - [ ] Import your Git repository

2. **Configure Build**
   - [ ] Framework Preset: **Vite**
   - [ ] Root Directory: `apps/client`
   - [ ] Build Command: `npm run build`
   - [ ] Output Directory: `dist`
   - [ ] Install Command: `npm install`

3. **Environment Variables**
   - [ ] Click "Environment Variables"
   - [ ] Add: `VITE_API_URL` = `https://your-app.railway.app`
   - [ ] Select: **Production**

4. **Deploy**
   - [ ] Click "Deploy"
   - [ ] Wait for deployment to complete
   - [ ] Copy production URL

### Verify Frontend Deployment

- [ ] Visit your Vercel URL
- [ ] Try to register a new account
- [ ] Try to login
- [ ] Check browser console for errors
- [ ] Test content generation

---

## Phase 4: Configure CORS 🔒

Your backend needs to allow requests from your Vercel frontend.

1. **Update CORS in Backend**
   
   Edit `apps/api/src/main.ts`:
   ```typescript
   app.enableCors({
     origin: [
       'https://your-app.vercel.app',  // Your Vercel domain
       'http://localhost:5173',         // Local development
       'http://localhost:4173',         // Local preview
     ],
     credentials: true,
   });
   ```

2. **Redeploy Backend**
   ```bash
   cd apps/api
   railway up
   ```

---

## Phase 5: Testing & Verification 🧪

### Backend Tests

- [ ] Health Check: `curl https://your-api.railway.app/api`
- [ ] Swagger Docs: `https://your-api.railway.app/api/docs`
- [ ] Register endpoint works
- [ ] Login endpoint works
- [ ] Protected endpoints require auth
- [ ] Check Railway logs for errors

### Frontend Tests

- [ ] Homepage loads
- [ ] Can navigate between pages
- [ ] Register new account works
- [ ] Login works
- [ ] Dashboard loads after login
- [ ] Can create content
- [ ] Can view generated content
- [ ] Logout works
- [ ] Mobile responsive

### Integration Tests

- [ ] End-to-end user flow works
- [ ] No CORS errors in browser console
- [ ] Content generation completes
- [ ] Bull queue processes jobs
- [ ] Database stores data correctly
- [ ] JWT tokens work correctly

---

## Phase 6: Monitoring & Maintenance 📊

### Setup Monitoring

1. **Railway Monitoring**
   - [ ] Enable metrics in Railway dashboard
   - [ ] Set up alerts for downtime
   - [ ] Monitor resource usage

2. **Vercel Analytics**
   - [ ] Enable Vercel Analytics (free)
   - [ ] Monitor page performance
   - [ ] Track visitor analytics

3. **Database Monitoring**
   - [ ] MongoDB Atlas metrics
   - [ ] Set up storage alerts
   - [ ] Monitor connection pool

### Regular Maintenance

- [ ] Check logs weekly
- [ ] Monitor error rates
- [ ] Review database growth
- [ ] Update dependencies monthly
- [ ] Backup database regularly

---

## Phase 7: Custom Domain (Optional) 🌐

### Vercel Domain Setup

1. **Add Domain**
   - [ ] Go to Project Settings → Domains
   - [ ] Add your domain (e.g., `myapp.com`)
   - [ ] Follow DNS configuration instructions

2. **Update DNS**
   - [ ] Add CNAME record pointing to Vercel
   - [ ] Wait for DNS propagation (up to 48h)

3. **Update Backend CORS**
   - [ ] Add custom domain to CORS origins
   - [ ] Redeploy backend

### Railway Domain Setup

1. **Custom Domain**
   - [ ] Go to Project Settings → Domains
   - [ ] Add custom domain (e.g., `api.myapp.com`)
   - [ ] Configure DNS records

2. **Update Frontend**
   - [ ] Update `VITE_API_URL` to use custom domain
   - [ ] Redeploy frontend

---

## Troubleshooting 🔧

### Common Issues

#### "CORS Error" in Browser Console
- **Fix**: Update CORS origins in `apps/api/src/main.ts`
- **Fix**: Ensure `VITE_API_URL` matches your Railway domain

#### "Cannot connect to database"
- **Fix**: Check MongoDB Atlas IP whitelist
- **Fix**: Verify `DATABASE_URL` is correct
- **Fix**: Check MongoDB Atlas user permissions

#### "Redis connection failed"
- **Fix**: Verify Upstash credentials
- **Fix**: Check Redis is running
- **Fix**: Verify `REDIS_PASSWORD` is set

#### "JWT must be provided"
- **Fix**: Check `JWT_SECRET` is set in Railway
- **Fix**: Clear browser localStorage
- **Fix**: Try logging in again

#### "Build failed" on Vercel
- **Fix**: Check build logs
- **Fix**: Verify `package.json` scripts
- **Fix**: Test build locally first

#### "Memory limit exceeded"
- **Fix**: Upgrade Railway plan
- **Fix**: Optimize code/queries
- **Fix**: Add database indexing

### Getting Help

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **Upstash Docs**: https://docs.upstash.com

---

## Cost Estimate 💰

### Free Tier (Perfect for Testing)

| Service | Plan | Cost | Limits |
|---------|------|------|--------|
| Vercel | Hobby | $0 | 100GB bandwidth/month |
| Railway | Starter | $5 credit | ~500 hours execution |
| MongoDB Atlas | M0 | $0 | 512MB storage |
| Upstash Redis | Free | $0 | 10,000 commands/day |
| **Total** | | **~$0-5/month** | Good for MVP |

### Production Scale

| Service | Plan | Cost | Features |
|---------|------|------|----------|
| Vercel | Pro | $20/month | Unlimited projects, analytics |
| Railway | Pro | ~$20/month | More resources, better support |
| MongoDB Atlas | M10 | $57/month | 10GB storage, backups |
| Upstash Redis | Pay-as-go | ~$10/month | Higher limits |
| **Total** | | **~$107/month** | Production ready |

---

## Quick Deployment Script 🚀

Use the included script for faster deployment:

```bash
# Make it executable
chmod +x deploy-vercel.sh

# Run it
./deploy-vercel.sh

# Follow the interactive prompts
```

---

## Checklist Summary

- [ ] MongoDB Atlas set up with connection string
- [ ] Upstash Redis created with credentials
- [ ] Backend deployed to Railway with all env vars
- [ ] Backend health check passes
- [ ] Frontend deployed to Vercel
- [ ] Frontend can reach backend (no CORS errors)
- [ ] Can register and login
- [ ] Can generate content
- [ ] All tests passing
- [ ] Monitoring set up
- [ ] Documentation updated

---

## Next Steps After Deployment

1. **CI/CD Setup**
   - Connect GitHub for auto-deployment
   - Set up staging environment
   - Add automated tests

2. **Performance Optimization**
   - Enable caching
   - Optimize images
   - Add CDN for assets

3. **Security Hardening**
   - Enable rate limiting
   - Add input validation
   - Set up security headers

4. **Features**
   - Add more AI models
   - Implement payment system
   - Add user analytics

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review deployment logs
3. Verify all environment variables
4. Test locally first

Good luck with your deployment! 🎉
