const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

console.log('=== Environment Variables Check ===');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✓ Set' : '✗ Missing');
console.log('SMTP_HOST:', process.env.SMTP_HOST ? '✓ Set' : '✗ Missing');
console.log('SMTP_PORT:', process.env.SMTP_PORT ? '✓ Set' : '✗ Missing');
console.log('SMTP_USER:', process.env.SMTP_USER ? '✓ Set' : '✗ Missing');
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✓ Set' : '✗ Missing');
console.log('EMAIL_FROM_NAME:', process.env.EMAIL_FROM_NAME ? '✓ Set' : '✗ Missing');
console.log('EMAIL_FROM_ADDRESS:', process.env.EMAIL_FROM_ADDRESS ? '✓ Set' : '✗ Missing');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL ? '✓ Set' : '✗ Missing');
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✓ Set' : '✗ Missing');

// Test MongoDB connection
async function testConnection() {
  try {
    console.log('\n=== Testing MongoDB Connection ===');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB connection successful');
    
    // Test User model
    const User = require('./src/models/User').default;
    console.log('✓ User model loaded');
    
    await mongoose.disconnect();
    console.log('✓ MongoDB disconnected');
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

testConnection();
