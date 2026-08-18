import React, { useState } from "react";

const CollegeBannerLogo = ({ className = "" }) => {
  const [bannerError, setBannerError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Reconstruct config safely from localStorage
  const collegeName =
    localStorage.getItem("selectedCollege") || "EduSpace";

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
        /* ✅ EduSpace brand logo fallback */
        <img
          src="/webdata/clg-logo/Eduspace_name_logo.png"
          alt="EduSpace"
          className="h-8 w-auto max-w-32 object-contain"
        />
      )}
    </div>
  );
};

export default CollegeBannerLogo;
