const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function fixBenidormData() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const destinations = db.collection('destinations');

    // Find Benidorm
    const benidorm = await destinations.findOne({ slug: 'benidorm' });

    if (!benidorm) {
      console.log('❌ Benidorm not found');
      return;
    }

    console.log('\n📍 Current Benidorm Data:');
    console.log('Status:', benidorm.status);
    console.log('Hero Image:', benidorm.heroImage || 'NOT SET');
    console.log('Gallery Images:', benidorm.galleryImages?.length || 0);
    
    console.log('\nQuick Facts:');
    console.log('  Population:', benidorm.quickFacts?.population || 'NOT SET');
    console.log('  Language:', benidorm.quickFacts?.language || 'NOT SET');
    console.log('  Currency:', benidorm.quickFacts?.currency || 'NOT SET');
    console.log('  Time Zone:', benidorm.quickFacts?.timeZone || 'NOT SET');
    console.log('  Airport:', benidorm.quickFacts?.airport || 'NOT SET');
    console.log('  Flight Time:', benidorm.quickFacts?.flightTime || 'NOT SET');
    console.log('  Climate:', benidorm.quickFacts?.climate || 'NOT SET');
    console.log('  Best Time:', benidorm.quickFacts?.bestTime || 'NOT SET');

    // Prepare update with missing quick facts
    const updates = {
      $set: {
        'quickFacts.population': benidorm.quickFacts?.population || '70,000',
        'quickFacts.timeZone': benidorm.quickFacts?.timeZone || 'CET (UTC+1)',
        'quickFacts.bestTime': benidorm.quickFacts?.bestTime || 'May to October',
      }
    };

    console.log('\n🔧 Applying updates...');
    const result = await destinations.updateOne(
      { _id: benidorm._id },
      updates
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Successfully updated Benidorm destination');
      
      // Fetch updated document
      const updated = await destinations.findOne({ _id: benidorm._id });
      console.log('\n📊 Updated Quick Facts:');
      console.log('  Population:', updated.quickFacts?.population);
      console.log('  Time Zone:', updated.quickFacts?.timeZone);
      console.log('  Best Time:', updated.quickFacts?.bestTime);
    } else {
      console.log('ℹ️  No changes needed - data already complete');
    }

    console.log('\n💡 Note: To add hero image and gallery images, please:');
    console.log('   1. Go to Admin > Destinations > Edit Benidorm');
    console.log('   2. Upload images in the Basic Information tab');
    console.log('   3. Or add image URLs directly in the form');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

fixBenidormData();
