# Requirements Document

## Introduction

This feature adds two new fields to the quote creation form: a quote title field and a destination field. These fields will help users better organize and identify quotes, making it easier to search, filter, and manage quotes in the system. The Quote model already supports these fields, but they are not currently exposed in the user interface.

## Glossary

- **Quote System**: THE system that manages quote creation, editing, and tracking for customer enquiries
- **Quote Form**: THE user interface component where admins create and edit quotes
- **Quote Title**: A descriptive name or label for a quote that helps identify it
- **Destination Field**: THE location or destination associated with the quote (e.g., "Benidorm", "Albufeira")
- **Admin User**: A user with administrative privileges who can create and manage quotes

## Requirements

### Requirement 1: Add Quote Title Field

**User Story:** As an admin user, I want to add a descriptive title to each quote, so that I can quickly identify and differentiate quotes without reading all the details.

#### Acceptance Criteria

1. WHEN THE Admin User views the quote creation form, THE Quote System SHALL display a "Quote Title" input field in the Lead Information section
2. WHEN THE Admin User enters a quote title, THE Quote System SHALL accept text input up to 200 characters
3. WHEN THE Admin User submits the form without a quote title, THE Quote System SHALL save the quote successfully with the title field as optional
4. WHEN THE Admin User enters a quote title exceeding 200 characters, THE Quote System SHALL display a validation error message
5. WHEN THE Admin User edits an existing quote with a title, THE Quote System SHALL display the existing title in the input field

### Requirement 2: Add Destination Field

**User Story:** As an admin user, I want to specify the destination for each quote, so that I can organize quotes by location and provide clear information to customers.

#### Acceptance Criteria

1. WHEN THE Admin User views the quote creation form, THE Quote System SHALL display a "Destination" input field in the Lead Information section
2. WHEN THE Admin User enters a destination, THE Quote System SHALL accept text input up to 100 characters
3. WHEN THE Admin User submits the form without a destination, THE Quote System SHALL save the quote successfully with the destination field as optional
4. WHEN THE Admin User enters a destination exceeding 100 characters, THE Quote System SHALL display a validation error message
5. WHEN THE Admin User edits an existing quote with a destination, THE Quote System SHALL display the existing destination in the input field

### Requirement 3: Form Validation and User Experience

**User Story:** As an admin user, I want clear feedback on the quote title and destination fields, so that I understand the requirements and can enter valid data.

#### Acceptance Criteria

1. WHEN THE Admin User focuses on the quote title field, THE Quote System SHALL display a character counter showing remaining characters
2. WHEN THE Admin User focuses on the destination field, THE Quote System SHALL display a character counter showing remaining characters
3. WHEN THE Admin User enters invalid data in either field, THE Quote System SHALL display inline validation error messages
4. WHEN THE Admin User successfully saves a quote with title and destination, THE Quote System SHALL persist both values to the database
5. WHEN THE Admin User views the quote list or details, THE Quote System SHALL display the quote title and destination if they exist

### Requirement 4: Integration with Existing Quote System

**User Story:** As a developer, I want the new fields to integrate seamlessly with the existing quote system, so that all existing functionality continues to work without issues.

#### Acceptance Criteria

1. WHEN THE Quote System saves a quote, THE Quote System SHALL include title and destination fields in the data payload
2. WHEN THE Quote System validates quote data, THE Quote System SHALL apply the same validation rules as defined in the Quote model schema
3. WHEN THE Quote System displays existing quotes, THE Quote System SHALL handle quotes with or without title and destination fields
4. WHEN THE Quote System links a super package to a quote, THE Quote System SHALL preserve any manually entered title and destination values
5. WHEN THE Quote System auto-populates fields from a package, THE Quote System SHALL not override manually entered title or destination values
