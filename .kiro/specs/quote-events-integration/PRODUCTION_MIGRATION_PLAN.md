# Production Migration Plan: Quote Events Integration

## Overview
This document outlines the plan for migrating the production database to support the quote-events integration feature (Migration 010).

## Pre-Migration Checklist

### 1. Backup
- [ ] Create full database backup
- [ ] Verify backup integrity
- [ ] Document backup location and timestamp
- [ ] Test backup restoration procedure

### 2. Environment Verification
- [ ] Verify MONGODB_URI is set correctly for production
- [ ] Confirm database connection is stable
- [ ] Check available disk space
- [ ] Verify no other migrations are running

### 3. Testing
- [ ] Verify migration works in development environment
- [ ] Verify rollback procedure works in development
- [ ] Test with production-like data volume
- [ ] Review migration logs for any warnings

## Migration Execution

### Step 1: Maintenance Window
**Recommended Duration:** 15-30 minutes
**Best Time:** Low-traffic period (e.g., 2-4 AM local time)

### Step 2: Pre-Migration Actions
```bash
# 1. Announce maintenance window to users
# 2. Enable maintenance mode (if applicable)
# 3. Stop any background jobs that modify quotes
```

### Step 3: Run Migration
```bash
# Connect to production server
ssh production-server

# Navigate to application directory
cd /path/to/application

# Ensure environment variables are loaded
source .env.production

# Run the migration
node scripts/run-quote-events-migration.js
```

### Step 4: Verify Migration
```bash
# Run verification script
node scripts/verify-quote-events-migration.js
```

**Expected Results:**
- All quotes have `selectedEvents` field
- Index `selected_events_event_id_idx` exists
- No quotes without the required field
- Migration record exists in database

### Step 5: Post-Migration Actions
```bash
# 1. Test quote creation with events
# 2. Test quote editing
# 3. Verify email templates display events correctly
# 4. Check price calculations include events
# 5. Disable maintenance mode
# 6. Announce system is back online
```

## Rollback Procedure

### When to Rollback
- Migration fails with errors
- Data integrity issues detected
- Critical functionality broken
- Performance degradation observed

### Rollback Steps
```bash
# 1. Enable maintenance mode immediately
# 2. Run rollback script
node scripts/rollback-quote-events-migration.js

# 3. Verify rollback
node scripts/verify-quote-events-migration.js

# 4. Restore from backup if rollback fails
mongorestore --uri="$MONGODB_URI" /path/to/backup

# 5. Investigate issues before re-attempting
```

## Monitoring

### During Migration
- Monitor CPU and memory usage
- Watch for database locks
- Track migration progress in logs
- Monitor application error rates

### Post-Migration (First 24 Hours)
- Monitor quote creation success rate
- Track API response times
- Watch for error spikes
- Monitor database performance metrics
- Check user-reported issues

## Communication Plan

### Before Migration
**Timing:** 24 hours before
**Channels:** Email, in-app notification
**Message:**
```
Scheduled Maintenance Notice

We will be performing a system upgrade on [DATE] at [TIME].
Expected downtime: 15-30 minutes
During this time, quote creation and editing will be unavailable.
All other features will remain accessible.
```

### During Migration
**Timing:** At start of maintenance
**Channels:** Status page, in-app banner
**Message:**
```
System Maintenance in Progress

We are currently upgrading our quote management system.
Expected completion: [TIME]
Thank you for your patience.
```

### After Migration
**Timing:** Immediately after completion
**Channels:** Email, in-app notification
**Message:**
```
Maintenance Complete

Our system upgrade is complete. You can now:
- Add events to quotes
- See event pricing in quote breakdowns
- Include events in quote emails

Thank you for your patience!
```

## Troubleshooting

### Issue: Migration Takes Too Long
**Symptoms:** Migration running for more than 5 minutes
**Actions:**
1. Check database connection
2. Verify no locks on quotes collection
3. Check server resources (CPU, memory, disk)
4. Consider running during lower traffic period

### Issue: Some Quotes Missing selectedEvents Field
**Symptoms:** Verification shows quotes without field
**Actions:**
1. Check migration logs for errors
2. Re-run migration (it's idempotent)
3. Manually update affected quotes if needed

### Issue: Index Creation Fails
**Symptoms:** Index not created or conflicts
**Actions:**
1. Check for existing conflicting indexes
2. Drop conflicting index manually
3. Re-run migration

### Issue: Application Errors After Migration
**Symptoms:** Errors in quote creation/editing
**Actions:**
1. Check application logs
2. Verify code deployment matches migration
3. Clear application cache if applicable
4. Consider rollback if critical

## Success Criteria

### Migration Success
- ✅ All quotes have `selectedEvents` field (empty array)
- ✅ Index `selected_events_event_id_idx` created
- ✅ Migration record in database
- ✅ No data loss
- ✅ All existing quotes still accessible

### Feature Success (Post-Deployment)
- ✅ Users can add events to quotes
- ✅ Event prices calculate correctly
- ✅ Quote emails display events
- ✅ Price breakdown shows base + events
- ✅ No performance degradation

## Contacts

### Technical Team
- **Database Admin:** [Contact]
- **Backend Lead:** [Contact]
- **DevOps:** [Contact]
- **On-Call Engineer:** [Contact]

### Escalation Path
1. Migration fails → Database Admin
2. Application errors → Backend Lead
3. Infrastructure issues → DevOps
4. Critical outage → On-Call Engineer

## Post-Migration Review

### Within 1 Week
- [ ] Review migration logs
- [ ] Analyze performance metrics
- [ ] Gather user feedback
- [ ] Document lessons learned
- [ ] Update runbook if needed

### Metrics to Track
- Migration duration
- Downtime duration
- Number of quotes migrated
- Error rate before/after
- User adoption of events feature

## Notes

### Migration Characteristics
- **Idempotent:** Yes (can be run multiple times safely)
- **Reversible:** Yes (rollback script available)
- **Data Loss Risk:** None (only adds fields)
- **Downtime Required:** Minimal (5-10 minutes recommended)
- **Performance Impact:** Low (sparse index, small field)

### Database Impact
- **Collection:** quotes
- **Operation:** updateMany (adds field)
- **Index:** Sparse index on selectedEvents.eventId
- **Estimated Time:** ~1 second per 1000 quotes

### Code Deployment
This migration must be deployed alongside the code changes that use the `selectedEvents` field. Ensure the following are deployed together:
- Migration 010
- Updated Quote model
- QuoteForm with event selection
- Email templates with event display
- API routes for event price calculation
