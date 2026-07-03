import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext.jsx';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative flex items-center w-14 h-8 rounded-full border bg-transparent transition-colors duration-500 focus:outline-none flex-shrink-0 ${
        isDarkMode 
          ? 'border-white/10' 
          : 'border-white/20'
      }`}
      style={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: isDarkMode ? 'inset 0 2px 4px rgba(0,0,0,0.3)' : 'inset 0 2px 4px rgba(255,255,255,0.1)'
      }}
    >
      {/* Background Track Icons (Faded hints) */}
      <div className="absolute w-full flex justify-between px-2 pointer-events-none">
        <Sun className={`w-4 h-4 transition-opacity duration-500 ${isDarkMode ? 'opacity-30 text-white' : 'opacity-0'}`} />
        {/* Made the inactive Moon white instead of grey so it shows up on your dark video! */}
        <Moon className={`w-4 h-4 transition-opacity duration-500 ${isDarkMode ? 'opacity-0' : 'opacity-40 text-white'}`} />
      </div>

      {/* The Sliding Puck (Also frosted!) */}
      <div
        className={`absolute w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-500 ${
          isDarkMode 
            ? 'translate-x-7 bg-indigo-500/80 shadow-[0_0_12px_rgba(99,102,241,0.5)]' 
            : 'translate-x-1 bg-white/80 shadow-[0_2px_8px_rgba(0,0,0,0.2)]'
        }`}
        style={{
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        {/* Sun morphing inside the puck */}
        <Sun 
          className={`absolute w-3.5 h-3.5 text-amber-500 transition-all duration-500 ${
            isDarkMode ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
          }`} 
        />
        {/* Moon morphing inside the puck */}
        <Moon 
          className={`absolute w-3.5 h-3.5 text-white transition-all duration-500 ${
            isDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
          }`} 
        />
      </div>
    </button>
  );
};

export default ThemeToggle;