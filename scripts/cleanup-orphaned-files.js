#!/usr/bin/env node

/**
 * Scheduled cleanup script for orphaned training files
 * 
 * This script should be run periodically (e.g., daily via cron) to clean up
 * orphaned files that are older than 7 days.
 * 
 * Usage:
 *   node scripts/cleanup-orphaned-files.js [olderThanDays]
 * 
 * Example:
 *   node scripts/cleanup-orphaned-files.js 7
 *   node scripts/cleanup-orphaned-files.js 14
 * 
 * Cron example (daily at 2 AM):
 *   0 2 * * * cd /path/to/project && node scripts/cleanup-orphaned-files.js >> /var/log/file-cleanup.log 2>&1
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Configuration
const MONGODB_URI = process.env.MONGODB_URI;
const OLDER_THAN_DAYS = parseInt(process.argv[2]) || 7;

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI environment variable is not set');
  process.exit(1);
}

// File signature for validation
const FILE_SIGNATURES = {
  'application/pdf': [Buffer.from([0x25, 0x50, 0x44, 0x46])], // %PDF
  'image/jpeg': [
    Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
    Buffer.from([0xff, 0xd8, 0xff, 0xe1]),
    Buffer.from([0xff, 0xd8, 0xff, 0xe8]),
  ],
  'image/png': [Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
  'image/gif': [
    Buffer.from([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]), // GIF87a
    Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]), // GIF89a
  ],
  'image/webp': [Buffer.from([0x52, 0x49, 0x46, 0x46])], // RIFF
};

/**
 * Get full filesystem path from relative path
 */
function getFileFullPath(filePath) {
  return path.join(process.cwd(), 'public', filePath);
}

/**
 * Verify that a file exists on the filesystem
 */
async function verifyFileExists(filePath) {
  try {
    const fullPath = getFileFullPath(filePath);
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Find orphaned files older than specified days
 */
async function findOrphanedFiles(olderThanDays) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const FileStorage = mongoose.model('FileStorage');
  
  return await FileStorage.find({
    isOrphaned: true,
    createdAt: { $lt: cutoffDate },
  }).sort({ createdAt: -1 });
}

/**
 * Delete a file from filesystem
 */
async function deletePhysicalFile(filePath) {
  try {
    const fullPath = getFileFullPath(filePath);
    await fs.unlink(fullPath);
    return true;
  } catch (error) {
    console.warn(`  Warning: Failed to delete physical file ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main cleanup function
 */
async function cleanupOrphanedFiles() {
  console.log('='.repeat(80));
  console.log('Orphaned File Cleanup Script');
  console.log('='.repeat(80));
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log(`Configuration:`);
  console.log(`  - Older than: ${OLDER_THAN_DAYS} days`);
  console.log(`  - MongoDB URI: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
  console.log('');

  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');
    console.log('');

    // Define FileStorage schema if not already defined
    if (!mongoose.models.FileStorage) {
      const FileStorageSchema = new mongoose.Schema({
        id: String,
        originalName: String,
        fileName: String,
        filePath: String,
        mimeType: String,
        size: Number,
        uploadedBy: mongoose.Schema.Types.ObjectId,
        associatedMaterial: mongoose.Schema.Types.ObjectId,
        isOrphaned: Boolean,
        createdAt: Date,
        updatedAt: Date,
      }, { timestamps: true });

      mongoose.model('FileStorage', FileStorageSchema);
    }

    // Find orphaned files
    console.log(`Searching for orphaned files older than ${OLDER_THAN_DAYS} days...`);
    const orphanedFiles = await findOrphanedFiles(OLDER_THAN_DAYS);
    console.log(`✓ Found ${orphanedFiles.length} orphaned file(s)`);
    console.log('');

    if (orphanedFiles.length === 0) {
      console.log('No orphaned files to clean up.');
      return { deletedCount: 0, errors: 0 };
    }

    // Calculate total size
    const totalSize = orphanedFiles.reduce((sum, file) => sum + file.size, 0);
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    console.log(`Total size to be freed: ${totalSizeMB} MB`);
    console.log('');

    // Delete files
    console.log('Starting cleanup...');
    let deletedCount = 0;
    let errorCount = 0;

    for (const file of orphanedFiles) {
      const ageInDays = Math.floor((Date.now() - file.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`Processing: ${file.originalName} (${file.id})`);
      console.log(`  - Age: ${ageInDays} days`);
      console.log(`  - Size: ${(file.size / 1024).toFixed(2)} KB`);
      console.log(`  - Path: ${file.filePath}`);

      try {
        // Delete physical file
        const physicalDeleted = await deletePhysicalFile(file.filePath);
        
        // Delete database record
        const FileStorage = mongoose.model('FileStorage');
        await FileStorage.deleteOne({ _id: file._id });
        
        if (physicalDeleted) {
          console.log(`  ✓ Deleted successfully (file and database record)`);
        } else {
          console.log(`  ⚠ Database record deleted, but physical file not found`);
        }
        
        deletedCount++;
      } catch (error) {
        console.error(`  ✗ Error: ${error.message}`);
        errorCount++;
      }
      console.log('');
    }

    console.log('='.repeat(80));
    console.log('Cleanup Summary:');
    console.log(`  - Files processed: ${orphanedFiles.length}`);
    console.log(`  - Successfully deleted: ${deletedCount}`);
    console.log(`  - Errors: ${errorCount}`);
    console.log(`  - Space freed: ${totalSizeMB} MB`);
    console.log(`Completed at: ${new Date().toISOString()}`);
    console.log('='.repeat(80));

    return { deletedCount, errors: errorCount };
  } catch (error) {
    console.error('');
    console.error('='.repeat(80));
    console.error('FATAL ERROR:');
    console.error(error);
    console.error('='.repeat(80));
    throw error;
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('');
    console.log('MongoDB connection closed');
  }
}

// Run the cleanup
cleanupOrphanedFiles()
  .then(({ deletedCount, errors }) => {
    process.exit(errors > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
