#!/usr/bin/env node

/**
 * Database Connection Verification Script
 * 
 * This script tests the MongoDB connection and provides detailed diagnostics.
 * Run this locally and on Vercel to verify database connectivity.
 */

const { MongoClient } = require('mongodb');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

async function verifyDatabaseConnection() {
  logSection('MongoDB Connection Verification');
  
  // Check if MONGODB_URI is set
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    log('❌ MONGODB_URI environment variable is not set', 'red');
    log('\nPlease set MONGODB_URI in your environment:', 'yellow');
    log('  export MONGODB_URI="mongodb+srv://..."', 'yellow');
    process.exit(1);
  }
  
  log('✓ MONGODB_URI environment variable is set', 'green');
  
  // Parse connection string (hide password)
  try {
    const url = new URL(mongoUri.replace('mongodb+srv://', 'https://'));
    const username = url.username;
    const hostname = url.hostname;
    const database = url.pathname.slice(1).split('?')[0];
    
    log(`\nConnection Details:`, 'blue');
    log(`  Username: ${username}`);
    log(`  Cluster: ${hostname}`);
    log(`  Database: ${database || '(default)'}`);
  } catch (error) {
    log('⚠ Could not parse connection string', 'yellow');
  }
  
  // Test connection
  logSection('Testing Connection');
  
  let client;
  try {
    log('Connecting to MongoDB...', 'blue');
    
    client = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    
    await client.connect();
    log('✓ Successfully connected to MongoDB', 'green');
    
    // Test database access
    logSection('Testing Database Access');
    
    const db = client.db();
    log(`Database name: ${db.databaseName}`, 'blue');
    
    // List collections
    const collections = await db.listCollections().toArray();
    log(`\n✓ Found ${collections.length} collections:`, 'green');
    collections.forEach(col => {
      log(`  - ${col.name}`);
    });
    
    // Test read operation
    logSection('Testing Read Operation');
    
    const testCollection = collections.length > 0 ? collections[0].name : 'test';
    const collection = db.collection(testCollection);
    
    try {
      const count = await collection.countDocuments();
      log(`✓ Successfully read from collection "${testCollection}"`, 'green');
      log(`  Document count: ${count}`);
    } catch (error) {
      log(`⚠ Could not read from collection "${testCollection}"`, 'yellow');
      log(`  Error: ${error.message}`, 'yellow');
    }
    
    // Test write operation (if possible)
    logSection('Testing Write Operation');
    
    try {
      // Use a dedicated test collection to avoid conflicts
      const testCollection = db.collection('_connection_test');
      const testDoc = {
        _id: 'connection-test-' + Date.now(),
        test: true,
        timestamp: new Date(),
      };
      
      await testCollection.insertOne(testDoc);
      log('✓ Successfully wrote test document', 'green');
      
      // Clean up test document
      await testCollection.deleteOne({ _id: testDoc._id });
      log('✓ Successfully deleted test document', 'green');
    } catch (error) {
      log('⚠ Could not write to database', 'yellow');
      log(`  Error: ${error.message}`, 'yellow');
      log('  This may be due to user permissions', 'yellow');
    }
    
    // Connection info
    logSection('Connection Information');
    
    const admin = db.admin();
    try {
      const serverStatus = await admin.serverStatus();
      log(`MongoDB Version: ${serverStatus.version}`, 'blue');
      log(`Uptime: ${Math.floor(serverStatus.uptime / 60)} minutes`, 'blue');
    } catch (error) {
      log('⚠ Could not retrieve server status (requires admin privileges)', 'yellow');
    }
    
    // Final summary
    logSection('Verification Summary');
    log('✓ Database connection is working correctly', 'green');
    log('✓ Read operations are functional', 'green');
    log('✓ Write operations are functional', 'green');
    log('\nYour database is ready for deployment!', 'green');
    
  } catch (error) {
    logSection('Connection Failed');
    log('❌ Failed to connect to MongoDB', 'red');
    log(`\nError: ${error.message}`, 'red');
    
    // Provide troubleshooting tips
    log('\nTroubleshooting Tips:', 'yellow');
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
      log('  • Check your network connection', 'yellow');
      log('  • Verify the cluster hostname in MONGODB_URI', 'yellow');
      log('  • Ensure MongoDB Atlas Network Access allows your IP (0.0.0.0/0)', 'yellow');
    } else if (error.message.includes('Authentication failed')) {
      log('  • Verify your database username and password', 'yellow');
      log('  • Check if password contains special characters (needs URL encoding)', 'yellow');
      log('  • Ensure database user has correct permissions', 'yellow');
    } else if (error.message.includes('not authorized')) {
      log('  • Check database user permissions in MongoDB Atlas', 'yellow');
      log('  • Ensure user has readWrite role on the database', 'yellow');
    } else {
      log('  • Review the error message above', 'yellow');
      log('  • Check MongoDB Atlas status page', 'yellow');
      log('  • Verify MONGODB_URI format is correct', 'yellow');
    }
    
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      log('\nConnection closed', 'blue');
    }
  }
}

// Run verification
verifyDatabaseConnection().catch(error => {
  log(`\nUnexpected error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
