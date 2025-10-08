# Vercel Deployment Checklist

Use this checklist to ensure a successful deployment to Vercel.

## Pre-Deployment Checklist

### Local Testing
- [ ] Run `npm run build` locally - build completes successfully
- [ ] Run `npm run start` - production build runs locally
- [ ] Test all critical features locally
- [ ] No console errors in browser
- [ ] All tests pass: `npm run test:run`

### Code Repository
- [ ] All changes committed to Git
- [ ] Code pushed to GitHub
- [ ] Repository is accessible
- [ ] `.gitignore` includes `.env.local` and `.env.production.local`

### MongoDB Atlas Setup
- [ ] MongoDB Atlas account created
- [ ] Cluster created (M0 Free tier is fine)
- [ ] Database user created with read/write permissions
- [ ] Network access allows 0.0.0.0/0 (all IPs)
- [ ] Connection string obtained and tested
- [ ] Database name added to connection string

### Email Service Setup
Choose one:
- [ ] **Resend**: Account created, domain verified, API key obtained
- [ ] **SMTP**: Server details obtained, credentials tested

### Environment Variables Prepared
Have these ready to paste into Vercel:
- [ ] `MONGODB_URI` - Full MongoDB Atlas connection string
- [ ] `NEXTAUTH_SECRET` - Generated 32+ character secret
- [ ] `NEXTAUTH_URL` - Will be your Vercel URL
- [ ] `NEXT_PUBLIC_BASE_URL` - Will be your Vercel URL
- [ ] `RESEND_API_KEY` or SMTP credentials
- [ ] `RESEND_FROM_EMAIL` or SMTP email
- [ ] `NODE_ENV=production`

## Deployment Steps

