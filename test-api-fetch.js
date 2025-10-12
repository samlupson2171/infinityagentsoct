require('dotenv').config({ path: '.env.local' });

async function testApiFetch() {
  try {
    // Test the API endpoint directly
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/admin/super-packages?page=1&limit=10&status=all`;
    
    console.log('Testing API endpoint:', url);
    console.log('Note: This will fail if the server is not running or if auth is required\n');
    
    const response = await fetch(url);
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n✅ API Response:');
      console.log(JSON.stringify(data, null, 2));
      
      if (data.packages) {
        console.log(`\n📦 Found ${data.packages.length} packages`);
        data.packages.forEach(pkg => {
          console.log(`  - ${pkg.name} (${pkg.status}) - ${pkg.destination}`);
        });
      }
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Could not parse error response' }));
      console.log('\n❌ API Error:');
      console.log(JSON.stringify(errorData, null, 2));
    }
    
  } catch (error) {
    console.error('\n❌ Fetch Error:', error.message);
    console.log('\nMake sure your development server is running (npm run dev)');
  }
}

testApiFetch();
