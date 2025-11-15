# Task 18: Per-Person Pricing - Visual Reference

## UI Components

### 1. SelectedEventsList Component

#### Per-Person Event (Checked)
```
┌─────────────────────────────────────────────────────────┐
│ Selected Events (3)                Click × to remove    │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ✓ Jet Skiing                          £500      ×  │ │
│ │   £50 × 10                                          │ │
│ │   ☑ Price is per person                            │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ✓ Parasailing                         £750      ×  │ │
│ │   £75 × 10                                          │ │
│ │   ☑ Price is per person                            │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ✓ Private Yacht Charter               £500      ×  │ │
│ │   ☐ Price is per person                            │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Events Total:                                   £1,750  │
└─────────────────────────────────────────────────────────┘
```

### 2. PriceBreakdown Component

#### Expanded View with Per-Person Events
```
┌─────────────────────────────────────────────────────────┐
│ 🧮 Price Breakdown                    [Hide Details ▲] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 📦 Package Price                                        │
│    Benidorm Weekend Package                     £2,000  │
│    👤 £200 per person × 10 people                       │
│                                                         │
│ 📅 Events & Activities (3 events)                       │
│    ┌───────────────────────────────────────────────┐   │
│    │ ✓ Jet Skiing                          £500    │   │
│    │   👤 £50 × 10 people                          │   │
│    ├───────────────────────────────────────────────┤   │
│    │ ✓ Parasailing                         £750    │   │
│    │   👤 £75 × 10 people                          │   │
│    ├───────────────────────────────────────────────┤   │
│    │ ✓ Private Yacht Charter               £500    │   │
│    └───────────────────────────────────────────────┘   │
│                                              £1,750     │
│                                                         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                         │
│ 💰 Total Price:                                 £3,750  │
│    £2,000 + £1,750                                      │
│                                                         │
│ 🧮 Per-Unit Breakdown                                   │
│    👤 Price per Person:                         £375.00 │
│    🏠 Price per Room:                           £750.00 │
│    🌙 Price per Night:                        £1,250.00 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## User Interactions

### Toggle Per-Person Pricing

#### Before Toggle (Flat Rate)
```
Event: Jet Skiing
Price: £50
Number of People: 10
☐ Price is per person

Displayed Cost: £50
Contribution to Total: £50
```

#### After Toggle (Per Person)
```
Event: Jet Skiing
Price: £50
Number of People: 10
☑ Price is per person

Displayed Cost: £500
Calculation: £50 × 10
Contribution to Total: £500
```

### Changing Number of People

#### Initial State
```
Number of People: 10
Event: Jet Skiing (£50 per person)
☑ Price is per person

Event Cost: £500 (£50 × 10)
```

#### After Changing to 15 People
```
Number of People: 15
Event: Jet Skiing (£50 per person)
☑ Price is per person

Event Cost: £750 (£50 × 15)  ← Automatically recalculated
```

## Color Coding

### SelectedEventsList
- **Blue checkmark** (✓): Event is selected
- **Green icon**: Event indicator
- **Gray text**: Calculation details (£50 × 10)
- **Blue total**: Events total amount
- **Amber warning**: Currency mismatch

### PriceBreakdown
- **Blue gradient background**: Main container
- **White cards**: Individual sections
- **Green icon**: Events section
- **Blue icon**: Package section
- **Gray text**: Calculation details
- **Bold blue**: Total price

## Responsive Behavior

### Desktop View
- Full width display
- All details visible
- Hover effects on buttons
- Smooth transitions

### Mobile View
- Stacked layout
- Truncated event names with ellipsis
- Touch-friendly toggle switches
- Collapsible sections

## Accessibility Features

1. **Keyboard Navigation**
   - Tab through checkboxes
   - Space to toggle
   - Enter to remove events

2. **Screen Readers**
   - Aria labels on all interactive elements
   - Descriptive button text
   - Status announcements on changes

3. **Visual Indicators**
   - Clear checkbox states
   - Color + icon combinations
   - High contrast text

## States

### Normal State
- Checkbox unchecked: Flat rate pricing
- Checkbox checked: Per-person pricing
- Clear calculation display

### Loading State
- Disabled checkboxes during save
- Loading spinner on price calculation
- Grayed out text

### Error State
- Red border on invalid events
- Error message display
- Retry options

### Currency Mismatch State
- Amber background
- Warning icon
- Explanatory text
- Event excluded from total

## Animation & Transitions

1. **Toggle Animation**
   - Smooth checkbox transition
   - Price update fade-in
   - Calculation detail slide-down

2. **Price Update**
   - Number animation (count up/down)
   - Highlight flash on change
   - Smooth color transitions

3. **Expand/Collapse**
   - Smooth height transition
   - Rotate arrow icon
   - Fade in/out content

## Example Quotes

### Example 1: Stag Party (All Per-Person)
```
Group Size: 12 people
Base Package: £1,800 (£150 per person)

Events:
- Paintball: £300 (£25 × 12) ☑ Per person
- Go-Karting: £480 (£40 × 12) ☑ Per person
- Nightclub Entry: £240 (£20 × 12) ☑ Per person

Events Total: £1,020
Total Quote: £2,820 (£235 per person)
```

### Example 2: Hen Party (Mixed Pricing)
```
Group Size: 8 people
Base Package: £1,600 (£200 per person)

Events:
- Spa Day: £400 (£50 × 8) ☑ Per person
- Private Yacht: £600 (flat rate) ☐ Per person
- Cocktail Making: £240 (£30 × 8) ☑ Per person

Events Total: £1,240
Total Quote: £2,840 (£355 per person)
```

### Example 3: Corporate Event (Mostly Flat Rate)
```
Group Size: 25 people
Base Package: £5,000 (£200 per person)

Events:
- Conference Room: £500 (flat rate) ☐ Per person
- Catering: £1,250 (£50 × 25) ☑ Per person
- Team Building: £800 (flat rate) ☐ Per person
- Transport: £600 (flat rate) ☐ Per person

Events Total: £3,150
Total Quote: £8,150 (£326 per person)
```

## Best Practices

### When to Use Per-Person Pricing
- Individual activities (jet skiing, parasailing)
- Food and beverage per head
- Entry tickets
- Equipment rental per person
- Spa treatments

### When to Use Flat Rate Pricing
- Group bookings (yacht charter, bus rental)
- Venue hire
- Photography services
- Entertainment (DJ, band)
- Decorations and setup

### Admin Guidelines
1. Check the event's actual pricing model before toggling
2. Verify the calculation makes sense for the group size
3. Use PriceBreakdown to confirm total is correct
4. Consider the per-person cost when presenting to clients
5. Document any special pricing arrangements in internal notes
