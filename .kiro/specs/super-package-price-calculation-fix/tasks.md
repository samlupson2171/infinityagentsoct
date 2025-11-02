# Implementation Plan

- [x] 1. Update PricingCalculator to calculate total price correctly
  - Update `PriceCalculationResult` interface to include `pricePerPerson`, `totalPrice`, and `numberOfPeople` fields
  - Modify `calculatePrice()` method to multiply per-person price by numberOfPeople to get total price
  - Keep `price` field for backward compatibility (set equal to `totalPrice`)
  - Add clear code comments explaining that database prices are per-person rates
  - Handle 'ON_REQUEST' prices correctly in the calculation
  - _Requirements: 1.1, 1.4, 3.2, 3.3_

- [x] 2. Update PackageSelector component to use correct price values
  - Update `PriceCalculation` interface to match new structure with `pricePerPerson` and `totalPrice`
  - Remove the incorrect division by numberOfPeople in price breakdown calculation
  - Update price mapping from API response to use `pricePerPerson` and `totalPrice` directly
  - Update price breakdown display to show both per-person and total prices clearly
  - Ensure currency formatting is consistent for all displayed prices
  - _Requirements: 1.2, 2.1, 2.2, 2.3, 2.4_

- [x] 3. Update QuoteForm component to handle new price structure
  - Update package selection handler to use `totalPrice` from calculation
  - Update `linkedPackageInfo` state to store both `pricePerPerson` and `originalPrice` (total)
  - Ensure price synchronization logic uses correct total price values
  - Update price change handler to work with new structure
  - _Requirements: 1.3, 3.3_

- [x] 4. Update type definitions for price structure
  - Update `PackageSelection` interface in `quote-price-sync.ts` to include `pricePerPerson` and `totalPrice`
  - Update `LinkedPackageInfo` interface to include optional `pricePerPerson` field
  - Ensure backward compatibility by keeping `price` field as deprecated
  - Add JSDoc comments explaining the price fields
  - _Requirements: 3.2, 4.4_

- [x] 5. Add validation for price calculations
  - Add validation in PricingCalculator to verify totalPrice >= pricePerPerson
  - Add validation to check totalPrice > pricePerPerson when numberOfPeople > 1
  - Add logging for price calculation validation failures
  - Ensure 'ON_REQUEST' prices are handled consistently
  - _Requirements: 3.4_

- [ ]* 6. Update unit tests for PricingCalculator
  - Write test for single person: verify totalPrice equals pricePerPerson
  - Write test for multiple people: verify totalPrice = pricePerPerson × numberOfPeople
  - Write test for 'ON_REQUEST' prices
  - Write test for backward compatibility: verify `price` field equals `totalPrice`
  - Write test for validation: verify totalPrice >= pricePerPerson
  - _Requirements: 1.1, 3.4, 4.1_

- [ ]* 7. Update component tests
  - Update PackageSelector tests to verify correct price display
  - Update QuoteForm tests to verify correct price application
  - Add test to verify no division by numberOfPeople occurs
  - Add test for price breakdown display accuracy
  - _Requirements: 1.2, 2.1, 2.2, 2.3_

- [ ]* 8. Add integration test for end-to-end price flow
  - Test selecting package with 10 people and verifying total = per-person × 10
  - Test that quote form receives correct total price
  - Test that quote saves with correct price
  - Test backward compatibility with existing quotes
  - _Requirements: 1.1, 1.2, 1.3, 4.2, 4.3_

- [x] 9. Update API route response structure
  - Verify calculate-price API route returns new structure correctly
  - Ensure API response includes `pricePerPerson`, `totalPrice`, and `numberOfPeople`
  - Maintain backward compatibility with `price` field
  - Update API documentation comments
  - _Requirements: 4.4_

- [x] 10. Manual testing and verification
  - Test with 1 person: verify total equals per-person
  - Test with 10 people: verify total is 10× per-person
  - Test with 'ON_REQUEST' price: verify proper handling
  - Test editing existing quote: verify prices recalculate correctly
  - Test changing number of people: verify price updates correctly
  - Verify price breakdown display is clear and accurate
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 4.3_
