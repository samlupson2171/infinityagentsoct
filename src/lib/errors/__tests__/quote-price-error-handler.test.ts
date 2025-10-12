/**
 * Tests for Quote Price Error Handler
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  QuotePriceErrorHandler,
  createQuotePriceErrorHandler,
  retryWithBackoff,
  withTimeout,
  type ErrorHandlerConfig,
} from '../quote-price-error-handler';
import {
  PackageNotFoundError,
  InvalidParametersError,
  NetworkError,
  CalculationTimeoutError,
  DurationNotAvailableError,
} from '../quote-price-errors';

describe('QuotePriceErrorHandler', () => {
  let mockConfig: ErrorHandlerConfig;

  beforeEach(() => {
    mockConfig = {
      onRetry: vi.fn(),
      onManualPrice: vi.fn(),
      onUnlinkPackage: vi.fn(),
      onAdjustParameters: vi.fn(),
      onSelectDifferentPackage: vi.fn(),
      onDismiss: vi.fn(),
      enableLogging: false, // Disable logging in tests
    };
  });

  describe('handle', () => {
    it('should handle PackageNotFoundError with appropriate actions', () => {
      const handler = new QuotePriceErrorHandler(mockConfig);
      const error = new PackageNotFoundError('pkg-123');
      const result = handler.handle(error);

      expect(result.title).toBe('Package Not Available');
      expect(result.severity).toBe('error');
      expect(result.message).toContain('no longer available');
      expect(result.actions).toHaveLength(4); // select different, unlink, manual price, dismiss
      expect(result.actions.some(a => a.type === 'select_different_package')).toBe(true);
      expect(result.actions.some(a => a.type === 'unlink_package')).toBe(true);
    });

    it('should handle InvalidParametersError with adjust and manual price actions', () => {
      const handler = new QuotePriceErrorHandler(mockConfig);
      const error = new InvalidParametersError('Invalid params', ['Error 1']);
      const result = handler.handle(error);

      expect(result.title).toBe('Invalid Parameters');
      expect(result.severity).toBe('warning');
      expect(result.actions.some(a => a.type === 'adjust_parameters')).toBe(true);
      expect(result.actions.some(a => a.type === 'manual_price')).toBe(true);
    });

    it('should handle NetworkError with retry action', () => {
      const handler = new QuotePriceErrorHandler(mockConfig);
      const error = new NetworkError();
      const result = handler.handle(error);

      expect(result.title).toBe('Connection Error');
      expect(result.severity).toBe('warning');
      expect(result.actions.some(a => a.type === 'retry')).toBe(true);
    });

    it('should handle CalculationTimeoutError with retry action', () => {
      const handler = new QuotePriceErrorHandler(mockConfig);
      const error = new CalculationTimeoutError(5000);
      const result = handler.handle(error);

      expect(result.title).toBe('Calculation Timeout');
      expect(result.severity).toBe('warning');
      expect(result.actions.some(a => a.type === 'retry')).toBe(true);
    });

    it('should handle DurationNotAvailableError', () => {
      const handler = new QuotePriceErrorHandler(mockConfig);
      const error = new DurationNotAvailableError(5, [3, 4, 7]);
      const result = handler.handle(error);

      expect(result.title).toBe('Invalid Duration');
      expect(result.severity).toBe('warning');
      expect(result.message).toContain('not available');
    });

    it('should always include dismiss action', () => {
      const handler = new QuotePriceErrorHandler(mockConfig);
      const error = new NetworkError();
      const result = handler.handle(error);

      expect(result.actions.some(a => a.type === 'dismiss')).toBe(true);
    });

    it('should call action handlers when actions are executed', () => {
      const handler = new QuotePriceErrorHandler(mockConfig);
      const error = new NetworkError();
      const result = handler.handle(error);

      const retryAction = result.actions.find(a => a.type === 'retry');
      retryAction?.handler();

      expect(mockConfig.onRetry).toHaveBeenCalled();
    });

    it('should set appropriate log levels', () => {
      const handler = new QuotePriceErrorHandler(mockConfig);

      const networkError = handler.handle(new NetworkError());
      expect(networkError.logLevel).toBe('warn');

      const invalidParamsError = handler.handle(new InvalidParametersError('Invalid', []));
      expect(invalidParamsError.logLevel).toBe('info');

      const packageNotFoundError = handler.handle(new PackageNotFoundError('pkg-123'));
      expect(packageNotFoundError.logLevel).toBe('error');
    });
  });

  describe('createQuotePriceErrorHandler', () => {
    it('should create handler instance with config', () => {
      const handler = createQuotePriceErrorHandler(mockConfig);
      expect(handler).toBeInstanceOf(QuotePriceErrorHandler);
    });
  });

  describe('retryWithBackoff', () => {
    it('should succeed on first attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const result = await retryWithBackoff(fn, 3, 100);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable errors', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new NetworkError())
        .mockRejectedValueOnce(new NetworkError())
        .mockResolvedValue('success');

      const result = await retryWithBackoff(fn, 3, 100);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should not retry on non-retryable errors', async () => {
      const fn = vi.fn().mockRejectedValue(new PackageNotFoundError('pkg-123'));

      await expect(retryWithBackoff(fn, 3, 100)).rejects.toThrow(PackageNotFoundError);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should throw last error after max retries', async () => {
      const error = new NetworkError('Persistent error');
      const fn = vi.fn().mockRejectedValue(error);

      await expect(retryWithBackoff(fn, 3, 100)).rejects.toThrow(NetworkError);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should use exponential backoff', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new NetworkError())
        .mockRejectedValueOnce(new NetworkError())
        .mockResolvedValue('success');

      const startTime = Date.now();
      await retryWithBackoff(fn, 3, 100);
      const duration = Date.now() - startTime;

      // Should wait ~100ms + ~200ms = ~300ms
      expect(duration).toBeGreaterThanOrEqual(250);
    });
  });

  describe('withTimeout', () => {
    it('should resolve if promise completes before timeout', async () => {
      const promise = Promise.resolve('success');
      const result = await withTimeout(promise, 1000);

      expect(result).toBe('success');
    });

    it('should reject with CalculationTimeoutError if timeout occurs', async () => {
      const promise = new Promise(resolve => setTimeout(resolve, 2000));

      await expect(withTimeout(promise, 100)).rejects.toThrow(CalculationTimeoutError);
    });

    it('should use default timeout of 30 seconds', async () => {
      const promise = Promise.resolve('success');
      const result = await withTimeout(promise);

      expect(result).toBe('success');
    });
  });
});
