require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

async function listCollections() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB\n');
    
    const db = client.db();
    const collections = await db.listCollections().toArray();
    
    console.log(`Found ${collections.length} collections:\n`);
    
    for (const coll of collections) {
      console.log(`- ${coll.name}`);
      const count = await db.collection(coll.name).countDocuments();
      console.log(`  Documents: ${count}`);
      
      if (coll.name.toLowerCase().includes('super') || coll.name.toLowerCase().includes('package')) {
        const sample = await db.collection(coll.name).findOne({});
        if (sample) {
          console.log(`  Sample ID: ${sample._id}`);
          if (sample.name) console.log(`  Sample name: ${sample.name}`);
        }
      }
      console.log('');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
}

listCollections();
