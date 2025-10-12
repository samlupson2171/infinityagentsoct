'use client';

import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface PackageStats {
  _id: string;
  name: string;
  destination: string;
  resort: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  linkedQuotesCount: number;
  lastUsedAt: string | null;
}

interface DestinationCount {
  total: number;
  active: number;
  inactive: number;
}

interface TimelineEntry {
  _id: {
    year: number;
    month: number;
  };
  created?: number;
  updated?: number;
}

interface Statistics {
  overview: {
    totalPackages: number;
    activePackages: number;
    inactivePackages: number;
    totalLinkedQuotes: number;
    packagesWithQuotes: number;
    unusedPackages: number;
    averageQuotesPerPackage: string;
  };
  mostUsedPackages: PackageStats[];
  destinationCounts: Record<string, DestinationCount>;
  timeline: {
    creation: TimelineEntry[];
    updates: TimelineEntry[];
  };
  allPackageStats: PackageStats[];
}

interface SuperPackageStatisticsProps {
  className?: string;
}

export default function SuperPackageStatistics({
  className = '',
}: SuperPackageStatisticsProps) {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'usage' | 'destinations' | 'timeline'>('overview');

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/super-packages/statistics');

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();
      setStatistics(data.statistics);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getMonthName = (month: number) => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return months[month - 1];
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Loading statistics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-8 ${className}`}>
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="mx-auto h-12 w-12"
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
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to Load Statistics
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchStatistics}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Package Statistics & Analytics
          </h2>
          <p className="text-gray-600">
            Insights into package usage and performance
          </p>
        </div>
        <button
          onClick={fetchStatistics}
          className="text-blue-600 hover:text-blue-700 flex items-center"
        >
          <svg
            className="w-5 h-5 mr-1"
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
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`${
              activeTab === 'usage'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Most Used Packages
          </button>
          <button
            onClick={() => setActiveTab('destinations')}
            className={`${
              activeTab === 'destinations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            By Destination
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`${
              activeTab === 'timeline'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Timeline
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Packages
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {statistics.overview.totalPackages}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Active Packages
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {statistics.overview.activePackages}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Linked Quotes
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {statistics.overview.totalLinkedQuotes}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Avg Quotes/Package
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {statistics.overview.averageQuotesPerPackage}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-teal-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Packages with Quotes
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {statistics.overview.packagesWithQuotes}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Unused Packages
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {statistics.overview.unusedPackages}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Most Used Packages Tab */}
      {activeTab === 'usage' && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Top 10 Most Used Packages
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Packages ranked by number of linked quotes
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Package Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Linked Quotes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Used
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statistics.mostUsedPackages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No packages have been used yet
                    </td>
                  </tr>
                ) : (
                  statistics.mostUsedPackages.map((pkg, index) => (
                    <tr key={pkg._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                              index === 0
                                ? 'bg-yellow-100 text-yellow-800'
                                : index === 1
                                ? 'bg-gray-200 text-gray-700'
                                : index === 2
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-gray-100 text-gray-600'
                            } font-semibold text-sm`}
                          >
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {pkg.name}
                        </div>
                        <div className="text-xs text-gray-500">{pkg.resort}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pkg.destination}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            pkg.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {pkg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-semibold text-gray-900">
                            {pkg.linkedQuotesCount}
                          </span>
                          <div className="ml-2 w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (pkg.linkedQuotesCount /
                                    statistics.mostUsedPackages[0]
                                      .linkedQuotesCount) *
                                    100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pkg.lastUsedAt ? formatDate(pkg.lastUsedAt) : 'Never'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Destinations Tab */}
      {activeTab === 'destinations' && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Packages by Destination
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Distribution of packages across destinations
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Packages
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inactive
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distribution
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(statistics.destinationCounts)
                  .sort(([, a], [, b]) => b.total - a.total)
                  .map(([destination, counts]) => (
                    <tr key={destination} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {destination}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {counts.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {counts.active}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                        {counts.inactive}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${
                                  (counts.total /
                                    statistics.overview.totalPackages) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                          <span className="ml-2 text-xs text-gray-500">
                            {(
                              (counts.total /
                                statistics.overview.totalPackages) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Creation Timeline */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Package Creation Timeline
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Packages created per month (last 12 months)
              </p>
            </div>
            <div className="p-6">
              {statistics.timeline.creation.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No packages created in the last 12 months
                </p>
              ) : (
                <div className="space-y-3">
                  {statistics.timeline.creation.map((entry) => (
                    <div
                      key={`${entry._id.year}-${entry._id.month}`}
                      className="flex items-center"
                    >
                      <div className="w-24 text-sm text-gray-600">
                        {getMonthName(entry._id.month)} {entry._id.year}
                      </div>
                      <div className="flex-1 ml-4">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-6">
                            <div
                              className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2"
                              style={{
                                width: `${Math.max(
                                  10,
                                  (entry.created! /
                                    Math.max(
                                      ...statistics.timeline.creation.map(
                                        (e) => e.created || 0
                                      )
                                    )) *
                                    100
                                )}%`,
                              }}
                            >
                              <span className="text-xs font-medium text-white">
                                {entry.created}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Update Timeline */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Package Update Timeline
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Packages updated per month (last 12 months)
              </p>
            </div>
            <div className="p-6">
              {statistics.timeline.updates.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No packages updated in the last 12 months
                </p>
              ) : (
                <div className="space-y-3">
                  {statistics.timeline.updates.map((entry) => (
                    <div
                      key={`${entry._id.year}-${entry._id.month}`}
                      className="flex items-center"
                    >
                      <div className="w-24 text-sm text-gray-600">
                        {getMonthName(entry._id.month)} {entry._id.year}
                      </div>
                      <div className="flex-1 ml-4">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-6">
                            <div
                              className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                              style={{
                                width: `${Math.max(
                                  10,
                                  (entry.updated! /
                                    Math.max(
                                      ...statistics.timeline.updates.map(
                                        (e) => e.updated || 0
                                      )
                                    )) *
                                    100
                                )}%`,
                              }}
                            >
                              <span className="text-xs font-medium text-white">
                                {entry.updated}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
