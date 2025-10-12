# Task 9: Price Recalculation Feature - Verification Checklist

## Overview
This document provides a comprehensive checklist for verifying that the price recalculation feature works correctly in all scenarios.

## Prerequisites
- [ ] Admin user account with quote management permissions
- [ ] At least one active super package with pricing configured
- [ ] At least one quote linked to a super package
- [ ] Test environment or staging environment access

## Component Verification

### API Endpoint Testing

#### POST /api/admin/quotes/[id]/recalculate-price

**Basic Functionality:**
- [ ] Returns 401 for unauthenticated requests
- [ ] Returns 403 for non-admin users
- [ ] Returns 404 for non-existent quote ID
- [ ] Returns 400 for quote without linked package
- [ ] Returns 404 when linked package is deleted
- [ ] Returns 400 when linked package is inactive
- [ ] Returns 400 when pricing is ON_REQUEST
- [ ] Returns 400 for invalid parameters
- [ ] Returns 200 with comparison data for valid request

**Response Data Validation:**
- [ ] `comparison.oldPrice` matches quote's current price
- [ ] `comparison.newPrice` is calculated correctly
- [ ] `comparison.priceDifference` = newPrice - oldPrice
- [ ] `comparison.percentageChange` is calculated correctly
- [ ] `comparison.currency` matches quote currency
- [ ] `priceCalculation.price` matches newPrice
- [ ] `priceCalculation.tierUsed` is correct tier label
- [ ] `priceCalculation.tierIndex` is correct tier index
- [ ] `priceCalculation.periodUsed` is correct period
- [ ] `priceCalculation.breakdown` has correct values
- [ ] `packageInfo.packageId` matches linked package
- [ ] `packageInfo.packageName` is correct
- [ ] `packageInfo.currentVersion` is package's current version
- [ ] `packageInfo.linkedVersion` is quote's linked version
- [ ] `packageInfo.versionChanged` is true when versions differ
- [ ] `parameters` match quote's current parameters

#### PUT /api/admin/quotes/[id]/recalculate-price

**Basic Functionality:**
- [ ] Returns 401 for unauthenticated requests
- [ ] Returns 403 for non-admin users
- [ ] Returns 404 for non-existent quote ID
- [ ] Returns 400 when newPrice is missing
- [ ] Returns 400 when newPrice is not a number
- [ ] Returns 200 with updated quote for valid request

**Quote Update Validation:**
- [ ] Quote's `totalPrice` is updated to new price
- [ ] Quote's `version` is incremented by 1
- [ ] Quote's `status` changes from "sent" to "updated"
- [ ] Quote's `status` remains "draft" if it was "draft"
- [ ] Quote's `updatedAt` timestamp is updated
- [ ] `linkedPackage.calculatedPrice` is updated
- [ ] `linkedPackage.lastRecalculatedAt` is set to current time
- [ ] `linkedPackage.customPriceApplied` is set to false
- [ ] `linkedPackage.selectedTier` is updated if provided
- [ ] `linkedPackage.selectedPeriod` is updated if provided
- [ ] New entry added to `priceHistory` array
- [ ] Price history entry has correct price
- [ ] Price history entry has reason "recalculation"
- [ ] Price history entry has current timestamp
- [ ] Price history entry has correct userId

**Audit Logging:**
- [ ] Successful recalculation is logged
- [ ] Failed recalculation is logged
- [ ] Log includes old and new prices
- [ ] Log includes price difference
- [ ] Log includes user context

### PriceRecalculationModal Component

**Rendering:**
- [ ] Modal doesn't render when `isOpen` is false
- [ ] Modal renders when `isOpen` is true
- [ ] Background overlay is visible
- [ ] Modal is centered on screen
- [ ] Close button (X) is visible
- [ ] Modal is responsive on mobile devices

**Loading State:**
- [ ] Loading spinner appears immediately when opened
- [ ] "Calculating new price..." message is shown
- [ ] No other content is visible during loading

**Error State:**
- [ ] Error message is displayed in red box
- [ ] Error icon is shown
- [ ] Error message is user-friendly
- [ ] Specific error details are included when available
- [ ] Cancel button is still functional

**Success State - Package Information:**
- [ ] Package name is displayed
- [ ] Package version is shown
- [ ] Version badge appears when version changed
- [ ] Badge shows "Updated from v{X}"

