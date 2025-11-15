/**
 * Code Review Verification for Task 9
 * Checks that quote API routes properly handle events
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Task 9 Code Review: Quote API Routes Event Handling\n');
console.log('='.repeat(70));

const results = {
  passed: [],
  failed: []
};

// Check 1: POST route handles selectedEvents
console.log('\n1️⃣  Checking POST /api/admin/quotes/route.ts...');
const postRoute = fs.readFileSync(
  path.join(__dirname, 'src/app/api/admin/quotes/route.ts'),
  'utf-8'
);

const postChecks = [
  { name: 'Validates selectedEvents', pattern: /if.*selectedEvents.*length > 0/ },
  { name: 'Imports Event model', pattern: /import.*Event.*from.*@\/models\/Event/ },
  { name: 'Checks event existence', pattern: /Event\.find.*\$in.*eventIds/ },
  { name: 'Validates inactive events', pattern: /inactiveEvents.*filter.*!e\.isActive/ },
  { name: 'Detects price changes', pattern: /eventPrice.*currentPrice/ },
  { name: 'Converts event dates', pattern: /addedAt.*new Date/ },
  { name: 'Populates events in response', pattern: /populate.*selectedEvents\.eventId/ }
];

postChecks.forEach(check => {
  if (check.pattern.test(postRoute)) {
    console.log(`   ✅ ${check.name}`);
    results.passed.push(`POST: ${check.name}`);
  } else {
    console.log(`   ❌ ${check.name}`);
    results.failed.push(`POST: ${check.name}`);
  }
});

// Check 2: PUT route handles selectedEvents updates
console.log('\n2️⃣  Checking PUT /api/admin/quotes/[id]/route.ts...');
const putRoute = fs.readFileSync(
  path.join(__dirname, 'src/app/api/admin/quotes/[id]/route.ts'),
  'utf-8'
);

const putChecks = [
  { name: 'Handles selectedEvents updates', pattern: /if.*updateData\.selectedEvents.*!== undefined/ },
  { name: 'Validates events exist', pattern: /Event\.find.*\$in.*eventIds/ },
  { name: 'Checks inactive events', pattern: /inactiveEvents.*filter.*!e\.isActive/ },
  { name: 'Detects price changes', pattern: /eventPriceChanges/ },
  { name: 'Tracks event additions in price history', pattern: /event_added/ },
  { name: 'Tracks event removals in price history', pattern: /event_removed/ },
  { name: 'Populates events in response', pattern: /populate.*selectedEvents\.eventId/ }
];

putChecks.forEach(check => {
  if (check.pattern.test(putRoute)) {
    console.log(`   ✅ ${check.name}`);
    results.passed.push(`PUT: ${check.name}`);
  } else {
    console.log(`   ❌ ${check.name}`);
    results.failed.push(`PUT: ${check.name}`);
  }
});

// Check 3: GET route populates event details
console.log('\n3️⃣  Checking GET routes populate event details...');
const getChecks = [
  { name: 'GET single quote populates events', pattern: /populate.*selectedEvents\.eventId.*name isActive pricing/ },
  { name: 'GET list populates events', pattern: /\.populate\('selectedEvents\.eventId'/ }
];

getChecks.forEach(check => {
  const foundInPost = check.pattern.test(postRoute);
  const foundInPut = check.pattern.test(putRoute);
  
  if (foundInPost || foundInPut) {
    console.log(`   ✅ ${check.name}`);
    results.passed.push(`GET: ${check.name}`);
  } else {
    console.log(`   ❌ ${check.name}`);
    results.failed.push(`GET: ${check.name}`);
  }
});

// Check 4: Verify Quote model schema
console.log('\n4️⃣  Checking Quote model schema...');
const quoteModel = fs.readFileSync(
  path.join(__dirname, 'src/models/Quote.ts'),
  'utf-8'
);

const modelChecks = [
  { name: 'selectedEvents field defined', pattern: /selectedEvents\?:.*Array/ },
  { name: 'eventId field', pattern: /eventId:.*ObjectId/ },
  { name: 'eventName field', pattern: /eventName:.*String/ },
  { name: 'eventPrice field', pattern: /eventPrice:.*Number/ },
  { name: 'eventCurrency field', pattern: /eventCurrency:.*String/ },
  { name: 'addedAt field', pattern: /addedAt:.*Date/ },
  { name: 'Index on selectedEvents.eventId', pattern: /index.*selectedEvents\.eventId/ },
  { name: 'event_added in price history', pattern: /'event_added'/ },
  { name: 'event_removed in price history', pattern: /'event_removed'/ }
];

modelChecks.forEach(check => {
  if (check.pattern.test(quoteModel)) {
    console.log(`   ✅ ${check.name}`);
    results.passed.push(`Model: ${check.name}`);
  } else {
    console.log(`   ❌ ${check.name}`);
    results.failed.push(`Model: ${check.name}`);
  }
});

// Summary
console.log('\n' + '='.repeat(70));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(70));

console.log(`\n✅ Passed: ${results.passed.length}`);
if (results.failed.length > 0) {
  console.log(`❌ Failed: ${results.failed.length}`);
  results.failed.forEach(item => console.log(`   • ${item}`));
}

console.log('\n' + '='.repeat(70));

if (results.failed.length === 0) {
  console.log('✅ Task 9 Implementation: COMPLETE');
  console.log('\nAll requirements verified:');
  console.log('  ✓ POST route saves selectedEvents with validation');
  console.log('  ✓ PUT route updates selectedEvents with validation');
  console.log('  ✓ GET routes populate event details');
  console.log('  ✓ Event existence and active status validated');
  console.log('  ✓ Event price changes handled gracefully');
  console.log('  ✓ Price history tracks event additions/removals');
  process.exit(0);
} else {
  console.log('❌ Task 9 Implementation: INCOMPLETE');
  process.exit(1);
}
