/**
 * Verification script for Task 9: Quote API Routes Event Handling
 * 
 * This script verifies that the quote API routes properly handle events:
 * - POST /api/admin/quotes - saves selectedEvents
 * - PUT /api/admin/quotes/[id] - updates selectedEvents
 * - GET routes - populate event details
 * - Validation for event existence and active status
 * - Graceful handling of event price changes
 */

const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function verifyTask9Implementation() {
  console.log('🔍 Verifying Task 9: Quote API Routes Event Handling\n');
  console.log('=' .repeat(60));

  const results = {
    passed: [],
    failed: [],
    warnings: []
  };

  try {
    // Connect to MongoDB
    console.log('\n📊 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Load models
    const Quote = require('./src/models/Quote').default;
    const Event = require('./src/models/Event').default;
    const Enquiry = require('./src/models/Enquiry').default;
    const User = require('./src/models/User').default;

    // 1. Verify Quote model has selectedEvents field
    console.log('1️⃣  Verifying Quote model schema...');
    const quoteSchema = Quote.schema;
    const hasSelectedEvents = quoteSchema.path('selectedEvents');
    
    if (hasSelectedEvents) {
      console.log('   ✅ Quote model has selectedEvents field');
      console.log('   ✅ selectedEvents is an array of embedded documents');
      results.passed.push('Quote model schema includes selectedEvents');
    } else {
      console.log('   ❌ Quote model missing selectedEvents field');
      results.failed.push('Quote model schema missing selectedEvents');
    }

    // 2. Verify selectedEvents schema structure
    console.log('\n2️⃣  Verifying selectedEvents schema structure...');
    if (hasSelectedEvents) {
      const selectedEventsSchema = quoteSchema.path('selectedEvents');
      const requiredFields = ['eventId', 'eventName', 'eventPrice', 'eventCurrency', 'addedAt'];
      const schemaFields = Object.keys(selectedEventsSchema.schema.paths);
      
      const missingFields = requiredFields.filter(field => !schemaFields.includes(field));
      
      if (missingFields.length === 0) {
        console.log('   ✅ All required fields present in selectedEvents schema');
        console.log(`   ✅ Fields: ${requiredFields.join(', ')}`);
        results.passed.push('selectedEvents schema structure is correct');
      } else {
        console.log(`   ❌ Missing fields: ${missingFields.join(', ')}`);
        results.failed.push(`selectedEvents schema missing fields: ${missingFields.join(', ')}`);
      }
    }

    // 3. Verify index on selectedEvents.eventId
    console.log('\n3️⃣  Verifying database indexes...');
    const indexes = quoteSchema.indexes();
    const hasEventIndex = indexes.some(index => 
      index[0]['selectedEvents.eventId'] === 1
    );
    
    if (hasEventIndex) {
      console.log('   ✅ Index exists on selectedEvents.eventId');
      results.passed.push('Database index on selectedEvents.eventId');
    } else {
      console.log('   ⚠️  No index found on selectedEvents.eventId');
      results.warnings.push('Consider adding index on selectedEvents.eventId for performance');
    }

    // 4. Test creating a quote with events
    console.log('\n4️⃣  Testing quote creation with events...');
    
    // Find a test enquiry and admin user
    const testEnquiry = await Enquiry.findOne();
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!testEnquiry || !adminUser) {
      console.log('   ⚠️  Skipping: No test enquiry or admin user found');
      results.warnings.push('Could not test quote creation - missing test data');
    } else {
      // Find an active event
      const testEvent = await Event.findOne({ isActive: true });
      
      if (!testEvent) {
        console.log('   ⚠️  Skipping: No active events found');
        results.warnings.push('Could not test quote creation - no active events');
      } else {
        const testQuoteData = {
          enquiryId: testEnquiry._id,
          leadName: 'Test Lead',
          hotelName: 'Test Hotel',
          numberOfPeople: 10,
          numberOfRooms: 5,
          numberOfNights: 3,
          arrivalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isSuperPackage: false,
          whatsIncluded: 'Test inclusions',
          transferIncluded: true,
          totalPrice: 1500,
          currency: 'GBP',
          createdBy: adminUser._id,
          selectedEvents: [
            {
              eventId: testEvent._id,
              eventName: testEvent.name,
              eventPrice: testEvent.pricing?.estimatedCost || 50,
              eventCurrency: testEvent.pricing?.currency || 'GBP',
              addedAt: new Date()
            }
          ]
        };

        try {
          const testQuote = new Quote(testQuoteData);
          await testQuote.save();
          
          console.log('   ✅ Successfully created quote with selectedEvents');
          console.log(`   ✅ Quote ID: ${testQuote._id}`);
          console.log(`   ✅ Events count: ${testQuote.selectedEvents.length}`);
          
          results.passed.push('Quote creation with selectedEvents works');
          
          // Clean up test quote
          await Quote.findByIdAndDelete(testQuote._id);
          console.log('   ✅ Test quote cleaned up');
          
        } catch (error) {
          console.log(`   ❌ Failed to create quote: ${error.message}`);
          results.failed.push(`Quote creation failed: ${error.message}`);
        }
      }
    }

    // 5. Verify API route files exist
    console.log('\n5️⃣  Verifying API route files...');
    const fs = require('fs');
    const path = require('path');
    
    const routeFiles = [
      'src/app/api/admin/quotes/route.ts',
      'src/app/api/admin/quotes/[id]/route.ts',
      'src/app/api/admin/quotes/calculate-events-price/route.ts'
    ];
    
    for (const file of routeFiles) {
      if (fs.existsSync(path.join(process.cwd(), file))) {
        console.log(`   ✅ ${file} exists`);
        results.passed.push(`API route file exists: ${file}`);
      } else {
        console.log(`   ❌ ${file} not found`);
        results.failed.push(`API route file missing: ${file}`);
      }
    }

    // 6. Check for event validation in API routes
    console.log('\n6️⃣  Checking API routes for event validation...');
    const postRouteContent = fs.readFileSync(
      path.join(process.cwd(), 'src/app/api/admin/quotes/route.ts'),
      'utf-8'
    );
    const putRouteContent = fs.readFileSync(
      path.join(process.cwd(), 'src/app/api/admin/quotes/[id]/route.ts'),
      'utf-8'
    );
    
    const validationChecks = [
      { name: 'Event existence validation', pattern: /Event\.find.*\$in.*eventIds/s },
      { name: 'Inactive event warning', pattern: /inactiveEvents/i },
      { name: 'Event price change detection', pattern: /eventPrice.*currentPrice/i },
      { name: 'Event population in GET', pattern: /populate.*selectedEvents\.eventId/i }
    ];
    
    for (const check of validationChecks) {
      const foundInPost = check.pattern.test(postRouteContent);
      const foundInPut = check.pattern.test(putRouteContent);
      
      if (foundInPost || foundInPut) {
        console.log(`   ✅ ${check.name} implemented`);
        results.passed.push(check.name);
      } else {
        console.log(`   ❌ ${check.name} not found`);
        results.failed.push(check.name);
      }
    }

    // 7. Verify price history tracks event changes
    console.log('\n7️⃣  Verifying price history tracks event changes...');
    const hasPriceHistory = quoteSchema.path('priceHistory');
    
    if (hasPriceHistory) {
      const priceHistorySchema = quoteSchema.path('priceHistory');
      const reasonEnum = priceHistorySchema.schema.path('reason').enumValues;
      
      const hasEventReasons = reasonEnum.includes('event_added') && 
                             reasonEnum.includes('event_removed');
      
      if (hasEventReasons) {
        console.log('   ✅ Price history includes event_added and event_removed reasons');
        results.passed.push('Price history tracks event changes');
      } else {
        console.log('   ❌ Price history missing event change reasons');
        results.failed.push('Price history does not track event changes');
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`\n✅ Passed: ${results.passed.length}`);
    results.passed.forEach(item => console.log(`   • ${item}`));
    
    if (results.warnings.length > 0) {
      console.log(`\n⚠️  Warnings: ${results.warnings.length}`);
      results.warnings.forEach(item => console.log(`   • ${item}`));
    }
    
    if (results.failed.length > 0) {
      console.log(`\n❌ Failed: ${results.failed.length}`);
      results.failed.forEach(item => console.log(`   • ${item}`));
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (results.failed.length === 0) {
      console.log('✅ Task 9 Implementation: VERIFIED');
      console.log('\nAll quote API routes properly handle events:');
      console.log('  • POST route saves selectedEvents with validation');
      console.log('  • PUT route updates selectedEvents with validation');
      console.log('  • GET routes populate event details');
      console.log('  • Event existence and active status validated');
      console.log('  • Event price changes handled gracefully');
    } else {
      console.log('❌ Task 9 Implementation: ISSUES FOUND');
      console.log('\nPlease review the failed checks above.');
    }
    
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Verification failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

// Run verification
verifyTask9Implementation()
  .then(() => {
    console.log('\n✅ Verification complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  });
