import React from "react";
import { motion } from "framer-motion";

const FeatureCard = ({ Icon, title, description, linkText, linkIcon: LinkIcon, isDarkMode }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`relative p-6 rounded-2xl border transition-all duration-300 ${
        isDarkMode 
          ? "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]" 
          : "border-slate-200 bg-white hover:shadow-xl hover:shadow-indigo-500/10"
      }`}
    >
      <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${
        isDarkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-50 text-indigo-600"
      }`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
        {title}
      </h3>
      <p className={`text-sm mb-4 leading-relaxed ${isDarkMode ? "text-white/60" : "text-slate-600"}`}>
        {description}
      </p>
      <button className={`flex items-center gap-1.5 text-sm font-semibold ${
        isDarkMode ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-500"
      }`}>
        {linkText}
        <LinkIcon className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export default FeatureCard;