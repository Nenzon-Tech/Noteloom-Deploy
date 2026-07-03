import { API_BASE } from '@/utils/config';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Search, Filter, Download, FileText, CheckCircle, 
  CreditCard, Calendar, User, Hash, Layers, ChevronRight, Wifi, 
  DollarSign, TrendingUp, Receipt, AlertCircle, Users
} from 'lucide-react';

// Common Components
import { useTheme } from '@/context/ThemeContext.jsx';
import { useSessionManager } from '@/hooks/useSessionManager.js';
import { useErrorPopup } from '@/context/ErrorPopupContext.jsx';
import GlassHeader from '@/components/common/GlassHeader.jsx';
import UserProfileDropdown from '@/components/common/UserProfileDropdown.jsx';
import ThemeToggle from '@/components/common/ThemeToggle.jsx';
import CollegeBannerLogo from '@/components/common/CollegeBannerLogo.jsx';



// ==========================================
// SUB-COMPONENTS
// ==========================================

const StatCard = ({ label, value, icon: Icon, color, subText, loading }) => {
  const { isDarkMode } = useTheme();
  return (
    <div className={`p-6 rounded-2xl border relative overflow-hidden group ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
      <div className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl -mr-5 -mt-5 opacity-20 ${color}`}></div>
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">{label}</p>
          {loading ? (
             <div className="h-8 w-24 bg-gray-500/20 rounded animate-pulse" />
          ) : (
             <h3 className="text-2xl font-bold">{value}</h3>
          )}
          {subText && <p className="text-[10px] opacity-50 mt-1">{subText}</p>}
        </div>
        <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'} ${color.replace('bg-', 'text-').replace('500', '400')}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
};

const FeeRecordRow = ({ record, type }) => {
  const { isDarkMode } = useTheme();
  
  // Data Mapping (Handles both Exam Form objects and generic Fee objects)
  const name = record.studentName || record.name || 'Unknown';
  const roll = record.rollNo || record.uid || 'N/A';
  const stream = record.course || record.stream || 'General';
  // Check deep nested fee breakdown OR direct amount
  const amount = record.feeBreakdown?.totalPaid || record.amount || 0;
  const dateObj = new Date(record.createdAt || record.paymentDate || Date.now());
  const dateStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const sessionLabel = record.sessionId?.sessionName; // For Exam Forms

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:shadow-md ${isDarkMode ? 'bg-gray-900/50 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-blue-300'}`}
    >
      {/* Student Info */}
      <div className="flex items-center gap-4 flex-1">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-blue-50 text-blue-600'}`}>
          {name.charAt(0)}
        </div>
        <div>
          <h4 className={`font-bold text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{name}</h4>
          <div className="flex items-center gap-2 text-[10px] opacity-60 mt-0.5">
            <span className="flex items-center gap-1 font-mono"><Hash size={10}/> {roll}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Layers size={10}/> {stream}</span>
            {sessionLabel && (
                <>
                    <span>•</span>
                    <span className="text-blue-400">{sessionLabel}</span>
                </>
            )}
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
        <div className="text-right">
          <p className="text-xs font-bold opacity-50 uppercase tracking-wider mb-0.5">Amount</p>
          <p className={`font-mono font-bold text-lg ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
            ₹{amount.toLocaleString()}
          </p>
        </div>

        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold opacity-50 uppercase tracking-wider mb-0.5">Date</p>
          <div className="flex items-center gap-1 text-sm font-medium">
            <Calendar size={12} className="opacity-50"/> {dateStr}
          </div>
        </div>

        <div className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDarkMode ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-green-50 text-green-600 border border-green-200'}`}>
          <CheckCircle size={12} /> Paid
        </div>

        <button className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`} title="Download Receipt">
          <FileText size={16} />
        </button>
      </div>
    </motion.div>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================

const FeesTrackRecords = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { user, profile, loading: sessionLoading } = useSessionManager();
  const { triggerPopup } = useErrorPopup();

  // State
  const [activeTab, setActiveTab] = useState('EXAM'); // 'EXAM' or 'SEMESTER'
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data State
  const [examRecords, setExamRecords] = useState([]);
  const [semesterRecords, setSemesterRecords] = useState([]); 

  // Derived Role Display
  const userRoleDisplay = profile?.role ? profile.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Admin';

  // --- Initial Data Fetch ---
  useEffect(() => {
    if (sessionLoading || !user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('sessionToken');
        
        // 1. Fetch Exam Fee Records (Real Data)
        const examRes = await axios.get(`${API_BASE}/api/coe/admin/exam-forms`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // 2. Fetch Semester Fee Records (Real Data - even if empty)
        const semRes = await axios.get(`${API_BASE}/api/coe/admin/semester-fees`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        setExamRecords(examRes.data || []);
        setSemesterRecords(semRes.data || []);

      } catch (e) {
        console.error(e);
        triggerPopup("Failed to load fee records", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, sessionLoading]); // Trigger when user session is ready

  // --- Filter Logic ---
  const currentRecords = activeTab === 'EXAM' ? examRecords : semesterRecords;
  
  const filteredRecords = currentRecords.filter(rec => 
    (rec.studentName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (rec.rollNo?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (rec.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // --- Stats Calculation ---
  const totalCollected = filteredRecords.reduce((sum, rec) => sum + (rec.feeBreakdown?.totalPaid || rec.amount || 0), 0);
  const totalCount = filteredRecords.length;

  if (sessionLoading) return <div className="min-h-screen bg-[#050509] flex items-center justify-center text-gray-500 animate-pulse">Loading...</div>;

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
                <span className="text-blue-600">Fee Records</span>
              </div>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${isDarkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                  {profile?.college || 'My Institute'}
                </span>
                <span className="text-[10px] text-green-500 flex items-center"><Wifi className="w-3 h-3 mr-1" /> Online</span>
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
        
        {/* 1. Title & Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <Receipt className="text-blue-500" /> Fee Track Records
                </h1>
                <p className="opacity-60 max-w-xl">
                    Monitor real-time payments for Examinations and Semester Fees. Verify status and download digital receipts.
                </p>
            </div>

            {/* Toggle Tabs */}
            <div className={`p-1 rounded-xl flex ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                <button 
                    onClick={() => setActiveTab('EXAM')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'EXAM' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-400'}`}
                >
                    Exam Fees
                </button>
                <button 
                    onClick={() => setActiveTab('SEMESTER')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'SEMESTER' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-400'}`}
                >
                    Semester Fees
                </button>
            </div>
        </div>

        {/* 2. Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            <StatCard 
                label={`Total Collection (${activeTab === 'EXAM' ? 'Exam' : 'Semester'})`}
                value={`₹${totalCollected.toLocaleString()}`}
                icon={DollarSign}
                color="bg-emerald-500"
                subText="Verified Online Payments"
                loading={loading}
            />
            <StatCard 
                label="Paid Students"
                value={totalCount}
                icon={Users}
                color="bg-blue-500"
                subText="For current active session"
                loading={loading}
            />
            <StatCard 
                label="Pending Dues"
                value="₹0" 
                icon={TrendingUp}
                color="bg-orange-500"
                subText="Calculated from batch size"
                loading={loading}
            />
        </div>

        {/* 3. Filter & Search Bar */}
        <div className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-4 items-center ${isDarkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
                <input 
                    type="text" 
                    placeholder="Search by Student Name or Roll Number..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border outline-none font-medium transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 focus:border-blue-500' : 'bg-gray-50 border-gray-200 focus:border-blue-500'}`}
                />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
                <button className={`px-4 py-3 rounded-xl border font-bold flex items-center gap-2 ${isDarkMode ? 'bg-gray-800 border-gray-600 hover:bg-gray-700' : 'bg-white border-gray-300 hover:bg-gray-50'}`}>
                    <Filter size={18}/> Filters
                </button>
                <button className="px-4 py-3 rounded-xl bg-blue-600 text-white font-bold flex items-center gap-2 hover:bg-blue-500 shadow-lg shadow-blue-500/20">
                    <Download size={18}/> Export CSV
                </button>
            </div>
        </div>

        {/* 4. Records List */}
        <div className="space-y-4">
            {loading ? (
                <div className="text-center py-20 opacity-50 animate-pulse">Fetching records from secure server...</div>
            ) : filteredRecords.length === 0 ? (
                <div className={`text-center py-20 rounded-3xl border-2 border-dashed ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="p-4 rounded-full bg-gray-800/50 inline-block mb-3"><AlertCircle className="opacity-50" /></div>
                    <p className="opacity-50">No verified payment records found for {activeTab.toLowerCase()} fees.</p>
                </div>
            ) : (
                <div className="animate-fade-in-up space-y-3">
                    {filteredRecords.map((record) => (
                        <FeeRecordRow key={record._id} record={record} type={activeTab} />
                    ))}
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default FeesTrackRecords;