import React from 'react';
import { useTheme } from '@/context/ThemeContext.jsx';
// Ensure you have extracted CollegeBannerLogo to common components
import CollegeBannerLogo from '@/components/common/CollegeBannerLogo.jsx'; 

// You might need to move this config to a utils file (e.g., src/utils/config.js)
// For now, I'm defining it here or import it if you moved it.
import { COLLEGE_CONFIG } from '@/utils/config'; 

const CollegeDashboardFooter = () => {
  const { isDarkMode } = useTheme();

  return (
    <footer className={`mt-auto py-4 px-4 border-t transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-800/50 border-gray-700/50' 
        : 'bg-gray-200/50 border-gray-300/50'
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          {/* Left side - College/Note Loom Logo */}
          <div className="flex items-center gap-2">
  {/* Dynamic logo OR fallback gradient text */}
  <CollegeBannerLogo className="scale-90" />

  {/* Always visible text */}
  <span
    className={`text-xs font-medium tracking-tight ${
      isDarkMode ? 'text-gray-400' : 'text-gray-600'
    }`}
  >
    Powered by Note Loom
  </span>
</div>


          {/* Right side - Links */}
          <div className="flex items-center space-x-4 text-xs">
            <button className={`transition-colors ${
              isDarkMode 
                ? 'text-gray-400 hover:text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}>
              Tech Support
            </button>
            <span className={`${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              © 2026 Note Loom
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CollegeDashboardFooter;