**Success State - Parameters:**
- [ ] Number of people is displayed
- [ ] Number of nights is displayed
- [ ] Arrival date is formatted correctly (e.g., "1 January 2025")

**Success State - Price Comparison:**
- [ ] Current price is shown on left
- [ ] New price is shown on right
- [ ] Prices are formatted with currency symbol
- [ ] Price difference is displayed
- [ ] Percentage change is shown
- [ ] Red color used for price increases
- [ ] Green color used for price decreases
- [ ] Gray color used for no change
- [ ] Up arrow shown for increases
- [ ] Down arrow shown for decreases
- [ ] "No change" message when prices are equal

**Success State - Pricing Details:**
- [ ] Tier label is displayed
- [ ] Period name is displayed
- [ ] Price per person is shown
- [ ] Number of people is confirmed
- [ ] All values are formatted correctly

**Button States:**
- [ ] "Apply New Price" button is enabled when price changed
- [ ] "Apply New Price" button is disabled when no change
- [ ] "Cancel" button is always enabled
- [ ] Buttons are disabled during apply operation
- [ ] Loading spinner shown in button during apply

**Interactions:**
- [ ] Clicking background overlay closes modal
- [ ] Clicking X button closes modal
- [ ] Clicking Cancel button closes modal
- [ ] Clicking Apply button triggers update
- [ ] Modal closes after successful apply
- [ ] `onSuccess` callback is called after apply
- [ ] `onClose` callback is called when closing

### QuoteManager Integration

**Button Visibility:**
- [ ] Recalculate button appears for quotes with linked packages
- [ ] Recalculate button does NOT appear for quotes without packages
- [ ] Button has teal color scheme
- [ ] Button has currency icon
- [ ] Button has "Recalculate Price" tooltip

**Button Functionality:**
- [ ] Clicking button opens PriceRecalculationModal
- [ ] Correct quote ID is passed to modal
- [ ] Modal state is managed correctly
- [ ] Multiple quotes can be recalculated in sequence

**Post-Recalculation:**
- [ ] Quote list refreshes after successful recalculation
- [ ] Updated price is visible in list
- [ ] Version number is incremented in list
- [ ] Status is updated if changed
- [ ] No errors occur during refresh

### QuoteForm Integration

**Button Visibility:**
- [ ] Recalculate button appears in package info card when editing
- [ ] Button appears only when quote has linked package
- [ ] Button is visible in edit mode only

**Button Functionality:**
- [ ] Clicking button opens PriceRecalculationModal
- [ ] Correct quote ID is passed to modal
- [ ] Modal state is managed correctly

**Post-Recalculation:**
- [ ] Form data refreshes after successful recalculation
- [ ] Price field updates with new value
- [ ] Sync indicator updates if present
- [ ] No form validation errors occur

## Scenario Testing

### Scenario 1: Price Unchanged
**Setup:** Quote with package that hasn't changed pricing
- [ ] Open recalculation modal
- [ ] Verify "No change" is displayed
- [ ] Verify Apply button is disabled
- [ ] Close modal without applying

### Scenario 2: Price Increased
**Setup:** Update package pricing to higher amount, then recalculate quote
- [ ] Open recalculation modal
- [ ] Verify new price is higher than old price
- [ ] Verify red color and up arrow are shown
- [ ] Verify percentage increase is correct
- [ ] Apply new price
- [ ] Verify quote is updated
- [ ] Verify price history entry is added

### Scenario 3: Price Decreased
**Setup:** Update package pricing to lower amount, then recalculate quote
- [ ] Open recalculation modal
- [ ] Verify new price is lower than old price
- [ ] Verify green color and down arrow are shown
- [ ] Verify percentage decrease is correct
- [ ] Apply new price
- [ ] Verify quote is updated
- [ ] Verify price history entry is added

### Scenario 4: Package Version Changed
**Setup:** Update package version, then recalculate quote
- [ ] Open recalculation modal
- [ ] Verify version badge appears
- [ ] Verify badge shows old and new versions
- [ ] Verify pricing reflects new version
- [ ] Apply new price
- [ ] Verify linked package version is updated

### Scenario 5: Package Deleted
**Setup:** Delete the linked package, then try to recalculate
- [ ] Open recalculation modal
- [ ] Verify error message about deleted package
- [ ] Verify package details are shown in error
- [ ] Verify Apply button is not available
- [ ] Close modal

