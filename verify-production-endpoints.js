/**
 * Production Endpoint Verification Script
 * Tests all events-related API endpoints on the live Vercel deployment
 */

const PRODUCTION_URL = process.env.VERCEL_URL || 'https://infinityagentsoct.vercel.app';

async function testEndpoint(name, url, options = {}) {
  console.log(`\n🔍 Testing: ${name}`);
  console.log(`   URL: ${url}`);
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, options);
    const duration = Date.now() - startTime;
    
    console.log(`   ✅ Status: ${response.status} ${response.statusText}`);
    console.log(`   ⏱️  Response Time: ${duration}ms`);
    
    if (duration > 2000) {
      console.log(`   ⚠️  WARNING: Response time exceeds 2 seconds`);
    }
    
    const contentType = response.headers.get('content-type');
    console.log(`   📄 Content-Type: ${contentType}`);
    
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      console.log(`   📊 Response Data:`, JSON.stringify(data, null, 2).substring(0, 500));
      
      if (data.error) {
        console.log(`   ❌ ERROR in response: ${data.error}`);
      }
      
      return { success: response.ok, status: response.status, duration, data };
    } else {
      const text = await response.text();
      console.log(`   📄 Response (first 200 chars): ${text.substring(0, 200)}`);
      return { success: response.ok, status: response.status, duration, text };
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`   ❌ ERROR: ${error.message}`);
    console.log(`   ⏱️  Failed after: ${duration}ms`);
    return { success: false, error: error.message, duration };
  }
}

async function runTests() {
  console.log('🚀 Starting Production Endpoint Verification');
  console.log(`📍 Production URL: ${PRODUCTION_URL}`);
  console.log('=' .repeat(80));
  
  const results = [];
  
  // Test 1: Health Check Endpoint
  results.push(await testEndpoint(
    'Health Check',
    `${PRODUCTION_URL}/api/health`
  ));
  
  // Test 2: Events API (all events)
  results.push(await testEndpoint(
    'Events API - All Events',
    `${PRODUCTION_URL}/api/events`
  ));
  
  // Test 3: Events API with destination filter
  results.push(await testEndpoint(
    'Events API - Filtered by Destination',
    `${PRODUCTION_URL}/api/events?destination=benidorm`
  ));
  
  // Test 4: Categories API (public access with activeOnly)
  results.push(await testEndpoint(
    'Categories API - Public Access (activeOnly=true)',
    `${PRODUCTION_URL}/api/admin/events/categories?activeOnly=true`
  ));
  
  // Test 5: Categories API (all categories - should require auth)
  results.push(await testEndpoint(
    'Categories API - All Categories (should require auth)',
    `${PRODUCTION_URL}/api/admin/events/categories`
  ));
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const slow = results.filter(r => r.duration > 2000).length;
  
  console.log(`✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  console.log(`⚠️  Slow (>2s): ${slow}/${results.length}`);
  
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  console.log(`⏱️  Average Response Time: ${avgDuration.toFixed(0)}ms`);
  
  // Check specific requirements
  console.log('\n📋 REQUIREMENT CHECKS:');
  
  const healthCheck = results[0];
  console.log(`   Health endpoint accessible: ${healthCheck.success ? '✅' : '❌'}`);
  
  const eventsApi = results[1];
  console.log(`   Events API returns data: ${eventsApi.success ? '✅' : '❌'}`);
  
  const categoriesPublic = results[3];
  console.log(`   Categories API public access works: ${categoriesPublic.success ? '✅' : '❌'}`);
  
  const allResponsesUnder2s = results.every(r => r.duration < 2000);
  console.log(`   All responses under 2 seconds: ${allResponsesUnder2s ? '✅' : '❌'}`);
  
  const noErrors = results.every(r => !r.data?.error && r.status !== 500);
  console.log(`   No 500 errors: ${noErrors ? '✅' : '❌'}`);
  
  console.log('\n' + '='.repeat(80));
  
  if (failed === 0 && allResponsesUnder2s && noErrors) {
    console.log('🎉 ALL TESTS PASSED! Production endpoints are working correctly.');
    process.exit(0);
  } else {
    console.log('⚠️  SOME TESTS FAILED. Please review the results above.');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
