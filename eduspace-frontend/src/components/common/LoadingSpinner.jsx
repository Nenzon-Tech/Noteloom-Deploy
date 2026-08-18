import React from 'react';
import { GraduationCap } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext.jsx';

const LoadingSpinner = ({ message = "Loading..." }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-[200px] w-full flex flex-col items-center justify-center p-8 space-y-4 rounded-2xl transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900/20 text-gray-200' : 'bg-gray-50/20 text-gray-800'
    }`}>
      <div className="relative flex items-center justify-center w-20 h-20">
        {/* Outer glowing animated ring */}
        <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-indigo-500 border-b-purple-500 border-l-transparent animate-spin duration-1000"></div>
        {/* Middle reverse spinning ring for visual complexity */}
        <div className="absolute inset-2 rounded-full border-2 border-t-purple-400 border-l-pink-400 border-b-transparent border-r-transparent animate-spin duration-1500 reverse"></div>
        {/* Center pulsing icon */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 animate-pulse flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-blue-500" />
        </div>
      </div>
      
      <p className="text-sm font-semibold tracking-wider animate-pulse text-gray-500 dark:text-gray-400">
        {message}
      </p>
    </div>
  );
};

export default LoadingSpinner;
