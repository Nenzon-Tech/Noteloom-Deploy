import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext.jsx";

const TrustBar = () => {
  const { isDarkMode } = useTheme();

  // Swapped tech logos for core benefits that reinforce the College/Student model
  const benefits = [
    { name: "College Partners", icon: "🏛️" },
    { name: "100% Free for Students", icon: "✨" },
    { name: "All in One Learning Platform", icon: "📚" },
    { name: "Enterprise Features", icon: "🛡️" },
  ];

  return (
    <div className="relative py-12 px-6 w-full flex flex-col items-center justify-center overflow-hidden">
      {/* --- Smooth Background Crossfade Layers --- */}
      <div 
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isDarkMode ? 'opacity-100' : 'opacity-0'}`} 
        style={{ background: "linear-gradient(180deg, #111827 0%, #0f0c29 100%)" }} 
      />
      <div 
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${!isDarkMode ? 'opacity-100' : 'opacity-0'}`} 
        style={{ background: "linear-gradient(180deg, #F7F8FC 0%, #e8eaf6 100%)" }} 
      />

      {/* Content wrapper with z-10 so it sits on top of the fading backgrounds */}
      <div className="relative z-10 w-full flex flex-col items-center">
        
        {/* Updated Messaging Structure */}
        <div className="flex flex-col items-center mb-8 text-center">
          {/* <span className="px-3 py-1 mb-3 text-[10px] font-bold tracking-widest uppercase rounded-full bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 transition-colors duration-700">
            The Note Loom Model
          </span> */}
          <p className={`w-full max-w-2xl text-sm md:text-base font-medium tracking-wide transition-colors duration-700 ${
            isDarkMode ? 'text-white/70' : 'text-slate-600'
          }`}>
            Institutions subscribe to the platform. <br className="sm:hidden" />
            <span className="font-bold text-indigo-600 dark:text-indigo-400">Students get premium access for absolutely free.</span>
          </p>
        </div>
        
        {/* Updated Benefit Pills */}
        <div className="w-full max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 md:gap-12">
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className={`flex items-center gap-2.5 text-xs md:text-sm font-semibold tracking-wide transition-colors duration-700 ${
                isDarkMode ? 'text-white/40 hover:text-white/70' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="text-base md:text-xl grayscale opacity-80 transition-all duration-300 hover:grayscale-0 hover:opacity-100">
                {benefit.icon}
              </span>
              <span>{benefit.name}</span>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default TrustBar;