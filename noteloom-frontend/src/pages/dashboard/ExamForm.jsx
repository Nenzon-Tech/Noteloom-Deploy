import { API_BASE } from '@/utils/config';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Clock, User, Hash, FileBadge, Layers, 
  CheckCircle2, Info, Receipt, ShieldCheck, ArrowRight, Lock, 
  Calendar, Filter, LayoutGrid, History, AlertCircle, Sparkles,
  ChevronRight, Wifi, ClipboardCheck, ClipboardEdit, CreditCard
} from "lucide-react";

// Common Components
import { useTheme } from '@/context/ThemeContext.jsx';
import { useSessionManager } from '@/hooks/useSessionManager.js';
import { useErrorPopup } from '@/context/ErrorPopupContext.jsx'; 
import GlassHeader from '@/components/common/GlassHeader.jsx';
import UserProfileDropdown from '@/components/common/UserProfileDropdown.jsx';
import ThemeToggle from '@/components/common/ThemeToggle.jsx';
import CollegeBannerLogo from '@/components/common/CollegeBannerLogo.jsx';

// Assets
import LoadingSpinner from '@/components/common/LoadingSpinner';



// =========================================================
// 1. SUB-COMPONENTS FOR FORM FILLING
// =========================================================

const ExamHeader = ({ profile, session, isDarkMode }) => (
  <div className={`border rounded-2xl p-6 shadow-sm ${isDarkMode ? 'bg-gradient-to-r from-purple-900/20 to-gray-800 border-purple-500/20' : 'bg-gradient-to-r from-purple-50 to-white border-purple-100'}`}>
    <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8">
      <div className="space-y-3 flex-1 min-w-[300px]">
         <div className="flex items-center gap-3">
            <h1 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Registration Form</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 uppercase tracking-wider">Active</span>
         </div>
         <div className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
           <div className="flex items-center gap-2"><ClipboardEdit className="w-4 h-4 opacity-70 text-purple-500" /><span>{session.label}</span></div>
           <span className={`hidden sm:block w-px h-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></span>
           <div className="flex items-center gap-2 text-orange-500"><Clock className="w-4 h-4" /><span className="font-medium">Registration Open</span></div>
         </div>
      </div>

      <div className={`w-full xl:w-auto border rounded-2xl p-1 pr-6 flex flex-col md:flex-row items-center relative overflow-hidden group ${isDarkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
         <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
         <div className="flex items-center gap-5 p-4 w-full md:w-auto z-10">
            <div className={`w-14 h-14 rounded-xl border flex items-center justify-center shrink-0 shadow-inner ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-purple-50 border-purple-100'}`}>
                <User className="w-6 h-6 text-purple-500" />
            </div>
            <div className="min-w-[180px]">
               <p className={`text-lg font-bold leading-tight mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{profile.name}</p>
               <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  <span className="text-purple-600 dark:text-purple-400">{profile.program}</span><span className={`w-1 h-1 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} /><span>{profile.stream}</span>
               </div>
            </div>
         </div>
         <div className={`hidden md:block w-px h-12 mx-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
         <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4 p-4 w-full md:w-auto z-10">
            <div><p className={`text-[10px] font-bold uppercase mb-0.5 flex items-center gap-1.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}><Hash className="w-3 h-3" /> Roll No</p><p className={`text-sm font-mono font-bold tracking-wide ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{profile.rollNo}</p></div>
            <div><p className={`text-[10px] font-bold uppercase mb-0.5 flex items-center gap-1.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}><FileBadge className="w-3 h-3" /> Reg No</p><p className={`text-sm font-mono font-bold tracking-wide ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{profile.registrationNo}</p></div>
            <div className="col-span-2 md:col-span-1"><p className={`text-[10px] font-bold uppercase mb-0.5 flex items-center gap-1.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}><Layers className="w-3 h-3" /> Batch</p><p className={`text-sm font-bold tracking-wide ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{profile.batch}</p></div>
         </div>
      </div>
    </div>
  </div>
);

const ExamTabs = ({ activeTab, setActiveTab, isDarkMode }) => {
  const tabs = [{ id: 'REGULAR', label: 'Regular Subjects' }, { id: 'BACKLOG', label: 'Backlog Subjects' }];
  return (
    <div className="flex justify-start mb-8 border-b border-gray-200 dark:border-gray-800 pb-px">
       <div className="flex gap-6">
          {tabs.map((tab) => {
             const isActive = activeTab === tab.id;
             const Icon = tab.id === 'REGULAR' ? Layers : History;
             return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative pb-3 text-sm font-bold transition-colors duration-300 flex items-center gap-2 outline-none group ${isActive ? 'text-purple-600 dark:text-purple-400' : (isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-800')}`}>
                   <Icon size={16} className={isActive ? "text-purple-500" : "opacity-70"} />{tab.label}
                   {isActive && <motion.div layoutId="exam-tab-line" className="absolute bottom-0 left-0 w-full h-1 bg-purple-500 rounded-t-full" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                </button>
             );
          })}
       </div>
    </div>
  );
};

