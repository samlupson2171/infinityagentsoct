# Implementation Plan

- [x] 1. Create database models and migrations
  - Create Event model with schema, validation, and indexes
  - Create Category model with schema and predefined categories
  - Update Enquiry model to use ObjectId[] for eventsRequested
  - Create migration script to seed predefined categories
  - Create migration script to convert hardcoded events to database records
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 2. Implement core event service layer
  - Create event service with CRUD operations
  - Implement event filtering by destination and category
  - Implement event validation logic
  - Create category service with CRUD operations
  - Implement cache manager for events and categories
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 3.3, 9.1, 9.2, 9.3_

- [x] 3. Build admin API endpoints for events
  - Create GET /api/admin/events with filtering and pagination
  - Create POST /api/admin/events for creating events
  - Create PUT /api/admin/events/[id] for updating events
  - Create DELETE /api/admin/events/[id] for soft deletion
  - Create PATCH /api/admin/events/[id]/status for toggling status
  - Implement authentication and authorization middleware
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [x] 4. Build admin API endpoints for categories
  - Create GET /api/admin/events/categories
  - Create POST /api/admin/events/categories
  - Create PUT /api/admin/events/categories/[id]
  - Create DELETE /api/admin/events/categories/[id] with usage validation
  - _Requirements: 2.3, 2.4, 2.5, 7.1, 7.7_

- [x] 5. Build public API endpoint for events
  - Create GET /api/events with destination filtering
  - Implement caching for public endpoint
  - Optimize query performance with proper indexes
  - _Requirements: 3.3, 5.1, 5.5, 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 6. Create admin EventsManager component
  - Build event list table with columns for name, categories, destinations, status
  - Implement search functionality
  - Implement filter dropdowns for category, destination, and status
  - Add bulk action buttons (activate, deactivate, delete)
  - Implement pagination controls
  - Add "Create New Event" button
  - _Requirements: 4.1, 4.2, 4.7_

- [x] 7. Create admin EventForm component
  - Build form with all event fields (name, description, categories, destinations)
  - Implement multi-select for categories with checkboxes
  - Implement multi-select for destinations with "All Destinations" option
  - Add display order and active status controls
  - Implement real-time validation with error messages
  - Add duplicate name checking
  - Create modal or page layout for form
  - _Requirements: 4.3, 4.4, 4.6, 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 8. Create admin CategoryManager component
  - Build category list with edit/delete actions
  - Add create new category form
  - Implement drag-and-drop reordering for display order
  - Prevent deletion of system categories
  - Prevent deletion of categories in use by events
  - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [x] 9. Create EventSelector component for enquiry form
  - Build checkbox grid for event selection
  - Implement category filtering tabs/buttons
  - Add event count badges for each category
  - Display event descriptions on hover or in tooltips
  - Show selected events summary
  - Make responsive for mobile devices
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 10. Update EnquiryForm component
  - Replace hardcoded event list with EventSelector component
  - Implement dynamic event loading based on selected destination
  - Handle loading and error states
  - Update form submission to send event IDs instead of names
  - Add fallback for when no destination is selected
  - _Requirements: 3.3, 5.1, 5.5_

- [x] 11. Update enquiry API to handle event IDs
  - Modify POST /api/enquiries to accept event ObjectIds
  - Update validation to verify event IDs exist
  - Populate event details when retrieving enquiries
  - Update EnquiriesManager to display event names from IDs
  - _Requirements: 1.1, 1.2, 10.6_

- [x] 12. Implement caching and performance optimizations
  - Set up cache manager with in-memory storage
  - Implement cache invalidation on event/category changes
  - Add cache warming for frequently accessed data
  - Optimize database queries with proper indexes
  - Implement lazy loading for event selector
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 13. Add validation and error handling
  - Implement comprehensive validation for event creation/updates
  - Add unique name validation
  - Validate category and destination requirements
  - Implement user-friendly error messages
  - Add error boundaries for React components
  - Prevent deletion of events referenced in enquiries
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [x] 14. Create admin navigation and routing
  - Add "Events" menu item to admin navigation
  - Create /admin/events page route
  - Create /admin/events/new page route
  - Create /admin/events/[id]/edit page route
  - Create /admin/events/categories page route
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 15. Run database migrations
  - Execute category seeding migration
  - Execute event migration from hardcoded list
  - Verify all events migrated correctly
  - Update existing enquiries if needed
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]* 16. Write unit tests
  - Write tests for Event model validation
  - Write tests for Category model validation
  - Write tests for event service CRUD operations
  - Write tests for category service CRUD operations
  - Write tests for cache manager
  - Write tests for EventsManager component
  - Write tests for EventForm component
  - Write tests for EventSelector component
  - _Requirements: All_

- [ ]* 17. Write integration tests
  - Write tests for all admin API endpoints
  - Write tests for public API endpoint
  - Write tests for authentication/authorization
  - Write tests for error handling
  - Write tests for pagination
  - Write tests for cache invalidation
  - _Requirements: All_

- [ ]* 18. Write E2E tests
  - Write test for admin creating new event
  - Write test for admin editing event
  - Write test for admin deleting event
  - Write test for agent selecting events in enquiry form
  - Write test for category filtering
  - Write test for destination-based event filtering
  - _Requirements: All_

- [x] 19. Create documentation
  - Document API endpoints with examples
  - Create admin user guide for managing events
  - Document migration process
  - Add inline code comments
  - Create troubleshooting guide
  - _Requirements: All_

- [x] 20. Final integration and testing
  - Test complete workflow from admin to enquiry form
  - Verify cache performance
  - Test with large dataset (500+ events)
  - Verify mobile responsiveness
  - Test error scenarios
  - Perform security audit
  - _Requirements: All_
