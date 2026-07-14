import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { School, ArrowRight, ShieldCheck, MapPin, Building, Star } from "lucide-react";
import axios from "axios";
import { API_BASE } from "@/utils/config";
import SEOHead from "@/components/common/SEOHead";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { trackEvent } from "@/utils/trackEvent";

const InstituteLandingPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchInstitute = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/institutes/${slug}`);
        setInstitute(res.data);
        setError(false);
        // Track the institute view event in GA4
        trackEvent('institute_page_view', { institute_slug: slug });
      } catch (err) {
        console.error("Error fetching institute:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchInstitute();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a051d] text-white">
        <LoadingSpinner message="Entering college portal..." />
      </div>
    );
  }

  if (error || !institute) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a051d] text-white px-4">
        <div className="max-w-md w-full text-center p-8 rounded-2xl border border-red-500/20 bg-red-950/10 backdrop-blur-xl">
          <School className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Portal Not Found</h1>
          <p className="text-gray-400 mb-6">
            The college portal for "{slug}" is either inactive, unpublished, or does not exist.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
          >
            Go back to Homepage
          </button>
        </div>
      </div>
    );
  }

  const logoUrl = institute.logoUrl ? `${API_BASE}/${institute.logoUrl}` : null;
  const canonicalUrl = `https://noteloom.com/institutes/${slug}`;

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": institute.name,
    "url": canonicalUrl,
    "logo": logoUrl || "https://noteloom.com/og-default.png",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": institute.location || "India",
      "addressCountry": "IN"
    },
    "description": `Access exams, notes, classes, and library for ${institute.name} on NoteLoom.`
  };

  return (
    <div className="min-h-screen bg-[#0a051d] text-white font-sans flex flex-col justify-between relative overflow-hidden">
      <SEOHead
        title={`${institute.name} - NoteLoom Portal`}
        description={`Official NoteLoom portal for ${institute.name}. Access exam dashboards, course notes, library catalogues, and faculty routines.`}
        canonicalUrl={canonicalUrl}
        ogImage={logoUrl}
        schemaData={orgSchema}
      />

      {/* Decorative Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[10%] w-[350px] h-[350px] rounded-full bg-blue-500/10 blur-[80px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[90px]" />
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

      <main className="relative z-10 flex-grow flex items-center justify-center px-6 py-12">
        <div className="max-w-xl w-full p-8 sm:p-10 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          {institute.featured && (
            <div className="absolute top-4 right-4 flex items-center space-x-1 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Partner Institute</span>
            </div>
          )}

          <div className="w-24 h-24 mx-auto mb-6 bg-white/[0.04] border border-white/10 rounded-2xl flex items-center justify-center shadow-inner">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${institute.name} Logo`}
                className="max-w-[80%] max-h-[80%] object-contain"
              />
            ) : (
              <School className="w-12 h-12 text-blue-400" />
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-2 tracking-tight">
            {institute.name}
          </h2>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400 mb-8 font-medium">
            <div className="flex items-center space-x-1 bg-white/[0.03] px-3 py-1 rounded-full border border-white/5">
              <Building className="w-4 h-4 text-indigo-400" />
              <span>{institute.category || "Institution"}</span>
            </div>
            <div className="flex items-center space-x-1 bg-white/[0.03] px-3 py-1 rounded-full border border-white/5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{institute.location || "India"}</span>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => navigate(`/login?code=${institute.collegeCode}`)}
              className="w-full group relative py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold flex items-center justify-center space-x-2 transition-all shadow-lg shadow-blue-500/10"
            >
              <span>Sign In to Student/Faculty Portal</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => navigate("/#contact")}
              className="w-full py-3.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-gray-300 font-semibold transition-all"
            >
              Support & Administration
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center space-x-2 text-xs text-gray-500 border-t border-white/5 pt-6">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Secure Enterprise Login Powered by NoteLoom</span>
          </div>
        </div>
      </main>

      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 text-center text-xs text-gray-600 border-t border-white/5">
        <p>© 2026 NoteLoom Solutions. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default InstituteLandingPage;
