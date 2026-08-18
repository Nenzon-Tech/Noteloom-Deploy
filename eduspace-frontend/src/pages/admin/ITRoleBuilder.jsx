import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '@/utils/config';
import { Shield, Plus, Trash2, Edit2, Globe, School, Check, AlertCircle, Layers, Award, Tag } from 'lucide-react';
import { useErrorPopup } from '@/context/ErrorPopupContext.jsx';

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

export default function ITRoleBuilder() {
  const { triggerPopup } = useErrorPopup();
  const [seededRoles, setSeededRoles] = useState([]);
  const [globalCustomRoles, setGlobalCustomRoles] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [collegeAvailableRoles, setCollegeAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showGlobalModal, setShowGlobalModal] = useState(false);
  const [showCollegeRoleModal, setShowCollegeRoleModal] = useState(false);
  const [showEditLabelModal, setShowEditLabelModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [newRoleLabel, setNewRoleLabel] = useState('');

  const [formData, setFormData] = useState({
    key: '',
    label: '',
    description: '',
    defaultPermissions: [],
    restrictToTenants: []
  });

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('itSessionToken')}` }
  });

  const loadGlobalRoles = async () => {
    try {
      const [gRes, colRes] = await Promise.all([
        axios.get(`${API_BASE}/it-admin/global-roles`, getAuthHeaders()),
        axios.get(`${API_BASE}/it-admin/colleges`, getAuthHeaders())
      ]);
      setSeededRoles(gRes.data.seededRoles || []);
      setGlobalCustomRoles(gRes.data.customRoles || []);
      setColleges(colRes.data || []);
      if (colRes.data && colRes.data.length > 0 && !selectedCollegeId) {
        setSelectedCollegeId(colRes.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      triggerPopup('Failed to fetch custom roles', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCollegeRoles = async (tenantId) => {
    if (!tenantId) return;
    try {
      const res = await axios.get(`${API_BASE}/it-admin/colleges/${tenantId}/custom-roles`, getAuthHeaders());
      const customCollegeRoles = res.data || [];
      
      const allForCollege = [
        ...seededRoles.map(r => ({ ...r, origin: 'Seeded System', isSeeded: true, assignmentType: 'default_assignment' })),
        ...globalCustomRoles.map(r => ({ 
          ...r, 
          origin: 'Global Template', 
          isSeeded: false, 
          assignmentType: (r.restrictToTenants && r.restrictToTenants.length > 0) ? 'custom_assignment' : 'default_assignment' 
        })),
        ...customCollegeRoles.map(r => ({ ...r, origin: 'College Specific', isSeeded: false, assignmentType: 'custom_assignment' }))
      ];

      setCollegeAvailableRoles(allForCollege);
    } catch (error) {
      console.error('Error fetching college custom roles:', error);
    }
  };

  useEffect(() => {
    loadGlobalRoles();
  }, []);

  useEffect(() => {
    if (selectedCollegeId) {
      loadCollegeRoles(selectedCollegeId);
    }
  }, [selectedCollegeId, seededRoles, globalCustomRoles]);

  const handleCreateGlobalRole = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/it-admin/global-roles`, formData, getAuthHeaders());
      triggerPopup('Global role created successfully!', 'success');
      setShowGlobalModal(false);
      setFormData({ key: '', label: '', description: '', defaultPermissions: [], restrictToTenants: [] });
      loadGlobalRoles();
    } catch (error) {
      triggerPopup(error.response?.data?.error || 'Failed to create global role', 'error');
    }
  };

  const handleDeleteGlobalRole = async (key) => {
    if (!window.confirm(`Delete global role "${key}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/it-admin/global-roles/${key}`, getAuthHeaders());
      triggerPopup('Global role deleted successfully!', 'success');
      loadGlobalRoles();
    } catch (error) {
      triggerPopup(error.response?.data?.error || 'Failed to delete role', 'error');
    }
  };

  const handleCreateCollegeCustomRole = async (e) => {
    e.preventDefault();
    if (!selectedCollegeId) return;
    try {
      await axios.post(`${API_BASE}/it-admin/colleges/${selectedCollegeId}/custom-roles`, formData, getAuthHeaders());
      triggerPopup('College-specific custom role created!', 'success');
      setShowCollegeRoleModal(false);
      setFormData({ key: '', label: '', description: '', defaultPermissions: [], restrictToTenants: [] });
      loadCollegeRoles(selectedCollegeId);
    } catch (error) {
      triggerPopup(error.response?.data?.error || 'Failed to create custom role', 'error');
    }
  };

  const handleDeleteCollegeCustomRole = async (roleKey) => {
    if (!window.confirm(`Delete college custom role "${roleKey}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/it-admin/colleges/${selectedCollegeId}/custom-roles/${roleKey}`, getAuthHeaders());
      triggerPopup('College custom role deleted successfully!', 'success');
      loadCollegeRoles(selectedCollegeId);
    } catch (error) {
      triggerPopup(error.response?.data?.error || 'Failed to delete role', 'error');
    }
  };

  const handleUpdateRoleLabel = async (e) => {
    e.preventDefault();
    if (!selectedCollegeId || !editingRole || !newRoleLabel.trim()) return;
    try {
      await axios.patch(
        `${API_BASE}/it-admin/colleges/${selectedCollegeId}/custom-roles/${editingRole.key}/label`,
        { label: newRoleLabel.trim() },
        getAuthHeaders()
      );
      triggerPopup(`Role name updated to "${newRoleLabel.trim()}" for this college!`, 'success');
      setShowEditLabelModal(false);
      setEditingRole(null);
      loadCollegeRoles(selectedCollegeId);
    } catch (error) {
      triggerPopup(error.response?.data?.error || 'Failed to update role name', 'error');
    }
  };

  const togglePermission = (key) => {
    const current = formData.defaultPermissions;
    if (current.includes(key)) {
      setFormData({ ...formData, defaultPermissions: current.filter(k => k !== key) });
    } else {
      setFormData({ ...formData, defaultPermissions: [...current, key] });
    }
  };

  return (
    <div className="space-y-8">
      
      {/* SECTION 1: GLOBAL ROLE TEMPLATES */}
      <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-700/60 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Global System & Custom Role Templates</span>
                <span className="px-2.5 py-0.5 text-xs bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-full font-semibold">
                  GLOBAL TEMPLATES
                </span>
              </h2>
              <p className="text-sm text-gray-400">
                Baseline role templates available across all colleges when onboarding or configuring access levels.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setFormData({ key: '', label: '', description: '', defaultPermissions: [], restrictToTenants: [] });
              setShowGlobalModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Global Role</span>
          </button>
        </div>

        {/* Roles Grid (Seeded + Custom Global Roles) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Seeded Roles */}
          {seededRoles.map(role => (
            <div key={role.key} className="bg-gray-900/60 p-5 rounded-xl border border-amber-500/30 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <span>{role.label}</span>
                    <span className="px-2 py-0.5 text-[10px] bg-amber-900/50 text-amber-300 border border-amber-500/40 rounded font-bold">
                      SEEDED
                    </span>
                  </h4>
                  <span className="text-xs font-mono text-gray-400">Key: {role.key}</span>
                </div>
              </div>
              <p className="text-xs text-gray-300">{role.description}</p>
            </div>
          ))}

          {/* Custom Global Roles */}
          {globalCustomRoles.map(role => (
            <div key={role.key} className="bg-gray-900/60 p-5 rounded-xl border border-purple-500/30 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <span>{role.label}</span>
                    <span className="px-2 py-0.5 text-[10px] bg-purple-900/50 text-purple-300 border border-purple-500/40 rounded font-bold">
                      GLOBAL CUSTOM
                    </span>
                  </h4>
                  <span className="text-xs font-mono text-gray-400">Key: {role.key}</span>
                </div>
                <button
                  onClick={() => handleDeleteGlobalRole(role.key)}
                  className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-800 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-300">{role.description || 'No description provided.'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: COLLEGE-SPECIFIC ROLE CONFIGURATION & ASSIGNMENTS */}
      <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-700/60 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
              <School className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>College Role Assignments & Customizations</span>
                <span className="px-2.5 py-0.5 text-xs bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded-full font-semibold">
                  COLLEGE SPECIFIC
                </span>
              </h2>
              <p className="text-sm text-gray-400">
                View assigned roles and customize role names specifically for the selected institution.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedCollegeId}
              onChange={e => setSelectedCollegeId(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-gray-900 text-white border border-gray-700 text-sm focus:outline-none"
            >
              {colleges.map(c => (
                <option key={c._id} value={c._id}>{c.name} ({c.collegeCode})</option>
              ))}
            </select>

            <button
              disabled={!selectedCollegeId}
              onClick={() => {
                setFormData({ key: '', label: '', description: '', defaultPermissions: [], restrictToTenants: [] });
                setShowCollegeRoleModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Create College Role</span>
            </button>
          </div>
        </div>

        {/* Roles List for Selected College */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collegeAvailableRoles.map(role => {
            const isSeeded = role.isSeeded;
            const isCollegeCustom = role.origin === 'College Specific';
            const isDefaultAssigned = role.assignmentType === 'default_assignment';

            return (
              <div key={role.key} className="bg-gray-900/60 p-5 rounded-xl border border-gray-700/50 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                      <span>{role.label}</span>
                      {isSeeded && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-amber-900/50 text-amber-300 border border-amber-500/40 rounded font-bold">
                          SEEDED
                        </span>
                      )}
                      {isCollegeCustom && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-blue-900/50 text-blue-300 border border-blue-500/40 rounded font-bold">
                          COLLEGE SPECIFIC
                        </span>
                      )}
                    </h4>
                    <span className="text-xs font-mono text-gray-400">Key: {role.key}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* EDIT NAME BUTTON FOR ALL ROLES */}
                    <button
                      onClick={() => {
                        setEditingRole(role);
                        setNewRoleLabel(role.label);
                        setShowEditLabelModal(true);
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-400 rounded-lg hover:bg-gray-800 transition-all"
                      title="Edit role name for this college"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {isCollegeCustom && (
                      <button
                        onClick={() => handleDeleteCollegeCustomRole(role.key)}
                        className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-800 transition-all"
                        title="Delete college custom role"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Assignment Status Badge */}
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                    isDefaultAssigned 
                      ? 'bg-emerald-900/40 text-emerald-300 border-emerald-500/40' 
                      : 'bg-blue-900/40 text-blue-300 border-blue-500/40'
                  }`}>
                    {isDefaultAssigned ? 'DEFAULT ASSIGNMENT' : 'CUSTOM ASSIGNMENT'}
                  </span>
                </div>

                <p className="text-xs text-gray-300">{role.description || 'No description provided.'}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: EDIT ROLE DISPLAY NAME */}
      {showEditLabelModal && editingRole && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 w-full max-w-md rounded-2xl shadow-xl p-6 border border-gray-700 space-y-4">
            <h3 className="text-lg font-bold text-white">Edit Role Display Name</h3>
            <p className="text-xs text-gray-400">
              Customize how <span className="text-blue-400 font-mono">{editingRole.key}</span> is named for this college.
            </p>

            <form onSubmit={handleUpdateRoleLabel} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Role Name / Label</label>
                <input
                  type="text"
                  required
                  value={newRoleLabel}
                  onChange={e => setNewRoleLabel(e.target.value)}
                  placeholder="e.g. Examination & Evaluation Cell"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditLabelModal(false);
                    setEditingRole(null);
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save Custom Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE GLOBAL ROLE */}
      {showGlobalModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 w-full max-w-lg rounded-2xl shadow-xl p-6 border border-gray-700 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">Create Global Custom Role Template</h3>
            <form onSubmit={handleCreateGlobalRole} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Role Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Principal's Office"
                  value={formData.label}
                  onChange={e => setFormData({ ...formData, label: e.target.value, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Role Key (Slug)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. principal_office"
                  value={formData.key}
                  onChange={e => setFormData({ ...formData, key: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Brief description of permissions..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Default Tab Permissions</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-800 rounded-xl">
                  {DASHBOARD_TABS.map(t => {
                    const isChecked = formData.defaultPermissions.includes(t.key);
                    return (
                      <label
                        key={t.key}
                        onClick={() => togglePermission(t.key)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer select-none border ${
                          isChecked ? 'border-purple-500 bg-purple-950/40 text-purple-300 font-semibold' : 'border-gray-800 text-gray-400'
                        }`}
                      >
                        <Check className={`w-3.5 h-3.5 ${isChecked ? 'opacity-100' : 'opacity-0'}`} />
                        <span>{t.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowGlobalModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white"
                >
                  Create Global Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE COLLEGE CUSTOM ROLE */}
      {showCollegeRoleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 w-full max-w-lg rounded-2xl shadow-xl p-6 border border-gray-700 space-y-4">
            <h3 className="text-lg font-bold text-white">Create College-Specific Role</h3>
            <form onSubmit={handleCreateCollegeCustomRole} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Role Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dean of Students"
                  value={formData.label}
                  onChange={e => setFormData({ ...formData, label: e.target.value, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Role Key (Slug)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. dean_students"
                  value={formData.key}
                  onChange={e => setFormData({ ...formData, key: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Brief description..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowCollegeRoleModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create College Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