### 1. Connect to Vercel
- [ ] Go to [vercel.com/dashboard](https://vercel.com/dashboard)
- [ ] Click "Add New" → "Project"
- [ ] Import your GitHub repository
- [ ] Select the correct repository

### 2. Configure Build Settings
- [ ] Framework Preset: **Next.js** (auto-detected)
- [ ] Build Command: `npm run build` (default)
- [ ] Output Directory: (leave empty)
- [ ] Install Command: `npm install` (default)
- [ ] Root Directory: (leave empty)

### 3. Add Environment Variables
Add each variable in Vercel's Environment Variables section:

#### Required Variables (Production scope):
```
MONGODB_URI = [your-mongodb-atlas-connection-string]
NEXTAUTH_SECRET = [your-32-character-secret]
NEXTAUTH_URL = https://your-project-name.vercel.app
NEXT_PUBLIC_BASE_URL = https://your-project-name.vercel.app
NODE_ENV = production
```

#### Email Variables (choose one method):
**Resend:**
```
RESEND_API_KEY = [your-resend-api-key]
RESEND_FROM_EMAIL = [your-verified-email]
```

**OR SMTP:**
```
SMTP_HOST = smtp.office365.com
SMTP_PORT = 587
SMTP_USER = [your-email]
SMTP_PASS = [your-app-password]
SMTP_SECURE = false
```

#### Optional (if using AI features):
```
OPENAI_API_KEY = [your-openai-key]
CLAUDE_API_KEY = [your-claude-key]
```

- [ ] All required environment variables added
- [ ] Email configuration added (Resend OR SMTP)
- [ ] All variables set to "Production" scope

### 4. Deploy
- [ ] Click "Deploy" button
- [ ] Wait for build to complete (3-5 minutes)
- [ ] Build succeeds without errors
- [ ] Deployment URL provided

## Post-Deployment Checklist

### 1. Update Environment Variables
- [ ] Note your actual Vercel URL (e.g., `infinityagents.vercel.app`)
- [ ] Update `NEXTAUTH_URL` with actual URL
- [ ] Update `NEXT_PUBLIC_BASE_URL` with actual URL
- [ ] Vercel auto-redeploys after env var changes

### 2. Create Admin User
- [ ] Visit: `https://your-app.vercel.app/auth/register`
- [ ] Register a new user account
- [ ] Go to MongoDB Atlas → Browse Collections
- [ ] Find `users` collection
- [ ] Locate your user document
- [ ] Edit user: set `role` to `"admin"`
- [ ] Edit user: set `registrationStatus` to `"approved"`
- [ ] Save changes

### 3. Test Core Functionality
- [ ] Visit homepage - loads correctly
- [ ] Login with admin account - successful
- [ ] Access admin dashboard - accessible
- [ ] Test database connection - data loads
- [ ] Test email sending - registration email works
- [ ] Check browser console - no errors
- [ ] Test on mobile device - responsive

### 4. Verify API Routes
- [ ] Health check: `https://your-app.vercel.app/api/health`
- [ ] Returns 200 OK status
- [ ] Database connection confirmed

### 5. Monitor Initial Deployment
- [ ] Check Vercel dashboard for errors
- [ ] Review function logs for any issues
- [ ] Monitor MongoDB Atlas for connections
- [ ] Check email service for delivery

## Troubleshooting

### Build Fails
- [ ] Check build logs in Vercel dashboard
- [ ] Verify all dependencies in package.json
- [ ] Test build locally: `npm run build`
- [ ] Check for TypeScript errors (should be ignored)

### MongoDB Connection Fails
- [ ] Verify connection string format
- [ ] Check username/password (no special chars)
- [ ] Confirm IP whitelist includes 0.0.0.0/0
- [ ] Test connection string locally

### Environment Variables Not Working
- [ ] Check for typos in variable names
- [ ] Ensure no trailing spaces in values
- [ ] Verify variables are in "Production" scope
- [ ] Redeploy after adding/changing variables

### API Routes Return 500 Errors
- [ ] Check function logs in Vercel
- [ ] Verify MongoDB connection
- [ ] Check environment variables are set
- [ ] Review error messages in logs

### Email Not Sending
- [ ] Verify email service credentials
- [ ] Check Vercel function logs
- [ ] Test email service separately
- [ ] For SMTP, use app passwords

## Optional: Custom Domain

### Add Custom Domain
- [ ] Go to Project Settings → Domains
- [ ] Click "Add Domain"
- [ ] Enter your domain name
- [ ] Follow DNS configuration instructions
- [ ] Wait for DNS propagation (up to 48 hours)
- [ ] Update `NEXTAUTH_URL` to custom domain
- [ ] Update `NEXT_PUBLIC_BASE_URL` to custom domain
- [ ] Update `RESEND_FROM_EMAIL` to use custom domain

## Security Checklist

- [ ] All environment variables are set correctly
- [ ] No sensitive data in code or logs
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] MongoDB Atlas network access configured
- [ ] Admin routes are protected
- [ ] File upload validation in place
- [ ] NEXTAUTH_SECRET is strong and unique

## Performance Checklist

- [ ] Images optimized
- [ ] Database queries optimized
- [ ] API routes respond quickly (<3 seconds)
- [ ] No console errors or warnings
- [ ] Lighthouse score checked

## Documentation

- [ ] Document your Vercel URL
- [ ] Document admin credentials (securely)
- [ ] Document MongoDB Atlas details (securely)
- [ ] Update team on deployment
- [ ] Create runbook for common issues

## Monitoring Setup

- [ ] Enable Vercel Analytics
- [ ] Set up error tracking (optional)
- [ ] Configure MongoDB Atlas alerts
- [ ] Set up uptime monitoring (optional)
- [ ] Document monitoring procedures

## Success Criteria

Your deployment is successful when:
- ✅ Application loads without errors
- ✅ Admin can log in and access dashboard
- ✅ Database operations work correctly
- ✅ Email notifications are sent
- ✅ All core features are functional
- ✅ No errors in Vercel logs
- ✅ Mobile responsive design works

## Next Steps

After successful deployment:
1. **Add Content** - Create destinations, offers, activities
2. **Test Thoroughly** - Test all features in production
3. **Set Up Backups** - Configure MongoDB backup schedule
4. **Monitor Performance** - Watch logs and metrics
5. **Document Processes** - Create admin user guide
6. **Train Users** - Onboard team members

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Vercel URL**: _______________
**MongoDB Cluster**: _______________

**Notes**:
_______________________________________
_______________________________________
_______________________________________
