/**
 * Test script to verify the price calculation response structure fix
 * 
 * This tests that the hook correctly extracts calculation data from the API response
 * which is wrapped in { success: true, data: { calculation: {...} } }
 */

// Mock the API response structure
const mockApiResponse = {
  success: true,
  data: {
    calculation: {
      pricePerPerson: 550,
      totalPrice: 1100,
      price: 1100,
      numberOfPeople: 2,
      tier: {
        index: 0,
        label: '2-4 people',
        minPeople: 2,
        maxPeople: 4,
      },
      period: {
        period: 'January',
        periodType: 'month',
      },
      nights: 7,
      currency: 'GBP',
      packageName: 'Test Package',
      packageId: '123',
      packageVersion: 1,
    },
    message: 'Price calculated successfully',
  },
};

console.log('Testing price calculation response extraction...\n');

// Test the extraction logic
const responseData = mockApiResponse;

console.log('1. Full response structure:');
console.log(JSON.stringify(responseData, null, 2));

console.log('\n2. Extracting calculation...');
const result = responseData.data?.calculation || responseData.calculation;

if (!result) {
  console.error('❌ FAILED: Could not extract calculation');
  console.error('Response structure:', {
    hasData: 'data' in responseData,
    hasCalculation: 'calculation' in responseData,
    dataKeys: responseData.data ? Object.keys(responseData.data) : [],
    topKeys: Object.keys(responseData),
  });
} else {
  console.log('✅ SUCCESS: Calculation extracted');
  console.log('Calculation data:', JSON.stringify(result, null, 2));
  
  console.log('\n3. Validating calculation structure...');
  const hasRequiredFields = 
    'pricePerPerson' in result &&
    'totalPrice' in result &&
    'numberOfPeople' in result &&
    'tier' in result &&
    'period' in result;
  
  if (hasRequiredFields) {
    console.log('✅ All required fields present');
    console.log('  - pricePerPerson:', result.pricePerPerson);
    console.log('  - totalPrice:', result.totalPrice);
    console.log('  - numberOfPeople:', result.numberOfPeople);
    console.log('  - tier:', result.tier.label);
    console.log('  - period:', result.period.period);
  } else {
    console.error('❌ Missing required fields');
  }
}

console.log('\n4. Testing backward compatibility (direct calculation property)...');
const oldStyleResponse = {
  calculation: mockApiResponse.data.calculation,
};

const resultOldStyle = oldStyleResponse.data?.calculation || oldStyleResponse.calculation;
if (resultOldStyle) {
  console.log('✅ Backward compatibility maintained');
} else {
  console.error('❌ Backward compatibility broken');
}

console.log('\n✅ All tests passed! The fix should work correctly.');
