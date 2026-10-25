const ApiError = require('../utils/ApiError');

// Use after "protect". Allows only users whose role (loaded from the database) is listed.
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return next(new ApiError(401, 'Authentication required.'));
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, 'You do not have permission to do this.'));
  }
  return next();
};

module.exports = { requireRole, requireAdmin: requireRole('admin') };
