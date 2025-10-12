/**
 * Hook for optimistic price updates
 * Provides immediate UI feedback while waiting for server response
 */

import { useCallback, useState, useTransition } from 'react';
import { startTiming } from '@/lib/performance/quote-price-performance';

interface OptimisticPriceState {
  price: number | null;
  isOptimistic: boolean;
  isPending: boolean;
}

interface UseOptimisticPriceUpdateOptions {
  onPriceUpdate: (price: number) => void;
  calculatePrice: () => Promise<number | 'ON_REQUEST'>;
}

/**
 * Hook to handle optimistic price updates
 * Shows immediate feedback while calculation is in progress
 */
export function useOptimisticPriceUpdate(options: UseOptimisticPriceUpdateOptions) {
  const { onPriceUpdate, calculatePrice } = options;
  const [optimisticState, setOptimisticState] = useState<OptimisticPriceState>({
    price: null,
    isOptimistic: false,
    isPending: false,
  });
  const [isPending, startTransition] = useTransition();

  /**
   * Update price with optimistic UI
   * Shows estimated price immediately, then updates with actual price
   */
  const updatePriceOptimistically = useCallback(
    async (estimatedPrice?: number) => {
      const endTiming = startTiming('optimistic-price-update');

      // Show optimistic price immediately if provided
      if (estimatedPrice !== undefined) {
        startTransition(() => {
          setOptimisticState({
            price: estimatedPrice,
            isOptimistic: true,
            isPending: true,
          });
          onPriceUpdate(estimatedPrice);
        });
      } else {
        setOptimisticState((prev) => ({
          ...prev,
          isPending: true,
        }));
      }

      try {
        // Calculate actual price
        const actualPrice = await calculatePrice();

        if (actualPrice !== 'ON_REQUEST') {
          // Update with actual price
          startTransition(() => {
            setOptimisticState({
              price: actualPrice,
              isOptimistic: false,
              isPending: false,
            });
            onPriceUpdate(actualPrice);
          });

          endTiming({
            success: true,
            hadEstimate: estimatedPrice !== undefined,
            estimatedPrice,
            actualPrice,
            difference: estimatedPrice !== undefined ? Math.abs(actualPrice - estimatedPrice) : 0,
          });
        } else {
          // Price is ON_REQUEST
          setOptimisticState({
            price: null,
            isOptimistic: false,
            isPending: false,
          });

          endTiming({
            success: true,
            wasOnRequest: true,
          });
        }
      } catch (error) {
        // Revert optimistic update on error
        setOptimisticState({
          price: null,
          isOptimistic: false,
          isPending: false,
        });

        endTiming({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        throw error;
      }
    },
    [calculatePrice, onPriceUpdate]
  );

  /**
   * Clear optimistic state
   */
  const clearOptimisticState = useCallback(() => {
    setOptimisticState({
      price: null,
      isOptimistic: false,
      isPending: false,
    });
  }, []);

  return {
    optimisticState,
    updatePriceOptimistically,
    clearOptimisticState,
    isPending: isPending || optimisticState.isPending,
  };
}
