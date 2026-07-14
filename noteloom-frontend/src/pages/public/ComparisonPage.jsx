import React from "react";
import { Check, X, Shield, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/common/SEOHead";

const ComparisonPage = () => {
  const navigate = useNavigate();

  const comparisonFeatures = [
    {
      name: "Controller of Examinations (CoE)",
      desc: "Comprehensive tools for scheduling sessions, managing university credits, and processing grading registers.",
      noteloom: true,
      classroom: false,
      notion: false
    },
    {
      name: "Automated Admit Card & Marks Sheets",
      desc: "Instantly compile student examination eligibility, print barcode-secured admit cards, and publish semester results.",
      noteloom: true,
      classroom: false,
      notion: false
    },
    {
      name: "Student/Faculty Leave Workflows",
      desc: "Built-in application, approval chains, and balance sheets mapped directly to department allocations.",
      noteloom: true,
      classroom: false,
      notion: "requires-setup"
    },
    {
      name: "Centralized LMS Lecture Sharing",
      desc: "centralized repositories for class lecture note uploads, notes tracking progress, and OCR handwritten scanning.",
      noteloom: true,
      classroom: true,
      notion: "requires-setup"
    },
    {
      name: "RFID & Barcode Digital Library",
      desc: "Integrated cataloging system for issuing physical books, managing due-dates, and processing late fees automatically.",
      noteloom: true,
      classroom: false,
      notion: false
    },
    {
      name: "Automated Student Attendance Marking",
      desc: "Subject-wise attendance sheets with automated alerts for low attendance criteria.",
      noteloom: true,
      classroom: "via-extensions",
      notion: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a051d] text-white font-sans flex flex-col justify-between relative overflow-hidden">
      <SEOHead
        title="NoteLoom vs Google Classroom & Notion for Indian Colleges"
        description="See why NoteLoom is the superior choice for Indian universities and engineering colleges compared to Google Classroom and generic tools like Notion."
        canonicalUrl="https://noteloom.com/comparison/google-classroom-notion"
      />

      {/* Decorative Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[15%] left-[5%] w-[420px] h-[420px] rounded-full bg-blue-500/10 blur-[85px]" />
        <div className="absolute bottom-[20%] right-[5%] w-[480px] h-[480px] rounded-full bg-purple-500/10 blur-[95px]" />
      </div>

      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">NoteLoom</span>
        </div>
        <button
          onClick={() => navigate("/")}
          className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          Noteloom.com
        </button>
      </header>

      <main className="relative z-10 flex-grow max-w-5xl mx-auto w-full px-6 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4 inline-block">
            B2B Feature Comparison
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
            Designed for Campus Operations, <br/>
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Not Just Classrooms</span>
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl leading-relaxed">
            Generic platforms solve simple note distribution. NoteLoom is built from the ground up to power the entire operational lifecycle of Indian universities and colleges.
          </p>
        </div>

        <div className="border border-white/10 bg-white/[0.01] backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl mb-12">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="p-5 sm:p-6 text-gray-300 font-bold text-sm uppercase tracking-wider w-[40%]">Feature</th>
                  <th className="p-5 sm:p-6 text-blue-400 font-bold text-base text-center w-[20%]">NoteLoom</th>
                  <th className="p-5 sm:p-6 text-gray-400 font-bold text-sm text-center w-[20%]">Google Classroom</th>
                  <th className="p-5 sm:p-6 text-gray-400 font-bold text-sm text-center w-[20%]">Notion</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 sm:p-6">
                      <p className="font-bold text-gray-200 text-base mb-1">{feature.name}</p>
                      <p className="text-xs text-gray-500 leading-normal">{feature.desc}</p>
                    </td>
                    <td className="p-5 sm:p-6 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <Check className="w-5 h-5" />
                      </div>
                    </td>
                    <td className="p-5 sm:p-6 text-center text-sm">
                      {feature.classroom === true ? (
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          <Check className="w-5 h-5" />
                        </div>
                      ) : feature.classroom === false ? (
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
                          <X className="w-5 h-5" />
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 bg-white/[0.03] px-2.5 py-1 rounded-md border border-white/5 font-medium">
                          {feature.classroom}
                        </span>
                      )}
                    </td>
                    <td className="p-5 sm:p-6 text-center text-sm">
                      {feature.notion === true ? (
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          <Check className="w-5 h-5" />
                        </div>
                      ) : feature.notion === false ? (
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
                          <X className="w-5 h-5" />
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 bg-white/[0.03] px-2.5 py-1 rounded-md border border-white/5 font-medium">
                          {feature.notion}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-8 sm:p-10 rounded-3xl border border-blue-500/20 bg-blue-950/10 backdrop-blur-2xl flex flex-col sm:flex-row items-center justify-between text-left">
          <div className="mb-6 sm:mb-0 sm:mr-8 max-w-xl">
            <h3 className="text-xl sm:text-2xl font-bold mb-2 flex items-center">
              <Shield className="w-6 h-6 text-blue-400 mr-2" />
              <span>Ready to transform your campus?</span>
            </h3>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Explore how NoteLoom can digitize your institute's attendance, lecture delivery, leaving workflows, and exam routines in 48 hours.
            </p>
          </div>
          <button
            onClick={() => navigate("/#contact")}
            className="whitespace-nowrap px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center space-x-2 transition-all shadow-lg shadow-blue-500/20"
          >
            <span>Request Campus Demo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 text-center text-xs text-gray-600 border-t border-white/5">
        <p>© 2026 NoteLoom Solutions. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ComparisonPage;
