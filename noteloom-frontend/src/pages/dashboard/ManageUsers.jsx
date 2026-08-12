import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  AlertCircle,
  Edit,
  Trash2,
  UserPlus,
  Users,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Building,
  Check,
  Copy,
  Phone,
  Mail,
  UserCheck,
  UserX,
  Clock,
  Sparkles,
  ChevronRight,
  Filter,
  LayoutGrid,
  List,
  Eye,
  X,
  Wifi,
  LogOut,
  Shield,
  Layers,
  Key,
  RefreshCw
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
    label: 'Students',
    singleLabel: 'Student',
    icon: GraduationCap,
    color: 'from-blue-600 to-indigo-600',
    lightActive: 'bg-blue-600 text-white shadow-md shadow-blue-500/25 border-transparent',
    lightInactive: 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 text-slate-800 shadow-sm',
    description: 'Enrolled undergraduate and postgraduate student accounts'
  },
  faculty: {
    label: 'Faculty',
    singleLabel: 'Faculty',
    icon: Briefcase,
    color: 'from-emerald-600 to-teal-600',
    lightActive: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 border-transparent',
    lightInactive: 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 text-slate-800 shadow-sm',
    description: 'Academic professors, lecturers, and department instructors'
  },
  college_admin: {
    label: 'College Admins',
    singleLabel: 'College Admin',
    icon: ShieldCheck,
    color: 'from-purple-600 to-pink-600',
    lightActive: 'bg-purple-600 text-white shadow-md shadow-purple-500/25 border-transparent',
    lightInactive: 'bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50/30 text-slate-800 shadow-sm',
    description: 'Institutional administrators, department heads, and managers'
  }
};

