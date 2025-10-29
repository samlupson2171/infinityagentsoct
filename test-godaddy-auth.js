require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

async function testGoDaddySMTP() {
  console.log('Testing GoDaddy SMTP with environment variables...\n');
  
  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT === '465', // true for 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    debug: true,
    logger: true
  };

  console.log('Configuration:');
  console.log('Host:', config.host);
  console.log('Port:', config.port);
  console.log('Secure:', config.secure);
  console.log('User:', config.auth.user);
  console.log('Pass length:', config.auth.pass?.length);
  console.log('\n');

  try {
    console.log('Creating transporter...');
    const transporter = nodemailer.createTransport(config);

    console.log('Verifying connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!\n');

    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Send to yourself
      subject: 'Test Email - GoDaddy SMTP Verification',
      text: 'This is a test email to verify GoDaddy SMTP configuration.',
      html: '<p>This is a test email to verify GoDaddy SMTP configuration.</p><p>If you receive this, your SMTP is working correctly!</p>'
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);

  } catch (error) {
    console.error('\n❌ Error occurred:');
    console.error('Message:', error.message);
    if (error.code) console.error('Code:', error.code);
    if (error.command) console.error('Command:', error.command);
    if (error.response) console.error('Response:', error.response);
    if (error.responseCode) console.error('Response Code:', error.responseCode);
    
    console.error('\n📋 Full error object:');
    console.error(error);
  }
}

testGoDaddySMTP();
