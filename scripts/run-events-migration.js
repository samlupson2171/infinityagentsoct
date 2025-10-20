#!/usr/bin/env node

/**
 * Migration Script: Create Events and Categories Collections
 * 
 * This script:
 * 1. Seeds predefined system categories (Day, Night, Adult, Stag, Hen)
 * 2. Migrates hardcoded events to the database
 * 3. Updates existing enquiries to use event ObjectIds instead of strings
 * 
 * Usage:
 *   node scripts/run-events-migration.js
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Import the migration functions
const { up } = require('../src/lib/migrations/009-create-events-collection.ts');

async function runMigration() {
  console.log('='.repeat(60));
  console.log('Events and Categories Migration');
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
    console.log('✓ Connected to MongoDB');
    console.log();

    // Run the migration
    await up();

    console.log();
    console.log('='.repeat(60));
    console.log('✓ Migration completed successfully!');
    console.log('='.repeat(60));
    console.log();
    console.log('Summary:');
    console.log('- System categories created (Day, Night, Adult, Stag, Hen)');
    console.log('- Hardcoded events migrated to database');
    console.log('- Existing enquiries updated to use event ObjectIds');
    console.log();
  } catch (error) {
    console.error();
    console.error('='.repeat(60));
    console.error('✗ Migration failed!');
    console.error('='.repeat(60));
    console.error();
    console.error('Error:', error.message);
    console.error();
    if (error.stack) {
      console.error('Stack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the migration
runMigration();
