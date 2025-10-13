# Vercel Super Packages Deployment Fix

## Issue
Super packages features not showing on Vercel deployment despite being in the codebase.

## Root Causes Identified

### 1. Missing QueryProvider (FIXED)
- **Problem**: `QueryClientProvider` was not wrapped around the app in `src/app/layout.tsx`
- **Impact**: React Query hooks like `useSuperPackagePriceCalculation` would fail
- **Status**: ✅ FIXED - Added `QueryProvider` to layout.tsx

### 2. Database Migration Not Run on Production (LIKELY ISSUE)
- **Problem**: Super packages collection doesn't exist in production MongoDB
- **Impact**: All super package API calls will fail
- **Migration File**: `src/lib/migrations/008-create-super-packages-collection.ts`

### 3. No Data in Production Database
- **Problem**: Even if collection exists, no super packages have been created
- **Impact**: Features work but show empty state

## Deployment Checklist

### Step 1: Commit and Push Latest Changes
```bash
git add .
git commit -m "Fix: Add QueryProvider to root layout for React Query support"
git push origin main
```

### Step 2: Verify Vercel Environment Variables
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Ensure these are set:
- ✅ `MONGODB_URI` - Points to production MongoDB
- ✅ `NEXTAUTH_URL` - Your production URL
- ✅ `NEXTAUTH_SECRET` - Secure secret key
- ✅ `RESEND_API_KEY` or SMTP settings
- ✅ `RESEND_FROM_EMAIL`

### Step 3: Clear Vercel Build Cache
In Vercel Dashboard:
1. Go to Deployments
2. Click on the latest deployment
3. Click "Redeploy" button
4. Check "Clear build cache and redeploy"

### Step 4: Run Database Migration on Production

**Option A: Via API Route (Recommended)**
1. Deploy the code first
2. Visit: `https://your-domain.vercel.app/api/admin/migrations/run`
3. Or create a temporary migration runner page

**Option B: Via MongoDB Compass/Shell**
Connect to your production MongoDB and run:
```javascript
db.createCollection('superofferpackages');
db.superofferpackages.createIndex({ name: 1 });
db.superofferpackages.createIndex({ status: 1 });
db.superofferpackages.createIndex({ destination: 1 });
db.superofferpackages.createIndex({ 'pricing.tiers.nights': 1 });
```

**Option C: Via Script**
Create a temporary script to run migrations:
```bash
# In your local terminal connected to production DB
MONGODB_URI="your-production-mongodb-uri" node scripts/run-super-packages-migration.js
```

### Step 5: Seed Initial Super Package Data

After migration, you need to create at least one super package:
1. Log into your production site as admin
2. Go to Admin Dashboard → Super Packages
3. Click "Create New Package" or "Import from CSV"
4. Add your first super package

### Step 6: Verify Deployment

Test these URLs on your production site:
1. `/admin/dashboard` - Check if "Super Packages" tab appears
2. `/admin/super-packages` - Should load the super packages manager
3. `/api/admin/super-packages` - Should return JSON (may be empty array)
4. Create a quote and try selecting a super package

## Quick Verification Script

Run this in your browser console on the production site:
```javascript
// Test if QueryProvider is working
fetch('/api/admin/super-packages')
  .then(r => r.json())
  .then(data => console.log('Super Packages API:', data))
  .catch(err => console.error('API Error:', err));

// Check if React Query is loaded
console.log('React Query:', window.__REACT_QUERY_DEVTOOLS_GLOBAL_HOOK__ ? 'Loaded' : 'Not loaded');
```

## Common Issues and Solutions

### Issue: "No QueryClient set" Error
- **Solution**: Already fixed by adding QueryProvider to layout.tsx
- **Verify**: Check that `src/app/layout.tsx` imports and uses `QueryProvider`

### Issue: Super Packages Tab Shows But Empty
- **Cause**: No data in database
- **Solution**: Create super packages via admin interface or import CSV

### Issue: API Returns 500 Error
- **Cause**: Database collection doesn't exist
- **Solution**: Run migration (Step 4 above)

### Issue: Changes Not Showing
- **Cause**: Vercel serving cached build
- **Solution**: Redeploy with cache cleared (Step 3 above)

### Issue: MongoDB Connection Errors
- **Cause**: Wrong MONGODB_URI or IP whitelist
- **Solution**: 
  - Verify connection string in Vercel env vars
  - Add Vercel IPs to MongoDB Atlas whitelist (or use 0.0.0.0/0 for testing)

## Post-Deployment Verification

After deployment, verify these work:
- [ ] Admin dashboard loads
- [ ] Super Packages tab is visible
- [ ] Can navigate to `/admin/super-packages`
- [ ] Can create a new super package
- [ ] Can view existing super packages
- [ ] Quote form shows "Select Super Package" button
- [ ] Package selector modal opens and loads packages
- [ ] Can link a package to a quote

## Rollback Plan

If issues persist:
1. Check Vercel deployment logs for errors
2. Check browser console for JavaScript errors
3. Check Network tab for failed API calls
4. Revert to previous working deployment in Vercel
5. Review MongoDB connection and data

## Next Steps

1. ✅ Commit the QueryProvider fix
2. ⏳ Push to trigger Vercel deployment
3. ⏳ Run database migration on production
4. ⏳ Seed initial super package data
5. ⏳ Test all super package features
6. ⏳ Monitor for errors in Vercel logs

## Support

If issues persist after following these steps:
1. Check Vercel deployment logs
2. Check MongoDB Atlas logs
3. Enable debug logging in production temporarily
4. Check browser console for client-side errors
