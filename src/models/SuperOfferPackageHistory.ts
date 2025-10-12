import mongoose, { Document, Schema } from 'mongoose';
import { IGroupSizeTier, IPricingEntry, IInclusion } from './SuperOfferPackage';

export interface ISuperOfferPackageHistory extends Document {
  packageId: mongoose.Types.ObjectId;
  version: number;
  
  // Snapshot of package data at this version
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
  status: 'active' | 'inactive' | 'deleted';
  
  // Change metadata
  modifiedBy: mongoose.Types.ObjectId;
  modifiedAt: Date;
  changeDescription?: string;
  changedFields?: string[];
}

const SuperOfferPackageHistorySchema = new Schema<ISuperOfferPackageHistory>({
  packageId: {
    type: Schema.Types.ObjectId,
    ref: 'SuperOfferPackage',
    required: true,
    index: true
  },
  version: {
    type: Number,
    required: true,
    min: 1
  },
  
  // Snapshot of package data
  name: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  resort: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    required: true,
    enum: ['EUR', 'GBP', 'USD']
  },
  groupSizeTiers: {
    type: Schema.Types.Mixed,
    required: true
  },
  durationOptions: {
    type: [Number],
    required: true
  },
  pricingMatrix: {
    type: Schema.Types.Mixed,
    required: true
  },
  inclusions: {
    type: Schema.Types.Mixed,
    default: []
  },
  accommodationExamples: {
    type: [String],
    default: []
  },
  salesNotes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'deleted']
  },
  
  // Change metadata
  modifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  modifiedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  changeDescription: {
    type: String,
    trim: true
  },
  changedFields: {
    type: [String],
    default: []
  }
}, {
  timestamps: false,
  collection: 'super_offer_package_history'
});

// Compound index for efficient queries
SuperOfferPackageHistorySchema.index({ packageId: 1, version: -1 });
SuperOfferPackageHistorySchema.index({ modifiedAt: -1 });

export const SuperOfferPackageHistory = mongoose.models.SuperOfferPackageHistory || 
  mongoose.model<ISuperOfferPackageHistory>('SuperOfferPackageHistory', SuperOfferPackageHistorySchema);

export default SuperOfferPackageHistory;
