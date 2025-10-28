// Test SMTP connection with your GoDaddy settings
// Run this locally to verify your SMTP credentials work

const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testSMTPConnection() {
  console.log('=== Testing SMTP Connection ===\n');

  // Check if environment variables are loaded
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ Error: SMTP environment variables not found!');
    console.log('\nMake sure your .env.local file contains:');
    console.log('  SMTP_HOST=smtpout.secureserver.net');
    console.log('  SMTP_PORT=465');
    console.log('  SMTP_USER=agents@infinityagents.co.uk');
    console.log('  SMTP_PASS=your-password');
    process.exit(1);
  }

  console.log('Configuration:');
  console.log(`  Host: ${process.env.SMTP_HOST}`);
  console.log(`  Port: ${process.env.SMTP_PORT}`);
  console.log(`  User: ${process.env.SMTP_USER}`);
  console.log(`  Pass: ***${process.env.SMTP_PASS.slice(-4)}`);
  console.log(`  Secure: ${process.env.SMTP_SECURE}`);
  console.log('');

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  try {
    console.log('Testing connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    // Try sending a test email
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Send to yourself
      subject: 'SMTP Test Email - ' + new Date().toISOString(),
      text: 'This is a test email to verify SMTP configuration.',
      html: '<p>This is a test email to verify SMTP configuration.</p><p><strong>If you receive this, your SMTP is working correctly!</strong></p>',
    });

    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Check your inbox at: ${process.env.SMTP_USER}\n`);

    console.log('=== Test Complete ===');
    console.log('Your SMTP configuration is working correctly!');
    console.log('\nNext steps:');
    console.log('1. Make sure these same variables are set in Vercel');
    console.log('2. Redeploy your Vercel application');
    console.log('3. Test registration on your production site');

  } catch (error) {
    console.error('❌ SMTP test failed!\n');
    console.error('Error details:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication failed. Possible causes:');
      console.log('   - Incorrect username or password');
      console.log('   - Email account locked or suspended');
      console.log('   - Two-factor authentication enabled (may need app password)');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.log('\n💡 Connection failed. Possible causes:');
      console.log('   - Incorrect SMTP host or port');
      console.log('   - Firewall blocking outgoing SMTP connections');
      console.log('   - SMTP service temporarily unavailable');
    } else {
      console.log('\n💡 Check your SMTP settings and try again');
    }
    
    process.exit(1);
  }
}

// Run the test
testSMTPConnection().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
