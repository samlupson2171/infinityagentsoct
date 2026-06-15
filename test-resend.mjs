import { Resend } from 'resend';

const resend = new Resend('re_sQ4CASby_Q1BSMaxtHA7UcEXhy8VXE3k6');

console.log('Sending test email to sam.lupson@hotmail.com...');

const { data, error } = await resend.emails.send({
  from: 'onboarding@resend.dev',
  to: 'sam.lupson@hotmail.com',
  subject: 'Test Email - Resend is working! ✅',
  html: '<h2>✅ Resend is configured correctly</h2><p>If you receive this, all email notifications will now work via Resend.</p><p>Sent at: ' + new Date().toISOString() + '</p>',
});

if (error) {
  console.error('❌ Failed:', error);
} else {
  console.log('✅ Email sent! Message ID:', data.id);
  console.log('Check your inbox at sam.lupson@hotmail.com');
}
