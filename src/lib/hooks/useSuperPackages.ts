/**
 * React Query hooks for Super Packages
 * Implements caching strategy with stale-while-revalidate
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';

// Types
export interface SuperPackage {
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

export interface PackageListParams {
  page?: number;
  limit?: number;
  status?: 'all' | 'active' | 'inactive' | 'deleted';
  destination?: string;
  resort?: string;
  search?: string;
}

export interface PackageListResponse {
  packages: SuperPackage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// Query Keys
export const superPackageKeys = {
  all: ['super-packages'] as const,
  lists: () => [...superPackageKeys.all, 'list'] as const,
  list: (params: PackageListParams) => [...superPackageKeys.lists(), params] as const,
  details: () => [...superPackageKeys.all, 'detail'] as const,
  detail: (id: string) => [...superPackageKeys.details(), id] as const,
  statistics: () => [...superPackageKeys.all, 'statistics'] as const,
  filterOptions: () => [...superPackageKeys.all, 'filter-options'] as const,
};

// API Functions
async function fetchPackages(params: PackageListParams): Promise<PackageListResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.status && params.status !== 'all') searchParams.append('status', params.status);
  if (params.destination) searchParams.append('destination', params.destination);
  if (params.resort) searchParams.append('resort', params.resort);
  if (params.search) searchParams.append('search', params.search);

  const response = await fetch(`/api/admin/super-packages?${searchParams.toString()}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to fetch packages');
  }

  return response.json();
}

async function fetchPackageById(id: string): Promise<SuperPackage> {
  const response = await fetch(`/api/admin/super-packages/${id}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to fetch package');
  }

  const data = await response.json();
  return data.package;
}

async function createPackage(packageData: Partial<SuperPackage>): Promise<SuperPackage> {
  const response = await fetch('/api/admin/super-packages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(packageData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to create package');
  }

  const data = await response.json();
  return data.package;
}

async function updatePackage(id: string, packageData: Partial<SuperPackage>): Promise<SuperPackage> {
  const response = await fetch(`/api/admin/super-packages/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(packageData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to update package');
  }

  const data = await response.json();
  return data.package;
}

async function deletePackage(id: string): Promise<void> {
  const response = await fetch(`/api/admin/super-packages/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to delete package');
  }
}

async function updatePackageStatus(id: string, status: 'active' | 'inactive'): Promise<SuperPackage> {
  const response = await fetch(`/api/admin/super-packages/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to update status');
  }

  const data = await response.json();
  return data.package;
}

// Hooks

/**
 * Hook to fetch paginated list of packages with caching
 * Implements stale-while-revalidate strategy
 */
export function useSuperPackages(
  params: PackageListParams = {},
  options?: Omit<UseQueryOptions<PackageListResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PackageListResponse, Error>({
    queryKey: superPackageKeys.list(params),
    queryFn: () => fetchPackages(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
    ...options,
  });
}

/**
 * Hook to fetch a single package by ID with caching
 */
export function useSuperPackage(
  id: string | undefined,
  options?: Omit<UseQueryOptions<SuperPackage, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<SuperPackage, Error>({
    queryKey: superPackageKeys.detail(id!),
    queryFn: () => fetchPackageById(id!),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    ...options,
  });
}

/**
 * Hook to create a new package with cache invalidation
 */
export function useCreateSuperPackage() {
  const queryClient = useQueryClient();

  return useMutation<SuperPackage, Error, Partial<SuperPackage>>({
    mutationFn: createPackage,
    onSuccess: (newPackage) => {
      // Invalidate all list queries
      queryClient.invalidateQueries({ queryKey: superPackageKeys.lists() });
      
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: superPackageKeys.statistics() });
      
      // Invalidate filter options
      queryClient.invalidateQueries({ queryKey: superPackageKeys.filterOptions() });
      
      // Set the new package in cache
      queryClient.setQueryData(superPackageKeys.detail(newPackage._id), newPackage);
    },
  });
}

/**
 * Hook to update a package with cache invalidation
 */
export function useUpdateSuperPackage() {
  const queryClient = useQueryClient();

  return useMutation<SuperPackage, Error, { id: string; data: Partial<SuperPackage> }>({
    mutationFn: ({ id, data }) => updatePackage(id, data),
    onSuccess: (updatedPackage, variables) => {
      // Update the specific package in cache
      queryClient.setQueryData(superPackageKeys.detail(variables.id), updatedPackage);
      
      // Invalidate all list queries to reflect changes
      queryClient.invalidateQueries({ queryKey: superPackageKeys.lists() });
      
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: superPackageKeys.statistics() });
    },
  });
}

/**
 * Hook to delete a package with optimistic updates
 */
export function useDeleteSuperPackage() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deletePackage,
    onMutate: async (packageId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: superPackageKeys.detail(packageId) });
      await queryClient.cancelQueries({ queryKey: superPackageKeys.lists() });

      // Snapshot previous values
      const previousPackage = queryClient.getQueryData<SuperPackage>(
        superPackageKeys.detail(packageId)
      );

      const listQueries = queryClient.getQueriesData<PackageListResponse>({
        queryKey: superPackageKeys.lists(),
      });

      // Optimistically remove from all list caches
      listQueries.forEach(([queryKey, data]) => {
        if (data?.packages) {
          const updatedPackages = data.packages.filter((pkg) => pkg._id !== packageId);
          queryClient.setQueryData<PackageListResponse>(queryKey, {
            ...data,
            packages: updatedPackages,
            pagination: {
              ...data.pagination,
              total: data.pagination.total - 1,
            },
          });
        }
      });

      return { previousPackage, listQueries };
    },
    onError: (err, packageId, context) => {
      // Rollback list caches on error
      if (context?.listQueries) {
        context.listQueries.forEach(([queryKey, data]) => {
          if (data) {
            queryClient.setQueryData(queryKey, data);
          }
        });
      }
    },
    onSuccess: (_, packageId) => {
      // Remove the package from cache
      queryClient.removeQueries({ queryKey: superPackageKeys.detail(packageId) });
      
      // Invalidate all list queries
      queryClient.invalidateQueries({ queryKey: superPackageKeys.lists() });
      
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: superPackageKeys.statistics() });
      
      // Invalidate filter options
      queryClient.invalidateQueries({ queryKey: superPackageKeys.filterOptions() });
    },
  });
}

/**
 * Hook to update package status with optimistic updates
 */
export function useUpdatePackageStatus() {
  const queryClient = useQueryClient();

  return useMutation<SuperPackage, Error, { id: string; status: 'active' | 'inactive' }>({
    mutationFn: ({ id, status }) => updatePackageStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches for this package
      await queryClient.cancelQueries({ queryKey: superPackageKeys.detail(id) });

      // Snapshot the previous value
      const previousPackage = queryClient.getQueryData<SuperPackage>(superPackageKeys.detail(id));

      // Optimistically update the detail cache
      if (previousPackage) {
        queryClient.setQueryData<SuperPackage>(superPackageKeys.detail(id), {
          ...previousPackage,
          status,
        });
      }

      // Optimistically update all list caches
      const listQueries = queryClient.getQueriesData<PackageListResponse>({
        queryKey: superPackageKeys.lists(),
      });

      listQueries.forEach(([queryKey, data]) => {
        if (data?.packages) {
          const updatedPackages = data.packages.map((pkg) =>
            pkg._id === id ? { ...pkg, status } : pkg
          );
          queryClient.setQueryData<PackageListResponse>(queryKey, {
            ...data,
            packages: updatedPackages,
          });
        }
      });

      return { previousPackage, listQueries };
    },
    onError: (err, variables, context) => {
      // Rollback detail cache on error
      if (context?.previousPackage) {
        queryClient.setQueryData(superPackageKeys.detail(variables.id), context.previousPackage);
      }

      // Rollback list caches on error
      if (context?.listQueries) {
        context.listQueries.forEach(([queryKey, data]) => {
          if (data) {
            queryClient.setQueryData(queryKey, data);
          }
        });
      }
    },
    onSuccess: (updatedPackage, variables) => {
      // Update the cache with server response
      queryClient.setQueryData(superPackageKeys.detail(variables.id), updatedPackage);
      
      // Invalidate list queries to reflect status change
      queryClient.invalidateQueries({ queryKey: superPackageKeys.lists() });
      
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: superPackageKeys.statistics() });
    },
  });
}

/**
 * Hook to prefetch a package (useful for hover states)
 */
export function usePrefetchSuperPackage() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: superPackageKeys.detail(id),
      queryFn: () => fetchPackageById(id),
      staleTime: 10 * 60 * 1000,
    });
  };
}

/**
 * Hook to invalidate all package caches
 */
export function useInvalidateSuperPackages() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: superPackageKeys.all });
  };
}
