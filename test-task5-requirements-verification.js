/**
 * Task 5 Requirements Verification
 * 
 * Verifies that Task 5 implementation meets all specified requirements:
 * - Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.2
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Task 5 Requirements Verification\n');
console.log('=' .repeat(60));

// Read the QuoteForm component
const quoteFormPath = path.join(__dirname, 'src/components/admin/QuoteForm.tsx');
const quoteFormContent = fs.readFileSync(quoteFormPath, 'utf-8');

// Read EventSelector component
const eventSelectorPath = path.join(__dirname, 'src/components/enquiries/EventSelector.tsx');
const eventSelectorContent = fs.readFileSync(eventSelectorPath, 'utf-8');

// Read SelectedEventsList component
const selectedEventsListPath = path.join(__dirname, 'src/components/admin/SelectedEventsList.tsx');
const selectedEventsListContent = fs.readFileSync(selectedEventsListPath, 'utf-8');

const requirements = [
  {
    id: '1.1',
    name: 'Display event selection interface instead of "Activities Included" text field',
    test: () => {
      // Should have EventSelector component
      const hasEventSelector = quoteFormContent.includes('<EventSelector');
      // Should NOT have activitiesIncluded textarea
      const noActivitiesIncluded = !quoteFormContent.includes('id="activitiesIncluded"');
      // Should have Events & Activities section
      const hasEventsSection = quoteFormContent.includes('Events & Activities');
      
      return hasEventSelector && noActivitiesIncluded && hasEventsSection;
    }
  },
  {
    id: '1.2',
    name: 'Filter event list to show only events matching destination',
    test: () => {
      // EventSelector should receive destination prop
      const passesDestination = quoteFormContent.includes('destination={destination}');
      // EventSelector should filter by destination
      const filtersEvents = eventSelectorContent.includes('if (destination)') &&
                           eventSelectorContent.includes('params.append(\'destination\', destination)');
      
      return passesDestination && filtersEvents;
    }
  },
  {
    id: '1.3',
    name: 'Add event to quote\'s selected events when selected',
    test: () => {
      // Should have handleEventSelectionChange
      const hasHandler = quoteFormContent.includes('const handleEventSelectionChange = async (eventIds: string[])');
      // Should add new events to selectedEvents
      const addsEvents = quoteFormContent.includes('setSelectedEvents((prev) => [...prev, ...newEvents])');
      
      return hasHandler && addsEvents;
    }
  },
  {
    id: '1.4',
    name: 'Remove event from quote\'s selected events when removed',
    test: () => {
      // Should have handleRemoveEvent
      const hasRemoveHandler = quoteFormContent.includes('const handleRemoveEvent = (eventId: string)');
      // Should filter out removed event
      const removesEvent = quoteFormContent.includes('setSelectedEvents((prev) => prev.filter((e) => e.eventId !== eventId))');
      
      return hasRemoveHandler && removesEvent;
    }
  },
  {
    id: '3.1',
    name: 'Display list of all selected events with names and prices',
    test: () => {
      // Should use SelectedEventsList component
      const hasComponent = quoteFormContent.includes('<SelectedEventsList');
      // SelectedEventsList should display event names and prices
      const displaysInfo = selectedEventsListContent.includes('event.eventName') &&
                          selectedEventsListContent.includes('event.eventPrice');
      
      return hasComponent && displaysInfo;
    }
  },
  {
    id: '3.2',
    name: 'Allow admin to remove individual events from selection',
    test: () => {
      // SelectedEventsList should have remove button
      const hasRemoveButton = selectedEventsListContent.includes('onClick={() => onRemove(event.eventId)}');
      // Should show remove icon
      const hasRemoveIcon = selectedEventsListContent.includes('Remove event') ||
                           selectedEventsListContent.includes('aria-label={`Remove ${event.eventName}`}');
      
      return hasRemoveButton && hasRemoveIcon;
    }
  }
];

// Additional implementation checks
const implementationChecks = [
  {
    name: 'Events total calculation',
    test: () => {
      return quoteFormContent.includes('const total = selectedEvents.reduce((sum, event)') &&
             quoteFormContent.includes('setEventsTotal(total)');
    }
  },
  {
    name: 'Price breakdown shows events',
    test: () => {
      return quoteFormContent.includes('Events & Activities') &&
             quoteFormContent.includes('eventsTotal > 0');
    }
  },
  {
    name: 'Events included in form submission',
    test: () => {
      return quoteFormContent.includes('selectedEvents: selectedEvents.map((event)');
    }
  },
  {
    name: 'Events loaded when editing',
    test: () => {
      return quoteFormContent.includes('if (initialData && (initialData as any).selectedEvents)');
    }
  },
  {
    name: 'Currency mismatch handling',
    test: () => {
      return quoteFormContent.includes('event.eventCurrency === currency') &&
             selectedEventsListContent.includes('currencyMismatch');
    }
  },
  {
    name: 'Empty state display',
    test: () => {
      return selectedEventsListContent.includes('No events selected');
    }
  }
];

// Run requirement checks
console.log('\n📋 Requirements Verification:\n');
let passedReqs = 0;
let failedReqs = 0;

requirements.forEach((req) => {
  const passed = req.test();
  const status = passed ? '✅' : '❌';
  
  console.log(`${status} Requirement ${req.id}: ${req.name}`);
  
  if (passed) {
    passedReqs++;
  } else {
    failedReqs++;
  }
});

// Run implementation checks
console.log('\n\n🔧 Implementation Checks:\n');
let passedImpl = 0;
let failedImpl = 0;

implementationChecks.forEach((check) => {
  const passed = check.test();
  const status = passed ? '✅' : '❌';
  
  console.log(`${status} ${check.name}`);
  
  if (passed) {
    passedImpl++;
  } else {
    failedImpl++;
  }
});

console.log('\n' + '='.repeat(60));
console.log(`\n📊 Requirements: ${passedReqs}/${requirements.length} passed`);
console.log(`📊 Implementation: ${passedImpl}/${implementationChecks.length} passed`);

if (failedReqs === 0 && failedImpl === 0) {
  console.log('\n✅ Task 5 successfully meets all requirements!');
  console.log('\nKey Features Implemented:');
  console.log('  ✓ Event selection interface replaces text field (Req 1.1)');
  console.log('  ✓ Events filtered by destination (Req 1.2)');
  console.log('  ✓ Events can be added to quotes (Req 1.3)');
  console.log('  ✓ Events can be removed from quotes (Req 1.4)');
  console.log('  ✓ Selected events displayed with names and prices (Req 3.1)');
  console.log('  ✓ Individual event removal supported (Req 3.2)');
  console.log('\nAdditional Features:');
  console.log('  ✓ Events total calculation');
  console.log('  ✓ Price breakdown with events');
  console.log('  ✓ Events persisted in form submission');
  console.log('  ✓ Events loaded when editing quotes');
  console.log('  ✓ Currency mismatch detection and warnings');
  console.log('  ✓ Empty state display');
  process.exit(0);
} else {
  console.log(`\n❌ ${failedReqs + failedImpl} check(s) failed.`);
  process.exit(1);
}
