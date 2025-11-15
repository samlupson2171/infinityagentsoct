# Design Document

## Overview

This design integrates the existing Events Management system with the Quote system, replacing the simple "Activities Included" text field with a structured event selection interface. Events will be filtered by destination, and their prices will automatically contribute to the quote total.

## Architecture

### Data Flow

```
User selects destination → Filter events by destination → Display event selector
User selects events → Calculate event prices → Update quote total
User saves quote → Persist selected events → Store in database
```

### Component Structure

```
QuoteForm (parent)
├── EventSelector (reused from enquiries)
├── SelectedEventsList (new)
└── PriceBreakdown (enhanced)
```

## Components and Interfaces

### 1. Quote Model Enhancement

**File**: `src/models/Quote.ts`

Add new field to IQuote interface:

```typescript
selectedEvents?: Array<{
  eventId: mongoose.Types.ObjectId;
  eventName: string;
  eventPrice: number;
  eventCurrency: string;
  addedAt: Date;
}>;
```

**Schema Changes**:
- Add `selectedEvents` array field
- Add index on `selectedEvents.eventId`
- Remove `activitiesIncluded` field (deprecated)
- Update price history to track event additions/removals

### 2. QuoteForm Component Enhancement

**File**: `src/components/admin/QuoteForm.tsx`

**Changes**:
- Remove `activitiesIncluded` textarea
- Add EventSelector component integration
- Add SelectedEventsList component
- Update price calculation logic
- Add event price tracking

**New State**:
```typescript
const [selectedEvents, setSelectedEvents] = useState<SelectedEvent[]>([]);
const [basePrice, setBasePrice] = useState<number>(0);
const [eventsTotal, setEventsTotal] = useState<number>(0);
```

**Price Calculation Logic**:
```typescript
totalPrice = basePrice + eventsTotal
```

### 3. SelectedEventsList Component (New)

**File**: `src/components/admin/SelectedEventsList.tsx`

**Purpose**: Display selected events with prices and allow removal

**Props**:
```typescript
interface SelectedEventsListProps {
  events: SelectedEvent[];
  onRemove: (eventId: string) => void;
  currency: string;
}
```

**Features**:
- Display event name and price
- Show total events cost
- Allow individual event removal
- Show empty state when no events selected

### 4. PriceBreakdown Component Enhancement

**File**: `src/components/admin/PriceBreakdown.tsx` (new) or enhance existing price display

**Purpose**: Show itemized price breakdown

**Display**:
```
Base Price: £500
Events (3): £150
  - Event 1: £50
  - Event 2: £50
  - Event 3: £50
Total: £650
```

### 5. API Endpoint for Event Pricing

**File**: `src/app/api/admin/quotes/calculate-events-price/route.ts` (new)

**Purpose**: Calculate total price for selected events

**Request**:
```typescript
POST /api/admin/quotes/calculate-events-price
{
  eventIds: string[];
  numberOfPeople?: number; // For per-person pricing if needed
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    events: Array<{
      eventId: string;
      eventName: string;
      price: number;
      currency: string;
    }>;
    total: number;
    currency: string;
  };
}
```

## Data Models

### SelectedEvent Type

```typescript
interface SelectedEvent {
  eventId: string;
  eventName: string;
  eventPrice: number;
  eventCurrency: string;
  pricePerPerson?: boolean; // Whether price is per person or flat rate
  addedAt: Date;
}
```

### Event Pricing Calculation

```typescript
// Calculate total cost for an event
function calculateEventCost(event: SelectedEvent, numberOfPeople: number): number {
  return event.pricePerPerson 
    ? event.eventPrice * numberOfPeople 
    : event.eventPrice;
}

// Calculate total for all events
function calculateEventsTotalCost(
  events: SelectedEvent[], 
  numberOfPeople: number,
  quoteCurrency: string
): number {
  return events
    .filter(e => e.eventCurrency === quoteCurrency)
    .reduce((sum, event) => sum + calculateEventCost(event, numberOfPeople), 0);
}
```

### Quote Form Data Enhancement

```typescript
interface QuoteFormData {
  // ... existing fields
  selectedEvents?: SelectedEvent[];
  basePrice?: number; // Separate from totalPrice
}
```

## Error Handling

