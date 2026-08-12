const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Models
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const Session = require('../models/Session');
const Membership = require('../models/Membership');
const AdminProfile = require('../models/AdminProfile');
const GlobalRoleConfig = require('../models/GlobalRoleConfig');
const CollegeRoleConfig = require('../models/CollegeRoleConfig');
const ITUserProfile = require('../models/ITUserProfile');
const CollegeAdminRequest = require('../models/CollegeAdminRequest');
const SystemConfig = require('../models/SystemConfig');
const NoteloomManagerRequest = require('../models/NoteloomManagerRequest');
const masterFeatures = require('../config/masterFeatures');

const JWT_SECRET = process.env.JWT_SECRET;

// Helper to calculate the next incremental college code
const getNextCollegeCode = async () => {
  const lastTenant = await Tenant.findOne({ type: 'college' })
    .sort({ collegeCode: -1 }) // Sort descending to get the highest number
    .select('collegeCode');

  if (!lastTenant || !lastTenant.collegeCode) {
    return "1001"; // Starting point for the first college
  }

  const nextNumber = parseInt(lastTenant.collegeCode) + 1;
  return nextNumber.toString();
};

// ==========================================
// PUBLIC CONTROLLER ACTIONS
// ==========================================

exports.getPublicColleges = async (req, res) => {
  try {
    const colleges = await Tenant.find({
      type: 'college',
      status: 'active',
      name: { $ne: 'Note Loom System' }
    }).sort({ name: 1 });

    res.json(colleges);
  } catch (error) {
    console.error('Public colleges fetch failed:', error);
    res.status(500).json({ error: 'Failed to fetch colleges' });
  }
};

// ==========================================
// AUTHENTICATION
// ==========================================

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check Credentials
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check Membership (Strict IT Check)
    const membership = await Membership.findOne({
      userId: user._id,
      role: { $in: ['it_admin', 'it_user'] },
      status: 'active'
    }).populate('tenantId');

    if (!membership) {
      return res.status(403).json({ error: 'Access denied. Not an IT account.' });
    }

    // Normalize Role for Frontend
    let frontendRole = membership.role;
    if (membership.role === 'it_admin') frontendRole = 'noteloom_admin';
    if (membership.role === 'it_user')  frontendRole = 'noteloom_manager';

    // Create Session
    const sessionToken = jwt.sign(
      { userId: user._id, role: membership.role }, 
      JWT_SECRET, 
      { expiresIn: '12h' }
    );

    await Session.create({
      userId: user._id,
      tenantId: membership.tenantId._id,
      sessionToken,
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000)
    });

    res.cookie('sessionToken', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 12 * 60 * 60 * 1000 // 12 hours
    });

    res.json({
      sessionToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: frontendRole
      }
    });

  } catch (error) {
    console.error('IT Login Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.signout = async (req, res) => {
  try {
    const token = req.cookies?.sessionToken || req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      await Session.findOneAndDelete({ sessionToken: token });
    }
    
    res.clearCookie('sessionToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    res.json({ success: true, message: 'Signed out successfully' });
  } catch (error) {
    console.error('Signout Error:', error);
    res.status(500).json({ error: 'Server error during signout' });
  }
};

// ==========================================
// COLLEGE MANAGEMENT
// ==========================================

exports.getColleges = async (req, res) => {
  try {
    const colleges = await Tenant.find({ 
      type: 'college',
      name: { $ne: 'Note Loom System' }
    }).sort({ createdAt: -1 });
    res.json(colleges);
  } catch (error) { res.status(500).json({ error: 'Fetch failed' }); }
};

exports.createCollege = async (req, res) => {
  try {
    if (req.itUser.role !== 'noteloom_admin') {
      return res.status(403).json({ error: 'Access Denied: Only Admin can create colleges.' });
    }

    const { name, logoUrl, location, category, featured, adminName, adminEmail, adminPassword } = req.body;
    
    const subdomain = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const collegeCode = await getNextCollegeCode();
    
    const newCollege = await Tenant.create({
      name, 
      type: 'college', 
      subdomain, 
      logoUrl,
      location: location || 'India',
      category: category || 'University',
      featured: typeof featured === 'boolean' ? featured : false,
      collegeCode,
      status: 'active'
    });

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const newAdmin = await User.create({
      name: adminName, 
      email: adminEmail, 
      password: hashedPassword, 
      role: 'college_admin'
    });

    await Membership.create({
      userId: newAdmin._id, 
      tenantId: newCollege._id, 
      role: 'college_admin'
    });

    res.json(newCollege);
  } catch (error) {
    console.error("Creation Error:", error);
    res.status(500).json({ error: 'Failed to create college' });
  }
};

exports.updateCollegeStatus = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (tenant.name === 'Note Loom System') return res.status(403).json({ error: 'Protected' });

    tenant.status = req.body.status;
    if (req.body.status === 'active') tenant.deletionScheduledAt = null;
    await tenant.save();
    
    res.json(tenant);
  } catch (error) { res.status(500).json({ error: 'Update failed' }); }
};

