require('dotenv').config({ path: '.env.local' });

console.log('Environment Variables Check:\n');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-3) : 'NOT SET');
console.log('SMTP_PASS length:', process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0);
console.log('SMTP_PASS raw:', process.env.SMTP_PASS);
console.log('\nSMTP_SECURE:', process.env.SMTP_SECURE);
console.log('EMAIL_FROM_ADDRESS:', process.env.EMAIL_FROM_ADDRESS);
