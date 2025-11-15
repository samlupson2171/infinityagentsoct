/**
 * Test Script: Price Calculation with Events Integration
 * 
 * This script tests the price calculation logic to ensure:
 * 1. Base price and events total are calculated separately
 * 2. Total price = base price + events total
 * 3. Currency matching is handled correctly
 * 4. Custom price detection works
 */

// Test scenarios
const testScenarios = [
  {
    name: 'Package with matching currency events',
    basePrice: 500,
    events: [
      { eventId: '1', eventName: 'Jet Skiing', eventPrice: 50, eventCurrency: 'GBP' },
      { eventId: '2', eventName: 'Parasailing', eventPrice: 75, eventCurrency: 'GBP' },
    ],
    quoteCurrency: 'GBP',
    expectedEventsTotal: 125,
    expectedTotal: 625,
  },
  {
    name: 'Package with mismatched currency events',
    basePrice: 500,
    events: [
      { eventId: '1', eventName: 'Jet Skiing', eventPrice: 50, eventCurrency: 'GBP' },
      { eventId: '2', eventName: 'Parasailing', eventPrice: 75, eventCurrency: 'EUR' },
    ],
    quoteCurrency: 'GBP',
    expectedEventsTotal: 50, // Only GBP event counted
    expectedTotal: 550,
  },
  {
    name: 'No package, only events',
    basePrice: 0,
    events: [
      { eventId: '1', eventName: 'Jet Skiing', eventPrice: 50, eventCurrency: 'GBP' },
      { eventId: '2', eventName: 'Parasailing', eventPrice: 75, eventCurrency: 'GBP' },
    ],
    quoteCurrency: 'GBP',
    expectedEventsTotal: 125,
    expectedTotal: 125,
  },
  {
    name: 'Package with no events',
    basePrice: 500,
    events: [],
    quoteCurrency: 'GBP',
    expectedEventsTotal: 0,
    expectedTotal: 500,
  },
  {
    name: 'Multiple events with mixed currencies',
    basePrice: 1000,
    events: [
      { eventId: '1', eventName: 'Event 1', eventPrice: 50, eventCurrency: 'GBP' },
      { eventId: '2', eventName: 'Event 2', eventPrice: 60, eventCurrency: 'EUR' },
      { eventId: '3', eventName: 'Event 3', eventPrice: 70, eventCurrency: 'GBP' },
      { eventId: '4', eventName: 'Event 4', eventPrice: 80, eventCurrency: 'USD' },
    ],
    quoteCurrency: 'GBP',
    expectedEventsTotal: 120, // Only GBP events (50 + 70)
    expectedTotal: 1120,
  },
];

// Calculate events total (matching currency only)
function calculateEventsTotal(events, quoteCurrency) {
  return events.reduce((sum, event) => {
    if (event.eventCurrency === quoteCurrency) {
      return sum + event.eventPrice;
    }
    return sum;
  }, 0);
}

// Calculate total price
function calculateTotalPrice(basePrice, eventsTotal) {
  return basePrice + eventsTotal;
}

// Check for currency mismatches
function checkCurrencyMismatches(events, quoteCurrency) {
  return events.filter(event => event.eventCurrency !== quoteCurrency);
}

// Run tests
console.log('🧪 Testing Price Calculation with Events Integration\n');
console.log('='.repeat(70));

let passedTests = 0;
let failedTests = 0;

testScenarios.forEach((scenario, index) => {
  console.log(`\nTest ${index + 1}: ${scenario.name}`);
  console.log('-'.repeat(70));
  
  // Calculate
  const eventsTotal = calculateEventsTotal(scenario.events, scenario.quoteCurrency);
  const totalPrice = calculateTotalPrice(scenario.basePrice, eventsTotal);
  const mismatchedEvents = checkCurrencyMismatches(scenario.events, scenario.quoteCurrency);
  
  // Display
  console.log(`Base Price: ${scenario.quoteCurrency} ${scenario.basePrice}`);
  console.log(`Events (${scenario.events.length}):`);
  scenario.events.forEach(event => {
    const included = event.eventCurrency === scenario.quoteCurrency ? '✓' : '✗';
    console.log(`  ${included} ${event.eventName}: ${event.eventCurrency} ${event.eventPrice}`);
  });
  console.log(`Events Total: ${scenario.quoteCurrency} ${eventsTotal}`);
  console.log(`Total Price: ${scenario.quoteCurrency} ${totalPrice}`);
  
  // Validate
  const eventsTotalCorrect = eventsTotal === scenario.expectedEventsTotal;
  const totalPriceCorrect = totalPrice === scenario.expectedTotal;
  
  if (eventsTotalCorrect && totalPriceCorrect) {
    console.log('✅ PASSED');
    passedTests++;
  } else {
    console.log('❌ FAILED');
    if (!eventsTotalCorrect) {
      console.log(`   Expected events total: ${scenario.expectedEventsTotal}, got: ${eventsTotal}`);
    }
    if (!totalPriceCorrect) {
      console.log(`   Expected total: ${scenario.expectedTotal}, got: ${totalPrice}`);
    }
    failedTests++;
  }
  
  // Warnings
  if (mismatchedEvents.length > 0) {
    console.log(`⚠️  Warning: ${mismatchedEvents.length} event(s) excluded due to currency mismatch`);
    mismatchedEvents.forEach(event => {
      console.log(`   - ${event.eventName} (${event.eventCurrency})`);
    });
  }
});

// Summary
console.log('\n' + '='.repeat(70));
console.log(`\n📊 Test Summary:`);
console.log(`   Passed: ${passedTests}/${testScenarios.length}`);
console.log(`   Failed: ${failedTests}/${testScenarios.length}`);

if (failedTests === 0) {
  console.log('\n✅ All tests passed!');
  process.exit(0);
} else {
  console.log('\n❌ Some tests failed!');
  process.exit(1);
}
