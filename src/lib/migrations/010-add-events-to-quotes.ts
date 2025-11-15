import mongoose from 'mongoose';
import { connectToDatabase } from '../mongodb';

/**
 * Migration 010: Add selectedEvents field to quotes
 * 
 * This migration:
 * 1. Adds selectedEvents array field to existing quotes (empty array)
 * 2. Optionally migrates activitiesIncluded text to internalNotes
 * 3. Adds necessary indexes for performance
 * 4. Provides rollback functionality
 * 
 * Requirements: 5.1, 5.2, 5.3
 */

export const up = async (): Promise<void> => {
  console.log('Running migration: 010-add-events-to-quotes');

  await connectToDatabase();
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error('Database connection not established');
  }

  try {
    // Check if quotes collection exists
    const collections = await db.listCollections({ name: 'quotes' }).toArray();
    
    if (collections.length === 0) {
      console.log('Quotes collection does not exist yet, skipping migration');
      return;
    }

    // Step 1: Add selectedEvents field to all existing quotes (empty array)
    console.log('Adding selectedEvents field to existing quotes...');
    const result = await db.collection('quotes').updateMany(
      { selectedEvents: { $exists: false } },
      {
        $set: {
          selectedEvents: [],
        },
      }
    );
    console.log(`Updated ${result.modifiedCount} quotes with selectedEvents field`);

    // Step 2: Optionally migrate activitiesIncluded to internalNotes
    console.log('Migrating activitiesIncluded to internalNotes...');
    const quotesWithActivities = await db.collection('quotes').find({
      $and: [
        { activitiesIncluded: { $exists: true } },
        { activitiesIncluded: { $ne: '' } },
        { activitiesIncluded: { $ne: null } }
      ]
    }).toArray();

    let migratedCount = 0;
    for (const quote of quotesWithActivities) {
      const activitiesText = quote.activitiesIncluded;
      const existingNotes = quote.internalNotes || '';
      
      // Append activities to internal notes with a separator
      const updatedNotes = existingNotes
        ? `${existingNotes}\n\n[Migrated Activities]: ${activitiesText}`
        : `[Migrated Activities]: ${activitiesText}`;

      await db.collection('quotes').updateOne(
        { _id: quote._id },
        {
          $set: {
            internalNotes: updatedNotes,
          },
        }
      );
      migratedCount++;
    }
    console.log(`Migrated activitiesIncluded to internalNotes for ${migratedCount} quotes`);

    // Step 3: Create index on selectedEvents.eventId for performance
    console.log('Creating index on selectedEvents.eventId...');
    try {
      await db.collection('quotes').createIndex(
        { 'selectedEvents.eventId': 1 },
        { 
          name: 'selected_events_event_id_idx',
          sparse: true // Only index documents that have selectedEvents
        }
      );
      console.log('Created index: selected_events_event_id_idx');
    } catch (indexError: any) {
      if (indexError.code === 85 || indexError.codeName === 'IndexOptionsConflict') {
        console.log('Index selected_events_event_id_idx already exists, skipping...');
      } else {
        throw indexError;
      }
    }

    // Step 4: Update price history enum to include event-related reasons
    console.log('Updating collection validator to include event-related price history reasons...');
    
    // Get current collection options
    const collectionInfo = await db.listCollections({ name: 'quotes' }).toArray();
    const currentValidator = (collectionInfo[0] as any)?.options?.validator;

    if (currentValidator) {
      // Update the validator to include new price history reasons
      const updatedValidator = JSON.parse(JSON.stringify(currentValidator));
      
      // Find and update the priceHistory.reason enum if it exists
      if (
        updatedValidator.$jsonSchema?.properties?.priceHistory?.items?.properties?.reason?.enum
      ) {
        const reasonEnum = updatedValidator.$jsonSchema.properties.priceHistory.items.properties.reason.enum;
        
        // Add new event-related reasons if they don't exist
        if (!reasonEnum.includes('event_added')) {
          reasonEnum.push('event_added');
        }
        if (!reasonEnum.includes('event_removed')) {
          reasonEnum.push('event_removed');
        }

        // Apply the updated validator
        await db.command({
          collMod: 'quotes',
          validator: updatedValidator,
        });
        console.log('Updated collection validator with event-related price history reasons');
      }
    }

    console.log('Migration 010-add-events-to-quotes completed successfully');
  } catch (error) {
    console.error('Error in migration 010-add-events-to-quotes:', error);
    throw error;
  }
};

