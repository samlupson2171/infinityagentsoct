# Price Recalculation Feature - User Guide

## Overview

The Price Recalculation feature allows administrators to update quote prices when package pricing changes. This ensures quotes always reflect the most current pricing from linked super packages.

## When to Use Price Recalculation

Use this feature when:
- Package pricing has been updated since the quote was created
- You want to verify the quote price matches current package pricing
- A quote was created with an older package version
- You need to adjust a quote to reflect seasonal pricing changes

## How to Recalculate a Quote Price

### Step 1: Identify Quotes with Linked Packages

1. Navigate to **Admin Dashboard** → **Quote Management**
2. Look for quotes with a package badge (📦 icon) in the quote details
3. Only quotes linked to super packages can be recalculated

### Step 2: Open the Recalculation Modal

1. Find the quote you want to recalculate in the quotes list
2. In the **Actions** column, click the **dollar sign icon** (💲)
3. Tooltip will show "Recalculate Price"
4. The Price Recalculation modal will open

### Step 3: Review the Price Comparison

The modal displays several sections:

#### Package Information
- **Package Name**: The linked super package
- **Version**: Current package version
- **Version Changed Badge**: Shows if package was updated since quote creation

#### Quote Parameters
- **People**: Number of people in the quote
- **Nights**: Number of nights
- **Arrival Date**: The arrival date

#### Price Comparison
- **Current Price**: The price currently on the quote
- **New Price**: The recalculated price based on current package pricing
- **Difference**: Shows the price change
  - **Red** with ↗ arrow: Price increased
  - **Green** with ↘ arrow: Price decreased
  - **Gray**: No change
- **Percentage Change**: Shows the percentage difference

#### Pricing Details
- **Tier**: The pricing tier used (e.g., "10-19 people")
- **Period**: The pricing period applied (e.g., "Peak Season")
- **Price per Person**: Breakdown of the per-person cost

### Step 4: Apply or Cancel

#### If Price Changed
- Review the new price and difference
- Click **"Apply New Price"** to update the quote
- Click **"Cancel"** to keep the current price

#### If No Price Change
- The modal will show "No change"
- The **"Apply New Price"** button will be disabled
- Click **"Cancel"** to close the modal

### Step 5: Verify the Update

After applying the new price:
1. The modal closes automatically
2. The quotes list refreshes
3. The quote now shows:
   - Updated price
   - Incremented version number
   - Updated status (if it was "sent", it becomes "updated")

## Understanding the Results

### Price Increased (Red)
```
Current Price: £1,500.00
New Price: £1,650.00
+£150.00 (+10.00%)
```
**Meaning**: Package pricing has increased. Consider:
- Notifying the customer of the price change
- Explaining the reason (e.g., peak season, increased demand)
- Offering alternatives if available

### Price Decreased (Green)
```
Current Price: £1,500.00
New Price: £1,350.00
-£150.00 (-10.00%)
```
**Meaning**: Package pricing has decreased. Consider:
- Updating the quote to offer better value
- Notifying the customer of the savings
- Using this as a selling point

### No Change (Gray)
```
Current Price: £1,500.00
New Price: £1,500.00
No change
```
**Meaning**: The quote price is already up-to-date with current package pricing.

## What Happens When You Apply

When you click "Apply New Price", the system:

1. **Updates the Quote**
   - Sets the new total price
   - Updates the linked package information
   - Records the recalculation timestamp

2. **Logs the Change**
   - Adds an entry to the price history
   - Records your user ID
   - Notes the reason as "recalculation"
   - Timestamps the change

3. **Increments Version**
   - Quote version number increases by 1
   - Allows tracking of quote changes over time

4. **Updates Status**
   - If quote was "sent", status changes to "updated"
   - Indicates the quote has changed since being sent

5. **Maintains Audit Trail**
   - All actions logged for compliance
   - Full history available in version history

## Error Messages and Solutions

### "The linked package no longer exists"
**Cause**: The super package was deleted from the system.

**Solution**:
1. Unlink the package from the quote
2. Either:
   - Select a different package
   - Convert to a custom quote
   - Create a new quote with an active package

### "The linked package is draft/archived"
**Cause**: The package status is not "active".

**Solution**:
1. Contact the package administrator
2. Request package reactivation
3. Or unlink and select an active package

