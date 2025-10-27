#!/usr/bin/env node

/**
 * Check Registration Email Status
 * This script checks if emails were sent during registration
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function checkRegistrationEmails() {
  console.log('=== Registration Email Status Check ===\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');
    
    // Check recent users
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      contactEmail: String,
      company: String,
      abtaPtsNumber: String,
      createdAt: Date,
      registrationStatus: String,
      isApproved: Boolean
    }));
    
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name contactEmail company abtaPtsNumber createdAt registrationStatus isApproved');
    
    console.log('\n📋 Recent Registrations:');
    if (recentUsers.length === 0) {
      console.log('   No users found in database');
    } else {
      recentUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name}`);
        console.log(`   Email: ${user.contactEmail}`);
        console.log(`   Company: ${user.company}`);
        console.log(`   ABTA/PTS: ${user.abtaPtsNumber}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log(`   Status: ${user.registrationStatus || 'pending'}`);
        console.log(`   Approved: ${user.isApproved ? 'Yes' : 'No'}`);
      });
    }
    
    // Test email configuration
    console.log('\n📧 Email Configuration Test:');
    try {
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      
      console.log('   ✓ SMTP transporter created');
      console.log(`   Host: ${process.env.SMTP_HOST}`);
      console.log(`   Port: ${process.env.SMTP_PORT}`);
      console.log(`   User: ${process.env.SMTP_USER}`);
      
      // Verify SMTP connection
      await transporter.verify();
      console.log('   ✓ SMTP connection verified - emails can be sent');
      
    } catch (emailError) {
      console.log('   ✗ Email configuration issue:');
      console.log(`   Error: ${emailError.message}`);
    }
    
    // Check for admin users (needed for admin notifications)
    console.log('\n👤 Admin Users Check:');
    const adminUsers = await User.find({ role: 'admin' })
      .select('name contactEmail role');
    
    if (adminUsers.length === 0) {
      console.log('   ⚠️  No admin users found - admin notification emails cannot be sent');
      console.log('   💡 Create an admin user to receive registration notifications');
    } else {
      console.log(`   ✓ Found ${adminUsers.length} admin user(s):`);
      adminUsers.forEach(admin => {
        console.log(`   - ${admin.name} (${admin.contactEmail})`);
      });
    }
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
  
  console.log('\n=== Email Check Complete ===');
  console.log('\n💡 To check if emails were actually sent:');
  console.log('1. Check your terminal logs for email sending messages');
  console.log('2. Check the registered user\'s email inbox');
  console.log('3. Check admin email inboxes for notifications');
  console.log('4. Look for any email-related error messages in the server logs');
}

checkRegistrationEmails().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
