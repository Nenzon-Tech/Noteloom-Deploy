import React from 'react';
import { motion } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext.jsx';

const SessionExpiredPage = ({ onLoginRedirect }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`max-w-md w-full space-y-8 p-8 rounded-xl shadow-2xl text-center backdrop-blur-md border transition-all duration-300 ${
          isDarkMode 
            ? 'bg-yellow-900/20 border-yellow-500/50' 
            : 'bg-yellow-100/70 border-yellow-300/50'
        }`}
      >
        <div>
          <WifiOff className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-yellow-500' : 'text-yellow-600'}`} />
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Session Expired</h2>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Your session has expired due to inactivity or page refresh. Please login again to continue.
          </p>
        </div>

        <div className={`rounded-lg p-4 backdrop-blur-sm border ${
          isDarkMode 
            ? 'bg-yellow-900/30 border-yellow-500/30' 
            : 'bg-yellow-100/50 border-yellow-400/30'
        }`}>
          <p className={`text-sm ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
            For security reasons, you are automatically logged out after 30 minutes of inactivity or when the page is refreshed.
          </p>
        </div>

        <button
          onClick={onLoginRedirect}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
        >
          Go to Login
        </button>
      </motion.div>
    </div>
  );
};

export default SessionExpiredPage;