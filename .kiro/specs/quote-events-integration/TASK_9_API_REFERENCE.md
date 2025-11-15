# Task 9 API Reference: Quote Events Integration

## Quick Reference for Developers

### Creating a Quote with Events

**Endpoint:** `POST /api/admin/quotes`

**Request Body:**
```json
{
  "enquiryId": "507f1f77bcf86cd799439011",
  "leadName": "John Doe",
  "hotelName": "Beach Resort",
  "numberOfPeople": 10,
  "numberOfRooms": 5,
  "numberOfNights": 3,
  "arrivalDate": "2025-06-15",
  "isSuperPackage": false,
  "whatsIncluded": "Accommodation, breakfast",
  "transferIncluded": true,
  "totalPrice": 1500,
  "currency": "GBP",
  "selectedEvents": [
    {
      "eventId": "507f1f77bcf86cd799439012",
      "eventName": "Jet Skiing",
      "eventPrice": 50,
      "eventCurrency": "GBP",
      "addedAt": "2025-01-15T10:00:00Z"
    },
    {
      "eventId": "507f1f77bcf86cd799439013",
      "eventName": "Parasailing",
      "eventPrice": 75,
      "eventCurrency": "GBP",
      "addedAt": "2025-01-15T10:05:00Z"
    }
  ]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "leadName": "John Doe",
    "selectedEvents": [
      {
        "eventId": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Jet Skiing",
          "isActive": true,
          "pricing": { "estimatedCost": 50, "currency": "GBP" }
        },
        "eventName": "Jet Skiing",
        "eventPrice": 50,
        "eventCurrency": "GBP",
        "addedAt": "2025-01-15T10:00:00Z"
      }
    ],
    ...
  },
  "warnings": [
    "Warning: 1 event(s) are currently inactive: Event X"
  ]
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_EVENTS",
    "message": "Some selected events do not exist",
    "details": [
      {
        "eventId": "507f1f77bcf86cd799439012",
        "eventName": "Deleted Event"
      }
    ]
  }
}
```

### Updating Quote Events

**Endpoint:** `PUT /api/admin/quotes/:id`

**Request Body (Partial Update):**
```json
{
  "selectedEvents": [
    {
      "eventId": "507f1f77bcf86cd799439015",
      "eventName": "Scuba Diving",
      "eventPrice": 100,
      "eventCurrency": "GBP",
      "addedAt": "2025-01-15T11:00:00Z"
    }
  ],
  "totalPrice": 1600
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "selectedEvents": [...],
    "priceHistory": [
      {
        "price": 1500,
        "reason": "package_selection",
        "timestamp": "2025-01-15T10:00:00Z",
        "userId": "..."
      },
      {
        "price": 1600,
        "reason": "event_added",
        "timestamp": "2025-01-15T11:00:00Z",
        "userId": "..."
      }
    ],
    ...
  }
}
```

### Getting Quote with Events

**Endpoint:** `GET /api/admin/quotes/:id`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "leadName": "John Doe",
    "selectedEvents": [
      {
        "eventId": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Jet Skiing",
          "isActive": true,
          "pricing": {
            "estimatedCost": 50,
            "currency": "GBP"
          },
          "destinations": ["Benidorm", "Albufeira"]
        },
        "eventName": "Jet Skiing",
        "eventPrice": 50,
        "eventCurrency": "GBP",
        "addedAt": "2025-01-15T10:00:00Z"
      }
    ],
    "enquiryId": {
      "leadName": "John Doe",
      "agentEmail": "agent@example.com",
      "resort": "Benidorm"
    },
    ...
  }
}
```

### Getting Quote List with Events

**Endpoint:** `GET /api/admin/quotes?page=1&limit=10`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "quotes": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "leadName": "John Doe",
        "selectedEvents": [
          {
            "eventId": {
              "_id": "507f1f77bcf86cd799439012",
              "name": "Jet Skiing",
              "isActive": true,
              "pricing": { "estimatedCost": 50, "currency": "GBP" }
            },
            "eventName": "Jet Skiing",
            "eventPrice": 50,
            "eventCurrency": "GBP"
          }
        ],
        ...
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalQuotes": 47,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

## Validation Rules

### Event Validation
- All event IDs must exist in the database
- Maximum 20 events per quote (enforced by validation schema)
- Event prices must be non-negative
- Event currency must match quote currency (or warning is issued)

### Warnings vs Errors

**Errors (400):**
- Event does not exist
- Invalid event ID format
- Validation schema violations

**Warnings (200 with warnings array):**
- Event is inactive
- Event price has changed since quote creation
- Currency mismatch between event and quote

## Price History Tracking

When events are added or removed, the price history automatically tracks:

```typescript
{
  price: 1600,
  reason: 'event_added',    // or 'event_removed'
  timestamp: new Date(),
  userId: currentUserId
}
```

## Event Population

Events are automatically populated in responses with:
- `name` - Event name
- `isActive` - Active status
- `pricing` - Current pricing information
- `destinations` - Available destinations

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Admin access required |
| `NOT_FOUND` | 404 | Quote or enquiry not found |
| `INVALID_EVENTS` | 400 | One or more events do not exist |
| `VALIDATION_ERROR` | 400 | Request data validation failed |
| `INTERNAL_ERROR` | 500 | Server error |

## Best Practices

1. **Always validate events exist** before submitting
2. **Check for warnings** in the response to inform users
3. **Handle inactive events** gracefully in the UI
4. **Store event details** (name, price) to preserve quote integrity
5. **Track price changes** in price history for audit trail
6. **Use event population** to get current event details

## Example Frontend Usage

```typescript
// Create quote with events
const response = await fetch('/api/admin/quotes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ...quoteData,
    selectedEvents: selectedEvents.map(event => ({
      eventId: event._id,
      eventName: event.name,
      eventPrice: event.pricing.estimatedCost,
      eventCurrency: event.pricing.currency,
      addedAt: new Date()
    }))
  })
});

const result = await response.json();

if (result.success) {
  // Check for warnings
  if (result.warnings?.length > 0) {
    console.warn('Warnings:', result.warnings);
    // Show warnings to user
  }
  
  // Quote created successfully
  console.log('Quote created:', result.data);
} else {
  // Handle error
  console.error('Error:', result.error);
}
```

## Related Documentation

- [Task 5: QuoteForm Integration](./TASK_5_IMPLEMENTATION_SUMMARY.md)
- [Task 6: Price Calculation](./TASK_6_IMPLEMENTATION_SUMMARY.md)
- [Task 7: Form Submission](./TASK_7_IMPLEMENTATION_SUMMARY.md)
- [Requirements Document](./requirements.md)
- [Design Document](./design.md)
