# Vercel Deployment Diagnosis - Quick Start Guide

## 🎯 Goal
Identify why the events section is not appearing on your Vercel deployment.

## 📋 What Was Created

Three diagnostic tools to help you troubleshoot:

1. **`diagnose-vercel-deployment.js`** - Automated endpoint testing script
2. **`vercel-env-checklist.md`** - Environment variables verification checklist
3. **`vercel-build-logs-review-guide.md`** - Build logs analysis guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Run the Diagnostic Script

```bash
# Replace YOUR_VERCEL_URL with your actual deployment URL
node diagnose-vercel-deployment.js https://YOUR_VERCEL_URL.vercel.app
```

**Example**:
```bash
node diagnose-vercel-deployment.js https://infinityweekends.vercel.app
```

**What it does**:
- Tests all events-related API endpoints
- Checks database connectivity
- Measures response times
- Generates a detailed report

**Output**:
- Console: Real-time test results with ✅/❌ indicators
- File: `vercel-diagnostic-report.json` with full details

### Step 2: Review the Results

The script will tell you exactly what's wrong:

#### Scenario A: Health Check Fails ❌
```
❌ Health Check
   Database may not be connected
```
**Action**: Check environment variables (Step 3)

#### Scenario B: Categories API Returns 401 ❌
```
❌ Categories API - Public (activeOnly=true)
   Status: 401 Unauthorized
```
**Action**: Categories API needs to allow public access (Task 2)

#### Scenario C: Events API Fails ❌
```
❌ Events API - Basic
   Status: 500 Internal Server Error
```
**Action**: Check build logs (Step 4) and database connection

#### Scenario D: All Tests Pass ✅
```
✅ All tests passed
```
**Action**: Issue may be in frontend or caching

### Step 3: Check Environment Variables

1. Open `vercel-env-checklist.md`
2. Log into https://vercel.com/dashboard
3. Go to your project → Settings → Environment Variables
4. Verify each variable in the checklist:
   - ✅ MONGODB_URI
   - ✅ NEXTAUTH_SECRET
   - ✅ NEXTAUTH_URL
   - ✅ Email settings

**Critical**: Make sure NEXTAUTH_URL is your production domain, not localhost!

### Step 4: Review Build Logs (If Needed)

1. Open `vercel-build-logs-review-guide.md`
2. Go to Vercel dashboard → Deployments → Latest deployment
3. Click "View Build Logs"
4. Search for errors related to:
   - `/api/events`
   - `/api/admin/events/categories`
   - `EventSelector`
   - TypeScript errors

## 🔍 Common Issues & Quick Fixes

### Issue 1: "Cannot connect to database"
**Fix**:
1. Add MONGODB_URI to Vercel environment variables
2. Ensure MongoDB Atlas allows connections from 0.0.0.0/0
3. Redeploy

### Issue 2: "Categories API returns 401"
**Fix**:
1. Update `src/app/api/admin/events/categories/route.ts`
2. Allow public access when `activeOnly=true`
3. See Task 2 in tasks.md

### Issue 3: "Events section not visible"
**Fix**:
1. Check browser console for errors
2. Verify NEXTAUTH_URL is set correctly
3. Test API endpoints directly

### Issue 4: "Build failed"
**Fix**:
1. Review build logs for TypeScript errors
2. Fix errors locally
3. Test with `npm run build`
4. Commit and redeploy

## 📊 Understanding the Diagnostic Report

The script generates `vercel-diagnostic-report.json`:

```json
{
  "timestamp": "2024-10-20T...",
  "productionUrl": "https://your-app.vercel.app",
  "tests": [
    {
      "name": "Health Check",
      "passed": true,
      "statusCode": 200,
      "databaseConnected": true
    },
    // ... more tests
  ],
  "summary": {
    "total": 10,
    "passed": 8,
    "failed": 2,
    "warnings": 1
  }
}
```

**Key metrics**:
- `passed`: Number of successful tests
- `failed`: Number of failed tests
- `warnings`: Issues that may cause problems

## 🎯 Next Steps Based on Results

### If diagnostic shows database issues:
→ Go to Task 3: Verify database connectivity
→ Check MongoDB Atlas network access
→ Verify MONGODB_URI in Vercel

### If diagnostic shows auth issues:
→ Go to Task 2: Fix categories API authentication
→ Update API route to allow public access

### If diagnostic shows build errors:
→ Go to Task 5: Fix build errors
→ Review build logs
→ Fix TypeScript/import errors

### If all tests pass:
→ Check browser console for frontend errors
→ Verify EventSelector component is rendering
→ Test form submission end-to-end

## 🛠️ Troubleshooting the Diagnostic Script

### Script won't run:
```bash
# Make it executable
chmod +x diagnose-vercel-deployment.js

# Run with node explicitly
node diagnose-vercel-deployment.js https://your-url.vercel.app
```

### "Please provide your Vercel production URL":
```bash
# You must provide the URL as an argument
node diagnose-vercel-deployment.js https://your-app.vercel.app
```

### Connection timeout:
- Check if your Vercel app is actually deployed
- Verify the URL is correct
- Check if Vercel is experiencing issues

## 📞 Getting Help

If you're stuck:

1. **Check the diagnostic report**: `vercel-diagnostic-report.json`
2. **Review Vercel logs**: Dashboard → Logs tab
3. **Test locally**: Ensure events work on localhost
4. **Check MongoDB Atlas**: Verify database is accessible

## ✅ Success Checklist

After running diagnostics, you should know:

- [ ] Which API endpoints are failing
- [ ] Whether database is connected
- [ ] If environment variables are set
- [ ] What errors appear in build logs
- [ ] What the root cause is

## 📝 Document Your Findings

Use the templates in the diagnostic files to document:

1. **Test results** from the diagnostic script
2. **Environment variables** status from the checklist
3. **Build errors** from the logs review guide

This documentation will help with:
- Fixing the current issue
- Preventing future issues
- Onboarding team members

## ⏱️ Time Estimate

- Running diagnostic script: **2 minutes**
- Checking environment variables: **5 minutes**
- Reviewing build logs: **10 minutes**
- **Total: ~15-20 minutes**

## 🎉 What's Next?

Once you've identified the issue:

1. **Fix it** using the appropriate task (2-5)
2. **Redeploy** to Vercel
3. **Re-run diagnostics** to verify the fix
4. **Test manually** on the live site

---

## Quick Command Reference

```bash
# Run diagnostics
node diagnose-vercel-deployment.js https://your-app.vercel.app

# View diagnostic report
cat vercel-diagnostic-report.json

# Test specific endpoint manually
curl https://your-app.vercel.app/api/events
curl https://your-app.vercel.app/api/admin/events/categories?activeOnly=true

# Check Vercel logs (requires Vercel CLI)
vercel logs

# List environment variables
vercel env ls
```

---

**Ready to start?** Run the diagnostic script now! 🚀
