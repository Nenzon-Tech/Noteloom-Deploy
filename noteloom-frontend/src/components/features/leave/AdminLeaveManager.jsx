import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Check, X, Scan, User, Briefcase, Calendar, ArrowLeft } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext.jsx'; 

// --- INTERNAL COMPONENT: GlassHeader ---
const GlassHeader = ({ children, isDarker }) => (
    <div className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b shadow-sm transition-all duration-300 ${
      isDarker 
        ? 'bg-gray-900/90 border-gray-800' 
        : 'bg-white/90 border-gray-200'
    }`}>
      {children}
    </div>
);

const AdminLeaveManager = () => {
    const navigate = useNavigate();
    const themeContext = useTheme ? useTheme() : { isDarkMode: false };
    const { isDarkMode } = themeContext;

    const [requests, setRequests] = useState([]);
    const [filter, setFilter] = useState({ status: 'Pending', dept: 'All', search: '' });
    const [departments, setDepartments] = useState(['CSE', 'ECE', 'ME', 'CE']); 

// 1. Initialize with localStorage (fallback)
    const [adminProfile, setAdminProfile] = useState({
        name: localStorage.getItem('fullName') || localStorage.getItem('name') || 'Administrator',
        uid: localStorage.getItem('uid') || localStorage.getItem('username') || 'ADMIN'
    });

    // 2. Fetch fresh session info on mount to get the real NoteLoom ID
useEffect(() => {
        const fetchSession = async () => {
            try {
                // RETRIEVE TOKEN
                const token = localStorage.getItem('sessionToken');

                if (!token) return;

                const res = await axios.get('https://noteloom-api.vercel.app/session/info', { 
                    withCredentials: true,
                    headers: { 
                        // ATTACH THE TOKEN
                        'Authorization': `Bearer ${token}` 
                    }
                });
                
                if (res.data && res.data.user) {
                    setAdminProfile({
                        name: res.data.user.name,
                        uid: res.data.user.uid || res.data.user.username || 'ADMIN' 
                    });
                }
            } catch (err) {
                console.error("Failed to fetch admin session info", err);
            }
        };
        fetchSession();
    }, []);

    // --- Dynamic Styles ---
    const pageBg = isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';
    const glassCard = isDarkMode ? 'bg-gray-800/60 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-800';
    const inputStyle = `w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all ${
        isDarkMode ? 'bg-gray-900/50 border-gray-600 focus:border-blue-500 text-white' : 'bg-gray-50 border-gray-300 focus:border-blue-500 text-gray-900'
    }`;
    const selectStyle = `p-2.5 rounded-xl border outline-none text-sm font-medium cursor-pointer ${
        isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-700'
    }`;

    useEffect(() => {
        fetchRequests();
    }, [filter.status, filter.dept]); 

    useEffect(() => {
        const timer = setTimeout(fetchRequests, 500);
        return () => clearTimeout(timer);
    }, [filter.search]);

    const fetchRequests = async () => {
        const query = `?status=${filter.status}&dept=${filter.dept}&search=${filter.search}`;
        try {
            const res = await axios.get(`https://noteloom-api.vercel.app/api/leave/admin/requests${query}`);
            setRequests(res.data);
        } catch(err) { console.error("Error fetching requests"); }
    };

    const handleAction = async (id, status) => {
        const remarks = prompt(`Enter remarks for ${status} (Optional):`, "");
        if (remarks === null) return; 
        
        await axios.put(`https://noteloom-api.vercel.app/api/leave/admin/action/${id}`, { status, remarks });
        fetchRequests(); 
    };

    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-300 ${pageBg}`}>
            
            {/* --- HEADER --- */}
            <GlassHeader isDarker={isDarkMode}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    {/* Left: Back & Title */}
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard')} className={`p-2 rounded-full transition ${isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}>
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-600 rounded-xl shadow-lg shadow-purple-600/20"><Briefcase className="text-white" size={20}/></div>
                            <div>
                                <h1 className={`font-bold text-lg leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Leave Manager</h1>
                                <p className="text-xs opacity-60">Admin Dashboard</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Admin Profile (Name + ID) */}
                    <div className={`flex items-center gap-3 px-4 py-2 rounded-full border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <div className={`p-1.5 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-white shadow-sm'}`}>
                            <User size={16} className={isDarkMode ? 'text-purple-400' : 'text-purple-600'} />
                        </div>
                        <div className="flex flex-col items-end pr-1">
                            {/* UPDATED: Uses state variable */}
                            <span className={`text-sm font-bold leading-none ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                {adminProfile.name}
                            </span>
                            <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-[10px] uppercase font-bold tracking-wider opacity-50">UID</span>
                                {/* UPDATED: Uses state variable */}
                                <span className={`text-xs font-mono opacity-80 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {adminProfile.uid}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </GlassHeader>

            {/* --- CONTENT --- */}
            <div className="p-6 md:p-8 pt-24 md:pt-32 max-w-7xl mx-auto w-full">
                
                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 mt-2 items-start md:items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Requests Overview</h2>
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Review and manage incoming faculty applications</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-80">
                            <Scan className={`absolute left-3 top-3 ${isDarkMode?'text-gray-500':'text-gray-400'}`} size={18} />
                            <input 
                                type="text" 
                                placeholder="Scan Barcode / Search Name..." 
                                className={inputStyle}
                                value={filter.search}
                                onChange={e => setFilter({...filter, search: e.target.value})}
                            />
                        </div>
                        
                        <div className="flex gap-2">
                            <select 
                                className={selectStyle}
                                onChange={e => setFilter({...filter, status: e.target.value})}
                                value={filter.status}
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Declined">Declined</option>
                            </select>
                            <select 
                                className={selectStyle}
                                onChange={e => setFilter({...filter, dept: e.target.value})}
                                value={filter.dept}
                            >
                                <option value="All">All Depts</option>
                                {departments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* --- Request Grid --- */}
                <div className="grid grid-cols-1 gap-4">
                    {requests.length === 0 && (
                        <div className={`p-10 rounded-2xl border text-center border-dashed ${isDarkMode ? 'border-gray-700 text-gray-500' : 'border-gray-300 text-gray-400'}`}>
                            <Filter className="mx-auto mb-2 opacity-50" size={32} />
                            <p>No requests found matching your filters.</p>
                        </div>
                    )}

                    {requests.map(req => (
                        <div 
                            key={req._id} 
                            className={`
                                relative p-6 rounded-2xl shadow-sm border backdrop-blur-md transition-all duration-300 hover:shadow-md
                                ${glassCard}
                                ${req.status === 'Pending' ? 'border-l-4 border-l-yellow-400' : req.status === 'Approved' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'}
                            `}
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                
                                {/* User Info */}
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${isDarkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                        {req.user?.fullName?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{req.user?.fullName}</h3>
                                        <div className="flex flex-wrap items-center gap-3 text-sm opacity-70 mt-1">
                                            <span className="flex items-center gap-1"><User size={14}/> {req.user?.username}</span>
                                            <span className="w-1 h-1 rounded-full bg-current opacity-50"></span>
                                            <span>{req.department}</span>
                                            <span className="px-2 py-0.5 rounded text-xs font-mono bg-gray-100 dark:bg-gray-700">{req.leaveAppId}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions / Status Badge */}
                                <div className="flex items-center gap-3">
                                    {req.status === 'Pending' ? (
                                        <>
                                            <button 
                                                onClick={() => handleAction(req._id, 'Approved')} 
                                                className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 rounded-lg font-medium transition"
                                            >
                                                <Check size={18} /> Approve
                                            </button>
                                            <button 
                                                onClick={() => handleAction(req._id, 'Declined')} 
                                                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 rounded-lg font-medium transition"
                                            >
                                                <X size={18} /> Decline
                                            </button>
                                        </>
                                    ) : (
                                        <span className={`px-4 py-2 rounded-lg font-bold text-sm ${
                                            req.status === 'Approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                        }`}>
                                            {req.status}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Details Divider */}
                            <div className={`my-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}></div>

                            {/* Leave Content */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <p className={`text-xs uppercase tracking-wider font-semibold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Leave Type</p>
                                    <p className="font-medium text-base">{req.leaveType}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className={`text-xs uppercase tracking-wider font-semibold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Duration</p>
                                    <p className="font-medium text-base flex items-center gap-2">
                                        <Calendar size={16} className="text-blue-500"/>
                                        {format(new Date(req.startDate), 'dd MMM')} 
                                        <span className="opacity-50">to</span> 
                                        {format(new Date(req.endDate), 'dd MMM yyyy')}
                                    </p>
                                </div>
                                <div className="md:col-span-2 space-y-1 mt-2">
                                    <p className={`text-xs uppercase tracking-wider font-semibold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Reason</p>
                                    <p className={`italic p-3 rounded-lg ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>"{req.reason}"</p>
                                </div>
                                {req.adminRemarks && (
                                    <div className="md:col-span-2 mt-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20">
                                        <p className="text-xs font-bold text-yellow-700 dark:text-yellow-500 uppercase mb-1">Admin Remarks</p>
                                        <p className="text-yellow-800 dark:text-yellow-200">{req.adminRemarks}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminLeaveManager;