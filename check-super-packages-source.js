// Check where super packages data is coming from
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkSuperPackages() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db();
    
    // List all collections
    console.log('📋 All collections in database:');
    const collections = await db.listCollections().toArray();
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    // Check for super package related collections
    console.log('\n🔍 Checking for super package collections:');
    const superPackageCollections = collections.filter(col => 
      col.name.toLowerCase().includes('super') || 
      col.name.toLowerCase().includes('package')
    );
    
    if (superPackageCollections.length === 0) {
      console.log('   ❌ No super package collections found');
    } else {
      for (const col of superPackageCollections) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`   ✓ ${col.name}: ${count} documents`);
        
        if (count > 0) {
          console.log(`\n   Sample document from ${col.name}:`);
          const sample = await db.collection(col.name).findOne();
          console.log(JSON.stringify(sample, null, 2));
        }
      }
    }
    
    // Check the expected collection specifically
    console.log('\n🎯 Checking expected collection "superofferpackages":');
    const expectedCount = await db.collection('superofferpackages').countDocuments();
    console.log(`   Documents: ${expectedCount}`);
    
    if (expectedCount > 0) {
      const docs = await db.collection('superofferpackages').find({}).toArray();
      console.log('\n   All documents:');
      docs.forEach((doc, i) => {
        console.log(`\n   ${i + 1}. ${doc.name}`);
        console.log(`      ID: ${doc._id}`);
        console.log(`      Status: ${doc.status}`);
        console.log(`      Destination: ${doc.destination}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

checkSuperPackages();
