# Task 9 Implementation Summary: Update Quote API Routes to Handle Events

## Overview
Successfully implemented comprehensive event handling in the Quote API routes, including validation, population, and graceful error handling.

## Implementation Details

### 1. POST Route (`/api/admin/quotes/route.ts`)

#### Changes Made:
- **Event Validation**: Added validation to check if selected events exist and are active before creating a quote
- **Event Data Conversion**: Properly converts `addedAt` dates from ISO strings to Date objects
- **Error Handling**: Returns detailed error messages when events are not available

#### Key Features:
```typescript
// Validates events exist and are active
const Event = (await import('@/models/Event')).default;
const eventIds = quoteData.selectedEvents.map((e) => e.eventId);
const events = await Event.find({
  _id: { $in: eventIds },
  isActive: true,
});

// Returns error if events are missing or inactive
if (missingEvents.length > 0) {
  return NextResponse.json({
    success: false,
    error: {
      code: 'INVALID_EVENTS',
      message: 'Some selected events are not available',
      details: missingEvents
    }
  }, { status: 400 });
}
```

### 2. GET Route (`/api/admin/quotes/route.ts`)

#### Changes Made:
- **Event Population**: Added population of event details when fetching quotes list
- **Performance**: Uses sparse index on `selectedEvents.eventId` for efficient queries

#### Key Features:
```typescript
Quote.find(query)
  .populate('enquiryId', 'leadName agentEmail resort')
  .populate('createdBy', 'name email')
  .populate('selectedEvents.eventId', 'name isActive pricing')
  .sort({ createdAt: -1 })
```

### 3. GET [id] Route (`/api/admin/quotes/[id]/route.ts`)

#### Changes Made:
- **Detailed Event Population**: Populates full event details including destinations
- **Active Status Check**: Includes `isActive` field to identify inactive events

#### Key Features:
```typescript
const quote = await Quote.findById(params.id).populate([
  { path: 'enquiryId', select: 'leadName agentEmail resort departureDate' },
  { path: 'createdBy', select: 'name email' },
  { path: 'selectedEvents.eventId', select: 'name isActive pricing destinations' },
]);
```

### 4. PUT Route (`/api/admin/quotes/[id]/route.ts`)

#### Changes Made:
- **Event Validation**: Validates events exist when updating selectedEvents
- **Inactive Event Warnings**: Provides warnings when events are inactive
- **Price Change Detection**: Detects and warns when event prices have changed
- **Price History Tracking**: Automatically tracks event additions/removals in price history
- **Date Conversion**: Properly handles date conversions for selectedEvents

#### Key Features:

**Event Validation:**
```typescript
if (updateData.selectedEvents !== undefined) {
  const Event = (await import('@/models/Event')).default;
  const eventIds = updateData.selectedEvents.map((e) => e.eventId);
  const events = await Event.find({ _id: { $in: eventIds } });
  
  // Check for missing events
  const missingEvents = updateData.selectedEvents.filter(
    (e) => !foundEventIds.includes(e.eventId)
  );
  
  // Check for inactive events
  const inactiveEvents = events.filter((e) => !e.isActive);
  if (inactiveEvents.length > 0) {
    warnings.push(`Warning: ${inactiveEvents.length} event(s) are currently inactive`);
  }
}
```

**Price Change Detection:**
```typescript
const eventPriceChanges = updateData.selectedEvents
  .map((selectedEvent) => {
    const event = events.find((e) => e._id.toString() === selectedEvent.eventId);
    if (event && event.pricing?.estimatedCost !== selectedEvent.eventPrice) {
      return {
        eventName: selectedEvent.eventName,
        storedPrice: selectedEvent.eventPrice,
        currentPrice: event.pricing.estimatedCost,
      };
    }
    return null;
  })
  .filter((change) => change !== null);
```

**Price History Tracking:**
```typescript
// Determine reason based on event changes
if (updateData.selectedEvents !== undefined) {
  const oldEventCount = quote.selectedEvents?.length || 0;
  const newEventCount = updateData.selectedEvents?.length || 0;
  
  if (newEventCount > oldEventCount) {
    reason = 'event_added';
  } else if (newEventCount < oldEventCount) {
    reason = 'event_removed';
  }
}

quote.priceHistory.push({
  price: updateData.totalPrice,
  reason,
  timestamp: new Date(),
  userId: user.id,
});
```

**Warning Response:**
```typescript
const response: any = {
  success: true,
  data: quote,
};

if (warnings && warnings.length > 0) {
  response.warnings = warnings;
}

return NextResponse.json(response);
```

### 5. Validation Schema Updates (`src/lib/validation/quote-validation.ts`)

#### Changes Made:
- **Price History Reasons**: Added `'event_added'` and `'event_removed'` to price history reason enum
- **Consistent Validation**: Updated both `quoteFormValidationSchema` and `quoteUpdateValidationSchema`

