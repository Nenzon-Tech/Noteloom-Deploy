import { API_BASE } from '@/utils/config';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useITSessionManager } from '@/hooks/useITSessionManager.js';
import GlassHeader from '@/components/common/GlassHeader.jsx';
import ITDashboardFooter from '@/components/features/dashboard/ITDashboardFooter.jsx';
import CollegeBannerLogo from '@/components/common/CollegeBannerLogo.jsx';
import ThemeToggle from '@/components/common/ThemeToggle.jsx';

// Define API_BASE or import it from your config


const AddEditContentPage = () => {
  const { isDarkMode } = useTheme();
  const { itUser, isSessionValid, checkITSession } = useITSessionManager();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get editing content from location state
  const editingContent = location.state?.editingContent || null;
  const isEditing = !!editingContent;
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'course',
    content: '',
    description: '',
    difficulty: 'beginner',
    tags: '',
    isActive: true
  });
  
  const [loading, setLoading] = useState(false);
  const [sessionChecking, setSessionChecking] = useState(true);

  // FIXED: Check IT session on component mount to prevent logout
  useEffect(() => {
    const verifySession = async () => {
      setSessionChecking(true);
      const sessionValid = await checkITSession();
      
      if (!sessionValid) {
        alert('Your IT session has expired. Please login again.');
        navigate('/it-login');
        return;
      }
      
      setSessionChecking(false);
    };

    verifySession();
  }, [checkITSession, navigate]);

  // Initialize form data
  useEffect(() => {
    if (editingContent && !sessionChecking) {
      setFormData({
        title: editingContent.title || '',
        type: editingContent.type || 'course',
        content: editingContent.content || '',
        description: editingContent.description || '',
        difficulty: editingContent.difficulty || 'beginner',
        tags: editingContent.tags ? editingContent.tags.join(', ') : '',
        isActive: editingContent.isActive !== undefined ? editingContent.isActive : true
      });
    }
  }, [editingContent, sessionChecking]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // FIXED: Double-check session before submitting
    const sessionValid = await checkITSession();
    if (!sessionValid) {
      alert('Your IT session has expired. Please login again.');
      navigate('/it-login');
      return;
    }

    setLoading(true);
    
    try {
      const url = editingContent 
        ? `${API_BASE}/it-admin/individual-content/${editingContent._id}`
        : `${API_BASE}/it-admin/individual-content`;
      
      const dataToSave = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      };
      
      const response = await fetch(url, {
        method: editingContent ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('itSessionToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      });
      
      if (response.ok) {
        alert(`Content ${editingContent ? 'updated' : 'created'} successfully!`);
        navigate('/it-admin');
      } else {
        const data = await response.json();
        alert(data.error || 'Error saving content');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error saving content');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
      navigate('/it-admin');
    }
  };

  // FIXED: Show loading while checking session
  if (sessionChecking) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
          <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>Verifying IT session...</p>
        </div>
      </div>
    );
  }

  // FIXED: Redirect if session invalid
  if (!isSessionValid) {
    // This should usually be handled by the useEffect redirect, 
    // but acts as a safeguard during render
    return null;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <GlassHeader isDarker={true}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/it-admin')}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-300'
                }`}
              >
                <ArrowLeft className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
              </button>
              
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium text-white ${
                    itUser?.role === 'noteloom_admin' ? 'bg-red-600' : 'bg-orange-600'
                  }`}>
                    <Shield className="w-4 h-4 mr-2" />
                    {itUser?.role === 'noteloom_admin' ? 'Note Loom Admin' : 'Note Loom Manager'}
                  </span>
                </div>
                
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {isEditing ? 'Edit Content' : 'Add New Content'}
                  </span>
                  <span className="mx-2">•</span>
                  <span>Individual Student Content</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <CollegeBannerLogo className={isDarkMode ? "text-white" : "text-gray-900"} />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </GlassHeader>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg shadow-2xl backdrop-blur-md border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-800/90 border-gray-700/50' 
              : 'bg-white/90 border-gray-200/50'
          }`}
        >
          <div className="p-8">
            {/* Page Title */}
            <div className="mb-8">
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {isEditing ? 'Edit Content' : 'Create New Content'}
              </h1>
              <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {isEditing 
                  ? 'Update the learning content for individual students'
                  : 'Create new learning content for individual students'
                }
              </p>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Title */}
              <div>
                <label className={`block text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className={`w-full px-4 py-4 text-lg border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Enter a compelling title for your content"
                />
              </div>

              {/* Type and Difficulty Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className={`block text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Content Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className={`w-full px-4 py-4 text-lg border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700/50 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="course">📚 Course</option>
                    <option value="assignment">📝 Assignment</option>
                    <option value="announcement">📢 Announcement</option>
                    <option value="resource">📁 Resource</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                    className={`w-full px-4 py-4 text-lg border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700/50 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="beginner">🟢 Beginner</option>
                    <option value="intermediate">🟡 Intermediate</option>
                    <option value="advanced">🔴 Advanced</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={`block text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className={`w-full px-4 py-4 text-lg border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Provide a brief description of what students will learn"
                />
              </div>

              {/* Main Content */}
              <div>
                <label className={`block text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Main Content *
                </label>
                <textarea
                  rows={12}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className={`w-full px-4 py-4 text-lg border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder={`Enter the detailed content that students will see. You can include:

• Learning objectives
• Step-by-step instructions
• Examples and code snippets
• Resources and links
• Practice exercises`}
                />
                <div className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  💡 Tip: Use clear formatting and break content into sections for better readability
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className={`block text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className={`w-full px-4 py-4 text-lg border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="e.g. programming, python, beginner, tutorial, web development"
                />
                <div className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  🏷️ Tags help students find relevant content more easily
                </div>
              </div>

              {/* Active Status */}
              <div className={`p-6 rounded-xl border-2 border-dashed transition-all ${
                formData.isActive 
                  ? (isDarkMode ? 'border-green-500/50 bg-green-900/10' : 'border-green-400/50 bg-green-50')
                  : (isDarkMode ? 'border-gray-600/50 bg-gray-800/10' : 'border-gray-300/50 bg-gray-50')
              }`}>
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <div>
                    <label htmlFor="isActive" className={`text-lg font-medium cursor-pointer ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formData.isActive ? '✅ Active' : '❌ Inactive'} - Visible to Students
                    </label>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formData.isActive 
                        ? 'Students can see and interact with this content'
                        : 'This content is hidden from students and can be activated later'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-8 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed shadow-lg"
                >
                  {loading 
                    ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                      </div>
                    )
                    : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>{isEditing ? '💾 Update Content' : '✨ Create Content'}</span>
                      </div>
                    )
                  }
                </button>
                
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className={`flex-1 py-4 px-8 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  🚫 Cancel
                </button>
              </div>

              {/* Help Text */}
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                  💡 <strong>Pro Tips:</strong> Use clear headings, bullet points, and examples. 
                  Content with good structure gets better engagement from students!
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <ITDashboardFooter />
    </div>
  );
};

export default AddEditContentPage;