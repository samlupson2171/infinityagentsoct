# Super Offer Packages - API Documentation

## Overview

This document provides comprehensive API documentation for the Super Offer Packages system. All endpoints require authentication and appropriate authorization.

## Base URL

```
/api/admin/super-packages
```

## Authentication

All endpoints require:
- Valid session token
- Admin role authorization

Include session token in cookies or Authorization header.

## Endpoints

### 1. List Super Packages

Retrieve a paginated list of super packages with filtering and search capabilities.

**Endpoint**: `GET /api/admin/super-packages`

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Page number for pagination |
| limit | number | No | 20 | Number of items per page |
| status | string | No | 'all' | Filter by status: 'active', 'inactive', 'all' |
| destination | string | No | - | Filter by destination name |
| resort | string | No | - | Filter by resort name |
| search | string | No | - | Search in package name and destination |

**Example Request**:
```http
GET /api/admin/super-packages?page=1&limit=20&status=active&destination=Benidorm
```

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "packages": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Benidorm Beach Resort Package",
        "destination": "Benidorm",
        "resort": "Benidorm Beach Resort",
        "currency": "EUR",
        "status": "active",
        "priceRange": {
          "min": 400,
          "max": 880
        },
        "groupSizeTiers": [
          {
            "label": "6-11 People",
            "minPeople": 6,
            "maxPeople": 11
          }
        ],
        "durationOptions": [2, 3, 4],
        "version": 1,
        "createdAt": "2025-01-15T10:00:00Z",
        "updatedAt": "2025-01-15T10:00:00Z",
        "lastModifiedBy": "507f1f77bcf86cd799439012"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 95,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

**Error Responses**:

- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `500 Internal Server Error`: Server error

---

### 2. Get Single Package

Retrieve detailed information about a specific super package.

**Endpoint**: `GET /api/admin/super-packages/[id]`

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Package MongoDB ObjectId |

**Example Request**:
```http
GET /api/admin/super-packages/507f1f77bcf86cd799439011
```

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Benidorm Beach Resort Package",
    "destination": "Benidorm",
    "resort": "Benidorm Beach Resort",
    "currency": "EUR",
    "groupSizeTiers": [
      {
        "label": "6-11 People",
        "minPeople": 6,
        "maxPeople": 11
      },
      {
        "label": "12+ People",
        "minPeople": 12,
        "maxPeople": 999
      }
    ],
    "durationOptions": [2, 3, 4],
    "pricingMatrix": [
      {
        "period": "January",
        "periodType": "month",
        "prices": [
          {
            "groupSizeTierIndex": 0,
            "nights": 2,
            "price": 450
          },
          {
            "groupSizeTierIndex": 0,
            "nights": 3,
            "price": 550
          }
        ]
      }
    ],
    "inclusions": [
      {
        "text": "Return airport transfers",
        "category": "transfer"
      },
      {
        "text": "3* or 4* accommodation",
        "category": "accommodation"
      }
    ],
    "accommodationExamples": [
      "Hotel Bali",
      "Hotel Presidente"
    ],
    "salesNotes": "Book 3 months in advance for best rates.",
    "status": "active",
    "version": 1,
    "createdBy": "507f1f77bcf86cd799439012",
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z",
    "lastModifiedBy": "507f1f77bcf86cd799439012"
  }
}
```

**Error Responses**:

- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Package not found
- `500 Internal Server Error`: Server error

---

### 3. Create Package

Create a new super offer package.

**Endpoint**: `POST /api/admin/super-packages`

**Request Body**:

```json
{
  "name": "Benidorm Beach Resort Package",
  "destination": "Benidorm",
  "resort": "Benidorm Beach Resort",
  "currency": "EUR",
  "groupSizeTiers": [
    {
      "label": "6-11 People",
      "minPeople": 6,
      "maxPeople": 11
    },
    {
      "label": "12+ People",
      "minPeople": 12,
      "maxPeople": 999
    }
  ],
  "durationOptions": [2, 3, 4],
  "pricingMatrix": [
    {
      "period": "January",
      "periodType": "month",
      "prices": [
        {
          "groupSizeTierIndex": 0,
          "nights": 2,
          "price": 450
        },
        {
          "groupSizeTierIndex": 0,
          "nights": 3,
          "price": 550
        }
      ]
    }
  ],
  "inclusions": [
    {
      "text": "Return airport transfers",
      "category": "transfer"
    }
  ],
  "accommodationExamples": ["Hotel Bali"],
  "salesNotes": "Book 3 months in advance.",
  "status": "active"
}
```

**Response**: `201 Created`

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Benidorm Beach Resort Package",
    ...
  },
  "message": "Package created successfully"
}
```

