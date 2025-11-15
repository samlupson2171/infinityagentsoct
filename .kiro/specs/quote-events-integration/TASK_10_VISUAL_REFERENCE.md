# Task 10: Package-Events Integration - Visual Reference

## User Flow Diagrams

### Flow 1: Adding Events to Package-Based Quote

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: User selects a Super Package                        │
├─────────────────────────────────────────────────────────────┤
│ [Select Super Package] button clicked                       │
│                                                              │
│ Package Selected: "Benidorm Weekend"                        │
│ - Tier: 2-4 people                                          │
│ - Period: December                                          │
│ - Price: £500 (£250 per person × 2 people)                 │
│                                                              │
│ ✓ Package fields populated                                  │
│ ✓ Existing events PRESERVED (if any)                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: User adds events to the quote                       │
├─────────────────────────────────────────────────────────────┤
│ Events & Activities Section:                                │
│                                                              │
│ [Select Events] dropdown                                    │
│                                                              │
│ Selected Events (3):                                        │
│ ✓ Jet Skiing          £50  [Remove]                        │
│ ✓ Parasailing        £75  [Remove]                        │
│ ✓ Beach Volleyball   £25  [Remove]                        │
│                                                              │
│ Events Total: £150                                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Price automatically updates                         │
├─────────────────────────────────────────────────────────────┤
│ Pricing Section:                                            │
│                                                              │
│ Total Price: £650                                           │
│ Currency: GBP                                               │
│                                                              │
│ [Price Synced ✓] ← PriceSyncIndicator                      │
│                                                              │
│ Price Breakdown (hover to see):                            │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Package Price:              £500                     │   │
│ │ Events & Activities (3):    £150                     │   │
│ │   ✓ Jet Skiing:             £50                      │   │
│ │   ✓ Parasailing:            £75                      │   │
│ │   ✓ Beach Volleyball:       £25                      │   │
│ │ ─────────────────────────────────                    │   │
│ │ Total Price:                £650                     │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Flow 2: Unlinking Package While Preserving Events

```
┌─────────────────────────────────────────────────────────────┐
│ Before Unlinking                                            │
├─────────────────────────────────────────────────────────────┤
│ Linked Package: "Benidorm Weekend"                         │
│ - Package Price: £500                                       │
│                                                              │
│ Selected Events (3):                                        │
│ - Jet Skiing: £50                                           │
│ - Parasailing: £75                                          │
│ - Beach Volleyball: £25                                     │
│                                                              │
│ Total Price: £650                                           │
│                                                              │
│ [Unlink Package ×] button clicked                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Confirmation Dialog                                         │
├─────────────────────────────────────────────────────────────┤
│ Are you sure you want to unlink this package?              │
│                                                              │
│ All current field values will be preserved, but            │
│ automatic price recalculation will stop.                   │
│                                                              │
│ You can manually edit all fields after unlinking.          │
│                                                              │
│ [Cancel]  [Unlink Package]                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ After Unlinking                                             │
├─────────────────────────────────────────────────────────────┤
│ ✓ Package link removed                                      │
│ ✓ isSuperPackage set to false                              │
│                                                              │
│ PRESERVED VALUES:                                           │
│ - Number of People: 2                                       │
│ - Number of Nights: 3                                       │
│ - Arrival Date: 2024-12-15                                  │
│ - What's Included: [package inclusions text]               │
│ - Total Price: £650                                         │
│                                                              │
│ Selected Events (3): ✓ PRESERVED                           │
│ - Jet Skiing: £50                                           │
│ - Parasailing: £75                                          │
│ - Beach Volleyball: £25                                     │
│                                                              │
│ User can now manually edit all fields                      │
└─────────────────────────────────────────────────────────────┘
```

### Flow 3: Price Recalculation with Events

