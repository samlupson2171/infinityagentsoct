# Quote-Package Price Integration Error Handling Guide

## Overview

This guide documents the comprehensive error handling system implemented for the quote-package price integration feature. The system provides structured error types, recovery strategies, and user-friendly error messages.

## Error Types

### Base Error: QuotePriceError

All errors inherit from `QuotePriceError`, which provides:
- `code`: Machine-readable error code
- `statusCode`: HTTP status code
- `isRetryable`: Whether the error can be retried
- `context`: Additional error context data

### Specific Error Types

#### 1. PackageNotFoundError
**When it occurs:** Package has been deleted or doesn't exist
**Code:** `PACKAGE_NOT_FOUND`
**Status:** 404
**Retryable:** No

**Recovery Actions:**
- Select a different package
- Unlink the package
- Enter manual price

#### 2. InvalidParametersError
**When it occurs:** Quote parameters don't match package constraints
**Code:** `INVALID_PARAMETERS`
**Status:** 400
**Retryable:** No

**Recovery Actions:**
- Adjust parameters
- Use custom price

#### 3. DurationNotAvailableError
**When it occurs:** Requested nights not available in package
**Code:** `DURATION_NOT_AVAILABLE`
**Status:** 400
**Retryable:** No

**Context includes:**
- `requestedNights`: The requested duration
- `availableNights`: Array of available durations

**Recovery Actions:**
- Adjust duration to available option
- Use custom price

#### 4. TierLimitExceededError
**When it occurs:** Number of people exceeds package tier limits
**Code:** `TIER_LIMIT_EXCEEDED`
**Status:** 400
**Retryable:** No

**Context includes:**
- `requestedPeople`: Number of people requested
- `maxPeople`: Maximum people allowed

**Recovery Actions:**
- Reduce number of people
- Use custom price

#### 5. DateOutOfRangeError
**When it occurs:** Arrival date outside pricing periods
**Code:** `DATE_OUT_OF_RANGE`
**Status:** 400
**Retryable:** No

**Context includes:**
- `requestedDate`: The requested date
- `availablePeriods`: Array of available period names

**Recovery Actions:**
- Select different date
- Use custom price

#### 6. NetworkError
**When it occurs:** Network connection issues
**Code:** `NETWORK_ERROR`
**Status:** 0
**Retryable:** Yes

**Recovery Actions:**
- Retry the request
- Enter manual price

#### 7. CalculationTimeoutError
**When it occurs:** Price calculation takes too long
**Code:** `CALCULATION_TIMEOUT`
**Status:** 408
**Retryable:** Yes

**Context includes:**
- `timeoutMs`: Timeout duration in milliseconds

**Recovery Actions:**
- Retry the calculation
- Enter manual price

#### 8. CalculationError
**When it occurs:** Generic server-side calculation error
**Code:** `CALCULATION_ERROR`
**Status:** 500
**Retryable:** Yes

**Recovery Actions:**
- Retry the calculation
- Enter manual price

## Error Handler

### QuotePriceErrorHandler

The error handler processes errors and provides recovery options.

#### Configuration

```typescript
const errorHandler = createQuotePriceErrorHandler({
  onRetry: () => {
    // Retry the operation
  },
  onManualPrice: () => {
    // Switch to manual price entry
  },
  onUnlinkPackage: () => {
    // Unlink the package from quote
  },
  onAdjustParameters: () => {
    // Open parameter adjustment UI
  },
  onSelectDifferentPackage: () => {
    // Open package selector
  },
  onDismiss: () => {
    // Dismiss the error
  },
  enableLogging: true,
});
```

#### Usage

```typescript
try {
  await calculatePrice(params);
} catch (error) {
  const result = errorHandler.handle(error);
  
  // result contains:
  // - message: User-friendly error message
  // - title: Error title
  // - severity: 'error' | 'warning' | 'info'
  // - actions: Array of recovery actions
  // - context: Additional error context
}
```

## Integration with useQuotePrice Hook

The `useQuotePrice` hook automatically handles errors:

```typescript
const {
  syncStatus,
  error,
  errorHandlingResult,
  isRetryable,
  recalculatePrice,
  markAsCustomPrice,
} = useQuotePrice({
  linkedPackage,
  numberOfPeople,
  numberOfNights,
  arrivalDate,
  currentPrice,
  onPriceUpdate,
});

// Display error if present
{error && (
  <QuotePriceErrorDisplay 
    errorResult={errorHandlingResult}
    onActionClick={(action) => {
      // Handle action clicks
    }}
  />
)}
```

## Error Display Component

### QuotePriceErrorDisplay

Displays errors with recovery actions.

```typescript
<QuotePriceErrorDisplay
  errorResult={errorHandlingResult}
  onActionClick={(action) => {
    // Optional: Handle action clicks
    console.log('Action clicked:', action.type);
  }}
/>
```

**Features:**
- Color-coded severity (red for errors, yellow for warnings, blue for info)
- Action buttons with appropriate styling
- Technical details in collapsible section
- Accessibility support (ARIA attributes)

## Utility Functions

### parseApiError

Converts various error formats into structured `QuotePriceError` instances.

