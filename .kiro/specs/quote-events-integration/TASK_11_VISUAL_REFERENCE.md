# Task 11: Price Breakdown Component - Visual Reference

## Component Preview

### Expanded View (Default)

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🧮 Price Breakdown                              [Hide Details ▲]    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 📦 Package Price                                    £500.00     │ │
│ │    Benidorm Super Package 2026                                  │ │
│ │    👤 £250.00 per person × 2 people                             │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 📅 Events & Activities (3 events)                   £150.00     │ │
│ │ ┌─────────────────────────────────────────────────────────────┐ │ │
│ │ │ ✓ Jet Skiing                                      £50.00    │ │ │
│ │ │ ─────────────────────────────────────────────────────────── │ │ │
│ │ │ ✓ Parasailing                                     £75.00    │ │ │
│ │ │ ─────────────────────────────────────────────────────────── │ │ │
│ │ │ ✓ Beach Volleyball                                £25.00    │ │ │
│ │ └─────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ ═══════════════════════════════════════════════════════════════════ │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 💰 Total Price:                                     £650.00     │ │
│ │                                          £500.00 + £150.00      │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 🧮 Per-Unit Breakdown                                           │ │
│ │ ┌─────────────────────────────────────────────────────────────┐ │ │
│ │ │ 👤 Price per Person:                              £325.00   │ │ │
│ │ └─────────────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────────────┐ │ │
│ │ │ 🏠 Price per Room:                                £650.00   │ │ │
│ │ └─────────────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────────────┐ │ │
│ │ │ 🌙 Price per Night:                               £216.67   │ │ │
│ │ └─────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ℹ️ Package Details                                              │ │
│ │ ┌─────────────────────────────────────────────────────────────┐ │ │
│ │ │ Pricing Tier:                                    Peak       │ │ │
│ │ └─────────────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────────────┐ │ │
│ │ │ Travel Period:                                   Summer     │ │ │
│ │ └─────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Collapsed View

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🧮 Price Breakdown                              [Show Details ▼]    │
└─────────────────────────────────────────────────────────────────────┘
```

### With Currency Mismatch Warning

```
┌─────────────────────────────────────────────────────────────────────┐
│ 📅 Events & Activities (3 events)                   £125.00         │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ✓ Jet Skiing                                      £50.00        │ │
│ │ ─────────────────────────────────────────────────────────────── │ │
│ │ ✓ Parasailing                                     £75.00        │ │
│ │ ─────────────────────────────────────────────────────────────── │ │
│ │ ✓ Scuba Diving                                    €50.00 ⚠️     │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ ⚠️ Some events have different currency and are excluded from total   │
└─────────────────────────────────────────────────────────────────────┘
```

### With Custom Price Indicator

```
┌─────────────────────────────────────────────────────────────────────┐
│ ⚠️ Custom Price                                                      │
│ Price has been manually adjusted and differs from the calculated     │
│ package price                                                        │
└─────────────────────────────────────────────────────────────────────┘
```

### With Calculating Status

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🔄 Calculating price...                                              │
└─────────────────────────────────────────────────────────────────────┘
```

### With Error Status

```
┌─────────────────────────────────────────────────────────────────────┐
│ ❌ Price Calculation Error                                           │
│ Unable to calculate price automatically. Please enter manually.      │
└─────────────────────────────────────────────────────────────────────┘
```

### Empty State (No Events)

```
┌─────────────────────────────────────────────────────────────────────┐
│ 📦 Package Price                                    £500.00         │
│    Benidorm Super Package 2026                                      │
│    👤 £250.00 per person × 2 people                                 │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ 📅 No events selected                                                │
└─────────────────────────────────────────────────────────────────────┘
```

## Color Scheme

### Background Colors
- **Main Container:** Gradient from `bg-blue-50` to `bg-indigo-50`
- **Sections:** `bg-white` with `bg-opacity-60`
- **Total Price:** Gradient from `bg-blue-100` to `bg-indigo-100`
- **Event List:** `bg-gray-50`
- **Per-Unit Items:** `bg-gray-50`

### Border Colors
- **Main Border:** `border-blue-200`
- **Total Price Border:** `border-blue-300` (2px)
- **Section Dividers:** `border-blue-300` (2px)
- **Event Separators:** `border-gray-200`

### Text Colors
- **Headers:** `text-gray-900` (font-semibold or font-bold)
- **Labels:** `text-gray-700` (font-medium)
- **Values:** `text-gray-900` (font-semibold)
- **Total Price:** `text-blue-900` (font-bold, text-2xl)
- **Supporting Text:** `text-gray-600` (text-xs)

### Icon Colors
- **Package Icon:** `text-blue-500`
- **Events Icon:** `text-green-500`
- **Total Icon:** `text-blue-700`
- **Checkmarks:** `text-green-500`
- **Info Icons:** `text-gray-500`
- **Warning Icons:** `text-amber-600`

## Responsive Behavior

### Desktop (≥768px)
- Full width layout
- All sections visible
- Icons and text side-by-side
- Comfortable spacing

