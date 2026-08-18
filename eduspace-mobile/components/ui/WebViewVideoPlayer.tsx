import React from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

interface Props {
  videoUrl: string;
  title?: string;
  allowDownload?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PLAYER_HEIGHT = (SCREEN_WIDTH * 9) / 16;

export const WebViewVideoPlayer = ({ videoUrl, title }: Props) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #000; display: flex; align-items: center; justify-content: center; height: 100vh; }
        video { width: 100%; max-height: 100vh; outline: none; }
      </style>
    </head>
    <body>
      <video src="${videoUrl}" controls autoplay playsinline>
        Your browser does not support the video tag.
      </video>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        source={{ html }}
        style={styles.webview}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#7c3aed" />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', height: PLAYER_HEIGHT, backgroundColor: 'black' },
  webview: { flex: 1, backgroundColor: 'black' },
  loading: { ...StyleSheet.absoluteFill, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' },
});
