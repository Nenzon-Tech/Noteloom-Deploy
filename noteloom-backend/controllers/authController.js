const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const StudentProfile = require('../models/StudentProfile');
const FacultyProfile = require('../models/FacultyProfile');
const AdminProfile = require('../models/AdminProfile');
const ITUserProfile = require('../models/ITUserProfile'); 
const ITAdminProfile = require('../models/ITAdminProfile'); 
const Tenant = require('../models/Tenant'); 
const Membership = require('../models/Membership'); 
const Session = require('../models/Session'); 
const EmailVerification = require('../models/EmailVerification'); 
const { sendEmail } = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set.');
}

// 1. CHECK EMAIL
exports.checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email });
    
    if (user) {
      const membership = await Membership.findOne({ userId: user._id }).populate('tenantId');
      return res.json({ 
        exists: true,
        collegeName: membership?.tenantId?.name || 'Unknown College',
        role: membership?.role
      });
    }
    res.json({ exists: false });
  } catch (error) {
    console.error("Check email error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// 2. SEND VERIFICATION
exports.sendVerification = async (req, res) => {
  try {
    const { email, type = 'signup' } = req.body;
    
    // Generate Code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Clean up old codes
    await EmailVerification.deleteMany({ email, type });

    // Save to DB
    await EmailVerification.create({ email, code, type, expiresAt });

    // Send Email via service
    await sendEmail(email, code);

    res.json({ message: 'Verification code sent successfully' });
  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
};

// 3. VERIFY EMAIL
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code, type = 'signup' } = req.body;
    const record = await EmailVerification.findOne({
      email, code, type, isUsed: false, expiresAt: { $gt: new Date() }
    });

    if (!record) return res.status(400).json({ message: 'Invalid or expired code' });

    record.isUsed = true;
    await record.save();
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Verification failed' });
  }
};

