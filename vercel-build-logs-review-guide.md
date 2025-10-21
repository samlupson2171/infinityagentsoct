# Vercel Build Logs Review Guide

## Purpose
This guide helps you systematically review Vercel build logs to identify issues preventing the events section from appearing in production.

---

## How to Access Vercel Build Logs

### Method 1: Vercel Dashboard (Recommended)

1. **Navigate to Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Select your project

2. **View Deployments**
   - Click on "Deployments" tab
   - Click on the most recent deployment

3. **Access Build Logs**
   - Scroll down to "Build Logs" section
   - Or click "View Build Logs" button

4. **Download Logs (Optional)**
   - Click "Download" to save logs locally
   - Useful for detailed analysis

### Method 2: Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# View latest deployment logs
vercel logs

# View logs for specific deployment
vercel logs [deployment-url]
```

---

## What to Look For in Build Logs

### 🔴 Critical Errors (Build Failures)

Search for these patterns in the logs:

#### TypeScript Compilation Errors
```
❌ Type error: ...
❌ TS2307: Cannot find module ...
❌ TS2345: Argument of type ... is not assignable to parameter of type ...
```

**Common Issues**:
- Missing type definitions
- Import path errors
- Type mismatches in event-related files

**Files to Check**:
- `src/app/api/events/route.ts`
- `src/app/api/admin/events/categories/route.ts`
- `src/components/enquiries/EventSelector.tsx`
- `src/lib/services/event-service.ts`
- `src/models/Event.ts`
- `src/models/Category.ts`

#### Module Not Found Errors
```
❌ Module not found: Can't resolve ...
❌ Error: Cannot find module ...
```

**Common Causes**:
- Missing npm packages
- Incorrect import paths
- Case-sensitive file name issues

#### Build Command Failures
```
❌ Error: Command "npm run build" exited with 1
❌ Build failed
```

### ⚠️ Warnings (May Cause Issues)

#### ESLint Warnings
```
⚠ ESLint: ...
⚠ Warning: ...
```

**Note**: Warnings usually don't prevent deployment but may indicate code issues

#### Dependency Warnings
```
⚠ npm WARN deprecated ...
⚠ peer dependency warning ...
```

### ✅ Success Indicators

Look for these positive signs:

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Creating an optimized production build
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

---

## Specific Checks for Events Functionality

### 1. API Routes Compilation

Search for these in the logs:

```
Compiling /api/events ...
Compiling /api/admin/events/categories ...
```

**What to verify**:
- [ ] `/api/events/route.ts` compiled successfully
- [ ] `/api/admin/events/categories/route.ts` compiled successfully
- [ ] No errors in event service files
- [ ] No errors in event models

### 2. Component Compilation

Search for:

```
Compiling /enquiries ...
```

**What to verify**:
- [ ] `EventSelector.tsx` compiled successfully
- [ ] `EnquiryForm.tsx` compiled successfully
- [ ] No errors in event-related components

### 3. Database Connection

Search for:

```
MONGODB_URI
database
connection
```

**What to verify**:
- [ ] No "MONGODB_URI is not defined" errors
- [ ] No database connection errors during build
- [ ] Environment variables are being loaded

### 4. Static Generation

Search for:

```
Generating static pages
```

**What to verify**:
- [ ] `/enquiries` page generated successfully
- [ ] No errors during static page generation

---

## Common Build Issues and Solutions

### Issue 1: TypeScript Errors in Event Files

**Symptoms**:
```
Type error: Property 'destination' does not exist on type 'Event'
```

**Solution**:
1. Check `src/models/Event.ts` for correct schema
2. Verify type definitions in `src/types/index.ts`
3. Run `npm run build` locally to reproduce
4. Fix type errors and redeploy

### Issue 2: Missing Dependencies

**Symptoms**:
```
Module not found: Can't resolve 'mongoose'
```

**Solution**:
1. Check `package.json` for missing dependencies
2. Run `npm install` locally
3. Commit updated `package-lock.json`
4. Redeploy

### Issue 3: Import Path Errors

**Symptoms**:
```
Module not found: Can't resolve '@/lib/services/event-service'
```

**Solution**:
1. Verify file exists at correct path
2. Check `tsconfig.json` path aliases
3. Ensure file names match exactly (case-sensitive)
4. Fix imports and redeploy

### Issue 4: Environment Variable Issues

**Symptoms**:
```
Warning: MONGODB_URI is not defined
```

**Solution**:
1. Add environment variables in Vercel dashboard
2. Trigger redeployment
3. Verify variables are set for Production environment

### Issue 5: Build Timeout

**Symptoms**:
```
Error: Build exceeded maximum duration
```

**Solution**:
1. Optimize build process
2. Check for infinite loops in build scripts
3. Contact Vercel support if issue persists

---

## Build Log Analysis Template

Use this template to document your findings:

```markdown
## Build Log Analysis

**Date**: _______________
**Deployment ID**: _______________
**Deployment URL**: _______________

