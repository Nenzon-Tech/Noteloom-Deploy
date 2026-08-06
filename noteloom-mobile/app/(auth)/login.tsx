import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Building2, GraduationCap, Users, ShieldCheck, Settings, CheckCircle, AlertCircle, ChevronRight, Fingerprint } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useErrorPopup } from '../../contexts/ErrorPopupContext';
import { useSession } from '../../hooks/useSession';
import { API_BASE } from '../../lib/constants';
import { authHeaders, publicHeaders } from '../../lib/api';
import { isBiometricEnabled, setBiometricEnabled, removeSecure } from '../../lib/storage';
import { Gradient } from '../../components/ui/Gradient';
import { GradButton, GhostButton } from '../../components/ui/GradButton';
import { RoleCard } from '../../components/ui/RoleCard';
import { Field } from '../../components/ui/Field';
import OtpInput from '../../components/ui/OtpInput';
import { BiometricSetupModal } from '../../components/ui/BiometricSetupModal';

interface RoleDef {
  value: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
}

const ROLES: RoleDef[] = [
  { value: 'student', label: 'Student', desc: 'Notes, attendance, timetables & AI.', icon: <GraduationCap size={17} /> },
  { value: 'faculty', label: 'Faculty', desc: 'Manage classes, attendance & notices.', icon: <Users size={17} /> },
  { value: 'college_admin', label: 'College Admin', desc: 'Approvals, users & campus notices.', icon: <ShieldCheck size={17} /> },
  { value: 'it', label: 'IT Admin', desc: 'Servers, tickets, audit & ops.', icon: <Settings size={17} /> },
];

const CREDS: Record<string, string> = {
  student: 'student@iem.ac.in',
  faculty: 'faculty@iem.ac.in',
  college_admin: 'admin@iem.ac.in',
  it: 'itadmin@iem.ac.in',
};

export default function LoginPage() {
  const { theme } = useTheme();
  const { triggerPopup } = useErrorPopup();
  const { login, validateSession, authenticateWithBiometrics } = useSession();
  const router = useRouter();
  const params = useLocalSearchParams();

  const codeParam = params.code as string || '';

  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const [biometricRestoring, setBiometricRestoring] = useState(false);

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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationTimer, setVerificationTimer] = useState(90);
  const [canResendCode, setCanResendCode] = useState(false);
  const [collegeNotFoundError, setCollegeNotFoundError] = useState(false);
  const [isFetchingCollege, setIsFetchingCollege] = useState(true);
  const [registeredUid, setRegisteredUid] = useState('');

  const [formData, setFormData] = useState({
    phoneNumber: '', gender: '', course: '', rollNo: '',
    department: '', designation: '', qualification: '', employeeId: '',
    adminLevel: '', responsibilities: '',
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      const enabled = await isBiometricEnabled();
      if (mounted) setBiometricEnabledState(enabled);
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!codeParam) {
      setCollegeNotFoundError(true);
      setIsFetchingCollege(false);
      return;
    }
    const fetchCollege = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/auth/public/colleges`, { headers: publicHeaders() });
        if (response.ok) {
          const allColleges = await response.json();
          const current = allColleges.find((c: any) => c.collegeCode === codeParam);
          if (current) setSelectedCollege(current.name);
          else setCollegeNotFoundError(true);
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
        method: 'POST', headers: publicHeaders(),
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
        method: 'POST', headers: publicHeaders(),
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

  const verifyAndRegister = async () => {
    if (!validateStep(3)) return;
    try {
      setLoading(true);
      const verifyResponse = await fetch(`${API_BASE}/api/auth/verify-email`, {
        method: 'POST', headers: publicHeaders(),
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

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 1) setCurrentStep(2);
      else if (currentStep === 2) { sendVerificationEmail(); setCurrentStep(3); }
      else if (currentStep === 3) { verifyAndRegister(); }
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) { triggerPopup('Please fill all fields', 'error'); return; }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/signin`, {
        method: 'POST', headers: publicHeaders(),
        body: JSON.stringify({ email: email.trim(), password, collegeCode: codeParam, role }),
      });
      const data = await response.json();
      setLoading(false);
      if (response.ok) {
        await login(data.sessionToken);
        const enabled = await isBiometricEnabled();
        setBiometricEnabledState(enabled);
        if (!enabled) {
          setShowBiometricSetup(true);
        } else {
          router.replace('/(app)/dashboard');
        }
      } else {
        triggerPopup(data.error || 'Invalid credentials', 'error');
      }
    } catch { setLoading(false); triggerPopup('Server not responding', 'error'); }
  };

  const handleFingerprint = async () => {
    if (biometricRestoring) return;
    setBiometricRestoring(true);
    try {
      const ok = await authenticateWithBiometrics();
      if (!ok) return;
      const valid = await validateSession();
      if (valid) {
        router.replace('/(app)');
      } else {
        triggerPopup('Session expired. Please sign in again.', 'error');
      }
    } catch {
      triggerPopup('Biometrics unavailable. Please sign in manually.', 'error');
    } finally {
      setBiometricRestoring(false);
    }
  };

  const handleChooseCollege = async () => {
    await removeSecure('sessionToken');
    await removeSecure('selectedCollegeCode');
    await removeSecure('selectedCollegeName');
    router.replace('/college-selection');
  };

  const pickRole = (r: string) => {
    if (r === 'it') {
      router.push('/it-login');
      return;
    }
    setRole(r);
  };

  const renderSignupStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.label, { color: theme.fg }]}>Role</Text>
            <View style={styles.roleRow}>
              {ROLES.filter(r => r.value !== 'it').map(r => (
                <RoleCard
                  key={r.value}
                  icon={r.icon}
                  title={r.label}
                  description={r.desc}
                  selected={role === r.value}
                  onPress={() => setRole(r.value)}
                  style={styles.roleCell}
                />
              ))}
            </View>
            <InputField label="Full Name" value={fullName} onChange={setFullName} error={errors.fullName} placeholder="Enter your full name" />
            <InputField label="Email" value={email} onChange={setEmail} error={errors.email} placeholder="Enter your email" keyboardType="email-address" />
            <InputField label="Password" value={password} onChange={setPassword} error={errors.password} placeholder="Min 8 characters" isPassword />
            <InputField label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} error={errors.confirmPassword} placeholder="Confirm password" isPassword />
          </View>
        );

      case 2:
        return (
          <ScrollView style={{ maxHeight: 420 }}>
            {role === 'student' && (
              <View style={styles.stepContainer}>
                <InputField label="Phone Number" value={formData.phoneNumber} onChange={(v: string) => setFormData({ ...formData, phoneNumber: v })} error={errors.phoneNumber} placeholder="10-digit number" keyboardType="phone-pad" />
                <Text style={[styles.label, { color: theme.fg }]}>Gender</Text>
                <View style={styles.genderRow}>
                  {['Male', 'Female', 'Other'].map(g => (
                    <Pressable key={g} onPress={() => setFormData({ ...formData, gender: g })} style={[styles.genderOption, { borderColor: formData.gender === g ? theme.violet : theme.border, backgroundColor: formData.gender === g ? 'rgba(124,58,237,0.08)' : theme.surface }]}>
                      <Text style={{ color: formData.gender === g ? theme.violet : theme.muted, fontSize: 13, fontWeight: '600' }}>{g}</Text>
                    </Pressable>
                  ))}
                </View>
                <InputField label="Course" value={formData.course} onChange={(v: string) => setFormData({ ...formData, course: v })} error={errors.course} placeholder="e.g. B.Tech" />
                <InputField label="Roll Number" value={formData.rollNo} onChange={(v: string) => setFormData({ ...formData, rollNo: v })} error={errors.rollNo} placeholder="Enter roll number" />
              </View>
            )}
            {role === 'faculty' && (
              <View style={styles.stepContainer}>
                <InputField label="Department" value={formData.department} onChange={(v: string) => setFormData({ ...formData, department: v })} error={errors.department} placeholder="e.g. Computer Science" />
                <InputField label="Designation" value={formData.designation} onChange={(v: string) => setFormData({ ...formData, designation: v })} error={errors.designation} placeholder="e.g. Professor" />
                <InputField label="Employee ID" value={formData.employeeId} onChange={(v: string) => setFormData({ ...formData, employeeId: v })} error={errors.employeeId} placeholder="Enter employee ID" />
              </View>
            )}
            {role === 'college_admin' && (
              <View style={styles.stepContainer}>
                <InputField label="Admin Level" value={formData.adminLevel} onChange={(v: string) => setFormData({ ...formData, adminLevel: v })} error={errors.adminLevel} placeholder="e.g. College Admin" />
                <InputField label="Employee ID" value={formData.employeeId} onChange={(v: string) => setFormData({ ...formData, employeeId: v })} error={errors.employeeId} placeholder="Enter employee ID" />
                <Text style={[styles.label, { color: theme.fg }]}>Responsibilities</Text>
                <TextInput
                  value={formData.responsibilities}
                  onChangeText={(v: string) => setFormData({ ...formData, responsibilities: v })}
                  multiline
                  numberOfLines={3}
                  placeholder="Describe your responsibilities"
                  placeholderTextColor={theme.faint}
                  style={[styles.textArea, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.fg }]}
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
              <Text style={[styles.verificationTitle, { color: theme.fg }]}>Email Verification</Text>
              <Text style={[styles.verificationSubtitle, { color: theme.muted }]}>We've sent a 6-digit code to {email}</Text>
            </View>
            <Text style={[styles.label, { color: theme.fg }]}>Enter verification code</Text>
            <OtpInput code={verificationCode} onChange={(i: number, v: string) => { const c = [...verificationCode]; c[i] = v; setVerificationCode(c); }} onKeyDown={() => {}} error={errors.verificationCode} />
            {errors.verificationCode && <Text style={styles.errorText}>{errors.verificationCode}</Text>}
            <View style={styles.resendRow}>
              <Text style={{ color: theme.muted }}>Resend code after: </Text>
              <Text style={[styles.timerText, { color: theme.red }]}>{formatTime(verificationTimer)}</Text>
            </View>
            {canResendCode && (
              <TouchableOpacity onPress={sendVerificationEmail} disabled={loading}>
                <Text style={[styles.resendBtn, { color: theme.blue }]}>Resend Code</Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.successContainer}>
              <View style={styles.successIcon}><CheckCircle size={32} color="#16a34a" /></View>
              <Text style={[styles.successTitle, { color: theme.fg }]}>Registration Successful!</Text>
              <Text style={[styles.successSubtitle, { color: theme.muted }]}>Your {role.replace('_', ' ')} account has been created.</Text>
              {registeredUid ? <Text style={[styles.uidText, { backgroundColor: theme.surface2, color: theme.blue }]}>ID: {registeredUid}</Text> : null}
              <GradButton fullWidth size="lg" onPress={() => { setIsLogin(true); setCurrentStep(1); }}>
                Go to Login
              </GradButton>
            </View>
          </View>
        );
    }
  };

  if (collegeNotFoundError) {
    return (
      <View style={[styles.guardContainer, { backgroundColor: theme.bg }]}>
        <View style={[styles.guardCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <AlertCircle size={32} color="#ef4444" />
          <Text style={[styles.guardTitle, { color: theme.fg }]}>Institution Required</Text>
          <Text style={[styles.guardText, { color: theme.muted }]}>Please select your college before logging in.</Text>
          <GradButton fullWidth size="lg" onPress={() => router.replace('/college-selection')}>
            Go to Selection
          </GradButton>
        </View>
      </View>
    );
  }

  if (isFetchingCollege) {
    return (
      <View style={[styles.guardContainer, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.violet} />
        <Text style={[styles.guardText, { marginTop: 16, color: theme.muted }]}>Identifying Institution...</Text>
      </View>
    );
  }

  return (
    <>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: theme.bg }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.backRow}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
            <ArrowLeft size={18} color={theme.fg} />
          </Pressable>
        </View>

        {isLogin ? (
          <View style={styles.auth}>
            <Gradient colors={theme.gradientBrand} angle={135} radius={19} style={styles.logo}>
              <GraduationCap size={30} color="#fff" />
            </Gradient>
            <Text style={[styles.authTitle, { color: theme.fg }]}>Sign in</Text>
            <Text style={[styles.demoHint, { color: theme.muted }]}>
              Sign in with your <Text style={[styles.demoCode, { color: theme.violet }]}>{CREDS[role]}</Text>
            </Text>
            <View style={[styles.authCollege, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
              <Building2 size={14} color={theme.violet} />
              <Text style={[styles.authCollegeText, { color: theme.muted }]} numberOfLines={1}>{selectedCollege || 'IEM · Salt Lake'}</Text>
            </View>

            <Field
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.passWrap}>
              <Field
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eye}>
                {showPassword ? <EyeOff size={18} color={theme.faint} /> : <Eye size={18} color={theme.faint} />}
              </TouchableOpacity>
            </View>

            <View style={styles.roleGrid}>
              {ROLES.map(r => (
                <RoleCard
                  key={r.value}
                  icon={r.icon}
                  title={r.label}
                  description={r.desc}
                  selected={role === r.value}
                  onPress={() => pickRole(r.value)}
                  style={styles.roleCell}
                />
              ))}
            </View>

            {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}

            <GradButton fullWidth size="lg" onPress={handleLogin} loading={loading} icon={<Mail size={17} color="#fff" />}>
              Sign In
            </GradButton>

            {biometricEnabled && (
              <View style={styles.bioArea}>
                <View style={styles.bioDivider}>
                  <View style={[styles.bioLine, { backgroundColor: theme.border }]} />
                  <Text style={[styles.bioOr, { color: theme.faint }]}>OR</Text>
                  <View style={[styles.bioLine, { backgroundColor: theme.border }]} />
                </View>
                <GradButton
                  fullWidth
                  size="lg"
                  colors={['#0ea5e9', '#7c3aed']}
                  onPress={handleFingerprint}
                  loading={biometricRestoring}
                  icon={<Fingerprint size={17} color="#fff" />}
                >
                  {biometricRestoring ? 'Verifying…' : 'Sign in with Fingerprint'}
                </GradButton>
                <Pressable onPress={handleChooseCollege} style={styles.chooseCollege}>
                  <Text style={[styles.chooseText, { color: theme.blue }]}>Choose a different college</Text>
                </Pressable>
              </View>
            )}

            <Text style={[styles.authSec, { color: theme.faint }]}>Protected by Institute of Engineering & Management · Demo build 1.0</Text>
          </View>
        ) : (
          <View style={[styles.formContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.formHeader}>
              {currentStep > 1 && (
                <TouchableOpacity onPress={() => setCurrentStep(currentStep - 1)} style={styles.backBtnSmall}>
                  <ArrowLeft size={20} color={theme.muted} />
                </TouchableOpacity>
              )}
              <Text style={[styles.formTitle, { color: theme.fg }]}>
                {currentStep === 4 ? 'Success!' : 'Get Started'}
              </Text>
              {selectedCollege && <Text style={[styles.formSubtitle, { color: theme.muted }]}>{selectedCollege}</Text>}
            </View>

            {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}
            {renderSignupStep()}

            <TouchableOpacity onPress={nextStep} disabled={loading} style={[styles.submitBtn, { backgroundColor: theme.violet, opacity: loading ? 0.7 : 1 }]} activeOpacity={0.8}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <View style={styles.submitRow}>
                  <Text style={styles.submitText}>
                    {currentStep === 3 ? 'Verify & Create Account' : 'Continue'}
                  </Text>
                  <ChevronRight size={16} color="white" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setCurrentStep(1); setErrors({}); }} style={styles.switchBtn}>
          <Text style={[styles.switchText, { color: theme.blue }]}>
            {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>
      <BiometricSetupModal
        visible={showBiometricSetup}
        onAccept={async () => {
          await setBiometricEnabled(true);
          setBiometricEnabledState(true);
          setShowBiometricSetup(false);
          router.replace('/(app)/dashboard');
        }}
        onDecline={async () => {
          await setBiometricEnabled(false);
          setShowBiometricSetup(false);
          router.replace('/(app)/dashboard');
        }}
      />
    </>
  );
}

const InputField = ({ label, value, onChange, error, placeholder, isPassword, keyboardType }: any) => {
  const { theme } = useTheme();
  const [show, setShow] = useState(false);
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={[styles.label, { color: theme.fg }]}>{label}</Text>
      <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: error ? theme.red : theme.border }]}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={theme.faint}
          secureTextEntry={isPassword && !show}
          keyboardType={keyboardType || 'default'}
          style={[styles.input, { color: theme.fg }]}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShow(!show)} style={styles.eyeIcon}>
            {show ? <EyeOff size={18} color={theme.faint} /> : <Eye size={18} color={theme.faint} />}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  backRow: { marginBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  guardContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  guardCard: { width: '100%', maxWidth: 400, padding: 32, borderRadius: 24, borderWidth: 1, alignItems: 'center', gap: 16 },
  guardTitle: { fontSize: 24, fontWeight: '700' },
  guardText: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  auth: { alignItems: 'stretch' },
  logo: { width: 64, height: 64, borderRadius: 19, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16 },
  authTitle: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  demoHint: { fontSize: 12, textAlign: 'center', marginTop: 6 },
  demoCode: { fontWeight: '700' },
  authCollege: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, alignSelf: 'center', borderRadius: 999, borderWidth: 1, paddingVertical: 7, paddingHorizontal: 14, marginTop: 14, marginBottom: 18 },
  authCollegeText: { fontSize: 12, fontWeight: '600' },
  passWrap: { position: 'relative' },
  eye: { position: 'absolute', right: 12, top: 15, zIndex: 2 },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 16 },
  roleCell: { flexBasis: '47%' },
  authSec: { fontSize: 10, textAlign: 'center', marginTop: 18 },
  bioArea: { marginTop: 14 },
  bioDivider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  bioLine: { flex: 1, height: 1 },
  bioOr: { fontSize: 11, fontWeight: '600' },
  chooseCollege: { alignItems: 'center', marginTop: 14 },
  chooseText: { fontSize: 13, fontWeight: '600' },
  formContainer: { borderRadius: 20, borderWidth: 1, padding: 20 },
  formHeader: { marginBottom: 20 },
  backBtnSmall: { alignSelf: 'flex-start', padding: 6, marginBottom: 8 },
  formTitle: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  formSubtitle: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center', marginTop: 4 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12 },
  input: { flex: 1, paddingVertical: 13, fontSize: 14 },
  eyeIcon: { padding: 10 },
  errorText: { color: '#ef4444', fontSize: 13, marginTop: 4 },
  stepContainer: { gap: 2 },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  genderRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  genderOption: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 10, borderWidth: 1 },
  textArea: { borderRadius: 12, borderWidth: 1, padding: 13, fontSize: 14, minHeight: 80, textAlignVertical: 'top' },
  verificationHeader: { alignItems: 'center', marginBottom: 24, gap: 12 },
  verificationTitle: { fontSize: 20, fontWeight: '700' },
  verificationSubtitle: { fontSize: 14, textAlign: 'center' },
  resendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  timerText: { fontFamily: 'monospace', fontWeight: '700' },
  resendBtn: { fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: 12 },
  successContainer: { alignItems: 'center', gap: 16, paddingVertical: 16 },
  successIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(22,163,74,0.1)', alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: 22, fontWeight: '700' },
  successSubtitle: { fontSize: 14, textAlign: 'center' },
  uidText: { fontSize: 13, fontFamily: 'monospace', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8, overflow: 'hidden' },
  submitBtn: { paddingVertical: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  submitRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitText: { color: 'white', fontSize: 15, fontWeight: '600' },
  switchBtn: { alignItems: 'center', marginTop: 18 },
  switchText: { fontSize: 14, fontWeight: '600' },
});
