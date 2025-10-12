/**
 * React Query hook for Super Package Statistics
 * Implements caching for statistics data
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { superPackageKeys } from './useSuperPackages';

export interface PackageStatistics {
  totalPackages: number;
  activePackages: number;
  inactivePackages: number;
  deletedPackages: number;
  packagesByDestination: Array<{
    destination: string;
    count: number;
    activeCount: number;
  }>;
  packagesByResort: Array<{
    resort: string;
    count: number;
  }>;
  mostUsedPackages: Array<{
    _id: string;
    name: string;
    destination: string;
    linkedQuotesCount: number;
  }>;
  recentlyCreated: Array<{
    _id: string;
    name: string;
    destination: string;
    createdAt: string;
  }>;
  recentlyUpdated: Array<{
    _id: string;
    name: string;
    destination: string;
    updatedAt: string;
  }>;
}

async function fetchStatistics(): Promise<PackageStatistics> {
  const response = await fetch('/api/admin/super-packages/statistics');
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to fetch statistics');
  }

  const data = await response.json();
  return data.statistics;
}

/**
 * Hook to fetch package statistics with caching
 * Statistics are cached for 2 minutes and refetched in background
 */
export function useSuperPackageStatistics(
  options?: Omit<UseQueryOptions<PackageStatistics, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PackageStatistics, Error>({
    queryKey: superPackageKeys.statistics(),
    queryFn: fetchStatistics,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
    ...options,
  });
}
