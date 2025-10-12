/**
 * TypeScript interfaces for Quote-Package Price Integration
 * These types support the price synchronization features between quotes and super packages
 */

import { ObjectId } from 'mongoose';

/**
 * Information about a package linked to a quote
 * Used to track the relationship and enable price synchronization
 */
export interface LinkedPackageInfo {
  packageId: string;
  packageName: string;
  packageVersion: number;
  tierIndex: number;
  tierLabel: string;
  periodUsed: string;
  originalPrice: number | 'ON_REQUEST';
}

/**
 * Detailed breakdown of price calculation
 * Provides transparency into how the final price was calculated
 */
export interface PriceBreakdown {
  pricePerPerson: number;
  numberOfPeople: number;
  totalPrice: number;
  tierUsed: string;
  periodUsed: string;
  currency: string;
}

/**
 * Complete package selection data returned from PackageSelector
 * Contains all information needed to populate a quote form
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
