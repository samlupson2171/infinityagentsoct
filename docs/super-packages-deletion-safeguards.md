# Super Packages Deletion Safeguards

## Overview

The Super Packages system implements comprehensive deletion safeguards to protect data integrity when packages are linked to existing quotes. This document describes the deletion behavior, safeguards, and admin workflows.

## Deletion Types

### Hard Delete (Permanent Deletion)

**When it occurs:**
- Package has NO linked quotes
- Package data is permanently removed from the database
- Cannot be recovered

**Use case:**
- Removing test packages
- Cleaning up unused packages
- Correcting mistakes before quotes are created

### Soft Delete (Marked as Deleted)

**When it occurs:**
- Package has one or more linked quotes
- Package status is changed to 'deleted'
- Package data is retained in the database
- Package is hidden from selection lists

**Use case:**
- Retiring packages that are no longer offered
- Maintaining data integrity for existing quotes
- Preserving historical quote information

## Deletion Workflow

### 1. Pre-Deletion Check

When an admin clicks "Delete" on a package, the system:

1. Calls `/api/admin/super-packages/[id]/check-deletion`
2. Retrieves:
   - Total count of linked quotes
   - Sample of linked quotes (up to 10)
   - Quote status breakdown (draft, sent, accepted, etc.)
   - Package information

### 2. Confirmation Dialog

The system displays a detailed confirmation dialog with:

**For packages WITH linked quotes:**
- Warning that soft-delete will be performed
- Total number of linked quotes
- Quote status breakdown
- Sample of linked quotes (quote number, customer name, status)
- Explanation that existing quotes will continue to work

**For packages WITHOUT linked quotes:**
- Confirmation that permanent deletion will occur
- Warning that action cannot be undone

### 3. Deletion Execution

After confirmation:

**Hard Delete:**
```typescript
DELETE /api/admin/super-packages/[id]
// Returns:
{
  message: 'Package permanently deleted',
  softDelete: false,
  linkedQuotesCount: 0
}
```

**Soft Delete:**
```typescript
DELETE /api/admin/super-packages/[id]
// Returns:
{
  message: 'Package marked as deleted. X quote(s) are linked to this package.',
  softDelete: true,
  linkedQuotesCount: X,
  linkedQuotes: [...],
  package: { ...updated package with status: 'deleted' }
}
```

## Viewing Deleted Packages

### Admin-Only Access

Deleted packages can be viewed by admins using the status filter:

1. Navigate to Super Packages list
2. Select "Deleted Only" from the Status filter
3. View all soft-deleted packages

### Visual Indicators

Deleted packages are displayed with:
- Red background tint (`bg-red-50`)
- Reduced opacity (`opacity-60`)
- "(DELETED)" label next to package name
- Disabled action buttons

### Warning Banner

When viewing deleted packages, a warning banner displays:
- Explanation of soft-delete behavior
- Note that packages are hidden from selection
- Clarification that data is retained for quote integrity

## Restrictions on Deleted Packages

Deleted packages have the following restrictions:

### Cannot Edit
- Edit button is disabled
- Tooltip: "Cannot edit deleted package"
- Prevents accidental modifications

### Cannot Delete Again
- Delete button shows "Deleted" and is disabled
- Tooltip: "Package already deleted"

### Cannot Change Status
- Status toggle is disabled
- Tooltip: "Cannot change status of deleted package"
- Cannot reactivate deleted packages

### Cannot Select for Quotes
- Deleted packages do not appear in package selection lists
- Existing quotes retain their linked package data

## API Endpoints

### Check Deletion Status

```typescript
GET /api/admin/super-packages/[id]/check-deletion

Response:
{
  canHardDelete: boolean,
  linkedQuotesCount: number,
  linkedQuotes: Array<{
    quoteNumber: string,
    destination: string,
    customerName: string,
    createdAt: Date,
    status: string
  }>,
  statusBreakdown: {
    [status: string]: number
  },
  package: {
    _id: string,
    name: string,
    destination: string,
    resort: string,
    status: string
  }
}
```

### Delete Package

```typescript
DELETE /api/admin/super-packages/[id]

Response (Hard Delete):
{
  message: string,
  softDelete: false,
  linkedQuotesCount: 0
}

Response (Soft Delete):
{
  message: string,
  softDelete: true,
  linkedQuotesCount: number,
  linkedQuotes: Array<{...}>,
  package: {...}
}
```

## Database Schema

### Package Status Field

```typescript
status: {
  type: String,
  enum: ['active', 'inactive', 'deleted'],
  default: 'active',
  index: true
}
```

### Quote Package Reference

```typescript
linkedPackage: {
  packageId: ObjectId,
  packageName: string,
  packageVersion: number,
  // ... other fields
}
```

## Best Practices

### For Administrators

1. **Before Deleting:**
   - Review the linked quotes count
   - Check quote statuses (sent quotes may need customer notification)
   - Consider deactivating instead of deleting if package might be reused

2. **After Soft-Delete:**
   - Quotes continue to function normally
   - Package data is preserved
   - No customer impact

3. **Viewing Deleted Packages:**
   - Use "Deleted Only" filter to audit deleted packages
   - Review periodically to understand package lifecycle
   - Cannot restore deleted packages (by design)

### For Developers

1. **Query Considerations:**
   - Default queries should exclude deleted packages
   - Use `status: { $ne: 'deleted' }` or `status: 'active'`
   - Only show deleted packages when explicitly requested

2. **Data Integrity:**
   - Never hard-delete packages with linked quotes
   - Maintain package version history
   - Preserve all package data for quote references

3. **Testing:**
   - Test both hard and soft delete scenarios
   - Verify quote integrity after soft-delete
   - Ensure deleted packages don't appear in selection lists

## Error Handling

### Common Errors

**Invalid Package ID:**
```json
{
  "error": "Invalid package ID",
  "status": 400
}
```

**Package Not Found:**
```json
{
  "error": "Package not found",
  "status": 404
}
```

**Unauthorized:**
```json
{
  "error": "Unauthorized",
  "status": 401
}
```

**Database Error:**
```json
{
  "error": "Failed to delete super package",
  "status": 500
}
```

## Security Considerations

### Authorization

- Only admins can delete packages
- Session validation on every request
- User ID logged for audit trail

### Data Protection

- Soft-delete prevents accidental data loss
- Quote integrity maintained
- Package history preserved

### Audit Trail

- Deletion actions logged
- User who deleted package recorded
- Timestamp of deletion captured

## Future Enhancements

Potential improvements to consider:

1. **Restore Functionality:**
   - Allow admins to restore soft-deleted packages
   - Change status from 'deleted' back to 'inactive'

2. **Bulk Operations:**
   - Delete multiple packages at once
   - Bulk status changes

3. **Deletion Scheduling:**
   - Schedule package deletion for future date
   - Automatic cleanup of old deleted packages

4. **Enhanced Reporting:**
   - Deletion history report
   - Impact analysis before deletion
   - Package usage statistics

## Related Documentation

- [Super Packages Implementation Summary](./super-packages-implementation-summary.md)
- [Super Packages Version History](./super-packages-version-history.md)
- [Super Packages Statistics Guide](./super-packages-statistics-guide.md)
