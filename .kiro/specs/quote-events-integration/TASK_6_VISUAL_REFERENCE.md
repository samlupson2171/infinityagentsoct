# Task 6: Price Calculation with Events - Visual Reference

## Price Calculation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRICE CALCULATION FLOW                       │
└─────────────────────────────────────────────────────────────────┘

1. Package Selected
   ↓
   basePrice = packagePrice (e.g., £500)
   
2. Events Selected
   ↓
   eventsTotal = sum of matching currency events (e.g., £150)
   
3. Automatic Calculation
   ↓
   totalPrice = basePrice + eventsTotal (£500 + £150 = £650)
   
4. Display to User
   ↓
   Price Breakdown shown with all components
```

## Price Breakdown UI

### Before Events (Package Only)
```
┌─────────────────────────────────────────┐
│ Price Breakdown                          │
├─────────────────────────────────────────┤
│ Package Price:              £500         │
│ ─────────────────────────────────────    │
│ Total Price:                £500         │
│                                          │
│ Price per Person (10):      £50          │
│ Price per Room (5):         £100         │
└─────────────────────────────────────────┘
```

### After Adding Events
```
┌─────────────────────────────────────────┐
│ Price Breakdown                          │
├─────────────────────────────────────────┤
│ Package Price:              £500         │
│ Events & Activities (3):    £150         │
│   • Jet Skiing              £50          │
│   • Parasailing             £75          │
│   • Banana Boat             £25          │
│ ─────────────────────────────────────    │
│ Total Price:                £650         │
│                                          │
│ Price per Person (10):      £65          │
│ Price per Room (5):         £130         │
└─────────────────────────────────────────┘
```

### Custom Price Override
```
┌─────────────────────────────────────────┐
│ Price Breakdown                          │
├─────────────────────────────────────────┤
│ Package Price:              £500         │
│ Events & Activities (3):    £150         │
│   • Jet Skiing              £50          │
│   • Parasailing             £75          │
│   • Banana Boat             £25          │
│ ─────────────────────────────────────    │
│ Total Price:                £600         │
│                                          │
│ Price per Person (10):      £60          │
│ Price per Room (5):         £120         │
│ ─────────────────────────────────────    │
│ ⚠ Custom price - differs from           │
│   calculated package price               │
└─────────────────────────────────────────┘
```

## Currency Mismatch Warning

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠ Validation Warnings                                        │
├─────────────────────────────────────────────────────────────┤
│ • 1 event(s) have different currency (EUR) and are          │
│   excluded from total. Consider changing quote currency     │
│   or removing these events.                                 │
└─────────────────────────────────────────────────────────────┘

Events List:
✓ Jet Skiing (GBP £50) - Included
✗ Scuba Diving (EUR €60) - Excluded (currency mismatch)
✓ Parasailing (GBP £75) - Included

Total: £125 (only GBP events)
```

## State Transitions

```
┌──────────────┐
│ No Package   │
│ No Events    │
│ basePrice: 0 │
│ eventsTotal: 0│
│ total: 0     │
└──────┬───────┘
       │
       │ Select Package
       ↓
┌──────────────┐
│ Package Only │
│ basePrice:   │
│   £500       │
│ eventsTotal: 0│
│ total: £500  │
└──────┬───────┘
       │
       │ Add Events
       ↓
┌──────────────┐
│ Package +    │
│ Events       │
│ basePrice:   │
│   £500       │
│ eventsTotal: │
│   £150       │
│ total: £650  │
└──────┬───────┘
       │
       │ Manual Override
       ↓
┌──────────────┐
│ Custom Price │
│ basePrice:   │
│   £500       │
│ eventsTotal: │
│   £150       │
│ total: £600  │
│ (custom)     │
└──────────────┘
```

## Component Interaction

