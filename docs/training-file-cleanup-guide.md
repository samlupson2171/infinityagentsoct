# Training File Cleanup Guide

## Overview

The training file cleanup system automatically manages orphaned files that are no longer associated with any training materials. This prevents storage bloat and ensures efficient use of disk space.

## What are Orphaned Files?

Orphaned files are files that meet one of these conditions:

1. **Uploaded but never associated**: Files uploaded but the training material creation failed
2. **Removed from materials**: Files that were removed when a training material was updated
3. **Material deleted**: Files from training materials that have been deleted

## Automatic Orphaning

Files are automatically marked as orphaned in these scenarios:

### 1. Material Deletion
When a training material is deleted, all associated files are marked as orphaned:

```javascript
// Example: Deleting a training material
DELETE /api/admin/training/{materialId}

// Response includes orphaned file count
{
  "success": true,
  "data": {
    "materialId": "...",
    "message": "Training material deleted successfully",
    "orphanedFiles": 3
  }
}
```

### 2. File Removal During Update
When files are removed from a training material during an update:

```javascript
// Example: Updating material with fewer files
PUT /api/admin/training/{materialId}
{
  "uploadedFiles": [
    // Only include files you want to keep
    // Removed files are automatically marked as orphaned
  ]
}
```

### 3. Upload Without Association
Files uploaded but not associated with a material within a reasonable time are marked as orphaned.

## Cleanup Process

### Grace Period
Orphaned files are kept for **7 days** by default before being eligible for deletion. This grace period:
- Allows recovery of accidentally deleted materials
- Provides time for troubleshooting upload issues
- Prevents immediate data loss

### Automatic Cleanup

#### Option 1: API Endpoint (Manual Trigger)

Administrators can manually trigger cleanup via the API:

```bash
# Clean up files older than 7 days (default)
curl -X POST https://your-domain.com/api/admin/training/files/cleanup \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Clean up files older than 14 days
curl -X POST https://your-domain.com/api/admin/training/files/cleanup \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"olderThanDays": 14}'
```

Response:
```json
{
  "success": true,
  "data": {
    "deletedCount": 5,
    "olderThanDays": 7,
    "duration": 1234,
    "message": "Successfully cleaned up 5 orphaned file(s)"
  }
}
```

#### Option 2: Scheduled Script (Recommended)

Use the provided cleanup script for automated scheduled cleanup:

```bash
# Run cleanup manually
node scripts/cleanup-orphaned-files.js

# Run cleanup with custom age threshold (14 days)
node scripts/cleanup-orphaned-files.js 14
```

**Setting up a Cron Job (Linux/Mac):**

```bash
# Edit crontab
crontab -e

# Add this line to run cleanup daily at 2 AM
0 2 * * * cd /path/to/project && node scripts/cleanup-orphaned-files.js >> /var/log/file-cleanup.log 2>&1
```

**Setting up a Scheduled Task (Windows):**

1. Open Task Scheduler
2. Create a new task
3. Set trigger to daily at 2 AM
4. Set action to run: `node C:\path\to\project\scripts\cleanup-orphaned-files.js`
5. Configure to log output to a file

### Viewing Orphaned Files

Before running cleanup, you can view what files will be deleted:

```bash
# View orphaned files older than 7 days
curl https://your-domain.com/api/admin/training/files/cleanup?olderThanDays=7 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "count": 5,
    "totalSize": 5242880,
    "totalSizeMB": "5.00",
    "olderThanDays": 7,
    "files": [
      {
        "id": "abc-123",
        "originalName": "document.pdf",
        "filePath": "uploads/training/abc-123.pdf",
        "size": 1048576,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "uploadedBy": "user-id"
      }
    ]
  }
}
```

## Monitoring and Logging

### Script Output

The cleanup script provides detailed logging:

