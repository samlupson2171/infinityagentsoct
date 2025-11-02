# Task 3: Visual Comparison - Before vs After

## Package Selection Handler

### BEFORE (Incorrect)
```typescript
// Set price if calculated (not ON_REQUEST)
if (selection.priceCalculation.price !== 'ON_REQUEST') {
  setValue('totalPrice', selection.priceCalculation.price);
}

// Store linked package info for price synchronization
setLinkedPackageInfo({
  packageId: selection.packageId,
  packageName: selection.packageName,
  packageVersion: selection.packageVersion,
  tierIndex: selection.priceCalculation.tierIndex,
  tierLabel: selection.priceCalculation.tierUsed,
  periodUsed: selection.priceCalculation.periodUsed,
  originalPrice: selection.priceCalculation.price, // ❌ Using deprecated field
});
```

### AFTER (Correct)
```typescript
// IMPORTANT: Use totalPrice from calculation (not price field)
// The totalPrice is already calculated as pricePerPerson × numberOfPeople
if (selection.priceCalculation.totalPrice !== 'ON_REQUEST') {
  setValue('totalPrice', selection.priceCalculation.totalPrice); // ✅ Using totalPrice
}

// Store linked package info for price synchronization
// Store both pricePerPerson and originalPrice (total) for proper tracking
setLinkedPackageInfo({
  packageId: selection.packageId,
  packageName: selection.packageName,
  packageVersion: selection.packageVersion,
  tierIndex: selection.priceCalculation.tierIndex,
  tierLabel: selection.priceCalculation.tierUsed,
  periodUsed: selection.priceCalculation.periodUsed,
  originalPrice: selection.priceCalculation.totalPrice, // ✅ Store total price
  pricePerPerson: selection.priceCalculation.pricePerPerson, // ✅ Store per-person price
});
```

## Type Definitions

### LinkedPackageInfo Interface

#### BEFORE
```typescript
export interface LinkedPackageInfo {
  packageId: string;
  packageName: string;
  packageVersion: number;
  tierIndex: number;
  tierLabel: string;
  periodUsed: string;
  originalPrice: number | 'ON_REQUEST'; // ❌ No clarity on what this represents
}
```

#### AFTER
```typescript
export interface LinkedPackageInfo {
  packageId: string;
  packageName: string;
  packageVersion: number;
  tierIndex: number;
  tierLabel: string;
  periodUsed: string;
  originalPrice: number | 'ON_REQUEST'; // ✅ Total price for the group
  pricePerPerson?: number | 'ON_REQUEST'; // ✅ Optional: Per-person price
}
```

### PackageSelection Interface

#### BEFORE
```typescript
priceCalculation: {
  price: number | 'ON_REQUEST'; // ❌ Ambiguous - is this per-person or total?
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

#### AFTER
```typescript
priceCalculation: {
  pricePerPerson: number | 'ON_REQUEST'; // ✅ Clear: Per-person price from database
  totalPrice: number | 'ON_REQUEST'; // ✅ Clear: Total price (pricePerPerson × numberOfPeople)
  price: number | 'ON_REQUEST'; // ✅ Deprecated: kept for backward compatibility, equals totalPrice
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

## Form Submission

### BEFORE
```typescript
linkedPackage: {
  packageId: linkedPackageInfo.packageId,
  packageName: linkedPackageInfo.packageName,
  packageVersion: linkedPackageInfo.packageVersion,
  selectedTier: {
    tierIndex: linkedPackageInfo.tierIndex,
    tierLabel: linkedPackageInfo.tierLabel,
  },
  selectedNights: data.numberOfNights,
  selectedPeriod: linkedPackageInfo.periodUsed,
  calculatedPrice: typeof linkedPackageInfo.originalPrice === 'number' 
    ? linkedPackageInfo.originalPrice 
    : data.totalPrice,
  priceWasOnRequest: linkedPackageInfo.originalPrice === 'ON_REQUEST',
  // ❌ Missing pricePerPerson
}
```

### AFTER
```typescript
linkedPackage: {
  packageId: linkedPackageInfo.packageId,
  packageName: linkedPackageInfo.packageName,
  packageVersion: linkedPackageInfo.packageVersion,
  selectedTier: {
    tierIndex: linkedPackageInfo.tierIndex,
    tierLabel: linkedPackageInfo.tierLabel,
  },
  selectedNights: data.numberOfNights,
  selectedPeriod: linkedPackageInfo.periodUsed,
  calculatedPrice: typeof linkedPackageInfo.originalPrice === 'number' 
    ? linkedPackageInfo.originalPrice 
    : data.totalPrice, // ✅ Total price
  pricePerPerson: linkedPackageInfo.pricePerPerson, // ✅ Include per-person price
  priceWasOnRequest: linkedPackageInfo.originalPrice === 'ON_REQUEST',
}
```

## Example Data Flow

### Scenario: 10 people, £100 per person

#### BEFORE (Buggy)
```
Database: £100 per person
↓
PricingCalculator returns: price = £100 (per person)
↓
PackageSelector: Uses price = £100
↓
QuoteForm receives: totalPrice = £100 ❌ WRONG!
↓
Quote saved with: £100 for 10 people ❌ WRONG!
```

#### AFTER (Fixed)
```
Database: £100 per person
↓
PricingCalculator calculates:
  - pricePerPerson = £100
  - totalPrice = £100 × 10 = £1000
↓
PackageSelector: Uses totalPrice = £1000
↓
QuoteForm receives: totalPrice = £1000 ✅ CORRECT!
↓
Quote saved with:
  - totalPrice = £1000 ✅
  - pricePerPerson = £100 ✅
```

## Key Improvements

1. **Clarity**: Explicit `pricePerPerson` and `totalPrice` fields remove ambiguity
2. **Correctness**: QuoteForm now uses the correct total price
3. **Transparency**: Both per-person and total prices are tracked
4. **Backward Compatibility**: Old `price` field maintained, `pricePerPerson` is optional
5. **Documentation**: Clear comments explain the price structure

## Impact on User Experience

### Before
- Agent selects package for 10 people at £100/person
- Quote shows £100 total ❌
- Agent confused, has to manually calculate and enter £1000

### After
- Agent selects package for 10 people at £100/person
- Quote shows £1000 total ✅
- Price breakdown shows: "£100 per person × 10 people = £1000"
- Agent can proceed with confidence
