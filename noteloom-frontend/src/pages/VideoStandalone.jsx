// src/pages/VideoStandalone.jsx
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CustomVideoPlayer from '@/components/common/CustomVideoPlayer';

const VideoStandalone = () => {
  const [searchParams] = useSearchParams();
  const videoUrl = searchParams.get('url');
  const title = searchParams.get('title') || 'Video Player';
  const allowDownload = searchParams.get('allowDownload') === 'true';

  // --- 3. Update Browser Tab Title ---
  useEffect(() => {
    document.title = title;
    return () => {
      document.title = 'Classroom'; // Reset when leaving (optional)
    };
  }, [title]);

  if (!videoUrl) return <div className="bg-black h-screen text-white flex items-center justify-center">Invalid Video Link</div>;

  return (
    <div className="w-screen h-screen bg-black overflow-hidden">
      <CustomVideoPlayer 
        videoUrl={videoUrl} 
        title={title} 
        isStandalone={true} 
        allowDownload={allowDownload} 
      />
    </div>
  );
};

export default VideoStandalone;