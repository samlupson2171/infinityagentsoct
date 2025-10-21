# Vercel Blob Storage Setup Guide

## Problem
Your destination images are not loading on the live site because the file upload system was using filesystem writes (`fs.writeFile`), which don't work on Vercel's serverless platform. Vercel functions run in a read-only filesystem.

## Solution
I've updated your destination file upload system to use **Vercel Blob Storage** instead of the filesystem. This is the same storage solution already being used for training materials.

## What Was Changed

### 1. File Upload API (`src/app/api/admin/destinations/[id]/files/route.ts`)
- ✅ Replaced `fs.writeFile` with `@vercel/blob` `put()` function
- ✅ Files now upload to Vercel Blob instead of local filesystem
- ✅ URLs now point to Blob storage URLs instead of `/uploads/` paths

### 2. File Deletion API (`src/app/api/admin/destinations/[id]/files/[fileId]/route.ts`)
- ✅ Replaced `fs.unlink` with `@vercel/blob` `del()` function
- ✅ Files are now deleted from Blob storage

## Setup Instructions

### Step 1: Create Vercel Blob Store

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project (infinity-weekends)
3. Go to the **Storage** tab
4. Click **Create Database** → Select **Blob**
5. Give it a name (e.g., "infinity-weekends-files")
6. Click **Create**

### Step 2: Get Your Blob Token

After creating the Blob store:

1. Vercel will automatically add the `BLOB_READ_WRITE_TOKEN` to your project's environment variables
2. Go to **Settings** → **Environment Variables**
3. Verify that `BLOB_READ_WRITE_TOKEN` exists
4. If not, you can find it in the Blob store settings

### Step 3: Deploy the Changes

```bash
# Commit the changes
git add .
git commit -m "Fix: Migrate destination file uploads to Vercel Blob storage"

# Push to trigger deployment
git push
```

Vercel will automatically deploy with the new Blob storage configuration.

### Step 4: Re-upload Existing Images

**Important:** Existing images that were uploaded to the filesystem won't automatically migrate. You'll need to:

1. Download any existing destination images from your local `public/uploads/destinations/` folder
2. Re-upload them through the admin interface after deployment
3. The new uploads will go to Vercel Blob and work correctly

## Verification

After deployment, test the following:

1. **Upload a new destination image**
   - Go to Admin → Destinations → Edit a destination
   - Upload a new hero image or gallery image
   - Verify it appears correctly

2. **Check the image URL**
   - The URL should look like: `https://[random-id].public.blob.vercel-storage.com/destinations/[destination-id]/[file-id].jpg`
   - NOT like: `/uploads/destinations/[destination-id]/[file-id].jpg`

3. **Delete an image**
   - Try deleting an uploaded image
   - Verify it's removed from both the UI and Blob storage

## Local Development

For local development, you have two options:

### Option A: Use Vercel Blob (Recommended)
Add the `BLOB_READ_WRITE_TOKEN` to your `.env.local`:

```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_[your-token-here]
```

You can get this token from:
- Vercel Dashboard → Your Project → Storage → Blob → Settings → Token

### Option B: Use Filesystem Fallback
If you don't want to use Blob locally, you can keep using the filesystem for local development by creating a conditional check in the upload code. However, this is not recommended as it creates inconsistency between environments.

## Benefits of Vercel Blob

✅ **Works in production** - No filesystem limitations
✅ **Automatic CDN** - Fast global delivery
✅ **Scalable** - No storage limits
✅ **Secure** - Built-in access controls
✅ **Cost-effective** - Pay only for what you use

## Troubleshooting

### "BLOB_READ_WRITE_TOKEN is not defined"
- Make sure you've created a Blob store in Vercel
- Check that the environment variable exists in Vercel settings
- Redeploy after adding the variable

### "Upload failed with 500 error"
- Check Vercel function logs for detailed error messages
- Verify the Blob token has read/write permissions
- Ensure the file size is under 4.5MB (Vercel Blob limit for hobby plan)

### Images still showing 404
- Clear your browser cache
- Verify the image URL is a Blob URL (not `/uploads/`)
- Check that the image was uploaded after the deployment

## Next Steps

1. ✅ Deploy the changes
2. ✅ Verify Blob storage is working
3. ✅ Re-upload any existing destination images
4. ✅ Test image upload, display, and deletion
5. ✅ Update your local `.env.local` with the Blob token

## Additional Resources

- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Vercel Blob Pricing](https://vercel.com/docs/storage/vercel-blob/usage-and-pricing)
- [Vercel Blob API Reference](https://vercel.com/docs/storage/vercel-blob/using-blob-sdk)