```typescript
import { parseApiError } from '@/lib/errors/quote-price-errors';

try {
  const response = await fetch('/api/...');
  if (!response.ok) {
    const errorData = await response.json();
    throw parseApiError({ response: { status: response.status, data: errorData } });
  }
} catch (error) {
  const structuredError = parseApiError(error);
  // Handle structured error
}
```

### isRetryableError

Checks if an error can be retried.

```typescript
import { isRetryableError } from '@/lib/errors/quote-price-errors';

if (isRetryableError(error)) {
  // Show retry button
}
```

### getUserFriendlyMessage

Gets user-friendly error message.

```typescript
import { getUserFriendlyMessage } from '@/lib/errors/quote-price-errors';

const message = getUserFriendlyMessage(error);
// "Unable to connect to the server. Please check your internet connection."
```

### retryWithBackoff

Retries operations with exponential backoff.

```typescript
import { retryWithBackoff } from '@/lib/errors/quote-price-error-handler';

const result = await retryWithBackoff(
  async () => {
    return await calculatePrice(params);
  },
  3, // max retries
  1000 // initial delay (ms)
);
```

### withTimeout

Wraps promises with timeout.

```typescript
import { withTimeout } from '@/lib/errors/quote-price-error-handler';

const result = await withTimeout(
  fetch('/api/...'),
  30000 // timeout in ms
);
```

## Error Logging

Errors are automatically logged with appropriate levels:

- **Error level:** System errors (PackageNotFoundError, CalculationError)
- **Warning level:** Transient errors (NetworkError, CalculationTimeoutError)
- **Info level:** User input errors (InvalidParametersError)

### Log Format

```json
{
  "name": "PackageNotFoundError",
  "code": "PACKAGE_NOT_FOUND",
  "message": "Package with ID \"pkg-123\" not found",
  "statusCode": 404,
  "isRetryable": false,
  "context": {
    "packageId": "pkg-123"
  },
  "stack": "...",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### External Error Tracking

The system supports integration with error tracking services:

```typescript
// In your app initialization
window.errorTracker = {
  captureException: (error, options) => {
    // Send to Sentry, Rollbar, etc.
  }
};
```

## Best Practices

### 1. Always Use Structured Errors

```typescript
// ✅ Good
throw new PackageNotFoundError(packageId);

// ❌ Bad
throw new Error('Package not found');
```

### 2. Provide Context

```typescript
// ✅ Good
throw new DurationNotAvailableError(
  requestedNights,
  availableNights,
  { packageId, packageName }
);

// ❌ Bad
throw new DurationNotAvailableError(requestedNights, availableNights);
```

### 3. Handle Errors at Appropriate Level

```typescript
// ✅ Good - Handle in component
const { error, errorHandlingResult } = useQuotePrice(...);
{error && <QuotePriceErrorDisplay errorResult={errorHandlingResult} />}

// ❌ Bad - Swallow errors
try {
  await calculatePrice();
} catch (error) {
  // Silent failure
}
```

### 4. Provide Recovery Actions

```typescript
// ✅ Good - Multiple recovery options
const errorHandler = createQuotePriceErrorHandler({
  onRetry: handleRetry,
  onManualPrice: handleManualPrice,
  onUnlinkPackage: handleUnlink,
});

// ❌ Bad - No recovery options
const errorHandler = createQuotePriceErrorHandler({});
```

### 5. Test Error Scenarios

```typescript
// Test all error types
it('should handle package not found error', async () => {
  mockFetch.mockRejectedValue(new PackageNotFoundError('pkg-123'));
  // Assert error handling
});
```

## Testing

### Unit Tests

Test error types:
```bash
npm test src/lib/errors/__tests__/quote-price-errors.test.ts
```

Test error handler:
```bash
npm test src/lib/errors/__tests__/quote-price-error-handler.test.ts
```

Test error display:
```bash
npm test src/components/admin/__tests__/QuotePriceErrorDisplay.test.tsx
```

### Integration Tests

Test error handling in hooks:
```bash
npm test src/lib/hooks/__tests__/useQuotePrice.test.tsx
```

## Troubleshooting

### Error Not Being Caught

**Problem:** Errors are not being handled properly

**Solution:** Ensure you're using `parseApiError` to convert errors:
```typescript
try {
  await operation();
} catch (error) {
  const structuredError = parseApiError(error);
  // Handle structured error
}
```

### Recovery Actions Not Working

**Problem:** Action buttons don't do anything

**Solution:** Ensure handlers are provided in config:
```typescript
const errorHandler = createQuotePriceErrorHandler({
  onRetry: () => { /* implementation */ },
  onManualPrice: () => { /* implementation */ },
  // ... other handlers
});
```

### Errors Not Logged

**Problem:** Errors aren't appearing in console

**Solution:** Enable logging in error handler:
```typescript
const errorHandler = createQuotePriceErrorHandler({
  enableLogging: true,
});
```

## Future Enhancements

1. **Error Analytics Dashboard**
   - Track error frequency
   - Identify common error patterns
   - Monitor error resolution rates

2. **Smart Error Recovery**
   - Automatic parameter adjustment suggestions
   - Alternative package recommendations
   - Predictive error prevention

3. **Enhanced Logging**
   - Structured logging to external services
   - Error correlation across requests
   - Performance impact tracking

4. **User Feedback**
   - Allow users to report unhelpful errors
   - Collect feedback on recovery actions
   - Improve error messages based on feedback
