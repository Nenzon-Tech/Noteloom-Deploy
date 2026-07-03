import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Download, User, Mail, Phone, ShieldCheck, 
  GraduationCap, Eye, CreditCard, CheckCircle, Calendar, 
  Printer, X, Smartphone, FileText, ChevronRight, Wifi
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
   1. MOCK DATA (Ledger Template)
   ========================================================================= */

const paymentStatsTemplate = {
  totalCourseFee: "6,80,000", 
  totalPaid: "4,25,000",      
  completionPercentage: 62.5
};

const semesterFees = [
  {
    id: "SEM_01", semester: "1st Semester", tuitionFee: "85,000", busFee: "0", hostelFee: "0", fine: "0",
    dueDate: "10-Jul-2023", status: "PAID", paidOn: "08-Jul-2023", receiptId: "RCPT_1001", transactionId: "TXN_8821901"
  },
  {
    id: "SEM_02", semester: "2nd Semester", tuitionFee: "85,000", busFee: "0", hostelFee: "0", fine: "0",
    dueDate: "10-Jan-2024", status: "PAID", paidOn: "05-Jan-2024", receiptId: "RCPT_1002", transactionId: "TXN_8821902"
  },
  {
    id: "SEM_03", semester: "3rd Semester", tuitionFee: "85,000", busFee: "5,000", hostelFee: "0", fine: "0",
    dueDate: "10-Jul-2024", status: "PAID", paidOn: "12-Jul-2024", receiptId: "RCPT_1003", transactionId: "TXN_8821903"
  },
  {
    id: "SEM_04", semester: "4th Semester", tuitionFee: "85,000", busFee: "0", hostelFee: "0", fine: "150",
    dueDate: "10-Jan-2025", status: "PAID", paidOn: "15-Jan-2025", receiptId: "RCPT_1004", transactionId: "TXN_8821904"
  },
  {
    id: "SEM_05", semester: "5th Semester", tuitionFee: "85,000", busFee: "5,000", hostelFee: "0", fine: "0",
    dueDate: "10-Jul-2025", status: "PAID", paidOn: "05-Jul-2025", receiptId: "RCPT_1005", transactionId: "TXN_8821905"
  },
  {
    id: "SEM_06", semester: "6th Semester", tuitionFee: "85,000", busFee: "0", hostelFee: "0", fine: "0",
    dueDate: "10-Jan-2026", status: "DUE", paidOn: null, receiptId: null, transactionId: null
  },
  {
    id: "SEM_07", semester: "7th Semester", tuitionFee: "85,000", busFee: "0", hostelFee: "0", fine: "0",
    dueDate: "10-Jul-2026", status: "UPCOMING", paidOn: null, receiptId: null, transactionId: null
  },
  {
    id: "SEM_08", semester: "8th Semester", tuitionFee: "85,000", busFee: "0", hostelFee: "0", fine: "0",
    dueDate: "10-Jan-2027", status: "UPCOMING", paidOn: null, receiptId: null, transactionId: null
  }
];

/* =========================================================================
   2. SUB-COMPONENTS
   ========================================================================= */