**Validation Rules**:

- `name`: Required, 3-200 characters
- `destination`: Required, 2-100 characters
- `resort`: Required, 2-100 characters
- `currency`: Required, one of: EUR, GBP, USD
- `groupSizeTiers`: Required, at least 1 tier
- `durationOptions`: Required, at least 1 duration
- `pricingMatrix`: Required, must cover all combinations
- `inclusions`: Required, at least 1 inclusion
- `status`: Required, one of: active, inactive

**Error Responses**:

- `400 Bad Request`: Validation error
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `500 Internal Server Error`: Server error

---

### 4. Update Package

Update an existing super package.

**Endpoint**: `PUT /api/admin/super-packages/[id]`

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Package MongoDB ObjectId |

**Request Body**: Same as Create Package (all fields optional for partial update)

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Updated Package Name",
    "version": 2,
    ...
  },
  "message": "Package updated successfully"
}
```

**Notes**:
- Version number automatically incremented
- `lastModifiedBy` and `updatedAt` automatically updated
- Existing quotes using this package are not affected

**Error Responses**:

- `400 Bad Request`: Validation error
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Package not found
- `500 Internal Server Error`: Server error

---

### 5. Delete Package

Delete a super package (soft or hard delete depending on linked quotes).

**Endpoint**: `DELETE /api/admin/super-packages/[id]`

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Package MongoDB ObjectId |

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| force | boolean | No | false | Force hard delete even with linked quotes |

**Example Request**:
```http
DELETE /api/admin/super-packages/507f1f77bcf86cd799439011
```

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "deleted": true,
    "deletionType": "soft",
    "linkedQuotesCount": 5
  },
  "message": "Package soft-deleted successfully. 5 quotes are linked to this package."
}
```

**Deletion Logic**:

1. **No linked quotes**: Hard delete (permanent removal)
2. **Has linked quotes**: Soft delete (status set to 'deleted', data retained)
3. **Force flag**: Hard delete regardless (use with caution)

**Error Responses**:

- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Package not found
- `409 Conflict`: Cannot delete package with linked quotes (without force)
- `500 Internal Server Error`: Server error

---

### 6. Update Package Status

Toggle package active/inactive status.

**Endpoint**: `PATCH /api/admin/super-packages/[id]/status`

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Package MongoDB ObjectId |

**Request Body**:

```json
{
  "status": "inactive"
}
```

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "inactive",
    ...
  },
  "message": "Package status updated successfully"
}
```

**Valid Status Values**:
- `active`: Package available for selection
- `inactive`: Package hidden from selection lists

**Error Responses**:

- `400 Bad Request`: Invalid status value
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Package not found
- `500 Internal Server Error`: Server error

---

### 7. Import Package from CSV

Parse and preview a CSV file for package import.

**Endpoint**: `POST /api/admin/super-packages/import`

**Content-Type**: `multipart/form-data`

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | CSV file to import |

**Example Request**:
```http
POST /api/admin/super-packages/import
Content-Type: multipart/form-data

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="package.csv"
Content-Type: text/csv

