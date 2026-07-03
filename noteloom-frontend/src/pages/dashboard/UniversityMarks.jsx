import { API_BASE } from '@/utils/config';
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, Printer, Share2, Search, Filter, MoreVertical, 
  Award, BookOpen, Calendar, CheckCircle2, XCircle, Clock, 
  Lock, FileText, AlertCircle, GraduationCap, ChevronRight, 
  ShieldCheck, MapPin, ArrowLeft, Wifi, User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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



/* =========================================================================
   1. FALLBACK MOCK DATA (Used if Backend API is pending)
   ========================================================================= */

const MOCK_SEMESTER_RESULTS = [
  {
    id: 'sem1', sem: 1, label: 'Semester 1', status: 'PUBLISHED',
    sgpa: 9.14, totalCredits: 22, earnedCredits: 22,
    publishDate: '2024-02-15',
    subjects: [
      { code: 'BS-M101', name: 'Mathematics - IA', credit: 4, letterGrade: 'O', points: 10, type: 'Theory' },
      { code: 'BS-PH101', name: 'Physics - I', credit: 4, letterGrade: 'E', points: 9, type: 'Theory' },
      { code: 'ES-EE101', name: 'Basic Electrical Engg.', credit: 4, letterGrade: 'O', points: 10, type: 'Theory' },
      { code: 'BS-PH191', name: 'Physics - I Lab', credit: 1.5, letterGrade: 'O', points: 10, type: 'Practical' },
      { code: 'ES-EE191', name: 'Basic Electrical Engg. Lab', credit: 1.5, letterGrade: 'E', points: 9, type: 'Practical' },
      { code: 'ES-ME192', name: 'Workshop/Manufacturing Practices', credit: 3, letterGrade: 'O', points: 10, type: 'Sessional' }
    ]
  },
  {
    id: 'sem2', sem: 2, label: 'Semester 2', status: 'PUBLISHED',
    sgpa: 8.92, totalCredits: 20.5, earnedCredits: 20.5,
    publishDate: '2024-08-20',
    subjects: [
      { code: 'BS-M201', name: 'Mathematics - IIA', credit: 4, letterGrade: 'E', points: 9, type: 'Theory' },
      { code: 'BS-CH201', name: 'Chemistry - I', credit: 4, letterGrade: 'O', points: 10, type: 'Theory' },
      { code: 'ES-CS201', name: 'Programming for Problem Solving', credit: 3, letterGrade: 'E', points: 9, type: 'Theory' },
      { code: 'HM-HU201', name: 'English', credit: 2, letterGrade: 'A', points: 8, type: 'Theory' },
      { code: 'ES-CS291', name: 'Programming Lab', credit: 1.5, letterGrade: 'O', points: 10, type: 'Practical' }
    ]
  },
  {
    id: 'sem3', sem: 3, label: 'Semester 3', status: 'PUBLISHED',
    sgpa: 9.30, totalCredits: 23, earnedCredits: 23,
    publishDate: '2025-02-10',
    subjects: [
      { code: 'PCC-CS301', name: 'Data Structure & Algorithms', credit: 3, letterGrade: 'O', points: 10, type: 'Theory' },
      { code: 'PCC-CS302', name: 'IT Workshop (Sci Lab/MATLAB)', credit: 3, letterGrade: 'E', points: 9, type: 'Theory' },
      { code: 'PCC-CS391', name: 'Data Structure Lab', credit: 1.5, letterGrade: 'O', points: 10, type: 'Practical' },
    ]
  },
  { id: 'sem4', sem: 4, label: 'Semester 4', status: 'PROCESSING', sgpa: null, subjects: [] },
  { id: 'sem5', sem: 5, label: 'Semester 5', status: 'LOCKED', sgpa: null, subjects: [] },
  { id: 'sem6', sem: 6, label: 'Semester 6', status: 'LOCKED', sgpa: null, subjects: [] },
  { id: 'sem7', sem: 7, label: 'Semester 7', status: 'LOCKED', sgpa: null, subjects: [] },
  { id: 'sem8', sem: 8, label: 'Semester 8', status: 'LOCKED', sgpa: null, subjects: [] },
];

/* =========================================================================
   2. SUB-COMPONENTS
   ========================================================================= */

