import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, Animated, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, Shield, GraduationCap, Users, ShieldCheck, Phone, Upload, CheckCircle, AlertCircle, ChevronRight, X } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useErrorPopup } from '../../contexts/ErrorPopupContext';
import { useSession } from '../../hooks/useSession';
import { API_BASE } from '../../lib/constants';
import GlassHeader from '../../components/ui/GlassHeader';
import ThemeToggle from '../../components/ui/ThemeToggle';
import OtpInput from '../../components/ui/OtpInput';

const { width } = Dimensions.get('window');

export default function LoginPage() {
  const { isDarkMode } = useTheme();
  const { triggerPopup } = useErrorPopup();
  const { login } = useSession();
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const codeParam = params.code as string || '';

  const [selectedCollege, setSelectedCollege] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('student');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationTimer, setVerificationTimer] = useState(90);
  const [canResendCode, setCanResendCode] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [collegeNotFoundError, setCollegeNotFoundError] = useState(false);
  const [isFetchingCollege, setIsFetchingCollege] = useState(true);
  const [registeredUid, setRegisteredUid] = useState('');

  const [formData, setFormData] = useState({
    phoneNumber: '', gender: '', admissionYear: '', course: '', stream: '', year: '', rollNo: '', currentSemester: '',
    department: '', designation: '', qualification: '', employeeId: '',
    adminLevel: '', responsibilities: '',
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (!codeParam) {
      setCollegeNotFoundError(true);
      setIsFetchingCollege(false);
      return;
    }
    const fetchCollege = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/auth/public/colleges`);
        if (response.ok) {
          const allColleges = await response.json();
          const current = allColleges.find((c: any) => c.collegeCode === codeParam);
          if (current) {
            setSelectedCollege(current.name);
          } else {
            setCollegeNotFoundError(true);
          }
        }
      } catch {}
      setIsFetchingCollege(false);
    };
    fetchCollege();
  }, [codeParam]);

  useEffect(() => {
    let interval: any;
    if (verificationSent && verificationTimer > 0) {
      interval = setInterval(() => {
        setVerificationTimer(prev => {
          if (prev <= 1) { setCanResendCode(true); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [verificationSent, verificationTimer]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const validateStep = (step: number) => {
    const errs: Record<string, string> = {};
    switch (step) {
      case 1:
        if (!fullName.trim()) errs.fullName = 'Full name is required';
        if (!email.trim()) errs.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email';
        if (!password) errs.password = 'Password is required';
        else if (password.length < 8) errs.password = 'Min 8 characters';
        if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
        break;
      case 2:
        if (role === 'student') {
          if (!formData.phoneNumber) errs.phoneNumber = 'Required';
          if (!formData.gender) errs.gender = 'Required';
          if (!formData.course) errs.course = 'Required';
          if (!formData.rollNo) errs.rollNo = 'Required';
        } else if (role === 'faculty') {
          if (!formData.department) errs.department = 'Required';
          if (!formData.designation) errs.designation = 'Required';
          if (!formData.employeeId) errs.employeeId = 'Required';
        } else {
          if (!formData.adminLevel) errs.adminLevel = 'Required';
          if (!formData.employeeId) errs.employeeId = 'Required';
        }
        break;
      case 3:
        if (verificationCode.join('').length !== 6) errs.verificationCode = 'Enter complete 6-digit code';
        break;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const sendVerificationEmail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/auth/send-verification`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: fullName, collegeName: selectedCollege, role, type: 'signup' }),
      });
      const data = await response.json();
      setLoading(false);
      if (response.ok) {
        setVerificationSent(true);
        setVerificationTimer(90);
        setCanResendCode(false);
      } else {
        setErrors({ general: data.error || 'Failed to send verification' });
      }
    } catch { setLoading(false); setErrors({ general: 'Network error' }); }
  };

  const registerUser = async () => {
    try {
      setLoading(true);
      const payload: any = { fullName, email, password, role, collegeName: selectedCollege, collegeCode: codeParam };
      if (role === 'student') Object.assign(payload, formData);
      else if (role === 'faculty') Object.assign(payload, { department: formData.department, designation: formData.designation, qualification: formData.qualification, employeeId: formData.employeeId });
      else Object.assign(payload, { adminLevel: formData.adminLevel, responsibilities: formData.responsibilities, employeeId: formData.employeeId });

      const response = await fetch(`${API_BASE}/api/auth/role-signup`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setLoading(false);
      if (response.ok) {
        if (data.uid) setRegisteredUid(data.uid);
        setCurrentStep(4);
      } else {
        triggerPopup(data.error || 'Registration failed', 'error');
      }
    } catch { setLoading(false); triggerPopup('Registration failed', 'error'); }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 1) setCurrentStep(2);
      else if (currentStep === 2) { sendVerificationEmail(); setCurrentStep(3); }
      else if (currentStep === 3) { verifyAndRegister(); }
    }
  };

  const verifyAndRegister = async () => {
    if (!validateStep(3)) return;
    try {
      setLoading(true);
      const verifyResponse = await fetch(`${API_BASE}/api/auth/verify-email`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode.join(''), type: 'signup' }),
      });
      if (verifyResponse.ok) {
        await registerUser();
      } else {
        const err = await verifyResponse.json();
        setErrors({ verificationCode: err.message || 'Invalid code' });
        setLoading(false);
      }
    } catch { setLoading(false); setErrors({ verificationCode: 'Verification failed' }); }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) { triggerPopup('Please fill all fields', 'error'); return; }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/signin`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, collegeCode: codeParam, role }),
      });
      const data = await response.json();
      setLoading(false);
      if (response.ok) {
        await login(data.sessionToken);
        router.replace('/(app)/dashboard');
      } else {
        triggerPopup(data.error || 'Invalid credentials', 'error');
      }
    } catch { setLoading(false); triggerPopup('Server not responding', 'error'); }
  };

  if (collegeNotFoundError) {
    return (
      <View style={[styles.guardContainer, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
        <View style={[styles.guardCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)', borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }]}>
          <AlertCircle size={32} color="#ef4444" />
          <Text style={[styles.guardTitle, { color: isDarkMode ? 'white' : '#111827' }]}>Institution Required</Text>
          <Text style={[styles.guardText, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>Please select your college before logging in.</Text>
          <TouchableOpacity onPress={() => router.replace('/college-selection')} style={styles.guardBtn}>
            <Text style={styles.guardBtnText}>Go to Selection</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isFetchingCollege) {
    return (
      <View style={[styles.guardContainer, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={[styles.guardText, { marginTop: 16, color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>Identifying Institution...</Text>
      </View>
    );
  }

  const renderSignupStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.label, { color: isDarkMode ? '#e5e7eb' : '#374151' }]}>Role</Text>
            <View style={styles.roleGrid}>
              {[
                { value: 'student', label: 'Student', icon: GraduationCap },
                { value: 'faculty', label: 'Faculty', icon: Users },
                { value: 'college_admin', label: 'Admin', icon: ShieldCheck },
              ].map(r => {
                const Icon = r.icon;
                return (
                  <TouchableOpacity key={r.value} onPress={() => setRole(r.value)} style={[styles.roleCard, role === r.value ? styles.roleCardActive : {}]}>
                    <Icon size={24} color={role === r.value ? '#7c3aed' : isDarkMode ? '#9ca3af' : '#6b7280'} />
                    <Text style={[styles.roleText, { color: isDarkMode ? '#d1d5db' : '#4b5563' }]}>{r.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <InputField label="Full Name" icon={User} value={fullName} onChange={setFullName} error={errors.fullName} isDarkMode={isDarkMode} placeholder="Enter your full name" />
            <InputField label="Email" icon={Mail} value={email} onChange={(v) => { setEmail(v); setEmailExists(false); }} error={errors.email} isDarkMode={isDarkMode} placeholder="Enter your email" keyboardType="email-address" />
            <InputField label="Password" icon={Lock} value={password} onChange={setPassword} error={errors.password} isDarkMode={isDarkMode} placeholder="Min 8 characters" isPassword />
            <InputField label="Confirm Password" icon={Lock} value={confirmPassword} onChange={setConfirmPassword} error={errors.confirmPassword} isDarkMode={isDarkMode} placeholder="Confirm password" isPassword />
          </View>
        );

      case 2:
        return (
          <ScrollView style={{ maxHeight: 400 }}>
            {role === 'student' && (
              <View style={styles.stepContainer}>
                <InputField label="Phone Number" icon={Phone} value={formData.phoneNumber} onChange={(v) => setFormData({...formData, phoneNumber: v})} error={errors.phoneNumber} isDarkMode={isDarkMode} placeholder="10-digit number" keyboardType="phone-pad" />
                <Text style={[styles.label, { color: isDarkMode ? '#e5e7eb' : '#374151' }]}>Gender</Text>
                <View style={styles.genderRow}>
                  {['Male', 'Female', 'Other'].map(g => (
                    <TouchableOpacity key={g} onPress={() => setFormData({...formData, gender: g})} style={[styles.genderOption, { borderColor: formData.gender === g ? '#7c3aed' : isDarkMode ? '#4b5563' : '#d1d5db' }]}>
                      <Text style={{ color: isDarkMode ? '#d1d5db' : '#4b5563' }}>{g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <InputField label="Course" value={formData.course} onChange={(v) => { setFormData({...formData, course: v, stream: ''}); }} error={errors.course} isDarkMode={isDarkMode} placeholder="e.g. B.Tech" />
                <InputField label="Roll Number" value={formData.rollNo} onChange={(v) => setFormData({...formData, rollNo: v})} error={errors.rollNo} isDarkMode={isDarkMode} placeholder="Enter roll number" />
              </View>
            )}
            {role === 'faculty' && (
              <View style={styles.stepContainer}>
                <InputField label="Department" value={formData.department} onChange={(v) => setFormData({...formData, department: v})} error={errors.department} isDarkMode={isDarkMode} placeholder="e.g. Computer Science" />
                <InputField label="Designation" value={formData.designation} onChange={(v) => setFormData({...formData, designation: v})} error={errors.designation} isDarkMode={isDarkMode} placeholder="e.g. Professor" />
                <InputField label="Employee ID" value={formData.employeeId} onChange={(v) => setFormData({...formData, employeeId: v})} error={errors.employeeId} isDarkMode={isDarkMode} placeholder="Enter employee ID" />
              </View>
            )}
            {role === 'college_admin' && (
              <View style={styles.stepContainer}>
                <InputField label="Admin Level" value={formData.adminLevel} onChange={(v) => setFormData({...formData, adminLevel: v})} error={errors.adminLevel} isDarkMode={isDarkMode} placeholder="e.g. College Admin" />
                <InputField label="Employee ID" value={formData.employeeId} onChange={(v) => setFormData({...formData, employeeId: v})} error={errors.employeeId} isDarkMode={isDarkMode} placeholder="Enter employee ID" />
                <Text style={[styles.label, { color: isDarkMode ? '#e5e7eb' : '#374151' }]}>Responsibilities</Text>
                <TextInput
                  value={formData.responsibilities}
                  onChangeText={(v) => setFormData({...formData, responsibilities: v})}
                  multiline
                  numberOfLines={3}
                  placeholder="Describe your responsibilities"
                  placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
                  style={[styles.textArea, { backgroundColor: isDarkMode ? 'rgba(55,65,81,0.5)' : 'white', borderColor: isDarkMode ? '#4b5563' : '#d1d5db', color: isDarkMode ? 'white' : '#111827' }]}
                />
              </View>
            )}
          </ScrollView>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.verificationHeader}>
              <CheckCircle size={48} color="#22c55e" />
              <Text style={[styles.verificationTitle, { color: isDarkMode ? 'white' : '#111827' }]}>Email Verification</Text>
              <Text style={[styles.verificationSubtitle, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>We've sent a 6-digit code to {email}</Text>
            </View>
            <Text style={[styles.otpLabel, { color: isDarkMode ? '#e5e7eb' : '#374151' }]}>Enter verification code</Text>
            <OtpInput code={verificationCode} onChange={(i, v) => { const c = [...verificationCode]; c[i] = v; setVerificationCode(c); }} onKeyDown={() => {}} error={errors.verificationCode} />
            {errors.verificationCode && <Text style={styles.errorText}>{errors.verificationCode}</Text>}
            <View style={styles.resendRow}>
              <Text style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>Resend code after: </Text>
              <Text style={[styles.timerText, { color: isDarkMode ? '#ef4444' : '#dc2626' }]}>{formatTime(verificationTimer)}</Text>
            </View>
            {canResendCode && (
              <TouchableOpacity onPress={sendVerificationEmail} disabled={loading}>
                <Text style={styles.resendBtn}>Resend Code</Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.successContainer}>
              <View style={styles.successIcon}><CheckCircle size={32} color="#16a34a" /></View>
              <Text style={[styles.successTitle, { color: isDarkMode ? 'white' : '#111827' }]}>Registration Successful!</Text>
              <Text style={[styles.successSubtitle, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>Your {role.replace('_', ' ')} account has been created.</Text>
              {registeredUid ? <Text style={[styles.uidText, { backgroundColor: isDarkMode ? '#1e293b' : '#f3f4f6', color: isDarkMode ? '#93c5fd' : '#2563eb' }]}>ID: {registeredUid}</Text> : null}
              <TouchableOpacity onPress={() => { setIsLogin(true); setCurrentStep(1); }} style={styles.successBtn}>
                <Text style={styles.successBtnText}>Go to Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: isDarkMode ? '#0b0f19' : '#f9fafb' }]}>
      <GlassHeader>
        <View style={[styles.headerRight, { paddingTop: insets.top + 8 }]}>
          <ThemeToggle />
        </View>
      </GlassHeader>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.formContainer, { backgroundColor: isDarkMode ? 'rgba(17,24,39,0.6)' : 'rgba(255,255,255,0.8)', borderColor: isDarkMode ? 'rgba(55,65,81,0.5)' : 'rgba(255,255,255,0.5)' }]}>
          <View style={styles.formHeader}>
            {!isLogin && currentStep > 1 && (
              <TouchableOpacity onPress={() => setCurrentStep(currentStep - 1)} style={styles.backBtn}>
                <ArrowLeft size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
              </TouchableOpacity>
            )}
            <Text style={[styles.formTitle, { color: isDarkMode ? 'white' : '#111827' }]}>
              {isLogin ? 'Welcome Back!' : currentStep === 4 ? 'Success!' : 'Get Started'}
            </Text>
            {selectedCollege && <Text style={[styles.formSubtitle, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>{selectedCollege}</Text>}
          </View>

          {errors.general && <Text style={styles.generalError}>{errors.general}</Text>}

          {isLogin ? (
            <View>
              <Text style={[styles.label, { color: isDarkMode ? '#e5e7eb' : '#374151' }]}>Role</Text>
              <View style={styles.roleGrid}>
                {[
                  { value: 'student', label: 'Student', icon: GraduationCap },
                  { value: 'faculty', label: 'Faculty', icon: Users },
                  { value: 'college_admin', label: 'Admin', icon: ShieldCheck },
                ].map(r => {
                  const Icon = r.icon;
                  return (
                    <TouchableOpacity key={r.value} onPress={() => setRole(r.value)} style={[styles.roleCard, role === r.value ? styles.roleCardActive : {}]}>
                      <Icon size={20} color={role === r.value ? '#7c3aed' : isDarkMode ? '#9ca3af' : '#6b7280'} />
                      <Text style={[styles.roleTextSm, { color: isDarkMode ? '#d1d5db' : '#4b5563' }]}>{r.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <InputField label="Email" icon={Mail} value={email} onChange={setEmail} isDarkMode={isDarkMode} placeholder="Enter your email" keyboardType="email-address" />
              <InputField label="Password" icon={Lock} value={password} onChange={setPassword} isDarkMode={isDarkMode} placeholder="Enter your password" isPassword />
            </View>
          ) : (
            renderSignupStep()
          )}

          <TouchableOpacity
            onPress={() => { isLogin ? handleLogin() : nextStep(); }}
            disabled={loading}
            style={[styles.submitBtn, { opacity: loading ? 0.7 : 1 }]}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <View style={styles.submitRow}>
                <Text style={styles.submitText}>
                  {isLogin ? 'Log In' : currentStep === 3 ? 'Verify & Create Account' : 'Continue'}
                </Text>
                <ChevronRight size={16} color="white" />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setCurrentStep(1); setErrors({}); }} style={styles.switchBtn}>
            <Text style={[styles.switchText, { color: isDarkMode ? '#60a5fa' : '#2563eb' }]}>
              {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const InputField = ({ label, icon: Icon, value, onChange, error, isDarkMode, placeholder, isPassword, keyboardType }: any) => {
  const [show, setShow] = useState(false);
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={[styles.label, { color: isDarkMode ? '#e5e7eb' : '#374151' }]}>{label}</Text>
      <View style={[styles.inputWrapper, { borderColor: error ? '#ef4444' : isDarkMode ? '#4b5563' : '#d1d5db' }]}>
        {Icon && <Icon size={18} color={isDarkMode ? '#9ca3af' : '#6b7280'} style={styles.inputIcon} />}
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
          secureTextEntry={isPassword && !show}
          keyboardType={keyboardType || 'default'}
          style={[styles.input, { color: isDarkMode ? 'white' : '#111827', paddingLeft: Icon ? 40 : 16 }]}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShow(!show)} style={styles.eyeIcon}>
            {show ? <EyeOff size={18} color={isDarkMode ? '#9ca3af' : '#6b7280'} /> : <Eye size={18} color={isDarkMode ? '#9ca3af' : '#6b7280'} />}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRight: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 8, paddingBottom: 8 },
  guardContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  guardCard: { width: '100%', maxWidth: 400, padding: 32, borderRadius: 24, borderWidth: 1, alignItems: 'center', gap: 16 },
  guardTitle: { fontSize: 24, fontWeight: '700' },
  guardText: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  guardBtn: { backgroundColor: '#7c3aed', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, width: '100%', alignItems: 'center' },
  guardBtnText: { color: 'white', fontSize: 16, fontWeight: '600' },
  scrollContent: { paddingTop: 100, paddingBottom: 40, paddingHorizontal: 16, alignItems: 'center' },
  formContainer: { width: '100%', maxWidth: 500, borderRadius: 16, borderWidth: 1, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 8 },
  formHeader: { marginBottom: 24, alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start', padding: 8, marginBottom: 8 },
  formTitle: { fontSize: 28, fontWeight: '700', marginBottom: 4 },
  formSubtitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, position: 'relative' },
  inputIcon: { position: 'absolute', left: 12, zIndex: 1 },
  input: { flex: 1, paddingVertical: 14, paddingRight: 16, fontSize: 15, borderRadius: 12 },
  eyeIcon: { padding: 12, position: 'absolute', right: 0 },
  errorText: { color: '#ef4444', fontSize: 13, marginTop: 4 },
  generalError: { backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  roleGrid: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  roleCard: { flex: 1, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8, borderRadius: 12, borderWidth: 2, borderColor: '#d1d5db', gap: 4 },
  roleCardActive: { borderColor: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.05)' },
  roleText: { fontSize: 13, fontWeight: '500' },
  roleTextSm: { fontSize: 11, fontWeight: '500' },
  genderRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  genderOption: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 8, borderWidth: 1 },
  textArea: { borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 15, minHeight: 80, textAlignVertical: 'top' },
  stepContainer: { gap: 4 },
  verificationHeader: { alignItems: 'center', marginBottom: 24, gap: 12 },
  verificationTitle: { fontSize: 20, fontWeight: '700' },
  verificationSubtitle: { fontSize: 14, textAlign: 'center' },
  otpLabel: { fontSize: 14, fontWeight: '500', marginBottom: 12, textAlign: 'center' },
  resendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  timerText: { fontFamily: 'monospace', fontWeight: '700' },
  resendBtn: { color: '#2563eb', fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: 12 },
  successContainer: { alignItems: 'center', gap: 16, paddingVertical: 20 },
  successIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(22,163,74,0.1)', alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: 22, fontWeight: '700' },
  successSubtitle: { fontSize: 14, textAlign: 'center' },
  uidText: { fontSize: 13, fontFamily: 'monospace', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8, overflow: 'hidden' },
  successBtn: { backgroundColor: '#7c3aed', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, width: '100%', alignItems: 'center', marginTop: 16 },
  successBtnText: { color: 'white', fontSize: 16, fontWeight: '600' },
  submitBtn: { backgroundColor: '#7c3aed', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  submitRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitText: { color: 'white', fontSize: 16, fontWeight: '600' },
  switchBtn: { alignItems: 'center', marginTop: 16 },
  switchText: { fontSize: 14, fontWeight: '500' },
});
