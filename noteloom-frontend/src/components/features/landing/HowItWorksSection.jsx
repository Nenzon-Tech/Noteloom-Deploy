import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Settings, Rocket } from "lucide-react";
import { useTheme } from "@/context/ThemeContext.jsx";

const HowItWorksSection = () => {
  const { isDarkMode } = useTheme();

  const steps = [
    { 
      Icon: BookOpen,  
      step: "01", 
      title: "Locate Your Campus",    
      desc: "Find and select your college from our supported institution list to load your official portal details.", 
      accent: "from-blue-500 to-indigo-600" 
    },
    { 
      Icon: Settings,  
      step: "02", 
      title: "Verify Credentials",    
      desc: "Sign in securely using your academic registration ID to unlock student or faculty access rights instantly.", 
      accent: "from-indigo-500 to-purple-600" 
    },
    { 
      Icon: Rocket,    
      step: "03", 
      title: "Direct Access",         
      desc: "Your customized dashboard is ready immediately. Access your classes and academic info without any manual setup.", 
      accent: "from-purple-500 to-pink-600" 
    },
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      {/* --- Smooth Background Crossfade Layers --- */}
      <div 
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isDarkMode ? 'opacity-100' : 'opacity-0'}`} 
        style={{ background: "linear-gradient(180deg, #0f0a1e 0%, #111827 100%)" }} 
      />
      <div 
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${!isDarkMode ? 'opacity-100' : 'opacity-0'}`} 
        style={{ background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)" }} 
      />

      {/* Subtle ambient glow for depth */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] rounded-full transition-colors duration-700"
          style={{
            background: isDarkMode 
              ? "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)" 
              : "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 65%)",
            filter: "blur(80px)"
          }}
        />
        <div
          className="absolute bottom-[-10%] right-[15%] w-[400px] h-[400px] rounded-full transition-colors duration-700"
          style={{
            background: isDarkMode 
              ? "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 65%)" 
              : "radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 65%)",
            filter: "blur(70px)"
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-xs tracking-widest uppercase font-semibold text-indigo-400 mb-3 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            Getting Started
          </span>
          <h2 className={`text-3xl md:text-4xl font-bold transition-colors duration-700 ${
            isDarkMode ? "text-white" : "text-slate-900"
          }`}>
            How it works
          </h2>
          <p className={`mt-3 text-base max-w-xl mx-auto transition-colors duration-700 ${
            isDarkMode ? "text-white/55" : "text-slate-600"
          }`}>
            Three simple steps to access your full campus portal
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map(({ Icon: CardIcon, step, title, desc, accent }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.55 }}
              className={`relative rounded-2xl border overflow-hidden group transition-colors duration-700 ${
                isDarkMode ? "border-white/10" : "border-slate-200/80"
              }`}
              style={{
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                background: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.85)",
                boxShadow: isDarkMode 
                  ? "inset 1.5px 1.5px 0px rgba(255,255,255,0.12), inset -1px -1px 0px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.25)" 
                  : "inset 1px 1px 0px rgba(255,255,255,0.8), 0 4px 20px rgba(0,0,0,0.02)",
                transition: "background 0.7s ease, box-shadow 0.7s ease, border-color 0.7s ease" // Smooth glass transition
              }}
            >
              {/* Step number watermark */}
              <div
                className="absolute top-3 right-4 text-6xl font-black pointer-events-none select-none"
                style={{ 
                  color: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  transition: "color 0.7s ease"
                }}
              >
                {step}
              </div>

              <div className="p-7">
                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center mb-5 shadow-lg`}>
                  <CardIcon className="w-5 h-5 text-white" />
                </div>

                {/* Step label */}
                <p className="text-[10px] font-bold tracking-widest uppercase text-indigo-500 dark:text-indigo-400 mb-1 transition-colors duration-700">Step {step}</p>

                {/* Title */}
                <h3 className={`text-base font-bold mb-2 transition-colors duration-700 ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}>{title}</h3>

                {/* Description */}
                <p className={`text-xs leading-relaxed transition-colors duration-700 ${
                  isDarkMode ? "text-white/55" : "text-slate-600"
                }`}>{desc}</p>

                {/* Bottom accent line */}
                <div className={`mt-5 h-0.5 w-12 rounded-full bg-gradient-to-r ${accent} group-hover:w-full transition-all duration-500`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
