# Enquiries Events Rendering Fix

## Issue
When viewing quotes in the admin dashboard, a React error occurred:
```
Error: Objects are not valid as a React child (found: object with keys {_id, name})
```

## Root Cause
After implementing the model loader fix to populate Event data in enquiries, the `eventsRequested` field changed from an array of strings/ObjectIds to an array of populated Event objects with `{_id, name}` structure.

The `EnquiriesManager` component was trying to render these Event objects directly in JSX, which React doesn't allow.

## Solution
Updated `src/components/admin/EnquiriesManager.tsx` to handle both populated and unpopulated Event data:

### 1. Event Display (Line 862)
**Before:**
```tsx
{event}
```

**After:**
```tsx
{typeof event === 'string' ? event : event.name || 'Unknown Event'}
```

### 2. Activities Included Field (Line 1048)
**Before:**
```tsx
activitiesIncluded: selectedEnquiryForQuote.eventsRequested.join(', ')
```

**After:**
```tsx
activitiesIncluded: selectedEnquiryForQuote.eventsRequested
  .map((event: any) => typeof event === 'string' ? event : event.name || 'Unknown Event')
  .join(', ')
```

## How It Works
The fix checks if the event is a string (unpopulated) or an object (populated):
- If it's a string, render it directly
- If it's an object, extract the `name` property
- Fallback to 'Unknown Event' if name is missing

This makes the component resilient to both populated and unpopulated data.

## Testing
1. Navigate to admin dashboard
2. Click on "Enquiries"
3. View an enquiry with events
4. The events should display correctly as badges
5. Create a quote from an enquiry - activities should be populated correctly

## Related Files
- `src/components/admin/EnquiriesManager.tsx` - Fixed event rendering
- `src/lib/load-models.ts` - Model loader that enables populate
- `src/lib/mongodb.ts` - Automatically loads models on connection
