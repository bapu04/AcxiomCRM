import FollowUp from '../models/FollowUp.js';
import { logAuditEvent } from '../services/auditService.js';
import { buildRoleQuery } from '../middleware/role.js';

// @desc    Get follow-ups with filters (status, upcoming, overdue)
// @route   GET /api/followups
// @access  Private
export const getFollowUps = async (req, res, next) => {
  try {
    const { status, type, filter, customerId, leadId, opportunityId, page = 1, limit = 10 } = req.query;

    let query = {};
    query = buildRoleQuery(req.user, query);

    if (status) query.status = status;
    if (type) query.followUpType = type;
    if (customerId) query.customerId = customerId;
    if (leadId) query.leadId = leadId;
    if (opportunityId) query.opportunityId = opportunityId;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    if (filter === 'upcoming') {
      query.status = 'Planned';
      query.followUpDate = { $gte: startOfToday };
    } else if (filter === 'overdue') {
      query.status = 'Planned';
      query.followUpDate = { $lt: startOfToday };
    } else if (filter === 'today') {
      query.followUpDate = { $gte: startOfToday, $lte: endOfToday };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await FollowUp.countDocuments(query);
    const followUps = await FollowUp.find(query)
      .populate('customerId', 'name customerCode email phone companyName')
      .populate('leadId', 'name leadCode email phone')
      .populate('opportunityId', 'name opportunityCode amount stage')
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email')
      .sort({ followUpDate: 1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: followUps,
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

// @desc    Get follow-up by ID
// @route   GET /api/followups/:id
// @access  Private
export const getFollowUpById = async (req, res, next) => {
  try {
    const followUp = await FollowUp.findById(req.params.id)
      .populate('customerId', 'name customerCode email phone companyName')
      .populate('leadId', 'name leadCode email phone')
      .populate('opportunityId', 'name opportunityCode amount stage')
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email');

    if (!followUp) {
      return res.status(404).json({ success: false, message: 'Follow-up not found.' });
    }

    if (
      req.user.role === 'SalesExecutive' &&
      followUp.assignedTo?._id?.toString() !== req.user._id.toString() &&
      followUp.createdBy?._id?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this follow-up.',
      });
    }

    res.status(200).json({ success: true, data: followUp });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new follow-up
// @route   POST /api/followups
// @access  Private
export const createFollowUp = async (req, res, next) => {
  try {
    const { customerId, leadId, opportunityId, followUpDate, followUpType, subject, remarks, assignedTo } = req.body;

    const targetDate = new Date(followUpDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Business Rule: Follow-up date cannot be earlier than today for a new/planned follow-up
    if (targetDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Follow-up date cannot be earlier than today.',
      });
    }

    const followUp = await FollowUp.create({
      customerId: customerId || null,
      leadId: leadId || null,
      opportunityId: opportunityId || null,
      followUpDate: targetDate,
      followUpType: followUpType || 'Call',
      subject,
      remarks,
      status: 'Planned',
      assignedTo: assignedTo || req.user._id,
      createdBy: req.user._id,
    });

    const populated = await FollowUp.findById(followUp._id)
      .populate('customerId', 'name customerCode')
      .populate('leadId', 'name leadCode')
      .populate('assignedTo', 'name email');

    await logAuditEvent(req, {
      action: 'CREATE',
      entityName: 'FollowUp',
      recordId: followUp._id,
      newValue: followUp.toObject(),
      details: `Scheduled ${followUp.followUpType} follow-up: ${followUp.subject} for ${targetDate.toLocaleDateString()}`,
    });

    res.status(201).json({
      success: true,
      message: 'Follow-up scheduled successfully.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update follow-up
// @route   PUT /api/followups/:id
// @access  Private
export const updateFollowUp = async (req, res, next) => {
  try {
    const followUp = await FollowUp.findById(req.params.id);
    if (!followUp) {
      return res.status(404).json({ success: false, message: 'Follow-up not found.' });
    }

    if (
      req.user.role === 'SalesExecutive' &&
      followUp.assignedTo?.toString() !== req.user._id.toString() &&
      followUp.createdBy?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to modify this follow-up.',
      });
    }

    const { followUpDate, followUpType, subject, remarks, status, assignedTo, completedNotes } = req.body;

    // Business Rule on rescheduling planned follow-up
    if (followUpDate && (status === 'Planned' || (!status && followUp.status === 'Planned'))) {
      const targetDate = new Date(followUpDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (targetDate < today) {
        return res.status(400).json({
          success: false,
          message: 'Follow-up date cannot be earlier than today.',
        });
      }
      followUp.followUpDate = targetDate;
    }

    const oldValue = followUp.toObject();

    if (followUpType) followUp.followUpType = followUpType;
    if (subject) followUp.subject = subject;
    if (remarks !== undefined) followUp.remarks = remarks;
    if (status) followUp.status = status;
    if (assignedTo) followUp.assignedTo = assignedTo;
    if (completedNotes !== undefined) followUp.completedNotes = completedNotes;

    await followUp.save();

    const updated = await FollowUp.findById(followUp._id)
      .populate('customerId', 'name customerCode')
      .populate('leadId', 'name leadCode')
      .populate('assignedTo', 'name email');

    await logAuditEvent(req, {
      action: 'UPDATE',
      entityName: 'FollowUp',
      recordId: followUp._id,
      oldValue,
      newValue: updated.toObject(),
      details: `Updated follow-up: ${followUp.subject} (Status: ${followUp.status})`,
    });

    res.status(200).json({
      success: true,
      message: 'Follow-up updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark follow-up completed
// @route   PATCH /api/followups/:id/complete
// @access  Private
export const completeFollowUp = async (req, res, next) => {
  try {
    const followUp = await FollowUp.findById(req.params.id);
    if (!followUp) {
      return res.status(404).json({ success: false, message: 'Follow-up not found.' });
    }

    const oldValue = followUp.toObject();
    followUp.status = 'Completed';
    followUp.completedNotes = req.body.completedNotes || req.body.remarks || 'Marked as completed';
    await followUp.save();

    await logAuditEvent(req, {
      action: 'STATUS_CHANGE',
      entityName: 'FollowUp',
      recordId: followUp._id,
      oldValue,
      newValue: followUp.toObject(),
      details: `Follow-up completed: ${followUp.subject}`,
    });

    res.status(200).json({
      success: true,
      message: 'Follow-up marked as completed.',
      data: followUp,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete follow-up
// @route   DELETE /api/followups/:id
// @access  Private (Admin / Manager)
export const deleteFollowUp = async (req, res, next) => {
  try {
    const followUp = await FollowUp.findById(req.params.id);
    if (!followUp) {
      return res.status(404).json({ success: false, message: 'Follow-up not found.' });
    }

    if (req.user.role === 'SalesExecutive') {
      return res.status(403).json({
        success: false,
        message: 'Sales Executives are not authorized to delete follow-ups.',
      });
    }

    const oldValue = followUp.toObject();
    await FollowUp.findByIdAndDelete(req.params.id);

    await logAuditEvent(req, {
      action: 'DELETE',
      entityName: 'FollowUp',
      recordId: req.params.id,
      oldValue,
      details: `Deleted follow-up: ${followUp.subject}`,
    });

    res.status(200).json({
      success: true,
      message: 'Follow-up deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
