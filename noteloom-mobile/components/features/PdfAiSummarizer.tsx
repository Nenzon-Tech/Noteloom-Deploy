import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { Sparkles, X, Loader2 } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { API_BASE } from '../../lib/constants';
import { getSessionToken } from '../../lib/storage';
import { File } from 'expo-file-system';

interface PdfAiSummarizerProps {
  pdfUrl: string;
}

export const PdfAiSummarizer = ({ pdfUrl }: PdfAiSummarizerProps) => {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setSummary('');
    setError('');
    setLoading(false);
  }, [pdfUrl]);

  const handleSummarize = async () => {
    setIsOpen(true);
    if (summary) return;

    setLoading(true);
    setError('');

    try {
      const token = await getSessionToken();
      if (!token) { setError('Session expired. Please login again.'); setLoading(false); return; }

      const pdfFile = new File(pdfUrl);
      const blobBase64 = await pdfFile.text();

      const response = await fetch(`${API_BASE}/api/ai/summarize-file`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: `data:application/pdf;base64,${blobBase64}`,
          taskType: 'summarize',
          filename: 'document.pdf',
        }),
      });

      const data = await response.json();
      if (data.summary) {
        setSummary(data.summary);
      } else if (data.error) {
        setError(data.error);
      } else {
        setError('Could not generate summary.');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error(err);
      setError('Failed to analyze the PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <TouchableOpacity onPress={handleSummarize} style={styles.triggerBtn}>
        <Sparkles size={14} color="white" />
        <Text style={styles.triggerText}>Ask AI</Text>
      </TouchableOpacity>

      <Modal visible={isOpen} animationType="fade" transparent onRequestClose={handleClose}>
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: 'rgba(30,41,59,0.95)', borderColor: 'rgba(99,102,241,0.3)' }]}>
            <View style={[styles.header, { borderBottomColor: 'rgba(99,102,241,0.2)' }]}>
              <View style={styles.headerLeft}>
                <View style={styles.iconBox}>
                  <Sparkles size={16} color="white" />
                </View>
                <Text style={styles.headerTitle}>AI Summary</Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <X size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
              {loading ? (
                <View style={styles.loadingState}>
                  <ActivityIndicator size="large" color="#818cf8" />
                  <Text style={styles.loadingText}>ANALYZING DOCUMENT...</Text>
                </View>
              ) : error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : (
                <Text style={styles.summaryText}>{summary}</Text>
              )}
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: 'rgba(99,102,241,0.2)' }]}>
              <TouchableOpacity onPress={handleClose} style={styles.closeFooterBtn}>
                <Text style={styles.closeFooterText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  triggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  triggerText: { color: 'white', fontSize: 12, fontWeight: '700' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(99,102,241,0.3)',
  },
  headerTitle: { color: '#f3f4f6', fontSize: 15, fontWeight: '700' },
  closeBtn: { padding: 8, borderRadius: 20 },
  content: { flex: 1 },
  contentInner: { padding: 20 },
  loadingState: { alignItems: 'center', paddingVertical: 48, gap: 16 },
  loadingText: { color: '#9ca3af', fontSize: 11, letterSpacing: 2, fontWeight: '600' },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    padding: 16,
    borderRadius: 12,
  },
  errorText: { color: '#fca5a5', fontSize: 14, textAlign: 'center' },
  summaryText: { color: '#e5e7eb', fontSize: 14, lineHeight: 22 },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  closeFooterBtn: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  closeFooterText: { color: 'white', fontSize: 13, fontWeight: '700' },
});

export default PdfAiSummarizer;
