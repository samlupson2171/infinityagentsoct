# Design Document

## Overview

This design addresses the super package price calculation bug where per-person prices are incorrectly divided by the number of people instead of being multiplied. The fix involves updating the pricing calculator to return both per-person and total prices, and updating the UI components to use the correct values.

## Architecture

### Current Flow (Buggy)
```
Database (per-person price) 
  → PricingCalculator.calculatePrice() returns per-person price
  → PackageSelector receives per-person price
  → PackageSelector divides by numberOfPeople (WRONG!)
  → QuoteForm receives incorrect price
```

### Fixed Flow
```
Database (per-person price)
  → PricingCalculator.calculatePrice() calculates total = per-person × numberOfPeople
  → PricingCalculator returns both per-person and total prices
  → PackageSelector displays both values correctly
  → QuoteForm receives correct total price
```

## Components and Interfaces

### 1. PricingCalculator (`src/lib/pricing-calculator.ts`)

**Changes Required:**
- Update `PriceCalculationResult` interface to include both `pricePerPerson` and `totalPrice`
- Modify `calculatePrice()` method to calculate total price
- Add clear documentation that database prices are per-person

**Updated Interface:**
```typescript
export interface PriceCalculationResult {
  pricePerPerson: number | 'ON_REQUEST';  // NEW: Per-person price from database
  totalPrice: number | 'ON_REQUEST';      // NEW: Calculated total (pricePerPerson × numberOfPeople)
  price: number | 'ON_REQUEST';           // DEPRECATED: Keep for backward compatibility, equals totalPrice
  tier: {
    index: number;
    label: string;
    minPeople: number;
    maxPeople: number;
  };
  period: {
    period: string;
    periodType: 'month' | 'special';
    startDate?: Date;
    endDate?: Date;
  };
  nights: number;
  numberOfPeople: number;                 // NEW: Include for clarity
  currency: string;
  packageName: string;
  packageId: string;
  packageVersion: number;
}
```

**Calculation Logic:**
```typescript
// Get per-person price from database
const perPersonPrice = pricePoint.price;  // This is per-person!

// Calculate total price
const totalPrice = perPersonPrice === 'ON_REQUEST' 
  ? 'ON_REQUEST' 
  : perPersonPrice * numberOfPeople;

return {
  pricePerPerson: perPersonPrice,
  totalPrice: totalPrice,
  price: totalPrice,  // For backward compatibility
  numberOfPeople: numberOfPeople,
  // ... other fields
};
```

### 2. PackageSelector Component (`src/components/admin/PackageSelector.tsx`)

**Changes Required:**
- Update `PriceCalculation` interface to match new structure
- Remove incorrect division by numberOfPeople
- Display both per-person and total prices correctly

**Updated Interface:**
```typescript
interface PriceCalculation {
  pricePerPerson: number | 'ON_REQUEST';
  totalPrice: number | 'ON_REQUEST';
  price: number | 'ON_REQUEST';  // Deprecated but kept for compatibility
  tierUsed: string;
  tierIndex: number;
  periodUsed: string;
  currency: string;
  breakdown?: {
    pricePerPerson: number;
    numberOfPeople: number;
    totalPrice: number;
  };
}
```

**Display Logic:**
```typescript
// Map API response correctly
const calculation: PriceCalculation = {
  pricePerPerson: apiResult.pricePerPerson,
  totalPrice: apiResult.totalPrice,
  price: apiResult.totalPrice,  // Use totalPrice
  tierUsed: apiResult.tier.label,
  tierIndex: apiResult.tier.index,
  periodUsed: apiResult.period.period,
  currency: apiResult.currency,
  breakdown: apiResult.totalPrice !== 'ON_REQUEST' ? {
    pricePerPerson: apiResult.pricePerPerson,  // Use from API
    numberOfPeople: apiResult.numberOfPeople,
    totalPrice: apiResult.totalPrice,          // Use from API
  } : undefined,
};
```

### 3. QuoteForm Component (`src/components/admin/QuoteForm.tsx`)

**Changes Required:**
- Update to use `totalPrice` from package selection
- Update `linkedPackageInfo` to store both per-person and total prices
- Ensure price synchronization uses correct values

**Updated Logic:**
```typescript
// When applying package selection
if (selection.priceCalculation.totalPrice !== 'ON_REQUEST') {
  setValue('totalPrice', selection.priceCalculation.totalPrice);  // Use totalPrice
}

// Store linked package info
setLinkedPackageInfo({
  packageId: selection.packageId,
  packageName: selection.packageName,
  packageVersion: selection.packageVersion,
  tierIndex: selection.priceCalculation.tierIndex,
  tierLabel: selection.priceCalculation.tierUsed,
  periodUsed: selection.priceCalculation.periodUsed,
  originalPrice: selection.priceCalculation.totalPrice,  // Store total price
  pricePerPerson: selection.priceCalculation.pricePerPerson,  // NEW: Also store per-person
});
```

