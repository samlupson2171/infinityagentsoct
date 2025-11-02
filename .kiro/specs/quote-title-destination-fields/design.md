# Design Document

## Overview

This design adds two optional fields (quote title and destination) to the quote creation and editing form. The Quote model already supports these fields in the database schema, so this implementation focuses on exposing them in the user interface and ensuring proper validation and data flow.

## Architecture

### Component Structure

The implementation will modify the existing `QuoteForm` component (`src/components/admin/QuoteForm.tsx`) to include the new fields. No new components are required.

### Data Flow

1. **Form Initialization**: When the form loads, it will check for existing `title` and `destination` values in `initialData` and populate the fields
2. **User Input**: As users type, react-hook-form will manage the field state and validation
3. **Validation**: Zod schema validation will enforce character limits and data types
4. **Submission**: On form submit, the title and destination values will be included in the quote data payload
5. **Persistence**: The API will save the values to the MongoDB Quote collection

## Components and Interfaces

### Modified Components

#### QuoteForm Component (`src/components/admin/QuoteForm.tsx`)

**Changes Required:**
- Add `title` and `destination` to the form's default values
- Add two new input fields in the "Lead Information" section
- Add character counters for both fields
- Ensure validation errors display properly

**Field Placement:**
The new fields will be added to the existing "Lead Information" section, positioned as follows:
```
Lead Information Section:
├── Quote Title (new field - full width)
├── Destination (new field - full width)  
├── Lead Name (existing)
└── Hotel Name (existing)
```

### Data Models

#### QuoteFormData Interface

The existing `QuoteFormData` type in `src/lib/validation/quote-validation.ts` needs to be updated to include:

```typescript
interface QuoteFormData {
  // Existing fields...
  title?: string;
  destination?: string;
  // ... rest of fields
}
```

#### Validation Schema

The `quoteFormValidationSchema` in `src/lib/validation/quote-validation.ts` needs to include:

```typescript
title: z.string().max(200, 'Title must be 200 characters or less').optional(),
destination: z.string().max(100, 'Destination must be 100 characters or less').optional(),
```

## User Interface Design

### Field Layout

Both fields will be full-width inputs in the Lead Information section:

```
┌─────────────────────────────────────────────────────┐
│ Lead Information                                     │
├─────────────────────────────────────────────────────┤
│ Quote Title (Optional)                              │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Enter a descriptive title for this quote...    │ │
│ └─────────────────────────────────────────────────┘ │
│ 0/200 characters                                    │
│                                                     │
│ Destination (Optional)                              │
│ ┌─────────────────────────────────────────────────┐ │
│ │ e.g., Benidorm, Albufeira, Marbella...         │ │
│ └─────────────────────────────────────────────────┘ │
│ 0/100 characters                                    │
│                                                     │
│ Lead Name *          │ Hotel Name *                │
│ ┌──────────────────┐ │ ┌──────────────────────┐   │
│ │                  │ │ │                      │   │
│ └──────────────────┘ │ └──────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Field Specifications

#### Quote Title Field
- **Type**: Text input
- **Label**: "Quote Title (Optional)"
- **Placeholder**: "Enter a descriptive title for this quote..."
- **Max Length**: 200 characters
- **Character Counter**: Display "X/200 characters" below the field
- **Validation**: Optional, max 200 characters
- **Error Message**: "Title must be 200 characters or less"

#### Destination Field
- **Type**: Text input
- **Label**: "Destination (Optional)"
- **Placeholder**: "e.g., Benidorm, Albufeira, Marbella..."
- **Max Length**: 100 characters
- **Character Counter**: Display "X/100 characters" below the field
- **Validation**: Optional, max 100 characters
- **Error Message**: "Destination must be 100 characters or less"

## Error Handling

### Validation Errors

1. **Character Limit Exceeded**: Display inline error message below the field
2. **Invalid Characters**: The fields accept all standard text characters (no special validation needed)
3. **Form Submission**: If validation fails, prevent submission and highlight the error

### Error Display Pattern

```tsx
{errors.title && (
  <p className="text-red-600 text-sm mt-1">
    {errors.title.message}
  </p>
)}
```

## Data Persistence

### API Integration

The existing quote API endpoints already support these fields in the Quote model:
- `POST /api/admin/quotes` - Create quote
- `PUT /api/admin/quotes/[id]` - Update quote

No API changes are required. The fields will be automatically persisted when included in the request payload.

### Database Schema

The Quote model (`src/models/Quote.ts`) already includes these fields:

```typescript
title: {
  type: String,
  trim: true,
  maxlength: 200,
},
destination: {
  type: String,
  trim: true,
  maxlength: 100,
},
```

## Testing Strategy

### Manual Testing Checklist

1. **Field Display**
   - Verify both fields appear in the Lead Information section
   - Verify fields are properly labeled and have placeholders
   - Verify character counters display correctly

2. **Input Validation**
   - Enter text up to the character limit
   - Attempt to exceed character limits
   - Verify validation error messages display

3. **Form Submission**
   - Create a new quote with title and destination
   - Create a new quote without title and destination
   - Edit an existing quote and add title/destination
   - Edit an existing quote and modify title/destination

4. **Data Persistence**
   - Verify saved quotes include title and destination in database
   - Verify quotes display correctly in quote list/details views

5. **Edge Cases**
   - Test with special characters (accents, symbols)
   - Test with very long text (at character limits)
   - Test with empty strings vs undefined values

### Integration Testing

- Verify package selection doesn't override manually entered title/destination
- Verify form reset clears title and destination fields
- Verify auto-save (if enabled) includes title and destination

## Implementation Notes

### Minimal Changes Approach

This implementation requires minimal changes:
1. Update validation schema (1 file)
2. Update QuoteForm component (1 file)
3. No API changes needed
4. No database migration needed

### Backward Compatibility

- Existing quotes without title/destination will continue to work
- The fields are optional, so no data migration is required
- All existing functionality remains unchanged

### Future Enhancements

Potential future improvements (not in scope for this feature):
- Destination dropdown with predefined options
- Auto-populate destination from linked package
- Search/filter quotes by destination
- Display title in quote list view
