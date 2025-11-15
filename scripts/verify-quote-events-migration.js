#!/usr/bin/env node

/**
 * Script to verify migration 010: Add events to quotes
 * 
 * This script verifies:
 * - All quotes have selectedEvents field
 * - activitiesIncluded has been migrated to internalNotes
 * - Indexes are created correctly
 * - Data integrity is maintained
 * 
 * Usage: node scripts/verify-quote-events-migration.js
 */

require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');

async function verifyMigration() {
  console.log('='.repeat(60));
  console.log('Verifying Migration 010: Add Events to Quotes');
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
    console.log('✅ Connected to MongoDB');
    console.log();

    const db = mongoose.connection.db;
    const quotesCollection = db.collection('quotes');

    // Check 1: Verify quotes collection exists
    console.log('Check 1: Verifying quotes collection exists...');
    const collections = await db.listCollections({ name: 'quotes' }).toArray();
    if (collections.length === 0) {
      console.log('⚠️  Quotes collection does not exist');
      return;
    }
    console.log('✅ Quotes collection exists');
    console.log();

    // Check 2: Count total quotes
    console.log('Check 2: Counting quotes...');
    const totalQuotes = await quotesCollection.countDocuments();
    console.log(`✅ Total quotes: ${totalQuotes}`);
    console.log();

    // Check 3: Verify all quotes have selectedEvents field
    console.log('Check 3: Verifying selectedEvents field...');
    const quotesWithoutSelectedEvents = await quotesCollection.countDocuments({
      selectedEvents: { $exists: false },
    });
    
    if (quotesWithoutSelectedEvents > 0) {
      console.log(`❌ Found ${quotesWithoutSelectedEvents} quotes without selectedEvents field`);
      
      // Show sample quotes without the field
      const samples = await quotesCollection
        .find({ selectedEvents: { $exists: false } })
        .limit(3)
        .toArray();
      
      console.log('\nSample quotes without selectedEvents:');
      samples.forEach((quote) => {
        console.log(`  - Quote ID: ${quote._id}`);
      });
    } else {
      console.log('✅ All quotes have selectedEvents field');
    }
    console.log();

    // Check 4: Verify selectedEvents is an array
    console.log('Check 4: Verifying selectedEvents is an array...');
    const quotesWithInvalidSelectedEvents = await quotesCollection.countDocuments({
      selectedEvents: { $exists: true, $not: { $type: 'array' } },
    });
    
    if (quotesWithInvalidSelectedEvents > 0) {
      console.log(`❌ Found ${quotesWithInvalidSelectedEvents} quotes with invalid selectedEvents type`);
    } else {
      console.log('✅ All selectedEvents fields are arrays');
    }
    console.log();

    // Check 5: Count quotes with events
    console.log('Check 5: Counting quotes with selected events...');
    const quotesWithEvents = await quotesCollection.countDocuments({
      selectedEvents: { $exists: true, $ne: [] },
    });
    console.log(`✅ Quotes with selected events: ${quotesWithEvents}`);
    console.log();

    // Check 6: Verify activitiesIncluded migration
    console.log('Check 6: Verifying activitiesIncluded migration...');
    const quotesWithActivities = await quotesCollection.countDocuments({
      activitiesIncluded: { $exists: true, $ne: '', $ne: null },
    });
    
    const quotesWithMigratedNotes = await quotesCollection.countDocuments({
      internalNotes: { $regex: /\[Migrated Activities\]:/ },
    });
    
    console.log(`  - Quotes with activitiesIncluded: ${quotesWithActivities}`);
    console.log(`  - Quotes with migrated notes: ${quotesWithMigratedNotes}`);
    
    if (quotesWithActivities > 0 && quotesWithMigratedNotes > 0) {
      console.log('✅ activitiesIncluded has been migrated to internalNotes');
    } else if (quotesWithActivities === 0) {
      console.log('✅ No quotes had activitiesIncluded to migrate');
    } else {
      console.log('⚠️  Some quotes may not have been migrated');
    }
    console.log();

    // Check 7: Verify indexes
    console.log('Check 7: Verifying indexes...');
    const indexes = await quotesCollection.indexes();
    const selectedEventsIndex = indexes.find(
      (idx) => idx.name === 'selected_events_event_id_idx'
    );
    
    if (selectedEventsIndex) {
      console.log('✅ Index "selected_events_event_id_idx" exists');
      console.log(`   Keys: ${JSON.stringify(selectedEventsIndex.key)}`);
      console.log(`   Sparse: ${selectedEventsIndex.sparse || false}`);
    } else {
      console.log('❌ Index "selected_events_event_id_idx" not found');
    }
    console.log();

    // Check 8: Sample quotes with selectedEvents
    console.log('Check 8: Sampling quotes with selectedEvents...');
    const sampleQuotesWithEvents = await quotesCollection
      .find({ selectedEvents: { $ne: [] } })
      .limit(3)
      .toArray();
    
    if (sampleQuotesWithEvents.length > 0) {
      console.log(`Found ${sampleQuotesWithEvents.length} sample quotes with events:`);
      sampleQuotesWithEvents.forEach((quote, index) => {
        console.log(`\n  Sample ${index + 1}:`);
        console.log(`    Quote ID: ${quote._id}`);
        console.log(`    Events count: ${quote.selectedEvents.length}`);
        quote.selectedEvents.forEach((event, eventIndex) => {
          console.log(`      Event ${eventIndex + 1}:`);
          console.log(`        - Name: ${event.eventName}`);
          console.log(`        - Price: ${event.eventCurrency} ${event.eventPrice}`);
          console.log(`        - Added: ${event.addedAt}`);
        });
      });
    } else {
      console.log('  No quotes with selected events yet (this is normal for new migrations)');
    }
    console.log();

    // Summary
    console.log('='.repeat(60));
    console.log('Verification Summary');
    console.log('='.repeat(60));
    console.log();
    console.log(`Total quotes: ${totalQuotes}`);
    console.log(`Quotes with selectedEvents field: ${totalQuotes - quotesWithoutSelectedEvents}`);
    console.log(`Quotes with events: ${quotesWithEvents}`);
    console.log(`Quotes with migrated activities: ${quotesWithMigratedNotes}`);
    console.log();

    if (quotesWithoutSelectedEvents === 0 && selectedEventsIndex) {
      console.log('✅ Migration verification PASSED');
      console.log();
      console.log('The migration has been successfully applied!');
      console.log('You can now use the event selection feature in quotes.');
    } else {
      console.log('⚠️  Migration verification found issues');
      console.log();
      console.log('Please review the checks above and consider:');
      console.log('1. Re-running the migration: node scripts/run-quote-events-migration.js');
      console.log('2. Checking the migration logs for errors');
      console.log('3. Manually inspecting the database');
    }
    console.log();

  } catch (error) {
    console.error();
    console.error('='.repeat(60));
    console.error('❌ Verification failed!');
    console.error('='.repeat(60));
    console.error();
    console.error('Error:', error.message);
    console.error();
    console.error('Stack trace:');
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the verification
verifyMigration();
