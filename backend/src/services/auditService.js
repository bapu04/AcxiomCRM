import AuditLog from '../models/AuditLog.js';

// Sanitize sensitive fields from audit payload
const sanitizePayload = (payload) => {
  if (!payload || typeof payload !== 'object') return payload;
  const sanitized = JSON.parse(JSON.stringify(payload));
  delete sanitized.password;
  delete sanitized.passwordHash;
  delete sanitized.token;
  return sanitized;
};

export const logAuditEvent = async (req, {
  action,
  entityName,
  recordId = null,
  oldValue = null,
  newValue = null,
  details = '',
  user = null,
}) => {
  try {
    const currentUser = user || req?.user;
    const ipAddress =
      req?.headers?.['x-forwarded-for'] ||
      req?.socket?.remoteAddress ||
      req?.ip ||
      '127.0.0.1';

    await AuditLog.create({
      userId: currentUser?._id || null,
      userEmail: currentUser?.email || 'Anonymous',
      userRole: currentUser?.role || 'None',
      action,
      entityName,
      recordId: recordId ? String(recordId) : null,
      oldValue: sanitizePayload(oldValue),
      newValue: sanitizePayload(newValue),
      details,
      ipAddress: String(ipAddress),
    });
  } catch (err) {
    console.error('[AcxiomCRM Audit] Failed to record audit log:', err.message);
  }
};
