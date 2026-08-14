import { API_BASE } from '@/utils/config';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, FileText, CheckCircle, XCircle, RefreshCw, Clock,
  ChevronDown, Download, ExternalLink, Cpu, Code2, Users, GraduationCap,
  MessageSquare, Filter, FolderKanban
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useSessionManager } from '@/hooks/useSessionManager.js';
import GlassHeader from '@/components/common/GlassHeader.jsx';
import UserProfileDropdown from '@/components/common/UserProfileDropdown.jsx';
import ThemeToggle from '@/components/common/ThemeToggle.jsx';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const REVIEW_FILTERS = [
  { key: 'All', label: 'All', icon: FolderKanban },
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'approved', label: 'Approved', icon: CheckCircle },
  { key: 'revision', label: 'Revision', icon: RefreshCw },
  { key: 'rejected', label: 'Rejected', icon: XCircle },
];

const statusBadge = (status, isDarkMode) => {
  const map = {
    pending: isDarkMode ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-300',
    approved: isDarkMode ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-300',
    rejected: isDarkMode ? 'bg-red-500/15 text-red-300 border-red-500/30' : 'bg-red-50 text-red-600 border-red-300',
    revision: isDarkMode ? 'bg-sky-500/15 text-sky-300 border-sky-500/30' : 'bg-sky-50 text-sky-700 border-sky-300',
  };
  return map[status] || map.pending;
};

const typeBadge = (type, isDarkMode) =>
  type === 'Software'
    ? isDarkMode ? 'bg-purple-500/15 text-purple-300 border-purple-500/30' : 'bg-purple-50 text-purple-700 border-purple-300'
    : isDarkMode ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-300';

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const attachmentLabel = (field) => (field || 'File').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

const ReviewButtons = ({ submission, onReview, busy }) => {
  const { isDarkMode } = useTheme();
  const [comment, setComment] = useState('');
  const base = `inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition disabled:opacity-50`;
  return (
    <div className="mt-4 pt-4 border-t border-gray-500/20 space-y-3">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows="2"
        placeholder="Review comment (optional)"
        className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-emerald-500/20 ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
      />
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onReview(submission._id, 'approved', comment)}
          disabled={busy}
          className={`${base} ${isDarkMode ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
        >
          <CheckCircle className="w-3.5 h-3.5" /> Approve
        </button>
        <button
          onClick={() => onReview(submission._id, 'revision', comment)}
          disabled={busy}
          className={`${base} ${isDarkMode ? 'bg-sky-600 hover:bg-sky-700 text-white' : 'bg-sky-600 hover:bg-sky-700 text-white'}`}
        >
          <RefreshCw className="w-3.5 h-3.5" /> Request Revision
        </button>
        <button
          onClick={() => onReview(submission._id, 'rejected', comment)}
          disabled={busy}
          className={`${base} ${isDarkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
        >
          <XCircle className="w-3.5 h-3.5" /> Reject
        </button>
      </div>
    </div>
  );
};

const ProjectCard = ({ submission, refresh }) => {
  const { isDarkMode } = useTheme();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleReview = async (id, reviewStatus, comment) => {
    setBusy(true);
    try {
      const resp = await fetch(`${API_BASE}/api/projects/${id}/review`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewStatus, reviewComment: comment })
      });
      if (resp.ok) refresh();
      else {
        const d = await resp.json().catch(() => ({}));
        alert(d.error || 'Review failed');
      }
    } catch (e) {
      alert('Review failed');
    } finally {
      setBusy(false);
    }
  };

  const links = [
    { label: 'Demo Video', value: submission.demoVideo },
    { label: 'Source Code', value: submission.sourceCodeLink },
    { label: 'Live Deployment', value: submission.liveDeploymentUrl },
    { label: 'API Documentation', value: submission.apiDocumentation },
    { label: 'Models / Datasets', value: submission.modelLinks },
  ].filter((l) => l.value && String(l.value).trim());

  const typeIcon = submission.projectType === 'Software' ? Code2 : Cpu;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl border transition-all ${
        isDarkMode ? 'bg-gray-800/40 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg'
      }`}
    >
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${submission.projectType === 'Software' ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`} />
      <button onClick={() => setOpen(!open)} className="w-full text-left p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`shrink-0 p-2.5 rounded-xl ${submission.projectType === 'Software' ? (isDarkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-600') : (isDarkMode ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-600')}`}>
              <typeIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold truncate">{submission.projectTitle}</h3>
              <p className={`text-xs mt-0.5 truncate ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                {submission.studentName}{submission.rollNo ? ` • ${submission.rollNo}` : ''}{submission.department ? ` • ${submission.department}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${typeBadge(submission.projectType, isDarkMode)}`}>
              <typeIcon className="w-3 h-3" /> {submission.projectType}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${statusBadge(submission.reviewStatus, isDarkMode)}`}>
              {submission.reviewStatus}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''} ${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`} />
          </div>
        </div>
        <div className={`mt-3 flex items-center gap-4 text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
          <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {timeAgo(submission.createdAt)}</span>
          <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {submission.status || 'Idea'}</span>
          {submission.reviewerName && (
            <span className="inline-flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> {submission.reviewerName}</span>
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className={`px-5 pb-5 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} pt-4 space-y-5`}>
              {submission.synopsis && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide opacity-60 mb-1.5">Abstract / Synopsis</p>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>{submission.synopsis}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide opacity-60 mb-2">Project Details</p>
                  <div className={`rounded-xl border p-3 text-sm space-y-1.5 ${isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-slate-200 bg-slate-50'}`}>
                    <p><span className="opacity-60">Domain:</span> <b>{submission.domain || '—'}</b></p>
                    <p><span className="opacity-60">Guide:</span> <b>{submission.guideName || '—'}</b>{submission.guideDepartment ? ` (${submission.guideDepartment})` : ''}</p>
                    <p><span className="opacity-60">Status:</span> <b>{submission.status || 'Idea'}</b></p>
                    {submission.expectedCompletion && <p><span className="opacity-60">Expected:</span> <b>{submission.expectedCompletion}</b></p>}
                  </div>
                  {submission.teamDetails && (
                    <div className={`rounded-xl border p-3 text-sm mt-2 ${isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-slate-200 bg-slate-50'}`}>
                      <p className="text-xs font-bold uppercase tracking-wide opacity-60 mb-1.5">Team</p>
                      <pre className="whitespace-pre-wrap font-sans text-sm">{submission.teamDetails}</pre>
                    </div>
                  )}
                </div>

                {links.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide opacity-60 mb-2">Links</p>
                    <div className="space-y-2">
                      {links.map((l) => (
                        <a
                          key={l.label}
                          href={l.value}
                          target="_blank"
                          rel="noreferrer"
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${isDarkMode ? 'border-gray-700 hover:border-purple-500/60 text-gray-300' : 'border-slate-200 hover:border-purple-400 text-slate-700'}`}
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          <span className="flex-1 truncate">{l.label}</span>
                          <span className="text-xs opacity-50 truncate max-w-[120px]">{l.value}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {(submission.attachments || []).length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide opacity-60 mb-2">Attachments ({submission.attachments.length})</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {submission.attachments.map((file, i) => (
                      <a
                        key={i}
                        href={`${API_BASE}/api/projects/${submission._id}/attachments/${i}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${isDarkMode ? 'border-gray-700 hover:border-emerald-500/60 text-gray-300' : 'border-slate-200 hover:border-emerald-400 text-slate-700'}`}
                      >
                        <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="flex-1 truncate">{attachmentLabel(file.field)}{file.originalName ? ` — ${file.originalName}` : ''}</span>
                        <Download className="w-3.5 h-3.5 opacity-50" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {submission.reviewComment && (
                <div className={`rounded-xl border px-4 py-3 text-sm ${statusBadge(submission.reviewStatus, isDarkMode)}`}>
                  <p className="text-xs font-bold uppercase tracking-wide opacity-70 mb-1 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> Review Comment
                  </p>
                  {submission.reviewComment}
                </div>
              )}

              <ReviewButtons submission={submission} onReview={handleReview} busy={busy} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ProjectSubmissions = () => {
  const { isDarkMode } = useTheme();
  const { user, profile, loading, isSessionValid, clearSession, updateActivity } = useSessionManager();
  const [submissions, setSubmissions] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleActivity = () => updateActivity();
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => document.addEventListener(event, handleActivity));
    return () => events.forEach((event) => document.removeEventListener(event, handleActivity));
  }, [updateActivity]);

  const fetchSubmissions = async () => {
    setLoadingList(true);
    try {
      const resp = await fetch(`${API_BASE}/api/projects`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data)) setSubmissions(data);
      }
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (isSessionValid) fetchSubmissions();
  }, [isSessionValid]);

  const filtered = useMemo(() => {
    let list = submissions;
    if (filter !== 'All') list = list.filter((s) => s.reviewStatus === filter);
    if (search.trim()) {
      const rx = new RegExp(search.trim(), 'i');
      list = list.filter((s) =>
        (s.projectTitle || '').match(rx) ||
        (s.studentName || '').match(rx) ||
        (s.rollNo || '').match(rx) ||
        (s.domain || '').match(rx)
      );
    }
    return list;
  }, [submissions, filter, search]);

  const counts = useMemo(() => {
    const c = { All: submissions.length };
    ['pending', 'approved', 'rejected', 'revision'].forEach((k) => { c[k] = submissions.filter((s) => s.reviewStatus === k).length; });
    return c;
  }, [submissions]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-slate-50'}`}>
        <LoadingSpinner message="Loading project submissions..." />
      </div>
    );
  }

  if (!isSessionValid) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-slate-50'}`}>
        <div className={`rounded-2xl border p-8 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-slate-900'} shadow-xl`}>
          <p className="text-lg font-semibold">Your session has expired.</p>
          <p className="opacity-70 mt-2">Please log in again to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full blur-3xl ${isDarkMode ? 'bg-purple-600/10' : 'bg-purple-300/30'}`} />
        <div className={`absolute top-1/3 -right-40 w-[460px] h-[460px] rounded-full blur-3xl ${isDarkMode ? 'bg-indigo-600/10' : 'bg-indigo-300/30'}`} />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#a855f7 1px, transparent 1px), linear-gradient(90deg, #a855f7 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      </div>

      <GlassHeader variant="dashboard">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className={`p-2 rounded-lg transition ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-100 text-slate-700 border border-gray-200'}`}
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <UserProfileDropdown user={user} onOptionClick={() => {}} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-600 text-white">
                  <FolderKanban className="w-3.5 h-3.5 mr-1" />
                  {profile?.role === 'faculty' ? 'Faculty' : 'Admin'}
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
              onClick={async () => { await clearSession(); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
            >
              Sign Out
            </button>
          </div>
        </div>
      </GlassHeader>

      <div className="max-w-7xl mx-auto px-4 py-8 pt-28 relative z-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className={`relative overflow-hidden rounded-3xl border p-6 md:p-8 mb-6 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/70 border-white shadow-lg shadow-purple-500/5'}`}>
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 opacity-20 blur-3xl pointer-events-none" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/40">
                  <FolderKanban className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    Project <span className="bg-gradient-to-r from-purple-500 to-fuchsia-500 bg-clip-text text-transparent">Submissions</span>
                  </h1>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                    Review and evaluate final year project submissions from students.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`} />
                <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>{submissions.length} submissions</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, student, roll no or domain..."
                className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-purple-500/20 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500' : 'bg-white border-slate-200 text-slate-900 focus:border-purple-500'}`}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {REVIEW_FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap transition ${filter === f.key ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30' : isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700' : 'bg-white text-slate-600 hover:bg-gray-100 border border-slate-200'}`}
                >
                  <f.icon className="w-4 h-4" />
                  {f.label}
                  <span className={`text-xs rounded-full px-1.5 py-0.5 ${filter === f.key ? 'bg-white/20' : isDarkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>{counts[f.key] || 0}</span>
                </button>
              ))}
            </div>
          </div>

          {loadingList ? (
            <div className="flex justify-center py-16"><LoadingSpinner message="Loading submissions..." /></div>
          ) : filtered.length === 0 ? (
            <div className={`text-center py-20 rounded-3xl border ${isDarkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-gray-200'}`}>
              <FolderKanban className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-slate-300'}`} />
              <p className="text-lg font-bold">No submissions found</p>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                {submissions.length === 0 ? 'Students have not submitted any final year projects yet.' : 'Try adjusting your filters or search.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((s) => (
                <ProjectCard key={s._id} submission={s} refresh={fetchSubmissions} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectSubmissions;
