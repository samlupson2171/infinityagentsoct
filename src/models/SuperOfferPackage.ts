import mongoose, { Document, Schema } from 'mongoose';

// TypeScript Interfaces
export interface IGroupSizeTier {
  label: string; // e.g., "6-11 People"
  minPeople: number;
  maxPeople: number;
}

export interface IPricePoint {
  groupSizeTierIndex: number;
  nights: number;
  price: number | 'ON_REQUEST';
}

export interface IPricingEntry {
  period: string; // e.g., "January", "Easter (02/04/2025 - 06/04/2025)"
  periodType: 'month' | 'special';
  startDate?: Date; // For special periods
  endDate?: Date; // For special periods
  prices: IPricePoint[];
}

export interface IInclusion {
  text: string;
  category?: 'transfer' | 'accommodation' | 'activity' | 'service' | 'other';
}

export interface ISuperOfferPackage extends Document {
  // Basic Information
  name: string;
  destination: string;
  resort: string;
  currency: 'EUR' | 'GBP' | 'USD';
  
  // Pricing Structure
  groupSizeTiers: IGroupSizeTier[];
  durationOptions: number[]; // e.g., [2, 3, 4]
  pricingMatrix: IPricingEntry[];
  
  // Package Details
  inclusions: IInclusion[];
  accommodationExamples: string[];
  salesNotes: string;
  
  // Status and Metadata
  status: 'active' | 'inactive' | 'deleted';
  version: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: mongoose.Types.ObjectId;
  
  // Import tracking
  importSource?: 'csv' | 'manual';
  originalFilename?: string;
}

// Mongoose Schemas
const GroupSizeTierSchema = new Schema<IGroupSizeTier>({
  label: {
    type: String,
    required: true,
    trim: true
  },
  minPeople: {
    type: Number,
    required: true,
    min: 1
  },
  maxPeople: {
    type: Number,
    required: true,
    min: 1,
    validate: {
      validator: function(this: IGroupSizeTier, value: number) {
        return value >= this.minPeople;
      },
      message: 'maxPeople must be greater than or equal to minPeople'
    }
  }
}, { _id: false });

const PricePointSchema = new Schema<IPricePoint>({
  groupSizeTierIndex: {
    type: Number,
    required: true,
    min: 0
  },
  nights: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Schema.Types.Mixed,
    required: true,
    validate: {
      validator: function(value: any) {
        return typeof value === 'number' || value === 'ON_REQUEST';
      },
      message: 'Price must be a number or "ON_REQUEST"'
    }
  }
}, { _id: false });

const PricingEntrySchema = new Schema<IPricingEntry>({
  period: {
    type: String,
    required: true,
    trim: true
  },
  periodType: {
    type: String,
    required: true,
    enum: ['month', 'special']
  },
  startDate: {
    type: Date,
    required: function(this: IPricingEntry) {
      return this.periodType === 'special';
    }
  },
  endDate: {
    type: Date,
    required: function(this: IPricingEntry) {
      return this.periodType === 'special';
    }
  },
  prices: {
    type: [PricePointSchema],
    required: true,
    validate: {
      validator: function(value: IPricePoint[]) {
        return value.length > 0;
      },
      message: 'At least one price point is required'
    }
  }
}, { _id: false });

const InclusionSchema = new Schema<IInclusion>({
  text: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['transfer', 'accommodation', 'activity', 'service', 'other'],
    default: 'other'
  }
}, { _id: false });

const SuperOfferPackageSchema = new Schema<ISuperOfferPackage>({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  destination: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  resort: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  currency: {
    type: String,
    required: true,
    enum: ['EUR', 'GBP', 'USD'],
    default: 'EUR'
  },
  
  // Pricing Structure
  groupSizeTiers: {
    type: [GroupSizeTierSchema],
    required: true,
    validate: {
      validator: function(value: IGroupSizeTier[]) {
        return value.length > 0;
      },
      message: 'At least one group size tier is required'
    }
  },
  durationOptions: {
    type: [Number],
    required: true,
    validate: {
      validator: function(value: number[]) {
        return value.length > 0 && value.every(n => n > 0);
      },
      message: 'At least one duration option is required and all must be positive'
    }
  },
  pricingMatrix: {
    type: [PricingEntrySchema],
    required: true,
    validate: {
      validator: function(value: IPricingEntry[]) {
        return value.length > 0;
      },
      message: 'At least one pricing entry is required'
    }
  },
  
  // Package Details
  inclusions: {
    type: [InclusionSchema],
    default: []
  },
  accommodationExamples: {
    type: [String],
    default: []
  },
  salesNotes: {
    type: String,
    default: '',
    trim: true
  },
  
  // Status and Metadata
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'deleted'],
    default: 'active',
    index: true
  },
  version: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Import tracking
  importSource: {
    type: String,
    enum: ['csv', 'manual'],
    default: 'manual'
  },
  originalFilename: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'super_offer_packages'
});

// Indexes for performance
SuperOfferPackageSchema.index({ status: 1, destination: 1 });
SuperOfferPackageSchema.index({ createdAt: -1 });
SuperOfferPackageSchema.index({ name: 'text', destination: 'text' });

// Pre-validate middleware to ensure lastModifiedBy is set
SuperOfferPackageSchema.pre('validate', function(next) {
  if (this.isNew && !this.lastModifiedBy) {
    this.lastModifiedBy = this.createdBy;
  }
  next();
});

// Export model with explicit collection name
export const SuperOfferPackage = mongoose.models.SuperOfferPackage || 
  mongoose.model<ISuperOfferPackage>('SuperOfferPackage', SuperOfferPackageSchema, 'super_offer_packages');

export default SuperOfferPackage;