// 4. SIGNUP (Strict Code-Based Logic)
exports.roleSignup = async (req, res) => {
  try {
    let { 
      email, fullName, password, collegeCode, role = 'student',
      phoneNumber, gender, admissionYear, course, stream, year, rollNo, currentSemester,
      department, designation, qualification, experience, specialization, employeeId,
      adminLevel, responsibilities, approvalAuthority, accessLevel, adminRoles
    } = req.body;

    if (!email || !fullName || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required' });
    }

    // Clean strings
    email = String(email).trim().toLowerCase();
    fullName = String(fullName).trim();

    // Check Existing User by Email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const existingMembership = await Membership.findOne({ userId: existingUser._id }).populate('tenantId');
      return res.status(400).json({ 
        error: 'User already registered with this email.',
        collegeName: existingMembership?.tenantId?.name || 'an existing institution'
      });
    }

    // Find Tenant by collegeCode or through caller session
    let tenant = null;
    if (collegeCode) {
      tenant = await Tenant.findOne({ collegeCode: String(collegeCode).trim() });
    }

    if (!tenant) {
      // Check if caller is an authenticated admin with a session
      const authHeader = req.headers.authorization || req.cookies?.sessionToken;
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '').trim();
        const session = await Session.findOne({ sessionToken: token, expiresAt: { $gt: new Date() } }).populate('tenantId');
        if (session && session.tenantId) {
          tenant = session.tenantId;
          collegeCode = tenant.collegeCode;
        }
      }
    }

    if (!tenant) {
      return res.status(404).json({ error: 'Institution not found. Please provide a valid College Code.' });
    }

    // Check unique constraints per tenant before saving
    if (role === 'student' && rollNo) {
      const existingRoll = await StudentProfile.findOne({ rollNo: String(rollNo).trim(), tenantId: tenant._id });
      if (existingRoll) {
        return res.status(400).json({ error: `A student with Roll Number "${rollNo}" already exists in this institution.` });
      }
    }

    if ((role === 'faculty' || role === 'college_admin') && employeeId) {
      if (role === 'faculty') {
        const existingEmp = await FacultyProfile.findOne({ employeeId: String(employeeId).trim(), tenantId: tenant._id });
        if (existingEmp) {
          return res.status(400).json({ error: `A faculty member with Employee ID "${employeeId}" already exists.` });
        }
      } else if (role === 'college_admin') {
        const existingAdmin = await AdminProfile.findOne({ employeeId: String(employeeId).trim(), tenantId: tenant._id });
        if (existingAdmin) {
          return res.status(400).json({ error: `An administrator with Employee ID "${employeeId}" already exists.` });
        }
      }
    }

    // Generate UID
    let middleCode = '';
    let countQuery = { tenantId: tenant._id, role: role };
    
    if (role === 'college_admin') {
      middleCode = '900'; 
    } else if (role === 'faculty') {
      middleCode = '500';
    } else {
      const admYr = admissionYear ? String(admissionYear) : new Date().getFullYear().toString();
      middleCode = admYr.slice(-2); // e.g. 26
    }

    const roleMemberCount = await Membership.countDocuments(countQuery);
    const sequence = (roleMemberCount + 1).toString().padStart(4, '0');
    const generatedUid = `${tenant.collegeCode}${middleCode}${sequence}`;

    // Create User
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      email, 
      name: fullName, 
      password: hashedPassword, 
      emailVerified: true,
      role: role,
      noteloomId: generatedUid,
      department: department || stream || 'General',
      college: tenant.name
    });
    await user.save();

    // Create Membership
    const membership = new Membership({ 
      userId: user._id, 
      tenantId: tenant._id, 
      role: role,
      status: 'active'
    });
    await membership.save();

    // Create Profile
    if (role === 'student') {
      await StudentProfile.create({
        userId: user._id, 
        tenantId: tenant._id, 
        uid: generatedUid,
        name: fullName, 
        email,
        phoneNumber: phoneNumber || '', 
        gender: gender || 'Other', 
        admissionYear: Number(admissionYear) || new Date().getFullYear(), 
        course: course || 'B.Tech', 
        stream: stream || 'General', 
        year: year || '1st', 
        rollNo: rollNo || generatedUid, 
        currentSemester: Number(currentSemester) || 1
      });
    } else if (role === 'faculty') {
      await FacultyProfile.create({
        userId: user._id, 
        tenantId: tenant._id, 
        uid: generatedUid,
        name: fullName, 
        email,
        department: department || 'General', 
        designation: designation || 'Faculty', 
        qualification: qualification || 'Post Graduate', 
        experience: Number(experience) || 0, 
        specialization: specialization || 'General', 
        employeeId: employeeId || generatedUid,
        phoneNumber: phoneNumber || ''
      });
    } else if (role === 'college_admin') {
      // Determine RBAC permissions from adminRoles array or adminLevel
      let computedRoles = ['super_admin'];
      if (Array.isArray(adminRoles) && adminRoles.length > 0) {
        computedRoles = adminRoles;
      } else if (adminLevel === 'Department Admin') {
        computedRoles = ['academic', 'lms'];
      } else if (adminLevel === 'Accounts Admin' || adminLevel === 'Finance Admin') {
        computedRoles = ['accounts'];
      } else if (adminLevel === 'Exam Cell Admin' || adminLevel === 'COE Admin') {
        computedRoles = ['coe'];
      } else if (adminLevel === 'Library Admin') {
        computedRoles = ['library'];
      } else if (adminLevel === 'HR Admin') {
        computedRoles = ['hr'];
      } else {
        computedRoles = ['super_admin'];
      }

      await AdminProfile.create({
        userId: user._id, 
        tenantId: tenant._id, 
        uid: generatedUid,
        name: fullName, 
        email,
        adminLevel: adminLevel || 'College Admin', 
        responsibilities: responsibilities || '', 
        employeeId: employeeId || generatedUid,
        approvalAuthority: approvalAuthority || 'Full',
        accessLevel: accessLevel || 'Standard',
        adminRoles: computedRoles,
        assignedAt: new Date()
      });
    }

    res.json({ 
      success: true,
      message: 'Account created successfully', 
      uid: generatedUid,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: role
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'A user with this Email, Roll Number, or Employee ID already exists.' });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// 5. SIGNIN
exports.signin = async (req, res) => {
  try {
    const { email, password, collegeCode } = req.body; 
    
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const requestedTenant = await Tenant.findOne({ collegeCode });
    if (!requestedTenant) return res.status(404).json({ error: 'Institution code not recognized' });

    const membership = await Membership.findOne({ 
      userId: user._id, 
      tenantId: requestedTenant._id,
      status: 'active' 
    }).populate('tenantId');

    if (!membership) {
      const actualMembership = await Membership.findOne({ userId: user._id }).populate('tenantId');
      return res.status(403).json({ 
        error: 'college_mismatch', 
        userCollegeName: actualMembership?.tenantId.name || 'another institution'
      });
    }

    const sessionToken = jwt.sign(
      { userId: user._id, tenantId: requestedTenant._id, collegeCode: requestedTenant.collegeCode },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await Session.create({
      userId: user._id,
      tenantId: requestedTenant._id,
      sessionToken,
      expiresAt
    });

    res.cookie('sessionToken', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      message: 'Login successful',
      sessionToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Signin Error:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 6. SIGNOUT
exports.signout = async (req, res) => {
  try {
    const token = req.cookies?.sessionToken || req.header('Authorization')?.replace('Bearer ', '');
    if (token) await Session.findOneAndDelete({ sessionToken: token });
    
    res.clearCookie('sessionToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    res.json({ message: 'Signed out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Signout failed' });
  }
};

// 7. VERIFY TOKEN
exports.verifyToken = async (req, res) => {
  const token = req.cookies?.sessionToken || req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// 8. GET PUBLIC COLLEGES
exports.getPublicColleges = async (req, res) => {
  try {
    const colleges = await Tenant.find({
      type: 'college',
      status: 'active',
      name: { $ne: 'Note Loom System' }
    }).sort({ name: 1 });

    res.json(colleges);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch colleges' });
  }
};
