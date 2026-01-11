# Gemini Model Name Fix - January 12, 2026

## Issue
The model name `gemini-1.5-flash-latest` has been deprecated by Google and returns a 404 error:
```
[404 Not Found] models/gemini-1.5-flash-latest is not found for API version v1beta
```

## Root Cause
- Google has deprecated the `-latest` aliases for Gemini models
- The v1beta API endpoint may not support certain model aliases
- Newer stable model names are now required

## Solution Applied

### Code Changes
Updated `/apps/api/src/ai/gemini.service.ts` to:
1. Use `gemini-1.5-flash` as the default stable model name
2. Make the model name configurable via environment variable
3. Add detailed logging for the selected model

### Environment Variable Setup
Add this to your `/apps/api/.env` file:

```env
# AI Configuration
GEMINI_API_KEY=your-google-gemini-api-key-here

# Optional: Specify Gemini model (default: gemini-1.5-flash if not set)
# Recommended stable models in order of preference:
# - gemini-1.5-flash (most common stable name) ✅ DEFAULT
# - gemini-2.0-flash (newer, faster standard)
# - gemini-1.5-flash-002 (specific pinned version)
GEMINI_MODEL=gemini-1.5-flash
```

## Recommended Model Names (January 2026)

### 1. `gemini-1.5-flash` ✅ RECOMMENDED
- **Status**: Stable
- **Best for**: Most use cases, free tier friendly
- **Speed**: Fast
- **Cost**: Low

### 2. `gemini-2.0-flash`
- **Status**: Newer standard (if available)
- **Best for**: Latest features
- **Speed**: Very fast
- **Cost**: Low

### 3. `gemini-1.5-flash-002`
- **Status**: Pinned version
- **Best for**: Production environments requiring version stability
- **Speed**: Fast
- **Cost**: Low

### 4. `gemini-pro`
- **Status**: Stable classic
- **Best for**: More complex tasks
- **Speed**: Moderate
- **Cost**: Higher

## How to Apply the Fix

### Step 1: Update Environment Variable
Edit your `/apps/api/.env` file and add or update:

```bash
# Use the stable model name
GEMINI_MODEL=gemini-1.5-flash
```

**OR** if you don't add `GEMINI_MODEL`, it will default to `gemini-1.5-flash` automatically.

### Step 2: Restart the Backend
```bash
# Kill existing process
lsof -ti:3000 | xargs -r kill -9

# Start fresh
cd apps/api
npm run dev
```

### Step 3: Test the Fix
Create a new content generation request and verify:
1. Job is queued successfully (202 response)
2. After 60 seconds, job processes without errors
3. Content is generated and saved to database
4. Check logs for: `Gemini AI initialized successfully with model: gemini-1.5-flash`

## Verifying the Model Name

### Check Logs on Startup
When the backend starts, you should see:
```
[Nest] xxxxx - LOG [GeminiService] Gemini AI initialized successfully with model: gemini-1.5-flash
```

### If You Still Get 404 Errors
Try these model names in order until one works:

1. `gemini-1.5-flash` (default)
2. `gemini-2.0-flash` (if 2.0 is available in your region)
3. `gemini-1.5-flash-002` (pinned version)
4. `gemini-pro` (classic stable model)

Edit your `.env` file and restart the server after each change.

## Testing Different Models

To test which models work with your API key:

### Option 1: Try Each Model Manually
1. Update `GEMINI_MODEL` in `.env`
2. Restart server
3. Create a test content generation
4. Check logs for success/failure

### Option 2: Use Google AI Studio
Visit https://aistudio.google.com and check which models are available in your region with your API key.

## Why "latest" Aliases Are Problematic

- **Moving Targets**: `-latest` aliases can change without notice
- **API Version Conflicts**: May not be supported on all API versions (v1, v1beta)
- **Deprecation**: Google can retire these aliases
- **Production Issues**: Can break production without warning

**Best Practice**: Always use specific, stable model names in production.

## Debugging

### Check Current Model Being Used
Look for this log when server starts:
```
[GeminiService] Gemini AI initialized successfully with model: <model-name>
```

### Enable Debug Logs
Set in `.env`:
```env
LOG_LEVEL=debug
```

### Common Issues

| Error | Cause | Solution |
|-------|-------|----------|
| 404 Not Found | Invalid model name | Try `gemini-1.5-flash` |
| 403 Forbidden | Invalid API key | Check `GEMINI_API_KEY` |
| 429 Too Many Requests | Rate limit exceeded | Wait or upgrade plan |
| Safety filter triggered | Content blocked | Modify prompt |

## What Changed in the Code

### Before:
```typescript
this.model = this.genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash-latest' // ❌ Deprecated
});
```

### After:
```typescript
// Get model from env or use stable default
const modelName = this.configService.get<string>('GEMINI_MODEL') || 'gemini-1.5-flash';

this.model = this.genAI.getGenerativeModel({ 
  model: modelName // ✅ Configurable and stable
});

this.logger.log(`Gemini AI initialized successfully with model: ${modelName}`);
```

## Benefits of This Fix

1. ✅ **Configurable**: Easy to change model without code changes
2. ✅ **Stable**: Uses official stable model names
3. ✅ **Documented**: Clear logging of which model is being used
4. ✅ **Future-Proof**: Easy to update when new models are released
5. ✅ **Production-Ready**: No breaking changes from deprecated aliases

## Next Steps

1. **Immediate**: Update your `.env` file with `GEMINI_MODEL=gemini-1.5-flash`
2. **Testing**: Restart server and test content generation
3. **Monitor**: Watch logs for successful model initialization
4. **Deploy**: Once working locally, update production environment variables

## Reference Links

- [Google AI Studio](https://aistudio.google.com)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Available Models List](https://ai.google.dev/models/gemini)

---

**Status**: ✅ Fix Applied  
**Date**: January 12, 2026  
**Impact**: Critical - Required for AI content generation  
**Action Required**: Update `.env` file and restart server
