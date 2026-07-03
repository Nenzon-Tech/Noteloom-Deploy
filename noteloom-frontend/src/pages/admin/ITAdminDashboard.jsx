import { API_BASE } from '@/utils/config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Shield, School, Plus, CheckCircle, AlertCircle, Wifi, Users, Settings, Trash2 } from "lucide-react";
import { useTheme } from '@/context/ThemeContext.jsx';
import { useITSessionManager } from '@/hooks/useITSessionManager.js';
import GlassHeader from '@/components/common/GlassHeader.jsx';
import ITDashboardFooter from '@/components/features/dashboard/ITDashboardFooter.jsx';
import CollegeBannerLogo from '@/components/common/CollegeBannerLogo.jsx';
import ThemeToggle from '@/components/common/ThemeToggle.jsx';
import UserProfileDropdown from '@/components/common/UserProfileDropdown.jsx';



const ITAdminDashboard = () => {
  const { isDarkMode } = useTheme();
  const { itUser, loading, isSessionValid, clearITSession } = useITSessionManager();
  const navigate = useNavigate();

  // --- STATE ---
  const [activeTab, setActiveTab] = useState('overview');
  const [colleges, setColleges] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [itUsers, setItUsers] = useState([]);

  
    // --- NEW STATE FOR EDITING ---
  const [editingCollege, setEditingCollege] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Requests State
  const [collegeRequests, setCollegeRequests] = useState([
    {
      _id: '1',
      collegeName: 'Indian Institute of Technology, Bombay',
      adminName: 'Dr. Rajesh Kumar',
      adminEmail: 'admin.rajesh@iitb.ac.in',
      requestDate: new Date('2025-10-01'),
      status: 'pending',
      message: 'We would like to integrate Note Loom for our Computer Science department.'
    },
    {
      _id: '2',
      collegeName: 'Delhi Technological University',
      adminName: 'Prof. Priya Sharma',
      adminEmail: 'priya.admin@dtu.ac.in',
      requestDate: new Date('2025-10-03'),
      status: 'pending',
      message: 'Requesting access for Engineering and Management faculties.'
    }
  ]);

  const [managerRequests, setManagerRequests] = useState([
    {
      _id: '1',
      name: 'Amit Singh',
      email: 'amit.singh@noteloom.in',
      requestDate: new Date('2025-09-28'),
      status: 'pending',
      experience: '5 years in EdTech',
      reason: 'I want to help manage college onboarding.'
    },
    {
      _id: '2',
      name: 'Kavya Patel',
      email: 'kavya.patel@noteloom.in',
      requestDate: new Date('2025-10-02'),
      status: 'pending',
      experience: '3 years in Educational Management',
      reason: 'Looking to contribute to platform development.'
    }
  ]);

  // Form State
  const [newCollegeData, setNewCollegeData] = useState({
  name: '', logoUrl: '', location: '', category: 'Engineering', featured: false, adminName: '', adminEmail: '', adminPassword: ''
});

  // --- DATA FETCHING ---
  const fetchColleges = async () => {
    try {
      const response = await fetch(`${API_BASE}/it-admin/colleges`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('itSessionToken')}` }
      });
      if (response.ok) {
        setColleges(await response.json());
      }
    } catch (error) { console.error("Error fetching colleges", error); }
  };

  const fetchITUsers = async () => {
    if (itUser?.role !== 'noteloom_admin') return;
    try {
      const response = await fetch(`${API_BASE}/it-admin/users`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('itSessionToken')}` },
      });
      if (response.ok) {
        setItUsers(await response.json());
      }
    } catch (error) { console.error("Error fetching IT users", error); }
  };

  useEffect(() => {
    if (isSessionValid && itUser) {
      fetchITUsers();
      fetchColleges();
    }
  }, [isSessionValid, itUser]);

  // --- HANDLERS ---
  const handleSignOut = async () => {
    try {
      await clearITSession();
      navigate('/');
    } catch (error) { navigate('/'); }
  };

  const handleUserMenuClick = (optionId) => {
    console.log('IT User menu clicked:', optionId);
  };

  const handleCollegeRequestAction = async (requestId, action) => {
    alert(`Request ${action}ed successfully!`);
    setCollegeRequests(prev => prev.map(req => req._id === requestId ? { ...req, status: action } : req));
  };

  const handleManagerRequestAction = async (requestId, action) => {
    alert(`Manager request ${action}ed successfully!`);
    setManagerRequests(prev => prev.map(req => req._id === requestId ? { ...req, status: action } : req));
  };

  const handleToggleCollegeStatus = async (id, currentStatus, name) => {
    if (name === 'Note Loom System') return alert("Cannot disable System Tenant");
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (!confirm(`Are you sure you want to ${newStatus === 'active' ? 'Enable' : 'Disable'} this college?`)) return;

    try {
      const response = await fetch(`${API_BASE}/it-admin/colleges/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('itSessionToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) fetchColleges();
      else alert("Failed to update status");
    } catch (error) { alert("Error updating status"); }
  };

  const handleDeleteCollege = async (id, name) => {
    if (itUser.role !== 'noteloom_admin') return alert("Only Admin can delete.");
    if (name === 'Note Loom System') return alert("Cannot delete System Tenant");
    if (!confirm(`WARNING: This will suspend the college and schedule permanent deletion in 3 MONTHS.\n\nAre you sure?`)) return;

    try {
      const response = await fetch(`${API_BASE}/it-admin/colleges/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('itSessionToken')}` }
      });
      if (response.ok) {
        alert("College suspended and scheduled for deletion.");
        fetchColleges();
      } else {
        alert("Delete failed");
      }
    } catch (error) { alert("Error deleting college"); }
  };

  const handleCreateCollege = async (e) => {
    if (e) e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/it-admin/colleges`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('itSessionToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCollegeData)
      });

      if (response.ok) {
        alert("College created successfully!");
        setNewCollegeData({ name: '', logoUrl: '', adminName: '', adminEmail: '', adminPassword: '' });
        setShowCreateForm(false);
        fetchColleges();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to create college");
      }
    } catch (error) { alert("Error creating college"); }
  };


  const handleUpdateCollege = async (e) => {
  if (e) e.preventDefault();
  
  if (!editingCollege?._id) {
    alert("Error: No college ID found");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/it-admin/colleges/${editingCollege._id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('itSessionToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: editingCollege.name,
        logoUrl: editingCollege.logoUrl,
        location: editingCollege.location,
        category: editingCollege.category,
        featured: editingCollege.featured
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert("College details updated successfully!");
      setShowEditModal(false);
      setEditingCollege(null);
      fetchColleges(); // This triggers a fresh GET request to show new data
    } else {
      alert(data.error || "Failed to update college");
    }
  } catch (error) {
    console.error("Update error:", error);
    alert("Network error: Could not update college");
  }
};

  const getDashboardTitle = () => {
    if (itUser?.role === 'noteloom_admin') return 'Note Loom Admin';
    if (itUser?.role === 'noteloom_manager') return 'Note Loom Manager';
    return 'IT Portal';
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!isSessionValid) { navigate('/it-login'); return null; }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Header */}
      <GlassHeader isDarker={true}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <UserProfileDropdown user={itUser} onOptionClick={handleUserMenuClick} />
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  {/* ROLE BADGE: RED for Admin, ORANGE for Manager */}
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium text-white ${itUser?.role === 'noteloom_admin' ? 'bg-red-600' : 'bg-orange-600'}`}>
                    <Shield className="w-4 h-4 mr-2" />
                    {getDashboardTitle()}
                  </span>
                  <span className="text-xs text-green-400 flex items-center backdrop-blur-sm">
                    <Wifi className="w-3 h-3 mr-1" />
                    Session Active
                  </span>
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Welcome, {itUser?.name}</span>
                  <span className="mx-2">•</span>
                  <span>Platform Management</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <CollegeBannerLogo className={isDarkMode ? "text-white" : "text-gray-900"} />
              <ThemeToggle />
              <button onClick={handleSignOut} className={`px-3 py-2 rounded-lg transition-colors text-sm backdrop-blur-md ${isDarkMode ? 'bg-gray-600/70 hover:bg-gray-700/70 text-white' : 'bg-white/70 hover:bg-gray-100/70 text-gray-900'}`}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </GlassHeader>

      {/* Dashboard Content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className={`flex space-x-6 border-b overflow-x-auto ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'college-management', label: 'College Management' },
              { id: 'college-requests', label: `Requests (${collegeRequests.filter(r => r.status === 'pending').length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-400'
                    : isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
            
            {itUser?.role === 'noteloom_admin' && (
              <>
                <button
                  onClick={() => setActiveTab('manager-requests')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === 'manager-requests'
                      ? 'border-red-500 text-red-400'
                      : isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-700'
                  }`}
                >
                  Manager Requests ({managerRequests.filter(r => r.status === 'pending').length})
                </button>
                <button
                  onClick={() => setActiveTab('user-management')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === 'user-management'
                      ? 'border-red-500 text-red-400'
                      : isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-700'
                  }`}
                >
                  User Management
                </button>
              </>
            )}
          </div>
        </div>

        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div 
              onClick={() => setActiveTab('college-requests')}
              className={`p-6 rounded-lg backdrop-blur-md border transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-105 ${isDarkMode ? 'bg-gray-800/70 border-gray-700/50 hover:bg-gray-700/70' : 'bg-white/70 border-gray-200/50 hover:bg-gray-100/70'}`}
            >
              <School className="w-12 h-12 text-red-500 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2 text-center">College Requests</h3>
              <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage college onboarding</p>
              <p className={`text-center mt-2 font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{collegeRequests.filter(r => r.status === 'pending').length} Pending</p>
            </div>

            <div 
              onClick={() => setActiveTab('user-management')}
              className={`p-6 rounded-lg backdrop-blur-md border transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-105 ${isDarkMode ? 'bg-gray-800/70 border-gray-700/50 hover:bg-gray-700/70' : 'bg-white/70 border-gray-200/50 hover:bg-gray-100/70'}`}
            >
              <Users className="w-12 h-12 text-red-500 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2 text-center">User Management</h3>
              <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage IT users</p>
              <p className={`text-center mt-2 font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{itUsers.length} IT Users</p>
            </div>

            <div 
              onClick={() => navigate('/it-admin/feature-manager')}
              className={`p-6 rounded-lg backdrop-blur-md border transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-105 ${isDarkMode ? 'bg-gray-800/70 border-gray-700/50 hover:bg-gray-700/70' : 'bg-white/70 border-gray-200/50 hover:bg-gray-100/70'}`}
            >
              <Settings className="w-12 h-12 text-blue-500 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2 text-center">Feature Manager</h3>
              <p className={`text-center opacity-70 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Toggle features ON/OFF</p>
              <p className={`text-center mt-2 font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Configure Access</p>
            </div>
          </div>
        )}

        {/* --- COLLEGE MANAGEMENT TAB --- */}
        {activeTab === 'college-management' && (
          <div className={`rounded-lg p-6 backdrop-blur-md border transition-all duration-300 ${isDarkMode ? 'bg-gray-800/70 border-gray-700/50' : 'bg-white/70 border-gray-200/50'}`}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold">Registered Colleges</h3>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage access and add new institutions</p>
              </div>
              {itUser.role === 'noteloom_admin' && (
                <button 
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" /> {showCreateForm ? 'Cancel' : 'Add College'}
                </button>
              )}
            </div>

            {/* CREATE COLLEGE FORM */}
            {showCreateForm && (
              <div className={`mb-8 p-6 rounded-lg border ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <form onSubmit={handleCreateCollege}>
                  <h3 className="text-lg font-bold mb-4">New College Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
  <input placeholder="College Name" required className="..." value={newCollegeData.name} onChange={e => setNewCollegeData({...newCollegeData, name: e.target.value})} />
  <input placeholder="Logo URL" className="..." value={newCollegeData.logoUrl} onChange={e => setNewCollegeData({...newCollegeData, logoUrl: e.target.value})} />
  
  {/* NEW INPUTS */}
  <input placeholder="Location (e.g. New Delhi)" required className="..." value={newCollegeData.location} onChange={e => setNewCollegeData({...newCollegeData, location: e.target.value})} />
  <div className="flex gap-4">
    <select className="flex-1 p-2 rounded border ..." value={newCollegeData.category} onChange={e => setNewCollegeData({...newCollegeData, category: e.target.value})}>
      <option value="Engineering">Engineering</option>
      <option value="University">University</option>
    </select>
    <label className="flex items-center space-x-2 text-sm cursor-pointer">
       <input type="checkbox" checked={newCollegeData.featured} onChange={e => setNewCollegeData({...newCollegeData, featured: e.target.checked})} />
       <span>Featured?</span>
    </label>
  </div>
</div>
                  <div className="border-t border-gray-700 my-4 pt-4"><p className="text-sm font-semibold mb-2">Initial Administrator</p></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input placeholder="Admin Name" required className={`p-2 rounded border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`} value={newCollegeData.adminName} onChange={e => setNewCollegeData({...newCollegeData, adminName: e.target.value})} />
                    <input placeholder="Admin Email" type="email" required className={`p-2 rounded border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`} value={newCollegeData.adminEmail} onChange={e => setNewCollegeData({...newCollegeData, adminEmail: e.target.value})} />
                    <input placeholder="Password" type="password" required className={`p-2 rounded border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`} value={newCollegeData.adminPassword} onChange={e => setNewCollegeData({...newCollegeData, adminPassword: e.target.value})} />
                  </div>
                  <button type="submit" className="mt-4 bg-green-600 text-white px-6 py-2 rounded font-bold">Create College & Admin</button>
                </form>
              </div>
            )}

            <div className="space-y-4">
              {colleges.map(college => (
                <div key={college._id} className={`p-4 rounded-lg border flex flex-col md:flex-row justify-between items-center gap-4 ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {college.logoUrl ? <img src={college.logoUrl} alt="logo" className="w-full h-full object-cover" /> : <School className="w-6 h-6 text-gray-500" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-lg">{college.name}</h4>
                        {college.name === 'Note Loom System' && <span className="text-xs bg-blue-900 text-blue-200 px-2 rounded">SYSTEM HQ</span>}
                      </div>
                      <div className="text-sm opacity-70">
                        Code: <span className="font-mono">{college.collegeCode}</span> • Status: <span className={college.status === 'active' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{college.status.toUpperCase()}</span>
                      </div>
                      {college.deletionScheduledAt && <div className="text-xs text-red-500 font-bold mt-1">⚠️ Deletion Scheduled: {new Date(college.deletionScheduledAt).toLocaleDateString()}</div>}
                    </div>
                  </div>

                  {college.name !== 'Note Loom System' && (
                    <div className="flex items-center space-x-3">
                      {/* NEW EDIT BUTTON */}
<button
  onClick={async () => {
    // Ensure latest data is used
    const freshCollege = colleges.find(c => c._id === college._id);

    setEditingCollege({
      _id: freshCollege._id,
      name: freshCollege.name || "",
      logoUrl: freshCollege.logoUrl || "",
      location: freshCollege.location || "",
      category: freshCollege.category || "Engineering",
      featured: !!freshCollege.featured
    });

    setShowEditModal(true);
  }}
  className="px-4 py-2 rounded-lg text-sm font-semibold
             bg-blue-600/20 text-blue-400
             hover:bg-blue-600/30 transition"
>
  ✏️ Edit
</button>



                      <button 
                        onClick={() => handleToggleCollegeStatus(college._id, college.status, college.name)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${college.status === 'active' ? 'bg-yellow-600/20 text-yellow-500' : 'bg-green-600/20 text-green-500'}`}
                      >
                        {college.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                      
                      {itUser.role === 'noteloom_admin' && (
                        <button 
                          onClick={() => handleDeleteCollege(college._id, college.name)}
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600/20 text-red-500"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- COLLEGE REQUESTS TAB --- */}
        {activeTab === 'college-requests' && (
          <div className={`rounded-lg p-6 backdrop-blur-md border ${isDarkMode ? 'bg-gray-800/70 border-gray-700/50' : 'bg-white/70 border-gray-200/50'}`}>
            <h3 className="text-xl font-semibold mb-4">College Admin Requests</h3>
            <div className="space-y-4">
              {collegeRequests.map((request) => (
                <div key={request._id} className={`rounded-xl p-6 border ${isDarkMode ? 'bg-gray-700/70 border-gray-600/50' : 'bg-gray-50/70 border-gray-200/50'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{request.status.toUpperCase()}</span>
                      <h4 className="text-lg font-bold mt-2">{request.collegeName}</h4>
                      <p className="text-sm opacity-80">Admin: {request.adminName} ({request.adminEmail})</p>
                      <p className="mt-2 text-sm">{request.message}</p>
                    </div>
                    {request.status === 'pending' && (
                      <div className="flex flex-col space-y-2">
                        <button onClick={() => handleCollegeRequestAction(request._id, 'approved')} className="bg-green-600 text-white px-3 py-1.5 rounded flex items-center space-x-1 text-sm"><CheckCircle className="w-4 h-4"/><span>Approve</span></button>
                        <button onClick={() => handleCollegeRequestAction(request._id, 'rejected')} className="bg-red-600 text-white px-3 py-1.5 rounded flex items-center space-x-1 text-sm"><AlertCircle className="w-4 h-4"/><span>Reject</span></button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- MANAGER REQUESTS TAB --- */}
        {itUser?.role === 'noteloom_admin' && activeTab === 'manager-requests' && (
          <div className={`rounded-lg p-6 backdrop-blur-md border ${isDarkMode ? 'bg-gray-800/70 border-gray-700/50' : 'bg-white/70 border-gray-200/50'}`}>
            <h3 className="text-xl font-semibold mb-4">Manager Requests</h3>
            <div className="space-y-4">
              {managerRequests.map((request) => (
                <div key={request._id} className={`rounded-xl p-6 border ${isDarkMode ? 'bg-gray-700/70 border-gray-600/50' : 'bg-gray-50/70 border-gray-200/50'}`}>
                   <div className="flex justify-between items-start">
                    <div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${request.status === 'pending' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{request.status.toUpperCase()}</span>
                      <h4 className="text-lg font-bold mt-2">{request.name}</h4>
                      <p className="text-sm opacity-80">{request.email} • {request.experience}</p>
                      <p className="mt-2 text-sm">{request.reason}</p>
                    </div>
                    {request.status === 'pending' && (
                      <div className="flex flex-col space-y-2">
                        <button onClick={() => handleManagerRequestAction(request._id, 'approved')} className="bg-green-600 text-white px-3 py-1.5 rounded flex items-center space-x-1 text-sm"><CheckCircle className="w-4 h-4"/><span>Approve</span></button>
                        <button onClick={() => handleManagerRequestAction(request._id, 'rejected')} className="bg-red-600 text-white px-3 py-1.5 rounded flex items-center space-x-1 text-sm"><AlertCircle className="w-4 h-4"/><span>Reject</span></button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- USER MANAGEMENT TAB --- */}
        {itUser?.role === 'noteloom_admin' && activeTab === 'user-management' && (
          <div className={`rounded-lg p-6 backdrop-blur-md border ${isDarkMode ? 'bg-gray-800/70 border-gray-700/50' : 'bg-white/70 border-gray-200/50'}`}>
            <h3 className="text-xl font-semibold mb-4">IT User Management</h3>
            <div className="overflow-x-auto">
              <table className={`w-full text-sm text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <thead className={`text-xs uppercase ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {itUsers.map(user => (
                    <tr key={user._id} className={`border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <td className="px-6 py-4 font-mono text-xs opacity-70">{user.uid}</td>
                      <td className="px-6 py-4 font-medium">{user.name}</td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs ${user.role === 'noteloom_admin' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                          {user.role === 'noteloom_admin' ? 'ADMIN' : 'MANAGER'}
                        </span>
                      </td>
                      <td className="px-6 py-4">Active</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <ITDashboardFooter />

      {showEditModal && editingCollege && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <h3 className="text-xl font-bold">Edit Institutional Details</h3>
        <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-red-500 transition-colors">✕</button>
      </div>
      
      <form onSubmit={handleUpdateCollege} className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase opacity-60 mb-1 block">Campus Name</label>
            <input 
              className={`w-full p-2.5 rounded-lg border outline-none ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
              value={editingCollege.name} 
              onChange={e => setEditingCollege({...editingCollege, name: e.target.value})} 
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase opacity-60 mb-1 block">Category</label>
            <select 
              className={`w-full p-2.5 rounded-lg border outline-none ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
              value={editingCollege.category} 
              onChange={e => setEditingCollege({...editingCollege, category: e.target.value})}
            >
              <option value="Engineering">Engineering</option>
              <option value="University">University</option>
              <option value="Management">Management</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase opacity-60 mb-1 block">Location</label>
            <input 
              className={`w-full p-2.5 rounded-lg border outline-none ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
              value={editingCollege.location} 
              onChange={e => setEditingCollege({...editingCollege, location: e.target.value})} 
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase opacity-60 mb-1 block">Logo URL</label>
            <input 
              className={`w-full p-2.5 rounded-lg border outline-none ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
              value={editingCollege.logoUrl} 
              onChange={e => setEditingCollege({...editingCollege, logoUrl: e.target.value})} 
            />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <input 
              type="checkbox" 
              id="editFeatured"
              checked={editingCollege.featured} 
              onChange={e => setEditingCollege({...editingCollege, featured: e.target.checked})} 
            />
            <label htmlFor="editFeatured" className="text-sm font-medium cursor-pointer">Mark as Featured (Star Badge)</label>
          </div>
        </div>
        
        <div className="pt-6 flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={() => setShowEditModal(false)} 
            className={`px-4 py-2 rounded-lg font-medium ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
)}

    </div>
  );
};

export default ITAdminDashboard;