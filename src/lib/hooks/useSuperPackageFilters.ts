/**
 * React Query hook for Super Package Filter Options
 * Implements caching for filter dropdown options
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { superPackageKeys } from './useSuperPackages';

export interface FilterOptions {
  destinations: string[];
  resorts: string[];
}

async function fetchFilterOptions(): Promise<FilterOptions> {
  // Fetch all packages to extract unique destinations and resorts
  const response = await fetch('/api/admin/super-packages?limit=1000&status=all');
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to fetch filter options');
  }

  const data = await response.json();
  const packages = data.packages || [];

  const destinations = Array.from(
    new Set(packages.map((pkg: any) => pkg.destination))
  ).sort() as string[];

  const resorts = Array.from(
    new Set(packages.map((pkg: any) => pkg.resort))
  ).sort() as string[];

  return { destinations, resorts };
}

/**
 * Hook to fetch filter options with aggressive caching
 * Filter options change infrequently, so we cache for 15 minutes
 */
export function useSuperPackageFilters(
  options?: Omit<UseQueryOptions<FilterOptions, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<FilterOptions, Error>({
    queryKey: superPackageKeys.filterOptions(),
    queryFn: fetchFilterOptions,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false, // Don't refetch on focus
    refetchOnMount: false, // Don't refetch on mount if data exists
    ...options,
  });
}
