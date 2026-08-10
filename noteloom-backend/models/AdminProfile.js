const mongoose = require('mongoose');

const adminProfileSchema = new mongoose.Schema({
  uid: { type: String, unique: true, sparse: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: String,
  email: String,
  adminLevel: { type: String, default: 'College Admin' },
  employeeId: String,
  responsibilities: String,
  approvalAuthority: { type: String, default: 'Full' },
  accessLevel: { type: String, default: 'Standard' },
  adminRoles: {
    type: [String],
    default: ['super_admin']
  },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedAt: { type: Date, default: Date.now }
});

adminProfileSchema.index({ userId: 1, tenantId: 1 }, { unique: true });
adminProfileSchema.index({ employeeId: 1, tenantId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('AdminProfile', adminProfileSchema);