const mongoose = require('mongoose');

// --- 1. Personal Calendar Event Schema ---
// Handles personal notes, tasks, and events for all users (Student, Faculty, Admin)
const calendarEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  type: { type: String, enum: ['Task', 'Event', 'Note'], default: 'Note' },
  title: { type: String, required: true },
  description: String,
  createdAt: { type: Date, default: Date.now }
});

// --- 2. Class Routine (Master Timetable) Schema ---
// Defines the weekly schedule for a specific Batch (Class)
const classRoutineSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  dayOfWeek: { 
    type: String, 
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 
    required: true 
  },
  periods: [{
    periodNumber: Number, // e.g., 1
    startTime: String,    // e.g., "10:00"
    endTime: String,      // e.g., "11:00"
    isBreak: { type: Boolean, default: false },
    subject: String,
    facultyName: String,  // Abbreviation or Name
    roomNo: String,
    note: String,
    duration: { type: Number, default: 1 } // For merged periods
  }]
});
// Ensure one routine per batch per day
classRoutineSchema.index({ batchId: 1, dayOfWeek: 1 }, { unique: true });

// --- 3. Daily Lesson Log Schema ---
// Tracks what was taught in a specific class on a specific date
const lessonLogSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  date: { type: String, required: true }, // YYYY-MM-DD
  dayOfWeek: String,
  subject: String,
  topicsCovered: String,
  remarks: String,
  createdAt: { type: Date, default: Date.now }
});

// --- 4. Organization Calendar Event Schema ---
// Tenant-wide academic/institutional events shared by all users (Student, Faculty, College Admin)
const orgCalendarEventSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  title: { type: String, required: true, trim: true, maxlength: 150 },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  time: { type: String, default: 'All Day' }, // e.g., "10:00 AM - 01:00 PM"
  type: { type: String, enum: ['EXAM', 'HOLIDAY', 'DEADLINE', 'EVENT'], default: 'EVENT' },
  location: { type: String, default: '' },
  description: { type: String, default: '' },
  attachments: [{
    name: { type: String, default: '' },       // original filename (e.g. syllabus.pdf)
    publicId: { type: String, default: '' },   // Cloudinary public_id (used for proxied downloads)
    url: { type: String, default: '' },        // Cloudinary URL
    size: { type: Number, default: 0 },        // bytes
    uploadedBy: { type: String, default: '' }, // name of the uploader
    uploadedAt: { type: Date, default: Date.now }
  }],
  createdBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, default: '' },
    role: { type: String, default: '' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
orgCalendarEventSchema.index({ tenantId: 1, date: 1 });

// --- 5. Class Schedule (Faculty Weekly Schedule) Schema ---
// Per-faculty weekly schedule referencing real Batch & Subject documents
const classScheduleSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  startTime: String, // e.g., "10:00"
  endTime: String,   // e.g., "11:00"
  roomNo: String,
  note: String,
  createdAt: { type: Date, default: Date.now }
});
classScheduleSchema.index({ tenantId: 1, facultyId: 1, dayOfWeek: 1 });

const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);
const OrgCalendarEvent = mongoose.model('OrgCalendarEvent', orgCalendarEventSchema);
const ClassRoutine = mongoose.model('ClassRoutine', classRoutineSchema);
const LessonLog = mongoose.model('LessonLog', lessonLogSchema);
const ClassSchedule = mongoose.model('ClassSchedule', classScheduleSchema);

module.exports = { CalendarEvent, OrgCalendarEvent, ClassRoutine, LessonLog, ClassSchedule };