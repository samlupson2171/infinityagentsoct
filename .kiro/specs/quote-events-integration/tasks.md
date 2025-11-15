# Implementation Plan

- [x] 1. Update Quote model to support selected events
  - Add `selectedEvents` array field to IQuote interface
  - Add schema definition for selectedEvents with validation
  - Add index on selectedEvents.eventId for performance
  - Deprecate `activitiesIncluded` field (keep for backward compatibility)
  - _Requirements: 1.1, 1.2, 1.3, 5.1, 5.2_

- [x] 2. Create database migration for Quote model changes
  - Create migration file `010-add-events-to-quotes.ts`
  - Add selectedEvents field to existing quotes (empty array)
  - Optionally migrate activitiesIncluded text to internalNotes
  - Add necessary indexes
  - Create rollback functionality
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 3. Create SelectedEventsList component
  - Create new component file `src/components/admin/SelectedEventsList.tsx`
  - Display list of selected events with names and prices
  - Show total events cost
  - Implement remove event functionality
  - Add empty state display
  - Style with Tailwind CSS matching existing design
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 4. Create API endpoint for event price calculation
  - Create route file `src/app/api/admin/quotes/calculate-events-price/route.ts`
  - Implement POST handler to calculate total price for selected events
  - Fetch event details from database
  - Handle missing or inactive events
  - Return event details with prices
  - Add error handling and validation
  - _Requirements: 2.1, 2.2, 5.4_

- [x] 5. Update QuoteForm component to integrate event selection
  - Remove activitiesIncluded textarea field
  - Add state management for selectedEvents
  - Add state for basePrice and eventsTotal
  - Integrate EventSelector component (reuse from enquiries)
  - Add SelectedEventsList component
  - Implement event selection/deselection handlers
  - Update destination field to trigger event filtering
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.2_

- [x] 6. Implement price calculation logic with events
  - Update price calculation to separate base price and events total
  - Calculate eventsTotal when events are added/removed
  - Update totalPrice as basePrice + eventsTotal
  - Integrate with existing useQuotePrice hook
  - Handle currency matching between events and quote
  - Add price breakdown display
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 7. Update quote form submission to include events
  - Modify onFormSubmit to include selectedEvents in submission data
  - Validate selected events before submission
  - Handle event price storage
  - Update price history with event additions
  - Add error handling for event-related failures
  - _Requirements: 3.5, 5.1, 5.2_

- [x] 8. Update quote validation schema
  - Update `src/lib/validation/quote-validation.ts`
  - Add validation for selectedEvents array
  - Validate event IDs format
  - Validate event prices are non-negative
  - Add maximum events limit (20)
  - Remove activitiesIncluded from required fields
  - _Requirements: 1.1, 1.2, 5.1_
sur- [x] 9. Update quote API routes to handle events
  - Update POST `/api/admin/quotes/route.ts` to save selectedEvents
  - Update PUT `/api/admin/quotes/[id]/route.ts` to update selectedEvents
  - Update GET routes to populate event details
  - Add validation for event existence and active status
  - Handle event price changes gracefully
  - _Requirements: 3.4, 3.5, 5.2, 5.3, 5.4_

- [x] 10. Integrate with package system
  - Update handlePackageSelect to preserve selected events
  - Ensure package price and event prices are calculated separately
  - Update price synchronization logic
  - Handle package unlinking while preserving events
  - Update PriceSyncIndicator to show event prices
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 11. Create price breakdown display component
  - Create or enhance price display to show itemized breakdown
  - Show base price (package or custom)
  - Show individual event prices
  - Show events subtotal
  - Show final total price
  - Add expand/collapse functionality for details
  - _Requirements: 2.4, 3.1, 3.3_

- [x] 12. Update QuoteManager to display events
  - Update quote list view to show event count
  - Update quote detail view to display selected events
  - Show event names and prices in quote summary
  - Handle missing/deleted events gracefully
  - Add visual indicators for quotes with events
  - _Requirements: 3.1, 3.4, 5.4_

- [x] 13. Update quote email templates to include events
  - Modify email template to display selected events
  - Show event names and prices in email
  - Include events in price breakdown
  - Ensure proper formatting and styling
  - Test email rendering with events
  - _Requirements: 3.1, 3.5_

- [x] 14. Add unit tests for event integration
  - Test event selection/deselection logic
  - Test price calculation with events
  - Test event validation
  - Test currency handling
  - Test edge cases (deleted events, price changes)
  - _Requirements: All_

- [ ]* 15. Add integration tests for quote-events flow
  - Test complete quote creation with events
  - Test quote editing with event changes
  - Test event filtering by destination
  - Test price synchronization
  - Test API endpoints
  - _Requirements: All_

- [x] 16. Update documentation
  - Document new selectedEvents field
  - Update API documentation
  - Create user guide for event selection
  - Document migration process
  - Add troubleshooting guide
  - _Requirements: All_

- [x] 17. Run migration and verify data integrity
  - Execute migration on development database
  - Verify all quotes have selectedEvents field
  - Check data integrity
  - Test rollback procedure
  - Prepare production migration plan
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 18. Implement per-person vs per-event pricing toggle
  - Add onTogglePricePerPerson handler in QuoteForm component
  - Update selectedEvents state to toggle pricePerPerson field
  - Recalculate eventsTotal when pricing type changes
  - Recalculate eventsTotal when numberOfPeople changes
  - Update price calculation to multiply by numberOfPeople for per-person events
  - Ensure pricing type is persisted when saving quote
  - Update PriceBreakdown component to show per-person calculations
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_ 