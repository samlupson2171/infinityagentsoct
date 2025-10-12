import { SuperPackageCSVExporter } from '../super-package-csv-exporter';
import { ISuperOfferPackage } from '@/models/SuperOfferPackage';

describe('SuperPackageCSVExporter', () => {
  const mockPackage: Partial<ISuperOfferPackage> = {
    _id: '123' as any,
    name: 'Benidorm Super Package',
    destination: 'Benidorm',
    resort: 'Costa Blanca',
    currency: 'EUR',
    groupSizeTiers: [
      { label: '6-11 People', minPeople: 6, maxPeople: 11 },
      { label: '12+ People', minPeople: 12, maxPeople: 999 },
    ],
    durationOptions: [2, 3, 4],
    pricingMatrix: [
      {
        period: 'January',
        periodType: 'month',
        prices: [
          { groupSizeTierIndex: 0, nights: 2, price: 150 },
          { groupSizeTierIndex: 0, nights: 3, price: 200 },
          { groupSizeTierIndex: 0, nights: 4, price: 250 },
          { groupSizeTierIndex: 1, nights: 2, price: 120 },
          { groupSizeTierIndex: 1, nights: 3, price: 160 },
          { groupSizeTierIndex: 1, nights: 4, price: 200 },
        ],
      },
      {
        period: 'Easter',
        periodType: 'special',
        startDate: new Date('2025-04-02'),
        endDate: new Date('2025-04-06'),
        prices: [
          { groupSizeTierIndex: 0, nights: 2, price: 'ON_REQUEST' },
          { groupSizeTierIndex: 0, nights: 3, price: 'ON_REQUEST' },
          { groupSizeTierIndex: 0, nights: 4, price: 'ON_REQUEST' },
          { groupSizeTierIndex: 1, nights: 2, price: 180 },
          { groupSizeTierIndex: 1, nights: 3, price: 240 },
          { groupSizeTierIndex: 1, nights: 4, price: 300 },
        ],
      },
    ],
    inclusions: [
      { text: 'Airport transfers', category: 'transfer' },
      { text: '3-star hotel accommodation', category: 'accommodation' },
      { text: 'Welcome drink', category: 'service' },
    ],
    accommodationExamples: [
      'Hotel Benidorm Plaza',
      'Hotel RH Princesa',
      'Hotel Servigroup Nereo',
    ],
    salesNotes: 'Perfect for groups looking for sun and fun!',
  };

  describe('exportPackage', () => {
    it('should export a package to CSV format', () => {
      const csv = SuperPackageCSVExporter.exportPackage(mockPackage as ISuperOfferPackage);

      expect(csv).toContain('Package: Benidorm Super Package');
      expect(csv).toContain('Destination: Benidorm');
      expect(csv).toContain('Resort: Costa Blanca');
      expect(csv).toContain('Currency: EUR');
    });

    it('should include pricing table headers', () => {
      const csv = SuperPackageCSVExporter.exportPackage(mockPackage as ISuperOfferPackage);

      expect(csv).toContain('6-11 People - 2 Nights');
      expect(csv).toContain('6-11 People - 3 Nights');
      expect(csv).toContain('12+ People - 2 Nights');
    });

    it('should include pricing data with currency symbols', () => {
      const csv = SuperPackageCSVExporter.exportPackage(mockPackage as ISuperOfferPackage);

      expect(csv).toContain('€150.00');
      expect(csv).toContain('€200.00');
      expect(csv).toContain('€120.00');
    });

    it('should handle ON_REQUEST pricing', () => {
      const csv = SuperPackageCSVExporter.exportPackage(mockPackage as ISuperOfferPackage);

      expect(csv).toContain('ON REQUEST');
    });

    it('should format special periods with dates', () => {
      const csv = SuperPackageCSVExporter.exportPackage(mockPackage as ISuperOfferPackage);

      expect(csv).toContain('Easter (02/04/2025 - 06/04/2025)');
    });

    it('should include inclusions section', () => {
      const csv = SuperPackageCSVExporter.exportPackage(mockPackage as ISuperOfferPackage);

      expect(csv).toContain('Inclusions:');
      expect(csv).toContain('- Airport transfers');
      expect(csv).toContain('- 3-star hotel accommodation');
      expect(csv).toContain('- Welcome drink');
    });

    it('should include accommodation examples', () => {
      const csv = SuperPackageCSVExporter.exportPackage(mockPackage as ISuperOfferPackage);

      expect(csv).toContain('Accommodation:');
      expect(csv).toContain('- Hotel Benidorm Plaza');
      expect(csv).toContain('- Hotel RH Princesa');
    });

    it('should include sales notes', () => {
      const csv = SuperPackageCSVExporter.exportPackage(mockPackage as ISuperOfferPackage);

      expect(csv).toContain('Sales Notes:');
      expect(csv).toContain('Perfect for groups looking for sun and fun!');
    });

    it('should use GBP symbol for GBP currency', () => {
      const gbpPackage = { ...mockPackage, currency: 'GBP' as const };
      const csv = SuperPackageCSVExporter.exportPackage(gbpPackage as ISuperOfferPackage);

      expect(csv).toContain('£150.00');
    });

    it('should use USD symbol for USD currency', () => {
      const usdPackage = { ...mockPackage, currency: 'USD' as const };
      const csv = SuperPackageCSVExporter.exportPackage(usdPackage as ISuperOfferPackage);

      expect(csv).toContain('$150.00');
    });
  });

  describe('exportMultiplePackages', () => {
    it('should export multiple packages separated by dividers', () => {
      const package2 = {
        ...mockPackage,
        _id: '456' as any,
        name: 'Albufeira Super Package',
        destination: 'Albufeira',
      };

      const csv = SuperPackageCSVExporter.exportMultiplePackages([
        mockPackage as ISuperOfferPackage,
        package2 as ISuperOfferPackage,
      ]);

      expect(csv).toContain('Benidorm Super Package');
      expect(csv).toContain('Albufeira Super Package');
      expect(csv).toContain('='.repeat(80));
    });

    it('should handle single package', () => {
      const csv = SuperPackageCSVExporter.exportMultiplePackages([
        mockPackage as ISuperOfferPackage,
      ]);

      expect(csv).toContain('Benidorm Super Package');
      expect(csv).not.toContain('='.repeat(80));
    });
  });

  describe('generateFilename', () => {
    it('should generate a valid filename', () => {
      const filename = SuperPackageCSVExporter.generateFilename(
        mockPackage as ISuperOfferPackage
      );

      expect(filename).toMatch(/^super-package-benidorm-super-package-\d{4}-\d{2}-\d{2}\.csv$/);
    });

    it('should sanitize package name', () => {
      const specialPackage = {
        ...mockPackage,
        name: 'Test Package! @#$ Special',
      };

      const filename = SuperPackageCSVExporter.generateFilename(
        specialPackage as ISuperOfferPackage
      );

      expect(filename).toMatch(/^super-package-test-package-special-\d{4}-\d{2}-\d{2}\.csv$/);
    });
  });

  describe('generateBulkFilename', () => {
    it('should generate a bulk export filename', () => {
      const filename = SuperPackageCSVExporter.generateBulkFilename();

      expect(filename).toMatch(/^super-packages-export-\d{4}-\d{2}-\d{2}\.csv$/);
    });
  });
});
