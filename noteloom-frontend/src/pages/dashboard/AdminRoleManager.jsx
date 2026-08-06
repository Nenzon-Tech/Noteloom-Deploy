import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Shield, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  UserPlus, 
  Edit2, 
  Trash2, 
  Check, 
  AlertCircle, 
  Layers, 
  CheckSquare, 
  Square,
  Key,
  Users,
  Settings,
  Wifi,
  ArrowLeft
} from 'lucide-react';
import { API_BASE } from '@/utils/config';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useSessionManager } from '@/hooks/useSessionManager.js';
import { useErrorPopup } from '@/context/ErrorPopupContext.jsx';
import GlassHeader from '@/components/common/GlassHeader.jsx';
import CollegeDashboardFooter from '@/components/features/dashboard/CollegeDashboardFooter.jsx';
import CollegeBannerLogo from '@/components/common/CollegeBannerLogo.jsx';
import ThemeToggle from '@/components/common/ThemeToggle.jsx';
import UserProfileDropdown from '@/components/common/UserProfileDropdown.jsx';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const DASHBOARD_TABS = [
  { key: 'accounts', label: 'Accounts & Fees' },
  { key: 'coe', label: 'COE / Exams' },
  { key: 'academic', label: 'Academic & Depts' },
  { key: 'library', label: 'Library' },
  { key: 'hr', label: 'HR & Leaves' },
  { key: 'lms', label: 'LMS / Content' },
  { key: 'timetable', label: 'Timetable & Routines' },
  { key: 'notices', label: 'Notice Board' },
  { key: 'attendance', label: 'Attendance' }
];

