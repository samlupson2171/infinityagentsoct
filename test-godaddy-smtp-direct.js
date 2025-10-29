const nodemailer = require('nodemailer');

// Test GoDaddy SMTP with exact credentials from .env.local
async function testGoDaddySMTP() {
  console.log('Testing GoDaddy SMTP Configuration...\n');
  
  const config = {
    host: 'smtpout.secureserver.net',
    port: 465,
    secure: true, // true for 465
    auth: {
      user: 'agents@infinityagents.co.uk',
      pass: '5tgbVFR$edc'
    },
    debug: true, // Enable debug output
    logger: true // Enable logging
  };

  console.log('Configuration:');
  console.log('Host:', config.host);
  console.log('Port:', config.port);
  console.log('Secure:', config.secure);
  console.log('User:', config.user);
  console.log('Pass:', config.pass.replace(/./g, '*'));
  console.log('\n');

  try {
    console.log('Creating transporter...');
    const transporter = nodemailer.createTransport(config);

    console.log('Verifying connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!\n');

    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: 'agents@infinityagents.co.uk',
      to: 'agents@infinityagents.co.uk', // Send to yourself
      subject: 'Test Email from GoDaddy SMTP',
      text: 'This is a test email to verify GoDaddy SMTP configuration.',
      html: '<p>This is a test email to verify GoDaddy SMTP configuration.</p>'
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) console.error('Error Code:', error.code);
    if (error.command) console.error('Failed Command:', error.command);
    if (error.response) console.error('Server Response:', error.response);
    if (error.responseCode) console.error('Response Code:', error.responseCode);
  }
}

testGoDaddySMTP();
