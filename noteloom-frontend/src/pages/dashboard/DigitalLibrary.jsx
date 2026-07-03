import { API_BASE } from '@/utils/config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { 
  ArrowLeft, ChevronRight, Wifi, Search, Key, Lock, 
  Plus, QrCode, UserCheck, RotateCcw, Copy, CheckCircle, 
  ExternalLink, Book, Trash2, Pencil, FileText, Info, 
  Settings, ToggleLeft, ToggleRight, AlertTriangle, Globe, Clock, ShieldAlert, RefreshCcw, Package, List, PlusCircle, MinusCircle,
  MessageSquare, Check, X, Mail, CreditCard
} from 'lucide-react';

// --- CONTEXT IMPORTS ---
import { useTheme } from '@/context/ThemeContext.jsx';
import { useErrorPopup } from '@/context/ErrorPopupContext.jsx';
import GlassHeader from '@/components/common/GlassHeader.jsx';
import UserProfileDropdown from '@/components/common/UserProfileDropdown.jsx';
import ThemeToggle from '@/components/common/ThemeToggle.jsx';
import CollegeBannerLogo from '@/components/common/CollegeBannerLogo.jsx';

 

const DigitalLibrary = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { triggerPopup } = useErrorPopup();

  // --- USER SESSION STATE ---
  const [sessionData, setSessionData] = useState({ user: {}, tenant: {} });
  const [role, setRole] = useState('student'); 
  const sessionToken = localStorage.getItem('sessionToken');

  // --- UI STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Digital'); 
  const [isLoading, setIsLoading] = useState(false);

  // --- UI STATE EXTENSIONS ---
  const [visibleNoteId, setVisibleNoteId] = useState(null); // Tracks which credential note is open
  const [showPendingRequests, setShowPendingRequests] = useState(false); // Toggle for Admin Requests view

  const [showMyUploads, setShowMyUploads] = useState(false); // Filter toggle
  const [editingResource, setEditingResource] = useState(null);
  
  
  // --- MODULE VISIBILITY STATE ---
  const [moduleVisibility, setModuleVisibility] = useState({ 
    inventory: true, 
    dispensary: true 
  });
  const [showModuleMenu, setShowModuleMenu] = useState(false);

  // --- DIGITAL LIB STATE ---
  const [resources, setResources] = useState([]);
  const [credentials, setCredentials] = useState([]);
  const [showCredentials, setShowCredentials] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStream, setSelectedStream] = useState('');
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showEditBookModal, setShowEditBookModal] = useState(null);
  const [copyToDelete, setCopyToDelete] = useState(null);
  const [confirmCopyDelete, setConfirmCopyDelete] = useState(false);

  const [copyToReturn, setCopyToReturn] = useState(null);
  const [confirmReturn, setConfirmReturn] = useState(false);
  const [credToDelete, setCredToDelete] = useState(null);
  const [confirmCredDelete, setConfirmCredDelete] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);

// --- STOCK MANAGEMENT STATE ---
  const [showStockModal, setShowStockModal] = useState(null); // Stores the book object being edited
  const [stockMode, setStockMode] = useState('add'); // 'add' or 'remove'
  const [stockQuantity, setStockQuantity] = useState(1);
  const [selectedCopiesToRemove, setSelectedCopiesToRemove] = useState([]);

// --- DISPENSARY NEW STATE ---
  
  // Issue Section
  const [issueStep, setIssueStep] = useState(1); // 1: Lookup, 2: Confirm
  const [issueUser, setIssueUser] = useState(null); // Stores fetched user data
  const [issueHoldings, setIssueHoldings] = useState([]); // Stores active books
  
  // Return Section
  const [returnSearchId, setReturnSearchId] = useState('');
  const [returnBookData, setReturnBookData] = useState(null); // Stores fetched book for return

  // --- COURSE MANAGEMENT STATE ---
  const [courseOptions, setCourseOptions] = useState(['B.Tech', 'BBA', 'BCA', 'M.Tech', 'MBA', 'Diploma']);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [customCourse, setCustomCourse] = useState('');

  // --- UI STATE EXTENSIONS ---
  const [uploadCurriculum, setUploadCurriculum] = useState('Semester'); 
  const [showDescription, setShowDescription] = useState(false); 

  // --- UPLOAD STATE ---
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newUpload, setNewUpload] = useState({ 
    title: '', author: '', department: '', type: 'Notes', url: '', description: '', semester: 1, course: 'B.Tech' 
  });

  // --- CREDENTIAL EDIT STATE ---
  const [showCredModal, setShowCredModal] = useState(false);
  const [editingCred, setEditingCred] = useState({ providerName: '', loginId: '', password: '', note: '', link: '' });

  // --- PHYSICAL LIB STATE ---
  const [physicalBooks, setPhysicalBooks] = useState([]);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [selectedBookForQR, setSelectedBookForQR] = useState(null);
  
  const [newBook, setNewBook] = useState({ 
    title: '', author: '', category: 'CS', copiesCount: 1, course: 'B.Tech' 
  });

  // --- DISPENSARY STATE ---
  const [studentIdInput, setStudentIdInput] = useState('');
  const [scanCopyId, setScanCopyId] = useState('');
  const [processingCheckout, setProcessingCheckout] = useState(false);

  // --- iOS ANIMATION STATE ---
  const [activeCard, setActiveCard] = useState(null);
  const [cardOriginRect, setCardOriginRect] = useState(null);
  const [isCardExpanded, setIsCardExpanded] = useState(false);

  // --- STYLES & GLASS UTILS ---
  const glassCardClass = isDarkMode 
    ? 'bg-gray-800/40 backdrop-blur-xl border border-white/10 shadow-lg' 
    : 'bg-white/60 backdrop-blur-xl border border-white/40 shadow-lg';

  const glassInputClass = isDarkMode
    ? 'bg-gray-900/50 border-gray-700 text-white placeholder-gray-500'
    : 'bg-white/50 border-white/60 text-gray-800 placeholder-gray-400 shadow-inner';

  const modalThemeClass = isDarkMode 
    ? 'bg-gray-900 border-gray-700 text-white' 
    : 'bg-white border-gray-200 text-gray-900';

  const styles = `
    @keyframes modalPopIn {
      0% { opacity: 0; transform: scale(0.95) translateY(10px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    .animate-modal-pop { animation: modalPopIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    .card-expand-transition { transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1); }
    .smooth-expand { transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease-in-out, padding 0.4s ease; }
  `;

  // --- INITIAL LOAD ---
  useEffect(() => {
    fetchSession();
    fetchDigitalData();
    fetchDepartments(); 
  }, []);

  const fetchSession = async () => {
  try {
      const res = await fetch(`${API_BASE}/session/info`, {
          headers: { 'Authorization': `Bearer ${sessionToken}` }
      });
        if(res.ok) {
            const data = await res.json();
            setSessionData({ user: data.user, tenant: data.tenant });
            setRole(data.role || 'student');
        }
    } catch(e) { console.error(e); }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/departments`, {
        headers: { Authorization: `Bearer ${sessionToken}` }
      });
      if(res.ok) {
          const data = await res.json();
          setDepartments(data);
      }
    } catch (err) {
      console.error('Failed to fetch departments');
    }
  };

  const getDashboardTitle = () => {
      switch(role) {
          case 'student': return 'Student Dashboard';
          case 'faculty': return 'Faculty Dashboard';
          case 'college_admin': return 'Admin Dashboard';
          case 'noteloom_admin': return 'IT Admin Dashboard';
          default: return 'Dashboard';
      }
  };

  const fetchDigitalData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/library/digital`, {
        headers: { 'Authorization': `Bearer ${sessionToken}` }
      });
      if (!res.ok) throw new Error("Failed to load digital resources");
      const data = await res.json();
      setCredentials(data.credentials);
      setResources(data.resources);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  const fetchPhysicalData = async () => {
  const controller = new AbortController();

  setIsLoading(true);
  try {
    const res = await fetch(`${API_BASE}/api/library/physical`, {
      headers: { 'Authorization': `Bearer ${sessionToken}` },
      signal: controller.signal
    });

    if (!res.ok) throw new Error("Failed to load inventory");
    const data = await res.json();
    setPhysicalBooks(data);
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error("Inventory Load Error:", error);
    }
  } finally {
    setIsLoading(false);
  }

  return () => controller.abort();
};

