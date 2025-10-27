#!/usr/bin/env node

/**
 * Send Approval Email Now
 * Manually send an approval email to agent@resort-experts.com
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function sendApprovalEmail() {
  console.log('=== Sending Approval Email ===\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');
    
    // Find the user
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      contactEmail: String,
      company: String,
      consortia: String,
      _id: mongoose.Schema.Types.ObjectId
    }));
    
    const user = await User.findOne({ contactEmail: 'agent@resort-experts.com' });
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }
    
    console.log(`Found user: ${user.name} (${user.contactEmail})\n`);
    
    // Import and send email
    const { sendApprovalNotificationEmail } = require('./src/lib/email.ts');
    
    console.log('📧 Sending approval notification email...\n');
    
    await sendApprovalNotificationEmail({
      userName: user.name,
      userEmail: user.contactEmail,
      companyName: user.company,
      consortia: user.consortia,
      userId: user._id.toString()
    });
    
    console.log('✅ Approval email sent successfully!');
    console.log(`\n📬 Check the inbox at: ${user.contactEmail}`);
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('\n❌ Failed to send approval email:');
    console.error('   Error:', error.message);
    if (error.stack) {
      console.error('\n   Stack:', error.stack);
    }
    process.exit(1);
  }
}

sendApprovalEmail().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
