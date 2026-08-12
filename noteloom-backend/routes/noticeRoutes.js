const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Notice = require('../models/Notice');
const StudentProfile = require('../models/StudentProfile');
const Batch = require('../models/Batch');
const { setTenantContext } = require('../middleware/authMiddleware');
const { uploadCloud, cloudinary } = require('../config/cloudinary');

router.use(setTenantContext);

const derivePublicId = (url = '') => {
  const m = url.match(/\/(image|raw|video)\/upload\/(?:v\d+\/)?(.*)$/);
  if (!m) return '';
  return m[2].replace(/\.[a-zA-Z0-9]+$/, '');
};

const toObjectIds = (input) => {
  let arr = [];
  if (Array.isArray(input)) arr = input;
  else if (typeof input === 'string' && input.trim()) arr = [input.trim()];
  return arr
    .map(id => {
      try { return new mongoose.Types.ObjectId(id); } catch (e) { return null; }
    })
    .filter(Boolean);
};

// Notices that target no specific batch (or are legacy / department-wide) are visible to everyone.
const batchScopeQuery = (batchIds) => ({
  $or: [
    { targetBatches: { $exists: false } },
    { targetBatches: { $size: 0 } },
    { targetBatches: { $in: batchIds } }
  ]
});

router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { department, category } = req.query;
    if (!['staff', 'departmental'].includes(type)) return res.status(400).json({ error: 'Invalid notice type' });

    const query = { tenantId: req.tenant.id, type };
    if (department) query.department = department;
    if (category && category !== 'All') query.category = category;

    if (type === 'departmental') {
      if (req.role === 'student') {
        const profile = await StudentProfile.findOne({ userId: req.user.id, tenantId: req.tenant.id });
        const batchId = profile && profile.batchId;
        if (batchId) query.$or = batchScopeQuery([batchId]).$or;
        else query.$or = batchScopeQuery([]).$or;
      } else if (req.role === 'faculty') {
        const batches = await Batch.find({ tenantId: req.tenant.id, faculty: req.user.id }).select('_id');
        const ids = batches.map(b => b._id);
        query.$or = batchScopeQuery(ids).$or;
      }
      // college_admin sees all departmental notices
    }

    const notices = await Notice.find(query).sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// POST — create a notice (faculty/college_admin for staff+departmental; students blocked)
router.post('/', uploadCloud.array('files', 10), async (req, res) => {
  try {
    const { type, title, content, department, category, targetBatches, videoConfig } = req.body;
    if (!['staff', 'departmental'].includes(type)) return res.status(400).json({ error: 'Invalid notice type' });
    if (req.role === 'student') return res.status(403).json({ error: 'Students cannot post notices' });
    if (type === 'staff' && req.role !== 'college_admin') return res.status(403).json({ error: 'Only admins can post staff notices' });

    const targetIds = toObjectIds(targetBatches);

    if (req.role === 'faculty' && type === 'departmental' && targetIds.length) {
      const owned = await Batch.find({
        tenantId: req.tenant.id,
        faculty: req.user.id,
        _id: { $in: targetIds }
      }).select('_id');
      const ownedSet = new Set(owned.map(b => b._id.toString()));
      const invalid = targetIds.filter(id => !ownedSet.has(id.toString()));
      if (invalid.length) return res.status(403).json({ error: 'You can only post to batches assigned to you' });
    }

    let attachments = [];
    if (req.files) {
      attachments = req.files.map(file => {
        const mime = file.mimetype || '';
        const isPdf = mime === 'application/pdf' || /\.pdf$/i.test(file.originalname || '');
        return {
          originalName: file.originalname,
          fileName: file.filename,
          fileUrl: file.path,
          publicId: derivePublicId(file.path),
          fileType: isPdf ? 'pdf' : (mime.startsWith('image/') ? 'image' : (mime.startsWith('video/') ? 'video' : 'document')),
          mimeType: mime,
          size: file.size,
          videoConfig: { playerType: (videoConfig && typeof videoConfig === 'object' ? videoConfig.playerType : videoConfig) || 'mini' }
        };
      });
    }

    const newNotice = new Notice({
      tenantId: req.tenant.id,
      posterId: req.user.id,
      posterName: req.user.name,
      posterRole: req.role,
      type,
      title,
      content,
      department,
      category: category || 'Announcement',
      targetBatches: targetIds,
      attachments
    });
    await newNotice.save();
    res.json(newNotice);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Toggle a like/reaction
router.patch('/:id/react', async (req, res) => {
  try {
    const notice = await Notice.findOne({ _id: req.params.id, tenantId: req.tenant.id });
    if (!notice) return res.status(404).json({ error: 'Notice not found' });
    const idx = (notice.reactions || []).findIndex(r => r.userId && r.userId.toString() === req.user.id.toString());
    if (idx > -1) notice.reactions.splice(idx, 1);
    else notice.reactions.push({ userId: req.user.id, userName: req.user.name });
    await notice.save();
    res.json(notice);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Add a comment
router.post('/:id/comments', async (req, res) => {
  try {
    const notice = await Notice.findOne({ _id: req.params.id, tenantId: req.tenant.id });
    if (!notice) return res.status(404).json({ error: 'Notice not found' });
    const text = (req.body.text || '').trim();
    if (!text) return res.status(400).json({ error: 'Comment text is required' });
    notice.comments.push({
      userId: req.user.id,
      userName: req.user.name,
      text,
      parentId: req.body.parentId || null
    });
    notice.updatedAt = Date.now();
    await notice.save();
    res.json(notice);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Delete a notice
router.delete('/:id', async (req, res) => {
  try {
    const notice = await Notice.findOne({ _id: req.params.id, tenantId: req.tenant.id });
    if (!notice) return res.status(404).json({ error: 'Notice not found' });

    if (!['college_admin', 'it_admin'].includes(req.role) && notice.posterId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Unauthorized to delete this notice' });
    }

    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notice deleted successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Stream a notice attachment via the authenticated Cloudinary Admin download API.
// (Direct CDN delivery of PDFs is blocked by the account's delivery ACL, so we proxy.)
router.get('/:id/attachments/:index/download', async (req, res) => {
  try {
    const notice = await Notice.findOne({ _id: req.params.id, tenantId: req.tenant.id });
    if (!notice) return res.status(404).json({ error: 'Notice not found' });
    const index = parseInt(req.params.index, 10);
    const att = Array.isArray(notice.attachments) ? notice.attachments[index] : null;
    if (!att) return res.status(404).json({ error: 'Attachment not found' });

    const url = att.fileUrl || '';
    const publicId = att.publicId || derivePublicId(url);
    if (!publicId) return res.status(404).json({ error: 'Attachment has no stored file' });

    const resourceType = url.includes('/video/') ? 'video' : url.includes('/raw/') ? 'raw' : 'image';
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

    const name = att.originalName || att.fileName || `attachment-${index + 1}.pdf`;
    const ext = name.split('.').pop().toLowerCase();
    const mime = ext === 'pdf' ? 'application/pdf'
      : ext === 'png' ? 'image/png'
      : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
      : (att.mimeType || 'application/octet-stream');

    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', `inline; filename="${name.replace(/"/g, '')}"`);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'private, max-age=300');
    res.send(buffer);
  } catch (e) {
    console.error('Notice attachment download failed:', e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
