import mongoose, { Document, Schema } from 'mongoose';

export interface IEnquiry extends Document {
  leadName: string;
  tripType: 'stag' | 'hen' | 'other';
  agentEmail: string;
  firstChoiceDestination: string;
  secondChoiceDestination?: string;
  resort?: string;
  travelDate: Date;
  arrivalAirport?: string;
  numberOfNights: number;
  numberOfGuests: number;
  eventsRequested: mongoose.Types.ObjectId[];
  accommodationType: 'hotel' | 'apartments';
  starRating: string;
  boardType: string;
  budgetPerPerson: number;
  additionalNotes?: string;
  status: 'new' | 'in-progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  submittedBy: mongoose.Types.ObjectId;

  // Quote-related fields
  quotes: mongoose.Types.ObjectId[];
  hasQuotes: boolean;
  latestQuoteDate?: Date;
  quotesCount: number;
}

const EnquirySchema = new Schema<IEnquiry>(
  {
    leadName: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      minlength: [2, 'Lead name must be at least 2 characters long'],
      maxlength: [100, 'Lead name cannot exceed 100 characters'],
    },
    tripType: {
      type: String,
      required: [true, 'Trip type is required'],
      enum: {
        values: ['stag', 'hen', 'other'],
        message: 'Trip type must be stag, hen, or other',
      },
    },
    agentEmail: {
      type: String,
      required: [true, 'Agent email is required'],
      lowercase: true,
      validate: {
        validator: function (email: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: 'Please provide a valid agent email address',
      },
    },
    firstChoiceDestination: {
      type: String,
      required: [true, 'First choice destination is required'],
      trim: true,
      minlength: [2, 'Destination name must be at least 2 characters long'],
      maxlength: [50, 'Destination name cannot exceed 50 characters'],
    },
    secondChoiceDestination: {
      type: String,
      trim: true,
      validate: {
        validator: function (value: string) {
          // Allow empty string or validate length if provided
          return !value || value.length >= 2;
        },
        message: 'Destination name must be at least 2 characters long',
      },
      maxlength: [50, 'Destination name cannot exceed 50 characters'],
    },
    resort: {
      type: String,
      trim: true,
      maxlength: [100, 'Resort name cannot exceed 100 characters'],
    },
    travelDate: {
      type: Date,
      required: [true, 'Travel date is required'],
      validate: {
        validator: function (date: Date) {
          // Allow dates from today onwards (not strictly future to account for timezone differences)
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date >= today;
        },
        message: 'Travel date must be today or in the future',
      },
    },
    arrivalAirport: {
      type: String,
      required: false,
      trim: true,
      maxlength: [100, 'Arrival airport cannot exceed 100 characters'],
    },
    numberOfNights: {
      type: Number,
      required: [true, 'Number of nights is required'],
      min: [1, 'Number of nights must be at least 1'],
      max: [30, 'Number of nights cannot exceed 30'],
    },
    numberOfGuests: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: [1, 'Number of guests must be at least 1'],
      max: [100, 'Number of guests cannot exceed 100'],
    },
    eventsRequested: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Event',
      },
    ],
    accommodationType: {
      type: String,
      required: [true, 'Accommodation type is required'],
      enum: {
        values: ['hotel', 'apartments'],
        message: 'Accommodation type must be hotel or apartments',
      },
    },
    starRating: {
      type: String,
      required: [true, 'Star rating is required'],
      enum: {
        values: ['2', '3', '4', '5'],
        message: 'Star rating must be 2, 3, 4, or 5',
      },
    },
    boardType: {
      type: String,
      required: [true, 'Board type is required'],
      trim: true,
      minlength: [2, 'Board type must be at least 2 characters long'],
      maxlength: [50, 'Board type cannot exceed 50 characters'],
    },
    budgetPerPerson: {
      type: Number,
      required: [true, 'Budget per person is required'],
      min: [50, 'Budget per person must be at least £50'],
      max: [10000, 'Budget per person cannot exceed £10,000'],
    },
    additionalNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Additional notes cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['new', 'in-progress', 'completed'],
        message: 'Status must be new, in-progress, or completed',
      },
      default: 'new',
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Submitter is required'],
    },

    // Quote-related fields
    quotes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Quote',
      },
    ],

    hasQuotes: {
      type: Boolean,
      default: false,
    },

    latestQuoteDate: Date,

    quotesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
EnquirySchema.index({ status: 1, createdAt: -1 });
EnquirySchema.index({ submittedBy: 1 });
EnquirySchema.index({ agentEmail: 1 });
EnquirySchema.index({ travelDate: 1 });
EnquirySchema.index({ hasQuotes: 1 });
EnquirySchema.index({ latestQuoteDate: -1 });

// Static methods
EnquirySchema.statics.findByStatus = function (status: string) {
  return this.find({ status }).sort({ createdAt: -1 });
};

EnquirySchema.statics.findByAgent = function (
  agentId: mongoose.Types.ObjectId
) {
  return this.find({ submittedBy: agentId }).sort({ createdAt: -1 });
};

EnquirySchema.statics.findRecentEnquiries = function (days: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  return this.find({ createdAt: { $gte: cutoffDate } }).sort({ createdAt: -1 });
};

EnquirySchema.statics.findWithQuotes = function () {
  return this.find({ hasQuotes: true })
    .populate('quotes')
    .sort({ latestQuoteDate: -1 });
};

EnquirySchema.statics.findWithoutQuotes = function () {
  return this.find({ hasQuotes: false }).sort({ createdAt: -1 });
};

// Instance methods
EnquirySchema.methods.updateStatus = function (
  newStatus: 'new' | 'in-progress' | 'completed'
) {
  this.status = newStatus;
  return this.save();
};

EnquirySchema.methods.addQuote = function (quoteId: mongoose.Types.ObjectId) {
  if (!this.quotes.includes(quoteId)) {
    this.quotes.push(quoteId);
    this.quotesCount = this.quotes.length;
    this.hasQuotes = true;
    this.latestQuoteDate = new Date();
  }
  return this.save();
};

EnquirySchema.methods.removeQuote = function (
  quoteId: mongoose.Types.ObjectId
) {
  this.quotes = this.quotes.filter(
    (id: mongoose.Types.ObjectId) => !id.equals(quoteId)
  );
  this.quotesCount = this.quotes.length;
  this.hasQuotes = this.quotesCount > 0;
  if (this.quotesCount === 0) {
    this.latestQuoteDate = undefined;
  }
  return this.save();
};

export default mongoose.models.Enquiry ||
  mongoose.model<IEnquiry>('Enquiry', EnquirySchema);
