// Script to activate a super package
// Usage: node activate-package.js <package-id>

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function activatePackage(packageId) {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const collection = db.collection('superofferpackages');
    
    // If no package ID provided, show all packages
    if (!packageId) {
      console.log('\nAvailable packages:');
      const packages = await collection.find({}).toArray();
      
      if (packages.length === 0) {
        console.log('  No packages found in database');
      } else {
        packages.forEach((pkg, index) => {
          console.log(`\n${index + 1}. ${pkg.name}`);
          console.log(`   ID: ${pkg._id}`);
          console.log(`   Destination: ${pkg.destination}`);
          console.log(`   Resort: ${pkg.resort}`);
          console.log(`   Status: ${pkg.status}`);
        });
      }
      console.log('\nUsage: node activate-package.js <package-id>');
      return;
    }
    
    // Activate the specified package
    let query;
    try {
      // Try as ObjectId first
      query = { _id: new ObjectId(packageId) };
    } catch (e) {
      // If not valid ObjectId, try as string
      query = { _id: packageId };
    }
    
    const result = await collection.updateOne(
      query,
      { 
        $set: { 
          status: 'active',
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      console.log(`❌ Package with ID ${packageId} not found`);
      console.log('\nTip: Run without arguments to see all package IDs');
    } else if (result.modifiedCount > 0) {
      console.log(`✅ Package ${packageId} has been activated`);
      
      // Show updated package
      const updated = await collection.findOne(query);
      console.log('\nUpdated package:');
      console.log(`  Name: ${updated.name}`);
      console.log(`  Destination: ${updated.destination}`);
      console.log(`  Status: ${updated.status}`);
    } else {
      console.log(`ℹ️  Package ${packageId} was already active`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
}

const packageId = process.argv[2];
activatePackage(packageId);
