import Customer from '../models/Customer.js';
import Lead from '../models/Lead.js';
import Opportunity from '../models/Opportunity.js';
import FollowUp from '../models/FollowUp.js';
import Activity from '../models/Activity.js';
import { buildRoleQuery } from '../middleware/role.js';

// @desc    Get dashboard metrics, KPI cards, and chart data
// @route   GET /api/dashboard
// @access  Private
export const getDashboardData = async (req, res, next) => {
  try {
    const user = req.user;
    const baseQuery = buildRoleQuery(user);

    // 1. KPI Cards
    const totalCustomers = await Customer.countDocuments(baseQuery);
    const totalLeads = await Lead.countDocuments(baseQuery);
    const openLeads = await Lead.countDocuments({
      ...baseQuery,
      status: { $in: ['New', 'Contacted', 'Qualified'] },
    });

    const totalOpportunities = await Opportunity.countDocuments(baseQuery);
    const openOpportunities = await Opportunity.countDocuments({
      ...baseQuery,
      status: 'Open',
    });
    const wonOpportunities = await Opportunity.countDocuments({
      ...baseQuery,
      status: 'Won',
    });
    const lostOpportunities = await Opportunity.countDocuments({
      ...baseQuery,
      status: 'Lost',
    });

    // Pipeline sum aggregation
    const pipelineAggregation = await Opportunity.aggregate([
      { $match: { ...baseQuery, status: 'Open' } },
      {
        $group: {
          _id: null,
          totalPipelineValue: { $sum: '$amount' },
          totalWeightedValue: {
            $sum: { $multiply: ['$amount', { $divide: ['$probability', 100] }] },
          },
        },
      },
    ]);

    const totalPipelineValue = pipelineAggregation[0]?.totalPipelineValue || 0;
    const totalWeightedValue = Math.round((pipelineAggregation[0]?.totalWeightedValue || 0) * 100) / 100;

    // Follow-ups counts
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endToday = new Date();
    endToday.setHours(23, 59, 59, 999);

    const pendingFollowUps = await FollowUp.countDocuments({
      ...baseQuery,
      status: 'Planned',
      followUpDate: { $lte: endToday },
    });

    // 2. Charts Data
    // Lead Status breakdown
    const leadStatuses = ['New', 'Contacted', 'Qualified', 'Unqualified', 'Converted', 'Lost'];
    const leadStatusCounts = await Lead.aggregate([
      { $match: baseQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const leadStatusMap = Object.fromEntries(leadStatusCounts.map((i) => [i._id, i.count]));
    const leadStatusData = {
      labels: leadStatuses,
      datasets: [
        {
          label: 'Leads by Status',
          data: leadStatuses.map((s) => leadStatusMap[s] || 0),
          backgroundColor: [
            '#3B82F6', // New: Blue
            '#06B6D4', // Contacted: Cyan
            '#10B981', // Qualified: Emerald
            '#F59E0B', // Unqualified: Amber
            '#8B5CF6', // Converted: Purple
            '#EF4444', // Lost: Red
          ],
        },
      ],
    };

    // Opportunity Pipeline by Stage
    const stages = ['Qualification', 'Proposal', 'Negotiation', 'Won', 'Lost'];
    const oppStageCounts = await Opportunity.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);
    const oppStageMap = Object.fromEntries(oppStageCounts.map((i) => [i._id, i]));
    const opportunityPipelineData = {
      labels: stages,
      datasets: [
        {
          label: 'Deal Value ($)',
          data: stages.map((s) => oppStageMap[s]?.totalAmount || 0),
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(139, 92, 246, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(239, 68, 68, 0.7)',
          ],
          borderColor: ['#3B82F6', '#F59E0B', '#8B5CF6', '#10B981', '#EF4444'],
          borderWidth: 1,
        },
      ],
    };

    // 3. Upcoming Follow-ups (5 latest)
    const upcomingFollowUps = await FollowUp.find({
      ...baseQuery,
      status: 'Planned',
    })
      .populate('customerId', 'name')
      .populate('leadId', 'name')
      .populate('assignedTo', 'name')
      .sort({ followUpDate: 1 })
      .limit(5);

    // 4. Recent Activities (5 latest)
    const recentActivities = await Activity.find(baseQuery)
      .populate('customerId', 'name')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalCustomers,
          totalLeads,
          openLeads,
          totalOpportunities,
          openOpportunities,
          wonOpportunities,
          lostOpportunities,
          totalPipelineValue,
          totalWeightedValue,
          pendingFollowUps,
        },
        charts: {
          leadStatus: leadStatusData,
          opportunityPipeline: opportunityPipelineData,
        },
        upcomingFollowUps,
        recentActivities,
      },
    });
  } catch (error) {
    next(error);
  }
};
