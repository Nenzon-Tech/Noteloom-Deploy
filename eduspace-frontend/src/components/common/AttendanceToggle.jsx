import React from 'react';
import { Check, X, FileText, Ban } from 'lucide-react';
import { motion } from 'framer-motion';

const AttendanceToggle = ({ status, onChange }) => {
  // Define configuration for each state
  const options = [
    { value: 'Present', icon: Check, color: 'text-emerald-500', bg: 'bg-emerald-500' },
    { value: 'Absent', icon: X, color: 'text-red-500', bg: 'bg-red-500' },
    { value: 'Excused', icon: FileText, color: 'text-yellow-500', bg: 'bg-yellow-500' }, // "Note" option
    { value: 'NotMarked', icon: Ban, color: 'text-gray-400', bg: 'bg-gray-500' }
  ];

  // Helper to get active style
  const getActiveStyle = (optValue) => {
    if (status === optValue) {
      // The "Selected" look (Solid background)
      return `${optValue === 'NotMarked' ? 'bg-gray-600' : options.find(o => o.value === optValue).bg} text-white shadow-lg scale-105`;
    }
    // The "Unselected" look (Transparent/Ghost)
    return `hover:bg-gray-100 dark:hover:bg-gray-800 ${options.find(o => o.value === optValue).color} opacity-60 hover:opacity-100`;
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 p-1 rounded-xl flex items-center gap-1 w-fit border border-gray-200 dark:border-gray-700 shadow-inner">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={(e) => {
            e.stopPropagation();
            onChange(opt.value);
          }}
          className={`
            p-2.5 rounded-lg transition-all duration-200 flex items-center justify-center
            ${getActiveStyle(opt.value)}
          `}
          title={opt.value}
        >
          <opt.icon size={18} strokeWidth={2.5} />
        </button>
      ))}
    </div>
  );
};

export default AttendanceToggle;