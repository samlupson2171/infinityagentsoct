const { MongoClient, ObjectId } = require('mongodb');

async function addEventsToQuote() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/infinity-weekends';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    
    // Find a recent quote
    const quote = await db.collection('quotes').findOne(
      {},
      { sort: { createdAt: -1 } }
    );

    if (!quote) {
      console.log('❌ No quotes found');
      return;
    }

    console.log('📋 Found quote:', quote._id);
    console.log('Lead Name:', quote.leadName);

    // Find some events to add
    const events = await db.collection('events')
      .find({ isActive: true })
      .limit(3)
      .toArray();

    if (events.length === 0) {
      console.log('❌ No active events found in database');
      console.log('Please create some events first');
      return;
    }

    console.log(`\n✅ Found ${events.length} events to add`);

    // Create selectedEvents array
    const selectedEvents = events.map((event, index) => ({
      eventId: event._id,
      eventName: event.name,
      eventPrice: event.price,
      eventCurrency: event.currency || 'GBP',
      pricePerPerson: index === 0 || index === 2, // Make first and third event per-person
      addedAt: new Date()
    }));

    // Update the quote
    const result = await db.collection('quotes').updateOne(
      { _id: quote._id },
      { 
        $set: { 
          selectedEvents: selectedEvents,
          updatedAt: new Date()
        } 
      }
    );

    if (result.modifiedCount > 0) {
      console.log('\n✅ Successfully added events to quote!');
      console.log('\nAdded events:');
      selectedEvents.forEach((event, index) => {
        console.log(`  ${index + 1}. ${event.eventName}`);
        console.log(`     Price: ${event.eventCurrency}${event.eventPrice}`);
        console.log(`     Per Person: ${event.pricePerPerson ? 'Yes' : 'No'}`);
      });
      
      console.log('\n✅ Now try viewing the email preview or sending the quote!');
    } else {
      console.log('❌ Failed to update quote');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

addEventsToQuote();
