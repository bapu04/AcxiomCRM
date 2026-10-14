import Customer from '../models/Customer.js';
import User from '../models/User.js';
import { generateCode } from '../utils/codeGenerator.js';
import { logAuditEvent } from '../services/auditService.js';
import { buildRoleQuery } from '../middleware/role.js';

// @desc    Get all customers with search and pagination
// @route   GET /api/customers
// @access  Private
export const getCustomers = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    let query = {};
    query = buildRoleQuery(req.user, query);

    if (status) {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { companyName: searchRegex },
        { customerCode: searchRegex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: customers,
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

// @desc    Get customer by ID
// @route   GET /api/customers/:id
// @access  Private
export const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email');

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    // Role check for SalesExecutive
    if (
      req.user.role === 'SalesExecutive' &&
      customer.assignedTo?._id?.toString() !== req.user._id.toString() &&
      customer.createdBy?._id?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this customer.',
      });
    }

    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new customer
// @route   POST /api/customers
// @access  Private
export const createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, companyName, address, city, state, status, assignedTo, notes } = req.body;

    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone.trim();

    // Enforce email uniqueness
    const emailExists = await Customer.findOne({ email: cleanEmail });
    if (emailExists) {
      return res.status(409).json({
        success: false,
        message: `Duplicate Customer: A customer with email '${cleanEmail}' already exists.`,
      });
    }

    // Enforce phone uniqueness
    const phoneExists = await Customer.findOne({ phone: cleanPhone });
    if (phoneExists) {
      return res.status(409).json({
        success: false,
        message: `Duplicate Customer: A customer with phone '${cleanPhone}' already exists.`,
      });
    }

    // Generate unique sequential customer code
    const count = await Customer.countDocuments();
    const customerCode = generateCode('CUST', count + 1);

    const customer = await Customer.create({
      customerCode,
      name,
      email: cleanEmail,
      phone: cleanPhone,
      companyName,
      address,
      city,
      state,
      status: status || 'Active',
      assignedTo: assignedTo || req.user._id,
      notes,
      createdBy: req.user._id,
    });

    const populated = await Customer.findById(customer._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    // Audit Log
    await logAuditEvent(req, {
      action: 'CREATE',
      entityName: 'Customer',
      recordId: customer._id,
      newValue: customer.toObject(),
      details: `Created customer: ${customer.name} (${customer.customerCode})`,
    });

    res.status(201).json({
      success: true,
      message: 'Customer created successfully.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
export const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    // Authorization check
    if (
      req.user.role === 'SalesExecutive' &&
      customer.assignedTo?.toString() !== req.user._id.toString() &&
      customer.createdBy?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to edit this customer.',
      });
    }

    const { name, email, phone, companyName, address, city, state, status, assignedTo, notes } = req.body;

    // Check unique email if modified
    if (email && email.toLowerCase().trim() !== customer.email) {
      const emailConflict = await Customer.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: customer._id },
      });
      if (emailConflict) {
        return res.status(409).json({
          success: false,
          message: `Email '${email}' is already registered with another customer.`,
        });
      }
      customer.email = email.toLowerCase().trim();
    }

    // Check unique phone if modified
    if (phone && phone.trim() !== customer.phone) {
      const phoneConflict = await Customer.findOne({
        phone: phone.trim(),
        _id: { $ne: customer._id },
      });
      if (phoneConflict) {
        return res.status(409).json({
          success: false,
          message: `Phone '${phone}' is already registered with another customer.`,
        });
      }
      customer.phone = phone.trim();
    }

    const oldValue = customer.toObject();

    if (name) customer.name = name;
    if (companyName !== undefined) customer.companyName = companyName;
    if (address !== undefined) customer.address = address;
    if (city !== undefined) customer.city = city;
    if (state !== undefined) customer.state = state;
    if (status) customer.status = status;
    if (assignedTo) customer.assignedTo = assignedTo;
    if (notes !== undefined) customer.notes = notes;

    await customer.save();

    const updated = await Customer.findById(customer._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    // Audit Log
    await logAuditEvent(req, {
      action: 'UPDATE',
      entityName: 'Customer',
      recordId: customer._id,
      oldValue,
      newValue: updated.toObject(),
      details: `Updated customer: ${customer.name} (${customer.customerCode})`,
    });

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete or deactivate customer
// @route   DELETE /api/customers/:id
// @access  Private (Admin / Manager only)
export const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    // Role restriction: SalesExecutive cannot delete customers
    if (req.user.role === 'SalesExecutive') {
      return res.status(403).json({
        success: false,
        message: 'Sales Executives are not authorized to delete customers.',
      });
    }

    const oldValue = customer.toObject();
    await Customer.findByIdAndDelete(req.params.id);

    // Audit Log
    await logAuditEvent(req, {
      action: 'DELETE',
      entityName: 'Customer',
      recordId: req.params.id,
      oldValue,
      details: `Deleted customer record: ${customer.name} (${customer.customerCode})`,
    });

    res.status(200).json({
      success: true,
      message: `Customer ${customer.name} deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};
