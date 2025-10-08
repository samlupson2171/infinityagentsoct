# Vercel Deployment - Quick Start Guide

## 🚀 Deploy in 15 Minutes

This guide will get your application deployed to Vercel as quickly as possible.

## Prerequisites

- GitHub account with your code pushed
- Vercel account (sign up at [vercel.com](https://vercel.com))
- MongoDB Atlas account (sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))
- Email service (Resend recommended)

## Step 1: MongoDB Atlas (5 minutes)

1. **Create Cluster**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Click "Build a Database"
   - Choose FREE tier (M0)
   - Click "Create"

2. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `infinityweekends`
   - Password: Generate a strong password (save it!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

3. **Allow Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

4. **Get Connection String**
   - Go to "Database"
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Add database name: `mongodb+srv://username:password@cluster.mongodb.net/infinityweekends?retryWrites=true&w=majority`
   - **Save this connection string!**

## Step 2: Email Service (2 minutes)

### Option A: Resend (Recommended)
1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Get your API key from dashboard
4. Note your verified sender email
5. **Save API key and email!**

### Option B: SMTP (Microsoft 365/Gmail)
1. Get your SMTP credentials
2. For Microsoft 365: `smtp.office365.com:587`
3. For Gmail: `smtp.gmail.com:587` (use App Password)
4. **Save SMTP details!**

## Step 3: Generate Secrets (1 minute)

Run this command locally to generate NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

**Save the output!** You'll need it for Vercel.

## Step 4: Deploy to Vercel (5 minutes)

1. **Import Project**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Click "Import"

2. **Configure Build** (should be auto-detected)
   - Framework Preset: **Next.js**
   - Root Directory: (leave empty)
   - Build Command: `npm run build`
   - Output Directory: (leave empty)

3. **Add Environment Variables**
   
   Click "Environment Variables" and add these (set all to "Production"):

   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/infinityweekends?retryWrites=true&w=majority
   NEXTAUTH_SECRET=<your-generated-secret-from-step-3>
   NEXTAUTH_URL=https://your-project-name.vercel.app
   NEXT_PUBLIC_BASE_URL=https://your-project-name.vercel.app
   NODE_ENV=production
   ```

   **For Resend:**
   ```env
   RESEND_API_KEY=re_your_api_key
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

   **OR for SMTP:**
   ```env
   SMTP_HOST=smtp.office365.com
   SMTP_PORT=587
   SMTP_USER=your-email@domain.com
   SMTP_PASS=your-app-password
   SMTP_SECURE=false
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 3-5 minutes for build
   - Note your deployment URL (e.g., `infinityagents.vercel.app`)

## Step 5: Update URLs (2 minutes)

1. **Update Environment Variables**
   - Go to your project → Settings → Environment Variables
   - Update `NEXTAUTH_URL` with your actual Vercel URL
   - Update `NEXT_PUBLIC_BASE_URL` with your actual Vercel URL
   - Vercel will automatically redeploy

## Step 6: Create Admin User (3 minutes)

1. **Register**
   - Visit: `https://your-app.vercel.app/auth/register`
   - Fill in registration form
   - Submit

2. **Make Admin**
   - Go to MongoDB Atlas
   - Click "Browse Collections"
   - Find `users` collection
   - Find your user document
   - Click "Edit"
   - Change `role` to `"admin"`
   - Change `registrationStatus` to `"approved"`
   - Click "Update"

3. **Test Login**
   - Visit: `https://your-app.vercel.app/auth/login`
   - Log in with your credentials
   - You should see the admin dashboard

## ✅ Verification Checklist

Test these to confirm successful deployment:

- [ ] Homepage loads: `https://your-app.vercel.app`
- [ ] Health check works: `https://your-app.vercel.app/api/health`
- [ ] Admin login works
- [ ] Admin dashboard accessible
- [ ] No errors in browser console
- [ ] No errors in Vercel logs

## 🎉 Success!

Your application is now deployed! 

## Next Steps

1. **Add Content**
   - Create destinations
   - Upload offers
   - Add activities

2. **Configure Email Templates**
   - Customize email content
   - Test email sending

3. **Set Up Custom Domain** (Optional)
   - Go to Project Settings → Domains
   - Add your custom domain
   - Update DNS records
   - Update environment variables

## 🆘 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure MongoDB connection string is correct

### Can't Login
- Verify NEXTAUTH_URL matches your Vercel URL
- Check NEXTAUTH_SECRET is set
- Ensure user is set to admin in MongoDB

### Database Connection Fails
- Verify MongoDB connection string format
- Check IP whitelist includes 0.0.0.0/0
- Ensure database user has correct permissions

### Email Not Sending
- Verify email service credentials
- Check Vercel function logs
- Test email service separately

## 📚 Detailed Documentation

For more detailed information, see:

- **VERCEL_DEPLOYMENT_COMPLETE_GUIDE.md** - Comprehensive step-by-step guide
- **VERCEL_DEPLOYMENT_CHECKLIST.md** - Interactive checklist
- **VERCEL_DEPLOYMENT_FIXES_SUMMARY.md** - Technical details of fixes applied

## 🔗 Useful Links

- **Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
- **MongoDB Atlas**: [cloud.mongodb.com](https://cloud.mongodb.com)
- **Resend**: [resend.com](https://resend.com)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)

---

**Estimated Total Time**: 15-20 minutes
**Difficulty**: Easy
**Cost**: Free (using free tiers)
