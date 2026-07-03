import { API_BASE } from '@/utils/config';
import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { 
  MessageSquare, X, Send, FileText, Video, Sparkles, Bot, Loader2, Camera, Brain, GraduationCap, Download, ZoomIn, Settings2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '@/context/ThemeContext.jsx';
import mermaid from 'mermaid';




// --- SUB-COMPONENT: Mermaid Diagram Renderer (Dark Mode + Frosted Glass) ---
const MermaidDiagram = ({ code }) => {
  const { isDarkMode } = useTheme(); // ✅ Hook into your Theme Context
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [scale, setScale] = useState(1); 

  useEffect(() => {
    try {
      mermaid.initialize({ 
        startOnLoad: false,
        theme: isDarkMode ? 'dark' : 'default', // ✅ Auto-switch Diagram Theme
        securityLevel: 'strict',
        fontFamily: 'sans-serif',
        darkMode: isDarkMode // Explicit flag for newer Mermaid versions
      });
    } catch (e) { /* Ignore */ }

    const renderDiagram = async () => {
      if (!code) return;
      try {
        setError(null);
        let cleanCode = code.replace(/```mermaid/g, '').replace(/```/g, '').trim();
        if (!cleanCode.startsWith('graph') && !cleanCode.startsWith('flowchart')) {
          cleanCode = 'graph TD\n' + cleanCode;
        }

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        
        // Rerender specifically when dark mode changes to update chart colors
        const { svg: rawSvg } = await mermaid.render(id, cleanCode);
        
        // Sanitize the SVG content to strip any script tags or handlers
        const cleanSvg = DOMPurify.sanitize(rawSvg, {
          USE_PROFILES: { html: false, svg: true }
        });
        
        setSvg(cleanSvg);
      } catch (err) {
        console.error("Mermaid Render Error:", err);
        setError("Invalid Diagram Syntax");
        setSvg(''); 
      }
    };

    // Small delay ensures DOM is ready
    const timer = setTimeout(renderDiagram, 100);
    return () => clearTimeout(timer);
  }, [code, isDarkMode]); // ✅ Re-run when Dark Mode toggles

  // Reset Zoom
  useEffect(() => {
    if (!isOverlayOpen) setScale(1);
  }, [isOverlayOpen]);

  const handleDownload = (e) => {
    e.stopPropagation();
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mindmap-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 6));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  if (error) {
    return (
      <div className={`p-3 my-2 text-xs border rounded-lg ${isDarkMode ? 'bg-red-900/20 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-600'}`}>
        <p className="font-bold">Diagram Error:</p>
        <pre className={`mt-1 overflow-x-auto p-2 rounded border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>{code}</pre>
      </div>
    );
  }

  return (
    <>
      {/* 1. COMPACT CHAT CARD */}
      <div 
        className={`relative group my-4 p-2 rounded-xl border transition-all cursor-pointer shadow-sm ${
          isDarkMode 
            ? 'bg-gray-800/50 border-gray-700 hover:border-blue-500/50' 
            : 'bg-white border-gray-200 hover:border-blue-400'
        }`}
        onClick={() => setIsOverlayOpen(true)}
      >
        {/* Quick Actions */}
        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button onClick={handleDownload} className={`p-1.5 rounded-md shadow-sm transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-blue-900 text-gray-300' : 'bg-gray-100 hover:bg-blue-100 text-gray-600'}`}>
            <Download className="w-4 h-4" />
          </button>
          <button className={`p-1.5 rounded-md shadow-sm transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-blue-900 text-gray-300' : 'bg-gray-100 hover:bg-blue-100 text-gray-600'}`}>
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
        
        {/* Diagram */}
        <div className="overflow-x-auto flex justify-center py-2" dangerouslySetInnerHTML={{ __html: svg }} />
        
        {!svg && !error && <div className="text-center text-xs text-gray-400 py-4">Generating visual map...</div>}
        {svg && <p className={`text-[10px] text-center mt-1 border-t pt-1 border-dashed ${isDarkMode ? 'text-gray-500 border-gray-700' : 'text-gray-400 border-gray-200'}`}>Tap to expand</p>}
      </div>

      {/* 2. FROSTED GLASS OVERLAY */}
      {isOverlayOpen && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsOverlayOpen(false)}
        >
          <div 
            className={`relative rounded-2xl w-[95vw] h-[85vh] flex flex-col shadow-2xl overflow-hidden backdrop-blur-2xl border transition-colors ${
              isDarkMode 
                ? 'bg-gray-900/85 border-gray-700/50 text-gray-100' // Dark Glass
                : 'bg-white/90 border-white/20 text-gray-800'        // Light Glass
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* --- HEADER --- */}
            <div className={`flex justify-between items-center p-4 border-b z-10 shrink-0 ${isDarkMode ? 'border-gray-700/50 bg-gray-900/50' : 'border-gray-200/50 bg-white/50'}`}>
              <h3 className={`font-semibold flex items-center ${isDarkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                <Brain className="w-4 h-4 mr-2 text-blue-500"/> Mind Map View
              </h3>

              <div className="flex items-center space-x-2">
                {/* Zoom Controls */}
                <div className={`flex items-center rounded-lg mr-2 border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
                  <button onClick={handleZoomOut} className={`p-1.5 rounded-l-lg px-3 font-bold hover:bg-opacity-80 ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}>-</button>
                  <span className="text-xs font-mono w-10 text-center opacity-80">{Math.round(scale * 100)}%</span>
                  <button onClick={handleZoomIn} className={`p-1.5 rounded-r-lg px-3 font-bold hover:bg-opacity-80 ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}>+</button>
                </div>

                <button onClick={handleDownload} className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors shadow-lg shadow-blue-500/20">
                  <Download className="w-4 h-4" /> <span className="hidden sm:inline">Download</span>
                </button>
                <button onClick={() => setIsOverlayOpen(false)} className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-red-900/30 text-gray-400 hover:text-red-400' : 'hover:bg-red-100 text-gray-500 hover:text-red-600'}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* --- BODY --- */}
            <div className={`flex-1 overflow-auto flex justify-center p-8 pt-12 cursor-grab active:cursor-grabbing ${
              isDarkMode ? 'bg-black/20' : 'bg-gray-50/50'
            }`}>
              {/* Force white text on diagram lines in dark mode by using filter invert if needed, 
                  but Mermaid usually handles 'theme: dark' well enough. */}
              <div 
                className={`transition-transform duration-200 ease-out origin-top ${isDarkMode ? 'brightness-110 contrast-125' : ''}`}
                style={{ transform: `scale(${scale})` }}
                dangerouslySetInnerHTML={{ __html: svg }} 
              />
            </div>
            
          </div>
        </div>
      )}
    </>
  );
};


const NoteloomAi = () => {
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  // --- STATE ---
  const [userName, setUserName] = useState('Buddy'); 
  const [userRole, setUserRole] = useState('Guest');
  const [contextName, setContextName] = useState('Dashboard');
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('chat'); 
  const [showTools, setShowTools] = useState(false); // Controls the tools visibility
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [chatMode, setChatMode] = useState('standard'); // 'standard', 'tutor'
  const imageInputRef = useRef(null); // For Snap & Solve

  // --- CRITICAL FIX: DEFINE THESE BEFORE useEffect ---
  const token = localStorage.getItem('sessionToken');
  // const isPublicPage = ['/', '/login', '/it-login'].includes(location.pathname);

  // New Logic: Whitelist approach (Show ONLY on these pages)
const allowedPaths = [
  '/my-classes',      // Matches "My Classes"
  '/courses',         // Matches "My Courses"
  '/classrooms',      // Matches "Classroom View"
  // '/cls-detail',      // Matches "ClsDetailView"
  // '/class-details'    // Extra safety
];

const isAllowedPage = allowedPaths.some(path => location.pathname.includes(path));

  // --- 1. FETCH USER & CONTEXT ---
  useEffect(() => {
    // A. Detect Context based on URL
    const path = location.pathname;
    if (path.includes('/classrooms/')) setContextName('Current Class');
    else if (path.includes('/my-classes')) setContextName('My Classes');
    else if (path.includes('/courses')) setContextName('My Courses');
    else if (path.includes('/it-admin')) setContextName('IT Admin Portal');
    else setContextName('Dashboard');

    // B. Fetch User Info (If token exists)
    const fetchUser = async () => {
      if (!token) return; 
      try {
        const res = await fetch(`${API_BASE}/session/info`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Fix to ensure we get the name correctly even if nested
          const realName = data.user?.name || data.name || data.user?.username || 'User';
          setUserName(realName); 
          setUserRole(data.role);      
        }
      } catch (e) {
        console.error("AI Session Fetch Error", e);
      }
    };

    // Only fetch if we are on an allowed page
    if (isAllowedPage) {
      fetchUser();
    }
  }, [location.pathname, token, isAllowedPage]);

  // --- 2. DYNAMIC WELCOME MESSAGE ---
  useEffect(() => {
    // Only update greeting if the user hasn't sent a message yet
    if (!isAllowedPage) return; // Don't run if hidden
    const hasUserChatted = messages.some(m => m.type === 'user');
    
    if (!hasUserChatted) {
      const firstName = userName !== 'Buddy' ? userName.split(' ')[0] : 'User';
      
      setMessages([{ 
        id: 'init', 
        type: 'bot', 
        text: `Hi ${firstName}! I am Noteloom Ai. How can I help?` 
      }]);
    }
  }, [userName, contextName]); 

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

const handleSend = async (overrideMode = null) => {
    if (!input.trim()) return;

    // Detect if user wants a mind map
    const modeToSend = overrideMode || (input.toLowerCase().includes("mind map") ? 'mindmap' : chatMode);

    const userMsg = { id: Date.now(), type: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          message: currentInput, 
          context: { classroomName: contextName, userName: userName, role: userRole },
          mode: modeToSend // Send the mode
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: "Connection failed." }]);
    } finally {
      setIsLoading(false);
    }
  };

// B. FILE UPLOAD HANDLER
const handleFileUpload = async (e, taskType = 'summarize') => {
    const file = e.target.files[0];
    if (!file) return;

    const userText = taskType === 'solve' ? `Solving problem: ${file.name}...` : `Analyzing document: ${file.name}...`;
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: userText }]);
    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('taskType', taskType); // 'solve' or 'summarize'

    try {
      const response = await fetch(`${API_BASE}/api/ai/summarize-file`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: data.summary }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: "Upload failed." }]);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

// --- NEW: HANDLE LOCAL VIDEO (Smart Detection) ---
  const handleLocalVideo = async () => {
    // 1. Look for Standard Video Player (Local Files)
    const videoElement = document.querySelector('video');
    
    // 2. Look for Embedded Video (YouTube/Vimeo use iframes)
    const iframeElement = document.querySelector('iframe');

    // SCENARIO A: It is an iframe (YouTube, Vimeo, etc.)
    if (iframeElement) {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        type: 'bot', 
        text: "I cannot Transcribe videos from Third Party Sources" 
      }]);
      return; 
    }

    // SCENARIO B: No player found at all
    if (!videoElement) {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        type: 'bot', 
        text: "I can't see a video player on this page. Please play the lecture first!" 
      }]);
      return;
    }

    // SCENARIO C: Video Element found - Check if it is Local
    const src = videoElement.currentSrc || videoElement.src;
    
    // Strict Check: Must contain '/webdata/' (your local server path)
    const isLocalVideo = src && src.includes('/webdata/');

    if (!isLocalVideo) {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        type: 'bot', 
        text: "I cannot Transcribe videos from Third Party Sources" 
      }]);
      return;
    }

    // --- PROCEED WITH LOCAL TRANSCRIPTION ---
    const filename = src.split('/').pop().split('?')[0]; 
    console.log("Detected Local Video:", filename);

    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: `Analyze lecture: ${filename}` }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/ai/transcribe-local-video`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ filename })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: "Failed to analyze video." }]);
    } finally {
      setIsLoading(false);
      setMode('chat');
    }
  };

  // --- FINAL GUARD ---
 if (!token || !isAllowedPage) return null;

