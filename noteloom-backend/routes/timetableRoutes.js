const express = require('express');
const router = express.Router();
const { CalendarEvent, OrgCalendarEvent, ClassRoutine, LessonLog, ClassSchedule } = require('../models/TimetableModels');
const { setTenantContext } = require('../middleware/authMiddleware');
const { uploadCloud, cloudinary } = require('../config/cloudinary');

router.use(setTenantContext);

// --- CALENDAR ---
router.get('/calendar/events', async (req, res) => {
  try { const events = await CalendarEvent.find({ userId: req.user.id }).sort({ date: 1 }); res.json(events); }
  catch(e) { res.status(500).json({ error: e.message }); }
});
router.post('/calendar/events', async (req, res) => {
  try { const event = new CalendarEvent({ ...req.body, userId: req.user.id }); await event.save(); res.json(event); }
  catch(e) { res.status(500).json({ error: e.message }); }
});
router.delete('/calendar/events/:id', async (req, res) => {
  try { await CalendarEvent.findOneAndDelete({ _id: req.params.id, userId: req.user.id }); res.json({ success: true }); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

// --- ORGANIZATION CALENDAR (tenant-wide, shared by all roles) ---
router.get('/calendar/org', async (req, res) => {
  try {
    const { year, month, type } = req.query;
    const query = { tenantId: req.tenant.id };
    if (year && month) {
      const m = Number(month);
      const start = `${year}-${String(m).padStart(2, '0')}-01`;
      const daysInMonth = new Date(Number(year), m, 0).getDate();
      const end = `${year}-${String(m).padStart(2, '0')}-${daysInMonth}`;
      query.date = { $gte: start, $lte: end };
    }
    if (type && type !== 'ALL') query.type = type;
    const events = await OrgCalendarEvent.find(query).sort({ date: 1 });
    res.json(events);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/calendar/org', uploadCloud.array('attachments', 5), async (req, res) => {
  try {
    if (req.role === 'student') return res.status(403).json({ error: 'Only faculty and admins can publish events' });
    const title = String(req.body.title || '').trim();
    const date = String(req.body.date || '').trim();
    if (!title || !date) return res.status(400).json({ error: 'Title and date are required' });

    const attachments = (req.files || []).map(f => ({
      name: f.originalname,
      publicId: f.filename,
      url: f.path || f.secure_url,
      size: f.size,
      uploadedBy: req.user.name
    }));

    const event = new OrgCalendarEvent({
      tenantId: req.tenant.id,
      title: title.slice(0, 150),
      date,
      time: String(req.body.time || 'All Day').trim() || 'All Day',
      type: String(req.body.type || 'EVENT').trim() || 'EVENT',
      location: String(req.body.location || '').trim(),
      description: String(req.body.description || '').trim(),
      attachments,
      createdBy: { userId: req.user.id, name: req.user.name, role: req.role }
    });
    await event.save();
    res.json(event);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/calendar/org/:id', uploadCloud.array('attachments', 5), async (req, res) => {
  try {
    if (req.role === 'student') return res.status(403).json({ error: 'Only faculty and admins can edit events' });
    const event = await OrgCalendarEvent.findOne({ _id: req.params.id, tenantId: req.tenant.id });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    const isAdmin = req.role === 'college_admin';
    const isOwner = event.createdBy?.userId?.toString() === req.user.id.toString();
    if (!isAdmin && !isOwner) return res.status(403).json({ error: 'Not authorized to edit this event' });

    const { title, date, time, type, location, description } = req.body;
    if (title !== undefined) event.title = String(title).trim().slice(0, 150) || event.title;
    if (date !== undefined) event.date = String(date).trim() || event.date;
    if (time !== undefined) event.time = String(time).trim();
    if (type !== undefined) event.type = String(type).trim();
    if (location !== undefined) event.location = String(location).trim();
    if (description !== undefined) event.description = String(description).trim();

    // Add newly uploaded attachments (supports multipart + JSON)
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(f => ({
        name: f.originalname,
        publicId: f.filename,
        url: f.path || f.secure_url,
        size: f.size,
        uploadedBy: req.user.name
      }));
      event.attachments = [...(event.attachments || []), ...newAttachments];
    }

    // Remove attachments by index (removeAttachments can be a string or array in multipart)
    let removeIdx = req.body.removeAttachments;
    if (removeIdx !== undefined) {
      if (typeof removeIdx === 'string') removeIdx = [removeIdx];
      if (Array.isArray(removeIdx)) {
        const indices = removeIdx.map(i => Number(i)).filter(n => Number.isInteger(n));
        event.attachments = (event.attachments || []).filter((_, i) => !indices.includes(i));
      }
    }

    event.updatedAt = Date.now();
    await event.save();
    res.json(event);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Stream an event attachment via the authenticated Cloudinary Admin download API.
// (Direct CDN delivery of PDFs is blocked by the account's delivery ACL, so we proxy.)
const derivePublicId = (url = '') => {
  const m = url.match(/\/(image|raw|video)\/upload\/(?:v\d+\/)?(.*)$/);
  if (!m) return '';
  return m[2].replace(/\.[a-zA-Z0-9]+$/, '');
};

router.get('/calendar/org/:id/attachments/:index/download', async (req, res) => {
  try {
    const event = await OrgCalendarEvent.findOne({ _id: req.params.id, tenantId: req.tenant.id });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    const index = parseInt(req.params.index, 10);
    const att = Array.isArray(event.attachments) ? event.attachments[index] : null;
    if (!att) return res.status(404).json({ error: 'Attachment not found' });

    const publicId = att.publicId || derivePublicId(att.url);
    if (!publicId) return res.status(404).json({ error: 'Attachment has no stored file' });

    const resourceType = (att.url || '').includes('/video/') ? 'video' : (att.url || '').includes('/raw/') ? 'raw' : 'image';
    const timestamp = Math.floor(Date.now() / 1000);
    const params = { public_id: publicId, type: 'upload', timestamp };
    const signature = cloudinary.utils.api_sign_request(params, cloudinary.config().api_secret);
    const downloadUrl =
      `https://api.cloudinary.com/v1_1/${cloudinary.config().cloud_name}/${resourceType}/download` +
      `?public_id=${encodeURIComponent(publicId)}&type=upload&timestamp=${timestamp}` +
      `&signature=${signature}&api_key=${cloudinary.config().api_key}`;

    const upstream = await fetch(downloadUrl);
    if (!upstream.ok) return res.status(502).json({ error: 'Failed to retrieve the file from storage' });
    const buffer = Buffer.from(await upstream.arrayBuffer());

    const ext = (att.name || '').split('.').pop().toLowerCase();
    const mime = ext === 'pdf' ? 'application/pdf'
      : ext === 'png' ? 'image/png'
      : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
      : 'application/octet-stream';
    const filename = att.name || `attachment.${ext || 'pdf'}`;

    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', `inline; filename="${filename.replace(/"/g, '')}"`);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'private, max-age=300');
    res.send(buffer);
  } catch (e) {
    console.error('Org calendar attachment download failed:', e);
    res.status(500).json({ error: e.message });
  }
});

router.delete('/calendar/org/:id', async (req, res) => {
  try {
    if (req.role === 'student') return res.status(403).json({ error: 'Only faculty and admins can delete events' });
    const event = await OrgCalendarEvent.findOne({ _id: req.params.id, tenantId: req.tenant.id });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    const isAdmin = req.role === 'college_admin';
    const isOwner = event.createdBy?.userId?.toString() === req.user.id.toString();
    if (!isAdmin && !isOwner) return res.status(403).json({ error: 'Not authorized to delete this event' });
    await event.deleteOne();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- ROUTINES ---
router.get('/routine/batch/:batchId', async (req, res) => {
  try { const routines = await ClassRoutine.find({ batchId: req.params.batchId }); res.json(routines); }
  catch(e) { res.status(500).json({ error: e.message }); }
});
router.post('/routine/batch/:batchId', async (req, res) => {
  if (req.role === 'student') return res.status(403).json({ error: "Unauthorized" });
  try {
    const routine = await ClassRoutine.findOneAndUpdate(
      { batchId: req.params.batchId, dayOfWeek: req.body.dayOfWeek },
      { periods: req.body.periods, tenantId: req.tenant.id },
      { new: true, upsert: true }
    );
    res.json(routine);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// --- LESSON LOGS ---
router.get('/lessons', async (req, res) => {
  try {
    const { startDate, endDate, batchId } = req.query;
    let query = { tenantId: req.tenant.id };
    if (batchId) query.batchId = batchId;
    if (startDate && endDate) query.date = { $gte: startDate, $lte: endDate };
    
    const logs = await LessonLog.find(query).populate('batchId', 'batchName section').populate('facultyId', 'name').sort({ date: 1 });
    res.json(logs);
  } catch(e) { res.status(500).json({ error: e.message }); }
});
router.post('/lessons', async (req, res) => {
  if (req.role !== 'faculty') return res.status(403).json({ error: "Only faculty" });
  try {
    const log = new LessonLog({ ...req.body, facultyId: req.user.id, tenantId: req.tenant.id });
    await log.save();
    res.json(log);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// --- FACULTY SCHEDULE ---
router.get('/faculty/schedule', async (req, res) => {
    try {
      const schedules = await ClassSchedule.find({ facultyId: req.user.id, tenantId: req.tenant.id })
      .populate('batchId').populate('subjectId').sort({ dayOfWeek: 1, startTime: 1 });
      res.json(schedules);
    } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/faculty/schedule', async (req, res) => {
    try {
      const item = new ClassSchedule({ tenantId: req.tenant.id, facultyId: req.user.id, ...req.body });
      await item.save();
      res.json(item);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;