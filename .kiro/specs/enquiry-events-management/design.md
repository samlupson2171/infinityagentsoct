# Design Document

## Overview

The Events Management System provides a flexible, database-driven approach to managing events/activities that can be selected during enquiry submission. The system replaces hardcoded event lists with a dynamic solution that supports destination-specific events, multiple categories, and comprehensive admin management.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
├──────────────────────────┬──────────────────────────────────┤
│   Admin Interface        │    Enquiry Form                  │
│   - EventsManager        │    - EnquiryForm (enhanced)      │
│   - EventForm            │    - EventSelector               │
│   - CategoryManager      │    - CategoryFilter              │
└──────────────────────────┴──────────────────────────────────┘
                            │
┌───────────────────────────────────────────────────────────────┐
│                      API Layer                                │
├───────────────────────────────────────────────────────────────┤
│   /api/admin/events                                           │
│   /api/admin/events/[id]                                      │
│   /api/admin/events/categories                                │
│   /api/events (public - filtered by destination)             │
└───────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                       │
├───────────────────────────────────────────────────────────────┤
│   - Event Service                                             │
│   - Category Service                                          │
│   - Cache Manager                                             │
│   - Validation Service                                        │
└───────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────────────────────────────────────────┐
│                      Data Layer                               │
├───────────────────────────────────────────────────────────────┤
│   - Event Model (MongoDB)                                     │
│   - Category Model (MongoDB)                                  │
│   - Enquiry Model (updated)                                   │
└───────────────────────────────────────────────────────────────┘
```

## Data Models

### Event Model

```typescript
interface IEvent extends Document {
  name: string;                    // Event name (e.g., "Boat Party")
  description?: string;            // Optional description
  categories: string[];            // Array of category IDs/names
  destinations: string[];          // Array of destination names
  availableInAllDestinations: boolean; // Flag for universal availability
  isActive: boolean;               // Enable/disable without deletion
  displayOrder: number;            // For custom sorting
  pricing?: {                      // Optional pricing information
    estimatedCost?: number;
    currency?: string;
  };
  metadata: {
    createdBy: ObjectId;
    updatedBy: ObjectId;
    createdAt: Date;
    updatedAt: Date;
  };
}
```

**Indexes:**
- `{ name: 1 }` - Unique index for event names
- `{ isActive: 1, destinations: 1 }` - For filtering active events by destination
- `{ categories: 1 }` - For category-based queries
- `{ displayOrder: 1 }` - For ordered retrieval

**Validation:**
- Name: 2-100 characters, required, unique
- Categories: At least one required for active events
- Destinations: At least one required unless availableInAllDestinations is true
- DisplayOrder: Non-negative integer

### Category Model

```typescript
interface ICategory extends Document {
  name: string;                    // Category name (e.g., "Day", "Night")
  slug: string;                    // URL-friendly identifier
  description?: string;            // Optional description
  icon?: string;                   // Optional icon identifier
  color?: string;                  // Optional color for UI
  isSystem: boolean;               // True for predefined categories
  isActive: boolean;               // Enable/disable
  displayOrder: number;            // For custom sorting
  metadata: {
    createdAt: Date;
    updatedAt: Date;
  };
}
```

**Predefined System Categories:**
- Day
- Night
- Adult
- Stag
- Hen

**Indexes:**
- `{ slug: 1 }` - Unique index
- `{ isActive: 1, displayOrder: 1 }` - For ordered active categories

### Updated Enquiry Model

The existing Enquiry model will be updated to store event IDs instead of strings:

```typescript
interface IEnquiry extends Document {
  // ... existing fields ...
  eventsRequested: mongoose.Types.ObjectId[]; // Changed from string[] to ObjectId[]
  // ... rest of fields ...
}
```

## Components and Interfaces

### Admin Components

#### 1. EventsManager Component

**Location:** `src/components/admin/EventsManager.tsx`

**Purpose:** Main admin interface for viewing and managing events

**Features:**
- Table view with columns: Name, Categories, Destinations, Status, Actions
- Search by name
- Filter by category, destination, status
- Bulk actions (activate, deactivate, delete)
- Pagination
- Sort by name, created date, display order

**State Management:**
```typescript
interface EventsManagerState {
  events: IEvent[];
  categories: ICategory[];
  destinations: string[];
  filters: {
    search: string;
    category: string;
    destination: string;
    status: 'all' | 'active' | 'inactive';
  };
  selectedEvents: string[];
  loading: boolean;
  error: string | null;
}
```

#### 2. EventForm Component

**Location:** `src/components/admin/EventForm.tsx`

**Purpose:** Form for creating and editing events

**Fields:**
- Name (text input, required)
- Description (textarea, optional)
- Categories (multi-select checkboxes, required)
- Destinations (multi-select with "All Destinations" option, required)
- Display Order (number input)
- Active Status (toggle)
- Estimated Cost (number input, optional)

**Validation:**
- Real-time validation with error messages
- Duplicate name checking
- At least one category required
- At least one destination required (unless "All Destinations" is checked)

#### 3. CategoryManager Component

**Location:** `src/components/admin/CategoryManager.tsx`

**Purpose:** Interface for managing event categories

**Features:**
- List of categories with edit/delete actions
- Create new category form
- Drag-and-drop reordering
- Cannot delete system categories
- Cannot delete categories in use by events

### Public Components

#### 4. EventSelector Component

**Location:** `src/components/enquiries/EventSelector.tsx`

**Purpose:** Enhanced event selection interface for enquiry form

**Features:**
- Category tabs/filters
- Checkbox grid for event selection
- Event descriptions on hover/click
- Selected events summary
- Responsive design

**Props:**
```typescript
interface EventSelectorProps {
  destination: string;
  selectedEvents: string[];
  onChange: (eventIds: string[]) => void;
  className?: string;
}
```

**State:**
```typescript
interface EventSelectorState {
  events: IEvent[];
  categories: ICategory[];
  activeCategory: string | 'all';
  loading: boolean;
  error: string | null;
}
```

#### 5. CategoryFilter Component

**Location:** `src/components/enquiries/CategoryFilter.tsx`

**Purpose:** Category filtering UI for event selection

**Features:**
- Tab-style or button-style category filters
- Event count badges
- "All" option
- Responsive design

## API Endpoints

### Admin Endpoints

#### GET /api/admin/events
**Purpose:** Retrieve all events with optional filtering

**Query Parameters:**
- `search` - Search by name
- `category` - Filter by category
- `destination` - Filter by destination
- `status` - Filter by active/inactive
- `page` - Pagination
- `limit` - Items per page
- `sort` - Sort field and direction

**Response:**
```typescript
{
  success: true,
  data: {
    events: IEvent[],
    pagination: {
      total: number,
      page: number,
      limit: number,
      pages: number
    }
  }
}
```

#### POST /api/admin/events
**Purpose:** Create a new event

**Request Body:**
```typescript
{
  name: string,
  description?: string,
  categories: string[],
  destinations: string[],
  availableInAllDestinations: boolean,
  displayOrder?: number,
  pricing?: {
    estimatedCost?: number,
    currency?: string
  }
}
```

#### PUT /api/admin/events/[id]
**Purpose:** Update an existing event

**Request Body:** Same as POST

#### DELETE /api/admin/events/[id]
**Purpose:** Soft delete an event (sets isActive to false)

**Query Parameters:**
- `force=true` - Hard delete (only if not referenced in enquiries)

#### PATCH /api/admin/events/[id]/status
**Purpose:** Toggle event active status

**Request Body:**
```typescript
{
  isActive: boolean
}
```

#### GET /api/admin/events/categories
**Purpose:** Retrieve all categories

#### POST /api/admin/events/categories
**Purpose:** Create a new category

#### PUT /api/admin/events/categories/[id]
**Purpose:** Update a category

#### DELETE /api/admin/events/categories/[id]
**Purpose:** Delete a category (only if not in use)

### Public Endpoints

#### GET /api/events
**Purpose:** Retrieve active events filtered by destination

**Query Parameters:**
- `destination` - Filter by destination (required)
- `category` - Filter by category (optional)

**Response:**
```typescript
{
  success: true,
  data: {
    events: IEvent[],
    categories: ICategory[]
  }
}
```

## Caching Strategy

### Cache Implementation

**Technology:** In-memory cache with Redis fallback (optional)

**Cache Keys:**
- `events:all` - All active events
- `events:destination:{name}` - Events for specific destination
- `events:category:{slug}` - Events by category
- `categories:all` - All active categories

**Cache Invalidation:**
- On event create/update/delete
- On category create/update/delete
- TTL: 5 minutes for public endpoints, no TTL for admin (always fresh)

**Implementation:**
```typescript
class EventCache {
  private cache: Map<string, { data: any; timestamp: number }>;
  private ttl: number = 5 * 60 * 1000; // 5 minutes

