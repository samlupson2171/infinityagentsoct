/**
 * Test script to verify quote creation with linkedPackage data works correctly
 */

const testQuoteCreationWithPackage = async () => {
  console.log('=== Testing Quote Creation with Linked Package ===\n');

  // Sample quote data with linkedPackage (as sent from QuoteForm)
  const testQuoteData = {
    hotelName: 'Test Hotel',
    numberOfPeople: 4,
    numberOfRooms: 2,
    numberOfNights: 7,
    arrivalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isSuperPackage: true,
    whatsIncluded: '• Accommodation\n• Breakfast\n• Airport transfers',
    transferIncluded: true,
    totalPrice: 2200,
    currency: 'GBP',
    internalNotes: 'Test quote with package',
    linkedPackage: {
      packageId: '6770e0e5e4b0c8a9d1234567',
      packageName: 'Benidorm Super Package',
      packageVersion: 1,
      selectedTier: {
        tierIndex: 1,
        tierLabel: '4-6 people',
      },
      selectedNights: 7,
      selectedPeriod: 'January',
      calculatedPrice: 2200,
      pricePerPerson: 550,
      priceWasOnRequest: false,
    },
  };

  console.log('Test data structure:');
  console.log(JSON.stringify(testQuoteData, null, 2));
  console.log('\n');

  try {
    // Replace with actual enquiry ID from your database
    const enquiryId = 'REPLACE_WITH_ACTUAL_ENQUIRY_ID';
    
    console.log(`Attempting to create quote for enquiry: ${enquiryId}\n`);

    const response = await fetch(`http://localhost:3000/api/admin/enquiries/${enquiryId}/quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add your auth token here
        // 'Authorization': 'Bearer YOUR_TOKEN',
      },
      body: JSON.stringify(testQuoteData),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('\n');

    const responseData = await response.json();
    console.log('Response body:');
    console.log(JSON.stringify(responseData, null, 2));
    console.log('\n');

    if (response.ok) {
      console.log('✅ SUCCESS: Quote created with linkedPackage data');
      
      // Verify linkedPackage was saved
      if (responseData.data?.linkedPackage) {
        console.log('✅ linkedPackage data was saved correctly:');
        console.log('   - Package ID:', responseData.data.linkedPackage.packageId);
        console.log('   - Package Name:', responseData.data.linkedPackage.packageName);
        console.log('   - Selected Tier:', responseData.data.linkedPackage.selectedTier.tierLabel);
        console.log('   - Calculated Price:', responseData.data.linkedPackage.calculatedPrice);
        console.log('   - Price Per Person:', responseData.data.linkedPackage.pricePerPerson);
      } else {
        console.log('⚠️  WARNING: Quote created but linkedPackage data is missing');
      }
    } else {
      console.log('❌ FAILED: Quote creation failed');
      console.log('Error:', responseData.error?.message);
      if (responseData.error?.details) {
        console.log('Validation errors:', responseData.error.details);
      }
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
};

// Instructions
console.log('INSTRUCTIONS:');
console.log('1. Make sure your Next.js server is running (npm run dev)');
console.log('2. Replace REPLACE_WITH_ACTUAL_ENQUIRY_ID with a real enquiry ID');
console.log('3. Add authentication token if required');
console.log('4. Run: node test-quote-creation-with-package.js\n');
console.log('---\n');

// Uncomment to run the test
// testQuoteCreationWithPackage();
