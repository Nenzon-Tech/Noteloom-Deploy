import { API_BASE } from '@/utils/config';
// COMPLETE WORKING App.jsx - Individual Students + Remove Book Icon

import React, { useEffect, useState, useRef, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogIn,
  UserPlus,
  Shield,
  Sun,
  Moon,
  ChevronDown,
  ArrowLeft,
  Mail,
  Lock,
  School,
  ClipboardList,
  HelpCircle,
  MessageSquare,
  BookOpen,
  FormInputIcon,
  Phone,
  Upload,
  Users,
  Settings,
  PenBoxIcon,
  FileText,
  FileImage,
  FileVideo,
  FileArchive,
  Globe,
  File,
  Search,
  MapPin,
  Send,
  Youtube,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Heart,
  Star,
  Play,
  Trash2,
  AlertCircle,
  Wifi,
  WifiOff,
  User,
  Edit,
  Key,
  RotateCcw,
  LogOut,
  Clock,
  Calendar,
  GraduationCap,
  Award,
  TrendingUp,
  CheckCircle,
  Circle,
  PlayCircle,
  Plus,
  Camera,
  Eye,
  EyeOff,
  ArrowRight,
  X,
  Building,
  UserCheck,
  ShieldCheck,
  Library,
  Receipt,
  Banknote,
  IndianRupee,
  FolderPlus,
  Kanban,
  ListTodo as ListTodoIcon,
  FolderKanban,
  FileCog,
  Video,
  Laptop,
  MoreVertical, Volume2, Minimize, Maximize, Briefcase

} from "lucide-react";
import { Routes, Route, useNavigate, useLocation, Link, useParams } from "react-router-dom";
import { ThemeProvider, useTheme } from '@/context/ThemeContext.jsx';
import CustomVideoPlayer from '@/components/common/CustomVideoPlayer';
import NoteloomAi from '@/components/features/ai/NoteloomAi';
import axios from 'axios';
import { ErrorPopupProvider } from '@/context/ErrorPopupContext.jsx';
import SessionExpiredPage from '@/components/common/SessionExpiredPage.jsx';

// Route Guards & Reusable Components
import ProtectedRoute from '@/components/common/ProtectedRoute';
import ITProtectedRoute from '@/components/common/ITProtectedRoute';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useSessionManager } from '@/hooks/useSessionManager';
import { useITSessionManager } from '@/hooks/useITSessionManager';

