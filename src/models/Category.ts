import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  isSystem: boolean;
  isActive: boolean;
  displayOrder: number;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
  };
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      minlength: [2, 'Category name must be at least 2 characters long'],
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (slug: string) {
          return /^[a-z0-9-]+$/.test(slug);
        },
        message: 'Slug can only contain lowercase letters, numbers, and hyphens',
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    icon: {
      type: String,
      trim: true,
      maxlength: [50, 'Icon identifier cannot exceed 50 characters'],
    },
    color: {
      type: String,
      trim: true,
      validate: {
        validator: function (color: string) {
          return !color || /^#[0-9A-Fa-f]{6}$/.test(color);
        },
        message: 'Color must be a valid hex color code (e.g., #FF5733)',
      },
    },
    isSystem: {
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
    metadata: {
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
CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ isActive: 1, displayOrder: 1 });
CategorySchema.index({ isSystem: 1 });

// Update metadata.updatedAt on save
CategorySchema.pre('save', function (next) {
  this.metadata.updatedAt = new Date();
  next();
});

// Prevent deletion of system categories
CategorySchema.pre('deleteOne', { document: true, query: false }, function (next) {
  if (this.isSystem) {
    next(new Error('System categories cannot be deleted'));
  } else {
    next();
  }
});

// Static methods
CategorySchema.statics.findActive = function () {
  return this.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
};

CategorySchema.statics.findSystemCategories = function () {
  return this.find({ isSystem: true, isActive: true }).sort({
    displayOrder: 1,
    name: 1,
  });
};

CategorySchema.statics.findCustomCategories = function () {
  return this.find({ isSystem: false, isActive: true }).sort({
    displayOrder: 1,
    name: 1,
  });
};

CategorySchema.statics.findBySlug = function (slug: string) {
  return this.findOne({ slug, isActive: true });
};

// Instance methods
CategorySchema.methods.toggleStatus = function () {
  this.isActive = !this.isActive;
  return this.save();
};

export default mongoose.models.Category ||
  mongoose.model<ICategory>('Category', CategorySchema);
