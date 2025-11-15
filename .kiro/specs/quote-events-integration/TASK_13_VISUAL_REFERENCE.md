# Task 13: Quote Email Template with Events - Visual Reference

## 📧 Email Template Structure

### Before (Without Events)
```
┌─────────────────────────────────────┐
│         INFINITY WEEKENDS           │
│        Your Holiday Quote           │
├─────────────────────────────────────┤
│ Dear John Smith,                    │
│                                     │
│ Quote Details                       │
│ ├─ Hotel: Hotel Benidorm Palace    │
│ ├─ People: 12                       │
│ └─ Nights: 3                        │
│                                     │
│ What's Included                     │
│ ├─ Accommodation                    │
│ ├─ Breakfast                        │
│ └─ Transfers                        │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │   Total Price: £1,200.00        │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### After (With Events) ✨
```
┌─────────────────────────────────────┐
│         INFINITY WEEKENDS           │
│        Your Holiday Quote           │
├─────────────────────────────────────┤
│ Dear John Smith,                    │
│                                     │
│ Quote Details                       │
│ ├─ Hotel: Hotel Benidorm Palace    │
│ ├─ People: 12                       │
│ └─ Nights: 3                        │
│                                     │
│ What's Included                     │
│ ├─ Accommodation                    │
│ ├─ Breakfast                        │
│ └─ Transfers                        │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🎉 Selected Events & Activities │ │
│ ├─────────────────────────────────┤ │
│ │ Jet Skiing Adventure    £50.00  │ │
│ │ Parasailing Experience  £75.00  │ │
│ │ Beach Club VIP Access   £35.00  │ │
│ ├─────────────────────────────────┤ │
│ │ Events Subtotal:       £160.00  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Base: £1,200 + Events: £160     │ │
│ │   Total Price: £1,360.00        │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## 🎨 Color Scheme

### Events Section
- **Background**: `#fff3cd` (Light Yellow)
- **Border**: `#ffc107` (Gold) - 4px left border
- **Header Text**: `#856404` (Dark Gold)
- **Event Prices**: `#007bff` (Blue)
- **Subtotal**: `#856404` (Dark Gold)

### Price Breakdown
- **Background**: `#e8f5e8` (Light Green)
- **Text**: `#2c5aa0` (Dark Blue)
- **Breakdown Text**: `#666` (Gray)

## 📊 Layout Examples

### Single Event
```html
┌──────────────────────────────────────┐
│ 🎉 Selected Events & Activities      │
├──────────────────────────────────────┤
│ Event Name              Price        │
│ Jet Skiing Adventure    £50.00       │
├──────────────────────────────────────┤
│ Events Subtotal:        £50.00       │
└──────────────────────────────────────┘
```

### Multiple Events
```html
┌──────────────────────────────────────┐
│ 🎉 Selected Events & Activities      │
├──────────────────────────────────────┤
│ Event Name              Price        │
│ Jet Skiing Adventure    £50.00       │
│ Parasailing Experience  £75.00       │
│ Beach Club VIP Access   £35.00       │
│ Boat Party              £45.00       │
│ Quad Biking Tour        £60.00       │
├──────────────────────────────────────┤
│ Events Subtotal:        £265.00      │
└──────────────────────────────────────┘
```

### No Events (Section Hidden)
```html
┌──────────────────────────────────────┐
│ What's Included                      │
│ ├─ Accommodation                     │
│ ├─ Breakfast                         │
│ └─ Transfers                         │
│                                      │
│ [Events section not displayed]       │
│                                      │
│ ┌────────────────────────────────┐   │
│ │   Total Price: £1,200.00       │   │
│ └────────────────────────────────┘   │
└──────────────────────────────────────┘
```

## 💰 Price Display Variations

### With Events
```
┌─────────────────────────────────┐
│ Base Price: £1,200.00 +         │
│ Events: £160.00                 │
│                                 │
│ Total Price: £1,360.00          │
└─────────────────────────────────┘
```

### Without Events
```
┌─────────────────────────────────┐
│                                 │
│ Total Price: £1,200.00          │
│                                 │
└─────────────────────────────────┘
```

## 📱 Responsive Design

### Desktop View (600px)
```
┌────────────────────────────────────────────┐
│ Event Name                          Price  │
│ Jet Skiing Adventure               £50.00  │
│ Parasailing Experience             £75.00  │
└────────────────────────────────────────────┘
```

### Mobile View (320px)
```
┌──────────────────────────┐
│ Event Name        Price  │
│ Jet Skiing       £50.00  │
│ Parasailing      £75.00  │
└──────────────────────────┘
```

## 🔤 Typography

### Event Section Header
- **Font Size**: 18px
- **Font Weight**: Bold
- **Color**: #856404 (Dark Gold)
- **Icon**: 🎉 emoji

### Event Names
- **Font Size**: 15px
- **Font Weight**: 500 (Medium)
- **Color**: #212529 (Dark Gray)

### Event Prices
- **Font Size**: 16px
- **Font Weight**: Bold
- **Color**: #007bff (Blue)

### Events Subtotal
- **Font Size**: 16px
- **Font Weight**: Bold
- **Color**: #856404 (Dark Gold)

## 📐 Spacing

### Events Section
- **Padding**: 20px
- **Margin**: 20px 0
- **Border Radius**: 8px

### Event Table
- **Cell Padding**: 12px 0
- **Border**: 1px solid #e9ecef (between rows)
- **Subtotal Border**: 2px solid #ffc107 (top)

### Price Breakdown
- **Padding**: 15px
- **Margin**: 20px 0
- **Font Size**: 16px (breakdown), 24px (total)

## 🎯 Key Features

### 1. Visual Hierarchy
```
Header (Large, Bold)
  ↓
Event List (Medium)
  ↓
Subtotal (Bold, Emphasized)
  ↓
Total Price (Largest, Most Prominent)
```

### 2. Color Coding
- **Yellow/Gold**: Events section (special/premium)
- **Blue**: Individual prices (informational)
- **Green**: Total price (positive/action)

### 3. Information Density
- **Compact**: Event list with clear spacing
- **Scannable**: Table format for easy reading
- **Hierarchical**: Clear visual separation

## 📧 Email Client Compatibility

### Tested Layouts
- ✅ Gmail (Web, Mobile)
- ✅ Outlook (Desktop, Web)
- ✅ Apple Mail (macOS, iOS)
- ✅ Yahoo Mail
- ✅ Thunderbird

### Fallback Styling
- Inline CSS for maximum compatibility
- Table-based layout for older clients
- Safe color palette
- Web-safe fonts

## 🔍 Accessibility

### Screen Reader Support
- Semantic HTML table structure
- Clear header hierarchy
- Descriptive text labels

### Visual Accessibility
- High contrast colors
- Clear font sizes
- Adequate spacing
- Color not sole indicator

## 📝 Content Guidelines

### Event Names
- **Max Length**: 50 characters
- **Format**: Title Case
- **Example**: "Jet Skiing Adventure"

### Event Prices
- **Format**: Currency symbol + amount
- **Decimals**: Always 2 decimal places
- **Example**: £50.00, €60.00, $75.00

### Subtotal Label
- **Text**: "Events Subtotal:"
- **Position**: Last row of events table
- **Style**: Bold, gold color

## 🎨 Design Principles

### 1. Clarity
- Clear separation between sections
- Easy to scan and understand
- Obvious pricing structure

### 2. Consistency
- Matches existing email design
- Uses established color scheme
- Follows brand guidelines

### 3. Emphasis
- Events section stands out
- Price breakdown is clear
- Call-to-action remains prominent

## 📊 Example Scenarios

### Scenario 1: Stag Do with 3 Events
```
Base Package: £1,200.00
+ Jet Skiing: £50.00
+ Parasailing: £75.00
+ Beach Club: £35.00
= Total: £1,360.00
```

### Scenario 2: Hen Do with 5 Events
```
Base Package: £1,500.00
+ Spa Day: £80.00
+ Cocktail Making: £45.00
+ Boat Party: £60.00
+ Restaurant Booking: £40.00
+ Club Entry: £25.00
= Total: £1,750.00
```

### Scenario 3: Custom Package with 1 Event
```
Base Package: £800.00
+ Quad Biking: £60.00
= Total: £860.00
```

## ✅ Implementation Checklist

- [x] Events section displays when events present
- [x] Events section hidden when no events
- [x] Event names displayed correctly
- [x] Event prices formatted with currency
- [x] Events subtotal calculated accurately
- [x] Price breakdown shows base + events
- [x] Styling matches design specifications
- [x] Responsive on all devices
- [x] Compatible with email clients
- [x] Accessible to screen readers

## 🎉 Result

The email template now provides a clear, professional presentation of quotes with events, making it easy for clients to understand exactly what they're getting and how the pricing breaks down.
