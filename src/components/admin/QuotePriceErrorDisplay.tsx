'use client';

import React from 'react';
import type { ErrorHandlingResult, ErrorRecoveryAction } from '@/lib/errors/quote-price-error-handler';

interface QuotePriceErrorDisplayProps {
  errorResult: ErrorHandlingResult;
  onActionClick?: (action: ErrorRecoveryAction) => void;
}

/**
 * QuotePriceErrorDisplay Component
 * 
 * Displays error messages with recovery actions for quote price operations.
 * Provides a user-friendly interface for handling various error scenarios.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
export default function QuotePriceErrorDisplay({
  errorResult,
  onActionClick,
}: QuotePriceErrorDisplayProps) {
  const { message, title, severity, actions } = errorResult;

  // Severity-based styling
  const severityConfig = {
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-600',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  };

  const config = severityConfig[severity];

  // Action button styling based on type
  const getActionButtonClass = (actionType: string) => {
    switch (actionType) {
      case 'retry':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'manual_price':
        return 'bg-orange-600 hover:bg-orange-700 text-white';
      case 'unlink_package':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'adjust_parameters':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'select_different_package':
        return 'bg-purple-600 hover:bg-purple-700 text-white';
      case 'dismiss':
        return 'bg-gray-200 hover:bg-gray-300 text-gray-800';
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  const handleActionClick = (action: ErrorRecoveryAction) => {
    action.handler();
    onActionClick?.(action);
  };

  return (
    <div
      className={`rounded-lg border ${config.bgColor} ${config.borderColor} p-4`}
      role="alert"
      aria-live="assertive"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${config.iconColor}`}>
          {config.icon}
        </div>
        <div className="flex-1">
          <h3 className={`text-sm font-semibold ${config.textColor}`}>
            {title}
          </h3>
          <p className={`mt-1 text-sm ${config.textColor}`}>
            {message}
          </p>

          {/* Context information if available */}
          {errorResult.context && Object.keys(errorResult.context).length > 0 && (
            <details className="mt-2">
              <summary className={`text-xs cursor-pointer ${config.textColor} opacity-75 hover:opacity-100`}>
                Technical details
              </summary>
              <pre className={`mt-2 text-xs ${config.textColor} opacity-75 overflow-auto p-2 bg-white bg-opacity-50 rounded`}>
                {JSON.stringify(errorResult.context, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>

      {/* Action buttons */}
      {actions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${getActionButtonClass(
                action.type
              )}`}
              type="button"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
