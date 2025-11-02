import {
  ISuperOfferPackage,
  IGroupSizeTier,
  IPricingEntry,
  IPricePoint,
} from '@/models/SuperOfferPackage';

export interface PriceCalculationResult {
  // NEW: Per-person price from database (this is the base rate)
  pricePerPerson: number | 'ON_REQUEST';
  // NEW: Total price for the entire group (pricePerPerson × numberOfPeople)
  totalPrice: number | 'ON_REQUEST';
  // DEPRECATED: Kept for backward compatibility, equals totalPrice
  price: number | 'ON_REQUEST';
  // NEW: Number of people used in the calculation
  numberOfPeople: number;
  tier: {
    index: number;
    label: string;
    minPeople: number;
    maxPeople: number;
  };
  period: {
    period: string;
    periodType: 'month' | 'special';
    startDate?: Date;
    endDate?: Date;
  };
  nights: number;
  currency: string;
  packageName: string;
  packageId: string;
  packageVersion: number;
}

export class PricingCalculator {
  /**
   * Determine which group size tier applies for the given number of people
   */
  static determineTier(
    groupSizeTiers: IGroupSizeTier[],
    numberOfPeople: number
  ): { tier: IGroupSizeTier; index: number } | null {
    for (let i = 0; i < groupSizeTiers.length; i++) {
      const tier = groupSizeTiers[i];
      if (numberOfPeople >= tier.minPeople && numberOfPeople <= tier.maxPeople) {
        return { tier, index: i };
      }
    }
    return null;
  }

  /**
   * Determine which pricing period applies for the given arrival date
   */
  static determinePeriod(
    pricingMatrix: IPricingEntry[],
    arrivalDate: Date
  ): IPricingEntry | null {
    const arrivalMonth = arrivalDate.toLocaleString('en-US', { month: 'long' });

    // First check for special periods that match the date
    for (const entry of pricingMatrix) {
      if (entry.periodType === 'special' && entry.startDate && entry.endDate) {
        const start = new Date(entry.startDate);
        const end = new Date(entry.endDate);

        if (arrivalDate >= start && arrivalDate <= end) {
          return entry;
        }
      }
    }

    // Then check for month-based periods
    for (const entry of pricingMatrix) {
      if (entry.periodType === 'month' && entry.period === arrivalMonth) {
        return entry;
      }
    }

    return null;
  }

  /**
   * Validate price calculation results
   * Ensures totalPrice is correctly calculated from pricePerPerson
   */
  private static validatePriceCalculation(
    pricePerPerson: number | 'ON_REQUEST',
    totalPrice: number | 'ON_REQUEST',
    numberOfPeople: number
  ): { valid: boolean; error?: string } {
    // ON_REQUEST prices are always valid
    if (pricePerPerson === 'ON_REQUEST' || totalPrice === 'ON_REQUEST') {
      if (pricePerPerson === 'ON_REQUEST' && totalPrice === 'ON_REQUEST') {
        return { valid: true };
      }
      // Both should be ON_REQUEST or both should be numbers
      console.error('[PricingCalculator] Validation failed: Inconsistent ON_REQUEST state', {
        pricePerPerson,
        totalPrice,
      });
      return { 
        valid: false, 
        error: 'Inconsistent price state: both pricePerPerson and totalPrice must be ON_REQUEST or both must be numbers' 
      };
    }

    // Validate totalPrice >= pricePerPerson
    if (totalPrice < pricePerPerson) {
      console.error('[PricingCalculator] Validation failed: totalPrice < pricePerPerson', {
        pricePerPerson,
        totalPrice,
        numberOfPeople,
      });
      return { 
        valid: false, 
        error: `Invalid price calculation: totalPrice (${totalPrice}) is less than pricePerPerson (${pricePerPerson})` 
      };
    }

    // Validate totalPrice equals pricePerPerson × numberOfPeople (with small tolerance for floating point)
    const expectedTotal = pricePerPerson * numberOfPeople;
    const tolerance = 0.01; // Allow 1 cent difference for floating point precision
    
    if (Math.abs(totalPrice - expectedTotal) > tolerance) {
      console.error('[PricingCalculator] Validation failed: totalPrice != pricePerPerson × numberOfPeople', {
        pricePerPerson,
        totalPrice,
        numberOfPeople,
        expectedTotal,
        difference: totalPrice - expectedTotal,
      });
      return { 
        valid: false, 
        error: `Invalid price calculation: totalPrice (${totalPrice}) does not equal pricePerPerson (${pricePerPerson}) × numberOfPeople (${numberOfPeople}) = ${expectedTotal}` 
      };
    }

    // For multiple people, totalPrice should be greater than pricePerPerson
    if (numberOfPeople > 1 && totalPrice <= pricePerPerson) {
      console.error('[PricingCalculator] Validation failed: totalPrice <= pricePerPerson for multiple people', {
        pricePerPerson,
        totalPrice,
        numberOfPeople,
      });
      return { 
        valid: false, 
        error: `Invalid price calculation: for ${numberOfPeople} people, totalPrice (${totalPrice}) should be greater than pricePerPerson (${pricePerPerson})` 
      };
    }

    return { valid: true };
  }

