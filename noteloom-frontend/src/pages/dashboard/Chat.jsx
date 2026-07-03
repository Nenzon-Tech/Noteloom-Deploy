import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Search, MoreVertical, Send, Paperclip, 
  Smile, Mic, CheckCheck, Users, Siren, UserCheck, 
  Microscope, Gavel, Hash, FileText, ChevronDown
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext.jsx';
import GlassHeader from '@/components/common/GlassHeader.jsx';

// --- MOCK CHANNELS ---
const INITIAL_CHANNELS = [
  { 
    id: 'c_3yr_ee', 
    name: '3rd Year EE - Official', 
    type: 'class_group', 
    icon: <Users className="w-5 h-5 text-blue-500"/>,
    desc: 'Official channel for 3rd Year EE Students & Faculty',
    lastMsg: 'CR: List updated. Please check.', 
    time: '12:45 PM', 
    unread: 3 
  },
  { 
    id: 'c_exam_cell', 
    name: '🚨 Exam Control Room', 
    type: 'admin_group', 
    icon: <Siren className="w-5 h-5 text-red-600"/>,
    desc: 'Confidential: Invigilation duties & QP Status',
    lastMsg: 'COE: Room 302 needs one more invigilator ASAP.', 
    time: '11:45 AM', 
    unread: 5 
  },
  { 
    id: 'c_mentoring', 
    name: 'Mentoring: Batch 2023-27', 
    type: 'mentoring', 
    icon: <UserCheck className="w-5 h-5 text-green-600"/>,
    desc: 'Official guidance group for your 25 mentees',
    lastMsg: 'Rohan: Sir, I need to discuss my internship.', 
    time: '12:10 PM', 
    unread: 1 
  },
  { 
    id: 'c_ee_faculty', 
    name: 'EE Dept Faculty Room', 
    type: 'staff_room', 
    icon: <Hash className="w-5 h-5 text-purple-500"/>,
    desc: 'Internal discussion for EE Department Staff',
    lastMsg: 'HOD: NAAC file preparation meeting at 4 PM.', 
    time: 'Yesterday', 
    unread: 0 
  },
  { 
    id: 'c_research', 
    name: 'AI/ML Research Grp', 
    type: 'research', 
    icon: <Microscope className="w-5 h-5 text-indigo-500"/>,
    desc: 'Grant proposals and paper reviews',
    lastMsg: 'Dr. Sen: The IEEE formatting is fixed.', 
    time: 'Yesterday', 
    unread: 0 
  },
  { 
    id: 'c_disciplinary', 
    name: 'Disciplinary Committee', 
    type: 'committee', 
    icon: <Gavel className="w-5 h-5 text-orange-600"/>,
    desc: 'Restricted: Student hearings and actions',
    lastMsg: 'Admin: Case #402 hearing scheduled for Monday.', 
    time: 'Tue', 
    unread: 2 
  }
];

