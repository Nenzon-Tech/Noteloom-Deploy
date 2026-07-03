import { API_BASE } from '@/utils/config';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext.jsx';
import GlassHeader from '@/components/common/GlassHeader.jsx';

// Define API_BASE or import it from your config


const AccountCreationManager = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [role, setRole] = useState('student'); // student, faculty, college_admin
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '',
    // Student fields
    phoneNumber: '', gender: '', admissionYear: new Date().getFullYear(),
    course: '', stream: '', year: '1st', rollNo: '', currentSemester: 1,
    profilePicture: null, profilePicturePreview: '',
    // Faculty fields
    department: '', designation: '', qualification: '', experience: '', specialization: '', employeeId: '',
    // Admin fields
    adminLevel: 'College Admin', responsibilities: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 51200) {
      setFormData(prev => ({
        ...prev,
        profilePicture: file,
        profilePicturePreview: URL.createObjectURL(file)
      }));
    } else {
      alert("File too large (Max 50KB)");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const data = new FormData();
    // Add common fields
    data.append('fullName', formData.fullName);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('role', role);
    data.append('collegeName', localStorage.getItem('selectedCollege'));

    // Role specific fields
    if (role === 'student') {
      ['phoneNumber', 'gender', 'admissionYear', 'course', 'stream', 'year', 'rollNo', 'currentSemester'].forEach(f => data.append(f, formData[f]));
      if (formData.profilePicture) data.append('profilePicture', formData.profilePicture);
    } else if (role === 'faculty') {
      ['department', 'designation', 'qualification', 'experience', 'specialization', 'employeeId'].forEach(f => data.append(f, formData[f]));
    } else if (role === 'college_admin') {
      ['adminLevel', 'responsibilities', 'employeeId'].forEach(f => data.append(f, formData[f]));
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/role-signup`, {
        method: 'POST',
        body: data
      });
      const result = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: `Account created! UID: ${result.uid}` });
        // Reset form
        setFormData({ ...formData, fullName: '', email: '', password: '', rollNo: '', employeeId: '', profilePicture: null, profilePicturePreview: '' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to create account' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <GlassHeader isDarker={true}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 rounded-lg hover:bg-gray-700/50">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Account Creation Management</h1>
          </div>
          <div className="flex bg-gray-800/50 rounded-xl p-1 border border-gray-700/50">
            {['student', 'faculty', 'college_admin'].map(t => (
              <button key={t} onClick={() => setRole(t)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${role === t ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </GlassHeader>

      <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`p-8 rounded-2xl border ${isDarkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-bold border-l-4 border-blue-500 pl-3 mb-6">Step 1: Account Credentials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" name="fullName" placeholder="Full Name" required value={formData.fullName} onChange={handleInputChange} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-300'}`} />
              <input type="email" name="email" placeholder="Email Address" required value={formData.email} onChange={handleInputChange} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-300'}`} />
              <input type="password" name="password" placeholder="Temporary Password" required value={formData.password} onChange={handleInputChange} className={`p-3 rounded-lg border md:col-span-2 ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-300'}`} />
            </div>

            <h2 className="text-xl font-bold border-l-4 border-blue-500 pl-3 pt-4">Step 2: Profile Details ({role})</h2>
            
            {role === 'student' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" name="rollNo" placeholder="Roll Number" required value={formData.rollNo} onChange={handleInputChange} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-300'}`} />
                <input type="text" name="phoneNumber" placeholder="Phone" required value={formData.phoneNumber} onChange={handleInputChange} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-300'}`} />
                <select name="gender" required value={formData.gender} onChange={handleInputChange} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                  <option value="">Select Gender</option><option>Male</option><option>Female</option><option>Other</option>
                </select>
                <input type="text" name="course" placeholder="Course (e.g. B.Tech)" required value={formData.course} onChange={handleInputChange} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-300'}`} />
                <input type="text" name="stream" placeholder="Stream (e.g. CSE)" required value={formData.stream} onChange={handleInputChange} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-300'}`} />
                <input type="number" name="currentSemester" placeholder="Semester" required value={formData.currentSemester} onChange={handleInputChange} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-300'}`} />
              </div>
            )}

            {role === 'faculty' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" name="employeeId" placeholder="Employee ID" required value={formData.employeeId} onChange={handleInputChange} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-300'}`} />
                <input type="text" name="department" placeholder="Department" required value={formData.department} onChange={handleInputChange} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-300'}`} />
                <input type="text" name="designation" placeholder="Designation" required value={formData.designation} onChange={handleInputChange} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-300'}`} />
                <input type="text" name="qualification" placeholder="Qualification" required value={formData.qualification} onChange={handleInputChange} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-300'}`} />
              </div>
            )}

            {role === 'college_admin' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" name="employeeId" placeholder="Employee ID" required value={formData.employeeId} onChange={handleInputChange} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-300'}`} />
                <select name="adminLevel" value={formData.adminLevel} onChange={handleInputChange} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                  <option>Department Admin</option><option>College Admin</option><option>Super Admin</option>
                </select>
                <textarea name="responsibilities" placeholder="Key Responsibilities" value={formData.responsibilities} onChange={handleInputChange} className={`p-3 rounded-lg border md:col-span-2 ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-300'}`} rows="3" />
              </div>
            )}

            {message.text && (
              <div className={`p-4 rounded-lg flex items-center space-x-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {message.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
                <span>{message.text}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.01] disabled:opacity-50">
              {loading ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"/> : <><UserPlus className="w-5 h-5"/><span>Create {role.replace('_', ' ')} Account</span></>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AccountCreationManager;