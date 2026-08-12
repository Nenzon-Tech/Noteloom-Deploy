const express = require('express');
const router = express.Router();

// Import Models
const User = require('../models/User'); 
const CollegeAdminRequest = require('../models/CollegeAdminRequest');
const FacultyProfile = require('../models/FacultyProfile');
const StudentProfile = require('../models/StudentProfile');
const AdminProfile = require('../models/AdminProfile'); // 🟢 ADDED THIS IMPORT
const Membership = require('../models/Membership'); 
const Tenant = require('../models/Tenant');
const { uploadCloud } = require('../config/cloudinary');

// -----------------------------------------------------------
// 0. College Settings Routes (Global College Name & Logo)
// -----------------------------------------------------------

// GET College Settings
router.get('/settings', async (req, res) => {
  try {
    if (!req.tenant || !req.tenant.id) {
      return res.status(401).json({ error: 'Tenant context missing' });
    }
    if (req.role !== 'college_admin') {
      return res.status(403).json({ error: 'Access denied: College Admin role required' });
    }

    const tenant = await Tenant.findById(req.tenant.id).select('name logoUrl collegeCode location category subdomain type');
    if (!tenant) {
      return res.status(404).json({ error: 'College tenant not found' });
    }

    res.json(tenant);
  } catch (error) {
    console.error('Fetch College Settings Error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// UPDATE College Settings (Globally updates College Name & Logo across all layers)
router.patch('/settings', (req, res, next) => {
  uploadCloud.single('logo')(req, res, (err) => {
    if (err) {
      // If multer/cloudinary upload error, handle gracefully
      console.warn('Multer/Cloudinary upload warning:', err.message);
    }
    next();
  });
}, async (req, res) => {
  try {
    // 🔒 SECURITY CHECK 1: Require Tenant Context & RBAC (College Admin Role)
    if (!req.tenant || !req.tenant.id) {
      return res.status(401).json({ error: 'Tenant context missing' });
    }
    if (req.role !== 'college_admin') {
      return res.status(403).json({ error: 'Access denied: Only College Admin can modify college settings' });
    }

    // 🔒 SECURITY CHECK 2: Prevent IDOR (Always force session tenant ID, ignore body/param tenantId)
    const tenantId = req.tenant.id;

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: 'College tenant not found' });
    }

    const { name, logoUrl } = req.body;
    const updateFields = {};

    // 🔒 SECURITY CHECK 3: Sanitize & Validate College Name (Anti-XSS, Length checks, NoSQL injection)
    if (name !== undefined) {
      if (typeof name !== 'string') {
        return res.status(400).json({ error: 'College name must be a valid text string' });
      }
      const trimmedName = name.trim();
      if (trimmedName.length < 3 || trimmedName.length > 100) {
        return res.status(400).json({ error: 'College name must be between 3 and 100 characters long' });
      }
      if (/<script|javascript:|data:/i.test(trimmedName)) {
        return res.status(400).json({ error: 'Invalid characters detected in college name' });
      }

      // Check for name collisions with other tenants
      const existingName = await Tenant.findOne({ name: trimmedName, _id: { $ne: tenantId } });
      if (existingName) {
        return res.status(400).json({ error: 'A college with this name already exists' });
      }

      updateFields.name = trimmedName;
    }

    // 🔒 SECURITY CHECK 4: Validate Uploaded File or URL (Anti-SVG XSS, Safe MIME Types)
    if (req.file) {
      const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!allowedMimes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: 'Invalid logo format. Only PNG, JPEG, JPG, and WEBP image formats are allowed (SVG disallowed for security).' });
      }
      updateFields.logoUrl = req.file.path || req.file.secure_url;
    } else if (logoUrl) {
      if (typeof logoUrl !== 'string') {
        return res.status(400).json({ error: 'Logo URL must be a valid string' });
      }
      const trimmedUrl = logoUrl.trim();
      if (/^(javascript:|data:|vbscript:)/i.test(trimmedUrl)) {
        return res.status(400).json({ error: 'Security alert: Unsafe image protocol detected in logo URL' });
      }
      if (/\.svg($|\?)/i.test(trimmedUrl)) {
        return res.status(400).json({ error: 'SVG images are disallowed for security reasons. Please use PNG, JPG or WEBP.' });
      }
      updateFields.logoUrl = trimmedUrl;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'No valid settings fields provided for update' });
    }

    // 🟢 1. GLOBAL UPDATE: Update Tenant Record
    const updatedTenant = await Tenant.findByIdAndUpdate(
      tenantId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    // 🟢 2. GLOBAL PROPAGATION: Update all User documents associated with this college
    if (updateFields.name) {
      const memberships = await Membership.find({ tenantId });
      const userIds = memberships.map(m => m.userId);
      await User.updateMany(
        { _id: { $in: userIds } },
        { $set: { college: updateFields.name } }
      );
    }

    res.json({
      success: true,
      message: 'College settings updated globally across all systems',
      tenant: {
        id: updatedTenant._id,
        name: updatedTenant.name,
        logoUrl: updatedTenant.logoUrl,
        collegeCode: updatedTenant.collegeCode
      }
    });

  } catch (error) {
    console.error('Update College Settings Error:', error);
    res.status(500).json({ error: 'Failed to update college settings' });
  }
}); 

