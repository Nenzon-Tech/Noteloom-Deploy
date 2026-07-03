import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import { useNavigate } from 'react-router-dom';
import { LeaveReceipt } from '@/components/features/leave/LeaveReceipt.jsx';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { 
  CheckCircle, Printer, Send, Calendar, Clock, 
  ChevronRight, ArrowLeft, User 
} from 'lucide-react';
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

const FacultyLeave = () => {
  const navigate = useNavigate();
  // Safe access to theme
  const themeContext = useTheme ? useTheme() : { isDarkMode: false };
  const { isDarkMode } = themeContext;

  const [view, setView] = useState('apply'); // 'apply' or 'history'
  const [history, setHistory] = useState([]);
  const [lastSubmit, setLastSubmit] = useState(null);
  const printRef = useRef();

  // --- UPDATED: USER IDENTITY LOGIC ---
  // 1. Initialize with localStorage (fallback)
  const [userProfile, setUserProfile] = useState({
    id: localStorage.getItem('userId'),
    name: localStorage.getItem('fullName') || localStorage.getItem('name') || 'Faculty Member',
    uid: localStorage.getItem('uid') || localStorage.getItem('username') || 'N/A',
    department: localStorage.getItem('department') || 'General'
  });

  // 2. Fetch fresh session info on mount to ensure ID is correct
// 2. Fetch fresh session info on mount
  useEffect(() => {
    const fetchSession = async () => {
        try {
            // RETRIEVE TOKEN FROM STORAGE (Check if you stored it as 'sessionToken' or 'token')
            const token = localStorage.getItem('sessionToken'); 

            if (!token) {
                console.warn("No token found, redirecting to login...");
                // Optional: navigate('/login');
                return;
            }

            const res = await axios.get('https://noteloom-api.vercel.app/session/info', { 
                withCredentials: true,
                headers: { 
                    // ATTACH THE TOKEN HERE
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (res.data && res.data.user) {
                setUserProfile({
                    id: res.data.user.id,
                    name: res.data.user.name,
                    uid: res.data.user.uid || res.data.user.username || 'N/A',
                    department: res.data.user.department || 'General'
                });
            }
        } catch (err) { 
            console.error("Session fetch error", err); 
            // If 401 happens here, it means token is expired or invalid
        }
    };
    fetchSession();
  }, []);

  // 3. Prepare user details for the Receipt component
  // Note: LeaveReceipt expects 'username' to be the ID
  const userDetails = {
      username: userProfile.uid, 
      fullName: userProfile.name,
      department: userProfile.department
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const fetchHistory = async () => {
    try {
        const res = await axios.get(`https://noteloom-api.vercel.app/api/leave/history/${userProfile.id}`);
        setHistory(res.data);
    } catch(err) {
        console.error("Failed to load history");
    }
  };

  useEffect(() => { if(view === 'history') fetchHistory(); }, [view, userProfile.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        userId: userProfile.id,
        leaveType: formData.get('leaveType'),
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        reason: formData.get('reason')
    };
    try {
        const res = await axios.post('https://noteloom-api.vercel.app/api/leave/apply', data);
        setLastSubmit(res.data);
    } catch(err) { alert('Error submitting leave'); }
  };

  // --- Dynamic Styles ---
  const containerClass = isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';
  const cardClass = isDarkMode ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-white/70 border-gray-200 text-gray-900';
  const inputClass = `w-full p-3 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-blue-500 outline-none ${
    isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
  }`;
  const labelClass = `block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`;

  // --- SUCCESS VIEW ---
  if (lastSubmit) {
    return (
        <div className={`min-h-screen flex flex-col items-center justify-center pt-20 ${containerClass}`}>
            <GlassHeader isDarker={isDarkMode}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <button onClick={() => setLastSubmit(null)} className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition">
                        <ArrowLeft size={20} /> <span className="font-medium">Back</span>
                    </button>
                    {/* UPDATED: Logged In User Info in Header */}
                    <div className="flex flex-col items-end">
                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userProfile.name}</span>
                        <span className="font-mono text-xs opacity-70">UID: {userProfile.uid}</span>
                    </div>
                </div>
            </GlassHeader>

            <div className="hidden"><LeaveReceipt ref={printRef} data={lastSubmit} user={userDetails} /></div>
            
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`max-w-md w-full p-8 rounded-2xl shadow-xl border backdrop-blur-md text-center ${cardClass}`}
            >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Application Submitted!</h2>
                <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Your leave ID is <span className="font-mono font-bold">{lastSubmit.leaveAppId}</span>. <br/>
                    Please print the receipt for your records.
                </p>
                
                <div className="flex flex-col gap-3">
                    <button onClick={handlePrint} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-500/20">
                        <Printer size={20} /> Print Receipt
                    </button>
                    <button onClick={() => {setLastSubmit(null); setView('history');}} className={`w-full py-3 rounded-xl font-medium transition ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                        Return to History
                    </button>
                </div>
            </motion.div>
        </div>
    );
  }

  // --- MAIN DASHBOARD VIEW ---
  return (
    <div className={`min-h-screen transition-colors duration-300 ${containerClass}`}>
      
      {/* --- HEADER --- */}
      <GlassHeader isDarker={isDarkMode}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            {/* Left: Back & Title */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/dashboard')} className={`p-2 rounded-full transition ${isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}>
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20"><Clock className="text-white" size={20}/></div>
                    <div>
                        <h1 className={`font-bold text-lg leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Leave Portal</h1>
                        <p className="text-xs opacity-60">Faculty Dashboard</p>
                    </div>
                </div>
            </div>

            {/* UPDATED: Right User Profile (Name + ID) */}
            <div className={`flex items-center gap-3 px-4 py-2 rounded-full border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className={`p-1.5 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-white shadow-sm'}`}>
                    <User size={16} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
                </div>
                <div className="flex flex-col items-end pr-1">
                    <span className={`text-sm font-bold leading-none ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{userProfile.name}</span>
                    <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-50">UID</span>
                        <span className={`text-xs font-mono opacity-80 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{userProfile.uid}</span>
                    </div>
                </div>
            </div>
        </div>
      </GlassHeader>

      {/* --- CONTENT --- */}
      <div className="max-w-5xl mx-auto p-6 md:p-10 pt-24 md:pt-32">
        
        {/* Intro */}
        <div className="mb-8">
             <h1 className="text-3xl font-bold mb-2">Faculty Leave Dashboard</h1>
             <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Submit new applications or track the status of previous requests.</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 p-1 rounded-xl bg-gray-200/20 mb-8 w-fit backdrop-blur-sm border border-white/10">
            {['apply', 'history'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setView(tab)}
                    className={`
                        px-6 py-2.5 rounded-lg text-sm font-bold capitalize transition-all duration-200
                        ${view === tab 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : (isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100')
                        }
                    `}
                >
                    {tab === 'apply' ? 'Apply New' : 'My History'}
                </button>
            ))}
        </div>

        <motion.div 
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {view === 'apply' ? (
                <div className={`p-8 rounded-2xl shadow-sm border backdrop-blur-md ${cardClass}`}>
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Leave Type</label>
                                <div className="relative">
                                    <select name="leaveType" className={`${inputClass} appearance-none`}>
                                        <option>Casual Leave</option>
                                        <option>Sick Leave</option>
                                        <option>Duty Leave</option>
                                        <option>Earned Leave</option>
                                    </select>
                                    <ChevronRight className={`absolute right-3 top-3.5 w-5 h-5 rotate-90 pointer-events-none ${isDarkMode?'text-gray-400':'text-gray-500'}`} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Start Date</label>
                                <input type="date" name="startDate" required className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>End Date</label>
                                <input type="date" name="endDate" required className={inputClass} />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Reason for Leave</label>
                            <textarea name="reason" rows="4" required className={inputClass} placeholder="Please describe the reason briefly..."></textarea>
                        </div>

                        <div className="pt-4">
                            <button type="submit" className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-500/20">
                                <Send size={18} /> Submit Application
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className={`overflow-hidden rounded-2xl shadow-sm border backdrop-blur-md ${cardClass}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-gray-50'}`}>
                                    <th className="p-5 font-semibold text-sm">Applied On / ID</th>
                                    <th className="p-5 font-semibold text-sm">Dates</th>
                                    <th className="p-5 font-semibold text-sm">Type & Reason</th>
                                    <th className="p-5 font-semibold text-sm">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {history.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-gray-500">No leave history found.</td>
                                    </tr>
                                ) : (
                                    history.map(item => (
                                        <tr key={item._id} className={`transition-colors ${isDarkMode ? 'hover:bg-gray-800/40' : 'hover:bg-gray-50'}`}>
                                            <td className="p-5">
                                                <div className="font-bold">{format(new Date(item.createdAt), 'dd MMM yyyy')}</div>
                                                <div className="text-xs font-mono opacity-60 mt-1">{item.leaveAppId}</div>
                                            </td>
                                            <td className="p-5 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} className="opacity-70"/>
                                                    {format(new Date(item.startDate), 'dd MMM')} - {format(new Date(item.endDate), 'dd MMM')}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="font-medium mb-1">{item.leaveType}</div>
                                                <div className="text-sm opacity-70 truncate max-w-xs">{item.reason}</div>
                                                {item.adminRemarks && (
                                                    <div className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">Note: {item.adminRemarks}</div>
                                                )}
                                            </td>
                                            <td className="p-5">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                                    item.status === 'Approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                                                    item.status === 'Declined' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                                    'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </motion.div>
      </div>
    </div>
  );
};

export default FacultyLeave;