# Super Packages Not Showing - Diagnostic Guide

## Current Status
- ✅ Database has 5 packages in `super_offer_packages` collection
- ✅ All packages have `status: 'active'`
- ✅ API route exists at `/api/admin/super-packages/route.ts`
- ✅ Component exists at `SuperPackageManager.tsx`
- ✅ Page exists at `/admin/super-packages/page.tsx`

## Troubleshooting Steps

### Step 1: Check if the server is running
```bash
# Make sure your dev server is running
npm run dev
```

### Step 2: Visit the debug page
Navigate to: `http://localhost:3002/admin/super-packages/debug`

This page will show you:
- Whether the API is responding
- How many packages are returned
- The raw JSON response
- Any errors

### Step 3: Check browser console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to `/admin/super-packages`
4. Look for any errors (red text)

### Step 4: Check Network tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to `/admin/super-packages`
4. Look for the request to `/api/admin/super-packages`
5. Check:
   - Status code (should be 200)
   - Response body (should contain packages array)
   - Request headers (should include authentication cookies)

### Step 5: Check authentication
The API requires admin authentication. Make sure:
1. You're logged in as an admin user
2. Your session is valid
3. Check `/api/auth/session` to verify your session

### Step 6: Common Issues

#### Issue: "Failed to fetch packages" error
**Cause**: API authentication failure or network error
**Solution**: 
- Check if you're logged in
- Check browser console for specific error
- Verify your session at `/api/auth/session`

#### Issue: Empty list but no error
**Cause**: Filters might be hiding packages
**Solution**:
- Click "Clear all filters" button
- Check that status filter is set to "all" or "active"
- Check search box is empty

#### Issue: Loading spinner never stops
**Cause**: API request hanging or failing silently
**Solution**:
- Check Network tab for failed requests
- Check browser console for errors
- Try refreshing the page

#### Issue: "Unauthorized" or 403 error
**Cause**: Not logged in as admin
**Solution**:
- Log in with an admin account
- Check your user role in the database

### Step 7: Manual API Test

You can test the API directly using curl:

```bash
# First, get your session cookie from the browser
# Then run:
curl -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  http://localhost:3002/api/admin/super-packages?status=all&limit=10
```

### Step 8: Check for JavaScript errors

Look for these specific errors in console:
- `TypeError: Cannot read property 'packages' of undefined`
- `Failed to fetch`
- `NetworkError`
- `CORS error`

## Quick Fixes

### Fix 1: Clear browser cache and cookies
Sometimes stale data causes issues:
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Fix 2: Restart the development server
```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

### Fix 3: Check environment variables
Make sure `.env.local` has:
```
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3002
```

## What to Report

If the issue persists, please provide:
1. Screenshot of browser console (with errors)
2. Screenshot of Network tab showing the API request
3. Output from the debug page (`/admin/super-packages/debug`)
4. Your user role (from database or session)
5. Any error messages you see

## Expected Behavior

When working correctly, you should see:
1. A list of 5 packages named "Albufeira 2026"
2. All with status "active"
3. Green status badges
4. Action buttons (Edit, Duplicate, etc.)
5. Pagination showing "Showing 1 to 5 of 5 results"
