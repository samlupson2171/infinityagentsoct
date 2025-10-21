# Design Document

## Overview

This design addresses the issue where the enquiry form's events section is not appearing on the live Vercel deployment despite being committed to the repository. The solution involves diagnosing the deployment issue, identifying the root cause, and implementing fixes to ensure the events functionality works correctly in production.

## Architecture

### Diagnostic Flow

```
1. Verify Local Functionality
   ↓
2. Check Git Commit Status
   ↓
3. Examine Vercel Build Logs
   ↓
4. Test API Endpoints on Production
   ↓
5. Verify Environment Variables
   ↓
6. Check Database Connection
   ↓
7. Implement Fixes
   ↓
8. Redeploy and Verify
```

### Components Involved

1. **EnquiryForm Component** (`src/components/enquiries/EnquiryForm.tsx`)
   - Main form component that includes the EventSelector
   - Already committed and should be deployed

2. **EventSelector Component** (`src/components/enquiries/EventSelector.tsx`)
   - Fetches and displays events based on destination
   - Makes API calls to `/api/events` and `/api/admin/events/categories`

3. **Events API Route** (`src/app/api/events/route.ts`)
   - Public endpoint for fetching events
   - Uses eventService for data retrieval

4. **Categories API Route** (`src/app/api/admin/events/categories/route.ts`)
   - Admin endpoint for fetching categories
   - May have authentication requirements

5. **Event Service** (`src/lib/services/event-service.ts`)
   - Business logic for event operations
   - Includes caching layer

6. **Database Models** (`src/models/Event.ts`, `src/models/Category.ts`)
   - Mongoose schemas for events and categories

## Potential Issues and Solutions

### Issue 1: API Route Not Found (404)

**Symptoms:**
- EventSelector shows "Failed to load events"
- Browser console shows 404 errors for `/api/events`

**Root Causes:**
- API route not included in build
- Incorrect file structure
- Next.js routing configuration issue

**Solution:**
- Verify API route files exist in correct location
- Check `next.config.js` for any exclusions
- Ensure `export const dynamic = 'force-dynamic'` is present

### Issue 2: Database Connection Failure

**Symptoms:**
- API returns 500 errors
- "Failed to connect to database" messages in logs

**Root Causes:**
- Missing `MONGODB_URI` environment variable in Vercel
- Incorrect connection string
- Database not accessible from Vercel's network
- IP whitelist restrictions on MongoDB Atlas

**Solution:**
- Add/verify `MONGODB_URI` in Vercel environment variables
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0) or Vercel's IP ranges
- Test connection string format
- Check database user permissions

### Issue 3: Authentication Issues

**Symptoms:**
- Categories API returns 401/403 errors
- Events load but categories don't

**Root Causes:**
- Categories endpoint requires admin authentication
- Session/auth not working on Vercel
- Missing `NEXTAUTH_SECRET` or `NEXTAUTH_URL`

**Solution:**
- Make categories endpoint public when `activeOnly=true` parameter is used
- Verify NextAuth environment variables in Vercel
- Update API route to allow public access for active categories

### Issue 4: Build Errors

**Symptoms:**
- Vercel build fails
- TypeScript or ESLint errors
- Missing dependencies

**Root Causes:**
- Type errors in event-related files
- Missing npm packages
- Import path issues

**Solution:**
- Review Vercel build logs
- Fix any TypeScript errors
- Ensure all dependencies are in `package.json`
- Check import paths are correct

### Issue 5: Environment-Specific Code

**Symptoms:**
- Works locally but not on Vercel
- Different behavior in production

**Root Causes:**
- Code relying on local file system
- Development-only features
- Environment variable differences

**Solution:**
- Review code for environment-specific logic
- Use proper environment variable checks
- Ensure all required env vars are set in Vercel

## Data Flow

### Event Loading Flow

```
User opens enquiry form
    ↓
User selects destination
    ↓
EventSelector component triggers
    ↓
Fetch categories: GET /api/admin/events/categories?activeOnly=true
    ↓
Fetch events: GET /api/events?destination={destination}
    ↓
Event Service queries database
    ↓
Returns cached or fresh data
    ↓
EventSelector displays events grouped by category
    ↓
User selects events
    ↓
Selected event IDs stored in form state
    ↓
Form submission includes eventsRequested array
```

## Error Handling

