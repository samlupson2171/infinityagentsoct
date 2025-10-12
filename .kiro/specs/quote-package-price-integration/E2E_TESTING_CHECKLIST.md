# End-to-End Testing and Validation Checklist

## Overview
This checklist covers comprehensive end-to-end testing for the Quote-Package Price Integration feature.

---

## Pre-Testing Setup

### Environment Preparation
- [ ] Development environment is running
- [ ] Database has test data (packages, enquiries)
- [ ] Test user accounts are available (admin role)
- [ ] Browser dev tools are open for monitoring
- [ ] Network tab is monitoring API calls

### Test Data Requirements
- [ ] At least 3 active super offer packages
- [ ] Packages with different pricing structures
- [ ] At least one package with ON_REQUEST pricing
- [ ] Test enquiries to create quotes from
- [ ] Existing quotes (with and without packages)

---

## Test Scenario 1: Complete Quote Creation Workflow

### 1.1 Basic Package Selection
- [ ] Navigate to quote creation form
- [ ] Select a package from PackageSelector
- [ ] Verify all fields auto-populate:
  - [ ] numberOfNights matches package
  - [ ] totalPrice matches calculated price
  - [ ] whatsIncluded populated
  - [ ] activitiesIncluded populated
- [ ] Verify PriceSyncIndicator shows "synced" (green checkmark)
- [ ] Hover over indicator to see price breakdown tooltip
- [ ] Submit quote successfully
- [ ] Verify quote saved with linkedPackage data

**Expected Result**: Quote created with all package data, price history initialized

### 1.2 ON_REQUEST Pricing
- [ ] Select a package with ON_REQUEST pricing
- [ ] Verify price field is empty or shows placeholder
- [ ] Manually enter a price
- [ ] Verify PriceSyncIndicator shows "custom" (orange icon)
- [ ] Submit quote
- [ ] Verify customPriceApplied is true in saved quote

**Expected Result**: Quote created with manual price, marked as custom

### 1.3 Multiple Package Selections
- [ ] Select first package
- [ ] Verify fields populate
- [ ] Select different package
- [ ] Verify fields update to new package
- [ ] Verify price recalculates
- [ ] Submit quote
- [ ] Verify correct package is linked

**Expected Result**: Latest package selection is used, previous data replaced

---

## Test Scenario 2: Price Recalculation on Parameter Changes

### 2.1 Change Number of Nights
- [ ] Create quote with package
- [ ] Note initial price
- [ ] Change numberOfNights field
- [ ] Wait 500ms (debounce)
- [ ] Verify PriceSyncIndicator shows "calculating"
- [ ] Verify price updates automatically
- [ ] Verify PriceSyncIndicator returns to "synced"
- [ ] Check price breakdown in tooltip

**Expected Result**: Price recalculates automatically, indicator updates

### 2.2 Change Number of People
- [ ] Change numberOfPeople field
- [ ] Wait for debounce
- [ ] Verify price recalculates
- [ ] Verify indicator updates
- [ ] Check if validation warning appears (if outside tier range)

**Expected Result**: Price recalculates, warnings shown if applicable

### 2.3 Change Arrival Date
- [ ] Change arrivalDate field
- [ ] Wait for debounce
- [ ] Verify price recalculates (if different pricing period)
- [ ] Check for validation warnings
- [ ] Verify indicator updates

**Expected Result**: Price recalculates if period changes

### 2.4 Rapid Parameter Changes
- [ ] Quickly change numberOfNights multiple times
- [ ] Verify only one API call is made (debouncing works)
- [ ] Verify final price is correct
- [ ] Check network tab for API call count

**Expected Result**: Debouncing prevents excessive API calls

---

## Test Scenario 3: Manual Price Override

### 3.1 Override Calculated Price
- [ ] Create quote with package
- [ ] Note calculated price
- [ ] Manually change totalPrice field
- [ ] Verify PriceSyncIndicator changes to "custom"
- [ ] Change numberOfNights
- [ ] Verify price does NOT recalculate automatically
- [ ] Submit quote
- [ ] Verify customPriceApplied is true

**Expected Result**: Custom price is preserved, auto-recalculation stops

### 3.2 Reset to Calculated Price
- [ ] With custom price applied
- [ ] Click "Reset to Calculated" button in indicator
- [ ] Verify price reverts to calculated value
- [ ] Verify indicator shows "synced"
- [ ] Change parameters
- [ ] Verify auto-recalculation resumes

**Expected Result**: Price resets, auto-recalculation resumes

---

## Test Scenario 4: Package Unlinking