### 4. Type Definitions (`src/types/quote-price-sync.ts`)

**Changes Required:**
- Update `PackageSelection` interface to include both price types
- Update `LinkedPackageInfo` interface

**Updated Interfaces:**
```typescript
export interface PackageSelection {
  packageId: string;
  packageName: string;
  packageVersion: number;
  numberOfPeople: number;
  numberOfNights: number;
  arrivalDate: string;
  priceCalculation: {
    pricePerPerson: number | 'ON_REQUEST';  // NEW
    totalPrice: number | 'ON_REQUEST';      // NEW
    price: number | 'ON_REQUEST';           // Deprecated
    tierUsed: string;
    tierIndex: number;
    periodUsed: string;
    currency: string;
    breakdown?: {
      pricePerPerson: number;
      numberOfPeople: number;
      totalPrice: number;
    };
  };
  inclusions: Array<{ text: string; category: string }>;
  accommodationExamples: string[];
}

export interface LinkedPackageInfo {
  packageId: string;
  packageName: string;
  packageVersion: number;
  tierLabel: string;
  tierIndex: number;
  periodUsed: string;
  originalPrice: number | 'ON_REQUEST';      // This is total price
  pricePerPerson?: number | 'ON_REQUEST';    // NEW: Optional for backward compatibility
}
```

## Data Models

No changes required to database models. The `SuperOfferPackage` model already stores per-person prices correctly in the pricing matrix. The issue is purely in the calculation and display logic.

## Error Handling

### Validation Rules

1. **Price Reasonableness Check:**
   - If `totalPrice` is numeric, verify: `totalPrice >= pricePerPerson`
   - If `numberOfPeople > 1`, verify: `totalPrice > pricePerPerson`
   - Log warning if validation fails

2. **ON_REQUEST Handling:**
   - When `pricePerPerson` is 'ON_REQUEST', `totalPrice` must also be 'ON_REQUEST'
   - Display appropriate messaging in UI

3. **Backward Compatibility:**
   - If old code accesses `price` field, it gets `totalPrice`
   - Existing quotes continue to work without migration

### Error Messages

- **Calculation Error:** "Failed to calculate total price: per-person price × number of people"
- **Validation Error:** "Price calculation appears incorrect: total price should be greater than per-person price for multiple people"

## Testing Strategy

### Unit Tests

1. **PricingCalculator Tests:**
   - Test that `totalPrice = pricePerPerson × numberOfPeople`
   - Test with 1 person (total should equal per-person)
   - Test with multiple people (total should be multiple of per-person)
   - Test with 'ON_REQUEST' prices
   - Test that `price` field equals `totalPrice` for backward compatibility

2. **PackageSelector Tests:**
   - Test price breakdown display shows correct values
   - Test that no division by numberOfPeople occurs
   - Test currency formatting for both per-person and total

3. **QuoteForm Tests:**
   - Test that correct total price is applied to quote
   - Test that linkedPackageInfo stores both price types
   - Test price synchronization with new structure

### Integration Tests

1. **End-to-End Price Flow:**
   - Select package with 10 people
   - Verify per-person price is retrieved from database
   - Verify total price = per-person × 10
   - Verify quote form receives correct total
   - Verify quote saves with correct price

2. **Backward Compatibility:**
   - Load existing quote with linked package
   - Verify price recalculation works correctly
   - Verify no data corruption

### Manual Testing Checklist

- [ ] Select package for 1 person - verify total equals per-person
- [ ] Select package for 10 people - verify total is 10× per-person
- [ ] Select package with 'ON_REQUEST' price - verify proper handling
- [ ] Edit existing quote with linked package - verify prices recalculate correctly
- [ ] Change number of people in quote - verify price updates correctly
- [ ] Verify price breakdown display is clear and accurate

## Implementation Notes

### Code Comments

Add clear comments in the code:

```typescript
// IMPORTANT: Prices in the database are PER-PERSON rates
// We must multiply by numberOfPeople to get the total price
const perPersonPrice = pricePoint.price;  // Per-person from database
const totalPrice = perPersonPrice * numberOfPeople;  // Total for group
```

### Migration Strategy

**No database migration required.** This is a pure logic fix:

1. Deploy updated code
2. Existing packages continue to work (data unchanged)
3. Existing quotes recalculate correctly on next edit
4. No downtime required

### Rollback Plan

If issues arise:
1. Revert code changes
2. No data cleanup needed (no database changes)
3. System returns to previous (buggy) behavior

## Performance Considerations

- No performance impact - simple multiplication operation
- No additional database queries
- No changes to caching strategy

## Security Considerations

- No security implications
- Price calculation remains server-side
- No new user inputs or API endpoints
