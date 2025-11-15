# Quote Events Integration - Feature Documentation

## Overview

This feature enables administrators to add structured events to quotes, replacing the simple "Activities Included" text field with a dynamic event selection system. Events are filtered by destination and their prices automatically contribute to the quote total.

## Documentation Index

### Core Documentation

1. **[Requirements](./requirements.md)** - Feature requirements and acceptance criteria
2. **[Design](./design.md)** - Technical design and architecture
3. **[Tasks](./tasks.md)** - Implementation task list and progress

### User Documentation

4. **[User Guide](../../docs/quote-events-integration-guide.md)** - Complete user and admin guide
   - How to create quotes with events
   - Managing events in quotes
   - Working with packages and events
   - Email integration

### Developer Documentation

5. **[API Reference](../../docs/quote-events-integration-api-reference.md)** - API endpoints and code examples
   - API endpoints
   - Data types
   - React components
   - Hooks and utilities
   - Testing examples

6. **[Migration Guide](../../src/lib/migrations/010-README.md)** - Database migration documentation
   - Migration overview
   - Running the migration
   - Verification steps
   - Rollback procedures

7. **[Troubleshooting Guide](./TROUBLESHOOTING.md)** - Quick reference for common issues
   - Common problems and solutions
   - Debugging commands
   - Data integrity checks
   - Emergency procedures

## Quick Start

### For Users

1. Read the [User Guide](../../docs/quote-events-integration-guide.md)
2. Navigate to Admin → Quotes → Create New Quote
3. Select a destination
4. Click "Select Events" to add events
5. Review price breakdown
6. Save quote

### For Developers

1. Review [Requirements](./requirements.md) and [Design](./design.md)
2. Check [API Reference](../../docs/quote-events-integration-api-reference.md)
3. Review code in:
   - `src/models/Quote.ts` - Data model
   - `src/components/admin/QuoteForm.tsx` - Main form
   - `src/components/admin/SelectedEventsList.tsx` - Event list
   - `src/app/api/admin/quotes/` - API routes

### For System Administrators

1. Review [Migration Guide](../../src/lib/migrations/010-README.md)
2. Backup database
3. Run migration: `node scripts/run-quote-events-migration.js`
4. Verify: `node scripts/verify-quote-events-migration.js`
5. Monitor application logs

## Feature Status

### Completed Tasks ✅

- [x] 1. Update Quote model to support selected events
- [x] 2. Create database migration for Quote model changes
- [x] 3. Create SelectedEventsList component
- [x] 4. Create API endpoint for event price calculation
- [x] 5. Update QuoteForm component to integrate event selection
- [x] 6. Implement price calculation logic with events
- [x] 7. Update quote form submission to include events
- [x] 8. Update quote validation schema
- [x] 9. Update quote API routes to handle events
- [x] 10. Integrate with package system
- [x] 11. Create price breakdown display component
- [x] 12. Update QuoteManager to display events
- [x] 13. Update quote email templates to include events
- [x] 14. Add unit tests for event integration
- [x] 16. Update documentation

### Pending Tasks ⏳

- [ ] 15. Add integration tests for quote-events flow (Optional)
- [ ] 17. Run migration and verify data integrity (Production)

## Key Components

### Frontend Components

- **QuoteForm** (`src/components/admin/QuoteForm.tsx`)
  - Main quote creation/editing form
  - Integrates event selection
  - Manages price calculation

- **SelectedEventsList** (`src/components/admin/SelectedEventsList.tsx`)
  - Displays selected events
  - Allows event removal
  - Shows events total

- **PriceBreakdown** (`src/components/admin/PriceBreakdown.tsx`)
  - Itemized price display
  - Base price + events
  - Expandable details

- **EventSelector** (`src/components/enquiries/EventSelector.tsx`)
  - Event browsing and selection
  - Destination filtering
  - Reused from enquiries module

### Backend Components

- **Quote Model** (`src/models/Quote.ts`)
  - selectedEvents field
  - Validation rules
  - Indexes

- **API Routes** (`src/app/api/admin/quotes/`)
  - Calculate events price
  - Create/update quotes with events
  - Get quotes with event details

- **Migration** (`src/lib/migrations/010-add-events-to-quotes.ts`)
  - Adds selectedEvents field
  - Creates indexes
  - Migrates existing data

## Data Flow

```
1. User selects destination
   ↓
2. Events filtered by destination
   ↓
3. User selects events
   ↓
4. Event prices calculated
   ↓
5. Total price updated (base + events)
   ↓
6. Quote saved with selectedEvents
   ↓
7. Events appear in emails and displays
```

## Integration Points

### Events Management System
- Events created in Events Manager
- Active events available for selection
- Event changes don't affect existing quotes

### Package System
- Events work with package-based quotes
- Package price + event prices = total
- Price synchronization maintained

### Email System
- Events included in quote emails
- Price breakdown shows events
- Event names and prices formatted

### Reporting System
- Event selection data available
- Popular events identified
- Revenue attribution by event

## Testing

### Unit Tests
- Component rendering
- Event selection/deselection
- Price calculations
- Validation logic

### Integration Tests (Optional)
- Complete quote creation flow
- Event filtering by destination
- Price synchronization
- API endpoint testing

### Manual Testing
- Create quote with events
- Edit existing quote
- Add/remove events
- Verify email generation
- Test with packages

## Performance

### Optimizations
- Event caching by destination
- Debounced price updates
- Indexed database queries
- Lazy loading of event details

### Metrics
- Event list loading: < 200ms
- Price calculation: < 100ms
- Quote save: < 500ms
- Email generation: < 2 seconds

## Security

### Validation
- Event IDs verified server-side
- Prices validated as non-negative
- Currency consistency enforced
- Maximum 20 events per quote

### Authorization
- Admin-only access
- Server-side price validation
- Audit trail maintained
- All changes logged

## Support

### Common Issues
See [Troubleshooting Guide](./TROUBLESHOOTING.md) for:
- Events not showing
- Price not updating
- Currency mismatches
- Email issues

### Getting Help
1. Check documentation
2. Review troubleshooting guide
3. Run diagnostic commands
4. Check logs
5. Contact development team

## Related Features

- **Events Management** (`.kiro/specs/enquiry-events-management/`)
- **Quote System** (`.kiro/specs/enquiry-quoting-system/`)
- **Package System** (`.kiro/specs/super-offer-packages/`)
- **Email System** (`.kiro/specs/simple-email-solution/`)

## Version History

### Version 1.0.0 (Current)
- Initial release
- Event selection in quotes
- Destination filtering
- Automatic price calculation
- Email integration
- Package system integration
- Migration support
- Comprehensive documentation

## Contributing

When working on this feature:
1. Review requirements and design documents
2. Follow existing code patterns
3. Write tests for new functionality
4. Update documentation as needed
5. Test thoroughly before deployment

## License

Internal project - Infinity Weekends