  async get(key: string): Promise<any | null>;
  async set(key: string, data: any): Promise<void>;
  async invalidate(pattern: string): Promise<void>;
  async clear(): Promise<void>;
}
```

## Error Handling

### Validation Errors

**Format:**
```typescript
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Validation failed',
    details: [
      {
        field: 'name',
        message: 'Event name must be unique'
      }
    ]
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Input validation failed
- `NOT_FOUND` - Event or category not found
- `DUPLICATE_NAME` - Event name already exists
- `IN_USE` - Cannot delete (referenced in enquiries)
- `UNAUTHORIZED` - Admin access required
- `SERVER_ERROR` - Internal server error

## Testing Strategy

### Unit Tests

1. **Model Tests**
   - Event model validation
   - Category model validation
   - Unique constraints
   - Default values

2. **Service Tests**
   - Event CRUD operations
   - Category CRUD operations
   - Filtering logic
   - Cache operations

3. **Component Tests**
   - EventsManager rendering and interactions
   - EventForm validation
   - EventSelector filtering
   - CategoryFilter behavior

### Integration Tests

1. **API Tests**
   - All endpoint responses
   - Authentication/authorization
   - Error handling
   - Pagination

2. **Workflow Tests**
   - Create event → appears in enquiry form
   - Update event → cache invalidation
   - Delete event → soft delete behavior
   - Filter events by destination

