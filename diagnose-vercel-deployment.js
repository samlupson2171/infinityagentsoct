#!/usr/bin/env node

/**
 * Vercel Deployment Diagnostic Script
 * Tests production endpoints for the enquiry form events functionality
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PRODUCTION_URL = process.env.VERCEL_URL || process.argv[2] || 'https://your-app.vercel.app';
const REPORT_FILE = path.join(__dirname, 'vercel-diagnostic-report.json');

// Test results storage
const results = {
  timestamp: new Date().toISOString(),
  productionUrl: PRODUCTION_URL,
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

/**
 * Make HTTP request and return response details
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Vercel-Diagnostic-Script/1.0',
        'Accept': 'application/json',
        ...options.headers
      }
    };

    const req = protocol.request(url, requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          body: data,
          rawBody: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout after 10 seconds'));
    });

    req.end();
  });
}

/**
 * Parse response body safely
 */
function parseResponseBody(body) {
  try {
    return JSON.parse(body);
  } catch (e) {
    return body;
  }
}

/**
 * Add test result
 */
function addTestResult(name, passed, details) {
  const result = {
    name,
    passed,
    timestamp: new Date().toISOString(),
    ...details
  };
  
  results.tests.push(result);
  results.summary.total++;
  
  if (passed) {
    results.summary.passed++;
    console.log(`✅ ${name}`);
  } else {
    results.summary.failed++;
    console.log(`❌ ${name}`);
  }
  
  if (details.warning) {
    results.summary.warnings++;
    console.log(`⚠️  Warning: ${details.warning}`);
  }
  
  return result;
}

/**
 * Test 1: Health Check Endpoint
 */
async function testHealthCheck() {
  console.log('\n🔍 Testing Health Check Endpoint...');
  
  try {
    const url = `${PRODUCTION_URL}/api/health`;
    const response = await makeRequest(url);
    const body = parseResponseBody(response.body);
    
    const passed = response.statusCode === 200 && body.status === 'ok';
    
    addTestResult('Health Check', passed, {
      url,
      statusCode: response.statusCode,
      response: body,
      databaseConnected: body.database === 'connected',
      warning: !passed ? 'Health check failed - database may not be connected' : null
    });
  } catch (error) {
    addTestResult('Health Check', false, {
      url: `${PRODUCTION_URL}/api/health`,
      error: error.message,
      warning: 'Could not reach health endpoint - it may not exist'
    });
  }
}

/**
 * Test 2: Events API - Basic Request
 */
async function testEventsAPI() {
  console.log('\n🔍 Testing Events API...');
  
  try {
    const url = `${PRODUCTION_URL}/api/events`;
    const response = await makeRequest(url);
    const body = parseResponseBody(response.body);
    
    const passed = response.statusCode === 200;
    const isArray = Array.isArray(body);
    
    addTestResult('Events API - Basic', passed, {
      url,
      statusCode: response.statusCode,
      responseType: typeof body,
      isArray,
      itemCount: isArray ? body.length : 0,
      sampleData: isArray && body.length > 0 ? body[0] : null,
      warning: !passed ? 'Events API returned non-200 status' : 
               !isArray ? 'Response is not an array' :
               body.length === 0 ? 'No events returned' : null
    });
  } catch (error) {
    addTestResult('Events API - Basic', false, {
      url: `${PRODUCTION_URL}/api/events`,
      error: error.message
    });
  }
}

/**
 * Test 3: Events API - With Destination Filter
 */
async function testEventsAPIWithDestination() {
  console.log('\n🔍 Testing Events API with Destination Filter...');
  
  const destinations = ['benidorm', 'albufeira', 'test-destination'];
  
  for (const destination of destinations) {
    try {
      const url = `${PRODUCTION_URL}/api/events?destination=${destination}`;
      const response = await makeRequest(url);
      const body = parseResponseBody(response.body);
      
      const passed = response.statusCode === 200;
      const isArray = Array.isArray(body);
      
      addTestResult(`Events API - Destination: ${destination}`, passed, {
        url,
        statusCode: response.statusCode,
        destination,
        itemCount: isArray ? body.length : 0,
        warning: !passed ? `Failed to fetch events for ${destination}` :
                 body.length === 0 ? `No events found for ${destination}` : null
      });
    } catch (error) {
      addTestResult(`Events API - Destination: ${destination}`, false, {
        url: `${PRODUCTION_URL}/api/events?destination=${destination}`,
        error: error.message
      });
    }
  }
}

/**
 * Test 4: Categories API - Public Access
 */
async function testCategoriesAPIPublic() {
  console.log('\n🔍 Testing Categories API (Public Access)...');
  
  try {
    const url = `${PRODUCTION_URL}/api/admin/events/categories?activeOnly=true`;
    const response = await makeRequest(url);
    const body = parseResponseBody(response.body);
    
    const passed = response.statusCode === 200;
    const isArray = Array.isArray(body);
    
    addTestResult('Categories API - Public (activeOnly=true)', passed, {
      url,
      statusCode: response.statusCode,
      responseType: typeof body,
      isArray,
      itemCount: isArray ? body.length : 0,
      sampleData: isArray && body.length > 0 ? body[0] : null,
      warning: response.statusCode === 401 || response.statusCode === 403 ? 
               'Categories API requires authentication - needs to be made public for activeOnly=true' :
               !passed ? 'Categories API returned non-200 status' :
               !isArray ? 'Response is not an array' :
               body.length === 0 ? 'No categories returned' : null
    });
  } catch (error) {
    addTestResult('Categories API - Public (activeOnly=true)', false, {
      url: `${PRODUCTION_URL}/api/admin/events/categories?activeOnly=true`,
      error: error.message
    });
  }
}

/**
 * Test 5: Categories API - Without activeOnly
 */
async function testCategoriesAPIAdmin() {
  console.log('\n🔍 Testing Categories API (Admin Access)...');
  
  try {
    const url = `${PRODUCTION_URL}/api/admin/events/categories`;
    const response = await makeRequest(url);
    const body = parseResponseBody(response.body);
    
    const shouldRequireAuth = response.statusCode === 401 || response.statusCode === 403;
    
    addTestResult('Categories API - Admin (no activeOnly)', shouldRequireAuth, {
      url,
      statusCode: response.statusCode,
      requiresAuth: shouldRequireAuth,
      warning: !shouldRequireAuth ? 
               'Categories API should require authentication without activeOnly parameter' : null
    });
  } catch (error) {
    addTestResult('Categories API - Admin (no activeOnly)', false, {
      url: `${PRODUCTION_URL}/api/admin/events/categories`,
      error: error.message
    });
  }
}

/**
 * Test 6: Response Time Check
 */
async function testResponseTimes() {
  console.log('\n🔍 Testing Response Times...');
  
  const endpoints = [
    '/api/events',
    '/api/admin/events/categories?activeOnly=true'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const url = `${PRODUCTION_URL}${endpoint}`;
      const startTime = Date.now();
      const response = await makeRequest(url);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      const passed = responseTime < 2000; // Should be under 2 seconds
      
      addTestResult(`Response Time - ${endpoint}`, passed, {
        url,
        responseTime: `${responseTime}ms`,
        threshold: '2000ms',
        warning: !passed ? `Response time ${responseTime}ms exceeds 2 second threshold` : null
      });
    } catch (error) {
      addTestResult(`Response Time - ${endpoint}`, false, {
        url: `${PRODUCTION_URL}${endpoint}`,
        error: error.message
      });
    }
  }
}

/**
 * Test 7: CORS Headers
 */
async function testCORSHeaders() {
  console.log('\n🔍 Testing CORS Headers...');
  
  try {
    const url = `${PRODUCTION_URL}/api/events`;
    const response = await makeRequest(url, {
      headers: {
        'Origin': 'https://example.com'
      }
    });
    
    const hasCORS = response.headers['access-control-allow-origin'] !== undefined;
    
    addTestResult('CORS Headers', true, {
      url,
      corsEnabled: hasCORS,
      corsHeader: response.headers['access-control-allow-origin'] || 'Not set',
      warning: !hasCORS ? 'CORS headers not present - may cause issues with cross-origin requests' : null
    });
  } catch (error) {
    addTestResult('CORS Headers', false, {
      url: `${PRODUCTION_URL}/api/events`,
      error: error.message
    });
  }
}

/**
 * Generate summary report
 */
function generateSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${results.summary.total}`);
  console.log(`✅ Passed: ${results.summary.passed}`);
  console.log(`❌ Failed: ${results.summary.failed}`);
  console.log(`⚠️  Warnings: ${results.summary.warnings}`);
  console.log('='.repeat(60));
  
  // Key findings
  console.log('\n🔑 KEY FINDINGS:');
  
  const criticalIssues = results.tests.filter(t => !t.passed);
  if (criticalIssues.length > 0) {
    console.log('\n❌ Critical Issues:');
    criticalIssues.forEach(issue => {
      console.log(`  - ${issue.name}: ${issue.error || issue.warning || 'Failed'}`);
    });
  }
  
  const warnings = results.tests.filter(t => t.warning);
  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach(warning => {
      console.log(`  - ${warning.name}: ${warning.warning}`);
    });
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  
  const healthCheck = results.tests.find(t => t.name === 'Health Check');
  if (healthCheck && !healthCheck.passed) {
    console.log('  1. Create /api/health endpoint to verify database connectivity');
  }
  
  const categoriesPublic = results.tests.find(t => t.name === 'Categories API - Public (activeOnly=true)');
  if (categoriesPublic && categoriesPublic.statusCode === 401) {
    console.log('  2. Update categories API to allow public access when activeOnly=true');
  }
  
  const eventsAPI = results.tests.find(t => t.name === 'Events API - Basic');
  if (eventsAPI && !eventsAPI.passed) {
    console.log('  3. Check Vercel build logs for errors in /api/events route');
    console.log('  4. Verify MONGODB_URI environment variable is set in Vercel');
  }
  
  console.log('\n📄 Full report saved to: ' + REPORT_FILE);
}

/**
 * Save results to file
 */
function saveResults() {
  try {
    fs.writeFileSync(REPORT_FILE, JSON.stringify(results, null, 2));
    console.log(`\n✅ Diagnostic report saved to ${REPORT_FILE}`);
  } catch (error) {
    console.error(`\n❌ Failed to save report: ${error.message}`);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Vercel Deployment Diagnostics');
  console.log('='.repeat(60));
  console.log(`Production URL: ${PRODUCTION_URL}`);
  console.log('='.repeat(60));
  
  if (!PRODUCTION_URL || PRODUCTION_URL === 'https://your-app.vercel.app') {
    console.error('\n❌ ERROR: Please provide your Vercel production URL');
    console.error('Usage: node diagnose-vercel-deployment.js https://your-app.vercel.app');
    process.exit(1);
  }
  
  try {
    await testHealthCheck();
    await testEventsAPI();
    await testEventsAPIWithDestination();
    await testCategoriesAPIPublic();
    await testCategoriesAPIAdmin();
    await testResponseTimes();
    await testCORSHeaders();
    
    generateSummary();
    saveResults();
    
    // Exit with appropriate code
    process.exit(results.summary.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Fatal error during diagnostics:', error);
    process.exit(1);
  }
}

// Run diagnostics
main();
