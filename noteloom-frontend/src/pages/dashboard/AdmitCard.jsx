import { API_BASE } from '@/utils/config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Lock, FileText, CheckCircle2, AlertCircle, 
  History, Filter, Sparkles, QrCode, ShieldCheck, 
  Printer, Download, Share2, ChevronRight, Wifi
} from 'lucide-react';

// Common Components
import { useTheme } from '@/context/ThemeContext.jsx';
import { useSessionManager } from '@/hooks/useSessionManager.js';
import GlassHeader from '@/components/common/GlassHeader.jsx';
import UserProfileDropdown from '@/components/common/UserProfileDropdown.jsx';
import ThemeToggle from '@/components/common/ThemeToggle.jsx';
import CollegeBannerLogo from '@/components/common/CollegeBannerLogo.jsx';

// Assets
import LoadingSpinner from '@/components/common/LoadingSpinner';



/* =========================================================================
   1. SUB-COMPONENTS (Printable Views)
   ========================================================================= */

const AdmitActionToolbar = ({ onPrint }) => (
  <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 no-print">
    <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 p-2 rounded-2xl shadow-2xl shadow-black/50 backdrop-blur-md">
      <button onClick={onPrint} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors">
         <Printer size={16} /> Print Admit Card
      </button>
      <div className="w-px h-8 bg-gray-700 mx-1"></div>
      <button className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Download PDF">
         <Download size={20} />
      </button>
      <button className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Share">
         <Share2 size={20} />
      </button>
    </div>
  </div>
);

const InstructionList = ({ instructions }) => (
  <div className="mt-auto pt-6">
     <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
        <AlertCircle size={16} className="text-gray-500" /> Important Instructions
     </h3>
     <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-5">
        {instructions.map((rule, i) => (
           <li key={i} className="leading-relaxed">{rule}</li>
        ))}
     </ul>
  </div>
);

const ExamTimeTable = ({ schedule }) => (
  <div className="mt-2">
    <div className="bg-gray-900 text-white px-3 py-1.5 text-xs font-bold uppercase tracking-widest w-fit mb-0.5">
       Examination Schedule
    </div>
    <table className="w-full text-sm border-2 border-gray-800">
       <thead className="bg-gray-100 text-gray-900 border-b-2 border-gray-800">
          <tr>
             <th className="px-3 py-2 text-left font-bold border-r border-gray-400 w-[140px]">Date</th>
             <th className="px-3 py-2 text-left font-bold border-r border-gray-400 w-[160px]">Time</th>
             <th className="px-3 py-2 text-left font-bold border-r border-gray-400 w-[100px]">Code</th>
             <th className="px-3 py-2 text-left font-bold border-r border-gray-400">Subject Name</th>
             <th className="px-3 py-2 text-center font-bold w-[120px]">Invigilator</th>
          </tr>
       </thead>
       <tbody className="divide-y divide-gray-300">
          {schedule.length > 0 ? schedule.map((exam, idx) => (
             <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-3 py-2 border-r border-gray-300 font-medium text-xs">
                   {exam.date} <br/>
                   <span className="text-[10px] uppercase text-gray-500 font-bold">{exam.day}</span>
                </td>
                <td className="px-3 py-2 border-r border-gray-300 font-mono text-xs text-gray-500">{exam.time}</td>
                <td className="px-3 py-2 border-r border-gray-300 font-mono font-bold">{exam.code}</td>
                <td className="px-3 py-2 border-r border-gray-300 font-bold text-gray-900">
                   {exam.subject}
                </td>
                <td className="px-3 py-2"></td>
             </tr>
          )) : (
            <tr>
                <td colSpan="5" className="px-3 py-6 text-center text-gray-500 italic">No subjects registered for this examination.</td>
            </tr>
          )}
       </tbody>
    </table>
  </div>
);

