// Test the contract signing API directly
const fetch = require('node-fetch');

async function testContractSign() {
  try {
    console.log('Testing contract signing API...\n');
    
    // You'll need to replace these with actual values from your session
    const testData = {
      contractId: 'YOUR_CONTRACT_ID',  // Replace with actual contract ID
      contractVersion: '1.0',
      hasReadContract: true,
      digitalSignatureConsent: true
    };

    console.log('Request body:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:3000/api/contract/sign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // You'll need to add your session cookie here
        'Cookie': 'YOUR_SESSION_COOKIE'
      },
      body: JSON.stringify(testData)
    });

    console.log('\nResponse status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    const text = await response.text();
    console.log('\nResponse body:', text);
    
    try {
      const json = JSON.parse(text);
      console.log('\nParsed JSON:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Response is not JSON');
    }

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

console.log('NOTE: This script requires you to:');
console.log('1. Be logged in and have a session cookie');
console.log('2. Have an active contract in the database');
console.log('3. Replace the placeholder values above\n');
console.log('For now, please check your Next.js server terminal for the actual error.\n');

// testContractSign();
