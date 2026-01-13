# Docker Queue Procedure Troubleshooting

## Common Issues and Solutions

### Issue: Queue Procedure Failing in Docker

The queue system uses Bull (Redis-based) and requires proper Redis connectivity.

## 1. Redis Connection Issues

### Symptoms:
- `MaxRetriesPerRequestError: Reached the max retries per request limit`
- `Failed to add job to queue`
- `Connection refused` errors

### Solution A: Verify Redis is Running

```bash
# Check if Redis container is running
docker-compose ps redis

# Check Redis logs
docker-compose logs redis

# Test Redis connection from app container
docker-compose exec app sh
# Inside container:
apk add --no-cache redis
redis-cli -h redis ping
# Should return: PONG
```

### Solution B: Verify Environment Variables

The app needs `REDIS_HOST=redis` (service name, not localhost):

```bash
# Check environment variables in container
docker-compose exec app env | grep REDIS

# Should show:
# REDIS_HOST=redis
# REDIS_PORT=6379
```

### Solution C: Check Network Connectivity

```bash
# Verify containers are on same network
docker network inspect ai-content-creator-network

# Should show both 'app' and 'redis' containers
```

## 2. Environment Variable Precedence

NestJS ConfigModule reads in this order:
1. **Environment variables** (from docker-compose.yml) ✅ Highest priority
2. `.env` file (from Dockerfile)
3. Default values in code

**Problem**: The `.env` file in the Dockerfile might override docker-compose environment variables.

**Solution**: Ensure docker-compose.yml sets `REDIS_HOST: redis` (which it does).

## 3. Verify Configuration

### Check app.module.ts Redis Configuration:

```typescript
BullModule.forRootAsync({
  useFactory: async (configService: ConfigService) => ({
    redis: {
      host: configService.get<string>('REDIS_HOST', 'localhost'),
      port: configService.get<number>('REDIS_PORT', 6379),
    },
  }),
})
```

This should read `REDIS_HOST` from environment variables.

## 4. Debugging Steps

### Step 1: Check App Logs

```bash
# View all app logs
docker-compose logs -f app

# Filter for queue/Redis errors
docker-compose logs app | grep -i "redis\|queue\|error"
```

### Step 2: Test Redis Connection

```bash
# From app container
docker-compose exec app sh

# Install redis-cli (if not available)
apk add --no-cache redis

# Test connection
redis-cli -h redis -p 6379 ping
# Should return: PONG

# Test from Node.js
node -e "const redis = require('ioredis'); const r = new redis({host: 'redis', port: 6379}); r.ping().then(console.log).catch(console.error);"
```

### Step 3: Verify Queue Service Initialization

Check if the queue processor is registered:

```bash
docker-compose logs app | grep -i "processor\|queue\|bull"
```

Should see:
- `ContentQueueProcessor` initialized
- Queue connection successful

### Step 4: Check Container Startup Order

Ensure Redis starts before the app:

```yaml
depends_on:
  redis:
    condition: service_healthy
```

Verify in logs:
```bash
docker-compose logs app | head -20
```

## 5. Common Fixes

### Fix 1: Rebuild with Correct Redis Host

```bash
# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check logs
docker-compose logs -f app
```

### Fix 2: Remove .env File Override

If `.env` file is overriding environment variables, you can:

1. **Option A**: Don't copy .env file in Dockerfile (rely on env vars)
2. **Option B**: Ensure .env has correct values for Docker

### Fix 3: Add Redis Connection Retry Logic

The Bull configuration already has retry logic, but you can increase it:

```typescript
BullModule.forRootAsync({
  useFactory: async (configService: ConfigService) => ({
    redis: {
      host: configService.get<string>('REDIS_HOST', 'localhost'),
      port: configService.get<number>('REDIS_PORT', 6379),
      maxRetriesPerRequest: null, // Disable retry limit
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    },
  }),
})
```

## 6. Verify Queue is Working

### Test Content Creation:

1. Create content via API
2. Check logs for job queuing:
   ```bash
   docker-compose logs app | grep "Job.*added to queue"
   ```
3. Wait 60 seconds
4. Check logs for job processing:
   ```bash
   docker-compose logs app | grep "Processing job"
   ```

## 7. Quick Diagnostic Script

Create `test-redis.sh`:

```bash
#!/bin/bash
echo "Testing Redis connection from app container..."
docker-compose exec app sh -c "apk add --no-cache redis > /dev/null 2>&1 && redis-cli -h redis ping"

echo "Checking environment variables..."
docker-compose exec app env | grep REDIS

echo "Checking Redis container..."
docker-compose ps redis

echo "Checking network..."
docker network inspect ai-content-creator-network | grep -A 5 "Containers"
```

Run: `chmod +x test-redis.sh && ./test-redis.sh`

## 8. If Still Failing

1. **Check Redis container health:**
   ```bash
   docker-compose ps redis
   # Should show: healthy
   ```

2. **Restart all services:**
   ```bash
   docker-compose restart
   ```

3. **Check for port conflicts:**
   ```bash
   docker-compose ps
   # Ensure ports are correctly mapped
   ```

4. **Verify Bull queue initialization:**
   Check app logs for:
   - `BullModule` initialization
   - `ContentQueueProcessor` registration
   - No connection errors

## Expected Behavior

When working correctly, you should see:
1. ✅ App connects to Redis on startup
2. ✅ Queue processor registers successfully
3. ✅ Jobs are added to queue with 60s delay
4. ✅ After 60s, jobs are processed
5. ✅ Content status updates: PENDING → PROCESSING → COMPLETED

## Still Having Issues?

1. Share the full error logs: `docker-compose logs app > app-logs.txt`
2. Check Redis logs: `docker-compose logs redis > redis-logs.txt`
3. Verify network: `docker network inspect ai-content-creator-network`
