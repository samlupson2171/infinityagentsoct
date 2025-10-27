# Implementation Plan

- [x] 1. Audit and consolidate existing email implementation
  - Review src/lib/email.ts to identify all existing email functions
  - Review src/lib/resend-email.ts to identify any missing functionality
  - Document all email types currently in use across the application
  - Identify all files that import from '@/lib/resend-email'
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Enhance SMTP configuration and validation
  - [x] 2.1 Update createTransporter function with comprehensive SMTP configuration
    - Add support for all standard SMTP providers
    - Implement provider-specific settings detection (Microsoft 365, Gmail, etc.)
    - Add connection pooling configuration (maxConnections: 5, maxMessages: 100)
    - Add rate limiting configuration (rateLimit: 5, rateDelta: 1000)
    - Add timeout configuration (connectionTimeout: 60000, greetingTimeout: 30000, socketTimeout: 60000)
    - _Requirements: 1.1, 1.3, 14.1, 14.2, 14.3, 14.4_
  
  - [x] 2.2 Enhance configuration validation and error handling
    - Validate all required environment variables (SMTP_HOST, SMTP_USER, SMTP_PASS)
    - Throw descriptive errors for missing configuration
    - Add verifyEmailConfig function to test SMTP connection on startup
    - Log successful verification and detailed error messages
    - _Requirements: 1.2, 1.4, 1.5, 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 3. Implement robust retry mechanism
  - [x] 3.1 Create sendEmailWithRetry function with exponential backoff
    - Implement retry loop with configurable maxRetries (default: 3)
    - Implement exponential backoff delay calculation (delay * 2^(attempt-1))
    - Log each retry attempt with attempt number and error details
    - Return immediately on first successful send
    - Throw error with all attempt details after final failure
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 4. Implement comprehensive email validation
  - [x] 4.1 Create email validation functions
    - Implement validateEmailAddress function with regex pattern
    - Implement validateEmailData function for required fields
    - Create custom EmailDeliveryError class for validation failures
    - Add descriptive error messages for each validation failure
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 13.1, 13.2_

