import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Search, Filter, Upload, CheckCircle2, 
  AlertCircle, Users, BookOpen, Send, Lock, 
  FileSpreadsheet, FileWarning, Eye, Unlock
} from "lucide-react";

/* =========================================================================
   1. MOCK DATA 
   ========================================================================= */

const BATCHES = ["2022-2026", "2023-2027", "2024-2028", "2025-2029"];
const STREAMS = ["Computer Science (CSE)", "Electrical (EE)", "Electronics (ECE)", "Mechanical (ME)"];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

// Mock database representing the current release status of results
const INITIAL_RELEASE_STATUS = {
  "2023-2027_CSE_3": { status: "PUBLISHED", date: "10-Jan-2025", totalStudents: 120, passPercentage: 94 },
  "2023-2027_CSE_4": { status: "DRAFT", date: null, totalStudents: 120, passPercentage: 0 },
  "2022-2026_EE_5": { status: "PROCESSING", date: null, totalStudents: 60, passPercentage: 0 },
};

// Mock student list for previewing before publishing
const PREVIEW_STUDENTS = [
  { roll: "12024001001", name: "S. Nath", sgpa: 9.12, result: "PASS", credits: 21 },
  { roll: "12024001002", name: "A. Sharma", sgpa: 8.45, result: "PASS", credits: 21 },
  { roll: "12024001003", name: "R. Kumar", sgpa: 5.20, result: "BACKLOG", credits: 17 },
  { roll: "12024001004", name: "M. Singh", sgpa: 7.80, result: "PASS", credits: 21 },
  { roll: "12024001005", name: "P. Das", sgpa: 9.40, result: "PASS", credits: 21 },
];

/* =========================================================================
   2. MAIN COMPONENT
   ========================================================================= */

