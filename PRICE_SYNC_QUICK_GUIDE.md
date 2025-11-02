# Price Sync Button - Quick Guide

## What You Need to Know

The "Price synced with package" indicator is **NOT a button** - it's a **status indicator** that shows the current state of price synchronization.

## Visual Guide

### ✅ Green Checkmark = "Price synced with package"
- **What it means**: The price in the form matches the calculated package price
- **What to do**: Nothing! Everything is working correctly
- **Buttons shown**: None (no action needed)

### 🟠 Orange Icon = "Custom price (not synced)"
- **What it means**: You manually changed the price
- **What to do**: Click one of the two buttons:
  - **Refresh icon**: Recalculate from package (fetches new price)
  - **Arrow icon**: Reset to calculated price (restores original)
- **Buttons shown**: 2 buttons (recalculate + reset)

### 🟡 Yellow Warning = "Parameters changed"
- **What it means**: You changed people/nights/date
- **What to do**: Click the refresh button or wait 500ms for auto-update
- **Buttons shown**: 1 button (recalculate)

### 🔴 Red Error = "Price calculation error"
- **What it means**: Something went wrong calculating the price
- **What to do**: Click the refresh button to retry
- **Buttons shown**: 1 button (recalculate)

### 🔵 Blue Spinner = "Calculating price..."
- **What it means**: Fetching price from server
- **What to do**: Wait a moment
- **Buttons shown**: None (temporary state)

## Quick Troubleshooting

### "I don't see any buttons!"
✅ **This is normal** when the price is synced (green checkmark). Buttons only appear when action is needed.

### "The button doesn't work!"
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Check Network tab for failed API calls

### "Price doesn't update!"
1. Check if status is "calculating" (wait for it)
2. Look for error message below price field
3. Verify package has pricing for your parameters
4. Check if price is "ON_REQUEST" (needs manual entry)

## Development Mode

In development, you'll see debug info like:
```
Status: synced | Calc: 1500 | Current: 1500
```

This helps you understand what's happening behind the scenes.

## Need More Help?

1. Read `PRICE_SYNC_BUTTON_FIX.md` for detailed explanation
2. Run `node test-price-sync-button.js` for testing guide
3. Check browser console for specific error messages
4. Verify package data in database
