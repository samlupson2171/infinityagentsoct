// Test what the public API returns for Benidorm
const fetch = require('node-fetch');

async function testBenidormPublicAPI() {
  try {
    console.log('🔍 Testing public API for Benidorm...\n');
    
    // Test the public API endpoint
    const response = await fetch('http://localhost:3000/api/destinations/benidorm');
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (!response.ok) {
      const error = await response.text();
      console.log('❌ Error Response:', error);
      return;
    }
    
    const data = await response.json();
    
    console.log('\n📍 Benidorm Public API Response:');
    console.log('Name:', data.name);
    console.log('Slug:', data.slug);
    console.log('Description:', data.description);
    console.log('Status:', data.status || 'N/A');
    
    console.log('\n🖼️  Images:');
    console.log('Hero Image:', data.heroImage || 'NOT SET');
    console.log('Gallery Images:', data.galleryImages?.length || 0);
    
    console.log('\n📊 Quick Facts:');
    if (data.quickFacts) {
      Object.entries(data.quickFacts).forEach(([key, value]) => {
        console.log(`  ${key}:`, value || 'NOT SET');
      });
    } else {
      console.log('  ❌ No quick facts');
    }
    
    console.log('\n📝 Sections:');
    if (data.sections) {
      Object.entries(data.sections).forEach(([key, section]) => {
        console.log(`\n  ${key}:`);
        console.log(`    Title: ${section.title || 'NOT SET'}`);
        console.log(`    Content Length: ${section.content?.length || 0} chars`);
        console.log(`    Content Preview: ${section.content ? section.content.substring(0, 80) + '...' : 'EMPTY'}`);
        console.log(`    Highlights: ${section.highlights?.length || 0}`);
        console.log(`    Tips: ${section.tips?.length || 0}`);
        console.log(`    Images: ${section.images?.length || 0}`);
      });
    } else {
      console.log('  ❌ No sections');
    }
    
    console.log('\n📁 Files:');
    console.log('Total:', data.files?.length || 0);
    if (data.files && data.files.length > 0) {
      data.files.forEach((file, idx) => {
        console.log(`  ${idx + 1}. ${file.originalName} (Public: ${file.isPublic})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure your Next.js dev server is running on port 3000');
    console.log('   Run: npm run dev');
  }
}

testBenidormPublicAPI();
