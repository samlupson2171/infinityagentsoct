# MongoDB Atlas Network Access Setup Guide

## Task 3.1: Update MongoDB Atlas Network Access

This guide provides step-by-step instructions for configuring MongoDB Atlas to allow connections from Vercel.

## Prerequisites

- MongoDB Atlas account with admin access
- Your MongoDB cluster already created
- Database user credentials

## Steps to Configure Network Access

### 1. Log into MongoDB Atlas

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Sign in with your credentials
3. Select your organization and project

### 2. Navigate to Network Access

1. In the left sidebar, click on **"Network Access"** under the "Security" section
2. You'll see a list of current IP access list entries

### 3. Add IP Address for Vercel

You have two options:

#### Option A: Allow All IPs (Recommended for Vercel)

1. Click the **"+ ADD IP ADDRESS"** button
2. Click **"ALLOW ACCESS FROM ANYWHERE"**
3. This will automatically fill in `0.0.0.0/0`
4. Add a comment: "Vercel deployment access"
5. Click **"Confirm"**

**Note:** This is safe when combined with strong database user authentication. Vercel's serverless functions use dynamic IPs, so this is the most reliable approach.

#### Option B: Add Specific Vercel IP Ranges (Advanced)

If you prefer to restrict access to Vercel's IP ranges:

1. Click the **"+ ADD IP ADDRESS"** button
2. Manually add each of Vercel's IP ranges (check Vercel documentation for current ranges)
3. Add a comment for each: "Vercel IP range"
4. Click **"Confirm"** for each entry

**Warning:** Vercel's IP ranges may change, which could break your deployment.

### 4. Verify Database User Permissions

1. In the left sidebar, click on **"Database Access"** under the "Security" section
2. Find your database user (the one used in your `MONGODB_URI`)
3. Verify the user has appropriate permissions:
   - **Built-in Role:** `readWrite` on your database
   - Or **Custom Role:** with read/write permissions
4. If needed, click **"Edit"** to update permissions
5. Ensure the password is correct and matches your `MONGODB_URI`

### 5. Verify Connection String Format

Your `MONGODB_URI` should follow this format:

```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

**Important checks:**
- Replace `<username>` with your database username
- Replace `<password>` with your database password (URL-encoded if it contains special characters)
- Replace `<cluster>` with your cluster name
- Replace `<database>` with your database name
- Ensure no spaces or line breaks in the connection string

### 6. Test Connection from Vercel

After making changes:

1. Wait 1-2 minutes for changes to propagate
2. Deploy your application to Vercel (or trigger a redeployment)
3. Test the health check endpoint:
   ```bash
   curl https://your-domain.vercel.app/api/health
   ```
4. Check the response for `"database": { "status": "connected" }`

### 7. Test Connection Locally

Before deploying, test locally:

```bash
# Start your development server
npm run dev

# In another terminal, test the health check
curl http://localhost:3000/api/health
```

Look for:
```json
{
  "status": "healthy",
  "database": {
    "status": "connected",
    "error": null
  }
}
```

## Troubleshooting

### Issue: "Connection timed out"

**Causes:**
- IP address not whitelisted
- Network access changes not yet propagated

**Solutions:**
1. Verify `0.0.0.0/0` is in the IP Access List
2. Wait 2-3 minutes and try again
3. Check MongoDB Atlas status page for outages

### Issue: "Authentication failed"

**Causes:**
- Incorrect username or password
- User doesn't have proper permissions
- Password contains special characters not URL-encoded

**Solutions:**
1. Verify credentials in MongoDB Atlas Database Access
2. Ensure user has `readWrite` role
3. URL-encode special characters in password:
   - `@` → `%40`
   - `#` → `%23`
   - `$` → `%24`
   - `%` → `%25`
   - `&` → `%26`

### Issue: "Database not found"

**Causes:**
- Database name in connection string doesn't match actual database
- User doesn't have access to the specified database

**Solutions:**
1. Check database name in MongoDB Atlas
2. Update `MONGODB_URI` with correct database name
3. Verify user permissions include the correct database

## Vercel Environment Variables

After configuring MongoDB Atlas, ensure your Vercel environment variables are set:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add or update `MONGODB_URI` with your connection string
4. Set it for all environments: **Production**, **Preview**, and **Development**
5. Click **"Save"**
6. Trigger a new deployment for changes to take effect

## Security Best Practices

1. **Use Strong Passwords:** Ensure database user password is complex
2. **Limit User Permissions:** Only grant necessary database access
3. **Rotate Credentials:** Periodically update database passwords
4. **Monitor Access:** Check MongoDB Atlas logs for suspicious activity
5. **Use Environment Variables:** Never commit connection strings to git

## Verification Checklist

- [ ] MongoDB Atlas Network Access includes `0.0.0.0/0` or Vercel IPs
- [ ] Database user exists with correct permissions
- [ ] Database user password is correct and URL-encoded if needed
- [ ] `MONGODB_URI` format is correct
- [ ] `MONGODB_URI` is set in Vercel environment variables
- [ ] Health check endpoint returns `"database": { "status": "connected" }` locally
- [ ] Health check endpoint returns `"database": { "status": "connected" }` on Vercel
- [ ] No authentication errors in Vercel logs
- [ ] Application can read/write to database on Vercel

## Next Steps

Once database connectivity is verified:

1. Mark task 3.1 as complete
2. Proceed to task 4: Ensure all environment variables are set in Vercel
3. Continue with deployment verification tasks

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [MongoDB Connection String Format](https://docs.mongodb.com/manual/reference/connection-string/)
