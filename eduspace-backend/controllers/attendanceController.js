const mongoose = require('mongoose');
const { Routine, Attendance, WeeklyReport } = require('../models/AttendanceModels');
const StudentProfile = require('../models/StudentProfile');
const Batch = require('../models/Batch');

// 1. GET /faculty/init
exports.initFacultyAttendance = async (req, res) => {
  try {
    const { batchId, date } = req.query;
    if (!batchId) return res.status(400).json({ error: "Batch ID required" });

    // Determine Date & Day (normalize to midnight)
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[targetDate.getDay()];

    // Fetch Students
    const studentProfiles = await StudentProfile.find({ 
      tenantId: req.tenant.id, 
      batchId: batchId 
    }).populate('userId', 'name email');

    const students = studentProfiles
      .filter(p => p.userId) 
      .map(p => ({
        _id: p.userId._id, 
        name: p.userId.name,
        uid: p.uid || p.rollNo || "N/A"
      }));

    // Fetch Routine for the Specific Day
    const routine = await Routine.findOne({ 
      tenantId: req.tenant.id, 
      batchId: batchId,
      dayOfWeek: dayOfWeek 
    })
    .populate('periods.subjectId', 'name code') 
    .populate('periods.facultyId', 'name');

    // Fetch Existing Attendance (For Edit Mode)
    const existingRecords = await Attendance.find({
      tenantId: req.tenant.id,
      batchId: batchId,
      date: targetDate
    });

    // Transform existing records into a map: { periodId: { studentId: status } }
    const attendanceMap = {};
    existingRecords.forEach(doc => {
      if (doc.periodId) {
        attendanceMap[doc.periodId] = {};
        doc.records.forEach(r => {
          attendanceMap[doc.periodId][r.studentId] = r.status;
        });
      }
    });

    res.json({
      students,
      todaySchedule: routine ? routine.periods : [],
      day: dayOfWeek,
      date: targetDate,
      existingAttendance: attendanceMap
    });

  } catch (e) {
    console.error("Init Attendance Error:", e);
    res.status(500).json({ error: e.message });
  }
};

