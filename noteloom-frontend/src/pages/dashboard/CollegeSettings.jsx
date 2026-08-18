import { API_BASE } from '@/utils/config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Building, Image, Upload, Save, CheckCircle2, 
  AlertCircle, ShieldCheck, RefreshCcw, Link2, Eye
} from 'lucide-react';

import { useTheme } from '@/context/ThemeContext.jsx';
import { useSessionManager } from '@/hooks/useSessionManager.js';
import GlassHeader from '@/components/common/GlassHeader.jsx';
import CollegeBannerLogo from '@/components/common/CollegeBannerLogo.jsx';
import ThemeToggle from '@/components/common/ThemeToggle.jsx';
import UserProfileDropdown from '@/components/common/UserProfileDropdown.jsx';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const CollegeSettings = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { user } = useSessionManager();

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [collegeName, setCollegeName] = useState('');
  const [collegeCode, setCollegeCode] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [inputMode, setInputMode] = useState('upload'); // 'upload' or 'url'

  const [message, setMessage] = useState({ type: '', text: '' });

  // --- FETCH INITIAL SETTINGS ---
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('sessionToken');
      const res = await fetch(`${API_BASE}/api/college-admin/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setCollegeName(data.name || '');
        setCollegeCode(data.collegeCode || '');
        setLogoUrl(data.logoUrl || '');
        setLogoPreview(data.logoUrl || '');
      } else {
        const errData = await res.json();
        setMessage({ type: 'error', text: errData.error || 'Failed to load college settings' });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Network error loading college settings' });
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLE LOGO FILE CHANGE ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Security check on client
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Invalid file format. Only JPG, PNG, and WEBP image files are allowed.' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setMessage({ type: 'error', text: 'File size exceeds 2MB limit.' });
      return;
    }

    setLogoFile(file);
    setMessage({ type: '', text: '' });

    // Generate local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // --- HANDLE SUBMIT (GLOBAL UPDATE) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!collegeName.trim()) {
      setMessage({ type: 'error', text: 'College name cannot be empty.' });
      return;
    }

    if (collegeName.trim().length < 3 || collegeName.trim().length > 100) {
      setMessage({ type: 'error', text: 'College name must be between 3 and 100 characters.' });
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('sessionToken');

      let response;

      if (inputMode === 'upload' && logoFile) {
        // Multipart Form Data for File Upload
        const formData = new FormData();
        formData.append('name', collegeName.trim());
        formData.append('logo', logoFile);

        response = await fetch(`${API_BASE}/api/college-admin/settings`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
      } else {
        // JSON Payload for text URL / Name
        response = await fetch(`${API_BASE}/api/college-admin/settings`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: collegeName.trim(),
            logoUrl: inputMode === 'url' ? logoUrl.trim() : undefined
          })
        });
      }

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: result.message || 'College settings updated globally!' });
        setLogoFile(null);
        if (result.tenant) {
          setCollegeName(result.tenant.name);
          if (result.tenant.logoUrl) {
            setLogoUrl(result.tenant.logoUrl);
            setLogoPreview(result.tenant.logoUrl);
          }

          // 🔄 GLOBAL FRONTEND PROPAGATION: Update localStorage branding
          // so headers/banners using CollegeBannerLogo reflect changes instantly.
          localStorage.setItem('selectedCollege', result.tenant.name);
          if (result.tenant.logoUrl) {
            localStorage.setItem('selectedCollegeLogo', result.tenant.logoUrl);
          }
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update college settings.' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Network error saving settings.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading College Settings..." />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <GlassHeader>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className={`p-2 rounded-xl border transition-all ${
                isDarkMode 
                  ? 'bg-gray-800/80 border-gray-700/60 hover:bg-gray-700 text-gray-200' 
                  : 'bg-white/80 border-gray-200 hover:bg-gray-100 text-gray-700'
              }`}
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <CollegeBannerLogo />
          </div>

          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <UserProfileDropdown user={user} onOptionClick={() => {}} />
          </div>
        </div>
      </GlassHeader>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Building className="w-8 h-8 text-indigo-500" />
              EduSpace College Settings
            </h1>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Globally update your institution's name and brand logo across all user portals.
            </p>
          </div>
          <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            College Code: {collegeCode || 'N/A'}
          </span>
        </div>

        {/* Status Notification */}
        {message.text && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-2xl border flex items-center space-x-3 ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <p className="text-sm font-medium">{message.text}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Column */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className={`p-6 sm:p-8 rounded-3xl border backdrop-blur-xl ${
              isDarkMode ? 'bg-gray-800/60 border-gray-700/60' : 'bg-white/80 border-gray-200/80 shadow-sm'
            }`}>
              
              {/* College Name Section */}
              <div className="mb-6">
                <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                  <Building className="w-4 h-4 text-indigo-400" />
                  Global College Name
                </label>
                <input
                  type="text"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="e.g. Institute of Engineering Management"
                  required
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDarkMode 
                      ? 'bg-gray-900/80 border-gray-700 text-white placeholder-gray-500' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                />
                <p className="mt-1.5 text-xs text-gray-400">
                  Changing this updates the college name globally across all student, faculty, and admin dashboards.
                </p>
              </div>

              {/* Logo Selection Mode Tabs */}
              <div className="mb-6">
                <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                  <Image className="w-4 h-4 text-indigo-400" />
                  College Logo
                </label>
                
                <div className="flex gap-2 mb-4 p-1 rounded-xl bg-gray-700/20 border border-gray-700/30 w-fit">
                  <button
                    type="button"
                    onClick={() => setInputMode('upload')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      inputMode === 'upload'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('url')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      inputMode === 'url'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Link2 className="w-3.5 h-3.5" /> Image URL
                  </button>
                </div>

                {inputMode === 'upload' ? (
                  <div>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleFileChange}
                      className={`w-full px-4 py-3 rounded-xl border text-sm transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer ${
                        isDarkMode 
                          ? 'bg-gray-900/80 border-gray-700 text-gray-300' 
                          : 'bg-gray-50 border-gray-300 text-gray-700'
                      }`}
                    />
                    <p className="mt-1.5 text-xs text-gray-400">
                      Supported formats: PNG, JPG, WEBP (Max size: 2MB). SVG is disabled for security reasons.
                    </p>
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={logoUrl}
                      onChange={(e) => {
                        setLogoUrl(e.target.value);
                        setLogoPreview(e.target.value);
                      }}
                      placeholder="https://example.com/logo.png"
                      className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDarkMode 
                          ? 'bg-gray-900/80 border-gray-700 text-white placeholder-gray-500' 
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                    <p className="mt-1.5 text-xs text-gray-400">
                      Enter a direct image web link. Unsafe image protocols (javascript:, data:) and SVG extensions are blocked.
                    </p>
                  </div>
                )}
              </div>

              {/* Security Shield Callout */}
              <div className={`p-4 rounded-2xl border mb-6 flex items-start space-x-3 ${
                isDarkMode ? 'bg-indigo-500/5 border-indigo-500/20 text-gray-300' : 'bg-indigo-50 border-indigo-200 text-gray-700'
              }`}>
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-indigo-400">Security & Isolation Guaranteed</p>
                  <p className="opacity-80">
                    Changes are locked strictly to your tenant session. All uploads undergo MIME verification to prevent Stored XSS attacks.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2"
              >
                {saving ? (
                  <>
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                    <span>Saving Changes Globally...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Apply Changes Globally</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Live Preview Sidebar */}
          <div>
            <div className={`p-6 rounded-3xl border backdrop-blur-xl sticky top-28 ${
              isDarkMode ? 'bg-gray-800/60 border-gray-700/60' : 'bg-white/80 border-gray-200/80 shadow-sm'
            }`}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                Global Branding Preview
              </h3>

              {/* Preview Card */}
              <div className={`p-4 rounded-2xl border text-center ${
                isDarkMode ? 'bg-gray-900/60 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="w-20 h-20 mx-auto mb-3 rounded-2xl p-2 bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="College Logo Preview" 
                      className="w-full h-full object-contain"
                      onError={() => setLogoPreview('')}
                    />
                  ) : (
                    <Building className="w-10 h-10 text-indigo-400 opacity-50" />
                  )}
                </div>

                <h4 className="font-extrabold text-base line-clamp-2">
                  {collegeName || 'Your College Name'}
                </h4>
                <p className="text-xs text-gray-400 font-mono mt-1">
                  Code: {collegeCode || '1001'}
                </p>

                <div className="mt-4 pt-3 border-t border-gray-700/40 text-[11px] text-gray-400">
                  Previewing logo and name across header banners and PDF receipts.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CollegeSettings;
