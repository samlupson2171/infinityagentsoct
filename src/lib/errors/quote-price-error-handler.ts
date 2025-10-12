/**
 * Error Handler for Quote-Package Price Integration
 * Provides error recovery strategies and logging
 */

import {
  QuotePriceError,
  PackageNotFoundError,
  InvalidParametersError,
  NetworkError,
  CalculationTimeoutError,
  DurationNotAvailableError,
  TierLimitExceededError,
  DateOutOfRangeError,
  parseApiError,
  isRetryableError,
  getUserFriendlyMessage,
} from './quote-price-errors';

/**
 * Error recovery action types
 */
export type ErrorRecoveryAction =
  | { type: 'retry'; label: string; handler: () => void }
  | { type: 'manual_price'; label: string; handler: () => void }
  | { type: 'unlink_package'; label: string; handler: () => void }
  | { type: 'adjust_parameters'; label: string; handler: () => void }
  | { type: 'select_different_package'; label: string; handler: () => void }
  | { type: 'dismiss'; label: string; handler: () => void };

/**
 * Error handling result
 */
export interface ErrorHandlingResult {
  message: string;
  title: string;
  severity: 'error' | 'warning' | 'info';
  actions: ErrorRecoveryAction[];
  shouldLog: boolean;
  logLevel: 'error' | 'warn' | 'info';
  context?: Record<string, any>;
}

/**
 * Error handler configuration
 */
export interface ErrorHandlerConfig {
  onRetry?: () => void;
  onManualPrice?: () => void;
  onUnlinkPackage?: () => void;
  onAdjustParameters?: () => void;
  onSelectDifferentPackage?: () => void;
  onDismiss?: () => void;
  enableLogging?: boolean;
}

/**
 * Main error handler for quote price operations
 */
export class QuotePriceErrorHandler {
  private config: ErrorHandlerConfig;

  constructor(config: ErrorHandlerConfig = {}) {
    this.config = {
      enableLogging: true,
      ...config,
    };
  }

  /**
   * Handle an error and return recovery options
   */
  handle(error: any): ErrorHandlingResult {
    // Parse the error into a structured format
    const parsedError = error instanceof QuotePriceError 
      ? error 
      : parseApiError(error);

    // Log the error if enabled
    if (this.config.enableLogging) {
      this.logError(parsedError);
    }

    // Generate recovery actions based on error type
    const actions = this.getRecoveryActions(parsedError);

    // Build the result
    return {
      message: getUserFriendlyMessage(parsedError),
      title: this.getErrorTitle(parsedError),
      severity: this.getErrorSeverity(parsedError),
      actions,
      shouldLog: true,
      logLevel: this.getLogLevel(parsedError),
      context: parsedError.context,
    };
  }

  /**
   * Get appropriate error title
   */
  private getErrorTitle(error: QuotePriceError): string {
    if (error instanceof PackageNotFoundError) {
      return 'Package Not Available';
    }
    if (error instanceof DurationNotAvailableError) {
      return 'Invalid Duration';
    }
    if (error instanceof TierLimitExceededError) {
      return 'Too Many People';
    }
    if (error instanceof DateOutOfRangeError) {
      return 'Date Not Available';
    }
    if (error instanceof NetworkError) {
      return 'Connection Error';
    }
    if (error instanceof CalculationTimeoutError) {
      return 'Calculation Timeout';
    }
    if (error instanceof InvalidParametersError) {
      return 'Invalid Parameters';
    }
    return 'Price Calculation Error';
  }

  /**
   * Get error severity level
   */
  private getErrorSeverity(error: QuotePriceError): 'error' | 'warning' | 'info' {
    if (error instanceof PackageNotFoundError) {
      return 'error';
    }
    if (error instanceof NetworkError || error instanceof CalculationTimeoutError) {
      return 'warning'; // Transient errors
    }
    if (error instanceof InvalidParametersError) {
      return 'warning'; // User can fix these
    }
    return 'error';
  }

