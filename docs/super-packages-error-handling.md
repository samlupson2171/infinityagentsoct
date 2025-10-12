# Super Packages Error Handling Guide

## Overview

The Super Packages feature implements comprehensive error handling with custom error classes, structured logging, and user-friendly error messages. This guide explains the error handling system and how to use it.

## Architecture

### Error Classes Hierarchy

```
Error (JavaScript base)
  └── SuperPackageError (base class)
      ├── PackageValidationError
      ├── CSVImportError
      ├── PriceCalculationError
      ├── PackageNotFoundError
      ├── PackageInUseError
      ├── PackageUnauthorizedError
      ├── PricingMatrixError
      ├── PackageLinkingError
      └── PackageDatabaseError
```

## Error Classes

### SuperPackageError

Base class for all super package errors.

```typescript
new SuperPackageError(
  message: string,
  code: string,
  statusCode: number = 500,
  details?: any
)
```

**Properties:**
- `message`: Human-readable error message
- `code`: Machine-readable error code
- `statusCode`: HTTP status code
- `details`: Additional error context

### PackageValidationError

Thrown when package data validation fails.

```typescript
new PackageValidationError(
  field: string,
  message: string,
  validationCode: string,
  details?: any
)
```

**Example:**
```typescript
throw new PackageValidationError(
  'name',
  'Package name is required',
  'REQUIRED_FIELD'
);
```

### CSVImportError

Thrown when CSV import fails.

```typescript
new CSVImportError(
  line?: number,
  column?: string,
  message?: string,
  details?: any
)
```

**Example:**
```typescript
throw new CSVImportError(
  5,
  'price',
  'Invalid price format'
);
```

### PriceCalculationError

Thrown when price calculation fails.

```typescript
new PriceCalculationError(
  reason: string,
  details?: any
)
```

**Example:**
```typescript
throw new PriceCalculationError(
  'No matching tier found for 5 people',
  { numberOfPeople: 5, availableTiers: [...] }
);
```

### PackageNotFoundError

Thrown when a package is not found.

```typescript
new PackageNotFoundError(packageId: string)
```

**Example:**
```typescript
throw new PackageNotFoundError('507f1f77bcf86cd799439011');
```

### PackageInUseError

Thrown when attempting to delete a package with linked quotes.

```typescript
new PackageInUseError(
  packageId: string,
  linkedQuotesCount: number
)
```

**Example:**
```typescript
throw new PackageInUseError('507f1f77bcf86cd799439011', 5);
```

### PackageUnauthorizedError

Thrown when user lacks permission for an operation.

```typescript
new PackageUnauthorizedError(operation: string)
```

**Example:**
```typescript
throw new PackageUnauthorizedError('delete package');
```

### PricingMatrixError

Thrown when pricing matrix is invalid or incomplete.

```typescript
new PricingMatrixError(message: string, details?: any)
```

### PackageLinkingError

Thrown when linking a package to a quote fails.

```typescript
new PackageLinkingError(message: string, details?: any)
```

### PackageDatabaseError

Thrown when database operations fail.

```typescript
new PackageDatabaseError(
  operation: string,
  originalError?: Error
)
```

## Error Handler Utilities

### handleApiError

Centralized error handler for API routes. Automatically logs errors and returns appropriate responses.

```typescript
import { handleApiError } from '@/lib/errors/super-package-error-handler';

export async function GET(request: NextRequest) {
  try {
    // Your code here
  } catch (error) {
    return handleApiError(error, 'OPERATION_NAME', {
      userId: session?.user?.id,
      packageId: params.id,
    });
  }
}
```

### validateRequiredFields

Validates that required fields are present and non-empty.

```typescript
import { validateRequiredFields } from '@/lib/errors/super-package-error-handler';

validateRequiredFields(body, [
  'name',
  'destination',
  'resort',
  'currency',
], 'CREATE_PACKAGE');
```

### validateAuthorization

Validates user has required role.

```typescript
import { validateAuthorization } from '@/lib/errors/super-package-error-handler';

validateAuthorization(session?.user?.role, 'admin');
```

### validatePackageExists

Validates package exists and returns it.

