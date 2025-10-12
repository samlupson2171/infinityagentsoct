import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';
import {
  useSuperPackages,
  useSuperPackage,
  useCreateSuperPackage,
  useUpdateSuperPackage,
  useDeleteSuperPackage,
  useUpdatePackageStatus,
  superPackageKeys,
} from '../useSuperPackages';

// Mock fetch
global.fetch = vi.fn();

// Helper to create wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useSuperPackages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch packages successfully', async () => {
    const mockData = {
      packages: [
        {
          _id: '1',
          name: 'Test Package',
          destination: 'Benidorm',
          resort: 'Costa Blanca',
          currency: 'EUR',
          status: 'active',
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasMore: false,
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useSuperPackages(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/super-packages')
    );
  });

  it('should handle fetch error', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: 'Failed to fetch' } }),
    });

    const { result } = renderHook(() => useSuperPackages(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe('Failed to fetch');
  });

  it('should apply filters to query params', async () => {
    const mockData = {
      packages: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const params = {
      page: 2,
      limit: 20,
      status: 'active' as const,
      destination: 'Benidorm',
      search: 'test',
    };

    renderHook(() => useSuperPackages(params), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2')
      );
    });

    const fetchCall = (global.fetch as any).mock.calls[0][0];
    expect(fetchCall).toContain('page=2');
    expect(fetchCall).toContain('limit=20');
    expect(fetchCall).toContain('status=active');
    expect(fetchCall).toContain('destination=Benidorm');
    expect(fetchCall).toContain('search=test');
  });
});

describe('useSuperPackage', () => {
  it('should fetch single package successfully', async () => {
    const mockPackage = {
      _id: '1',
      name: 'Test Package',
      destination: 'Benidorm',
      resort: 'Costa Blanca',
      currency: 'EUR',
      status: 'active',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ package: mockPackage }),
    });

    const { result } = renderHook(() => useSuperPackage('1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockPackage);
    expect(global.fetch).toHaveBeenCalledWith('/api/admin/super-packages/1');
  });

  it('should not fetch when id is undefined', async () => {
    const { result } = renderHook(() => useSuperPackage(undefined), {
      wrapper: createWrapper(),
    });

    // Wait a bit to ensure no fetch is triggered
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });
});

describe('useCreateSuperPackage', () => {
  it('should create package and invalidate cache', async () => {
    const newPackage = {
      _id: '2',
      name: 'New Package',
      destination: 'Albufeira',
      resort: 'Algarve',
      currency: 'EUR',
      status: 'active',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ package: newPackage }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateSuperPackage(), { wrapper });

    result.current.mutate({ name: 'New Package' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(newPackage);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/admin/super-packages',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });
});

describe('useUpdateSuperPackage', () => {
  it('should update package and invalidate cache', async () => {
    const updatedPackage = {
      _id: '1',
      name: 'Updated Package',
      destination: 'Benidorm',
      resort: 'Costa Blanca',
      currency: 'EUR',
      status: 'active',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ package: updatedPackage }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateSuperPackage(), { wrapper });

    result.current.mutate({ id: '1', data: { name: 'Updated Package' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(updatedPackage);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/admin/super-packages/1',
      expect.objectContaining({
        method: 'PUT',
      })
    );
  });
});

describe('useDeleteSuperPackage', () => {
  it('should delete package and invalidate cache', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeleteSuperPackage(), { wrapper });

    result.current.mutate('1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/admin/super-packages/1',
      expect.objectContaining({
        method: 'DELETE',
      })
    );
  });
});

describe('useUpdatePackageStatus', () => {
  it('should update status with optimistic update', async () => {
    const updatedPackage = {
      _id: '1',
      name: 'Test Package',
      destination: 'Benidorm',
      resort: 'Costa Blanca',
      currency: 'EUR',
      status: 'inactive',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ package: updatedPackage }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdatePackageStatus(), { wrapper });

    result.current.mutate({ id: '1', status: 'inactive' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(updatedPackage);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/admin/super-packages/1/status',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ status: 'inactive' }),
      })
    );
  });
});

describe('Query Keys', () => {
  it('should generate correct query keys', () => {
    expect(superPackageKeys.all).toEqual(['super-packages']);
    expect(superPackageKeys.lists()).toEqual(['super-packages', 'list']);
    expect(superPackageKeys.list({ page: 1 })).toEqual([
      'super-packages',
      'list',
      { page: 1 },
    ]);
    expect(superPackageKeys.details()).toEqual(['super-packages', 'detail']);
    expect(superPackageKeys.detail('123')).toEqual([
      'super-packages',
      'detail',
      '123',
    ]);
    expect(superPackageKeys.statistics()).toEqual([
      'super-packages',
      'statistics',
    ]);
    expect(superPackageKeys.filterOptions()).toEqual([
      'super-packages',
      'filter-options',
    ]);
  });
});
