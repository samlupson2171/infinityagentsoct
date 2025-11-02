/**
 * Debug script to test the price calculation API response structure
 */

const testPriceCalculation = async () => {
  try {
    console.log('Testing price calculation API...\n');

    // Test with sample data
    const testData = {
      packageId: '6770e0e5e4b0c8a9d1234567', // Replace with actual package ID
      numberOfPeople: 2,
      numberOfNights: 7,
      arrivalDate: new Date().toISOString(),
    };

    console.log('Request data:', JSON.stringify(testData, null, 2));

    const response = await fetch('http://localhost:3000/api/admin/super-packages/calculate-price', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('\nResponse status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('\nResponse body:', JSON.stringify(data, null, 2));

    // Check structure
    console.log('\n--- Structure Analysis ---');
    console.log('Has "calculation" property:', 'calculation' in data);
    console.log('Has "data" property:', 'data' in data);
    console.log('Top-level keys:', Object.keys(data));
    
    if (data.calculation) {
      console.log('Calculation keys:', Object.keys(data.calculation));
      console.log('Has totalPrice:', 'totalPrice' in data.calculation);
      console.log('Has pricePerPerson:', 'pricePerPerson' in data.calculation);
    }

    if (data.data && data.data.calculation) {
      console.log('Nested calculation keys:', Object.keys(data.data.calculation));
    }

  } catch (error) {
    console.error('Error:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
  }
};

testPriceCalculation();
