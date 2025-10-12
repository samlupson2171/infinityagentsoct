# Super Offer Packages - CSV Import Format Guide

## Overview

This guide explains the CSV format required for importing Super Offer Packages. Following this format ensures successful imports and proper data extraction.

## File Requirements

- **Format**: CSV (Comma-Separated Values)
- **Encoding**: UTF-8
- **File Extension**: .csv
- **Maximum Size**: 5MB

## CSV Structure

The CSV file is divided into distinct sections:

1. Header Information (Resort and Destination)
2. Group Size Tiers Definition
3. Duration Options Definition
4. Pricing Matrix
5. Inclusions Section
6. Sales Notes Section

## Detailed Format

### Section 1: Header Information

**Lines 1-2**: Resort and destination names

```csv
Resort Name,,,,,,,
Destination Name,,,,,,,
```

**Example:**
```csv
Benidorm Beach Resort,,,,,,,
Benidorm,,,,,,,
```

**Rules:**
- Resort name in first cell of first row
- Destination name in first cell of second row
- Leave remaining cells empty (commas maintain structure)

### Section 2: Group Size Tiers

**Line 3**: Blank line (separator)

**Line 4**: Group size tier headers

```csv
,Group Size Tiers →,Tier 1 Label,,Tier 2 Label,
```

**Example:**
```csv
,Group Size Tiers →,6-11 People,,12+ People,
```

**Rules:**
- First cell empty
- Second cell contains "Group Size Tiers →"
- Subsequent cells contain tier labels
- Leave empty cells between tiers for spacing

**Tier Label Format:**
- Use format: "X-Y People" or "X+ People"
- System extracts min/max from label
- Examples:
  - "6-11 People" → min: 6, max: 11
  - "12+ People" → min: 12, max: 999

### Section 3: Duration Options

**Line 5**: Duration headers

```csv
,Duration (Nights) →,2,3,4,2,3,4
```

**Rules:**
- First cell empty
- Second cell contains "Duration (Nights) →"
- Subsequent cells contain night counts
- Repeat night counts for each tier
- Must match number of tiers × number of durations

**Example for 2 tiers and 3 durations:**
```csv
,Duration (Nights) →,2,3,4,2,3,4
```

### Section 4: Pricing Matrix

**Line 6**: Blank line (separator)

**Line 7**: Column headers

```csv
Period,Type,2N,3N,4N,2N,3N,4N
```

**Rules:**
- First column: "Period"
- Second column: "Type"
- Remaining columns: Duration labels (e.g., "2N", "3N", "4N")
- Repeat for each tier

**Lines 8+**: Pricing data rows

```csv
January,month,€450,€550,€650,€400,€500,€600
February,month,€480,€580,€680,€430,€530,€630
Easter (02/04/2025 - 06/04/2025),special,€500,€600,€700,€450,€550,€650
```

**Period Column Rules:**
- **Month periods**: Use full month name (January, February, etc.)
- **Special periods**: Use format "Name (DD/MM/YYYY - DD/MM/YYYY)"
  - Example: "Easter (02/04/2025 - 06/04/2025)"
  - Example: "Christmas Week (20/12/2024 - 27/12/2024)"

**Type Column Rules:**
- Use "month" for monthly periods
- Use "special" for date-range periods

**Price Columns Rules:**
- Enter numeric values with currency symbol (€, £, $)
- Or enter "ON REQUEST" for custom pricing
- System detects currency from first price found
- All prices must use same currency

**Valid Price Formats:**
- €450
- £450
- $450
- 450 (assumes EUR if no symbol)
- ON REQUEST

### Section 5: Inclusions

**Separator Line**: Blank line

**Header Line**:
```csv
INCLUSIONS
```

**Inclusion Lines**: Each inclusion on separate line

```csv
- Return airport transfers
- 3* or 4* accommodation
- Welcome meeting and destination briefing
- 24/7 emergency support
```

**Rules:**
- Start with "INCLUSIONS" header
- Each inclusion starts with "- " (dash and space)
- One inclusion per line
- Can include multiple lines

### Section 6: Sales Notes

**Separator Line**: Blank line

**Header Line**:
```csv
SALES NOTES
```

**Notes Content**: Free-form text

```csv
Book 3 months in advance for best rates. Group discounts available for 15+ people. Special dietary requirements must be notified 2 weeks before arrival.
```

**Rules:**
- Start with "SALES NOTES" header
- Can be multiple lines
- Free-form text
- No special formatting required

## Complete Example

```csv
Benidorm Beach Resort,,,,,,,
Benidorm,,,,,,,

,Group Size Tiers →,6-11 People,,12+ People,
,Duration (Nights) →,2,3,4,2,3,4

Period,Type,2N,3N,4N,2N,3N,4N
January,month,€450,€550,€650,€400,€500,€600
February,month,€480,€580,€680,€430,€530,€630
March,month,€520,€620,€720,€470,€570,€670
April,month,€550,€650,€750,€500,€600,€700
May,month,€580,€680,€780,€530,€630,€730
June,month,€620,€720,€820,€570,€670,€770
July,month,€680,€780,€880,€630,€730,€830
August,month,€680,€780,€880,€630,€730,€830
September,month,€620,€720,€820,€570,€670,€770
October,month,€550,€650,€750,€500,€600,€700
November,month,€480,€580,€680,€430,€530,€630
December,month,€520,€620,€720,€470,€570,€670
Easter (02/04/2025 - 06/04/2025),special,ON REQUEST,ON REQUEST,ON REQUEST,ON REQUEST,ON REQUEST,ON REQUEST
Christmas Week (20/12/2024 - 27/12/2024),special,€750,€850,€950,€700,€800,€900

INCLUSIONS
- Return airport transfers
- 3* or 4* accommodation (examples: Hotel Bali, Hotel Presidente)
- Welcome meeting and destination briefing
- 24/7 emergency support
- Complimentary welcome drink
- Access to beach club facilities

SALES NOTES
Book 3 months in advance for best rates. Group discounts available for 15+ people. Special dietary requirements must be notified 2 weeks before arrival. Peak season supplements may apply for specific dates.
```