const StudentDetailsHeader = ({ candidate }) => (
  <div className="flex gap-6">
    <div className="w-[140px] shrink-0">
       <div className="h-[170px] w-full border border-gray-400 p-1 bg-white shadow-sm flex items-center justify-center bg-gray-100">
           {candidate.photoUrl ? (
               <img src={candidate.photoUrl} alt="Candidate" className="w-full h-full object-cover grayscale contrast-125" />
           ) : (
               <span className="text-gray-400 text-xs font-bold uppercase text-center">Photo<br/>Not<br/>Provided</span>
           )}
       </div>
    </div>
    <div className="flex-1 border border-gray-400 text-sm">
       <div className="flex border-b border-gray-400">
          <div className="w-1/2 p-2 border-r border-gray-400">
             <p className="text-[10px] text-gray-500 font-bold uppercase">Name of Candidate</p>
             <p className="font-bold text-lg uppercase">{candidate.name}</p>
          </div>
          <div className="w-1/2 p-2 bg-gray-50">
             <p className="text-[10px] text-gray-500 font-bold uppercase">Roll Number</p>
             <p className="font-mono font-bold text-lg">{candidate.examRollNo}</p>
          </div>
       </div>
       <div className="flex border-b border-gray-400">
          <div className="w-1/2 p-2 border-r border-gray-400">
             <p className="text-[10px] text-gray-500 font-bold uppercase">Registration No</p>
             <p className="font-mono font-bold">{candidate.registrationNo}</p>
          </div>
          <div className="w-1/2 p-2">
             <p className="text-[10px] text-gray-500 font-bold uppercase">Course / Stream</p>
             <p className="font-bold">{candidate.program} - {candidate.stream}</p>
          </div>
       </div>
       <div className="p-2 bg-gray-50">
          <p className="text-[10px] text-gray-500 font-bold uppercase">Examination Center</p>
          <p className="font-bold uppercase text-gray-800">{candidate.examCenter}</p>
          <p className="text-xs font-mono text-gray-600">Code: {candidate.centerCode}</p>
       </div>
    </div>
    <div className="w-[120px] shrink-0 flex flex-col items-center justify-center border border-gray-300 p-2 bg-white">
       <QrCode className="w-full h-full text-gray-900" strokeWidth={1.5} />
       <p className="text-[9px] font-bold mt-1 text-center">SCAN FOR<br/>VERIFICATION</p>
    </div>
  </div>
);

const AdmitCardPaper = ({ candidate, schedule, instructions, label }) => (
  <div id="admit-card-print" className="bg-white text-gray-900 shadow-2xl mx-auto w-full max-w-[210mm] min-h-[297mm] relative flex flex-col print:shadow-none print:w-full print:m-0">
    {/* Frame & Watermark */}
    <div className="absolute inset-2 border-2 border-gray-800 pointer-events-none z-20"></div>
    <div className="absolute inset-3 border border-gray-400 pointer-events-none z-20"></div>
    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden">
       <div className="w-[600px] h-[600px] border-[20px] border-gray-900 rounded-full flex items-center justify-center">
          <h1 className="text-[150px] font-black tracking-tighter text-gray-900 -rotate-12">IEM</h1>
       </div>
    </div>

    {/* Header */}
    <div className="relative z-10 px-10 pt-10 pb-6 border-b-2 border-gray-800">
       <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gray-900 text-white flex items-center justify-center rounded-full shrink-0">
             <ShieldCheck size={40} strokeWidth={1.5} />
          </div>
          <div className="flex-1 text-center uppercase">
             <h1 className="text-3xl font-black tracking-wide text-gray-900 leading-none mb-2">{candidate.examCenter}</h1>
             <p className="text-sm font-bold text-gray-600 tracking-widest mb-1">Autonomous • NAAC 'A' Grade • Approved by AICTE</p>
             <div className="inline-block px-6 py-1 bg-gray-900 text-white text-sm font-bold tracking-[0.2em] mt-2">Admit Card - {label}</div>
          </div>
          <div className="w-20 text-center">
             <div className="w-20 h-20 border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                <span className="text-[10px] font-bold text-gray-400">OFFICIAL<br/>STAMP</span>
             </div>
          </div>
       </div>
    </div>

    {/* Body */}
    <div className="relative z-10 px-10 py-8 flex-1 flex flex-col gap-8">
       <StudentDetailsHeader candidate={candidate} />
       <ExamTimeTable schedule={schedule} />
       <InstructionList instructions={instructions} />
    </div>

    {/* Footer */}
    <div className="relative z-10 px-10 pb-8 mt-auto">
       <div className="flex justify-between items-end pt-4 border-t border-gray-300">
          <div className="text-center">
             <div className="w-40 h-10 mb-2 border-b border-gray-400 flex items-end justify-center pb-1"></div>
             <p className="text-[10px] font-bold uppercase text-gray-500">Signature of Candidate</p>
          </div>
          <div className="text-center">
             <div className="w-40 h-12 mb-1 flex items-center justify-center relative">
                <span className="font-script text-2xl text-blue-800 font-bold -rotate-6 scale-125">Dr. A. Controller</span>
                <div className="absolute inset-0 border-2 border-blue-900/20 rounded-lg opacity-50"></div>
             </div>
             <p className="text-[10px] font-bold uppercase text-gray-500">Controller of Examinations</p>
          </div>
       </div>
       <div className="text-center mt-6">
          <p className="text-[10px] font-mono text-gray-400">
             System Generated ID: {Math.random().toString(36).substr(2, 9).toUpperCase()} • Date: {new Date().toLocaleDateString()}
          </p>
       </div>
    </div>
  </div>
);

