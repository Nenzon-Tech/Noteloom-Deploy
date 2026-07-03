import { API_BASE } from '@/utils/config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { ArrowLeft, School, Settings, ShieldCheck } from "lucide-react";
import { useTheme } from '@/context/ThemeContext.jsx';
import { useITSessionManager } from '@/hooks/useITSessionManager.js';
import GlassHeader from '@/components/common/GlassHeader.jsx';
import ThemeToggle from '@/components/common/ThemeToggle.jsx';

 // Or import from utils

const FeatureManager = () => {
  const { isDarkMode } = useTheme();
  const { isSessionValid } = useITSessionManager();
  const navigate = useNavigate();

  // State
  const [viewMode, setViewMode] = useState('list');
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [activeRoleTab, setActiveRoleTab] = useState('student');
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  
  const [configs, setConfigs] = useState({
    student: [],
    faculty: [],
    college_admin: []
  });

  const isSystemTenant = (tenant) => tenant?.name === 'Note Loom System';

  // 1. Fetch Tenants
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await fetch(`${API_BASE}/it-admin/tenants-list`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('itSessionToken')}` }
        });
        if (response.ok) {
          const data = await response.json();
          setTenants(data);
        }
      } catch (error) {
        console.error("Error fetching tenants:", error);
      }
    };
    if (isSessionValid) fetchTenants();
  }, [isSessionValid]);

  // 2. Fetch Config
  useEffect(() => {
    if (!selectedTenant) return;
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/it-admin/menu-config/${selectedTenant._id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('itSessionToken')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch config');
        const data = await response.json();
        setConfigs({
          student: data.student || [],
          faculty: data.faculty || [],
          college_admin: data.college_admin || []
        });
      } catch (error) {
        console.error("Error fetching config:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [selectedTenant]);

  const handleSelectCollege = (tenant) => {
    setSelectedTenant(tenant);
    setViewMode('edit');
    setActiveRoleTab('student');
  };

  const handleBackToList = () => {
    setSelectedTenant(null);
    setViewMode('list');
    setConfigs({ student: [], faculty: [], college_admin: [] });
  };

  const handleToggle = (role, index) => {
    setConfigs(prev => {
      const updated = [...prev[role]];
      updated[index] = { ...updated[index], isActive: !updated[index].isActive };
      return { ...prev, [role]: updated };
    });
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const response = await fetch(`${API_BASE}/it-admin/menu-config`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('itSessionToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tenantId: selectedTenant._id,
          role: activeRoleTab,
          tabs: configs[activeRoleTab]
        })
      });
      if (response.ok) alert(`${activeRoleTab.toUpperCase()} settings saved!`);
      else alert("Failed to save configuration.");
    } catch (error) {
      console.error("Error saving:", error);
      alert("Error saving configuration.");
    } finally {
      setSaveLoading(false);
    }
  };

  if (!isSessionValid) return null;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <GlassHeader isDarker={true}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
               <button onClick={() => navigate('/it-admin')} className="p-2 rounded-lg hover:bg-gray-700/50">
                 <ArrowLeft className="w-5 h-5"/>
               </button>
               <h1 className="text-xl font-bold">Feature Access Manager</h1>
            </div>
            <ThemeToggle />
        </div>
      </GlassHeader>

      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        {viewMode === 'list' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Select a College</h2>
              <p className="opacity-70">Choose an institution to manage its features</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tenants.map((tenant) => (
                <div key={tenant._id} onClick={() => handleSelectCollege(tenant)}
                  className={`relative group p-6 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                    isDarkMode ? 'bg-gray-800/70 border-gray-700' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                     <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-300">
                        {tenant.logoUrl ? <img src={tenant.logoUrl} alt="logo" className="w-full h-full object-cover" /> : <School className="w-8 h-8 text-gray-500" />}
                     </div>
                     <div>
                       <h3 className="font-bold text-lg line-clamp-1">{tenant.name}</h3>
                       {isSystemTenant(tenant) 
                         ? <span className="text-xs px-2 py-1 rounded-full bg-indigo-700 text-indigo-100 font-semibold">SYSTEM</span>
                         : <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">Active</span>
                       }
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'edit' && selectedTenant && (
          <div className={`rounded-xl border backdrop-blur-md overflow-hidden ${isDarkMode ? 'bg-gray-800/70 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
               <div className="flex items-center space-x-4">
                 <button onClick={handleBackToList} className={`px-4 py-2 rounded-lg text-sm font-medium ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>← Change College</button>
                 <h2 className="text-xl font-bold">{selectedTenant.name}</h2>
               </div>
               <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
                 {['student', 'faculty', 'college_admin'].map(role => (
                    <button key={role} onClick={() => setActiveRoleTab(role)}
                      className={`px-4 py-2 rounded-md text-sm font-medium capitalize ${activeRoleTab === role ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-500'}`}
                    >{role.replace('_', ' ')}</button>
                 ))}
               </div>
            </div>
            <div className="p-6">
              {loading ? <p>Loading...</p> : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-semibold text-lg capitalize">{activeRoleTab.replace('_', ' ')} Menu</h3>
                    {!isSystemTenant(selectedTenant) && (
                      <button onClick={handleSave} disabled={saveLoading} className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2">
                        <ShieldCheck className="w-4 h-4" /><span>{saveLoading ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {configs[activeRoleTab]?.map((item, index) => (
                      <div key={item.key} className={`p-4 rounded-xl border transition-all ${
                        item.isActive ? (isDarkMode ? 'bg-blue-900/20 border-blue-500/50' : 'bg-blue-50 border-blue-200') : 'opacity-60'
                      }`}>
                        <div className="flex items-start justify-between">
                           <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${item.isActive ? 'bg-blue-500 text-white' : 'bg-gray-400 text-white'}`}><Settings className="w-5 h-5" /></div>
                              <div>
                                <h4 className="font-bold">{item.title}</h4>
                                <p className="text-xs opacity-70">{item.description}</p>
                              </div>
                           </div>
                           <button disabled={isSystemTenant(selectedTenant)} onClick={() => !isSystemTenant(selectedTenant) && handleToggle(activeRoleTab, index)}
                              className={`w-12 h-6 rounded-full p-1 transition-colors ${item.isActive ? 'bg-green-500' : 'bg-gray-400'}`}>
                              <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${item.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeatureManager;