require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function testPackageAPI() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB\n');
    
    const db = client.db();
    const collection = db.collection('superofferpackages');
    
    // Check what packages exist
    const allPackages = await collection.find({}).toArray();
    console.log(`Total packages in database: ${allPackages.length}`);
    
    // Check active packages
    const activePackages = await collection.find({ status: 'active' }).toArray();
    console.log(`Active packages: ${activePackages.length}\n`);
    
    if (activePackages.length > 0) {
      console.log('Active packages:');
      activePackages.forEach((pkg, idx) => {
        console.log(`${idx + 1}. ${pkg.name}`);
        console.log(`   ID: ${pkg._id}`);
        console.log(`   Status: ${pkg.status}`);
        console.log(`   Destination: ${pkg.destination}`);
        console.log(`   Resort: ${pkg.resort}`);
        console.log(`   Group Size Tiers: ${pkg.groupSizeTiers?.length || 0}`);
        console.log(`   Duration Options: ${pkg.durationOptions?.length || 0}`);
        console.log('');
      });
    } else {
      console.log('No active packages found!');
      console.log('\nAll packages (any status):');
      allPackages.forEach((pkg, idx) => {
        console.log(`${idx + 1}. ${pkg.name} - Status: ${pkg.status}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

testPackageAPI();
