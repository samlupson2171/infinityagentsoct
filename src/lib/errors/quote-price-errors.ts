/**
 * Error types and classes for Quote-Package Price Integration
 * Provides structured error handling with specific error types
 */

/**
 * Base error class for quote price operations
 */
export class QuotePriceError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isRetryable: boolean;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    isRetryable: boolean = false,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'QuotePriceError';
    this.code = code;
    this.statusCode = statusCode;
    this.isRetryable = isRetryable;
    this.context = context;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, QuotePriceError);
    }
  }
}

/**
 * Error when package is not found
 */
export class PackageNotFoundError extends QuotePriceError {
  constructor(packageId: string, context?: Record<string, any>) {
    super(
      `Package with ID "${packageId}" not found or has been deleted`,
      'PACKAGE_NOT_FOUND',
      404,
      false,
      { packageId, ...context }
    );
    this.name = 'PackageNotFoundError';
  }
}

/**
 * Error when parameters are invalid for the package
 */
export class InvalidParametersError extends QuotePriceError {
  public readonly validationErrors: string[];

  constructor(
    message: string,
    validationErrors: string[],
    context?: Record<string, any>
  ) {
    super(
      message,
      'INVALID_PARAMETERS',
      400,
      false,
      { validationErrors, ...context }
    );
    this.name = 'InvalidParametersError';
    this.validationErrors = validationErrors;
  }
}

/**
 * Error when network request fails
 */
export class NetworkError extends QuotePriceError {
  constructor(message: string = 'Network request failed', context?: Record<string, any>) {
    super(
      message,
      'NETWORK_ERROR',
      0,
      true, // Network errors are retryable
      context
    );
    this.name = 'NetworkError';
  }
}

/**
 * Error when calculation times out
 */
export class CalculationTimeoutError extends QuotePriceError {
  constructor(timeoutMs: number, context?: Record<string, any>) {
    super(
      `Price calculation timed out after ${timeoutMs}ms`,
      'CALCULATION_TIMEOUT',
      408,
      true, // Timeouts are retryable
      { timeoutMs, ...context }
    );
    this.name = 'CalculationTimeoutError';
  }
}

/**
 * Error when price calculation fails on server
 */
export class CalculationError extends QuotePriceError {
  constructor(message: string, context?: Record<string, any>) {
    super(
      message,
      'CALCULATION_ERROR',
      500,
      true, // Server errors might be transient
      context
    );
    this.name = 'CalculationError';
  }
}

/**
 * Error when package pricing has changed
 */
export class PriceChangedError extends QuotePriceError {
  public readonly oldPrice: number;
  public readonly newPrice: number;

  constructor(oldPrice: number, newPrice: number, context?: Record<string, any>) {
    super(
      `Package pricing has changed from ${oldPrice} to ${newPrice}`,
      'PRICE_CHANGED',
      200,
      false,
      { oldPrice, newPrice, ...context }
    );
    this.name = 'PriceChangedError';
    this.oldPrice = oldPrice;
    this.newPrice = newPrice;
  }
}

/**
 * Error when duration is not available in package
 */
export class DurationNotAvailableError extends InvalidParametersError {
  constructor(
    requestedNights: number,
    availableNights: number[],
    context?: Record<string, any>
  ) {
    super(
      `${requestedNights} nights is not available for this package`,
      [
        `Requested duration: ${requestedNights} nights`,
        `Available durations: ${availableNights.join(', ')} nights`,
      ],
      { requestedNights, availableNights, ...context }
    );
    this.name = 'DurationNotAvailableError';
  }
}

/**
 * Error when number of people exceeds package tier limits
 */
export class TierLimitExceededError extends InvalidParametersError {
  constructor(
    requestedPeople: number,
    maxPeople: number,
    context?: Record<string, any>
  ) {
    super(
      `${requestedPeople} people exceeds the maximum tier limit of ${maxPeople}`,
      [
        `Requested people: ${requestedPeople}`,
        `Maximum tier limit: ${maxPeople}`,
      ],
      { requestedPeople, maxPeople, ...context }
    );
    this.name = 'TierLimitExceededError';
  }
}

/**
 * Error when date is outside pricing periods
 */
export class DateOutOfRangeError extends InvalidParametersError {
  constructor(
    requestedDate: string,
    availablePeriods: string[],
    context?: Record<string, any>
  ) {
    super(
      `Date ${requestedDate} is outside available pricing periods`,
      [
        `Requested date: ${requestedDate}`,
        `Available periods: ${availablePeriods.join(', ')}`,
      ],
      { requestedDate, availablePeriods, ...context }
    );
    this.name = 'DateOutOfRangeError';
  }
}

/**
 * Parse error from API response and create appropriate error instance
 */
export function parseApiError(error: any): QuotePriceError {
  // Handle fetch errors (network issues)
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new NetworkError('Unable to connect to server. Please check your internet connection.');
  }

  // Handle timeout errors
  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    return new CalculationTimeoutError(30000);
  }

  // Parse structured error response
  if (error.response) {
    const { status, data } = error.response;
    const message = data?.error?.message || data?.message || 'An error occurred';
    const code = data?.error?.code || 'UNKNOWN_ERROR';
    const context = data?.error?.context || {};

    // Map to specific error types based on code or status
    switch (code) {
      case 'PACKAGE_NOT_FOUND':
        return new PackageNotFoundError(context.packageId || 'unknown', context);
      
      case 'INVALID_PARAMETERS':
      case 'VALIDATION_ERROR':
        return new InvalidParametersError(
          message,
          data?.error?.validationErrors || [message],
          context
        );
      
      case 'DURATION_NOT_AVAILABLE':
        return new DurationNotAvailableError(
          context.requestedNights,
          context.availableNights || [],
          context
        );
      
      case 'TIER_LIMIT_EXCEEDED':
        return new TierLimitExceededError(
          context.requestedPeople,
          context.maxPeople,
          context
        );
      
      case 'DATE_OUT_OF_RANGE':
        return new DateOutOfRangeError(
          context.requestedDate,
          context.availablePeriods || [],
          context
        );
      
      case 'NETWORK_ERROR':
        return new NetworkError(message, context);
      
      case 'CALCULATION_TIMEOUT':
        return new CalculationTimeoutError(context.timeoutMs || 30000, context);
      
      default:
        if (status === 404) {
          return new PackageNotFoundError(context.packageId || 'unknown', context);
        }
        if (status === 400) {
          return new InvalidParametersError(message, [message], context);
        }
        if (status === 408) {
          return new CalculationTimeoutError(30000, context);
        }
        return new CalculationError(message, context);
    }
  }

  // Handle Error objects
  if (error instanceof Error) {
    return new CalculationError(error.message, { originalError: error.name });
  }

  // Fallback for unknown errors
  return new CalculationError(
    typeof error === 'string' ? error : 'An unknown error occurred'
  );
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: any): boolean {
  if (error instanceof QuotePriceError) {
    return error.isRetryable;
  }
  
  // Network errors and timeouts are generally retryable
  if (error instanceof TypeError || error.name === 'AbortError') {
    return true;
  }
  
  return false;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: any): string {
  if (error instanceof PackageNotFoundError) {
    return 'The selected package is no longer available. Please select a different package.';
  }
  
  if (error instanceof DurationNotAvailableError) {
    return `The selected duration is not available. Please choose from: ${error.context?.availableNights?.join(', ')} nights.`;
  }
  
  if (error instanceof TierLimitExceededError) {
    return `The number of people exceeds the package limit. Maximum: ${error.context?.maxPeople} people.`;
  }
  
  if (error instanceof DateOutOfRangeError) {
    return 'The selected date is outside available pricing periods. Please choose a different date.';
  }
  
  if (error instanceof NetworkError) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }
  
  if (error instanceof CalculationTimeoutError) {
    return 'Price calculation is taking longer than expected. Please try again.';
  }
  
  if (error instanceof InvalidParametersError) {
    return error.message;
  }
  
  if (error instanceof QuotePriceError) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again or contact support.';
}