const ManageUsers = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { user: sessionUser, profile: sessionProfile, clearSession } = useSessionManager();

  const [activeTab, setActiveTab] = useState('student'); // student, faculty, college_admin
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, suspended
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid, table
  const [selectedUserModal, setSelectedUserModal] = useState(null);
  const [copiedUid, setCopiedUid] = useState('');
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  const storedCollegeCode = localStorage.getItem('selectedCollegeCode') || '';
  const storedCollegeName = localStorage.getItem('selectedCollege') || sessionProfile?.college || 'NoteLoom Institution';

  // Fetch Users without blanking out UI
  const fetchUsers = async (tabToFetch = activeTab) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sessionToken');
      const res = await fetch(`${API_BASE}/api/college-admin/users/${tabToFetch}`, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(activeTab);
    setSearchQuery('');
    setStatusFilter('all');
    setSelectedDept('all');
    setSelectedBatch('all');
  }, [activeTab]);

  // Toggle Account Status
  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const token = localStorage.getItem('sessionToken');
      const res = await fetch(`${API_BASE}/api/college-admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, status: newStatus } : u));
        if (selectedUserModal?._id === userId) {
          setSelectedUserModal(prev => ({ ...prev, status: newStatus }));
        }
        setActionMessage({
          type: 'success',
          text: `Account marked as ${newStatus.toUpperCase()} successfully.`
        });
        setTimeout(() => setActionMessage({ type: '', text: '' }), 4000);
      }
    } catch (err) {
      console.error('Status toggle failed:', err);
      setActionMessage({ type: 'error', text: 'Failed to update account status.' });
    }
  };

  // Delete / Schedule Deletion
  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to schedule deletion for "${userName}"? The account will be suspended immediately and queued for permanent deletion in 30 days.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('sessionToken');
      const res = await fetch(`${API_BASE}/api/college-admin/users/${userId}`, {
        method: 'DELETE',
        headers: { ...(token && { Authorization: `Bearer ${token}` }) }
      });

      if (res.ok) {
        fetchUsers(activeTab);
        if (selectedUserModal?._id === userId) {
          setSelectedUserModal(null);
        }
        setActionMessage({
          type: 'success',
          text: `Account scheduled for deletion in 30 days.`
        });
        setTimeout(() => setActionMessage({ type: '', text: '' }), 4000);
      }
    } catch (err) {
      console.error('Delete failed:', err);
      setActionMessage({ type: 'error', text: 'Failed to schedule deletion.' });
    }
  };

  const handleCopyUid = (uid) => {
    if (!uid) return;
    navigator.clipboard.writeText(uid);
    setCopiedUid(uid);
    setTimeout(() => setCopiedUid(''), 2000);
  };

  const handleSignOut = async () => {
    await clearSession();
  };

  // Filtered List
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const searchStr = searchQuery.toLowerCase().trim();
      const prof = u.profile || {};

      const matchesSearch =
        !searchStr ||
        u.name?.toLowerCase().includes(searchStr) ||
        u.email?.toLowerCase().includes(searchStr) ||
        u.uid?.toLowerCase().includes(searchStr) ||
        u.noteloomId?.toLowerCase().includes(searchStr) ||
        prof.rollNo?.toLowerCase().includes(searchStr) ||
        prof.employeeId?.toLowerCase().includes(searchStr) ||
        prof.department?.toLowerCase().includes(searchStr) ||
        prof.stream?.toLowerCase().includes(searchStr);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && u.status === 'active' && !u.deletionScheduledAt) ||
        (statusFilter === 'suspended' && (u.status === 'suspended' || u.deletionScheduledAt));

      const matchesDept =
        selectedDept === 'all' ||
        (prof.department && prof.department === selectedDept) ||
        (prof.stream && prof.stream === selectedDept);

      const matchesBatch =
        selectedBatch === 'all' ||
        (prof.admissionYear && String(prof.admissionYear) === selectedBatch) ||
        (new Date(u.createdAt).getFullYear().toString() === selectedBatch);

      return matchesSearch && matchesStatus && matchesDept && matchesBatch;
    });
  }, [users, searchQuery, statusFilter, selectedDept, selectedBatch]);

  // Derived filters
  const departments = useMemo(() => {
    const depts = new Set();
    users.forEach(u => {
      const d = u.profile?.department || u.profile?.stream || u.department;
      if (d) depts.add(d);
    });
    return Array.from(depts).sort();
  }, [users]);

  const batches = useMemo(() => {
    const b = new Set();
    users.forEach(u => {
      if (u.profile?.admissionYear) b.add(String(u.profile.admissionYear));
      else if (u.createdAt) b.add(new Date(u.createdAt).getFullYear().toString());
    });
    return Array.from(b).sort().reverse();
  }, [users]);

  // Metrics
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.status === 'active' && !u.deletionScheduledAt).length;
    const suspended = users.filter(u => u.status === 'suspended' || u.deletionScheduledAt).length;
    return { total, active, suspended };
  }, [users]);

  const CurrentRoleIcon = ROLE_CONFIGS[activeTab].icon;

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col ${isDarkMode ? 'bg-[#0b0f17] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* ================= GLOBAL DASHBOARD HEADER ================= */}
      <GlassHeader variant="dashboard">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          {/* LEFT: User Profile, Role Badge, Status, College Context */}
          <div className="flex items-center space-x-4">
            <UserProfileDropdown user={sessionUser} onOptionClick={() => {}} />

            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span
                  className={`inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold ${
                    isDarkMode
                      ? 'bg-purple-600/90 text-white'
                      : 'bg-purple-100 text-purple-800 border border-purple-200'
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
                {sessionProfile?.college || storedCollegeName}
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
                  ? 'bg-gray-800 text-gray-300 hover:bg-red-600 hover:text-white border border-gray-700'
                  : 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </GlassHeader>

      {/* ================= MAIN CONTENT CONTAINER ================= */}
      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 pt-28 pb-16 w-full space-y-6">

        {/* Action Top Bar */}
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
              onClick={() => navigate('/dashboard/account-creation')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/25"
            >
              <UserPlus className="w-4 h-4" />
              + Create Account
            </button>
          </div>
        </div>

        {/* Title & Stats Hero Card */}
        <div className={`p-6 rounded-3xl border transition-all relative overflow-hidden ${
          isDarkMode ? 'bg-gray-900/60 border-gray-800 shadow-2xl' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  Account Management Directory
                </h1>
                <p className="text-xs text-slate-600 dark:text-gray-400 font-semibold mt-0.5">
                  Inspect student enrollments, faculty profiles, and administrative staff accounts across your institution.
                </p>
              </div>
            </div>

            {/* Quick KPI Stats Counter */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className={`px-4 py-2.5 rounded-2xl border text-center ${
                isDarkMode ? 'bg-gray-800/60 border-gray-700/60' : 'bg-blue-50/80 border-blue-200'
              }`}>
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-gray-400">Total {ROLE_CONFIGS[activeTab].label}</div>
                <div className="text-lg font-black text-blue-700 dark:text-blue-400 mt-0.5">{stats.total}</div>
              </div>
              <div className={`px-4 py-2.5 rounded-2xl border text-center ${
                isDarkMode ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
              }`}>
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Active Accounts</div>
                <div className="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{stats.active}</div>
              </div>
              <div className={`px-4 py-2.5 rounded-2xl border text-center ${
                isDarkMode ? 'bg-red-950/30 border-red-500/30' : 'bg-rose-50 border-rose-200'
              }`}>
                <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-red-400">Suspended / Pending</div>
                <div className="text-lg font-black text-rose-700 dark:text-red-400 mt-0.5">{stats.suspended}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Alert Notice */}
        <AnimatePresence>
          {actionMessage.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-2xl flex items-center justify-between border ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-green-400 font-bold'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-red-400 font-bold'
              }`}
            >
              <div className="flex items-center gap-3">
                {actionMessage.type === 'success' ? <UserCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span className="text-sm">{actionMessage.text}</span>
              </div>
              <button onClick={() => setActionMessage({ type: '', text: '' })} className="p-1 hover:opacity-70">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================= ROLE SELECTOR TABS (ALWAYS VISIBLE) ================= */}
        <div className={`p-3.5 rounded-2xl border backdrop-blur-xl ${
          isDarkMode ? 'bg-gray-900/60 border-gray-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(ROLE_CONFIGS).map(([key, config]) => {
              const Icon = config.icon;
              const isSelected = activeTab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
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
                    {config.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= SEARCH & ADVANCED FILTER CONTROLS ================= */}
        <div className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between ${
          isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${ROLE_CONFIGS[activeTab].label.toLowerCase()} by name, email, UID, ID, dept...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs font-semibold transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode
                  ? 'bg-gray-800/60 border-gray-700/80 text-white placeholder:text-gray-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-sm'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all outline-none ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-gray-300'
                  : 'bg-white border-slate-300 text-slate-800 shadow-sm hover:border-slate-400'
              }`}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended / Queued</option>
            </select>

            {/* Department Filter */}
            {departments.length > 0 && (
              <select
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
                className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all outline-none ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-300'
                    : 'bg-white border-slate-300 text-slate-800 shadow-sm hover:border-slate-400'
                }`}
              >
                <option value="all">All Departments</option>
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            )}

            {/* Batch Filter (Students) */}
            {activeTab === 'student' && batches.length > 0 && (
              <select
                value={selectedBatch}
                onChange={e => setSelectedBatch(e.target.value)}
                className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all outline-none ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-300'
                    : 'bg-white border-slate-300 text-slate-800 shadow-sm hover:border-slate-400'
                }`}
              >
                <option value="all">All Batches</option>
                {batches.map(b => (
                  <option key={b} value={b}>{b} Batch</option>
                ))}
              </select>
            )}

            {/* View Mode Toggle */}
            <div className={`flex items-center p-1 rounded-xl border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-slate-100 border-slate-300'
            }`}>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ================= USER DIRECTORY CONTENT ================= */}
        {loading ? (
          /* Smooth Skeleton Loaders (Keeps layout firm & steady) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`p-5 rounded-3xl border animate-pulse ${
                  isDarkMode ? 'bg-gray-900/60 border-gray-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-slate-200 dark:bg-gray-800" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 dark:bg-gray-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 dark:bg-gray-800/60 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-8 bg-slate-100 dark:bg-gray-800/40 rounded-xl mb-4" />
                <div className="space-y-2 py-2">
                  <div className="h-3 bg-slate-100 dark:bg-gray-800 rounded" />
                  <div className="h-3 bg-slate-100 dark:bg-gray-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className={`py-20 text-center rounded-3xl border ${
            isDarkMode ? 'bg-gray-900/40 border-gray-800 text-gray-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
          }`}>
            <div className="p-4 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl w-14 h-14 mx-auto flex items-center justify-center mb-3">
              <CurrentRoleIcon className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">No {ROLE_CONFIGS[activeTab].label} Found</h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 max-w-sm mx-auto font-medium">
              {searchQuery || statusFilter !== 'all' || selectedDept !== 'all' || selectedBatch !== 'all'
                ? 'No user records matched the selected query or filter criteria.'
                : `There are currently no ${ROLE_CONFIGS[activeTab].label.toLowerCase()} registered under your institutional tenant.`}
            </p>
            <button
              onClick={() => navigate('/dashboard/account-creation')}
              className="mt-5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md inline-flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Create First {ROLE_CONFIGS[activeTab].singleLabel}
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* ================= GRID CARDS VIEW ================= */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredUsers.map((u) => {
              const prof = u.profile || {};
              const isScheduled = !!u.deletionScheduledAt;
              const isActive = u.status === 'active' && !isScheduled;

              return (
                <motion.div
                  key={u._id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between group hover:shadow-lg relative overflow-hidden ${
                    isDarkMode
                      ? 'bg-gray-900/70 border-gray-800 hover:border-gray-700 shadow-lg'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  {/* Card Header: Avatar, Name, Status */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-md bg-gradient-to-br ${ROLE_CONFIGS[activeTab].color}`}>
                          {u.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm leading-snug text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {u.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-gray-400 font-medium line-clamp-1">{u.email}</p>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        isScheduled
                          ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-500/30'
                          : isActive
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                          : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                      }`}>
                        {isScheduled ? 'Deletion Queued' : u.status}
                      </span>
                    </div>

                    {/* UID Chip Box (Super clear contrast in white theme) */}
                    <div className={`mb-4 flex items-center justify-between p-2.5 rounded-xl border ${
                      isDarkMode
                        ? 'bg-black/30 border-blue-500/20 text-blue-400'
                        : 'bg-blue-50/70 border-blue-200 text-blue-800'
                    }`}>
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                        <span className="text-[10px] uppercase font-sans font-bold opacity-70">UID:</span>
                        <span className="tracking-wide">{u.noteloomId || u.uid}</span>
                      </div>
                      <button
                        onClick={() => handleCopyUid(u.noteloomId || u.uid)}
                        className={`p-1 rounded transition ${
                          isDarkMode
                            ? 'hover:bg-white/10 text-gray-400 hover:text-white'
                            : 'hover:bg-blue-100 text-blue-700 hover:text-blue-900'
                        }`}
                        title="Copy UID"
                      >
                        {copiedUid === (u.noteloomId || u.uid) ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-green-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Role Specific Attributes (Sharp & Deep Text in White Theme) */}
                    <div className="space-y-2 text-xs py-2 border-t border-slate-100 dark:border-gray-800">
                      {activeTab === 'student' && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 dark:text-gray-400 font-semibold">Roll / ID:</span>
                            <span className="font-bold text-slate-900 dark:text-gray-100">{prof.rollNo || '—'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 dark:text-gray-400 font-semibold">Program:</span>
                            <span className="font-bold text-slate-900 dark:text-gray-100">{prof.course || 'B.Tech'} ({prof.stream || 'General'})</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 dark:text-gray-400 font-semibold">Current Sem:</span>
                            <span className="font-bold text-slate-900 dark:text-gray-100">Sem {prof.currentSemester || '1'} ({prof.year || '1st'} Year)</span>
                          </div>
                        </>
                      )}

                      {activeTab === 'faculty' && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 dark:text-gray-400 font-semibold">Emp ID:</span>
                            <span className="font-bold text-slate-900 dark:text-gray-100">{prof.employeeId || '—'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 dark:text-gray-400 font-semibold">Designation:</span>
                            <span className="font-bold text-slate-900 dark:text-gray-100">{prof.designation || 'Instructor'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 dark:text-gray-400 font-semibold">Department:</span>
                            <span className="font-bold text-slate-900 dark:text-gray-100">{prof.department || u.department || 'Academic'}</span>
                          </div>
                        </>
                      )}

                      {activeTab === 'college_admin' && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 dark:text-gray-400 font-semibold">Admin Level:</span>
                            <span className="font-bold text-purple-700 dark:text-purple-400">{prof.adminLevel || 'College Admin'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 dark:text-gray-400 font-semibold">Emp ID:</span>
                            <span className="font-bold text-slate-900 dark:text-gray-100">{prof.employeeId || '—'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 dark:text-gray-400 font-semibold">Access Scope:</span>
                            <span className="font-bold text-slate-900 dark:text-gray-100">{prof.accessLevel || 'Full Access'}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Deletion Warning Banner if queued */}
                    {isScheduled && (
                      <div className="mt-3 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-500/30 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                        <span className="text-[10px] text-rose-800 dark:text-rose-300 font-bold">
                          Permanent Deletion: {new Date(u.deletionScheduledAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-gray-800">
                    <button
                      onClick={() => setSelectedUserModal(u)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                        isDarkMode
                          ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-sm'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Details
                    </button>

                    <button
                      onClick={() => handleStatusToggle(u._id, u.status)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? isDarkMode
                            ? 'bg-gray-800/80 text-gray-300 hover:bg-amber-600 hover:text-white border border-gray-700'
                            : 'bg-amber-50 text-amber-800 hover:bg-amber-600 hover:text-white border border-amber-300'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                      }`}
                    >
                      {isActive ? 'Suspend' : 'Activate'}
                    </button>

                    <button
                      onClick={() => handleDelete(u._id, u.name)}
                      className={`p-2 rounded-xl border transition-all ${
                        isDarkMode
                          ? 'bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border-red-500/20'
                          : 'bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border-rose-200'
                      }`}
                      title="Schedule Deletion"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* ================= TABLE VIEW ================= */
          <div className={`rounded-3xl border overflow-hidden shadow-sm ${
            isDarkMode ? 'bg-gray-900/70 border-gray-800' : 'bg-white border-slate-200'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`text-[11px] font-bold uppercase tracking-wider border-b ${
                  isDarkMode ? 'bg-gray-800/60 border-gray-800 text-gray-400' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}>
                  <tr>
                    <th className="p-4">User Details</th>
                    <th className="p-4">System UID</th>
                    <th className="p-4">{activeTab === 'student' ? 'Roll / Enrollment' : 'Employee ID'}</th>
                    <th className="p-4">{activeTab === 'student' ? 'Program & Stream' : activeTab === 'faculty' ? 'Designation & Dept' : 'Admin Level'}</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-slate-200'}`}>
                  {filteredUsers.map((u) => {
                    const prof = u.profile || {};
                    const isScheduled = !!u.deletionScheduledAt;
                    const isActive = u.status === 'active' && !isScheduled;

                    return (
                      <tr key={u._id} className={`transition-colors ${isDarkMode ? 'hover:bg-gray-800/40' : 'hover:bg-slate-50'}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white bg-gradient-to-br ${ROLE_CONFIGS[activeTab].color}`}>
                              {u.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-slate-900 dark:text-white">{u.name}</div>
                              <div className="text-slate-500 dark:text-gray-400 text-[11px] font-medium">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 font-mono font-bold text-blue-700 dark:text-blue-400">
                          <div className="flex items-center gap-1.5">
                            <span>{u.noteloomId || u.uid}</span>
                            <button
                              onClick={() => handleCopyUid(u.noteloomId || u.uid)}
                              className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-500 dark:text-gray-400 transition"
                              title="Copy UID"
                            >
                              {copiedUid === (u.noteloomId || u.uid) ? (
                                <Check className="w-3 h-3 text-emerald-600 dark:text-green-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="p-4 font-bold text-slate-900 dark:text-gray-100">
                          {prof.rollNo || prof.employeeId || '—'}
                        </td>

                        <td className="p-4">
                          {activeTab === 'student' && (
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white">{prof.course || 'B.Tech'}</span>
                              <span className="text-slate-600 dark:text-gray-400 ml-1 font-medium">({prof.stream || 'General'}) • Sem {prof.currentSemester || '1'}</span>
                            </div>
                          )}
                          {activeTab === 'faculty' && (
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white">{prof.designation || 'Instructor'}</span>
                              <span className="text-slate-600 dark:text-gray-400 ml-1 font-medium">({prof.department || 'Academic'})</span>
                            </div>
                          )}
                          {activeTab === 'college_admin' && (
                            <div>
                              <span className="font-bold text-purple-700 dark:text-purple-400">{prof.adminLevel || 'College Admin'}</span>
                              <span className="text-slate-600 dark:text-gray-400 ml-1 font-medium">({prof.accessLevel || 'Full Access'})</span>
                            </div>
                          )}
                        </td>

                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            isScheduled
                              ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-500/30'
                              : isActive
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                              : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                          }`}>
                            {isScheduled ? 'Queued' : u.status}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedUserModal(u)}
                              className={`p-2 rounded-xl border transition-all ${
                                isDarkMode
                                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                              }`}
                              title="View Profile Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleStatusToggle(u._id, u.status)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                isActive
                                  ? isDarkMode
                                    ? 'bg-gray-800 text-gray-300 hover:bg-amber-600 hover:text-white border border-gray-700'
                                    : 'bg-amber-50 text-amber-800 hover:bg-amber-600 hover:text-white border border-amber-300'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                              }`}
                            >
                              {isActive ? 'Suspend' : 'Activate'}
                            </button>

                            <button
                              onClick={() => handleDelete(u._id, u.name)}
                              className={`p-2 rounded-xl border transition-all ${
                                isDarkMode
                                  ? 'bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border-red-500/20'
                                  : 'bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border-rose-200'
                              }`}
                              title="Schedule Deletion"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ================= USER PROFILE DETAILS MODAL ================= */}
      <AnimatePresence>
        {selectedUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`w-full max-w-xl p-6 sm:p-8 rounded-3xl border shadow-2xl relative overflow-hidden ${
                isDarkMode ? 'bg-[#0f172a] border-gray-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              {/* Modal Close Button */}
              <button
                onClick={() => setSelectedUserModal(null)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-gray-500/10 hover:bg-slate-200 dark:hover:bg-gray-500/20 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg bg-gradient-to-br ${ROLE_CONFIGS[activeTab].color}`}>
                  {selectedUserModal.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedUserModal.name}</h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      selectedUserModal.status === 'active' && !selectedUserModal.deletionScheduledAt
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                        : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-500/30'
                    }`}>
                      {selectedUserModal.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 font-medium">{selectedUserModal.email}</p>
                </div>
              </div>

              {/* NoteLoom UID Card */}
              <div className={`p-4 mb-6 rounded-2xl border flex items-center justify-between ${
                isDarkMode ? 'bg-black/30 border-blue-500/20' : 'bg-blue-50/80 border-blue-200'
              }`}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">Institutional System UID</span>
                  <div className="text-lg font-mono font-black text-blue-800 dark:text-blue-300 mt-0.5">
                    {selectedUserModal.noteloomId || selectedUserModal.uid}
                  </div>
                </div>
                <button
                  onClick={() => handleCopyUid(selectedUserModal.noteloomId || selectedUserModal.uid)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isDarkMode
                      ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                  }`}
                >
                  {copiedUid === (selectedUserModal.noteloomId || selectedUserModal.uid) ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedUid === (selectedUserModal.noteloomId || selectedUserModal.uid) ? 'Copied!' : 'Copy UID'}
                </button>
              </div>

              {/* Attribute Breakdown */}
              <div className="space-y-3 text-xs mb-8">
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-slate-500 dark:text-gray-400 block text-[10px] uppercase font-bold">Role Type</span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white capitalize">{activeTab.replace('_', ' ')}</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-slate-500 dark:text-gray-400 block text-[10px] uppercase font-bold">Registered On</span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{new Date(selectedUserModal.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Student Specs */}
                {activeTab === 'student' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="text-slate-500 dark:text-gray-400 block text-[10px] uppercase font-bold">Roll / Enrollment No</span>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedUserModal.profile?.rollNo || '—'}</span>
                    </div>
                    <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="text-slate-500 dark:text-gray-400 block text-[10px] uppercase font-bold">Program & Stream</span>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedUserModal.profile?.course || 'B.Tech'} ({selectedUserModal.profile?.stream || 'General'})</span>
                    </div>
                    <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="text-slate-500 dark:text-gray-400 block text-[10px] uppercase font-bold">Semester & Year</span>
                      <span className="font-bold text-slate-900 dark:text-white">Semester {selectedUserModal.profile?.currentSemester || '1'} ({selectedUserModal.profile?.year || '1st'} Year)</span>
                    </div>
                    <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="text-slate-500 dark:text-gray-400 block text-[10px] uppercase font-bold">Phone Number</span>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedUserModal.phone || selectedUserModal.profile?.phoneNumber || '—'}</span>
                    </div>
                  </div>
                )}

                {/* Faculty Specs */}
                {activeTab === 'faculty' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="text-slate-500 dark:text-gray-400 block text-[10px] uppercase font-bold">Employee ID</span>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedUserModal.profile?.employeeId || '—'}</span>
                    </div>
                    <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="text-slate-500 dark:text-gray-400 block text-[10px] uppercase font-bold">Designation</span>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedUserModal.profile?.designation || 'Instructor'}</span>
                    </div>
                    <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="text-slate-500 dark:text-gray-400 block text-[10px] uppercase font-bold">Department</span>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedUserModal.profile?.department || selectedUserModal.department || 'Academic'}</span>
                    </div>
                    <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="text-slate-500 dark:text-gray-400 block text-[10px] uppercase font-bold">Qualification & Exp</span>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedUserModal.profile?.qualification || 'M.Tech'} • {selectedUserModal.profile?.experience || 0} yrs</span>
                    </div>
                  </div>
                )}

                {/* Admin Specs */}
                {activeTab === 'college_admin' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="text-slate-500 dark:text-gray-400 block text-[10px] uppercase font-bold">Employee ID</span>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedUserModal.profile?.employeeId || '—'}</span>
                    </div>
                    <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="text-slate-500 dark:text-gray-400 block text-[10px] uppercase font-bold">Admin Hierarchy</span>
                      <span className="font-bold text-purple-700 dark:text-purple-400">{selectedUserModal.profile?.adminLevel || 'College Admin'}</span>
                    </div>
                    <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="text-slate-500 dark:text-gray-400 block text-[10px] uppercase font-bold">Access Scope</span>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedUserModal.profile?.accessLevel || 'Full Access'}</span>
                    </div>
                    <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="text-slate-500 dark:text-gray-400 block text-[10px] uppercase font-bold">Approval Authority</span>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedUserModal.profile?.approvalAuthority || 'Full Authority'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-gray-800">
                <button
                  onClick={() => handleStatusToggle(selectedUserModal._id, selectedUserModal.status)}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition shadow-sm ${
                    selectedUserModal.status === 'active'
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {selectedUserModal.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
                </button>

                <button
                  onClick={() => handleDelete(selectedUserModal._id, selectedUserModal.name)}
                  className="px-4 py-3 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-300 dark:bg-red-600/10 dark:text-red-400 dark:border-red-500/20 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Schedule Deletion
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageUsers;