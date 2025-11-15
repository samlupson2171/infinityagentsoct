# Total Price Calculation Fix

## Issue
The total price was displaying incorrectly: "€ 1,470.00€ 1,470.00 + € 1,030.00"

This showed that:
- Total Price: €1,470.00 (incorrect - should be €2,500.00)
- Breakdown: €1,470.00 + €1,030.00 (correct components)

## Root Cause
The `useEffect` that updates `totalPrice` was missing `totalPrice` in its dependency array. This meant the comparison `Math.abs(totalPrice - newTotal) > 0.01` was using a stale value of `totalPrice`, preventing the update from happening correctly.

## Fix Applied
Added `totalPrice` to the dependency array:

```typescript
useEffect(() => {
  if (syncStatus !== 'custom' && basePrice > 0) {
    const newTotal = basePrice + eventsTotal;
    if (Math.abs(totalPrice - newTotal) > 0.01) {
      setValue('totalPrice', newTotal);
    }
  }
}, [basePrice, eventsTotal, syncStatus, setValue, totalPrice]); // Added totalPrice
```

## Expected Behavior After Fix

### Example Quote:
- Base Package Price: €1,470.00
- Event 1 (per person): €50 × 10 = €500
- Event 2 (flat rate): €530
- **Events Total**: €1,030.00
- **Total Price**: €2,500.00 ✅

### Display in PriceBreakdown:
```
Package Price: €1,470.00
Events & Activities (2): €1,030.00
  - Event 1: €500 (€50 × 10 people)
  - Event 2: €530
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Price: €2,500.00
€1,470.00 + €1,030.00
```

## Testing Steps

1. Create a new quote or edit existing quote
2. Select a package (sets basePrice)
3. Add events (sets eventsTotal)
4. Verify Total Price = basePrice + eventsTotal
5. Check PriceBreakdown shows correct calculation
6. Change numberOfPeople for per-person events
7. Verify total recalculates correctly

## Files Modified
- `src/components/admin/QuoteForm.tsx` - Added totalPrice to useEffect dependency array