```
┌─────────────────────────────────────────────────────────────┐
│                        QuoteForm                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  State:                                                      │
│  • basePrice: number                                         │
│  • eventsTotal: number                                       │
│  • selectedEvents: SelectedEvent[]                           │
│                                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │ useQuotePrice Hook                              │         │
│  │ • Monitors package price changes                │         │
│  │ • Includes eventsTotal in calculations          │         │
│  │ • Detects custom price overrides                │         │
│  │ • Provides price breakdown                      │         │
│  └────────────────────────────────────────────────┘         │
│                                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │ Price Calculation Logic                         │         │
│  │                                                  │         │
│  │ useEffect(() => {                                │         │
│  │   // Calculate events total                     │         │
│  │   eventsTotal = sum(matching currency events)   │         │
│  │ }, [selectedEvents, currency])                  │         │
│  │                                                  │         │
│  │ useEffect(() => {                                │         │
│  │   // Update total price                         │         │
│  │   if (linkedPackage && !customPrice) {          │         │
│  │     totalPrice = basePrice + eventsTotal        │         │
│  │   }                                              │         │
│  │ }, [basePrice, eventsTotal])                    │         │
│  └────────────────────────────────────────────────┘         │
│                                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │ Price Breakdown Display                         │         │
│  │ • Shows base price                              │         │
│  │ • Lists individual events                       │         │
│  │ • Shows events subtotal                         │         │
│  │ • Displays final total                          │         │
│  │ • Indicates custom price status                 │         │
│  └────────────────────────────────────────────────┘         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Example Scenarios

### Scenario 1: Standard Package + Events
```
Input:
  Package: "Benidorm Weekend" = £500
  Events: 
    - Jet Skiing = £50
    - Parasailing = £75
  Currency: GBP

Calculation:
  basePrice = £500
  eventsTotal = £50 + £75 = £125
  totalPrice = £500 + £125 = £625

Display:
  Package Price: £500
  Events (2): £125
  Total: £625
```

### Scenario 2: Currency Mismatch
```
Input:
  Package: "Benidorm Weekend" = £500
  Events: 
    - Jet Skiing (GBP) = £50
    - Scuba Diving (EUR) = €60
    - Parasailing (GBP) = £75
  Currency: GBP

Calculation:
  basePrice = £500
  eventsTotal = £50 + £75 = £125 (EUR event excluded)
  totalPrice = £500 + £125 = £625

Warning:
  "1 event(s) have different currency (EUR) and are 
   excluded from total."
```

### Scenario 3: Custom Price Override
```
Input:
  Package: "Benidorm Weekend" = £500
  Events: 
    - Jet Skiing = £50
    - Parasailing = £75
  Manual Override: £600

Calculation:
  basePrice = £500
  eventsTotal = £125
  expectedTotal = £625
  actualTotal = £600 (custom)

Status:
  syncStatus = 'custom'
  
Display:
  Shows custom price indicator
  Allows reset to calculated price
```

## Integration Points

```
┌─────────────────────────────────────────────────────────────┐
│                    Integration Flow                          │
└─────────────────────────────────────────────────────────────┘

PackageSelector
      ↓
   Selects Package
      ↓
QuoteForm.handlePackageSelect()
      ↓
   setBasePrice(packagePrice)
      ↓
useEffect (basePrice + eventsTotal)
      ↓
   setValue('totalPrice', total)
      ↓
useQuotePrice Hook
      ↓
   Monitors and validates
      ↓
Price Breakdown Display
      ↓
   Shows to user
```

## Key Formulas

### Events Total Calculation
```typescript
eventsTotal = selectedEvents
  .filter(event => event.eventCurrency === quoteCurrency)
  .reduce((sum, event) => sum + event.eventPrice, 0)
```

### Total Price Calculation
```typescript
totalPrice = basePrice + eventsTotal
```

### Custom Price Detection
```typescript
const expectedTotal = basePrice + eventsTotal;
const isCustom = Math.abs(currentPrice - expectedTotal) > 0.01;
```

### Per Person Price
```typescript
pricePerPerson = totalPrice / numberOfPeople
```

### Per Room Price
```typescript
pricePerRoom = totalPrice / numberOfRooms
```

## Success Indicators

✓ Price updates automatically when events added/removed
✓ Currency mismatches are detected and warned
✓ Custom prices are detected and marked
✓ Price breakdown shows all components clearly
✓ Package integration works seamlessly
✓ No infinite loops or performance issues
✓ All TypeScript types are correct
✓ All tests pass (100% success rate)
