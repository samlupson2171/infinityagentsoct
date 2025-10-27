# Requirements Document

## Introduction

The Infinity Weekends platform requires a simple, reliable email solution to replace the current Resend dependency. The system currently sends various transactional emails including registration confirmations, admin notifications, quote emails, and enquiry notifications. The new solution must be easy to configure, reliable, and work with standard SMTP providers without complex authentication issues.

## Glossary

- **Email System**: The complete email delivery infrastructure including configuration, templates, and sending logic
- **SMTP**: Simple Mail Transfer Protocol - the standard protocol for sending emails
- **Transporter**: The nodemailer transport instance that handles email delivery
- **Email Template**: HTML-formatted email content with dynamic data placeholders
- **Retry Mechanism**: Automatic retry logic with exponential backoff for failed email deliveries
- **Email Validation**: Verification of email addresses and content before sending
- **Admin Notification**: Email sent to system administrators for important events
- **Transactional Email**: Automated emails triggered by user actions (registration, quotes, etc.)

## Requirements

### Requirement 1

**User Story:** As a system administrator, I want a simple SMTP-based email solution, so that I can send emails reliably without depending on third-party services like Resend

#### Acceptance Criteria

1. WHEN THE Email System initializes, THE Email System SHALL create a nodemailer transporter using SMTP configuration from environment variables
2. WHERE SMTP configuration is incomplete, THE Email System SHALL throw a clear error message indicating which environment variables are missing
3. THE Email System SHALL support standard SMTP providers including Gmail, Microsoft 365, SendGrid SMTP, and generic SMTP servers
4. THE Email System SHALL validate SMTP configuration on startup using the verify method
5. THE Email System SHALL log successful configuration verification and detailed error messages for failures

### Requirement 2

**User Story:** As a system administrator, I want automatic retry logic for failed emails, so that temporary network issues don't result in lost communications

#### Acceptance Criteria

1. WHEN an email send operation fails, THE Email System SHALL retry the operation up to 3 times with exponential backoff
2. THE Email System SHALL wait 1 second before the first retry, 2 seconds before the second retry, and 4 seconds before the third retry
3. WHEN all retry attempts fail, THE Email System SHALL throw an error with details of all failed attempts
4. THE Email System SHALL log each retry attempt with attempt number and error details
5. WHEN an email sends successfully on any retry attempt, THE Email System SHALL log the success and return immediately without further retries

### Requirement 3

**User Story:** As a system administrator, I want comprehensive email validation, so that invalid emails are caught before attempting to send

#### Acceptance Criteria

1. THE Email System SHALL validate recipient email addresses using a standard email regex pattern
2. WHEN a recipient email address is invalid or missing, THE Email System SHALL throw an EmailDeliveryError with a descriptive message
3. THE Email System SHALL validate that email subject is present and not empty
4. THE Email System SHALL validate that email content (HTML or text) is present
5. THE Email System SHALL perform validation before any send attempts to fail fast on invalid data

### Requirement 4

**User Story:** As a developer, I want to send registration confirmation emails to new users, so that they know their registration was received

#### Acceptance Criteria

1. THE Email System SHALL provide a sendRegistrationConfirmationEmail function that accepts user name, email, company name, and optional consortia
2. THE Email System SHALL generate HTML email content with the Infinity Weekends branding and styling
3. THE Email System SHALL include registration summary with user details in the email body
4. THE Email System SHALL explain the approval process and expected timeline in the email
5. THE Email System SHALL send the email with retry logic and return the message ID on success

### Requirement 5

**User Story:** As a system administrator, I want to receive notifications when new agencies register, so that I can review and approve them promptly

#### Acceptance Criteria

1. THE Email System SHALL provide a sendAdminNotificationEmail function that sends to all admin users in the database
2. THE Email System SHALL include complete agency registration details in the notification email
3. THE Email System SHALL provide direct links to the admin dashboard and user management pages
4. THE Email System SHALL send notifications to multiple admins in parallel and report success/failure for each
5. WHEN no admin users exist in the database, THE Email System SHALL log a warning and return null without throwing an error

### Requirement 6

**User Story:** As a system administrator, I want to send approval notifications with contract signing links, so that approved users can complete the onboarding process

#### Acceptance Criteria

1. THE Email System SHALL provide a sendApprovalNotificationEmail function that generates secure contract access tokens
2. THE Email System SHALL include a prominent call-to-action button with the contract signing URL
3. THE Email System SHALL indicate that the contract link expires in 7 days
4. THE Email System SHALL explain what happens after contract signing
5. THE Email System SHALL return the contract token and URL along with the email message ID

### Requirement 7

**User Story:** As a system administrator, I want to send rejection notifications to users, so that they understand why their registration was not approved

