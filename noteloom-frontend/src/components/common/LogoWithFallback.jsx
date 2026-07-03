import React, { useState, useEffect } from 'react';
import { School } from 'lucide-react';

const LogoWithFallback = ({ collegeLogoUrl, collegeName, className, fallbackClassName }) => {
  const [logoError, setLogoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Default Note Loom logo URL
  // Ensure this path matches where your static assets are served from
  const noteLoomLogoUrl = "/webdata/clg-logo/Note-Loom.svg";

  const handleLogoError = () => {
    setLogoError(true);
    setIsLoading(false);
  };

  const handleLogoLoad = () => {
    setIsLoading(false);
  };

  // Reset error state when collegeLogoUrl changes
  useEffect(() => {
    if (collegeLogoUrl) {
      setLogoError(false);
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [collegeLogoUrl]);

  return (
    <div className="relative">
      {isLoading && collegeLogoUrl && (
        <div className={`${className} bg-gray-200 animate-pulse rounded-full flex items-center justify-center`}>
          <School className="w-8 h-8 text-gray-400" />
        </div>
      )}
      
      {collegeLogoUrl && !logoError ? (
        <img
          src={collegeLogoUrl}
          alt={`${collegeName} logo`}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onError={handleLogoError}
          onLoad={handleLogoLoad}
        />
      ) : (
        <img
          src={noteLoomLogoUrl}
          alt="Note Loom Logo"
          className={`${fallbackClassName || className} opacity-100 transition-opacity duration-300`}
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
      )}
    </div>
  );
};

export default LogoWithFallback;