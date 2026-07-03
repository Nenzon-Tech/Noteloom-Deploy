import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/common/ThemeToggle.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";

const LandingNavbar = ({ navigate }) => {
  const { isDarkMode } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-transparent ${
        isScrolled
          ? "backdrop-blur-md border-b border-white/10"
          : "border-transparent py-2" 
      }`}
    >
      <nav className="relative z-50 flex items-center justify-between px-6 md:px-12 py-4 max-w-7xl mx-auto w-full">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
            Note Loom
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-green-400/70 to-green-600/70 text-white border border-green-500/70">
            Beta
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/college-selection')}
            /* 👇 Added hidden sm:block here 👇 */
            className="hidden sm:block px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-purple-500/30 transition-all duration-200"
          >
            Get Started
          </motion.button>
        </div>

      </nav>
    </header>
  );
};

export default LandingNavbar;