# Migration 010: Add Events to Quotes

## Overview

This migration adds support for selecting events in quotes, replacing the simple `activitiesIncluded` text field with a structured `selectedEvents` array.

## What This Migration Does

### 1. Schema Changes

- **Adds `selectedEvents` field**: An array of event objects containing:
  - `eventId`: Reference to the Event document
  - `eventName`: Name of the event (denormalized for performance)
  - `eventPrice`: Price of the event at the time of selection
  - `eventCurrency`: Currency of the event price
  - `addedAt`: Timestamp when the event was added

### 2. Data Migration

- **Migrates existing data**: Adds empty `selectedEvents` array to all existing quotes
- **Preserves `activitiesIncluded`**: Optionally migrates the old `activitiesIncluded` text field to `internalNotes` with a `[Migrated Activities]:` prefix
- **Maintains backward compatibility**: The `activitiesIncluded` field is kept for reference but deprecated

### 3. Index Creation

- **Performance optimization**: Creates a sparse index on `selectedEvents.eventId` for efficient event lookups
- **Query optimization**: Enables fast filtering and aggregation of quotes by selected events

### 4. Validator Updates

- **Price history reasons**: Updates the collection validator to include new price history reasons:
  - `event_added`: When an event is added to a quote
  - `event_removed`: When an event is removed from a quote

## Requirements Addressed

- **Requirement 5.1**: Store event IDs, names, and prices in the quote document
- **Requirement 5.2**: Persist all selected events to the database when saving a quote
- **Requirement 5.3**: Handle cases where a previously selected event has been deleted or deactivated

## Running the Migration

### Prerequisites

1. Ensure MongoDB connection is configured in `.env.local`
2. Ensure the Events collection exists (migration 009 must be run first)
3. Backup your database before running the migration

### Execute Migration

```bash
node scripts/run-quote-events-migration.js
```

### Verify Migration

```bash
node scripts/verify-quote-events-migration.js
```

### Rollback (if needed)

```bash
node scripts/rollback-quote-events-migration.js
```

## Verification Checklist

After running the migration, verify:

- [ ] All quotes have the `selectedEvents` field
- [ ] `selectedEvents` is an array (can be empty)
- [ ] Index `selected_events_event_id_idx` exists
- [ ] Old `activitiesIncluded` data is preserved in `internalNotes`
- [ ] No data loss occurred
- [ ] Collection validator includes new price history reasons

## Rollback Behavior

The rollback will:

1. Remove the `selectedEvents` field from all quotes
2. Attempt to restore `activitiesIncluded` from `internalNotes` (best effort)
3. Drop the `selected_events_event_id_idx` index
4. Revert the collection validator changes

**Note**: Rollback is a best-effort operation. If quotes have been created with events after the migration, that data will be lost during rollback.

## Impact on Existing Code

### Before Migration

```typescript
// Old way - text field
const quote = {
  activitiesIncluded: "Boat Party, Club Entry, Beach Club"
};
```

### After Migration

```typescript
// New way - structured events
const quote = {
  selectedEvents: [
    {
      eventId: ObjectId("..."),
      eventName: "Boat Party",
      eventPrice: 50,
      eventCurrency: "GBP",
      addedAt: new Date()
    },
    {
      eventId: ObjectId("..."),
      eventName: "Club Entry",
      eventPrice: 25,
      eventCurrency: "GBP",
      addedAt: new Date()
    }
  ]
};
```

## Database Schema

### Quote Document Structure (After Migration)

```typescript
{
  _id: ObjectId,
  enquiryId: ObjectId,
  leadName: string,
  // ... other fields ...
  
  // Deprecated field (kept for backward compatibility)
  activitiesIncluded: string,
  
  // New structured events field
  selectedEvents: [
    {
      eventId: ObjectId,
      eventName: string,
      eventPrice: number,
      eventCurrency: "GBP" | "EUR" | "USD",
      addedAt: Date
    }
  ],
  
  // Price history with new reasons
  priceHistory: [
    {
      price: number,
      reason: "package_selection" | "recalculation" | "manual_override" | "event_added" | "event_removed",
      timestamp: Date,
      userId: ObjectId
    }
  ]
}
```

## Index Structure

```javascript
{
  "selectedEvents.eventId": 1
}
// Options: { sparse: true, name: "selected_events_event_id_idx" }
```

## Testing

After migration, test the following scenarios:

1. **Create new quote with events**: Verify events are saved correctly
2. **Edit existing quote**: Verify old quotes can be loaded and edited
3. **Add events to existing quote**: Verify events can be added to migrated quotes
4. **Remove events from quote**: Verify events can be removed
5. **View quote with deleted event**: Verify graceful handling of missing events
6. **Price calculation**: Verify event prices are included in total

## Troubleshooting

### Migration Fails

1. Check MongoDB connection
2. Verify migration 009 (Events) has been run
3. Check database permissions
4. Review error logs

### Verification Fails

1. Re-run the migration
2. Check for partial migration state
3. Manually inspect database
4. Consider rollback and retry

### Data Issues

1. Check `internalNotes` for migrated activities
2. Verify `selectedEvents` array structure
3. Check index creation
4. Review collection validator

## Related Migrations

- **Migration 007**: Creates quotes collection
- **Migration 009**: Creates events and categories collections
- **Migration 010**: This migration (adds events to quotes)

## Next Steps

After successful migration:

1. Update QuoteForm component to use event selection
2. Update QuoteManager to display selected events
3. Update email templates to include events
4. Update API routes to handle selectedEvents
5. Update validation schemas

## Support

For issues or questions:

1. Check the verification script output
2. Review the migration logs
3. Inspect the database manually
4. Consult the design document at `.kiro/specs/quote-events-integration/design.md`
