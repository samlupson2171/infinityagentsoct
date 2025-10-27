#!/usr/bin/env node

/**
 * Test Email Sending
 * This script tests if the email system is working
 */

require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

async function testEmailSending() {
  console.log('=== Email Sending Test ===\n');
  
  try {
    console.log('📧 Email Configuration:');
    console.log(`   Host: ${process.env.SMTP_HOST}`);
    console.log(`   Port: ${process.env.SMTP_PORT}`);
    console.log(`   User: ${process.env.SMTP_USER}`);
    console.log(`   Pass: ${process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NOT SET'}`);
    
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('\n❌ Email configuration is incomplete!');
      console.log('Missing required environment variables.');
      return;
    }
    
    console.log('\n🔧 Creating transporter...');
    const port = parseInt(process.env.SMTP_PORT || '587');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    console.log('✓ Transporter created');
    
    console.log('\n🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✓ SMTP connection verified successfully!');
    
    console.log('\n📨 Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Send to yourself
      subject: 'Test Email - Registration System',
      text: 'This is a test email from the registration system.',
      html: '<p>This is a <strong>test email</strong> from the registration system.</p>',
    });
    
    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    
    console.log('\n✅ Email system is working correctly!');
    console.log('Check your inbox at:', process.env.SMTP_USER);
    
  } catch (error) {
    console.error('\n❌ Email test failed:');
    console.error('   Error:', error.message);
    if (error.code) {
      console.error('   Code:', error.code);
    }
    if (error.command) {
      console.error('   Command:', error.command);
    }
  }
}

testEmailSending().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
