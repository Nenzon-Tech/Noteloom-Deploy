import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Shield, Users, Mail, Phone, Calendar } from "lucide-react";
import { useTheme } from "@/context/ThemeContext.jsx";
import { useErrorPopup } from "@/context/ErrorPopupContext.jsx";
import FAQItem from "@/components/features/landing/FAQItem.jsx";

const ContactSection = () => {
  const { isDarkMode } = useTheme();
  const { triggerPopup } = useErrorPopup();

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleContactSubmit = (e) => {
    e.preventDefault();
    console.log("Contact form submitted:", contactForm);
    triggerPopup("Thank you for your interest! The contact messaging service is under maintenance. We will reach out to you shortly.", "success", 6000);
    setContactForm({ name: "", email: "", subject: "", message: "" });
  };

  const scrollContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const scrollItemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const formVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const benefitChips = [
    { Icon: Sparkles, glow: "rgba(99,102,241,0.30)",  accent: "text-indigo-400",  label: "⚡ Fast Setup",    sub: "Deploy quickly" },
    { Icon: Users,    glow: "rgba(168,85,247,0.30)",  accent: "text-purple-400",  label: "👥 Role Access",   sub: "Built for all users" },
    { Icon: Shield,   glow: "rgba(16,185,129,0.30)",  accent: "text-emerald-400", label: "🔒 Secure Deploy", sub: "Enterprise-grade" },
  ];

  const trustPills = [
    { text: "24–48h response", accent: "text-indigo-400",  glow: "rgba(99,102,241,0.18)" },
    { text: "Campus ready",    accent: "text-emerald-400", glow: "rgba(16,185,129,0.18)" },
    { text: "Admin friendly",  accent: "text-purple-400",  glow: "rgba(168,85,247,0.18)" },
  ];

  const socialProofTags = [
    { label: "⚡ Fast Setup",       bg: isDarkMode ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.06)",  border: isDarkMode ? "rgba(99,102,241,0.35)" : "rgba(99,102,241,0.20)",   text: isDarkMode ? "text-indigo-300" : "text-indigo-600" },
    { label: "✨ AI Notes",          bg: isDarkMode ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.06)",  border: isDarkMode ? "rgba(59,130,246,0.35)" : "rgba(59,130,246,0.20)",   text: isDarkMode ? "text-blue-300" : "text-blue-600" },
    { label: "🔒 Secure Platform",  bg: isDarkMode ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.06)",  border: isDarkMode ? "rgba(16,185,129,0.35)" : "rgba(16,185,129,0.20)",   text: isDarkMode ? "text-emerald-300" : "text-emerald-600" },
    { label: "👥 Role Based",        bg: isDarkMode ? "rgba(168,85,247,0.15)" : "rgba(168,85,247,0.06)",  border: isDarkMode ? "rgba(168,85,247,0.35)" : "rgba(16,185,129,0.20)",   text: isDarkMode ? "text-purple-300" : "text-purple-600" },
  ];

  return (
    <motion.section
      className="relative py-20 overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      {/* --- Smooth Background Crossfade Layers --- */}
      <div 
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isDarkMode ? 'opacity-100' : 'opacity-0'}`} 
        style={{ background: "linear-gradient(135deg, #0a0818 0%, #130d2e 40%, #0d1220 70%, #0a0818 100%)" }} 
      />
      <div 
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${!isDarkMode ? 'opacity-100' : 'opacity-0'}`} 
        style={{ background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 40%, #f1f5f9 70%, #f8fafc 100%)" }} 
      />

      {/* Ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{ x: [0, 60, -30, 0], y: [0, -40, 50, 0], scale: [1, 1.1, 0.9, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[5%] left-[5%] w-[480px] h-[480px] rounded-full"
          style={{ 
            background: isDarkMode 
              ? "radial-gradient(circle, rgba(99,102,241,0.28) 0%, transparent 70%)" 
              : "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)", 
            filter: "blur(70px)",
            transition: "background 0.7s ease" 
          }}
        />
        <motion.div
          animate={{ x: [0, -80, 40, 0], y: [0, 60, -40, 0], scale: [1, 1.15, 0.88, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[0%] right-[5%] w-[520px] h-[520px] rounded-full"
          style={{ 
            background: isDarkMode 
              ? "radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)" 
              : "radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)", 
            filter: "blur(80px)",
            transition: "background 0.7s ease" 
          }}
        />
        <motion.div
          animate={{ x: [0, 40, -20, 0], y: [0, -30, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[40%] left-[40%] w-[300px] h-[300px] rounded-full"
          style={{ 
            background: isDarkMode 
              ? "radial-gradient(circle, rgba(236,72,153,0.18) 0%, transparent 70%)" 
              : "radial-gradient(circle, rgba(236,72,153,0.05) 0%, transparent 70%)", 
            filter: "blur(60px)",
            transition: "background 0.7s ease" 
          }}
        />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: isDarkMode
            ? "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)"
            : "linear-gradient(rgba(0,0,0,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 85%)",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 85%)",
          transition: "background-image 0.7s ease"
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start" variants={scrollContainerVariants}>

          {/* LEFT: Text Content */}
          <motion.div className="flex flex-col gap-10 lg:pr-8" variants={scrollContainerVariants}>

            {/* Header */}
            <div className="space-y-4">
              <motion.p
                className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 transition-colors duration-700"
                variants={scrollItemVariants}
              >
                Get in touch
              </motion.p>
              <motion.h2
                className={`text-4xl md:text-[2.75rem] font-extrabold tracking-tight leading-tight transition-colors duration-700 ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
                variants={scrollItemVariants}
              >
                Ready to transform your campus?
              </motion.h2>
              <motion.p className={`text-lg leading-relaxed font-medium transition-colors duration-700 ${
                isDarkMode ? "text-white/60" : "text-slate-600"
              }`} variants={scrollItemVariants}>
                Let's build the future together – schedule a demo or ask a question.
              </motion.p>
            </div>

            {/* Benefit Mini Cards — glass */}
            <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4" variants={scrollItemVariants}>
              {benefitChips.map(({ Icon: CardIcon, glow, accent, label, sub }, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className={`relative rounded-xl border overflow-hidden transition-colors duration-700 ${
                    isDarkMode ? "border-white/15" : "border-slate-200/80 shadow-[0_4px_12px_rgba(0,0,0,0.015)]"
                  }`}
                  style={{
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                  }}
                >
                  <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0, background: isDarkMode ? "rgba(15,12,35,0.55)" : "rgba(255,255,255,0.72)", borderRadius: "inherit", pointerEvents: "none", transition: "background 0.7s ease" }} />
                  <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0, borderRadius: "inherit", pointerEvents: "none", boxShadow: isDarkMode ? "inset 1.5px 1.5px 0px rgba(255,255,255,0.40), inset -1px -1px 0px rgba(255,255,255,0.12)" : "inset 1px 1px 0px rgba(255,255,255,0.8)", transition: "box-shadow 0.7s ease" }} />
                  <div className="relative z-10 p-4 flex flex-col gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: glow }}>
                      <CardIcon className={`w-4 h-4 ${accent}`} />
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm transition-colors duration-700 ${isDarkMode ? "text-white" : "text-slate-900"}`}>{label}</h4>
                      <p className={`text-[11px] mt-0.5 transition-colors duration-700 ${isDarkMode ? "text-white/50" : "text-slate-500"}`}>{sub}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Trust pills — glass */}
            <motion.div className="flex flex-wrap gap-2.5" variants={scrollItemVariants}>
              {trustPills.map(({ text, accent, glow }, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors duration-700 ${
                    isDarkMode ? "border-white/15 text-white/75" : "border-slate-200/80 text-slate-700 shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
                  }`}
                  style={{
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    background: isDarkMode ? "rgba(15,12,35,0.45)" : "rgba(255,255,255,0.72)",
                    boxShadow: isDarkMode ? "inset 1px 1px 0px rgba(255,255,255,0.25)" : "inset 1px 1px 0px rgba(255,255,255,0.8)",
                    transition: "background 0.7s ease, box-shadow 0.7s ease"
                  }}
                >
                  <span className={`font-bold ${accent}`}>✓</span> {text}
                </span>
              ))}
            </motion.div>

            {/* FAQs */}
            <motion.div className="space-y-1.5" variants={scrollItemVariants}>
              <FAQItem question="How long does setup take?" answer="Typically under an hour, depending on your existing infrastructure." />
              <FAQItem question="Can different user roles be configured?" answer="Yes – you can define custom roles and permissions from the admin panel." />
              <FAQItem question="Can this be deployed on our own domain?" answer="Absolutely – we support custom domains and white‑label branding." />
            </motion.div>
          </motion.div>

          {/* RIGHT: Liquid Glass Form Card */}
          <motion.div className="flex justify-center lg:justify-end z-10 w-full" variants={scrollItemVariants}>
            {/* Outer glass shell */}
            <div
              className={`w-full max-w-[450px] relative rounded-[28px] border overflow-hidden transition-colors duration-700`}
              style={{
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: isDarkMode ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(226,232,240,0.8)",
                boxShadow: isDarkMode 
                  ? "0 8px 48px rgba(0,0,0,0.45), inset 1.5px 1.5px 0px rgba(255,255,255,0.45), inset -1px -1px 0px rgba(255,255,255,0.15)"
                  : "0 8px 30px rgba(0,0,0,0.05), inset 1px 1px 0px rgba(255,255,255,0.9)",
                transition: "border 0.7s ease, box-shadow 0.7s ease"
              }}
            >
              {/* Tint layer */}
              <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0, background: isDarkMode ? "rgba(15,12,35,0.65)" : "rgba(255,255,255,0.82)", borderRadius: "inherit", pointerEvents: "none", transition: "background 0.7s ease" }} />

              <motion.form
                onSubmit={handleContactSubmit}
                variants={formVariants}
                className="relative z-10 p-6 sm:p-8"
              >
                <motion.h3 className={`text-xl font-bold mb-1 tracking-tight transition-colors duration-700 ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`} variants={scrollItemVariants}>
                  Tell us about your institution
                </motion.h3>
                <motion.p className={`text-xs mb-6 font-medium transition-colors duration-700 ${
                  isDarkMode ? "text-white/45" : "text-slate-500"
                }`} variants={scrollItemVariants}>
                  We'll get back to you within 24‑48 hours.
                </motion.p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 transition-colors duration-700 ${isDarkMode ? "text-white/65" : "text-slate-700"}`}>Full Name</label>
                    <input type="text" required value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all duration-700 ${
                        isDarkMode 
                          ? "border-white/15 bg-white/[0.07] text-white placeholder-white/30 focus:border-indigo-400/50 focus:bg-white/[0.12]" 
                          : "border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-indigo-500/50 focus:bg-white"
                      }`}
                      placeholder="Your full name" />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 transition-colors duration-700 ${isDarkMode ? "text-white/65" : "text-slate-700"}`}>Email Address</label>
                    <input type="email" required value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all duration-700 ${
                        isDarkMode 
                          ? "border-white/15 bg-white/[0.07] text-white placeholder-white/30 focus:border-indigo-400/50 focus:bg-white/[0.12]" 
                          : "border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-indigo-500/50 focus:bg-white"
                      }`}
                      placeholder="you@example.edu" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className={`block text-xs font-semibold mb-1.5 transition-colors duration-700 ${isDarkMode ? "text-white/65" : "text-slate-700"}`}>Subject</label>
                  <input type="text" required value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all duration-700 ${
                      isDarkMode 
                        ? "border-white/15 bg-white/[0.07] text-white placeholder-white/30 focus:border-indigo-400/50 focus:bg-white/[0.12]" 
                        : "border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-indigo-500/50 focus:bg-white"
                    }`}
                    placeholder="Brief subject" />
                </div>
                <div className="mb-6">
                  <label className={`block text-xs font-semibold mb-1.5 transition-colors duration-700 ${isDarkMode ? "text-white/65" : "text-slate-700"}`}>Message</label>
                  <textarea required rows={4} value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none transition-all duration-700 ${
                      isDarkMode 
                        ? "border-white/15 bg-white/[0.07] text-white placeholder-white/30 focus:border-indigo-400/50 focus:bg-white/[0.12]" 
                        : "border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:border-indigo-500/50 focus:bg-white"
                    }`}
                    placeholder="How can we help your campus?" />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3 rounded-xl font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-900/40">
                  Send Message
                </button>
                <div className="flex justify-center space-x-6 mt-4 text-xs">
                  <a href="mailto:noreply.noteloom@gmail.com" className={`flex items-center space-x-1 transition-colors duration-700 ${isDarkMode ? "text-white/35 hover:text-white/70" : "text-slate-400 hover:text-slate-600"}`}><Mail className="w-3.5 h-3.5" /><span>Email</span></a>
                  <a href="tel:+916297432182" className={`flex items-center space-x-1 transition-colors duration-700 ${isDarkMode ? "text-white/35 hover:text-white/70" : "text-slate-400 hover:text-slate-600"}`}><Phone className="w-3.5 h-3.5" /><span>Call</span></a>
                  {/* <a href="/request-demo" className={`flex items-center space-x-1 transition-colors duration-700 ${isDarkMode ? "text-white/35 hover:text-white/70" : "text-slate-400 hover:text-slate-600"}`}><Calendar className="w-3.5 h-3.5" /><span>Schedule demo</span></a> */}
                </div>

                {/* Social proof pills */}
                <div className="mt-5 pt-4 border-t border-white/10 transition-colors duration-700">
                  <p className={`text-[10px] font-semibold tracking-wider text-center uppercase mb-3 transition-colors duration-700 ${isDarkMode ? "text-white/25" : "text-slate-400"}`}>
                    Trusted by students and institutions
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {socialProofTags.map(({ label, bg, border, text }, i) => (
                      <span key={i} className={`text-[9px] font-semibold px-2 py-0.5 rounded transition-colors duration-700 ${text}`} style={{ background: bg, border: `1px solid ${border}`, transition: "background 0.7s ease, border-color 0.7s ease" }}>
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.form>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </motion.section>
  );
};

export default ContactSection;