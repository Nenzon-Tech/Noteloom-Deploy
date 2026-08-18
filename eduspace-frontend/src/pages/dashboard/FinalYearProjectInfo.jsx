import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  FolderKanban,
  GraduationCap,
  Save,
  User,
  Calendar,
  FileText,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Users,
  Upload,
  X,
  Link2,
  Code2,
  Cpu,
  CircuitBoard,
  Image,
  Shield,
  Video,
  Package,
  FlaskConical,
  Globe,
  Database,
  FileCode,
  Network,
  GitBranch,
  Layers,
  Layout,
  Presentation,
  Terminal,
  PenLine,
  ListChecks,
  RefreshCw,
  Lightbulb,
  Building2,
  FileArchive,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useSessionManager } from '@/hooks/useSessionManager.js';
import GlassHeader from '@/components/common/GlassHeader.jsx';
import ThemeToggle from '@/components/common/ThemeToggle.jsx';
import UserProfileDropdown from '@/components/common/UserProfileDropdown.jsx';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// ==========================================
// CONSTANTS & CONFIG
// ==========================================

const defaultForm = {
  projectType: '',
  projectTitle: '',
  domain: '',
  guideName: '',
  guideDepartment: '',
  teamDetails: '',
  synopsis: '',
  status: 'Idea',
  expectedCompletion: '',
  demoVideo: '',
  sourceCodeLink: '',
  liveDeploymentUrl: '',
  apiDocumentation: '',
  setupInstructions: '',
  modelLinks: '',
  bom: '',
  firmwareCode: '',
  reportFile: null,
  plagiarismFile: null,
  presentationFile: null,
  architectureFiles: [],
  circuitFiles: [],
  simulationFiles: [],
  pcbFiles: [],
  prototypePhotos: [],
};

const statusOptions = ['Idea', 'In Progress', 'Review', 'Submitted', 'Completed'];

const domainOptions = [
  'Full-Stack Development',
  'Web Application',
  'Mobile Application',
  'Deep Learning',
  'Machine Learning',
  'Artificial Intelligence',
  'Embedded Systems',
  'Internet of Things (IoT)',
  'Power Systems',
  'Robotics',
  'Data Science & Analytics',
  'Cloud Computing',
  'Cybersecurity',
  'Software Engineering',
  'Computer Networks',
  'Other',
];

const tabs = [
  { id: 'core', label: 'Core Details', icon: BookOpen },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'software', label: 'Software', icon: Code2 },
  { id: 'hardware', label: 'Hardware', icon: Cpu },
];

const requiredChecks = [
  { key: 'projectTitle', label: 'Project Title' },
  { key: 'domain', label: 'Domain / Category' },
  { key: 'teamDetails', label: 'Team Details' },
  { key: 'guideName', label: 'Faculty Guide' },
  { key: 'synopsis', label: 'Abstract / Synopsis (150-300 words)' },
  { key: 'reportFile', label: 'Final Project Report (PDF)' },
  { key: 'plagiarismFile', label: 'Plagiarism Report' },
  { key: 'presentationFile', label: 'Presentation Deck' },
  { key: 'demoVideo', label: 'Demonstration Video' },
];

const optionalChecks = [
  { key: 'sourceCodeLink', label: 'Source Code Link' },
  { key: 'liveDeploymentUrl', label: 'Live Deployment URL' },
  { key: 'architectureFiles', label: 'System Architecture Diagrams' },
  { key: 'apiDocumentation', label: 'API Documentation' },
  { key: 'setupInstructions', label: 'Setup Instructions' },
  { key: 'modelLinks', label: 'Model Checkpoints / Datasets' },
  { key: 'circuitFiles', label: 'Circuit & Wiring Diagrams' },
  { key: 'bom', label: 'Bill of Materials (BOM)' },
  { key: 'firmwareCode', label: 'Firmware / MCU Code' },
  { key: 'simulationFiles', label: 'Simulation Files' },
  { key: 'pcbFiles', label: 'PCB Design Files' },
  { key: 'prototypePhotos', label: 'Prototype Photographs' },
];

const FILE_KEYS = [
  'reportFile',
  'plagiarismFile',
  'presentationFile',
  'architectureFiles',
  'circuitFiles',
  'simulationFiles',
  'pcbFiles',
  'prototypePhotos',
];

const isFilled = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  if (value === null || value === undefined) return false;
  return String(value).trim() !== '';
};

const formatSize = (bytes) => {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const SOFTWARE_FIELDS = [
  'sourceCodeLink',
  'liveDeploymentUrl',
  'apiDocumentation',
  'setupInstructions',
  'modelLinks',
  'architectureFiles',
];

const HARDWARE_FIELDS = [
  'circuitFiles',
  'bom',
  'firmwareCode',
  'simulationFiles',
  'pcbFiles',
  'prototypePhotos',
];

const getScopedFields = (projectType) =>
  Object.keys(defaultForm).filter((key) => {
    if (projectType === 'Software' && HARDWARE_FIELDS.includes(key)) return false;
    if (projectType === 'Hardware' && SOFTWARE_FIELDS.includes(key)) return false;
    return true;
  });

// ==========================================
// MAIN COMPONENT
// ==========================================

const FinalYearProjectInfo = () => {
  const { isDarkMode } = useTheme();
  const { user, profile, loading, isSessionValid, clearSession, updateActivity } = useSessionManager();
  const [form, setForm] = useState(defaultForm);
  const [activeTab, setActiveTab] = useState('core');
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const storageKey = useMemo(() => {
    return `fypInfo:${user?.uid || user?.email || 'guest'}`;
  }, [user]);

  useEffect(() => {
    const handleActivity = () => updateActivity();
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => document.addEventListener(event, handleActivity));
    return () => events.forEach((event) => document.removeEventListener(event, handleActivity));
  }, [updateActivity]);

  useEffect(() => {
    if (!user) return;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setForm((prev) => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse saved project info:', error);
      }
    }
  }, [storageKey, user]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaveMessage('');
    setSaveError('');
  };

  const setSingleFile = (field, file) => {
    setForm((prev) => ({ ...prev, [field]: file || null }));
    setSaveMessage('');
    setSaveError('');
  };

  const addFiles = (field, files) => {
    setForm((prev) => {
      const current = Array.isArray(prev[field]) ? prev[field] : [];
      return { ...prev, [field]: [...current, ...files] };
    });
    setSaveMessage('');
    setSaveError('');
  };

  const removeFile = (field, index) => {
    setForm((prev) => {
      const current = Array.isArray(prev[field]) ? prev[field] : [];
      return { ...prev, [field]: current.filter((_, i) => i !== index) };
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    setSaveMessage('');
    setSaveError('');

    try {
      const persistable = {};
      Object.keys(defaultForm).forEach((key) => {
        if (!FILE_KEYS.includes(key)) persistable[key] = form[key];
      });
      localStorage.setItem(storageKey, JSON.stringify(persistable));
      setSaveMessage('Draft saved locally. Files will be attached on final submission.');
    } catch (error) {
      console.error('Failed to save project info:', error);
      setSaveError('Unable to save right now. Please try again.');
    } finally {
      setTimeout(() => setIsSaving(false), 300);
    }
  };

  const handleReset = () => {
    setForm(defaultForm);
    localStorage.removeItem(storageKey);
    setSaveMessage('');
    setSaveError('');
  };

  const scopedFields = useMemo(() => getScopedFields(form.projectType), [form.projectType]);

  const visibleTabs = useMemo(() => {
    const list = tabs.filter((tab) => tab.id === 'core' || tab.id === 'documents');
    if (form.projectType === 'Software') list.push(tabs.find((tab) => tab.id === 'software'));
    if (form.projectType === 'Hardware') list.push(tabs.find((tab) => tab.id === 'hardware'));
    return list.filter(Boolean);
  }, [form.projectType]);

  useEffect(() => {
    if (!visibleTabs.some((tab) => tab.id === activeTab)) {
      setActiveTab('core');
    }
  }, [visibleTabs, activeTab]);

  const { pct, requiredDone, requiredTotal } = useMemo(() => {
    const requiredDone = requiredChecks.filter((c) => isFilled(form[c.key])).length;
    const requiredTotal = requiredChecks.length;
    const allFilled = scopedFields.filter((k) => isFilled(form[k])).length;
    const allTotal = scopedFields.length;
    const pct = allTotal ? Math.round((allFilled / allTotal) * 100) : 0;
    return { pct, requiredDone, requiredTotal };
  }, [form, scopedFields]);

  const wordCount = form.synopsis.trim() ? form.synopsis.trim().split(/\s+/).length : 0;
  const synopsisState = wordCount === 0 ? 'empty' : wordCount < 150 ? 'short' : wordCount <= 300 ? 'good' : 'long';

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-slate-50'}`}>
        <LoadingSpinner message="Loading project workspace..." />
      </div>
    );
  }

  if (!isSessionValid) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-slate-50'}`}>
        <div className={`rounded-2xl border p-8 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-slate-900'} shadow-xl`}>
          <p className="text-lg font-semibold">Your session has expired.</p>
          <p className="opacity-70 mt-2">Please log in again to continue.</p>
        </div>
      </div>
    );
  }

  const inputClass = `w-full rounded-xl border px-3 py-3 outline-none transition focus:ring-2 focus:ring-purple-500/20 ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-purple-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-500'}`;

  return (
    <div className={`min-h-screen relative transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* ===== Decorative background ===== */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full blur-3xl transition-colors duration-300 ${isDarkMode ? 'bg-purple-600/10' : 'bg-purple-300/30'}`} />
        <div className={`absolute top-1/3 -right-40 w-[460px] h-[460px] rounded-full blur-3xl transition-colors duration-300 ${isDarkMode ? 'bg-indigo-600/10' : 'bg-indigo-300/30'}`} />
        <div className={`absolute -bottom-40 left-1/4 w-[420px] h-[420px] rounded-full blur-3xl transition-colors duration-300 ${isDarkMode ? 'bg-fuchsia-600/10' : 'bg-fuchsia-300/30'}`} />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#a855f7 1px, transparent 1px), linear-gradient(90deg, #a855f7 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      </div>

      <GlassHeader variant="dashboard">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <UserProfileDropdown user={user} onOptionClick={() => {}} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-600 text-white">
                  <GraduationCap className="w-3.5 h-3.5 mr-1" />
                  Student
                </span>
                <span className="text-xs text-green-500">Active</span>
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                {profile?.college || 'Your College'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={async () => {
                await clearSession();
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
            >
              Sign Out
            </button>
          </div>
        </div>
      </GlassHeader>

      <div className="max-w-7xl mx-auto px-4 py-8 pt-28 relative z-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {/* ===== Hero Banner ===== */}
          <div className={`relative overflow-hidden rounded-3xl border p-6 md:p-8 mb-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/70 border-white shadow-lg shadow-purple-500/5'}`}>
            <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 opacity-20 blur-3xl pointer-events-none`} />
            <div className={`absolute -bottom-24 -left-16 w-56 h-56 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 opacity-20 blur-3xl pointer-events-none`} />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-fuchsia-500/5 pointer-events-none" />

            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/40">
                    <FolderKanban className="w-7 h-7" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-white animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                      Final Year Project{' '}
                      <span className="bg-gradient-to-r from-purple-500 to-fuchsia-500 bg-clip-text text-transparent">Hub</span>
                    </h1>
                    {form.projectType && (
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                        form.projectType === 'Software'
                          ? isDarkMode ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30'
                          : isDarkMode ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'bg-amber-500/10 text-amber-700 border border-amber-500/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${form.projectType === 'Software' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {form.projectType}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                    Submit every required deliverable for your final year project submission.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleReset}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 py-2.5 font-semibold shadow-lg shadow-purple-600/30 disabled:opacity-60 transition-all"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Draft'}
                </button>
              </div>
            </div>
          </div>

          {/* ===== Compact progress (mobile) ===== */}
          <div className="lg:hidden mb-4">
            <div className={`rounded-2xl border p-4 ${isDarkMode ? 'bg-gray-800/70 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-semibold">Submission Progress</span>
                <span className="font-bold text-purple-500">{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-500/20 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs opacity-60 mt-2">{requiredDone} of {requiredTotal} required items completed</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
            {/* ===== Form Column ===== */}
            <div className={`rounded-[26px] p-[1.5px] shadow-xl bg-gradient-to-br ${isDarkMode ? 'from-purple-500/50 via-white/10 to-fuchsia-500/50' : 'from-purple-300 via-white to-fuchsia-300'}`}>
              <div className={`rounded-[24px] p-6 backdrop-blur-xl ${isDarkMode ? 'bg-gray-900/85' : 'bg-white/95'}`}>
              {/* Tab Bar */}
              <div className="flex gap-2 overflow-x-auto pb-1 mb-6">
                {visibleTabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                        isActive ? 'text-white' : isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="fyp-tab-pill"
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-600/40"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                        />
                      )}
                      <tab.icon className="relative z-10 w-4 h-4" />
                      <span className="relative z-10">{tab.label}</span>
                      {tab.id === 'core' && requiredDone > 0 && (
                        <span className={`relative z-10 w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-green-500'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
              {!form.projectType && (
                <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${isDarkMode ? 'border-amber-700/40 bg-amber-900/20 text-amber-300' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                  <AlertCircle className="inline w-4 h-4 mr-1.5 -mt-0.5" />
                  Select your project type (Software or Hardware) in Core Details to access the relevant deliverables tab.
                </div>
              )}

              {/* ===== TAB CONTENT ===== */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
              {/* ===== CORE DETAILS ===== */}
              {activeTab === 'core' && (
                <div className="space-y-6">
                  <div className={`relative overflow-hidden rounded-2xl border p-5 ${isDarkMode ? 'border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-transparent to-fuchsia-500/10' : 'border-purple-200 bg-gradient-to-br from-purple-50 via-white to-fuchsia-50'}`}>
                    <div className={`absolute -top-12 -right-12 w-36 h-36 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 opacity-10 blur-2xl pointer-events-none`} />
                    <div className="flex items-center gap-2 mb-3 relative">
                      <span className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-600'}`}>
                        <Sparkles className="w-4 h-4" />
                      </span>
                      <h2 className="text-lg font-bold">Project Type</h2>
                    </div>
                    <p className={`text-xs mb-4 relative ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                      Choose the type of your final year project. You can submit deliverables for only one type.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <TypeOption
                        active={form.projectType === 'Software'}
                        icon={Code2}
                        title="Software Project"
                        subtitle="Web, mobile, AI/ML, desktop"
                        onClick={() => handleChange('projectType', 'Software')}
                        dark={isDarkMode}
                      />
                      <TypeOption
                        active={form.projectType === 'Hardware'}
                        icon={Cpu}
                        title="Hardware Project"
                        subtitle="IoT, embedded, electrical"
                        onClick={() => handleChange('projectType', 'Hardware')}
                        dark={isDarkMode}
                      />
                    </div>
                  </div>

                  <SectionCard tone="purple" icon={BookOpen} title="Core Submission Fields" subtitle="Required for all projects">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField label="Project Title" icon={BookOpen}>
                        <input
                          value={form.projectTitle}
                          onChange={(e) => handleChange('projectTitle', e.target.value)}
                          className={inputClass}
                          placeholder="The official, finalized name of the project"
                        />
                      </FormField>

                      <FormField label="Domain / Category" icon={Sparkles}>
                        <select
                          value={form.domain}
                          onChange={(e) => handleChange('domain', e.target.value)}
                          className={inputClass}
                        >
                          <option value="">Select domain...</option>
                          {domainOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </FormField>

                      <FormField label="Faculty Guide" icon={User}>
                        <input
                          value={form.guideName}
                          onChange={(e) => handleChange('guideName', e.target.value)}
                          className={inputClass}
                          placeholder="Name of project supervisor"
                        />
                      </FormField>

                      <FormField label="Guide Department" icon={Building2}>
                        <input
                          value={form.guideDepartment}
                          onChange={(e) => handleChange('guideDepartment', e.target.value)}
                          className={inputClass}
                          placeholder="e.g. Computer Science & Engineering"
                        />
                      </FormField>

                      <FormField label="Team Details" icon={Users} className="md:col-span-2">
                        <textarea
                          rows="4"
                          value={form.teamDetails}
                          onChange={(e) => handleChange('teamDetails', e.target.value)}
                          className={`${inputClass} resize-none`}
                          placeholder={'Name | Roll / Reg No | Email\nJohn Doe | 20CS101 | john@example.com\nJane Smith | 20CS102 | jane@example.com'}
                        />
                        <p className="text-xs opacity-60">One member per line. Include name, roll/registration number and email.</p>
                      </FormField>

                      <FormField label="Current Status" icon={CheckCircle}>
                        <select
                          value={form.status}
                          onChange={(e) => handleChange('status', e.target.value)}
                          className={inputClass}
                        >
                          {statusOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </FormField>

                      <FormField label="Expected Completion" icon={Calendar}>
                        <input
                          type="date"
                          value={form.expectedCompletion}
                          onChange={(e) => handleChange('expectedCompletion', e.target.value)}
                          className={inputClass}
                        />
                      </FormField>

                      <FormField label="Abstract / Synopsis" icon={PenLine} className="md:col-span-2">
                        <textarea
                          rows="7"
                          value={form.synopsis}
                          onChange={(e) => handleChange('synopsis', e.target.value)}
                          className={`${inputClass} resize-none`}
                          placeholder="Detail the core problem, the chosen methodology, and the final outcome (150-300 words)."
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-xs opacity-60">Recommended length: 150-300 words.</p>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                              synopsisState === 'good'
                                ? isDarkMode ? 'bg-green-900/40 text-green-300' : 'bg-green-50 text-green-700'
                                : synopsisState === 'short' && wordCount > 0
                                  ? isDarkMode ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-50 text-amber-700'
                                  : synopsisState === 'long'
                                    ? isDarkMode ? 'bg-red-900/40 text-red-300' : 'bg-red-50 text-red-600'
                                    : isDarkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {wordCount} words
                            {synopsisState === 'short' && wordCount > 0 && <AlertCircle className="w-3.5 h-3.5" />}
                            {synopsisState === 'long' && <AlertCircle className="w-3.5 h-3.5" />}
                          </span>
                        </div>
                      </FormField>
                    </div>
                  </SectionCard>
                </div>
              )}

              {/* ===== DOCUMENTS ===== */}
              {activeTab === 'documents' && (
                <div className="space-y-6">
                  <SectionCard tone="blue" icon={FileText} title="Required Documents" subtitle="Academic documents for evaluation">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <UploadField
                        label="Final Project Report"
                        icon={FileText}
                        accept=".pdf"
                        files={form.reportFile ? [form.reportFile] : []}
                        onSelect={(file) => setSingleFile('reportFile', file)}
                        onRemove={() => setSingleFile('reportFile', null)}
                        hint="PDF only - typically LaTeX formatted"
                        dark={isDarkMode}
                      />

                      <UploadField
                        label="Plagiarism Report"
                        icon={Shield}
                        accept=".pdf"
                        files={form.plagiarismFile ? [form.plagiarismFile] : []}
                        onSelect={(file) => setSingleFile('plagiarismFile', file)}
                        onRemove={() => setSingleFile('plagiarismFile', null)}
                        hint="Similarity check certificate (Turnitin etc.)"
                        dark={isDarkMode}
                      />

                      <UploadField
                        label="Presentation Deck"
                        icon={Presentation}
                        accept=".pdf,.pptx"
                        files={form.presentationFile ? [form.presentationFile] : []}
                        onSelect={(file) => setSingleFile('presentationFile', file)}
                        onRemove={() => setSingleFile('presentationFile', null)}
                        hint="PDF or PPTX for the final defense"
                        dark={isDarkMode}
                      />

                      <FormField label="Demonstration Video" icon={Video}>
                        <div className="relative">
                          <Link2 className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`} />
                          <input
                            value={form.demoVideo}
                            onChange={(e) => handleChange('demoVideo', e.target.value)}
                            className={`${inputClass} pl-10`}
                            placeholder="https://youtube.com/... (unlisted)"
                          />
                        </div>
                        <p className="text-xs opacity-60">Paste an unlisted YouTube or cloud link showing a working walkthrough.</p>
                      </FormField>
                    </div>
                  </SectionCard>
                </div>
              )}

              {/* ===== SOFTWARE ===== */}
              {activeTab === 'software' && (
                <div className="space-y-6">
                  <SectionCard tone="emerald" icon={Code2} title="Software Deliverables" subtitle="Web, mobile & AI/ML projects">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <LinkField
                        label="Source Code Link"
                        icon={GitBranch}
                        value={form.sourceCodeLink}
                        onChange={(v) => handleChange('sourceCodeLink', v)}
                        placeholder="https://github.com/..."
                        hint="Version control repository (frontend / backend / model)"
                        dark={isDarkMode}
                      />

                      <LinkField
                        label="Live Deployment URL"
                        icon={Globe}
                        value={form.liveDeploymentUrl}
                        onChange={(v) => handleChange('liveDeploymentUrl', v)}
                        placeholder="https://your-app.com"
                        hint="Hosted application or API endpoints"
                        dark={isDarkMode}
                      />

                      <LinkField
                        label="API Documentation"
                        icon={FileCode}
                        value={form.apiDocumentation}
                        onChange={(v) => handleChange('apiDocumentation', v)}
                        placeholder="https://.../api-docs"
                        hint="REST routes, request/response structures, auth"
                        dark={isDarkMode}
                      />

                      <LinkField
                        label="Model Checkpoints / Datasets"
                        icon={Database}
                        value={form.modelLinks}
                        onChange={(v) => handleChange('modelLinks', v)}
                        placeholder="Drive / Kaggle / HuggingFace link"
                        hint="AI/ML only - training data or .h5/.pt weights"
                        dark={isDarkMode}
                      />

                      <FormField label="Setup Instructions" icon={Terminal} className="md:col-span-2">
                        <textarea
                          rows="4"
                          value={form.setupInstructions}
                          onChange={(e) => handleChange('setupInstructions', e.target.value)}
                          className={`${inputClass} resize-none`}
                          placeholder="Environment variables, package dependencies, and local server startup commands (or link a README.md)..."
                        />
                      </FormField>

                      <UploadField
                        label="System Architecture Diagrams"
                        icon={Network}
                        accept=".png,.jpg,.jpeg,.svg,.pdf"
                        multiple
                        files={form.architectureFiles}
                        onAdd={(files) => addFiles('architectureFiles', files)}
                        onRemove={(index) => removeFile('architectureFiles', index)}
                        hint="UML, ER, or cloud architecture maps"
                        dark={isDarkMode}
                      />
                    </div>
                  </SectionCard>
                </div>
              )}

              {/* ===== HARDWARE ===== */}
              {activeTab === 'hardware' && (
                <div className="space-y-6">
                  <SectionCard tone="amber" icon={Cpu} title="Hardware Deliverables" subtitle="Electrical, IoT & embedded projects">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <UploadField
                        label="Circuit & Wiring Diagrams"
                        icon={CircuitBoard}
                        accept=".png,.jpg,.jpeg,.svg,.pdf"
                        multiple
                        files={form.circuitFiles}
                        onAdd={(files) => addFiles('circuitFiles', files)}
                        onRemove={(index) => removeFile('circuitFiles', index)}
                        hint="Schematics: MCU, sensors, motor drivers"
                        dark={isDarkMode}
                      />

                      <FormField label="Bill of Materials (BOM)" icon={Package} className="md:col-span-2">
                        <textarea
                          rows="5"
                          value={form.bom}
                          onChange={(e) => handleChange('bom', e.target.value)}
                          className={`${inputClass} resize-none`}
                          placeholder={'Component | Qty | Notes\nESP32 Dev Board | 1 | Main controller\nA4988 Stepper Driver | 2 | ...'}
                        />
                        <p className="text-xs opacity-60">One component per line - include specific module names.</p>
                      </FormField>

                      <FormField label="Firmware / Microcontroller Code" icon={FlaskConical} className="md:col-span-2">
                        <textarea
                          rows="6"
                          value={form.firmwareCode}
                          onChange={(e) => handleChange('firmwareCode', e.target.value)}
                          className={`${inputClass} resize-none font-mono text-sm`}
                          placeholder="C / C++ / Assembly code flashed onto the hardware..."
                        />
                      </FormField>

                      <UploadField
                        label="Simulation Files"
                        icon={Layers}
                        accept="*"
                        multiple
                        files={form.simulationFiles}
                        onAdd={(files) => addFiles('simulationFiles', files)}
                        onRemove={(index) => removeFile('simulationFiles', index)}
                        hint="MATLAB, Proteus, Tinkercad models"
                        dark={isDarkMode}
                      />

                      <UploadField
                        label="PCB Design Files"
                        icon={FileArchive}
                        accept=".zip,.gbr,.pdf,.png,.jpg"
                        multiple
                        files={form.pcbFiles}
                        onAdd={(files) => addFiles('pcbFiles', files)}
                        onRemove={(index) => removeFile('pcbFiles', index)}
                        hint="Gerber files or layout schematics"
                        dark={isDarkMode}
                      />

                      <FormField label="Prototype Photographs" icon={Image} className="md:col-span-2">
                        <UploadField
                          label=""
                          icon={Image}
                          accept="image/*"
                          multiple
                          files={form.prototypePhotos}
                          onAdd={(files) => addFiles('prototypePhotos', files)}
                          onRemove={(index) => removeFile('prototypePhotos', index)}
                          hint="Clear, well-lit shots of the physical setup from multiple angles"
                          dark={isDarkMode}
                          compact
                        />
                        {form.prototypePhotos.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                            {form.prototypePhotos.map((file, i) => (
                              <PhotoTile key={i} file={file} onRemove={() => removeFile('prototypePhotos', i)} dark={isDarkMode} />
                            ))}
                          </div>
                        )}
                      </FormField>
                    </div>
                  </SectionCard>
                </div>
              )}
              </motion.div>

              {/* ===== Save status message ===== */}
              {(saveMessage || saveError) && (
                <div className={`mt-6 rounded-xl border px-4 py-3 text-sm ${saveError ? (isDarkMode ? 'border-red-700/40 bg-red-900/20 text-red-300' : 'border-red-200 bg-red-50 text-red-700') : (isDarkMode ? 'border-green-700/40 bg-green-900/20 text-green-300' : 'border-green-200 bg-green-50 text-green-700')}`}>
                  {saveError || saveMessage}
                </div>
              )}
              </div>
            </div>

            {/* ===== Sidebar ===== */}
            <aside className="hidden lg:block space-y-6 sticky top-24">
              <SidebarCard tone="purple" icon={Sparkles} title="Submission Progress">
                <div className="flex items-center gap-4">
                  <ProgressRing pct={pct} />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{requiredDone}/{requiredTotal}</p>
                    <p className="text-xs opacity-60">required items</p>
                    <p className="text-xs opacity-60">completed</p>
                  </div>
                </div>
                <div className="mt-4 h-2 rounded-full bg-gray-500/20 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </SidebarCard>

              <SidebarCard tone="emerald" icon={ListChecks} title="Required Checklist">
                <div className="space-y-2">
                  {requiredChecks.map((item) => (
                    <ChecklistRow key={item.key} label={item.label} done={isFilled(form[item.key])} dark={isDarkMode} />
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t border-gray-500/20">
                  <p className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-3">Optional Deliverables {form.projectType ? `- ${form.projectType}` : ''}</p>
                  <div className="space-y-2">
                    {optionalChecks.filter((item) => scopedFields.includes(item.key)).map((item) => (
                      <ChecklistRow key={item.key} label={item.label} done={isFilled(form[item.key])} dark={isDarkMode} subtle />
                    ))}
                  </div>
                </div>
              </SidebarCard>

              <SidebarCard tone="blue" icon={Lightbulb} title="How to Submit">
                <div className="space-y-3 text-sm">
                  <StepRow icon={<BookOpen className="w-4 h-4" />} text="Fill every required field in Core Details" />
                  <StepRow icon={<FileText className="w-4 h-4" />} text="Upload the report, plagiarism certificate and deck" />
                  {form.projectType === 'Software' && <StepRow icon={<Code2 className="w-4 h-4" />} text="Add your software links and architecture diagrams" />}
                  {form.projectType === 'Hardware' && <StepRow icon={<Cpu className="w-4 h-4" />} text="Add your BOM, firmware and prototype photos" />}
                  <StepRow icon={<CheckCircle className="w-4 h-4" />} text="Reach 100% and submit for faculty review" />
                </div>
              </SidebarCard>
            </aside>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// ==========================================
// SUB-COMPONENTS
// ==========================================

const TONES = {
  purple: { grad: 'from-purple-500 to-fuchsia-500', chip: 'bg-purple-500/15 text-purple-500', border: 'border-purple-500/20', shadow: 'shadow-purple-500/10' },
  blue: { grad: 'from-sky-500 to-indigo-500', chip: 'bg-blue-500/15 text-blue-500', border: 'border-blue-500/20', shadow: 'shadow-blue-500/10' },
  emerald: { grad: 'from-emerald-500 to-teal-500', chip: 'bg-emerald-500/15 text-emerald-500', border: 'border-emerald-500/20', shadow: 'shadow-emerald-500/10' },
  amber: { grad: 'from-amber-500 to-orange-500', chip: 'bg-amber-500/15 text-amber-500', border: 'border-amber-500/20', shadow: 'shadow-amber-500/10' },
};

const SectionCard = ({ tone = 'purple', icon: Icon, title, subtitle, children }) => {
  const t = TONES[tone];
  return (
    <div className={`relative overflow-hidden rounded-2xl border ${t.border} bg-gray-500/5 p-5 transition-shadow hover:shadow-lg ${t.shadow}`}>
      <div className={`absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gradient-to-br ${t.grad} opacity-10 blur-2xl pointer-events-none`} />
      <div className={`absolute top-0 left-6 right-6 h-[3px] rounded-full bg-gradient-to-r ${t.grad} pointer-events-none`} />
      <div className="relative flex items-center gap-3 mb-5">
        <div className={`p-2.5 rounded-xl ${t.chip}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold leading-tight">{title}</h2>
          {subtitle && <p className="text-xs opacity-60 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
};

const SidebarCard = ({ tone = 'purple', icon: Icon, title, children }) => {
  const t = TONES[tone];
  return (
    <div className={`relative overflow-hidden rounded-3xl border ${t.border} bg-gray-500/5 p-5 shadow-xl transition-all hover:shadow-2xl ${t.shadow}`}>
      <div className={`absolute -top-14 -right-14 w-32 h-32 rounded-full bg-gradient-to-br ${t.grad} opacity-10 blur-2xl pointer-events-none`} />
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-xl ${t.chip}`}>
            <Icon className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold">{title}</h2>
        </div>
        {children}
      </div>
    </div>
  );
};

const FormField = ({ label, icon: Icon, children, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="w-4 h-4 text-purple-500" />
          {label}
        </label>
      )}
      {children}
    </div>
  );
};

const TypeOption = ({ active, icon: Icon, title, subtitle, onClick, dark }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group relative overflow-hidden flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all ${
      active
        ? 'border-purple-500/60 bg-gradient-to-br from-purple-500/15 to-fuchsia-500/10 shadow-lg shadow-purple-500/20'
        : dark
          ? 'border-gray-700 hover:border-purple-500/60 hover:bg-gray-800/60'
          : 'border-slate-200 hover:border-purple-400 hover:bg-white hover:shadow-md hover:shadow-purple-500/10'
    }`}
  >
    {active && <span className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 opacity-20 blur-2xl pointer-events-none" />}
    <span className={`relative p-2.5 rounded-xl shrink-0 transition-all ${active ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 group-hover:scale-105' : dark ? 'bg-gray-800 text-purple-400' : 'bg-purple-50 text-purple-500'}`}>
      <Icon className="w-5 h-5" />
    </span>
    <span className="relative">
      <span className={`block text-sm font-bold ${active ? 'text-purple-500' : ''}`}>{title}</span>
      <span className={`block text-xs mt-0.5 ${dark ? 'text-gray-400' : 'text-slate-500'}`}>{subtitle}</span>
    </span>
    <span className={`ml-auto mt-1 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
      active ? 'border-purple-500 bg-gradient-to-br from-purple-500 to-fuchsia-500 shadow-sm shadow-purple-500/40' : dark ? 'border-gray-600' : 'border-slate-300'
    }`}>
      {active && <CheckCircle className="w-3 h-3 text-white" />}
    </span>
  </button>
);

const LinkField = ({ label, icon: Icon, value, onChange, placeholder, hint, dark }) => {
  return (
    <FormField label={label} icon={Icon}>
      <div className="relative">
        <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? 'text-gray-500' : 'text-slate-400'}`} />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-xl border px-3 pl-10 py-3 outline-none transition ${dark ? 'bg-gray-900 border-gray-700 text-white focus:border-purple-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-500'}`}
          placeholder={placeholder}
        />
      </div>
      {hint && <p className="text-xs opacity-60">{hint}</p>}
    </FormField>
  );
};

const UploadField = ({ label, icon: Icon, accept, multiple, files = [], onSelect, onAdd, onRemove, hint, dark, compact }) => {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    if (multiple && onAdd) onAdd(selected);
    else if (onSelect) onSelect(selected[0]);
    e.target.value = '';
  };

  return (
    <FormField label={label} icon={Icon} className={multiple ? 'md:col-span-2' : ''}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`w-full rounded-xl border-2 border-dashed px-4 py-${compact ? '3' : '5'} text-center transition group ${dark ? 'border-gray-600 hover:border-purple-500 hover:bg-purple-500/5' : 'border-slate-300 hover:border-purple-500 hover:bg-purple-50'}`}
      >
        <div className="flex flex-col items-center gap-1.5">
          <span className={`p-2 rounded-full ${dark ? 'bg-gray-800 text-purple-400' : 'bg-purple-50 text-purple-500'} group-hover:scale-110 transition-transform`}>
            <Upload className="w-5 h-5" />
          </span>
          <span className="text-sm font-semibold">Click to upload</span>
          {hint && <span className={`text-xs ${dark ? 'text-gray-400' : 'text-slate-500'}`}>{hint}</span>}
        </div>
      </button>
      <input ref={inputRef} type="file" className="hidden" accept={accept} multiple={multiple} onChange={handleChange} />
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {files.map((file, i) => (
            <FileChip key={i} file={file} onRemove={() => (multiple ? onRemove?.(i) : onRemove?.())} dark={dark} />
          ))}
        </div>
      )}
    </FormField>
  );
};

const FileChip = ({ file, onRemove, dark }) => (
  <div className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium ${dark ? 'bg-gray-900 border-gray-700 text-gray-200' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
    <FileText className="w-3.5 h-3.5 text-purple-500 shrink-0" />
    <span className="max-w-[160px] truncate">{file?.name || 'File'}</span>
    {file?.size && <span className="opacity-50">{formatSize(file.size)}</span>}
    <button type="button" onClick={onRemove} className={`ml-1 rounded p-0.5 hover:bg-red-500/10 text-red-400`}>
      <X className="w-3.5 h-3.5" />
    </button>
  </div>
);

const PhotoTile = ({ file, onRemove, dark }) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    let u = '';
    try {
      u = URL.createObjectURL(file);
      setUrl(u);
    } catch (error) {
      console.error('Failed to preview image:', error);
    }
    return () => {
      if (u) URL.revokeObjectURL(u);
    };
  }, [file]);

  return (
    <div className={`relative group rounded-xl overflow-hidden border ${dark ? 'border-gray-700' : 'border-slate-200'}`}>
      {url ? (
        <img src={url} alt={file?.name || 'prototype'} className="w-full h-28 object-cover" />
      ) : (
        <div className={`w-full h-28 flex items-center justify-center ${dark ? 'bg-gray-900' : 'bg-slate-100'}`}>
          <Image className="w-6 h-6 opacity-40" />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
        <p className="text-[10px] text-white truncate">{file?.name}</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

const ProgressRing = ({ pct }) => {
  const size = 104;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none" className="stroke-gray-500/15" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          fill="none"
          stroke="url(#fypProgressGradient)"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ filter: 'drop-shadow(0 0 6px rgba(168,85,247,0.55))', transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
        <defs>
          <linearGradient id="fypProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#d946ef" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-fuchsia-500 bg-clip-text text-transparent">{pct}%</span>
        <span className="text-[10px] opacity-60 uppercase tracking-wide">Complete</span>
      </div>
    </div>
  );
};

const ChecklistRow = ({ label, done, dark, subtle = false }) => (
  <div className="flex items-center gap-2.5 text-sm">
    <span
      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
        done
          ? 'bg-green-500 border-green-500 text-white'
          : dark ? 'border-gray-600' : 'border-slate-300'
      }`}
    >
      {done && <CheckCircle className="w-3 h-3" />}
    </span>
    <span className={`${done ? (subtle ? 'opacity-50' : 'line-through opacity-60') : ''} ${subtle ? 'opacity-70' : ''}`}>
      {label}
    </span>
  </div>
);

const StepRow = ({ icon, text }) => (
  <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-purple-500/10 to-transparent px-3 py-2">
    <span className="text-purple-500 shrink-0">{icon}</span>
    <span className="text-xs">{text}</span>
  </div>
);

export default FinalYearProjectInfo;