```typescript
import { validatePackageExists } from '@/lib/errors/super-package-error-handler';

const pkg = await validatePackageExists(packageId, SuperOfferPackage);
```

### Response Helpers

```typescript
import { successResponse, errorResponse } from '@/lib/errors/super-package-error-handler';

// Success response
return successResponse({ data: result }, 200);

// Error response
return errorResponse('Error message', 'ERROR_CODE', 400, { details });
```

## Logging System

### Logger Usage

```typescript
import { logger } from '@/lib/logging/super-package-logger';

// Debug (development only)
logger.debug('OPERATION', 'Debug message', { details });

// Info
logger.info('OPERATION', 'Info message', { details });

// Warning
logger.warn('OPERATION', 'Warning message', { details });

// Error
logger.error('OPERATION', error, { details });

// Success
logger.success('OPERATION', 'Success message', { details });
```

### Scoped Logger

Create a logger with context that's automatically included in all logs:

```typescript
const scopedLogger = logger.withContext({
  userId: session.user.id,
  packageId: params.id,
});

scopedLogger.info('OPERATION', 'Message');
// Automatically includes userId and packageId
```

### API Request/Response Logging

```typescript
import { logApiRequest, logApiResponse, logApiError } from '@/lib/logging/super-package-logger';

// Log request
logApiRequest('GET', '/api/admin/super-packages', session?.user?.id);

// Log response
const startTime = Date.now();
// ... handle request ...
const duration = Date.now() - startTime;
logApiResponse('GET', '/api/admin/super-packages', 200, duration);

// Log error
logApiError('GET', '/api/admin/super-packages', error, session?.user?.id);
```

## API Route Pattern

Standard pattern for API routes with error handling:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  handleApiError,
  validateAuthorization,
  validateRequiredFields,
  successResponse,
} from '@/lib/errors/super-package-error-handler';
import { logger, logApiRequest, logApiResponse } from '@/lib/logging/super-package-logger';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const session = await getServerSession(authOptions);
    logApiRequest('POST', '/api/admin/super-packages', session?.user?.id);

    // Validate authorization
    validateAuthorization(session?.user?.role);

    // Parse and validate request body
    const body = await request.json();
    validateRequiredFields(body, ['name', 'destination'], 'CREATE_PACKAGE');

    // Your business logic here
    logger.debug('CREATE_PACKAGE', 'Creating package', { name: body.name });
    
    // ... perform operations ...
    
    logger.success('CREATE_PACKAGE', 'Package created', { packageId: result.id });

    // Log response
    const duration = Date.now() - startTime;
    logApiResponse('POST', '/api/admin/super-packages', 201, duration);

    return successResponse({ package: result }, 201);
  } catch (error) {
    return handleApiError(error, 'CREATE_PACKAGE', {
      userId: (await getServerSession(authOptions))?.user?.id,
    });
  }
}
```

## Error Response Format

All errors return a consistent JSON format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE",
  "details": {
    "field": "fieldName",
    "additionalContext": "..."
  }
}
```

## Common Error Codes

| Code | Description | Status Code |
|------|-------------|-------------|
| `VALIDATION_ERROR_*` | Validation failed | 400 |
| `CSV_IMPORT_ERROR` | CSV import failed | 400 |
| `PRICE_CALCULATION_ERROR` | Price calculation failed | 400 |
| `PACKAGE_NOT_FOUND` | Package not found | 404 |
| `PACKAGE_IN_USE` | Package has linked quotes | 409 |
| `PACKAGE_UNAUTHORIZED` | Unauthorized access | 403 |
| `PRICING_MATRIX_ERROR` | Pricing matrix invalid | 400 |
| `PACKAGE_LINKING_ERROR` | Package linking failed | 400 |
| `PACKAGE_DATABASE_ERROR` | Database operation failed | 500 |
| `DUPLICATE_PACKAGE` | Duplicate package name | 409 |
| `INVALID_ID` | Invalid ObjectId format | 400 |
| `INTERNAL_ERROR` | Unexpected error | 500 |

## Best Practices

### 1. Always Use Try-Catch

Wrap all API route handlers in try-catch blocks:

```typescript
export async function GET(request: NextRequest) {
  try {
    // Your code
  } catch (error) {
    return handleApiError(error, 'OPERATION_NAME');
  }
}
```

