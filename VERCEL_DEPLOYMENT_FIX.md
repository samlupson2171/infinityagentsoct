# Vercel Deployment Fix Guide

## Required Environment Variables for Vercel

Add these environment variables in your Vercel dashboard (Settings > Environment Variables):

### Essential Variables:
```
MONGODB_URI=your-mongodb-atlas-connection-string
NEXTAUTH_URL=https://your-vercel-app-url.vercel.app
NEXTAUTH_SECRET=your-32-character-secret-key
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://your-vercel-app-url.vercel.app
```

### Email Configuration (choose one):
```
# Option 1: Resend (Recommended)
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Option 2: SMTP
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-app-password
SMTP_SECURE=false
```

### Optional AI Features:
```
OPENAI_API_KEY=sk-your-openai-key (if using AI features)
```

## Common Build Errors & Fixes:

### 1. TypeScript Errors
If you see TypeScript compilation errors, temporarily disable strict checking:

Update `next.config.js`:
```javascript
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Add this line
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // ... rest of config
}
```

### 2. MongoDB Connection Issues
- Ensure your MongoDB Atlas cluster allows connections from `0.0.0.0/0` (all IPs)
- Use the full connection string with credentials
- Make sure the database user has read/write permissions

### 3. Large Bundle Size
If deployment fails due to size limits, add to `next.config.js`:
```javascript
const nextConfig = {
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64',
      ],
    },
  },
  // ... rest of config
}
```

### 4. Function Timeout Issues
Your `vercel.json` already has maxDuration set to 30s, which is good.

## Deployment Steps:

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Set Environment Variables**: Add all required env vars in Vercel dashboard
3. **Configure Build Settings**:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: Leave empty (Next.js default)
   - Install Command: `npm install`

4. **Deploy**: Trigger deployment

## Quick Fix Commands:

Run these locally to check for issues before deploying:
```bash
# Check for TypeScript errors
npm run type-check

# Check for build errors
npm run build

# Test production build locally
npm run start
```