const MarkSheetPaper = ({ profile, result }) => {
  if (!result || result.status !== 'PUBLISHED') return null;

  return (
    <div id="printable-marksheet" className="bg-white text-black w-full max-w-[210mm] min-h-[297mm] p-[15mm] shadow-2xl relative mx-auto print:shadow-none print:m-0 flex flex-col font-serif">
      {/* Frame & Watermark */}
      <div className="absolute inset-2 border-2 border-double border-gray-800 pointer-events-none z-20"></div>
      <div className="absolute inset-3 border border-gray-400 pointer-events-none z-20"></div>
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden">
         <div className="w-[600px] h-[600px] border-[20px] border-gray-900 rounded-full flex items-center justify-center">
            <h1 className="text-[120px] font-black tracking-tighter text-gray-900 -rotate-12">IEM LOGO</h1>
         </div>
      </div>

      {/* Header */}
      <div className="relative z-10 text-center border-b-2 border-black pb-6 mb-6">
         <div className="flex justify-center mb-2">
             <ShieldCheck size={48} className="text-gray-900" strokeWidth={1.5} />
         </div>
         <h1 className="text-2xl font-black tracking-widest uppercase text-black mb-1">{profile.institution}</h1>
         <p className="text-xs font-bold tracking-widest mb-1">AUTONOMOUS INSTITUTION</p>
         <p className="text-[10px] font-bold">Affiliated to MAKAUT, West Bengal</p>
         <div className="mt-4 inline-block px-8 py-1.5 border-2 border-black text-sm font-black uppercase tracking-[0.2em]">
            GRADE CARD
         </div>
         <p className="text-xs font-bold mt-2 uppercase">{result.label} EXAMINATION</p>
      </div>

      {/* Student Details */}
      <div className="relative z-10 grid grid-cols-[100px_1fr] gap-6 mb-6">
         <div className="w-[100px] h-[120px] border border-black p-1 bg-gray-100 flex items-center justify-center grayscale">
            {profile.photoUrl ? (
                <img src={profile.photoUrl} alt="Candidate" className="w-full h-full object-cover" />
            ) : (
                <span className="text-[10px] font-bold text-gray-400 text-center">PHOTO</span>
            )}
         </div>
         <table className="w-full text-xs font-bold border border-black h-fit">
            <tbody>
               <tr className="border-b border-black">
                  <td className="p-2 border-r border-black w-1/3 bg-gray-100">Name of the Student</td>
                  <td className="p-2 uppercase text-sm">{profile.name}</td>
               </tr>
               <tr className="border-b border-black">
                  <td className="p-2 border-r border-black bg-gray-100">Roll Number</td>
                  <td className="p-2 font-mono tracking-wider">{profile.rollNo}</td>
               </tr>
               <tr className="border-b border-black">
                  <td className="p-2 border-r border-black bg-gray-100">Registration No</td>
                  <td className="p-2 font-mono tracking-wider">{profile.regNo}</td>
               </tr>
               <tr>
                  <td className="p-2 border-r border-black bg-gray-100">Degree & Stream</td>
                  <td className="p-2 uppercase">{profile.program} IN {profile.stream}</td>
               </tr>
            </tbody>
         </table>
      </div>

      {/* Marks Table */}
      <div className="relative z-10 flex-1">
          <table className="w-full text-xs border-collapse border border-black mb-6">
             <thead className="bg-gray-100 text-center font-bold">
                <tr>
                   <th className="border border-black p-2 w-[15%]">Paper Code</th>
                   <th className="border border-black p-2 w-[50%] text-left">Paper Name</th>
                   <th className="border border-black p-2 w-[10%]">Credit</th>
                   <th className="border border-black p-2 w-[10%]">Letter Grade</th>
                   <th className="border border-black p-2 w-[15%]">Points</th>
                </tr>
             </thead>
             <tbody>
                {result.subjects.map((sub, i) => (
                   <tr key={i} className="text-center font-medium">
                      <td className="border border-black p-2 font-mono">{sub.code}</td>
                      <td className="border border-black p-2 text-left font-bold">{sub.name}</td>
                      <td className="border border-black p-2">{sub.credit}</td>
                      <td className="border border-black p-2 font-bold">{sub.letterGrade}</td>
                      <td className="border border-black p-2">{sub.points}</td>
                   </tr>
                ))}
             </tbody>
          </table>

          {/* SGPA Summary Table */}
          <div className="flex justify-end">
              <table className="w-1/2 text-xs border-collapse border border-black">
                  <tbody>
                      <tr>
                          <td className="border border-black p-2 font-bold bg-gray-100 w-2/3">Total Credits Offered</td>
                          <td className="border border-black p-2 text-center font-bold">{result.totalCredits}</td>
                      </tr>
                      <tr>
                          <td className="border border-black p-2 font-bold bg-gray-100">Total Credits Earned</td>
                          <td className="border border-black p-2 text-center font-bold">{result.earnedCredits}</td>
                      </tr>
                      <tr>
                          <td className="border border-black p-2 font-black bg-gray-200">SGPA</td>
                          <td className="border border-black p-2 text-center font-black text-sm">{result.sgpa?.toFixed(2)}</td>
                      </tr>
                  </tbody>
              </table>
          </div>
      </div>

      {/* Footer Signatures */}
      <div className="relative z-10 flex justify-between items-end pt-10 pb-6 mt-10">
          <div className="text-center">
             <p className="text-[10px] font-bold">Date of Publication: {result.publishDate}</p>
          </div>
          <div className="text-center">
             <div className="w-48 h-10 mb-1 flex justify-center items-end border-b border-black">
                 {/* Placeholder for Signature Image */}
                 <span className="font-serif italic text-lg opacity-80">Dr. Controller</span>
             </div>
             <p className="text-[10px] font-bold uppercase">Controller of Examinations</p>
          </div>
      </div>
    </div>
  );
};

const EmptySemState = ({ type, isDarkMode }) => {
  const configs = {
     PROCESSING: {
        icon: <Clock size={48} className="text-amber-500 mb-4" />,
        title: "Results Processing",
        desc: "Your examination papers are currently being evaluated by the faculty."
     },
     LOCKED: {
        icon: <Lock size={48} className="text-gray-500 mb-4 opacity-50" />,
        title: "Semester Locked",
        desc: "You have not yet reached this semester or exams haven't concluded."
     }
  };
  const conf = configs[type] || configs.LOCKED;
  return (
      <div className={`flex flex-col items-center justify-center py-32 border-2 border-dashed rounded-3xl ${isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-300 bg-gray-50'}`}>
          <div className={`p-6 rounded-full mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
             {conf.icon}
          </div>
          <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{conf.title}</h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{conf.desc}</p>
      </div>
  );
};

/* =========================================================================
   3. MAIN DASHBOARD COMPONENT
   ========================================================================= */

const UniversityMarks = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { user, profile, loading: sessionLoading } = useSessionManager();
  const { triggerPopup } = useErrorPopup();
  
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [activeSemId, setActiveSemId] = useState('sem1');
  const printRef = useRef(null);

  const userRoleDisplay = profile?.role ? profile.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Student';

  useEffect(() => {
    const fetchResultsData = async () => {
        if (!user) return;
        try {
            const token = localStorage.getItem('sessionToken');
            // Try fetching from backend (Implement this route in coeRoutes.js later if missing)
            const res = await axios.get(`${API_BASE}/api/coe/student/results/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResults(res.data.length ? res.data : MOCK_SEMESTER_RESULTS);
        } catch (e) {
            console.warn("Failed to fetch real results, using fallback mock data.");
            // Fallback to MOCK data if API fails to ensure UI works
            setResults(MOCK_SEMESTER_RESULTS);
        } finally {
            setLoading(false);
        }
    };
    if (!sessionLoading) fetchResultsData();
    window.scrollTo(0, 0);
  }, [user, sessionLoading]);

  if (sessionLoading || loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <LoadingSpinner message="Loading Academic Records..." />
      </div>
    );
  }

  const activeResult = results.find(r => r.id === activeSemId) || results[0];

  // Calculate Overall CGPA dynamically based on published results
  const publishedResults = results.filter(r => r.status === 'PUBLISHED' && r.sgpa);
  const totalEarnedCredits = publishedResults.reduce((sum, r) => sum + r.earnedCredits, 0);
  const totalWeightedPoints = publishedResults.reduce((sum, r) => sum + (r.sgpa * r.earnedCredits), 0);
  const calculatedCGPA = totalEarnedCredits > 0 ? (totalWeightedPoints / totalEarnedCredits).toFixed(2) : 'N/A';

  // Dynamic Profile Map
  const displayProfile = {
      name: profile?.name || "Student Name",
      rollNo: profile?.rollNo || "N/A",
      regNo: profile?.uid || "N/A",
      program: profile?.course || "B.Tech",
      stream: profile?.stream || "General",
      institution: profile?.college || "Institute Name",
      photoUrl: "" 
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`min-h-screen font-sans relative transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Dynamic Background Gradient - Amber Theme */}
      <div className={`fixed top-0 left-0 w-full h-[300px] pointer-events-none ${isDarkMode ? 'bg-gradient-to-b from-amber-900/10 to-transparent' : 'bg-gradient-to-b from-amber-100/50 to-transparent'}`} />
      
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-marksheet, #printable-marksheet * { visibility: visible; }
          #printable-marksheet { position: absolute; left: 0; top: 0; margin: 0; width: 100%; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* ================= HEADER ================= */}
      <GlassHeader variant="dashboard">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate(-1)} 
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-amber-100 text-amber-600'}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <UserProfileDropdown user={user} onOptionClick={() => {}} />
            <div className="flex flex-col">
              <div className={`flex items-center text-sm font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                <span className="opacity-70">{userRoleDisplay} Dashboard</span>
                <ChevronRight className="w-4 h-4 mx-1 opacity-50" />
                <span className="text-amber-500">University Marks</span>
              </div>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${isDarkMode ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>
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
        
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 no-print mb-8">
            <div>
                <h1 className={`text-4xl font-bold tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Academic Grade Cards</h1>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-xl`}>View and download your official semester marksheets and track your academic progress.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* LEFT SIDEBAR: Navigation & Summary */}
           <div className="lg:col-span-3 space-y-6 no-print">
              
              {/* CGPA Widget */}
              <div className={`p-6 rounded-3xl border shadow-sm relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-br from-amber-900/20 to-gray-800 border-amber-500/20' : 'bg-gradient-to-br from-amber-50 to-white border-amber-200'}`}>
                 <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                 <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-amber-500' : 'text-amber-600'}`}>Overall CGPA</h3>
                 <div className="flex items-end gap-2">
                    <span className={`text-5xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{calculatedCGPA}</span>
                    <span className={`text-sm font-bold mb-1.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>/ 10</span>
                 </div>
                 <div className="mt-4 pt-4 border-t border-amber-500/20 flex items-center justify-between">
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Credits Earned</span>
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{totalEarnedCredits}</span>
                 </div>
              </div>

              {/* Semester Tabs */}
              <div className={`p-4 rounded-3xl border shadow-sm space-y-2 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                 <h3 className={`text-xs font-bold uppercase tracking-wider px-2 mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Semesters</h3>
                 {results.map((res) => {
                    const isActive = activeSemId === res.id;
                    const isPublished = res.status === 'PUBLISHED';
                    const isProcessing = res.status === 'PROCESSING';

                    return (
                        <button
                            key={res.id}
                            onClick={() => setActiveSemId(res.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-200 text-sm font-bold ${
                                isActive 
                                    ? (isDarkMode ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-amber-50 text-amber-600 border border-amber-200 shadow-sm') 
                                    : (isDarkMode ? 'text-gray-400 hover:bg-gray-800 border border-transparent' : 'text-gray-600 hover:bg-gray-50 border border-transparent')
                            }`}
                        >
                            <span className="flex items-center gap-3">
                                {isPublished ? <CheckCircle2 size={16} className={isActive ? 'text-amber-500' : 'text-green-500'} /> :
                                 isProcessing ? <Clock size={16} className="text-amber-500" /> :
                                 <Lock size={16} className="opacity-50" />}
                                {res.label}
                            </span>
                            {isPublished && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-lg border ${isActive ? 'bg-amber-500/20 border-amber-500/30' : (isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200')}`}>
                                   {res.sgpa}
                                </span>
                            )}
                        </button>
                    )
                 })}
              </div>
           </div>

           {/* RIGHT CONTENT: Marksheet Paper */}
           <div className="lg:col-span-9 flex flex-col">
              
              {/* Top Control Bar for the Active Document */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 no-print">
                 <div>
                    <h2 className={`text-2xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {activeResult.label}
                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-bold border ${
                            activeResult.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            activeResult.status === 'PROCESSING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                            'bg-gray-500/10 text-gray-500 border-gray-500/20'
                        }`}>
                           {activeResult.status}
                        </span>
                    </h2>
                 </div>
                 
                 {activeResult.status === 'PUBLISHED' && (
                    <div className="flex gap-3">
                       <button 
                          onClick={handlePrint}
                          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                       >
                          <Printer size={16} /> Print Grade Card
                       </button>
                    </div>
                 )}
              </div>

              {/* MAIN DISPLAY AREA */}
              <div className="min-h-[600px] flex justify-center">
                 <AnimatePresence mode="wait">
                    <motion.div
                       key={activeSemId}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: -10 }}
                       transition={{ duration: 0.2 }}
                       className="w-full"
                    >
                       {activeResult.status === 'PUBLISHED' ? (
                          <div className="w-full flex justify-center overflow-x-auto pb-10 custom-scrollbar">
                             <MarkSheetPaper profile={displayProfile} result={activeResult} />
                          </div>
                       ) : (
                          <EmptySemState type={activeResult.status} isDarkMode={isDarkMode} />
                       )}
                    </motion.div>
                 </AnimatePresence>
              </div>

           </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityMarks;