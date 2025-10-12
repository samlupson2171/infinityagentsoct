# Implementation Plan

- [x] 1. Create SuperOfferPackage data model and database migration
  - Create TypeScript interfaces for SuperOfferPackage with pricing matrix structure
  - Implement Mongoose schema with validation rules
  - Create database indexes for performance
  - Write database migration file to create collection
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 2. Enhance Quote model with package linking support
  - Add linkedPackage field to IQuote interface
  - Update Quote schema with package reference structure
  - Add index for linkedPackage.packageId
  - _Requirements: 6.5, 6.6, 10.1, 10.2, 10.3_

- [x] 3. Implement core API endpoints for package CRUD operationsa 
- [x] 3.1 Create GET /api/admin/super-packages endpoint
  - Implement pagination, filtering, and search
  - Add query parameter handling for status and destination
  - Return paginated package list with metadata
  - _Requirements: 2.1, 4.1, 4.2, 4.3, 4.4_

- [x] 3.2 Create POST /api/admin/super-packages endpoint
  - Implement request validation with Zod schema
  - CreIM assuminate new package with admin authorization
  - Store creator information and timestamps
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11_

- [x] 3.3 Create GET /api/admin/super-packages/[id] endpoint
  - Fetch single package by ID
  - Return full package details including pricing matrix
  - _Requirements: 4.5_

- [x] 3.4 Create PUT /api/admin/super-packages/[id] endpoint
  - Validate update data
  - Increment version number
  - Update lastModifiedBy and timestamp
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 3.5 Create DELETE /api/admin/super-packages/[id] endpoint
  - Check for linked quotes
  - Implement soft-delete if quotes exist
  - Allow hard-delete if no quotes linked
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [x] 3.6 Create PATCH /api/admin/super-packages/[id]/status endpoint
  - Toggle package active/inactive status
  - Validate status transitions
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 4. Implement pricing calculation service and API
- [x] 4.1 Create PricingCalculator service class
  - Implement determineTier method to find matching group size tier
  - Implement determinePeriod method to match arrival date to pricing period
  - Implement calculatePrice method with full calculation logic
  - Handle "ON_REQUEST" pricing scenarios
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [x] 4.2 Create POST /api/admin/super-packages/calculate-price endpoint
  - Accept packageId, numberOfPeople, numberOfNights, arrivalDate
  - Use PricingCalculator to compute price
  - Return price breakdown with tier and period information
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [x] 5. Implement CSV import functionality
- [x] 5.1 Create SuperPackageCSVParser service class
  - Implement parseCSV method to process uploaded files
  - Extract header information (resort, destination)
  - Extract group size tiers from column headers
  - Extract duration options from column headers
  - Parse pricing matrix with period detection
  - Extract inclusions section
  - Extract sales notes section
  - Handle currency symbol detection
  - Parse "ON REQUEST" entries
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 5.2 Create POST /api/admin/super-packages/import endpoint
  - Handle file upload with FormData
  - Use CSVParser to parse file
  - Return parsed data preview for admin review
  - Handle parsing errors with clear messages
  - _Requirements: 3.1, 3.7, 3.9_

- [x] 5.3 Create POST /api/admin/super-packages/import/confirm endpoint
  - Accept reviewed package data
  - Validate and create package record
  - Store import metadata
  - _Requirements: 3.8_

- [x] 6. Implement quote-package linking functionality
- [x] 6.1 Create QuoteLinker service class
  - Implement linkPackageToQuote method
  - Populate quote fields from package data
  - Store package reference with version
  - Implement unlinkPackageFromQuote method
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

- [x] 6.2 Create POST /api/admin/quotes/[id]/link-package endpoint
  - Accept package selection parameters
  - Calculate price using PricingCalculator
  - Use QuoteLinker to populate quote
  - Return updated quote
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

- [x] 7. Build SuperPackageManager admin component
  - Create list view with table display
  - Implement search and filter controls
  - Add pagination controls
  - Implement create/edit/delete actions
  - Add status toggle functionality
  - Integrate with API endpoints using React Query
  - _Requirements: 2.1, 4.1, 4.2, 4.3, 4.4, 4.5, 8.1, 8.2, 8.3_

- [x] 8. Build SuperPackageForm component
- [x] 8.1 Create form structure with sections
  - Basic information section (name, destination, resort, currency)
  - Group size tiers configuration section
  - Duration options section
  - Inclusions list section
  - Accommodation examples section
  - Sales notes section
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

- [x] 8.2 Implement form validation
  - Real-time field validation
  - Required field checks
  - Format validation
  - Display validation errors
  - _Requirements: 2.10_

- [x] 8.3 Integrate form with API endpoints
  - Handle create and update operations
  - Show loading states
  - Handle success and error responses
  - _Requirements: 2.11, 5.1, 5.2, 5.3, 5.4_

- [x] 9. Build PricingMatrixEditor component
  - Create spreadsheet-like grid interface
  - Implement rows for periods (months and special dates)
  - Implement columns for group size × duration combinations
  - Add cell editing functionality
  - Support "ON REQUEST" entry option
  - Add period management (add/remove/edit periods)
  - Implement validation for completeness
  - _Requirements: 2.5, 2.6, 2.7_

- [x] 10. Build CSVImporter component
- [x] 10.1 Create file upload interface
  - Implement drag-and-drop upload area
  - Add file selection button
  - Validate file type (CSV only)
  - Show upload progress
  - _Requirements: 3.1_

- [x] 10.2 Create preview and review interface
  - Display parsed package data
  - Show pricing matrix preview
  - Display inclusions and sales notes
  - Allow editing before confirmation
  - _Requirements: 3.7_

