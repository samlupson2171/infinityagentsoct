'use client';

import React, { useState } from 'react';
import { PriceSyncIndicatorProps } from '@/types/quote-price-sync';

/**
 * PriceSyncIndicator Component
 * 
 * Displays visual feedback about price synchronization status between a quote and its linked package.
 * Shows different states (synced, calculating, custom, error, out-of-sync) with appropriate icons,
 * colors, and tooltips. Provides action buttons for recalculation and reset operations.
 * Includes event pricing information in the breakdown display.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5
 */
export default function PriceSyncIndicator({
  status,
  priceBreakdown,
  error,
  onRecalculate,
  onResetToCalculated,
  eventsTotal,
  selectedEvents,
}: PriceSyncIndicatorProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Configuration for each status state
  const statusConfig = {
    synced: {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      label: 'Price synced with package',
      description: 'The quote price matches the calculated package price.',
    },
    calculating: {
      icon: (
        <svg
          className="w-5 h-5 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
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
      ),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      label: 'Calculating price...',
      description: 'Price calculation is in progress.',
    },
    custom: {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      ),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      label: 'Custom price (not synced)',
      description: 'The price has been manually overridden and will not auto-update.',
    },
    error: {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      label: 'Price calculation error',
      description: error || 'An error occurred while calculating the price.',
    },
    'out-of-sync': {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      label: 'Parameters changed',
      description: 'Quote parameters have changed. Recalculate to sync the price.',
    },
  };

  const config = statusConfig[status];

  // Format currency for display
  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="relative">
      {/* Main indicator */}
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${config.bgColor} ${config.borderColor} transition-all duration-200`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        role="status"
        aria-live="polite"
        aria-label={config.label}
      >
        {/* Icon */}
        <div className={config.color}>{config.icon}</div>

        {/* Label */}
        <span className={`text-sm font-medium ${config.color}`}>
          {config.label}
        </span>

        {/* Action buttons */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Recalculate button - show for custom, error, and out-of-sync states */}
          {(status === 'custom' || status === 'error' || status === 'out-of-sync') &&
            onRecalculate && (
              <button
                onClick={onRecalculate}
                className={`p-1 rounded hover:bg-white transition-colors ${config.color}`}
                title="Recalculate price"
                aria-label="Recalculate price from package"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            )}

          {/* Reset to calculated button - show only for custom state */}
          {status === 'custom' && onResetToCalculated && (
            <button
              onClick={onResetToCalculated}
              className={`p-1 rounded hover:bg-white transition-colors ${config.color}`}
              title="Reset to calculated price"
              aria-label="Reset to calculated price"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Tooltip with price breakdown */}
      {showTooltip && (
        <div
          className="absolute z-50 w-80 p-4 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 left-0"
          role="tooltip"
        >
          {/* Tooltip header */}
          <div className="flex items-start gap-2 mb-3">
            <div className={config.color}>{config.icon}</div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm">
                {config.label}
              </h4>
              <p className="text-xs text-gray-600 mt-1">{config.description}</p>
            </div>
          </div>

          {/* Price breakdown details */}
          {priceBreakdown && status !== 'error' && (
            <div className="border-t border-gray-200 pt-3 space-y-2">
              <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Price Breakdown
              </h5>

              <div className="space-y-1.5 text-sm">
                {/* Package Details */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Tier:</span>
                  <span className="font-medium text-gray-900">
                    {priceBreakdown.tierUsed}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Period:</span>
                  <span className="font-medium text-gray-900">
                    {priceBreakdown.periodUsed}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Price per person:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(
                      priceBreakdown.pricePerPerson,
                      priceBreakdown.currency
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Number of people:</span>
                  <span className="font-medium text-gray-900">
                    {priceBreakdown.numberOfPeople}
                  </span>
                </div>

                {/* Package Subtotal */}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-medium text-gray-900">Package Price:</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(
                      priceBreakdown.totalPrice,
                      priceBreakdown.currency
                    )}
                  </span>
                </div>

                {/* Events Section */}
                {selectedEvents && selectedEvents.length > 0 && (
                  <>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-gray-900">
                          Events & Activities ({selectedEvents.length}):
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(eventsTotal || 0, priceBreakdown.currency)}
                        </span>
                      </div>
                      
                      {/* Individual Events */}
                      <div className="ml-3 space-y-1 mt-2">
                        {selectedEvents.map((event) => (
                          <div key={event.eventId} className="flex justify-between text-xs">
                            <span className="text-gray-600 flex items-center">
                              <svg className="w-3 h-3 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              {event.eventName}
                            </span>
                            <span className={`font-medium ${event.eventCurrency !== priceBreakdown.currency ? 'text-amber-600' : 'text-gray-700'}`}>
                              {formatCurrency(event.eventPrice, event.eventCurrency)}
                              {event.eventCurrency !== priceBreakdown.currency && (
                                <span className="ml-1" title="Currency mismatch">⚠️</span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Final Total */}
                <div className="flex justify-between pt-2 border-t-2 border-gray-300">
                  <span className="font-bold text-gray-900">Total Price:</span>
                  <span className="font-bold text-lg text-gray-900">
                    {formatCurrency(
                      priceBreakdown.totalPrice + (eventsTotal || 0),
                      priceBreakdown.currency
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error details */}
          {status === 'error' && error && (
            <div className="border-t border-gray-200 pt-3">
              <h5 className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">
                Error Details
              </h5>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Action hints */}
          {(status === 'custom' || status === 'out-of-sync') && (
            <div className="border-t border-gray-200 pt-3 mt-3">
              <p className="text-xs text-gray-500">
                {status === 'custom'
                  ? 'Click the refresh icon to recalculate from package, or the reset icon to restore the calculated price.'
                  : 'Click the refresh icon to recalculate the price based on current parameters.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
