import { API_BASE } from '@/utils/config';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Wifi, ChevronRight, FileText, Trash2, Filter, Search, Download, Upload,
  File, Calendar, Eye, X, BookOpen, Layers, Users, ClipboardList, PenTool, Plus, CreditCard,
  Printer, UserCheck, Settings
} from 'lucide-react';

// Common Components
import { useTheme } from '@/context/ThemeContext.jsx';
import { useSessionManager } from '@/hooks/useSessionManager.js';
import GlassHeader from '@/components/common/GlassHeader.jsx';
import UserProfileDropdown from '@/components/common/UserProfileDropdown.jsx';
import ThemeToggle from '@/components/common/ThemeToggle.jsx';
import CollegeBannerLogo from '@/components/common/CollegeBannerLogo.jsx';
import ModernPdfViewer from '@/components/common/ModernPDFViewer';
// Add this line with your other imports
import { useErrorPopup } from '@/context/ErrorPopupContext.jsx';



// ==========================================
// 1. SUB-COMPONENTS (Feature Modules)
// ==========================================

// ==========================================
// A. SESSION MANAGER (Matches Specific Design)
// ==========================================
// --- A. SESSION MANAGER (Admin Only) ---
const SessionManager = ({ isDarkMode }) => {
    const [view, setView] = useState('list'); // 'list' | 'create' | 'edit'
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // 1. Initialize the Popup Hook
    const { triggerPopup } = useErrorPopup();
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({ 
        sessionName: '', applicability: 'Semester', cycle: 'Odd', 
        regularFee: 1200, backlogFee: 500 
    });
    const [editingId, setEditingId] = useState(null);

    // --- Data Fetching ---
    const fetchSessions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('sessionToken');
            const res = await axios.get(`${API_BASE}/api/coe/sessions/all`, { headers: { Authorization: `Bearer ${token}` } });
            setSessions(res.data);
        } catch (e) { 
            console.error(e); 
            triggerPopup("Failed to load sessions", "error");
        }
        setLoading(false);
    };

    useEffect(() => { fetchSessions(); }, []);

    // --- Handlers ---
    const handleEdit = (session) => {
        setFormData({
            sessionName: session.sessionName,
            applicability: session.applicability,
            cycle: session.cycle,
            regularFee: session.fees.regular,
            backlogFee: session.fees.backlogPerTerm
        });
        setEditingId(session._id);
        setView('edit');
    };

    const handleStatusChange = async (id, action) => {
        if (!confirm(`Are you sure you want to ${action} this session?`)) return;
        try {
            const token = localStorage.getItem('sessionToken');
            await axios.put(`${API_BASE}/api/coe/session/${id}`, { action }, { headers: { Authorization: `Bearer ${token}` } });
            
            triggerPopup(`Session ${action}d successfully`, "success"); // Success Toast
            fetchSessions();
        } catch (e) { 
            triggerPopup(e.response?.data?.error || "Action failed", "error"); // Error Toast
        }
    };

    const handleSubmit = async () => {
        // Validation Toast
        if (!formData.sessionName) return triggerPopup("Session Name is required", "error");
        
        setIsSubmitting(true);
        
        const payload = {
            sessionName: formData.sessionName,
            applicability: formData.applicability,
            cycle: formData.cycle,
            fees: { regular: Number(formData.regularFee), backlogPerTerm: Number(formData.backlogFee) },
            isActive: true // Activate by default on create/update if intended
        };
        const token = localStorage.getItem('sessionToken');

        try {
            if (view === 'edit') {
                await axios.put(`${API_BASE}/api/coe/session/${editingId}`, { action: 'edit', updates: payload }, { headers: { Authorization: `Bearer ${token}` } });
                triggerPopup("Session Updated Successfully!", "success"); // Success Toast
            } else {
                await axios.post(`${API_BASE}/api/coe/session`, payload, { headers: { Authorization: `Bearer ${token}` } });
                triggerPopup("Session Created & Activated!", "success"); // Success Toast
            }
            
            // Reset Form
            setFormData({ sessionName: '', applicability: 'Semester', cycle: 'Odd', regularFee: 1200, backlogFee: 500 });
            setView('list');
            fetchSessions();
        } catch (e) { 
            console.error(e);
            triggerPopup(e.response?.data?.error || "Operation Failed", "error"); // Error Toast
        }
        setIsSubmitting(false);
    };

    // --- RENDER ---
    return (
      <div className={`p-8 rounded-3xl border shadow-sm transition-all animate-fade-in ${isDarkMode ? 'bg-gray-800/50 border-gray-700 backdrop-blur-sm' : 'bg-white border-gray-200 shadow-gray-200/50'}`}>
        
        {/* Header (Always Visible) */}
        <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl shadow-inner ${isDarkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-gradient-to-br from-purple-100 to-indigo-50 text-purple-600'}`}>
                    <Calendar className="w-8 h-8"/>
                </div>
                <div>
                    <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Exam Session Control</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Launch new examination cycles, define audience, and set fee structures.
                    </p>
                </div>
            </div>
            {view === 'list' ? (
                <button 
                    onClick={() => setView('create')} 
                    className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-purple-500/30 transition-all flex items-center gap-2"
                >
                    <Plus size={18}/> New Session
                </button>
            ) : (
                <button onClick={() => setView('list')} className="text-sm font-bold opacity-60 hover:opacity-100 px-4 py-2">
                    Cancel
                </button>
            )}
        </div>

        {/* VIEW 1: LIST OF SESSIONS */}
        {view === 'list' && (
            <div className="space-y-4">
                {sessions.length === 0 && <div className="text-center py-10 opacity-50 border-2 border-dashed rounded-2xl">No sessions found. Create one to begin.</div>}
                
                {sessions.map(sess => (
                    <div key={sess._id} className={`p-5 rounded-2xl border flex flex-col md:flex-row justify-between items-center gap-4 transition-all ${isDarkMode ? 'bg-gray-900/50 border-gray-700 hover:bg-gray-900' : 'bg-white border-gray-200 hover:shadow-md'}`}>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h4 className={`font-bold text-lg ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{sess.sessionName}</h4>
                                {sess.isActive ? (
                                    <span className="flex items-center gap-1 text-[10px] bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded-full font-bold">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> ACTIVE
                                    </span>
                                ) : sess.isArchived ? (
                                    <span className="text-[10px] bg-gray-500/10 text-gray-500 border border-gray-500/20 px-2 py-0.5 rounded-full font-bold">ARCHIVED</span>
                                ) : (
                                    <span className="text-[10px] bg-orange-500/10 text-orange-500 border border-orange-500/20 px-2 py-0.5 rounded-full font-bold">INACTIVE</span>
                                )}
                            </div>
                            <div className="text-xs opacity-60 flex gap-4">
                                <span className="flex items-center gap-1"><Layers size={12}/> {sess.applicability} ({sess.cycle})</span>
                                <span className="flex items-center gap-1"><ClipboardList size={12}/> Reg: ₹{sess.fees?.regular} | Back: ₹{sess.fees?.backlogPerTerm}</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(sess)} className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors" title="Edit Configuration"><PenTool size={16}/></button>
                            {sess.isActive ? (
                                <button onClick={() => handleStatusChange(sess._id, 'deactivate')} className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors" title="Deactivate Session"><X size={16}/></button>
                            ) : (
                                <button onClick={() => handleStatusChange(sess._id, 'activate')} className="p-2.5 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-colors" title="Activate Session"><CheckCircle size={16}/></button>
                            )}
                            <button onClick={() => handleStatusChange(sess._id, 'archive')} className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors" title="Archive"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* VIEW 2: CREATE / EDIT FORM (Exact UI Match) */}
        {view !== 'list' && (
            <div className="animate-fade-in-up">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    
                    {/* Card 1: Scope & Applicability */}
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-900/30 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <h4 className="text-sm font-bold uppercase tracking-wider mb-6 opacity-70 flex items-center gap-2">
                            <Layers className="w-4 h-4"/> Scope & Applicability
                        </h4>
                        
                        <div className="space-y-5">
                            <div>
                                <label className={`block text-xs font-bold mb-2 ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Session Title</label>
                                <input 
                                    className={`w-full p-4 rounded-xl border outline-none font-medium transition-all focus:ring-2 focus:ring-purple-500/50 ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`} 
                                    placeholder="e.g. Winter Examination 2025" 
                                    value={formData.sessionName}
                                    onChange={e => setFormData({...formData, sessionName: e.target.value})} 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-xs font-bold mb-2 ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Stream Type</label>
                                    <div className="relative">
                                        <select 
                                            className={`w-full p-4 rounded-xl border appearance-none outline-none font-medium cursor-pointer ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`} 
                                            value={formData.applicability}
                                            onChange={e => setFormData({...formData, applicability: e.target.value})}
                                        >
                                            <option value="Semester">Semester Only</option>
                                            <option value="Trimester">Trimester Only</option>
                                            <option value="Both">Both</option>
                                        </select>
                                        <ChevronRight className="w-4 h-4 absolute right-4 top-5 opacity-50 rotate-90 pointer-events-none"/>
                                    </div>
                                </div>
                                <div>
                                    <label className={`block text-xs font-bold mb-2 ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Academic Cycle</label>
                                    <div className="relative">
                                        <select 
                                            className={`w-full p-4 rounded-xl border appearance-none outline-none font-medium cursor-pointer ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`} 
                                            value={formData.cycle}
                                            onChange={e => setFormData({...formData, cycle: e.target.value})}
                                        >
                                            <option value="Odd">Odd Cycle (1, 3, 5...)</option>
                                            <option value="Even">Even Cycle (2, 4, 6...)</option>
                                            <option value="Both">Both Cycles</option>
                                        </select>
                                        <ChevronRight className="w-4 h-4 absolute right-4 top-5 opacity-50 rotate-90 pointer-events-none"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Fee Configuration */}
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-900/30 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <h4 className="text-sm font-bold uppercase tracking-wider mb-6 opacity-70 flex items-center gap-2">
                            <ClipboardList className="w-4 h-4"/> Fee Configuration
                        </h4>

                        <div className="space-y-5">
                            <div>
                                <label className={`block text-xs font-bold mb-2 ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Regular Student Fee <span className="opacity-50 font-normal">(Fixed Amount)</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-4 opacity-50 font-bold">₹</span>
                                    <input 
                                        type="number" 
                                        className={`w-full p-4 pl-8 rounded-xl border outline-none font-bold font-mono ${isDarkMode ? 'bg-gray-800 border-gray-600 text-emerald-400' : 'bg-white border-gray-300 text-emerald-600'}`} 
                                        value={formData.regularFee}
                                        onChange={e => setFormData({...formData, regularFee: e.target.value})} 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`block text-xs font-bold mb-2 ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Backlog Fee <span className="opacity-50 font-normal">(Per Semester/Trimester)</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-4 opacity-50 font-bold">₹</span>
                                    <input 
                                        type="number" 
                                        className={`w-full p-4 pl-8 rounded-xl border outline-none font-bold font-mono ${isDarkMode ? 'bg-gray-800 border-gray-600 text-orange-400' : 'bg-white border-gray-300 text-orange-600'}`} 
                                        value={formData.backlogFee}
                                        onChange={e => setFormData({...formData, backlogFee: e.target.value})} 
                                    />
                                </div>
                                <p className="text-[10px] mt-2 opacity-60 font-mono">
                                    * Fee logic: Backlog Fee × Number of Failed Terms
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="flex justify-end">
                    <button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting}
                        className={`bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-purple-500/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {view === 'edit' ? 'Update Session' : 'Activate & Open Exam Forms'} 
                        <ChevronRight className="w-5 h-5"/>
                    </button>
                </div>
            </div>
        )}
      </div>
    );
};

// --- B. MARKS MANAGER (Shared) ---
const MarksManager = ({ isDarkMode }) => {
    const { triggerPopup } = useErrorPopup();
    const [departments, setDepartments] = useState([]);
    const [batches, setBatches] = useState([]);
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedBatchId, setSelectedBatchId] = useState('');
    const [selectedSubjectCode, setSelectedSubjectCode] = useState('');
    
    const [studentMarks, setStudentMarks] = useState({}); // { [studentId]: { marks: '', total: 100 } }
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load departments on mount
    useEffect(() => {
        const fetchDepts = async () => {
            const token = localStorage.getItem('sessionToken');
            try {
                const res = await axios.get(`${API_BASE}/api/departments`, { headers: { Authorization: `Bearer ${token}` } });
                setDepartments(res.data);
            } catch (err) { console.error(err); }
        };
        fetchDepts();
    }, []);

    const handleDeptChange = async (deptId) => {
        setSelectedDept(deptId);
        setSelectedBatchId('');
        setSelectedSubjectCode('');
        setStudents([]);
        setSubjects([]);
        setStudentMarks({});
        
        if (!deptId) return;

        try {
            const token = localStorage.getItem('sessionToken');
            const subRes = await axios.get(`${API_BASE}/api/departments/${deptId}/subjects`, { headers: { Authorization: `Bearer ${token}` } });
            setSubjects(subRes.data.filter(s => s.isActive));

            const batchRes = await axios.get(`${API_BASE}/api/batches`, { headers: { Authorization: `Bearer ${token}` } });
            setBatches(batchRes.data.filter(b => b.departmentId?._id === deptId && !b.isAlumni));
        } catch (err) { 
            triggerPopup("Error loading department data", "error");
        }
    };

    const handleBatchChange = async (batchId) => {
        setSelectedBatchId(batchId);
        setSelectedSubjectCode('');
        setStudents([]);
        setStudentMarks({});
        if (!batchId) return;

        setIsLoading(true);
        try {
            const token = localStorage.getItem('sessionToken');
            const res = await axios.get(`${API_BASE}/api/batches/${batchId}/students`, { headers: { Authorization: `Bearer ${token}` } });
            setStudents(res.data);
            
            // Initialize empty marks
            const initialMarks = {};
            res.data.forEach(s => {
                initialMarks[s._id] = { marks: '', total: 100 };
            });
            setStudentMarks(initialMarks);
        } catch (err) { 
            triggerPopup("Error loading batch students", "error");
        }
        setIsLoading(false);
    };

    const handleMarkChange = (studentId, field, value) => {
        setStudentMarks(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value === '' ? '' : Number(value)
            }
        }));
    };

    // CSV Template Download
    const downloadCSVTemplate = () => {
        if (students.length === 0) return;
        let csvContent = "data:text/csv;charset=utf-8,Roll Number,Student Name,Marks Obtained,Total Marks\n";
        students.forEach(s => {
            csvContent += `"${s.rollNo || s.username || ''}","${s.name || ''}",,100\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Marks_Template_${selectedSubjectCode || 'Subject'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // CSV Parser
    const handleCSVUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const lines = text.split('\n');
            const parsedResults = {};
            
            lines.forEach((line, index) => {
                if (index === 0) return; // skip header
                const parts = line.split(',');
                if (parts.length >= 2) {
                    const rollNo = parts[0].replace(/"/g, '').trim();
                    const marksVal = parts[2] ? parts[2].replace(/"/g, '').trim() : '';
                    const totalVal = parts[3] ? parts[3].replace(/"/g, '').trim() : '100';
                    
                    if (rollNo) {
                        parsedResults[rollNo] = {
                            marks: marksVal === '' ? '' : parseFloat(marksVal),
                            total: isNaN(parseFloat(totalVal)) ? 100 : parseFloat(totalVal)
                        };
                    }
                }
            });

            // Apply to students
            setStudentMarks(prev => {
                const updated = { ...prev };
                students.forEach(s => {
                    const studentRoll = s.rollNo || s.username;
                    if (parsedResults[studentRoll]) {
                        updated[s._id] = {
                            marks: parsedResults[studentRoll].marks,
                            total: parsedResults[studentRoll].total
                        };
                    }
                });
                return updated;
            });
            triggerPopup("CSV parsed successfully! Check the values below before saving.", "success");
        };
        reader.readAsText(file);
    };

    const handleSave = async () => {
        if (!selectedBatchId || !selectedSubjectCode) return;
        
        // Validate marks
        const results = [];
        let hasError = false;
        
        for (const s of students) {
            const entry = studentMarks[s._id];
            if (!entry || entry.marks === '' || isNaN(entry.marks)) {
                triggerPopup(`Please enter valid marks for ${s.name}`, "error");
                hasError = true;
                break;
            }
            if (entry.marks < 0 || entry.marks > entry.total) {
                triggerPopup(`Marks for ${s.name} must be between 0 and ${entry.total}`, "error");
                hasError = true;
                break;
            }
            results.push({
                rollNo: s.rollNo || s.username,
                marks: entry.marks,
                total: entry.total
            });
        }

        if (hasError) return;

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('sessionToken');
            const batchObj = batches.find(b => b._id === selectedBatchId);
            
            const payload = {
                batch: selectedBatchId,
                semester: batchObj?.currentTerm || 1,
                subjectCode: selectedSubjectCode,
                results
            };

            await axios.post(`${API_BASE}/api/coe/upload-marks`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            triggerPopup("Marks saved and uploaded successfully!", "success");
        } catch (e) {
            console.error(e);
            triggerPopup(e.response?.data?.error || "Failed to upload marks", "error");
        }
        setIsSubmitting(false);
    };

    // Filter subjects by batch currentTerm
    const selectedBatchObj = batches.find(b => b._id === selectedBatchId);
    const filteredSubjects = subjects.filter(s => s.semester === (selectedBatchObj?.currentTerm || 0));

    return (
        <div className={`p-8 rounded-3xl shadow-sm border animate-fade-in ${isDarkMode ? 'bg-gray-800/50 border-gray-700 backdrop-blur-sm' : 'bg-white border-gray-200 shadow-gray-200/50'}`}>
            <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}><PenTool className="w-6 h-6"/></div>
                <div>
                    <h3 className="text-xl font-bold">Marks Entry</h3>
                    <p className="text-sm opacity-60">Enter student marks manually or upload CSV. Draft marks must be published by COE Admin.</p>
                </div>
            </div>

            {/* SELECTION ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Department Dropdown */}
                <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Department</label>
                    <div className="relative">
                        <select 
                            className={`w-full p-4 pr-10 rounded-xl border appearance-none outline-none font-medium cursor-pointer transition-all ${isDarkMode ? 'bg-gray-900/50 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                            value={selectedDept}
                            onChange={(e) => handleDeptChange(e.target.value)}
                        >
                            <option value="">Select Department</option>
                            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                        </select>
                        <ChevronRight className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 opacity-50 rotate-90 pointer-events-none text-gray-500"/>
                    </div>
                </div>

                {/* Batch Dropdown */}
                <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Batch</label>
                    <div className="relative">
                        <select 
                            className={`w-full p-4 pr-10 rounded-xl border appearance-none outline-none font-medium cursor-pointer transition-all ${isDarkMode ? 'bg-gray-900/50 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                            value={selectedBatchId}
                            onChange={(e) => handleBatchChange(e.target.value)}
                            disabled={!selectedDept}
                        >
                            <option value="">Select Batch</option>
                            {batches.map(b => (
                                <option key={b._id} value={b._id}>
                                    {b.batchName} (Term {b.currentTerm})
                                </option>
                            ))}
                        </select>
                        <ChevronRight className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 opacity-50 rotate-90 pointer-events-none text-gray-500"/>
                    </div>
                </div>

                {/* Subject Dropdown */}
                <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Subject</label>
                    <div className="relative">
                        <select 
                            className={`w-full p-4 pr-10 rounded-xl border appearance-none outline-none font-medium cursor-pointer transition-all ${isDarkMode ? 'bg-gray-900/50 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                            value={selectedSubjectCode}
                            onChange={(e) => setSelectedSubjectCode(e.target.value)}
                            disabled={!selectedBatchId}
                        >
                            <option value="">Select Subject</option>
                            {filteredSubjects.map(s => (
                                <option key={s._id} value={s.code}>
                                    {s.code} - {s.name}
                                </option>
                            ))}
                        </select>
                        <ChevronRight className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 opacity-50 rotate-90 pointer-events-none text-gray-500"/>
                    </div>
                </div>
            </div>

            {/* MARKS ENTRY AREA */}
            {!selectedSubjectCode ? (
                <div className="text-center py-20 opacity-50 border-2 border-dashed rounded-3xl">
                    <PenTool className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-pulse"/>
                    <h4 className="text-lg font-bold">Configure Selections</h4>
                    <p className="text-sm mt-1">Please select Department, Batch, and Subject to start entering marks.</p>
                </div>
            ) : isLoading ? (
                <div className="text-center py-20 opacity-50">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm">Loading student records...</p>
                </div>
            ) : (
                <div className="animate-fade-in space-y-6">
                    {/* CSV Upload / Template Controls */}
                    <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row justify-between items-center gap-4 ${isDarkMode ? 'bg-gray-900/30 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <div>
                            <h4 className="font-bold text-sm">CSV Operations</h4>
                            <p className="text-xs opacity-60 mt-0.5">Upload a pre-filled CSV or download a blank template.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={downloadCSVTemplate}
                                className={`px-4 py-2 text-xs rounded-xl font-bold border transition-colors ${isDarkMode ? 'border-gray-600 hover:bg-gray-800 text-gray-300' : 'border-gray-300 hover:bg-white hover:shadow-sm text-gray-700'}`}
                            >
                                <Download size={14} className="inline mr-1" /> Template
                            </button>
                            <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1">
                                <Upload size={14} /> Upload CSV
                                <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
                            </label>
                        </div>
                    </div>

                    {/* Students Marks List */}
                    <div className="border rounded-2xl overflow-hidden divide-y divide-gray-200 dark:divide-gray-700 dark:border-gray-700">
                        <div className={`p-4 font-bold text-xs uppercase tracking-wider grid grid-cols-12 gap-4 ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                            <span className="col-span-5 sm:col-span-6">Student details</span>
                            <span className="col-span-4 sm:col-span-3 text-center">Marks Obtained</span>
                            <span className="col-span-3 text-center">Total Marks</span>
                        </div>

                        {students.map(s => {
                            const entry = studentMarks[s._id] || { marks: '', total: 100 };
                            return (
                                <div key={s._id} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                    <div className="col-span-5 sm:col-span-6 min-w-0">
                                        <h5 className="font-bold text-sm truncate">{s.name}</h5>
                                        <p className="text-xs opacity-50 font-mono mt-0.5 truncate">{s.rollNo || s.username}</p>
                                    </div>
                                    <div className="col-span-4 sm:col-span-3 flex justify-center">
                                        <input 
                                            type="number" 
                                            min="0"
                                            max={entry.total}
                                            placeholder="Marks"
                                            value={entry.marks}
                                            onChange={e => handleMarkChange(s._id, 'marks', e.target.value)}
                                            className={`w-24 p-2 rounded-lg border text-center outline-none focus:ring-2 focus:ring-blue-500/50 font-bold ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                                        />
                                    </div>
                                    <div className="col-span-3 flex justify-center">
                                        <input 
                                            type="number" 
                                            min="1"
                                            placeholder="Total"
                                            value={entry.total}
                                            onChange={e => handleMarkChange(s._id, 'total', e.target.value)}
                                            className={`w-20 p-2 rounded-lg border text-center outline-none focus:ring-2 focus:ring-blue-500/50 font-medium ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                                        />
                                    </div>
                                </div>
                            );
                        })}

                        {students.length === 0 && (
                            <div className="text-center py-10 opacity-50">No students enrolled in this batch.</div>
                        )}
                    </div>

                    {/* Actions footer */}
                    {students.length > 0 && (
                        <div className="flex justify-end pt-4">
                            <button 
                                onClick={handleSave}
                                disabled={isSubmitting}
                                className={`bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:scale-[1.01] active:scale-95 transition-all flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        Save & Upload Marks
                                        <ChevronRight size={18}/>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ==========================================
// REPLACE THE EXISTING SubjectAllocator COMPONENT
// ==========================================

const SubjectAllocator = ({ isDarkMode }) => {
    // --- STATE ---
    // Data
    const [departments, setDepartments] = useState([]);
    const [batches, setBatches] = useState([]);
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]); // All subjects for the dept
    
    // Selection & View State
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedBatch, setSelectedBatch] = useState(null); // Stores full batch object
    const [view, setView] = useState('list'); // 'list' (Batch View) or 'detail' (Student View)
    const [focusedStudent, setFocusedStudent] = useState(null);
    
    // Mappings
    const [batchDefaultSubjects, setBatchDefaultSubjects] = useState([]); // IDs for bulk assign
    const [studentMappings, setStudentMappings] = useState({}); // { "1": [SubA, SubB], "2": [...] } (Key is Semester)

    const [isLoading, setIsLoading] = useState(false);

    // --- INITIAL DATA FETCHING ---
    useEffect(() => {
        const fetchDepts = async () => {
            const token = localStorage.getItem('sessionToken');
            try {
                const res = await axios.get(`${API_BASE}/api/departments`, { headers: { Authorization: `Bearer ${token}` } });
                setDepartments(res.data);
            } catch (err) { console.error(err); }
        };
        fetchDepts();
    }, []);

    // --- HANDLERS ---

    const handleDeptChange = async (deptId) => {
        setSelectedDept(deptId);
        setSelectedBatch(null);
        setStudents([]);
        setBatchDefaultSubjects([]);
        
        if (!deptId) return;

        try {
            const token = localStorage.getItem('sessionToken');
            // 1. Fetch Subjects (All semesters)
            const subRes = await axios.get(`${API_BASE}/api/departments/${deptId}/subjects`, { headers: { Authorization: `Bearer ${token}` } });
            setSubjects(subRes.data.filter(s => s.isActive));

            // 2. Fetch Batches (Filter Alumni)
            const batchRes = await axios.get(`${API_BASE}/api/batches`, { headers: { Authorization: `Bearer ${token}` } });
            setBatches(batchRes.data.filter(b => b.departmentId?._id === deptId && !b.isAlumni));
        } catch (err) { alert("Error loading data"); }
    };

    const handleBatchSelect = async (batchId) => {
        const batchObj = batches.find(b => b._id === batchId);
        setSelectedBatch(batchObj);
        setBatchDefaultSubjects([]);
        if (!batchId) return;

        setIsLoading(true);
        try {
            const token = localStorage.getItem('sessionToken');
            const res = await axios.get(`${API_BASE}/api/batches/${batchId}/students`, { headers: { Authorization: `Bearer ${token}` } });
            setStudents(res.data);
        } catch (err) { console.error(err); }
        setIsLoading(false);
    };

    // --- BULK ASSIGNMENT LOGIC ---
    const handleBulkAssign = async () => {
        if (!selectedBatch || batchDefaultSubjects.length === 0) return;
        if (!window.confirm(`Assign these ${batchDefaultSubjects.length} subjects to ALL ${students.length} students in Sem ${selectedBatch.currentTerm}?`)) return;

        try {
            const token = localStorage.getItem('sessionToken');
            
            // Prepare payload: Create a mapping for every student in the batch
            const payload = students.map(s => ({
                studentId: s._id,
                subjects: batchDefaultSubjects,
                semester: selectedBatch.currentTerm // Explicitly set to current term
            }));

            await axios.post(`${API_BASE}/api/coe/allocation`, {
                batchId: selectedBatch._id,
                mappings: payload
            }, { headers: { Authorization: `Bearer ${token}` } });

            alert("Subjects assigned successfully!");
        } catch (err) { alert("Bulk assignment failed."); }
    };

    // --- STUDENT DETAIL LOGIC ---
    const openStudentDetail = async (student) => {
        setFocusedStudent(student);
        setView('detail');
        setIsLoading(true);
        try {
            const token = localStorage.getItem('sessionToken');
            // Fetch this student's history
            const res = await axios.get(`${API_BASE}/api/coe/allocation/student/${student._id}`, { headers: { Authorization: `Bearer ${token}` } });
            
            // Transform response: Backend returns { "1": [SubObj, SubObj] }, we need IDs for editing
            const formatted = {};
            Object.keys(res.data).forEach(sem => {
                formatted[sem] = res.data[sem].map(s => s._id);
            });
            setStudentMappings(formatted);
        } catch (err) { console.error(err); }
        setIsLoading(false);
    };

    const saveStudentMapping = async (semester) => {
        try {
            const token = localStorage.getItem('sessionToken');
            // Wrap in array as API expects bulk format
            const payload = [{
                studentId: focusedStudent._id,
                subjects: studentMappings[semester] || [],
                semester: parseInt(semester)
            }];

            await axios.post(`${API_BASE}/api/coe/allocation`, {
                batchId: selectedBatch._id,
                mappings: payload
            }, { headers: { Authorization: `Bearer ${token}` } });

            alert(`Saved changes for Sem ${semester}`);
        } catch(e) { alert("Save failed"); }
    };

    const toggleStudentSubject = (semester, subjectId) => {
        setStudentMappings(prev => {
            const current = prev[semester] || [];
            const updated = current.includes(subjectId) 
                ? current.filter(id => id !== subjectId) 
                : [...current, subjectId];
            return { ...prev, [semester]: updated };
        });
    };

    // --- HELPER: Detect Stream Type (Sem vs Trim) ---
    const getTermLabel = (term) => {
        if (!selectedBatch || !selectedDept) return `Sem ${term}`;
        
        // Find department and stream to check curriculum type
        const dept = departments.find(d => d._id === selectedDept);
        const stream = dept?.streams?.find(s => s.code === selectedBatch.streamCode);
        
        const type = stream?.curriculumType === 'Trimester' ? 'Trim' : 'Sem';
        return `${type} ${term}`;
    };

    // ==========================================
    // RENDER: BATCH VIEW (List)
    // ==========================================
    if (view === 'list') return (
        <div className={`p-8 rounded-3xl shadow-sm border animate-fade-in ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-pink-500/20 text-pink-400' : 'bg-pink-50 text-pink-600'}`}><Users className="w-6 h-6"/></div>
                <div>
                    <h3 className="text-xl font-bold">Subject Mapping</h3>
                    <p className="text-sm opacity-60">Manage allocations by batch or individual student.</p>
                </div>
            </div>

            {/* SELECTION ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Department Dropdown */}
                <div className="relative group">
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Department</label>
                    <div className="relative">
                        <select 
                            className={`w-full p-4 pr-10 rounded-xl border appearance-none outline-none font-medium cursor-pointer transition-all ${isDarkMode ? 'bg-gray-900/50 border-gray-600 text-white hover:border-gray-500' : 'bg-gray-50 border-gray-200 text-gray-800 hover:border-gray-300'}`}
                            value={selectedDept}
                            onChange={(e) => handleDeptChange(e.target.value)}
                        >
                            <option value="">Select Department</option>
                            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                        </select>
                        <ChevronRight className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 opacity-50 rotate-90 pointer-events-none text-gray-500"/>
                    </div>
                </div>

                {/* Batch Dropdown */}
                <div className="relative">
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Batch</label>
                    <div className="relative">
                        <select 
                            className={`w-full p-4 pr-10 rounded-xl border appearance-none outline-none font-medium cursor-pointer transition-all ${isDarkMode ? 'bg-gray-900/50 border-gray-600 text-white hover:border-gray-500' : 'bg-gray-50 border-gray-200 text-gray-800 hover:border-gray-300'}`}
                            value={selectedBatch?._id || ''}
                            onChange={(e) => handleBatchSelect(e.target.value)}
                            disabled={!selectedDept}
                        >
                            <option value="">Select Batch</option>
                            {batches.map(b => {
                                // Dynamic Lookup for Dropdown Options
                                const dept = departments.find(d => d._id === selectedDept);
                                const stream = dept?.streams?.find(s => s.code === b.streamCode);
                                const type = stream?.curriculumType === 'Trimester' ? 'Trim' : 'Sem';
                                
                                return (
                                    <option key={b._id} value={b._id}>
                                        {b.batchName} ({type} {b.currentTerm})
                                    </option>
                                );
                            })}
                        </select>
                        <ChevronRight className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 opacity-50 rotate-90 pointer-events-none text-gray-500"/>
                    </div>
                </div>
            </div>

            {/* BULK ACTIONS & LIST */}
            {selectedBatch && (
                <div className="animate-fade-in">
                    {/* Bulk Assign Box */}
                    <div className={`mb-8 p-6 rounded-2xl border border-dashed ${isDarkMode ? 'bg-blue-900/10 border-blue-700/50' : 'bg-blue-50 border-blue-200'}`}>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className={`font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                                Bulk Assign for {getTermLabel(selectedBatch.currentTerm)}
                            </h4>
                            <button 
                                onClick={handleBulkAssign}
                                disabled={batchDefaultSubjects.length === 0}
                                className={`px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all ${batchDefaultSubjects.length > 0 ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                            >
                                Apply to All Students
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {subjects.filter(s => s.semester === selectedBatch.currentTerm).map(sub => (
                                <button
                                    key={sub._id}
                                    onClick={() => setBatchDefaultSubjects(prev => prev.includes(sub._id) ? prev.filter(id => id !== sub._id) : [...prev, sub._id])}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                        batchDefaultSubjects.includes(sub._id)
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-600' : 'bg-white text-gray-600 border-gray-300'
                                    }`}
                                >
                                    {sub.code} - {sub.name}
                                </button>
                            ))}
                            {subjects.filter(s => s.semester === selectedBatch.currentTerm).length === 0 && (
                                <p className="text-xs opacity-50 italic">No subjects found matching this semester.</p>
                            )}
                        </div>
                    </div>

                    {/* Student List */}
                    <div className="space-y-3">
                        <div className="flex justify-between px-4 text-xs font-bold uppercase tracking-wider opacity-50">
                            <span>Student Name</span>
                            <span>Action</span>
                        </div>
                        {students.map(student => (
                            <div 
                                key={student._id} 
                                onClick={() => openStudentDetail(student)}
                                className={`group flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-600' : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-blue-50 text-blue-600'}`}>
                                        {student.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h5 className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{student.name}</h5>
                                        <p className="text-xs opacity-60">{student.username} • {student.rollNo || 'No Roll No'}</p>
                                    </div>
                                </div>
                                <div className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-400 group-hover:text-white' : 'bg-gray-100 text-gray-400 group-hover:text-blue-600'}`}>
                                    <ChevronRight className="w-5 h-5"/>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    // ==========================================
    // RENDER: STUDENT DETAIL VIEW
    // ==========================================
    if (view === 'detail' && focusedStudent) return (
        <div className={`p-8 rounded-3xl shadow-sm border animate-fade-in ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setView('list')} className={`p-3 rounded-xl transition-all ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
                    <ArrowLeft className="w-5 h-5"/>
                </button>
                <div>
                    <h3 className="text-2xl font-bold">{focusedStudent.name}</h3>
                    <p className="text-sm opacity-60">Subject Allocation History</p>
                </div>
            </div>

            {isLoading ? <div className="py-20 text-center opacity-50">Loading student data...</div> : (
                <div className="space-y-8">
                    {/* Render a card for each semester (1 up to Current Term) */}
                    {Array.from({ length: selectedBatch.currentTerm }, (_, i) => i + 1).map(sem => (
                        <div key={sem} className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-900/30 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold text-lg flex items-center gap-2">
                                    <span className={`w-2 h-6 rounded-full ${sem === selectedBatch.currentTerm ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                    {getTermLabel(sem)}
                                </h4>
                                <button 
                                    onClick={() => saveStudentMapping(sem)}
                                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all active:scale-95 ${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-white hover:shadow-sm'}`}
                                >
                                    Save Changes
                                </button>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                {/* Only show subjects belonging to this Semester */}
                                {subjects.filter(s => s.semester === sem).map(sub => {
                                    const isSelected = (studentMappings[sem] || []).includes(sub._id);
                                    return (
                                        <button
                                            key={sub._id}
                                            onClick={() => toggleStudentSubject(sem, sub._id)}
                                            className={`relative px-4 py-3 rounded-xl text-left border transition-all ${
                                                isSelected 
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' 
                                                : isDarkMode ? 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                                            }`}
                                        >
                                            <div className="text-[10px] font-bold opacity-70 mb-0.5">{sub.code}</div>
                                            <div className="font-bold text-sm">{sub.name}</div>
                                        </button>
                                    );
                                })}
                                {subjects.filter(s => s.semester === sem).length === 0 && (
                                    <p className="text-sm opacity-50">No subjects defined for this term.</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- D. LOGISTICS MANAGER (Admin Only) ---
const LogisticsManager = ({ isDarkMode, profile }) => {
    const [view, setView] = useState('setup'); // 'setup' | 'preview_student' | 'preview_faculty'
    
    // API Data State
    const [departments, setDepartments] = useState([]);
    const [batches, setBatches] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [activeSession, setActiveSession] = useState(null);

    // Selection State
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedStream, setSelectedStream] = useState('');
    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');

    // Form State (Hybrid of Auto-filled and Manual)
    const [formData, setFormData] = useState({
        instituteName: profile?.college || 'INSTITUTE OF ENGINEERING & MANAGEMENT',
        location: 'SALT LAKE',
        affiliation: 'Affiliated to UEM Kolkata and Approved by AICTE',
        degreeName: 'B.Tech', // Explicit Degree Input
        sessionInfo: 'Loading Session...', // Cycle / Session Name
        roomNo: '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM - 01:00 PM',
        batch: '',
        rollRange: '',
        paperInfo: '',
        invigilators: '',
        studentCount: 30
    });

    // 1. Initial Data Fetch
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const token = localStorage.getItem('sessionToken');
                const headers = { Authorization: `Bearer ${token}` };

                const [deptRes, batchRes, sessionRes] = await Promise.all([
                    axios.get(`${API_BASE}/api/departments`, { headers }),
                    axios.get(`${API_BASE}/api/batches`, { headers }),
                    axios.get(`${API_BASE}/api/coe/active-session`, { headers }).catch(() => ({ data: null }))
                ]);

                setDepartments(deptRes.data);
                setBatches(batchRes.data);
                
                if (sessionRes.data) {
                    setActiveSession(sessionRes.data);
                    setFormData(prev => ({ 
                        ...prev, 
                        sessionInfo: `${sessionRes.data.sessionName} (${sessionRes.data.cycle} Cycle)` 
                    }));
                } else {
                    setFormData(prev => ({ ...prev, sessionInfo: 'No Active Session Found' }));
                }
            } catch (err) { console.error("Error fetching logistics data", err); }
        };
        fetchInitialData();
    }, []);

    // 2. Handle Batch Selection
    const handleBatchChange = async (batchId) => {
        setSelectedBatch(batchId);
        setSelectedSubject('');
        setFormData(prev => ({ ...prev, paperInfo: '' }));

        const batch = batches.find(b => b._id === batchId);
        if (!batch) return;

        setFormData(prev => ({ ...prev, batch: `${batch.batchName} (Term ${batch.currentTerm})` }));

        try {
            const token = localStorage.getItem('sessionToken');
            const headers = { Authorization: `Bearer ${token}` };
            
            // Fetch Students in this Batch
            const studentRes = await axios.get(`${API_BASE}/api/batches/${batchId}/students`, { headers });
            const studentList = studentRes.data || [];
            
            const sortedStudents = studentList.sort((a, b) => {
                const rollA = a.rollNo || a.username || '';
                const rollB = b.rollNo || b.username || '';
                return rollA.localeCompare(rollB, undefined, {numeric: true});
            });
            setStudents(sortedStudents);

            // Calculate Roll Range or set blank if empty
            if (sortedStudents.length > 0) {
                const firstRoll = sortedStudents[0].rollNo || sortedStudents[0].username || 'N/A';
                const lastRoll = sortedStudents[sortedStudents.length - 1].rollNo || sortedStudents[sortedStudents.length - 1].username || 'N/A';
                setFormData(prev => ({ 
                    ...prev, 
                    rollRange: `${firstRoll} - ${lastRoll}`,
                    studentCount: sortedStudents.length
                }));
            } else {
                setFormData(prev => ({ ...prev, rollRange: '', studentCount: 30 }));
            }

            // Fetch Subjects
            const subRes = await axios.get(`${API_BASE}/api/departments/${selectedDept}/subjects`, { headers });
            const termSubjects = subRes.data.filter(s => s.semester === batch.currentTerm && s.isActive);
            setSubjects(termSubjects);

        } catch (err) { console.error(err); }
    };

    const handlePrint = () => {
        window.print();
    };

    // Helper to render the Student Attendance Table rows
    const renderStudentGrid = () => {
        const rows = [];
        // Use auto-fetched students, otherwise use manual blank rows based on studentCount
        const roster = students.length > 0 ? students : Array(formData.studentCount || 30).fill({});
        const numRows = Math.ceil(roster.length / 2);
        
        for (let i = 0; i < numRows; i++) {
            const s1 = roster[i * 2];
            const s2 = roster[i * 2 + 1];

            rows.push(
                <tr key={i} className="border-b border-gray-400">
                    <td className="border-r border-gray-400 p-2 text-center text-sm min-w-[120px] font-mono font-bold">
                        {s1?.rollNo || s1?.username || '\u00A0'}
                    </td>
                    <td className="border-r border-gray-400 p-2">&nbsp;</td>
                    <td className="border-r border-gray-400 p-2 text-center text-sm min-w-[120px] font-mono font-bold">
                        {s2 ? (s2.rollNo || s2.username || '\u00A0') : '\u00A0'}
                    </td>
                    <td className="p-2">&nbsp;</td>
                </tr>
            );
        }
        return rows;
    };

    // ==========================================
    // RENDER: SETUP VIEW
    // ==========================================
    if (view === 'setup') return (
        <div className={`p-8 rounded-3xl shadow-sm border animate-fade-in ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-8">
                <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                    <ClipboardList className="w-6 h-6"/>
                </div>
                <div>
                    <h3 className="text-xl font-bold">Exam Logistics & Attendance</h3>
                    <p className="text-sm opacity-60">Smart allocate rooms and generate DB-linked attendance sheets.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* LEFT COLUMN */}
                <div className="space-y-8">
                    {/* Section 1: Dynamic Academic Selection */}
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-900/30 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <h4 className="text-sm font-bold uppercase tracking-wider mb-6 opacity-70 flex items-center gap-2">
                            <BookOpen className="w-4 h-4"/> Academic Mapping
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <label className={`block text-xs font-bold mb-1 ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Department</label>
                                <select 
                                    className={`w-full p-3 rounded-xl border outline-none text-sm font-medium cursor-pointer ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                                    value={selectedDept}
                                    onChange={(e) => {
                                        setSelectedDept(e.target.value);
                                        setSelectedStream(''); setSelectedBatch(''); setSelectedSubject(''); setStudents([]);
                                    }}
                                >
                                    <option value="">1. Select Department</option>
                                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                </select>
                            </div>
                            
                            <div>
                                <label className={`block text-xs font-bold mb-1 ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Stream</label>
                                <select 
                                    className={`w-full p-3 rounded-xl border outline-none text-sm font-medium cursor-pointer ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                                    value={selectedStream}
                                    disabled={!selectedDept}
                                    onChange={(e) => {
                                        setSelectedStream(e.target.value);
                                        setSelectedBatch(''); setSelectedSubject(''); setStudents([]);
                                    }}
                                >
                                    <option value="">2. Select Stream</option>
                                    {selectedDept && departments.find(d => d._id === selectedDept)?.streams.map(s => (
                                        <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={`block text-xs font-bold mb-1 ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Batch</label>
                                <select 
                                    className={`w-full p-3 rounded-xl border outline-none text-sm font-medium cursor-pointer ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                                    value={selectedBatch}
                                    disabled={!selectedStream}
                                    onChange={(e) => handleBatchChange(e.target.value)}
                                >
                                    <option value="">3. Select Target Batch</option>
                                    {batches.filter(b => b.departmentId?._id === selectedDept && b.streamCode === selectedStream && !b.isAlumni)
                                            .map(b => <option key={b._id} value={b._id}>{b.batchName} (Term {b.currentTerm})</option>)
                                    }
                                </select>
                            </div>

                            <div>
                                <label className={`block text-xs font-bold mb-1 ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Paper Code & Name</label>
                                <select 
                                    className={`w-full p-3 rounded-xl border outline-none text-sm font-medium cursor-pointer ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                                    value={selectedSubject}
                                    disabled={!selectedBatch}
                                    onChange={(e) => {
                                        setSelectedSubject(e.target.value);
                                        const sub = subjects.find(s => s._id === e.target.value);
                                        if(sub) setFormData(prev => ({...prev, paperInfo: `${sub.code} - ${sub.name}`}));
                                    }}
                                >
                                    <option value="">4. Select Subject</option>
                                    {subjects.map(s => <option key={s._id} value={s._id}>{s.code} - {s.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-8">
                    {/* Section 2: Header Customization */}
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-900/30 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <h4 className="text-sm font-bold uppercase tracking-wider mb-6 opacity-70 flex items-center gap-2">
                            <Settings className="w-4 h-4"/> Header Customization
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <label className={`block text-xs font-bold mb-1 ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Institute Name</label>
                                <input className={`w-full p-3 rounded-xl border outline-none text-sm ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`} value={formData.instituteName} onChange={e => setFormData({...formData, instituteName: e.target.value})} placeholder="Institute Name"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-xs font-bold mb-1 ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Degree Name</label>
                                    <input className={`w-full p-3 rounded-xl border outline-none text-sm ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`} value={formData.degreeName} onChange={e => setFormData({...formData, degreeName: e.target.value})} placeholder="e.g. B.Tech / MBA"/>
                                </div>
                                <div>
                                    <label className={`block text-xs font-bold mb-1 ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Session / Cycle Name</label>
                                    <input className={`w-full p-3 rounded-xl border outline-none text-sm ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`} value={formData.sessionInfo} onChange={e => setFormData({...formData, sessionInfo: e.target.value})}/>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Logistics Overrides */}
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-900/30 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <h4 className="text-sm font-bold uppercase tracking-wider mb-6 opacity-70 flex items-center gap-2">
                            <Users className="w-4 h-4"/> Logistics & Modifiers
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={`block text-xs font-bold mb-1 ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Room No / Label</label>
                                <input className={`w-full p-3 rounded-xl border outline-none text-sm ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`} value={formData.roomNo} onChange={e => setFormData({...formData, roomNo: e.target.value})} placeholder="e.g. LAB-1A"/>
                            </div>
                            <div>
                                <label className={`block text-xs font-bold mb-1 ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Time Slot</label>
                                <input className={`w-full p-3 rounded-xl border outline-none text-sm ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`} value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})}/>
                            </div>
                            <div className="col-span-2">
                                <label className={`block text-xs font-bold mb-1 ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Invigilators (Comma separated)</label>
                                <input className={`w-full p-3 rounded-xl border outline-none text-sm ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`} value={formData.invigilators} onChange={e => setFormData({...formData, invigilators: e.target.value})} placeholder="e.g. DKD, ARG, SH"/>
                            </div>
                            
                            {/* Editable Overrides for Empty Arrays */}
                            <div>
                                <label className={`block text-xs font-bold mb-1 ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Roll Range (Editable)</label>
                                <input className={`w-full p-3 rounded-xl border outline-none text-sm font-mono ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-white border-gray-300 text-gray-700'}`} value={formData.rollRange} onChange={e => setFormData({...formData, rollRange: e.target.value})} placeholder="1001 - 1050"/>
                            </div>
                            <div>
                                <label className={`block text-xs font-bold mb-1 ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Students / Blank Rows</label>
                                <input type="number" className={`w-full p-3 rounded-xl border outline-none text-sm font-mono font-bold ${isDarkMode ? 'bg-gray-900 border-gray-700 text-blue-400' : 'bg-white border-gray-300 text-blue-600'}`} value={formData.studentCount} onChange={e => setFormData({...formData, studentCount: parseInt(e.target.value) || 0})}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col md:flex-row gap-4 justify-end">
                <button 
                    disabled={!selectedSubject || !formData.roomNo}
                    onClick={() => setView('preview_faculty')} 
                    className="px-6 py-3 rounded-xl font-bold border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <UserCheck className="w-5 h-5"/> Generate Faculty Sheet
                </button>
                <button 
                    disabled={!selectedSubject || !formData.roomNo}
                    onClick={() => setView('preview_student')} 
                    className="px-6 py-3 rounded-xl font-bold bg-orange-600 text-white hover:bg-orange-500 shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Users className="w-5 h-5"/> Generate Student Sheet
                </button>
            </div>
        </div>
    );

    // ==========================================
    // RENDER: PRINTABLE PREVIEW (Overlay)
    // ==========================================
    
    // Resolve Stream Name
    const resolvedStreamName = selectedStream ? departments.find(d => d._id === selectedDept)?.streams.find(s => s.code === selectedStream)?.name : '';

    return (
        <div className="fixed inset-0 z-[100] bg-gray-900 overflow-y-auto print:bg-white print:static print:z-auto flex flex-col animate-fade-in">
            
            {/* Sticky Control Bar (Hidden during print) */}
            <div className="sticky top-0 z-50 bg-gray-800 border-b border-gray-700 p-4 px-8 flex justify-between items-center print:hidden shadow-lg">
                <div className="text-white font-bold flex items-center gap-2 opacity-80">
                    <Printer className="w-5 h-5"/> Print Preview Mode
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setView('setup')} className="bg-gray-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-600 transition-colors shadow-sm">
                        <ArrowLeft className="w-5 h-5"/> Back to Setup
                    </button>
                    <button onClick={handlePrint} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-500 shadow-lg transition-colors">
                        <Printer className="w-5 h-5"/> Print Document
                    </button>
                </div>
            </div>

            {/* Document Canvas Area */}
            <div className="flex-1 p-8 print:p-0 flex justify-center items-start">
                {/* The actual A4 Sheet */}
                <div className="bg-white text-black w-full max-w-[210mm] min-h-[297mm] p-[15mm] shadow-2xl print:shadow-none print:p-0 relative">
                    
                    {/* --- HEADER AS PER TEMPLATE --- */}
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-extrabold tracking-wide uppercase">{formData.instituteName}, {formData.location}</h1>
                        <p className="text-sm font-semibold mt-1">{formData.affiliation}</p>
                        <p className="text-sm font-bold mt-2">Degree: {formData.degreeName}{resolvedStreamName ? `, Stream: ${resolvedStreamName}` : ''}</p>
                        <h2 className="text-lg font-bold mt-4 underline decoration-2 underline-offset-4">{formData.sessionInfo}</h2>
                        <h3 className="text-xl font-bold mt-4 uppercase">
                            {view === 'preview_faculty' ? 'Faculty Duty Sheet' : 'Attendance Sheet'}
                        </h3>
                    </div>

                    {/* --- METADATA TABLE --- */}
                    <table className="w-full border-collapse border border-gray-800 mb-8 text-sm">
                        <tbody>
                            <tr className="border-b border-gray-800">
                                <td className="border-r border-gray-800 p-2 font-bold w-1/3">Room No</td>
                                <td className="p-2 font-semibold uppercase">{formData.roomNo}</td>
                            </tr>
                            <tr className="border-b border-gray-800">
                                <td className="border-r border-gray-800 p-2 font-bold">Date</td>
                                <td className="p-2 font-semibold">{formData.date}</td>
                            </tr>
                            <tr className="border-b border-gray-800">
                                <td className="border-r border-gray-800 p-2 font-bold">Time</td>
                                <td className="p-2 font-semibold">{formData.time}</td>
                            </tr>
                            <tr className="border-b border-gray-800">
                                <td className="border-r border-gray-800 p-2 font-bold">Batch</td>
                                <td className="p-2 font-semibold">{formData.batch}</td>
                            </tr>
                            <tr className="border-b border-gray-800">
                                <td className="border-r border-gray-800 p-2 font-bold">Range of Roll numbers</td>
                                <td className="p-2 font-semibold font-mono">{formData.rollRange || '-'}</td>
                            </tr>
                            <tr className="border-b border-gray-800">
                                <td className="border-r border-gray-800 p-2 font-bold">Paper Code - Paper Name</td>
                                <td className="p-2 font-semibold uppercase">{formData.paperInfo}</td>
                            </tr>
                            <tr className="border-b border-gray-800">
                                <td className="border-r border-gray-800 p-2 font-bold">Invigilators</td>
                                <td className="p-2 font-semibold">{formData.invigilators}</td>
                            </tr>
                            {view === 'preview_student' && (
                                <tr>
                                    <td className="border-r border-gray-800 p-2 font-bold leading-tight">
                                        Number of Absentees <br/><span className="text-[10px] font-normal italic">(Mark any Absentee with "AB" in RED)</span>
                                    </td>
                                    <td className="p-2 text-gray-400 italic">--To be Filled during Examination--</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* --- ATTENDANCE/DUTY GRID --- */}
                    {view === 'preview_student' ? (
                        <table className="w-full border-collapse border border-gray-800">
                            <thead>
                                <tr className="bg-gray-100 border-b border-gray-800">
                                    <th className="border-r border-gray-800 p-2 text-sm">Enrolment No.</th>
                                    <th className="border-r border-gray-800 p-2 text-sm">Signature</th>
                                    <th className="border-r border-gray-800 p-2 text-sm">Enrolment No.</th>
                                    <th className="p-2 text-sm">Signature</th>
                                </tr>
                            </thead>
                            <tbody>
                                {renderStudentGrid()}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full border-collapse border border-gray-800 mt-10">
                            <thead>
                                <tr className="bg-gray-100 border-b border-gray-800">
                                    <th className="border-r border-gray-800 p-4 text-left">Faculty Name</th>
                                    <th className="border-r border-gray-800 p-4 text-left">Department</th>
                                    <th className="border-r border-gray-800 p-4 text-left">Arrival Time</th>
                                    <th className="p-4 text-left">Signature</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Render rows for assigned invigilators */}
                                {formData.invigilators ? formData.invigilators.split(',').map((invig, idx) => (
                                    <tr key={idx} className="border-b border-gray-400">
                                        <td className="border-r border-gray-400 p-4 font-bold">{invig.trim()}</td>
                                        <td className="border-r border-gray-400 p-4"></td>
                                        <td className="border-r border-gray-400 p-4"></td>
                                        <td className="p-4"></td>
                                    </tr>
                                )) : (
                                    <tr className="border-b border-gray-400">
                                        <td className="border-r border-gray-400 p-4 text-gray-400 italic">No Invigilators Assigned</td>
                                        <td className="border-r border-gray-400 p-4"></td><td className="border-r border-gray-400 p-4"></td><td className="p-4"></td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}

                    {/* --- FOOTER SIGNATURES --- */}
                    <div className="absolute bottom-12 left-[15mm] right-[15mm] flex justify-between items-end pt-12">
                        <div className="w-64 text-center">
                            <div className="border-b border-black mb-2"></div>
                            <p className="font-bold text-sm">Full Name of Invigilators</p>
                        </div>
                        <div className="w-64 text-center">
                            <div className="border-b border-black mb-2"></div>
                            <p className="font-bold text-sm">Signature of Invigilators</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

// --- E. QUESTION BANK MANAGER (Shared) ---
const QuestionBankManager = ({ data, setData, setPdfViewer, isDarkMode, user, profile }) => {
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
      if (data.departments.length > 0) return;
      const fetchDepts = async () => {
        try {
           const token = localStorage.getItem('sessionToken');
           const res = await axios.get(`${API_BASE}/api/departments`, { headers: { Authorization: `Bearer ${token}` } });
           setData(prev => ({ ...prev, departments: res.data }));
        } catch (err) { console.error(err); }
      };
      fetchDepts();
    }, []);

    const handleDeptChange = async (deptId) => {
        setData(prev => ({ ...prev, filters: { ...prev.filters, dept: deptId, subject: '' }, subjects: [] }));
        if (!deptId) return;
        try {
          const token = localStorage.getItem('sessionToken');
          const res = await axios.get(`${API_BASE}/api/departments/${deptId}/subjects`, { headers: { Authorization: `Bearer ${token}` } });
          setData(prev => ({ ...prev, subjects: res.data }));
        } catch (err) { console.error(err); }
    };

    const handleSearch = async () => {
      if (!data.filters.subject) return alert("Please select a Subject first.");
      setData(prev => ({ ...prev, isLoading: true }));
      try {
        const token = localStorage.getItem('sessionToken');
        const res = await axios.get(`${API_BASE}/api/coe/questions`, {
          params: { tenantId: user?.tenantId || profile?.tenantId, subjectId: data.filters.subject, year: data.filters.year },
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(prev => ({ ...prev, files: res.data, isLoading: false, hasFetched: true }));
      } catch (err) { alert("Failed to fetch questions"); setData(prev => ({ ...prev, isLoading: false })); }
    };

    const handleFileAction = (file) => {
    // This removes the backend API and ensures there is a starting slash
    const fileUrl = file.fileUrl.startsWith('/') ? file.fileUrl : `/${file.fileUrl}`;
    const isPdf = file.fileUrl.toLowerCase().endsWith('.pdf');
        if (isPdf) setPdfViewer({ isOpen: true, url: fileUrl, title: file.title || file.subjectName });
        else {
            const link = document.createElement('a');
            link.href = fileUrl; link.download = file.fileName || 'document';
            document.body.appendChild(link); link.click(); document.body.removeChild(link);
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Are you sure?")) return;
        try { await axios.delete(`${API_BASE}/api/coe/question/${id}`); setData(prev => ({...prev, files: prev.files.filter(f => f._id !== id)})); } 
        catch(e) { alert("Delete failed"); }
    }

    return (
      <div className="flex flex-col gap-8 animate-fade-in">
        {/* Header Card */}
        <div className={`p-8 rounded-3xl border shadow-sm relative overflow-hidden transition-all ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-gray-200 shadow-gray-200/50'}`}>
            <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-500/5'}`}></div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                <div>
                    <h3 className={`text-2xl font-bold flex items-center gap-3 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}><BookOpen className="w-6 h-6"/></div>
                        Question Bank Repository
                    </h3>
                    <p className={`text-sm mt-2 ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Securely manage, view, and distribute examination papers.</p>
                </div>
                <div className={`px-6 py-4 rounded-2xl flex items-center gap-5 border ${isDarkMode ? 'bg-gray-900/50 border-gray-600' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="text-right">
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Files</p>
                        <p className={`text-3xl font-bold leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{data.files.length}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-gray-800 text-blue-400' : 'bg-white shadow-sm text-blue-600'}`}><Layers className="w-6 h-6" /></div>
                </div>
            </div>
        </div>

        {/* Filter Bar */}
        <div className={`p-8 rounded-3xl shadow-sm border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-gray-200/50'}`}>
             <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                <div className="md:col-span-4">
                    <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Department</label>
                    <div className="relative">
                        <select className={`w-full p-4 pl-5 rounded-xl border appearance-none outline-none font-medium ${isDarkMode ? 'bg-gray-900 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-700'}`} value={data.filters.dept} onChange={(e) => handleDeptChange(e.target.value)}>
                            <option value="">Select Department</option>
                            {data.departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                        </select>
                        <ChevronRight className="w-4 h-4 absolute right-5 top-5 opacity-50 rotate-90 pointer-events-none"/>
                    </div>
                </div>
                <div className="md:col-span-4">
                    <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Subject</label>
                    <div className="relative">
                        <select className={`w-full p-4 pl-5 rounded-xl border appearance-none outline-none font-medium ${isDarkMode ? 'bg-gray-900 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-700'}`} value={data.filters.subject} onChange={(e) => setData(prev => ({...prev, filters: {...prev.filters, subject: e.target.value}}))} disabled={!data.filters.dept}>
                            <option value="">{data.subjects.length === 0 && data.filters.dept ? "No Subjects Found" : "Select Subject"}</option>
                            {data.subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                        </select>
                        <ChevronRight className="w-4 h-4 absolute right-5 top-5 opacity-50 rotate-90 pointer-events-none"/>
                    </div>
                </div>
                <div className="md:col-span-2">
                    <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Year</label>
                    <input type="number" className={`w-full p-4 rounded-xl border outline-none font-medium ${isDarkMode ? 'bg-gray-900 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-700'}`} value={data.filters.year} onChange={(e) => setData(prev => ({...prev, filters: {...prev.filters, year: e.target.value}}))}/>
                </div>
                <div className="md:col-span-2">
                    <button onClick={handleSearch} disabled={!data.filters.subject || data.isLoading} className={`w-full h-[58px] rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${!data.filters.subject ? 'bg-gray-400 cursor-not-allowed opacity-50' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'}`}>
                        {data.isLoading ? "..." : <><Search className="w-5 h-5"/> Find Files</>}
                    </button>
                </div>
             </div>
        </div>

        {/* Real-time Search & Grid */}
        {data.files.length > 0 && (
            <div className="flex justify-between items-center px-2 animate-fade-in">
                <h3 className={`font-bold text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Repository Files</h3>
                <div className={`relative group w-full max-w-sm`}>
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none opacity-50"><Search className="h-5 w-5" /></div>
                    <input type="text" className={`block w-full pl-11 pr-4 py-3 rounded-xl font-medium outline-none ${isDarkMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'}`} placeholder="Search title, ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                </div>
            </div>
        )}

        <div className="min-h-[300px]">
          {data.files.length === 0 ? (
            <div className={`flex flex-col items-center justify-center h-80 rounded-3xl border-2 border-dashed ${isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-300 bg-white/50'}`}>
               <div className={`p-5 rounded-full mb-4 ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-white text-gray-400 shadow-sm border border-gray-100'}`}><Filter className="w-10 h-10"/></div>
               <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{data.hasFetched ? "No files found." : "Select filters to browse."}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.files.map(file => {
                const isPdf = file.fileUrl?.toLowerCase().endsWith('.pdf');
                const isMatch = searchTerm ? ((file.title?.toLowerCase().includes(searchTerm.toLowerCase())) || (file.subjectCode?.toLowerCase().includes(searchTerm.toLowerCase()))) : true;
                const searchStyle = searchTerm ? (isMatch ? 'scale-[1.02] shadow-2xl ring-2 ring-blue-500/50 z-10' : 'opacity-30 blur-[2px] grayscale scale-95 pointer-events-none') : '';

                return (
                  <div key={file._id} className={`group relative flex flex-col justify-between p-6 rounded-3xl border transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${searchStyle} ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                     <div>
                         <div className="flex justify-between items-start mb-5">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${isPdf ? 'bg-red-50 text-red-500 dark:bg-red-500/10' : 'bg-blue-50 text-blue-500 dark:bg-blue-500/10'}`}>{isPdf ? <FileText className="w-7 h-7"/> : <File className="w-7 h-7"/>}</div>
                            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50 text-gray-600 border'}`}>{file.category?.replace('_', ' ') || 'Exam'}</span>
                         </div>
                         <h4 className={`font-bold text-lg mb-3 line-clamp-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{file.title || "Untitled"}</h4>
                         <div className="flex flex-wrap gap-2">
                            <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium ${isDarkMode ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-50 text-gray-600'}`}><Calendar className="w-3.5 h-3.5 opacity-60"/> {file.year}</div>
                         </div>
                     </div>
                     <div className={`mt-6 pt-5 border-t flex items-center justify-between ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        <div className="flex items-center gap-3">
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50 text-blue-600'}`}>{file.facultyName ? file.facultyName.charAt(0) : 'U'}</div>
                             <div className="flex flex-col"><span className="text-sm font-bold truncate">{file.facultyName}</span><span className="text-xs opacity-70">ID: {file.facultyUid || 'N/A'}</span></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleFileAction(file)} className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-50 text-gray-400 hover:text-blue-600'}`}>{isPdf ? <Eye className="w-5 h-5"/> : <Download className="w-5 h-5"/>}</button>
                            <button onClick={() => handleDelete(file._id)} className="p-2.5 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50"><Trash2 className="w-5 h-5"/></button>
                        </div>
                     </div>
                  </div>
                );
            })}
            </div>
          )}
        </div>
      </div>
    );
};

// ==========================================
// 2. MAIN PARENT COMPONENT
// ==========================================

const COEManager = ({ defaultModule }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { user, profile } = useSessionManager();
  
  // -- ROLE LOGIC --
  const userRoleDisplay = profile?.role ? profile.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'User';
  const isFaculty = profile?.role === 'faculty';

  // -- STATE --
  // **MODIFICATION 1: Default to 'allocation' for Faculty**
  const [activeModule, setActiveModule] = useState(defaultModule || (isFaculty ? 'allocation' : 'session')); 

  const [qbData, setQbData] = useState({ departments: [], subjects: [], files: [], filters: { dept: '', subject: '', year: new Date().getFullYear() }, isLoading: false, hasFetched: false });
  const [pdfViewer, setPdfViewer] = useState({ isOpen: false, url: null, title: '' });

  // -- MENU CONFIGURATION --
  const allMenuItems = [
    { id: 'session', label: 'Exam Session', icon: <Calendar className="w-5 h-5"/>, desc: 'Manage Terms', restricted: true }, // Admin Only
    { id: 'allocation', label: 'Subject Mapping', icon: <Users className="w-5 h-5"/>, desc: 'Assign Electives', restricted: false },
    { id: 'logistics', label: 'Logistics', icon: <ClipboardList className="w-5 h-5"/>, desc: 'Rooms & Attendance', restricted: true }, // Admin Only
    { id: 'marks', label: 'Marks Entry', icon: <PenTool className="w-5 h-5"/>, desc: 'Scoring & Results', restricted: false },
    { id: 'qb', label: 'Question Bank', icon: <BookOpen className="w-5 h-5"/>, desc: 'Repository', restricted: false },
  ];

  const menuItems = isFaculty 
    ? allMenuItems.filter(item => !item.restricted)
    : allMenuItems;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* ================= HEADER ================= */}
      <GlassHeader variant="dashboard">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          {/* LEFT */}
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate(-1)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <UserProfileDropdown user={user} onOptionClick={() => {}} />
            <div className="flex flex-col">
              <div className={`flex items-center text-sm font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                <span className="opacity-70">{userRoleDisplay} Dashboard</span>
                <ChevronRight className="w-4 h-4 mx-1 opacity-50" />
                <span className="text-blue-600">COE Management</span>
              </div>
              <div className="flex items-center space-x-2 mt-0.5">
                {/* **MODIFICATION 2: Showing Institute Name instead of User Role** */}
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${isDarkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                  {profile?.college || 'My Institute'}
                </span>
                <span className="text-[10px] text-green-500 flex items-center"><Wifi className="w-3 h-3 mr-1" /> Active</span>
              </div>
            </div>
          </div>
          {/* RIGHT */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2"><CollegeBannerLogo /></div>
            <ThemeToggle />
          </div>
        </div>
      </GlassHeader>

      {/* ================= BODY (SIDEBAR LAYOUT) ================= */}
      <div className="pt-28 pb-12 px-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
          
          {/* SIDEBAR */}
          <div className="w-full md:w-64 flex-shrink-0 animate-fade-in-left">
              <div className={`sticky top-32 p-3 rounded-3xl border space-y-1 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <p className="text-[10px] font-bold uppercase tracking-wider px-4 py-2 opacity-50">Modules</p>
                  {menuItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => setActiveModule(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left group ${
                            activeModule === item.id 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 opacity-70 hover:opacity-100'
                        }`}
                      >
                          <div className={`${activeModule === item.id ? 'text-white' : 'text-blue-500 group-hover:text-blue-600'}`}>
                              {item.icon}
                          </div>
                          <div>
                              <span className="block font-bold text-sm">{item.label}</span>
                              <span className={`text-[10px] block ${activeModule === item.id ? 'text-blue-100' : 'opacity-50'}`}>{item.desc}</span>
                          </div>
                      </button>
                  ))}
              </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 min-w-0">
             {activeModule === 'session' && !isFaculty && <SessionManager isDarkMode={isDarkMode} />}
             {activeModule === 'allocation' && <SubjectAllocator isDarkMode={isDarkMode} />}
             {activeModule === 'logistics' && !isFaculty && <LogisticsManager isDarkMode={isDarkMode} />}
             {activeModule === 'marks' && <MarksManager isDarkMode={isDarkMode} />}
             {activeModule === 'qb' && (
                 <QuestionBankManager 
                    data={qbData} setData={setQbData} 
                    setPdfViewer={setPdfViewer} isDarkMode={isDarkMode}
                    user={user} profile={profile}
                 />
             )}
          </div>
      </div>

      {/* ================= PDF VIEWER OVERLAY ================= */}
      {pdfViewer.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-fade-in">
           <div className="flex justify-between items-center px-6 py-4 bg-gray-900 border-b border-gray-800 text-white">
               <div className="flex items-center gap-4">
                   <div className="p-2 bg-blue-500/20 rounded-lg"><FileText className="text-blue-400 w-5 h-5"/></div>
                   <div>
                      <span className="font-bold block text-sm opacity-60">Viewing Document</span>
                      <span className="text-lg font-bold leading-none">{pdfViewer.title || "Document Viewer"}</span>
                   </div>
               </div>
               <button onClick={() => setPdfViewer({ isOpen: false, url: null, title: '' })} className="p-2 hover:bg-gray-800 rounded-full transition-colors group"><X className="w-8 h-8 text-gray-400 group-hover:text-white"/></button>
           </div>
           <div className="flex-1 overflow-hidden bg-gray-100 relative"><ModernPdfViewer fileUrl={pdfViewer.url} /></div>
        </div>
      )}
    </div>
  );
};

export default COEManager;