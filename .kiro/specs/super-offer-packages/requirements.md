# Requirements Document

## Introduction

This feature introduces a Super Offer Packages management system that allows administrators to create, manage, and link pre-configured destination packages to quotes. Super Offer Packages are standardized travel packages for specific destinations that include pricing matrices based on group size, duration, and travel dates, along with predefined inclusions and accommodation options. The system will streamline the quoting process by allowing admins to select from existing packages rather than manually entering all details each time.

## Requirements

### Requirement 1: Super Offer Package Data Model

**User Story:** As a system administrator, I want a structured data model for super offer packages, so that I can store all package details including pricing, inclusions, and metadata in a consistent format.

#### Acceptance Criteria

1. WHEN the system initializes THEN it SHALL create a SuperOfferPackage collection with the following fields:
   - Package identification (name, destination, resort)
   - Pricing matrix (group sizes, durations, seasonal pricing)
   - Inclusions list
   - Accommodation examples
   - Sales notes
   - Status (active/inactive)
   - Metadata (created by, dates, version)

2. WHEN storing pricing data THEN the system SHALL support multiple group size tiers (e.g., 6-11 people, 12+ people)

3. WHEN storing pricing data THEN the system SHALL support multiple duration options (e.g., 2 nights, 3 nights, 4 nights)

4. WHEN storing seasonal pricing THEN the system SHALL support month-based pricing with special date ranges (e.g., Easter, specific weekends)

5. WHEN storing pricing THEN the system SHALL support "ON REQUEST" as a valid pricing option

6. WHEN storing inclusions THEN the system SHALL maintain a structured list of what's included in the package

7. WHEN storing accommodation THEN the system SHALL maintain a list of example properties

### Requirement 2: Super Offer Package Creation and Management

**User Story:** As an administrator, I want to create and manage super offer packages through an admin interface, so that I can maintain up-to-date package offerings for different destinations.

#### Acceptance Criteria

1. WHEN an admin accesses the super packages section THEN the system SHALL display a list of all existing packages with key details (destination, resort, status, last updated)

2. WHEN an admin clicks "Create New Package" THEN the system SHALL display a form with fields for:
   - Package name
   - Destination
   - Resort
   - Currency
   - Status (active/inactive)

3. WHEN creating a package THEN the admin SHALL be able to define group size tiers with labels (e.g., "6-11 People", "12+ People")

4. WHEN creating a package THEN the admin SHALL be able to define duration options (number of nights)

5. WHEN creating a package THEN the admin SHALL be able to input pricing for each combination of month/period, group size, and duration

6. WHEN entering pricing THEN the admin SHALL be able to enter "ON REQUEST" instead of a numeric value

7. WHEN creating a package THEN the admin SHALL be able to add multiple inclusions with descriptions

8. WHEN creating a package THEN the admin SHALL be able to add multiple accommodation examples

9. WHEN creating a package THEN the admin SHALL be able to add sales notes

10. WHEN saving a package THEN the system SHALL validate that all required fields are completed

11. WHEN saving a package THEN the system SHALL store the admin user ID and timestamp

### Requirement 3: Super Offer Package Import from CSV

**User Story:** As an administrator, I want to import super offer packages from CSV files, so that I can quickly populate the system with existing package data.

#### Acceptance Criteria

1. WHEN an admin uploads a CSV file THEN the system SHALL parse the file structure to identify:
   - Resort and destination information
   - Group size tiers
   - Duration options
   - Pricing matrix
   - Inclusions section
   - Sales notes section

2. WHEN parsing the CSV THEN the system SHALL correctly handle the multi-row header structure

3. WHEN parsing pricing THEN the system SHALL correctly identify month names and special periods (e.g., "Easter (02/04/2025 - 06/04/2025)")

4. WHEN parsing pricing THEN the system SHALL correctly handle currency symbols (€, £, $)

5. WHEN parsing pricing THEN the system SHALL recognize "ON REQUEST" as a valid pricing option

6. WHEN parsing inclusions THEN the system SHALL extract all bullet-pointed items

7. WHEN parsing is complete THEN the system SHALL display a preview of the extracted data for admin review

8. WHEN the admin confirms the import THEN the system SHALL create the super offer package record

9. IF parsing errors occur THEN the system SHALL display clear error messages indicating what went wrong

### Requirement 4: Super Offer Package Listing and Search

**User Story:** As an administrator, I want to view and search through all super offer packages, so that I can quickly find the package I need when creating quotes.

#### Acceptance Criteria

1. WHEN an admin views the packages list THEN the system SHALL display packages in a table with columns:
   - Package name
   - Destination
   - Resort
   - Price range
   - Status
   - Last updated
   - Actions

2. WHEN viewing the list THEN the system SHALL support filtering by:
   - Destination
   - Status (active/inactive)
   - Resort

3. WHEN viewing the list THEN the system SHALL support search by package name

4. WHEN viewing the list THEN the system SHALL display active packages first

