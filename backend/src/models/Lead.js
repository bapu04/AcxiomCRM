import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    leadCode: {
      type: String,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      maxlength: [100, 'Lead name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9+\-\s()]{10,15}$/, 'Phone number must be a valid 10-15 digit format'],
      index: true,
    },
    companyName: {
      type: String,
      trim: true,
      maxlength: [150, 'Company name cannot exceed 150 characters'],
    },
    source: {
      type: String,
      enum: {
        values: ['Website', 'Referral', 'Cold Call', 'Advertisement', 'Partner', 'Other'],
        message: 'Invalid lead source',
      },
      default: 'Website',
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['New', 'Contacted', 'Qualified', 'Unqualified', 'Converted', 'Lost'],
        message: 'Status must be New, Contacted, Qualified, Unqualified, Converted, or Lost',
      },
      default: 'New',
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: 'Priority must be Low, Medium, or High',
      },
      default: 'Medium',
    },
    expectedValue: {
      type: Number,
      min: [0, 'Expected value cannot be negative'],
      default: 0,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    convertedCustomerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
    convertedOpportunityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      default: null,
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
  }
);

leadSchema.index({ name: 'text', email: 'text', companyName: 'text' });

const Lead = mongoose.model('Lead', leadSchema);
export default Lead;
