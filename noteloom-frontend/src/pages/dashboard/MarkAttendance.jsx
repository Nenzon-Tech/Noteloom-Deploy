import { API_BASE } from '@/utils/config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Search, Check, X, ChevronRight, 
  Calendar, Clock, AlertCircle, Wifi, Users, BookOpen, Layers, Loader2, Filter,
  UserPlus, UserMinus, Plus, Edit2, Trash2, CheckCircle, GraduationCap,
  FileText, Download, Ban
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { useTheme } from '@/context/ThemeContext.jsx';
import GlassHeader from '@/components/common/GlassHeader.jsx';
import CollegeBannerLogo from '@/components/common/CollegeBannerLogo.jsx';
import ThemeToggle from '@/components/common/ThemeToggle.jsx';
import UserProfileDropdown from '@/components/common/UserProfileDropdown.jsx';
import AttendanceToggle from '@/components/common/AttendanceToggle.jsx'; // Importing the new toggle

 

const MarkAttendance = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  // --- STATE ---
  const [step, setStep] = useState(1); // 1: Batches, 2: Routine/Report, 3: Marking
  
  // Data State
  const [loading, setLoading] = useState(false);
  const [allBatches, setAllBatches] = useState([]); 
  const [filteredBatches, setFilteredBatches] = useState([]); 
  const [departments, setDepartments] = useState([]); 
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');

  // Attendance State
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [students, setStudents] = useState([]);
  const [currentDayName, setCurrentDayName] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [attendance, setAttendance] = useState({}); 
  const [searchTerm, setSearchTerm] = useState('');

  // --- MANAGER STATES (Batch CRUD) ---
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [managingBatch, setManagingBatch] = useState(null); 
  const [batchStudents, setBatchStudents] = useState([]);
  const [newStudentId, setNewStudentId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  
  // Forms
  const [createForm, setCreateForm] = useState({
    departmentId: '', streamCode: '', admissionYear: new Date().getFullYear(), 
    admissionMonth: '', batchName: '', hasSections: false, sectionCount: 1, sectionNames: ['A']
  });
  const [editForm, setEditForm] = useState({
    _id: '', batchName: '', admissionYear: '', admissionMonth: '', section: ''
  });

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const inputThemeClass = isDarkMode 
    ? "bg-gray-900 border-gray-700 text-gray-100 focus:border-blue-500" 
    : "bg-white border-gray-200 text-gray-900 focus:border-blue-500";

  // --- 1. INITIAL DATA LOADING ---
  const refreshData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sessionToken');
      const headers = { 'Authorization': `Bearer ${token}` };

      const batchRes = await fetch(`${API_BASE}/api/batches`, { headers });
      const deptRes = await fetch(`${API_BASE}/api/departments`, { headers });

      if (batchRes.ok && deptRes.ok) {
          const batchData = await batchRes.json();
          const deptData = await deptRes.json();
          
          const formattedBatches = batchData.map(b => {
              const dept = deptData.find(d => d._id === (b.departmentId?._id || b.departmentId));
              const streamConfig = dept?.streams?.find(s => s.code === b.streamCode);
              const curriculumType = streamConfig?.curriculumType || 'Semester';
              const termLabel = `${curriculumType} ${b.currentTerm}`;

              return {
                  _id: b._id,
                  displayName: b.batchName || `${b.admissionYear} - ${b.streamCode}`, 
                  section: b.section,
                  deptName: b.departmentId?.name || 'General',
                  deptId: b.departmentId?._id,
                  studentCount: b.students?.length || 0,
                  currentTerm: b.currentTerm,
                  admissionYear: b.admissionYear,
                  admissionMonth: b.admissionMonth,
                  streamCode: b.streamCode,
                  isAlumni: b.isAlumni,
                  streamName: streamConfig?.name || b.streamCode,
                  curriculumType: curriculumType,
                  termLabel: termLabel
              };
          });

          setAllBatches(formattedBatches);
          setDepartments(deptData);
      }
    } catch (error) { console.error("Network error", error); }
    setLoading(false);
  };

  useEffect(() => { refreshData(); }, []);

  useEffect(() => {
    if (selectedDeptFilter === 'ALL') {
        setFilteredBatches(allBatches);
    } else {
        setFilteredBatches(allBatches.filter(b => b.deptId === selectedDeptFilter));
    }
  }, [selectedDeptFilter, allBatches]);

  // --- 2. FETCH ROUTINE & STUDENTS ---
  const fetchBatchSchedule = async (batchId, dateString) => {
    if (!batchId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('sessionToken');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const dateObj = new Date(dateString);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = days[dateObj.getDay()];
      setCurrentDayName(dayName);

      const routineRes = await fetch(`${API_BASE}/api/routine/batch/${batchId}`, { headers });
      const studentsRes = await fetch(`${API_BASE}/api/batches/${batchId}/students`, { headers });

      if (routineRes.ok) {
        const routines = await routineRes.json();
        const todayRoutine = routines.find(r => r.dayOfWeek === dayName);
        const validPeriods = todayRoutine?.periods?.filter(p => !p.isBreak && p.subject) || [];
        
        const formattedSchedule = validPeriods.map(p => ({
            _id: p._id || Math.random().toString(),
            periodNumber: p.periodNumber,
            startTime: p.startTime,
            endTime: p.endTime,
            subjectId: typeof p.subject === 'object' ? p.subject : { name: p.subject, code: 'SUB' }, 
            facultyId: { name: p.facultyName || 'Faculty' } 
        }));
        setSchedule(formattedSchedule);
      } else { setSchedule([]); }

      if (studentsRes.ok) {
        setStudents(await studentsRes.json());
      } else { setStudents([]); }

    } catch (error) { console.error(error); }
    setLoading(false);
  };

  const handleBatchSelect = async (batch) => {
    setSelectedBatch(batch);
    await fetchBatchSchedule(batch._id, selectedDate);
    setStep(2);
  };

  const handleDateChange = async (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    if (selectedBatch) await fetchBatchSchedule(selectedBatch._id, newDate);
  };

  // --- 3. ATTENDANCE HANDLING ---
  const handlePeriodSelect = (period) => {
    setSelectedPeriod(period);
    
    // Initialize attendance state: Everyone is 'NotMarked' by default
    const initial = {};
    students.forEach(s => initial[s._id] = 'NotMarked');
    setAttendance(initial);
    
    setStep(3);
  };

  const handleSubmitAttendance = async () => {
    // --- VALIDATION: Check if anyone is NotMarked ---
    const pendingCount = Object.values(attendance).filter(status => status === 'NotMarked').length;
    if (pendingCount > 0) {
      alert(`Action Blocked! 🚫\n\nYou have ${pendingCount} students marked as "Not Marked".\nPlease ensure all students are marked as Present, Absent, or Excused.`);
      return;
    }

    setLoading(true);
    try {
        const payload = {
            batchId: selectedBatch._id,
            subjectId: selectedPeriod.subjectId._id || "000000000000000000000000", 
            date: selectedDate, 
            records: Object.keys(attendance).map(studentId => ({
                studentId, status: attendance[studentId]
            }))
        };

        const res = await fetch(`${API_BASE}/api/attendance/mark`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) { 
            alert("Attendance Synced! 🚀"); 
            setStep(2); 
        } else {
            alert("Failed to sync.");
        }
    } catch (error) { alert("Network error occurred."); }
    setLoading(false);
  };

  // --- 4. RELATIVE GRADING REPORT LOGIC ---
  const handleGenerateReport = async () => {
    const startDate = prompt("Enter Start Date (YYYY-MM-DD)", selectedDate);
    if(!startDate) return;
    const endDate = prompt("Enter End Date (YYYY-MM-DD)", selectedDate);
    if(!endDate) return;

    setLoading(true);
    try {
      // Fetch raw attendance data from backend
      const res = await fetch(`${API_BASE}/api/attendance/report?batchId=${selectedBatch._id}&startDate=${startDate}&endDate=${endDate}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }
      });
      
      if(res.ok) {
        const data = await res.json(); // Expected: [{ username, name, presentCount }]

        // 1. Calculate the Benchmark (Top Student)
        const maxAttendance = Math.max(...data.map(s => s.presentCount));

        // 2. Generate PDF
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(18);
        doc.text(`Attendance Report: ${selectedBatch.displayName}`, 14, 15);
        doc.setFontSize(11);
        doc.text(`Duration: ${startDate} to ${endDate}`, 14, 22);
        doc.setTextColor(100);
        doc.text(`Benchmark (Top Attendance): ${maxAttendance} Periods = 100%`, 14, 28);

        // Table Data Preparation with Relative Calculation
        const tableBody = data.map(student => {
          const percentage = maxAttendance === 0 ? 0 : ((student.presentCount / maxAttendance) * 100).toFixed(1);
          return [
            student.username, // Noteloom ID
            student.name,
            student.presentCount,
            `${percentage}%` // Relative %
          ];
        });

        doc.autoTable({
          startY: 35,
          head: [['ID', 'Name', 'Periods Attended', 'Relative %']],
          body: tableBody,
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246] }, // Blue header
        });

        doc.save(`Report_${selectedBatch.displayName}_${startDate}.pdf`);
      } else {
        alert("Failed to fetch report data.");
      }
    } catch (error) {
      console.error(error);
      alert("Error generating report.");
    }
    setLoading(false);
  };

  // --- HELPER: ADMISSION MONTH LOGIC (Adapted from ManageDepartments) ---
  const getMonthsForYear = (year) => {
    const currentYear = new Date().getFullYear();
    const currentMonthIndex = new Date().getMonth(); 
    
    // If selected year is the current year, restrict months to current and past
    if (parseInt(year) === currentYear) {
      return months.slice(0, currentMonthIndex + 1);
    }
    // For past (or future) years, show all months
    return months;
  };

  // --- 5. BATCH CRUD OPERATIONS ---
  const handleCreateBatch = async (e) => {
    e.preventDefault();
    // Use MarkAttendance's loading state
    setActionLoading(true);
    
    try {
      // Logic: Slice the sections array based on count if enabled
      const sections = createForm.hasSections 
        ? createForm.sectionNames.slice(0, createForm.sectionCount) 
        : ["N/A"];
      
      const payload = {
        departmentId: createForm.departmentId,
        streamCode: createForm.streamCode,
        admissionYear: createForm.admissionYear,
        admissionMonth: createForm.admissionMonth,
        batchName: createForm.batchName,
        sections: sections
      };

      const res = await fetch(`${API_BASE}/api/batches`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Class Created Successfully!");
        setShowCreateModal(false);
        refreshData(); 
        // Reset form
        setCreateForm(prev => ({ ...prev, batchName: '', hasSections: false, sectionCount: 1 }));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create class");
      }
    } catch (e) {
      console.error(e);
      alert("Error creating batch");
    }
    setActionLoading(false);
  };

  const handleUpdateBatch = async (e) => {
    e.preventDefault();
    if (!editForm._id) return;
    setActionLoading(true);
    
    try {
      const res = await fetch(`${API_BASE}/api/batches/${editForm._id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (res.ok) {
        alert("Batch Updated!");
        setShowEditModal(false);
        refreshData();
      } else {
        alert("Failed to update");
      }
    } catch (e) {
      alert("Error updating batch");
    }
    setActionLoading(false);
  };

  const handleDeleteBatch = async (e, batchId) => {
    e.stopPropagation(); 
    if (!window.confirm("Are you sure you want to delete this batch?")) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/batches/${batchId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }
      });
      if (res.ok) refreshData();
    } catch (error) {
      console.error(error);
    }
  };

  const openEditModal = (e, batch) => {
    e.stopPropagation();
    setEditForm({
      _id: batch._id,
      batchName: batch.displayName?.split(' - ')[0] || '', 
      admissionYear: batch.admissionYear,
      admissionMonth: batch.admissionMonth,
      section: batch.section
    });
    setShowEditModal(true);
  };

  // --- 6. STUDENT MANAGEMENT FUNCTIONS ---
  const openStudentManager = async (e, batch) => {
    e.stopPropagation();
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
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/batches/${managingBatch._id}/enroll`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteloomId: newStudentId })
      });
      const data = await res.json();
      if (res.ok) {
        setBatchStudents([...batchStudents, data.student]);
        setNewStudentId("");
        // Optimistically update count
        setAllBatches(prev => prev.map(b => b._id === managingBatch._id ? {...b, studentCount: b.studentCount + 1} : b));
      } else {
        alert(data.error);
      }
    } catch (e) { console.error(e); }
    setActionLoading(false);
  };

  const handleUnenrollStudent = async (studentId) => {
    if (!window.confirm("Remove student from this class?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/batches/${managingBatch._id}/students/${studentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }
      });
      if (res.ok) {
        setBatchStudents(batchStudents.filter(s => s._id !== studentId));
        setAllBatches(prev => prev.map(b => b._id === managingBatch._id ? {...b, studentCount: b.studentCount - 1} : b));
      }
    } catch (e) { console.error(e); }
  };

  // --- RENDER ---
  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const getAvailableMonths = () => { const cy = new Date().getFullYear(); return parseInt(createForm.admissionYear) === cy ? months.slice(0, new Date().getMonth() + 1) : months; };
  const availableStreams = createForm.departmentId ? departments.find(d => d._id === createForm.departmentId)?.streams?.filter(s => s.isConfigured) || [] : [];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'bg-[#0f111a] text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* HEADER */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <GlassHeader variant="dashboard">
            <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                  <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                      <ArrowLeft className="w-5 h-5" />
                  </button>
                  <UserProfileDropdown user={{name: 'Faculty', role: 'faculty'}} onOptionClick={() => {}} />
                  <div className="flex flex-col">
                      <div className="flex items-center text-sm font-bold opacity-90">
                          <span>Faculty Dashboard</span>
                          <ChevronRight className="w-4 h-4 mx-1 opacity-50" />
                          <span className="text-blue-500">Attendance</span>
                      </div>
                  </div>
              </div>
              <div className="flex items-center space-x-4"><CollegeBannerLogo /><ThemeToggle /></div>
            </div>
        </GlassHeader>
      </div>

      <div className="pt-28 pb-12 max-w-6xl mx-auto px-4">
        <AnimatePresence mode="wait">
          
          {/* --- STEP 1: BATCH SELECTION --- */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Select Batches</h1>
                    <p className="text-gray-500 mt-2">Manage your classes, students, or mark attendance.</p>
                </div>
                <div className="flex gap-3">
                    <div className={`flex items-center gap-2 p-2 rounded-xl border shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <Filter size={18} className="text-gray-500 ml-2"/>
                        <select value={selectedDeptFilter} onChange={(e) => setSelectedDeptFilter(e.target.value)} className={`bg-transparent outline-none text-sm font-medium pr-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            <option value="ALL" className={isDarkMode ? "bg-gray-900" : ""}>All Departments</option>
                            {departments.map(d => (<option key={d._id} value={d._id} className={isDarkMode ? "bg-gray-900" : ""}>{d.name}</option>))}
                        </select>
                    </div>
                    <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all">
                        <Plus size={18} /> New Class
                    </button>
                </div>
              </div>

              {loading ? ( <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>
              ) : filteredBatches.length === 0 ? (
                 <div className="text-center py-20 opacity-50 border-2 border-dashed rounded-3xl"><Layers className="w-16 h-16 mx-auto mb-4"/><p>No batches found.</p></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBatches.map((batch) => (
                    <motion.div key={batch._id} whileHover={{ y: -5 }} onClick={() => handleBatchSelect(batch)} className={`relative overflow-hidden p-6 rounded-3xl border cursor-pointer transition-all shadow-lg group ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-blue-500' : 'bg-white border-gray-200 hover:shadow-xl hover:border-blue-300'}`}>
                      {batch.isAlumni && (<div className="absolute top-0 right-0 bg-yellow-500/20 text-yellow-600 text-[10px] font-bold px-3 py-1 rounded-bl-xl border-b border-l border-yellow-500/20 z-20">ALUMNI</div>)}
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-600'}`}><GraduationCap size={20} /></div>
                            <div><h4 className="text-sm font-bold opacity-90">{batch.streamName}</h4><span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} opacity-70`}>{batch.streamCode}</span></div>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>{batch.termLabel}</span>
                      </div>
                      <div className="mb-4">
                          <h2 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{batch.displayName}</h2>
                          <div className="mt-2"><div className="flex items-center gap-2 mt-1"><p className="text-sm opacity-60 font-medium">{batch.admissionMonth} Intake</p>{batch.section !== 'N/A' && <span className={`text-xs font-bold px-2 py-0.5 rounded ${isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>Sec {batch.section}</span>}</div></div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                        <span className="flex items-center gap-1.5 text-sm opacity-70 font-medium"><Users className="w-4 h-4" /> {batch.studentCount} Students</span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={(e) => e.stopPropagation()}>
                            <button onClick={(e) => openStudentManager(e, batch)} className="p-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300 transition-colors" title="Manage Students"><UserPlus size={16} /></button>
                            <button onClick={(e) => openEditModal(e, batch)} className="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300 transition-colors" title="Edit Batch"><Edit2 size={16} /></button>
                            <button onClick={(e) => handleDeleteBatch(e, batch._id)} className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/50 dark:text-red-300 transition-colors" title="Delete Batch"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* --- STEP 2: ROUTINE VIEW --- */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    {selectedBatch.displayName}
                    <span className="text-xs font-normal bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Section {selectedBatch.section}</span>
                  </h2>
                  <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4" /> {currentDayName} Routine
                  </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* REPORT BUTTON */}
                    <button 
                        onClick={handleGenerateReport} 
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm border shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}
                    >
                        <Download size={16}/> Report
                    </button>

                    {/* DATE SELECTOR */}
                    <div className={`flex items-center gap-2 p-2 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <Calendar className="text-gray-500 w-5 h-5 ml-2"/>
                        <input type="date" value={selectedDate} onChange={handleDateChange} className={`bg-transparent outline-none text-sm font-bold p-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}/>
                    </div>
                </div>
              </div>

              {schedule.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {schedule.map((period, idx) => (
                        <div key={idx} onClick={() => handlePeriodSelect(period)} className={`min-w-[280px] p-5 rounded-2xl border cursor-pointer transition-all hover:-translate-y-1 relative overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-blue-500' : 'bg-white border-gray-200 hover:shadow-lg'}`}>
                            <div className="flex justify-between mb-4">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Period {period.periodNumber}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>{period.startTime} - {period.endTime}</span>
                            </div>
                            <h3 className="text-lg font-bold truncate">{period.subjectId?.name || period.subjectId || "Subject"}</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500 border-t border-gray-700/50 pt-3"><BookOpen className="w-3 h-3" /> {period.facultyId?.name || "Faculty"}</div>
                        </div>
                    ))}
                </div>
              ) : (
                <div className="p-10 border border-dashed border-gray-500/30 rounded-2xl text-center opacity-60">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50"/>
                    <h3 className="text-lg font-bold">No Classes Scheduled</h3>
                    <p>There are no periods scheduled for {currentDayName} ({selectedDate}).</p>
                </div>
              )}
            </motion.div>
          )}

          {/* --- STEP 3: MARK ATTENDANCE --- */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
              {/* Header Bar */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 sticky top-24 z-30 p-4 rounded-2xl backdrop-blur-xl border border-gray-700/50 bg-gray-900/80 shadow-sm">
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedPeriod?.subjectId?.name || selectedPeriod?.subjectId}</h2>
                  <p className="text-xs text-gray-400">{selectedPeriod?.startTime} - {selectedPeriod?.endTime} • {selectedBatch.displayName}</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                   {/* Search */}
                   <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                    <input type="text" placeholder="Search ID or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-4 py-2 text-sm focus:border-blue-500 outline-none transition-all text-white"/>
                  </div>
                   {/* Stats */}
                   <div className="flex gap-3 text-xs font-bold text-gray-300 bg-gray-800 p-2 rounded-xl border border-gray-700">
                       <span className="flex items-center gap-1 text-emerald-400"><Check size={14}/> {Object.values(attendance).filter(v => v === 'Present').length}</span>
                       <span className="flex items-center gap-1 text-red-400"><X size={14}/> {Object.values(attendance).filter(v => v === 'Absent').length}</span>
                       <span className="flex items-center gap-1 text-yellow-400"><FileText size={14}/> {Object.values(attendance).filter(v => v === 'Excused').length}</span>
                   </div>
                </div>
              </div>

              {/* Student List with New Toggle */}
              <div className="space-y-3 pb-24">
                {filteredStudents.length === 0 ? <div className="text-center opacity-50 py-10">No students found.</div> : filteredStudents.map(student => {
                  const status = attendance[student._id] || 'NotMarked';
                  const isPending = status === 'NotMarked';

                  return (
                    <motion.div layout key={student._id} 
                      className={`
                        flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border transition-all
                        ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}
                        ${isPending ? 'border-l-4 border-l-gray-500 opacity-90' : ''}
                        ${status === 'Present' ? 'border-l-4 border-l-emerald-500 bg-emerald-500/5' : ''}
                        ${status === 'Absent' ? 'border-l-4 border-l-red-500 bg-red-500/5' : ''}
                        ${status === 'Excused' ? 'border-l-4 border-l-yellow-500 bg-yellow-500/5' : ''}
                      `}
                    >
                      <div className="flex items-center gap-4 mb-3 md:mb-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold">{student.name}</h3>
                          {/* Showing Noteloom ID (Username) */}
                          <p className="text-xs font-mono opacity-60 bg-gray-500/10 px-1.5 py-0.5 rounded w-fit mt-0.5">
                            ID: {student.username}
                          </p>
                        </div>
                      </div>
                      
                      {/* NEW TOGGLE COMPONENT */}
                      <AttendanceToggle 
                        status={status}
                        onChange={(newVal) => setAttendance(prev => ({...prev, [student._id]: newVal}))}
                      />
                    </motion.div>
                  )
                })}
              </div>

              {/* Submit Button */}
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4">
                 <button onClick={handleSubmitAttendance} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-2xl shadow-blue-600/40 flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:scale-100">
                    {loading ? <Loader2 className="animate-spin"/> : <CheckCircle className="w-5 h-5"/>}
                    {loading ? 'Syncing...' : 'Submit Attendance'}
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- MODALS (Create/Edit/StudentManager) --- */}
      {/* (Keeping existing modals logic same as provided, just ensuring correct state usage) */}
      <AnimatePresence>
        {showCreateModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`w-full max-w-2xl rounded-2xl border shadow-2xl p-6 overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold">Create New Class</h3><button onClick={() => setShowCreateModal(false)} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"><X size={20}/></button></div>
                    <form onSubmit={handleCreateBatch} className="space-y-4">
                        {/* ... (Existing Form Fields) ... */}
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-xs font-bold uppercase opacity-50">Department</label><select className={`w-full p-3 rounded-xl border ${inputThemeClass}`} value={createForm.departmentId} onChange={e => setCreateForm({...createForm, departmentId: e.target.value, streamCode: ''})}><option value="" className={isDarkMode ? "bg-gray-900" : ""}>Select Dept</option>{departments.map(d => <option key={d._id} value={d._id} className={isDarkMode ? "bg-gray-900" : ""}>{d.name}</option>)}</select></div>
                            <div><label className="text-xs font-bold uppercase opacity-50">Stream</label><select className={`w-full p-3 rounded-xl border ${inputThemeClass}`} value={createForm.streamCode} onChange={e => setCreateForm({...createForm, streamCode: e.target.value})} disabled={!createForm.departmentId}><option value="" className={isDarkMode ? "bg-gray-900" : ""}>Select Stream</option>{availableStreams.map(s => <option key={s.code} value={s.code} className={isDarkMode ? "bg-gray-900" : ""}>{s.name} ({s.code})</option>)}</select></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-xs font-bold uppercase opacity-50">Admission Year</label><input type="number" className={`w-full p-3 rounded-xl border ${inputThemeClass}`} value={createForm.admissionYear} onChange={e => setCreateForm({...createForm, admissionYear: e.target.value})}/></div>
                            <div>
  <label className="text-xs font-bold uppercase opacity-50">Admission Month</label>
  <select 
    className={`w-full p-3 rounded-xl border ${inputThemeClass}`} 
    value={createForm.admissionMonth} 
    onChange={e => setCreateForm({...createForm, admissionMonth: e.target.value})}
  >
    <option value="" className={isDarkMode ? "bg-gray-900" : ""}>Select</option>
    {/* Passes the specific year from createForm to filter months */}
    {getMonthsForYear(createForm.admissionYear).map(m => (
      <option key={m} value={m} className={isDarkMode ? "bg-gray-900" : ""}>{m}</option>
    ))}
  </select>
</div>
                        </div>
                        <div><label className="text-xs font-bold uppercase opacity-50">Class Name</label><input type="text" className={`w-full p-3 rounded-xl border ${inputThemeClass}`} placeholder="e.g. CSE A 2024" value={createForm.batchName} onChange={e => setCreateForm({...createForm, batchName: e.target.value})}/></div>
                        <div className="flex items-center gap-2"><input type="checkbox" checked={createForm.hasSections} onChange={e => setCreateForm({...createForm, hasSections: e.target.checked})} className="w-5 h-5 accent-blue-500"/><label>Divide into Sections?</label></div>
                        {createForm.hasSections && (<div className="pl-6 border-l-2 border-gray-700"><div className="flex items-center gap-4 mb-2"><label>Count:</label><input type="number" min="1" max="5" value={createForm.sectionCount} onChange={e => setCreateForm({...createForm, sectionCount: e.target.value})} className={`w-16 p-2 rounded border ${inputThemeClass}`}/></div><div className="flex gap-2">{createForm.sectionNames.slice(0, createForm.sectionCount).map((name, i) => (<input key={i} value={name} onChange={e => { const n = [...createForm.sectionNames]; n[i] = e.target.value; setCreateForm({...createForm, sectionNames: n}); }} className={`w-12 p-2 rounded border text-center ${inputThemeClass}`}/>))}</div></div>)}
                        <div className="flex justify-end pt-4"><button type="submit" disabled={actionLoading} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">{actionLoading ? 'Creating...' : 'Create Class'}</button></div>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold">Edit Class Details</h3><button onClick={() => setShowEditModal(false)} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"><X size={20}/></button></div>
                    <form onSubmit={handleUpdateBatch} className="space-y-4">
                        <div><label className="text-xs font-bold uppercase opacity-50">Class Name</label><input type="text" className={`w-full p-3 rounded-xl border ${inputThemeClass}`} value={editForm.batchName} onChange={e => setEditForm({...editForm, batchName: e.target.value})}/></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-xs font-bold uppercase opacity-50">Year</label><input type="number" className={`w-full p-3 rounded-xl border ${inputThemeClass}`} value={editForm.admissionYear} onChange={e => setEditForm({...editForm, admissionYear: e.target.value})}/></div>
                            <div><label className="text-xs font-bold uppercase opacity-50">Section</label><input type="text" className={`w-full p-3 rounded-xl border ${inputThemeClass}`} value={editForm.section} onChange={e => setEditForm({...editForm, section: e.target.value})}/></div>
                        </div>
                        <div>
  <label className="text-xs font-bold uppercase opacity-50">Admission Month</label>
  <select 
    className={`w-full p-3 rounded-xl border ${inputThemeClass}`} 
    value={editForm.admissionMonth} 
    onChange={e => setEditForm({...editForm, admissionMonth: e.target.value})}
  >
    <option value="" className={isDarkMode ? "bg-gray-900" : ""}>Select</option>
    {/* Passes the specific year from editForm to filter months */}
    {getMonthsForYear(editForm.admissionYear).map(m => (
      <option key={m} value={m} className={isDarkMode ? "bg-gray-900" : ""}>{m}</option>
    ))}
  </select>
</div>
                        <div className="flex justify-end pt-4"><button type="submit" disabled={actionLoading} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">{actionLoading ? 'Saving...' : 'Update'}</button></div>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {managingBatch && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <div><h3 className="text-xl font-bold flex items-center gap-2">Manage Students</h3><p className="text-sm opacity-60">Batch: <span className="text-purple-500 font-mono">{managingBatch.displayName}</span></p></div>
                        <button onClick={() => setManagingBatch(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg"><X className="w-5 h-5"/></button>
                    </div>
                    <div className={`p-6 border-b ${isDarkMode ? 'border-gray-800 bg-gray-800/50' : 'border-gray-100 bg-gray-50'}`}>
                        <div className="flex gap-2">
                            <div className="relative flex-1"><Search className="absolute left-3 top-3 w-4 h-4 opacity-40"/><input placeholder="Enter Noteloom ID (Username)" value={newStudentId} onChange={e => setNewStudentId(e.target.value)} className={`w-full pl-10 p-2.5 rounded-xl border outline-none ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`}/></div>
                            <button onClick={handleEnrollStudent} disabled={actionLoading} className={`px-4 py-2 rounded-xl font-bold text-white transition-all ${actionLoading ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-500'}`}>{actionLoading ? 'Adding...' : 'Enroll'}</button>
                        </div>
                    </div>
                    <div className="p-2 max-h-[400px] overflow-y-auto">
                        <table className="w-full text-left">
                            <thead className="text-xs uppercase opacity-50 font-bold border-b border-gray-200 dark:border-gray-700"><tr><th className="p-3">Name</th><th className="p-3">ID</th><th className="p-3 text-right">Action</th></tr></thead>
                            <tbody>
                                {batchStudents.map(student => (
                                    <tr key={student._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="p-3 font-medium">{student.name}</td><td className="p-3 font-mono text-sm opacity-70">{student.username}</td>
                                        <td className="p-3 text-right"><button onClick={() => handleUnenrollStudent(student._id)} className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ml-auto"><UserMinus size={14}/> Remove</button></td>
                                    </tr>
                                ))}
                                {batchStudents.length === 0 && <tr><td colSpan="3" className="p-10 text-center opacity-40">No students enrolled yet.</td></tr>}
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

export default MarkAttendance;