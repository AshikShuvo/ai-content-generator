# Docker Build Arguments Guide

This guide explains how to populate the build arguments (`ARG`) in the Dockerfile when building Docker images.

## Build Arguments in Dockerfile

The Dockerfile uses these build arguments:
- `DATABASE_URL` - MongoDB connection string
- `REDIS_HOST` - Redis hostname
- `REDIS_PORT` - Redis port
- `REDIS_URL` - Full Redis URL (for third-party Redis services)
- `GEMINI_API_KEY` - Google Gemini API key
- `PORT` - Application port
- `NODE_ENV` - Environment (development/production)

## Method 1: Using docker-compose.yml (Recommended)

The `docker-compose.yml` file now includes build arguments that read from environment variables:

```yaml
app:
  build:
    context: .
    dockerfile: Dockerfile
    args:
      DATABASE_URL: ${DATABASE_URL:-mongodb://mongodb:27017/ai-content-creator}
      REDIS_HOST: ${REDIS_HOST:-redis}
      REDIS_PORT: ${REDIS_PORT:-6379}
      REDIS_URL: ${REDIS_URL:-}
      GEMINI_API_KEY: ${GEMINI_API_KEY:-}
      PORT: ${PORT:-3000}
      NODE_ENV: ${NODE_ENV:-production}
```

### How to Use:

1. **Create a `.env` file** in the project root:
```env
DATABASE_URL=mongodb://mongodb:27017/ai-content-creator
REDIS_HOST=redis
REDIS_PORT=6379
# For third-party Redis (use either REDIS_URL or REDIS_HOST+REDIS_PORT)
REDIS_URL=redis://:password@your-redis-host:6379
GEMINI_API_KEY=your-gemini-api-key
PORT=3000
NODE_ENV=production
```

2. **Build and run with docker-compose:**
```bash
docker-compose build
docker-compose up -d
```

The build arguments will automatically be read from your `.env` file or environment variables.

## Method 2: Direct Docker Build Command

### Using --build-arg flags:

```bash
docker build \
  --build-arg DATABASE_URL="mongodb://mongodb:27017/ai-content-creator" \
  --build-arg REDIS_HOST="redis" \
  --build-arg REDIS_PORT="6379" \
  --build-arg REDIS_URL="redis://:password@your-redis-host:6379" \
  --build-arg GEMINI_API_KEY="your-gemini-api-key" \
  --build-arg PORT="3000" \
  --build-arg NODE_ENV="production" \
  -t ai-content-creator:latest .
```

### Using environment variables:

```bash
export DATABASE_URL="mongodb://mongodb:27017/ai-content-creator"
export REDIS_HOST="redis"
export REDIS_PORT="6379"
export REDIS_URL="redis://:password@your-redis-host:6379"
export GEMINI_API_KEY="your-gemini-api-key"
export PORT="3000"
export NODE_ENV="production"

docker build \
  --build-arg DATABASE_URL="$DATABASE_URL" \
  --build-arg REDIS_HOST="$REDIS_HOST" \
  --build-arg REDIS_PORT="$REDIS_PORT" \
  --build-arg REDIS_URL="$REDIS_URL" \
  --build-arg GEMINI_API_KEY="$GEMINI_API_KEY" \
  --build-arg PORT="$PORT" \
  --build-arg NODE_ENV="$NODE_ENV" \
  -t ai-content-creator:latest .
```

## Method 3: Using a Build Script

Create a `build-docker.sh` script:

```bash
#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

docker build \
  --build-arg DATABASE_URL="${DATABASE_URL:-mongodb://mongodb:27017/ai-content-creator}" \
  --build-arg REDIS_HOST="${REDIS_HOST:-redis}" \
  --build-arg REDIS_PORT="${REDIS_PORT:-6379}" \
  --build-arg REDIS_URL="${REDIS_URL:-}" \
  --build-arg GEMINI_API_KEY="${GEMINI_API_KEY:-}" \
  --build-arg PORT="${PORT:-3000}" \
  --build-arg NODE_ENV="${NODE_ENV:-production}" \
  -t ai-content-creator:latest .
```

