# 🐳 Docker Deployment Guide

This guide covers deploying the AI Content Creator monorepo using Docker and Docker Compose.

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Production Deployment](#production-deployment)
- [Development Setup](#development-setup)
- [Environment Variables](#environment-variables)
- [Commands Reference](#commands-reference)
- [Troubleshooting](#troubleshooting)
- [Architecture](#architecture)

## ✅ Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git
- Google Gemini API Key

### Install Docker

**Ubuntu/Debian:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

**macOS:**
```bash
brew install --cask docker
```

**Windows:** Download [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd ai-content-creator

# Copy environment file
cp .env.example .env

# Edit .env and add your secrets
nano .env  # or use your preferred editor
```

### 2. Configure Environment

Edit `.env` and set these required variables:

```env
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
GEMINI_API_KEY=your-gemini-api-key-from-google
```

### 3. Start the Application

```bash
# Build and start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api
- **Swagger Docs**: http://localhost:3000/api/docs

The client is served as static files from the API server (single-port deployment).

## 🎯 Production Deployment

### Method 1: Using Docker Compose (Recommended)

```bash
# Build and start in detached mode
docker-compose up -d --build

# Check logs
docker-compose logs -f app

# Stop services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

### Method 2: Using Docker Directly

```bash
# Build the image
docker build -t ai-content-creator:latest .

# Create network
docker network create ai-content-network

# Start MongoDB
docker run -d \
  --name mongodb \
  --network ai-content-network \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:7.0

# Start Redis
docker run -d \
  --name redis \
  --network ai-content-network \
  -p 6379:6379 \
  -v redis_data:/data \
  redis:7-alpine

# Start Application
docker run -d \
  --name ai-content-creator \
  --network ai-content-network \
  -p 3000:3000 \
  -e DATABASE_URL=mongodb://mongodb:27017/ai-content-creator \
  -e REDIS_HOST=redis \
  -e REDIS_PORT=6379 \
  -e JWT_SECRET=your-secret \
  -e GEMINI_API_KEY=your-key \
  ai-content-creator:latest
```

### Method 3: Cloud Deployment

#### Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Set environment variables
railway variables set JWT_SECRET=your-secret
railway variables set GEMINI_API_KEY=your-key

# Deploy
railway up
```

#### Deploy to AWS ECS

1. Build and push to ECR:
```bash
# Authenticate to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

# Build and tag
docker build -t ai-content-creator .
docker tag ai-content-creator:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/ai-content-creator:latest

# Push
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/ai-content-creator:latest
```

2. Create ECS task definition with:
   - MongoDB Atlas connection
   - Redis Cloud connection
   - Environment variables from AWS Secrets Manager

#### Deploy to Google Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/ai-content-creator

# Deploy
gcloud run deploy ai-content-creator \
  --image gcr.io/YOUR_PROJECT_ID/ai-content-creator \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=mongodb+srv://...,REDIS_HOST=...
```

## 🛠️ Development Setup

For local development with hot reload:

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Or start specific services
docker-compose -f docker-compose.dev.yml up mongodb redis
```

This will:
- Start MongoDB and Redis
- Run API with hot reload on port 3000
- Run Client with hot reload on port 5173
- Mount source code for live updates

Access:
- **Client Dev Server**: http://localhost:5173
- **API Dev Server**: http://localhost:3000/api

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MongoDB connection string | `mongodb://mongodb:27017/ai-content-creator` |
| `REDIS_HOST` | Redis hostname | `redis` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | Secret key for JWT (32+ chars) | `your-super-secret-key-change-in-production` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIza...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Application port | `3000` |
| `NODE_ENV` | Environment mode | `production` |

### Production Secrets

⚠️ **IMPORTANT**: Never commit `.env` files with real secrets!

For production, use:
- AWS Secrets Manager
- Google Cloud Secret Manager
- HashiCorp Vault
- Environment variables in your hosting platform

## 📝 Commands Reference

### Docker Compose Commands

```bash
# Start services
docker-compose up -d

# Start with build
docker-compose up -d --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service_name]

# Restart a service
docker-compose restart [service_name]

# Execute command in container
docker-compose exec app sh

# View running containers
docker-compose ps

# Remove all (including volumes)
docker-compose down -v
```

### Docker Commands

```bash
# Build image
docker build -t ai-content-creator:latest .

# List images
docker images

# List containers
docker ps -a

# View logs
docker logs -f ai-content-creator

# Execute command
docker exec -it ai-content-creator sh

# Remove container
docker rm -f ai-content-creator

# Remove image
docker rmi ai-content-creator:latest

# Prune unused resources
docker system prune -a
```

### Database Commands

```bash
# Access MongoDB shell
docker-compose exec mongodb mongosh ai-content-creator

# Access Redis CLI
docker-compose exec redis redis-cli

# Backup MongoDB
docker-compose exec mongodb mongodump --out /data/backup

# Restore MongoDB
docker-compose exec mongodb mongorestore /data/backup
```

## 🔍 Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs -f app

# Check if port is in use
sudo lsof -i :3000

# Restart all services
docker-compose restart
```

### Database connection issues

```bash
# Check if MongoDB is running
docker-compose ps mongodb

# Check MongoDB logs
docker-compose logs mongodb

# Test connection
docker-compose exec app node -e "require('mongodb').MongoClient.connect('mongodb://mongodb:27017', console.log)"
```

### Redis connection issues

```bash
# Check if Redis is running
docker-compose ps redis

# Test Redis
docker-compose exec redis redis-cli ping
```

### Permission errors

```bash
# Fix file permissions (Linux)
sudo chown -R $USER:$USER .

# Reset Docker volumes
docker-compose down -v
docker-compose up -d
```

### Build failures

```bash
# Clean build with no cache
docker-compose build --no-cache

# Remove old images
docker system prune -a
```

### Application errors

```bash
# Enter container shell
docker-compose exec app sh

# Check environment variables
docker-compose exec app env

# Test Prisma connection
docker-compose exec app npx prisma db push

# Generate Prisma client
docker-compose exec app npx prisma generate
```

## 🏗️ Architecture

### Multi-Stage Build Process

```
┌─────────────────────────────────────────┐
│  Stage 1: Build Client (React + Vite)   │
│  - Install dependencies                 │
│  - Build static files                   │
│  - Output: dist/                        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Stage 2: Build API (NestJS)            │
│  - Install dependencies                 │
│  - Generate Prisma client               │
│  - Build TypeScript                     │
│  - Output: dist/                        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Stage 3: Production Runtime            │
│  - Copy built API                       │
│  - Copy built client → ../client/dist   │
│  - Install production deps only         │
│  - Run as non-root user                 │
│  - Serve everything from port 3000      │
└─────────────────────────────────────────┘
```

### Container Communication

```
┌──────────────────────────────────────────────┐
│  Docker Network: ai-content-creator-network  │
│                                              │
│  ┌────────────┐    ┌────────────┐          │
│  │  MongoDB   │    │   Redis    │          │
│  │  :27017    │    │   :6379    │          │
│  └─────┬──────┘    └──────┬─────┘          │
│        │                  │                 │
│        └────────┬─────────┘                 │
│                 │                           │
│         ┌───────▼────────┐                  │
│         │  Application   │                  │
│         │  (API + Client)│                  │
│         │     :3000      │                  │
│         └────────────────┘                  │
│                                              │
└──────────────────────────────────────────────┘
                   │
                   │ HTTP
                   │
          ┌────────▼────────┐
          │   User Browser   │
          │ localhost:3000   │
          └─────────────────┘
```

### Volume Persistence

```
mongodb_data      → /data/db (MongoDB data)
redis_data        → /data (Redis persistence)
```

## 🔒 Security Best Practices

1. **Use secrets management** - Don't hardcode secrets
2. **Run as non-root** - Already configured in Dockerfile
3. **Keep images updated** - Regularly update base images
4. **Scan for vulnerabilities** - Use `docker scan ai-content-creator`
5. **Limit container resources** - Add CPU/memory limits in production
6. **Use private registries** - For production deployments
7. **Enable TLS** - Use reverse proxy (nginx) with SSL certificates

## 📊 Health Checks

The application includes health checks:

```yaml
# API health check
GET http://localhost:3000/api
# Expected: 200 OK

# MongoDB health check
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Redis health check
docker-compose exec redis redis-cli ping
# Expected: PONG
```

## 🚀 Performance Optimization

### Production Optimizations

1. **Multi-stage builds** - Reduces image size by 70%
2. **Layer caching** - Optimized COPY order for faster rebuilds
3. **Alpine base** - Smaller image footprint
4. **Production dependencies only** - Faster startup
5. **Non-root user** - Security + performance
6. **Health checks** - Automatic recovery

### Monitoring

```bash
# Container resource usage
docker stats

# Application logs
docker-compose logs -f app

# Database logs
docker-compose logs -f mongodb

# Queue logs (via API logs)
docker-compose logs -f app | grep Bull
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Docker Documentation](https://docs.nestjs.com/)
- [Prisma Docker Documentation](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)

---

**Built with 🐳 Docker for easy deployment anywhere!**
