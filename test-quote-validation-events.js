/**
 * Test script to verify quote validation with selectedEvents
 */

const { quoteFormValidationSchema, QUOTE_BUSINESS_RULES } = require('./src/lib/validation/quote-validation.ts');

console.log('Testing Quote Validation with Selected Events\n');
console.log('='.repeat(50));

// Test 1: Valid quote with events
console.log('\n✓ Test 1: Valid quote with selected events');
const validQuoteWithEvents = {
  enquiryId: '507f1f77bcf86cd799439011',
  title: 'Weekend Getaway',
  destination: 'Benidorm',
  leadName: 'John Doe',
  hotelName: 'Hotel Paradise',
  numberOfPeople: 4,
  numberOfRooms: 2,
  numberOfNights: 3,
  arrivalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  isSuperPackage: false,
  whatsIncluded: 'Accommodation, breakfast, and transfers',
  transferIncluded: true,
  totalPrice: 800,
  currency: 'GBP',
  selectedEvents: [
    {
      eventId: '507f1f77bcf86cd799439012',
      eventName: 'Jet Skiing',
      eventPrice: 50,
      eventCurrency: 'GBP',
      addedAt: new Date().toISOString(),
    },
    {
      eventId: '507f1f77bcf86cd799439013',
      eventName: 'Parasailing',
      eventPrice: 75,
      eventCurrency: 'GBP',
      addedAt: new Date().toISOString(),
    },
  ],
};

try {
  const result = quoteFormValidationSchema.parse(validQuoteWithEvents);
  console.log('  ✓ Validation passed');
  console.log(`  ✓ Events count: ${result.selectedEvents?.length || 0}`);
} catch (error) {
  console.log('  ✗ Validation failed:', error.errors);
}

// Test 2: Quote with too many events (should fail)
console.log('\n✓ Test 2: Quote with too many events (should fail)');
const tooManyEvents = Array.from({ length: 21 }, (_, i) => ({
  eventId: '507f1f77bcf86cd799439012',
  eventName: `Event ${i + 1}`,
  eventPrice: 50,
  eventCurrency: 'GBP',
  addedAt: new Date().toISOString(),
}));

const quoteWithTooManyEvents = {
  ...validQuoteWithEvents,
  selectedEvents: tooManyEvents,
};

try {
  quoteFormValidationSchema.parse(quoteWithTooManyEvents);
  console.log('  ✗ Should have failed validation');
} catch (error) {
  console.log('  ✓ Correctly rejected (max events limit)');
  console.log(`  ✓ Max events allowed: ${QUOTE_BUSINESS_RULES.MAX_EVENTS}`);
}

// Test 3: Quote with invalid event ID format (should fail)
console.log('\n✓ Test 3: Quote with invalid event ID (should fail)');
const quoteWithInvalidEventId = {
  ...validQuoteWithEvents,
  selectedEvents: [
    {
      eventId: 'invalid-id',
      eventName: 'Test Event',
      eventPrice: 50,
      eventCurrency: 'GBP',
    },
  ],
};

try {
  quoteFormValidationSchema.parse(quoteWithInvalidEventId);
  console.log('  ✗ Should have failed validation');
} catch (error) {
  console.log('  ✓ Correctly rejected (invalid event ID format)');
}

// Test 4: Quote with negative event price (should fail)
console.log('\n✓ Test 4: Quote with negative event price (should fail)');
const quoteWithNegativePrice = {
  ...validQuoteWithEvents,
  selectedEvents: [
    {
      eventId: '507f1f77bcf86cd799439012',
      eventName: 'Test Event',
      eventPrice: -50,
      eventCurrency: 'GBP',
    },
  ],
};

try {
  quoteFormValidationSchema.parse(quoteWithNegativePrice);
  console.log('  ✗ Should have failed validation');
} catch (error) {
  console.log('  ✓ Correctly rejected (negative event price)');
}

// Test 5: Quote without events (should pass - events are optional)
console.log('\n✓ Test 5: Quote without events (should pass)');
const quoteWithoutEvents = {
  ...validQuoteWithEvents,
  selectedEvents: undefined,
};

try {
  const result = quoteFormValidationSchema.parse(quoteWithoutEvents);
  console.log('  ✓ Validation passed (events are optional)');
} catch (error) {
  console.log('  ✗ Validation failed:', error.errors);
}

// Test 6: Quote with empty events array (should pass)
console.log('\n✓ Test 6: Quote with empty events array (should pass)');
const quoteWithEmptyEvents = {
  ...validQuoteWithEvents,
  selectedEvents: [],
};

try {
  const result = quoteFormValidationSchema.parse(quoteWithEmptyEvents);
  console.log('  ✓ Validation passed (empty events array is valid)');
} catch (error) {
  console.log('  ✗ Validation failed:', error.errors);
}

// Test 7: Verify activitiesIncluded is optional
console.log('\n✓ Test 7: Quote without activitiesIncluded (should pass)');
const quoteWithoutActivities = {
  ...validQuoteWithEvents,
  activitiesIncluded: undefined,
};

try {
  const result = quoteFormValidationSchema.parse(quoteWithoutActivities);
  console.log('  ✓ Validation passed (activitiesIncluded is optional)');
} catch (error) {
  console.log('  ✗ Validation failed:', error.errors);
}

console.log('\n' + '='.repeat(50));
console.log('✓ All validation tests completed\n');
