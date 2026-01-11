# GitHub Actions Secrets Setup

This document explains how to set up GitHub Actions secrets for automated deployment.

## Required Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions → New repository secret):

### Vercel Secrets

1. **VERCEL_TOKEN**
   - Go to [Vercel Account Settings → Tokens](https://vercel.com/account/tokens)
   - Create new token with name "GitHub Actions"
   - Copy token and add to GitHub secrets

2. **VERCEL_ORG_ID**
   - Run in your local terminal:
     ```bash
     cd apps/client
     vercel link
     cat .vercel/project.json
     ```
   - Copy the `orgId` value
   - Add to GitHub secrets

3. **VERCEL_PROJECT_ID**
   - From the same `.vercel/project.json` file
   - Copy the `projectId` value
   - Add to GitHub secrets

4. **VERCEL_URL**
   - Your production Vercel URL
   - Example: `https://ai-content-creator.vercel.app`
   - Add to GitHub secrets

5. **VITE_API_URL**
   - Your Railway API URL
   - Example: `https://your-app.railway.app`
   - Add to GitHub secrets

### Railway Secrets

1. **RAILWAY_TOKEN**
   - Go to [Railway Account Settings → Tokens](https://railway.app/account/tokens)
   - Create new token with name "GitHub Actions"
   - Copy token and add to GitHub secrets

2. **RAILWAY_API_URL**
   - Your Railway service URL
   - Example: `https://your-app.railway.app`
   - Get from Railway dashboard or CLI: `railway domain`
   - Add to GitHub secrets

## How to Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** (top menu)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret**
5. Enter the name (e.g., `VERCEL_TOKEN`)
6. Paste the value
7. Click **Add secret**
8. Repeat for all secrets listed above

## Verification

After adding all secrets, they should look like this in your GitHub repository:

```
Repository secrets:
├── VERCEL_TOKEN
├── VERCEL_ORG_ID
├── VERCEL_PROJECT_ID
├── VERCEL_URL
├── VITE_API_URL
├── RAILWAY_TOKEN
└── RAILWAY_API_URL
```

## Testing the Workflow

1. Make a commit to the `main` branch:
   ```bash
   git add .
   git commit -m "Test CI/CD deployment"
   git push origin main
   ```

2. Go to **Actions** tab in GitHub repository
3. Watch the workflow run
4. If it fails, check the logs for which secret might be missing

## Troubleshooting

### Error: "VERCEL_TOKEN not found"
- Make sure you've added the secret exactly as `VERCEL_TOKEN` (case-sensitive)
- Verify the token is valid in Vercel settings

### Error: "Railway deployment failed"
- Check `RAILWAY_TOKEN` is valid
- Verify Railway project is linked correctly
- Check Railway service name matches in workflow file

### Error: "Cannot read project.json"
- Run `vercel link` in `apps/client` directory first
- Make sure `.vercel/project.json` exists
- Try running `vercel pull` to regenerate

## Manual Deployment

If GitHub Actions is not working, you can still deploy manually:

### Frontend (Vercel)
```bash
cd apps/client
vercel --prod
```

### Backend (Railway)
```bash
cd apps/api
railway up
```

## Security Notes

- ⚠️ Never commit secrets to the repository
- ⚠️ Never print secrets in workflow logs
- ⚠️ Rotate tokens regularly (every 3-6 months)
- ⚠️ Use separate tokens for CI/CD and local development
- ⚠️ Limit token permissions to what's needed

## Additional Resources

- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vercel CLI Tokens](https://vercel.com/docs/cli#commands/login)
- [Railway CLI Authentication](https://docs.railway.app/develop/cli#authentication)