### 2. Throw Specific Errors

Use specific error classes instead of generic errors:

```typescript
// ❌ Bad
throw new Error('Package not found');

// ✅ Good
throw new PackageNotFoundError(packageId);
```

### 3. Include Context in Errors

Provide helpful context in error details:

```typescript
throw new PriceCalculationError(
  'No matching tier found',
  {
    numberOfPeople: 5,
    availableTiers: package.groupSizeTiers,
  }
);
```

### 4. Log Before Throwing

Log important context before throwing errors:

```typescript
logger.warn('DELETE_PACKAGE', 'Package has linked quotes', {
  packageId,
  linkedQuotesCount,
});
throw new PackageInUseError(packageId, linkedQuotesCount);
```

### 5. Wrap Database Operations

Wrap database operations to provide better error messages:

```typescript
const package = await SuperOfferPackage.findById(id).catch((error) => {
  throw new PackageDatabaseError('fetch package', error);
});
```

### 6. Validate Early

Validate inputs at the start of functions:

```typescript
validateRequiredFields(body, ['name', 'destination'], 'CREATE_PACKAGE');
validateAuthorization(session?.user?.role);

if (!mongoose.Types.ObjectId.isValid(id)) {
  throw new PackageValidationError('id', 'Invalid ID format', 'INVALID_ID');
}
```

## Testing Error Handling

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';
import { PackageNotFoundError } from '@/lib/errors/super-package-errors';

describe('Error Handling', () => {
  it('should throw PackageNotFoundError', () => {
    expect(() => {
      throw new PackageNotFoundError('123');
    }).toThrow(PackageNotFoundError);
  });

  it('should have correct status code', () => {
    const error = new PackageNotFoundError('123');
    expect(error.statusCode).toBe(404);
  });
});
```

### Integration Tests

```typescript
it('should return 404 for non-existent package', async () => {
  const response = await fetch('/api/admin/super-packages/invalid-id');
  const data = await response.json();
  
  expect(response.status).toBe(404);
  expect(data.success).toBe(false);
  expect(data.code).toBe('PACKAGE_NOT_FOUND');
});
```

## Monitoring and Debugging

### Development Mode

In development, errors include:
- Full stack traces
- Detailed error information
- Debug logs

### Production Mode

In production, errors:
- Hide sensitive information
- Show user-friendly messages
- Log to external services (when configured)

### External Logging Integration

To integrate with external logging services (Sentry, LogRocket, etc.), update the `sendToExternalLogger` method in `super-package-logger.ts`:

```typescript
private sendToExternalLogger(logEntry: LogEntry) {
  // Example: Sentry integration
  if (typeof Sentry !== 'undefined') {
    Sentry.captureException(logEntry.error, {
      extra: logEntry.details,
      tags: {
        operation: logEntry.operation,
      },
    });
  }
}
```

## Troubleshooting

### Error Not Being Caught

Ensure you're using try-catch in async functions:

```typescript
// ❌ Bad - error won't be caught
export async function GET(request: NextRequest) {
  const data = await fetchData(); // Might throw
  return NextResponse.json(data);
}

// ✅ Good
export async function GET(request: NextRequest) {
  try {
    const data = await fetchData();
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error, 'FETCH_DATA');
  }
}
```

### Error Details Not Showing

Check that you're passing details when creating errors:

```typescript
throw new PackageValidationError(
  'name',
  'Name is required',
  'REQUIRED_FIELD',
  { providedValue: body.name } // Include details
);
```

### Logs Not Appearing

Ensure you're using the logger correctly:

```typescript
import { logger } from '@/lib/logging/super-package-logger';

// Not console.log
logger.info('OPERATION', 'Message', { details });
```

## Summary

The Super Packages error handling system provides:

1. **Custom Error Classes**: Specific error types for different scenarios
2. **Structured Logging**: Consistent logging with context
3. **User-Friendly Messages**: Clear error messages for users
4. **Developer-Friendly Details**: Detailed context for debugging
5. **Consistent API Responses**: Standardized error response format
6. **Easy Integration**: Simple utilities for common patterns

By following these patterns, you ensure consistent, maintainable, and user-friendly error handling throughout the Super Packages feature.
