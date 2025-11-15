# Quote Events Integration - Troubleshooting Quick Reference

## Quick Diagnostics

### Check if Feature is Working

```bash
# 1. Verify migration ran successfully
node scripts/verify-quote-events-migration.js

# 2. Check if events exist
node -e "require('./src/lib/load-models'); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(async () => { const Event = mongoose.model('Event'); const count = await Event.countDocuments({ isActive: true }); console.log('Active events:', count); process.exit(0); });"

# 3. Test API endpoint
curl -X POST http://localhost:3000/api/admin/quotes/calculate-events-price \
  -H "Content-Type: application/json" \
  -d '{"eventIds": []}'
```

## Common Issues

### 1. Events Not Showing in Selector

**Symptoms**: Event selector is empty or shows no events

**Quick Checks**:
```bash
# Check if destination has events
node -e "require('./src/lib/load-models'); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(async () => { const Event = mongoose.model('Event'); const events = await Event.find({ destination: 'Benidorm', isActive: true }); console.log('Events for Benidorm:', events.length); process.exit(0); });"
```

**Solutions**:
- Ensure destination is selected in quote form
- Verify events exist for that destination
- Check events are marked as active
- Clear browser cache and reload

### 2. Price Not Updating

**Symptoms**: Total price doesn't change when adding/removing events

**Quick Checks**:
- Open browser console (F12) and look for errors
- Check Network tab for failed API calls
- Verify event has a price value

**Solutions**:
```javascript
// In browser console, check state
console.log('Selected Events:', selectedEvents);
console.log('Events Total:', eventsTotal);
console.log('Total Price:', totalPrice);
```

### 3. "Event No Longer Available" Warning

**Symptoms**: Warning appears for previously selected events

**This is Expected**: Event was deleted or deactivated

**Check Event Status**:
```bash
node -e "require('./src/lib/load-models'); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(async () => { const Event = mongoose.model('Event'); const event = await Event.findById('EVENT_ID'); console.log('Event:', event); process.exit(0); });"
```

**Solutions**:
- Remove the unavailable event
- Select an alternative event
- Contact admin to reactivate if needed

### 4. Events Not in Email

**Symptoms**: Quote email doesn't show selected events

**Quick Checks**:
```bash
# Verify events are saved in quote
node -e "require('./src/lib/load-models'); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(async () => { const Quote = mongoose.model('Quote'); const quote = await Quote.findById('QUOTE_ID'); console.log('Selected Events:', quote.selectedEvents); process.exit(0); });"
```

**Solutions**:
- Verify events are saved (check in database)
- Check email template includes event section
- Review email generation logs
- Test email preview functionality

### 5. Currency Mismatch Error

**Symptoms**: Error when selecting events

**Quick Check**:
```bash
# Check event currency
node -e "require('./src/lib/load-models'); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(async () => { const Event = mongoose.model('Event'); const event = await Event.findById('EVENT_ID'); console.log('Event currency:', event.currency); process.exit(0); });"
```

**Solutions**:
- Only select events with matching currency
- Update event currency in Event Manager
- Create separate quotes for different currencies

### 6. Maximum Events Limit

**Symptoms**: Cannot add more than 20 events

**This is Expected**: System limit for performance

**Solutions**:
- Remove unnecessary events
- Create multiple quotes if needed
- Contact development if limit needs adjustment

## Debugging Commands

### Check Quote Data
```bash
# View quote with events
node -e "
require('./src/lib/load-models');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Quote = mongoose.model('Quote');
  const quote = await Quote.findById('QUOTE_ID');
  console.log('Quote:', JSON.stringify(quote, null, 2));
  process.exit(0);
});
"
```

### Check Event Data
```bash
# View event details
node -e "
require('./src/lib/load-models');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Event = mongoose.model('Event');
  const event = await Event.findById('EVENT_ID');
  console.log('Event:', JSON.stringify(event, null, 2));
  process.exit(0);
});
"
```

### List All Events by Destination
```bash
node -e "
require('./src/lib/load-models');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Event = mongoose.model('Event');
  const events = await Event.find({ isActive: true }).select('name destination price currency');
  console.log('Active Events:', JSON.stringify(events, null, 2));
  process.exit(0);
});
"
```

### Find Quotes with Specific Event
```bash
node -e "
require('./src/lib/load-models');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Quote = mongoose.model('Quote');
  const quotes = await Quote.find({ 'selectedEvents.eventId': 'EVENT_ID' });
  console.log('Quotes with event:', quotes.length);
  process.exit(0);
});
"
```

## Browser Console Debugging

### Check Component State
```javascript
// In React DevTools, find QuoteForm component and inspect:
// - selectedEvents
// - basePrice
// - eventsTotal
// - totalPrice
```

### Monitor API Calls
```javascript
// In Network tab, filter by:
// - calculate-events-price
// - quotes
// Look for 4xx or 5xx errors
```

### Check for JavaScript Errors
```javascript
// In Console tab, look for:
// - TypeError
// - ReferenceError
// - Network errors
```

## Log Analysis

### Server Logs
```bash
# Check for errors
tail -f logs/application.log | grep -i "event\|quote"

# Check API calls
tail -f logs/application.log | grep "POST /api/admin/quotes"
```

### Database Logs
```bash
# Enable MongoDB profiling
mongo --eval "db.setProfilingLevel(2)"

# View slow queries
mongo --eval "db.system.profile.find().sort({ts:-1}).limit(10)"
```

## Performance Issues

### Slow Event Loading
```bash
# Check index exists
node -e "
require('./src/lib/load-models');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Quote = mongoose.model('Quote');
  const indexes = await Quote.collection.indexes();
  console.log('Indexes:', JSON.stringify(indexes, null, 2));
  process.exit(0);
});
"
```

### Slow Price Calculation
- Check browser console for excessive re-renders
- Verify debouncing is working
- Check network tab for duplicate API calls

## Data Integrity Checks

### Verify All Quotes Have selectedEvents Field
```bash
node -e "
require('./src/lib/load-models');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Quote = mongoose.model('Quote');
  const missing = await Quote.countDocuments({ selectedEvents: { \$exists: false } });
  console.log('Quotes missing selectedEvents:', missing);
  process.exit(0);
});
"
```

### Find Quotes with Invalid Event References
```bash
node -e "
require('./src/lib/load-models');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Quote = mongoose.model('Quote');
  const Event = mongoose.model('Event');
  const quotes = await Quote.find({ 'selectedEvents.0': { \$exists: true } });
  
  for (const quote of quotes) {
    for (const se of quote.selectedEvents) {
      const event = await Event.findById(se.eventId);
      if (!event) {
        console.log('Quote', quote._id, 'has missing event:', se.eventId);
      }
    }
  }
  process.exit(0);
});
"
```

## Emergency Procedures

### Rollback Migration
```bash
# If feature is causing issues, rollback
node scripts/rollback-quote-events-migration.js

# Verify rollback
node scripts/verify-quote-events-migration.js
```

### Clear Problematic Events from Quote
```bash
node -e "
require('./src/lib/load-models');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Quote = mongoose.model('Quote');
  await Quote.updateOne(
    { _id: 'QUOTE_ID' },
    { \$set: { selectedEvents: [] } }
  );
  console.log('Cleared events from quote');
  process.exit(0);
});
"
```

### Disable Feature Temporarily
```javascript
// In QuoteForm.tsx, comment out event selection:
// <EventSelector ... />
// <SelectedEventsList ... />
```

## Getting Help

1. **Check Documentation**: Review main guide and API reference
2. **Run Diagnostics**: Use commands above to gather information
3. **Check Logs**: Review browser console and server logs
4. **Test in Isolation**: Create minimal test case
5. **Contact Support**: Provide diagnostic output and logs

## Prevention

### Before Deployment
- [ ] Run all verification scripts
- [ ] Test in staging environment
- [ ] Backup production database
- [ ] Review migration logs
- [ ] Test rollback procedure

### Monitoring
- [ ] Set up error tracking
- [ ] Monitor API response times
- [ ] Track event selection patterns
- [ ] Monitor database performance
- [ ] Review logs regularly

## Quick Reference Links

- **Main Guide**: `docs/quote-events-integration-guide.md`
- **API Reference**: `docs/quote-events-integration-api-reference.md`
- **Migration README**: `src/lib/migrations/010-README.md`
- **Requirements**: `.kiro/specs/quote-events-integration/requirements.md`
- **Design**: `.kiro/specs/quote-events-integration/design.md`