#### Key Features:
```typescript
reason: z.enum([
  'package_selection',
  'recalculation',
  'manual_override',
  'event_added',
  'event_removed'
])
```

## Validation Rules

### Event Validation:
1. **Existence Check**: All event IDs must reference existing events in the database
2. **Active Status**: Only active events can be added to new quotes
3. **Inactive Warning**: Warnings are provided when updating quotes with inactive events
4. **Maximum Events**: Limited to 20 events per quote (defined in validation schema)

### Price Validation:
1. **Non-negative Prices**: Event prices must be >= 0
2. **Currency Matching**: Event currency must match quote currency
3. **Price History**: All price changes are tracked with appropriate reasons

### Data Integrity:
1. **Date Conversion**: All date strings are properly converted to Date objects
2. **ObjectId Validation**: Event IDs are validated as proper MongoDB ObjectIds
3. **Referential Integrity**: Events are validated to exist before saving

## Error Handling

### Error Codes:
- `INVALID_EVENTS`: When selected events don't exist or are inactive (POST)
- `INVALID_EVENTS`: When updated events don't exist (PUT)
- `VALIDATION_ERROR`: When event data fails schema validation

### Warning Messages:
- Inactive events warning with count and names
- Price change warnings with old and new prices
- Graceful degradation when events are deleted

## Performance Optimizations

### Database Indexes:
- Index on `selectedEvents.eventId` for efficient event lookups
- Sparse index to optimize queries on quotes without events

### Query Optimization:
- Batch event validation using `$in` operator
- Selective field population to reduce data transfer
- Efficient event existence checks

## Testing Verification

All 12 verification checks passed:
1. ✓ POST route validates and saves selectedEvents
2. ✓ POST route validates event existence and active status
3. ✓ GET route populates event details
4. ✓ PUT route handles selectedEvents updates
5. ✓ PUT route validates events during update
6. ✓ PUT route provides warnings for inactive events
7. ✓ PUT route detects and warns about event price changes
8. ✓ GET [id] route populates event details
9. ✓ Price history tracks event additions and removals
10. ✓ Validation schema includes event-related price history reasons
11. ✓ Quote model includes selectedEvents field
12. ✓ Quote model has index on selectedEvents.eventId

## API Response Examples

### Successful Quote Creation with Events:
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "selectedEvents": [
      {
        "eventId": "...",
        "eventName": "Jet Skiing",
        "eventPrice": 50,
        "eventCurrency": "GBP",
        "addedAt": "2025-01-15T10:00:00Z"
      }
    ],
    "totalPrice": 550
  }
}
```

### Error Response - Invalid Events:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_EVENTS",
    "message": "Some selected events are not available",
    "details": [
      {
        "eventId": "...",
        "eventName": "Deleted Event"
      }
    ]
  }
}
```

### Update Response with Warnings:
```json
{
  "success": true,
  "data": { ... },
  "warnings": [
    "Warning: 1 event(s) are currently inactive: Parasailing",
    "Note: 1 event(s) have different current prices than stored prices"
  ]
}
```

## Requirements Coverage

### Requirement 3.4 ✓
- Quotes load and display previously selected events
- Event details are populated from the database

### Requirement 3.5 ✓
- Selected events are persisted when saving quotes
- Event data includes IDs, names, prices, and timestamps

### Requirement 5.2 ✓
- All selected events are saved to the database
- Event data is properly structured and validated

### Requirement 5.3 ✓
- Deleted/deactivated events are handled gracefully
- Warnings are provided for inactive events
- Price changes are detected and reported

### Requirement 5.4 ✓
- Event price history is maintained
- Price changes are tracked with appropriate reasons
- Audit trail includes event additions/removals

## Files Modified

1. `src/app/api/admin/quotes/route.ts`
   - Added event validation in POST handler
   - Added event population in GET handler

2. `src/app/api/admin/quotes/[id]/route.ts`
   - Added event validation in PUT handler
   - Added inactive event warnings
   - Added price change detection
   - Added event population in GET handler
   - Enhanced price history tracking

3. `src/lib/validation/quote-validation.ts`
   - Added `event_added` and `event_removed` to price history reasons
   - Updated both form and update validation schemas

## Next Steps

1. **Frontend Integration**: Update QuoteForm and QuoteManager to handle warnings
2. **Email Templates**: Update quote email templates to display selected events
3. **Testing**: Create integration tests for event validation and price tracking
4. **Documentation**: Update API documentation with event handling details

## Notes

- Event validation is performed at the API level, not the model level
- Inactive events generate warnings but don't block updates (for backward compatibility)
- Price changes are detected but stored prices are preserved (historical accuracy)
- All date conversions are handled properly to avoid timezone issues
- Warnings are returned in the response but don't affect success status
