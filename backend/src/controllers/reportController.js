import Customer from '../models/Customer.js';
import Lead from '../models/Lead.js';
import Opportunity from '../models/Opportunity.js';
import FollowUp from '../models/FollowUp.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import { buildRoleQuery } from '../middleware/role.js';

// @desc    Get Pipeline Report (Stage-wise and Owner-wise)
// @route   GET /api/reports/pipeline
// @access  Private (Admin / Manager, scoped for SalesExecutive)
export const getPipelineReport = async (req, res, next) => {
  try {
    const baseQuery = buildRoleQuery(req.user);

    // Stage-wise aggregation
    const stageSummary = await Opportunity.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: '$stage',
          totalDeals: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          weightedAmount: {
            $sum: { $multiply: ['$amount', { $divide: ['$probability', 100] }] },
          },
          avgProbability: { $avg: '$probability' },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    // Owner-wise aggregation
    const ownerSummary = await Opportunity.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: '$assignedTo',
          totalDeals: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          weightedAmount: {
            $sum: { $multiply: ['$amount', { $divide: ['$probability', 100] }] },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'owner',
        },
      },
      { $unwind: { path: '$owner', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          ownerName: { $ifNull: ['$owner.name', 'Unassigned'] },
          ownerEmail: { $ifNull: ['$owner.email', 'N/A'] },
          totalDeals: 1,
          totalAmount: 1,
          weightedAmount: 1,
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        stageSummary,
        ownerSummary,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Lead Conversion Report
// @route   GET /api/reports/conversion
// @access  Private
export const getConversionReport = async (req, res, next) => {
  try {
    const baseQuery = buildRoleQuery(req.user);

    const totalLeads = await Lead.countDocuments(baseQuery);
    const convertedLeads = await Lead.countDocuments({ ...baseQuery, status: 'Converted' });
    const qualifiedLeads = await Lead.countDocuments({ ...baseQuery, status: 'Qualified' });
    const lostLeads = await Lead.countDocuments({ ...baseQuery, status: 'Lost' });

    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 1000) / 10 : 0;

    // By source
    const sourceBreakdown = await Lead.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: '$source',
          total: { $sum: 1 },
          converted: {
            $sum: { $cond: [{ $eq: ['$status', 'Converted'] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          source: '$_id',
          total: 1,
          converted: 1,
          rate: {
            $cond: [
              { $gt: ['$total', 0] },
              { $round: [{ $multiply: [{ $divide: ['$converted', '$total'] }, 100] }, 1] },
              0,
            ],
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalLeads,
        convertedLeads,
        qualifiedLeads,
        lostLeads,
        conversionRate,
        sourceBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get User Activity Report
// @route   GET /api/reports/user-activity
// @access  Private (Admin / Manager)
export const getUserActivityReport = async (req, res, next) => {
  try {
    const userSummary = await Activity.aggregate([
      {
        $group: {
          _id: '$assignedTo',
          totalActivities: { $sum: 1 },
          calls: { $sum: { $cond: [{ $eq: ['$activityType', 'Call'] }, 1, 0] } },
          meetings: { $sum: { $cond: [{ $eq: ['$activityType', 'Meeting'] }, 1, 0] } },
          emails: { $sum: { $cond: [{ $eq: ['$activityType', 'Email'] }, 1, 0] } },
          tasks: { $sum: { $cond: [{ $eq: ['$activityType', 'Task'] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          name: '$user.name',
          email: '$user.email',
          role: '$user.role',
          totalActivities: 1,
          calls: 1,
          meetings: 1,
          emails: 1,
          tasks: 1,
        },
      },
      { $sort: { totalActivities: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: userSummary,
    });
  } catch (error) {
    next(error);
  }
};
