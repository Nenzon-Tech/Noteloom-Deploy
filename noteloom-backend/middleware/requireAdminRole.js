const CollegeRoleConfig = require('../models/CollegeRoleConfig');

const requireAdminRole = (...allowedRoles) => (req, res, next) => {
  if (req.role !== 'college_admin') {
    return res.status(403).json({ error: 'Access denied: College Admin role required' });
  }

  // Super Admin bypasses all role restrictions
  if (req.isSuperAdmin) {
    return next();
  }

  // Check if any assigned role matches allowedRoles
  const assignedRoles = req.adminRoles || [];
  const hasRoleMatch = assignedRoles.some(roleKey => allowedRoles.includes(roleKey));

  if (hasRoleMatch) {
    return next();
  }

  return res.status(403).json({ 
    error: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}` 
  });
};

const requireSuperAdmin = (req, res, next) => {
  if (req.role !== 'college_admin' || !req.isSuperAdmin) {
    return res.status(403).json({ error: 'Super Admin access required for this action' });
  }
  next();
};

const checkConfigLock = async (req, res, next) => {
  try {
    const config = await CollegeRoleConfig.findOne({ tenantId: req.tenant.id });
    if (config && config.isLocked) {
      return res.status(423).json({ 
        error: 'Configuration is locked. Please unlock it before attempting changes.',
        lockedAt: config.lockedAt
      });
    }
    next();
  } catch (error) {
    console.error('Check lock error:', error);
    res.status(500).json({ error: 'Failed to verify configuration lock state' });
  }
};

module.exports = {
  requireAdminRole,
  requireSuperAdmin,
  checkConfigLock
};