export default function AdminRoleManager() {
  const { isDarkMode } = useTheme();
  const { user, profile, loading: sessionLoading, clearSession } = useSessionManager();
  const { triggerPopup } = useErrorPopup();
  const navigate = useNavigate();

  const [activeSubTab, setActiveSubTab] = useState('admins'); // 'admins' | 'matrix'
  const [admins, setAdmins] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [roleTabConfig, setRoleTabConfig] = useState({});
  const [isLocked, setIsLocked] = useState(false);
  const [lockedAt, setLockedAt] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    adminRoles: ['super_admin']
  });

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('sessionToken')}` }
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [adminsRes, rolesRes, configRes] = await Promise.all([
        axios.get(`${API_BASE}/api/college-admin/admin-roles`, getAuthHeaders()),
        axios.get(`${API_BASE}/api/college-admin/available-roles`, getAuthHeaders()),
        axios.get(`${API_BASE}/api/college-admin/role-tab-config`, getAuthHeaders())
      ]);

      setAdmins(adminsRes.data || []);
      setAvailableRoles(rolesRes.data || []);
      setRoleTabConfig(configRes.data.roleTabConfig || {});
      setIsLocked(configRes.data.isLocked || false);
      setLockedAt(configRes.data.lockedAt || null);
    } catch (error) {
      console.error('Failed to load RBAC data:', error);
      triggerPopup(error.response?.data?.error || 'Failed to load permissions data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSignOut = () => {
    clearSession();
    const savedCode = localStorage.getItem('collegeCode');
    navigate(savedCode ? `/login?code=${savedCode}` : '/college-selection');
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (isLocked) {
      triggerPopup('Configuration is locked! Unlock it before adding or assigning admins.', 'error');
      return;
    }
    try {
      await axios.post(`${API_BASE}/api/college-admin/admin-roles`, formData, getAuthHeaders());
      triggerPopup('Admin user assigned successfully!', 'success');
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: '', adminRoles: ['super_admin'] });
      loadData();
    } catch (error) {
      triggerPopup(error.response?.data?.error || 'Failed to assign admin', 'error');
    }
  };

  const handleUpdateRoles = async (e) => {
    e.preventDefault();
    if (isLocked) {
      triggerPopup('Configuration is locked! Unlock it before modifying admin roles.', 'error');
      return;
    }
    if (!selectedUser) return;
    try {
      await axios.patch(
        `${API_BASE}/api/college-admin/admin-roles/${selectedUser._id}`,
        { adminRoles: formData.adminRoles },
        getAuthHeaders()
      );
      triggerPopup('Admin roles updated successfully!', 'success');
      setShowEditModal(false);
      setSelectedUser(null);
      loadData();
    } catch (error) {
      triggerPopup(error.response?.data?.error || 'Failed to update roles', 'error');
    }
  };

  const handleRemoveAdmin = async (userId) => {
    if (isLocked) {
      triggerPopup('Configuration is locked! Unlock it before removing admin access.', 'error');
      return;
    }
    if (!window.confirm('Are you sure you want to revoke admin access for this user?')) return;
    try {
      await axios.delete(`${API_BASE}/api/college-admin/admin-roles/${userId}`, getAuthHeaders());
      triggerPopup('Admin access revoked!', 'success');
      loadData();
    } catch (error) {
      triggerPopup(error.response?.data?.error || 'Failed to remove admin', 'error');
    }
  };

  const handleToggleTabPermission = (roleKey, tabKey) => {
    if (isLocked) {
      triggerPopup('Configuration is locked! Unlock it first to make changes.', 'error');
      return;
    }

    const currentTabs = roleTabConfig[roleKey] || [];
    const updatedTabs = currentTabs.includes(tabKey)
      ? currentTabs.filter(t => t !== tabKey)
      : [...currentTabs, tabKey];

    setRoleTabConfig({
      ...roleTabConfig,
      [roleKey]: updatedTabs
    });
  };

  const handleSaveMatrix = async () => {
    if (isLocked) {
      triggerPopup('Configuration is locked! Unlock it before saving changes.', 'error');
      return;
    }
    try {
      await axios.put(`${API_BASE}/api/college-admin/role-tab-config`, { roleTabConfig }, getAuthHeaders());
      triggerPopup('Tab visibility matrix saved successfully!', 'success');
    } catch (error) {
      triggerPopup(error.response?.data?.error || 'Failed to save configuration', 'error');
    }
  };

  const handleToggleLock = async () => {
    const action = isLocked ? 'unlock' : 'lock';
    try {
      const res = await axios.post(`${API_BASE}/api/college-admin/role-tab-config/${action}`, {}, getAuthHeaders());
      setIsLocked(res.data.isLocked);
      setLockedAt(res.data.lockedAt || null);
      triggerPopup(res.data.message || `Configuration ${action}ed successfully!`, 'success');
    } catch (error) {
      triggerPopup(error.response?.data?.error || `Failed to ${action} configuration`, 'error');
    }
  };

  const toggleFormRoleSelection = (roleKey) => {
    if (isLocked) {
      triggerPopup('Configuration is locked! Unlock to modify role selection.', 'error');
      return;
    }
    const current = formData.adminRoles;
    if (current.includes(roleKey)) {
      if (current.length === 1) return; // Must have at least 1
      setFormData({ ...formData, adminRoles: current.filter(r => r !== roleKey) });
    } else {
      setFormData({ ...formData, adminRoles: [...current, roleKey] });
    }
  };

  if (sessionLoading || loading) {
    return <LoadingSpinner text="Loading Admin RBAC Manager..." />;
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* ================= HEADER ================= */}
      <GlassHeader variant="dashboard">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          {/* LEFT */}
          <div className="flex items-center space-x-4">
            <UserProfileDropdown user={user} onOptionClick={() => {}} />

            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium ${
                  isDarkMode ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-700"
                }`}>
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  College Admin
                </span>

                <span className="text-xs text-green-500 flex items-center">
                  <Wifi className="w-3 h-3 mr-1" />
                  Active
                </span>
              </div>

              <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {profile?.college || 'College Portal'}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center space-x-4">
            <CollegeBannerLogo />
            <ThemeToggle />

            <button
              onClick={handleSignOut}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                isDarkMode
                  ? "bg-gray-700/70 text-white hover:bg-gray-600"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
            >
              Sign Out
            </button>
          </div>
        </div>
      </GlassHeader>

      {/* DASHBOARD MAIN CONTENT */}
      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 pt-28 pb-12 w-full space-y-6">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        {/* Title Header Card */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-xl">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Role & Permission Manager</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Configure role access levels, assign multi-role permissions to college staff, and manage feature tab visibility.
                </p>
              </div>
            </div>
          </div>

          {/* Lock / Unlock Toggle Button */}
          <button
            onClick={handleToggleLock}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm ${
              isLocked
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isLocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            <span>{isLocked ? 'Unlock Configuration' : 'Lock Configuration'}</span>
          </button>
        </div>

        {/* Lock Banner Status */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
          isLocked
            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200'
            : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
        }`}>
          <div className="flex items-center gap-3">
            {isLocked ? <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" /> : <Unlock className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0" />}
            <div>
              <h4 className="font-semibold text-sm">
                {isLocked ? '🔒 Tab & Role Configuration is Currently Locked' : '🔓 Configuration is Unlocked'}
              </h4>
              <p className="text-xs opacity-90">
                {isLocked
                  ? `Locked on ${lockedAt ? new Date(lockedAt).toLocaleString() : 'recently'}. All admin role assignments and matrix edits are disabled until unlocked.`
                  : 'Configuration is unlocked. You can assign roles, edit permissions, and toggle tab visibility matrix.'}
              </p>
            </div>
          </div>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveSubTab('admins')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all ${
              activeSubTab === 'admins'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>College Admin Accounts ({admins.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('matrix')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all ${
              activeSubTab === 'matrix'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Tab Visibility Matrix</span>
          </button>
        </div>

        {/* TAB 1: ADMIN ACCOUNTS LIST */}
        {activeSubTab === 'admins' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assigned College Admins</h3>
              <button
                disabled={isLocked}
                title={isLocked ? "Locked: Unlock configuration to add admins" : "Add or Assign Admin"}
                onClick={() => {
                  if (isLocked) {
                    triggerPopup('Configuration is locked! Unlock it to add or assign admin roles.', 'error');
                    return;
                  }
                  setFormData({ name: '', email: '', password: '', adminRoles: ['super_admin'] });
                  setShowAddModal(true);
                }}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all shadow-sm ${
                  isLocked
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Add / Assign Admin</span>
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Admin User</th>
                    <th className="px-6 py-4">Assigned Roles</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {admins.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                        No admin users found for this college.
                      </td>
                    </tr>
                  ) : (
                    admins.map((admin) => (
                      <tr key={admin._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-all">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900 dark:text-white">{admin.name}</div>
                          <div className="text-xs text-gray-500">{admin.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {admin.adminRoles.map((roleKey) => {
                              const rDef = availableRoles.find(r => r.key === roleKey);
                              return (
                                <span
                                  key={roleKey}
                                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${
                                    roleKey === 'super_admin'
                                      ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-300'
                                      : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300'
                                  }`}
                                >
                                  {rDef ? rDef.label : roleKey}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            admin.status === 'active' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                          }`}>
                            {admin.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            disabled={isLocked}
                            onClick={() => {
                              if (isLocked) {
                                triggerPopup('Configuration is locked! Unlock it to edit admin roles.', 'error');
                                return;
                              }
                              setSelectedUser(admin);
                              setFormData({
                                name: admin.name,
                                email: admin.email,
                                password: '',
                                adminRoles: admin.adminRoles || ['super_admin']
                              });
                              setShowEditModal(true);
                            }}
                            className={`p-2 rounded-lg transition-all ${
                              isLocked 
                                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                            }`}
                            title={isLocked ? "Locked: Unlock configuration to edit" : "Edit Roles"}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            disabled={isLocked}
                            onClick={() => handleRemoveAdmin(admin._id)}
                            className={`p-2 rounded-lg transition-all ${
                              isLocked 
                                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30'
                            }`}
                            title={isLocked ? "Locked: Unlock configuration to remove admin" : "Revoke Admin Access"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: TAB VISIBILITY MATRIX */}
        {activeSubTab === 'matrix' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Role → Feature Access Matrix</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Toggle which dashboard sections each role is permitted to see.</p>
              </div>
              <button
                onClick={handleSaveMatrix}
                disabled={isLocked}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm ${
                  isLocked
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Save Matrix Changes</span>
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 uppercase text-xs border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 min-w-[240px]">Role Name</th>
                    {DASHBOARD_TABS.map(tab => (
                      <th key={tab.key} className="px-4 py-4 text-center min-w-[120px]">
                        {tab.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {availableRoles.map(role => {
                    const defaultForRole = role.defaultPermissions && role.defaultPermissions.length > 0 
                      ? role.defaultPermissions 
                      : (role.key !== 'super_admin' ? [role.key] : DASHBOARD_TABS.map(t => t.key));

                    const permittedTabs = roleTabConfig[role.key] !== undefined 
                      ? roleTabConfig[role.key] 
                      : defaultForRole;

                    const isSuper = role.key === 'super_admin';
                    const isSeededRole = role.isSeeded || role.isBuiltIn;

                    return (
                      <tr key={role.key} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-all">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                            <span>{role.label}</span>
                            {isSeededRole && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-bold rounded">
                                SEEDED
                              </span>
                            )}
                            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${
                              role.assignmentType === 'default_assignment' 
                                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-300' 
                                : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300'
                            }`}>
                              {role.assignmentType === 'default_assignment' ? 'DEFAULT ASSIGNMENT' : 'CUSTOM ASSIGNMENT'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[240px] mt-0.5">{role.description}</div>
                        </td>

                        {DASHBOARD_TABS.map(tab => {
                          const isChecked = isSuper || permittedTabs.includes(tab.key);

                          return (
                            <td key={tab.key} className="px-4 py-4 text-center">
                              <button
                                disabled={isLocked || isSuper}
                                onClick={() => handleToggleTabPermission(role.key, tab.key)}
                                className={`p-1.5 rounded-lg transition-all ${
                                  isChecked
                                    ? 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30'
                                    : 'text-gray-300 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                                } ${isLocked || isSuper ? 'cursor-not-allowed opacity-80' : ''}`}
                              >
                                {isChecked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL: ADD / ASSIGN ADMIN */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add / Assign College Admin</h3>

              <form onSubmit={handleAddAdmin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    disabled={isLocked}
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dr. Robert Smith"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    disabled={isLocked}
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@college.edu"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Password (For New Users)</label>
                  <input
                    type="password"
                    disabled={isLocked}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Leave blank if user already exists"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">Select Admin Roles (Multiple Allowed)</label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-xl">
                    {availableRoles.map(role => {
                      const isChecked = formData.adminRoles.includes(role.key);
                      return (
                        <label
                          key={role.key}
                          onClick={() => toggleFormRoleSelection(role.key)}
                          className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                            isChecked
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold'
                              : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                          } ${isLocked ? 'cursor-not-allowed opacity-60' : ''}`}
                        >
                          {isChecked ? <CheckSquare className="w-4 h-4 text-purple-600" /> : <Square className="w-4 h-4 text-gray-400" />}
                          <span>{role.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLocked}
                    className="px-5 py-2 rounded-xl text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Admin
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: EDIT ROLES */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Admin Roles: {formData.name}</h3>

              <form onSubmit={handleUpdateRoles} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">Assigned Roles</label>
                  <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-xl">
                    {availableRoles.map(role => {
                      const isChecked = formData.adminRoles.includes(role.key);
                      return (
                        <label
                          key={role.key}
                          onClick={() => toggleFormRoleSelection(role.key)}
                          className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                            isChecked
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold'
                              : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                          } ${isLocked ? 'cursor-not-allowed opacity-60' : ''}`}
                        >
                          {isChecked ? <CheckSquare className="w-4 h-4 text-purple-600" /> : <Square className="w-4 h-4 text-gray-400" />}
                          <span>{role.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLocked}
                    className="px-5 py-2 rounded-xl text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Update Roles
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <CollegeDashboardFooter />
    </div>
  );
}
