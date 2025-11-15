# Quote Events Integration - API Reference

## Quick Reference

This document provides a quick reference for developers working with the Quote Events Integration feature.

## API Endpoints

### Calculate Events Price

Calculate the total price for a set of events.

```
POST /api/admin/quotes/calculate-events-price
```

**Authentication**: Required (Admin only)

**Request Body**:
```typescript
{
  eventIds: string[];           // Array of event IDs
  numberOfPeople?: number;      // Optional: for per-person pricing
}
```

**Success Response** (200):
```typescript
{
  success: true;
  data: {
    events: Array<{
      eventId: string;
      eventName: string;
      price: number;
      currency: string;
    }>;
    total: number;
    currency: string;
  }
}
```

**Error Responses**:
- `400 Bad Request`: Missing or invalid eventIds
- `404 Not Found`: One or more events not found
- `500 Internal Server Error`: Server error

**Example**:
```javascript
const response = await fetch('/api/admin/quotes/calculate-events-price', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventIds: ['event_id_1', 'event_id_2']
  })
});
const data = await response.json();
```

### Create Quote with Events

```
POST /api/admin/quotes
```

**Request Body** (partial):
```typescript
{
  // ... other quote fields
  selectedEvents?: Array<{
    eventId: string;
    eventName: string;
    eventPrice: number;
    eventCurrency: string;
  }>;
  totalPrice: number;  // Includes event prices
}
```

### Update Quote Events

```
PUT /api/admin/quotes/{id}
```

**Request Body**: Same as create, updates the selectedEvents array

### Get Quote with Events

```
GET /api/admin/quotes/{id}
```

**Response**: Includes selectedEvents array with full event details

## Data Types

### SelectedEvent

```typescript
interface SelectedEvent {
  eventId: mongoose.Types.ObjectId;
  eventName: string;
  eventPrice: number;
  eventCurrency: string;
  addedAt: Date;
}
```

### Quote Model (Partial)

```typescript
interface IQuote {
  // ... other fields
  selectedEvents?: SelectedEvent[];
  totalPrice: number;
  currency: string;
}
```

## React Components

### SelectedEventsList

Display and manage selected events in a quote.

**Location**: `src/components/admin/SelectedEventsList.tsx`

**Props**:
```typescript
interface SelectedEventsListProps {
  events: SelectedEvent[];
  onRemove: (eventId: string) => void;
  currency: string;
  readOnly?: boolean;
}
```

**Usage**:
```tsx
<SelectedEventsList
  events={selectedEvents}
  onRemove={handleRemoveEvent}
  currency="GBP"
/>
```

### PriceBreakdown

Display itemized price breakdown including events.

**Location**: `src/components/admin/PriceBreakdown.tsx`

**Props**:
```typescript
interface PriceBreakdownProps {
  basePrice: number;
  eventsTotal: number;
  totalPrice: number;
  currency: string;
  events?: SelectedEvent[];
  showDetails?: boolean;
}
```

**Usage**:
```tsx
<PriceBreakdown
  basePrice={500}
  eventsTotal={150}
  totalPrice={650}
  currency="GBP"
  events={selectedEvents}
  showDetails={true}
/>
```

### EventSelector

Select events from a filtered list (reused from enquiries).

**Location**: `src/components/enquiries/EventSelector.tsx`

**Props**:
```typescript
interface EventSelectorProps {
  destination?: string;
  selectedEventIds: string[];
  onEventSelect: (eventId: string) => void;
  onEventDeselect: (eventId: string) => void;
  currency?: string;
}
```

**Usage**:
```tsx
<EventSelector
  destination={quoteDestination}
  selectedEventIds={selectedEvents.map(e => e.eventId)}
  onEventSelect={handleEventSelect}
  onEventDeselect={handleEventDeselect}
  currency="GBP"
/>
```

## Hooks and Utilities

### useQuotePrice Hook

Manages quote pricing including events.

**Location**: `src/lib/hooks/useQuotePrice.ts`

**Usage**:
```typescript
const {
  basePrice,
  eventsTotal,
  totalPrice,
  updateBasePrice,
  updateEventsTotal,
  recalculate
} = useQuotePrice({
  initialBasePrice: 500,
  initialEvents: selectedEvents
});
```

### Price Calculation Utility

```typescript
// Calculate total from base and events
const calculateTotal = (basePrice: number, eventsTotal: number): number => {
  return basePrice + eventsTotal;
};

// Calculate events total
const calculateEventsTotal = (events: SelectedEvent[]): number => {
  return events.reduce((sum, event) => sum + event.eventPrice, 0);
};
```

## Validation

### Event Validation Rules

```typescript
// Maximum events per quote
const MAX_EVENTS_PER_QUOTE = 20;

// Validate event selection
const validateEvents = (events: SelectedEvent[]): ValidationResult => {
  if (events.length > MAX_EVENTS_PER_QUOTE) {
    return { valid: false, error: 'Maximum 20 events allowed' };
  }
  
  for (const event of events) {
    if (!mongoose.Types.ObjectId.isValid(event.eventId)) {
      return { valid: false, error: 'Invalid event ID' };
    }
    if (event.eventPrice < 0) {
      return { valid: false, error: 'Event price cannot be negative' };
    }
  }
  
  return { valid: true };
};
```

### Currency Validation

```typescript
// Ensure all events match quote currency
const validateCurrency = (
  quoteCurrency: string,
  events: SelectedEvent[]
): boolean => {
  return events.every(event => event.eventCurrency === quoteCurrency);
};
```

## Database Queries

### Find Quotes with Specific Event

