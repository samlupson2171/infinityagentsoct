const { MongoClient, ObjectId } = require('mongodb');

const packageId = '68e99462fc8e6ba930233d03';
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/infinity-weekends';

async function testPackageExists() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const collection = db.collection('superofferpackages');
    
    console.log('Looking for package:', packageId);
    
    const pkg = await collection.findOne({ _id: new ObjectId(packageId) });
    
    if (pkg) {
      console.log('\n✓ Package found!');
      console.log('Name:', pkg.name);
      console.log('Destination:', pkg.destination);
      console.log('Status:', pkg.status);
    } else {
      console.log('\n✗ Package NOT found');
      
      // List all packages
      const allPackages = await collection.find({}).limit(5).toArray();
      console.log('\nAvailable packages:');
      allPackages.forEach(p => {
        console.log(`  - ${p._id}: ${p.name}`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
}

testPackageExists();
