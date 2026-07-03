import { API_BASE } from '@/utils/config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calendar, Check, X, FileText, Clock, 
  PieChart, TrendingUp, AlertCircle, BookOpen, User, Filter
} from 'lucide-react';

import { useTheme } from '@/context/ThemeContext.jsx';
import GlassHeader from '@/components/common/GlassHeader.jsx';
import CollegeBannerLogo from '@/components/common/CollegeBannerLogo.jsx';
import ThemeToggle from '@/components/common/ThemeToggle.jsx';
import UserProfileDropdown from '@/components/common/UserProfileDropdown.jsx';



const Attendance = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  // State
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, excused: 0, percentage: 0 });
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
  const [myBatch, setMyBatch] = useState(null);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // --- 1. Fetch Data ---
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('sessionToken');
      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Get Session Info
      const sessionRes = await fetch(`${API_BASE}/session/info`, { headers });
      const session = await sessionRes.json();
      setSessionData(session);

      // 2. Get My Batch Info (Find where student is enrolled)
      const batchRes = await fetch(`${API_BASE}/api/batches`, { headers });
      const batches = await batchRes.json();
      const studentBatch = batches.find(b => b.students && b.students.includes(session.user.id));
      
      if (studentBatch) {
        setMyBatch(studentBatch);
        // 3. Fetch My Attendance Records
        // Note: Ensure your backend has a route like /api/attendance/my-records or adapt this URL
        fetchAttendanceRecords(studentBatch._id, headers);
      } else {
        setLoading(false);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const fetchAttendanceRecords = async (batchId, headers) => {
    try {
        // Construct query parameters for the current year
        const startDate = new Date(new Date().getFullYear(), 0, 1).toISOString(); 
        const endDate = new Date().toISOString();

        // This endpoint should return the logged-in student's attendance records
        const res = await fetch(`${API_BASE}/api/attendance/my-records?batchId=${batchId}&startDate=${startDate}&endDate=${endDate}`, { headers });
        
        if (res.ok) {
            const data = await res.json();
            processAttendanceData(data);
        } else {
            console.warn("Attendance route not found or error");
            setAttendanceRecords([]);
        }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // --- 2. Process Data & Calculate Stats ---
  const processAttendanceData = (data) => {
    let total = 0;
    let present = 0;
    let absent = 0;
    let excused = 0;

    // Sort by date (newest first)
    const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedData.forEach(record => {
        total++;
        if (record.status === 'Present') present++;
        else if (record.status === 'Absent') absent++;
        else if (record.status === 'Excused') excused++;
    });

    const percentage = total === 0 ? 0 : Math.round(((present + excused) / total) * 100);

    setStats({ total, present, absent, excused, percentage });
    setAttendanceRecords(sortedData);
  };

  // --- UI Helpers ---
  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'bg-emerald-500 text-white shadow-emerald-500/30';
      case 'Absent': return 'bg-red-500 text-white shadow-red-500/30';
      case 'Excused': return 'bg-yellow-500 text-white shadow-yellow-500/30';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present': return <Check size={16} strokeWidth={3}/>;
      case 'Absent': return <X size={16} strokeWidth={3}/>;
      case 'Excused': return <FileText size={16} strokeWidth={3}/>;
      default: return <AlertCircle size={16}/>;
    }
  };

  // Filter records by selected month
  const filteredRecords = attendanceRecords.filter(r => new Date(r.date).getMonth() === parseInt(filterMonth));

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'bg-[#0f111a] text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* HEADER */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <GlassHeader variant="dashboard">
            <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                  <button onClick={() => navigate(-1)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                      <ArrowLeft className="w-5 h-5" />
                  </button>
                  <UserProfileDropdown user={sessionData?.user} onOptionClick={() => {}} />
                  <div className="flex flex-col">
                      <div className="flex items-center text-sm font-bold opacity-90">
                          <span>Student Dashboard</span>
                          <span className="mx-2 text-gray-500">/</span>
                          <span className="text-blue-500">My Attendance</span>
                      </div>
                  </div>
              </div>
              <div className="flex items-center space-x-4"><CollegeBannerLogo /><ThemeToggle /></div>
            </div>
        </GlassHeader>
      </div>

      <div className="pt-28 pb-12 max-w-5xl mx-auto px-4">
        <AnimatePresence>
            {!loading && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    
                    {/* 1. TOP STATS CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        {/* Percentage Card (Main) */}
                        <div className={`p-6 rounded-2xl border flex flex-col justify-between relative overflow-hidden ${isDarkMode ? 'bg-blue-900/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
                            <div className="z-10">
                                <h3 className="text-sm font-bold opacity-70 uppercase tracking-wider mb-1">Overall</h3>
                                <div className="text-4xl font-extrabold text-blue-500">{stats.percentage}%</div>
                                <div className="text-xs opacity-60 mt-1">Attendance Score</div>
                            </div>
                            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-blue-500/20 to-transparent pointer-events-none"/>
                            <PieChart className="absolute right-4 bottom-4 text-blue-500/20 w-16 h-16"/>
                        </div>

                        {/* Breakdown Cards */}
                        <div className={`p-5 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <div>
                                <div className="text-2xl font-bold text-emerald-500">{stats.present}</div>
                                <div className="text-xs font-bold opacity-60 uppercase">Present</div>
                            </div>
                            <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500"><Check size={20}/></div>
                        </div>
                        <div className={`p-5 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <div>
                                <div className="text-2xl font-bold text-red-500">{stats.absent}</div>
                                <div className="text-xs font-bold opacity-60 uppercase">Absent</div>
                            </div>
                            <div className="p-3 rounded-full bg-red-500/10 text-red-500"><X size={20}/></div>
                        </div>
                        <div className={`p-5 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <div>
                                <div className="text-2xl font-bold text-yellow-500">{stats.excused}</div>
                                <div className="text-xs font-bold opacity-60 uppercase">Excused</div>
                            </div>
                            <div className="p-3 rounded-full bg-yellow-500/10 text-yellow-500"><FileText size={20}/></div>
                        </div>
                    </div>

                    {/* 2. HISTORY LIST HEADER */}
                    <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                Attendance History
                                {myBatch && <span className="text-xs font-normal px-2 py-1 rounded bg-gray-500/10 border border-gray-500/20 text-gray-500">{myBatch.batchName}</span>}
                            </h2>
                            <p className="text-sm opacity-60 mt-1">Detailed log of your class participation.</p>
                        </div>
                        
                        {/* Month Filter */}
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <Filter size={16} className="opacity-50"/>
                            <select 
                                value={filterMonth} 
                                onChange={(e) => setFilterMonth(e.target.value)}
                                className="bg-transparent outline-none text-sm font-bold cursor-pointer"
                            >
                                {months.map((m, idx) => (
                                    <option key={idx} value={idx} className={isDarkMode ? 'bg-gray-900' : ''}>{m}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 3. RECORDS LIST */}
                    <div className="space-y-3">
                        {filteredRecords.length > 0 ? (
                            filteredRecords.map((record, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`group flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-md ${isDarkMode ? 'bg-gray-800/40 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Date Box */}
                                        <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                            <span className="text-xs font-bold text-red-500 uppercase">{new Date(record.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                            <span className="text-xl font-bold">{new Date(record.date).getDate()}</span>
                                        </div>

                                        {/* Subject Info */}
                                        <div>
                                            <h4 className="font-bold text-lg">{record.subject?.name || "Subject Name"}</h4>
                                            <div className="flex items-center gap-3 text-xs opacity-60 mt-0.5">
                                                <span className="flex items-center gap-1"><Clock size={12}/> {record.startTime} - {record.endTime}</span>
                                                <span className="flex items-center gap-1"><User size={12}/> {record.facultyName || "Faculty"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-lg ${getStatusColor(record.status)}`}>
                                        {getStatusIcon(record.status)}
                                        <span className="hidden md:inline">{record.status}</span>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-20 opacity-50 border-2 border-dashed rounded-3xl">
                                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50"/>
                                <p>No records found for {months[filterMonth]}.</p>
                            </div>
                        )}
                    </div>

                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Attendance;