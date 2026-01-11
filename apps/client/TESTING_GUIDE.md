# Authentication Integration - Testing Guide

## Prerequisites

Before testing, ensure:
1. ✅ Backend API is running on `http://localhost:3000`
2. ✅ Database is connected and migrations are applied
3. ✅ Frontend client dependencies are installed

## Starting the Application

### Terminal 1 - Backend API
```bash
cd apps/api
npm run start:dev
```
Expected output: Server running on http://localhost:3000

### Terminal 2 - Frontend Client
```bash
cd apps/client
npm run dev
```
Expected output: Server running on http://localhost:5173

## Test Scenarios

### 1. Initial Navigation Test
**Steps:**
1. Open browser to `http://localhost:5173`
2. Verify you're redirected to `/login` (not authenticated)

**Expected:**
- URL should be `http://localhost:5173/login`
- See login form with email and password fields
- See "create a new account" link

### 2. Registration Flow Test
**Steps:**
1. From login page, click "create a new account" link
2. Fill in the registration form:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
3. Click "Create account" button

**Expected:**
- Loading state shows "Creating account..."
- After success, automatically redirected to `/dashboard`
- Dashboard shows "Welcome, Test User"
- See user information displayed

### 3. Logout Test
**Steps:**
1. From dashboard, click "Logout" button in top right

**Expected:**
- Redirected to `/login` page
- User data cleared from localStorage
- Cannot access `/dashboard` without logging in again

### 4. Login Flow Test
**Steps:**
1. Navigate to `http://localhost:5173/login`
2. Enter credentials:
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Sign in" button

**Expected:**
- Loading state shows "Signing in..."
- After success, redirected to `/dashboard`
- See user information and welcome message

### 5. Protected Route Test
**Steps:**
1. Logout from dashboard
2. Manually navigate to `http://localhost:5173/dashboard`

**Expected:**
- Immediately redirected to `/login`
- Cannot access dashboard without authentication

### 6. Invalid Login Test
**Steps:**
1. Go to login page
2. Enter invalid credentials:
   - Email: `wrong@example.com`
   - Password: `wrongpassword`
3. Click "Sign in"

**Expected:**
- Error message appears: "Failed to login. Please check your credentials."
- Remain on login page
- Form fields retain values

### 7. Password Validation Test
**Steps:**
1. Go to registration page
2. Enter:
   - Full Name: `Test User 2`
   - Email: `test2@example.com`
   - Password: `pass123`
   - Confirm Password: `different123`
3. Click "Create account"

**Expected:**
- Error message: "Passwords do not match"
- No API call made (client-side validation)

### 8. Short Password Test
**Steps:**
1. On registration page, enter:
   - Full Name: `Test User 3`
   - Email: `test3@example.com`
   - Password: `123`
   - Confirm Password: `123`
3. Click "Create account"

**Expected:**
- Error message: "Password must be at least 6 characters long"
- No API call made (client-side validation)

### 9. Duplicate Email Test
**Steps:**
1. Try to register with already registered email:
   - Full Name: `Duplicate User`
   - Email: `test@example.com` (already registered)
   - Password: `password123`
   - Confirm Password: `password123`
2. Click "Create account"

**Expected:**
- Error message from API displayed
- Remain on registration page

### 10. Session Persistence Test
**Steps:**
1. Login successfully
2. Navigate to dashboard
3. Refresh the page (F5 or Cmd+R)

**Expected:**
- Remain logged in after page refresh
- Dashboard loads with user data
- No redirect to login

### 11. Token Expiry Test (Manual)
**Steps:**
1. Login successfully
2. Open browser DevTools → Application → Local Storage
3. Delete `access_token` from localStorage
4. Try to navigate or refresh dashboard

**Expected:**
- Automatically redirected to login
- Session cleared

### 12. Direct Route Access Test
**Steps:**
1. While logged out, try accessing:
   - `http://localhost:5173/`
   - `http://localhost:5173/dashboard`

**Expected:**
- Both URLs redirect to `/login`
- After login, `/` redirects to `/dashboard`

### 13. Mobile Responsiveness Test
**Steps:**
1. Open DevTools → Toggle device toolbar
2. Test on different screen sizes:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1920px)

**Expected:**
- All pages are responsive
- Forms are easy to use on mobile
- Buttons and links are easily clickable
- No horizontal scroll

## API Integration Verification

### Check Network Tab
1. Open DevTools → Network tab
2. Perform login
3. Check the requests:

**Expected requests:**
- `POST /api/auth/login` - Status 201
- Response includes `access_token` and `user` object

### Check Console
**Expected:**
- No JavaScript errors
- No React warnings
- No 404 errors for assets

## localStorage Verification

After successful login, check DevTools → Application → Local Storage:

**Expected keys:**
- `access_token` - JWT token string
- `user` - JSON string with user object `{"id": "...", "email": "...", "name": "..."}`

## Known Issues / Edge Cases

### Issue: Refresh after logout
- **Behavior:** Page shows briefly before redirect
- **Reason:** React re-render cycle
- **Impact:** Minimal, UX is acceptable

### Issue: Token in localStorage
- **Security:** Tokens in localStorage are vulnerable to XSS
- **Mitigation:** For production, consider httpOnly cookies
- **Current:** Acceptable for development

## Success Criteria

✅ All 13 test scenarios pass
✅ No console errors
✅ No network errors
✅ API integration working
✅ Protected routes functioning
✅ Session persistence working
✅ Error handling working
✅ Mobile responsive
✅ Build successful
✅ No linter errors

## Troubleshooting

### Problem: API calls fail with 404
**Solution:** Ensure backend is running on port 3000

### Problem: "Cannot find module" errors
**Solution:** Run `npm install` in apps/client

### Problem: Tailwind styles not applying
**Solution:** 
1. Check postcss.config.js has '@tailwindcss/postcss'
2. Restart dev server

### Problem: TypeScript errors
**Solution:** Run `npm run build` to see specific errors

### Problem: Redirect loop
**Solution:**
1. Clear localStorage
2. Refresh page
3. Start fresh login

## Performance Checks

### Lighthouse Scores (Target)
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 80

### Bundle Size
- Total: ~282 KB (gzipped: ~92 KB)
- Acceptable for SPA with routing + Tailwind

## Next Testing Phase
Once basic authentication is working:
1. Add token refresh mechanism
2. Test concurrent sessions
3. Add E2E tests with Playwright/Cypress
4. Add unit tests for components
5. Test accessibility with screen readers
