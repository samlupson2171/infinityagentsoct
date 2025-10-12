# Design Document

## Overview

This design establishes a robust, real-time integration between the super package selection system and the quote pricing mechanism. The solution implements automatic price synchronization, real-time recalculation, and clear visual feedback to ensure pricing accuracy and reduce manual data entry errors.

The design leverages React Query for efficient caching and state management, implements optimistic UI updates for better user experience, and provides comprehensive error handling for edge cases.

## Architecture

### High-Level Flow

```
┌─────────────────┐
│ PackageSelector │
│   Component     │
└────────┬────────┘
         │ 1. User selects package
         │    and parameters
         ▼
┌─────────────────┐
│ Price Calculator│
│   API Call      │
└────────┬────────┘
         │ 2. Calculate price
         │    with full details
         ▼
┌─────────────────┐
│   QuoteForm     │
│   Component     │
└────────┬────────┘
         │ 3. Populate all fields
         │    atomically
         ▼
┌─────────────────┐
│ Price Sync Hook │
│ (useQuotePrice) │
└────────┬────────┘
         │ 4. Monitor changes
         │    and recalculate
         ▼
┌─────────────────┐
│  Visual Sync    │
│   Indicators    │
└─────────────────┘
```

### Component Architecture

```
QuoteForm
├── PackageSelector (Modal)
│   ├── Package List
│   ├── Package Preview
│   ├── Parameter Form
│   └── Price Preview
├── PackageInfoCard
│   ├── Package Details
│   ├── Sync Status Indicator
│   └── Recalculate Button
├── Form Fields
│   ├── Lead Information
│   ├── Trip Details (with watchers)
│   ├── Package Details
│   └── Pricing (with sync indicator)
└── useQuotePrice Hook
    ├── Price Calculation Logic
    ├── Sync State Management
    └── Validation Logic
```

## Components and Interfaces

### 1. Enhanced PackageSelector Component

**Purpose:** Select a package and return complete pricing information

**Key Changes:**
- Return full price calculation result instead of just parameters
- Include breakdown, tier, and period information
- Pass calculated price directly to parent

**Interface:**
```typescript
interface PackageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selection: PackageSelection) => void;
  destinationFilter?: string;
  initialPeople?: number;
  initialNights?: number;
  initialDate?: string;
}

interface PackageSelection {
  // Package identification
  packageId: string;
  packageName: string;
  packageVersion: number;
  
  // Parameters
  numberOfPeople: number;
  numberOfNights: number;
  arrivalDate: string;
  
  // Pricing details (NEW)
  priceCalculation: {
    price: number | 'ON_REQUEST';
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
  
  // Package content
  inclusions: Array<{ text: string; category?: string }>;
  accommodationExamples: string[];
}
```

### 2. New useQuotePrice Hook

**Purpose:** Manage price synchronization and recalculation logic

**Location:** `src/lib/hooks/useQuotePrice.ts`

**Interface:**
```typescript
interface UseQuotePriceOptions {
  linkedPackage: LinkedPackageInfo | null;
  numberOfPeople: number;
  numberOfNights: number;
  arrivalDate: string;
  currentPrice: number;
  onPriceUpdate: (price: number) => void;
  autoRecalculate?: boolean; // Default: true
}

interface UseQuotePriceReturn {
  // State
  syncStatus: 'synced' | 'calculating' | 'custom' | 'error' | 'out-of-sync';
  calculatedPrice: number | 'ON_REQUEST' | null;
  priceBreakdown: PriceBreakdown | null;
  error: string | null;
  
  // Actions
  recalculatePrice: () => Promise<void>;
  markAsCustomPrice: () => void;
  resetToCalculated: () => void;
  
  // Validation
  validationWarnings: string[];
  isParameterValid: boolean;
}

interface LinkedPackageInfo {
  packageId: string;
  packageName: string;
  packageVersion: number;
  tierIndex: number;
  tierLabel: string;
  periodUsed: string;
  originalPrice: number | 'ON_REQUEST';
}

interface PriceBreakdown {
  pricePerPerson: number;
  numberOfPeople: number;
  totalPrice: number;
  tierUsed: string;
  periodUsed: string;
  currency: string;
}
```

