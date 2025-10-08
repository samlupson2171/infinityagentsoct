# Implementation Plan

- [x] 1. Fix Environment Validator for Production Builds
  - Modify `src/lib/environment-validator.ts` to recognize MongoDB Atlas connection strings as safe in production
  - Add production environment detection logic
  - Create whitelist for safe MongoDB Atlas patterns
  - Update credential safety check to distinguish between development placeholders and production credentials
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Enhance Startup Validator Build Detection
  - Update `src/lib/startup-validator.ts` to improve build environment detection
  - Add additional checks for Vercel and CI environments
  - Ensure validation is properly skipped during all build scenarios
  - _Requirements: 1.3, 3.1, 3.2, 3.3_

- [x] 3. Verify and Fix API Route Dynamic Configurations
  - Audit all API routes mentioned in error logs to ensure they have proper dynamic exports
  - Add `export const dynamic = 'force-dynamic'` to any routes missing it
  - Add `export const fetchCache = 'force-no-store'` to prevent caching issues
  - Verify routes: `/api/admin/agencies/route.ts`, `/api/admin/agencies/stats/route.ts`, `/api/admin/contracts/signatures/route.ts`, `/api/admin/destinations/activity/route.ts`, `/api/admin/destinations/pending-approval/route.ts`, `/api/admin/destinations/stats/route.ts`, `/api/admin/destinations/validate-slug/route.ts`, `/api/admin/quotes/booking-analytics/route.ts`, `/api/admin/quotes/email-analytics/route.ts`, `/api/admin/quotes/export/route.ts`, `/api/admin/quotes/search/route.ts`, `/api/admin/quotes/stats/route.ts`, `/api/admin/system/data-integrity/route.ts`, `/api/admin/training/analytics/downloads/route.ts`, `/api/admin/users/pending/route.ts`, `/api/destinations/route.ts`
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 4. Fix Mongoose Schema Duplicate Index Warnings
  - Remove `index: true` from `version` field in `src/models/Destination.ts` (keep schema.index call)
  - Remove `index: true` from `associatedMaterial` field in `src/models/FileStorage.ts` (keep schema.index call)
  - Remove `index: true` from `isOrphaned` field in `src/models/FileStorage.ts` (keep schema.index call)
  - Remove `index: true` from `importedBy` field in `src/models/ImportHistory.ts` (keep schema.index call)
  - Remove `index: true` from `importedAt` field in `src/models/ImportHistory.ts` (keep schema.index call)
  - Remove `index: true` from `status` field in `src/models/ImportHistory.ts` (keep schema.index call)
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 5. Test Local Build Process
  - Run `npm run build` locally to verify no environment validation errors
  - Verify no "Dynamic server usage" errors appear
  - Verify no Mongoose duplicate index warnings appear
  - Check that build completes successfully
  - _Requirements: 1.3, 2.3, 4.2_

- [x] 6. Deploy and Verify on Vercel
  - Push changes to repository
  - Trigger Vercel deployment
  - Monitor build logs for any errors
  - Verify deployment completes successfully
  - Test API endpoints in production to ensure they work correctly
  - _Requirements: 1.3, 2.3, 3.3_
