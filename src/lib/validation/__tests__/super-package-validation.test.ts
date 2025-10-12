import { describe, it, expect } from 'vitest';
import {
  sanitizeText,
  sanitizeHtml,
  validateFileUpload,
  validateAndSanitizeSuperPackage,
  formatValidationErrors,
  calculatePriceSchema,
  linkPackageSchema,
  updateStatusSchema,
} from '../super-package-validation';

describe('sanitizeText', () => {
  it('should remove HTML tags', () => {
    const input = '<script>alert("xss")</script>Hello';
    const result = sanitizeText(input);
    expect(result).toBe('Hello');
  });

  it('should trim whitespace', () => {
    const input = '  Hello World  ';
    const result = sanitizeText(input);
    expect(result).toBe('Hello World');
  });

  it('should handle empty strings', () => {
    expect(sanitizeText('')).toBe('');
  });

  it('should remove dangerous attributes', () => {
    const input = '<div onclick="alert()">Text</div>';
    const result = sanitizeText(input);
    expect(result).toBe('Text');
  });
});

describe('sanitizeHtml', () => {
  it('should allow safe HTML tags', () => {
    const input = '<p>Hello <strong>World</strong></p>';
    const result = sanitizeHtml(input);
    expect(result).toContain('<p>');
    expect(result).toContain('<strong>');
  });

  it('should remove script tags', () => {
    const input = '<p>Hello</p><script>alert("xss")</script>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('<script>');
    expect(result).toContain('<p>Hello</p>');
  });

  it('should remove dangerous attributes', () => {
    const input = '<p onclick="alert()">Text</p>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('onclick');
  });

  it('should allow links with href', () => {
    const input = '<a href="https://example.com">Link</a>';
    const result = sanitizeHtml(input);
    expect(result).toContain('href');
  });
});

