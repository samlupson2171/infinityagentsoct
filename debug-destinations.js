const { MongoClient } = require('mongodb');

async function debugDestinations() {
  const uri = 'mongodb+srv://samlupson:tWWwvrMucnxW0maj@infinagent.1pgp6zc.mongodb.net/infinityweekends?retryWrites=true&w=majority';
  
  console.log('🔍 Debugging Destinations Issue...\n');
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('infinityweekends');
    
    // Check destinations collection
    console.log('📊 Checking destinations collection...');
    const destinationsCollection = db.collection('destinations');
    
    const count = await destinationsCollection.countDocuments();
    console.log(`   Total destinations: ${count}`);
    
    if (count > 0) {
      console.log('\n📋 Destination documents:');
      const destinations = await destinationsCollection.find({}).toArray();
      
      destinations.forEach((dest, index) => {
        console.log(`\n   ${index + 1}. ${dest.name || 'Unnamed'}`);
        console.log(`      _id: ${dest._id}`);
        console.log(`      slug: ${dest.slug || 'N/A'}`);
        console.log(`      country: ${dest.country || 'N/A'}`);
        console.log(`      region: ${dest.region || 'N/A'}`);
        console.log(`      status: ${dest.status || 'N/A'}`);
        console.log(`      createdBy: ${dest.createdBy || 'N/A'}`);
        console.log(`      createdAt: ${dest.createdAt || 'N/A'}`);
        console.log(`      updatedAt: ${dest.updatedAt || 'N/A'}`);
      });
      
      // Check for any query issues
      console.log('\n🔍 Testing various queries...');
      
      // Test 1: Find all with no filters
      const allDests = await destinationsCollection.find({}).toArray();
      console.log(`   Query {} returned: ${allDests.length} documents`);
      
      // Test 2: Find with status filter
      const draftDests = await destinationsCollection.find({ status: 'draft' }).toArray();
      console.log(`   Query {status: 'draft'} returned: ${draftDests.length} documents`);
      
      const publishedDests = await destinationsCollection.find({ status: 'published' }).toArray();
      console.log(`   Query {status: 'published'} returned: ${publishedDests.length} documents`);
      
      // Test 3: Check if createdBy references exist
      console.log('\n👤 Checking user references...');
      const usersCollection = db.collection('users');
      const userCount = await usersCollection.countDocuments();
      console.log(`   Total users: ${userCount}`);
      
      for (const dest of destinations) {
        if (dest.createdBy) {
          const user = await usersCollection.findOne({ _id: dest.createdBy });
          if (user) {
            console.log(`   ✅ User found for destination "${dest.name}": ${user.name} (${user.email})`);
          } else {
            console.log(`   ⚠️  User NOT found for destination "${dest.name}" (createdBy: ${dest.createdBy})`);
          }
        } else {
          console.log(`   ⚠️  Destination "${dest.name}" has no createdBy field`);
        }
      }
      
    } else {
      console.log('   ⚠️  No destinations found in database!');
    }
    
    // Check indexes
    console.log('\n📑 Checking indexes...');
    const indexes = await destinationsCollection.indexes();
    console.log('   Indexes:', JSON.stringify(indexes, null, 2));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.close();
  }
}

debugDestinations();
