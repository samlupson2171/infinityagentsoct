'use client';

import React, { useState } from 'react';

interface SelectedEvent {
  eventId: string;
  eventName: string;
  eventPrice: number;
  eventCurrency: string;
  pricePerPerson?: boolean;
}

interface PriceBreakdownDetails {
  pricePerPerson?: number;
  numberOfPeople?: number;
  tierUsed?: string;
  periodUsed?: string;
}

interface PriceBreakdownProps {
  basePrice: number;
  eventsTotal: number;
  totalPrice: number;
  currency: string;
  selectedEvents?: SelectedEvent[];
  numberOfPeople?: number;
  numberOfRooms?: number;
  numberOfNights?: number;
  linkedPackageInfo?: {
    packageName: string;
    tierLabel?: string;
    periodUsed?: string;
  } | null;
  priceBreakdown?: PriceBreakdownDetails | null;
  syncStatus?: 'synced' | 'calculating' | 'custom' | 'error' | 'out-of-sync';
  className?: string;
  defaultExpanded?: boolean;
}

/**
 * PriceBreakdown Component
 * 
 * Displays an itemized breakdown of quote pricing including:
 * - Base price (from package or custom)
 * - Individual event prices
 * - Events subtotal
 * - Final total price
 * - Per-unit calculations (per person, per room, per night)
 * 
 * Features:
 * - Expand/collapse functionality for detailed view
 * - Currency mismatch warnings
 * - Package details display
 * - Sync status indicators
 * - Responsive design with Tailwind CSS
 */

export default function PriceBreakdown({
  basePrice,
  eventsTotal,
  totalPrice,
  currency,
  selectedEvents = [],
  numberOfPeople,
  numberOfRooms,
  numberOfNights,
  linkedPackageInfo,
  priceBreakdown,
  syncStatus,
  className = '',
  defaultExpanded = true,
}: PriceBreakdownProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Currency formatting helper
  const formatCurrency = (amount: number, curr: string) => {
    const symbols: Record<string, string> = { GBP: '£', EUR: '€', USD: '$' };
    return `${symbols[curr] || curr} ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Don't render if there's no price data
  if (basePrice === 0 && eventsTotal === 0 && totalPrice === 0) {
    return null;
  }

  return (
    <div className={`p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm ${className}`}>
      {/* Header with expand/collapse button */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-blue-600 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <h4 className="text-sm font-semibold text-gray-900">Price Breakdown</h4>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1 transition-all"
          aria-label={isExpanded ? 'Collapse breakdown' : 'Expand breakdown'}
          aria-expanded={isExpanded}
        >
          <span className="text-xs font-medium mr-1">
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </span>
          <svg
            className={`w-4 h-4 transform transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-3 text-sm">
          {/* Base Price (Package or Custom) */}
          {basePrice > 0 && (
            <div className="bg-white bg-opacity-60 p-3 rounded-md">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 text-blue-500 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  <span className="text-gray-700 font-medium">
                    {linkedPackageInfo ? (
                      <>
                        Package Price
                        {linkedPackageInfo.packageName && (
                          <span className="text-xs text-gray-500 ml-1 block">
                            {linkedPackageInfo.packageName}
                          </span>
                        )}
                      </>
                    ) : (
                      'Base Price'
                    )}
                  </span>
                </div>
                <span className="font-semibold text-gray-900 text-base">
                  {formatCurrency(basePrice, currency)}
                </span>
              </div>
              {priceBreakdown && priceBreakdown.pricePerPerson && priceBreakdown.numberOfPeople && (
                <div className="mt-2 text-xs text-gray-600 flex items-center">
                  <svg
                    className="w-3 h-3 mr-1 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  {formatCurrency(priceBreakdown.pricePerPerson, currency)} per person × {priceBreakdown.numberOfPeople} {priceBreakdown.numberOfPeople === 1 ? 'person' : 'people'}
                </div>
              )}
            </div>
          )}

          {/* Events Total */}
          {eventsTotal > 0 && selectedEvents.length > 0 && (
            <div className="bg-white bg-opacity-60 p-3 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 text-green-500 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-gray-700 font-medium">
                    Events & Activities
                    <span className="text-xs text-gray-500 ml-1">
                      ({selectedEvents.length} {selectedEvents.length === 1 ? 'event' : 'events'})
                    </span>
                  </span>
                </div>
                <span className="font-semibold text-gray-900 text-base">
                  {formatCurrency(eventsTotal, currency)}
                </span>
              </div>

              {/* Show individual events */}
              <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
                {selectedEvents.map((event, index) => {
                  const eventTotalCost = event.pricePerPerson && numberOfPeople
                    ? event.eventPrice * numberOfPeople
                    : event.eventPrice;
                  
                  return (
                    <div
                      key={event.eventId}
                      className={`${
                        index !== selectedEvents.length - 1 ? 'pb-1.5 border-b border-gray-200' : ''
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="flex items-center flex-1 min-w-0 mr-2">
                          <svg
                            className="w-3 h-3 mr-1.5 text-green-500 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="truncate">{event.eventName}</span>
                        </span>
                        <span
                          className={`font-medium flex-shrink-0 ${
                            event.eventCurrency !== currency ? 'text-amber-600' : 'text-gray-700'
                          }`}
                        >
                          {formatCurrency(eventTotalCost, event.eventCurrency)}
                          {event.eventCurrency !== currency && (
                            <span className="ml-1 text-xs" title="Currency mismatch - not included in total">
                              ⚠️
                            </span>
                          )}
                        </span>
                      </div>
                      {event.pricePerPerson && numberOfPeople && numberOfPeople > 1 && (
                        <div className="mt-1 ml-5 text-xs text-gray-500 flex items-center">
                          <svg
                            className="w-3 h-3 mr-1 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          {formatCurrency(event.eventPrice, event.eventCurrency)} × {numberOfPeople} {numberOfPeople === 1 ? 'person' : 'people'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* No events message */}
          {selectedEvents.length === 0 && (
            <div className="bg-white bg-opacity-60 p-3 rounded-md">
              <div className="flex items-center text-gray-500 text-xs">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                No events selected
              </div>
            </div>
          )}

          {/* Currency mismatch warning */}
          {selectedEvents.some((e) => e.eventCurrency !== currency) && (
            <div className="flex items-start text-xs text-amber-700 bg-amber-50 p-2 rounded">
              <svg
                className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>
                Some events have different currency and are excluded from total
              </span>
            </div>
          )}

          {/* Divider */}
          {(basePrice > 0 || eventsTotal > 0) && (
            <div className="border-t-2 border-blue-300 my-3"></div>
          )}

          {/* Total Price */}
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-4 rounded-lg border-2 border-blue-300 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-blue-700 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-bold text-gray-900 text-base">Total Price:</span>
              </div>
              <span className="font-bold text-2xl text-blue-900">
                {formatCurrency(totalPrice, currency)}
              </span>
            </div>
            {basePrice > 0 && eventsTotal > 0 && (
              <div className="mt-2 text-xs text-gray-600 flex items-center justify-end">
                <span>
                  {formatCurrency(basePrice, currency)} + {formatCurrency(eventsTotal, currency)}
                </span>
              </div>
            )}
          </div>

          {/* Per-unit calculations */}
          {totalPrice > 0 && (numberOfPeople || numberOfRooms || numberOfNights) && (
            <div className="bg-white bg-opacity-60 p-3 rounded-md space-y-2">
              <div className="flex items-center text-xs font-medium text-gray-700 mb-2">
                <svg
                  className="w-4 h-4 mr-1.5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                Per-Unit Breakdown
              </div>
              <div className="space-y-1.5 text-xs">
                {numberOfPeople && numberOfPeople > 0 && (
                  <div className="flex justify-between items-center text-gray-600 bg-gray-50 p-2 rounded">
                    <span className="flex items-center">
                      <svg
                        className="w-3 h-3 mr-1.5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Price per Person:
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(totalPrice / numberOfPeople, currency)}
                    </span>
                  </div>
                )}
                {numberOfRooms && numberOfRooms > 0 && (
                  <div className="flex justify-between items-center text-gray-600 bg-gray-50 p-2 rounded">
                    <span className="flex items-center">
                      <svg
                        className="w-3 h-3 mr-1.5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                      Price per Room:
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(totalPrice / numberOfRooms, currency)}
                    </span>
                  </div>
                )}
                {numberOfNights && numberOfNights > 0 && (
                  <div className="flex justify-between items-center text-gray-600 bg-gray-50 p-2 rounded">
                    <span className="flex items-center">
                      <svg
                        className="w-3 h-3 mr-1.5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                        />
                      </svg>
                      Price per Night:
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(totalPrice / numberOfNights, currency)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Package Details */}
          {linkedPackageInfo && priceBreakdown && (priceBreakdown.tierUsed || priceBreakdown.periodUsed) && (
            <div className="bg-white bg-opacity-60 p-3 rounded-md">
              <div className="flex items-center text-xs font-medium text-gray-700 mb-2">
                <svg
                  className="w-4 h-4 mr-1.5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Package Details
              </div>
              <div className="space-y-1.5 text-xs">
                {priceBreakdown.tierUsed && (
                  <div className="flex justify-between items-center text-gray-600 bg-gray-50 p-2 rounded">
                    <span>Pricing Tier:</span>
                    <span className="font-semibold text-gray-900">{priceBreakdown.tierUsed}</span>
                  </div>
                )}
                {priceBreakdown.periodUsed && (
                  <div className="flex justify-between items-center text-gray-600 bg-gray-50 p-2 rounded">
                    <span>Travel Period:</span>
                    <span className="font-semibold text-gray-900">{priceBreakdown.periodUsed}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status Indicators */}
          {(syncStatus === 'custom' || syncStatus === 'calculating' || syncStatus === 'error') && (
            <div className="bg-white bg-opacity-60 p-3 rounded-md">
              {/* Custom Price Indicator */}
              {syncStatus === 'custom' && linkedPackageInfo && (
                <div className="flex items-start text-xs text-amber-700 bg-amber-50 p-2 rounded">
                  <svg
                    className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div>
                    <div className="font-medium">Custom Price</div>
                    <div className="text-xs mt-0.5">
                      Price has been manually adjusted and differs from the calculated package price
                    </div>
                  </div>
                </div>
              )}

              {/* Calculating Indicator */}
              {syncStatus === 'calculating' && (
                <div className="flex items-center text-xs text-blue-700 bg-blue-50 p-2 rounded">
                  <svg
                    className="animate-spin w-4 h-4 mr-2 flex-shrink-0"
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
                  <span className="font-medium">Calculating price...</span>
                </div>
              )}

              {/* Error Indicator */}
              {syncStatus === 'error' && (
                <div className="flex items-start text-xs text-red-700 bg-red-50 p-2 rounded">
                  <svg
                    className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <div className="font-medium">Price Calculation Error</div>
                    <div className="text-xs mt-0.5">
                      Unable to calculate price automatically. Please enter manually.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
