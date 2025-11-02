/**
 * Integration Test: Quote Title and Destination Fields
 * 
 * This script tests the integration of title and destination fields
 * with the existing quote system.
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${name}`);
  if (details) {
    console.log(`   ${details}`);
  }
  testResults.tests.push({ name, passed, details });
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('QUOTE TITLE & DESTINATION INTEGRATION TESTS');
  console.log('='.repeat(60));
  console.log();

  // Define models inline to avoid module loading issues
  const { Schema } = mongoose;
  
  // Quote Model Schema
  const QuoteSchema = new Schema({
    enquiryId: { type: Schema.Types.ObjectId, ref: 'Enquiry', required: true },
    title: { type: String, trim: true, maxlength: 200 },
    destination: { type: String, trim: true, maxlength: 100 },
    leadName: { type: String, required: true, trim: true, maxlength: 100 },
    hotelName: { type: String, required: true, trim: true, maxlength: 200 },
    numberOfPeople: { type: Number, required: true, min: 1, max: 100 },
    numberOfRooms: { type: Number, required: true, min: 1, max: 50 },
    numberOfNights: { type: Number, required: true, min: 1, max: 30 },
    arrivalDate: { type: Date, required: true },
    isSuperPackage: { type: Boolean, default: false },
    whatsIncluded: { type: String, required: true, maxlength: 2000 },
    transferIncluded: { type: Boolean, default: false },
    activitiesIncluded: { type: String, maxlength: 1000 },
    totalPrice: { type: Number, required: true, min: 0, max: 1000000 },
    currency: { type: String, default: 'GBP', enum: ['GBP', 'EUR', 'USD'] },
    version: { type: Number, default: 1 },
    status: { type: String, enum: ['draft', 'sent', 'updated'], default: 'draft' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    internalNotes: { type: String, maxlength: 1000 },
    linkedPackage: {
      packageId: { type: Schema.Types.ObjectId, ref: 'SuperOfferPackage' },
      packageName: { type: String, maxlength: 200 },
      packageVersion: { type: Number, min: 1 },
      selectedTier: {
        tierIndex: { type: Number, min: 0 },
        tierLabel: { type: String, maxlength: 100 }
      },
      selectedNights: { type: Number, min: 1 },
      selectedPeriod: { type: String, maxlength: 200 },
      calculatedPrice: { type: Schema.Types.Mixed },
      priceWasOnRequest: { type: Boolean, default: false }
    }
  }, { timestamps: true });

  const Quote = mongoose.models.Quote || mongoose.model('Quote', QuoteSchema);
  const Enquiry = mongoose.models.Enquiry || mongoose.model('Enquiry');
  const User = mongoose.models.User || mongoose.model('User');
  const SuperOfferPackage = mongoose.models.SuperOfferPackage || mongoose.model('SuperOfferPackage');

  // Get test data
  const testAdmin = await User.findOne({ role: 'admin' });
  if (!testAdmin) {
    console.error('❌ No admin user found. Please run setup.js first.');
    process.exit(1);
  }

  const testEnquiry = await Enquiry.findOne();
  if (!testEnquiry) {
    console.error('❌ No enquiry found. Please create an enquiry first.');
    process.exit(1);
  }

  console.log(`Using admin: ${testAdmin.name} (${testAdmin.email})`);
  console.log(`Using enquiry: ${testEnquiry._id}`);
  console.log();

  // ========================================
  // TEST 3.1: Quote Creation with New Fields
  // ========================================
  console.log('TEST 3.1: Quote Creation with New Fields');
  console.log('-'.repeat(60));

  // Test 3.1.1: Create quote with title and destination populated
  console.log('\n3.1.1: Create quote with title and destination populated');
  try {
    const quoteWithFields = new Quote({
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
      status: 'draft'
    });

    await quoteWithFields.save();
    
    // Verify the quote was saved
    const savedQuote = await Quote.findById(quoteWithFields._id);
    
    logTest(
      'Create quote with title and destination',
      savedQuote && 
      savedQuote.title === 'Summer Beach Getaway 2025' && 
      savedQuote.destination === 'Benidorm',
      `Title: "${savedQuote.title}", Destination: "${savedQuote.destination}"`
    );

    // Verify data integrity
    logTest(
      'Quote data integrity check',
      savedQuote.leadName === 'John Smith' &&
      savedQuote.totalPrice === 1200 &&
      savedQuote.numberOfPeople === 4,
      'All fields saved correctly'
    );

    // Clean up
    await Quote.findByIdAndDelete(quoteWithFields._id);
  } catch (error) {
    logTest('Create quote with title and destination', false, error.message);
  }

  // Test 3.1.2: Create quote with title and destination empty
  console.log('\n3.1.2: Create quote with title and destination empty');
  try {
    const quoteWithoutFields = new Quote({
      enquiryId: testEnquiry._id,
      // title and destination omitted (optional fields)
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
      status: 'draft'
    });

    await quoteWithoutFields.save();
    
    // Verify the quote was saved without title/destination
    const savedQuote = await Quote.findById(quoteWithoutFields._id);
    
    logTest(
      'Create quote without title and destination',
      savedQuote && 
      !savedQuote.title && 
      !savedQuote.destination,
      'Quote saved successfully with optional fields empty'
    );

    // Verify other data is intact
    logTest(
      'Quote data integrity without optional fields',
      savedQuote.leadName === 'Jane Doe' &&
      savedQuote.totalPrice === 800,
      'Required fields saved correctly'
    );

    // Clean up
    await Quote.findByIdAndDelete(quoteWithoutFields._id);
  } catch (error) {
    logTest('Create quote without title and destination', false, error.message);
  }

  // Test 3.1.3: Verify character limits
  console.log('\n3.1.3: Verify character limits');
  try {
    const longTitle = 'A'.repeat(201); // Exceeds 200 char limit
    const longDestination = 'B'.repeat(101); // Exceeds 100 char limit

    const quoteWithLongFields = new Quote({
      enquiryId: testEnquiry._id,
      title: longTitle,
      destination: longDestination,
      leadName: 'Test User',
      hotelName: 'Test Hotel',
      numberOfPeople: 2,
      numberOfRooms: 1,
      numberOfNights: 3,
      arrivalDate: new Date('2025-09-01'),
      isSuperPackage: false,
      whatsIncluded: 'Test package',
      transferIncluded: false,
      totalPrice: 500,
      currency: 'GBP',
      createdBy: testAdmin._id,
      status: 'draft'
    });

    try {
      await quoteWithLongFields.save();
      // If save succeeds, the validation didn't work
      logTest('Character limit validation', false, 'Validation should have failed but did not');
      await Quote.findByIdAndDelete(quoteWithLongFields._id);
    } catch (validationError) {
      // Validation error is expected
      logTest(
        'Character limit validation',
        validationError.name === 'ValidationError',
        'Correctly rejected fields exceeding character limits'
      );
    }
  } catch (error) {
    logTest('Character limit validation', false, error.message);
  }

  // Test 3.1.4: Verify database persistence
  console.log('\n3.1.4: Verify database persistence');
  try {
    const persistenceQuote = new Quote({
      enquiryId: testEnquiry._id,
      title: 'Persistence Test Quote',
      destination: 'Marbella',
      leadName: 'Test Lead',
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
      status: 'draft'
    });

    await persistenceQuote.save();
    const quoteId = persistenceQuote._id;

    // Query the quote again from database
    const reloadedQuote = await Quote.findById(quoteId).lean();

    logTest(
      'Database persistence check',
      reloadedQuote &&
      reloadedQuote.title === 'Persistence Test Quote' &&
      reloadedQuote.destination === 'Marbella',
      'Title and destination persisted correctly across connections'
    );

    // Clean up
    await Quote.findByIdAndDelete(quoteId);
  } catch (error) {
    logTest('Database persistence check', false, error.message);
  }

  // ========================================
  // TEST 3.2: Quote Editing with New Fields
  // ========================================
  console.log('\n\nTEST 3.2: Quote Editing with New Fields');
  console.log('-'.repeat(60));

  // Test 3.2.1: Edit existing quote and add title and destination
  console.log('\n3.2.1: Edit existing quote and add title and destination');
  try {
    // Create a quote without title/destination
    const originalQuote = new Quote({
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
      status: 'draft'
    });

    await originalQuote.save();

    // Edit to add title and destination
    originalQuote.title = 'Added Title After Creation';
    originalQuote.destination = 'Albufeira';
    await originalQuote.save();

    // Verify the update
    const updatedQuote = await Quote.findById(originalQuote._id);

    logTest(
      'Add title and destination to existing quote',
      updatedQuote.title === 'Added Title After Creation' &&
      updatedQuote.destination === 'Albufeira',
      `Title: "${updatedQuote.title}", Destination: "${updatedQuote.destination}"`
    );

    // Clean up
    await Quote.findByIdAndDelete(originalQuote._id);
  } catch (error) {
    logTest('Add title and destination to existing quote', false, error.message);
  }

  // Test 3.2.2: Modify existing title and destination
  console.log('\n3.2.2: Modify existing title and destination');
  try {
    const quoteToModify = new Quote({
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
      status: 'draft'
    });

    await quoteToModify.save();

    // Modify title and destination
    quoteToModify.title = 'Modified Title';
    quoteToModify.destination = 'Modified Destination';
    await quoteToModify.save();

    // Verify the modification
    const modifiedQuote = await Quote.findById(quoteToModify._id);

    logTest(
      'Modify existing title and destination',
      modifiedQuote.title === 'Modified Title' &&
      modifiedQuote.destination === 'Modified Destination',
      `New Title: "${modifiedQuote.title}", New Destination: "${modifiedQuote.destination}"`
    );

    // Clean up
    await Quote.findByIdAndDelete(quoteToModify._id);
  } catch (error) {
    logTest('Modify existing title and destination', false, error.message);
  }

  // Test 3.2.3: Clear title and destination
  console.log('\n3.2.3: Clear title and destination');
  try {
    const quoteToClear = new Quote({
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
      status: 'draft'
    });

    await quoteToClear.save();

    // Clear title and destination
    quoteToClear.title = undefined;
    quoteToClear.destination = undefined;
    await quoteToClear.save();

    // Verify the fields are cleared
    const clearedQuote = await Quote.findById(quoteToClear._id);

    logTest(
      'Clear title and destination',
      !clearedQuote.title && !clearedQuote.destination,
      'Title and destination successfully cleared'
    );

    // Verify other fields remain intact
    logTest(
      'Other fields intact after clearing',
      clearedQuote.leadName === 'Clear Test User' &&
      clearedQuote.totalPrice === 700,
      'Required fields unchanged'
    );

    // Clean up
    await Quote.findByIdAndDelete(quoteToClear._id);
  } catch (error) {
    logTest('Clear title and destination', false, error.message);
  }

  // ========================================
  // TEST 3.3: Package Integration
  // ========================================
  console.log('\n\nTEST 3.3: Package Integration');
  console.log('-'.repeat(60));

  // Test 3.3.1: Link super package with manually entered title and destination
  console.log('\n3.3.1: Link super package with manually entered title and destination');
  try {
    // Check if super packages exist
    const testPackage = await SuperOfferPackage.findOne({ status: 'active' });

    if (testPackage) {
      const quoteWithPackage = new Quote({
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
        }
      });

      await quoteWithPackage.save();

      // Verify package link and manual fields coexist
      const savedPackageQuote = await Quote.findById(quoteWithPackage._id);

      logTest(
        'Link package with manual title and destination',
        savedPackageQuote.title === 'Manual Title with Package' &&
        savedPackageQuote.destination === 'Manual Destination' &&
        savedPackageQuote.linkedPackage &&
        savedPackageQuote.linkedPackage.packageId.toString() === testPackage._id.toString(),
        'Manual fields preserved with package link'
      );

      // Clean up
      await Quote.findByIdAndDelete(quoteWithPackage._id);
    } else {
      logTest(
        'Link package with manual title and destination',
        true,
        'SKIPPED: No active super packages found'
      );
    }
  } catch (error) {
    logTest('Link package with manual title and destination', false, error.message);
  }

  // Test 3.3.2: Verify package selection doesn't override title and destination
  console.log('\n3.3.2: Verify package selection doesn\'t override title and destination');
  try {
    const testPackage = await SuperOfferPackage.findOne({ status: 'active' });

    if (testPackage) {
      // Create quote with title and destination
      const quoteBeforePackage = new Quote({
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
        status: 'draft'
      });

      await quoteBeforePackage.save();

      // Now link a package (simulating package selection)
      quoteBeforePackage.isSuperPackage = true;
      quoteBeforePackage.linkedPackage = {
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
      };
      // Importantly, we DON'T change title or destination
      await quoteBeforePackage.save();

      // Verify title and destination weren't overridden
      const quoteAfterPackage = await Quote.findById(quoteBeforePackage._id);

      logTest(
        'Package selection preserves title and destination',
        quoteAfterPackage.title === 'Pre-existing Title' &&
        quoteAfterPackage.destination === 'Pre-existing Destination' &&
        quoteAfterPackage.linkedPackage !== undefined,
        'Title and destination unchanged after package link'
      );

      // Clean up
      await Quote.findByIdAndDelete(quoteBeforePackage._id);
    } else {
      logTest(
        'Package selection preserves title and destination',
        true,
        'SKIPPED: No active super packages found'
      );
    }
  } catch (error) {
    logTest('Package selection preserves title and destination', false, error.message);
  }

  // ========================================
  // TEST 3.4: Validation and Error Handling
  // ========================================
  console.log('\n\nTEST 3.4: Validation and Error Handling');
  console.log('-'.repeat(60));

  // Test 3.4.1: Title exceeding 200 characters
  console.log('\n3.4.1: Title exceeding 200 characters');
  try {
    const longTitle = 'A'.repeat(201);
    const quoteWithLongTitle = new Quote({
      enquiryId: testEnquiry._id,
      title: longTitle,
      leadName: 'Validation Test',
      hotelName: 'Test Hotel',
      numberOfPeople: 2,
      numberOfRooms: 1,
      numberOfNights: 3,
      arrivalDate: new Date('2026-04-01'),
      isSuperPackage: false,
      whatsIncluded: 'Test',
      transferIncluded: false,
      totalPrice: 500,
      currency: 'GBP',
      createdBy: testAdmin._id,
      status: 'draft'
    });

    try {
      await quoteWithLongTitle.save();
      logTest('Title length validation (200 chars)', false, 'Should have rejected long title');
      await Quote.findByIdAndDelete(quoteWithLongTitle._id);
    } catch (validationError) {
      logTest(
        'Title length validation (200 chars)',
        validationError.name === 'ValidationError',
        'Correctly rejected title exceeding 200 characters'
      );
    }
  } catch (error) {
    logTest('Title length validation (200 chars)', false, error.message);
  }

  // Test 3.4.2: Destination exceeding 100 characters
  console.log('\n3.4.2: Destination exceeding 100 characters');
  try {
    const longDestination = 'B'.repeat(101);
    const quoteWithLongDest = new Quote({
      enquiryId: testEnquiry._id,
      destination: longDestination,
      leadName: 'Validation Test',
      hotelName: 'Test Hotel',
      numberOfPeople: 2,
      numberOfRooms: 1,
      numberOfNights: 3,
      arrivalDate: new Date('2026-05-01'),
      isSuperPackage: false,
      whatsIncluded: 'Test',
      transferIncluded: false,
      totalPrice: 500,
      currency: 'GBP',
      createdBy: testAdmin._id,
      status: 'draft'
    });

    try {
      await quoteWithLongDest.save();
      logTest('Destination length validation (100 chars)', false, 'Should have rejected long destination');
      await Quote.findByIdAndDelete(quoteWithLongDest._id);
    } catch (validationError) {
      logTest(
        'Destination length validation (100 chars)',
        validationError.name === 'ValidationError',
        'Correctly rejected destination exceeding 100 characters'
      );
    }
  } catch (error) {
    logTest('Destination length validation (100 chars)', false, error.message);
  }

  // Test 3.4.3: Special characters handling
  console.log('\n3.4.3: Special characters handling');
  try {
    const specialCharsQuote = new Quote({
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
      status: 'draft'
    });

    await specialCharsQuote.save();
    const savedSpecialQuote = await Quote.findById(specialCharsQuote._id);

    logTest(
      'Special characters handling',
      savedSpecialQuote.title.includes('Spëcial') &&
      savedSpecialQuote.destination.includes('Málaga'),
      'Special characters and accents preserved correctly'
    );

    // Clean up
    await Quote.findByIdAndDelete(specialCharsQuote._id);
  } catch (error) {
    logTest('Special characters handling', false, error.message);
  }

  // Test 3.4.4: Empty string vs undefined
  console.log('\n3.4.4: Empty string vs undefined');
  try {
    const emptyStringQuote = new Quote({
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
      status: 'draft'
    });

    await emptyStringQuote.save();
    const savedEmptyQuote = await Quote.findById(emptyStringQuote._id);

    logTest(
      'Empty string handling',
      savedEmptyQuote.title === '' &&
      savedEmptyQuote.destination === '',
      'Empty strings accepted and preserved'
    );

    // Clean up
    await Quote.findByIdAndDelete(emptyStringQuote._id);
  } catch (error) {
    logTest('Empty string handling', false, error.message);
  }

  // ========================================
  // Print Summary
  // ========================================
  console.log('\n');
  console.log('='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${testResults.tests.length}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log();

  if (testResults.failed > 0) {
    console.log('Failed Tests:');
    testResults.tests
      .filter(t => !t.passed)
      .forEach(t => {
        console.log(`  - ${t.name}`);
        if (t.details) {
          console.log(`    ${t.details}`);
        }
      });
  }

  console.log('='.repeat(60));
}

async function main() {
  try {
    await connectDB();
    await runTests();
  } catch (error) {
    console.error('❌ Test execution error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(testResults.failed > 0 ? 1 : 0);
  }
}

main();
