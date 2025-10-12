const { MongoClient } = require('mongodb');

require('dotenv').config({ path: '.env.local' });
const uri = process.env.MONGODB_URI;

async function listPackages() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB\n');
    
    const db = client.db();
    const collection = db.collection('superofferpackages');
    
    const packages = await collection.find({}).toArray();
    
    if (packages.length === 0) {
      console.log('No super packages found in database.');
      console.log('\nYou need to create a package first!');
      console.log('Go to: http://localhost:3004/admin/super-packages');
      console.log('And click "Create New Package"');
    } else {
      console.log(`Found ${packages.length} package(s):\n`);
      packages.forEach((pkg, index) => {
        console.log(`${index + 1}. ${pkg.name}`);
        console.log(`   ID: ${pkg._id}`);
        console.log(`   Destination: ${pkg.destination}`);
        console.log(`   Status: ${pkg.status}`);
        console.log(`   Edit URL: http://localhost:3004/admin/super-packages/${pkg._id}/edit`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
}

listPackages();
