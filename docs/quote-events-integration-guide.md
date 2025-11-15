# Quote Events Integration Guide

## Overview

The Quote Events Integration feature allows administrators to add structured events to quotes, replacing the simple "Activities Included" text field with a dynamic event selection system. Events are filtered by destination and their prices automatically contribute to the quote total.

## Key Features

- **Destination-Filtered Events**: Events are automatically filtered based on the quote's destination
- **Automatic Price Calculation**: Event prices are added to the quote total automatically
- **Price Breakdown**: Clear separation between base price and event costs
- **Event Management**: Easy selection, removal, and viewing of events in quotes
- **Package Integration**: Works seamlessly with the existing super package system
- **Email Integration**: Selected events appear in quote emails with pricing details

## User Guide

### Creating a Quote with Events

1. **Navigate to Quote Creation**
   - Go to Admin Dashboard → Quotes → Create New Quote
   - Fill in basic quote information (customer details, destination, dates)

2. **Select Destination**
   - Choose a destination from the dropdown
   - The event selector will automatically filter events for that destination

3. **Add Events**
   - Click "Select Events" button
   - Browse available events filtered by your chosen destination
   - Click on events to add them to the quote
   - Selected events appear in the "Selected Events" list with prices

4. **Review Price Breakdown**
   - Base Price: Shows package price or custom base price
   - Events Total: Sum of all selected event prices
   - Total Price: Base price + events total

5. **Save Quote**
   - Click "Save Quote" to persist all information
   - Selected events are stored with the quote

### Editing Events in Existing Quotes

1. Open an existing quote in edit mode
2. The currently selected events will be displayed
3. Add new events using the event selector
4. Remove events by clicking the "Remove" button next to each event
5. Price updates automatically as you add/remove events
6. Save changes to update the quote

### Working with Packages and Events

- **Adding Events to Package-Based Quotes**: Select a package first, then add events
- **Price Calculation**: Package price + event prices = total price
- **Unlinking Packages**: Events are preserved when unlinking a package
- **Price Sync**: The system maintains synchronization between package and event prices

### Viewing Quotes with Events

In the Quote Manager:
- Event count is displayed in the quote list
- Click on a quote to view full details including all selected events
- Event names and prices are shown in the quote summary
- Missing/deleted events are indicated with warnings

## API Documentation

### Calculate Events Price

**Endpoint**: `POST /api/admin/quotes/calculate-events-price`

**Purpose**: Calculate the total price for a set of selected events

**Request Body**:
```json
{
  "eventIds": ["event_id_1", "event_id_2"],
  "numberOfPeople": 2
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "eventId": "event_id_1",
        "eventName": "Jet Skiing",
        "price": 50,
        "currency": "GBP"
      }
    ],
    "total": 100,
    "currency": "GBP"
  }
}
```

**Error Responses**:
- `400`: Invalid request (missing eventIds)
- `404`: One or more events not found
- `500`: Server error

### Create Quote with Events

**Endpoint**: `POST /api/admin/quotes`

**Request Body** (includes selectedEvents):
```json
{
  "customerName": "John Doe",
  "destination": "Benidorm",
  "selectedEvents": [
    {
      "eventId": "event_id_1",
      "eventName": "Jet Skiing",
      "eventPrice": 50,
      "eventCurrency": "GBP"
    }
  ],
  "totalPrice": 550
}
```

### Update Quote Events

**Endpoint**: `PUT /api/admin/quotes/{id}`

**Request Body**: Same structure as create, updates selectedEvents array

### Get Quote with Events

**Endpoint**: `GET /api/admin/quotes/{id}`

**Response**: Includes populated event details in selectedEvents array

## Data Model Documentation

### Quote Model - selectedEvents Field

The `selectedEvents` field is an array of event objects stored with each quote:

