const mongoose = require('mongoose');

const facultyProfileSchema = new mongoose.Schema({
  uid: { type: String, unique: true, sparse: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: String,
  email: String,
  department: { type: String, required: true },
  designation: String,
  qualification: String,
  employeeId: String,
  experience: Number,
  specialization: String,
  phoneNumber: String
});

facultyProfileSchema.index({ userId: 1, tenantId: 1 }, { unique: true });
facultyProfileSchema.index({ employeeId: 1, tenantId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('FacultyProfile', facultyProfileSchema);