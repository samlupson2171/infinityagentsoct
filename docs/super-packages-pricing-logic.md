# Super Offer Packages - Pricing Calculation Logic

## Overview

This document explains the pricing calculation logic used in the Super Offer Packages system. Understanding this logic is essential for creating accurate packages and troubleshooting pricing issues.

## Pricing Matrix Structure

The pricing matrix is a three-dimensional structure:

1. **Time Periods** (rows): Months or special date ranges
2. **Group Size Tiers** (column groups): Different group size categories
3. **Duration Options** (columns): Number of nights

### Example Matrix

```
Period          | 6-11 People        | 12+ People
                | 2N   3N   4N       | 2N   3N   4N
----------------|--------------------|-----------------
January         | €450 €550 €650     | €400 €500 €600
February        | €480 €580 €680     | €430 €530 €630
Easter (dates)  | ON REQUEST         | ON REQUEST
```

## Calculation Steps

### Step 1: Determine Group Size Tier

**Input**: Number of people in the group

**Process**:
1. Iterate through defined group size tiers
2. Check if number of people falls within tier's min/max range
3. Return matching tier index and details

**Example**:

```typescript
// Tiers defined as:
// Tier 0: 6-11 People (min: 6, max: 11)
// Tier 1: 12+ People (min: 12, max: 999)

numberOfPeople = 8
// Result: Tier 0 (6-11 People)

numberOfPeople = 15
// Result: Tier 1 (12+ People)

numberOfPeople = 4
// Result: ERROR - No matching tier
```

**Edge Cases**:

- **Below minimum**: If number of people is less than smallest tier's minimum, calculation fails
- **Above maximum**: If number of people exceeds largest tier's maximum, use largest tier
- **Overlapping tiers**: First matching tier is used (tiers should not overlap)

### Step 2: Validate Duration

**Input**: Number of nights

**Process**:
1. Check if requested nights exists in duration options
2. Return duration if valid

**Example**:

```typescript
// Duration options: [2, 3, 4]

numberOfNights = 3
// Result: Valid (3 exists in options)

numberOfNights = 5
// Result: ERROR - Duration not available
```

**Edge Cases**:

- **Not in options**: If requested duration doesn't exist, calculation fails
- **Zero or negative**: Invalid input, calculation fails

### Step 3: Determine Pricing Period

**Input**: Arrival date

**Process**:
1. Check for special periods first (date range matches)
2. If no special period matches, use month of arrival date
3. Return matching period entry

**Example**:

```typescript
// Periods defined:
// - January (month)
// - February (month)
// - Easter: 02/04/2025 - 06/04/2025 (special)

arrivalDate = "2025-01-15"
// Result: January (month period)

arrivalDate = "2025-04-03"
// Result: Easter (special period - date falls within range)

arrivalDate = "2025-04-10"
// Result: April (month period - after Easter range)
```

**Period Matching Logic**:

```typescript
function determinePeriod(arrivalDate, pricingMatrix) {
  const date = new Date(arrivalDate);
  
  // 1. Check special periods first
  for (const entry of pricingMatrix) {
    if (entry.periodType === 'special') {
      if (date >= entry.startDate && date <= entry.endDate) {
        return entry; // Special period takes precedence
      }
    }
  }
  
  // 2. Fall back to month
  const monthName = date.toLocaleString('en-US', { month: 'long' });
  const monthEntry = pricingMatrix.find(
    entry => entry.periodType === 'month' && entry.period === monthName
  );
  
  if (monthEntry) {
    return monthEntry;
  }
  
  // 3. No matching period found
  throw new Error('No pricing period found for date');
}
```

**Edge Cases**:

- **Overlapping special periods**: First matching period is used
- **Missing month**: If month not in matrix, calculation fails
- **Date spans multiple periods**: Use period of arrival date only
- **Invalid date**: Calculation fails

### Step 4: Lookup Price

**Input**: 
- Tier index (from Step 1)
- Number of nights (from Step 2)
- Period entry (from Step 3)

**Process**:
1. Find price point in period's prices array
2. Match by tier index and nights
3. Return price value

**Example**:

```typescript
// Period: January
// Prices: [
//   { groupSizeTierIndex: 0, nights: 2, price: 450 },
//   { groupSizeTierIndex: 0, nights: 3, price: 550 },
//   { groupSizeTierIndex: 1, nights: 2, price: 400 },
//   ...
// ]

tierIndex = 0
nights = 3
// Result: 550

tierIndex = 1
nights = 2
// Result: 400
```

**Lookup Logic**:

```typescript
function lookupPrice(periodEntry, tierIndex, nights) {
  const pricePoint = periodEntry.prices.find(
    p => p.groupSizeTierIndex === tierIndex && p.nights === nights
  );
  
  if (!pricePoint) {
    throw new Error('No price found for combination');
  }
  
  return pricePoint.price; // Can be number or "ON_REQUEST"
}
```

