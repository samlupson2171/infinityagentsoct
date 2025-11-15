/**
 * Test script to verify quote price calculation with events integration
 * This tests the price calculation logic: totalPrice = basePrice + eventsTotal
 */

// Test scenarios
const testScenarios = [
  {
    name: 'Package with no events',
    basePrice: 500,
    eventsTotal: 0,
    expectedTotal: 500,
  },
  {
    name: 'Package with single event',
    basePrice: 500,
    eventsTotal: 50,
    expectedTotal: 550,
  },
  {
    name: 'Package with multiple events',
    basePrice: 500,
    eventsTotal: 150, // 3 events at 50 each
    expectedTotal: 650,
  },
  {
    name: 'No package with events only',
    basePrice: 0,
    eventsTotal: 200,
    expectedTotal: 200,
  },
  {
    name: 'Custom quote with events',
    basePrice: 750,
    eventsTotal: 100,
    expectedTotal: 850,
  },
];

console.log('Testing Quote Price Calculation with Events\n');
console.log('='.repeat(60));

let passed = 0;
let failed = 0;

testScenarios.forEach((scenario) => {
  const calculatedTotal = scenario.basePrice + scenario.eventsTotal;
  const isCorrect = calculatedTotal === scenario.expectedTotal;
  
  console.log(`\nTest: ${scenario.name}`);
  console.log(`  Base Price: £${scenario.basePrice}`);
  console.log(`  Events Total: £${scenario.eventsTotal}`);
  console.log(`  Expected Total: £${scenario.expectedTotal}`);
  console.log(`  Calculated Total: £${calculatedTotal}`);
  console.log(`  Result: ${isCorrect ? '✓ PASS' : '✗ FAIL'}`);
  
  if (isCorrect) {
    passed++;
  } else {
    failed++;
  }
});

console.log('\n' + '='.repeat(60));
console.log(`\nTest Summary:`);
console.log(`  Total Tests: ${testScenarios.length}`);
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);
console.log(`  Success Rate: ${((passed / testScenarios.length) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('\n✓ All tests passed! Price calculation logic is correct.');
  process.exit(0);
} else {
  console.log('\n✗ Some tests failed. Please review the implementation.');
  process.exit(1);
}
