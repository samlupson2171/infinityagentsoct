/**
 * Test script to check quotes with linkedPackage data via API
 * Run this with: node test-quote-linkedpackage.js
 * Make sure your dev server is running on port 3003
 */

const fetch = require('node-fetch');

async function testQuoteLinkedPackage() {
  try {
    console.log('🔍 Testing Quote LinkedPackage Data via API...\n');
    
    // Test 1: Get all quotes
    console.log('📡 Fetching quotes from API...');
    const response = await fetch('http://localhost:3003/api/admin/quotes?limit=20');
    
    if (!response.ok) {
      console.log(`❌ API returned status: ${response.status}`);
      const text = await response.text();
      console.log('Response:', text);
      return;
    }
    
    const data = await response.json();
    console.log(`✅ API Response Status: ${response.status}`);
    console.log(`Found ${data.data?.quotes?.length || 0} quotes\n`);
    
    if (!data.data || !data.data.quotes || data.data.quotes.length === 0) {
      console.log('⚠️  No quotes found in the system');
      return;
    }
    
    // Check for quotes with linkedPackage
    const quotesWithPackages = data.data.quotes.filter(q => q.linkedPackage);
    console.log(`📦 Found ${quotesWithPackages.length} quotes with linked packages\n`);
    
    if (quotesWithPackages.length === 0) {
      console.log('⚠️  No quotes with linked packages found');
      console.log('This might be why you\'re not seeing the error - try creating a quote with a super package first.\n');
      return;
    }
    
    // Analyze each quote with linkedPackage
    quotesWithPackages.forEach((quote, index) => {
      console.log(`\n--- Quote ${index + 1}: ${quote.quoteReference} ---`);
      console.log(`Lead: ${quote.leadName}`);
      console.log(`Hotel: ${quote.hotelName}`);
      console.log(`Status: ${quote.status}`);
      
      if (quote.linkedPackage) {
        console.log('\n📦 Linked Package Data:');
        console.log(`  Package Name: ${quote.linkedPackage.packageName || '❌ MISSING'}`);
        console.log(`  Package Version: ${quote.linkedPackage.packageVersion || '❌ MISSING'}`);
        
        // Check selectedTier - THIS IS WHERE THE ERROR OCCURS
        if (quote.linkedPackage.selectedTier) {
          if (quote.linkedPackage.selectedTier.tierLabel) {
            console.log(`  ✅ Selected Tier Label: ${quote.linkedPackage.selectedTier.tierLabel}`);
          } else {
            console.log(`  ⚠️  Selected Tier exists but tierLabel is missing!`);
          }
          console.log(`     Tier Index: ${quote.linkedPackage.selectedTier.tierIndex ?? '❌ MISSING'}`);
        } else {
          console.log(`  ❌ Selected Tier: COMPLETELY MISSING`);
          console.log(`     ⚠️  THIS WOULD CAUSE THE ERROR: "Cannot read properties of undefined (reading 'tierLabel')"`);
        }
        
        console.log(`  Selected Nights: ${quote.linkedPackage.selectedNights || '❌ MISSING'}`);
        console.log(`  Selected Period: ${quote.linkedPackage.selectedPeriod || '❌ MISSING'}`);
        console.log(`  Calculated Price: ${quote.linkedPackage.calculatedPrice ?? '❌ MISSING'}`);
        console.log(`  Price Was On Request: ${quote.linkedPackage.priceWasOnRequest || false}`);
      }
    });
    
    // Test 2: Check the specific enquiry from the URL
    console.log('\n\n🔍 Testing specific enquiry: 6900af7667f113682fb6b207');
    const enquiryResponse = await fetch('http://localhost:3003/api/admin/quotes?enquiryId=6900af7667f113682fb6b207');
    
    if (enquiryResponse.ok) {
      const enquiryData = await enquiryResponse.json();
      console.log(`Found ${enquiryData.data?.quotes?.length || 0} quotes for this enquiry`);
      
      if (enquiryData.data?.quotes?.length > 0) {
        enquiryData.data.quotes.forEach((quote, index) => {
          console.log(`\n  Quote ${index + 1}: ${quote.quoteReference}`);
          console.log(`    Lead: ${quote.leadName}`);
          console.log(`    Has LinkedPackage: ${quote.linkedPackage ? 'YES' : 'NO'}`);
          
          if (quote.linkedPackage) {
            console.log(`    Package: ${quote.linkedPackage.packageName}`);
            console.log(`    Tier Data: ${quote.linkedPackage.selectedTier ? 'EXISTS' : '❌ MISSING'}`);
            if (quote.linkedPackage.selectedTier) {
              console.log(`    Tier Label: ${quote.linkedPackage.selectedTier.tierLabel || '❌ MISSING'}`);
            }
          }
        });
      }
    } else {
      console.log(`❌ Failed to fetch enquiry quotes: ${enquiryResponse.status}`);
    }
    
    // Summary
    console.log('\n\n=== SUMMARY ===');
    const problematicQuotes = quotesWithPackages.filter(
      q => !q.linkedPackage.selectedTier || !q.linkedPackage.selectedTier.tierLabel
    );
    
    if (problematicQuotes.length > 0) {
      console.log(`⚠️  Found ${problematicQuotes.length} quotes with missing or incomplete selectedTier data`);
      console.log('These quotes would cause the error you reported.');
      console.log('\nProblematic quotes:');
      problematicQuotes.forEach(q => {
        console.log(`  - ${q.quoteReference}: ${q.leadName}`);
      });
      console.log('\n✅ The fix has been applied to handle these cases gracefully.');
    } else {
      console.log('✅ All quotes with linkedPackage have proper selectedTier data');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  }
}

console.log('Make sure your dev server is running on http://localhost:3003\n');
testQuoteLinkedPackage();