5. WHEN an admin clicks on a package THEN the system SHALL display the full package details including pricing matrix and inclusions

### Requirement 5: Super Offer Package Editing

**User Story:** As an administrator, I want to edit existing super offer packages, so that I can update pricing and details as they change.

#### Acceptance Criteria

1. WHEN an admin clicks "Edit" on a package THEN the system SHALL display the package form pre-populated with current data

2. WHEN editing a package THEN the admin SHALL be able to modify all package fields

3. WHEN saving edits THEN the system SHALL update the package record with new data

4. WHEN saving edits THEN the system SHALL update the "last modified" timestamp and user

5. WHEN saving edits THEN the system SHALL maintain version history for audit purposes

### Requirement 6: Linking Super Offer Packages to Quotes

**User Story:** As an administrator, I want to link a super offer package to a quote, so that the quote is automatically populated with package details and pricing.

#### Acceptance Criteria

1. WHEN creating or editing a quote THEN the admin SHALL see an option to "Select Super Package"

2. WHEN clicking "Select Super Package" THEN the system SHALL display a searchable list of active packages

3. WHEN selecting a package THEN the system SHALL prompt the admin to specify:
   - Number of people (to determine group size tier)
   - Number of nights (to determine duration)
   - Arrival date (to determine seasonal pricing)

4. WHEN the admin confirms selections THEN the system SHALL automatically populate the quote with:
   - Calculated price based on selections
   - Inclusions from the package
   - Accommodation examples in internal notes
   - Package reference

5. WHEN a package is linked THEN the quote SHALL store the package ID as a reference

6. WHEN a package is linked THEN the quote SHALL store the specific pricing tier and period used

7. WHEN a linked package's pricing is "ON REQUEST" THEN the system SHALL allow the admin to manually enter the price

8. WHEN a package is linked THEN the admin SHALL still be able to manually adjust the quote details if needed

### Requirement 7: Super Offer Package Pricing Calculator

**User Story:** As an administrator, I want the system to automatically calculate the correct price based on my selections, so that I don't have to manually look up prices in the matrix.

#### Acceptance Criteria

1. WHEN the admin selects number of people THEN the system SHALL determine the appropriate group size tier

2. WHEN the admin selects number of nights THEN the system SHALL determine the appropriate duration option

3. WHEN the admin selects arrival date THEN the system SHALL determine the appropriate pricing period (month or special period)

4. WHEN all selections are made THEN the system SHALL calculate the per-person price from the pricing matrix

5. WHEN the price is calculated THEN the system SHALL multiply by the number of people to get the total package price

6. WHEN the pricing is "ON REQUEST" THEN the system SHALL display a message and allow manual price entry

7. WHEN the arrival date spans multiple pricing periods THEN the system SHALL use the pricing for the arrival month

### Requirement 8: Super Offer Package Status Management

**User Story:** As an administrator, I want to activate or deactivate super offer packages, so that I can control which packages are available for selection without deleting them.

#### Acceptance Criteria

1. WHEN an admin views a package THEN they SHALL see the current status (active/inactive)

2. WHEN an admin clicks "Deactivate" on an active package THEN the system SHALL change the status to inactive

3. WHEN an admin clicks "Activate" on an inactive package THEN the system SHALL change the status to active

4. WHEN a package is inactive THEN it SHALL NOT appear in the package selection list for quotes

5. WHEN a package is inactive THEN it SHALL still be visible in the admin packages list with an "Inactive" indicator

6. WHEN a package is inactive THEN existing quotes linked to it SHALL remain unchanged

### Requirement 9: Super Offer Package Deletion

**User Story:** As an administrator, I want to delete super offer packages that are no longer needed, so that I can keep the system clean and organized.

#### Acceptance Criteria

1. WHEN an admin clicks "Delete" on a package THEN the system SHALL display a confirmation dialog

2. WHEN confirming deletion THEN the system SHALL check if any quotes are linked to the package

3. IF quotes are linked to the package THEN the system SHALL display a warning with the number of linked quotes

4. IF the admin confirms deletion with linked quotes THEN the system SHALL soft-delete the package (mark as deleted but retain data)

5. IF no quotes are linked THEN the system SHALL allow hard deletion (permanent removal)

6. WHEN a package is soft-deleted THEN it SHALL NOT appear in any selection lists

7. WHEN a package is soft-deleted THEN linked quotes SHALL retain all package data

### Requirement 10: Quote Integration and Display

**User Story:** As an administrator, I want to see which super offer package is linked to a quote, so that I can understand the source of the quote details.

#### Acceptance Criteria

1. WHEN viewing a quote that has a linked package THEN the system SHALL display the package name and reference

2. WHEN viewing a quote with a linked package THEN the system SHALL display a link to view the full package details

3. WHEN viewing a quote with a linked package THEN the system SHALL display which pricing tier and period were used

4. WHEN viewing a quote without a linked package THEN the system SHALL indicate it was manually created

5. WHEN exporting or emailing a quote THEN the package reference SHALL be included in internal documentation but not in customer-facing content
