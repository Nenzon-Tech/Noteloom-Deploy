import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Building,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Phone,
  Mail,
  Lock,
  User,
  Copy,
  Check,
  Sparkles,
  Users,
  ChevronRight,
  Wifi,
  LogOut,
  Shield
} from 'lucide-react';
import { API_BASE } from '@/utils/config';
import { useTheme } from '@/context/ThemeContext.jsx';
import GlassHeader from '@/components/common/GlassHeader.jsx';
import CollegeBannerLogo from '@/components/common/CollegeBannerLogo.jsx';
import ThemeToggle from '@/components/common/ThemeToggle.jsx';
import UserProfileDropdown from '@/components/common/UserProfileDropdown.jsx';
import { useSessionManager } from '@/hooks/useSessionManager';

const ROLE_CONFIGS = {
  student: {
    label: 'Student',
    icon: GraduationCap,
    color: 'from-blue-600 to-indigo-600',
    lightInactive: 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 text-slate-800 shadow-sm',
    description: 'Create a student profile with enrollment, stream, semester, and batch details.'
  },
  faculty: {
    label: 'Faculty',
    icon: Briefcase,
    color: 'from-emerald-600 to-teal-600',
    lightInactive: 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 text-slate-800 shadow-sm',
    description: 'Create a faculty account with department, designation, qualifications, and domain.'
  },
  college_admin: {
    label: 'College Admin',
    icon: ShieldCheck,
    color: 'from-purple-600 to-pink-600',
    lightInactive: 'bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50/30 text-slate-800 shadow-sm',
    description: 'Create an administrator account with configurable RBAC permissions and authority.'
  }
};

const RBAC_MODULES = [
  { key: 'super_admin', label: 'Super Admin (Full Access)', desc: 'Unrestricted control over all college portals' },
  { key: 'academic', label: 'Academic Affairs', desc: 'Manage departments, streams, batches & timetables' },
  { key: 'coe', label: 'COE / Exam Cell', desc: 'Manage exams, admit cards, fees & result publishing' },
  { key: 'accounts', label: 'Accounts & Finance', desc: 'Track fee ledger, student payments & records' },
  { key: 'library', label: 'Library Management', desc: 'Circulate physical books and approve digital links' },
  { key: 'hr', label: 'HR / Leave Manager', desc: 'Review and approve faculty & staff leave requests' },
  { key: 'lms', label: 'LMS / Content', desc: 'Manage lecture modules and study material' }
];

const AccountCreationManager = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { user, profile, loading: sessionLoading, clearSession } = useSessionManager();

  const [role, setRole] = useState('student'); // student, faculty, college_admin
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [createdAccount, setCreatedAccount] = useState(null);
  const [copiedUid, setCopiedUid] = useState(false);

  // College identifier from storage / session
  const storedCollegeCode = localStorage.getItem('selectedCollegeCode') || '';
  const storedCollegeName = localStorage.getItem('selectedCollege') || profile?.college || 'EduSpace Institution';

  // Form State
  const initialFormData = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',

    // Student Fields
    rollNo: '',
    phoneNumber: '',
    gender: 'Male',
    admissionYear: new Date().getFullYear(),
    course: 'B.Tech',
    stream: '',
    year: '1st',
    currentSemester: 1,

    // Faculty Fields
    employeeId: '',
    department: '',
    designation: 'Assistant Professor',
    qualification: 'M.Tech',
    experience: 3,
    specialization: '',

    // Admin Fields
    adminLevel: 'College Admin',
    adminRoles: ['super_admin'],
    accessLevel: 'Full Access',
    approvalAuthority: 'Full Authority',
    responsibilities: ''
  };

  const [formData, setFormData] = useState(initialFormData);

  // Fetch departments for dynamic dropdowns
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem('sessionToken');
        const res = await fetch(`${API_BASE}/api/departments`, {
          headers: { ...(token && { Authorization: `Bearer ${token}` }) }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setDepartments(data);
            if (data.length > 0) {
              setFormData(prev => ({
                ...prev,
                department: prev.department || data[0].name,
                stream: prev.stream || data[0].name
              }));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load departments:', err);
      }
    };
    fetchDepartments();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleRbacRole = (key) => {
    setFormData(prev => {
      let current = [...(prev.adminRoles || [])];
      if (key === 'super_admin') {
        current = current.includes('super_admin') ? [] : ['super_admin'];
      } else {
        current = current.filter(r => r !== 'super_admin');
        if (current.includes(key)) {
          current = current.filter(r => r !== key);
        } else {
          current.push(key);
        }
      }
      return { ...prev, adminRoles: current.length > 0 ? current : ['super_admin'] };
    });
  };

  const handleCopyUid = () => {
    if (createdAccount?.uid) {
      navigator.clipboard.writeText(createdAccount.uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  const handleSignOut = async () => {
    await clearSession();
  };

  const resetForm = () => {
    setFormData({
      ...initialFormData,
      department: departments.length > 0 ? departments[0].name : '',
      stream: departments.length > 0 ? departments[0].name : ''
    });
    setCreatedAccount(null);
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    setCreatedAccount(null);

    // Validation
    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      setLoading(false);
      return;
    }

    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      setLoading(false);
      return;
    }

    // Role-specific validation
    if (role === 'student') {
      if (!formData.rollNo.trim()) {
        setMessage({ type: 'error', text: 'Student Roll Number / Enrollment ID is required.' });
        setLoading(false);
        return;
      }
      if (!formData.phoneNumber.trim()) {
        setMessage({ type: 'error', text: 'Contact Phone Number is required for students.' });
        setLoading(false);
        return;
      }
    } else if (role === 'faculty') {
      if (!formData.employeeId.trim()) {
        setMessage({ type: 'error', text: 'Faculty Employee ID is required.' });
        setLoading(false);
        return;
      }
      if (!formData.department.trim()) {
        setMessage({ type: 'error', text: 'Department selection is required for faculty.' });
        setLoading(false);
        return;
      }
    } else if (role === 'college_admin') {
      if (!formData.employeeId.trim()) {
        setMessage({ type: 'error', text: 'Administrator Employee ID is required.' });
        setLoading(false);
        return;
      }
    }

    // Build JSON Payload
    const collegeCode = storedCollegeCode || '1001';
    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role,
      collegeCode,
      collegeName: storedCollegeName,

      // Student fields
      ...(role === 'student' && {
        rollNo: formData.rollNo.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        gender: formData.gender,
        admissionYear: Number(formData.admissionYear),
        course: formData.course,
        stream: formData.stream || formData.course,
        year: formData.year,
        currentSemester: Number(formData.currentSemester)
      }),

      // Faculty fields
      ...(role === 'faculty' && {
        employeeId: formData.employeeId.trim(),
        department: formData.department,
        designation: formData.designation,
        qualification: formData.qualification,
        experience: Number(formData.experience) || 0,
        specialization: formData.specialization || 'General',
        phoneNumber: formData.phoneNumber?.trim() || ''
      }),

      // Admin fields
      ...(role === 'college_admin' && {
        employeeId: formData.employeeId.trim(),
        adminLevel: formData.adminLevel,
        adminRoles: formData.adminRoles,
        accessLevel: formData.accessLevel,
        approvalAuthority: formData.approvalAuthority,
        responsibilities: formData.responsibilities?.trim() || ''
      })
    };

    try {
      const sessionToken = localStorage.getItem('sessionToken');
      const res = await fetch(`${API_BASE}/api/auth/role-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionToken && { Authorization: `Bearer ${sessionToken}` })
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (res.ok && result.success !== false) {
        setCreatedAccount({
          uid: result.uid,
          fullName: formData.fullName,
          email: formData.email,
          role,
          details: role === 'student' 
            ? `${formData.course} (${formData.stream || 'General'}) • Sem ${formData.currentSemester} • Roll: ${formData.rollNo}`
            : role === 'faculty'
            ? `${formData.designation} • Dept: ${formData.department} • Emp ID: ${formData.employeeId}`
            : `${formData.adminLevel} • Emp ID: ${formData.employeeId}`
        });
        setMessage({ type: 'success', text: `Account created successfully! EduSpace UID: ${result.uid}` });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to create account. Please verify input fields.' });
      }
    } catch (err) {
      console.error('Account creation error:', err);
      setMessage({ type: 'error', text: 'Network connection or server error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col ${isDarkMode ? 'bg-[#0b0f17] text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* ================= GLOBAL DASHBOARD HEADER ================= */}
      <GlassHeader variant="dashboard">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          {/* LEFT: User Profile, Role Badge, Status, College Context */}
          <div className="flex items-center space-x-4">
            <UserProfileDropdown user={user} onOptionClick={() => {}} />

            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span
                  className={`inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold ${
                    isDarkMode
                      ? "bg-purple-600/90 text-white"
                      : "bg-purple-100 text-purple-800 border border-purple-200"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                  College Admin
                </span>

                <span className="text-xs text-emerald-600 dark:text-green-500 flex items-center font-bold">
                  <Wifi className="w-3 h-3 mr-1" />
                  Active
                </span>
              </div>

              <div className={`text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>
                {profile?.college || storedCollegeName}
              </div>
            </div>
          </div>

          {/* RIGHT: Banner Logo, Theme Toggle, Sign Out */}
          <div className="flex items-center space-x-4">
            <CollegeBannerLogo />
            <ThemeToggle />

            <button
              onClick={handleSignOut}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                isDarkMode
                  ? "bg-gray-800 text-gray-300 hover:bg-red-600 hover:text-white border border-gray-700"
                  : "bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </GlassHeader>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 pt-28 pb-12 w-full space-y-6">
        
        {/* Navigation Breadcrumb / Top Bar */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
              isDarkMode
                ? 'bg-gray-800/80 border-gray-700 hover:bg-gray-700 text-purple-400 hover:text-purple-300'
                : 'bg-white border-slate-300 hover:bg-slate-100 text-purple-700 hover:text-purple-800 shadow-sm'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-3">
            {storedCollegeCode && (
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                isDarkMode ? 'bg-blue-950/40 border-blue-500/30 text-blue-400' : 'bg-blue-50 border-blue-300 text-blue-800'
              }`}>
                <Building className="w-3.5 h-3.5" />
                College Code: {storedCollegeCode}
              </span>
            )}

            <button
              onClick={() => navigate('/dashboard/admin-roles')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              Role Matrix
            </button>

            <button
              onClick={() => navigate('/dashboard/manage-users')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Manage Users
            </button>
          </div>
        </div>

        {/* Title Header Card */}
        <div className={`p-6 rounded-3xl border transition-all ${
          isDarkMode ? 'bg-gray-900/60 border-gray-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
              <UserPlus className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Account Creation Manager</h1>
              <p className="text-xs text-slate-600 dark:text-gray-400 font-semibold mt-0.5">
                Register new student profiles, faculty members, and institutional administrators with custom RBAC access scopes.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Role Selector Card */}
          <div className={`p-3.5 mb-6 rounded-2xl border backdrop-blur-xl ${
            isDarkMode ? 'bg-gray-900/60 border-gray-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-3 px-1">
              Select Account Role Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(ROLE_CONFIGS).map(([key, config]) => {
                const Icon = config.icon;
                const isSelected = role === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setRole(key);
                      setMessage({ type: '', text: '' });
                      setCreatedAccount(null);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                      isSelected
                        ? `border-transparent text-white shadow-lg shadow-blue-500/20 bg-gradient-to-br ${config.color}`
                        : isDarkMode
                        ? 'bg-gray-800/40 border-gray-700/60 hover:bg-gray-800 text-gray-300 hover:border-gray-600'
                        : config.lightInactive
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2.5 rounded-xl ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : isDarkMode
                          ? 'bg-gray-700/60 text-gray-300'
                          : 'bg-slate-100 text-slate-700 shadow-inner'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <div className={`font-black text-sm ${isSelected ? 'text-white' : 'text-slate-900 dark:text-gray-200'}`}>
                      {config.label}
                    </div>
                    <div className={`text-[11px] mt-0.5 line-clamp-1 font-medium ${
                      isSelected ? 'text-white/90' : 'text-slate-500 dark:text-gray-400'
                    }`}>
                      {key === 'student' ? 'Learner Profile' : key === 'faculty' ? 'Instructor Profile' : 'Admin & Staff'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Success Confirmation Card */}
          <AnimatePresence>
            {createdAccount && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className={`mb-8 p-6 rounded-3xl border shadow-lg ${
                  isDarkMode
                    ? 'border-green-500/30 bg-gradient-to-br from-green-950/40 via-emerald-900/20 to-teal-950/40'
                    : 'border-emerald-300 bg-emerald-50 text-emerald-950'
                }`}
              >
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-green-400 border border-emerald-500/30">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-green-400">Account Successfully Created</span>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">{createdAccount.fullName}</h3>
                      <p className="text-xs text-slate-600 dark:text-gray-300 font-semibold">{createdAccount.email} • {createdAccount.details}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-bold transition-all border border-slate-300 dark:border-transparent shadow-sm"
                    >
                      Create Another
                    </button>
                    <button
                      onClick={() => navigate('/dashboard/manage-users')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      View in Users <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Generated UID Highlight Box */}
                <div className={`mt-4 p-4 rounded-2xl border flex items-center justify-between flex-wrap gap-3 ${
                  isDarkMode ? 'bg-black/40 border-green-500/20' : 'bg-white border-emerald-200 shadow-sm'
                }`}>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-green-400/80">Permanent EduSpace System UID</span>
                    <div className="text-xl font-mono font-black text-emerald-700 dark:text-green-300 tracking-wider mt-0.5">
                      {createdAccount.uid}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUid}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    {copiedUid ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedUid ? 'Copied UID!' : 'Copy UID'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Creation Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 sm:p-8 rounded-3xl border backdrop-blur-xl ${
              isDarkMode ? 'bg-gray-900/60 border-gray-800 shadow-2xl' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1: Account Login Credentials */}
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-gray-800">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black text-xs flex items-center justify-center border border-blue-500/20">
                    1
                  </div>
                  <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white">Login Credentials & Basic Info</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                      Full Legal Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-400" />
                      <input
                        type="text"
                        name="fullName"
                        placeholder="e.g. Rahul Sharma"
                        required
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-800/60 border-gray-700/80 text-white placeholder:text-gray-500'
                            : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-sm'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        placeholder="e.g. rahul.sharma@eduspace.edu"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-800/60 border-gray-700/80 text-white placeholder:text-gray-500'
                            : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-sm'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                      Temporary Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="At least 6 characters"
                        required
                        minLength={6}
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm font-semibold transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-800/60 border-gray-700/80 text-white placeholder:text-gray-500'
                            : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-sm'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-800/60 border-gray-700/80 text-white placeholder:text-gray-500'
                            : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-sm'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Role Specific Details */}
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-gray-800">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black text-xs flex items-center justify-center border border-blue-500/20">
                    2
                  </div>
                  <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white capitalize">
                    {role.replace('_', ' ')} Profile & Academic Details
                  </h2>
                </div>

                {/* 👨‍🎓 STUDENT SPECIFIC FIELDS */}
                {role === 'student' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                        Roll Number / Enrollment ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="rollNo"
                        placeholder="e.g. 2026CSE042"
                        required
                        value={formData.rollNo}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-800/60 border-gray-700/80 text-white'
                            : 'bg-white border-slate-300 text-slate-900 shadow-sm'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                        Contact Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-400" />
                        <input
                          type="tel"
                          name="phoneNumber"
                          placeholder="e.g. +91 9876543210"
                          required
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode
                              ? 'bg-gray-800/60 border-gray-700/80 text-white'
                              : 'bg-white border-slate-300 text-slate-900 shadow-sm'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="gender"
                        required
                        value={formData.gender}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-800/60 border-gray-700/80 text-white'
                            : 'bg-white border-slate-300 text-slate-900 shadow-sm'
                        }`}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                        Degree / Program Course <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="course"
                        required
                        value={formData.course}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-800/60 border-gray-700/80 text-white'
                            : 'bg-white border-slate-300 text-slate-900 shadow-sm'
                        }`}
                      >
                        <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                        <option value="BCA">BCA (Bachelor of Computer Applications)</option>
                        <option value="MCA">MCA (Master of Computer Applications)</option>
                        <option value="M.Tech">M.Tech (Master of Technology)</option>
                        <option value="BBA">BBA (Bachelor of Business Admin)</option>
                        <option value="B.Sc">B.Sc (Bachelor of Science)</option>
                        <option value="Diploma">Diploma</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                        Stream / Department <span className="text-red-500">*</span>
                      </label>
                      {departments.length > 0 ? (
                        <select
                          name="stream"
                          required
                          value={formData.stream}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode
                              ? 'bg-gray-800/60 border-gray-700/80 text-white'
                              : 'bg-white border-slate-300 text-slate-900 shadow-sm'
                          }`}
                        >
                          <option value="">Select Stream / Dept</option>
                          {departments.map(d => (
                            <option key={d._id || d.name} value={d.name}>{d.name} ({d.code || d.shortName || 'Dept'})</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          name="stream"
                          placeholder="e.g. Computer Science & Engineering"
                          required
                          value={formData.stream}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode
                              ? 'bg-gray-800/60 border-gray-700/80 text-white'
                              : 'bg-white border-slate-300 text-slate-900 shadow-sm'
                          }`}
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                          Year
                        </label>
                        <select
                          name="year"
                          value={formData.year}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode
                              ? 'bg-gray-800/60 border-gray-700/80 text-white'
                              : 'bg-white border-slate-300 text-slate-900 shadow-sm'
                          }`}
                        >
                          <option value="1st">1st Year</option>
                          <option value="2nd">2nd Year</option>
                          <option value="3rd">3rd Year</option>
                          <option value="4th">4th Year</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                          Semester
                        </label>
                        <select
                          name="currentSemester"
                          value={formData.currentSemester}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode
                              ? 'bg-gray-800/60 border-gray-700/80 text-white'
                              : 'bg-white border-slate-300 text-slate-900 shadow-sm'
                          }`}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                            <option key={s} value={s}>Semester {s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                        Admission Year
                      </label>
                      <input
                        type="number"
                        name="admissionYear"
                        placeholder="e.g. 2026"
                        min={2000}
                        max={2040}
                        value={formData.admissionYear}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-800/60 border-gray-700/80 text-white'
                            : 'bg-white border-slate-300 text-slate-900 shadow-sm'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* 👩‍🏫 FACULTY SPECIFIC FIELDS */}
                {role === 'faculty' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                        Employee ID / Faculty Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="employeeId"
                        placeholder="e.g. FAC-CSE-108"
                        required
                        value={formData.employeeId}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-800/60 border-gray-700/80 text-white'
                            : 'bg-white border-slate-300 text-slate-900 shadow-sm'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                        Academic Department <span className="text-red-500">*</span>
                      </label>
                      {departments.length > 0 ? (
                        <select
                          name="department"
                          required
                          value={formData.department}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode
                              ? 'bg-gray-800/60 border-gray-700/80 text-white'
                              : 'bg-white border-slate-300 text-slate-900 shadow-sm'
                          }`}
                        >
                          <option value="">Select Department</option>
                          {departments.map(d => (
                            <option key={d._id || d.name} value={d.name}>{d.name}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          name="department"
                          placeholder="e.g. Computer Science & Engineering"
                          required
                          value={formData.department}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode
                              ? 'bg-gray-800/60 border-gray-700/80 text-white'
                              : 'bg-white border-slate-300 text-slate-900 shadow-sm'
                          }`}
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                        Faculty Designation <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="designation"
                        required
                        value={formData.designation}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-800/60 border-gray-700/80 text-white'
                            : 'bg-white border-slate-300 text-slate-900 shadow-sm'
                        }`}
                      >
                        <option value="Assistant Professor">Assistant Professor</option>
                        <option value="Associate Professor">Associate Professor</option>
                        <option value="Professor">Professor</option>
                        <option value="Head of Department (HOD)">Head of Department (HOD)</option>
                        <option value="Visiting Faculty">Visiting Faculty</option>
                        <option value="Lecturer">Lecturer</option>
                        <option value="Lab Instructor">Lab Instructor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                        Highest Qualification
                      </label>
                      <select
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-800/60 border-gray-700/80 text-white'
                            : 'bg-white border-slate-300 text-slate-900 shadow-sm'
                        }`}
                      >
                        <option value="Ph.D">Ph.D (Doctor of Philosophy)</option>
                        <option value="M.Tech">M.Tech / M.E</option>
                        <option value="M.S">M.S (Master of Science)</option>
                        <option value="MCA">MCA</option>
                        <option value="M.Sc">M.Sc</option>
                        <option value="B.Tech">B.Tech / B.E</option>
                        <option value="Post Graduate">Post Graduate</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                        Teaching Experience (Years)
                      </label>
                      <input
                        type="number"
                        name="experience"
                        min={0}
                        max={50}
                        value={formData.experience}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-800/60 border-gray-700/80 text-white'
                            : 'bg-white border-slate-300 text-slate-900 shadow-sm'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                        Specialization / Domain
                      </label>
                      <input
                        type="text"
                        name="specialization"
                        placeholder="e.g. AI & Machine Learning, VLSI"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-800/60 border-gray-700/80 text-white'
                            : 'bg-white border-slate-300 text-slate-900 shadow-sm'
                        }`}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        placeholder="e.g. +91 9876543210"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-800/60 border-gray-700/80 text-white'
                            : 'bg-white border-slate-300 text-slate-900 shadow-sm'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* 🛡️ COLLEGE ADMIN SPECIFIC FIELDS */}
                {role === 'college_admin' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                          Administrator Employee ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="employeeId"
                          placeholder="e.g. ADM-1001-05"
                          required
                          value={formData.employeeId}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode
                              ? 'bg-gray-800/60 border-gray-700/80 text-white'
                              : 'bg-white border-slate-300 text-slate-900 shadow-sm'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                          Administrative Hierarchy Level
                        </label>
                        <select
                          name="adminLevel"
                          value={formData.adminLevel}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode
                              ? 'bg-gray-800/60 border-gray-700/80 text-white'
                              : 'bg-white border-slate-300 text-slate-900 shadow-sm'
                          }`}
                        >
                          <option value="Super Admin">Super Admin (All Modules & RBAC Management)</option>
                          <option value="College Admin">College Admin (Standard Institutional Admin)</option>
                          <option value="Department Admin">Department Admin (Academic & Content)</option>
                          <option value="Exam Cell Admin">Exam Cell Admin / COE Admin</option>
                          <option value="Accounts Admin">Accounts & Finance Admin</option>
                          <option value="Library Admin">Library Manager / Admin</option>
                          <option value="HR Admin">HR / Leave Manager Admin</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                          Access Scope Level
                        </label>
                        <select
                          name="accessLevel"
                          value={formData.accessLevel}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode
                              ? 'bg-gray-800/60 border-gray-700/80 text-white'
                              : 'bg-white border-slate-300 text-slate-900 shadow-sm'
                          }`}
                        >
                          <option value="Full Access">Full Institutional Access</option>
                          <option value="Standard">Standard Operational Access</option>
                          <option value="Department Restricted">Department Restricted</option>
                          <option value="Read-Only">Read-Only Auditing</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                          Approval Authority
                        </label>
                        <select
                          name="approvalAuthority"
                          value={formData.approvalAuthority}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode
                              ? 'bg-gray-800/60 border-gray-700/80 text-white'
                              : 'bg-white border-slate-300 text-slate-900 shadow-sm'
                          }`}
                        >
                          <option value="Full Authority">Full Authority (Final Sign-off)</option>
                          <option value="Level 1 Approver">Level 1 Approver (Primary Review)</option>
                          <option value="Level 2 Approver">Level 2 Approver (Secondary Review)</option>
                          <option value="None">None (Processing only)</option>
                        </select>
                      </div>
                    </div>

                    {/* RBAC Permission Modules Grid */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">
                        Assigned RBAC Permission Scopes
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {RBAC_MODULES.map(m => {
                          const isChecked = (formData.adminRoles || []).includes(m.key);
                          return (
                            <div
                              key={m.key}
                              onClick={() => toggleRbacRole(m.key)}
                              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                                isChecked
                                  ? isDarkMode
                                    ? 'bg-purple-950/30 border-purple-500/50 text-white'
                                    : 'bg-purple-100 border-purple-400 text-purple-950 font-bold shadow-sm'
                                  : isDarkMode
                                  ? 'bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/60 text-gray-300'
                                  : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                              }`}
                            >
                              <div className={`mt-0.5 w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                                isChecked
                                  ? 'bg-purple-600 border-purple-600 text-white'
                                  : 'border-slate-400 dark:border-gray-500'
                              }`}>
                                {isChecked && <Check className="w-3 h-3" />}
                              </div>
                              <div className="flex-1">
                                <div className="text-xs font-black">{m.label}</div>
                                <div className={`text-[11px] mt-0.5 ${isChecked ? 'text-purple-900 dark:text-purple-300' : 'text-slate-500 dark:text-gray-400 font-medium'}`}>
                                  {m.desc}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                        Key Responsibilities & Administrative Notes (Optional)
                      </label>
                      <textarea
                        name="responsibilities"
                        rows={3}
                        placeholder="e.g. In charge of student enrollment verification and examination admit card release."
                        value={formData.responsibilities}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-800/60 border-gray-700/80 text-white placeholder:text-gray-500'
                            : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-sm'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Error / Feedback Notice */}
              {message.text && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-2xl flex items-center gap-3 border ${
                    message.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-green-400 font-bold'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-red-400 font-bold'
                  }`}
                >
                  {message.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                  <span className="text-sm">{message.text}</span>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={loading}
                  className={`px-6 py-3.5 rounded-xl text-xs font-bold transition-all border ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300'
                      : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Clear Form
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 px-6 rounded-xl font-bold text-sm text-white shadow-lg shadow-blue-500/25 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2 transform active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating {ROLE_CONFIGS[role].label} Account...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create {ROLE_CONFIGS[role].label} Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AccountCreationManager;