### Client-Side Error Handling

1. **Network Errors**
   - Display user-friendly error message
   - Provide retry mechanism
   - Log error details to console

2. **Empty Results**
   - Show "No events available" message
   - Suggest selecting a destination first

3. **Loading States**
   - Display loading spinner
   - Prevent form submission during load

### Server-Side Error Handling

1. **Database Errors**
   - Return 500 with generic error message
   - Log detailed error server-side
   - Don't expose internal details to client

2. **Validation Errors**
   - Return 400 with specific validation messages
   - Include field-level error details

3. **Authentication Errors**
   - Return 401/403 with appropriate message
   - Redirect to login if needed

## Testing Strategy

### Diagnostic Tests

1. **Local Verification**
   ```bash
   # Test locally first
   npm run dev
   # Navigate to /enquiries
   # Select a destination
   # Verify events load
   ```

2. **API Endpoint Testing**
   ```bash
   # Test production API directly
   curl https://your-domain.vercel.app/api/events
   curl https://your-domain.vercel.app/api/admin/events/categories?activeOnly=true
   ```

3. **Database Connection Test**
   ```bash
   # Create a test endpoint
   curl https://your-domain.vercel.app/api/health
   ```

4. **Build Testing**
   ```bash
   # Test build locally
   npm run build
   npm run start
   ```

### Verification Checklist

- [ ] Events API returns data on production
- [ ] Categories API returns data on production
- [ ] EventSelector component renders on production
- [ ] Events load when destination is selected
- [ ] Selected events are included in form submission
- [ ] No console errors on production
- [ ] Database connection works on Vercel
- [ ] All environment variables are set

## Implementation Steps

### Step 1: Diagnose the Issue

1. Check Vercel deployment logs
2. Test API endpoints directly
3. Verify environment variables
4. Check database connectivity

### Step 2: Fix Categories API Authentication

If categories API requires authentication, modify the route to allow public access for active categories:

```typescript
// src/app/api/admin/events/categories/route.ts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';
    
    // Only require auth if not requesting active categories
    if (!activeOnly) {
      await requireAdmin(request);
    }
    
    // ... rest of the code
  }
}
```

### Step 3: Verify Environment Variables

Ensure these variables are set in Vercel:
- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- Any other required variables

### Step 4: Update MongoDB Atlas Network Access

1. Log into MongoDB Atlas
2. Go to Network Access
3. Add IP address: `0.0.0.0/0` (allow from anywhere)
4. Or add Vercel's specific IP ranges

### Step 5: Add Health Check Endpoint

Create a simple health check to verify database connectivity:

```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', database: 'disconnected', error: error.message },
      { status: 500 }
    );
  }
}
```

### Step 6: Redeploy and Test

1. Commit any fixes
2. Push to main branch
3. Wait for Vercel deployment
4. Test the enquiry form on production
5. Verify events load correctly

## Monitoring and Debugging

### Vercel Logs

Access real-time logs in Vercel dashboard:
1. Go to your project in Vercel
2. Click on "Logs" tab
3. Filter by function (e.g., `/api/events`)
4. Look for errors or warnings

### Browser DevTools

1. Open browser console
2. Go to Network tab
3. Navigate to enquiry form
4. Select a destination
5. Check API requests and responses
6. Look for failed requests or error messages

### Database Monitoring

1. Check MongoDB Atlas metrics
2. Verify connection count
3. Look for failed connection attempts
4. Check query performance

## Rollback Plan

If issues persist:

1. **Temporary Fix**: Hide events section
   ```typescript
   // In EnquiryForm.tsx
   const showEvents = process.env.NEXT_PUBLIC_ENABLE_EVENTS === 'true';
   ```

2. **Revert Commits**: Roll back to previous working version
   ```bash
   git revert HEAD~2
   git push
   ```

3. **Feature Flag**: Implement feature flag for gradual rollout

## Success Criteria

The deployment is successful when:

1. ✅ Enquiry form loads on production without errors
2. ✅ Events section is visible in the form
3. ✅ Selecting a destination loads relevant events
4. ✅ Events are grouped by categories
5. ✅ Users can select/deselect events
6. ✅ Form submission includes selected events
7. ✅ No console errors related to events
8. ✅ API endpoints respond within 2 seconds
9. ✅ Database queries are optimized and cached
10. ✅ Error messages are user-friendly
