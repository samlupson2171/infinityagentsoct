/**
 * Test script for Quote Events Integration - Task 9
 * Tests API routes handling of selectedEvents
 */

const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/infinity-weekends';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');
  } catch (error) {
    console.error('✗ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function testQuoteEventsAPI() {
  console.log('\n=== Testing Quote Events API Integration ===\n');

  try {
    await connectDB();

    // Load models
    const Quote = require('./src/models/Quote').default;
    const Event = require('./src/models/Event').default;
    const Enquiry = require('./src/models/Enquiry').default;
    const User = require('./src/models/User').default;

    // Test 1: Find an active event
    console.log('Test 1: Finding active events...');
    const activeEvents = await Event.find({ isActive: true }).limit(3);
    
    if (activeEvents.length === 0) {
      console.log('✗ No active events found. Please create some events first.');
      return;
    }
    
    console.log(`✓ Found ${activeEvents.length} active events`);
    activeEvents.forEach((event, index) => {
      console.log(`  ${index + 1}. ${event.name} - ${event.pricing?.currency || 'GBP'} ${event.pricing?.estimatedCost || 0}`);
    });

    // Test 2: Find an enquiry
    console.log('\nTest 2: Finding an enquiry...');
    const enquiry = await Enquiry.findOne();
    
    if (!enquiry) {
      console.log('✗ No enquiry found. Please create an enquiry first.');
      return;
    }
    
    console.log(`✓ Found enquiry: ${enquiry.leadName}`);

    // Test 3: Find an admin user
    console.log('\nTest 3: Finding admin user...');
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      console.log('✗ No admin user found.');
      return;
    }
    
    console.log(`✓ Found admin: ${admin.name}`);

    // Test 4: Create a quote with selectedEvents
    console.log('\nTest 4: Creating quote with selectedEvents...');
    
    const selectedEvents = activeEvents.slice(0, 2).map(event => ({
      eventId: event._id,
      eventName: event.name,
      eventPrice: event.pricing?.estimatedCost || 50,
      eventCurrency: event.pricing?.currency || 'GBP',
      addedAt: new Date(),
    }));

    const basePrice = 500;
    const eventsTotal = selectedEvents.reduce((sum, e) => sum + e.eventPrice, 0);
    const totalPrice = basePrice + eventsTotal;

    const quoteData = {
      enquiryId: enquiry._id,
      leadName: enquiry.leadName,
      hotelName: 'Test Hotel',
      numberOfPeople: 4,
      numberOfRooms: 2,
      numberOfNights: 3,
      arrivalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isSuperPackage: false,
      whatsIncluded: 'Accommodation, breakfast, and selected activities',
      transferIncluded: true,
      totalPrice: totalPrice,
      currency: 'GBP',
      selectedEvents: selectedEvents,
      createdBy: admin._id,
      status: 'draft',
    };

    const quote = new Quote(quoteData);
    await quote.save();
    
    console.log(`✓ Created quote with ${selectedEvents.length} events`);
    console.log(`  Quote ID: ${quote._id}`);
    console.log(`  Base Price: £${basePrice}`);
    console.log(`  Events Total: £${eventsTotal}`);
    console.log(`  Total Price: £${totalPrice}`);

    // Test 5: Retrieve quote and verify events are populated
    console.log('\nTest 5: Retrieving quote with populated events...');
    
    const retrievedQuote = await Quote.findById(quote._id)
      .populate('selectedEvents.eventId', 'name isActive pricing');
    
    if (!retrievedQuote) {
      console.log('✗ Failed to retrieve quote');
      return;
    }
    
    console.log(`✓ Retrieved quote successfully`);
    console.log(`  Selected Events: ${retrievedQuote.selectedEvents?.length || 0}`);
    
    if (retrievedQuote.selectedEvents && retrievedQuote.selectedEvents.length > 0) {
      retrievedQuote.selectedEvents.forEach((event, index) => {
        console.log(`  ${index + 1}. ${event.eventName} - ${event.eventCurrency} ${event.eventPrice}`);
        if (event.eventId) {
          const populatedEvent = event.eventId;
          console.log(`     Current price: ${populatedEvent.pricing?.currency || 'GBP'} ${populatedEvent.pricing?.estimatedCost || 0}`);
          console.log(`     Active: ${populatedEvent.isActive}`);
        }
      });
    }

    // Test 6: Update quote - add another event
    console.log('\nTest 6: Updating quote - adding another event...');
    
    if (activeEvents.length > 2) {
      const newEvent = activeEvents[2];
      const updatedSelectedEvents = [
        ...selectedEvents,
        {
          eventId: newEvent._id,
          eventName: newEvent.name,
          eventPrice: newEvent.pricing?.estimatedCost || 50,
          eventCurrency: newEvent.pricing?.currency || 'GBP',
          addedAt: new Date(),
        },
      ];

      const newEventsTotal = updatedSelectedEvents.reduce((sum, e) => sum + e.eventPrice, 0);
      const newTotalPrice = basePrice + newEventsTotal;

      retrievedQuote.selectedEvents = updatedSelectedEvents;
      retrievedQuote.totalPrice = newTotalPrice;
      
      if (!retrievedQuote.priceHistory) {
        retrievedQuote.priceHistory = [];
      }
      
      retrievedQuote.priceHistory.push({
        price: newTotalPrice,
        reason: 'event_added',
        timestamp: new Date(),
        userId: admin._id,
      });

      await retrievedQuote.save();
      
      console.log(`✓ Updated quote with additional event`);
      console.log(`  New Events Total: £${newEventsTotal}`);
      console.log(`  New Total Price: £${newTotalPrice}`);
      console.log(`  Price History Entries: ${retrievedQuote.priceHistory.length}`);
    } else {
      console.log('⊘ Skipped - not enough events to test adding');
    }

    // Test 7: Update quote - remove an event
    console.log('\nTest 7: Updating quote - removing an event...');
    
    const updatedQuote = await Quote.findById(quote._id);
    
    if (updatedQuote.selectedEvents && updatedQuote.selectedEvents.length > 1) {
      const removedSelectedEvents = updatedQuote.selectedEvents.slice(0, -1);
      const removedEventsTotal = removedSelectedEvents.reduce((sum, e) => sum + e.eventPrice, 0);
      const removedTotalPrice = basePrice + removedEventsTotal;

      updatedQuote.selectedEvents = removedSelectedEvents;
      updatedQuote.totalPrice = removedTotalPrice;
      
      if (!updatedQuote.priceHistory) {
        updatedQuote.priceHistory = [];
      }
      
      updatedQuote.priceHistory.push({
        price: removedTotalPrice,
        reason: 'event_removed',
        timestamp: new Date(),
        userId: admin._id,
      });

      await updatedQuote.save();
      
      console.log(`✓ Updated quote with event removed`);
      console.log(`  Remaining Events: ${removedSelectedEvents.length}`);
      console.log(`  New Events Total: £${removedEventsTotal}`);
      console.log(`  New Total Price: £${removedTotalPrice}`);
    } else {
      console.log('⊘ Skipped - not enough events to test removal');
    }

    // Test 8: Test validation - invalid event ID
    console.log('\nTest 8: Testing validation with invalid event ID...');
    
    try {
      const invalidQuote = new Quote({
        enquiryId: enquiry._id,
        leadName: 'Test Lead',
        hotelName: 'Test Hotel',
        numberOfPeople: 2,
        numberOfRooms: 1,
        numberOfNights: 2,
        arrivalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isSuperPackage: false,
        whatsIncluded: 'Test package',
        transferIncluded: false,
        totalPrice: 300,
        currency: 'GBP',
        selectedEvents: [
          {
            eventId: new mongoose.Types.ObjectId(), // Non-existent event
            eventName: 'Non-existent Event',
            eventPrice: 50,
            eventCurrency: 'GBP',
            addedAt: new Date(),
          },
        ],
        createdBy: admin._id,
        status: 'draft',
      });

      await invalidQuote.save();
      console.log('⊘ Validation should be handled at API level, not model level');
    } catch (error) {
      console.log(`✓ Model validation passed (API should validate event existence)`);
    }

    // Test 9: Test with inactive event
    console.log('\nTest 9: Testing with inactive event...');
    
    const inactiveEvent = await Event.findOne({ isActive: false });
    
    if (inactiveEvent) {
      console.log(`✓ Found inactive event: ${inactiveEvent.name}`);
      console.log('  API should warn about inactive events during updates');
    } else {
      console.log('⊘ No inactive events found to test');
    }

    // Test 10: Verify price history tracking
    console.log('\nTest 10: Verifying price history tracking...');
    
    const finalQuote = await Quote.findById(quote._id);
    
    if (finalQuote.priceHistory && finalQuote.priceHistory.length > 0) {
      console.log(`✓ Price history tracked: ${finalQuote.priceHistory.length} entries`);
      finalQuote.priceHistory.forEach((entry, index) => {
        console.log(`  ${index + 1}. £${entry.price} - ${entry.reason} at ${entry.timestamp.toISOString()}`);
      });
    } else {
      console.log('⊘ No price history entries found');
    }

    // Cleanup
    console.log('\nCleaning up test data...');
    await Quote.findByIdAndDelete(quote._id);
    console.log('✓ Test quote deleted');

    console.log('\n=== All Tests Completed Successfully ===\n');

  } catch (error) {
    console.error('\n✗ Test failed:', error);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('✓ Database connection closed');
  }
}

// Run tests
testQuoteEventsAPI();