  /**
   * Calculate the price for a package based on parameters
   */
  static calculatePrice(
    packageData: ISuperOfferPackage,
    numberOfPeople: number,
    numberOfNights: number,
    arrivalDate: Date
  ): PriceCalculationResult | { error: string } {
    // Validate inputs
    if (numberOfPeople < 1) {
      return { error: 'Number of people must be at least 1' };
    }

    if (numberOfNights < 1) {
      return { error: 'Number of nights must be at least 1' };
    }

    // Determine tier
    const tierResult = this.determineTier(
      packageData.groupSizeTiers,
      numberOfPeople
    );

    if (!tierResult) {
      return {
        error: `No pricing tier available for ${numberOfPeople} people. Available tiers: ${packageData.groupSizeTiers
          .map((t) => t.label)
          .join(', ')}`,
      };
    }

    // Determine period
    const period = this.determinePeriod(packageData.pricingMatrix, arrivalDate);

    if (!period) {
      return {
        error: `No pricing available for arrival date ${arrivalDate.toLocaleDateString()}`,
      };
    }

    // Check if duration is available
    if (!packageData.durationOptions.includes(numberOfNights)) {
      return {
        error: `${numberOfNights} nights not available. Available durations: ${packageData.durationOptions.join(
          ', '
        )} nights`,
      };
    }

    // Find the price point
    const pricePoint = period.prices.find(
      (p: IPricePoint) =>
        p.groupSizeTierIndex === tierResult.index && p.nights === numberOfNights
    );

    if (!pricePoint) {
      return {
        error: `No price found for ${tierResult.tier.label} and ${numberOfNights} nights in ${period.period}`,
      };
    }

    // IMPORTANT: Prices in the database are PER-PERSON rates
    // We must multiply by numberOfPeople to get the total price for the group
    const perPersonPrice = pricePoint.price; // Per-person rate from database
    
    // Calculate total price: per-person price × number of people
    // Handle 'ON_REQUEST' prices correctly - they remain 'ON_REQUEST'
    const totalPrice = perPersonPrice === 'ON_REQUEST' 
      ? 'ON_REQUEST' 
      : perPersonPrice * numberOfPeople;

    // Validate the price calculation
    const validation = this.validatePriceCalculation(perPersonPrice, totalPrice, numberOfPeople);
    if (!validation.valid) {
      console.error('[PricingCalculator] Price calculation validation failed', {
        packageId: (packageData._id as any)?.toString() || '',
        packageName: packageData.name,
        numberOfPeople,
        numberOfNights,
        perPersonPrice,
        totalPrice,
        error: validation.error,
      });
      // Return error but don't block the calculation - log for monitoring
      // In production, you might want to return the error instead
    }

    return {
      pricePerPerson: perPersonPrice,
      totalPrice: totalPrice,
      price: totalPrice, // For backward compatibility, equals totalPrice
      numberOfPeople: numberOfPeople,
      tier: {
        index: tierResult.index,
        label: tierResult.tier.label,
        minPeople: tierResult.tier.minPeople,
        maxPeople: tierResult.tier.maxPeople,
      },
      period: {
        period: period.period,
        periodType: period.periodType,
        startDate: period.startDate,
        endDate: period.endDate,
      },
      nights: numberOfNights,
      currency: packageData.currency,
      packageName: packageData.name,
      packageId: (packageData._id as any)?.toString() || '',
      packageVersion: packageData.version,
    };
  }

  /**
   * Validate if a package can be used for the given parameters
   */
  static validateParameters(
    packageData: ISuperOfferPackage,
    numberOfPeople: number,
    numberOfNights: number,
    arrivalDate: Date
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (numberOfPeople < 1) {
      errors.push('Number of people must be at least 1');
    }

    if (numberOfNights < 1) {
      errors.push('Number of nights must be at least 1');
    }

    const tierResult = this.determineTier(
      packageData.groupSizeTiers,
      numberOfPeople
    );

    if (!tierResult) {
      errors.push(
        `No pricing tier available for ${numberOfPeople} people. Available tiers: ${packageData.groupSizeTiers
          .map((t) => t.label)
          .join(', ')}`
      );
    }

    const period = this.determinePeriod(packageData.pricingMatrix, arrivalDate);

    if (!period) {
      errors.push(
        `No pricing available for arrival date ${arrivalDate.toLocaleDateString()}`
      );
    }

    if (!packageData.durationOptions.includes(numberOfNights)) {
      errors.push(
        `${numberOfNights} nights not available. Available durations: ${packageData.durationOptions.join(
          ', '
        )} nights`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