[CSV content]
------WebKitFormBoundary--
```

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "preview": {
      "name": "Benidorm Beach Resort Package",
      "destination": "Benidorm",
      "resort": "Benidorm Beach Resort",
      "currency": "EUR",
      "groupSizeTiers": [...],
      "durationOptions": [2, 3, 4],
      "pricingMatrix": [...],
      "inclusions": [...],
      "salesNotes": "..."
    },
    "warnings": [],
    "originalFilename": "package.csv"
  },
  "message": "CSV parsed successfully. Review and confirm to import."
}
```

**Validation**:
- File must be CSV format
- Maximum file size: 5MB
- Must follow required CSV structure

**Error Responses**:

- `400 Bad Request`: Invalid file format or structure
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `413 Payload Too Large`: File exceeds size limit
- `500 Internal Server Error`: Server error

---

### 8. Confirm CSV Import

Confirm and save a previewed CSV import.

**Endpoint**: `POST /api/admin/super-packages/import/confirm`

**Request Body**: Same as Create Package (from preview data)

**Response**: `201 Created`

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Benidorm Beach Resort Package",
    "importSource": "csv",
    "originalFilename": "package.csv",
    ...
  },
  "message": "Package imported successfully"
}
```

**Error Responses**:

- `400 Bad Request`: Validation error
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `500 Internal Server Error`: Server error

---

### 9. Calculate Price

Calculate price for specific package parameters.

**Endpoint**: `POST /api/admin/super-packages/calculate-price`

**Request Body**:

```json
{
  "packageId": "507f1f77bcf86cd799439011",
  "numberOfPeople": 8,
  "numberOfNights": 3,
  "arrivalDate": "2025-07-15"
}
```

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "price": 4400,
    "pricePerPerson": 550,
    "isOnRequest": false,
    "tierUsed": {
      "index": 0,
      "label": "6-11 People"
    },
    "periodUsed": {
      "period": "July",
      "periodType": "month"
    },
    "breakdown": {
      "pricePerPerson": 550,
      "numberOfPeople": 8,
      "numberOfNights": 3,
      "totalPrice": 4400
    }
  }
}
```

**Response (ON REQUEST)**:

```json
{
  "success": true,
  "data": {
    "price": null,
    "isOnRequest": true,
    "tierUsed": {
      "index": 0,
      "label": "6-11 People"
    },
    "periodUsed": {
      "period": "Easter (02/04/2025 - 06/04/2025)",
      "periodType": "special"
    },
    "message": "Price is on request for this combination"
  }
}
```

**Calculation Logic**:

1. Determine group size tier based on `numberOfPeople`
2. Find matching duration in `durationOptions`
3. Determine pricing period based on `arrivalDate`
4. Lookup price in pricing matrix
5. Calculate total: `pricePerPerson × numberOfPeople`

**Error Responses**:

- `400 Bad Request`: Invalid parameters or no matching price found
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Package not found
- `500 Internal Server Error`: Server error

---

### 10. Link Package to Quote

Link a super package to a quote and populate quote fields.

**Endpoint**: `POST /api/admin/quotes/[id]/link-package`

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Quote MongoDB ObjectId |

**Request Body**:

```json
{
  "packageId": "507f1f77bcf86cd799439011",
  "numberOfPeople": 8,
  "numberOfNights": 3,
  "arrivalDate": "2025-07-15"
}
```

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "linkedPackage": {
      "packageId": "507f1f77bcf86cd799439011",
      "packageName": "Benidorm Beach Resort Package",
      "packageVersion": 1,
      "selectedTier": {
        "tierIndex": 0,
        "tierLabel": "6-11 People"
      },
      "selectedNights": 3,
      "selectedPeriod": "July",
      "calculatedPrice": 4400,
      "priceWasOnRequest": false
    },
    "totalPrice": 4400,
    "inclusions": [...],
    ...
  },
  "message": "Package linked to quote successfully"
}
```

**What Gets Updated**:
- `linkedPackage` field populated
- `totalPrice` set to calculated price
- `inclusions` populated from package
- `internalNotes` updated with accommodation examples

**Error Responses**:

- `400 Bad Request`: Invalid parameters
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Quote or package not found
- `500 Internal Server Error`: Server error

---

### 11. Get Package Statistics

Retrieve usage statistics for packages.

**Endpoint**: `GET /api/admin/super-packages/statistics`

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "totalPackages": 45,
    "activePackages": 38,
    "inactivePackages": 7,
    "totalLinkedQuotes": 234,
    "mostUsedPackages": [
      {
        "packageId": "507f1f77bcf86cd799439011",
        "packageName": "Benidorm Beach Resort Package",
        "usageCount": 45
      }
    ],
    "packagesByDestination": [
      {
        "destination": "Benidorm",
        "count": 12
      }
    ]
  }
}
```

