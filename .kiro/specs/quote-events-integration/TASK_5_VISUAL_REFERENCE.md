# Task 5 Visual Reference: QuoteForm Event Selection

## Before vs After

### Before (Old Implementation)
```
┌─────────────────────────────────────────┐
│ Package Details                          │
├─────────────────────────────────────────┤
│ Activities Included:                     │
│ ┌────────────────────────────────────┐  │
│ │ [Free text textarea]                │  │
│ │ User types: "Jet skiing, parasail"  │  │
│ │                                     │  │
│ └────────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Issues:**
- ❌ No structured data
- ❌ No price tracking per activity
- ❌ No validation
- ❌ Manual text entry prone to errors
- ❌ No filtering by destination

### After (New Implementation)
```
┌─────────────────────────────────────────┐
│ Events & Activities                      │
├─────────────────────────────────────────┤
│ Select Events                            │
│                                          │
│ [All Events (15)] [Water Sports (8)]    │
│ [Adventure (5)] [Nightlife (2)]         │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ ☑ Jet Skiing                        │  │
│ │   Min. 4 people required            │  │
│ │   [Water Sports]                    │  │
│ ├────────────────────────────────────┤  │
│ │ ☑ Parasailing                       │  │
│ │   Soar above the coast              │  │
│ │   [Water Sports] [Adventure]        │  │
│ ├────────────────────────────────────┤  │
│ │ ☐ Sunset Cruise                     │  │
│ │   Romantic evening cruise           │  │
│ │   [Water Sports] [Nightlife]        │  │
│ └────────────────────────────────────┘  │
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

**Benefits:**
- ✅ Structured event data
- ✅ Automatic price calculation
- ✅ Destination-based filtering
- ✅ Category-based organization
- ✅ Visual selection interface
- ✅ Individual event removal
- ✅ Currency validation
- ✅ Real-time total updates

## Component Hierarchy

```
QuoteForm
├── EventSelector (from enquiries module)
│   ├── Category Tabs
│   ├── Event Grid
│   │   ├── Event Card (checkbox)
│   │   ├── Event Card (checkbox)
│   │   └── Event Card (checkbox)
│   └── Select All Button
│
└── SelectedEventsList (new component)
    ├── Event Item (with remove button)
    ├── Event Item (with remove button)
    └── Events Total Display
```

## Data Flow

```
User selects destination
        ↓
EventSelector filters events by destination
        ↓
User selects events from filtered list
        ↓
handleEventSelectionChange called
        ↓
API call to /api/admin/quotes/calculate-events-price
        ↓
Event details with prices fetched
        ↓
selectedEvents state updated
        ↓
eventsTotal recalculated (useEffect)
        ↓
SelectedEventsList displays events
        ↓
User can remove individual events
        ↓
handleRemoveEvent updates state
        ↓
eventsTotal recalculates again
        ↓
Form submission includes selectedEvents
```

## State Management

```typescript
// Event selection state
const [selectedEvents, setSelectedEvents] = useState<Array<{
  eventId: string;        // MongoDB ObjectId
  eventName: string;      // Display name
  eventPrice: number;     // Price in currency
  eventCurrency: string;  // GBP, EUR, USD
  addedAt: Date;         // Timestamp
}>>([]);

// Price tracking
const [basePrice, setBasePrice] = useState<number>(0);      // Package price
const [eventsTotal, setEventsTotal] = useState<number>(0);  // Sum of event prices

// Total price calculation
totalPrice = basePrice + eventsTotal
```

## Event Selection Flow

### 1. Initial State (No Events)
```
┌─────────────────────────────────────────┐
│ Events & Activities                      │
├─────────────────────────────────────────┤
│ Select Events                            │
│ [EventSelector - showing all events]     │
│                                          │
│ Selected Events (0):                     │
│ ┌────────────────────────────────────┐  │
│ │ 📅 No events selected                │  │
│ │ Select events from the event         │  │
│ │ selector to add them to this quote   │  │
│ └────────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 2. After Selecting Events
```
┌─────────────────────────────────────────┐
│ Events & Activities                      │
├─────────────────────────────────────────┤
│ Select Events                            │
│ [EventSelector - 2 events selected]      │
│                                          │
│ Selected Events (2):                     │
│ ┌────────────────────────────────────┐  │
│ │ ✓ Jet Skiing          £50  [×]     │  │
│ │ ✓ Parasailing        £75  [×]     │  │
│ └────────────────────────────────────┘  │
│                                          │
│ Events Total: £125                       │
└─────────────────────────────────────────┘
```

### 3. Currency Mismatch Warning
```
┌─────────────────────────────────────────┐
│ Selected Events (3):                     │
│ ┌────────────────────────────────────┐  │
│ │ ✓ Jet Skiing          £50  [×]     │  │
│ │ ✓ Parasailing        £75  [×]     │  │
│ │ ⚠ Scuba Diving       €60  [×]     │  │
│ │   Currency mismatch: Event uses EUR, │  │
│ │   quote uses GBP                     │  │
│ └────────────────────────────────────┘  │
│                                          │
│ Events Total: £125                       │
│ ⚠ Some events use different currencies.  │
│   Only events matching the quote         │
│   currency (GBP) are included in total.  │
└─────────────────────────────────────────┘
```

## Integration with Package System

### Scenario: Select Package, Then Add Events

```
Step 1: Select Super Package
┌─────────────────────────────────────────┐
│ Package Details                          │
│ ✓ Linked to: Benidorm Party Package     │
│   Tier: Gold | Period: Peak Season      │
│   Package Price: £500                    │
└─────────────────────────────────────────┘

