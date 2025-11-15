# Task 9 Testing Guide: Quote API Events Integration

## Quick Testing Checklist

### 1. Create Quote with Events (POST)

**Endpoint**: `POST /api/admin/quotes`

**Test Case 1: Valid Events**
```json
{
  "enquiryId": "...",
  "leadName": "Test Lead",
  "hotelName": "Test Hotel",
  "numberOfPeople": 4,
  "numberOfRooms": 2,
  "numberOfNights": 3,
  "arrivalDate": "2025-02-15",
  "isSuperPackage": false,
  "whatsIncluded": "Accommodation and activities",
  "transferIncluded": true,
  "totalPrice": 650,
  "currency": "GBP",
  "selectedEvents": [
    {
      "eventId": "valid-event-id-1",
      "eventName": "Jet Skiing",
      "eventPrice": 50,
      "eventCurrency": "GBP"
    },
    {
      "eventId": "valid-event-id-2",
      "eventName": "Parasailing",
      "eventPrice": 100,
      "eventCurrency": "GBP"
    }
  ]
}
```

**Expected**: 201 Created with quote data including selectedEvents

**Test Case 2: Invalid Event ID**
```json
{
  ...
  "selectedEvents": [
    {
      "eventId": "non-existent-id",
      "eventName": "Fake Event",
      "eventPrice": 50,
      "eventCurrency": "GBP"
    }
  ]
}
```

**Expected**: 400 Bad Request with error code `INVALID_EVENTS`

**Test Case 3: Inactive Event**
```json
{
  ...
  "selectedEvents": [
    {
      "eventId": "inactive-event-id",
      "eventName": "Inactive Event",
      "eventPrice": 50,
      "eventCurrency": "GBP"
    }
  ]
}
```

**Expected**: 400 Bad Request with error code `INVALID_EVENTS`

### 2. Get Quotes List (GET)

**Endpoint**: `GET /api/admin/quotes`

**Test Case**: Fetch quotes with events
```
GET /api/admin/quotes?page=1&limit=10
```

**Expected**: 
- Quotes with `selectedEvents` array
- Events populated with basic details (name, isActive, pricing)

**Verify**:
- Event details are populated
- Inactive events show `isActive: false`
- Event pricing information is included

### 3. Get Single Quote (GET)

**Endpoint**: `GET /api/admin/quotes/:id`

**Test Case**: Fetch quote with events
```
GET /api/admin/quotes/quote-id-here
```

**Expected**:
- Quote with full `selectedEvents` array
- Events populated with detailed information
- Event destinations included

**Verify**:
- All event fields are populated
- Event pricing matches stored prices
- Inactive events are identified

### 4. Update Quote - Add Events (PUT)

**Endpoint**: `PUT /api/admin/quotes/:id`

**Test Case 1: Add Valid Event**
```json
{
  "selectedEvents": [
    {
      "eventId": "existing-event-1",
      "eventName": "Event 1",
      "eventPrice": 50,
      "eventCurrency": "GBP"
    },
    {
      "eventId": "new-event-id",
      "eventName": "New Event",
      "eventPrice": 75,
      "eventCurrency": "GBP"
    }
  ],
  "totalPrice": 625
}
```

**Expected**:
- 200 OK with updated quote
- Price history includes entry with reason `event_added`
- New event is saved

**Test Case 2: Add Inactive Event**
```json
{
  "selectedEvents": [
    {
      "eventId": "inactive-event-id",
      "eventName": "Inactive Event",
      "eventPrice": 50,
      "eventCurrency": "GBP"
    }
  ],
  "totalPrice": 550
}
```

**Expected**:
- 200 OK with updated quote
- Response includes warnings array
- Warning mentions inactive event

**Test Case 3: Event Price Changed**
```json
{
  "selectedEvents": [
    {
      "eventId": "event-with-changed-price",
      "eventName": "Event",
      "eventPrice": 50,
      "eventCurrency": "GBP"
    }
  ],
  "totalPrice": 550
}
```

**Expected** (if current price is 75):
- 200 OK with updated quote
- Response includes warning about price difference
- Stored price (50) is preserved

### 5. Update Quote - Remove Events (PUT)

**Endpoint**: `PUT /api/admin/quotes/:id`

**Test Case**: Remove Event
```json
{
  "selectedEvents": [],
  "totalPrice": 500
}
```

**Expected**:
- 200 OK with updated quote
- Price history includes entry with reason `event_removed`
- Events array is empty

### 6. Price History Tracking

**Test Sequence**:
1. Create quote with 2 events (base: 500, events: 150, total: 650)
2. Add 1 event (new total: 700)
3. Remove 1 event (new total: 650)
4. Manually adjust price (new total: 600)

