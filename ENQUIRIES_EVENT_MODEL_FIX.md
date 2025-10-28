# Enquiries Event Model Fix

## Issue
The admin dashboard was failing to view enquiries on the live site with the error:
```
MissingSchemaError: Schema hasn't been registered for model "Event".
Use mongoose.model(name, schema)
```

This was working locally but failing in production (Vercel).

## Root Cause
In serverless environments like Vercel, Mongoose models need to be explicitly imported to be registered with Mongoose. The enquiries API routes were using `.populate('eventsRequested', 'name')` to populate Event data, but the Event model wasn't loaded when the route executed.

## Solution

### 1. Created Model Loader Utility
Created `src/lib/load-models.ts` that imports all models to ensure they're registered with Mongoose:

```typescript
import '@/models/User';
import '@/models/Event';
import '@/models/Category';
// ... all other models

export function ensureModelsLoaded() {
  return true;
}
```

### 2. Integrated Model Loader into Database Connection
Modified `src/lib/mongodb.ts` to automatically load all models when connecting to the database:

```typescript
import { ensureModelsLoaded } from './load-models';

async function connectDB() {
  // Ensure all models are loaded before connecting
  // This is critical for serverless environments where models
  // need to be registered before populate operations
  ensureModelsLoaded();
  
  // ... rest of connection logic
}
```

This approach ensures that:
- All models are loaded automatically whenever any API route connects to the database
- No need to manually import models in each route file
- Works for all existing and future routes that use populate
- Centralized solution that's easy to maintain

## Why This Happens in Serverless
- In traditional Node.js servers, models are loaded once at startup
- In serverless (Vercel), each function invocation may be a cold start
- Mongoose needs models explicitly imported before they can be used in populate
- Even if you're just populating a reference, the model must be registered

## Benefits of This Approach
- Centralized model loading in one place
- Easy to maintain - add new models in one location
- Prevents similar issues with other models
- Works reliably in serverless environments

## Testing
After deploying this fix:
1. Navigate to the admin dashboard
2. Click on "Enquiries" 
3. The list should load without errors
4. Events should be properly populated in the enquiry data

## Prevention
When creating new models:
1. Add the model import to `src/lib/load-models.ts`
2. Export it from `src/models/index.ts`
3. No changes needed in API routes - models are loaded automatically via `connectDB()`

## Deployment
After committing these changes:
```bash
git add .
git commit -m "Fix: Ensure Event model is registered for enquiries populate"
git push
```

Vercel will automatically deploy the changes.