export const down = async (): Promise<void> => {
  console.log('Rolling back migration: 010-add-events-to-quotes');

  await connectToDatabase();
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error('Database connection not established');
  }

  try {
    // Check if quotes collection exists
    const collections = await db.listCollections({ name: 'quotes' }).toArray();
    
    if (collections.length === 0) {
      console.log('Quotes collection does not exist, nothing to rollback');
      return;
    }

    // Step 1: Remove selectedEvents field from all quotes
    console.log('Removing selectedEvents field from quotes...');
    const result = await db.collection('quotes').updateMany(
      { selectedEvents: { $exists: true } },
      {
        $unset: {
          selectedEvents: '',
        },
      }
    );
    console.log(`Removed selectedEvents field from ${result.modifiedCount} quotes`);

    // Step 2: Restore activitiesIncluded from internalNotes (best effort)
    console.log('Attempting to restore activitiesIncluded from internalNotes...');
    const quotesWithMigratedNotes = await db.collection('quotes').find({
      internalNotes: { $regex: /\[Migrated Activities\]:/ },
    }).toArray();

    let restoredCount = 0;
    for (const quote of quotesWithMigratedNotes) {
      const notes = quote.internalNotes || '';
      // Use multiline flag instead of dotAll flag for better compatibility
      const match = notes.match(/\[Migrated Activities\]:\s*(.+?)(?:\n\n|$)/);
      
      if (match && match[1]) {
        const activitiesText = match[1].trim();
        
        // Remove the migrated activities section from notes
        const cleanedNotes = notes
          .replace(/\n\n\[Migrated Activities\]:.+?(?=\n\n|$)/, '')
          .replace(/^\[Migrated Activities\]:.+?(?=\n\n|$)/, '')
          .trim();

        await db.collection('quotes').updateOne(
          { _id: quote._id },
          {
            $set: {
              activitiesIncluded: activitiesText,
              internalNotes: cleanedNotes || undefined,
            },
          }
        );
        restoredCount++;
      }
    }
    console.log(`Restored activitiesIncluded for ${restoredCount} quotes`);

    // Step 3: Drop the selectedEvents.eventId index
    console.log('Dropping index on selectedEvents.eventId...');
    try {
      await db.collection('quotes').dropIndex('selected_events_event_id_idx');
      console.log('Dropped index: selected_events_event_id_idx');
    } catch (indexError: any) {
      if (indexError.code === 27 || indexError.codeName === 'IndexNotFound') {
        console.log('Index selected_events_event_id_idx does not exist, skipping...');
      } else {
        throw indexError;
      }
    }

    // Step 4: Revert price history enum changes
    console.log('Reverting collection validator to remove event-related price history reasons...');
    
    const collectionInfo = await db.listCollections({ name: 'quotes' }).toArray();
    const currentValidator = (collectionInfo[0] as any)?.options?.validator;

    if (currentValidator) {
      const updatedValidator = JSON.parse(JSON.stringify(currentValidator));
      
      // Find and update the priceHistory.reason enum if it exists
      if (
        updatedValidator.$jsonSchema?.properties?.priceHistory?.items?.properties?.reason?.enum
      ) {
        const reasonEnum = updatedValidator.$jsonSchema.properties.priceHistory.items.properties.reason.enum;
        
        // Remove event-related reasons
        const filteredEnum = reasonEnum.filter(
          (reason: string) => reason !== 'event_added' && reason !== 'event_removed'
        );

        updatedValidator.$jsonSchema.properties.priceHistory.items.properties.reason.enum = filteredEnum;

        // Apply the updated validator
        await db.command({
          collMod: 'quotes',
          validator: updatedValidator,
        });
        console.log('Reverted collection validator to remove event-related price history reasons');
      }
    }

    console.log('Migration 010-add-events-to-quotes rolled back successfully');
  } catch (error) {
    console.error('Error rolling back migration 010-add-events-to-quotes:', error);
    throw error;
  }
};
