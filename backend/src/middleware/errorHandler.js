export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('[AcxiomCRM Server Error]', err);

  // Mongoose Bad ObjectId / CastError
  if (err.name === 'CastError') {
    const message = `Resource not found with id: ${err.value}`;
    return res.status(404).json({ success: false, message });
  }

  // Mongoose Duplicate Key (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    const message = `Duplicate value '${value}' entered for unique field '${field}'. A customer or user with this ${field} already exists.`;
    return res.status(409).json({ success: false, message, field });
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: messages[0] || 'Validation Error',
      errors: messages,
    });
  }

  // JSON Web Token Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Authentication token has expired.' });
  }

  // Default Internal Server Error
  res.status(err.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error. Please contact support.',
  });
};
