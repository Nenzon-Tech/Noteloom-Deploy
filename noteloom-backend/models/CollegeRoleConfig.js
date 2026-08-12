const mongoose = require('mongoose');

const collegeRoleConfigSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, unique: true },
  
  // Custom role definitions created specifically for this college by IT Portal
  collegeCustomRoles: [{
    key: { type: String, required: true },
    label: { type: String, required: true },
    description: String,
    defaultPermissions: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
  }],

  // Custom role labels overridden for this college by IT Admin
  customRoleLabels: {
    type: Map,
    of: String,
    default: {}
  },

  // Role -> Tab permissions mapping configured by College Super Admin
  roleTabConfig: {
    type: Map,
    of: [String],
    default: {}
  },

  // Locking system
  isLocked: { type: Boolean, default: false },
  lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lockedAt: Date,

  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CollegeRoleConfig', collegeRoleConfigSchema);
