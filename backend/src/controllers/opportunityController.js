import Opportunity from '../models/Opportunity.js';
import Customer from '../models/Customer.js';
import { generateCode } from '../utils/codeGenerator.js';
import { logAuditEvent } from '../services/auditService.js';
import { buildRoleQuery } from '../middleware/role.js';

// @desc    Get all opportunities with search and filter
// @route   GET /api/opportunities
// @access  Private
export const getOpportunities = async (req, res, next) => {
  try {
    const { search, stage, status, customerId, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    let query = {};
    query = buildRoleQuery(req.user, query);

    if (stage) query.stage = stage;
    if (status) query.status = status;
    if (customerId) query.customerId = customerId;

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { opportunityCode: searchRegex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Opportunity.countDocuments(query);
    const opportunities = await Opportunity.find(query)
      .populate('customerId', 'name customerCode email phone companyName')
      .populate('leadId', 'name leadCode')
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: opportunities,
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

// @desc    Get opportunity by ID
// @route   GET /api/opportunities/:id
// @access  Private
export const getOpportunityById = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate('customerId', 'name customerCode email phone companyName')
      .populate('leadId', 'name leadCode')
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email');

    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }

    if (
      req.user.role === 'SalesExecutive' &&
      opportunity.assignedTo?._id?.toString() !== req.user._id.toString() &&
      opportunity.createdBy?._id?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this opportunity.',
      });
    }

    res.status(200).json({ success: true, data: opportunity });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new opportunity
// @route   POST /api/opportunities
// @access  Private
export const createOpportunity = async (req, res, next) => {
  try {
    const { name, customerId, leadId, amount, stage, probability, expectedCloseDate, assignedTo, notes } = req.body;

    // Validate Customer Existence
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(400).json({
        success: false,
        message: 'Referenced customer does not exist.',
      });
    }

    // Business Rule 1: Amount must be greater than 0
    if (Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Opportunity Amount must be greater than 0.',
      });
    }

    // Business Rule 2: Probability must be 0-100
    if (probability < 0 || probability > 100) {
      return res.status(400).json({
        success: false,
        message: 'Probability must be between 0 and 100.',
      });
    }

    // Business Rule 3: Expected Close Date cannot be in the past for active opportunities
    const activeStages = ['Qualification', 'Proposal', 'Negotiation'];
    const chosenStage = stage || 'Qualification';
    const closeDate = new Date(expectedCloseDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (activeStages.includes(chosenStage) && closeDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Expected Close Date cannot be in the past.',
      });
    }

    const count = await Opportunity.countDocuments();
    const opportunityCode = generateCode('OPP', count + 1);

    const opportunity = await Opportunity.create({
      opportunityCode,
      name,
      customerId,
      leadId: leadId || null,
      amount,
      stage: chosenStage,
      probability: probability !== undefined ? probability : 20,
      expectedCloseDate: closeDate,
      assignedTo: assignedTo || req.user._id,
      notes,
      createdBy: req.user._id,
    });

    const populated = await Opportunity.findById(opportunity._id)
      .populate('customerId', 'name customerCode')
      .populate('assignedTo', 'name email');

    await logAuditEvent(req, {
      action: 'CREATE',
      entityName: 'Opportunity',
      recordId: opportunity._id,
      newValue: opportunity.toObject(),
      details: `Created opportunity: ${opportunity.name} ($${opportunity.amount})`,
    });

    res.status(201).json({
      success: true,
      message: 'Opportunity created successfully.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update opportunity
// @route   PUT /api/opportunities/:id
// @access  Private
export const updateOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }

    if (
      req.user.role === 'SalesExecutive' &&
      opportunity.assignedTo?.toString() !== req.user._id.toString() &&
      opportunity.createdBy?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to update this opportunity.',
      });
    }

    const { name, customerId, leadId, amount, stage, probability, expectedCloseDate, assignedTo, notes } = req.body;

    // Validate Customer if changed
    if (customerId && customerId !== opportunity.customerId.toString()) {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res.status(400).json({
          success: false,
          message: 'Referenced customer does not exist.',
        });
      }
      opportunity.customerId = customerId;
    }

    // Business Rule 1: Amount must be > 0
    if (amount !== undefined) {
      if (Number(amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Opportunity Amount must be greater than 0.',
        });
      }
      opportunity.amount = amount;
    }

    // Business Rule 2: Probability 0-100
    if (probability !== undefined) {
      if (probability < 0 || probability > 100) {
        return res.status(400).json({
          success: false,
          message: 'Probability must be between 0 and 100.',
        });
      }
      opportunity.probability = probability;
    }

    const newStage = stage || opportunity.stage;

    // Business Rule 3: Expected Close Date validation
    if (expectedCloseDate) {
      const closeDate = new Date(expectedCloseDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const activeStages = ['Qualification', 'Proposal', 'Negotiation'];
      if (activeStages.includes(newStage) && closeDate < today) {
        return res.status(400).json({
          success: false,
          message: 'Expected Close Date cannot be in the past.',
        });
      }
      opportunity.expectedCloseDate = closeDate;
    }

    const oldValue = opportunity.toObject();

    if (name) opportunity.name = name;
    if (leadId !== undefined) opportunity.leadId = leadId || null;
    if (stage) opportunity.stage = stage;
    if (assignedTo) opportunity.assignedTo = assignedTo;
    if (notes !== undefined) opportunity.notes = notes;

    await opportunity.save();

    const updated = await Opportunity.findById(opportunity._id)
      .populate('customerId', 'name customerCode')
      .populate('assignedTo', 'name email');

    await logAuditEvent(req, {
      action: 'UPDATE',
      entityName: 'Opportunity',
      recordId: opportunity._id,
      oldValue,
      newValue: updated.toObject(),
      details: `Updated opportunity: ${opportunity.name} (Stage: ${opportunity.stage}, Amount: $${opportunity.amount})`,
    });

    res.status(200).json({
      success: true,
      message: 'Opportunity updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete opportunity
// @route   DELETE /api/opportunities/:id
// @access  Private (Admin / Manager)
export const deleteOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }

    if (req.user.role === 'SalesExecutive') {
      return res.status(403).json({
        success: false,
        message: 'Sales Executives are not authorized to delete opportunities.',
      });
    }

    const oldValue = opportunity.toObject();
    await Opportunity.findByIdAndDelete(req.params.id);

    await logAuditEvent(req, {
      action: 'DELETE',
      entityName: 'Opportunity',
      recordId: req.params.id,
      oldValue,
      details: `Deleted opportunity: ${opportunity.name} (${opportunity.opportunityCode})`,
    });

    res.status(200).json({
      success: true,
      message: `Opportunity ${opportunity.name} deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};
