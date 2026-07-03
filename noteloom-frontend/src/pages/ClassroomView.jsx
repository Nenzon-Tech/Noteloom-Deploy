import { API_BASE } from '@/utils/config';
// src/pages/ClassroomView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ListTodoIcon, AlertCircle, PlayCircle, FileText, ClipboardList, BookOpen, 
  Youtube, FileVideo, FileImage, FileArchive, MoreVertical, Edit, Trash2, 
  Upload, Eye, Play, FolderKanban, X, CheckCircle, Circle, CloudOff, Download, Check, Plus, FolderPlus 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext.jsx'; 
// import NoteloomAi from '@/components/features/ai/NoteloomAi';

 

// --- INTERNAL COMPONENT: GlassHeader ---
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

const ClassroomView = () => {
  const { id } = useParams();
  const { state } = useLocation(); 
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
//   const classroomName = state?.className || "Classroom View";
  const [classroomName, setClassroomName] = useState(state?.className || "Loading...");

  // --- NEW: Default download to true ---
  const [allowDownload, setAllowDownload] = useState(true);

  // State
  const [modules, setModules] = useState([]);
  const [activeModule, setActiveModule] = useState(null);
  const [contentList, setContentList] = useState([]);
//   const [activeTab, setActiveTab] = useState('All'); 
  const [activeTab, setActiveTab] = useState(state?.activeTab || 'All');
  const [userRole, setUserRole] = useState('student'); 

  // Modal States
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Viewer State
  const [viewerFile, setViewerFile] = useState(null); 
  
  // Forms
  const [moduleTitle, setModuleTitle] = useState("");
  const [contentForm, setContentForm] = useState({ title: '', desc: '', type: '', link: '' });
  const [editingItem, setEditingItem] = useState(null);
  
  // --- FILE QUEUE STATE ---
  const [selectedFiles, setSelectedFiles] = useState([]); 
  const [isUploading, setIsUploading] = useState(false);

  const tabs = [
    { id: 'All', label: 'All', icon: ListTodoIcon },
    { id: 'Updates', label: 'Updates', icon: AlertCircle },
    { id: 'Lectures', label: 'Lectures', icon: PlayCircle },
    { id: 'Notes', label: 'Notes', icon: FileText },
    { id: 'Assignment', label: 'Assignment', icon: ClipboardList },
    { id: 'Short Notes', label: 'Short Notes', icon: BookOpen },
  ];

  // --- Helpers ---
  const getFileType = (fileName, type) => {
    if (type === 'lecture') return 'video';
    if (!fileName) return 'text';
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['mp4', 'mkv', 'webm', 'mov'].includes(ext)) return 'video';
    return 'doc';
  };

  const renderIconBox = (item) => {
    const fileType = getFileType(item.fileName, item.type);
    let IconComponent = FileText;
    let colorClass = "bg-gray-100 text-gray-500";

    if (item.videoUrl || fileType === 'video') {
      IconComponent = item.videoUrl ? Youtube : FileVideo;
      colorClass = "bg-red-100 text-red-600";
    } else if (fileType === 'pdf') {
      IconComponent = FileText;
      colorClass = "bg-red-50 text-red-600 border border-red-100";
    } else if (fileType === 'image') {
      IconComponent = FileImage;
      colorClass = "bg-purple-100 text-purple-600";
    } else if (fileType === 'doc') {
      IconComponent = FileArchive;
      colorClass = "bg-blue-100 text-blue-600";
    } else {
       if(item.type === 'assignment') { IconComponent = ClipboardList; colorClass = "bg-purple-100 text-purple-600"; }
       else if(item.type === 'update') { IconComponent = AlertCircle; colorClass = "bg-yellow-100 text-yellow-600"; }
       else { IconComponent = BookOpen; colorClass = "bg-emerald-100 text-emerald-600"; }
    }

    return (
      <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-sm ${colorClass}`}>
        <IconComponent className="w-8 h-8"/>
      </div>
    );
  };

  // --- Data Fetching ---
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('sessionToken');
      if (!state?.className) {
      const classRes = await fetch(`${API_BASE}/api/classrooms`, { 
          headers: { 'Authorization': `Bearer ${token}` }
      });
      if (classRes.ok) {
          const allClasses = await classRes.json();
          // Find the current class in the user's list
          const currentClass = allClasses.find(c => c._id === id);
          if (currentClass) {
              setClassroomName(currentClass.name);
          } else {
              setClassroomName("Classroom View");
          }
      }
    }
      const sessionRes = await fetch(`${API_BASE}/session/info`, { headers: { 'Authorization': `Bearer ${token}` }});
      if (sessionRes.ok) {
        const data = await sessionRes.json();
        setUserRole(data.role);
      }
      const modRes = await fetch(`${API_BASE}/api/classrooms/${id}/modules`, { headers: { 'Authorization': `Bearer ${token}` }});
      if (modRes.ok) {
        const mods = await modRes.json();
        setModules(mods);
        if (mods.length > 0 && !activeModule) setActiveModule(mods[0]);
      }
    } catch (e) { console.error(e); }
  };

  const fetchContent = async () => {
    if (!activeModule) return;
    try {
      const res = await fetch(`${API_BASE}/api/modules/${activeModule._id}/content`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }
      });
      if (res.ok) setContentList(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, [id]);
  useEffect(() => { fetchContent(); }, [activeModule]);

  // --- Handlers ---
  const handleCreateModule = async (e) => {
    e.preventDefault();
    await fetch(`${API_BASE}/api/classrooms/${id}/modules`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: moduleTitle })
    });
    setModuleTitle(""); setShowModuleModal(false); fetchData();
  };

  // 1. ADD FILES TO QUEUE
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
      e.target.value = null; // Allow re-selecting same file
    }
  };

  // 2. REMOVE FROM QUEUE
  const removeFile = (indexToRemove) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // 3. UPLOAD HANDLER
  const handleUploadContent = async (e) => {
    e.preventDefault();
    if (!contentForm.title.trim()) { alert("⚠️ TITLE REQUIRED"); return; }
    if (!contentForm.type) { alert("⚠️ CATEGORY REQUIRED"); return; }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('title', contentForm.title);
      formData.append('description', contentForm.desc);
      
      const typeMap = { 'Lectures': 'lecture', 'Notes': 'note', 'Assignment': 'assignment', 'Updates': 'update', 'Short Notes': 'short_note' };
      formData.append('type', typeMap[contentForm.type] || 'resource');
      
      if (contentForm.link) formData.append('videoUrl', contentForm.link);

      // --- NEW: SEND PERMISSION FLAG ---
      // We send 'allowDownload' state (defaults to true)
      formData.append('allowDownload', allowDownload); 

      // Handle File Stacking (Multiple Files)
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          formData.append('files', file); 
        });
      }

      const response = await fetch(`${API_BASE}/api/modules/${activeModule._id}/content`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` },
        body: formData
      });

      if (response.ok) {
        setIsUploading(false);
        setShowContentModal(false); 
        setContentForm({ title: '', desc: '', type: '', link: '' }); 
        setSelectedFiles([]); 
        setAllowDownload(true); // Reset checkbox to default
        fetchContent(); 
      } else {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }
    } catch (error) { 
      console.error(error);
      alert("Upload failed: " + error.message); 
      setIsUploading(false); 
    }
  };

  const handleDeleteContent = async (contentId) => {
    if(!confirm("Are you sure?")) return;
    try {
      await fetch(`${API_BASE}/api/content/${contentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }
      });
      fetchContent();
    } catch(e) { alert("Failed to delete"); }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setContentForm({ title: item.title, desc: item.description || '', type: item.type, link: item.videoUrl || '' });
    setShowEditModal(true);
  };

  const handleUpdateContent = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE}/api/content/${editingItem._id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: contentForm.title, description: contentForm.desc })
      });
      setShowEditModal(false); setEditingItem(null); fetchContent();
    } catch(e) { alert("Update failed"); }
  };

  // --- NEW: Mark as Completed Handler ---
  const handleToggleComplete = async (e, contentId, currentStatus) => {
    e.stopPropagation();
    // Optimistic UI Update
    const updatedList = contentList.map(item => 
      item._id === contentId ? { ...item, isCompleted: !currentStatus } : item
    );
    setContentList(updatedList);

    try {
      // API call to save status
      await fetch(`${API_BASE}/api/content/${contentId}/complete`, { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }
      });
    } catch (err) { console.error("Failed to update completion status"); }
  };

  // --- NEW: Toggle Download Permission Handler ---
  const handleToggleDownload = async (contentId, currentPermission) => {
    // Optimistic UI Update
    const updatedList = contentList.map(item => 
      item._id === contentId ? { ...item, allowDownload: !currentPermission } : item
    );
    setContentList(updatedList);

    try {
      // API call to toggle permission
      await fetch(`${API_BASE}/api/content/${contentId}/toggle-download`, { 
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ allowDownload: !currentPermission })
      });
    } catch (err) { console.error("Failed to update permission"); }
  };

  const filteredContent = activeTab === 'All' 
    ? contentList 
    : contentList.filter(c => {
        const map = { 'Lectures': 'lecture', 'Notes': 'note', 'Assignment': 'assignment', 'Updates': 'update', 'Short Notes': 'short_note' };
        return c.type === map[activeTab];
      });

  const ContentMenu = ({ item }) => {
    const [open, setOpen] = useState(false);
    return (
      <div className="relative">
        <button onClick={(e) => { e.stopPropagation(); setOpen(!open); }} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
          <MoreVertical className="w-4 h-4 opacity-60"/>
        </button>
        {open && (
          <div className={`absolute right-0 mt-2 w-32 rounded-lg shadow-xl py-2 z-20 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <button onClick={(e) => { e.stopPropagation(); openEditModal(item); setOpen(false); }} className="flex items-center w-full px-4 py-2 text-xs hover:bg-blue-500/10 text-blue-500">
              <Edit className="w-3 h-3 mr-2"/> Edit
            </button>
            {/* --- NEW: MANAGE DOWNLOAD PERMISSION (Faculty Only) --- */}
            <button 
              onClick={(e) => { e.stopPropagation(); handleToggleDownload(item._id, item.allowDownload); setOpen(false); }} 
              className={`flex items-center w-full px-4 py-2 text-xs transition-colors ${item.allowDownload ? 'text-red-500 hover:bg-red-500/10' : 'text-green-500 hover:bg-green-500/10'}`}
            >
              {item.allowDownload ? <CloudOff className="w-3 h-3 mr-2"/> : <Download className="w-3 h-3 mr-2"/>}
              {item.allowDownload ? 'Disable Download' : 'Enable Download'}
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleDeleteContent(item._id); setOpen(false); }} className="flex items-center w-full px-4 py-2 text-xs hover:bg-red-500/10 text-red-500">
              <Trash2 className="w-3 h-3 mr-2"/> Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <GlassHeader isDarker={isDarkMode}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
           <button 
  onClick={() => navigate(userRole === 'student' ? '/dashboard/courses' : '/dashboard/my-classes')} 
  className="p-2 hover:bg-gray-700/50 rounded-full"
>
  <ArrowLeft className="w-5 h-5"/>
</button>
            <h1 className="text-lg font-bold truncate max-w-md">{classroomName}</h1>
          </div>
          {userRole !== 'student' && (
  <div className={`flex items-center p-1 rounded-full border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100/80 border-gray-200'}`}>
    <button 
      onClick={() => setShowModuleModal(true)} 
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
        isDarkMode 
        ? 'hover:bg-gray-700 text-gray-300' 
        : 'hover:bg-white hover:shadow-sm text-gray-600'
      }`}
    >
      <FolderPlus className="w-4 h-4" />
      <span className="hidden sm:inline">Module</span>
    </button>
    
    <div className={`w-px h-4 mx-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />

    <button 
      onClick={() => activeModule && setShowContentModal(true)} 
      disabled={!activeModule}
      className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
          !activeModule ? 'opacity-50 cursor-not-allowed' : 
          'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40 hover:scale-105'
      }`}
    >
      <Plus className="w-4 h-4" strokeWidth={3}/>
      <span>Add Content</span>
    </button>
  </div>
)}
        </div>
      </GlassHeader>

      <div className="flex flex-1 pt-16 h-[calc(100vh-64px)] overflow-hidden">
        {/* SIDEBAR */}
        <div className={`w-80 flex-shrink-0 border-r overflow-y-auto ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className={`p-5 border-b sticky top-0 z-10 backdrop-blur-md ${isDarkMode ? 'bg-gray-900/90 border-gray-700' : 'bg-white/90 border-gray-200'}`}>
            <h2 className="font-black text-xs text-blue-500 uppercase tracking-widest flex items-center">
              <FolderKanban className="w-4 h-4 mr-2"/> ALL MODULES
            </h2>
          </div>
          <div className="space-y-2 p-3">
            {modules.map((mod, idx) => (
              <button
                key={mod._id}
                onClick={() => setActiveModule(mod)}
                className={`relative w-full text-left p-4 rounded-xl text-sm font-bold transition-all duration-300 flex items-center group overflow-hidden ${
                  activeModule?._id === mod._id 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40 scale-[1.02]' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:pl-5'
                }`}
              >
                <span className={`font-mono text-xs px-2 py-1 rounded-md mr-3 transition-colors ${activeModule?._id === mod._id ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>M-{idx + 1}</span>
                <span className="truncate relative z-10">{mod.title}</span>
                {activeModule?._id === mod._id && <motion.div layoutId="activeDot" className="absolute right-3 w-2 h-2 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />}
              </button>
            ))}
            {modules.length === 0 && <div className="p-4 text-center opacity-50 text-sm">No modules yet.</div>}
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className={`flex flex-wrap items-center gap-x-6 gap-y-2 px-6 border-b w-full ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center space-x-2 py-4 px-2 font-bold text-sm whitespace-nowrap transition-all duration-300 ${
                    isActive ? 'text-emerald-500 dark:text-emerald-400 scale-105' : 'opacity-60 hover:opacity-100 hover:text-emerald-500'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'fill-emerald-500/10' : ''}`}/>
                  <span>{tab.label}</span>
                  {isActive && <motion.div layoutId="activeTabGlow" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,1)]" />}
                </button>
              )
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-gray-900/50">
            {!activeModule ? (
              <div className="text-center py-20 opacity-50">Select a module to view content.</div>
            ) : (
              <div className="space-y-4 max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">{activeModule.title}</h2>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-600 border border-blue-200">{activeTab === 'All' ? 'All Content' : activeTab}</span>
                </div>

                {filteredContent.map(item => {
                   const fileType = getFileType(item.fileName, item.type);
                   const fileUrl = item.fileUrl ? `${API_BASE}/${item.fileUrl.replace(/\\/g, '/')}` : null;
                   
                   return (
                    <div 
                      key={item._id} 
                      onClick={() => navigate(`/dashboard/classrooms/${id}/content/${item._id}`, { 
                        state: { 
                          contentItem: item, 
                          className: classroomName,
                          moduleTitle: activeModule?.title 
                        } 
                      })}
                      className={`p-4 rounded-xl border flex items-start gap-4 transition-all hover:shadow-md cursor-pointer group ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                    >
                      <div className="flex-shrink-0">
                        {renderIconBox(item)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1 block">
                              {item.type.replace('_', ' ')} • {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                            <h3 className="font-bold text-lg truncate group-hover:text-blue-500 transition-colors">{item.title}</h3>
                            <p className="text-sm opacity-70 mt-1 line-clamp-2">{item.description}</p>
                          </div>
                          {userRole !== 'student' && <ContentMenu item={item} />}
                        </div>

{/* --- UPDATED: Student Mark as Completed (Pill Shape) --- */}
{userRole === 'student' && (
  <button
    onClick={(e) => handleToggleComplete(e, item._id, item.isCompleted)}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
      item.isCompleted 
        ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30' 
        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'
    }`}
  >
    {item.isCompleted ? (
      <>
        <Check className="w-3.5 h-3.5" /> {/* Simple Tick */}
        <span>Completed</span>
      </>
    ) : (
      <>
        <Circle className="w-3.5 h-3.5" />
        <span>Mark as Completed</span>
      </>
    )}
  </button>
)}

                        <div className="flex items-center gap-3 mt-4">
                          {/* Mini Image Preview */}
                          {fileType === 'image' && fileUrl && (
                             <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                               <img src={fileUrl} alt="mini" className="w-full h-full object-cover"/>
                             </div>
                          )}

                          {(item.fileUrl || item.videoUrl) && (
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                navigate(`/dashboard/classrooms/${id}/content/${item._id}`, { 
                                  state: { 
                                    contentItem: item, 
                                    className: classroomName,
                                    moduleTitle: activeModule?.title 
                                  } 
                                });
                              }}
                              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-blue-500/30"
                            >
                              {fileType === 'video' ? <Play className="w-3 h-3 mr-2 fill-white"/> : <Eye className="w-3 h-3 mr-2"/>}
                              {fileType === 'video' ? 'Watch Video' : 'View Material'}
                            </button>
                          )}
                          
                          {item.fileUrl && !['video', 'image'].includes(fileType) && (userRole !== 'student' || item.allowDownload !== false) && (
                            <a 
                              href={`${API_BASE}/${item.fileUrl.replace(/\\/g, '/')}`} 
                              download 
                              onClick={(e) => e.stopPropagation()}
                              className={`p-2 rounded-lg border transition-colors ${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-100'}`}
                            >
                              <Upload className="w-4 h-4 rotate-180"/>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredContent.length === 0 && <div className="text-center py-12 opacity-50"><ListTodoIcon className="w-12 h-12 mb-2 mx-auto"/><p>No content found.</p></div>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* VIEWER MODAL */}
      {viewerFile && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black/95 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="flex items-center justify-between p-4 bg-black/50 border-b border-white/10">
             <h3 className="text-white font-bold truncate max-w-lg">{viewerFile.title}</h3>
             <div className="flex items-center gap-4">
                <a href={viewerFile.url} download className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                  <Upload className="w-5 h-5 rotate-180"/>
                </a>
                <button onClick={() => setViewerFile(null)} className="p-2 bg-white/10 hover:bg-red-500/80 rounded-full text-white transition-colors">
                  <X className="w-5 h-5"/>
                </button>
             </div>
           </div>
           <div className="flex-1 overflow-hidden flex items-center justify-center p-4">
             {viewerFile.type === 'image' ? (
               <img src={viewerFile.url} alt="Full View" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"/>
             ) : (
               <iframe src={viewerFile.url} title="File Viewer" className="w-full h-full rounded-lg bg-white shadow-2xl border-none"/>
             )}
           </div>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showContentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg p-6 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-xl font-bold mb-4">Add Content</h3>
            
            {isUploading ? (
              <div className="py-10 text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
                <p className="font-bold">Uploading content...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase opacity-60 mb-1 block">Content Type <span className="text-red-500">*</span></label>
                  <div className="flex gap-2 flex-wrap">
                    {['Lectures', 'Notes', 'Assignment', 'Updates', 'Short Notes'].map(t => (
                      <button key={t} onClick={() => setContentForm({...contentForm, type: t})} className={`px-3 py-1 rounded-full text-xs font-bold border ${contentForm.type === t ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-500 opacity-60'}`}>{t}</button>
                    ))}
                  </div>
                </div>
                
                <input className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`} placeholder="Title" value={contentForm.title} onChange={e => setContentForm({...contentForm, title: e.target.value})} />
                
                <textarea className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`} placeholder="Description..." rows="3" value={contentForm.desc} onChange={e => setContentForm({...contentForm, desc: e.target.value})} />
                
                {contentForm.type === 'Lectures' && <input className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`} placeholder="Video URL (YouTube/Vimeo)" value={contentForm.link} onChange={e => setContentForm({...contentForm, link: e.target.value})} />}
                
                {/* --- FILE UPLOAD AREA WITH LIST --- */}
                <div className="border border-dashed border-gray-500 rounded-lg p-4 text-center relative">
                  <label className="cursor-pointer block w-full h-full">
                    <input type="file" multiple onChange={handleFileSelect} className="hidden" />
                    <div className="flex flex-col items-center justify-center py-2">
                      <Upload className="w-8 h-8 mb-2 opacity-50"/>
                      <span className="text-sm font-bold block">
                        {selectedFiles.length > 0 ? "Add More Files" : "Click to Upload File(s)"}
                      </span>
                    </div>
                  </label>
                  
                  {/* --- INSTANT FILE LIST PREVIEW --- */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                      <p className="text-left text-xs font-bold uppercase opacity-60 px-1">Selected Files ({selectedFiles.length})</p>
                      {selectedFiles.map((file, idx) => {
                          const isImg = file.type.startsWith('image/');
                          const previewUrl = isImg ? URL.createObjectURL(file) : null;
                          
                          return (
                          <div key={idx} className={`flex items-center gap-3 p-2 rounded-lg text-left text-sm ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100 border'}`}>
                            {/* Preview Thumbnail */}
                            <div className="w-10 h-10 flex-shrink-0 bg-gray-300 dark:bg-gray-600 rounded overflow-hidden flex items-center justify-center">
                              {isImg ? (
                                <img src={previewUrl} alt="preview" className="w-full h-full object-cover"/>
                              ) : (
                                <FileText className="w-5 h-5 opacity-50"/>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="font-bold truncate">{file.name}</p>
                              <p className="text-xs opacity-60">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                            
                            <button onClick={() => removeFile(idx)} className="p-1.5 hover:bg-red-100 text-red-500 rounded-full transition-colors">
                              <X className="w-4 h-4"/>
                            </button>
                          </div>
                          );
                      })}
                    </div>
                  )}
                </div>

                 {/* --- NEW: DOWNLOAD PERMISSION CHECKBOX (For all resources) --- */}
                 <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                   <div className="relative flex items-center">
                     <input 
                       type="checkbox" 
                       id="allowDownload" 
                       checked={allowDownload} 
                       onChange={(e) => setAllowDownload(e.target.checked)}
                       className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                     />
                   </div>
                   <label htmlFor="allowDownload" className="text-sm font-medium cursor-pointer flex-1 text-left select-none">
                     Allow students to download resource?
                     <p className="text-xs opacity-50 font-normal">If unchecked, students can only view or watch the resource online.</p>
                   </label>
                 </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button onClick={() => setShowContentModal(false)} className="px-4 py-2 rounded-lg font-bold opacity-60">Cancel</button>
                  <button onClick={handleUploadContent} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold">
                    {selectedFiles.length > 1 ? `Upload All (${selectedFiles.length})` : 'Upload'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE MODULE / EDIT MODALS */}
      {showModuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-xl font-bold mb-4">Create Module</h3>
            <input className={`w-full p-3 rounded-lg border mb-4 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`} placeholder="Module Name" value={moduleTitle} onChange={e => setModuleTitle(e.target.value)} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModuleModal(false)} className="px-4 py-2 rounded-lg font-bold opacity-60">Cancel</button>
              <button onClick={handleCreateModule} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Create</button>
            </div>
          </div>
        </div>
      )}
      
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg p-6 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-xl font-bold mb-4">Edit Content</h3>
            <div className="space-y-4">
               <div className="p-3 rounded-lg bg-yellow-500/10 text-yellow-600 text-xs flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2"/> Note: You can only edit text details.
               </div>
               <input className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`} placeholder="Title" value={contentForm.title} onChange={e => setContentForm({...contentForm, title: e.target.value})} />
               <textarea className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`} placeholder="Description..." rows="3" value={contentForm.desc} onChange={e => setContentForm({...contentForm, desc: e.target.value})} />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded-lg font-bold opacity-60">Cancel</button>
              <button onClick={handleUpdateContent} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ADD THIS AT THE BOTTOM OF THE MAIN DIV */}
      {/* <NoteloomAi 
        contextData={{
          classroomName: state?.subjectName || "this Class", // Uses route state if available
          classroomId: id,
          role: userRole
        }} 
      /> */}

    </div>
  );
};

export default ClassroomView;