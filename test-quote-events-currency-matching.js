/**
 * Test script to verify currency matching between events and quote
 * Events with mismatched currencies should be excluded from the total
 */

// Test scenarios
const testScenarios = [
  {
    name: 'All events match quote currency (GBP)',
    quoteCurrency: 'GBP',
    events: [
      { name: 'Event 1', price: 50, currency: 'GBP' },
      { name: 'Event 2', price: 75, currency: 'GBP' },
      { name: 'Event 3', price: 25, currency: 'GBP' },
    ],
    expectedTotal: 150,
    expectedWarnings: 0,
  },
  {
    name: 'One event has mismatched currency',
    quoteCurrency: 'GBP',
    events: [
      { name: 'Event 1', price: 50, currency: 'GBP' },
      { name: 'Event 2', price: 75, currency: 'EUR' }, // Mismatch
      { name: 'Event 3', price: 25, currency: 'GBP' },
    ],
    expectedTotal: 75, // Only GBP events
    expectedWarnings: 1,
  },
  {
    name: 'All events have mismatched currency',
    quoteCurrency: 'GBP',
    events: [
      { name: 'Event 1', price: 50, currency: 'EUR' },
      { name: 'Event 2', price: 75, currency: 'USD' },
      { name: 'Event 3', price: 25, currency: 'EUR' },
    ],
    expectedTotal: 0, // No matching events
    expectedWarnings: 3,
  },
  {
    name: 'Quote currency changes to EUR',
    quoteCurrency: 'EUR',
    events: [
      { name: 'Event 1', price: 50, currency: 'GBP' },
      { name: 'Event 2', price: 75, currency: 'EUR' },
      { name: 'Event 3', price: 25, currency: 'EUR' },
    ],
    expectedTotal: 100, // Only EUR events
    expectedWarnings: 1,
  },
  {
    name: 'No events selected',
    quoteCurrency: 'GBP',
    events: [],
    expectedTotal: 0,
    expectedWarnings: 0,
  },
];

console.log('Testing Quote Events Currency Matching\n');
console.log('='.repeat(70));

let passed = 0;
let failed = 0;

testScenarios.forEach((scenario) => {
  // Calculate events total (only matching currency)
  const eventsTotal = scenario.events.reduce((sum, event) => {
    if (event.currency === scenario.quoteCurrency) {
      return sum + event.price;
    }
    return sum;
  }, 0);
  
  // Count mismatched events
  const mismatchedEvents = scenario.events.filter(
    (event) => event.currency !== scenario.quoteCurrency
  );
  
  const totalCorrect = eventsTotal === scenario.expectedTotal;
  const warningsCorrect = mismatchedEvents.length === scenario.expectedWarnings;
  const isCorrect = totalCorrect && warningsCorrect;
  
  console.log(`\nTest: ${scenario.name}`);
  console.log(`  Quote Currency: ${scenario.quoteCurrency}`);
  console.log(`  Events:`);
  scenario.events.forEach((event) => {
    const included = event.currency === scenario.quoteCurrency ? '✓' : '✗';
    console.log(`    ${included} ${event.name}: ${event.currency} ${event.price}`);
  });
  console.log(`  Expected Total: ${scenario.expectedTotal}`);
  console.log(`  Calculated Total: ${eventsTotal}`);
  console.log(`  Expected Warnings: ${scenario.expectedWarnings}`);
  console.log(`  Actual Warnings: ${mismatchedEvents.length}`);
  console.log(`  Result: ${isCorrect ? '✓ PASS' : '✗ FAIL'}`);
  
  if (isCorrect) {
    passed++;
  } else {
    failed++;
    if (!totalCorrect) {
      console.log(`    ✗ Total mismatch: expected ${scenario.expectedTotal}, got ${eventsTotal}`);
    }
    if (!warningsCorrect) {
      console.log(`    ✗ Warnings mismatch: expected ${scenario.expectedWarnings}, got ${mismatchedEvents.length}`);
    }
  }
});

console.log('\n' + '='.repeat(70));
console.log(`\nTest Summary:`);
console.log(`  Total Tests: ${testScenarios.length}`);
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);
console.log(`  Success Rate: ${((passed / testScenarios.length) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('\n✓ All tests passed! Currency matching logic is correct.');
  process.exit(0);
} else {
  console.log('\n✗ Some tests failed. Please review the implementation.');
  process.exit(1);
}
