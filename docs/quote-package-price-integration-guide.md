# Quote-Package Price Integration Guide

## Overview

This guide covers the complete price synchronization system between quotes and super offer packages. The system automatically populates and updates quote prices based on package selections while allowing manual overrides when needed.

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [useQuotePrice Hook](#usequoteprice-hook)
3. [PriceSyncIndicator Component](#pricesyncindicator-component)
4. [PackageSelector Integration](#packageselector-integration)
5. [QuoteForm Integration](#quoteform-integration)
6. [Error Handling](#error-handling)
7. [Troubleshooting](#troubleshooting)

---

## Core Concepts

### Price Synchronization States

The system tracks several synchronization states:

- **synced**: Price matches the calculated package price
- **calculating**: Price calculation in progress
- **custom**: User has manually overridden the price
- **out-of-sync**: Parameters changed but price not yet recalculated
- **error**: Price calculation failed

### Price History

Every price change is tracked with:
- **price**: The new price value
- **reason**: Why the price changed (package_selection, recalculation, manual_override)
- **timestamp**: When the change occurred
- **userId**: Who made the change

### Linked Package Data

When a package is linked to a quote, the following data is stored:

```typescript
{
  packageId: string;
  packageName: string;
  packageVersion: number;
  selectedTier: {
    tierIndex: number;
    tierLabel: string;
  };
  selectedNights: number;
  selectedPeriod: string;
  calculatedPrice: number | 'ON_REQUEST';
  priceWasOnRequest: boolean;
  customPriceApplied?: boolean;
  lastRecalculatedAt?: Date;
}
```

---

## useQuotePrice Hook

### Purpose

Manages price synchronization between quote parameters and package pricing.

### Usage

```typescript
import { useQuotePrice } from '@/lib/hooks/useQuotePrice';

const {
  syncStatus,
  priceBreakdown,
  validationWarnings,
  recalculatePrice,
  markAsCustomPrice,
  resetToCalculated,
} = useQuotePrice({
  linkedPackage,
  currentPrice,
  numberOfPeople,
  numberOfNights,
  arrivalDate,
  onPriceUpdate,
});
```

### Parameters

- **linkedPackage**: Current linked package data (optional)
- **currentPrice**: Current quote price
- **numberOfPeople**: Number of people in the quote
- **numberOfNights**: Number of nights
- **arrivalDate**: Arrival date
- **onPriceUpdate**: Callback when price should be updated

### Return Values

- **syncStatus**: Current synchronization state
- **priceBreakdown**: Detailed price calculation breakdown
- **validationWarnings**: Array of validation warnings
- **recalculatePrice**: Function to manually trigger recalculation
- **markAsCustomPrice**: Function to mark current price as custom
- **resetToCalculated**: Function to reset to calculated price

### Automatic Recalculation

The hook automatically recalculates prices when:
- numberOfPeople changes
- numberOfNights changes
- arrivalDate changes

Recalculation is debounced by 500ms to prevent excessive API calls.

### Custom Price Detection

The hook detects when a user manually changes the price:
- Compares current price with calculated price
- Marks price as custom if they differ
- Stops automatic recalculation for custom prices

---

## PriceSyncIndicator Component

### Purpose

Visual indicator showing the current price synchronization status with actions.

### Usage

```typescript
import { PriceSyncIndicator } from '@/components/admin/PriceSyncIndicator';

<PriceSyncIndicator
  status={syncStatus}
  priceBreakdown={priceBreakdown}
  onRecalculate={recalculatePrice}
  onResetToCalculated={resetToCalculated}
  isCustomPrice={linkedPackage?.customPriceApplied}
/>
```

### Props

- **status**: Current sync status ('synced' | 'calculating' | 'custom' | 'out-of-sync' | 'error')
- **priceBreakdown**: Price calculation details (optional)
- **onRecalculate**: Callback for recalculate action (optional)
- **onResetToCalculated**: Callback for reset action (optional)
- **isCustomPrice**: Whether price is manually overridden (optional)
- **error**: Error message if status is 'error' (optional)

### Visual States

#### Synced
- Green checkmark icon
- "Price synced with package"
- Shows price breakdown in tooltip

#### Calculating
- Spinning loader icon
- "Calculating price..."
- No actions available

#### Custom
- Orange edit icon
- "Custom price applied"
- Shows "Reset to Calculated" button

#### Out of Sync
- Yellow warning icon
- "Price may be outdated"
- Shows "Recalculate" button

#### Error
- Red error icon
- Error message
- Shows "Retry" button

---

## PackageSelector Integration

### Enhanced Selection Data

When a package is selected, the PackageSelector returns complete data:

```typescript
{
  packageId: string;
  packageName: string;
  packageVersion: number;
  selectedTier: {
    tierIndex: number;
    tierLabel: string;
  };
  selectedNights: number;
  selectedPeriod: string;
  calculatedPrice: number | 'ON_REQUEST';
  priceWasOnRequest: boolean;
  inclusions: string[];
  accommodationExamples: string[];
  priceCalculation: {
    basePrice: number;
    breakdown: {
      accommodation: number;
      activities: number;
      transfers: number;
    };
  };
}
```

### Handling ON_REQUEST Pricing

When a package returns 'ON_REQUEST':
1. User must manually enter a price
2. System marks price as custom
3. Price history records manual_override reason

---

## QuoteForm Integration

### Package Selection Flow

1. User selects a package from PackageSelector
2. System uses `startTransition` for atomic updates
3. All form fields update simultaneously:
   - numberOfNights
   - totalPrice
   - whatsIncluded
   - activitiesIncluded
   - linkedPackage data
4. Price history is initialized
5. PriceSyncIndicator shows "synced" state

### Parameter Change Flow

1. User changes numberOfPeople, numberOfNights, or arrivalDate
2. useQuotePrice hook detects change (debounced 500ms)
3. System recalculates price automatically
4. PriceSyncIndicator shows "calculating" then "synced"
5. Price history records recalculation

### Manual Price Override Flow

1. User manually changes totalPrice field
2. System detects price differs from calculated
3. useQuotePrice marks price as custom
4. PriceSyncIndicator shows "custom" state
5. Price history records manual_override
6. Automatic recalculation stops

### Package Unlinking Flow

1. User clicks "Unlink Package" button
2. Confirmation dialog appears
3. On confirm:
   - linkedPackage is removed
   - All field values are preserved
   - Automatic recalculation stops
   - PriceSyncIndicator shows "No package linked"

---

## Error Handling

### Package Not Found

**Scenario**: Selected package was deleted

**Recovery**:
1. Show error message
2. Offer to unlink package
3. Preserve all quote data

### Invalid Parameters

**Scenario**: Parameters don't match package options

**Recovery**:
1. Show validation warnings
2. Allow submission with confirmation
3. Mark price as custom if needed

### Network Errors

**Scenario**: API call fails

**Recovery**:
1. Show error message
2. Offer retry button
3. Cache last successful calculation

### Calculation Timeout

**Scenario**: Price calculation takes too long

**Recovery**:
1. Show timeout message
2. Offer manual price entry
3. Mark price as custom

---

## Validation Warnings

### Duration Mismatch

**Trigger**: numberOfNights not in package durationOptions

**Message**: "Selected duration (X nights) is not available for this package. Available: Y, Z nights."

**Action**: Allow submission with warning

### People Count Out of Range

**Trigger**: numberOfPeople outside selected tier range

**Message**: "Number of people (X) is outside the selected tier range (Y-Z). Price may not be accurate."

**Action**: Allow submission with warning

### Date Outside Period

**Trigger**: arrivalDate outside selected pricing period

**Message**: "Arrival date is outside the selected pricing period (Period Name: Start - End)."

**Action**: Allow submission with warning

---

## Troubleshooting

### Price Not Updating Automatically

**Possible Causes**:
- Price is marked as custom
- Package is not linked
- Debounce delay (wait 500ms)

**Solutions**:
1. Check if PriceSyncIndicator shows "custom"
2. Click "Reset to Calculated" if needed
3. Verify package is linked
4. Wait for debounce to complete

### Validation Warnings Appearing

**Possible Causes**:
- Parameters don't match package options
- Date outside pricing period
- People count outside tier range

**Solutions**:
1. Review warning messages
2. Adjust parameters to match package
3. Or proceed with custom pricing

### Price Calculation Fails

**Possible Causes**:
- Package deleted
- Network error
- Invalid parameters

**Solutions**:
1. Check error message
2. Try recalculating
3. Unlink and relink package
4. Enter price manually if needed

### Performance Issues

**Possible Causes**:
- Too many rapid parameter changes
- Cache not working
- Network latency

**Solutions**:
1. Debouncing should handle rapid changes
2. Check React Query cache configuration
3. Monitor network requests
4. Use optimistic updates

---

## Best Practices

### For Developers

1. **Always use startTransition** for non-urgent state updates
2. **Implement proper error boundaries** around price calculations
3. **Cache aggressively** with React Query
4. **Debounce user inputs** to prevent excessive API calls
5. **Log errors** for debugging and monitoring

### For Users

1. **Wait for calculations** to complete before submitting
2. **Review validation warnings** before proceeding
3. **Use recalculate button** if price seems outdated
4. **Document custom prices** in internal notes
5. **Verify price breakdown** in tooltip before sending quotes

---

## API Reference

### POST /api/admin/quotes

Creates a new quote with optional linkedPackage.

**Request Body**:
```json
{
  "enquiryId": "string",
  "totalPrice": number,
  "linkedPackage": {
    "packageId": "string",
    "packageName": "string",
    "calculatedPrice": number | "ON_REQUEST",
    "customPriceApplied": boolean
  },
  "priceHistory": [{
    "price": number,
    "reason": "package_selection" | "recalculation" | "manual_override",
    "userId": "string"
  }]
}
```

### PUT /api/admin/quotes/[id]

Updates an existing quote, automatically managing price history.

**Request Body**: Same as POST, all fields optional

### POST /api/admin/quotes/[id]/recalculate-price

Recalculates price for an existing quote.

**Response**:
```json
{
  "oldPrice": number,
  "newPrice": number,
  "difference": number,
  "percentageChange": string,
  "priceBreakdown": object
}
```

---

## Performance Metrics

### Target Metrics

- **Price calculation**: < 500ms
- **Debounce delay**: 500ms
- **Cache hit rate**: > 80%
- **UI responsiveness**: < 100ms for state updates

### Monitoring

Use the performance monitoring utilities:

```typescript
import { QuotePricePerformance } from '@/lib/performance/quote-price-performance';

// Track calculation time
QuotePricePerformance.trackCalculation(duration);

// Track cache hits
QuotePricePerformance.trackCacheHit(hit);

// Get metrics
const metrics = QuotePricePerformance.getMetrics();
```

---

## Migration Guide

### Existing Quotes

Existing quotes without linkedPackage continue to work normally:
- No migration required
- Can be edited without issues
- Can link packages at any time

### Adding Package to Existing Quote

1. Open quote in edit mode
2. Select package from PackageSelector
3. Review auto-populated fields
4. Adjust if needed
5. Save quote

### Removing Package from Quote

1. Click "Unlink Package"
2. Confirm in dialog
3. All fields preserved
4. Continue editing as normal

---

## Support

For issues or questions:
1. Check this documentation
2. Review error messages
3. Check browser console for errors
4. Contact development team

---

## Changelog

### Version 1.0.0 (Current)
- Initial implementation
- Complete price synchronization
- Validation warnings
- Error handling
- Performance optimizations
