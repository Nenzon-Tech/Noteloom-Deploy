import { API_BASE } from '@/utils/config';
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Search, MapPin, Star, School } from "lucide-react";
import { useTheme } from "@/context/ThemeContext.jsx";
import GlassHeader from "@/components/common/GlassHeader.jsx";
import ThemeToggle from "@/components/common/ThemeToggle.jsx";
import Footer from "@/components/common/Footer.jsx";
import LogoWithFallback from "@/components/common/LogoWithFallback.jsx"; 

// Define API_BASE (Ensure this matches your backend URL)


const CollegeSelection = ({ navigate }) => {
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  // RESTORED: Hardcoded list to ensure colleges like IEM appear immediately
  const [colleges, setColleges] = useState([]);

useEffect(() => {
  const fetchColleges = async () => {
  try {
    setLoading(true);
    // Fetches from the dedicated public endpoint
    const response = await fetch(`${API_BASE}/it-auth/public/colleges`);
    
    if (response.ok) {
      const data = await response.json();
      
      // Map backend Tenant fields to your Card component requirements
      const formattedData = data.map(college => ({
        _id: college._id,
        name: college.name,
        // PRIORITY: Use the saved location from DB; fallback only if empty
        location: college.location || "Location Not Set", 
        category: college.category || (college.type === 'college' ? 'Engineering' : 'University'),
        collegeCode: college.collegeCode || "0000",
        logoUrl: college.logoUrl || "/webdata/clg-logo/Note-Loom.svg",
        // Strictly check for true to ensure the star badge persists
        featured: college.featured === true 
      }));
      
      setColleges(formattedData); 
    } else {
      console.error("Backend error:", response.status);
    }
  } catch (error) {
    console.error("Error fetching colleges:", error);
  } finally {
    setLoading(false);
  }
};

fetchColleges();
}, []);

  const alphabetFilters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

  const filteredColleges = colleges.filter(college => {
    const matchesSearch = college.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === "All" || college.name.charAt(0).toUpperCase() === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleCollegeSelect = (college) => {
  // Store basic info for immediate UI feedback if needed, but logic uses code
  localStorage.setItem('selectedCollegeLogo', college.logoUrl || '');
  localStorage.setItem('selectedCollegeCode', college.collegeCode); 
  
  // ✅ Navigate using ONLY the unique code
  navigate(`/login?code=${college.collegeCode}`);
};

  return (
    <div className={`min-h-screen transition-colors duration-500 ease-in-out ${
  isDarkMode
    ? 'bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white'
    : 'bg-[#f8fafc] text-gray-900' // Changed to Slate-50 for a professional greyish base
}`}>

      {/* Navigation */}
      <GlassHeader>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate('/')}
                className={`p-2 rounded-full transition-all duration-300 ${
                  isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-200/50'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              {/* RESTORED: BookOpen Icon & Original Fonts */}
              {/* <BookOpen className="w-8 h-8 text-purple-600" /> */}
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">Note Loom</span>
              <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-green-400/70 to-green-600/70 text-white border border-green-500/70">
                Beta
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {/* Removed Sign In Button */}
            </div>
          </div>
        </div>
      </GlassHeader>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[120px] pb-12">
        {/* Header Section with Fade In */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          {/* RESTORED: Default System Font (No Lexend) */}
          <h1 className={`text-4xl md:text-5xl font-extrabold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Select Your Institution
          </h1>
          <p className={`text-lg md:text-xl max-w-2xl mx-auto font-light ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Choose your college to access your personalized learning dashboard and connect with your peers.
          </p>
        </motion.div>

        {/* Search Bar - Modern & Floating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative mb-8 max-w-3xl mx-auto"
        >
          <div className="relative group">
            <Search className={`absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400 group-hover:text-purple-400' : 'text-gray-400 group-hover:text-purple-500'
            }`} />
            <input
  type="text"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="Search institutions..."
  className={`w-full pl-14 pr-6 py-4 rounded-full border-2 outline-none transition-all duration-300 shadow-xl ${
    isDarkMode 
      ? 'bg-gray-800/40 backdrop-blur-xl border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30'
      : 'bg-white/70 backdrop-blur-xl border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30'
  }`}
/>

          </div>
        </motion.div>

        {/* Alphabet Filters - Glassy Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-2 mb-12 px-4"
        >
          <button
            onClick={() => setSelectedFilter("All")}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
              selectedFilter === "All" 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                : isDarkMode 
                  ? 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white backdrop-blur-md border border-white/10 shadow-sm' 
                  : 'bg-white/40 text-gray-600 hover:bg-white/70 hover:text-purple-600 backdrop-blur-md border border-white/40 shadow-sm'
            }`}
          >
            All
          </button>
          {alphabetFilters.map(letter => (
            <button
              key={letter}
              onClick={() => setSelectedFilter(letter)}
              className={`w-8 h-8 rounded-full text-xs font-bold transition-all duration-300 flex items-center justify-center ${
                selectedFilter === letter 
                  ? 'bg-purple-600 text-white shadow-md scale-110' 
                  : isDarkMode 
                    ? 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 backdrop-blur-md border border-white/5' 
                    : 'bg-white/40 text-gray-500 hover:text-purple-600 hover:bg-white/70 backdrop-blur-md border border-white/40'
              }`}
            >
              {letter}
            </button>
          ))}
        </motion.div>

        {/* College Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
{filteredColleges.map((college, index) => (
  <motion.div
  key={college._id || college.name}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.05, duration: 0.5 }}
  onClick={() => handleCollegeSelect(college)}
  className={`group relative rounded-3xl p-6 cursor-pointer
    transition-all duration-500 ease-out border shadow-sm
    hover:-translate-y-2 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)]
    ${
      isDarkMode
        ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.07] hover:shadow-[0_30px_60px_-15px_rgba(124,58,237,0.45)]'
        : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-white' 
        // Light mode: Solid white card with slate-200 border for high contrast
    }`}
>
    {/* Featured Star Badge */}
    {college.featured && (
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white p-1.5 rounded-full shadow-lg">
          <Star className="w-3.5 h-3.5 fill-current" />
        </div>
      </div>
    )}
    
    <div className="flex items-center space-x-4 mb-4">
      <LogoWithFallback 
        collegeLogoUrl={college.logoUrl}
        collegeName={college.name}
        className={`w-16 h-16 rounded-xl object-contain p-1 ${isDarkMode ? 'bg-gray-700/50' : 'bg-white shadow-sm'}`}
      />
      
      <div className="flex flex-col gap-1">
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit ${
          isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
        }`}>
          {college.category}
        </span>
        <span className={`text-[10px] font-mono font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          CODE: {college.collegeCode}
        </span>
      </div>
    </div>
    
    <h3 className={`text-lg font-bold mb-2 line-clamp-2 leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {college.name}
    </h3>
    
    <div className={`flex items-center text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
      <MapPin className="w-3.5 h-3.5 mr-1.5 opacity-70" />
      <span className="truncate">{college.location}</span>
    </div>
    
    <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all active:scale-95">
      Select Campus
    </button>
  </motion.div>
))}
        </motion.div>

        {filteredColleges.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <School className={`w-20 h-20 mx-auto mb-6 opacity-30 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <h3 className="text-2xl font-bold mb-2">No colleges found</h3>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              We couldn't find any institution matching.
            </p>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CollegeSelection;