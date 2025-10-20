/**
 * Event Validation Utilities
 * 
 * Provides validation functions for event data
 */

import mongoose from 'mongoose';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validate event name
 */
export function validateEventName(name: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!name || name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Event name is required',
    });
  } else if (name.length < 2) {
    errors.push({
      field: 'name',
      message: 'Event name must be at least 2 characters long',
    });
  } else if (name.length > 100) {
    errors.push({
      field: 'name',
      message: 'Event name cannot exceed 100 characters',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate event description
 */
export function validateEventDescription(description?: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (description && description.length > 500) {
    errors.push({
      field: 'description',
      message: 'Description cannot exceed 500 characters',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate event categories
 */
export function validateEventCategories(
  categories: string[],
  isActive: boolean = true
): ValidationResult {
  const errors: ValidationError[] = [];

  if (!categories || !Array.isArray(categories)) {
    errors.push({
      field: 'categories',
      message: 'Categories must be an array',
    });
  } else if (isActive && categories.length === 0) {
    errors.push({
      field: 'categories',
      message: 'At least one category is required for active events',
    });
  } else {
    // Validate each category ID
    for (const categoryId of categories) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        errors.push({
          field: 'categories',
          message: `Invalid category ID: ${categoryId}`,
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate event destinations
 */
export function validateEventDestinations(
  destinations: string[],
  availableInAllDestinations: boolean,
  isActive: boolean = true
): ValidationResult {
  const errors: ValidationError[] = [];

  if (!destinations || !Array.isArray(destinations)) {
    errors.push({
      field: 'destinations',
      message: 'Destinations must be an array',
    });
  } else if (
    isActive &&
    !availableInAllDestinations &&
    destinations.length === 0
  ) {
    errors.push({
      field: 'destinations',
      message:
        'At least one destination is required unless event is available in all destinations',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate display order
 */
export function validateDisplayOrder(displayOrder?: number): ValidationResult {
  const errors: ValidationError[] = [];

  if (displayOrder !== undefined) {
    if (typeof displayOrder !== 'number') {
      errors.push({
        field: 'displayOrder',
        message: 'Display order must be a number',
      });
    } else if (displayOrder < 0) {
      errors.push({
        field: 'displayOrder',
        message: 'Display order cannot be negative',
      });
    } else if (!Number.isInteger(displayOrder)) {
      errors.push({
        field: 'displayOrder',
        message: 'Display order must be an integer',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate event pricing
 */
export function validateEventPricing(pricing?: {
  estimatedCost?: number;
  currency?: string;
}): ValidationResult {
  const errors: ValidationError[] = [];

  if (pricing) {
    if (pricing.estimatedCost !== undefined) {
      if (typeof pricing.estimatedCost !== 'number') {
        errors.push({
          field: 'pricing.estimatedCost',
          message: 'Estimated cost must be a number',
        });
      } else if (pricing.estimatedCost < 0) {
        errors.push({
          field: 'pricing.estimatedCost',
          message: 'Estimated cost cannot be negative',
        });
      }
    }

    if (pricing.currency !== undefined) {
      const validCurrencies = ['GBP', 'EUR', 'USD'];
      if (!validCurrencies.includes(pricing.currency)) {
        errors.push({
          field: 'pricing.currency',
          message: `Currency must be one of: ${validCurrencies.join(', ')}`,
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate complete event data
 */
export function validateEventData(data: {
  name: string;
  description?: string;
  categories: string[];
  destinations: string[];
  availableInAllDestinations: boolean;
  displayOrder?: number;
  isActive?: boolean;
  pricing?: {
    estimatedCost?: number;
    currency?: string;
  };
}): ValidationResult {
  const allErrors: ValidationError[] = [];

  // Validate each field
  const nameResult = validateEventName(data.name);
  allErrors.push(...nameResult.errors);

  const descriptionResult = validateEventDescription(data.description);
  allErrors.push(...descriptionResult.errors);

  const categoriesResult = validateEventCategories(
    data.categories,
    data.isActive !== false
  );
  allErrors.push(...categoriesResult.errors);

  const destinationsResult = validateEventDestinations(
    data.destinations,
    data.availableInAllDestinations,
    data.isActive !== false
  );
  allErrors.push(...destinationsResult.errors);

  const displayOrderResult = validateDisplayOrder(data.displayOrder);
  allErrors.push(...displayOrderResult.errors);

  const pricingResult = validateEventPricing(data.pricing);
  allErrors.push(...pricingResult.errors);

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}

/**
 * Validate category name
 */
export function validateCategoryName(name: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!name || name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Category name is required',
    });
  } else if (name.length < 2) {
    errors.push({
      field: 'name',
      message: 'Category name must be at least 2 characters long',
    });
  } else if (name.length > 50) {
    errors.push({
      field: 'name',
      message: 'Category name cannot exceed 50 characters',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate category slug
 */
export function validateCategorySlug(slug: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!slug || slug.trim().length === 0) {
    errors.push({
      field: 'slug',
      message: 'Category slug is required',
    });
  } else if (!/^[a-z0-9-]+$/.test(slug)) {
    errors.push({
      field: 'slug',
      message: 'Slug can only contain lowercase letters, numbers, and hyphens',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate category color
 */
export function validateCategoryColor(color?: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
    errors.push({
      field: 'color',
      message: 'Color must be a valid hex color code (e.g., #FF5733)',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate complete category data
 */
export function validateCategoryData(data: {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  displayOrder?: number;
}): ValidationResult {
  const allErrors: ValidationError[] = [];

  const nameResult = validateCategoryName(data.name);
  allErrors.push(...nameResult.errors);

  const slugResult = validateCategorySlug(data.slug);
  allErrors.push(...slugResult.errors);

  const colorResult = validateCategoryColor(data.color);
  allErrors.push(...colorResult.errors);

  const displayOrderResult = validateDisplayOrder(data.displayOrder);
  allErrors.push(...displayOrderResult.errors);

  if (data.description && data.description.length > 200) {
    allErrors.push({
      field: 'description',
      message: 'Description cannot exceed 200 characters',
    });
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}
