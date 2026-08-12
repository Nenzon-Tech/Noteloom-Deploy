const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Membership = require('../models/Membership');
const AdminProfile = require('../models/AdminProfile');
const GlobalRoleConfig = require('../models/GlobalRoleConfig');
const CollegeRoleConfig = require('../models/CollegeRoleConfig');

const BUILT_IN_ROLES = [
  { key: 'super_admin', label: 'Super Admin', description: 'Full access — bypasses all role restrictions', isBuiltIn: true, isSeeded: true, assignmentType: 'default_assignment' },
  { key: 'accounts', label: 'Accounts & Finance', description: 'Fee management, payment records, financial reports', isBuiltIn: true, isSeeded: true, assignmentType: 'default_assignment' },
  { key: 'coe', label: 'COE / Exam Cell', description: 'Exam forms, admit cards, results, question bank', isBuiltIn: true, isSeeded: true, assignmentType: 'default_assignment' },
  { key: 'academic', label: 'Academic Affairs', description: 'Departments, batches, timetable, attendance', isBuiltIn: true, isSeeded: true, assignmentType: 'default_assignment' },
  { key: 'library', label: 'Library Management', description: 'Physical books, digital library approvals', isBuiltIn: true, isSeeded: true, assignmentType: 'default_assignment' },
  { key: 'hr', label: 'HR / Leave Manager', description: 'Staff leave management and approval', isBuiltIn: true, isSeeded: true, assignmentType: 'default_assignment' },
  { key: 'lms', label: 'LMS / Content', description: 'Class modules, lesson content, curriculum', isBuiltIn: true, isSeeded: true, assignmentType: 'default_assignment' }
];

// Helper to get available roles for a college
const fetchAvailableRolesForTenant = async (tenantId) => {
  const globalRoles = await GlobalRoleConfig.find({
    isActive: true,
    $or: [
      { restrictToTenants: { $size: 0 } },
      { restrictToTenants: tenantId }
    ]
  });

  const collegeConfig = await CollegeRoleConfig.findOne({ tenantId });
  const collegeCustomRoles = collegeConfig ? (collegeConfig.collegeCustomRoles || []) : [];
  const customLabels = collegeConfig?.customRoleLabels ? Object.fromEntries(collegeConfig.customRoleLabels) : {};

  const allRoles = [
    ...BUILT_IN_ROLES,
    ...globalRoles.map(r => ({
      key: r.key,
      label: r.label,
      description: r.description,
      isBuiltIn: r.isBuiltIn || false,
      isSeeded: r.isSeeded || false,
      isGlobal: true,
      assignmentType: (r.restrictToTenants && r.restrictToTenants.length > 0) ? 'custom_assignment' : (r.assignmentType || 'default_assignment'),
      defaultPermissions: r.defaultPermissions
    })),
    ...collegeCustomRoles.map(r => ({
      key: r.key,
      label: r.label,
      description: r.description,
      isBuiltIn: false,
      isSeeded: false,
      isGlobal: false,
      assignmentType: r.assignmentType || 'custom_assignment',
      defaultPermissions: r.defaultPermissions
    }))
  ];

  return allRoles.map(r => ({
    ...r,
    label: customLabels[r.key] || r.label
  }));
};

// GET /api/college-admin/my-roles
exports.getMyRoles = async (req, res) => {
  try {
    const tenantId = req.tenant.id;
    const adminRoles = req.adminRoles || ['super_admin'];
    const isSuperAdmin = req.isSuperAdmin || false;

    let collegeConfig = await CollegeRoleConfig.findOne({ tenantId });
    const roleTabMap = collegeConfig?.roleTabConfig ? Object.fromEntries(collegeConfig.roleTabConfig) : {};

    res.json({
      adminRoles,
      isSuperAdmin,
      roleTabMap,
      isLocked: collegeConfig?.isLocked || false,
      lockedAt: collegeConfig?.lockedAt || null
    });
  } catch (error) {
    console.error('Get my roles error:', error);
    res.status(500).json({ error: 'Failed to fetch admin roles' });
  }
};

// GET /api/college-admin/available-roles
exports.getAvailableRoles = async (req, res) => {
  try {
    const roles = await fetchAvailableRolesForTenant(req.tenant.id);
    res.json(roles);
  } catch (error) {
    console.error('Get available roles error:', error);
    res.status(500).json({ error: 'Failed to fetch available roles' });
  }
};

// GET /api/college-admin/admin-roles (List all admins for this tenant)
exports.getAdminRolesList = async (req, res) => {
  try {
    const tenantId = req.tenant.id;
    const memberships = await Membership.find({
      tenantId,
      role: 'college_admin'
    }).populate('userId', 'name email createdAt deletionScheduledAt');

    const validMemberships = memberships.filter(m => m.userId);
    const userIds = validMemberships.map(m => m.userId._id);

    const adminProfiles = await AdminProfile.find({
      userId: { $in: userIds },
      tenantId
    });

    const admins = validMemberships.map(m => {
      const u = m.userId.toObject();
      const profile = adminProfiles.find(p => p.userId.toString() === u._id.toString());
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        adminRoles: profile && profile.adminRoles && profile.adminRoles.length > 0 ? profile.adminRoles : ['super_admin'],
        assignedAt: profile?.assignedAt,
        status: m.status
      };
    });

    res.json(admins);
  } catch (error) {
    console.error('Get admin roles list error:', error);
    res.status(500).json({ error: 'Failed to fetch college admin accounts' });
  }
};

// POST /api/college-admin/admin-roles (Add or assign college admin)
exports.createOrAssignAdmin = async (req, res) => {
  try {
    const { name, email, password, adminRoles } = req.body;
    const tenantId = req.tenant.id;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const assignedRoles = Array.isArray(adminRoles) && adminRoles.length > 0 ? adminRoles : ['super_admin'];

    let user = await User.findOne({ email });
    if (!user) {
      if (!name || !password) {
        return res.status(400).json({ error: 'Name and password are required for new user creation' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'college_admin'
      });
    } else {
      user.role = 'college_admin';
      await user.save();
    }

    await Membership.findOneAndUpdate(
      { userId: user._id, tenantId },
      { role: 'college_admin', status: 'active' },
      { upsert: true, new: true }
    );

    const profile = await AdminProfile.findOneAndUpdate(
      { userId: user._id, tenantId },
      {
        adminRoles: assignedRoles,
        assignedBy: req.user.id,
        assignedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      message: 'College admin assigned successfully',
      admin: {
        _id: user._id,
        name: user.name,
        email: user.email,
        adminRoles: profile.adminRoles
      }
    });
  } catch (error) {
    console.error('Create/assign admin error:', error);
    res.status(500).json({ error: 'Failed to assign college admin' });
  }
};

// PATCH /api/college-admin/admin-roles/:userId (Update assigned roles)
exports.updateAdminRoles = async (req, res) => {
  try {
    const { userId } = req.params;
    const { adminRoles } = req.body;
    const tenantId = req.tenant.id;

    if (!Array.isArray(adminRoles) || adminRoles.length === 0) {
      return res.status(400).json({ error: 'At least one role must be assigned' });
    }

    const profile = await AdminProfile.findOneAndUpdate(
      { userId, tenantId },
      {
        adminRoles,
        assignedBy: req.user.id,
        assignedAt: new Date()
      },
      { new: true, upsert: true }
    );

    res.json({
      message: 'Admin roles updated successfully',
      adminRoles: profile.adminRoles
    });
  } catch (error) {
    console.error('Update admin roles error:', error);
    res.status(500).json({ error: 'Failed to update admin roles' });
  }
};

// DELETE /api/college-admin/admin-roles/:userId (Revoke college admin status)
exports.removeAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const tenantId = req.tenant.id;

    if (userId === req.user.id.toString()) {
      return res.status(400).json({ error: 'You cannot remove your own admin access' });
    }

    await Membership.findOneAndUpdate(
      { userId, tenantId },
      { status: 'suspended' }
    );

    await AdminProfile.deleteOne({ userId, tenantId });

    res.json({ message: 'Admin access revoked successfully' });
  } catch (error) {
    console.error('Remove admin error:', error);
    res.status(500).json({ error: 'Failed to remove admin' });
  }
};

// GET /api/college-admin/role-tab-config
exports.getRoleTabConfig = async (req, res) => {
  try {
    const tenantId = req.tenant.id;
    let config = await CollegeRoleConfig.findOne({ tenantId });
    
    const roleTabMap = config?.roleTabConfig ? Object.fromEntries(config.roleTabConfig) : {};
    
    res.json({
      roleTabConfig: roleTabMap,
      isLocked: config?.isLocked || false,
      lockedBy: config?.lockedBy || null,
      lockedAt: config?.lockedAt || null
    });
  } catch (error) {
    console.error('Get role tab config error:', error);
    res.status(500).json({ error: 'Failed to fetch tab configuration' });
  }
};

// PUT /api/college-admin/role-tab-config
exports.saveRoleTabConfig = async (req, res) => {
  try {
    const tenantId = req.tenant.id;
    const { roleTabConfig } = req.body;

    if (!roleTabConfig || typeof roleTabConfig !== 'object') {
      return res.status(400).json({ error: 'Invalid configuration data format' });
    }

    const config = await CollegeRoleConfig.findOneAndUpdate(
      { tenantId },
      {
        roleTabConfig: new Map(Object.entries(roleTabConfig)),
        updatedBy: req.user.id,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      message: 'Tab configuration saved successfully',
      roleTabConfig: Object.fromEntries(config.roleTabConfig)
    });
  } catch (error) {
    console.error('Save role tab config error:', error);
    res.status(500).json({ error: 'Failed to save tab configuration' });
  }
};

// POST /api/college-admin/role-tab-config/lock
exports.lockConfig = async (req, res) => {
  try {
    const tenantId = req.tenant.id;
    const config = await CollegeRoleConfig.findOneAndUpdate(
      { tenantId },
      {
        isLocked: true,
        lockedBy: req.user.id,
        lockedAt: new Date(),
        updatedBy: req.user.id,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      message: 'Tab configuration locked successfully',
      isLocked: true,
      lockedAt: config.lockedAt
    });
  } catch (error) {
    console.error('Lock config error:', error);
    res.status(500).json({ error: 'Failed to lock configuration' });
  }
};

// POST /api/college-admin/role-tab-config/unlock
exports.unlockConfig = async (req, res) => {
  try {
    const tenantId = req.tenant.id;
    const config = await CollegeRoleConfig.findOneAndUpdate(
      { tenantId },
      {
        isLocked: false,
        updatedBy: req.user.id,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json({
      message: 'Tab configuration unlocked successfully',
      isLocked: false
    });
  } catch (error) {
    console.error('Unlock config error:', error);
    res.status(500).json({ error: 'Failed to unlock configuration' });
  }
};
