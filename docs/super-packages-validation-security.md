# Super Packages Validation and Security

This document describes the input validation, sanitization, and rate limiting implemented for the Super Offer Packages system.

## Overview

The system implements comprehensive security measures to protect against common vulnerabilities:

- **Input Validation**: All user inputs are validated using Zod schemas
- **Input Sanitization**: Text inputs are sanitized to prevent XSS attacks
- **File Upload Validation**: File uploads are validated for type, size, and content
- **Rate Limiting**: API endpoints are protected with rate limiting to prevent abuse

## Input Validation

### Validation Library

The system uses [Zod](https://zod.dev/) for schema validation, providing:

- Type-safe validation
- Automatic TypeScript type inference
- Detailed error messages
- Transform capabilities for sanitization

### Validation Schemas

#### Super Package Creation/Update

```typescript
createSuperPackageSchema.parse({
  name: string (1-200 chars),
  destination: string (1-100 chars),
  resort: string (1-100 chars),
  currency: 'EUR' | 'GBP' | 'USD',
  groupSizeTiers: array (1-10 items),
  durationOptions: array (1-20 items),
  pricingMatrix: array (1-50 items),
  inclusions: array (0-100 items),
  accommodationExamples: array (0-50 items),
  salesNotes: string (0-5000 chars),
  status: 'active' | 'inactive',
});
```

#### Price Calculation

```typescript
calculatePriceSchema.parse({
  packageId: string (valid MongoDB ObjectId),
  numberOfPeople: number (1-1000),
  numberOfNights: number (1-365),
  arrivalDate: ISO 8601 date string,
});
```

#### Package Linking

```typescript
linkPackageSchema.parse({
  packageId: string (valid MongoDB ObjectId),
  numberOfPeople: number (1-1000),
  numberOfNights: number (1-365),
  arrivalDate: ISO 8601 date string,
});
```

#### Status Update

```typescript
updateStatusSchema.parse({
  status: 'active' | 'inactive',
});
```

### Validation Rules

#### Group Size Tiers

- Label: 1-100 characters
- Min people: 1-1000
- Max people: 1-1000
- Max people must be >= min people

#### Pricing Matrix

- Period: 1-200 characters
- Period type: 'month' or 'special'
- Special periods require start and end dates
- End date must be >= start date
- Price: positive number or 'ON_REQUEST'

#### Inclusions

- Text: 1-500 characters
- Category: 'transfer' | 'accommodation' | 'activity' | 'service' | 'other'

## Input Sanitization

### Text Sanitization

All text inputs are sanitized using DOMPurify to prevent XSS attacks:

```typescript
sanitizeText(input: string): string
```

- Removes all HTML tags
- Removes dangerous attributes
- Trims whitespace
- Preserves text content

**Example:**

```typescript
sanitizeText('<script>alert("xss")</script>Hello')
// Returns: "Hello"
```

### HTML Sanitization

Rich text fields (like sales notes) allow safe HTML tags:

```typescript
sanitizeHtml(html: string): string
```

**Allowed tags:**
- `<p>`, `<br>`, `<strong>`, `<em>`, `<u>`
- `<ul>`, `<ol>`, `<li>`
- `<a>` (with href and target attributes only)

**Example:**

```typescript
sanitizeHtml('<p>Hello</p><script>alert("xss")</script>')
// Returns: "<p>Hello</p>"
```

## File Upload Validation

File uploads are validated for security:

```typescript
validateFileUpload(file: File, options: {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
})
```

### CSV Import Validation

- **Max size**: 5MB
- **Allowed types**: `text/csv`, `application/vnd.ms-excel`
- **Allowed extensions**: `.csv`

**Example:**

```typescript
const validation = validateFileUpload(file, {
  maxSize: 5 * 1024 * 1024,
  allowedTypes: ['text/csv'],
  allowedExtensions: ['.csv'],
});

if (!validation.valid) {
  throw new Error(validation.error);
}
```

## Rate Limiting

### Implementation

Rate limiting is implemented using an in-memory store with the following features:

- Per-user tracking (when authenticated)
- Per-IP tracking (when not authenticated)
- Per-endpoint tracking
- Automatic cleanup of expired entries
- Configurable time windows and limits

### Rate Limit Configurations

#### Standard Rate Limiter

Used for most API endpoints:

- **Window**: 15 minutes
- **Max requests**: 100
- **Endpoints**: GET, PUT, DELETE operations

#### Upload Rate Limiter

Used for file upload endpoints:

- **Window**: 15 minutes
- **Max requests**: 10
- **Endpoints**: File upload operations

#### Import Rate Limiter

Used for CSV import endpoint:

- **Window**: 15 minutes
- **Max requests**: 5
- **Endpoints**: `/api/admin/super-packages/import`

#### Calculation Rate Limiter

Used for price calculation endpoint:

- **Window**: 1 minute
- **Max requests**: 50
- **Endpoints**: `/api/admin/super-packages/calculate-price`

### Rate Limit Response

When rate limited, the API returns:

```json
{
  "success": false,
  "error": "Too many requests, please try again later",
  "retryAfter": 60
}
```

**HTTP Status**: 429 Too Many Requests

**Headers:**
- `Retry-After`: Seconds until limit resets
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Timestamp when limit resets

### Usage in API Routes

```typescript
import { standardRateLimiter } from '@/lib/middleware/rate-limiter';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  // Apply rate limiting
  const rateLimitResult = await standardRateLimiter(
    request,
    session?.user?.id
  );
  
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response!;
  }
  
  // Continue with request handling...
}
```

## API Endpoint Security

### Protected Endpoints

All super package endpoints require:

1. **Authentication**: Valid session
2. **Authorization**: Admin role
3. **Rate Limiting**: Appropriate rate limiter
4. **Input Validation**: Zod schema validation
5. **Input Sanitization**: DOMPurify sanitization

### Security Flow

```
Request → Authentication → Authorization → Rate Limiting → 
Validation → Sanitization → Business Logic → Response
```

### Example: Create Package

```typescript
export async function POST(request: NextRequest) {
  // 1. Authentication
  const session = await getServerSession(authOptions);
  
  // 2. Authorization
  validateAuthorization(session?.user?.role);
  
  // 3. Rate Limiting
  const rateLimitResult = await standardRateLimiter(
    request,
    session?.user?.id
  );
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response!;
  }
  
  // 4. Validation & Sanitization
  const body = await request.json();
  const validation = validateAndSanitizeSuperPackage(body);
  
  if (!validation.valid) {
    const errors = formatValidationErrors(validation.errors!);
    throw new PackageValidationError(
      errors[0].field,
      errors[0].message,
      'VALIDATION_ERROR',
      { errors }
    );
  }
  
  // 5. Business Logic
  const newPackage = new SuperOfferPackage({
    ...validation.data,
    createdBy: session.user.id,
  });
  
  await newPackage.save();
  
  return successResponse({ package: newPackage });
}
```

## Error Handling

### Validation Errors

Validation errors are returned with detailed information:

```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "field": "name",
  "message": "Package name must be less than 200 characters",
  "details": {
    "errors": [
      {
        "field": "name",
        "message": "Package name must be less than 200 characters"
      }
    ]
  }
}
```

### File Upload Errors

File upload errors provide specific feedback:

```json
{
  "success": false,
  "error": "File too large. Maximum size is 5MB",
  "code": "FILE_TOO_LARGE",
  "field": "file",
  "details": {
    "size": 6291456,
    "maxSize": 5242880
  }
}
```

## Best Practices

### For Developers

1. **Always validate on server side**: Never trust client-side validation alone
2. **Sanitize all text inputs**: Use `sanitizeText()` or `sanitizeHtml()`
3. **Use Zod schemas**: Define schemas for all API inputs
4. **Apply rate limiting**: Use appropriate rate limiter for each endpoint
5. **Log security events**: Log validation failures and rate limit hits

### For API Consumers

1. **Handle validation errors**: Display field-specific errors to users
2. **Respect rate limits**: Implement exponential backoff when rate limited
3. **Validate on client side**: Provide immediate feedback before API calls
4. **Sanitize before display**: Always sanitize user-generated content

## Testing

### Validation Tests

```typescript
import { validateAndSanitizeSuperPackage } from '@/lib/validation/super-package-validation';

describe('Package Validation', () => {
  it('should reject XSS attempts', () => {
    const data = {
      name: '<script>alert("xss")</script>Test',
      // ... other fields
    };
    
    const result = validateAndSanitizeSuperPackage(data);
    expect(result.data?.name).not.toContain('<script>');
  });
});
```

### Rate Limiting Tests

```typescript
import { standardRateLimiter, clearAllRateLimits } from '@/lib/middleware/rate-limiter';

describe('Rate Limiting', () => {
  beforeEach(() => {
    clearAllRateLimits();
  });
  
  it('should block after limit exceeded', async () => {
    const request = createMockRequest('/test');
    
    // Use up limit
    for (let i = 0; i < 100; i++) {
      await standardRateLimiter(request);
    }
    
    // Should be blocked
    const result = await standardRateLimiter(request);
    expect(result.allowed).toBe(false);
  });
});
```

## Production Considerations

### Rate Limiting

In production, consider using a distributed cache like Redis instead of in-memory storage:

```typescript
// Example with Redis
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function rateLimiter(key: string, limit: number, window: number) {
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, window);
  }
  
  return current <= limit;
}
```

### Monitoring

Monitor security metrics:

- Validation failure rates
- Rate limit hit rates
- File upload rejection rates
- XSS attempt detection

### Logging

Log security events for audit:

```typescript
logger.security('VALIDATION_FAILED', 'XSS attempt detected', {
  userId: session?.user?.id,
  field: 'name',
  value: sanitizedValue,
});
```

## References

- [Zod Documentation](https://zod.dev/)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)