// --- 2.1 Profile & Progress Card ---
const PaymentProfileCard = ({ studentInfo, isDarkMode, theme }) => (
  <div className="space-y-6 no-print">
    <div className={`group relative border rounded-[2rem] p-6 shadow-xl overflow-hidden transition-all duration-300 ${theme.cardBg}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="relative mb-5">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-40"></div>
          <div className={`relative w-24 h-24 rounded-full border-2 p-1 flex items-center justify-center ${isDarkMode ? 'bg-[#12141d] border-gray-700' : 'bg-white border-gray-200'}`}>
             <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center overflow-hidden">
                <div className="text-3xl font-bold text-white uppercase">{studentInfo.name.charAt(0)}</div>
             </div>
          </div>
          <div className={`absolute -bottom-2 -right-2 p-1.5 rounded-full border-2 shadow-lg ${isDarkMode ? 'bg-blue-600 border-[#12141d] text-white' : 'bg-blue-500 border-white text-white'}`}>
             <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <h2 className={`text-xl font-bold tracking-tight mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{studentInfo.fullName}</h2>
        <p className="text-sm text-blue-500 font-semibold mb-4">{studentInfo.course}</p>
        <div className="w-full space-y-3">
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${theme.inputBg}`}>
            <User className="w-4 h-4 opacity-60" />
            <span className="text-sm font-mono tracking-tight font-medium truncate">{studentInfo.enrollmentNo}</span>
          </div>
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${theme.inputBg}`}>
            <Mail className="w-4 h-4 opacity-60" />
            <span className="text-sm truncate font-medium">{studentInfo.email}</span>
          </div>
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${theme.inputBg}`}>
            <Phone className="w-4 h-4 opacity-60" />
            <span className="text-sm font-mono font-medium">{studentInfo.phone}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div className={`border rounded-3xl p-6 relative overflow-hidden shadow-md ${isDarkMode ? 'bg-indigo-950/20 border-indigo-500/20' : 'bg-indigo-50/50 border-indigo-200'}`}>
       <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-800'}`}>
        <GraduationCap className="w-4 h-4" /> Fee Progress
      </h3>
      <div className="flex justify-between items-end mb-2">
        <span className={`text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-indigo-900'}`}>{paymentStatsTemplate.completionPercentage}%</span>
        <span className={`text-xs font-semibold mb-1 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>Complete</span>
      </div>
      <div className={`w-full h-3 rounded-full overflow-hidden mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${paymentStatsTemplate.completionPercentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600" 
        />
      </div>
      <div className={`flex justify-between text-xs pt-3 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
        <div>
          <p className={`uppercase text-[10px] font-bold mb-1 ${isDarkMode ? 'text-indigo-400/70' : 'text-indigo-600/70'}`}>Paid</p>
          <p className={`font-mono font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{paymentStatsTemplate.totalPaid}</p>
        </div>
        <div className="text-right">
          <p className={`uppercase text-[10px] font-bold mb-1 ${isDarkMode ? 'text-indigo-400/70' : 'text-indigo-600/70'}`}>Total</p>
          <p className={`font-mono font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{paymentStatsTemplate.totalCourseFee}</p>
        </div>
      </div>
    </div>
  </div>
);

// --- 2.2 Fee Ledger Table ---
const FeeLedgerTable = ({ onPay, onViewReceipt, onPrintReceipt, isDarkMode, theme }) => (
  <div className={`border rounded-3xl overflow-hidden shadow-xl no-print ${theme.cardBg}`}>
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className={`border-b text-xs uppercase tracking-wider ${isDarkMode ? 'bg-gray-800/30 border-gray-700/50 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
            <th className="p-5 font-bold whitespace-nowrap">Semester</th>
            <th className="p-5 font-semibold whitespace-nowrap">Sem Fees</th>
            <th className="p-5 font-semibold whitespace-nowrap">Bus Fare</th>
            <th className="p-5 font-semibold whitespace-nowrap">Hostel</th>
            <th className="p-5 font-semibold whitespace-nowrap text-red-500">Late Fine</th>
            <th className="p-5 font-semibold whitespace-nowrap">Due Date</th>
            <th className="p-5 font-semibold text-center whitespace-nowrap">Action</th>
            <th className="p-5 font-semibold text-center whitespace-nowrap">Receipt</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800/50' : 'divide-gray-100'}`}>
          {semesterFees.map((row, index) => {
            const isPaid = row.status === 'PAID';
            const isDue = row.status === 'DUE';
            
            return (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                key={row.id} 
                className={`transition-colors ${isPaid ? (isDarkMode ? 'hover:bg-green-500/5' : 'hover:bg-green-50/30') : isDue ? (isDarkMode ? 'bg-blue-500/5 hover:bg-blue-500/10' : 'bg-blue-50/50 hover:bg-blue-100/40') : (isDarkMode ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50')}`}
              >
                <td className="p-5">
                  <p className={`font-bold text-sm ${isPaid ? (isDarkMode ? 'text-gray-300' : 'text-gray-700') : isDue ? 'text-blue-500' : 'text-gray-400'}`}>{row.semester}</p>
                  {isPaid && <p className="text-[10px] text-green-500 flex items-center gap-1 mt-1 font-mono font-bold"><CheckCircle className="w-3 h-3"/> Paid on {row.paidOn}</p>}
                </td>
                <td className={`p-5 font-mono text-sm ${isPaid ? (isDarkMode ? 'text-gray-300' : 'text-gray-600') : isDue ? (isDarkMode ? 'text-white font-bold' : 'text-gray-900 font-bold') : 'text-gray-400'}`}>₹{row.tuitionFee}</td>
                <td className={`p-5 font-mono text-sm ${row.busFee !== "0" ? 'text-orange-400' : 'text-gray-400'}`}>₹{row.busFee}</td>
                <td className={`p-5 font-mono text-sm ${row.hostelFee !== "0" ? 'text-orange-400' : 'text-gray-400'}`}>₹{row.hostelFee}</td>
                <td className={`p-5 font-mono text-sm ${row.fine !== "0" ? 'text-red-500 font-bold' : 'text-gray-400'}`}>₹{row.fine}</td>
                <td className="p-5">
                  <div className={`flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full w-fit ${isPaid ? (isDarkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-400') : isDue ? 'bg-red-500/10 text-red-500 border border-red-500/20' : (isDarkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-400')}`}>
                    <Calendar className="w-3 h-3" /> {row.dueDate}
                  </div>
                </td>
                <td className="p-5 text-center">
                  {isPaid ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold uppercase tracking-wider">Paid</span>
                  ) : row.status === 'UPCOMING' ? (
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Locked</span>
                  ) : (
                    <button onClick={() => onPay(row)} className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-blue-600/20">
                      <CreditCard className="w-4 h-4" /> Pay Now
                    </button>
                  )}
                </td>
                <td className="p-5 text-center">
                  {isPaid ? (
                    <div className="flex justify-center gap-2">
                      <button onClick={(e) => onViewReceipt(row, e)} className={`p-2 rounded-lg border transition-colors ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-blue-400 border-gray-700' : 'bg-gray-50 hover:bg-gray-100 text-blue-600 border-gray-200'}`} title="View Digital Receipt">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => onPrintReceipt(row)} className={`p-2 rounded-lg border transition-colors ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700' : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200'}`} title="Print PDF">
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className={`w-8 h-1 mx-auto rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} /> 
                  )}
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

// --- 2.3 Modals ---
const SimpleModal = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm no-print" onClick={onClose} />
    <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="relative z-10 w-full max-w-md">
      {children}
    </motion.div>
  </div>
);

const PaymentGatewayModal = ({ semester, onClose, isDarkMode }) => {
  if (!semester) return null;
  const totalDue = parseInt(semester.tuitionFee.replace(/,/g, '')) + parseInt(semester.hostelFee.replace(/,/g, '')) + parseInt(semester.busFee.replace(/,/g, '')) + parseInt(semester.fine.replace(/,/g, ''));

  return (
    <div className={`w-full relative flex flex-col border rounded-3xl overflow-hidden shadow-2xl ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}> 
      <div className={`p-6 border-b flex justify-between items-start ${isDarkMode ? 'border-gray-800 bg-gray-950/40' : 'border-gray-100 bg-gray-50'}`}>
        <div>
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-950'}`}>Payment Gateway</h3>
          <p className="text-gray-400 text-sm mt-1">Completing payment for <span className="text-blue-500 font-semibold">{semester.semester}</span></p>
        </div>
        <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><X className="w-5 h-5" /></button>
      </div>
      <div className={`p-6 text-center border-b ${isDarkMode ? 'bg-blue-900/5 border-gray-800' : 'bg-blue-50/50 border-gray-100'}`}>
        <p className="text-gray-400 text-xs font-bold uppercase mb-1">Total Payable Amount</p>
        <div className={`text-4xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{totalDue.toLocaleString()}</div>
      </div>
      <div className="p-6 space-y-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Select Payment Method</p>
        <button onClick={() => { alert('Payment Gateway Integration Pending'); onClose(); }} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all group ${isDarkMode ? 'bg-gray-800/50 hover:bg-gray-800 border-gray-700 hover:border-blue-500/50' : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-blue-500/50'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><Smartphone className="w-5 h-5" /></div>
            <div className="text-left"><p className={`text-sm font-bold group-hover:text-blue-500 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>UPI / QR Code</p><p className="text-xs text-gray-400">GooglePay, PhonePe</p></div>
          </div>
          <div className={`w-4 h-4 rounded-full border transition-colors ${isDarkMode ? 'border-gray-600 group-hover:border-blue-500' : 'border-gray-300 group-hover:border-blue-500'}`} />
        </button>
        <button onClick={() => { alert('Payment Gateway Integration Pending'); onClose(); }} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all group ${isDarkMode ? 'bg-gray-800/50 hover:bg-gray-800 border-gray-700 hover:border-blue-500/50' : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-blue-500/50'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><CreditCard className="w-5 h-5" /></div>
            <div className="text-left"><p className={`text-sm font-bold group-hover:text-blue-500 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Credit / Debit Card</p><p className="text-xs text-gray-400">Visa, Mastercard</p></div>
          </div>
          <div className={`w-4 h-4 rounded-full border transition-colors ${isDarkMode ? 'border-gray-600 group-hover:border-blue-500' : 'border-gray-300 group-hover:border-blue-500'}`} />
        </button>
      </div>
      <div className={`p-6 border-t ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50/50 border-gray-100'}`}>
        <button onClick={() => { alert('Payment Gateway Integration Pending'); onClose(); }} className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wide transition-colors">
          Proceed to Pay
        </button>
      </div>
    </div>
  );
};

const ReceiptModal = ({ receipt, studentInfo, onClose, onPrint }) => {
  if (!receipt) return null;
  const totalPaid = parseInt(receipt.tuitionFee.replace(/,/g, '')) + parseInt(receipt.hostelFee.replace(/,/g, '')) + parseInt(receipt.busFee.replace(/,/g, '')) + parseInt(receipt.fine.replace(/,/g, ''));

  return (
    <div className="w-full h-full relative flex flex-col bg-white text-gray-950 rounded-3xl printable-receipt shadow-2xl border border-gray-200 overflow-hidden">
      <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10 no-print">
        <X className="w-5 h-5 text-gray-500" />
      </button>
      
      <div id="receipt-print-area" className="p-8">
        <div className="text-center border-b-2 border-gray-800 pb-6 mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FileText className="w-7 h-7 text-indigo-900" />
            <h2 className="text-2xl font-black tracking-widest uppercase text-gray-900">Official Receipt</h2>
          </div>
          <p className="text-xs font-bold text-gray-500 tracking-[0.2em] uppercase">Institute of Engineering & Management</p>
        </div>

        <div className="flex justify-between text-xs mb-8 bg-gray-50 p-4 border border-gray-200 rounded-xl">
          <div className="space-y-1">
            <p><span className="font-bold text-gray-500 uppercase">STUDENT:</span> {studentInfo.fullName}</p>
            <p><span className="font-bold text-gray-500 uppercase">ENROLLMENT:</span> <span className="font-mono">{studentInfo.enrollmentNo}</span></p>
            <p><span className="font-bold text-gray-500 uppercase">COURSE:</span> {studentInfo.course}</p>
          </div>
          <div className="space-y-1 text-right">
            <p><span className="font-bold text-gray-500 uppercase">RECEIPT NO:</span> <span className="font-mono font-bold text-indigo-900">{receipt.receiptId}</span></p>
            <p><span className="font-bold text-gray-500 uppercase">DATE:</span> {receipt.paidOn}</p>
            <p><span className="font-bold text-gray-500 uppercase">STATUS:</span> <span className="text-green-600 font-extrabold">SUCCESSFUL</span></p>
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
            <tr><td className="py-3.5 pl-3 text-gray-700">Semester Tuition Fee ({receipt.semester})</td><td className="py-3.5 pr-3 text-right font-mono font-medium">₹{receipt.tuitionFee}</td></tr>
            <tr><td className="py-3.5 pl-3 text-gray-700">Transport Fee (Bus)</td><td className="py-3.5 pr-3 text-right font-mono font-medium">₹{receipt.busFee}</td></tr>
            <tr><td className="py-3.5 pl-3 text-gray-700">Hostel Fee</td><td className="py-3.5 pr-3 text-right font-mono font-medium">₹{receipt.hostelFee}</td></tr>
            {receipt.fine !== "0" && <tr><td className="py-3.5 pl-3 text-red-600 font-semibold">Late Fine</td><td className="py-3.5 pr-3 text-right text-red-600 font-mono font-medium">₹{receipt.fine}</td></tr>}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-800 bg-gray-50">
              <td className="py-4 pl-3 font-bold text-gray-900 text-base">TOTAL PAID</td>
              <td className="py-4 pr-3 text-right font-bold text-lg text-indigo-900 font-mono">₹{totalPaid.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <div className="text-[10px] text-gray-400 text-center mt-8 border-t border-gray-200 pt-4">
          <p className="font-mono">TXN_ID: {receipt.transactionId || 'TXN_GENERIC_123'}</p>
          <p className="mt-1">This is a computer generated digital receipt. Authorized signature is not required.</p>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-200 no-print">
          <button onClick={() => onPrint(receipt)} className="w-full bg-indigo-900 text-white py-3 rounded-xl font-bold hover:bg-indigo-950 transition-colors flex items-center justify-center gap-2">
            <Printer className="w-5 h-5" /> Print / PDF Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   3. MAIN COMPONENT (Page Assembly)
   ========================================================================= */

const PaymentHistory = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { user, profile, loading } = useSessionManager();
  
  const [selectedPayment, setSelectedPayment] = useState(null); 
  const [viewReceipt, setViewReceipt] = useState(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handlePayClick = (row) => setSelectedPayment(row);
  const handleViewClick = (row, e) => {
    e.stopPropagation();
    setViewReceipt(row);
  };
  const closeModals = () => {
    setSelectedPayment(null);
    setViewReceipt(null);
  };

  const handlePrintReceipt = (row) => {
    setViewReceipt(row);
    setTimeout(() => { window.print(); }, 300);
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <LoadingSpinner message="Loading Fee Records..." />
      </div>
    );
  }

  // Load user data dynamically
  const studentInfo = {
    name: user?.name ? user.name.split(' ')[0] : "Student",
    fullName: user?.name || "Student",
    enrollmentNo: profile?.uid || user?.uid || "12024001001",
    registrationNo: profile?.registrationNo || "2023001122",
    phone: "+91 98765 43210",
    email: user?.email || "student@college.edu", 
    course: profile?.stream || "B.Tech - Computer Science",
    batch: profile?.batch || "2023 - 2027"
  };

  const theme = {
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    cardBg: isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white border-gray-200',
    inputBg: isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200',
  };

  return (
    <div className={`min-h-screen font-sans p-4 md:p-8 pb-32 relative transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`fixed top-0 left-0 w-full h-[300px] pointer-events-none ${isDarkMode ? 'bg-gradient-to-b from-blue-900/10 to-transparent' : 'bg-gradient-to-b from-blue-100/30 to-transparent'}`} />
      
      {/* CSS for printing only the receipt */}
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
                <span className="text-blue-500">Fee Ledger</span>
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
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">Fee Management</h1>
            <p className="text-gray-500 text-sm mt-1">Track your semester ledger payments and download official receipts</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => alert('Statement download initiated')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 border-gray-200 text-gray-700 shadow-sm'}`}>
              <Download className="w-4 h-4" /> Download Statement
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
             <PaymentProfileCard studentInfo={studentInfo} isDarkMode={isDarkMode} theme={theme} />
          </div>
          <div className="lg:col-span-8">
            <FeeLedgerTable 
              onPay={handlePayClick}
              onViewReceipt={handleViewClick}
              onPrintReceipt={handlePrintReceipt}
              isDarkMode={isDarkMode}
              theme={theme}
            />
          </div>
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {selectedPayment && (
          <SimpleModal onClose={closeModals}>
            <PaymentGatewayModal semester={selectedPayment} onClose={closeModals} isDarkMode={isDarkMode} />
          </SimpleModal>
        )}

        {viewReceipt && (
          <SimpleModal onClose={closeModals}>
             <ReceiptModal receipt={viewReceipt} studentInfo={studentInfo} onClose={closeModals} onPrint={() => window.print()} />
          </SimpleModal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentHistory;