import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalIcon, 
  MapPin, Clock, Search, Filter, Plus, X, ChevronRight as ChevronRightIcon, Wifi
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

// Common Components
import { useTheme } from '@/context/ThemeContext.jsx';
import { useSessionManager } from '@/hooks/useSessionManager.js';
import GlassHeader from '@/components/common/GlassHeader.jsx';
import UserProfileDropdown from '@/components/common/UserProfileDropdown.jsx';
import ThemeToggle from '@/components/common/ThemeToggle.jsx';
import CollegeBannerLogo from '@/components/common/CollegeBannerLogo.jsx';

/* =========================================================================
   1. MOCK DATA & CONSTANTS
   ========================================================================= */

const INITIAL_EVENTS = [
  {
    id: 1, title: "End Semester Exams", date: "2026-02-15", time: "10:00 AM - 01:00 PM",
    type: "EXAM", location: "Main Hall, Block A", description: "Final theory examinations for 5th Semester."
  },
  {
    id: 2, title: "Republic Day", date: "2026-01-26", time: "All Day",
    type: "HOLIDAY", location: "Campus Ground", description: "Flag hoisting ceremony and cultural events."
  },
  {
    id: 3, title: "Project Submission", date: "2026-02-10", time: "11:59 PM",
    type: "DEADLINE", location: "Online Portal", description: "Submission of final year minor project documentation."
  },
  {
    id: 4, title: "Tech Fest: Innovate 26", date: "2026-03-05", time: "09:00 AM",
    type: "EVENT", location: "Auditorium", description: "Annual technical festival with coding hackathons."
  }
];

const EVENT_TYPES = ['ALL', 'EXAM', 'HOLIDAY', 'DEADLINE', 'EVENT'];

const getTypeColor = (type, isDarkMode) => {
  switch (type) {
    case 'EXAM': return isDarkMode ? 'text-red-400 bg-red-400/10 border-red-400/20' : 'text-red-600 bg-red-50 border-red-200';
    case 'HOLIDAY': return isDarkMode ? 'text-green-400 bg-green-400/10 border-green-400/20' : 'text-green-600 bg-green-50 border-green-200';
    case 'DEADLINE': return isDarkMode ? 'text-orange-400 bg-orange-400/10 border-orange-400/20' : 'text-orange-600 bg-orange-50 border-orange-200';
    case 'EVENT': return isDarkMode ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' : 'text-blue-600 bg-blue-50 border-blue-200';
    default: return isDarkMode ? 'text-gray-400 bg-gray-800 border-gray-700' : 'text-gray-600 bg-gray-100 border-gray-200';
  }
};

const getEventDotColor = (type) => {
  switch (type) {
    case 'EXAM': return 'bg-red-500';
    case 'HOLIDAY': return 'bg-green-500';
    case 'DEADLINE': return 'bg-orange-500';
    case 'EVENT': return 'bg-blue-500';
    default: return 'bg-gray-500';
  }
};

// --- Utilities ---
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

/* =========================================================================
   2. MAIN COMPONENT
   ========================================================================= */

