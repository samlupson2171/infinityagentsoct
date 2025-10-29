const fetch = require('node-fetch');

async function testQuotesAPI() {
  try {
    // You'll need to get a valid session token first
    // For now, let's just check the structure
    const response = await fetch('http://localhost:3000/api/admin/quotes?limit=1');
    const data = await response.json();
    
    console.log('API Response Status:', response.status);
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    if (data.data && data.data.quotes && data.data.quotes[0]) {
      const firstQuote = data.data.quotes[0];
      console.log('\n=== First Quote Structure ===');
      console.log('enquiryId type:', typeof firstQuote.enquiryId);
      console.log('enquiryId value:', firstQuote.enquiryId);
      console.log('createdBy type:', typeof firstQuote.createdBy);
      console.log('createdBy value:', firstQuote.createdBy);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testQuotesAPI();
