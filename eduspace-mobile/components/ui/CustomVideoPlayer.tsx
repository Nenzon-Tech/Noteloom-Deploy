import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator,
} from 'react-native';
import { Play, RotateCcw, Maximize } from 'lucide-react-native';
import { NativeVideoPlayer } from './NativeVideoPlayer';

interface CustomVideoPlayerProps {
  videoUrl: string;
  title?: string;
  allowDownload?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PLAYER_HEIGHT = (SCREEN_WIDTH * 9) / 16;

const WebViewVideoPlayer = React.lazy(() =>
  import('./WebViewVideoPlayer').then((m) => ({ default: m.WebViewVideoPlayer }))
);

export const CustomVideoPlayer = (props: CustomVideoPlayerProps) => {
  const [useFallback, setUseFallback] = useState(false);

  if (useFallback) {
    return (
      <React.Suspense fallback={<LoadingFallback />}>
        <WebViewVideoPlayer {...props} />
      </React.Suspense>
    );
  }

  return (
    <React.Suspense fallback={<LoadingFallback />}>
      <NativeVideoPlayer {...props} onError={() => setUseFallback(true)} />
    </React.Suspense>
  );
};

const LoadingFallback = () => (
  <View style={[styles.container, { height: PLAYER_HEIGHT }]}>
    <ActivityIndicator size="large" color="#7c3aed" />
    <Text style={styles.loadingText}>Loading player...</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', gap: 12 },
  loadingText: { color: '#9ca3af', fontSize: 13 },
});

export default CustomVideoPlayer;