Step 2: Add Events
┌─────────────────────────────────────────┐
│ Events & Activities                      │
│ Selected Events (2):                     │
│ ✓ Jet Skiing          £50               │
│ ✓ Parasailing        £75               │
│ Events Total: £125                       │
└─────────────────────────────────────────┘

Step 3: Final Pricing
┌─────────────────────────────────────────┐
│ Pricing                                  │
│ Base Price (Package):    £500            │
│ Events (2):              £125            │
│ ─────────────────────────                │
│ Total Price:             £625            │
└─────────────────────────────────────────┘
```

## Destination-Based Filtering

### Example: Benidorm vs Albufeira

```
Destination: Benidorm
┌─────────────────────────────────────────┐
│ Available Events (12):                   │
│ • Jet Skiing                             │
│ • Parasailing                            │
│ • Beach Club Entry                       │
│ • Sunset Cruise                          │
│ • Quad Biking                            │
│ • ... (7 more)                           │
└─────────────────────────────────────────┘

Destination: Albufeira
┌─────────────────────────────────────────┐
│ Available Events (8):                    │
│ • Boat Party                             │
│ • Cliff Diving                           │
│ • Wine Tasting                           │
│ • Dolphin Watching                       │
│ • ... (4 more)                           │
└─────────────────────────────────────────┘

No Destination Selected
┌─────────────────────────────────────────┐
│ ⚠ Please select a destination first to   │
│   see available events                   │
└─────────────────────────────────────────┘
```

## API Integration

### Calculate Events Price Endpoint

**Request:**
```json
POST /api/admin/quotes/calculate-events-price
{
  "eventIds": ["event123", "event456"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "eventId": "event123",
        "eventName": "Jet Skiing",
        "price": 50,
        "currency": "GBP"
      },
      {
        "eventId": "event456",
        "eventName": "Parasailing",
        "price": 75,
        "currency": "GBP"
      }
    ],
    "total": 125,
    "currency": "GBP"
  }
}
```

## Form Submission Data

### Quote Data with Events

```json
{
  "leadName": "John Smith",
  "hotelName": "Hotel Sol",
  "destination": "Benidorm",
  "numberOfPeople": 10,
  "numberOfNights": 3,
  "arrivalDate": "2025-06-15",
  "totalPrice": 625,
  "currency": "GBP",
  "linkedPackage": {
    "packageId": "pkg123",
    "packageName": "Benidorm Party Package",
    "calculatedPrice": 500
  },
  "selectedEvents": [
    {
      "eventId": "event123",
      "eventName": "Jet Skiing",
      "eventPrice": 50,
      "eventCurrency": "GBP",
      "addedAt": "2025-11-12T10:30:00Z"
    },
    {
      "eventId": "event456",
      "eventName": "Parasailing",
      "eventPrice": 75,
      "eventCurrency": "GBP",
      "addedAt": "2025-11-12T10:31:00Z"
    }
  ]
}
```

## User Experience Improvements

### Before
1. Admin types "Jet skiing, parasailing" in text field
2. No price information
3. No validation
4. Typos possible
5. No structured data

### After
1. Admin selects destination
2. System shows relevant events
3. Admin clicks checkboxes to select
4. Prices automatically calculated
5. Total updates in real-time
6. Can remove individual events
7. Currency validation
8. Structured, searchable data

## Accessibility Features

- ✅ Keyboard navigation support
- ✅ Screen reader friendly labels
- ✅ Clear visual feedback for selections
- ✅ Error messages for currency mismatches
- ✅ Empty state guidance
- ✅ Focus management
- ✅ ARIA labels on interactive elements

## Performance Considerations

- ✅ Events fetched once per destination
- ✅ Debounced API calls
- ✅ Optimistic UI updates
- ✅ Efficient state management
- ✅ Minimal re-renders
- ✅ Lazy loading of event details

## Conclusion

Task 5 successfully transforms the quote form from a simple text-based activity entry to a sophisticated, structured event selection system with:

- **Better UX:** Visual selection instead of typing
- **Data Quality:** Structured, validated data
- **Automation:** Automatic price calculation
- **Flexibility:** Easy to add/remove events
- **Integration:** Works seamlessly with packages
- **Scalability:** Supports unlimited events per destination
