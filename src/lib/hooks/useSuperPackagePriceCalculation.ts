/**
 * React Query hook for Super Package Price Calculation
 * Implements caching for price calculations with comprehensive error handling
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { parseApiError, withTimeout } from '@/lib/errors/quote-price-error-handler';
import { startTiming } from '@/lib/performance/quote-price-performance';

export interface PriceCalculationParams {
  packageId: string;
  numberOfPeople: number;
  numberOfNights: number;
  arrivalDate: string;
}

export interface PriceCalculation {
  price: number | 'ON_REQUEST';
  tierUsed: string;
  periodUsed: string;
  breakdown?: {
    pricePerPerson: number;
    numberOfPeople: number;
    totalPrice: number;
  };
}

// Query key factory
export const priceCalculationKeys = {
  all: ['price-calculations'] as const,
  calculation: (params: PriceCalculationParams) => [...priceCalculationKeys.all, params] as const,
};

async function calculatePrice(params: PriceCalculationParams): Promise<PriceCalculation> {
  const endTiming = startTiming('price-calculation-api');
  
  try {
    // Wrap fetch in timeout to prevent hanging requests
    const response = await withTimeout(
      fetch('/api/admin/super-packages/calculate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      }),
      30000 // 30 second timeout
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Create structured error response for parsing
      const error = {
        response: {
          status: response.status,
          data: errorData,
        },
      };
      
      endTiming({ 
        success: false, 
        status: response.status,
        packageId: params.packageId,
      });
      
      throw parseApiError(error);
    }

    const result = await response.json();
    
    endTiming({ 
      success: true, 
      packageId: params.packageId,
      price: result.price,
      wasOnRequest: result.price === 'ON_REQUEST',
    });

    return result;
  } catch (error) {
    endTiming({ 
      success: false, 
      packageId: params.packageId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    // Parse and throw structured error
    throw parseApiError(error);
  }
}

/**
 * Hook to calculate package price with caching
 * Price calculations are cached based on exact parameters
 * This prevents redundant API calls for the same calculation
 */
export function useSuperPackagePriceCalculation(
  params: PriceCalculationParams | null,
  options?: Omit<UseQueryOptions<PriceCalculation, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PriceCalculation, Error>({
    queryKey: params ? priceCalculationKeys.calculation(params) : ['price-calculations', 'disabled'],
    queryFn: () => calculatePrice(params!),
    enabled: !!params && !!params.packageId && !!params.numberOfPeople && !!params.numberOfNights && !!params.arrivalDate,
    staleTime: 10 * 60 * 1000, // 10 minutes - prices don't change frequently
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false, // Don't refetch on focus
    refetchOnMount: false, // Don't refetch on mount if data exists
    retry: 2, // Retry price calculations twice
    ...options,
  });
}
