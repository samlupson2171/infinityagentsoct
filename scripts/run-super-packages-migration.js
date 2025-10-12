#!/usr/bin/env node

/**
 * Script to run the super packages migration (008)
 * This will:
 * 1. Create the super_offer_packages collection with validation
 * 2. Create all necessary indexes
 * 3. Create the super_offer_package_history collection
 * 4. Add linkedPackage index to quotes collection
 */

require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');

async function createSuperPackagesCollection(db) {
  console.log('Creating super_offer_packages collection...');
  
  const collections = await db.listCollections({ name: 'super_offer_packages' }).toArray();
  
  if (collections.length === 0) {
    await db.createCollection('super_offer_packages', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: [
            'name',
            'destination',
            'resort',
            'currency',
            'groupSizeTiers',
            'durationOptions',
            'pricingMatrix',
            'status',
            'version',
            'createdBy',
            'lastModifiedBy'
          ],
          properties: {
            name: { bsonType: 'string' },
            destination: { bsonType: 'string' },
            resort: { bsonType: 'string' },
            currency: { enum: ['EUR', 'GBP', 'USD'] },
            groupSizeTiers: {
              bsonType: 'array',
              minItems: 1,
              items: {
                bsonType: 'object',
                required: ['label', 'minPeople', 'maxPeople'],
                properties: {
                  label: { bsonType: 'string' },
                  minPeople: { bsonType: 'int', minimum: 1 },
                  maxPeople: { bsonType: 'int', minimum: 1 }
                }
              }
            },
            durationOptions: {
              bsonType: 'array',
              minItems: 1,
              items: { bsonType: 'int', minimum: 1 }
            },
            pricingMatrix: {
              bsonType: 'array',
              minItems: 1,
              items: {
                bsonType: 'object',
                required: ['period', 'periodType', 'prices'],
                properties: {
                  period: { bsonType: 'string' },
                  periodType: { enum: ['month', 'special'] },
                  startDate: { bsonType: ['date', 'null'] },
                  endDate: { bsonType: ['date', 'null'] },
                  prices: {
                    bsonType: 'array',
                    minItems: 1,
                    items: {
                      bsonType: 'object',
                      required: ['groupSizeTierIndex', 'nights', 'price'],
                      properties: {
                        groupSizeTierIndex: { bsonType: 'int', minimum: 0 },
                        nights: { bsonType: 'int', minimum: 1 },
                        price: { bsonType: ['double', 'int', 'string'] }
                      }
                    }
                  }
                }
              }
            },
            status: { enum: ['active', 'inactive', 'deleted'] },
            version: { bsonType: 'int', minimum: 1 }
          }
        }
      }
    });
    console.log('  ✓ Created super_offer_packages collection');
  } else {
    console.log('  ℹ Collection already exists');
  }
}

async function createIndexes(db) {
  console.log('Creating indexes on super_offer_packages...');
  
  const indexesCreated = [];
  
  try {
    await db.collection('super_offer_packages').createIndex(
      { status: 1, destination: 1 },
      { name: 'status_destination_idx' }
    );
    indexesCreated.push('status_destination_idx');
  } catch (e) {
    if (e.code !== 85 && e.code !== 86) throw e; // Ignore if index already exists
  }
  
  try {
    await db.collection('super_offer_packages').createIndex(
      { createdAt: -1 },
      { name: 'created_at_desc_idx' }
    );
    indexesCreated.push('created_at_desc_idx');
  } catch (e) {
    if (e.code !== 85 && e.code !== 86) throw e;
  }
  
  try {
    await db.collection('super_offer_packages').createIndex(
      { name: 'text', destination: 'text' },
      { name: 'name_destination_text_idx' }
    );
    indexesCreated.push('name_destination_text_idx');
  } catch (e) {
    if (e.code !== 85 && e.code !== 86) throw e;
  }
  
  try {
    await db.collection('super_offer_packages').createIndex(
      { name: 1 },
      { name: 'name_idx' }
    );
    indexesCreated.push('name_idx');
  } catch (e) {
    if (e.code !== 85 && e.code !== 86) throw e;
  }
  
  try {
    await db.collection('super_offer_packages').createIndex(
      { resort: 1 },
      { name: 'resort_idx' }
    );
    indexesCreated.push('resort_idx');
  } catch (e) {
    if (e.code !== 85 && e.code !== 86) throw e;
  }
  
  console.log(`  ✓ Created ${indexesCreated.length} indexes: ${indexesCreated.join(', ')}`);
}

