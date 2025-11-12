const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkBenidormDestination() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const destinations = db.collection('destinations');

    // Find Benidorm destination
    const benidorm = await destinations.findOne({ slug: 'benidorm' });

    if (!benidorm) {
      console.log('❌ Benidorm destination not found');
      return;
    }

    console.log('\n📍 Benidorm Destination Found:');
    console.log('ID:', benidorm._id);
    console.log('Name:', benidorm.name);
    console.log('Slug:', benidorm.slug);
    console.log('Status:', benidorm.status);
    console.log('Published At:', benidorm.publishedAt);
    
    console.log('\n📝 Sections:');
    if (benidorm.sections) {
      Object.keys(benidorm.sections).forEach(key => {
        const section = benidorm.sections[key];
        console.log(`\n  ${key}:`);
        console.log(`    - Title: ${section.title || 'NOT SET'}`);
        console.log(`    - Content Length: ${section.content ? section.content.length : 0} chars`);
        console.log(`    - Content Preview: ${section.content ? section.content.substring(0, 100) + '...' : 'EMPTY'}`);
        console.log(`    - Highlights: ${section.highlights ? section.highlights.length : 0}`);
        console.log(`    - Tips: ${section.tips ? section.tips.length : 0}`);
        console.log(`    - Images: ${section.images ? section.images.length : 0}`);
      });
    } else {
      console.log('  ❌ No sections found');
    }

    console.log('\n📊 Quick Facts:');
    if (benidorm.quickFacts) {
      console.log('  Population:', benidorm.quickFacts.population || 'NOT SET');
      console.log('  Language:', benidorm.quickFacts.language || 'NOT SET');
      console.log('  Currency:', benidorm.quickFacts.currency || 'NOT SET');
      console.log('  Time Zone:', benidorm.quickFacts.timeZone || 'NOT SET');
      console.log('  Airport:', benidorm.quickFacts.airport || 'NOT SET');
      console.log('  Flight Time:', benidorm.quickFacts.flightTime || 'NOT SET');
      console.log('  Climate:', benidorm.quickFacts.climate || 'NOT SET');
      console.log('  Best Time:', benidorm.quickFacts.bestTime || 'NOT SET');
    } else {
      console.log('  ❌ No quick facts found');
    }

    console.log('\n🖼️  Images:');
    console.log('  Hero Image:', benidorm.heroImage || 'NOT SET');
    console.log('  Gallery Images:', benidorm.galleryImages ? benidorm.galleryImages.length : 0);

    console.log('\n📁 Files:');
    console.log('  Total Files:', benidorm.files ? benidorm.files.length : 0);
    if (benidorm.files && benidorm.files.length > 0) {
      benidorm.files.forEach((file, idx) => {
        console.log(`  File ${idx + 1}:`, file.originalName, '- Public:', file.isPublic);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkBenidormDestination();
