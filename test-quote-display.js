/**
 * Test script to verify quote display with various linkedPackage scenarios
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Import Quote model directly
const Quote = require('./src/models/Quote').default;

async function testQuoteDisplay() {
  try {
    console.log('🔍 Testing Quote Display with LinkedPackage data...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find quotes with linkedPackage
    const quotesWithPackages = await Quote.find({
      linkedPackage: { $exists: true },
    })
      .populate('enquiryId', 'leadName agentEmail')
      .populate('createdBy', 'name email')
      .limit(10)
      .lean();

    console.log(`Found ${quotesWithPackages.length} quotes with linked packages\n`);

    // Test each quote for potential issues
    quotesWithPackages.forEach((quote, index) => {
      console.log(`\n--- Quote ${index + 1}: ${quote.quoteReference || quote._id} ---`);
      console.log(`Lead: ${quote.leadName}`);
      console.log(`Hotel: ${quote.hotelName}`);
      
      if (quote.linkedPackage) {
        console.log('\n📦 Linked Package Data:');
        console.log(`  Package Name: ${quote.linkedPackage.packageName || 'MISSING'}`);
        console.log(`  Package Version: ${quote.linkedPackage.packageVersion || 'MISSING'}`);
        
        // Check selectedTier
        if (quote.linkedPackage.selectedTier) {
          console.log(`  ✅ Selected Tier: ${quote.linkedPackage.selectedTier.tierLabel || 'MISSING LABEL'}`);
          console.log(`     Tier Index: ${quote.linkedPackage.selectedTier.tierIndex ?? 'MISSING'}`);
        } else {
          console.log(`  ❌ Selected Tier: MISSING (This would cause an error!)`);
        }
        
        console.log(`  Selected Nights: ${quote.linkedPackage.selectedNights || 'MISSING'}`);
        console.log(`  Selected Period: ${quote.linkedPackage.selectedPeriod || 'MISSING'}`);
        console.log(`  Calculated Price: ${quote.linkedPackage.calculatedPrice || 'MISSING'}`);
        console.log(`  Price Was On Request: ${quote.linkedPackage.priceWasOnRequest || false}`);
      } else {
        console.log('  ❌ No linkedPackage data');
      }
    });

    // Find quotes with missing selectedTier
    const quotesWithMissingTier = quotesWithPackages.filter(
      (q) => q.linkedPackage && !q.linkedPackage.selectedTier
    );

    if (quotesWithMissingTier.length > 0) {
      console.log(`\n\n⚠️  WARNING: Found ${quotesWithMissingTier.length} quotes with missing selectedTier data!`);
      console.log('These quotes would have caused the error you reported.\n');
      
      quotesWithMissingTier.forEach((quote) => {
        console.log(`  - Quote ${quote.quoteReference || quote._id}: ${quote.leadName}`);
      });
    } else {
      console.log('\n\n✅ All quotes with linkedPackage have proper selectedTier data');
    }

    // Test the specific enquiry from the URL
    const enquiryId = '6900af7667f113682fb6b207';
    console.log(`\n\n🔍 Checking quotes for enquiry: ${enquiryId}`);
    
    const enquiryQuotes = await Quote.find({ enquiryId })
      .populate('enquiryId', 'leadName agentEmail')
      .populate('createdBy', 'name email')
      .lean();

    console.log(`Found ${enquiryQuotes.length} quotes for this enquiry\n`);

    enquiryQuotes.forEach((quote, index) => {
      console.log(`\nQuote ${index + 1}:`);
      console.log(`  Reference: ${quote.quoteReference || quote._id}`);
      console.log(`  Lead: ${quote.leadName}`);
      console.log(`  Status: ${quote.status}`);
      console.log(`  Total Price: ${quote.currency} ${quote.totalPrice}`);
      
      if (quote.linkedPackage) {
        console.log(`  📦 Has Linked Package: ${quote.linkedPackage.packageName}`);
        console.log(`     Tier: ${quote.linkedPackage.selectedTier?.tierLabel || '❌ MISSING'}`);
      } else {
        console.log(`  No linked package`);
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n\n✅ Disconnected from MongoDB');
  }
}

testQuoteDisplay();
