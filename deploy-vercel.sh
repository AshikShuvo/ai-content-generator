#!/bin/bash

# Vercel Deployment Script for AI Content Creator
# This script helps deploy the frontend to Vercel and backend to Railway

set -e

echo "🚀 AI Content Creator - Vercel Deployment Helper"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."
echo ""

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js installed: $(node --version)${NC}"
echo -e "${GREEN}✅ npm installed: $(npm --version)${NC}"
echo ""

# Check for Vercel CLI
if ! command_exists vercel; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found${NC}"
    read -p "Would you like to install Vercel CLI? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm install -g vercel
    else
        echo -e "${RED}❌ Vercel CLI is required for deployment${NC}"
        exit 1
    fi
fi

# Check for Railway CLI
if ! command_exists railway; then
    echo -e "${YELLOW}⚠️  Railway CLI not found${NC}"
    read -p "Would you like to install Railway CLI? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm install -g @railway/cli
    else
        echo -e "${YELLOW}⚠️  Railway CLI will be needed for backend deployment${NC}"
    fi
fi

echo ""
echo "🎯 What would you like to deploy?"
echo "1) Frontend only (Vercel)"
echo "2) Backend only (Railway)"
echo "3) Both (Frontend + Backend)"
echo "4) Setup environment variables"
echo "5) Exit"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "📦 Deploying Frontend to Vercel..."
        echo "=================================="
        echo ""
        
        # Check if .env.production exists
        if [ ! -f "apps/client/.env.production" ]; then
            echo -e "${YELLOW}⚠️  .env.production not found${NC}"
            read -p "Enter your API URL (e.g., https://api.railway.app): " api_url
            echo "VITE_API_URL=$api_url" > apps/client/.env.production
            echo -e "${GREEN}✅ Created .env.production${NC}"
        fi
        
        cd apps/client
        
        # Build
        echo "Building client..."
        npm install
        npm run build
        
        # Deploy to Vercel
        echo ""
        echo "Deploying to Vercel..."
        vercel --prod
        
        echo ""
        echo -e "${GREEN}✅ Frontend deployed successfully!${NC}"
        ;;
        
    2)
        echo ""
        echo "📦 Deploying Backend to Railway..."
        echo "=================================="
        echo ""
        
        if ! command_exists railway; then
            echo -e "${RED}❌ Railway CLI is required${NC}"
            exit 1
        fi
        
        cd apps/api
        
        # Build
        echo "Building API..."
        npm install
        npm run build
        
        # Deploy to Railway
        echo ""
        echo "Deploying to Railway..."
        railway up
        
        echo ""
        echo -e "${GREEN}✅ Backend deployed successfully!${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  Don't forget to set environment variables in Railway dashboard:${NC}"
        echo "   - DATABASE_URL"
        echo "   - REDIS_HOST, REDIS_PORT, REDIS_PASSWORD"
        echo "   - JWT_SECRET"
        echo "   - GEMINI_API_KEY"
        ;;
        
    3)
        echo ""
        echo "📦 Deploying Full Stack..."
        echo "=========================="
        echo ""
        
        # Deploy Backend first
        echo "1️⃣  Deploying Backend to Railway..."
        if command_exists railway; then
            cd apps/api
            npm install
            npm run build
            railway up
            cd ../..
            echo -e "${GREEN}✅ Backend deployed${NC}"
        else
            echo -e "${RED}❌ Railway CLI not found, skipping backend${NC}"
        fi
        
        echo ""
        
        # Deploy Frontend
        echo "2️⃣  Deploying Frontend to Vercel..."
        
        if [ ! -f "apps/client/.env.production" ]; then
            echo -e "${YELLOW}⚠️  .env.production not found${NC}"
            read -p "Enter your API URL (e.g., https://api.railway.app): " api_url
            echo "VITE_API_URL=$api_url" > apps/client/.env.production
        fi
        
        cd apps/client
        npm install
        npm run build
        vercel --prod
        
        echo ""
        echo -e "${GREEN}✅ Full stack deployed successfully!${NC}"
        ;;
        
    4)
        echo ""
        echo "⚙️  Environment Variables Setup"
        echo "==============================="
        echo ""
        
        echo "Frontend Environment Variables (Vercel):"
        echo "----------------------------------------"
        read -p "API URL: " api_url
        
        echo ""
        echo "Setting Vercel environment variable..."
        cd apps/client
        vercel env add VITE_API_URL production
        echo "$api_url"
        
        echo ""
        echo "Backend Environment Variables (Railway):"
        echo "----------------------------------------"
        echo "Please set these in Railway dashboard:"
        echo "  - NODE_ENV=production"
        echo "  - DATABASE_URL (MongoDB Atlas connection string)"
        echo "  - REDIS_HOST (Upstash host)"
        echo "  - REDIS_PORT (Upstash port)"
        echo "  - REDIS_PASSWORD (Upstash password)"
        echo "  - JWT_SECRET (secure random string)"
        echo "  - GEMINI_API_KEY (your Google AI key)"
        echo ""
        read -p "Press Enter to open Railway dashboard..." 
        railway open
        ;;
        
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
        
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment process complete!"
echo ""
echo "📚 Next Steps:"
echo "  1. Verify frontend at your Vercel URL"
echo "  2. Verify backend at your Railway URL"
echo "  3. Test the full application flow"
echo "  4. Set up custom domain (optional)"
echo "  5. Configure CI/CD with GitHub Actions (optional)"
echo ""
echo "📖 For detailed instructions, see: VERCEL_DEPLOYMENT.md"
echo ""
