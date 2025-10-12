import { describe, it, expect } from 'vitest';
import {
  SuperPackageError,
  PackageValidationError,
  CSVImportError,
  PriceCalculationError,
  PackageNotFoundError,
  PackageInUseError,
  PackageUnauthorizedError,
  PricingMatrixError,
  PackageLinkingError,
  PackageDatabaseError,
  isSuperPackageError,
  getErrorMessage,
  getErrorStatusCode,
} from '../super-package-errors';
import {
  handleApiError,
  validateRequiredFields,
  validateAuthorization,
  successResponse,
  errorResponse,
} from '../super-package-error-handler';

describe('SuperPackageError Classes', () => {
  it('should create SuperPackageError with correct properties', () => {
    const error = new SuperPackageError('Test error', 'TEST_CODE', 400, { detail: 'test' });
    
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.statusCode).toBe(400);
    expect(error.details).toEqual({ detail: 'test' });
    expect(error.name).toBe('SuperPackageError');
  });

  it('should create PackageValidationError', () => {
    const error = new PackageValidationError('name', 'Name is required', 'REQUIRED_FIELD');
    
    expect(error.field).toBe('name');
    expect(error.message).toBe('Name is required');
    expect(error.validationCode).toBe('REQUIRED_FIELD');
    expect(error.statusCode).toBe(400);
  });

  it('should create CSVImportError with line and column', () => {
    const error = new CSVImportError(5, 'price', 'Invalid price format');
    
    expect(error.line).toBe(5);
    expect(error.column).toBe('price');
    expect(error.message).toContain('Line 5');
    expect(error.message).toContain('Column price');
  });

  it('should create PriceCalculationError', () => {
    const error = new PriceCalculationError('No matching tier found', { people: 5 });
    
    expect(error.reason).toBe('No matching tier found');
    expect(error.details).toEqual({ people: 5 });
    expect(error.statusCode).toBe(400);
  });

  it('should create PackageNotFoundError', () => {
    const error = new PackageNotFoundError('123');
    
    expect(error.message).toContain('123');
    expect(error.statusCode).toBe(404);
  });

  it('should create PackageInUseError', () => {
    const error = new PackageInUseError('123', 5);
    
    expect(error.linkedQuotesCount).toBe(5);
    expect(error.message).toContain('5 quote(s)');
    expect(error.statusCode).toBe(409);
  });

  it('should create PackageUnauthorizedError', () => {
    const error = new PackageUnauthorizedError('delete package');
    
    expect(error.message).toContain('delete package');
    expect(error.statusCode).toBe(403);
  });
});

describe('Error Utility Functions', () => {
  it('should identify SuperPackageError', () => {
    const error = new SuperPackageError('Test', 'TEST', 400);
    expect(isSuperPackageError(error)).toBe(true);
    
    const regularError = new Error('Test');
    expect(isSuperPackageError(regularError)).toBe(false);
  });

  it('should get error message from SuperPackageError', () => {
    const error = new SuperPackageError('Custom message', 'TEST', 400);
    expect(getErrorMessage(error)).toBe('Custom message');
  });

  it('should get error message from regular Error', () => {
    const error = new Error('Regular error');
    expect(getErrorMessage(error)).toBe('Regular error');
  });

  it('should get default error message for unknown error', () => {
    expect(getErrorMessage('string error')).toBe('An unexpected error occurred');
  });

  it('should get status code from SuperPackageError', () => {
    const error = new SuperPackageError('Test', 'TEST', 404);
    expect(getErrorStatusCode(error)).toBe(404);
  });

  it('should get default status code for regular error', () => {
    const error = new Error('Test');
    expect(getErrorStatusCode(error)).toBe(500);
  });
});

describe('Validation Functions', () => {
  it('should validate required fields successfully', () => {
    const data = { name: 'Test', destination: 'Paris' };
    
    expect(() => {
      validateRequiredFields(data, ['name', 'destination'], 'TEST');
    }).not.toThrow();
  });

  it('should throw error for missing required field', () => {
    const data = { name: 'Test' };
    
    expect(() => {
      validateRequiredFields(data, ['name', 'destination'], 'TEST');
    }).toThrow(PackageValidationError);
  });

  it('should throw error for empty required field', () => {
    const data = { name: '', destination: 'Paris' };
    
    expect(() => {
      validateRequiredFields(data, ['name', 'destination'], 'TEST');
    }).toThrow(PackageValidationError);
  });

  it('should validate nested required fields', () => {
    const data = { user: { name: 'Test' } };
    
    expect(() => {
      validateRequiredFields(data, ['user.name'], 'TEST');
    }).not.toThrow();
  });

  it('should throw error for missing nested field', () => {
    const data = { user: {} };
    
    expect(() => {
      validateRequiredFields(data, ['user.name'], 'TEST');
    }).toThrow(PackageValidationError);
  });

  it('should validate authorization successfully', () => {
    expect(() => {
      validateAuthorization('admin');
    }).not.toThrow();
  });

  it('should throw error for unauthorized user', () => {
    expect(() => {
      validateAuthorization('user');
    }).toThrow(PackageUnauthorizedError);
  });

  it('should throw error for undefined role', () => {
    expect(() => {
      validateAuthorization(undefined);
    }).toThrow(PackageUnauthorizedError);
  });
});

describe('Response Functions', () => {
  it('should create success response', () => {
    const response = successResponse({ data: 'test' }, 200);
    
    expect(response.status).toBe(200);
  });

  it('should create error response', () => {
    const response = errorResponse('Error message', 'ERROR_CODE', 400, { detail: 'test' });
    
    expect(response.status).toBe(400);
  });
});

describe('Error Serialization', () => {
  it('should serialize SuperPackageError to JSON', () => {
    const error = new SuperPackageError('Test error', 'TEST_CODE', 400, { detail: 'test' });
    const json = error.toJSON();
    
    expect(json).toEqual({
      error: 'SuperPackageError',
      message: 'Test error',
      code: 'TEST_CODE',
      statusCode: 400,
      details: { detail: 'test' },
    });
  });

  it('should serialize PackageValidationError to JSON', () => {
    const error = new PackageValidationError('name', 'Name is required', 'REQUIRED');
    const json = error.toJSON();
    
    expect(json.error).toBe('PackageValidationError');
    expect(json.details).toHaveProperty('field', 'name');
  });
});
