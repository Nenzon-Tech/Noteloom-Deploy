// src/components/StandaloneViewer.jsx
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ModernPDFViewer from '@/components/common/ModernPDFViewer';

const StandaloneViewer = () => {
  const [searchParams] = useSearchParams();
  const fileUrl = searchParams.get('file');

  // Force dark mode for cinema experience
  const isDarkMode = true; 

  if (!fileUrl) return <div className="bg-gray-900 h-screen flex items-center justify-center text-white">No file specified</div>;

  return (
    <div className="h-screen w-screen bg-gray-900 overflow-hidden">
      {/* Pass isStandalone={true} here */}
      <ModernPDFViewer 
         fileUrl={fileUrl} 
         isDarkMode={isDarkMode} 
         isStandalone={true} 
      />
    </div>
  );
};

export default StandaloneViewer;