### Event Not Found
- **Scenario**: Selected event is deleted or deactivated
- **Handling**: Show warning, allow quote to be saved with note
- **Display**: "Event 'X' is no longer available"

### Price Mismatch
- **Scenario**: Event price changed since quote creation
- **Handling**: Show warning, use stored price
- **Display**: "Event price may have changed"

### Currency Mismatch
- **Scenario**: Event currency differs from quote currency
- **Handling**: Show warning, require manual price entry
- **Display**: "Event uses different currency"

## Testing Strategy

### Unit Tests
1. Event price calculation
2. Event selection/deselection
3. Price breakdown display
4. Currency handling

### Integration Tests
1. Quote creation with events
2. Quote editing with event changes
3. Event filtering by destination
4. Price synchronization

### E2E Tests
1. Complete quote creation flow with events
2. Event selection and price update
3. Quote save and reload with events

## Migration Strategy

### Database Migration

**File**: `src/lib/migrations/010-add-events-to-quotes.ts`

**Steps**:
1. Add `selectedEvents` field to existing quotes (empty array)
2. Optionally migrate `activitiesIncluded` text to internal notes
3. Add indexes
4. Validate data integrity

**Rollback**:
- Remove `selectedEvents` field
- Restore `activitiesIncluded` from backup

### Backward Compatibility

- Keep `activitiesIncluded` field for 1 version (deprecated)
- Show migration notice in admin UI
- Provide data export before migration

## UI/UX Design

### Event Selection Section

```
┌─────────────────────────────────────────┐
│ Events & Activities                      │
├─────────────────────────────────────────┤
│ [Select Events Button]                   │
│                                          │
│ Selected Events (2):                     │
│ ┌────────────────────────────────────┐  │
│ │ ✓ Jet Skiing          £50  [Remove]│  │
│ │ ✓ Parasailing        £75  [Remove]│  │
│ └────────────────────────────────────┘  │
│                                          │
│ Events Total: £125                       │
└─────────────────────────────────────────┘
```

### Price Breakdown Section

```
┌─────────────────────────────────────────┐
│ Pricing                                  │
├─────────────────────────────────────────┤
│ Base Price:        £500                  │
│ Events (2):        £125                  │
│ ─────────────────────────                │
│ Total Price:       £625                  │
│                                          │
│ [View Breakdown]                         │
└─────────────────────────────────────────┘
```

## Performance Considerations

### Optimization Strategies

1. **Event Caching**: Cache active events by destination
2. **Lazy Loading**: Load event details only when needed
3. **Debounced Updates**: Debounce price recalculation
4. **Batch Operations**: Batch event price lookups

### Expected Load

- Events per destination: 10-50
- Selected events per quote: 1-10
- Price calculation time: <100ms

## Security Considerations

### Validation

1. Verify event exists and is active
2. Validate event belongs to destination
3. Prevent price manipulation
4. Audit event additions/removals

### Authorization

- Only admins can select events
- Event prices are server-validated
- Price history tracks all changes

## Integration Points

### Existing Systems

1. **Events Management**: Read event data
2. **Package System**: Coordinate with package pricing
3. **Price Sync**: Integrate with useQuotePrice hook
4. **Email System**: Include events in quote emails

### API Dependencies

- `GET /api/events?destination={dest}` - Fetch events
- `GET /api/admin/events/{id}` - Get event details
- `POST /api/admin/quotes` - Create quote with events
- `PUT /api/admin/quotes/{id}` - Update quote events

## Validation Rules

### Event Selection

- At least 0 events (optional)
- Maximum 20 events per quote
- Events must be active
- Events must match destination (if specified)

### Price Validation

- Event prices must be non-negative
- Total price must not exceed max quote price
- Currency must match quote currency
- Price changes must be logged

## Rollout Plan

### Phase 1: Backend (Week 1)
- Update Quote model
- Create migration
- Add API endpoints
- Write tests

### Phase 2: Frontend (Week 2)
- Update QuoteForm component
- Create SelectedEventsList component
- Integrate EventSelector
- Update price calculation

### Phase 3: Testing & Polish (Week 3)
- Integration testing
- UI/UX refinements
- Performance optimization
- Documentation

### Phase 4: Deployment
- Run migration on staging
- User acceptance testing
- Production deployment
- Monitor for issues
