# Price Recalculation - Quick Reference

## Quick Start

1. **Find quote** with package badge (📦)
2. **Click** dollar icon (💲) in actions
3. **Review** price comparison
4. **Apply** or cancel

## Button Location

```
Quote List → Actions Column → 💲 Dollar Icon
```

## Modal Sections

| Section | Shows |
|---------|-------|
| **Package Info** | Name, version, changes |
| **Parameters** | People, nights, date |
| **Comparison** | Old vs new price |
| **Details** | Tier, period, breakdown |

## Price Indicators

| Color | Meaning | Action |
|-------|---------|--------|
| 🔴 Red | Price increased | Review increase |
| 🟢 Green | Price decreased | Good news! |
| ⚪ Gray | No change | Already current |

## What Gets Updated

✅ Total price  
✅ Package info  
✅ Price history  
✅ Version number  
✅ Quote status  
✅ Audit log  

## Common Errors

| Error | Quick Fix |
|-------|-----------|
| Package deleted | Unlink package |
| Package inactive | Reactivate or unlink |
| No linked package | Can't recalculate |
| ON_REQUEST pricing | Use manual price |
| Invalid parameters | Adjust quote params |

## Best Practices

### ✅ DO
- Recalculate draft quotes
- Check version changes
- Document reasons
- Review before applying

### ❌ DON'T
- Recalculate accepted quotes
- Ignore price increases
- Skip customer notification
- Forget to add notes

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Close modal | `Esc` |
| Apply | `Enter` (when focused) |

## API Endpoints

```
POST /api/admin/quotes/[id]/recalculate-price  # Calculate
PUT  /api/admin/quotes/[id]/recalculate-price  # Apply
```

## Response Times

- Calculate: < 200ms
- Apply: < 500ms
- Modal open: < 300ms

## Status Changes

```
draft → draft (price updated)
sent → updated (indicates change)
updated → updated (version incremented)
```

## Version History

View changes:
1. Click clock icon
2. Select "Version History"
3. Look for "recalculation" entries

## Price History Format

```json
{
  "price": 1650.00,
  "reason": "recalculation",
  "timestamp": "2025-01-10T14:30:00Z",
  "userId": "..."
}
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Button not showing | Quote needs linked package |
| Modal won't open | Check browser console |
| Can't apply | Price unchanged or error |
| Network error | Retry or refresh |

## Security

- 🔒 Admin only
- 📝 All actions logged
- 👤 User ID tracked
- 🕐 Timestamps recorded

## Integration Points

- **QuoteManager**: Main entry point
- **PriceRecalculationModal**: UI component
- **API Routes**: Backend logic
- **PricingCalculator**: Price computation
- **QuoteAuditLogger**: Audit trail

## File Locations

```
Components:
  src/components/admin/PriceRecalculationModal.tsx
  src/components/admin/QuoteManager.tsx

API:
  src/app/api/admin/quotes/[id]/recalculate-price/route.ts

Models:
  src/models/Quote.ts
```

## Testing Checklist

- [ ] Click recalculate button
- [ ] Modal opens
- [ ] Comparison shows
- [ ] Apply works
- [ ] Quote updates
- [ ] Version increments
- [ ] History logs
- [ ] Errors handled

## Support

**Issue?** Check:
1. Error message
2. Package status
3. Quote parameters
4. Browser console

**Still stuck?** Contact support with:
- Quote ID
- Package name
- Error message
- Screenshot

## Related Features

- Package Selection
- Price Sync Indicator
- Version History
- Audit Logging

## Permissions Required

- Admin role
- Quote management access
- Package view access

## Audit Trail

Every recalculation logs:
- Action type
- Quote ID
- Old price
- New price
- User ID
- Timestamp
- Success/failure

## Performance Tips

- Recalculate during off-peak hours
- Batch similar quotes together
- Document bulk updates
- Monitor response times

## Compliance

- ✅ GDPR compliant
- ✅ Audit trail maintained
- ✅ User actions tracked
- ✅ Data integrity preserved

## Quick Wins

1. **Update seasonal pricing**: Recalculate all quotes when seasons change
2. **Fix pricing errors**: Quickly correct quotes with wrong prices
3. **Version tracking**: Maintain clear history of price changes
4. **Customer confidence**: Show accurate, current pricing

## Remember

- Always review before applying
- Consider customer impact
- Document your changes
- Check version history
- Notify customers of changes

---

**Need more details?** See the full User Guide.
