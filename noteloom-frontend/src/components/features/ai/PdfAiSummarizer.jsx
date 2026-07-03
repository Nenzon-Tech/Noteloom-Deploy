import { API_BASE } from '@/utils/config';
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Loader2, FileText } from 'lucide-react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';

 // Ensure this matches your backend

// 1. Helper to handle color transparency for the Glass effect
const hexToRgb = (hex) => {
  hex = hex.replace('#', '');
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
};

const PdfAiSummarizer = ({ pdfUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');

  // 🎨 THEME CONFIGURATION
  // Matches your "from-indigo-500 to-purple-500" button gradient
  const themeColor = "#6366f1"; // Indigo
  const themeRgb = hexToRgb(themeColor);

  // 🟢 2. ADD THIS REF (For cancelling requests)
  const abortControllerRef = useRef(null);

  // 🟢 3. ADD THIS EFFECT (Resets summary if you switch to a different PDF)
  useEffect(() => {
    setSummary('');
    setError('');
    setLoading(false);
  }, [pdfUrl]);

// 🟢 REPLACED FUNCTION
  const handleSummarize = async () => {
    setIsOpen(true);

    // ✅ CHECK: If summary exists, stop here (Persist State)
    if (summary) return; 

    setLoading(true);
    setError('');

    // Create a controller for this specific request
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('file', blob, 'document.pdf');
      formData.append('taskType', 'summarize');

      const apiRes = await fetch(`${API_BASE}/api/ai/summarize-file`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`
        },
        body: formData,
        // ✅ CONNECT THE ABORT SIGNAL
        signal: abortControllerRef.current.signal 
      });

      const data = await apiRes.json();
      
      if (data.summary) {
        setSummary(data.summary);
      } else {
        setError('Could not generate summary.');
      }

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('🛑 Request cancelled by user');
      } else {
        console.error(err);
        setError('Failed to analyze the PDF. Please try again.');
      }
    } finally {
      // Only stop loading if we weren't cancelled
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  };

  // 🟢 NEW FUNCTION (Attaches to Close Buttons)
  const handleClose = () => {
    // If loading, KILL the process immediately
    if (loading && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
    }
    setIsOpen(false);
  };

return (
    <>
      {/* 1. TRIGGER BUTTON (Stays inside the PDF Toolbar) */}
      <button
        onClick={handleSummarize}
        className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white rounded-md text-xs font-semibold shadow-md transition-all duration-200"
        title="Summarize with AI"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Ask AI</span>
      </button>

      {/* 2. POPUP (Moved to BODY tag via Portal to fix overlap) */}
      {isOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-[4px] animate-in fade-in duration-200 p-4">
          
          <div 
            className="w-full max-w-[500px] max-h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl transition-all scale-100 animate-in zoom-in-95"
            style={{
              background: `rgba(30, 41, 59, 0.95)`, 
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid rgba(${themeRgb}, 0.3)`,
              boxShadow: `0 0 50px rgba(${themeRgb}, 0.2), 0 0 15px rgba(0,0,0,0.3)`
            }}
          >
            
            {/* HEADER */}
            <div 
              className="flex items-center justify-between p-4 border-b shrink-0"
              style={{
                 background: `linear-gradient(90deg, rgba(${themeRgb}, 0.15), transparent)`,
                 borderColor: `rgba(${themeRgb}, 0.2)`
              }}
            >
              <div className="flex items-center space-x-2 text-white">
                <div className="p-1.5 rounded-lg" style={{ background: `rgba(${themeRgb}, 0.3)` }}>
                   <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-sm tracking-wide text-gray-100">AI Summary</h3>
              </div>
              
              <button 
                onClick={handleClose} 
                className="p-1.5 text-gray-400 rounded-full transition-all duration-200 hover:text-red-400 hover:bg-red-500/10 active:bg-red-500/20"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto p-6 text-sm leading-relaxed text-gray-200 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="relative">
                     <div className="absolute inset-0 blur-lg opacity-50" style={{ background: themeColor }}></div>
                     <Loader2 className="relative w-10 h-10 animate-spin text-white" />
                  </div>
                  <p className="text-gray-400 text-xs animate-pulse tracking-wider">ANALYZING DOCUMENT...</p>
                </div>
              ) : error ? (
                <div className="text-red-300 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center">
                  {error}
                </div>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none prose-p:text-gray-300 prose-headings:text-white prose-strong:text-indigo-300">
                  <ReactMarkdown>{summary}</ReactMarkdown>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div 
                className="p-3 border-t flex justify-end shrink-0 bg-slate-900/50"
                style={{ borderColor: `rgba(${themeRgb}, 0.2)` }}
            >
              <button 
                onClick={handleClose}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-95"
                style={{
                    background: `linear-gradient(135deg, ${themeColor}, #818cf8)`,
                    boxShadow: `0 4px 15px rgba(${themeRgb}, 0.4)`
                }}
              >
                Close
              </button>
            </div>

          </div>
        </div>,
        document.body // 🟢 Render directly into the body tag
      )}
    </>
  );
};

export default PdfAiSummarizer;