import { API_BASE } from '@/utils/config';
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Mail, Lock } from "lucide-react";
import { useTheme } from "@/context/ThemeContext.jsx";
import GlassHeader from "@/components/common/GlassHeader.jsx";
import ThemeToggle from "@/components/common/ThemeToggle.jsx";
import Footer from "@/components/common/Footer.jsx";

// Define API_BASE locally or import it from a config file if you have one


const ITLoginPage = () => {
  const { isDarkMode } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // FIXED: Connect to real MongoDB backend instead of mock
      const response = await fetch(`${API_BASE}/it-admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("IT Login successful", data);

        // Store IT session token and login time
        localStorage.setItem('itSessionToken', data.sessionToken);
        localStorage.setItem('itLoginTime', new Date().toISOString());
        
        navigate("/it-admin");
      } else {
        throw new Error(data.error || 'IT Login failed');
      }
    } catch (error) {
      console.error("IT Authentication error:", error);
      alert(error.message || "An error occurred during IT authentication");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Glass Header - FIXED: Light mode header = footer color */}
      <GlassHeader>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate('/')}
                className={`p-1 rounded-md transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-300'
                }`}
              >
                <ArrowLeft className={`w-4 h-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
              </button>
              {/* FIXED: Only "Note Loom" text, no book icon */}
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">Note Loom</span>
              <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-red-400/70 to-red-600/70 text-white border border-red-500/70">
                IT Portal
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </GlassHeader>

      {/* Login Form */}
      <div className="flex items-center justify-center min-h-screen pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`max-w-md w-full space-y-8 p-8 rounded-xl shadow-2xl backdrop-blur-md border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-800/70 border-gray-700/50' 
              : 'bg-white/70 border-gray-200/50'
          }`}
        >
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>IT Portal Access</h2>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Administrative Login</p>
            <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">Test Accounts:</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">Admin: admin@noteloom.in / admin123</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">Manager: manager@noteloom.in / admin123</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Email</label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700/70 backdrop-blur-sm border-gray-600 text-white' 
                      : 'bg-white/70 backdrop-blur-sm border-gray-300 text-gray-900'
                  }`}
                  placeholder="Enter your IT email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Password</label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700/70 backdrop-blur-sm border-gray-600 text-white' 
                      : 'bg-white/70 backdrop-blur-sm border-gray-300 text-gray-900'
                  }`}
                  placeholder="Enter your password"
                  minLength={6}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : 'Access IT Portal'}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => navigate('/')}
              className={`transition-colors ${
                isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Back to Main Site
            </button>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ITLoginPage;