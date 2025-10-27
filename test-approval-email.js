#!/usr/bin/env node

/**
 * Test Approval Email
 * This script tests sending an approval notification email
 */

require('dotenv').config({ path: '.env.local' });

async function testApprovalEmail() {
  console.log('=== Testing Approval Email ===\n');
  
  try {
    // Dynamically import the email module
    const { sendApprovalNotificationEmail } = await import('./src/lib/email.ts');
    
    console.log('📧 Sending approval notification email...\n');
    
    const result = await sendApprovalNotificationEmail({
      userName: 'Sam Lupson',
      userEmail: 'agent@resort-experts.com',
      companyName: 'Resort-Experts Ltd',
      consortia: undefined,
      userId: '67123456789abcdef0123456'
    });
    
    console.log('✅ Approval email sent successfully!');
    console.log(`   Message ID: ${result.messageId}`);
    console.log(`   Timestamp: ${result.timestamp}`);
    console.log(`\n📬 Check the inbox at: agent@resort-experts.com`);
    
  } catch (error) {
    console.error('\n❌ Failed to send approval email:');
    console.error('   Error:', error.message);
    if (error.stack) {
      console.error('\n   Stack:', error.stack);
    }
    process.exit(1);
  }
}

testApprovalEmail().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