const AdminUniversityMarks = () => {
  const navigate = useNavigate();

  // Selections
  const [selectedBatch, setSelectedBatch] = useState(BATCHES[1]); // Default 2023-2027
  const [selectedStream, setSelectedStream] = useState(STREAMS[0]); // Default CSE
  const [selectedSem, setSelectedSem] = useState(4); // Default Sem 4

  // Database State
  const [releaseStatusDB, setReleaseStatusDB] = useState(INITIAL_RELEASE_STATUS);
  
  // UI State
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Compute Current Status Key
  const currentKey = `${selectedBatch}_${selectedStream.split(" ")[0]}_${selectedSem}`;
  const currentRecord = releaseStatusDB[currentKey] || { status: "NOT_UPLOADED", date: null, totalStudents: 0, passPercentage: 0 };

  // Handlers
  const handlePublish = async () => {
    setIsProcessing(true);
    // Simulate API Call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setReleaseStatusDB(prev => ({
      ...prev,
      [currentKey]: {
        status: "PUBLISHED",
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        totalStudents: 120,
        passPercentage: 92
      }
    }));
    
    setIsProcessing(false);
    setIsPublishModalOpen(false);
  };

  const handleRevoke = () => {
    if(window.confirm("Are you sure you want to revoke these results? Students will no longer see them.")) {
      setReleaseStatusDB(prev => ({
        ...prev,
        [currentKey]: { ...prev[currentKey], status: "DRAFT", date: null }
      }));
    }
  };

  // Status Badge Helper
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'PUBLISHED': return { color: 'text-green-400 bg-green-400/10 border-green-500/20', icon: CheckCircle2, text: 'Published & Live' };
      case 'DRAFT': return { color: 'text-yellow-400 bg-yellow-400/10 border-yellow-500/20', icon: FileWarning, text: 'Draft (Ready to Publish)' };
      case 'PROCESSING': return { color: 'text-blue-400 bg-blue-400/10 border-blue-500/20', icon: AlertCircle, text: 'Processing Data' };
      default: return { color: 'text-gray-400 bg-gray-800 border-gray-700', icon: Lock, text: 'No Data Uploaded' };
    }
  };

  const statusInfo = getStatusDisplay(currentRecord.status);

  return (
    <div className="min-h-screen bg-[#050509] text-gray-100 font-sans p-4 md:p-8 pb-32 relative">
      <div className="fixed top-0 left-0 w-full h-[300px] bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] mx-auto">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-white tracking-tight">Results Controller</h1>
            <p className="text-gray-400 mt-2 text-sm">Manage result declarations, upload marksheets, and control student visibility.</p>
          </div>
          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1B26] border border-gray-700 hover:bg-gray-800 rounded-xl text-sm font-bold text-gray-300 transition-all">
                <FileSpreadsheet className="w-4 h-4 text-green-400" /> Export All Data
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- LEFT: CONTROL PANEL --- */}
          <div className="lg:col-span-4 space-y-6">
             
             {/* Configuration Card */}
             <div className="bg-[#1A1B26] border border-gray-800 rounded-3xl p-6 shadow-2xl">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                   <Filter className="w-5 h-5 text-indigo-400" /> Configuration
                </h2>
                
                <div className="space-y-5">
                   <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Select Batch</label>
                     <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 appearance-none">
                        {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
                     </select>
                   </div>
                   
                   <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Select Stream / Course</label>
                     <select value={selectedStream} onChange={e => setSelectedStream(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 appearance-none">
                        {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                   </div>

                   <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Select Semester</label>
                     <div className="grid grid-cols-4 gap-2">
                        {SEMESTERS.map(sem => (
                           <button 
                             key={sem} 
                             onClick={() => setSelectedSem(sem)}
                             className={`py-2 rounded-lg text-sm font-bold transition-all ${selectedSem === sem ? 'bg-indigo-600 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'}`}
                           >
                              S{sem}
                           </button>
                        ))}
                     </div>
                   </div>
                </div>
             </div>

             {/* Action / Status Card */}
             <div className="bg-gradient-to-br from-[#131420] to-[#1A1B26] border border-gray-800 rounded-3xl p-6 shadow-2xl">
                 <div className="mb-6 pb-6 border-b border-gray-800 text-center">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">Current Status</p>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${statusInfo.color} font-bold text-sm`}>
                       <statusInfo.icon className="w-4 h-4" /> {statusInfo.text}
                    </div>
                 </div>

                 <div className="space-y-3">
                    {currentRecord.status === 'PUBLISHED' ? (
                       <button onClick={handleRevoke} className="w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold text-sm transition-colors flex items-center justify-center gap-2">
                          <Lock className="w-4 h-4" /> Revoke Results
                       </button>
                    ) : currentRecord.status === 'DRAFT' ? (
                       <button onClick={() => setIsPublishModalOpen(true)} className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2">
                          <Send className="w-4 h-4" /> Publish to Students
                       </button>
                    ) : (
                       <button className="w-full py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-sm border border-gray-700 transition-colors flex items-center justify-center gap-2">
                          <Upload className="w-4 h-4" /> Upload Marksheet CSV
                       </button>
                    )}
                 </div>
             </div>

          </div>

          {/* --- RIGHT: DATA PREVIEW --- */}
          <div className="lg:col-span-8">
             <div className="bg-[#131420] border border-gray-800 rounded-3xl p-6 h-full flex flex-col">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                   <div>
                      <h2 className="text-xl font-bold text-white">Student Data Preview</h2>
                      <p className="text-gray-400 text-sm mt-1">{selectedBatch} • {selectedStream} • Semester {selectedSem}</p>
                   </div>
                   <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                         <p className="text-gray-500 font-bold uppercase text-[10px] tracking-wider mb-1">Total Students</p>
                         <p className="text-white font-bold text-lg">{currentRecord.totalStudents || '--'}</p>
                      </div>
                      <div className="text-center border-l border-gray-800 pl-6">
                         <p className="text-gray-500 font-bold uppercase text-[10px] tracking-wider mb-1">Pass %</p>
                         <p className="text-green-400 font-bold text-lg">{currentRecord.passPercentage ? `${currentRecord.passPercentage}%` : '--'}</p>
                      </div>
                   </div>
                </div>

                {currentRecord.status === 'NOT_UPLOADED' ? (
                   <div className="flex-1 flex flex-col items-center justify-center opacity-40 py-20">
                      <FileSpreadsheet className="w-16 h-16 text-gray-500 mb-4" />
                      <h3 className="text-xl font-bold text-gray-300">No Data Available</h3>
                      <p className="text-gray-500 mt-2">Upload the semester marks CSV to view and publish.</p>
                   </div>
                ) : (
                   <div className="flex-1">
                      {/* Search Bar for Table */}
                      <div className="relative mb-4">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                         <input type="text" placeholder="Search by Roll No or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-black/40 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                      </div>

                      {/* Data Table */}
                      <div className="overflow-x-auto rounded-xl border border-gray-800">
                         <table className="w-full text-left border-collapse">
                            <thead>
                               <tr className="bg-gray-900/80 text-xs uppercase tracking-wider text-gray-400 border-b border-gray-800">
                                  <th className="p-4 font-bold">Roll Number</th>
                                  <th className="p-4 font-bold">Student Name</th>
                                  <th className="p-4 font-bold text-center">Credits</th>
                                  <th className="p-4 font-bold text-center">SGPA</th>
                                  <th className="p-4 font-bold text-center">Result</th>
                                  <th className="p-4 font-bold text-center">Action</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                               {PREVIEW_STUDENTS.map((student, idx) => (
                                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                                     <td className="p-4 font-mono text-sm text-gray-300">{student.roll}</td>
                                     <td className="p-4 text-sm font-bold text-white">{student.name}</td>
                                     <td className="p-4 text-sm text-center text-gray-400">{student.credits}</td>
                                     <td className="p-4 text-sm text-center font-bold font-mono text-indigo-300">{student.sgpa.toFixed(2)}</td>
                                     <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${student.result === 'PASS' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                           {student.result}
                                        </span>
                                     </td>
                                     <td className="p-4 text-center">
                                        <button className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 transition-colors">
                                           <Eye className="w-4 h-4" />
                                        </button>
                                     </td>
                                  </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>
                   </div>
                )}
             </div>
          </div>

        </div>
      </div>

      {/* --- PUBLISH CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {isPublishModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isProcessing && setIsPublishModalOpen(false)} />
             <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative z-10 w-full max-w-md bg-[#131420] border border-gray-700 rounded-2xl shadow-2xl p-6 text-center">
                
                <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                   <Send className="w-8 h-8 text-indigo-400" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">Publish Results?</h3>
                <p className="text-gray-400 text-sm mb-6">
                  You are about to publish the Semester {selectedSem} results for {selectedBatch} ({selectedStream}). This action will make the marks visible to all students in their portals immediately.
                </p>

                <div className="flex gap-3">
                   <button 
                     onClick={() => setIsPublishModalOpen(false)} 
                     disabled={isProcessing}
                     className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-sm transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={handlePublish} 
                     disabled={isProcessing}
                     className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                   >
                     {isProcessing ? (
                       <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Publishing...</>
                     ) : "Yes, Publish Now"}
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminUniversityMarks;