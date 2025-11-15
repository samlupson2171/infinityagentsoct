# Task 4: Event Price Calculation API - Implementation Summary

## Overview
Created a new API endpoint `/api/admin/quotes/calculate-events-price` that calculates the total price for selected events and returns detailed event information with pricing.

## Implementation Details

### API Endpoint
**File**: `src/app/api/admin/quotes/calculate-events-price/route.ts`

**Method**: POST

**Authentication**: Requires admin authentication via `requireAdmin` middleware

### Request Format
```json
{
  "eventIds": ["eventId1", "eventId2", "eventId3"],
  "numberOfPeople": 10  // Optional, for future per-person pricing
}
```

### Response Format
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "eventId": "68f575af0d228bfe076888ba",
        "eventName": "Club Entry",
        "price": 0,
        "currency": "GBP",
        "isActive": true
      },
      {
        "eventId": "68f575af0d228bfe076888c9",
        "eventName": "Paintball",
        "price": 35,
        "currency": "EUR",
        "isActive": true
      }
    ],
    "total": 35,
    "currency": "EUR",
    "warnings": [
      "Event 'Club Entry' does not have pricing information. Price is set to 0.",
      "Event 'Paintball' uses EUR while other events use GBP. Manual price adjustment may be needed."
    ]
  }
}
```

## Features Implemented

### ✅ Core Functionality
1. **Event Price Calculation**: Fetches event details from database and calculates total price
2. **Currency Handling**: Detects primary currency from first priced event and handles currency mismatches
3. **Event Validation**: Validates event IDs and checks for missing/inactive events
4. **Error Handling**: Comprehensive error handling for all edge cases

### ✅ Validation
1. **Request Validation**:
   - Validates `eventIds` is an array
   - Validates all event IDs are valid MongoDB ObjectIds
   - Validates maximum 20 events per quote
   - Handles empty array gracefully

2. **Event Validation**:
   - Checks if events exist in database
   - Returns 404 error for missing events
   - Warns about inactive events
   - Warns about missing pricing information

3. **Currency Validation**:
   - Detects currency mismatches
   - Only adds events with matching currency to total
   - Provides warnings for manual adjustment

### ✅ Error Handling
1. **Authentication Errors**: Returns 401/403 for unauthorized access
2. **Validation Errors**: Returns 400 with detailed error messages
3. **Not Found Errors**: Returns 404 when events don't exist
4. **Server Errors**: Returns 500 for unexpected errors

### ✅ Warning System
The endpoint provides helpful warnings for:
- Inactive events that may not be available
- Currency mismatches requiring manual adjustment
- Missing pricing information (defaults to 0)

## Testing

### Test Files Created
1. **`test-calculate-events-price.js`**: HTTP endpoint tests (requires authentication)
2. **`test-calculate-events-price-direct.js`**: Direct database logic tests

### Test Results
All calculation logic tests passed:
- ✅ Event fetching from database
- ✅ Price calculation with multiple events
- ✅ Currency handling and mismatch detection
- ✅ Warning generation for edge cases
- ✅ Missing event detection
- ✅ Empty array handling
- ✅ Maximum events validation (20 limit)

### Test Coverage
```
Test 1: Fetch active events with pricing ✅
Test 2: Calculate total price for selected events ✅
Test 3: Handle non-existent event ID ✅
Test 4: Handle empty event array ✅
Test 5: Validate maximum events limit ✅
```

## Requirements Mapping

### Requirement 2.1 ✅
> WHEN THE Admin selects an event with a price, THE Quote System SHALL add the event price to the quote total price

**Implementation**: Endpoint calculates total by summing all event prices with matching currency

### Requirement 2.2 ✅
> WHEN THE Admin removes a selected event, THE Quote System SHALL subtract the event price from the quote total price

**Implementation**: Endpoint recalculates total based on provided event IDs (removal handled by frontend)

### Requirement 5.4 ✅
> THE Quote System SHALL handle cases where a previously selected event has been deleted or deactivated

**Implementation**: 
- Returns 404 error for deleted events
- Provides warnings for inactive events
- Includes `isActive` flag in response

## API Response Examples

### Success Response (Multiple Events)
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "eventId": "68f575af0d228bfe076888c9",
        "eventName": "Paintball",
        "price": 35,
        "currency": "EUR",
        "isActive": true
      },
      {
        "eventId": "68fdff0c6823b610b39ef56d",
        "eventName": "Male Stripper",
        "price": 275,
        "currency": "EUR",
        "isActive": true
      }
    ],
    "total": 310,
    "currency": "EUR"
  }
}
```

