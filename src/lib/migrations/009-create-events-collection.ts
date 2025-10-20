import mongoose from 'mongoose';
import Category from '@/models/Category';
import Event from '@/models/Event';
import Enquiry from '@/models/Enquiry';
import User from '@/models/User';

// Predefined system categories
const SYSTEM_CATEGORIES = [
  {
    name: 'Day',
    slug: 'day',
    description: 'Daytime activities and events',
    icon: 'sun',
    color: '#FDB813',
    isSystem: true,
    isActive: true,
    displayOrder: 1,
  },
  {
    name: 'Night',
    slug: 'night',
    description: 'Nighttime activities and events',
    icon: 'moon',
    color: '#1E3A8A',
    isSystem: true,
    isActive: true,
    displayOrder: 2,
  },
  {
    name: 'Adult',
    slug: 'adult',
    description: 'Adult-oriented activities',
    icon: 'users',
    color: '#DC2626',
    isSystem: true,
    isActive: true,
    displayOrder: 3,
  },
  {
    name: 'Stag',
    slug: 'stag',
    description: 'Stag party activities',
    icon: 'male',
    color: '#2563EB',
    isSystem: true,
    isActive: true,
    displayOrder: 4,
  },
  {
    name: 'Hen',
    slug: 'hen',
    description: 'Hen party activities',
    icon: 'female',
    color: '#EC4899',
    isSystem: true,
    isActive: true,
    displayOrder: 5,
  },
];

// Hardcoded events to migrate (from the existing enquiry form)
const HARDCODED_EVENTS = [
  { name: 'Boat Party', categories: ['day', 'night', 'adult', 'stag', 'hen'] },
  { name: 'Club Entry', categories: ['night', 'adult', 'stag', 'hen'] },
  { name: 'Bar Crawl', categories: ['night', 'adult', 'stag', 'hen'] },
  { name: 'Beach Club', categories: ['day', 'adult', 'stag', 'hen'] },
  { name: 'Water Sports', categories: ['day'] },
  { name: 'Go Karting', categories: ['day', 'stag'] },
  { name: 'Paintball', categories: ['day', 'stag'] },
  { name: 'Quad Biking', categories: ['day', 'stag'] },
  { name: 'Spa Day', categories: ['day', 'hen'] },
  { name: 'Wine Tasting', categories: ['day', 'hen'] },
  { name: 'Cocktail Making', categories: ['day', 'night', 'hen'] },
  { name: 'Private Villa Party', categories: ['night', 'adult', 'stag', 'hen'] },
  { name: 'VIP Table Service', categories: ['night', 'adult', 'stag', 'hen'] },
  { name: 'Strip Club', categories: ['night', 'adult', 'stag'] },
  { name: 'Cabaret Show', categories: ['night', 'adult', 'hen'] },
  { name: 'Dinner Reservation', categories: ['night'] },
  { name: 'Airport Transfers', categories: ['day'] },
  { name: 'Party Bus', categories: ['day', 'night', 'stag', 'hen'] },
  { name: 'Jet Ski', categories: ['day'] },
  { name: 'Parasailing', categories: ['day'] },
  { name: 'Scuba Diving', categories: ['day'] },
  { name: 'Snorkeling', categories: ['day'] },
  { name: 'Fishing Trip', categories: ['day'] },
  { name: 'Golf', categories: ['day'] },
  { name: 'Horse Riding', categories: ['day'] },
  { name: 'Bungee Jumping', categories: ['day', 'adult'] },
  { name: 'Skydiving', categories: ['day', 'adult'] },
  { name: 'Zip Lining', categories: ['day'] },
  { name: 'ATV Tour', categories: ['day'] },
  { name: 'Jeep Safari', categories: ['day'] },
  { name: 'City Tour', categories: ['day'] },
  { name: 'Wine Tour', categories: ['day'] },
  { name: 'Brewery Tour', categories: ['day', 'stag'] },
  { name: 'Food Tour', categories: ['day'] },
  { name: 'Shopping Tour', categories: ['day', 'hen'] },
  { name: 'Casino Night', categories: ['night', 'adult', 'stag'] },
  { name: 'Karaoke', categories: ['night'] },
  { name: 'Comedy Show', categories: ['night'] },
  { name: 'Live Music', categories: ['night'] },
  { name: 'Foam Party', categories: ['night', 'adult'] },
  { name: 'Pool Party', categories: ['day', 'night', 'adult'] },
  { name: 'Sunset Cruise', categories: ['day', 'night'] },
  { name: 'Catamaran Cruise', categories: ['day'] },
  { name: 'Yacht Charter', categories: ['day', 'night', 'adult'] },
  { name: 'Helicopter Tour', categories: ['day'] },
  { name: 'Hot Air Balloon', categories: ['day'] },
  { name: 'Theme Park', categories: ['day'] },
  { name: 'Water Park', categories: ['day'] },
  { name: 'Escape Room', categories: ['day', 'night'] },
  { name: 'Laser Tag', categories: ['day', 'night'] },
  { name: 'Bowling', categories: ['day', 'night'] },
  { name: 'Ice Skating', categories: ['day', 'night'] },
  { name: 'Rock Climbing', categories: ['day'] },
  { name: 'Surfing Lessons', categories: ['day'] },
  { name: 'Yoga Class', categories: ['day', 'hen'] },
  { name: 'Fitness Bootcamp', categories: ['day'] },
  { name: 'Dance Class', categories: ['day', 'hen'] },
  { name: 'Cooking Class', categories: ['day'] },
  { name: 'Art Class', categories: ['day', 'hen'] },
  { name: 'Photography Tour', categories: ['day'] },
  { name: 'Segway Tour', categories: ['day'] },
  { name: 'Bike Tour', categories: ['day'] },
  { name: 'Hiking', categories: ['day'] },
  { name: 'Canyoning', categories: ['day', 'adult'] },
  { name: 'White Water Rafting', categories: ['day', 'adult'] },
  { name: 'Kayaking', categories: ['day'] },
  { name: 'Stand Up Paddleboarding', categories: ['day'] },
  { name: 'Sailing', categories: ['day'] },
  { name: 'Windsurfing', categories: ['day'] },
  { name: 'Kite Surfing', categories: ['day'] },
  { name: 'Wakeboarding', categories: ['day'] },
  { name: 'Water Skiing', categories: ['day'] },
  { name: 'Flyboarding', categories: ['day'] },
  { name: 'Banana Boat', categories: ['day'] },
  { name: 'Tube Ride', categories: ['day'] },
  { name: 'Speedboat Tour', categories: ['day'] },
  { name: 'Submarine Tour', categories: ['day'] },
  { name: 'Glass Bottom Boat', categories: ['day'] },
  { name: 'Dolphin Watching', categories: ['day'] },
  { name: 'Whale Watching', categories: ['day'] },
  { name: 'Aquarium Visit', categories: ['day'] },
  { name: 'Zoo Visit', categories: ['day'] },
  { name: 'Safari Park', categories: ['day'] },
  { name: 'Botanical Garden', categories: ['day'] },
  { name: 'Museum Visit', categories: ['day'] },
  { name: 'Historical Tour', categories: ['day'] },
  { name: 'Castle Tour', categories: ['day'] },
  { name: 'Beach Volleyball', categories: ['day'] },
  { name: 'Football Match', categories: ['day', 'night'] },
  { name: 'Rugby Match', categories: ['day', 'night'] },
  { name: 'Basketball Game', categories: ['day', 'night'] },
  { name: 'Tennis', categories: ['day'] },
  { name: 'Squash', categories: ['day'] },
  { name: 'Badminton', categories: ['day'] },
  { name: 'Table Tennis', categories: ['day', 'night'] },
  { name: 'Snooker', categories: ['day', 'night'] },
  { name: 'Darts', categories: ['day', 'night'] },
  { name: 'Archery', categories: ['day'] },
  { name: 'Shooting Range', categories: ['day', 'stag'] },
  { name: 'Clay Pigeon Shooting', categories: ['day', 'stag'] },
  { name: 'Axe Throwing', categories: ['day', 'night', 'stag'] },
  { name: 'Knife Throwing', categories: ['day', 'stag'] },
];

/**
 * Migration: Create events and categories collections
 * - Seeds predefined system categories
 * - Migrates hardcoded events to database
 * - Updates existing enquiries to reference event IDs
 */
export async function up(): Promise<void> {
  console.log('Starting migration 009: Create events collection...');

  try {
    // Get or create a system admin user for metadata
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found, using first user as creator');
      adminUser = await User.findOne();
      if (!adminUser) {
        throw new Error('No users found in database. Please create an admin user first.');
      }
    }

    // Step 1: Seed predefined categories
    console.log('Seeding predefined categories...');
    const categoryMap = new Map<string, mongoose.Types.ObjectId>();

    for (const categoryData of SYSTEM_CATEGORIES) {
      const existingCategory = await Category.findOne({ slug: categoryData.slug });
      
      if (existingCategory) {
        console.log(`Category "${categoryData.name}" already exists, skipping...`);
        categoryMap.set(categoryData.slug, existingCategory._id);
      } else {
        const category = await Category.create({
          ...categoryData,
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        categoryMap.set(categoryData.slug, category._id);
        console.log(`Created category: ${category.name}`);
      }
    }

    // Step 2: Migrate hardcoded events to database
    console.log('Migrating hardcoded events...');
    const eventMap = new Map<string, mongoose.Types.ObjectId>();
    let eventDisplayOrder = 1;

    for (const eventData of HARDCODED_EVENTS) {
      const existingEvent = await Event.findOne({ name: eventData.name });
      
      if (existingEvent) {
        console.log(`Event "${eventData.name}" already exists, skipping...`);
        eventMap.set(eventData.name, existingEvent._id);
      } else {
        // Map category slugs to ObjectIds
        const categoryIds = eventData.categories
          .map((slug) => categoryMap.get(slug))
          .filter((id): id is mongoose.Types.ObjectId => id !== undefined);

        const event = await Event.create({
          name: eventData.name,
          description: `${eventData.name} activity`,
          categories: categoryIds,
          destinations: [], // Will be available in all destinations by default
          availableInAllDestinations: true,
          isActive: true,
          displayOrder: eventDisplayOrder++,
          metadata: {
            createdBy: adminUser._id,
            updatedBy: adminUser._id,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        eventMap.set(eventData.name, event._id);
        console.log(`Created event: ${event.name}`);
      }
    }

    // Step 3: Update existing enquiries to use event ObjectIds
    console.log('Updating existing enquiries...');
    const enquiries = await Enquiry.find({
      eventsRequested: { $exists: true, $type: 'array' },
    });

    let updatedCount = 0;
    for (const enquiry of enquiries) {
      // Check if eventsRequested contains strings (old format)
      if (
        enquiry.eventsRequested.length > 0 &&
        typeof enquiry.eventsRequested[0] === 'string'
      ) {
        const eventIds: mongoose.Types.ObjectId[] = [];
        
        for (const eventName of enquiry.eventsRequested as unknown as string[]) {
          const eventId = eventMap.get(eventName);
          if (eventId) {
            eventIds.push(eventId);
          } else {
            console.warn(
              `Event "${eventName}" not found in migration map for enquiry ${enquiry._id}`
            );
          }
        }

        // Update enquiry with ObjectIds
        enquiry.eventsRequested = eventIds as any;
        await enquiry.save();
        updatedCount++;
      }
    }

    console.log(`Updated ${updatedCount} enquiries with event ObjectIds`);
    console.log('Migration 009 completed successfully!');
  } catch (error) {
    console.error('Migration 009 failed:', error);
    throw error;
  }
}

/**
 * Rollback: Remove events and categories collections
 * WARNING: This will delete all events and categories data
 */
export async function down(): Promise<void> {
  console.log('Rolling back migration 009: Remove events collection...');

  try {
    // Step 1: Revert enquiries to use event names (strings)
    console.log('Reverting enquiries to use event names...');
    const enquiries = await Enquiry.find({
      eventsRequested: { $exists: true, $ne: [] },
    }).populate('eventsRequested');

    for (const enquiry of enquiries) {
      if (enquiry.eventsRequested.length > 0) {
        // Get event names from populated events
        const eventNames = await Promise.all(
          enquiry.eventsRequested.map(async (eventId: mongoose.Types.ObjectId) => {
            const event = await Event.findById(eventId);
            return event ? event.name : null;
          })
        );

        // Filter out null values and update enquiry
        const validEventNames = eventNames.filter(
          (name): name is string => name !== null
        );
        enquiry.eventsRequested = validEventNames as any;
        await enquiry.save();
      }
    }

    // Step 2: Drop events collection
    console.log('Dropping events collection...');
    await mongoose.connection.collection('events').drop().catch(() => {
      console.log('Events collection does not exist or already dropped');
    });

    // Step 3: Drop categories collection
    console.log('Dropping categories collection...');
    await mongoose.connection.collection('categories').drop().catch(() => {
      console.log('Categories collection does not exist or already dropped');
    });

    console.log('Migration 009 rollback completed!');
  } catch (error) {
    console.error('Migration 009 rollback failed:', error);
    throw error;
  }
}
