# Email Not Sending on Production - Complete Fix Guide

## Problem Summary
After deploying to Vercel and updating SMTP environment variables, emails are still not sending. The error shows:
```
Email configuration is incomplete. Missing SMTP settings.
```

## Root Cause
**Environment variables updated in Vercel are not applied to existing deployments.** You must trigger a new deployment for the changes to take effect.

---

## Quick Fix (Do This Now)

### Step 1: Verify Variables in Vercel
1. Go to https://vercel.com/dashboard
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Confirm these are set for **Production**:

```
SMTP_HOST=smtpout.secureserver.net
SMTP_PORT=465
SMTP_USER=agents@infinityagents.co.uk
SMTP_PASS=5tgbVFR$3edc
SMTP_SECURE=true
EMAIL_FROM_NAME=Infinity Agents
EMAIL_FROM_ADDRESS=agents@infinityagents.co.uk
```

### Step 2: Redeploy Your Application
**This is the critical step!**

1. Go to **Deployments** tab
2. Click the three dots (...) on your latest deployment
3. Select **Redeploy**
4. **UNCHECK** "Use existing Build Cache"
5. Click **Redeploy**
6. Wait 2-5 minutes for completion

### Step 3: Test
1. Visit your production site
2. Register a new test user
3. Check if emails are sent

---

## Verification Tools

### Check Environment Variables (Production)
After redeployment, visit this URL in your browser:
```
https://your-site.vercel.app/api/debug/check-smtp-config
```

You should see:
```json
{
  "status": "OK",
  "message": "All required SMTP environment variables are configured"
}
```

### Test SMTP Locally
Before deploying, test your SMTP settings locally:
```bash
node test-smtp-connection.js
```

This will:
- Verify your SMTP credentials
- Test the connection
- Send a test email to yourself

### Check Local Environment
```bash
node verify-smtp-env.js
```

---

## Understanding the Issue

### Why Environment Variables Don't Update Automatically

1. **Build Time vs Runtime**
   - Some Next.js features bundle environment variables at build time
   - Server-side code reads them from the deployment environment
   - Updating variables in Vercel only affects NEW deployments

2. **The Deployment Process**
   ```
   Code Push → Build → Bundle Env Vars → Deploy → Run
                ↑
                This is when env vars are captured
   ```

3. **What Happens When You Update Variables**
   ```
   Update Vars in Vercel → Stored in Vercel
                           ↓
                    NOT applied to running deployment
                           ↓
                    Need new deployment to apply
   ```

---

## Troubleshooting

### Still Getting "Missing SMTP settings" After Redeployment?

**Check 1: Variable Names**
- Must be EXACTLY as shown (case-sensitive)
- No extra spaces
- No quotes around values in Vercel

**Check 2: Environment Selection**
- Variables must be set for "Production"
- Not just "Preview" or "Development"

**Check 3: Build Cache**
- Make sure you unchecked "Use existing Build Cache" when redeploying
- Or push a new commit to force fresh build

**Check 4: Verify in Logs**
1. Go to Vercel → Deployments → Latest deployment
2. Click "View Function Logs"
3. Look for the registration API call
4. Check what error appears

### Emails Sending But Not Arriving?

**Check 1: Email Account Status**
- Log into your GoDaddy email account
- Verify it's active and not suspended
- Check sending limits haven't been exceeded

**Check 2: Spam Folders**
- Check spam/junk folders
- Check quarantine if using email security

**Check 3: SMTP Credentials**
- Verify username and password are correct
- Test locally with `node test-smtp-connection.js`

**Check 4: Email Logs**
- Check Vercel function logs for "Email sent successfully"
- Look for message IDs in logs

### Authentication Errors?

**Possible Causes:**
- Incorrect SMTP_USER or SMTP_PASS
- Email account locked or suspended
- Two-factor authentication enabled (may need app-specific password)
- IP address blocked by email provider

**Solution:**
1. Log into your GoDaddy email account
2. Verify credentials work
3. Check for any security alerts
4. Test with `node test-smtp-connection.js` locally

---

## Prevention

### Always Remember:
1. ✅ Update environment variables in Vercel
2. ✅ **Trigger a new deployment** (don't skip this!)
3. ✅ Verify with the debug endpoint
4. ✅ Test with actual registration

### Best Practices:
- Test SMTP locally before deploying
- Keep .env.local in sync with Vercel settings
- Document any environment variable changes
- Use the debug endpoint to verify after deployment

---

## Quick Reference Commands

```bash
# Test SMTP connection locally
node test-smtp-connection.js

# Verify local environment variables
node verify-smtp-env.js

# Check production environment (after deployment)
curl https://your-site.vercel.app/api/debug/check-smtp-config
```

---

## Success Checklist

- [ ] SMTP variables added to Vercel (Production environment)
- [ ] New deployment triggered (without build cache)
- [ ] Deployment completed successfully
- [ ] Debug endpoint shows "OK" status
- [ ] Test registration performed
- [ ] Confirmation email received
- [ ] Admin notification email received
- [ ] Checked spam folders if needed

---

## Still Need Help?

If you've followed all steps and emails still aren't working:

1. **Check Vercel Logs**
   - Go to your deployment
   - View Function Logs
   - Look for specific error messages
   - Share the error details

2. **Test SMTP Directly**
   - Run `node test-smtp-connection.js`
   - If this fails, the issue is with SMTP credentials
   - Contact GoDaddy support

3. **Verify Email Account**
   - Log into agents@infinityagents.co.uk
   - Check account status
   - Verify sending permissions
   - Check for any restrictions

4. **Contact Support**
   - Vercel support for deployment issues
   - GoDaddy support for email/SMTP issues

---

## Summary

**The fix is simple: Redeploy your application in Vercel after updating environment variables.**

Environment variables are captured during the build/deployment process, not dynamically at runtime. Updating them in Vercel's dashboard only stores them for future deployments - you must trigger a new deployment for them to take effect.
