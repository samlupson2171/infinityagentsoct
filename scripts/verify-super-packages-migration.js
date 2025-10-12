#!/usr/bin/env node

/**
 * Script to verify the super packages migration status
 * This will check:
 * 1. Migration 008 status
 * 2. Collections existence
 * 3. Indexes existence
 * 4. Sample data (if any)
 */

require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');

async function verifyMigration() {
  console.log('='.repeat(60));
  console.log('Super Packages Migration Verification');
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

    // Get migration status
    console.log('Migration Status:');
    console.log('-'.repeat(60));
    const migrationRecord = await db.collection('migrations').findOne({ version: '008' });
    
    if (migrationRecord) {
      console.log(`Version: ${migrationRecord.version}`);
      console.log(`Description: ${migrationRecord.description}`);
      console.log(`Applied: ${migrationRecord.status === 'completed' ? 'Yes ✓' : 'No ✗'}`);
      if (migrationRecord.appliedAt) {
        console.log(`Applied at: ${migrationRecord.appliedAt}`);
      }
    } else {
      console.log('Migration 008: Not applied ✗');
    }
    console.log('');

    // Check collections
    console.log('Collections:');
    console.log('-'.repeat(60));
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    const requiredCollections = [
      'super_offer_packages',
      'super_offer_package_history',
      'quotes'
    ];
    
    for (const collectionName of requiredCollections) {
      const exists = collectionNames.includes(collectionName);
      console.log(`${exists ? '✓' : '✗'} ${collectionName}`);
      
      if (exists) {
        const count = await db.collection(collectionName).countDocuments();
        console.log(`  Documents: ${count}`);
      }
    }
    console.log('');

    // Check indexes on super_offer_packages
    if (collectionNames.includes('super_offer_packages')) {
      console.log('Indexes on super_offer_packages:');
      console.log('-'.repeat(60));
      const packageIndexes = await db.collection('super_offer_packages').indexes();
      
      const expectedIndexes = [
        'status_destination_idx',
        'created_at_desc_idx',
        'name_destination_text_idx',
        'name_idx',
        'resort_idx'
      ];
      
      for (const indexName of expectedIndexes) {
        const exists = packageIndexes.some(idx => idx.name === indexName);
        console.log(`${exists ? '✓' : '✗'} ${indexName}`);
        
        if (exists) {
          const index = packageIndexes.find(idx => idx.name === indexName);
          console.log(`  Keys: ${JSON.stringify(index.key)}`);
        }
      }
      console.log('');
    }

    // Check indexes on super_offer_package_history
    if (collectionNames.includes('super_offer_package_history')) {
      console.log('Indexes on super_offer_package_history:');
      console.log('-'.repeat(60));
      const historyIndexes = await db.collection('super_offer_package_history').indexes();
      
      const expectedHistoryIndexes = [
        'package_version_idx',
        'modified_at_desc_idx'
      ];
      
      for (const indexName of expectedHistoryIndexes) {
        const exists = historyIndexes.some(idx => idx.name === indexName);
        console.log(`${exists ? '✓' : '✗'} ${indexName}`);
        
        if (exists) {
          const index = historyIndexes.find(idx => idx.name === indexName);
          console.log(`  Keys: ${JSON.stringify(index.key)}`);
        }
      }
      console.log('');
    }

    // Check linkedPackage index on quotes
    if (collectionNames.includes('quotes')) {
      console.log('Indexes on quotes collection (linkedPackage):');
      console.log('-'.repeat(60));
      const quotesIndexes = await db.collection('quotes').indexes();
      const linkedPackageIndex = quotesIndexes.find(idx => idx.name === 'linked_package_id_idx');
      
      if (linkedPackageIndex) {
        console.log('✓ linked_package_id_idx');
        console.log(`  Keys: ${JSON.stringify(linkedPackageIndex.key)}`);
        console.log(`  Sparse: ${linkedPackageIndex.sparse || false}`);
      } else {
        console.log('✗ linked_package_id_idx (not found)');
      }
      console.log('');
    }

    // Check for sample data
    if (collectionNames.includes('super_offer_packages')) {
      const samplePackages = await db.collection('super_offer_packages')
        .find({})
        .limit(3)
        .project({ name: 1, destination: 1, resort: 1, status: 1, createdAt: 1 })
        .toArray();
      
      if (samplePackages.length > 0) {
        console.log('Sample Super Packages:');
        console.log('-'.repeat(60));
        samplePackages.forEach((pkg, index) => {
          console.log(`${index + 1}. ${pkg.name}`);
          console.log(`   Destination: ${pkg.destination}`);
          console.log(`   Resort: ${pkg.resort}`);
          console.log(`   Status: ${pkg.status}`);
          console.log(`   Created: ${pkg.createdAt}`);
          console.log('');
        });
      }
    }

    // Summary
    console.log('='.repeat(60));
    console.log('Summary:');
    console.log('-'.repeat(60));
    
    const migrationApplied = migrationRecord && migrationRecord.status === 'completed';
    const collectionsExist = collectionNames.includes('super_offer_packages') &&
                            collectionNames.includes('super_offer_package_history');
    
    if (migrationApplied && collectionsExist) {
      console.log('✓ Migration 008 is properly applied');
      console.log('✓ All required collections exist');
      console.log('✓ System is ready for super packages');
    } else {
      console.log('✗ Migration issues detected');
      if (!migrationApplied) {
        console.log('  - Migration 008 not applied');
        console.log('  - Run: npm run migrate:super-packages');
      }
      if (!collectionNames.includes('super_offer_packages')) {
        console.log('  - super_offer_packages collection missing');
      }
      if (!collectionNames.includes('super_offer_package_history')) {
        console.log('  - super_offer_package_history collection missing');
      }
    }
    console.log('='.repeat(60));
    console.log('');

  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('✗ Verification failed!');
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

// Run the verification
verifyMigration();
