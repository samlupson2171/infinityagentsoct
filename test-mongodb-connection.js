const { MongoClient } = require('mongodb');

async function testMongoDBConnection() {
  // The URI you want to test
  const uri = 'mongodb+srv://samlupson:tWWwvrMucnxW0maj@infinagent.1pgp6zc.mongodb.net/infinityweekends?retryWrites=true&w=majority';
  
  console.log('🔍 Testing MongoDB Connection...');
  console.log('📍 Cluster: infinagent.1pgp6zc.mongodb.net');
  console.log('🗄️  Database: infinityweekends');
  console.log('');
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  });
  
  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log('');
    
    // Get database
    const db = client.db('infinityweekends');
    console.log(`📊 Database: ${db.databaseName}`);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`📁 Collections found: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('');
      console.log('📋 Collection list:');
      collections.forEach((col, index) => {
        console.log(`   ${index + 1}. ${col.name}`);
      });
      
      // Get document counts for each collection
      console.log('');
      console.log('📊 Document counts:');
      for (const col of collections) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`   ${col.name}: ${count} documents`);
      }
    } else {
      console.log('⚠️  No collections found in database');
    }
    
    // Test write operation
    console.log('');
    console.log('🧪 Testing write operation...');
    const testCollection = db.collection('_connection_test');
    const testDoc = {
      test: true,
      timestamp: new Date(),
      message: 'Connection test from local build'
    };
    
    const insertResult = await testCollection.insertOne(testDoc);
    console.log('✅ Write test successful! Document ID:', insertResult.insertedId);
    
    // Clean up test document
    await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('🧹 Test document cleaned up');
    
    console.log('');
    console.log('✨ All tests passed! Your local build can access MongoDB.');
    
  } catch (error) {
    console.error('');
    console.error('❌ MongoDB connection failed!');
    console.error('');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('');
    
    if (error.message.includes('authentication failed') || error.message.includes('auth')) {
      console.log('🔐 Authentication Issue:');
      console.log('   - Username or password may be incorrect');
      console.log('   - Check MongoDB Atlas user credentials');
      console.log('   - Ensure user has read/write permissions on "infinityweekends" database');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('network')) {
      console.log('🌐 Network Issue:');
      console.log('   - Check your internet connection');
      console.log('   - Verify MongoDB Atlas cluster is running');
      console.log('   - Check if your IP address is whitelisted in MongoDB Atlas');
      console.log('   - Go to: Network Access in MongoDB Atlas dashboard');
    } else if (error.message.includes('timeout')) {
      console.log('⏱️  Timeout Issue:');
      console.log('   - Connection is taking too long');
      console.log('   - Check firewall settings');
      console.log('   - Verify cluster is accessible');
    } else {
      console.log('💡 Suggestions:');
      console.log('   - Check MongoDB Atlas dashboard for cluster status');
      console.log('   - Verify connection string format');
      console.log('   - Check MongoDB Atlas logs');
    }
    
    console.error('');
    console.error('Full error details:');
    console.error(error);
    
  } finally {
    await client.close();
    console.log('');
    console.log('🔌 Connection closed');
  }
}

// Run the test
testMongoDBConnection().catch(console.error);
