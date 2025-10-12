/**
 * Tests for useQuotePrice hook
 * 
 * Note: This test file is created as part of the optional testing task.
 * It provides comprehensive coverage of the price synchronization logic.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';
import { useQuotePrice } from '../useQuotePrice';
import type { LinkedPackageInfo } from '@/types/quote-price-sync';

// Mock the useSuperPackagePriceCalculation hook
vi.mock('../useSuperPackagePriceCalculation', () => ({
  useSuperPackagePriceCalculation: vi.fn(),
}));

// Mock the useDebounce hook to return values immediately for testing
vi.mock('../useDebounce', () => ({
  useDebounce: vi.fn((value) => value),
}));

import { useSuperPackagePriceCalculation } from '../useSuperPackagePriceCalculation';

const mockUseSuperPackagePriceCalculation = useSuperPackagePriceCalculation as ReturnType<typeof vi.fn>;

// Helper to create wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useQuotePrice', () => {
  const mockLinkedPackage: LinkedPackageInfo = {
    packageId: 'pkg-123',
    packageName: 'Test Package',
    packageVersion: 1,
    tierIndex: 0,
    tierLabel: '6-11 People',
    periodUsed: 'January',
    originalPrice: 1000,
  };

  const mockOnPriceUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with synced status when no package is linked', () => {
    mockUseSuperPackagePriceCalculation.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    const { result } = renderHook(
      () =>
        useQuotePrice({
          linkedPackage: null,
          numberOfPeople: 8,
          numberOfNights: 3,
          arrivalDate: '2025-01-15',
          currentPrice: 1000,
          onPriceUpdate: mockOnPriceUpdate,
        }),
      { wrapper: createWrapper() }
    );

    expect(result.current.syncStatus).toBe('synced');
    expect(result.current.calculatedPrice).toBeNull();
    expect(result.current.validationWarnings).toEqual([]);
  });

  it('should calculate price when package is linked', async () => {
    const mockPriceData = {
      price: 1200,
      tierUsed: '6-11 People',
      periodUsed: 'January',
      breakdown: {
        pricePerPerson: 150,
        numberOfPeople: 8,
        totalPrice: 1200,
      },
    };

    mockUseSuperPackagePriceCalculation.mockReturnValue({
      data: mockPriceData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    const { result } = renderHook(
      () =>
        useQuotePrice({
          linkedPackage: mockLinkedPackage,
          numberOfPeople: 8,
          numberOfNights: 3,
          arrivalDate: '2025-01-15',
          currentPrice: 1200,
          onPriceUpdate: mockOnPriceUpdate,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.syncStatus).toBe('synced');
    });

    expect(result.current.calculatedPrice).toBe(1200);
    expect(result.current.priceBreakdown).toEqual({
      pricePerPerson: 150,
      numberOfPeople: 8,
      totalPrice: 1200,
      tierUsed: '6-11 People',
      periodUsed: 'January',
      currency: 'GBP',
    });
  });

  it('should show calculating status when loading', () => {
    mockUseSuperPackagePriceCalculation.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    const { result } = renderHook(
      () =>
        useQuotePrice({
          linkedPackage: mockLinkedPackage,
          numberOfPeople: 8,
          numberOfNights: 3,
          arrivalDate: '2025-01-15',
          currentPrice: 1000,
          onPriceUpdate: mockOnPriceUpdate,
        }),
      { wrapper: createWrapper() }
    );

    expect(result.current.syncStatus).toBe('calculating');
  });

  it('should show error status when calculation fails', () => {
    mockUseSuperPackagePriceCalculation.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: new Error('Calculation failed'),
      refetch: vi.fn(),
    });

    const { result } = renderHook(
      () =>
        useQuotePrice({
          linkedPackage: mockLinkedPackage,
          numberOfPeople: 8,
          numberOfNights: 3,
          arrivalDate: '2025-01-15',
          currentPrice: 1000,
          onPriceUpdate: mockOnPriceUpdate,
        }),
      { wrapper: createWrapper() }
    );

    expect(result.current.syncStatus).toBe('error');
    expect(result.current.error).toBe('Calculation failed');
  });

  it('should detect custom price when manually changed', async () => {
    const mockPriceData = {
      price: 1200,
      tierUsed: '6-11 People',
      periodUsed: 'January',
      breakdown: {
        pricePerPerson: 150,
        numberOfPeople: 8,
        totalPrice: 1200,
      },
    };

    mockUseSuperPackagePriceCalculation.mockReturnValue({
      data: mockPriceData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    const { result, rerender } = renderHook(
      ({ currentPrice }) =>
        useQuotePrice({
          linkedPackage: mockLinkedPackage,
          numberOfPeople: 8,
          numberOfNights: 3,
          arrivalDate: '2025-01-15',
          currentPrice,
          onPriceUpdate: mockOnPriceUpdate,
        }),
      { 
        wrapper: createWrapper(),
        initialProps: { currentPrice: 1200 }
      }
    );

    // Initially synced
    await waitFor(() => {
      expect(result.current.syncStatus).toBe('synced');
    });

    // Change price manually
    rerender({ currentPrice: 1500 });

    await waitFor(() => {
      expect(result.current.syncStatus).toBe('custom');
    });
  });

  it('should mark as custom price when action is called', () => {
    mockUseSuperPackagePriceCalculation.mockReturnValue({
      data: {
        price: 1200,
        tierUsed: '6-11 People',
        periodUsed: 'January',
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    const { result } = renderHook(
      () =>
        useQuotePrice({
          linkedPackage: mockLinkedPackage,
          numberOfPeople: 8,
          numberOfNights: 3,
          arrivalDate: '2025-01-15',
          currentPrice: 1200,
          onPriceUpdate: mockOnPriceUpdate,
        }),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.markAsCustomPrice();
    });

    expect(result.current.syncStatus).toBe('custom');
  });

  it('should reset to calculated price when action is called', async () => {
    const mockPriceData = {
      price: 1200,
      tierUsed: '6-11 People',
      periodUsed: 'January',
      breakdown: {
        pricePerPerson: 150,
        numberOfPeople: 8,
        totalPrice: 1200,
      },
    };

    const mockRefetch = vi.fn().mockResolvedValue({ data: mockPriceData });

    mockUseSuperPackagePriceCalculation.mockReturnValue({
      data: mockPriceData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    const { result } = renderHook(
      () =>
        useQuotePrice({
          linkedPackage: mockLinkedPackage,
          numberOfPeople: 8,
          numberOfNights: 3,
          arrivalDate: '2025-01-15',
          currentPrice: 1500,
          onPriceUpdate: mockOnPriceUpdate,
        }),
      { wrapper: createWrapper() }
    );

    // Mark as custom first
    act(() => {
      result.current.markAsCustomPrice();
    });

    expect(result.current.syncStatus).toBe('custom');

    // Reset to calculated
    await act(async () => {
      result.current.resetToCalculated();
    });

    await waitFor(() => {
      expect(mockOnPriceUpdate).toHaveBeenCalledWith(1200);
      expect(result.current.syncStatus).toBe('synced');
    });
  });

  it('should recalculate price when action is called', async () => {
    const mockRefetch = vi.fn().mockResolvedValue({
      data: {
        price: 1300,
        tierUsed: '6-11 People',
        periodUsed: 'January',
      },
    });

    mockUseSuperPackagePriceCalculation.mockReturnValue({
      data: {
        price: 1200,
        tierUsed: '6-11 People',
        periodUsed: 'January',
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    const { result } = renderHook(
      () =>
        useQuotePrice({
          linkedPackage: mockLinkedPackage,
          numberOfPeople: 8,
          numberOfNights: 3,
          arrivalDate: '2025-01-15',
          currentPrice: 1200,
          onPriceUpdate: mockOnPriceUpdate,
        }),
      { wrapper: createWrapper() }
    );

    await act(async () => {
      await result.current.recalculatePrice();
    });

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('should handle ON_REQUEST pricing', () => {
    mockUseSuperPackagePriceCalculation.mockReturnValue({
      data: {
        price: 'ON_REQUEST',
        tierUsed: '6-11 People',
        periodUsed: 'January',
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    const { result } = renderHook(
      () =>
        useQuotePrice({
          linkedPackage: mockLinkedPackage,
          numberOfPeople: 8,
          numberOfNights: 3,
          arrivalDate: '2025-01-15',
          currentPrice: 0,
          onPriceUpdate: mockOnPriceUpdate,
        }),
      { wrapper: createWrapper() }
    );

    expect(result.current.syncStatus).toBe('custom');
    expect(result.current.calculatedPrice).toBe('ON_REQUEST');
  });

  it('should generate validation warnings for invalid parameters', () => {
    mockUseSuperPackagePriceCalculation.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: new Error('Duration not available for this package'),
      refetch: vi.fn(),
    });

    const { result } = renderHook(
      () =>
        useQuotePrice({
          linkedPackage: mockLinkedPackage,
          numberOfPeople: 8,
          numberOfNights: 5,
          arrivalDate: '2025-01-15',
          currentPrice: 1000,
          onPriceUpdate: mockOnPriceUpdate,
        }),
      { wrapper: createWrapper() }
    );

    expect(result.current.validationWarnings.length).toBeGreaterThan(0);
    expect(result.current.isParameterValid).toBe(false);
  });

  it('should not auto-recalculate when autoRecalculate is false', () => {
    mockUseSuperPackagePriceCalculation.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    const { result } = renderHook(
      () =>
        useQuotePrice({
          linkedPackage: mockLinkedPackage,
          numberOfPeople: 8,
          numberOfNights: 3,
          arrivalDate: '2025-01-15',
          currentPrice: 1000,
          onPriceUpdate: mockOnPriceUpdate,
          autoRecalculate: false,
        }),
      { wrapper: createWrapper() }
    );

    // Should not call the price calculation hook
    expect(mockUseSuperPackagePriceCalculation).toHaveBeenCalledWith(null);
  });

  it('should not auto-recalculate when custom price is set', () => {
    const mockRefetch = vi.fn();

    mockUseSuperPackagePriceCalculation.mockReturnValue({
      data: {
        price: 1200,
        tierUsed: '6-11 People',
        periodUsed: 'January',
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    const { result, rerender } = renderHook(
      ({ numberOfPeople }) =>
        useQuotePrice({
          linkedPackage: mockLinkedPackage,
          numberOfPeople,
          numberOfNights: 3,
          arrivalDate: '2025-01-15',
          currentPrice: 1200,
          onPriceUpdate: mockOnPriceUpdate,
        }),
      { 
        wrapper: createWrapper(),
        initialProps: { numberOfPeople: 8 }
      }
    );

    // Mark as custom
    act(() => {
      result.current.markAsCustomPrice();
    });

    // Change parameters
    rerender({ numberOfPeople: 10 });

    // Should not trigger recalculation
    expect(mockRefetch).not.toHaveBeenCalled();
  });
});