// --- MOCK MESSAGES (LONG CHAT FOR SCROLL TESTING) ---
const INITIAL_MESSAGES = {
  'c_3yr_ee': [
    { id: 1, sender: 'other', role: 'STUDENT', name: 'Rahul (CR)', text: 'Good morning Sir, will we have the Power Systems class today?', time: '09:00 AM' },
    { id: 2, sender: 'me', role: 'FACULTY', name: 'You', text: 'Yes, I will be taking the class at 11 AM as scheduled.', time: '09:15 AM' },
    { id: 3, sender: 'other', role: 'STUDENT', name: 'Anjali Das', text: 'Sir, regarding the Assignment 2, the portal is not accepting PDFs larger than 2MB.', time: '09:20 AM' },
    { id: 4, sender: 'other', role: 'STUDENT', name: 'Rohit', text: 'Yes sir, mine is 5MB because of the diagrams.', time: '09:21 AM' },
    { id: 5, sender: 'me', role: 'FACULTY', name: 'You', text: 'Okay, I will ask the Admin to increase the limit to 10MB.', time: '09:25 AM' },
    { id: 6, sender: 'other', role: 'STUDENT', name: 'Anjali Das', text: 'Thank you Sir!', time: '09:26 AM' },
    { id: 7, sender: 'other', role: 'STUDENT', name: 'Vikram', text: 'Sir, are we covering Fault Analysis today?', time: '10:00 AM' },
    { id: 8, sender: 'me', role: 'FACULTY', name: 'You', text: 'No, today we focus on Load Flow Studies. Please bring your calculators.', time: '10:05 AM' },
    { id: 9, sender: 'other', role: 'STUDENT', name: 'Rahul (CR)', text: 'Sir, PPT uploaded?', time: '10:30 AM' },
    { id: 10, sender: 'me', role: 'FACULTY', name: 'You', text: 'Uploading it now. Check the LMS in 5 mins.', time: '10:32 AM' },
    { id: 11, sender: 'other', role: 'STUDENT', name: 'Priya', text: 'Sir, for the lab tomorrow, do we need the graph paper?', time: '11:00 AM' },
    { id: 12, sender: 'other', role: 'STUDENT', name: 'Rahul (CR)', text: 'Priya, check the syllabus document pinned above.', time: '11:02 AM' },
    { id: 13, sender: 'me', role: 'FACULTY', name: 'You', text: 'Yes, bring semi-log graph papers.', time: '11:10 AM' },
    { id: 14, sender: 'other', role: 'STUDENT', name: 'Amit', text: 'Sir, I am absent today due to fever.', time: '11:15 AM' },
    { id: 15, sender: 'me', role: 'FACULTY', name: 'You', text: 'Submit a medical certificate when you return.', time: '11:20 AM' },
    { id: 16, sender: 'other', role: 'HOD', name: 'Dr. A. K. Roy', text: '@All Students, Guest Lecture on Smart Grids is arranged at 2 PM.', time: '12:00 PM' },
    { id: 17, sender: 'other', role: 'STUDENT', name: 'Rahul (CR)', text: 'Noted sir. Attendance compulsory?', time: '12:05 PM' },
    { id: 18, sender: 'other', role: 'HOD', name: 'Dr. A. K. Roy', text: 'Yes. Attendance will be taken.', time: '12:10 PM' },
    { id: 19, sender: 'other', role: 'STUDENT', name: 'Rahul (CR)', text: 'Okay, I will inform everyone.', time: '12:12 PM' },
    { id: 20, sender: 'other', role: 'STUDENT', name: 'Vikram', text: 'Sir, which auditorium?', time: '12:15 PM' },
    { id: 21, sender: 'other', role: 'HOD', name: 'Dr. A. K. Roy', text: 'Main Auditorium, Block B.', time: '12:16 PM' },
    { id: 22, sender: 'other', role: 'STUDENT', name: 'Anjali Das', text: 'Sir, we have a lab at 2 PM.', time: '12:20 PM' },
    { id: 23, sender: 'me', role: 'FACULTY', name: 'You', text: 'The lab is rescheduled to accommodate the guest lecture.', time: '12:25 PM' },
    { id: 24, sender: 'other', role: 'STUDENT', name: 'Rahul (CR)', text: 'List updated. Please check.', time: '12:45 PM' },
  ],
  'c_exam_cell': [
    { id: 1, sender: 'other', role: 'COE', name: 'Controller of Exams', text: 'Faculty, please submit the CA-2 question papers by 5 PM today.', time: '09:30 AM' },
    { id: 2, sender: 'me', role: 'FACULTY', name: 'You', text: 'Submitted via ERP portal. Please verify.', time: '09:45 AM' },
    { id: 3, sender: 'other', role: 'COE', name: 'Controller of Exams', text: 'Received. Also, Room 302 needs one more invigilator ASAP for the 2nd half.', time: '11:45 AM' },
  ]
};

