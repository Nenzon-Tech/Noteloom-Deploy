import { API_BASE } from '@/utils/config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Building, Trash2, Plus, Settings, 
  Calendar, Users, Layers, ChevronRight, Wifi, 
  CheckCircle, AlertCircle, X, Lock, Unlock, Save, Edit2, AlertTriangle, Search, UserMinus, UserPlus, BookOpen
} from "lucide-react";
import { useTheme } from '@/context/ThemeContext.jsx';
import GlassHeader from '@/components/common/GlassHeader.jsx';
import { motion, AnimatePresence } from 'framer-motion';

import UserProfileDropdown from '@/components/common/UserProfileDropdown.jsx'; 
import ThemeToggle from '@/components/common/ThemeToggle.jsx';
import CollegeBannerLogo from '@/components/common/CollegeBannerLogo.jsx';


import LoadingSpinner from '@/components/common/LoadingSpinner';

// Animation Variants
const pageVariants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 10, transition: { duration: 0.2 } }
};

const tabVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.99 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, scale: 0.99, transition: { duration: 0.2, ease: "easeIn" } }
};

const ManageDepartments = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
  // --- UI States ---
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showEditBatchModal, setShowEditBatchModal] = useState(false); // Modal visibility

  // --- Data States ---
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  
  // Selection States
  const [selectedDept, setSelectedDept] = useState(null);
  const [activeTab, setActiveTab] = useState('streams'); 

  // SUBJECTS
  const [subjects, setSubjects] = useState([]); // NEW: Subjects List
  const [newSubject, setNewSubject] = useState({ name: '', code: '', type: 'Theory', credits: 3, semester: 1 }); // NEW: Subject Form

  // --- NEW STATE FOR STUDENT MANAGER ---
  const [managingBatch, setManagingBatch] = useState(null);
  const [batchStudents, setBatchStudents] = useState([]);
  const [newStudentId, setNewStudentId] = useState("");
  const [enrollLoading, setEnrollLoading] = useState(false);
  
  // Stream Configuration State
  const [editingStream, setEditingStream] = useState(null); 
  const [streamConfigForm, setStreamConfigForm] = useState({
    curriculumType: 'Semester',
    totalTerms: 8,
    isLocked: false,
    termStructure: {
      oddStartMonth: 'July', oddEndMonth: 'December',
      evenStartMonth: 'January', evenEndMonth: 'June'
    },
    trimesterStructure: {
      term1Start: 'January', term1End: 'April',
      term2Start: 'May', term2End: 'August',
      term3Start: 'September', term3End: 'December'
    }
  });

  // --- Batch Edit State ---
  const [editingBatch, setEditingBatch] = useState(null); // The batch being edited
  const [batchEditForm, setBatchEditForm] = useState({
    batchName: '',
    admissionYear: '',
    admissionMonth: '',
    section: ''
  });

  // --- NEW FUNCTIONS ---
  const openStudentManager = async (batch) => {
    setManagingBatch(batch);
    setBatchStudents([]);
    try {
      const res = await fetch(`${API_BASE}/api/batches/${batch._id}/students`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }
      });
      if (res.ok) setBatchStudents(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleEnrollStudent = async () => {
    if (!newStudentId.trim()) return;
    setEnrollLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/batches/${managingBatch._id}/enroll`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ noteloomId: newStudentId })
      });
      
      const data = await res.json();
      if (res.ok) {
        setBatchStudents([...batchStudents, data.student]); 
        setNewStudentId("");
      } else {
        alert(data.error || "Failed to enroll student");
      }
    } catch (e) { alert("Connection Error"); } 
    finally { setEnrollLoading(false); }
  };

  const handleUnenrollStudent = async (studentId) => {
    if (!window.confirm("Remove student from this batch?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/batches/${managingBatch._id}/students/${studentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }
      });
      if (res.ok) setBatchStudents(batchStudents.filter(s => s._id !== studentId));
    } catch (e) { console.error(e); }
  };

  // --- User & Session State ---
  const [currentUser, setCurrentUser] = useState({ name: 'Loading...', role: '', uid: '' });
  const [collegeName, setCollegeName] = useState('Loading College...');
  
  // --- Form States (Creation) ---
  const [newDeptName, setNewDeptName] = useState('');
  const [newStreamName, setNewStreamName] = useState('');
  const [newStreamCode, setNewStreamCode] = useState('');
  
  // --- Batch Form States ---
  const [batchYear, setBatchYear] = useState(new Date().getFullYear());
  const [batchMonth, setBatchMonth] = useState('');
  const [batchName, setBatchName] = useState('');
  const [selectedStreamForBatch, setSelectedStreamForBatch] = useState('');
  const [hasSections, setHasSections] = useState(false);
  const [sectionCount, setSectionCount] = useState(1);
  const [sectionNames, setSectionNames] = useState(['A']);

  const theme = { 
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    subText: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    cardBg: isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white border-gray-200',
    inputBg: isDarkMode ? 'bg-gray-900/50 border-gray-700 focus:border-blue-500' : 'bg-gray-50 border-gray-200 focus:border-blue-500',
    inputDisabled: isDarkMode ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-500 cursor-not-allowed'
  };

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper: Show Toast
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 4000);
  };

  // --- Fetch Logic ---
  const fetchSession = async () => {
    try {
      const response = await fetch(`${API_BASE}/session/info`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
        setCollegeName(data.tenant?.name || 'College');
      }
    } catch (error) { console.error("Error fetching session info", error); }
  };

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/departments`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
        if (selectedDept) {
          const updated = data.find(d => d._id === selectedDept._id);
          if (updated) setSelectedDept(updated);
        }
      }
    } catch (error) { showToast('Failed to load departments', 'error'); }
    setIsLoading(false);
  };

  const fetchBatches = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/batches`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }
      });
      if(res.ok) setBatches(await res.json());
    } catch(e) { console.error(e); }
  };

  // --- NEW: Fetch Subjects for selected department ---
  const fetchSubjects = async () => {
    if (!selectedDept) return;
    try {
      const res = await fetch(`${API_BASE}/api/departments/${selectedDept._id}/subjects`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }
      });
      if(res.ok) setSubjects(await res.json());
    } catch(e) { console.error(e); }
  };

  // --- NEW: Create Subject ---
  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!selectedDept) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/departments/${selectedDept._id}/subjects`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubject)
      });
      
      if(res.ok) {
        showToast("Subject Added Successfully");
        setNewSubject({ name: '', code: '', type: 'Theory', credits: 3, semester: 1 });
        fetchSubjects();
      } else {
        const d = await res.json();
        showToast(d.error || "Failed to add subject", 'error');
      }
    } catch(e) { showToast("Error adding subject", 'error'); }
    setIsLoading(false);
  };

  // --- NEW: Delete Subject ---
  const handleDeleteSubject = async (id) => {
    if(!confirm("Delete this subject?")) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/departments/subjects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }
      });
      if(res.ok) { showToast("Subject Deleted"); fetchSubjects(); }
    } catch(e) { console.error(e); }
    setIsLoading(false);
  };

  // --- NEW: Effect to load subjects when tab changes ---
  useEffect(() => {
    if (activeTab === 'subjects') fetchSubjects();
  }, [activeTab, selectedDept]);

  useEffect(() => { 
    fetchSession();
    fetchDepartments(); 
    fetchBatches();
  }, []);

  // --- Handlers ---
  const handleBack = () => {
    if (editingStream) {
        setEditingStream(null); // Go back to stream list
    } else if (selectedDept) {
        setSelectedDept(null); // Go back to departments grid
    } else {
        navigate(-1);
    }
  };

  const handleCreateDept = async (e) => {
    e.preventDefault();
    if (!newDeptName) return;
    setIsLoading(true);
    try {
      await fetch(`${API_BASE}/api/departments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDeptName })
      });
      setNewDeptName('');
      await fetchDepartments();
      showToast('Department created successfully!');
    } catch (error) { showToast('Failed to create department', 'error'); }
    setIsLoading(false);
  };

  const handleDeleteDept = async () => {
    if(!confirm(`Are you sure you want to delete ${selectedDept.name}? This action cannot be undone.`)) return;
    setIsLoading(true);
    await fetch(`${API_BASE}/api/departments/${selectedDept._id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }
    });
    setSelectedDept(null);
    await fetchDepartments();
    showToast('Department deleted');
    setIsLoading(false);
  };

  const handleAddStream = async (e) => {
    e.preventDefault();
    if (!newStreamName || !newStreamCode) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/departments/${selectedDept._id}/streams`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newStreamName, code: newStreamCode })
      });
      if (!res.ok) throw new Error('Failed');
      setNewStreamName(''); setNewStreamCode('');
      await fetchDepartments();
      showToast('Stream added successfully');
    } catch (error) { showToast('Failed to add stream (Check if code unique)', 'error'); }
    setIsLoading(false);
  };

  // --- Stream Configuration Handlers ---
  const handleOpenStreamConfig = (stream) => {
    setEditingStream(stream);
    // Pre-fill form
    setStreamConfigForm({
      curriculumType: stream.curriculumType || 'Semester',
      totalTerms: stream.totalTerms || 8,
      isLocked: stream.isLocked || false,
      termStructure: stream.termStructure || {
        oddStartMonth: 'July', oddEndMonth: 'December',
        evenStartMonth: 'January', evenEndMonth: 'June'
      },
      trimesterStructure: stream.trimesterStructure || {
        term1Start: 'January', term1End: 'April',
        term2Start: 'May', term2End: 'August',
        term3Start: 'September', term3End: 'December'
      }
    });
  };

  // UPDATED: Now accepts optional 'dataToSave' to allow immediate saving of state changes (like locking)
  const handleSaveStreamConfig = async (dataToSave = null) => {
    if (!editingStream) return;
    setIsLoading(true);

    const payload = dataToSave || streamConfigForm;

    try {
        const res = await fetch(`${API_BASE}/api/departments/${selectedDept._id}/streams/${editingStream._id}/config`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const status = payload.isLocked ? 'Locked & Saved' : 'Saved';
            showToast(`Configuration ${status}!`);
            
            await fetchDepartments(); // Refresh data from server
            
            // Update local editing stream reference
            const updatedDept = await res.json();
            const updatedStream = updatedDept.streams.find(s => s._id === editingStream._id);
            setEditingStream(updatedStream);
        } else {
            showToast('Failed to save configuration', 'error');
        }
    } catch (e) {
        showToast('Network error', 'error');
    }
    setIsLoading(false);
  };

  // NEW: Helper for Lock & Save Action
  const handleLockAndSave = () => {
    if (!confirm("Are you sure? Once locked, you must unlock it to make changes.")) return;
    
    const lockedState = { ...streamConfigForm, isLocked: true };
    setStreamConfigForm(lockedState); // Update UI
    handleSaveStreamConfig(lockedState); // Save to DB immediately
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    if(!selectedStreamForBatch) return showToast("Select a stream first", 'error');
    if(!batchMonth) return showToast("Select admission month", 'error');

    setIsLoading(true);
    const finalSections = hasSections ? sectionNames : ["N/A"];
    
    try {
      const res = await fetch(`${API_BASE}/api/batches`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          departmentId: selectedDept._id,
          streamCode: selectedStreamForBatch,
          admissionYear: batchYear,
          admissionMonth: batchMonth,
          batchName: batchName,
          sections: finalSections
        })
      });

      if(res.ok) {
        await fetchBatches();
        showToast("Classes Created Successfully");
        setBatchName(''); setHasSections(false); setSectionCount(1); setSectionNames(['A']);
      } else {
        showToast("Failed to create batch", 'error');
      }
    } catch (error) { showToast('Error creating batch', 'error'); }
    setIsLoading(false);
  };

  // --- HELPER: Detect if Semester or Trimester for a batch ---
  const getBatchTermLabel = (batch) => {
    // Safety check: ensure batch and populated department exist
    if (!batch || !batch.departmentId) return 'SEM';
    
    const dept = batch.departmentId; 
    // Find the stream config within the department
    const stream = dept.streams?.find(s => s.code === batch.streamCode);
    
    // Check curriculum type
    return stream?.curriculumType === 'Trimester' ? 'TRIM' : 'SEM';
  };

  // --- Batch Edit/Delete Handlers ---

  const handleDeleteBatch = async (batchId) => {
    if (!confirm("Are you sure you want to delete this batch/class? This cannot be undone.")) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/batches/${batchId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }
      });
      
      if (res.ok) {
        showToast("Batch deleted successfully");
        fetchBatches(); // Refresh list
      } else {
        showToast("Failed to delete batch", "error");
      }
    } catch (error) {
      showToast("Network error deleting batch", "error");
    }
    setIsLoading(false);
  };

  const openEditBatchModal = (batch) => {
    setEditingBatch(batch);
    setBatchEditForm({
      batchName: batch.batchName || '',
      admissionYear: batch.admissionYear,
      admissionMonth: batch.admissionMonth,
      section: batch.section
    });
    setShowEditBatchModal(true);
  };

  const handleUpdateBatch = async (e) => {
    e.preventDefault();
    if (!editingBatch) return;
    setIsLoading(true);
    
    try {
      const res = await fetch(`${API_BASE}/api/batches/${editingBatch._id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(batchEditForm)
      });

      if (res.ok) {
        showToast("Batch updated successfully");
        setShowEditBatchModal(false);
        setEditingBatch(null);
        fetchBatches(); // Refresh list
      } else {
        showToast("Failed to update batch", "error");
      }
    } catch (error) {
      showToast("Network error updating batch", "error");
    }
    setIsLoading(false);
  };

  const getAvailableMonths = () => {
    const currentYear = new Date().getFullYear();
    const currentMonthIndex = new Date().getMonth(); 
    if (parseInt(batchYear) === currentYear) return months.slice(0, currentMonthIndex + 1);
    return months;
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button 
      onClick={() => { setActiveTab(id); setEditingStream(null); }}
      className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 w-full text-left mb-2 relative overflow-hidden outline-none
      ${activeTab === id 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
        : isDarkMode ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200' : 'hover:bg-white text-gray-600 hover:text-blue-600 hover:shadow-sm'}`}
    >
      <Icon size={18} className={`transition-transform duration-300 ${activeTab === id ? 'scale-110' : 'group-hover:scale-110'}`} />
      <span className="font-medium relative z-10">{label}</span>
      {activeTab === id && <ChevronRight className="ml-auto w-4 h-4 opacity-50" />}
    </button>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#0f111a] text-white' : 'bg-[#F3F4F6] text-gray-900'}`}>
      
      {/* ================= LOADER OVERLAY ================= */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <LoadingSpinner message="Please wait..." />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= EDIT BATCH MODAL ================= */}
      <AnimatePresence>
        {showEditBatchModal && editingBatch && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border ${theme.cardBg}`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Edit2 size={20} className="text-blue-500"/> Edit Class
                </h3>
                <button onClick={() => setShowEditBatchModal(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                  <X size={20}/>
                </button>
              </div>

              <form onSubmit={handleUpdateBatch} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase opacity-50">Batch Name</label>
                  <input 
                    type="text" 
                    value={batchEditForm.batchName} 
                    onChange={e => setBatchEditForm({...batchEditForm, batchName: e.target.value})}
                    className={`w-full p-3 rounded-xl border outline-none ${theme.inputBg}`}
                    placeholder="e.g. Phoenix 2024"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase opacity-50">Year</label>
                    <input 
                      type="number" 
                      value={batchEditForm.admissionYear} 
                      onChange={e => setBatchEditForm({...batchEditForm, admissionYear: e.target.value})}
                      className={`w-full p-3 rounded-xl border outline-none ${theme.inputBg}`}
                    />
                  </div>
                  <div className="space-y-1">
                     <label className="text-xs font-bold uppercase opacity-50">Section</label>
                     <input 
                       type="text" 
                       value={batchEditForm.section} 
                       onChange={e => setBatchEditForm({...batchEditForm, section: e.target.value})}
                       className={`w-full p-3 rounded-xl border outline-none ${theme.inputBg}`}
                     />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase opacity-50">Admission Month</label>
                  <select 
                    value={batchEditForm.admissionMonth} 
                    onChange={e => setBatchEditForm({...batchEditForm, admissionMonth: e.target.value})}
                    className={`w-full p-3 rounded-xl border outline-none ${theme.inputBg}`}
                  >
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                   <button type="button" onClick={() => setShowEditBatchModal(false)} className="px-4 py-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 font-medium">Cancel</button>
                   <button type="submit" className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 shadow-lg shadow-blue-500/20">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= TOAST NOTIFICATION ================= */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[70] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border ${
              toast.type === 'error' ? 'bg-red-900/90 border-red-500 text-white' : 'bg-emerald-900/90 border-emerald-500 text-white'
            }`}
          >
            {toast.type === 'error' ? <AlertCircle size={20}/> : <CheckCircle size={20}/>}
            <span className="font-medium text-sm">{toast.message}</span>
            <button onClick={() => setToast({ ...toast, show: false })} className="ml-2 opacity-60 hover:opacity-100"><X size={14}/></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= HEADER ================= */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <GlassHeader variant="dashboard">
          <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button onClick={handleBack} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-blue-100 text-blue-600'}`}>
                <ArrowLeft className="w-5 h-5" />
              </button>
              <UserProfileDropdown user={currentUser} onOptionClick={() => {}} />
              <div className="flex flex-col">
                <div className={`flex items-center text-sm font-bold ${theme.text}`}>
                  <span className="opacity-70">Admin Dashboard</span>
                  <ChevronRight className="w-4 h-4 mx-1 opacity-50" />
                  <span className={selectedDept ? "opacity-70" : "text-blue-500"}>Manage Departments</span>
                  {selectedDept && (
                    <>
                      <ChevronRight className="w-4 h-4 mx-1 opacity-50" />
                      <span className="text-blue-500">{selectedDept.name}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                    {collegeName}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <CollegeBannerLogo />
              <ThemeToggle />
            </div>
          </div>
        </GlassHeader>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 pt-28">
        <AnimatePresence mode="wait">
        {!selectedDept ? (
          // ================= GRID VIEW =================
          <motion.div 
            key="grid-view"
            variants={pageVariants} initial="initial" animate="animate" exit="exit"
          >
            <div className={`p-6 rounded-2xl border mb-8 backdrop-blur-xl shadow-sm ${theme.cardBg}`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-500">
                <Building className="w-5 h-5 mr-2"/> Add New Department
              </h3>
              <form onSubmit={handleCreateDept} className="flex gap-4">
                <input 
                  type="text" 
                  placeholder="e.g. Mechanical Engineering" 
                  value={newDeptName} 
                  onChange={e => setNewDeptName(e.target.value)} 
                  className={`flex-1 p-3 rounded-xl border outline-none transition-all ${theme.inputBg}`}
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-8 rounded-xl font-medium transition-all shadow-lg shadow-blue-900/20 active:scale-95">
                  Create
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map(dept => (
                <motion.div 
                  whileHover={{ y: -5, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  key={dept._id} 
                  onClick={() => { setSelectedDept(dept); setActiveTab('streams'); }} 
                  className={`p-6 rounded-2xl border cursor-pointer group transition-all shadow-sm hover:shadow-xl ${theme.cardBg} hover:border-blue-400/30`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                      <Building size={24} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-blue-500 transition-colors">{dept.name}</h3>
                  <div className="flex items-center gap-4 text-sm opacity-60 mt-4">
                    <span className="flex items-center gap-1"><Layers size={14}/> {dept.streams?.length || 0} Streams</span>
                    <span className="flex items-center gap-1"><Users size={14}/> {batches.filter(b => b.departmentId?._id === dept._id).length} Batches</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          // ================= DETAIL VIEW (FIXED FLEX LAYOUT) =================
          <div className="flex flex-col lg:flex-row items-start gap-8">
            
            {/* Sidebar Navigation - STICKY FIXED POSITION */}
            <motion.div 
              initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              className="lg:w-64 w-full shrink-0 sticky top-28 self-start z-10"
            >
              <div className="mb-4 px-2">
                <h2 className="text-xs font-bold uppercase tracking-wider opacity-50 mb-1">Configuration</h2>
              </div>
              <TabButton id="streams" label="Streams & Curriculum" icon={Layers} />
              <TabButton id="subjects" label="Subjects" icon={BookOpen} />
              <TabButton id="batches" label="Batches & Classes" icon={Users} />
              <div className="mt-6 mb-4 px-2">
                <h2 className="text-xs font-bold uppercase tracking-wider opacity-50">System</h2>
              </div>
              <TabButton id="settings" label="Settings" icon={Settings} />
            </motion.div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0 w-full">
              <AnimatePresence mode="wait">

                {/* --- NEW: SUBJECTS TAB --- */}
                {activeTab === 'subjects' && (
                   <motion.div key="subjects" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className={`p-8 rounded-2xl border shadow-lg backdrop-blur-xl ${theme.cardBg}`}>
                      <div className="flex justify-between items-start mb-8 border-b border-gray-200/10 pb-4">
                        <div>
                           <h2 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="text-purple-500"/> Subject Registry</h2>
                           <p className={`text-sm mt-1 ${theme.subText}`}>Manage curriculum subjects and codes.</p>
                        </div>
                      </div>

                      <div className={`p-6 rounded-xl border mb-8 ${isDarkMode ? 'bg-purple-900/5 border-purple-500/20' : 'bg-purple-50 border-purple-100'}`}>
                         <h4 className="font-bold mb-6 text-purple-600 flex items-center gap-2"><Plus size={18}/> Add New Subject</h4>
                         <form onSubmit={handleCreateSubject} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                            <div className="lg:col-span-2"><label className="text-xs font-bold opacity-50 block mb-1">Subject Name</label><input type="text" placeholder="e.g. Data Structures" value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${theme.inputBg}`}/></div>
                            <div><label className="text-xs font-bold opacity-50 block mb-1">Code</label><input type="text" placeholder="CS201" value={newSubject.code} onChange={e => setNewSubject({...newSubject, code: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${theme.inputBg}`}/></div>
                            <div><label className="text-xs font-bold opacity-50 block mb-1">Sem</label><input type="number" min="1" max="8" value={newSubject.semester} onChange={e => setNewSubject({...newSubject, semester: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${theme.inputBg}`}/></div>
                            <button type="submit" className="bg-purple-600 text-white p-3 rounded-xl font-bold hover:bg-purple-500 h-[50px]">Add</button>
                         </form>
                         <div className="grid grid-cols-3 gap-4 mt-4">
                            <div><label className="text-xs font-bold opacity-50 block mb-1">Type</label><select value={newSubject.type} onChange={e => setNewSubject({...newSubject, type: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${theme.inputBg}`}><option value="Theory">Theory</option><option value="Practical">Practical</option><option value="Sessional">Sessional</option></select></div>
                            <div><label className="text-xs font-bold opacity-50 block mb-1">Credits</label><input type="number" min="0" value={newSubject.credits} onChange={e => setNewSubject({...newSubject, credits: e.target.value})} className={`w-full p-3 rounded-xl border outline-none ${theme.inputBg}`}/></div>
                         </div>
                      </div>

                      <div className="space-y-2">
                        {subjects.length > 0 ? subjects.map((subj) => (
                           <div key={subj._id} className={`flex items-center justify-between p-4 rounded-xl border ${theme.cardBg} hover:shadow-md transition-all`}>
                              <div className="flex items-center gap-4">
                                 <span className={`px-3 py-1 rounded text-xs font-bold font-mono ${isDarkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>{subj.code}</span>
                                 <div>
                                    <h4 className="font-bold">{subj.name}</h4>
                                    <p className="text-xs opacity-60">{subj.type} • {subj.credits} Credits • Sem {subj.semester}</p>
                                 </div>
                              </div>
                              <button onClick={() => handleDeleteSubject(subj._id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16}/></button>
                           </div>
                        )) : (
                           <div className="text-center py-10 opacity-40">No subjects found for this department.</div>
                        )}
                      </div>
                   </motion.div>
                )}
                
                {activeTab === 'streams' && (
                  <motion.div 
                    key="streams" variants={tabVariants} initial="hidden" animate="visible" exit="exit"
                    className={`p-8 rounded-2xl border shadow-lg backdrop-blur-xl ${theme.cardBg}`}
                  >
                     {/* ================= STREAMS LIST VIEW ================= */}
                     {!editingStream ? (
                       <>
                         <div className="flex justify-between items-center mb-8 border-b border-gray-200/10 pb-4">
                            <div>
                               <h2 className="text-2xl font-bold flex items-center gap-2"><Layers className="text-pink-500"/> Streams</h2>
                               <p className={`text-sm mt-1 ${theme.subText}`}>Manage specializations and their individual curriculums.</p>
                            </div>
                         </div>

                         {/* Add Stream Form */}
                         <form onSubmit={handleAddStream} className="flex flex-col md:flex-row gap-4 mb-8 bg-gray-500/5 p-4 rounded-xl border border-dashed border-gray-500/20">
                            <input type="text" placeholder="Stream Name (e.g. CSE AI)" value={newStreamName} onChange={e => setNewStreamName(e.target.value)} className={`flex-1 p-3 rounded-xl border outline-none ${theme.inputBg}`}/>
                            <input type="text" placeholder="Code (001)" value={newStreamCode} onChange={e => setNewStreamCode(e.target.value.slice(0,3))} className={`w-32 p-3 rounded-xl border text-center outline-none ${theme.inputBg}`}/>
                            <button type="submit" className="bg-pink-600 hover:bg-pink-500 text-white px-6 rounded-xl font-medium transition-all shadow-lg shadow-pink-500/20">Add</button>
                         </form>

                         <div className="space-y-3">
                            {selectedDept.streams?.map((stream, idx) => (
                              <motion.div 
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                                key={stream._id} 
                                className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border group transition-all hover:shadow-md ${theme.cardBg} hover:border-pink-400/50`}
                              >
                                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                  <span className="font-mono bg-pink-500/10 text-pink-500 px-3 py-1 rounded-lg text-sm font-bold border border-pink-500/20">{stream.code}</span>
                                  <div>
                                    <h4 className="font-medium text-lg">{stream.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      {stream.isConfigured ? (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                                          <CheckCircle size={10}/> Configured
                                        </span>
                                      ) : (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center gap-1">
                                          <AlertCircle size={10}/> Needs Config
                                        </span>
                                      )}
                                      {stream.isLocked && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-1">
                                          <Lock size={10}/> Locked
                                        </span>
                                      )}
                                    </div>
                                    
                                    {/* WARNING FOR UNCONFIGURED STREAMS */}
                                    {!stream.isConfigured && (
                                        <div className="mt-2 text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1 bg-orange-500/5 p-1 rounded">
                                            <AlertTriangle size={12}/> 
                                            This stream is not configured. It will not be visible elsewhere.
                                        </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleOpenStreamConfig(stream)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                                               bg-blue-500 text-white hover:bg-blue-600
                                               transition-all shadow-lg shadow-blue-500/20"
                                  >
                                    <Settings size={16} />
                                    Configure
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                            {(!selectedDept.streams || selectedDept.streams.length === 0) && (
                                <div className="text-center py-10 opacity-40 border-2 border-dashed rounded-xl">No streams added yet.</div>
                            )}
                         </div>
                       </>
                     ) : (
                       // ================= STREAM CONFIGURATION VIEW =================
                       <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                          
                          {/* CONFIGURATION BANNER WARNING */}
                          {!editingStream.isConfigured && (
                              <div className="mb-6 p-4 rounded-xl border border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-start gap-3">
                                  <AlertTriangle className="shrink-0 mt-0.5" size={20} />
                                  <div>
                                      <h4 className="font-bold text-sm">Action Required: Stream Not Live</h4>
                                      <p className="text-xs opacity-90 mt-1">
                                          You must define the academic format (Terms/Semesters) and Lock the configuration for this stream to be visible in batch creation and student enrollment forms.
                                      </p>
                                  </div>
                              </div>
                          )}

                          <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200/10">
                             <div>
                                <button onClick={() => setEditingStream(null)} className="flex items-center text-sm opacity-60 hover:opacity-100 hover:text-blue-500 mb-2 transition-colors">
                                  <ArrowLeft size={14} className="mr-1"/> Back to Streams
                                </button>
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                  Configuring: <span className="text-blue-500">{editingStream.name}</span>
                                </h2>
                             </div>
                             
                             <div className="flex items-center gap-3">
                               {streamConfigForm.isLocked ? (
                                 <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-1">
                                   <Lock size={12}/> CURRICULUM LOCKED
                                 </span>
                               ) : (
                                 <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                                   <Unlock size={12}/> EDITABLE
                                 </span>
                               )}
                             </div>
                          </div>

                          <div className={`p-6 rounded-xl border mb-6 ${streamConfigForm.isLocked ? 'border-red-500/20 bg-red-500/5' : 'border-blue-500/20 bg-blue-500/5'}`}>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                               <div className="space-y-2">
                                 <label className={`text-sm font-semibold ${theme.subText}`}>Academic Format</label>
                                 <select 
                                   disabled={streamConfigForm.isLocked}
                                   value={streamConfigForm.curriculumType} 
                                   onChange={(e) => setStreamConfigForm({...streamConfigForm, curriculumType: e.target.value})}
                                   className={`w-full p-3 rounded-xl border outline-none ${streamConfigForm.isLocked ? theme.inputDisabled : theme.inputBg}`}
                                 >
                                   <option value="Semester">Semester System</option>
                                   <option value="Trimester">Trimester System</option>
                                 </select>
                               </div>

                               <div className="space-y-2">
                                 <label className={`text-sm font-semibold ${theme.subText}`}>Total Terms ({streamConfigForm.curriculumType === 'Semester' ? 'Semesters' : 'Trimesters'})</label>
                                 <input 
                                    type="number" 
                                    disabled={streamConfigForm.isLocked}
                                    value={streamConfigForm.totalTerms} 
                                    onChange={(e) => setStreamConfigForm({...streamConfigForm, totalTerms: e.target.value})} 
                                    className={`w-full p-3 rounded-xl border outline-none ${streamConfigForm.isLocked ? theme.inputDisabled : theme.inputBg}`} 
                                 />
                               </div>
                             </div>

                             {/* CONDITIONAL TIMELINE UI */}
                             <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 opacity-60`}>Timeline Structure</h4>
                             
                             {streamConfigForm.curriculumType === 'Semester' ? (
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
                                   <h5 className="font-bold text-blue-500 mb-3 flex items-center gap-2"><Calendar size={16}/> Odd Cycle</h5>
                                   <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-[10px] font-bold opacity-50 block mb-1">START</label>
                                        <select disabled={streamConfigForm.isLocked} value={streamConfigForm.termStructure.oddStartMonth} onChange={(e) => setStreamConfigForm({...streamConfigForm, termStructure: {...streamConfigForm.termStructure, oddStartMonth: e.target.value}})} className={`w-full p-2 rounded border text-sm ${streamConfigForm.isLocked ? theme.inputDisabled : theme.inputBg}`}>{months.map(m => <option key={m} value={m}>{m}</option>)}</select>
                                      </div>
                                      <div>
                                        <label className="text-[10px] font-bold opacity-50 block mb-1">END</label>
                                        <select disabled={streamConfigForm.isLocked} value={streamConfigForm.termStructure.oddEndMonth} onChange={(e) => setStreamConfigForm({...streamConfigForm, termStructure: {...streamConfigForm.termStructure, oddEndMonth: e.target.value}})} className={`w-full p-2 rounded border text-sm ${streamConfigForm.isLocked ? theme.inputDisabled : theme.inputBg}`}>{months.map(m => <option key={m} value={m}>{m}</option>)}</select>
                                      </div>
                                   </div>
                                 </div>
                                 <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
                                   <h5 className="font-bold text-purple-500 mb-3 flex items-center gap-2"><Calendar size={16}/> Even Cycle</h5>
                                   <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-[10px] font-bold opacity-50 block mb-1">START</label>
                                        <select disabled={streamConfigForm.isLocked} value={streamConfigForm.termStructure.evenStartMonth} onChange={(e) => setStreamConfigForm({...streamConfigForm, termStructure: {...streamConfigForm.termStructure, evenStartMonth: e.target.value}})} className={`w-full p-2 rounded border text-sm ${streamConfigForm.isLocked ? theme.inputDisabled : theme.inputBg}`}>{months.map(m => <option key={m} value={m}>{m}</option>)}</select>
                                      </div>
                                      <div>
                                        <label className="text-[10px] font-bold opacity-50 block mb-1">END</label>
                                        <select disabled={streamConfigForm.isLocked} value={streamConfigForm.termStructure.evenEndMonth} onChange={(e) => setStreamConfigForm({...streamConfigForm, termStructure: {...streamConfigForm.termStructure, evenEndMonth: e.target.value}})} className={`w-full p-2 rounded border text-sm ${streamConfigForm.isLocked ? theme.inputDisabled : theme.inputBg}`}>{months.map(m => <option key={m} value={m}>{m}</option>)}</select>
                                      </div>
                                   </div>
                                 </div>
                               </div>
                             ) : (
                               // ================= TRIMESTER UI IMPLEMENTATION =================
                               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {/* Term 1 */}
                                  <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
                                    <h5 className="font-bold text-blue-500 mb-3 flex items-center gap-2"><Calendar size={16}/> Term 1</h5>
                                    <div className="space-y-3">
                                       <div>
                                         <label className="text-[10px] font-bold opacity-50 block mb-1">START</label>
                                         <select 
                                            disabled={streamConfigForm.isLocked} 
                                            value={streamConfigForm.trimesterStructure.term1Start} 
                                            onChange={(e) => setStreamConfigForm({...streamConfigForm, trimesterStructure: {...streamConfigForm.trimesterStructure, term1Start: e.target.value}})} 
                                            className={`w-full p-2 rounded border text-sm ${streamConfigForm.isLocked ? theme.inputDisabled : theme.inputBg}`}
                                         >
                                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                                         </select>
                                       </div>
                                       <div>
                                         <label className="text-[10px] font-bold opacity-50 block mb-1">END</label>
                                         <select 
                                            disabled={streamConfigForm.isLocked} 
                                            value={streamConfigForm.trimesterStructure.term1End} 
                                            onChange={(e) => setStreamConfigForm({...streamConfigForm, trimesterStructure: {...streamConfigForm.trimesterStructure, term1End: e.target.value}})} 
                                            className={`w-full p-2 rounded border text-sm ${streamConfigForm.isLocked ? theme.inputDisabled : theme.inputBg}`}
                                         >
                                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                                         </select>
                                       </div>
                                    </div>
                                  </div>

                                  {/* Term 2 */}
                                  <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
                                    <h5 className="font-bold text-purple-500 mb-3 flex items-center gap-2"><Calendar size={16}/> Term 2</h5>
                                    <div className="space-y-3">
                                       <div>
                                         <label className="text-[10px] font-bold opacity-50 block mb-1">START</label>
                                         <select 
                                            disabled={streamConfigForm.isLocked} 
                                            value={streamConfigForm.trimesterStructure.term2Start} 
                                            onChange={(e) => setStreamConfigForm({...streamConfigForm, trimesterStructure: {...streamConfigForm.trimesterStructure, term2Start: e.target.value}})} 
                                            className={`w-full p-2 rounded border text-sm ${streamConfigForm.isLocked ? theme.inputDisabled : theme.inputBg}`}
                                         >
                                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                                         </select>
                                       </div>
                                       <div>
                                         <label className="text-[10px] font-bold opacity-50 block mb-1">END</label>
                                         <select 
                                            disabled={streamConfigForm.isLocked} 
                                            value={streamConfigForm.trimesterStructure.term2End} 
                                            onChange={(e) => setStreamConfigForm({...streamConfigForm, trimesterStructure: {...streamConfigForm.trimesterStructure, term2End: e.target.value}})} 
                                            className={`w-full p-2 rounded border text-sm ${streamConfigForm.isLocked ? theme.inputDisabled : theme.inputBg}`}
                                         >
                                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                                         </select>
                                       </div>
                                    </div>
                                  </div>

                                  {/* Term 3 */}
                                  <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
                                    <h5 className="font-bold text-orange-500 mb-3 flex items-center gap-2"><Calendar size={16}/> Term 3</h5>
                                    <div className="space-y-3">
                                       <div>
                                         <label className="text-[10px] font-bold opacity-50 block mb-1">START</label>
                                         <select 
                                            disabled={streamConfigForm.isLocked} 
                                            value={streamConfigForm.trimesterStructure.term3Start} 
                                            onChange={(e) => setStreamConfigForm({...streamConfigForm, trimesterStructure: {...streamConfigForm.trimesterStructure, term3Start: e.target.value}})} 
                                            className={`w-full p-2 rounded border text-sm ${streamConfigForm.isLocked ? theme.inputDisabled : theme.inputBg}`}
                                         >
                                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                                         </select>
                                       </div>
                                       <div>
                                         <label className="text-[10px] font-bold opacity-50 block mb-1">END</label>
                                         <select 
                                            disabled={streamConfigForm.isLocked} 
                                            value={streamConfigForm.trimesterStructure.term3End} 
                                            onChange={(e) => setStreamConfigForm({...streamConfigForm, trimesterStructure: {...streamConfigForm.trimesterStructure, term3End: e.target.value}})} 
                                            className={`w-full p-2 rounded border text-sm ${streamConfigForm.isLocked ? theme.inputDisabled : theme.inputBg}`}
                                         >
                                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                                         </select>
                                       </div>
                                    </div>
                                  </div>
                               </div>
                             )}
                          </div>

                          {/* ACTION BUTTONS */}
                          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200/10">
                            {streamConfigForm.isLocked ? (
                              <button 
                                onClick={() => setStreamConfigForm({...streamConfigForm, isLocked: false})}
                                className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-500 transition-colors"
                              >
                                <Unlock size={18} /> Unlock Settings
                              </button>
                            ) : (
                              <>
                                <button 
                                  onClick={handleLockAndSave}
                                  className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-500 transition-colors"
                                >
                                  <Lock size={18} /> Lock & Save
                                </button>
                                <button 
                                  onClick={() => handleSaveStreamConfig()}
                                  className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                                >
                                  <Save size={18} /> Save Changes
                                </button>
                              </>
                            )}
                          </div>
                       </motion.div>
                     )}
                  </motion.div>
                )}

                {activeTab === 'batches' && (
                  <motion.div 
                    key="batches" variants={tabVariants} initial="hidden" animate="visible" exit="exit"
                    className={`p-8 rounded-2xl border shadow-lg backdrop-blur-xl ${theme.cardBg}`}
                  >
                    <div className="flex justify-between items-start mb-8 border-b border-gray-200/10 pb-4">
                      <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2"><Users className="text-emerald-500"/> Classes & Batches</h2>
                        <p className={`text-sm mt-1 ${theme.subText}`}>Manage admission years and sectioning.</p>
                      </div>
                    </div>

                    <div className={`p-6 rounded-xl border mb-8 ${isDarkMode ? 'bg-emerald-900/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                      <h4 className="font-bold mb-6 text-emerald-600 flex items-center gap-2">
                        <span className="p-1 bg-emerald-100 rounded text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400"><Plus size={14}/></span> 
                        Initialize New Batch
                      </h4>
                      <form onSubmit={handleCreateBatch} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase opacity-50">Stream</label>
                            <select 
                              className={`w-full p-3 rounded-xl border outline-none ${theme.inputBg}`}
                              onChange={e => setSelectedStreamForBatch(e.target.value)}
                            >
                              <option value="">Select Stream</option>
                              {/* FILTER: Only show streams that are configured */}
                              {selectedDept.streams?.filter(s => s.isConfigured).map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase opacity-50">Admission Year</label>
                            <input 
                              type="number" placeholder="e.g. 2024" 
                              value={batchYear} onChange={e => setBatchYear(e.target.value)}
                              className={`w-full p-3 rounded-xl border outline-none ${theme.inputBg}`}
                            />
                          </div>
                          {/* Admission Month Selection */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase opacity-50">Admission Month</label>
                            <select 
                              value={batchMonth} 
                              onChange={e => setBatchMonth(e.target.value)}
                              className={`w-full p-3 rounded-xl border outline-none ${theme.inputBg}`}
                            >
                              <option value="">Select Month</option>
                              {getAvailableMonths().map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase opacity-50">Batch Name (Optional)</label>
                            <input 
                              type="text" placeholder="e.g. Phoenix 2024" 
                              value={batchName} onChange={e => setBatchName(e.target.value)}
                              className={`w-full p-3 rounded-xl border outline-none ${theme.inputBg}`}
                            />
                          </div>
                        </div>

                        {/* Sections Logic */}
                        <div className="pt-6 border-t border-dashed border-gray-400/20">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="relative flex items-center">
                                <input type="checkbox" id="hasSections" checked={hasSections} onChange={e => setHasSections(e.target.checked)} className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-emerald-400 checked:bg-emerald-500 checked:border-emerald-500 transition-all"/>
                                <CheckCircle className="absolute pointer-events-none opacity-0 peer-checked:opacity-100 text-white" size={12} style={{left: 4}}/>
                            </div>
                            <label htmlFor="hasSections" className="font-medium cursor-pointer select-none">Divide into Sections?</label>
                          </div>

                          <AnimatePresence>
                          {hasSections && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-8">
                              <div className="flex items-center gap-4 mb-4">
                                <label className="text-sm opacity-70">Count:</label>
                                <input type="number" min="1" max="10" value={sectionCount} onChange={(e) => setSectionCount(e.target.value)} className={`w-20 p-2 rounded border text-center ${theme.inputBg}`} />
                              </div>
                              <div className="flex flex-wrap gap-3">
                                {sectionNames.map((name, index) => (
                                  <div key={index} className="flex flex-col items-center">
                                    <span className="text-[10px] opacity-50 mb-1">SEC {index + 1}</span>
                                    <input type="text" value={name} onChange={(e) => {
                                        const newNames = [...sectionNames]; newNames[index] = e.target.value; setSectionNames(newNames);
                                    }} className={`w-14 h-14 rounded-lg border text-center text-lg font-bold shadow-sm ${theme.inputBg}`} />
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                          </AnimatePresence>
                        </div>

                        <div className="flex justify-end">
                          <button type="submit" className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-emerald-500/30 hover:bg-emerald-500 transition-all active:scale-95">
                            Create Classes
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {batches.filter(b => b.departmentId?._id === selectedDept._id).map(batch => (
                        <div key={batch._id} className={`p-5 rounded-xl border relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl group ${theme.cardBg}`}>
                          
                          {/* NEW: Batch Actions (Edit/Delete) - BOTTOM RIGHT */}
                          <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button 
                        onClick={() => openStudentManager(batch)}
                        className={`p-1.5 rounded-lg transition-colors mr-2 ${
                            isDarkMode ? 'hover:bg-purple-900/50 text-purple-400' : 'hover:bg-purple-100 text-purple-600'
                        }`}
                        title="Manage Students"
                    >
                        <UserPlus className="w-4 h-4" />
                    </button>
                            <button 
                              onClick={() => openEditBatchModal(batch)}
                              className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors border border-blue-500/20"
                            >
                              <Edit2 size={14}/>
                            </button>
                            <button 
                              onClick={() => handleDeleteBatch(batch._id)}
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors border border-red-500/20"
                            >
                              <Trash2 size={14}/>
                            </button>
                          </div>

                          {batch.isAlumni && (
                            <div className="absolute top-0 right-0 bg-yellow-500/20 text-yellow-600 text-[10px] font-bold px-3 py-1 rounded-bl-xl border-b border-l border-yellow-500/20">
                              ALUMNI
                            </div>
                          )}
                          <div className="flex justify-between items-start mb-2">
                             <div>
                               <div className="flex items-center gap-2 mb-1">
                                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">{batch.streamCode}</span>
                                  <span className="text-lg font-bold">{batch.admissionYear}</span>
                               </div>
                               <p className="text-xs opacity-60 mb-2">{batch.admissionMonth} Intake</p>
                               {batch.batchName && <p className="text-xs opacity-60 mb-2 font-semibold">"{batch.batchName}"</p>}
                               <div className="flex items-center gap-2">
                                 <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1 ${batch.section === 'N/A' ? 'bg-gray-500/10 text-gray-500' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                                   SEC {batch.section}
                                 </span>
                               </div>
                             </div>
                             <div className="text-right">
                               <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex flex-col items-center justify-center shadow-lg">
                                  <span className="text-xl font-bold leading-none">{batch.currentTerm}</span>
                                  {/* UPDATED: Dynamic Label based on Stream Type */}
                                  <span className="text-[8px] opacity-80 leading-none mt-0.5">
                                    {getBatchTermLabel(batch)}
                                  </span>
                               </div>
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'settings' && (
                  <motion.div 
                    key="settings" variants={tabVariants} initial="hidden" animate="visible" exit="exit"
                    className={`p-8 rounded-2xl border shadow-lg backdrop-blur-xl ${theme.cardBg}`}
                  >
                    <h2 className="text-2xl font-bold mb-6 text-red-500 flex items-center gap-2"><Settings className="animate-spin-slow"/> Department Settings</h2>
                    
                    <div className={`p-8 rounded-2xl border border-red-500/30 relative overflow-hidden ${isDarkMode ? 'bg-red-500/5' : 'bg-red-50'}`}>
                      <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-500/10 rounded-full blur-3xl"></div>
                      <h4 className="font-bold mb-2 text-red-500 text-lg">Danger Zone</h4>
                      <p className="text-sm opacity-70 mb-6 max-w-lg">
                        Permanently remove this department. This action cannot be undone.
                      </p>
                      <button onClick={handleDeleteDept} className="bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-500 transition-colors shadow-lg shadow-red-500/20 flex items-center gap-2 active:scale-95">
                        <Trash2 className="w-5 h-5" /> Delete Department
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
        </AnimatePresence>
      </div>
      {/* --- STUDENT MANAGEMENT MODAL --- */}
      <AnimatePresence>
        {managingBatch && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2">Manage Students</h3>
                            <p className="text-sm opacity-60">Batch: <span className="text-purple-500 font-mono">{managingBatch.batchName}</span></p>
                        </div>
                        <button onClick={() => setManagingBatch(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg"><X className="w-5 h-5"/></button>
                    </div>

                    {/* Add Input */}
                    <div className={`p-6 border-b ${isDarkMode ? 'border-gray-800 bg-gray-800/50' : 'border-gray-100 bg-gray-50'}`}>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 w-4 h-4 opacity-40"/>
                                <input 
                                    placeholder="Enter Noteloom ID (Username)"
                                    value={newStudentId}
                                    onChange={e => setNewStudentId(e.target.value)}
                                    className={`w-full pl-10 p-2.5 rounded-xl border outline-none ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`}
                                />
                            </div>
                            <button onClick={handleEnrollStudent} disabled={enrollLoading} className={`px-4 py-2 rounded-xl font-bold text-white transition-all ${enrollLoading ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-500'}`}>
                                {enrollLoading ? 'Adding...' : 'Enroll'}
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="p-2 max-h-[400px] overflow-y-auto">
                        <table className="w-full text-left">
                            <thead className="text-xs uppercase opacity-50 font-bold border-b border-gray-200 dark:border-gray-700">
                                <tr><th className="p-3">Name</th><th className="p-3">ID</th><th className="p-3 text-right">Action</th></tr>
                            </thead>
                            <tbody>
                                {batchStudents.map(student => (
                                    <tr key={student._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="p-3 font-medium">{student.name}</td>
                                        <td className="p-3 font-mono text-sm opacity-70">{student.username}</td>
                                        <td className="p-3 text-right">
                                            <button onClick={() => handleUnenrollStudent(student._id)} className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ml-auto">
                                                <UserMinus size={14}/> Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageDepartments;