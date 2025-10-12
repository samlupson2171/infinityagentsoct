import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import SuperOfferPackage, {
  ISuperOfferPackage,
  IGroupSizeTier,
  IPricingEntry,
  IInclusion,
} from '../SuperOfferPackage';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';
import { afterEach } from 'vitest';
import { afterAll } from 'vitest';
import { beforeAll } from 'vitest';
import { describe } from 'vitest';

describe('SuperOfferPackage Model', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Disconnect if already connected
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoServer.stop();
  });

  afterEach(async () => {
    await SuperOfferPackage.deleteMany({});
  });

  const createValidPackageData = () => ({
    name: 'Benidorm Super Package',
    destination: 'Benidorm',
    resort: 'Costa Blanca',
    currency: 'EUR' as const,
    groupSizeTiers: [
      {
        label: '6-11 People',
        minPeople: 6,
        maxPeople: 11,
      },
      {
        label: '12+ People',
        minPeople: 12,
        maxPeople: 999,
      },
    ] as IGroupSizeTier[],
    durationOptions: [2, 3, 4],
    pricingMatrix: [
      {
        period: 'January',
        periodType: 'month' as const,
        prices: [
          { groupSizeTierIndex: 0, nights: 2, price: 150 },
          { groupSizeTierIndex: 0, nights: 3, price: 200 },
          { groupSizeTierIndex: 1, nights: 2, price: 130 },
          { groupSizeTierIndex: 1, nights: 3, price: 170 },
        ],
      },
    ] as IPricingEntry[],
    inclusions: [
      { text: 'Airport transfers', category: 'transfer' as const },
      { text: '3-star accommodation', category: 'accommodation' as const },
    ] as IInclusion[],
    accommodationExamples: ['Hotel Sol', 'Hotel Luna'],
    salesNotes: 'Great value package for groups',
    status: 'active' as const,
    createdBy: new mongoose.Types.ObjectId(),
    lastModifiedBy: new mongoose.Types.ObjectId(),
  });

  describe('Model Creation', () => {
    it('should create a valid super offer package', async () => {
      const packageData = createValidPackageData();
      const superPackage = new SuperOfferPackage(packageData);
      const savedPackage = await superPackage.save();

      expect(savedPackage._id).toBeDefined();
      expect(savedPackage.name).toBe(packageData.name);
      expect(savedPackage.destination).toBe(packageData.destination);
      expect(savedPackage.resort).toBe(packageData.resort);
      expect(savedPackage.currency).toBe(packageData.currency);
      expect(savedPackage.version).toBe(1);
      expect(savedPackage.status).toBe('active');
    });

    it('should set default values correctly', async () => {
      const packageData = createValidPackageData();
      const superPackage = new SuperOfferPackage(packageData);
      const savedPackage = await superPackage.save();

      expect(savedPackage.version).toBe(1);
      expect(savedPackage.status).toBe('active');
      expect(savedPackage.importSource).toBe('manual');
      expect(savedPackage.createdAt).toBeDefined();
      expect(savedPackage.updatedAt).toBeDefined();
    });

    it('should set lastModifiedBy to createdBy on creation', async () => {
      const packageData = createValidPackageData();
      delete (packageData as any).lastModifiedBy;
      
      const superPackage = new SuperOfferPackage(packageData);
      const savedPackage = await superPackage.save();

      expect(savedPackage.lastModifiedBy).toEqual(packageData.createdBy);
    });
  });

  describe('Validation', () => {
    it('should require name', async () => {
      const packageData = createValidPackageData();
      delete (packageData as any).name;

      const superPackage = new SuperOfferPackage(packageData);
      await expect(superPackage.save()).rejects.toThrow();
    });

    it('should require destination', async () => {
      const packageData = createValidPackageData();
      delete (packageData as any).destination;

      const superPackage = new SuperOfferPackage(packageData);
      await expect(superPackage.save()).rejects.toThrow();
    });

    it('should require at least one group size tier', async () => {
      const packageData = createValidPackageData();
      packageData.groupSizeTiers = [];

      const superPackage = new SuperOfferPackage(packageData);
      await expect(superPackage.save()).rejects.toThrow();
    });

    it('should require at least one duration option', async () => {
      const packageData = createValidPackageData();
      packageData.durationOptions = [];

      const superPackage = new SuperOfferPackage(packageData);
      await expect(superPackage.save()).rejects.toThrow();
    });

    it('should require at least one pricing entry', async () => {
      const packageData = createValidPackageData();
      packageData.pricingMatrix = [];

      const superPackage = new SuperOfferPackage(packageData);
      await expect(superPackage.save()).rejects.toThrow();
    });

    it('should validate maxPeople >= minPeople in group tiers', async () => {
      const packageData = createValidPackageData();
      packageData.groupSizeTiers[0].maxPeople = 5;
      packageData.groupSizeTiers[0].minPeople = 10;

      const superPackage = new SuperOfferPackage(packageData);
      await expect(superPackage.save()).rejects.toThrow();
    });

    it('should accept valid currency values', async () => {
      const currencies = ['EUR', 'GBP', 'USD'] as const;

      for (const currency of currencies) {
        const packageData = createValidPackageData();
        packageData.currency = currency;

        const superPackage = new SuperOfferPackage(packageData);
        const savedPackage = await superPackage.save();

        expect(savedPackage.currency).toBe(currency);
        await SuperOfferPackage.deleteMany({});
      }
    });

    it('should accept valid status values', async () => {
      const statuses = ['active', 'inactive', 'deleted'] as const;

      for (const status of statuses) {
        const packageData = createValidPackageData();
        packageData.status = status;

        const superPackage = new SuperOfferPackage(packageData);
        const savedPackage = await superPackage.save();

        expect(savedPackage.status).toBe(status);
        await SuperOfferPackage.deleteMany({});
      }
    });
  });

  describe('Pricing Matrix', () => {
    it('should support numeric prices', async () => {
      const packageData = createValidPackageData();
      const superPackage = new SuperOfferPackage(packageData);
      const savedPackage = await superPackage.save();

      expect(savedPackage.pricingMatrix[0].prices[0].price).toBe(150);
    });

    it('should support ON_REQUEST prices', async () => {
      const packageData = createValidPackageData();
      packageData.pricingMatrix[0].prices[0].price = 'ON_REQUEST';

      const superPackage = new SuperOfferPackage(packageData);
      const savedPackage = await superPackage.save();

      expect(savedPackage.pricingMatrix[0].prices[0].price).toBe('ON_REQUEST');
    });

    it('should support month period type', async () => {
      const packageData = createValidPackageData();
      const superPackage = new SuperOfferPackage(packageData);
      const savedPackage = await superPackage.save();

      expect(savedPackage.pricingMatrix[0].periodType).toBe('month');
    });

    it('should support special period type with dates', async () => {
      const packageData = createValidPackageData();
      packageData.pricingMatrix.push({
        period: 'Easter (02/04/2025 - 06/04/2025)',
        periodType: 'special',
        startDate: new Date('2025-04-02'),
        endDate: new Date('2025-04-06'),
        prices: [
          { groupSizeTierIndex: 0, nights: 2, price: 200 },
        ],
      });

      const superPackage = new SuperOfferPackage(packageData);
      const savedPackage = await superPackage.save();

      const specialPeriod = savedPackage.pricingMatrix.find(
        (p) => p.periodType === 'special'
      );
      expect(specialPeriod).toBeDefined();
      expect(specialPeriod?.startDate).toBeDefined();
      expect(specialPeriod?.endDate).toBeDefined();
    });
  });

  describe('Inclusions', () => {
    it('should support inclusions with categories', async () => {
      const packageData = createValidPackageData();
      const superPackage = new SuperOfferPackage(packageData);
      const savedPackage = await superPackage.save();

      expect(savedPackage.inclusions).toHaveLength(2);
      expect(savedPackage.inclusions[0].category).toBe('transfer');
      expect(savedPackage.inclusions[1].category).toBe('accommodation');
    });

    it('should default category to "other"', async () => {
      const packageData = createValidPackageData();
      packageData.inclusions.push({ text: 'Free WiFi' } as IInclusion);

      const superPackage = new SuperOfferPackage(packageData);
      const savedPackage = await superPackage.save();

      const wifiInclusion = savedPackage.inclusions.find(
        (i) => i.text === 'Free WiFi'
      );
      expect(wifiInclusion?.category).toBe('other');
    });
  });

  describe('Import Tracking', () => {
    it('should track CSV imports', async () => {
      const packageData = createValidPackageData();
      packageData.importSource = 'csv';
      packageData.originalFilename = 'benidorm-2025.csv';

      const superPackage = new SuperOfferPackage(packageData);
      const savedPackage = await superPackage.save();

      expect(savedPackage.importSource).toBe('csv');
      expect(savedPackage.originalFilename).toBe('benidorm-2025.csv');
    });

    it('should default to manual import source', async () => {
      const packageData = createValidPackageData();
      const superPackage = new SuperOfferPackage(packageData);
      const savedPackage = await superPackage.save();

      expect(savedPackage.importSource).toBe('manual');
    });
  });

  describe('Indexes', () => {
    it('should have indexes defined', async () => {
      const indexes = SuperOfferPackage.schema.indexes();
      
      expect(indexes).toBeDefined();
      expect(indexes.length).toBeGreaterThan(0);
      
      // Check for specific indexes
      const indexFields = indexes.map((idx) => Object.keys(idx[0]));
      expect(indexFields.some((fields) => fields.includes('status'))).toBe(true);
      expect(indexFields.some((fields) => fields.includes('destination'))).toBe(true);
      expect(indexFields.some((fields) => fields.includes('name'))).toBe(true);
    });
  });
});