```
================================================================================
Orphaned File Cleanup Script
================================================================================
Started at: 2024-01-15T02:00:00.000Z
Configuration:
  - Older than: 7 days
  - MongoDB URI: mongodb://***:***@localhost:27017/database

Connecting to MongoDB...
✓ Connected to MongoDB

Searching for orphaned files older than 7 days...
✓ Found 5 orphaned file(s)

Total size to be freed: 5.00 MB

Starting cleanup...
Processing: document.pdf (abc-123)
  - Age: 10 days
  - Size: 1.00 KB
  - Path: uploads/training/abc-123.pdf
  ✓ Deleted successfully (file and database record)

Processing: image.png (def-456)
  - Age: 8 days
  - Size: 2.50 KB
  - Path: uploads/training/def-456.png
  ⚠ Database record deleted, but physical file not found

================================================================================
Cleanup Summary:
  - Files processed: 5
  - Successfully deleted: 5
  - Errors: 0
  - Space freed: 5.00 MB
Completed at: 2024-01-15T02:00:15.000Z
================================================================================
```

### API Logging

All cleanup operations are logged to the console with timestamps:

```
Starting cleanup of orphaned files older than 7 days
Found 5 orphaned files to clean up
Deleted orphaned file: uploads/training/abc-123.pdf
Deleted orphaned file: uploads/training/def-456.png
Cleanup complete: 5 orphaned files deleted
```

## Best Practices

### 1. Regular Cleanup Schedule
- Run cleanup daily during off-peak hours (e.g., 2 AM)
- Use the default 7-day grace period for most cases
- Increase grace period (14+ days) for critical systems

### 2. Monitoring
- Review cleanup logs regularly
- Monitor disk space usage trends
- Set up alerts for unusual orphaned file counts

### 3. Backup Strategy
- Ensure regular backups include uploaded files
- Test file restoration procedures
- Keep backups for at least 30 days

### 4. Testing
- Test cleanup in staging environment first
- Verify files are properly orphaned before cleanup
- Confirm cleanup doesn't affect active materials

## Troubleshooting

### Files Not Being Cleaned Up

**Problem**: Orphaned files remain after cleanup

**Solutions**:
1. Check if files are older than the grace period
2. Verify `isOrphaned` flag is set to `true` in database
3. Check file permissions on the filesystem
4. Review cleanup logs for errors

### Physical Files Missing

**Problem**: Database records exist but physical files are missing

**Solutions**:
1. Run cleanup to remove orphaned database records
2. Check file upload path configuration
3. Verify filesystem permissions
4. Review file upload logs

### Cleanup Script Fails

**Problem**: Cleanup script exits with errors

**Solutions**:
1. Verify MongoDB connection string
2. Check Node.js version compatibility
3. Ensure sufficient disk space
4. Review error logs for specific issues

## Security Considerations

### Access Control
- Only administrators can trigger cleanup
- API endpoints require admin authentication
- Cleanup script should run with appropriate permissions

### Data Protection
- Grace period prevents accidental data loss
- Orphaned files can be recovered within grace period
- Cleanup operations are logged for audit trail

### File Validation
- Files are validated before upload
- Orphaned status is tracked in database
- Physical and database cleanup are synchronized

## API Reference

### POST /api/admin/training/files/cleanup

Trigger orphaned file cleanup.

**Request:**
```json
{
  "olderThanDays": 7  // Optional, defaults to 7
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deletedCount": 5,
    "olderThanDays": 7,
    "duration": 1234,
    "message": "Successfully cleaned up 5 orphaned file(s)"
  }
}
```

### GET /api/admin/training/files/cleanup

View orphaned files without deleting them.

**Query Parameters:**
- `olderThanDays` (optional): Number of days, defaults to 7

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5,
    "totalSize": 5242880,
    "totalSizeMB": "5.00",
    "olderThanDays": 7,
    "files": [...]
  }
}
```

## Related Documentation

- [Training Document Upload and Download Fix](../specs/training-document-upload-fix/design.md)
- [File Manager Service](../src/lib/file-manager.ts)
- [FileStorage Model](../src/models/FileStorage.ts)
