# Vercel Environment Variables Checklist

## Date: [To be filled during manual check]
## Checked by: [Your name]

---

## Required Environment Variables

Based on `.env.local`, the following environment variables MUST be set in Vercel:

### ✅ Critical Variables (Required for Events Functionality)

- [ ] **MONGODB_URI**
  - Current local value: `mongodb+srv://samlupson:tWWwvrMucnxW0maj@infinagent.1pgp6zc.mongodb.net/infinityweekends?retryWrites=true&w=majority`
  - Vercel value: _______________
  - Status: ⬜ Set ⬜ Missing ⬜ Incorrect
  - Notes: _____________________

- [ ] **NEXTAUTH_SECRET**
  - Current local value: `your-super-secret-nextauth-key-change-in-production-12345`
  - Vercel value: _______________
  - Status: ⬜ Set ⬜ Missing ⬜ Incorrect
  - ⚠️ **IMPORTANT**: Must be different from local value in production!
  - Notes: _____________________

- [ ] **NEXTAUTH_URL**
  - Current local value: `http://localhost:3002`
  - Vercel value: _______________
  - Status: ⬜ Set ⬜ Missing ⬜ Incorrect
  - ⚠️ **IMPORTANT**: Must be your production domain (e.g., `https://your-app.vercel.app`)
  - Notes: _____________________

### 📧 Email Configuration (Required for Enquiry Submissions)

- [ ] **SMTP_HOST**
  - Current local value: `smtp.office365.com`
  - Vercel value: _______________
  - Status: ⬜ Set ⬜ Missing ⬜ Incorrect

- [ ] **SMTP_PORT**
  - Current local value: `587`
  - Vercel value: _______________
  - Status: ⬜ Set ⬜ Missing ⬜ Incorrect

- [ ] **SMTP_USER**
  - Current local value: `sam@resort-experts.com`
  - Vercel value: _______________
  - Status: ⬜ Set ⬜ Missing ⬜ Incorrect

- [ ] **SMTP_PASS**
  - Current local value: `[REDACTED]`
  - Vercel value: _______________
  - Status: ⬜ Set ⬜ Missing ⬜ Incorrect
  - ⚠️ **SECURITY**: Ensure this is set securely in Vercel

- [ ] **SMTP_SECURE**
  - Current local value: `false`
  - Vercel value: _______________
  - Status: ⬜ Set ⬜ Missing ⬜ Incorrect

- [ ] **EMAIL_FROM_NAME**
  - Current local value: `info@infinityweekends.co.uk`
  - Vercel value: _______________
  - Status: ⬜ Set ⬜ Missing ⬜ Incorrect

- [ ] **EMAIL_FROM_ADDRESS**
  - Current local value: `sam@resort-experts.com`
  - Vercel value: _______________
  - Status: ⬜ Set ⬜ Missing ⬜ Incorrect

### 📨 Resend Email Configuration (Alternative Email Service)

- [ ] **RESEND_API_KEY**
  - Current local value: `re_7hxSKB7S_3n64wZGehRHPCL6BJX9rG4fwCan`
  - Vercel value: _______________
  - Status: ⬜ Set ⬜ Missing ⬜ Incorrect

- [ ] **RESEND_FROM_EMAIL**
  - Current local value: `onboarding@resend.dev`
  - Vercel value: _______________
  - Status: ⬜ Set ⬜ Missing ⬜ Incorrect

- [ ] **RESEND_FROM_NAME**
  - Current local value: `Infinity Weekends`
  - Vercel value: _______________
  - Status: ⬜ Set ⬜ Missing ⬜ Incorrect

- [ ] **RESEND_TO_EMAIL**
  - Current local value: `sam@quoteawayai.com`
  - Vercel value: _______________
  - Status: ⬜ Set ⬜ Missing ⬜ Incorrect

- [ ] **RESEND_TO_NAME**
  - Current local value: `Sam`
  - Vercel value: _______________
  - Status: ⬜ Set ⬜ Missing ⬜ Incorrect

