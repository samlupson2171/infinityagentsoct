# Quote Manager LinkedPackage Error Fix

## Problem
When viewing quotes in the Quote Manager (`/admin/quotes`), the application was crashing with the following error:

```
src/components/admin/QuoteManager.tsx (1408:69) @ tierLabel
Cannot read properties of undefined (reading 'tierLabel')
```

This error occurred when trying to display quote details for quotes that have a `linkedPackage` but are missing the `selectedTier` data or have incomplete `selectedTier` information.

## Root Cause
The code was directly accessing `selectedQuote.linkedPackage.selectedTier.tierLabel` without checking if `selectedTier` exists. Some quotes in the database may have:
- Missing `selectedTier` object entirely
- `selectedTier` object exists but `tierLabel` is undefined/null
- Incomplete linkedPackage data from older quote creation flows

## Solution
Added proper null-safe checks using optional chaining (`?.`) and fallback values for all linkedPackage fields in the Quote Details Modal:

### Changes Made in `src/components/admin/QuoteManager.tsx`

**Before (Line ~1408):**
```tsx
{selectedQuote.linkedPackage.selectedTier.tierLabel}
```

**After:**
```tsx
{selectedQuote.linkedPackage.selectedTier?.tierLabel || 'Not specified'}
```

### All Fixed Fields:

#### QuoteManager.tsx (Quote Details Modal):
1. **Group Size Tier**: `selectedTier?.tierLabel || 'Not specified'`
2. **Duration**: `selectedNights || 'N/A'`
3. **Pricing Period**: `selectedPeriod || 'Not specified'`
4. **Calculated Price**: Added type checking for number before calling `toLocaleString()`

#### quote-linker.ts (Package Summary):
- All linkedPackage fields now have fallback values
- Uses optional chaining for `selectedTier?.tierLabel`

#### send-email/route.ts (Email Notifications):
- `selectedTier?.tierLabel || 'Not specified'` when building email data

#### recalculate-price/route.ts (Price Updates):
- Initializes `selectedTier` object if it doesn't exist before updating
- Prevents errors when updating tier information

## Testing

### Manual Testing Steps:
1. Start your development server: `npm run dev`
2. Navigate to: `http://localhost:3003/admin/quotes`
3. Click on any quote with a linked package (📦 icon)
4. Verify the quote details modal displays without errors
5. Check that missing fields show appropriate fallback text

### Automated Testing:
Run the test script to check your quotes data:
```bash
node test-quote-linkedpackage.js
```

This will:
- Fetch all quotes from the API
- Identify quotes with linkedPackage data
- Check for missing or incomplete selectedTier information
- Report any problematic quotes

## Impact
- ✅ Quotes with complete linkedPackage data display normally
- ✅ Quotes with missing selectedTier data now show "Not specified" instead of crashing
- ✅ Quotes with partial data display available information with fallbacks for missing fields
- ✅ No breaking changes to existing functionality

## Related Files Fixed
- `src/components/admin/QuoteManager.tsx` - Quote details modal display
- `src/lib/quote-linker.ts` - Package summary generation
- `src/app/api/admin/quotes/[id]/send-email/route.ts` - Email notification data
- `src/app/api/admin/quotes/[id]/recalculate-price/route.ts` - Price recalculation logic
- `src/models/Quote.ts` - Quote schema definition (linkedPackage structure)
- `test-quote-linkedpackage.js` - Test script to verify the fix

## Prevention
To prevent this issue in the future:
1. Ensure all quote creation flows properly populate `selectedTier` when linking a package
2. Add validation in the API layer to require `selectedTier` when `linkedPackage` is present
3. Consider adding a database migration to fix existing quotes with incomplete data

## Additional Notes
The fix is defensive and handles all edge cases:
- Missing `selectedTier` object
- Missing `tierLabel` within `selectedTier`
- Missing `selectedNights`, `selectedPeriod`
- Invalid `calculatedPrice` (not a number)

All fields now gracefully degrade to user-friendly fallback messages.
