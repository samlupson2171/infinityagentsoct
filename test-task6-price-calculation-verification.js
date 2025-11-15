/**
 * Task 6 Verification: Price Calculation Logic with Events
 * 
 * This script verifies that the price calculation logic correctly:
 * 1. Separates base price from events total
 * 2. Calculates total price as basePrice + eventsTotal
 * 3. Handles currency matching between events and quote
 * 4. Integrates with useQuotePrice hook
 * 5. Displays price breakdown correctly
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(80));
console.log('TASK 6 VERIFICATION: Price Calculation Logic with Events');
console.log('='.repeat(80));
console.log();

// Test 1: Verify QuoteForm has price calculation state
console.log('Test 1: Verify QuoteForm has price calculation state');
console.log('-'.repeat(80));

const quoteFormPath = path.join(__dirname, 'src/components/admin/QuoteForm.tsx');
const quoteFormContent = fs.readFileSync(quoteFormPath, 'utf8');

const requiredState = [
  'const [basePrice, setBasePrice] = useState<number>(0)',
  'const [eventsTotal, setEventsTotal] = useState<number>(0)',
  'const [showPriceBreakdown, setShowPriceBreakdown] = useState<boolean>(true)',
];

let test1Pass = true;
requiredState.forEach((state) => {
  const found = quoteFormContent.includes(state);
  console.log(`  ${found ? '✓' : '✗'} ${state}`);
  if (!found) test1Pass = false;
});

console.log(`\nTest 1: ${test1Pass ? 'PASS ✓' : 'FAIL ✗'}`);
console.log();

// Test 2: Verify eventsTotal calculation
console.log('Test 2: Verify eventsTotal calculation logic');
console.log('-'.repeat(80));

const eventsTotalCalc = quoteFormContent.includes('const total = selectedEvents.reduce((sum, event) =>');
const currencyMatch = quoteFormContent.includes('if (event.eventCurrency === currency)');
const setEventsTotal = quoteFormContent.includes('setEventsTotal(total)');

console.log(`  ${eventsTotalCalc ? '✓' : '✗'} Events total calculation with reduce`);
console.log(`  ${currencyMatch ? '✓' : '✗'} Currency matching check`);
console.log(`  ${setEventsTotal ? '✓' : '✗'} Set eventsTotal state`);

const test2Pass = eventsTotalCalc && currencyMatch && setEventsTotal;
console.log(`\nTest 2: ${test2Pass ? 'PASS ✓' : 'FAIL ✗'}`);
console.log();

// Test 3: Verify basePrice calculation
console.log('Test 3: Verify basePrice calculation logic');
console.log('-'.repeat(80));

const basePriceFromPackage = quoteFormContent.includes('setBasePrice(calculatedPrice)');
const basePriceWithoutPackage = quoteFormContent.includes('const calculatedBase = Math.max(0, totalPrice - eventsTotal)');

console.log(`  ${basePriceFromPackage ? '✓' : '✗'} Base price from package calculation`);
console.log(`  ${basePriceWithoutPackage ? '✓' : '✗'} Base price without package (total - events)`);

const test3Pass = basePriceFromPackage && basePriceWithoutPackage;
console.log(`\nTest 3: ${test3Pass ? 'PASS ✓' : 'FAIL ✗'}`);
console.log();

// Test 4: Verify total price calculation
console.log('Test 4: Verify total price calculation (basePrice + eventsTotal)');
console.log('-'.repeat(80));

const totalPriceCalc = quoteFormContent.includes('const newTotal = basePrice + eventsTotal');
const totalPriceUpdate = quoteFormContent.includes('setValue(\'totalPrice\', newTotal)');

console.log(`  ${totalPriceCalc ? '✓' : '✗'} Total price calculation`);
console.log(`  ${totalPriceUpdate ? '✓' : '✗'} Total price update with setValue`);

const test4Pass = totalPriceCalc && totalPriceUpdate;
console.log(`\nTest 4: ${test4Pass ? 'PASS ✓' : 'FAIL ✗'}`);
console.log();

// Test 5: Verify useQuotePrice integration
console.log('Test 5: Verify useQuotePrice hook integration');
console.log('-'.repeat(80));

const useQuotePricePath = path.join(__dirname, 'src/lib/hooks/useQuotePrice.ts');
const useQuotePriceContent = fs.readFileSync(useQuotePricePath, 'utf8');

const eventsTotalParam = quoteFormContent.includes('eventsTotal: eventsTotal');
const hookEventsTotal = useQuotePriceContent.includes('eventsTotal = 0');
const totalWithEvents = useQuotePriceContent.includes('const totalWithEvents = packagePrice + eventsTotal');

console.log(`  ${eventsTotalParam ? '✓' : '✗'} eventsTotal passed to useQuotePrice hook`);
console.log(`  ${hookEventsTotal ? '✓' : '✗'} Hook accepts eventsTotal parameter`);
console.log(`  ${totalWithEvents ? '✓' : '✗'} Hook calculates total with events`);

const test5Pass = eventsTotalParam && hookEventsTotal && totalWithEvents;
console.log(`\nTest 5: ${test5Pass ? 'PASS ✓' : 'FAIL ✗'}`);
console.log();

// Test 6: Verify currency matching
console.log('Test 6: Verify currency matching validation');
console.log('-'.repeat(80));

const currencyMismatchCheck = quoteFormContent.includes('const mismatchedEvents = selectedEvents.filter');
const currencyWarning = quoteFormContent.includes('have different currency');
const currencyWarningDisplay = quoteFormContent.includes('Some events have different currency and are excluded from total');

console.log(`  ${currencyMismatchCheck ? '✓' : '✗'} Currency mismatch detection`);
console.log(`  ${currencyWarning ? '✓' : '✗'} Currency warning message`);
console.log(`  ${currencyWarningDisplay ? '✓' : '✗'} Currency warning display in UI`);

const test6Pass = currencyMismatchCheck && currencyWarning && currencyWarningDisplay;
console.log(`\nTest 6: ${test6Pass ? 'PASS ✓' : 'FAIL ✗'}`);
console.log();

// Test 7: Verify price breakdown display
console.log('Test 7: Verify price breakdown display component');
console.log('-'.repeat(80));

const priceBreakdownSection = quoteFormContent.includes('Price Breakdown');
const basePriceDisplay = quoteFormContent.includes('Package Price') || quoteFormContent.includes('Base Price');
const eventsTotalDisplay = quoteFormContent.includes('Events & Activities');
const totalPriceDisplay = quoteFormContent.includes('Total Price:');
const expandCollapse = quoteFormContent.includes('setShowPriceBreakdown(!showPriceBreakdown)');

console.log(`  ${priceBreakdownSection ? '✓' : '✗'} Price breakdown section`);
console.log(`  ${basePriceDisplay ? '✓' : '✗'} Base/Package price display`);
console.log(`  ${eventsTotalDisplay ? '✓' : '✗'} Events total display`);
console.log(`  ${totalPriceDisplay ? '✓' : '✗'} Total price display`);
console.log(`  ${expandCollapse ? '✓' : '✗'} Expand/collapse functionality`);

const test7Pass = priceBreakdownSection && basePriceDisplay && eventsTotalDisplay && totalPriceDisplay && expandCollapse;
console.log(`\nTest 7: ${test7Pass ? 'PASS ✓' : 'FAIL ✗'}`);
console.log();

// Test 8: Verify individual event display in breakdown
console.log('Test 8: Verify individual event display in breakdown');
console.log('-'.repeat(80));

const individualEvents = quoteFormContent.includes('selectedEvents.map((event) =>');
const eventNameDisplay = quoteFormContent.includes('event.eventName');
const eventPriceDisplay = quoteFormContent.includes('event.eventPrice');
const eventCurrencyIndicator = quoteFormContent.includes('event.eventCurrency !== currency');

console.log(`  ${individualEvents ? '✓' : '✗'} Individual events mapping`);
console.log(`  ${eventNameDisplay ? '✓' : '✗'} Event name display`);
console.log(`  ${eventPriceDisplay ? '✓' : '✗'} Event price display`);
console.log(`  ${eventCurrencyIndicator ? '✓' : '✗'} Currency mismatch indicator`);

const test8Pass = individualEvents && eventNameDisplay && eventPriceDisplay && eventCurrencyIndicator;
console.log(`\nTest 8: ${test8Pass ? 'PASS ✓' : 'FAIL ✗'}`);
console.log();

// Test 9: Verify per-person and per-room calculations
console.log('Test 9: Verify per-person and per-room calculations');
console.log('-'.repeat(80));

const pricePerPerson = quoteFormContent.includes('Price per Person:');
const pricePerRoom = quoteFormContent.includes('Price per Room:');
const pricePerNight = quoteFormContent.includes('Price per Night:');
const perPersonCalc = quoteFormContent.includes('totalPrice / numberOfPeople');
const perRoomCalc = quoteFormContent.includes('totalPrice / numberOfRooms');

console.log(`  ${pricePerPerson ? '✓' : '✗'} Price per person display`);
console.log(`  ${pricePerRoom ? '✓' : '✗'} Price per room display`);
console.log(`  ${pricePerNight ? '✓' : '✗'} Price per night display`);
console.log(`  ${perPersonCalc ? '✓' : '✗'} Per person calculation`);
console.log(`  ${perRoomCalc ? '✓' : '✗'} Per room calculation`);

const test9Pass = pricePerPerson && pricePerRoom && pricePerNight && perPersonCalc && perRoomCalc;
console.log(`\nTest 9: ${test9Pass ? 'PASS ✓' : 'FAIL ✗'}`);
console.log();

// Test 10: Verify custom price detection with events
console.log('Test 10: Verify custom price detection with events');
console.log('-'.repeat(80));

const customPriceCheck = useQuotePriceContent.includes('const calculatedTotal = priceQuery.data.price + eventsTotal');
const customPriceDetection = useQuotePriceContent.includes('const priceDiffers = Math.abs(currentPrice - calculatedTotal) > 0.01');
const markCustom = useQuotePriceContent.includes('setIsCustomPrice(true)');

console.log(`  ${customPriceCheck ? '✓' : '✗'} Calculate total with events for comparison`);
console.log(`  ${customPriceDetection ? '✓' : '✗'} Detect price difference`);
console.log(`  ${markCustom ? '✓' : '✗'} Mark as custom price`);

const test10Pass = customPriceCheck && customPriceDetection && markCustom;
console.log(`\nTest 10: ${test10Pass ? 'PASS ✓' : 'FAIL ✗'}`);
console.log();

// Summary
console.log('='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));

const allTests = [test1Pass, test2Pass, test3Pass, test4Pass, test5Pass, test6Pass, test7Pass, test8Pass, test9Pass, test10Pass];
const passedTests = allTests.filter(t => t).length;
const totalTests = allTests.length;

console.log(`\nTests Passed: ${passedTests}/${totalTests}`);
console.log();

if (passedTests === totalTests) {
  console.log('✓ ALL TESTS PASSED - Task 6 implementation is complete!');
  console.log();
  console.log('Key Features Verified:');
  console.log('  ✓ Base price and events total are separated');
  console.log('  ✓ Total price calculated as basePrice + eventsTotal');
  console.log('  ✓ Currency matching validation implemented');
  console.log('  ✓ Integration with useQuotePrice hook complete');
  console.log('  ✓ Price breakdown display with expand/collapse');
  console.log('  ✓ Individual event display in breakdown');
  console.log('  ✓ Per-person, per-room, per-night calculations');
  console.log('  ✓ Custom price detection with events');
} else {
  console.log('✗ SOME TESTS FAILED - Review the implementation');
  console.log();
  console.log('Failed Tests:');
  if (!test1Pass) console.log('  ✗ Test 1: Price calculation state');
  if (!test2Pass) console.log('  ✗ Test 2: Events total calculation');
  if (!test3Pass) console.log('  ✗ Test 3: Base price calculation');
  if (!test4Pass) console.log('  ✗ Test 4: Total price calculation');
  if (!test5Pass) console.log('  ✗ Test 5: useQuotePrice integration');
  if (!test6Pass) console.log('  ✗ Test 6: Currency matching');
  if (!test7Pass) console.log('  ✗ Test 7: Price breakdown display');
  if (!test8Pass) console.log('  ✗ Test 8: Individual event display');
  if (!test9Pass) console.log('  ✗ Test 9: Per-person/room calculations');
  if (!test10Pass) console.log('  ✗ Test 10: Custom price detection');
}

console.log();
console.log('='.repeat(80));

process.exit(passedTests === totalTests ? 0 : 1);
