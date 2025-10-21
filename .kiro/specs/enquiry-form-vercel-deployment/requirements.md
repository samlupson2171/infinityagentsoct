# Requirements Document

## Introduction

The enquiry form with events section has been implemented locally but is not appearing on the live Vercel deployment. This feature allows travel agents to select events/activities when submitting enquiries for their clients. The events section is critical for the enquiry workflow and must be available on the production site.

## Glossary

- **Enquiry Form**: THE web form used by travel agents to submit client trip requests
- **Events Section**: THE component within the enquiry form that displays and allows selection of activities/events
- **EventSelector Component**: THE React component responsible for fetching and displaying available events
- **Events API**: THE backend API endpoint at `/api/events` that provides event data
- **Categories API**: THE backend API endpoint at `/api/admin/events/categories` that provides event category data
- **Vercel Deployment**: THE production hosting platform where the application is deployed
- **Build Process**: THE compilation and optimization process that prepares the application for deployment

## Requirements

### Requirement 1

**User Story:** As a travel agent, I want to see and select events/activities in the enquiry form on the live site, so that I can specify my client's activity preferences

#### Acceptance Criteria

1. WHEN a travel agent accesses the enquiry form on the live Vercel deployment, THE Enquiry Form SHALL display the events section with available events
2. WHEN a travel agent selects a destination in the enquiry form, THE EventSelector Component SHALL fetch and display events available for that destination
3. WHEN the events API is called on the live site, THE Events API SHALL return active events with proper category data
4. WHEN the categories API is called on the live site, THE Categories API SHALL return active categories for filtering events
5. WHEN the application is built for Vercel deployment, THE Build Process SHALL include all events-related API routes and components

### Requirement 2

**User Story:** As a developer, I want to identify why the events section is not deploying to Vercel, so that I can fix the deployment configuration

#### Acceptance Criteria

1. WHEN reviewing the git commit history, THE System SHALL show that events-related files were committed and pushed
2. WHEN examining the Vercel build logs, THE System SHALL reveal any build errors or warnings related to events functionality
3. WHEN checking the API routes structure, THE System SHALL confirm that `/api/events` and `/api/admin/events/categories` routes exist
4. WHEN verifying environment variables, THE System SHALL confirm all required database and API configurations are present in Vercel
5. WHEN testing the deployed API endpoints directly, THE System SHALL return proper responses or error messages

### Requirement 3

**User Story:** As a developer, I want to ensure the events functionality deploys correctly to Vercel, so that the feature is available to users

#### Acceptance Criteria

1. WHEN the application is deployed to Vercel, THE Vercel Deployment SHALL successfully build all events-related API routes
2. WHEN the events API routes are accessed on the live site, THE Events API SHALL connect to the database and return event data
3. WHEN the EventSelector component loads on the live site, THE EventSelector Component SHALL successfully fetch events from the API
4. WHEN a build error occurs, THE Build Process SHALL provide clear error messages for debugging
5. WHEN the deployment completes, THE System SHALL verify that events functionality works end-to-end on production
