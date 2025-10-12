/**
 * Custom error classes for Super Package operations
 * Provides structured error handling with user-friendly messages
 */

/**
 * Base error class for all super package operations
 */
export class SuperPackageError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'SuperPackageError';
    Object.setPrototypeOf(this, SuperPackageError.prototype);
  }

  toJSON() {
    return {
      error: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

/**
 * Error thrown when package validation fails
 */
export class PackageValidationError extends SuperPackageError {
  constructor(
    public field: string,
    message: string,
    public validationCode: string,
    details?: any
  ) {
    super(
      message,
      `VALIDATION_ERROR_${validationCode}`,
      400,
      { field, ...details }
    );
    this.name = 'PackageValidationError';
    Object.setPrototypeOf(this, PackageValidationError.prototype);
  }
}

/**
 * Error thrown when CSV import fails
 */
export class CSVImportError extends SuperPackageError {
  constructor(
    public line?: number,
    public column?: string,
    message?: string,
    details?: any
  ) {
    const errorMessage = line && column
      ? `CSV Import Error at Line ${line}, Column ${column}: ${message}`
      : message || 'CSV import failed';
    
    super(
      errorMessage,
      'CSV_IMPORT_ERROR',
      400,
      { line, column, ...details }
    );
    this.name = 'CSVImportError';
    Object.setPrototypeOf(this, CSVImportError.prototype);
  }
}

/**
 * Error thrown when price calculation fails
 */
export class PriceCalculationError extends SuperPackageError {
  constructor(
    public reason: string,
    details?: any
  ) {
    super(
      `Price calculation failed: ${reason}`,
      'PRICE_CALCULATION_ERROR',
      400,
      details
    );
    this.name = 'PriceCalculationError';
    Object.setPrototypeOf(this, PriceCalculationError.prototype);
  }
}

/**
 * Error thrown when package is not found
 */
export class PackageNotFoundError extends SuperPackageError {
  constructor(packageId: string) {
    super(
      `Super package not found: ${packageId}`,
      'PACKAGE_NOT_FOUND',
      404,
      { packageId }
    );
    this.name = 'PackageNotFoundError';
    Object.setPrototypeOf(this, PackageNotFoundError.prototype);
  }
}

/**
 * Error thrown when attempting to delete a package with linked quotes
 */
export class PackageInUseError extends SuperPackageError {
  constructor(
    packageId: string,
    public linkedQuotesCount: number
  ) {
    super(
      `Cannot delete package: ${linkedQuotesCount} quote(s) are linked to this package`,
      'PACKAGE_IN_USE',
      409,
      { packageId, linkedQuotesCount }
    );
    this.name = 'PackageInUseError';
    Object.setPrototypeOf(this, PackageInUseError.prototype);
  }
}

/**
 * Error thrown when package operation is unauthorized
 */
export class PackageUnauthorizedError extends SuperPackageError {
  constructor(operation: string) {
    super(
      `Unauthorized to perform operation: ${operation}`,
      'PACKAGE_UNAUTHORIZED',
      403,
      { operation }
    );
    this.name = 'PackageUnauthorizedError';
    Object.setPrototypeOf(this, PackageUnauthorizedError.prototype);
  }
}

/**
 * Error thrown when pricing matrix is incomplete or invalid
 */
export class PricingMatrixError extends SuperPackageError {
  constructor(message: string, details?: any) {
    super(
      `Pricing matrix error: ${message}`,
      'PRICING_MATRIX_ERROR',
      400,
      details
    );
    this.name = 'PricingMatrixError';
    Object.setPrototypeOf(this, PricingMatrixError.prototype);
  }
}

/**
 * Error thrown when package linking to quote fails
 */
export class PackageLinkingError extends SuperPackageError {
  constructor(message: string, details?: any) {
    super(
      `Package linking failed: ${message}`,
      'PACKAGE_LINKING_ERROR',
      400,
      details
    );
    this.name = 'PackageLinkingError';
    Object.setPrototypeOf(this, PackageLinkingError.prototype);
  }
}

/**
 * Error thrown when database operation fails
 */
export class PackageDatabaseError extends SuperPackageError {
  constructor(operation: string, originalError?: Error) {
    super(
      `Database operation failed: ${operation}`,
      'PACKAGE_DATABASE_ERROR',
      500,
      { originalError: originalError?.message }
    );
    this.name = 'PackageDatabaseError';
    Object.setPrototypeOf(this, PackageDatabaseError.prototype);
  }
}

/**
 * Utility function to determine if an error is a SuperPackageError
 */
export function isSuperPackageError(error: any): error is SuperPackageError {
  return error instanceof SuperPackageError;
}

/**
 * Utility function to convert any error to a user-friendly message
 */
export function getErrorMessage(error: any): string {
  if (isSuperPackageError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Utility function to get HTTP status code from error
 */
export function getErrorStatusCode(error: any): number {
  if (isSuperPackageError(error)) {
    return error.statusCode;
  }
  
  return 500;
}
