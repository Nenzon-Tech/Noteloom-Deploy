import { API_BASE } from '@/utils/config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Plus, Camera, Trash2, Edit, Heart, MessageSquare, 
  PlayCircle, FileText, Upload, X 
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext.jsx';
import GlassHeader from '@/components/common/GlassHeader.jsx';
import { useSessionManager } from '@/hooks/useSessionManager.js';
import { useErrorPopup } from '@/context/ErrorPopupContext.jsx';

const NoticeCard = ({ notice, currentUser, currentRole, refresh }) => {
  const { isDarkMode } = useTheme();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  
  // State for PDF Expanded View
  const [expandedPdf, setExpandedPdf] = useState(null);

  const isOwner = notice.posterId === currentUser?.id;

  const handleAction = async (action, data = {}) => {
    try {
      const res = await fetch(`${API_BASE}/api/notices/${notice._id}/${action}`, {
        method: action === 'comments' ? 'POST' : (action === 'react' ? 'PATCH' : 'DELETE'),
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) refresh();
    } catch (error) {
      console.error(`Failed to ${action} notice`, error);
    }
  };

  return (
    <>
      <motion.div layout className={`p-6 rounded-[2.5rem] border ${isDarkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'}`}>
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg transform rotate-3">
              {notice.posterName?.[0]}
            </div>
            <div>
              <h4 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{notice.posterName}</h4>
              <p className={`text-[10px] opacity-60 font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{notice.posterRole} • {new Date(notice.createdAt).toLocaleString()}</p>
            </div>
          </div>
          {isOwner && (
            <div className="flex bg-gray-500/10 rounded-full p-1">
              <button className="p-2 hover:bg-blue-500/20 rounded-full text-blue-500"><Edit className="w-4 h-4"/></button>
              <button onClick={() => handleAction('delete')} className="p-2 hover:bg-red-500/20 rounded-full text-red-500"><Trash2 className="w-4 h-4"/></button>
            </div>
          )}
        </div>

        <h3 className={`text-xl font-extrabold mb-3 leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{notice.title}</h3>
        <p className={`text-sm mb-6 opacity-80 whitespace-pre-wrap leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{notice.content}</p>
        
        {/* ATTACHMENTS SECTION */}
        <div className="grid gap-3 mb-6 rounded-3xl overflow-hidden">
          {notice.attachments?.map((file, i) => (
            <div key={i}>
              {/* 1. IMAGES */}
              {file.fileType === 'image' && (
                <img src={`${API_BASE}/${file.fileUrl}`} className="w-full rounded-2xl border border-gray-500/10" alt="attachment" />
              )}

              {/* 2. VIDEOS */}
              {file.fileType === 'video' && (
                file.videoConfig?.playerType === 'mini' ? (
                  <video controls className="w-full rounded-2xl aspect-video bg-black"><source src={`${API_BASE}/${file.fileUrl}`} /></video>
                ) : (
                  <div className="relative group rounded-2xl overflow-hidden bg-gray-900 aspect-video flex items-center justify-center">
                    <PlayCircle className="w-16 h-16 text-white/50 transition-all"/>
                    <span className="absolute bottom-4 right-4 text-[10px] font-bold bg-white/20 px-3 py-1 rounded-full text-white">Still Preview</span>
                  </div>
                )
              )}

              {/* 3. PDFS (New Logic) */}
              {file.fileType === 'pdf' && (
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-red-50 border-red-100'}`}>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg text-red-600"><FileText className="w-6 h-6"/></div>
                    <div>
                      <span className={`text-sm font-bold block truncate max-w-[200px] ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{file.originalName || file.fileName}</span>
                      <span className={`text-[10px] opacity-60 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>PDF Document • {(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setExpandedPdf(`${API_BASE}/${file.fileUrl}`)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      View
                    </button>
                    <a 
                      href={`${API_BASE}/${file.fileUrl}`} 
                      download 
                      className="p-2 hover:bg-gray-500/10 rounded-lg text-blue-500"
                    >
                      <Upload className="w-4 h-4 rotate-180"/> 
                    </a>
                  </div>
                </div>
              )}

              {/* 4. OTHER DOCUMENTS (Word, Excel, Zip) */}
              {(file.fileType === 'document' || file.fileType === 'other') && (
                <a href={`${API_BASE}/${file.fileUrl}`} target="_blank" rel="noreferrer" className={`flex items-center justify-between p-4 rounded-2xl border group transition-all ${isDarkMode ? 'bg-gray-900/50 border-gray-700 hover:bg-gray-800' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><FileText className="w-6 h-6"/></div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold truncate max-w-[200px] text-left ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{file.originalName || file.fileName}</span>
                      <span className={`text-[10px] opacity-60 text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-blue-500 group-hover:underline">DOWNLOAD</span>
                </a>
              )}
            </div>
          ))}
        </div>

        <div className={`flex items-center space-x-8 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <button onClick={() => handleAction('react')} className={`flex items-center space-x-2 text-sm font-bold ${notice.reactions?.some(r => r.userId === currentUser?.id) ? 'text-red-500' : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}>
            <Heart className="w-5 h-5"/> <span>{notice.reactions?.length || 0}</span>
          </button>
          <button onClick={() => setShowComments(!showComments)} className={`flex items-center space-x-2 text-sm font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <MessageSquare className="w-5 h-5"/> <span>{notice.reactions?.length || 0}</span>
          </button>
        </div>

        {showComments && (
          <div className="mt-6 space-y-4">
            {notice.comments?.map(c => (
              <div key={c._id} className={`text-sm p-3 rounded-2xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                <span className="font-black text-blue-500 mr-2">{c.userName}</span>
                <span className={`opacity-80 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{c.text}</span>
              </div>
            ))}
            <div className={`flex items-center space-x-3 p-2 rounded-2xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
              <input 
                className={`flex-1 bg-transparent border-none outline-none px-3 text-xs ${isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'}`} 
                placeholder="Add a comment..." 
                value={commentText} 
                onChange={e => setCommentText(e.target.value)} 
              />
              <button onClick={() => { handleAction('comments', { text: commentText }); setCommentText(""); }} className="bg-blue-600 text-white p-2 rounded-xl"><Plus className="w-4 h-4"/></button>
            </div>
          </div>
        )}
      </motion.div>

      {/* PDF EXPANDED VIEW MODAL */}
      <AnimatePresence>
        {expandedPdf && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-white w-full h-[90vh] max-w-5xl rounded-xl overflow-hidden flex flex-col shadow-2xl relative">
              
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                <h3 className="font-bold text-gray-700 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-red-500"/> 
                  Document Viewer
                </h3>
                <div className="flex space-x-2">
                  <a href={expandedPdf} download className="p-2 hover:bg-gray-200 rounded-full text-gray-600" title="Download">
                    <Upload className="w-5 h-5 rotate-180" />
                  </a>
                  <button onClick={() => setExpandedPdf(null)} className="p-2 hover:bg-red-100 rounded-full text-red-500 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* PDF Content (Iframe) */}
              <div className="flex-1 bg-gray-100 relative">
                <iframe 
                  src={expandedPdf} 
                  className="w-full h-full" 
                  title="PDF Viewer"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const NoticeBoard = ({ type }) => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { user, profile, loading: sessionLoading } = useSessionManager();
  const { triggerPopup } = useErrorPopup();
  
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", department: "", videoConfig: "mini" });
  const [selectedFiles, setSelectedFiles] = useState([]);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/notices/${type}`, { 
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` } 
      });
      if (res.ok) {
        setNotices(await res.json());
      } else {
        triggerPopup("Failed to load notice feed", "error");
      }
    } catch (error) {
      console.error("Error fetching notices:", error);
      triggerPopup("Network error loading notice feed", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!sessionLoading) {
      fetchNotices();
    }
  }, [type, sessionLoading]);

  const handlePost = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('type', type);
    data.append('videoConfig', formData.videoConfig);
    selectedFiles.forEach(file => data.append('media', file));

    try {
      const res = await fetch(`${API_BASE}/api/notices`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` },
        body: data
      });
      if (res.ok) { 
        setShowCreate(false); 
        setFormData({title:"", content:"", department:"", videoConfig:"mini"}); 
        setSelectedFiles([]); 
        fetchNotices(); 
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <div className={`min-h-screen pt-20 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <GlassHeader isDarker={true}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-700/50 rounded-lg">
              <ArrowLeft className="w-5 h-5"/>
            </button>
            <h1 className="text-xl font-bold capitalize">{type?.replace('_', ' ') || 'Notice'} Newsroom</h1>
          </div>
          {((type === 'staff' && profile?.role === 'college_admin') || (type === 'departmental' && profile?.role === 'faculty')) && (
            <button onClick={() => setShowCreate(true)} className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg flex items-center hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4 mr-2"/> Create Post
            </button>
          )}
        </div>
      </GlassHeader>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence>
          {showCreate && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className={`mb-8 p-6 rounded-3xl border-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-xl'}`}
            >
               <input 
                 placeholder="Notice Title" 
                 className={`w-full mb-4 bg-transparent text-2xl font-bold outline-none border-b pb-2 ${isDarkMode ? 'border-gray-600 placeholder-gray-500 text-white' : 'border-gray-200 placeholder-gray-400 text-gray-900'}`}
                 value={formData.title} 
                 onChange={e => setFormData({...formData, title: e.target.value})} 
               />
               <textarea 
                 placeholder="Share an update..." 
                 className={`w-full mb-4 bg-transparent resize-none outline-none min-h-[120px] text-lg ${isDarkMode ? 'placeholder-gray-500 text-white' : 'placeholder-gray-400 text-gray-900'}`}
                 value={formData.content} 
                 onChange={e => setFormData({...formData, content: e.target.value})} 
               />
               <div className={`flex justify-between items-center pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                 <div className="flex space-x-4">
                   <label className="cursor-pointer hover:text-blue-500 transition-colors flex items-center">
                     <Camera className="w-6 h-6 mr-1"/>
                     <input type="file" multiple className="hidden" onChange={e => setSelectedFiles([...selectedFiles, ...Array.from(e.target.files)])} />
                     <span className="text-xs opacity-70">{selectedFiles.length > 0 ? `${selectedFiles.length} files` : ''}</span>
                   </label>
                   <select 
                     className={`text-xs bg-transparent font-bold outline-none ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                     value={formData.videoConfig} 
                     onChange={e => setFormData({...formData, videoConfig: e.target.value})}
                   >
                     <option value="mini" className="text-black">Video Player</option>
                     <option value="still" className="text-black">Video Still</option>
                   </select>
                 </div>
                 <div className="space-x-3">
                   <button onClick={() => setShowCreate(false)} className="px-4 py-2 font-bold opacity-60 hover:opacity-100 transition-opacity">Cancel</button>
                   <button onClick={handlePost} className="bg-blue-600 text-white px-8 py-2 rounded-full font-bold hover:bg-blue-700 transition-colors">Post</button>
                 </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-8">
          {loading ? (
            <div className="text-center py-10 opacity-50">Loading Feed...</div>
          ) : notices.length > 0 ? (
            notices.map(n => (
              <NoticeCard 
                key={n._id} 
                notice={n} 
                currentUser={user} 
                currentRole={profile?.role} 
                refresh={fetchNotices} 
              />
            ))
          ) : (
            <div className="text-center py-10 opacity-50">No notices found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoticeBoard;