import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext.jsx';
import { Calendar, Clock } from "lucide-react";

const ITDashboardFooter = () => {
  const { isDarkMode } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loginTime] = useState(() => {
    // Get login time from localStorage or use current time as fallback
    const storedLoginTime = localStorage.getItem('itLoginTime');
    return storedLoginTime ? new Date(storedLoginTime) : new Date();
  });

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', { 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  return (
    <footer className={`mt-auto py-4 px-4 border-t transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-800/50 border-gray-700/50' 
        : 'bg-gray-200/50 border-gray-300/50'
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          {/* Left side - Note Loom Beta */}
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Note Loom Beta
            </span>
            <span className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              V 1.0.0
            </span>
          </div>

          {/* Right side - Date, Time, Login Time */}
          <div className="flex items-center space-x-4 text-xs">
            <div className={`flex items-center space-x-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <Calendar className="w-3 h-3" />
              <span>{formatDate(currentTime)}</span>
            </div>
            <div className={`flex items-center space-x-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <Clock className="w-3 h-3" />
              <span>{formatTime(currentTime)}</span>
            </div>
            <div className={`text-xs ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              Logged in: {formatTime(loginTime)}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ITDashboardFooter;