```
┌─────────────────────────────────────────────────────────────┐
│ Initial State                                               │
├─────────────────────────────────────────────────────────────┤
│ Package: "Benidorm Weekend" (2 people, 3 nights)           │
│ Package Price: £500                                         │
│ Events Total: £150                                          │
│ Total Price: £650                                           │
│                                                              │
│ [Price Synced ✓]                                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ User Changes Parameters                                     │
├─────────────────────────────────────────────────────────────┤
│ Number of People: 2 → 4                                     │
│                                                              │
│ [Parameters Changed ⚠]                                      │
│ "Quote parameters have changed. Recalculate to sync."      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ User Clicks Recalculate                                     │
├─────────────────────────────────────────────────────────────┤
│ [Calculating... ⟳]                                          │
│                                                              │
│ API Call: Calculate package price for 4 people             │
│ Response: £1000 (£250 per person × 4 people)               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Price Updated                                               │
├─────────────────────────────────────────────────────────────┤
│ Package Price: £500 → £1000                                 │
│ Events Total: £150 (unchanged)                              │
│ Total Price: £650 → £1150                                   │
│                                                              │
│ [Price Synced ✓]                                           │
│                                                              │
│ Price Breakdown:                                            │
│ - Package Price: £1000                                      │
│ - Events (3): £150                                          │
│ - Total: £1150                                              │
└─────────────────────────────────────────────────────────────┘
```

## PriceSyncIndicator States with Events

### State 1: Synced (with events)
```
┌────────────────────────────────────────────────────────┐
│ ✓ Price synced with package                           │
│                                                         │
│ Hover tooltip shows:                                   │
│ ┌─────────────────────────────────────────────────┐  │
│ │ Price Breakdown                                  │  │
│ │                                                  │  │
│ │ Tier: 2-4 people                                │  │
│ │ Period: December                                │  │
│ │ Price per person: £250                          │  │
│ │ Number of people: 2                             │  │
│ │ ─────────────────────────                       │  │
│ │ Package Price: £500                             │  │
│ │                                                  │  │
│ │ Events & Activities (3): £150                   │  │
│ │   ✓ Jet Skiing: £50                             │  │
│ │   ✓ Parasailing: £75                            │  │
│ │   ✓ Beach Volleyball: £25                       │  │
│ │ ─────────────────────────                       │  │
│ │ Total Price: £650                               │  │
│ └─────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### State 2: Custom Price (with events)
```
┌────────────────────────────────────────────────────────┐
│ ✎ Custom price (not synced)  [⟳] [↶]                 │
│                                                         │
│ User manually changed total to £700                    │
│ Expected: £650 (£500 package + £150 events)           │
│                                                         │
│ Actions:                                               │
│ [⟳] Recalculate - Reset to £650                       │
│ [↶] Reset to calculated - Restore £650                │
└────────────────────────────────────────────────────────┘
```

### State 3: Currency Mismatch Warning
```
┌────────────────────────────────────────────────────────┐
│ ✓ Price synced with package                           │
│                                                         │
│ Price Breakdown:                                       │
│ Package Price: £500                                    │
│                                                         │
│ Events & Activities (3): £125                          │
│   ✓ Jet Skiing: £50                                   │
│   ✓ Parasailing: £75                                  │
│   ✓ Beach Volleyball: €30 ⚠️                          │
│                                                         │
│ ⚠️ Some events have different currency (EUR)          │
│    and are excluded from total                         │
│                                                         │
│ Total Price: £625 (excluding mismatched events)       │
└────────────────────────────────────────────────────────┘
```

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        QuoteForm                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  State:                                                     │
│  - selectedEvents: Event[]                                  │
│  - basePrice: number                                        │
│  - eventsTotal: number                                      │
│  - linkedPackageInfo: LinkedPackageInfo | null             │
│                                                              │
│  ┌────────────────────────────────────────────────────┐   │
│  │ useQuotePrice Hook                                  │   │
│  │ - Accepts: eventsTotal                             │   │
│  │ - Returns: calculatedPrice (BASE package price)    │   │
│  │ - Parent adds eventsTotal for final total          │   │
│  └────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌────────────────────────────────────────────────────┐   │
│  │ PackageSelector                                     │   │
│  │ - onSelect → handlePackageSelect                   │   │
│  │ - Preserves selectedEvents ✓                       │   │
│  │ - Updates package fields only                      │   │
│  └────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌────────────────────────────────────────────────────┐   │
│  │ EventSelector                                       │   │
│  │ - onChange → handleEventSelectionChange            │   │
│  │ - Updates selectedEvents array                     │   │
│  │ - Fetches event prices from API                    │   │
│  └────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌────────────────────────────────────────────────────┐   │
│  │ SelectedEventsList                                  │   │
│  │ - Displays: selectedEvents                         │   │
│  │ - Shows: eventsTotal                               │   │
│  │ - onRemove → handleRemoveEvent                     │   │
│  └────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌────────────────────────────────────────────────────┐   │
│  │ PriceSyncIndicator                                  │   │
│  │ - Receives: eventsTotal, selectedEvents            │   │
│  │ - Shows: Package + Events breakdown                │   │
│  │ - Displays: Individual event prices                │   │
│  │ - Warns: Currency mismatches                       │   │
│  └────────────────────────────────────────────────────┘   │
│                                                              │
│  Price Calculation Flow:                                   │
│  1. basePrice ← package calculation                        │
│  2. eventsTotal ← sum of event prices                      │
│  3. totalPrice ← basePrice + eventsTotal                   │
│  4. Auto-update via useEffect                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow: Package Selection with Events

```
User Action: Select Package
         ↓
