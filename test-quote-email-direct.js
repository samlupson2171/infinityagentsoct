require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer').default || require('nodemailer');

async function testQuoteEmail() {
  console.log('Testing Quote Email with GoDaddy SMTP...\n');
  
  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  };

  console.log('Configuration:');
  console.log('Host:', config.host);
  console.log('Port:', config.port);
  console.log('User:', config.auth.user);
  console.log('Secure:', config.secure);
  console.log('\n');

  try {
    const transporter = nodemailer.createTransport(config);
    
    console.log('Verifying connection...');
    await transporter.verify();
    console.log('✅ Connection verified!\n');
    
    console.log('Sending test quote email...');
    const info = await transporter.sendMail({
      from: `"Infinity Weekends" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to self for testing
      subject: 'Test Quote - QT-2025-001',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #007bff;">Your Quote from Infinity Weekends</h1>
          <p>This is a test quote email to verify SMTP functionality.</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Quote Details:</h3>
            <p><strong>Reference:</strong> QT-2025-001</p>
            <p><strong>Hotel:</strong> Test Hotel</p>
            <p><strong>Price:</strong> £500</p>
          </div>
          <p>If you received this email, the quote email system is working correctly!</p>
        </div>
      `
    });
    
    console.log('✅ Quote email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('\nCheck your inbox at:', process.env.SMTP_USER);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) console.error('Error Code:', error.code);
    if (error.response) console.error('Server Response:', error.response);
  }
}

testQuoteEmail();
