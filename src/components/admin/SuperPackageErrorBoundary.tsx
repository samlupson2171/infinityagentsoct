'use client';

/**
 * Error boundary specifically for Super Package components
 * Provides context-aware error handling and recovery options
 */

import React from 'react';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { useRouter } from 'next/navigation';

interface SuperPackageErrorBoundaryProps {
  children: React.ReactNode;
  context?: 'list' | 'form' | 'import' | 'selector';
}

export function SuperPackageErrorBoundary({
  children,
  context = 'list',
}: SuperPackageErrorBoundaryProps) {
  const router = useRouter();

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log error to monitoring service
    console.error('Super Package Error:', {
      context,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    // Could send to error tracking service here
    // e.g., Sentry, LogRocket, etc.
  };

  const getContextualFallback = () => {
    const contextMessages = {
      list: {
        title: 'Unable to load packages',
        message: 'There was a problem loading the super packages list.',
        action: 'Return to Dashboard',
        actionPath: '/admin/dashboard',
      },
      form: {
        title: 'Form error occurred',
        message: 'There was a problem with the package form.',
        action: 'Back to Packages',
        actionPath: '/admin/super-packages',
      },
      import: {
        title: 'Import error occurred',
        message: 'There was a problem importing the package.',
        action: 'Back to Packages',
        actionPath: '/admin/super-packages',
      },
      selector: {
        title: 'Package selection error',
        message: 'There was a problem loading package options.',
        action: 'Close',
        actionPath: null,
      },
    };

    const config = contextMessages[context];

    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-red-600"
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
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800">
                {config.title}
              </h3>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-red-700">{config.message}</p>
            <p className="text-sm text-red-600 mt-2">
              Please try refreshing the page or contact support if the problem
              persists.
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
            {config.actionPath && (
              <button
                onClick={() => router.push(config.actionPath)}
                className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 transition-colors"
              >
                {config.action}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary fallback={getContextualFallback()} onError={handleError}>
      {children}
    </ErrorBoundary>
  );
}