**Expected Price History**:
```json
{
  "priceHistory": [
    {
      "price": 650,
      "reason": "package_selection",
      "timestamp": "...",
      "userId": "..."
    },
    {
      "price": 700,
      "reason": "event_added",
      "timestamp": "...",
      "userId": "..."
    },
    {
      "price": 650,
      "reason": "event_removed",
      "timestamp": "...",
      "userId": "..."
    },
    {
      "price": 600,
      "reason": "manual_override",
      "timestamp": "...",
      "userId": "..."
    }
  ]
}
```

## Manual Testing Steps

### Setup
1. Ensure you have active events in the database
2. Create at least one inactive event for testing
3. Have an admin user authenticated

### Test Flow

#### Step 1: Create Quote with Events
```bash
# Get active events first
curl -X GET http://localhost:3000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create quote with 2 events
curl -X POST http://localhost:3000/api/admin/quotes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "enquiryId": "ENQUIRY_ID",
    "leadName": "Test Lead",
    "hotelName": "Test Hotel",
    "numberOfPeople": 4,
    "numberOfRooms": 2,
    "numberOfNights": 3,
    "arrivalDate": "2025-02-15",
    "isSuperPackage": false,
    "whatsIncluded": "Accommodation and activities",
    "transferIncluded": true,
    "totalPrice": 650,
    "currency": "GBP",
    "selectedEvents": [
      {
        "eventId": "EVENT_ID_1",
        "eventName": "Jet Skiing",
        "eventPrice": 50,
        "eventCurrency": "GBP"
      },
      {
        "eventId": "EVENT_ID_2",
        "eventName": "Parasailing",
        "eventPrice": 100,
        "eventCurrency": "GBP"
      }
    ]
  }'
```

#### Step 2: Verify Quote Creation
```bash
# Get the created quote
curl -X GET http://localhost:3000/api/admin/quotes/QUOTE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Verify**:
- `selectedEvents` array has 2 events
- Event details are populated
- Total price is correct

#### Step 3: Add Another Event
```bash
curl -X PUT http://localhost:3000/api/admin/quotes/QUOTE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "selectedEvents": [
      {
        "eventId": "EVENT_ID_1",
        "eventName": "Jet Skiing",
        "eventPrice": 50,
        "eventCurrency": "GBP"
      },
      {
        "eventId": "EVENT_ID_2",
        "eventName": "Parasailing",
        "eventPrice": 100,
        "eventCurrency": "GBP"
      },
      {
        "eventId": "EVENT_ID_3",
        "eventName": "Banana Boat",
        "eventPrice": 40,
        "eventCurrency": "GBP"
      }
    ],
    "totalPrice": 690
  }'
```

**Verify**:
- Quote updated successfully
- Price history has new entry with reason `event_added`
- Total price updated

#### Step 4: Test Inactive Event Warning
```bash
# First, deactivate an event
curl -X PUT http://localhost:3000/api/admin/events/EVENT_ID_1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{ "isActive": false }'

# Update quote (event is already in selectedEvents)
curl -X PUT http://localhost:3000/api/admin/quotes/QUOTE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "totalPrice": 700
  }'
```

**Verify**:
- Response includes `warnings` array
- Warning mentions inactive event

#### Step 5: Test Invalid Event
```bash
curl -X PUT http://localhost:3000/api/admin/quotes/QUOTE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "selectedEvents": [
      {
        "eventId": "000000000000000000000000",
        "eventName": "Fake Event",
        "eventPrice": 50,
        "eventCurrency": "GBP"
      }
    ],
    "totalPrice": 550
  }'
```

**Verify**:
- Response is 400 Bad Request
- Error code is `INVALID_EVENTS`
- Error details list the invalid event

## Automated Testing

Run the verification script:
```bash
node verify-quote-events-task9.js
```

Expected output: All 12 checks should pass (100%)

## Common Issues and Solutions

### Issue 1: Events Not Populated
**Symptom**: `selectedEvents.eventId` is just an ObjectId string
**Solution**: Ensure populate is called in the query
**Check**: Look for `.populate('selectedEvents.eventId', ...)`

### Issue 2: Validation Errors
**Symptom**: 400 error with validation details
**Solution**: Check that event IDs are valid ObjectIds and events exist
**Check**: Query the Event collection to verify event exists

### Issue 3: Price History Not Tracking
**Symptom**: Price changes but no history entry
**Solution**: Ensure price history logic is triggered
**Check**: Verify `priceChanged` condition and reason determination

### Issue 4: Warnings Not Showing
**Symptom**: Inactive events but no warnings in response
**Solution**: Check warning extraction logic
**Check**: Verify `_warnings` is added and extracted properly

## Success Criteria

✓ All 12 verification checks pass
✓ Quotes can be created with events
✓ Events are validated for existence and active status
✓ Event details are populated in GET requests
✓ Quotes can be updated with event changes
✓ Inactive events generate warnings
✓ Price changes are detected and reported
✓ Price history tracks event additions/removals
✓ Invalid events return appropriate errors
✓ All date conversions work correctly

## Next Task

Once all tests pass, proceed to:
- **Task 10**: Integrate with package system
- Update frontend to handle warnings
- Test end-to-end quote creation flow
