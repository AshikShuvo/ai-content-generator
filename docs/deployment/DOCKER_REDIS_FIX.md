# Docker Redis Connection Fix

## Problem

When running the app in Docker, you get this error:
```
MaxRetriesPerRequestError: Reached the max retries per request limit (which is 20)
```

This happens because the app is trying to connect to Redis at `localhost`, but in Docker containers, `localhost` refers to the container itself, not other services.

## Solution

In Docker Compose, services communicate using **service names**, not `localhost`.

### Fixed Configuration

1. **Dockerfile**: Changed `REDIS_HOST=localhost` to `REDIS_HOST=redis`
2. **docker-compose.yml**: Already correctly sets `REDIS_HOST: redis` as environment variable

### How Docker Networking Works

When services are on the same Docker network:
- `localhost` = the container itself ❌
- `redis` = the Redis service container ✅
- `mongodb` = the MongoDB service container ✅

### Verification

After rebuilding, verify the connection:

```bash
# Rebuild and start
docker-compose up --build

# Check if app can reach Redis
docker-compose exec app ping -c 2 redis

# Check Redis logs
docker-compose logs redis

# Check app logs for Redis connection
docker-compose logs app | grep -i redis
```

### Environment Variable Precedence

NestJS ConfigModule reads configuration in this order (highest to lowest priority):
1. **Environment variables** (from docker-compose.yml) ✅ Highest priority
2. `.env` file (from Dockerfile)
3. Default values in code

So even if `.env` has `REDIS_HOST=localhost`, the `REDIS_HOST: redis` from docker-compose.yml will override it.

### Testing the Fix

1. **Rebuild the image:**
   ```bash
   docker-compose build
   ```

2. **Start services:**
   ```bash
   docker-compose up -d
   ```

3. **Test content creation:**
   - Go to http://localhost:3000
   - Create a new content item
   - Check logs: `docker-compose logs -f app`
   - Should see successful queue job creation (no Redis errors)

### If Still Having Issues

1. **Verify network:**
   ```bash
   docker network inspect ai-content-creator-network
   ```
   Should show both `app` and `redis` containers.

2. **Test Redis connection from app container:**
   ```bash
   docker-compose exec app sh
   # Inside container:
   apk add --no-cache redis
   redis-cli -h redis ping
   # Should return: PONG
   ```

3. **Check environment variables:**
   ```bash
   docker-compose exec app env | grep REDIS
   # Should show: REDIS_HOST=redis
   ```

4. **Verify Redis is running:**
   ```bash
   docker-compose ps redis
   # Should show: Up and healthy
   ```

### Alternative: Use Environment Variables Only

If you want to avoid hardcoding in Dockerfile, you can:

1. **Remove .env file creation from Dockerfile**
2. **Set all values in docker-compose.yml:**
   ```yaml
   environment:
     REDIS_HOST: redis
     REDIS_PORT: 6379
     DATABASE_URL: mongodb://mongodb:27017/ai-content-creator
     # ... other vars
   ```

This is the recommended approach for production.
