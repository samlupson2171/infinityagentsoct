/**
 * Example usage of useQuotePrice hook
 * 
 * This file demonstrates how to integrate the useQuotePrice hook
 * into a quote form component for automatic price synchronization.
 */

import { useState } from 'react';
import { useQuotePrice } from './useQuotePrice';
import type { LinkedPackageInfo } from '@/types/quote-price-sync';

export function QuoteFormExample() {
  // Form state
  const [linkedPackage, setLinkedPackage] = useState<LinkedPackageInfo | null>(null);
  const [numberOfPeople, setNumberOfPeople] = useState(8);
  const [numberOfNights, setNumberOfNights] = useState(3);
  const [arrivalDate, setArrivalDate] = useState('2025-01-15');
  const [totalPrice, setTotalPrice] = useState(0);

  // Use the price synchronization hook
  const {
    syncStatus,
    calculatedPrice,
    priceBreakdown,
    error,
    recalculatePrice,
    markAsCustomPrice,
    resetToCalculated,
    validationWarnings,
    isParameterValid,
  } = useQuotePrice({
    linkedPackage,
    numberOfPeople,
    numberOfNights,
    arrivalDate,
    currentPrice: totalPrice,
    onPriceUpdate: setTotalPrice,
    autoRecalculate: true, // Enable automatic recalculation
  });

  // Handle package selection
  const handlePackageSelect = (packageInfo: LinkedPackageInfo) => {
    setLinkedPackage(packageInfo);
    // The hook will automatically calculate the price
  };

  // Handle manual price change
  const handlePriceChange = (newPrice: number) => {
    setTotalPrice(newPrice);
    // The hook will automatically detect this as a custom price
  };

  return (
    <div className="quote-form">
      <h2>Create Quote</h2>

      {/* Package Selection */}
      <div className="form-group">
        <label>Linked Package</label>
        {linkedPackage ? (
          <div className="package-info">
            <span>{linkedPackage.packageName}</span>
            <button onClick={() => setLinkedPackage(null)}>Unlink</button>
          </div>
        ) : (
          <button onClick={() => {/* Open package selector */}}>
            Select Package
          </button>
        )}
      </div>

      {/* Trip Parameters */}
      <div className="form-group">
        <label>Number of People</label>
        <input
          type="number"
          value={numberOfPeople}
          onChange={(e) => setNumberOfPeople(parseInt(e.target.value))}
        />
      </div>

      <div className="form-group">
        <label>Number of Nights</label>
        <input
          type="number"
          value={numberOfNights}
          onChange={(e) => setNumberOfNights(parseInt(e.target.value))}
        />
      </div>

      <div className="form-group">
        <label>Arrival Date</label>
        <input
          type="date"
          value={arrivalDate}
          onChange={(e) => setArrivalDate(e.target.value)}
        />
      </div>

      {/* Price Field with Sync Status */}
      <div className="form-group">
        <label>Total Price</label>
        <div className="price-input-wrapper">
          <input
            type="number"
            value={totalPrice}
            onChange={(e) => handlePriceChange(parseFloat(e.target.value))}
          />
          
          {/* Sync Status Indicator */}
          <div className={`sync-indicator sync-${syncStatus}`}>
            {syncStatus === 'synced' && '✓ Synced'}
            {syncStatus === 'calculating' && '⟳ Calculating...'}
            {syncStatus === 'custom' && '✎ Custom Price'}
            {syncStatus === 'error' && '⚠ Error'}
          </div>
        </div>

        {/* Price Breakdown Tooltip */}
        {priceBreakdown && (
          <div className="price-breakdown">
            <p>Tier: {priceBreakdown.tierUsed}</p>
            <p>Period: {priceBreakdown.periodUsed}</p>
            <p>Price per person: {priceBreakdown.currency} {priceBreakdown.pricePerPerson}</p>
            <p>Total: {priceBreakdown.currency} {priceBreakdown.totalPrice}</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Validation Warnings */}
        {validationWarnings.length > 0 && (
          <div className="validation-warnings">
            {validationWarnings.map((warning, index) => (
              <div key={index} className="warning">
                ⚠ {warning}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {linkedPackage && (
        <div className="price-actions">
          {syncStatus === 'custom' && (
            <button onClick={resetToCalculated}>
              Reset to Calculated Price
            </button>
          )}
          
          <button onClick={recalculatePrice}>
            Recalculate Price
          </button>
          
          <button onClick={markAsCustomPrice}>
            Use Custom Price
          </button>
        </div>
      )}

      {/* Submit Button */}
      <button 
        type="submit"
        disabled={!isParameterValid && linkedPackage !== null}
      >
        Create Quote
      </button>
    </div>
  );
}

/**
 * Key Features Demonstrated:
 * 
 * 1. Automatic Price Calculation:
 *    - When a package is linked, the hook automatically calculates the price
 *    - Price updates automatically when parameters change (debounced)
 * 
 * 2. Custom Price Detection:
 *    - When user manually changes the price, it's automatically detected
 *    - Sync status changes to 'custom' to indicate manual override
 * 
 * 3. Validation Warnings:
 *    - Hook validates parameters against package constraints
 *    - Displays warnings for incompatible values
 * 
 * 4. Manual Actions:
 *    - recalculatePrice(): Force a price recalculation
 *    - markAsCustomPrice(): Explicitly mark price as custom
 *    - resetToCalculated(): Reset to the calculated price
 * 
 * 5. Visual Feedback:
 *    - Sync status indicator shows current state
 *    - Price breakdown shows calculation details
 *    - Error messages for calculation failures
 * 
 * 6. Performance:
 *    - Parameter changes are debounced (500ms)
 *    - Price calculations are cached via React Query
 *    - Prevents excessive API calls
 */
