require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function testAPI() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Import models
    const SuperOfferPackage = require('./src/models/SuperOfferPackage').default;
    const Quote = require('./src/models/Quote').default;

    // Get a package ID
    const packages = await SuperOfferPackage.find().limit(1);
    if (packages.length === 0) {
      console.log('❌ No packages found');
      process.exit(1);
    }

    const packageId = packages[0]._id.toString();
    console.log(`Testing with package ID: ${packageId}`);
    console.log(`Package name: ${packages[0].name}\n`);

    // Try to fetch the package (simulating the API)
    console.log('1. Fetching package...');
    const packageData = await SuperOfferPackage.findById(packageId)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .lean();
    
    if (packageData) {
      console.log('✅ Package fetched successfully');
      console.log(`   Name: ${packageData.name}`);
      console.log(`   Status: ${packageData.status}`);
    } else {
      console.log('❌ Package not found');
    }

    // Try to count linked quotes
    console.log('\n2. Counting linked quotes...');
    try {
      const linkedQuotesCount = await Quote.countDocuments({
        'linkedPackage.packageId': packageId,
      });
      console.log(`✅ Linked quotes count: ${linkedQuotesCount}`);
    } catch (err) {
      console.log('❌ Error counting quotes:', err.message);
      console.log('   This might be the issue!');
    }

    console.log('\n3. Checking Quote collection...');
    const quoteCount = await Quote.countDocuments();
    console.log(`   Total quotes in database: ${quoteCount}`);

    if (quoteCount > 0) {
      const sampleQuote = await Quote.findOne().lean();
      console.log('\n   Sample quote structure:');
      console.log('   Has linkedPackage?', !!sampleQuote.linkedPackage);
      if (sampleQuote.linkedPackage) {
        console.log('   linkedPackage structure:', JSON.stringify(sampleQuote.linkedPackage, null, 2));
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
  }
}

testAPI();