handlePackageSelect(selection)
         ↓
┌────────────────────────────────────────┐
│ Update Package Fields:                 │
│ - numberOfPeople                       │
│ - numberOfNights                       │
│ - arrivalDate                          │
│ - currency                             │
│ - whatsIncluded                        │
│ - isSuperPackage = true                │
│                                         │
│ Set Package Info:                      │
│ - linkedPackageInfo = {...}            │
│ - basePrice = selection.totalPrice     │
│                                         │
│ PRESERVE:                              │
│ - selectedEvents (unchanged) ✓         │
│ - eventsTotal (unchanged) ✓            │
└────────────────────────────────────────┘
         ↓
useEffect: Update Total Price
         ↓
┌────────────────────────────────────────┐
│ Calculate:                             │
│ newTotal = basePrice + eventsTotal     │
│                                         │
│ Update:                                │
│ setValue('totalPrice', newTotal)       │
└────────────────────────────────────────┘
         ↓
PriceSyncIndicator Updates
         ↓
┌────────────────────────────────────────┐
│ Display:                               │
│ - Package Price: basePrice             │
│ - Events Total: eventsTotal            │
│ - Individual Events: selectedEvents    │
│ - Final Total: basePrice + eventsTotal │
└────────────────────────────────────────┘
```

## Key Implementation Points

### 1. Event Preservation
```typescript
// handlePackageSelect does NOT touch selectedEvents
const handlePackageSelect = (selection: PackageSelection) => {
  // Update package fields...
  setValue('numberOfPeople', selection.numberOfPeople);
  setValue('numberOfNights', selection.numberOfNights);
  // ... more package fields
  
  // selectedEvents state is NOT modified
  // Events remain in state automatically ✓
};
```

### 2. Separate Price Calculation
```typescript
// basePrice: Package price only
const packagePrice = selection.priceCalculation.totalPrice;
setBasePrice(packagePrice);

// eventsTotal: Sum of event prices
const total = selectedEvents.reduce((sum, event) => 
  sum + event.eventPrice, 0
);
setEventsTotal(total);

// totalPrice: Automatic calculation
useEffect(() => {
  const newTotal = basePrice + eventsTotal;
  setValue('totalPrice', newTotal);
}, [basePrice, eventsTotal]);
```

### 3. PriceSyncIndicator Integration
```typescript
<PriceSyncIndicator
  status={syncStatus}
  priceBreakdown={priceBreakdown}
  eventsTotal={eventsTotal}  // ← Pass events total
  selectedEvents={selectedEvents.map(e => ({  // ← Pass events list
    eventId: e.eventId,
    eventName: e.eventName,
    eventPrice: e.eventPrice,
    eventCurrency: e.eventCurrency,
  }))}
  onRecalculate={recalculatePrice}
  onResetToCalculated={resetToCalculated}
/>
```

## Summary

This visual reference demonstrates how the package system and event selection system work together seamlessly:

1. **Events are preserved** during all package operations
2. **Prices are calculated separately** but displayed together
3. **Price synchronization** includes events in the total
4. **Visual feedback** shows clear breakdown of costs
5. **Currency handling** warns about mismatches

The integration maintains the integrity of both systems while providing a unified user experience.
