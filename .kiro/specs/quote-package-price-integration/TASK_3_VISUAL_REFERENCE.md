# PriceSyncIndicator Visual Reference

## Component States Overview

### 1. Synced State (Green)
```
┌─────────────────────────────────────────────────────┐
│ ✓  Price synced with package                       │
│    [Green background, green border]                 │
└─────────────────────────────────────────────────────┘

Tooltip on hover:
┌─────────────────────────────────────────────────────┐
│ ✓  Price synced with package                       │
│    The quote price matches the calculated           │
│    package price.                                   │
│                                                     │
│ PRICE BREAKDOWN                                     │
│ Tier: Tier 2 (4-6 people)                          │
│ Period: Peak Season                                 │
│ Price per person: £500.00                          │
│ Number of people: 4                                 │
│ ─────────────────────────────────────              │
│ Total: £2,000.00                                   │
└─────────────────────────────────────────────────────┘
```

### 2. Calculating State (Blue)
```
┌─────────────────────────────────────────────────────┐
│ ⟳  Calculating price...                            │
│    [Blue background, blue border, spinning icon]    │
└─────────────────────────────────────────────────────┘

Tooltip on hover:
┌─────────────────────────────────────────────────────┐
│ ⟳  Calculating price...                            │
│    Price calculation is in progress.                │
└─────────────────────────────────────────────────────┘
```

### 3. Custom Price State (Orange)
```
┌─────────────────────────────────────────────────────┐
│ ✎  Custom price (not synced)              [↻] [←] │
│    [Orange background, orange border]               │
└─────────────────────────────────────────────────────┘
     [Recalculate] [Reset]

Tooltip on hover:
┌─────────────────────────────────────────────────────┐
│ ✎  Custom price (not synced)                       │
│    The price has been manually overridden and      │
│    will not auto-update.                           │
│                                                     │
│ PRICE BREAKDOWN                                     │
│ Tier: Tier 2 (4-6 people)                          │
│ Period: Peak Season                                 │
│ Price per person: £500.00                          │
│ Number of people: 4                                 │
│ ─────────────────────────────────────              │
│ Total: £2,000.00                                   │
│                                                     │
│ Click the refresh icon to recalculate from         │
│ package, or the reset icon to restore the          │
│ calculated price.                                   │
└─────────────────────────────────────────────────────┘
```

### 4. Error State (Red)
```
┌─────────────────────────────────────────────────────┐
│ ⚠  Price calculation error                    [↻] │
│    [Red background, red border]                     │
└─────────────────────────────────────────────────────┘
     [Recalculate]

Tooltip on hover:
┌─────────────────────────────────────────────────────┐
│ ⚠  Price calculation error                         │
│    Package not found                                │
│                                                     │
│ ERROR DETAILS                                       │
│ Package not found                                   │
└─────────────────────────────────────────────────────┘
```

### 5. Out-of-Sync State (Yellow)
```
┌─────────────────────────────────────────────────────┐
│ ⚠  Parameters changed                          [↻] │
│    [Yellow background, yellow border]               │
└─────────────────────────────────────────────────────┘
     [Recalculate]

Tooltip on hover:
┌─────────────────────────────────────────────────────┐
│ ⚠  Parameters changed                               │
│    Quote parameters have changed. Recalculate to    │
│    sync the price.                                  │
│                                                     │
│ Click the refresh icon to recalculate the price    │
│ based on current parameters.                        │
└─────────────────────────────────────────────────────┘
```

## Color Scheme

