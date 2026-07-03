import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle, X, WifiOff, Info, Wifi } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext.jsx'; // Ensure this path is correct for your project

const ErrorPopupContext = createContext();

// Hook to use in any page (LoginPage, ManageDepartments, etc.)
export const useErrorPopup = () => useContext(ErrorPopupContext);

export const ErrorPopupProvider = ({ children }) => {
  const [popups, setPopups] = useState([]);
  const { isDarkMode } = useTheme();

  // --- Core Function to Add a Popup ---
  const triggerPopup = useCallback((message, type = 'error', duration = 5000) => {
    const id = Date.now() + Math.random();
    
    // Log errors to console as requested
    if (type === 'error') {
      console.error("Application Error:", message);
    }

    setPopups((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  // --- Helper to Remove Popup ---
  const removePopup = useCallback((id) => {
    setPopups((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // --- Automatic Network Detection ---
  // This listener is active globally as long as the app is running
  useEffect(() => {
    const handleOffline = () => triggerPopup("No Internet Connection. Functionality may be limited.", 'error', 8000);
    const handleOnline = () => triggerPopup("Back Online! Connection restored.", 'success', 3000);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [triggerPopup]);

  return (
    <ErrorPopupContext.Provider value={{ triggerPopup, removePopup }}>
      {children}
      
      {/* GLOBAL POPUP CONTAINER (Always on top) */}
      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[9999] flex flex-col gap-4 pointer-events-none items-center">
        <AnimatePresence>
          {popups.map((popup) => (
            <PopupItem 
              key={popup.id} 
              popup={popup} 
              removePopup={removePopup} 
              isDarkMode={isDarkMode} 
            />
          ))}
        </AnimatePresence>
      </div>
    </ErrorPopupContext.Provider>
  );
};

// --- Internal UI Component (The Pill) ---
const PopupItem = ({ popup, removePopup, isDarkMode }) => {
  const isError = popup.type === 'error';
  const isNetwork = popup.message.toLowerCase().includes('internet') || popup.message.toLowerCase().includes('connection');
  
  // Icon Selection Logic
  let Icon = Info;
  if (isError) Icon = AlertCircle;
  if (popup.type === 'success') Icon = CheckCircle;
  if (isNetwork && isError) Icon = WifiOff;
  if (isNetwork && !isError) Icon = Wifi;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className={`pointer-events-auto relative overflow-hidden rounded-full shadow-2xl backdrop-blur-xl border flex items-center pr-10 pl-4 py-3.5 min-w-[340px] max-w-md cursor-pointer
        ${isDarkMode 
          ? (isError ? 'bg-red-900/90 border-red-500/50 text-white' : 'bg-emerald-900/90 border-emerald-500/50 text-white')
          : (isError ? 'bg-white/95 border-red-200 text-red-900' : 'bg-white/95 border-emerald-200 text-emerald-900')
        }`}
      onClick={() => removePopup(popup.id)} // Allow click to dismiss
    >
      {/* Icon Badge */}
      <div className={`mr-3 p-2 rounded-full text-white shrink-0 shadow-sm ${isError ? 'bg-red-500' : 'bg-emerald-500'}`}>
        <Icon size={18} strokeWidth={2.5} />
      </div>
      
      {/* Message */}
      <div className="flex-1 text-sm font-bold mr-2 leading-tight tracking-wide">
        {popup.message}
      </div>

      {/* Close X Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); removePopup(popup.id); }}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 opacity-50 hover:opacity-100 hover:bg-black/10 rounded-full transition-all"
      >
        <X size={14} strokeWidth={3} />
      </button>

      {/* Time Slider / Progress Bar */}
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: popup.duration / 1000, ease: "linear" }}
        onAnimationComplete={() => removePopup(popup.id)}
        className={`absolute bottom-0 left-0 h-[3px] ${isError ? 'bg-red-400' : 'bg-emerald-400'}`}
        style={{ opacity: 0.6 }}
      />
    </motion.div>
  );
};

export default ErrorPopupProvider;