**Implementation Details:**
```typescript
export function useQuotePrice(options: UseQuotePriceOptions): UseQuotePriceReturn {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [isCustomPrice, setIsCustomPrice] = useState(false);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  
  // Use React Query for price calculation with caching
  const priceQuery = useSuperPackagePriceCalculation(
    options.linkedPackage && options.autoRecalculate && !isCustomPrice
      ? {
          packageId: options.linkedPackage.packageId,
          numberOfPeople: options.numberOfPeople,
          numberOfNights: options.numberOfNights,
          arrivalDate: options.arrivalDate,
        }
      : null
  );
  
  // Detect parameter changes and trigger recalculation
  useEffect(() => {
    if (!options.linkedPackage || isCustomPrice) return;
    
    // Check if parameters changed
    const parametersChanged = 
      options.numberOfPeople !== priceQuery.data?.breakdown?.numberOfPeople ||
      options.numberOfNights !== priceQuery.data?.nights;
    
    if (parametersChanged && options.autoRecalculate) {
      setSyncStatus('calculating');
    }
  }, [options.numberOfPeople, options.numberOfNights, options.arrivalDate]);
  
  // Update price when calculation completes
  useEffect(() => {
    if (priceQuery.data && !isCustomPrice) {
      if (priceQuery.data.price !== 'ON_REQUEST') {
        options.onPriceUpdate(priceQuery.data.price);
        setSyncStatus('synced');
      } else {
        setSyncStatus('custom');
      }
    }
  }, [priceQuery.data]);
  
  // Detect manual price changes
  useEffect(() => {
    if (priceQuery.data?.price !== 'ON_REQUEST' && 
        options.currentPrice !== priceQuery.data?.price) {
      setIsCustomPrice(true);
      setSyncStatus('custom');
    }
  }, [options.currentPrice]);
  
  // Validate parameters against package
  useEffect(() => {
    if (!options.linkedPackage) return;
    
    const warnings: string[] = [];
    
    // Validate duration
    // Validate people count
    // Validate date range
    
    setValidationWarnings(warnings);
  }, [options.numberOfPeople, options.numberOfNights, options.arrivalDate]);
  
  return {
    syncStatus: priceQuery.isLoading ? 'calculating' : 
                priceQuery.isError ? 'error' : 
                syncStatus,
    calculatedPrice: priceQuery.data?.price ?? null,
    priceBreakdown: priceQuery.data?.breakdown ?? null,
    error: priceQuery.error?.message ?? null,
    recalculatePrice: async () => {
      setIsCustomPrice(false);
      await priceQuery.refetch();
    },
    markAsCustomPrice: () => setIsCustomPrice(true),
    resetToCalculated: () => {
      setIsCustomPrice(false);
      if (priceQuery.data?.price !== 'ON_REQUEST') {
        options.onPriceUpdate(priceQuery.data.price);
      }
    },
    validationWarnings,
    isParameterValid: validationWarnings.length === 0,
  };
}
```

### 3. PriceSyncIndicator Component

**Purpose:** Visual feedback for price synchronization status

**Location:** `src/components/admin/PriceSyncIndicator.tsx`

**Interface:**
```typescript
interface PriceSyncIndicatorProps {
  status: 'synced' | 'calculating' | 'custom' | 'error' | 'out-of-sync';
  priceBreakdown?: PriceBreakdown;
  error?: string;
  onRecalculate?: () => void;
  onResetToCalculated?: () => void;
}
```

**Visual States:**
- **Synced:** Green checkmark icon, "Price synced with package"
- **Calculating:** Blue spinner icon, "Calculating price..."
- **Custom:** Orange edit icon, "Custom price (not synced)"
- **Error:** Red warning icon, error message
- **Out of Sync:** Yellow warning icon, "Parameters changed, recalculate?"

### 4. Enhanced QuoteForm Component

**Key Changes:**

1. **Atomic State Updates:**
```typescript
const handlePackageSelect = (selection: PackageSelection) => {
  // Update all fields atomically using batch updates
  startTransition(() => {
    setValue('numberOfPeople', selection.numberOfPeople);
    setValue('numberOfNights', selection.numberOfNights);
    setValue('arrivalDate', selection.arrivalDate);
    setValue('currency', selection.priceCalculation.currency);
    
    // Set price immediately if available
    if (selection.priceCalculation.price !== 'ON_REQUEST') {
      setValue('totalPrice', selection.priceCalculation.price);
    }
    
    // Build inclusions text
    const inclusionsText = selection.inclusions
      .map(inc => `• ${inc.text}`)
      .join('\n');
    setValue('whatsIncluded', inclusionsText);
    
    // Store linked package info
    setLinkedPackageInfo({
      packageId: selection.packageId,
      packageName: selection.packageName,
      packageVersion: selection.packageVersion,
      tierIndex: selection.priceCalculation.tierIndex,
      tierLabel: selection.priceCalculation.tierUsed,
      periodUsed: selection.priceCalculation.periodUsed,
      originalPrice: selection.priceCalculation.price,
    });
    
    setValue('isSuperPackage', true);
  });
};
```

2. **Price Sync Integration:**
```typescript
const {
  syncStatus,
  calculatedPrice,
  priceBreakdown,
  error: priceError,
  recalculatePrice,
  markAsCustomPrice,
  resetToCalculated,
  validationWarnings: priceWarnings,
} = useQuotePrice({
  linkedPackage: linkedPackageInfo,
  numberOfPeople: watch('numberOfPeople'),
  numberOfNights: watch('numberOfNights'),
  arrivalDate: watch('arrivalDate'),
  currentPrice: watch('totalPrice'),
  onPriceUpdate: (price) => setValue('totalPrice', price),
  autoRecalculate: true,
});
```

3. **Manual Price Override Detection:**
```typescript
const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const newPrice = parseFloat(e.target.value);
  setValue('totalPrice', newPrice);
  
  // Mark as custom if different from calculated
  if (calculatedPrice !== 'ON_REQUEST' && newPrice !== calculatedPrice) {
    markAsCustomPrice();
  }
};
```

## Data Models

### Enhanced Quote Model

**Location:** `src/models/Quote.ts`

**New Fields:**
```typescript
interface IQuote {
  // ... existing fields ...
  
  linkedPackage?: {
    packageId: ObjectId;
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
    customPriceApplied: boolean; // NEW: Track if price was manually overridden
    lastRecalculatedAt?: Date; // NEW: Track when price was last recalculated
  };
  
  priceHistory?: Array<{ // NEW: Track price changes
    price: number;
    reason: 'package_selection' | 'recalculation' | 'manual_override';
    timestamp: Date;
    userId: ObjectId;
  }>;
}
```

### Price Calculation Cache

**Purpose:** Cache price calculations to reduce API calls

**Implementation:** Use React Query's built-in caching with the existing `useSuperPackagePriceCalculation` hook

**Cache Key Structure:**
```typescript
['price-calculations', {
  packageId: string,
  numberOfPeople: number,
  numberOfNights: number,
  arrivalDate: string,
}]
```

