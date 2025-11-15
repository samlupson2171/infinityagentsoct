/**
 * Task 5 Verification Script
 * Tests the QuoteForm component integration with event selection
 */

const fs = require('fs');
const path = require('path');

console.log('=== Task 5 Verification: QuoteForm Event Integration ===\n');

// Read the QuoteForm component
const quoteFormPath = path.join(__dirname, 'src/components/admin/QuoteForm.tsx');
const quoteFormContent = fs.readFileSync(quoteFormPath, 'utf8');

// Verification checklist
const checks = {
  'State management for selectedEvents': false,
  'State management for basePrice': false,
  'State management for eventsTotal': false,
  'EventSelector component imported': false,
  'SelectedEventsList component imported': false,
  'EventSelector component rendered': false,
  'SelectedEventsList component rendered': false,
  'handleEventSelectionChange handler': false,
  'handleRemoveEvent handler': false,
  'Destination passed to EventSelector': false,
  'Events included in form submission': false,
  'Events loaded from initialData': false,
  'Events total calculation': false,
  'activitiesIncluded field removed': false,
};

// Check 1: State management for selectedEvents
if (quoteFormContent.includes('const [selectedEvents, setSelectedEvents] = useState')) {
  checks['State management for selectedEvents'] = true;
}

// Check 2: State management for basePrice
if (quoteFormContent.includes('const [basePrice, setBasePrice] = useState')) {
  checks['State management for basePrice'] = true;
}

// Check 3: State management for eventsTotal
if (quoteFormContent.includes('const [eventsTotal, setEventsTotal] = useState')) {
  checks['State management for eventsTotal'] = true;
}

// Check 4: EventSelector component imported
if (quoteFormContent.includes("import EventSelector from '@/components/enquiries/EventSelector'")) {
  checks['EventSelector component imported'] = true;
}

// Check 5: SelectedEventsList component imported
if (quoteFormContent.includes("import SelectedEventsList from './SelectedEventsList'")) {
  checks['SelectedEventsList component imported'] = true;
}

// Check 6: EventSelector component rendered
if (quoteFormContent.includes('<EventSelector') && quoteFormContent.includes('destination={destination}')) {
  checks['EventSelector component rendered'] = true;
}

// Check 7: SelectedEventsList component rendered
if (quoteFormContent.includes('<SelectedEventsList') && quoteFormContent.includes('events={selectedEvents}')) {
  checks['SelectedEventsList component rendered'] = true;
}

// Check 8: handleEventSelectionChange handler
if (quoteFormContent.includes('const handleEventSelectionChange = async (eventIds: string[])')) {
  checks['handleEventSelectionChange handler'] = true;
}

// Check 9: handleRemoveEvent handler
if (quoteFormContent.includes('const handleRemoveEvent = (eventId: string)')) {
  checks['handleRemoveEvent handler'] = true;
}

// Check 10: Destination passed to EventSelector
if (quoteFormContent.includes('destination={destination}') && quoteFormContent.includes('<EventSelector')) {
  checks['Destination passed to EventSelector'] = true;
}

// Check 11: Events included in form submission
if (quoteFormContent.includes('selectedEvents: selectedEvents.map') && quoteFormContent.includes('onFormSubmit')) {
  checks['Events included in form submission'] = true;
}

// Check 12: Events loaded from initialData
if (quoteFormContent.includes('initialData as any).selectedEvents') && quoteFormContent.includes('setSelectedEvents')) {
  checks['Events loaded from initialData'] = true;
}

// Check 13: Events total calculation
if (quoteFormContent.includes('setEventsTotal(total)') && quoteFormContent.includes('selectedEvents.reduce')) {
  checks['Events total calculation'] = true;
}

// Check 14: activitiesIncluded field removed from defaultValues
const hasActivitiesInDefaults = quoteFormContent.includes("activitiesIncluded: initialData?.activitiesIncluded || ''");
checks['activitiesIncluded field removed'] = !hasActivitiesInDefaults;

// Display results
console.log('Verification Results:\n');
let allPassed = true;
for (const [check, passed] of Object.entries(checks)) {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${check}`);
  if (!passed) allPassed = false;
}

console.log('\n' + '='.repeat(60));
if (allPassed) {
  console.log('✅ ALL CHECKS PASSED - Task 5 implementation is complete!');
} else {
  console.log('❌ SOME CHECKS FAILED - Review the implementation');
}
console.log('='.repeat(60));

// Additional verification: Check that the Events & Activities section exists
if (quoteFormContent.includes('Events & Activities')) {
  console.log('\n✅ Events & Activities section found in the form');
} else {
  console.log('\n❌ Events & Activities section not found in the form');
}

// Check that the API endpoint is being called
if (quoteFormContent.includes('/api/admin/quotes/calculate-events-price')) {
  console.log('✅ API endpoint for event price calculation is being called');
} else {
  console.log('❌ API endpoint for event price calculation is not being called');
}

// Check that events are preserved when selecting a package
if (quoteFormContent.includes('selectedEvents are preserved')) {
  console.log('✅ Comment confirms events are preserved when selecting a package');
} else {
  console.log('⚠️  No explicit comment about preserving events when selecting a package');
}

process.exit(allPassed ? 0 : 1);
