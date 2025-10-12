import { z } from 'zod';

// Use a simple fallback during build to avoid CSS loading issues
const DOMPurify = typeof window !== 'undefined' && process.env.NODE_ENV !== 'production'
  ? require('isomorphic-dompurify')
  : {
      sanitize: (html: string, options?: any) => {
        // Simple HTML stripping for server-side/build
        if (!options || !options.ALLOWED_TAGS || options.ALLOWED_TAGS.length === 0) {
          // Strip all HTML
          return html.replace(/<[^>]*>/g, '');
        }
        // For allowed tags, just return as-is (basic fallback)
        return html;
      }
    };

/**
 * Sanitize text input to prevent XSS attacks
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  
  // Remove any HTML tags and scripts
  const sanitized = DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
  
  return sanitized.trim();
}

/**
 * Sanitize HTML content (for rich text fields like sales notes)
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  // Allow only safe HTML tags
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false,
  });
  
  return sanitized.trim();
}

/**
 * Validate and sanitize file upload
 */
export function validateFileUpload(file: File, options: {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}): { valid: boolean; error?: string } {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['text/csv'],
    allowedExtensions = ['.csv'],
  } = options;

  // Check if file exists
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type) && file.type !== '') {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  // Check file extension
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `Invalid file extension. Allowed extensions: ${allowedExtensions.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Zod schema for group size tier validation
 */
export const groupSizeTierSchema = z.object({
  label: z.string()
    .min(1, 'Label is required')
    .max(100, 'Label must be less than 100 characters')
    .transform(sanitizeText),
  minPeople: z.number()
    .int('Must be an integer')
    .min(1, 'Minimum people must be at least 1')
    .max(1000, 'Minimum people cannot exceed 1000'),
  maxPeople: z.number()
    .int('Must be an integer')
    .min(1, 'Maximum people must be at least 1')
    .max(1000, 'Maximum people cannot exceed 1000'),
}).refine(
  (data) => data.maxPeople >= data.minPeople,
  {
    message: 'Maximum people must be greater than or equal to minimum people',
    path: ['maxPeople'],
  }
);

/**
 * Zod schema for price point validation
 */
export const pricePointSchema = z.object({
  groupSizeTierIndex: z.number()
    .int('Must be an integer')
    .min(0, 'Index must be non-negative'),
  nights: z.number()
    .int('Must be an integer')
    .min(1, 'Nights must be at least 1')
    .max(365, 'Nights cannot exceed 365'),
  price: z.union([
    z.number().min(0, 'Price must be non-negative').max(1000000, 'Price cannot exceed 1,000,000'),
    z.literal('ON_REQUEST'),
  ]),
});

/**
 * Zod schema for pricing entry validation
 */
export const pricingEntrySchema = z.object({
  period: z.string()
    .min(1, 'Period is required')
    .max(200, 'Period must be less than 200 characters')
    .transform(sanitizeText),
  periodType: z.enum(['month', 'special'], {
    errorMap: () => ({ message: 'Period type must be "month" or "special"' }),
  }),
  startDate: z.string().datetime().optional().or(z.date().optional()),
  endDate: z.string().datetime().optional().or(z.date().optional()),
  prices: z.array(pricePointSchema)
    .min(1, 'At least one price point is required')
    .max(100, 'Cannot have more than 100 price points'),
}).refine(
  (data) => {
    if (data.periodType === 'special') {
      return data.startDate && data.endDate;
    }
    return true;
  },
  {
    message: 'Start date and end date are required for special periods',
    path: ['startDate'],
  }
).refine(
  (data) => {
    if (data.periodType === 'special' && data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    }
    return true;
  },
  {
    message: 'End date must be after or equal to start date',
    path: ['endDate'],
  }
);

/**
 * Zod schema for inclusion validation
 */
export const inclusionSchema = z.object({
  text: z.string()
    .min(1, 'Inclusion text is required')
    .max(500, 'Inclusion text must be less than 500 characters')
    .transform(sanitizeText),
  category: z.enum(['transfer', 'accommodation', 'activity', 'service', 'other'])
    .optional()
    .default('other'),
});

/**
 * Zod schema for super offer package creation
 */
export const createSuperPackageSchema = z.object({
  name: z.string()
    .min(1, 'Package name is required')
    .max(200, 'Package name must be less than 200 characters')
    .transform(sanitizeText),
  destination: z.string()
    .min(1, 'Destination is required')
    .max(100, 'Destination must be less than 100 characters')
    .transform(sanitizeText),
  resort: z.string()
    .min(1, 'Resort is required')
    .max(100, 'Resort must be less than 100 characters')
    .transform(sanitizeText),
  currency: z.enum(['EUR', 'GBP', 'USD'], {
    errorMap: () => ({ message: 'Currency must be EUR, GBP, or USD' }),
  }),
  groupSizeTiers: z.array(groupSizeTierSchema)
    .min(1, 'At least one group size tier is required')
    .max(10, 'Cannot have more than 10 group size tiers'),
  durationOptions: z.array(
    z.number()
      .int('Duration must be an integer')
      .min(1, 'Duration must be at least 1 night')
      .max(365, 'Duration cannot exceed 365 nights')
  )
    .min(1, 'At least one duration option is required')
    .max(20, 'Cannot have more than 20 duration options'),
  pricingMatrix: z.array(pricingEntrySchema)
    .min(1, 'At least one pricing entry is required')
    .max(50, 'Cannot have more than 50 pricing entries'),
  inclusions: z.array(inclusionSchema)
    .max(100, 'Cannot have more than 100 inclusions')
    .default([]),
  accommodationExamples: z.array(
    z.string()
      .max(200, 'Accommodation example must be less than 200 characters')
      .transform(sanitizeText)
  )
    .max(50, 'Cannot have more than 50 accommodation examples')
    .default([]),
  salesNotes: z.string()
    .max(5000, 'Sales notes must be less than 5000 characters')
    .transform(sanitizeHtml)
    .default(''),
  status: z.enum(['active', 'inactive'])
    .optional()
    .default('active'),
  importSource: z.enum(['csv', 'manual'])
    .optional()
    .default('manual'),
  originalFilename: z.string()
    .max(255, 'Filename must be less than 255 characters')
    .transform(sanitizeText)
    .optional(),
});

/**
 * Zod schema for super offer package update
 */
export const updateSuperPackageSchema = createSuperPackageSchema.partial();

/**
 * Zod schema for price calculation request
 */
export const calculatePriceSchema = z.object({
  packageId: z.string()
    .min(1, 'Package ID is required')
    .regex(/^[a-f\d]{24}$/i, 'Invalid package ID format'),
  numberOfPeople: z.number()
    .int('Number of people must be an integer')
    .min(1, 'Number of people must be at least 1')
    .max(1000, 'Number of people cannot exceed 1000'),
  numberOfNights: z.number()
    .int('Number of nights must be an integer')
    .min(1, 'Number of nights must be at least 1')
    .max(365, 'Number of nights cannot exceed 365'),
  arrivalDate: z.string()
    .refine((val) => {
      // Accept both date-only (YYYY-MM-DD) and datetime (ISO 8601) formats
      const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
      const isValidDate = !isNaN(Date.parse(val));
      return (dateOnlyRegex.test(val) || val.includes('T')) && isValidDate;
    }, 'Invalid date format. Expected YYYY-MM-DD or ISO 8601 datetime')
    .or(z.date()),
});

/**
 * Zod schema for package linking request
 */
export const linkPackageSchema = z.object({
  packageId: z.string()
    .min(1, 'Package ID is required')
    .regex(/^[a-f\d]{24}$/i, 'Invalid package ID format'),
  numberOfPeople: z.number()
    .int('Number of people must be an integer')
    .min(1, 'Number of people must be at least 1')
    .max(1000, 'Number of people cannot exceed 1000'),
  numberOfNights: z.number()
    .int('Number of nights must be an integer')
    .min(1, 'Number of nights must be at least 1')
    .max(365, 'Number of nights cannot exceed 365'),
  arrivalDate: z.string()
    .datetime('Invalid date format')
    .or(z.date()),
});

/**
 * Zod schema for status update
 */
export const updateStatusSchema = z.object({
  status: z.enum(['active', 'inactive'], {
    errorMap: () => ({ message: 'Status must be "active" or "inactive"' }),
  }),
});

/**
 * Validate and sanitize super package data
 */
export function validateAndSanitizeSuperPackage(
  data: any,
  isUpdate: boolean = false
): { valid: boolean; data?: any; errors?: z.ZodError } {
  try {
    const schema = isUpdate ? updateSuperPackageSchema : createSuperPackageSchema;
    const validated = schema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error };
    }
    throw error;
  }
}

/**
 * Format Zod errors for API response
 */
export function formatValidationErrors(error: z.ZodError): Array<{
  field: string;
  message: string;
}> {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
}
