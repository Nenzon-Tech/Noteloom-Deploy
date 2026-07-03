import { API_BASE } from '@/utils/config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, Clock, BookOpen, Plus, Save, 
  Trash2, ChevronLeft, ChevronRight, CheckCircle, List, 
  Users, Building, Layers, Edit3, X, FileText, ArrowLeft, Wifi,
  MapPin, User, MoreHorizontal, Lock, AlertCircle // <--- ADDED Lock HERE
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext.jsx';
import GlassHeader from '@/components/common/GlassHeader.jsx';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import CollegeBannerLogo from '@/components/common/CollegeBannerLogo.jsx';
import ThemeToggle from '@/components/common/ThemeToggle.jsx';
import UserProfileDropdown from '@/components/common/UserProfileDropdown.jsx';



// --- SUB-COMPONENT: Personal Calendar (Revamped Google-Cal Style) ---
const PersonalCalendar = ({ theme, user }) => {
  const [events, setEvents] = useState([]);
  // View State: Tracks which month/year is visible in the grid
  const [viewDate, setViewDate] = useState(new Date());
  // Selection State: Tracks which specific day is selected for editing
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [newEvent, setNewEvent] = useState({ title: '', type: 'Note', description: '' });
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const res = await fetch(`${API_BASE}/api/calendar/events`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }
    });
    if(res.ok) setEvents(await res.json());
  };

  const handleAddEvent = async () => {
    if(!newEvent.title) return;
    await fetch(`${API_BASE}/api/calendar/events`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newEvent, date: selectedDate })
    });
    setNewEvent({ title: '', type: 'Note', description: '' });
    fetchEvents();
  };

  const handleDelete = async (id) => {
    await fetch(`${API_BASE}/api/calendar/events/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }
    });
    fetchEvents();
  };

  // --- Calendar Logic ---
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay(); // 0 = Sunday

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInCurrentMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month); // Padding for start of month
  
  // Create array for grid: [null, null, 1, 2, 3...]
  const calendarDays = Array(firstDay).fill(null).concat([...Array(daysInCurrentMonth).keys()].map(i => i + 1));

  const changeMonth = (offset) => {
    const newDate = new Date(viewDate.setMonth(viewDate.getMonth() + offset));
    setViewDate(new Date(newDate));
  };

  // Helpers
  const formatDateString = (day) => {
    if(!day) return null;
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  // Filter events for the selected day panel
  const selectedDayEvents = events.filter(e => e.date === selectedDate);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px]">
      
      {/* LEFT: CALENDAR GRID (Google Cal Style) */}
      <div className={`flex-1 p-6 rounded-2xl border flex flex-col ${theme.cardBg}`}>
        
        {/* Header: Month Nav */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold capitalize">
            {viewDate.toLocaleString('default', { month: 'long' })} <span className="text-blue-500">{year}</span>
          </h2>
          <div className="flex gap-2">
            <button onClick={() => changeMonth(-1)} className={`p-2 rounded-lg border ${theme.inputBg} hover:brightness-95`}><ChevronLeft/></button>
            <button onClick={() => setViewDate(new Date())} className={`px-4 py-2 text-sm font-bold rounded-lg border ${theme.inputBg} hover:brightness-95`}>Today</button>
            <button onClick={() => changeMonth(1)} className={`p-2 rounded-lg border ${theme.inputBg} hover:brightness-95`}><ChevronRight/></button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 mb-2 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-xs font-bold uppercase opacity-50 py-2">{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 flex-1 gap-2 auto-rows-fr">
          {calendarDays.map((day, idx) => {
            const dateStr = formatDateString(day);
            const isSelected = dateStr === selectedDate;
            const dayEvents = dateStr ? events.filter(e => e.date === dateStr) : [];
            const hasEvent = dayEvents.length > 0;

            return (
              <div 
                key={idx} 
                onClick={() => day && setSelectedDate(dateStr)}
                className={`
                  relative p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group
                  ${!day ? 'invisible' : ''}
                  ${isSelected ? 'ring-2 ring-blue-500 bg-blue-500/5 border-blue-500/50' : `${theme.inputBg} hover:brightness-95 border-transparent`}
                `}
              >
                <div className="flex justify-between items-start">
                  <span className={`
                    text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
                    ${isToday(day) ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'opacity-70'}
                  `}>
                    {day}
                  </span>
                </div>
                
                {/* Visual Indicators (Dots) */}
                <div className="flex gap-1 flex-wrap content-end mt-1">
                  {dayEvents.slice(0, 4).map((ev, i) => (
                    <div key={i} className={`
                      w-1.5 h-1.5 rounded-full 
                      ${ev.type === 'Task' ? 'bg-orange-500' : ev.type === 'Event' ? 'bg-purple-500' : 'bg-emerald-500'}
                    `} title={ev.title}/>
                  ))}
                  {dayEvents.length > 4 && <span className="text-[8px] opacity-50">+</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: SELECTED DAY AGENDA (Interactive Panel) */}
      <div className={`lg:w-1/3 p-6 rounded-2xl border flex flex-col ${theme.cardBg}`}>
        <div className="mb-6 pb-6 border-b border-gray-500/10">
          <div className="text-sm font-bold opacity-50 uppercase">Schedule For</div>
          <h2 className="text-3xl font-bold mt-1">
             {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}
          </h2>
          <div className="text-blue-500 font-medium text-lg">
             {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        {/* Add Event Form */}
        <div className="space-y-3 mb-6">
          <div className="flex gap-2">
            <select 
              value={newEvent.type} 
              onChange={e => setNewEvent({...newEvent, type: e.target.value})}
              className={`p-3 rounded-xl border outline-none text-sm font-bold ${theme.inputBg}`}
            >
              <option value="Note">Note</option>
              <option value="Task">Task</option>
              <option value="Event">Event</option>
            </select>
            <input 
              placeholder="Add Title..."
              value={newEvent.title} 
              onChange={e => setNewEvent({...newEvent, title: e.target.value})}
              className={`flex-1 p-3 rounded-xl border outline-none text-sm ${theme.inputBg}`}
            />
            <button onClick={handleAddEvent} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/30">
              <Plus size={20}/>
            </button>
          </div>
          <textarea 
            placeholder="Add details (optional)..."
            value={newEvent.description} 
            onChange={e => setNewEvent({...newEvent, description: e.target.value})}
            className={`w-full p-3 rounded-xl border outline-none text-sm h-20 resize-none ${theme.inputBg}`}
          />
        </div>

        {/* Events List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {selectedDayEvents.length === 0 ? (
             <div className="text-center py-10 opacity-40 flex flex-col items-center">
                <Clock size={40} className="mb-2"/>
                <p>No plans for this day.</p>
             </div>
          ) : (
            selectedDayEvents.map(evt => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                key={evt._id} 
                className={`p-4 rounded-xl border flex justify-between items-start group hover:shadow-md transition-all ${theme.inputBg}`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      evt.type === 'Task' ? 'bg-orange-500/10 text-orange-500' :
                      evt.type === 'Event' ? 'bg-purple-500/10 text-purple-500' :
                      'bg-emerald-500/10 text-emerald-500'
                    }`}>{evt.type}</span>
                  </div>
                  <h4 className="font-bold">{evt.title}</h4>
                  {evt.description && <p className="text-xs opacity-70 mt-1 whitespace-pre-wrap">{evt.description}</p>}
                </div>
                <button onClick={() => handleDelete(evt._id)} className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

// --- SUB-COMPONENT: Routine Builder / Viewer ---
const RoutineBuilder = ({ theme, role, user, selectedBatchProp }) => {
  const { isDarkMode } = useTheme(); 
  
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedStream, setSelectedStream] = useState(null);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(selectedBatchProp || null);
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [activeDay, setActiveDay] = useState('Monday');
  const [periods, setPeriods] = useState([]);
  const [isStudentEnrolled, setIsStudentEnrolled] = useState(true);

  useEffect(() => { 
    if (role !== 'student') {
        fetchDepts(); 
    }
    fetchBatches(); 
  }, []);

  useEffect(() => { 
    if(selectedBatch) fetchRoutine(); 
  }, [selectedBatch, activeDay]);

  const fetchDepts = async () => {
    const res = await fetch(`${API_BASE}/api/departments`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }});
    if(res.ok) {
        const data = await res.json();
        setDepartments(data);
        if(role === 'faculty' && user.department) {
            const myDept = data.find(d => d.name === user.department);
            if(myDept) setSelectedDept(myDept);
        }
    }
  };

  const fetchBatches = async () => {
    const res = await fetch(`${API_BASE}/api/batches`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }});
    if(res.ok) {
        const allBatches = await res.json();
        setBatches(allBatches);

        if (role === 'student') {
            const myBatch = allBatches.find(b => b.students && b.students.includes(user.id));
            if (myBatch) {
                setSelectedBatch(myBatch);
                setIsStudentEnrolled(true);
            } else {
                setIsStudentEnrolled(false);
            }
        }
    }
  };

  const fetchRoutine = async () => {
    const res = await fetch(`${API_BASE}/api/routine/batch/${selectedBatch._id}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }});
    if(res.ok) {
      const data = await res.json();
      const dayRoutine = data.find(r => r.dayOfWeek === activeDay);
      // Initialize 10 slots if empty for faculty/admin editing
      setPeriods(dayRoutine ? dayRoutine.periods : Array(10).fill(null).map((_, i) => ({ 
        periodNumber: i+1, startTime: '', endTime: '', subject: '', facultyName: '', roomNo: '', isBreak: false 
      })));
    }
  };

  const handleSaveRoutine = async () => {
    await fetch(`${API_BASE}/api/routine/batch/${selectedBatch._id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ dayOfWeek: activeDay, periods })
    });
    alert('Routine Saved!');
  };

  const updatePeriod = (index, field, value) => {
    if(role === 'student') return;
    const newPeriods = [...periods];
    newPeriods[index][field] = value;
    setPeriods(newPeriods);
  };

  const filteredBatches = batches.filter(b => 
    selectedDept && b.departmentId?._id === selectedDept._id && 
    (!selectedStream || b.streamCode === selectedStream.code)
  );

  // --- STUDENT VIEW LOGIC ---
  const getVisibleStudentPeriods = () => {
    if (!periods || periods.length === 0) return [];
    
    // Find index of last period that has content (Subject or Break or Times defined)
    const lastActiveIndex = periods.map(p => p).reverse().findIndex(p => 
        (p.subject && p.subject.trim() !== "") || 
        p.isBreak || 
        (p.startTime && p.endTime)
    );
    
    if (lastActiveIndex === -1) return []; // Empty routine
    
    // findIndex on reverse gives index from end. Convert to forward index.
    const forwardIndex = periods.length - 1 - lastActiveIndex;
    
    return periods.slice(0, forwardIndex + 1);
  };

  const studentPeriods = getVisibleStudentPeriods();

  return (
    <div className="space-y-6">
      
      {/* --- SELECTION HEADER (Faculty/Admin Only) --- */}
      {role !== 'student' && !selectedBatchProp && (
        <div className={`p-6 rounded-2xl border grid grid-cols-1 md:grid-cols-3 gap-4 ${theme.cardBg}`}>
            <div className="space-y-1">
                <label className="text-xs font-bold uppercase opacity-50">Department</label>
                <select className={`w-full p-3 rounded-xl border ${theme.inputBg}`} onChange={e => setSelectedDept(departments.find(d => d._id === e.target.value))} value={selectedDept?._id || ''}>
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
            </div>
            <div className="space-y-1">
                <label className="text-xs font-bold uppercase opacity-50">Stream</label>
                <select className={`w-full p-3 rounded-xl border ${theme.inputBg}`} onChange={e => setSelectedStream(selectedDept?.streams.find(s => s.code === e.target.value))} disabled={!selectedDept}>
                    <option value="">Select Stream</option>
                    {selectedDept?.streams.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                </select>
            </div>
            <div className="space-y-1">
                <label className="text-xs font-bold uppercase opacity-50">Batch / Class</label>
                <select className={`w-full p-3 rounded-xl border ${theme.inputBg}`} onChange={e => setSelectedBatch(batches.find(b => b._id === e.target.value))} disabled={!selectedDept}>
                    <option value="">Select Class</option>
                    {filteredBatches.map(b => <option key={b._id} value={b._id}>{b.batchName || `${b.admissionYear} (${b.section})`}</option>)}
                </select>
            </div>
        </div>
      )}

      {/* --- STUDENT NOT ENROLLED STATE --- */}
      {role === 'student' && !isStudentEnrolled && (
        <div className={`p-10 rounded-2xl border text-center ${theme.cardBg}`}>
            <div className="inline-block p-4 rounded-full bg-orange-500/10 text-orange-500 mb-4">
                <Users size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Not Enrolled in any Class</h3>
            <p className="opacity-60 max-w-md mx-auto">
                You are not currently assigned to a batch. Please contact your administrator or faculty to get enrolled in your respective class.
            </p>
        </div>
      )}

      {/* --- ROUTINE VIEW --- */}
      {selectedBatch && (
        <div className={`p-6 rounded-2xl border ${theme.cardBg}`}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        {role === 'student' ? <List className="text-blue-500"/> : <Edit3 className="text-pink-500"/>} 
                        {role === 'student' ? ' My Routine:' : ' Managing Routine:'} 
                        <span className="text-blue-500 ml-2">{selectedBatch.batchName || selectedBatch.admissionYear}</span>
                    </h3>
                    <p className="text-sm opacity-60">{role === 'student' ? 'Schedule' : 'Define periods'} for {activeDay}</p>
                </div>
                {role !== 'student' && (
                     <button onClick={handleSaveRoutine} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all">
                        <Save size={18}/> Save {activeDay}
                     </button>
                )}
            </div>

            {/* Day Selector */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {days.map(day => (
                    <button key={day} onClick={() => setActiveDay(day)} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeDay === day ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-800 opacity-60 hover:opacity-100'}`}>
                        {day}
                    </button>
                ))}
            </div>

            {/* --- DISPLAY LOGIC --- */}
            
            {/* 1. STUDENT VIEW (Read-Only Timeline) */}
            {role === 'student' ? (
                <div className="space-y-3">
                    {studentPeriods.length > 0 ? (
                        studentPeriods.map((period, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                                key={idx} 
                                className={`flex items-stretch rounded-xl overflow-hidden border transition-all ${period.isBreak ? 'bg-orange-500/5 border-orange-500/20' : theme.inputBg}`}
                            >
                                {/* Time Column */}
                                <div className={`w-28 flex flex-col justify-center items-center p-4 border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} ${period.isBreak ? 'bg-orange-500/10 text-orange-600' : 'bg-blue-500/5 text-blue-600'}`}>
                                    <span className="text-lg font-bold">{period.startTime || '--:--'}</span>
                                    <span className="text-xs opacity-50">to</span>
                                    <span className="text-lg font-bold">{period.endTime || '--:--'}</span>
                                </div>

                                {/* Content Column */}
                                <div className="flex-1 p-4 flex items-center">
                                    {period.isBreak ? (
                                        <div className="flex items-center gap-3 text-orange-500">
                                            <div className="p-2 rounded-full bg-orange-500/20"><Clock size={20}/></div>
                                            <div>
                                                <h4 className="font-bold text-lg tracking-wide uppercase">Break Time</h4>
                                                <p className="text-xs opacity-70">Relax and Recharge</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
                                            <div>
                                                <h4 className="font-bold text-lg mb-1">{period.subject || "Free Period"}</h4>
                                                {period.subject ? (
                                                    <div className="flex items-center gap-4 text-sm opacity-70">
                                                        <span className="flex items-center gap-1"><User size={14}/> {period.facultyName || "TBA"}</span>
                                                        <span className="flex items-center gap-1"><MapPin size={14}/> Room {period.roomNo || "N/A"}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs opacity-50 italic">No class assigned for this slot.</span>
                                                )}
                                            </div>
                                            {/* Period Number Badge */}
                                            <div className="text-xs font-bold uppercase tracking-wider opacity-30 border px-2 py-1 rounded">
                                                Period {period.periodNumber}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-12 opacity-50 border-2 border-dashed rounded-xl">
                            <CalendarIcon className="mx-auto mb-2 w-10 h-10"/>
                            <p className="font-medium">No classes scheduled for {activeDay}.</p>
                        </div>
                    )}
                </div>
            ) : (
                /* 2. ADMIN/FACULTY VIEW (Editable Grid) */
                <div className="space-y-4">
                    {periods.map((period, idx) => (
                        <div key={idx} className={`flex flex-col md:flex-row gap-2 items-center p-3 rounded-xl border transition-all ${period.isBreak ? 'bg-orange-500/10 border-orange-500/30' : theme.inputBg}`}>
                            <div className="font-bold text-lg w-10 text-center opacity-50">{idx + 1}</div>
                            
                            <div className="flex gap-2 w-full md:w-auto">
                                <input 
                                    type="time" 
                                    value={period.startTime} onChange={e => updatePeriod(idx, 'startTime', e.target.value)} 
                                    className={`p-2 rounded-lg border w-24 text-xs ${theme.inputBg}`} 
                                />
                                <span className="opacity-50 self-center">-</span>
                                <input 
                                    type="time" 
                                    value={period.endTime} onChange={e => updatePeriod(idx, 'endTime', e.target.value)} 
                                    className={`p-2 rounded-lg border w-24 text-xs ${theme.inputBg}`} 
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={period.isBreak} onChange={e => updatePeriod(idx, 'isBreak', e.target.checked)} className="w-4 h-4"/>
                                <span className="text-xs uppercase font-bold opacity-70">Break</span>
                            </div>

                            {!period.isBreak && (
                                <>
                                    <input 
                                        placeholder="Subject" 
                                        value={period.subject} onChange={e => updatePeriod(idx, 'subject', e.target.value)} 
                                        className={`flex-1 p-2 rounded-lg border font-medium ${theme.inputBg}`} 
                                    />
                                    <input 
                                        placeholder="Faculty" 
                                        value={period.facultyName} onChange={e => updatePeriod(idx, 'facultyName', e.target.value)} 
                                        className={`w-32 p-2 rounded-lg border text-sm opacity-80 ${theme.inputBg}`} 
                                    />
                                    <input 
                                        placeholder="Room" 
                                        value={period.roomNo} onChange={e => updatePeriod(idx, 'roomNo', e.target.value)} 
                                        className={`w-20 p-2 rounded-lg border text-sm opacity-80 ${theme.inputBg}`} 
                                    />
                                </>
                            )}
                            {period.isBreak && <div className="flex-1 font-bold text-center text-orange-500 tracking-widest">BREAK TIME</div>}
                        </div>
                    ))}
                </div>
            )}
        </div>
      )}
    </div>
  );
};

// --- SUB-COMPONENT: Lesson Tracker (Revamped) ---
const LessonTracker = ({ theme, role, user }) => {
  const { isDarkMode } = useTheme();
  
  // Selection State (Faculty)
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedStream, setSelectedStream] = useState(null);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);

  // Data State
  const [weekOffset, setWeekOffset] = useState(0); // 0 = Current Week
  const [routines, setRoutines] = useState([]); // Master schedule for the batch
  const [logs, setLogs] = useState([]); // Logs for the week
  
  // UI State
  const [isStudentEnrolled, setIsStudentEnrolled] = useState(true);
  const [editingLog, setEditingLog] = useState(null); // { date, subject, topicsCovered, ... }

  // Helpers for Date Management
  const getStartOfWeek = (offset) => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    d.setDate(diff + (offset * 7));
    return d; // Returns Monday of the week
  };

  const currentWeekStart = getStartOfWeek(weekOffset);
  const todayStr = new Date().toISOString().split('T')[0];

  // --- 1. INITIALIZATION ---
  useEffect(() => {
    if (role !== 'student') {
        fetchDepts();
        fetchBatches();
    } else {
        fetchStudentBatch();
    }
  }, []);

  // --- 2. DATA FETCHING ---
  useEffect(() => {
    if (selectedBatch) {
        fetchRoutineAndLogs();
    }
  }, [selectedBatch, weekOffset]);

  const fetchDepts = async () => {
    const res = await fetch(`${API_BASE}/api/departments`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }});
    if(res.ok) setDepartments(await res.json());
  };

  const fetchBatches = async () => {
    const res = await fetch(`${API_BASE}/api/batches`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }});
    if(res.ok) setBatches(await res.json());
  };

  const fetchStudentBatch = async () => {
    const res = await fetch(`${API_BASE}/api/batches`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }});
    if(res.ok) {
        const allBatches = await res.json();
        const myBatch = allBatches.find(b => b.students && b.students.includes(user.id));
        if (myBatch) {
            setSelectedBatch(myBatch);
            setIsStudentEnrolled(true);
        } else {
            setIsStudentEnrolled(false);
        }
    }
  };

  const fetchRoutineAndLogs = async () => {
    // 1. Fetch Routine (Master Schedule)
    const routineRes = await fetch(`${API_BASE}/api/routine/batch/${selectedBatch._id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }
    });
    const routineData = routineRes.ok ? await routineRes.json() : [];
    setRoutines(routineData);

    // 2. Fetch Logs for the Week
    // Calculate Monday and Sunday dates for API
    const start = new Date(currentWeekStart);
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);
    
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    const logsRes = await fetch(`${API_BASE}/api/lessons?batchId=${selectedBatch._id}&startDate=${startStr}&endDate=${endStr}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }
    });
    if (logsRes.ok) setLogs(await logsRes.json());
  };

  // --- 3. ACTIONS ---
  const handleSaveLog = async () => {
    if (!editingLog.topicsCovered) return;

    const res = await fetch(`${API_BASE}/api/lessons`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            batchId: selectedBatch._id,
            ...editingLog
        })
    });

    if (res.ok) {
        setEditingLog(null);
        fetchRoutineAndLogs(); // Refresh
    } else {
        alert("Failed to update log. Ensure you are not updating a future date.");
    }
  };

  // Filter batches for Faculty dropdowns
  const filteredBatches = batches.filter(b => 
    selectedDept && b.departmentId?._id === selectedDept._id && 
    (!selectedStream || b.streamCode === selectedStream.code)
  );

  // --- RENDER HELPERS ---
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-6">
       
       {/* 1. SELECTION HEADER (Faculty Only) */}
       {role !== 'student' && (
        <div className={`p-6 rounded-2xl border grid grid-cols-1 md:grid-cols-3 gap-4 ${theme.cardBg}`}>
            <div className="space-y-1">
                <label className="text-xs font-bold uppercase opacity-50">Department</label>
                <select className={`w-full p-3 rounded-xl border ${theme.inputBg}`} onChange={e => setSelectedDept(departments.find(d => d._id === e.target.value))} value={selectedDept?._id || ''}>
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
            </div>
            <div className="space-y-1">
                <label className="text-xs font-bold uppercase opacity-50">Stream</label>
                <select className={`w-full p-3 rounded-xl border ${theme.inputBg}`} onChange={e => setSelectedStream(selectedDept?.streams.find(s => s.code === e.target.value))} disabled={!selectedDept}>
                    <option value="">Select Stream</option>
                    {selectedDept?.streams.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                </select>
            </div>
            <div className="space-y-1">
                <label className="text-xs font-bold uppercase opacity-50">Batch / Class</label>
                <select className={`w-full p-3 rounded-xl border ${theme.inputBg}`} onChange={e => setSelectedBatch(batches.find(b => b._id === e.target.value))} disabled={!selectedDept}>
                    <option value="">Select Class</option>
                    {filteredBatches.map(b => <option key={b._id} value={b._id}>{b.batchName || `${b.admissionYear} (${b.section})`}</option>)}
                </select>
            </div>
        </div>
      )}

      {/* 2. STUDENT NOT ENROLLED */}
      {role === 'student' && !isStudentEnrolled && (
        <div className={`p-10 rounded-2xl border text-center ${theme.cardBg}`}>
             <Users size={32} className="mx-auto mb-2 opacity-50"/>
             <h3 className="text-xl font-bold">No Batch Assigned</h3>
        </div>
      )}

      {/* 3. WEEKLY TRACKER UI */}
      {selectedBatch && (
        <div className="space-y-6">
            
            {/* Week Navigation */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                    Week of {currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </h2>
                <div className="flex gap-2">
                    <button onClick={() => setWeekOffset(weekOffset - 1)} className={`p-2 rounded-lg border ${theme.inputBg}`}><ChevronLeft/></button>
                    <button onClick={() => setWeekOffset(0)} className={`px-4 py-2 rounded-lg border text-sm font-bold ${theme.inputBg}`}>Current Week</button>
                    <button onClick={() => setWeekOffset(weekOffset + 1)} className={`p-2 rounded-lg border ${theme.inputBg}`}><ChevronRight/></button>
                </div>
            </div>

            {/* Days Loop */}
            <div className="space-y-4">
                {daysOfWeek.map((dayName, idx) => {
                    // Calculate Date for this row
                    const thisDate = new Date(currentWeekStart);
                    thisDate.setDate(thisDate.getDate() + idx);
                    const dateStr = thisDate.toISOString().split('T')[0];
                    const isFuture = dateStr > todayStr;
                    const isToday = dateStr === todayStr;

                    // Get Routine for this day
                    const dayRoutine = routines.find(r => r.dayOfWeek === dayName);
                    // Get Logs for this day
                    const dayLogs = logs.filter(l => l.date === dateStr);

                    return (
                        <div key={dayName} className={`p-0 rounded-2xl border overflow-hidden ${theme.cardBg}`}>
                            {/* Day Header */}
                            <div className={`px-6 py-3 flex justify-between items-center ${isToday ? 'bg-blue-500/10' : 'bg-gray-500/5'}`}>
                                <div className="flex items-center gap-3">
                                    <span className={`text-sm font-bold px-3 py-1 rounded-lg ${isToday ? 'bg-blue-600 text-white' : 'bg-gray-500/20'}`}>
                                        {dayName.substring(0,3)}
                                    </span>
                                    <span className="font-bold opacity-70">
                                        {thisDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                                    </span>
                                </div>
                                {isFuture && <span className="text-xs font-bold flex items-center gap-1 opacity-50"><Lock size={12}/> Locked</span>}
                            </div>

                            <div className="p-6">
                                {(!dayRoutine || !dayRoutine.periods.length) ? (
                                    <div className="text-center opacity-40 text-sm py-2">No routine scheduled (Holiday/Free)</div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {dayRoutine.periods.filter(p => !p.isBreak && p.subject).map((period, pIdx) => {
                                            // Find log for this specific subject on this day
                                            // Note: Simple matching by Subject Name. 
                                            const existingLog = dayLogs.find(l => l.subject === period.subject);

                                            return (
                                                <div key={pIdx} className={`p-4 rounded-xl border flex flex-col justify-between ${theme.inputBg}`}>
                                                    <div className="mb-3">
                                                        <div className="flex justify-between items-start">
                                                            <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">
                                                                {period.startTime} - {period.endTime}
                                                            </span>
                                                        </div>
                                                        <h4 className="font-bold text-lg mt-1">{period.subject}</h4>
                                                        <p className="text-xs opacity-60 flex items-center gap-1">
                                                            <User size={10}/> {period.facultyName || 'Faculty'}
                                                        </p>
                                                    </div>

                                                    {/* View Log */}
                                                    {existingLog ? (
                                                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <span className="text-[10px] uppercase font-bold text-emerald-600">Completed</span>
                                                                {/* Optional: Show who updated it if needed */}
                                                                {/* <span className="text-[9px] opacity-50">{existingLog.facultyId?.name}</span> */}
                                                            </div>
                                                            <p className="text-sm">{existingLog.topicsCovered}</p>
                                                        </div>
                                                    ) : (
                                                        /* Add Log (Faculty Only & Not Future) */
                                                        !isFuture && role === 'faculty' ? (
                                                            <button 
                                                                onClick={() => setEditingLog({ 
                                                                    date: dateStr, 
                                                                    dayOfWeek: dayName,
                                                                    subject: period.subject,
                                                                    topicsCovered: '',
                                                                    remarks: ''
                                                                })}
                                                                className="w-full py-2 border border-dashed border-gray-400 rounded-lg text-xs font-bold opacity-50 hover:opacity-100 hover:bg-gray-500/5 transition-all"
                                                            >
                                                                + Add Update
                                                            </button>
                                                        ) : (
                                                            <div className="text-xs opacity-30 italic text-center py-2">No updates recorded</div>
                                                        )
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      )}

      {/* UPDATE MODAL (Faculty Only) */}
      <AnimatePresence>
        {editingLog && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                    className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border ${theme.cardBg}`}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Update Lesson Tracker</h3>
                        <button onClick={() => setEditingLog(null)}><X/></button>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <div className="text-xs font-bold opacity-70 uppercase mb-1">{editingLog.date} ({editingLog.dayOfWeek})</div>
                            <div className="text-lg font-bold text-blue-500">{editingLog.subject}</div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold opacity-70">What was covered?</label>
                            <textarea 
                                value={editingLog.topicsCovered}
                                onChange={e => setEditingLog({...editingLog, topicsCovered: e.target.value})}
                                placeholder="e.g. Chapter 4: Thermodynamics laws explained..."
                                className={`w-full p-3 rounded-xl border outline-none h-32 resize-none ${theme.inputBg}`}
                                autoFocus
                            />
                        </div>
                        
                        <div className="space-y-2">
                             <label className="text-sm font-bold opacity-70">Remarks (Optional)</label>
                             <input 
                                value={editingLog.remarks}
                                onChange={e => setEditingLog({...editingLog, remarks: e.target.value})}
                                placeholder="e.g. Assignment given..."
                                className={`w-full p-3 rounded-xl border outline-none ${theme.inputBg}`}
                            />
                        </div>

                        <button onClick={handleSaveLog} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 hover:bg-emerald-500 transition-all">
                            Save Update
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

    </div>
  );
};


// --- MAIN PAGE COMPONENT ---
// ... (Main TimetableDashboard component remains mostly unchanged, just ensure LessonTracker is used)
const TimetableDashboard = () => {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate(); 
    const [activeTab, setActiveTab] = useState('calendar');
    const [sessionData, setSessionData] = useState(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      fetchSession();
    }, []);
  
    const fetchSession = async () => {
      try {
        const res = await fetch(`${API_BASE}/session/info`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionToken')}` }});
        if(res.ok) setSessionData(await res.json());
      } catch(e) { console.error(e); }
      setLoading(false);
    };
  
    const theme = {
      text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
      cardBg: isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white border-gray-200',
      inputBg: isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200',
    };
  
    if(loading) return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0f111a]' : 'bg-gray-50'}`}>
          <LoadingSpinner message="Loading your timetable..." />
      </div>
    );
  
    if (!sessionData || !sessionData.user) {
      navigate("/login", { replace: true });
      return null;
    }

    const role = sessionData.role;
  
    // Define tabs based on role
    const tabs = [
      { id: 'calendar', label: 'My Calendar', icon: CalendarIcon },
      ...(role === 'faculty' || role === 'college_admin' ? [{ id: 'create_routine', label: 'Create Class Routine', icon: Edit3 }] : []),
      ...(role === 'student' ? [{ id: 'view_routine', label: 'My Class Routine', icon: List }] : []),
      { id: 'tracker', label: 'Daily Lesson Tracker', icon: CheckCircle },
    ];
  
    return (
      <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#0f111a] text-white' : 'bg-[#F3F4F6] text-gray-900'}`}>
          
          {/* ================= HEADER ================= */}
          <div className="fixed top-0 left-0 right-0 z-50">
            <GlassHeader variant="dashboard">
              <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
                {/* LEFT */}
                <div className="flex items-center space-x-4">
                  <button onClick={() => navigate(-1)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}>
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <UserProfileDropdown user={sessionData.user} onOptionClick={() => {}} />
                  <div className="flex flex-col">
                    <div className={`flex items-center text-sm font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                      <span className="opacity-70 capitalize">{role?.replace('_', ' ')} Dashboard</span>
                      <ChevronRight className="w-4 h-4 mx-1 opacity-50" />
                      <span className="text-blue-600">Timetable & Schedule</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                        {sessionData?.tenant?.name || 'College'}
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
          </div>
  
          <div className="max-w-7xl mx-auto px-4 py-8 pt-28">
              
              {/* Tab Navigation */}
              <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                  {tabs.map(tab => (
                      <button 
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                              activeTab === tab.id 
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                              : `bg-transparent border ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-white'}`
                          }`}
                      >
                          <tab.icon size={18}/> {tab.label}
                      </button>
                  ))}
              </div>
  
              {/* Content Area */}
              <AnimatePresence mode="wait">
                  <motion.div 
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                  >
                      {activeTab === 'calendar' && <PersonalCalendar theme={theme} user={sessionData.user} />}
                      
                      {/* Reusing RoutineBuilder for BOTH Creating (Admin/Faculty) and Viewing (Student) */}
                      {(activeTab === 'create_routine' || activeTab === 'view_routine') && (
                          <RoutineBuilder theme={theme} role={role} user={sessionData.user} />
                      )}
                      
                      {activeTab === 'tracker' && <LessonTracker theme={theme} role={role} user={sessionData.user} />}
                  </motion.div>
              </AnimatePresence>
  
          </div>
      </div>
    );
};

export default TimetableDashboard;