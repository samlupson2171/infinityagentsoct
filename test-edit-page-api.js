const packageId = '68e99462fc8e6ba930233d03';

async function testAPI() {
  try {
    console.log('Testing API endpoint...');
    const response = await fetch(`http://localhost:3004/api/admin/super-packages/${packageId}`);
    
    console.log('Status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));
    
    const text = await response.text();
    console.log('Response length:', text.length);
    console.log('First 500 chars:', text.substring(0, 500));
    
    if (response.headers.get('content-type')?.includes('application/json')) {
      const data = JSON.parse(text);
      console.log('\nParsed JSON:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();
