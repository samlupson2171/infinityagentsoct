import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  name: string;
  description?: string;
  categories: mongoose.Types.ObjectId[];
  destinations: string[];
  availableInAllDestinations: boolean;
  isActive: boolean;
  displayOrder: number;
  pricing?: {
    estimatedCost?: number;
    currency?: string;
  };
  minimumPeople?: number;
  metadata: {
    createdBy: mongoose.Types.ObjectId;
    updatedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
  };
}

const EventSchema = new Schema<IEvent>(
  {
    name: {
      type: String,
      required: [true, 'Event name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Event name must be at least 2 characters long'],
      maxlength: [100, 'Event name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
      },
    ],
    destinations: [
      {
        type: String,
        trim: true,
      },
    ],
    availableInAllDestinations: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      min: [0, 'Display order cannot be negative'],
    },
    pricing: {
      estimatedCost: {
        type: Number,
        min: [0, 'Estimated cost cannot be negative'],
      },
      currency: {
        type: String,
        default: 'GBP',
        enum: ['GBP', 'EUR', 'USD'],
      },
    },
    minimumPeople: {
      type: Number,
      min: [1, 'Minimum people must be at least 1'],
      max: [100, 'Minimum people cannot exceed 100'],
    },
    metadata: {
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creator is required'],
      },
      updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Updater is required'],
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: false, // We manage timestamps manually in metadata
  }
);

// Indexes for performance
EventSchema.index({ name: 1 }, { unique: true });
EventSchema.index({ isActive: 1, destinations: 1 });
EventSchema.index({ categories: 1 });
EventSchema.index({ displayOrder: 1 });
EventSchema.index({ isActive: 1, displayOrder: 1 });

// Validation: At least one category required for active events
EventSchema.pre('save', function (next) {
  if (this.isActive && (!this.categories || this.categories.length === 0)) {
    next(new Error('At least one category is required for active events'));
  } else {
    next();
  }
});

// Validation: At least one destination required unless availableInAllDestinations is true
EventSchema.pre('save', function (next) {
  if (
    this.isActive &&
    !this.availableInAllDestinations &&
    (!this.destinations || this.destinations.length === 0)
  ) {
    next(
      new Error(
        'At least one destination is required unless event is available in all destinations'
      )
    );
  } else {
    next();
  }
});

// Update metadata.updatedAt on save
EventSchema.pre('save', function (next) {
  this.metadata.updatedAt = new Date();
  next();
});

// Static methods
EventSchema.statics.findActive = function () {
  return this.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
};

EventSchema.statics.findByDestination = function (destination: string) {
  return this.find({
    isActive: true,
    $or: [
      { availableInAllDestinations: true },
      { destinations: destination },
    ],
  })
    .populate('categories')
    .sort({ displayOrder: 1, name: 1 });
};

EventSchema.statics.findByCategory = function (
  categoryId: mongoose.Types.ObjectId
) {
  return this.find({
    isActive: true,
    categories: categoryId,
  })
    .populate('categories')
    .sort({ displayOrder: 1, name: 1 });
};

EventSchema.statics.findByDestinationAndCategory = function (
  destination: string,
  categoryId: mongoose.Types.ObjectId
) {
  return this.find({
    isActive: true,
    categories: categoryId,
    $or: [
      { availableInAllDestinations: true },
      { destinations: destination },
    ],
  })
    .populate('categories')
    .sort({ displayOrder: 1, name: 1 });
};

// Instance methods
EventSchema.methods.toggleStatus = function () {
  this.isActive = !this.isActive;
  return this.save();
};

EventSchema.methods.addDestination = function (destination: string) {
  if (!this.destinations.includes(destination)) {
    this.destinations.push(destination);
  }
  return this.save();
};

EventSchema.methods.removeDestination = function (destination: string) {
  this.destinations = this.destinations.filter((d: string) => d !== destination);
  return this.save();
};

EventSchema.methods.addCategory = function (
  categoryId: mongoose.Types.ObjectId
) {
  if (!this.categories.some((id: mongoose.Types.ObjectId) => id.equals(categoryId))) {
    this.categories.push(categoryId);
  }
  return this.save();
};

EventSchema.methods.removeCategory = function (
  categoryId: mongoose.Types.ObjectId
) {
  this.categories = this.categories.filter((id: mongoose.Types.ObjectId) => !id.equals(categoryId));
  return this.save();
};

export default mongoose.models.Event ||
  mongoose.model<IEvent>('Event', EventSchema);