### Build Status
- [ ] ✅ Build succeeded
- [ ] ❌ Build failed
- [ ] ⚠️ Build succeeded with warnings

### Errors Found
1. **Error Type**: _______________
   - **Location**: _______________
   - **Message**: _______________
   - **Solution**: _______________

2. **Error Type**: _______________
   - **Location**: _______________
   - **Message**: _______________
   - **Solution**: _______________

### Warnings Found
1. **Warning**: _______________
   - **Impact**: _______________
   - **Action Needed**: _______________

### Events-Related Compilation
- [ ] `/api/events` compiled successfully
- [ ] `/api/admin/events/categories` compiled successfully
- [ ] `EventSelector.tsx` compiled successfully
- [ ] `EnquiryForm.tsx` compiled successfully
- [ ] Event models compiled successfully
- [ ] Event services compiled successfully

### Environment Variables
- [ ] MONGODB_URI detected in build
- [ ] NEXTAUTH_SECRET detected in build
- [ ] NEXTAUTH_URL detected in build
- [ ] No environment variable warnings

### Static Generation
- [ ] `/enquiries` page generated
- [ ] No errors during page generation

### Build Performance
- **Build Duration**: _______________
- **Bundle Size**: _______________
- **Performance Issues**: _______________

### Next Steps
1. _______________
2. _______________
3. _______________

### Notes
_______________
_______________
_______________
```

---

## Automated Log Analysis Script

You can also use this command to extract key information from logs:

```bash
# If you downloaded the logs to a file
grep -i "error\|warning\|failed\|events\|categories" vercel-build.log

# Search for specific patterns
grep -i "api/events" vercel-build.log
grep -i "EventSelector" vercel-build.log
grep -i "MONGODB_URI" vercel-build.log
```

---

## Key Files to Verify in Build Logs

Make sure these files are being processed without errors:

### API Routes
- [ ] `src/app/api/events/route.ts`
- [ ] `src/app/api/admin/events/categories/route.ts`
- [ ] `src/app/api/admin/events/categories/[id]/route.ts`
- [ ] `src/app/api/admin/events/[id]/route.ts`
- [ ] `src/app/api/admin/events/[id]/status/route.ts`
- [ ] `src/app/api/admin/events/route.ts`

### Components
- [ ] `src/components/enquiries/EventSelector.tsx`
- [ ] `src/components/enquiries/EnquiryForm.tsx`
- [ ] `src/components/admin/EventsManager.tsx`
- [ ] `src/components/admin/EventForm.tsx`
- [ ] `src/components/admin/CategoryManager.tsx`

### Services and Libraries
- [ ] `src/lib/services/event-service.ts`
- [ ] `src/lib/services/category-service.ts`
- [ ] `src/lib/services/event-cache.ts`
- [ ] `src/lib/validation/event-validation.ts`

### Models
- [ ] `src/models/Event.ts`
- [ ] `src/models/Category.ts`

### Pages
- [ ] `src/app/enquiries/page.tsx`
- [ ] `src/app/admin/events/page.tsx`

---

## After Reviewing Logs

### If Build Succeeded
1. ✅ Build is successful
2. ➡️ Move to testing API endpoints (use diagnostic script)
3. ➡️ Check runtime errors in Vercel function logs

### If Build Failed
1. ❌ Document all errors found
2. 🔧 Fix errors locally
3. ✅ Test build locally: `npm run build`
4. 📤 Commit and push fixes
5. 🔄 Monitor new deployment

### If Build Has Warnings
1. ⚠️ Evaluate if warnings could cause runtime issues
2. 🔍 Test functionality despite warnings
3. 📝 Document warnings for future cleanup

---

## Vercel Function Logs (Runtime Errors)

If build succeeds but events still don't work, check runtime logs:

1. **Access Function Logs**
   - Go to Vercel dashboard
   - Click "Logs" tab (not Build Logs)
   - Filter by function: `/api/events`

2. **Look for Runtime Errors**
   - Database connection errors
   - Authentication errors
   - Query errors
   - Timeout errors

3. **Real-time Monitoring**
   ```bash
   vercel logs --follow
   ```

---

## Checklist Summary

- [ ] Accessed Vercel build logs
- [ ] Searched for errors related to events functionality
- [ ] Verified all event-related files compiled successfully
- [ ] Checked for TypeScript compilation errors
- [ ] Verified environment variables are loaded
- [ ] Documented all findings
- [ ] Identified root cause or next steps
- [ ] Created action plan to fix issues

---

## Additional Resources

- **Vercel Build Logs Documentation**: https://vercel.com/docs/deployments/logs
- **Next.js Build Errors**: https://nextjs.org/docs/messages
- **TypeScript Errors**: https://www.typescriptlang.org/docs/handbook/error-messages.html

---

## Notes and Findings

[Use this space to document your findings from the build log review]

**Key Errors Found**:
1. _______________
2. _______________
3. _______________

**Root Cause Analysis**:
_______________

**Action Items**:
1. _______________
2. _______________
3. _______________
