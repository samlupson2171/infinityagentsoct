const { MongoClient } = require('mongodb');

async function fixUserApproval() {
  const uri = 'mongodb+srv://samlupson:tWWwvrMucnxW0maj@infinagent.1pgp6zc.mongodb.net/infinityweekends?retryWrites=true&w=majority';
  
  console.log('🔧 Fixing User Approval Status...\n');
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('infinityweekends');
    const usersCollection = db.collection('users');
    
    // Get all admin users
    const adminUsers = await usersCollection.find({ role: 'admin' }).toArray();
    
    console.log(`📊 Found ${adminUsers.length} admin users\n`);
    
    // Update each admin user to set isApproved: true
    for (const user of adminUsers) {
      console.log(`Updating user: ${user.name || user.email || user._id}`);
      console.log(`   Current isApproved: ${user.isApproved}`);
      
      const result = await usersCollection.updateOne(
        { _id: user._id },
        { 
          $set: { 
            isApproved: true,
            status: 'approved'  // Also set status for consistency
          } 
        }
      );
      
      console.log(`   ✅ Updated (matched: ${result.matchedCount}, modified: ${result.modifiedCount})\n`);
    }
    
    // Verify the changes
    console.log('🔍 Verifying changes...\n');
    const updatedUsers = await usersCollection.find({ role: 'admin' }).toArray();
    
    updatedUsers.forEach(user => {
      console.log(`${user.name || user.email || user._id}`);
      console.log(`   isApproved: ${user.isApproved}`);
      console.log(`   status: ${user.status}`);
      console.log('');
    });
    
    const approvedCount = updatedUsers.filter(u => u.isApproved === true).length;
    console.log(`✅ ${approvedCount} out of ${updatedUsers.length} admin users are now approved`);
    
    if (approvedCount === updatedUsers.length) {
      console.log('\n🎉 All admin users are now approved!');
      console.log('   You should now be able to see destinations in the admin panel.');
      console.log('   Please log out and log back in for the changes to take effect.');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.close();
  }
}

fixUserApproval();
