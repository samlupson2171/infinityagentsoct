import { ISuperOfferPackage } from '@/models/SuperOfferPackage';
import { IQuote } from '@/models/Quote';
import { PriceCalculationResult } from './pricing-calculator';

export interface QuoteLinkingData {
  packageId: string;
  numberOfPeople: number;
  numberOfNights: number;
  arrivalDate: Date;
  calculation: PriceCalculationResult;
}

export class QuoteLinker {
  /**
   * Link a package to a quote and populate quote fields
   */
  static linkPackageToQuote(
    quote: Partial<IQuote>,
    packageData: ISuperOfferPackage,
    linkingData: QuoteLinkingData
  ): Partial<IQuote> {
    const { calculation } = linkingData;

    // Populate basic quote fields
    quote.isSuperPackage = true;
    quote.numberOfPeople = linkingData.numberOfPeople;
    quote.numberOfNights = linkingData.numberOfNights;
    quote.arrivalDate = linkingData.arrivalDate;

    // Set hotel name from package
    if (!quote.hotelName || quote.hotelName === '') {
      quote.hotelName = packageData.accommodationExamples[0] || packageData.resort;
    }

    // Build inclusions text
    const inclusionsText = packageData.inclusions.map((inc) => inc.text).join('\n- ');
    quote.whatsIncluded = inclusionsText ? `- ${inclusionsText}` : '';

    // Check if transfers are included
    quote.transferIncluded = packageData.inclusions.some(
      (inc) => inc.category === 'transfer'
    );

    // Build activities text
    const activities = packageData.inclusions
      .filter((inc) => inc.category === 'activity')
      .map((inc) => inc.text)
      .join('\n- ');
    quote.activitiesIncluded = activities ? `- ${activities}` : '';

    // Set price
    if (calculation.price !== 'ON_REQUEST') {
      quote.totalPrice = calculation.price;
    }

    // Set currency
    quote.currency = calculation.currency;

    // Store package reference
    quote.linkedPackage = {
      packageId: packageData._id as any,
      packageName: packageData.name,
      packageVersion: packageData.version,
      selectedTier: {
        tierIndex: calculation.tier.index,
        tierLabel: calculation.tier.label,
      },
      selectedNights: calculation.nights,
      selectedPeriod: calculation.period.period,
      calculatedPrice: calculation.price === 'ON_REQUEST' ? 0 : calculation.price,
      priceWasOnRequest: calculation.price === 'ON_REQUEST',
    };

    return quote;
  }

  /**
   * Unlink a package from a quote
   */
  static unlinkPackageFromQuote(quote: Partial<IQuote>): Partial<IQuote> {
    quote.linkedPackage = undefined;
    quote.isSuperPackage = false;

    return quote;
  }

  /**
   * Check if a quote is linked to a package
   */
  static isQuoteLinkedToPackage(quote: IQuote): boolean {
    return !!quote.linkedPackage && !!quote.linkedPackage.packageId;
  }

  /**
   * Get package reference from quote
   */
  static getPackageReference(quote: IQuote): string | null {
    if (!quote.linkedPackage) {
      return null;
    }

    return `${quote.linkedPackage.packageName} (v${quote.linkedPackage.packageVersion})`;
  }

  /**
   * Format package details for display
   */
  static formatPackageDetails(quote: IQuote): string | null {
    if (!quote.linkedPackage) {
      return null;
    }

    const { linkedPackage } = quote;

    return `
Package: ${linkedPackage.packageName || 'N/A'}
Version: ${linkedPackage.packageVersion || 'N/A'}
Tier: ${linkedPackage.selectedTier?.tierLabel || 'Not specified'}
Duration: ${linkedPackage.selectedNights || 'N/A'} nights
Period: ${linkedPackage.selectedPeriod || 'Not specified'}
${linkedPackage.priceWasOnRequest ? 'Price: ON REQUEST' : `Price: ${linkedPackage.calculatedPrice || 'N/A'}`}
    `.trim();
  }
}
