'use client';

import React, { useState, useEffect } from 'react';
import { ISuperOfferPackage } from '@/models/SuperOfferPackage';
import { PackageSelection, PackageSelectorProps } from '@/types/quote-price-sync';

interface PriceCalculation {
  price: number | 'ON_REQUEST';
  tierUsed: string;
  tierIndex: number;
  periodUsed: string;
  currency: string;
  breakdown?: {
    pricePerPerson: number;
    numberOfPeople: number;
    totalPrice: number;
  };
}

export default function PackageSelector({
  isOpen,
  onClose,
  onSelect,
  destinationFilter,
  initialPeople = 1,
  initialNights = 3,
  initialDate = '',
}: PackageSelectorProps) {
  const [packages, setPackages] = useState<ISuperOfferPackage[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<ISuperOfferPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<ISuperOfferPackage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [destinationFilterLocal, setDestinationFilterLocal] = useState(destinationFilter || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selection parameters
  const [numberOfPeople, setNumberOfPeople] = useState(initialPeople);
  const [numberOfNights, setNumberOfNights] = useState(initialNights);
  const [arrivalDate, setArrivalDate] = useState(initialDate);

  // Price calculation
  const [priceCalculation, setPriceCalculation] = useState<PriceCalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  // Fetch packages on mount
  useEffect(() => {
    if (isOpen) {
      fetchPackages();
    }
  }, [isOpen]);

  // Filter packages when search or destination filter changes
  useEffect(() => {
    let filtered = packages;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (pkg) =>
          pkg.name.toLowerCase().includes(term) ||
          pkg.destination.toLowerCase().includes(term) ||
          pkg.resort.toLowerCase().includes(term)
      );
    }

    if (destinationFilterLocal) {
      filtered = filtered.filter(
        (pkg) => pkg.destination.toLowerCase() === destinationFilterLocal.toLowerCase()
      );
    }

    setFilteredPackages(filtered);
  }, [packages, searchTerm, destinationFilterLocal]);

  // Calculate price when parameters change
  useEffect(() => {
    if (selectedPackage && numberOfPeople && numberOfNights && arrivalDate) {
      calculatePrice();
    } else {
      setPriceCalculation(null);
    }
  }, [selectedPackage, numberOfPeople, numberOfNights, arrivalDate]);

  const fetchPackages = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/super-packages?status=active');
      if (!response.ok) {
        throw new Error('Failed to fetch packages');
      }

      const data = await response.json();
      // API returns { success: true, data: { packages: [...] } }
      setPackages(data.data?.packages || data.packages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load packages');
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePrice = async () => {
    if (!selectedPackage) return;

    setIsCalculating(true);
    setCalculationError(null);

    try {
      const response = await fetch('/api/admin/super-packages/calculate-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: String(selectedPackage._id),
          numberOfPeople,
          numberOfNights,
          arrivalDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to calculate price');
      }

      const data = await response.json();
      // API returns { success: true, data: { calculation: {...} } }
      const apiResult = data.data?.calculation || data.calculation || data;
      
      // Map API response to PriceCalculation format
      const calculation: PriceCalculation = {
        price: apiResult.price,
        tierUsed: apiResult.tier.label,
        tierIndex: apiResult.tier.index,
        periodUsed: apiResult.period.period,
        currency: apiResult.currency,
        breakdown: apiResult.price !== 'ON_REQUEST' ? {
          pricePerPerson: apiResult.price / numberOfPeople,
          numberOfPeople: numberOfPeople,
          totalPrice: apiResult.price,
        } : undefined,
      };
      
      setPriceCalculation(calculation);
    } catch (err) {
      setCalculationError(err instanceof Error ? err.message : 'Failed to calculate price');
      setPriceCalculation(null);
    } finally {
      setIsCalculating(false);
    }
  };

  const handlePackageSelect = (pkg: ISuperOfferPackage) => {
    setSelectedPackage(pkg);
    setPriceCalculation(null);
    setCalculationError(null);
  };

  const handleApply = () => {
    if (!selectedPackage || !priceCalculation) {
      // Don't allow selection until price calculation completes
      return;
    }

    // Build the complete PackageSelection object
    const selection: PackageSelection = {
      // Package identification
      packageId: String(selectedPackage._id),
      packageName: selectedPackage.name,
      packageVersion: selectedPackage.version,

      // Parameters
      numberOfPeople,
      numberOfNights,
      arrivalDate,

      // Pricing details (from calculation)
      priceCalculation: {
        price: priceCalculation.price,
        tierUsed: priceCalculation.tierUsed,
        tierIndex: priceCalculation.tierIndex,
        periodUsed: priceCalculation.periodUsed,
        currency: priceCalculation.currency,
        breakdown: priceCalculation.breakdown,
      },

      // Package content
      inclusions: selectedPackage.inclusions.map((inc) => ({
        text: inc.text,
        category: inc.category,
      })),
      accommodationExamples: selectedPackage.accommodationExamples || [],
    };

    onSelect(selection);
    onClose();
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = { GBP: '£', EUR: '€', USD: '$' };
    return `${symbols[currency] || currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block w-full max-w-6xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Select Super Package
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Package List */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Search & Filter
                  </h4>
                  
                  {/* Search */}
                  <input
                    type="text"
                    placeholder="Search packages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  />

                  {/* Destination Filter */}
                  <select
                    value={destinationFilterLocal}
                    onChange={(e) => setDestinationFilterLocal(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Destinations</option>
                    {Array.from(new Set(packages.map((pkg) => pkg.destination))).map(
                      (dest) => (
                        <option key={dest} value={dest}>
                          {dest}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Package List */}
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    {isLoading ? (
                      <div className="p-4 text-center text-gray-500">
                        Loading packages...
                      </div>
                    ) : error ? (
                      <div className="p-4 text-center text-red-600">{error}</div>
                    ) : filteredPackages.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No packages found
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {filteredPackages.map((pkg) => (
                          <button
                            key={String(pkg._id)}
                            onClick={() => handlePackageSelect(pkg)}
                            className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                              String(selectedPackage?._id) === String(pkg._id)
                                ? 'bg-blue-50 border-l-4 border-blue-500'
                                : ''
                            }`}
                          >
                            <div className="font-medium text-gray-900">
                              {pkg.name}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {pkg.destination} - {pkg.resort}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {pkg.groupSizeTiers.length} tiers • {pkg.durationOptions.length} durations
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Package Preview & Parameters */}
              <div className="space-y-4">
                {selectedPackage ? (
                  <>
                    {/* Package Preview */}
                    <div className="border border-gray-200 rounded-md p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Package Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Name:</span>{' '}
                          {selectedPackage.name}
                        </div>
                        <div>
                          <span className="font-medium">Destination:</span>{' '}
                          {selectedPackage.destination}
                        </div>
                        <div>
                          <span className="font-medium">Resort:</span>{' '}
                          {selectedPackage.resort}
                        </div>
                        <div>
                          <span className="font-medium">Currency:</span>{' '}
                          {selectedPackage.currency}
                        </div>
                        
                        {selectedPackage.inclusions.length > 0 && (
                          <div className="mt-3">
                            <span className="font-medium">Inclusions:</span>
                            <ul className="list-disc list-inside mt-1 text-gray-600">
                              {selectedPackage.inclusions.slice(0, 5).map((inc, idx) => (
                                <li key={idx}>{inc.text}</li>
                              ))}
                              {selectedPackage.inclusions.length > 5 && (
                                <li className="text-gray-500">
                                  +{selectedPackage.inclusions.length - 5} more...
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Selection Parameters Form */}
                    <div className="border border-gray-200 rounded-md p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Selection Parameters
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Number of People *
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={numberOfPeople}
                            onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Number of Nights *
                          </label>
                          <select
                            value={numberOfNights}
                            onChange={(e) => setNumberOfNights(parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {selectedPackage.durationOptions.map((nights) => (
                              <option key={nights} value={nights}>
                                {nights} {nights === 1 ? 'night' : 'nights'}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Arrival Date *
                          </label>
                          <input
                            type="date"
                            min={getTomorrowDate()}
                            value={arrivalDate}
                            onChange={(e) => setArrivalDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Price Calculation Preview */}
                    <div className="border border-gray-200 rounded-md p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Price Calculation
                      </h4>
                      
                      {isCalculating ? (
                        <div className="text-center py-4">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <p className="text-sm text-gray-600 mt-2">Calculating...</p>
                        </div>
                      ) : calculationError ? (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                          <p className="text-sm text-red-600">{calculationError}</p>
                        </div>
                      ) : priceCalculation ? (
                        <div className="space-y-2">
                          {priceCalculation.price === 'ON_REQUEST' ? (
                            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                              <p className="text-sm font-medium text-amber-800">
                                Price on Request
                              </p>
                              <p className="text-xs text-amber-600 mt-1">
                                This combination requires manual pricing
                              </p>
                            </div>
                          ) : (
                            <>
                              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                                <p className="text-lg font-bold text-green-800">
                                  {formatCurrency(priceCalculation.price, selectedPackage.currency)}
                                </p>
                                <p className="text-xs text-green-600 mt-1">Total Price</p>
                              </div>
                              
                              {priceCalculation.breakdown && (
                                <div className="text-sm text-gray-600 space-y-1">
                                  <div className="flex justify-between">
                                    <span>Price per person:</span>
                                    <span className="font-medium">
                                      {formatCurrency(priceCalculation.breakdown.pricePerPerson, selectedPackage.currency)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Number of people:</span>
                                    <span className="font-medium">{priceCalculation.breakdown.numberOfPeople}</span>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                          
                          <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                            <div>Tier: {priceCalculation.tierUsed}</div>
                            <div>Period: {priceCalculation.periodUsed}</div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Enter all parameters to calculate price
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="border border-gray-200 rounded-md p-8 text-center text-gray-500">
                    Select a package to view details
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={
                !selectedPackage ||
                !numberOfPeople ||
                !numberOfNights ||
                !arrivalDate ||
                !priceCalculation ||
                isCalculating
              }
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isCalculating ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Calculating...</span>
                </>
              ) : (
                <span>Apply Package</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
