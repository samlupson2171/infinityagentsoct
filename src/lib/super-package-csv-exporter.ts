import { ISuperOfferPackage } from '@/models/SuperOfferPackage';

/**
 * Service for exporting SuperOfferPackages to CSV format
 * Generates CSV in the same format as the import parser expects
 */
export class SuperPackageCSVExporter {
  /**
   * Export a single package to CSV format
   */
  static exportPackage(pkg: ISuperOfferPackage): string {
    const lines: string[] = [];

    // Add header information
    lines.push(`Package: ${pkg.name}`);
    lines.push(`Destination: ${pkg.destination}`);
    lines.push(`Resort: ${pkg.resort}`);
    lines.push(`Currency: ${pkg.currency}`);
    lines.push(''); // Empty line

    // Build pricing table
    lines.push(...this.buildPricingTable(pkg));
    lines.push(''); // Empty line

    // Add inclusions
    if (pkg.inclusions && pkg.inclusions.length > 0) {
      lines.push('Inclusions:');
      pkg.inclusions.forEach((inclusion) => {
        lines.push(`- ${inclusion.text}`);
      });
      lines.push(''); // Empty line
    }

    // Add accommodation examples
    if (pkg.accommodationExamples && pkg.accommodationExamples.length > 0) {
      lines.push('Accommodation:');
      pkg.accommodationExamples.forEach((example) => {
        lines.push(`- ${example}`);
      });
      lines.push(''); // Empty line
    }

    // Add sales notes
    if (pkg.salesNotes) {
      lines.push('Sales Notes:');
      lines.push(pkg.salesNotes);
    }

    return lines.join('\n');
  }

  /**
   * Build the pricing table section
   */
  private static buildPricingTable(pkg: ISuperOfferPackage): string[] {
    const lines: string[] = [];

    // Build header row
    const headerCells = ['Period'];

    // Add column headers for each tier/duration combination
    for (const tier of pkg.groupSizeTiers) {
      for (const nights of pkg.durationOptions) {
        headerCells.push(`${tier.label} - ${nights} Nights`);
      }
    }

    lines.push(headerCells.join(','));

    // Build data rows for each pricing period
    for (const entry of pkg.pricingMatrix) {
      const rowCells = [this.formatPeriod(entry)];

      // Add prices for each tier/duration combination
      for (let tierIndex = 0; tierIndex < pkg.groupSizeTiers.length; tierIndex++) {
        for (const nights of pkg.durationOptions) {
          const pricePoint = entry.prices.find(
            (p) => p.groupSizeTierIndex === tierIndex && p.nights === nights
          );

          if (pricePoint) {
            rowCells.push(this.formatPrice(pricePoint.price, pkg.currency));
          } else {
            rowCells.push('ON REQUEST');
          }
        }
      }

      lines.push(rowCells.join(','));
    }

    return lines;
  }

  /**
   * Format a pricing period for display
   */
  private static formatPeriod(entry: any): string {
    if (entry.periodType === 'special' && entry.startDate && entry.endDate) {
      const start = this.formatDate(entry.startDate);
      const end = this.formatDate(entry.endDate);
      return `${entry.period} (${start} - ${end})`;
    }

    return entry.period;
  }

  /**
   * Format a date as DD/MM/YYYY
   */
  private static formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Format a price with currency symbol
   */
  private static formatPrice(price: number | 'ON_REQUEST', currency: string): string {
    if (price === 'ON_REQUEST') {
      return 'ON REQUEST';
    }

    const symbol = this.getCurrencySymbol(currency);
    return `${symbol}${price.toFixed(2)}`;
  }

  /**
   * Get currency symbol
   */
  private static getCurrencySymbol(currency: string): string {
    switch (currency) {
      case 'GBP':
        return '£';
      case 'USD':
        return '$';
      case 'EUR':
      default:
        return '€';
    }
  }

  /**
   * Export multiple packages to a single CSV file
   * Each package is separated by a blank line and a separator
   */
  static exportMultiplePackages(packages: ISuperOfferPackage[]): string {
    const sections: string[] = [];

    packages.forEach((pkg, index) => {
      if (index > 0) {
        sections.push('\n\n' + '='.repeat(80) + '\n\n');
      }
      sections.push(this.exportPackage(pkg));
    });

    return sections.join('');
  }

  /**
   * Generate a filename for the export
   */
  static generateFilename(pkg: ISuperOfferPackage): string {
    const sanitized = pkg.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const date = new Date().toISOString().split('T')[0];
    return `super-package-${sanitized}-${date}.csv`;
  }

  /**
   * Generate a filename for bulk export
   */
  static generateBulkFilename(): string {
    const date = new Date().toISOString().split('T')[0];
    return `super-packages-export-${date}.csv`;
  }
}