```typescript
interface SelectedEvent {
  eventId: mongoose.Types.ObjectId;  // Reference to Event document
  eventName: string;                  // Event name (cached)
  eventPrice: number;                 // Event price at time of selection
  eventCurrency: string;              // Currency code (GBP, EUR, USD)
  addedAt: Date;                      // Timestamp when event was added
}
```

**Field Details**:

- **eventId**: MongoDB ObjectId reference to the Event collection
- **eventName**: Cached event name for display (persists even if event is deleted)
- **eventPrice**: Price at the time of selection (preserved for historical accuracy)
- **eventCurrency**: Currency code matching the quote currency
- **addedAt**: Audit trail timestamp

**Indexes**:
- Index on `selectedEvents.eventId` for efficient event lookups
- Compound index on quote fields for filtering

**Validation Rules**:
- Maximum 20 events per quote
- Event IDs must be valid ObjectIds
- Event prices must be non-negative numbers
- Currency must match quote currency

### Backward Compatibility

The deprecated `activitiesIncluded` text field is maintained for backward compatibility:
- Existing quotes retain the field
- New quotes do not use this field
- Migration can optionally move text to internal notes

## Migration Guide

### Running the Migration

The migration adds the `selectedEvents` field to existing quotes.

**Prerequisites**:
- Database backup completed
- Development/staging environment tested
- Admin users notified of changes

**Step 1: Backup Database**
```bash
# Create backup before migration
mongodump --uri="your_mongodb_uri" --out=./backup-before-events-migration
```

**Step 2: Run Migration**
```bash
# Execute the migration script
node scripts/run-quote-events-migration.js
```

**Step 3: Verify Migration**
```bash
# Verify all quotes have the new field
node scripts/verify-quote-events-migration.js
```

**Step 4: Test in Staging**
- Create new quotes with events
- Edit existing quotes
- Verify email generation
- Test price calculations

**Step 5: Production Deployment**
- Schedule maintenance window
- Run migration on production
- Monitor for errors
- Verify functionality

### Rollback Procedure

If issues occur, rollback using:

```bash
# Rollback the migration
node scripts/rollback-quote-events-migration.js
```

This will:
- Remove the `selectedEvents` field from all quotes
- Restore the database to pre-migration state
- Preserve all other quote data

### Migration Scripts

**Location**: `src/lib/migrations/010-add-events-to-quotes.ts`

**What it does**:
1. Adds empty `selectedEvents` array to all existing quotes
2. Creates indexes on the new field
3. Optionally migrates `activitiesIncluded` text to notes
4. Validates data integrity

**Execution Time**: ~1-2 seconds per 1000 quotes

## Troubleshooting Guide

### Common Issues and Solutions

#### Issue: Events Not Appearing in Selector

**Symptoms**: Event selector is empty or missing events

**Possible Causes**:
1. No destination selected in quote
2. No events exist for the selected destination
3. All events for destination are inactive

**Solutions**:
- Ensure a destination is selected in the quote form
- Check that events exist and are active for that destination
- Verify event destination field matches quote destination
- Check browser console for API errors

#### Issue: Price Not Updating When Adding Events

**Symptoms**: Total price doesn't change when events are selected

**Possible Causes**:
1. Price calculation hook not triggered
2. Event price data missing
3. Currency mismatch between event and quote

**Solutions**:
- Refresh the page and try again
- Check browser console for JavaScript errors
- Verify event has a valid price in the database
- Ensure event currency matches quote currency
- Check network tab for failed API calls

#### Issue: "Event No Longer Available" Warning

**Symptoms**: Warning message appears for previously selected events

**Possible Causes**:
1. Event was deleted from the system
2. Event was deactivated
3. Event destination was changed

**Solutions**:
- This is expected behavior for deleted/deactivated events
- The event name and price are preserved in the quote
- Remove the event and select an alternative if needed
- Contact admin to reactivate the event if necessary

#### Issue: Events Not Appearing in Email

**Symptoms**: Quote email doesn't show selected events

