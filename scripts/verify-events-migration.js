#!/usr/bin/env node

/**
 * Verification Script: Check Events and Categories Migration
 * 
 * This script verifies:
 * 1. All system categories were created
 * 2. All hardcoded events were migrated
 * 3. Enquiries are using event ObjectIds
 * 
 * Usage:
 *   node scripts/verify-events-migration.js
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function verifyMigration() {
  console.log('='.repeat(60));
  console.log('Events and Categories Migration Verification');
  console.log('='.repeat(60));
  console.log();

  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');
    console.log();

    // Import models after connection
    const Category = require('../src/models/Category').default;
    const Event = require('../src/models/Event').default;
    const Enquiry = require('../src/models/Enquiry').default;

    // Check categories
    console.log('Checking categories...');
    const categories = await Category.find();
    const systemCategories = await Category.find({ isSystem: true });
    
    console.log(`  Total categories: ${categories.length}`);
    console.log(`  System categories: ${systemCategories.length}`);
    
    const expectedSystemCategories = ['day', 'night', 'adult', 'stag', 'hen'];
    const foundSlugs = systemCategories.map(c => c.slug);
    const missingSlugs = expectedSystemCategories.filter(slug => !foundSlugs.includes(slug));
    
    if (missingSlugs.length > 0) {
      console.log(`  ⚠️  Missing system categories: ${missingSlugs.join(', ')}`);
    } else {
      console.log('  ✓ All system categories present');
    }
    console.log();

    // Check events
    console.log('Checking events...');
    const events = await Event.find();
    const activeEvents = await Event.find({ isActive: true });
    
    console.log(`  Total events: ${events.length}`);
    console.log(`  Active events: ${activeEvents.length}`);
    console.log(`  Inactive events: ${events.length - activeEvents.length}`);
    
    // Sample some events
    if (events.length > 0) {
      console.log('\n  Sample events:');
      const sampleEvents = events.slice(0, 5);
      for (const event of sampleEvents) {
        const populatedEvent = await Event.findById(event._id).populate('categories');
        const categoryNames = populatedEvent.categories.map(c => c.name).join(', ');
        console.log(`    - ${event.name} (${categoryNames})`);
      }
    }
    console.log();

    // Check enquiries
    console.log('Checking enquiries...');
    const enquiries = await Enquiry.find();
    const enquiriesWithEvents = await Enquiry.find({
      eventsRequested: { $exists: true, $ne: [] }
    });
    
    console.log(`  Total enquiries: ${enquiries.length}`);
    console.log(`  Enquiries with events: ${enquiriesWithEvents.length}`);
    
    // Check if enquiries are using ObjectIds
    if (enquiriesWithEvents.length > 0) {
      const sampleEnquiry = enquiriesWithEvents[0];
      const firstEvent = sampleEnquiry.eventsRequested[0];
      const isObjectId = mongoose.Types.ObjectId.isValid(firstEvent);
      
      if (isObjectId) {
        console.log('  ✓ Enquiries are using event ObjectIds');
        
        // Try to populate an event
        const populatedEnquiry = await Enquiry.findById(sampleEnquiry._id)
          .populate('eventsRequested');
        
        if (populatedEnquiry.eventsRequested.length > 0) {
          const firstPopulatedEvent = populatedEnquiry.eventsRequested[0];
          if (firstPopulatedEvent && firstPopulatedEvent.name) {
            console.log(`  ✓ Event population working (sample: ${firstPopulatedEvent.name})`);
          }
        }
      } else {
        console.log('  ⚠️  Enquiries are still using strings instead of ObjectIds');
      }
    }
    console.log();

    // Summary
    console.log('='.repeat(60));
    console.log('Verification Summary');
    console.log('='.repeat(60));
    console.log();
    
    const allChecks = [
      { name: 'System categories created', passed: missingSlugs.length === 0 },
      { name: 'Events migrated', passed: events.length > 0 },
      { name: 'Enquiries using ObjectIds', passed: enquiriesWithEvents.length === 0 || mongoose.Types.ObjectId.isValid(enquiriesWithEvents[0]?.eventsRequested[0]) },
    ];
    
    const allPassed = allChecks.every(check => check.passed);
    
    for (const check of allChecks) {
      const status = check.passed ? '✓' : '✗';
      console.log(`${status} ${check.name}`);
    }
    
    console.log();
    if (allPassed) {
      console.log('✓ All verification checks passed!');
    } else {
      console.log('⚠️  Some verification checks failed. Please review the output above.');
    }
    console.log();

  } catch (error) {
    console.error();
    console.error('='.repeat(60));
    console.error('✗ Verification failed!');
    console.error('='.repeat(60));
    console.error();
    console.error('Error:', error.message);
    console.error();
    if (error.stack) {
      console.error('Stack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the verification
verifyMigration();
