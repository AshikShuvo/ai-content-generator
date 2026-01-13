# Running Docker Locally

## 🚨 Security Warning

**IMPORTANT**: Never commit credentials (API keys, database passwords, JWT secrets) directly in Dockerfiles or code. Always use environment variables or `.env` files that are excluded from version control.

## Method 1: Using Docker Compose (Recommended)

This is the easiest way to run everything locally with MongoDB and Redis included.

### Step 1: Create `.env` file

Create a `.env` file in the project root:

```bash
# .env
JWT_SECRET=your-super-secret-jwt-key-change-this
GEMINI_API_KEY=your-gemini-api-key-here
```

### Step 2: Build and Run

```bash
# Build and start all services (MongoDB, Redis, App)
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### Step 3: Access the Application

- **Frontend & API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

## Method 2: Using Docker Commands Directly

### Step 1: Build the Docker Image

```bash
# Build the image
docker build -t ai-content-creator:latest .

# Or with a specific tag
docker build -t ai-content-creator:v1.0 .
```

### Step 2: Run MongoDB and Redis (if not using docker-compose)

You need MongoDB and Redis running. You can either:

**Option A: Use docker-compose for just DB services**
```bash
# Start only MongoDB and Redis
docker-compose up -d mongodb redis
```

**Option B: Run them separately**
```bash
# MongoDB
docker run -d --name mongodb -p 27017:27017 mongo:7.0

# Redis
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

### Step 3: Run the Application Container

```bash
# Run with environment variables
docker run -d \
  --name ai-content-creator-app \
  -p 3000:3000 \
  --link mongodb:mongodb \
  --link redis:redis \
  -e DATABASE_URL=mongodb://mongodb:27017/ai-content-creator \
  -e REDIS_HOST=redis \
  -e REDIS_PORT=6379 \
  -e JWT_SECRET=your-jwt-secret-here \
  -e GEMINI_API_KEY=your-gemini-api-key-here \
  -e NODE_ENV=production \
  ai-content-creator:latest
```

### Step 4: View Logs and Manage Container

```bash
# View logs
docker logs -f ai-content-creator-app

# Stop container
docker stop ai-content-creator-app

# Start container
docker start ai-content-creator-app

# Remove container
docker rm ai-content-creator-app

# Remove container and image
docker rm ai-content-creator-app && docker rmi ai-content-creator:latest
```

## Method 3: Using Environment File

Create a `.env` file and use it with docker-compose:

```bash
# .env file
JWT_SECRET=your-super-secret-jwt-key
GEMINI_API_KEY=your-gemini-api-key
DATABASE_URL=mongodb://mongodb:27017/ai-content-creator
REDIS_HOST=redis
REDIS_PORT=6379
```

Then run:
```bash
docker-compose --env-file .env up --build
```

## Troubleshooting

### Check if containers are running
```bash
docker ps
```

### Check container logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs app
docker-compose logs mongodb
docker-compose logs redis
```

### Rebuild after code changes
```bash
docker-compose up --build
```

### Clean up everything
```bash
# Stop and remove containers, networks, volumes
docker-compose down -v

# Remove all images
docker rmi ai-content-creator:latest
```

### Check if ports are in use
```bash
# Linux/macOS
lsof -i :3000
lsof -i :27017
lsof -i :6379

# Kill process on port
kill -9 $(lsof -t -i:3000)
```

### Access container shell
```bash
# Using docker-compose
docker-compose exec app sh

# Using docker
docker exec -it ai-content-creator-app sh
```

### Verify build output
```bash
# Check if dist folder exists in container
docker-compose exec app ls -la /app/apps/api/dist/

# Check if main.js exists
docker-compose exec app ls -la /app/apps/api/dist/main.js
```

## Quick Start Script

Create a `run-docker.sh` script:

```bash
#!/bin/bash
set -e

echo "🚀 Starting AI Content Creator with Docker..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file. Please edit it with your credentials."
    else
        echo "❌ .env.example not found. Please create .env manually."
        exit 1
    fi
fi

# Build and start
docker-compose up --build

echo "✅ Application is running at http://localhost:3000"
```

Make it executable:
```bash
chmod +x run-docker.sh
./run-docker.sh
```

## Production vs Development

For development, use `docker-compose.dev.yml`:
```bash
docker-compose -f docker-compose.dev.yml up
```

For production, use `docker-compose.prod.yml`:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Next Steps

1. ✅ Build the image: `docker build -t ai-content-creator .`
2. ✅ Start services: `docker-compose up -d`
3. ✅ Check logs: `docker-compose logs -f`
4. ✅ Access app: http://localhost:3000
5. ✅ Test API: http://localhost:3000/api/docs
