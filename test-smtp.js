const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('Testing Microsoft 365 SMTP connection...');
  console.log('Host: smtp.office365.com');
  console.log('Port: 587 (STARTTLS)');
  console.log('User: sam@resort-experts.com');
  console.log('');

  const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: 'sam@resort-experts.com',
      pass: '5tgbVFR3edc',
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false,
    },
    connectionTimeout: 30000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
  });

  console.log('Step 1: Verifying SMTP connection...');
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified!\n');
  } catch (err) {
    console.error('❌ SMTP connection FAILED:', err.message);
    console.error('Error code:', err.code);
    if (err.message.includes('Authentication')) {
      console.error('\nPossible fixes:');
      console.error('1. Check password is correct');
      console.error('2. Disable Security Defaults or enable SMTP AUTH in M365 admin');
      console.error('3. If MFA is enabled, generate an App Password');
    }
    process.exit(1);
  }

  console.log('Step 2: Sending test email...');
  try {
    const info = await transporter.sendMail({
      from: '"Infinity Agents" <sam@resort-experts.com>',
      to: 'sam@resort-experts.com',
      subject: 'SMTP Test - ' + new Date().toLocaleString(),
      html: '<h2>Test Email</h2><p>If you receive this, M365 SMTP is working correctly.</p><p>Sent at: ' + new Date().toISOString() + '</p>',
    });
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (err) {
    console.error('❌ Email send FAILED:', err.message);
    console.error('Error code:', err.code);
  }

  transporter.close();
}

testEmail();