const RegularSubjectList = ({ subjects, currentSem, isDarkMode }) => {
  if (!subjects || subjects.length === 0) return <div className={`text-center py-10 rounded-2xl border border-dashed ${isDarkMode ? 'text-gray-500 bg-gray-800/50 border-gray-700' : 'text-gray-400 bg-gray-50 border-gray-200'}`}>No regular subjects found for this semester.</div>;

  const theoryPapers = subjects.filter(s => s.type === 'THEORY');
  const labPapers = subjects.filter(s => s.type !== 'THEORY');

  const renderRow = (sub) => (
    <div key={sub.code} className={`grid grid-cols-[80px_1fr_auto] gap-4 px-5 py-3.5 items-center border-b transition-colors last:border-0 ${isDarkMode ? 'border-gray-800 hover:bg-white/[0.02]' : 'border-gray-100 hover:bg-purple-50/30'}`}>
      <div className="font-mono text-xs font-bold text-purple-500">{sub.code}</div>
      <div><h4 className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{sub.title}</h4><p className="text-[10px] text-gray-500 mt-0.5">{sub.credit} Credits • {sub.type}</p></div>
      <div className="flex items-center gap-2">
         {sub.type === 'THEORY' && <span className="text-[10px] text-gray-500 hidden sm:inline-block mr-2">Fee Applicable</span>}
         <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded text-[10px] font-bold text-green-600 dark:text-green-400"><CheckCircle2 className="w-3 h-3" /><span>LOCKED</span></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className={`relative border p-5 rounded-2xl flex items-start gap-4 overflow-hidden shadow-sm ${isDarkMode ? 'bg-gray-800/80 border-purple-500/30' : 'bg-purple-50/50 border-purple-200'}`}>
        <div className={`relative w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-purple-500/10 border-purple-500/20' : 'bg-white border-purple-200'}`}><Info className="w-4 h-4 text-purple-500" /></div>
        <div className="relative">
            <h4 className={`text-sm font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-purple-900'}`}>Semester {currentSem} Regular Examination</h4>
            <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-purple-700/70'}`}>All core papers for your current semester are mandatory and automatically added to your form.</p>
        </div>
      </div>
      {theoryPapers.length > 0 && <div className={`border rounded-2xl overflow-hidden shadow-sm ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`px-5 py-3 border-b flex justify-between items-center ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}><h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Theory Papers</h4></div>{theoryPapers.map(renderRow)}
      </div>}
      {labPapers.length > 0 && <div className={`border rounded-2xl overflow-hidden shadow-sm ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`px-5 py-3 border-b flex justify-between items-center ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}><h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Practicals & Sessionals</h4></div>{labPapers.map(renderRow)}
      </div>}
    </div>
  );
};