const AcademicCalendar = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { user, profile, loading: sessionLoading } = useSessionManager();
  
  // --- Role Check ---
  const userRoleDisplay = profile?.role ? profile.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'User';
  // Allow admins and faculty to add events
  const canManageEvents = ['college_admin', 'faculty', 'it_admin'].includes(profile?.role);

  // --- State ---
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date()); 
  const [activeFilter, setActiveFilter] = useState('ALL'); 
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', type: 'EVENT', location: '', description: '' });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // --- Derived Values ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // --- Handlers ---
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleDateClick = (day) => setSelectedDate(new Date(year, month, day));

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;
    
    setEvents([...events, { ...newEvent, id: Date.now() }]);
    setIsModalOpen(false);
    setNewEvent({ title: '', date: '', time: '', type: 'EVENT', location: '', description: '' });
    setSelectedDate(new Date(newEvent.date)); 
    setCurrentDate(new Date(newEvent.date));
  };

  // --- Filtering Logic ---
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            event.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = activeFilter === 'ALL' || event.type === activeFilter;
      return matchesSearch && matchesType;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events, activeFilter, searchQuery]);

  // Generate Calendar Grid
  const days = [];
  for (let i = 0; i < firstDay; i++) { days.push(null); }
  for (let i = 1; i <= daysInMonth; i++) { days.push(i); }

  if (sessionLoading) return null;

  return (
    <div className={`min-h-screen font-sans relative transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Background Gradient */}
      <div className={`fixed top-0 left-0 w-full h-[300px] pointer-events-none transition-all ${isDarkMode ? 'bg-gradient-to-b from-indigo-900/10 to-transparent' : 'bg-gradient-to-b from-indigo-100/50 to-transparent'}`} />
      
      {/* ================= HEADER ================= */}
      <GlassHeader variant="dashboard">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate(-1)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-indigo-100 text-indigo-600'}`}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <UserProfileDropdown user={user} onOptionClick={() => {}} />
            <div className="flex flex-col">
              <div className={`flex items-center text-sm font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                <span className="opacity-70">{userRoleDisplay} Dashboard</span>
                <ChevronRightIcon className="w-4 h-4 mx-1 opacity-50" />
                <span className="text-indigo-500">Academic Calendar</span>
              </div>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${isDarkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
                  {profile?.college || 'Institution'}
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
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-32">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className={`text-3xl font-bold tracking-tight flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Organization Calendar
            </h1>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Track academic schedules, exams, and institutional events.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
             <div className="relative group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search events..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className={`w-full sm:w-64 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium ${isDarkMode ? 'bg-gray-800/80 border border-gray-700 text-white placeholder-gray-500' : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 shadow-sm'}`}
               />
             </div>
             {canManageEvents && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Add Event
                </button>
             )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- LEFT: CALENDAR WIDGET --- */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
             <div className={`border rounded-3xl p-6 shadow-sm transition-colors ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                   <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{monthNames[month]} {year}</h2>
                   <div className="flex gap-2">
                      <button onClick={prevMonth} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}><ChevronLeft className="w-4 h-4" /></button>
                      <button onClick={nextMonth} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}><ChevronRight className="w-4 h-4" /></button>
                   </div>
                </div>

                {/* Days of Week */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                   {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                     <div key={day} className="text-center text-xs font-bold text-gray-400 py-2">{day}</div>
                   ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                   {days.map((day, idx) => {
                     if (!day) return <div key={`empty-${idx}`} className="p-2" />;
                     
                     const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                     const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
                     const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
                     
                     const dayEvents = events.filter(e => e.date === dateString);

                     return (
                       <button
                         key={day}
                         onClick={() => handleDateClick(day)}
                         className={`
                           relative aspect-square flex items-center justify-center rounded-xl text-sm transition-all duration-300 font-medium
                           ${isSelected ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/30' : 
                             isToday ? (isDarkMode ? 'bg-gray-700 text-indigo-400 font-bold border border-indigo-500/30' : 'bg-indigo-50 text-indigo-600 font-bold border border-indigo-200') : 
                             (isDarkMode ? 'hover:bg-gray-700/50 text-gray-300' : 'hover:bg-gray-100 text-gray-700')}
                         `}
                       >
                         {day}
                         {dayEvents.length > 0 && (
                            <div className="absolute bottom-1.5 flex gap-0.5">
                               {dayEvents.slice(0,3).map((e, i) => (
                                 <span key={i} className={`w-1 h-1 rounded-full ${getEventDotColor(e.type)}`} />
                               ))}
                            </div>
                         )}
                       </button>
                     );
                   })}
                </div>
             </div>
          </div>

          {/* --- RIGHT: EVENT LISTING --- */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
             {/* Filter Tabs */}
             <div className={`p-1.5 rounded-full border flex gap-1 overflow-x-auto custom-scrollbar shadow-sm ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                {EVENT_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setActiveFilter(type)}
                    className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${activeFilter === type ? (isDarkMode ? 'bg-white text-black shadow-md' : 'bg-indigo-600 text-white shadow-md') : (isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50')}`}
                  >
                    {type}
                  </button>
                ))}
             </div>

             {/* Events Feed */}
             <div className={`border rounded-3xl p-6 min-h-[500px] shadow-sm ${isDarkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                   <CalIcon className="w-5 h-5 text-indigo-500" />
                   <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                     Schedule for {activeFilter !== 'ALL' ? activeFilter : 'All Events'}
                   </h2>
                </div>

                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {filteredEvents.length > 0 ? (
                      filteredEvents.map((event) => (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                          key={event.id}
                          className={`group relative p-5 rounded-2xl border transition-all flex flex-col sm:flex-row gap-5 ${isDarkMode ? 'bg-gray-800/80 border-gray-700 hover:bg-gray-700 hover:border-indigo-500/30' : 'bg-gray-50 border-gray-200 hover:bg-white hover:shadow-md hover:border-indigo-300'}`}
                        >
                           {/* Date Box */}
                           <div className={`shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center border shadow-inner ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                              <span className="text-xs font-bold text-gray-500 uppercase">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                              <span className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{new Date(event.date).getDate()}</span>
                           </div>

                           {/* Content */}
                           <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                                 <h3 className={`text-lg font-bold transition-colors ${isDarkMode ? 'text-white group-hover:text-indigo-400' : 'text-gray-900 group-hover:text-indigo-600'}`}>{event.title}</h3>
                                 <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border tracking-wider ${getTypeColor(event.type, isDarkMode)}`}>
                                   {event.type}
                                 </span>
                              </div>
                              <p className={`text-sm mb-4 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{event.description}</p>
                              <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${isDarkMode ? 'bg-gray-900/80 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-600 shadow-sm'}`}>
                                    <Clock className="w-3.5 h-3.5 text-indigo-500" /> {event.time}
                                </div>
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${isDarkMode ? 'bg-gray-900/80 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-600 shadow-sm'}`}>
                                    <MapPin className="w-3.5 h-3.5 text-purple-500" /> {event.location}
                                </div>
                              </div>
                           </div>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 opacity-60">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                          <Filter className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>No events found matching criteria.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* --- ADD EVENT MODAL (ADMIN/FACULTY ONLY) --- */}
      <AnimatePresence>
        {isModalOpen && canManageEvents && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
             <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className={`relative z-10 w-full max-w-lg border rounded-3xl shadow-2xl overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                
                <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-gray-800 bg-gray-800/50' : 'border-gray-100 bg-gray-50'}`}>
                  <h3 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><CalIcon className="w-5 h-5 text-indigo-500"/> Create New Event</h3>
                  <button onClick={() => setIsModalOpen(false)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleAddEvent} className="p-6 space-y-5">
                   <div>
                     <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Event Title *</label>
                     <input required type="text" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all border focus:ring-2 focus:ring-indigo-500/50 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="e.g. Mid Semester Exams" />
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Date *</label>
                        <input required type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all border focus:ring-2 focus:ring-indigo-500/50 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white [color-scheme:dark]' : 'bg-white border-gray-300 text-gray-900'}`} />
                      </div>
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Time</label>
                        <input type="text" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all border focus:ring-2 focus:ring-indigo-500/50 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="e.g. 10:00 AM - 1:00 PM" />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Type *</label>
                        <select value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})} className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all border focus:ring-2 focus:ring-indigo-500/50 appearance-none ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                           {EVENT_TYPES.filter(t => t !== 'ALL').map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Location</label>
                        <input type="text" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all border focus:ring-2 focus:ring-indigo-500/50 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="e.g. Main Auditorium" />
                      </div>
                   </div>

                   <div>
                     <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Description</label>
                     <textarea value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all border focus:ring-2 focus:ring-indigo-500/50 resize-none h-24 custom-scrollbar ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="Add event details here..." />
                   </div>

                   <div className={`pt-5 border-t flex justify-end gap-3 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                      <button type="button" onClick={() => setIsModalOpen(false)} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>Cancel</button>
                      <button type="submit" className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95">Publish Event</button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AcademicCalendar;