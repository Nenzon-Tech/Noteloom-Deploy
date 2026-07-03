import React, { useState } from "react";
import { useTheme } from "@/context/ThemeContext.jsx";
import LiquidGlassSVGFilter from "@/components/features/landing/LiquidGlassPanel.jsx";
import LandingNavbar from "@/components/features/landing/LandingNavbar.jsx";
import HeroSection from "@/components/features/landing/HeroSection.jsx";
import TrustBar from "@/components/features/landing/TrustBar.jsx";
import FeaturesSection from "@/components/features/landing/FeaturesSection.jsx";
import ContactSection from "@/components/features/landing/ContactSection.jsx";
import HowItWorksSection from "@/components/features/landing/HowItWorksSection.jsx";
import Footer from "@/components/common/Footer.jsx";

const LandingPage = ({ navigate }) => {
  const { isDarkMode } = useTheme();
  const [activeCardIndex, setActiveCardIndex] = useState(null);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0a051d] text-white' : 'bg-[#f8fafc] text-gray-900'
    }`}>
      {/* Liquid Glass SVG Filter Definition (referenced by all glass elements) */}
      <LiquidGlassSVGFilter />

      {/* Navbar */}
      <LandingNavbar navigate={navigate} />

      {/* Hero Section */}
      <HeroSection navigate={navigate} />

      {/* Trust Bar */}
      <TrustBar />

      {/* Bento Grid Features Section */}
      <FeaturesSection 
        activeCardIndex={activeCardIndex} 
        setActiveCardIndex={setActiveCardIndex} 
      />

      {/* Contact Section */}
      <ContactSection />

      {/* How it Works Section */}
      <HowItWorksSection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;