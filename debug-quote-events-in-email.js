const { MongoClient } = require('mongodb');

async function debugQuoteEvents() {
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
      console.log('❌ No quotes found in database');
      return;
    }

    console.log('\n📋 Quote Details:');
    console.log('Quote ID:', quote._id);
    console.log('Quote Reference:', quote.quoteReference);
    console.log('Lead Name:', quote.leadName);
    console.log('Hotel:', quote.hotelName);
    console.log('Total Price:', quote.totalPrice);
    console.log('Currency:', quote.currency);
    
    console.log('\n🎯 Selected Events:');
    if (quote.selectedEvents && quote.selectedEvents.length > 0) {
      console.log(`Found ${quote.selectedEvents.length} events:`);
      quote.selectedEvents.forEach((event, index) => {
        console.log(`\n  Event ${index + 1}:`);
        console.log('    Event ID:', event.eventId);
        console.log('    Event Name:', event.eventName);
        console.log('    Event Price:', event.eventPrice);
        console.log('    Event Currency:', event.eventCurrency);
        console.log('    Price Per Person:', event.pricePerPerson);
      });
    } else {
      console.log('⚠️  No events found in selectedEvents array');
      console.log('selectedEvents value:', quote.selectedEvents);
    }

    console.log('\n📧 Email Status:');
    console.log('Email Sent:', quote.emailSent);
    console.log('Email Sent At:', quote.emailSentAt);
    console.log('Status:', quote.status);

    // Check if there's an old activitiesIncluded field
    if (quote.activitiesIncluded) {
      console.log('\n⚠️  Old activitiesIncluded field found:');
      console.log(quote.activitiesIncluded);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

debugQuoteEvents();
