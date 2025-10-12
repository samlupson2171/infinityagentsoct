require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function testApiDirect() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('MONGODB_URI not found');
    return;
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('super_offer_packages');

    console.log('Testing database query that the API uses...\n');

    // Test 1: Get all packages (no filter)
    const allPackages = await collection.find({}).sort({ createdAt: -1 }).limit(10).toArray();
    console.log(`✅ Query with no filters: Found ${allPackages.length} packages`);
    allPackages.forEach(pkg => {
      console.log(`  - ${pkg.name} (${pkg.status}) - ID: ${pkg._id}`);
    });

    // Test 2: Get active packages only
    const activePackages = await collection.find({ status: 'active' }).sort({ createdAt: -1 }).limit(10).toArray();
    console.log(`\n✅ Query with status='active': Found ${activePackages.length} packages`);
    activePackages.forEach(pkg => {
      console.log(`  - ${pkg.name} (${pkg.status}) - ID: ${pkg._id}`);
    });

    // Test 3: Check if there are any packages with status other than active
    const inactiveCount = await collection.countDocuments({ status: 'inactive' });
    const deletedCount = await collection.countDocuments({ status: 'deleted' });
    console.log(`\n📊 Status breakdown:`);
    console.log(`  - Active: ${activePackages.length}`);
    console.log(`  - Inactive: ${inactiveCount}`);
    console.log(`  - Deleted: ${deletedCount}`);

    // Test 4: Check the exact query the API would use
    const query = {};
    const apiResult = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(0)
      .limit(10)
      .toArray();
    
    console.log(`\n✅ Exact API query simulation: Found ${apiResult.length} packages`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

testApiDirect();
