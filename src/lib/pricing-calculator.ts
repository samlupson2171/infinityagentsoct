import {
  ISuperOfferPackage,
  IGroupSizeTier,
  IPricingEntry,
  IPricePoint,
} from '@/models/SuperOfferPackage';

export interface PriceCalculationResult {
  price: number | 'ON_REQUEST';
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

    return {
      price: pricePoint.price,
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
      packageId: packageData._id.toString(),
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
