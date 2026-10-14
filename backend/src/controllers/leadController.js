import Lead from '../models/Lead.js';
import Customer from '../models/Customer.js';
import Opportunity from '../models/Opportunity.js';
import { generateCode } from '../utils/codeGenerator.js';
import { logAuditEvent } from '../services/auditService.js';
import { buildRoleQuery } from '../middleware/role.js';

// @desc    Get all leads with search and pagination
// @route   GET /api/leads
// @access  Private
export const getLeads = async (req, res, next) => {
  try {
    const { search, status, priority, source, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    let query = {};
    query = buildRoleQuery(req.user, query);

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (source) query.source = source;

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { companyName: searchRegex },
        { leadCode: searchRegex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email role')
      .populate('convertedCustomerId', 'name customerCode email')
      .populate('convertedOpportunityId', 'name amount stage')
      .populate('createdBy', 'name email')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: leads,
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

// @desc    Get lead by ID
// @route   GET /api/leads/:id
// @access  Private
export const getLeadById = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('convertedCustomerId', 'name customerCode email')
      .populate('convertedOpportunityId', 'name amount stage')
      .populate('createdBy', 'name email');

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found.' });
    }

    // Role check for SalesExecutive
    if (
      req.user.role === 'SalesExecutive' &&
      lead.assignedTo?._id?.toString() !== req.user._id.toString() &&
      lead.createdBy?._id?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this lead.',
      });
    }

    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Private
export const createLead = async (req, res, next) => {
  try {
    const { name, email, phone, companyName, source, status, priority, expectedValue, assignedTo, notes } = req.body;

    const count = await Lead.countDocuments();
    const leadCode = generateCode('LEAD', count + 1);

    const lead = await Lead.create({
      leadCode,
      name,
      email: email ? email.toLowerCase().trim() : undefined,
      phone: phone ? phone.trim() : undefined,
      companyName,
      source: source || 'Website',
      status: status || 'New',
      priority: priority || 'Medium',
      expectedValue: expectedValue || 0,
      assignedTo: assignedTo || req.user._id,
      notes,
      createdBy: req.user._id,
    });

    const populated = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    // Audit Log
    await logAuditEvent(req, {
      action: 'CREATE',
      entityName: 'Lead',
      recordId: lead._id,
      newValue: lead.toObject(),
      details: `Created lead: ${lead.name} (${lead.leadCode})`,
    });

    res.status(201).json({
      success: true,
      message: 'Lead created successfully.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Private
export const updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found.' });
    }

    if (
      req.user.role === 'SalesExecutive' &&
      lead.assignedTo?.toString() !== req.user._id.toString() &&
      lead.createdBy?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to update this lead.',
      });
    }

    const oldValue = lead.toObject();
    const { name, email, phone, companyName, source, status, priority, expectedValue, assignedTo, notes } = req.body;

    if (name) lead.name = name;
    if (email !== undefined) lead.email = email ? email.toLowerCase().trim() : undefined;
    if (phone !== undefined) lead.phone = phone ? phone.trim() : undefined;
    if (companyName !== undefined) lead.companyName = companyName;
    if (source) lead.source = source;
    if (status) lead.status = status;
    if (priority) lead.priority = priority;
    if (expectedValue !== undefined) lead.expectedValue = expectedValue;
    if (assignedTo) lead.assignedTo = assignedTo;
    if (notes !== undefined) lead.notes = notes;

    await lead.save();

    const updated = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    // Audit Log
    await logAuditEvent(req, {
      action: 'UPDATE',
      entityName: 'Lead',
      recordId: lead._id,
      oldValue,
      newValue: updated.toObject(),
      details: `Updated lead: ${lead.name} (${lead.leadCode})`,
    });

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Convert lead to customer & optional opportunity
// @route   POST /api/leads/:id/convert
// @access  Private
export const convertLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found.' });
    }

    if (lead.status === 'Converted') {
      return res.status(400).json({
        success: false,
        message: 'This lead has already been converted.',
      });
    }

    const {
      createOpportunity = false,
      opportunityName,
      opportunityAmount,
      opportunityStage = 'Qualification',
      opportunityProbability = 25,
      expectedCloseDate,
    } = req.body;

    // Check or generate customer
    let customer = null;
    const cleanEmail = lead.email ? lead.email.toLowerCase().trim() : null;
    const cleanPhone = lead.phone ? lead.phone.trim() : null;

    if (cleanEmail) {
      customer = await Customer.findOne({ email: cleanEmail });
    }

    if (!customer) {
      const custCount = await Customer.countDocuments();
      const customerCode = generateCode('CUST', custCount + 1);

      customer = await Customer.create({
        customerCode,
        name: lead.name,
        email: cleanEmail || `customer_${Date.now()}@acxiomcrm.local`,
        phone: cleanPhone || `0000000000`,
        companyName: lead.companyName || 'Not Specified',
        status: 'Active',
        assignedTo: lead.assignedTo || req.user._id,
        notes: `Converted from Lead ${lead.leadCode}: ${lead.notes || ''}`,
        createdBy: req.user._id,
      });

      await logAuditEvent(req, {
        action: 'CREATE',
        entityName: 'Customer',
        recordId: customer._id,
        newValue: customer.toObject(),
        details: `Customer automatically created from lead conversion (${lead.leadCode})`,
      });
    }

    // Optionally create Opportunity
    let createdOpp = null;
    if (createOpportunity && opportunityAmount > 0) {
      const oppCount = await Opportunity.countDocuments();
      const opportunityCode = generateCode('OPP', oppCount + 1);

      const closeDate = expectedCloseDate
        ? new Date(expectedCloseDate)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days ahead

      createdOpp = await Opportunity.create({
        opportunityCode,
        name: opportunityName || `${lead.name} - Initial Deal`,
        customerId: customer._id,
        leadId: lead._id,
        amount: opportunityAmount,
        stage: opportunityStage,
        probability: opportunityProbability,
        expectedCloseDate: closeDate,
        assignedTo: lead.assignedTo || req.user._id,
        notes: `Converted from lead ${lead.leadCode}`,
        createdBy: req.user._id,
      });

      await logAuditEvent(req, {
        action: 'CREATE',
        entityName: 'Opportunity',
        recordId: createdOpp._id,
        newValue: createdOpp.toObject(),
        details: `Opportunity created during lead conversion for ${lead.name}`,
      });
    }

    // Update Lead to Converted
    const oldLeadValue = lead.toObject();
    lead.status = 'Converted';
    lead.convertedCustomerId = customer._id;
    if (createdOpp) lead.convertedOpportunityId = createdOpp._id;
    await lead.save();

    await logAuditEvent(req, {
      action: 'CONVERT',
      entityName: 'Lead',
      recordId: lead._id,
      oldValue: oldLeadValue,
      newValue: lead.toObject(),
      details: `Lead ${lead.leadCode} converted to Customer ${customer.customerCode}`,
    });

    res.status(200).json({
      success: true,
      message: 'Lead converted successfully.',
      data: {
        lead,
        customer,
        opportunity: createdOpp,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private (Admin / Manager)
export const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found.' });
    }

    if (req.user.role === 'SalesExecutive') {
      return res.status(403).json({
        success: false,
        message: 'Sales Executives are not authorized to delete leads.',
      });
    }

    const oldValue = lead.toObject();
    await Lead.findByIdAndDelete(req.params.id);

    await logAuditEvent(req, {
      action: 'DELETE',
      entityName: 'Lead',
      recordId: req.params.id,
      oldValue,
      details: `Deleted lead: ${lead.name} (${lead.leadCode})`,
    });

    res.status(200).json({
      success: true,
      message: `Lead ${lead.name} deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};
