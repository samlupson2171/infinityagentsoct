// Test registration API endpoint
const testData = {
  name: "Test User",
  company: "Test Company Ltd",
  contactEmail: "test@example.com",
  phoneNumber: "+44 1234 567890",
  abtaPtsNumber: "TEST123",
  websiteAddress: "https://test-company.com",
  password: "TestPassword123!",
  confirmPassword: "TestPassword123!",
  consortia: "Test Consortia"
};

async function testRegistration() {
  try {
    console.log('Testing registration endpoint...');
    console.log('Request data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:3006/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('\nResponse status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.json();
    console.log('\nResponse body:', JSON.stringify(result, null, 2));
    
    if (!response.ok) {
      console.error('\n❌ Registration failed');
      process.exit(1);
    }
    
    console.log('\n✅ Registration successful');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
    process.exit(1);
  }
}

testRegistration();
