require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function checkPackage() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('MONGODB_URI not found in environment variables');
    return;
  }
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const collection = db.collection('super_offer_packages');

    // Find the package we just created
    const package = await collection.findOne({ name: 'Albufeira 2026' });

    if (package) {
      console.log('\n✅ Package found in database:');
      console.log('ID:', package._id);
      console.log('Name:', package.name);
      console.log('Destination:', package.destination);
      console.log('Status:', package.status);
      console.log('Created:', package.createdAt);
      console.log('\nFull package data:');
      console.log(JSON.stringify(package, null, 2));
    } else {
      console.log('\n❌ Package NOT found in database');
    }

    // Count total packages
    const total = await collection.countDocuments();
    console.log(`\nTotal packages in database: ${total}`);

    // List all packages
    const allPackages = await collection.find({}).toArray();
    console.log('\nAll packages:');
    allPackages.forEach(pkg => {
      console.log(`- ${pkg.name} (${pkg.status}) - ${pkg.destination}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkPackage();
