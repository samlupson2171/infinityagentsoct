#!/usr/bin/env node

/**
 * Seed Script: Create Events and Categories
 * 
 * This script seeds the database with:
 * 1. Predefined system categories (Day, Night, Adult, Stag, Hen)
 * 2. Sample events for testing
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Define schemas inline
const CategorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  icon: String,
  color: String,
  isSystem: Boolean,
  isActive: Boolean,
  displayOrder: Number,
  metadata: {
    createdAt: Date,
    updatedAt: Date,
  },
});

const EventSchema = new mongoose.Schema({
  name: String,
  description: String,
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  destinations: [String],
  availableInAllDestinations: Boolean,
  isActive: Boolean,
  displayOrder: Number,
  pricing: {
    estimatedCost: Number,
    currency: String,
  },
  metadata: {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: Date,
    updatedAt: Date,
  },
});

async function seedDatabase() {
  console.log('='.repeat(60));
  console.log('Events and Categories Seeding');
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

    const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
    const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}));

    // Get first admin user for metadata
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('⚠️  No admin user found. Creating events without user metadata.');
    }

    // 1. Seed system categories
    console.log('1. Seeding system categories...');
    const systemCategories = [
      {
        name: 'Day',
        slug: 'day',
        description: 'Daytime activities and events',
        icon: 'sun',
        color: '#FDB813',
        displayOrder: 1,
      },
      {
        name: 'Night',
        slug: 'night',
        description: 'Nighttime activities and events',
        icon: 'moon',
        color: '#1E3A8A',
        displayOrder: 2,
      },
      {
        name: 'Adult',
        slug: 'adult',
        description: 'Adult-oriented activities',
        icon: 'users',
        color: '#DC2626',
        displayOrder: 3,
      },
      {
        name: 'Stag',
        slug: 'stag',
        description: 'Stag party activities',
        icon: 'male',
        color: '#059669',
        displayOrder: 4,
      },
      {
        name: 'Hen',
        slug: 'hen',
        description: 'Hen party activities',
        icon: 'female',
        color: '#EC4899',
        displayOrder: 5,
      },
    ];

    const categoryMap = {};
    for (const catData of systemCategories) {
      let category = await Category.findOne({ slug: catData.slug });
      
      if (!category) {
        category = new Category({
          ...catData,
          isSystem: true,
          isActive: true,
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        await category.save();
        console.log(`   ✓ Created category: ${catData.name}`);
      } else {
        console.log(`   - Category already exists: ${catData.name}`);
      }
      
      categoryMap[catData.slug] = category._id;
    }

    console.log();

    // 2. Seed sample events
    console.log('2. Seeding sample events...');
    const sampleEvents = [
      {
        name: 'Boat Party',
        description: 'Amazing boat party experience with music and drinks',
        categories: [categoryMap.day, categoryMap.adult],
        availableInAllDestinations: true,
        displayOrder: 1,
      },
      {
        name: 'Club Entry',
        description: 'VIP entry to top nightclubs',
        categories: [categoryMap.night, categoryMap.adult],
        availableInAllDestinations: true,
        displayOrder: 2,
      },
      {
        name: 'Bar Crawl',
        description: 'Guided bar crawl through the best venues',
        categories: [categoryMap.night, categoryMap.stag, categoryMap.hen],
        availableInAllDestinations: true,
        displayOrder: 3,
      },
      {
        name: 'Beach Activities',
        description: 'Fun beach games and activities',
        categories: [categoryMap.day],
        availableInAllDestinations: true,
        displayOrder: 4,
      },
      {
        name: 'Water Sports',
        description: 'Jet skiing, parasailing, and more',
        categories: [categoryMap.day],
        availableInAllDestinations: false,
        destinations: ['Benidorm', 'Magaluf', 'Ibiza'],
        displayOrder: 5,
      },
      {
        name: 'Go Karting',
        description: 'High-speed go-kart racing',
        categories: [categoryMap.day, categoryMap.stag],
        availableInAllDestinations: true,
        displayOrder: 6,
      },
      {
        name: 'Paintball',
        description: 'Action-packed paintball battles',
        categories: [categoryMap.day, categoryMap.stag],
        availableInAllDestinations: true,
        displayOrder: 7,
      },
      {
        name: 'Quad Biking',
        description: 'Off-road quad biking adventure',
        categories: [categoryMap.day, categoryMap.stag],
        availableInAllDestinations: false,
        destinations: ['Benidorm', 'Albufeira'],
        displayOrder: 8,
      },
      {
        name: 'Spa Treatment',
        description: 'Relaxing spa and wellness treatments',
        categories: [categoryMap.day, categoryMap.hen],
        availableInAllDestinations: true,
        displayOrder: 9,
      },
      {
        name: 'Restaurant Booking',
        description: 'Reserved table at top restaurants',
        categories: [categoryMap.night],
        availableInAllDestinations: true,
        displayOrder: 10,
      },
    ];

    for (const eventData of sampleEvents) {
      const existing = await Event.findOne({ name: eventData.name });
      
      if (!existing) {
        const event = new Event({
          ...eventData,
          isActive: true,
          pricing: {
            estimatedCost: 0,
            currency: 'GBP',
          },
          metadata: {
            createdBy: adminUser?._id,
            updatedBy: adminUser?._id,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        await event.save();
        console.log(`   ✓ Created event: ${eventData.name}`);
      } else {
        console.log(`   - Event already exists: ${eventData.name}`);
      }
    }

    console.log();
    console.log('='.repeat(60));
    console.log('✓ Seeding completed successfully!');
    console.log('='.repeat(60));
    console.log();
    console.log('Summary:');
    console.log(`- ${systemCategories.length} system categories`);
    console.log(`- ${sampleEvents.length} sample events`);
    console.log();
  } catch (error) {
    console.error();
    console.error('='.repeat(60));
    console.error('✗ Seeding failed!');
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

// Run the seeding
seedDatabase();