describe('validateFileUpload', () => {
  it('should validate file size', () => {
    const file = new File(['x'.repeat(6 * 1024 * 1024)], 'test.csv', {
      type: 'text/csv',
    });
    const result = validateFileUpload(file, { maxSize: 5 * 1024 * 1024 });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('too large');
  });

  it('should validate file type', () => {
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const result = validateFileUpload(file, {
      allowedTypes: ['text/csv'],
      allowedExtensions: ['.csv'],
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid file type');
  });

  it('should validate file extension', () => {
    const file = new File(['content'], 'test.txt', { type: 'text/csv' });
    const result = validateFileUpload(file, {
      allowedTypes: ['text/csv'],
      allowedExtensions: ['.csv'],
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid file extension');
  });

  it('should accept valid files', () => {
    const file = new File(['content'], 'test.csv', { type: 'text/csv' });
    const result = validateFileUpload(file, {
      maxSize: 5 * 1024 * 1024,
      allowedTypes: ['text/csv'],
      allowedExtensions: ['.csv'],
    });
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});

describe('validateAndSanitizeSuperPackage', () => {
  const validPackageData = {
    name: 'Test Package',
    destination: 'Benidorm',
    resort: 'Test Resort',
    currency: 'EUR' as const,
    groupSizeTiers: [
      { label: '6-11 People', minPeople: 6, maxPeople: 11 },
    ],
    durationOptions: [2, 3, 4],
    pricingMatrix: [
      {
        period: 'January',
        periodType: 'month' as const,
        prices: [
          { groupSizeTierIndex: 0, nights: 2, price: 100 },
        ],
      },
    ],
    inclusions: [{ text: 'Airport transfer', category: 'transfer' as const }],
    accommodationExamples: ['Hotel Example'],
    salesNotes: '<p>Test notes</p>',
  };

  it('should validate and sanitize valid package data', () => {
    const result = validateAndSanitizeSuperPackage(validPackageData);
    expect(result.valid).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.errors).toBeUndefined();
  });

  it('should reject missing required fields', () => {
    const invalidData = { name: 'Test' };
    const result = validateAndSanitizeSuperPackage(invalidData);
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should sanitize text fields', () => {
    const dataWithXss = {
      ...validPackageData,
      name: '<script>alert("xss")</script>Test Package',
    };
    const result = validateAndSanitizeSuperPackage(dataWithXss);
    expect(result.valid).toBe(true);
    expect(result.data?.name).not.toContain('<script>');
  });

  it('should validate group size tiers', () => {
    const invalidData = {
      ...validPackageData,
      groupSizeTiers: [
        { label: 'Invalid', minPeople: 10, maxPeople: 5 }, // max < min
      ],
    };
    const result = validateAndSanitizeSuperPackage(invalidData);
    expect(result.valid).toBe(false);
  });

  it('should validate pricing matrix', () => {
    const invalidData = {
      ...validPackageData,
      pricingMatrix: [], // Empty array
    };
    const result = validateAndSanitizeSuperPackage(invalidData);
    expect(result.valid).toBe(false);
  });

  it('should validate string length limits', () => {
    const invalidData = {
      ...validPackageData,
      name: 'x'.repeat(300), // Exceeds max length
    };
    const result = validateAndSanitizeSuperPackage(invalidData);
    expect(result.valid).toBe(false);
  });

  it('should validate numeric ranges', () => {
    const invalidData = {
      ...validPackageData,
      durationOptions: [0, -1, 500], // Invalid values
    };
    const result = validateAndSanitizeSuperPackage(invalidData);
    expect(result.valid).toBe(false);
  });
});

describe('calculatePriceSchema', () => {
  it('should validate valid calculation request', () => {
    const validData = {
      packageId: '507f1f77bcf86cd799439011',
      numberOfPeople: 10,
      numberOfNights: 3,
      arrivalDate: new Date().toISOString(),
    };
    const result = calculatePriceSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid package ID', () => {
    const invalidData = {
      packageId: 'invalid-id',
      numberOfPeople: 10,
      numberOfNights: 3,
      arrivalDate: new Date().toISOString(),
    };
    const result = calculatePriceSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject negative numbers', () => {
    const invalidData = {
      packageId: '507f1f77bcf86cd799439011',
      numberOfPeople: -5,
      numberOfNights: 3,
      arrivalDate: new Date().toISOString(),
    };
    const result = calculatePriceSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject invalid date format', () => {
    const invalidData = {
      packageId: '507f1f77bcf86cd799439011',
      numberOfPeople: 10,
      numberOfNights: 3,
      arrivalDate: 'not-a-date',
    };
    const result = calculatePriceSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('linkPackageSchema', () => {
  it('should validate valid link request', () => {
    const validData = {
      packageId: '507f1f77bcf86cd799439011',
      numberOfPeople: 10,
      numberOfNights: 3,
      arrivalDate: new Date().toISOString(),
    };
    const result = linkPackageSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should enforce maximum limits', () => {
    const invalidData = {
      packageId: '507f1f77bcf86cd799439011',
      numberOfPeople: 2000, // Exceeds max
      numberOfNights: 500, // Exceeds max
      arrivalDate: new Date().toISOString(),
    };
    const result = linkPackageSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('updateStatusSchema', () => {
  it('should validate active status', () => {
    const result = updateStatusSchema.safeParse({ status: 'active' });
    expect(result.success).toBe(true);
  });

  it('should validate inactive status', () => {
    const result = updateStatusSchema.safeParse({ status: 'inactive' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid status', () => {
    const result = updateStatusSchema.safeParse({ status: 'deleted' });
    expect(result.success).toBe(false);
  });
});

describe('formatValidationErrors', () => {
  it('should format Zod errors correctly', () => {
    const invalidData = { name: '' };
    const parseResult = calculatePriceSchema.safeParse(invalidData);
    
    if (!parseResult.success) {
      const formatted = formatValidationErrors(parseResult.error);
      expect(formatted).toBeInstanceOf(Array);
      expect(formatted.length).toBeGreaterThan(0);
      expect(formatted[0]).toHaveProperty('field');
      expect(formatted[0]).toHaveProperty('message');
    }
  });
});
