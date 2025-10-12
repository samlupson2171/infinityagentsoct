/**
 * useQuotePrice Hook
 * Manages price synchronization between quotes and super packages
 * Handles automatic recalculation, custom price detection, and validation
 * Includes comprehensive error handling and recovery strategies
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSuperPackagePriceCalculation } from './useSuperPackagePriceCalculation';
import { useDebounce } from './useDebounce';
import {
  createQuotePriceErrorHandler,
  type ErrorHandlingResult,
} from '@/lib/errors/quote-price-error-handler';
import {
  QuotePriceError,
  PackageNotFoundError,
  InvalidParametersError,
  NetworkError,
  CalculationTimeoutError,
  getUserFriendlyMessage,
} from '@/lib/errors/quote-price-errors';
import { startTiming } from '@/lib/performance/quote-price-performance';
import type {
  UseQuotePriceOptions,
  UseQuotePriceReturn,
  SyncStatus,
  PriceBreakdown,
} from '@/types/quote-price-sync';

/**
 * Hook for managing quote price synchronization with super packages
 * 
 * Features:
 * - Automatic price recalculation on parameter changes (debounced)
 * - Custom price detection and tracking
 * - Parameter validation against package constraints
 * - Manual recalculation and reset actions
 * 
 * @param options - Configuration options for the hook
 * @returns Price sync state and actions
 */
