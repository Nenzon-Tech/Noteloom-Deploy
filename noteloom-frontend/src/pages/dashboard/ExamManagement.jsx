import { API_BASE } from '@/utils/config';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Search, Filter, RefreshCw, FileText, CheckCircle, 
  XCircle, User, Hash, Layers, ChevronRight, Wifi, Printer, Trash2, 
  AlertTriangle, Download
} from 'lucide-react';

// Common Components
import { useTheme } from '@/context/ThemeContext.jsx';
import { useSessionManager } from '@/hooks/useSessionManager.js';
import { useErrorPopup } from '@/context/ErrorPopupContext.jsx';
import GlassHeader from '@/components/common/GlassHeader.jsx';
import UserProfileDropdown from '@/components/common/UserProfileDropdown.jsx';
import ThemeToggle from '@/components/common/ThemeToggle.jsx';
import CollegeBannerLogo from '@/components/common/CollegeBannerLogo.jsx';



const ExamManagement = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { user, profile } = useSessionManager();
  const { triggerPopup } = useErrorPopup();

  // State
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [session, setSession] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL', 'Submitted', 'Pending'
  const [searchTerm, setSearchTerm] = useState('');

  // Derived Role
  const userRoleDisplay = profile?.role ? profile.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Admin';

  // --- 1. Fetch Data ---
  const fetchData = async () => {
    setLoading(true);
    try {
        const token = localStorage.getItem('sessionToken');
        const res = await axios.get(`${API_BASE}/api/coe/admin/exam-status`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.session) {
            setSession(res.data.session);
            setRecords(res.data.records);
        } else {
            setSession(null);
            setRecords([]);
        }
    } catch (e) {
        console.error(e);
        triggerPopup("Failed to load exam status", "error");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  // --- 2. Handlers ---
  
  const handleResetForm = async (formId, studentName) => {
      if (!confirm(`Are you sure you want to RESET the exam form for ${studentName}? The student will have to fill it again.`)) return;
      
      try {
          const token = localStorage.getItem('sessionToken');
          await axios.delete(`${API_BASE}/api/coe/admin/reset-form/${formId}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          triggerPopup(`Form reset for ${studentName}`, "success");
          fetchData(); // Refresh list
      } catch (e) {
          triggerPopup("Reset failed", "error");
      }
  };

  const handleGenerateAdmitCard = (student) => {
      // Logic to open Admit Card PDF (Mock for now)
      triggerPopup(`Admit Card generated for ${student.name}`, "success");
      // window.open(`/admit-card/${student.formId}`, '_blank'); 
  };

  // --- 3. Filtering ---
  const filteredRecords = records.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
      return matchesSearch && matchesStatus;
  });

  const submittedCount = records.filter(r => r.status === 'Submitted').length;
  const pendingCount = records.filter(r => r.status === 'Pending').length;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* ================= HEADER ================= */}
      <GlassHeader variant="dashboard">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          {/* LEFT */}
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate(-1)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <UserProfileDropdown user={user} onOptionClick={() => {}} />
            <div className="flex flex-col">
              <div className={`flex items-center text-sm font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                <span className="opacity-70">{userRoleDisplay} Dashboard</span>
                <ChevronRight className="w-4 h-4 mx-1 opacity-50" />
                <span className="text-blue-600">Exam Management</span>
              </div>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${isDarkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                  {profile?.college || 'My Institute'}
                </span>
                <span className="text-[10px] text-green-500 flex items-center"><Wifi className="w-3 h-3 mr-1" /> Active</span>
              </div>
            </div>
          </div>
          {/* RIGHT */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2"><CollegeBannerLogo /></div>
            <ThemeToggle />
          </div>
        </div>
      </GlassHeader>

      {/* ================= BODY ================= */}
      <div className="pt-32 pb-12 px-6 max-w-7xl mx-auto space-y-8">
        
        {/* 1. Overview Card */}
        <div className={`p-6 rounded-3xl border flex flex-col md:flex-row justify-between items-center gap-6 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
            <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                    <FileText className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Exam Form Status</h2>
                    <p className="opacity-60">{session ? `Session: ${session.sessionName}` : 'No Active Session'}</p>
                </div>
            </div>
            
            <div className="flex gap-4">
                <div className={`px-6 py-3 rounded-2xl text-center border ${isDarkMode ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200'}`}>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-70">Submitted</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{submittedCount}</p>
                </div>
                <div className={`px-6 py-3 rounded-2xl text-center border ${isDarkMode ? 'bg-orange-500/10 border-orange-500/20' : 'bg-orange-50 border-orange-200'}`}>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-70">Pending</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>{pendingCount}</p>
                </div>
            </div>
        </div>

        {/* 2. Controls & Search */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Tabs */}
            <div className={`p-1 rounded-xl flex ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                {['ALL', 'Submitted', 'Pending'].map(status => (
                    <button 
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${filterStatus === status ? 'bg-blue-600 text-white shadow-lg' : 'opacity-60 hover:opacity-100'}`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                <input 
                    type="text" 
                    placeholder="Search Student, Roll No..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none text-sm font-medium ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                />
            </div>
        </div>

        {/* 3. Student Table */}
        <div className="space-y-3">
            {loading ? (
                <div className="text-center py-20 opacity-50 animate-pulse">Fetching exam data...</div>
            ) : filteredRecords.length === 0 ? (
                <div className="text-center py-20 opacity-50 border-2 border-dashed rounded-3xl">No records found.</div>
            ) : (
                filteredRecords.map(student => (
                    <motion.div 
                        key={student.studentId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 transition-all hover:shadow-md ${isDarkMode ? 'bg-gray-800/30 border-gray-700 hover:bg-gray-800' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                    >
                        {/* Student Info */}
                        <div className="flex items-center gap-4 flex-1 w-full">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                {student.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">{student.name}</h4>
                                <div className="flex items-center gap-2 text-xs opacity-60">
                                    <span className="font-mono">{student.rollNo}</span>
                                    <span>•</span>
                                    <span>{student.course} (Sem {student.semester})</span>
                                </div>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
                            {student.status === 'Submitted' ? (
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${isDarkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-700'}`}>
                                    <CheckCircle size={14} /> Submitted
                                </span>
                            ) : (
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${isDarkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-100 text-orange-700'}`}>
                                    <AlertTriangle size={14} /> Pending
                                </span>
                            )}
                        </div>

                        {/* Actions */}
                        {student.status === 'Submitted' && (
                            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                <button 
                                    onClick={() => handleResetForm(student.formId, student.name)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors flex items-center gap-2 ${isDarkMode ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-red-200 text-red-600 hover:bg-red-50'}`}
                                    title="Reset Form (Delete Submission)"
                                >
                                    <RefreshCw size={14} /> Reset
                                </button>
                                <button 
                                    onClick={() => handleGenerateAdmitCard(student)}
                                    className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20 flex items-center gap-2"
                                >
                                    <Printer size={14} /> Admit Card
                                </button>
                            </div>
                        )}
                        {student.status === 'Pending' && (
                            <div className="w-full md:w-auto text-right md:text-left">
                                <span className="text-xs opacity-40 italic">Waiting for submission...</span>
                            </div>
                        )}
                    </motion.div>
                ))
            )}
        </div>

      </div>
    </div>
  );
};

export default ExamManagement;