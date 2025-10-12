'use client';

import React, { useState } from 'react';

interface PriceComparison {
  oldPrice: number;
  newPrice: number;
  priceDifference: number;
  percentageChange: number;
  currency: string;
}

interface PriceCalculation {
  price: number;
  tierUsed: string;
  tierIndex: number;
  periodUsed: string;
  breakdown?: {
    pricePerPerson: number;
    numberOfPeople: number;
    totalPrice: number;
  };
}

interface PackageInfo {
  packageId: string;
  packageName: string;
  currentVersion: number;
  linkedVersion: number;
  versionChanged: boolean;
}

interface Parameters {
  numberOfPeople: number;
  numberOfNights: number;
  arrivalDate: string;
}

interface PriceRecalculationModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteId: string;
  onSuccess: () => void;
}

export default function PriceRecalculationModal({
  isOpen,
  onClose,
  quoteId,
  onSuccess,
}: PriceRecalculationModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<PriceComparison | null>(null);
  const [priceCalculation, setPriceCalculation] =
    useState<PriceCalculation | null>(null);
  const [packageInfo, setPackageInfo] = useState<PackageInfo | null>(null);
  const [parameters, setParameters] = useState<Parameters | null>(null);
  const [applying, setApplying] = useState(false);

  // Fetch price comparison when modal opens
  React.useEffect(() => {
    if (isOpen && !comparison) {
      fetchPriceComparison();
    }
  }, [isOpen]);

  const fetchPriceComparison = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/quotes/${quoteId}/recalculate-price`,
        {
          method: 'POST',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to recalculate price');
      }

      setComparison(data.data.comparison);
      setPriceCalculation(data.data.priceCalculation);
      setPackageInfo(data.data.packageInfo);
      setParameters(data.data.parameters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPrice = async () => {
    if (!comparison || !priceCalculation) return;

    setApplying(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/quotes/${quoteId}/recalculate-price`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            newPrice: comparison.newPrice,
            priceCalculation,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to apply new price');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setApplying(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = { GBP: '£', EUR: '€', USD: '$' };
    return `${symbols[currency] || currency} ${amount.toLocaleString('en-GB', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
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
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Recalculate Quote Price
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Compare current price with latest package pricing
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-6 w-6"
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

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">
                  Calculating new price...
                </span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Comparison Display */}
            {comparison && priceCalculation && packageInfo && parameters && (
              <div className="space-y-6">
                {/* Package Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Package Information
                  </h4>
                  <div className="space-y-1 text-sm text-blue-800">
                    <div>
                      <span className="font-medium">Package:</span>{' '}
                      {packageInfo.packageName}
                    </div>
                    <div>
                      <span className="font-medium">Version:</span> v
                      {packageInfo.currentVersion}
                      {packageInfo.versionChanged && (
                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                          Updated from v{packageInfo.linkedVersion}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Parameters */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Quote Parameters
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">People:</span>
                      <div className="font-medium text-gray-900">
                        {parameters.numberOfPeople}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Nights:</span>
                      <div className="font-medium text-gray-900">
                        {parameters.numberOfNights}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Arrival:</span>
                      <div className="font-medium text-gray-900">
                        {formatDate(parameters.arrivalDate)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Comparison */}
                <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">
                    Price Comparison
                  </h4>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Old Price */}
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">
                        Current Price
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(comparison.oldPrice, comparison.currency)}
                      </div>
                    </div>

                    {/* New Price */}
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">
                        New Price
                      </div>
                      <div
                        className={`text-2xl font-bold ${
                          comparison.priceDifference > 0
                            ? 'text-red-600'
                            : comparison.priceDifference < 0
                            ? 'text-green-600'
                            : 'text-gray-900'
                        }`}
                      >
                        {formatCurrency(comparison.newPrice, comparison.currency)}
                      </div>
                    </div>
                  </div>

                  {/* Difference */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-center">
                      {comparison.priceDifference !== 0 ? (
                        <>
                          <svg
                            className={`w-5 h-5 mr-2 ${
                              comparison.priceDifference > 0
                                ? 'text-red-600'
                                : 'text-green-600'
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            {comparison.priceDifference > 0 ? (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                              />
                            ) : (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                              />
                            )}
                          </svg>
                          <span
                            className={`text-lg font-medium ${
                              comparison.priceDifference > 0
                                ? 'text-red-600'
                                : 'text-green-600'
                            }`}
                          >
                            {comparison.priceDifference > 0 ? '+' : ''}
                            {formatCurrency(
                              comparison.priceDifference,
                              comparison.currency
                            )}{' '}
                            ({comparison.percentageChange > 0 ? '+' : ''}
                            {comparison.percentageChange.toFixed(2)}%)
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-medium text-gray-600">
                          No change
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pricing Details */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Pricing Details
                  </h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    <div>
                      <span className="font-medium">Tier:</span>{' '}
                      {priceCalculation.tierUsed}
                    </div>
                    <div>
                      <span className="font-medium">Period:</span>{' '}
                      {priceCalculation.periodUsed}
                    </div>
                    {priceCalculation.breakdown && (
                      <div className="mt-2 pt-2 border-t border-gray-300">
                        <div>
                          <span className="font-medium">Price per person:</span>{' '}
                          {formatCurrency(
                            priceCalculation.breakdown.pricePerPerson,
                            comparison.currency
                          )}
                        </div>
                        <div>
                          <span className="font-medium">Number of people:</span>{' '}
                          {priceCalculation.breakdown.numberOfPeople}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {comparison && (
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={handleApplyPrice}
                disabled={applying || comparison.priceDifference === 0}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm ${
                  applying || comparison.priceDifference === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {applying ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Applying...
                  </>
                ) : (
                  'Apply New Price'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={applying}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
