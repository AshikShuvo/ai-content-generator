#!/bin/bash
# Quick Commands Reference Card - AI Content Creator Deployment

cat << 'EOF'

╔════════════════════════════════════════════════════════════════════╗
║          AI Content Creator - Deployment Commands                 ║
║                    Quick Reference Card                            ║
╚════════════════════════════════════════════════════════════════════╝

┌────────────────────────────────────────────────────────────────────┐
│ 🚀 FASTEST DEPLOYMENT (15 minutes)                                 │
└────────────────────────────────────────────────────────────────────┘

  # Use the interactive script
  ./deploy-vercel.sh

┌────────────────────────────────────────────────────────────────────┐
│ 📦 INSTALL TOOLS                                                    │
└────────────────────────────────────────────────────────────────────┘

  npm install -g vercel              # Vercel CLI
  npm install -g @railway/cli        # Railway CLI

┌────────────────────────────────────────────────────────────────────┐
│ 🔧 DEPLOY BACKEND (Railway)                                        │
└────────────────────────────────────────────────────────────────────┘

  cd apps/api
  railway login                      # Login to Railway
  railway init                       # Create new project
  railway up                         # Deploy backend
  
  # Set environment variables
  railway variables set NODE_ENV=production
  railway variables set DATABASE_URL="mongodb+srv://..."
  railway variables set REDIS_HOST="your-host"
  railway variables set REDIS_PORT="6379"
  railway variables set REDIS_PASSWORD="your-password"
  railway variables set JWT_SECRET="$(openssl rand -base64 32)"
  railway variables set GEMINI_API_KEY="your-key"
  
  railway domain                     # Get your API URL
  railway logs                       # View logs
  railway open                       # Open dashboard

┌────────────────────────────────────────────────────────────────────┐
│ ⚡ DEPLOY FRONTEND (Vercel)                                        │
└────────────────────────────────────────────────────────────────────┘

  cd apps/client
  
  # Create production env file
  echo "VITE_API_URL=https://your-app.railway.app" > .env.production
  
  vercel login                       # Login to Vercel
  vercel                             # First deployment (interactive)
  vercel --prod                      # Deploy to production
  
  # Add environment variable
  vercel env add VITE_API_URL production
  
  vercel logs                        # View logs
  vercel inspect                     # Open dashboard

┌────────────────────────────────────────────────────────────────────┐
│ 🧪 VERIFY DEPLOYMENT                                               │
└────────────────────────────────────────────────────────────────────┘

  # Test backend
  curl https://your-app.railway.app/api
  
  # Test frontend (in browser)
  open https://your-app.vercel.app
  
  # Check backend logs
  railway logs
  
  # Check frontend logs
  vercel logs

┌────────────────────────────────────────────────────────────────────┐
│ 🐳 DOCKER DEPLOYMENT (Alternative)                                 │
└────────────────────────────────────────────────────────────────────┘

  # Production deployment
  docker-compose up -d --build
  
  # View logs
  docker-compose logs -f
  
  # Stop services
  docker-compose down
  
  # Clean everything
  docker-compose down -v

┌────────────────────────────────────────────────────────────────────┐
│ 🔄 UPDATE DEPLOYMENT                                               │
└────────────────────────────────────────────────────────────────────┘

  # Update backend
  cd apps/api
  railway up
  
  # Update frontend
  cd apps/client
  vercel --prod
  
  # Or push to GitHub (with CI/CD)
  git add .
  git commit -m "Update"
  git push origin main

┌────────────────────────────────────────────────────────────────────┐
│ 🌐 EXTERNAL SERVICES                                               │
└────────────────────────────────────────────────────────────────────┘

  MongoDB Atlas:    https://www.mongodb.com/atlas
  Upstash Redis:    https://upstash.com
  Vercel:           https://vercel.com/dashboard
  Railway:          https://railway.app/dashboard
  Google AI:        https://makersuite.google.com/app/apikey

┌────────────────────────────────────────────────────────────────────┐
│ 📊 USEFUL COMMANDS                                                 │
└────────────────────────────────────────────────────────────────────┘

  # Generate secure JWT secret
  openssl rand -base64 32
  
  # Test local build
  cd apps/client && npm run build && npm run preview
  
  # Check Railway service status
  railway status
  
  # Link existing Vercel project
  vercel link

┌────────────────────────────────────────────────────────────────────┐
│ 🐛 TROUBLESHOOTING                                                 │
└────────────────────────────────────────────────────────────────────┘

  CORS Error:
    → Update apps/api/src/main.ts with Vercel domain
    → Redeploy backend: railway up
  
  Database Connection Failed:
    → Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0)
    → Verify DATABASE_URL is correct
  
  Redis Connection Failed:
    → Verify Upstash credentials
    → Check REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
  
  Build Failed:
    → Test locally: npm run build
    → Check build logs for specific errors
  
  401 Unauthorized:
    → Clear browser localStorage
    → Login again

┌────────────────────────────────────────────────────────────────────┐
│ 📚 DOCUMENTATION                                                   │
└────────────────────────────────────────────────────────────────────┘

  Quick Reference:  VERCEL_QUICK_REFERENCE.md
  Full Guide:       VERCEL_DEPLOYMENT.md
  Checklist:        VERCEL_DEPLOYMENT_CHECKLIST.md
  Summary:          DEPLOYMENT_SUMMARY.md
  CI/CD Setup:      .github/GITHUB_ACTIONS_SETUP.md
  Docker:           DOCKER_DEPLOYMENT.md

┌────────────────────────────────────────────────────────────────────┐
│ 💰 COSTS (Free Tier)                                               │
└────────────────────────────────────────────────────────────────────┘

  Vercel:          Free (Hobby plan)
  Railway:         $5 free credit/month
  MongoDB Atlas:   Free (512MB M0)
  Upstash Redis:   Free (10K commands/day)
  ────────────────────────────────────
  TOTAL:           ~$0-5/month

┌────────────────────────────────────────────────────────────────────┐
│ ✅ ENVIRONMENT VARIABLES CHECKLIST                                 │
└────────────────────────────────────────────────────────────────────┘

  Backend (Railway):
    [ ] NODE_ENV=production
    [ ] PORT=3000
    [ ] DATABASE_URL
    [ ] REDIS_HOST
    [ ] REDIS_PORT
    [ ] REDIS_PASSWORD
    [ ] JWT_SECRET
    [ ] GEMINI_API_KEY
  
  Frontend (Vercel):
    [ ] VITE_API_URL

┌────────────────────────────────────────────────────────────────────┐
│ 🎯 DEPLOYMENT FLOW                                                 │
└────────────────────────────────────────────────────────────────────┘

  1. Setup MongoDB Atlas (5 min)
  2. Setup Upstash Redis (5 min)
  3. Deploy backend to Railway (5 min)
  4. Deploy frontend to Vercel (5 min)
  5. Verify deployment (2 min)
  ────────────────────────────────────
  Total: ~22 minutes

╔════════════════════════════════════════════════════════════════════╗
║  💡 TIP: Save this file and run it anytime for quick reference!   ║
║  Usage: ./deployment-commands.sh                                   ║
╚════════════════════════════════════════════════════════════════════╝

EOF
