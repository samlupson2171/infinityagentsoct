'use client';

import React, { useState, useEffect } from 'react';
import { ISuperOfferPackage } from '@/models/SuperOfferPackage';

interface PriceCalculationResult {
  price: number | 'ON_REQUEST';
  tier: {
    index: number;
    label: string;
    minPeople: number;
    maxPeople: number;
  };
  period: {
    period: string;
    periodType: 'month' | 'special';
    startDate?: Date;
    endDate?: Date;
  };
  nights: number;
  currency: string;
  packageName: string;
  packageId: string;
  packageVersion: number;
}

interface PackagePriceCalculatorProps {
  packageData?: ISuperOfferPackage;
  onPackageSelect?: (packageId: string) => void;
}

export default function PackagePriceCalculator({
  packageData: initialPackageData,
  onPackageSelect,
}: PackagePriceCalculatorProps) {
  const [packages, setPackages] = useState<ISuperOfferPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<ISuperOfferPackage | null>(
    initialPackageData || null
  );
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  // Form inputs
  const [numberOfPeople, setNumberOfPeople] = useState<number>(10);
  const [numberOfNights, setNumberOfNights] = useState<number>(3);
  const [arrivalDate, setArrivalDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Results
  const [calculationResult, setCalculationResult] = useState<PriceCalculationResult | null>(
    null
  );
  const [calculationError, setCalculationError] = useState<string | null>(null);

  // Load packages if not provided
  useEffect(() => {
    if (!initialPackageData) {
      loadPackages();
    }
  }, [initialPackageData]);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/super-packages?status=active&limit=100');
      if (response.ok) {
        const data = await response.json();
        setPackages(data.packages || []);
      }
    } catch (error) {
      console.error('Failed to load packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePackageChange = (packageId: string) => {
    const pkg = packages.find((p) => p._id.toString() === packageId);
    setSelectedPackage(pkg || null);
    setCalculationResult(null);
    setCalculationError(null);

    if (onPackageSelect && pkg) {
      onPackageSelect(pkg._id.toString());
    }
  };

  const calculatePrice = async () => {
    if (!selectedPackage) {
      setCalculationError('Please select a package');
      return;
    }

    setCalculating(true);
    setCalculationError(null);
    setCalculationResult(null);

    try {
      const response = await fetch('/api/admin/super-packages/calculate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage._id.toString(),
          numberOfPeople,
          numberOfNights,
          arrivalDate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCalculationResult(data);
      } else {
        setCalculationError(data.error || 'Failed to calculate price');
      }
    } catch (error) {
      setCalculationError('An error occurred while calculating price');
      console.error('Calculation error:', error);
    } finally {
      setCalculating(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = {
      EUR: '€',
      GBP: '£',
      USD: '$',
    };
    return `${symbols[currency] || currency}${amount.toFixed(2)}`;
  };

  const getTotalPrice = () => {
    if (!calculationResult || calculationResult.price === 'ON_REQUEST') {
      return null;
    }
    return calculationResult.price * numberOfPeople;
  };

  return (
    <div className="space-y-6">
      {/* Package Selection */}
      {!initialPackageData && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Select Package</h3>
          {loading ? (
            <p className="text-gray-500">Loading packages...</p>
          ) : (
            <select
              value={selectedPackage?._id.toString() || ''}
              onChange={(e) => handlePackageChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a package...</option>
              {packages.map((pkg) => (
                <option key={pkg._id.toString()} value={pkg._id.toString()}>
                  {pkg.name} - {pkg.destination} ({pkg.resort})
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Package Details */}
      {selectedPackage && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Package Details</h3>
          <div className="space-y-3">
            <div>
              <span className="font-medium">Name:</span> {selectedPackage.name}
            </div>
            <div>
              <span className="font-medium">Destination:</span> {selectedPackage.destination}
            </div>
            <div>
              <span className="font-medium">Resort:</span> {selectedPackage.resort}
            </div>
            <div>
              <span className="font-medium">Currency:</span> {selectedPackage.currency}
            </div>
            <div>
              <span className="font-medium">Available Group Sizes:</span>
              <ul className="list-disc list-inside ml-4 mt-1">
                {selectedPackage.groupSizeTiers.map((tier, idx) => (
                  <li key={idx}>{tier.label}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-medium">Available Durations:</span>{' '}
              {selectedPackage.durationOptions.join(', ')} nights
            </div>
          </div>
        </div>
      )}

      {/* Calculation Parameters */}
      {selectedPackage && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Calculate Price</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of People
              </label>
              <input
                type="number"
                min="1"
                value={numberOfPeople}
                onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Nights
              </label>
              <select
                value={numberOfNights}
                onChange={(e) => setNumberOfNights(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {selectedPackage.durationOptions.map((nights) => (
                  <option key={nights} value={nights}>
                    {nights} nights
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arrival Date
              </label>
              <input
                type="date"
                value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={calculatePrice}
            disabled={calculating}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {calculating ? 'Calculating...' : 'Calculate Price'}
          </button>
        </div>
      )}

      {/* Calculation Results */}
      {calculationResult && (
        <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 mb-4">Price Calculation</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Group Size Tier:</span>
              <span>{calculationResult.tier.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Pricing Period:</span>
              <span>{calculationResult.period.period}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Duration:</span>
              <span>{calculationResult.nights} nights</span>
            </div>
            <div className="border-t border-green-300 pt-3 mt-3">
              {calculationResult.price === 'ON_REQUEST' ? (
                <div className="text-center">
                  <p className="text-lg font-semibold text-orange-600">Price On Request</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Please contact us for pricing for this combination
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-lg">
                    <span className="font-medium">Price per Person:</span>
                    <span className="font-semibold">
                      {formatCurrency(calculationResult.price, calculationResult.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg mt-2">
                    <span className="font-medium">Number of People:</span>
                    <span className="font-semibold">×{numberOfPeople}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-green-700 mt-3 pt-3 border-t border-green-300">
                    <span>Total Price:</span>
                    <span>
                      {formatCurrency(getTotalPrice()!, calculationResult.currency)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Calculation Error */}
      {calculationError && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="text-red-800">{calculationError}</p>
        </div>
      )}

      {/* Pricing Matrix Display */}
      {selectedPackage && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Pricing Matrix</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  {selectedPackage.groupSizeTiers.map((tier, idx) => (
                    <th
                      key={idx}
                      colSpan={selectedPackage.durationOptions.length}
                      className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-300"
                    >
                      {tier.label}
                    </th>
                  ))}
                </tr>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    {/* Empty cell */}
                  </th>
                  {selectedPackage.groupSizeTiers.map((_, tierIdx) =>
                    selectedPackage.durationOptions.map((nights) => (
                      <th
                        key={`${tierIdx}-${nights}`}
                        className="px-2 py-2 text-center text-xs font-medium text-gray-500"
                      >
                        {nights}N
                      </th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedPackage.pricingMatrix.map((entry, entryIdx) => (
                  <tr key={entryIdx} className={entryIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {entry.period}
                    </td>
                    {selectedPackage.groupSizeTiers.map((_, tierIdx) =>
                      selectedPackage.durationOptions.map((nights) => {
                        const pricePoint = entry.prices.find(
                          (p) => p.groupSizeTierIndex === tierIdx && p.nights === nights
                        );
                        return (
                          <td
                            key={`${tierIdx}-${nights}`}
                            className="px-2 py-3 text-sm text-center text-gray-700"
                          >
                            {pricePoint
                              ? pricePoint.price === 'ON_REQUEST'
                                ? 'On Request'
                                : formatCurrency(
                                    pricePoint.price as number,
                                    selectedPackage.currency
                                  )
                              : '-'}
                          </td>
                        );
                      })
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inclusions */}
      {selectedPackage && selectedPackage.inclusions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Package Inclusions</h3>
          <ul className="space-y-2">
            {selectedPackage.inclusions.map((inclusion, idx) => (
              <li key={idx} className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700">{inclusion.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Accommodation Examples */}
      {selectedPackage && selectedPackage.accommodationExamples.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Accommodation Examples</h3>
          <ul className="list-disc list-inside space-y-1">
            {selectedPackage.accommodationExamples.map((example, idx) => (
              <li key={idx} className="text-gray-700">
                {example}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sales Notes */}
      {selectedPackage && selectedPackage.salesNotes && (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Sales Notes</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{selectedPackage.salesNotes}</p>
        </div>
      )}
    </div>
  );
}
