/**
 * Test GoDaddy SMTP Connection
 * This script tests the SMTP credentials to identify the authentication issue
 */

const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testSMTPConnection() {
  console.log('🔍 Testing GoDaddy SMTP Connection...\n');
  
  console.log('Configuration:');
  console.log(`  Host: ${process.env.SMTP_HOST}`);
  console.log(`  Port: ${process.env.SMTP_PORT}`);
  console.log(`  User: ${process.env.SMTP_USER}`);
  console.log(`  Secure: ${process.env.SMTP_SECURE}`);
  console.log(`  Password: ${process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NOT SET'}\n`);

  // Create transporter
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    debug: true, // Enable debug output
    logger: true, // Log to console
  });

  try {
    console.log('📡 Attempting to verify SMTP connection...\n');
    await transporter.verify();
    console.log('\n✅ SMTP Connection Successful!');
    console.log('The credentials are valid and the server is reachable.\n');
    
    // Try sending a test email
    console.log('📧 Attempting to send a test email...\n');
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: process.env.SMTP_USER, // Send to yourself
      subject: 'SMTP Test - Infinity Agents',
      text: 'This is a test email to verify SMTP configuration.',
      html: '<p>This is a test email to verify SMTP configuration.</p>',
    });
    
    console.log('✅ Test email sent successfully!');
    console.log(`Message ID: ${info.messageId}`);
    console.log(`Response: ${info.response}\n`);
    
  } catch (error) {
    console.error('\n❌ SMTP Connection Failed!\n');
    console.error('Error Details:');
    console.error(`  Type: ${error.name}`);
    console.error(`  Message: ${error.message}`);
    
    if (error.code) {
      console.error(`  Code: ${error.code}`);
    }
    
    if (error.response) {
      console.error(`  Server Response: ${error.response}`);
    }
    
    if (error.responseCode) {
      console.error(`  Response Code: ${error.responseCode}`);
    }
    
    console.error('\n📋 Troubleshooting Steps:');
    
    if (error.message.includes('535') || error.message.includes('Authentication')) {
      console.error('  1. ❌ Authentication Failed - Check your credentials');
      console.error('     - Verify the email address is correct');
      console.error('     - Verify the password is correct');
      console.error('     - Check if the account requires app-specific passwords');
      console.error('     - Ensure SMTP is enabled for this email account in GoDaddy');
    }
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('  2. ❌ Connection Refused');
      console.error('     - Check if the SMTP host and port are correct');
      console.error('     - Verify firewall settings');
    }
    
    if (error.message.includes('ETIMEDOUT')) {
      console.error('  3. ❌ Connection Timeout');
      console.error('     - Check your internet connection');
      console.error('     - Verify the SMTP server is accessible');
    }
    
    console.error('\n💡 GoDaddy SMTP Settings:');
    console.error('  - Host: smtpout.secureserver.net');
    console.error('  - Port: 465 (SSL) or 587 (TLS)');
    console.error('  - Secure: true for port 465, false for port 587');
    console.error('  - Authentication: Required');
    console.error('\n  📖 GoDaddy Email Help: https://www.godaddy.com/help/server-and-port-settings-for-workspace-email-6949');
    
    console.error('\n');
    process.exit(1);
  }
}

testSMTPConnection();
