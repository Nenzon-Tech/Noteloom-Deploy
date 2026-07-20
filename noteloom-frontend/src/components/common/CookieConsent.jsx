import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Settings, ShieldCheck, Check, X, Shield, Clock, HelpCircle, Info, ArrowRight } from 'lucide-react';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  
  // States for cookie categories
  const [preferencesConsent, setPreferencesConsent] = useState(true);

  useEffect(() => {
    // Check if consent choice is already saved
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Delay showing the banner for a smoother entry animation
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookieConsent', 'accepted-all');
    localStorage.setItem('preferencesConsent', 'true');
    setIsVisible(false);
  };

  const handleNecessaryOnly = () => {
    localStorage.setItem('cookieConsent', 'essential-only');
    localStorage.setItem('preferencesConsent', 'false');
    setIsVisible(false);
  };

  const handleSaveCustomSettings = () => {
    localStorage.setItem('cookieConsent', preferencesConsent ? 'accepted-all' : 'essential-only');
    localStorage.setItem('preferencesConsent', preferencesConsent ? 'true' : 'false');
    setIsVisible(false);
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: 50, x: 50, opacity: 0 }}
            animate={{ y: 0, x: 0, opacity: 1 }}
            exit={{ y: 50, x: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="fixed bottom-6 right-6 z-50 w-[calc(100%-3rem)] sm:w-[420px] p-6 rounded-2xl border border-slate-200/20 bg-slate-900/95 text-white shadow-2xl backdrop-blur-xl"
          >
            <div className="space-y-5">
              {/* Header / Info Text */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl">
                    <Cookie className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight">We respect your privacy</h3>
                </div>
                
                <p className="text-sm text-slate-300 leading-relaxed">
                  Note Loom uses cookies to keep you securely logged in, remember your theme preference, and optimize your overall learning dashboard experience. You can choose which non-essential cookies you allow. 
                  Read our full{' '}
                  <button 
                    onClick={() => setShowPolicy(true)}
                    className="font-medium text-purple-400 underline decoration-purple-400/50 hover:text-purple-300 hover:decoration-purple-300 transition-colors focus:outline-none"
                  >
                    Cookie Policy
                  </button>.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2.5">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAcceptAll}
                  className="w-full py-2.5 text-sm font-bold bg-gradient-to-r from-[#6E72FF] to-[#A855F7] hover:brightness-110 active:scale-95 text-white rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>Accept All</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
                
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={handleNecessaryOnly}
                    className="w-full py-2.5 text-sm font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-xl transition-all duration-200 text-center"
                  >
                    Essential Only
                  </button>

                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="w-full py-2.5 text-sm font-semibold border border-slate-700 hover:border-slate-500 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 hover:bg-slate-800 text-center"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Customize</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Settings Customization Sub-Panel */}
            {showDetails && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-5 pt-5 border-t border-slate-800 space-y-4 overflow-hidden"
              >
                <div className="space-y-3">
                  
                  {/* Strictly Necessary Category */}
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/50 flex items-start gap-3">
                    <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-xs">Strictly Necessary</h4>
                        <span className="text-[9px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Required</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                        Required for basic functions like logging in and securing the system.
                      </p>
                    </div>
                  </div>

                  {/* Preference / Functionality Category */}
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/50 flex items-start gap-3 hover:border-slate-700 transition-all duration-200">
                    <input
                      id="pref-cookie"
                      type="checkbox"
                      checked={preferencesConsent}
                      onChange={(e) => setPreferencesConsent(e.target.checked)}
                      className="mt-1.5 w-3.5 h-3.5 text-purple-600 bg-slate-800 border-slate-700 rounded focus:ring-purple-500 focus:ring-offset-slate-900 cursor-pointer"
                    />
                    <div className="cursor-pointer" onClick={() => setPreferencesConsent(!preferencesConsent)}>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-xs">Preferences & Theme</h4>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Optional</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                        Remembers theme styles and selected colleges across login sessions.
                      </p>
                    </div>
                  </div>

                </div>

                {/* Settings Action Button */}
                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleSaveCustomSettings}
                    className="w-full sm:w-auto px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-600/20 transition-all duration-200 text-center"
                  >
                    Save My Preferences
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL COOKIE POLICY DETAILED MODAL */}
      <AnimatePresence>
        {showPolicy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col rounded-2xl border border-slate-800 bg-slate-900 text-white shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/30">
                <div className="flex items-center space-x-3 text-purple-400">
                  <Shield className="w-6 h-6" />
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-white">Note Loom Cookie Policy</h2>
                    <p className="text-[10px] text-slate-400">Document Ref: NL-LEGAL-COOKIE-2026-001  •  v1.0</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPolicy(false)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Document Content */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed custom-scrollbar">
                <div className="space-y-2">
                  <p className="text-xs text-slate-400 font-semibold">Effective Date: July 4, 2026</p>
                  <p>
                    Note Loom ("we", "us", or "our") uses cookies and similar technologies on the Note Loom platform. This Cookie Policy explains how cookies are used, their purposes, and how you can manage your preferences in compliance with global data protection laws, including the **EU GDPR**, **India DPDPA 2023**, and the **California Consumer Privacy Act (CCPA)**.
                  </p>
                </div>

                {/* Section 1 */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-white flex items-center gap-2 text-base">
                    <HelpCircle className="w-4 h-4 text-purple-400" />
                    <span>1. What Are Cookies & Local Storage?</span>
                  </h3>
                  <p>
                    Cookies are small text files stored on your browser or device by web servers. They allow platforms to remember your login session, prevent security threats (such as CSRF), and store non-sensitive configuration parameters.
                  </p>
                  <p>
                    We use **First-Party Cookies** (cookies set directly by Note Loom) configured with high-security flags to ensure that unauthorized third-party scripts cannot read your private token credentials.
                  </p>
                </div>

                {/* Section 2 */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-white flex items-center gap-2 text-base">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span>2. Legal Basis & Compliance</span>
                  </h3>
                  <p>
                    Under applicable data protection frameworks, we process cookies under two distinct legal foundations:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 pl-2">
                    <li><strong className="text-slate-300">Contract Execution (Strictly Necessary):</strong> The cookies classified as "Required" are set to deliver the core service you actively request (identifying your user account on login). Consent is not legally required for these, but transparency is mandatory.</li>
                    <li><strong className="text-slate-300">Explicit Consent (Preferences):</strong> Functionality cookies (like themes and college code presets) are optional and will only be activated if you explicitly accept them.</li>
                  </ul>
                </div>

                {/* Section 3 */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-white flex items-center gap-2 text-base">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span>3. Cookie Lifetimes & Browser Control</span>
                  </h3>
                  <p>
                    Required session tokens automatically self-invalidate after 24 hours of inactivity. You can clear, block, or delete cookies at any time directly through your web browser's privacy settings. Note that disabling necessary cookies will prevent you from logging into your college dashboard account.
                  </p>
                </div>

                {/* Section 4 */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-white flex items-center gap-2 text-base">
                    <Info className="w-4 h-4 text-purple-400" />
                    <span>4. Contact & Support</span>
                  </h3>
                  <p>
                    If you have any questions or concerns regarding Note Loom's cookie security policies or data storage practices, please reach out to our support team at:
                  </p>
                  <p className="font-semibold text-white pl-4">
                    Email: support@noteloom.in  
                  </p>
                </div>
              </div>

              <div className="flex justify-end p-6 border-t border-slate-800 bg-slate-950/40">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPolicy(false)}
                  className="px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-[#6E72FF] to-[#A855F7] hover:brightness-110 active:scale-95 text-white rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 transition-all duration-200 flex items-center gap-2"
                >
                  <span>Understood</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CookieConsent;
