/**
 * Simple Integration Test: Quote Title and Destination Fields
 * Tests database operations directly
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function main() {
  try {
    console.log('='.repeat(60));
    console.log('QUOTE TITLE & DESTINATION INTEGRATION TESTS');
    console.log('='.repeat(60));
    console.log();

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const quotesCollection = db.collection('quotes');
    const enquiriesCollection = db.collection('enquiries');
    const usersCollection = db.collection('users');

    // Get test data
    const testAdmin = await usersCollection.findOne({ role: 'admin' });
    const testEnquiry = await enquiriesCollection.findOne();

    if (!testAdmin || !testEnquiry) {
      console.error('❌ Missing test data. Please run setup.js first.');
      process.exit(1);
    }

    console.log(`Using admin: ${testAdmin.name}`);
    console.log(`Using enquiry: ${testEnquiry._id}`);
    console.log();

    let passed = 0;
    let failed = 0;

    // ========================================
    // TEST 3.1: Quote Creation with New Fields
    // ========================================
    console.log('TEST 3.1: Quote Creation with New Fields');
    console.log('-'.repeat(60));

    // Test 3.1.1: Create quote with title and destination
    console.log('\n3.1.1: Create quote with title and destination populated');
    try {
      const quoteWithFields = {
        enquiryId: testEnquiry._id,
        title: 'Summer Beach Getaway 2025',
        destination: 'Benidorm',
        leadName: 'John Smith',
        hotelName: 'Hotel Paradise',
        numberOfPeople: 4,
        numberOfRooms: 2,
        numberOfNights: 7,
        arrivalDate: new Date('2025-07-15'),
        isSuperPackage: false,
        whatsIncluded: 'Accommodation, breakfast, and airport transfers',
        transferIncluded: true,
        activitiesIncluded: 'Beach activities and city tour',
        totalPrice: 1200,
        currency: 'GBP',
        createdBy: testAdmin._id,
        status: 'draft',
        version: 1,
        emailSent: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await quotesCollection.insertOne(quoteWithFields);
      const savedQuote = await quotesCollection.findOne({ _id: result.insertedId });

      if (savedQuote && savedQuote.title === 'Summer Beach Getaway 2025' && savedQuote.destination === 'Benidorm') {
        console.log('✅ PASS: Quote created with title and destination');
        console.log(`   Title: "${savedQuote.title}", Destination: "${savedQuote.destination}"`);
        passed++;
      } else {
        console.log('❌ FAIL: Quote data mismatch');
        failed++;
      }

      // Clean up
      await quotesCollection.deleteOne({ _id: result.insertedId });
    } catch (error) {
      console.log('❌ FAIL:', error.message);
      failed++;
    }

    // Test 3.1.2: Create quote without title and destination
    console.log('\n3.1.2: Create quote with title and destination empty');
    try {
      const quoteWithoutFields = {
        enquiryId: testEnquiry._id,
        leadName: 'Jane Doe',
        hotelName: 'Hotel Sunshine',
        numberOfPeople: 2,
        numberOfRooms: 1,
        numberOfNights: 5,
        arrivalDate: new Date('2025-08-20'),
        isSuperPackage: false,
        whatsIncluded: 'Accommodation and breakfast',
        transferIncluded: false,
        totalPrice: 800,
        currency: 'GBP',
        createdBy: testAdmin._id,
        status: 'draft',
        version: 1,
        emailSent: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await quotesCollection.insertOne(quoteWithoutFields);
      const savedQuote = await quotesCollection.findOne({ _id: result.insertedId });

      if (savedQuote && !savedQuote.title && !savedQuote.destination) {
        console.log('✅ PASS: Quote created without title and destination');
        console.log('   Optional fields correctly omitted');
        passed++;
      } else {
        console.log('❌ FAIL: Unexpected field values');
        failed++;
      }

      // Clean up
      await quotesCollection.deleteOne({ _id: result.insertedId });
    } catch (error) {
      console.log('❌ FAIL:', error.message);
      failed++;
    }

    // Test 3.1.3: Verify data is saved correctly
    console.log('\n3.1.3: Verify data is saved correctly to the database');
    try {
      const testQuote = {
        enquiryId: testEnquiry._id,
        title: 'Persistence Test',
        destination: 'Marbella',
        leadName: 'Test User',
        hotelName: 'Test Hotel',
        numberOfPeople: 3,
        numberOfRooms: 2,
        numberOfNights: 4,
        arrivalDate: new Date('2025-10-10'),
        isSuperPackage: false,
        whatsIncluded: 'Test inclusions',
        transferIncluded: true,
        totalPrice: 900,
        currency: 'EUR',
        createdBy: testAdmin._id,
        status: 'draft',
        version: 1,
        emailSent: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await quotesCollection.insertOne(testQuote);
      const savedQuote = await quotesCollection.findOne({ _id: result.insertedId });

      if (savedQuote && 
          savedQuote.title === 'Persistence Test' && 
          savedQuote.destination === 'Marbella' &&
          savedQuote.totalPrice === 900) {
        console.log('✅ PASS: Data persisted correctly');
        console.log('   All fields saved and retrievable');
        passed++;
      } else {
        console.log('❌ FAIL: Data persistence issue');
        failed++;
      }

      // Clean up
      await quotesCollection.deleteOne({ _id: result.insertedId });
    } catch (error) {
      console.log('❌ FAIL:', error.message);
      failed++;
    }

    // ========================================
    // TEST 3.2: Quote Editing with New Fields
    // ========================================
    console.log('\n\nTEST 3.2: Quote Editing with New Fields');
    console.log('-'.repeat(60));

    // Test 3.2.1: Add title and destination to existing quote
    console.log('\n3.2.1: Edit existing quote and add title and destination');
    try {
      const originalQuote = {
        enquiryId: testEnquiry._id,
        leadName: 'Edit Test User',
        hotelName: 'Edit Test Hotel',
        numberOfPeople: 2,
        numberOfRooms: 1,
        numberOfNights: 3,
        arrivalDate: new Date('2025-11-15'),
        isSuperPackage: false,
        whatsIncluded: 'Original inclusions',
        transferIncluded: false,
        totalPrice: 600,
        currency: 'GBP',
        createdBy: testAdmin._id,
        status: 'draft',
        version: 1,
        emailSent: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await quotesCollection.insertOne(originalQuote);
      
      // Update to add title and destination
      await quotesCollection.updateOne(
        { _id: result.insertedId },
        { 
          $set: { 
            title: 'Added Title After Creation',
            destination: 'Albufeira',
            updatedAt: new Date()
          }
        }
      );

      const updatedQuote = await quotesCollection.findOne({ _id: result.insertedId });

      if (updatedQuote && 
          updatedQuote.title === 'Added Title After Creation' && 
          updatedQuote.destination === 'Albufeira') {
        console.log('✅ PASS: Title and destination added to existing quote');
        console.log(`   Title: "${updatedQuote.title}", Destination: "${updatedQuote.destination}"`);
        passed++;
      } else {
        console.log('❌ FAIL: Update failed');
        failed++;
      }

      // Clean up
      await quotesCollection.deleteOne({ _id: result.insertedId });
    } catch (error) {
      console.log('❌ FAIL:', error.message);
      failed++;
    }

    // Test 3.2.2: Modify existing title and destination
    console.log('\n3.2.2: Edit existing quote and modify existing title and destination');
    try {
      const quoteToModify = {
        enquiryId: testEnquiry._id,
        title: 'Original Title',
        destination: 'Original Destination',
        leadName: 'Modify Test User',
        hotelName: 'Modify Test Hotel',
        numberOfPeople: 4,
        numberOfRooms: 2,
        numberOfNights: 5,
        arrivalDate: new Date('2025-12-01'),
        isSuperPackage: false,
        whatsIncluded: 'Test inclusions',
        transferIncluded: true,
        totalPrice: 1000,
        currency: 'GBP',
        createdBy: testAdmin._id,
        status: 'draft',
        version: 1,
        emailSent: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await quotesCollection.insertOne(quoteToModify);
      
      // Modify title and destination
      await quotesCollection.updateOne(
        { _id: result.insertedId },
        { 
          $set: { 
            title: 'Modified Title',
            destination: 'Modified Destination',
            updatedAt: new Date()
          }
        }
      );

      const modifiedQuote = await quotesCollection.findOne({ _id: result.insertedId });

      if (modifiedQuote && 
          modifiedQuote.title === 'Modified Title' && 
          modifiedQuote.destination === 'Modified Destination') {
        console.log('✅ PASS: Title and destination modified successfully');
        console.log(`   New Title: "${modifiedQuote.title}", New Destination: "${modifiedQuote.destination}"`);
        passed++;
      } else {
        console.log('❌ FAIL: Modification failed');
        failed++;
      }

      // Clean up
      await quotesCollection.deleteOne({ _id: result.insertedId });
    } catch (error) {
      console.log('❌ FAIL:', error.message);
      failed++;
    }

    // Test 3.2.3: Clear title and destination
    console.log('\n3.2.3: Edit existing quote and clear title and destination');
    try {
      const quoteToClear = {
        enquiryId: testEnquiry._id,
        title: 'Title to Clear',
        destination: 'Destination to Clear',
        leadName: 'Clear Test User',
        hotelName: 'Clear Test Hotel',
        numberOfPeople: 2,
        numberOfRooms: 1,
        numberOfNights: 3,
        arrivalDate: new Date('2026-01-15'),
        isSuperPackage: false,
        whatsIncluded: 'Test inclusions',
        transferIncluded: false,
        totalPrice: 700,
        currency: 'GBP',
        createdBy: testAdmin._id,
        status: 'draft',
        version: 1,
        emailSent: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await quotesCollection.insertOne(quoteToClear);
      
      // Clear title and destination
      await quotesCollection.updateOne(
        { _id: result.insertedId },
        { 
          $unset: { 
            title: '',
            destination: ''
          },
          $set: {
            updatedAt: new Date()
          }
        }
      );

      const clearedQuote = await quotesCollection.findOne({ _id: result.insertedId });

      if (clearedQuote && !clearedQuote.title && !clearedQuote.destination) {
        console.log('✅ PASS: Title and destination cleared successfully');
        console.log('   Fields removed from document');
        passed++;
      } else {
        console.log('❌ FAIL: Clear operation failed');
        failed++;
      }

      // Verify other fields remain intact
      if (clearedQuote && clearedQuote.leadName === 'Clear Test User' && clearedQuote.totalPrice === 700) {
        console.log('✅ PASS: Other fields intact after clearing');
        passed++;
      } else {
        console.log('❌ FAIL: Other fields affected');
        failed++;
      }

      // Clean up
      await quotesCollection.deleteOne({ _id: result.insertedId });
    } catch (error) {
      console.log('❌ FAIL:', error.message);
      failed++;
    }

    // ========================================
    // TEST 3.3: Package Integration
    // ========================================
    console.log('\n\nTEST 3.3: Package Integration');
    console.log('-'.repeat(60));

    // Test 3.3.1: Link super package with manually entered title and destination
    console.log('\n3.3.1: Link a super package to a quote with manually entered title and destination');
    try {
      const packagesCollection = db.collection('super_offer_packages');
      const testPackage = await packagesCollection.findOne({ status: 'active' });

      if (testPackage) {
        const quoteWithPackage = {
          enquiryId: testEnquiry._id,
          title: 'Manual Title with Package',
          destination: 'Manual Destination',
          leadName: 'Package Test User',
          hotelName: 'Package Test Hotel',
          numberOfPeople: 4,
          numberOfRooms: 2,
          numberOfNights: 7,
          arrivalDate: new Date('2026-02-01'),
          isSuperPackage: true,
          whatsIncluded: 'Package inclusions',
          transferIncluded: true,
          totalPrice: 1500,
          currency: 'GBP',
          createdBy: testAdmin._id,
          status: 'draft',
          version: 1,
          emailSent: false,
          linkedPackage: {
            packageId: testPackage._id,
            packageName: testPackage.packageName,
            packageVersion: testPackage.version,
            selectedTier: {
              tierIndex: 0,
              tierLabel: 'Standard'
            },
            selectedNights: 7,
            selectedPeriod: 'Summer 2026',
            calculatedPrice: 1500,
            priceWasOnRequest: false
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await quotesCollection.insertOne(quoteWithPackage);
        const savedQuote = await quotesCollection.findOne({ _id: result.insertedId });

        if (savedQuote && 
            savedQuote.title === 'Manual Title with Package' && 
            savedQuote.destination === 'Manual Destination' &&
            savedQuote.linkedPackage && 
            savedQuote.linkedPackage.packageId.toString() === testPackage._id.toString()) {
          console.log('✅ PASS: Package linked with manual title and destination');
          console.log('   Manual fields preserved with package link');
          passed++;
        } else {
          console.log('❌ FAIL: Package integration issue');
          failed++;
        }

        // Clean up
        await quotesCollection.deleteOne({ _id: result.insertedId });
      } else {
        console.log('⚠️  SKIP: No active super packages found');
      }
    } catch (error) {
      console.log('❌ FAIL:', error.message);
      failed++;
    }

    // Test 3.3.2: Verify package selection doesn't override title and destination
    console.log('\n3.3.2: Verify that package selection does not override title and destination');
    try {
      const packagesCollection = db.collection('super_offer_packages');
      const testPackage = await packagesCollection.findOne({ status: 'active' });

      if (testPackage) {
        const quoteBeforePackage = {
          enquiryId: testEnquiry._id,
          title: 'Pre-existing Title',
          destination: 'Pre-existing Destination',
          leadName: 'Override Test User',
          hotelName: 'Override Test Hotel',
          numberOfPeople: 2,
          numberOfRooms: 1,
          numberOfNights: 5,
          arrivalDate: new Date('2026-03-01'),
          isSuperPackage: false,
          whatsIncluded: 'Initial inclusions',
          transferIncluded: false,
          totalPrice: 800,
          currency: 'GBP',
          createdBy: testAdmin._id,
          status: 'draft',
          version: 1,
          emailSent: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await quotesCollection.insertOne(quoteBeforePackage);
        
        // Link package WITHOUT changing title/destination
        await quotesCollection.updateOne(
          { _id: result.insertedId },
          { 
            $set: { 
              isSuperPackage: true,
              linkedPackage: {
                packageId: testPackage._id,
                packageName: testPackage.packageName,
                packageVersion: testPackage.version,
                selectedTier: {
                  tierIndex: 0,
                  tierLabel: 'Standard'
                },
                selectedNights: 5,
                selectedPeriod: 'Spring 2026',
                calculatedPrice: 900,
                priceWasOnRequest: false
              },
              updatedAt: new Date()
            }
          }
        );

        const quoteAfterPackage = await quotesCollection.findOne({ _id: result.insertedId });

        if (quoteAfterPackage && 
            quoteAfterPackage.title === 'Pre-existing Title' && 
            quoteAfterPackage.destination === 'Pre-existing Destination' &&
            quoteAfterPackage.linkedPackage) {
          console.log('✅ PASS: Package selection preserved title and destination');
          console.log('   Title and destination unchanged after package link');
          passed++;
        } else {
          console.log('❌ FAIL: Title/destination were overridden');
          failed++;
        }

        // Clean up
        await quotesCollection.deleteOne({ _id: result.insertedId });
      } else {
        console.log('⚠️  SKIP: No active super packages found');
      }
    } catch (error) {
      console.log('❌ FAIL:', error.message);
      failed++;
    }

    // Test 3.3.3: Verify all package-related functionality continues to work
    console.log('\n3.3.3: Verify that all package-related functionality continues to work');
    try {
      const packagesCollection = db.collection('super_offer_packages');
      const testPackage = await packagesCollection.findOne({ status: 'active' });

      if (testPackage) {
        const functionalQuote = {
          enquiryId: testEnquiry._id,
          title: 'Functional Test Quote',
          destination: 'Test Destination',
          leadName: 'Functional Test User',
          hotelName: 'Functional Test Hotel',
          numberOfPeople: 3,
          numberOfRooms: 2,
          numberOfNights: 6,
          arrivalDate: new Date('2026-04-01'),
          isSuperPackage: true,
          whatsIncluded: 'Full package inclusions',
          transferIncluded: true,
          totalPrice: 1200,
          currency: 'GBP',
          createdBy: testAdmin._id,
          status: 'draft',
          version: 1,
          emailSent: false,
          linkedPackage: {
            packageId: testPackage._id,
            packageName: testPackage.packageName,
            packageVersion: testPackage.version,
            selectedTier: {
              tierIndex: 1,
              tierLabel: 'Premium'
            },
            selectedNights: 6,
            selectedPeriod: 'Spring 2026',
            calculatedPrice: 1200,
            priceWasOnRequest: false
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await quotesCollection.insertOne(functionalQuote);
        const savedQuote = await quotesCollection.findOne({ _id: result.insertedId });

        // Verify all package fields are intact
        if (savedQuote && 
            savedQuote.linkedPackage &&
            savedQuote.linkedPackage.packageId &&
            savedQuote.linkedPackage.selectedTier &&
            savedQuote.linkedPackage.calculatedPrice === 1200) {
          console.log('✅ PASS: All package-related functionality works');
          console.log('   Package data structure intact');
          passed++;
        } else {
          console.log('❌ FAIL: Package functionality broken');
          failed++;
        }

        // Clean up
        await quotesCollection.deleteOne({ _id: result.insertedId });
      } else {
        console.log('⚠️  SKIP: No active super packages found');
      }
    } catch (error) {
      console.log('❌ FAIL:', error.message);
      failed++;
    }

    // ========================================
    // TEST 3.4: Validation and Error Handling
    // ========================================
    console.log('\n\nTEST 3.4: Validation and Error Handling');
    console.log('-'.repeat(60));

    // Test 3.4.1: Special characters handling
    console.log('\n3.4.1: Test with special characters and edge cases');
    try {
      const specialCharsQuote = {
        enquiryId: testEnquiry._id,
        title: 'Quote with Spëcial Çhars & Émojis 🌴☀️',
        destination: 'Málaga, España',
        leadName: 'Special Chars Test',
        hotelName: 'Test Hotel',
        numberOfPeople: 2,
        numberOfRooms: 1,
        numberOfNights: 3,
        arrivalDate: new Date('2026-06-01'),
        isSuperPackage: false,
        whatsIncluded: 'Test',
        transferIncluded: false,
        totalPrice: 500,
        currency: 'GBP',
        createdBy: testAdmin._id,
        status: 'draft',
        version: 1,
        emailSent: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await quotesCollection.insertOne(specialCharsQuote);
      const savedQuote = await quotesCollection.findOne({ _id: result.insertedId });

      if (savedQuote && 
          savedQuote.title.includes('Spëcial') && 
          savedQuote.destination.includes('Málaga')) {
        console.log('✅ PASS: Special characters handled correctly');
        console.log('   Accents and emojis preserved');
        passed++;
      } else {
        console.log('❌ FAIL: Special characters not preserved');
        failed++;
      }

      // Clean up
      await quotesCollection.deleteOne({ _id: result.insertedId });
    } catch (error) {
      console.log('❌ FAIL:', error.message);
      failed++;
    }

    // Test 3.4.2: Empty string handling
    console.log('\n3.4.2: Test empty strings vs undefined');
    try {
      const emptyStringQuote = {
        enquiryId: testEnquiry._id,
        title: '',
        destination: '',
        leadName: 'Empty String Test',
        hotelName: 'Test Hotel',
        numberOfPeople: 2,
        numberOfRooms: 1,
        numberOfNights: 3,
        arrivalDate: new Date('2026-07-01'),
        isSuperPackage: false,
        whatsIncluded: 'Test',
        transferIncluded: false,
        totalPrice: 500,
        currency: 'GBP',
        createdBy: testAdmin._id,
        status: 'draft',
        version: 1,
        emailSent: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await quotesCollection.insertOne(emptyStringQuote);
      const savedQuote = await quotesCollection.findOne({ _id: result.insertedId });

      if (savedQuote && savedQuote.title === '' && savedQuote.destination === '') {
        console.log('✅ PASS: Empty strings handled correctly');
        console.log('   Empty strings accepted and preserved');
        passed++;
      } else {
        console.log('❌ FAIL: Empty string handling issue');
        failed++;
      }

      // Clean up
      await quotesCollection.deleteOne({ _id: result.insertedId });
    } catch (error) {
      console.log('❌ FAIL:', error.message);
      failed++;
    }

    // ========================================
    // Print Summary
    // ========================================
    console.log('\n');
    console.log('='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${passed + failed}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log('='.repeat(60));

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Test execution error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

main();
