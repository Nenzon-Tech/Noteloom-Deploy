import { API_BASE } from '@/utils/config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, LogOut, User, Calendar, ClipboardList, 
  BookOpen, MoreVertical, Search, X, ChevronRight, Users, Mail, Fingerprint 
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext.jsx';
import GlassHeader from '@/components/common/GlassHeader.jsx';
import LoadingSpinner from '@/components/common/LoadingSpinner';

import UserProfileDropdown from '@/components/common/UserProfileDropdown.jsx'; 
import ThemeToggle from '@/components/common/ThemeToggle.jsx';
import CollegeBannerLogo from '@/components/common/CollegeBannerLogo.jsx';



const getYearFromSemester = (sem) => {
  if (sem <= 2) return "1st Year";
  if (sem <= 4) return "2nd Year";
  if (sem <= 6) return "3rd Year";
  return "4th Year";
};

const MyCourses = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Header State
  const [currentUser, setCurrentUser] = useState({ name: '', role: '', uid: '', department: '' });
  const [collegeName, setCollegeName] = useState('');

  // Modal State
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedClassMembers, setSelectedClassMembers] = useState({ students: [], teachers: [] });
  const [selectedClassName, setSelectedClassName] = useState('');

  const handleBack = () => navigate('/dashboard');

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('sessionToken');
      if (!token) {
         // ✅ SMART REDIRECT
         const savedCode = localStorage.getItem('selectedCollegeCode');
         navigate(savedCode ? `/login?code=${savedCode}` : '/college-selection');
         return;
      }

      // Fetch Session Info
      const sessionRes = await fetch(`${API_BASE}/session/info`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        setCurrentUser(sessionData.user); 
        setCollegeName(sessionData.tenant?.name || 'My College');
      }

      // Fetch Departments (for Stream Labels) AND Classrooms
      const [classRes, deptRes] = await Promise.all([
        fetch(`${API_BASE}/api/classrooms`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/departments`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (classRes.ok) setCourses(await classRes.json());
      if (deptRes.ok) setDepartments(await deptRes.json());

    } catch (error) {
      console.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Helper for Stream Label
  const getStreamLabel = (code) => {
    for (const dept of departments) {
      const stream = dept.streams?.find(s => s.code === code);
      if (stream) return `${code} - ${stream.name}`;
    }
    return code; 
  };

  // Open Read-Only Modal
  const handleViewMembers = (course) => {
    setSelectedClassName(course.name);
    setSelectedClassMembers({
      students: course.students || [],
      teachers: course.teachers || []
    });
    setShowMembersModal(true);
  };

  const handleUnenroll = async (classId) => {
    if(!confirm("Are you sure you want to unenroll from this course?")) return;
    const res = await fetch(`${API_BASE}/api/classrooms/${classId}/unenroll`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }
    });
    if (res.ok) fetchData();
    else alert("Failed to unenroll");
  };

  const CourseMenu = ({ classId }) => {
    const [open, setOpen] = useState(false);
    return (
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => setOpen(!open)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
          <MoreVertical className="w-6 h-6 text-white" />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className={`absolute right-0 mt-2 w-48 rounded-lg shadow-xl py-2 z-20 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              <button onClick={() => handleUnenroll(classId)} className="flex items-center w-full px-4 py-2 text-sm hover:bg-red-500/10 text-red-500">
                <LogOut className="w-4 h-4 mr-2"/> Unenroll
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-[#F3F4F6] text-gray-900'}`}>
      
      {/* HEADER */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <GlassHeader variant="dashboard">
          <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button onClick={handleBack} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-blue-100 text-blue-600'}`}>
                <ArrowLeft className="w-5 h-5" />
              </button>
              <UserProfileDropdown user={currentUser} onOptionClick={() => {}} />
              <div className="flex flex-col">
                <div className={`flex items-center text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <span className="opacity-70 cursor-pointer hover:underline" onClick={() => navigate('/dashboard')}>Dashboard</span>
                  <ChevronRight className="w-4 h-4 mx-1 opacity-50" />
                  <span className="text-emerald-500">My Courses</span>
                </div>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${isDarkMode ? 'bg-emerald-900/50 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                    {collegeName}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 md:space-x-5">
               <div className="relative group hidden md:block">
                  <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${isDarkMode ? 'text-gray-500 group-focus-within:text-emerald-400' : 'text-gray-400 group-focus-within:text-emerald-500'}`}>
                    <Search className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" placeholder="Search courses..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-56 lg:w-72 pl-10 pr-8 py-2 rounded-full text-sm font-medium outline-none border transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20' 
                        : 'bg-gray-100/50 border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'
                    }`}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer hover:scale-110 transition-transform">
                      <div className={`p-0.5 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}><X className="w-3 h-3" /></div>
                    </button>
                  )}
               </div>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2 hidden md:block"></div>
              <CollegeBannerLogo />
              <ThemeToggle />
            </div>
          </div>
        </GlassHeader>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner message="Fetching your courses..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const isMatch = course.name.toLowerCase().includes(searchTerm.toLowerCase());
              const isDimmed = searchTerm.length > 0 && !isMatch;

              return (
                <motion.div 
                  key={course._id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: isDimmed ? 0.4 : 1, y: 0, scale: isDimmed ? 0.95 : 1, filter: isDimmed ? "blur(2px) grayscale(80%)" : "none"
                  }}
                  transition={{ duration: 0.3 }}
                  className={`rounded-2xl border overflow-hidden flex flex-col transition-shadow duration-300 hover:shadow-2xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}
                >
                  <div className="h-32 bg-gradient-to-br from-emerald-600 to-teal-700 p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                    <div className="absolute top-4 right-4 z-10">
                      <CourseMenu classId={course._id} />
                    </div>
                    <h3 
                      onClick={() => navigate(`/dashboard/classrooms/${course._id}`, { state: { className: course.name } })}
                      className="text-white text-2xl font-bold truncate underline decoration-white/30 decoration-2 underline-offset-4 pr-8 cursor-pointer hover:text-emerald-50 transition-colors relative z-0"
                    >
                      {course.name}
                    </h3>
                    
                    {/* 🟢 UPDATED: SHOW SUBJECT CODE + STREAM */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        {/* Subject Code Badge */}
                        <span className="font-mono text-xs font-bold bg-white/20 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                            {course.subjectCode}
                        </span>
                        {/* Stream Name */}
                        <span className="text-emerald-100 text-xs font-medium">
                            {getStreamLabel(course.stream)}
                        </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 relative">
                    <div className={`absolute -top-10 right-6 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 transition-transform group-hover:rotate-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                      <span className="text-2xl">📚</span>
                    </div>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center text-sm group">
                        <div className={`p-2 rounded-lg mr-3 ${isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}><User className="w-4 h-4"/></div>
                        <div className="flex flex-col">
                          <span className="text-xs opacity-50 uppercase font-bold tracking-wider">Faculty</span>
                          <span className="font-semibold">{course.creatorId?.name || 'Unknown'}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-sm group">
                        <div className={`p-2 rounded-lg mr-3 ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}><Calendar className="w-4 h-4"/></div>
                        <div className="flex flex-col">
                          <span className="text-xs opacity-50 uppercase font-bold tracking-wider">Timeline</span>
                          <span>Sem {course.semester} • {getYearFromSemester(course.semester)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 border-t flex justify-between items-center ${isDarkMode ? 'border-gray-700 bg-gray-900/30' : 'border-gray-100 bg-gray-50/50'}`}>
                     
                     {/* View Members Button */}
                     <button 
                        onClick={() => handleViewMembers(course)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${isDarkMode ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-100 text-gray-600'}`}
                     >
                        View List
                     </button>

                     <button 
                      onClick={() => navigate(`/dashboard/classrooms/${course._id}`)}
                      className="flex items-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-emerald-600/20 active:scale-95"
                    >
                      <ClipboardList className="w-4 h-4 mr-2"/> Open Class
                    </button>
                  </div>
                </motion.div>
              );
            })}

            {courses.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-60">
                <div className={`p-6 rounded-full mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}><BookOpen className="w-12 h-12 text-emerald-500/50"/></div>
                <h3 className="text-xl font-bold">No Courses Found</h3>
                <p className="mt-2 text-sm">You haven't been enrolled in any courses yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MEMBERS LIST MODAL */}
      <AnimatePresence>
        {showMembersModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{scale:0.95, opacity: 0}} animate={{scale:1, opacity: 1}} exit={{scale:0.95, opacity: 0}}
              className={`w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div>
                  <h2 className="text-xl font-bold">Class Members</h2>
                  <p className="text-sm opacity-60">{selectedClassName}</p>
                </div>
                <button onClick={() => setShowMembersModal(false)} className="p-2 hover:bg-gray-500/10 rounded-full"><X className="w-6 h-6"/></button>
              </div>
              
              <div className="overflow-y-auto p-6 space-y-8">
                
                {/* TEACHERS */}
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-4 flex items-center gap-2">
                        <span className="p-1 bg-blue-500/20 text-blue-500 rounded"><User size={14}/></span> Instructors
                    </h3>
                    {selectedClassMembers.teachers.length === 0 ? (
                        <p className="opacity-50 text-sm italic">No teachers assigned.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {selectedClassMembers.teachers.map((t, index) => {
                                // Safety check for teacher objects
                                const teacherName = t?.name || "Unknown Faculty";
                                const teacherEmail = t?.email || "No email available";
                                const teacherId = t?._id || index;

                                return (
                                    <div key={teacherId} className={`p-3 rounded-xl border flex items-center gap-3 ${isDarkMode ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-gray-50'}`}>
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold">
                                            {teacherName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{teacherName}</p>
                                            <p className="text-xs opacity-60">{teacherEmail}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* STUDENTS */}
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-4 flex items-center gap-2">
                        <span className="p-1 bg-emerald-500/20 text-emerald-500 rounded"><Users size={14}/></span> Enrolled Students ({selectedClassMembers.students.length})
                    </h3>
                    
                    {selectedClassMembers.students.length === 0 ? (
                        <div className="p-8 text-center opacity-50 border-2 border-dashed rounded-xl">
                            <Users className="w-8 h-8 mx-auto mb-2"/>
                            <p>No students enrolled yet.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className={`sticky top-0 z-10 text-xs uppercase font-bold tracking-wider ${isDarkMode ? 'bg-gray-800/90 text-gray-400' : 'bg-gray-50/90 text-gray-500'}`}>
                            <tr>
                                <th className="p-3 border-b dark:border-gray-700">Name</th>
                                <th className="p-3 border-b dark:border-gray-700">UID / Roll</th>
                                <th className="p-3 border-b dark:border-gray-700">Stream</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                            {selectedClassMembers.students.map((student, idx) => (
                                <tr key={idx} className={`group hover:bg-blue-500/5 transition-colors`}>
                                <td className="p-3 font-medium flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs font-bold">
                                    {student.name ? student.name.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    {student.name || 'Unknown'}
                                </td>
                                <td className="p-3 text-sm font-mono opacity-80">{student.uid || 'N/A'}</td>
                                <td className="p-3 text-sm">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    {student.stream || 'N/A'}
                                    </span>
                                </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyCourses;