# Price Recalculation Feature - Visual Reference

## UI Components Overview

### 1. Recalculate Button in Quote Manager

```
┌─────────────────────────────────────────────────────────────────┐
│ Quote Management                                    [+ Create]   │
├─────────────────────────────────────────────────────────────────┤
│ Quote Details          │ Enquiry    │ Price      │ Actions      │
├────────────────────────┼────────────┼────────────┼──────────────┤
│ QT-2025-001           │ John Doe   │ £1,500.00  │ [👁] [✏️]    │
│ Lead: Jane Smith      │ agent@...  │ v1         │ [📧] [🕐]    │
│ Hotel: Beach Resort   │            │            │ [💲] [🔄]    │
│ 10 people • 7 nights  │            │            │              │
│ 📦 Benidorm Package   │            │            │ ← Package    │
└────────────────────────┴────────────┴────────────┴──────────────┘
                                                      ↑
                                            Recalculate Button
```

**Button Appearance**:
- Icon: 💲 (Dollar sign)
- Color: Teal (#14B8A6)
- Hover: Darker teal
- Tooltip: "Recalculate Price"
- Visibility: Only when `linkedPackage` exists

---

## 2. Price Recalculation Modal

### Modal Layout

```
┌──────────────────────────────────────────────────────────────┐
│ Recalculate Quote Price                                  [×] │
│ Compare current price with latest package pricing           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 📦 Package Information                                 │ │
│ │ Package: Benidorm Super Package                        │ │
│ │ Version: v2  [Updated from v1]                         │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Quote Parameters                                       │ │
│ │ People: 10    Nights: 7    Arrival: 15 March 2025     │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Price Comparison                                       │ │
│ │                                                        │ │
│ │   Current Price          New Price                    │ │
│ │   £1,500.00             £1,650.00                     │ │
│ │                                                        │ │
│ │   ↗️ +£150.00 (+10.00%)                               │ │
│ │                                                        │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Pricing Details                                        │ │
│ │ Tier: 10-19 people                                     │ │
│ │ Period: Peak Season                                    │ │
│ │ Price per person: £165.00                              │ │
│ │ Number of people: 10                                   │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                              [Cancel] [Apply New Price]      │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Price Comparison States

### Price Increased (Red)

```
┌────────────────────────────────────────────────────────┐
│ Price Comparison                                       │
│                                                        │
│   Current Price          New Price                    │
│   £1,500.00             £1,650.00                     │
│                                                        │
│   🔴 ↗️ +£150.00 (+10.00%)                            │
│   ─────────────────────                               │
│   Red color indicates price increase                  │
└────────────────────────────────────────────────────────┘
```

### Price Decreased (Green)

```
┌────────────────────────────────────────────────────────┐
│ Price Comparison                                       │
│                                                        │
│   Current Price          New Price                    │
│   £1,500.00             £1,350.00                     │
│                                                        │
│   🟢 ↘️ -£150.00 (-10.00%)                            │
│   ─────────────────────                               │
│   Green color indicates price decrease                │
└────────────────────────────────────────────────────────┘
```

### No Change (Gray)

```
┌────────────────────────────────────────────────────────┐
│ Price Comparison                                       │
│                                                        │
│   Current Price          New Price                    │
│   £1,500.00             £1,500.00                     │
│                                                        │
│   ⚪ No change                                         │
│   ─────────────────────                               │
│   Gray indicates no price difference                  │
│   [Apply New Price] button is DISABLED                │
└────────────────────────────────────────────────────────┘
```

---

## 4. Loading State

```
┌──────────────────────────────────────────────────────────────┐
│ Recalculate Quote Price                                  [×] │
│ Compare current price with latest package pricing           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                                                              │
│                    ⏳ Calculating new price...               │
│                                                              │
│                    [Spinner Animation]                       │
│                                                              │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Error States

### Package Not Found

```
┌──────────────────────────────────────────────────────────────┐
│ Recalculate Quote Price                                  [×] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ ❌ Error                                               │ │
│ │                                                        │ │
│ │ The linked package no longer exists                   │ │
│ │                                                        │ │
│ │ Package ID: 507f1f77bcf86cd799439011                  │ │
│ │ Package Name: Benidorm Super Package                  │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                            [Close]           │
└──────────────────────────────────────────────────────────────┘
```

### Package Inactive

```
┌──────────────────────────────────────────────────────────────┐
│ Recalculate Quote Price                                  [×] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ ⚠️ Warning                                             │ │
│ │                                                        │ │
│ │ The linked package is draft                           │ │
│ │                                                        │ │
│ │ Package: Benidorm Super Package                       │ │
│ │ Status: draft                                         │ │
│ │                                                        │ │
│ │ Contact admin to activate the package.                │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                            [Close]           │
└──────────────────────────────────────────────────────────────┘
```

### Invalid Parameters

```
┌──────────────────────────────────────────────────────────────┐
│ Recalculate Quote Price                                  [×] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ ⚠️ Calculation Error                                   │ │
│ │                                                        │ │
│ │ 8 nights not available for this package               │ │
│ │                                                        │ │
│ │ Parameters used:                                       │ │
│ │ • People: 10                                          │ │
│ │ • Nights: 8                                           │ │
│ │ • Date: 15 March 2025                                 │ │
│ │                                                        │ │
│ │ Available durations: 3, 5, 7 nights                   │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                            [Close]           │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. Applying State

```
┌──────────────────────────────────────────────────────────────┐
│ Recalculate Quote Price                                  [×] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ [Price comparison shown above]                               │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                    [Cancel] [⏳ Applying...]                 │
│                             ─────────────                    │
│                             Button disabled                  │
│                             Spinner shown                    │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. Success State (After Apply)

```
┌──────────────────────────────────────────────────────────────┐
│ Quote Management                                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ ✅ Quote updated successfully                                │
│                                                              │
│ Quote Details          │ Enquiry    │ Price      │ Actions  │
├────────────────────────┼────────────┼────────────┼──────────┤
│ QT-2025-001           │ John Doe   │ £1,650.00  │ [👁] [✏️]│
│ Lead: Jane Smith      │ agent@...  │ v2 ← New!  │ [📧] [🕐]│
│ Hotel: Beach Resort   │            │            │ [💲] [🔄]│
│ Status: updated ← New!│            │            │          │
└────────────────────────┴────────────┴────────────┴──────────┘
```

---

## 8. Version History Entry

```
┌──────────────────────────────────────────────────────────────┐
│ Version History - QT-2025-001                            [×] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Version 2 - 10 Dec 2025, 14:30                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 💰 Price Recalculation                                 │ │
│ │                                                        │ │
│ │ Old Price: £1,500.00                                   │ │
│ │ New Price: £1,650.00                                   │ │
│ │ Difference: +£150.00 (+10.00%)                         │ │
│ │                                                        │ │
│ │ Reason: recalculation                                  │ │
│ │ Updated by: admin@example.com                          │ │
│ │ Timestamp: 10 Dec 2025, 14:30:15                       │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ Version 1 - 10 Dec 2025, 10:00                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 📝 Quote Created                                       │ │
│ │ Initial price: £1,500.00                               │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 9. Color Scheme

### Primary Colors

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Recalculate Button | Teal | #14B8A6 | Button color |
| Price Increase | Red | #DC2626 | Negative change |
| Price Decrease | Green | #16A34A | Positive change |
| No Change | Gray | #6B7280 | Neutral state |
| Error | Red | #DC2626 | Error messages |
| Warning | Amber | #F59E0B | Warning messages |
| Info | Blue | #3B82F6 | Information |
| Success | Green | #16A34A | Success messages |

### Background Colors

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Package Info | Light Blue | #EFF6FF | Package section |
| Parameters | Light Gray | #F9FAFB | Parameters section |
| Comparison | White | #FFFFFF | Price comparison |
| Details | Light Gray | #F9FAFB | Pricing details |
| Error | Light Red | #FEE2E2 | Error background |
| Warning | Light Amber | #FEF3C7 | Warning background |

---

## 10. Icons Used

| Icon | Unicode | Usage |
|------|---------|-------|
| 💲 | U+1F4B2 | Recalculate button |
| 📦 | U+1F4E6 | Package indicator |
| ↗️ | U+2197 | Price increase |
| ↘️ | U+2198 | Price decrease |
| ❌ | U+274C | Error |
| ⚠️ | U+26A0 | Warning |
| ✅ | U+2705 | Success |
| ⏳ | U+23F3 | Loading |
| 🕐 | U+1F550 | Version history |
| 👁 | U+1F441 | View |
| ✏️ | U+270F | Edit |
| 📧 | U+1F4E7 | Email |
| 🔄 | U+1F504 | Refresh |

---

## 11. Responsive Behavior

### Desktop (> 768px)

```
┌────────────────────────────────────────────────────────┐
│ Modal: 600px width, centered                           │
│ Two-column layout for price comparison                 │
│ All sections visible                                   │
└────────────────────────────────────────────────────────┘
```

### Tablet (768px - 1024px)

```
┌──────────────────────────────────────────┐
│ Modal: 90% width, centered               │
│ Two-column layout maintained             │
│ Slightly smaller padding                 │
└──────────────────────────────────────────┘
```

### Mobile (< 768px)

```
┌────────────────────────────┐
│ Modal: Full width          │
│ Single-column layout       │
│ Stacked price comparison   │
│ Reduced padding            │
└────────────────────────────┘
```

---

## 12. Accessibility Features

### Keyboard Navigation

```
Tab Order:
1. Close button (×)
2. Apply New Price button
3. Cancel button

Keyboard Shortcuts:
• Esc: Close modal
• Enter: Apply (when focused on button)
• Tab: Navigate between elements
• Shift+Tab: Navigate backwards
```

### Screen Reader

```
ARIA Labels:
• Modal: "Price Recalculation Dialog"
• Close button: "Close dialog"
• Apply button: "Apply new price"
• Cancel button: "Cancel recalculation"

Announcements:
• "Calculating price..." (loading)
• "Price increased by £150" (result)
• "Error: Package not found" (error)
• "Price updated successfully" (success)
```

### Focus Indicators

```
All interactive elements have visible focus indicators:
• Blue outline (2px solid #3B82F6)
• Offset: 2px
• Border radius: 4px
```

---

## 13. Animation Timing

| Animation | Duration | Easing |
|-----------|----------|--------|
| Modal open | 200ms | ease-out |
| Modal close | 150ms | ease-in |
| Button hover | 150ms | ease-in-out |
| Loading spinner | 1000ms | linear (loop) |
| Success fade | 300ms | ease-out |

---

## 14. Spacing and Layout

```
Modal:
• Padding: 24px
• Section spacing: 24px
• Element spacing: 16px

Buttons:
• Height: 40px
• Padding: 8px 16px
• Gap: 12px

Text:
• Heading: 18px (font-size)
• Body: 14px (font-size)
• Small: 12px (font-size)
• Line height: 1.5
```

---

## Summary

The Price Recalculation feature provides:
- ✅ Clear visual hierarchy
- ✅ Intuitive color coding
- ✅ Comprehensive error states
- ✅ Responsive design
- ✅ Accessibility compliance
- ✅ Smooth animations
- ✅ Consistent styling

All visual elements follow the application's design system and provide a seamless user experience.