// --- ISSUE FLOW FUNCTIONS ---
  
  // Step 1: Fetch User Details
  const handleFetchUser = async () => {
      if(!studentIdInput) return triggerPopup("Enter User ID/Email", "error");
      setIsLoading(true);
      try {
          const res = await fetch(`${API_BASE}/api/library/physical/user/${studentIdInput}`, {
              headers: { 'Authorization': `Bearer ${sessionToken}` }
          });
          const data = await res.json();
          if(!res.ok) throw new Error(data.error || "User not found");
          
          setIssueUser(data.user);
          setIssueHoldings(data.holdings);
          setIssueStep(2); // Move to next step
      } catch (err) {
          triggerPopup(err.message, "error");
      }
      setIsLoading(false);
  };

  // Step 2: Confirm Issue
  const handleConfirmIssue = async () => {
      if(!scanCopyId) return triggerPopup("Scan a Book Copy ID", "error");
      
      try {
          const res = await fetch(`${API_BASE}/api/library/physical/checkout`, {
              method: 'POST',
              headers: { 
                  'Authorization': `Bearer ${sessionToken}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ copyId: scanCopyId, userId: issueUser.id }) 
          });
          
          const data = await res.json();
          if(!res.ok) throw new Error(data.error);

          triggerPopup(data.message, "success");
          
          // [CRITICAL FOR LIVE UPDATE]
          // 1. Re-fetch the specific user's data to update the "Currently Holding" list instantly
          await handleFetchUser(); 
          
          // 2. Clear the input for the next book
          setScanCopyId(''); 
          
          // 3. Update the main inventory list in the background
          fetchPhysicalData(); 

      } catch (err) {
          triggerPopup(err.message, "error");
      }
  };

  const resetIssueFlow = () => {
      setIssueStep(1);
      setIssueUser(null);
      setIssueHoldings([]);
      setStudentIdInput('');
      setScanCopyId('');
  };

  // --- RETURN FLOW FUNCTIONS ---

  const handleSearchForReturn = async () => {
      if(!returnSearchId) return triggerPopup("Enter Copy ID", "error");
      
      try {
          const res = await fetch(`${API_BASE}/api/library/physical/copy/${returnSearchId}`, {
              headers: { 'Authorization': `Bearer ${sessionToken}` }
          });
          const data = await res.json();
          if(!res.ok) throw new Error(data.error);
          
          setReturnBookData(data); // Show details card
      } catch (err) {
          triggerPopup(err.message, "error");
          setReturnBookData(null);
      }
  };

  const handleConfirmReturn = async () => {
      try {
          const res = await fetch(`${API_BASE}/api/library/physical/return`, {
              method: 'POST',
              headers: { 
                  'Authorization': `Bearer ${sessionToken}`, 
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ copyId: returnBookData.copyId })
          });
          
          if(!res.ok) throw new Error("Return Failed");
          
          triggerPopup("Book Returned Successfully", "success");
          
          // 1. Clear the Return Panel to be ready for next scan
          setReturnBookData(null);
          setReturnSearchId('');
          
          // 2. [FIX] Live Update: If a user is currently selected in the Issue Panel, 
          // refresh their holdings list immediately to reflect the return.
          if (issueUser && studentIdInput) {
              await handleFetchUser(); 
          }

          // 3. Refresh the main Inventory list (background update)
          fetchPhysicalData();

      } catch (e) { 
          triggerPopup(e.message, "error"); 
      }
  };

  // Helper: Calculate Duration
  const getDuration = (dateString) => {
      const start = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - start);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays === 0 ? "Today" : `${diffDays} days`;
  };


  const handleTabChange = (tab) => {
  setActiveTab(tab);

  if (tab === 'Digital') {
    fetchDigitalData();
  } 
  else if (tab === 'Physical') {
    fetchPhysicalData();
  }
  // ⛔ DO NOTHING for Dispensary
};

// --- RESTORE BOOK (Cancel Deletion) ---
  const handleRestoreBook = async (bookId) => {
    try {
      // Assuming backend supports this, or use the edit route to set deleteAfter: null
      await fetch(`${API_BASE}/api/library/physical/book/${bookId}/restore`, {
        method: 'PUT', // or POST depending on your backend
        headers: { 
          Authorization: `Bearer ${sessionToken}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ deleteAfter: null })
      });
      triggerPopup("Deletion Cancelled", "success");
      fetchPhysicalData();
    } catch (e) {
      triggerPopup("Failed to restore", "error");
    }
  };

  // --- SUB-COMPONENT: COUNTDOWN TIMER ---
  const DeletionTimer = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
      const interval = setInterval(() => {
        const now = new Date();
        const end = new Date(targetDate);
        const diff = end - now;

        if (diff <= 0) {
          setTimeLeft("00h 00m");
          clearInterval(interval);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft(`${hours}h ${minutes}m`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }, [targetDate]);

    return <span className="font-mono tabular-nums">{timeLeft}</span>;
  };


  const handleUpload = async (e) => {
    e.preventDefault();
    if (!newUpload.url.startsWith('http')) return triggerPopup("Please enter a valid URL (http/https)", "error");

    try {
        const res = await fetch(`${API_BASE}/api/library/digital/resource`, {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${sessionToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUpload)
        });
        
        const data = await res.json(); 
        if (!res.ok) throw new Error(data.error || "Upload failed"); 
        
        const msg = role === 'college_admin' ? "Resource Published!" : "Submitted for Review";
        triggerPopup(msg, "success");
        
        setShowUploadModal(false);
        setNewUpload({ title: '', author: '', department: '', type: 'Notes', url: '', description: '', semester: 1, course: 'B.Tech' });
        fetchDigitalData();
    } catch (error) {
        triggerPopup(error.message, "error");
    }
  };

  const handleDeleteCredential = (credId) => {
  setCredToDelete(credId);
  setConfirmCredDelete(false);
};


  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleSaveCredential = async (e) => {
    e.preventDefault();
    try {
        const isEdit = !!editingCred._id; 
        const res = await fetch(`${API_BASE}/library/digital/credential`, {
            method: 'PUT',
            headers: { 
              'Authorization': `Bearer ${sessionToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(editingCred)
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Operation failed");
        
        triggerPopup(isEdit ? "Credential Updated" : "Credential Added", "success");
        setShowCredModal(false);
        setEditingCred({ providerName: '', loginId: '', password: '', note: '', link: '' }); 
        fetchDigitalData();
    } catch (error) {
        triggerPopup(error.message, "error");
    }
  };

  const handleAddBook = async (e) => {
      e.preventDefault();
      
      // FIX: Ensure Department is selected before sending
      if(!selectedDept) {
          return triggerPopup("Please select a Department", "error");
      }

      // FIX: Create a payload that explicitly includes the department
      const bookPayload = {
          ...newBook,
          department: selectedDept // Add department to the payload
      };

      try {
          const res = await fetch(`${API_BASE}/api/library/physical/book`, {
              method: 'POST',
              headers: { 
                'Authorization': `Bearer ${sessionToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(bookPayload) // Send the corrected payload
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to add book");
          
          triggerPopup("Inventory Updated Successfully", "success");
          setShowAddBookModal(false);
          // Reset form
          setNewBook({ title: '', author: '', category: 'CS', copiesCount: 1, course: 'B.Tech' });
          fetchPhysicalData();
      } catch (error) {
          console.error("Add Book Error:", error);
          triggerPopup(error.message || "Server Error", "error");
      }
  };

  const handleApproveResource = async (id, status) => {
      try {
          const res = await fetch(`${API_BASE}/library/digital/resource/${id}/status`, {
              method: 'PUT',
              headers: { 
                'Authorization': `Bearer ${sessionToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ status })
          });
          if(res.ok) {
              triggerPopup(`Resource ${status}`, 'success');
              fetchDigitalData();
          }
      } catch(e) { triggerPopup('Action failed', 'error'); }
  };

  // Function to handle Delete
  const handleDeleteResource = async (id) => {
      if(!window.confirm("Are you sure you want to delete this resource?")) return;
      try {
          const res = await fetch(`${API_BASE}/library/digital/resource/${id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${sessionToken}` }
          });
          if (!res.ok) throw new Error("Failed to delete");
          triggerPopup("Resource Deleted", "success");
          fetchDigitalData(); // Refresh list
      } catch (err) {
          triggerPopup(err.message, "error");
      }
  };

// 1. Handle Schedule Delete (24 Hours)
  const confirmScheduleDelete = async () => {
    if (!resourceToDelete) return;
    
    // Calculate 24 hours from now
    const deleteAfterDate = new Date(Date.now() + 24 * 60 * 60 * 1000); 

    try {
        const res = await fetch(`${API_BASE}/library/digital/resource/${resourceToDelete._id}`, {
            method: 'PUT', // We use PUT to update the deleteAfter field
            headers: { 
                'Authorization': `Bearer ${sessionToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ deleteAfter: deleteAfterDate })
        });

        if (!res.ok) throw new Error("Failed to schedule deletion");
        
        triggerPopup("Resource scheduled for deletion in 24h", "success");
        setResourceToDelete(null); // Close modal
        fetchDigitalData(); // Refresh UI
    } catch (err) {
        triggerPopup(err.message, "error");
    }
  };

  // 2. Handle Restore (Cancel Delete)
  const handleRestoreResource = async (id) => {
      try {
        const res = await fetch(`${API_BASE}/library/digital/resource/${id}`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${sessionToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ deleteAfter: null }) // Clear the timer
        });
        if(res.ok) {
            triggerPopup("Resource Restored", "success");
            fetchDigitalData();
        }
      } catch(e) { triggerPopup("Restore failed", "error"); }
  };

  // Function to submit Edit
  const handleUpdateResource = async (e) => {
      e.preventDefault();
      try {
          const res = await fetch(`${API_BASE}/library/digital/resource/${editingResource._id}`, {
              method: 'PUT',
              headers: { 
                  'Authorization': `Bearer ${sessionToken}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(editingResource)
          });
          if (!res.ok) throw new Error("Failed to update");
          triggerPopup("Resource Updated", "success");
          setEditingResource(null); // Close modal
          fetchDigitalData();
      } catch (err) {
          triggerPopup(err.message, "error");
      }
  };

  const handleSaveCustomCourse = (targetSetter, targetObj) => {
    if (customCourse.trim()) {
      setCourseOptions([...courseOptions, customCourse.trim()]);
      targetSetter({ ...targetObj, course: customCourse.trim() });
      setCustomCourse('');
      setIsAddingCourse(false);
    }
  };

  const renderCourseSelector = (value, onChangeSetter, currentObj) => (
    <div>
        <div className="flex justify-between items-center mb-2">
             <label className="text-xs font-bold text-gray-500 uppercase">Course</label>
             {!isAddingCourse ? (
                <button type="button" onClick={() => setIsAddingCourse(true)} className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded hover:bg-emerald-500/20 font-bold transition-colors">+ New</button>
             ) : (
                <button type="button" onClick={() => setIsAddingCourse(false)} className="text-[10px] text-red-500 hover:underline">Cancel</button>
             )}
        </div>
        {!isAddingCourse ? (
            <select required value={value} onChange={e => onChangeSetter({ ...currentObj, course: e.target.value })}
                className={`w-full p-3 rounded-xl border outline-none focus:border-emerald-500 ${glassInputClass} ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
            >
                <option value="">Select Course</option>
                {courseOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        ) : (
            <div className="flex gap-1">
                <input autoFocus placeholder="Type Course..." value={customCourse} onChange={(e) => setCustomCourse(e.target.value)} className={`w-full p-3 rounded-xl border outline-none focus:border-emerald-500 ${glassInputClass}`} />
                <button type="button" onClick={() => handleSaveCustomCourse(onChangeSetter, currentObj)} className="bg-emerald-500 text-white p-3 rounded-xl hover:bg-emerald-600"><CheckCircle size={18}/></button>
            </div>
        )}
    </div>
  );

  const handleCheckout = async () => {
    if(!scanCopyId || !studentIdInput) return triggerPopup("Enter Copy ID and Member ID", "error");
    setProcessingCheckout(true);
    try {
        const res = await fetch(`${API_BASE}/api/library/physical/checkout`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${sessionToken}`,
                'Content-Type': 'application/json'
            },
            // Matches Backend: sends 'studentIdentifier'
            body: JSON.stringify({ copyId: scanCopyId, studentIdentifier: studentIdInput })
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.error || "Checkout Failed");
        
        // Success: Backend now returns specific role message (e.g. "Issued to Student: John")
        triggerPopup(data.message || "Book issued successfully", "success");
        
        setScanCopyId('');
        // Optional: Keep student ID filled if issuing multiple books to same person? 
        // For now, we clear it to prevent errors.
        setStudentIdInput(''); 
        fetchPhysicalData(); 
    } catch (error) {
        triggerPopup(error.message, "error");
    }
    setProcessingCheckout(false);
  };

  const handleReturn = (copyId) => {
  setCopyToReturn(copyId);
  setConfirmReturn(false);
};


  // --- ANIMATION LOGIC ---
  const handleCardClick = (item, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCardOriginRect(rect);
    setActiveCard(item);
    setTimeout(() => setIsCardExpanded(true), 10);
  };

  const handleCardClose = () => {
    setIsCardExpanded(false);
    setTimeout(() => { setActiveCard(null); setCardOriginRect(null); }, 500);
  };

  const getFormatColor = (type) => {
    switch(type) {
      case 'Notes': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'Book': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Paper': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Link': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    try {
        if (url.includes('drive.google.com') && url.includes('/view')) {
            return url.replace('/view', '/preview');
        }
        if (url.includes('youtube.com/watch')) {
            return url.replace('watch?v=', 'embed/');
        }
        if (url.includes('youtu.be/')) {
            return url.replace('youtu.be/', 'youtube.com/embed/');
        }
        if (url.includes('sharepoint.com') || url.includes('onedrive.live.com')) {
             return url + (url.includes('?') ? '&action=embedview' : '?action=embedview');
        }
        return url;
    } catch (e) { return url; }
  };

  return (
    <div className={`min-h-screen relative font-sans transition-colors duration-300 pb-12 ${isDarkMode ? 'bg-[#0f111a] text-white' : 'bg-[#f2f4f7] text-gray-900'}`}>
      <style>{styles}</style>
      
      {/* ================= HEADER ================= */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <GlassHeader variant="dashboard">
            <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
            {/* LEFT */}
            <div className="flex items-center space-x-4">
                <button onClick={() => navigate(-1)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}>
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <UserProfileDropdown user={sessionData.user} onOptionClick={() => {}} />
                <div className="flex flex-col">
                    <div className={`flex items-center text-sm font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                        <span className="opacity-70">{getDashboardTitle()}</span>
                        <ChevronRight className="w-4 h-4 mx-1 opacity-50" />
                        <span className="text-purple-600 dark:text-purple-400">Library</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-0.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${isDarkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                        {sessionData?.tenant?.name || 'College'}
                        </span>
                        <span className="text-[10px] text-green-500 flex items-center"><Wifi className="w-3 h-3 mr-1" /> Online</span>
                    </div>
                </div>
            </div>
            {/* RIGHT */}
            <div className="flex items-center space-x-4">
                <CollegeBannerLogo />
                <ThemeToggle />
            </div>
            </div>
        </GlassHeader>
      </div>

      {/* ================= HERO BANNER ================= */}
      {/* Changed: Removed 'overflow-hidden' from here so the dropdown isn't clipped. Added z-10. */}
      <div className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 pt-28 pb-14 px-6 shadow-xl relative mb-6 z-10">
            
            {/* New: Dedicated Background Layer for Blur Effects (Keeps overflow hidden here only) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            </div>

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6 relative z-20">
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-md mb-3">
                        📚 Digital Library
                    </h1>
                    <p className="text-white/90 text-lg font-medium max-w-2xl">
                        Unified access to {sessionData?.tenant?.name || 'Institute'}'s resources.
                    </p>

                    <div className="mt-5 inline-flex items-center gap-2 bg-black/25 text-white/90 px-4 py-2 rounded-lg text-sm backdrop-blur-md border border-white/10 shadow-sm">
                        <Info size={18} className="text-yellow-300 shrink-0" />
                        <span>Only <strong>Public View</strong> Google Drive links supported currently.</span>
                    </div>
                </div>

                {/* Tab Navigation & Admin Configure Menu */}
                <div className="flex flex-col items-end gap-2">
                    
                    {/* TAB BAR + ADMIN CONFIG BUTTON */}
                    <div className="flex items-center gap-2">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-1.5 rounded-2xl flex shadow-lg transition-all duration-300">
                            <button 
                                onClick={() => handleTabChange('Digital')} 
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'Digital' ? 'bg-white text-purple-700 shadow-md' : 'text-white/80 hover:bg-white/10'}`}
                            >
                                Resources
                            </button>
                            
                            {/* Inventory Tab (Restricted to Admin) */}
                            {moduleVisibility.inventory && role === 'college_admin' && (
                                <button 
                                    onClick={() => handleTabChange('Physical')} 
                                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 animate-in fade-in slide-in-from-right-4 ${activeTab === 'Physical' ? 'bg-white text-purple-700 shadow-md' : 'text-white/80 hover:bg-white/10'}`}
                                >
                                    Inventory
                                </button>
                            )}
                            
                            {/* Dispensary Tab (Restricted to Admin) */}
                            {moduleVisibility.dispensary && role === 'college_admin' && (
                                <button 
                                    onClick={() => handleTabChange('Dispensary')} 
                                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 animate-in fade-in slide-in-from-right-4 ${activeTab === 'Dispensary' ? 'bg-purple-500 text-white shadow-md' : 'text-white/80 hover:bg-white/10'}`}
                                >
                                    <UserCheck size={16}/> Dispensary
                                </button>
                            )}
                        </div>

                        {/* Admin Configuration Menu */}
                        {role === 'college_admin' && (
                            <div className="relative">
                                {/* ... (rest of the admin menu code remains the same) ... */}
                                <button 
                                    onClick={() => setShowModuleMenu(!showModuleMenu)}
                                    className={`p-3 rounded-2xl border transition-all ${showModuleMenu ? 'bg-white text-purple-600 border-white shadow-xl' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
                                    title="Configure Views"
                                >
                                    {/* Updated: Swapped Layout for Settings Icon */}
                                    <Settings size={20} />
                                </button>

                                {/* Dropdown Menu (Updated: High Z-Index, Dark Mode Support) */}
                                {showModuleMenu && (
                                    <div className={`absolute top-14 right-0 w-60 p-4 rounded-2xl shadow-2xl backdrop-blur-xl border animate-in fade-in zoom-in-95 origin-top-right z-[100] ${isDarkMode ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-white/50'}`}>
                                        <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 px-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>View Settings</h4>
                                        <div className="space-y-2">
                                            {/* Inventory Toggle */}
                                            <div className={`flex items-center justify-between p-3 rounded-xl transition-colors ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}>
                                                <span className={`text-sm font-bold flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                    <Book size={16} className="text-emerald-500"/> Inventory
                                                </span>
                                                <button 
                                                    onClick={() => setModuleVisibility(prev => ({ ...prev, inventory: !prev.inventory }))}
                                                    className={`transition-colors active:scale-95 ${moduleVisibility.inventory ? 'text-emerald-500' : 'text-gray-400'}`}
                                                >
                                                    {moduleVisibility.inventory ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                                                </button>
                                            </div>
                                            
                                            {/* Dispensary Toggle */}
                                            <div className={`flex items-center justify-between p-3 rounded-xl transition-colors ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}>
                                                <span className={`text-sm font-bold flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                    <UserCheck size={16} className="text-purple-500"/> Dispensary
                                                </span>
                                                <button 
                                                    onClick={() => setModuleVisibility(prev => ({ ...prev, dispensary: !prev.dispensary }))}
                                                    className={`transition-colors active:scale-95 ${moduleVisibility.dispensary ? 'text-emerald-500' : 'text-gray-400'}`}
                                                >
                                                    {moduleVisibility.dispensary ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-6">
        
        {/* ======================= TAB: DIGITAL ======================= */}
        {activeTab === 'Digital' && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
                <div className={`rounded-2xl mb-10 overflow-hidden transition-all duration-500 ${glassCardClass}`}>
                    <div className="p-6 flex flex-col xl:flex-row gap-6 items-end">
                        <div className="flex flex-col md:flex-row gap-4 w-full xl:flex-1 items-end">
    {/* SEARCH BAR */}
    <div className="relative w-full group">
        <input 
            type="text" 
            placeholder="Search e-books, journals, notes..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 border transition-all duration-300 ${glassInputClass}`} 
        />
        <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
    </div>

    {/* [UPDATED] My Uploads Toggle - Visible only to Faculty & Admin */}
    {(role === 'college_admin' || role === 'faculty') && (
        <button 
            onClick={() => setShowMyUploads(!showMyUploads)} 
            className={`px-6 py-0 h-[50px] rounded-xl font-bold border transition-all duration-300 flex items-center gap-2 whitespace-nowrap active:scale-95 ${
                showMyUploads 
                ? 'bg-purple-500/10 text-purple-600 border-purple-500/30' 
                : (isDarkMode ? 'bg-gray-800 text-gray-400 border-gray-700' : 'bg-white text-gray-600 border-white/60 shadow-sm')
            }`}
        >
            <UserCheck size={18} /> 
            {showMyUploads ? 'My Uploads' : 'All Uploads'}
        </button>
    )}
    
    {/* Credentials Button */}
    <button onClick={() => setShowCredentials(!showCredentials)} className={`px-6 py-0 h-[50px] rounded-xl font-bold border transition-all duration-300 flex items-center gap-2 whitespace-nowrap active:scale-95 ${showCredentials ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/30" : (isDarkMode ? "bg-gray-800 border-gray-600 text-gray-300" : "bg-white border-white/60 text-gray-600 shadow-sm")}`}>
        <Key size={18} /> {showCredentials ? 'Hide Keys' : 'Credentials'}
    </button>

    {/* [UPDATED] Add Button - COMPLETELY HIDDEN for Students */}
    {role !== 'student' && (
        <button onClick={() => setShowUploadModal(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-0 h-[50px] rounded-xl font-bold shadow-lg shadow-purple-500/30 transition-all flex items-center gap-2 active:scale-95">
            <Plus size={20}/> Add
        </button>
    )}
</div>
                    </div>

                    {/* Credentials Drawer (With Animation) */}
                    <div className={`border-t smooth-expand ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} ${showCredentials ? 'max-h-[800px] opacity-100 p-6' : 'max-h-0 opacity-0 p-0 overflow-hidden'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-yellow-500 font-bold flex items-center gap-2"><Lock size={16}/> Institutional Access Credentials</h3>
                            {role === 'college_admin' && (
                                <button onClick={() => { setEditingCred({ providerName: '', loginId: '', password: '', note: '', link: '' }); setShowCredModal(true); }} className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded">
                                    + Add New
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"> 
                            {credentials.map((cred, index) => (
                                <div key={index} className={`rounded-xl p-5 transition-all group relative border ${isDarkMode ? 'bg-black/20 border-gray-700' : 'bg-white/40 border-white/60 shadow-sm'}`}>
                                    
                                    {/* Header & Actions */}
                                    <div className="flex justify-between items-start mb-3 pb-2 border-b border-dashed border-gray-500/30">
                                        <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{cred.providerName}</h4>
                                        <div className="flex gap-2">
                                            {role === 'college_admin' && (
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => { setEditingCred(cred); setShowCredModal(true); }} className="text-blue-500 hover:bg-blue-500/10 p-1.5 rounded-md transition-colors"><Pencil size={14}/></button>
                                                    <button onClick={() => handleDeleteCredential(cred._id)} className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-md transition-colors"><Trash2 size={14}/></button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Credentials Info */}
                                    <div className="space-y-3">
                                        {/* Login ID */}
                                        <div onClick={() => copyToClipboard(cred.loginId)} className={`flex justify-between items-center p-2 rounded cursor-pointer group/item relative ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white/60 hover:bg-white'}`}>
                                            <span className="text-xs text-gray-500 font-bold">ID</span>
                                            <span className="font-mono text-purple-500 truncate max-w-[150px]">{cred.loginId}</span>
                                            {copiedId === cred.loginId && <span className="absolute -top-6 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-bounce">Copied!</span>}
                                        </div>

                                        {/* Password */}
                                        <div onClick={() => copyToClipboard(cred.password)} className={`flex justify-between items-center p-2 rounded cursor-pointer group/item relative ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white/60 hover:bg-white'}`}>
                                            <span className="text-xs text-gray-500 font-bold">PW</span>
                                            <span className="font-mono text-green-500 truncate max-w-[150px]">{cred.password}</span>
                                            {copiedId === cred.password && <span className="absolute -top-6 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-bounce">Copied!</span>}
                                        </div>

                                        {/* NEW: Link Display Section */}
                                        {cred.link && (
                                            <a 
                                                href={cred.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className={`flex justify-between items-center p-2 rounded cursor-pointer group/item relative transition-colors ${isDarkMode ? 'bg-white/5 hover:bg-blue-500/10' : 'bg-white/60 hover:bg-blue-50'}`}
                                            >
                                                <span className="text-xs text-gray-500 font-bold">URL</span>
                                                <span className="font-mono text-blue-500 truncate max-w-[180px] text-xs flex items-center gap-1">
                                                    {cred.link.replace(/^https?:\/\//, '')} <ExternalLink size={10}/>
                                                </span>
                                            </a>
                                        )}

                                        {/* Note Toggle Section with Smooth Animation */}
                                        {cred.note && (
                                            <div className="pt-1">
                                                <button 
                                                    onClick={() => setVisibleNoteId(visibleNoteId === cred._id ? null : cred._id)}
                                                    className={`w-full text-xs font-bold py-1.5 rounded flex items-center justify-center gap-2 transition-colors ${visibleNoteId === cred._id ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'}`}
                                                >
                                                    <MessageSquare size={12}/> {visibleNoteId === cred._id ? 'Hide Note' : 'View Note'}
                                                </button>
                                                
                                                <div className={`grid transition-all duration-300 ease-in-out ${visibleNoteId === cred._id ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}>
                                                    <div className="overflow-hidden">
                                                        <div className={`text-xs p-2 rounded italic ${isDarkMode ? 'text-gray-300 bg-black/40' : 'text-gray-600 bg-gray-100'}`}>
                                                            {cred.note}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- REQUESTS TOGGLE (Admin Only) ---
{role === 'college_admin' && (
    <div className="flex justify-end mb-4">
        <button 
            onClick={() => setShowPendingRequests(!showPendingRequests)}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${showPendingRequests ? 'bg-orange-500 text-white' : 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'}`}
        >
            {showPendingRequests ? 'Show All Resources' : `Review Requests (${resources.filter(r => r.status === 'Pending').length})`}
        </button>
    </div>
)} */}

{/* --- REQUESTS TOGGLES (Placed Below Search Bar) --- */}
                <div className="flex justify-end mb-4 gap-2">
                    
                  
                    {/* 2. ADMIN TOGGLE: Review Requests */}
                    {role === 'college_admin' && (
                        <button 
                            onClick={() => setShowPendingRequests(!showPendingRequests)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                                showPendingRequests 
                                ? 'bg-orange-500 text-white shadow-md' 
                                : 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
                            }`}
                        >
                            <ShieldAlert size={14} />
                            {showPendingRequests ? 'Show All Resources' : `Review Requests (${resources.filter(r => r.status === 'Pending').length})`}
                        </button>
                    )}
                </div>

{/* Digital Resources Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {resources
        .filter(r => {
            const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase());
            
            // =========================================================
            // [FIXED] PROPERTY NAME CORRECTION
            // =========================================================

            // 1. Get Current User ID
            // CHANGE: Use .id instead of ._id (matching sessionRoutes.js response)
            const currentUserId = sessionData?.user?.id ? String(sessionData.user.id) : null;

            // 2. Get Resource Owner ID
            let resourceOwnerId = null;
            if (r.addedBy) {
                // If populated object, use ._id. If raw string, use as is.
                if (typeof r.addedBy === 'object' && r.addedBy._id) {
                    resourceOwnerId = String(r.addedBy._id);
                } else {
                    resourceOwnerId = String(r.addedBy);
                }
            }

            // 3. "My Uploads" Toggle Logic
            if (showMyUploads) {
                // Return true ONLY if IDs match
                if (!currentUserId || !resourceOwnerId) return false;
                return matchesSearch && resourceOwnerId === currentUserId;
            }

            // 4. Standard View Logic
            // Admin: See Pending
            if (showPendingRequests && role === 'college_admin') {
                return matchesSearch && r.status === 'Pending';
            }
            
            // Others: See Approved OR My Own Pending
            // (We reuse the calculated IDs here for safety)
            const isMyPending = r.status === 'Pending' && (resourceOwnerId === currentUserId);
            return matchesSearch && (r.status === 'Approved' || isMyPending);
        })
        .map((item) => {
            // 1. Safe Owner ID Extraction
            let itemOwnerId = null;
            if (item.addedBy) {
                itemOwnerId = (typeof item.addedBy === 'object' && item.addedBy._id) 
                    ? String(item.addedBy._id) 
                    : String(item.addedBy);
            }

            // 2. Safe Current User ID
            const currentUserId = sessionData?.user?.id ? String(sessionData.user.id) : null;

            // 3. Ownership & Logic
            const isOwner = currentUserId && itemOwnerId && (currentUserId === itemOwnerId);
            const canManage = role === 'college_admin' || (role === 'faculty' && isOwner);
            
            // 4. Status Flags
            const isScheduled = item.deleteAfter && new Date(item.deleteAfter) > new Date();
            const isRejected = item.status === 'Rejected';
            
            // 5. [UPDATED] BADGE VISIBILITY LOGIC
            // Badges are HIDDEN by default. 
            // Only show if:
            // A) Faculty has toggled "My Requests" (showMyUploads) AND they own the item
            // B) Admin has toggled "Review Requests" (showPendingRequests)
            const showStatusBadges = (showMyUploads && isOwner) || (showPendingRequests && role === 'college_admin');

            return (
                <div 
                    key={item._id} 
                    className={`rounded-2xl p-6 transition-all duration-300 group relative overflow-hidden flex flex-col h-64 
                    ${activeCard?._id === item._id ? 'opacity-0' : 'opacity-100'} 
                    ${glassCardClass} 
                    ${isScheduled ? 'border-red-500/50 bg-red-500/5' : ''}
                    ${isRejected ? 'opacity-75 grayscale-[0.5] hover:grayscale-0 cursor-default' : 'hover:-translate-y-2 hover:shadow-2xl cursor-pointer'}`}
                    
                    // Disable opening if Rejected
                    onClick={(e) => {
                        if (isRejected) return; 
                        if (!isScheduled) handleCardClick(item, e);
                    }}
                >
                    {/* --- DELETION OVERLAY --- */}
                    {isScheduled && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/5 backdrop-blur-sm p-4 text-center">
                            <div className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-2 shadow-lg animate-pulse mb-3">
                                <Clock size={12} /> 
                                Auto-delete in: <DeletionTimer targetDate={item.deleteAfter} />
                            </div>
                            <h4 className="font-bold text-red-500 mb-2">Scheduled for Removal</h4>
                            {canManage && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleRestoreResource(item._id); }}
                                    className="bg-white text-red-600 px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:scale-105 transition-transform flex items-center gap-2"
                                >
                                    <RefreshCcw size={14}/> Undo / Restore
                                </button>
                            )}
                        </div>
                    )}

                    {/* --- CARD CONTENT --- */}
                    <div className={`transition-all duration-300 flex flex-col h-full ${isScheduled ? 'opacity-20 blur-sm' : 'opacity-100'}`}>
                        
                        {/* HEADER ROW */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex flex-col gap-2">
                                {/* TYPE BADGE */}
                                <div className="flex gap-2">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${getFormatColor(item.type)}`}>
                                        {item.type}
                                    </span>
                                </div>

                                {/* [UPDATED] STATUS BADGES (Conditional) */}
                                {showStatusBadges && (
                                    <div className="flex mt-1">
                                        {item.status === 'Pending' && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center gap-1">
                                                <Clock size={10} /> Pending
                                            </span>
                                        )}
                                        {item.status === 'Approved' && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/20 flex items-center gap-1">
                                                <CheckCircle size={10} /> Accepted
                                            </span>
                                        )}
                                        {item.status === 'Rejected' && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-1">
                                                <X size={10} /> Rejected
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Date & Actions Column */}
                            <div className="flex flex-col items-end gap-2 z-20">
                                <span className="text-xs text-gray-400 font-mono">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </span>

                                {/* ACTIONS: Edit hidden for Rejected, Delete visible */}
                                {!isScheduled && canManage && (
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        {/* Edit: Only show if NOT rejected */}
                                        {!isRejected && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setEditingResource(item); }} 
                                                className={`p-1.5 rounded-lg backdrop-blur-md transition-all shadow-sm border ${isDarkMode ? 'bg-gray-800/80 text-blue-400 border-gray-600 hover:bg-gray-700' : 'bg-white/80 text-blue-600 border-white/40 hover:bg-white'}`}
                                                title="Edit Resource"
                                            >
                                                <Pencil size={12}/>
                                            </button>
                                        )}
                                        
                                        {/* Delete: Always available for Owner */}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setResourceToDelete(item); }} 
                                            className={`p-1.5 rounded-lg backdrop-blur-md transition-all shadow-sm border ${isDarkMode ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30' : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'}`}
                                            title="Delete Resource"
                                        >
                                            <Trash2 size={12}/>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* BODY INFO */}
                        <div className="mb-4 flex-grow">
                            <h3 className={`text-xl font-bold mb-1 group-hover:text-purple-500 transition-colors duration-300 line-clamp-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{item.title}</h3>
                            <p className="text-sm text-gray-500 truncate">{item.author}</p>
                            <div className="mt-3 flex gap-2">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${isDarkMode ? 'bg-gray-900/50 text-gray-400 border-gray-700' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                    {item.department || 'General'}
                                </span>
                                {item.course && <span className="inline-block px-2 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">{item.course}</span>}
                            </div>
                        </div>

                        {/* FOOTER BUTTONS */}
                        <div className="mt-auto" onClick={(e) => e.stopPropagation()}>
                            {role === 'college_admin' && item.status === 'Pending' ? (
                                <div className="flex gap-2">
                                    <button onClick={() => handleApproveResource(item._id, 'Approved')} className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-2 rounded-lg font-bold flex items-center justify-center gap-1">
                                        <Check size={14}/> Approve
                                    </button>
                                    <button onClick={() => handleApproveResource(item._id, 'Rejected')} className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs py-2 rounded-lg font-bold flex items-center justify-center gap-1">
                                        <X size={14}/> Reject
                                    </button>
                                </div>
                            ) : (
                                // View Button (Disabled if Rejected)
                                <button 
                                    disabled={isRejected}
                                    className={`w-full py-2.5 rounded-xl text-sm font-bold border flex items-center justify-center gap-2 
                                    ${isRejected 
                                        ? (isDarkMode ? 'bg-red-500/5 text-red-500/50 border-red-500/10 cursor-not-allowed' : 'bg-red-50 text-red-300 border-red-100 cursor-not-allowed') 
                                        : (isDarkMode ? 'bg-gray-700/50 text-white border-gray-600' : 'bg-white text-purple-600 border-purple-100 shadow-sm')
                                    }`}
                                >
                                    {isRejected ? 'Submission Rejected' : 'View Details'} 
                                    {!isRejected && <ArrowLeft className="rotate-180 w-3 h-3"/>}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            );
        })}
</div>
            </div>
        )}

        {/* ======================= TAB: PHYSICAL ======================= */}
{moduleVisibility.inventory && activeTab === 'Physical' && (
  <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">

    {/* INVENTORY DISCLAIMER */}
    <div
      className={`p-4 rounded-xl mb-6 flex items-start gap-3 border ${
        isDarkMode
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          : 'bg-emerald-50 border-emerald-200 text-emerald-700'
      }`}
    >
      <Info className="shrink-0 mt-0.5" />
      <div>
        <h4 className="font-bold text-sm uppercase tracking-wide">
          Physical Inventory Management
        </h4>
        <p className="text-sm opacity-90">
          Add and manage hard copies of books here. These items correspond to physical assets in the library.
        </p>
      </div>
    </div>

    {/* SEARCH + ADD */}
    <div className="flex justify-between mb-8">
      <div className="relative w-full max-w-md">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search physical inventory..."
          className={`w-full rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 border transition-all duration-300 ${glassInputClass}`}
        />
        <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
      </div>

      {role === 'college_admin' && (
        <button
          onClick={() => setShowAddBookModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/30"
        >
          <Book size={18} /> Add Book
        </button>
      )}
    </div>

    {/* BOOK LIST */}
    <div className="space-y-4">
      {physicalBooks
        .filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .map(book => {
          const isScheduledForDeletion = book.deleteAfter && new Date(book.deleteAfter) > new Date();
          
          return (
            <div
              key={book._id}
              className={`relative rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-500 ${glassCardClass} ${isScheduledForDeletion ? 'border-red-500/50 bg-red-500/5' : ''}`}
            >
              {/* DELETION OVERLAY / STATUS */}
              {isScheduledForDeletion && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl flex items-center gap-2 shadow-lg animate-pulse">
                  <Clock size={12} /> 
                  Deleting in: <DeletionTimer targetDate={book.deleteAfter} />
                </div>
              )}

              {/* LEFT INFO */}
              <div className={isScheduledForDeletion ? 'opacity-50 blur-[0.5px] transition-all' : ''}>
                <h3
                  className={`text-xl font-bold flex items-center gap-3 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {book.title}
                  <span
                    className={`text-xs px-2 py-1 rounded font-mono border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-300'
                        : 'bg-gray-100 border-gray-200 text-gray-600'
                    }`}
                  >
                    {book.baseId}
                  </span>
                </h3>

                <p className="text-gray-400 text-sm mt-1">
                  by {book.author} • {book.category}
                </p>

                <div className="mt-3 flex gap-2">
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                    In Stock: {book.copies.filter(c => c.status === 'Available').length}
                  </span>
                  <span className="text-xs font-bold text-gray-500 bg-gray-500/10 px-2 py-1 rounded border border-gray-500/20">
                    Total: {book.copies.length}
                  </span>
                </div>
              </div>

              {/* RIGHT ACTIONS */}
              <div className="flex items-center gap-2 z-10">
                
                {isScheduledForDeletion ? (
                  // RESTORE ACTION
                  <button
                    onClick={() => handleRestoreBook(book._id)}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 bg-emerald-600 text-white shadow-lg hover:bg-emerald-500 transition-all"
                  >
                    <RefreshCcw size={16} /> Cancel Delete
                  </button>
                ) : (
                  <>
                    {/* VIEW COPIES */}
                    <button
                      onClick={() => setSelectedBookForQR(book)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm ${
                        isDarkMode
                          ? 'bg-gray-700 hover:bg-gray-600 text-white'
                          : 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-200'
                      }`}
                    >
                      <QrCode size={18} /> <span className="hidden sm:inline">QR Codes</span>
                    </button>

                    {role === 'college_admin' && (
                      <>
                        {/* MANAGE STOCK (New) */}
                        <button
                          onClick={() => { setShowStockModal(book); setStockMode('add'); setStockQuantity(1); setSelectedCopiesToRemove([]); }}
                          className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                          title="Manage Stock"
                        >
                          <Package size={18} />
                        </button>

                        {/* EDIT BOOK */}
                        <button
                          onClick={() => setShowEditBookModal(book)}
                          className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20' : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'}`}
                          title="Edit Details"
                        >
                          <Pencil size={18} />
                        </button>

                        {/* DELETE BOOK */}
                        <button
                          onClick={() => {
                            setBookToDelete(book);
                            setConfirmDelete(false);
                          }}
                          className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                          title="Schedule Deletion"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
    </div>
  </div>
)}


        {/* ======================= TAB: DISPENSARY ======================= */}
        {moduleVisibility.dispensary && activeTab === 'Dispensary' && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
                
                {/* DISCLAIMER */}
                <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 border ${isDarkMode ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-700'}`}>
                    <Info className="shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-sm uppercase tracking-wide">Circulation Desk</h4>
                        <p className="text-sm opacity-90">Manage book issues and returns. Search user first to issue.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    
                    {/* ==================== LEFT: ISSUE PANEL ==================== */}
                    <div className={`p-8 rounded-2xl flex flex-col h-full ${glassCardClass}`}>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-purple-500">
                            <ExternalLink className="rotate-180" size={24}/> Issue Book
                        </h3>

                        {/* STEP 1: USER LOOKUP */}
                        {issueStep === 1 && (
                            <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-left-4">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Step 1: Enter Member ID
                                </label>
                                <div className="flex gap-2">
                                    <input 
                                        value={studentIdInput} 
                                        onChange={e => setStudentIdInput(e.target.value)} 
                                        placeholder="Scan ID or enter Email/Roll No..." 
                                        className={`w-full p-4 rounded-xl border outline-none focus:border-purple-500 transition-all ${glassInputClass}`} 
                                        onKeyDown={(e) => e.key === 'Enter' && handleFetchUser()}
                                        autoFocus
                                    />
                                    <button 
                                        onClick={handleFetchUser}
                                        disabled={isLoading}
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 rounded-xl font-bold"
                                    >
                                        {isLoading ? '...' : 'Next'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: DETAILS & SCAN BOOK */}
                        {issueStep === 2 && issueUser && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                
                                {/* User Profile Card */}
                                <div className={`p-5 rounded-2xl border flex justify-between items-start gap-5 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                    
                                    <div className="flex items-start gap-5">
                                        {/* Profile Picture OR Gradient Fallback */}
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 border-2 shadow-sm ${isDarkMode ? 'border-gray-600' : 'border-white'}`}>
                                            {issueUser.profilePicture ? (
                                                <img 
                                                    src={issueUser.profilePicture} 
                                                    alt="Profile" 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-2xl">
                                                    {issueUser.name ? issueUser.name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                            )}
                                        </div>

                                        {/* User Details */}
                                        <div>
                                            <h4 className={`text-xl font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{issueUser.name}</h4>
                                            
                                            <div className="flex flex-col gap-1 mt-2">
                                                <span className={`text-xs font-mono flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    <Mail size={14} className="opacity-70" /> 
                                                    {issueUser.email}
                                                </span>
                                                
                                                {/* [UPDATED] Larger NoteLoom ID Field */}
                                                <span className="text-sm font-mono flex items-center gap-2 text-purple-500 font-bold bg-purple-500/10 px-3 py-1.5 rounded-lg w-fit mt-1 border border-purple-500/20">
                                                    <CreditCard size={16} /> 
                                                    {issueUser.noteloomId || 'N/A'}
                                                </span>
                                            </div>

                                            <div className="mt-3">
                                                <span className={`text-xs uppercase font-bold px-3 py-1 rounded-full ${issueUser.role === 'student' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                                    {issueUser.role}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <button onClick={resetIssueFlow} className="text-sm text-red-500 font-bold hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                                        Change User
                                    </button>
                                </div>

                                {/* Active Holdings List */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase flex justify-between">
                                        <span>Currently Holding ({issueHoldings.length})</span>
                                        {issueHoldings.length > 0 && <span className="text-orange-500">Collect these first if due</span>}
                                    </label>
                                    
                                    <div className={`max-h-40 overflow-y-auto rounded-xl border ${isDarkMode ? 'bg-black/20 border-gray-700' : 'bg-white border-gray-200'}`}>
                                        {issueHoldings.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-gray-400 italic">No active book loans.</div>
                                        ) : (
                                            issueHoldings.map((h, i) => (
                                                <div key={i} className={`p-3 text-sm flex justify-between items-center border-b last:border-0 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                                    <div>
                                                        <div className="font-bold truncate max-w-[180px]">{h.title}</div>
                                                        <div className="text-xs text-gray-500 font-mono">{h.copyId}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xs font-bold text-purple-500">{getDuration(h.issuedDate)}</div>
                                                        <div className="text-[10px] text-gray-400">Since {new Date(h.issuedDate).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Step 2 Action: Scan Book */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Step 2: Scan Book to Issue</label>
                                    <div className="flex gap-2 mt-2">
                                        <input 
                                            value={scanCopyId} 
                                            onChange={e => setScanCopyId(e.target.value)} 
                                            placeholder="Scan Book QR..." 
                                            className={`w-full p-4 rounded-xl border outline-none focus:border-purple-500 font-mono transition-all ${glassInputClass}`} 
                                            onKeyDown={(e) => e.key === 'Enter' && handleConfirmIssue()}
                                            autoFocus
                                        />
                                        <button onClick={handleConfirmIssue} className="bg-purple-600 hover:bg-purple-700 text-white px-6 rounded-xl font-bold shadow-lg shadow-purple-500/20">
                                            Issue
                                        </button>
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>

                    {/* ==================== RIGHT: RETURN PANEL ==================== */}
                    <div className={`p-8 rounded-2xl flex flex-col h-full ${glassCardClass}`}>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-emerald-500">
                            <RotateCcw size={24}/> Quick Return
                        </h3>

                        {/* Search Input */}
                        <div className="mb-6">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Scan Book to Return</label>
                            <div className="flex gap-2 mt-2">
                                <input 
                                    value={returnSearchId} 
                                    onChange={e => setReturnSearchId(e.target.value)} 
                                    placeholder="Enter Copy ID..." 
                                    className={`w-full p-4 rounded-xl border outline-none focus:border-emerald-500 font-mono transition-all ${glassInputClass}`} 
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearchForReturn()}
                                />
                                <button onClick={handleSearchForReturn} className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 px-4 rounded-xl font-bold">
                                    <Search size={20}/>
                                </button>
                            </div>
                        </div>

                        {/* Result Display */}
                        <div className="flex-1 flex flex-col justify-center">
                            {returnBookData ? (
                                <div className={`p-6 rounded-2xl border text-center animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                    <h4 className="text-xl font-bold mb-1">{returnBookData.title}</h4>
                                    <p className="text-sm text-gray-500 mb-4">{returnBookData.author}</p>
                                    
                                    <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-6 ${returnBookData.status === 'Issued' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                        {returnBookData.status === 'Issued' ? 'Currently Issued' : 'Available on Shelf'}
                                    </div>

                                    {returnBookData.status === 'Issued' ? (
                                        <>
                                            <p className="text-sm text-gray-500 mb-6">
                                                Issued to: <strong className={isDarkMode ? 'text-white' : 'text-gray-900'}>{returnBookData.issuedTo?.name || 'Unknown'}</strong>
                                            </p>
                                            <div className="flex gap-3">
                                                <button onClick={() => { setReturnBookData(null); setReturnSearchId(''); }} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700">Cancel</button>
                                                <button onClick={handleConfirmReturn} className="flex-1 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg">Confirm Return</button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-sm text-gray-400">
                                            This book is not currently issued. <br/> No action needed.
                                            <div className="mt-4">
                                                <button onClick={() => { setReturnBookData(null); setReturnSearchId(''); }} className="px-6 py-2 rounded-xl font-bold bg-gray-200 text-gray-600 hover:bg-gray-300">Clear</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center text-gray-400 opacity-50">
                                    <QrCode size={48} className="mx-auto mb-3"/>
                                    <p className="text-sm">Scan a book QR code <br/> to see details here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

      </div>

      {/* --- MODAL: EXPANDED CARD (Viewer) --- */}
      {activeCard && cardOriginRect && (
        <>
          <div className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-md transition-opacity duration-500 ${isCardExpanded ? 'opacity-100' : 'opacity-0'}`} onClick={handleCardClose} />
          <div 
            className={`fixed z-[70] border shadow-2xl overflow-hidden flex flex-col card-expand-transition ${modalThemeClass}`}
            style={{
              top: isCardExpanded ? '10%' : `${cardOriginRect.top}px`,
              left: isCardExpanded ? '50%' : `${cardOriginRect.left}px`,
              width: isCardExpanded ? 'min(90%, 900px)' : `${cardOriginRect.width}px`,
              height: isCardExpanded ? 'min(80%, 600px)' : `${cardOriginRect.height}px`,
              transform: isCardExpanded ? 'translateX(-50%)' : 'none',
              borderRadius: '1rem',
              cursor: isCardExpanded ? 'default' : 'pointer'
            }}
          >
            {/* Viewer Header */}
            <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/80 border-gray-100'}`}>
                <div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{activeCard.title}</h2>
                    <p className="text-gray-500 text-sm">by {activeCard.author}</p>
                </div>
                <div className="flex gap-2">
                    {/* TOGGLE DESCRIPTION ICON */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); setShowDescription(!showDescription); }} 
                        className={`p-2 rounded-full transition-colors ${showDescription ? 'bg-purple-500 text-white' : 'bg-gray-500/10 text-gray-500'}`}
                        title="Toggle Description"
                    >
                        <Info size={20} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleCardClose(); }} className="bg-gray-500/10 hover:bg-gray-500/30 text-gray-500 rounded-full p-2">✕</button>
                </div>
            </div>
            
            {/* Viewer Content Body */}
            <div className="flex-1 flex flex-col relative overflow-hidden">
                {/* Iframe / Content Area */}
                <div className={`transition-all duration-300 ${showDescription ? 'h-[60%]' : 'h-full'}`}>
                    <iframe 
                        src={getEmbedUrl(activeCard.url)} 
                        className="w-full h-full border-0" 
                        allowFullScreen 
                        title="Preview" 
                    />
                    
                    <a href={activeCard.url} target="_blank" rel="noopener noreferrer" className="absolute top-4 right-4 bg-white/90 text-black px-4 py-2 rounded-lg text-xs font-bold shadow-lg flex items-center gap-2 hover:bg-white">
                        Open Original <ExternalLink size={12}/>
                    </a>
                </div>

                {/* Collapsible Description Area */}
                {showDescription && (
                    <div className={`h-[40%] p-8 overflow-y-auto border-t animate-in slide-in-from-bottom-10 ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-100'}`}>
                        <h3 className="text-purple-500 font-bold uppercase text-xs tracking-widest mb-2">Description & Context</h3>
                        <p className={`leading-relaxed text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {activeCard.description || "No detailed description available."}
                        </p>
                    </div>
                )}
            </div>
          </div>
        </>
      )}

      {/* --- MODAL: ADD / EDIT CREDENTIAL (Enhanced with Link) --- */}
      {showCredModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[90] p-4">
            <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl ${modalThemeClass}`}>
            <h2 className="text-xl font-bold mb-4 text-yellow-500 flex items-center gap-2">
                <Key size={18}/> {editingCred._id ? 'Edit Credential' : 'New Credential'}
            </h2>
            <form onSubmit={handleSaveCredential} className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Provider</label>
                    <input required placeholder="e.g. IEEE, Springer" value={editingCred.providerName || ''} onChange={e => setEditingCred({ ...editingCred, providerName: e.target.value })} className={`w-full p-3 rounded-xl border mt-1 ${glassInputClass}`} />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Login ID</label>
                    <input required placeholder="Username / Email" value={editingCred.loginId || ''} onChange={e => setEditingCred({ ...editingCred, loginId: e.target.value })} className={`w-full p-3 rounded-xl border mt-1 ${glassInputClass}`} />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
                    <input required placeholder="Access Password" value={editingCred.password || ''} onChange={e => setEditingCred({ ...editingCred, password: e.target.value })} className={`w-full p-3 rounded-xl border mt-1 ${glassInputClass}`} />
                </div>
                {/* ADDED LINK INPUT */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Login URL (Optional)</label>
                    <input type="url" placeholder="https://..." value={editingCred.link || ''} onChange={e => setEditingCred({ ...editingCred, link: e.target.value })} className={`w-full p-3 rounded-xl border mt-1 ${glassInputClass}`} />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Note (Optional)</label>
                    <textarea placeholder="Any specific instructions..." value={editingCred.note || ''} onChange={e => setEditingCred({ ...editingCred, note: e.target.value })} className={`w-full p-3 rounded-xl border mt-1 h-20 resize-none ${glassInputClass}`} />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowCredModal(false)} className="px-5 py-2 rounded-xl text-gray-400 hover:text-gray-500">Cancel</button>
                <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-xl font-bold">Save</button>
                </div>
            </form>
            </div>
        </div>
      )}


      {/* --- MODAL: UPLOAD (Links Only) --- */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[80] p-4">
          <div className={`animate-modal-pop rounded-2xl w-full max-w-2xl border shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden ${modalThemeClass}`}>
            <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50'}`}>
              <div>
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Add Link</h2>
                  {/* [NEW] Faculty Disclaimer */}
                  {role !== 'college_admin' && (
                    <div className="flex items-center gap-2 mt-2 text-xs font-bold text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/20">
                        <AlertTriangle size={14}/>
                        <span>Your upload will be reviewed by an Admin before publishing.</span>
                    </div>
                  )}
              </div>
              <button onClick={() => setShowUploadModal(false)} className="bg-gray-500/20 text-gray-500 rounded-full p-2 hover:bg-gray-500/30">✕</button>
            </div>
            <div className={`p-8 overflow-y-auto ${isDarkMode ? 'bg-gray-900/30' : 'bg-gray-50/50'}`}>
              <form onSubmit={handleUpload} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Title *</label>
                      <input required className={`w-full rounded-xl p-3 outline-none border focus:border-purple-500 ${glassInputClass}`} value={newUpload.title} onChange={e => setNewUpload({...newUpload, title: e.target.value})} />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Author / Platform *</label>
                      <input required className={`w-full rounded-xl p-3 outline-none border focus:border-purple-500 ${glassInputClass}`} value={newUpload.author} onChange={e => setNewUpload({...newUpload, author: e.target.value})} />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Link URL (Drive/Web) *</label>
                        <input required type="url" className={`w-full rounded-xl p-3 outline-none border focus:border-purple-500 ${glassInputClass}`} placeholder="https://..." value={newUpload.url} onChange={e => setNewUpload({...newUpload, url: e.target.value})} />
                    </div>
                    {/* Course Selection */}
                    {renderCourseSelector(newUpload.course, setNewUpload, newUpload)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Department */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Department</label>
                    <select required className={`w-full rounded-xl p-3 outline-none border focus:border-purple-500 ${glassInputClass} ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`} value={newUpload.department} onChange={e => setNewUpload({...newUpload, department: e.target.value})}>
                        <option value="">Select Department</option>
                        {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>

                  {/* Type */}
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Type</label>
                      <select className={`w-full rounded-xl p-3 outline-none border focus:border-purple-500 ${glassInputClass} ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`} value={newUpload.type} onChange={e => setNewUpload({...newUpload, type: e.target.value})}>
                          <option>Notes</option><option>Book</option><option>Paper</option><option>Video</option><option>Article</option>
                      </select>
                  </div>

                  {/* Semester / Trimester Selection (Updated to 10) */}
                  <div>
                      <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-bold text-gray-500 uppercase">{uploadCurriculum}</label>
                          <button 
                            type="button" 
                            onClick={() => setUploadCurriculum(uploadCurriculum === 'Semester' ? 'Trimester' : 'Semester')}
                            className="text-[10px] bg-purple-500/10 text-purple-600 px-2 py-0.5 rounded hover:bg-purple-500/20 font-bold transition-colors uppercase"
                          >
                            Switch to {uploadCurriculum === 'Semester' ? 'Trimester' : 'Semester'}
                          </button>
                      </div>
                      <select 
                        className={`w-full rounded-xl p-3 outline-none border focus:border-purple-500 ${glassInputClass} ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`} 
                        value={newUpload.semester} 
                        onChange={e => setNewUpload({...newUpload, semester: Number(e.target.value)})}
                      >
                          {/* Generates 1 to 10 */}
                          {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                              <option key={num} value={num}>{uploadCurriculum} {num}</option>
                          ))}
                      </select>
                  </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
                    <textarea className={`w-full rounded-xl p-3 outline-none border focus:border-purple-500 h-24 resize-none ${glassInputClass}`} value={newUpload.description} onChange={e => setNewUpload({...newUpload, description: e.target.value})}></textarea>
                </div>

                <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setShowUploadModal(false)} className="px-6 py-2.5 rounded-xl font-bold text-gray-400 hover:text-gray-500">Cancel</button>
                    <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg">Save Resource</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: QR CODES --- */}
{selectedBookForQR && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[90] p-4">
    <div className="bg-white text-black rounded-2xl w-full max-w-3xl h-[80vh] flex flex-col overflow-hidden animate-modal-pop shadow-2xl">

      {/* ===== HEADER ===== */}
      <div className="p-6 border-b flex justify-between items-center bg-gray-50">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {selectedBookForQR.title}
          </h2>
          <p className="text-sm text-gray-500 font-mono mt-1">
            Base ID: {selectedBookForQR.baseId}
          </p>
        </div>

        <div className="flex gap-2">
          {/* 🖨️ PRINT BUTTON */}
          <button
            onClick={() => {
              setIsPrintMode(true);
              setTimeout(() => {
                window.print();
                setIsPrintMode(false);
              }, 300);
            }}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-bold"
          >
            Print
          </button>

          <button
            onClick={() => setSelectedBookForQR(null)}
            className="p-2 hover:bg-gray-200 rounded-full"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ===== BODY ===== */}
      <div className="flex-1 overflow-y-auto p-8 bg-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 print-area">
          {selectedBookForQR.copies.map((copy, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center text-center"
            >
              <div className="bg-white p-2 mb-4">
                <QRCode value={copy.copyId} size={isPrintMode ? 100 : 120} />
              </div>

              <p className="font-mono font-bold text-lg text-gray-800">
                {copy.copyId}
              </p>

              {role === 'college_admin' && !isPrintMode && copy.status !== 'Removed' && (
  <button
  onClick={() => {
    setCopyToDelete(copy);
    setConfirmCopyDelete(false);
  }}
  className="mt-3 text-xs text-red-600 hover:bg-red-100 px-3 py-1 rounded-full"
>
  Delete Copy
</button>

)}


              {/* STATUS → screen only */}
{!isPrintMode && (
  <span
    className={`text-xs font-bold px-3 py-1 rounded-full mt-3 ${
      copy.status === 'Available'
        ? 'bg-green-100 text-green-700'
        : 'bg-red-100 text-red-700'
    }`}
  >
    {copy.status}
  </span>
)}

{/* INSTITUTE NAME → print only */}
{isPrintMode && (
  <p className="text-xs font-semibold text-gray-700 mt-2">
    {sessionData?.tenant?.name}
  </p>
)}

{copy.issuedTo && !isPrintMode && (
  <p className="text-xs mt-2 text-gray-500 font-medium">
    With: {copy.issuedTo.name}
  </p>
)}

            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)}


      {/* --- MODAL: ADD BOOK (Inventory) --- */}
      {showAddBookModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[90] p-4">
            <div className={`rounded-2xl w-full max-w-lg border shadow-2xl p-8 animate-modal-pop ${modalThemeClass}`}>
                <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <Book className="text-emerald-500" /> Add to Inventory
                </h2>

                <form onSubmit={(e) => { handleAddBook(e); }} className="space-y-6">
                
                {/* Book Title */}
                <input required placeholder="Book Title" value={newBook.title} onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                    className={`w-full p-4 rounded-xl border outline-none focus:border-emerald-500 ${glassInputClass}`}
                />

                {/* Author */}
                <input required placeholder="Author" value={newBook.author} onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                    className={`w-full p-4 rounded-xl border outline-none focus:border-emerald-500 ${glassInputClass}`}
                />

                {/* COURSE SELECTION & QUANTITY (ROW) */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Dynamic Course Selection */}
                    {renderCourseSelector(newBook.course, setNewBook, newBook)}

                    {/* Small Quantity Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Copies (Qty)</label>
                        <input type="number" min="1" max="100" required value={newBook.copiesCount} 
                            onChange={(e) => setNewBook({ ...newBook, copiesCount: Number(e.target.value) })}
                            className={`w-full p-3 rounded-xl border outline-none text-center font-bold focus:border-emerald-500 ${glassInputClass}`}
                        />
                    </div>
                </div>

                {/* Department */}
                <select required value={selectedDept} onChange={(e) => {
                    const deptId = e.target.value; 
                    setSelectedDept(deptId); 
                    setSelectedStream(''); 
                    }}
                    className={`w-full p-4 rounded-xl border outline-none focus:border-emerald-500 ${glassInputClass} ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
                >
                    <option value="">Select Department</option>
                    {departments.map((dept) => <option key={dept._id} value={dept._id}>{dept.name}</option>)}
                </select>

                {/* Stream (Updates Category) */}
                {selectedDept && (
                    <select 
                        required 
                        value={selectedStream} 
                        onChange={(e) => {
                            const val = e.target.value;
                            setSelectedStream(val);
                            setNewBook({ ...newBook, category: val });
                        }}
                        className={`w-full p-4 rounded-xl border outline-none focus:border-emerald-500 ${glassInputClass} ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
                    >
                    <option value="">Select Stream</option>
                    {departments.find((d) => d._id === selectedDept)?.streams.map((stream) => (
                        <option key={stream._id} value={stream.name}>{stream.name}</option>
                    ))}
                    </select>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-8">
                    <button type="button" onClick={() => setShowAddBookModal(false)} className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-gray-500">Cancel</button>
                    <button type="submit" className="bg-emerald-600 px-8 py-3 rounded-xl text-white font-bold hover:bg-emerald-500 shadow-lg shadow-emerald-500/20">Generate IDs & Save</button>
                </div>
                </form>
            </div>
        </div>
      )}

      {/* --- MODAL: EDIT BOOK --- */}
{showEditBookModal && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[90] p-4">
    <div className={`rounded-2xl w-full max-w-lg border shadow-2xl p-8 animate-modal-pop ${modalThemeClass}`}>
      <h2 className="text-2xl font-bold mb-6 text-blue-500 flex items-center gap-2">
        <Pencil size={18} /> Edit Book
      </h2>

      <form
        onSubmit={async (e) => {
          e.preventDefault();

          await fetch(`${API_BASE}/api/library/physical/book/${showEditBookModal._id}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${sessionToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              title: showEditBookModal.title,
              author: showEditBookModal.author,
              category: showEditBookModal.category
            })
          });

          setShowEditBookModal(null);
          fetchPhysicalData();
        }}
        className="space-y-5"
      >
        <input
          value={showEditBookModal.title}
          onChange={(e) =>
            setShowEditBookModal({ ...showEditBookModal, title: e.target.value })
          }
          className={`w-full p-4 rounded-xl border ${glassInputClass}`}
          placeholder="Book Title"
        />

        <input
          value={showEditBookModal.author}
          onChange={(e) =>
            setShowEditBookModal({ ...showEditBookModal, author: e.target.value })
          }
          className={`w-full p-4 rounded-xl border ${glassInputClass}`}
          placeholder="Author"
        />

        <input
          value={showEditBookModal.category}
          onChange={(e) =>
            setShowEditBookModal({ ...showEditBookModal, category: e.target.value })
          }
          className={`w-full p-4 rounded-xl border ${glassInputClass}`}
          placeholder="Category"
        />

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => setShowEditBookModal(null)}
            className="px-5 py-2 rounded-xl text-gray-400 hover:text-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{/* --- MODAL: DELETE BOOK DISCLAIMER (Enhanced UI) --- */}
      {bookToDelete && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border transform transition-all scale-100 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-white'}`}>
            
            <div className="flex flex-col items-center text-center mb-6">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-inner ${isDarkMode ? 'bg-red-500/10 text-red-500' : 'bg-red-50 text-red-500'}`}>
                <Clock size={40} strokeWidth={1.5} />
              </div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Schedule Deletion</h2>
              <p className={`mt-2 text-sm max-w-[80%] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                You are scheduling the removal of <strong>"{bookToDelete.title}"</strong>.
              </p>
            </div>

            {/* 48HR TIMER INFO BOX */}
            <div className={`rounded-2xl p-5 mb-8 flex items-start gap-4 text-left ${isDarkMode ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-100'}`}>
              <ShieldAlert className={`w-6 h-6 shrink-0 mt-0.5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
              <div>
                <h4 className={`font-bold text-sm uppercase tracking-wide ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>48-Hour Safety Buffer</h4>
                <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? 'text-red-300/70' : 'text-red-600/80'}`}>
                  This item will be moved to the Trash. It will be permanently destroyed automatically after <strong>48 hours</strong> if not restored.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setBookToDelete(null); setConfirmDelete(false); }}
                className={`flex-1 py-4 rounded-xl font-bold text-sm transition-colors ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await fetch(`${API_BASE}/api/library/physical/book/${bookToDelete._id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${sessionToken}` }
                  });
                  setBookToDelete(null);
                  fetchPhysicalData();
                }}
                className="flex-1 py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg shadow-red-500/30 transition-all active:scale-95"
              >
                Start 48h Timer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: DELETE CREDENTIAL DISCLAIMER --- */}
      {credToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-white'}`}>
            <div className="text-center mb-6">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-yellow-500/10 text-yellow-500' : 'bg-yellow-50 text-yellow-600'}`}>
                <Key size={32} />
              </div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Revoke Access?</h2>
              <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                This will permanently delete the credential from the digital library.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setCredToDelete(null)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Keep
              </button>
              <button
                onClick={async () => {
                  try {
                    await fetch(`${API_BASE}/api/library/digital/credential/${credToDelete}`, {
                      method: 'DELETE',
                      headers: { Authorization: `Bearer ${sessionToken}` }
                    });
                    triggerPopup("Credential Deleted", "success");
                    fetchDigitalData();
                  } catch (e) { triggerPopup("Delete failed", "error"); }
                  setCredToDelete(null);
                }}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: RETURN BOOK DISCLAIMER --- */}
      {copyToReturn && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-white'}`}>
            <div className="text-center mb-6">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-emerald-500/10 text-emerald-500' : 'bg-emerald-50 text-emerald-600'}`}>
                <RotateCcw size={32} />
              </div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Confirm Return</h2>
              <p className={`mt-2 text-sm font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                ID: {copyToReturn}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCopyToReturn(null)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await fetch(`${API_BASE}/api/library/physical/return`, {
                      method: 'POST',
                      headers: {
                        Authorization: `Bearer ${sessionToken}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ copyId: copyToReturn })
                    });
                    triggerPopup("Book Returned", "success");
                    fetchPhysicalData();
                  } catch (e) { triggerPopup("Return Failed", "error"); }
                  setCopyToReturn(null);
                }}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: DELETE COPY DISCLAIMER --- */}
      {copyToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-white'}`}>
            <div className="text-center mb-6">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-orange-500/10 text-orange-500' : 'bg-orange-50 text-orange-600'}`}>
                <Trash2 size={32} />
              </div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Remove Copy?</h2>
              <div className={`mt-3 p-3 rounded-xl text-xs text-left ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
                <p><strong>Effect:</strong> This specific copy ID ({copyToDelete.copyId}) will be removed from circulation.</p>
                <p className="mt-1"><strong>Note:</strong> The ID may be reused automatically if you add stock later.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCopyToDelete(null)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await fetch(`${API_BASE}/api/library/physical/copy/${copyToDelete.copyId}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${sessionToken}` }
                  });
                  setCopyToDelete(null);
                  setSelectedBookForQR(null);
                  fetchPhysicalData();
                }}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-orange-500 text-white hover:bg-orange-600"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

{/* --- MODAL: MANAGE STOCKS --- */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[90] p-4">
          <div className={`rounded-2xl w-full max-w-lg border shadow-2xl overflow-hidden flex flex-col animate-modal-pop ${modalThemeClass} max-h-[80vh]`}>
            
            {/* Header */}
            <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <h2 className="text-xl font-bold flex items-center gap-2 overflow-hidden">
                <Package className="text-blue-500 shrink-0"/> 
                <span className="truncate">Manage Stock: <span className="opacity-70">{showStockModal.title}</span></span>
              </h2>
              <button 
                onClick={() => setShowStockModal(null)}
                className={`ml-4 p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                ✕
              </button>
            </div>

            {/* Toggle Tabs */}
            <div className="flex p-2 gap-2 bg-black/5 dark:bg-white/5 mx-6 mt-6 rounded-xl">
              <button 
                onClick={() => setStockMode('add')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${stockMode === 'add' ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <PlusCircle size={16}/> Add Stock
              </button>
              <button 
                onClick={() => setStockMode('remove')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${stockMode === 'remove' ? 'bg-white dark:bg-gray-700 text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <MinusCircle size={16}/> Remove Copies
              </button>
            </div>

            {/* Body Content with Animation */}
            <div className="p-6 overflow-y-auto smooth-expand">
              
              {/* MODE: ADD STOCK */}
              {stockMode === 'add' && (
                <div className="animate-in slide-in-from-left-4 fade-in duration-300">
                  <div className={`p-4 rounded-xl border mb-4 text-center ${isDarkMode ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-100'}`}>
                    <p className="text-sm font-medium mb-1">IDs will be auto-generated.</p>
                    <p className="text-xs opacity-70">Sequence continues from: {showStockModal.baseId}-XX</p>
                  </div>
                  
                  <div className="flex items-center justify-center gap-4 my-6">
                    <button onClick={() => setStockQuantity(Math.max(1, stockQuantity - 1))} className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200"><MinusCircle/></button>
                    <div className="text-center">
                      <span className="text-3xl font-bold block">{stockQuantity}</span>
                      <span className="text-xs uppercase font-bold text-gray-500">Copies</span>
                    </div>
                    <button onClick={() => setStockQuantity(stockQuantity + 1)} className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200"><PlusCircle/></button>
                  </div>

                  <button 
                    onClick={async () => {
                      // Reuse existing POST /book route which handles stock increments
                      try {
                        await fetch(`${API_BASE}/api/library/physical/book`, {
                          method: 'POST',
                          headers: { Authorization: `Bearer ${sessionToken}`, 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            title: showStockModal.title, 
                            author: showStockModal.author, 
                            category: showStockModal.category,
                            copiesCount: stockQuantity 
                          })
                        });
                        triggerPopup(`Added ${stockQuantity} copies`, "success");
                        setShowStockModal(null);
                        fetchPhysicalData();
                      } catch(e) { triggerPopup("Failed to add stock", "error"); }
                    }}
                    className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-500/20"
                  >
                    Confirm & Generate IDs
                  </button>
                </div>
              )}

              {/* MODE: REMOVE STOCK */}
              {stockMode === 'remove' && (
                <div className="animate-in slide-in-from-right-4 fade-in duration-300">
                  <p className="text-sm text-gray-500 mb-3">Select specific IDs to remove from circulation:</p>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {showStockModal.copies.filter(c => c.status !== 'Removed').map(copy => (
                      <div key={copy.copyId} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedCopiesToRemove.includes(copy.copyId) ? 'bg-red-500/10 border-red-500' : 'bg-transparent border-gray-200 dark:border-gray-700'}`}
                           onClick={() => {
                             if (selectedCopiesToRemove.includes(copy.copyId)) {
                               setSelectedCopiesToRemove(prev => prev.filter(id => id !== copy.copyId));
                             } else {
                               setSelectedCopiesToRemove(prev => [...prev, copy.copyId]);
                             }
                           }}
                      >
                        <span className="font-mono font-bold">{copy.copyId}</span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedCopiesToRemove.includes(copy.copyId) ? 'bg-red-500 border-red-500' : 'border-gray-400'}`}>
                          {selectedCopiesToRemove.includes(copy.copyId) && <div className="w-2 h-2 bg-white rounded-full"/>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button onClick={() => setShowStockModal(null)} className="px-4 py-2 rounded-lg font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
                    <button 
                      disabled={selectedCopiesToRemove.length === 0}
                      onClick={async () => {
                        // Loop delete for selected copies
                        for (const id of selectedCopiesToRemove) {
                          await fetch(`${API_BASE}/api/library/physical/copy/${id}`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${sessionToken}` }
                          });
                        }
                        triggerPopup(`Removed ${selectedCopiesToRemove.length} copies`, "success");
                        setShowStockModal(null);
                        fetchPhysicalData();
                      }}
                      className="px-6 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg font-bold shadow-lg"
                    >
                      Delete Selected ({selectedCopiesToRemove.length})
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: EDIT RESOURCE --- */}
{editingResource && (
<div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[90] p-4">
    <div className={`animate-modal-pop rounded-2xl w-full max-w-2xl border shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden ${modalThemeClass}`}>
    <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50'}`}>
        <h2 className="text-2xl font-bold flex items-center gap-2">
            <Pencil size={20} className="text-purple-500"/> Edit Resource
        </h2>
        <button onClick={() => setEditingResource(null)} className="bg-gray-500/20 text-gray-500 rounded-full p-2 hover:bg-gray-500/30">✕</button>
    </div>
    
    <div className={`p-8 overflow-y-auto ${isDarkMode ? 'bg-gray-900/30' : 'bg-gray-50/50'}`}>
        <form onSubmit={handleUpdateResource} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Title</label>
                <input required className={`w-full rounded-xl p-3 outline-none border focus:border-purple-500 ${glassInputClass}`} 
                    value={editingResource.title} 
                    onChange={e => setEditingResource({...editingResource, title: e.target.value})} />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Author</label>
                <input required className={`w-full rounded-xl p-3 outline-none border focus:border-purple-500 ${glassInputClass}`} 
                    value={editingResource.author} 
                    onChange={e => setEditingResource({...editingResource, author: e.target.value})} />
            </div>
        </div>

        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">URL</label>
            <input required type="url" className={`w-full rounded-xl p-3 outline-none border focus:border-purple-500 ${glassInputClass}`} 
                value={editingResource.url} 
                onChange={e => setEditingResource({...editingResource, url: e.target.value})} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Dept</label>
                <select className={`w-full rounded-xl p-3 outline-none border focus:border-purple-500 ${glassInputClass} ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
                    value={editingResource.department} 
                    onChange={e => setEditingResource({...editingResource, department: e.target.value})}>
                    {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Type</label>
                <select className={`w-full rounded-xl p-3 outline-none border focus:border-purple-500 ${glassInputClass} ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
                    value={editingResource.type} 
                    onChange={e => setEditingResource({...editingResource, type: e.target.value})}>
                    <option>Notes</option><option>Book</option><option>Paper</option><option>Video</option><option>Article</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Semester</label>
                <input type="number" min="1" max="10" className={`w-full rounded-xl p-3 outline-none border focus:border-purple-500 ${glassInputClass}`} 
                    value={editingResource.semester} 
                    onChange={e => setEditingResource({...editingResource, semester: e.target.value})} />
            </div>
        </div>

        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
            <textarea className={`w-full rounded-xl p-3 outline-none border focus:border-purple-500 h-24 resize-none ${glassInputClass}`} 
                value={editingResource.description} 
                onChange={e => setEditingResource({...editingResource, description: e.target.value})}></textarea>
        </div>

        <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setEditingResource(null)} className="px-6 py-2.5 rounded-xl font-bold text-gray-400 hover:text-gray-500">Cancel</button>
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg">Update</button>
        </div>
        </form>
    </div>
    </div>
</div>
)}

{resourceToDelete && (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border transform transition-all scale-100 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-white'}`}>
        
        <div className="flex flex-col items-center text-center mb-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-inner ${isDarkMode ? 'bg-red-500/10 text-red-500' : 'bg-red-50 text-red-500'}`}>
            <Clock size={40} strokeWidth={1.5} />
          </div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Schedule Deletion?</h2>
          <p className={`mt-2 text-sm max-w-[80%] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            You are about to remove <strong>"{resourceToDelete.title}"</strong>.
          </p>
        </div>

        {/* 24-HOUR DISCLAIMER BOX */}
        <div className={`rounded-2xl p-5 mb-8 flex items-start gap-4 text-left ${isDarkMode ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-100'}`}>
          <ShieldAlert className={`w-6 h-6 shrink-0 mt-0.5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
          <div>
            <h4 className={`font-bold text-sm uppercase tracking-wide ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>24-Hour Safety Buffer</h4>
            <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? 'text-red-300/70' : 'text-red-600/80'}`}>
              This resource will be moved to the Trash state. It will be <strong>permanently destroyed</strong> automatically after 24 hours if not restored.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setResourceToDelete(null)}
            className={`flex-1 py-4 rounded-xl font-bold text-sm transition-colors ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
          >
            Cancel
          </button>

          <button
            onClick={confirmScheduleDelete}
            className="flex-1 py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg shadow-red-500/30 transition-all active:scale-95"
          >
            Start 24h Timer
          </button>
        </div>
      </div>
    </div>
)}

    </div>
  );
};





export default DigitalLibrary;