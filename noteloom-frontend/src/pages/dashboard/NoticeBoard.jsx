import { API_BASE } from '@/utils/config';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, Plus, MoreHorizontal, FileText,
  Download, ThumbsUp, MessageSquare, ArrowUpDown, ChevronDown, Upload, X, Send, CheckCircle, ChevronRight
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useSessionManager } from '@/hooks/useSessionManager.js';
import { useErrorPopup } from '@/context/ErrorPopupContext.jsx';
import GlassHeader from '@/components/common/GlassHeader.jsx';
import UserProfileDropdown from '@/components/common/UserProfileDropdown.jsx';
import ThemeToggle from '@/components/common/ThemeToggle.jsx';
import CollegeBannerLogo from '@/components/common/CollegeBannerLogo.jsx';

/* =========================================================================
   HELPERS
   ========================================================================= */

const CATEGORIES = ['All', 'Announcement', 'Exam', 'Resource', 'Event'];

const categoryFor = (notice) => notice.category || 'Announcement';

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

const formatSize = (bytes) => {
  if (!bytes) return '';
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
};

const roleLabel = (role) => (role || 'Staff').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

const initials = (name) => (name || '?').split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();

const AVATAR_GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-fuchsia-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600'
];

const avatarGradient = (name) => {
  const hash = (name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
};

const badgeStyle = (category, isDarkMode) => {
  switch (category) {
    case 'Exam': return isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-700';
    case 'Resource': return isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700';
    case 'Event': return isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-700';
    default: return isDarkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-[#F3F4F6] text-[#6B7280]';
  }
};

/* =========================================================================
   NOTICE CARD
   ========================================================================= */

const NoticeCard = ({ notice, currentUser, profile, refresh }) => {
  const { isDarkMode } = useTheme();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef(null);

  const isOwner = notice.posterId === currentUser?.id;
  const canDelete = profile?.role === 'college_admin' || isOwner;
  const reacted = notice.reactions?.some(r => r.userId === currentUser?.id);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const api = async (action, data = {}) => {
    const suffix = action === 'delete' ? '' : `/${action}`;
    const res = await fetch(`${API_BASE}/api/notices/${notice._id}${suffix}`, {
      method: action === 'comments' ? 'POST' : action === 'react' ? 'PATCH' : 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`, 'Content-Type': 'application/json' },
      body: action === 'comments' ? JSON.stringify(data) : undefined
    });
    if (res.ok) refresh();
    return res;
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${notice.title}"?`)) return;
    setDeleting(true);
    try { await api('delete'); } finally { setDeleting(false); setMenuOpen(false); }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    await api('comments', { text: commentText.trim() });
    setCommentText('');
  };

  const openFile = (file, i) => {
    const url = file.fileType === 'image'
      ? file.fileUrl
      : `${API_BASE}/api/notices/${notice._id}/attachments/${i}/download`;
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const downloadFile = (file, i) => {
    const url = file.fileType === 'image'
      ? file.fileUrl
      : `${API_BASE}/api/notices/${notice._id}/attachments/${i}/download`;
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = file.originalName || file.fileName || 'download';
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const category = categoryFor(notice);
  const subtext = `${roleLabel(notice.posterRole)}${notice.department ? ` • ${notice.department}` : ''} • ${timeAgo(notice.createdAt)}`;
  const attachments = notice.attachments?.length ? notice.attachments : [];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className={`bg-surface-container-lowest rounded-2xl border shadow-sm p-5 flex flex-col gap-4 transition-shadow hover:shadow-md h-full ${
        isDarkMode ? 'bg-gray-900 border-gray-700/60' : 'bg-white border-gray-200/80'
      }`}
    >
      {/* Card Header */}
      <header className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarGradient(notice.posterName)} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
            {initials(notice.posterName)}
          </div>
          <div className="min-w-0">
            <h3 className={`text-sm font-bold truncate ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{notice.posterName || 'Unknown'}</h3>
            <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{subtext}</p>
          </div>
        </div>

        {canDelete && (
          <div className="relative shrink-0" ref={menuRef}>
            <button onClick={() => setMenuOpen(o => !o)} className={`p-1.5 rounded-full transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-gray-700/60 hover:text-gray-100' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className={`absolute right-0 mt-1 w-36 rounded-xl border shadow-lg overflow-hidden z-20 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                >
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${isDarkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}
                  >
                    {deleting ? 'Deleting...' : 'Delete notice'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </header>

      {/* Card Body */}
      <div className="flex flex-col gap-2.5">
        <div className="flex gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${badgeStyle(category, isDarkMode)}`}>{category}</span>
        </div>
        <h2 className={`text-lg font-semibold leading-snug ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{notice.title}</h2>
        <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{notice.content}</p>
      </div>

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((file, i) => (
            <div key={i}>
              {file.fileType === 'image' ? (
                <img src={file.fileUrl} alt={file.originalName || 'attachment'} className="w-full rounded-xl border border-gray-200/60" />
              ) : (
                <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate max-w-[160px] sm:max-w-[200px] ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {file.originalName || file.fileName || 'Attachment'}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formatSize(file.size) || 'Document'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openFile(file, i)} className={`hidden sm:block text-sm font-medium px-3 py-1.5 rounded-md border transition-colors ${isDarkMode ? 'bg-gray-900 border-gray-600 text-gray-200 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
                      View
                    </button>
                    <button onClick={() => downloadFile(file, i)} title="Download" className={`p-1.5 rounded-md border transition-colors flex items-center justify-center ${isDarkMode ? 'bg-gray-900 border-gray-600 text-gray-200 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Card Footer */}
      <footer className={`border-t pt-3.5 mt-auto flex gap-2 ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
        <button
          onClick={() => api('react')}
          className={`flex items-center gap-2 text-sm font-medium py-1.5 px-2.5 rounded-lg transition-colors ${reacted
            ? (isDarkMode ? 'text-blue-400 hover:bg-blue-500/10' : 'text-blue-600 hover:bg-blue-50')
            : (isDarkMode ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50')}`}
        >
          <ThumbsUp className="w-4 h-4" fill={reacted ? 'currentColor' : 'none'} />
          <span>Like {notice.reactions?.length > 0 ? `(${notice.reactions.length})` : ''}</span>
        </button>
        <button
          onClick={() => setShowComments(s => !s)}
          className={`flex items-center gap-2 text-sm font-medium py-1.5 px-2.5 rounded-lg transition-colors ${showComments
            ? (isDarkMode ? 'text-blue-400 bg-blue-500/10' : 'text-blue-600 bg-blue-50')
            : (isDarkMode ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50')}`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Comment {notice.comments?.length > 0 ? `(${notice.comments.length})` : ''}</span>
        </button>
      </footer>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className={`space-y-2.5 pt-1 ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
              {notice.comments?.length > 0 ? (
                notice.comments.map(c => (
                  <div key={c._id} className={`text-sm p-3 rounded-xl ${isDarkMode ? 'bg-gray-800/70' : 'bg-gray-50'}`}>
                    <span className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{c.userName} </span>
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{c.text}</span>
                  </div>
                ))
              ) : (
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No comments yet.</p>
              )}
              <div className={`flex items-center gap-2 p-2 rounded-xl ${isDarkMode ? 'bg-gray-800/70' : 'bg-gray-100'}`}>
                <input
                  className={`flex-1 bg-transparent outline-none px-2.5 text-sm ${isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-500'}`}
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleComment(); }}
                />
                <button onClick={handleComment} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};

/* =========================================================================
   MAIN COMPONENT
   ========================================================================= */

const NoticeBoard = ({ type }) => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { user, profile, loading: sessionLoading } = useSessionManager();
  const { triggerPopup } = useErrorPopup();

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [sortOpen, setSortOpen] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', category: 'Announcement', department: '', targetBatches: [] });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [availableBatches, setAvailableBatches] = useState([]);

  const isStaff = type === 'staff';
  const title = isStaff ? 'Staff Notices' : 'Departmental Newsroom';
  const subtitle = isStaff
    ? 'Announcements published for all staff members.'
    : 'Stay updated with announcements, resources, and departmental news.';

  // Staff notices → college_admin publishes. Departmental → faculty + college_admin publish.
  const canPost = isStaff
    ? profile?.role === 'college_admin'
    : ['faculty', 'college_admin'].includes(profile?.role);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/notices/${type}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }
      });
      if (res.ok) {
        setNotices(await res.json());
      } else {
        triggerPopup('Failed to load notice feed', 'error');
      }
    } catch (error) {
      console.error('Error fetching notices:', error);
      triggerPopup('Network error loading notice feed', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!sessionLoading) fetchNotices();
  }, [type, sessionLoading]);

  // Faculty sees the batches assigned to them; admins see all tenant batches.
  useEffect(() => {
    if (sessionLoading || isStaff) return;
    (async () => {
      try {
        const url = profile?.role === 'faculty' ? '/api/batches/my-batches' : '/api/batches';
        const res = await fetch(`${API_BASE}${url}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAvailableBatches(
            (Array.isArray(data) ? data : []).map(b => ({
              _id: b._id,
              name: b.batchName || b.name || '(Unnamed batch)',
              section: b.section || b.admissionYear || ''
            }))
          );
        }
      } catch (e) { console.error('Error fetching batches:', e); }
    })();
  }, [sessionLoading, isStaff, profile?.role]);

  const filteredNotices = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return notices
      .filter(n =>
        (q === '' || (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q)) &&
        (activeCategory === 'All' || categoryFor(n) === activeCategory)
      )
      .sort((a, b) => {
        const ta = new Date(a.createdAt).getTime();
        const tb = new Date(b.createdAt).getTime();
        return sortBy === 'Oldest' ? ta - tb : tb - ta;
      });
  }, [notices, searchQuery, activeCategory, sortBy]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('content', formData.content.trim());
      data.append('type', type);
      data.append('category', formData.category);
      if (formData.department) data.append('department', formData.department);
      formData.targetBatches.forEach(id => data.append('targetBatches', id));
      selectedFiles.forEach(file => data.append('files', file));
      const res = await fetch(`${API_BASE}/api/notices`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` },
        body: data
      });
      if (res.ok) {
        setShowCreate(false);
        setFormData({ title: '', content: '', category: 'Announcement', department: '', targetBatches: [] });
        setSelectedFiles([]);
        fetchNotices();
      } else {
        const err = await res.json().catch(() => ({}));
        triggerPopup(err.error || 'Failed to post notice', 'error');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      triggerPopup('Network error while posting', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (sessionLoading) return null;

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-[#f9f9ff] text-gray-900'}`}>
      {/* ================= HEADER ================= */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <GlassHeader variant="dashboard">
          <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate(-1)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-blue-100 text-blue-600'}`}>
                <ArrowLeft className="w-5 h-5" />
              </button>
              <UserProfileDropdown user={user} onOptionClick={() => {}} />
              <div className="flex flex-col">
                <div className={`flex items-center text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <span className="opacity-70 cursor-pointer hover:underline" onClick={() => navigate('/dashboard')}>{roleLabel(profile?.role)} Dashboard</span>
                  <ChevronRight className="w-4 h-4 mx-1 opacity-50" />
                  <span className="text-blue-500">{title}</span>
                </div>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                    {profile?.college || subtitle}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 md:space-x-5">
              {canPost && (
                <button
                  onClick={() => setShowCreate(true)}
                  className="group relative flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all duration-300"
                >
                  <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                  <span className="text-sm font-bold hidden md:inline">Create Post</span>
                </button>
              )}
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2 hidden md:block"></div>
              <CollegeBannerLogo />
              <ThemeToggle />
            </div>
          </div>
        </GlassHeader>
      </div>

      {/* ================= MAIN ================= */}
      <main className="max-w-7xl mx-auto px-4 py-8 pt-24 md:px-6 flex flex-col gap-6">
        {/* Search & Filter Bar */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search notices..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-600 focus:ring-blue-600/15'}`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-sm font-medium px-3.5 py-1.5 rounded-full whitespace-nowrap border transition-colors ${
                    activeCategory === cat
                      ? (isDarkMode ? 'bg-blue-600 border-blue-600 text-white' : 'bg-blue-600 border-blue-600 text-white')
                      : (isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800')
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative ml-auto md:ml-1 shrink-0">
              <button
                onClick={() => setSortOpen(o => !o)}
                className={`flex items-center gap-2 border px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                Sort by: {sortBy}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    className={`absolute right-0 mt-1.5 w-40 rounded-xl border shadow-lg overflow-hidden z-20 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                  >
                    {['Newest', 'Oldest'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => { setSortBy(opt); setSortOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sortBy === opt
                          ? (isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-700')
                          : (isDarkMode ? 'text-gray-300 hover:bg-gray-700/60' : 'text-gray-700 hover:bg-gray-50')}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Notice Feed */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className={`w-10 h-10 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mb-4`} />
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading notices...</p>
          </div>
        ) : filteredNotices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filteredNotices.map(n => (
                <NoticeCard
                  key={n._id}
                  notice={n}
                  currentUser={user}
                  profile={profile}
                  refresh={fetchNotices}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
              <MessageSquare className={`w-6 h-6 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {notices.length === 0 ? 'No notices posted yet.' : 'No notices match your filters.'}
            </p>
            {canPost && notices.length === 0 && (
              <button onClick={() => setShowCreate(true)} className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-500 flex items-center gap-1">
                <Plus className="w-4 h-4" /> Post the first notice
              </button>
            )}
          </div>
        )}
      </main>

      {/* ================= CREATE POST MODAL ================= */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className={`relative z-10 w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              <div className={`p-5 border-b flex justify-between items-center ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-gray-50'}`}>
                <div>
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Create Post</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{isStaff ? 'Publish a notice for staff.' : 'Publish a notice to your department.'}</p>
                </div>
                <button onClick={() => setShowCreate(false)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePost} className="p-5 space-y-4">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Title *</label>
                  <input
                    required type="text" value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Departmental seminar this Friday"
                    className={`w-full rounded-lg px-3.5 py-2.5 text-sm border focus:outline-none focus:ring-2 transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-blue-500/30' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-600/15'}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Category</label>
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className={`w-full rounded-lg px-3.5 py-2.5 text-sm border focus:outline-none transition-all appearance-none ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                      {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  {!isStaff && (
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Department</label>
                      <input
                        type="text" value={formData.department}
                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                        placeholder="e.g. Computer Science"
                        className={`w-full rounded-lg px-3.5 py-2.5 text-sm border focus:outline-none transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                      />
                    </div>
                  )}
                </div>

                {!isStaff && (
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Target Batches {formData.targetBatches.length > 0 && <span className="opacity-60">({formData.targetBatches.length} selected)</span>}
                    </label>
                    <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Only the selected batches will see this notice. No selection = visible to all batches in your department.
                    </p>
                    <div className={`flex flex-wrap gap-2 p-3 rounded-lg border max-h-40 overflow-y-auto ${isDarkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-gray-50'}`}>
                      {availableBatches.length === 0 && (
                        <p className={`text-sm w-full ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {profile?.role === 'faculty' ? 'You have no batches assigned yet. Ask your admin to assign batches to you.' : 'No batches found in this college.'}
                        </p>
                      )}
                      {availableBatches.map(b => {
                        const selected = formData.targetBatches.includes(b._id);
                        return (
                          <button
                            type="button"
                            key={b._id}
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                targetBatches: selected
                                  ? prev.targetBatches.filter(id => id !== b._id)
                                  : [...prev.targetBatches, b._id]
                              }));
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                              selected
                                ? (isDarkMode ? 'bg-blue-600 border-blue-600 text-white' : 'bg-blue-600 border-blue-600 text-white')
                                : (isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100')
                            }`}
                          >
                            <CheckCircle className={`w-4 h-4 ${selected ? '' : 'opacity-30'}`} />
                            {b.name}{b.section ? ` • ${b.section}` : ''}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Content *</label>
                  <textarea
                    required value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    rows={4}
                    placeholder="Share an update..."
                    className={`w-full rounded-lg px-3.5 py-2.5 text-sm border focus:outline-none focus:ring-2 transition-all resize-none ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-blue-500/30' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-600/15'}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Attachments</label>
                  <div className={`flex flex-wrap items-center gap-2 p-2.5 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-gray-50'}`}>
                    {selectedFiles.map((f, i) => (
                      <span key={i} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white border border-gray-200 text-gray-700'}`}>
                        <FileText className="w-3.5 h-3.5 text-blue-500" /> {f.name}
                        <button type="button" onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                    <label className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer transition-colors ${isDarkMode ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                      <Upload className="w-4 h-4" /> Add files
                      <input type="file" multiple className="hidden" onChange={e => setSelectedFiles(prev => [...prev, ...Array.from(e.target.files || [])])} />
                    </label>
                  </div>
                </div>

                <div className={`pt-4 border-t flex justify-end gap-3 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                  <button type="button" onClick={() => setShowCreate(false)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}>Cancel</button>
                  <button type="submit" disabled={submitting} className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-60 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
                    {submitting && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
                    Post Notice
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default NoticeBoard;
