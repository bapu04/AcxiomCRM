import mongoose from 'mongoose';

const followUpSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
      index: true,
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      default: null,
      index: true,
    },
    opportunityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      default: null,
      index: true,
    },
    followUpDate: {
      type: Date,
      required: [true, 'Follow-up date is required'],
      validate: {
        validator: function (value) {
          // Rule: Follow-up date cannot be earlier than today for a new/planned follow-up
          if (this.isNew || this.status === 'Planned') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return new Date(value) >= today;
          }
          return true;
        },
        message: 'Follow-up date cannot be earlier than today for planned activities',
      },
      index: true,
    },
    followUpType: {
      type: String,
      enum: {
        values: ['Call', 'Meeting', 'Email', 'Task'],
        message: 'Type must be Call, Meeting, Email, or Task',
      },
      default: 'Call',
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [150, 'Subject cannot exceed 150 characters'],
    },
    remarks: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Planned', 'Completed', 'Missed', 'Cancelled'],
        message: 'Status must be Planned, Completed, Missed, or Cancelled',
      },
      default: 'Planned',
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned user is required'],
      index: true,
    },
    completedNotes: {
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

const FollowUp = mongoose.model('FollowUp', followUpSchema);
export default FollowUp;
