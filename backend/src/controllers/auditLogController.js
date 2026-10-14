import AuditLog from '../models/AuditLog.js';

// @desc    Get audit logs with filtering and pagination
// @route   GET /api/audit-logs
// @access  Private (Admin only)
export const getAuditLogs = async (req, res, next) => {
  try {
    const { action, entityName, userEmail, startDate, endDate, page = 1, limit = 20 } = req.query;

    const query = {};

    if (action) query.action = action;
    if (entityName) query.entityName = entityName;
    if (userEmail) query.userEmail = new RegExp(userEmail.trim(), 'i');

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};
