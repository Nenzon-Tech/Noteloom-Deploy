import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Sparkles, Users, Shield, Mail, Phone, ChevronDown } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useErrorPopup } from '../../contexts/ErrorPopupContext';
import FAQItem from './FAQItem';

const benefits = [
  { icon: Sparkles, label: 'Fast Setup', color: '#8b5cf6' },
  { icon: Users, label: 'Role Access', color: '#2563eb' },
  { icon: Shield, label: 'Secure Deploy', color: '#059669' },
];

const faqs = [
  { question: 'How do I get my college on NoteLoom?', answer: 'Contact our team via the form or email us at support@noteloom.in. We will guide you through the onboarding process.' },
  { question: 'Is NoteLoom free for students?', answer: 'Yes! NoteLoom is completely free for students. Institutions subscribe to provide access to their students.' },
  { question: 'What features are available?', answer: 'AI-powered learning tools, attendance management, examination portal, document vault, analytics, and campus notices.' },
];

export const ContactSection = () => {
  const { isDarkMode } = useTheme();
  const { triggerPopup } = useErrorPopup();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = () => {
    triggerPopup('Contact form is under maintenance. Please email us at support@noteloom.in', 'info');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9' }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.label, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>Get in touch</Text>
          <Text style={[styles.heading, { color: isDarkMode ? 'white' : '#111827' }]}>
            Ready to transform your campus?
          </Text>
          <Text style={[styles.subtext, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>
            Get in touch and we will help you get started.
          </Text>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[styles.formCard, { backgroundColor: isDarkMode ? 'rgba(30,41,59,0.8)' : 'rgba(255,255,255,0.8)', borderColor: isDarkMode ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)' }]}>
            <Text style={[styles.formTitle, { color: isDarkMode ? 'white' : '#111827' }]}>Send us a message</Text>

            <View style={styles.benefitRow}>
              {benefits.map((b) => {
                const Icon = b.icon;
                return (
                  <View key={b.label} style={[styles.benefitPill, { backgroundColor: `${b.color}15`, borderColor: `${b.color}30` }]}>
                    <Icon size={13} color={b.color} />
                    <Text style={[styles.benefitText, { color: isDarkMode ? '#e5e7eb' : '#374151' }]}>{b.label}</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.formFields}>
              <TextInput
                style={[styles.input, { backgroundColor: isDarkMode ? 'rgba(55,65,81,0.5)' : 'rgba(243,244,246,0.8)', color: isDarkMode ? 'white' : '#111827', borderColor: isDarkMode ? 'rgba(75,85,99,0.5)' : 'rgba(209,213,219,0.5)' }]}
                placeholder="Full Name"
                placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
                value={form.name} onChangeText={(t) => setForm({ ...form, name: t })}
              />
              <TextInput
                style={[styles.input, { backgroundColor: isDarkMode ? 'rgba(55,65,81,0.5)' : 'rgba(243,244,246,0.8)', color: isDarkMode ? 'white' : '#111827', borderColor: isDarkMode ? 'rgba(75,85,99,0.5)' : 'rgba(209,213,219,0.5)' }]}
                placeholder="Email" keyboardType="email-address"
                placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
                value={form.email} onChangeText={(t) => setForm({ ...form, email: t })}
              />
              <TextInput
                style={[styles.input, { backgroundColor: isDarkMode ? 'rgba(55,65,81,0.5)' : 'rgba(243,244,246,0.8)', color: isDarkMode ? 'white' : '#111827', borderColor: isDarkMode ? 'rgba(75,85,99,0.5)' : 'rgba(209,213,219,0.5)' }]}
                placeholder="Subject"
                placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
                value={form.subject} onChangeText={(t) => setForm({ ...form, subject: t })}
              />
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: isDarkMode ? 'rgba(55,65,81,0.5)' : 'rgba(243,244,246,0.8)', color: isDarkMode ? 'white' : '#111827', borderColor: isDarkMode ? 'rgba(75,85,99,0.5)' : 'rgba(209,213,219,0.5)' }]}
                placeholder="Message" multiline numberOfLines={4}
                placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
                value={form.message} onChangeText={(t) => setForm({ ...form, message: t })}
              />
              <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
                <Text style={styles.submitText}>Send Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>

        <View style={styles.faqSection}>
          <Text style={[styles.faqTitle, { color: isDarkMode ? 'white' : '#111827' }]}>Frequently Asked Questions</Text>
          {faqs.map((faq) => (
            <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </View>

        <View style={styles.contactLinks}>
          <View style={styles.contactLink}>
            <Mail size={14} color="#7c3aed" />
            <Text style={[styles.contactText, { color: isDarkMode ? '#d1d5db' : '#4b5563' }]}>support@noteloom.in</Text>
          </View>
          <View style={styles.contactLink}>
            <Phone size={14} color="#7c3aed" />
            <Text style={[styles.contactText, { color: isDarkMode ? '#d1d5db' : '#4b5563' }]}>+91 6297432182</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: 48, paddingHorizontal: 16 },
  content: { gap: 24, maxWidth: 500, marginHorizontal: 'auto' },
  header: { gap: 8 },
  label: { fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  heading: { fontSize: 22, fontWeight: '800' },
  subtext: { fontSize: 14, lineHeight: 20 },
  benefitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  benefitPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12, borderWidth: 1,
  },
  benefitText: { fontSize: 12, fontWeight: '600' },
  formCard: { padding: 20, borderRadius: 20, borderWidth: 1, gap: 16 },
  formTitle: { fontSize: 18, fontWeight: '700' },
  formFields: { gap: 10 },
  input: {
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, fontSize: 14,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#7c3aed', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  submitText: { color: 'white', fontSize: 15, fontWeight: '700' },
  faqSection: { gap: 8 },
  faqTitle: { fontSize: 16, fontWeight: '700' },
  contactLinks: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  contactLink: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  contactText: { fontSize: 13 },
});

export default ContactSection;