/* =========================================================================
   2. MAIN DASHBOARD COMPONENT
   ========================================================================= */

const AdmitCard = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { user, profile } = useSessionManager();
  
  const [selectedSem, setSelectedSem] = useState(null); 
  const [filter, setFilter] = useState('ALL'); 
  const [loading, setLoading] = useState(true);
  
  // Real State Data
  const [history, setHistory] = useState([]);
  const [candidate, setCandidate] = useState(null);

  // Default Instructions
  const standardInstructions = [
    "This Admit Card is electronically generated and must be presented at the examination hall.",
    "Candidates must report to the center 30 minutes before the commencement of the exam.",
    "Mobile phones, smartwatches, and programmable calculators are strictly prohibited.",
    "Candidate must sign the admit card in the presence of the invigilator."
  ];

  const userRoleDisplay = profile?.role ? profile.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Student';

  // --- Backend Integration Logic ---
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const token = localStorage.getItem('sessionToken');
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch Candidate Forms (History)
        const formsRes = await axios.get(`${API_BASE}/api/coe/my-forms/${user.id}`, { headers });
        const formsData = formsRes.data || [];

        // 2. Map Backend Forms to UI History Array
        const mappedHistory = formsData.map((form, index) => ({
            id: form._id,
            label: form.sessionId?.sessionName || `Exam Form ${index + 1}`,
            session: form.sessionId?.cycle ? `${form.sessionId.cycle} Cycle` : 'Examination',
            status: form.admitCardGenerated ? "GENERATED" : "PENDING",
            payment: form.paymentStatus === 'Paid' ? 'PAID' : 'UNPAID',
            isCurrent: index === formsData.length - 1, // Assume last fetched is current
            subjects: form.verifiedSubjects || []
        }));

        setHistory(mappedHistory);

        // 3. Set Candidate Profile Details
        setCandidate({
            name: profile?.name || user?.name || "Unknown Candidate",
            program: profile?.course || "UG/PG",
            stream: profile?.stream || "General",
            registrationNo: profile?.uid || "N/A",
            examRollNo: profile?.rollNo || "N/A",
            examCenter: profile?.college || "Institute Name Missing",
            centerCode: "IEM-C-01",
            photoUrl: "" // Add a logic to fetch user profile pic if available
        });
        
      } catch (error) {
        console.error("Failed to fetch admit card data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, profile]);

  useEffect(() => { window.scrollTo(0, 0); }, [selectedSem]);

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <LoadingSpinner message="Loading Vault..." />
      </div>
    );
  }

  const pendingCount = history.filter(s => s.payment === 'UNPAID').length;
  const readyCount = history.filter(s => s.status === 'GENERATED').length;

  const filteredHistory = history.filter(sem => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTION') return sem.payment === 'UNPAID' || sem.isCurrent;
    if (filter === 'ARCHIVE') return sem.status === 'GENERATED' && !sem.isCurrent;
    return true;
  });

  const handleCardClick = (sem) => {
    if (sem.status === 'LOCKED') return;
    if (sem.payment === 'UNPAID') {
       if(window.confirm(`Payment for ${sem.label} is pending. Redirect to Exam Registration?`)) {
          navigate('/dashboard/exam_form');
       }
    } else {
       setSelectedSem(sem);
    }
  };

  const getStatusConfig = (sem) => {
    if (sem.status === 'LOCKED') return { color: 'gray', icon: Lock, text: 'Locked' };
    if (sem.payment === 'UNPAID') return { color: 'orange', icon: AlertCircle, text: 'Payment Pending' };
    if (sem.isCurrent) return { color: 'indigo', icon: Sparkles, text: 'Live & Ready' };
    return { color: 'green', icon: CheckCircle2, text: 'Generated' };
  };

  return (
    <div className={`min-h-screen font-sans relative transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Dynamic Background Gradient */}
      <div className={`fixed top-0 left-0 w-full h-[300px] pointer-events-none ${isDarkMode ? 'bg-gradient-to-b from-gray-800 to-transparent' : 'bg-gradient-to-b from-blue-100/50 to-transparent'}`} />
      
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #admit-card-print, #admit-card-print * { visibility: visible; }
          #admit-card-print { position: absolute; left: 0; top: 0; margin: 0; width: 100%; }
          .no-print { display: none !important; }
        }
        .font-script { font-family: 'Brush Script MT', cursive; }
      `}</style>

      {/* ================= HEADER ================= */}
      <GlassHeader variant="dashboard">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate(-1)} 
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-blue-100 text-blue-600'}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <UserProfileDropdown user={user} onOptionClick={() => {}} />

            <div className="flex flex-col">
              <div className={`flex items-center text-sm font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                <span className="opacity-70">{userRoleDisplay} Dashboard</span>
                <ChevronRight className="w-4 h-4 mx-1 opacity-50" />
                <span className="text-blue-500">Admit Card Vault</span>
              </div>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
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
        
        {/* Only show Back to Vault when viewing a specific admit card */}
        {selectedSem && (
          <div className="flex items-center justify-start no-print mb-4">
            <button 
              onClick={() => setSelectedSem(null)}
              className={`group flex items-center gap-3 text-sm font-medium transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-blue-600'}`}
            >
              <div className={`p-2 rounded-xl border transition-all ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50 group-hover:border-gray-600' : 'bg-white border-gray-200 shadow-sm group-hover:border-blue-300'}`}>
                 <ArrowLeft className="w-4 h-4" />
              </div>
              <span>Back to Vault</span>
            </button>
          </div>
        )}

        {!selectedSem ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
             <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
                <div>
                   <h1 className={`text-4xl font-bold tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Admit Card Vault</h1>
                   <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-xl`}>Securely access your exam authorization documents. Past records are archived automatically.</p>
                </div>
                <div className="flex gap-4 w-full lg:w-auto">
                   <div className={`flex-1 lg:w-40 border p-3 rounded-2xl flex items-center gap-3 shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                      <div className="p-2.5 bg-green-500/10 rounded-xl text-green-500"><FileText size={18} /></div>
                      <div>
                         <p className={`text-xl font-bold leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{readyCount}</p>
                         <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Ready</p>
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

             <div className={`flex items-center gap-2 overflow-x-auto pb-2 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                {['ALL', 'ACTION', 'ARCHIVE'].map((f) => (
                   <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${filter === f ? (isDarkMode ? 'bg-white text-black' : 'bg-blue-600 text-white') : (isDarkMode ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50')}`}>
                      {f === 'ALL' && <Filter size={14} />}
                      {f === 'ACTION' && <Sparkles size={14} />}
                      {f === 'ARCHIVE' && <History size={14} />}
                      {f === 'ALL' ? 'All Semesters' : f === 'ACTION' ? 'Action Required' : 'Archive'}
                   </button>
                ))}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {history.length === 0 && (
                    <div className={`col-span-full text-center py-20 border-2 border-dashed rounded-3xl ${isDarkMode ? 'border-gray-700 text-gray-500' : 'border-gray-300 text-gray-400'}`}>
                        No exam records found. Submit an exam form to generate your admit card.
                    </div>
                )}
                <AnimatePresence>
                {filteredHistory.map((sem) => {
                   const status = getStatusConfig(sem);
                   const isLocked = sem.status === 'LOCKED';
                   
                   return (
                      <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} key={sem.id} onClick={() => handleCardClick(sem)} className={`relative group overflow-hidden rounded-2xl border transition-all duration-300 flex flex-col min-h-[220px] ${isLocked ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer hover:shadow-xl hover:-translate-y-1'} ${isDarkMode ? (isLocked ? 'bg-gray-900 border-gray-800' : 'bg-gray-800 border-gray-700 hover:border-gray-500') : (isLocked ? 'bg-gray-100 border-gray-200' : 'bg-white border-gray-200 hover:border-blue-300')} ${sem.isCurrent && !isDarkMode && 'border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)] ring-1 ring-blue-400/20'} ${sem.isCurrent && isDarkMode && 'border-indigo-500/40 shadow-[0_0_30px_rgba(99,102,241,0.1)] ring-1 ring-indigo-500/20'} ${sem.payment === 'UNPAID' && (isDarkMode ? 'border-orange-500/30 bg-orange-500/5' : 'border-orange-300 bg-orange-50')}`}>
                         <div className="p-5 flex justify-between items-start">
                            <div>
                               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{sem.session}</p>
                               <h3 className={`text-xl font-bold mt-1 ${isLocked ? 'text-gray-400' : (isDarkMode ? 'text-white' : 'text-gray-900')}`}>{sem.label}</h3>
                            </div>
                            <div className={`p-2 rounded-lg backdrop-blur-md border ${sem.isCurrent ? 'bg-indigo-500 text-white border-indigo-400' : sem.payment === 'UNPAID' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : isLocked ? 'bg-gray-200 text-gray-500 border-gray-300 dark:bg-gray-800 dark:border-gray-700' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                               <status.icon size={18} />
                            </div>
                         </div>
                         <div className="px-5 flex-1">
                            {!isLocked && (
                               <div className="flex flex-wrap gap-2">
                                  {sem.subjects?.length > 0 && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 uppercase">{sem.subjects.length} Subjects</span>}
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-opacity-10 text-${status.color}-600 dark:text-${status.color}-400 border-${status.color}-500/20 bg-${status.color}-500/10`}>{status.text}</span>
                               </div>
                            )}
                         </div>
                         <div className={`p-4 mt-auto border-t transition-colors ${sem.isCurrent ? 'bg-indigo-50 border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white' : sem.payment === 'UNPAID' ? 'bg-orange-50 border-orange-100 dark:bg-orange-500/10 dark:border-orange-500/20 group-hover:bg-orange-500 group-hover:text-white' : isDarkMode ? 'bg-black/20 border-gray-800 group-hover:bg-white group-hover:text-black' : 'bg-gray-50 border-gray-100 group-hover:bg-blue-600 group-hover:text-white'}`}>
                            <div className="flex items-center justify-between">
                               <span className={`text-xs font-bold ${isLocked ? 'text-gray-500' : sem.payment === 'UNPAID' ? 'text-orange-600 dark:text-orange-400 group-hover:text-white' : sem.isCurrent ? 'text-indigo-600 dark:text-indigo-300 group-hover:text-white' : isDarkMode ? 'text-gray-400 group-hover:text-black' : 'text-gray-600 group-hover:text-white'}`}>{isLocked ? 'Not Available' : sem.payment === 'UNPAID' ? 'Pay Fees Now' : 'View Document'}</span>
                               {!isLocked && <ArrowLeft className="rotate-180 w-4 h-4" />}
                            </div>
                         </div>
                      </motion.div>
                   );
                })}
                </AnimatePresence>
             </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
             <div className="no-print mb-6 flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 px-4 py-3 rounded-xl text-blue-600 dark:text-blue-300 text-sm">
                <CheckCircle2 size={16} />
                <span>You are viewing the official admit card for <strong>{selectedSem.label}</strong>. Ensure printer settings are set to A4.</span>
             </div>
             
             <div className="flex justify-center w-full">
                 <AdmitCardPaper 
                    candidate={candidate} 
                    // Maps the saved subjects from the backend form into the schedule table format
                    schedule={selectedSem.subjects.map(sub => ({
                        date: "To Be Announced",
                        day: "-",
                        time: "TBA",
                        code: sub.code,
                        subject: sub.name
                    }))} 
                    instructions={standardInstructions}
                    label={selectedSem.label}
                 />
             </div>
             
             <div className="no-print mt-8">
                <AdmitActionToolbar onPrint={() => window.print()} />
             </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdmitCard;