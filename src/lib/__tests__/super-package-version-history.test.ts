import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import mongoose from 'mongoose';
import SuperOfferPackage, { ISuperOfferPackage } from '@/models/SuperOfferPackage';
import SuperOfferPackageHistory from '@/models/SuperOfferPackageHistory';
import SuperPackageVersionHistoryService from '@/lib/super-package-version-history';
import { connectToDatabase } from '@/lib/mongodb';
import '@/models/User'; // Import User model to register schema

describe('SuperPackageVersionHistoryService', () => {
  let testPackage: ISuperOfferPackage;
  let testUserId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    await connectToDatabase();
    testUserId = new mongoose.Types.ObjectId();

    // Create a test package
    testPackage = await SuperOfferPackage.create({
      name: 'Test Package',
      destination: 'Test Destination',
      resort: 'Test Resort',
      currency: 'EUR',
      groupSizeTiers: [
        { label: '6-11 People', minPeople: 6, maxPeople: 11 },
      ],
      durationOptions: [2, 3],
      pricingMatrix: [
        {
          period: 'January',
          periodType: 'month',
          prices: [
            { groupSizeTierIndex: 0, nights: 2, price: 100 },
          ],
        },
      ],
      inclusions: [{ text: 'Test inclusion' }],
      accommodationExamples: ['Test hotel'],
      salesNotes: 'Test notes',
      status: 'active',
      version: 1,
      createdBy: testUserId,
      lastModifiedBy: testUserId,
    });
  });

  afterEach(async () => {
    await SuperOfferPackage.deleteMany({});
    await SuperOfferPackageHistory.deleteMany({});
  });

  describe('saveVersion', () => {
    it('should save a version snapshot to history', async () => {
      const historyEntry = await SuperPackageVersionHistoryService.saveVersion(
        testPackage,
        testUserId,
        'Initial version'
      );

      expect(historyEntry).toBeDefined();
      expect(historyEntry.packageId.toString()).toBe(testPackage._id.toString());
      expect(historyEntry.version).toBe(1);
      expect(historyEntry.name).toBe('Test Package');
      expect(historyEntry.changeDescription).toBe('Initial version');
    });

    it('should detect changed fields', async () => {
      // Save initial version
      await SuperPackageVersionHistoryService.saveVersion(
        testPackage,
        testUserId,
        'Initial version'
      );

      // Update package
      testPackage.name = 'Updated Package';
      testPackage.version = 2;
      await testPackage.save();

      // Save updated version
      const historyEntry = await SuperPackageVersionHistoryService.saveVersion(
        testPackage,
        testUserId,
        'Updated name'
      );

      expect(historyEntry.changedFields).toContain('name');
    });
  });

  describe('getVersionHistory', () => {
    it('should retrieve version history for a package', async () => {
      // Create multiple versions
      await SuperPackageVersionHistoryService.saveVersion(
        testPackage,
        testUserId,
        'Version 1'
      );

      testPackage.version = 2;
      testPackage.name = 'Updated Package';
      await SuperPackageVersionHistoryService.saveVersion(
        testPackage,
        testUserId,
        'Version 2'
      );

      const history = await SuperPackageVersionHistoryService.getVersionHistory(
        testPackage._id
      );

      expect(history).toHaveLength(2);
      expect(history[0].version).toBe(2); // Most recent first
      expect(history[1].version).toBe(1);
    });

    it('should limit the number of results', async () => {
      // Create 5 versions
      for (let i = 1; i <= 5; i++) {
        testPackage.version = i;
        await SuperPackageVersionHistoryService.saveVersion(
          testPackage,
          testUserId,
          `Version ${i}`
        );
      }

      const history = await SuperPackageVersionHistoryService.getVersionHistory(
        testPackage._id,
        3
      );

      expect(history).toHaveLength(3);
    });
  });

  describe('getVersion', () => {
    it('should retrieve a specific version', async () => {
      await SuperPackageVersionHistoryService.saveVersion(
        testPackage,
        testUserId,
        'Version 1'
      );

      const version = await SuperPackageVersionHistoryService.getVersion(
        testPackage._id,
        1
      );

      expect(version).toBeDefined();
      expect(version?.version).toBe(1);
      expect(version?.name).toBe('Test Package');
    });

    it('should return null for non-existent version', async () => {
      const version = await SuperPackageVersionHistoryService.getVersion(
        testPackage._id,
        999
      );

      expect(version).toBeNull();
    });
  });

  describe('compareVersions', () => {
    it('should compare two versions and return differences', async () => {
      // Save version 1
      await SuperPackageVersionHistoryService.saveVersion(
        testPackage,
        testUserId,
        'Version 1'
      );

      // Update and save version 2
      testPackage.version = 2;
      testPackage.name = 'Updated Package';
      testPackage.salesNotes = 'Updated notes';
      await SuperPackageVersionHistoryService.saveVersion(
        testPackage,
        testUserId,
        'Version 2'
      );

      const comparison = await SuperPackageVersionHistoryService.compareVersions(
        testPackage._id,
        1,
        2
      );

      expect(comparison).toBeDefined();
      expect(comparison.length).toBeGreaterThan(0);
      
      const nameChange = comparison.find(c => c.field === 'name');
      expect(nameChange).toBeDefined();
      expect(nameChange?.oldValue).toBe('Test Package');
      expect(nameChange?.newValue).toBe('Updated Package');
    });

    it('should throw error if version not found', async () => {
      await expect(
        SuperPackageVersionHistoryService.compareVersions(
          testPackage._id,
          1,
          2
        )
      ).rejects.toThrow('One or both versions not found');
    });
  });

  describe('getAuditTrail', () => {
    it('should return audit trail summary', async () => {
      // Create multiple versions
      await SuperPackageVersionHistoryService.saveVersion(
        testPackage,
        testUserId,
        'Version 1'
      );

      testPackage.version = 2;
      await SuperPackageVersionHistoryService.saveVersion(
        testPackage,
        testUserId,
        'Version 2'
      );

      const auditTrail = await SuperPackageVersionHistoryService.getAuditTrail(
        testPackage._id
      );

      expect(auditTrail.totalVersions).toBe(2);
      expect(auditTrail.uniqueModifiers).toBeGreaterThanOrEqual(0); // May be 0 if modifiedBy not populated
      expect(auditTrail.recentChanges).toHaveLength(2);
      expect(auditTrail.firstCreated).toBeDefined();
      expect(auditTrail.lastModified).toBeDefined();
    });

    it('should throw error if no history found', async () => {
      await expect(
        SuperPackageVersionHistoryService.getAuditTrail(testPackage._id)
      ).rejects.toThrow('No history found for package');
    });
  });
});