#### Acceptance Criteria

1. THE Email System SHALL provide a sendRejectionNotificationEmail function that accepts user details and optional rejection reason
2. THE Email System SHALL include the rejection reason in the email when provided
3. THE Email System SHALL provide contact information for users to discuss their registration
4. THE Email System SHALL maintain a professional and respectful tone in rejection emails
5. THE Email System SHALL send the email with retry logic and return the message ID on success

### Requirement 8

**User Story:** As a travel agent, I want to receive enquiry confirmation emails, so that I have a record of my submitted enquiries

#### Acceptance Criteria

1. THE Email System SHALL provide a sendEnquiryConfirmationEmail function that accepts enquiry details
2. THE Email System SHALL include enquiry summary with key details (ID, lead name, destinations, travel date)
3. THE Email System SHALL explain the next steps and expected response timeline
4. THE Email System SHALL provide contact information for urgent questions
5. THE Email System SHALL send the email with retry logic and return the message ID on success

### Requirement 9

**User Story:** As a system administrator, I want to receive enquiry notifications, so that I can respond to customer requests promptly

#### Acceptance Criteria

1. THE Email System SHALL provide a sendEnquiryNotificationEmail function that sends to the configured admin email address
2. THE Email System SHALL include complete enquiry details including trip type, destinations, dates, budget, and events
3. THE Email System SHALL format currency values with proper locale formatting
4. THE Email System SHALL include agent information for direct response
5. THE Email System SHALL send the email with retry logic and return the message ID on success

### Requirement 10

**User Story:** As a travel agent, I want to receive professional quote emails, so that I can present attractive offers to my clients

#### Acceptance Criteria

1. THE Email System SHALL provide a sendQuoteEmail function that accepts comprehensive quote details
2. THE Email System SHALL generate visually appealing HTML emails with gradient backgrounds and modern styling
3. THE Email System SHALL include trip summary, inclusions, pricing breakdown, and call-to-action button
4. THE Email System SHALL calculate and display per-person pricing
5. THE Email System SHALL include a booking interest link that directs to the platform

### Requirement 11

**User Story:** As a system administrator, I want to receive notifications when quotes are created, so that I can monitor quote activity

#### Acceptance Criteria

1. THE Email System SHALL provide a sendQuoteAdminNotificationEmail function that sends to all admin users
2. THE Email System SHALL include quote details, client information, and pricing
3. THE Email System SHALL include linked package information when a super package is used
4. THE Email System SHALL provide a direct link to the quotes management page
5. THE Email System SHALL send notifications to multiple admins in parallel and report success/failure for each

### Requirement 12

**User Story:** As a system administrator, I want to test email configuration, so that I can verify emails are working before going live

#### Acceptance Criteria

1. THE Email System SHALL provide a sendTestEmail function that accepts recipient, sender email, and sender name
2. THE Email System SHALL send a simple test email with configuration details
3. THE Email System SHALL validate email data before sending
4. THE Email System SHALL use retry logic for test emails
5. THE Email System SHALL return the message ID on successful delivery

### Requirement 13

**User Story:** As a developer, I want clear error messages for email failures, so that I can quickly diagnose and fix issues

#### Acceptance Criteria

1. THE Email System SHALL use a custom EmailDeliveryError class for all email-related errors
2. THE Email System SHALL include the original error message in thrown errors
3. THE Email System SHALL log detailed error information including stack traces
4. THE Email System SHALL differentiate between configuration errors and delivery errors
5. THE Email System SHALL provide actionable error messages that guide troubleshooting

### Requirement 14

**User Story:** As a system administrator, I want connection pooling and rate limiting, so that the email system performs efficiently under load

#### Acceptance Criteria

1. THE Email System SHALL enable connection pooling with a maximum of 5 concurrent connections
2. THE Email System SHALL limit to 100 messages per connection before reconnecting
3. THE Email System SHALL implement rate limiting of 5 emails per second
4. THE Email System SHALL set appropriate timeouts (60s connection, 30s greeting, 60s socket)
5. THE Email System SHALL reuse the transporter instance across multiple email sends

### Requirement 15

**User Story:** As a developer, I want consistent email branding, so that all emails maintain the Infinity Weekends visual identity

#### Acceptance Criteria

1. THE Email System SHALL include the Infinity Weekends logo in all email templates
2. THE Email System SHALL use consistent color scheme (primary blue #007bff, success green #28a745, warning yellow #ffc107)
3. THE Email System SHALL use consistent typography (Arial font family, appropriate font sizes)
4. THE Email System SHALL include consistent footer with copyright and automated message notice
5. THE Email System SHALL format dates consistently using UK locale (en-GB)
