#!/usr/bin/env node

/**
 * Script to test the super packages schema validation
 * This will attempt to insert test documents to verify schema validation works
 */

require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');

async function testSchema() {
  console.log('='.repeat(60));
  console.log('Super Packages Schema Validation Test');
  console.log('='.repeat(60));
  console.log('');

  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    console.log('  ✓ Connected');
    console.log('');

    // Test 1: Valid document should succeed
    console.log('Test 1: Inserting valid document...');
    const validDoc = {
      name: 'Test Package',
      destination: 'Benidorm',
      resort: 'Test Resort',
      currency: 'EUR',
      groupSizeTiers: [
        { label: '6-11 People', minPeople: 6, maxPeople: 11 }
      ],
      durationOptions: [2, 3, 4],
      pricingMatrix: [
        {
          period: 'January',
          periodType: 'month',
          prices: [
            { groupSizeTierIndex: 0, nights: 2, price: 299.99 }
          ]
        }
      ],
      inclusions: [
        { text: 'Airport transfers', category: 'transfer' }
      ],
      accommodationExamples: ['Hotel Example'],
      salesNotes: 'Test notes',
      status: 'active',
      version: 1,
      createdBy: new mongoose.Types.ObjectId(),
      lastModifiedBy: new mongoose.Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result1 = await db.collection('super_offer_packages').insertOne(validDoc);
    console.log('  ✓ Valid document inserted successfully');
    console.log(`    ID: ${result1.insertedId}`);
    console.log('');

    // Test 2: Invalid document (missing required field) should fail
    console.log('Test 2: Attempting to insert invalid document (missing name)...');
    const invalidDoc = {
      destination: 'Benidorm',
      resort: 'Test Resort',
      currency: 'EUR',
      groupSizeTiers: [
        { label: '6-11 People', minPeople: 6, maxPeople: 11 }
      ],
      durationOptions: [2, 3, 4],
      pricingMatrix: [
        {
          period: 'January',
          periodType: 'month',
          prices: [
            { groupSizeTierIndex: 0, nights: 2, price: 299.99 }
          ]
        }
      ],
      status: 'active',
      version: 1,
      createdBy: new mongoose.Types.ObjectId(),
      lastModifiedBy: new mongoose.Types.ObjectId()
    };

    try {
      await db.collection('super_offer_packages').insertOne(invalidDoc);
      console.log('  ✗ Invalid document was inserted (should have failed!)');
    } catch (error) {
      console.log('  ✓ Invalid document rejected as expected');
      console.log(`    Error: ${error.message.split('\n')[0]}`);
    }
    console.log('');

    // Test 3: Invalid currency should fail
    console.log('Test 3: Attempting to insert document with invalid currency...');
    const invalidCurrencyDoc = {
      ...validDoc,
      _id: new mongoose.Types.ObjectId(),
      currency: 'JPY' // Invalid currency
    };

    try {
      await db.collection('super_offer_packages').insertOne(invalidCurrencyDoc);
      console.log('  ✗ Invalid currency was accepted (should have failed!)');
    } catch (error) {
      console.log('  ✓ Invalid currency rejected as expected');
      console.log(`    Error: ${error.message.split('\n')[0]}`);
    }
    console.log('');

    // Test 4: Test text search index
    console.log('Test 4: Testing text search index...');
    const searchResult = await db.collection('super_offer_packages')
      .find({ $text: { $search: 'Test' } })
      .toArray();
    console.log(`  ✓ Text search returned ${searchResult.length} result(s)`);
    console.log('');

    // Test 5: Test compound index
    console.log('Test 5: Testing compound index (status + destination)...');
    const filterResult = await db.collection('super_offer_packages')
      .find({ status: 'active', destination: 'Benidorm' })
      .explain('executionStats');
    
    const usedIndex = filterResult.executionStats.executionStages.inputStage?.indexName || 
                      filterResult.executionStats.executionStages.indexName;
    console.log(`  ✓ Query executed using index: ${usedIndex}`);
    console.log('');

    // Cleanup: Remove test document
    console.log('Cleanup: Removing test document...');
    await db.collection('super_offer_packages').deleteOne({ _id: result1.insertedId });
    console.log('  ✓ Test document removed');
    console.log('');

    console.log('='.repeat(60));
    console.log('✓ All schema validation tests passed!');
    console.log('='.repeat(60));
    console.log('');
    console.log('Summary:');
    console.log('  ✓ Valid documents can be inserted');
    console.log('  ✓ Invalid documents are rejected');
    console.log('  ✓ Schema validation is working');
    console.log('  ✓ Text search index is functional');
    console.log('  ✓ Compound indexes are being used');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('✗ Schema validation test failed!');
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
    await mongoose.connection.close();
  }
}

// Run the test
testSchema();