### Scenario 6: Package Inactive
**Setup:** Set package status to inactive, then try to recalculate
- [ ] Open recalculation modal
- [ ] Verify error message about inactive package
- [ ] Verify package status is shown in error
- [ ] Verify Apply button is not available
- [ ] Close modal

### Scenario 7: ON_REQUEST Pricing
**Setup:** Set package pricing to ON_REQUEST for quote parameters
- [ ] Open recalculation modal
- [ ] Verify error message about ON_REQUEST pricing
- [ ] Verify tier and period are shown in error
- [ ] Verify Apply button is not available
- [ ] Close modal

### Scenario 8: Invalid Parameters - Nights
**Setup:** Quote has nights not available in package
- [ ] Open recalculation modal
- [ ] Verify error message about invalid nights
- [ ] Verify available options are suggested
- [ ] Verify Apply button is not available
- [ ] Close modal

### Scenario 9: Invalid Parameters - People
**Setup:** Quote has people count exceeding package maximum
- [ ] Open recalculation modal
- [ ] Verify error message about people count
- [ ] Verify maximum is shown in error
- [ ] Verify Apply button is not available
- [ ] Close modal

### Scenario 10: Invalid Parameters - Date
**Setup:** Quote has arrival date outside all pricing periods
- [ ] Open recalculation modal
- [ ] Verify error message about date range
- [ ] Verify available periods are suggested
- [ ] Verify Apply button is not available
- [ ] Close modal

### Scenario 11: Multiple Recalculations
**Setup:** Recalculate same quote multiple times
- [ ] First recalculation works correctly
- [ ] Second recalculation shows updated comparison
- [ ] Price history has multiple entries
- [ ] Each entry has correct timestamp
- [ ] Version increments each time

### Scenario 12: Status Change
**Setup:** Quote with status "sent"
- [ ] Recalculate and apply new price
- [ ] Verify status changes to "updated"
- [ ] Verify status change is reflected in list
- [ ] Verify audit log records status change

### Scenario 13: Concurrent Access
**Setup:** Two admins accessing same quote
- [ ] Admin A opens recalculation modal
- [ ] Admin B updates quote price manually
- [ ] Admin A applies recalculation
- [ ] Verify no data loss or corruption
- [ ] Verify both changes are in price history

## Performance Testing

- [ ] Modal opens within 500ms
- [ ] Price calculation completes within 2 seconds
- [ ] Apply operation completes within 3 seconds
- [ ] No memory leaks when opening/closing modal multiple times
- [ ] No performance degradation with large price history

## Accessibility Testing

- [ ] Modal can be closed with Escape key
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical
- [ ] Focus is trapped within modal
- [ ] Screen reader announces modal content
- [ ] Color contrast meets WCAG AA standards
- [ ] Error messages are announced to screen readers

## Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Responsive Design

- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet landscape (1024x768)
- [ ] Tablet portrait (768x1024)
- [ ] Mobile landscape (667x375)
- [ ] Mobile portrait (375x667)

## Security Testing

- [ ] Non-admin users cannot access recalculation endpoint
- [ ] Cannot recalculate quotes from other organizations
- [ ] SQL injection attempts are blocked
- [ ] XSS attempts are sanitized
- [ ] CSRF protection is in place
- [ ] Rate limiting prevents abuse

## Data Integrity

- [ ] Original quote data is preserved if recalculation fails
- [ ] Price history maintains chronological order
- [ ] Audit logs are complete and accurate
- [ ] No orphaned data after recalculation
- [ ] Database transactions are atomic

## Edge Cases

- [ ] Quote with zero price
- [ ] Quote with very large price (>1,000,000)
- [ ] Quote with decimal prices
- [ ] Package with single tier
- [ ] Package with single pricing period
- [ ] Package with complex special periods
- [ ] Quote created before package existed
- [ ] Quote with missing optional fields

## Regression Testing

- [ ] Existing quote creation still works
- [ ] Existing quote editing still works
- [ ] Package selection still works
- [ ] Price sync indicator still works
- [ ] Version history still works
- [ ] Email sending still works
- [ ] Other quote features unaffected

## Sign-Off

### Tested By
- Name: ___________________________
- Date: ___________________________
- Environment: ___________________________

### Issues Found
| Issue # | Description | Severity | Status |
|---------|-------------|----------|--------|
|         |             |          |        |

### Approval
- [ ] All critical tests passed
- [ ] All high-priority tests passed
- [ ] Known issues documented
- [ ] Ready for production deployment

**Approved By:** ___________________________
**Date:** ___________________________
