import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // Do not return password by default in queries
    },
    role: {
      type: String,
      enum: {
        values: ['Admin', 'Manager', 'SalesExecutive'],
        message: 'Role must be Admin, Manager, or SalesExecutive',
      },
      default: 'SalesExecutive',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    failedLoginCount: {
      type: Number,
      default: 0,
    },
    lockoutUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
  }
);

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
userSchema.methods.isLocked = function () {
  return !!(this.lockoutUntil && this.lockoutUntil > Date.now());
};

// Handle failed login attempt
userSchema.methods.incLoginAttempts = async function (maxAttempts = 5, lockMinutes = 15) {
  // If a previous lockout has expired, restart at 1
  if (this.lockoutUntil && this.lockoutUntil < Date.now()) {
    return this.updateOne({
      $set: { failedLoginCount: 1 },
      $unset: { lockoutUntil: 1 },
    });
  }

  const updates = { $inc: { failedLoginCount: 1 } };
  // If threshold reached, set lockout date
  if (this.failedLoginCount + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = {
      lockoutUntil: new Date(Date.now() + lockMinutes * 60 * 1000),
    };
  }

  return this.updateOne(updates);
};

// Reset login attempts on successful login
userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: { failedLoginCount: 0 },
    $unset: { lockoutUntil: 1 },
  });
};

const User = mongoose.model('User', userSchema);
export default User;
