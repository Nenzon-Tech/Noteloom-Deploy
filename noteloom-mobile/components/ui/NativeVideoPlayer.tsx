import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar,
} from 'react-native';
import { ResizeMode, Video, Audio } from 'expo-av';
import {
  Play, Pause, RotateCcw, Volume2, VolumeX,
  Maximize, Minimize, Download, Loader2,
} from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';

interface Props {
  videoUrl: string;
  title?: string;
  allowDownload?: boolean;
  onError?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PLAYER_HEIGHT = (SCREEN_WIDTH * 9) / 16;
const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export const NativeVideoPlayer = ({ videoUrl, title = 'Video', allowDownload = true, onError }: Props) => {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<any>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { positionMillis = 0, durationMillis = 0, isBuffering, isMuted } = status;
  const progress = durationMillis ? positionMillis / durationMillis : 0;

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true }).catch(() => {});
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (isPlaying) timeout = setTimeout(() => setShowControls(false), 4000);
    return () => clearTimeout(timeout);
  }, [isPlaying, showControls]);

  const togglePlay = async () => {
    if (!videoRef.current) return;
    if (isPlaying) { await videoRef.current.pauseAsync(); } else { await videoRef.current.playAsync(); }
    setIsPlaying(!isPlaying);
    setShowControls(true);
  };

  const skip = async (seconds: number) => {
    if (!videoRef.current) return;
    const newPos = Math.max(0, Math.min((positionMillis || 0) + seconds * 1000, durationMillis || 0));
    await videoRef.current.setPositionAsync(newPos);
  };

  const onSeek = async (value: number) => {
    if (!videoRef.current || !durationMillis) return;
    await videoRef.current.setPositionAsync(value * durationMillis);
  };

  const changeSpeed = async (speed: number) => {
    if (!videoRef.current) return;
    await videoRef.current.setRateAsync(speed, true);
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  };

  const toggleMute = async () => {
    if (!videoRef.current) return;
    await videoRef.current.setIsMutedAsync(!isMuted);
  };

  const handleDownload = async () => {
    if (isDownloading || !videoUrl) return;
    setIsDownloading(true);
    try {
      const ext = videoUrl.split('.').pop() || 'mp4';
      const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.${ext}`;
      const destFile = await File.downloadFileAsync(videoUrl, new File(Paths.cache, filename));
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(destFile.uri);
    } catch (err) { console.error(err); }
    finally { setIsDownloading(false); }
  };

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    return `${Math.floor(totalSec / 60)}:${(totalSec % 60).toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.wrapper, isFullscreen && StyleSheet.absoluteFill]}>
      {isFullscreen && <StatusBar hidden />}
      <TouchableOpacity activeOpacity={1} onPress={() => setShowControls(!showControls)} style={[styles.playerContainer, isFullscreen && { height: '100%' }]}>
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          onPlaybackStatusUpdate={(s) => { setStatus(s); if ('isPlaying' in s) setIsPlaying(s.isPlaying); }}
          onError={onError}
        />

        {isBuffering && (
          <View style={styles.overlay}><Loader2 size={40} color="white" /></View>
        )}

        {!isPlaying && !isBuffering && (
          <View style={styles.centerPlay}>
            <TouchableOpacity onPress={togglePlay} style={styles.playCircle}>
              <Play size={32} color="white" fill="white" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        )}

        {showControls && (
          <View style={styles.controls}>
            <View style={styles.progressBar} onTouchEnd={(e: any) => { const x = e.nativeEvent?.locationX; if (x) onSeek(x / (SCREEN_WIDTH - 32)); }}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <View style={styles.bottomRow}>
              <View style={styles.left}>
                <TouchableOpacity onPress={togglePlay} style={styles.btn}>{isPlaying ? <Pause size={22} color="white" fill="white" /> : <Play size={22} color="white" fill="white" />}</TouchableOpacity>
                <TouchableOpacity onPress={() => skip(-10)} style={styles.btn}><RotateCcw size={18} color="white" /></TouchableOpacity>
                <TouchableOpacity onPress={() => skip(10)} style={styles.btn}><View style={{ transform: [{ scaleX: -1 }] }}><RotateCcw size={18} color="white" /></View></TouchableOpacity>
                <TouchableOpacity onPress={toggleMute} style={styles.btn}>{isMuted ? <VolumeX size={18} color="white" /> : <Volume2 size={18} color="white" />}</TouchableOpacity>
                <Text style={styles.time}>{formatTime(positionMillis)} / {formatTime(durationMillis)}</Text>
              </View>
              <View style={styles.right}>
                <TouchableOpacity onPress={() => setShowSpeedMenu(!showSpeedMenu)} style={styles.speedBtn}><Text style={styles.speedText}>{playbackSpeed}x</Text></TouchableOpacity>
                {showSpeedMenu && (
                  <View style={styles.speedMenu}>
                    {SPEED_OPTIONS.map((s) => (
                      <TouchableOpacity key={s} onPress={() => changeSpeed(s)} style={[styles.speedOption, playbackSpeed === s && styles.speedActive]}>
                        <Text style={[styles.speedOptionText, playbackSpeed === s && { color: '#60a5fa', fontWeight: '700' }]}>{s}x</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                {allowDownload && (
                  <TouchableOpacity onPress={handleDownload} disabled={isDownloading} style={styles.btn}>
                    {isDownloading ? <Loader2 size={18} color="white" /> : <Download size={18} color="white" />}
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setIsFullscreen(!isFullscreen)} style={styles.btn}>
                  {isFullscreen ? <Minimize size={18} color="white" /> : <Maximize size={18} color="white" />}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
  playerContainer: { width: '100%', height: PLAYER_HEIGHT, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  video: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFill, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  centerPlay: { ...StyleSheet.absoluteFill, justifyContent: 'center', alignItems: 'center' },
  playCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  controls: { ...StyleSheet.absoluteFill, justifyContent: 'flex-end', paddingHorizontal: 12, paddingBottom: 12, paddingTop: 48 },
  progressBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, marginBottom: 8, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#3b82f6', borderRadius: 2 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btn: { padding: 6 },
  time: { color: 'white', fontSize: 11, fontFamily: 'monospace' },
  speedBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  speedText: { color: 'white', fontSize: 11, fontWeight: '700' },
  speedMenu: { position: 'absolute', bottom: 36, right: 0, backgroundColor: 'rgba(0,0,0,0.9)', borderRadius: 8, padding: 4, minWidth: 60, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  speedOption: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  speedActive: { backgroundColor: 'rgba(59,130,246,0.3)' },
  speedOptionText: { color: 'white', fontSize: 12, textAlign: 'center' },
});
