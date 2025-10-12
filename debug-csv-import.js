/**
 * Debug script for CSV import issues
 * 
 * Usage: node debug-csv-import.js path/to/your/file.csv
 */

const fs = require('fs');
const path = require('path');

// Get CSV file path from command line
const csvFilePath = process.argv[2];

if (!csvFilePath) {
  console.error('❌ Please provide a CSV file path');
  console.log('Usage: node debug-csv-import.js path/to/your/file.csv');
  process.exit(1);
}

if (!fs.existsSync(csvFilePath)) {
  console.error(`❌ File not found: ${csvFilePath}`);
  process.exit(1);
}

console.log('🔍 Debugging CSV Import\n');
console.log(`File: ${csvFilePath}\n`);

// Read the CSV file
const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
const lines = csvContent.split('\n').map(line => line.trim());

console.log('📊 File Statistics:');
console.log(`  Total lines: ${lines.length}`);
console.log(`  File size: ${(csvContent.length / 1024).toFixed(2)} KB`);
console.log(`  Encoding: UTF-8\n`);

// Check header information
console.log('📋 Header Information (first 10 lines):');
for (let i = 0; i < Math.min(10, lines.length); i++) {
  console.log(`  Line ${i + 1}: ${lines[i].substring(0, 80)}${lines[i].length > 80 ? '...' : ''}`);
}
console.log('');

// Extract metadata
console.log('🏷️  Extracted Metadata:');
let name = '';
let destination = '';
let resort = '';
let currency = 'EUR';

for (let i = 0; i < Math.min(10, lines.length); i++) {
  const line = lines[i].toLowerCase();
  
  if (line.includes('package:') || line.includes('name:')) {
    name = lines[i].split(':')[1]?.trim() || '';
    console.log(`  ✓ Package Name: ${name}`);
  } else if (line.includes('destination:')) {
    destination = lines[i].split(':')[1]?.trim() || '';
    console.log(`  ✓ Destination: ${destination}`);
  } else if (line.includes('resort:')) {
    resort = lines[i].split(':')[1]?.trim() || '';
    console.log(`  ✓ Resort: ${resort}`);
  } else if (line.includes('currency:')) {
    const curr = lines[i].split(':')[1]?.trim().toUpperCase();
    if (curr === 'EUR' || curr === 'GBP' || curr === 'USD') {
      currency = curr;
      console.log(`  ✓ Currency: ${currency}`);
    }
  }
}

if (!name && !destination && !resort) {
  console.log('  ⚠️  No metadata found in standard format');
  console.log('  ℹ️  Will use first line as package name');
}
console.log('');

// Find pricing table
console.log('💰 Pricing Table Detection:');
let pricingStartIndex = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].toLowerCase();
  if ((line.includes('people') || line.includes('pax')) && 
      (line.includes('2 nights') || line.includes('3 nights') || line.includes('nights'))) {
    pricingStartIndex = i;
    console.log(`  ✓ Pricing table found at line ${i + 1}`);
    console.log(`  Header: ${lines[i]}`);
    break;
  }
}

if (pricingStartIndex === -1) {
  console.log('  ❌ ERROR: Could not find pricing table!');
  console.log('  ℹ️  Expected header with "people" or "pax" and "nights"');
  console.log('\n💡 Suggestions:');
  console.log('  1. Check that your CSV has a header row like:');
  console.log('     "Period,6-11 People - 2 Nights,6-11 People - 3 Nights,..."');
  console.log('  2. Make sure the header contains both group size and duration info');
  process.exit(1);
}
console.log('');

// Parse table headers
console.log('📊 Parsing Table Structure:');
const headerLine = lines[pricingStartIndex];
const cells = headerLine.split(',').map(c => c.trim());

console.log(`  Total columns: ${cells.length}`);
console.log(`  Columns: ${cells.join(' | ')}\n`);

const groupSizeTiers = [];
const durationSet = new Set();

for (let i = 1; i < cells.length; i++) {
  const cell = cells[i];
  const peopleMatch = cell.match(/(\d+)-(\d+)\s*(?:people|pax)/i);
  const nightsMatch = cell.match(/(\d+)\s*nights?/i);
  
  if (peopleMatch && nightsMatch) {
    const minPeople = parseInt(peopleMatch[1]);
    const maxPeople = parseInt(peopleMatch[2]);
    const nights = parseInt(nightsMatch[1]);
    
    const tierLabel = `${minPeople}-${maxPeople} People`;
    if (!groupSizeTiers.find(t => t.label === tierLabel)) {
      groupSizeTiers.push({ label: tierLabel, minPeople, maxPeople });
    }
    
    durationSet.add(nights);
  } else {
    console.log(`  ⚠️  Column ${i + 1} doesn't match expected format: "${cell}"`);
  }
}

console.log('👥 Group Size Tiers:');
if (groupSizeTiers.length === 0) {
  console.log('  ❌ ERROR: No valid group size tiers found!');
  console.log('\n💡 Suggestions:');
  console.log('  1. Column headers should include group size like "6-11 People"');
  console.log('  2. Column headers should include duration like "2 Nights"');
  console.log('  3. Example: "6-11 People - 2 Nights"');
  process.exit(1);
}

