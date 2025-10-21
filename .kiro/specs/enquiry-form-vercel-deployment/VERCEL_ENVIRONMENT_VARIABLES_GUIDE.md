# Vercel Environment Variables Setup Guide

## Task 4: Ensure All Environment Variables Are Set in Vercel

This guide provides step-by-step instructions for configuring all required environment variables in Vercel for successful deployment.

## Overview

Environment variables are critical for your application to function correctly on Vercel. Missing or incorrect variables will cause deployment failures or runtime errors.

## Required Environment Variables

Based on your `.env.local` file, here are all the environment variables that need to be set in Vercel:

### 1. Database Configuration (REQUIRED)

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**Purpose:** Connects your application to MongoDB Atlas database

**Important Notes:**
- Replace `username`, `password`, `cluster`, and `database` with your actual values
- Ensure password is URL-encoded if it contains special characters
- This is the MOST CRITICAL variable - without it, the app won't work

### 2. NextAuth Configuration (REQUIRED)

```bash
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-super-secret-nextauth-key-change-in-production
```

**Purpose:** 
- `NEXTAUTH_URL`: Base URL for authentication callbacks
- `NEXTAUTH_SECRET`: Secret key for encrypting session tokens

**Important Notes:**
- `NEXTAUTH_URL` MUST match your production domain exactly
- `NEXTAUTH_SECRET` should be a long, random string (minimum 32 characters)
- Generate a secure secret: `openssl rand -base64 32`

### 3. Email Configuration (REQUIRED for email features)

#### Option A: Microsoft 365 / Office 365 SMTP

```bash
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-email-password
SMTP_SECURE=false
EMAIL_FROM_NAME=Your Company Name
EMAIL_FROM_ADDRESS=your-email@domain.com
```

#### Option B: Resend API (Recommended for production)

```bash
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_FROM_NAME=Your Company Name
RESEND_TO_EMAIL=admin@yourdomain.com
RESEND_TO_NAME=Admin Name
```

**Important Notes:**
- Choose ONE email provider (SMTP or Resend)
- For SMTP: Ensure your email provider allows SMTP access
- For Resend: Sign up at https://resend.com and verify your domain
- Email variables are required for enquiry notifications and quotes

### 4. AI Services (OPTIONAL)

```bash
OPENAI_API_KEY=sk-proj-your-openai-api-key
```

**Purpose:** Enables AI content generation features

**Important Notes:**
- Only required if using AI content generation
- Get API key from: https://platform.openai.com/api-keys
- Can be omitted if not using AI features

### 5. Application Environment (OPTIONAL)

```bash
NODE_ENV=production
```

**Purpose:** Sets the application environment mode

**Important Notes:**
- Vercel automatically sets this to `production` for production deployments
- Usually not needed to set manually

## Step-by-Step Setup Instructions

### Step 1: Access Vercel Dashboard

