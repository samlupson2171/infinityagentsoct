# Manual Testing and Verification Checklist

## Overview
This checklist covers all manual testing scenarios for the super package price calculation fix. Complete each test and mark with ✓ or ✗.

## Prerequisites
- [ ] MongoDB is running and accessible
- [ ] At least one active super package exists in the database
- [ ] Development server is running (`npm run dev`)
- [ ] Admin user account is available for testing

---

## Test 1: PricingCalculator - Single Person

**Objective:** Verify that for 1 person, totalPrice equals pricePerPerson

### Steps:
1. Run the test script: `node test-price-calculation-fix.js`
2. Review the "TEST 1: Single Person" section

### Expected Results:
- [ ] Calculation completes successfully
- [ ] `pricePerPerson` is displayed (e.g., £100)
- [ ] `totalPrice` equals `pricePerPerson` (e.g., £100)
- [ ] `numberOfPeople` is 1
- [ ] Deprecated `price` field equals `totalPrice`

### Actual Results:
```
[Record your results here]
```

---

## Test 2: PricingCalculator - Multiple People (10 people)

**Objective:** Verify that totalPrice = pricePerPerson × numberOfPeople

### Steps:
1. Run the test script: `node test-price-calculation-fix.js`
2. Review the "TEST 2: Multiple People" section

### Expected Results:
- [ ] Calculation completes successfully
- [ ] `pricePerPerson` is displayed (e.g., £100)
- [ ] `totalPrice` = `pricePerPerson` × 10 (e.g., £1000)
- [ ] `numberOfPeople` is 10
- [ ] `totalPrice` > `pricePerPerson`
- [ ] Deprecated `price` field equals `totalPrice`

### Actual Results:
```
[Record your results here]
```

---

## Test 3: PricingCalculator - ON_REQUEST Prices

**Objective:** Verify ON_REQUEST prices are handled correctly

### Steps:
1. Create or find a package with ON_REQUEST pricing
2. Run calculation with that package
3. Verify both `pricePerPerson` and `totalPrice` are 'ON_REQUEST'

### Expected Results:
- [ ] `pricePerPerson` is 'ON_REQUEST'
- [ ] `totalPrice` is 'ON_REQUEST'
- [ ] Deprecated `price` field is 'ON_REQUEST'
- [ ] No calculation errors occur

### Actual Results:
```
[Record your results here]
```

---

## Test 4: PackageSelector Component - Price Display

**Objective:** Verify PackageSelector displays correct prices in UI

### Steps:
1. Navigate to admin quotes page
2. Click "Create New Quote"
3. Click "Select Super Package"
4. Select a package and configure parameters (10 people, 3 nights)
5. Review the price display

### Expected Results:
- [ ] Per-person price is displayed clearly (e.g., "£100 per person")
- [ ] Total price is displayed prominently (e.g., "Total: £1000")
- [ ] Price breakdown shows: "£100 × 10 people = £1000"
- [ ] No division by numberOfPeople occurs in the display
- [ ] Currency formatting is consistent

### Actual Results:
```
[Record your results here]
```

---

## Test 5: QuoteForm - Package Selection

**Objective:** Verify QuoteForm receives and uses correct total price

### Steps:
1. Navigate to admin quotes page
2. Click "Create New Quote"
3. Click "Select Super Package"
4. Select a package for 10 people, 3 nights
5. Click "Select Package"
6. Review the quote form

### Expected Results:
- [ ] Total Price field shows correct total (e.g., £1000, not £100)
- [ ] Number of People field shows 10
- [ ] Package is linked correctly
- [ ] Price breakdown in form shows per-person and total
- [ ] No manual price adjustment needed

### Actual Results:
```
[Record your results here]
```

---

## Test 6: Quote Creation with Linked Package

**Objective:** Verify quote saves with correct price

### Steps:
1. Create a new quote with a linked package (10 people)
2. Fill in all required fields
3. Submit the quote
4. View the saved quote

### Expected Results:
- [ ] Quote saves successfully
- [ ] Total price is correct (e.g., £1000 for 10 people at £100/person)
- [ ] Linked package info includes `pricePerPerson`
- [ ] Linked package info includes `originalPrice` (total)
- [ ] Quote displays correct price in list view

### Actual Results:
```
[Record your results here]
```

---

## Test 7: Editing Existing Quote

**Objective:** Verify existing quotes load correctly

### Steps:
1. Open an existing quote with a linked package
2. Review the displayed prices
3. Make a minor edit (e.g., change hotel name)
4. Save the quote

### Expected Results:
- [ ] Quote loads with correct total price
- [ ] Linked package info displays correctly
- [ ] Price doesn't change unexpectedly
- [ ] Quote saves successfully

### Actual Results:
```
[Record your results here]
```

---

## Test 8: Price Recalculation

**Objective:** Verify price recalculation works correctly

### Steps:
1. Open an existing quote with a linked package
2. Click "Recalculate Price" button
3. Review the price comparison
4. Apply the new price

### Expected Results:
- [ ] Recalculation shows old vs new price
- [ ] New price is calculated correctly (per-person × people)
- [ ] Price breakdown shows per-person and total
- [ ] Applying new price updates the quote
- [ ] Price history is updated

### Actual Results:
```
[Record your results here]
```

---

## Test 9: Changing Number of People

**Objective:** Verify price updates when changing number of people

### Steps:
1. Create a new quote with a linked package (5 people)
2. Note the total price
3. Change number of people to 10
4. Observe price update

### Expected Results:
- [ ] Price updates automatically (if auto-recalculate is enabled)
- [ ] New price = per-person × new number of people
- [ ] Price sync indicator shows status
- [ ] No manual calculation needed

### Actual Results:
```
[Record your results here]
```

---

## Test 10: Price Breakdown Display

**Objective:** Verify price breakdown is clear and accurate

### Steps:
1. Create a quote with a linked package (8 people)
2. Review all price displays in the form
3. Check price summary section

### Expected Results:
- [ ] Price summary shows: "Total Price: £800"
- [ ] Price summary shows: "Price per Person: £100"
- [ ] Price summary shows: "Price per Room: £X"
- [ ] All calculations are accurate
- [ ] Display is clear and easy to understand

### Actual Results:
```
[Record your results here]
```

---

## Test 11: API Response Structure

**Objective:** Verify API returns new price structure

### Steps:
1. Open browser developer tools
2. Create a quote with a linked package
3. Review the network tab for API responses
4. Check the `/api/admin/super-packages/calculate-price` response

### Expected Results:
- [ ] Response includes `pricePerPerson` field
- [ ] Response includes `totalPrice` field
- [ ] Response includes `numberOfPeople` field
- [ ] Response includes deprecated `price` field (equals totalPrice)
- [ ] All fields have correct values

### Actual Results:
```
[Record your results here]
```

---

## Test 12: Backward Compatibility

**Objective:** Verify old quotes still work

### Steps:
1. Find an old quote created before the fix
2. Open and view the quote
3. Try to edit the quote
4. Try to recalculate price (if linked package)

### Expected Results:
- [ ] Old quote loads without errors
- [ ] Prices display correctly
- [ ] Can edit and save the quote
- [ ] Recalculation works (if applicable)
- [ ] No data loss or corruption

### Actual Results:
```
[Record your results here]
```

---

## Test 13: Edge Cases

**Objective:** Test edge cases and boundary conditions

### Test Cases:
1. **1 person at £100/person**
   - [ ] Total = £100 ✓

2. **2 people at £100/person**
   - [ ] Total = £200 ✓

3. **100 people at £50/person**
   - [ ] Total = £5000 ✓

4. **Fractional per-person price (£99.99)**
   - [ ] Total calculated correctly (e.g., £999.90 for 10 people) ✓

5. **Very large group (50+ people)**
   - [ ] Calculation works correctly ✓
   - [ ] No overflow or precision errors ✓

### Actual Results:
```
[Record your results here]
```

---

## Test 14: Error Handling

**Objective:** Verify error handling for invalid scenarios

### Test Cases:
1. **Package not found**
   - [ ] Clear error message displayed ✓

2. **Invalid number of people (0 or negative)**
   - [ ] Validation error shown ✓

3. **No pricing tier for group size**
   - [ ] Helpful error message with available tiers ✓

4. **No pricing for arrival date**
   - [ ] Clear error message ✓

### Actual Results:
```
[Record your results here]
```

---

## Test 15: Console Validation

**Objective:** Verify validation logging works

### Steps:
1. Open browser console
2. Create a quote with a linked package
3. Review console for validation messages

### Expected Results:
- [ ] No validation errors in console
- [ ] If validation fails, clear error messages logged
- [ ] Validation checks totalPrice >= pricePerPerson
- [ ] Validation checks totalPrice = pricePerPerson × numberOfPeople

### Actual Results:
```
[Record your results here]
```

---

## Summary

### Tests Passed: __ / 15

### Critical Issues Found:
```
[List any critical issues that block functionality]
```

### Minor Issues Found:
```
[List any minor issues or improvements needed]
```

### Overall Assessment:
- [ ] All critical functionality works correctly
- [ ] Price calculations are accurate
- [ ] UI displays are clear and correct
- [ ] API responses have correct structure
- [ ] Backward compatibility maintained
- [ ] Ready for production deployment

### Sign-off:
- Tested by: _______________
- Date: _______________
- Status: [ ] PASS [ ] FAIL [ ] NEEDS WORK
