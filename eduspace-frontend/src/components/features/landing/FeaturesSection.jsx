import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Shield, CheckSquare, Library, TrendingUp, MessageSquare, ArrowRight, GraduationCap } from "lucide-react";
import { useTheme } from "@/context/ThemeContext.jsx";
import FeatureCard from "@/components/features/landing/FeatureCard.jsx";

const FeaturesSection = ({ activeCardIndex, setActiveCardIndex }) => {
  const { isDarkMode } = useTheme();

  const features = [
    {
      Icon: Sparkles,
      title: "AI-Powered Lecture Digest",
      description: "Instantly summarize lecture recordings, PDF slides, and textbook chapters. Ask custom follow-up questions to clarify complex concepts on demand.",
      linkText: "Explore AI Notes",
      linkIcon: ArrowRight,
      expandedFeatures: ["Summarize PDFs", "Lecture recordings", "AI follow-up questions"],
      miniStats: [
        { label: "satisfaction", value: "95%" },
        { label: "notes generated", value: "50k+" }
      ]
    },
    {
      Icon: Shield,
      title: "Controller of Examinations (COE)",
      description: "A centralized hub to register for classes, process examination forms, track fee status, and retrieve secure digital admit cards.",
      linkText: "View COE",
      linkIcon: ArrowRight,
      expandedFeatures: ["Register exams", "Track fees", "Download admit cards"],
      miniStats: [
        { label: "uptime", value: "99.9%" },
        { label: "forms processed", value: "1000+" }
      ]
    },
    {
      Icon: CheckSquare,
      title: "Intelligent Attendance Monitor",
      description: "Real-time tracking of lecture hours with automated smart warnings for students falling below the mandatory academic thresholds.",
      linkText: "Explore Attendance",
      linkIcon: ArrowRight,
      expandedFeatures: ["Live attendance", "Smart prediction", "Risk alerts"],
      miniStats: [
        { label: "engagement increase", value: "87%" }
      ]
    },
    {
      Icon: Library,
      title: "Secure Document Vault",
      description: "An organized repository for shared syllabus templates, past papers (PYQs), and lecture slideshows separated by course and semester.",
      linkText: "Open Library",
      linkIcon: ArrowRight,
      expandedFeatures: ["Store PYQs", "Organize resources", "Access anytime"],
      miniStats: []
    },
    {
      Icon: TrendingUp,
      title: "Academic Health Analytics",
      description: "Visualized graphs mapping class performances, feedback logs, and semester GPA progress over time to track your growth.",
      linkText: "Open Analytics",
      linkIcon: ArrowRight,
      expandedFeatures: ["GPA trends", "Performance graphs", "Feedback logs"],
      miniStats: []
    },
    {
      Icon: MessageSquare,
      title: "Instant Campus Noticeboard",
      description: "Direct digital communication between professors and students alongside campus-wide announcements and emergency bulletins.",
      linkText: "Open Notices",
      linkIcon: ArrowRight,
      expandedFeatures: ["Instant announcements", "Department updates", "Emergency alerts"],
      miniStats: []
    }
  ];

  return (
    <section id="features-section" className="relative py-20 overflow-hidden">
      {/* --- Smooth Background Crossfade Layers --- */}
      <div 
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isDarkMode ? 'opacity-100' : 'opacity-0'}`} 
        style={{ background: "linear-gradient(135deg, #0f0c29 0%, #1a1040 35%, #0d1b2a 65%, #130d2e 100%)" }} 
      />
      <div 
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${!isDarkMode ? 'opacity-100' : 'opacity-0'}`} 
        style={{ background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f8fafc 100%)" }} 
      />

      {/* Animated gradient orbs — give the glass something rich to refract */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{ x: [0, 80, -40, 0], y: [0, -60, 80, 0], scale: [1, 1.15, 0.9, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[10%] w-[420px] h-[420px] rounded-full"
          style={{
            background: isDarkMode 
              ? "radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)" 
              : "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
            filter: "blur(60px)"
          }}
        />
        <motion.div
          animate={{ x: [0, -100, 60, 0], y: [0, 80, -50, 0], scale: [1, 1.2, 0.85, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[10%] right-[10%] w-[480px] h-[480px] rounded-full"
          style={{
            background: isDarkMode 
              ? "radial-gradient(circle, rgba(168,85,247,0.30) 0%, transparent 70%)" 
              : "radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)",
            filter: "blur(70px)"
          }}
        />
        <motion.div
          animate={{ x: [0, 60, -80, 0], y: [0, -40, 60, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] left-[35%] w-[360px] h-[360px] rounded-full"
          style={{
            background: isDarkMode 
              ? "radial-gradient(circle, rgba(16,185,129,0.22) 0%, transparent 70%)" 
              : "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)",
            filter: "blur(80px)"
          }}
        />
        <motion.div
          animate={{ x: [0, -50, 30, 0], y: [0, 50, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute top-[5%] right-[25%] w-[300px] h-[300px] rounded-full"
          style={{
            background: isDarkMode 
              ? "radial-gradient(circle, rgba(236,72,153,0.20) 0%, transparent 70%)" 
              : "radial-gradient(circle, rgba(236,72,153,0.05) 0%, transparent 70%)",
            filter: "blur(55px)"
          }}
        />
      </div>

      {/* Floating platform symbols */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex flex-col justify-around py-20">
        {/* Row 1: Left to Right */}
        <motion.div 
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className={`flex items-center gap-32 w-[200%] transition-colors duration-700 ${isDarkMode ? 'text-indigo-400/[0.18]' : 'text-indigo-900/[0.15]'}`}
        >
          {[...Array(24)].map((_, i) => <GraduationCap key={`r1-${i}`} size={80} className="rotate-[15deg] shrink-0" />)}
        </motion.div>

        {/* Row 2: Right to Left */}
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className={`flex items-center gap-40 w-[200%] transition-colors duration-700 ${isDarkMode ? 'text-purple-400/[0.18]' : 'text-purple-900/[0.15]'}`}
        >
          {[...Array(20)].map((_, i) => <Library key={`r2-${i}`} size={110} className="-rotate-[10deg] shrink-0" />)}
        </motion.div>

        {/* Row 3: Left to Right */}
        <motion.div 
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className={`flex items-center gap-36 w-[200%] transition-colors duration-700 ${isDarkMode ? 'text-emerald-400/[0.18]' : 'text-emerald-900/[0.15]'}`}
        >
          {[...Array(24)].map((_, i) => <Sparkles key={`r3-${i}`} size={70} className="rotate-[30deg] shrink-0" />)}
        </motion.div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.6 }} 
          className="w-full flex flex-col items-center text-center mb-16"
        >
          <h2 className={`text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-center w-full transition-colors duration-700 ${
            isDarkMode ? "text-white" : "text-slate-900"
          }`}>
            All-in-One Enterprise Platform
          </h2>
          <p className={`text-lg max-w-2xl mx-auto text-center w-full font-medium transition-colors duration-700 ${
            isDarkMode ? "text-white/65" : "text-slate-600"
          }`}>
            Discover modules engineered specifically to handle modern educational workflows.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, idx) => (
            <FeatureCard
              key={idx}
              Icon={f.Icon}
              title={f.title}
              description={f.description}
              linkText={f.linkText}
              linkIcon={f.linkIcon}
              expandedFeatures={f.expandedFeatures}
              miniStats={f.miniStats}
              isDarkMode={isDarkMode}
              isExpanded={activeCardIndex === idx}
              isMuted={activeCardIndex !== null && activeCardIndex !== idx}
              onToggle={() => setActiveCardIndex(activeCardIndex === idx ? null : idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
