import User from '../models/User.js';
import { logAuditEvent } from '../services/auditService.js';

// @desc    Get all users with search and pagination (Admin only)
// @route   GET /api/users
// @access  Private (Admin only, or Manager for listing sales team)
export const getUsers = async (req, res, next) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role) query.role = role;
    if (status !== undefined) query.isActive = status === 'true';

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: users,
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

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin only)
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new user (Admin only)
// @route   POST /api/users
// @access  Private (Admin only)
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, isActive } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: role || 'SalesExecutive',
      isActive: isActive !== undefined ? isActive : true,
    });

    const safeUser = user.toJSON();

    await logAuditEvent(req, {
      action: 'CREATE',
      entityName: 'User',
      recordId: user._id,
      newValue: safeUser,
      details: `Admin created user: ${user.email} (${user.role})`,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details
// @route   PUT /api/users/:id
// @access  Private (Admin only)
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { name, email, role, isActive, password } = req.body;
    const oldValue = user.toJSON();

    if (email && email.toLowerCase().trim() !== user.email) {
      const emailConflict = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: user._id },
      });
      if (emailConflict) {
        return res.status(409).json({
          success: false,
          message: 'Email is already in use by another account.',
        });
      }
      user.email = email.toLowerCase().trim();
    }

    if (name) user.name = name;

    // Check Role Change
    if (role && role !== user.role) {
      const oldRole = user.role;
      user.role = role;
      await logAuditEvent(req, {
        action: 'ROLE_CHANGE',
        entityName: 'User',
        recordId: user._id,
        oldValue: { role: oldRole },
        newValue: { role },
        details: `Role changed from ${oldRole} to ${role} for ${user.email}`,
      });
    }

    if (isActive !== undefined) user.isActive = isActive;

    if (password) {
      user.password = password; // Trigger pre('save') hash
      await logAuditEvent(req, {
        action: 'SECURITY',
        entityName: 'User',
        recordId: user._id,
        details: `Password reset by administrator for ${user.email}`,
      });
    }

    await user.save();
    const safeUser = user.toJSON();

    await logAuditEvent(req, {
      action: 'UPDATE',
      entityName: 'User',
      recordId: user._id,
      oldValue,
      newValue: safeUser,
      details: `Updated user profile: ${user.email}`,
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user status (Active/Inactive)
// @route   PATCH /api/users/:id/status
// @access  Private (Admin only)
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Prevent deactivating own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account.',
      });
    }

    const oldStatus = user.isActive;
    user.isActive = !user.isActive;
    await user.save();

    await logAuditEvent(req, {
      action: 'STATUS_CHANGE',
      entityName: 'User',
      recordId: user._id,
      oldValue: { isActive: oldStatus },
      newValue: { isActive: user.isActive },
      details: `User status changed to ${user.isActive ? 'Active' : 'Inactive'} for ${user.email}`,
    });

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
      data: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unlock a locked user account
// @route   POST /api/users/:id/unlock
// @access  Private (Admin only)
export const unlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await user.resetLoginAttempts();

    await logAuditEvent(req, {
      action: 'SECURITY',
      entityName: 'User',
      recordId: user._id,
      details: `Admin unlocked user account: ${user.email}`,
    });

    res.status(200).json({
      success: true,
      message: `Account for ${user.email} unlocked successfully.`,
    });
  } catch (error) {
    next(error);
  }
};