groupSizeTiers.forEach((tier, index) => {
  console.log(`  Tier ${index + 1}: ${tier.label} (${tier.minPeople}-${tier.maxPeople} people)`);
});
console.log('');

console.log('🌙 Duration Options:');
const durationOptions = Array.from(durationSet).sort((a, b) => a - b);
if (durationOptions.length === 0) {
  console.log('  ❌ ERROR: No valid duration options found!');
  process.exit(1);
}
durationOptions.forEach(nights => {
  console.log(`  ${nights} night${nights === 1 ? '' : 's'}`);
});
console.log('');

// Parse pricing rows
console.log('💵 Pricing Data:');
let validRows = 0;
let invalidRows = 0;

for (let i = pricingStartIndex + 1; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.toLowerCase().includes('inclusions:') ||
      line.toLowerCase().includes('accommodation:') ||
      line.toLowerCase().includes('sales notes:') ||
      line === '') {
    break;
  }
  
  const cells = line.split(',').map(c => c.trim());
  
  if (cells.length < 2) continue;
  
  const period = cells[0];
  
  if (!period) continue;
  
  const expectedPrices = groupSizeTiers.length * durationOptions.length;
  const actualPrices = cells.length - 1;
  
  if (actualPrices === expectedPrices) {
    validRows++;
    console.log(`  ✓ Row ${i + 1}: ${period} (${actualPrices} prices)`);
  } else {
    invalidRows++;
    console.log(`  ⚠️  Row ${i + 1}: ${period} - Expected ${expectedPrices} prices, found ${actualPrices}`);
  }
}

console.log(`\n  Valid rows: ${validRows}`);
console.log(`  Invalid rows: ${invalidRows}\n`);

// Check for inclusions
console.log('📝 Inclusions Section:');
let inclusionsFound = false;
let inclusionCount = 0;

for (const line of lines) {
  if (line.toLowerCase().includes('inclusions:')) {
    inclusionsFound = true;
    console.log('  ✓ Inclusions section found');
    continue;
  }
  
  if (inclusionsFound) {
    if (line.toLowerCase().includes('accommodation:') ||
        line.toLowerCase().includes('sales notes:') ||
        line === '') {
      break;
    }
    
    if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
      inclusionCount++;
    }
  }
}

if (!inclusionsFound) {
  console.log('  ⚠️  No inclusions section found');
} else {
  console.log(`  Found ${inclusionCount} inclusions`);
}
console.log('');

// Check for accommodation
console.log('🏨 Accommodation Section:');
let accommodationFound = false;
let accommodationCount = 0;

for (const line of lines) {
  if (line.toLowerCase().includes('accommodation:') || line.toLowerCase().includes('hotels:')) {
    accommodationFound = true;
    console.log('  ✓ Accommodation section found');
    continue;
  }
  
  if (accommodationFound) {
    if (line.toLowerCase().includes('sales notes:') || line === '') {
      break;
    }
    
    if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
      accommodationCount++;
    }
  }
}

if (!accommodationFound) {
  console.log('  ⚠️  No accommodation section found');
} else {
  console.log(`  Found ${accommodationCount} accommodation examples`);
}
console.log('');

// Check for sales notes
console.log('📄 Sales Notes Section:');
let salesNotesFound = false;

for (const line of lines) {
  if (line.toLowerCase().includes('sales notes:') || line.toLowerCase().includes('notes:')) {
    salesNotesFound = true;
    console.log('  ✓ Sales notes section found');
    break;
  }
}

if (!salesNotesFound) {
  console.log('  ⚠️  No sales notes section found');
}
console.log('');

// Summary
console.log('📊 Summary:');
console.log('  ✓ = Found and valid');
console.log('  ⚠️  = Missing or needs attention');
console.log('  ❌ = Critical error\n');

const issues = [];

if (!name && !destination && !resort) {
  issues.push('Missing package metadata (name, destination, resort)');
}

if (pricingStartIndex === -1) {
  issues.push('Pricing table not found');
}

if (groupSizeTiers.length === 0) {
  issues.push('No valid group size tiers');
}

if (durationOptions.length === 0) {
  issues.push('No valid duration options');
}

if (invalidRows > 0) {
  issues.push(`${invalidRows} pricing rows have incorrect number of columns`);
}

if (!inclusionsFound) {
  issues.push('Inclusions section not found');
}

if (issues.length === 0) {
  console.log('✅ CSV file appears to be valid!');
  console.log('\nIf you\'re still getting a 400 error, check:');
  console.log('  1. File encoding is UTF-8');
  console.log('  2. File size is under 5MB');
  console.log('  3. File extension is .csv');
  console.log('  4. You\'re logged in as an admin');
} else {
  console.log('❌ Issues found:');
  issues.forEach((issue, index) => {
    console.log(`  ${index + 1}. ${issue}`);
  });
  console.log('\n💡 Please fix these issues and try again.');
  console.log('   Refer to docs/super-packages-csv-format.md for detailed format guide.');
}
