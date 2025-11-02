# Requirements Document

## Introduction

This specification addresses a critical bug in the super package price calculation system. Currently, when a super package is selected for a quote, the system incorrectly divides the per-person price by the number of people instead of multiplying it. Since all super package prices are stored as per-person rates, the total price should be calculated by multiplying the per-person price by the number of people.

## Glossary

- **Super Package**: A pre-configured travel package with pricing tiers based on group size
- **Per-Person Price**: The price stored in the database for one person in a specific tier
- **Total Price**: The final price for the entire group (per-person price × number of people)
- **Pricing Calculator**: The service that calculates prices based on package parameters
- **Package Selector**: The UI component that allows users to select and preview packages
- **Quote Form**: The form where quotes are created with package selections

## Requirements

### Requirement 1: Correct Price Calculation Logic

**User Story:** As a travel agent, I want the system to correctly calculate the total price when I select a super package, so that quotes reflect accurate pricing for the group size.

#### Acceptance Criteria

1. WHEN the Pricing Calculator retrieves a per-person price from the database, THE System SHALL multiply the per-person price by the number of people to calculate the total price
2. WHEN the Package Selector displays price breakdown, THE System SHALL show both the per-person price and the correctly calculated total price
3. WHEN a super package is applied to a quote, THE Quote Form SHALL receive the correct total price (per-person price × number of people)
4. THE System SHALL NOT divide the per-person price by the number of people at any point in the calculation flow

### Requirement 2: Price Breakdown Display

**User Story:** As a travel agent, I want to see a clear breakdown of pricing when selecting a package, so that I can verify the calculation is correct before applying it to a quote.

#### Acceptance Criteria

1. WHEN the Package Selector calculates a price, THE System SHALL display the per-person price clearly labeled
2. WHEN the Package Selector calculates a price, THE System SHALL display the total price clearly labeled
3. WHEN the Package Selector calculates a price, THE System SHALL display the number of people used in the calculation
4. THE System SHALL format all currency values consistently with two decimal places

### Requirement 3: Data Integrity

**User Story:** As a system administrator, I want to ensure that the pricing data structure correctly represents per-person pricing, so that all calculations are based on accurate data.

#### Acceptance Criteria

1. THE System SHALL maintain per-person prices in the database pricing matrix
2. WHEN the Pricing Calculator retrieves a price point, THE System SHALL clearly identify it as a per-person price in the code
3. THE System SHALL include comments in the code explaining that prices are per-person rates
4. THE System SHALL validate that calculated total prices are reasonable (greater than per-person price when multiple people)

### Requirement 4: Backward Compatibility

**User Story:** As a system administrator, I want existing quotes and packages to continue working correctly after the fix, so that no data is corrupted or lost.

#### Acceptance Criteria

1. THE System SHALL NOT require changes to existing package data in the database
2. THE System SHALL NOT require migration of existing quote data
3. WHEN displaying existing quotes with linked packages, THE System SHALL recalculate prices using the corrected logic
4. THE System SHALL maintain the existing API response structure for price calculations