**Possible Causes**:
1. Email template not updated
2. Events not saved with quote
3. Email generation error

**Solutions**:
- Verify events are saved in the quote (check in Quote Manager)
- Check email template includes event section
- Review server logs for email generation errors
- Test email preview functionality
- Ensure email service is configured correctly

#### Issue: Currency Mismatch Error

**Symptoms**: Error when selecting events with different currency

**Possible Causes**:
1. Event currency doesn't match quote currency
2. Multi-currency quote attempt

**Solutions**:
- Only select events with matching currency
- Update event currency in Event Manager
- Create separate quotes for different currencies
- Contact admin to standardize event currencies

#### Issue: Maximum Events Limit Reached

**Symptoms**: Cannot add more than 20 events to a quote

**Possible Causes**:
1. System limit of 20 events per quote reached

**Solutions**:
- This is a system limitation for performance
- Remove unnecessary events
- Consider creating multiple quotes if needed
- Contact development team if limit needs adjustment

### Debugging Steps

#### Check Event Data
```bash
# Verify event exists and is active
node -e "
const mongoose = require('mongoose');
require('./src/lib/load-models');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Event = mongoose.model('Event');
  const event = await Event.findById('EVENT_ID');
  console.log(event);
  process.exit(0);
});
"
```

#### Check Quote Data
```bash
# Verify quote has selectedEvents field
node -e "
const mongoose = require('mongoose');
require('./src/lib/load-models');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Quote = mongoose.model('Quote');
  const quote = await Quote.findById('QUOTE_ID');
  console.log(quote.selectedEvents);
  process.exit(0);
});
"
```

#### Test Price Calculation API
```bash
# Test the calculate-events-price endpoint
curl -X POST http://localhost:3000/api/admin/quotes/calculate-events-price \
  -H "Content-Type: application/json" \
  -d '{"eventIds": ["EVENT_ID_1", "EVENT_ID_2"]}'
```

#### Check Browser Console
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for errors related to events or pricing
4. Check Network tab for failed API requests

#### Review Server Logs
```bash
# Check application logs for errors
tail -f logs/application.log | grep -i event
```

## Performance Considerations

### Optimization Strategies

1. **Event Caching**: Events are cached by destination to reduce database queries
2. **Lazy Loading**: Event details loaded only when needed
3. **Debounced Updates**: Price recalculation is debounced to prevent excessive updates
4. **Indexed Queries**: Database indexes on eventId and destination fields

### Expected Performance

- Event list loading: < 200ms
- Price calculation: < 100ms
- Quote save with events: < 500ms
- Email generation: < 2 seconds

### Monitoring

Monitor these metrics:
- API response times for event endpoints
- Database query performance
- Email generation success rate
- User interaction patterns

## Security Considerations

### Validation

All event data is validated:
- Event IDs are verified to exist and be active
- Prices are validated as non-negative numbers
- Currency codes are validated against allowed values
- Maximum event limit enforced (20 per quote)

### Authorization

- Only authenticated admin users can select events
- Event prices are server-validated (not client-side)
- Price history tracks all event additions/removals
- Audit trail maintained for compliance

### Data Integrity

- Event data is cached in quotes to preserve history
- Price changes in events don't affect existing quotes
- Deleted events remain visible in historical quotes
- All changes are logged for audit purposes

## Best Practices

### For Administrators

1. **Keep Events Updated**: Regularly review and update event information
2. **Consistent Pricing**: Ensure event prices are current and accurate
3. **Clear Naming**: Use descriptive event names for easy identification
4. **Destination Mapping**: Correctly assign events to destinations
5. **Regular Audits**: Review quotes with events for accuracy

### For Developers

1. **Error Handling**: Always handle missing/deleted events gracefully
2. **Price Validation**: Validate prices on both client and server
3. **Currency Consistency**: Ensure currency matching throughout
4. **Performance**: Use caching and optimization strategies
5. **Testing**: Test with various event combinations and edge cases

