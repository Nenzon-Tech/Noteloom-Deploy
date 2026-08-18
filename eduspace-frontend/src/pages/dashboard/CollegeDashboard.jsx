import { API_BASE } from '@/utils/config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  BookOpen, Users, Shield, Wifi, ClipboardList, MessageSquare, FileText, 
  Calendar, Banknote, IndianRupee, FolderPlus, GraduationCap, 
  ListTodo as ListTodoIcon, FormInputIcon, Receipt, User, PenBoxIcon, 
  CheckCircle, Upload, Clock, Briefcase, Settings, ShieldCheck, UserPlus, 
  Building, FileCog, Circle, ArrowRight, Layout, Database, Sparkles,
  Library, 
} from "lucide-react";
import { useTheme } from '@/context/ThemeContext.jsx';
import { useSessionManager } from '@/hooks/useSessionManager.js';
import GlassHeader from '@/components/common/GlassHeader.jsx';
import CollegeDashboardFooter from '@/components/features/dashboard/CollegeDashboardFooter.jsx';
import CollegeBannerLogo from '@/components/common/CollegeBannerLogo.jsx';
import ThemeToggle from '@/components/common/ThemeToggle.jsx';
import UserProfileDropdown from '@/components/common/UserProfileDropdown.jsx';
import SessionExpiredPage from '@/components/common/SessionExpiredPage.jsx';
import LoadingSpinner from '@/components/common/LoadingSpinner';



const iconMap = {
  BookOpen, ClipboardList, MessageSquare, Users, Calendar, Banknote, IndianRupee, 
  FolderPlus, GraduationCap, ListTodoIcon, FormInputIcon, FileText, Receipt, 
  User, PenBoxIcon, CheckCircle, Upload, Clock, Briefcase, Settings, ShieldCheck, 
  UserPlus, Building, FileCog, Library, Default: Circle
};

// Helper component for Section Headers
const SectionHeader = ({ title, icon: Icon, isDarkMode, color }) => (
  <div className={`flex items-center space-x-3 mb-6 pb-2 border-b ${
    isDarkMode ? 'border-gray-700' : 'border-gray-200'
  }`}>
    <div className={`p-2 rounded-lg ${color} bg-opacity-20`}>
      <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
    </div>
    <h2 className={`text-xl font-bold tracking-tight ${
      isDarkMode ? 'text-gray-100' : 'text-gray-800'
    }`}>
      {title}
    </h2>
  </div>
);

// Helper component for Dashboard Cards (Bento Style)
const DashboardCard = ({ item, isDarkMode, index, navigate, type }) => {
  const ItemIcon = iconMap[item.icon] || iconMap.Default;
  const isLMS = type === 'LMS';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => navigate(`/dashboard/${item.key.replace(/_/g, '-')}`)}
      className={`relative group p-6 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
        isDarkMode 
          ? 'bg-gray-800/40 border-gray-700 hover:bg-gray-800 hover:border-gray-600' 
          : 'bg-white border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-xl'
      }`}
    >
      {/* Background decoration for LMS items */}
      {isLMS && (
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150`} />
      )}

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          } group-hover:scale-110 transition-transform duration-300`}>
            <ItemIcon className={`w-6 h-6 ${
              isLMS 
                ? 'text-purple-600' 
                : (isDarkMode ? 'text-blue-400' : 'text-gray-600')
            }`} />
          </div>
          <ArrowRight className={`w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all ${
             isDarkMode ? 'text-gray-400' : 'text-gray-400'
          }`} />
        </div>

        <h3 className={`text-lg font-bold mb-1 ${
          isDarkMode ? 'text-gray-100' : 'text-gray-900'
        }`}>
          {item.title}
        </h3>
        
        <p className={`text-xs leading-relaxed line-clamp-2 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {item.description}
        </p>
      </div>
    </motion.div>
  );
};

const CollegeDashboard = () => {
  const { isDarkMode } = useTheme();
  const { user, profile, loading, isSessionValid, clearSession, updateActivity } = useSessionManager();
  const [lmsItems, setLmsItems] = useState([]);
  const [erpItems, setErpItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const navigate = useNavigate();

  // Activity Monitor
  useEffect(() => {
    const handleActivity = () => updateActivity();
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => document.addEventListener(e, handleActivity));
    return () => events.forEach(e => document.removeEventListener(e, handleActivity));
  }, [updateActivity]);

// Fetch and Categorize Menu
  // Fetch and Categorize Menu
  useEffect(() => {
    const fetchMenu = async () => {
      if (!isSessionValid) return;
      try {
        // ✅ FIXED: Fetch from session/menu which respects IT Admin Toggles
        const response = await fetch(`${API_BASE}/session/menu`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          const lmsKeywords = [
            'notes', 'assignments', 'exams', 'classroom', 'library', 'quiz', 'course', 'faculty', 
            'attendance', 'notice', 'project', 'class', 'routine', 'timetable'
          ];          
          const lms = [];
          const erp = [];

          data.forEach(item => {
            const key = item.key ? item.key.toLowerCase() : '';
            const title = item.title ? item.title.toLowerCase() : '';

            const matchesKeyword = lmsKeywords.some(keyword => 
              key.includes(keyword) || title.includes(keyword)
            );

            // Explicit checks for common LMS items to ensure they go to the right section
            const isRequestedLMSItem = 
              key.includes('attendance') || 
              title.includes('attendance') ||
              key.includes('notice') || 
              title.includes('notice') ||
              key.includes('project') || 
              title.includes('project') ||
              key.includes('class') || 
              title.includes('my classes') ||
              key.includes('upload_content') ||
              key.includes('question_bank');

            if (item.category === 'LMS' || matchesKeyword || isRequestedLMSItem) {
              lms.push(item);
            } else {
              erp.push(item);
            }
          });

          // ❌ REMOVED: Manual injection block (It was bypassing the toggle logic)
          
          setLmsItems(lms);
          setErpItems(erp);
        }
      } catch (error) { console.error("Error fetching menu:", error); } 
      finally { setMenuLoading(false); }
    };
    fetchMenu();
  }, [isSessionValid, profile]);

  // ✅ UPDATED SIGN OUT
  const handleSignOut = async () => {
    await clearSession(); 
    // clearSession in useSessionManager now handles the redirect logic, 
    // but just in case clearSession doesn't navigate immediately or you want explicit control:
    const savedCode = localStorage.getItem('selectedCollegeCode');
    if (savedCode) {
        navigate(`/login?code=${savedCode}`);
    } else {
        navigate('/college-selection');
    }
  };

  const getRoleBadge = (role) => {
    const map = {
      student: { label: 'Student Dashboard', icon: BookOpen },
      faculty: { label: 'Faculty Dashboard', icon: Users },
      college_admin: { label: 'Admin Dashboard', icon: Shield }
    };
    return map[role] || map.student;
  };

  // Loading State (Pulsing Book Open Icon)
// Loading State (Custom GIF & Theme)
  if (loading || menuLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-[#f3f4f6]'
      }`}>
        <LoadingSpinner message="Hang On, Loading..." />
      </div>
    );
  }
  
  // ✅ UPDATED SESSION EXPIRED CHECK
  if (!isSessionValid) {
     const savedCode = localStorage.getItem('selectedCollegeCode');
     return <SessionExpiredPage onLoginRedirect={() => navigate(savedCode ? `/login?code=${savedCode}` : '/college-selection')} />;
  }

  const roleInfo = getRoleBadge(profile?.role || 'student');
  const RoleIcon = roleInfo.icon;

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        isDarkMode
          ? "bg-gray-900 text-white"
          : "bg-[#f3f4f6] text-gray-900" // softer global light bg
      }`}
    >
      {/* ================= HEADER ================= */}
      <GlassHeader variant="dashboard">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">

          {/* LEFT */}
          <div className="flex items-center space-x-4">
            <UserProfileDropdown user={user} onOptionClick={() => {}} />

            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span
                  className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium ${
                    isDarkMode
                      ? "bg-purple-600 text-white"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  <RoleIcon className="w-4 h-4 mr-2" />
                  {roleInfo.label}
                </span>

                <span className="text-xs text-green-500 flex items-center">
                  <Wifi className="w-3 h-3 mr-1" />
                  Active
                </span>
              </div>

              <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {profile?.college}
              </div>

            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <CollegeBannerLogo />
            </div>

            <ThemeToggle />

            <button
              onClick={handleSignOut}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                isDarkMode
                  ? "bg-gray-700/70 text-white hover:bg-gray-600"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
            >
              Sign Out
            </button>
          </div>
        </div>
      </GlassHeader>

      {/* DASHBOARD CONTENT - Bento Grid */}
      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 pt-28 pb-12 w-full">
        
        {/* === SECTION 1: LEARNING MANAGEMENT (LMS) === */}
        {lmsItems.length > 0 && (
          <div className="mb-12">
            <SectionHeader 
              title="Learning & Academics" 
              icon={Sparkles} 
              isDarkMode={isDarkMode} 
              color="text-purple-600 bg-purple-500" 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {lmsItems.map((item, index) => (
                <DashboardCard 
                  key={item.key} 
                  item={item} 
                  index={index} 
                  isDarkMode={isDarkMode} 
                  navigate={navigate}
                  type="LMS"
                />
              ))}
            </div>
          </div>
        )}

        {/* === SECTION 2: ERP & RESOURCES === */}
        {erpItems.length > 0 && (
          <div className="mb-8">
            <SectionHeader 
              title="Resource Planning & Management" 
              icon={Database} 
              isDarkMode={isDarkMode} 
              color="text-blue-600 bg-blue-500" 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {erpItems.map((item, index) => (
                <DashboardCard 
                  key={item.key} 
                  item={item} 
                  index={index} 
                  isDarkMode={isDarkMode} 
                  navigate={navigate}
                  type="ERP"
                />
              ))}
            </div>
          </div>
        )}

        {lmsItems.length === 0 && erpItems.length === 0 && (
          <div className="text-center py-20 opacity-50">
            <Layout className="w-16 h-16 mx-auto mb-4"/>
            <p>No active modules assigned to your profile.</p>
          </div>
        )}

      </div>
      
      <CollegeDashboardFooter />
    </div>
  );
};

export default CollegeDashboard;