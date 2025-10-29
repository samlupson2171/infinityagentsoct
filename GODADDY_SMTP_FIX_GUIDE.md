# GoDaddy SMTP Authentication Fix Guide

## Current Issue
Your SMTP connection to GoDaddy is failing with:
```
535 Authentication Failed for agents@infinityagents.co.uk
```

The connection to the server is successful, but authentication is being rejected.

## Verified Configuration
✅ Host: `smtpout.secureserver.net`
✅ Port: `465`
✅ Secure: `true` (SSL)
✅ Email: `agents@infinityagents.co.uk`
✅ Connection: Successfully established

❌ Authentication: **FAILED**

## Solution Steps

### Step 1: Enable SMTP/POP Access in GoDaddy

1. **Log into your GoDaddy account**
   - Go to https://account.godaddy.com/
   - Navigate to **Email & Office** → **Workspace Email**

2. **Access Email Settings**
   - Click on the email account: `agents@infinityagents.co.uk`
   - Look for **Settings** or **Email Settings**

3. **Enable SMTP/POP Access**
   - Find the section for **Email Client Access** or **SMTP/POP Settings**
   - Make sure **SMTP** is **ENABLED**
   - Make sure **POP** is **ENABLED** (sometimes required)
   - Save changes

### Step 2: Check for Two-Factor Authentication

If your account has 2FA enabled:

1. **Generate an App-Specific Password**
   - In GoDaddy account settings, look for **Security** or **App Passwords**
   - Generate a new app-specific password for "SMTP Access"
   - Copy the generated password

2. **Update .env.local**
   - Replace `SMTP_PASS` with the app-specific password
   - Keep the original password documented somewhere safe

### Step 3: Verify Account Status

1. **Check Account Status**
   - Ensure the email account is **Active** (not suspended)
   - Verify there are no billing issues
   - Check for any security holds on the account

2. **Test Email Login**
   - Try logging into webmail: https://email.secureserver.net/
   - Use the same credentials (agents@infinityagents.co.uk + password)
   - If webmail login fails, the password is incorrect

### Step 4: Alternative SMTP Settings

If port 465 continues to fail, try port 587 with STARTTLS:

Update your `.env.local`:
```env
SMTP_HOST=smtpout.secureserver.net
SMTP_PORT=587
SMTP_USER=agents@infinityagents.co.uk
SMTP_PASS=your_password_here
SMTP_SECURE=false
```

### Step 5: Contact GoDaddy Support

If none of the above works:

1. **Call GoDaddy Support**
   - Phone: Check your GoDaddy account for support number
   - Have your account details ready
   - Specifically ask about "SMTP authentication issues for Workspace Email"

2. **Information to Provide**
   - Email account: agents@infinityagents.co.uk
   - Error: "535 Authentication Failed"
   - SMTP server: smtpout.secureserver.net
   - Port: 465
   - Request they verify SMTP is enabled for your account

## Testing After Changes

After making any changes, test the connection:

```bash
node test-godaddy-smtp-simple.js
```

Look for:
- ✅ "SMTP Connection Successful!"
- ✅ "Test email sent successfully!"

## Common GoDaddy SMTP Issues

### Issue 1: SMTP Not Enabled
**Solution**: Enable in Email Settings → Email Client Access

### Issue 2: Wrong Password Format
**Solution**: Use the exact password, no spaces or special formatting

### Issue 3: Account Locked
**Solution**: Check for security alerts in GoDaddy account

### Issue 4: IP Blocking
**Solution**: GoDaddy may block certain IPs. Contact support to whitelist.

### Issue 5: Workspace Email vs Regular Email
**Solution**: Ensure you're using Workspace Email settings, not regular hosting email

## GoDaddy Workspace Email SMTP Settings

**Correct Settings:**
- **Outgoing Server (SMTP)**: smtpout.secureserver.net
- **Port**: 465 (SSL) or 587 (TLS)
- **Requires Authentication**: YES
- **Username**: Full email address (agents@infinityagents.co.uk)
- **Password**: Your email password or app-specific password

## Next Steps

1. ✅ Log into GoDaddy and enable SMTP access
2. ✅ Verify the password by logging into webmail
3. ✅ Check for 2FA and generate app password if needed
4. ✅ Run the test script again
5. ✅ If still failing, contact GoDaddy support

## Additional Resources

- **GoDaddy SMTP Settings**: https://www.godaddy.com/help/server-and-port-settings-for-workspace-email-6949
- **GoDaddy Webmail**: https://email.secureserver.net/
- **GoDaddy Support**: https://www.godaddy.com/contact-us

---

**Note**: The most common cause of this error is SMTP access not being enabled in the GoDaddy Workspace Email settings. This is a security feature that must be manually enabled.
