'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface SuperPackage {
  _id: string;
  name: string;
  destination: string;
  resort: string;
  currency: 'EUR' | 'GBP' | 'USD';
  status: 'active' | 'inactive' | 'deleted';
  groupSizeTiers: Array<{
    label: string;
    minPeople: number;
    maxPeople: number;
  }>;
  durationOptions: number[];
  pricingMatrix: Array<{
    period: string;
    periodType?: string;
    startDate?: string;
    endDate?: string;
    prices: Array<{
      groupSizeTierIndex: number;
      nights: number;
      price: number | 'ON_REQUEST';
    }>;
  }>;
  inclusions?: Array<{
    text: string;
    category: string;
  }>;
  accommodationExamples?: string[];
  salesNotes?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: { name: string; email: string };
  lastModifiedBy?: { name: string; email: string };
}

export default function ViewSuperPackagePage() {
  const params = useParams();
  const router = useRouter();
  const [pkg, setPkg] = useState<SuperPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPackage() {
      try {
        console.log('Fetching package:', params.id);
        const url = `/api/admin/super-packages/${params.id}`;
        console.log('URL:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        console.log('Response content-type:', response.headers.get('content-type'));
        
        if (!response.ok) {
          const text = await response.text();
          console.log('Error response:', text.substring(0, 500));
          
          // Try to parse as JSON
          try {
            const errorData = JSON.parse(text);
            throw new Error(errorData.error?.message || errorData.error || 'Failed to fetch package');
          } catch {
            throw new Error(`Server error (${response.status}): Response was HTML instead of JSON. The API route may not be working.`);
          }
        }
        
        const data = await response.json();
        console.log('Success data:', data);
        setPkg(data.data?.package || data.package);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchPackage();
    }
  }, [params.id]);

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'USD': return '$';
      default: return currency;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-red-800 font-semibold mb-2">Error</h2>
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => router.push('/admin/super-packages')}
                className="mt-4 text-red-600 hover:text-red-800 underline"
              >
                Back to Packages
              </button>
            </div>
          ) : pkg ? (
            <>
              {/* Header */}
              <div className="mb-6 flex justify-between items-start">
                <div>
                  <button
                    onClick={() => router.push('/admin/super-packages')}
                    className="text-blue-600 hover:text-blue-800 mb-2 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Packages
                  </button>
                  <h1 className="text-3xl font-bold text-gray-900">{pkg.name}</h1>
                  <p className="text-gray-600 mt-1">
                    {pkg.destination} • {pkg.resort}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    pkg.status === 'active' ? 'bg-green-100 text-green-800' :
                    pkg.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {pkg.status.charAt(0).toUpperCase() + pkg.status.slice(1)}
                  </span>
                  <button
                    onClick={() => router.push(`/admin/super-packages/${pkg._id}/edit`)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Edit Package
                  </button>
                </div>
              </div>

              {/* Basic Info */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Currency</p>
                    <p className="font-medium">{pkg.currency} ({getCurrencySymbol(pkg.currency)})</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Version</p>
                    <p className="font-medium">v{pkg.version}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-medium">{formatDate(pkg.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="font-medium">{formatDate(pkg.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Group Size Tiers */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Group Size Tiers</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {pkg.groupSizeTiers.map((tier, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <p className="font-medium">{tier.label}</p>
                      <p className="text-sm text-gray-600">
                        {tier.minPeople} - {tier.maxPeople === 999 ? '∞' : tier.maxPeople} people
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Duration Options */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Duration Options</h2>
                <div className="flex flex-wrap gap-2">
                  {pkg.durationOptions.map((nights) => (
                    <span key={nights} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {nights} {nights === 1 ? 'night' : 'nights'}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pricing Matrix */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Pricing Matrix</h2>
                <div className="space-y-6">
                  {pkg.pricingMatrix.map((period, periodIndex) => (
                    <div key={periodIndex} className="border-b pb-4 last:border-b-0">
                      <h3 className="font-medium text-lg mb-3">{period.period}</h3>
                      {period.startDate && period.endDate && (
                        <p className="text-sm text-gray-600 mb-2">
                          {formatDate(period.startDate)} - {formatDate(period.endDate)}
                        </p>
                      )}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left">Group Size</th>
                              {pkg.durationOptions.map((nights) => (
                                <th key={nights} className="px-4 py-2 text-right">
                                  {nights} {nights === 1 ? 'night' : 'nights'}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {pkg.groupSizeTiers.map((tier, tierIndex) => (
                              <tr key={tierIndex} className="border-t">
                                <td className="px-4 py-2 font-medium">{tier.label}</td>
                                {pkg.durationOptions.map((nights) => {
                                  const priceEntry = period.prices.find(
                                    p => p.groupSizeTierIndex === tierIndex && p.nights === nights
                                  );
                                  return (
                                    <td key={nights} className="px-4 py-2 text-right">
                                      {priceEntry ? (
                                        priceEntry.price === 'ON_REQUEST' ? (
                                          <span className="text-gray-500 italic">On Request</span>
                                        ) : (
                                          <span className="font-medium">
                                            {getCurrencySymbol(pkg.currency)}{priceEntry.price}
                                          </span>
                                        )
                                      ) : (
                                        <span className="text-gray-400">-</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inclusions */}
              {pkg.inclusions && pkg.inclusions.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4">Inclusions</h2>
                  <ul className="space-y-2">
                    {pkg.inclusions.map((inclusion, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{inclusion.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sales Notes */}
              {pkg.salesNotes && (
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4">Sales Notes</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{pkg.salesNotes}</p>
                </div>
              )}

              {/* Metadata */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4">Metadata</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {pkg.createdBy && (
                    <div>
                      <p className="text-gray-600">Created By</p>
                      <p className="font-medium">{pkg.createdBy.name}</p>
                      <p className="text-gray-500">{pkg.createdBy.email}</p>
                    </div>
                  )}
                  {pkg.lastModifiedBy && (
                    <div>
                      <p className="text-gray-600">Last Modified By</p>
                      <p className="font-medium">{pkg.lastModifiedBy.name}</p>
                      <p className="text-gray-500">{pkg.lastModifiedBy.email}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Package not found</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
