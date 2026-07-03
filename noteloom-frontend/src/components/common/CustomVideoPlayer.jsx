// src/components/CustomVideoPlayer.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, 
  Maximize, Minimize, PictureInPicture, 
  Download, ExternalLink, Loader2
} from 'lucide-react';

const CustomVideoPlayer = ({ 
  videoUrl, 
  title = "Video", 
  isStandalone = false, 
  allowDownload = true, 
  showTitle = true 
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // --- HELPER: DETECT PROVIDER & TRANSFORM URLS ---
  const getPlayableUrl = (url) => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
      const idMatch = url.match(/\/d\/(.*?)\//);
      if (idMatch && idMatch[1]) return `https://drive.google.com/uc?export=download&id=${idMatch[1]}`;
    }
    if (url.includes('1drv.ms') || url.includes('onedrive.live.com')) {
      return url.replace('embed', 'download').replace('view', 'download');
    }
    if (url.includes('dropbox.com')) return url.replace('dl=0', 'dl=1');
    return url;
  };

  const getEmbedUrl = (url) => {
     if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = url.includes('youtu.be') ? url.split('/').pop() : url.split('v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
     }
     if (url.includes('vimeo.com')) {
        const videoId = url.split('/').pop();
        return `https://player.vimeo.com/video/${videoId}`;
     }
     return null;
  };

  const directStreamUrl = getPlayableUrl(videoUrl);
  const embedUrl = getEmbedUrl(videoUrl);
  const isEmbed = !!embedUrl;
  const isExternalLink = videoUrl?.startsWith('http') && !videoUrl.includes(window.location.hostname);
  const canDownload = allowDownload && !isExternalLink;

  // --- REMOVED: Progress Tracking Interval ---

  // --- PLAYER EFFECT HOOKS ---
  useEffect(() => {
    if (isEmbed) return;
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
      switch(e.code) {
        case 'Space': case 'k': e.preventDefault(); togglePlay(); break;
        case 'KeyM': toggleMute(); break;
        case 'ArrowRight': skip(10); break;
        case 'ArrowLeft': skip(-10); break;
        case 'KeyF': toggleFullscreen(); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, volume, isEmbed]); 

  useEffect(() => {
    if (isEmbed) return;
    let timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => { if (isPlaying) setShowControls(false); }, 3000); 
    };
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', () => setShowControls(false));
    }
    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', () => setShowControls(false));
      }
      clearTimeout(timeout);
    };
  }, [isPlaying, isEmbed]);

  const handleTimeUpdate = () => setCurrentTime(videoRef.current?.currentTime || 0);
  const handleLoadedMetadata = () => setDuration(videoRef.current?.duration || 0);
  
  const togglePlay = () => {
    if (videoRef.current.paused) { videoRef.current.play(); setIsPlaying(true); } 
    else { videoRef.current.pause(); setIsPlaying(false); }
  };
  const skip = (s) => { if(videoRef.current) videoRef.current.currentTime += s; };
  const toggleMute = () => { const s = !isMuted; setIsMuted(s); if(videoRef.current) videoRef.current.muted = s; };
  const handleVolumeChange = (e) => { const v = parseFloat(e.target.value); setVolume(v); if(videoRef.current) { videoRef.current.volume = v; videoRef.current.muted = (v === 0); } setIsMuted(v === 0); };
  const changeSpeed = (s) => { videoRef.current.playbackRate = s; setPlaybackSpeed(s); setShowSpeedMenu(false); };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current.requestFullscreen) containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const togglePip = async () => {
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await videoRef.current.requestPictureInPicture();
    } catch (e) { console.error(e); }
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const response = await fetch(directStreamUrl);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = title.endsWith('.mp4') ? title : `${title}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed or restricted.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenNewTab = () => {
    const params = new URLSearchParams({
      url: videoUrl,
      title: title,
      allowDownload: canDownload.toString() 
    });
    window.open(`/video-standalone?${params.toString()}`, '_blank');
  };

  const formatTime = (t) => { const m = Math.floor(t / 60); const s = Math.floor(t % 60); return `${m}:${s < 10 ? '0' : ''}${s}`; };

  if (!videoUrl) return <div className="text-white bg-black h-full flex items-center justify-center">No Video Source</div>;

  if (isEmbed) {
    return (
      <div className={`relative bg-black w-full h-full ${isStandalone ? 'w-screen h-screen fixed inset-0 z-50' : 'rounded-xl overflow-hidden'}`}>
        <iframe 
          src={embedUrl} 
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        {!isStandalone && (
           <button onClick={handleOpenNewTab} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-black/80 transition-colors z-10" title="Open in New Tab">
             <ExternalLink className="w-5 h-5"/>
           </button>
        )}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`relative bg-black group overflow-hidden ${
        isStandalone 
          ? 'w-screen h-screen fixed inset-0 z-50' 
          : 'w-full h-full rounded-xl shadow-2xl'
      }`} 
      onDoubleClick={toggleFullscreen}
    >
      <div className="w-full h-full flex items-center justify-center bg-black" onClick={togglePlay}>
        <video 
          ref={videoRef} 
          src={directStreamUrl} 
          className="w-full h-full object-contain" 
          onTimeUpdate={handleTimeUpdate} 
          onLoadedMetadata={handleLoadedMetadata} 
          onEnded={() => setIsPlaying(false)} 
          onError={(e) => console.error("Video Error:", e)}
          crossOrigin="anonymous" 
        />
        
        {showControls && showTitle && (
          <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent z-20 pointer-events-none transition-opacity duration-300">
            <h1 className="text-white text-lg font-bold drop-shadow-md pl-2 tracking-wide">
              {title}
            </h1>
          </div>
        )}

        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/30">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 animate-in zoom-in duration-200">
              <Play className="w-10 h-10 text-white fill-white ml-1"/>
            </div>
          </div>
        )}
      </div>

      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-6 pb-6 pt-16 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        
        <div className="flex items-center gap-4 mb-4 group/timeline cursor-pointer" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); videoRef.current.currentTime = ((e.clientX - r.left) / r.width) * duration; }}>
          <span className="text-xs font-mono text-white/80 w-10 text-right">{formatTime(currentTime)}</span>
          <div className="flex-1 h-1.5 bg-white/20 rounded-full relative overflow-hidden group-hover/timeline:h-2.5 transition-all">
            <div className="absolute top-0 left-0 h-full bg-blue-500 rounded-full" style={{ width: `${(currentTime / duration) * 100}%` }} />
          </div>
          <span className="text-xs font-mono text-white/80 w-10">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">{isPlaying ? <Pause className="w-8 h-8 fill-white"/> : <Play className="w-8 h-8 fill-white"/>}</button>
            <button onClick={() => skip(-10)} className="text-white hover:text-blue-400 flex flex-col items-center group"><RotateCcw className="w-6 h-6"/></button>
            <button onClick={() => skip(10)} className="text-white hover:text-blue-400 flex flex-col items-center group"><div className="transform scale-x-[-1]"><RotateCcw className="w-6 h-6"/></div></button>
            <div className="flex items-center gap-2 group/vol relative">
               <button onClick={toggleMute} className="text-white hover:text-blue-400">{isMuted || volume === 0 ? <VolumeX className="w-6 h-6"/> : <Volume2 className="w-6 h-6"/>}</button>
               <input type="range" min="0" max="1" step="0.1" value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="w-0 overflow-hidden group-hover/vol:w-24 transition-all h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative">
               <button onClick={() => setShowSpeedMenu(!showSpeedMenu)} className="text-white font-bold text-xs bg-white/10 px-2 py-1 rounded hover:bg-white/20 transition-colors min-w-[3rem]">{playbackSpeed}x</button>
               {showSpeedMenu && (
                 <div className="absolute bottom-full right-0 mb-2 bg-black/90 border border-white/10 rounded-lg p-1 min-w-[80px] flex flex-col z-10">
                   {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => (<button key={s} onClick={() => changeSpeed(s)} className={`px-2 py-1 text-sm text-left hover:bg-white/20 rounded ${playbackSpeed === s ? 'text-blue-400 font-bold' : 'text-white'}`}>{s}x</button>))}
                 </div>
               )}
             </div>
             {!isStandalone && (
                <button onClick={togglePip} className="text-white hover:text-blue-400" title="PiP"><PictureInPicture className="w-5 h-5"/></button>
             )}
             {!isStandalone && (
               <button onClick={handleOpenNewTab} className="text-white hover:text-blue-400" title="New Tab"><ExternalLink className="w-5 h-5"/></button>
             )}
             {canDownload && (
                <button onClick={handleDownload} disabled={isDownloading} className={`text-white hover:text-blue-400 transition-colors ${isDownloading ? 'opacity-50 cursor-wait' : ''}`} title="Download">
                  {isDownloading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Download className="w-5 h-5"/>}
                </button>
             )}
             <button onClick={toggleFullscreen} className="text-white hover:text-blue-400">{isFullscreen ? <Minimize className="w-5 h-5"/> : <Maximize className="w-5 h-5"/>}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomVideoPlayer;