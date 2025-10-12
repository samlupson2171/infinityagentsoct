'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import PackagePriceCalculator from '@/components/admin/PackagePriceCalculator';

export default function PackageCalculatorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Package Price Calculator
              </h1>
              <p className="mt-2 text-gray-600">
                Test price calculations for super offer packages without creating quotes
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/super-packages')}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back to Packages
            </button>
          </div>
        </div>

        {/* Calculator Component */}
        <PackagePriceCalculator />

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Select a super offer package from the dropdown</li>
            <li>Review the package details and available options</li>
            <li>Enter the number of people, select duration, and choose an arrival date</li>
            <li>Click "Calculate Price" to see the pricing breakdown</li>
            <li>View the complete pricing matrix, inclusions, and package details below</li>
          </ol>
          <div className="mt-4 p-4 bg-white rounded border border-blue-300">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> This calculator is for testing and preview purposes only.
              To create an actual quote with a package, use the quote creation form and select
              the "Link Super Package" option.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
