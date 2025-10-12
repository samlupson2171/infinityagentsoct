# Super Packages Version History

## Overview

The Super Packages Version History feature provides comprehensive tracking of all changes made to super offer packages. This enables administrators to:

- View the complete history of package modifications
- See who made changes and when
- Compare different versions
- Maintain an audit trail for compliance
- Understand the evolution of package offerings

## Features

### 1. Automatic Version Tracking

Every time a super package is updated:
- The current version is saved to history before applying changes
- Version number is automatically incremented
- Changed fields are detected and recorded
- Modifier information (user ID, timestamp) is captured

### 2. Version History Display

Administrators can view version history for any package:
- Click the "History" button in the package list
- See all versions in reverse chronological order
- View version number, modifier, timestamp, and change description
- See which fields were changed in each version

### 3. Change Descriptions

When editing a package, administrators can optionally provide a change description:
- Appears in a blue-highlighted section at the bottom of the edit form
- Helps document the reason for changes
- Improves audit trail clarity
- Recommended but not required

### 4. Audit Trail

The system provides a comprehensive audit trail showing:
- Total number of versions
- Number of unique contributors
- First creation date
- Last modification date
- Recent changes summary

### 5. Version Comparison

Compare any two versions to see:
- Which fields changed
- Old and new values
- Type of change (added, removed, modified)

## API Endpoints

### Get Version History
```
GET /api/admin/super-packages/{id}/version-history?limit=50
```

Returns a list of all versions for a package.

### Get Specific Version
```
GET /api/admin/super-packages/{id}/versions/{version}
```

Returns the complete data for a specific version.

### Compare Versions
```
GET /api/admin/super-packages/{id}/compare-versions?version1=1&version2=2
```

Returns a detailed comparison between two versions.

### Get Audit Trail
```
GET /api/admin/super-packages/{id}/audit-trail
```

Returns a summary of the package's change history.

## Database Schema

### super_offer_package_history Collection

Stores historical snapshots of packages:

```typescript
{
  packageId: ObjectId,           // Reference to the package
  version: Number,               // Version number
  
  // Complete snapshot of package data
  name: String,
  destination: String,
  resort: String,
  currency: String,
  groupSizeTiers: Array,
  durationOptions: Array,
  pricingMatrix: Array,
  inclusions: Array,
  accommodationExamples: Array,
  salesNotes: String,
  status: String,
  
  // Change metadata
  modifiedBy: ObjectId,          // User who made the change
  modifiedAt: Date,              // When the change was made
  changeDescription: String,     // Optional description
  changedFields: [String]        // List of fields that changed
}
```

### Indexes

- `{ packageId: 1, version: -1 }` - For efficient version queries
- `{ modifiedAt: -1 }` - For chronological sorting

## Usage Examples

### Viewing Version History

1. Navigate to Super Packages list
2. Find the package you want to review
3. Click the "History" button
4. View the version history modal with:
   - Audit trail summary at the top
   - List of all versions below
   - Click "View Details" on any version to see full data

### Adding Change Descriptions

1. Edit a super package
2. Make your changes
3. Scroll to the "Change Description" section (blue box)
4. Enter a description like:
   - "Updated pricing for summer 2025 season"
   - "Added new inclusions based on supplier update"
   - "Fixed pricing matrix error for 12+ people tier"
5. Save the package

### Comparing Versions

Use the API endpoint to compare versions programmatically:

```javascript
const response = await fetch(
  `/api/admin/super-packages/${packageId}/compare-versions?version1=1&version2=2`
);
const { changes } = await response.json();

changes.forEach(change => {
  console.log(`${change.field}: ${change.oldValue} → ${change.newValue}`);
});
```

## Best Practices

1. **Always Add Change Descriptions**: While optional, change descriptions make the audit trail much more useful

2. **Review History Before Major Changes**: Check the version history to understand previous changes before making significant updates

3. **Use Descriptive Change Messages**: Be specific about what changed and why
   - Good: "Updated January pricing from €100 to €120 due to supplier increase"
   - Bad: "Changed prices"

4. **Regular Audits**: Periodically review the audit trail to ensure changes are being tracked properly

5. **Version Comparison**: Use version comparison when investigating pricing discrepancies or reverting changes

## Technical Implementation

### Version Saving Process

1. When a package is updated via PUT endpoint:
   - Current package state is saved to history collection
   - Changed fields are detected by comparing with previous version
   - Version number is incremented
   - lastModifiedBy is updated

2. The service automatically:
   - Creates a complete snapshot of the package
   - Detects which fields changed
   - Stores metadata about the change

### Change Detection

The system compares the following fields:
- Basic info: name, destination, resort, currency, status
- Complex data: groupSizeTiers, durationOptions, pricingMatrix
- Details: inclusions, accommodationExamples, salesNotes

Changes are detected using JSON serialization comparison.

## Troubleshooting

### History Not Showing

- Ensure the package has been edited at least once
- Check that the migration has been run to create the history collection
- Verify the user has admin permissions

### Missing Change Descriptions

- Change descriptions are optional
- Only available when editing (not on initial creation)
- Older versions may not have descriptions if they were created before this feature

### Performance Considerations

- History queries are limited to 50 versions by default
- Indexes ensure fast retrieval
- Version data is stored as snapshots (not diffs) for simplicity

## Future Enhancements

Potential improvements for future versions:

1. **Version Rollback**: Allow reverting to a previous version
2. **Diff Visualization**: Show side-by-side comparison in UI
3. **Export History**: Download version history as CSV/PDF
4. **Notifications**: Alert when packages are modified
5. **Approval Workflow**: Require approval for certain changes