- [x] 10.3 Implement import confirmation flow
  - Add confirm/cancel buttons
  - Handle API submission
  - Show success/error messages
  - Redirect to package details on success
  - _Requirements: 3.8, 3.9_

- [x] 11. Build PackageSelector component for quote form
- [x] 11.1 Create package selection interface
  - Display searchable list of active packages
  - Show package preview on selection
  - Filter packages by destination
  - _Requirements: 6.1, 6.2_

- [x] 11.2 Create selection parameters form
  - Add number of people input
  - Add number of nights input
  - Add arrival date picker
  - Validate inputs
  - _Requirements: 6.3_

- [x] 11.3 Implement price calculation preview
  - Call calculate-price API on parameter change
  - Display calculated price
  - Show tier and period used
  - Handle "ON REQUEST" scenario
  - _Requirements: 6.4, 6.7_

- [x] 11.4 Integrate with quote form
  - Add "Select Super Package" button to quote form
  - Populate quote fields on package application
  - Allow manual adjustments after application
  - _Requirements: 6.4, 6.8_

- [x] 12. Enhance QuoteForm component with package integration
  - Add package selection trigger button
  - Display linked package information
  - Show package reference and details
  - Add unlink package option
  - Update form to handle package-populated data
  - _Requirements: 6.1, 6.4, 6.8, 10.1, 10.2, 10.3_

- [ ] 13. Enhance QuoteManager to display package information
  - Show package reference in quote list
  - Display linked package indicator
  - Add package details in quote view
  - Show pricing tier and period used
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 14. Create admin navigation and routing
  - Add "Super Packages" menu item to admin navigation
  - Create /admin/super-packages page route
  - Create /admin/super-packages/new page route
  - Create /admin/super-packages/[id]/edit page route
  - Implement route protection with admin authorization
  - _Requirements: 2.1, 4.1_

- [x] 15. Implement error handling and user feedback
  - Create error boundary for package components
  - Add toast notifications for success/error
  - Implement loading states for async operations
  - Add confirmation dialogs for destructive actions
  - Display validation errors clearly
  - _Requirements: 2.10, 3.9, 9.1, 9.2, 9.3_

- [x] 16. Add package status indicators and management
  - Display active/inactive badges in package list
  - Show inactive packages with visual distinction
  - Implement status toggle UI
  - Add confirmation for status changes
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 17. Implement package version history tracking
  - Store version history on package updates
  - Display version number in package details
  - Show last modified by and timestamp
  - Add audit trail for package changes
  - _Requirements: 5.4, 5.5_

- [x] 18. Create package statistics and analytics
  - Add package usage statistics (number of linked quotes)
  - Display most used packages
  - Show package creation and update timeline
  - Add destination-based package counts
  - _Requirements: 9.2_

- [x] 19. Implement package search and filtering
  - Add text search across package name and destination
  - Implement destination filter dropdown
  - Add status filter (active/inactive/all)
  - Add resort filter
  - Implement search debouncing
  - _Requirements: 4.2, 4.3_

- [x] 20. Add package deletion safeguards
  - Check for linked quotes before deletion
  - Display warning with quote count
  - Implement soft-delete for packages with quotes
  - Add confirmation dialog with details
  - Show deleted packages in separate view (admin only)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [x] 21. Integrate package data into quote email templates
  - Add package reference to internal quote documentation
  - Include package name in admin notifications
  - Ensure customer-facing emails don't expose package details
  - _Requirements: 10.5_

- [x] 22. Create package export functionality
  - Add export to CSV option for packages
  - Generate CSV in same format as import
  - Allow bulk export of multiple packages
  - _Requirements: 4.1_

- [x] 23. Implement package duplication feature
  - Add "Duplicate Package" action
  - Copy all package data with new name
  - Allow editing before saving duplicate
  - _Requirements: 2.1_

- [x] 24. Add package preview and testing tools
  - Create standalone price calculator page
  - Allow testing price calculations without creating quotes
  - Display pricing matrix in readable format
  - Show all inclusions and details
  - _Requirements: 4.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 25. Run database migration and create indexes
  - Execute migration to create super_offer_packages collection
  - Verify all indexes created successfully
  - Add linkedPackage field to quotes collection
  - Test migration rollback procedure
  - _Requirements: 1.1_

- [x] 26. Implement comprehensive error handling
  - Add try-catch blocks in all API routes
  - Create custom error classes for package operations
  - Implement error logging
  - Return user-friendly error messages
  - _Requirements: 3.9_

- [x] 27. Add input validation and sanitization
  - Validate all user inputs on server side
  - Sanitize text inputs to prevent XSS
  - Validate file uploads (type, size)
  - Implement rate limiting on import endpoint
  - _Requirements: 2.10, 3.1_

- [x] 28. Implement caching strategy
  - Add React Query caching for package lists
  - Cache individual package details
  - Implement cache invalidation on updates
  - Add stale-while-revalidate strategy
  - _Requirements: 4.1_

- [x] 29. Add loading states and optimistic updates
  - Show skeleton loaders for package lists
  - Add loading spinners for async operations
  - Implement optimistic UI updates for status changes
  - Show progress indicators for CSV import
  - _Requirements: 2.1, 3.1_

- [x] 30. Create comprehensive documentation
  - Write admin user guide for super packages
  - Document CSV import format and requirements
  - Create API documentation for endpoints
  - Add inline code comments
  - Document pricing calculation logic
  - _Requirements: 3.1, 3.7_
