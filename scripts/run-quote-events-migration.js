#!/usr/bin/env node

/**
 * Script to run migration 010: Add events to quotes
 * 
 * This script:
 * - Adds selectedEvents field to existing quotes
 * - Migrates activitiesIncluded to internalNotes
 * - Creates necessary indexes
 * 
 * Usage: node scripts/run-quote-events-migration.js
 */

require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');

async function addSelectedEventsField(db) {
  console.log('Step 1: Adding selectedEvents field to existing quotes...');
  
  const quotesCollection = db.collection('quotes');
  
  // Check if quotes collection exists
  const collections = await db.listCollections({ name: 'quotes' }).toArray();
  if (collections.length === 0) {
    console.log('  ℹ Quotes collection does not exist yet, skipping migration');
    return { modified: 0, total: 0 };
  }
  
  // Count total quotes
  const totalQuotes = await quotesCollection.countDocuments();
  
  // Add selectedEvents field to all existing quotes (empty array)
  const result = await quotesCollection.updateMany(
    { selectedEvents: { $exists: false } },
    {
      $set: {
        selectedEvents: [],
      },
    }
  );
  
  console.log(`  ✓ Updated ${result.modifiedCount} of ${totalQuotes} quotes with selectedEvents field`);
  return { modified: result.modifiedCount, total: totalQuotes };
}

async function migrateActivitiesIncluded(db) {
  console.log('Step 2: Migrating activitiesIncluded to internalNotes...');
  
  const quotesCollection = db.collection('quotes');
  
  const quotesWithActivities = await quotesCollection.find({
    $and: [
      { activitiesIncluded: { $exists: true } },
      { activitiesIncluded: { $ne: '' } },
      { activitiesIncluded: { $ne: null } }
    ]
  }).toArray();
  
  if (quotesWithActivities.length === 0) {
    console.log('  ℹ No quotes with activitiesIncluded to migrate');
    return 0;
  }
  
  let migratedCount = 0;
  for (const quote of quotesWithActivities) {
    const activitiesText = quote.activitiesIncluded;
    const existingNotes = quote.internalNotes || '';
    
    // Append activities to internal notes with a separator
    const updatedNotes = existingNotes
      ? `${existingNotes}\n\n[Migrated Activities]: ${activitiesText}`
      : `[Migrated Activities]: ${activitiesText}`;
    
    await quotesCollection.updateOne(
      { _id: quote._id },
      {
        $set: {
          internalNotes: updatedNotes,
        },
      }
    );
    migratedCount++;
  }
  
  console.log(`  ✓ Migrated activitiesIncluded to internalNotes for ${migratedCount} quotes`);
  return migratedCount;
}

async function createIndexes(db) {
  console.log('Step 3: Creating index on selectedEvents.eventId...');
  
  const quotesCollection = db.collection('quotes');
  
  try {
    await quotesCollection.createIndex(
      { 'selectedEvents.eventId': 1 },
      { 
        name: 'selected_events_event_id_idx',
        sparse: true // Only index documents that have selectedEvents
      }
    );
    console.log('  ✓ Created index: selected_events_event_id_idx');
  } catch (error) {
    if (error.code === 85 || error.code === 86 || error.codeName === 'IndexOptionsConflict') {
      console.log('  ℹ Index selected_events_event_id_idx already exists, skipping...');
    } else {
      throw error;
    }
  }
}

async function recordMigration(db) {
  console.log('Step 4: Recording migration in database...');
  
  await db.collection('migrations').updateOne(
    { version: '010' },
    {
      $set: {
        version: '010',
        description: 'Add selectedEvents field to quotes and migrate activitiesIncluded',
        appliedAt: new Date(),
        status: 'completed'
      }
    },
    { upsert: true }
  );
  
  console.log('  ✓ Migration recorded');
}

async function runMigration() {
  console.log('='.repeat(60));
  console.log('Running Migration 010: Add Events to Quotes');
  console.log('='.repeat(60));
  console.log();

  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;
    console.log('✅ Connected to MongoDB');
    console.log();

    // Check if migration already applied
    const migrationRecord = await db.collection('migrations').findOne({ version: '010' });
    if (migrationRecord && migrationRecord.status === 'completed') {
      console.log('⚠️  Migration 010 has already been applied');
      console.log(`   Applied at: ${migrationRecord.appliedAt}`);
      console.log('');
      console.log('To re-run the migration, you must first rollback:');
      console.log('   node scripts/rollback-quote-events-migration.js');
      console.log('');
      process.exit(0);
    }

    // Run migration steps
    const { modified, total } = await addSelectedEventsField(db);
    const migratedCount = await migrateActivitiesIncluded(db);
    await createIndexes(db);
    await recordMigration(db);

    console.log();
    console.log('='.repeat(60));
    console.log('✅ Migration completed successfully!');
    console.log('='.repeat(60));
    console.log();
    console.log('Summary:');
    console.log(`  - Total quotes: ${total}`);
    console.log(`  - Quotes updated with selectedEvents: ${modified}`);
    console.log(`  - Quotes with migrated activities: ${migratedCount}`);
    console.log();
    console.log('Next steps:');
    console.log('  1. Run verification: node scripts/verify-quote-events-migration.js');
    console.log('  2. Test the quote form with event selection');
    console.log('  3. If issues occur, rollback with: node scripts/rollback-quote-events-migration.js');
    console.log();
  } catch (error) {
    console.error();
    console.error('='.repeat(60));
    console.error('❌ Migration failed!');
    console.error('='.repeat(60));
    console.error();
    console.error('Error:', error.message);
    console.error();
    console.error('Stack trace:');
    console.error(error.stack);
    console.error();
    console.error('To rollback, run: node scripts/rollback-quote-events-migration.js');
    process.exit(1);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the migration
runMigration();
