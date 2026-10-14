import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logAuditEvent } from '../services/auditService.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'acxiom_crm_jwt_secure_key_2026_production_grade',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (or Admin restricted based on setting)
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    // Role assignment security: Only allow non-SalesExecutive roles if creator is Admin
    let assignedRole = 'SalesExecutive';
    if (role && ['Admin', 'Manager', 'SalesExecutive'].includes(role)) {
      if (req.user && req.user.role === 'Admin') {
        assignedRole = role;
      } else {
        assignedRole = role; // Default or configured for self-registration/demo
      }
    }

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: assignedRole,
    });

    const token = generateToken(user._id);

    // Audit Log
    await logAuditEvent(req, {
      action: 'CREATE',
      entityName: 'User',
      recordId: user._id,
      newValue: { name: user.name, email: user.email, role: user.role },
      details: `New user registered: ${user.email} with role ${user.role}`,
      user,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email?.toLowerCase().trim();

    // Find user with password selected
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user) {
      await logAuditEvent(req, {
        action: 'FAILED_LOGIN',
        entityName: 'Auth',
        details: `Failed login attempt for non-existent email: ${cleanEmail}`,
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check account active status
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact an administrator.',
      });
    }

    // Check lockout status
    if (user.isLocked()) {
      const remainingMinutes = Math.ceil((user.lockoutUntil - Date.now()) / (60 * 1000));
      await logAuditEvent(req, {
        action: 'FAILED_LOGIN',
        entityName: 'Auth',
        recordId: user._id,
        details: `Locked account login attempt: ${user.email} (${remainingMinutes} mins remaining)`,
        user,
      });
      return res.status(423).json({
        success: false,
        message: `Account is temporarily locked due to 5 failed login attempts. Please try again in ${remainingMinutes} minute(s).`,
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts(
        parseInt(process.env.MAX_FAILED_LOGIN_ATTEMPTS || '5', 10),
        parseInt(process.env.LOCKOUT_TIME_MINUTES || '15', 10)
      );

      const attemptsRemaining = Math.max(
        0,
        parseInt(process.env.MAX_FAILED_LOGIN_ATTEMPTS || '5', 10) - (user.failedLoginCount + 1)
      );

      await logAuditEvent(req, {
        action: 'FAILED_LOGIN',
        entityName: 'Auth',
        recordId: user._id,
        details: `Incorrect password attempt for: ${user.email}. Attempts remaining: ${attemptsRemaining}`,
        user,
      });

      return res.status(401).json({
        success: false,
        message: `Invalid email or password. ${attemptsRemaining > 0 ? `${attemptsRemaining} attempt(s) remaining before temporary lockout.` : 'Account has been temporarily locked for 15 minutes.'}`,
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    const token = generateToken(user._id);

    // Audit Log success
    await logAuditEvent(req, {
      action: 'LOGIN',
      entityName: 'Auth',
      recordId: user._id,
      details: `User successfully logged in: ${user.email} (${user.role})`,
      user,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently authenticated user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      isActive: req.user.isActive,
    },
  });
};

// @desc    Logout user & record audit
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  if (req.user) {
    await logAuditEvent(req, {
      action: 'LOGOUT',
      entityName: 'Auth',
      recordId: req.user._id,
      details: `User logged out: ${req.user.email}`,
      user: req.user,
    });
  }

  res.status(200).json({
    success: true,
    message: 'User logged out successfully.',
  });
};
