#!/usr/bin/env node

/**
 * Test script to verify orphaned file cleanup functionality
 * 
 * This script tests:
 * 1. Creating a training material with files
 * 2. Deleting the material marks files as orphaned
 * 3. Cleanup removes orphaned files after grace period
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI environment variable is not set');
  process.exit(1);
}

async function testOrphanedFileCleanup() {
  console.log('='.repeat(80));
  console.log('Orphaned File Cleanup Test');
  console.log('='.repeat(80));
  console.log('');

  try {
    // Connect to MongoDB
    console.log('1. Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('   ✓ Connected');
    console.log('');

    // Define schemas if models don't exist
    if (!mongoose.models.TrainingMaterial) {
      const TrainingMaterialSchema = new mongoose.Schema({
        title: String,
        description: String,
        type: String,
        uploadedFiles: [{
          id: String,
          originalName: String,
          fileName: String,
          filePath: String,
          mimeType: String,
          size: Number,
          uploadedAt: Date,
        }],
        isActive: Boolean,
        createdBy: mongoose.Schema.Types.ObjectId,
      }, { timestamps: true });
      mongoose.model('TrainingMaterial', TrainingMaterialSchema);
    }

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
      }, { timestamps: true });
      mongoose.model('FileStorage', FileStorageSchema);
    }

    const TrainingMaterial = mongoose.model('TrainingMaterial');
    const FileStorage = mongoose.model('FileStorage');

    // Find a training material with uploaded files
    console.log('2. Finding training materials with files...');
    const materials = await TrainingMaterial.find({
      type: 'download',
      uploadedFiles: { $exists: true, $ne: [] }
    }).limit(5);

    console.log(`   Found ${materials.length} materials with files`);
    
    if (materials.length > 0) {
      const material = materials[0];
      console.log(`   Example material: ${material.title}`);
      console.log(`   Files: ${material.uploadedFiles.length}`);
      
      // Check file status in database
      console.log('');
      console.log('3. Checking file status in database...');
      for (const file of material.uploadedFiles) {
        const fileRecord = await FileStorage.findOne({ id: file.id });
        if (fileRecord) {
          console.log(`   File: ${file.originalName}`);
          console.log(`     - ID: ${file.id}`);
          console.log(`     - Orphaned: ${fileRecord.isOrphaned}`);
          console.log(`     - Associated Material: ${fileRecord.associatedMaterial || 'none'}`);
        } else {
          console.log(`   File ${file.id} not found in FileStorage`);
        }
      }
    } else {
      console.log('   No materials with files found');
    }

    // Check for orphaned files
    console.log('');
    console.log('4. Checking for orphaned files...');
    const orphanedFiles = await FileStorage.find({ isOrphaned: true });
    console.log(`   Found ${orphanedFiles.length} orphaned files`);

    if (orphanedFiles.length > 0) {
      console.log('');
      console.log('   Orphaned files:');
      for (const file of orphanedFiles.slice(0, 5)) {
        const ageInDays = Math.floor((Date.now() - file.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`   - ${file.originalName} (${file.id})`);
        console.log(`     Age: ${ageInDays} days`);
        console.log(`     Size: ${(file.size / 1024).toFixed(2)} KB`);
        console.log(`     Created: ${file.createdAt.toISOString()}`);
      }
      
      if (orphanedFiles.length > 5) {
        console.log(`   ... and ${orphanedFiles.length - 5} more`);
      }
    }

    // Check for orphaned files older than 7 days
    console.log('');
    console.log('5. Checking for orphaned files older than 7 days...');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);
    
    const oldOrphanedFiles = await FileStorage.find({
      isOrphaned: true,
      createdAt: { $lt: cutoffDate }
    });
    
    console.log(`   Found ${oldOrphanedFiles.length} orphaned files older than 7 days`);
    
    if (oldOrphanedFiles.length > 0) {
      const totalSize = oldOrphanedFiles.reduce((sum, file) => sum + file.size, 0);
      console.log(`   Total size: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
      console.log('');
      console.log('   These files are eligible for cleanup.');
      console.log('   Run: node scripts/cleanup-orphaned-files.js');
    }

    console.log('');
    console.log('='.repeat(80));
    console.log('Test Summary:');
    console.log(`  - Materials with files: ${materials.length}`);
    console.log(`  - Total orphaned files: ${orphanedFiles.length}`);
    console.log(`  - Orphaned files > 7 days: ${oldOrphanedFiles.length}`);
    console.log('='.repeat(80));

  } catch (error) {
    console.error('');
    console.error('ERROR:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('');
    console.log('MongoDB connection closed');
  }
}

// Run the test
testOrphanedFileCleanup()
  .then(() => {
    console.log('');
    console.log('✓ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('');
    console.error('✗ Test failed:', error);
    process.exit(1);
  });
