# Simple Email Solution Spec

## Overview

This spec defines the implementation of a simple, reliable SMTP-based email solution to replace the Resend dependency in the Infinity Weekends platform. The solution consolidates email functionality into a single module using standard SMTP through nodemailer.

## Status

**Status**: Ready for Implementation  
**Created**: 2025-01-22  
**Last Updated**: 2025-01-22

## Problem Statement

The platform currently depends on Resend for email delivery, but this service cannot be used. The platform needs a simple, reliable alternative that:
- Works with standard SMTP providers (Gmail, Microsoft 365, SendGrid, etc.)
- Maintains all existing email functionality
- Provides robust error handling and retry logic
- Is easy to configure and maintain

## Solution Summary

Consolidate email functionality into `src/lib/email.ts` using nodemailer with SMTP, removing the Resend dependency entirely. The solution includes:

- **Standard SMTP Configuration**: Works with any SMTP provider
- **Automatic Retry Logic**: Exponential backoff for failed sends
- **Comprehensive Validation**: Email and data validation before sending
- **10 Email Types**: Registration, quotes, enquiries, admin notifications, etc.
- **Robust Error Handling**: Custom error types and detailed logging
- **Connection Pooling**: Efficient connection management
- **Rate Limiting**: Prevents overwhelming SMTP servers

## Key Features

### Email Types Supported
1. Registration confirmation emails
2. Admin notification emails (new registrations)
3. Approval notification emails (with contract links)
4. Rejection notification emails
5. Enquiry confirmation emails
6. Enquiry notification emails (to admins)
7. Quote emails (to clients)
8. Quote admin notification emails
9. Test emails (for configuration verification)

### Technical Features
- Exponential backoff retry (3 attempts with 1s, 2s, 4s delays)
- Email address validation with regex
- Required field validation
- Connection pooling (5 max connections, 100 messages per connection)
- Rate limiting (5 emails per second)
- Provider-specific optimizations (Microsoft 365, Gmail)
- Comprehensive error logging

## Documents

- **[requirements.md](./requirements.md)**: Complete requirements with 15 user stories and EARS-compliant acceptance criteria
- **[design.md](./design.md)**: Detailed architecture, components, interfaces, and migration strategy
- **[tasks.md](./tasks.md)**: Implementation plan with 18 tasks covering all aspects of the solution

## Configuration

### Required Environment Variables

```env
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-password
SMTP_SECURE=false
```

### Supported SMTP Providers

- **Gmail**: smtp.gmail.com:587 (requires app-specific password)
- **Microsoft 365**: smtp.office365.com:587
- **SendGrid**: smtp.sendgrid.net:587
- **Generic SMTP**: Any standard SMTP server

## Implementation Approach

### Phase 1: Preparation (Tasks 1-4)
- Audit existing email code
- Enhance SMTP configuration
- Implement retry mechanism
- Implement validation

### Phase 2: Email Templates (Tasks 5-13)
- Implement all 10 email template functions
- Ensure consistent branding
- Test each template

### Phase 3: Integration (Tasks 14-16)
- Update all imports from Resend to email module
- Update environment configuration
- Remove Resend dependencies

### Phase 4: Testing (Task 17)
- Test SMTP configuration
- Test retry mechanism
- Test validation
- Test all email templates

### Phase 5: Deployment (Task 18)
- Deploy to production
- Monitor email delivery
- Set up alerts

## Success Criteria

- [ ] All emails send successfully via SMTP
- [ ] No Resend dependencies remain in codebase
- [ ] All email types tested and working
- [ ] Retry logic handles temporary failures
- [ ] Configuration validated on startup
- [ ] Production deployment successful
- [ ] Email delivery monitored and stable

## Migration Impact

### Files to Modify
- `src/lib/email.ts` - Enhance existing implementation
- All files importing from `@/lib/resend-email` - Update imports
- `.env.example` - Update with SMTP-only config
- Documentation files - Remove Resend references

### Files to Remove
- `src/lib/resend-email.ts` - Delete after migration
- `docs/resend-email-setup-guide.md` - Delete after migration

### Dependencies to Remove
- `resend` npm package

## Testing Strategy

### Unit Tests
- Configuration validation
- Email address validation
- Retry logic with exponential backoff
- Template data interpolation

### Integration Tests
- SMTP connection and authentication
- End-to-end email sending
- Multi-admin notification handling

### Manual Tests
- Test with multiple SMTP providers
- Verify email rendering in various clients
- Test all email types in production-like environment

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| SMTP provider issues | High | Implement retry logic, use reliable provider |
| Configuration errors | High | Validate config on startup, clear error messages |
| Email delivery failures | Medium | Retry mechanism, detailed logging, monitoring |
| Template rendering issues | Low | Test in multiple email clients |
| Migration breaks existing functionality | High | Comprehensive testing before deployment |

## Timeline Estimate

- **Preparation & Core Implementation**: 2-3 hours
- **Email Templates**: 2-3 hours
- **Integration & Updates**: 1-2 hours
- **Testing**: 2-3 hours
- **Deployment & Monitoring**: 1 hour

**Total Estimated Time**: 8-12 hours

## Next Steps

1. Review and approve this spec
2. Set up SMTP credentials for development environment
3. Begin implementation starting with Task 1
4. Test each email type as it's implemented
5. Deploy to staging for integration testing
6. Deploy to production with monitoring

## Questions or Concerns

If you have any questions about this spec or need clarification on any aspect of the implementation, please ask before starting development.

## Execution

To start executing tasks from this spec:

1. Open `tasks.md` in this directory
2. Click "Start task" next to the task you want to work on
3. Kiro will guide you through the implementation

Alternatively, you can ask Kiro to "execute task 1 from simple-email-solution spec" or similar commands.
