# Migration 009: Events and Categories Collections

## Overview

This migration creates the Events and Categories collections for the Enquiry Events Management System. It replaces the hardcoded event list in the enquiry form with a dynamic, database-driven solution.

## What This Migration Does

### 1. Creates Category Collection
- Seeds 5 predefined system categories:
  - **Day** - Daytime activities and events
  - **Night** - Nighttime activities and events
  - **Adult** - Adult-oriented activities
  - **Stag** - Stag party activities
  - **Hen** - Hen party activities

### 2. Creates Event Collection
- Migrates 100+ hardcoded events to the database
- Each event includes:
  - Name
  - Description
  - Categories (multiple allowed)
  - Destinations (available in all by default)
  - Active status
  - Display order
  - Metadata (creator, timestamps)

### 3. Updates Enquiry Model
- Changes `eventsRequested` field from `string[]` to `ObjectId[]`
- Updates existing enquiries to reference event IDs instead of names
- Maintains data integrity during migration

## Running the Migration

### Prerequisites
- MongoDB connection configured in `.env.local`
- At least one admin user in the database

### Execute Migration

```bash
node scripts/run-events-migration.js
```

### Verify Migration

```bash
node scripts/verify-events-migration.js
```

### Rollback (if needed)

⚠️ **WARNING**: This will delete all events and categories data!

```bash
node scripts/rollback-events-migration.js
```

## Migration Details

### System Categories

| Name  | Slug  | Icon  | Color   | Display Order |
|-------|-------|-------|---------|---------------|
| Day   | day   | sun   | #FDB813 | 1             |
| Night | night | moon  | #1E3A8A | 2             |
| Adult | adult | users | #DC2626 | 3             |
| Stag  | stag  | male  | #2563EB | 4             |
| Hen   | hen   | female| #EC4899 | 5             |

### Sample Migrated Events

- Boat Party (Day, Night, Adult, Stag, Hen)
- Club Entry (Night, Adult, Stag, Hen)
- Bar Crawl (Night, Adult, Stag, Hen)
- Beach Club (Day, Adult, Stag, Hen)
- Water Sports (Day)
- Go Karting (Day, Stag)
- Spa Day (Day, Hen)
- ... and 90+ more events

## Database Schema

### Event Schema

```typescript
{
  name: string;                    // Unique, 2-100 chars
  description?: string;            // Optional, max 500 chars
  categories: ObjectId[];          // References Category
  destinations: string[];          // Array of destination names
  availableInAllDestinations: boolean;
  isActive: boolean;
  displayOrder: number;
  pricing?: {
    estimatedCost?: number;
    currency?: string;
  };
  metadata: {
    createdBy: ObjectId;           // References User
    updatedBy: ObjectId;           // References User
    createdAt: Date;
    updatedAt: Date;
  };
}
```

### Category Schema

```typescript
{
  name: string;                    // 2-50 chars
  slug: string;                    // Unique, lowercase
  description?: string;            // Optional, max 200 chars
  icon?: string;                   // Icon identifier
  color?: string;                  // Hex color code
  isSystem: boolean;               // True for predefined categories
  isActive: boolean;
  displayOrder: number;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
  };
}
```

## Indexes

### Event Indexes
- `{ name: 1 }` - Unique index for event names
- `{ isActive: 1, destinations: 1 }` - For filtering active events by destination
- `{ categories: 1 }` - For category-based queries
- `{ displayOrder: 1 }` - For ordered retrieval
- `{ isActive: 1, displayOrder: 1 }` - Compound index for sorted active events

### Category Indexes
- `{ slug: 1 }` - Unique index
- `{ isActive: 1, displayOrder: 1 }` - For ordered active categories
- `{ isSystem: 1 }` - For filtering system categories

## Validation Rules

### Event Validation
- Name must be unique and 2-100 characters
- At least one category required for active events
- At least one destination required unless `availableInAllDestinations` is true
- Display order cannot be negative

### Category Validation
- Slug must be unique and lowercase
- Slug can only contain letters, numbers, and hyphens
- Color must be valid hex code (e.g., #FF5733)
- System categories cannot be deleted

## Troubleshooting

### Migration Fails: "No users found in database"
**Solution**: Create at least one admin user before running the migration.

```bash
node setup-users.js
```

### Migration Fails: "Duplicate key error"
**Solution**: The migration is idempotent. If events or categories already exist, they will be skipped. This is expected behavior.

### Enquiries Not Updated
**Solution**: Check that enquiries have the `eventsRequested` field. Run the verification script to diagnose:

```bash
node scripts/verify-events-migration.js
```

### Rollback Fails
**Solution**: Ensure MongoDB connection is active and you have proper permissions. Check the error message for specific issues.

## Post-Migration Steps

After running this migration:

1. ✅ Verify migration completed successfully
2. ✅ Test event retrieval in admin interface
3. ✅ Test event selection in enquiry form
4. ✅ Verify existing enquiries display correctly
5. ✅ Test creating new enquiries with events

## Related Files

- **Models**: `src/models/Event.ts`, `src/models/Category.ts`
- **Migration**: `src/lib/migrations/009-create-events-collection.ts`
- **Scripts**: 
  - `scripts/run-events-migration.js`
  - `scripts/rollback-events-migration.js`
  - `scripts/verify-events-migration.js`

## Next Steps

After this migration, you can:
1. Implement the event service layer (Task 2)
2. Build admin API endpoints (Tasks 3-4)
3. Create admin management interface (Tasks 6-8)
4. Update enquiry form with event selector (Tasks 9-10)

## Support

For issues or questions about this migration, refer to:
- Design document: `.kiro/specs/enquiry-events-management/design.md`
- Requirements: `.kiro/specs/enquiry-events-management/requirements.md`
- Tasks: `.kiro/specs/enquiry-events-management/tasks.md`
