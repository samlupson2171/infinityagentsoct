/**
 * Centralized error handler for Super Package API routes
 * Provides consistent error responses and logging
 */

import { NextResponse } from 'next/server';
import {
  SuperPackageError,
  isSuperPackageError,
  getErrorMessage,
  getErrorStatusCode,
  PackageValidationError,
  CSVImportError,
  PriceCalculationError,
  PackageNotFoundError,
  PackageInUseError,
  PackageUnauthorizedError,
  PricingMatrixError,
  PackageLinkingError,
  PackageDatabaseError,
} from './super-package-errors';
import { logger } from '../logging/super-package-logger';

/**
 * Handle errors in API routes and return appropriate response
 */
export function handleApiError(
  error: any,
  operation: string,
  context?: { userId?: string; packageId?: string }
): NextResponse {
  // Log the error
  logger.error(operation, error, context);

  // Handle SuperPackageError instances
  if (isSuperPackageError(error)) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  // Handle MongoDB duplicate key errors
  if (error.code === 11000) {
    return NextResponse.json(
      {
        success: false,
        error: 'A package with this name already exists',
        code: 'DUPLICATE_PACKAGE',
      },
      { status: 409 }
    );
  }

  // Handle MongoDB validation errors
  if (error.name === 'ValidationError') {
    const validationErrors = Object.keys(error.errors).map((key) => ({
      field: key,
      message: error.errors[key].message,
    }));

    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: { errors: validationErrors },
      },
      { status: 400 }
    );
  }

  // Handle MongoDB cast errors (invalid ObjectId, etc.)
  if (error.name === 'CastError') {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid ID format',
        code: 'INVALID_ID',
        details: { field: error.path, value: error.value },
      },
      { status: 400 }
    );
  }

  // Handle generic errors
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return NextResponse.json(
    {
      success: false,
      error: isDevelopment ? error.message : 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
      ...(isDevelopment && { stack: error.stack }),
    },
    { status: 500 }
  );
}

/**
 * Wrap an API route handler with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  operation: string
): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error, operation);
    }
  }) as T;
}

/**
 * Validate required fields and throw error if missing
 */
export function validateRequiredFields(
  data: any,
  requiredFields: string[],
  operation: string
): void {
  const missingFields = requiredFields.filter((field) => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], data);
    return value === undefined || value === null || value === '';
  });

  if (missingFields.length > 0) {
    throw new PackageValidationError(
      missingFields[0],
      `Missing required field: ${missingFields[0]}`,
      'REQUIRED_FIELD',
      { missingFields }
    );
  }
}

/**
 * Validate package exists and return it
 */
export async function validatePackageExists(
  packageId: string,
  packageModel: any
): Promise<any> {
  const pkg = await packageModel.findById(packageId);
  
  if (!pkg) {
    throw new PackageNotFoundError(packageId);
  }
  
  return pkg;
}

/**
 * Validate user authorization
 */
export function validateAuthorization(
  userRole: string | undefined,
  requiredRole: string = 'admin'
): void {
  if (userRole !== requiredRole) {
    throw new PackageUnauthorizedError('access this resource');
  }
}

/**
 * Create success response
 */
export function successResponse(data: any, status: number = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * Create error response
 */
export function errorResponse(
  message: string,
  code: string,
  status: number = 400,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      details,
    },
    { status }
  );
}

// Export all error classes for convenience
export {
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
};
