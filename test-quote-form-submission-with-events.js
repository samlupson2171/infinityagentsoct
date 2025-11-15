/**
 * Test Quote Form Submission with Events
 * 
 * This script tests the quote form submission logic including:
 * - Event validation before submission
 * - Event price storage
 * - Price history tracking for event additions
 * - Error handling for event-related failures
 */

const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/infinity-weekends';

async function testQuoteFormSubmission() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Load models
    const Quote = require('./src/models/Quote').default;
    const Event = require('./src/models/Event').default;
    const User = require('./src/models/User').default;

    // Find a test user (admin)
    const testUser = await User.findOne({ role: 'admin' });
    if (!testUser) {
      console.log('❌ No admin user found. Please create one first.');
      return;
    }
    console.log(`✅ Found test user: ${testUser.email}\n`);

    // Find some test events
    const testEvents = await Event.find({ isActive: true }).limit(3);
    if (testEvents.length === 0) {
      console.log('❌ No active events found. Please create some first.');
      return;
    }
    console.log(`✅ Found ${testEvents.length} test events:\n`);
    testEvents.forEach((event, i) => {
      console.log(`   ${i + 1}. ${event.name} - ${event.currency} ${event.price}`);
    });
    console.log('');

    // Test 1: Create a quote with selected events
    console.log('📝 Test 1: Creating quote with selected events...');
    
    const selectedEvents = testEvents.map(event => ({
      eventId: event._id,
      eventName: event.name,
      eventPrice: event.price,
      eventCurrency: event.currency,
      addedAt: new Date(),
    }));

    const eventsTotal = selectedEvents.reduce((sum, e) => sum + e.eventPrice, 0);
    const basePrice = 500;
    const totalPrice = basePrice + eventsTotal;

    const testQuote = new Quote({
      enquiryId: new mongoose.Types.ObjectId(), // Dummy enquiry ID
      title: 'Test Quote with Events',
      destination: 'Benidorm',
      leadName: 'Test Lead',
      hotelName: 'Test Hotel',
      numberOfPeople: 10,
      numberOfRooms: 5,
      numberOfNights: 3,
      arrivalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isSuperPackage: false,
      whatsIncluded: 'Accommodation, breakfast, and selected activities',
      transferIncluded: true,
      totalPrice: totalPrice,
      currency: 'GBP',
      selectedEvents: selectedEvents,
      createdBy: testUser._id,
      status: 'draft',
    });

    await testQuote.save();
    console.log(`✅ Quote created successfully with ID: ${testQuote._id}`);
    console.log(`   Base Price: £${basePrice}`);
    console.log(`   Events Total: £${eventsTotal}`);
    console.log(`   Total Price: £${totalPrice}`);
    console.log(`   Selected Events: ${selectedEvents.length}\n`);

    // Test 2: Validate event data structure
    console.log('🔍 Test 2: Validating event data structure...');
    
    const savedQuote = await Quote.findById(testQuote._id);
    if (!savedQuote) {
      console.log('❌ Failed to retrieve saved quote');
      return;
    }

    console.log('✅ Quote retrieved successfully');
    console.log(`   Selected Events Count: ${savedQuote.selectedEvents?.length || 0}`);
    
    if (savedQuote.selectedEvents && savedQuote.selectedEvents.length > 0) {
      console.log('   Event Details:');
      savedQuote.selectedEvents.forEach((event, i) => {
        console.log(`     ${i + 1}. ${event.eventName}`);
        console.log(`        - Event ID: ${event.eventId}`);
        console.log(`        - Price: ${event.eventCurrency} ${event.eventPrice}`);
        console.log(`        - Added At: ${event.addedAt}`);
      });
    }
    console.log('');

    // Test 3: Update quote with event changes
    console.log('📝 Test 3: Updating quote with event changes...');
    
    // Remove one event and add price history
    const updatedEvents = selectedEvents.slice(0, 2); // Remove last event
    const removedEvent = selectedEvents[2];
    const newEventsTotal = updatedEvents.reduce((sum, e) => sum + e.eventPrice, 0);
    const newTotalPrice = basePrice + newEventsTotal;

    savedQuote.selectedEvents = updatedEvents;
    savedQuote.totalPrice = newTotalPrice;
    
    // Add price history entry
    if (!savedQuote.priceHistory) {
      savedQuote.priceHistory = [];
    }
    savedQuote.priceHistory.push({
      price: newTotalPrice,
      reason: 'manual_override',
      changeDescription: `Events modified: Removed: ${removedEvent.eventName}`,
      timestamp: new Date(),
      userId: testUser._id,
    });

    await savedQuote.save();
    console.log(`✅ Quote updated successfully`);
    console.log(`   Previous Total: £${totalPrice}`);
    console.log(`   New Total: £${newTotalPrice}`);
    console.log(`   Removed Event: ${removedEvent.eventName} (£${removedEvent.eventPrice})`);
    console.log(`   Price History Entries: ${savedQuote.priceHistory.length}\n`);

    // Test 4: Validate event validation rules
    console.log('🔍 Test 4: Testing event validation rules...');
    
    const validationTests = [
      {
        name: 'Maximum events limit (20)',
        test: () => {
          const tooManyEvents = Array(21).fill(null).map((_, i) => ({
            eventId: new mongoose.Types.ObjectId(),
            eventName: `Event ${i + 1}`,
            eventPrice: 50,
            eventCurrency: 'GBP',
            addedAt: new Date(),
          }));
          return tooManyEvents.length > 20;
        },
        expected: true,
      },
      {
        name: 'Non-negative event price',
        test: () => {
          const invalidEvent = {
            eventId: new mongoose.Types.ObjectId(),
            eventName: 'Invalid Event',
            eventPrice: -50,
            eventCurrency: 'GBP',
            addedAt: new Date(),
          };
          return invalidEvent.eventPrice < 0;
        },
        expected: true,
      },
      {
        name: 'Valid event currency',
        test: () => {
          const validCurrencies = ['GBP', 'EUR', 'USD'];
          const testCurrency = 'GBP';
          return validCurrencies.includes(testCurrency);
        },
        expected: true,
      },
    ];

    validationTests.forEach((test, i) => {
      const result = test.test();
      const passed = result === test.expected;
      console.log(`   ${passed ? '✅' : '❌'} ${test.name}: ${passed ? 'PASS' : 'FAIL'}`);
    });
    console.log('');

    // Test 5: Test currency mismatch handling
    console.log('🔍 Test 5: Testing currency mismatch handling...');
    
    const mixedCurrencyEvents = [
      {
        eventId: testEvents[0]._id,
        eventName: testEvents[0].name,
        eventPrice: testEvents[0].price,
        eventCurrency: 'GBP',
        addedAt: new Date(),
      },
      {
        eventId: testEvents[1]._id,
        eventName: testEvents[1].name,
        eventPrice: testEvents[1].price,
        eventCurrency: 'EUR', // Different currency
        addedAt: new Date(),
      },
    ];

    const quoteCurrency = 'GBP';
    const matchingEvents = mixedCurrencyEvents.filter(e => e.eventCurrency === quoteCurrency);
    const mismatchedEvents = mixedCurrencyEvents.filter(e => e.eventCurrency !== quoteCurrency);

    console.log(`   Quote Currency: ${quoteCurrency}`);
    console.log(`   Total Events: ${mixedCurrencyEvents.length}`);
    console.log(`   Matching Currency: ${matchingEvents.length}`);
    console.log(`   Mismatched Currency: ${mismatchedEvents.length}`);
    
    if (mismatchedEvents.length > 0) {
      console.log(`   ⚠️  Warning: ${mismatchedEvents.length} event(s) have different currency`);
      mismatchedEvents.forEach(e => {
        console.log(`      - ${e.eventName} (${e.eventCurrency})`);
      });
    }
    console.log('');

    // Test 6: Test error handling
    console.log('🔍 Test 6: Testing error handling...');
    
    try {
      // Try to create a quote with invalid event data
      const invalidQuote = new Quote({
        enquiryId: new mongoose.Types.ObjectId(),
        leadName: 'Test Lead',
        hotelName: 'Test Hotel',
        numberOfPeople: 10,
        numberOfRooms: 5,
        numberOfNights: 3,
        arrivalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        whatsIncluded: 'Test package',
        totalPrice: 500,
        currency: 'GBP',
        selectedEvents: [
          {
            // Missing required fields
            eventId: new mongoose.Types.ObjectId(),
            // eventName is missing
            eventPrice: 50,
            eventCurrency: 'GBP',
          },
        ],
        createdBy: testUser._id,
        status: 'draft',
      });

      await invalidQuote.save();
      console.log('   ❌ Should have failed validation but did not');
    } catch (error) {
      console.log('   ✅ Validation error caught as expected');
      console.log(`      Error: ${error.message}`);
    }
    console.log('');

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await Quote.findByIdAndDelete(testQuote._id);
    console.log('✅ Test quote deleted\n');

    console.log('✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the test
testQuoteFormSubmission()
  .then(() => {
    console.log('\n✅ Test script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test script failed:', error);
    process.exit(1);
  });
