import { API_BASE } from '@/utils/config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, AlertCircle, Edit, Trash2 } from "lucide-react";
import { useTheme } from '@/context/ThemeContext.jsx';
import GlassHeader from '@/components/common/GlassHeader.jsx';



const UserManagementCard = ({ user, onToggle, onDelete }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`p-6 rounded-2xl border transition-all hover:shadow-xl ${
      isDarkMode ? 'bg-gray-800/40 border-gray-700 hover:border-blue-500/50' : 'bg-white border-gray-200 shadow-sm'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg leading-tight">{user.name}</h3>
          <p className="text-xs font-mono text-blue-500 mt-1">{user.uid || 'ID PENDING'}</p>
          <p className="text-xs opacity-60 mt-0.5">{user.email}</p>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
          user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {user.status}
        </span>
      </div>
      {user.deletionScheduledAt && (
        <div className="mb-4 p-2 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center">
          <AlertCircle className="w-3 h-3 text-red-500 mr-2" />
          <p className="text-[10px] text-red-400 font-bold">DELETION: {new Date(user.deletionScheduledAt).toLocaleDateString()}</p>
        </div>
      )}
      <div className="flex items-center space-x-2 pt-4 border-t border-gray-500/10">
        <button onClick={() => onToggle(user._id, user.status)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
            user.status === 'active' 
              ? (isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white' : 'bg-gray-100 text-gray-600 hover:bg-red-600 hover:text-white')
              : 'bg-green-600 text-white'
          }`}>
          {user.status === 'active' ? 'Disable Account' : 'Enable Account'}
        </button>
        <button onClick={() => onDelete(user._id)} className="p-2 rounded-lg bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const ManageUsers = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('college_admin');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("All");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/college-admin/users/${activeTab}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }
      });
      if (res.ok) setUsers(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [activeTab]);

  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const res = await fetch(`${API_BASE}/api/college-admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) fetchUsers();
  };

  const handleDelete = async (userId) => {
    if (!confirm("Schedule for deletion in 30 days?")) return;
    const res = await fetch(`${API_BASE}/api/college-admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }
    });
    if (res.ok) fetchUsers();
  };

  const filteredUsers = users.filter(u => {
    const searchStr = searchQuery.toLowerCase();
    const matchesSearch = u.name.toLowerCase().includes(searchStr) || (u.uid && u.uid.toLowerCase().includes(searchStr));
    if (activeTab === 'student' && selectedBatch !== "All") {
      const batchYear = new Date(u.createdAt).getFullYear().toString();
      return matchesSearch && batchYear === selectedBatch;
    }
    return matchesSearch;
  });

  const batches = ["All", ...new Set(users.map(u => new Date(u.createdAt).getFullYear().toString()))].sort();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <GlassHeader isDarker={true}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 rounded-lg hover:bg-gray-700/50"><ArrowLeft className="w-5 h-5"/></button>
            <h1 className="text-xl font-bold">User Management</h1>
          </div>
          <div className="flex bg-gray-800/50 backdrop-blur-md rounded-xl p-1 border border-gray-700/50">
            {['college_admin', 'faculty', 'student'].map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); setSelectedBatch("All"); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'
                }`}
              >{tab.replace('_', ' ')}</button>
            ))}
          </div>
        </div>
      </GlassHeader>

      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input type="text" placeholder={`Search by name or ${activeTab === 'student' ? 'Enrollment ID' : 'Employee ID'}...`}
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}
            />
          </div>
          {activeTab === 'student' && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              {batches.map(year => (
                <button key={year} onClick={() => setSelectedBatch(year)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${selectedBatch === year ? 'bg-blue-600 text-white' : (isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600')}`}
                >{year === "All" ? "All Batches" : `${year} Batch`}</button>
              ))}
            </div>
          )}
        </div>

        {loading ? <div className="text-center py-20 opacity-50">Fetching users...</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map(u => <UserManagementCard key={u._id} user={u} onToggle={handleStatusToggle} onDelete={handleDelete} />)}
            {filteredUsers.length === 0 && <div className="col-span-full text-center py-20 opacity-30">No users found.</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;