### "This quote is not linked to a super package"
**Cause**: The quote was created without a package link.

**Solution**:
- This quote cannot be recalculated
- Price must be updated manually
- Consider linking to a package if appropriate

### "The package pricing is set to 'ON REQUEST' for these parameters"
**Cause**: The package doesn't have fixed pricing for the quote's parameters.

**Solution**:
1. Review the quote parameters
2. Adjust parameters to match available pricing tiers
3. Or keep the current manual price

### "8 nights not available for this package"
**Cause**: The quote's duration doesn't match package options.

**Solution**:
1. Check package duration options
2. Adjust quote to match available durations
3. Or unlink package and use custom pricing

### "Failed to calculate price"
**Cause**: Network error or system issue.

**Solution**:
1. Click "Cancel" and try again
2. Refresh the page
3. Contact support if problem persists

## Best Practices

### When to Recalculate
✅ **DO** recalculate when:
- Package pricing has been updated
- Quote is in "draft" status
- Customer hasn't been sent the quote yet
- You notice a version mismatch

❌ **DON'T** recalculate when:
- Quote has been accepted by customer
- Payment has been received
- Quote has a custom price for a specific reason
- Customer has been promised the current price

### Before Recalculating
1. **Check Quote Status**: Ensure it's appropriate to change the price
2. **Review Package Changes**: Understand why the price changed
3. **Consider Customer Impact**: How will this affect the customer?
4. **Document Reason**: Add notes explaining the recalculation

### After Recalculating
1. **Review the Change**: Verify the new price is correct
2. **Update Customer**: Notify them if quote was already sent
3. **Add Notes**: Document why the price was recalculated
4. **Check Version History**: Confirm the change was logged

## Viewing Price History

To see all price changes for a quote:

1. Click the **clock icon** in the quote actions
2. Select **"Version History"**
3. Look for entries with reason: "recalculation"
4. Each entry shows:
   - Old price
   - New price
   - Who made the change
   - When it was changed

## Tips and Tricks

### Bulk Recalculation
If you need to recalculate multiple quotes:
1. Filter quotes by package name
2. Recalculate each one individually
3. Document the batch update in internal notes

### Seasonal Updates
When package pricing changes seasonally:
1. Identify all quotes with the package
2. Recalculate quotes that haven't been sent
3. Contact customers for sent quotes
4. Document the seasonal change

### Version Tracking
Use version numbers to track quote evolution:
- Version 1: Initial quote
- Version 2: After recalculation
- Version 3: After customer negotiation
- etc.

### Custom Prices
If a quote has a custom price for a reason:
1. Add a note explaining why
2. Don't recalculate unless necessary
3. The system will reset the custom price flag after recalculation

## Frequently Asked Questions

### Q: Will recalculating notify the customer?
**A**: No, recalculation only updates the quote in the system. You must manually send an updated quote to the customer.

### Q: Can I undo a recalculation?
**A**: Not directly, but you can:
- View the price history to see the old price
- Manually change the price back
- Or create a new version of the quote

### Q: What if the package version changed?
**A**: The modal will show a "Version Changed" badge. Review the package changes before applying the new price.

### Q: Can I recalculate a quote multiple times?
**A**: Yes, you can recalculate as many times as needed. Each recalculation is logged in the price history.

### Q: What happens to custom prices?
**A**: Recalculation resets the custom price flag. If you had a custom price for a reason, add a note before recalculating.

### Q: Will this affect sent quotes?
**A**: The quote status will change from "sent" to "updated", indicating it has changed since being sent to the customer.

## Support

If you encounter issues with price recalculation:

1. **Check Error Message**: Read the error carefully for guidance
2. **Review Package**: Verify the package is active and has valid pricing
3. **Check Parameters**: Ensure quote parameters match package options
4. **Contact Support**: If problems persist, contact technical support with:
   - Quote ID
   - Package name
   - Error message
   - Screenshot of the issue

## Summary

The Price Recalculation feature helps you:
- ✅ Keep quotes up-to-date with current pricing
- ✅ Maintain pricing consistency across quotes
- ✅ Track all price changes with full audit trail
- ✅ Handle package updates efficiently
- ✅ Provide accurate quotes to customers

Remember to always review the price comparison before applying changes and consider the impact on your customers.
