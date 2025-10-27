# SMTP Email Setup Guide

## Overview
This guide will help you set up SMTP email delivery for the Infinity Weekends platform. The system uses standard SMTP through nodemailer, which works with any SMTP provider including Gmail, Microsoft 365, SendGrid, and custom SMTP servers.

## Why SMTP?
- ✅ **Universal Compatibility**: Works with any email provider
- ✅ **No Third-Party Dependencies**: Direct SMTP connection
- ✅ **Reliable**: Industry-standard email protocol
- ✅ **Flexible**: Easy to switch providers
- ✅ **Cost-Effective**: Use your existing email service

## Quick Start

### Step 1: Choose Your SMTP Provider

You can use any of these popular providers:
- **Gmail** (free for personal use)
- **Microsoft 365** (if you have a business account)
- **SendGrid** (free tier: 100 emails/day)
- **Your own mail server**

### Step 2: Get SMTP Credentials

#### For Gmail:
1. Enable 2-Factor Authentication on your Google account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app-specific password
4. Use your Gmail address and the app password

#### For Microsoft 365:
1. Use your Microsoft 365 email address
2. Use your account password
3. Ensure SMTP is enabled in your Microsoft 365 admin panel

#### For SendGrid:
1. Sign up at [SendGrid](https://sendgrid.com)
2. Create an API key with "Mail Send" permissions
3. Use "apikey" as the username
4. Use your API key as the password

### Step 3: Configure Environment Variables

Add these to your `.env.local` file:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
```

### Step 4: Test Your Configuration

1. Start your application: `npm run dev`
2. The system will automatically verify the SMTP connection on startup
3. Check the console for "Email server configuration verified successfully"

## Configuration Examples

### Gmail Configuration

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
```

**Important**: Gmail requires an app-specific password when 2FA is enabled.

### Microsoft 365 Configuration

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-password
```

**Note**: The system automatically detects Microsoft 365 and applies appropriate TLS settings.

### SendGrid SMTP Configuration

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

**Note**: SendGrid username is always "apikey" (literal string).

### Generic SMTP Configuration

```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-password
```

## Port Selection Guide

| Port | Protocol | Use Case |
|------|----------|----------|
| 587  | STARTTLS | **Recommended** - Most providers |
| 465  | SSL/TLS  | Secure from start |
| 25   | Plain    | Not recommended (unencrypted) |

## Troubleshooting

### "Email configuration is incomplete" Error

**Cause**: Missing required environment variables

**Solution**: Ensure all required variables are set:
- `SMTP_HOST`
- `SMTP_USER`
- `SMTP_PASS`

### "Authentication failed" Error

**Causes**:
- Incorrect username or password
- 2FA enabled without app-specific password (Gmail)
- SMTP not enabled in account settings

**Solutions**:
- Double-check credentials
- For Gmail: Use app-specific password
- For Microsoft 365: Enable SMTP in admin panel
- Check for typos in environment variables

### "Connection timeout" Error

**Causes**:
- Firewall blocking SMTP ports
- Incorrect SMTP host
- Network connectivity issues

**Solutions**:
- Verify SMTP host is correct
- Check firewall allows outbound connections on port 587/465
- Test network connectivity: `telnet smtp.gmail.com 587`

### Emails Going to Spam

**Solutions**:
- Set up SPF records for your domain
- Set up DKIM signing
- Use a verified domain email address
- Avoid spam trigger words in subject lines

### Rate Limiting

The system includes built-in rate limiting:
- Maximum 5 emails per second
- Connection pooling (5 concurrent connections)
- Automatic retry with exponential backoff

If you need higher limits, consider:
- Upgrading to a paid email service
- Using a dedicated SMTP relay service
- Implementing email queuing

## Security Best Practices

### 1. Protect Your Credentials
- Never commit `.env.local` to version control
- Use environment variables for all credentials
- Rotate passwords regularly

### 2. Use App-Specific Passwords
- Enable 2FA on your email account
- Generate app-specific passwords for SMTP
- Revoke unused app passwords

### 3. Monitor Email Activity
- Check SMTP provider logs regularly
- Set up alerts for failed authentications
- Monitor for unusual sending patterns

### 4. Use TLS/SSL
- Always use port 587 (STARTTLS) or 465 (SSL/TLS)
- Never use port 25 (unencrypted)
- The system automatically handles TLS negotiation

## Testing Email Delivery

### Method 1: Using the Admin Panel
1. Log in as an admin
2. Go to Settings → Email Settings
3. Click "Test Email Configuration"
4. Check your inbox for the test email

### Method 2: Using the API
```bash
curl -X POST http://localhost:3000/api/admin/settings/email/test \
  -H "Content-Type: application/json" \
  -d '{"toEmail": "test@example.com"}'
```

### Method 3: Trigger a Real Email
- Register a new user account
- Check for registration confirmation email
- Check admin inbox for notification email

## Email Types Sent by the System

The platform sends these types of emails:

1. **Registration Confirmation** - Sent to new users
2. **Admin Notifications** - Sent when new agencies register
3. **Approval Notifications** - Sent when accounts are approved
4. **Rejection Notifications** - Sent when accounts are rejected
5. **Enquiry Confirmations** - Sent to agents who submit enquiries
6. **Enquiry Notifications** - Sent to admins for new enquiries
7. **Quote Emails** - Sent to clients with travel quotes
8. **Quote Admin Notifications** - Sent to admins when quotes are created

## Performance Optimization

The email system includes:

- **Connection Pooling**: Reuses SMTP connections
- **Rate Limiting**: Prevents overwhelming the SMTP server
- **Retry Logic**: Automatic retry with exponential backoff
- **Timeout Management**: Appropriate timeouts for reliability

## Monitoring

### What to Monitor

1. **Email Delivery Rate**: Percentage of successful sends
2. **Retry Rate**: How often emails need retries
3. **Failure Rate**: Percentage of permanent failures
4. **Delivery Time**: Time from send to delivery

### Setting Up Alerts

Consider setting up alerts for:
- High failure rate (>5%)
- Configuration errors
- SMTP connection failures
- Repeated authentication failures

## Migration from Resend

If you were previously using Resend:

1. Remove Resend environment variables:
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`

2. Add SMTP environment variables (see Configuration Examples above)

3. Restart your application

4. Test email delivery

The migration is automatic - no code changes required!

## Support

### Common Issues

- **Gmail blocking sign-in attempts**: Enable "Less secure app access" or use app-specific password
- **Microsoft 365 authentication errors**: Ensure SMTP AUTH is enabled
- **SendGrid rate limits**: Check your plan limits
- **Firewall issues**: Ensure outbound SMTP ports are open

### Getting Help

- Check application logs for detailed error messages
- Review SMTP provider documentation
- Test SMTP connection using telnet
- Contact your SMTP provider support

## Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [Microsoft 365 SMTP Settings](https://learn.microsoft.com/en-us/exchange/mail-flow-best-practices/how-to-set-up-a-multifunction-device-or-application-to-send-email-using-microsoft-365-or-office-365)
- [SendGrid SMTP Documentation](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)

## Next Steps

Once SMTP is working:
1. Set up SPF and DKIM records for your domain
2. Monitor email delivery rates
3. Configure email templates if needed
4. Set up email analytics (optional)
5. Consider implementing email queuing for high volume

Your email system is now configured and ready to use!
