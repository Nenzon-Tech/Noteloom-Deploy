import { API_BASE } from '@/utils/config';
// src/components/ClsContentDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Calendar, ClipboardList, 
  PlayCircle, FileImage, Lock, Unlock, CheckCircle, Circle, Loader2, Check
} from 'lucide-react';

import { useTheme } from '@/context/ThemeContext.jsx'; 
import ModernPDFViewer from '@/components/common/ModernPDFViewer'; 
import CustomVideoPlayer from '@/components/common/CustomVideoPlayer';

 

// Replace existing GlassHeader const
const GlassHeader = ({ children, isDarker }) => (
  <div className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-all duration-300 ${
    isDarker 
      ? 'bg-gray-900/80 border-gray-800' 
      : 'bg-white/80 border-gray-200 shadow-sm'
  }`}>
    {children}
  </div>
);

const ClsContentDetails = () => {
  const { classId } = useParams();
  const params = useParams();
  const contentId = params.contentId || params.id;
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [userRole, setUserRole] = useState('student');


  const [content, setContent] = useState(state?.contentItem || null);
  const [activeTab, setActiveTab] = useState('discussion');
  
  // 1. Data Retrieval
  const contentItem = state?.contentItem || null;
  const classroomName = state?.className || "Classroom";
  const moduleTitle = state?.moduleTitle || "Module";

  // 2. State
  const [allowDownload, setAllowDownload] = useState(contentItem?.allowDownload ?? true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false); // To prevent double-clicks
  const role = localStorage.getItem('userRole'); 

  // 3. Data Normalization (Attachments)
  const getAttachments = () => {
    if (!contentItem) return [];
    if (contentItem.attachments && contentItem.attachments.length > 0) {
      return contentItem.attachments;
    }
    if (contentItem.fileUrl || contentItem.videoUrl) {
      return [{
        _id: 'main',
        title: contentItem.title,
        fileUrl: contentItem.fileUrl,
        videoUrl: contentItem.videoUrl,
        type: contentItem.type,
        fileName: contentItem.fileName
      }];
    }
    return [];
  };

  const attachments = getAttachments();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeFile = attachments[selectedIndex];

 const handleToggleComplete = async () => {
    // Optimistic Update
    const newStatus = !isCompleted;
    setIsCompleted(newStatus);

    try {
      const token = localStorage.getItem('sessionToken');
      await fetch(`${API_BASE}/api/content/${contentId}/complete`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isCompleted: newStatus })
      });
    } catch (err) {
      console.error("Failed to update status", err);
      setIsCompleted(!newStatus); // Revert on error
    }
  };

  // --- FETCH STATUS FROM DB ON LOAD ---
useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('sessionToken');
      try {
        // 1. Get User Role (To hide button for faculty)
        const sessionRes = await fetch(`${API_BASE}/session/info`, { 
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (sessionRes.ok) {
            const sessionData = await sessionRes.json();
            setUserRole(sessionData.role);
        }

        // 2. Fetch Content Details
        const res = await fetch(`${API_BASE}/api/content/${contentId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setContent(data);
          setIsCompleted(data.isCompleted); // Sync status from DB
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (contentId) fetchData();
  }, [contentId]);

  // --- TOGGLE COMPLETION (Saves to DB) ---
  const toggleCompletion = async () => {
    if (loading) return;
    setLoading(true);

    // 1. Optimistic Update (Immediate UI feedback)
    const previousState = isCompleted;
    setIsCompleted(!isCompleted);

    try {
      // 2. Call Backend
      const res = await fetch(`${API_BASE}/api/progress/toggle-complete`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contentId: contentItem._id })
      });

      if (!res.ok) {
        // Revert if error
        setIsCompleted(previousState);
        alert("Failed to save progress. Please try again.");
      }
    } catch (e) { 
      console.error("Toggle complete error", e);
      setIsCompleted(previousState);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Determine File Type
  const getFileType = (file) => {
    if (!file) return 'unknown';
    if (file.videoUrl || file.type === 'lecture' || file.fileType === 'video') return 'video';
    const url = file.fileUrl || "";
    const ext = url.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['mp4', 'mkv', 'webm', 'mov'].includes(ext)) return 'video';
    return 'doc';
  };

  const toggleDownloadPermission = async () => {
    if (role !== 'faculty') return;
    try {
      const response = await fetch(`${API_BASE}/api/content/${contentItem._id}/toggle-download`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAllowDownload(data.allowDownload);
      }
    } catch (e) { console.error("Toggle Error:", e); }
  };

  const canDownloadFile = (file) => {
    if (role === 'faculty') return true;
    if (!allowDownload) return false;
    if (getFileType(file) === 'video') {
       if (file.videoUrl && !file.fileUrl) return false; 
    }
    return true;
  };

  if (!contentItem) return null;

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-[#F2F4F7] text-gray-900'}`}>
      
      {/* HEADER */}
      <GlassHeader isDarker={isDarkMode}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3 overflow-hidden">
            <button 
              onClick={() => navigate(`/dashboard/classrooms/${classId}`)} 
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            >
              <ArrowLeft className="w-5 h-5"/>
            </button>
            <div className="flex flex-col">
              <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {classroomName} • {moduleTitle}
              </span>
              <h1 className="text-lg font-bold truncate max-w-md">{contentItem.title}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             {role === 'faculty' && (
                <button 
                  onClick={toggleDownloadPermission}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    allowDownload 
                      ? 'bg-green-500/10 text-green-500 border-green-500/30 hover:bg-green-500/20' 
                      : 'bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20'
                  }`}
                >
                  {allowDownload ? <Unlock className="w-3 h-3"/> : <Lock className="w-3 h-3"/>}
                  <span className="hidden sm:inline">{allowDownload ? 'Downloads ON' : 'Downloads OFF'}</span>
                </button>
             )}
             <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
               isDarkMode ? 'bg-gray-800 text-gray-300 border border-gray-700' : 'bg-white text-gray-600 border border-gray-200'
             }`}>
               {contentItem.type.replace('_', ' ')}
             </span>
          </div>
        </div>
      </GlassHeader>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 pt-24 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: VIEWER (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className={`rounded-xl overflow-hidden shadow-2xl border flex flex-col ${isDarkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-200'}`}>
            
            {activeFile ? (
              <>
                {getFileType(activeFile) === 'video' ? (
                  // ✅ FIX: Strict 16:9 Container
                  <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                    <div className="absolute inset-0">
                      <CustomVideoPlayer 
  videoUrl={activeFile.videoUrl || (activeFile.fileUrl.startsWith('/') ? activeFile.fileUrl : `/${activeFile.fileUrl}`)} 
                        title={contentItem.title} 
                        showTitle={false} 
                        isDarkMode={isDarkMode}
                        allowDownload={canDownloadFile(activeFile)}
                      />
                    </div>
                  </div>
                ) : getFileType(activeFile) === 'image' ? (
                   <div className="bg-gray-900 flex-1 flex justify-center items-center p-4 min-h-[400px]">
                      <img src={activeFile.fileUrl.startsWith('/') ? activeFile.fileUrl : `/${activeFile.fileUrl}`} alt="preview" className="max-h-[600px] max-w-full object-contain" />
                   </div>
                ) : (
                   <div className="h-[85vh]">
                      <ModernPDFViewer 
                         fileUrl={activeFile.fileUrl.startsWith('/') ? activeFile.fileUrl : `/${activeFile.fileUrl}`} 
                         isDarkMode={isDarkMode} 
                         fileType={getFileType(activeFile)}
                      />
                   </div>
                )}
                
                {/* COMPLETION SECTION (Coursera Style Toggle) */}
                <div className={`p-4 border-t ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                   
                   <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-sm">Now Viewing:</h3>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Attachment {selectedIndex + 1}
                        </p>
                      </div>

{/* --- UPDATED: Detail View Completion Button --- */}
{/* Only show for Students */}
             {userRole === 'student' && (
               <button
                  onClick={handleToggleComplete}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all border ${
                    isCompleted
                      ? 'bg-green-600 text-white border-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {isCompleted ? (
                     <Check className="w-4 h-4" strokeWidth={3} />
                  ) : (
                     <Circle className="w-4 h-4" />
                  )}
                  <span>{isCompleted ? "Completed" : "Mark as Completed"}</span>
               </button>
             )}
                   </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center opacity-50 p-10">No files attached.</div>
            )}
          </div>

          <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h2 className="text-xl font-bold mb-2">{contentItem.title}</h2>
            <p className={`whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {contentItem.description || "No description provided."}
            </p>
            <div className={`flex items-center mt-4 p-3 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
               <Calendar className="w-5 h-5 mr-3 opacity-50"/>
               <div>
                 <p className="text-xs opacity-50 font-bold uppercase">Date Posted</p>
                 <p className="text-sm font-medium">{new Date(contentItem.createdAt).toLocaleDateString()}</p>
               </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FILE LIST */}
        <div className="lg:col-span-4 space-y-6">
          <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`p-4 border-b font-bold flex items-center justify-between ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <span>Course Content</span>
              <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-500">{attachments.length} items</span>
            </div>
            
            <div className="max-h-[600px] overflow-y-auto">
              {attachments.map((file, idx) => {
                const isActive = selectedIndex === idx;
                const type = getFileType(file);
                
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedIndex(idx)}
                    className={`w-full text-left p-4 border-b last:border-0 transition-all flex items-start gap-3 ${
                      isActive 
                        ? (isDarkMode ? 'bg-blue-900/20 border-blue-500/30' : 'bg-blue-50 border-blue-100') 
                        : (isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-100 hover:bg-gray-50')
                    }`}
                  >
                    <div className={`mt-1 p-2 rounded-lg flex-shrink-0 ${
                      isActive ? 'bg-blue-500 text-white' : (isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500')
                    }`}>
                      {type === 'video' ? <PlayCircle className="w-5 h-5"/> : 
                       type === 'image' ? <FileImage className="w-5 h-5"/> : 
                       <FileText className="w-5 h-5"/>}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium text-sm truncate ${isActive ? 'text-blue-500 font-bold' : ''}`}>
                         Attachment {idx + 1}
                      </h4>
                      <p className="text-xs opacity-50 mt-1 capitalize">{type}</p>
                    </div>
                    {isActive && <div className="w-2 h-2 rounded-full bg-blue-500 mt-3"/>}
                  </button>
                )
              })}
            </div>
          </div>
          {/* Assignment Box */}
          {contentItem.type === 'assignment' && (
             <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-purple-900/20 border-purple-500/30' : 'bg-purple-50 border-purple-100'}`}>
               <h3 className="font-bold text-purple-500 mb-2 flex items-center"><ClipboardList className="w-4 h-4 mr-2"/> Assignment Task</h3>
               <p className="text-sm opacity-70 mb-4">Please complete the task associated with these files.</p>
               <button className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors shadow-lg shadow-purple-500/20">
                 Submit Assignment
               </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClsContentDetails;