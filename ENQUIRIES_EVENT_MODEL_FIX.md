# Enquiries Event Model Fix

## Issue
The admin dashboard was failing to view enquiries on the live site with the error:
```
MissingSchemaError: Schema hasn't been registered for model "Event".
Use mongoose.model(name, schema)
```

This was working locally but failing in production (Vercel).

## Root Cause
In serverless environments like Vercel, Mongoose models need to be explicitly imported to be registered with Mongoose. The enquiries API routes were using `.populate('eventsRequested', 'name')` to populate Event data, but the Event model wasn't imported in those files.

## Solution
Added explicit Event model imports to the following files:

1. **src/app/api/admin/enquiries/route.ts**
   - Added: `import Event from '@/models/Event';`
   - This ensures the Event model is registered when the route is loaded

2. **src/app/api/enquiries/route.ts**
   - Added: `import Event from '@/models/Event';`
   - This ensures the Event model is registered for the public enquiry submission route

## Why This Happens in Serverless
- In traditional Node.js servers, models are loaded once at startup
- In serverless (Vercel), each function invocation may be a cold start
- Mongoose needs models explicitly imported in each route file that uses them
- Even if you're just populating a reference, the model must be imported

## Testing
After deploying this fix:
1. Navigate to the admin dashboard
2. Click on "Enquiries" 
3. The list should load without errors
4. Events should be properly populated in the enquiry data

## Prevention
When creating new API routes that use Mongoose populate:
- Always import all models that will be populated
- Don't rely on models being registered elsewhere
- This applies to nested populates as well