exports.deleteCollege = async (req, res) => {
  try {
    if (req.itUser.role !== 'noteloom_admin') {
      return res.status(403).json({ error: 'Access Denied: Only Admin can delete colleges.' });
    }

    const tenant = await Tenant.findById(req.params.id);
    if (tenant.name === 'Note Loom System') return res.status(403).json({ error: 'Protected' });

    tenant.status = 'suspended';
    tenant.deletionScheduledAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    await tenant.save();

    res.json({ message: 'College scheduled for deletion' });
  } catch (error) { res.status(500).json({ error: 'Delete failed' }); }
};

// ==========================================
// REQUESTS & USERS
// ==========================================

exports.getCollegeRequests = async (req, res) => {
  try {
    const requests = await CollegeAdminRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (e) { res.status(500).json({ error: 'Error' }); }
};

exports.getManagerRequests = async (req, res) => {
  try {
    if (req.itUser.role !== 'noteloom_admin') return res.status(403).json({ error: 'Access Denied' });
    const requests = await NoteloomManagerRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (e) { res.status(500).json({ error: 'Error' }); }
};

exports.getUsers = async (req, res) => {
  try {
    if (req.itUser.role !== 'noteloom_admin') return res.status(403).json({ error: 'Access Denied' });

    const profiles = await ITUserProfile.find().populate('userId', 'name email role');
    const users = profiles.map(p => ({
      _id: p.userId?._id,
      name: p.userId?.name || 'Unknown',
      email: p.userId?.email || 'No Email',
      role: p.userId?.role === 'it_admin' ? 'noteloom_admin' : 'noteloom_manager',
      uid: p.uid
    }));

    res.json(users);
  } catch (error) { res.status(500).json({ error: 'Fetch failed' }); }
};

exports.getTenantsList = async (req, res) => {
  try {
    const tenants = await Tenant.find({ 
      status: { $ne: 'deleted' },
      name: { $ne: 'Note Loom System' }
    }, '_id name type status logoUrl').sort({ name: 1 });

    res.json(tenants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
};

// ==========================================
// FEATURE CONFIG
// ==========================================

exports.getMenuConfig = async (req, res) => {
  if (!masterFeatures || Object.keys(masterFeatures).length === 0) {
    console.error("❌ CRITICAL: masterFeatures is empty! Check backend/config/masterFeatures.js");
    return res.json({
      student: [{ key: 'error', title: 'Error: Master List Not Found', isActive: true }],
      faculty: [],
      college_admin: []
    });
  }

  try {
    const savedDoc = await SystemConfig.findOne({ tenantId: req.params.tenantId });
    const savedConfig = (savedDoc && savedDoc.config) ? savedDoc.config : {};
    const response = {};

    ['student', 'faculty', 'college_admin'].forEach(role => {
      const masterList = masterFeatures[role] || [];
      
      response[role] = masterList.map(item => {
        const roleConfig = savedConfig[role] || [];
        const savedItem = roleConfig.find(s => s.key === item.key);
        
        return {
          ...item,
          isActive: savedItem ? savedItem.isActive : true 
        };
      });
    });

    res.json(response);

  } catch (error) {
    console.error('Menu config fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch config: ' + error.message });
  }
};

exports.saveMenuConfig = async (req, res) => {
  try {
    if (req.itUser.role !== 'noteloom_admin') {
      return res.status(403).json({ error: 'Only Admin can change features.' });
    }

    const { tenantId, role, tabs } = req.body; 

    const simplifiedTabs = tabs.map(t => ({
      key: t.key,
      isActive: t.isActive
    }));

    const config = await SystemConfig.findOne({ tenantId });

    if (config) {
      config.config[role] = simplifiedTabs;
      config.updatedAt = new Date();
      config.updatedBy = req.itUser.id;
      await config.save();
    } else {
      const newConfig = {
        tenantId,
        config: { student: [], faculty: [], college_admin: [] },
        updatedBy: req.itUser.id
      };
      newConfig.config[role] = simplifiedTabs;
      await SystemConfig.create(newConfig);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Save config error:', error);
    res.status(500).json({ error: 'Failed to save configuration' });
  }
};

// ==========================================
// UPDATE COLLEGE DETAILS
// ==========================================

exports.updateCollege = async (req, res) => {
  try {
    const { name, logoUrl, location, category, featured } = req.body;
    
    const updatedTenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      {
        name,
        logoUrl,
        location: location || 'India',
        category: category || 'University',
        featured: typeof featured === 'boolean' ? featured : false
      },
      { new: true, runValidators: true }
    );

    if (!updatedTenant) return res.status(404).json({ error: 'College not found' });
    
    res.json(updatedTenant);
  } catch (error) {
    console.error('Update College Error:', error);
    res.status(500).json({ error: 'Failed to update college details' });
  }
};

// ==========================================
// IT PORTAL — COLLEGE ADMIN RBAC MANAGERS
// ==========================================

// Get all admins for a specific college
exports.getCollegeAdmins = async (req, res) => {
  try {
    const tenantId = req.params.id;
    const memberships = await Membership.find({ tenantId, role: 'college_admin' }).populate('userId', 'name email createdAt');
    const validMemberships = memberships.filter(m => m.userId);
    const userIds = validMemberships.map(m => m.userId._id);
    const profiles = await AdminProfile.find({ userId: { $in: userIds }, tenantId });

    const admins = validMemberships.map(m => {
      const u = m.userId.toObject();
      const profile = profiles.find(p => p.userId.toString() === u._id.toString());
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        adminRoles: profile && profile.adminRoles && profile.adminRoles.length > 0 ? profile.adminRoles : ['super_admin'],
        status: m.status
      };
    });

    res.json(admins);
  } catch (error) {
    console.error('IT get college admins error:', error);
    res.status(500).json({ error: 'Failed to fetch college admins' });
  }
};

// Add admin to a specific college
exports.addCollegeAdmin = async (req, res) => {
  try {
    const tenantId = req.params.id;
    const { name, email, password, adminRoles } = req.body;
    const roles = Array.isArray(adminRoles) && adminRoles.length > 0 ? adminRoles : ['super_admin'];

    let user = await User.findOne({ email });
    if (!user) {
      if (!name || !password) return res.status(400).json({ error: 'Name and password required for new user' });
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({ name, email, password: hashedPassword, role: 'college_admin' });
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
      { adminRoles: roles, assignedBy: req.itUser.id, assignedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ message: 'College admin added successfully', admin: { _id: user._id, name: user.name, email: user.email, adminRoles: profile.adminRoles } });
  } catch (error) {
    console.error('IT add college admin error:', error);
    res.status(500).json({ error: 'Failed to add college admin' });
  }
};

// Update college admin roles
exports.updateCollegeAdminRoles = async (req, res) => {
  try {
    const { id: tenantId, userId } = req.params;
    const { adminRoles } = req.body;

    if (!Array.isArray(adminRoles) || adminRoles.length === 0) {
      return res.status(400).json({ error: 'At least one role is required' });
    }

    const profile = await AdminProfile.findOneAndUpdate(
      { userId, tenantId },
      { adminRoles, assignedBy: req.itUser.id, assignedAt: new Date() },
      { new: true, upsert: true }
    );

    res.json({ message: 'Roles updated', adminRoles: profile.adminRoles });
  } catch (error) {
    console.error('IT update college admin roles error:', error);
    res.status(500).json({ error: 'Failed to update admin roles' });
  }
};

// Remove college admin
exports.removeCollegeAdmin = async (req, res) => {
  try {
    const { id: tenantId, userId } = req.params;
    await Membership.findOneAndUpdate({ userId, tenantId }, { status: 'suspended' });
    await AdminProfile.deleteOne({ userId, tenantId });
    res.json({ message: 'College admin removed successfully' });
  } catch (error) {
    console.error('IT remove college admin error:', error);
    res.status(500).json({ error: 'Failed to remove college admin' });
  }
};

// ==========================================
// IT PORTAL — GLOBAL CUSTOM ROLES
// ==========================================

const SEEDED_ROLES = [
  { key: 'super_admin', label: 'Super Admin', description: 'Full access — bypasses all role restrictions', isBuiltIn: true, isSeeded: true, assignmentType: 'default_assignment', defaultPermissions: ['accounts', 'coe', 'academic', 'library', 'hr', 'lms', 'timetable', 'notices', 'attendance'] },
  { key: 'accounts', label: 'Accounts & Finance', description: 'Fee management, payment records, financial reports', isBuiltIn: true, isSeeded: true, assignmentType: 'default_assignment', defaultPermissions: ['accounts'] },
  { key: 'coe', label: 'COE / Exam Cell', description: 'Exam forms, admit cards, results, question bank', isBuiltIn: true, isSeeded: true, assignmentType: 'default_assignment', defaultPermissions: ['coe'] },
  { key: 'academic', label: 'Academic Affairs', description: 'Departments, batches, timetable, attendance', isBuiltIn: true, isSeeded: true, assignmentType: 'default_assignment', defaultPermissions: ['academic', 'timetable', 'attendance'] },
  { key: 'library', label: 'Library Management', description: 'Physical books, digital library approvals', isBuiltIn: true, isSeeded: true, assignmentType: 'default_assignment', defaultPermissions: ['library'] },
  { key: 'hr', label: 'HR / Leave Manager', description: 'Staff leave management and approval', isBuiltIn: true, isSeeded: true, assignmentType: 'default_assignment', defaultPermissions: ['hr'] },
  { key: 'lms', label: 'LMS / Content', description: 'Class modules, lesson content, curriculum', isBuiltIn: true, isSeeded: true, assignmentType: 'default_assignment', defaultPermissions: ['lms'] }
];

exports.getGlobalRoles = async (req, res) => {
  try {
    const customGlobalRoles = await GlobalRoleConfig.find().populate('restrictToTenants', 'name collegeCode').sort({ createdAt: -1 });
    
    const formattedCustomRoles = customGlobalRoles.map(r => {
      const obj = r.toObject();
      const hasRestrictions = obj.restrictToTenants && obj.restrictToTenants.length > 0;
      return {
        ...obj,
        isSeeded: false,
        assignmentType: hasRestrictions ? 'custom_assignment' : 'default_assignment'
      };
    });

    res.json({
      seededRoles: SEEDED_ROLES,
      customRoles: formattedCustomRoles,
      allRoles: [...SEEDED_ROLES, ...formattedCustomRoles]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch global roles' });
  }
};

exports.createGlobalRole = async (req, res) => {
  try {
    const { key, label, description, defaultPermissions, restrictToTenants, assignmentType } = req.body;
    const roleKey = key.toLowerCase().replace(/[^a-z0-9_]/g, '_');

    const isReserved = SEEDED_ROLES.some(r => r.key === roleKey);
    if (isReserved) return res.status(400).json({ error: 'Role key is reserved by a seeded system role' });

    const existing = await GlobalRoleConfig.findOne({ key: roleKey });
    if (existing) return res.status(400).json({ error: 'Role key already exists' });

    const newRole = await GlobalRoleConfig.create({
      key: roleKey,
      label,
      description,
      defaultPermissions: defaultPermissions || [],
      restrictToTenants: restrictToTenants || [],
      assignmentType: assignmentType || ((restrictToTenants && restrictToTenants.length > 0) ? 'custom_assignment' : 'default_assignment'),
      createdBy: req.itUser.id
    });

    res.json(newRole);
  } catch (error) {
    console.error('Create global role error:', error);
    res.status(500).json({ error: 'Failed to create global role' });
  }
};

exports.updateGlobalRole = async (req, res) => {
  try {
    const { key } = req.params;
    const { label, description, defaultPermissions, restrictToTenants, isActive } = req.body;

    const updated = await GlobalRoleConfig.findOneAndUpdate(
      { key },
      { label, description, defaultPermissions, restrictToTenants, isActive, updatedBy: req.itUser.id, updatedAt: new Date() },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Global role not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update global role' });
  }
};

exports.deleteGlobalRole = async (req, res) => {
  try {
    const { key } = req.params;
    await GlobalRoleConfig.deleteOne({ key });
    res.json({ message: 'Global role deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete global role' });
  }
};

// ==========================================
// IT PORTAL — COLLEGE-SPECIFIC CUSTOM ROLES
// ==========================================

exports.getCollegeCustomRoles = async (req, res) => {
  try {
    const tenantId = req.params.id;
    const config = await CollegeRoleConfig.findOne({ tenantId });
    res.json(config?.collegeCustomRoles || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch college custom roles' });
  }
};

exports.createCollegeCustomRole = async (req, res) => {
  try {
    const tenantId = req.params.id;
    const { key, label, description, defaultPermissions } = req.body;
    const roleKey = key.toLowerCase().replace(/[^a-z0-9_]/g, '_');

    let config = await CollegeRoleConfig.findOne({ tenantId });
    if (!config) {
      config = await CollegeRoleConfig.create({ tenantId, collegeCustomRoles: [] });
    }

    const exists = config.collegeCustomRoles.some(r => r.key === roleKey);
    if (exists) return res.status(400).json({ error: 'Custom role key already exists for this college' });

    config.collegeCustomRoles.push({
      key: roleKey,
      label,
      description,
      defaultPermissions: defaultPermissions || []
    });

    await config.save();
    res.json(config.collegeCustomRoles);
  } catch (error) {
    console.error('Create college custom role error:', error);
    res.status(500).json({ error: 'Failed to create college custom role' });
  }
};

exports.deleteCollegeCustomRole = async (req, res) => {
  try {
    const { id: tenantId, roleKey } = req.params;
    let config = await CollegeRoleConfig.findOne({ tenantId });
    if (config) {
      config.collegeCustomRoles = config.collegeCustomRoles.filter(r => r.key !== roleKey);
      await config.save();
    }
    res.json({ message: 'College custom role deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete college custom role' });
  }
};

// Update custom label for ANY role (seeded, global, custom) for a specific college
exports.updateCollegeRoleLabel = async (req, res) => {
  try {
    const { id: tenantId, roleKey } = req.params;
    const { label } = req.body;

    if (!label) return res.status(400).json({ error: 'Role label is required' });

    let config = await CollegeRoleConfig.findOne({ tenantId });
    if (!config) {
      config = await CollegeRoleConfig.create({ tenantId, customRoleLabels: new Map() });
    }

    if (!config.customRoleLabels) {
      config.customRoleLabels = new Map();
    }

    config.customRoleLabels.set(roleKey, label);

    const customRoleIndex = config.collegeCustomRoles.findIndex(r => r.key === roleKey);
    if (customRoleIndex !== -1) {
      config.collegeCustomRoles[customRoleIndex].label = label;
    }

    config.updatedBy = req.itUser.id;
    config.updatedAt = new Date();
    await config.save();

    res.json({ message: 'College role label updated successfully', roleKey, label });
  } catch (error) {
    console.error('Update college role label error:', error);
    res.status(500).json({ error: 'Failed to update college role label' });
  }
};

