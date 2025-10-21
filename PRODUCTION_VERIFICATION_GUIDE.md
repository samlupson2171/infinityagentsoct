# Production Verification Guide

## Task 6: Deploy Fixes and Verify Functionality

### ✅ Completed Steps

1. **Code Changes Committed and Pushed**
   - Modified `src/app/api/admin/events/categories/route.ts` to allow public access when `activeOnly=true`
   - Updated `src/models/Event.ts` with performance indexes
   - Commit: `7940584` - "Fix events section deployment: Enable public access to categories API"
   - Successfully pushed to `main` branch

2. **Vercel Deployment Triggered**
   - Push to main branch automatically triggers Vercel deployment
   - Vercel Project: `infinagent` (ID: prj_dhKZqakiPtCWjvY9fYJkIpFkAxOK)

---

## Manual Verification Steps Required

Since I cannot directly access your Vercel dashboard or the live production URL, please complete the following verification steps:

### Step 1: Monitor Vercel Deployment

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your `infinagent` project
3. Check the "Deployments" tab
4. Look for the latest deployment (commit: `7940584`)
5. Wait for deployment status to show "Ready" (✅)
6. Note the production URL (should be something like `https://infinagent.vercel.app` or your custom domain)

**Expected Result:** Deployment completes successfully without build errors

---

### Step 2: Test API Endpoints on Production (Task 6.2)

Once deployment is complete, test these endpoints directly in your browser or using curl:

#### 2.1 Health Check Endpoint
```bash
curl https://YOUR-PRODUCTION-URL.vercel.app/api/health
```
**Expected:** `{"status":"ok","database":"connected"}`

#### 2.2 Events API
```bash
curl https://YOUR-PRODUCTION-URL.vercel.app/api/events
```
**Expected:** JSON array of events with status 200

#### 2.3 Events API with Destination Filter
```bash
curl https://YOUR-PRODUCTION-URL.vercel.app/api/events?destination=benidorm
```
**Expected:** JSON array of events filtered by destination

#### 2.4 Categories API (Public Access)
```bash
curl https://YOUR-PRODUCTION-URL.vercel.app/api/admin/events/categories?activeOnly=true
```
**Expected:** JSON array of active categories with status 200 (no authentication required)

#### 2.5 Categories API (All - Should Require Auth)
```bash
curl https://YOUR-PRODUCTION-URL.vercel.app/api/admin/events/categories
```
**Expected:** 401 Unauthorized (authentication required)

**Requirements Check:**
- ✅ All endpoints respond with correct status codes
- ✅ Response times are under 2 seconds
- ✅ No 500 errors
- ✅ Categories API allows public access with `activeOnly=true`

---

### Step 3: Test Events Functionality on Production (Task 6.1)

1. **Navigate to Enquiry Form**
   - Go to `https://YOUR-PRODUCTION-URL.vercel.app/enquiries`

2. **Select a Destination**
   - Choose a destination from the dropdown (e.g., "Benidorm")

3. **Verify Events Section Loads**
   - Events section should appear below destination selection
   - Events should be displayed and grouped by categories
   - Loading spinner should appear briefly then show events

4. **Test Event Selection**
   - Click on event checkboxes to select events
   - Verify selected events are highlighted
   - Deselect events and verify they are unhighlighted

5. **Submit Form**
   - Fill out required form fields
   - Submit the form
   - Verify submission succeeds
   - Check that selected events are included in the enquiry

**Expected Results:**
- ✅ Events section is visible
- ✅ Events load when destination is selected
- ✅ Events are grouped by categories
- ✅ Event selection/deselection works
- ✅ Form submission includes selected events

---

### Step 4: Check Browser Console for Errors (Task 6.3)

1. **Open Browser DevTools**
   - Press F12 or right-click → Inspect
   - Go to the "Console" tab

2. **Navigate to Enquiry Form**
   - Go to `/enquiries` page
   - Select a destination

3. **Check Console Tab**
   - Look for any red error messages
   - Verify no JavaScript errors
   - Check for any warnings (yellow)

4. **Check Network Tab**
   - Switch to "Network" tab
   - Filter by "Fetch/XHR"
   - Look for API requests to:
     - `/api/events`
     - `/api/admin/events/categories`
   - Verify all requests return 200 status
   - Check response times

**Expected Results:**
- ✅ No JavaScript errors in console
- ✅ No failed API requests (404, 500)
- ✅ No authentication errors (401, 403)
- ✅ All API requests complete successfully

---

### Step 5: Check Vercel Logs (Optional - Task 6.4)

1. Go to Vercel Dashboard → Your Project
2. Click on "Logs" tab
3. Filter logs by:
   - Function: `/api/events`
   - Function: `/api/admin/events/categories`
4. Look for:
   - Any error messages
   - Database connection issues
   - Performance warnings

**Expected Results:**
- ✅ No errors in logs
- ✅ Database connections successful
- ✅ No performance issues

---

## Verification Checklist

Use this checklist to confirm all requirements are met:

### Deployment (Task 6)
- [ ] Changes committed with clear message
- [ ] Changes pushed to main branch
- [ ] Vercel deployment triggered
- [ ] Deployment completed successfully

### API Endpoints (Task 6.2)
- [ ] `/api/health` returns 200 OK
- [ ] `/api/events` returns events data
- [ ] `/api/events?destination=X` filters correctly
- [ ] `/api/admin/events/categories?activeOnly=true` returns categories (no auth)
- [ ] All responses under 2 seconds
- [ ] No 500 errors

### Events Functionality (Task 6.1)
- [ ] Enquiry form loads without errors
- [ ] Events section is visible
- [ ] Selecting destination loads events
- [ ] Events are grouped by categories
- [ ] Can select/deselect events
- [ ] Form submission includes events

### Browser Console (Task 6.3)
- [ ] No JavaScript errors
- [ ] No failed API requests
- [ ] No 404 errors
- [ ] No 500 errors
- [ ] No authentication errors

---

## Troubleshooting

### If Events Don't Load

1. **Check Network Tab**
   - Are API requests being made?
   - What status codes are returned?
   - Check request/response details

2. **Check Console Errors**
   - Look for specific error messages
   - Check if it's a CORS issue
   - Verify authentication errors

3. **Check Vercel Logs**
   - Look for server-side errors
   - Check database connection
   - Verify environment variables

### If API Returns 401/403

- Verify the categories API route change was deployed
- Check that `activeOnly=true` parameter is being sent
- Review the route code in production

### If Database Connection Fails

- Verify `MONGODB_URI` is set in Vercel environment variables
- Check MongoDB Atlas network access allows Vercel IPs
- Test `/api/health` endpoint

---

## Success Criteria

All tasks are complete when:

1. ✅ Deployment completed successfully on Vercel
2. ✅ All API endpoints respond correctly
3. ✅ Events section loads on enquiry form
4. ✅ Users can select events
5. ✅ Form submission includes events
6. ✅ No console errors
7. ✅ Response times under 2 seconds

---

## Next Steps

Once all verification steps pass:

1. Mark tasks 6.1, 6.2, and 6.3 as complete
2. Mark task 6 as complete
3. Proceed to Task 7: Document the fix and update deployment guide

---

## Automated Verification Script

Once you have the correct production URL, you can run:

```bash
VERCEL_URL=https://your-actual-domain.vercel.app node verify-production-endpoints.js
```

This will automatically test all API endpoints and provide a summary report.
