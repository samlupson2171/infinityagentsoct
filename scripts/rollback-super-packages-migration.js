#!/usr/bin/env node

/**
 * Script to rollback the super packages migration (008)
 * This will:
 * 1. Drop the linkedPackage index from quotes collection
 * 2. Drop the super_offer_package_history collection
 * 3. Drop the super_offer_packages collection
 */

require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
const readline = require('readline');

async function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

async function rollbackMigration() {
  console.log('='.repeat(60));
  console.log('Super Packages Migration Rollback Script');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Check environment variables
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    console.log('  ✓ Connected');
    console.log('');

    // Check if migration was applied
    const migrationRecord = await db.collection('migrations').findOne({ version: '008' });
    if (!migrationRecord || migrationRecord.status !== 'completed') {
      console.log('⚠️  Migration 008 has not been applied');
      console.log('   Nothing to rollback');
      console.log('');
      process.exit(0);
    }

    console.log('Migration 008 status: Applied');
    console.log(`Applied at: ${migrationRecord.appliedAt}`);
    console.log('');

    // Check for existing data
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    let packageCount = 0;
    let historyCount = 0;
    
    if (collectionNames.includes('super_offer_packages')) {
      packageCount = await db.collection('super_offer_packages').countDocuments();
    }
    
    if (collectionNames.includes('super_offer_package_history')) {
      historyCount = await db.collection('super_offer_package_history').countDocuments();
    }
    
    console.log('Current data:');
    console.log(`  Super packages: ${packageCount}`);
    console.log(`  History records: ${historyCount}`);
    console.log('');

    if (packageCount > 0 || historyCount > 0) {
      console.log('⚠️  WARNING: This will delete all super package data!');
      console.log('');
      
      const confirmed = await askConfirmation('Are you sure you want to proceed? (yes/no): ');
      
      if (!confirmed) {
        console.log('Rollback cancelled');
        process.exit(0);
      }
      console.log('');
    }

    // Perform rollback
    console.log('Rolling back migration...');
    console.log('');

    // Drop linkedPackage index from quotes
    if (collectionNames.includes('quotes')) {
      try {
        await db.collection('quotes').dropIndex('linked_package_id_idx');
        console.log('  ✓ Dropped linkedPackage index from quotes');
      } catch (error) {
        console.log('  ℹ linkedPackage index does not exist or already dropped');
      }
    }

    // Drop history collection
    if (collectionNames.includes('super_offer_package_history')) {
      await db.collection('super_offer_package_history').drop();
      console.log('  ✓ Dropped super_offer_package_history collection');
    }

    // Drop packages collection
    if (collectionNames.includes('super_offer_packages')) {
      await db.collection('super_offer_packages').drop();
      console.log('  ✓ Dropped super_offer_packages collection');
    }

    // Remove migration record
    await db.collection('migrations').deleteOne({ version: '008' });
    console.log('  ✓ Removed migration record');
    console.log('');

    // Verify rollback
    console.log('Verifying rollback...');
    const collectionsAfter = await db.listCollections().toArray();
    const collectionNamesAfter = collectionsAfter.map(c => c.name);
    
    console.log(`  ${!collectionNamesAfter.includes('super_offer_packages') ? '✓' : '✗'} super_offer_packages dropped`);
    console.log(`  ${!collectionNamesAfter.includes('super_offer_package_history') ? '✓' : '✗'} super_offer_package_history dropped`);
    console.log('');

    console.log('='.repeat(60));
    console.log('✓ Rollback completed successfully!');
    console.log('='.repeat(60));
    console.log('');
    console.log('You can now re-run the migration if needed:');
    console.log('  npm run migrate:super-packages');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('✗ Rollback failed!');
    console.error('='.repeat(60));
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    
    if (error.stack) {
      console.error('Stack trace:');
      console.error(error.stack);
    }
    
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
  }
}

// Run the rollback
rollbackMigration();