### E2E Tests

1. Admin creates a new event
2. Admin assigns categories and destinations
3. Agent selects destination in enquiry form
4. Only relevant events appear
5. Agent filters by category
6. Agent selects events and submits enquiry

## Migration Strategy

### Phase 1: Database Setup

1. Create Event and Category collections
2. Add indexes
3. Seed predefined categories

### Phase 2: Data Migration

1. Create migration script to convert hardcoded events
2. Assign default categories based on event names
3. Mark all as available in all destinations
4. Set all as active

**Migration Script:** `src/lib/migrations/009-create-events-collection.ts`

### Phase 3: Code Updates

1. Update Enquiry model to use ObjectId[] for events
2. Create Event and Category models
3. Implement API endpoints
4. Build admin components
5. Update enquiry form

### Phase 4: Testing and Rollout

1. Test in development environment
2. Run migration on staging
3. Verify all functionality
4. Deploy to production
5. Monitor for issues

## Security Considerations

1. **Admin Access:** All admin endpoints require authentication and admin role
2. **Input Sanitization:** All user inputs sanitized to prevent XSS
3. **SQL Injection:** Using Mongoose ORM prevents injection attacks
4. **Rate Limiting:** API endpoints rate-limited to prevent abuse
5. **Audit Trail:** All changes logged with user information

## Performance Considerations

1. **Indexing:** Proper indexes on frequently queried fields
2. **Caching:** Aggressive caching for public endpoints
3. **Pagination:** Large result sets paginated
4. **Lazy Loading:** Events loaded asynchronously in enquiry form
5. **Debouncing:** Search inputs debounced to reduce API calls

## Future Enhancements

1. **Event Images:** Add image upload for events
2. **Pricing Integration:** Link events to pricing system
3. **Availability Calendar:** Manage event availability by date
4. **Multi-language Support:** Translate event names and descriptions
5. **Event Packages:** Group related events into packages
6. **Analytics:** Track most requested events
7. **Supplier Integration:** Link events to external suppliers