## Common Mistakes and Solutions

### Mistake 1: Incorrect Tier Label Format

**Wrong:**
```csv
,Group Size Tiers →,Small Group,,Large Group,
```

**Correct:**
```csv
,Group Size Tiers →,6-11 People,,12+ People,
```

**Why**: System needs numeric ranges to determine which tier applies.

### Mistake 2: Mismatched Duration Columns

**Wrong** (2 tiers, but only 3 duration columns):
```csv
,Duration (Nights) →,2,3,4
```

**Correct** (2 tiers × 3 durations = 6 columns):
```csv
,Duration (Nights) →,2,3,4,2,3,4
```

### Mistake 3: Invalid Date Format

**Wrong:**
```csv
Easter (04/02/2025 - 04/06/2025),special,...
```

**Correct:**
```csv
Easter (02/04/2025 - 06/04/2025),special,...
```

**Why**: Use DD/MM/YYYY format, not MM/DD/YYYY.

### Mistake 4: Mixed Currencies

**Wrong:**
```csv
January,month,€450,£550,€650,...
```

**Correct:**
```csv
January,month,€450,€550,€650,...
```

**Why**: All prices must use the same currency.

### Mistake 5: Missing Inclusions Dash

**Wrong:**
```csv
INCLUSIONS
Return airport transfers
3* or 4* accommodation
```

**Correct:**
```csv
INCLUSIONS
- Return airport transfers
- 3* or 4* accommodation
```

**Why**: System looks for "- " prefix to identify inclusions.

## Validation Rules

The system validates:

1. **Structure**:
   - All required sections present
   - Correct number of columns
   - Proper header format

2. **Data**:
   - Valid tier labels with numeric ranges
   - Valid duration numbers
   - Valid date formats for special periods
   - Consistent currency usage

3. **Completeness**:
   - All pricing cells filled (or "ON REQUEST")
   - At least one inclusion
   - Resort and destination names present

## Tips for Creating CSV Files

### Using Excel/Google Sheets

1. Create your data in spreadsheet software
2. Follow the structure exactly
3. Export as CSV (UTF-8)
4. Verify in text editor before importing

### Using Text Editor

1. Use a plain text editor (not Word)
2. Save with .csv extension
3. Ensure UTF-8 encoding
4. Test with small file first

### Template Approach

1. Download a working example
2. Replace data with your own
3. Keep structure identical
4. Validate before importing

## Testing Your CSV

Before importing to production:

1. **Validate Structure**:
   - Open in text editor
   - Check all sections present
   - Verify comma placement

2. **Check Data**:
   - All prices have currency symbols
   - Dates in correct format
   - Tier labels have numbers
   - No missing cells

3. **Test Import**:
   - Import to test environment first
   - Review preview carefully
   - Check all data extracted correctly

## Troubleshooting Import Errors

### Error: "Invalid CSV structure"

**Causes**:
- Missing required sections
- Incorrect header format
- Wrong number of columns

**Solution**:
- Compare with template
- Check all section headers present
- Verify column counts match tiers × durations

### Error: "Invalid date format"

**Causes**:
- Wrong date format (MM/DD/YYYY instead of DD/MM/YYYY)
- Missing dates in special period
- Invalid date values

**Solution**:
- Use DD/MM/YYYY format
- Ensure both start and end dates present
- Verify dates are valid

### Error: "Missing pricing data"

**Causes**:
- Empty cells in pricing matrix
- Incorrect number of price columns

**Solution**:
- Fill all pricing cells
- Use "ON REQUEST" if price varies
- Verify columns match tiers × durations

### Error: "Currency detection failed"

**Causes**:
- No currency symbols in prices
- Mixed currencies
- Invalid price format

**Solution**:
- Add currency symbol to all prices
- Use consistent currency throughout
- Check for typos in price values

## Advanced Features

### Multiple Tiers

You can define any number of tiers:

```csv
,Group Size Tiers →,2-5 People,,6-11 People,,12-19 People,,20+ People,
,Duration (Nights) →,2,3,4,2,3,4,2,3,4,2,3,4
```

### Multiple Durations

Support any duration options:

```csv
,Duration (Nights) →,2,3,4,5,7,2,3,4,5,7
```

### Complex Special Periods

Multiple special periods supported:

```csv
Easter (02/04/2025 - 06/04/2025),special,...
Summer Peak (15/07/2025 - 31/08/2025),special,...
Christmas (20/12/2025 - 27/12/2025),special,...
New Year (27/12/2025 - 03/01/2026),special,...
```

## Best Practices

1. **Keep a Template**: Save a working CSV as template for future packages

2. **Validate Before Import**: Always review in text editor before importing

3. **Use Consistent Formatting**: Maintain same structure across all packages

4. **Document Special Cases**: Add notes for unusual pricing or periods

5. **Test First**: Import to test environment before production

6. **Backup Data**: Keep original CSV files for reference

7. **Version Control**: Name files with version/date (e.g., benidorm-v2-2025.csv)

## Support

For additional help:
- Review the admin user guide
- Contact system administrator
- Check example CSV files in the templates folder