  /**
   * Get log level for error
   */
  private getLogLevel(error: QuotePriceError): 'error' | 'warn' | 'info' {
    if (error instanceof NetworkError || error instanceof CalculationTimeoutError) {
      return 'warn'; // Transient issues
    }
    if (error instanceof InvalidParametersError) {
      return 'info'; // User input issues
    }
    return 'error'; // System errors
  }

  /**
   * Generate recovery actions based on error type
   */
  private getRecoveryActions(error: QuotePriceError): ErrorRecoveryAction[] {
    const actions: ErrorRecoveryAction[] = [];

    // Package not found - offer to unlink or select different package
    if (error instanceof PackageNotFoundError) {
      if (this.config.onSelectDifferentPackage) {
        actions.push({
          type: 'select_different_package',
          label: 'Select Different Package',
          handler: this.config.onSelectDifferentPackage,
        });
      }
      if (this.config.onUnlinkPackage) {
        actions.push({
          type: 'unlink_package',
          label: 'Unlink Package',
          handler: this.config.onUnlinkPackage,
        });
      }
      if (this.config.onManualPrice) {
        actions.push({
          type: 'manual_price',
          label: 'Enter Manual Price',
          handler: this.config.onManualPrice,
        });
      }
    }

    // Invalid parameters - offer to adjust or use manual price
    else if (error instanceof InvalidParametersError) {
      if (this.config.onAdjustParameters) {
        actions.push({
          type: 'adjust_parameters',
          label: 'Adjust Parameters',
          handler: this.config.onAdjustParameters,
        });
      }
      if (this.config.onManualPrice) {
        actions.push({
          type: 'manual_price',
          label: 'Use Custom Price',
          handler: this.config.onManualPrice,
        });
      }
    }

    // Network or timeout errors - offer retry
    else if (error instanceof NetworkError || error instanceof CalculationTimeoutError) {
      if (this.config.onRetry) {
        actions.push({
          type: 'retry',
          label: 'Retry',
          handler: this.config.onRetry,
        });
      }
      if (this.config.onManualPrice) {
        actions.push({
          type: 'manual_price',
          label: 'Enter Manual Price',
          handler: this.config.onManualPrice,
        });
      }
    }

    // Generic errors - offer retry and manual price
    else {
      if (isRetryableError(error) && this.config.onRetry) {
        actions.push({
          type: 'retry',
          label: 'Retry',
          handler: this.config.onRetry,
        });
      }
      if (this.config.onManualPrice) {
        actions.push({
          type: 'manual_price',
          label: 'Enter Manual Price',
          handler: this.config.onManualPrice,
        });
      }
    }

    // Always offer dismiss option
    if (this.config.onDismiss) {
      actions.push({
        type: 'dismiss',
        label: 'Dismiss',
        handler: this.config.onDismiss,
      });
    }

    return actions;
  }

  /**
   * Log error with appropriate level
   */
  private logError(error: QuotePriceError): void {
    const logData = {
      name: error.name,
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      isRetryable: error.isRetryable,
      context: error.context,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    };

    // Use appropriate console method based on severity
    if (error instanceof NetworkError || error instanceof CalculationTimeoutError) {
      console.warn('[QuotePriceError]', logData);
    } else if (error instanceof InvalidParametersError) {
      console.info('[QuotePriceError]', logData);
    } else {
      console.error('[QuotePriceError]', logData);
    }

    // In production, you might want to send to error tracking service
    if (typeof window !== 'undefined' && (window as any).errorTracker) {
      (window as any).errorTracker.captureException(error, {
        tags: {
          component: 'quote-price-integration',
          errorCode: error.code,
        },
        extra: logData,
      });
    }
  }
}

/**
 * Create a configured error handler instance
 */
export function createQuotePriceErrorHandler(
  config: ErrorHandlerConfig
): QuotePriceErrorHandler {
  return new QuotePriceErrorHandler(config);
}

/**
 * Retry helper with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if error is not retryable
      if (!isRetryableError(error)) {
        throw error;
      }
      
      // Don't wait after last attempt
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

/**
 * Timeout wrapper for async operations
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new CalculationTimeoutError(timeoutMs));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}
