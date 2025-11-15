#!/usr/bin/env node

/**
 * Script to rollback migration 010: Add events to quotes
 * 
 * This script:
 * - Removes selectedEvents field from quotes
 * - Restores activitiesIncluded from internalNotes (best effort)
 * - Drops event-related indexes
 * 
 * Usage: node scripts/rollback-quote-events-migration.js
 */

require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
const readline = require('readline');

async function confirmRollback() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      '\n⚠️  WARNING: This will remove selectedEvents from all quotes!\n' +
      'Are you sure you want to rollback? (yes/no): ',
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes');
      }
    );
  });
}

async function removeSelectedEventsField(db) {
  console.log('Step 1: Removing selectedEvents field from quotes...');
  
  const quotesCollection = db.collection('quotes');
  
  // Check if quotes collection exists
  const collections = await db.listCollections({ name: 'quotes' }).toArray();
  if (collections.length === 0) {
    console.log('  ℹ Quotes collection does not exist, nothing to rollback');
    return 0;
  }
  
  const result = await quotesCollection.updateMany(
    { selectedEvents: { $exists: true } },
    {
      $unset: {
        selectedEvents: '',
      },
    }
  );
  
  console.log(`  ✓ Removed selectedEvents field from ${result.modifiedCount} quotes`);
  return result.modifiedCount;
}

async function restoreActivitiesIncluded(db) {
  console.log('Step 2: Attempting to restore activitiesIncluded from internalNotes...');
  
  const quotesCollection = db.collection('quotes');
  
  const quotesWithMigratedNotes = await quotesCollection.find({
    internalNotes: { $regex: /\[Migrated Activities\]:/ },
  }).toArray();
  
  if (quotesWithMigratedNotes.length === 0) {
    console.log('  ℹ No quotes with migrated activities to restore');
    return 0;
  }
  
  let restoredCount = 0;
  for (const quote of quotesWithMigratedNotes) {
    const notes = quote.internalNotes || '';
    // Use multiline flag for better compatibility
    const match = notes.match(/\[Migrated Activities\]:\s*(.+?)(?:\n\n|$)/);
    
    if (match && match[1]) {
      const activitiesText = match[1].trim();
      
      // Remove the migrated activities section from notes
      const cleanedNotes = notes
        .replace(/\n\n\[Migrated Activities\]:.+?(?=\n\n|$)/, '')
        .replace(/^\[Migrated Activities\]:.+?(?=\n\n|$)/, '')
        .trim();
      
      await quotesCollection.updateOne(
        { _id: quote._id },
        {
          $set: {
            activitiesIncluded: activitiesText,
            internalNotes: cleanedNotes || undefined,
          },
        }
      );
      restoredCount++;
    }
  }
  
  console.log(`  ✓ Restored activitiesIncluded for ${restoredCount} quotes`);
  return restoredCount;
}

async function dropIndexes(db) {
  console.log('Step 3: Dropping index on selectedEvents.eventId...');
  
  const quotesCollection = db.collection('quotes');
  
  try {
    await quotesCollection.dropIndex('selected_events_event_id_idx');
    console.log('  ✓ Dropped index: selected_events_event_id_idx');
  } catch (error) {
    if (error.code === 27 || error.codeName === 'IndexNotFound') {
      console.log('  ℹ Index selected_events_event_id_idx does not exist, skipping...');
    } else {
      throw error;
    }
  }
}

async function removeMigrationRecord(db) {
  console.log('Step 4: Removing migration record from database...');
  
  await db.collection('migrations').deleteOne({ version: '010' });
  
  console.log('  ✓ Migration record removed');
}

async function rollbackMigration() {
  console.log('='.repeat(60));
  console.log('Rolling Back Migration 010: Add Events to Quotes');
  console.log('='.repeat(60));
  console.log();

  try {
    // Confirm rollback
    const confirmed = await confirmRollback();
    if (!confirmed) {
      console.log('\n❌ Rollback cancelled by user');
      process.exit(0);
    }

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('\nConnecting to MongoDB...');
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;
    console.log('✅ Connected to MongoDB');
    console.log();

    // Run rollback steps
    const removedCount = await removeSelectedEventsField(db);
    const restoredCount = await restoreActivitiesIncluded(db);
    await dropIndexes(db);
    await removeMigrationRecord(db);

    console.log();
    console.log('='.repeat(60));
    console.log('✅ Rollback completed successfully!');
    console.log('='.repeat(60));
    console.log();
    console.log('Summary:');
    console.log(`  - Quotes with selectedEvents removed: ${removedCount}`);
    console.log(`  - Quotes with activitiesIncluded restored: ${restoredCount}`);
    console.log();
    console.log('The quotes collection has been restored to its previous state.');
    console.log('You can re-run the migration with: node scripts/run-quote-events-migration.js');
    console.log();
  } catch (error) {
    console.error();
    console.error('='.repeat(60));
    console.error('❌ Rollback failed!');
    console.error('='.repeat(60));
    console.error();
    console.error('Error:', error.message);
    console.error();
    console.error('Stack trace:');
    console.error(error.stack);
    console.error();
    console.error('Please check the database state manually.');
    process.exit(1);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the rollback
rollbackMigration();
