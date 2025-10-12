'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useToast } from '@/components/shared/Toast';
import { useConfirmDialog } from '@/components/shared/ConfirmDialog';
import { SuperPackageErrorBoundary } from './SuperPackageErrorBoundary';
import { TableSkeleton } from '@/components/shared/LoadingState';
import { ErrorDisplay } from '@/components/shared/ErrorBoundary';
import { PackageListSkeleton, StatisticsCardSkeleton, ButtonSpinner } from '@/components/shared/SkeletonLoader';
import { ErrorCode } from '@/lib/error-handling';
import SuperPackageVersionHistory from './SuperPackageVersionHistory';
import SuperPackageStatistics from './SuperPackageStatistics';

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
    prices: Array<{
      groupSizeTierIndex: number;
      nights: number;
      price: number | 'ON_REQUEST';
    }>;
  }>;
  version: number;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy?: {
    name: string;
    email: string;
  };
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

interface SuperPackageManagerProps {
  className?: string;
}

export default function SuperPackageManager({
  className = '',
}: SuperPackageManagerProps) {
  const [packages, setPackages] = useState<SuperPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ code?: ErrorCode; message: string; details?: any; field?: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'deleted'>('all');
  const [destinationFilter, setDestinationFilter] = useState('');
  const [resortFilter, setResortFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [versionHistoryPackage, setVersionHistoryPackage] = useState<{
    id: string;
    name: string;
    version: number;
  } | null>(null);
  const [showStatistics, setShowStatistics] = useState(false);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [exportLoading, setExportLoading] = useState(false);
  
  // Use toast and confirm dialog hooks
  const { showSuccess, showError, showWarning } = useToast();
  const { confirm, dialog } = useConfirmDialog();

  // Debounced search
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Available destinations and resorts for filters
  const [availableDestinations, setAvailableDestinations] = useState<string[]>([]);
  const [availableResorts, setAvailableResorts] = useState<string[]>([]);

  // Fetch filter options (destinations and resorts)
  const fetchFilterOptions = useCallback(async () => {
    try {
      // Fetch all packages without pagination to get unique destinations and resorts
      const response = await fetch('/api/admin/super-packages?limit=1000&status=all');
      
      if (response.ok) {
        const data = await response.json();
        const packages = data.data?.packages || data.packages || [];
        if (packages.length > 0) {
          const destinations = Array.from(
            new Set(packages.map((pkg: SuperPackage) => pkg.destination))
          ) as string[];
          const resorts = Array.from(
            new Set(packages.map((pkg: SuperPackage) => pkg.resort))
          ) as string[];
          
          setAvailableDestinations(destinations.sort());
          setAvailableResorts(resorts.sort());
        }
      }
    } catch (err) {
      // Silently fail - filter options are not critical
      console.error('Failed to fetch filter options:', err);
    }
  }, []);

  // Fetch packages
  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(destinationFilter && { destination: destinationFilter }),
        ...(resortFilter && { resort: resortFilter }),
        ...(debouncedSearch && { search: debouncedSearch }),
      });

      const response = await fetch(`/api/admin/super-packages?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw {
          code: errorData.error?.code as ErrorCode | undefined,
          message: errorData.error?.message || 'Failed to fetch packages',
          details: errorData.error?.details,
        };
      }

      const data = await response.json();
      setPackages(data.data?.packages || data.packages || []);
      setPagination(data.data?.pagination || data.pagination);
    } catch (err: any) {
      const errorObj = {
        code: err.code,
        message: err.message || 'An error occurred while loading packages',
      };
      setError(errorObj);
      showError('Failed to Load Packages', errorObj.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, destinationFilter, resortFilter, debouncedSearch, showError]);

  // Optimistic update helper
  const optimisticallyUpdatePackage = useCallback((packageId: string, updates: Partial<SuperPackage>) => {
    setPackages(prevPackages => 
      prevPackages.map(pkg => 
        pkg._id === packageId ? { ...pkg, ...updates } : pkg
      )
    );
  }, []);

  // Effect to fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  // Effect to fetch packages when dependencies change
  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // Handle filter changes
  const handleFilterChange = (
    key: 'status' | 'destination' | 'resort' | 'search',
    value: string
  ) => {
    if (key === 'status') {
      setStatusFilter(value as 'all' | 'active' | 'inactive' | 'deleted');
    } else if (key === 'destination') {
      setDestinationFilter(value);
    } else if (key === 'resort') {
      setResortFilter(value);
    } else if (key === 'search') {
      setSearchTerm(value);
    }
    setCurrentPage(1); // Reset to first page
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDestinationFilter('');
    setResortFilter('');
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || statusFilter !== 'all' || destinationFilter || resortFilter;

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Handle status toggle with optimistic update
  const handleToggleStatus = async (packageId: string, currentStatus: string, packageName: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    confirm(
      {
        title: `${newStatus === 'active' ? 'Activate' : 'Deactivate'} Package`,
        message: `Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} "${packageName}"?`,
        confirmLabel: newStatus === 'active' ? 'Activate' : 'Deactivate',
        variant: 'warning',
        details: [
          newStatus === 'inactive'
            ? 'This package will no longer be available for selection in quotes.'
            : 'This package will become available for selection in quotes.',
        ],
      },
      async () => {
        // Store previous state for rollback
        const previousPackages = [...packages];
        
        try {
          setActionLoading(packageId);
          
          // Optimistic update
          optimisticallyUpdatePackage(packageId, { status: newStatus });

          const response = await fetch(
            `/api/admin/super-packages/${packageId}/status`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ status: newStatus }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to update status');
          }

          showSuccess(
            'Status Updated',
            `Package "${packageName}" has been ${newStatus === 'active' ? 'activated' : 'deactivated'}`
          );

          // Refresh the list to ensure consistency
          await fetchPackages();
        } catch (err: any) {
          // Rollback on error
          setPackages(previousPackages);
          showError('Failed to Update Status', err.message);
        } finally {
          setActionLoading(null);
        }
      }
    );
  };

  // Handle duplicate
  const handleDuplicate = async (packageId: string, packageName: string) => {
    confirm(
      {
        title: 'Duplicate Package',
        message: `Create a copy of "${packageName}"?`,
        confirmLabel: 'Duplicate',
        variant: 'info',
        details: [
          'A copy of this package will be created with "(Copy)" appended to the name.',
          'The duplicate will be created as inactive for review.',
          'You can edit the duplicate before activating it.',
        ],
      },
      async () => {
        try {
          setActionLoading(packageId);

          const response = await fetch(
            `/api/admin/super-packages/${packageId}/duplicate`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to duplicate package');
          }

          const result = await response.json();

          showSuccess(
            'Package Duplicated',
            `"${packageName}" has been duplicated. Redirecting to edit...`
          );

          // Redirect to edit the new package
          setTimeout(() => {
            window.location.href = `/admin/super-packages/${result.package._id}/edit`;
          }, 1500);
        } catch (err: any) {
          showError('Failed to Duplicate Package', err.message);
          setActionLoading(null);
        }
      }
    );
  };

  // Handle delete with safeguards
  const handleDelete = async (packageId: string, packageName: string) => {
    try {
      setActionLoading(packageId);

      // First, check deletion status
      const checkResponse = await fetch(
        `/api/admin/super-packages/${packageId}/check-deletion`
      );

      if (!checkResponse.ok) {
        throw new Error('Failed to check package deletion status');
      }

      const checkData = await checkResponse.json();
      setActionLoading(null);

      // Build confirmation dialog based on linked quotes
      const details: string[] = [];
      
      if (checkData.linkedQuotesCount > 0) {
        details.push(
          `⚠️ This package is linked to ${checkData.linkedQuotesCount} quote(s).`,
          '',
          'The package will be SOFT-DELETED (marked as deleted but data retained).',
          'Existing quotes will continue to work normally.',
          ''
        );

        // Add status breakdown
        if (checkData.statusBreakdown) {
          details.push('Quote Status Breakdown:');
          Object.entries(checkData.statusBreakdown).forEach(([status, count]) => {
            details.push(`  • ${status}: ${count}`);
          });
          details.push('');
        }

        // Add sample quotes
        if (checkData.linkedQuotes && checkData.linkedQuotes.length > 0) {
          details.push('Sample Linked Quotes:');
          checkData.linkedQuotes.slice(0, 5).forEach((quote: any) => {
            details.push(
              `  • ${quote.quoteNumber} - ${quote.customerName || 'N/A'} (${quote.status})`
            );
          });
          
          if (checkData.linkedQuotesCount > 5) {
            details.push(`  ... and ${checkData.linkedQuotesCount - 5} more`);
          }
        }
      } else {
        details.push(
          '✓ No quotes are linked to this package.',
          '',
          'The package will be PERMANENTLY DELETED.',
          'This action cannot be undone.'
        );
      }

      confirm(
        {
          title: checkData.canHardDelete ? 'Permanently Delete Package' : 'Soft-Delete Package',
          message: `Are you sure you want to delete "${packageName}"?`,
          confirmLabel: checkData.canHardDelete ? 'Permanently Delete' : 'Soft-Delete',
          variant: 'danger',
          details,
        },
        async () => {
          try {
            setActionLoading(packageId);

            const response = await fetch(`/api/admin/super-packages/${packageId}`, {
              method: 'DELETE',
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error?.message || 'Failed to delete package');
            }

            const result = await response.json();

            if (result.softDelete) {
              showWarning(
                'Package Soft-Deleted',
                `"${packageName}" has been soft-deleted. ${result.linkedQuotesCount} quote(s) are linked to this package.`
              );
            } else {
              showSuccess('Package Deleted', `"${packageName}" has been permanently deleted`);
            }

            // Refresh the list
            await fetchPackages();
          } catch (err: any) {
            showError('Failed to Delete Package', err.message);
          } finally {
            setActionLoading(null);
          }
        }
      );
    } catch (err: any) {
      setActionLoading(null);
      showError('Failed to Check Deletion Status', err.message);
    }
  };

  // Export single package
  const handleExportPackage = async (packageId: string, packageName: string) => {
    try {
      setExportLoading(true);
      
      const response = await fetch(`/api/admin/super-packages/export?ids=${packageId}`);
      
      if (!response.ok) {
        throw new Error('Failed to export package');
      }
      
      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `${packageName}.csv`;
      
      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showSuccess('Package Exported', `"${packageName}" has been exported to CSV`);
    } catch (err: any) {
      showError('Export Failed', err.message);
    } finally {
      setExportLoading(false);
    }
  };

  // Export selected packages
  const handleExportSelected = async () => {
    if (selectedPackages.length === 0) {
      showWarning('No Selection', 'Please select at least one package to export');
      return;
    }

    try {
      setExportLoading(true);
      
      const ids = selectedPackages.join(',');
      const response = await fetch(`/api/admin/super-packages/export?ids=${ids}`);
      
      if (!response.ok) {
        throw new Error('Failed to export packages');
      }
      
      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : 'super-packages-export.csv';
      
      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showSuccess('Packages Exported', `${selectedPackages.length} package(s) exported to CSV`);
      setSelectedPackages([]);
    } catch (err: any) {
      showError('Export Failed', err.message);
    } finally {
      setExportLoading(false);
    }
  };

  // Export all packages (with filters)
  const handleExportAll = async () => {
    try {
      setExportLoading(true);
      
      // Build query params based on current filters
      const params = new URLSearchParams();
      if (destinationFilter) params.append('destination', destinationFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`/api/admin/super-packages/export?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to export packages');
      }
      
      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : 'super-packages-export.csv';
      
      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showSuccess('Packages Exported', 'All packages exported to CSV');
    } catch (err: any) {
      showError('Export Failed', err.message);
    } finally {
      setExportLoading(false);
    }
  };

  // Toggle package selection
  const togglePackageSelection = (packageId: string) => {
    setSelectedPackages((prev) =>
      prev.includes(packageId)
        ? prev.filter((id) => id !== packageId)
        : [...prev, packageId]
    );
  };

  // Toggle all packages selection
  const toggleAllPackages = () => {
    if (selectedPackages.length === packages.length) {
      setSelectedPackages([]);
    } else {
      setSelectedPackages(packages.map((pkg) => pkg._id));
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get status badge classes
  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'inactive':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'deleted':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Get price range from pricing matrix
  const getPriceRange = (pkg: SuperPackage) => {
    const prices = pkg.pricingMatrix
      .flatMap((entry) => entry.prices)
      .map((p) => p.price)
      .filter((p) => typeof p === 'number') as number[];

    if (prices.length === 0) return 'ON REQUEST';

    const min = Math.min(...prices);
    const max = Math.max(...prices);

    const currencySymbol = pkg.currency === 'EUR' ? '€' : pkg.currency === 'GBP' ? '£' : '$';

    if (min === max) {
      return `${currencySymbol}${min}`;
    }

    return `${currencySymbol}${min} - ${currencySymbol}${max}`;
  };

  // Calculate pagination info
  const totalPages = pagination?.totalPages || 0;
  const startItem = pagination ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const endItem = pagination
    ? Math.min(pagination.page * pagination.limit, pagination.total)
    : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Super Offer Packages
          </h1>
          <p className="text-gray-600">
            Manage pre-configured destination packages with pricing matrices
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowStatistics(!showStatistics)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            {showStatistics ? 'Hide' : 'Show'} Statistics
          </button>
          {selectedPackages.length > 0 && (
            <button
              onClick={handleExportSelected}
              disabled={exportLoading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportLoading ? (
                <ButtonSpinner className="h-5 w-5 mr-2" />
              ) : (
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              )}
              {exportLoading ? 'Exporting...' : `Export Selected (${selectedPackages.length})`}
            </button>
          )}
          <button
            onClick={handleExportAll}
            disabled={exportLoading}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportLoading ? (
              <ButtonSpinner className="h-5 w-5 mr-2" />
            ) : (
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            )}
            {exportLoading ? 'Exporting...' : 'Export All'}
          </button>
          <button
            onClick={() => (window.location.href = '/admin/super-packages/calculator')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Price Calculator
          </button>
          <button
            onClick={() => (window.location.href = '/admin/super-packages/import')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Import from CSV
          </button>
          <button
            onClick={() => (window.location.href = '/admin/super-packages/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Package
          </button>
        </div>
      </div>

      {/* Statistics Section */}
      {showStatistics && (
        <SuperPackageStatistics />
      )}

      {/* Status Summary */}
      {!loading && packages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Packages</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {packages.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Inactive Packages</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {packages.filter(p => p.status === 'inactive').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Packages</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {pagination?.total || packages.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Clear all filters
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or destination..."
                value={searchTerm}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="deleted">Deleted Only</option>
            </select>
          </div>

          {/* Destination Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destination
            </label>
            <select
              value={destinationFilter}
              onChange={(e) => handleFilterChange('destination', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Destinations</option>
              {availableDestinations.map((dest) => (
                <option key={dest} value={dest}>
                  {dest}
                </option>
              ))}
            </select>
          </div>

          {/* Resort Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resort
            </label>
            <select
              value={resortFilter}
              onChange={(e) => handleFilterChange('resort', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Resorts</option>
              {availableResorts.map((resort) => (
                <option key={resort} value={resort}>
                  {resort}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Search: "{searchTerm}"
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="ml-2 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Status: {statusFilter}
                <button
                  onClick={() => handleFilterChange('status', 'all')}
                  className="ml-2 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {destinationFilter && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Destination: {destinationFilter}
                <button
                  onClick={() => handleFilterChange('destination', '')}
                  className="ml-2 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {resortFilter && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Resort: {resortFilter}
                <button
                  onClick={() => handleFilterChange('resort', '')}
                  className="ml-2 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Deleted Packages Warning Banner */}
      {statusFilter === 'deleted' && !loading && packages.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
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
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Viewing Deleted Packages
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  These packages have been soft-deleted because they are linked to existing quotes.
                  They are hidden from package selection but their data is retained for quote integrity.
                  Deleted packages cannot be edited or reactivated.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <PackageListSkeleton rows={10} />
      ) : error ? (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6">
            <ErrorDisplay
              error={error}
              onRetry={fetchPackages}
              onDismiss={() => setError(null)}
            />
          </div>
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No packages found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? `No packages found matching "${searchTerm}".`
                : 'Get started by creating your first super package.'}
            </p>
            <div className="mt-6">
              <button
                onClick={() => (window.location.href = '/admin/super-packages/new')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Package
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedPackages.length === packages.length && packages.length > 0}
                      onChange={toggleAllPackages}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Package Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resort
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {packages.map((pkg) => (
                  <tr 
                    key={pkg._id} 
                    className={`hover:bg-gray-50 ${
                      pkg.status === 'inactive' ? 'bg-gray-50 opacity-75' : ''
                    } ${
                      pkg.status === 'deleted' ? 'bg-red-50 opacity-60' : ''
                    }`}
                  >
                    <td className="px-3 py-4">
                      <input
                        type="checkbox"
                        checked={selectedPackages.includes(pkg._id)}
                        onChange={() => togglePackageSelection(pkg._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm font-medium ${
                        pkg.status === 'inactive' ? 'text-gray-500' : 'text-gray-900'
                      }`}>
                        {pkg.name}
                        {pkg.status === 'inactive' && (
                          <span className="ml-2 text-xs text-gray-400">(Inactive)</span>
                        )}
                        {pkg.status === 'deleted' && (
                          <span className="ml-2 text-xs text-red-600 font-semibold">(DELETED)</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Version {pkg.version}
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-sm ${
                      pkg.status === 'inactive' ? 'text-gray-500' : 'text-gray-900'
                    }`}>
                      {pkg.destination}
                    </td>
                    <td className={`px-6 py-4 text-sm ${
                      pkg.status === 'inactive' ? 'text-gray-500' : 'text-gray-900'
                    }`}>
                      {pkg.resort}
                    </td>
                    <td className={`px-6 py-4 text-sm ${
                      pkg.status === 'inactive' ? 'text-gray-500' : 'text-gray-900'
                    }`}>
                      {getPriceRange(pkg)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={getStatusBadge(pkg.status)}>
                        {pkg.status.charAt(0).toUpperCase() + pkg.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>{formatDate(pkg.updatedAt)}</div>
                      {pkg.lastModifiedBy && (
                        <div className="text-xs text-gray-500">
                          by {pkg.lastModifiedBy.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() =>
                            (window.location.href = `/admin/super-packages/${pkg._id}`)
                          }
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() =>
                            (window.location.href = `/admin/super-packages/${pkg._id}/edit`)
                          }
                          disabled={pkg.status === 'deleted'}
                          className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={pkg.status === 'deleted' ? 'Cannot edit deleted package' : 'Edit this package'}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDuplicate(pkg._id, pkg.name)}
                          disabled={actionLoading === pkg._id}
                          className="text-cyan-600 hover:text-cyan-900 disabled:opacity-50 inline-flex items-center"
                          title="Duplicate this package"
                        >
                          {actionLoading === pkg._id ? (
                            <ButtonSpinner className="h-4 w-4" />
                          ) : (
                            'Duplicate'
                          )}
                        </button>
                        <button
                          onClick={() => handleExportPackage(pkg._id, pkg.name)}
                          disabled={exportLoading}
                          className="text-teal-600 hover:text-teal-900 disabled:opacity-50 inline-flex items-center"
                          title="Export to CSV"
                        >
                          {exportLoading ? (
                            <ButtonSpinner className="h-4 w-4" />
                          ) : (
                            'Export'
                          )}
                        </button>
                        <button
                          onClick={() =>
                            setVersionHistoryPackage({
                              id: pkg._id,
                              name: pkg.name,
                              version: pkg.version,
                            })
                          }
                          className="text-purple-600 hover:text-purple-900"
                          title="View version history"
                        >
                          History
                        </button>
                        <button
                          onClick={() => handleToggleStatus(pkg._id, pkg.status, pkg.name)}
                          disabled={actionLoading === pkg._id || pkg.status === 'deleted'}
                          className={`${
                            pkg.status === 'active'
                              ? 'text-yellow-600 hover:text-yellow-900'
                              : 'text-green-600 hover:text-green-900'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          title={
                            pkg.status === 'deleted'
                              ? 'Cannot change status of deleted package'
                              : pkg.status === 'active'
                              ? 'Deactivate this package'
                              : 'Activate this package'
                          }
                        >
                          {actionLoading === pkg._id ? (
                            <ButtonSpinner className="h-4 w-4" />
                          ) : pkg.status === 'active' ? (
                            'Deactivate'
                          ) : (
                            'Activate'
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(pkg._id, pkg.name)}
                          disabled={actionLoading === pkg._id || pkg.status === 'deleted'}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={pkg.status === 'deleted' ? 'Package already deleted' : 'Delete this package'}
                        >
                          {pkg.status === 'deleted' ? 'Deleted' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination && totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!pagination.hasMore}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{startItem}</span>{' '}
                        to <span className="font-medium">{endItem}</span> of{' '}
                        <span className="font-medium">{pagination.total}</span>{' '}
                        results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>

                        {/* Page numbers */}
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            const pageNum =
                              Math.max(
                                1,
                                Math.min(totalPages - 4, currentPage - 2)
                              ) + i;
                            if (pageNum > totalPages) return null;

                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  pageNum === currentPage
                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                        )}

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={!pagination.hasMore}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      )}

      {/* Confirmation Dialog */}
      {dialog}

      {/* Version History Modal */}
      {versionHistoryPackage && (
        <SuperPackageVersionHistory
          packageId={versionHistoryPackage.id}
          packageName={versionHistoryPackage.name}
          currentVersion={versionHistoryPackage.version}
          onClose={() => setVersionHistoryPackage(null)}
        />
      )}
    </div>
  );
}

// Wrap with error boundary
function SuperPackageManagerWithErrorBoundary(props: SuperPackageManagerProps) {
  return (
    <SuperPackageErrorBoundary context="list">
      <SuperPackageManager {...props} />
    </SuperPackageErrorBoundary>
  );
}

export { SuperPackageManagerWithErrorBoundary as SuperPackageManager };
