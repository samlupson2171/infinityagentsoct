# Vercel SMTP Email Fix Guide

## Problem
Emails are not sending from the production site because environment variables are not loaded in the current deployment.

## Root Cause
When you update environment variables in Vercel, the changes don't automatically apply to existing deployments. You need to trigger a new deployment for the variables to be available.

## Solution Steps

### Step 1: Verify Environment Variables in Vercel
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Verify these variables are set for **Production**:
   - `SMTP_HOST` = `smtpout.secureserver.net`
   - `SMTP_PORT` = `465`
   - `SMTP_USER` = `agents@infinityagents.co.uk`
   - `SMTP_PASS` = `5tgbVFR$3edc`
   - `SMTP_SECURE` = `true`
   - `EMAIL_FROM_NAME` = `Infinity Agents`
   - `EMAIL_FROM_ADDRESS` = `agents@infinityagents.co.uk`

### Step 2: Trigger a New Deployment

#### Option A: Redeploy from Vercel Dashboard (Recommended)
1. Go to **Deployments** tab in your Vercel project
2. Find the latest deployment
3. Click the three dots (...) menu
4. Select **Redeploy**
5. **IMPORTANT**: Uncheck "Use existing Build Cache"
6. Click **Redeploy**
7. Wait for the deployment to complete (usually 2-5 minutes)

#### Option B: Push a New Commit
1. Make any small change to your code (or use `--allow-empty`)
2. Commit and push to your repository
3. Vercel will automatically deploy the new version

### Step 3: Verify the Fix
After the new deployment completes:

1. Try registering a new test user on your production site
2. Check the Vercel logs:
   - Go to **Deployments** → Click on the latest deployment
   - Click **View Function Logs**
   - Look for email-related logs

3. You should see:
   ```
   Email sent successfully on attempt 1: <message-id>
   ```

Instead of:
   ```
   Email configuration is incomplete. Missing SMTP settings.
   ```

## Why This Happens
- Environment variables are injected at **build time** for some Next.js features
- Server-side runtime code reads them from the deployment environment
- When you update variables in Vercel, they're stored but not applied to running deployments
- A new deployment is required to pick up the changes

## Testing Locally
Run this command to verify your local environment variables:
```bash
node verify-smtp-env.js
```

## Common Issues

### Issue: Still getting "Missing SMTP settings" after redeployment
**Solution**: 
- Double-check the variable names are EXACTLY as shown (case-sensitive)
- Make sure they're set for the correct environment (Production)
- Try clearing the build cache during redeployment

### Issue: Emails sending but not arriving
**Solution**:
- Check your GoDaddy email account is active
- Verify the SMTP credentials are correct
- Check spam/junk folders
- Verify the email account has sending permissions

### Issue: "Authentication failed" errors
**Solution**:
- Verify SMTP_USER and SMTP_PASS are correct
- Check if your email provider requires app-specific passwords
- Ensure the email account is not locked or suspended

## Quick Verification Checklist
- [ ] Environment variables added to Vercel
- [ ] Variables set for "Production" environment
- [ ] New deployment triggered (not using cached build)
- [ ] Deployment completed successfully
- [ ] Test registration performed
- [ ] Email logs checked in Vercel
- [ ] Email received (check spam folder too)

## Need More Help?
If emails still aren't working after following these steps:
1. Check the Vercel function logs for specific error messages
2. Verify your GoDaddy SMTP settings are correct
3. Test the SMTP connection using a tool like https://www.smtper.net/
4. Contact GoDaddy support to verify your email account status
