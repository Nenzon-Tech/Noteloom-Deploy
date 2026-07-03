import React, { useState } from "react";

const CollegeBannerLogo = ({ className = "" }) => {
  const [bannerError, setBannerError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Reconstruct config safely from localStorage
  const collegeName =
    localStorage.getItem("selectedCollege") || "Note Loom";

  const logoUrl = localStorage.getItem("selectedCollegeLogo");
  const bannerUrl = null; // keep for future use if needed

  const showBanner = bannerUrl && !bannerError;
  const showLogo = logoUrl && !logoError;

  return (
    <div className={`flex items-center ${className}`}>
      {showBanner || showLogo ? (
        <img
          src={showBanner ? bannerUrl : logoUrl}
          alt={collegeName}
          className="h-8 w-auto max-w-32 object-contain"
          onError={() => {
            if (showBanner) setBannerError(true);
            else setLogoError(true);
          }}
        />
      ) : (
        /* ✅ Gradient fallback text */
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent select-none">
          Note Loom
        </span>
      )}
    </div>
  );
};

export default CollegeBannerLogo;