// 2. GET /report
exports.getAttendanceReport = async (req, res) => {
  try {
    const { batchId, startDate, endDate } = req.query;
    if (!batchId) return res.status(400).json({ error: "Batch ID required" });
    if (!startDate || !endDate) return res.status(400).json({ error: "Start date and end date are required" });

    // Fetch all students in batch with null safety check
    const batch = await Batch.findById(batchId).populate('students');
    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }
    const allStudents = batch.students || [];

    // Aggregate Attendance Counts
    const attendanceData = await Attendance.aggregate([
      {
        $match: {
          batchId: new mongoose.Types.ObjectId(batchId),
          date: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      { $unwind: "$records" },
      {
        $match: {
          "records.status": { $in: ["Present", "Excused"] }
        }
      },
      {
        $group: {
          _id: "$records.studentId",
          presentCount: { $sum: 1 }
        }
      }
    ]);

    // Map counts to student details (handling students with 0 attendance)
    const report = allStudents.map(student => {
      const record = attendanceData.find(a => a._id.toString() === student._id.toString());
      return {
        studentId: student._id,
        name: student.name,
        username: student.username, // EduSpace ID
        presentCount: record ? record.presentCount : 0
      };
    });

    res.json(report);

  } catch (error) {
    console.error("Attendance Report Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// 3. GET /my-records | /my-attendance  (Student's own attendance)
exports.getMyAttendance = async (req, res) => {
  try {
    const { startDate, endDate, batchId } = req.query;

    // Resolve the calling user's student profile (supplies batch + rollNo)
    const profile = await StudentProfile.findOne({
      userId: req.user.id,
      tenantId: req.tenant.id
    });
    if (!profile) return res.status(404).json({ error: "Student profile not found" });

    const filter = {
      tenantId: req.tenant.id,
      'records.studentId': req.user.id
    };
    if (batchId) filter.batchId = batchId;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const attendanceDocs = await Attendance.find(filter).populate('subjectId', 'name code');

    const statusMap = { Present: 'present', Absent: 'absent', Late: 'late', Leave: 'excused' };

    const records = [];
    attendanceDocs.forEach(doc => {
      const own = doc.records.find(r => r.studentId && r.studentId.toString() === req.user.id.toString());
      if (!own) return;
      records.push({
        _id: doc._id,
        subject: doc.subjectId?.name || 'Lecture',
        subjectCode: doc.subjectId?.code || '',
        date: doc.date,
        status: statusMap[own.status] || 'excused',
        periodId: doc.periodId || null
      });
    });

    // Summary stats (overall percentage across the returned window)
    const present = records.filter(r => r.status === 'present').length;
    const late = records.filter(r => r.status === 'late').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const excused = records.filter(r => r.status === 'excused').length;
    const total = records.length;
    const attended = present + late;
    const overall = total > 0 ? parseFloat(((attended / total) * 100).toFixed(1)) : 0;

    res.json({
      rollNo: profile.rollNo,
      course: profile.course,
      stream: profile.stream,
      currentSemester: profile.currentSemester,
      summary: { total, present, absent, late, excused, overall },
      records
    });
  } catch (e) {
    console.error("My Attendance Error:", e);
    res.status(500).json({ error: e.message });
  }
};

// 4. POST /mark
exports.markAttendance = async (req, res) => {
  try {
    const { batchId, periodId, subjectId, date, records } = req.body;
    const recordDate = new Date(date);
    recordDate.setHours(0, 0, 0, 0);

    await Attendance.findOneAndUpdate(
      { batchId, periodId, date: recordDate },
      { 
        tenantId: req.tenant.id,
        facultyId: req.user.id,
        subjectId,
        records, 
        isFinalized: true 
      },
      { upsert: true, new: true }
    );
    res.json({ success: true, message: "Attendance Saved" });
  } catch (e) {
    console.error("Mark Attendance Error:", e);
    res.status(500).json({ error: e.message });
  }
};

// 4. GET /weekly-reports
exports.getWeeklyReports = async (req, res) => {
  try {
    const reports = await WeeklyReport.find({ tenantId: req.tenant.id })
      .populate('batchId', 'batchName section')
      .populate('generatedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. POST /weekly-reports/generate
exports.generateWeeklyReport = async (req, res) => {
  try {
    const { batchId, weekStartDate, weekEndDate } = req.body;
    if (!batchId || !weekStartDate || !weekEndDate) {
      return res.status(400).json({ error: "Missing parameters: batchId, weekStartDate, and weekEndDate are required" });
    }

    const start = new Date(weekStartDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(weekEndDate);
    end.setHours(23, 59, 59, 999);

    // 1. Fetch all students in batch
    const batch = await Batch.findById(batchId).populate('students');
    if (!batch) return res.status(404).json({ error: "Batch not found" });
    const allStudents = batch.students || [];

    // 2. Fetch all attendance records in this period
    const attendanceRecords = await Attendance.find({
      tenantId: req.tenant.id,
      batchId,
      date: { $gte: start, $lte: end }
    });

    const totalLectures = attendanceRecords.length;

    // Calculate present and absent counts per student
    const studentStats = {};
    allStudents.forEach(student => {
      studentStats[student._id.toString()] = {
        studentId: student._id,
        name: student.name,
        rollNo: student.username || 'N/A',
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        leaveCount: 0,
        totalClasses: totalLectures
      };
    });

    attendanceRecords.forEach(record => {
      record.records.forEach(r => {
        const studentIdStr = r.studentId.toString();
        if (studentStats[studentIdStr]) {
          if (r.status === 'Present') studentStats[studentIdStr].presentCount++;
          else if (r.status === 'Absent') studentStats[studentIdStr].absentCount++;
          else if (r.status === 'Late') studentStats[studentIdStr].lateCount++;
          else if (r.status === 'Leave') studentStats[studentIdStr].leaveCount++;
        }
      });
    });

    const studentReport = Object.values(studentStats).map(stat => {
      const attended = stat.presentCount + stat.lateCount;
      const percentage = stat.totalClasses > 0 ? parseFloat(((attended / stat.totalClasses) * 100).toFixed(2)) : 100.00;
      return {
        ...stat,
        attendedCount: attended,
        percentage
      };
    });

    // Save report document
    const report = new WeeklyReport({
      tenantId: req.tenant.id,
      batchId,
      weekStartDate: start,
      weekEndDate: end,
      generatedBy: req.user.id,
      status: 'Pending'
    });
    await report.save();

    res.json({
      reportId: report._id,
      batchName: batch.batchName,
      weekStartDate: start,
      weekEndDate: end,
      totalClassesHeld: totalLectures,
      studentStats: studentReport
    });

  } catch (error) {
    console.error("Generate Weekly Report Error:", error);
    res.status(500).json({ error: error.message });
  }
};
