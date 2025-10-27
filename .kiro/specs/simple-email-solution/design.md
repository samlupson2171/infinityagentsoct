# Design Document

## Overview

This design document outlines a simple, reliable SMTP-based email solution for the Infinity Weekends platform. The solution consolidates the existing email functionality into a single, well-tested module that uses standard SMTP through nodemailer, eliminating the dependency on Resend while maintaining all existing email capabilities.

The design focuses on simplicity, reliability, and maintainability. It leverages the existing nodemailer infrastructure already present in the codebase (src/lib/email.ts) and removes the Resend-specific implementation (src/lib/resend-email.ts).

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  (API Routes, Components, Services)                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Email Service Layer                        │
│  - Email validation                                          │
│  - Template rendering                                        │
│  - Retry logic                                              │
│  - Error handling                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Nodemailer Transport                        │
│  - SMTP connection management                               │
│  - Connection pooling                                       │
│  - Rate limiting                                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    SMTP Provider                             │
│  (Gmail, Microsoft 365, SendGrid, etc.)                     │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

The email system consists of these key components:

1. **Configuration Manager**: Handles environment variable loading and validation
2. **Transport Manager**: Creates and manages the nodemailer transporter instance
3. **Validation Layer**: Validates email addresses and content before sending
4. **Retry Handler**: Implements exponential backoff retry logic
5. **Template Functions**: Individual functions for each email type
6. **Error Handler**: Custom error types and logging

## Components and Interfaces

### 1. Configuration Interface

```typescript
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  requireTLS: boolean;
  auth: {
    user: string;
    pass: string;
  };
  pool: boolean;
  maxConnections: number;
  maxMessages: number;
  rateDelta: number;
  rateLimit: number;
  connectionTimeout: number;
  greetingTimeout: number;
  socketTimeout: number;
}
```

**Environment Variables:**
- `SMTP_HOST`: SMTP server hostname (required)
- `SMTP_PORT`: SMTP server port (default: 587)
- `SMTP_USER`: SMTP authentication username (required)
- `SMTP_PASS`: SMTP authentication password (required)
- `SMTP_SECURE`: Use SSL/TLS (default: false for port 587)

### 2. Transport Manager

**Responsibilities:**
- Create nodemailer transporter with proper configuration
- Detect provider-specific settings (e.g., Microsoft 365)
- Implement singleton pattern for transporter reuse
- Provide verification method for configuration testing

**Key Functions:**
```typescript
function createTransporter(): nodemailer.Transporter
function getTransporter(): nodemailer.Transporter
async function verifyEmailConfig(): Promise<boolean>
```

### 3. Validation Layer

**Responsibilities:**
- Validate email addresses using regex
- Validate required fields (to, subject, content)
- Throw descriptive errors for invalid data

**Key Functions:**
```typescript
function validateEmailAddress(email: string): boolean
function validateEmailData(data: EmailData): void
```

**Validation Rules:**
- Email must match pattern: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Subject must be non-empty string
- Either HTML or text content must be provided

### 4. Retry Handler

**Responsibilities:**
- Implement exponential backoff retry logic
- Log each retry attempt
- Return on first success or throw after all failures

**Key Function:**
```typescript
async function sendEmailWithRetry(
  mailOptions: any,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<any>
```

**Retry Strategy:**
- Attempt 1: Immediate
- Attempt 2: Wait 1 second (delay * 2^0)
- Attempt 3: Wait 2 seconds (delay * 2^1)
- Attempt 4: Wait 4 seconds (delay * 2^2)

### 5. Email Template Functions

Each email type has a dedicated function with a specific interface:

#### Registration Confirmation
```typescript
async function sendRegistrationConfirmationEmail(data: {
  userName: string;
  userEmail: string;
  companyName: string;
  consortia?: string;
}): Promise<any>
```

#### Admin Notification
```typescript
async function sendAdminNotificationEmail(data: {
  userName: string;
  companyName: string;
  contactEmail: string;
  abtaPtsNumber: string;
  websiteAddress: string;
  consortia?: string;
  userId: string;
}): Promise<{
  totalAdmins: number;
  successful: number;
  failed: number;
  results: Array<{success: boolean; email: string; messageId?: string; error?: string}>;
}>
```

#### Approval Notification
```typescript
async function sendApprovalNotificationEmail(data: {
  userName: string;
  userEmail: string;
  companyName: string;
  consortia?: string;
  userId: string;
}): Promise<{
  success: boolean;
  messageId: string;
  contractToken: string;
  contractUrl: string;
}>
```

#### Rejection Notification
```typescript
async function sendRejectionNotificationEmail(data: {
  userName: string;
  userEmail: string;
  companyName: string;
  reason?: string;
}): Promise<any>
```

#### Enquiry Confirmation
```typescript
async function sendEnquiryConfirmationEmail(data: {
  enquiryId: string;
  leadName: string;
  tripType: 'stag' | 'hen' | 'other';
  firstChoiceDestination: string;
  secondChoiceDestination?: string;
  thirdChoiceDestination?: string;
  resort?: string;
  travelDate: Date;
  agentName: string;
  agentEmail: string;
}): Promise<any>
```

#### Enquiry Notification
```typescript
async function sendEnquiryNotificationEmail(data: {
  enquiryId: string;
  leadName: string;
  tripType: 'stag' | 'hen' | 'other';
  firstChoiceDestination: string;
  secondChoiceDestination?: string;
  thirdChoiceDestination?: string;
  resort?: string;
  travelDate: Date;
  departureAirport: string;
  numberOfNights: number;
  numberOfGuests: number;
  eventsRequested: string[];
  accommodationType: 'hotel' | 'apartments';
  boardType: string;
  budgetPerPerson: number;
  additionalNotes?: string;
  agentName: string;
  agentCompany: string;
  agentEmail: string;
}): Promise<any>
```

#### Quote Email
```typescript
async function sendQuoteEmail(data: {
  quoteId: string;
  quoteReference: string;
  leadName: string;
  agentEmail: string;
  agentName?: string;
  agentCompany?: string;
  hotelName: string;
  numberOfPeople: number;
  numberOfRooms: number;
  numberOfNights: number;
  arrivalDate: Date;
  isSuperPackage: boolean;
  whatsIncluded: string;
  transferIncluded: boolean;
  activitiesIncluded?: string;
  totalPrice: number;
  currency: string;
  formattedPrice: string;
  version: number;
  linkedPackage?: {
    packageName: string;
    packageVersion: number;
    selectedTier: string;
    selectedPeriod: string;
  };
}): Promise<{
  success: boolean;
  messageId: string;
  quoteReference: string;
}>
```

#### Quote Admin Notification
```typescript
async function sendQuoteAdminNotificationEmail(data: {
  quoteId: string;
  quoteReference: string;
  leadName: string;
  agentEmail: string;
  agentName?: string;
  agentCompany?: string;
  hotelName: string;
  numberOfPeople: number;
  numberOfNights: number;
  arrivalDate: Date;
  totalPrice: number;
  currency: string;
  formattedPrice: string;
  createdBy: string;
  linkedPackage?: {
    packageName: string;
    packageVersion: number;
    selectedTier: string;
    selectedPeriod: string;
    calculatedPrice: number;
  };
}): Promise<{
  totalAdmins: number;
  successful: number;
  failed: number;
  results: Array<{success: boolean; email: string; messageId?: string; error?: string}>;
}>
```

#### Test Email
```typescript
async function sendTestEmail(data: {
  toEmail: string;
  fromEmail: string;
  fromName: string;
}): Promise<any>
```

## Data Models

### EmailDeliveryError

Custom error class for email-related failures:

```typescript
class EmailDeliveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailDeliveryError';
  }
}
```

### Mail Options

Standard nodemailer mail options structure:

```typescript
interface MailOptions {
  from: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}
```

## Error Handling

### Error Types

1. **Configuration Errors**: Missing or invalid SMTP settings
   - Thrown during initialization
   - Includes specific missing variable names
   - Prevents application startup

2. **Validation Errors**: Invalid email data
   - Thrown before send attempts
   - Includes field-specific error messages
   - Fails fast to avoid wasted resources

3. **Delivery Errors**: SMTP send failures
   - Thrown after all retry attempts fail
   - Includes original error details
   - Logged with full context

### Error Handling Strategy

```typescript
try {
  // Validate data
  validateEmailData(mailOptions);
  
  // Send with retry
  const result = await sendEmailWithRetry(mailOptions, 3, 1000);
  
  // Log success
  Logger.info('Email sent successfully', { messageId: result.messageId });
  
  return result;
} catch (error) {
  // Log error with context
  Logger.error('Email delivery failed', {
    error: error.message,
    recipient: mailOptions.to,
    subject: mailOptions.subject
  });
  
  // Throw custom error
  throw new EmailDeliveryError(
    `Failed to send email: ${error.message}`
  );
}
```

### Logging Strategy

- **Info Level**: Successful sends, configuration verification
- **Warn Level**: Retry attempts, missing admin users
- **Error Level**: Failed sends, configuration errors

## Testing Strategy

### Unit Tests

1. **Configuration Tests**
   - Test transporter creation with valid config
   - Test error handling for missing config
   - Test provider-specific settings (Microsoft 365)

2. **Validation Tests**
   - Test email address validation (valid/invalid formats)
   - Test required field validation
   - Test error messages

3. **Retry Logic Tests**
   - Test successful send on first attempt
   - Test successful send on retry
   - Test failure after all retries
   - Test exponential backoff timing

4. **Template Tests**
   - Test each email template function
   - Test data interpolation
   - Test optional field handling
   - Test HTML generation

### Integration Tests

1. **SMTP Connection Tests**
   - Test connection to real SMTP server
   - Test authentication
   - Test send and receive

2. **End-to-End Tests**
   - Test complete registration flow
   - Test complete enquiry flow
   - Test complete quote flow

### Manual Testing

1. **Provider Compatibility**
   - Test with Gmail
   - Test with Microsoft 365
   - Test with SendGrid SMTP
   - Test with generic SMTP

2. **Email Rendering**
   - Test email appearance in various clients
   - Test responsive design
   - Test image loading

## Migration Strategy

### Phase 1: Preparation
1. Ensure src/lib/email.ts has all required functions
2. Verify SMTP configuration in environment
3. Test SMTP connection

### Phase 2: Code Updates
1. Update all imports from '@/lib/resend-email' to '@/lib/email'
2. Remove Resend-specific code
3. Update environment variable documentation

### Phase 3: Testing
1. Run unit tests
2. Run integration tests
3. Test in development environment
4. Test in staging environment

### Phase 4: Deployment
1. Update production environment variables
2. Deploy to production
3. Monitor email delivery
4. Verify all email types working

### Phase 5: Cleanup
1. Remove src/lib/resend-email.ts
2. Remove Resend package from dependencies
3. Remove Resend environment variables
4. Update documentation

## Configuration Examples

### Gmail Configuration

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_SECURE=false
```

**Note**: Gmail requires app-specific passwords when 2FA is enabled.

### Microsoft 365 Configuration

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-password
SMTP_SECURE=false
```

**Note**: The system automatically detects Microsoft 365 and applies appropriate TLS settings.

### SendGrid SMTP Configuration

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_SECURE=false
```

### Generic SMTP Configuration

```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-password
SMTP_SECURE=false
```

## Performance Considerations

### Connection Pooling

The transporter uses connection pooling to improve performance:
- Maximum 5 concurrent connections
- Maximum 100 messages per connection
- Automatic connection reuse

### Rate Limiting

Built-in rate limiting prevents overwhelming the SMTP server:
- 5 emails per second maximum
- 1 second rate delta

### Timeouts

Appropriate timeouts prevent hanging:
- Connection timeout: 60 seconds
- Greeting timeout: 30 seconds
- Socket timeout: 60 seconds

## Security Considerations

### Credential Management

- SMTP credentials stored in environment variables
- Never log passwords or sensitive data
- Use app-specific passwords when available

### Email Content Security

- Sanitize user input in email templates
- Escape HTML special characters
- Validate URLs before including in emails

### TLS/SSL

- Use STARTTLS for port 587
- Use SSL for port 465
- Reject unauthorized certificates for Microsoft 365

## Monitoring and Observability

### Metrics to Track

1. **Email Delivery Rate**: Percentage of successful sends
2. **Retry Rate**: Percentage of emails requiring retries
3. **Failure Rate**: Percentage of emails failing after all retries
4. **Delivery Time**: Time from send request to successful delivery

### Logging

All email operations are logged with:
- Timestamp
- Email type
- Recipient
- Success/failure status
- Error details (if failed)
- Message ID (if successful)

### Alerts

Consider setting up alerts for:
- High failure rate (>5%)
- Configuration errors
- SMTP connection failures
- Repeated retry failures

## Documentation Updates Required

1. Update .env.example with SMTP-only configuration
2. Update README with SMTP setup instructions
3. Remove Resend references from documentation
4. Add troubleshooting guide for common SMTP issues
5. Update deployment guide with SMTP configuration steps
