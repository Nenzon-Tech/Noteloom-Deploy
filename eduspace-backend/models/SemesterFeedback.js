const mongoose = require('mongoose');

const semesterFeedbackSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  // userId and studentId both reference the student's User _id.
  // `studentId` mirrors a pre-existing legacy unique index on this collection.
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamSession' },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  subjectCode: String,
  semester: Number,
  rating: { type: Number, min: 1, max: 5, default: 5 },
  comments: String,
  submittedAt: { type: Date, default: Date.now }
});

semesterFeedbackSchema.index({ userId: 1, subjectId: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model('SemesterFeedback', semesterFeedbackSchema);