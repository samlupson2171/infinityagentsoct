# 🚨 Fix Emails Not Sending - Quick Start

## The Problem
Your production site shows: `Email configuration is incomplete. Missing SMTP settings.`

## The Solution (3 Steps - Takes 5 Minutes)

### ⚡ Step 1: Go to Vercel Dashboard
1. Open https://vercel.com/dashboard
2. Click on your project
3. Go to **Settings** → **Environment Variables**

### ⚡ Step 2: Verify These Variables Exist for Production
```
SMTP_HOST = smtpout.secureserver.net
SMTP_PORT = 465
SMTP_USER = agents@infinityagents.co.uk
SMTP_PASS = 5tgbVFR$3edc
SMTP_SECURE = true
EMAIL_FROM_NAME = Infinity Agents
EMAIL_FROM_ADDRESS = agents@infinityagents.co.uk
```

If any are missing, add them now.

### ⚡ Step 3: Redeploy (CRITICAL!)
1. Go to **Deployments** tab
2. Click (...) on the latest deployment
3. Click **Redeploy**
4. **UNCHECK** "Use existing Build Cache" ← IMPORTANT!
5. Click **Redeploy**
6. Wait 2-5 minutes

## ✅ Test It
1. Visit your production site
2. Register a test user
3. Check for confirmation email

## 🔍 Verify It Worked
Visit: `https://your-site.vercel.app/api/debug/check-smtp-config`

Should show: `"status": "OK"`

---

## Why This Happens
Environment variables are captured during deployment, not at runtime. Updating them in Vercel doesn't affect running deployments - you MUST redeploy.

## Need More Help?
See `EMAIL_NOT_SENDING_FIX.md` for detailed troubleshooting.
