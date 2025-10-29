/**
 * Simple GoDaddy SMTP Test
 */

require('dotenv').config({ path: '.env.local' });

async function testSMTP() {
  console.log('🔍 Testing GoDaddy SMTP Connection...\n');
  
  console.log('Configuration:');
  console.log(`  Host: ${process.env.SMTP_HOST}`);
  console.log(`  Port: ${process.env.SMTP_PORT}`);
  console.log(`  User: ${process.env.SMTP_USER}`);
  console.log(`  Secure: ${process.env.SMTP_SECURE}`);
  console.log(`  Password: ${process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NOT SET'}\n`);

  // Require nodemailer
  const nodemailer = require('nodemailer');
  
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    debug: true,
    logger: true,
  });

  try {
    console.log('📡 Verifying SMTP connection...\n');
    await transporter.verify();
    console.log('\n✅ SMTP Connection Successful!');
    console.log('The credentials are valid and the server is reachable.\n');
    
    // Try sending a test email
    console.log('📧 Sending test email...\n');
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: process.env.SMTP_USER,
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
    console.error(`  Message: ${error.message}`);
    
    if (error.code) {
      console.error(`  Code: ${error.code}`);
    }
    
    if (error.response) {
      console.error(`  Server Response: ${error.response}`);
    }
    
    console.error('\n📋 Troubleshooting:');
    
    if (error.message.includes('535') || error.message.includes('Authentication')) {
      console.error('  ❌ Authentication Failed');
      console.error('     Possible causes:');
      console.error('     1. Incorrect password');
      console.error('     2. Account requires app-specific password');
      console.error('     3. SMTP not enabled in GoDaddy account');
      console.error('     4. Account locked or suspended');
      console.error('\n  📖 Check: https://www.godaddy.com/help/server-and-port-settings-for-workspace-email-6949');
    }
    
    console.error('\n');
    process.exit(1);
  }
}

testSMTP();
