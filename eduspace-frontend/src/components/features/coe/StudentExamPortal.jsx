import { API_BASE } from '@/utils/config';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, AlertCircle, Download, FileText, DollarSign } from 'lucide-react';
import { useSessionManager } from '@/hooks/useSessionManager.js';



const StudentExamPortal = () => {
  const { user, profile } = useSessionManager();
  const [activeSession, setActiveSession] = useState(null);
  const [submittedForm, setSubmittedForm] = useState(null);
  const [view, setView] = useState('form'); // 'form' or 'results'

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    // 1. Get Active Session
    const sessionRes = await axios.get(`${API_BASE}/api/coe/active-session`);
    setActiveSession(sessionRes.data);

    // 2. Check if already submitted
    if (user?._id) {
       const formsRes = await axios.get(`${API_BASE}/api/coe/my-forms/${user._id}`);
       if (formsRes.data.length > 0) setSubmittedForm(formsRes.data[0]);
    }
  };

  const handleSubmit = async () => {
    if (!window.confirm('Confirm subjects and pay fees?')) return;
    
    // Mock Subjects based on user logic
    const mockSubjects = [
        { name: 'Mathematics-I', code: 'M101' },
        { name: 'Physics', code: 'PH101' },
        { name: 'C Programming', code: 'CS101' }
    ];

    try {
        const res = await axios.post(`${API_BASE}/api/coe/submit-exam-form`, {
            sessionId: activeSession._id,
            studentId: user._id,
            studentName: user.name,
            rollNo: profile?.rollNo || 'TEMP123',
            verifiedSubjects: mockSubjects
        });
        if(res.data.success) {
            checkStatus(); // Refresh to show Admit Card
        }
    } catch(err) { alert('Submission Failed'); }
  };

  const AdmitCardView = () => (
    <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center max-w-2xl mx-auto">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4"/>
        <h2 className="text-3xl font-bold text-green-800 mb-2">Exam Form Submitted</h2>
        <p className="text-green-700 mb-6">Your payment was successful and admit card is generated.</p>
        
        <div className="bg-white p-6 rounded shadow-sm text-left mb-6 inline-block w-full">
            <p><strong>Name:</strong> {submittedForm.studentName}</p>
            <p><strong>Roll No:</strong> {submittedForm.rollNo}</p>
            <p><strong>Session:</strong> {submittedForm.sessionId?.sessionName}</p>
            <div className="mt-2 border-t pt-2">
                <strong>Subjects:</strong>
                <ul className="list-disc ml-5 text-sm text-gray-600">
                    {submittedForm.verifiedSubjects.map(s => <li key={s.code}>{s.name} ({s.code})</li>)}
                </ul>
            </div>
        </div>

        <button className="bg-green-600 text-white px-8 py-3 rounded-full font-bold flex items-center justify-center mx-auto gap-2 hover:bg-green-700">
            <Download size={20}/> Download Official Admit Card
        </button>
    </div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto">
       <div className="flex justify-between items-center mb-8">
           <h1 className="text-3xl font-bold">Student Exam Portal</h1>
           <div className="space-x-4">
               <button onClick={() => setView('form')} className={`px-4 py-2 rounded ${view === 'form' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Exam Form</button>
               <button onClick={() => setView('results')} className={`px-4 py-2 rounded ${view === 'results' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>My Results</button>
           </div>
       </div>

       {view === 'form' && (
           <>
              {!activeSession ? (
                  <div className="text-center py-20 bg-gray-50 rounded-xl">
                      <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4"/>
                      <h2 className="text-xl text-gray-500">No Active Exam Session</h2>
                      <p>Please check back later.</p>
                  </div>
              ) : submittedForm ? (
                  <AdmitCardView />
              ) : (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border">
                      <div className="bg-blue-600 p-6 text-white">
                          <h2 className="text-2xl font-bold">{activeSession.sessionName}</h2>
                          <p className="opacity-90">Please verify your subjects and pay the examination fee.</p>
                      </div>
                      <div className="p-8">
                          <div className="mb-6">
                              <h3 className="font-bold text-lg mb-3">1. Verified Subjects</h3>
                              <div className="bg-gray-50 p-4 rounded border">
                                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {/* Mock subjects for display */}
                                      <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500"/> Mathematics-I (M101)</li>
                                      <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500"/> Physics (PH101)</li>
                                      <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500"/> C Programming (CS101)</li>
                                  </ul>
                              </div>
                          </div>
                          
                          <div className="flex items-center justify-between border-t pt-6">
                              <div>
                                  <p className="text-gray-500">Total Exam Fee</p>
                                  <p className="text-4xl font-bold text-blue-600 flex items-center"><DollarSign className="w-8 h-8"/> {activeSession.examFee}</p>
                              </div>
                              <button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-10 py-4 rounded-xl font-bold shadow-lg transition-transform transform hover:scale-105">
                                  Pay Fees & Submit
                              </button>
                          </div>
                      </div>
                  </div>
              )}
           </>
       )}

       {view === 'results' && (
           <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
               <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4"/>
               <h2 className="text-xl font-bold text-gray-600">University Marks System</h2>
               <p className="text-gray-500">No results published for your Roll No yet.</p>
           </div>
       )}
    </div>
  );
};

export default StudentExamPortal;