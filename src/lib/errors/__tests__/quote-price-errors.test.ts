/**
 * Tests for Quote Price Error Types
 */

import {
  QuotePriceError,
  PackageNotFoundError,
  InvalidParametersError,
  NetworkError,
  CalculationTimeoutError,
  CalculationError,
  DurationNotAvailableError,
  TierLimitExceededError,
  DateOutOfRangeError,
  parseApiError,
  isRetryableError,
  getUserFriendlyMessage,
} from '../quote-price-errors';

describe('Quote Price Error Types', () => {
  describe('QuotePriceError', () => {
    it('should create base error with all properties', () => {
      const error = new QuotePriceError(
        'Test error',
        'TEST_ERROR',
        500,
        true,
        { key: 'value' }
      );

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.isRetryable).toBe(true);
      expect(error.context).toEqual({ key: 'value' });
      expect(error.name).toBe('QuotePriceError');
    });
  });

  describe('PackageNotFoundError', () => {
    it('should create package not found error', () => {
      const error = new PackageNotFoundError('pkg-123');

      expect(error.message).toContain('pkg-123');
      expect(error.code).toBe('PACKAGE_NOT_FOUND');
      expect(error.statusCode).toBe(404);
      expect(error.isRetryable).toBe(false);
      expect(error.context?.packageId).toBe('pkg-123');
    });
  });

  describe('InvalidParametersError', () => {
    it('should create invalid parameters error with validation errors', () => {
      const validationErrors = ['Error 1', 'Error 2'];
      const error = new InvalidParametersError(
        'Invalid params',
        validationErrors
      );

      expect(error.message).toBe('Invalid params');
      expect(error.code).toBe('INVALID_PARAMETERS');
      expect(error.statusCode).toBe(400);
      expect(error.validationErrors).toEqual(validationErrors);
    });
  });

  describe('NetworkError', () => {
    it('should create network error as retryable', () => {
      const error = new NetworkError();

      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.isRetryable).toBe(true);
      expect(error.statusCode).toBe(0);
    });
  });

  describe('CalculationTimeoutError', () => {
    it('should create timeout error with timeout value', () => {
      const error = new CalculationTimeoutError(5000);

      expect(error.message).toContain('5000ms');
      expect(error.code).toBe('CALCULATION_TIMEOUT');
      expect(error.isRetryable).toBe(true);
      expect(error.context?.timeoutMs).toBe(5000);
    });
  });

  describe('DurationNotAvailableError', () => {
    it('should create duration error with available options', () => {
      const error = new DurationNotAvailableError(5, [3, 4, 7]);

      expect(error.message).toContain('5 nights');
      expect(error.validationErrors).toHaveLength(2);
      expect(error.context?.requestedNights).toBe(5);
      expect(error.context?.availableNights).toEqual([3, 4, 7]);
    });
  });

  describe('TierLimitExceededError', () => {
    it('should create tier limit error', () => {
      const error = new TierLimitExceededError(50, 40);

      expect(error.message).toContain('50 people');
      expect(error.message).toContain('40');
      expect(error.context?.requestedPeople).toBe(50);
      expect(error.context?.maxPeople).toBe(40);
    });
  });

  describe('DateOutOfRangeError', () => {
    it('should create date out of range error', () => {
      const error = new DateOutOfRangeError('2024-01-01', ['Summer 2024', 'Winter 2024']);

      expect(error.message).toContain('2024-01-01');
      expect(error.context?.requestedDate).toBe('2024-01-01');
      expect(error.context?.availablePeriods).toEqual(['Summer 2024', 'Winter 2024']);
    });
  });

  describe('parseApiError', () => {
    it('should parse fetch network error', () => {
      const fetchError = new TypeError('fetch failed');
      const error = parseApiError(fetchError);

      expect(error).toBeInstanceOf(NetworkError);
      expect(error.message).toContain('internet connection');
    });

    it('should parse timeout error', () => {
      const timeoutError = { name: 'AbortError' };
      const error = parseApiError(timeoutError);

      expect(error).toBeInstanceOf(CalculationTimeoutError);
    });

    it('should parse 404 response as PackageNotFoundError', () => {
      const apiError = {
        response: {
          status: 404,
          data: {
            error: {
              code: 'PACKAGE_NOT_FOUND',
              message: 'Package not found',
              context: { packageId: 'pkg-123' },
            },
          },
        },
      };

      const error = parseApiError(apiError);

      expect(error).toBeInstanceOf(PackageNotFoundError);
      expect(error.context?.packageId).toBe('pkg-123');
    });

    it('should parse validation error', () => {
      const apiError = {
        response: {
          status: 400,
          data: {
            error: {
              code: 'INVALID_PARAMETERS',
              message: 'Invalid parameters',
              validationErrors: ['Error 1', 'Error 2'],
            },
          },
        },
      };

      const error = parseApiError(apiError);

      expect(error).toBeInstanceOf(InvalidParametersError);
      expect((error as InvalidParametersError).validationErrors).toEqual(['Error 1', 'Error 2']);
    });

    it('should parse duration not available error', () => {
      const apiError = {
        response: {
          status: 400,
          data: {
            error: {
              code: 'DURATION_NOT_AVAILABLE',
              message: 'Duration not available',
              context: {
                requestedNights: 5,
                availableNights: [3, 4, 7],
              },
            },
          },
        },
      };

      const error = parseApiError(apiError);

      expect(error).toBeInstanceOf(DurationNotAvailableError);
    });

    it('should handle generic Error objects', () => {
      const genericError = new Error('Something went wrong');
      const error = parseApiError(genericError);

      expect(error).toBeInstanceOf(CalculationError);
      expect(error.message).toBe('Something went wrong');
    });

    it('should handle unknown error types', () => {
      const unknownError = 'string error';
      const error = parseApiError(unknownError);

      expect(error).toBeInstanceOf(CalculationError);
      expect(error.message).toBe('string error');
    });
  });

  describe('isRetryableError', () => {
    it('should identify retryable errors', () => {
      expect(isRetryableError(new NetworkError())).toBe(true);
      expect(isRetryableError(new CalculationTimeoutError(5000))).toBe(true);
      expect(isRetryableError(new CalculationError('Server error'))).toBe(true);
    });

    it('should identify non-retryable errors', () => {
      expect(isRetryableError(new PackageNotFoundError('pkg-123'))).toBe(false);
      expect(isRetryableError(new InvalidParametersError('Invalid', []))).toBe(false);
    });

    it('should handle TypeError as retryable', () => {
      expect(isRetryableError(new TypeError('fetch failed'))).toBe(true);
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('should return friendly message for PackageNotFoundError', () => {
      const error = new PackageNotFoundError('pkg-123');
      const message = getUserFriendlyMessage(error);

      expect(message).toContain('no longer available');
      expect(message).toContain('select a different package');
    });

    it('should return friendly message for DurationNotAvailableError', () => {
      const error = new DurationNotAvailableError(5, [3, 4, 7]);
      const message = getUserFriendlyMessage(error);

      expect(message).toContain('not available');
      expect(message).toContain('3, 4, 7');
    });

    it('should return friendly message for TierLimitExceededError', () => {
      const error = new TierLimitExceededError(50, 40);
      const message = getUserFriendlyMessage(error);

      expect(message).toContain('exceeds');
      expect(message).toContain('40');
    });

    it('should return friendly message for NetworkError', () => {
      const error = new NetworkError();
      const message = getUserFriendlyMessage(error);

      expect(message).toContain('internet connection');
    });

    it('should return friendly message for CalculationTimeoutError', () => {
      const error = new CalculationTimeoutError(5000);
      const message = getUserFriendlyMessage(error);

      expect(message).toContain('longer than expected');
    });

    it('should return generic message for unknown errors', () => {
      const error = new Error('Unknown');
      const message = getUserFriendlyMessage(error);

      expect(message).toContain('unexpected error');
    });
  });
});