### For System Administrators

1. **Database Backups**: Regular backups before migrations
2. **Monitoring**: Monitor API performance and error rates
3. **Capacity Planning**: Plan for event data growth
4. **Index Maintenance**: Keep database indexes optimized
5. **Log Review**: Regularly review logs for issues

## Integration with Other Systems

### Events Management System

- Events are created and managed in the Events Management module
- Active events automatically appear in quote event selector
- Event changes (price, name) don't affect existing quotes
- Deactivated events are hidden from new quotes

### Package System

- Events can be added to both package-based and custom quotes
- Package price and event prices are calculated separately
- Price synchronization maintains accuracy
- Unlinking packages preserves selected events

### Email System

- Selected events appear in quote emails
- Event names and prices are formatted in email template
- Price breakdown includes events section
- Email preview shows events before sending

### Reporting System

- Event selection data available for reporting
- Popular events can be identified
- Revenue attribution by event type
- Quote conversion rates with/without events

## Future Enhancements

Potential improvements for future versions:

1. **Bulk Event Operations**: Add/remove multiple events at once
2. **Event Packages**: Pre-defined event bundles
3. **Dynamic Pricing**: Time-based or volume-based event pricing
4. **Event Recommendations**: AI-suggested events based on quote details
5. **Advanced Filtering**: More sophisticated event filtering options
6. **Event Analytics**: Detailed analytics on event selection patterns
7. **Multi-Currency Support**: Automatic currency conversion for events
8. **Event Availability**: Real-time availability checking

## Support and Resources

### Documentation

- **Requirements**: `.kiro/specs/quote-events-integration/requirements.md`
- **Design**: `.kiro/specs/quote-events-integration/design.md`
- **Tasks**: `.kiro/specs/quote-events-integration/tasks.md`
- **Migration README**: `src/lib/migrations/010-README.md`

### Code References

- **Quote Model**: `src/models/Quote.ts`
- **Event Selector**: `src/components/enquiries/EventSelector.tsx`
- **Selected Events List**: `src/components/admin/SelectedEventsList.tsx`
- **Price Breakdown**: `src/components/admin/PriceBreakdown.tsx`
- **Quote Form**: `src/components/admin/QuoteForm.tsx`
- **API Routes**: `src/app/api/admin/quotes/`
- **Migration**: `src/lib/migrations/010-add-events-to-quotes.ts`

### Testing

- **Unit Tests**: `src/components/admin/__tests__/`
- **Integration Tests**: `src/test/integration/`
- **Test Scripts**: `test-quote-*.js` files in project root

### Getting Help

1. Check this documentation first
2. Review the troubleshooting section
3. Check browser console and server logs
4. Review related code and tests
5. Contact the development team

## Changelog

### Version 1.0.0 (Initial Release)

**Features**:
- Event selection in quote form
- Destination-based event filtering
- Automatic price calculation
- Price breakdown display
- Email integration
- Package system integration
- Migration support

**Components Added**:
- SelectedEventsList component
- PriceBreakdown component
- Event selection in QuoteForm

**API Endpoints Added**:
- POST `/api/admin/quotes/calculate-events-price`
- Updated quote CRUD endpoints for events

**Database Changes**:
- Added `selectedEvents` field to Quote model
- Added indexes for performance
- Migration script for existing quotes

**Documentation**:
- User guide
- API documentation
- Migration guide
- Troubleshooting guide

## Glossary

- **Event**: A bookable activity or experience with pricing information
- **Selected Event**: An event that has been added to a quote
- **Base Price**: The quote price before adding events (package or custom)
- **Events Total**: The sum of all selected event prices
- **Total Price**: Base price plus events total
- **Destination Filter**: Filtering events by the quote's destination
- **Event Selector**: UI component for browsing and selecting events
- **Price Breakdown**: Itemized display of quote pricing components
- **Migration**: Database update to add new fields to existing records
