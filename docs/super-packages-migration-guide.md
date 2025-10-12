# Super Packages Migration Guide

## Overview

This guide covers the database migration for the Super Offer Packages feature (Migration 008). This migration creates the necessary collections and indexes to support the super packages functionality.

## What This Migration Does

The migration performs the following operations:

1. **Creates `super_offer_packages` collection** with schema validation
   - Validates required fields (name, destination, resort, currency, etc.)
   - Enforces data types and constraints
   - Ensures pricing matrix structure integrity

2. **Creates indexes on `super_offer_packages`** for performance
   - `status_destination_idx`: Compound index for filtering by status and destination
   - `created_at_desc_idx`: Index for sorting by creation date
   - `name_destination_text_idx`: Text index for search functionality
   - `name_idx`: Index for name lookups
   - `resort_idx`: Index for resort filtering

3. **Creates `super_offer_package_history` collection** for version tracking
   - Stores historical versions of packages
   - Tracks changes over time
   - Includes indexes for efficient version queries

4. **Adds `linkedPackage` index to `quotes` collection**
   - Sparse index on `linkedPackage.packageId`
   - Enables efficient queries for quotes linked to packages
   - Only indexes documents that have a linkedPackage field

## Running the Migration

### Prerequisites

- MongoDB connection configured in `.env.local`
- Database accessible and running
- No existing super packages data (or willingness to lose it during rollback)

### Commands

#### Run the Migration

```bash
npm run migrate:super-packages
```

This will:
- Check if migration has already been applied
- Create collections and indexes
- Record the migration in the database
- Verify all operations completed successfully

#### Verify Migration Status

```bash
npm run migrate:super-packages:verify
```

This will:
- Check migration status
- List all collections and document counts
- Verify all indexes exist
- Display sample data (if any)
- Provide a summary of the migration state

#### Rollback the Migration

```bash
npm run migrate:super-packages:rollback
```

This will:
- Check for existing data and warn if found
- Prompt for confirmation
- Drop all created collections and indexes
- Remove the migration record

**⚠️ WARNING**: Rollback will permanently delete all super package data!

## Migration Details

### Collections Created

#### super_offer_packages

Main collection for storing super offer packages.

**Schema Validation**:
- `name` (string, required): Package name
- `destination` (string, required): Destination name
- `resort` (string, required): Resort name
- `currency` (enum, required): EUR, GBP, or USD
- `groupSizeTiers` (array, required): Group size tier definitions
- `durationOptions` (array, required): Available duration options
- `pricingMatrix` (array, required): Pricing data by period and tier
- `status` (enum, required): active, inactive, or deleted
- `version` (int, required): Version number (minimum 1)
- `createdBy` (ObjectId, required): User who created the package
- `lastModifiedBy` (ObjectId, required): User who last modified the package

**Indexes**:
1. `status_destination_idx`: `{ status: 1, destination: 1 }`
2. `created_at_desc_idx`: `{ createdAt: -1 }`
3. `name_destination_text_idx`: Text index on name and destination
4. `name_idx`: `{ name: 1 }`
5. `resort_idx`: `{ resort: 1 }`

#### super_offer_package_history

Collection for storing package version history.

**Indexes**:
1. `package_version_idx`: `{ packageId: 1, version: -1 }`
2. `modified_at_desc_idx`: `{ modifiedAt: -1 }`

### Indexes Added to Existing Collections

#### quotes

**New Index**:
- `linked_package_id_idx`: `{ 'linkedPackage.packageId': 1 }` (sparse)
  - Sparse index only indexes documents with linkedPackage field
  - Enables efficient queries for quotes linked to specific packages

## Verification Steps

After running the migration, verify the following:

### 1. Check Collections Exist

```javascript
// In MongoDB shell or Compass
db.getCollectionNames()
// Should include: super_offer_packages, super_offer_package_history
```

### 2. Verify Indexes

