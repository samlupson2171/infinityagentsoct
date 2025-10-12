# Implementation Plan

- [x] 1. Enhance data models and types
  - Update Quote model to include new price tracking fields (customPriceApplied, lastRecalculatedAt, priceHistory)
  - Create TypeScript interfaces for LinkedPackageInfo, PriceBreakdown, and PackageSelection
  - Update existing types to support new price synchronization features
  - _Requirements: 1.5, 3.1, 3.2, 6.5_

- [x] 2. Create useQuotePrice hook for price synchronization
  - Implement core hook structure with state management for sync status
  - Integrate with useSuperPackagePriceCalculation for price fetching
  - Implement automatic recalculation on parameter changes with debouncing
  - Add custom price detection logic
  - Implement validation warnings for incompatible parameters
  - Add recalculatePrice, markAsCustomPrice, and resetToCalculated actions
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 4.1, 4.2, 4.3_

- [ ]* 2.1 Write unit tests for useQuotePrice hook
  - Test price synchronization on parameter changes
  - Test custom price detection and marking
  - Test validation warnings generation
  - Test error handling scenarios
  - Test recalculation logic
  - _Requirements: 2.1, 2.2, 2.3, 2.6_

- [x] 3. Create PriceSyncIndicator component
  - Implement component with all visual states (synced, calculating, custom, error, out-of-sync)
  - Add icons and styling for each state
  - Implement tooltip with price breakdown details
  - Add action buttons for recalculate and reset
  - Make component responsive and accessible
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 3.1 Write unit tests for PriceSyncIndicator
  - Test all visual states render correctly
  - Test tooltip content and interactions
  - Test action button callbacks
  - Test accessibility features
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 4. Enhance PackageSelector component
  - Update onSelect callback to return PackageSelection with full pricing details
  - Include priceCalculation object with breakdown in selection data
  - Pass inclusions and accommodationExamples in selection
  - Ensure price calculation completes before allowing selection
  - Add loading state while fetching package details
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]* 4.1 Write integration tests for enhanced PackageSelector
  - Test price calculation integration
  - Test complete data structure returned on selection
  - Test error states and handling
  - Test loading states
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 5. Update QuoteForm with atomic state updates
  - Implement handlePackageSelect with startTransition for atomic updates
  - Update all form fields simultaneously when package is selected
  - Integrate useQuotePrice hook into QuoteForm
  - Add PriceSyncIndicator to pricing section
  - Implement manual price change detection
  - Add price field onChange handler to detect custom prices
  - _Requirements: 1.5, 2.1, 2.2, 2.3, 2.6, 3.1, 3.2_

- [x] 6. Implement parameter validation warnings
  - Add validation for numberOfNights against package durationOptions
  - Add validation for numberOfPeople against package tier limits
  - Add validation for arrivalDate against pricing periods
  - Display warnings in QuoteForm UI
  - Allow submission with warnings but require confirmation
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 6.1 Write tests for parameter validation
  - Test duration validation warnings
  - Test people count validation warnings
  - Test date range validation warnings
  - Test confirmation flow for submissions with warnings
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 7. Implement package unlinking with data preservation
  - Add confirmation dialog for unlink action
  - Preserve all current field values when unlinking
  - Stop automatic recalculation after unlinking
  - Update UI indicators to show "No package linked"
  - Maintain isSuperPackage checkbox state
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 7.1 Write tests for package unlinking
  - Test confirmation dialog appears
  - Test field values are preserved
  - Test auto-recalculation stops
  - Test UI indicator updates
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 8. Implement comprehensive error handling
  - Add error handling for package not found scenarios
  - Add error handling for invalid parameters
  - Add error handling for network errors
  - Add error handling for calculation timeouts
  - Implement error recovery strategies with user actions
  - Add error logging for debugging
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 8.1 Write tests for error handling
  - Test package not found error flow
  - Test invalid parameters error flow
  - Test network error recovery
  - Test timeout handling
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 9. Add price recalculation feature for existing quotes
  - Add "Recalculate Price" button to quote edit view
  - Fetch latest package pricing on recalculation
  - Show price comparison (old vs new) before applying
  - Update quote with new price and log change in version history
  - Handle cases where package is deleted or parameters invalid
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 9.1 Write tests for price recalculation
  - Test recalculation with updated pricing
  - Test price comparison display
  - Test version history logging
  - Test error cases (deleted package, invalid parameters)
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 10. Implement performance optimizations
  - Add debouncing (500ms) to parameter change handlers
  - Configure React Query caching for price calculations
  - Implement optimistic UI updates for better responsiveness
  - Use startTransition for non-urgent state updates
  - Add performance monitoring for key operations
  - _Requirements: 2.1, 2.2, 2.3_

- [ ]* 10.1 Write performance tests
  - Test debouncing prevents excessive API calls
  - Test cache hit rates meet targets
  - Test UI responsiveness metrics
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 11. Update Quote API endpoints
  - Update POST /api/admin/quotes to handle new linkedPackage fields
  - Update PUT /api/admin/quotes/[id] to handle price history
  - Add validation for customPriceApplied and priceHistory fields
  - Ensure backward compatibility with existing quotes
  - _Requirements: 1.5, 6.5, 7.4_

- [ ]* 11.1 Write API endpoint tests
  - Test quote creation with new fields
  - Test quote updates with price history
  - Test backward compatibility
  - Test validation
  - _Requirements: 1.5, 6.5, 7.4_

- [x] 12. Add integration tests for complete flows
  - Test complete quote creation flow with package selection
  - Test quote editing flow with price recalculation
  - Test parameter changes triggering recalculation
  - Test custom price override flow
  - Test package unlinking flow
  - Test error recovery flows
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 5.1, 5.2, 6.1, 6.2_

- [x] 13. Update documentation
  - Document useQuotePrice hook API and usage
  - Document PriceSyncIndicator component props and states
  - Document enhanced PackageSelector interface
  - Add user guide for price synchronization features
  - Document error handling strategies
  - Add troubleshooting guide for common issues
  - _Requirements: All_

- [x] 14. Perform end-to-end testing and validation
  - Test complete quote creation workflow in development
  - Test price recalculation with various parameter combinations
  - Test error scenarios and recovery
  - Validate performance metrics meet targets
  - Test on different browsers and devices
  - Verify accessibility compliance
  - _Requirements: All_
