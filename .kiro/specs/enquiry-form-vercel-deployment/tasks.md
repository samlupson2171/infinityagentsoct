# Implementation Plan

- [x] 1. Diagnose the deployment issue
  - Identify the root cause of why events section is not appearing on Vercel
  - Check Vercel build logs for errors or warnings
  - Test API endpoints directly on production
  - Verify database connectivity from Vercel
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 1.1 Create diagnostic script to test production endpoints
  - Write a Node.js script to test `/api/events` and `/api/admin/events/categories` endpoints
  - Include tests for different query parameters
  - Log response status, headers, and body
  - Save results to a diagnostic report file
  - _Requirements: 2.5_

- [x] 1.2 Check Vercel environment variables
  - Access Vercel dashboard and verify all required environment variables are set
  - Compare with local `.env.local` file
  - Ensure `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` are present
  - Document any missing or incorrect variables
  - _Requirements: 2.4_

- [x] 1.3 Review Vercel build logs
  - Access latest deployment logs in Vercel dashboard
  - Search for errors related to events, API routes, or database
  - Identify any TypeScript compilation errors
  - Check for missing dependencies or import issues
  - Document findings
  - _Requirements: 2.2_

- [x] 2. Fix categories API authentication issue
  - Modify the categories API route to allow public access when requesting active categories only
  - Update the route to skip authentication for `activeOnly=true` requests
  - Maintain authentication requirement for admin operations
  - Test locally before deploying
  - _Requirements: 1.3, 1.4, 3.2_

- [x] 2.1 Update categories API route for public access
  - Modify `src/app/api/admin/events/categories/route.ts`
  - Add conditional authentication check based on `activeOnly` parameter
  - Allow unauthenticated access when `activeOnly=true`
  - Keep authentication for other operations (POST, PATCH, DELETE)
  - Add comments explaining the public access logic
  - _Requirements: 1.4, 3.2_

- [ ]* 2.2 Write tests for public categories endpoint
  - Create test file for categories API route
  - Test public access with `activeOnly=true`
  - Test that admin operations still require authentication
  - Verify correct data is returned
  - _Requirements: 1.4_

- [-] 3. Verify and fix database connectivity
  - Ensure MongoDB Atlas allows connections from Vercel
  - Update network access rules if needed
  - Verify connection string format
  - Test database connection from Vercel
  - _Requirements: 2.4, 3.2_

- [ ] 3.1 Update MongoDB Atlas network access
  - Log into MongoDB Atlas dashboard
  - Navigate to Network Access settings
  - Add IP address `0.0.0.0/0` to allow connections from anywhere (or Vercel-specific IPs)
  - Verify database user has correct permissions
  - Test connection after changes
  - _Requirements: 3.2_

- [x] 3.2 Create health check endpoint
  - Create `src/app/api/health/route.ts` if it doesn't exist
  - Implement GET handler that tests database connection
  - Return status and connection details
  - Include error handling and logging
  - Test locally and on Vercel after deployment
  - _Requirements: 2.5, 3.2_

- [x] 4. Ensure all environment variables are set in Vercel
  - Add or update environment variables in Vercel dashboard
  - Set variables for Production, Preview, and Development environments
  - Verify `MONGODB_URI` points to correct database
  - Ensure `NEXTAUTH_URL` matches production domain
  - Trigger redeployment after changes
  - _Requirements: 2.4, 3.1_

- [x] 5. Fix any build or TypeScript errors
  - Address any compilation errors found in Vercel logs
  - Fix TypeScript type issues in events-related files
  - Ensure all imports are correct
  - Verify all dependencies are in package.json
  - Test build locally with `npm run build`
  - _Requirements: 2.2, 3.1_

- [x] 6. Deploy fixes and verify functionality
  - Commit all changes with clear commit message
  - Push to main branch to trigger Vercel deployment
  - Monitor deployment progress in Vercel dashboard
  - Wait for deployment to complete successfully
  - _Requirements: 3.1, 3.5_

- [x] 6.1 Test events functionality on production
  - Navigate to enquiry form on live site
  - Select a destination from dropdown
  - Verify events section loads and displays events
  - Check that events are grouped by categories
  - Test selecting and deselecting events
  - Submit form and verify events are included
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.3, 3.5_

- [x] 6.2 Verify API endpoints on production
  - Test `/api/events` endpoint directly
  - Test `/api/admin/events/categories?activeOnly=true` endpoint
  - Test `/api/health` endpoint
  - Verify response times are acceptable (< 2 seconds)
  - Check for any error responses
  - _Requirements: 1.3, 1.4, 3.2_

- [x] 6.3 Check browser console for errors
  - Open browser DevTools on production site
  - Navigate to enquiry form
  - Check Console tab for JavaScript errors
  - Check Network tab for failed API requests
  - Verify no 404, 500, or authentication errors
  - _Requirements: 1.1, 3.4_

- [ ]* 6.4 Monitor Vercel logs for issues
  - Access Vercel logs dashboard
  - Filter logs for events-related API calls
  - Look for any errors or warnings
  - Check database connection logs
  - Verify no performance issues
  - _Requirements: 3.4_

- [ ] 7. Document the fix and update deployment guide
  - Create summary document explaining what was wrong
  - Document the fix that was applied
  - Update deployment guide with lessons learned
  - Add troubleshooting section for similar issues
  - Include checklist for future deployments
  - _Requirements: 3.5_