```javascript
// Check super_offer_packages indexes
db.super_offer_packages.getIndexes()

// Check super_offer_package_history indexes
db.super_offer_package_history.getIndexes()

// Check quotes linkedPackage index
db.quotes.getIndexes()
```

### 3. Test Package Creation

Try creating a super package through the admin interface:
1. Navigate to `/admin/super-packages`
2. Click "Create New Package"
3. Fill in the form and save
4. Verify the package appears in the list

### 4. Test Quote Linking

Try linking a package to a quote:
1. Navigate to `/admin/quotes`
2. Create or edit a quote
3. Click "Select Super Package"
4. Select a package and configure parameters
5. Verify the quote is populated with package data

## Troubleshooting

### Migration Already Applied

If you see:
```
⚠️  Migration 008 has already been applied
```

The migration has already run. To re-run it:
1. First rollback: `npm run migrate:super-packages:rollback`
2. Then run again: `npm run migrate:super-packages`

### Connection Errors

If you see connection errors:
1. Check `MONGODB_URI` in `.env.local`
2. Verify MongoDB is running
3. Check network connectivity
4. Verify credentials are correct

### Index Creation Errors

If indexes fail to create:
1. Check for existing indexes with conflicting names
2. Verify sufficient permissions
3. Check MongoDB version compatibility (requires MongoDB 4.0+)

### Validation Errors

If you encounter validation errors when creating packages:
1. Check the schema requirements in the migration
2. Ensure all required fields are provided
3. Verify data types match the schema
4. Check that enums have valid values

## Rollback Considerations

### When to Rollback

Rollback the migration if:
- You need to modify the schema structure
- There are issues with the migration
- You need to test the migration process
- You're switching to a different database

### Data Loss Warning

**⚠️ IMPORTANT**: Rolling back will permanently delete:
- All super offer packages
- All package version history
- The linkedPackage index on quotes (but not the quote data itself)

Quotes that reference packages will retain their data, but the index for efficient lookups will be removed.

### Before Rolling Back

1. Export any important package data
2. Document any packages you want to recreate
3. Notify users that packages will be unavailable
4. Confirm no critical quotes depend on package references

## Migration Scripts

### run-super-packages-migration.js

Main migration script that:
- Creates collections with validation
- Creates all indexes
- Records migration status
- Verifies successful completion

### rollback-super-packages-migration.js

Rollback script that:
- Checks for existing data
- Prompts for confirmation
- Drops collections and indexes
- Removes migration record

### verify-super-packages-migration.js

Verification script that:
- Checks migration status
- Lists collections and counts
- Verifies all indexes
- Displays sample data
- Provides summary report

## Next Steps

After successfully running the migration:

1. **Test the Admin Interface**
   - Create a test super package
   - Edit and update the package
   - Test status changes (active/inactive)
   - Test package deletion

2. **Test Quote Integration**
   - Link a package to a quote
   - Verify price calculation
   - Test quote email generation
   - Verify package reference in quote details

3. **Test CSV Import**
   - Import a package from CSV
   - Verify pricing matrix parsing
   - Check inclusions extraction
   - Confirm package creation

4. **Monitor Performance**
   - Check query performance on package list
   - Verify search functionality speed
   - Monitor index usage
   - Check for slow queries

5. **Backup Strategy**
   - Set up regular backups of super_offer_packages
   - Include version history in backups
   - Test restore procedures
   - Document backup schedule

## Support

If you encounter issues:

1. Run verification: `npm run migrate:super-packages:verify`
2. Check MongoDB logs for errors
3. Review the migration script output
4. Check the troubleshooting section above
5. Contact the development team with:
   - Error messages
   - Migration status output
   - MongoDB version
   - Environment details

## Related Documentation

- [Super Packages Requirements](../.kiro/specs/super-offer-packages/requirements.md)
- [Super Packages Design](../.kiro/specs/super-offer-packages/design.md)
- [Super Packages Implementation Summary](./super-packages-implementation-summary.md)
- [Super Packages Version History](./super-packages-version-history.md)
- [Super Packages Statistics Guide](./super-packages-statistics-guide.md)