// --- Lazy Pages & Components ---
// Public & Auth
const LandingPage = lazy(() => import('@/pages/public/LandingPage.jsx'));
const CollegeSelection = lazy(() => import('@/pages/auth/CollegeSelection.jsx'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage.jsx'));
const ITLoginPage = lazy(() => import('@/pages/auth/ITLoginPage.jsx'));
const InstituteLandingPage = lazy(() => import('@/pages/public/InstituteLandingPage.jsx'));
const PricingPage = lazy(() => import('@/pages/public/PricingPage.jsx'));
const BlogIndexPage = lazy(() => import('@/pages/public/BlogIndexPage.jsx'));
const BlogPostPage = lazy(() => import('@/pages/public/BlogPostPage.jsx'));
const ComparisonPage = lazy(() => import('@/pages/public/ComparisonPage.jsx'));

// IT Portal
const ITAdminDashboard = lazy(() => import('@/pages/admin/ITAdminDashboard.jsx'));
const FeatureManager = lazy(() => import('@/pages/admin/FeatureManager.jsx'));
const AddEditContentPage = lazy(() => import('@/pages/admin/AddEditContentPage.jsx'));

// Dashboard & Portals
const CollegeDashboard = lazy(() => import('@/pages/dashboard/CollegeDashboard.jsx'));
const TimetableDashboard = lazy(() => import("@/pages/dashboard/TimetableDashboard.jsx"));
const ManageDepartments = lazy(() => import('@/pages/dashboard/ManageDepartments.jsx'));
const ManageUsers = lazy(() => import('@/pages/dashboard/ManageUsers.jsx'));
const AccountCreationManager = lazy(() => import('@/pages/dashboard/AccountCreationManager.jsx'));
const NoticeBoard = lazy(() => import('@/pages/dashboard/NoticeBoard.jsx'));
const MyClasses = lazy(() => import('@/pages/dashboard/MyClasses.jsx'));
const MyCourses = lazy(() => import('@/pages/dashboard/MyCourses.jsx'));
const MarkAttendance = lazy(() => import('@/pages/dashboard/MarkAttendance.jsx'));
const DigitalLibrary = lazy(() => import('@/pages/dashboard/DigitalLibrary.jsx'));
const Chat = lazy(() => import('@/pages/dashboard/Chat.jsx'));
const Attendance = lazy(() => import('@/pages/dashboard/Attendance.jsx'));
const ExamForm = lazy(() => import('@/pages/dashboard/ExamForm.jsx'));
const FeesTrackRecords = lazy(() => import('@/pages/dashboard/FeesTrackRecords.jsx'));
const ExamManagement = lazy(() => import('@/pages/dashboard/ExamManagement.jsx'));
const AdmitCard = lazy(() => import('@/pages/dashboard/AdmitCard.jsx'));
const SemesterFeedback = lazy(() => import('@/pages/dashboard/SemesterFeedback.jsx'));
const UniversityMarks = lazy(() => import('@/pages/dashboard/UniversityMarks.jsx'));
const PaymentHistory = lazy(() => import('@/pages/dashboard/PaymentHistory.jsx'));
const PaymentDetails = lazy(() => import('@/pages/dashboard/PaymentDetails.jsx'));
const AcademicCalendar = lazy(() => import('@/pages/dashboard/AcademicCalendar.jsx'));
const AdminUniversityMarks = lazy(() => import('@/pages/dashboard/AdminUniversityMarks.jsx'));

// Classroom & Features
const ClsContentDetails = lazy(() => import('@/components/features/classroom/ClsContentDetails'));
const StandaloneViewer = lazy(() => import('@/components/features/classroom/StandaloneViewer'));
const ClassroomView = lazy(() => import('@/pages/ClassroomView.jsx'));
const VideoStandalone = lazy(() => import('@/pages/VideoStandalone.jsx'));
const FacultyLeave = lazy(() => import('@/components/features/leave/FacultyLeave.jsx'));
const AdminLeaveManager = lazy(() => import('@/components/features/leave/AdminLeaveManager.jsx'));

// COE Features
const COEManager = lazy(() => import('@/components/features/coe/COEManager.jsx'));
const FacultyQuestionBank = lazy(() => import('@/components/features/coe/FacultyQuestionBank.jsx'));
const StudentExamPortal = lazy(() => import('@/components/features/coe/StudentExamPortal.jsx'));


// ✅ Helper: Identify system tenant
const isSystemTenant = (tenant) =>
  tenant?.name === 'Note Loom System';


// API Base URL


// Session timeout in milliseconds (30 minutes of inactivity)
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// COLLEGE CONFIGURATION - Change these values for individual colleges
const COLLEGE_CONFIG = {
  // Set either logoUrl OR bannerUrl (not both)
  logoUrl: "/webdata/clg-logo/IEM-Kolkata.png", // College Logo
  bannerUrl: "", // College Banner Image (set this to use banner instead of logo)
  collegeName: "Institute of Engineering Management Kolkata",
  // For IT Dashboard - uses separate IT footer
  useDefaultFooter: false
};

const UserProfileDropdown = ({ user, onOptionClick }) => {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get user initials for placeholder
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const menuOptions = [
    { id: 'modify', label: 'Modify My Details', icon: Edit },
    { id: 'change-password', label: 'Change Password', icon: Key },
    { id: 'reset-password', label: 'Reset Password', icon: RotateCcw },
    { id: 'delete-account', label: 'Delete Account', icon: Trash2, danger: true },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 p-2 rounded-lg transition-all ${
          isDarkMode 
            ? 'hover:bg-gray-600/50 text-white' 
            : 'hover:bg-gray-300/50 text-gray-900' // FIXED: Light mode text color
        }`}
      >
        {/* User Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-blue-500 ${
          isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900' // FIXED: Light mode colors
        }`}>
          <span className="text-sm font-semibold">{getUserInitials()}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute right-0 mt-2 w-56 rounded-lg shadow-xl backdrop-blur-md border z-50 ${
              isDarkMode 
                ? 'bg-gray-800/90 border-gray-700/50' 
                : 'bg-white/90 border-gray-200/50'
            }`}
          >
            {/* User Info */}
            <div className={`px-4 py-3 border-b ${
              isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'
            }`}>
              <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {user?.name || 'User'}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {user?.email || ''}
              </p>

              {user?.uid && (
                // CHANGED: text-[10px] -> text-xs
                <div className={`mt-2 inline-block px-2 py-0.5 rounded text-xs font-mono tracking-wide ${
                  isDarkMode ? 'bg-gray-700 text-blue-300' : 'bg-gray-100 text-blue-600'
                }`}>
                  ID: {user.uid}
                </div>
              )}
            </div>

            {/* Menu Options */}
            <div className="py-2">
              {menuOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setIsOpen(false);
                    onOptionClick(option.id);
                  }}
                  className={`w-full px-4 py-2 text-left flex items-center space-x-3 transition-colors ${
                    option.danger
                      ? 'hover:bg-red-500/10 text-red-500'
                      : (isDarkMode 
                        ? 'hover:bg-gray-700/50 text-gray-300' 
                        : 'hover:bg-gray-100/50 text-gray-700')
                  }`}
                >
                  <option.icon className="w-4 h-4" />
                  <span className="text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Logo Component with Error Handling
const LogoWithFallback = ({ collegeLogoUrl, collegeName, className, fallbackClassName }) => {
  const [logoError, setLogoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Default Note Loom logo URL
  const noteLoomLogoUrl = "/webdata/clg-logo/Note-Loom.svg";

  const handleLogoError = () => {
    setLogoError(true);
    setIsLoading(false);
  };

  const handleLogoLoad = () => {
    setIsLoading(false);
  };

  // Reset error state when collegeLogoUrl changes
  useEffect(() => {
    if (collegeLogoUrl) {
      setLogoError(false);
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [collegeLogoUrl]);

  return (
    <div className="relative">
      {isLoading && collegeLogoUrl && (
        <div className={`${className} bg-gray-200 animate-pulse rounded-full flex items-center justify-center`}>
          <School className="w-8 h-8 text-gray-400" />
        </div>
      )}
      
      {collegeLogoUrl && !logoError ? (
        <img
          src={collegeLogoUrl}
          alt={`${collegeName} logo`}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onError={handleLogoError}
          onLoad={handleLogoLoad}
        />
      ) : (
        <img
          src={noteLoomLogoUrl}
          alt="Note Loom Logo"
          className={`${fallbackClassName || className} opacity-100 transition-opacity duration-300`}
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
      )}
    </div>
  );
};

// Footer Component
const Footer = () => {
  const { isDarkMode } = useTheme();
  
  const socialLinks = [
    { icon: Youtube, href: "#", label: "YouTube" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" }
  ];

  const companyLinks = ["About Us", "Contact Us", "Pricing", "Careers"];
  const ourServices = ["for Institutions", "for Students"];
  const administrators = ["IT Login", "Request IT Signup"];

  return (
    <footer className={`pt-12 pb-6 transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Left Section - Company Info */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-xl font-bold">Note Loom</span>
              </div>
              <p className={`mb-6 leading-relaxed text-sm sm:text-base ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                We understand that every student has unique needs and abilities, that's why our curriculum is designed to adapt to your needs and help you grow!
                <br />
                Empowering educational institutions with comprehensive learning management solutions.
                <br /><br />
                <strong>Email:</strong> support@noteloom.in
              </p>
            </div>
            
            {/* Social Links */}
<div>
  <h4 className="font-semibold mb-4">Let's get social ♡</h4>
  <div className="flex flex-wrap gap-3">
    {socialLinks.map((social) => (
      <a
        key={social.label}
        href={social.href}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          isDarkMode 
            ? 'bg-gray-700 hover:bg-gray-600' 
            : 'bg-gray-300 hover:bg-gray-400'
        }`}
        aria-label={social.label}
      >
        <social.icon className="w-5 h-5" />
      </a>
    ))}
  </div>
</div>

          </div>
          
          {/* Right Section - Links */}
          <div className="lg:col-span-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Links */}
<div>
  <h4 className="font-semibold mb-4 text-lg">Company</h4>
  <ul className="space-y-3">
    {companyLinks.map((link) => (
      <li key={link}>
        <a 
          href="#"
          className={`transition-colors text-sm sm:text-base ${
            isDarkMode 
              ? 'text-gray-400 hover:text-white' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {link}
        </a>
      </li>
    ))}
  </ul>
</div>

              
              {/* Our Services */}
              <div>
                <h4 className="font-semibold mb-4 text-lg">Our Services</h4>
                <ul className="space-y-3">
  {ourServices.map((link) => (
    <li key={link}>
      <a 
        href="#"
        className={`transition-colors text-sm sm:text-base ${
          isDarkMode 
            ? 'text-gray-400 hover:text-white' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        {link}
      </a>
    </li>
  ))}
</ul>

              </div>
              
              {/* Administrators */}
              <div>
                <h4 className="font-semibold mb-4 text-lg">Administrators</h4>
                <ul className="space-y-3">
  {administrators.map((link) => (
    <li key={link}>
      <Link 
        to={link === "IT Login" ? "/it-login" : "#"}
        className={`transition-colors text-sm sm:text-base ${
          isDarkMode 
            ? 'text-gray-400 hover:text-white' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        {link}
      </Link>
    </li>
  ))}
</ul>

              </div>
              
              {/* Connect With Us */}
              <div>
                <h4 className="font-semibold mb-4 text-lg">Connect With Us</h4>
                <div className="space-y-2">
                  <a 
                    href="#" 
                    className={`block transition-colors text-sm sm:text-base ${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-white' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Email Us
                  </a>
                  <a 
                    href="#" 
                    className={`block transition-colors text-sm sm:text-base ${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-white' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    X (Twitter) Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className={`border-t pt-6 transition-colors duration-300 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-300'
        }`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className={`text-xs sm:text-sm flex items-center text-center md:text-left ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <span>© 2026 Note Loom. All rights reserved.</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm">
              <a 
                href="#" 
                className={`transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Terms & Conditions
              </a>
              <a 
                href="#" 
                className={`transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const CollegeDashboardFooter = () => {
  const { isDarkMode } = useTheme();

  return (
    <footer className={`mt-auto py-4 px-4 border-t transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-800/50 border-gray-700/50' 
        : 'bg-gray-200/50 border-gray-300/50'
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          {/* Left side - College/Note Loom Logo */}
          <div className="flex items-center space-x-2">
            <CollegeBannerLogo />
            {!COLLEGE_CONFIG.bannerUrl && (
              <span className={`text-xs font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Powered by Note Loom
              </span>
            )}
          </div>

          {/* Right side - Links */}
          <div className="flex items-center space-x-4 text-xs">
            <button className={`transition-colors ${
              isDarkMode 
                ? 'text-gray-400 hover:text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}>
              Tech Support
            </button>
            <span className={`${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              © 2026 Note Loom
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// IT Dashboard Footer Component - separate footer for IT Users
const ITDashboardFooter = () => {
  const { isDarkMode } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loginTime] = useState(() => {
    // Get login time from localStorage or use current time as fallback
    const storedLoginTime = localStorage.getItem('itLoginTime');
    return storedLoginTime ? new Date(storedLoginTime) : new Date();
  });

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', { 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  return (
    <footer className={`mt-auto py-4 px-4 border-t transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-800/50 border-gray-700/50' 
        : 'bg-gray-200/50 border-gray-300/50'
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          {/* Left side - Note Loom Beta */}
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Note Loom Beta
            </span>
            <span className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              V 1.0.0
            </span>
          </div>

          {/* Right side - Date, Time, Login Time */}
          <div className="flex items-center space-x-4 text-xs">
            <div className={`flex items-center space-x-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <Calendar className="w-3 h-3" />
              <span>{formatDate(currentTime)}</span>
            </div>
            <div className={`flex items-center space-x-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <Clock className="w-3 h-3" />
              <span>{formatTime(currentTime)}</span>
            </div>
            <div className={`text-xs ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              Logged in: {formatTime(loginTime)}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const IndividualStudentDashboard = () => {
  const { isDarkMode } = useTheme();
  const { user, profile, loading, isSessionValid, clearSession, updateActivity } = useSessionManager();
  const [content, setContent] = useState([]);
  const [contentLoading, setContentLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  // Fetch individual student content
  const fetchContent = async () => {
    try {
      const response = await fetch(`${API_BASE}/individual/content`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setContent(data);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setContentLoading(false);
    }
  };

  // Update progress for content
  const updateProgress = async (contentId, status, progress = 0) => {
    try {
      const response = await fetch(`${API_BASE}/individual/progress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId,
          status,
          progress
        }),
      });
      
      if (response.ok) {
        // Refresh content to get updated progress
        fetchContent();
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  useEffect(() => {
    if (isSessionValid && user && profile?.isIndividual) {
      fetchContent();
    }
  }, [isSessionValid, user, profile]);

  // Handle mouse/keyboard activity to update session
  useEffect(() => {
    const handleActivity = () => {
      updateActivity();
    };

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [updateActivity]);

  const handleSignOut = async () => {
    try {
      await clearSession();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      navigate('/');
    }
  };

  const handleUserMenuClick = (optionId) => {
    switch(optionId) {
      case 'modify':
        console.log('Modify details clicked');
        break;
      case 'change-password':
        console.log('Change password clicked');
        break;
      case 'reset-password':
        console.log('Reset password clicked');
        break;
      case 'delete-account':
        setShowDeleteConfirm(true);
        break;
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      alert("Please type DELETE to confirm account deletion.");
      return;
    }
    
    setDeleting(true);
    try {
      await clearSession();
      alert("Account deleted successfully!");
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert("Failed to delete account. Please try again or contact support.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <GraduationCap className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>Loading your learning dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isSessionValid) {
    return <SessionExpiredPage onLoginRedirect={() => navigate('/login')} />;
  }

  if (showDeleteConfirm) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`max-w-md w-full space-y-8 p-8 rounded-xl shadow-2xl backdrop-blur-md border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-red-900/20 border-red-500/50' 
              : 'bg-red-100/70 border-red-300/50'
          }`}
        >
          <div className="text-center">
            <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-red-500' : 'text-red-600'}`} />
            <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Delete Account</h2>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>This action cannot be undone</p>
          </div>

          <div className={`rounded-lg p-4 backdrop-blur-sm border ${
            isDarkMode 
              ? 'bg-red-900/30 border-red-500/30' 
              : 'bg-red-100/50 border-red-400/30'
          }`}>
            <p className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>⚠️ WARNING</p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Deleting your account will permanently remove all your progress, certificates, and learning data.
            </p>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Type "DELETE" to confirm account deletion
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Type DELETE here"
            />
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleDeleteAccount}
              disabled={deleting || deleteConfirmText !== "DELETE"}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
            >
              {deleting ? "Deleting..." : "Permanently Delete Account"}
            </button>
            
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                isDarkMode 
                  ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-900'
              }`}
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const getProgressIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <PlayCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'course':
        return <BookOpen className="w-5 h-5" />;
      case 'assignment':
        return <ClipboardList className="w-5 h-5" />;
      case 'announcement':
        return <MessageSquare className="w-5 h-5" />;
      case 'resource':
        return <FileText className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const filteredContent = content.filter(item => {
    switch (activeTab) {
      case 'courses':
        return item.type === 'course';
      case 'assignments':
        return item.type === 'assignment';
      case 'announcements':
        return item.type === 'announcement';
      case 'resources':
        return item.type === 'resource';
      default:
        return true;
    }
  });

  const completedCount = content.filter(item => item.userProgress?.status === 'completed').length;
  const inProgressCount = content.filter(item => item.userProgress?.status === 'in_progress').length;

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 dashboard-bg">
      {/* Enhanced Glass Header */}
      <GlassHeader isDarker={true}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Left side - User Profile */}
            <div className="flex items-center space-x-4">
              <UserProfileDropdown 
                user={user}
                onOptionClick={handleUserMenuClick}
              />
              
              <div>
                {/* Role Badge */}
                <div className="flex items-center space-x-2 mb-1">
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium text-white bg-purple-600">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Individual Learning
                  </span>
                  <span className="text-xs text-green-400 flex items-center backdrop-blur-sm">
                    <Wifi className="w-3 h-3 mr-1" />
                    Session Active
                  </span>
                </div>
                
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Welcome, {user?.name || 'Learner'}
                  </span>
                  <span className="mx-2">•</span>
                  <span>Personalized Learning Journey</span>
                </div>
              </div>
            </div>
            
            {/* Right side - Logo and Actions */}
            <div className="flex items-center space-x-4">
              <CollegeBannerLogo className={isDarkMode ? "text-white" : "text-gray-900"} />
              
              <ThemeToggle />
              
              <button
                onClick={handleSignOut}
                className={`px-3 py-2 rounded-lg transition-colors text-sm backdrop-blur-md ${
                  isDarkMode 
                    ? 'bg-gray-600/70 hover:bg-gray-700/70 text-white' 
                    : 'bg-white/70 hover:bg-gray-100/70 text-gray-900'
                }`}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </GlassHeader>
      
      {/* Main Dashboard Content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`p-6 rounded-lg backdrop-blur-md border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-800/70 border-gray-700/50' 
              : 'bg-white/70 border-gray-200/50'
          }`}>
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {content.filter(c => c.type === 'course').length}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Courses</p>
              </div>
            </div>
          </div>
          
          <div className={`p-6 rounded-lg backdrop-blur-md border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-800/70 border-gray-700/50' 
              : 'bg-white/70 border-gray-200/50'
          }`}>
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {inProgressCount}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>In Progress</p>
              </div>
            </div>
          </div>
          
          <div className={`p-6 rounded-lg backdrop-blur-md border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-800/70 border-gray-700/50' 
              : 'bg-white/70 border-gray-200/50'
          }`}>
            <div className="flex items-center">
              <Award className="w-8 h-8 text-yellow-500 mr-3" />
              <div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {completedCount}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed</p>
              </div>
            </div>
          </div>
          
          <div className={`p-6 rounded-lg backdrop-blur-md border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-800/70 border-gray-700/50' 
              : 'bg-white/70 border-gray-200/50'
          }`}>
            <div className="flex items-center">
              <ClipboardList className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {content.filter(c => c.type === 'assignment').length}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Assignments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className={`flex space-x-8 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-300'
          }`}>
            {[
              { id: 'courses', label: 'Courses', icon: BookOpen },
              { id: 'assignments', label: 'Assignments', icon: ClipboardList },
              { id: 'announcements', label: 'Announcements', icon: MessageSquare },
              { id: 'resources', label: 'Resources', icon: FileText }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-400'
                      : isDarkMode 
                        ? 'border-transparent text-gray-400 hover:text-gray-300'
                        : 'border-transparent text-gray-600 hover:text-gray-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {content.filter(c => c.type === tab.id.slice(0, -1) || c.type === tab.id).length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Grid */}
        {contentLoading ? (
          <div className="text-center py-12">
            <GraduationCap className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading your learning content...</p>
          </div>
        ) : filteredContent.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className={`w-16 h-16 mx-auto mb-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <h3 className="text-xl font-semibold mb-2">No content available</h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              Content for this section will be added by your Note Loom administrators.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-lg p-6 backdrop-blur-md border transition-all duration-300 hover:shadow-lg ${
                  isDarkMode 
                    ? 'bg-gray-800/70 border-gray-700/50 hover:bg-gray-700/70' 
                    : 'bg-white/70 border-gray-200/50 hover:bg-gray-100/70'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(item.type)}
                    {getProgressIcon(item.userProgress?.status || 'not_started')}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
                    {item.difficulty}
                  </span>
                </div>

                {/* Content */}
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {item.title}
                </h3>
                
                {item.description && (
                  <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.description}
                  </p>
                )}

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={tag}
                        className={`px-2 py-1 rounded text-xs ${
                          isDarkMode 
                            ? 'bg-gray-700 text-gray-300' 
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Progress Bar */}
                {item.userProgress?.progress > 0 && (
                  <div className="mb-4">
                    <div className={`flex justify-between text-xs mb-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <span>Progress</span>
                      <span>{item.userProgress.progress}%</span>
                    </div>
                    <div className={`w-full bg-gray-200 rounded-full h-2 ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.userProgress.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  {item.userProgress?.status === 'completed' ? (
                    <button
                      disabled
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 opacity-75 cursor-not-allowed"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Completed</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => updateProgress(item._id, 'in_progress', 50)}
                        disabled={item.userProgress?.status === 'in_progress'}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                          item.userProgress?.status === 'in_progress'
                            ? 'bg-blue-600 text-white cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {item.userProgress?.status === 'in_progress' ? 'In Progress' : 'Start'}
                      </button>
                      
                      {item.userProgress?.status === 'in_progress' && (
                        <button
                          onClick={() => updateProgress(item._id, 'completed', 100)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                        >
                          Complete
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Creator info */}
                <div className={`mt-4 pt-4 border-t text-xs ${
                  isDarkMode 
                    ? 'border-gray-700/50 text-gray-500' 
                    : 'border-gray-200/50 text-gray-500'
                }`}>
                  Created by {item.createdBy?.name} ({item.createdBy?.role?.replace('noteloom_', 'Note Loom ')})
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <CollegeDashboardFooter />
    </div>
  );
};


// --- ADD THIS BEFORE CollegeDashboard Component ---
// App.jsx - Add 'Receipt' and 'User' to the map

const iconMap = {
  // Student Icons
  BookOpen,
  ClipboardList,
  MessageSquare,
  Library,
  Calendar,
  Banknote,
  IndianRupee,
  FolderPlus,
  GraduationCap,
  ListTodoIcon,
  FormInputIcon,
  FileText,
  
  // ADD THESE NEW ICONS:
  Receipt, // For Payment Details
  User,    // For Update Profile
  
  // Faculty Icons
  Users,
  PenBoxIcon,
  CheckCircle,
  Upload,
  Clock,
  Briefcase: Briefcase,
  
  // Admin Icons
  Settings,
  ShieldCheck,
  UserPlus,
  Building,
  FileCog,
  
  // Fallback
  Default: Circle
};

const Dashboard = () => {
  const { isDarkMode } = useTheme();
  const { user, profile, loading, isSessionValid } = useSessionManager();
  const navigate = useNavigate();

  // 🔐 Auth-based dashboard protection (DOMAIN-SAFE)
  useEffect(() => {
    const currentUrl = window.location.pathname;

    // 🚫 NEVER redirect while loading (prevents race conditions)
    if (loading) return;

    // ✅ Redirect ONLY when session is truly invalid
    if (!isSessionValid && currentUrl === "/dashboard") {
      navigate("/college-selection", { replace: true });
    }
  }, [loading, isSessionValid, navigate]);

  // ⏳ Loading state (safe)
  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="text-center">
          <GraduationCap className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p
            className={`text-lg font-medium ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ❌ Session expired (only after loading finishes)
  if (!isSessionValid) {
    return (
      <SessionExpiredPage
        onLoginRedirect={() => navigate("/login", { replace: true })}
      />
    );
  }

  // Logic for Individual Student removed. 
  // All valid sessions now direct to CollegeDashboard.
  return <CollegeDashboard />;
};





const ContentModal = ({ isOpen, onClose, onSave, editingContent, isDarkMode }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'course',
    content: '',
    description: '',
    difficulty: 'beginner',
    tags: '',
    isActive: true
  });

  useEffect(() => {
    if (editingContent) {
      setFormData({
        title: editingContent.title || '',
        type: editingContent.type || 'course',
        content: editingContent.content || '',
        description: editingContent.description || '',
        difficulty: editingContent.difficulty || 'beginner',
        tags: editingContent.tags ? editingContent.tags.join(', ') : '',
        isActive: editingContent.isActive !== undefined ? editingContent.isActive : true
      });
    } else {
      setFormData({
        title: '',
        type: 'course',
        content: '',
        description: '',
        difficulty: 'beginner',
        tags: '',
        isActive: true
      });
    }
  }, [editingContent]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dataToSave = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    };
    
    onSave(dataToSave);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`max-w-2xl w-full mx-4 rounded-lg shadow-2xl backdrop-blur-md border ${
          isDarkMode 
            ? 'bg-gray-800/90 border-gray-700/50' 
            : 'bg-white/90 border-gray-200/50'
        }`}
      >
        <div className="p-6">
          <h3 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {editingContent ? 'Edit Content' : 'Create New Content'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Enter content title"
              />
            </div>

            {/* Type and Difficulty */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="course">Course</option>
                  <option value="assignment">Assignment</option>
                  <option value="announcement">Announcement</option>
                  <option value="resource">Resource</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Enter content description"
              />
            </div>

            {/* Content */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Content *
              </label>
              <textarea
                rows={6}
                required
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Enter the main content"
              />
            </div>

            {/* Tags */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="e.g. programming, python, beginner"
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="isActive" className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Active (visible to students)
              </label>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
              >
                {editingContent ? 'Update Content' : 'Create Content'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                    : 'bg-gray-300 hover:bg-gray-400 text-gray-900'
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const UserManagementCard = ({ user, onToggle, onDelete }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`p-6 rounded-2xl border transition-all hover:shadow-xl ${
      isDarkMode ? 'bg-gray-800/40 border-gray-700 hover:border-blue-500/50' : 'bg-white border-gray-200 shadow-sm'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg leading-tight">{user.name}</h3>
          <p className="text-xs font-mono text-blue-500 mt-1">{user.uid || 'ID PENDING'}</p>
          <p className="text-xs opacity-60 mt-0.5">{user.email}</p>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
          user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {user.status}
        </span>
      </div>

      {/* Deletion Warning */}
      {user.deletionScheduledAt && (
        <div className="mb-4 p-2 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center">
          <AlertCircle className="w-3 h-3 text-red-500 mr-2" />
          <p className="text-[10px] text-red-400 font-bold">DELETION: {new Date(user.deletionScheduledAt).toLocaleDateString()}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-2 pt-4 border-t border-gray-500/10">
        <button 
          onClick={() => onToggle(user._id, user.status)}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
            user.status === 'active' 
              ? (isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white' : 'bg-gray-100 text-gray-600 hover:bg-red-600 hover:text-white')
              : 'bg-green-600 text-white'
          }`}
        >
          {user.status === 'active' ? 'Disable Account' : 'Enable Account'}
        </button>
        <button className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-blue-600' : 'bg-gray-100 hover:bg-blue-600 hover:text-white'}`}>
          <Edit className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onDelete(user._id)}
          className="p-2 rounded-lg bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const VideoPlayerPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  
  // Data from navigation
  const videoUrl = state?.videoUrl;
  const title = state?.title || "Video Player";

  // Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Auto-hide controls
  useEffect(() => {
    let timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000); // Hide after 3s of inactivity
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isPlaying]);

  // Handle Video Events
  const handleTimeUpdate = () => setCurrentTime(videoRef.current?.currentTime || 0);
  const handleLoadedMetadata = () => setDuration(videoRef.current?.duration || 0);
  
  // Controls Logic
  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const skip = (seconds) => {
    videoRef.current.currentTime += seconds;
  };

  const changeSpeed = (speed) => {
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!videoUrl) return <div className="text-white bg-black h-screen flex items-center justify-center">No Video Source</div>;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col font-sans">
      {/* Header (Back Button) */}
      <div className={`absolute top-0 left-0 right-0 p-4 z-20 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <button onClick={() => navigate(-1)} className="flex items-center text-white/80 hover:text-white bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">
          <ArrowLeft className="w-5 h-5 mr-2"/> Back to Classroom
        </button>
      </div>

      {/* Video Element */}
      <div className="flex-1 relative flex items-center justify-center bg-black group" onClick={togglePlay}>
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full max-h-screen object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Center Play Button Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Play className="w-10 h-10 text-white fill-white ml-1"/>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-6 pb-6 pt-16 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Progress Bar */}
        <div className="flex items-center gap-4 mb-4 group/timeline cursor-pointer" 
             onClick={(e) => {
               const rect = e.currentTarget.getBoundingClientRect();
               const percent = (e.clientX - rect.left) / rect.width;
               videoRef.current.currentTime = percent * duration;
             }}>
          <span className="text-xs font-mono text-white/80 w-10 text-right">{formatTime(currentTime)}</span>
          <div className="flex-1 h-1.5 bg-white/20 rounded-full relative overflow-hidden group-hover/timeline:h-2.5 transition-all">
            <div 
              className="absolute top-0 left-0 h-full bg-blue-500 rounded-full" 
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <span className="text-xs font-mono text-white/80 w-10">{formatTime(duration)}</span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">
              {isPlaying ? <span className="w-8 h-8 flex items-center justify-center"><div className="w-3 h-8 bg-white rounded-sm mr-1"></div><div className="w-3 h-8 bg-white rounded-sm"></div></span> : <Play className="w-8 h-8 fill-white"/>}
            </button>
            
            <button onClick={() => skip(-10)} className="text-white hover:text-blue-400 flex flex-col items-center group">
              <RotateCcw className="w-6 h-6"/>
              <span className="text-[10px] opacity-0 group-hover:opacity-100 absolute -bottom-4">-10s</span>
            </button>
            
            <button onClick={() => skip(10)} className="text-white hover:text-blue-400 flex flex-col items-center group">
              <div className="transform scale-x-[-1]"><RotateCcw className="w-6 h-6"/></div>
              <span className="text-[10px] opacity-0 group-hover:opacity-100 absolute -bottom-4">+10s</span>
            </button>

            <div className="flex items-center gap-2 group/vol relative">
               <div className="p-2"><Volume2Icon className="w-6 h-6 text-white"/></div>
               <input 
                 type="range" min="0" max="1" step="0.1" 
                 value={volume}
                 onChange={(e) => { setVolume(e.target.value); videoRef.current.volume = e.target.value; }}
                 className="w-0 overflow-hidden group-hover/vol:w-24 transition-all h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
               />
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="text-white font-bold truncate max-w-md opacity-80 mr-4 hidden md:block">{title}</div>

             {/* Speed Control */}
             <div className="relative">
               <button onClick={() => setShowSpeedMenu(!showSpeedMenu)} className="text-white font-bold text-sm bg-white/10 px-3 py-1 rounded hover:bg-white/20 transition-colors">
                 {playbackSpeed}x
               </button>
               {showSpeedMenu && (
                 <div className="absolute bottom-full right-0 mb-2 bg-black/90 border border-white/10 rounded-lg p-1 min-w-[100px] flex flex-col">
                   {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => (
                     <button key={s} onClick={() => changeSpeed(s)} className={`px-4 py-2 text-sm text-left hover:bg-white/20 rounded ${playbackSpeed === s ? 'text-blue-400 font-bold' : 'text-white'}`}>
                       {s}x
                     </button>
                   ))}
                 </div>
               )}
             </div>

             {/* Quality Control (Visual Only for Local Files) */}
             <div className="relative">
               <button onClick={() => setShowQualityMenu(!showQualityMenu)} className="text-white hover:text-blue-400">
                 <Settings className="w-6 h-6"/>
               </button>
               {showQualityMenu && (
                 <div className="absolute bottom-full right-0 mb-2 bg-black/90 border border-white/10 rounded-lg p-1 min-w-[120px] flex flex-col">
                   <div className="px-4 py-2 text-xs text-white/50 uppercase tracking-widest font-bold">Quality</div>
                   <button className="px-4 py-2 text-sm text-left hover:bg-white/20 rounded text-blue-400 font-bold flex justify-between">
                     Original <CheckCircle className="w-4 h-4"/>
                   </button>
                   <button disabled className="px-4 py-2 text-sm text-left rounded text-white/30 cursor-not-allowed">1080p (HD)</button>
                   <button disabled className="px-4 py-2 text-sm text-left rounded text-white/30 cursor-not-allowed">720p</button>
                 </div>
               )}
             </div>

             <button onClick={toggleFullscreen} className="text-white hover:text-blue-400">
               {isFullscreen ? <MinimizeIcon className="w-6 h-6"/> : <MaximizeIcon className="w-6 h-6"/>}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Icons specific to Video Player
const Volume2Icon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>;
const MaximizeIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>;
const MinimizeIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>;


// Helper: Calculate Year from Semester (e.g., Sem 3 = 2nd Year)
const getYearFromSemester = (sem) => {
  if (!sem) return '';
  const year = Math.ceil(sem / 2);
  const suffix = year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th';
  return `${year}${suffix} Year`;
};

const App = () => {
  const navigate = useNavigate();

  return (
    <ThemeProvider>
      <ErrorPopupProvider>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <LoadingSpinner message="Loading page..." />
          </div>
        }>
          <Routes>
            <Route 
              path="/dashboard/manage-departments" 
              element={
                <ProtectedRoute allowedRoles={["college_admin"]}>
                  <ManageDepartments />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/timetable" 
              element={
                <ProtectedRoute allowedRoles={["student", "faculty", "college_admin"]}>
                  <TimetableDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/it-admin/features" 
              element={
                <ITProtectedRoute allowedRoles={["noteloom_admin", "noteloom_manager"]}>
                  <FeatureManager />
                </ITProtectedRoute>
              } 
            />
            <Route 
              path="/" 
              element={<LandingPage navigate={navigate} />} 
            />
            <Route 
              path="/pricing" 
              element={<PricingPage />} 
            />
            <Route 
              path="/blog" 
              element={<BlogIndexPage />} 
            />
            <Route 
              path="/blog/:slug" 
              element={<BlogPostPage />} 
            />
            <Route 
              path="/comparison/google-classroom-notion" 
              element={<ComparisonPage />} 
            />
            <Route 
              path="/institutes/:slug" 
              element={<InstituteLandingPage />} 
            />
            <Route 
              path="/college-selection" 
              element={<CollegeSelection navigate={navigate} />} 
            />
            <Route 
              path="/dashboard/video-player" 
              element={
                <ProtectedRoute allowedRoles={["student", "faculty", "college_admin"]}>
                  <VideoPlayerPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRoles={["student", "faculty", "college_admin", "individual_student"]}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/:college/:role" 
              element={
                <ProtectedRoute allowedRoles={["student", "faculty", "college_admin", "individual_student"]}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/manage-users" 
              element={
                <ProtectedRoute allowedRoles={["college_admin"]}>
                  <ManageUsers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/account-creation" 
              element={
                <ProtectedRoute allowedRoles={["college_admin"]}>
                  <AccountCreationManager />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/staff-notices" 
              element={
                <ProtectedRoute allowedRoles={["faculty", "college_admin"]}>
                  <NoticeBoard type="staff" />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/dept-notices" 
              element={
                <ProtectedRoute allowedRoles={["student", "faculty", "college_admin"]}>
                  <NoticeBoard type="departmental" />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/my-classes" 
              element={
                <ProtectedRoute allowedRoles={["student", "faculty", "college_admin"]}>
                  <MyClasses />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/classrooms/:id" 
              element={
                <ProtectedRoute allowedRoles={["student", "faculty", "college_admin"]}>
                  <ClassroomView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/courses" 
              element={
                <ProtectedRoute allowedRoles={["student", "faculty", "college_admin"]}>
                  <MyCourses />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/dashboard/attendance-marking" 
              element={
                <ProtectedRoute allowedRoles={["faculty", "college_admin"]}>
                  <MarkAttendance />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/library" 
              element={
                <ProtectedRoute allowedRoles={["student", "faculty", "college_admin"]}>
                  <DigitalLibrary />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/chat" 
              element={
                <ProtectedRoute allowedRoles={["student", "faculty", "college_admin"]}>
                  <Chat />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/attendance" 
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <Attendance />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/classrooms/:classId/content/:contentId" 
              element={
                <ProtectedRoute allowedRoles={["student", "faculty", "college_admin"]}>
                  <ClsContentDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pdf-viewer" 
              element={
                <ProtectedRoute allowedRoles={["student", "faculty", "college_admin"]}>
                  <StandaloneViewer />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/video-standalone" 
              element={
                <ProtectedRoute allowedRoles={["student", "faculty", "college_admin"]}>
                  <VideoStandalone />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/leave-apply" 
              element={
                <ProtectedRoute allowedRoles={["faculty"]}>
                  <FacultyLeave />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/leave-manager" 
              element={
                <ProtectedRoute allowedRoles={["college_admin"]}>
                  <AdminLeaveManager />
                </ProtectedRoute>
              } 
            />

            {/* COE Routes */}
            <Route 
              path="/dashboard/coe-manage" 
              element={
                <ProtectedRoute allowedRoles={["college_admin"]}>
                  <COEManager />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/question-bank" 
              element={
                <ProtectedRoute allowedRoles={["faculty"]}>
                  <FacultyQuestionBank />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/exam-portal" 
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentExamPortal />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/exam-form" 
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <ExamForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/fees-exam-records" 
              element={
                <ProtectedRoute allowedRoles={["college_admin"]}>
                  <FeesTrackRecords />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/fees" 
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <PaymentHistory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/payment-details" 
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <PaymentDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/exam-management" 
              element={
                <ProtectedRoute allowedRoles={["college_admin"]}>
                  <ExamManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admit-card" 
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <AdmitCard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/feedback" 
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <SemesterFeedback />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/results" 
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <UniversityMarks />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/org-calendar" 
              element={
                <ProtectedRoute allowedRoles={["student", "faculty", "college_admin"]}>
                  <AcademicCalendar />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/university-marks" 
              element={
                <ProtectedRoute allowedRoles={["college_admin"]}>
                  <AdminUniversityMarks />
                </ProtectedRoute>
              } 
            />
            
            {/* IT Portal Routes */}
            <Route path="/it-login" element={<ITLoginPage />} />
            <Route 
              path="/it-admin" 
              element={
                <ITProtectedRoute allowedRoles={["noteloom_admin", "noteloom_manager"]}>
                  <ITAdminDashboard />
                </ITProtectedRoute>
              } 
            />
            <Route 
              path="/it-admin/content/add" 
              element={
                <ITProtectedRoute allowedRoles={["noteloom_admin", "noteloom_manager"]}>
                  <AddEditContentPage />
                </ITProtectedRoute>
              } 
            />
            <Route 
              path="/it-admin/content/edit" 
              element={
                <ITProtectedRoute allowedRoles={["noteloom_admin", "noteloom_manager"]}>
                  <AddEditContentPage />
                </ITProtectedRoute>
              } 
            />
            <Route
              path="/it-admin/feature-manager"
              element={
                <ITProtectedRoute allowedRoles={["noteloom_admin", "noteloom_manager"]}>
                  <FeatureManager />
                </ITProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
        <NoteloomAi />
      </ErrorPopupProvider>
    </ThemeProvider>
  );
};

export default App;