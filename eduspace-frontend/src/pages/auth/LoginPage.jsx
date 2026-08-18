import { API_BASE } from '@/utils/config';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Lock, Eye, EyeOff, ArrowLeft, Shield, 
  GraduationCap, Users, ShieldCheck, Upload, Camera, 
  X, Phone, CheckCircle, AlertCircle, ChevronRight,
  Database, FileText, Calendar, Settings, BookOpen
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext.jsx';
import GlassHeader from '@/components/common/GlassHeader.jsx';
import ThemeToggle from '@/components/common/ThemeToggle.jsx';
import LogoWithFallback from '@/components/common/LogoWithFallback.jsx';
import CollegeMismatchWarning from '@/pages/auth/CollegeMismatchWarning.jsx';
import { useErrorPopup } from '@/context/ErrorPopupContext.jsx';



const LoginPage = () => {
  const [selectedCollege, setSelectedCollege] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('student');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showCollegeMismatch, setShowCollegeMismatch] = useState(false);
  const [userCollege, setUserCollege] = useState('');
  
  // Enhanced signup state
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationTimer, setVerificationTimer] = useState(90);
  const [canResendCode, setCanResendCode] = useState(false);
  const [emailCheckStatus, setEmailCheckStatus] = useState('');
  const [existingUserCollege, setExistingUserCollege] = useState('');
  const [showExistingUserModal, setShowExistingUserModal] = useState(false);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);

  const [isFetchingCollege, setIsFetchingCollege] = useState(true);
  const [collegeNotFoundError, setCollegeNotFoundError] = useState(false);

  const [showCollegeBranding, setShowCollegeBranding] = useState(true); // Placeholder for future IT Admin toggle
  const [collegeLogo, setCollegeLogo] = useState(''); // To store fetched logo url
  
  // Email check states
  const [emailExists, setEmailExists] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);

  // Resend logic state
  const [resendCount, setResendCount] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResendCooldownActive, setIsResendCooldownActive] = useState(false);
  const MAX_RESEND_ATTEMPTS = 50;
  const RESEND_COOLDOWN_SECONDS = 90; // 1.5 minutes
  
  
  // Enhanced role-specific form data
  const [formData, setFormData] = useState({
    // Student-specific fields
    profilePicture: null,
    profilePicturePreview: '',
    phoneNumber: '',
    gender: '',
    admissionYear: '',
    course: '',
    stream: '',
    year: '',
    rollNo: '',
    currentSemester: '',
    
    // Faculty-specific fields
    department: '',
    designation: '',
    qualification: '',
    experience: '',
    specialization: '',
    employeeId: '',
    
    // Admin-specific fields
    adminLevel: '',
    responsibilities: '',
    approvalAuthority: '',
    accessLevel: ''
  });

  const fileInputRef = useRef(null);
  const verificationRefs = useRef([]);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { triggerPopup } = useErrorPopup();

  // Get college info from URL params or localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // ✅ CHECK LOCAL STORAGE IF URL PARAM IS MISSING
    const codeParam = params.get('code') || localStorage.getItem('selectedCollegeCode');

    if (!codeParam) {
      setCollegeNotFoundError(true);
      setIsFetchingCollege(false);
      return;
    }

    // Persist it immediately so subsequent reloads work
    localStorage.setItem('selectedCollegeCode', codeParam);

    const fetchCollegeDetails = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/auth/public/colleges`);
        if (response.ok) {
          const allColleges = await response.json();
          const currentCollege = allColleges.find(c => c.collegeCode === codeParam);
          
          if (currentCollege) {
            setSelectedCollege(currentCollege.name); 
            setIsFetchingCollege(false);
          } else {
            setCollegeNotFoundError(true);
            setIsFetchingCollege(false);
          }
        }
      } catch (error) {
        console.error("Error fetching college context:", error);
        setCollegeNotFoundError(true);
        setIsFetchingCollege(false);
      }
    };

    fetchCollegeDetails();
  }, [navigate]);

  // Enhanced course options
  const courses = ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'MBA', 'B.Sc', 'M.Sc'];
  const streams = {
    'B.Tech': ['Computer Science', 'Electronics & Communication', 'Electrical', 'Mechanical', 'Civil'],
    'M.Tech': ['Computer Science', 'Electronics', 'Power Systems', 'Structural Engineering'],
    'BCA': ['Computer Applications'],
    'MCA': ['Computer Applications'],
    'MBA': ['General Management', 'Finance', 'Marketing', 'HR'],
    'B.Sc': ['Physics', 'Chemistry', 'Mathematics', 'Computer Science'],
    'M.Sc': ['Physics', 'Chemistry', 'Mathematics', 'Computer Science']
  };

  const departments = [
    'Computer Science & Engineering',
    'Electronics & Communication Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Information Technology',
    'Management Studies',
    'Basic Sciences',
    'Humanities'
  ];

  const designations = [
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Lecturer',
    'Senior Lecturer',
    'Visiting Faculty',
    'Guest Lecturer'
  ];

  const qualifications = ['Ph.D', 'M.Tech/M.E', 'M.Sc', 'MBA', 'MCA', 'Others'];
  const adminLevels = ['Department Admin', 'Section Admin', 'College Admin', 'Super Admin'];

  // Timer effect for verification and resend cooldown
  useEffect(() => {
  let verificationInterval = null;
  let cooldownInterval = null;

  // Verification countdown timer
  if (verificationSent && verificationTimer > 0) {
    verificationInterval = setInterval(() => {
      setVerificationTimer(prev => {
        if (prev <= 1) {
          setCanResendCode(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  // Resend cooldown timer
  if (isResendCooldownActive && resendCooldown > 0) {
    cooldownInterval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          setIsResendCooldownActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  return () => {
    if (verificationInterval) clearInterval(verificationInterval);
    if (cooldownInterval) clearInterval(cooldownInterval);
  };
}, [
  verificationSent,
  verificationTimer,
  isResendCooldownActive,
  resendCooldown
]);


  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 51200) {
        setErrors(prev => ({ ...prev, profilePicture: 'File size must be under 50KB' }));
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profilePicture: 'Please upload a valid image file' }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        profilePicture: file,
        profilePicturePreview: URL.createObjectURL(file)
      }));
      
      setErrors(prev => ({ ...prev, profilePicture: '' }));
    }
  };

  const removeProfilePicture = () => {
    setFormData(prev => ({
      ...prev,
      profilePicture: null,
      profilePicturePreview: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleVerificationCodeChange = (index, value) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      if (value && index < 5) {
        verificationRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleVerificationKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      verificationRefs.current[index - 1]?.focus();
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Please enter a valid email';
        else if (emailExists) newErrors.email = 'This email is already registered. Please use a different email.';
        
        if (!password) newErrors.password = 'Password is required';
        else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        
        if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        break;

      case 2:
        if (role === 'student') {
          if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
          else if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
          
          if (!formData.gender) newErrors.gender = 'Gender is required';
          if (!formData.admissionYear) newErrors.admissionYear = 'Admission year is required';
          if (!formData.course) newErrors.course = 'Course is required';
          if (!formData.stream) newErrors.stream = 'Stream is required';
          if (!formData.year) newErrors.year = 'Current year is required';
          if (!formData.rollNo.trim()) newErrors.rollNo = 'Roll number is required';
          if (!formData.currentSemester) newErrors.currentSemester = 'Current semester is required';
        } else if (role === 'faculty') {
          if (!formData.department) newErrors.department = 'Department is required';
          if (!formData.designation) newErrors.designation = 'Designation is required';
          if (!formData.qualification) newErrors.qualification = 'Qualification is required';
          if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
        } else if (role === 'college_admin') {
          if (!formData.adminLevel) newErrors.adminLevel = 'Admin level is required';
          if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
          if (!formData.responsibilities.trim()) newErrors.responsibilities = 'Responsibilities are required';
        }
        break;

      case 3:
        const codeString = verificationCode.join('');
        if (codeString.length !== 6) {
          newErrors.verificationCode = 'Please enter the complete 6-digit code';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  

  const nextStep = () => {
    // Block next step if email exists or email check is in progress
    if (currentStep === 1 && (emailExists || emailCheckLoading)) {
      if (emailExists) {
        setErrors(prev => ({
          ...prev,
          general: 'Please resolve the email issue before proceeding.'
        }));
      }
      return;
    }

    if (validateStep(currentStep)) {
      if (currentStep === 1) {
        // Double-check email doesn't exist before proceeding to step 2
        if (emailExists) {
          setErrors(prev => ({
            ...prev,
            general: 'Cannot proceed with registration. Email already exists.'
          }));
          return;
        }
        setCurrentStep(2);
      } else if (currentStep === 2) {
        // Send verification email when moving to step 3
        sendVerificationEmail();
        setCurrentStep(3);
      } else if (currentStep === 3) {
        verifyAndRegister();
      }
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const checkEmailExists = async (emailToCheck) => {
    if (!emailToCheck || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToCheck)) {
      setEmailExists(false);
      setEmailChecked(false);
      return false;
    }

    setEmailCheckLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToCheck.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.exists) {
          setEmailExists(true);
          setEmailChecked(true);
          setErrors(prev => ({
            ...prev,
            email: `This email is already registered to ${data.collegeName}. Please use a different email address.`
          }));
          return true;
        } else {
          setEmailExists(false);
          setEmailChecked(true);
          setErrors(prev => ({ ...prev, email: '' }));
          return false;
        }
      } else {
        setEmailExists(false);
        setEmailChecked(false);
        setErrors(prev => ({ ...prev, email: '' }));
        return false;
      }
    } catch (error) {
      console.error('Email check error:', error);
      setEmailExists(false);
      setEmailChecked(false);
      setErrors(prev => ({ ...prev, email: '' }));
      return false;
    } finally {
      setEmailCheckLoading(false);
    }
  };

  const sendVerificationEmail = async () => {
    try {
      setEmailCheckLoading(true);
      setErrors({});

      const response = await fetch(`${API_BASE}/api/auth/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: fullName,
          collegeName: selectedCollege,
          role,
          type: 'signup',
        }),
      });

      const data = await response.json();
      setEmailCheckLoading(false);

      if (response.ok) {
  setVerificationSent(true);

  // 🔥 START OTP TIMER HERE
  setVerificationTimer(RESEND_COOLDOWN_SECONDS);
  setCanResendCode(false);

  // optional if you keep separate cooldown
  setIsResendCooldownActive(true);
  setResendCooldown(RESEND_COOLDOWN_SECONDS);
}
 else {
        if (data.error && data.error.includes('User already registered')) {
          setErrors({ email: data.error });
          setVerificationSent(false);
          return;
        }
        setErrors({ general: data.error || 'Failed to send verification email' });
        setVerificationSent(false);
      }
    } catch (error) {
      console.error('Verification request failed:', error);
      setEmailCheckLoading(false);
      setErrors({ general: 'An unexpected error occurred.' });
    }
  };

  const verifyAndRegister = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      const verifyResponse = await fetch(`${API_BASE}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          code: verificationCode.join(''),
          type: 'signup'
        })
      });

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        setErrors({ verificationCode: error.message || 'Invalid verification code' });
        setLoading(false);
        return;
      }

      await registerUser();
    } catch (error) {
      setErrors({ verificationCode: 'Verification failed' });
      setLoading(false);
    }
  };

  const registerUser = async () => {
    try {
      setLoading(true);

      // 1. Get the correct College Code from URL or Storage
      const storedCode = new URLSearchParams(window.location.search).get('code') || localStorage.getItem('selectedCollegeCode');

      // 2. Create a JSON payload 
      // (This matches the new Backend logic that expects JSON, not FormData)
      const payload = {
        fullName,
        email,
        password,
        role,
        collegeName: selectedCollege,
        collegeCode: storedCode, 

        // Spread syntax to conditionally add fields based on role
        ...(role === 'student' && {
          phoneNumber: formData.phoneNumber,
          gender: formData.gender,
          admissionYear: formData.admissionYear,
          course: formData.course,
          stream: formData.stream,
          year: formData.year,
          rollNo: formData.rollNo,
          currentSemester: formData.currentSemester,
        }),
        ...(role === 'faculty' && {
          department: formData.department,
          designation: formData.designation,
          qualification: formData.qualification,
          experience: formData.experience,
          specialization: formData.specialization,
          employeeId: formData.employeeId,
        }),
        ...(role === 'college_admin' && {
          adminLevel: formData.adminLevel,
          responsibilities: formData.responsibilities,
          approvalAuthority: formData.approvalAuthority,
          accessLevel: formData.accessLevel,
          employeeId: formData.employeeId,
        })
      };

      // 3. Send as JSON
      const response = await fetch(`${API_BASE}/api/auth/role-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' // <--- Tells backend to parse as JSON
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (response.ok) {
        // ✅ NEW: Capture the generated UID (e.g., 100190000001) so we can show it in Step 4
        if (data.uid) {
          sessionStorage.setItem('registeredUid', data.uid);
        }
        
        setCurrentStep(4);
      } else {
        if (data.error && data.error.includes('User already registered')) {
          setExistingUserCollege(data.collegeName || 'Unknown College');
          setEmailCheckStatus(data.role ? 'same_college' : 'different_college');
          setShowExistingUserModal(true);
        } else {
          setErrors({ general: data.error || 'Registration failed' });
          triggerPopup(data.error || 'Registration failed', 'error');
        }
      }
    } catch (error) {
      console.error("Signup Error:", error);
      setErrors({ general: 'Registration failed. Server not responding.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
  if (e) e.preventDefault();
  setLoading(true); // Triggers "Processing..." state

  const params = new URLSearchParams(window.location.search);
  const collegeCode = params.get('code') || localStorage.getItem('selectedCollegeCode');

  if (!collegeCode) {
    alert("Institution code missing. Please select your college again.");
    setLoading(false);
    navigate('/college-selection');
    return;
  }

  try {
    if (isLogin) {
      const response = await fetch(`${API_BASE}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          collegeCode,
          role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save session data
        localStorage.setItem('sessionToken', data.sessionToken);
        localStorage.setItem('selectedCollegeCode', collegeCode);
        
        // Use the context provided by useSessionManager or direct navigation
        navigate('/dashboard');
      } else if (data.error === 'college_mismatch') {
        setUserCollege(data.userCollegeName);
        setShowCollegeMismatch(true);
      } else {
        // Handle incorrect credentials
        const errorMessage = data.error || 'Invalid email or password';
        triggerPopup(errorMessage, 'error');
      }
    }
  } catch (error) {
      console.error('Auth error:', error);
      // triggers the global pill popup
      triggerPopup(error.message || 'Server is not responding. Please check your connection.', 'error');
    } finally {
      setLoading(false);
    }
};

  const handleForgotPassword = async () => {
    alert('Password reset functionality will be implemented with MongoDB backend in a future update.');
  };

  const handleDeleteAccount = () => {
    setShowCollegeMismatch(false);
    navigate('/college-selection');
  };

  const handleCancelDeleteAccount = () => {
    setShowCollegeMismatch(false);
    navigate('/college-selection');
  };

  const selectedCollegeLogo = `/webdata/clg-logo/${selectedCollege.replace(/\s+/g, '-')}.png`;

  // --- Sub-components (Modals) ---

  const ExistingUserModal = () => {
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleDelete = async () => {
      setDeleteLoading(true);
      try {
        const response = await fetch(`${API_BASE}/api/auth/delete-existing-account`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() })
        });

        if (response.ok) {
          alert('Your existing account has been deleted. You can now register with this email.');
          setShowExistingUserModal(false);
          setEmailCheckStatus('');
          setExistingUserCollege('');
        } else {
          const data = await response.json();
          alert(data.error || 'Failed to delete account');
        }
      } catch (error) {
        alert('Failed to delete account. Please try again.');
      }
      setDeleteLoading(false);
    };

    const handleCancel = () => {
      setShowExistingUserModal(false);
      setEmail('');
      setEmailCheckStatus('');
      setExistingUserCollege('');
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`max-w-md w-full mx-4 p-6 rounded-xl shadow-2xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="text-center mb-6">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Email Already Registered
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              This email is already registered to <strong>{existingUserCollege}</strong>.
              {emailCheckStatus === 'same_college' 
                ? ' You cannot create another account with the same email in this college.'
                : ' You can register here after deleting your existing account.'
              }
            </p>
          </div>

          <div className="space-y-3">
            {emailCheckStatus === 'different_college' && (
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting Account...' : 'Delete Existing Account & Continue'}
              </button>
            )}
            
            <button
              onClick={handleCancel}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {emailCheckStatus === 'same_college' ? 'Use Different Email' : 'Cancel'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  // --- Main Render ---

  if (showCollegeMismatch) {
    return <CollegeMismatchWarning 
      userCollege={userCollege}
      currentCollege={selectedCollege}
      onDeleteAccount={handleDeleteAccount}
      onCancel={handleCancelDeleteAccount}
    />;
  }

  if (showExistingUserModal) {
    return <ExistingUserModal />;
  }

  const renderSignupStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Role</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'student', label: 'Student', icon: GraduationCap },
                  { value: 'faculty', label: 'Faculty', icon: Users },
                  { value: 'college_admin', label: 'College Admin', icon: ShieldCheck }
                ].map((roleOption) => {
                  const IconComponent = roleOption.icon;
                  return (
                    <label key={roleOption.value} className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value={roleOption.value}
                        checked={role === roleOption.value}
                        onChange={(e) => setRole(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`p-4 border-2 rounded-lg text-center transition-all ${
                        role === roleOption.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                      }`}>
                        <IconComponent className="h-6 w-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {roleOption.label}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700/70 dark:border-gray-600 dark:text-white bg-white/70 border-gray-300 text-gray-900 ${
                    errors.fullName ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    const newEmail = e.target.value;
                    setEmail(newEmail);
                    setEmailExists(false);
                    setEmailChecked(false);
                    setErrors(prev => ({ ...prev, email: '' }));
                    if (newEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
                      const timer = setTimeout(() => {
                        if (newEmail === email) checkEmailExists(newEmail);
                      }, 800);
                      return () => clearTimeout(timer);
                    }
                  }}
                  onBlur={() => {
                    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) checkEmailExists(email);
                  }}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700/70 dark:border-gray-600 dark:text-white bg-white/70 border-gray-300 text-gray-900 ${
                    errors.email || emailExists ? 'border-red-500' : 
                    emailChecked && !emailExists ? 'border-green-500' : ''
                  }`}
                  placeholder="Enter your email address"
                />
                <div className="absolute right-3 top-3">
                  {emailCheckLoading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  ) : emailExists ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : emailChecked && !emailExists ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : null}
                </div>
              </div>
              {emailCheckLoading && <p className="mt-1 text-sm text-blue-600">Checking email availability...</p>}
              {emailExists && (
                <div className="mt-1">
                  <p className="text-sm text-red-600 font-medium">❌ Email already registered</p>
                  <p className="text-xs text-red-500 mt-1">This email address is already associated with an existing account.</p>
                  <button type="button" onClick={() => setIsLogin(true)} className="text-xs text-blue-600 hover:text-blue-500 underline mt-1">Switch to Login instead?</button>
                </div>
              )}
              {emailChecked && !emailExists && !errors.email && <p className="mt-1 text-sm text-green-600">✅ Email available for registration</p>}
              {errors.email && !emailExists && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700/70 dark:border-gray-600 dark:text-white bg-white/70 border-gray-300 text-gray-900 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Create a password (min 8 characters)"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700/70 dark:border-gray-600 dark:text-white bg-white/70 border-gray-300 text-gray-900 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
            {role === 'student' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Picture (Optional)</label>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      {formData.profilePicturePreview ? (
                        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                          <img src={formData.profilePicturePreview} alt="Profile preview" className="w-full h-full object-cover" />
                          <button onClick={removeProfilePicture} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                          <Camera className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Upload className="inline h-4 w-4 mr-1" /> Upload
                      </button>
                      <p className="text-xs text-gray-500 mt-1">Max 50KB</p>
                    </div>
                  </div>
                  {errors.profilePicture && <p className="mt-1 text-sm text-red-600">{errors.profilePicture}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                      placeholder="Enter 10-digit phone number"
                    />
                  </div>
                  {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender *</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Male', 'Female', 'Other'].map((gender) => (
                      <label key={gender} className="flex items-center space-x-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600">
                        <input
                          type="radio"
                          name="gender"
                          value={gender}
                          checked={formData.gender === gender}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{gender}</span>
                      </label>
                    ))}
                  </div>
                  {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Admission Year *</label>
                    <select
                      value={formData.admissionYear}
                      onChange={(e) => handleInputChange('admissionYear', e.target.value)}
                      className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.admissionYear ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    >
                      <option value="">Select year</option>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return <option key={year} value={year}>{year}</option>;
                      })}
                    </select>
                    {errors.admissionYear && <p className="mt-1 text-sm text-red-600">{errors.admissionYear}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course *</label>
                    <select
                      value={formData.course}
                      onChange={(e) => {
                        handleInputChange('course', e.target.value);
                        handleInputChange('stream', '');
                      }}
                      className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.course ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    >
                      <option value="">Select course</option>
                      {courses.map(course => <option key={course} value={course}>{course}</option>)}
                    </select>
                    {errors.course && <p className="mt-1 text-sm text-red-600">{errors.course}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stream *</label>
                    <select
                      value={formData.stream}
                      onChange={(e) => handleInputChange('stream', e.target.value)}
                      disabled={!formData.course}
                      className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.stream ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} ${!formData.course ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="">Select stream</option>
                      {formData.course && streams[formData.course]?.map(stream => (
                        <option key={stream} value={stream}>{stream}</option>
                      ))}
                    </select>
                    {errors.stream && <p className="mt-1 text-sm text-red-600">{errors.stream}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Year *</label>
                    <select
                      value={formData.year}
                      onChange={(e) => handleInputChange('year', e.target.value)}
                      className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.year ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    >
                      <option value="">Select year</option>
                      <option value="1st">1st Year</option>
                      <option value="2nd">2nd Year</option>
                      <option value="3rd">3rd Year</option>
                      <option value="4th">4th Year</option>
                    </select>
                    {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Roll Number *</label>
                    <input
                      type="text"
                      value={formData.rollNo}
                      onChange={(e) => handleInputChange('rollNo', e.target.value)}
                      className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.rollNo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                      placeholder="Enter roll number"
                    />
                    {errors.rollNo && <p className="mt-1 text-sm text-red-600">{errors.rollNo}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Semester *</label>
                    <select
                      value={formData.currentSemester}
                      onChange={(e) => handleInputChange('currentSemester', e.target.value)}
                      className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.currentSemester ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    >
                      <option value="">Select semester</option>
                      {Array.from({ length: 8 }, (_, i) => i + 1).map(sem => (
                        <option key={sem} value={sem}>{sem}{sem === 1 ? 'st' : sem === 2 ? 'nd' : sem === 3 ? 'rd' : 'th'} Semester</option>
                      ))}
                    </select>
                    {errors.currentSemester && <p className="mt-1 text-sm text-red-600">{errors.currentSemester}</p>}
                  </div>
                </div>
              </>
            )}

            {role === 'faculty' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.department ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  >
                    <option value="">Select department</option>
                    {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                  {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Designation *</label>
                  <select
                    value={formData.designation}
                    onChange={(e) => handleInputChange('designation', e.target.value)}
                    className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.designation ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  >
                    <option value="">Select designation</option>
                    {designations.map(designation => <option key={designation} value={designation}>{designation}</option>)}
                  </select>
                  {errors.designation && <p className="mt-1 text-sm text-red-600">{errors.designation}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Qualification *</label>
                  <select
                    value={formData.qualification}
                    onChange={(e) => handleInputChange('qualification', e.target.value)}
                    className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.qualification ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  >
                    <option value="">Select qualification</option>
                    {qualifications.map(qual => <option key={qual} value={qual}>{qual}</option>)}
                  </select>
                  {errors.qualification && <p className="mt-1 text-sm text-red-600">{errors.qualification}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Employee ID *</label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => handleInputChange('employeeId', e.target.value)}
                    className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.employeeId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    placeholder="Enter employee ID"
                  />
                  {errors.employeeId && <p className="mt-1 text-sm text-red-600">{errors.employeeId}</p>}
                </div>
              </div>
            )}

            {role === 'college_admin' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Admin Level *</label>
                  <select
                    value={formData.adminLevel}
                    onChange={(e) => handleInputChange('adminLevel', e.target.value)}
                    className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.adminLevel ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  >
                    <option value="">Select admin level</option>
                    {adminLevels.map(level => <option key={level} value={level}>{level}</option>)}
                  </select>
                  {errors.adminLevel && <p className="mt-1 text-sm text-red-600">{errors.adminLevel}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Employee ID *</label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => handleInputChange('employeeId', e.target.value)}
                    className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.employeeId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    placeholder="Enter employee ID"
                  />
                  {errors.employeeId && <p className="mt-1 text-sm text-red-600">{errors.employeeId}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Responsibilities *</label>
                  <textarea
                    value={formData.responsibilities}
                    onChange={(e) => handleInputChange('responsibilities', e.target.value)}
                    className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.responsibilities ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    placeholder="Describe your key administrative responsibilities"
                    rows="3"
                  />
                  {errors.responsibilities && <p className="mt-1 text-sm text-red-600">{errors.responsibilities}</p>}
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email Verification</h3>
              <p className="text-gray-600 dark:text-gray-400">We've sent a 6-digit code to {email}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">Enter the 6-digit verification code</label>
                <div className="flex justify-center space-x-2">
                  {verificationCode.map((digit, index) => (
                    <input
                      key={`otp-${index}`}
                      ref={ref => verificationRefs.current[index] = ref}
                      type="text"
                      value={digit}
                      onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleVerificationKeyDown(index, e)}
                      className={`w-12 h-12 text-center text-lg font-bold border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.verificationCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                      maxLength={1}
                    />
                  ))}
                </div>
                {errors.verificationCode && <p className="mt-2 text-sm text-red-600 text-center">{errors.verificationCode}</p>}
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Resend code after: <span className="font-mono font-bold text-red-600">{formatTime(verificationTimer)}</span>
                </p>
                {canResendCode ? (
                  <button
                    onClick={() => {
                      setVerificationTimer(RESEND_COOLDOWN_SECONDS);
                      setCanResendCode(false);
                      sendVerificationEmail();
                    }}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                  >
                    Resend Code
                  </button>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Didn't receive the code? Request a new code after cooldown.</p>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Registration Successful! 🎉</h3>
              <p className="text-gray-600 dark:text-gray-400">Your {role.replace('_', ' ')} account has been created successfully.</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setIsLogin(true);
                  setCurrentStep(1);
                  setPassword('');
                  setConfirmPassword('');
                  setFormData({
                    profilePicture: null, profilePicturePreview: '', phoneNumber: '', gender: '',
                    admissionYear: '', course: '', stream: '', year: '', rollNo: '', currentSemester: '',
                    department: '', designation: '', qualification: '', experience: '', specialization: '', employeeId: '',
                    adminLevel: '', responsibilities: '', approvalAuthority: '', accessLevel: ''
                  });
                  setErrors({});
                }}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Go to Login
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // --- Step 4: UI Guards for missing code or fetching state ---
  
// --- Modern Liquid Glass Guards (Original Typography) ---

  // Shared Liquid Background Component
  const LiquidBackground = () => (
    <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 40, 0],
          y: [0, 60, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[15%] -left-[10%] w-[60%] h-[60%] rounded-full bg-indigo-500/20 blur-[100px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-[100px]"
      />
    </div>
  );

  if (collegeNotFoundError) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-500 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
        <LiquidBackground />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`max-w-md w-full p-8 rounded-3xl shadow-2xl border backdrop-blur-3xl text-center ${
            isDarkMode ? 'bg-white/[0.03] border-white/10' : 'bg-white/60 border-gray-200'
          }`}
        >
          <div className="relative mx-auto w-16 h-16 mb-6">
             <div className="absolute inset-0 bg-red-500/25 blur-2xl rounded-full" />
             <div className="relative flex items-center justify-center w-full h-full bg-red-500 text-white rounded-2xl shadow-lg">
                <AlertCircle className="h-8 w-8" />
             </div>
          </div>
          
          {/* Using Original Typography Weights & Styles */}
          <h2 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Institution Required
          </h2>
          <p className={`mb-8 text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            You must select your college from the selection page before you can log in.
          </p>
          
          <button
            onClick={() => navigate('/college-selection')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3.5 rounded-xl font-semibold transition-all transform active:scale-95 shadow-lg"
          >
            Go to Selection
          </button>
        </motion.div>
      </div>
    );
  }

  if (isFetchingCollege) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
        <LiquidBackground />
        <div className="flex flex-col items-center">
          <div className="relative w-16 h-16">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-t-2 border-indigo-500 rounded-full"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-1 border-b-2 border-purple-500 rounded-full opacity-50"
            />
          </div>
          <p className={`mt-6 text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-indigo-300' : 'text-indigo-900'}`}>
            Identifying Institution...
          </p>
        </div>
      </div>
    );
  }

 return (
    <div className={`min-h-screen flex items-center justify-center p-0 sm:p-4 transition-colors duration-500 overflow-hidden relative ${isDarkMode ? 'bg-[#0b0f19] text-white' : 'bg-gray-50 text-slate-900'}`}>
      
      {/* --- 1. Background: 4 Layers of Gentle Moving Icons (Right to Left) --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.07]">
        
        {/* Row 1: Top - Slow */}
        <motion.div
          className="flex space-x-24 absolute top-[5%] whitespace-nowrap"
          animate={{ x: [0, -1000] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          {[...Array(20)].map((_, i) => (
            <div key={`r1-${i}`} className="flex space-x-24">
              <GraduationCap size={40} /> <Users size={40} /> <ShieldCheck size={40} /> <Mail size={40} />
            </div>
          ))}
        </motion.div>

        {/* Row 2: Upper Middle - Medium Speed */}
        <motion.div
          className="flex space-x-32 absolute top-[30%] whitespace-nowrap"
          animate={{ x: [0, -1500] }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        >
           {[...Array(20)].map((_, i) => (
            <div key={`r2-${i}`} className="flex space-x-32">
              <CheckCircle size={35} /> <Lock size={35} /> <User size={35} /> <Phone size={35} />
            </div>
          ))}
        </motion.div>

        {/* Row 3: Lower Middle - Slower */}
        <motion.div
          className="flex space-x-28 absolute top-[60%] whitespace-nowrap"
          animate={{ x: [0, -1200] }}
          transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
        >
           {[...Array(20)].map((_, i) => (
            <div key={`r3-${i}`} className="flex space-x-28">
              <Upload size={45} /> <AlertCircle size={45} /> <Eye size={45} /> <Database size={45} />
            </div>
          ))}
        </motion.div>

        {/* Row 4: Bottom - Fastest of the gentle group */}
        <motion.div
          className="flex space-x-40 absolute bottom-[5%] whitespace-nowrap"
          animate={{ x: [0, -1800] }}
          transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
        >
           {[...Array(20)].map((_, i) => (
            <div key={`r4-${i}`} className="flex space-x-40">
              <FileText size={38} /> <Calendar size={38} /> <Settings size={38} /> <BookOpen size={38} />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Header */}
      <GlassHeader className="fixed top-0 w-full z-50 flex justify-end px-6 h-20">
        <ThemeToggle />
      </GlassHeader>

      {/* --- Main Card Container --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className={`relative z-10 w-full max-w-6xl min-h-[600px] mt-16 grid grid-cols-1 lg:grid-cols-2 rounded-none sm:rounded-xl shadow-2xl overflow-hidden border backdrop-blur-xl transition-all duration-300 ${
          isDarkMode ? 'bg-[#111827]/60 border-gray-700/50' : 'bg-white/80 border-white/50'
        }`}
      >
        {/* --- LEFT PANEL (Branding) --- */}
        <div className={`hidden lg:flex flex-col justify-between p-8 lg:p-12 relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-br from-indigo-900/20 to-purple-900/10' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
          
          {/* --- Decorative Slanting Graduation Cap --- */}
          <div className="absolute -right-12 -bottom-12 opacity-[0.08] transform rotate-12 pointer-events-none transition-transform hover:rotate-6 hover:scale-105 duration-700">
             <GraduationCap size={450} strokeWidth={1} />
          </div>

          <div className="relative z-10">
             {/* Back Button */}
             <button onClick={() => navigate('/college-selection')} className="mb-8 flex items-center space-x-2 text-sm font-semibold opacity-70 hover:opacity-100 transition-all">
               <ArrowLeft className="w-4 h-4" />
               <span>Back to Institutions</span>
             </button>

             {/* College Logo */}
             <div className="hidden lg:block">
                <LogoWithFallback 
                  collegeLogoUrl={selectedCollegeLogo}
                  collegeName={selectedCollege}
                  className="w-20 h-20 rounded-xl mb-6 object-contain"
                  fallbackClassName="w-20 h-20 rounded-xl mb-6 bg-white/10 flex items-center justify-center text-2xl font-bold"
                />
             </div>

             {/* Main Headings */}
             <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight tracking-tight">
               {selectedCollege || "Institute of Engineering Management"}
             </h1>
             <p className="text-lg opacity-70 font-medium leading-relaxed max-w-md mt-4">
               Your secure gateway to academic excellence. Access resources, collaborate with peers, and simplify your exams.
             </p>
          </div>
        </div>

        {/* --- RIGHT PANEL (Form) --- */}
        <div className={`p-8 md:p-12 flex flex-col justify-center ${isDarkMode ? 'bg-[#111827]/40' : 'bg-white/40'}`}>
          
          {/* Mobile View Logo */}
          <div className="lg:hidden mb-6 flex justify-center">
              <LogoWithFallback 
                collegeLogoUrl={selectedCollegeLogo}
                collegeName={selectedCollege}
                className="w-16 h-16 rounded-xl object-contain"
              />
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold mb-2">
              {isLogin ? 'Welcome Back!' 
                       : currentStep === 4 ? 'Success!' : 'Get Started'}
            </h2>
            {/* --- UPDATED TEXT: Only College Name --- */}
            <p className="text-sm font-bold opacity-60 uppercase tracking-wider">
               {selectedCollege}
            </p>
          </div>

          {/* Form Content */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <form onSubmit={(e) => { 
                e.preventDefault(); 
                if (isLogin) {
                  // Catch errors for the toast
                  try {
                    handleSubmit(e).catch(err => showErrorToast(err.message));
                  } catch (err) {
                    showErrorToast(err.message);
                  }
                }
              }} className="space-y-5">
              
              {isLogin ? (
                <>
                  {/* Role Dropdown */}
                  <div>
                    <label className="block text-sm font-medium mb-2 opacity-80">Select Role</label>
                    <div className="relative">
                      <Shield className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-50`} />
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none cursor-pointer ${
                          isDarkMode 
                            ? 'bg-gray-800/50 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="college_admin">College Admin</option>
                      </select>
                      <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-50 rotate-90 pointer-events-none" />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-medium mb-2 opacity-80">Institutional Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-50" />
                      <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                          isDarkMode ? 'bg-gray-800/50 border-gray-600' : 'bg-white border-gray-300'
                        }`}
                        placeholder="Enter your email" 
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-sm font-medium mb-2 opacity-80">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-50" />
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                          isDarkMode ? 'bg-gray-800/50 border-gray-600' : 'bg-white border-gray-300'
                        }`}
                        placeholder="Enter your password" 
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-50 hover:opacity-100">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                  {renderSignupStep()}
                </div>
              )}

              {/* Gradient Submit Button */}
<button
  // Type is 'submit' for Login or the Final Step (Create Account), otherwise just a 'button'
  type={isLogin || currentStep === 3 ? "submit" : "button"}
  disabled={loading}
  onClick={(e) => {
    // 1. If Log In: Do nothing here. The <form onSubmit> handler will take care of it.
    if (isLogin) return;

    // 2. If Signup: Prevent default form submission and use your central logic.
    e.preventDefault();
    
    // This calls your main function which:
    // - Validates inputs
    // - Moves Step 1 -> Step 2
    // - Moves Step 2 -> Step 3 AND calls sendVerificationEmail() automatically
    nextStep(); 
  }}
  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3.5 rounded-lg font-semibold shadow-lg transition-all transform hover:scale-[1.01] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
>
  <div className="flex items-center justify-center space-x-2">
    <span>
      {loading 
        ? 'Processing...' 
        : (isLogin ? 'Log In' : (currentStep === 3 ? 'Verify & Create Account' : 'Continue'))
      }
    </span>
    {!loading && <ChevronRight className="w-4 h-4" />}
  </div>
</button>

              <div className="text-center space-y-3 pt-4">
                <button type="button" onClick={() => { setIsLogin(!isLogin); setCurrentStep(1); setErrors({}); }} className="text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors">
                  {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
                </button>
                {isLogin && (
                  <button type="button" onClick={handleForgotPassword} className="block w-full text-xs text-opacity-60 hover:text-opacity-100 transition-all">
                    Forgot Password?
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;