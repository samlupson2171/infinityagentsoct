require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

async function listAllPackages() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB\n');
    
    const db = client.db();
    const collection = db.collection('super_offer_packages');
    
    const packages = await collection.find({}).toArray();
    
    console.log(`Found ${packages.length} super packages:\n`);
    
    packages.forEach((pkg, index) => {
      console.log(`${index + 1}. ${pkg.name}`);
      console.log(`   ID: ${pkg._id}`);
      console.log(`   Destination: ${pkg.destination}`);
      console.log(`   Resort: ${pkg.resort || 'N/A'}`);
      console.log(`   Status: ${pkg.status}`);
      console.log(`   View URL: http://localhost:3004/admin/super-packages/${pkg._id}`);
      console.log(`   Edit URL: http://localhost:3004/admin/super-packages/${pkg._id}/edit`);
      console.log('');
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
}

listAllPackages();
