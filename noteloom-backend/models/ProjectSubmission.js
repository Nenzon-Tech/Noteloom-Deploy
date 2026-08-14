const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  field: String,
  fileUrl: String,
  fileName: String,
  originalName: String,
  publicId: String,
  fileType: String,
  mimeType: String,
  size: Number
});

const projectSubmissionSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, required: true },
  studentEmail: String,
  rollNo: String,
  department: String,
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },

  projectType: { type: String, enum: ['Software', 'Hardware'], required: true },
  projectTitle: { type: String, required: true },
  domain: String,
  guideName: String,
  guideDepartment: String,
  teamDetails: String,
  synopsis: String,
  status: { type: String, enum: ['Idea', 'In Progress', 'Review', 'Submitted', 'Completed'], default: 'Idea' },
  expectedCompletion: String,
  demoVideo: String,
  sourceCodeLink: String,
  liveDeploymentUrl: String,
  apiDocumentation: String,
  setupInstructions: String,
  modelLinks: String,
  bom: String,
  firmwareCode: String,

  attachments: [attachmentSchema],

  reviewStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'revision'], default: 'pending' },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewerName: String,
  reviewComment: String,
  reviewedAt: Date
}, { timestamps: true });

projectSubmissionSchema.index({ tenantId: 1, studentId: 1 });
projectSubmissionSchema.index({ tenantId: 1, reviewStatus: 1 });

module.exports = mongoose.model('ProjectSubmission', projectSubmissionSchema);