**Edge Cases**:

- **Missing price point**: If combination not in matrix, calculation fails
- **ON_REQUEST**: Special value indicating manual pricing needed
- **Zero price**: Valid (e.g., complimentary packages)

### Step 5: Calculate Total

**Input**:
- Price per person (from Step 4)
- Number of people (original input)

**Process**:
1. If price is "ON_REQUEST", return special response
2. Otherwise, multiply price per person by number of people
3. Return total price and breakdown

**Example**:

```typescript
// Numeric price
pricePerPerson = 550
numberOfPeople = 8
totalPrice = 550 × 8 = 4400

// ON REQUEST
pricePerPerson = "ON_REQUEST"
// Result: Special response, manual entry required
```

**Calculation Logic**:

```typescript
function calculateTotal(pricePerPerson, numberOfPeople) {
  if (pricePerPerson === 'ON_REQUEST') {
    return {
      isOnRequest: true,
      message: 'Price is on request for this combination'
    };
  }
  
  const totalPrice = pricePerPerson * numberOfPeople;
  
  return {
    pricePerPerson,
    numberOfPeople,
    totalPrice,
    isOnRequest: false
  };
}
```

## Complete Calculation Flow

```typescript
async function calculatePrice(
  packageId: string,
  numberOfPeople: number,
  numberOfNights: number,
  arrivalDate: string
): Promise<PriceCalculation> {
  // 1. Fetch package
  const package = await SuperOfferPackage.findById(packageId);
  if (!package) {
    throw new Error('Package not found');
  }
  
  // 2. Determine tier
  const tier = determineTier(numberOfPeople, package.groupSizeTiers);
  if (!tier) {
    throw new Error(`No tier found for ${numberOfPeople} people`);
  }
  
  // 3. Validate duration
  if (!package.durationOptions.includes(numberOfNights)) {
    throw new Error(`Duration ${numberOfNights} nights not available`);
  }
  
  // 4. Determine period
  const period = determinePeriod(arrivalDate, package.pricingMatrix);
  if (!period) {
    throw new Error(`No pricing period found for ${arrivalDate}`);
  }
  
  // 5. Lookup price
  const pricePerPerson = lookupPrice(period, tier.index, numberOfNights);
  
  // 6. Calculate total
  const result = calculateTotal(pricePerPerson, numberOfPeople);
  
  return {
    ...result,
    tierUsed: tier,
    periodUsed: period,
    breakdown: {
      pricePerPerson,
      numberOfPeople,
      numberOfNights,
      totalPrice: result.totalPrice
    }
  };
}
```

## Special Cases

### ON REQUEST Pricing

When a price is marked as "ON REQUEST":

1. Calculation completes successfully
2. Returns `isOnRequest: true`
3. No numeric price provided
4. Admin must manually enter price in quote

**Use Cases**:
- Highly variable pricing (e.g., peak holidays)
- Custom packages requiring negotiation
- Pricing dependent on specific requirements

### Multi-Night Stays Spanning Periods

**Scenario**: Guest arrives in one period, stays through another

**Solution**: Use arrival date period only

**Example**:
- Arrival: March 30 (March pricing)
- Departure: April 3 (spans into April)
- **Use**: March pricing

**Rationale**: Simplifies calculation, consistent with booking practices

### Group Size at Tier Boundary

**Scenario**: Group size exactly at tier boundary

**Example**:
- Tier 1: 6-11 People
- Tier 2: 12+ People
- Group size: 11 people

**Solution**: Use Tier 1 (11 is within 6-11 range)

**Rationale**: Inclusive ranges, first matching tier used

### Missing Pricing Data

**Scenario**: Combination exists in structure but price not set

**Solution**: Calculation fails with clear error

**Prevention**: Validate pricing matrix completeness on package creation

## Validation Rules

### Package Creation Validation

When creating/updating a package, validate:

1. **Tier Coverage**:
   - No gaps in group size ranges
   - No overlapping ranges
   - At least one tier defined

2. **Duration Options**:
   - At least one duration
   - All durations positive integers
   - No duplicate durations

3. **Pricing Matrix Completeness**:
   - All periods have prices for all tier × duration combinations
   - Each price is either numeric or "ON_REQUEST"
   - No missing price points

4. **Period Definitions**:
   - All 12 months present (or explicitly excluded)
   - Special periods have valid date ranges
   - No overlapping special periods
   - Special period dates in future (optional warning)

### Calculation Input Validation

Before calculation, validate:

1. **Number of People**:
   - Positive integer
   - Within at least one tier's range

2. **Number of Nights**:
   - Positive integer
   - Exists in duration options

3. **Arrival Date**:
   - Valid date format
   - Not in the past (optional warning)
   - Falls within a defined period

## Performance Considerations

### Caching

Cache frequently accessed packages:

```typescript
// Cache package data for 10 minutes
const cachedPackage = await cache.get(`package:${packageId}`);
if (cachedPackage) {
  return cachedPackage;
}

const package = await SuperOfferPackage.findById(packageId);
await cache.set(`package:${packageId}`, package, 600);
```

### Indexing

Ensure database indexes for fast lookups:

```javascript
// Index on package ID for quick retrieval
db.super_offer_packages.createIndex({ _id: 1 });

// Index on status for filtering active packages
db.super_offer_packages.createIndex({ status: 1 });
```

### Calculation Optimization

Pre-compute price ranges for display:

```typescript
function calculatePriceRange(package) {
  const prices = package.pricingMatrix
    .flatMap(period => period.prices)
    .map(p => p.price)
    .filter(p => typeof p === 'number');
  
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
}
```

## Error Handling

### Error Types

1. **Validation Errors**: Invalid input parameters
2. **Not Found Errors**: No matching tier, period, or price
3. **Data Errors**: Incomplete or invalid package data
4. **System Errors**: Database or server issues

### Error Messages

Provide clear, actionable error messages:

```typescript
// Good
throw new Error('No pricing tier found for 4 people. Minimum group size is 6.');

// Bad
throw new Error('Invalid tier');
```

### Error Recovery

For non-critical errors, provide fallbacks:

```typescript
// If special period not found, fall back to month
try {
  period = findSpecialPeriod(date);
} catch (error) {
  period = findMonthPeriod(date);
}
```

## Testing Strategies

### Unit Tests

Test each calculation step independently:

```typescript
describe('determineTier', () => {
  it('should return correct tier for group size', () => {
    const tiers = [
      { label: '6-11 People', minPeople: 6, maxPeople: 11 },
      { label: '12+ People', minPeople: 12, maxPeople: 999 }
    ];
    
    const result = determineTier(8, tiers);
    expect(result.index).toBe(0);
    expect(result.tier.label).toBe('6-11 People');
  });
  
  it('should throw error for group size below minimum', () => {
    const tiers = [{ label: '6-11 People', minPeople: 6, maxPeople: 11 }];
    
    expect(() => determineTier(4, tiers)).toThrow();
  });
});
```

### Integration Tests

Test complete calculation flow:

```typescript
describe('calculatePrice', () => {
  it('should calculate correct price for valid inputs', async () => {
    const result = await calculatePrice(
      packageId,
      8,  // people
      3,  // nights
      '2025-07-15'  // arrival
    );
    
    expect(result.totalPrice).toBe(4400);
    expect(result.pricePerPerson).toBe(550);
    expect(result.tierUsed.label).toBe('6-11 People');
  });
});
```

### Edge Case Tests

Test boundary conditions:

```typescript
describe('edge cases', () => {
  it('should handle group size at tier boundary', () => {
    // Test with 11 people (upper bound of first tier)
  });
  
  it('should handle arrival date on special period boundary', () => {
    // Test with date exactly on period start/end
  });
  
  it('should handle ON_REQUEST pricing', () => {
    // Test calculation with ON_REQUEST price
  });
});
```

## Debugging Tips

### Common Issues

1. **"No tier found"**:
   - Check group size against tier definitions
   - Verify tiers cover expected range
   - Check for gaps in tier ranges

2. **"No period found"**:
   - Verify arrival date format
   - Check if date falls in special period
   - Ensure month exists in pricing matrix

3. **"No price found"**:
   - Verify pricing matrix completeness
   - Check tier index and nights combination
   - Look for missing price points

### Debugging Tools

Enable detailed logging:

```typescript
function calculatePrice(...args) {
  console.log('Calculation inputs:', args);
  
  const tier = determineTier(...);
  console.log('Determined tier:', tier);
  
  const period = determinePeriod(...);
  console.log('Determined period:', period);
  
  // ... continue with logging
}
```

Use the standalone price calculator for testing:

1. Navigate to Price Calculator page
2. Select package
3. Enter test parameters
4. View detailed breakdown

## Best Practices

1. **Always validate inputs** before calculation
2. **Provide clear error messages** for troubleshooting
3. **Cache package data** for performance
4. **Log calculations** for audit trail
5. **Test edge cases** thoroughly
6. **Document special pricing rules** in sales notes
7. **Keep pricing matrix complete** - no missing cells
8. **Use ON_REQUEST sparingly** - prefer numeric prices
9. **Review calculations** before applying to quotes
10. **Monitor calculation errors** for data quality issues

## Future Enhancements

Potential improvements to pricing logic:

1. **Dynamic pricing**: Adjust based on demand, availability
2. **Promotional pricing**: Support discount codes, special offers
3. **Multi-currency**: Real-time currency conversion
4. **Seasonal adjustments**: Automatic price updates by season
5. **Group discounts**: Progressive discounts for larger groups
6. **Early booking discounts**: Price reductions for advance bookings
7. **Last-minute deals**: Reduced prices for near-term dates
8. **Package combinations**: Pricing for multiple packages
