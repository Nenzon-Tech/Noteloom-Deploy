import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Search, Filter, Download, 
  FileText, CheckCircle2, Calendar, 
  CreditCard, Printer, X, ShieldCheck,
  ChevronRight, Wifi
} from "lucide-react";

// Context & Common Components
import { useTheme } from '@/context/ThemeContext.jsx';
import { useSessionManager } from '@/hooks/useSessionManager.js';
import GlassHeader from '@/components/common/GlassHeader.jsx';
import UserProfileDropdown from '@/components/common/UserProfileDropdown.jsx';
import ThemeToggle from '@/components/common/ThemeToggle.jsx';
import CollegeBannerLogo from '@/components/common/CollegeBannerLogo.jsx';
import LoadingSpinner from '@/components/common/LoadingSpinner';

/* =========================================================================
   1. MOCK DATA (Only PAID records template)
   ========================================================================= */

const PAID_RECEIPTS = [
  {
    id: "RCPT_1001", semester: "1st Semester", tuitionFee: "85,000", busFee: "0", hostelFee: "0", fine: "0",
    paidOn: "08-Jul-2023", transactionId: "TXN_8821901", method: "UPI", status: "SUCCESS"
  },
  {
    id: "RCPT_1002", semester: "2nd Semester", tuitionFee: "85,000", busFee: "0", hostelFee: "0", fine: "0",
    paidOn: "05-Jan-2024", transactionId: "TXN_8821902", method: "Credit Card", status: "SUCCESS"
  },
  {
    id: "RCPT_1003", semester: "3rd Semester", tuitionFee: "85,000", busFee: "5,000", hostelFee: "0", fine: "0",
    paidOn: "12-Jul-2024", transactionId: "TXN_8821903", method: "Net Banking", status: "SUCCESS"
  },
  {
    id: "RCPT_1004", semester: "4th Semester", tuitionFee: "85,000", busFee: "0", hostelFee: "0", fine: "150",
    paidOn: "15-Jan-2025", transactionId: "TXN_8821904", method: "UPI", status: "SUCCESS"
  },
  {
    id: "RCPT_1005", semester: "5th Semester", tuitionFee: "85,000", busFee: "5,000", hostelFee: "0", fine: "0",
    paidOn: "05-Jul-2025", transactionId: "TXN_8821905", method: "Debit Card", status: "SUCCESS"
  }
].reverse(); // Show latest first

/* =========================================================================
   2. SUB-COMPONENTS
   ========================================================================= */