// --- E. RENDER HELPER (FIXED) ---
  const renderMessageContent = (text) => {
    
    // STRATEGY 1: Handle Custom Tags (If you used the "Simple" backend fix)
    if (text.includes(':::MERMAID_Start:::')) {
      const cleanCode = text.replace(/:::MERMAID_Start:::|:::MERMAID_End:::/g, '').trim();
      return <MermaidDiagram code={cleanCode} />;
    }

    // STRATEGY 2: Handle Standard Markdown Blocks (If you used the "Strict Prompt" backend)
    if (text.includes('```mermaid')) {
      // Split by the code block tags, capturing the content
      const parts = text.split(/(```mermaid[\s\S]*?```)/g);

      return parts.map((part, index) => {
        // Check if this specific part is the code block
        if (part.startsWith('```mermaid')) {
          // Clean up the tags to get raw code
          const code = part.replace(/^```mermaid\s*/, '').replace(/```$/, '').trim();
          return <MermaidDiagram key={index} code={code} />;
        }

        // Render normal text parts
        if (part.trim().length > 0) {
          return (
            <ReactMarkdown key={index} components={{
               ul: ({node, ...props}) => <ul className="list-disc pl-4 mt-2 mb-2" {...props} />,
               li: ({node, ...props}) => <li className="pl-1" {...props} />,
               strong: ({node, ...props}) => <span className="font-bold" {...props} />,
            }}>
              {part}
            </ReactMarkdown>
          );
        }
        return null;
      });
    }
    
    // Default: Just render Markdown
    return (
      <ReactMarkdown components={{
         ul: ({node, ...props}) => <ul className="list-disc pl-4 mt-2 mb-2" {...props} />,
         li: ({node, ...props}) => <li className="pl-1" {...props} />,
         strong: ({node, ...props}) => <span className="font-bold" {...props} />,
      }}>
        {text}
      </ReactMarkdown>
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end font-sans">

      {/* CHAT WINDOW */}
      {isOpen && (
        <div className={`mb-4 w-[350px] md:w-[400px] h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border transition-all ${
          isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-3 text-white">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">Noteloom Ai</h3>
                {/* UPDATED SUBTITLE */}
                <p className="text-[10px] opacity-80 flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" /> Your personalised assistant
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                  msg.type === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : isDarkMode 
                      ? 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700' 
                      : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                }`}>
                    {/* ✨ UPDATED: Use ReactMarkdown to render formatting */}
                 {/* 🟢 ADD THIS LINE INSTEAD: */}
      {renderMessageContent(msg.text)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className={`p-3 rounded-2xl rounded-bl-none flex items-center space-x-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-100'}`}>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-xs opacity-50">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

{/* --- COLLAPSIBLE TOOLS SECTION --- */}
          <div 
            className={`transition-all duration-300 ease-in-out overflow-hidden border-t ${
              showTools 
                ? 'max-h-[200px] opacity-100 py-2' // Open State
                : 'max-h-0 opacity-0 border-transparent' // Closed State
            } ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}
          >
            
            {/* 1. Chat Modes (Segmented Control) */}
            <div className="px-4 pb-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider mb-2 block ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                Chat Mode
              </span>
              <div className={`flex p-1 rounded-xl transition-all ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                {['standard', 'tutor', 'mindmap'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setChatMode(mode)}
                    className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ease-out ${
                      chatMode === mode 
                        ? 'bg-white text-blue-600 shadow-sm scale-[1.02]' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                    } ${
                      chatMode === mode && isDarkMode ? '!bg-gray-700 !text-white !shadow-none' : ''
                    }`}
                  >
                    {mode === 'standard' && <MessageSquare className="w-3.5 h-3.5" />}
                    {mode === 'tutor' && <GraduationCap className="w-3.5 h-3.5" />}
                    {mode === 'mindmap' && <Brain className="w-3.5 h-3.5" />}
                    <span className="capitalize">{mode === 'standard' ? 'Normal' : mode}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Action Tools */}
            <div className="px-4 pb-1 flex space-x-2 overflow-x-auto no-scrollbar">
              {/* Solve */}
              <button 
                onClick={() => imageInputRef.current?.click()} 
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                  isDarkMode 
                    ? 'border-gray-700 text-gray-300 hover:bg-gray-800' 
                    : 'border-gray-200 text-gray-600 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-600'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Solve</span>
              </button>

              {/* Summarizer */}
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                  isDarkMode 
                    ? 'border-gray-700 text-gray-300 hover:bg-gray-800' 
                    : 'border-gray-200 text-gray-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Summarizer</span>
              </button>

              {/* Transcribe (Only in Class) */}
              {contextName === 'Current Class' && (
                <button 
                  onClick={handleLocalVideo} 
                  className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                    isDarkMode 
                      ? 'border-gray-700 text-gray-300 hover:bg-gray-800' 
                      : 'border-gray-200 text-gray-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Transcribe</span>
                </button>
              )}
            </div>
          </div>

          {/* --- INPUT AREA --- */}
          <div className={`p-4 border-t shrink-0 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="relative flex items-center">
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx,.doc,.txt,.ppt,.pptx" onChange={(e) => handleFileUpload(e, 'summarize')} />
              <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'solve')} />

              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={chatMode === 'tutor' ? "Ask me to teach you something..." : "Ask me anything..."}
                // Added padding-right (pr-20) to fit both buttons
                className={`w-full pl-4 pr-20 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
                }`}
              />
              
              {/* BUTTONS GROUP (Right Side) */}
              <div className="absolute right-2 flex items-center space-x-1">
                
                {/* 🟢 Toggle Settings Button */}
                <button 
                  onClick={() => setShowTools(!showTools)} 
                  className={`p-2 rounded-lg transition-colors ${
                    showTools 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                  }`}
                  title="Toggle Tools"
                >
                  <Settings2 className="w-4 h-4" />
                </button>

                {/* Send Button */}
                <button 
                  onClick={() => handleSend()} 
                  disabled={!input.trim()} 
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full shadow-lg hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <Bot className="w-7 h-7 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
            </span>
          </>
        )}
      </button>
    </div>
  );
};

export default NoteloomAi;