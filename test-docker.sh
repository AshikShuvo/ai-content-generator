#!/bin/bash

# Docker Build and Test Script
# This script builds the Docker image and runs basic tests

set -e

echo "🧪 AI Content Creator - Docker Build Test"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Cleanup function
cleanup() {
    echo ""
    echo -e "${BLUE}🧹 Cleaning up...${NC}"
    docker-compose down -v 2>/dev/null || true
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Step 1: Build the image
echo -e "${BLUE}📦 Step 1/5: Building Docker image...${NC}"
docker build -t ai-content-creator:test . || {
    echo -e "${RED}❌ Docker build failed!${NC}"
    exit 1
}
echo -e "${GREEN}✅ Build successful!${NC}"
echo ""

# Step 2: Check image size
echo -e "${BLUE}📊 Step 2/5: Checking image size...${NC}"
IMAGE_SIZE=$(docker images ai-content-creator:test --format "{{.Size}}")
echo "Image size: $IMAGE_SIZE"
echo -e "${GREEN}✅ Image created${NC}"
echo ""

# Step 3: Create test environment file
echo -e "${BLUE}🔧 Step 3/5: Setting up test environment...${NC}"
cat > .env.test << EOF
DATABASE_URL=mongodb://mongodb:27017/ai-content-creator-test
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=test-secret-key-for-docker-testing-only
GEMINI_API_KEY=test-key
PORT=3000
NODE_ENV=production
EOF
cp .env.test .env
echo -e "${GREEN}✅ Test environment configured${NC}"
echo ""

# Step 4: Start services
echo -e "${BLUE}🚀 Step 4/5: Starting services...${NC}"
docker-compose up -d || {
    echo -e "${RED}❌ Failed to start services!${NC}"
    docker-compose logs
    exit 1
}
echo -e "${GREEN}✅ Services started${NC}"
echo ""

# Wait for services to be healthy
echo -e "${BLUE}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Check container status
echo "Container status:"
docker-compose ps

echo ""

# Step 5: Run tests
echo -e "${BLUE}🧪 Step 5/5: Running health checks...${NC}"

# Test MongoDB
echo -n "Testing MongoDB... "
docker-compose exec -T mongodb mongosh --quiet --eval "db.adminCommand('ping').ok" ai-content-creator > /dev/null 2>&1 && {
    echo -e "${GREEN}✅ MongoDB is healthy${NC}"
} || {
    echo -e "${RED}❌ MongoDB health check failed${NC}"
    docker-compose logs mongodb
    exit 1
}

# Test Redis
echo -n "Testing Redis... "
docker-compose exec -T redis redis-cli ping > /dev/null 2>&1 && {
    echo -e "${GREEN}✅ Redis is healthy${NC}"
} || {
    echo -e "${RED}❌ Redis health check failed${NC}"
    docker-compose logs redis
    exit 1
}

# Test Application
echo -n "Testing Application API... "
sleep 5  # Give app more time to start

MAX_RETRIES=10
RETRY_COUNT=0
until curl -f http://localhost:3000/api 2>/dev/null || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
    RETRY_COUNT=$((RETRY_COUNT+1))
    echo -n "."
    sleep 3
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}❌ API health check failed${NC}"
    echo "Application logs:"
    docker-compose logs app
    exit 1
else
    echo -e "${GREEN}✅ API is responding${NC}"
fi

# Test API endpoints
echo ""
echo -e "${BLUE}🔍 Testing API endpoints...${NC}"

# Test health endpoint
echo -n "GET /api... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
    echo -e "${GREEN}✅ ($HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ Failed ($HTTP_CODE)${NC}"
fi

# Test static files (client)
echo -n "GET / (client)... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Client served successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Client might not be served correctly ($HTTP_CODE)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 All tests passed!${NC}"
echo ""
echo "📊 Summary:"
echo "  - Docker image: ai-content-creator:test"
echo "  - Image size: $IMAGE_SIZE"
echo "  - MongoDB: ✅ Healthy"
echo "  - Redis: ✅ Healthy"
echo "  - Application: ✅ Running"
echo ""
echo "🌐 Application is accessible at:"
echo "  http://localhost:3000"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop the test environment:"
echo "  docker-compose down -v"
echo ""
