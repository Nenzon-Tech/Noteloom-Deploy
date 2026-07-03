import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, GraduationCap, Shield, TrendingUp } from "lucide-react";
import { useTheme } from "@/context/ThemeContext.jsx";

const HeroSection = ({ navigate }) => {
  const { isDarkMode } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const canvasRef = useRef(null);

  const slides = [
    { prefix: "Welcome To ", highlight: "Noteloom", break: false },
    { prefix: "Your Personalized ", highlight: "Learning Platform", break: false },
    { prefix: "Let's Connect, ", highlight: "Grow & Excel", break: false },
    { prefix: "Smarter Insights, ", highlight: "Better Grades", break: true },
    { prefix: "Master Coursework ", highlight: "Stress-Free", break: false },
    { prefix: "All Class Resources ", highlight: "In One Place", break: true }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resizeCanvas = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let tick = 0;

    const render = () => {
      tick += 0.012;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;

      const dotSpacingX = 24;
      const numRows = 7;
      const dotSpacingY = 16;
      const numCols = Math.ceil(width / dotSpacingX) + 1;

      const startY = height - 120;
      const dip = 80;

      for (let c = 0; c < numCols; c++) {
        const x = c * dotSpacingX;
        const angle = (x / width) * Math.PI;
        const curveY = startY + dip * Math.sin(angle);

        for (let r = 0; r < numRows; r++) {
          const baseY = curveY - r * dotSpacingY;
          const waveOffset = Math.sin(tick + c * 0.15 + r * 0.3) * 4;
          const dotY = baseY + waveOffset;

          const rowOpacity = (1 - r / numRows) * 0.45;
          const edgeFade = Math.sin(angle);
          const opacity = rowOpacity * edgeFade;

          if (opacity > 0) {
            ctx.beginPath();
            ctx.arc(x, dotY, 1.25, 0, Math.PI * 2);
            const hue = 260 + Math.sin(c * 0.08 + tick * 0.2) * 35;
            ctx.fillStyle = `hsla(${hue}, 95%, 75%, ${opacity})`;
            ctx.shadowColor = `hsla(${hue}, 95%, 65%, 0.8)`;
            ctx.shadowBlur = 5;
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDarkMode]);

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden isolate">
      {/* Cinematic library background video with theme-aware overlay */}
      <div
        className="absolute inset-0 -z-20"
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          willChange: 'transform'
        }}
      >
        <video autoPlay muted loop playsInline className="w-full h-full object-cover">
          <source src="https://cdn.pixabay.com/video/2015/09/27/846-140823862_large.mp4" type="video/mp4" />
        </video>
        {/* Theme-aware overlay */}
        {isDarkMode ? (
          <div 
            className="absolute inset-0 pointer-events-none mix-blend-normal"
            style={{
              background: "linear-gradient(90deg, rgba(6,10,20,0.62), rgba(10,14,28,0.42), rgba(8,10,20,0.58))"
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-[#040613]/65 pointer-events-none" />
        )}
        <div className={`absolute inset-0 transition-all duration-500 ${isDarkMode
          ? "bg-gradient-to-b from-transparent via-[#0a051d]/50 to-[#0a051d]"
          : "bg-gradient-to-b from-[#050716]/92 via-[#070a24]/88 to-[#f8fafc]"
          }`} />
        {/* Theme-aware center glow */}
        <div className="absolute inset-0 transition-opacity duration-500" style={{
          background: isDarkMode
            ? 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(139,124,246,0.15) 0%, transparent 70%)'
            : 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(99,102,241,0.12) 0%, transparent 70%)'
        }} />
      </div>

      {/* ---- Main Hero Content ---- */}
      <div className="relative z-10 flex-1 flex items-center pt-16 lg:pt-20 pb-4">
        <div className="w-full max-w-4xl mx-auto px-6 md:px-12 flex flex-col items-center justify-center pt-2 pb-4 lg:pt-4 lg:pb-6">

          {/* LEFT: Text Content */}
          <div className="flex flex-col items-center text-center">

            {/* Badge pill — liquid glass */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`inline-flex w-fit rounded-full border text-sm transition-all duration-300 mb-6 ${
                isDarkMode ? "border-[rgba(255,255,255,0.15)] text-[#E2E8F0]" : "border-white/20 text-white/85"
              }`}
              style={{
                position: "relative",
                overflow: "hidden",
                boxShadow: isDarkMode ? "0 4px 20px rgba(0,0,0,0.15)" : "0 4px 20px rgba(0,0,0,0.25), 0 6px 6px rgba(0,0,0,0.15)",
              }}
            >
              {/* Distortion blur */}
              <span aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0, backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)", filter: "url(#liquid-glass-distortion)", overflow: "hidden", isolation: "isolate", borderRadius: "inherit", pointerEvents: "none" }} />
              {/* Tint */}
              <span aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 1, background: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.18)", borderRadius: "inherit", pointerEvents: "none" }} />
              {/* Shine */}
              <span aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 2, borderRadius: "inherit", pointerEvents: "none", boxShadow: isDarkMode ? "none" : "inset 2px 2px 1px rgba(255,255,255,0.55), inset -1px -1px 1px rgba(255,255,255,0.35)" }} />
              {/* Content */}
              <span className="relative flex items-center gap-2 px-4 py-2" style={{ zIndex: 3 }}>
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                The Future of Education is Personalized
              </span>
            </motion.div>

            {/* Headline */}
            <div className="min-h-[80px] md:min-h-[100px] py-4 mb-4 flex items-center justify-center max-w-[850px] mx-auto text-center overflow-visible">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={currentSlide}
                  initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -15, filter: "blur(8px)" }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  /* 👇 Changed text color logic here 👇 */
                  className="hero-headline font-extrabold tracking-tight leading-[1.15] text-4xl sm:text-5xl md:text-6xl text-white"
                  style={isDarkMode ? { textShadow: "0 0 18px rgba(139,124,246,0.15)" } : {}}
                >
                  {slides[currentSlide].prefix}
                  {slides[currentSlide].break && <br className="hidden sm:inline" />}
                  <span className={`bg-gradient-to-r bg-clip-text text-transparent ${
                    isDarkMode
                      ? "from-[#6EA8FE] via-[#8B7CF6] to-[#C084FC]"
                      : "from-[#7AA2FF] to-[#B76EFF]"
                  }`}>
                    {slides[currentSlide].highlight}
                  </span>
                </motion.h1>
              </AnimatePresence>
            </div>

            {/* Sub-text */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className={`text-base md:text-lg leading-relaxed max-w-[640px] mb-8 transition-colors duration-300 mx-auto text-center ${
                isDarkMode ? "text-[#CBD5E1]" : "text-white/70"
              }`}
            >
              Revolutionizing education through AI-powered insights, smart automation, and meaningful connections.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4 mb-6"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/college-selection')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-lg transition-all duration-200 ${
                  isDarkMode 
                    ? "bg-gradient-to-r from-[#6E72FF] to-[#A855F7] shadow-purple-500/10 hover:shadow-purple-500/25" 
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-purple-500/30"
                }`}
              >
                Select College to Get Started
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              {/* Explore Features — liquid glass */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}
                className={`flex items-center rounded-xl border text-white font-semibold transition-all duration-300 ${
                  isDarkMode 
                    ? "border-[rgba(255,255,255,0.15)]" 
                    : "border-white/20"
                }`}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: isDarkMode ? "0 4px 15px rgba(0,0,0,0.12)" : "0 4px 20px rgba(0,0,0,0.2), 0 6px 6px rgba(0,0,0,0.12)",
                }}
              >
                {/* Distortion blur */}
                <span aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0, backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)", filter: "url(#liquid-glass-distortion)", overflow: "hidden", isolation: "isolate", borderRadius: "inherit", pointerEvents: "none" }} />
                {/* Tint */}
                <span aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 1, background: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.15)", borderRadius: "inherit", pointerEvents: "none" }} />
                {/* Shine */}
                <span aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 2, borderRadius: "inherit", pointerEvents: "none", boxShadow: isDarkMode ? "none" : "inset 2px 2px 1px rgba(255,255,255,0.5), inset -1px -1px 1px rgba(255,255,255,0.3)" }} />
                {/* Content */}
                <span className="relative flex items-center gap-2 px-6 py-3" style={{ zIndex: 3 }}>
                  Explore Features
                  <ArrowRight className="w-4 h-4 text-purple-400" />
                </span>
              </motion.button>
            </motion.div>

          </div>
        </div>
      </div>

      {/* ---- Scroll indicator ---- */}
      <div className="relative z-10 flex flex-col items-center pb-10 gap-2 transition-all duration-300">
        <span className={`text-[10px] tracking-[0.25em] uppercase font-medium transition-colors duration-300 ${isDarkMode ? "text-white/35" : "text-white/50"
          }`}>Scroll to discover</span>

        {/* Animated double-chevron arrow */}
        <div className="flex flex-col items-center gap-0.5">
          {[0, 1].map((idx) => (
            <motion.svg
              key={idx}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`w-4 h-4 transition-colors duration-300 ${isDarkMode ? "text-white/40" : "text-white/55"
                }`}
              animate={{ opacity: [0.3, 1, 0.3], y: [0, 4, 0] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: idx * 0.2,
              }}
            >
              <path d="M6 9l6 6 6-6" />
            </motion.svg>
          ))}
        </div>
      </div>

      {/* Neon dot matrix canvas */}
      <canvas ref={canvasRef} className="absolute bottom-[80px] left-0 right-0 h-[280px] pointer-events-none z-10" />

      {/* SVG curved bottom separator */}
      <div
        className="absolute bottom-[-1px] left-0 w-full -z-10 pointer-events-none"
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          willChange: 'transform'
        }}
      >
        <svg viewBox="0 0 1440 160" className="w-full h-[50px] md:h-[70px]" style={{ display: 'block' }} preserveAspectRatio="none">
          <defs>
            <linearGradient id="neon-glow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="35%" stopColor="#a855f7" />
              <stop offset="65%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <filter id="neon-filter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Solid fill below curve (matches the trust bar and next section exactly) */}
          <path
            d="M0,30 C360,130 1080,130 1440,30 L1440,160 L0,160 Z"
            fill={isDarkMode ? '#111827' : '#F7F8FC'}
          />
          {/* Glowing neon stroke */}
          <path
            d="M0,30 C360,130 1080,130 1440,30"
            fill="none"
            stroke="url(#neon-glow-grad)"
            strokeWidth="4"
            filter="url(#neon-filter)"
            opacity="0.9"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
