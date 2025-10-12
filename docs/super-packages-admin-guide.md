# Super Offer Packages - Admin User Guide

## Overview

Super Offer Packages allow you to create and manage pre-configured destination packages with complex pricing matrices. These packages can be quickly applied to quotes, reducing manual data entry and ensuring consistency.

## Table of Contents

1. [Accessing Super Packages](#accessing-super-packages)
2. [Creating a New Package](#creating-a-new-package)
3. [Importing Packages from CSV](#importing-packages-from-csv)
4. [Managing Existing Packages](#managing-existing-packages)
5. [Linking Packages to Quotes](#linking-packages-to-quotes)
6. [Using the Price Calculator](#using-the-price-calculator)
7. [Best Practices](#best-practices)

## Accessing Super Packages

1. Log in to the admin panel
2. Navigate to **Super Packages** in the main menu
3. You'll see a list of all existing packages

## Creating a New Package

### Step 1: Basic Information

1. Click **Create New Package**
2. Fill in the basic details:
   - **Package Name**: Descriptive name (e.g., "Benidorm Weekend Getaway")
   - **Destination**: The destination city/area
   - **Resort**: Specific resort or area name
   - **Currency**: Select EUR, GBP, or USD

### Step 2: Configure Group Size Tiers

Define the different group size categories:

1. Click **Add Tier**
2. Enter:
   - **Label**: Display name (e.g., "6-11 People")
   - **Min People**: Minimum group size
   - **Max People**: Maximum group size
3. Add multiple tiers as needed

**Example:**
- Tier 1: "6-11 People" (min: 6, max: 11)
- Tier 2: "12+ People" (min: 12, max: 999)

### Step 3: Set Duration Options

Specify the available night options:

1. Enter the number of nights (e.g., 2, 3, 4)
2. Click **Add Duration** for each option
3. These will create columns in your pricing matrix

### Step 4: Build the Pricing Matrix

The pricing matrix is where you set prices for each combination of:
- Time period (month or special date range)
- Group size tier
- Duration (nights)

**To add pricing:**

1. Click **Add Period**
2. Select period type:
   - **Month**: Select a month (e.g., January)
   - **Special Period**: Enter name and date range (e.g., "Easter 2025", 02/04/2025 - 06/04/2025)
3. For each cell in the grid, enter:
   - A numeric price (per person)
   - Or type "ON REQUEST" for custom pricing

**Tips:**
- Complete all cells in the matrix
- Use "ON REQUEST" when pricing varies significantly
- Copy/paste is supported for bulk entry

### Step 5: Add Inclusions

List what's included in the package:

1. Click **Add Inclusion**
2. Enter the inclusion text (e.g., "Return airport transfers")
3. Optionally select a category (transfer, accommodation, activity, etc.)
4. Add all relevant inclusions

### Step 6: Add Accommodation Examples

Provide example properties:

1. Enter property names or descriptions
2. Click **Add** for each example
3. These help agents understand the accommodation level

### Step 7: Sales Notes

Add any important notes for sales agents:

- Special conditions
- Booking requirements
- Restrictions
- Upsell opportunities

### Step 8: Save

1. Review all information
2. Set status to **Active** to make it available for quotes
3. Click **Save Package**

## Importing Packages from CSV

### CSV Format Requirements

Your CSV file must follow this structure:

```
Resort Name,,,,,,,
Destination Name,,,,,,,

,Group Size Tiers →,6-11 People,,12+ People,
,Duration (Nights) →,2,3,4,2,3,4

Period,Type,2N,3N,4N,2N,3N,4N
January,month,€450,€550,€650,€400,€500,€600
February,month,€480,€580,€680,€430,€530,€630
Easter (02/04/2025 - 06/04/2025),special,ON REQUEST,ON REQUEST,ON REQUEST,ON REQUEST,ON REQUEST,ON REQUEST

INCLUSIONS
- Return airport transfers
- 3* or 4* accommodation
- Welcome meeting

SALES NOTES
Book 3 months in advance for best rates.
```

### Import Steps

1. Click **Import from CSV**
2. Drag and drop your CSV file or click to browse
3. Wait for parsing to complete
4. Review the preview:
   - Check all pricing is correct
   - Verify inclusions extracted properly
   - Review sales notes
5. Make any necessary edits
6. Click **Confirm Import**

### Common Import Issues

**Issue**: "Invalid CSV structure"
- **Solution**: Ensure headers match the required format exactly

**Issue**: "Missing pricing data"
- **Solution**: Fill in all cells in the pricing matrix

**Issue**: "Invalid date format"
- **Solution**: Use DD/MM/YYYY format for special period dates

## Managing Existing Packages

### Viewing Packages

The package list shows:
- Package name
- Destination and resort
- Price range
- Status (Active/Inactive)
- Last updated date

**Filtering:**
- Use the search box to find packages by name
- Filter by destination
- Filter by status (Active/Inactive/All)

### Editing a Package

1. Click the **Edit** button on a package
2. Make your changes
3. Click **Save**

**Note**: Editing a package does NOT affect existing quotes that use it. Quotes store a snapshot of the package at the time of linking.

### Activating/Deactivating

**To deactivate a package:**
1. Click the status toggle or **Deactivate** button
2. Confirm the action
3. The package will no longer appear in quote selection lists

**To reactivate:**
1. Filter to show inactive packages
2. Click **Activate**
3. The package is now available again

### Deleting a Package

**If no quotes are linked:**
- Click **Delete**
- Confirm
- Package is permanently removed

**If quotes are linked:**
- System shows warning with quote count
- Package is soft-deleted (hidden but data retained)
- Linked quotes remain unchanged

### Duplicating a Package

To create a similar package:

1. Click **Duplicate** on an existing package
2. System creates a copy with "(Copy)" appended to name
3. Edit the duplicate as needed
4. Save

## Linking Packages to Quotes

### From Quote Creation/Edit

1. Open a quote (new or existing)
2. Click **Select Super Package**
3. Search and select a package
4. Enter parameters:
   - **Number of People**: Total group size
   - **Number of Nights**: Duration of stay
   - **Arrival Date**: Check-in date
5. Review the calculated price
6. Click **Apply to Quote**

### What Gets Populated

When you apply a package, the quote is automatically filled with:
- Calculated total price
- All inclusions from the package
- Accommodation examples (in internal notes)
- Package reference for tracking

### Manual Adjustments

After applying a package, you can still:
- Adjust the price
- Add or remove inclusions
- Modify any quote details

The package reference remains for tracking purposes.

### "ON REQUEST" Pricing

If the selected combination has "ON REQUEST" pricing:
1. System notifies you
2. You must manually enter the price
3. Package details still populate the quote

## Using the Price Calculator

The standalone calculator lets you test pricing without creating a quote:

1. Navigate to **Super Packages** → **Price Calculator**
2. Select a package
3. Enter:
   - Number of people
   - Number of nights
   - Arrival date
4. View the calculated price and breakdown

**Useful for:**
- Quick price checks
- Testing pricing matrix
- Customer inquiries

## Best Practices

### Naming Conventions

- Use clear, descriptive names
- Include destination and key features
- Example: "Benidorm Beach Resort - Summer Special"

### Pricing Matrix

- Keep pricing up to date
- Review seasonally
- Use "ON REQUEST" sparingly
- Document any special pricing rules in sales notes

### Inclusions

- Be specific and clear
- Use consistent formatting
- Group similar items
- Update when offerings change

### Status Management

- Deactivate outdated packages rather than deleting
- Keep inactive packages for reference
- Regularly review and clean up old packages

### Version Control

- System automatically tracks versions
- Each edit increments the version number
- Existing quotes reference the version they used
- You can view version history in package details

### CSV Imports

- Keep a template CSV file
- Validate data before importing
- Review the preview carefully
- Test with a small file first

### Quote Integration

- Always review auto-populated data
- Adjust as needed for specific customer requirements
- Use package reference for tracking and reporting
- Document any deviations in quote notes

## Troubleshooting

### Package Not Appearing in Selection

- Check if package status is Active
- Verify you have admin permissions
- Refresh the page

### Price Calculation Issues

- Verify arrival date falls within a defined period
- Check that group size matches a tier
- Ensure duration option exists in package
- Look for "ON REQUEST" pricing

### Import Failures

- Validate CSV format matches template
- Check for special characters in data
- Ensure all required sections present
- Try importing a smaller test file

### Performance Issues

- Large pricing matrices may load slowly
- Use filters to narrow package lists
- Clear browser cache if needed

## Support

For additional help:
- Contact your system administrator
- Refer to the API documentation for technical details
- Check the CSV import format guide