### Synced (Success)
- Background: `bg-green-50` (#F0FDF4)
- Border: `border-green-200` (#BBF7D0)
- Text: `text-green-600` (#16A34A)
- Icon: Green checkmark

### Calculating (Info)
- Background: `bg-blue-50` (#EFF6FF)
- Border: `border-blue-200` (#BFDBFE)
- Text: `text-blue-600` (#2563EB)
- Icon: Blue spinner (animated)

### Custom (Warning)
- Background: `bg-orange-50` (#FFF7ED)
- Border: `border-orange-200` (#FED7AA)
- Text: `text-orange-600` (#EA580C)
- Icon: Orange edit/pencil

### Error (Danger)
- Background: `bg-red-50` (#FEF2F2)
- Border: `border-red-200` (#FECACA)
- Text: `text-red-600` (#DC2626)
- Icon: Red warning circle

### Out-of-Sync (Caution)
- Background: `bg-yellow-50` (#FEFCE8)
- Border: `border-yellow-200` (#FEF08A)
- Text: `text-yellow-600` (#CA8A04)
- Icon: Yellow warning triangle

## Action Buttons

### Recalculate Button (↻)
- **Appears in**: Custom, Error, Out-of-sync states
- **Icon**: Circular arrows (refresh)
- **Action**: Triggers `onRecalculate()` callback
- **Tooltip**: "Recalculate price"
- **Hover**: White background

### Reset Button (←)
- **Appears in**: Custom state only
- **Icon**: Back arrow
- **Action**: Triggers `onResetToCalculated()` callback
- **Tooltip**: "Reset to calculated price"
- **Hover**: White background

## Responsive Behavior

### Desktop (≥768px)
- Full width indicator with inline buttons
- Tooltip appears below indicator
- All text visible

### Mobile (<768px)
- Stacked layout if needed
- Buttons remain accessible
- Tooltip adjusts to viewport
- Touch-friendly button sizes

## Accessibility Features

### Screen Reader Announcements
```
"Price synced with package"
"Calculating price..."
"Custom price (not synced)"
"Price calculation error"
"Parameters changed"
```

### Keyboard Navigation
- Tab to focus action buttons
- Enter/Space to activate buttons
- Escape to close tooltip (if implemented)

### ARIA Attributes
- `role="status"` - Live region for status updates
- `aria-live="polite"` - Non-intrusive announcements
- `aria-label` - Descriptive labels for buttons
- `aria-hidden="true"` - Hide decorative icons

## Usage in QuoteForm

```tsx
// In the pricing section of QuoteForm
<div className="space-y-2">
  <label>Total Price</label>
  <input
    type="number"
    value={totalPrice}
    onChange={handlePriceChange}
  />
  
  {/* Price sync indicator */}
  {linkedPackage && (
    <PriceSyncIndicator
      status={syncStatus}
      priceBreakdown={priceBreakdown}
      error={priceError}
      onRecalculate={recalculatePrice}
      onResetToCalculated={resetToCalculated}
    />
  )}
</div>
```

## State Transitions

```
Package Selected → Calculating → Synced
                                   ↓
                          Manual Edit → Custom
                                   ↓
                          Recalculate → Calculating → Synced
                                   ↓
                          Reset → Synced

Parameters Changed → Out-of-sync → Recalculate → Calculating → Synced

Calculation Failed → Error → Recalculate → Calculating → Synced/Error
```

## Best Practices

1. **Always show when package is linked**: Display indicator whenever a quote has a linked package
2. **Provide clear actions**: Always include recalculate button for non-synced states
3. **Show detailed breakdown**: Include price breakdown in tooltip for transparency
4. **Handle errors gracefully**: Show specific error messages, not generic ones
5. **Maintain state consistency**: Ensure status matches actual price state
6. **Responsive feedback**: Update status immediately on user actions
7. **Accessibility first**: Ensure all states are announced to screen readers

## Testing Checklist

- [ ] All 5 states render correctly
- [ ] Tooltip appears on hover
- [ ] Tooltip disappears on mouse leave
- [ ] Price breakdown displays correctly
- [ ] Currency formatting works (GBP, EUR, USD)
- [ ] Recalculate button appears in correct states
- [ ] Reset button appears only in custom state
- [ ] Button callbacks are invoked
- [ ] ARIA attributes are present
- [ ] Screen reader announcements work
- [ ] Responsive on mobile and desktop
- [ ] Error messages display correctly
- [ ] Action hints appear in tooltip