const ReceiptCard = ({ receipt, onView, isDarkMode, theme }) => {
  const totalPaid = parseInt(receipt.tuitionFee.replace(/,/g, '')) + 
                    parseInt(receipt.hostelFee.replace(/,/g, '')) + 
                    parseInt(receipt.busFee.replace(/,/g, '')) + 
                    parseInt(receipt.fine.replace(/,/g, ''));

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={`border rounded-3xl p-5 hover:border-indigo-500/50 transition-all duration-300 group hover:shadow-xl flex flex-col ${theme.cardBg}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
             <FileText className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h3 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{receipt.semester}</h3>
            <p className="text-xs text-gray-400 font-mono">Receipt: {receipt.id}</p>
          </div>
        </div>
        <span className="flex items-center gap-1 bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-1 rounded-lg text-[10px] font-bold uppercase">
          <CheckCircle2 className="w-3 h-3" /> Paid
        </span>
      </div>

      <div className="space-y-3 mb-6 flex-1">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400 flex items-center gap-2"><Calendar className="w-4 h-4" /> Date</span>
          <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{receipt.paidOn}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Method</span>
          <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{receipt.method}</span>
        </div>
        <div className={`flex justify-between items-center text-sm pt-3 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
          <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Total Amount</span>
          <span className={`font-extrabold text-lg ${isDarkMode ? 'text-white' : 'text-indigo-600'}`}>₹{totalPaid.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex gap-2 mt-auto">
        <button 
          onClick={() => onView(receipt)}
          className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-sm'}`}
        >
          <Search className="w-4 h-4" /> View Receipt
        </button>
        <button 
          onClick={() => onView(receipt, true)} // True flag for auto-print
          className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" /> Download
        </button>
      </div>
    </motion.div>
  );
};

const PrintableReceiptModal = ({ receipt, studentInfo, onClose, autoPrint }) => {
  if (!receipt) return null;
  const totalPaid = parseInt(receipt.tuitionFee.replace(/,/g, '')) + parseInt(receipt.hostelFee.replace(/,/g, '')) + parseInt(receipt.busFee.replace(/,/g, '')) + parseInt(receipt.fine.replace(/,/g, ''));

  useEffect(() => {
    if (autoPrint) setTimeout(() => window.print(), 300);
  }, [autoPrint]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm no-print" onClick={onClose} />
      
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative z-10 w-full max-w-lg">
        
        <div className="w-full relative flex flex-col bg-white text-gray-900 rounded-3xl printable-receipt shadow-2xl overflow-hidden border border-gray-200">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10 no-print">
            <X className="w-5 h-5 text-gray-500" />
          </button>
          
          <div id="receipt-print-area" className="p-8">
            <div className="text-center border-b-2 border-gray-800 pb-6 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ShieldCheck className="w-8 h-8 text-indigo-900" />
                <h2 className="text-2xl font-black tracking-widest uppercase text-gray-900">Official Receipt</h2>
              </div>
              <p className="text-xs font-bold text-gray-500 tracking-[0.2em] uppercase">Institute of Engineering & Management</p>
            </div>

            <div className="flex justify-between text-sm mb-8 bg-gray-50 p-4 border border-gray-200 rounded-xl">
              <div className="space-y-1.5">
                <p><span className="font-bold text-gray-500 text-xs uppercase">Student:</span><br/>{studentInfo.fullName}</p>
                <p><span className="font-bold text-gray-500 text-xs uppercase">Enrollment:</span><br/><span className="font-mono">{studentInfo.enrollmentNo}</span></p>
              </div>
              <div className="space-y-1.5 text-right">
                <p><span className="font-bold text-gray-500 text-xs uppercase">Receipt No:</span><br/><span className="font-mono font-bold text-indigo-900">{receipt.id}</span></p>
                <p><span className="font-bold text-gray-500 text-xs uppercase">Date Paid:</span><br/>{receipt.paidOn}</p>
              </div>
            </div>

            <table className="w-full text-sm mb-8">
              <thead>
                <tr className="border-b-2 border-gray-800 bg-gray-100">
                  <th className="py-3 pl-3 text-left font-bold text-gray-700">Fee Description</th>
                  <th className="py-3 pr-3 text-right font-bold text-gray-700">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr><td className="py-3.5 pl-3 text-gray-700">Tuition Fee ({receipt.semester})</td><td className="py-3.5 pr-3 text-right font-mono font-medium">₹{receipt.tuitionFee}</td></tr>
                {receipt.busFee !== "0" && <tr><td className="py-3.5 pl-3 text-gray-700">Transport Fee</td><td className="py-3.5 pr-3 text-right font-mono font-medium">₹{receipt.busFee}</td></tr>}
                {receipt.hostelFee !== "0" && <tr><td className="py-3.5 pl-3 text-gray-700">Hostel Fee</td><td className="py-3.5 pr-3 text-right font-mono font-medium">₹{receipt.hostelFee}</td></tr>}
                {receipt.fine !== "0" && <tr><td className="py-3.5 pl-3 text-red-600">Late Fine</td><td className="py-3.5 pr-3 text-right text-red-600 font-mono font-medium">₹{receipt.fine}</td></tr>}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-800 bg-gray-50">
                  <td className="py-4 pl-3 font-bold text-gray-900">TOTAL AMOUNT PAID</td>
                  <td className="py-4 pr-3 text-right font-bold text-lg text-indigo-900 font-mono">₹{totalPaid.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>

            <div className="text-[10px] text-gray-400 text-center mt-8 border-t border-gray-200 pt-4">
              <p className="font-mono mb-1">TXN_ID: {receipt.transactionId} • METHOD: {receipt.method.toUpperCase()}</p>
              <p>This is a computer generated digital receipt. Authorized signature is not required.</p>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-200 no-print">
              <button onClick={() => window.print()} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2">
                <Printer className="w-5 h-5" /> Print / Save as PDF
              </button>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

/* =========================================================================
   3. MAIN COMPONENT
   ========================================================================= */

const PaymentDetails = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { user, profile, loading } = useSessionManager();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [autoPrint, setAutoPrint] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <LoadingSpinner message="Loading Receipt Vault..." />
      </div>
    );
  }

  // Dynamic Student Info
  const studentInfo = {
    fullName: user?.name || "Student",
    enrollmentNo: profile?.uid || user?.uid || "12024001001",
    course: profile?.stream || "B.Tech - Computer Science & Engineering",
  };

  const filteredReceipts = PAID_RECEIPTS.filter(receipt => 
    receipt.semester.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewReceipt = (receipt, print = false) => {
    setSelectedReceipt(receipt);
    setAutoPrint(print);
  };

  const theme = {
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    cardBg: isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white border-gray-200',
    inputBg: isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200',
  };

  return (
    <div className={`min-h-screen font-sans p-4 md:p-8 pb-32 relative transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`fixed top-0 left-0 w-full h-[300px] pointer-events-none ${isDarkMode ? 'bg-gradient-to-b from-indigo-900/10 to-transparent' : 'bg-gradient-to-b from-blue-100/30 to-transparent'}`} />
      
      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-receipt, .printable-receipt * { visibility: visible; }
          .printable-receipt { 
             position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; 
             background: white; color: black; box-shadow: none; border: none;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* ================= HEADER ================= */}
      <GlassHeader variant="dashboard" className="no-print">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate(-1)} 
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-purple-100 text-purple-600'}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <UserProfileDropdown user={user} onOptionClick={() => {}} />
            <div className="flex flex-col">
              <div className={`flex items-center text-sm font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                <span className="opacity-70">Student Dashboard</span>
                <ChevronRight className="w-4 h-4 mx-1 opacity-50" />
                <span className="text-indigo-500 font-semibold">Receipt Vault</span>
              </div>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${isDarkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                  {profile?.college || 'College'}
                </span>
                <span className="text-[10px] text-green-500 flex items-center">
                  <Wifi className="w-3 h-3 mr-1" />
                  Online
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2"><CollegeBannerLogo /></div>
            <ThemeToggle />
          </div>
        </div>
      </GlassHeader>

      <div className="relative z-10 max-w-7xl mx-auto pt-28 space-y-8 no-print">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">Receipt Vault</h1>
            <p className="text-gray-500 mt-2">View, verify, and download your official fee payment receipts.</p>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:w-72 group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search semester or receipt ID..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all ${theme.inputBg}`}
               />
             </div>
          </div>
        </header>

        {filteredReceipts.length === 0 ? (
          <div className={`text-center py-20 border rounded-3xl ${theme.cardBg}`}>
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-gray-400">No Receipts Found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredReceipts.map((receipt) => (
                <ReceiptCard key={receipt.id} receipt={receipt} onView={handleViewReceipt} isDarkMode={isDarkMode} theme={theme} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedReceipt && (
          <PrintableReceiptModal 
            receipt={selectedReceipt} 
            studentInfo={studentInfo}
            onClose={() => setSelectedReceipt(null)} 
            autoPrint={autoPrint}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentDetails;