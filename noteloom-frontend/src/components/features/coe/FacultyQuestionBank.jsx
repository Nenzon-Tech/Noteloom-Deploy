
import { API_BASE } from '@/utils/config';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, FileText, Trash2, Search, BookOpen, 
  ChevronRight, ArrowLeft, Wifi, Layers, GraduationCap,
  CheckCircle, Filter, Eye, Download, File
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useSessionManager } from '@/hooks/useSessionManager.js';
import GlassHeader from '@/components/common/GlassHeader.jsx';
import UserProfileDropdown from '@/components/common/UserProfileDropdown.jsx';
import ThemeToggle from '@/components/common/ThemeToggle.jsx';
import CollegeBannerLogo from '@/components/common/CollegeBannerLogo.jsx';
import ModernPdfViewer from '@/components/common/ModernPDFViewer';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const FacultyQuestionBank = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { user, profile } = useSessionManager();

  // Data State
  const [departments, setDepartments] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // Selection State
  const [selectedDept, setSelectedDept] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState('');

  const [viewFile, setViewFile] = useState(null); 
  const [title, setTitle] = useState('');         

  // Form State
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    category: '2_marks'
  });

  const [file, setFile] = useState(null);

  const userRoleDisplay = profile?.role 
    ? profile.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) 
    : 'Faculty';

  useEffect(() => {
    if (user || localStorage.getItem('sessionToken')) {
      fetchInitialData();
    }
  }, [user]);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('sessionToken');
      if (!token) return;

      const [deptRes, qRes] = await Promise.all([
        axios.get(`${API_BASE}/api/departments`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE}/api/coe/questions?facultyId=${user?._id}`, {
             headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setDepartments(deptRes.data);
      setQuestions(qRes.data);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeptChange = async (deptId) => {
    setSelectedDept(deptId);
    setSubjectId('');
    setSubjects([]);

    if (!deptId) return;

    try {
      const token = localStorage.getItem('sessionToken');
      const response = await axios.get(
        `${API_BASE}/api/departments/${deptId}/subjects`, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSubjects(response.data);
    } catch (err) {
      console.error("Failed to fetch department subjects", err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file || !subjectId || !title) { 
        alert('Please fill all fields: Title, Subject, and File');
        return;
    }

    const data = new FormData();
    data.append('facultyId', user.id || user._id);
    data.append('facultyName', user.name); 
    data.append('title', title); 
    data.append('subjectId', subjectId);
    data.append('year', formData.year);
    data.append('category', formData.category);
    data.append('file', file);

    try {
        const token = localStorage.getItem('sessionToken');
        await axios.post(`${API_BASE}/api/coe/upload-question`, data, {
        headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
        }
        });

        alert('Question uploaded successfully');
        setFile(null);
        setTitle(''); 
        setSubjectId('');
        fetchInitialData(); 
    } catch (err) {
        alert('Upload failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      await axios.delete(`${API_BASE}/api/coe/question/${id}`);
      fetchInitialData();
    }
  };

  // --- THEME & STYLES (Optimized for Dark Mode) ---
  const theme = {
    bg: isDarkMode ? 'bg-[#0f172a]' : 'bg-slate-50', 
    // Dark mode cards get a subtle border and lighter background for depth
    card: isDarkMode ? 'bg-[#1e293b] border-slate-700 shadow-lg shadow-black/20' : 'bg-white border-blue-100 shadow-sm',
    text: isDarkMode ? 'text-slate-100' : 'text-slate-800',
    subText: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    // Inputs in dark mode are darker than the card to look "inset"
    input: isDarkMode ? 'bg-[#0f172a] border-slate-700 text-white focus:border-blue-500 placeholder-slate-500' : 'bg-slate-50 border-blue-200 text-slate-800 focus:border-blue-500',
    accentGradient: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    iconColor: isDarkMode ? 'text-blue-400' : 'text-blue-600'
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme.bg}`}>

      {/* PDF Viewer Modal */}
      {viewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full h-full max-w-6xl bg-white rounded-xl overflow-hidden relative shadow-2xl">
            <button 
                onClick={() => setViewFile(null)}
                className="absolute top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-red-600 transition-transform hover:scale-105"
            >
                Close
            </button>
            <ModernPdfViewer fileUrl={`${API_BASE}${viewFile}`} />
            </div>
        </div>
      )}
      
      {/* ================= HEADER ================= */}
      <GlassHeader variant="dashboard">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate(-1)} 
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-blue-100 text-blue-600'}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <UserProfileDropdown user={user} onOptionClick={() => {}} />

            <div className="flex flex-col">
              <div className={`flex items-center text-sm font-bold ${theme.text}`}>
                <span className="opacity-70">{userRoleDisplay} Dashboard</span>
                <ChevronRight className="w-4 h-4 mx-1 opacity-50" />
                <span className="text-blue-500">COE Question Bank</span>
              </div>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                  {profile?.college || 'College'}
                </span>
                <span className="text-[10px] text-emerald-500 flex items-center">
                  <Wifi className="w-3 h-3 mr-1" />
                  Online
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2"><CollegeBannerLogo /></div>
            <ThemeToggle />
          </div>
        </div>
      </GlassHeader>

      {/* ================= BODY ================= */}
      <div className="pt-28 pb-12 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- UPLOAD SECTION (Left) --- */}
          <div className="lg:col-span-4 space-y-6">
            <div className={`p-6 rounded-2xl border shadow-xl relative overflow-hidden backdrop-blur-sm ${theme.card}`}>
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

              <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${theme.text}`}>
                <div className={`p-2 rounded-lg ${theme.accentGradient} text-white shadow-lg shadow-blue-500/20`}>
                    <Upload className="w-4 h-4" />
                </div>
                Upload Question
              </h2>

              <form onSubmit={handleUpload} className="space-y-5 relative z-10">

                <div>
                    <label className={`text-xs font-bold uppercase tracking-wider opacity-70 mb-1 block ${theme.subText}`}>Title</label>
                    <input 
                    type="text" 
                    placeholder="e.g. End Sem Question 2025"
                    className={`w-full p-3.5 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${theme.input}`}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    />
                </div>
                
                {/* 1. Department */}
                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider opacity-70 mb-1 block ${theme.subText}`}>Department</label>
                  <div className="relative">
                    <select
                      className={`w-full p-3.5 rounded-xl border appearance-none outline-none focus:ring-2 focus:ring-blue-500 transition-all ${theme.input}`}
                      value={selectedDept}
                      onChange={(e) => handleDeptChange(e.target.value)}
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map(d => (
                        <option key={d._id} value={d._id}>
                            {d.name} {d.code ? `(${d.code})` : ''}
                        </option>
                      ))}
                    </select>

                    <BookOpen className={`absolute right-3.5 top-4 w-4 h-4 opacity-40 pointer-events-none ${theme.iconColor}`} />
                  </div>
                </div>

                {/* 3. Subject Dropdown */}
                <div>
                    <label className={`text-xs font-bold uppercase tracking-wider opacity-70 mb-1 block ${theme.subText}`}>
                        Subject
                    </label>
                    <div className="relative">
                        <select
                        className={`w-full p-3.5 rounded-xl border appearance-none outline-none focus:ring-2 focus:ring-blue-500 transition-all ${theme.input}`}
                        value={subjectId}
                        onChange={(e) => setSubjectId(e.target.value)}
                        disabled={!selectedDept || subjects.length === 0}
                        required
                        >
                        <option value="">
                            {subjects.length === 0 && selectedDept ? "No subjects found" : "Select Subject"}
                        </option>
                        
                        {subjects.map(sub => (
                            <option key={sub._id} value={sub._id}>
                            {sub.name} ({sub.code})
                            </option>
                        ))}
                        </select>
                        <GraduationCap className={`absolute right-3.5 top-4 w-4 h-4 opacity-40 pointer-events-none ${theme.iconColor}`} />
                    </div>
                </div>

                {/* 4. Year & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`text-xs font-bold uppercase tracking-wider opacity-70 mb-1 block ${theme.subText}`}>Year</label>
                    <input 
                      type="number" 
                      className={`w-full p-3.5 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 ${theme.input}`}
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className={`text-xs font-bold uppercase tracking-wider opacity-70 mb-1 block ${theme.subText}`}>Category</label>
                    <select 
                      className={`w-full p-3.5 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 ${theme.input}`}
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="2_marks">2 Marks</option>
                      <option value="5_marks">5 Marks</option>
                      <option value="10_marks">10 Marks</option>
                    </select>
                  </div>
                </div>

                {/* 5. File Upload */}
                <div className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all group ${
                  file ? 'border-emerald-500 bg-emerald-500/10' : 
                  isDarkMode ? 'border-slate-700 hover:border-blue-500 hover:bg-slate-800' : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50'
                }`}>
                  <input type="file" id="fileUpload" accept=".pdf,.docx,.doc" onChange={(e) => setFile(e.target.files[0])} className="hidden" required />
                  <label htmlFor="fileUpload" className="cursor-pointer w-full h-full block">
                    {file ? (
                      <div>
                        <CheckCircle className="w-8 h-8 mx-auto text-emerald-500 mb-2"/>
                        <p className="text-sm font-bold text-emerald-600 truncate">{file.name}</p>
                      </div>
                    ) : (
                      <div>
                        <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${isDarkMode ? 'bg-slate-800' : 'bg-blue-100'}`}>
                            <Upload className={`w-6 h-6 ${theme.iconColor}`}/>
                        </div>
                        <p className={`text-sm font-medium ${theme.subText}`}>Drop PDF/DOCX here</p>
                      </div>
                    )}
                  </label>
                </div>

                <button 
                  type="submit" 
                  className={`w-full py-4 rounded-xl ${theme.accentGradient} text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all transform hover:-translate-y-0.5 active:scale-95`}
                >
                  Upload Question
                </button>
              </form>
            </div>
          </div>

          {/* --- LIST SECTION (Right) --- */}
          <div className="lg:col-span-8 space-y-6">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className={`text-2xl font-bold ${theme.text}`}>COE Repository</h2>
                
                {/* --- REAL-TIME SEARCH BAR --- */}
                <div className={`relative group w-full max-w-sm ${theme.input} rounded-xl shadow-sm border transition-all focus-within:ring-2 focus-within:ring-blue-500/20`}>
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none opacity-50">
                       <Search className="h-4 w-4" />
                   </div>
                   <input
                       type="text"
                       className="block w-full pl-10 pr-3 py-3 bg-transparent rounded-xl outline-none placeholder-opacity-50 text-sm font-medium"
                       placeholder="Search title, subject..."
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                   />
                </div>
             </div>

             {loading ? (
                <div className="text-center py-20">
                   <LoadingSpinner />
                </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 {questions.map((q) => {
                    // Logic to detect file type
                    const isPdf = q.fileUrl?.toLowerCase().endsWith('.pdf');
                    
                    // --- SEARCH & HIGHLIGHT LOGIC ---
                    const isMatch = searchTerm ? (
                        (q.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (q.subjectName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (q.subjectCode?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (q.year?.toString().includes(searchTerm))
                    ) : true;

                    // --- STYLING LOGIC ---
                    const searchStyle = searchTerm 
                        ? (isMatch 
                            ? 'scale-[1.02] shadow-2xl ring-2 ring-blue-500/50 z-10' 
                            : 'opacity-30 blur-[2px] grayscale scale-95 pointer-events-none'
                          ) 
                        : '';

                    return (
                        <div key={q._id} className={`group relative p-5 rounded-2xl border transition-all duration-300 hover:shadow-xl ${searchStyle} ${theme.card} hover:-translate-y-1`}>
                            <div className="flex justify-between items-start">
                            <div className="flex items-start gap-4">
                                {/* Icon Box */}
                                <div className={`p-4 rounded-xl shrink-0 ${
                                    isPdf 
                                    ? (isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600') 
                                    : (isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600')
                                }`}>
                                    {isPdf ? <FileText className="w-6 h-6"/> : <File className="w-6 h-6"/>}
                                </div>

                                {/* Text Details */}
                                <div>
                                <h3 className={`font-bold text-lg leading-tight mb-1 ${theme.text}`}>{q.title}</h3>
                                
                                <p className={`text-sm ${theme.subText}`}>
                                    {q.subjectName} ({q.subjectCode})
                                </p>
                                
                                <div className="flex flex-wrap items-center gap-2 mt-3">
                                    <span className={`text-[10px] px-2.5 py-1 rounded-md font-medium border ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                                    {q.year}
                                    </span>
                                    <span className={`text-[10px] px-2.5 py-1 rounded-md border uppercase font-bold tracking-wide ${isDarkMode ? 'bg-teal-900/30 border-teal-800 text-teal-400' : 'bg-teal-50 border-teal-200 text-teal-700'}`}>
                                    {q.category.replace('_', ' ')}
                                    </span>
                                </div>
                                </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2">
                                {isPdf ? (
                                    <button 
                                        onClick={() => {
                                            const fullPath = `${API_BASE}${q.fileUrl}`;
                                            window.open(`/pdf-viewer?file=${encodeURIComponent(fullPath)}`, '_blank');
                                        }}
                                        className={`p-2 rounded-lg transition-colors flex items-center justify-center ${isDarkMode ? 'text-blue-400 hover:bg-blue-500/20' : 'text-blue-600 hover:bg-blue-50'}`}
                                        title="View PDF"
                                    >
                                        <Eye className="w-5 h-5"/>
                                    </button>
                                ) : (
                                    <a 
                                        href={q.fileUrl} 
                                        download
                                        className={`p-2 rounded-lg transition-colors flex items-center justify-center ${isDarkMode ? 'text-green-400 hover:bg-green-500/20' : 'text-green-600 hover:bg-green-50'}`}
                                        title="Download Document"
                                    >
                                        <Download className="w-5 h-5"/>
                                    </a>
                                )}

                                <button 
                                    onClick={() => handleDelete(q._id)}
                                    className={`p-2 rounded-lg transition-colors flex items-center justify-center ${isDarkMode ? 'text-rose-400 hover:bg-rose-500/20' : 'text-rose-500 hover:bg-rose-50'}`}
                                    title="Delete File"
                                >
                                    <Trash2 className="w-5 h-5"/>
                                </button>
                            </div>
                            </div>
                        </div>
                    );
                 })}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyQuestionBank;