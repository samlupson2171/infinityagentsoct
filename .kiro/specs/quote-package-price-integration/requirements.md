# Requirements Document

## Introduction

The quote creation system currently has a disconnect between the super package selection and the quote price calculation. When a user selects a super package through the PackageSelector component, the calculated price is not properly transferred to the quote form, and the form doesn't automatically update the total price based on the selected package's pricing. This creates confusion and requires manual price entry, defeating the purpose of having pre-configured package pricing.

This feature will establish a seamless integration between package selection and quote pricing, ensuring that when a super package is selected, all relevant pricing information is automatically populated and kept in sync with the quote parameters.

## Requirements

### Requirement 1: Automatic Price Population from Package Selection

**User Story:** As an admin creating a quote, I want the total price to automatically populate when I select a super package, so that I don't have to manually calculate or enter the price.

#### Acceptance Criteria

1. WHEN a user selects a super package in the PackageSelector THEN the calculated price SHALL be immediately transferred to the QuoteForm's totalPrice field
2. WHEN the price calculation returns "ON_REQUEST" THEN the system SHALL display a clear indicator and allow manual price entry
3. WHEN a package is selected THEN the currency field SHALL automatically update to match the package's currency
4. IF the package has a calculated price THEN the totalPrice field SHALL be populated with that exact amount
5. WHEN the package selection is applied THEN all form fields (numberOfPeople, numberOfNights, arrivalDate, totalPrice) SHALL be updated atomically to prevent inconsistent state

### Requirement 2: Real-time Price Recalculation on Parameter Changes

**User Story:** As an admin editing a quote with a linked package, I want the price to automatically recalculate when I change the number of people, nights, or dates, so that the pricing stays accurate without manual intervention.

#### Acceptance Criteria

1. WHEN a quote has a linked super package AND the user changes numberOfPeople THEN the system SHALL automatically recalculate the price based on the package's pricing matrix
2. WHEN a quote has a linked super package AND the user changes numberOfNights THEN the system SHALL automatically recalculate the price if the new duration is available in the package
3. WHEN a quote has a linked super package AND the user changes arrivalDate THEN the system SHALL automatically recalculate the price based on the applicable pricing period
4. WHEN recalculation is in progress THEN the system SHALL display a loading indicator on the price field
5. WHEN recalculation fails THEN the system SHALL display an error message and retain the previous price value
6. WHEN the user manually overrides the price field THEN the system SHALL mark the quote as having a custom price and stop automatic recalculation
7. IF the new parameters result in "ON_REQUEST" pricing THEN the system SHALL notify the user and allow manual price entry

### Requirement 3: Price Synchronization Indicator

**User Story:** As an admin, I want to see clear visual feedback about whether the quote price is synced with the package pricing, so that I know if the price is accurate or has been manually adjusted.

#### Acceptance Criteria

1. WHEN a quote is linked to a package AND the price matches the calculated package price THEN the system SHALL display a "synced" indicator
2. WHEN a quote is linked to a package AND the price has been manually overridden THEN the system SHALL display a "custom price" indicator
3. WHEN the price is being recalculated THEN the system SHALL display a "calculating" indicator
4. WHEN there's a pricing error THEN the system SHALL display an error indicator with details
5. WHEN the user hovers over the sync indicator THEN the system SHALL show a tooltip with pricing details (tier, period, calculation breakdown)

### Requirement 4: Package Parameter Validation

**User Story:** As an admin, I want to be prevented from entering parameters that are incompatible with the selected package, so that I don't create invalid quotes.

#### Acceptance Criteria

1. WHEN a package is linked AND the user changes numberOfNights to a value not in the package's durationOptions THEN the system SHALL display a warning and suggest valid durations
2. WHEN a package is linked AND the user changes numberOfPeople to exceed the package's maximum tier THEN the system SHALL display a warning
3. WHEN a package is linked AND the user changes arrivalDate to a date outside all pricing periods THEN the system SHALL display a warning
4. WHEN validation warnings are present THEN the system SHALL still allow form submission but require explicit confirmation
5. WHEN the user confirms submission with warnings THEN the system SHALL mark the quote as having custom parameters

### Requirement 5: Package Unlinking with Price Preservation

**User Story:** As an admin, I want to be able to unlink a package from a quote while preserving the current price and details, so that I can make custom adjustments without losing the work already done.

#### Acceptance Criteria

1. WHEN the user clicks "Unlink Package" THEN the system SHALL display a confirmation dialog
2. WHEN the user confirms unlinking THEN the system SHALL remove the package association but preserve all current field values
3. WHEN a package is unlinked THEN the system SHALL stop automatic price recalculation
4. WHEN a package is unlinked THEN the system SHALL update the linkedPackage indicator to show "No package linked"
5. WHEN a package is unlinked THEN the isSuperPackage checkbox SHALL remain checked if it was checked

### Requirement 6: Price Calculation Error Handling

**User Story:** As an admin, I want clear error messages when price calculation fails, so that I can understand what went wrong and take appropriate action.

#### Acceptance Criteria

1. WHEN the price calculation API fails THEN the system SHALL display a user-friendly error message
2. WHEN the price calculation times out THEN the system SHALL allow the user to retry or enter a manual price
3. WHEN the package data is incomplete or invalid THEN the system SHALL display specific validation errors
4. WHEN network errors occur during calculation THEN the system SHALL provide offline fallback behavior
5. WHEN calculation errors occur THEN the system SHALL log detailed error information for debugging

### Requirement 7: Bulk Price Updates for Existing Quotes

**User Story:** As an admin, I want to be able to recalculate prices for existing quotes when package pricing changes, so that I can keep quotes up-to-date with current pricing.

#### Acceptance Criteria

1. WHEN viewing a quote with a linked package THEN the system SHALL display a "Recalculate Price" button
2. WHEN the user clicks "Recalculate Price" THEN the system SHALL fetch the latest package pricing and recalculate
3. WHEN recalculation produces a different price THEN the system SHALL show a comparison (old vs new) before applying
4. WHEN the user confirms the price update THEN the system SHALL update the quote and log the change in version history
5. WHEN recalculation is not possible (package deleted, parameters invalid) THEN the system SHALL display an appropriate message
