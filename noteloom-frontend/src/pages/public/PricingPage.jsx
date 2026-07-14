import React from "react";
import { Check, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/common/SEOHead";

const PricingPage = () => {
  const navigate = useNavigate();

  const pricingTiers = [
    {
      name: "Individual Student",
      price: "₹49",
      period: "per month",
      desc: "For college students wanting to accelerate their learning with powerful AI note assistants.",
      features: [
        "Interactive AI mind-mapping tools",
        "Tesseract OCR scanned note upload",
        "Personalized exam routines & calendars",
        "Direct peer-to-peer note sharing",
        "Lightweight UI with dark/light mode toggle",
        "Up to 2GB cloud note storage"
      ],
      buttonText: "Get Started Now",
      action: () => navigate("/login"),
      popular: false
    },
    {
      name: "Institution (B2B SaaS)",
      price: "Custom Quote",
      period: "annual licensing",
      desc: "Comprehensive platform deployment for entire engineering colleges, universities, and institutes.",
      features: [
        "All Individual features for all students",
        "Full department & user permission layers",
        "Controller of Examinations (CoE) dashboard",
        "Automated admit card & marks generation",
        "Faculty leave & attendance management",
        "Digital library catalogs with RFID/barcode capability",
        "Dedicated cloud database instance",
        "99.9% uptime SLA & 24/7 dedicated support"
      ],
      buttonText: "Schedule B2B Demo",
      action: () => navigate("/#contact"),
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a051d] text-white font-sans flex flex-col justify-between relative overflow-hidden">
      <SEOHead
        title="Pricing Plans for Colleges and Students | NoteLoom"
        description="Explore NoteLoom's flexible B2B SaaS pricing plans for engineering campuses, colleges, and tailored plans for individual students."
        canonicalUrl="https://noteloom.com/pricing"
      />

      {/* Decorative Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] right-[5%] w-[450px] h-[450px] rounded-full bg-blue-500/10 blur-[90px]" />
        <div className="absolute bottom-[30%] left-[5%] w-[420px] h-[420px] rounded-full bg-purple-500/10 blur-[85px]" />
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

      <main className="relative z-10 flex-grow max-w-7xl mx-auto w-full px-6 py-16 flex flex-col items-center justify-center">
        <div className="text-center max-w-2xl mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">
            Transparent Pricing, <br/>
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Built for Education</span>
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl">
            Choose the perfect plan to streamline notes, scheduling, and admin workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-10">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`p-8 sm:p-10 rounded-3xl border backdrop-blur-2xl transition-all duration-300 flex flex-col justify-between relative ${
                tier.popular
                  ? "border-blue-500 bg-blue-500/[0.02] shadow-[0_0_50px_-12px_rgba(59,130,246,0.15)] scale-105 md:scale-105"
                  : "border-white/10 bg-white/[0.01]"
              }`}
            >
              {tier.popular && (
                <span className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                  Most Popular
                </span>
              )}

              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2">{tier.name}</h3>
                <p className="text-gray-400 text-sm mb-6">{tier.desc}</p>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">{tier.price}</span>
                  {tier.period && (
                    <span className="text-gray-400 ml-2 text-sm">{tier.period}</span>
                  )}
                </div>

                <div className="border-t border-white/5 pt-6 mb-8">
                  <h4 className="font-semibold text-sm text-gray-300 mb-4">What's Included:</h4>
                  <ul className="space-y-3.5">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start text-sm text-gray-300">
                        <Check className="w-5 h-5 text-blue-400 mr-2.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={tier.action}
                className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
                  tier.popular
                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                    : "bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white"
                }`}
              >
                <span>{tier.buttonText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </main>

      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 text-center text-xs text-gray-600 border-t border-white/5">
        <p>© 2026 NoteLoom Solutions. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PricingPage;
