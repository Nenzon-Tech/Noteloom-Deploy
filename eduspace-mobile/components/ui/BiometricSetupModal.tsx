import React from 'react';
import { View, Text, Modal, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Fingerprint, ShieldCheck, Lock, X } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Gradient } from './Gradient';
import { GradButton } from './GradButton';

interface BiometricSetupModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const BiometricSetupModal = ({ visible, onAccept, onDecline }: BiometricSetupModalProps) => {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDecline}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onDecline} />
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.header}>
            <Gradient colors={['#3b82f6', '#7c3aed']} angle={135} radius={18} style={styles.iconBox}>
              <Fingerprint size={32} color="#fff" />
            </Gradient>
            <Pressable onPress={onDecline} style={[styles.closeBtn, { backgroundColor: theme.surface2 }]}>
              <X size={18} color={theme.muted} />
            </Pressable>
          </View>

          <Text style={[styles.title, { color: theme.fg }]}>Enable Fingerprint Login</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            Log into EduSpace instantly using your device's biometric sensor on every launch.
          </Text>

          <View style={[styles.termsBox, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
            <View style={styles.termsHead}>
              <ShieldCheck size={16} color={theme.violet} />
              <Text style={[styles.termsHeadText, { color: theme.fg }]}>Privacy & Security Notice</Text>
            </View>
            <ScrollView style={styles.termsScroll} showsVerticalScrollIndicator={false}>
              <Text style={[styles.termsText, { color: theme.muted }]}>
                • Your fingerprint data is stored and processed securely by your phone's Android KeyStore system.
                {'\n'}• EduSpace never accesses, transmits, or stores raw biometric measurements on external servers.
                {'\n'}• Authentication is validated locally on your device.
              </Text>
            </ScrollView>
          </View>

          <View style={styles.actions}>
            <GradButton
              fullWidth
              size="lg"
              onPress={onAccept}
              icon={<Lock size={17} color="#fff" />}
            >
              Enable Fingerprint Login
            </GradButton>

            <Pressable onPress={onDecline} style={styles.skipBtn}>
              <Text style={[styles.skipText, { color: theme.muted }]}>Maybe Later</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  card: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: 24,
    paddingBottom: 36,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  iconBox: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
  },
  termsBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 6,
    maxHeight: 120,
  },
  termsHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  termsHeadText: {
    fontSize: 12,
    fontWeight: '700',
  },
  termsScroll: {
    maxHeight: 80,
  },
  termsText: {
    fontSize: 11,
    lineHeight: 17,
  },
  actions: {
    gap: 10,
    marginTop: 8,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BiometricSetupModal;