# Docker Build Fix for Railway Deployment

## Issues Fixed

### 1. Node.js Version Mismatch
**Problem**: Dockerfile was using Node 18, but many packages require Node 20+
- `@nestjs/core@11.1.11` requires `node >= 20`
- `mongodb@7.0.0` requires `node >=20.19.0`
- Multiple other packages require Node 20+

**Fix**: Updated all stages from `node:18-alpine` to `node:20-alpine`

### 2. Missing TypeScript Config Files
**Problem**: `.dockerignore` was excluding essential build files:
- `apps/client/tsconfig*.json` - Required for TypeScript compilation
- `apps/client/vite.config.ts` - Required for Vite build
- Other config files needed for the build

**Error**: 
```
error TS5083: Cannot read file '/app/apps/client/tsconfig.json'.
```

**Fix**: Removed exclusions from `.dockerignore` that were blocking build files

## Changes Made

### Dockerfile
- ✅ Updated `FROM node:18-alpine` → `FROM node:20-alpine` (all 3 stages)
- ✅ Ensured proper file copying order

### .dockerignore
- ✅ Removed exclusions for `apps/client/tsconfig*.json`
- ✅ Removed exclusions for `apps/client/vite.config.ts`
- ✅ Removed exclusions for other client build config files
- ✅ Added comment explaining why these files are needed

## Testing

After these changes, the Docker build should:
1. ✅ Use Node 20 (no more engine warnings)
2. ✅ Find all TypeScript config files
3. ✅ Successfully build the client
4. ✅ Successfully build the API
5. ✅ Create production image

## Deployment

The fixed Dockerfile should now work correctly on Railway:

```bash
# Railway will automatically detect and use the Dockerfile
# No additional configuration needed
```

## Verification

To verify locally before deploying:

```bash
# Build the Docker image
docker build -t ai-content-creator:test .

# Should complete without errors
```

## Related Files

- `Dockerfile` - Updated Node version
- `.dockerignore` - Removed build file exclusions

---

**Status**: ✅ Fixed and ready for Railway deployment