const BacklogSelector = ({ backlogs, selectedBacklogs, toggleBacklog, currentSem, sessionType, feePerSem, isDarkMode }) => {
  const [activeSemTab, setActiveSemTab] = useState('ALL');
  
  const isPaperEligible = (paperSem) => {
    if(paperSem >= currentSem) return false;
    const isPaperOdd = paperSem % 2 !== 0;
    const isSessionOdd = sessionType === 'ODD';
    return isPaperOdd === isSessionOdd;
  };

  const filteredBacklogs = activeSemTab === 'ALL' ? backlogs : backlogs.filter(b => b.sem === activeSemTab);
  const semTabs = [{ id: 'ALL', label: 'All' }, ...Array.from({length: 8}, (_, i) => ({ id: i+1, label: `Sem ${i+1}` }))];

  return (
    <div className="space-y-6">
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border p-4 rounded-xl shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
         <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${sessionType === 'EVEN' ? 'bg-purple-500/10 text-purple-500' : 'bg-orange-500/10 text-orange-500'}`}><Calendar className="w-5 h-5" /></div>
            <div>
               <h4 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Upcoming: {sessionType} Semester Exam</h4>
               <p className="text-[10px] text-gray-500 mt-0.5">You can only select backlogs corresponding to the <span className={sessionType === 'EVEN' ? "text-purple-500 font-bold" : "text-orange-500 font-bold"}>{sessionType}</span> cycle.</p>
            </div>
         </div>
         <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}><AlertCircle className="w-3.5 h-3.5 text-orange-500" /><span className="text-xs font-mono font-bold opacity-70">Fee: ₹{feePerSem} / Sem</span></div>
      </div>

      <div className="overflow-x-auto pb-2 scrollbar-hide">
        <div className={`flex gap-2`}>
           {semTabs.map((tab) => {
              const isActive = activeSemTab === tab.id;
              return (
                 <button key={tab.id} onClick={() => setActiveSemTab(tab.id)} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all border ${isActive ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20' : (isDarkMode ? 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300')}`}>
                    {tab.label}
                 </button>
              );
           })}
        </div>
      </div>

      <div className={`border rounded-2xl overflow-hidden p-2 space-y-2 min-h-[200px] ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
        {filteredBacklogs.length === 0 ? (
           <div className="h-40 flex flex-col items-center justify-center text-gray-400"><Filter className="w-8 h-8 mb-2 opacity-20" /><p className="text-xs">No backlog papers found.</p></div>
        ) : (
          filteredBacklogs.map((subject) => {
            const isEligible = isPaperEligible(subject.sem);
            const isSelected = selectedBacklogs.includes(subject.id);
            return (
              <div key={subject.id} onClick={() => isEligible && toggleBacklog(subject.id)} className={`relative p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group ${!isEligible ? (isDarkMode ? 'bg-gray-800/50 border-gray-800 opacity-50 cursor-not-allowed' : 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed') : isSelected ? 'bg-purple-600/10 border-purple-500 cursor-pointer shadow-sm' : (isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-500 cursor-pointer' : 'bg-white border-gray-200 hover:border-purple-300 cursor-pointer')}`}>
                <div className="flex items-center gap-4">
                   <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all shrink-0 ${!isEligible ? 'bg-gray-200 border-gray-300 text-gray-400 dark:bg-gray-800 dark:border-gray-700' : isSelected ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-300 dark:border-gray-600 group-hover:border-purple-400'}`}>
                      {!isEligible ? <Lock className="w-3 h-3" /> : isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                   </div>
                   <div>
                      <h4 className={`text-sm font-bold ${!isEligible ? 'text-gray-500' : isSelected ? 'text-purple-600 dark:text-purple-400' : (isDarkMode ? 'text-gray-300' : 'text-gray-800')}`}>{subject.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                         <span className={`text-[10px] font-mono px-1.5 rounded border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>{subject.code}</span>
                         <span className={`text-[10px] font-bold px-1.5 rounded ${isEligible ? 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-500/10' : 'text-gray-500 bg-gray-200 dark:bg-gray-800'}`}>Sem {subject.sem}</span>
                         {!isEligible && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1"><Lock className="w-3 h-3" /> Cycle Mismatch</span>}
                      </div>
                   </div>
                </div>
                {isEligible && <div className="text-right"><p className="text-xs font-bold text-gray-400 group-hover:text-purple-500">{isSelected ? 'Selected' : 'Add to Form'}</p></div>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const FeeBreakdown = ({ selectedBacklogs, allBacklogs, feeConfig, isDeclared, setIsDeclared, onSubmit, isSubmitting, isDarkMode }) => {
  const regularFee = feeConfig.regularTheoryFee;
  
  const selectedPapers = allBacklogs.filter(b => selectedBacklogs.includes(b.id));
  const uniqueSems = [...new Set(selectedPapers.map(b => b.sem))]; 
  const backlogFeeTotal = uniqueSems.length * feeConfig.backlogSemesterFee;
  const totalFee = regularFee + backlogFeeTotal;

  return (
    <div className={`border rounded-2xl p-6 shadow-xl space-y-6 relative overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* Decorative top strip */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
      
      <div><h3 className={`text-lg font-bold flex items-center gap-2 mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><Receipt className="w-5 h-5 text-purple-500" /> Fee Summary</h3><p className="text-xs text-gray-500">Review final amount before confirmation.</p></div>
      <div className={`space-y-3 py-4 border-t border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex justify-between items-center"><p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Regular Exam Fee</p><p className={`font-mono font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>₹{regularFee}</p></div>
        <div className="flex justify-between items-start">
          <div>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Backlog Fee</p>
            {uniqueSems.length > 0 ? (
               <div className="flex flex-col mt-0.5 gap-0.5">{uniqueSems.map(sem => (<span key={sem} className="text-[10px] font-bold text-orange-500 flex items-center gap-1">• Sem {sem} (₹{feeConfig.backlogSemesterFee})</span>))}</div>
            ) : (<span className="text-[10px] text-gray-400">None Selected</span>)}
          </div>
          <p className={`font-mono font-bold ${backlogFeeTotal > 0 ? 'text-orange-500' : 'text-gray-400'}`}>+ ₹{backlogFeeTotal}</p>
        </div>
      </div>
      <div className="flex justify-between items-center pb-2"><p className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Total Payable</p><p className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-purple-600'}`}>₹{totalFee}</p></div>
      
      <div onClick={() => setIsDeclared(!isDeclared)} className={`flex gap-3 cursor-pointer p-3 rounded-xl border transition-all ${isDeclared ? (isDarkMode ? 'bg-purple-900/20 border-purple-500/50' : 'bg-purple-50 border-purple-300') : (isDarkMode ? 'bg-gray-900/50 border-gray-700 hover:border-gray-500' : 'bg-gray-50 border-gray-200 hover:border-gray-400')}`}>
         <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${isDeclared ? 'bg-purple-500 border-purple-500' : (isDarkMode ? 'border-gray-600' : 'border-gray-400 bg-white')}`}>{isDeclared && <ShieldCheck className="w-3 h-3 text-white" />}</div>
         <p className="text-[10px] text-gray-500 font-medium leading-tight select-none">I declare the selected subjects are correct. I understand fees are non-refundable.</p>
      </div>
      
      {/* MODIFIED: Explicit "Mark as Completed" button text */}
      <button onClick={onSubmit} disabled={!isDeclared || isSubmitting} className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${!isDeclared ? (isDarkMode ? 'bg-gray-900 text-gray-600 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed') : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 hover:scale-[1.02]'}`}>
        {isSubmitting ? <span className="animate-pulse">Processing...</span> : <> <CheckCircle2 className="w-4 h-4" /> Mark as Completed & Submit </>}
      </button>
    </div>
  );
};


// =========================================================
// 2. MAIN DASHBOARD / PAGE COMPONENT
// =========================================================

const ExamForm = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { triggerPopup } = useErrorPopup();
  
  // Session Hook
  const { user, profile, loading: sessionLoading, isSessionValid } = useSessionManager(); 

  // Local State
  const [dataLoading, setDataLoading] = useState(true);
  const [apiData, setApiData] = useState(null); 
  const [history, setHistory] = useState([]);
  
  // View State
  const [view, setView] = useState('dashboard'); // 'dashboard', 'fill_form', 'view_receipt'
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [filter, setFilter] = useState('ALL'); 

  // Form State
  const [activeTab, setActiveTab] = useState('REGULAR');
  const [selectedBacklogs, setSelectedBacklogs] = useState([]);
  const [isDeclared, setIsDeclared] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userRoleDisplay = profile?.role ? profile.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Student';

  // --- Data Fetching ---
  const fetchExamData = async () => {
    try {
        const token = localStorage.getItem('sessionToken');
        
        // Fetch both Eligibility (for active form) and My Forms (for history)
        const [eligRes, formsRes] = await Promise.all([
            axios.get(`${API_BASE}/api/coe/student/eligibility/${user.id}`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { error: 'Failed to fetch eligibility' }})),
            axios.get(`${API_BASE}/api/coe/my-forms/${user.id}`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
        ]);

        setApiData(eligRes.data);
        setHistory(formsRes.data);

    } catch (e) {
        console.error("Exam data fetch error:", e);
        triggerPopup("Failed to load exam data.", "error");
    } finally {
        setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionLoading && isSessionValid && user) {
        fetchExamData();
    }
  }, [user, sessionLoading, isSessionValid]);

  useEffect(() => { window.scrollTo(0, 0); }, [view]);

  // --- Handlers ---
  const toggleBacklog = (id) => {
    setSelectedBacklogs(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    if (!isDeclared) return;
    if (!confirm("Are you sure you want to mark this as completed and submit?")) return;

    setIsSubmitting(true);
    try {
        const token = localStorage.getItem('sessionToken');
        
        const uniqueBacklogSems = [...new Set(
            apiData.backlogSubjects.filter(b => selectedBacklogs.includes(b.id)).map(b => b.sem)
        )];
        const backlogFee = uniqueBacklogSems.length * apiData.feeConfig.backlogSemesterFee;
        const totalFee = apiData.feeConfig.regularTheoryFee + backlogFee;

        const payload = {
            studentId: user.id,
            sessionId: apiData.session.id,
            studentDetails: apiData.studentProfile,
            regularSubjects: apiData.regularSubjects,
            backlogSubjects: apiData.backlogSubjects.filter(b => selectedBacklogs.includes(b.id)),
            feeBreakdown: {
                regularFee: apiData.feeConfig.regularTheoryFee,
                backlogFee: backlogFee,
                totalPaid: totalFee
            }
        };

        await axios.post(`${API_BASE}/api/coe/student/submit-form`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        triggerPopup("Exam Form Successfully Filled & Completed!", "success");
        setView('dashboard');
        setDataLoading(true);
        fetchExamData(); 
    } catch (e) {
        triggerPopup(e.response?.data?.error || "Submission Failed", "error");
    } finally {
        setIsSubmitting(false);
    }
  };

  // --- Handle Marking an existing unpaid form as completed ---
  const handleMarkPaymentCompleted = async () => {
      if(!confirm("Mark this exam registration as completed and paid?")) return;
      try {
          const token = localStorage.getItem('sessionToken');
          await axios.put(`${API_BASE}/api/coe/student/update-form-payment/${selectedReceipt._id}`, {}, {
              headers: { Authorization: `Bearer ${token}` }
          });
          
          // Optimistically update the UI to show success
          setSelectedReceipt(prev => ({ ...prev, paymentStatus: 'Paid' }));
          setHistory(prev => prev.map(form => form._id === selectedReceipt._id ? { ...form, paymentStatus: 'Paid' } : form));
          
          triggerPopup("Form successfully updated and marked as completed!", "success");
      } catch (e) {
          triggerPopup("Failed to update status", "error");
      }
  };

  // --- RENDER LOGIC ---

  if (sessionLoading || dataLoading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <LoadingSpinner message="Loading Portal..." />
      </div>
    );
  }

  // Build Display Cards for Dashboard
  const displayCards = [];
  
  // 1. Current Active Session (If eligible and not yet paid/submitted)
  const hasCurrentInHistory = history.some(h => h.sessionId?._id === apiData?.session?.id);
  if (apiData && apiData.eligible && !apiData.existingForm && !hasCurrentInHistory) {
      displayCards.push({
          id: 'current_pending',
          label: apiData.session.label,
          session: (apiData.session.type === 'ODD' || apiData.session.type === 'EVEN') ? `${apiData.session.type} CYCLE` : 'CURRENT EXAM',
          status: 'PENDING',
          payment: 'ACTION_REQUIRED',
          isCurrent: true,
          action: () => setView('fill_form')
      });
  }

  // 2. History / Archived Sessions
  history.forEach(form => {
      const isPaid = form.paymentStatus === 'Paid'; // Check payment first
      
      displayCards.push({
          id: form._id,
          label: form.sessionId?.sessionName || 'Unknown Session',
          session: form.sessionId?.cycle ? `${form.sessionId.cycle.toUpperCase()} CYCLE` : 'EXAM',
          status: isPaid ? 'SUBMITTED' : 'PENDING', // FIXED: Only count as submitted if paid
          payment: isPaid ? 'PAID' : 'ACTION_REQUIRED',
          isCurrent: false,
          formData: form,
          action: () => {
              setSelectedReceipt(form);
              setView('view_receipt');
          }
      });
  });

  const pendingCount = displayCards.filter(c => c.payment === 'ACTION_REQUIRED').length;
  const submittedCount = displayCards.filter(c => c.status === 'SUBMITTED').length;

  const filteredCards = displayCards.filter(c => {
      if (filter === 'ALL') return true;
      if (filter === 'ACTION') return c.payment === 'ACTION_REQUIRED' || c.isCurrent;
      if (filter === 'ARCHIVE') return c.status === 'SUBMITTED' && !c.isCurrent;
      return true;
  });

  // Distinct colors for Exam Form Dashboard
  const getStatusConfig = (sem) => {
    if (sem.payment === 'ACTION_REQUIRED') return { color: 'orange', icon: AlertCircle, text: 'Action Needed' };
    if (sem.isCurrent) return { color: 'purple', icon: ClipboardEdit, text: 'Open for Registration' };
    return { color: 'emerald', icon: ClipboardCheck, text: 'Form Submitted' };
  };

  return (
    <div className={`min-h-screen font-sans relative transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Background Gradient - Distinct Purple Hue */}
      <div className={`fixed top-0 left-0 w-full h-[300px] pointer-events-none ${isDarkMode ? 'bg-gradient-to-b from-purple-900/10 to-transparent' : 'bg-gradient-to-b from-purple-100/50 to-transparent'}`} />
      
      {/* ================= HEADER ================= */}
      <GlassHeader variant="dashboard">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => view === 'dashboard' ? navigate(-1) : setView('dashboard')} 
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-purple-100 text-purple-600'}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <UserProfileDropdown user={user} onOptionClick={() => {}} />
            <div className="flex flex-col">
              <div className={`flex items-center text-sm font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                <span className="opacity-70">{userRoleDisplay} Dashboard</span>
                <ChevronRight className="w-4 h-4 mx-1 opacity-50" />
                <span className="text-purple-500">Exam Registration</span>
              </div>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${isDarkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                  {profile?.college || 'College'}
                </span>
                <span className="text-[10px] text-emerald-500 flex items-center">
                  <Wifi className="w-3 h-3 mr-1" />
                  Online
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2"><CollegeBannerLogo /></div>
            <ThemeToggle />
          </div>
        </div>
      </GlassHeader>

      {/* ================= BODY ================= */}
      <div className="relative z-10 max-w-7xl mx-auto space-y-8 pt-32 pb-32 px-6">
        
        {/* VIEW: DASHBOARD */}
        {view === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
             {/* Header Section */}
             <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
                <div>
                   <h1 className={`text-4xl font-bold tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Exam Registration Portal</h1>
                   <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-xl`}>Complete your examination forms, select electives/backlogs, and securely finalize your registration.</p>
                </div>
                <div className="flex gap-4 w-full lg:w-auto">
                   <div className={`flex-1 lg:w-40 border p-3 rounded-2xl flex items-center gap-3 shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                      <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500"><ClipboardCheck size={18} /></div>
                      <div>
                         <p className={`text-xl font-bold leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{submittedCount}</p>
                         <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Submitted</p>
                      </div>
                   </div>
                   {pendingCount > 0 && (
                      <div className={`flex-1 lg:w-48 border p-3 rounded-2xl flex items-center gap-3 animate-pulse ${isDarkMode ? 'bg-orange-500/5 border-orange-500/20' : 'bg-orange-50 border-orange-200'}`}>
                         <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-500"><AlertCircle size={18} /></div>
                         <div>
                            <p className={`text-xl font-bold leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{pendingCount}</p>
                            <p className="text-[10px] text-orange-500 font-bold uppercase mt-1">Action Needed</p>
                         </div>
                      </div>
                   )}
                </div>
             </div>

             {/* Filters */}
             <div className={`flex items-center gap-2 overflow-x-auto pb-2 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                {['ALL', 'ACTION', 'ARCHIVE'].map((f) => (
                   <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${filter === f ? (isDarkMode ? 'bg-white text-black' : 'bg-purple-600 text-white') : (isDarkMode ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50' : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50')}`}>
                      {f === 'ALL' && <Filter size={14} />}
                      {f === 'ACTION' && <Sparkles size={14} />}
                      {f === 'ARCHIVE' && <History size={14} />}
                      {f === 'ALL' ? 'All Forms' : f === 'ACTION' ? 'Action Required' : 'Archive'}
                   </button>
                ))}
             </div>

             {/* Grid - Docket Style */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCards.length === 0 && (
                    <div className={`col-span-full text-center py-20 border-2 border-dashed rounded-3xl ${isDarkMode ? 'border-gray-700 text-gray-500' : 'border-gray-300 text-gray-400'}`}>
                        No exam records found.
                    </div>
                )}
                <AnimatePresence>
                {filteredCards.map((sem) => {
                   const status = getStatusConfig(sem);
                   
                   return (
                      <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} key={sem.id} onClick={sem.action} className={`relative group overflow-hidden rounded-2xl border-y border-r border-l-[6px] transition-all duration-300 flex flex-col min-h-[200px] cursor-pointer hover:shadow-xl hover:-translate-y-1 ${isDarkMode ? 'bg-gray-800 border-y-gray-700 border-r-gray-700' : 'bg-white border-y-gray-200 border-r-gray-200'} border-l-${status.color}-500 ${sem.isCurrent && !isDarkMode && 'shadow-[0_0_20px_rgba(168,85,247,0.1)]'} ${sem.isCurrent && isDarkMode && 'shadow-[0_0_30px_rgba(168,85,247,0.1)]'} ${sem.payment === 'ACTION_REQUIRED' && (isDarkMode ? 'bg-orange-500/5' : 'bg-orange-50')}`}>
                         <div className="p-6 flex justify-between items-start">
                            <div>
                               <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{sem.session}</p>
                               <h3 className={`text-xl font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{sem.label}</h3>
                            </div>
                            <div className={`p-2.5 rounded-full border ${sem.isCurrent ? 'bg-purple-500 text-white border-purple-400' : sem.payment === 'ACTION_REQUIRED' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                               <status.icon size={20} />
                            </div>
                         </div>
                         <div className="px-6 flex-1">
                               <div className="flex flex-wrap gap-2 mt-2">
                                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border bg-opacity-10 text-${status.color}-600 dark:text-${status.color}-400 border-${status.color}-500/20 bg-${status.color}-500/10`}>{status.text}</span>
                               </div>
                         </div>
                         <div className={`p-4 mt-auto border-t transition-colors ${sem.isCurrent ? 'bg-purple-50 border-purple-100 dark:bg-purple-500/10 dark:border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white' : sem.payment === 'ACTION_REQUIRED' ? 'bg-orange-50 border-orange-100 dark:bg-orange-500/10 dark:border-orange-500/20 group-hover:bg-orange-500 group-hover:text-white' : isDarkMode ? 'bg-black/20 border-gray-700 group-hover:bg-gray-700 group-hover:text-white' : 'bg-gray-50 border-gray-100 group-hover:bg-gray-100 group-hover:text-gray-900'}`}>
                            <div className="flex items-center justify-between">
                               <span className={`text-xs font-bold ${sem.payment === 'ACTION_REQUIRED' ? 'text-orange-600 dark:text-orange-400 group-hover:text-white' : sem.isCurrent ? 'text-purple-600 dark:text-purple-400 group-hover:text-white' : isDarkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'}`}>{sem.payment === 'ACTION_REQUIRED' ? 'Action Needed' : 'View Receipt'}</span>
                               <ArrowRight className="w-4 h-4" />
                            </div>
                         </div>
                      </motion.div>
                   );
                })}
                </AnimatePresence>
             </div>
          </motion.div>
        )}

        {/* VIEW: FILL ACTIVE FORM */}
        {view === 'fill_form' && apiData && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <button onClick={() => setView('dashboard')} className={`group flex items-center gap-2 text-sm font-medium transition-colors w-fit ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-purple-600'}`}>
                  <div className={`p-1.5 rounded-lg border transition-all ${isDarkMode ? 'bg-gray-800/50 border-transparent group-hover:border-gray-700' : 'bg-white border-gray-200 group-hover:border-purple-300'}`}>
                     <ArrowLeft className="w-4 h-4" />
                  </div>
                  <span>Back to Portal</span>
                </button>

                <ExamHeader profile={apiData.studentProfile} session={apiData.session} isDarkMode={isDarkMode} />

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                  <div className="xl:col-span-8 space-y-6">
                     <ExamTabs activeTab={activeTab} setActiveTab={setActiveTab} isDarkMode={isDarkMode} />

                     <AnimatePresence mode='wait'>
                        {activeTab === 'REGULAR' ? (
                          <motion.div key="REGULAR" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                             <RegularSubjectList subjects={apiData.regularSubjects} currentSem={apiData.studentProfile.currentSem} isDarkMode={isDarkMode} />
                          </motion.div>
                        ) : (
                          <motion.div key="BACKLOG" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                             <BacklogSelector 
                                backlogs={apiData.backlogSubjects}
                                selectedBacklogs={selectedBacklogs} 
                                toggleBacklog={toggleBacklog}
                                currentSem={apiData.studentProfile.currentSem}
                                sessionType={apiData.session.type} 
                                feePerSem={apiData.feeConfig.backlogSemesterFee}
                                isDarkMode={isDarkMode}
                             />
                          </motion.div>
                        )}
                     </AnimatePresence>
                  </div>

                  <div className="xl:col-span-4 space-y-6 sticky top-6">
                     <FeeBreakdown 
                        selectedBacklogs={selectedBacklogs} 
                        allBacklogs={apiData.backlogSubjects}
                        feeConfig={apiData.feeConfig}
                        isDeclared={isDeclared}
                        setIsDeclared={setIsDeclared}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        isDarkMode={isDarkMode}
                     />
                     <div className="text-center">
                       <button className="text-[11px] text-gray-500 hover:text-purple-500 transition-colors border-b border-transparent hover:border-purple-500 pb-0.5">
                         Trouble with the form? Contact Examination Cell
                       </button>
                     </div>
                  </div>
                </div>
            </motion.div>
        )}

        {/* VIEW: ARCHIVED RECEIPT */}
        {view === 'view_receipt' && selectedReceipt && (
             <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto space-y-6">
                 <button onClick={() => setView('dashboard')} className={`group flex items-center gap-2 text-sm font-medium transition-colors w-fit ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-purple-600'}`}>
                  <div className={`p-1.5 rounded-lg border transition-all ${isDarkMode ? 'bg-gray-800/50 border-transparent group-hover:border-gray-700' : 'bg-white border-gray-200 group-hover:border-purple-300'}`}>
                     <ArrowLeft className="w-4 h-4" />
                  </div>
                  <span>Back to Portal</span>
                </button>

                <div className={`p-8 rounded-3xl border shadow-xl relative overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    
                    <div className="flex justify-between items-start mb-8 border-b pb-6 border-gray-200 dark:border-gray-700">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight mb-1 flex items-center gap-2"><Receipt className="w-6 h-6 text-emerald-500"/> Registration Receipt</h2>
                            <p className="text-sm opacity-60 font-mono">ID: {selectedReceipt._id.toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                            {selectedReceipt.paymentStatus === 'Paid' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold uppercase tracking-wider">
                                    <CheckCircle2 size={14} /> Processed
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 rounded-lg text-xs font-bold uppercase tracking-wider">
                                    <AlertCircle size={14} /> Unpaid
                                </span>
                            )}
                            <p className="text-[10px] opacity-50 mt-2 font-mono">{new Date(selectedReceipt.createdAt).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className={`grid grid-cols-2 gap-6 p-6 rounded-2xl mb-8 border ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <div>
                            <p className="text-[10px] font-bold uppercase opacity-50 mb-1 flex items-center gap-1"><User size={12}/> Candidate</p>
                            <p className="font-bold text-lg">{selectedReceipt.studentName}</p>
                            <p className="text-sm font-mono opacity-80">{selectedReceipt.rollNo}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase opacity-50 mb-1 flex items-center gap-1"><Calendar size={12}/> Exam Session</p>
                            <p className="font-bold text-lg">{selectedReceipt.sessionId?.sessionName || 'Exam Session'}</p>
                            <p className="text-sm opacity-80">{selectedReceipt.sessionId?.cycle} Cycle</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-3 flex items-center gap-2"><Layers size={14}/> Verified Subject Roster</p>
                        <div className={`border rounded-xl overflow-hidden ${isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white shadow-sm'}`}>
                            {selectedReceipt.verifiedSubjects?.length > 0 ? (
                                selectedReceipt.verifiedSubjects.map((sub, i) => (
                                    <div key={i} className={`px-5 py-3.5 flex gap-4 items-center border-b last:border-0 ${isDarkMode ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-100 hover:bg-gray-50'}`}>
                                        <span className={`text-xs font-mono font-bold w-20 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>{sub.code}</span>
                                        <span className="text-sm font-bold">{sub.name}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-5 text-sm opacity-50 text-center">No subject details recorded.</div>
                            )}
                        </div>
                    </div>

                    {/* MODIFIED: Pending Payment Box to Mark as Completed */}
                    {selectedReceipt.paymentStatus === 'Paid' ? (
                        <div className={`p-5 rounded-xl flex justify-between items-center border-2 border-dashed ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-emerald-50/50 border-emerald-200'}`}>
                            <span className="font-bold text-sm uppercase tracking-wider opacity-70">Payment Settled</span>
                            <div className="text-right">
                                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                    ₹{selectedReceipt.feeBreakdown?.totalPaid || 'PAID'}
                                </p>
                                <p className="text-[10px] font-bold uppercase opacity-50">Transaction Successful</p>
                            </div>
                        </div>
                    ) : (
                        <div className={`p-5 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 border-2 border-dashed ${isDarkMode ? 'bg-gray-900 border-orange-500/30' : 'bg-orange-50 border-orange-200'}`}>
                            <div>
                                <span className="font-bold text-sm uppercase tracking-wider text-orange-500 flex items-center gap-2 mb-1">
                                    <AlertCircle size={16} /> Pending Payment
                                </span>
                                <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Please mark this transaction as completed to finalize your exam registration.</p>
                            </div>
                            <button 
                                onClick={handleMarkPaymentCompleted}
                                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
                            >
                                <CheckCircle2 size={16} /> Mark as Completed
                            </button>
                        </div>
                    )}
                </div>
             </motion.div>
        )}

      </div>
    </div>
  );
};

export default ExamForm;