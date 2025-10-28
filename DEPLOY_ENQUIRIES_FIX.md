# Deploy Enquiries Fix - Quick Guide

## What Was Fixed
Fixed the "MissingSchemaError: Schema hasn't been registered for model 'Event'" error that was preventing the enquiries page from loading in production.

## Files Changed
1. **src/lib/load-models.ts** (NEW) - Centralized model loader
2. **src/lib/mongodb.ts** - Updated to load all models on connection
3. **ENQUIRIES_EVENT_MODEL_FIX.md** - Documentation

## Deploy to Vercel

### Option 1: Git Push (Recommended)
```bash
git add .
git commit -m "Fix: Load all Mongoose models for serverless environment"
git push
```

Vercel will automatically detect the push and deploy.

### Option 2: Vercel CLI
```bash
vercel --prod
```

## Verify the Fix

1. Wait for deployment to complete (check Vercel dashboard)
2. Navigate to your live site admin dashboard
3. Click on "Enquiries" in the navigation
4. The page should load successfully with events populated
5. Check Vercel logs - you should see "MongoDB connected successfully" without any MissingSchemaError

## What This Fix Does

- Loads all Mongoose models automatically when connecting to MongoDB
- Ensures models are registered before any populate operations
- Works in serverless environments where each function invocation may be a cold start
- Fixes the issue for all API routes, not just enquiries

## If Issues Persist

1. Check Vercel logs for any new errors
2. Verify MONGODB_URI is set correctly in Vercel environment variables
3. Ensure the Event model exists in your MongoDB database
4. Check that the events collection has data

## Rollback (if needed)
```bash
git revert HEAD
git push
```

Or use Vercel dashboard to rollback to previous deployment.