```javascript
const Quote = mongoose.model('Quote');

const quotesWithEvent = await Quote.find({
  'selectedEvents.eventId': eventId
});
```

### Get Event Usage Statistics

```javascript
const stats = await Quote.aggregate([
  { $unwind: '$selectedEvents' },
  { $group: {
    _id: '$selectedEvents.eventId',
    count: { $sum: 1 },
    totalRevenue: { $sum: '$selectedEvents.eventPrice' }
  }},
  { $sort: { count: -1 } }
]);
```

### Find Quotes with Missing Events

```javascript
// Find quotes where selected events no longer exist
const quotesWithMissingEvents = await Quote.aggregate([
  { $unwind: '$selectedEvents' },
  { $lookup: {
    from: 'events',
    localField: 'selectedEvents.eventId',
    foreignField: '_id',
    as: 'eventDetails'
  }},
  { $match: { eventDetails: { $size: 0 } } },
  { $group: { _id: '$_id', missingEvents: { $push: '$selectedEvents' } } }
]);
```

## Error Handling

### Common Error Scenarios

```typescript
// Event not found
try {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new Error('Event not found');
  }
} catch (error) {
  return res.status(404).json({
    success: false,
    error: 'Event not found'
  });
}

// Currency mismatch
if (event.currency !== quote.currency) {
  return res.status(400).json({
    success: false,
    error: 'Event currency does not match quote currency'
  });
}

// Maximum events exceeded
if (quote.selectedEvents.length >= MAX_EVENTS_PER_QUOTE) {
  return res.status(400).json({
    success: false,
    error: 'Maximum number of events reached'
  });
}
```

## Testing Examples

### Unit Test Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import SelectedEventsList from '../SelectedEventsList';

describe('SelectedEventsList', () => {
  it('displays selected events with prices', () => {
    const events = [
      {
        eventId: 'event1',
        eventName: 'Jet Skiing',
        eventPrice: 50,
        eventCurrency: 'GBP',
        addedAt: new Date()
      }
    ];
    
    render(
      <SelectedEventsList
        events={events}
        onRemove={jest.fn()}
        currency="GBP"
      />
    );
    
    expect(screen.getByText('Jet Skiing')).toBeInTheDocument();
    expect(screen.getByText('£50')).toBeInTheDocument();
  });
});
```

### Integration Test Example

```typescript
describe('Quote with Events Integration', () => {
  it('creates quote with selected events', async () => {
    const quoteData = {
      customerName: 'John Doe',
      destination: 'Benidorm',
      selectedEvents: [
        {
          eventId: eventId,
          eventName: 'Jet Skiing',
          eventPrice: 50,
          eventCurrency: 'GBP'
        }
      ],
      totalPrice: 550
    };
    
    const response = await fetch('/api/admin/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quoteData)
    });
    
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.selectedEvents).toHaveLength(1);
  });
});
```

## Migration Reference

### Migration Script Location

`src/lib/migrations/010-add-events-to-quotes.ts`

### Running Migration

```bash
# Run migration
node scripts/run-quote-events-migration.js

# Verify migration
node scripts/verify-quote-events-migration.js

# Rollback if needed
node scripts/rollback-quote-events-migration.js
```

### Migration Functions

```typescript
// Add selectedEvents field
await Quote.updateMany(
  { selectedEvents: { $exists: false } },
  { $set: { selectedEvents: [] } }
);

// Create index
await Quote.collection.createIndex({ 'selectedEvents.eventId': 1 });
```

## Performance Tips

1. **Use Indexes**: Ensure indexes exist on `selectedEvents.eventId`
2. **Cache Events**: Cache event data by destination
3. **Debounce Updates**: Debounce price recalculation on client
4. **Batch Queries**: Fetch multiple events in single query
5. **Lazy Load**: Load event details only when needed

## Security Checklist

- [ ] Validate all event IDs on server
- [ ] Verify event exists and is active
- [ ] Check user has admin permissions
- [ ] Validate price values are non-negative
- [ ] Ensure currency consistency
- [ ] Log all event additions/removals
- [ ] Sanitize event names for display
- [ ] Rate limit API endpoints

## Common Patterns

### Adding Event to Quote

```typescript
const handleAddEvent = async (eventId: string) => {
  // Fetch event details
  const event = await fetchEvent(eventId);
  
  // Validate currency
  if (event.currency !== quote.currency) {
    showError('Currency mismatch');
    return;
  }
  
  // Add to selected events
  const newEvent: SelectedEvent = {
    eventId: event._id,
    eventName: event.name,
    eventPrice: event.price,
    eventCurrency: event.currency,
    addedAt: new Date()
  };
  
  setSelectedEvents([...selectedEvents, newEvent]);
  
  // Update total price
  setTotalPrice(totalPrice + event.price);
};
```

### Removing Event from Quote

```typescript
const handleRemoveEvent = (eventId: string) => {
  const event = selectedEvents.find(e => e.eventId === eventId);
  if (!event) return;
  
  // Remove from selected events
  setSelectedEvents(selectedEvents.filter(e => e.eventId !== eventId));
  
  // Update total price
  setTotalPrice(totalPrice - event.eventPrice);
};
```

### Calculating Price Breakdown

```typescript
const calculateBreakdown = (quote: IQuote) => {
  const eventsTotal = quote.selectedEvents?.reduce(
    (sum, event) => sum + event.eventPrice,
    0
  ) || 0;
  
  const basePrice = quote.totalPrice - eventsTotal;
  
  return {
    basePrice,
    eventsTotal,
    totalPrice: quote.totalPrice,
    events: quote.selectedEvents || []
  };
};
```
