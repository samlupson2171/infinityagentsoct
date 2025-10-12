/**
 * PriceSyncIndicator Usage Examples
 * 
 * This file demonstrates how to use the PriceSyncIndicator component
 * in different scenarios within the quote management system.
 */

import React from 'react';
import PriceSyncIndicator from './PriceSyncIndicator';
import { PriceBreakdown } from '@/types/quote-price-sync';

// Example 1: Synced state with price breakdown
export function SyncedExample() {
  const priceBreakdown: PriceBreakdown = {
    pricePerPerson: 450,
    numberOfPeople: 6,
    totalPrice: 2700,
    tierUsed: 'Tier 2 (4-6 people)',
    periodUsed: 'Peak Season (Jun-Aug)',
    currency: 'GBP',
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">Synced Price</h3>
      <PriceSyncIndicator
        status="synced"
        priceBreakdown={priceBreakdown}
      />
    </div>
  );
}

// Example 2: Calculating state
export function CalculatingExample() {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">Calculating Price</h3>
      <PriceSyncIndicator status="calculating" />
    </div>
  );
}

// Example 3: Custom price with actions
export function CustomPriceExample() {
  const priceBreakdown: PriceBreakdown = {
    pricePerPerson: 450,
    numberOfPeople: 6,
    totalPrice: 2700,
    tierUsed: 'Tier 2 (4-6 people)',
    periodUsed: 'Peak Season (Jun-Aug)',
    currency: 'GBP',
  };

  const handleRecalculate = async () => {
    console.log('Recalculating price from package...');
    // Trigger price recalculation logic
  };

  const handleReset = () => {
    console.log('Resetting to calculated price...');
    // Reset to the calculated price
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">Custom Price (Manual Override)</h3>
      <PriceSyncIndicator
        status="custom"
        priceBreakdown={priceBreakdown}
        onRecalculate={handleRecalculate}
        onResetToCalculated={handleReset}
      />
    </div>
  );
}

// Example 4: Error state
export function ErrorExample() {
  const handleRecalculate = async () => {
    console.log('Retrying price calculation...');
    // Retry the calculation
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">Calculation Error</h3>
      <PriceSyncIndicator
        status="error"
        error="Unable to fetch package pricing. The package may have been deleted or is temporarily unavailable."
        onRecalculate={handleRecalculate}
      />
    </div>
  );
}

// Example 5: Out of sync state
export function OutOfSyncExample() {
  const handleRecalculate = async () => {
    console.log('Recalculating with new parameters...');
    // Recalculate with updated parameters
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">Parameters Changed</h3>
      <PriceSyncIndicator
        status="out-of-sync"
        onRecalculate={handleRecalculate}
      />
    </div>
  );
}

// Example 6: Integration with QuoteForm
export function QuoteFormIntegrationExample() {
  const [syncStatus, setSyncStatus] = React.useState<'synced' | 'calculating' | 'custom' | 'error' | 'out-of-sync'>('synced');
  const [priceBreakdown, setPriceBreakdown] = React.useState<PriceBreakdown>({
    pricePerPerson: 500,
    numberOfPeople: 4,
    totalPrice: 2000,
    tierUsed: 'Tier 2 (4-6 people)',
    periodUsed: 'Standard Season',
    currency: 'GBP',
  });

  const handleRecalculate = async () => {
    setSyncStatus('calculating');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update with new calculation
    setPriceBreakdown({
      ...priceBreakdown,
      pricePerPerson: 550,
      totalPrice: 2200,
    });
    setSyncStatus('synced');
  };

  const handleReset = () => {
    setSyncStatus('synced');
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Quote Form Integration</h3>
      
      {/* Price input field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Total Price
        </label>
        <input
          type="number"
          value={priceBreakdown.totalPrice}
          onChange={(e) => {
            setPriceBreakdown({
              ...priceBreakdown,
              totalPrice: parseFloat(e.target.value),
            });
            setSyncStatus('custom');
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Price sync indicator */}
      <PriceSyncIndicator
        status={syncStatus}
        priceBreakdown={priceBreakdown}
        onRecalculate={handleRecalculate}
        onResetToCalculated={handleReset}
      />

      {/* Other form fields would go here */}
    </div>
  );
}

// Example 7: All states demo
export function AllStatesDemo() {
  const priceBreakdown: PriceBreakdown = {
    pricePerPerson: 450,
    numberOfPeople: 6,
    totalPrice: 2700,
    tierUsed: 'Tier 2 (4-6 people)',
    periodUsed: 'Peak Season',
    currency: 'GBP',
  };

  return (
    <div className="p-8 space-y-6 bg-gray-50">
      <h2 className="text-2xl font-bold mb-4">PriceSyncIndicator - All States</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SyncedExample />
        <CalculatingExample />
        <CustomPriceExample />
        <ErrorExample />
        <OutOfSyncExample />
      </div>

      <div className="mt-8">
        <QuoteFormIntegrationExample />
      </div>
    </div>
  );
}

export default AllStatesDemo;
