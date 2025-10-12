// Quick test to verify super packages API and display
// Run with: node test-super-packages-display.js

async function testSuperPackagesAPI() {
  try {
    console.log('Testing Super Packages API...\n');
    
    // Test 1: Fetch all packages
    console.log('1. Fetching all packages (status=all)...');
    const response1 = await fetch('http://localhost:3000/api/admin/super-packages?status=all&limit=1000');
    const data1 = await response1.json();
    
    console.log(`   Status: ${response1.status}`);
    console.log(`   Success: ${data1.success}`);
    console.log(`   Total packages: ${data1.pagination?.total || 0}`);
    console.log(`   Packages returned: ${data1.packages?.length || 0}\n`);
    
    if (data1.packages && data1.packages.length > 0) {
      console.log('   Package details:');
      data1.packages.forEach((pkg, index) => {
        console.log(`   ${index + 1}. ${pkg.name}`);
        console.log(`      - ID: ${pkg._id}`);
        console.log(`      - Destination: ${pkg.destination}`);
        console.log(`      - Resort: ${pkg.resort}`);
        console.log(`      - Status: ${pkg.status}`);
        console.log(`      - Version: ${pkg.version}`);
      });
    }
    
    // Test 2: Fetch only active packages
    console.log('\n2. Fetching active packages only...');
    const response2 = await fetch('http://localhost:3000/api/admin/super-packages?status=active&limit=1000');
    const data2 = await response2.json();
    
    console.log(`   Active packages: ${data2.packages?.length || 0}`);
    
    // Test 3: Fetch only inactive packages
    console.log('\n3. Fetching inactive packages only...');
    const response3 = await fetch('http://localhost:3000/api/admin/super-packages?status=inactive&limit=1000');
    const data3 = await response3.json();
    
    console.log(`   Inactive packages: ${data3.packages?.length || 0}`);
    
    // Summary
    console.log('\n=== SUMMARY ===');
    console.log(`Total packages in database: ${data1.pagination?.total || 0}`);
    console.log(`Active: ${data2.packages?.length || 0}`);
    console.log(`Inactive: ${data3.packages?.length || 0}`);
    
    if (data1.packages && data1.packages.length > 0) {
      const allInactive = data1.packages.every(pkg => pkg.status === 'inactive');
      if (allInactive) {
        console.log('\n⚠️  WARNING: All packages are INACTIVE!');
        console.log('   This is why they might not be showing up if the UI filters inactive packages by default.');
        console.log('   Solution: Change the status filter to "All" or "Inactive" to see them.');
      }
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testSuperPackagesAPI();