---

### 12. Duplicate Package

Create a copy of an existing package.

**Endpoint**: `POST /api/admin/super-packages/[id]/duplicate`

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Package MongoDB ObjectId to duplicate |

**Response**: `201 Created`

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "Benidorm Beach Resort Package (Copy)",
    "version": 1,
    ...
  },
  "message": "Package duplicated successfully"
}
```

---

### 13. Export Packages

Export packages to CSV format.

**Endpoint**: `GET /api/admin/super-packages/export`

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ids | string[] | No | Specific package IDs to export (comma-separated) |
| status | string | No | Filter by status |
| destination | string | No | Filter by destination |

**Response**: `200 OK`

**Content-Type**: `text/csv`

Returns CSV file with package data.

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional error details"
    }
  }
}
```

## Common Error Codes

| Code | Description |
|------|-------------|
| VALIDATION_ERROR | Request validation failed |
| NOT_FOUND | Resource not found |
| UNAUTHORIZED | Authentication required |
| FORBIDDEN | Insufficient permissions |
| DUPLICATE_ENTRY | Resource already exists |
| INVALID_FILE | Invalid file format or content |
| CALCULATION_ERROR | Price calculation failed |
| DATABASE_ERROR | Database operation failed |

## Rate Limiting

- **Import endpoint**: 10 requests per hour per user
- **Other endpoints**: 100 requests per minute per user

Exceeded limits return `429 Too Many Requests`.

## Pagination

List endpoints support pagination with these parameters:

- `page`: Page number (1-indexed)
- `limit`: Items per page (max: 100)

Response includes pagination metadata:

```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 95,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## Filtering and Search

List endpoints support:

- **Filtering**: Exact match on specific fields
- **Search**: Text search across multiple fields
- **Sorting**: Order by specified field

Example:
```http
GET /api/admin/super-packages?search=benidorm&status=active&sort=-createdAt
```

## Versioning

API version is included in response headers:

```
X-API-Version: 1.0.0
```

## Best Practices

1. **Always validate input** before sending requests
2. **Handle errors gracefully** with appropriate user feedback
3. **Use pagination** for large datasets
4. **Cache responses** where appropriate
5. **Implement retry logic** for transient failures
6. **Log API calls** for debugging and monitoring

## Code Examples

### JavaScript/TypeScript (Fetch API)

```typescript
// List packages
async function listPackages(page = 1, status = 'active') {
  const response = await fetch(
    `/api/admin/super-packages?page=${page}&status=${status}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch packages');
  }
  
  return response.json();
}

// Create package
async function createPackage(packageData) {
  const response = await fetch('/api/admin/super-packages', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(packageData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  
  return response.json();
}

// Calculate price
async function calculatePrice(params) {
  const response = await fetch('/api/admin/super-packages/calculate-price', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  
  if (!response.ok) {
    throw new Error('Price calculation failed');
  }
  
  return response.json();
}
```

### React Query Example

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// Fetch packages
export function useSuperPackages(filters) {
  return useQuery({
    queryKey: ['super-packages', filters],
    queryFn: () => listPackages(filters.page, filters.status),
  });
}

// Create package
export function useCreatePackage() {
  return useMutation({
    mutationFn: createPackage,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['super-packages'] });
    },
  });
}
```

## Support

For API support:
- Review this documentation
- Check error messages and codes
- Contact development team
- Submit bug reports with request/response details
