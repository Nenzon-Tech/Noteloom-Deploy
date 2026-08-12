const mongoose = require('mongoose');

const globalRoleConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, lowercase: true, trim: true },
  label: { type: String, required: true },
  description: { type: String, default: '' },
  defaultPermissions: [{ type: String }],
  isBuiltIn: { type: Boolean, default: false },
  isSeeded: { type: Boolean, default: false },
  assignmentType: { 
    type: String, 
    enum: ['default_assignment', 'custom_assignment'], 
    default: 'default_assignment' 
  },
  restrictToTenants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('GlobalRoleConfig', globalRoleConfigSchema);
