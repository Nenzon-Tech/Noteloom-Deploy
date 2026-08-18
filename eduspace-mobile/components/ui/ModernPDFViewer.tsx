import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, Share, Platform,
  Modal, ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  Download, Maximize, Minimize, Search, X, Loader2,
} from 'lucide-react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../../contexts/ThemeContext';
import PdfAiSummarizer from '../features/PdfAiSummarizer';

interface ModernPDFViewerProps {
  fileUrl: string;
  allowDownload?: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ModernPDFViewer = ({ fileUrl, allowDownload = true }: ModernPDFViewerProps) => {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);

  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isFirstPage = pageNumber <= 1;
  const isLastPage = numPages > 0 && pageNumber >= numPages;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          display: flex; 
          justify-content: center; 
          align-items: flex-start;
          min-height: 100vh;
          background: ${isDarkMode ? '#0f1115' : '#f3f4f6'};
          padding: 16px;
        }
        embed, iframe {
          width: 100%;
          height: 100vh;
          border: none;
          border-radius: 8px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.2);
        }
        .fallback {
          text-align: center;
          padding: 40px 20px;
          color: ${isDarkMode ? '#9ca3af' : '#6b7280'};
          font-family: -apple-system, system-ui, sans-serif;
        }
        .fallback a {
          color: #3b82f6;
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <iframe 
        src="${fileUrl}#page=${pageNumber}&zoom=${scale * 100}"
        width="100%"
        height="100%"
        style="min-height: 100vh;"
      />
      <script>
        function goToPage(p) {
          document.querySelector('iframe').src = '${fileUrl}#page=' + p + '&zoom=${scale * 100}';
        }
      </script>
    </body>
    </html>
  `;

  const handleDownload = async () => {
    if (isDownloading || !fileUrl) return;
    setIsDownloading(true);
    try {
      const filename = fileUrl.split('/').pop() || 'document.pdf';
      const destFile = await File.downloadFileAsync(fileUrl, new File(Paths.cache, filename));
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(destFile.uri);
      }
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({ url: fileUrl, title: 'PDF Document' });
    } catch {}
  };

  const viewerContent = (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0f1115' : '#f3f4f6' }]}>
      <View style={[styles.toolbar, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.8)', borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
        <View style={styles.toolbarLeft}>
          <TouchableOpacity
            onPress={() => setPageNumber(Math.max(1, pageNumber - 1))}
            disabled={isFirstPage}
            style={[styles.toolBtn, isFirstPage && styles.toolBtnDisabled]}
          >
            <ChevronLeft size={18} color={isFirstPage ? '#6b7280' : (isDarkMode ? 'white' : '#111827')} />
          </TouchableOpacity>
          <Text style={[styles.pageIndicator, { color: isDarkMode ? 'white' : '#111827' }]}>
            {pageNumber}{numPages > 0 ? ` / ${numPages}` : ''}
          </Text>
          <TouchableOpacity
            onPress={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
            disabled={isLastPage}
            style={[styles.toolBtn, isLastPage && styles.toolBtnDisabled]}
          >
            <ChevronRight size={18} color={isLastPage ? '#6b7280' : (isDarkMode ? 'white' : '#111827')} />
          </TouchableOpacity>
        </View>

        <View style={styles.toolbarRight}>
          <View style={styles.zoomGroup}>
            <TouchableOpacity onPress={() => setScale(Math.max(0.5, scale - 0.25))} style={styles.toolBtn}>
              <ZoomOut size={16} color={isDarkMode ? 'white' : '#111827'} />
            </TouchableOpacity>
            <Text style={[styles.zoomText, { color: isDarkMode ? 'white' : '#111827' }]}>{Math.round(scale * 100)}%</Text>
            <TouchableOpacity onPress={() => setScale(Math.min(2.5, scale + 0.25))} style={styles.toolBtn}>
              <ZoomIn size={16} color={isDarkMode ? 'white' : '#111827'} />
            </TouchableOpacity>
          </View>

          <PdfAiSummarizer pdfUrl={fileUrl} />

          <View style={[styles.divider, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }]} />

          {allowDownload && (
            <TouchableOpacity onPress={handleDownload} disabled={isDownloading} style={styles.toolBtn}>
              {isDownloading ? <Loader2 size={18} color={isDarkMode ? 'white' : '#111827'} /> : <Download size={18} color={isDarkMode ? 'white' : '#111827'} />}
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => setIsFullscreen(!isFullscreen)} style={[styles.toolBtn, isFullscreen && styles.toolBtnActive]}>
            {isFullscreen ? <Minimize size={18} color={isDarkMode ? 'white' : '#111827'} /> : <Maximize size={18} color={isDarkMode ? 'white' : '#111827'} />}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.webviewContainer}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={[styles.loadingText, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>Loading Document...</Text>
          </View>
        )}
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          style={styles.webview}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          onLoadEnd={() => setIsLoading(false)}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.numPages) setNumPages(data.numPages);
            } catch {}
          }}
        />
      </View>
    </View>
  );

  if (isFullscreen) {
    return (
      <Modal visible={isFullscreen} animationType="fade" transparent>
        <View style={styles.fullscreenContainer}>
          {viewerContent}
        </View>
      </Modal>
    );
  }

  return viewerContent;
};

const styles = StyleSheet.create({
  container: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  toolbarLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toolbarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toolBtn: { padding: 6, borderRadius: 8 },
  toolBtnDisabled: { opacity: 0.4 },
  toolBtnActive: { backgroundColor: 'rgba(59,130,246,0.2)' },
  pageIndicator: { fontSize: 13, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', minWidth: 48, textAlign: 'center' },
  zoomGroup: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  zoomText: { fontSize: 11, fontWeight: '700', minWidth: 36, textAlign: 'center' },
  divider: { width: 1, height: 20, marginHorizontal: 4 },
  webviewContainer: { flex: 1, position: 'relative' },
  webview: { flex: 1, backgroundColor: 'transparent' },
  loadingOverlay: { ...StyleSheet.absoluteFill, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 13, fontWeight: '600' },
  fullscreenContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', paddingTop: 48 },
});

export default ModernPDFViewer;
