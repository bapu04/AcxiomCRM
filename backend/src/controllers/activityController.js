import Activity from '../models/Activity.js';
import { logAuditEvent } from '../services/auditService.js';
import { buildRoleQuery } from '../middleware/role.js';

export const getActivities = async (req, res, next) => {
  try {
    const { activityType, status, customerId, leadId, opportunityId, page = 1, limit = 10 } = req.query;

    let query = {};
    query = buildRoleQuery(req.user, query);

    if (activityType) query.activityType = activityType;
    if (status) query.status = status;
    if (customerId) query.customerId = customerId;
    if (leadId) query.leadId = leadId;
    if (opportunityId) query.opportunityId = opportunityId;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Activity.countDocuments(query);
    const activities = await Activity.find(query)
      .populate('customerId', 'name customerCode')
      .populate('leadId', 'name leadCode')
      .populate('opportunityId', 'name opportunityCode')
      .populate('assignedTo', 'name email role')
      .sort({ activityDate: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: activities,
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

export const createActivity = async (req, res, next) => {
  try {
    const { activityType, subject, description, activityDate, customerId, leadId, opportunityId, assignedTo } = req.body;

    const activity = await Activity.create({
      activityType,
      subject,
      description,
      activityDate: activityDate || Date.now(),
      customerId: customerId || null,
      leadId: leadId || null,
      opportunityId: opportunityId || null,
      assignedTo: assignedTo || req.user._id,
      createdBy: req.user._id,
    });

    await logAuditEvent(req, {
      action: 'CREATE',
      entityName: 'Activity',
      recordId: activity._id,
      newValue: activity.toObject(),
      details: `Logged ${activity.activityType}: ${activity.subject}`,
    });

    res.status(201).json({
      success: true,
      message: 'Activity logged successfully.',
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};
