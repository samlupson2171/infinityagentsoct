'use client';

import React from 'react';

interface SelectedEvent {
  eventId: string;
  eventName: string;
  eventPrice: number;
  eventCurrency: string;
  pricePerPerson?: boolean; // Whether price is per person or flat rate
  addedAt?: Date;
}

interface SelectedEventsListProps {
  events: SelectedEvent[];
  onRemove: (eventId: string) => void;
  onTogglePricePerPerson?: (eventId: string) => void;
  numberOfPeople?: number;
  currency: string;
  className?: string;
}

export default function SelectedEventsList({
  events,
  onRemove,
  onTogglePricePerPerson,
  numberOfPeople = 1,
  currency,
  className = '',
}: SelectedEventsListProps) {
  // Calculate total events cost
  const totalEventsCost = events.reduce((sum, event) => {
    // Only add if currency matches
    if (event.eventCurrency === currency) {
      const eventCost = event.pricePerPerson 
        ? event.eventPrice * numberOfPeople 
        : event.eventPrice;
      return sum + eventCost;
    }
    return sum;
  }, 0);

  // Currency formatting helper
  const formatCurrency = (amount: number, curr: string) => {
    const symbols: Record<string, string> = { GBP: '£', EUR: '€', USD: '$' };
    return `${symbols[curr] || curr} ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Empty state
  if (events.length === 0) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 text-center ${className}`}>
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
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
        <p className="mt-2 text-sm text-gray-600">No events selected</p>
        <p className="text-xs text-gray-500 mt-1">
          Select events from the event selector to add them to this quote
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">
          Selected Events ({events.length})
        </h4>
        <span className="text-xs text-gray-500">
          Click × to remove an event
        </span>
      </div>

      {/* Events List */}
      <div className="space-y-2">
        {events.map((event) => {
          const currencyMismatch = event.eventCurrency !== currency;
          const eventTotalCost = event.pricePerPerson 
            ? event.eventPrice * numberOfPeople 
            : event.eventPrice;

          return (
            <div
              key={event.eventId}
              className={`p-3 rounded-lg border transition-colors ${
                currencyMismatch
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 mr-3">
                  <div className="flex items-center">
                    <svg
                      className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {event.eventName}
                    </span>
                  </div>
                  {currencyMismatch && (
                    <p className="text-xs text-amber-600 mt-1 ml-6">
                      ⚠ Currency mismatch: Event uses {event.eventCurrency}, quote uses {currency}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-3 flex-shrink-0">
                  <div className="text-right">
                    <span className={`text-sm font-semibold block ${
                      currencyMismatch ? 'text-amber-700' : 'text-gray-900'
                    }`}>
                      {formatCurrency(eventTotalCost, event.eventCurrency)}
                    </span>
                    {event.pricePerPerson && (
                      <span className="text-xs text-gray-500">
                        {formatCurrency(event.eventPrice, event.eventCurrency)} × {numberOfPeople}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(event.eventId)}
                    className="text-gray-400 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded"
                    aria-label={`Remove ${event.eventName}`}
                    title="Remove event"
                  >
                    <svg
                      className="h-5 w-5"
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

              {/* Per Person Toggle */}
              {onTogglePricePerPerson && (
                <div className="mt-2 ml-6 flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={event.pricePerPerson || false}
                      onChange={() => onTogglePricePerPerson(event.eventId)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-xs text-gray-600">
                      Price is per person
                    </span>
                  </label>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Total Events Cost */}
      <div className="border-t border-gray-200 pt-3 mt-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Events Total:
          </span>
          <span className="text-lg font-bold text-blue-600">
            {formatCurrency(totalEventsCost, currency)}
          </span>
        </div>
        {events.some((e) => e.eventCurrency !== currency) && (
          <p className="text-xs text-amber-600 mt-2">
            ⚠ Some events use different currencies. Only events matching the quote currency ({currency}) are included in the total.
          </p>
        )}
      </div>
    </div>
  );
}
