require('dotenv').config({ path: '.env.local' });
const { MongoClient, ObjectId } = require('mongodb');

async function checkPackageDetails() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB\n');
    
    const db = client.db();
    const collection = db.collection('super_offer_packages');
    
    // Get the package
    const pkg = await collection.findOne({});
    
    if (!pkg) {
      console.log('No package found!');
      return;
    }
    
    console.log('Package Details:');
    console.log('================');
    console.log('ID:', pkg._id);
    console.log('Name:', pkg.name);
    console.log('Status:', pkg.status);
    console.log('Destination:', pkg.destination);
    console.log('Resort:', pkg.resort);
    console.log('Currency:', pkg.currency);
    console.log('\nGroup Size Tiers:', pkg.groupSizeTiers?.length || 0);
    if (pkg.groupSizeTiers) {
      pkg.groupSizeTiers.forEach((tier, idx) => {
        console.log(`  ${idx + 1}. ${tier.label} (${tier.minPeople}-${tier.maxPeople})`);
      });
    }
    console.log('\nDuration Options:', pkg.durationOptions);
    console.log('\nPricing Matrix Entries:', pkg.pricingMatrix?.length || 0);
    if (pkg.pricingMatrix && pkg.pricingMatrix.length > 0) {
      console.log('First pricing entry:');
      const first = pkg.pricingMatrix[0];
      console.log(`  Period: ${first.period}`);
      console.log(`  Type: ${first.periodType}`);
      console.log(`  Prices: ${first.prices?.length || 0}`);
    }
    console.log('\nInclusions:', pkg.inclusions?.length || 0);
    console.log('Accommodation Examples:', pkg.accommodationExamples?.length || 0);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkPackageDetails();