### Tablet (≥640px)
- Slightly reduced padding
- Maintained layout structure
- Readable font sizes

### Mobile (<640px)
- Stacked layout
- Reduced padding
- Smaller icons
- Maintained readability

## Interactive States

### Expand/Collapse Button
- **Default:** Blue text with hover effect
- **Hover:** Darker blue
- **Focus:** Blue ring outline
- **Active:** Slightly darker

### Chevron Icon
- **Expanded:** Rotated 180° (pointing up)
- **Collapsed:** Default position (pointing down)
- **Transition:** Smooth 200ms rotation

## Accessibility Features

### ARIA Attributes
```html
<button
  aria-label="Collapse breakdown"
  aria-expanded="true"
>
  Hide Details
</button>
```

### Keyboard Navigation
- Tab to focus expand/collapse button
- Enter/Space to toggle
- Focus ring visible on keyboard navigation

### Screen Reader Support
- Descriptive button labels
- Status indicators with text
- Semantic HTML structure

## Usage Example

```typescript
<PriceBreakdown
  basePrice={500}
  eventsTotal={150}
  totalPrice={650}
  currency="GBP"
  selectedEvents={[
    {
      eventId: "1",
      eventName: "Jet Skiing",
      eventPrice: 50,
      eventCurrency: "GBP"
    },
    {
      eventId: "2",
      eventName: "Parasailing",
      eventPrice: 75,
      eventCurrency: "GBP"
    },
    {
      eventId: "3",
      eventName: "Beach Volleyball",
      eventPrice: 25,
      eventCurrency: "GBP"
    }
  ]}
  numberOfPeople={2}
  numberOfRooms={1}
  numberOfNights={3}
  linkedPackageInfo={{
    packageName: "Benidorm Super Package 2026",
    tierLabel: "Peak",
    periodUsed: "Summer"
  }}
  priceBreakdown={{
    pricePerPerson: 250,
    numberOfPeople: 2,
    tierUsed: "Peak",
    periodUsed: "Summer"
  }}
  syncStatus="synced"
  defaultExpanded={true}
/>
```

## Component States

### 1. Initial Load (Synced)
- Shows all sections
- Expanded by default
- No warnings or errors

### 2. Calculating
- Shows spinner
- Blue status indicator
- "Calculating price..." message

### 3. Custom Price
- Shows amber warning
- "Custom Price" indicator
- Explanation text

### 4. Error State
- Shows red alert
- Error icon
- Error message

### 5. No Package (Custom Quote)
- Shows "Base Price" instead of "Package Price"
- No package details section
- No tier/period information

### 6. No Events
- Shows "No events selected" message
- Gray icon
- Helpful hint text

## Design Principles

1. **Visual Hierarchy:**
   - Total price most prominent (largest, bold)
   - Base price and events clearly separated
   - Supporting details in smaller text

2. **Information Density:**
   - Collapsible to save space
   - Detailed when expanded
   - Essential info always visible

3. **User Guidance:**
   - Clear labels and icons
   - Warning messages for issues
   - Status indicators for states

4. **Consistency:**
   - Matches QuoteForm design
   - Uses same color scheme
   - Consistent spacing and typography

5. **Accessibility:**
   - ARIA attributes
   - Keyboard navigation
   - Screen reader support
   - High contrast text

## Integration Points

### QuoteForm
- Placed in "Pricing" section
- Below price input fields
- Above internal notes
- Receives all necessary props

### PriceSyncIndicator
- Works alongside price sync indicator
- Complementary information
- Shared data sources

### SelectedEventsList
- Shows same events
- Consistent styling
- Synchronized state

## Performance Considerations

1. **Rendering:**
   - Conditional rendering for sections
   - Memoized calculations
   - Efficient re-renders

2. **State Management:**
   - Local state for expand/collapse
   - Props for data
   - No unnecessary updates

3. **Styling:**
   - Tailwind CSS classes
   - No inline styles
   - Optimized class names

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers
- ✅ Tablet browsers

## Testing Scenarios

1. **With Package:**
   - Shows package price
   - Displays package name
   - Shows tier and period

2. **Without Package:**
   - Shows base price
   - No package details
   - Custom quote mode

3. **With Events:**
   - Lists all events
   - Shows subtotal
   - Correct calculations

4. **Without Events:**
   - Shows empty state
   - Helpful message
   - No errors

5. **Currency Mismatch:**
   - Shows warnings
   - Excludes from total
   - Clear indicators

6. **Custom Price:**
   - Shows warning
   - Explains difference
   - Maintains display

7. **Calculating:**
   - Shows spinner
   - Status message
   - Non-blocking

8. **Error:**
   - Shows error message
   - Helpful guidance
   - Allows manual entry

## Conclusion

The PriceBreakdown component provides a comprehensive, visually appealing, and user-friendly display of quote pricing information. It successfully meets all requirements while providing an excellent user experience with clear visual hierarchy, helpful status indicators, and full accessibility support.
