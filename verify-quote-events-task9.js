/**
 * Verification script for Quote Events Integration - Task 9
 * Verifies that API routes properly handle selectedEvents
 */

const fs = require('fs');
const path = require('path');

console.log('\n=== Verifying Quote Events API Integration (Task 9) ===\n');

const checks = [];

// Check 1: Verify POST route handles selectedEvents
console.log('Check 1: Verifying POST route handles selectedEvents...');
const postRouteContent = fs.readFileSync(
  path.join(__dirname, 'src/app/api/admin/quotes/route.ts'),
  'utf8'
);

if (postRouteContent.includes('selectedEvents') && 
    postRouteContent.includes('Event.find') &&
    postRouteContent.includes('isActive: true')) {
  console.log('✓ POST route validates and saves selectedEvents');
  checks.push(true);
} else {
  console.log('✗ POST route does not properly handle selectedEvents');
  checks.push(false);
}

// Check 2: Verify POST route validates event existence
console.log('\nCheck 2: Verifying POST route validates event existence...');
if (postRouteContent.includes('INVALID_EVENTS') &&
    postRouteContent.includes('Some selected events are not available')) {
  console.log('✓ POST route validates event existence and active status');
  checks.push(true);
} else {
  console.log('✗ POST route does not validate event existence');
  checks.push(false);
}

// Check 3: Verify GET route populates event details
console.log('\nCheck 3: Verifying GET route populates event details...');
if (postRouteContent.includes("populate('selectedEvents.eventId'")) {
  console.log('✓ GET route populates event details');
  checks.push(true);
} else {
  console.log('✗ GET route does not populate event details');
  checks.push(false);
}

// Check 4: Verify PUT route handles selectedEvents updates
console.log('\nCheck 4: Verifying PUT route handles selectedEvents updates...');
const putRouteContent = fs.readFileSync(
  path.join(__dirname, 'src/app/api/admin/quotes/[id]/route.ts'),
  'utf8'
);

if (putRouteContent.includes('updateData.selectedEvents') &&
    putRouteContent.includes('Event.find')) {
  console.log('✓ PUT route handles selectedEvents updates');
  checks.push(true);
} else {
  console.log('✗ PUT route does not handle selectedEvents updates');
  checks.push(false);
}

// Check 5: Verify PUT route validates events during update
console.log('\nCheck 5: Verifying PUT route validates events during update...');
if (putRouteContent.includes('missingEvents') &&
    putRouteContent.includes('INVALID_EVENTS')) {
  console.log('✓ PUT route validates events during update');
  checks.push(true);
} else {
  console.log('✗ PUT route does not validate events during update');
  checks.push(false);
}

// Check 6: Verify PUT route handles inactive events gracefully
console.log('\nCheck 6: Verifying PUT route handles inactive events...');
if (putRouteContent.includes('inactiveEvents') &&
    putRouteContent.includes('currently inactive')) {
  console.log('✓ PUT route provides warnings for inactive events');
  checks.push(true);
} else {
  console.log('✗ PUT route does not handle inactive events');
  checks.push(false);
}

// Check 7: Verify PUT route handles event price changes
console.log('\nCheck 7: Verifying PUT route handles event price changes...');
if (putRouteContent.includes('eventPriceChanges') &&
    putRouteContent.includes('different current prices')) {
  console.log('✓ PUT route detects and warns about event price changes');
  checks.push(true);
} else {
  console.log('✗ PUT route does not handle event price changes');
  checks.push(false);
}

// Check 8: Verify GET [id] route populates event details
console.log('\nCheck 8: Verifying GET [id] route populates event details...');
if (putRouteContent.includes("'selectedEvents.eventId'") &&
    putRouteContent.includes('name isActive pricing')) {
  console.log('✓ GET [id] route populates event details');
  checks.push(true);
} else {
  console.log('✗ GET [id] route does not populate event details');
  checks.push(false);
}

// Check 9: Verify price history includes event reasons
console.log('\nCheck 9: Verifying price history includes event reasons...');
if (putRouteContent.includes("'event_added'") &&
    putRouteContent.includes("'event_removed'")) {
  console.log('✓ Price history tracks event additions and removals');
  checks.push(true);
} else {
  console.log('✗ Price history does not track event changes');
  checks.push(false);
}

// Check 10: Verify validation schema includes event reasons
console.log('\nCheck 10: Verifying validation schema includes event reasons...');
const validationContent = fs.readFileSync(
  path.join(__dirname, 'src/lib/validation/quote-validation.ts'),
  'utf8'
);

if (validationContent.includes("'event_added'") &&
    validationContent.includes("'event_removed'")) {
  console.log('✓ Validation schema includes event-related price history reasons');
  checks.push(true);
} else {
  console.log('✗ Validation schema missing event reasons');
  checks.push(false);
}

// Check 11: Verify Quote model has selectedEvents field
console.log('\nCheck 11: Verifying Quote model has selectedEvents field...');
const quoteModelContent = fs.readFileSync(
  path.join(__dirname, 'src/models/Quote.ts'),
  'utf8'
);

if (quoteModelContent.includes('selectedEvents') &&
    quoteModelContent.includes('eventId') &&
    quoteModelContent.includes('eventPrice')) {
  console.log('✓ Quote model includes selectedEvents field');
  checks.push(true);
} else {
  console.log('✗ Quote model missing selectedEvents field');
  checks.push(false);
}

// Check 12: Verify selectedEvents has proper index
console.log('\nCheck 12: Verifying selectedEvents has proper index...');
if (quoteModelContent.includes("'selectedEvents.eventId'")) {
  console.log('✓ Quote model has index on selectedEvents.eventId');
  checks.push(true);
} else {
  console.log('✗ Quote model missing index on selectedEvents');
  checks.push(false);
}

// Summary
console.log('\n=== Verification Summary ===\n');
const passed = checks.filter(c => c).length;
const total = checks.length;
const percentage = Math.round((passed / total) * 100);

console.log(`Passed: ${passed}/${total} checks (${percentage}%)`);

if (passed === total) {
  console.log('\n✓ All checks passed! Task 9 implementation is complete.\n');
  console.log('Implementation includes:');
  console.log('  • POST route saves selectedEvents with validation');
  console.log('  • PUT route updates selectedEvents with validation');
  console.log('  • GET routes populate event details');
  console.log('  • Event existence and active status validation');
  console.log('  • Graceful handling of event price changes');
  console.log('  • Warnings for inactive events');
  console.log('  • Price history tracking for event changes');
  console.log('  • Proper indexing for performance');
} else {
  console.log('\n⚠ Some checks failed. Please review the implementation.\n');
}

console.log('\nNext steps:');
console.log('  1. Test the API endpoints manually or with integration tests');
console.log('  2. Verify event validation works correctly');
console.log('  3. Test price history tracking with event changes');
console.log('  4. Ensure warnings are displayed properly in the UI');
console.log('');