export function useQuotePrice(options: UseQuotePriceOptions): UseQuotePriceReturn {
  const {
    linkedPackage,
    numberOfPeople,
    numberOfNights,
    arrivalDate,
    currentPrice,
    onPriceUpdate,
    autoRecalculate = true,
  } = options;

  // State management
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [isCustomPrice, setIsCustomPrice] = useState(false);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [errorHandlingResult, setErrorHandlingResult] = useState<ErrorHandlingResult | null>(null);

  // Track previous values to detect changes
  const prevParamsRef = useRef({ numberOfPeople, numberOfNights, arrivalDate });
  const initialPriceRef = useRef(currentPrice);

  // Create error handler with recovery actions
  const errorHandler = useRef(
    createQuotePriceErrorHandler({
      onRetry: () => {
        setErrorHandlingResult(null);
        priceQuery.refetch();
      },
      onManualPrice: () => {
        setErrorHandlingResult(null);
        markAsCustomPrice();
      },
      onUnlinkPackage: () => {
        setErrorHandlingResult(null);
        // This would be handled by parent component
        console.info('Unlink package requested');
      },
      onAdjustParameters: () => {
        setErrorHandlingResult(null);
        // This would be handled by parent component
        console.info('Adjust parameters requested');
      },
      onSelectDifferentPackage: () => {
        setErrorHandlingResult(null);
        // This would be handled by parent component
        console.info('Select different package requested');
      },
      onDismiss: () => {
        setErrorHandlingResult(null);
      },
      enableLogging: true,
    })
  ).current;

  // Debounce parameters to prevent excessive API calls (500ms delay)
  const debouncedPeople = useDebounce(numberOfPeople, 500);
  const debouncedNights = useDebounce(numberOfNights, 500);
  const debouncedDate = useDebounce(arrivalDate, 500);

  // Determine if we should fetch price calculation
  const shouldCalculate = 
    linkedPackage !== null && 
    autoRecalculate && 
    !isCustomPrice &&
    debouncedPeople > 0 &&
    debouncedNights > 0 &&
    debouncedDate !== '';

  // Use React Query for price calculation with caching
  const priceQuery = useSuperPackagePriceCalculation(
    shouldCalculate
      ? {
          packageId: linkedPackage!.packageId,
          numberOfPeople: debouncedPeople,
          numberOfNights: debouncedNights,
          arrivalDate: debouncedDate,
        }
      : null
  );

  // Detect parameter changes and set calculating status
  useEffect(() => {
    if (!linkedPackage || isCustomPrice || !autoRecalculate) return;

    const paramsChanged =
      numberOfPeople !== prevParamsRef.current.numberOfPeople ||
      numberOfNights !== prevParamsRef.current.numberOfNights ||
      arrivalDate !== prevParamsRef.current.arrivalDate;

    if (paramsChanged) {
      setSyncStatus('calculating');
      prevParamsRef.current = { numberOfPeople, numberOfNights, arrivalDate };
    }
  }, [numberOfPeople, numberOfNights, arrivalDate, linkedPackage, isCustomPrice, autoRecalculate]);

  // Update price when calculation completes (with performance monitoring)
  useEffect(() => {
    if (!priceQuery.data || isCustomPrice) return;

    const endTiming = startTiming('price-update-ui');

    if (priceQuery.data.price !== 'ON_REQUEST') {
      // Only update if price actually changed to avoid infinite loops
      if (currentPrice !== priceQuery.data.price) {
        onPriceUpdate(priceQuery.data.price);
      }
      setSyncStatus('synced');
    } else {
      // Price is ON_REQUEST, mark as custom to allow manual entry
      setSyncStatus('custom');
    }

    endTiming({
      price: priceQuery.data.price,
      wasOnRequest: priceQuery.data.price === 'ON_REQUEST',
    });
  }, [priceQuery.data, isCustomPrice]);

  // Handle loading state
  useEffect(() => {
    if (priceQuery.isLoading && !isCustomPrice) {
      setSyncStatus('calculating');
    }
  }, [priceQuery.isLoading, isCustomPrice]);

  // Handle error state with comprehensive error handling
  useEffect(() => {
    if (priceQuery.isError && !isCustomPrice) {
      setSyncStatus('error');
      
      // Handle the error and get recovery options
      const result = errorHandler.handle(priceQuery.error);
      setErrorHandlingResult(result);
      
      // Extract validation warnings from error if available
      if (priceQuery.error instanceof InvalidParametersError) {
        setValidationWarnings(priceQuery.error.validationErrors);
      }
    } else if (!priceQuery.isError) {
      // Clear error handling result when error is resolved
      setErrorHandlingResult(null);
    }
  }, [priceQuery.isError, priceQuery.error, isCustomPrice]);

  // Detect manual price changes (custom price)
  useEffect(() => {
    if (!linkedPackage || !priceQuery.data) return;

    // Skip if price is ON_REQUEST (manual entry expected)
    if (priceQuery.data.price === 'ON_REQUEST') return;

    // Check if current price differs from calculated price
    const calculatedPrice = priceQuery.data.price;
    const priceDiffers = Math.abs(currentPrice - calculatedPrice) > 0.01; // Allow for floating point precision

    if (priceDiffers && currentPrice !== initialPriceRef.current) {
      setIsCustomPrice(true);
      setSyncStatus('custom');
    }
  }, [currentPrice, priceQuery.data, linkedPackage]);

  // Validate parameters against package constraints
  useEffect(() => {
    if (!linkedPackage) {
      setValidationWarnings([]);
      return;
    }

    // Validation warnings are now handled by error handling system
    // This effect is kept for future enhancements where we might
    // validate against package details before making API calls
    
    // Clear warnings when parameters are valid and no errors
    if (!priceQuery.isError && validationWarnings.length > 0) {
      setValidationWarnings([]);
    }
  }, [linkedPackage, numberOfPeople, numberOfNights, arrivalDate, priceQuery.isError]);

  // Action: Recalculate price (with performance monitoring)
  const recalculatePrice = useCallback(async () => {
    if (!linkedPackage) return;

    const endTiming = startTiming('price-recalculation');

    setIsCustomPrice(false);
    setSyncStatus('calculating');
    
    try {
      // Trigger a refetch
      await priceQuery.refetch();
      endTiming({ success: true, packageId: linkedPackage.packageId });
    } catch (error) {
      endTiming({ 
        success: false, 
        packageId: linkedPackage.packageId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }, [linkedPackage, priceQuery]);

  // Action: Mark as custom price
  const markAsCustomPrice = useCallback(() => {
    setIsCustomPrice(true);
    setSyncStatus('custom');
  }, []);

  // Action: Reset to calculated price
  const resetToCalculated = useCallback(() => {
    setIsCustomPrice(false);
    
    if (priceQuery.data?.price !== 'ON_REQUEST' && typeof priceQuery.data?.price === 'number') {
      onPriceUpdate(priceQuery.data.price);
      setSyncStatus('synced');
    } else {
      setSyncStatus('calculating');
      priceQuery.refetch();
    }
  }, [priceQuery, onPriceUpdate]);

  // Build price breakdown from query data
  const priceBreakdown: PriceBreakdown | null = priceQuery.data
    ? {
        pricePerPerson: priceQuery.data.breakdown?.pricePerPerson || 0,
        numberOfPeople: priceQuery.data.breakdown?.numberOfPeople || numberOfPeople,
        totalPrice: priceQuery.data.breakdown?.totalPrice || (typeof priceQuery.data.price === 'number' ? priceQuery.data.price : 0),
        tierUsed: priceQuery.data.tierUsed,
        periodUsed: priceQuery.data.periodUsed,
        currency: linkedPackage?.originalPrice !== 'ON_REQUEST' ? 'GBP' : 'GBP', // Default to GBP, should come from package
      }
    : null;

  return {
    // State
    syncStatus: isCustomPrice ? 'custom' : syncStatus,
    calculatedPrice: priceQuery.data?.price ?? null,
    priceBreakdown,
    error: priceQuery.error ? getUserFriendlyMessage(priceQuery.error) : null,

    // Actions
    recalculatePrice,
    markAsCustomPrice,
    resetToCalculated,

    // Validation
    validationWarnings,
    isParameterValid: validationWarnings.length === 0,

    // Error handling (extended return for advanced error handling)
    errorHandlingResult,
    isRetryable: priceQuery.error instanceof NetworkError || 
                 priceQuery.error instanceof CalculationTimeoutError,
  };
}