async function createHistoryCollection(db) {
  console.log('Creating super_offer_package_history collection...');
  
  const collections = await db.listCollections({ name: 'super_offer_package_history' }).toArray();
  
  if (collections.length === 0) {
    await db.createCollection('super_offer_package_history');
    console.log('  ✓ Created super_offer_package_history collection');
    
    await db.collection('super_offer_package_history').createIndex(
      { packageId: 1, version: -1 },
      { name: 'package_version_idx' }
    );
    await db.collection('super_offer_package_history').createIndex(
      { modifiedAt: -1 },
      { name: 'modified_at_desc_idx' }
    );
    console.log('  ✓ Created indexes for history collection');
  } else {
    console.log('  ℹ Collection already exists');
  }
}

async function addQuotesIndex(db) {
  console.log('Adding linkedPackage index to quotes collection...');
  
  const collections = await db.listCollections({ name: 'quotes' }).toArray();
  
  if (collections.length > 0) {
    try {
      await db.collection('quotes').createIndex(
        { 'linkedPackage.packageId': 1 },
        { name: 'linked_package_id_idx', sparse: true }
      );
      console.log('  ✓ Created linkedPackage.packageId index');
    } catch (e) {
      if (e.code === 85 || e.code === 86) {
        console.log('  ℹ Index already exists');
      } else {
        throw e;
      }
    }
  } else {
    console.log('  ℹ Quotes collection does not exist yet (this is OK)');
  }
}

async function recordMigration(db) {
  console.log('Recording migration in database...');
  
  await db.collection('migrations').updateOne(
    { version: '008' },
    {
      $set: {
        version: '008',
        description: 'Create super offer packages collection and add linkedPackage field to quotes',
        appliedAt: new Date(),
        status: 'completed'
      }
    },
    { upsert: true }
  );
  
  console.log('  ✓ Migration recorded');
}

async function verifyMigration(db) {
  console.log('');
  console.log('Verifying migration...');
  console.log('-'.repeat(60));
  
  // Check collections
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map(c => c.name);
  
  console.log('Collections:');
  console.log(`  ${collectionNames.includes('super_offer_packages') ? '✓' : '✗'} super_offer_packages`);
  console.log(`  ${collectionNames.includes('super_offer_package_history') ? '✓' : '✗'} super_offer_package_history`);
  
  // Check indexes
  if (collectionNames.includes('super_offer_packages')) {
    const indexes = await db.collection('super_offer_packages').indexes();
    const indexNames = indexes.map(idx => idx.name);
    
    console.log('');
    console.log('Indexes on super_offer_packages:');
    console.log(`  ${indexNames.includes('status_destination_idx') ? '✓' : '✗'} status_destination_idx`);
    console.log(`  ${indexNames.includes('created_at_desc_idx') ? '✓' : '✗'} created_at_desc_idx`);
    console.log(`  ${indexNames.includes('name_destination_text_idx') ? '✓' : '✗'} name_destination_text_idx`);
    console.log(`  ${indexNames.includes('name_idx') ? '✓' : '✗'} name_idx`);
    console.log(`  ${indexNames.includes('resort_idx') ? '✓' : '✗'} resort_idx`);
  }
  
  if (collectionNames.includes('quotes')) {
    const quotesIndexes = await db.collection('quotes').indexes();
    const quotesIndexNames = quotesIndexes.map(idx => idx.name);
    
    console.log('');
    console.log('Indexes on quotes:');
    console.log(`  ${quotesIndexNames.includes('linked_package_id_idx') ? '✓' : '✗'} linked_package_id_idx`);
  }
  
  console.log('');
}

async function runMigration() {
  console.log('='.repeat(60));
  console.log('Super Packages Migration Script');
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

    // Check if migration already applied
    const migrationRecord = await db.collection('migrations').findOne({ version: '008' });
    if (migrationRecord && migrationRecord.status === 'completed') {
      console.log('⚠️  Migration 008 has already been applied');
      console.log(`   Applied at: ${migrationRecord.appliedAt}`);
      console.log('');
      console.log('To re-run the migration, you must first rollback:');
      console.log('   npm run migrate:super-packages:rollback');
      console.log('');
      process.exit(0);
    }

    // Run migration steps
    await createSuperPackagesCollection(db);
    await createIndexes(db);
    await createHistoryCollection(db);
    await addQuotesIndex(db);
    await recordMigration(db);
    
    // Verify
    await verifyMigration(db);

    console.log('='.repeat(60));
    console.log('✓ Migration completed successfully!');
    console.log('='.repeat(60));
    console.log('');
    console.log('Next steps:');
    console.log('  1. Verify the collections in MongoDB Compass or CLI');
    console.log('  2. Test creating a super package via the admin interface');
    console.log('  3. Test linking a package to a quote');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('✗ Migration failed!');
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

// Run the migration
runMigration();