// -----------------------------------------------------------
// 1. Get All Requests (Existing)
// -----------------------------------------------------------
router.get('/requests', async (req, res) => {
  try {
    const requests = await CollegeAdminRequest.find();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// -----------------------------------------------------------
// 2. Approve or Reject Request (Existing)
// -----------------------------------------------------------
router.post('/requests/:id/:action', async (req, res) => {
  try {
    const { id, action } = req.params;
    const request = await CollegeAdminRequest.findById(id);

    if (!request) return res.status(404).json({ error: 'Request not found' });

    if (action === 'approve') {
      await User.findByIdAndUpdate(request.userId, { role: request.role });

      if (request.role === 'faculty') {
        await FacultyProfile.create({
          userId: request.userId,
          name: request.name,
          email: request.email,
          department: request.department
        });
      } else if (request.role === 'student') {
        await StudentProfile.create({
          userId: request.userId,
          name: request.name,
          email: request.email,
          department: request.department,
          year: request.year
        });
      }
    }
    await CollegeAdminRequest.findByIdAndDelete(id);
    res.json({ message: `Request ${action}ed successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// -----------------------------------------------------------
// 3. User Management Routes (✅ UPDATED TO FIX IDS)
// -----------------------------------------------------------

// GET Users by Role (e.g., /users/student)
router.get('/users/:role', async (req, res) => {
  try {
    const { role } = req.params;
    
    // 1. Find memberships for this specific college (tenant) and role
    const memberships = await Membership.find({
      tenantId: req.tenant.id,
      role: role
    }).populate('userId'); // Get user details from User model

    // 2. Extract User IDs to bulk-fetch profiles
    const validMemberships = memberships.filter(m => m.userId); // Filter out deleted users
    const userIds = validMemberships.map(m => m.userId._id);

    // 3. Fetch the corresponding Profiles to get the real IDs (UID/RollNo)
    let profiles = [];
    
    // 🟢 FIX: Added logic for 'college_admin'
    if (role === 'student') {
        profiles = await StudentProfile.find({ userId: { $in: userIds } });
    } else if (role === 'faculty') {
        profiles = await FacultyProfile.find({ userId: { $in: userIds } });
    } else if (role === 'college_admin') {
        profiles = await AdminProfile.find({ userId: { $in: userIds } });
    }

    // 4. Map the data merging User + Profile info
    const users = validMemberships.map(m => {
        const u = m.userId.toObject();
        
        // Find matching profile
        const profile = profiles.find(p => p.userId.toString() === u._id.toString());
        
        // DETERMINE THE CORRECT ID TO SHOW
        // Check Profile fields first (uid, rollNo, employeeId), fall back to User.noteloomId
        let displayUid = 'N/A';
        if (profile) {
            displayUid = profile.uid || profile.rollNo || profile.employeeId || profile.enrollmentId || 'N/A';
        } else if (u.noteloomId) {
            displayUid = u.noteloomId;
        }

        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          uid: displayUid,  // ✅ Now sends the actual ID from the profile
          status: m.status,
          createdAt: u.createdAt,
          deletionScheduledAt: u.deletionScheduledAt
        };
      });

    res.json(users);
  } catch (error) {
    console.error("Fetch Users Error:", error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// TOGGLE STATUS (Enable/Disable Account)
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    // Update Membership status specific to this college
    await Membership.findOneAndUpdate(
      { userId: req.params.id, tenantId: req.tenant.id },
      { status: status }
    );
    res.json({ message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// DELETE USER (Schedule Deletion)
router.delete('/users/:id', async (req, res) => {
  try {
    // 1. Schedule soft delete on User
    await User.findByIdAndUpdate(req.params.id, { 
        deletionScheduledAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 Days
    });
    
    // 2. Suspend access immediately
    await Membership.findOneAndUpdate(
      { userId: req.params.id, tenantId: req.tenant.id },
      { status: 'suspended' }
    );
    
    res.json({ message: 'User scheduled for deletion' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;