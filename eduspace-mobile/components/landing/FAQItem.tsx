import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface FAQItemProps {
  question: string;
  answer: string;
}

export const FAQItem = ({ question, answer }: FAQItemProps) => {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TouchableOpacity
      onPress={() => setIsOpen(!isOpen)}
      style={[styles.container, { borderBottomColor: isDarkMode ? 'rgba(55,65,81,0.5)' : 'rgba(209,213,219,0.5)' }]}
    >
      <View style={styles.questionRow}>
        <Text style={[styles.question, { color: isDarkMode ? '#e5e7eb' : '#374151' }]}>{question}</Text>
        <ChevronDown
          size={16}
          color={isDarkMode ? '#9ca3af' : '#6b7280'}
          style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
        />
      </View>
      {isOpen && (
        <Text style={[styles.answer, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>{answer}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: 16, borderBottomWidth: 1 },
  questionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  question: { fontSize: 14, fontWeight: '600', flex: 1, marginRight: 8 },
  answer: { fontSize: 13, lineHeight: 20, marginTop: 8, opacity: 0.8 },
});

export default FAQItem;
