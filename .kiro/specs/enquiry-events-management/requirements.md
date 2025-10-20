# Requirements Document

## Introduction

This feature enables administrators to manage events/activities that can be selected during the enquiry submission process. Events will be destination-specific and categorized to allow for better organization and filtering. This replaces the current hardcoded event list with a dynamic, manageable system.

## Glossary

- **Event System**: The collection management system for events/activities that can be requested in enquiries
- **Event**: An activity or service that can be requested as part of a trip enquiry (e.g., "Boat Party", "Club Entry")
- **Category**: A classification tag for events (e.g., "Day", "Night", "Adult", "Stag", "Hen")
- **Destination Association**: The link between an event and specific destinations where it's available
- **Admin Interface**: The administrative UI for managing events, categories, and destination associations
- **Enquiry Form**: The customer-facing form where events are selected

## Requirements

### Requirement 1: Event Data Model

**User Story:** As a system administrator, I want events to be stored in a database with proper structure, so that they can be managed dynamically

#### Acceptance Criteria

1. THE Event System SHALL store each event with a unique identifier, name, description, active status, and creation metadata
2. THE Event System SHALL associate each event with one or more destinations
3. THE Event System SHALL associate each event with one or more categories
4. THE Event System SHALL support enabling or disabling events without deletion
5. THE Event System SHALL maintain audit trails for event creation and modification

### Requirement 2: Category Management

**User Story:** As a system administrator, I want to define and manage event categories, so that events can be organized and filtered effectively

#### Acceptance Criteria

1. THE Event System SHALL support predefined categories including "Day", "Night", "Adult", "Stag", and "Hen"
2. THE Event System SHALL allow administrators to create custom categories
3. THE Event System SHALL allow a single event to belong to multiple categories
4. THE Event System SHALL validate that at least one category is assigned to each active event
5. THE Event System SHALL display category information in the admin interface

### Requirement 3: Destination-Specific Events

**User Story:** As a system administrator, I want to associate events with specific destinations, so that only relevant events are shown for each location

#### Acceptance Criteria

1. THE Event System SHALL allow administrators to assign events to one or more destinations
2. THE Event System SHALL allow events to be marked as "available in all destinations"
3. WHEN an enquiry form is loaded, THE Event System SHALL display only events available for the selected destination
4. THE Event System SHALL validate that at least one destination is assigned to each active event
5. THE Event System SHALL support bulk assignment of events to multiple destinations

### Requirement 4: Admin Event Management Interface

**User Story:** As a system administrator, I want a user-friendly interface to manage events, so that I can easily add, edit, and organize events

#### Acceptance Criteria

1. THE Admin Interface SHALL display a list of all events with their name, categories, destinations, and status
2. THE Admin Interface SHALL provide search and filter capabilities by name, category, destination, and status
3. THE Admin Interface SHALL allow administrators to create new events with all required fields
4. THE Admin Interface SHALL allow administrators to edit existing events
5. THE Admin Interface SHALL allow administrators to activate or deactivate events
6. THE Admin Interface SHALL display validation errors clearly when saving events
7. THE Admin Interface SHALL provide bulk actions for activating, deactivating, or deleting multiple events

### Requirement 5: Event Form Integration

**User Story:** As an agent submitting an enquiry, I want to see only relevant events for my selected destination, so that I can choose appropriate activities

#### Acceptance Criteria

1. WHEN a destination is selected in the enquiry form, THE Enquiry Form SHALL load and display only events available for that destination
2. THE Enquiry Form SHALL group events by category for easier selection
3. THE Enquiry Form SHALL display events in a checkbox format allowing multiple selections
4. THE Enquiry Form SHALL show event descriptions when available
5. THE Enquiry Form SHALL handle cases where no destination is selected by showing all events or a default set

### Requirement 6: Category Filtering in Enquiry Form

**User Story:** As an agent submitting an enquiry, I want to filter events by category, so that I can quickly find relevant activities

#### Acceptance Criteria

1. THE Enquiry Form SHALL display category filter buttons or tabs
2. WHEN a category filter is selected, THE Enquiry Form SHALL show only events in that category
3. THE Enquiry Form SHALL allow multiple category filters to be active simultaneously
4. THE Enquiry Form SHALL display a count of events in each category
5. THE Enquiry Form SHALL provide a "Show All" option to clear category filters

### Requirement 7: Event API Endpoints

**User Story:** As a developer, I want RESTful API endpoints for event management, so that the system can be integrated with other services

#### Acceptance Criteria

1. THE Event System SHALL provide a GET endpoint to retrieve all events with optional filters
2. THE Event System SHALL provide a GET endpoint to retrieve events by destination
3. THE Event System SHALL provide a POST endpoint to create new events
4. THE Event System SHALL provide a PUT endpoint to update existing events
5. THE Event System SHALL provide a DELETE endpoint to soft-delete events
6. THE Event System SHALL provide a PATCH endpoint to update event status
7. THE Event System SHALL return appropriate HTTP status codes and error messages

### Requirement 8: Data Migration

**User Story:** As a system administrator, I want existing hardcoded events to be migrated to the database, so that no data is lost during the transition

#### Acceptance Criteria

1. THE Event System SHALL provide a migration script to convert hardcoded events to database records
2. THE Migration SHALL assign appropriate categories to each migrated event
3. THE Migration SHALL mark all migrated events as available in all destinations by default
4. THE Migration SHALL preserve the original event names and create descriptions where appropriate
5. THE Migration SHALL be idempotent and safe to run multiple times

### Requirement 9: Performance and Caching

**User Story:** As a system user, I want the event system to load quickly, so that the enquiry form remains responsive

#### Acceptance Criteria

1. THE Event System SHALL cache event data to minimize database queries
2. THE Event System SHALL invalidate cache when events are created, updated, or deleted
3. THE Event System SHALL load events asynchronously in the enquiry form
4. THE Event System SHALL respond to API requests within 200ms for cached data
5. THE Event System SHALL handle up to 500 events without performance degradation

### Requirement 10: Validation and Error Handling

**User Story:** As a system administrator, I want clear validation and error messages, so that I can correct issues when managing events

#### Acceptance Criteria

1. THE Event System SHALL validate that event names are unique within the system
2. THE Event System SHALL validate that event names are between 2 and 100 characters
3. THE Event System SHALL validate that at least one category is selected for active events
4. THE Event System SHALL validate that at least one destination is selected for active events
5. THE Event System SHALL provide clear, actionable error messages for all validation failures
6. THE Event System SHALL prevent deletion of events that are referenced in existing enquiries
