import { IGroupSizeTier, IPricingEntry, IInclusion } from '@/models/SuperOfferPackage';

export interface ParsedSuperPackage {
  name: string;
  destination: string;
  resort: string;
  currency: 'EUR' | 'GBP' | 'USD';
  groupSizeTiers: IGroupSizeTier[];
  durationOptions: number[];
  pricingMatrix: IPricingEntry[];
  inclusions: IInclusion[];
  accommodationExamples: string[];
  salesNotes: string;
}

export class SuperPackageCSVParser {
  /**
   * Parse CSV content into SuperPackage structure
   */
  static parseCSV(csvContent: string): ParsedSuperPackage {
    const lines = csvContent.split('\n').map((line) => line.trim());

    // Extract header information
    const { name, destination, resort, currency } = this.extractHeaderInfo(lines);

    // Find the pricing table section
    const pricingStartIndex = this.findPricingTableStart(lines);

    if (pricingStartIndex === -1) {
      throw new Error('Could not find pricing table in CSV');
    }

    // Parse pricing table headers to get tiers and durations
    const headerLine = lines[pricingStartIndex];
    const { groupSizeTiers, durationOptions } = this.parseTableHeaders(headerLine);

    // Parse pricing matrix
    const pricingMatrix = this.parsePricingMatrix(
      lines,
      pricingStartIndex + 1,
      groupSizeTiers,
      durationOptions
    );

    // Extract inclusions
    const inclusions = this.extractInclusions(lines);

    // Extract accommodation examples
    const accommodationExamples = this.extractAccommodationExamples(lines);

    // Extract sales notes
    const salesNotes = this.extractSalesNotes(lines);

    return {
      name,
      destination,
      resort,
      currency,
      groupSizeTiers,
      durationOptions,
      pricingMatrix,
      inclusions,
      accommodationExamples,
      salesNotes,
    };
  }

  /**
   * Extract header information from the first few lines
   */
  private static extractHeaderInfo(lines: string[]): {
    name: string;
    destination: string;
    resort: string;
    currency: 'EUR' | 'GBP' | 'USD';
  } {
    let name = '';
    let destination = '';
    let resort = '';
    let currency: 'EUR' | 'GBP' | 'USD' = 'EUR';

    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i].toLowerCase();

