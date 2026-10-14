import mongoose from 'mongoose';

const opportunitySchema = new mongoose.Schema(
  {
    opportunityCode: {
      type: String,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Opportunity name is required'],
      trim: true,
      maxlength: [150, 'Opportunity name cannot exceed 150 characters'],
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Associated Customer is required'],
      index: true,
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      default: null,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Opportunity Amount must be greater than 0'],
    },
    stage: {
      type: String,
      enum: {
        values: ['Qualification', 'Proposal', 'Negotiation', 'Won', 'Lost'],
        message: 'Invalid pipeline stage',
      },
      default: 'Qualification',
      index: true,
    },
    probability: {
      type: Number,
      required: [true, 'Probability is required'],
      min: [0, 'Probability must be between 0 and 100'],
      max: [100, 'Probability must be between 0 and 100'],
      default: 20,
    },
    expectedCloseDate: {
      type: Date,
      required: [true, 'Expected close date is required'],
      validate: {
        validator: function (value) {
          // Only validate date not in past if active/open stage
          if (['Won', 'Lost'].includes(this.stage) || this.status === 'Won' || this.status === 'Lost') {
            return true;
          }
          // Zero out time comparison to allow today
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return new Date(value) >= today;
        },
        message: 'Expected Close Date cannot be in the past for active opportunities',
      },
    },
    status: {
      type: String,
      enum: ['Open', 'Won', 'Lost'],
      default: 'Open',
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for weighted pipeline calculation
opportunitySchema.virtual('weightedPipeline').get(function () {
  if (this.amount != null && this.probability != null) {
    return Math.round((this.amount * this.probability) / 100 * 100) / 100;
  }
  return 0;
});

// Update status automatically when stage changes to Won or Lost
opportunitySchema.pre('save', function (next) {
  if (this.stage === 'Won') {
    this.status = 'Won';
    this.probability = 100;
  } else if (this.stage === 'Lost') {
    this.status = 'Lost';
    this.probability = 0;
  } else {
    this.status = 'Open';
  }
  next();
});

const Opportunity = mongoose.model('Opportunity', opportunitySchema);
export default Opportunity;
