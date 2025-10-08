# Complete Vercel Deployment Guide for Infinity Weekends

## Overview
This guide will help you successfully deploy the Infinity Weekends application to Vercel.

## Prerequisites

1. **GitHub Repository** - Your code must be pushed to GitHub
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **MongoDB Atlas** - Cloud database (free tier available)
4. **Email Service** - Either Resend or SMTP credentials

## Step 1: Prepare MongoDB Atlas

### 1.1 Create MongoDB Atlas Account
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (M0 Free tier is sufficient for development)

### 1.2 Configure Database Access
1. Go to **Database Access** in the left sidebar
2. Click **Add New Database User**
3. Create a user with username and password (save these!)
4. Set permissions to **Read and write to any database**

### 1.3 Configure Network Access
1. Go to **Network Access** in the left sidebar
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (0.0.0.0/0)
   - This is required for Vercel's dynamic IPs
4. Click **Confirm**

### 1.4 Get Connection String
1. Go to **Database** in the left sidebar
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your actual credentials
6. Add your database name after `.net/`: 
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/infinityweekends?retryWrites=true&w=majority
   ```

## Step 2: Prepare Email Service

### Option A: Resend (Recommended)
1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (or use their test domain)
3. Get your API key from the dashboard
4. Note your verified sender email

### Option B: SMTP (Microsoft 365, Gmail, etc.)
1. Get your SMTP server details
2. For Microsoft 365:
   - Host: `smtp.office365.com`
   - Port: `587`
   - Secure: `false`
3. For Gmail:
   - Host: `smtp.gmail.com`
   - Port: `587`
   - Secure: `false`
   - Use an App Password (not your regular password)

## Step 3: Deploy to Vercel

### 3.1 Connect Repository
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Select the repository: `infinityagents` or your repo name

### 3.2 Configure Build Settings
Vercel should auto-detect Next.js. Verify these settings:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: (leave empty)
- **Install Command**: `npm install`
- **Root Directory**: (leave empty)

### 3.3 Add Environment Variables

Click **Environment Variables** and add the following:

#### Required Variables:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/infinityweekends?retryWrites=true&w=majority

# Authentication
NEXTAUTH_SECRET=<generate-a-32-character-secret>
NEXTAUTH_URL=https://your-project-name.vercel.app

# Application
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://your-project-name.vercel.app
```

**To generate NEXTAUTH_SECRET**, run locally:
```bash
openssl rand -base64 32
```

#### Email Configuration (Choose One):

**Option A - Resend:**
```env
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Option B - SMTP:**
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-app-password
SMTP_SECURE=false
```

#### Optional (AI Features):
```env
OPENAI_API_KEY=sk-your-openai-key
CLAUDE_API_KEY=sk-ant-your-claude-key
```

### 3.4 Deploy
1. Click **Deploy**
2. Wait for the build to complete (3-5 minutes)
3. Once deployed, you'll get a URL like: `https://your-project-name.vercel.app`

## Step 4: Post-Deployment Setup

### 4.1 Update NEXTAUTH_URL
1. After first deployment, note your actual Vercel URL
2. Go to **Settings** → **Environment Variables**
3. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_BASE_URL` with your actual URL
4. Redeploy (Vercel will auto-redeploy on env var changes)

### 4.2 Create Admin User
1. Visit: `https://your-app.vercel.app/auth/register`
2. Register a new user
3. Go to MongoDB Atlas → **Browse Collections**
4. Find the `users` collection
5. Find your user and edit it
6. Change `role` from `"agent"` to `"admin"`
7. Change `registrationStatus` to `"approved"`
8. Save the changes

### 4.3 Test Core Features
Visit your app and test:
- [ ] User login works
- [ ] Admin dashboard accessible
- [ ] Database connections work
- [ ] Email sending works (test registration email)

## Step 5: Custom Domain (Optional)

### 5.1 Add Domain in Vercel
1. Go to your project → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `infinityweekends.com`)

### 5.2 Configure DNS
Add these DNS records at your domain registrar:

**For root domain (infinityweekends.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 5.3 Update Environment Variables
After domain is verified:
1. Update `NEXTAUTH_URL` to `https://yourdomain.com`
2. Update `NEXT_PUBLIC_BASE_URL` to `https://yourdomain.com`
3. Update `RESEND_FROM_EMAIL` to use your domain

## Troubleshooting

### Build Fails with TypeScript Errors
The `next.config.js` is already configured to ignore TypeScript errors during build. If you still see issues:
1. Check the build logs in Vercel dashboard
2. Fix any critical errors locally first
3. Test build locally: `npm run build`

### MongoDB Connection Fails
- Verify connection string format
- Check username/password are correct (no special characters need URL encoding)
- Ensure IP whitelist includes 0.0.0.0/0
- Test connection string locally first

### Environment Variables Not Working
- Ensure no trailing spaces in values
- Redeploy after adding/changing env vars
- Check variable names match exactly (case-sensitive)
- For NEXTAUTH_SECRET, ensure it's at least 32 characters

### API Routes Timeout
- Vercel Hobby plan has 10-second timeout
- Optimize database queries
- Consider upgrading to Pro plan for 60-second timeout
- Check MongoDB Atlas performance metrics

### Email Not Sending
- Verify email service credentials
- Check Vercel logs for error messages
- Test email service separately
- For SMTP, ensure app passwords are used (not regular passwords)

### Static Generation Errors
All API routes have been configured with `export const dynamic = 'force-dynamic'` to prevent static generation issues.

## Monitoring and Maintenance

### View Logs
1. Go to your project in Vercel
2. Click **Deployments**
3. Click on a deployment
4. View **Functions** logs for API routes
5. View **Build** logs for build issues

### Performance Monitoring
- Vercel provides built-in analytics
- Monitor MongoDB Atlas performance
- Set up alerts for errors

### Database Backups
- MongoDB Atlas provides automatic backups
- Configure backup schedule in Atlas dashboard
- Test restore process periodically

## Security Checklist

- [ ] All environment variables are set correctly
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] MongoDB Atlas network access is configured
- [ ] Database user has appropriate permissions only
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] Admin routes are protected
- [ ] File upload validation is in place
- [ ] No sensitive data in logs

## Common Vercel Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List environment variables
vercel env ls

# Pull environment variables locally
vercel env pull
```

## Support Resources

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **MongoDB Atlas Documentation**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)

## Quick Reference

### Your Deployment URLs
- **Production**: `https://your-project-name.vercel.app`
- **Admin Dashboard**: `https://your-project-name.vercel.app/admin/dashboard`
- **API Health Check**: `https://your-project-name.vercel.app/api/health`

### Important Files
- `next.config.js` - Next.js configuration
- `vercel.json` - Vercel-specific settings
- `.env.example` - Environment variable template
- `DEPLOYMENT_GUIDE.md` - This guide

## Next Steps After Deployment

1. **Set up monitoring** - Configure error tracking
2. **Add custom domain** - Use your own domain
3. **Configure email templates** - Customize email content
4. **Add content** - Create destinations, offers, activities
5. **Test thoroughly** - Test all features in production
6. **Set up backups** - Configure database backup schedule
7. **Document processes** - Create admin user guide

---

**Need Help?** Check the Vercel dashboard logs first, then review this guide. Most issues are related to environment variables or MongoDB configuration.
