import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    userEmail: {
      type: String,
      default: 'Anonymous',
    },
    userRole: {
      type: String,
      default: 'None',
    },
    action: {
      type: String,
      required: true,
      enum: [
        'LOGIN',
        'FAILED_LOGIN',
        'LOGOUT',
        'CREATE',
        'UPDATE',
        'DELETE',
        'ROLE_CHANGE',
        'STATUS_CHANGE',
        'CONVERT',
        'SECURITY',
      ],
      index: true,
    },
    entityName: {
      type: String,
      required: true,
      enum: ['User', 'Customer', 'Lead', 'Opportunity', 'FollowUp', 'Activity', 'Auth'],
      index: true,
    },
    recordId: {
      type: String,
      default: null,
      index: true,
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    details: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Append-only immutable log
  }
);

// Prevent modifications and deletions to preserve audit trail integrity
auditLogSchema.pre('updateOne', function () {
  throw new Error('Audit logs are append-only and cannot be updated.');
});
auditLogSchema.pre('deleteOne', function () {
  throw new Error('Audit logs are append-only and cannot be deleted.');
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
