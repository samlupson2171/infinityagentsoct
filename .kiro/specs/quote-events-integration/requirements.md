# Requirements Document

## Introduction

This feature enables admins to add events to quotes by selecting from a destination-filtered event list. Selected events will be displayed in the quote and their prices will be added to the total quote price. This replaces the current simple "Activities Included" text field with a structured event selection system.

## Glossary

- **Quote System**: The admin interface for creating and managing customer quotes
- **Event**: A bookable activity or experience with pricing information (from the Events Management system)
- **Destination Filter**: Filtering mechanism that shows only events relevant to the quote's destination
- **Event Price**: The cost of an individual event that contributes to the total quote price
- **Quote Total**: The sum of base package price plus all selected event prices

## Requirements

### Requirement 1

**User Story:** As an admin creating a quote, I want to select events from a filtered list based on the destination, so that I can add relevant activities to the quote

#### Acceptance Criteria

1. WHEN THE Admin views the quote form, THE Quote System SHALL display an event selection interface instead of the "Activities Included" text field
2. WHEN THE Admin has entered a destination in the quote, THE Quote System SHALL filter the event list to show only events matching that destination
3. WHEN THE Admin selects an event from the list, THE Quote System SHALL add the event to the quote's selected events
4. WHEN THE Admin removes a selected event, THE Quote System SHALL remove the event from the quote's selected events
5. WHERE no destination is specified, THE Quote System SHALL display all available active events

### Requirement 2

**User Story:** As an admin, I want selected event prices to automatically update the quote total, so that the pricing is accurate and reflects all included activities

#### Acceptance Criteria

1. WHEN THE Admin selects an event with a price, THE Quote System SHALL add the event price to the quote total price
2. WHEN THE Admin removes a selected event, THE Quote System SHALL subtract the event price from the quote total price
3. WHEN THE Admin manually adjusts the total price after selecting events, THE Quote System SHALL mark the price as custom and preserve the manual adjustment
4. THE Quote System SHALL display a price breakdown showing base price and event prices separately
5. THE Quote System SHALL recalculate the total price whenever events are added or removed

### Requirement 3

**User Story:** As an admin, I want to see which events are included in a quote, so that I can review and manage the quote contents

#### Acceptance Criteria

1. THE Quote System SHALL display a list of all selected events with their names and prices
2. THE Quote System SHALL allow the admin to remove individual events from the selection
3. THE Quote System SHALL show the total additional cost from all selected events
4. WHEN THE Admin views an existing quote, THE Quote System SHALL load and display previously selected events
5. THE Quote System SHALL persist selected events when saving the quote

### Requirement 4

**User Story:** As an admin, I want the event selection to integrate with the existing package system, so that I can add events to both package-based and custom quotes

#### Acceptance Criteria

1. WHEN THE Admin selects a super package, THE Quote System SHALL preserve any previously selected events
2. WHEN THE Admin adds events to a package-based quote, THE Quote System SHALL add event prices to the package price
3. THE Quote System SHALL maintain price synchronization between package prices and event prices
4. WHEN THE Admin unlinks a package, THE Quote System SHALL preserve selected events and their prices
5. THE Quote System SHALL display package price and event prices as separate line items

### Requirement 5

**User Story:** As an admin, I want event selections to be saved with the quote, so that the information is available when viewing or editing the quote later

#### Acceptance Criteria

1. THE Quote System SHALL store event IDs, names, and prices in the quote document
2. WHEN THE Admin saves a quote, THE Quote System SHALL persist all selected events to the database
3. WHEN THE Admin loads an existing quote, THE Quote System SHALL retrieve and display selected events
4. THE Quote System SHALL handle cases where a previously selected event has been deleted or deactivated
5. THE Quote System SHALL maintain event price history for audit purposes

### Requirement 6

**User Story:** As an admin, I want to specify whether each event price is per person or per event, so that the quote total accurately reflects the pricing model for each activity

#### Acceptance Criteria

1. WHEN THE Admin selects an event, THE Quote System SHALL allow toggling between per-person and per-event pricing
2. WHEN THE Admin marks an event as per-person pricing, THE Quote System SHALL multiply the event price by the number of people
3. WHEN THE Admin marks an event as per-event pricing, THE Quote System SHALL use the flat event price
4. THE Quote System SHALL display the pricing type clearly for each selected event
5. THE Quote System SHALL persist the pricing type (per-person or per-event) with each selected event
6. WHEN THE Admin changes the number of people, THE Quote System SHALL recalculate prices for per-person events
7. THE Quote System SHALL show the calculation breakdown for per-person events (e.g., "£50 × 10 people")
