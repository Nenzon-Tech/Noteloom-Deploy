const express = require('express');
const router = express.Router();
const ProjectSubmission = require('../models/ProjectSubmission');
const StudentProfile = require('../models/StudentProfile');
const { setTenantContext } = require('../middleware/authMiddleware');
const { uploadCloud, cloudinary } = require('../config/cloudinary');

router.use(setTenantContext);

const derivePublicId = (url = '') => {
  const m = url.match(/\/(image|raw|video)\/upload\/(?:v\d+\/)?(.*)$/);
  if (!m) return '';
  return m[2].replace(/\.[a-zA-Z0-9]+$/, '');
};

const REVIEWER_ROLES = ['faculty', 'college_admin'];

// Student submits their final year project
router.post('/', uploadCloud.any(), async (req, res) => {
  try {
    if (req.role !== 'student') return res.status(403).json({ error: 'Only students can submit projects' });

    const { projectType, projectTitle, domain, guideName, guideDepartment, teamDetails, synopsis,
      status, expectedCompletion, demoVideo, sourceCodeLink, liveDeploymentUrl, apiDocumentation,
      setupInstructions, modelLinks, bom, firmwareCode, department } = req.body;

    if (!projectType || !['Software', 'Hardware'].includes(projectType)) {
      return res.status(400).json({ error: 'Please select a valid project type (Software or Hardware)' });
    }
    if (!projectTitle || !String(projectTitle).trim()) {
      return res.status(400).json({ error: 'Project title is required' });
    }

    const profile = await StudentProfile.findOne({ userId: req.user.id, tenantId: req.tenant.id });

    let attachments = [];
    if (req.files) {
      attachments = req.files.map(file => {
        const mime = file.mimetype || '';
        const isPdf = mime === 'application/pdf' || /\.pdf$/i.test(file.originalname || '');
        return {
          field: file.fieldname,
          originalName: file.originalname,
          fileName: file.filename,
          fileUrl: file.path,
          publicId: derivePublicId(file.path),
          fileType: isPdf ? 'pdf' : (mime.startsWith('image/') ? 'image' : (mime.startsWith('video/') ? 'video' : 'document')),
          mimeType: mime,
          size: file.size
        };
      });
    }

    const submission = new ProjectSubmission({
      tenantId: req.tenant.id,
      studentId: req.user.id,
      studentName: req.user.name,
      studentEmail: req.user.email,
      rollNo: profile ? profile.rollNo : undefined,
      department: department || (profile ? profile.stream : undefined),
      batchId: profile ? profile.batchId : undefined,
      projectType,
      projectTitle: String(projectTitle).trim(),
      domain,
      guideName,
      guideDepartment,
      teamDetails,
      synopsis,
      status: status || 'Idea',
      expectedCompletion,
      demoVideo,
      sourceCodeLink,
      liveDeploymentUrl,
      apiDocumentation,
      setupInstructions,
      modelLinks,
      bom,
      firmwareCode,
      attachments
    });

    await submission.save();
    res.json(submission);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Student's own submissions
router.get('/mine', async (req, res) => {
  try {
    if (req.role !== 'student') return res.status(403).json({ error: 'Only students can view their own submissions' });
    const submissions = await ProjectSubmission.find({ tenantId: req.tenant.id, studentId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Faculty/Admin view all submissions for the tenant
router.get('/', async (req, res) => {
  try {
    if (!REVIEWER_ROLES.includes(req.role)) return res.status(403).json({ error: 'Access denied' });
    const query = { tenantId: req.tenant.id };
    const { reviewStatus, department, search } = req.query;
    if (reviewStatus && reviewStatus !== 'All') query.reviewStatus = reviewStatus;
    if (department && department !== 'All') query.department = department;
    if (search && search.trim()) {
      const rx = new RegExp(search.trim(), 'i');
      query.$or = [
        { projectTitle: rx },
        { studentName: rx },
        { studentEmail: rx },
        { rollNo: rx }
      ];
    }
    const submissions = await ProjectSubmission.find(query).sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Review a submission (faculty/admin)
router.patch('/:id/review', async (req, res) => {
  try {
    if (!REVIEWER_ROLES.includes(req.role)) return res.status(403).json({ error: 'Access denied' });
    const { reviewStatus, reviewComment } = req.body;
    if (!['pending', 'approved', 'rejected', 'revision'].includes(reviewStatus)) {
      return res.status(400).json({ error: 'Invalid review status' });
    }
    const submission = await ProjectSubmission.findOne({ _id: req.params.id, tenantId: req.tenant.id });
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    submission.reviewStatus = reviewStatus;
    submission.reviewerId = req.user.id;
    submission.reviewerName = req.user.name;
    submission.reviewComment = reviewComment || '';
    submission.reviewedAt = new Date();
    await submission.save();
    res.json(submission);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Delete a submission (owner student, faculty, admin)
router.delete('/:id', async (req, res) => {
  try {
    const submission = await ProjectSubmission.findOne({ _id: req.params.id, tenantId: req.tenant.id });
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    const isOwner = submission.studentId.toString() === req.user.id.toString();
    if (!REVIEWER_ROLES.includes(req.role) && !isOwner) {
      return res.status(403).json({ error: 'Unauthorized to delete this submission' });
    }

    for (const att of (submission.attachments || [])) {
      if (att.publicId) {
        try { await cloudinary.uploader.destroy(att.publicId); } catch (e) { /* ignore */ }
      }
    }

    await ProjectSubmission.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project submission deleted successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Proxy-download an attachment (Cloudinary ACL blocks direct PDF delivery)
router.get('/:id/attachments/:index/download', async (req, res) => {
  try {
    const submission = await ProjectSubmission.findOne({ _id: req.params.id, tenantId: req.tenant.id });
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    const index = parseInt(req.params.index, 10);
    const att = Array.isArray(submission.attachments) ? submission.attachments[index] : null;
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
    console.error('Project attachment download failed:', e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