**Cache Configuration:**
- Stale Time: 10 minutes (prices don't change frequently)
- Cache Time: 30 minutes
- Refetch on Window Focus: false
- Refetch on Mount: false (use cached data)

## Error Handling

### Error Types and Responses

1. **Package Not Found:**
   - Display: "Selected package no longer exists"
   - Action: Offer to unlink package or select different one

2. **Invalid Parameters:**
   - Display: Specific validation message (e.g., "8 nights not available for this package")
   - Action: Show valid options, allow override with confirmation

3. **Network Errors:**
   - Display: "Unable to calculate price. Check your connection."
   - Action: Retry button, allow manual price entry

4. **Calculation Timeout:**
   - Display: "Price calculation is taking longer than expected"
   - Action: Continue waiting or enter manual price

5. **Price Changed:**
   - Display: "Package pricing has been updated. Old: £X, New: £Y"
   - Action: Accept new price or keep current

### Error Recovery Strategies

```typescript
const handleCalculationError = (error: Error) => {
  if (error.message.includes('not found')) {
    // Package deleted
    showConfirmDialog({
      title: 'Package No Longer Available',
      message: 'The linked package has been deleted. Would you like to unlink it?',
      onConfirm: handleUnlinkPackage,
    });
  } else if (error.message.includes('not available')) {
    // Invalid parameters
    showWarning({
      message: error.message,
      actions: [
        { label: 'Adjust Parameters', onClick: () => {} },
        { label: 'Use Custom Price', onClick: markAsCustomPrice },
      ],
    });
  } else {
    // Generic error
    showError({
      message: 'Failed to calculate price',
      actions: [
        { label: 'Retry', onClick: recalculatePrice },
        { label: 'Enter Manual Price', onClick: markAsCustomPrice },
      ],
    });
  }
};
```

## Testing Strategy

### Unit Tests

1. **useQuotePrice Hook Tests:**
   - Test price synchronization on parameter changes
   - Test custom price detection
   - Test validation warnings
   - Test error handling
   - Test recalculation logic

2. **PriceSyncIndicator Tests:**
   - Test all visual states render correctly
   - Test tooltip content
   - Test action buttons

3. **PackageSelector Tests:**
   - Test price calculation integration
   - Test data structure returned on selection
   - Test error states

### Integration Tests

1. **Quote Creation Flow:**
   - Select package → verify all fields populated
   - Verify price matches calculation
   - Change parameters → verify price recalculates
   - Manual price override → verify sync status changes

2. **Quote Editing Flow:**
   - Load quote with linked package
   - Verify price sync status on load
   - Recalculate price → verify update
   - Unlink package → verify fields preserved

3. **Error Scenarios:**
   - Package deleted → verify error handling
   - Invalid parameters → verify warnings
   - Network failure → verify fallback behavior

### E2E Tests

1. **Complete Quote Creation:**
   ```typescript
   test('Create quote with package selection', async () => {
     // Navigate to quote creation
     // Click "Select Super Package"
     // Select a package
     // Enter parameters
     // Verify price calculated
     // Verify all fields populated
     // Submit quote
     // Verify quote saved with linked package
   });
   ```

2. **Price Recalculation:**
   ```typescript
   test('Recalculate price on parameter change', async () => {
     // Create quote with package
     // Change number of people
     // Verify price recalculates
     // Verify sync indicator updates
   });
   ```

3. **Custom Price Override:**
   ```typescript
   test('Override calculated price', async () => {
     // Create quote with package
     // Manually change price
     // Verify custom price indicator
     // Verify no auto-recalculation
   });
   ```

## Performance Considerations

### Optimization Strategies

1. **Debounced Recalculation:**
   - Debounce parameter changes by 500ms before triggering recalculation
   - Prevents excessive API calls during rapid input

2. **React Query Caching:**
   - Cache price calculations for 10 minutes
   - Reuse cached results for identical parameters
   - Reduces API load significantly

3. **Optimistic UI Updates:**
   - Show "calculating" state immediately
   - Update UI optimistically before API response
   - Rollback on error

4. **Batch State Updates:**
   - Use `startTransition` for non-urgent updates
   - Batch multiple field updates together
   - Prevents multiple re-renders

### Performance Metrics

- Price calculation API response: < 200ms (target)
- UI update after parameter change: < 100ms
- Package selection to form population: < 300ms
- Cache hit rate: > 70% (target)

## Security Considerations

1. **Authorization:**
   - All price calculation endpoints require admin authentication
   - Rate limiting on calculation endpoint (10 requests/minute per user)

2. **Input Validation:**
   - Validate all parameters server-side using Zod schemas
   - Sanitize date inputs to prevent injection
   - Validate number ranges

3. **Price Integrity:**
   - Log all price changes with user ID and reason
   - Track price history for audit trail
   - Prevent price manipulation through client-side changes

4. **Package Version Tracking:**
   - Store package version with quote
   - Detect if package pricing changed since quote creation
   - Alert user when recalculating with updated pricing

## Migration Strategy

### Phase 1: Add New Fields (Non-Breaking)
- Add new fields to Quote model with optional flags
- Deploy backend changes
- Existing quotes continue to work

### Phase 2: Update Components
- Deploy new PackageSelector with enhanced return data
- Deploy useQuotePrice hook
- Deploy PriceSyncIndicator component
- Update QuoteForm to use new integration

### Phase 3: Data Migration (Optional)
- Script to add `customPriceApplied: false` to existing quotes with linked packages
- Script to populate `priceHistory` for existing quotes

### Rollback Plan
- All new fields are optional
- Old quote creation flow still works
- Can disable new features via feature flag
- No data loss on rollback

## Future Enhancements

1. **Bulk Price Recalculation:**
   - Admin tool to recalculate prices for multiple quotes
   - Filter quotes by package, date range, status
   - Preview changes before applying

2. **Price Change Notifications:**
   - Notify admins when package pricing changes
   - Show list of affected quotes
   - One-click recalculation

3. **Price Comparison:**
   - Show price comparison when recalculating
   - Highlight differences
   - Explain why price changed (tier, period, etc.)

4. **Smart Suggestions:**
   - Suggest alternative dates for better pricing
   - Suggest adjusting group size to different tier
   - Show price trends

5. **Price Locking:**
   - Lock price to prevent auto-recalculation
   - Useful for confirmed quotes
   - Require explicit unlock to recalculate