### 🤖 Optional Variables (AI Content Generation)

- [ ] **OPENAI_API_KEY**
  - Current local value: `sk-proj-[REDACTED]`
  - Vercel value: _______________
  - Status: ⬜ Set ⬜ Missing ⬜ Not needed
  - Notes: Only required if using AI content generation features

### 🌍 Environment Settings

- [ ] **NODE_ENV**
  - Recommended value: `production`
  - Vercel value: _______________
  - Status: ⬜ Set ⬜ Missing
  - Notes: Vercel usually sets this automatically

---

## How to Check Vercel Environment Variables

1. **Log into Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Select your project

2. **Navigate to Settings**
   - Click on "Settings" tab
   - Click on "Environment Variables" in the left sidebar

3. **Review Variables**
   - Check each variable listed above
   - Verify values match requirements
   - Ensure sensitive values are different from local development

4. **Check Environment Scope**
   - Ensure variables are set for: **Production**, **Preview**, and **Development**
   - Or at minimum for **Production**

---

## Common Issues and Solutions

### Issue 1: MONGODB_URI Not Set or Incorrect
**Symptoms**: 
- Events API returns 500 errors
- "Failed to connect to database" in logs

**Solution**:
1. Copy the connection string from `.env.local`
2. Add it to Vercel environment variables
3. Ensure MongoDB Atlas allows connections from Vercel (see MongoDB Atlas section below)

### Issue 2: NEXTAUTH_URL Incorrect
**Symptoms**:
- Authentication not working
- Redirects fail
- Session issues

**Solution**:
1. Set to your production domain: `https://your-app.vercel.app`
2. Do NOT include trailing slash
3. Must match exactly with your Vercel deployment URL

### Issue 3: NEXTAUTH_SECRET Not Changed
**Symptoms**:
- Security vulnerability
- Session issues in production

**Solution**:
1. Generate a new secret: `openssl rand -base64 32`
2. Set in Vercel (different from local)
3. Never use the same secret in production as development

---

## MongoDB Atlas Network Access

After setting environment variables, ensure MongoDB Atlas allows Vercel connections:

1. **Log into MongoDB Atlas**
   - Go to https://cloud.mongodb.com/

2. **Navigate to Network Access**
   - Select your cluster
   - Click "Network Access" in left sidebar

3. **Add IP Address**
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add Vercel's specific IP ranges

4. **Verify Database User**
   - Go to "Database Access"
   - Ensure user `samlupson` has read/write permissions
   - Check password is correct

---

## After Setting Variables

1. **Trigger Redeployment**
   - Go to Vercel dashboard
   - Click "Deployments" tab
   - Click "..." on latest deployment
   - Select "Redeploy"
   - Check "Use existing Build Cache" (optional)

2. **Monitor Deployment**
   - Watch build logs for errors
   - Check for environment variable warnings
   - Verify deployment completes successfully

3. **Test Endpoints**
   - Run diagnostic script: `node diagnose-vercel-deployment.js https://your-app.vercel.app`
   - Test enquiry form manually
   - Check browser console for errors

---

## Verification Checklist

After setting all variables and redeploying:

- [ ] Diagnostic script passes all tests
- [ ] Events API returns data: `https://your-app.vercel.app/api/events`
- [ ] Categories API returns data: `https://your-app.vercel.app/api/admin/events/categories?activeOnly=true`
- [ ] Health check passes: `https://your-app.vercel.app/api/health`
- [ ] Enquiry form loads without errors
- [ ] Events section appears when destination is selected
- [ ] No authentication errors in browser console
- [ ] Form submission works end-to-end

---

## Notes and Findings

[Document any issues found, solutions applied, or additional notes here]

---

## Sign-off

- [ ] All required environment variables are set correctly
- [ ] MongoDB Atlas network access is configured
- [ ] Redeployment triggered and successful
- [ ] All verification tests passed

**Completed by**: _______________
**Date**: _______________
**Time**: _______________
