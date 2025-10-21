/**
 * Test script to verify public access to categories API
 * Tests both authenticated and unauthenticated access
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function testPublicAccess() {
  console.log('🧪 Testing Categories API Public Access\n');
  console.log('=' .repeat(60));

  // Test 1: Public access with activeOnly=true (should work)
  console.log('\n📝 Test 1: Public access with activeOnly=true');
  try {
    const response = await fetch(`${BASE_URL}/api/admin/events/categories?activeOnly=true`);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    
    if (response.status === 200 && data.success) {
      console.log('✅ PASS: Public access works with activeOnly=true');
      console.log(`   Found ${data.data?.length || 0} active categories`);
    } else {
      console.log('❌ FAIL: Public access should work with activeOnly=true');
      console.log('   Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }

  // Test 2: Public access without activeOnly (should fail with 401/403)
  console.log('\n📝 Test 2: Public access without activeOnly (should require auth)');
  try {
    const response = await fetch(`${BASE_URL}/api/admin/events/categories`);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    
    if (response.status === 401 || response.status === 403) {
      console.log('✅ PASS: Authentication required for admin operations');
    } else if (response.status === 200) {
      console.log('❌ FAIL: Should require authentication without activeOnly');
    } else {
      console.log('⚠️  UNEXPECTED: Got status', response.status);
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }

  // Test 3: Public access with includeEventCount (should fail with 401/403)
  console.log('\n📝 Test 3: Public access with includeEventCount (should require auth)');
  try {
    const response = await fetch(`${BASE_URL}/api/admin/events/categories?includeEventCount=true`);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    
    if (response.status === 401 || response.status === 403) {
      console.log('✅ PASS: Authentication required for includeEventCount');
    } else if (response.status === 200) {
      console.log('❌ FAIL: Should require authentication for includeEventCount');
    } else {
      console.log('⚠️  UNEXPECTED: Got status', response.status);
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ Testing complete!\n');
}

// Run tests
testPublicAccess().catch(console.error);
