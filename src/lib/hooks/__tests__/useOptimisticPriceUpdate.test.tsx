/**
 * Tests for useOptimisticPriceUpdate hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOptimisticPriceUpdate } from '../useOptimisticPriceUpdate';

describe('useOptimisticPriceUpdate', () => {
  let mockOnPriceUpdate: ReturnType<typeof vi.fn>;
  let mockCalculatePrice: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnPriceUpdate = vi.fn();
    mockCalculatePrice = vi.fn();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() =>
      useOptimisticPriceUpdate({
        onPriceUpdate: mockOnPriceUpdate,
        calculatePrice: mockCalculatePrice,
      })
    );

    expect(result.current.optimisticState).toEqual({
      price: null,
      isOptimistic: false,
      isPending: false,
    });
    expect(result.current.isPending).toBe(false);
  });

  it('should show optimistic price immediately', async () => {
    mockCalculatePrice.mockResolvedValue(150);

    const { result } = renderHook(() =>
      useOptimisticPriceUpdate({
        onPriceUpdate: mockOnPriceUpdate,
        calculatePrice: mockCalculatePrice,
      })
    );

    act(() => {
      result.current.updatePriceOptimistically(145);
    });

    // Should show optimistic price immediately
    await waitFor(() => {
      expect(result.current.optimisticState.isOptimistic).toBe(true);
    });

    expect(mockOnPriceUpdate).toHaveBeenCalledWith(145);
  });

  it('should update with actual price after calculation', async () => {
    mockCalculatePrice.mockResolvedValue(150);

    const { result } = renderHook(() =>
      useOptimisticPriceUpdate({
        onPriceUpdate: mockOnPriceUpdate,
        calculatePrice: mockCalculatePrice,
      })
    );

    await act(async () => {
      await result.current.updatePriceOptimistically(145);
    });

    // Should update with actual price
    await waitFor(() => {
      expect(result.current.optimisticState.price).toBe(150);
      expect(result.current.optimisticState.isOptimistic).toBe(false);
      expect(result.current.optimisticState.isPending).toBe(false);
    });

    expect(mockOnPriceUpdate).toHaveBeenCalledWith(150);
  });

  it('should handle calculation without optimistic price', async () => {
    mockCalculatePrice.mockResolvedValue(200);

    const { result } = renderHook(() =>
      useOptimisticPriceUpdate({
        onPriceUpdate: mockOnPriceUpdate,
        calculatePrice: mockCalculatePrice,
      })
    );

    await act(async () => {
      await result.current.updatePriceOptimistically();
    });

    await waitFor(() => {
      expect(result.current.optimisticState.price).toBe(200);
      expect(result.current.optimisticState.isOptimistic).toBe(false);
    });

    expect(mockOnPriceUpdate).toHaveBeenCalledWith(200);
  });

  it('should handle ON_REQUEST price', async () => {
    mockCalculatePrice.mockResolvedValue('ON_REQUEST');

    const { result } = renderHook(() =>
      useOptimisticPriceUpdate({
        onPriceUpdate: mockOnPriceUpdate,
        calculatePrice: mockCalculatePrice,
      })
    );

    await act(async () => {
      await result.current.updatePriceOptimistically(100);
    });

    await waitFor(() => {
      expect(result.current.optimisticState.price).toBe(null);
      expect(result.current.optimisticState.isOptimistic).toBe(false);
      expect(result.current.optimisticState.isPending).toBe(false);
    });
  });

  it('should revert optimistic update on error', async () => {
    mockCalculatePrice.mockRejectedValue(new Error('Calculation failed'));

    const { result } = renderHook(() =>
      useOptimisticPriceUpdate({
        onPriceUpdate: mockOnPriceUpdate,
        calculatePrice: mockCalculatePrice,
      })
    );

    await act(async () => {
      try {
        await result.current.updatePriceOptimistically(100);
      } catch (error) {
        // Expected error
      }
    });

    await waitFor(() => {
      expect(result.current.optimisticState.price).toBe(null);
      expect(result.current.optimisticState.isOptimistic).toBe(false);
      expect(result.current.optimisticState.isPending).toBe(false);
    });
  });

  it('should clear optimistic state', async () => {
    mockCalculatePrice.mockResolvedValue(150);

    const { result } = renderHook(() =>
      useOptimisticPriceUpdate({
        onPriceUpdate: mockOnPriceUpdate,
        calculatePrice: mockCalculatePrice,
      })
    );

    await act(async () => {
      await result.current.updatePriceOptimistically(145);
    });

    act(() => {
      result.current.clearOptimisticState();
    });

    expect(result.current.optimisticState).toEqual({
      price: null,
      isOptimistic: false,
      isPending: false,
    });
  });

  it('should set isPending during calculation', async () => {
    let resolveCalculation: (value: number) => void;
    const calculationPromise = new Promise<number>((resolve) => {
      resolveCalculation = resolve;
    });
    mockCalculatePrice.mockReturnValue(calculationPromise);

    const { result } = renderHook(() =>
      useOptimisticPriceUpdate({
        onPriceUpdate: mockOnPriceUpdate,
        calculatePrice: mockCalculatePrice,
      })
    );

    act(() => {
      result.current.updatePriceOptimistically(100);
    });

    // Should be pending during calculation
    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    // Resolve calculation
    await act(async () => {
      resolveCalculation!(150);
      await calculationPromise;
    });

    // Should not be pending after calculation
    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });
});