const Chat = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
  // State
  const [activeChannelId, setActiveChannelId] = useState('c_3yr_ee'); // Default open for testing
  const [channels, setChannels] = useState(INITIAL_CHANNELS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false); // Default hidden on mobile if chat open

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChannelId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChannelId) return;

    const newMsg = {
      id: Date.now(),
      sender: 'me',
      role: 'FACULTY',
      name: 'You',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), newMsg]
    }));

    setChannels(prev => prev.map(c => 
      c.id === activeChannelId ? { ...c, lastMsg: `You: ${inputText}`, time: 'Just now' } : c
    ));

    setInputText("");

    // Simulate Reply
    setIsTyping(true);
    setTimeout(() => {
      const replyMsg = {
        id: Date.now() + 1,
        sender: 'other',
        role: 'STUDENT',
        name: 'Rahul (CR)',
        text: 'Received sir.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => ({
        ...prev,
        [activeChannelId]: [...(prev[activeChannelId] || []), replyMsg]
      }));
      setIsTyping(false);
    }, 1500);
  };

  const filteredChannels = channels.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const activeChannel = channels.find(c => c.id === activeChannelId);

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'STUDENT': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'HOD': return 'bg-red-100 text-red-700 border-red-200';
      case 'ADMIN': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'COE': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    // FIX 1: Main Container set to h-screen and overflow-hidden to lock body scroll
    <div className={`h-screen pt-20 flex flex-col overflow-hidden ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      
      {/* Header stays fixed via pt-20 on parent, but we ensure z-index */}
      <GlassHeader isDarker={true}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center space-x-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-700/50 rounded-lg">
            <ArrowLeft className="w-5 h-5"/>
          </button>
          <h1 className="text-xl font-bold">Official Communication Channels</h1>
        </div>
      </GlassHeader>

      {/* FIX 2: Content Container uses flex-1 and overflow-hidden to contain children */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 flex gap-4 overflow-hidden">
        
        {/* --- LEFT SIDEBAR (Channel List) --- */}
        {/* FIX 3: Flex-col and overflow-hidden here, with internal scroll on the list div */}
        <div className={`w-full md:w-1/3 lg:w-1/4 flex flex-col rounded-2xl border overflow-hidden transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-xl'} ${showMobileSidebar ? 'block' : 'hidden md:flex'}`}>
          
          <div className={`p-4 border-b flex-shrink-0 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className={`flex items-center px-3 py-2 rounded-xl ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
              <Search className="w-4 h-4 opacity-50 mr-2"/>
              <input 
                placeholder="Search groups..." 
                className="bg-transparent outline-none text-sm w-full"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* FIX 4: overflow-y-auto ensures ONLY this list scrolls */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {filteredChannels.map(channel => (
              <div 
                key={channel.id}
                onClick={() => { setActiveChannelId(channel.id); setShowMobileSidebar(false); }}
                className={`p-3 rounded-xl flex items-center cursor-pointer transition-all ${
                  activeChannelId === channel.id 
                    ? (isDarkMode ? 'bg-gray-700' : 'bg-blue-50') 
                    : 'hover:bg-gray-500/10'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isDarkMode ? 'bg-gray-900' : 'bg-white shadow-sm border border-gray-100'}`}>
                  {channel.icon}
                </div>
                <div className="ml-3 flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-bold text-sm truncate">{channel.name}</h4>
                    <span className="text-[10px] opacity-50">{channel.time}</span>
                  </div>
                  <p className="text-xs opacity-60 truncate mt-0.5">
                    {channel.id === activeChannelId && isTyping ? <span className="text-purple-400 font-bold animate-pulse">Typing...</span> : channel.lastMsg}
                  </p>
                </div>
                {channel.unread > 0 && (
                  <div className="ml-2 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0">
                    {channel.unread}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* --- RIGHT CHAT AREA --- */}
        {/* FIX 5: flex-1 and flex-col ensures it takes remaining width and height */}
        <div className={`flex-1 flex flex-col rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-xl'} ${!showMobileSidebar ? 'block' : 'hidden md:flex'}`}>
          
          {activeChannelId ? (
            <>
              {/* Header - Fixed Height (flex-shrink-0) */}
              <div className={`p-4 border-b flex justify-between items-center flex-shrink-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex items-center">
                  <button onClick={() => setShowMobileSidebar(true)} className="md:hidden mr-3 p-1 hover:bg-gray-700 rounded-full"><ArrowLeft className="w-5 h-5"/></button>
                  <div className="mr-3">{activeChannel?.icon}</div>
                  <div>
                    <h3 className="font-bold">{activeChannel?.name}</h3>
                    <p className="text-xs opacity-60">{activeChannel?.desc}</p>
                  </div>
                </div>
                <MoreVertical className="w-5 h-5 cursor-pointer opacity-60 hover:opacity-100"/>
              </div>

              {/* Messages - Scrollable Area (flex-1 overflow-y-auto) */}
              <div className={`flex-1 overflow-y-auto p-4 space-y-6 ${isDarkMode ? 'bg-gray-900/50' : 'bg-slate-50'}`}>
                <div className="flex justify-center my-4">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>Today</span>
                </div>

                <AnimatePresence initial={false}>
                  {(messages[activeChannelId] || []).map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Avatar for Others */}
                      {msg.sender !== 'me' && (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-1 flex-shrink-0 ${isDarkMode ? 'bg-gray-700' : 'bg-white border'}`}>
                          {msg.name[0]}
                        </div>
                      )}

                      <div className={`max-w-[70%] rounded-2xl p-3 shadow-sm ${
                        msg.sender === 'me' 
                          ? 'bg-purple-600 text-white rounded-tr-none' 
                          : (isDarkMode ? 'bg-gray-700 text-white rounded-tl-none' : 'bg-white border border-gray-200 text-gray-900 rounded-tl-none')
                      }`}>
                        {/* Name & Role Badge (For Groups) */}
                        {msg.sender === 'other' && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold opacity-90">{msg.name}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${getRoleBadgeColor(msg.role)}`}>
                              {msg.role}
                            </span>
                          </div>
                        )}
                        
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <div className={`text-[10px] flex justify-end items-center mt-1 gap-1 ${msg.sender === 'me' ? 'text-purple-200' : 'text-gray-400'}`}>
                          {msg.time}
                          {msg.sender === 'me' && <CheckCheck className="w-3 h-3"/>}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Input - Fixed Height (flex-shrink-0) */}
              <form onSubmit={handleSend} className={`p-4 border-t flex items-center gap-3 flex-shrink-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <button type="button" className="p-2 rounded-full hover:bg-gray-700/50 transition-colors opacity-60 hover:opacity-100"><Smile className="w-5 h-5"/></button>
                <button type="button" className="p-2 rounded-full hover:bg-gray-700/50 transition-colors opacity-60 hover:opacity-100"><Paperclip className="w-5 h-5"/></button>
                <input 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Message ${activeChannel?.name}...`}
                  className={`flex-1 bg-transparent outline-none px-4 py-3 rounded-full border focus:border-purple-500 transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-transparent'}`}
                />
                {inputText.trim() ? (
                  <button type="submit" className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95">
                    <Send className="w-5 h-5 ml-0.5"/>
                  </button>
                ) : (
                  <button type="button" className="p-3 rounded-full hover:bg-gray-700/50 transition-colors opacity-60"><Mic className="w-5 h-5"/></button>
                )}
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-40 p-10 text-center">
              <div className="w-24 h-24 bg-gray-500/10 rounded-full flex items-center justify-center mb-4">
                <Hash className="w-12 h-12"/>
              </div>
              <h2 className="text-xl font-bold mb-2">Select a Channel</h2>
              <p className="text-sm max-w-xs">Choose a department group or staff room to view updates and discuss.</p>
              <p className="text-xs mt-4 text-purple-500 bg-purple-500/10 px-3 py-1 rounded-full">🔒 Institution Encrypted</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Chat;