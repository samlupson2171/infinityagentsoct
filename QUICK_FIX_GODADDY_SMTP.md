# Quick Fix: GoDaddy SMTP Authentication Error

## The Problem
✅ SMTP connection works  
✅ Server responds  
❌ **Authentication fails with error 535**

## Your Current Settings
- Email: `agents@infinityagents.co.uk`
- Password: `5tgbVFR$edc` (verified format is correct)
- Server: `smtpout.secureserver.net:465`

## Most Likely Cause
**SMTP access is not enabled in your GoDaddy Workspace Email account.**

This is a security feature that GoDaddy disables by default. You must manually enable it.

## Fix It Now (5 minutes)

### Step 1: Log into GoDaddy
1. Go to https://account.godaddy.com/
2. Sign in with your GoDaddy account credentials

### Step 2: Navigate to Email Settings
1. Click **Email & Office** in the menu
2. Click **Workspace Email**
3. Find and click on `agents@infinityagents.co.uk`

### Step 3: Enable SMTP Access
1. Look for one of these sections:
   - **Email Client Access**
   - **SMTP/POP Settings**
   - **Settings** → **Email Client**
   
2. Find the toggle or checkbox for:
   - **Enable SMTP**
   - **Enable POP/SMTP**
   - **Allow email client access**

3. **Turn it ON** ✅

4. Click **Save** or **Apply**

### Step 4: Test Again
Wait 2-3 minutes for changes to propagate, then run:

```bash
node test-godaddy-smtp-simple.js
```

You should see:
```
✅ SMTP Connection Successful!
✅ Test email sent successfully!
```

## Alternative: Try Port 587

If enabling SMTP doesn't work, try using port 587 instead:

Edit `.env.local`:
```env
SMTP_PORT=587
SMTP_SECURE=false
```

Then test again:
```bash
node test-godaddy-smtp-simple.js
```

## Still Not Working?

### Option 1: Verify Password
1. Go to https://email.secureserver.net/
2. Try logging in with:
   - Email: `agents@infinityagents.co.uk`
   - Password: `5tgbVFR$edc`
3. If login fails → password is wrong, reset it in GoDaddy
4. If login works → SMTP needs to be enabled (see Step 3 above)

### Option 2: Check for 2FA
If your account has two-factor authentication:
1. Go to GoDaddy account settings
2. Look for **Security** or **App Passwords**
3. Generate an app-specific password for SMTP
4. Update `SMTP_PASS` in `.env.local` with the new password

### Option 3: Contact GoDaddy Support
Call GoDaddy and say:
> "I need to enable SMTP access for my Workspace Email account agents@infinityagents.co.uk. I'm getting a 535 authentication error when trying to send emails via SMTP."

They can enable it for you immediately.

## Why This Happens
GoDaddy Workspace Email has SMTP access **disabled by default** for security. Many users don't need SMTP (they only use webmail), so GoDaddy requires you to explicitly enable it.

## After It's Fixed
Once SMTP is working, your application will be able to send:
- ✅ Registration confirmation emails
- ✅ Admin notification emails  
- ✅ Approval emails with contract links
- ✅ Quote emails to clients
- ✅ Enquiry notifications

---

**Bottom Line**: You need to log into GoDaddy and enable SMTP access for the `agents@infinityagents.co.uk` account. This is the #1 cause of 535 authentication errors with GoDaddy Workspace Email.