- [ ] 5. Implement registration confirmation email
  - [x] 5.1 Create or update sendRegistrationConfirmationEmail function
    - Accept user name, email, company name, and optional consortia
    - Generate HTML email with Infinity Weekends branding
    - Include registration summary with user details
    - Explain approval process and timeline
    - Use sendEmailWithRetry for delivery
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 6. Implement admin notification email
  - [ ] 6.1 Create or update sendAdminNotificationEmail function
    - Query database for all admin users
    - Generate HTML email with complete agency registration details
    - Include direct links to admin dashboard and user management
    - Send to all admins in parallel using Promise.allSettled
    - Return summary with success/failure counts for each admin
    - Handle case where no admin users exist (log warning, return null)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 7. Implement approval notification email
  - [ ] 7.1 Create or update sendApprovalNotificationEmail function
    - Generate secure contract access token using contract-tokens module
    - Create contract signing URL
    - Generate HTML email with prominent CTA button
    - Indicate 7-day expiration for contract link
    - Explain post-signing access and benefits
    - Return contract token, URL, and message ID
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 8. Implement rejection notification email
  - [ ] 8.1 Create or update sendRejectionNotificationEmail function
    - Accept user details and optional rejection reason
    - Generate HTML email with professional, respectful tone
    - Include rejection reason when provided
    - Provide contact information for discussion
    - Use sendEmailWithRetry for delivery
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 9. Implement enquiry confirmation email
  - [ ] 9.1 Create or update sendEnquiryConfirmationEmail function
    - Accept enquiry details (ID, lead name, trip type, destinations, dates)
    - Generate HTML email with enquiry summary
    - Explain next steps and response timeline
    - Provide contact information for urgent questions
    - Use sendEmailWithRetry for delivery
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 10. Implement enquiry notification email
  - [ ] 10.1 Create or update sendEnquiryNotificationEmail function
    - Accept comprehensive enquiry details (trip, budget, events, agent info)
    - Generate HTML email with complete enquiry information
    - Format currency values with proper locale formatting
    - Include agent information for direct response
    - Send to configured admin email address
    - Use sendEmailWithRetry for delivery
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 11. Implement quote email
  - [ ] 11.1 Create or update sendQuoteEmail function
    - Accept comprehensive quote details (hotel, dates, pricing, inclusions)
    - Generate visually appealing HTML with gradient backgrounds
    - Include trip summary, inclusions, and pricing breakdown
    - Calculate and display per-person pricing
    - Include booking interest CTA button with link
    - Support super package details when applicable
    - Use sendEmailWithRetry for delivery
    - Return success status, message ID, and quote reference
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 12. Implement quote admin notification email
  - [ ] 12.1 Create or update sendQuoteAdminNotificationEmail function
    - Query database for all admin users
    - Generate HTML email with quote details and client information
    - Include linked package information when super package is used
    - Provide direct link to quotes management page
    - Send to all admins in parallel using Promise.allSettled
    - Return summary with success/failure counts for each admin
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 13. Implement test email function
  - [ ] 13.1 Create or update sendTestEmail function
    - Accept recipient email, sender email, and sender name
    - Generate simple test email with configuration details
    - Validate email data before sending
    - Use sendEmailWithRetry for delivery
    - Return message ID on success
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 14. Update all application code to use consolidated email module
  - [ ] 14.1 Find and update all imports from '@/lib/resend-email'
    - Search codebase for "from '@/lib/resend-email'"
    - Replace with "from '@/lib/email'"
    - Verify function signatures match
    - Update any Resend-specific code patterns
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 15. Update environment configuration
  - [x] 15.1 Update .env.example with SMTP-only configuration
    - Remove RESEND_API_KEY and RESEND_FROM_EMAIL variables
    - Document SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE
    - Add configuration examples for common providers
    - Add comments explaining each variable
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 15.2 Update documentation files
    - Update README with SMTP setup instructions
    - Remove Resend references from all documentation
    - Add troubleshooting guide for common SMTP issues
    - Update deployment guide with SMTP configuration steps
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 16. Remove Resend dependencies
  - [x] 16.1 Clean up Resend-specific code and dependencies
    - Delete src/lib/resend-email.ts file
    - Remove 'resend' package from package.json
    - Remove Resend environment variables from .env files
    - Update any remaining Resend references in comments
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 17. Test email functionality
  - [ ] 17.1 Test SMTP configuration and connection
    - Test verifyEmailConfig function with valid configuration
    - Test error handling for missing configuration
    - Test connection to actual SMTP server
    - Verify connection pooling and rate limiting
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 14.1, 14.2, 14.3, 14.4, 14.5_
  
  - [ ] 17.2 Test retry mechanism
    - Test successful send on first attempt
    - Test successful send after retry
    - Test failure after all retries
    - Verify exponential backoff timing
    - Verify logging of retry attempts
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ] 17.3 Test validation functions
    - Test email address validation with valid and invalid formats
    - Test required field validation
    - Test error messages for validation failures
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ] 17.4 Test all email templates
    - Send test registration confirmation email
    - Send test admin notification email
    - Send test approval notification email
    - Send test rejection notification email
    - Send test enquiry confirmation email
    - Send test enquiry notification email
    - Send test quote email
    - Send test quote admin notification email
    - Send test email using sendTestEmail function
    - Verify all emails render correctly in email clients
    - _Requirements: 4.1-4.5, 5.1-5.5, 6.1-6.5, 7.1-7.5, 8.1-8.5, 9.1-9.5, 10.1-10.5, 11.1-11.5, 12.1-12.5, 15.1-15.5_

- [ ] 18. Deploy and monitor
  - [ ] 18.1 Deploy to production
    - Update production environment variables with SMTP configuration
    - Deploy updated code to production
    - Monitor application logs for email-related errors
    - Verify all email types are working in production
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ] 18.2 Monitor email delivery metrics
    - Track email delivery success rate
    - Track retry rate
    - Monitor for configuration errors
    - Set up alerts for high failure rates
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 13.1, 13.2, 13.3, 13.4, 13.5_
