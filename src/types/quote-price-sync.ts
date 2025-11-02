/**
 * TypeScript interfaces for Quote-Package Price Integration
 * These types support the price synchronization features between quotes and super packages
 */

import { ObjectId } from 'mongoose';

/**
 * Information about a package linked to a quote
 * Used to track the relationship and enable price synchronization
 * 
 * @property {string} packageId - Unique identifier of the linked package
 * @property {string} packageName - Display name of the package
 * @property {number} packageVersion - Version number of the package
 * @property {number} tierIndex - Index of the selected pricing tier
 * @property {string} tierLabel - Label of the selected pricing tier (e.g., "2-4 people")
 * @property {string} periodUsed - Pricing period used (e.g., "December", "Peak Season")
 * @property {number | 'ON_REQUEST'} originalPrice - Total price for the entire group (pricePerPerson × numberOfPeople)
 * @property {number | 'ON_REQUEST'} [pricePerPerson] - Per-person price from database (optional for backward compatibility)
 */
export interface LinkedPackageInfo {
  packageId: string;
  packageName: string;
  packageVersion: number;
  tierIndex: number;
  tierLabel: string;
  periodUsed: string;
  originalPrice: number | 'ON_REQUEST'; // Total price for the group
  pricePerPerson?: number | 'ON_REQUEST'; // Optional: Per-person price (for backward compatibility)
}

/**
 * Detailed breakdown of price calculation
 * Provides transparency into how the final price was calculated
 * 
 * @property {number} pricePerPerson - Per-person price from database (base rate)
 * @property {number} numberOfPeople - Number of people in the booking
 * @property {number} totalPrice - Total price for entire group (pricePerPerson × numberOfPeople)
 * @property {string} tierUsed - Label of the pricing tier used
 * @property {string} periodUsed - Pricing period used
 * @property {string} currency - Currency code (GBP, EUR, USD)
 */
export interface PriceBreakdown {
  /** Per-person price from database (base rate) */
  pricePerPerson: number;
  /** Number of people in the booking */
  numberOfPeople: number;
  /** Total price for entire group (pricePerPerson × numberOfPeople) */
  totalPrice: number;
  tierUsed: string;
  periodUsed: string;
  currency: string;
}

/**
 * Complete package selection data returned from PackageSelector
 * Contains all information needed to populate a quote form
 * 
 * @property {string} packageId - Unique identifier of the selected package
 * @property {string} packageName - Display name of the package
 * @property {number} packageVersion - Version number of the package
 * @property {number} numberOfPeople - Number of people for the booking
 * @property {number} numberOfNights - Number of nights for the booking
 * @property {string} arrivalDate - Arrival date in ISO format
 * @property {object} priceCalculation - Detailed pricing information
 * @property {number | 'ON_REQUEST'} priceCalculation.pricePerPerson - Per-person price from database (base rate)
 * @property {number | 'ON_REQUEST'} priceCalculation.totalPrice - Total price for entire group (pricePerPerson × numberOfPeople)
 * @property {number | 'ON_REQUEST'} priceCalculation.price - @deprecated Use totalPrice instead. Kept for backward compatibility.
 * @property {string} priceCalculation.tierUsed - Label of the pricing tier used
 * @property {number} priceCalculation.tierIndex - Index of the pricing tier
 * @property {string} priceCalculation.periodUsed - Pricing period used
 * @property {string} priceCalculation.currency - Currency code (GBP, EUR, USD)
 * @property {object} [priceCalculation.breakdown] - Optional detailed price breakdown
 * @property {Array} inclusions - List of items included in the package
 * @property {string[]} accommodationExamples - Example accommodation options
 */
export interface PackageSelection {
  // Package identification
  packageId: string;
  packageName: string;
  packageVersion: number;

  // Parameters
  numberOfPeople: number;
  numberOfNights: number;
  arrivalDate: string;

  // Pricing details
  priceCalculation: {
    /** Per-person price from database (base rate) */
    pricePerPerson: number | 'ON_REQUEST';
    /** Total price for entire group (pricePerPerson × numberOfPeople) */
    totalPrice: number | 'ON_REQUEST';
    /** @deprecated Use totalPrice instead. Kept for backward compatibility, equals totalPrice */
    price: number | 'ON_REQUEST';
    tierUsed: string;
    tierIndex: number;
    periodUsed: string;
    currency: string;
    breakdown?: {
      pricePerPerson: number;
      numberOfPeople: number;
      totalPrice: number;
    };
  };

  // Package content
  inclusions: Array<{ text: string; category?: string }>;
  accommodationExamples: string[];
}

/**
 * Status of price synchronization between quote and package
 */
export type SyncStatus =
  | 'synced' // Price matches calculated package price
  | 'calculating' // Price calculation in progress
  | 'custom' // Price manually overridden
  | 'error' // Error during calculation
  | 'out-of-sync'; // Parameters changed, needs recalculation

/**
 * Options for the useQuotePrice hook
 */
export interface UseQuotePriceOptions {
  linkedPackage: LinkedPackageInfo | null;
  numberOfPeople: number;
  numberOfNights: number;
  arrivalDate: string;
  currentPrice: number;
  onPriceUpdate: (price: number) => void;
  autoRecalculate?: boolean; // Default: true
}

/**
 * Return value from the useQuotePrice hook
 */
export interface UseQuotePriceReturn {
  // State
  syncStatus: SyncStatus;
  calculatedPrice: number | 'ON_REQUEST' | null;
  priceBreakdown: PriceBreakdown | null;
  error: string | null;

  // Actions
  recalculatePrice: () => Promise<void>;
  markAsCustomPrice: () => void;
  resetToCalculated: () => void;

  // Validation
  validationWarnings: string[];
  isParameterValid: boolean;

  // Error handling (extended)
  errorHandlingResult?: any; // ErrorHandlingResult from error handler
  isRetryable?: boolean;
}

/**
 * Price history entry for tracking price changes
 */
export interface PriceHistoryEntry {
  price: number;
  reason: 'package_selection' | 'recalculation' | 'manual_override';
  timestamp: Date;
  userId: string | ObjectId;
}

/**
 * Props for the PriceSyncIndicator component
 */
export interface PriceSyncIndicatorProps {
  status: SyncStatus;
  priceBreakdown?: PriceBreakdown;
  error?: string;
  onRecalculate?: () => void;
  onResetToCalculated?: () => void;
}

/**
 * Props for the PackageSelector component
 */
export interface PackageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selection: PackageSelection) => void;
  destinationFilter?: string;
  initialPeople?: number;
  initialNights?: number;
  initialDate?: string;
}

/**
 * Validation warning for parameter compatibility
 */
export interface ValidationWarning {
  field: 'numberOfNights' | 'numberOfPeople' | 'arrivalDate';
  message: string;
  suggestedValues?: (string | number)[];
}
