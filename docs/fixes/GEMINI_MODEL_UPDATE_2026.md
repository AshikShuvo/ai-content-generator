# Gemini Model Update - January 2026

## Critical Issue
The Gemini API model names have changed in 2026. Many `gemini-1.5-*` models are no longer available on the v1beta endpoint, causing 404 errors.

## Solution Applied

### 1. Updated Default Model
Changed from `gemini-1.5-flash` to `gemini-2.5-flash` (latest stable model as of 2026).

### 2. Added Automatic Fallback
The service now automatically tries fallback models if the primary model fails:
- `gemini-flash-latest` (always points to latest)
- `gemini-pro` (classic stable)
- `gemini-1.5-pro` (alternative)
- `gemini-1.5-flash-002` (pinned version)

### 3. Check Available Models Script
Created a helper script to check which models work with your API key.

## Quick Fix

### Option 1: Update Environment Variable (Recommended)
Edit your `/apps/api/.env` file:

```env
# Try these in order until one works:
GEMINI_MODEL=gemini-2.5-flash
# OR
GEMINI_MODEL=gemini-flash-latest
# OR
GEMINI_MODEL=gemini-pro
```

### Option 2: Check Available Models
Run the helper script to see which models your API key supports:

```bash
cd apps/api
node check-gemini-models.js YOUR_API_KEY
```

This will show you:
- ✅ All available models
- ✅ Models that support `generateContent`
- ✅ Recommended models for your API key

### Option 3: Automatic Fallback (Already Implemented)
The code now automatically tries fallback models if the primary fails. Just restart your server and it will find a working model.

## Model Availability by Region/API Key

Different API keys and regions may have access to different models. Common scenarios:

### Scenario 1: New API Key (2026)
- ✅ `gemini-2.5-flash` - Usually available
- ✅ `gemini-flash-latest` - Usually available
- ❌ `gemini-1.5-flash` - May be deprecated
- ❌ `gemini-1.5-flash-latest` - Deprecated

### Scenario 2: Older API Key
- ✅ `gemini-pro` - Usually still available
- ✅ `gemini-1.5-pro` - May be available
- ❌ `gemini-1.5-flash` - May be deprecated

### Scenario 3: Enterprise/Paid Account
- ✅ All latest models available
- ✅ `gemini-2.5-flash` recommended
- ✅ `gemini-ultra` available (if applicable)

## Testing Your Setup

### Step 1: Check Available Models
```bash
cd apps/api
node check-gemini-models.js YOUR_GEMINI_API_KEY
```

### Step 2: Update .env
Based on the output, set `GEMINI_MODEL` to an available model.

### Step 3: Restart Server
```bash
npm run dev
```

### Step 4: Test Content Generation
1. Create a new content generation request
2. Check server logs for:
   - `Gemini AI initialized successfully with model: <model-name>`
   - If you see fallback messages, the primary model failed but a fallback worked

## Code Changes

### Before:
```typescript
const modelName = this.configService.get<string>('GEMINI_MODEL') || 'gemini-1.5-flash';
```

### After:
```typescript
// Default to latest stable model
const modelName = this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';

// Automatic fallback if primary model fails
private async tryFallbackModels(prompt: string, contentType: ContentType): Promise<string> {
  const fallbackModels = [
    'gemini-flash-latest',
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash-002',
  ];
  // ... tries each until one works
}
```

## Troubleshooting

### Error: "404 Not Found" for all models
**Possible causes:**
1. API key is invalid
2. Generative Language API not enabled in Google Cloud
3. Billing not set up
4. API key doesn't have access to models

**Solution:**
1. Verify API key at https://aistudio.google.com
2. Enable "Generative Language API" in Google Cloud Console
3. Check billing status
4. Try the check script: `node check-gemini-models.js YOUR_KEY`

### Error: "Quota exceeded"
**Solution:**
- Wait for quota reset
- Check your usage limits
- Consider upgrading plan

### All fallback models fail
**Solution:**
1. Check API key validity
2. Verify billing is active
3. Check Google Cloud Console for API status
4. Try a different API key

## Recommended Models (January 2026)

| Model | Status | Best For | Speed | Cost |
|-------|--------|----------|-------|------|
| `gemini-2.5-flash` | ✅ Latest | Production, fast responses | Very Fast | Low |
| `gemini-flash-latest` | ✅ Latest | Always up-to-date | Very Fast | Low |
| `gemini-pro` | ✅ Stable | Complex tasks | Moderate | Medium |
| `gemini-1.5-pro` | ⚠️ Legacy | Older compatibility | Moderate | Medium |
| `gemini-1.5-flash` | ❌ Deprecated | Don't use | N/A | N/A |

## Environment Variable Options

Add to `/apps/api/.env`:

```env
# Option 1: Latest stable (recommended)
GEMINI_MODEL=gemini-2.5-flash

# Option 2: Always latest (auto-updates)
GEMINI_MODEL=gemini-flash-latest

# Option 3: Classic stable
GEMINI_MODEL=gemini-pro

# Option 4: Legacy (if others don't work)
GEMINI_MODEL=gemini-1.5-pro
```

## Verification

After updating, check server logs on startup:
```
[GeminiService] Gemini AI initialized successfully with model: gemini-2.5-flash
```

If you see fallback messages:
```
[GeminiService] Trying fallback model: gemini-pro
[GeminiService] Successfully generated content using fallback model: gemini-pro
[GeminiService] Switched to fallback model: gemini-pro. Consider updating GEMINI_MODEL in .env
```

This means the primary model failed but a fallback worked. Update your `.env` to use the working model.

## Next Steps

1. ✅ **Immediate**: Restart your server (fallback will auto-detect working model)
2. ✅ **Short-term**: Run `check-gemini-models.js` to find best model
3. ✅ **Long-term**: Update `.env` with the working model name

---

**Status**: ✅ Fixed with automatic fallback  
**Date**: January 12, 2026  
**Impact**: Critical - Required for AI content generation
