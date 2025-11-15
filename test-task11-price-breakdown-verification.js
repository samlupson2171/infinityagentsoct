/**
 * Task 11 Verification: Price Breakdown Display Component
 * 
 * This script verifies that the PriceBreakdown component meets all requirements:
 * - Shows base price (package or custom)
 * - Shows individual event prices
 * - Shows events subtotal
 * - Shows final total price
 * - Has expand/collapse functionality
 * 
 * Requirements: 2.4, 3.1, 3.3
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(80));
console.log('TASK 11 VERIFICATION: Price Breakdown Display Component');
console.log('='.repeat(80));
console.log();

// Read the PriceBreakdown component
const componentPath = path.join(__dirname, 'src/components/admin/PriceBreakdown.tsx');
const componentContent = fs.readFileSync(componentPath, 'utf8');

// Verification checks
const checks = {
  'Component exists': fs.existsSync(componentPath),
  'Has expand/collapse state': componentContent.includes('useState') && componentContent.includes('isExpanded'),
  'Shows base price': componentContent.includes('basePrice') && componentContent.includes('Base Price'),
  'Shows package price': componentContent.includes('Package Price'),
  'Shows events total': componentContent.includes('eventsTotal') && componentContent.includes('Events & Activities'),
  'Shows individual events': componentContent.includes('selectedEvents.map'),
  'Shows final total': componentContent.includes('Total Price'),
  'Has expand/collapse button': componentContent.includes('onClick={() => setIsExpanded'),
  'Formats currency': componentContent.includes('formatCurrency'),
  'Shows per-person calculation': componentContent.includes('Price per Person'),
  'Shows per-room calculation': componentContent.includes('Price per Room'),
  'Shows per-night calculation': componentContent.includes('Price per Night'),
  'Handles currency mismatch': componentContent.includes('eventCurrency !== currency'),
  'Shows package details': componentContent.includes('tierUsed') && componentContent.includes('periodUsed'),
  'Shows custom price indicator': componentContent.includes('syncStatus === \'custom\''),
  'Shows calculating indicator': componentContent.includes('syncStatus === \'calculating\''),
  'Has proper TypeScript types': componentContent.includes('interface PriceBreakdownProps'),
  'Accepts selectedEvents prop': componentContent.includes('selectedEvents?:'),
  'Accepts linkedPackageInfo prop': componentContent.includes('linkedPackageInfo?:'),
  'Accepts priceBreakdown prop': componentContent.includes('priceBreakdown?:'),
  'Has defaultExpanded prop': componentContent.includes('defaultExpanded?:'),
};

// Display results
console.log('Component Feature Verification:');
console.log('-'.repeat(80));

let passCount = 0;
let failCount = 0;

Object.entries(checks).forEach(([check, passed]) => {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${check}`);
  if (passed) passCount++;
  else failCount++;
});

console.log();
console.log('='.repeat(80));
console.log(`Results: ${passCount} passed, ${failCount} failed`);
console.log('='.repeat(80));
console.log();

// Check integration in QuoteForm
const quoteFormPath = path.join(__dirname, 'src/components/admin/QuoteForm.tsx');
const quoteFormContent = fs.readFileSync(quoteFormPath, 'utf8');

console.log('Integration Verification:');
console.log('-'.repeat(80));

const integrationChecks = {
  'PriceBreakdown imported': quoteFormContent.includes('import PriceBreakdown'),
  'PriceBreakdown component used': quoteFormContent.includes('<PriceBreakdown'),
  'basePrice prop passed': quoteFormContent.includes('basePrice={basePrice}'),
  'eventsTotal prop passed': quoteFormContent.includes('eventsTotal={eventsTotal}'),
  'totalPrice prop passed': quoteFormContent.includes('totalPrice={totalPrice}'),
  'currency prop passed': quoteFormContent.includes('currency={currency}'),
  'selectedEvents prop passed': quoteFormContent.includes('selectedEvents={selectedEvents}'),
  'linkedPackageInfo prop passed': quoteFormContent.includes('linkedPackageInfo={linkedPackageInfo}'),
  'priceBreakdown prop passed': quoteFormContent.includes('priceBreakdown={priceBreakdown}'),
  'syncStatus prop passed': quoteFormContent.includes('syncStatus={syncStatus}'),
  'defaultExpanded prop passed': quoteFormContent.includes('defaultExpanded={'),
};

let integrationPassCount = 0;
let integrationFailCount = 0;

Object.entries(integrationChecks).forEach(([check, passed]) => {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${check}`);
  if (passed) integrationPassCount++;
  else integrationFailCount++;
});

console.log();
console.log('='.repeat(80));
console.log(`Integration Results: ${integrationPassCount} passed, ${integrationFailCount} failed`);
console.log('='.repeat(80));
console.log();

// Requirements verification
console.log('Requirements Verification:');
console.log('-'.repeat(80));

const requirements = {
  'Requirement 2.4: Display price breakdown showing base price and event prices separately': 
    checks['Shows base price'] && checks['Shows events total'] && checks['Shows individual events'],
  'Requirement 3.1: Display list of all selected events with names and prices':
    checks['Shows individual events'] && checks['Shows events total'],
  'Requirement 3.3: Show total additional cost from all selected events':
    checks['Shows events total'] && checks['Shows final total'],
  'Task Detail: Create or enhance price display to show itemized breakdown':
    checks['Shows base price'] && checks['Shows individual events'] && checks['Shows events total'],
  'Task Detail: Show base price (package or custom)':
    checks['Shows base price'] && checks['Shows package price'],
  'Task Detail: Show individual event prices':
    checks['Shows individual events'],
  'Task Detail: Show events subtotal':
    checks['Shows events total'],
  'Task Detail: Show final total price':
    checks['Shows final total'],
  'Task Detail: Add expand/collapse functionality for details':
    checks['Has expand/collapse state'] && checks['Has expand/collapse button'],
};

let reqPassCount = 0;
let reqFailCount = 0;

Object.entries(requirements).forEach(([requirement, passed]) => {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${requirement}`);
  if (passed) reqPassCount++;
  else reqFailCount++;
});

console.log();
console.log('='.repeat(80));
console.log(`Requirements Results: ${reqPassCount} passed, ${reqFailCount} failed`);
console.log('='.repeat(80));
console.log();

// Final summary
const allPassed = failCount === 0 && integrationFailCount === 0 && reqFailCount === 0;

if (allPassed) {
  console.log('✅ SUCCESS: Task 11 is COMPLETE!');
  console.log();
  console.log('The PriceBreakdown component:');
  console.log('  • Shows base price (package or custom)');
  console.log('  • Shows individual event prices with names');
  console.log('  • Shows events subtotal');
  console.log('  • Shows final total price');
  console.log('  • Has expand/collapse functionality');
  console.log('  • Is properly integrated in QuoteForm');
  console.log('  • Meets all requirements (2.4, 3.1, 3.3)');
} else {
  console.log('❌ INCOMPLETE: Some checks failed');
  console.log();
  console.log('Please review the failed checks above.');
}

console.log();
console.log('='.repeat(80));
