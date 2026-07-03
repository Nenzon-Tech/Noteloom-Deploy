import { API_BASE } from '@/utils/config';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, BarChart3, CheckCircle2, Circle, Search, 
  BookOpen, FlaskConical, Star, Filter, 
  MessageSquare, Lock, CheckCircle, ChevronRight, Wifi, User
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



/* =========================================================================
   1. CONSTANTS
   ========================================================================= */

const FEEDBACK_QUESTIONS = [
  { id: 'q1', label: 'Punctuality & Regularity', type: 'rating' },
  { id: 'q2', label: 'Subject Knowledge & Clarity', type: 'rating' },
  { id: 'q3', label: 'Communication Skills', type: 'rating' },
  { id: 'q4', label: 'Ability to clear doubts', type: 'rating' },
  { id: 'q5', label: 'Syllabus Coverage', type: 'rating' }
];

/* =========================================================================
   2. SUB-COMPONENTS
   ========================================================================= */

const ProfileIdentityCard = ({ profile, isDarkMode }) => (
  <div className={`border rounded-3xl p-6 mb-6 flex flex-col items-center text-center gap-4 shadow-sm transition-colors ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
    <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-2xl font-bold shadow-inner ${isDarkMode ? 'border-teal-500/30 bg-gray-700 text-teal-400' : 'border-teal-100 bg-teal-50 text-teal-600'}`}>
       {profile?.name ? profile.name.charAt(0).toUpperCase() : <User />}
    </div>
    <div className="w-full">
      <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{profile?.name || 'Loading...'}</h3>
      <p className={`text-xs mt-1 font-bold uppercase tracking-wider ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>
         {profile?.batch || 'Batch'}
      </p>
      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
         {profile?.course} - {profile?.stream}
      </p>
      
      <div className="flex flex-col gap-2 mt-5 w-full">
          <div className={`flex justify-between items-center px-4 py-2 rounded-xl text-[11px] font-mono border ${isDarkMode ? 'bg-gray-900 text-gray-300 border-gray-700' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
            <span className="opacity-60 font-sans uppercase font-bold">NoteLoom ID</span>
            <span className="font-bold">{profile?.uid || 'N/A'}</span>
          </div>
          <div className={`flex justify-between items-center px-4 py-2 rounded-xl text-[11px] font-mono border ${isDarkMode ? 'bg-teal-500/10 text-teal-300 border-teal-500/20' : 'bg-teal-50 text-teal-700 border-teal-200'}`}>
            <span className="opacity-60 font-sans uppercase font-bold">Univ Roll No</span>
            <span className="font-bold">{profile?.rollNo || 'N/A'}</span>
          </div>
      </div>
    </div>
  </div>
);

const FeedbackProgressWidget = ({ total, completed, isDarkMode }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={`border rounded-3xl p-6 relative overflow-hidden shadow-sm transition-colors ${isDarkMode ? 'bg-gradient-to-br from-teal-900/20 to-emerald-900/20 border-teal-500/20' : 'bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-100'}`}>
      <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-teal-400' : 'text-teal-700'}`}>
        <BarChart3 className="w-4 h-4" /> Feedback Status
      </h3>
      
      <div className="flex justify-between items-end mb-2">
        <span className={`text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{percentage}%</span>
        <span className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-teal-500' : 'text-teal-600'}`}>Completion</span>
      </div>

      <div className={`w-full h-3 rounded-full overflow-hidden mb-6 border ${isDarkMode ? 'bg-gray-900/50 border-white/5' : 'bg-gray-200 border-transparent'}`}>
        <div 
           className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 transition-all duration-1000 ease-out" 
           style={{ width: `${percentage}%` }} 
        />
      </div>

      <div className="space-y-3">
         <div className={`flex items-center justify-between p-3 rounded-xl border ${isDarkMode ? 'bg-black/20 border-teal-500/10' : 'bg-white border-teal-100 shadow-sm'}`}>
            <div className="flex items-center gap-3">
               <div className="p-1.5 rounded-full bg-green-500/20 text-green-500"><CheckCircle2 className="w-4 h-4" /></div>
               <span className={`text-xs font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Submitted</span>
            </div>
            <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{completed}</span>
         </div>

         <div className={`flex items-center justify-between p-3 rounded-xl border ${isDarkMode ? 'bg-black/20 border-teal-500/10' : 'bg-white border-teal-100 shadow-sm'}`}>
            <div className="flex items-center gap-3">
               <div className={`p-1.5 rounded-full ${isDarkMode ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-100 text-gray-500'}`}><Circle className="w-4 h-4" /></div>
               <span className={`text-xs font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Pending</span>
            </div>
            <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{total - completed}</span>
         </div>
      </div>
    </div>
  );
};

const SemesterTabs = ({ semesters, activeSem, setActiveSem, isDarkMode }) => {
  return (
    <div className={`p-2 rounded-3xl border flex gap-1 overflow-x-auto custom-scrollbar relative mb-6 shadow-sm ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
      {semesters.map((sem) => {
        const isActive = activeSem === sem.id;
        const isLocked = sem.status === 'locked';
        const isCurrent = sem.status === 'active';

        return (
          <button
            key={sem.id}
            onClick={() => !isLocked && setActiveSem(sem.id)}
            disabled={isLocked}
            className={`
              relative z-10 px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap
              ${isActive ? 'text-white' : isLocked ? (isDarkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed') : (isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-800')}
            `}
          >
            {isActive && (
              <motion.div
                layoutId="liquid-tab-bg-sem-feedback"
                className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl shadow-lg shadow-teal-500/30 -z-10"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            
            {sem.label}
            {isLocked && <Lock size={12} className="opacity-50" />}
            {!isActive && isCurrent && (
               <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
            )}
          </button>
        );
      })}
    </div>
  );
};

const FeedbackTabs = ({ activeTab, setActiveTab, isDarkMode }) => {
  const tabs = ['PENDING', 'SUBMITTED'];

  return (
    <div className={`p-2 rounded-[1.5rem] border flex gap-1 w-fit relative shadow-sm ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        const isPending = tab === 'PENDING';

        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              relative z-10 px-8 py-3 rounded-2xl text-sm font-bold transition-all
              ${isActive 
                ? (isPending ? 'text-gray-900' : 'text-white') 
                : (isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-800')}
            `}
          >
            {isActive && (
              <motion.div
                layoutId="liquid-tab-bg-feedback"
                className={`
                  absolute inset-0 rounded-2xl shadow-lg -z-10
                  ${isPending 
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 shadow-yellow-500/20' 
                    : 'bg-gradient-to-r from-teal-500 to-emerald-500 shadow-teal-500/20'}
                `}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            {tab === 'PENDING' ? 'Pending Action' : 'Submitted History'}
          </button>
        );
      })}
    </div>
  );
};

const FeedbackSubjectCard = ({ subject, index, onSelect, isDarkMode }) => {
  const isSubmitted = subject.status === 'SUBMITTED';

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => !isSubmitted && onSelect(subject)}
      className={`
        relative p-6 rounded-3xl border transition-all duration-300
        ${isSubmitted
          ? (isDarkMode ? 'bg-gray-800/30 border-green-900/30 opacity-70 grayscale-[0.3]' : 'bg-gray-50 border-green-200 opacity-80 grayscale-[0.3]') 
          : (isDarkMode ? 'bg-gray-800/80 border-gray-700 hover:bg-gray-800 hover:border-teal-500/50 cursor-pointer group hover:shadow-xl hover:shadow-teal-500/10' : 'bg-white border-gray-200 hover:border-teal-400 cursor-pointer group hover:shadow-xl hover:shadow-teal-500/10')
        }
      `}
    >
      {/* Card Header */}
      <div className="flex justify-between items-start mb-6">
         <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${isSubmitted ? 'bg-green-500/10 border-green-500/20 text-green-500' : (isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500')}`}>
              {subject.type === 'THEORY' ? <BookOpen size={18} /> : <FlaskConical size={18} />}
            </div>
            <div>
               <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${isSubmitted ? 'bg-green-500/10 text-green-500 border-green-500/20' : (isDarkMode ? 'bg-gray-800 text-gray-400 border-gray-700' : 'bg-gray-50 text-gray-600 border-gray-200')}`}>
                  {subject.type}
               </span>
            </div>
         </div>
         
         {!isSubmitted ? (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-transform group-hover:scale-110 ${isDarkMode ? 'bg-teal-500/10 border-teal-500/20 text-teal-400' : 'bg-teal-50 border-teal-200 text-teal-600'}`}>
               <MessageSquare className="w-4 h-4" />
            </div>
         ) : (
            <div className="flex gap-1">
               {[...Array(subject.rating || 5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
               ))}
            </div>
         )}
      </div>

      <div>
         <h3 className={`text-lg font-bold leading-tight mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{subject.name}</h3>
         <p className={`font-mono text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{subject.code}</p>
      </div>

      <div className={`mt-6 pt-4 border-t flex justify-between items-center ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
         {!isSubmitted ? (
            <span className={`text-xs font-bold flex items-center gap-2 group-hover:gap-3 transition-all ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>
               Provide Feedback <ArrowLeft className="w-3 h-3 rotate-180" />
            </span>
         ) : (
             <span className="text-xs font-bold text-green-500 flex items-center gap-2">
               <CheckCircle2 className="w-3 h-3" /> Feedback Recorded
            </span>
         )}
      </div>
    </motion.div>
  );
};

const EmptyFeedbackState = ({ isDarkMode }) => (
  <div className="flex flex-col items-center justify-center h-full py-20 border-2 border-dashed rounded-3xl" style={{ borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}>
      <div className={`p-6 rounded-full mb-4 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
          <CheckCircle className={`w-12 h-12 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
      </div>
      <p className={`font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>No subjects found for this selection.</p>
  </div>
);

const FeedbackModal = ({ subject, onClose, onSubmit, isSubmitting, isDarkMode }) => (
  <motion.div 
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
  >
    <div className={`rounded-3xl w-full max-w-lg p-8 relative border shadow-2xl ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
      <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Rate {subject.name}</h2>
      <div className="space-y-4 mb-8">
        {FEEDBACK_QUESTIONS.map(q => (
          <div key={q.id} className={`p-4 rounded-2xl flex justify-between items-center border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{q.label}</span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} size={20} className={`cursor-pointer transition-colors ${isDarkMode ? 'text-gray-600 hover:text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-4 justify-end">
        <button onClick={onClose} className={`px-6 py-3 rounded-xl font-bold transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>Cancel</button>
        <button 
          onClick={() => onSubmit(subject.id)} 
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold shadow-lg shadow-teal-500/30 hover:scale-105 transition-all"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </div>
    </div>
  </motion.div>
);

/* =========================================================================
   3. MAIN COMPONENT
   ========================================================================= */

const SemesterFeedback = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { user, profile: sessionProfile } = useSessionManager();
  const { triggerPopup } = useErrorPopup();

  // Core State
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState(null);
  const [allSubjects, setAllSubjects] = useState([]);
  const [feedbackStatuses, setFeedbackStatuses] = useState({}); // Mocked persistence for submission state

  // UI State
  const [activeSem, setActiveSem] = useState(1); 
  const [activeTab, setActiveTab] = useState('PENDING'); 
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  const userRoleDisplay = sessionProfile?.role ? sessionProfile.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Student';

  // Fetch Actual Assigned Subjects and Profile from Backend
  useEffect(() => {
    const fetchFeedbackData = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem('sessionToken');
        const res = await axios.get(`${API_BASE}/api/coe/student/feedback-data/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        setStudentProfile(res.data.profile);
        setAllSubjects(res.data.subjects);
        setActiveSem(res.data.profile.currentSemester); // Auto select current sem

      } catch (err) {
        console.error("Failed to load feedback data", err);
        triggerPopup("Failed to load your enrolled subjects.", "error");
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeedbackData();
    window.scrollTo(0, 0); 
  }, [user, triggerPopup]);

  // Generate Dynamic Semester Tabs based on Current Semester
  const currentSemester = studentProfile?.currentSemester || 1;
  const dynamicSemesters = Array.from({ length: 8 }, (_, i) => {
    const semNum = i + 1;
    return {
        id: semNum,
        label: `Sem ${semNum}`,
        status: semNum < currentSemester ? 'unlocked' : (semNum === currentSemester ? 'active' : 'locked')
    };
  });

  // Prepare Subjects for the currently selected semester Tab
  const rawSemSubjects = allSubjects.filter(s => s.semester === activeSem);
  
  // Map Raw API Subject data to include local feedback state
  const mappedSubjects = rawSemSubjects.map(sub => ({
      id: sub.id,
      code: sub.code,
      name: sub.name,
      type: sub.type?.toUpperCase() || 'THEORY',
      status: feedbackStatuses[sub.id]?.status || 'PENDING',
      rating: feedbackStatuses[sub.id]?.rating || 0
  }));

  // Apply UI Filters (Pending/Submitted Tab -> Search Bar -> Theory/Lab Type)
  const tabFilteredSubjects = mappedSubjects.filter(sub => {
    if (activeTab === 'PENDING') return sub.status === 'PENDING';
    if (activeTab === 'SUBMITTED') return sub.status === 'SUBMITTED';
    return true;
  });

  const fullyFilteredSubjects = tabFilteredSubjects.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase()) || sub.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "ALL" || sub.type === filterType;
    return matchesSearch && matchesType;
  });

  // Calculate Progress Stats for Sidebar (for the active tab's semester)
  const totalInSem = mappedSubjects.length;
  const completedInSem = mappedSubjects.filter(s => s.status === 'SUBMITTED').length;

  const handleFeedbackSubmit = async (subjectId) => {
    setIsSubmitting(true);
    // Simulate API Call Delay (Replace with real POST request later)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update local state to mark this specific subject ID as submitted
    setFeedbackStatuses(prev => ({
        ...prev,
        [subjectId]: { status: 'SUBMITTED', rating: 5 } // Hardcoding 5 stars for the UI demo effect
    }));
    
    setIsSubmitting(false);
    setSelectedSubject(null);
    triggerPopup("Feedback submitted successfully. Thank you!", "success");
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <LoadingSpinner message="Loading Profile & Subjects..." />
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans relative transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Background Gradient */}
      <div className={`fixed top-0 left-0 w-full h-[300px] pointer-events-none ${isDarkMode ? 'bg-gradient-to-b from-teal-900/10 to-transparent' : 'bg-gradient-to-b from-teal-100/50 to-transparent'}`} />
      
      {/* ================= HEADER ================= */}
      <GlassHeader variant="dashboard">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate(-1)} 
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-teal-100 text-teal-600'}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <UserProfileDropdown user={user} onOptionClick={() => {}} />
            <div className="flex flex-col">
              <div className={`flex items-center text-sm font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                <span className="opacity-70">{userRoleDisplay} Dashboard</span>
                <ChevronRight className="w-4 h-4 mx-1 opacity-50" />
                <span className="text-teal-600 dark:text-teal-500">Semester Feedback</span>
              </div>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${isDarkMode ? 'bg-teal-900/50 text-teal-300' : 'bg-teal-100 text-teal-700'}`}>
                  {sessionProfile?.college || 'College'}
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
      <div className="relative z-10 max-w-7xl mx-auto pt-32 pb-32 px-6">
        
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-8">
            <div>
                <h1 className={`text-4xl font-bold tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Course Feedback Portal</h1>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-xl`}>Provide anonymous, constructive feedback on your officially enrolled subjects to help improve the curriculum.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Sidebar Stats */}
          <div className="lg:col-span-3 space-y-6">
            <ProfileIdentityCard profile={studentProfile} isDarkMode={isDarkMode} />
            <FeedbackProgressWidget total={totalInSem} completed={completedInSem} isDarkMode={isDarkMode} />
          </div>

          {/* RIGHT COLUMN: Main Content */}
          <div className="lg:col-span-9">
            
            <SemesterTabs semesters={dynamicSemesters} activeSem={activeSem} setActiveSem={setActiveSem} isDarkMode={isDarkMode} />
            
            <div className="mb-6">
               <FeedbackTabs activeTab={activeTab} setActiveTab={setActiveTab} isDarkMode={isDarkMode} />
            </div>

            <div className={`border rounded-[2rem] p-8 min-h-[500px] shadow-sm relative transition-all duration-300 ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-gray-200'}`}>
               
               {/* Controls Bar */}
               <div className={`flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-2xl border mb-8 ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="relative w-full md:w-96 group">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 group-focus-within:text-teal-500 transition-colors" />
                     <input 
                       type="text" 
                       placeholder="Search mapped subjects..." 
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className={`w-full rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all font-medium ${isDarkMode ? 'bg-gray-800 text-white border-gray-700 placeholder-gray-500' : 'bg-white text-gray-900 border-gray-200 placeholder-gray-400 shadow-sm'}`}
                     />
                  </div>
                  <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    {['ALL', 'THEORY', 'LAB'].map(type => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${filterType === type ? 'bg-teal-600 text-white border-teal-500 shadow-md shadow-teal-500/20' : (isDarkMode ? 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700' : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300')}`}
                      >
                         {type === 'ALL' && <Filter size={14} />}
                         {type === 'THEORY' && <BookOpen size={14} />}
                         {type === 'LAB' && <FlaskConical size={14} />}
                         {type}
                      </button>
                    ))}
                  </div>
               </div>

               {/* Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                  <AnimatePresence mode="popLayout">
                    {fullyFilteredSubjects.length > 0 ? (
                       fullyFilteredSubjects.map((sub, idx) => (
                          <FeedbackSubjectCard key={sub.id} subject={sub} index={idx} onSelect={setSelectedSubject} isDarkMode={isDarkMode} />
                       ))
                    ) : (
                       <div className="col-span-full">
                          <EmptyFeedbackState isDarkMode={isDarkMode} />
                       </div>
                    )}
                  </AnimatePresence>
               </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {selectedSubject && (
            <FeedbackModal 
              subject={selectedSubject}
              onClose={() => setSelectedSubject(null)}
              onSubmit={handleFeedbackSubmit}
              isSubmitting={isSubmitting}
              isDarkMode={isDarkMode}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SemesterFeedback;