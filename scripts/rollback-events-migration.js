#!/usr/bin/env node

/**
 * Rollback Script: Remove Events and Categories Collections
 * 
 * WARNING: This script will:
 * 1. Revert enquiries to use event names (strings) instead of ObjectIds
 * 2. Drop the events collection
 * 3. Drop the categories collection
 * 
 * This operation cannot be easily undone. Use with caution!
 * 
 * Usage:
 *   node scripts/rollback-events-migration.js
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const readline = require('readline');

// Import the migration functions
const { down } = require('../src/lib/migrations/009-create-events-collection.ts');

async function confirmRollback() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      '\n⚠️  WARNING: This will delete all events and categories data!\n' +
      'Are you sure you want to proceed? (yes/no): ',
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes');
      }
    );
  });
}

async function runRollback() {
  console.log('='.repeat(60));
  console.log('Events and Categories Migration Rollback');
  console.log('='.repeat(60));
  console.log();

  try {
    // Confirm with user
    const confirmed = await confirmRollback();
    if (!confirmed) {
      console.log('\nRollback cancelled by user.');
      process.exit(0);
    }

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('\nConnecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');
    console.log();

    // Run the rollback
    await down();

    console.log();
    console.log('='.repeat(60));
    console.log('✓ Rollback completed successfully!');
    console.log('='.repeat(60));
    console.log();
    console.log('Summary:');
    console.log('- Enquiries reverted to use event names (strings)');
    console.log('- Events collection dropped');
    console.log('- Categories collection dropped');
    console.log();
  } catch (error) {
    console.error();
    console.error('='.repeat(60));
    console.error('✗ Rollback failed!');
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

// Run the rollback
runRollback();
