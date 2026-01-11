#!/bin/bash

# AI Content Creator - Quick Start Script
# This script helps you get the application running with Docker quickly

set -e

echo "🚀 AI Content Creator - Docker Quick Start"
echo "==========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose are installed${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 .env file not found. Creating from .env.docker...${NC}"
    if [ -f .env.docker ]; then
        cp .env.docker .env
        echo -e "${GREEN}✅ Created .env file${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  IMPORTANT: Please edit .env and add your secrets:${NC}"
        echo "   1. JWT_SECRET - A secure random string (32+ characters)"
        echo "   2. GEMINI_API_KEY - Your Google Gemini API key"
        echo ""
        echo -e "${YELLOW}Press Enter after you've updated the .env file...${NC}"
        read -r
    else
        echo -e "${RED}❌ .env.docker template not found!${NC}"
        exit 1
    fi
fi

# Verify environment variables
echo "🔍 Checking environment variables..."
source .env

if [ "$JWT_SECRET" = "your-super-secret-jwt-key-min-32-characters-change-in-production" ]; then
    echo -e "${YELLOW}⚠️  WARNING: You're using the default JWT_SECRET. This is not secure!${NC}"
    echo "Please update JWT_SECRET in .env before deploying to production."
    echo ""
fi

if [ "$GEMINI_API_KEY" = "your-gemini-api-key-here" ]; then
    echo -e "${RED}❌ ERROR: GEMINI_API_KEY is not set!${NC}"
    echo "Please add your Google Gemini API key to .env"
    echo "Get one from: https://makersuite.google.com/app/apikey"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables configured${NC}"
echo ""

# Ask user which mode they want
echo "Which mode would you like to start?"
echo "1) Production (recommended for deployment)"
echo "2) Development (with hot reload)"
read -p "Enter choice [1-2]: " mode

case $mode in
    1)
        echo ""
        echo "🏗️  Building production image..."
        docker-compose build --no-cache
        
        echo ""
        echo "🚀 Starting services in production mode..."
        docker-compose up -d
        
        echo ""
        echo -e "${GREEN}✅ Application started successfully!${NC}"
        echo ""
        echo "Access your application at:"
        echo "  🌐 Frontend & API: http://localhost:3000"
        echo "  📚 API Documentation: http://localhost:3000/api/docs"
        echo ""
        echo "Useful commands:"
        echo "  docker-compose logs -f        # View logs"
        echo "  docker-compose ps             # Check status"
        echo "  docker-compose down           # Stop services"
        echo "  docker-compose restart        # Restart services"
        ;;
    2)
        echo ""
        echo "🚀 Starting services in development mode..."
        docker-compose -f docker-compose.dev.yml up -d
        
        echo ""
        echo -e "${GREEN}✅ Development environment started!${NC}"
        echo ""
        echo "Access your application at:"
        echo "  🌐 Frontend (Vite): http://localhost:5173"
        echo "  🔌 API: http://localhost:3000/api"
        echo "  📚 API Documentation: http://localhost:3000/api/docs"
        echo ""
        echo "Useful commands:"
        echo "  docker-compose -f docker-compose.dev.yml logs -f"
        echo "  docker-compose -f docker-compose.dev.yml down"
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "📊 Checking service health..."
sleep 5

# Check services
docker-compose ps

echo ""
echo -e "${GREEN}🎉 Setup complete! Your application is running.${NC}"
echo ""
echo "Need help? Check out:"
echo "  📖 DOCKER_DEPLOYMENT.md - Complete deployment guide"
echo "  📖 README.md - Project documentation"