      if (line.includes('package:') || line.includes('name:')) {
        name = lines[i].split(':')[1]?.trim() || '';
      } else if (line.includes('destination:')) {
        destination = lines[i].split(':')[1]?.trim() || '';
      } else if (line.includes('resort:')) {
        resort = lines[i].split(':')[1]?.trim() || '';
      } else if (line.includes('currency:')) {
        const curr = lines[i].split(':')[1]?.trim().toUpperCase();
        if (curr === 'EUR' || curr === 'GBP' || curr === 'USD') {
          currency = curr;
        }
      }
    }

    // If not found in metadata, try to infer from content
    if (!name) {
      name = lines[0] || 'Unnamed Package';
    }

    if (!destination && resort) {
      destination = resort;
    }

    return { name, destination, resort, currency };
  }

  /**
   * Find where the pricing table starts
   */
  private static findPricingTableStart(lines: string[]): number {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      // Look for lines that contain "people" or "pax" and numbers
      if (
        (line.includes('people') || line.includes('pax')) &&
        (line.includes('2 nights') || line.includes('3 nights') || line.includes('nights'))
      ) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Parse table headers to extract group size tiers and duration options
   */
  private static parseTableHeaders(headerLine: string): {
    groupSizeTiers: IGroupSizeTier[];
    durationOptions: number[];
  } {
    const cells = headerLine.split(',').map((c) => c.trim());

    const groupSizeTiers: IGroupSizeTier[] = [];
    const durationSet = new Set<number>();

    // Skip first cell (period column)
    for (let i = 1; i < cells.length; i++) {
      const cell = cells[i];

      // Extract group size info (e.g., "6-11 People - 2 Nights")
      const peopleMatch = cell.match(/(\d+)-(\d+)\s*(?:people|pax)/i);
      const nightsMatch = cell.match(/(\d+)\s*nights?/i);

      if (peopleMatch && nightsMatch) {
        const minPeople = parseInt(peopleMatch[1]);
        const maxPeople = parseInt(peopleMatch[2]);
        const nights = parseInt(nightsMatch[1]);

        // Add tier if not already added
        const tierLabel = `${minPeople}-${maxPeople} People`;
        if (!groupSizeTiers.find((t) => t.label === tierLabel)) {
          groupSizeTiers.push({
            label: tierLabel,
            minPeople,
            maxPeople,
          });
        }

        // Add duration
        durationSet.add(nights);
      }
    }

    return {
      groupSizeTiers,
      durationOptions: Array.from(durationSet).sort((a, b) => a - b),
    };
  }

  /**
   * Parse the pricing matrix rows
   */
  private static parsePricingMatrix(
    lines: string[],
    startIndex: number,
    groupSizeTiers: IGroupSizeTier[],
    durationOptions: number[]
  ): IPricingEntry[] {
    const pricingMatrix: IPricingEntry[] = [];

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];

      // Stop if we hit inclusions or other sections
      if (
        line.toLowerCase().includes('inclusions:') ||
        line.toLowerCase().includes('accommodation:') ||
        line.toLowerCase().includes('sales notes:') ||
        line === ''
      ) {
        break;
      }

      const cells = line.split(',').map((c) => c.trim());

      if (cells.length < 2) continue;

      const period = cells[0];

      if (!period) continue;

      // Determine period type
      const { periodType, startDate, endDate } = this.parsePeriod(period);

      const prices = [];

      // Parse prices for each tier/duration combination
      let cellIndex = 1;
      for (let tierIndex = 0; tierIndex < groupSizeTiers.length; tierIndex++) {
        for (const nights of durationOptions) {
          if (cellIndex < cells.length) {
            const priceCell = cells[cellIndex];
            const price = this.parsePrice(priceCell);

            prices.push({
              groupSizeTierIndex: tierIndex,
              nights,
              price,
            });

            cellIndex++;
          }
        }
      }

      if (prices.length > 0) {
        pricingMatrix.push({
          period,
          periodType,
          startDate,
          endDate,
          prices,
        });
      }
    }

    return pricingMatrix;
  }

  /**
   * Parse a period string to determine type and dates
   */
  private static parsePeriod(period: string): {
    periodType: 'month' | 'special';
    startDate?: Date;
    endDate?: Date;
  } {
    const months = [
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december',
    ];

    const lowerPeriod = period.toLowerCase();

    // Check if it's a month
    for (const month of months) {
      if (lowerPeriod.includes(month)) {
        return { periodType: 'month' };
      }
    }

    // Try to extract dates for special periods
    const dateMatch = period.match(/(\d{1,2}\/\d{1,2}\/\d{4})\s*-\s*(\d{1,2}\/\d{1,2}\/\d{4})/);

    if (dateMatch) {
      const startDate = this.parseDate(dateMatch[1]);
      const endDate = this.parseDate(dateMatch[2]);

      return {
        periodType: 'special',
        startDate,
        endDate,
      };
    }

    // Default to special if not a month
    return { periodType: 'special' };
  }

  /**
   * Parse a date string in DD/MM/YYYY format
   */
  private static parseDate(dateStr: string): Date {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // JS months are 0-indexed
      const year = parseInt(parts[2]);
      return new Date(year, month, day);
    }
    return new Date();
  }

  /**
   * Parse a price cell value
   */
  private static parsePrice(priceCell: string): number | 'ON_REQUEST' {
    const cleaned = priceCell.replace(/[£€$,\s]/g, '').toUpperCase();

    if (
      cleaned === 'ONREQUEST' ||
      cleaned === 'ON_REQUEST' ||
      cleaned === 'REQUEST' ||
      cleaned === 'POA'
    ) {
      return 'ON_REQUEST';
    }

    const price = parseFloat(cleaned);

    if (isNaN(price)) {
      return 'ON_REQUEST';
    }

    return price;
  }

  /**
   * Extract inclusions from the CSV
   */
  private static extractInclusions(lines: string[]): IInclusion[] {
    const inclusions: IInclusion[] = [];
    let inInclusionsSection = false;

    for (const line of lines) {
      if (line.toLowerCase().includes('inclusions:')) {
        inInclusionsSection = true;
        continue;
      }

      if (inInclusionsSection) {
        if (
          line.toLowerCase().includes('accommodation:') ||
          line.toLowerCase().includes('sales notes:') ||
          line === ''
        ) {
          break;
        }

        if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
          const text = line.substring(1).trim();
          if (text) {
            inclusions.push({
              text,
              category: this.categorizeInclusion(text),
            });
          }
        }
      }
    }

    return inclusions;
  }

  /**
   * Categorize an inclusion based on keywords
   */
  private static categorizeInclusion(
    text: string
  ): 'transfer' | 'accommodation' | 'activity' | 'service' | 'other' {
    const lower = text.toLowerCase();

    if (lower.includes('transfer') || lower.includes('airport') || lower.includes('transport')) {
      return 'transfer';
    }

    if (lower.includes('hotel') || lower.includes('accommodation') || lower.includes('room')) {
      return 'accommodation';
    }

    if (
      lower.includes('activity') ||
      lower.includes('excursion') ||
      lower.includes('tour') ||
      lower.includes('ticket')
    ) {
      return 'activity';
    }

    if (lower.includes('service') || lower.includes('assistance') || lower.includes('support')) {
      return 'service';
    }

    return 'other';
  }

  /**
   * Extract accommodation examples
   */
  private static extractAccommodationExamples(lines: string[]): string[] {
    const examples: string[] = [];
    let inAccommodationSection = false;

    for (const line of lines) {
      if (line.toLowerCase().includes('accommodation:') || line.toLowerCase().includes('hotels:')) {
        inAccommodationSection = true;
        continue;
      }

      if (inAccommodationSection) {
        if (line.toLowerCase().includes('sales notes:') || line === '') {
          break;
        }

        if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
          const example = line.substring(1).trim();
          if (example) {
            examples.push(example);
          }
        }
      }
    }

    return examples;
  }

  /**
   * Extract sales notes
   */
  private static extractSalesNotes(lines: string[]): string {
    let inSalesNotesSection = false;
    const notes: string[] = [];

    for (const line of lines) {
      if (line.toLowerCase().includes('sales notes:') || line.toLowerCase().includes('notes:')) {
        inSalesNotesSection = true;
        continue;
      }

      if (inSalesNotesSection) {
        if (line === '') {
          break;
        }
        notes.push(line);
      }
    }

    return notes.join(' ').trim();
  }

  /**
   * Detect currency from CSV content
   */
  static detectCurrency(csvContent: string): 'EUR' | 'GBP' | 'USD' {
    if (csvContent.includes('£')) return 'GBP';
    if (csvContent.includes('$')) return 'USD';
    if (csvContent.includes('€')) return 'EUR';

    // Default to EUR
    return 'EUR';
  }
}
