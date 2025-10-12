import mongoose from 'mongoose';
import { connectToDatabase } from '../mongodb';

export const up = async (): Promise<void> => {
  console.log('Running migration: 008-create-super-packages-collection');

  await connectToDatabase();
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error('Database connection not established');
  }

  // Create super_offer_packages collection
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
            name: {
              bsonType: 'string',
              description: 'Package name is required'
            },
            destination: {
              bsonType: 'string',
              description: 'Destination is required'
            },
            resort: {
              bsonType: 'string',
              description: 'Resort is required'
            },
            currency: {
              enum: ['EUR', 'GBP', 'USD'],
              description: 'Currency must be EUR, GBP, or USD'
            },
            groupSizeTiers: {
              bsonType: 'array',
              minItems: 1,
              description: 'At least one group size tier is required',
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
              description: 'At least one duration option is required',
              items: {
                bsonType: 'int',
                minimum: 1
              }
            },
            pricingMatrix: {
              bsonType: 'array',
              minItems: 1,
              description: 'At least one pricing entry is required',
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
                        price: {
                          bsonType: ['double', 'int', 'string'],
                          description: 'Price must be a number or "ON_REQUEST"'
                        }
                      }
                    }
                  }
                }
              }
            },
            inclusions: {
              bsonType: 'array',
              items: {
                bsonType: 'object',
                required: ['text'],
                properties: {
                  text: { bsonType: 'string' },
                  category: {
                    enum: ['transfer', 'accommodation', 'activity', 'service', 'other', null]
                  }
                }
              }
            },
            accommodationExamples: {
              bsonType: 'array',
              items: { bsonType: 'string' }
            },
            salesNotes: {
              bsonType: 'string'
            },
            status: {
              enum: ['active', 'inactive', 'deleted'],
              description: 'Status must be active, inactive, or deleted'
            },
            version: {
              bsonType: 'int',
              minimum: 1,
              description: 'Version must be at least 1'
            },
            createdBy: {
              bsonType: 'objectId',
              description: 'Created by user ID is required'
            },
            lastModifiedBy: {
              bsonType: 'objectId',
              description: 'Last modified by user ID is required'
            },
            importSource: {
              enum: ['csv', 'manual', null],
              description: 'Import source must be csv or manual'
            },
            originalFilename: {
              bsonType: ['string', 'null']
            },
            createdAt: {
              bsonType: 'date'
            },
            updatedAt: {
              bsonType: 'date'
            }
          }
        }
      }
    });
    console.log('Created super_offer_packages collection with validation');
  } else {
    console.log('super_offer_packages collection already exists');
  }

  // Create indexes for performance
  const indexesCreated = [];

  // Compound index for status and destination filtering
  await db.collection('super_offer_packages').createIndex(
    { status: 1, destination: 1 },
    { name: 'status_destination_idx' }
  );
  indexesCreated.push('status_destination_idx');

  // Index for sorting by creation date
  await db.collection('super_offer_packages').createIndex(
    { createdAt: -1 },
    { name: 'created_at_desc_idx' }
  );
  indexesCreated.push('created_at_desc_idx');

  // Text index for search functionality
  await db.collection('super_offer_packages').createIndex(
    { name: 'text', destination: 'text' },
    { name: 'name_destination_text_idx' }
  );
  indexesCreated.push('name_destination_text_idx');

  // Additional indexes for common queries
  await db.collection('super_offer_packages').createIndex(
    { name: 1 },
    { name: 'name_idx' }
  );
  indexesCreated.push('name_idx');

  await db.collection('super_offer_packages').createIndex(
    { resort: 1 },
    { name: 'resort_idx' }
  );
  indexesCreated.push('resort_idx');

  console.log(`Created indexes: ${indexesCreated.join(', ')}`);

  // Create super_offer_package_history collection for version tracking
  const historyCollections = await db.listCollections({ name: 'super_offer_package_history' }).toArray();
  
  if (historyCollections.length === 0) {
    await db.createCollection('super_offer_package_history');
    console.log('Created super_offer_package_history collection');

    // Create indexes for history collection
    await db.collection('super_offer_package_history').createIndex(
      { packageId: 1, version: -1 },
      { name: 'package_version_idx' }
    );
    await db.collection('super_offer_package_history').createIndex(
      { modifiedAt: -1 },
      { name: 'modified_at_desc_idx' }
    );
    console.log('Created indexes for super_offer_package_history collection');
  } else {
    console.log('super_offer_package_history collection already exists');
  }

  // Add linkedPackage field to quotes collection if it exists
  const quotesCollections = await db.listCollections({ name: 'quotes' }).toArray();
  
  if (quotesCollections.length > 0) {
    // Create index for linkedPackage.packageId in quotes collection
    await db.collection('quotes').createIndex(
      { 'linkedPackage.packageId': 1 },
      { name: 'linked_package_id_idx', sparse: true }
    );
    console.log('Created linkedPackage.packageId index on quotes collection');
  } else {
    console.log('Quotes collection does not exist yet, skipping linkedPackage index');
  }

  console.log('Migration 008-create-super-packages-collection completed successfully');
};

export const down = async (): Promise<void> => {
  console.log('Rolling back migration: 008-create-super-packages-collection');

  await connectToDatabase();
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error('Database connection not established');
  }

  // Drop indexes from quotes collection
  const quotesCollections = await db.listCollections({ name: 'quotes' }).toArray();
  if (quotesCollections.length > 0) {
    try {
      await db.collection('quotes').dropIndex('linked_package_id_idx');
      console.log('Dropped linkedPackage.packageId index from quotes collection');
    } catch (error) {
      console.log('Index linked_package_id_idx does not exist or already dropped');
    }
  }

  // Drop the super_offer_package_history collection
  const historyCollections = await db.listCollections({ name: 'super_offer_package_history' }).toArray();
  if (historyCollections.length > 0) {
    await db.collection('super_offer_package_history').drop();
    console.log('Dropped super_offer_package_history collection');
  }

  // Drop the super_offer_packages collection
  const collections = await db.listCollections({ name: 'super_offer_packages' }).toArray();
  if (collections.length > 0) {
    await db.collection('super_offer_packages').drop();
    console.log('Dropped super_offer_packages collection');
  }

  console.log('Migration 008-create-super-packages-collection rolled back successfully');
};
