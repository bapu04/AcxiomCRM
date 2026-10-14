export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before checking permissions.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' is not authorized to access this resource.`,
      });
    }

    next();
  };
};

// Generates role-based filter query for CRM resources
export const buildRoleQuery = (user, existingQuery = {}) => {
  if (!user) return existingQuery;
  
  // Admin and Manager can view all team records
  if (['Admin', 'Manager'].includes(user.role)) {
    return existingQuery;
  }
  
  // SalesExecutive is strictly restricted to assigned records
  return {
    ...existingQuery,
    $or: [
      { assignedTo: user._id },
      { createdBy: user._id },
    ],
  };
};
