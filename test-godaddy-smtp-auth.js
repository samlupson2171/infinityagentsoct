const nodemailer = require('nodemailer');

async function testGoDaddyAuth() {
  console.log('Testing GoDaddy SMTP Authentication...\n');
  
  const config = {
    host: 'smtpout.secureserver.net',
    port: 465,
    secure: true,
    auth: {
      user: 'agents@infinityagents.co.uk',
      pass: '5tgbVFR$3edc'
    },
    debug: true,
    logger: true
  };

  console.log('Configuration:');
  console.log('Host:', config.host);
  console.log('Port:', config.port);
  console.log('User:', config.auth.user);
  console.log('Password:', config.auth.pass.replace(/./g, '*'));
  console.log('\n');

  try {
    const transporter = nodemailer.createTransport(config);
    
    console.log('Verifying connection...');
    await transporter.verify();
    
    console.log('✅ Authentication successful!');
    console.log('\nSending test email...');
    
    const info = await transporter.sendMail({
      from: '"Infinity Agents" <agents@infinityagents.co.uk>',
      to: 'agents@infinityagents.co.uk',
      subject: 'Test Email - Authentication Check',
      text: 'This is a test email to verify SMTP authentication.',
      html: '<p>This is a test email to verify SMTP authentication.</p>'
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) console.error('Error Code:', error.code);
    if (error.command) console.error('Failed Command:', error.command);
    if (error.response) console.error('Server Response:', error.response);
  }
}

testGoDaddyAuth();