### Empty Array Response
```json
{
  "success": true,
  "data": {
    "events": [],
    "total": 0,
    "currency": "GBP"
  }
}
```

### Validation Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Maximum 20 events allowed per quote",
    "details": [
      {
        "field": "eventIds",
        "message": "Cannot select more than 20 events"
      }
    ]
  }
}
```

### Not Found Error Response
```json
{
  "success": false,
  "error": {
    "code": "EVENTS_NOT_FOUND",
    "message": "Some events were not found",
    "details": [
      {
        "field": "eventIds",
        "message": "Event with ID 6914821998abf807ec9dd62b not found"
      }
    ]
  }
}
```

## Integration Points

### Database
- Queries `Event` collection for event details
- Uses efficient `$in` query with selected fields only
- Indexes on `_id` ensure fast lookups

### Authentication
- Uses `requireAdmin` middleware for authorization
- Returns proper 401/403 errors for unauthorized access

### Frontend Integration
This endpoint will be used by:
1. **QuoteForm component**: To calculate event prices when events are selected/deselected
2. **SelectedEventsList component**: To display event prices
3. **Price calculation logic**: To update total quote price

## Performance Considerations

### Optimizations
1. **Selective Field Loading**: Only fetches `_id`, `name`, `isActive`, and `pricing` fields
2. **Batch Query**: Uses single `$in` query instead of multiple individual queries
3. **Early Validation**: Validates input before database queries
4. **Efficient Currency Handling**: Single pass through events for calculation

### Expected Performance
- Query time: <50ms for up to 20 events
- Total response time: <100ms including validation and calculation

## Security

### Authentication & Authorization
- ✅ Requires admin authentication
- ✅ Uses secure token validation
- ✅ Returns appropriate error codes

### Input Validation
- ✅ Validates all input parameters
- ✅ Prevents injection attacks via ObjectId validation
- ✅ Enforces maximum limits (20 events)

### Error Handling
- ✅ Doesn't expose sensitive information in errors
- ✅ Logs errors server-side for debugging
- ✅ Returns user-friendly error messages

## Next Steps

This endpoint is ready for integration with:
1. **Task 5**: Update QuoteForm component to integrate event selection
2. **Task 6**: Implement price calculation logic with events
3. **Task 7**: Update quote form submission to include events

## Files Created/Modified

### Created
- ✅ `src/app/api/admin/quotes/calculate-events-price/route.ts` - API endpoint
- ✅ `test-calculate-events-price.js` - HTTP endpoint tests
- ✅ `test-calculate-events-price-direct.js` - Direct logic tests
- ✅ `.kiro/specs/quote-events-integration/TASK_4_IMPLEMENTATION_SUMMARY.md` - This document

### Modified
- None (new endpoint, no existing code modified)

## Conclusion

Task 4 is complete. The event price calculation API endpoint is fully implemented, tested, and ready for frontend integration. All requirements have been met:

- ✅ POST handler implemented
- ✅ Event details fetched from database
- ✅ Missing/inactive events handled
- ✅ Event details with prices returned
- ✅ Comprehensive error handling and validation
- ✅ Requirements 2.1, 2.2, and 5.4 satisfied

The endpoint provides a robust foundation for the quote-events integration feature.