1. Go to [https://vercel.com](https://vercel.com)
2. Sign in to your account
3. Select your project from the dashboard

### Step 2: Navigate to Environment Variables

1. Click on your project name
2. Click on **"Settings"** tab at the top
3. Click on **"Environment Variables"** in the left sidebar

### Step 3: Add Environment Variables

For each variable listed above:

1. Click **"Add New"** button
2. Enter the **Key** (variable name, e.g., `MONGODB_URI`)
3. Enter the **Value** (the actual value for that variable)
4. Select which environments to apply to:
   - ✅ **Production** (always check this)
   - ✅ **Preview** (recommended for testing)
   - ✅ **Development** (optional, for local development via Vercel)
5. Click **"Save"**

### Step 4: Verify All Variables Are Set

Use this checklist to ensure all required variables are configured:

#### Database (REQUIRED)
- [ ] `MONGODB_URI` - Set for Production, Preview, Development

#### Authentication (REQUIRED)
- [ ] `NEXTAUTH_URL` - Set to production domain (e.g., `https://your-app.vercel.app`)
- [ ] `NEXTAUTH_SECRET` - Set to a secure random string (32+ characters)

#### Email (REQUIRED - Choose ONE option)

**Option A: SMTP**
- [ ] `SMTP_HOST`
- [ ] `SMTP_PORT`
- [ ] `SMTP_USER`
- [ ] `SMTP_PASS`
- [ ] `SMTP_SECURE`
- [ ] `EMAIL_FROM_NAME`
- [ ] `EMAIL_FROM_ADDRESS`

**Option B: Resend**
- [ ] `RESEND_API_KEY`
- [ ] `RESEND_FROM_EMAIL`
- [ ] `RESEND_FROM_NAME`
- [ ] `RESEND_TO_EMAIL`
- [ ] `RESEND_TO_NAME`

#### AI Services (OPTIONAL)
- [ ] `OPENAI_API_KEY` (only if using AI features)

### Step 5: Trigger Redeployment

After adding/updating environment variables:

1. Go to **"Deployments"** tab
2. Click on the three dots (**...**) next to the latest deployment
3. Click **"Redeploy"**
4. Confirm the redeployment

**Important:** Environment variable changes only take effect after redeployment!

## Production-Specific Configuration

### NEXTAUTH_URL Configuration

Your `NEXTAUTH_URL` must match your production domain exactly:

**Examples:**
- Custom domain: `https://www.infinityweekends.co.uk`
- Vercel domain: `https://infinity-weekends.vercel.app`

**Common Mistakes:**
- ❌ Using `http://` instead of `https://`
- ❌ Including trailing slash: `https://domain.com/`
- ❌ Using localhost URL in production
- ✅ Correct: `https://your-domain.com`

### NEXTAUTH_SECRET Generation

Generate a secure secret key:

```bash
# Using OpenSSL (recommended)
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Online generator
# Visit: https://generate-secret.vercel.app/32
```

**Important:** 
- Never use the same secret as development
- Never commit secrets to git
- Store securely (password manager recommended)

## Verification Steps

### 1. Check Environment Variables in Vercel

After setting variables:

1. Go to **Settings** → **Environment Variables**
2. Verify all required variables are listed
3. Check that they're enabled for the correct environments
4. Look for any warning icons or errors

### 2. Test with Health Check Endpoint

After redeployment:

```bash
# Test health check endpoint
curl https://your-domain.vercel.app/api/health

# Expected response should include:
# - "status": "healthy"
# - "database": { "status": "connected" }
# - "environment": { "validation": { "isValid": true } }
```

### 3. Check Vercel Logs

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click on **"Functions"** or **"Logs"**
4. Look for any environment-related errors

### 4. Test Application Functionality

1. Visit your production site
2. Navigate to the enquiry form
3. Select a destination
4. Verify events section loads
5. Submit a test enquiry
6. Check if email notifications work

## Troubleshooting

### Issue: "MONGODB_URI is not defined"

**Cause:** Database connection string not set or incorrect

**Solutions:**
1. Verify `MONGODB_URI` is set in Vercel environment variables
2. Check the value doesn't have extra spaces or line breaks
3. Ensure it's enabled for Production environment
4. Redeploy after adding the variable

### Issue: "NextAuth configuration error"

**Cause:** Missing or incorrect NextAuth variables

**Solutions:**
1. Verify `NEXTAUTH_URL` matches your production domain exactly
2. Ensure `NEXTAUTH_URL` uses `https://` (not `http://`)
3. Check `NEXTAUTH_SECRET` is set and is at least 32 characters
4. Redeploy after fixing

### Issue: "Email sending failed"

**Cause:** Email configuration missing or incorrect

**Solutions:**
1. Verify all email variables are set (SMTP or Resend)
2. For SMTP: Check credentials are correct
3. For SMTP: Verify SMTP access is enabled in your email provider
4. For Resend: Verify API key is valid and domain is verified
5. Test email configuration using the health check endpoint

### Issue: "Environment variables not taking effect"

**Cause:** Deployment not triggered after adding variables

**Solutions:**
1. Always redeploy after adding/changing environment variables
2. Wait for deployment to complete (check status)
3. Clear browser cache and test again
4. Check Vercel logs for any deployment errors

### Issue: "Database connection timeout"

**Cause:** MongoDB Atlas network access not configured

**Solutions:**
1. Follow the MongoDB Atlas Setup Guide
2. Add `0.0.0.0/0` to Network Access in MongoDB Atlas
3. Verify database user has correct permissions
4. Check `MONGODB_URI` format is correct

## Security Best Practices

### 1. Never Commit Secrets to Git

❌ **Don't do this:**
```javascript
// Bad: Hardcoded secrets
const secret = "my-secret-key";
```

✅ **Do this:**
```javascript
// Good: Use environment variables
const secret = process.env.NEXTAUTH_SECRET;
```

### 2. Use Different Secrets for Different Environments

- Development: Use placeholder values
- Production: Use strong, unique secrets
- Never reuse production secrets in development

### 3. Rotate Secrets Periodically

- Change `NEXTAUTH_SECRET` every 6-12 months
- Update database passwords regularly
- Rotate API keys if compromised

### 4. Limit Access to Environment Variables

- Only share with team members who need them
- Use Vercel's team permissions to control access
- Store secrets in a password manager

### 5. Monitor for Exposed Secrets

- Use tools like `git-secrets` to scan commits
- Check for accidentally committed `.env` files
- Review Vercel logs for exposed secrets

## Environment Variables Checklist

Use this checklist before deploying:

### Pre-Deployment Checklist

- [ ] All required environment variables are set in Vercel
- [ ] `MONGODB_URI` is correct and tested
- [ ] `NEXTAUTH_URL` matches production domain
- [ ] `NEXTAUTH_SECRET` is a strong, unique value (32+ characters)
- [ ] Email configuration is complete (SMTP or Resend)
- [ ] Variables are enabled for Production environment
- [ ] No placeholder values (like "your-secret-here") remain
- [ ] No sensitive data is committed to git
- [ ] MongoDB Atlas network access is configured
- [ ] Database user has correct permissions

### Post-Deployment Checklist

- [ ] Redeployment triggered after adding variables
- [ ] Deployment completed successfully
- [ ] Health check endpoint returns "healthy" status
- [ ] Database connection is working
- [ ] Authentication is working
- [ ] Email notifications are working
- [ ] Events section loads on enquiry form
- [ ] No errors in Vercel logs
- [ ] No errors in browser console

## Quick Reference

### Minimum Required Variables for Basic Functionality

```bash
# Absolute minimum to get the app running
MONGODB_URI=mongodb+srv://...
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-32-character-secret-key
```

### Full Production Configuration

```bash
# Database
MONGODB_URI=mongodb+srv://...

# Authentication
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-32-character-secret-key

# Email (Resend - Recommended)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_FROM_NAME=Your Company
RESEND_TO_EMAIL=admin@yourdomain.com
RESEND_TO_NAME=Admin

# Optional: AI Services
OPENAI_API_KEY=sk-proj-...
```

## Next Steps

After completing this task:

1. ✅ All environment variables are set in Vercel
2. ✅ Redeployment has been triggered
3. ✅ Health check endpoint confirms configuration
4. → Proceed to **Task 5**: Fix any build or TypeScript errors
5. → Then **Task 6**: Deploy fixes and verify functionality

## Additional Resources

- [Vercel Environment Variables Documentation](https://vercel.com/docs/concepts/projects/environment-variables)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
- [MongoDB Atlas Connection Strings](https://docs.mongodb.com/manual/reference/connection-string/)
- [Resend Documentation](https://resend.com/docs)

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Test health check endpoint
3. Review MongoDB Atlas network access
4. Verify all variables are set correctly
5. Ensure redeployment was triggered

For persistent issues, check the troubleshooting section above or consult the Vercel support documentation.
