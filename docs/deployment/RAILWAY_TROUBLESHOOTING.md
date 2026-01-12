# Railway Deployment Troubleshooting

## Common Issues and Solutions

### Error: Cannot find module '/app/apps/api/dist/main.js'

This error indicates that the build process didn't complete successfully or the dist folder wasn't copied correctly.

#### Solution 1: Check Build Logs

1. Go to your Railway project dashboard
2. Click on the deployment
3. Check the build logs for any errors during the build stage
4. Look for messages like:
   - "Build completed. Checking dist folder..."
   - "Build verification successful!"

#### Solution 2: Verify Dockerfile Build Process

The Dockerfile should:
1. Build the API in the `api-builder` stage
2. Verify that `dist/main.js` exists after build
3. Copy the dist folder to the production stage

If you see build errors, check:
- Are all source files being copied?
- Is Prisma client being generated?
- Are there TypeScript compilation errors?

#### Solution 3: Manual Build Verification

To test the build locally:

```bash
# Build the Docker image locally
docker build -t ai-content-creator:test .

# Check if the build succeeds
docker run --rm ai-content-creator:test ls -la /app/apps/api/dist/

# Should show main.js and other files
```

#### Solution 4: Check Railway Build Settings

1. In Railway dashboard, go to your service
2. Check "Settings" → "Build"
3. Ensure:
   - Build command is empty (Dockerfile handles it)
   - Start command is empty (Dockerfile CMD handles it)
   - Dockerfile path is correct (usually `Dockerfile`)

#### Solution 5: Rebuild from Scratch

Sometimes Railway caches can cause issues:

1. In Railway dashboard, go to your service
2. Click "Settings" → "Danger Zone"
3. Click "Redeploy" or "Deploy from GitHub"
4. This will trigger a fresh build

#### Solution 6: Check Environment Variables

Ensure all required environment variables are set in Railway:

- `DATABASE_URL`
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `REDIS_HOST`
- `REDIS_PORT`
- `NODE_ENV=production`

#### Solution 7: Verify Source Files

The Dockerfile needs these files to build:
- `apps/api/src/**/*.ts` - All source files
- `apps/api/package.json` - Dependencies
- `apps/api/tsconfig.json` - TypeScript config
- `apps/api/nest-cli.json` - NestJS config
- `apps/api/prisma/schema.prisma` - Database schema

Check that these files exist in your repository.

### Other Common Issues

#### Build Timeout

If builds are timing out:
- Railway free tier has build time limits
- Consider upgrading or optimizing the build
- Remove unnecessary dependencies

#### Memory Issues

If you see out-of-memory errors:
- Railway free tier has memory limits
- The build process might need more memory
- Consider using Railway Pro plan

#### Prisma Generation Errors

If Prisma client generation fails:
- Check that `DATABASE_URL` is set (even if not used during build)
- Verify `prisma/schema.prisma` is correct
- Check Prisma version compatibility

### Getting Help

If none of these solutions work:

1. Check Railway logs for specific error messages
2. Test the Dockerfile locally: `docker build -t test .`
3. Verify all files are committed to your repository
4. Check Railway status page for service issues
5. Contact Railway support with your deployment logs

### Debugging Commands

To debug the Docker build:

```bash
# Build with verbose output
docker build --progress=plain -t ai-content-creator:debug .

# Run and inspect
docker run -it --entrypoint /bin/sh ai-content-creator:debug

# Inside container, check:
ls -la /app/apps/api/
ls -la /app/apps/api/dist/
cat /app/apps/api/package.json
```

### Prevention

To prevent this issue:

1. Always test Docker builds locally before deploying
2. Use multi-stage builds to keep images small
3. Add build verification steps in Dockerfile
4. Monitor Railway build logs regularly
5. Keep dependencies up to date
