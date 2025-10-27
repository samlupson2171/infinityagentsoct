#!/usr/bin/env node

/**
 * Debug Registration Endpoint
 * This script simulates the registration flow to identify the exact error
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function debugRegistration() {
  console.log('=== Registration Endpoint Debug ===\n');
  
  // Step 1: Check environment variables
  console.log('1. Environment Variables:');
  const requiredEnvVars = [
    'MONGODB_URI',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'EMAIL_FROM_ADDRESS',
    'NEXTAUTH_URL'
  ];
  
  let envOk = true;
  requiredEnvVars.forEach(varName => {
    const exists = !!process.env[varName];
    console.log(`   ${exists ? '✓' : '✗'} ${varName}`);
    if (!exists) envOk = false;
  });
  
  if (!envOk) {
    console.log('\n❌ Missing required environment variables');
    process.exit(1);
  }
  
  // Step 2: Test MongoDB connection
  console.log('\n2. MongoDB Connection:');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('   ✓ Connected successfully');
    
    // Test User model
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      contactEmail: { type: String, unique: true },
      company: String,
      password: String,
      abtaPtsNumber: String,
      phoneNumber: String,
      websiteAddress: String,
      isApproved: Boolean,
      role: String,
      registrationStatus: String,
      createdAt: Date,
      updatedAt: Date
    }));
    
    console.log('   ✓ User model loaded');
    
  } catch (error) {
    console.log(`   ✗ Connection failed: ${error.message}`);
    process.exit(1);
  }
  
  // Step 3: Test email configuration
  console.log('\n3. Email Configuration:');
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
    
    console.log('   ✓ Transporter created');
    
    // Verify connection
    await transporter.verify();
    console.log('   ✓ SMTP connection verified');
    
  } catch (error) {
    console.log(`   ✗ Email config failed: ${error.message}`);
    console.log(`   Error details: ${error.stack}`);
  }
  
  // Step 4: Test validation schema
  console.log('\n4. Validation Schema:');
  try {
    const { z } = require('zod');
    
    const testSchema = z.object({
      name: z.string().min(2),
      contactEmail: z.string().email(),
      company: z.string().min(2),
      password: z.string().min(8),
      confirmPassword: z.string().optional(),
      abtaPtsNumber: z.string(),
      phoneNumber: z.string(),
      websiteAddress: z.string().optional(),
      consortia: z.string().optional(),
    });
    
    const testData = {
      name: "Test User",
      contactEmail: "test@example.com",
      company: "Test Company",
      password: "TestPass123",
      confirmPassword: "TestPass123",
      abtaPtsNumber: "ABTA12345",
      phoneNumber: "+44 1234567890",
      websiteAddress: "https://test.com",
      consortia: ""
    };
    
    testSchema.parse(testData);
    console.log('   ✓ Validation schema works');
    
  } catch (error) {
    console.log(`   ✗ Validation failed: ${error.message}`);
  }
  
  // Step 5: Check for existing test user
  console.log('\n5. Database Query Test:');
  try {
    const User = mongoose.model('User');
    const existingUser = await User.findOne({ contactEmail: 'test@example.com' });
    
    if (existingUser) {
      console.log('   ⚠ Test user already exists (this is OK for testing)');
    } else {
      console.log('   ✓ No conflicting test user found');
    }
    
  } catch (error) {
    console.log(`   ✗ Database query failed: ${error.message}`);
  }
  
  await mongoose.disconnect();
  console.log('\n=== Debug Complete ===');
  console.log('\nIf all checks passed, the issue might be:');
  console.log('1. A runtime error in the API route');
  console.log('2. An issue with the email sending during registration');
  console.log('3. A problem with the User model schema');
  console.log('\nCheck your terminal where "npm run dev" is running for the actual error message.');
}

debugRegistration().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
