import SuperOfferPackageHistory, { ISuperOfferPackageHistory } from '@/models/SuperOfferPackageHistory';
import { ISuperOfferPackage } from '@/models/SuperOfferPackage';
import mongoose from 'mongoose';

export interface VersionHistoryEntry {
  version: number;
  modifiedBy: {
    _id: string;
    name: string;
    email: string;
  };
  modifiedAt: Date;
  changeDescription?: string;
  changedFields?: string[];
}

export interface VersionComparison {
  field: string;
  oldValue: any;
  newValue: any;
  type: 'added' | 'removed' | 'modified';
}

export class SuperPackageVersionHistoryService {
  /**
   * Save a version snapshot to history
   */
  static async saveVersion(
    packageData: ISuperOfferPackage,
    modifiedBy: mongoose.Types.ObjectId | string,
    changeDescription?: string
  ): Promise<ISuperOfferPackageHistory> {
    // Detect changed fields by comparing with previous version
    const changedFields = await this.detectChangedFields(packageData);

    const historyEntry = new SuperOfferPackageHistory({
      packageId: packageData._id,
      version: packageData.version,
      
      // Snapshot of current state
      name: packageData.name,
      destination: packageData.destination,
      resort: packageData.resort,
      currency: packageData.currency,
      groupSizeTiers: packageData.groupSizeTiers,
      durationOptions: packageData.durationOptions,
      pricingMatrix: packageData.pricingMatrix,
      inclusions: packageData.inclusions,
      accommodationExamples: packageData.accommodationExamples,
      salesNotes: packageData.salesNotes,
      status: packageData.status,
      
      // Metadata
      modifiedBy,
      modifiedAt: new Date(),
      changeDescription,
      changedFields
    });

    await historyEntry.save();
    return historyEntry;
  }

  /**
   * Get version history for a package
   */
  static async getVersionHistory(
    packageId: string | mongoose.Types.ObjectId,
    limit: number = 50
  ): Promise<VersionHistoryEntry[]> {
    const history = await SuperOfferPackageHistory.find({ packageId })
      .sort({ version: -1 })
      .limit(limit)
      .populate('modifiedBy', 'name email')
      .lean();

    return history.map(entry => ({
      version: entry.version,
      modifiedBy: entry.modifiedBy as any,
      modifiedAt: entry.modifiedAt,
      changeDescription: entry.changeDescription,
      changedFields: entry.changedFields
    }));
  }

  /**
   * Get a specific version of a package
   */
  static async getVersion(
    packageId: string | mongoose.Types.ObjectId,
    version: number
  ): Promise<ISuperOfferPackageHistory | null> {
    return await SuperOfferPackageHistory.findOne({ packageId, version })
      .populate('modifiedBy', 'name email')
      .lean();
  }

  /**
   * Compare two versions
   */
  static async compareVersions(
    packageId: string | mongoose.Types.ObjectId,
    version1: number,
    version2: number
  ): Promise<VersionComparison[]> {
    const [v1, v2] = await Promise.all([
      this.getVersion(packageId, version1),
      this.getVersion(packageId, version2)
    ]);

    if (!v1 || !v2) {
      throw new Error('One or both versions not found');
    }

    return this.generateComparison(v1, v2);
  }

  /**
   * Detect which fields changed compared to previous version
   */
  private static async detectChangedFields(
    currentPackage: ISuperOfferPackage
  ): Promise<string[]> {
    if (currentPackage.version === 1) {
      return ['initial_version'];
    }

    const previousVersion = await SuperOfferPackageHistory.findOne({
      packageId: currentPackage._id,
      version: currentPackage.version - 1
    });

    if (!previousVersion) {
      return [];
    }

    const changedFields: string[] = [];
    const fieldsToCheck = [
      'name',
      'destination',
      'resort',
      'currency',
      'status',
      'salesNotes'
    ];

    for (const field of fieldsToCheck) {
      if (JSON.stringify(currentPackage[field]) !== JSON.stringify(previousVersion[field])) {
        changedFields.push(field);
      }
    }

    // Check complex fields
    if (JSON.stringify(currentPackage.groupSizeTiers) !== JSON.stringify(previousVersion.groupSizeTiers)) {
      changedFields.push('groupSizeTiers');
    }
    if (JSON.stringify(currentPackage.durationOptions) !== JSON.stringify(previousVersion.durationOptions)) {
      changedFields.push('durationOptions');
    }
    if (JSON.stringify(currentPackage.pricingMatrix) !== JSON.stringify(previousVersion.pricingMatrix)) {
      changedFields.push('pricingMatrix');
    }
    if (JSON.stringify(currentPackage.inclusions) !== JSON.stringify(previousVersion.inclusions)) {
      changedFields.push('inclusions');
    }
    if (JSON.stringify(currentPackage.accommodationExamples) !== JSON.stringify(previousVersion.accommodationExamples)) {
      changedFields.push('accommodationExamples');
    }

    return changedFields;
  }

  /**
   * Generate detailed comparison between two versions
   */
  private static generateComparison(
    v1: ISuperOfferPackageHistory,
    v2: ISuperOfferPackageHistory
  ): VersionComparison[] {
    const comparisons: VersionComparison[] = [];
    const fieldsToCompare = [
      'name',
      'destination',
      'resort',
      'currency',
      'status',
      'salesNotes',
      'groupSizeTiers',
      'durationOptions',
      'pricingMatrix',
      'inclusions',
      'accommodationExamples'
    ];

    for (const field of fieldsToCompare) {
      const oldValue = v1[field];
      const newValue = v2[field];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        comparisons.push({
          field,
          oldValue,
          newValue,
          type: 'modified'
        });
      }
    }

    return comparisons;
  }

  /**
   * Get audit trail summary for a package
   */
  static async getAuditTrail(
    packageId: string | mongoose.Types.ObjectId
  ): Promise<{
    totalVersions: number;
    firstCreated: Date;
    lastModified: Date;
    uniqueModifiers: number;
    recentChanges: VersionHistoryEntry[];
  }> {
    const history = await this.getVersionHistory(packageId, 100);

    if (history.length === 0) {
      throw new Error('No history found for package');
    }

    const uniqueModifiers = new Set(
      history
        .filter(h => h.modifiedBy && h.modifiedBy._id)
        .map(h => h.modifiedBy._id.toString())
    ).size;

    return {
      totalVersions: history.length,
      firstCreated: history[history.length - 1].modifiedAt,
      lastModified: history[0].modifiedAt,
      uniqueModifiers,
      recentChanges: history.slice(0, 10)
    };
  }
}

export default SuperPackageVersionHistoryService;
