import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext.jsx';
import GlassHeader from '@/components/common/GlassHeader.jsx';
import ThemeToggle from '@/components/common/ThemeToggle.jsx';
import SessionExpiredPage from '@/components/common/SessionExpiredPage.jsx';

const CollegeMismatchWarning = ({ userCollege, currentCollege, onDeleteAccount, onCancel }) => {
  const { isDarkMode } = useTheme();
  
  // Simplified logic: Only handles standard college mismatch
  const mismatchInfo = {
    title: 'College Mismatch',
    subtitle: 'Account linked to different college',
    description: `Your account is linked to ${userCollege}, but you selected ${currentCollege}. You can only access your original college dashboard or create a new account for this college.`,
    primaryAction: `Go to ${userCollege}`,
    warning: '⚠️ COLLEGE MISMATCH',
    warningText: 'You can only access your original college dashboard or create a new account for this college.'
  };
  
  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Glass Header */}
      <GlassHeader className="flex items-center justify-end px-4">
        <ThemeToggle />
      </GlassHeader>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`max-w-lg w-full space-y-8 p-8 rounded-xl shadow-2xl backdrop-blur-md border transition-all duration-300 ${
          isDarkMode 
            ? 'bg-yellow-900/20 border-yellow-500/50' 
            : 'bg-yellow-100/70 border-yellow-300/50'
        }`}
      >
        <div className="text-center">
          <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-yellow-500' : 'text-yellow-600'}`} />
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{mismatchInfo.title}</h2>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{mismatchInfo.subtitle}</p>
        </div>

        <div className={`rounded-lg p-4 backdrop-blur-sm border ${
          isDarkMode 
            ? 'bg-yellow-900/30 border-yellow-500/30' 
            : 'bg-yellow-100/50 border-yellow-400/30'
        }`}>
          <p className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>{mismatchInfo.warning}</p>
          <p className={`text-sm mb-3 ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
            {mismatchInfo.description}
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
            {mismatchInfo.warningText}
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={onDeleteAccount}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            {mismatchInfo.primaryAction}
          </button>
          
          <button
            onClick={onCancel}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              isDarkMode 
                ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                : 'bg-gray-300 hover:bg-gray-400 text-gray-900'
            }`}
          >
            Select Different College
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CollegeMismatchWarning;