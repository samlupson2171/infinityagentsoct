/**
 * Script to fix the destination files.id unique index issue
 * This removes the problematic unique index on files.id subdocument field
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function fixDestinationFilesIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully');

    const db = mongoose.connection.db;
    const collection = db.collection('destinations');

    // Get all indexes
    console.log('\nCurrent indexes:');
    const indexes = await collection.indexes();
    indexes.forEach((index) => {
      console.log(`- ${index.name}:`, JSON.stringify(index.key));
    });

    // Find and drop the problematic index
    const problematicIndexes = indexes.filter(
      (index) => index.key && index.key['files.id']
    );

    if (problematicIndexes.length > 0) {
      console.log('\nFound problematic indexes to remove:');
      for (const index of problematicIndexes) {
        console.log(`- Dropping index: ${index.name}`);
        await collection.dropIndex(index.name);
        console.log(`  ✓ Successfully dropped ${index.name}`);
      }
    } else {
      console.log('\nNo problematic indexes found. Database is clean.');
    }

    // Verify the fix
    console.log('\nIndexes after cleanup:');
    const updatedIndexes = await collection.indexes();
    updatedIndexes.forEach((index) => {
      console.log(`- ${index.name}:`, JSON.stringify(index.key));
    });

    console.log('\n✓ Fix completed successfully!');
    console.log(
      'You can now create destinations without the files.id unique constraint error.'
    );
  } catch (error) {
    console.error('Error fixing destination files index:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the fix
fixDestinationFilesIndex();