Make it executable and run:
```bash
chmod +x build-docker.sh
./build-docker.sh
```

## Method 4: For Third-Party Redis Services

### Using Redis URL (Recommended):

```bash
docker build \
  --build-arg REDIS_URL="redis://:your-password@your-redis-host.upstash.io:6379" \
  --build-arg DATABASE_URL="mongodb://mongodb:27017/ai-content-creator" \
  --build-arg GEMINI_API_KEY="your-gemini-api-key" \
  --build-arg PORT="3000" \
  --build-arg NODE_ENV="production" \
  -t ai-content-creator:latest .
```

### Using Separate Redis Credentials:

```bash
docker build \
  --build-arg REDIS_HOST="your-redis-host.upstash.io" \
  --build-arg REDIS_PORT="6379" \
  --build-arg REDIS_PASSWORD="your-redis-password" \
  --build-arg DATABASE_URL="mongodb://mongodb:27017/ai-content-creator" \
  --build-arg GEMINI_API_KEY="your-gemini-api-key" \
  --build-arg PORT="3000" \
  --build-arg NODE_ENV="production" \
  -t ai-content-creator:latest .
```

### For TLS/SSL Redis:

```bash
docker build \
  --build-arg REDIS_URL="rediss://:your-password@your-redis-host.upstash.io:6380" \
  # ... other args
  -t ai-content-creator:latest .
```

## Important Notes

### ⚠️ Security Warning

**Build arguments are embedded in the Docker image layers!** This means:
- ❌ **Never use build args for sensitive secrets** (passwords, API keys) in production
- ✅ **Use runtime environment variables** instead (set in `docker-compose.yml` under `environment:`)

### Best Practice for Production

For production deployments, prefer using **runtime environment variables** instead of build arguments:

```yaml
# docker-compose.yml
app:
  build:
    context: .
    dockerfile: Dockerfile
    # Minimal build args (non-sensitive defaults only)
    args:
      NODE_ENV: production
  environment:
    # Sensitive values at runtime (not in image)
    DATABASE_URL: ${DATABASE_URL}
    REDIS_URL: ${REDIS_URL}
    GEMINI_API_KEY: ${GEMINI_API_KEY}
    JWT_SECRET: ${JWT_SECRET}
```

This way, secrets are not stored in the Docker image layers.

### Default Values

If a build argument is not provided, it will be `undefined` in the Dockerfile. The Dockerfile should handle this gracefully, but you can provide defaults:

```dockerfile
ARG DATABASE_URL=default-value
ARG REDIS_HOST=redis
ARG REDIS_PORT=6379
```

Or use the `${VAR:-default}` syntax in docker-compose.yml (already implemented).

## Examples by Deployment Platform

### Railway

Railway automatically provides environment variables. Use them in `railway.toml` or set them in the Railway dashboard:

```bash
railway variables set DATABASE_URL="your-db-url"
railway variables set REDIS_URL="your-redis-url"
railway variables set GEMINI_API_KEY="your-key"
```

### Render

Set environment variables in Render dashboard, they'll be available during build:

```yaml
# render.yaml
services:
  - type: web
    envVars:
      - key: DATABASE_URL
        value: your-db-url
      - key: REDIS_URL
        value: your-redis-url
```

### GitHub Actions

```yaml
- name: Build Docker image
  run: |
    docker build \
      --build-arg DATABASE_URL="${{ secrets.DATABASE_URL }}" \
      --build-arg REDIS_URL="${{ secrets.REDIS_URL }}" \
      --build-arg GEMINI_API_KEY="${{ secrets.GEMINI_API_KEY }}" \
      -t ai-content-creator:latest .
```

## Troubleshooting

### Build args not being passed?

1. Check that you're using `--build-arg` for each argument
2. Verify the argument names match exactly (case-sensitive)
3. For docker-compose, ensure the `args:` section is under `build:`

### Values are empty or undefined?

1. Check your `.env` file exists and has the values
2. Verify environment variables are exported before build
3. Use `docker-compose config` to see resolved values

### Secrets in image history?

1. Use `docker history <image>` to check
2. Switch to runtime environment variables for secrets
3. Use Docker secrets or external secret management for production
