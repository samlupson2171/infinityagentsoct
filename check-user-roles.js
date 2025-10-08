const { MongoClient } = require('mongodb');

async function checkUserRoles() {
  const uri = 'mongodb+srv://samlupson:tWWwvrMucnxW0maj@infinagent.1pgp6zc.mongodb.net/infinityweekends?retryWrites=true&w=majority';
  
  console.log('👤 Checking User Roles...\n');
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('infinityweekends');
    const usersCollection = db.collection('users');
    
    const users = await usersCollection.find({}).toArray();
    
    console.log(`📊 Total users: ${users.length}\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'Unnamed'}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log(`   Role: ${user.role || 'N/A'}`);
      console.log(`   Status: ${user.status || 'N/A'}`);
      console.log(`   _id: ${user._id}`);
      console.log('');
    });
    
    const adminUsers = users.filter(u => u.role === 'admin');
    const approvedAdmins = users.filter(u => u.role === 'admin' && u.status === 'approved');
    
    console.log(`✅ Admin users: ${adminUsers.length}`);
    console.log(`✅ Approved admin users: ${approvedAdmins.length}`);
    
    if (approvedAdmins.length === 0) {
      console.log('\n⚠️  WARNING: No approved admin users found!');
      console.log('   You need an approved admin user to access the destinations.');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

checkUserRoles();