### 4.1 Unlink Package from New Quote
- [ ] Create quote with package
- [ ] Note all field values
- [ ] Click "Unlink Package" button
- [ ] Verify confirmation dialog appears
- [ ] Confirm unlinking
- [ ] Verify all field values are preserved:
  - [ ] totalPrice unchanged
  - [ ] numberOfNights unchanged
  - [ ] whatsIncluded unchanged
  - [ ] activitiesIncluded unchanged
- [ ] Verify linkedPackage is removed
- [ ] Verify PriceSyncIndicator shows "No package linked"
- [ ] Change parameters
- [ ] Verify price does NOT recalculate

**Expected Result**: Package unlinked, data preserved, auto-recalc stops

### 4.2 Unlink Package from Existing Quote
- [ ] Open existing quote with package
- [ ] Unlink package
- [ ] Verify data preserved
- [ ] Save quote
- [ ] Reload quote
- [ ] Verify package still unlinked

**Expected Result**: Unlinking persists after save

---

## Test Scenario 5: Validation Warnings

### 5.1 Duration Mismatch Warning
- [ ] Select package with specific duration options (e.g., 3, 5, 7 nights)
- [ ] Change numberOfNights to value not in options (e.g., 4)
- [ ] Verify warning appears
- [ ] Verify warning message is clear
- [ ] Verify can still submit with warning
- [ ] Submit quote
- [ ] Verify quote saves successfully

**Expected Result**: Warning shown, submission allowed

### 5.2 People Count Warning
- [ ] Select package with tier (e.g., 10-15 people)
- [ ] Change numberOfPeople outside range (e.g., 8)
- [ ] Verify warning appears
- [ ] Verify warning message mentions tier range
- [ ] Submit quote
- [ ] Verify quote saves

**Expected Result**: Warning shown, submission allowed

### 5.3 Date Range Warning
- [ ] Select package with specific pricing period
- [ ] Change arrivalDate outside period
- [ ] Verify warning appears
- [ ] Verify warning mentions period dates
- [ ] Submit quote
- [ ] Verify quote saves

**Expected Result**: Warning shown, submission allowed

### 5.4 Multiple Warnings
- [ ] Trigger multiple validation warnings simultaneously
- [ ] Verify all warnings are displayed
- [ ] Verify warnings are clearly distinguishable
- [ ] Submit quote
- [ ] Verify quote saves

**Expected Result**: All warnings shown, submission allowed

---

## Test Scenario 6: Error Handling and Recovery

### 6.1 Package Not Found Error
- [ ] Create quote with package
- [ ] Save quote
- [ ] Delete the package from database (or simulate)
- [ ] Reopen quote
- [ ] Verify error message appears
- [ ] Verify "Unlink Package" option is offered
- [ ] Unlink package
- [ ] Verify quote is still editable

**Expected Result**: Graceful error handling, recovery option provided

### 6.2 Network Error
- [ ] Open quote form
- [ ] Disable network (or use dev tools to simulate)
- [ ] Select package
- [ ] Verify error message appears
- [ ] Verify "Retry" button is available
- [ ] Re-enable network
- [ ] Click retry
- [ ] Verify price calculation succeeds

**Expected Result**: Network error handled, retry works

### 6.3 Calculation Timeout
- [ ] Simulate slow API response (dev tools throttling)
- [ ] Select package
- [ ] Wait for timeout
- [ ] Verify timeout message appears
- [ ] Verify manual price entry is suggested
- [ ] Enter price manually
- [ ] Submit quote

**Expected Result**: Timeout handled, manual entry allowed

---

## Test Scenario 7: Existing Quote Editing

### 7.1 Edit Quote with Package
- [ ] Open existing quote with linked package
- [ ] Verify all package data loads correctly
- [ ] Verify PriceSyncIndicator shows correct state
- [ ] Change parameters
- [ ] Verify price recalculates
- [ ] Save changes
- [ ] Reload quote
- [ ] Verify changes persisted

**Expected Result**: Existing quotes work correctly

### 7.2 Edit Quote without Package
- [ ] Open existing quote without package
- [ ] Verify form works normally
- [ ] Change price manually
- [ ] Save changes
- [ ] Verify no errors occur

**Expected Result**: Legacy quotes work without issues

### 7.3 Add Package to Existing Quote
- [ ] Open quote without package
- [ ] Select a package
- [ ] Verify fields update
- [ ] Save quote
- [ ] Reload quote
- [ ] Verify package is linked

**Expected Result**: Can add package to existing quote

### 7.4 Price Recalculation for Existing Quote
- [ ] Open quote with package
- [ ] Click "Recalculate Price" button
- [ ] Verify price comparison modal appears
- [ ] Verify old and new prices shown
- [ ] Verify percentage change shown
- [ ] Confirm recalculation
- [ ] Verify price updates
- [ ] Verify price history updated
- [ ] Save quote

**Expected Result**: Recalculation works, history tracked

---

## Test Scenario 8: Performance Validation

### 8.1 Price Calculation Speed
- [ ] Select package
- [ ] Measure time to calculate price
- [ ] Verify calculation completes in < 500ms
- [ ] Check network tab for API response time

**Expected Result**: Calculations are fast (< 500ms)

### 8.2 Debouncing Effectiveness
- [ ] Rapidly change numberOfNights 10 times
- [ ] Check network tab
- [ ] Verify only 1-2 API calls made
- [ ] Verify final price is correct

**Expected Result**: Debouncing prevents excessive calls

### 8.3 Cache Hit Rate
- [ ] Select same package multiple times
- [ ] Check network tab
- [ ] Verify subsequent selections use cache
- [ ] Verify no unnecessary API calls

**Expected Result**: Caching works effectively

### 8.4 UI Responsiveness
- [ ] Interact with form rapidly
- [ ] Verify UI remains responsive
- [ ] Verify no lag or freezing
- [ ] Check for smooth transitions

**Expected Result**: UI is responsive and smooth

---

## Test Scenario 9: Browser Compatibility

### 9.1 Chrome
- [ ] Run all critical tests in Chrome
- [ ] Verify all features work
- [ ] Check console for errors

### 9.2 Firefox
- [ ] Run all critical tests in Firefox
- [ ] Verify all features work
- [ ] Check console for errors

### 9.3 Safari
- [ ] Run all critical tests in Safari
- [ ] Verify all features work
- [ ] Check console for errors

### 9.4 Edge
- [ ] Run all critical tests in Edge
- [ ] Verify all features work
- [ ] Check console for errors

**Expected Result**: Works consistently across browsers

---

## Test Scenario 10: Accessibility

### 10.1 Keyboard Navigation
- [ ] Navigate form using only keyboard
- [ ] Verify all fields are accessible
- [ ] Verify PriceSyncIndicator is accessible
- [ ] Verify tooltips work with keyboard
- [ ] Verify buttons are accessible

**Expected Result**: Fully keyboard accessible

### 10.2 Screen Reader
- [ ] Use screen reader (NVDA, JAWS, or VoiceOver)
- [ ] Verify all labels are read correctly
- [ ] Verify status messages are announced
- [ ] Verify error messages are announced
- [ ] Verify tooltips are accessible

**Expected Result**: Screen reader friendly

### 10.3 Color Contrast
- [ ] Check color contrast of indicators
- [ ] Verify text is readable
- [ ] Check warning/error colors
- [ ] Verify meets WCAG AA standards

**Expected Result**: Meets accessibility standards

---

## Test Scenario 11: Mobile Responsiveness

### 11.1 Mobile Layout
- [ ] Open form on mobile device (or emulator)
- [ ] Verify layout is responsive
- [ ] Verify all fields are accessible
- [ ] Verify PriceSyncIndicator is visible
- [ ] Verify tooltips work on touch

**Expected Result**: Works well on mobile

### 11.2 Tablet Layout
- [ ] Test on tablet device
- [ ] Verify layout adapts correctly
- [ ] Verify all features work

**Expected Result**: Works well on tablet

---

## Performance Metrics Validation

### Target Metrics
- [ ] Price calculation: < 500ms ✓ / ✗
- [ ] Debounce delay: 500ms ✓ / ✗
- [ ] Cache hit rate: > 80% ✓ / ✗
- [ ] UI responsiveness: < 100ms ✓ / ✗

### Actual Metrics
- Price calculation average: _____ ms
- Debounce working: Yes / No
- Cache hit rate: _____ %
- UI responsiveness: _____ ms

---

## Bug Tracking

### Issues Found

| # | Severity | Description | Steps to Reproduce | Status |
|---|----------|-------------|-------------------|--------|
| 1 |          |             |                   |        |
| 2 |          |             |                   |        |
| 3 |          |             |                   |        |

---

## Sign-Off

### Testing Completed By
- Name: _________________
- Date: _________________
- Environment: _________________

### Results Summary
- Total Tests: _____
- Passed: _____
- Failed: _____
- Blocked: _____

### Critical Issues
- [ ] No critical issues found
- [ ] Critical issues documented above

### Recommendation
- [ ] Ready for production deployment
- [ ] Requires fixes before deployment
- [ ] Requires additional testing

### Notes
_____________________________________
_____________________________________
_____________________________________

---

## Post-Testing Actions

- [ ] Document all bugs in issue tracker
- [ ] Update documentation based on findings
- [ ] Create fix tickets for issues
- [ ] Schedule regression testing after fixes
- [ ] Prepare deployment plan
- [ ] Notify stakeholders of results
