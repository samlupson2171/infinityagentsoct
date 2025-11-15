/**
 * Test script for the calculate-events-price API endpoint
 * 
 * This script tests:
 * 1. Valid event IDs calculation
 * 2. Empty array handling
 * 3. Invalid event IDs
 * 4. Missing events
 * 5. Maximum events limit
 */

const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function testCalculateEventsPrice() {
  console.log('🧪 Testing Calculate Events Price API Endpoint\n');

  try {
    // Connect to database to get real event IDs
    console.log('📦 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get some active events
    const Event = mongoose.model('Event', new mongoose.Schema({}, { strict: false }));
    const activeEvents = await Event.find({ isActive: true }).limit(3).select('_id name pricing');

    if (activeEvents.length === 0) {
      console.log('⚠️  No active events found in database. Please create some events first.');
      await mongoose.disconnect();
      return;
    }

    console.log(`Found ${activeEvents.length} active events for testing:`);
    activeEvents.forEach((event, index) => {
      console.log(`  ${index + 1}. ${event.name} (${event._id})`);
      if (event.pricing?.estimatedCost) {
        console.log(`     Price: ${event.pricing.currency} ${event.pricing.estimatedCost}`);
      }
    });
    console.log('');

    // Get admin token (you'll need to login first)
    console.log('🔐 Note: This test requires admin authentication');
    console.log('   Please ensure you have a valid admin session\n');

    // Test 1: Calculate price for valid events
    console.log('Test 1: Calculate price for valid events');
    console.log('----------------------------------------');
    const eventIds = activeEvents.map(e => e._id.toString());
    
    const response1 = await fetch(`${API_BASE_URL}/api/admin/quotes/calculate-events-price`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventIds: eventIds,
      }),
      credentials: 'include',
    });

    const result1 = await response1.json();
    console.log('Status:', response1.status);
    console.log('Response:', JSON.stringify(result1, null, 2));
    console.log('');

    // Test 2: Empty array
    console.log('Test 2: Empty event IDs array');
    console.log('----------------------------------------');
    const response2 = await fetch(`${API_BASE_URL}/api/admin/quotes/calculate-events-price`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventIds: [],
      }),
      credentials: 'include',
    });

    const result2 = await response2.json();
    console.log('Status:', response2.status);
    console.log('Response:', JSON.stringify(result2, null, 2));
    console.log('');

    // Test 3: Invalid event ID
    console.log('Test 3: Invalid event ID format');
    console.log('----------------------------------------');
    const response3 = await fetch(`${API_BASE_URL}/api/admin/quotes/calculate-events-price`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventIds: ['invalid-id', eventIds[0]],
      }),
      credentials: 'include',
    });

    const result3 = await response3.json();
    console.log('Status:', response3.status);
    console.log('Response:', JSON.stringify(result3, null, 2));
    console.log('');

    // Test 4: Non-existent event ID
    console.log('Test 4: Non-existent event ID');
    console.log('----------------------------------------');
    const fakeId = new mongoose.Types.ObjectId().toString();
    const response4 = await fetch(`${API_BASE_URL}/api/admin/quotes/calculate-events-price`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventIds: [fakeId],
      }),
      credentials: 'include',
    });

    const result4 = await response4.json();
    console.log('Status:', response4.status);
    console.log('Response:', JSON.stringify(result4, null, 2));
    console.log('');

    // Test 5: Too many events (>20)
    console.log('Test 5: Maximum events limit (>20)');
    console.log('----------------------------------------');
    const tooManyIds = Array(21).fill(eventIds[0]);
    const response5 = await fetch(`${API_BASE_URL}/api/admin/quotes/calculate-events-price`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventIds: tooManyIds,
      }),
      credentials: 'include',
    });

    const result5 = await response5.json();
    console.log('Status:', response5.status);
    console.log('Response:', JSON.stringify(result5, null, 2));
    console.log('');

    console.log('✅ All tests completed!');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📦 Disconnected from MongoDB');
  }
}

// Run the test
testCalculateEventsPrice();
